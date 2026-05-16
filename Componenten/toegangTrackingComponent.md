# Toegangcomponent

Het toegangcomponent fungeert als de beveiligingsgateway van de applicatie. Dit component is verantwoordelijk voor het beschermen van gevoelige bedrijfsgegevens en de privacy van klanten door middel van strikte toegangscontrole en verificatie.

## Alle Actoren (Actor) → Systeemtoegang verkrijgen (Action)

1. Voert de benodigde identificatiegegevens in (zoals gebruikersnaam, wachtwoord en eventueel Multi-Factor Authentication).
2. Wacht op de systeemvalidatie van de ingevoerde gegevens op juistheid en authenticiteit.
3. Verkrijgt een actieve, beveiligde sessie en krijgt toegang tot de functionaliteiten die bij zijn of haar rol passen.

## Beheerder (Actor) → Accounts en beveiliging beheren (Action)

1. Opent het beheerdersdashboard om accounts aan te maken, te wijzigen of te verwijderen.
2. Wijzigt autorisaties (Role-Based Access Control) of dwingt beveiligingsbeleid af.
3. Raadpleegt de audit logs om inlogpogingen of wijzigingen in toegangsrechten te controleren voor security-audits.

## Verantwoordelijkheden van het Toegangcomponent

- **Authenticatie:** Verifiëren van de identiteit van gebruikers via veilige inlogprocedures.
- **Autorisatie (RBAC):** Toekennen en handhaven van specifieke rechten op basis van de gebruikersrol (een chauffeur heeft bijvoorbeeld andere rechten dan een planner).
- **Sessiebeheer:** Veilig initialiseren, actief monitoren en veilig beëindigen van gebruikerssessies om onbevoegde toegang te voorkomen.
- **Audit Logging:** Bijhouden van een onweerlegbaar logboek van alle inlogpogingen en wijzigingen in toegangsrechten.
- **Toegankelijkheid:** Zorgen voor duidelijke foutafhandeling met betekenisvolle foutmeldingen en invoervelden die voldoen aan de WCAG-richtlijnen.

## Doel

Het toegangcomponent zorgt ervoor dat uitsluitend geautoriseerde personen de applicatie kunnen gebruiken, dat data afgeschermd blijft voor buitenstaanders, en dat elke actie in het systeem safe herleid kan worden naar een specifieke gebruiker. Hierdoor wordt een veilige fundering voor alle andere systeemcomponenten gelegd.
