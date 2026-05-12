# Bestellingcomponent

Het bestellingcomponent is verantwoordelijk voor de volledige administratieve afhandeling en het beheer van de levenscyclus van een zending. Dit component fungeert als de "single source of truth" voor orderdata, vanaf de initiële aanvraag tot de uiteindelijke afsluiting van het dossier.

## Verzender (Actor) Bestelling aanmaken (Action)

1. Voert de verzendgegevens in (ophaaladres, afleveradres, pakketgewicht en afmetingen).
2. Wacht op de systeemvalidatie van de ingevoerde gegevens op logistieke haalbaarheid en volledigheid.
3. Ontvangt een uniek trackingnummer (ID) en een bevestiging van de registratie.

## Verzender (Actor) Bestelling beheren (Action)

1. Raadpleegt het overzicht van actieve en historische zendingen.
2. Vraagt een wijziging of annulering aan voor een bestelling die nog niet operationeel is ingepland.
3. Ontvangt een bevestiging van de systeemwijziging.

## Beheerder (Actor) Bestellingen opvolgen en modereren (Action)

1. Doorzoekt en filtert het overkoepelende overzicht van alle inkomende en actieve bestellingen.
2. Detecteert bestellingen met afwijkingen, ontbrekende data of mogelijke fouten.
3. Grijpt manueel in door een bestelling te blokkeren, de data te corrigeren of een handmatige prioriteit toe te kennen.

## Verantwoordelijkheden svan het Bestellingcomponent

- Valideren van inkomende bestelgegevens op correctheid.
- Genereren en toewijzen van unieke identificatienummers (tracking ID's).
- Aanmaken, persistent opslaan en muteren van bestelrecords in de database.
- Beheren van de bestellingslevenscyclus en het verwerken van statusupdates.
- Vrijgeven van gevalideerde bestellingen zodat deze beschikbaar worden voor het planningscomponent.

## Voorbeelden van Bestelstatussen

- Aangemaakt
- Geregistreerd (Gegevens gevalideerd)
- Ingepland
- In transit
- Geleverd
- Geannuleerd
- Geblokkeerd (Interventie vereist)

## Doel

Het bestellingcomponent zorgt ervoor dat alle orderdata foutloos, gestructureerd en veilig het systeem binnenkomt. Hierdoor kunnen latere processen, zoals routeplanning en actieve tracking, altijd bouwen op betrouwbare en actuele administratieve gegevens.
