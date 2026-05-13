# ADR 1: Architecturale Stijl

> Formaat gebaseerd op MADR (Markdown Architectural Decision Records):  
> https://adr.github.io/madr/

## Status
Propositie

## Auteur
Laurens Rombout

## Datum
19/04/2025

## Type ADR
Beschrijving

---

## Context en Probleemstelling

We ontwikkelen een logistiek plannings- en real-time tracking systeem (vergelijkbaar met DHL/UPS). Het systeem moet leveringen plannen en tegelijkertijd real-time GPS-updates verwerken van mogelijk duizenden voertuigen.

Deze combinatie introduceert twee verschillende soorten workloads:

- **I/O-intensief:** continue verwerking van GPS-updates en tracking events
- **CPU-intensief:** routeplanning en optimalisatie

Daarnaast moet het systeem voldoen aan belangrijke karakteristieken zoals performantie, onderhoudbaarheid, betrouwbaarheid, schaalbaarheid, security en interoperabiliteit.

Het ontwikkelteam is klein en heeft een deadline van 6 maanden om een productieklare versie op te leveren. Daarom is het cruciaal om een architectuur te kiezen die zowel technisch geschikt als praktisch haalbaar is.

---

## Overwogen opties

1. Gelaagde architectuur (Layered)
2. Modulaire Monoliet
3. Microkernel
4. Microservices

---

## Beslissing

We kiezen voor een **Modulaire Monoliet** als primaire architecturale stijl, aangevuld met een **event-driven communicatiepatroon** binnen de applicatie.

Het systeem wordt als één geheel gedeployed, maar intern opgesplitst in duidelijk afgebakende domeinmodules (bijv. Tracking, Planning, Notification). Deze modules communiceren niet rechtstreeks met elkaar, maar via een interne event bus (Fowler, 2017).

---

## Verantwoording

Deze keuze vormt een bewuste balans tussen architecturale kwaliteit en implementatiecomplexiteit.

### 1. Eenvoud en haalbaarheid (Simplicity & Maintainability)

Een gedistribueerde microservices-architectuur introduceert aanzienlijke complexiteit zoals service discovery, netwerkcommunicatie, deployment pipelines en distributed debugging (Fowler, 2015; Microsoft, 2023b).

Voor een klein team met een strikte deadline vormt dit een aanzienlijk risico op vertragingen en operationele problemen.

Door te kiezen voor een modulaire monoliet behouden we een eenvoudige deployment en ontwikkelomgeving, terwijl we via events toch een duidelijke scheiding tussen componenten afdwingen (Fowler, 2015).

---

### 2. Losse koppeling via events (Maintainability & Extensibility)

Binnen de monoliet passen we een event-driven aanpak toe, waarbij modules communiceren via events in plaats van directe method calls (Fowler, 2017).

Dit zorgt voor:
- lagere afhankelijkheden tussen modules
- eenvoudigere uitbreidbaarheid
- betere scheiding van verantwoordelijkheden

Nieuwe functionaliteit kan hierdoor toegevoegd worden zonder bestaande componenten sterk te wijzigen, wat de onderhoudbaarheid van het systeem verhoogt.

---

### 3. Performantie en real-time verwerking (Performance)

Omdat alle componenten binnen één proces draaien:
- vermijden we netwerk latency
- kunnen events snel verwerkt worden
- is communicatie efficiënter dan bij externe service calls

Dit is cruciaal voor real-time tracking, waar snelle verwerking van GPS-updates vereist is (Microsoft, 2023a).

---

### 4. Betrouwbaarheid en consistentie (Reliability & Consistency)

In tegenstelling tot microservices gebruiken we één centrale database, waardoor:
- sterke consistentie (ACID) mogelijk is
- geen complexiteit rond distributed transactions ontstaat

Daarnaast kunnen events intern gebufferd en verwerkt worden, wat bijdraagt aan een robuuste verwerking van updates (Microsoft, 2023a).

---

