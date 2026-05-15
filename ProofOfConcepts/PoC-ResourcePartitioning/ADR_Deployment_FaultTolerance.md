# ADR: Keuze voor Resource Partitioning en Fault Tolerance in Docker Swarm

> Formaat gebaseerd op MADR (Markdown Architectural Decision Records):  
> https://adr.github.io/madr/

## Status

Propositie

## Context en Probleemstelling

Onze applicatie is een Modulaire Monoliet. Dit betekent dat zowel de zware routeplanning (CPU-intensief) als de real-time bestellingsverwerking (I/O-intensief) in hetzelfde deployment-artefact zitten. Het risico bestaat dat een zware planningsberekening alle systeembronnen (CPU/RAM) opslokt, waardoor de applicatie niet meer reageert op inkomende tracking-updates of nieuwe bestellingen. Hoe isoleren we deze workloads in Docker Swarm om fault tolerance te garanderen?

## Overwogen opties

1. **Container Resource Limits (Alleen CPU/Memory beperkingen):** Elke container krijgt een harde limiet op CPU-gebruik.
2. **Docker Swarm Placement Constraints (Node Pinning):** Containers met zware taken worden fysiek gestuurd naar specifieke Worker Nodes in het cluster.

## Beslissing

We kiezen voor een gecombineerde aanpak, met **Placement Constraints als primaire methode** voor foutisolatie. We deployen exact dezelfde monolitische image twee keer in onze Swarm stack, maar met een ander opstartcommando:

- De `core-service` (voor tracking en bestellingen) wordt vastgezet op de Manager Nodes.
- De `planning-service` (voor de zware route-algoritmes) wordt vastgezet op de Worker Nodes en krijgt extra CPU-restricties.

## Verantwoording

Wanneer er meerdere manieren zijn om CPU-starvation op te lossen, heeft fysieke isolatie in een cluster altijd de voorkeur boven enkel softwarematige limieten.
Als we alleen _Container Resource Limits_ (Optie 1) zouden gebruiken, zou een zware taak nog steeds op een Manager Node kunnen landen. Manager Nodes hebben hun CPU nodig voor de Swarm-orkestratie. Als een Manager overbelast raakt, valt het hele cluster uit.
Door _Placement Constraints_ (Optie 2) te gebruiken, offeren we iets aan flexibiliteit op, maar garanderen we dat de 'core' functionaliteit van de monoliet altijd razendsnel blijft reageren, ongeacht hoe zwaar het route-algoritme de Worker Nodes belast.

## Positieve consequenties

- Volledige _Fault Isolation_: Een gecrashte of overbelaste Worker Node heeft geen enkele impact op de Manager Nodes en de live-tracking functionaliteit.
- We behouden de eenvoud van de Modulaire Monoliet, maar we schalen en deployen als ware het microservices.

## Negatieve consequenties en risico's

- Als beide Worker Nodes tegelijk uitvallen, kunnen er tijdelijk geen nieuwe routes gepland worden (totdat de nodes herstellen).

## Update: Praktische Implementatie op Testinfrastructuur (PWD)

Tijdens de deployment op de testcluster (Play With Docker) liepen we tegen infrastructuurbeperkingen aan. PWD maakt gebruik van Docker-in-Docker (DinD), wat resulteerde in een `cgroupv2 invalid state` foutmelding wanneer we strikte CPU-limieten (`resources: limits: cpus`) probeerden toe te passen.

**Beslissing na iteratie:** Om de _Fault Tolerance_ toch te garanderen zonder de infrastructuur te laten crashen, hebben we de hardwarematige CPU-limieten uit de configuratie verwijderd. We steunen nu voor 100% op de fysieke isolatie via de _Placement Constraints_ (`node.role == worker`). Dit bewijst nog steeds dat een zware taak de Manager-nodes niet kan beïnvloeden, terwijl we compatibel blijven met de testinfrastructuur van de school.
