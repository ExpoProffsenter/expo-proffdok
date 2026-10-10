# Påminnelse om håndbokrevisjon – 9. oktober 2026

Miljømål: **BEGGE**. Denne leveransen gjelder feature/Preview og Supabase Sandbox. Ingen merge eller Production-aktivering.

## Avgrensning før implementering

- Ny migrasjon for revisjonspåminnelser: køens fase/unikhet, fersk kontroll av utpekt ansvarlig og dato, ukentlig innsamling, egen skrivebeskyttet oppgave-RPC og eksisterende worker-kall.
- `supabase/functions/_shared/kshms-assignment-mailer.mjs`: generisk revisjonspåminnelse med eksisterende beskyttede lenke og idempotens.
- `src/modules/kshms/KshmsModule.jsx`, ny `KshmsReviewReminder.jsx` og dato-/scope-hjelper: ansvarlig ser oppgaven og åpner eksisterende revisjonsskjema uten automatisk signering eller sletting av felter.
- Relevante critical/runtime/SQL-kontroller og KS/HMS-statusdokumentasjon.

Globale menyer, bootstrap, Sales, andre moduler, Storage-policyer og historiske signaturer/utgaver er utenfor scope. Eksisterende kritiske vern beholdes. E-postworker forblir deaktivert i Sandbox. E-post skal aktiveres kontrollert ved senere Production-lansering; dette er ikke en generell sendeaktivering.

## Kontrakt

Varsel gjelder bare utpekt og fortsatt kvalifisert ansvarlig i riktig firma. Dato beregnes på server i Europe/Oslo. Første fristvarsel beholdes; deretter høyst én aktuell ukentlig påminnelse og minst sju dager etter sist opprettede eller sendte revisjonsvarsel. Utsatt levering skal ikke gi ettersending av flere gamle perioder. Ny frist, ny ansvarlig, mistet tilgang og lagret signert revisjon kontrolleres før levering. Lenken åpner egen gjennomgang; den signerer ingenting.

## Verifisering

- Faktisk React/Vite/JSDOM: PASS for åpning og tastaturfokus i eksisterende skjema, ingen automatisk signering, tekstbevaring ved fanebytte/gjenåpning, feilet lagring/retry og oppgave fjernet etter lagret signering. Offline beholder sist bekreftet oppgave; mistet tilgang og sent svar fra forrige firma gjenoppliver ikke oppgaven.
- Sandbox: **36 nye SQL-assertions PASS**. Framtidig dato, dato innen sju dager, rett ansvarlig, én første melding, deaktivert transport, sju dager etter sen førstegangslevering, aktuell periode/unikhet, endret dato, A–B–A, modul-/profil-/grant-revokering/reaktivering, fersk reservasjon, stale attempt, signert revisjon og bevart utgave er kontrollert. Alle syntetiske skriver rullet tilbake; ingen HTTP-sender ble kalt.
- Regresjon i samme Sandbox: **36 eksisterende tildelingsassertions PASS** og **37 avvik/RUH-påminnelsesassertions PASS**. Alle seks opprinnelige varseltyper beholdt. Eksisterende faktisk React-kildeoppdateringsflyt PASS med ny skrivebeskyttet oppgaveforespørsel.
- Permanent critical-kjede og full lokal Sandbox-build PASS. Ny critical-kontroll inngår i eksisterende KS/HMS-kjede; transportkontrollen dekker både review assignment og review reminder. Eksisterende vern er ikke fjernet eller svekket.
- Migrasjon opprettet med Supabase CLI og synkronisert til faktisk Sandbox-versjon **20261009164036**. Sandbox Edge **kshms-assignment-mailer v6 ACTIVE**, begge tilbakeleverte kildefiler byteidentiske med testet kode; `deno.json` er også sendt ved deploy. Eksisterende custom Vault-token-autentisering beholdt. Direkte sluttkontroll: worker **enabled=false**, 0 syntetiske firma og brukere.
- Security/performance advisors kontrollert. Authenticated SECURITY DEFINER-varselet for ny egenoppgave-RPC er tilsiktet: fersk firmakontekst, ansvarligkontroll, tom search_path og ingen anon/service-grant. Private hjelpere har ingen klient-/service-EXECUTE. Eksisterende prosjektvarsler og RLS-uten-direkte-policy er ikke erklært «ren prosjekt-scan», og ingen slik policy er åpnet.

Publisert funksjonshead, grønn server-CI og READY Preview registreres i draft PR #216 etter levering. Main-baseline kontrollert før levering: `155f6c4ac01f126c1db0c65da385cfd9305587d5`; publisering bruker forventet feature-head `07c06830addf0ceeb0342b56d1945942b26d225b` og nøyaktig testet tre. Ingen main/demo-merge.

## Bruk og avgrensning

Utpekt ansvarlig åpner KS/HMS og **Åpne håndbokrevisjon** når revisjon er nær eller passert. Kontroller rutinene, fyll funn, videre oppfølging og ny dato, bekreft egen vurdering og trykk **Signer revisjon**. Å åpne påminnelsen signerer ingenting. Appoppgaven oppdateres ved fokus, synlighet og hvert 30. sekund mens appen er synlig; serverdato er Europe/Oslo. Periodiske varsler og appoppgave krever minst én aktiv, publisert rutine. Den tidligere første fristmeldingen beholdes også for oppstart uten publisert håndbok.

Tidligere TEST OK beholdes. Dette er utviklerbevis og oppretter ingen ny obligatorisk Kenneth-minitest. Faktiske filer/mobil/separate brukerøkter og én autorisert testmail er fortsatt egne bevisgap. Testmailen er ikke sendt; den innloggede skynettøkten har vært blokkert av credential-state-feil. Sandbox-transport er fortsatt deaktivert. Ved senere godkjent Production-setting skal KS/HMS-e-post aktiveres og faktisk levering verifiseres. Øvrige C-påminnelser og HR-utløp inngår ikke i denne leveransen.
