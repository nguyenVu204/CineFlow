using Movie.API.Models;

namespace Movie.API.Dtos;

public record MovieRequest(
    string Title,
    string Description,
    int DurationMinutes,
    DateTime ReleaseDate,
    string PosterUrl,
    string Genre,
    MovieStatus Status,
    string? OriginalTitle = null,
    double? Rating = null,
    string? AgeRating = null,
    string? Director = null,
    string? Cast = null,
    string? Formats = null,
    string? BackdropUrl = null,
    string? TrailerUrl = null);

public record PagedMoviesResponse(
    int Total,
    int Page,
    int PageSize,
    IReadOnlyCollection<Movie.API.Models.Movie> Items);
