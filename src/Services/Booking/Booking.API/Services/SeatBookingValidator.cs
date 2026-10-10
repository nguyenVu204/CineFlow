using Booking.API.Models;

namespace Booking.API.Services;

public static class SeatBookingValidator
{
    public static bool CanHold(ShowtimeSeatStatus status)
    {
        return status == ShowtimeSeatStatus.Available;
    }

    public static bool HasExpired(DateTime? holdExpiresAt)
    {
        return holdExpiresAt.HasValue && holdExpiresAt.Value <= DateTime.UtcNow;
    }

    public static string GenerateBookingCode()
    {
        return $"BOOK-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
    }
}
