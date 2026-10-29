using Booking.API.Models;
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

        // 1. Seed Concessions if empty
        if (!context.Concessions.Any())
        {
            var concessions = new[]
            {
                new Concession
                {
                    Name = "My Combo (1 Bắp Ngọt + 1 Nước Lớn)",
                    Description = "1 Bắp rang bơ Caramel size L + 1 Pepsi lạnh 32oz",
                    Price = 89000m,
                    Icon = "fa-cup-straw",
                    InStock = true
                },
                new Concession
                {
                    Name = "Couple Combo (1 Bắp Phô Mai + 2 Nước)",
                    Description = "1 Bắp lắc Phô Mai thượng hạng + 2 Nước ngọt size L",
                    Price = 119000m,
                    Icon = "fa-heart",
                    InStock = true
                },
                new Concession
                {
                    Name = "CINEVERSE VIP Bucket (2 Bắp + 2 Nước + Snack)",
                    Description = "Tặng kèm ly giữ nhiệt phiên bản giới hạn Hành Tinh Cát",
                    Price = 175000m,
                    Icon = "fa-crown",
                    InStock = true
                },
                new Concession
                {
                    Name = "Xúc Xích Đức Nướng & Khoai Tây Lắc",
                    Description = "Ăn nhẹ nóng hổi dùng kèm sốt phô mai cay",
                    Price = 69000m,
                    Icon = "fa-hotdog",
                    InStock = true
                }
            };
            context.Concessions.AddRange(concessions);
            context.SaveChanges();
        }

        // 2. Seed Promotions if empty
        if (!context.Promotions.Any())
        {
            var promotions = new[]
            {
                new Promotion
                {
                    Code = "CINEMA50",
                    Title = "Giảm 50.000đ cho đơn từ 200.000đ",
                    DiscountType = "fixed",
                    DiscountValue = 50000m,
                    MinOrderValue = 200000m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Promotion
                {
                    Code = "HAPPY20",
                    Title = "Giảm 20% tổng hóa đơn",
                    DiscountType = "percent",
                    DiscountValue = 20m,
                    MinOrderValue = 100000m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Promotion
                {
                    Code = "WELCOME30",
                    Title = "Ưu đãi chào đón thành viên mới giảm 30.000đ",
                    DiscountType = "fixed",
                    DiscountValue = 30000m,
                    MinOrderValue = 100000m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Promotion
                {
                    Code = "VIP50",
                    Title = "Đặc quyền thành viên VIP giảm 50.000đ",
                    DiscountType = "fixed",
                    DiscountValue = 50000m,
                    MinOrderValue = 150000m,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Promotions.AddRange(promotions);
            context.SaveChanges();
        }

        // 3. Seed Showtime Seats
        var existingSeats = context.ShowtimeSeats
            .Select(x => new { x.ShowtimeId, x.SeatId })
            .ToList()
            .Select(x => (x.ShowtimeId, x.SeatId))
            .ToHashSet();
        var seedSeats = new List<ShowtimeSeatEntity>();

        for (var showtimeId = 1; showtimeId <= 108; showtimeId++)
        {
            var screenSeatOffset = ((showtimeId - 1) % 12) * 75;
            for (var seatNumber = 1; seatNumber <= 75; seatNumber++)
            {
                var seatId = screenSeatOffset + seatNumber;
                if (existingSeats.Contains((showtimeId, seatId)))
                {
                    continue;
                }

                // Simulate some maintenance and booked seats for realism
                var status = ShowtimeSeatStatusEnum.Available;
                if (showtimeId == 1)
                {
                    if (seatNumber is 34 or 35) // E4, E5 maintenance
                    {
                        status = ShowtimeSeatStatusEnum.Maintenance;
                    }
                    else if (seatNumber is 37 or 38) // E7, E8 booked
                    {
                        status = ShowtimeSeatStatusEnum.Booked;
                    }
                }

                seedSeats.Add(new ShowtimeSeatEntity
                {
                    ShowtimeId = showtimeId,
                    SeatId = seatId,
                    Status = status,
                    Price = seatNumber > 70 ? 240000m : (seatNumber > 30 ? 115000m : 85000m),
                    HoldExpiresAt = null,
                    BookingId = null,
                    HoldToken = null,
                    HeldByUserId = null
                });
            }
        }

        if (seedSeats.Count > 0)
        {
            context.ShowtimeSeats.AddRange(seedSeats);
            context.SaveChanges();
        }

        // 4. Seed initial bookings for Admin CMS and ticket check-in if empty
        if (!context.Bookings.Any())
        {
            var demoBooking = new BookingEntity
            {
                BookingCode = "CV-893412",
                UserId = "admin",
                ShowtimeId = 1,
                TotalAmount = 349000m,
                DiscountAmount = 0m,
                CustomerName = "Nguyễn Văn A",
                CustomerPhone = "0987654321",
                PaymentMethod = "Ví MoMo",
                PromoCode = "",
                Status = BookingStatus.Confirmed,
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                ExpiresAt = DateTime.UtcNow.AddDays(1),
                Items = new List<BookingItem>
                {
                    new() { SeatId = 37, SeatNumber = "E7", Price = 115000m },
                    new() { SeatId = 38, SeatNumber = "E8", Price = 115000m }
                },
                Concessions = new List<BookingConcessionItem>
                {
                    new() { ConcessionId = 2, ConcessionName = "Couple Combo (1 Bắp Phô Mai + 2 Nước)", Quantity = 1, UnitPrice = 119000m }
                }
            };

            var demoBooking2 = new BookingEntity
            {
                BookingCode = "CV-451290",
                UserId = "user-vip",
                ShowtimeId = 2,
                TotalAmount = 280000m,
                DiscountAmount = 30000m,
                CustomerName = "Trần Thị Mai Phương",
                CustomerPhone = "0912345678",
                PaymentMethod = "VNPAY-QR",
                PromoCode = "WELCOME30",
                Status = BookingStatus.CheckedIn,
                CheckedInAt = DateTime.UtcNow.AddMinutes(-30),
                CreatedAt = DateTime.UtcNow.AddHours(-4),
                ExpiresAt = DateTime.UtcNow.AddDays(1),
                Items = new List<BookingItem>
                {
                    new() { SeatId = 45, SeatNumber = "F5", Price = 115000m },
                    new() { SeatId = 46, SeatNumber = "F6", Price = 115000m }
                },
                Concessions = new List<BookingConcessionItem>
                {
                    new() { ConcessionId = 1, ConcessionName = "My Combo (1 Bắp Ngọt + 1 Nước Lớn)", Quantity = 1, UnitPrice = 80000m }
                }
            };

            context.Bookings.AddRange(demoBooking, demoBooking2);
            context.SaveChanges();
        }
    }
}
