using Identity.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Data;

public static class IdentityDbInitializer
{
    public static async Task InitializeAsync(
        IServiceProvider services,
        IConfiguration configuration,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        await database.Database.EnsureCreatedAsync(cancellationToken);

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var roles = new[] { "Customer", "Admin", "Staff", "VIP" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(role));
                EnsureSucceeded(result, $"Could not create role '{role}'.");
            }
        }

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Seed Admin user
        var adminEmail = configuration["BootstrapAdmin:Email"] ?? "admin@cineverse.vn";
        var adminPassword = configuration["BootstrapAdmin:Password"] ?? "Admin@123456";

        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                DisplayName = "Quản trị viên CINEVERSE",
                PhoneNumber = "0901234567",
                EmailConfirmed = true,
                Points = 9999,
                JoinedAt = DateTime.UtcNow.AddMonths(-6)
            };
            var createResult = await userManager.CreateAsync(admin, adminPassword);
            EnsureSucceeded(createResult, "Could not create the bootstrap administrator.");
        }

        if (!await userManager.IsInRoleAsync(admin, "Admin"))
        {
            var roleResult = await userManager.AddToRoleAsync(admin, "Admin");
            EnsureSucceeded(roleResult, "Could not grant the bootstrap administrator role.");
        }

        // Seed Staff user (for Ticket Check-in testing)
        var staffEmail = "staff@cineverse.vn";
        var staff = await userManager.FindByEmailAsync(staffEmail);
        if (staff is null)
        {
            staff = new ApplicationUser
            {
                UserName = staffEmail,
                Email = staffEmail,
                DisplayName = "Nguyễn Văn Soát Vé",
                PhoneNumber = "0912345678",
                EmailConfirmed = true,
                Points = 2500,
                JoinedAt = DateTime.UtcNow.AddMonths(-3)
            };
            var createStaff = await userManager.CreateAsync(staff, "Staff@123456");
            if (createStaff.Succeeded)
            {
                await userManager.AddToRoleAsync(staff, "Staff");
            }
        }

        // Seed Demo VIP Customer
        var vipEmail = "customer@cineverse.vn";
        var vipCustomer = await userManager.FindByEmailAsync(vipEmail);
        if (vipCustomer is null)
        {
            vipCustomer = new ApplicationUser
            {
                UserName = vipEmail,
                Email = vipEmail,
                DisplayName = "Trần Thị Mai Phương",
                PhoneNumber = "0987654321",
                EmailConfirmed = true,
                Points = 3450,
                JoinedAt = DateTime.UtcNow.AddMonths(-2)
            };
            var createVip = await userManager.CreateAsync(vipCustomer, "User@123456");
            if (createVip.Succeeded)
            {
                await userManager.AddToRoleAsync(vipCustomer, "Customer");
            }
        }
    }

    private static void EnsureSucceeded(IdentityResult result, string message)
    {
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(error => error.Description));
            throw new InvalidOperationException($"{message} {errors}");
        }
    }
}
