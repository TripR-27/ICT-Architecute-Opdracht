# ADR: Keuze voor Anti-Corruption Layer (ACL) bij externe weerprovider

> Formaat gebaseerd op MADR (Markdown Architectural Decision Records):  
> https://adr.github.io/madr/

## Status

Propositie

## Context en Probleemstelling

Onze Modulaire Monoliet (zoals vastgelegd in [ADR 1](../../documentatie/Architecturele_Stijl_ADR.md)) moet weerinformatie ophalen van een externe provider om de ETA te berekenen. Externe APIs wijzigen regelmatig hun JSON-structuur en versies. Als we die externe DTOs rechtstreeks gebruiken in controllers of services, gaat externe data vorm lekken naar het domein. Dit zorgt voor sterke coupling en maakt de business logica kwetsbaar bij elke API wijziging.

De vraag is: Hoe integreren we externe weerdata, zonder dat wijzigingen in de provider directe impact hebben op interne modellen, services en business regels?

## Overwogen opties

1. **Directe integratie in controllers/services:** Externe JSON wordt direct geparsed in de controller en doorgegeven aan de business logica.
2. **Mapping in service laag, maar met externe DTOs:** Een mapper vertaalt externe velden, maar externe DTOs blijven zichtbaar buiten de adapterlaag.
3. **Anti-Corruption Layer met adapters en interne domeinmodellen:** Elke externe versie krijgt een eigen adapter en DTOs, die vertalen naar stabiele interne modellen.

## Beslissing

We kiezen voor **Optie 3: Anti-Corruption Layer met adapters en interne domeinmodellen**.

- Alle externe JSON wordt uitsluitend verwerkt in adapters.
- De business logica werkt alleen met interne types.
- Nieuwe API versies krijgen een nieuwe adapter en DTOs, zonder impact op services of controllers.

## Verantwoording

Deze keuze beschermt het domein tegen externe instabiliteit en sluit aan bij onze modulaire monoliet principes:

1. **Isolatie van externe veranderingen:** Wijzigingen in een externe provider blijven beperkt tot de adapterlaag.
2. **Stabiel domein:** Interne modellen blijven onveranderd, wat regressies in business logica voorkomt.
3. **Uitbreidbaarheid:** Nieuwe versies of providers zijn additive (extra adapters), zonder codebreuk in het domein.
4. **Testbaarheid:** Adapters zijn los te testen met externe DTOs, terwijl services alleen interne modellen nodig hebben.

## Positieve consequenties

- Externe wijzigingen veroorzaken geen impact op controllers, services of domeinmodellen.
- Eenduidige boundary tussen intern en extern, zonder data leakage.
- Eenvoudig toevoegen van nieuwe API versies of providers.
- Consistente business logica blijft behouden.

## Negatieve consequenties en risico's

- Extra code en onderhoud voor adapters en DTOs per versie.
- Kleine overhead in vertaling, maar acceptabel voor stabiliteit.

## Update: Praktische Implementatie en Bewijsvoering (PoC 2)

In [Proof of Concept 2](README.md) is de ACL uitgewerkt met twee externe versies:

- **Externe v1** en **v2** leveren verschillende JSON-structuren.
- `WeatherApiV1Adapter` en `WeatherApiV2Adapter` vertalen elk hun eigen DTOs naar het interne `WeatherInfo` model.
- De `DeliveryEtaService` en `DeliveryController` zien uitsluitend interne modellen en blijven identiek tussen v1 en v2.

Dit bewijst dat externe versie changes enkel de adapterlaag raken, precies het doel van de Anti-Corruption Layer.
