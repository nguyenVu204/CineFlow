using Cinema.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();
builder.Services.AddHttpClient("BookingService", client =>
{
    var address = builder.Configuration["BookingService:BaseUrl"] ?? "http://localhost:5003/";
    client.BaseAddress = new Uri(address);
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=.;Database=CinemaDb;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<CinemaDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();
app.UseExceptionHandler();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CinemaDbContext>();
    DbInitializer.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "Cinema Service" }));
app.MapControllers();

app.Run();
