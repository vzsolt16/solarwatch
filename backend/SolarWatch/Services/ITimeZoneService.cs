namespace SolarWatch.Services;

public interface ITimeZoneService
{
    Task<string> GetTimeZoneIdAsync(double lat, double lon);
}