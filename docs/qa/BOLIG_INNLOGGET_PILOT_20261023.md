# Innlogget Bolig-pilot – 23. oktober 2026

Miljømål BEGGE for to avgrensede UI-rettelser. Pilotdata er kun SANDBOX/DEMO. Start-SHA 2c883138d443b55a7f924d3588d3c6f5c2cc505b, CI648 / 39991110209 SUCCESS. PR278 fortsatt OPEN DRAFT; ingen Bolig TEST OK eller produksjonsmerge. Samme faste branch-Preview beholdes.

## Scope bestemt før kode

BoligResidentNoticeComposer.jsx: kontaktseksjonens åpne/lukkede tilstand. BoligGantt.jsx: gruppevisningens rekkefølge. Eksisterende progress- og coordination-browser-check får permanente regresjonsscenarioer. Relevant hjelp, README, arkitektur, dette QA-notatet, syntetisk pilotbevis og handoff. Ingen SQL, backend, e-post, menyer eller andre moduler. AGENTS/guardrails og relevante tester lest. Branch sammenlignet mot main før/etter; eksisterende hoved-PR-scope beholdt.

## Faktisk innlogget pilot, ikke mock

Cloud Chromium på samme feature-Preview, demo@expo-proffdok.no / Expo Proffsenter, Sandbox ppvircenkjizeiqdxphj. Eksisterende prosjekt `80821082-c64a-41a9-91cb-db2aa049ed2e`, «DEMO – Boligpilot med 40 leiligheter», ble gjennomgått; ingen ny pilot bygget i UI i denne økten.

- Struktur: Pilotbygg A/B, Demoparken 101/103, 40 boliger. 20 faktiske boligknapper i aktivt byggbilde; proporsjonalt bilde uten strekk.
- H0101: Bad / DEMO Standardbad, to fiktive varer à 1. Akseptert boligvalg. Eksisterende endringsforslag v1 er fortsatt utkast, 1250 kr, med batteri 1→2; original leverandørordre B-3 har fortsatt antall 1, status Delvis levert, servant mottatt 1/1 og batteri 0/1. Ingen beboerlenke opprettet eller avtale akseptert i denne økten.
- Åpne forhold: «Rosett kontrollert», kildekontroll og overtakelse beholdt. Åpne aktivitet endret faktisk oppgavens ansvarlig til fiktiv demo.ansatt1@expo-proffdok.invalid og slutt til 31.10.2026. Usendt kladd overlevde lukking/gjenåpning. Etter serverlagring samme task-ID ee51e319-683f-4d9d-9f69-a3840cf64961, task revision 3, global plan revision 5, fortsatt 161 oppgaver og én kobling. Overtakelsesvurderingens ansvar er separat og urørt. Syntetisk prøvetilstand beholdes.
- Faktisk UI-eksport lastet ned PDF/ZIP. ZIP har Samlet-dokumentasjon.pdf, Lagret-dokumentasjon-og-historikk.json, Filmanifest.json og LES-MEG.txt. Den vedlagte PDF-en er ekstrahert uendret fra faktisk ZIP: 9 sider, 45383 byte, SHA256 99d4bd14336d799e546d910d81c04b45ac8bda17a535298eaa27822f51aba017. Alle sider rendret og visuelt kontrollert: logo, H0101, åpen rosett, overtakelse med restpunkter og tydelig manglende FDV-lenker. Ingen H0102 eller foreslått ubestilt antallsøkning i originalbestillingen. Første separate PDF-nedlasting var ikke tilgjengelig i delt filsystem; beviset er filen fra ZIP.
- Beboervarsel: utkast for ett helt bygg / 20 boliger, firmalogo og kontakt. Bare 2 boliger har navn/e-post, 18 mangler: digital publisering sperret, papir mulig. Ingen meldinger/e-post publisert eller sendt. Sandbox progress-mail fortsatt AV, pending/sending 0 både før og etter aktivitetsskriving.

## Feil funnet og rettet

Kontaktseksjonen lukket seg ved første naturlig tastede bokstav fordi open var avledet fra !contact.name. Egen lokal contactOpen følger nå brukerens details-toggle og initial åpning; navneendring lukker ikke feltet. Gantt viste boliggrupper i databasens ankomstrekkefølge. En kopi av gruppene sorteres nå naturlig etter adresse, bolignummer og ID. Gruppe-/fagvisning sorteres etter navn. Oppgaver, ID-er, datoer og lagringsgrunnlag endres ikke av sorteringen.

Native dato-input: Cloud fill endret live DOM-verdi uten React-event. Vanlig tastatur ga korrekt lokal kladd, gjenåpning og faktisk lagring av 31.10. Dette var et verktøyavvik og utløste ingen appendring.

## QA og publisering

PASS: progress Chromium 39 asserts (35 tidligere beholdt + naturlig typing, manuell lukking/gjenåpning); koordinering/dialog 50 (48 tidligere beholdt + reversert oppgaverekkefølge på desktop/mobil); plan 30; direkte restpunkt 43. Overtakelse/guide 34 og faktisk varsel-PDF 28 PASS. Full critical build, scope/docs/diff PASS. Ny Preview/CI-status dokumenteres ved publisering i PR278. Ingen tidligere verifikasjon regnes som bevis for ny commit; eksakt SHA og READY skal avleses etter push.

## Kort brukerprøve og grenser

Samme faste Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Pilot → Fremdrift og varsler: boliger følger adresse og bolignummer. Aktiviteter/datoer skal være de samme.
2. Nytt beboervarsel → Kontaktperson på varslet: skriv hele navnet bokstavvis; seksjonen skal holde seg åpen. Lukk og åpne den selv, kontroller beholdt navn.
3. Velg Et helt bygg / Pilotbygg A → Last ned PDF / oppslag. Logo, riktig bygg, kontakt og 20 boliger; ingen privat beboerliste på oppslaget.

Fysisk Safari og Kenneths egen Bolig TEST OK gjenstår. Meldings-/beboeraksept og nye leverandørbestillinger er ikke gjennomført med faktiske mottakere. E-postmottak er ikke prøvd. Dette er en innlogget gjennomgang med avgrensede faktiske skrivinger/eksport, ikke påstand om at samtlige stadier ble opprettet på nytt i UI.
