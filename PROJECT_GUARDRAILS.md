# Expo ProffDok – permanente guardrails

Denne filen er en del av prosjektets sikkerhetskontrakt. Den skal leses før enhver kodeendring, også i nye chatter/faser.

## 1. Arbeidsmåte

Før implementering skal endringsscope beskrives eksplisitt: hvilke filer/funksjoner som får røres, og hvilke som ikke får røres.

Før implementering skal miljømålet alltid klassifiseres eksplisitt som ett av følgende:
- **PRODUKSJON/PREVIEW** – ordinær appkode som skal gjennom feature/Preview og senere Production.
- **SANDBOX/DEMO** – kun permanent Demo Sandbox, demodata, kontrollverktøy eller sandbox-overlay som aldri skal til Production.
- **BEGGE** – ordinær produksjonsendring som etter godkjent Production-verifisering også skal synkroniseres til permanent Demo Sandbox.

Hvis en oppgave gjelder funksjonalitet i produksjonsappen, er standard miljømål **BEGGE** med mindre brukeren uttrykkelig avtaler noe annet. Produksjonsendringen skal først følge vanlig løp: feature/hotfix → critical QA → Vercel Preview → brukerens `TEST OK` → merge til `main` → Production-verifisering. Deretter kan gjeldende `main` synkroniseres kontrollert inn i `demo`.

Permanent Demo Sandbox:
- branch: `demo`
- fast host: `https://expo-proffdok-git-demo-ringside.vercel.app`
- egen Supabase/Sandbox
- `demo` skal aldri merges tilbake til `main`
- synkretningen for ordinær appkode er **main → demo**
- demo-overlay, demodata, syntetiske bilder, demo-RPC-er, sandbox-konfigurasjon og øvrige demoressurser skal aldri flyte **demo → main**

Hvis det er uklart om en foreslått endring er PRODUKSJON/PREVIEW, SANDBOX/DEMO eller BEGGE, skal implementering stoppe til miljømålet er avklart. Works-status før kodeendring skal inneholde én kort linje: `Miljømål: ...`.

Etter implementering skal branch alltid sammenlignes mot `main`. Hvis diffen inneholder urelaterte filer eller funksjoner, stopp og rydd før videre test/merge.

**Ny funksjonalitet eller UX-endring er aldri ferdig bare fordi den nye funksjonen virker. Alle eksisterende brukerreiser som kan påvirkes av endringen skal verifiseres som fortsatt fungerende før `TEST OK` og merge. Grønn build alene er ikke tilstrekkelig.** Der det er praktisk mulig skal en feil som faktisk har nådd demo/produksjon få et permanent regresjonsvern i samme runde.

Ingen merge uten:
- grønn critical QA
- relevant Preview-test
- verifisering av både ny funksjon og berørte eksisterende brukerreiser
- brukerens eksplisitte `TEST OK`
- produksjonsverifisering etter merge
- ved miljømål **BEGGE**: kontrollert main → demo-synk og grønn sandbox-preflight før oppgaven regnes som helt ferdig

## 2. Urelatert funksjonalitet er fredet

Meny, navigasjon, Startside, Badskisse, prosjektflyt, tilgangsstyring, SQL/RLS/Storage, e-post og andre moduler skal ikke endres som sideeffekt av en avgrenset oppgave.

`main.jsx`, bootstrap/navigasjon eller globale menyer skal bare endres når de uttrykkelig er en del av avtalt scope og årsaken er bevist.

### 2.1 Automatisk PR-isolasjon

Repoet bruker `PR Core Safety` som server-side sikkerhetsnett på pull requests mot `main`.

Når en PR inneholder Demo/Test-kode, gjelder streng isolasjon. Demo-PR-en får bare endre demoens egne filer, dokumentasjon og eksplisitt avtalte integrasjonspunkter. Den får ikke samtidig endre blant annet:

- `src/modules/sales/**`
- `src/main.jsx` eller `src/bootstrap.jsx`
- arbeidsprofil-/tilgangskjerne
- prosjekt-, fremdrifts-, rapport- eller portal-kjerne
- Supabase/RLS/migrations
- eksisterende ikke-demo `critical-*`-checker

Hvis en demooppgave avdekker en reell feil i kjernen, skal denne ikke «fikses på veien» i demo-PR-en. Stopp, bevis rotårsaken, opprett en separat core-PR fra ren `main`, og kjør eget scope → critical QA → Preview → eksplisitt `TEST OK` før merge.

