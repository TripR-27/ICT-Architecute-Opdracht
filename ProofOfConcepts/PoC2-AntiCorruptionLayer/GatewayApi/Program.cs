using GatewayApi.Adapters;
using GatewayApi.Interfaces;
using GatewayApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<IDeliveryEtaService, DeliveryEtaService>();

var externalApiBaseUrl = builder.Configuration["EXTERNAL_API_BASE_URL"] ?? "http://external-api:8080";

builder.Services.AddHttpClient<IWeatherProviderV1, WeatherApiV1Adapter>(client =>
{
    // External API is an infrastructure concern, not a domain concern.
    client.BaseAddress = new Uri(externalApiBaseUrl);
});

builder.Services.AddHttpClient<IWeatherProviderV2, WeatherApiV2Adapter>(client =>
{
    client.BaseAddress = new Uri(externalApiBaseUrl);
});

var app = builder.Build();

app.MapControllers();

app.Run();
