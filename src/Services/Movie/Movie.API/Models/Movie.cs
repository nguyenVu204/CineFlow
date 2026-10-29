namespace Movie.API.Models;

public enum MovieStatus
{
    ComingSoon,
    NowShowing,
    Ended
}

public class Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string OriginalTitle { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public DateTime ReleaseDate { get; set; }
    public string PosterUrl { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public MovieStatus Status { get; set; }
    public double Rating { get; set; } = 9.0;
    public string AgeRating { get; set; } = "C16";
    public string Director { get; set; } = string.Empty;
    public string Cast { get; set; } = string.Empty;
    public string Formats { get; set; } = "2D Phụ Đề,IMAX Laser";
    public string BackdropUrl { get; set; } = string.Empty;
    public string TrailerUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
