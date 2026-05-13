# ADR P1: Validatie van Reactive Planning via Event-Driven Architectuur

**Status:** Propositie / Geaccepteerd  
**Auteur:** Dylan Havelaerts  
**Datum:** 13/05/2026  
**Type ADR:** Architecturale Validatie (PoC)

### 1. Context en Probleemstelling

In onze **Modulaire Monolith** moet het planning-module slim genoeg zijn om direct te reageren op wat er in het systeem gebeurt, zoals bij een "Next-Day Delivery".

Uit de eerste tests (het `bad-example/tight-coupling.ts` in de PoC) bleek dat we een probleem hadden: de modules zaten te strak aan elkaar vast. Als de planning-module bezig was met een zware route optimalisatie berekening (bv. Held-Karp algorithme), trok dat de hele order-intake mee omlaag. De vraag was dus: hoe bouwen we een systeem dat snel blijft reageren, waarbij we die zware berekeningen kunnen isoleren zonder de rest van de app op slot te zetten?

### 2. Waar we op hebben gelet (Keuzefactoren)

- **Adaptiviteit**: Het systeem moet direct kunnen herberekenen als er een nieuw event van buitenaf komt (Gendreau et al., 1999).
- **Beschikbaarheid**: De bestelmodule moet blijven draaien, ook als er op de achtergrond zware taken worden uitgevoerd (Felter et al., 2015).
- **Evolueerbaarheid**: Door nu al met events te werken, liggen de communicatie-afspraken tussen de modules vast. Als we later naar microservices overstappen, hoeven we alleen de interne bus te vervangen door een externe message broker (zoals RabbitMQ). We hoeven dan niet alle code in de modules opnieuw open te breken om te leren hoe ze over een netwerk moeten praten (Dragoni et al., 2017).

### 3. Besluit: We gaan voor een Asynchrone Event Bus

We hebben gekozen voor een interne **Event Bus** die asynchroon werkt (met `setImmediate` in Node.js). De `OrderingModule` schiet nu alleen een `NEXT_DAY_DELIVERY_REQUESTED` event de bus op. De `PlanningModule` vangt dit op en begint daarna pas zelfstandig te rekenen.

#### 3.1 Waarom dit de juiste keuze is (Onderbouwing)

- **Message-Driven Design**: Door over te stappen op een asynchrone bus volgen we de principes van het _Reactive Manifesto_ (Bonér et al., 2014). Het systeem blijft "responsive" omdat de vraag en de uitvoering losgekoppeld zijn in de tijd.
- **Echte Logistiek**: Statische planning werkt niet in een drukke markt. (Gendreau et al., 1999) laten zien dat je echt die dynamische herberekeningen nodig hebt voor spoedorders.
- **Isolatie via Containers**: Uit onderzoek van (Felter et al., 2015) blijkt dat containers de beste manier zijn om zware taken (zoals een route optimalisatie berekening) apart te zetten. Dit geeft ons een goede reden om Docker Swarm te gebruiken en de planning op een eigen **Worker Node** te draaien.

### 4. Wat de PoC heeft aangetoond (Resultaat)

De PoC "Reactive Planning" heeft bewezen dat dit technisch werkt:

- **Echt Ontkoppeld**: De `OrderingModule` weet nu helemaal niets meer van de `PlanningModule`. We kunnen dus makkelijk nieuwe onderdelen toevoegen zonder de bestaande code aan te raken.
- **Geen Blokokkades**: Dankzij `setImmediate` loopt de boel niet meer vast. De order-afhandeling gaat gewoon door terwijl de planning-module op de achtergrond aan de slag gaat.
- **Fouten Opvangen**: We hebben ook een `PLANNING_FAILED` event toegevoegd. Hierdoor crasht het systeem niet stilletjes, maar weten we precies wanneer er iets misgaat. In productie zouden we bij dit event informatie kunnen bijzetten om later eventueel te bekijken om dit zelfs te verwerken.

### 5. De link met Docker Swarm

Onze software-keuzes maken de infrastructuur in Docker Swarm een stuk makkelijker:

- **Resource Partitioning**: Omdat de modules via events praten, kunnen we de `PlanningModule` via _Placement Constraints_ op een specifieke Worker Node zetten met eigen CPU-limieten.
- **Slim Schalen**: Als we ineens heel veel spoedleveringen krijgen, schalen we in de Swarm gewoon alleen de planning-container op. De rest van de modules laten we met rust.

### 6. Wat dit betekent voor het project (Consequenties)

#### 6.1 Voordelen

- Het systeem is makkelijker te onderhouden en we zijn alvast voorbereid op microservices.
- Gebruikers merken niets van zware berekeningen; de app blijft vlot.

#### 6.2 Nadelen

- Het debuggen van asynchrone flows is wel wat lastiger dan bij simpele functie-aanroepen.
- We hebben te maken met 'eventual consistency'; het duurt heel even voordat de geüpdatete route overal in het systeem zichtbaar is.

### 7. Gebruikte bronnen

- (Bonér, J., et al., 2014) - The Reactive Manifesto
- (Dragoni, N., et al., 2017) - Microservices: yesterday, today, and tomorrow
- (Felter, W., et al., 2015) - An updated performance comparison of virtual machines and Linux containers
- (Gendreau, M., et al., 1999) -Real-time vehicle rerouting for the delivery and pickup problem with time windows

#### Meer uitleg over applicatie

Er is meer uitleg te vinden over PoC1 - ReactivePlanning in de bijhordende readme
`ICT-Architecturen-Opdracht/proofOfConcepts/PoC1-ReactivePlanning/README.md`
