# Personlig sykefraværsoppfølging og ansvarliges fristvarsler

Miljømål **BEGGE**. Baseline main `61a42e6c7d996a6abc6c5146de45e3759e682b4d`, fra godkjent release #220/#221. Branch `fase45c-hr-sickleave-20261011`. Kenneth autoriserte implementeringen og bruk av egen registrert testkonto 11. oktober 2026 kl. 17:48 Europe/Oslo. Kl. 18:09 presiserte han at ansvarlig leder skal få e-postvarsling på frister og at prinsippet gjelder hele appen.

## Scope og videreføring

Nye HR-komponenter, egen transport/PDF, fire additive private migrasjoner, egen serverarbeider, ett integrasjonspunkt i HR, Hjelp, tester og driftsdokumentasjon. Påminnelser omfatter også eksisterende HR-samtalers tiltak/neste oppfølging og firmaadmins kontrollfrist. Ingen eksisterende access-/purge-/restore-funksjon, navigasjon, bootstrap, Sales eller demo-overlay endres. Appens varslingskrav er ført varig i PROJECT_GUARDRAILS.md. Ingen ny betalt ressurs.

Kenneth utvidet scope 11. oktober med firmaredigering, Ringside AS, Styret/lederstillinger og tre underavdelinger. Firmaprofil får en separat ferskt autorisert visningsnavn-RPC og editor. Smale integrasjonspunkter i main kobler lagret navn og firma-ID til eksisterende firmavisning, uten å omskrive et åpent prosjekt. Fire eksisterende prosjektfiltre bruker nå stabil company_scope_id når tilgjengelig, med historisk navnefallback. Fersk firma-ID hentes ved prosjektlasting; memo oppdateres ved firma-ID-endring. Eier-/systemadmin-/supportgrenene og server-RLS beholdes. Dette hindrer at nye prosjekter med nytt navn skjules for firmaadmin. Eksisterende kontaktlagring, firma-UUID, normalisert identitetsnøkkel, brukerprofiler og medlemskap beholdes. Historiske dokumenter beholder sine snapshots. Dette er visningsnavn, ikke omkobling av gamle tekniske navn. Organisasjonskartet får synlig opprettelsesvilkår, veiledning og synlige lederplasseringer også på lukkede kort; ingen endret karttilgang eller HR-relasjon.

Lesende Production-kontroll viste ett kvalifisert firmamedlemskap for Kenneth. Felleskart krever minst to separate kvalifiserte firmaer; tre avdelinger i ett firma bygges i firmakartet. Karttopp, avdelingsnavn og registrert firmavisningsnavn lagres separat. Personnavn kommer fra aktive registrerte appbrukere. Ingen navn/kart/rettighet er endret i Production.

Hjelp har egne A–Å-kapitler for medarbeidersamtale og sykefravær, oppdatert firmaprofil og forklaring av felleskartvilkår. Permanent Hjelp-kontroll sjekker nå de tre eksakte HR-kapitlene og beholder alle gruppetilhørighets-/duplikat-/innholdskontroller.

Ny QA: **22** PostgreSQL/PGlite-assertions og **14** faktiske React-assertions for navn, **11** prosjektidentitetsprøver (gjentatt navnebytte/fremmed ID/samme navn/historikk); berørte faktiske organisasjonskart-/felleskart-React-prøver PASS. **12** live Sandbox-rollback-kontroller PASS inkludert faktisk prosjekt-trigger/RLS og firmaadmins lesing av medarbeiderens nye prosjekt. Første utvidede prøve ble riktig avvist fordi syntetisk fixture manglet projects-modultilgang; bare fixture rettet, ikke produktets adgangskontroll. 0 gjenværende syntetiske QA-brukere. Ny RPC har kilde-MD5 `9fce11dc44fb39f4dd982c9ed43defcf`, tomt search_path og kun authenticated-grant. Security/performance advisors kontrollert: authenticated definer er tilsiktet og RPC-en gjør ferske rolle-/firma-/CAS-kontroller; ingen nye tabell-/FK-funn. Full Sandbox- og Production-build med critical PASS.

Skynettleseren viste innlogging i både Production og fast Preview. Ingen ny innlogget browserprøve attesteres; ingen legitimasjon er kopiert. Tidligere godkjente prøver beholdes.

Kenneths Hotmail-testkonto er registrert i Production, men finnes ikke i eksisterende Sandbox. Ikke kopier innlogging/personprofiler eller opprett nye passord. Preview bruker eksisterende Sandbox med syntetiske rolleprøver. Kontrollen av faktisk Hotmail-bruker i Production følger først kontrollert release. Ingen reell fraværssak er opprettet på ham av utvikleren.

