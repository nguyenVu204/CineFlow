using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Identity.API.Data;
using Identity.API.Dtos;
using Identity.API.Models;
using Identity.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IdentityDbContext database,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    SignInManager<ApplicationUser> signInManager,
    JwtTokenService tokenService) : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Customer",
        "Admin",
        "Staff",
        "VIP"
    };

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            DisplayName = request.DisplayName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Points = 500,
            JoinedAt = DateTime.UtcNow
        };
        await using var transaction = await database.Database.BeginTransactionAsync();
        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Account registration failed.",
                errors = createResult.Errors.Select(error => new { error.Code, error.Description })
            });
        }

        var roleResult = await userManager.AddToRoleAsync(user, "Customer");
        if (!roleResult.Succeeded)
        {
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "Could not assign the default account role.");
        }

        await transaction.CommitAsync();
        return Ok(await tokenService.CreateTokenAsync(user));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null)
        {
            return Unauthorized(new { message = "Email or password is incorrect." });
        }

        var isLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;
        if (isLocked)
        {
            return Unauthorized(new { message = "Tài khoản của bạn đã bị khóa bởi Quản trị viên." });
        }

        var signInResult = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: false);
        if (!signInResult.Succeeded)
        {
            return Unauthorized(new { message = "Email or password is incorrect." });
        }

        return Ok(await tokenService.CreateTokenAsync(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> GetCurrentUser()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await userManager.GetRolesAsync(user);
        return Ok(ToUserResponse(user, roles));
    }

    [Authorize]
    [HttpPost("me/points")]
    public async Task<ActionResult<UserResponse>> AddMyPoints([FromBody] AddPointsRequest request)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Unauthorized();
        }

        user.Points += request.Points;
        await userManager.UpdateAsync(user);

        var roles = await userManager.GetRolesAsync(user);
        return Ok(ToUserResponse(user, roles));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyCollection<UserResponse>>> GetUsers()
    {
        var users = await userManager.Users
            .AsNoTracking()
            .OrderBy(user => user.Email)
            .Take(500)
            .ToListAsync();
        var responses = new List<UserResponse>(users.Count);
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            responses.Add(ToUserResponse(user, roles));
        }

        return Ok(responses);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("users")]
    public async Task<ActionResult<UserResponse>> AdminCreateUser([FromBody] AdminCreateUserRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            DisplayName = request.DisplayName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Points = request.Points ?? 500,
            JoinedAt = DateTime.UtcNow
        };

        var role = string.IsNullOrWhiteSpace(request.Role) ? "Customer" : request.Role.Trim();
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Could not create user.",
                errors = createResult.Errors.Select(e => new { e.Code, e.Description })
            });
        }

        await userManager.AddToRoleAsync(user, role);
        var roles = await userManager.GetRolesAsync(user);
        return Ok(ToUserResponse(user, roles));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{userId}")]
    public async Task<ActionResult<UserResponse>> AdminUpdateUser(string userId, [FromBody] AdminUpdateUserRequest request)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        user.DisplayName = request.DisplayName.Trim();
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber.Trim();
        if (request.Points.HasValue) user.Points = request.Points.Value;

        await userManager.UpdateAsync(user);

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var role = request.Role.Trim();
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
            var currentRoles = await userManager.GetRolesAsync(user);
            await userManager.RemoveFromRolesAsync(user, currentRoles);
            await userManager.AddToRoleAsync(user, role);
        }

        var roles = await userManager.GetRolesAsync(user);
        return Ok(ToUserResponse(user, roles));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{userId}/status")]
    public async Task<IActionResult> UpdateUserStatus(string userId, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        var status = request.Status?.Trim().ToLowerInvariant();
        if (status == "locked")
        {
            await userManager.SetLockoutEnabledAsync(user, true);
            await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
        }
        else if (status == "active")
        {
            await userManager.SetLockoutEndDateAsync(user, null);
        }
        else
        {
            return BadRequest(new { message = "Status must be 'active' or 'locked'." });
        }

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("users/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return Problem(title: "Could not delete user.");
        }

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{userId}/roles")]
    public async Task<IActionResult> UpdateRoles(string userId, UpdateUserRolesRequest request)
    {
        if (request.Roles is null ||
            request.Roles.Count == 0 ||
            request.Roles.Any(role => !AllowedRoles.Contains(role)) ||
            request.Roles.Distinct(StringComparer.OrdinalIgnoreCase).Count() != request.Roles.Count)
        {
            return BadRequest(new { message = "Roles must contain one or more distinct supported roles." });
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        var currentRoles = await userManager.GetRolesAsync(user);
        await using var transaction = await database.Database.BeginTransactionAsync();
        var removeResult = await userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded)
        {
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "Could not update the user's roles.");
        }

        var addResult = await userManager.AddToRolesAsync(user, request.Roles);
        if (!addResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Could not update the user's roles.",
                errors = addResult.Errors.Select(error => new { error.Code, error.Description })
            });
        }

        await transaction.CommitAsync();
        return NoContent();
    }

    private static UserResponse ToUserResponse(ApplicationUser user, IList<string> roles)
    {
        var isLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;
        return new UserResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.DisplayName,
            user.PhoneNumber,
            roles.ToArray(),
            user.Points,
            isLocked ? "locked" : "active",
            user.JoinedAt);
    }
}
