using System.Net.Http.Json;
using GatewayApi.Domain;
using GatewayApi.DTOs;
using GatewayApi.Interfaces;

namespace GatewayApi.Adapters;

public class WeatherApiV2Adapter : IWeatherProviderV2
{
    private readonly HttpClient _httpClient;

    public WeatherApiV2Adapter(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<WeatherInfo> GetWeatherAsync(CancellationToken cancellationToken = default)
    {
        // ACL boundary: external DTO stays here.
        var external = await _httpClient.GetFromJsonAsync<ExternalWeatherV2Response>(
            "weather/v2",
            cancellationToken);

        if (external is null)
        {
            throw new InvalidOperationException("External weather response was empty.");
        }

        return new WeatherInfo
        {
            Temperature = external.TemperatureCelsius,
            Condition = external.WeatherType
        };
    }
}
