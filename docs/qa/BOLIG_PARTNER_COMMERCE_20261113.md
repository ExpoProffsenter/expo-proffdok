# Personstyrt grunnpakke og tilvalg

Miljømål BEGGE. Arbeidsbranch `feat/bolig-partner-commerce-20261113` fra main `6eb54148b3d61e318c5447810cdf89deab6afffa`. Ikke produksjonssatt, ingen reelle rettigheter tildelt eller e-post sendt.

## Omfang
Navngitte brukere hos Bademiljø Expo, Expo Proffsenter og Ringside kan få eksplisitt prosjektadgang via eksisterende partnerkontakt. Lesing, individuell vare/arbeidstilpasning og felles katalog er separate rettigheter. Brukeren åpner Min side → Mine samarbeid. Arbeidsfirma og medlemskap beholdes. Prosjektleder deler ferdige forslag, beboer godkjenner selv.

## Implementert
Konto-/prosjektbundet privat tabell og kontrollert RPC. Tilgang kontrollerer registrert e-post, profil, internt medlemskap, aktiv partneradgang, firmaaktivering og prosjekt. Partnerlenke alene gir ikke kommersiell tilgang. Publisert/akseptert avtale og klargjort ordre stopper samarbeidsskriving. Eksisterende revisjon/audit og boligvalg brukes. Min side har kun to nye integrasjonslinjer; grensekontrollen fjerner akkurat disse og krever byteparitet for resten. Ingen generell tilgangskjerne endres.

## Kontroller
- Første databasepakke bestod 1864 assertions. Utvidet variant bekreftet nye vare-/arbeidslinjer, sum og uendret nabobolig, men traff en forventningsfeil: allerede tilpasset pakke gir PT409 før skriverettskontroll. Testen kontrollerer nå begge sperrene separat; ny full pakke pågår.
- React: forsinket tilgangsoppfrisking beholder editor og usendt tekst; samme tilgang beholder mount; tilbakekalling fjerner editor. PASS. Dialogutvidelsen kontrolleres videre.
- Full lokal build og critical checks PASS. Grensekontroll PASS (55 assertions), workflow-vernet PASS (147 opprinnelige kommandoer bevart).
- Hjelp, modulbeskrivelse og arkitektur oppdatert.

## Gjenstår før TEST OK
Full CI og faktisk Preview-kontroll av tildeling, varer/arbeid, utløp og tilbakekalling; kontrollert sandboxinstallasjon. Migrasjonen 20261113194437 er foreløpig ikke installert i hosted miljøer. Ingen produksjonsimport av Aamodthagen eller testpakker.
