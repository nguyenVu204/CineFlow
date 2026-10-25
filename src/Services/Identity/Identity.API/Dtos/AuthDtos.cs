using System.ComponentModel.DataAnnotations;

namespace Identity.API.Dtos;

public sealed record RegisterRequest(
    [param: Required, EmailAddress, StringLength(256)] string Email,
    [param: Required, StringLength(128, MinimumLength = 8)] string Password,
    [param: Required, StringLength(100, MinimumLength = 1)] string DisplayName);

public sealed record LoginRequest(
    [param: Required, EmailAddress, StringLength(256)] string Email,
    [param: Required, StringLength(128)] string Password);

public sealed record UpdateUserRolesRequest(IReadOnlyCollection<string> Roles);

public sealed record UserResponse(string Id, string Email, string DisplayName, IReadOnlyCollection<string> Roles);

public sealed record AuthResponse(string AccessToken, string TokenType, DateTime ExpiresAt, UserResponse User);
