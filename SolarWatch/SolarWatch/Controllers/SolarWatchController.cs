namespace SolarWatch.Controllers;

using Microsoft.AspNetCore.Mvc;
using SolarWatch.Services;
using SolarWatch.Exceptions;

[ApiController]
[Route("api/[controller]")]
public class SolarWatchController : ControllerBase
{
    private readonly ISunriseSunsetService _solarService;
    private readonly ILogger<SolarWatchController> _logger;

    public SolarWatchController(
        ISunriseSunsetService solarService,
        ILogger<SolarWatchController> logger)
    {
        _solarService = solarService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string city,
        [FromQuery] DateTime date,
        [FromQuery] bool utc = false)
    {
        try
        {
            _logger.LogInformation("Request received for {City} on {Date}", city, date);

            var result = await _solarService.GetSolarDataAsync(city, date, utc);

            return Ok(result);
        }
        catch (CityNotFoundException ex)
        {
            _logger.LogWarning(ex.Message);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error");
            return StatusCode(500, "Internal server error");
        }
    }
}