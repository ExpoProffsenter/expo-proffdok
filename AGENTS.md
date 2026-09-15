# Expo ProffDok – agentinstruks

Før du analyserer eller endrer kode i dette repoet:

1. Les `PROJECT_GUARDRAILS.md` i sin helhet.
2. Les eksisterende critical checks for området som skal endres.
3. Sammenlign aktuell branch mot `main` før og etter implementering.
4. Definer eksplisitt hvilke filer/funksjoner som er innenfor scope før du skriver kode.
5. Klassifiser miljømålet eksplisitt før implementering som **PRODUKSJON/PREVIEW**, **SANDBOX/DEMO** eller **BEGGE**.
6. Hvis endringen gjelder funksjonalitet i produksjonsappen, er standard miljømål **BEGGE**. Produksjonsendringen skal først følge vanlig feature/Preview → `TEST OK` → merge → Production-verifisering. Deretter skal samme produksjonskode synkroniseres til demo-sandboxen og sandbox-preflight verifiseres før oppgaven regnes som helt ferdig.
7. Sandbox-spesifikke demo-data, kontrollflater, testillustrasjoner, demo-RPC-er eller konfigurasjon skal aldri flyttes til Production som følge av denne synken. Synkretningen for appkode er **Production/main → sandbox**, mens sandbox-overlay forblir isolert.
8. Ikke endre meny, navigasjon, Startside, Badskisse, andre moduler, backend eller database som sideeffekt av en avgrenset oppgave.
9. Ikke merge uten relevant Preview-test, grønn critical QA og brukerens eksplisitte `TEST OK`.

I Works-modus skal status før kodeendring oppgis kort som `Miljømål: PRODUKSJON/PREVIEW`, `Miljømål: SANDBOX/DEMO` eller `Miljømål: BEGGE`. Hvis miljømålet er uklart, stopp før implementering og avklar.

For Befaring/Tilbud er server-first-hydrering, bevaring av lokal/offline-kladd, desktop fanebytte og mobil dvale permanente regresjonskrav. Disse kravene og tilhørende critical checks skal ikke fjernes eller svekkes for å få en build grønn.
