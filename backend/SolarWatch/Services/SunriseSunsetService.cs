using Microsoft.EntityFrameworkCore;
using SolarWatch.Data;
using SolarWatch.Models.Entities;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SolarWatch.Models;

namespace SolarWatch.Services;


public class SunriseSunsetService : ISunriseSunsetService
{
    private readonly HttpClient _httpClient;
    private readonly IGeocodingService _geocodingService;
    private readonly ILogger<SunriseSunsetService> _logger;
    private readonly SolarWatchDbContext _dbContext;

    public SunriseSunsetService(
        HttpClient httpClient,
        IGeocodingService geocodingService,
        ILogger<SunriseSunsetService> logger,
        SolarWatchDbContext dbContext)
    {
        _httpClient = httpClient;
        _geocodingService = geocodingService;
        _logger = logger;
        _dbContext = dbContext;
    }

    public async Task<SolarResult> GetSolarDataAsync(string city, DateTime date, bool utc)
    {
        _logger.LogInformation("Fetching solar data for {City} on {Date}", city, date);

        var location = await _geocodingService.GetCoordinatesAsync(city);

        // Check DB first (JOIN City + filter by date)
        var cityEntity = await _dbContext.Cities
            .FirstOrDefaultAsync(c => c.Name.ToLower() == city.ToLower());

        if (cityEntity != null)
        {
            var existing = await _dbContext.SunriseSunsets
                .FirstOrDefaultAsync(s =>
                    s.CityId == cityEntity.Id &&
                    s.Date.Date == date.Date);

            if (existing != null)
            {
                _logger.LogInformation("Returning cached solar data from DB");

                var cachedSunriseUtc = AsUtc(existing.Sunrise);
                var cachedSunsetUtc = AsUtc(existing.Sunset);

                return new SolarResult
                {
                    City = city,
                    Date = date,
                    Sunrise = utc ? cachedSunriseUtc : cachedSunriseUtc.ToLocalTime(),
                    Sunset = utc ? cachedSunsetUtc : cachedSunsetUtc.ToLocalTime(),
                    Timezone = utc ? "UTC" : "Local"
                };
            }
        }

        // Call external API if not found
        var formattedDate = date.ToString("yyyy-MM-dd");

        var url =
            $"https://api.sunrise-sunset.org/json?lat={location.Latitude}&lng={location.Longitude}&date={formattedDate}&formatted=0";

        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Sunrise-Sunset API failed with status: {StatusCode}", response.StatusCode);
            throw new Exception("Error calling Sunrise-Sunset API.");
        }

        var content = await response.Content.ReadAsStringAsync();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var apiResponse =
            JsonSerializer.Deserialize<SunriseSunsetApiResponse>(content, options);

        if (apiResponse?.Results == null)
        {
            _logger.LogError("Invalid response from Sunrise-Sunset API.");
            throw new Exception("Invalid Sunrise-Sunset API response.");
        }

        var sunriseUtc = ParseApiUtc(apiResponse.Results.Sunrise);
        var sunsetUtc = ParseApiUtc(apiResponse.Results.Sunset);

        var sunrise = utc ? sunriseUtc : sunriseUtc.ToLocalTime();
        var sunset = utc ? sunsetUtc : sunsetUtc.ToLocalTime();

        // Save to DB
        if (cityEntity != null)
        {
            var newRecord = new SunriseSunset
            {
                CityId = cityEntity.Id,
                Date = date.Date,
                Sunrise = sunriseUtc,
                Sunset = sunsetUtc,
                Timezone = "UTC"
            };

            _dbContext.SunriseSunsets.Add(newRecord);
            await _dbContext.SaveChangesAsync();
        }

        _logger.LogInformation("Saved solar data to DB");

        return new SolarResult
        {
            City = city,
            Date = date,
            Sunrise = sunrise,
            Sunset = sunset,
            Timezone = utc ? "UTC" : "Local"
        };
    }

    private static DateTime ParseApiUtc(string value) =>
        DateTimeOffset.Parse(value).UtcDateTime;

    private static DateTime AsUtc(DateTime value) =>
        value.Kind == DateTimeKind.Utc
            ? value
            : DateTime.SpecifyKind(value, DateTimeKind.Utc);

    private class SunriseSunsetApiResponse
    {
        public SunriseSunsetResults Results { get; set; }
    }

    private class SunriseSunsetResults
    {
        public string Sunrise { get; set; }
        public string Sunset { get; set; }
    }
}
