namespace SolarWatch.Services;

using SolarWatch.Models;

public interface ISunriseSunsetService
{
    Task<SolarResult> GetSolarDataAsync(string city, DateTime date, bool utc);
}