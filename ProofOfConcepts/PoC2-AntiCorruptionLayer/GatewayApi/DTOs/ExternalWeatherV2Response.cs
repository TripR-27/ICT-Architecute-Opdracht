using System.Text.Json.Serialization;

namespace GatewayApi.DTOs;

public class ExternalWeatherV2Response
{
    [JsonPropertyName("temperature_celsius")]
    public int TemperatureCelsius { get; set; }

    [JsonPropertyName("weather_type")]
    public string WeatherType { get; set; } = string.Empty;
}
