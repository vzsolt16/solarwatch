using Microsoft.EntityFrameworkCore;
using SolarWatch.Data;
using SolarWatch.Models.Entities;

namespace SolarWatch.Services;

using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SolarWatch.Models;
using SolarWatch.Exceptions;

public class GeocodingService : IGeocodingService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeocodingService> _logger;
    private readonly SolarWatchDbContext _dbContext;

    public GeocodingService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GeocodingService> logger,
        SolarWatchDbContext dbContext)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _dbContext = dbContext;
    }

    public async Task<Location> GetCoordinatesAsync(string city)
    {
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City cannot be empty.");

        // Check if city exists in DB
        var existingCity = await _dbContext.Cities
            .FirstOrDefaultAsync(c => c.Name.ToLower() == city.ToLower());

        if (existingCity != null)
        {
            _logger.LogInformation("City found in database: {City}", city);

            return new Location
            {
                Latitude = existingCity.Latitude,
                Longitude = existingCity.Longitude
            };
        }
        
        var apiKey = _configuration["OpenWeather:ApiKey"];
        var url =
            $"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={apiKey}";

        _logger.LogInformation("Calling OpenWeather Geocoding API for city: {City}", city);

        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Geocoding API failed with status: {StatusCode}", response.StatusCode);
            throw new Exception("Error calling Geocoding API.");
        }

        var content = await response.Content.ReadAsStringAsync();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var locations = JsonSerializer.Deserialize<List<OpenWeatherGeoResponse>>(content, options);

        if (locations == null || !locations.Any())
        {
            _logger.LogWarning("City not found: {City}", city);
            throw new CityNotFoundException(city);
        }

        var location = locations.First();

        _logger.LogInformation("Coordinates found: {Lat}, {Lon}", location.Lat, location.Lon);
        
        // Save to DB
        var cityEntity = new City
        {
            Name = city,
            Latitude = location.Lat,
            Longitude = location.Lon,
            State = null,
            Country = "Unknown" // (you can improve later)
        };
        _dbContext.Cities.Add(cityEntity);
        await _dbContext.SaveChangesAsync();

        return new Location
        {
            Latitude = location.Lat,
            Longitude = location.Lon
        };
    }

    private class OpenWeatherGeoResponse
    {
        public double Lat { get; set; }
        public double Lon { get; set; }
    }
}