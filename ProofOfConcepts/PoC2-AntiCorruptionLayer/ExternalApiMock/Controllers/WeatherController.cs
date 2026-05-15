using Microsoft.AspNetCore.Mvc;

namespace ExternalApiMock.Controllers;

[ApiController]
[Route("weather")]
public class WeatherController : ControllerBase
{
    [HttpGet("v1")]
    public IActionResult GetV1()
    {
        return Ok(new { temp = 15, condition = "Rain" });
    }

    [HttpGet("v2")]
    public IActionResult GetV2()
    {
        return Ok(new { temperature_celsius = 15, weather_type = "Rain" });
    }
}
