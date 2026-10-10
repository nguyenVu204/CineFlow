using Booking.API.BackgroundServices;
using Booking.API.Data;
using Booking.API.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=.;Database=BookingDb;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<BookingDbContext>(options =>
    options.UseSqlServer(connectionString));

var redisConnection = builder.Configuration["Redis:Configuration"] ?? "localhost:6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConnection));
builder.Services.AddSingleton<RedisLockService>();

builder.Services.AddSingleton<IRabbitMqPublisher, RabbitMqPublisher>();
builder.Services.AddHostedService<SeatReleaseBackgroundService>();
builder.Services.AddHostedService<OutboxProcessorBackgroundService>();

var app = builder.Build();
app.UseExceptionHandler();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
    DbInitializer.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "Booking Service" }));
app.MapControllers();

app.Run();
