# Avviksdialog og removeChild-feil – 7. oktober 2026

Miljømål: **BEGGE**. Arbeid fra kontrollert feature-HEAD 794a9e5f4e875f4212ad4123c46d518446e87dce. Main 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen merge eller Production-/demo-oppdatering i denne runden.

## Brukerens problem

Koble til KS/HMS viste appens feilside. Teknisk informasjon i nytt skjermbilde: `Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.` Nytt HMS/prosjektavvik spurte bare om tittel i window.prompt, hoppet til toppen og hadde fritekstansvarlig.

## Påvist årsak og avgrensning

Den faktiske bottomPrevNext-rendereren i main.jsx ga React flere tekstnoder, inkludert betingede tekstbiter for previousTab/nextTab. projectWorkflowUx.js kan erstatte button.textContent. Når React deretter fjerner de betingede nodene ved overgang til KS/HMS, er de allerede fjernet av adapteren. En isolert prøve med faktisk JSX-runtime, React DOM, jsdom 26.1.0, faktisk renderer og faktisk updateDesktopFlowButton gjenskaper `The node to be removed is not a child of this node.` før rettelsen. Samme prøve passerer etter rettelsen. Live kobling før rettelsen åpnet i denne skyøkten; brukerens eksakte fane-/timingforløp ble ikke gjenskapt der.

Rettelse: to knappetiketter rendres som én tekstverdi. Menyrekkefølge, mål, goToTab og adapteren endres ikke. critical-project-navigation-check.mjs kontrollerer den faktiske rendererens knapper med prosjektmål og uten mål, inkludert tekst/én host-tekstverdi.

Øvrig scope: deviationViewTools.js, ProjectDeviationCreator.jsx, DeviationDialog.jsx, deviationDialog.css, projectDeviationCreate.mjs, KshmsDeviations.jsx; kun avvikets nødvendige props/save/open-callbacker i main.jsx; eksisterende to critical-checker og KS/HMS-dokumentasjon. Ingen SQL/RLS/Auth/Storage/e-post-endring.

## Ny opprettelse

Nytt HMS/prosjektavvik åpner en stor React-eid dialog med tittel, beskrivelse, type/alvorlighet, ansvarlig, frist og strakstiltak. Utforming følger Tilgang-dialogens ramme: dempet bakgrunn, fast topp og lagrefelt; full skjerm på smale skjermer, 44 px kontroller, tastaturfokus og Escape. Ansvarlige hentes fra eksisterende firmakontrollerte kshms_deviation_state. Bare aktive interne brukere med KS/HMS-tilgang kan velges; intet navnefelt tolkes automatisk som bruker-ID.

Lagre avvik for oppfølging bekrefter prosjektkilden på server før eksisterende KS/HMS create/detail kjøres med stabile kilde-/request-ID-er. Bekreftet lagring åpner konkret avvik for oppfølging. Bare valgt ansvarlig kan lukke. Brukere uten modulgrant får fortsatt prosjektavvik uten KS/HMS-kobling, nå med dialog og fokus på posten. Ulagret prosjekt forklares som lokalt utkast; KS/HMS-kobling krever lagret prosjekt.

Feil beholder dialog/kladd. Kladd er scoped til bruker/firma/prosjekt og har syv dagers gjenopprettingsfrist. Retry bevarer ID-er, eksisterende bilder og andre rader. Allerede koblet kilde skrives ikke over fra en gammel kladd; lukket kilde gjenåpnes ikke av kladdlagring. KS/HMS sin Registrer avvik/Koble-dialog bruker samme ramme. Bekreftet lagring gir fokus til lagret sak.

## Kontrollstatus før Preview-prøve

- Målrettede avvik-, prosjektmeny-, Tilgang- og mobil-shell-checker: PASS.
- Ny regresjonskontroll: kilde lagres/bekreftes før kobling, feilet readback, feil mottaker/kilde, sene svar, grantløs legacy, kladdscope, faktiske prosjekt-save-callbacker, bevarte bilder/sjekkliste/signatur/øvrige avvik.
- Full EXPO_BACKEND_TARGET=sandbox npm run build: PASS etter siste kodeendring (dialog-build-final.log, exit 0).
- Sky-UI på oppdatert Preview: gjenstår på dette checkpointet. Ingen mobilprøve eller to-konto-prøve er gradert PASS.
- Sandbox e-postarbeider: enabled=false kontrollert før prøver. Ingen ekte medarbeider-e-post sendes.
- Brukerens Test-prosjektavvik, id mad549mztrmuy7nmwb, åpnes bare for koblingsinspeksjon. Det skal ikke brukes som disponibel data eller lukkes av utvikleren.

## Neste steg

Bekreft grønn full critical build, publiser feature med forventet-SHA-kontroll, kontroller READY/Sandbox-binding, og prøv dialog/kladd/valgt ansvarlig, automatisk prosjektkobling, konkret sak, egen lukking og tilbakeføring/omlasting i skynettleser. Oppdater denne rapporten og CONTINUITY/QA/USER_TEST med eksakt testet commit, case-ID og skjermbevis. Bevar øvrig roadmap B–E, seks hovedkapitler og tidligere publiserte rutiner.
