# ADR 2: Interne Module Communicatie via Event Bus

Formaat gebaseerd op MADR (Markdown Architectural Decision Records):
https://adr.github.io/madr/

## Auteur

Benjamin De Loore

## Type ADR

Beschrijving

## Context en Probleemstelling

Binnen de Modulaire Monoliet (zie ADR 1) moeten modules zoals Tracking en
Notificatie met elkaar kunnen communiceren. Concreet moet de Tracking module
de Notificatie module kunnen informeren wanneer een voertuig een geofence
binnenrijdt, zodat een klantmelding verstuurd kan worden.

De uitdaging is: hoe organiseer je deze communicatie zonder dat modules
rechtstreeks van elkaars bestaan weten? Een directe koppeling zou betekenen
dat elke wijziging in de Notificatie module ook de Tracking module raakt,
wat de onderhoudbaarheid en uitbreidbaarheid van het systeem schaadt.

## Overwogen Opties

1. Directe method calls tussen modules
2. Gedeelde database als communicatiemiddel
3. Interne Event Bus (Observer pattern)
4. In-process message queue (bv. BullMQ)

## Beslissing

We kiezen voor een **interne Event Bus** op basis van het Observer pattern.
Modules communiceren uitsluitend via het publiceren en consumeren van
domein-events. Geen enkele module roept rechtstreeks een functie aan van
een andere module.

## Verantwoording

### 1. Losse koppeling (Maintainability)

Bij directe method calls is de Tracking module afhankelijk van de interface
van de Notificatie module. Elke wijziging in die interface vereist aanpassingen
in de Tracking module. Met een event bus publiceert de Tracking module enkel
een domein-event (`PACKAGE_NEARBY`) en weet niets van wie erop reageert.
Nieuwe subscribers kunnen toegevoegd worden zonder bestaande code aan te raken.

### 2. Uitbreidbaarheid (Extensibility)

Stel dat naast een SMS-notificatie ook een push-notificatie en een
audit-log-entry vereist zijn bij hetzelfde event. Met directe calls zou de
Tracking module drie aparte aanroepen bevatten. Met een event bus voegen we
twee extra subscribers toe — de Tracking module verandert niet.

### 3. Domein-expressiviteit (Domain-Driven Design)

Een event als `PACKAGE_NEARBY` beschrijft een betekenisvolle bedrijfsgebeurtenis,
niet een technische operatie. Dit sluit aan bij het concept van Domain Events
(Evans, 2003), waarbij systeemgedrag gedreven wordt door gebeurtenissen in het
probleemdomein in plaats van door technische procedure-aanroepen.

### 4. Voorbereid op migratie naar microservices (Scalability)

De interne Event Bus is conceptueel identiek aan externe message brokers zoals
Apache Kafka of RabbitMQ. Wanneer de architectuur evolueert naar microservices (zoals voorzien in ADR 1), vervangt
`eventBus.publish()` een Kafka producer en `eventBus.subscribe()` een Kafka consumer.
De kern van de domeinlogica — "bij geofence-inbreuk, publiceer een event" en "bij
PACKAGE_NEARBY, stuur een SMS" — blijft ongewijzigd.

De infrastructurele randcode vereist wel aanpassingen. Kafka garandeert at-least-once
delivery, wat betekent dat de Notificatie module idempotent geschreven moet worden:
dezelfde notificatie mag niet twee keer verstuurd worden bij een dubbel afgeleverd event.
Daarnaast vervalt de transactionele garantie van een in-process bus: bij Kafka is het
Transactional Outbox Pattern nodig om te garanderen dat een event pas gepubliceerd wordt
nadat de bijhorende databaseoperatie geslaagd is. Dit zijn bekende uitdagingen bij
gedistribueerde systemen, beschreven in de Fallacies of Distributed Computing
(Deutsch, 1994).

### 5. Performantie (Performance)

Omdat de Event Bus in-process draait (binnen hetzelfde Node.js proces), is er
geen netwerk-overhead. Events worden via `setImmediate` buiten de huidige call stack geplaatst. Dit
betekent dat de HTTP response naar de GPS tracker teruggestuurd wordt voordat
de event handlers draaien, zonder dat de event loop geblokkeerd wordt. De
communicatie blijft in-process, waardoor netwerk-overhead volledig vermeden wordt.

