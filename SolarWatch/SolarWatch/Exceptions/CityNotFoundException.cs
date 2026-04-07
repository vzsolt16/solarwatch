namespace SolarWatch.Exceptions;

public class CityNotFoundException : Exception
{
    public CityNotFoundException(string city)
        : base($"City '{city}' was not found.")
    {
    }
}