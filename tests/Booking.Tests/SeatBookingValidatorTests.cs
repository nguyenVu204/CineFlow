using Booking.API.Models;
using Booking.API.Services;
using Booking.API.Dtos;
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

    [Fact]
    public void ValidateHoldRequest_ShouldRejectInvalidSeatIds()
    {
        var request = new HoldSeatRequest(1, [1, 0]);

        Assert.Equal("SeatIds must contain only positive values.", BookingRules.ValidateHoldRequest(request));
    }

    [Fact]
    public void ValidateHoldRequest_ShouldAcceptValidRequest()
    {
        var request = new HoldSeatRequest(1, [1, 2]);

        Assert.Null(BookingRules.ValidateHoldRequest(request));
    }

    [Fact]
    public void CreateConfirmRequestHash_ShouldBeStableAndBoundToBookingAndUser()
    {
        var hash = BookingRules.CreateConfirmRequestHash(10, "customer-1");

        Assert.Equal(hash, BookingRules.CreateConfirmRequestHash(10, "customer-1"));
        Assert.NotEqual(hash, BookingRules.CreateConfirmRequestHash(11, "customer-1"));
        Assert.NotEqual(hash, BookingRules.CreateConfirmRequestHash(10, "customer-2"));
    }

    [Theory]
    [InlineData(BookingStatus.Pending, true)]
    [InlineData(BookingStatus.Confirmed, true)]
    [InlineData(BookingStatus.Cancelled, false)]
    [InlineData(BookingStatus.Expired, false)]
    public void CanCancel_ShouldOnlyAllowPendingOrConfirmedBookings(BookingStatus status, bool expected)
    {
        Assert.Equal(expected, BookingRules.CanCancel(status));
    }
}
