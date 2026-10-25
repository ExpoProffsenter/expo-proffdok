# Boligprosjekter – produksjonsklargjøring og utrullingsplan

25. oktober 2026. Miljømål BEGGE. PR278 forblir OPEN DRAFT. Ingen produksjons-
DDL, endring av produksjonsdata, merge, lisensaktivering eller utsending er gjort.
Dette dokumentet er en forberedt plan, ikke en fullmakt til å utføre den.

## Beslutning og gjenstående porter

| Område | Kontrollert resultat |
|---|---|
| Migrasjonspakke | 72 filer i eksplisitt rekkefølge med SHA256, entydig koblet til faktisk Sandbox-historikk |
| SQL-payload | 69 identiske, én med bare avsluttende blanklinjer, to med samme indekssetninger og ulik kommentar/formatering |
| Produksjon før installasjon | Ingen Bolig-schemaer, -migrasjoner, -buckets eller -cron-jobber. Lesende preflight PASS |
| Eksisterende felles funksjoner | Faktiske definisjoner og ACL registrert. Fem berøres uttrykkelig; øvrige bevares |
| Lokal installasjon/gjenoppretting | Alle 72 installert i filrekkefølge; 108 assertions PASS. Ekte produksjonsdefinisjoner for felles innganger, syntetiske plattformadaptere |
| HR og Min side | 49 assertions med faktisk produksjonsgrunnlag og sikker tilbakerulling PASS; tidligere 41 kontroller er beholdt |
| Eksisterende Storage | Åtte bucket-oppsett og 22 policies registrert. Rehearsal bevarer gamle regler/data; fire nye Bolig-buckets er private |
| Edge Functions | Sju nye funksjoner kartlagt. Ingen finnes i produksjon. Oppdaterte filgatewayer kompilert i Sandbox v2, fil-for-fil identiske med kandidaten |
| Produksjonsdomener | Hoveddomene og www registrert uten redirect. Begge godtas nå uttrykkelig i Boligs avsenderliste; ukjente domener avvises |
| Automatisk e-post | Nye transporttabeller starter pauset. Cron må fortsatt passere transport-/tidspunkt-/tilgangskontroll |
| Backup tilgjengelighet | **IKKE VERIFISERT. Supabase krevde CAPTCHA; innloggingen er ikke fullført** |
| Samlet brukerprøve | Kenneths TEST OK og tidligere oppgitte fysiske Windows-/mobil-/Safari-prøver er ikke attestert |

Siste publiserte kandidat og CI-status føres i PR278. Kodegrunnlaget før denne
klargjøringen var e6105d582f8150a794457303aabf1101ddb03167. Planen har ikke nye
Bolig-migrasjoner. Den eneste produktrettelsen er Boligs eksplisitte støtte for
www-domenet. Excel, booking, BankID og reell AI-kjøring står fortsatt utenfor.

## Kontrollerte mål og frysing

- Repo: ExpoProffsenter/expo-proffdok. Feature: fase45b-boligprosjekter-foundation-20261020.
- Main/produksjonskode: 36462e2b05ecd8e53dcdd7818c4b791b7c7cb2ed.
- Produksjon Supabase: dqffxflaoyarbxyiyhop. Sandbox: ppvircenkjizeiqdxphj.
- Vercel prosjekt: prj_7mJlDQacdFIZ8sPcTBVWCj24OqFm, team team_Yvcnc6KRYfVB1W2LQjCffZGT.
- Gjeldende produksjonsdeployment: dpl_8WUDQuMtEBcq8EExKrRbaHKppbWE, READY,
  target production, samme main-SHA. Dette er registrert frontend-rollbackmål.
- Produksjonsdomener: https://expo-proffdok.app og https://www.expo-proffdok.app.

Ved endret main, funksjonsdefinisjon, ACL, Storage-regel eller migrasjonspayload:
stopp og ta ny avstemming. Ikke overskriv nyere arbeid for å få planen til å passe.
Konkrete filhashes, installasjonsnavn og rekkefølge står i
`evidence/bolig-release-manifest-20261025.json`.

## Hvorfor vi ikke kjører en generell db push

