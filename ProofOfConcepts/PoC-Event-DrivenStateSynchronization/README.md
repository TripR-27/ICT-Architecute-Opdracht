# PoC 2 — Event-Driven State Synchronization (Tracking)

**Auteur:** Benjamin De Loore  
**Gerelateerde ADR:** documentatie/Interne_Module_communicatie_ADR.md

## Wat deze PoC bewijst

Deze PoC valideert dat de Tracking Module en de Notificatie Module kunnen communiceren via een interne event bus zonder van elkaars bestaan te weten. Wanneer een voertuig een geofence binnenrijdt (status: In_De_Buurt), publiceert de Tracking Module een PACKAGE_NEARBY domein-event. De Notificatie Module reageert hierop zelfstandig — zonder directe koppeling.

Dit bewijst losse koppeling in de praktijk en toont aan dat een toekomstige migratie naar microservices technisch haalbaar is.

---

## Architectuur

De communicatie verloopt via een in-memory event bus binnen de applicatie:

```text
GPS Tracker
    │
    │  POST /api/tracking/ingest
    ▼
Tracking Module (Publisher)
    │
    │  eventBus.publish('PACKAGE_NEARBY')
    ▼
Event Bus
    │
    ▼
Notificatie Module (Subscriber)
    │
    └── console.log("[SMS verstuurd]")
```

---

## Vereisten

- Node.js 18+
- Docker
- Docker Swarm (voor de volledige demo)

---

## Installatie en Gebruik

### Lokaal draaien

```bash
cd app
npm install
npm run dev
```

### Draaien met Docker

```bash
docker-compose -f poc.yaml up --build
```

### Draaien met Docker Swarm (testcluster)

**Stap 1: Kopieer de directory naar de main manager (node1)**

```bash
scp -P 8022 -r ./ProofOfConcepts/PoC-Event-DrivenStateSynchronization [USER]@[IP]:~/PoC-EventDriven
```

**Stap 2: Verbind met de main manager**

```bash
ssh -p 8022 [USER]@[IP]
```

**Stap 3: Distribueer naar de overige nodes**

```bash
scp -r ~/PoC-EventDriven node2:~
scp -r ~/PoC-EventDriven node3:~
scp -r ~/PoC-EventDriven node4:~
scp -r ~/PoC-EventDriven node5:~
```

**Stap 4: Bouw de image op alle 5 nodes**

```bash
cd ~/PoC-EventDriven && docker build -t logistiek-poc:latest .
ssh node2 "cd ~/PoC-EventDriven && docker build -t logistiek-poc:latest ."
ssh node3 "cd ~/PoC-EventDriven && docker build -t logistiek-poc:latest ."
ssh node4 "cd ~/PoC-EventDriven && docker build -t logistiek-poc:latest ."
ssh node5 "cd ~/PoC-EventDriven && docker build -t logistiek-poc:latest ."
```

**Stap 5: Deploy de stack**

```bash
docker stack deploy -f poc.yaml poc
```

**Logs bekijken:**

```bash
docker service logs poc_logistiek-api -f
```

---

## Testen

Stuur een POST-verzoek naar de API om een statuswijziging te simuleren:

```bash
curl -X POST http://127.0.0.1:8080/api/tracking/ingest \
  -H "Content-Type: application/json" \
  -d '{"bestellingId": "ORD-9994", "huidigeLocatie": "Antwerpen Centrum", "status": "In_De_Buurt"}'
```

**Verwacht resultaat — response:**

```json
{ "message": "Locatie verwerkt door Tracking Module" }
```

**Verwacht resultaat — logs:**

```text
=====================================================
[NOTIFICATIE MODULE] SMS verstuurd naar: ORD-9994
[NOTIFICATIE MODULE] "Uw pakket is bijna bij: Antwerpen Centrum"
=====================================================
```

**Tip:** Test ook met "status": "Onderweg". Je zult zien dat je wel een 202 Accepted krijgt, maar dat er geen notificatie-log verschijnt.

---

## Projectstructuur

```text
PoC2-RealtimeGPSIngest/
├── app/
│   ├── index.ts        # Tracking Module + HTTP endpoint
│   ├── eventBus.ts     # Interne event bus
│   ├── tsconfig.json
│   └── package.json
├── Dockerfile          # Multi-stage build (TypeScript → JavaScript)
├── poc.yaml             # Docker Compose / Swarm configuratie
└── README.md
```

---

## Bekende beperkingen

- In-process event bus: Events worden niet gedeeld tussen meerdere Docker containers. Bij horizontale schaling ontvangt enkel de instantie die het event publiceert de notificatie. Dit is een bewuste trade-off voor de huidige fase (zie ADR).
