using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using SolarWatch.Contracts;
using SolarWatch.Models;

namespace SolarWatch.Tests.Integration;

[TestFixture]
public class AuthIntegrationTests
{
    private CustomWebApplicationFactory _factory = null!;
    private HttpClient _client = null!;

    [SetUp]
    public void Setup()
    {
        _factory = new CustomWebApplicationFactory();
        _client = _factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        _client?.Dispose();
        _factory?.Dispose();
    }

    [Test]
    public async Task Register_ReturnsCreated_AndResponseBody()
    {
        // This sends a real HTTP request through the full ASP.NET Core pipeline.
        var request = new RegistrationRequest(
            "integration@example.com",
            "integration-user",
            "Secret1!");

        var response = await _client.PostAsJsonAsync("/Auth/Register", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.Content.ReadFromJsonAsync<RegistrationResponse>();
        body.Should().NotBeNull();
        body!.Email.Should().Be(request.Email);
        body.UserName.Should().Be(request.Username);
    }

    [Test]
    public async Task Register_ReturnsBadRequest_WhenEmailIsAlreadyUsed()
    {
        var request = new RegistrationRequest(
            "duplicate@example.com",
            "first-user",
            "Secret1!");

        var duplicateRequest = new RegistrationRequest(
            "duplicate@example.com",
            "second-user",
            "Secret1!");

        var firstResponse = await _client.PostAsJsonAsync("/Auth/Register", request);
        firstResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var secondResponse = await _client.PostAsJsonAsync("/Auth/Register", duplicateRequest);

        secondResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await secondResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problem.Should().NotBeNull();
        problem!.Errors.Should().ContainKey("DuplicateEmail");
    }

    [Test]
    public async Task SolarWatch_ReturnsMockedExternalData_AndCachesItForNextRequest()
    {
        var externalApiHandler = new StubExternalApiHandler();

        using var factory = new CustomWebApplicationFactory(externalApiHandler);
        using var client = factory.CreateClient();

        var firstResponse = await client.GetAsync("/api/SolarWatch?city=Budapest&date=2026-05-18&utc=true");
        firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var firstBody = await firstResponse.Content.ReadFromJsonAsync<SolarResult>();
        firstBody.Should().NotBeNull();
        firstBody!.City.Should().Be("Budapest");
        firstBody.Timezone.Should().Be("UTC");
        firstBody.Sunrise.Should().Be(DateTime.Parse("2026-05-18T03:15:00+00:00").ToUniversalTime());
        firstBody.Sunset.Should().Be(DateTime.Parse("2026-05-18T18:20:00+00:00").ToUniversalTime());

        externalApiHandler.GeocodingCallCount.Should().Be(1);
        externalApiHandler.SunriseSunsetCallCount.Should().Be(1);
        externalApiHandler.TimeZoneCallCount.Should().Be(1);

        var secondResponse = await client.GetAsync("/api/SolarWatch?city=Budapest&date=2026-05-18&utc=true");
        secondResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var secondBody = await secondResponse.Content.ReadFromJsonAsync<SolarResult>();
        secondBody.Should().BeEquivalentTo(firstBody);

        externalApiHandler.GeocodingCallCount.Should().Be(1);
        externalApiHandler.SunriseSunsetCallCount.Should().Be(1);
        externalApiHandler.TimeZoneCallCount.Should().Be(1);
    }

}
