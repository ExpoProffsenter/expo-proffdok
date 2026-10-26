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
10. For app-/backendendringer: ikke merge uten relevant Preview-test, grønn critical QA og brukerens eksplisitte `TEST OK`. Se unntaket for ren dokumentasjon/CI i arbeidsflyten nedenfor.

I Works-modus skal status før kodeendring oppgis kort som `Miljømål: PRODUKSJON/PREVIEW`, `Miljømål: SANDBOX/DEMO` eller `Miljømål: BEGGE`. Hvis miljømålet er uklart, stopp før implementering og avklar.

For Befaring/Tilbud er server-first-hydrering, bevaring av lokal/offline-kladd, desktop fanebytte og mobil dvale permanente regresjonskrav. Disse kravene og tilhørende critical checks skal ikke fjernes eller svekkes for å få en build grønn.

## Brukertest og enkel veiledning

- Etter en endring som brukeren skal prøve, gi en kort, konkret testliste: hvilken fane/knapp som brukes, hva brukeren gjør, og hva som skal vises etterpå. Testlisten skal følge de faktiske knappnavnene i publisert Preview. Oppgi hvilke tester utvikleren har gjort, og hva som fortsatt krever innlogget brukerprøve.
- Bruk samme faste branch-Preview-adresse ved oppdateringer. Gi ikke en ny deploy-adresse som vanlig testlenke når en fast adresse finnes. Ikke krev ny innlogging bare fordi ny kode publiseres. Varig innlogging i samme nettleser/adresse er forventet; faktisk øktutløp og nettleserbytte må skilles fra ny deploy.
- Skriv hjelpetekst så en 12-åring kan forstå hva som skal gjøres, uten barnslig tone. Bruk korte setninger og konkrete verb. Hver fane eller fase skal forklare «Hva gjør jeg her?» og «Hva gjør jeg etterpå?». Forklar nødvendige fagord når de brukes.
- Skill tydelig mellom eget utkast, lagring, firmagodkjenning og ansattes bekreftelse. Enkel tekst må fortsatt beskrive riktige roller og krav. Ikke gi inntrykk av at klikk på et forslag publiserer en rutine eller at lesebekreftelse erstatter opplæring.

## Effektiv arbeidsflyt (26.10.2026)

- Følg `docs/DEVELOPMENT_WORKFLOW.md`. Ett varig endrings-/testgrunnlag per rettelse; oppdater bare dokumentasjonen som faktisk berøres. Ikke kopier releaselogg til README, arkitektur og Hjelp ved hver feilretting.
- Brukerens `TEST OK` kan bygge på dokumenterte utvikler-/regresjonstester når brukeren ikke kan gjenskape feilen. Oppgi hva som er gjenskapt, testet og fortsatt usikkert. Ikke krev at brukeren selv fremprovoserer en økt-/enhetsavhengig feil.
- Gjenbruk grønn QA for uendret kandidat og samme relevante grunnlag. Kjør berørt feilet pakke igjen etter årsaksvurdering; ikke endre testen bare for å få grønt. Endret kode, avhengighet eller integrasjonsgrunnlag krever ny relevant kontroll.
- Rene dokumentasjons-/CI-/regelendringer uten app-/backend-/konfigurasjonsendring krever passende automatiske kontroller og brukerens oppdrag, men ingen kunstig innlogget Preview-prøve eller ny `TEST OK` for uendret app. Oppdraget må faktisk omfatte regel-/CI-endringen.
- Bruk eksisterende arbeidsbranch og fast Preview når praktisk mulig. Etter appens `TEST OK` fullføres Production og kontrollert main → demo uten ny godkjenningsrunde.
