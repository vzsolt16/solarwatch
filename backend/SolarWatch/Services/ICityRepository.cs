using SolarWatch.Models.Entities;

namespace SolarWatch.Services.Repository;

public interface ICityRepository
{
    Task<IEnumerable<City>> GetAllAsync();
    Task<City?> GetByIdAsync(int id);
    Task<City> AddAsync(City city);
    Task<City> UpdateAsync(City city);
    Task DeleteAsync(int id);
}