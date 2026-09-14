# Expo ProffDok – permanente guardrails

Denne filen er en del av prosjektets sikkerhetskontrakt. Den skal leses før enhver kodeendring, også i nye chatter/faser.

## 1. Arbeidsmåte

Før implementering skal endringsscope beskrives eksplisitt: hvilke filer/funksjoner som får røres, og hvilke som ikke får røres.

Etter implementering skal branch alltid sammenlignes mot `main`. Hvis diffen inneholder urelaterte filer eller funksjoner, stopp og rydd før videre test/merge.

Ingen merge uten:
- grønn critical QA
- relevant Preview-test
- brukerens eksplisitte `TEST OK`
- produksjonsverifisering etter merge

## 2. Urelatert funksjonalitet er fredet

Meny, navigasjon, Startside, Badskisse, prosjektflyt, tilgangsstyring, SQL/RLS/Storage, e-post og andre moduler skal ikke endres som sideeffekt av en avgrenset oppgave.

`main.jsx`, bootstrap/navigasjon eller globale menyer skal bare endres når de uttrykkelig er en del av avtalt scope og årsaken er bevist.

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

## 7. Handoff til ny chat/fase

Ny chat skal starte med å lese:
1. `AGENTS.md`
2. `PROJECT_GUARDRAILS.md`
3. relevante critical checks
4. faktisk `main`
5. siste branch/PR-historikk for funksjonen som skal endres

Gamle muntlige løfter eller chatminne er ikke nok. Repoets guardrails og tester er den varige kontrakten.
