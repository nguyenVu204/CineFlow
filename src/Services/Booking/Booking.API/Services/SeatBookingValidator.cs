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

    public static string GetSeatCode(int seatId)
    {
        var num = ((seatId - 1) % 75) + 1;
        if (num <= 70)
        {
            var rowIdx = (num - 1) / 10;
            var col = ((num - 1) % 10) + 1;
            var rows = new[] { "A", "B", "C", "D", "E", "F", "G" };
            return $"{rows[rowIdx]}{col}";
        }
        else
        {
            return $"H{num - 70}";
        }
    }
}
