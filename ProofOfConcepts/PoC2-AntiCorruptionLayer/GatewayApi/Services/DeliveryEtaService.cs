using GatewayApi.Domain;
using GatewayApi.Interfaces;

namespace GatewayApi.Services;

public class DeliveryEtaService : IDeliveryEtaService
{
    public DeliveryEtaResult CalculateAdjustedEta(int baseEtaMinutes, WeatherInfo weather)
    {
        // Business rule: only the internal model is used here.
        var extraMinutes = GetDelayMinutes(weather.Condition);

        return new DeliveryEtaResult
        {
            BaseEtaMinutes = baseEtaMinutes,
            WeatherCondition = weather.Condition,
            AdjustedEtaMinutes = baseEtaMinutes + extraMinutes
        };
    }

    private static int GetDelayMinutes(string condition)
    {
        if (string.Equals(condition, "Rain", StringComparison.OrdinalIgnoreCase))
        {
            return 10;
        }

        if (string.Equals(condition, "Storm", StringComparison.OrdinalIgnoreCase))
        {
            return 25;
        }

        return 0;
    }
}
