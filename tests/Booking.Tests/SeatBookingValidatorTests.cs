using Booking.API.Models;
using Booking.API.Services;
using Xunit;

namespace Booking.Tests;

public class SeatBookingValidatorTests
{
    [Fact]
    public void CanHold_ShouldAllowOnlyAvailableSeats()
    {
        Assert.True(SeatBookingValidator.CanHold(ShowtimeSeatStatus.Available));
        Assert.False(SeatBookingValidator.CanHold(ShowtimeSeatStatus.Held));
        Assert.False(SeatBookingValidator.CanHold(ShowtimeSeatStatus.Booked));
    }

    [Fact]
    public void HasExpired_ShouldBeTrue_WhenHoldIsPastExpiry()
    {
        var expiredAt = DateTime.UtcNow.AddMinutes(-1);
        Assert.True(SeatBookingValidator.HasExpired(expiredAt));
    }

    [Fact]
    public void GenerateBookingCode_ShouldReturnBookCodeWithPattern()
    {
        var bookingCode = SeatBookingValidator.GenerateBookingCode();
        Assert.StartsWith("BOOK-", bookingCode);
        Assert.True(bookingCode.Length >= 20);
    }
}
