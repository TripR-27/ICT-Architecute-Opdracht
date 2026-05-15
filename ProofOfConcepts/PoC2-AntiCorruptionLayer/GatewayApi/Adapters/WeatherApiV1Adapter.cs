using System.Net.Http.Json;
using GatewayApi.Domain;
using GatewayApi.DTOs;
using GatewayApi.Interfaces;

namespace GatewayApi.Adapters;

public class WeatherApiV1Adapter : IWeatherProviderV1
{
    private readonly HttpClient _httpClient;

    public WeatherApiV1Adapter(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<WeatherInfo> GetWeatherAsync(CancellationToken cancellationToken = default)
    {
        // ACL boundary: external DTO stays here.
        var external = await _httpClient.GetFromJsonAsync<ExternalWeatherV1Response>(
            "weather/v1",
            cancellationToken);

        if (external is null)
        {
            throw new InvalidOperationException("External weather response was empty.");
        }

        return new WeatherInfo
        {
            Temperature = external.Temp,
            Condition = external.Condition
        };
    }
}
