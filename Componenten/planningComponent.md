# Logisch Component - Planning

**Auteur**: Dylan Havelaerts
**Component**: Planning
**Workflow**: Actor - Action

**Actoren**:

- Planner
- Chauffeur
- Beheerder
- Verzender
- Ontvanger

---

#### Beschrijving

Het Planning-component is verantwoordelijk voor het toewijzen van pakketten aan voertuigen en het berekenen van de optimale route. Daarnaast berekent het de verwachte aankomsttijd (ETA) van zendingen, zodat deze informatie via events soepel kan worden doorgegeven aan andere componenten.

#### Planner (Actor) -> Routes en planning beheren (Action)

1. Bekijk ongeplande bestellingen, beschikbare capaciteit en actuele voertuigstatussen
2. Trigger de automatische route-optimalisatie of voer handmatige wijzigingen uit.
3. Bevestig de route en zet deze vast, verstuur dit door naar de chauffeur.

#### Chauffeur (Actor) -> Toegewezen ritten uitvoeren (Action)

1. Haal de actuele dagplanning op inclusief de geoptimaliseerde volgorde van de stops.
2. Registreer de start van de route en het voltooien (of falen) van individuele leveringen.
3. Meld afwijkingen of vertragingen tijdens de rit zodat de planning dynamisch kan worden bijgewerkt.

#### Beheerder (Actor) -> Planningsparameters configureren (Action)

1. Stel systeeminformatie en regels in (bv. aantal chauffeurs, voertuigcapaciteit).
2. Monitor de prestaties en efficiente van de berekende routes.

#### Verzender (Actor) → Leveringsvereisten sturen (Action)

1. Geef specifieke tijdsloten of prioriteiten ("same day delivery") mee aan een nieuw pakket.
2. Annuleer of wijzig een leveringsadres voordat het pakket aan een route is toegewezen.
3. (Het planningcomponent verwerkt deze regels automatisch in het systeem).

#### Ontvanger (Actor) → Leveringsmoment wijzigen (Action)

1. Vraag een wijziging aan voor het aflevermoment (bijv. "Niet thuis, lever morgen").
2. (Het planningcomponent verwijdert de stop uit de actuele route en plaatst het pakket terug in de wachtrij voor een nieuwe dagplanning).

#### Verantwoordelijkheden van het planning component

- Verzamelen van nieuwe bestellingen en toewijzen aan beschikbare resources.
- Berekenen van de meest efficiënte routes om reistijd te minimaliseren.
- Berekenen en continu updaten van de verwachte aankomsttijden (ETA).
- Dynamisch herplannen van ritten bij onvoorziene incidenten.
- Publiceren van planningsupdates voor de andere modules.

#### Voorbeelden van gebeurtenissen

- Route succesvol berekend
- Pakket toegewezen aan voertuig
- Verwachte aankomsttijd (ETA) bijgewerkt
- Handmatige planningswijziging doorgevoerd
- Dynamische herplanning vereist door afwijking of klantverzoek
- Stop gemarkeerd als voltooid

#### Doel

Het Planningcomponent zorgt ervoor dat de logistieke operatie zo efficiënt mogelijk verloopt door ritten slim te optimaliseren. Het minimaliseert operationele kosten en reistijd, en functioneert als de bron voor de route en tijdsinschattingen richting de rest van het systeem.
