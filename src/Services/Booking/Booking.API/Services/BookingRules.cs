using System.Security.Cryptography;
using System.Text;
using Booking.API.Dtos;
using Booking.API.Models;

namespace Booking.API.Services;

public static class BookingRules
{
    public static string? ValidateHoldRequest(HoldSeatRequest request)
    {
        if (request.ShowtimeId <= 0)
        {
            return "ShowtimeId must be greater than zero.";
        }

        if (request.SeatIds is null || request.SeatIds.Count == 0)
        {
            return "At least one seat is required.";
        }

        if (request.SeatIds.Any(seatId => seatId <= 0))
        {
            return "SeatIds must contain only positive values.";
        }

        return null;
    }

    public static string CreateConfirmRequestHash(int bookingId, string userId)
    {
        var request = $"{bookingId}:{userId}";
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request)));
    }

    public static bool CanCancel(BookingStatus status)
    {
        return status is BookingStatus.Pending or BookingStatus.Confirmed;
    }
}