### 5. Beperkte maar voldoende schaalbaarheid (Scalability)

Hoewel we geen onafhankelijke schaalbaarheid per module hebben, kunnen we de applicatie horizontaal schalen door meerdere instanties te deployen.

Voor de initiële scope van het systeem is dit voldoende. Indien de load significant toeneemt, kan deze architectuur evolueren naar microservices, waarbij de bestaande modules als basis dienen (Fowler, 2015; Microsoft, 2023b).

---

## Positieve consequenties

- Eenvoudige ontwikkeling en deployment binnen een beperkte tijdspanne
- Lage operationele complexiteit (geen distributed system)
- Hoge performantie door interne communicatie zonder netwerk calls
- Losse koppeling tussen modules via events
- Mogelijkheid om het systeem later te evolueren naar microservices
- Sterke data consistentie door gebruik van één centrale database

---

## Negatieve consequenties en risico's

- **Beperkte schaalbaarheid:** modules kunnen niet onafhankelijk geschaald worden
- **Single point of failure:** bij een crash van de applicatie valt het volledige systeem uit (mitigatie via replicatie)
- **Event complexiteit:** het gebruik van events kan leiden tot minder transparante afhankelijkheden en moeilijkere debugging
- **Deployment coupling:** wijzigingen vereisen redeployment van de volledige applicatie

---

## Analyse per overwogen optie

### Microservices — Tweede keuze

Microservices (gedistribueerde domeinpartitionering) bieden sterke voordelen op vlak van schaalbaarheid, fault isolation en flexibiliteit. In combinatie met event-driven communicatie zijn ze bijzonder geschikt voor grootschalige real-time systemen (Microsoft, 2023b).

Daarnaast maken microservices onafhankelijke deployments en afzonderlijke schaalbaarheid per domein mogelijk, wat voordelig is bij extreme workloads.

Echter, de operationele complexiteit zoals monitoring, debugging, netwerkcommunicatie en data consistentie vormt een aanzienlijk risico voor een klein team binnen een beperkte tijdspanne (Fowler, 2015).

Daarom wordt deze optie beschouwd als een logische evolutie voor de toekomst, maar niet als de beste keuze voor de initiële implementatie.

---

### Gelaagde architectuur — Afgewezen

Een gelaagde architectuur organiseert de applicatie volgens technische lagen (presentatie, business, data), maar biedt onvoldoende scheiding tussen domeinen.

Dit leidt tot:
- sterke koppeling tussen componenten
- beperkte flexibiliteit
- moeilijkere uitbreidbaarheid

Voor een complex logistiek systeem met meerdere onafhankelijke verantwoordelijkheden is deze stijl onvoldoende geschikt.

---

### Microkernel — Afgewezen

De microkernel-architectuur is gericht op een stabiele kern met uitbreidbare plugins. Deze stijl is geschikt voor systemen waarbij functionaliteit dynamisch uitgebreid wordt door externe modules.

In het logistieke domein ligt de uitdaging echter niet bij uitbreidbaarheid via plugins, maar bij performantie, real-time verwerking en schaalbaarheid. Daarom biedt deze stijl geen relevante voordelen voor dit systeem.

---

## Conclusie

De combinatie van een **Modulaire Monoliet met event-driven communicatie** biedt de beste balans tussen eenvoud, performantie en flexibiliteit.

Deze aanpak maakt het mogelijk om:
1. snel een robuust systeem te ontwikkelen
2. real-time verwerking efficiënt te ondersteunen
3. en tegelijk de architectuur voor te bereiden op toekomstige evolutie naar microservices

---

## Referenties

- Fowler, M. (2015). *Monolith First*. https://martinfowler.com/bliki/MonolithFirst.html  
- Fowler, M. (2017). *Event-Driven Architecture*. https://martinfowler.com/articles/201701-event-driven.html  
- Microsoft. (2023a). *Event-driven architecture style*. https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven  
- Microsoft. (2023b). *Microservices architecture*. https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices