using Microsoft.AspNetCore.Identity;
using SolarWatch.Models.Entities;

namespace SolarWatch.Services.Authentication;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager  = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResult> RegisterAsync(
        string email, string username, string password, string role)
    {
        var user   = new ApplicationUser { UserName = username, Email = email };
        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            var authResult = new AuthResult(false, email, username, string.Empty, null);
            foreach (var error in result.Errors)
                authResult.ErrorMessages[error.Code] = error.Description;
            return authResult;
        }

        await _userManager.AddToRoleAsync(user, role);
        return new AuthResult(true, email, username, string.Empty, null);
    }

    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
            return Fail(email, "Bad credentials");

        var passwordValid = await _userManager.CheckPasswordAsync(user, password);
        if (!passwordValid)
            return Fail(email, "Bad credentials");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateToken(user, roles.FirstOrDefault() ?? string.Empty);

        return new AuthResult(true, user.Email!, user.UserName!, token, user.FavoriteCity);
    }

    private static AuthResult Fail(string email, string errorDescription)
    {
        var result = new AuthResult(false, email, string.Empty, string.Empty, null);
        result.ErrorMessages["BadCredentials"] = errorDescription;
        return result;
    }
}
