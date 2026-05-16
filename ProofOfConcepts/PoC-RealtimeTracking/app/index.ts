import express, { Request, Response } from "express";
import { EventBus } from "./eventBus";

const eventBus = new EventBus();

interface TrackingRecord {
  bestellingId: string;
  locatie: string;
  status: string;
  timestamp: string;
  aantalUpdates: number;
}

interface GpsUpdate {
  bestellingId: string;
  locatie: string;
  status: string;
}

// In-memory store: huidige toestand per bestelling
const trackingStore = new Map<string, TrackingRecord>();

eventBus.subscribe("PACKAGE_NEARBY", (data: GpsUpdate) => {
  console.log(
    `[NOTIFICATIE MODULE] SMS verstuurd: pakket ${data.bestellingId} is bijna bij ${data.locatie}`,
  );
});

const app = express();
app.use(express.json());

app.post("/api/tracking/ingest", (req: Request, res: Response) => {
  const { bestellingId, locatie, status } = req.body as GpsUpdate;
  const timestamp = new Date().toISOString();

  const bestaand = trackingStore.get(bestellingId);
  const record: TrackingRecord = {
    bestellingId,
    locatie,
    status,
    timestamp,
    aantalUpdates: (bestaand?.aantalUpdates ?? 0) + 1,
  };
  trackingStore.set(bestellingId, record);

  console.log(
    `[TRACKING] ${timestamp} | ${bestellingId} | ${status} @ ${locatie} (update #${record.aantalUpdates})`,
  );

  if (status === "In_De_Buurt") {
    eventBus.publish("PACKAGE_NEARBY", { bestellingId, locatie, status });
  }

  res.status(202).json({ message: "GPS-update verwerkt", record });
});

// Bulk GPS-updates — simuleert hoog-frequente ingest van meerdere voertuigen
app.post("/api/tracking/bulk", (req: Request, res: Response) => {
  const updates = req.body as GpsUpdate[];
  const timestamp = new Date().toISOString();

  console.log(
    `\n[TRACKING] Bulk-ingest: ${updates.length} updates ontvangen om ${timestamp}`,
  );

  const resultaten = updates.map((update) => {
    const bestaand = trackingStore.get(update.bestellingId);
    const record: TrackingRecord = {
      bestellingId: update.bestellingId,
      locatie: update.locatie,
      status: update.status,
      timestamp,
      aantalUpdates: (bestaand?.aantalUpdates ?? 0) + 1,
    };
    trackingStore.set(update.bestellingId, record);

    console.log(
      `  → ${update.bestellingId} | ${update.status} @ ${update.locatie} (update #${record.aantalUpdates})`,
    );

    if (update.status === "In_De_Buurt") {
      eventBus.publish("PACKAGE_NEARBY", update);
    }

    return record;
  });

  res.status(202).json({ verwerkt: resultaten.length, resultaten });
});

// Huidige trackingstatus opvragen per bestelling
app.get("/api/tracking/:bestellingId", (req: Request, res: Response) => {
  const bestellingId = req.params.bestellingId as string;
  const record = trackingStore.get(bestellingId);

  if (!record) {
    res
      .status(404)
      .json({ message: `Geen tracking gevonden voor ${bestellingId}` });
    return;
  }

  res.json(record);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[TRACKING MODULE] GPS Ingest API draait op poort ${PORT}`);
  console.log(`Wachtend op GPS-updates van voertuigen...`);
});
