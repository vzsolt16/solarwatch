namespace SolarWatch.Services;

using System.Text.Json;
using Microsoft.Extensions.Logging;
using SolarWatch.Models;

public class SunriseSunsetService : ISunriseSunsetService
{
    private readonly HttpClient _httpClient;
    private readonly IGeocodingService _geocodingService;
    private readonly ILogger<SunriseSunsetService> _logger;

    public SunriseSunsetService(
        HttpClient httpClient,
        IGeocodingService geocodingService,
        ILogger<SunriseSunsetService> logger)
    {
        _httpClient = httpClient;
        _geocodingService = geocodingService;
        _logger = logger;
    }

    public async Task<SolarResult> GetSolarDataAsync(string city, DateTime date, bool utc)
    {
        _logger.LogInformation("Fetching solar data for {City} on {Date}", city, date);

        var location = await _geocodingService.GetCoordinatesAsync(city);

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

        var sunriseUtc = DateTime.Parse(apiResponse.Results.Sunrise);
        var sunsetUtc = DateTime.Parse(apiResponse.Results.Sunset);

        DateTime sunrise = utc
            ? sunriseUtc
            : sunriseUtc.ToLocalTime();

        DateTime sunset = utc
            ? sunsetUtc
            : sunsetUtc.ToLocalTime();

        _logger.LogInformation("Sunrise: {Sunrise}, Sunset: {Sunset}", sunrise, sunset);

        return new SolarResult
        {
            City = city,
            Date = date,
            Sunrise = sunrise,
            Sunset = sunset,
            Timezone = utc ? "UTC" : "Local"
        };
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