Prod har 213 historikkrader, mens main har 179 migrasjonsfiler. En rekke eldre
navn/tidsstempler avviker allerede mellom repo og faktisk produksjon. Sandbox har
også 43 andre installasjonstidsstempler for Bolig, og separat indeksfaktura har
et dokumentert eldre prefiks i navnet. Navn alene og versjonsnummer alene er
derfor utilstrekkelige installasjonsbevis.

**Ikke kjør `db push --include-all`, blind replay eller global migration repair.**
Ikke omskriv gammel historikk i forbindelse med denne leveransen.

Ved en senere autorisert installasjon brukes kun manifestets 72 filer, i angitt
rekkefølge, gjennom Supabases migrasjonsoperasjon mot eksplisitt produksjons-ID.
`name` er manifestets `migration_name` uten versjonsprefiks; SQL er nøyaktig den
hashkontrollerte filen. Installer én migrasjon om gangen og registrer faktisk
returnert/installert historikkversjon mot fil/SHA256. Ikke anta at tjenestens
installerte tidsstempel blir likt filnavnet.

Før hvert steg: kontroller at navnet ikke allerede finnes. Ved tapt svar eller
feil: les faktisk historikk og SQL-payload før ny handling. En identisk, allerede
installert migrasjon skal ikke kjøres igjen. Ved uklar eller delvis installasjon
stoppes kjeden; det gjøres ingen opprydding med DROP/DELETE.

## Felles funksjoner og bevaring av den eksisterende appen

Fem felles innganger har avtalte endringer:

1. `get_my_personal_context`: egne Bolig-inn/ut-prosjekter kan gi Min side-inngang;
   HR-metadata kan følge aktiv Bolig-lisens. Eksisterende prosjekt-/HR-flyt beholdes.
2. `hr_private.has_module_access`: aktiv intern Bolig-bruker kan få avledet
   HR-modultilgang; ingen ansattregistrering, leder eller leserrolle opprettes.
3. `people_modules_company_get` og `people_modules_user_get`: oppgir at HR er
   inkludert; de opprinnelige selvstendige HR-grantene endres ikke.
4. `hr_private.can_read`: NULL i lederfelt skal eksplisitt gi false, aldri føre
   til at en negativ tilgangskontroll blir SQL NULL. Legitimerte leserveier beholdes.

De faktiske produksjonsdefinisjonene og ACL ligger i
`evidence/bolig-release-baseline-20261025.json`. Begge dynamiske Min side-ankre
og kopieringsankeret for sjekklistebekreftelse finnes i produksjon. De nødvendige
Cron, Net, pgcrypto og Vault-utvidelsene er installert. Prod og Sandbox bruker
PostgreSQL 17.6; pg_net-versjoner avviker, så produksjonens eksisterende versjon
beholdes. Det bestilles ingen oppgradering som sideeffekt.

Ingen gammel Sales-, HR-, time-, prosjekt-, Support- eller leverandørfunksjon
skal redeployes av denne pakken. Den ordinære leverandørmailens renderer er
beskyttet av core-boundary. Nye Bolig-Edge-bundler skal bruke kandidatens lokale
helperfiler; eldre Sandbox-bundler har enkelte tidligere logohelperutgaver.

## Edge Functions, filtilgang og e-post

| Ny funksjon | verify_jwt | Krav ved senere utrulling |
|---|---:|---|
| bolig-order-email | true | Egen Auth-/scopekontroll, eksplisitt mottaker/ordre og kvittering; ingen automatisk utsending |
| bolig-protocol-email | true | Egen Auth-/scopekontroll og eksplisitt bekreft-og-send |
| bolig-progress-notifications | false | Privat Vault-token, pauseflagg og fersk validering av ansvar/frister; ingen vanlig klienttilgang |
| bolig-partner-files | false | Avgrenset capability-token og ny SQL-kontroll før/etter private bytes |
| bolig-partner-email | false | Auth.getUser og manager/issuer-kontroll; DB-transport starter av |
| bolig-resident-link-email | false | Auth.getUser og boligens manager-kontroll; DB-transport starter av |
| bolig-contract-files | true | Auth.getUser og navngitt privat kontraktstilgang før/etter bytes |

Deploy kun disse sju med manifestets verify_jwt-verdier og alle relative
avhengigheter fra samme kandidat. Ikke deploy hele funksjonskatalogen. Bygg-
verktøyet må ta med ny `_shared/bolig-origins.mjs` i begge filgatewayene.
Den inneholder bare de to verifiserte produksjonsdomenene og de to faste
Preview-/Demo-adressene. Dette gir ingen anonym eller utvidet kontraktstilgang.

