import express, { Request, Response } from "express";
import { EventBus } from "./eventBus";

// ============================================================
// BLOK 1: DE INTERNE EVENT BUS
// Zie PoC3-InterneEventBus (Ryan) voor de volledige validatie
// van hoe deze bus meerdere subscribers bedient.
// ============================================================
const eventBus = new EventBus();

interface GeofenceEnteredEvent {
  bestellingId: string;
  locatie: string;
}

// ============================================================
// BLOK 2: NOTIFICATIE MODULE (Subscriber)
// ============================================================
eventBus.subscribe("PACKAGE_NEARBY", (eventData: GeofenceEnteredEvent) => {
  console.log("\n=====================================================");
  console.log(
    `[NOTIFICATIE MODULE] SMS verstuurd naar: ${eventData.bestellingId}`,
  );
  console.log(
    `[NOTIFICATIE MODULE] "Uw pakket is bijna bij: ${eventData.locatie}"`,
  );
  console.log("=====================================================\n");
});

// ============================================================
// BLOK 3: TRACKING MODULE (Publisher & HTTP ingang)
// ============================================================
const app = express();
app.use(express.json());

app.post("/api/tracking/ingest", (req: Request, res: Response) => {
  const { bestellingId, huidigeLocatie, status } = req.body;

  if (status === "In_De_Buurt") {
    const domeinEvent: GeofenceEnteredEvent = {
      bestellingId,
      locatie: huidigeLocatie,
    };
    eventBus.publish("PACKAGE_NEARBY", domeinEvent);
  }

  res.status(202).json({ message: "Locatie verwerkt door Tracking Module" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Logistieke API draait op poort ${PORT}`);
  console.log(`Wachtend op GPS events...`);
});
