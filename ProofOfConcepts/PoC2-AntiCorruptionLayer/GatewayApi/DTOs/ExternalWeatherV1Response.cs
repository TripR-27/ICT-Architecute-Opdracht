using System.Text.Json.Serialization;

namespace GatewayApi.DTOs;

public class ExternalWeatherV1Response
{
    [JsonPropertyName("temp")]
    public int Temp { get; set; }

    [JsonPropertyName("condition")]
    public string Condition { get; set; } = string.Empty;
}
