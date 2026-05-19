namespace SolarWatch.Models.Entities;

public class City
{
    public int Id { get; set; }   // Primary Key

    public string Name { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public string? State { get; set; }

    public string Country { get; set; }
    public string TimeZoneId { get; set; }

    // Navigation property (One city → many sunrise/sunset records)
    public ICollection<SunriseSunset> SunriseSunsets { get; set; } = new List<SunriseSunset>();
}