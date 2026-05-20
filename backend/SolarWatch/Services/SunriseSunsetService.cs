using Microsoft.EntityFrameworkCore;
using SolarWatch.Models.Entities;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SolarWatch.Models;
using System.Globalization;
using SolarWatch.Services.Repository;
using SolarWatch.Data;

namespace SolarWatch.Services;


public class SunriseSunsetService : ISunriseSunsetService
{
    private const double CoordinateTolerance = 0.0001;

    private readonly HttpClient _httpClient;
    private readonly IGeocodingService _geocodingService;
    private readonly ITimeZoneService _timeZoneService;
    private readonly ILogger<SunriseSunsetService> _logger;
    private readonly SolarWatchDbContext _dbContext;
    private readonly ICityRepository _cityRepository;

    public SunriseSunsetService(
        HttpClient httpClient,
        IGeocodingService geocodingService,
        ITimeZoneService timeZoneService,
        ILogger<SunriseSunsetService> logger,
        SolarWatchDbContext dbContext,
        ICityRepository cityRepository)
    {
        _httpClient = httpClient;
        _geocodingService = geocodingService;
        _timeZoneService = timeZoneService;
        _logger = logger;
        _dbContext = dbContext;
        _cityRepository = cityRepository;
    }

    public async Task<SolarResult> GetSolarDataAsync(string city, DateTime date, bool utc)
    {
        _logger.LogInformation("Fetching solar data for {City} on {Date}", city, date);

        var location = await _geocodingService.GetCoordinatesAsync(city);

        // Check DB first (JOIN City + filter by date)
        var cityEntity = await _cityRepository.GetByNameAsync(city) ??
                         await _cityRepository.GetByCoordinatesAsync(location.Latitude, location.Longitude,
                             CoordinateTolerance);

        var timeZoneId = await GetCachedTimeZoneIdAsync(cityEntity, location);
        var timeZoneInfo = GetTimeZoneInfo(timeZoneId);
        var localCalculationTime = GetLocalCalculationTime(date, timeZoneInfo);
        var solarPosition = SolarCalculator.GetSolarPosition(
            localCalculationTime,
            location.Latitude,
            location.Longitude,
            timeZoneInfo.GetUtcOffset(localCalculationTime).TotalMinutes
        );

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
                    Sunrise = utc ? cachedSunriseUtc : ConvertUtcToTimeZone(cachedSunriseUtc, timeZoneInfo),
                    Sunset = utc ? cachedSunsetUtc : ConvertUtcToTimeZone(cachedSunsetUtc, timeZoneInfo),
                    Timezone = utc ? "UTC" : timeZoneId,
                    SolarPosition = solarPosition
                };
            }
        }

        // Call external API if not found
        var formattedDate = date.ToString("yyyy-MM-dd");
        var latitude = location.Latitude.ToString(CultureInfo.InvariantCulture);
        var longitude = location.Longitude.ToString(CultureInfo.InvariantCulture);

        var url =
            $"https://api.sunrise-sunset.org/json?lat={latitude}&lng={longitude}&date={formattedDate}&formatted=0";

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

        var sunrise = utc ? sunriseUtc : ConvertUtcToTimeZone(sunriseUtc, timeZoneInfo);
        var sunset = utc ? sunsetUtc : ConvertUtcToTimeZone(sunsetUtc, timeZoneInfo);

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
            Timezone = utc ? "UTC" : timeZoneId,
            SolarPosition = solarPosition
        };
    }

    private async Task<string> GetCachedTimeZoneIdAsync(City? cityEntity, Location location)
    {
        if (cityEntity != null &&
            CoordinatesMatch(cityEntity, location) &&
            !string.IsNullOrWhiteSpace(cityEntity.TimeZoneId))
        {
            return cityEntity.TimeZoneId;
        }

        var timeZoneId = await _timeZoneService.GetTimeZoneIdAsync(location.Latitude, location.Longitude);

        if (cityEntity != null && CoordinatesMatch(cityEntity, location))
        {
            cityEntity.TimeZoneId = timeZoneId;
            await _cityRepository.UpdateAsync(cityEntity);
        }

        return timeZoneId;
    }

    private static bool CoordinatesMatch(City cityEntity, Location location) =>
        Math.Abs(cityEntity.Latitude - location.Latitude) < CoordinateTolerance &&
        Math.Abs(cityEntity.Longitude - location.Longitude) < CoordinateTolerance;

    private static DateTime ConvertUtcToTimeZone(DateTime utcDateTime, TimeZoneInfo timeZoneInfo) =>
        TimeZoneInfo.ConvertTimeFromUtc(AsUtc(utcDateTime), timeZoneInfo);

    private static TimeZoneInfo GetTimeZoneInfo(string timeZoneId)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch (TimeZoneNotFoundException ex)
        {
            throw new InvalidOperationException($"Unknown time zone returned by provider: {timeZoneId}", ex);
        }
        catch (InvalidTimeZoneException ex)
        {
            throw new InvalidOperationException($"Invalid time zone returned by provider: {timeZoneId}", ex);
        }
    }

    private static DateTime ParseApiUtc(string value) =>
        DateTimeOffset.Parse(value).UtcDateTime;

    private static DateTime AsUtc(DateTime value) =>
        value.Kind == DateTimeKind.Utc
            ? value
            : DateTime.SpecifyKind(value, DateTimeKind.Utc);

    private static DateTime GetLocalCalculationTime(DateTime selectedDate, TimeZoneInfo timeZoneInfo)
    {
        var cityNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneInfo);

        return new DateTime(
            selectedDate.Year,
            selectedDate.Month,
            selectedDate.Day,
            cityNow.Hour,
            cityNow.Minute,
            cityNow.Second,
            DateTimeKind.Unspecified
        );
    }

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
