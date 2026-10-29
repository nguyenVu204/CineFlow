using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Identity.API.Dtos;
using Identity.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Identity.API.Services;

public sealed class JwtTokenService(
    IConfiguration configuration,
    UserManager<ApplicationUser> userManager)
{
    public async Task<AuthResponse> CreateTokenAsync(ApplicationUser user)
    {
        var key = configuration["Jwt:SigningKey"]
            ?? throw new InvalidOperationException("Jwt:SigningKey is not configured.");
        var issuer = configuration["Jwt:Issuer"] ?? "CineFlow.Identity";
        var audience = configuration["Jwt:Audience"] ?? "CineFlow.Api";
        var lifetimeMinutes = configuration.GetValue("Jwt:LifetimeMinutes", 60);
        var expiresAt = DateTime.UtcNow.AddMinutes(lifetimeMinutes);
        var roles = await userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.UniqueName, user.DisplayName)
        };
        claims.AddRange(roles.Select(role => new Claim("role", role)));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        var isLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;
        var userResponse = new UserResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.DisplayName,
            user.PhoneNumber,
            roles.ToArray(),
            user.Points,
            isLocked ? "locked" : "active",
            user.JoinedAt);

        return new AuthResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            "Bearer",
            expiresAt,
            userResponse);
    }
}
