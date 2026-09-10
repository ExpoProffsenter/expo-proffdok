# FASE 41B.1 – Sales-søk og korrekt supportmodus

## Mål

Fasen forbedrer arbeidsoversikten i Befaring/Tilbud og gjør systemadministratorens supportmodus forutsigbar og sikker. Support skal vise målbedriftens Sales-data og målbrukerens modultilganger, uten å bli en generell skrivebypass.

## Sales-søk

`SalesListView.jsx` bruker tokensøk på tvers av kunde, adresse, e-post, telefon, saksreferanse, tittel, ansvarlig, tilbudstype, status og tilbudsinnhold. Alle søkeord må finnes i den samlede søketeksten, men kan ligge i ulike felt.

Når brukeren starter et nytt søk, settes statusfanen til `Alle` slik at søket ikke skjules av en tidligere valgt status som `Under arbeid`. Brukeren kan deretter snevre inn igjen ved å velge en statusfane.

Eksisterende tilbudstypefaner og statusfaner beholdes. Fasen bygger ikke et nytt statusregime.

## Supportmodus

`src/modules/access/supportModeProjection.js` knytter hovedappens prosjekt-supportmodus til eksisterende modultilgangs- og Sales-supportmekanismer.

Når systemadministrator åpner et prosjekt i supportmodus:

- målbrukeren identifiseres fra prosjekteier i supportbanneret
- målbrukerens faktiske `module_keys` projiseres til meny og Hjelp
- Sales får korrekt `salesSupportCompany` for målbedriften
- Butikktilbud skjules dersom målbrukeren ikke har `store_offers`
- Butikktilbud fjernes uansett for firmaer utenfor godkjent Butikktilbud-scope
- Systemadmin skjules dersom målbrukeren ikke er systemadministrator
- målbedriftens eksisterende Sales-saker kan åpnes og kontrolleres
- nye forespørsler/tilbud opprettes ikke fra supportmodus

Systemadministrator er fortsatt den autentiserte brukeren. Backend/RLS og eksisterende RPC-er er fortsatt den autoritative sikkerhetsgrensen. Supportprojeksjonen gir ikke nye databaserettigheter.

## Opprettelse og skriving i supportmodus

Supportmodus skal brukes til feilsøking og kontroll. Nye saker må opprettes av målbedriften slik at korrekt saksansvarlig, firmatilhørighet og sporbarhet registreres. UI viser derfor `Ny forespørsel sperret` i Sales-supportmodus.

Supportmodus skal ikke brukes som skrivebypass for publisering, prosjektaktivering eller andre handlinger som normalt krever målbrukerens rettigheter.

## Avslutt supportmodus

Når `Avslutt supportmodus` brukes:

1. prosjekt-supporten ryddes av hovedappen
2. projisert modultilgang og administrert Sales-scope fjernes
3. appen går kontrollert tilbake til ren `Systemadmin`-URL
4. innlogget systemadministrators eksisterende profil lastes på nytt
5. eget firma, logo og modultilganger gjenopprettes uten ut-/innlogging

Refresh mens et supportprosjekt fortsatt er aktivt laster samme supportprosjekt igjen. Det er forventet oppførsel.

## Header og desktop-Hjelp

Sales sin interne header bruker ikke lenger et `<header>`-element som arver hovedappens globale sticky-regel. Dermed legger Sales-headeren seg ikke over hovedheaderen ved scrolling.

Desktop-knappen `? Hjelp` ligger stabilt i den kollapsbare desktopmenylinjen i stedet for å være en separat flytende knapp med geometrisk plassering.

## Hjelp

Eksisterende Hjelp-tekster er kontrollert mot denne fasen. De beskriver allerede at meny/Hjelp følger tildelte moduler, at backend/RLS er sikkerhetsgrensen, og at support ikke er en skrivebypass. Det var derfor ikke nødvendig å duplisere eller omskrive Hjelp-innholdet i denne fasen.

## Critical QA

`scripts/critical-sales-overview-check.mjs` inngår i `npm run build` og beskytter blant annet:

- supportbruker-parseren
- bruk av eksisterende modultilgang og Sales-supportscope
- skjuling/gjenoppretting av Systemadmin i supportmodus
- blokkert Butikktilbud når målbrukeren mangler tilgang
- globalt søk og automatisk overgang til `Alle`
- at Sales-headeren ikke igjen blir global sticky-header
- at den gamle DOM-baserte søkeadapteren ikke gjeninnføres
- stabil plassering av Hjelp i desktopmenyen

## Godkjent Preview-scenario

Preview ble manuelt verifisert med Ringen Rørservice:

- supportmodus viser Ringen Rørservice og 2 eksisterende Sales-saker
- Butikktilbud er ikke tilgjengelig
- Systemadmin er ikke tilgjengelig for den projiserte målbrukeren
- `Avslutt supportmodus` gjenoppretter Ringside/systemadministrator
- søk etter `Camilla` fra `Under arbeid` går til `Alle` og viser 2 treff på tvers av Akseptert/Avvist
- ingen databaseendring var nødvendig for implementasjonen
