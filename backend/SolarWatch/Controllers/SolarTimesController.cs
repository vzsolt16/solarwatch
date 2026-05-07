using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SolarWatch.Models;
using SolarWatch.Services;
using SolarWatch.Services.Authentication;

namespace SolarWatch.Controllers;

[ApiController]
[Route("api/solar-times")]
public class SolarTimesController : ControllerBase
{
    private readonly ISunriseSunsetService _sunriseSunsetService;
    private readonly ILogger<SolarTimesController> _logger;

    public SolarTimesController(
        ISunriseSunsetService sunriseSunsetService,
        ILogger<SolarTimesController> logger)
    {
        _sunriseSunsetService = sunriseSunsetService;
        _logger = logger;
    }

    // User + Admin
    [HttpGet]
    [Authorize(Roles = $"{Roles.User}, {Roles.Admin}")]
    public async Task<ActionResult<SolarResult>> Get(
        [FromQuery] string city,
        [FromQuery] DateTime date,
        [FromQuery] bool utc = true)
    {
        try
        {
            var result = await _sunriseSunsetService
                .GetSolarDataAsync(city, date, utc);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving solar data.");
            return StatusCode(500, "An error occurred while fetching solar data.");
        }
    }
}