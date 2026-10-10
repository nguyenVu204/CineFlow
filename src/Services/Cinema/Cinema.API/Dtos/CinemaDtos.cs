using Cinema.API.Models;

namespace Cinema.API.Dtos;

public record CinemaRequest(string Name, string Address, string Description);

public record ScreenRequest(int CinemaId, string Name);

public record SeatRequest(
    int ScreenId,
    string Row,
    string Column,
    string SeatNumber,
    SeatType SeatType);

public record ShowtimeRequest(
    int MovieId,
    int ScreenId,
    DateTime StartTime,
    DateTime EndTime,
    decimal BasePrice,
    ShowtimeStatus Status);

public record InitializeBookingSeatsRequest(
    IReadOnlyCollection<int> SeatIds,
    decimal Price);
