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

        if (context.ShowtimeSeats.Any())
        {
            return;
        }

        var seedSeats = new List<ShowtimeSeatEntity>();
        for (var showtimeId = 1; showtimeId <= 6; showtimeId++)
        {
            for (var seatId = 1; seatId <= 10; seatId++)
            {
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
