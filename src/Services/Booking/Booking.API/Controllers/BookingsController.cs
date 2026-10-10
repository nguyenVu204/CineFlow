using System.Text.Json;
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
    private static readonly TimeSpan SeatLockTimeout = TimeSpan.FromSeconds(15);
    private static readonly TimeSpan IdempotencyLockTimeout = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan HoldDuration = TimeSpan.FromMinutes(5);

    private readonly BookingDbContext _context;
    private readonly RedisLockService _redisLockService;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(
        BookingDbContext context,
        RedisLockService redisLockService,
        ILogger<BookingsController> logger)
    {
        _context = context;
        _redisLockService = redisLockService;
        _logger = logger;
    }

    [HttpPost("showtimes/{showtimeId:int}/seats")]
    public async Task<IActionResult> InitializeShowtimeSeats(
        int showtimeId,
        [FromBody] InitializeShowtimeSeatsRequest request,
        CancellationToken cancellationToken)
    {
        if (showtimeId <= 0 ||
            request.SeatIds is null ||
            request.SeatIds.Count == 0 ||
            request.SeatIds.Any(seatId => seatId <= 0) ||
            request.Price < 0)
        {
            return BadRequest(new { message = "Showtime seat data is invalid." });
        }

        var seatIds = request.SeatIds.Distinct().Order().ToList();
        await using var showtimeLock = await _redisLockService.TryAcquireAsync(
            $"showtime-seats:{showtimeId}",
            SeatLockTimeout);

        if (showtimeLock is null)
        {
            return Conflict(new { message = "Seat availability for this showtime is being initialized." });
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        var existingSeatIds = await _context.ShowtimeSeats
            .Where(x => x.ShowtimeId == showtimeId)
            .Select(x => x.SeatId)
            .ToListAsync(cancellationToken);
        var existingSeatIdSet = existingSeatIds.ToHashSet();
        var missingSeats = seatIds
            .Where(seatId => !existingSeatIdSet.Contains(seatId))
            .Select(seatId => new ShowtimeSeat
            {
                ShowtimeId = showtimeId,
                SeatId = seatId,
                Status = ShowtimeSeatStatus.Available,
                Price = request.Price
            })
            .ToList();

        if (missingSeats.Count > 0)
        {
            _context.ShowtimeSeats.AddRange(missingSeats);
            await _context.SaveChangesAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
        _logger.LogInformation(
            "Initialized {CreatedCount} of {SeatCount} seats for showtime {ShowtimeId}.",
            missingSeats.Count,
            seatIds.Count,
            showtimeId);

        return Ok(new { showtimeId, created = missingSeats.Count, total = seatIds.Count });
    }

    [HttpPost("hold")]
    public async Task<IActionResult> HoldSeats(
        [FromBody] HoldSeatRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = BookingRules.ValidateHoldRequest(request);
        if (validationError is not null)
        {
            return BadRequest(new { success = false, message = validationError });
        }

        var seatIds = request.SeatIds.Distinct().Order().ToList();
        var acquiredLocks = new List<RedisLockHandle>();

        try
        {
            if (!await AcquireSeatLocksAsync(request.ShowtimeId, seatIds, acquiredLocks, cancellationToken))
            {
                return Conflict(new { success = false, message = "One or more seats are being processed by another user." });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            var seats = await _context.ShowtimeSeats
                .Where(x => x.ShowtimeId == request.ShowtimeId && seatIds.Contains(x.SeatId))
                .ToListAsync(cancellationToken);

            if (seats.Count != seatIds.Count)
            {
                return BadRequest(new { success = false, message = "One or more seats do not belong to this showtime." });
            }

            var now = DateTime.UtcNow;
            var expiredSeats = seats
                .Where(x => x.Status == ShowtimeSeatStatus.Held && SeatBookingValidator.HasExpired(x.HoldExpiresAt))
                .ToList();

            if (expiredSeats.Count > 0)
            {
                var expiredBookingIds = expiredSeats
                    .Where(x => x.BookingId.HasValue)
                    .Select(x => x.BookingId!.Value)
                    .Distinct()
                    .ToList();
                var expiredBookings = await _context.Bookings
                    .Where(x => expiredBookingIds.Contains(x.Id) &&
                                x.Status == BookingStatus.Pending &&
                                x.ExpiresAt <= now)
                    .ToListAsync(cancellationToken);

                foreach (var expiredBooking in expiredBookings)
                {
                    expiredBooking.Status = BookingStatus.Expired;
                }

                foreach (var seat in expiredSeats)
                {
                    MakeSeatAvailable(seat);
                }
            }

            if (seats.Any(x => x.Status == ShowtimeSeatStatus.Booked || x.Status == ShowtimeSeatStatus.Held))
            {
                return Conflict(new { success = false, message = "One or more seats are already held or booked." });
            }

            var holdExpiresAt = now.Add(HoldDuration);
            var holdToken = Guid.NewGuid().ToString("N");
            var booking = new BookingEntity
            {
                BookingCode = SeatBookingValidator.GenerateBookingCode(),
                UserId = request.UserId.Trim(),
                ShowtimeId = request.ShowtimeId,
                TotalAmount = seats.Sum(x => x.Price),
                Status = BookingStatus.Pending,
                HoldToken = holdToken,
                CreatedAt = now,
                ExpiresAt = holdExpiresAt,
                Items = seats.Select(seat => new BookingItem
                {
                    SeatId = seat.SeatId,
                    SeatNumber = $"Seat {seat.SeatId}",
                    Price = seat.Price
                }).ToList()
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync(cancellationToken);

            foreach (var seat in seats)
            {
                seat.Status = ShowtimeSeatStatus.Held;
                seat.HoldToken = holdToken;
                seat.HeldByUserId = booking.UserId;
                seat.HoldExpiresAt = holdExpiresAt;
                seat.BookingId = booking.Id;
            }

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation(
                "Held {SeatCount} seats for booking {BookingCode} until {ExpiresAt}.",
                seats.Count,
                booking.BookingCode,
                holdExpiresAt);

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
            await ReleaseLocksAsync(acquiredLocks);
        }
    }

    [HttpGet("showtimes/{showtimeId:int}/seats")]
    public async Task<ActionResult<IReadOnlyCollection<SeatAvailabilityResponse>>> GetSeatAvailability(
        int showtimeId,
        CancellationToken cancellationToken)
    {
        if (showtimeId <= 0)
        {
            return BadRequest(new { message = "ShowtimeId must be greater than zero." });
        }

        var now = DateTime.UtcNow;
        var seats = await _context.ShowtimeSeats
            .AsNoTracking()
            .Where(x => x.ShowtimeId == showtimeId)
            .OrderBy(x => x.SeatId)
            .Select(x => new SeatAvailabilityResponse(
                x.SeatId,
                x.Status == ShowtimeSeatStatus.Held && x.HoldExpiresAt <= now
                    ? ShowtimeSeatStatus.Available.ToString()
                    : x.Status.ToString(),
                x.Price,
                x.Status == ShowtimeSeatStatus.Held && x.HoldExpiresAt <= now
                    ? null
                    : x.HoldExpiresAt))
            .ToListAsync(cancellationToken);

        return Ok(seats);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookingDetailsResponse>> GetBooking(
        int id,
        CancellationToken cancellationToken)
    {
        var booking = await _context.Bookings
            .AsNoTracking()
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return booking is null ? NotFound() : Ok(ToBookingDetails(booking));
    }

    [HttpGet("my-bookings")]
    public async Task<ActionResult<IReadOnlyCollection<BookingDetailsResponse>>> GetMyBookings(
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { message = "UserId is required." });
        }

        var bookings = await _context.Bookings
            .AsNoTracking()
            .Include(x => x.Items)
            .Where(x => x.UserId == userId.Trim())
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(bookings.Select(ToBookingDetails).ToList());
    }

    [HttpPost("{id:int}/confirm")]
    public async Task<IActionResult> ConfirmBooking(
        int id,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        if (id <= 0)
        {
            return BadRequest(new { success = false, message = "Booking id must be greater than zero." });
        }

        var normalizedKey = idempotencyKey?.Trim();
        if (!string.IsNullOrEmpty(normalizedKey) && normalizedKey.Length > 200)
        {
            return BadRequest(new { success = false, message = "Idempotency-Key must not exceed 200 characters." });
        }

        RedisLockHandle? idempotencyLock = null;
        var acquiredLocks = new List<RedisLockHandle>();

        try
        {
            if (!string.IsNullOrEmpty(normalizedKey))
            {
                idempotencyLock = await _redisLockService.TryAcquireAsync(
                    $"idempotency:{normalizedKey}",
                    IdempotencyLockTimeout);

                if (idempotencyLock is null)
                {
                    return Conflict(new { success = false, message = "This confirmation request is already being processed." });
                }
            }

            var initialBooking = await _context.Bookings
                .AsNoTracking()
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (initialBooking is null)
            {
                return NotFound();
            }

            var requestHash = BookingRules.CreateConfirmRequestHash(id, initialBooking.UserId);
            if (!string.IsNullOrEmpty(normalizedKey))
            {
                var existing = await _context.IdempotencyRecords
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Key == normalizedKey, cancellationToken);

                if (existing is not null)
                {
                    if (existing.UserId != initialBooking.UserId || existing.RequestHash != requestHash)
                    {
                        return Conflict(new { success = false, message = "Idempotency-Key was already used for a different request." });
                    }

                    return Content(existing.Response, "application/json");
                }
            }

            var seatIds = initialBooking.Items.Select(x => x.SeatId).Distinct().Order().ToList();
            if (!await AcquireSeatLocksAsync(initialBooking.ShowtimeId, seatIds, acquiredLocks, cancellationToken))
            {
                return Conflict(new { success = false, message = "One or more seats are being processed by another request." });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            var booking = await _context.Bookings
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (booking is null)
            {
                return NotFound();
            }

            if (booking.Status == BookingStatus.Confirmed)
            {
                var alreadyConfirmed = JsonSerializer.Serialize(new
                {
                    success = true,
                    message = "Booking already confirmed.",
                    bookingId = booking.Id,
                    bookingCode = booking.BookingCode,
                    status = booking.Status.ToString()
                });
                AddIdempotencyRecord(normalizedKey, requestHash, booking.UserId, alreadyConfirmed);
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return Content(alreadyConfirmed, "application/json");
            }

            if (booking.Status != BookingStatus.Pending)
            {
                return Conflict(new { success = false, message = $"Booking cannot be confirmed in {booking.Status} status." });
            }

            var seatIdsForBooking = booking.Items.Select(x => x.SeatId).Distinct().ToList();
            var seats = await _context.ShowtimeSeats
                .Where(x => x.ShowtimeId == booking.ShowtimeId && seatIdsForBooking.Contains(x.SeatId))
                .ToListAsync(cancellationToken);

            if (booking.ExpiresAt <= DateTime.UtcNow)
            {
                booking.Status = BookingStatus.Expired;
                foreach (var seat in seats.Where(x => x.BookingId == booking.Id))
                {
                    MakeSeatAvailable(seat);
                }

                AddSeatReleasedEvent(booking, "expired");
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return Conflict(new { success = false, message = "Booking expired. Please choose seats again." });
            }

            if (seats.Count != seatIdsForBooking.Count ||
                seats.Any(x => x.Status != ShowtimeSeatStatus.Held ||
                               x.HoldToken != booking.HoldToken ||
                               x.BookingId != booking.Id ||
                               x.HoldExpiresAt <= DateTime.UtcNow))
            {
                return Conflict(new { success = false, message = "Seat hold is no longer valid." });
            }

            booking.Status = BookingStatus.Confirmed;
            foreach (var seat in seats)
            {
                seat.Status = ShowtimeSeatStatus.Booked;
                seat.HoldToken = null;
                seat.HeldByUserId = null;
                seat.HoldExpiresAt = null;
                seat.BookingId = booking.Id;
            }

            var response = JsonSerializer.Serialize(new
            {
                success = true,
                bookingId = booking.Id,
                bookingCode = booking.BookingCode,
                status = booking.Status.ToString()
            });
            var eventPayload = JsonSerializer.Serialize(new
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
                Payload = eventPayload,
                CreatedAt = DateTime.UtcNow
            });
            AddIdempotencyRecord(normalizedKey, requestHash, booking.UserId, response);

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            _logger.LogInformation("Booking {BookingCode} confirmed.", booking.BookingCode);

            return Content(response, "application/json");
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { success = false, message = "Seat state changed while confirming the booking." });
        }
        finally
        {
            await ReleaseLocksAsync(acquiredLocks);
            if (idempotencyLock is not null)
            {
                await ReleaseLocksAsync(new[] { idempotencyLock });
            }
        }
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> CancelBooking(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
        {
            return BadRequest(new { success = false, message = "Booking id must be greater than zero." });
        }

        var initialBooking = await _context.Bookings
            .AsNoTracking()
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (initialBooking is null)
        {
            return NotFound();
        }

        var seatIds = initialBooking.Items.Select(x => x.SeatId).Distinct().Order().ToList();
        var acquiredLocks = new List<RedisLockHandle>();
        try
        {
            if (!await AcquireSeatLocksAsync(initialBooking.ShowtimeId, seatIds, acquiredLocks, cancellationToken))
            {
                return Conflict(new { success = false, message = "One or more seats are being processed by another request." });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            var booking = await _context.Bookings
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (booking is null)
            {
                return NotFound();
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                await transaction.CommitAsync(cancellationToken);
                return Ok(new { success = true, message = "Booking was already cancelled.", bookingId = booking.Id });
            }

            if (!BookingRules.CanCancel(booking.Status))
            {
                return Conflict(new { success = false, message = $"Booking cannot be cancelled in {booking.Status} status." });
            }

            var seatIdsForBooking = booking.Items.Select(x => x.SeatId).Distinct().ToList();
            var seats = await _context.ShowtimeSeats
                .Where(x => x.ShowtimeId == booking.ShowtimeId && seatIdsForBooking.Contains(x.SeatId))
                .ToListAsync(cancellationToken);

            if (booking.Status == BookingStatus.Pending && booking.ExpiresAt <= DateTime.UtcNow)
            {
                booking.Status = BookingStatus.Expired;
                foreach (var seat in seats.Where(x => x.BookingId == booking.Id))
                {
                    MakeSeatAvailable(seat);
                }

                AddSeatReleasedEvent(booking, "expired");
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return Conflict(new { success = false, message = "Booking expired. Please choose seats again." });
            }

            if (seats.Count != seatIdsForBooking.Count ||
                seats.Any(x => x.BookingId != booking.Id ||
                               (booking.Status == BookingStatus.Pending && x.Status != ShowtimeSeatStatus.Held) ||
                               (booking.Status == BookingStatus.Confirmed && x.Status != ShowtimeSeatStatus.Booked)))
            {
                return Conflict(new { success = false, message = "Booking no longer owns all of its seats." });
            }

            foreach (var seat in seats)
            {
                MakeSeatAvailable(seat);
            }

            booking.Status = BookingStatus.Cancelled;
            var cancelledAt = DateTime.UtcNow;
            _context.OutboxMessages.Add(new OutboxMessage
            {
                Type = "SeatReleased",
                Payload = JsonSerializer.Serialize(new
                {
                    bookingId = booking.Id,
                    bookingCode = booking.BookingCode,
                    cancelledAt,
                    reason = "cancelled"
                }),
                CreatedAt = cancelledAt
            });

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            _logger.LogInformation("Booking {BookingCode} cancelled and its seats released.", booking.BookingCode);

            return Ok(new { success = true, message = "Booking cancelled and seats returned to available.", bookingId = booking.Id });
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { success = false, message = "Seat state changed while cancelling the booking." });
        }
        finally
        {
            await ReleaseLocksAsync(acquiredLocks);
        }
    }

    private async Task<bool> AcquireSeatLocksAsync(
        int showtimeId,
        IEnumerable<int> seatIds,
        ICollection<RedisLockHandle> acquiredLocks,
        CancellationToken cancellationToken)
    {
        foreach (var seatId in seatIds)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var handle = await _redisLockService.TryAcquireAsync(
                $"seat-lock:{showtimeId}:{seatId}",
                SeatLockTimeout);

            if (handle is null)
            {
                return false;
            }

            acquiredLocks.Add(handle);
        }

        return true;
    }

    private async Task ReleaseLocksAsync(IEnumerable<RedisLockHandle> handles)
    {
        foreach (var handle in handles)
        {
            try
            {
                await handle.DisposeAsync();
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Could not release a Redis lock; it will expire automatically.");
            }
        }
    }

    private void AddIdempotencyRecord(string? key, string requestHash, string userId, string response)
    {
        if (string.IsNullOrEmpty(key))
        {
            return;
        }

        _context.IdempotencyRecords.Add(new IdempotencyRecord
        {
            Key = key,
            UserId = userId,
            RequestHash = requestHash,
            Response = response,
            CreatedAt = DateTime.UtcNow
        });
    }

    private void AddSeatReleasedEvent(BookingEntity booking, string reason)
    {
        _context.OutboxMessages.Add(new OutboxMessage
        {
            Type = "SeatReleased",
            Payload = JsonSerializer.Serialize(new
            {
                bookingId = booking.Id,
                bookingCode = booking.BookingCode,
                releasedAt = DateTime.UtcNow,
                reason
            }),
            CreatedAt = DateTime.UtcNow
        });
    }

    private static void MakeSeatAvailable(ShowtimeSeat seat)
    {
        seat.Status = ShowtimeSeatStatus.Available;
        seat.HoldToken = null;
        seat.HeldByUserId = null;
        seat.HoldExpiresAt = null;
        seat.BookingId = null;
    }

    private static BookingDetailsResponse ToBookingDetails(BookingEntity booking)
    {
        return new BookingDetailsResponse(
            booking.Id,
            booking.BookingCode,
            booking.UserId,
            booking.ShowtimeId,
            booking.TotalAmount,
            booking.Status.ToString(),
            booking.CreatedAt,
            booking.ExpiresAt,
            booking.Items
                .Select(x => new BookingItemResponse(x.SeatId, x.SeatNumber, x.Price))
                .ToList());
    }
}
