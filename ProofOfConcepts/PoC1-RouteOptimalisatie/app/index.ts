import express from "express";

const app = express();
const port = 3000;

interface Stop {
  name: string;
  lat: number;
  lng: number;
}

const depot: Stop = { name: "Depot Antwerpen", lat: 51.2194, lng: 4.4025 };

const deliveryStops: Stop[] = [
  { name: "Gent", lat: 51.0543, lng: 3.7174 },
  { name: "Brussel", lat: 50.8503, lng: 4.3517 },
  { name: "Leuven", lat: 50.8798, lng: 4.7005 },
  { name: "Mechelen", lat: 51.0259, lng: 4.4777 },
  { name: "Brugge", lat: 51.2093, lng: 3.2247 },
  { name: "Hasselt", lat: 50.9307, lng: 5.3378 },
  { name: "Lier", lat: 51.1306, lng: 4.5697 },
  { name: "Turnhout", lat: 51.3226, lng: 4.9449 },
];

/**
 * Bereken de afstand tussen twee punten op de aarde in kilometers. (geen pythagoras, maar de echte afstand over de bolvormige aarde)
 * @param a - Eerste stop
 * @param b - Tweede stop
 * @returns Afstand in kilometers
 */
function haversineKm(a: Stop, b: Stop): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Bouw een afstandsmatrix voor alle stops, waarbij de waarde op [i][j] de afstand is van stop i naar stop j.
 * Dit slagen we op in een matrix en onthouden we dit waardoor we niet steeds opnieuw de afstand hoeven te berekenen tijdens het Held-Karp algoritme.
 * @param stops
 * @returns
 */
function buildDistanceMatrix(stops: Stop[]): number[][] {
  return stops.map((a) => stops.map((b) => haversineKm(a, b)));
}

/**
 * Implementeer het Held-Karp algoritme om de optimale route te berekenen. (Meer uitleg in de README en ADR documentatie)
 * Dit algoritme gebruikt dynamische programmeren en bitmaskering om alle mogelijke routes te evalueren en de kortste te vinden.
 * @param stops - Een array van stops, inclusief het depot als eerste element. De volgorde van de stops in deze array bepaalt de indexen die we gebruiken in het algoritme.
 * @returns Een object met de optimale route (als array van stops) en de totale afstand in kilometers.
 */
function heldKarp(stops: Stop[]): { route: Stop[]; totalKm: number } {
  const n = stops.length;
  const dist = buildDistanceMatrix(stops);

  const INF = Infinity;
  const FULL = (1 << n) - 1;

  const dp: number[][] = Array.from({ length: 1 << n }, () =>
    new Array(n).fill(INF),
  );
  const prev: number[][] = Array.from({ length: 1 << n }, () =>
    new Array(n).fill(-1),
  );

  dp[1 << 0][0] = 0;

  // Loop door alle mogelijke combinaties van stops (masks)
  for (let mask = 1; mask <= FULL; mask++) {
    // We beginnen altijd bij het depot (index 0), dus we negeren combinaties die het depot niet bevatten.
    if (!(mask & 1)) continue;

    // Loop door alle stops die in de huidige combinatie (mask) zitten
    for (let currStop = 0; currStop < n; currStop++) {
      // Check of de huidige stop deel uitmaakt van de mask en of er een geldige route naar deze stop is
      // we maken gebruik van bitmaskering om te controleren of de currStop in de mask zit (mask & (1 << currStop)) en of er een geldige route is naar deze stop (dp[mask][currStop] !== INF).
      if (!(mask & (1 << currStop))) continue;
      // Als er geen geldige route is naar deze stop, slaan we deze combinatie over
      if (dp[mask][currStop] === INF) continue;

      // Probeer elke volgende stop toe te voegen aan de route
      for (let nextStop = 0; nextStop < n; nextStop++) {
        // Als de volgende stop al in de mask zit, slaan we deze over
        if (mask & (1 << nextStop)) continue;

        // Bereken de nieuwe mask door de volgende stop toe te voegen
        const next = mask | (1 << nextStop);
        // Bereken de totale kosten van de route naar de volgende stop via de huidige stop
        const cost = dp[mask][currStop] + dist[currStop][nextStop];

        // Als deze route goedkoper is dan de eerder bekende route naar de volgende stop, werk dan de dp en prev tabellen bij
        if (cost < dp[next][nextStop]) {
          dp[next][nextStop] = cost;
          prev[next][nextStop] = currStop;
        }
      }
    }
  }

  // Initialisatie voor de allerlaatste stap: terugkeren naar huis (het depot).
  let best = INF;
  let last = -1;

  /* We hebben nu alle stops bezocht (FULL mask).
   * We zoeken nu welke 'laatste stop' (i) de kortste totale route oplevert
   * wanneer we vanaf die stop terugrijden naar het depot (index 0).
   */
  for (let i = 1; i < n; i++) {
    // Totale kosten = (kosten om alle steden te bezoeken eindigend in i) + (afstand van i naar depot)
    const total = dp[FULL][i] + dist[i][0];

    // Selecteer de beste route
    if (total < best) {
      best = total;
      last = i;
    }
  }

  /**
   * Pad-reconstructie: Backtracking
   * De DP-tabel vertelt ons de kosten, maar de 'prev' tabel vertelt ons de weg.
   * We lopen de route nu in omgekeerde volgorde af.
   */
  const indices: number[] = [];
  let mask = FULL;
  let cur = last;

  // Zolang we een geldige voorganger hebben, blijven we terugstappen
  while (cur !== -1) {
    indices.push(cur); // Voeg huidige stop toe aan de route
    const p = prev[mask][cur];

    /**
     * De bitwise XOR (^) operator "zet de bit uit".
     * We markeren stad 'cur' als "niet meer bezocht" in de mask
     * zodat we de status krijgen die de computer zag vóórdat we deze stad bezochten.
     */
    mask ^= 1 << cur;
    cur = p;
  }

  // Omdat we van achter naar voren hebben gelopen, moeten we de lijst omdraaien
  indices.reverse();

  // Return het resultaat als een net object voor de API/Output
  return { route: indices.map((i) => stops[i]), totalKm: best };
}

app.get("/poc-route", (req, res) => {
  const allStops = [depot, ...deliveryStops];
  const result = heldKarp(allStops);

  res.json({
    message:
      "De geoptimaliseerde route is berekend met het Held-Karp algoritme.",
    totalKm: result.totalKm.toFixed(2),
    route: result.route.map((s) => s.name),
    returnTo: depot.name,
  });
});

app.listen(port, () => {
  console.log(
    `poc1 : Route optimalisatie zichtbaar op http://localhost:${port}/poc-route`,
  );
});
