using SolarWatch.Models.Entities;

namespace SolarWatch.Services.Repository;

public interface ICityRepository
{
    Task<IEnumerable<City>> GetAllAsync();
    Task<City?> GetByIdAsync(int id);
    Task<City?> GetByNameAsync(string name);
    Task<City?> GetByCoordinatesAsync(double latitude, double longitude, double tolerance);
    Task<City> AddAsync(City city);
    Task<City> UpdateAsync(City city);
    Task DeleteAsync(int id);
}