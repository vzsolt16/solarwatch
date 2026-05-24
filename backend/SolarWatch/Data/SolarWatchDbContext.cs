using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SolarWatch.Models;
using SolarWatch.Models.Entities;

namespace SolarWatch.Data;

public class SolarWatchDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public SolarWatchDbContext(DbContextOptions<SolarWatchDbContext> options) : base(options) { }

    public DbSet<City> Cities { get; set; }
    public DbSet<SunriseSunset> SunriseSunsets { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Must be called first so Identity tables are configured before our additions.
        base.OnModelCreating(builder);

        builder.Entity<City>()
            .HasIndex(c => new { c.Name, c.Country })
            .IsUnique();

        builder.Entity<SunriseSunset>()
            .HasIndex(s => new { s.CityId, s.Date })
            .IsUnique();
    }
}
