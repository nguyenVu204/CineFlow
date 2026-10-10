var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/docs/movie/swagger.json", "Movie Service");
        options.SwaggerEndpoint("/docs/cinema/swagger.json", "Cinema Service");
        options.SwaggerEndpoint("/docs/booking/swagger.json", "Booking Service");
    });
}

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "API Gateway" }));
app.MapReverseProxy();

app.Run();