Tidligere TEST OK og mailmottak beholdes. Skjermbildet `image(20261011-154206).png` er lest: receipt `544cd046-7e92-4ea0-a10c-6a6940bb67ec` er mottatt i Kenneths innboks. Ingen ny slette-/testmail er nødvendig for denne funksjonen.

## Saksflyt

Firmaadmin lagrer sykefraværsmalen. Nærmeste leder starter hos registrert medarbeider, velger første sammenhengende fraværsdag og fullt/gradert fravær. Medarbeideren har private forberedelser til uttrykkelig deling. Leder skriver felles plan og tiltak; begge har egen kommentar og egen gjennomgang. Medisinske detaljer og diagnose skal holdes utenfor. Alle lagrede utgaver er private immutable artefakter som eksisterende slettedomenes purge/restore håndterer. Kladd er bare avgrenset flyktig minne; lagre før full reload.

Kalenderfrister 4/7/8/26 uker følger første dag. Endret grad starter ikke nytt fraværsforløp. Korrigert startdato krever begrunnelse og ny gjennomgang. Hvert håndtert trinn eller dokumentert unntak krever faktisk dato og kort notat. Gradert dialogmøte 1 begynner med behovsvurdering. NAVs aktivitetsvurdering/møteavgjørelser blir ikke erklært utført av appen. Ingen beregnet 52-ukers maksdato.

PDF henter fersk autorisert lagret utgave. Partenes svar, tiltak, frister, dokumenterte vurderinger, delingsjournal og egne bekreftelser følger. Eksporten flytter ikke brukeren ut av saken. PDF er ikke en automatisk innsending. Leder registrerer faktisk delingsdato, tidligere delt lagret utgave og kanal etter deling utenfor ProffDok. Bare utgaver der medarbeideren har delt forberedelsen kan journalføres. Journalføring endrer ikke den gjennomgåtte planens innhold.

Avslutt oppfølging beholder historikken og stopper nye fristvarsler. Det avslutter ikke arbeidsforholdet. Bare leder kan gjenåpne. Høyst én aktiv sykefraværsoppfølging per medarbeider, også ved gjenåpning av eldre sak.

## Varsler og mottakere

| Oppfølging | Mottaker |
| --- | --- |
| Sykefravær 4/7/8/26 uker, neste oppfølging | Gjeldende nærmeste leder |
| Åpent tiltak i sykefravær eller medarbeidersamtale | Tiltaksansvarlig og gjeldende nærmeste leder, deduplisert |
| Neste oppfølging i vanlig medarbeidersamtale | Gjeldende nærmeste leder |
| Firmaets kontrollfrist for HR-oppsett/tilgang | Aktive firmaadminer |
| KS/HMS-avvik/RUH, vernerunde, risiko, SJA | Eksisterende varslingsmotor til utpekt ansvarlig/prosjektleder |
| KS/HMS-håndbokrevisjon og lesing | Eksisterende varslingsmotor til KS/HMS-ansvarlig / tildelt medarbeider |

Ny HR-regel: tre kalenderdager før, på fristen, deretter hver syvende dag etter fristen mens punktet er åpent. Kalender og utsending bruker Europe/Oslo. Cron kjøres serverbasert, uavhengig av innlogging. Utsending skjer kl. 09–17 Oslo. Dedupe per oppgave/fristedato/periode/mottaker; 15-minutters backoff, ti forsøk, 23-timers retryvindu, stabil provider-idempotency og forsøkslease. Ingen gammel periode samles opp ved aktivering. Oppgavelisten er synlig selv når e-posttransport er avslått.

Fersk profil, medlemskap, firmamodul, HR-brukertilgang, lederrelasjon, fristedato, aktiv sak og åpne tiltak kontrolleres rett før utsending. Den generelle HR-mailen har bare beskjed om oppfølging og appadresse. Ingen medarbeidernavn, fraværsopplysning, dato, sak-ID eller plantekst går til e-postleverandøren. Worker-jobben har bare id, attempt og to. Privat outbox/settings har RLS og ingen direkte klientgrants. Arkiv/purge-FK fjerner kødata ved sletting av HR-innhold.

Dette kartet beskriver kontrollerte HR-/KS/HMS-oppgaver. Andre modulfrister må vurderes mot utpekt ansvarlig og eksisterende varslingsregel ved videre arbeid; ingen påstand om full appdekning. Production KS/HMS-worker er lest som enabled=true med riktig endpoint. Ingen omkonfigurering av eksisterende utsending.

