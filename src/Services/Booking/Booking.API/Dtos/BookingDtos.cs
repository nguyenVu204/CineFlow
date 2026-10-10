namespace Booking.API.Dtos;

public record HoldSeatRequest(int ShowtimeId, List<int> SeatIds, string UserId);

public record ConfirmBookingRequest(string? IdempotencyKey);

public record BookingResponse(int BookingId, string BookingCode, string Status, decimal TotalAmount, DateTime ExpiresAt);

public record BookingItemResponse(int SeatId, string SeatNumber, decimal Price);

public record BookingDetailsResponse(
    int Id,
    string BookingCode,
    string UserId,
    int ShowtimeId,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    IReadOnlyCollection<BookingItemResponse> Items);

public record SeatAvailabilityResponse(
    int SeatId,
    string Status,
    decimal Price,
    DateTime? HoldExpiresAt);

public record InitializeShowtimeSeatsRequest(
    IReadOnlyCollection<int> SeatIds,
    decimal Price);
