namespace Booking.API.Models;

public enum ShowtimeSeatStatus
{
    Available = 0,
    Held = 1,
    Booked = 2,
    Maintenance = 3
}

public enum BookingStatus
{
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2,
    Expired = 3,
    CheckedIn = 4
}

public class ShowtimeSeat
{
    public int Id { get; set; }
    public int ShowtimeId { get; set; }
    public int SeatId { get; set; }
    public ShowtimeSeatStatus Status { get; set; } = ShowtimeSeatStatus.Available;
    public decimal Price { get; set; }
    public string? HoldToken { get; set; }
    public string? HeldByUserId { get; set; }
    public DateTime? HoldExpiresAt { get; set; }
    public int? BookingId { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}

public class Booking
{
    public int Id { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int ShowtimeId { get; set; }
    public decimal TotalAmount { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string? HoldToken { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string PromoCode { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public ICollection<BookingItem> Items { get; set; } = new List<BookingItem>();
    public ICollection<BookingConcessionItem> Concessions { get; set; } = new List<BookingConcessionItem>();
}

public class BookingItem
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int SeatId { get; set; }
    public string SeatNumber { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public Booking Booking { get; set; } = null!;
}

public class BookingConcessionItem
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int ConcessionId { get; set; }
    public string ConcessionName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public Booking Booking { get; set; } = null!;
}

public class Concession
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Icon { get; set; } = "fa-popcorn";
    public string ImageUrl { get; set; } = string.Empty;
    public bool InStock { get; set; } = true;
}

public class Promotion
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "fixed"; // "fixed" or "percent"
    public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PaymentTransaction
{
    public int Id { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public int BookingId { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending"; // "Pending", "Completed", "Failed"
    public string PaymentUrl { get; set; } = string.Empty;
    public string QrCodeUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
}

public class IdempotencyRecord
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string RequestHash { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class OutboxMessage
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
}