`PR Core Safety` skal aldri svekkes, omgås eller endres i samme Demo/Test-PR for å få en build grønn.

## 3. Kritiske brukerreiser som aldri skal regresere

Følgende er ikke-forhandlebare regresjonskrav:

1. `Rediger tilbud` → bytt nettleserfane/app → tilbake: samme sak og samme arbeidsbilde skal stå åpent.
2. `Befaringsnotat` → bytt nettleserfane/app/mobil dvale → tilbake: samme sak og samme arbeidsbilde skal stå åpent.
3. Ny nettleser/ny enhet/tom lokal cache → eksisterende tilbud: serverens tilbudslinjer og opsjoner skal være lastet før editor/autosave får starte.
4. Ny nettleser/ny enhet/tom eller strukturelt tom lokal kladd → eksisterende befaringsnotat: serverens tekst og bilder skal vises; tom lokal initialstate må aldri skjule serverdata.
5. Sjekkliste under utfylling → fanebytte/dvale: lagret eller lokalt sikret arbeid skal ikke forsvinne.
6. Bevisst navigasjon til Startsiden skal respekteres; gammel recovery-state skal ikke tvinge brukeren tilbake.
7. Ingen tom initialform får overskrive eksisterende serverdata under mount/remount/hydrering.
8. Mobil Safari/Chrome og desktop fanebytte skal følge samme sikkerhetsprinsipp: lokal sikring først, server som varig fasit, recovery bare ved reell konflikt.
9. **Bevisst brukerhandling vinner alltid over automatisk recovery i hele den interne appen.** Etter fanebytte/dvale skal første ekte brukerinteraksjon avslutte gammel foreground-recovery før `Tilbake`, `Lagre`, `Avbryt`, menyvalg, Startside eller annen navigasjon behandles. Senere recovery-timere må aldri kunne reversere brukerens valg.
10. `Prissøk` → appbytte/dvale → tilbake: samme Prissøk-arbeidsflate skal gjenåpnes når den faktisk var aktiv, og valgte varer i den midlertidige arbeidslisten skal fortsatt være tilgjengelige. Bevisst navigasjon bort fra Prissøk skal rydde denne recovery-markøren.

## 4. Server-first + local safety

For data som allerede finnes på server:
- serverdata skal hydreres før editoren åpnes på ny enhet/nytt domene
- strukturelt tom lokal initialstate må aldri overstyre meningsfull serverdata
- meningsfull lokal/offline-kladd skal bevares og aldri slettes stille
- konflikt mellom to reelle versjoner skal vises tydelig for bruker før valg

## 5. Critical QA skal være permanent

Regression-checker som beskytter punktene over skal ikke fjernes, svekkes eller omgås for å få en build grønn.

Dersom en test må endres fordi ønsket funksjonalitet faktisk endres, skal årsak, risiko og ny kontrakt beskrives før endringen utføres.

Strukturelle kildekodesjekker er nyttige, men kritiske brukerreiser skal så langt mulig dekkes av scenario-/runtime-tester som faktisk simulerer hendelsesforløpet.

## 6. Demo-/produksjonsfreeze

Før demo, kurs eller annen viktig produksjonsbruk prioriteres stabilitet fremfor nye funksjoner. Etter siste godkjente produksjonstest innføres midlertidig freeze: ingen nye funksjonsendringer før demoen er ferdig, med mindre det gjelder en kritisk feil.

Under demo-freeze gjelder i tillegg:
- nye Production-endringer skal ikke introduseres uten at konsekvensen for `demo` er vurdert
- hvis Production må hotfikses før demo, skal `demo` synkroniseres fra gjeldende `main` og preflightes på nytt før den brukes
- sandbox-preflight skal kjøres rett før viktig demo, ikke bare da Golden Demo ble etablert
- rapport/PDF som skal vises i demo skal eksplisitt kvalitetskontrolleres på ny generert fil; gammel PDF er ikke bevis på gjeldende tilstand

## 7. Handoff til ny chat/fase

Ny chat skal starte med å lese:
1. `AGENTS.md`
2. `PROJECT_GUARDRAILS.md`
3. relevante critical checks
4. faktisk `main`
5. siste branch/PR-historikk for funksjonen som skal endres
6. ved demoarbeid: permanent `demo`-baseline og siste sandbox-preflight

Gamle muntlige løfter eller chatminne er ikke nok. Repoets guardrails og tester er den varige kontrakten.
