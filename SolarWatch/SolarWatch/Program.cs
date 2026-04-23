using Microsoft.EntityFrameworkCore;
using SolarWatch.Data;
using SolarWatch.Services;
using SolarWatch.Models;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register HttpClients
builder.Services.AddHttpClient<IGeocodingService, GeocodingService>();
builder.Services.AddHttpClient<ISunriseSunsetService, SunriseSunsetService>();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// sql
builder.Services.AddDbContext<SolarWatchDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();