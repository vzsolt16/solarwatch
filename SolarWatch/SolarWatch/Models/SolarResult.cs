namespace SolarWatch.Models;

public class SolarResult
{
    public string City { get; set; }
    public DateTime Date { get; set; }
    public DateTime Sunrise { get; set; }
    public DateTime Sunset { get; set; }
    public string Timezone { get; set; }
}