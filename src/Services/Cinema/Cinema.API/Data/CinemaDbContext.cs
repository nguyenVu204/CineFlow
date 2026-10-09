using CinemaEntity = Cinema.API.Models.Cinema;
using ScreenEntity = Cinema.API.Models.Screen;
using SeatEntity = Cinema.API.Models.Seat;
using ShowtimeEntity = Cinema.API.Models.Showtime;
using Microsoft.EntityFrameworkCore;

namespace Cinema.API.Data;

public class CinemaDbContext : DbContext
{
    public CinemaDbContext(DbContextOptions<CinemaDbContext> options) : base(options)
    {
    }

    public DbSet<CinemaEntity> Cinemas => Set<CinemaEntity>();
    public DbSet<ScreenEntity> Screens => Set<ScreenEntity>();
    public DbSet<SeatEntity> Seats => Set<SeatEntity>();
    public DbSet<ShowtimeEntity> Showtimes => Set<ShowtimeEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CinemaEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Address).IsRequired().HasMaxLength(500);
            entity.Property(x => x.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<ScreenEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(x => new { x.CinemaId, x.Name }).IsUnique();
        });

        modelBuilder.Entity<SeatEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Row).IsRequired().HasMaxLength(10);
            entity.Property(x => x.Column).IsRequired().HasMaxLength(10);
            entity.Property(x => x.SeatNumber).IsRequired().HasMaxLength(20);
            entity.HasIndex(x => new { x.ScreenId, x.SeatNumber }).IsUnique();
        });

        modelBuilder.Entity<ShowtimeEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.BasePrice).HasColumnType("decimal(18,2)");
            entity.HasIndex(x => new { x.ScreenId, x.StartTime, x.EndTime });
            entity.HasIndex(x => x.MovieId);
        });
    }
}