`SUPABASE_URL`, `SUPABASE_ANON_KEY` og `SUPABASE_SERVICE_ROLE_KEY` kommer fra
riktig prosjekt. Eksisterende Resend-/avsenderhemmeligheter må aldri kopieres
fra Sandbox, vises i logg eller legges i frontend. Ikke endre globale nøkler.

Transportstatusene skilles uttrykkelig:

- Fremdrift/frister/dialog: progress_mail_settings starter false, med tom endpoint.
  En cron-jobb kan være registrert, men den gjør ingen HTTP-utsending mens bremsen er av.
- UE-/leverandørinvitasjon og beboerlenke: egne settings starter false.
- Ordre og rettet protokoll: er eksplisitte send-handlinger, uten tilsvarende
  global DB-pause. Å deploye dem med eksisterende Resend-nøkkel er ikke en attestert
  innbokstest. Hold Bolig-lisenser av til funksjonene er gjennomgått, og ikke bruk
  en virkelig bestilling som test.

Rutine-e-post forblir permanent stoppet. Ingen reell utsending eller generell
transportaktivering er del av denne klargjøringen. Første innbokstest avtales
særskilt med konkret mottaker og innhold; ingen test på tilfeldige kunder/UE.

## Backup og gjenoppretting

Supabase-tilkoblingen tilbyr ikke aktuell backupoversikt. Sikker dashboard-
innlogging er startet, men ble ikke fullført etter CAPTCHA. Panelet er tilbake på innloggingsbildet. Ingen backupdato, retention, PITR,
restorepunkt eller fullført restore er derfor attestert. Ingen betalt plan,
PITR-tillegg eller kopi av produksjonsprosjektet er bestilt.

Før produksjonshandling må backupoversikten bekrefte et fullført, tilgjengelig
backup-/PITR-punkt. Noter tidspunkt i Europe/Oslo, tilgjengelig historikk og hva
som eventuelt går tapt ved å gå tilbake dit. Dersom det ikke finnes et brukbart
punkt, stopp og avtal konkret backup før utrulling. En faktisk full restore er
ikke prøvd i denne runden og skal aldri utføres mot live bare som kontroll.

Databasebackup dekker ikke Storage-objektenes bytes. Ta vare på eksisterende
filoppsett og en kontrollert gjenopprettings-/kopieringsmulighet for filene.
Denne migrasjonspakken sletter ingen eksisterende bucket eller fil. Ny Bolig-
lagring er versjonert/uforanderlig og skal beholdes også ved frontendrollback.
Kilde: https://supabase.com/docs/guides/platform/backups .

Primær tilbakeføring ved feil i ny modul er data-bevarende:

1. Stopp videre release/lisensaktivering. Slå av bare Boligs lisenser og egne
   transportbremser. Ikke stopp andre modulers jobber eller e-postmotorer.
2. Flytt produksjonsalias tilbake til registrert frontenddeployment via Vercels
   rollback. Verifiser de faktiske domenene etterpå. Merk at rollback kan stanse
   senere automatisk domenetildeling til man eksplisitt promoterer igjen.
3. Ved behov for backendtilbakeføring: bruk `scripts/bolig-release-shared-rollback.sql`
   i én transaksjon, mot eksplisitt prosjekt dqffxflaoyarbxyiyhop, med
   `SET LOCAL expo.bolig_release_target='dqffxflaoyarbxyiyhop'`.
   Filen stanser ved uventede funksjonsfingeravtrykk og tåler kjente mellomsteg.
4. Fire felles innganger settes tilbake til produksjonsgrunnlaget. NULL-leder-
   sikringen i can_read beholdes; tilbakeføring skal ikke gjeninnføre en mulig
   uklar tilgangsavvisning. Ingen tabell, migrasjonshistorikk eller fil slettes.
5. Kontroller ordinær Min side/HR, tilbud/befaring, prosjekt og filer. Bevar nye
   Bolig-data til feilen er undersøkt. En hel-database-restore er en separat
   driftsbeslutning som kan ramme alt som er registrert siden restorepunktet.

