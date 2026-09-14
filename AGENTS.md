# Expo ProffDok – agentinstruks

Før du analyserer eller endrer kode i dette repoet:

1. Les `PROJECT_GUARDRAILS.md` i sin helhet.
2. Les eksisterende critical checks for området som skal endres.
3. Sammenlign aktuell branch mot `main` før og etter implementering.
4. Definer eksplisitt hvilke filer/funksjoner som er innenfor scope før du skriver kode.
5. Ikke endre meny, navigasjon, Startside, Badskisse, andre moduler, backend eller database som sideeffekt av en avgrenset oppgave.
6. Ikke merge uten relevant Preview-test, grønn critical QA og brukerens eksplisitte `TEST OK`.

For Befaring/Tilbud er server-first-hydrering, bevaring av lokal/offline-kladd, desktop fanebytte og mobil dvale permanente regresjonskrav. Disse kravene og tilhørende critical checks skal ikke fjernes eller svekkes for å få en build grønn.
