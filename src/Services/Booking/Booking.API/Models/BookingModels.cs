namespace Booking.API.Models;

public enum ShowtimeSeatStatus
{
    Available,
    Held,
    Booked
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Expired
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
    public ICollection<BookingItem> Items { get; set; } = new List<BookingItem>();
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
