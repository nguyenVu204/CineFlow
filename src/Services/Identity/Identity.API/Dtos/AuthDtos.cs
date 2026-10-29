using System.ComponentModel.DataAnnotations;

namespace Identity.API.Dtos;

public sealed record RegisterRequest(
    [param: Required, EmailAddress, StringLength(256)] string Email,
    [param: Required, StringLength(128, MinimumLength = 6)] string Password,
    [param: Required, StringLength(100, MinimumLength = 1)] string DisplayName,
    string? PhoneNumber = null);

public sealed record LoginRequest(
    [param: Required, EmailAddress, StringLength(256)] string Email,
    [param: Required, StringLength(128)] string Password);

public sealed record UpdateUserRolesRequest(IReadOnlyCollection<string> Roles);

public sealed record UpdateUserStatusRequest(
    [param: Required] string Status);

public sealed record AddPointsRequest(
    [param: Required, Range(1, 1000000)] int Points);

public sealed record AdminCreateUserRequest(
    [param: Required, EmailAddress, StringLength(256)] string Email,
    [param: Required, StringLength(128, MinimumLength = 6)] string Password,
    [param: Required, StringLength(100, MinimumLength = 1)] string DisplayName,
    string? PhoneNumber = null,
    string? Role = null,
    int? Points = null);

public sealed record AdminUpdateUserRequest(
    [param: Required, StringLength(100, MinimumLength = 1)] string DisplayName,
    string? PhoneNumber = null,
    string? Role = null,
    int? Points = null);

public sealed record UserResponse(
    string Id,
    string Email,
    string DisplayName,
    string? PhoneNumber,
    IReadOnlyCollection<string> Roles,
    int Points,
    string Status,
    DateTime JoinedAt);

public sealed record AuthResponse(
    string AccessToken,
    string TokenType,
    DateTime ExpiresAt,
    UserResponse User);
