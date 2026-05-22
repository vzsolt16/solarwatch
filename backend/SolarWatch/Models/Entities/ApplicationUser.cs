using Microsoft.AspNetCore.Identity;

namespace SolarWatch.Models.Entities;

public class ApplicationUser : IdentityUser
{
    public string? FavoriteCity { get; set; }
}
