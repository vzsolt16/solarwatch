namespace SolarWatch.Services;

using SolarWatch.Models;

public interface IGeocodingService
{
    Task<Location> GetCoordinatesAsync(string city);
}