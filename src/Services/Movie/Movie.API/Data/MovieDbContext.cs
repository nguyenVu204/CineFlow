using Microsoft.EntityFrameworkCore;
using MovieEntity = Movie.API.Models.Movie;

namespace Movie.API.Data;

public class MovieDbContext : DbContext
{
    public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options)
    {
    }

    public DbSet<MovieEntity> Movies => Set<MovieEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MovieEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Description).IsRequired().HasMaxLength(2000);
            entity.Property(x => x.PosterUrl).HasMaxLength(500);
            entity.Property(x => x.Genre).IsRequired().HasMaxLength(100);
            entity.HasIndex(x => x.Genre);
            entity.HasIndex(x => x.Status);
        });
    }
}
