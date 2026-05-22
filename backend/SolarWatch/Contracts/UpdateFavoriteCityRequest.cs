using System.ComponentModel.DataAnnotations;

namespace SolarWatch.Contracts;

public record UpdateFavoriteCityRequest([Required] string City);
