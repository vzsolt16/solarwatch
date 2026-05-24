using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SolarWatch.Contracts;
using SolarWatch.Services.Authentication;

namespace SolarWatch.Controllers;

[ApiController]
[Route("[controller]")]
[EnableRateLimiting("AuthPolicy")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>
    /// Registers a new user. All public registrations receive the User role.
    /// </summary>
    [HttpPost("Register")]
    [ProducesResponseType(typeof(RegistrationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RegistrationResponse>> Register(
        [FromBody] RegistrationRequest request)
    {
        var result = await _authService.RegisterAsync(
            request.Email, request.Username, request.Password, Roles.User);

        if (!result.Success)
        {
            AddErrors(result);
            return ValidationProblem();
        }

        return CreatedAtAction(
            nameof(Register),
            new RegistrationResponse(result.Email, result.UserName));
    }

    /// <summary>Returns a signed JWT token on successful authentication.</summary>
    [HttpPost("Login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] AuthRequest request)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password);

        if (!result.Success)
        {
            AddErrors(result);
            return ValidationProblem();
        }

        SetTokenCookies(result.Token, result.RefreshToken!);

        return Ok(new AuthResponse(result.Email, result.UserName, result.FavoriteCity));
    }

    [HttpPost("Refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized();
        }

        var result = await _authService.RefreshAsync(refreshToken);

        if (!result.Success)
        {
            return Unauthorized();
        }

        SetTokenCookies(result.Token, result.RefreshToken!);

        return Ok(new AuthResponse(result.Email, result.UserName, result.FavoriteCity));
    }

    [HttpPost("Logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.LogoutAsync(refreshToken);
        }

        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");

        return Ok();
    }

    private void SetTokenCookies(string accessToken, string refreshToken)
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        Response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(30)
        });

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        });
    }

    private void AddErrors(AuthResult result)
    {
        foreach (var (key, message) in result.ErrorMessages)
            ModelState.AddModelError(key, message);
    }
}
