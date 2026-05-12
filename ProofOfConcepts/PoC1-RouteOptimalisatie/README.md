# PoC 1: Routeoptimalisatie Engine

Deze Proof of Concept is een standalone concept die de technische haalbaarheid van routeoptimalisatie binnen de gekozen architectuur aantoont. De focus ligt op het berekenen van de meest efficiënte route zonder tussenkomst van externe API's of onnodige code.

## De Applicatie

De applicatie is gebouwd in TypeScript en functioneert als een geïsoleerde service binnen de Docker omgeving.

- Input: Een dataset van coördinaten (lat/lng) beginnend en eindigend bij het depot in Antwerpen.
- Proces: De applicatie berekent de onderlinge afstanden via de **Haversine**-formule om rekening te houden met de ronde van de aarde. Vervolgens wordt het optimalisatie-algoritme toegepast op deze afstandsmatrix.
- Output: De wiskundig meest optimale volgorde van stops en de totale afstand in kilometers.

## Het Algoritme: Held-Karp

Voor deze berekening is het **Held-Karp algoritme** geïmplementeerd. Dit is een algoritme op basis van Dynamic Programming dat een exacte oplossing biedt voor het **Traveling Salesman Problem**. Om hier iets op te verdiepen, werkt dit algoritme als volgt;

### Werking

- **Bitmasking**: Het algoritme gebruikt binaire getallen (bitmasks) om de status van bezochte stops bij te houden. Dit maakt operaties op bit-niveau mogelijk, wat de verwerkingstijd verkort ten opzichte van object-gebaseerde tracking.
- **Memoization**: Om redundante berekeningen te voorkomen, worden de resultaten van sub-routes opgeslagen in een DP-tabel. Bij het tegenkomen van een reeds berekende subset wordt de waarde direct uit het geheugen opgehaald.
- **Distance Matrix**: Voorafgaand aan de optimalisatie wordt een volledige matrix van alle mogelijke verbindingen opgebouwd. Dit minimaliseert het aantal aanroepen naar de **Haversine**-functie tijdens de recursie.

### Complexiteit

De tijdscomplexiteit van dit algoritme is $O(n^2 2^n)$. Door deze exponentiële groei neemt de belasting op de CPU snel toe bij een groter aantal stops.

## Extra

In de ADR spreken we verder over hoe in de actuele productie we een ander algorithme hiervoor zouden toepassen.
