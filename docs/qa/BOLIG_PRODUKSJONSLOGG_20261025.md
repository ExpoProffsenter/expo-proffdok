# Boligprosjekter PR278 – faktisk produksjonslogg og videreføring

25. oktober 2026. Miljømål BEGGE. **Dette er utført utrulling og etterkontroll**, etter Kenneths samlede TEST OK og fullmakt. Dokumentet erstatter eldre «OPEN DRAFT / ikke installert / backup uavklart»-status som aktuell driftsstatus. De eldre planene beholdes som historikk og gjenopprettingsgrunnlag.

## Gjeldende resultat ved etterkontrollen

| Område | Kontrollert resultat |
|---|---|
| PR278 | Merget etter grønn obligatorisk CI712, run `40206639042`; alle rapporterte steg har success |
| Godkjent kandidat | `f39d374c28242b941ebf18f1f265560bc44f9752` |
| Produksjonscommit | `a939d332918d5cd2daed3e14788188b3f50597fe` |
| Godkjent og levert tree | `d7612864810712e1f7212072f9f91d80b2275e6e`, identiske |
| Production deployment | `dpl_51R2ojvH3KCgTbu2LcidjkzWn9SG`, READY |
| Faktiske domener | `https://expo-proffdok.app/` og `https://www.expo-proffdok.app/`, kontrollert på dette bygget |
| Production Supabase | `dqffxflaoyarbxyiyhop` |
| Backend | Alle 72 manifestmigrasjoner installert kontrollert; 285 historikkrader totalt, hvorav 72 Bolig |
| Nye Edge Functions | Bare de sju i produksjonsplanen; alle 24 kildefiler lest tilbake og bytekontrollert |
| Bolig-lisenser | **0 aktiverte produksjonsfirmaer, 0 produksjons-Bolig-prosjekter** |
| Bolig e-post i Production | Partner-, beboerlenke- og fremdriftstransport er pauset |
| Permanent demo | Main → demo synk `d61132db0e874358a4fc75e45a8a02cd075c9f19` |
| Demo tree / deployment | `a8da00de08d550c8b31e2f9c3d5d414f2850126b` / `dpl_FLdskdKaMwvruXGPRpqZuLbiHmXa`, READY |
| Sandbox Supabase | `ppvircenkjizeiqdxphj`; egen Auth, data og Storage |
| Etter-synk preflight | Faktiske Sandbox-RPC-er: 19 grunnkontroller og fem kurskontroller grønne |

Dette er en tidsfestet etterkontroll, ikke en automatisk bekreftelse på senere miljøtilstand. [Maskinlesbart utførelsesgrunnlag](evidence/bolig-production-execution-20261025.json) inneholder faktisk installasjonsversjon, navn og payloadhash for alle 72 migrasjoner, Edge-kildehashes, deploy-ID-er, bevaringskontroller og sendekvitteringer. Denne filen gjør videreføring uavhengig av chatrapporten.

## Produksjonsløpet som ble utført

