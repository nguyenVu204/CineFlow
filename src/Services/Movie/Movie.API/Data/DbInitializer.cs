using MovieEntity = Movie.API.Models.Movie;
using MovieStatus = Movie.API.Models.MovieStatus;

namespace Movie.API.Data;

public static class DbInitializer
{
    public static void Seed(MovieDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Movies.Any())
        {
            return;
        }

        var movies = new[]
        {
            new MovieEntity
            {
                Title = "Dune: Part Two",
                Description = "Paul Atreides continues his epic journey across the desert.",
                DurationMinutes = 166,
                ReleaseDate = new DateTime(2024, 3, 1),
                PosterUrl = "https://images.example.com/dune.jpg",
                Genre = "Sci-Fi",
                Status = MovieStatus.NowShowing
            },
            new MovieEntity
            {
                Title = "Inside Out 2",
                Description = "Riley's emotions face new adventures in adolescence.",
                DurationMinutes = 96,
                ReleaseDate = new DateTime(2024, 6, 14),
                PosterUrl = "https://images.example.com/insideout.jpg",
                Genre = "Animation",
                Status = MovieStatus.NowShowing
            },
            new MovieEntity
            {
                Title = "The Batman",
                Description = "Batman investigates a conspiracy in Gotham City.",
                DurationMinutes = 176,
                ReleaseDate = new DateTime(2022, 3, 4),
                PosterUrl = "https://images.example.com/batman.jpg",
                Genre = "Action",
                Status = MovieStatus.Ended
            },
            new MovieEntity
            {
                Title = "Wonka",
                Description = "The magical story behind the world-famous chocolatier.",
                DurationMinutes = 116,
                ReleaseDate = new DateTime(2023, 12, 15),
                PosterUrl = "https://images.example.com/wonka.jpg",
                Genre = "Fantasy",
                Status = MovieStatus.Ended
            },
            new MovieEntity
            {
                Title = "The Wild Robot",
                Description = "A robot learns to live in the wilderness.",
                DurationMinutes = 102,
                ReleaseDate = new DateTime(2024, 9, 27),
                PosterUrl = "https://images.example.com/wildrobot.jpg",
                Genre = "Adventure",
                Status = MovieStatus.ComingSoon
            }
        };

        context.Movies.AddRange(movies);
        context.SaveChanges();
    }
}
