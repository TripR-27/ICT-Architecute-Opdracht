# PoC — Real-time GPS Tracking (Tracking Component)

**Auteur:** Benjamin De Loore  
**Gerelateerde ADR:** documentatie/Architecturele_Stijl_ADR.md

## Wat deze PoC bewijst

Deze PoC valideert dat de Tracking Component GPS-updates van voertuigen correct kan ontvangen, bijhouden en opvragen. Dit is een kernfunctionaliteit van het systeem: het platform moet locatie-updates van meerdere voertuigen simultaan kunnen verwerken en de huidige toestand per bestelling bijhouden.

Als bijwerking toont de PoC dat een statuswijziging (`In_De_Buurt`) automatisch een event triggert op de interne event bus, waarop de Notificatie Module reageert — zonder dat de Tracking Module iets weet van de Notificatie Module. Voor de volledige validatie van het event bus mechanisme, zie PoC3-InterneEventBus.

---

## Architectuur

```text
Voertuig / GPS Tracker
    │
    │  POST /api/tracking/ingest
    │  POST /api/tracking/bulk
    ▼
Tracking Module
    ├── Slaat locatie + status op in in-memory store
    ├── Logt timestamp + updateteller per bestelling
    │
    │  (bijwerking bij status "In_De_Buurt")
    │  eventBus.publish('PACKAGE_NEARBY')
    ▼
Notificatie Module (Subscriber)
    └── Logt SMS-notificatie
```

---

## Installatie en Gebruik

### Draaien met Docker Swarm (testcluster)

**Stap 1: Kopieer de directory naar de main manager (node1)**

```bash
scp -P 8022 -r ./ProofOfConcepts/PoC-Event-DrivenStateSynchronization [USER]@[IP]:~/PoC-Tracking
```

**Stap 2: Verbind met de main manager**

```bash
ssh -p 8022 [USER]@[IP]
```

**Stap 3: Distribueer naar de overige nodes**

```bash
scp -r ~/PoC-Tracking node2:~
scp -r ~/PoC-Tracking node3:~
scp -r ~/PoC-Tracking node4:~
scp -r ~/PoC-Tracking node5:~
```

**Stap 4: Bouw de image op alle 5 nodes**

```bash
cd ~/PoC-Tracking && docker build -t logistiek-poc:latest .
ssh node2 "cd ~/PoC-Tracking && docker build -t logistiek-poc:latest ."
ssh node3 "cd ~/PoC-Tracking && docker build -t logistiek-poc:latest ."
ssh node4 "cd ~/PoC-Tracking && docker build -t logistiek-poc:latest ."
ssh node5 "cd ~/PoC-Tracking && docker build -t logistiek-poc:latest ."
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

### Scenario 1: Enkelvoudige GPS-update

Stuur een locatie-update voor één voertuig:

```bash
curl -X POST http://127.0.0.1:8080/api/tracking/ingest \
  -H "Content-Type: application/json" \
  -d '{"bestellingId": "ORD-001", "locatie": "Antwerpen Centrum", "status": "Onderweg"}'
```

Stuur daarna nog een update voor dezelfde bestelling:

```bash
curl -X POST http://127.0.0.1:8080/api/tracking/ingest \
  -H "Content-Type: application/json" \
  -d '{"bestellingId": "ORD-001", "locatie": "Antwerpen Noord", "status": "In_De_Buurt"}'
```

**Verwacht in de logs:**
```text
[TRACKING] 2025-... | ORD-001 | Onderweg @ Antwerpen Centrum (update #1)
[TRACKING] 2025-... | ORD-001 | In_De_Buurt @ Antwerpen Noord (update #2)
[NOTIFICATIE MODULE] SMS verstuurd: pakket ORD-001 is bijna bij Antwerpen Noord
```

---

### Scenario 2: Bulk GPS-updates (meerdere voertuigen tegelijk)

```bash
curl -X POST http://127.0.0.1:8080/api/tracking/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {"bestellingId": "ORD-001", "locatie": "Gent", "status": "Onderweg"},
    {"bestellingId": "ORD-002", "locatie": "Brussel Centrum", "status": "In_De_Buurt"},
    {"bestellingId": "ORD-003", "locatie": "Leuven", "status": "Onderweg"}
  ]'
```

**Verwacht in de logs:**
```text
[TRACKING] Bulk-ingest: 3 updates ontvangen om 2025-...
  → ORD-001 | Onderweg @ Gent (update #3)
  → ORD-002 | In_De_Buurt @ Brussel Centrum (update #1)
  → ORD-003 | Onderweg @ Leuven (update #1)
[NOTIFICATIE MODULE] SMS verstuurd: pakket ORD-002 is bijna bij Brussel Centrum
```

---

### Scenario 3: Huidige status opvragen

```bash
curl http://127.0.0.1:8080/api/tracking/ORD-001
```

**Verwacht resultaat:**
```json
{
  "bestellingId": "ORD-001",
  "locatie": "Gent",
  "status": "Onderweg",
  "timestamp": "2025-...",
  "aantalUpdates": 3
}
```

---

## Bekende beperkingen

- In-memory store: tracking data gaat verloren bij herstart van de container. In productie wordt dit vervangen door de centrale PostgreSQL database (zie C4 Container Diagram).
- In-process event bus: events worden niet gedeeld tussen meerdere Docker containers. Bij horizontale schaling ontvangt enkel de instantie die het event publiceert de notificatie. Dit is een bewuste trade-off voor de huidige fase (zie ADR).
