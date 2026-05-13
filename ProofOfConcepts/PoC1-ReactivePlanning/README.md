## Algemene flow PoC1-ReactivePlanning

In deze PoC laat ik zien in beperkte vorm hoe het planning systeem reactief zou werken binnen onze applicatie. In dit PoC nemen we de situatie als een klant een **next-day-delivery** zou aanvragen, waardoor er verandering zou moeten komen in de al-geplande planning.

Het systeem wordt getoont aan de hand van 3 van de 5 modules.

- **PlanningModule** - Registratie van de planning
- **NotificatieModule** - Notificeert over de eventen (event komt binnen, event succes, event faalt)
- **OrderingModule** - Publiceert events

Hiernaast wordt er gebruik gemaakt van een simpele psuedo asynchrone event-bus.

### Happy flow

1. `OrderingModule` roept `bus.publish("NEXT_DAY_DELIVERY_REQUESTED", { orderId: 42 })` aan
2. De bus scheduleert beide handlers via `setImmediate` en keert direct terug, ORderingModule weet niet wie er luisters, en wacht ook niet
3. Op de volgende event loop tick voert Node.js de twee handlers uit:
   - `PlanningModule`: herberekent de route, logt dat de prioriteit is gezet
   - `NotificatieModule`: stuurt een bevestiging naar de afzender

### Failure flow (1 op 5 kans)

Voor dit PoC hebben we genomen dat het pakket een 1 op 5 kans heeft van falen.

1. Start hetzelfde als de Happy flow
2. `PlanningModule` zijn handler gooit een error in try/catch
3. De catch logt de fout en publiceert zelf een nieuw event: `PLANNING_FAILED`
4. De bus scheduleert opnieuw via `setImmediate`, dit keer voor de `PLANNING_FAILED` handlers
5. `NotificatieModule` reageert en stuurt een waarschuwing naar de klant

De `OrderingModule` heeft niets door aangezien dit los staat van het module. De fout propageert niet, het wordt een event.
