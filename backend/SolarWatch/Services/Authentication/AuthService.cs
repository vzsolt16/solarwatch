using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SolarWatch.Data;
using SolarWatch.Models.Entities;

namespace SolarWatch.Services.Authentication;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly SolarWatchDbContext _dbContext;

    public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService, SolarWatchDbContext dbContext)
    {
        _userManager  = userManager;
        _tokenService = tokenService;
        _dbContext = dbContext;
    }

    public async Task<AuthResult> RegisterAsync(
        string email, string username, string password, string role)
    {
        var user   = new ApplicationUser { UserName = username, Email = email };
        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            var authResult = new AuthResult(false, email, username, string.Empty, null, null);
            foreach (var error in result.Errors)
                authResult.ErrorMessages[error.Code] = error.Description;
            return authResult;
        }

        await _userManager.AddToRoleAsync(user, role);
        return new AuthResult(true, email, username, string.Empty, null, null);
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
        var refreshToken = _tokenService.CreateRefreshToken(user.Id);

        _dbContext.RefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync();

        return new AuthResult(true, user.Email!, user.UserName!, token, refreshToken.Token, user.FavoriteCity);
    }

    public async Task<AuthResult> RefreshAsync(string refreshToken)
    {
        var storedToken = await _dbContext.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken);

        if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiresAt < DateTime.UtcNow)
            return Fail(string.Empty, "Invalid or expired refresh token");

        var user = storedToken.User;
        var roles = await _userManager.GetRolesAsync(user);
        var newToken = _tokenService.CreateToken(user, roles.FirstOrDefault() ?? string.Empty);
        var newRefreshToken = _tokenService.CreateRefreshToken(user.Id);

        storedToken.IsRevoked = true;
        _dbContext.RefreshTokens.Add(newRefreshToken);
        await _dbContext.SaveChangesAsync();

        return new AuthResult(true, user.Email!, user.UserName!, newToken, newRefreshToken.Token, user.FavoriteCity);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var storedToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
        if (storedToken != null)
        {
            storedToken.IsRevoked = true;
            await _dbContext.SaveChangesAsync();
        }
    }

    private static AuthResult Fail(string email, string errorDescription)
    {
        var result = new AuthResult(false, email, string.Empty, string.Empty, null, null);
        result.ErrorMessages["BadCredentials"] = errorDescription;
        return result;
    }
}
