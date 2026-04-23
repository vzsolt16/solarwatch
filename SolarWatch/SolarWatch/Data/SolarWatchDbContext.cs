using Microsoft.EntityFrameworkCore;
using SolarWatch.Models.Entities;

namespace SolarWatch.Data;

public class SolarWatchDbContext : DbContext
{
    public SolarWatchDbContext(DbContextOptions<SolarWatchDbContext> options)
        : base(options)
    {
    }

    public DbSet<City> Cities { get; set; }

    public DbSet<SunriseSunset> SunriseSunsets { get; set; }
}