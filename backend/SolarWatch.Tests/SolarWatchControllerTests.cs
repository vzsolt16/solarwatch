using Microsoft.Testing.Platform.Logging;
using SolarWatch.Controllers;
using SolarWatch.Exceptions;
using SolarWatch.Models;
using SolarWatch.Services;

namespace SolarWatch.Tests;

using NUnit.Framework;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;

[TestFixture]
public class SolarWatchControllerTests
{
    private Mock<ISunriseSunsetService> _mockService;
    private SolarWatchController _controller;

    [SetUp]
    public void Setup()
    {
        _mockService = new Mock<ISunriseSunsetService>();

        _controller = new SolarWatchController(
            _mockService.Object,
            Mock.Of<ILogger<SolarWatchController>>());
    }

    [Test]
    public async Task Get_ReturnsOk_WhenServiceReturnsData()
    {
        // Arrange
        var expected = new SolarResult
        {
            City = "Budapest",
            Date = DateTime.Today,
            Sunrise = DateTime.Now,
            Sunset = DateTime.Now.AddHours(10),
            Timezone = "UTC"
        };

        _mockService
            .Setup(s => s.GetSolarDataAsync("Budapest", It.IsAny<DateTime>(), false))
            .ReturnsAsync(expected);

        // Act
        var result = await _controller.Get("Budapest", DateTime.Today, false);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var ok = result as OkObjectResult;
        ok!.Value.Should().BeEquivalentTo(expected);
    }

    [Test]
    public async Task Get_ReturnsNotFound_WhenCityDoesNotExist()
    {
        _mockService
            .Setup(s => s.GetSolarDataAsync(It.IsAny<string>(), It.IsAny<DateTime>(), false))
            .ThrowsAsync(new CityNotFoundException("InvalidCity"));

        var result = await _controller.Get("InvalidCity", DateTime.Today, false);

        result.Should().BeOfType<NotFoundObjectResult>();
    }
}
