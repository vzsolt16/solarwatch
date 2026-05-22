using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SolarWatch.Contracts;
using SolarWatch.Exceptions;
using SolarWatch.Models.Entities;
using SolarWatch.Services;
using SolarWatch.Services.Authentication;

namespace SolarWatch.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize(Roles = $"{Roles.User}, {Roles.Admin}")]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IGeocodingService _geocodingService;

    public ProfileController(
        UserManager<ApplicationUser> userManager,
        IGeocodingService geocodingService)
    {
        _userManager = userManager;
        _geocodingService = geocodingService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileResponse>> GetProfile()
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(ToResponse(user));
    }

    [HttpPut("favorite-city")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileResponse>> UpdateFavoriteCity(
        [FromBody] UpdateFavoriteCityRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        var city = request.City.Trim();

        try
        {
            await _geocodingService.GetCoordinatesAsync(city);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError(nameof(request.City), ex.Message);
            return ValidationProblem(ModelState);
        }
        catch (CityNotFoundException)
        {
            ModelState.AddModelError(nameof(request.City), $"City '{city}' was not found.");
            return ValidationProblem(ModelState);
        }

        user.FavoriteCity = city;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            foreach (var error in updateResult.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return ValidationProblem(ModelState);
        }

        return Ok(ToResponse(user));
    }

    [HttpDelete("favorite-city")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileResponse>> DeleteFavoriteCity()
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        user.FavoriteCity = null;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            foreach (var error in updateResult.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return ValidationProblem(ModelState);
        }

        return Ok(ToResponse(user));
    }

    private Task<ApplicationUser?> GetCurrentUserAsync()
    {
        return _userManager.GetUserAsync(User);
    }

    private static UserProfileResponse ToResponse(ApplicationUser user)
        => new(user.Email ?? string.Empty, user.UserName ?? string.Empty, user.FavoriteCity);
}
