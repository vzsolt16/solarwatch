using System.Net;
using System.Text;

namespace SolarWatch.Tests.Integration;

public class StubExternalApiHandler : HttpMessageHandler
{
    public int GeocodingCallCount { get; private set; }
    public int SunriseSunsetCallCount { get; private set; }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var url = request.RequestUri?.ToString() ?? string.Empty;

        if (url.Contains("api.openweathermap.org/geo/1.0/direct", StringComparison.OrdinalIgnoreCase))
        {
            GeocodingCallCount++;

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    """
                    [{"lat":47.4979,"lon":19.0402}]
                    """,
                    Encoding.UTF8,
                    "application/json")
            });
        }

        if (url.Contains("api.sunrise-sunset.org/json", StringComparison.OrdinalIgnoreCase))
        {
            SunriseSunsetCallCount++;

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    """
                    {
                      "results": {
                        "sunrise": "2026-05-18T03:15:00+00:00",
                        "sunset": "2026-05-18T18:20:00+00:00"
                      }
                    }
                    """,
                    Encoding.UTF8,
                    "application/json")
            });
        }

        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound)
        {
            Content = new StringContent($"No stub configured for URL: {url}")
        });
    }
}
