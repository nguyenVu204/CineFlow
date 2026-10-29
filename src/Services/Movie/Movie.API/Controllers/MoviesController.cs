using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Movie.API.Dtos;
using Movie.API.Data;
using MovieStatus = Movie.API.Models.MovieStatus;
using MovieEntity = Movie.API.Models.Movie;

namespace Movie.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly MovieDbContext _context;

    public MoviesController(MovieDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PagedMoviesResponse>> GetMovies(
        [FromQuery] string? search,
        [FromQuery] string? genre,
        [FromQuery] MovieStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1 || pageSize is < 1 or > 100)
        {
            return BadRequest(new { message = "Page must be at least 1 and pageSize must be between 1 and 100." });
        }

        if (status.HasValue && !Enum.IsDefined(status.Value))
        {
            return BadRequest(new { message = "Status is invalid." });
        }

        var query = _context.Movies.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(m => m.Title.Contains(search) || m.Description.Contains(search) || m.OriginalTitle.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(genre))
        {
            query = query.Where(m => m.Genre == genre);
        }

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.ReleaseDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedMoviesResponse(total, page, pageSize, items));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MovieEntity>> GetMovie(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie is null)
        {
            return NotFound();
        }

        return Ok(movie);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MovieEntity>> CreateMovie([FromBody] MovieRequest request)
    {
        var validationError = ValidateMovie(request);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var movie = new MovieEntity
        {
            Title = request.Title.Trim(),
            OriginalTitle = request.OriginalTitle?.Trim() ?? request.Title.Trim(),
            Description = request.Description.Trim(),
            DurationMinutes = request.DurationMinutes,
            ReleaseDate = request.ReleaseDate,
            PosterUrl = request.PosterUrl?.Trim() ?? string.Empty,
            Genre = request.Genre.Trim(),
            Status = request.Status,
            Rating = request.Rating ?? 9.0,
            AgeRating = string.IsNullOrWhiteSpace(request.AgeRating) ? "C16" : request.AgeRating.Trim(),
            Director = request.Director?.Trim() ?? string.Empty,
            Cast = request.Cast?.Trim() ?? string.Empty,
            Formats = string.IsNullOrWhiteSpace(request.Formats) ? "2D Phụ Đề,IMAX Laser" : request.Formats.Trim(),
            BackdropUrl = request.BackdropUrl?.Trim() ?? string.Empty,
            TrailerUrl = request.TrailerUrl?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };
        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, movie);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateMovie(int id, [FromBody] MovieRequest request)
    {
        var validationError = ValidateMovie(request);
        if (validationError is not null)
        {
            return BadRequest(new { message = validationError });
        }

        var movie = await _context.Movies.FindAsync(id);
        if (movie is null)
        {
            return NotFound();
        }

        movie.Title = request.Title.Trim();
        if (request.OriginalTitle != null) movie.OriginalTitle = request.OriginalTitle.Trim();
        movie.Description = request.Description.Trim();
        movie.DurationMinutes = request.DurationMinutes;
        movie.ReleaseDate = request.ReleaseDate;
        movie.PosterUrl = request.PosterUrl?.Trim() ?? string.Empty;
        movie.Genre = request.Genre.Trim();
        movie.Status = request.Status;
        if (request.Rating.HasValue) movie.Rating = request.Rating.Value;
        if (!string.IsNullOrWhiteSpace(request.AgeRating)) movie.AgeRating = request.AgeRating.Trim();
        if (request.Director != null) movie.Director = request.Director.Trim();
        if (request.Cast != null) movie.Cast = request.Cast.Trim();
        if (!string.IsNullOrWhiteSpace(request.Formats)) movie.Formats = request.Formats.Trim();
        if (request.BackdropUrl != null) movie.BackdropUrl = request.BackdropUrl.Trim();
        if (request.TrailerUrl != null) movie.TrailerUrl = request.TrailerUrl.Trim();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie is null)
        {
            return NotFound();
        }

        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static string? ValidateMovie(MovieRequest movie)
    {
        if (string.IsNullOrWhiteSpace(movie.Title) || movie.Title.Trim().Length > 200)
        {
            return "Title is required and must not exceed 200 characters.";
        }

        if (movie.Description is null || movie.Description.Length > 2000)
        {
            return "Description must not exceed 2000 characters.";
        }

        if (movie.DurationMinutes <= 0)
        {
            return "DurationMinutes must be greater than zero.";
        }

        if (movie.PosterUrl?.Length > 500)
        {
            return "PosterUrl must not exceed 500 characters.";
        }

        if (string.IsNullOrWhiteSpace(movie.Genre) || movie.Genre.Trim().Length > 100)
        {
            return "Genre is required and must not exceed 100 characters.";
        }

        if (!Enum.IsDefined(movie.Status))
        {
            return "Status is invalid.";
        }

        return null;
    }
}