## Positieve Consequenties

- Modules zijn volledig onafhankelijk van elkaars implementatie
- Nieuwe functionaliteit kan reageren op bestaande events zonder codewijzigingen
- Consistent patroon dat schaalbaar is richting microservices
- Business logica is leesbaar uitgedrukt in domein-events

## Negatieve Consequenties en Risico's

- **Traceerbaarheid:** de flow van een event door het systeem is minder
  direct zichtbaar dan bij directe calls. Debugging vereist kennis van
  welke subscribers geregistreerd zijn.
- **Foutafhandeling:** als een subscriber een exception gooit, kan dit de
  volledige event-keten onderbreken. In productie vereist dit expliciete
  try/catch per subscriber.
- **In-process beperking:** de huidige implementatie werkt niet over meerdere
  instanties. Bij horizontale schaling (meerdere Docker containers) ontvangt
  enkel de instantie die het event publiceert de notificatie. Dit is een
  bewuste trade-off voor de huidige fase en wordt opgelost bij evolutie naar
  microservices met een externe broker.
- **Asynchrone foutafhandeling:** omdat handlers via `setImmediate` buiten de
  aanroepende call stack draaien, bereiken onafgevangen exceptions de oorspronkelijke
  aanroeper niet. Elke handler heeft een eigen try/catch nodig om te voorkomen dat
  een falende handler stilletjes faalt of het Node.js proces destabiliseert via
  een `unhandledRejection`.

## Analyse per Overwogen Optie

### Directe method calls — afgewezen

De eenvoudigste aanpak: `notificatieModule.stuurSMS(data)` aanroepen vanuit
de Tracking module. Dit introduceert echter een harde afhankelijkheid tussen
modules. Elke toevoeging van functionaliteit vereist aanpassing van de
aanroepende module. Dit schaalt niet in een systeem met meerdere modules die
op dezelfde gebeurtenissen moeten reageren.

### Gedeelde database als communicatiemiddel — afgewezen

Modules communiceren via een gedeelde databasetabel die als queue functioneert
(polling). Dit introduceert databasebelasting voor real-time communicatie en
vereist polling-mechanismen. De latency is onaanvaardbaar voor real-time
GPS-verwerking waarbij elke milliseconde telt.

### In-process message queue (BullMQ) — afgewezen voor huidige fase

BullMQ biedt persistente, gedistribueerde queues bovenop Redis. Dit lost het
multi-instance probleem op maar introduceert een externe Redis dependency voor
wat in de huidige fase in-process kan worden opgelost. De operationele
complexiteit weegt niet op tegen de voordelen voor een modulaire monoliet met
beperkte schaal.

## Validatie

Deze beslissing is gevalideerd via **PoC2-RealtimeGPSIngest**. De PoC toont aan
dat de Tracking module een `PACKAGE_NEARBY` event publiceert en de Notificatie
module hierop reageert, zonder dat beide modules van elkaars bestaan weten.
De HTTP response (`202 Accepted`) wordt teruggestuurd aan de GPS tracker
voordat de notificatielogica voltooid is, wat de losse koppeling in de
praktijk bewijst.

## Referenties

- Deutsch, P. (1994). The Eight Fallacies of Distributed Computing.
  Sun Microsystems. https://web.umbc.edu/~pmundur/courses/CMSC691C/L9-Tanenbaum-distributed-systems.pdf
- Evans, E. (2003). _Domain-Driven Design: Tackling Complexity in the Heart
  of Software_. Addison-Wesley Professional.
- Fowler, M. (2005). _Domain Event_.
  https://martinfowler.com/eaaDev/DomainEvent.html
- Fowler, M. (2017). _What do you mean by "Event-Driven"?_
  https://martinfowler.com/articles/201701-event-driven.html
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). _Design Patterns:
  Elements of Reusable Object-Oriented Software_. Addison-Wesley Professional.
  (Observer pattern, pp. 293–303)
- Microsoft. (2023). _Event-driven architecture style_.
  https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven
- Node.js Foundation. (2024). _Events — Node.js Documentation_.
  https://nodejs.org/api/events.html
