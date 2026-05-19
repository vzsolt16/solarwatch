using System.Text.Json;
using System.Globalization;

namespace SolarWatch.Services;

public class TimeZoneService : ITimeZoneService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public TimeZoneService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    public async Task<string> GetTimeZoneIdAsync(double lat, double lon)
    {
        var key = _config["TimeZoneDb:ApiKey"];

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException("TimeZoneDB API key is missing. Configure TimeZoneDb:ApiKey in user secrets or appsettings.");
        }

        var latitude = lat.ToString(CultureInfo.InvariantCulture);
        var longitude = lon.ToString(CultureInfo.InvariantCulture);

        var url =
            $"https://api.timezonedb.com/v2.1/get-time-zone?key={key}&format=json&by=position&lat={latitude}&lng={longitude}";

        var json = await _httpClient.GetStringAsync(url);

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (root.TryGetProperty("status", out var statusElement) &&
            !string.Equals(statusElement.GetString(), "OK", StringComparison.OrdinalIgnoreCase))
        {
            var message = root.TryGetProperty("message", out var messageElement)
                ? messageElement.GetString()
                : "No error message returned.";

            throw new InvalidOperationException($"TimeZoneDB request failed: {message}");
        }

        var zoneName = root.TryGetProperty("zoneName", out var zoneNameElement)
            ? zoneNameElement.GetString()
            : null;

        if (string.IsNullOrWhiteSpace(zoneName))
        {
            throw new InvalidOperationException("Time zone provider returned an empty zoneName.");
        }

        return zoneName;
    }
}
