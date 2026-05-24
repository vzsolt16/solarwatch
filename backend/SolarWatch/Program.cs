using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SolarWatch.Data;
using SolarWatch.Models.Entities;
using SolarWatch.Services;
using SolarWatch.Services.Authentication;
using SolarWatch.Services.Repository;

var builder = WebApplication.CreateBuilder(args);

AddServices();
ConfigureSwagger();
AddDbContexts();
AddAuthentication();
AddIdentity();

var app = builder.Build();

app.UseForwardedHeaders();

await ApplyMigrationsAsync();
await SeedRolesAsync();

//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// ---------------------------------------------------------------------------
// Service registration helpers
// ---------------------------------------------------------------------------

void AddServices()
{
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddCors(options =>
    {
        var frontendOrigins =
            builder.Configuration["AllowedOrigins"]?
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? ["http://localhost:5173"];

        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(frontendOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    // Typed HttpClient avoids socket exhaustion from new HttpClient() per call.
    builder.Services.AddHttpClient<IGeocodingService, GeocodingService>();
    builder.Services.AddHttpClient<ISunriseSunsetService, SunriseSunsetService>();
    builder.Services.AddHttpClient<ITimeZoneService, TimeZoneService>();

    builder.Services.AddScoped<ICityRepository, CityRepository>();

    // Scoped because UserManager (a dependency) is scoped.
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<AuthenticationSeeder>();
    
    // Rate limiting 
    builder.Services.AddRateLimiter(options =>
    {
        // Global limit for all endpoints
        options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
            httpContext =>
            {
                var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ip,
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    });
            });

        // Strict auth policy
        options.AddPolicy("AuthPolicy", httpContext =>
        {
            var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            return RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: ip,
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0
                });
        });

        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    });
    
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders =
            ForwardedHeaders.XForwardedFor |
            ForwardedHeaders.XForwardedProto;

        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
    });
}

void ConfigureSwagger()
{
    builder.Services.AddSwaggerGen(option =>
    {
        option.SwaggerDoc("v1", new OpenApiInfo { Title = "SolarWatch API", Version = "v1" });
        option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            In          = ParameterLocation.Header,
            Description = "Please enter a valid token",
            Name        = "Authorization",
            Type        = SecuritySchemeType.Http,
            BearerFormat = "JWT",
            Scheme      = "Bearer"
        });
        // .NET 10 Swashbuckle style for AddSecurityRequirement:
        option.AddSecurityRequirement(document => new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
        });
    });
}

void AddDbContexts()
{
    builder.Services.AddDbContext<SolarWatchDbContext>(options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is missing from configuration.")));
}

void AddAuthentication()
{
    var validIssuer = builder.Configuration["Jwt:ValidIssuer"]
                      ?? throw new InvalidOperationException("Jwt:ValidIssuer is missing.");
    var validAudience = builder.Configuration["Jwt:ValidAudience"]
                        ?? throw new InvalidOperationException("Jwt:ValidAudience is missing.");
    var issuerSigningKey = builder.Configuration["Jwt:IssuerSigningKey"]
                           ?? (builder.Environment.IsEnvironment("Testing")
                               ? "this-is-a-test-signing-key-with-enough-length"
                               : throw new InvalidOperationException(
                                   "Jwt:IssuerSigningKey is missing. " +
                                   "Set it via: dotnet user-secrets set \"Jwt:IssuerSigningKey\" \"<secret>\""));

    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ClockSkew             = TimeSpan.Zero,
                ValidateIssuer        = true,
                ValidateAudience      = true,
                ValidateLifetime      = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer           = validIssuer,
                ValidAudience         = validAudience,
                IssuerSigningKey      = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(issuerSigningKey))
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    context.Token = context.Request.Cookies["accessToken"];
                    return Task.CompletedTask;
                }
            };
        });
}

void AddIdentity()
{
    builder.Services
        .AddIdentityCore<ApplicationUser>(options =>
        {
            options.Password.RequireDigit           = true;
            options.Password.RequiredLength         = 8;
            options.Password.RequireLowercase       = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase       = true;
            options.User.RequireUniqueEmail         = true;
        })
        .AddRoles<IdentityRole>()               // must come before AddEntityFrameworkStores
        .AddEntityFrameworkStores<SolarWatchDbContext>();
}

// ---------------------------------------------------------------------------
// Startup tasks — run after builder.Build(), before app.Run()
// ---------------------------------------------------------------------------

async Task SeedRolesAsync()
{
    using var scope  = app.Services.CreateScope();
    var seeder       = scope.ServiceProvider.GetRequiredService<AuthenticationSeeder>();
    await seeder.SeedRolesAsync();
}

async Task ApplyMigrationsAsync()
{
    using var scope  = app.Services.CreateScope();
    var context      = scope.ServiceProvider.GetRequiredService<SolarWatchDbContext>();
    if (app.Environment.IsEnvironment("Testing"))
    {
        await context.Database.EnsureCreatedAsync();
        return;
    }

    await context.Database.MigrateAsync();
}

public partial class Program;
