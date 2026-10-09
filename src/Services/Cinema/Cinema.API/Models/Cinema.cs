namespace Cinema.API.Models;

public class Cinema
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Screen> Screens { get; set; } = new List<Screen>();
}

public class Screen
{
    public int Id { get; set; }
    public int CinemaId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Cinema Cinema { get; set; } = null!;
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}

public class Seat
{
    public int Id { get; set; }
    public int ScreenId { get; set; }
    public string Row { get; set; } = string.Empty;
    public string Column { get; set; } = string.Empty;
    public string SeatNumber { get; set; } = string.Empty;
    public SeatType SeatType { get; set; }
    public Screen Screen { get; set; } = null!;
}

public enum SeatType
{
    Regular,
    VIP,
    Couple
}

public class Showtime
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public int ScreenId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal BasePrice { get; set; }
    public ShowtimeStatus Status { get; set; }
    public Screen Screen { get; set; } = null!;
}

public enum ShowtimeStatus
{
    Scheduled,
    Started,
    Completed,
    Cancelled
}
