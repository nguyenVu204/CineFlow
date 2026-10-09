using Booking.API.Data;
using Booking.API.Dtos;
using Booking.API.Models;
using Booking.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookingEntity = Booking.API.Models.Booking;
using BookingStatus = Booking.API.Models.BookingStatus;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly BookingDbContext _context;
    private readonly RedisLockService _redisLockService;
    private readonly IRabbitMqPublisher _rabbitMqPublisher;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(
        BookingDbContext context,
        RedisLockService redisLockService,
        IRabbitMqPublisher rabbitMqPublisher,
        ILogger<BookingsController> logger)
    {
        _context = context;
        _redisLockService = redisLockService;
        _rabbitMqPublisher = rabbitMqPublisher;
        _logger = logger;
    }

    [HttpPost("hold")]
    public async Task<IActionResult> HoldSeats([FromBody] HoldSeatRequest request)
    {
        if (request.SeatIds == null || request.SeatIds.Count == 0)
        {
            return BadRequest(new { success = false, message = "At least one seat is required." });
        }

        if (string.IsNullOrWhiteSpace(request.UserId))
        {
            return BadRequest(new { success = false, message = "UserId is required." });
        }

        var acquiredLocks = new List<RedisLockHandle>();
        try
        {
            foreach (var seatId in request.SeatIds.Distinct())
            {
                var lockHandle = await _redisLockService.TryAcquireAsync($"seat-lock:{request.ShowtimeId}:{seatId}", TimeSpan.FromSeconds(10));
                if (lockHandle is null)
                {
                    return Conflict(new { success = false, message = $"Seat {seatId} is being processed by another user." });
                }

                acquiredLocks.Add(lockHandle);
            }

            var seatIds = request.SeatIds.Distinct().ToList();
            var seats = await _context.ShowtimeSeats
                .Where(x => x.ShowtimeId == request.ShowtimeId && seatIds.Contains(x.SeatId))
                .ToListAsync();

            if (seats.Count != seatIds.Count)
            {
                return BadRequest(new { success = false, message = "One or more seats do not belong to this showtime." });
            }

            if (seats.Any(x => x.Status == ShowtimeSeatStatus.Held || x.Status == ShowtimeSeatStatus.Booked))
            {
                return Conflict(new { success = false, message = "One or more seats are already held or booked." });
            }

            var holdToken = Guid.NewGuid().ToString("N");
            var booking = new BookingEntity
            {
                BookingCode = $"BOOK-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
                UserId = request.UserId,
                ShowtimeId = request.ShowtimeId,
                TotalAmount = seats.Sum(x => x.Price),
                Status = BookingStatus.Pending,
                HoldToken = holdToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5)
            };

            var bookingItems = seats.Select(seat => new BookingItem
            {
                SeatId = seat.SeatId,
                SeatNumber = "Seat " + seat.SeatId,
                Price = seat.Price,
                Booking = booking
            }).ToList();

            booking.Items = bookingItems;

            foreach (var seat in seats)
            {
                seat.Status = ShowtimeSeatStatus.Held;
                seat.HoldToken = holdToken;
                seat.HeldByUserId = request.UserId;
                seat.HoldExpiresAt = DateTime.UtcNow.AddMinutes(5);
                seat.BookingId = null;
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            foreach (var seat in seats)
            {
                seat.BookingId = booking.Id;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                bookingId = booking.Id,
                bookingCode = booking.BookingCode,
                status = booking.Status.ToString(),
                totalAmount = booking.TotalAmount,
                expiresAt = booking.ExpiresAt,
                holdToken,
                seatIds = seats.Select(x => x.SeatId).ToList()
            });
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { success = false, message = "One of the seats moved to a new state just now." });
        }
        finally
        {
            foreach (var handle in acquiredLocks)
            {
                await handle.DisposeAsync();
            }
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookingEntity>> GetBooking(int id)
    {
        var booking = await _context.Bookings
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (booking is null)
        {
            return NotFound();
        }

        return Ok(booking);
    }

    [HttpGet("my-bookings")]
    public async Task<ActionResult<IEnumerable<BookingEntity>>> GetMyBookings([FromQuery] string userId)
    {
        var bookings = await _context.Bookings
            .Include(x => x.Items)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpPost("{id:int}/confirm")]
    public async Task<IActionResult> ConfirmBooking(int id, [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey)
    {
        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var hash = idempotencyKey.Trim();
            var existing = await _context.IdempotencyRecords.FirstOrDefaultAsync(x => x.Key == hash);
            if (existing is not null)
            {
                return Ok(existing.Response);
            }
        }

        var booking = await _context.Bookings
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (booking is null)
        {
            return NotFound();
        }

        if (booking.Status == BookingStatus.Confirmed)
        {
            return Ok(new { success = true, message = "Booking already confirmed.", bookingId = booking.Id });
        }

        if (booking.ExpiresAt < DateTime.UtcNow)
        {
            booking.Status = BookingStatus.Expired;
            await _context.SaveChangesAsync();
            return Conflict(new { success = false, message = "Booking expired. Please choose seats again." });
        }

        var seatIds = booking.Items.Select(x => x.SeatId).Distinct().ToList();
        var seats = await _context.ShowtimeSeats
            .Where(x => x.ShowtimeId == booking.ShowtimeId && seatIds.Contains(x.SeatId))
            .ToListAsync();

        if (seats.Any(x => x.Status != ShowtimeSeatStatus.Held || x.HoldToken != booking.HoldToken))
        {
            return Conflict(new { success = false, message = "Seat hold is no longer valid." });
        }

        try
        {
            using var tx = await _context.Database.BeginTransactionAsync();
            booking.Status = BookingStatus.Confirmed;

            foreach (var seat in seats)
            {
                seat.Status = ShowtimeSeatStatus.Booked;
                seat.HoldToken = null;
                seat.HeldByUserId = null;
                seat.HoldExpiresAt = null;
                seat.BookingId = booking.Id;
            }

            var payload = System.Text.Json.JsonSerializer.Serialize(new
            {
                BookingCode = booking.BookingCode,
                BookingId = booking.Id,
                UserId = booking.UserId,
                TotalAmount = booking.TotalAmount,
                ConfirmedAt = DateTime.UtcNow
            });

            _context.OutboxMessages.Add(new OutboxMessage
            {
                Type = "BookingConfirmed",
                Payload = payload,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            if (!string.IsNullOrWhiteSpace(idempotencyKey))
            {
                _context.IdempotencyRecords.Add(new IdempotencyRecord
                {
                    Key = idempotencyKey.Trim(),
                    UserId = booking.UserId,
                    RequestHash = idempotencyKey.Trim(),
                    Response = System.Text.Json.JsonSerializer.Serialize(new { success = true, bookingId = booking.Id, bookingCode = booking.BookingCode, status = booking.Status.ToString() }),
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, bookingId = booking.Id, bookingCode = booking.BookingCode, status = BookingStatus.Confirmed.ToString() });
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { success = false, message = "Seat state changed while confirming the booking." });
        }
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var booking = await _context.Bookings
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (booking is null)
        {
            return NotFound();
        }

        var seatIds = booking.Items.Select(x => x.SeatId).Distinct().ToList();
        var seats = await _context.ShowtimeSeats
            .Where(x => x.ShowtimeId == booking.ShowtimeId && seatIds.Contains(x.SeatId))
            .ToListAsync();

        foreach (var seat in seats)
        {
            seat.Status = ShowtimeSeatStatus.Available;
            seat.HoldToken = null;
            seat.HeldByUserId = null;
            seat.HoldExpiresAt = null;
            seat.BookingId = null;
        }

        booking.Status = BookingStatus.Cancelled;
        await _context.SaveChangesAsync();

        await _rabbitMqPublisher.PublishAsync("SeatReleased", new { bookingId = booking.Id, bookingCode = booking.BookingCode, cancelledAt = DateTime.UtcNow });

        return Ok(new { success = true, message = "Booking cancelled and seats returned to available." });
    }
}
