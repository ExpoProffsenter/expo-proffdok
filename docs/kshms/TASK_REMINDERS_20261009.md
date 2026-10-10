# Oppgavepåminnelser – 9. oktober 2026

Miljømål: **BEGGE**. Levering bare feature/Preview og Sandbox; ingen merge eller Production-aktivering.

## Scope før implementering

- Ny migrasjon for påminnelser om ufullførte `round`, `risk`, `sja` og `reading`: faser/unikhet, opprinnelig tildeling som tidsgrunnlag, privat innsamling/fersk leveringskontroll, egen skrivebeskyttet oppgaveoversikt og eksisterende worker-kall.
- Felles KS/HMS-mailer: generiske påminnelsestekster til eksisterende innloggingsbeskyttede lenker. Eksisterende sender/token/retry/idempotens beholdes.
- Ny scoped KS/HMS-påminnelseskomponent/hjelper og avgrenset integrasjon i `KshmsModule.jsx`, med snarveier til eksisterende oppgaveflater. Ingen automatisk fullføring, signering eller lesebekreftelse.
- Relevante critical/runtime/SQL-tester og gjeldende KS/HMS-statusdokumentasjon.

Globale menyer, bootstrap/Startside, Sales, andre moduler, tilgangskjernen, Storage-policyer og historiske signaturer/utgaver er fredet. Avvik/RUH- og håndbokrevisjonspåminnelser bevares og regresjonstestes.

## Kontrakt

Første oppfølging skjer tidligst sju dager etter den opprinnelige tildelingen i gjeldende ansvarsgenerasjon. Sen førstegangslevering gir minst sju dagers pause. Deretter høyst én aktuell ukentlig påminnelse, ingen kø av gamle perioder. Tidspunktet er en oppfølgingsregel, ikke en ny arbeidsfrist. Datoene beregnes på server i Europe/Oslo.

Bare fortsatt kvalifisert, tildelt intern bruker i riktig firma kan få påminnelsen. Fullføring, egen SJA-signering eller eksakt egen lesebekreftelse stopper den. Omfordeling og endret tilgang kontrolleres ferskt før levering. Arkivering og prosjekttilgang håndteres i den nye påminnelseskontrollen uten å åpne prosjektinnhold for andre. Appens lesing oppretter ingen e-post.

E-postworker forblir **enabled=false** i Sandbox. Kontrollert aktivering og faktisk levering følger ved senere godkjent Production-setting. Den ene autoriserte testmailen er fortsatt ikke sendt.

De tidligere faseavslagene for `round/risk/sja/reading` i transportkontrollen erstattes av positive assignment/reminder-scenarioer for alle seks typer. Dette er den avtalte funksjonsutvidelsen; ukjent type/fase, scope, privat innhold, avslått transport og idempotens er fortsatt beskyttet.

## QA

- Faktisk React/Vite/JSDOM PASS: fire eksisterende arbeidsflater, faktisk parent-tab integrasjon, ingen automatiske skriver/signeringer/bekreftelser, busy-vern, offline-bevaring, fjernet oppgave ved oppdatering, revokering og sent svar fra gammelt firma.
- Sandbox: **41 ulike SQL-assertions PASS**. Kontrollen ble kjørt i to avgrensede rollback-scenarioer, **16 + 27**, med to felles setupkontroller. Fire typer/separate lesemottakere, tidlig/avslått transport, aktiveringsgjerde, framtidig planlagt dato, aktuell ukesperiode, deduplisering, sen levering/pause, endret tildelingsgrunnlag, arkivert rutine, egen appoversikt, firmaskille, prosjektets eier/modultilgang, fersk/stale attempt, retry/late finish, A–B–A, faktisk egen fullføring/SJA-signering/lesebekreftelse og grant-revokering/reaktivering er kontrollert. Ingen HTTP-sender kalt og ingen syntetiske skriver beholdt.
- Regresjon i samme Sandbox: **36 eksisterende seks-typers varselkontroller**, **37 avvik/RUH-påminnelseskontroller**, **36 håndbokrevisjonspåminnelseskontroller PASS**. Faktisk React-kildeoppdateringsflyt og håndbokrevisjonsflyt PASS.
- Permanent critical-kjede/full lokal Sandbox-build PASS. Transportmatrix tester alle seks typer i både assignment- og reminder-fase, med eksisterende beskyttede lenker, minimal e-post, deaktivert worker og idempotens.
- Migrasjon opprettet med Supabase CLI og synkronisert til faktisk Sandbox-versjon **20261009171349**. Edge **kshms-assignment-mailer v7 ACTIVE**; begge tilbakeleverte kildefiler identiske med testet kode, deno.json også sendt. Eksisterende Vault-token-autentisering og service-RPC-er er beholdt.
- Security/performance advisors og ACL kontrollert. Ny authenticated SECURITY DEFINER egenoppgave-RPC er tilsiktet, med fersk firmakontekst og tom search_path. Ingen anon/service-grant til denne RPC-en, og private hjelpere har ingen klient-/service-EXECUTE. Eksisterende prosjektvarsler er ikke erklært en ren prosjekt-scan. Direkte sluttkontroll: **enabled=false**, 0 syntetiske firma/brukere.

Feature-forelder er `dced09ff37286b905f96e1349adda0fd68850ab7`, main-baseline er `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Publisert SHA/eksakt testet tre, CI og READY Preview føres i draft PR #216. Ingen main/demo-merge.

## Bruk og avgrensning

I KS/HMS viser **Oppgaver du fortsatt skal fullføre** egne oppgaver med minst sju dager siden tildeling. Snarveiene åpner **Vernerunder/kontroller**, **Risikovurdering**, **SJA** og **Les og bekreft**. Oppgavene blir stående til faktisk egen fullføring, signering eller bekreftelse er lagret. Oversikten oppdateres ved fokus/synlighet og hvert 30. sekund mens appen er synlig; lesebekreftelse og kontrollhendelser oppdaterer den også. Dette erstatter ikke den eksisterende listen eller skjemaet for oppgaven.

Framtidig planlagt arbeidsdato utsetter påminnelsen. Ingen nye arbeidsfrister eller nye påminnelser per innlogging. HR-utløp er fortsatt del av D og inngår ikke her. Faktisk nettleser-/fil-/mobil-/flerbrukerbevis og ekte e-postlevering er egne gjenstående bevisgap. Den ene autoriserte testmailen er ikke sendt på grunn av den blokkerte innloggede skynettøkten. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-minitest. Neste punkt er samlet B/C-sluttkontroll og drift/kapasitet før HR-fundamentet.
