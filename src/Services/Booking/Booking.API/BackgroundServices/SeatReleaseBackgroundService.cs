using Booking.API.Data;
using Booking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Booking.API.BackgroundServices;

public class SeatReleaseBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SeatReleaseBackgroundService> _logger;

    public SeatReleaseBackgroundService(IServiceScopeFactory scopeFactory, ILogger<SeatReleaseBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<BookingDbContext>();

                var expiredSeats = await context.ShowtimeSeats
                    .Where(x => x.Status == ShowtimeSeatStatus.Held && x.HoldExpiresAt != null && x.HoldExpiresAt < DateTime.UtcNow)
                    .ToListAsync(stoppingToken);

                foreach (var seat in expiredSeats)
                {
                    seat.Status = ShowtimeSeatStatus.Available;
                    seat.HoldToken = null;
                    seat.HeldByUserId = null;
                    seat.HoldExpiresAt = null;
                    seat.BookingId = null;
                }

                if (expiredSeats.Count > 0)
                {
                    await context.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Released {Count} expired seat holds.", expiredSeats.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while releasing expired seat holds.");
            }

            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}
