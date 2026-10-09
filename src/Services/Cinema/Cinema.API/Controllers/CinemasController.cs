using Cinema.API.Data;
using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<CinemaEntity>> CreateCinema([FromBody] CinemaEntity cinema)
    {
        _context.Cinemas.Add(cinema);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCinema), new { id = cinema.Id }, cinema);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCinema(int id, [FromBody] CinemaEntity request)
    {
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

    [HttpGet("{screenId:int}/seats")]
    public async Task<ActionResult<IEnumerable<SeatEntity>>> GetSeats(int screenId)
    {
        var seats = await _context.Seats
            .Where(x => x.ScreenId == screenId)
            .OrderBy(x => x.Row)
            .ThenBy(x => x.Column)
            .ToListAsync();

        return Ok(seats);
    }

    [HttpPost]
    public async Task<ActionResult<SeatEntity>> CreateSeat([FromBody] SeatEntity seat)
    {
        _context.Seats.Add(seat);
        await _context.SaveChangesAsync();
        return Created($"/api/screens/{seat.ScreenId}/seats/{seat.Id}", seat);
    }
}

[ApiController]
[Route("api/[controller]")]
public class ShowtimesController : ControllerBase
{
    private readonly CinemaDbContext _context;

    public ShowtimesController(CinemaDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShowtimeEntity>>> GetShowtimes([FromQuery] int? movieId, [FromQuery] int? screenId)
    {
        var query = _context.Showtimes.AsQueryable();

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
        var showtime = await _context.Showtimes.FindAsync(id);
        if (showtime is null)
        {
            return NotFound();
        }

        return Ok(showtime);
    }

    [HttpPost]
    public async Task<ActionResult<ShowtimeEntity>> CreateShowtime([FromBody] ShowtimeEntity showtime)
    {
        var overlaps = await _context.Showtimes.AnyAsync(x =>
            x.ScreenId == showtime.ScreenId &&
            x.Status != ShowtimeStatus.Cancelled &&
            x.StartTime < showtime.EndTime &&
            showtime.StartTime < x.EndTime);

        if (overlaps)
        {
            return Conflict(new { message = "Showtime overlaps with existing showtime in the same screen." });
        }

        _context.Showtimes.Add(showtime);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetShowtime), new { id = showtime.Id }, showtime);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateShowtime(int id, [FromBody] ShowtimeEntity request)
    {
        var showtime = await _context.Showtimes.FindAsync(id);
        if (showtime is null)
        {
            return NotFound();
        }

        var overlaps = await _context.Showtimes.AnyAsync(x =>
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
        return NoContent();
    }
}
