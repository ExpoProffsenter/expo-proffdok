# Fremdrift og kontrollerte beboervarsler – 23. oktober 2026

Miljømål BEGGE; utvikling/utrulling nå kun på eksisterende draft PR #278, Preview og Sandbox. Main c3eb57ce er innlemmet som db5116c0, tree d76b7142. Main-sync CI #629 / 39864556899 SUCCESS; Preview dpl_2T3Sh1p4XyffyKtTBNiVFTzgwL9z READY. Ingen produksjonssetting av Boligprosjekter.

## Produktkontrakt og avgrensning

Prosjekt og bolig får «Fremdrift og varsler». Aktiviteter har bolig/valgfritt rom, ansvarlig med fersk firmatilgang, planlagt start/slutt, faktisk start/slutt og Planlagt/Under arbeid/Stoppet/Utført. Én forgjenger per aktivitet, bare samme bolig. Sirkler, brudd på planlagt rekkefølge og faktisk start før forgjengeren er utført avvises. Avhengig arbeid må avklares før forgjengeren gjenåpnes/arkiveres. Ingen automatisk flytting av andre datoer, ingen juridiske frister og ingen sammenblanding med varemottak. Påkrevde uutførte aktiviteter sperrer ferdigstilling, og endret aktivitetsgrunnlag krever ny kontroll gjennom eksisterende basis. Arkivering bevarer historikk med begrunnelse.

Arbeidsbilder er korte kort med søk/filter, åtte aktiviteter per side og sammenfoldet varsel-/endringshistorikk. Editor i egen dialog. Kladd sikres per bruker/firma/root/bolig før lagring, bevares ved fokus, arbeidsprofilhendelse, lukking og reload. PT409 bevarer felt og forklaring. Usikkert svar har samme request-ID ved nytt forsøk og er idempotent. Eksplisitt lukking gjenåpnes ikke av bakgrunnsoppdatering.

Beboervarsel følger utkast → forhåndsvisning av mottaker/dato/tekst → eksplisitt godkjenning → manuell publisering eller valgt dato. Godkjenningen bindes til aktivitetens navn, rom, planlagte datoer, varseltekst, publiseringsdato og gjeldende kontakt. Endring gjør utgaven foreldet; ny utgave/godkjenning kreves. Tidligere utgaver bevares. Tilbaketrekking stopper portalvisning og ventende utsending, men kan ikke trekke tilbake sendt e-post. Bare gyldige publiserte varsler for riktig kontakt/bolig deles i portalens Meldinger. Interne notater, ansatte og naboboliger deles ikke.

## Ansvarligvarsler og transport

Egen privat kø/arbeider; ingen endringer i HR/KS/HMS sine motorer. Når aktivert, kontrolleres tildeling, to dager før sluttdato, sluttdato og ukentlig etterpå. Maks én akseptert ansvarligmelding per aktivitet per døgn. Bare åpent arbeid med aktiv bolig/rom/firma og aktuell ansvarligtilgang kvalifiserer. Endret revisjon/mottaker/frister, avsluttet arbeid eller tilbakekalt tilgang stopper gamle køelementer. Oppgavene vises i Bolig-planen, ikke som nye globale Startside-/Min side-kort i denne etappen.

Eget Vault-token, service-only reserve/validate/finish, kontroll av pg_net utenfor Data API, stabile Resend-idempotency-nøkler, attempt-fencing og 23-timers retrygrense. Ti jobber / inntil 35 sekunder per worker-kjøring, minutt-cron med norsk kontortid 08–17. E-post viser bare godkjent beboerinnhold; ansvarlig får generisk oppfølging uten beboeropplysninger. Provider-aksept er ikke dokumentert mottak/lesing.

**Standard er deaktivert**, også i Sandbox. Innstillinger enabled=false/endpoint tom/ingen enabled_since gjør arbeidere inaktive. Ingen ekte QA-mail eller ekstern mottaker skal brukes. Ved senere frigivelse må korrekt prosjekt-endpoint og aktiveringstid settes kontrollert; gamle oppgaver får ikke en massemail ved aktivering. Bare oppgaver endret etter aktivering og varsler godkjent/publisert etter aktivering kvalifiserer. Utført kode er ikke påstand om aktiv e-postleveranse.

## Verifisering

Lokale database-, nettleser-, transport- og eksisterende regresjoner kjøres med faktiske komponenter og migrasjon. Testbevis, Sandbox-migrering og Preview-resultater oppdateres etter avsluttet kontroll. Ingen fysisk Safari, ekte mottatt e-post eller faktisk entreprenørkommunikasjon er dokumentert.

Lokalt: 914 PGlite-assertions (tidligere 855 beholdt), ny fremdrift Chromium 24, mail 22, eksisterende portal 27, ferdigstilling 29 og boligkort/tilpasning 22 PASS. Full critical build og scope/docs/diff-check PASS. Nettleserprøven fant og beskyttet feil der automatisk statuslast fjernet PT409-meldingen; bakgrunnslast bevarer nå feilen til en ny handling. React-gjennomgang: avgrensede nøkler, opprydding av hendelseslyttere, fersk rolle/scope, paginering, eksplisitte feltnavn, dialoger og lesertilgang kontrollert.

Sandbox: bolig_progress_notices anvendt kun ppvircenkjizeiqdxphj; lokal migrasjon 20261022222308 SHA256 85258179aa3962d563e1a658a030f810e262a058f5a647b79afa5c32960b288a. Live rollback-smoke med create_plan → aktivitet → eksakt replay → varselutkast → godkjenning → portalpublisering → planendring/ugyldig varsel → nabosperre → ferdigstillingsmangel → anon-avvisning PASS. Null syntetiske testoppgaver/køelementer etter rollback. Worker v1 ACTIVE, med egen Vault-auth og deaktivert innstilling. Faktisk anonym HTTP POST avvises 403/server_only. enabled=false, endpoint tom, enabled_since null og null leveringsjobber bekreftet etterpå. Ingen faktisk e-post.

Security advisors før/etter: 399 → 406 konkrete funn i seks grupper. Nøyaktig sju nye INFO (rls_enabled_no_policy) gjelder de sju private progress-tabellene med RLS og tilbakekalte direkte tabellrettigheter. Dette er tilsiktet default-deny gjennom kontrollerte RPC-er. WARN-gruppene er uendret. Ingen påstand om null sikkerhetsfunn. Ytelsesrådgiver er ikke telt i dette kallet.

Etterkontroll Sandbox 23.10.2026 kl. 00:39 Oslo: null manuelt retryende funksjoner og null API-spørringer over 30 sekunder; rollbackteller 19557211. Dette er ett kontrolltidspunkt, ikke kontinuerlig overvåking.
