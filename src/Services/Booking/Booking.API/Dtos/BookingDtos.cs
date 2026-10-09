namespace Booking.API.Dtos;

public record HoldSeatRequest(int ShowtimeId, List<int> SeatIds, string UserId);

public record ConfirmBookingRequest(string? IdempotencyKey);

public record BookingResponse(int BookingId, string BookingCode, string Status, decimal TotalAmount, DateTime ExpiresAt);
