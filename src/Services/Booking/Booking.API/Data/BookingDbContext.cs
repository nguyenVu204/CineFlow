using Booking.API.Models;
using BookingEntity = Booking.API.Models.Booking;
using Microsoft.EntityFrameworkCore;

namespace Booking.API.Data;

public class BookingDbContext : DbContext
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options)
    {
    }

    public DbSet<ShowtimeSeat> ShowtimeSeats => Set<ShowtimeSeat>();
    public DbSet<BookingEntity> Bookings => Set<BookingEntity>();
    public DbSet<BookingItem> BookingItems => Set<BookingItem>();
    public DbSet<BookingConcessionItem> BookingConcessionItems => Set<BookingConcessionItem>();
    public DbSet<Concession> Concessions => Set<Concession>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShowtimeSeat>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Price).HasColumnType("decimal(18,2)");
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasIndex(x => new { x.ShowtimeId, x.SeatId }).IsUnique();
            entity.HasIndex(x => x.ShowtimeId);
            entity.HasIndex(x => x.HoldExpiresAt);
        });

        modelBuilder.Entity<BookingEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.BookingCode).IsRequired().HasMaxLength(50);
            entity.HasIndex(x => x.BookingCode).IsUnique();
            entity.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(x => x.DiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(x => x.CustomerName).HasMaxLength(100);
            entity.Property(x => x.CustomerPhone).HasMaxLength(30);
            entity.Property(x => x.PaymentMethod).HasMaxLength(50);
            entity.Property(x => x.PromoCode).HasMaxLength(50);
            entity.HasIndex(x => new { x.UserId, x.CreatedAt });
        });

        modelBuilder.Entity<BookingItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.SeatNumber).IsRequired().HasMaxLength(20);
            entity.Property(x => x.Price).HasColumnType("decimal(18,2)");
            entity.HasOne(x => x.Booking)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BookingConcessionItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ConcessionName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            entity.HasOne(x => x.Booking)
                .WithMany(x => x.Concessions)
                .HasForeignKey(x => x.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Concession>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Description).HasMaxLength(500);
            entity.Property(x => x.Price).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Icon).HasMaxLength(50);
            entity.Property(x => x.ImageUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Code).IsRequired().HasMaxLength(50);
            entity.HasIndex(x => x.Code).IsUnique();
            entity.Property(x => x.Title).IsRequired().HasMaxLength(200);
            entity.Property(x => x.DiscountType).IsRequired().HasMaxLength(20);
            entity.Property(x => x.DiscountValue).HasColumnType("decimal(18,2)");
            entity.Property(x => x.MinOrderValue).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TransactionId).IsRequired().HasMaxLength(64);
            entity.HasIndex(x => x.TransactionId).IsUnique();
            entity.Property(x => x.PaymentMethod).IsRequired().HasMaxLength(50);
            entity.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Status).IsRequired().HasMaxLength(30);
            entity.Property(x => x.PaymentUrl).HasMaxLength(500);
            entity.Property(x => x.QrCodeUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<IdempotencyRecord>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Key).IsRequired().HasMaxLength(200);
            entity.Property(x => x.UserId).IsRequired().HasMaxLength(100);
            entity.Property(x => x.RequestHash).IsRequired().HasMaxLength(500);
            entity.Property(x => x.Response).HasMaxLength(4000);
            entity.HasIndex(x => x.Key).IsUnique();
        });

        modelBuilder.Entity<OutboxMessage>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Type).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Payload).IsRequired().HasMaxLength(2000);
            entity.HasIndex(x => x.ProcessedAt);
        });
    }
}
