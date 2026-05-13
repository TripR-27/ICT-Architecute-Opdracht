# ADR P1: Routeoptimalisatie

Status: Propositie / Geaccepteerd
Auteur: Dylan Havelaerts
Datum: 12/05/2026
Type ADR: Technisch

## Context en Probleemstelling

Binnen de gekozen Modulaire Monolith-architectuur (zie ADR 01) moet de module voor routeoptimalisatie een specifieke, intensieve taak uitvoeren. Hoewel we starten met een monolithische opzet voor eenvoud in ontwikkeling en deployment, is het systeem ontworpen om in de toekomst te kunnen schalen naar microservices. Er is een noodzaak om een algoritme te kiezen dat zowel performant is als de infrastructuur (Docker Swarm) valideert. Hoe implementeren we deze functionaliteit zodanig dat de schaalbaarheid en de toekomstige transitie naar microservices gewaarborgd blijven?

## Keuze factoren

- **Factor 1**: Berekeningsnauwkeurigheid tegenover responstijd
- **Factor 2**: Systeem intensiviteit en impact of infrastructuur
- **Factor 3**: Ontwikkelingtijd tegenover complexiteit

## Overwogen Opties

- **Optie 1**: Held-Karp
- **Optie 2**: Genetic Algorithm
- **Optie 3**: Nearest Neighbour
- **Optie 4**: 2-opt Algorithm

## Keuze Uitkomst

**Tijdelijke keuze voor de PoC**: Held-Karp
**Definitieve keuze voor Productie**: Genetic Algorithm (hybride met 2-opt)

Voor de PoC-fase is specifiek gekozen voor het **Held-Karp** algoritme vanwege de gegarandeerde nauwkeurigheid. Dit levert de absolute kortste route (Shmoys & Williamson, 1990), wat essentieel is om een betrouwbare baseline vast te stellen voor de initiële routeberekeningen.

Direct na deze validatie wordt direct gestart met de ontwikkeling van het **Hybride Genetic Algorithm**. Waar het genetische algoritme zorgt voor een brede exploratie van de zoekruimte, functioneert de **2-opt** heuristiek als een sterke local search om gevonden routes lokaal te perfectioneren (Larrañaga et al., 1999). Deze combinatie is noodzakelijk voor de productie-omgeving om grote hoeveelheden stops aan te kunnen zonder exponentiële vertraging zoals mogelijk bij **Held-Karp**.

Nearest Neighbour is verworpen omdat deze in het slechtste geval extreem inefficiënte routes produceert (Rosenkrantz et al., 1977). Een zuivere 2-opt oplossing werd uitgesloten omdat deze zonder goede initiële populatie vastloopt in lokale optima.

### Validatie via Proof of Concept (PoC)

De technische haalbaarheid van deze beslissing is gevalideerd middels **PoC 1 - Routeoptimalisatie**.

- De PoC bevestigt dat de gekozen methode binnen de gestelde tijdslimieten voor beperkte datasets opereert op een Worker Node.
- De Docker-configuratie (`poc.yaml`) valideert de resource-isolatie, waarbij de CPU-load beperkt blijft tot de toegewezen nodes zonder de Manager Nodes te hinderen.

## Positieve Consequenties

- **Directe Infrastructuurvalidatie**: Door Held-Karp uitsluitend voor de PoC te gebruiken, kan de Docker Swarm-configuratie en de resource-isolatie onmiddellijk worden getest. Dit ontkoppelt de validatie van de infrastructuur van de ontwikkeltijd die nodig is voor het complexere hybride Genetic Algorithm.
- **Baseline voor Ontwikkeling**: De exacte resultaten van de Held-Karp engine dienen als een foutloze baseline. Hiermee kan de nauwkeurigheid van het hybride Genetic Algorithm/2-opt algoritme tijdens de parallelle ontwikkeling in de eerste 6 maanden objectief worden getest.
- **Risicobeheersing**: Eventuele problemen met CPU-scheduling of container-orkestratie komen in de PoC-fase direct aan het licht door de voorspelbare, zware belasting van het exacte algoritme.

## Negatieve Consequenties

- **Wegwerpbare Codebase**: De Held-Karp implementatie is strikt beperkt tot de PoC-omgeving. Deze code wordt niet geïntegreerd in het uiteindelijke planning component, wat betekent dat de ontwikkeluren voor deze specifieke engine puur als investering in infrastructuur-validatie moeten worden beschouwd.
- **Tijdelijke Functionele Beperking**: Zolang de productie (Hybrid GA/2-opt) in ontwikkeling is, blijft de testomgeving functioneel gelimiteerd tot een laag aantal stops vanwege de exponentiële tijdscomplexiteit van de PoC-engine ($O(n^2 2^n)$).

## Referenties

- Kirutikaa, U. S., & Dhenakaran, S. S. (2016). A Method of Solving Travelling Salesman Problem. International Journal of Innovative Research in Computer and Communication Engineering, 4(7), 222-245.
- Larrañaga, P., Kuijpers, C. M. H., Murga, R. H., Inza, I., & Dizdarevic, S. (1999). Genetic Algorithms for the Travelling Salesman Problem: A Review of Representations and Operators. Artificial Intelligence Review, 13(2), 129-170.
- Rosenkrantz, D. J., Stearns, R. E., & Lewis, P. M. (1977). An Analysis of Several Heuristics for the Traveling Salesman Problem. SIAM Journal on Computing, 6(3), 563-581.
- Shmoys, D. B., & Williamson, D. P. (1990). Analyzing the Held-Karp TSP bound: a monotonicity property with application. Information Processing Letters, 35(6), 281-285.

- [C4-Uitleg] - Documenatie over Architectuur en docker swarm deployment
- [../proofOfConcepts/poc1-RouteOptimalisatie/app/`index.ts`] - Code voorbeeld
