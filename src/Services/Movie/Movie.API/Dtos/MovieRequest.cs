using Movie.API.Models;

namespace Movie.API.Dtos;

public record MovieRequest(
    string Title,
    string Description,
    int DurationMinutes,
    DateTime ReleaseDate,
    string PosterUrl,
    string Genre,
    MovieStatus Status);

public record PagedMoviesResponse(
    int Total,
    int Page,
    int PageSize,
    IReadOnlyCollection<Movie.API.Models.Movie> Items);
