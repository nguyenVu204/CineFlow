using Booking.API.Data;
using Booking.API.Models;
using Microsoft.EntityFrameworkCore;
using BookingStatus = Booking.API.Models.BookingStatus;

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
                var now = DateTime.UtcNow;

                var expiredSeats = await context.ShowtimeSeats
                    .Where(x => x.Status == ShowtimeSeatStatus.Held && x.HoldExpiresAt <= now)
                    .ToListAsync(stoppingToken);

                if (expiredSeats.Count > 0)
                {
                    await using var transaction = await context.Database.BeginTransactionAsync(stoppingToken);
                    var bookingIds = expiredSeats
                        .Where(x => x.BookingId.HasValue)
                        .Select(x => x.BookingId!.Value)
                        .Distinct()
                        .ToList();
                    var expiredBookings = await context.Bookings
                        .Where(x => bookingIds.Contains(x.Id) &&
                                    x.Status == BookingStatus.Pending &&
                                    x.ExpiresAt <= now)
                        .ToListAsync(stoppingToken);

                    foreach (var booking in expiredBookings)
                    {
                        booking.Status = BookingStatus.Expired;
                        context.OutboxMessages.Add(new OutboxMessage
                        {
                            Type = "SeatReleased",
                            Payload = System.Text.Json.JsonSerializer.Serialize(new
                            {
                                bookingId = booking.Id,
                                bookingCode = booking.BookingCode,
                                releasedAt = now,
                                reason = "expired"
                            }),
                            CreatedAt = now
                        });
                    }

                    foreach (var seat in expiredSeats)
                    {
                        seat.Status = ShowtimeSeatStatus.Available;
                        seat.HoldToken = null;
                        seat.HeldByUserId = null;
                        seat.HoldExpiresAt = null;
                        seat.BookingId = null;
                    }

                    await context.SaveChangesAsync(stoppingToken);
                    await transaction.CommitAsync(stoppingToken);
                    _logger.LogInformation("Released {Count} expired seat holds.", expiredSeats.Count);
                }
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogInformation(ex, "Seat state changed while expiring holds; another operation won the race.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while releasing expired seat holds.");
            }

            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}
