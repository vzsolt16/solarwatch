using System.ComponentModel.DataAnnotations;

namespace SolarWatch.Models.Entities;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }
    public required string Token { get; set; }
    public required string UserId { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
}
