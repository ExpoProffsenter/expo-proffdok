# Fristpåminnelser for avvik/RUH – 9. oktober 2026

## Scope og miljø

Kenneth ga «kjør» til neste avgrensede påminnelsesleveranse. Miljømål **BEGGE**; kun feature `feat-kshms-foundation`, draft PR #216 og Supabase Sandbox `ppvircenkjizeiqdxphj` leveres nå. Main `155f6c4ac01f126c1db0c65da385cfd9305587d5` og remote feature `93a2f0398eaa8aa0cf74a34ebc234a114f68d5b2` kontrollert før endring. Isolert lokal baseline har eksakt remote tree `290f5a9dad235db507478ec5fea6a22472c95134`. Publisering bruker denne remote-parenten og expected-head, uten force eller omskriving av historikk.

Ingen Production-release, main/demo-merge, ekte e-post, ny obligatorisk Kenneth-prøve eller HR-utvikling inngår. Tidligere TEST OK, inkludert SJA-bilder 15:01, beholdes. Neste utviklingspunkt er kildeoppdatering; dette er ikke en erklæring om at hele B/C er ferdig.

## Atferd

- Ansvarlig ser dato og merkingen «Fristen er passert», «Frist i dag» eller «Frist innen tre dager» i den eksisterende oppgavelisten. Teller og status beregnes av firmascopet RPC med Europe/Oslo. Appvisning fungerer med avslått e-post. Lesing/fokus/innlogging oppretter ingen leveringsjobber.
- Periodiske påminnelser gjelder bare åpne avvik og RUH. Ukeperiodene starter dagen etter fristen og fortsetter i syvdagersintervaller. Collector oppretter bare aktuell periode, høyst én påminnelse per syv dager og tidligst syv dager etter siste opprettede varsel eller bekreftede levering. Ventende/sending varsel for samme sak utelukker en ny jobb.
- Separate unike indekser bevarer én tildelingsjobb per ansvarsgenerasjon og én påminnelsesjobb per aktuell periode. Collector låser saken før en ny kølesing; parallelle kjøringer og fristendringer skal ikke omgå frekvensen.
- Gjeldende ansvarsgenerasjon, åpen status, samme frist, aktuell periode, modulaktivering, medlemskap, profilstatus og grant kontrolleres før reservasjon og rett før transport. Utløpt periode eller endret frist stopper retry. Eksisterende fenced attempts og Resend-idempotency beholdes.
- Modul-/grant-/medlemsendringer og transportens aktiveringstid beskytter mot replay etter reaktivering. Profilstatus har ikke eget endringstidspunkt, så en privat trigger undertrykker ventende påminnelser ved relevant tilgangsendring. Bare aktuell periode etter aktivering er kvalifisert; ingen historisk ukekø rekonstrueres.
- E-post har generell påminnelsestekst og beskyttet firmalenke; ingen tittel, hendelse, årsak, bilder eller fortrolige notater. Øvrige fem oppgavetyper og opprinnelige tildelinger beholder sine eksisterende regler.

## Backend og tilgang

Migrasjonsfilen ble opprettet med Supabase CLI 2.120.0 `migration new kshms_deviation_reminders`, og etter endelig apply navngitt med faktisk Sandbox migration-history-versjon **20261009151332**. Ingen eksisterende sakshistorikk eller signatur endres. Ingen ny REST/RLS-policy eller klienttilgang til outbox innføres. Nye private security-definer-funksjoner har tom search_path og revokert execute fra public/anon/authenticated/service_role. Oppgave-RPC er åpen for authenticated med gjeldende require_context, lukket for anon.

Sandbox Edge Function `kshms-assignment-mailer` **v5**, bundle SHA-256 `848b82cf0b6a647ee745a7bb5282d634d650e0bac27432796b28fa310f0fafed`. Eksisterende `verify_jwt=false` er bevart fordi endpointet kontrollerer eget 256-bit Vault-token med service-only authorize før reservasjon; ingen ny transportautorisasjon er innført. `email_worker_settings.enabled=false` er direkte bekreftet før og etter deploy/test. Cron er eksisterende dispatcher; ingen nytt abonnement eller login-drevet utsending.

## Utviklerverifisering

- `npm run build`: hele eksisterende critical-kjeden og Vite-build PASS. Ingen checker eller CI-gate svekket. Eksisterende chunk-størrelsesvarsel står uendret.
- Faktisk React-komponent gjennom Vite/JSDOM: PASS for alle fristmerker, åpning av riktig sak, offline-bevaring, bekreftet lukking, disabled cleanup og kun read-only oppgave-RPC.
- Ny SQL-suite: **37 assertions PASS** både med migrasjonen i rollback-transaksjon og etter endelig Sandbox apply. Dekker norsk dato, rolle/firma-scope, ukeskifte/dedup, gammelt etterslep, siste tildeling levert sent, retry-delay/identitet/attempt-fencing, fristendring, profil/grant/modul/transport-reaktivering, ansvarsskifte og ansvarligs faktiske RPC-lukking.
- Eksisterende varsel-SQL-suite med samme migrasjon: **36 assertions PASS**, alle seks typer, ansvarsgenerasjoner, egen fullføring/signering/ack og beskyttet worker-reservasjon. Ingen HTTP-transport.
- Utvidet eksisterende critical mailer-kontroll: minimal reminder-body, korrekt beskyttet lenke, ugyldig fase/type avvist og faktisk handler med provider-stub/fenced attempt. Den inngår fortsatt i full critical build.
- Alle syntetiske firma/bruker-/saks-/prosjektrader og midlertidige testinnstillinger rullet tilbake. Readback: **0 syntetiske firma**, **0 syntetiske brukere**, **0 åpne saker**, **0 reminder-jobber**, **email_enabled=false**. Collector execute lukket for authenticated og service_role; tasks-RPC authenticated=true, anon=false.
- `git diff --check`: PASS. README, HJELP, architecture og gjeldende KS/HMS-status oppdatert. CI/Vercel-resultatet for publisert eksakt head føres i draft PR #216.

## Bevisgap og videre arbeid

Skynettleseren er fortsatt utilgjengelig på verktøyets native-credential-state-grense. Ingen innlogget nettleserverifisering eller ekte e-postlevering påstås. Dette erstattes av agentens tekniske kontroller, ikke en ny runde like brukerprøver. Kenneths godkjenninger beholdes. Påminnelser for håndbokrevisjon, andre oppgaver og senere HR-utløp er separate avgrensninger. Kildeoppdatering er neste utviklingspunkt, deretter samlet helhetlig vurdering av B/C før HR.
