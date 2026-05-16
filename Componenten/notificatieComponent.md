# Notificatiecomponent

Het notificatiecomponent is verantwoordelijk voor het automatisch informeren van alle betrokken partijen over belangrijke gebeurtenissen binnen het logistieke proces. Afhankelijk van de rol ontvangt elke actor relevante meldingen via e-mail, sms, pushnotificaties of in-app berichten.

## Planner (Actor) → Meldingen opvolgen (Action)

1. Ontvang een melding over een vertraging, incident of afwijking.
2. Analyseer de impact op de planning.
3. Neem indien nodig corrigerende maatregelen.

## Chauffeur (Actor) → Operationele notificaties ontvangen (Action)

1. Ontvang een nieuwe leveringsopdracht of routewijziging.
2. Bekijk de details van de melding.
3. Bevestig ontvangst en voer de opdracht uit.

## Ontvanger (Actor) → Leveringsupdates ontvangen (Action)

1. Ontvang een melding dat de levering onderweg is.
2. Bekijk de verwachte aankomsttijd en trackinginformatie.
3. Bereid de ontvangst van het pakket voor.

## Beheerder (Actor) → Systeemmeldingen opvolgen (Action)

1. Ontvang een waarschuwing over systeemfouten of storingen.
2. Analyseer het probleem.
3. Onderneem technische of operationele actie.

## Verzender (Actor) → Verzending opvolgen (Action)

1. Ontvang bevestiging dat het pakket is aangemaakt.
2. Volg statusupdates tijdens het transport.
3. Ontvang een melding bij succesvolle aflevering.

## Verantwoordelijkheden van het Notificatiecomponent

- Detecteren van relevante gebeurtenissen.
- Selecteren van de juiste ontvangers.
- Verzenden van meldingen.
- Registreren van verzendresultaten.
- Herproberen bij tijdelijke fouten.

## Voorbeelden van Gebeurtenissen

- Levering aangemaakt
- Route gewijzigd
- Chauffeur vertrokken
- ETA aangepast
- Vertraging vastgesteld
- Levering afgeleverd
- Levering mislukt
- Systeemfout gedetecteerd

## Doel

Het notificatiecomponent zorgt ervoor dat alle betrokken actoren steeds tijdig en correct geïnformeerd zijn, waardoor de communicatie, efficiëntie en klanttevredenheid aanzienlijk verbeteren.
