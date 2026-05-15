# Proof of Concept - Anti-Corruption Layer (ACL)

Deze PoC toont hoe een Anti-Corruption Layer (ACL) een intern logistiek domein beschermt tegen onstabiele externe APIs. De focus ligt op interoperabiliteit: externe wijzigingen mogen alleen impact hebben op adapters en externe DTOs, nooit op business logica of interne modellen.

## 1. Architectuur uitleg

Een ACL is een vertaal- en beschermlaag tussen het interne domein en externe systemen. Het doel is om:

- interne modellen stabiel te houden
- externe datavormen af te vangen in adapters
- veranderingen in externe APIs te isoleren

In deze PoC gebeurt dit via adapters die externe DTOs vertalen naar interne domeinmodellen. De business logica ziet alleen interne types.

## 2. Scenario: API versie 1 en versie 2

**Externe API v1**

```json
{
  "temp": 15,
  "condition": "Rain"
}
```

**Externe API v2**

```json
{
  "temperature_celsius": 15,
  "weather_type": "Rain"
}
```

**Wat verandert bij v2?**

- Alleen de adapter en externe DTOs.
- Interne domeinmodellen, business logica en controllers blijven identiek.

Dit bewijst dat alleen de ACL laag gewijzigd wordt bij externe veranderingen.

## 3. Architecturale analyse

- **Interoperabiliteit**: elke externe API kan wijzigen zonder impact op het domein.
- **Stabiele business logica**: ETA regels blijven identiek, ongeacht de externe vorm.
- **Future-proof**: nieuwe versies of providers kunnen toegevoegd worden via nieuwe adapters.
- **Geen leakage**: externe DTOs worden nergens buiten de adapter gebruikt.

## 4. Docker uitleg

Start alles lokaal:

```bash
cd ProofOfConcepts/PoC2-AntiCorruptionLayer
docker compose up --build
```

Test de mock API:

```bash
curl http://localhost:8080/weather/v1
curl http://localhost:8080/weather/v2
```

Test de gateway ETA endpoints:

```bash
curl http://localhost:8081/delivery/eta/v1
curl http://localhost:8081/delivery/eta/v2
```

## 5. Docker Swarm compatibiliteit

- Alle services zijn stateless.
- Communicatie gebeurt via servicenames op een intern netwerk.
- Geen lokale opslag of host afhankelijkheden.
- De compose syntax is compatibel met:

```bash
docker stack deploy -c docker-compose.yml poc
```

## 6. Verwachte output

**Gateway API response (v1 en v2):**

```json
{
  "baseEtaMinutes": 60,
  "weatherCondition": "Rain",
  "adjustedEtaMinutes": 70
}
```

## 7. Bestanden en rollen

- `docker-compose.yml`: orkestreert beide containers en netwerk.
- `ExternalApiMock/Program.cs`: start de mock API.
- `ExternalApiMock/Controllers/WeatherController.cs`: levert v1 en v2 responses.
- `ExternalApiMock/Dockerfile`: container build voor de mock API.
- `GatewayApi/Program.cs`: DI, HttpClientFactory en routing.
- `GatewayApi/Controllers/DeliveryController.cs`: endpoints voor ETA v1 en v2.
- `GatewayApi/Domain/WeatherInfo.cs`: interne domeinrepresentatie van weer.
- `GatewayApi/Domain/DeliveryEtaResult.cs`: interne output van ETA berekening.
- `GatewayApi/DTOs/ExternalWeatherV1Response.cs`: externe v1 DTO.
- `GatewayApi/DTOs/ExternalWeatherV2Response.cs`: externe v2 DTO.
- `GatewayApi/Adapters/WeatherApiV1Adapter.cs`: vertaalt v1 naar domeinmodel.
- `GatewayApi/Adapters/WeatherApiV2Adapter.cs`: vertaalt v2 naar domeinmodel.
- `GatewayApi/Interfaces/IWeatherProvider.cs`: contract voor weerdata.
- `GatewayApi/Interfaces/IWeatherProviderV1.cs`: v1 adapter contract.
- `GatewayApi/Interfaces/IWeatherProviderV2.cs`: v2 adapter contract.
- `GatewayApi/Interfaces/IDeliveryEtaService.cs`: contract voor ETA logic.
- `GatewayApi/Services/DeliveryEtaService.cs`: business regels voor ETA.
- `GatewayApi/Dockerfile`: container build voor gateway API.

## 8. Waarom dit een echte ACL is

- De adapter is de enige plek waar externe JSON bestaat.
- Externe DTOs blijven lokaal in de adapterlaag.
- De business logica werkt enkel met interne modellen.
- Controller en services hoeven niets te weten over de externe API vorm.

## 9. Bewijs: alleen adapters wijzigen

Wanneer de externe provider van v1 naar v2 gaat:

- Alleen `GatewayApi/Adapters/*` en `GatewayApi/DTOs/*` veranderen.
- Alle domeinmodellen en services blijven gelijk.
- Controllers blijven gelijk omdat ze alleen interne types gebruiken.

Dit is precies het doel van een Anti-Corruption Layer.
