namespace SolarWatch.Models.Entities;

public class SunriseSunset
{
    public int Id { get; set; }  // Primary Key

    public DateTime Date { get; set; }

    public DateTime Sunrise { get; set; }

    public DateTime Sunset { get; set; }

    public string Timezone { get; set; }

    // Foreign Key
    public int CityId { get; set; }

    // Navigation property
    public City City { get; set; }
}