1. Kandidat/tree, fersk main, grønn CI og registrert rollbackmål ble avstemt. Den lesende clean-install-preflighten bestod **før** installasjonen.
2. Manifestets 72 hashkontrollerte SQL-filer ble installert én om gangen, med faktisk historikk og SQL-payload avstemt etter hvert steg. Ingen generell db push eller historikkreparasjon.
3. Migrasjon 42 fikk først «Invalid or expired requestState». Fravær av historikk og delvise objekter ble kontrollert før ett vellykket nytt forsøk. Ingen blind replay.
4. Bare de sju nye Edge-funksjonene ble deployet med kandidatens lokale avhengigheter og planens `verify_jwt`. Gamle funksjoner ble bevart.
5. Staged Production `dpl_FyFJRfS4FpAnpr8eVX4brEMcJgDX` ble bygget fra eksakt kandidat, med Production-binding og uten flytting av produksjonsdomenene. Prosjektets automatiske domenetildeling ble midlertidig deaktivert og deretter kontrollert gjenopprettet til `true`. Den godkjente Vercel-connectoren ble brukt etter at CLI-nettverkstilgang var blokkert; ingen omgåelse.
6. Innlogging og eksisterende flyter ble kontrollert i staged Production. Klargjøring av PR-en utløste ny obligatorisk CI712; den ble avventet til success før merge med forventet HEAD.
7. Automatisk main-deployment ble verifisert på begge faktiske produksjonsdomener. Levert tree er identisk med godkjent kandidat. Hoved-JS er identisk med staging: SHA256 `4d8f182c144de143ba9515435267897f340baa98c9b829eeac89e639d22ef80f`, Production-adresse til stede, Sandbox-adresse fraværende. Byggloggen bekrefter «Production Supabase only».
8. Relevante eksisterende reiser ble gjentatt i live app. Deretter ble main kontrollert synkronisert til demo med bevart overlay og grønn backend-preflight.

## Bevaring av eksisterende app

- Av 626 eksisterende databasefunksjoner er 621 uendret. Bare de fem avtalte inngangene er endret: `hr_private.can_read`, `hr_private.has_module_access`, `public.get_my_personal_context`, `public.people_modules_company_get`, `public.people_modules_user_get`. Gamle ACL-er er bevart.
- Åtte gamle buckets, 22 gamle Storage-policies og 21 gamle Edge-funksjoner er bevart. Fire nye Bolig-buckets er private. RLS er på for alle 78 nye Bolig-tabeller.
- Tidligere og ny HR-tilgang er sammenlignet for 62 firmamedlemskap uten forskjell. Ingen ansatt-/lederrolle er opprettet som sideeffekt.
- Eksisterende tilbud ble hentet server-first og viste 17 linjer, 25 opsjoner og publisert v1. Lagret befaringstekst og skissebilde ble lest; skissen lastet i 720 × 460. Fanebytte og bevisst retur til Startside er prøvd.
- Ordinært prosjekt, sjekklistedialog/fanebytte, avvik/KS-HMS, sikker fremdriftsvisning, HR-register, Min side/timeføringsflate, Support, Prissøk og plukklisteflate ble åpnet. Prosjektets datahash/oppdateringstid er uendret.
- Firmabytte Ringside → Bademiljø Expo viste riktig merkevare og firmascope; retur til Ringside ble kontrollert. Egen prøve med et annet brukernavn er ikke utført.
- Ingen reell ordre, tilbudspublisering/-aksept, innsendt timeføring eller produksjonsmail ble brukt som skjult QA. Brukeren hadde ingen lagrede plukklister; ordinær ordreutsending er derfor dekket av CI og bevaringskontroll, ikke en faktisk Production-utsending.

### Observert eksisterende autosave – ikke påstand om uendrede data overalt

Å åpne tilbudseditoren i staged Production utløste den eksisterende autosaven ved mount, selv uten manuell redigering. Request-payloadhash og `updated_at` ble endret; `offerDraftSavedAt` ble oppdatert. Sales-produktkoden var byte-identisk med tidligere main. Publisert versjon, metadata og historikkhash var uendret, og synlige linjer, opsjoner og summer var like.

Hele request-deltaet er ikke fullstendig attribuert. Det hevdes ikke at bare tidsstempelet eller ingen produksjonsdata ble endret. Editor ble ikke åpnet på nytt i live-prøven; request-hashen var uendret etter denne. Før-/etterhashes og tidspunkt finnes i utførelsesgrunnlaget; kundedata og kommersielle beløp er utelatt.

## Main → demo

Demo-commiten har gammel demo `df94b2823fdefc7f303d5804bced1f3051a4a8df` og verifisert main `a939d332918d5cd2daed3e14788188b3f50597fe` som foreldre. De samme 53 overlay-stiene er bevart; 48 overlay-filer er byte-identiske. Resten er main-baseline, byggintegrasjon og automatiske felles dokument-/navigasjonsmerger. Alle øvrige appfiler er identiske med main.

