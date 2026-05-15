namespace GatewayApi.Domain;

public class DeliveryEtaResult
{
    public int BaseEtaMinutes { get; set; }
    public string WeatherCondition { get; set; } = string.Empty;
    public int AdjustedEtaMinutes { get; set; }
}
