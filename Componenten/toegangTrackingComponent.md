# Logische Componenten: Toegang en Tracking

## 1. Actor-Action Workflow Mapping

De onderstaande tabel geeft de interacties weer tussen de actoren en de specifieke acties die binnen deze componenten vallen.

| Actor            | Actie                                                             | Component |
| :--------------- | :---------------------------------------------------------------- | :-------- |
| **Beheerder**    | Beheert accounts, rollen en beveiligingsbeleid.                   | Toegang   |
| **Alle Actoren** | Identificeren en authenticeren zich voor toegang tot het systeem. | Toegang   |
| **Chauffeur**    | Verstuurt tijdens de rit automatisch real-time locatie-updates.   | Tracking  |
| **Ontvanger**    | Raadpleegt de live locatie en de verwachte aankomsttijd (ETA).    | Tracking  |
| **Planner**      | Monitort de vlootlocaties voor operationele bijsturing.           | Tracking  |
| **Verzender**    | Volgt de voortgang van zendingen en ontvangt statusmeldingen.     | Tracking  |

---

## 2. Toegang Component

De Toegang component fungeert als de beveiligingsgateway van de applicatie. Deze component is verantwoordelijk voor het beschermen van gevoelige bedrijfsgegevens en klantprivacy door strikte toegangscontrole.

### Uitdrukkelijke Taken:

- **Authenticatie:** Het verifiëren van de identiteit van gebruikers via veilige inlogprocedures (bv. wachtwoorden en Multi-Factor Authentication).
- **Autorisatie (RBAC):** Het toekennen van specifieke rechten op basis van de gebruikersrol (bv. een chauffeur heeft andere rechten dan een planner).
- **Sessiebeheer:** Het veilig initialiseren, monitoren en beëindigen van actieve gebruikerssessies om onbevoegde toegang te voorkomen.
- **Audit Logging:** Het bijhouden van een onweerlegbaar logboek van alle inlogpogingen en wijzigingen in toegangsrechten voor security-audits.

> Voor deze component is een duidelijke foutafhandeling cruciaal voor de toegankelijkheid. Gebruik van betekenisvolle foutmeldingen en zorg voor duidelijke invoervelden die voldoen aan de WCAG-richtlijnen.

---

## 3. Tracking Component

De Tracking component is verantwoordelijk voor de verwerking van real-time datastromen. Het vertaalt ruwe technische data (telemetrie) naar begrijpelijke informatie voor de eindgebruiker.

### Uitdrukkelijke Taken:

- **Telemetrie Data-inname:** Het efficiënt ontvangen en valideren van hoogfrequente GPS-coördinaten van duizenden voertuigen simultaan.
- **Real-time Koppeling:** Het mappen van inkomende GPS-coördinaten aan de actieve rit- en pakketgegevens.
- **Dynamische ETA-berekening:** Het constant herberekenen van de verwachte aankomsttijd op basis van de huidige positie en externe verkeersdata.
- **Geovisualisatie Data-voorbereiding:** Het transformeren van ruwe coördinaten naar een gestructureerd formaat voor weergave op web-gebaseerde kaarten.
