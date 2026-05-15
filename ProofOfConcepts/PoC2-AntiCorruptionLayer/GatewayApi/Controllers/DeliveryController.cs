using GatewayApi.Domain;
using GatewayApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GatewayApi.Controllers;

[ApiController]
[Route("delivery/eta")]
public class DeliveryController : ControllerBase
{
    private const int BaseEtaMinutes = 60;
    private readonly IDeliveryEtaService _etaService;
    private readonly IWeatherProviderV1 _weatherV1;
    private readonly IWeatherProviderV2 _weatherV2;

    public DeliveryController(
        IDeliveryEtaService etaService,
        IWeatherProviderV1 weatherV1,
        IWeatherProviderV2 weatherV2)
    {
        _etaService = etaService;
        _weatherV1 = weatherV1;
        _weatherV2 = weatherV2;
    }

    [HttpGet("v1")]
    public async Task<ActionResult<DeliveryEtaResult>> GetEtaV1(CancellationToken cancellationToken)
    {
        var weather = await _weatherV1.GetWeatherAsync(cancellationToken);
        var result = _etaService.CalculateAdjustedEta(BaseEtaMinutes, weather);
        return Ok(result);
    }

    [HttpGet("v2")]
    public async Task<ActionResult<DeliveryEtaResult>> GetEtaV2(CancellationToken cancellationToken)
    {
        var weather = await _weatherV2.GetWeatherAsync(cancellationToken);
        var result = _etaService.CalculateAdjustedEta(BaseEtaMinutes, weather);
        return Ok(result);
    }
}
