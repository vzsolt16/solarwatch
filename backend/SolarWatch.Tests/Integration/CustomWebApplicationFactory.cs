using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SolarWatch.Data;
using SolarWatch.Services;

namespace SolarWatch.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly HttpMessageHandler? _externalApiHandler;
    private SqliteConnection? _connection;

    public CustomWebApplicationFactory(HttpMessageHandler? externalApiHandler = null)
    {
        _externalApiHandler = externalApiHandler;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:ValidIssuer"] = "test-issuer",
                ["Jwt:ValidAudience"] = "test-audience",
                ["Jwt:IssuerSigningKey"] = "this-is-a-test-signing-key-with-enough-length"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<SolarWatchDbContext>>();
            services.RemoveAll<DbContextOptions>();
            services.RemoveAll<IDbContextOptionsConfiguration<SolarWatchDbContext>>();
            services.RemoveAll<SolarWatchDbContext>();

            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            services.AddDbContext<SolarWatchDbContext>(options =>
                options.UseSqlite(_connection));

            if (_externalApiHandler is not null)
            {
                services.AddHttpClient<IGeocodingService, GeocodingService>()
                    .ConfigurePrimaryHttpMessageHandler(() => _externalApiHandler);

                services.AddHttpClient<ISunriseSunsetService, SunriseSunsetService>()
                    .ConfigurePrimaryHttpMessageHandler(() => _externalApiHandler);
            }
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection?.Dispose();
        }
    }
}