Den eneste innholdskonflikten i `vite.config.js` ble løst ved å beholde både demo-kontroll, Boligs beboerinngang og OCR/PDF-ressursene. Full critical Sandbox-build, faktisk demo-preflight-regresjon og `diff --check` bestod. Publiserte blob-/tree-hashes ble kontrollert mot lokal versjon før forventet-SHA, ikke-force branchoppdatering.

Den faste demo-adressen og `/demo-control.html` svarte 200. Levert JS har Sandbox-binding og ingen Production-adresse, og kontrollsidens kompilerte main-referanse er `a939d332`. Kurs-/bilde-/PDF-/OCR-ressurser svarte 200.

19 + 5 backendkontroller ble kjørt som lesende transaksjon med dedikert demo-aktør og rollback. Ingen reset, Golden-oppdatering eller kopiering av produksjonsdata. Den ferske nettleseren på fast demo-host var utlogget, så innlogget samlet kontrollside-preflight med enhetens lokale redigerbare Badskisser er **ikke** attestert. Senere e-postprøver brukte den eksisterende innloggede feature-Previewen mot samme fysiske Sandbox.

## Faktisk e-postprøve i Sandbox

Kenneth godkjente en egen Sandbox-nøkkel. Resend-konto «ringside» viste `expoproffsenter.no` som verifisert. Nøkkelen «Expo ProffDok Sandbox mailtest 20261025» har **Sending access**, bare for dette domenet. `RESEND_API_KEY` og `CHAT_FROM_EMAIL` er lagret kun i Sandbox. Ingen produksjonsnøkkel ble lest eller kopiert. Nøkkelverdi, cookies og personlige tilgangslenker er ikke dokumentert i repoet.

Første UE-forsøk viste «E-posttjenesten er ikke konfigurert». Det ble ikke startet hos leverandøren; `begun_at`, `sent_at` og `provider_id` er NULL. Denne første testtilgangen er tilbakekalt. Dashboardet bekreftet at de to konfigurasjonsnavnene manglet. Etter godkjent oppsett ble følgende ekte prøver kjørt i eksisterende syntetisk prosjekt, **kun til `kenneth@ringside.no`**:

| Prøve | Faktisk resultat |
|---|---|
| UE-invitasjon | Resend delivered; Kenneth bekreftet mottak; lenken åpner riktig prosjekt med Fremdrift/Sjekklister og egen dokumentasjon, uten ordreflate |
| Leverandørinvitasjon | Resend delivered; Kenneth bekreftet mottak; lenken åpner riktig prosjekt med Fremdrift/Leveranser, uten sjekklisteflate |
| Beboerportal | Resend delivered; Kenneth bekreftet mottak; lenken åpner riktig H0202 i QA Bygg A |
| Beboerpåminnelse | Resend delivered og lagret kvittering; separat brukerbekreftelse er ikke gitt |

Kenneth: **«Mottatt alle tre.»** Dette bekrefter de tre invitasjonene, ikke alle øvrige e-postvarianter i appen. Eksakte request-/provider-ID-er og tidspunkt står i utførelsesgrunnlaget.

To tydelig merkede testkontakter og én tidligere tom fiktiv bolig er brukt. Ingen eksisterende kontakt eller portal ble erstattet. Tilgangene er beholdt for Kenneths lenkeprøve: UE/leverandør til 1. november, beboer til 24. november 2026. Det ble ikke opprettet et produksjons-testprosjekt eller nullstilt demodata.

**Alle Bolig-transporter i Sandbox er satt tilbake på pause.** Også HR-, KS/HMS-, time-, Support- og Sales-oppfølgingsmotorene ble kontrollert av. Nøkkeloppsettet består, men gir ingen lisensaktivering eller automatisk utsending i Production. Rutine-e-post forblir permanent av.

