using CinemaEntity = Cinema.API.Models.Cinema;
using ScreenEntity = Cinema.API.Models.Screen;
using SeatEntity = Cinema.API.Models.Seat;
using SeatTypeEnum = Cinema.API.Models.SeatType;
using ShowtimeEntity = Cinema.API.Models.Showtime;
using ShowtimeStatus = Cinema.API.Models.ShowtimeStatus;
using Microsoft.EntityFrameworkCore;

namespace Cinema.API.Data;

public static class DbInitializer
{
    public static void Seed(CinemaDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Cinemas.Any())
        {
            return;
        }

        var cinemas = new[]
        {
            new CinemaEntity
            {
                Name = "Galaxy Cinema",
                Address = "123 Le Duan, Da Nang",
                Description = "Modern cinema with premium screens.",
                Screens = new List<ScreenEntity>()
            },
            new CinemaEntity
            {
                Name = "CineStar Plaza",
                Address = "45 Tran Phu, Nha Trang",
                Description = "Family-friendly cinema near the center.",
                Screens = new List<ScreenEntity>()
            }
        };

        var screens = new List<ScreenEntity>();
        for (var i = 0; i < cinemas.Length; i++)
        {
            for (var j = 1; j <= 2; j++)
            {
                var screen = new ScreenEntity
                {
                    Name = $"Screen {j}",
                    Cinema = cinemas[i],
                    Seats = new List<SeatEntity>()
                };

                for (var rowIndex = 0; rowIndex < 4; rowIndex++)
                {
                    var row = "ABCD"[rowIndex].ToString();
                    for (var col = 1; col <= 5; col++)
                    {
                        var seatNumber = $"{row}{col}";
                        screen.Seats.Add(new SeatEntity
                        {
                            Row = row,
                            Column = col.ToString(),
                            SeatNumber = seatNumber,
                            SeatType = col % 3 == 0 ? SeatTypeEnum.VIP : SeatTypeEnum.Regular
                        });
                    }
                }

                screens.Add(screen);
                cinemas[i].Screens.Add(screen);
            }
        }

        context.Cinemas.AddRange(cinemas);
        context.SaveChanges();

        var allScreens = context.Screens.Include(x => x.Seats).ToList();
        foreach (var screen in allScreens)
        {
            var showtimeList = new List<ShowtimeEntity>();
            for (var i = 1; i <= 3; i++)
            {
                var start = DateTime.UtcNow.AddDays(i).Date.AddHours(12 + i * 2);
                showtimeList.Add(new ShowtimeEntity
                {
                    MovieId = i,
                    ScreenId = screen.Id,
                    StartTime = start,
                    EndTime = start.AddMinutes(120),
                    BasePrice = 120000m,
                    Status = ShowtimeStatus.Scheduled
                });
            }

            context.Showtimes.AddRange(showtimeList);
        }

        context.SaveChanges();
    }
}
