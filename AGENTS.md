# Expo ProffDok – agentinstruks

Før du analyserer eller endrer kode i dette repoet:

1. Les `PROJECT_GUARDRAILS.md` i sin helhet.
2. Les eksisterende critical checks for området som skal endres.
3. Sammenlign aktuell branch mot `main` før og etter implementering.
4. Definer eksplisitt hvilke filer/funksjoner som er innenfor scope før du skriver kode.
5. Klassifiser miljømålet eksplisitt før implementering som **PRODUKSJON/PREVIEW**, **SANDBOX/DEMO** eller **BEGGE**.
6. Hvis endringen gjelder funksjonalitet i produksjonsappen, er standard miljømål **BEGGE**. Produksjonsendringen skal først følge feature/Preview → critical QA → `TEST OK` → merge → Production-verifisering. Deretter synkroniseres gjeldende `main` kontrollert inn i permanent `demo` når funksjonen også skal være tilgjengelig der.
7. Synkretningen er **main → demo**. Demo-overlay, demodata, syntetiske ressurser, sandbox-RPC-er og sandbox-konfigurasjon skal aldri flyte **demo → main**.
8. Ikke endre meny, navigasjon, Startside, Badskisse, andre moduler, backend eller database som sideeffekt av en avgrenset oppgave.
9. Demo/Test eller annen isolert presentasjonsfunksjon skal ikke endre eksisterende Sales recovery, autosave, hydration, navigasjon, RLS/backend eller andre beskyttede kjerner i samme PR. `PR Core Safety` skal være grønn. Hvis guard-en stopper en endring, skal kjerneendringen splittes ut i egen PR fra ren `main` med eget scope og ny eksplisitt godkjenning.
10. Ikke merge uten relevant Preview-test, grønn critical QA og brukerens eksplisitte `TEST OK`.

I Works-modus skal status før kodeendring oppgis kort som `Miljømål: PRODUKSJON/PREVIEW`, `Miljømål: SANDBOX/DEMO` eller `Miljømål: BEGGE`. Hvis miljømålet er uklart, stopp før implementering og avklar.

For Befaring/Tilbud er server-first-hydrering, bevaring av lokal/offline-kladd, desktop fanebytte og mobil dvale permanente regresjonskrav. Disse kravene og tilhørende critical checks skal ikke fjernes eller svekkes for å få en build grønn.
