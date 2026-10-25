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
    SignInManager<ApplicationUser> signInManager,
    JwtTokenService tokenService) : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.Ordinal)
    {
        "Customer",
        "Admin"
    };

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            DisplayName = request.DisplayName.Trim()
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

        var signInResult = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true);
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
        return Ok(new UserResponse(user.Id, user.Email ?? string.Empty, user.DisplayName, roles.ToArray()));
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
            responses.Add(new UserResponse(user.Id, user.Email ?? string.Empty, user.DisplayName, roles.ToArray()));
        }

        return Ok(responses);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{userId}/roles")]
    public async Task<IActionResult> UpdateRoles(string userId, UpdateUserRolesRequest request)
    {
        if (request.Roles is null ||
            request.Roles.Count == 0 ||
            request.Roles.Any(role => !AllowedRoles.Contains(role)) ||
            request.Roles.Distinct(StringComparer.Ordinal).Count() != request.Roles.Count)
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
}
