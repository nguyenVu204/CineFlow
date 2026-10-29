namespace Booking.API.Dtos;

public record HoldConcessionRequest(int ConcessionId, int Quantity);

public record HoldSeatRequest(
    int ShowtimeId,
    List<int> SeatIds,
    List<HoldConcessionRequest>? Concessions = null,
    string? CustomerName = null,
    string? CustomerPhone = null,
    string? PaymentMethod = null,
    string? PromoCode = null,
    decimal DiscountAmount = 0);

public record ConfirmBookingRequest(string? IdempotencyKey);

public record BookingResponse(int BookingId, string BookingCode, string Status, decimal TotalAmount, DateTime ExpiresAt);

public record BookingItemResponse(int SeatId, string SeatNumber, decimal Price);

public record BookingConcessionResponse(int ConcessionId, string Name, int Quantity, decimal UnitPrice);

public record BookingDetailsResponse(
    int Id,
    string BookingCode,
    string UserId,
    int ShowtimeId,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    IReadOnlyCollection<BookingItemResponse> Items,
    IReadOnlyCollection<BookingConcessionResponse> Concessions,
    string CustomerName = "",
    string CustomerPhone = "",
    string PaymentMethod = "",
    string PromoCode = "",
    decimal DiscountAmount = 0,
    DateTime? CheckedInAt = null);

public record SeatAvailabilityResponse(
    int SeatId,
    string Status,
    decimal Price,
    DateTime? HoldExpiresAt,
    string SeatNumber = "");

public record InitializeShowtimeSeatsRequest(
    IReadOnlyCollection<int> SeatIds,
    decimal Price);

// Check-in
public record CheckInTicketRequest(string TicketCode);

public record CheckInTicketResponse(
    bool Success,
    string BookingCode,
    DateTime? CheckedInAt,
    string CustomerName,
    string CustomerPhone,
    IReadOnlyCollection<string> SeatNumbers,
    string Message);

// Seat Maintenance
public record SeatMaintenanceRequest(bool IsMaintenance);

// Concession (F&B)
public record ConcessionRequest(
    string Name,
    string Description,
    decimal Price,
    string? Icon,
    string? ImageUrl,
    bool InStock = true);

public record ConcessionResponse(
    int Id,
    string Name,
    string Description,
    decimal Price,
    string Icon,
    string ImageUrl,
    bool InStock);

// Promotion (Voucher)
public record PromotionRequest(
    string Code,
    string Title,
    string DiscountType,
    decimal DiscountValue,
    decimal MinOrderValue = 0,
    bool IsActive = true);

public record ValidatePromotionRequest(
    string Code,
    decimal OrderTotal,
    string? UserId = null);

public record ValidatePromotionResponse(
    bool Valid,
    string Code,
    string DiscountType,
    decimal DiscountValue,
    decimal DiscountAmount,
    string Message);

// Payment Gateway
public record CreatePaymentRequest(
    int BookingId,
    string PaymentMethod,
    string? ReturnUrl = null);

public record PaymentResponse(
    string TransactionId,
    int BookingId,
    string PaymentMethod,
    decimal Amount,
    string PaymentUrl,
    string QrCodeUrl,
    DateTime ExpiresAt,
    string Status);
