# ADR: Keuze voor Interne Event Bus en Abstractie

> Formaat gebaseerd op MADR (Markdown Architectural Decision Records):  
> https://adr.github.io/madr/

## Status

Propositie

## Context en Probleemstelling

Binnen onze Modulaire Monoliet (zoals vastgelegd in [ADR 1](../../documentatie/Architecturele_Stijl_ADR.md)) moeten verschillende domeincomponenten, zoals _Bestelling_ en _Planning_, met elkaar communiceren. Als we deze componenten rechtstreeks methodes van elkaar laten aanroepen (tight coupling), wordt het in de toekomst vrijwel onmogelijk om de applicatie op te splitsen in microservices.

Daarnaast brengt asynchrone, event-gedreven communicatie in een multithreaded omgeving een groot risico met zich mee: **Race Conditions**. Wat gebeurt er als een _Cancel-event_ (van de klant) en een _RouteUpdate-event_ (van de planner) exact tegelijkertijd voor dezelfde bestelling binnenkomen? Zonder ingrijpen kan de data corrupt raken.

De vraag is: Hoe faciliteren we losse koppeling die toekomstbestendig is, zonder nu al een complex gedistribueerd systeem te bouwen, én hoe garanderen we dataconsistentie bij gelijktijdige events?

## Overwogen opties

1. **Directe Methode-aanroepen (Tight Coupling):** Componenten roepen elkaars functies direct aan.
2. **Externe Message Broker (bv. RabbitMQ / Redis):** Een externe service die berichten via het netwerk tussen componenten routeert.
3. **In-Memory Event Bus met Interface Abstractie en State-Locking:** Een interne event bus via een gedeelde interface (`IEventBus`), waarbij de ontvangende componenten verantwoordelijk zijn voor het beveiligen van hun eigen data via thread-locking.

## Beslissing

We kiezen voor **Optie 3: In-Memory Event Bus met Interface Abstractie en State-Locking**.

- Componenten communiceren uitsluitend door events te publiceren en te luisteren via een abstracte `IEventBus` interface.
- De huidige implementatie van deze interface is volledig _in-memory_ (binnen hetzelfde applicatieproces).
- Ontvangende componenten maken gebruik van `lock` mechanismen (state-locking) om de integriteit van de data te beschermen wanneer meerdere events tegelijkertijd dezelfde entiteit proberen te wijzigen.

## Verantwoording

Deze keuze biedt de perfecte balans tussen de eenvoud van een monoliet en de flexibiliteit van microservices:

1. **Waarom nu geen RabbitMQ?** We hebben bewust voor een Modulaire Monoliet gekozen om operationele complexiteit (zoals netwerk-overhead en extra infrastructuur) te vermijden. Het introduceren van RabbitMQ zou dit principe schenden.
2. **Abstractie als voorbereiding op Microservices:** Door de in-memory bus te verbergen achter de `IEventBus` interface, weten de componenten niet _hoe_ de berichten verstuurd worden. Mochten we in de toekomst overstappen naar microservices, dan hoeven we enkel de `InMemoryEventBus` klasse in te wisselen voor een `RabbitMqEventBus` klasse. De business logica in de componenten blijft 100% ongewijzigd.
3. **Race Condition Protectie:** Asynchrone events kunnen leiden tot data-inconsistentie. Door _state-locking_ toe te passen op het moment dat een event verwerkt wordt, beschermen we de entiteit. Als de bestelling al geannuleerd is door event A, zal de gelockte thread voor event B dit opmerken en de route-update weigeren.

## Positieve consequenties

- **Loose Coupling:** Volledige ontkoppeling tussen domeinmodules; ze kennen elkaars interne logica niet.
- **Toekomstbestendig:** Een eventuele migratie naar een microservices-architectuur is op communicatievlak al voorbereid.
- **Performantie:** Omdat alles in-memory draait, is de communicatie razendsnel en vrij van netwerk-latency.
- **Dataconsistentie:** Gegarandeerde bescherming tegen race conditions, wat cruciaal is voor een betrouwbaar logistiek systeem.

## Negatieve consequenties en risico's

- In tegenstelling tot RabbitMQ (die berichten op de harde schijf kan opslaan), overleven in-memory events een applicatiecrash niet. Als de applicatie uitvalt terwijl er events in de wachtrij staan, gaan deze verloren.
- Het gebruik van `locks` kan bij extreme piekbelasting zorgen voor lichte vertraging (thread contention), omdat processen even op elkaar moeten wachten.

## Update: Praktische Implementatie en Bewijsvoering (PoC 3)

Om deze architecturale keuze te valideren, hebben we _Proof of Concept 3_ uitgewerkt, opgesplitst in twee scenario's:

- **POC-normaal (De abstractie):** Hierin hebben we een interne event bus geïmplementeerd en testen we met één event. Bij het afvuren zagen we dat de componenten direct reageren, zonder iets van elkaars code of werking te weten. Dit bewijst dat de losse koppeling via onze abstractie perfect werkt.
- **POC-race-condition (State locking):** Hier focussen we op het risico van twee events (_Cancel_ en _Update_) die exact tegelijk worden afgevuurd. Door een C# `lock` toe te voegen, wacht de thread netjes zijn beurt af, ziet hij dat de order al "GEANNULEERD" is door het eerste event, en negeert hij de ongeldige route-update succesvol. Dit bewijst dat de dataconsistentie behouden blijft.
