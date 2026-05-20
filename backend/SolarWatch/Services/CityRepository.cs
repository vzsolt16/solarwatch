using Microsoft.EntityFrameworkCore;
using SolarWatch.Data;
using SolarWatch.Models.Entities;

namespace SolarWatch.Services.Repository;

public class CityRepository : ICityRepository
{
    private readonly SolarWatchDbContext _context;

    public CityRepository(SolarWatchDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<City>> GetAllAsync()
    {
        return await _context.Cities.ToListAsync();
    }

    public async Task<City?> GetByIdAsync(int id)
    {
        return await _context.Cities.FindAsync(id);
    }

    public async Task<City?> GetByNameAsync(string name)
    {
        return await _context.Cities
            .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
    }

    public async Task<City?> GetByCoordinatesAsync(double latitude, double longitude, double tolerance)
    {
        return await _context.Cities
            .FirstOrDefaultAsync(c =>
                Math.Abs(c.Latitude - latitude) < tolerance &&
                Math.Abs(c.Longitude - longitude) < tolerance);
    }

    public async Task<City> AddAsync(City city)
    {
        _context.Cities.Add(city);
        await _context.SaveChangesAsync();
        return city;
    }

    public async Task<City> UpdateAsync(City city)
    {
        _context.Cities.Update(city);
        await _context.SaveChangesAsync();
        return city;
    }

    public async Task DeleteAsync(int id)
    {
        var city = await _context.Cities.FindAsync(id);
        if (city is not null)
        {
            _context.Cities.Remove(city);
            await _context.SaveChangesAsync();
        }
    }
}