## Nye bevis

- PGlite/PostgreSQL: **83** scenarioassertions PASS: roller, privat forberedelse, maltype, startdato/grad, samtidighet, egne bekreftelser, korrigert dato, delingsjournal, closure/reopen, live task-mottakere, tre-dagers-/ukentlig bucket, dedupe/backoff/attempt, bytte av leder, bortfalt modul/restore-gate og purge av alle versjoner/kø.
- Faktiske nye React-komponenter: **48** assertions PASS: alle steg, felles lagring, volatile kladder/fokus/remount, historikk/konflikt, egen gjennomgang, PDF uten navigasjon, fristfelter, faktisk deling, avslutning/gjenåpning og egne tasks/denied/late svar.
- Transport/faktisk jsPDF: **68** assertions PASS: dobbel fersk autorisasjon/readback, unknown writes uten automatisk retry, server-only token/transport/body før reserve, minimal mail/provider/ack-feil og sen PDF-respons. Fire A4-sider med lange syntetiske tekster er rendret og visuelt kontrollert.
- Sandbox rollback: **22** nye virkelige SQL-kontroller PASS. Prøvedata rullet tilbake, 0 QA-brukere, 0 sykefraværssaker og 0 nye leveringer. Ingen provider-kall.
- Alle **14** nye funksjonskropper matcher lokal kilde. Tomt search_path, security definer og riktige autentisert-/service-only ACL. **56** eksisterende HR-funksjoner har identisk før/etter-fingerprint og ACL.
- Supabase security/performance advisors gjennomgått. Private no-policy-tabeller og scoped authenticated definer-RPC er tilsiktet stengt modell. Ny manglende FK-indeks rettet i tredje additiv migrasjon. Fjerde migrasjon binder workers endelige kontroll til køens firma. Gamle øvrige funn endres ikke i denne PR-en.
- Full Sandbox critical/build PASS. Berørte eksisterende HR-/kontakt-/samtale-/register-/mal-/Min side-/Hjelp-/navigasjons-/purge-prøver PASS. Ingen tidligere tester svekket.

## Release og kort ny brukerprøve

Fast Preview og CI/head/deploy føres etter publisering. Preview har EXPO_BACKEND_TARGET=sandbox. Ny worker installert i Sandbox som disabled; ingen Production-migrasjon eller mailaktivering utført for denne nye funksjonen.

1. Leder åpner HR → medarbeider → Start sykefraværsoppfølging. Velg mal, første dag og fraværstype, trykk Opprett oppfølging.
2. Medarbeider åpner Min side → Mine oppfølginger → egen oppføring → lagret oppfølging. Fyll Forberedelse, Lagre oppfølging og Del forberedelsen med leder.
3. Leder fyller Felles plan, Tiltak og Frister. Lagre oppfølging. Se 4/7/8/26 uker og Dine frister og åpne tiltak. Begge bekrefter selv i Gjennomgang.
4. Last ned oppfølgingsplan som PDF. Samme sak/steg står åpent. Se Deling og avslutning uten å registrere en deling som ikke faktisk er gjort. Prøv avslutning bare på syntetisk sak; historikken beholdes og fristlisten tømmes.

Dette er en ny funksjonsprøve. Gamle register-, kontakt-, samtale-, slette- og e-postprøver skal ikke kreves gjentatt av Kenneth. Relevant ny TEST OK kreves av AGENTS.md/PROJECT_GUARDRAILS.md før merge. Deretter: additive migrasjoner og egen worker til eksisterende Production, verifisert endpoint/custom Vault-token/Resend, kontrollert mailaktivering, main-release og Production-verifisering, så gjeldende main → permanent demo og preflight. Opprett kun uttrykkelig syntetiske testinnhold på Kenneths autoriserte bruker; ingen diagnose/ekte fravær antas.

## Kilder, kontrollert 11. oktober 2026

- [NHO: oppfølging skritt for skritt](https://arbinn.nho.no/arbeidsrett/sykefravar_og_permisjoner/sykefravarsoppfolging/sykefravarsoppfolging-skritt-for-skritt/)
- [NAV: arbeidsgivers oppfølging og ansvar](https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte)
- [NAV: oppfølgingsplan og faktisk deling](https://www.nav.no/arbeidsgiver/oppfolgingsplan)
- [Supabase database functions](https://supabase.com/docs/guides/database/functions)
- [Supabase linter: private RLS uten policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
- [Supabase linter: tilsiktet authenticated definer-RPC](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [Supabase linter: FK-indeks](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)