Ferske kodeprøver bestod: 56 partner-, 62 beboer-, 22 fremdrifts-, 46 ordre- og 24 protokollassertions, samt dialog/personvern og profilert beboervarsel. Disse brukte syntetisk e-postleverandør. Avtale-/endringsinvitasjoner, automatiske arbeids-/dialog-/ansvarligvarsler, ordre/vedlegg og protokoll er **ikke reelt innbokstestet** her. En generell Production-testmail er heller ikke sendt.

## Backup og gjenoppretting

Den oppdaterte backupporten er dokumentert i PR278: åtte tilgjengelige PHYSICAL-databasebackuper 18.–25. oktober; nyeste viste 25.10.2026 06:04:01 UTC = 07:04:01 CET. PITR er ikke aktivert eller kjøpt. Faktisk restore er ikke prøvd. En full restore kan miste senere endringer også i andre moduler.

Storage-bytes inngår ikke i databasebackupen. Separat kontrollert kopi av 635/635 filer, 655 843 022 bytes, er beholdt i de fire arkivene `Expo_ProffDok_filsikring_2026-10-25_{chat-images,project-documents-private,project-images,sales-inspection-photos}.zip`, sammen med `Expo_ProffDok_filsikring_2026-10-25_kontroll.json`. Alle åtte bucket-oppsett er med i grunnlaget. 623 tilgjengelige MD5-ETags, alle 635 SHA256 og ZIP CRC er kontrollert. Kopien ble tatt mens tjenesten var i drift; den er ikke et nytt databaserestorepunkt. Arkivhashes og videre detaljer står i PR278. **Selve backupfilene og appdata er ikke lagret i GitHub.**

Primært frontend-rollbackmål er `dpl_8WUDQuMtEBcq8EExKrRbaHKppbWE`. Frontendrollback reverserer ikke backend. Data-bevarende backendgjenoppretting finnes i `scripts/bolig-release-shared-rollback.sql`, med eksplisitt produksjonsmål og hashkontroller. Den er ikke kjørt. Ingen DROP/DELETE eller full restore som automatisk feilretting.

## Trygg videreføring

1. Les denne loggen, utførelsesgrunnlaget, `AGENTS.md`, `PROJECT_GUARDRAILS.md`, aktuell main/demo og faktisk miljøstatus.
2. **Ikke kjør gammel clean-install-preflight eller replay de 72 migrasjonene.** Avstem faktisk historikkversjon og payload mot utførelsesgrunnlaget før eventuell ny backendhandling.
3. Produksjonsaktivering krever konkret valgt firma og navngitte roller. Bruk ikke Sandbox-ID-er/pilotdata som produksjonslisens. Ingen generell transportaktivering følger av at installasjonen er ferdig.
4. Hold e-postprøver avgrenset til konkret mottaker/innhold. Samme Sandbox-nøkkel og fire utførte testmailer er allerede godkjent; ikke krev samme godkjenning igjen.
5. Før viktig demo: bruk fast demo-host og eksisterende demo-innlogging, og kjør samlet preflight. Ikke reset eller oppdater Golden for å skjule røde punkter.
6. Fysiske Windows-/mobil-/Safari-prøver, fysisk restore og uprøvde utsendingsvarianter skal ikke omtales som utført. Ingen 100 %-garanti for uprøvde forhold.

### Registrert neste UX-ønske – ikke implementert

Kenneth: **«Vi må senere finpusse layout på beboerportalen. Den er alt for kjedelig.»** Ta dette i en egen senere avgrenset UX-runde: bedre visuell profil, layout og tydelighet. Bevar tilgang, personlige lenker, avtaler og lagring. Ingen designendring er gjort under e-postkontrollen.

Excel-import og full automatisk AI-kontraktskontroll av store kontrakter er fortsatt utsatt. BankID og ny bookingflyt er utenfor denne releasen.
