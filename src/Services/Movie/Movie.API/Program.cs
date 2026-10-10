using Microsoft.EntityFrameworkCore;
using Movie.API.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=.;Database=MovieDb;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();
app.UseExceptionHandler();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MovieDbContext>();
    DbInitializer.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "Movie Service" }));
app.MapControllers();

app.Run();
