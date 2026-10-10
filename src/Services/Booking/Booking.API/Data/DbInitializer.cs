using BookingEntity = Booking.API.Models.Booking;
using BookingStatus = Booking.API.Models.BookingStatus;
using ShowtimeSeatEntity = Booking.API.Models.ShowtimeSeat;
using ShowtimeSeatStatusEnum = Booking.API.Models.ShowtimeSeatStatus;

namespace Booking.API.Data;

public static class DbInitializer
{
    public static void Seed(BookingDbContext context)
    {
        context.Database.EnsureCreated();

        var existingSeats = context.ShowtimeSeats
            .Select(x => new { x.ShowtimeId, x.SeatId })
            .ToList()
            .Select(x => (x.ShowtimeId, x.SeatId))
            .ToHashSet();
        var seedSeats = new List<ShowtimeSeatEntity>();

        for (var showtimeId = 1; showtimeId <= 12; showtimeId++)
        {
            var screenSeatOffset = ((showtimeId - 1) / 3) * 20;
            for (var seatNumber = 1; seatNumber <= 20; seatNumber++)
            {
                var seatId = screenSeatOffset + seatNumber;
                if (existingSeats.Contains((showtimeId, seatId)))
                {
                    continue;
                }

                seedSeats.Add(new ShowtimeSeatEntity
                {
                    ShowtimeId = showtimeId,
                    SeatId = seatId,
                    Status = ShowtimeSeatStatusEnum.Available,
                    Price = 120000m,
                    HoldExpiresAt = null,
                    BookingId = null,
                    HoldToken = null,
                    HeldByUserId = null
                });
            }
        }

        context.ShowtimeSeats.AddRange(seedSeats);
        context.SaveChanges();
    }
}