Den eksakte recoveryfilen er kjørt i lokal generalprøve, inkludert avvisning av
uspesifisert mål, bevaring av gamle data/filer og gjenopprettede definisjoner.
Dette er ikke en attestert fysisk Supabase-restore.

## Kontrollert produksjonsløp etter egen fullmakt

1. Frys nøyaktig kandidat-SHA/tree, grønn full CI, aktuell main og rollbackmål.
   Fullfør backupporten og samlet TEST OK. Ingen uavklarte parallelle main-endringer.
2. Kjør `scripts/bolig-release-production-preflight.sql` mot produksjon. Den er
   read-only og stopper ved endret schema, felles funksjon/ACL, Storage eller
   forutsetning. Den er allerede kjørt med PASS under klargjøringen, men må kjøres ferskt.
3. Installer manifestets 72 migrasjoner kontrollert som beskrevet ovenfor,
   med Bolig av for alle firmaer. Verifiser 0 aktiverte lisenser og av transport.
4. Deploy de sju navngitte Edge-funksjonene fra nøyaktig samme kandidat. Kontroller
   JWT-/egen autentisering, privat Storage, hoveddomene/www og avviste innsyn.
5. Bygg og prøv en staged **Production**-deployment med produksjonsbinding og uten
   domenetildeling, eksempelvis Vercels dokumenterte `--prod --skip-domain`-løp.
   En Sandbox-Preview skal ikke promoteres som om det var et testet produksjonsbygg.
6. Etter godkjent staging kan main merges. Backend skal allerede være kompatibel
   før Vercels automatiske main-deployment kan gå live. Kontroller at live tree
   er den godkjente kodepakken og at faktisk deployment bruker produksjon.
   Ved avvik brukes det registrerte rollbackmålet; ikke løs problemet med nye
   migrasjoner eller globale miljøendringer under tidspress.
7. Gjenta relevante reiser i live miljø: åpne eksisterende tilbud/befaring med
   lagrede data, fanebytte/fokus, prosjektsjekkliste, avvik/KS-HMS, HR/Min side/timer,
   ordinær leverandørordre, filer, Support samt bruker-/firmaskifte. Ikke publiser
   tilbud, send inn timeføring eller send e-post som en skjult QA-handling.
8. Aktiver Bolig bare for uttrykkelig valgt produksjonsfirma og navngitte roller.
   Sandbox-demo-ID-er og pilotdata skal aldri brukes som produksjonslisens eller
   kopieres til produksjon. Ingen opprydding/nullstilling av eksisterende arbeid.
9. Etter produksjonsverifisering synkroniseres main kontrollert til demo og
   Sandbox-preflight gjentas. Aldri demo til main.

## QA-bevis og praktiske grenser

- 312 manifest-/payload-/forutsetningskontroller PASS.
- 108 lokale installasjons-/Storage-/recoverykontroller PASS, alle 72 i rekkefølge.
- 49 HR-kontroller med faktiske produksjonsdefinisjoner og sikker rollback PASS.
- 55 faktiske gatewaykontroller av tillatte/avviste avsendere PASS.
- 25 kontraktsfil-, 20 UE-fil- og 72 privat kontraktsgjennomgangskontroller PASS.
  Ingen modell- eller e-postleverandør er brukt i disse prøvene.
- Full critical Sandbox-build og diff --check PASS. Fersk samlet CI og kandidatens
  Preview-deployment føres i PR278 etter publisering av denne klargjøringen.
- Tidligere CI707 var grønn på e6105d5. Det er ikke ny CI-attest for denne rettingen.

De eksisterende advisorfunnene er lest. Produksjonens search_path-, offentlig
RPC- og passordbeskyttelsesvarsler er ikke introdusert eller rettet her. Sandbox
har i tillegg pg_trgm i public. Boligs RLS uten direkte tabellpolicies er bevisst
stengt bak gateways; de to authenticated SECURITY DEFINER-filkontrollene er
rettighetskontroller og er dekket av innsyns-/tilbakekallingsprøvene. Dette er
ikke en påstand om at hele appens sikkerhet er ferdig auditert. Supabases forklaringer:
[RLS uten policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy),
[autentisert SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
og [passordbeskyttelse](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Denne planen erstatter ikke Kenneths samlede TEST OK eller faktisk Windows- og
mobil-/Safari-prøve. Ingen 100 %-garanti gis for uprøvde forhold.
