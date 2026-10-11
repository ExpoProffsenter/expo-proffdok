# Faktisk gjenstående skyoppsett – 11. oktober 2026

Miljømål: **SANDBOX/DEMO**, kun isolert HR-operatørarbeid på draft PR #217. Kenneth har bedt om å fortsette trygg lagring/gjenoppretting. Ingen nye skyressurser, gamle credentials, aktivering, e-post, appdata eller Production/demo endres.

## Dagens kilde og avgrensning

PR #219 og #218 er godkjent og merget. Main er `f6a74d828fb4c0110b4eae8c6e453d2a55ee9038`; permanent demo er `b0a9a17a0bed99f70cfee16d1e65ebc3bb67c7f0`. HR-ledgerarbeidet i #217 er oppdatert med hele dagens main, inkludert medarbeider-popup, navigasjonsminne, Sandbox-prøvesamtale og begge additive CI-suiter. Konflikter i arbeidsnotater/CI er løst ved å beholde begge sider. Worker, operatorer, signeringsskript og migrasjoner er uendret; de tre eksisterende ledger-tekstendringene i HrModule beholdes sammen med ny popup/prøveflate. Ingen demo-overlegg kommer inn i denne branchen.

## Ferske lesende bevis

Kontrollprosjektets checkpoint-tabell: 0 rader, 0 enabled, 0 låser. Anonym faktisk worker `POST plan` gir HTTP 403 og `worker_key_not_configured`. Dette bekrefter at den navngitte servernøkkelen ikke er konfigurert; det er ikke en ny gyldig-key/autorisert skytest. Begge aktive appprosjekter har fortsatt `content_enabled=false`, `restore_quarantined=true`.

Connectorens prosjektliste viser bare Production og `expo-hr-control`; den aktive kurs-Sandboxen er kjent separat. Ingen tilgjengelig isolert HR-kilde er identifisert. `get_cost` returnerer `UNAVAILABLE` / «not returned by tools/list». Derfor finnes ingen verifisert kontopris for en ekstra ressurs, og ingen kostnad godkjennes eller ressurs opprettes på en antatt listepris. Ingen connector setter Edge secrets; browser credential-protection STOP består.

## Oppsett som må gjøres én gang

1. **Ny navngitt servernøkkel:** I eksisterende `expo-hr-control`, Settings → API Keys, opprett secret med navnet `hr_ledger_worker`. Behold verdien privat hos operatøren; ikke send den i chat eller legg den i kode. Ingen default-/probe-nøkkel endres. Dette låser ikke opp HR eller kontrolltabellen.
2. **Ny signeringsnøkkel med uavhengig backup:** Følg det allerede gjennomgåtte `scripts/hr-worker-provision-signing-key.mjs` og [worker-oppsettet](HR_EDGE_WORKER_20261011.md). Skriptet må kjøres på en betrodd operatørmaskin med privat mappe og autorisert CLI; det kan ikke erstattes av en nøkkel i transient agent-scratch. Ingen eksisterende secret-verdi skal hentes. Ved ukjent upload beholdes den nye nøkkelfilen og arbeidet stoppes uten automatisk nytt forsøk.
3. **Isolert kilde og konkret kontopris:** Avklar gjenbruk av en tilgjengelig separat, tom QA-ressurs eller en konkret kostnad fra riktig Supabase-organisasjon før eventuell opprettelse. Aktiv Production, kursdemo og kontrollprosjekt kan ikke brukes som restoremål. Full relevant appgrunnmur og syntetiske Auth-/Storage-data kreves; én falsk medarbeiderrad er ikke tilstrekkelig.
4. Deretter kan faktisk `plan`/staging/bootstrap utføres mot eksakt gjennomgått binding. Bootstrap forblir disabled/locked. Separat gjennomgått aktivering/fencing/recovery og source/control/Blob/ack-bevis må følge før scheduler og managed Database/Auth/Storage-byte restore. Ingen fixture-UPDATE kopieres til skyen.

Ingen ny Kenneth-prøve av skjema, PDF eller navigasjon kreves. Tidligere 108 worker-, 243 HTTP/SQL- og 233 native restore-assertions beholdes som avgrensede bevis, ikke som samlet managed-cloud-PASS. Privat HR åpnes først etter faktisk gjenstående serveroppsett/integrasjon/restore og ferdig personlig samtalefunksjon.

## Kontroller etter sammenslåing med dagens main

Full Sandbox critical/build PASS. Eksisterende worker 108 assertions og faktisk HTTP-handler/source/control-SQL 243 assertions PASS. Faktisk React med tilgangshooks passerer ny popup/KS/HMS/Min side-navigasjon, eksisterende HR-register/slettekvitteringer og tom/ulagret/lagret prøvesamtale ved tilgangsremount. Disse regresjonene kjøres fordi HrModule og CI hadde reelle mergekonflikter; uendret native restore/PDF/cloud-probe gjentas ikke. Ingen worker-/SQL-/signeringskode endret i denne runden.
