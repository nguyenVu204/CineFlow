using Microsoft.AspNetCore.Identity;

namespace Identity.API.Models;

public sealed class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
    public int Points { get; set; } = 0;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
