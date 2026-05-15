using GatewayApi.Domain;

namespace GatewayApi.Interfaces;

public interface IDeliveryEtaService
{
    DeliveryEtaResult CalculateAdjustedEta(int baseEtaMinutes, WeatherInfo weather);
}
