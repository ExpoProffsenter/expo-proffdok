# Personstyrt grunnpakke og tilvalg

Miljømål BEGGE. Arbeidsbranch `feat/bolig-partner-commerce-20261113` fra main `6eb54148b3d61e318c5447810cdf89deab6afffa`. Ikke produksjonssatt, ingen reelle rettigheter tildelt eller e-post sendt.

## Omfang
Navngitte brukere hos Bademiljø Expo, Expo Proffsenter og Ringside kan få eksplisitt prosjektadgang via eksisterende partnerkontakt. Lesing, individuell vare/arbeidstilpasning og felles katalog er separate rettigheter. Brukeren åpner Min side → Mine samarbeid. Arbeidsfirma og medlemskap beholdes. Prosjektleder deler ferdige forslag, beboer godkjenner selv.

## Implementert
Konto-/prosjektbundet privat tabell og kontrollert RPC. Tilgang kontrollerer registrert e-post, profil, internt medlemskap, aktiv partneradgang, firmaaktivering og prosjekt. Partnerlenke alene gir ikke kommersiell tilgang. Publisert/akseptert avtale og klargjort ordre stopper samarbeidsskriving. Eksisterende revisjon/audit og boligvalg brukes. Min side har kun to nye integrasjonslinjer; grensekontrollen fjerner akkurat disse og krever byteparitet for resten. Ingen generell tilgangskjerne endres.

## Kontroller
- Full lokal databasepakke PASS: 1877 assertions, inkludert vare-/arbeidslinjer, total, nabobolig isolert, separate rettigheter, endret e-post, utløp, deaktivert konto, tilbakekalling og publisert/akseptert avtale.
- React PASS: forsinket tilgangsoppfrisking beholder editor/utkast; samme tilgang beholder mount; tilbakekalling og ufullstendig svar fjerner editor. Faktisk dialog og CSS inngår; selve vareeditoren er stubbet i denne testen.
- KS/HMS/HR/Min side navigasjon PASS lokalt etter at transportfixture fikk den nye lesende RPC-en. Kontaktpåminnelsens nettleserfixture oppdatert med samme lesekall; ingen skrivekall lagt til tillatelseslisten.
- Full lokal build og critical checks PASS. Grensekontroll PASS (55 assertions), workflow-vernet PASS (147 opprinnelige kommandoer bevart).
- Hjelp, modulbeskrivelse og arkitektur oppdatert.

## Gjenstår før TEST OK
Full CI og faktisk Preview-kontroll av tildeling, varer/arbeid, utløp og tilbakekalling; kontrollert sandboxinstallasjon. Migrasjonen 20261113194437 er foreløpig ikke installert i hosted miljøer. Ingen produksjonsimport av Aamodthagen eller testpakker.

## Sandboxbinding 13.11 kl. 20:40 UTC
Før åpning ble manglende branchbinding oppdaget. Vercel EXPO_BACKEND_TARGET=sandbox er satt kun for Preview og feat/bolig-partner-commerce-20261113. Eksakt d0179dec ble redeployet som dpl_ACxgF1EbySrrek9B7KSHqhhSCSDd. Tidligere preview fra denne branchen skal ikke brukes. Ingen test ble utført mot denne gamle previewen. Nyeste commit må fortsatt få kontrollert buildbinding og visuell QA.
