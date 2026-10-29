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
                Name = "CINEVERSE Vincom Royal City",
                Address = "Tầng B2, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
                Description = "Rạp chiếu phim chuẩn quốc tế với phòng chiếu IMAX Laser và âm thanh Dolby Atmos đẳng cấp nhất Hà Nội.",
                Screens = new List<ScreenEntity>()
            },
            new CinemaEntity
            {
                Name = "CINEVERSE Landmark 81",
                Address = "Tầng B1, Tòa nhà Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh",
                Description = "Trải nghiệm điện ảnh đỉnh cao tại tòa tháp cao nhất Việt Nam với màn hình IMAX Laser lớn nhất khu vực.",
                Screens = new List<ScreenEntity>()
            },
            new CinemaEntity
            {
                Name = "CINEVERSE Nguyễn Tri Phương",
                Address = "315 Nguyễn Tri Phương, Hải Châu, Đà Nẵng",
                Description = "Cụm rạp hiện đại bậc nhất miền Trung với công nghệ chiếu Laser 4K sắc nét và ghế ngồi bọc da cao cấp.",
                Screens = new List<ScreenEntity>()
            }
        };

        var screenConfigs = new[]
        {
            ("Phòng IMAX 01", "IMAX Laser 3D"),
            ("Phòng 4DX 02", "4DX Tuyệt Đỉnh"),
            ("Phòng Gold Class", "Dolby Atmos 2D"),
            ("Phòng Laser 03", "2D Phụ Đề")
        };

        foreach (var cinema in cinemas)
        {
            foreach (var (screenName, format) in screenConfigs)
            {
                var screen = new ScreenEntity
                {
                    Name = screenName,
                    Cinema = cinema,
                    Seats = new List<SeatEntity>()
                };

                // Rows A to G (10 seats each) -> 70 regular & VIP seats
                var rows = new[] { "A", "B", "C", "D", "E", "F", "G" };
                foreach (var row in rows)
                {
                    var isVip = row is "D" or "E" or "F" or "G";
                    for (var col = 1; col <= 10; col++)
                    {
                        var seatNumber = $"{row}{col}";
                        screen.Seats.Add(new SeatEntity
                        {
                            Row = row,
                            Column = col.ToString(),
                            SeatNumber = seatNumber,
                            SeatType = isVip ? SeatTypeEnum.VIP : SeatTypeEnum.Regular
                        });
                    }
                }

                // Row H: Sweetbox seats 1 to 5 (5 pair seats)
                for (var col = 1; col <= 5; col++)
                {
                    var seatNumber = $"H{col}";
                    screen.Seats.Add(new SeatEntity
                    {
                        Row = "H",
                        Column = col.ToString(),
                        SeatNumber = seatNumber,
                        SeatType = SeatTypeEnum.Couple
                    });
                }

                cinema.Screens.Add(screen);
            }
        }

        context.Cinemas.AddRange(cinemas);
        context.SaveChanges();

        // Seed initial showtimes
        var allScreens = context.Screens.Include(x => x.Seats).ToList();
        var today = DateTime.UtcNow.Date;

        var showtimeList = new List<ShowtimeEntity>();
        var times = new[] { 10, 13, 16, 19, 21 }; // hours

        var screenIndex = 0;
        foreach (var screen in allScreens)
        {
            screenIndex++;
            for (var dayOffset = 0; dayOffset < 3; dayOffset++)
            {
                var targetDate = today.AddDays(dayOffset);
                var movieId = (screenIndex % 6) + 1; // 1 to 6

                for (var tIdx = 0; tIdx < 3; tIdx++)
                {
                    var hour = times[(tIdx + dayOffset) % times.Length];
                    var start = targetDate.AddHours(hour).AddMinutes(15);
                    var end = start.AddMinutes(145);

                    var basePrice = screen.Name.Contains("IMAX") ? 135000m :
                                    screen.Name.Contains("Gold") ? 160000m :
                                    screen.Name.Contains("4DX") ? 150000m : 85000m;

                    showtimeList.Add(new ShowtimeEntity
                    {
                        MovieId = movieId,
                        ScreenId = screen.Id,
                        StartTime = start,
                        EndTime = end,
                        BasePrice = basePrice,
                        Status = ShowtimeStatus.Scheduled
                    });
                }
            }
        }

        context.Showtimes.AddRange(showtimeList);
        context.SaveChanges();
    }
}
