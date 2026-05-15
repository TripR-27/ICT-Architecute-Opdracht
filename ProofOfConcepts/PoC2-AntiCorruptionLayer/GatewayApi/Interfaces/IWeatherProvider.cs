using GatewayApi.Domain;

namespace GatewayApi.Interfaces;

public interface IWeatherProvider
{
    Task<WeatherInfo> GetWeatherAsync(CancellationToken cancellationToken = default);
}
