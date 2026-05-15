# Handleiding PoC 3: Interne Event Bus

Deze PoC demonstreert de ontkoppeling van componenten via een event bus en de beveiliging tegen race conditions. Er worden twee services gedeployed: een versie die enkel toont hoe de abstractie werkt, en een beveiligde versie die de race condition oplost.

## 1. Uitvoeren

Navigeer op de manager-node naar de betreffende directory en start de stack:

docker stack deploy -c poc.yml poc3

## 2. Resultaten Verifiëren

De bewijsvoering bevindt zich in de service logs. Wacht na deployment enkele seconden zodat de scenario's kunnen draaien.

### De abstractie

Bekijk de logs van de normale service. Hier zie je dat 2 componenten met elkaar sturen aan de hand van een event. Ze weten voor de rest niets van elkaars code of werking. Hoe het werkt kan je zien in de code zelf (of in de ADR), dit wordt beschreven in de comments:

docker service logs poc3_app-normaal

### De Race condition (State-locking)

Bekijk de logs van de beveiligde service. Hier wordt de update geweigerd omdat het systeem herkent dat de order reeds geannuleerd is. Ook hiervoor kan je in de code of ADR kijken voor meer uitleg:

docker service logs poc3_app-race-condition
