using SolarWatch.Models.Entities;

namespace SolarWatch.Services.Authentication;

public interface ITokenService
{
    /// <summary>Creates a signed JWT for the given user with the specified role.</summary>
    string CreateToken(ApplicationUser user, string role);

    /// <summary>Creates a cryptographically strong random refresh token.</summary>
    RefreshToken CreateRefreshToken(string userId);
}
