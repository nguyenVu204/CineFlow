using Cinema.API.Data;
using Cinema.API.Dtos;
using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using CinemaEntity = Cinema.API.Models.Cinema;
using ScreenEntity = Cinema.API.Models.Screen;
using SeatEntity = Cinema.API.Models.Seat;
using ShowtimeEntity = Cinema.API.Models.Showtime;
using ShowtimeStatus = Cinema.API.Models.ShowtimeStatus;

namespace Cinema.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CinemasController : ControllerBase
{
    private readonly CinemaDbContext _context;

    public CinemasController(CinemaDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CinemaEntity>>> GetCinemas()
    {
        var cinemas = await _context.Cinemas
            .Include(x => x.Screens)
            .ThenInclude(x => x.Seats)
            .OrderBy(x => x.Name)
            .ToListAsync();

        return Ok(cinemas);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CinemaEntity>> GetCinema(int id)
    {
        var cinema = await _context.Cinemas
            .Include(x => x.Screens)
            .ThenInclude(x => x.Seats)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (cinema is null)
        {
            return NotFound();
        }

        return Ok(cinema);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CinemaEntity>> CreateCinema([FromBody] CinemaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 200 ||
            string.IsNullOrWhiteSpace(request.Address) || request.Address.Trim().Length > 500 ||
            request.Description is null || request.Description.Length > 1000)
        {
            return BadRequest(new { message = "Name, address, or description is invalid." });
        }

        var cinema = new CinemaEntity
        {
            Name = request.Name.Trim(),
            Address = request.Address.Trim(),
            Description = request.Description.Trim()
        };
        _context.Cinemas.Add(cinema);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCinema), new { id = cinema.Id }, cinema);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCinema(int id, [FromBody] CinemaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 200 ||
            string.IsNullOrWhiteSpace(request.Address) || request.Address.Trim().Length > 500 ||
            request.Description is null || request.Description.Length > 1000)
        {
            return BadRequest(new { message = "Name, address, or description is invalid." });
        }

        var cinema = await _context.Cinemas.FindAsync(id);
        if (cinema is null)
        {
            return NotFound();
        }

        cinema.Name = request.Name;
        cinema.Address = request.Address;
        cinema.Description = request.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCinema(int id)
    {
        var cinema = await _context.Cinemas.FindAsync(id);
        if (cinema is null)
        {
            return NotFound();
        }

        _context.Cinemas.Remove(cinema);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
public class ScreensController : ControllerBase
{
    private readonly CinemaDbContext _context;

    public ScreensController(CinemaDbContext context)
    {
        _context = context;
    }

    [HttpGet("{screenId:int}")]
    public async Task<ActionResult<ScreenEntity>> GetScreen(int screenId)
    {
        var screen = await _context.Screens
            .Include(x => x.Seats)
            .FirstOrDefaultAsync(x => x.Id == screenId);

        return screen is null ? NotFound() : Ok(screen);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ScreenEntity>> CreateScreen([FromBody] ScreenRequest request)
    {
        if (request.CinemaId <= 0 || string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 100)
        {
            return BadRequest(new { message = "CinemaId and a screen name of at most 100 characters are required." });
        }

        if (!await _context.Cinemas.AnyAsync(x => x.Id == request.CinemaId))
        {
            return BadRequest(new { message = "Cinema does not exist." });
        }

        var screen = new ScreenEntity
        {
            CinemaId = request.CinemaId,
            Name = request.Name.Trim()
        };
        _context.Screens.Add(screen);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (IsUniqueConstraintViolation(exception))
        {
            return Conflict(new { message = "A screen with this name already exists in the cinema." });
        }

        return CreatedAtAction(nameof(GetScreen), new { screenId = screen.Id }, screen);
    }

    [HttpPut("{screenId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateScreen(int screenId, [FromBody] ScreenRequest request)
    {
        if (request.CinemaId <= 0 || string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 100)
        {
            return BadRequest(new { message = "CinemaId and a screen name of at most 100 characters are required." });
        }

        var screen = await _context.Screens.FindAsync(screenId);
        if (screen is null)
        {
            return NotFound();
        }

        if (!await _context.Cinemas.AnyAsync(x => x.Id == request.CinemaId))
        {
            return BadRequest(new { message = "Cinema does not exist." });
        }

        screen.CinemaId = request.CinemaId;
        screen.Name = request.Name.Trim();
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (IsUniqueConstraintViolation(exception))
        {
            return Conflict(new { message = "A screen with this name already exists in the cinema." });
        }

        return NoContent();
    }

    [HttpGet("{screenId:int}/seats")]
    public async Task<ActionResult<IEnumerable<SeatEntity>>> GetSeats(int screenId)
    {
        if (!await _context.Screens.AnyAsync(x => x.Id == screenId))
        {
            return NotFound();
        }

        var seats = await _context.Seats
            .Where(x => x.ScreenId == screenId)
            .OrderBy(x => x.Row)
            .ThenBy(x => x.Column)
            .ToListAsync();

        return Ok(seats);
    }

    [HttpPost("{screenId:int}/seats")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SeatEntity>> CreateSeat(int screenId, [FromBody] SeatRequest request)
    {
        return await CreateSeatForScreen(screenId, request);
    }

    [HttpPost("/api/seats")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SeatEntity>> CreateSeat([FromBody] SeatRequest request)
    {
        return await CreateSeatForScreen(request.ScreenId, request);
    }

    private async Task<ActionResult<SeatEntity>> CreateSeatForScreen(int screenId, SeatRequest request)
    {
        if (screenId <= 0 ||
            string.IsNullOrWhiteSpace(request.Row) || request.Row.Trim().Length > 10 ||
            string.IsNullOrWhiteSpace(request.Column) || request.Column.Trim().Length > 10 ||
            string.IsNullOrWhiteSpace(request.SeatNumber) || request.SeatNumber.Trim().Length > 20 ||
            !Enum.IsDefined(request.SeatType))
        {
            return BadRequest(new { message = "Seat details are invalid." });
        }

        if (!await _context.Screens.AnyAsync(x => x.Id == screenId))
        {
            return BadRequest(new { message = "Screen does not exist." });
        }

        var seat = new SeatEntity
        {
            ScreenId = screenId,
            Row = request.Row.Trim(),
            Column = request.Column.Trim(),
            SeatNumber = request.SeatNumber.Trim(),
            SeatType = request.SeatType
        };
        _context.Seats.Add(seat);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (IsUniqueConstraintViolation(exception))
        {
            return Conflict(new { message = "Seat number already exists in this screen." });
        }

        return Created($"/api/screens/{seat.ScreenId}/seats", seat);
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException exception)
    {
        return exception.GetBaseException() is SqlException { Number: 2601 or 2627 };
    }
}

[ApiController]
[Route("api/[controller]")]
public class ShowtimesController : ControllerBase
{
    private readonly CinemaDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ShowtimesController> _logger;

    public ShowtimesController(
        CinemaDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<ShowtimesController> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShowtimeEntity>>> GetShowtimes([FromQuery] int? movieId, [FromQuery] int? screenId)
    {
        if (movieId <= 0 || screenId <= 0)
        {
            return BadRequest(new { message = "MovieId and ScreenId must be greater than zero when provided." });
        }

        var query = _context.Showtimes.Include(x => x.Screen).AsQueryable();

        if (movieId.HasValue)
        {
            query = query.Where(x => x.MovieId == movieId.Value);
        }

        if (screenId.HasValue)
        {
            query = query.Where(x => x.ScreenId == screenId.Value);
        }

        var showtimes = await query.OrderBy(x => x.StartTime).ToListAsync();
        return Ok(showtimes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ShowtimeEntity>> GetShowtime(int id)
    {
        var showtime = await _context.Showtimes.Include(x => x.Screen).FirstOrDefaultAsync(x => x.Id == id);
        if (showtime is null)
        {
            return NotFound();
        }

        return Ok(showtime);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ShowtimeEntity>> CreateShowtime(
        [FromBody] ShowtimeRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsValidShowtime(request))
        {
            return BadRequest(new { message = "Showtime details are invalid." });
        }

        var screen = await _context.Screens
            .Include(x => x.Seats)
            .FirstOrDefaultAsync(x => x.Id == request.ScreenId, cancellationToken);
        if (screen is null)
        {
            return BadRequest(new { message = "Screen does not exist." });
        }

        if (screen.Seats.Count == 0)
        {
            return BadRequest(new { message = "Screen must contain seats before creating a showtime." });
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var overlaps = request.Status != ShowtimeStatus.Cancelled &&
            await _context.Showtimes.AnyAsync(x =>
                x.ScreenId == request.ScreenId &&
                x.Status != ShowtimeStatus.Cancelled &&
                x.StartTime < request.EndTime &&
                request.StartTime < x.EndTime,
                cancellationToken);

        if (overlaps)
        {
            return Conflict(new { message = "Showtime overlaps with existing showtime in the same screen." });
        }

        var showtime = new ShowtimeEntity
        {
            MovieId = request.MovieId,
            ScreenId = request.ScreenId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            BasePrice = request.BasePrice,
            Status = request.Status
        };
        _context.Showtimes.Add(showtime);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var bookingClient = _httpClientFactory.CreateClient("BookingService");
        try
        {
            using var response = await bookingClient.PostAsJsonAsync(
                $"/api/bookings/showtimes/{showtime.Id}/seats",
                new InitializeBookingSeatsRequest(
                    screen.Seats.Select(x => x.Id).ToList(),
                    showtime.BasePrice),
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "Booking Service returned {StatusCode} while initializing seats for showtime {ShowtimeId}.",
                    (int)response.StatusCode,
                    showtime.Id);
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    message = "Showtime was created, but seat initialization failed. Retry seat initialization through Booking Service.",
                    showtimeId = showtime.Id
                });
            }
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(exception, "Could not initialize seats for showtime {ShowtimeId}.", showtime.Id);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "Showtime was created, but Booking Service could not be reached. Retry seat initialization.",
                showtimeId = showtime.Id
            });
        }

        return CreatedAtAction(nameof(GetShowtime), new { id = showtime.Id }, showtime);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateShowtime(int id, [FromBody] ShowtimeRequest request)
    {
        var showtime = await _context.Showtimes.FindAsync(id);
        if (showtime is null)
        {
            return NotFound();
        }

        if (!IsValidShowtime(request))
        {
            return BadRequest(new { message = "Showtime details are invalid." });
        }

        if (!await _context.Screens.AnyAsync(x => x.Id == request.ScreenId))
        {
            return BadRequest(new { message = "Screen does not exist." });
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var overlaps = await _context.Showtimes.AnyAsync(x =>
            request.Status != ShowtimeStatus.Cancelled &&
            x.Id != id &&
            x.ScreenId == request.ScreenId &&
            x.Status != ShowtimeStatus.Cancelled &&
            x.StartTime < request.EndTime &&
            request.StartTime < x.EndTime);

        if (overlaps)
        {
            return Conflict(new { message = "Showtime overlaps with existing showtime in the same screen." });
        }

        showtime.MovieId = request.MovieId;
        showtime.ScreenId = request.ScreenId;
        showtime.StartTime = request.StartTime;
        showtime.EndTime = request.EndTime;
        showtime.BasePrice = request.BasePrice;
        showtime.Status = request.Status;

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteShowtime(int id)
    {
        var showtime = await _context.Showtimes.FindAsync(id);
        if (showtime is null)
        {
            return NotFound();
        }

        _context.Showtimes.Remove(showtime);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static bool IsValidShowtime(ShowtimeRequest showtime)
    {
        return showtime.MovieId > 0 &&
               showtime.ScreenId > 0 &&
               showtime.EndTime > showtime.StartTime &&
               showtime.BasePrice >= 0 &&
               Enum.IsDefined(showtime.Status);
    }
}
