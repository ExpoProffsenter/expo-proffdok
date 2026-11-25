## Samlet kandidat og live kontroll 13.11.2026

Publisert sandbox-kandidat d0ff0d2de559688de9c0ca39782c18457781939c, Vercel dpl_3BKZwoSUM17gQ69yjEpMDjQzcpd5 READY på fast PR323-adresse. Faktisk main f7298e11 er andre forelder; invitasjonsrettelsen og Orvei-hjelpen er begge beholdt. Lokal full build,1815SQL,13batchlivsløp,11utvalgs-/mottakerkrav og faktisk invitasjonsklient PASS. Ny full GitHub-kjøring43338701347 pågår; tidligere Orvei4783fe64 var fullgrønn43335383199.

Innlogget skynett etter oppdatering: beholdt innlogging; full appoppdatering åpnet Startsiden, prosjektet ble åpnet på nytt. Lagret batchkladd gjenåpnet med tre eiere/to boliger; de to eierne på24 hadde identisk portal. Sending pauset og knapp disabled. Bekreftelsesfeltet følger nå samme linje som teksten. Avsluttet kun den lokale listen uten sending, valgte byggA/fire boliger og deretter byggB/seks; kontrollisten viste10 og beholdt tidligere utvalg. Manglende kontaktinformasjon ble tydelig varslet og lenkeklargjøring blokkert. Byttet til bestillingsfrist, lukket/gjenåpnet:10boliger,handling og datoutkast21.11 beholdt, bekreftelse nullstilt. Ingen ny serverlagring, fristendring, portalopprettelse eller e-post under denne kontrollen. Bilder:evidence/orvei-integrated-recipients-20261113.jpg og orvei-integrated-deadlines-20261113.jpg.

### Konkret produksjonsforberedelse (ikke utført)

Read-only produksjon dqffxflaoyarbxyiyhop: ingen av de fire Orvei-migrasjonene installert; beboerlenke-e-post enabled=false,site_origin=https://expo-proffdok.app. Resident-link-email remotev1,verify_jwt=false. Før installasjon må historikk/definisjoner hentes på nytt. Rekkefølge:20261112222106_household_contacts →20261112232829_resident_batch_deadlines →20261112235913_portal_company_brand →20261113000853_portal_public_brand. Ingen gamle installasjonsskript.

Edge-pakken er prøvd lokalt med nøyaktige nåværende produksjonshjelpere og kun ny resident-link-email.mjs:62+2mocktransportkrav PASS. Bevar index.ts SHA2562abf9fff1d8f31c8ef5c80cb00bca281a391062962605d66ef204597b4cbad45, partner-helper1c9a9fcfc4e20b0467c6ed8e947e32c59733a352f9fc11708777b5fb2b9f9947 og supplier-helper e8d59e3e990f3fcffa7ffb1815033791b18155232109399eea4cf70a88831417. Ny resident-helper42ce5810d86c55d64454c2d11ace186ce3434fb14d51ebc5a57f400fcbdca981. Hent ferske funksjonsfiler før faktisk deploy; behold verify_jwt=false og handlerens Auth/SQL-validering. Dette er ikke utført Edge-deploy.

Krever egen Orvei-TEST OK før migrasjon/merge/produksjon. E-postpause bevares; konkret aktivering av beboerlenkeutsending må avtales, rutine-e-post skal ikke åpnes. Etter release: korrekt publisert SHA, backendbinding og read-only etterkontroll, deretter main→demo med bevart overlay og preflight. Rollback bevarer eierdata, frister og logger; se arkitektur. Mobilvisning, faktisk Excel-opplasting i nettleser, to separate enheter og reell e-postleveranse er ikke live-attestert. Orveis faktiske filer er ikke mottatt. Ingen ny video er publisert; revidert fullfilmplan ligger i BOLIG_AA_REVISION_20261113.json.

## Tidligere kontrollpunkter

## Oppdatert kontrollpunkt 13.11.2026

Kandidat4783fe64 har bestått full GitHub-kontroll43335383199. PR324 er siden publisert: main f7298e118f672e0b261b8a0f3f95e6e2d4e5e657, demo0984fe1c8a6284ae13909db6dc391a172689f2f9. Publisert main flettes nå i eksisterende Orvei-branch, ikke ny erstatnings-PR. Bare CURRENT_RELEASE_STATUS hadde tekstkonflikt; Firmaadmin/hjelp flettes med begge funksjonssettene beholdt. Ny samlet QA kreves. Orvei-funksjonene er ikke produksjonsgodkjent. Support-companion320 står fortsatt queued; ingen ekstra køforsøk.

# Orvei – beboere, bygg og delt portal

Arbeidsbranch: feature/bolig-residents-buildings-20261112. Base main d68cf2e530d5ab6afcfe2f97d75150c977bcd64f. Miljømål BEGGE. Ikke produksjonssatt. Ingen ny TEST OK er gitt. Ingen reelle mottakere eller produksjonsdata er brukt.

## Omfang
- XLSX/CSV/innliming til eksisterende boliger med manuell kontroll av kolonner og koblinger.
- Tallbaserte bolignummer, flere eiere på én bolig, én delt portal.
- Valg av ett/flere bygg i samme beboervarsel, eksplisitt mottakerliste.
- Import i appens høyrepanel, fast topp og handlinger; flere eiere i eksisterende boligheditor.

## Utført kontroll
- Lokal PostgreSQL/PGlite: 1782 assertions bestått, inkludert 19 nye kontroller av delt portal, tilbakekalling, atomisk import/retry, duplikater, leser- og firmaskille.
- Lokal React: eksisterende foundation-scenarier bestått; 21 nye importer-/XLSX-/mottakervalgskontroller bestått.
- Bygging og React foundation bestått igjen etter høyrepanel- og hjelpejustering.
- Lokal Chromium stoppet før appstart: socket() failed: Operation not permitted. Ingen visuelle browser-scenarier gjennomført i den kjøringen. Bruk skynett mot sandbox-preview.

## Gjenstår før godkjenning
- Full faktisk importdialog-test, inkl. beholdt utkast, usikkert svar og tilgangstap.
- Sandbox-migrasjonen er installert og prøvd, se kontrollpunkt under. Produksjonsinstallasjon gjenstår.
- Publisert commit og sandbox-binding er bekreftet. Skynett på bred skjerm er prøvd; smal skjerm gjenstår.
- Grønn GitHub-kontroll og Kenneths TEST OK før egen produksjonsplan/main→demo. Support-TEST OK omfatter ikke dette nye funksjonsomfanget.
- Orveis faktiske Excel og fremdriftsplan er ikke mottatt. Importoppsett må avstemmes mot dem.

## Kort brukertest i riktig testmiljø
1. Åpne boligoppsett → Importer beboere fra Excel. Panelet skal ligge til høyre, og lagre/lukk skal være tilgjengelig med lang liste.
2. Bruk syntetiske eiere med example.invalid-adresser. Koble to eiere til bolig 24; kontroller hovedkontakt og begge navn.
3. Lukk og åpne igjen. Kladden skal være bevart. Lagre én gang og kontroller at én bolig har begge eierne.
4. Kontroller samme beboerportal og felles tilvalg. Fjern en ekstra eier; gammel portal skal stoppe. Ikke send reell invitasjon.
5. Velg Flere bygg i et varsel. Kryss av to bygg og fjern ett. Kontroller mottakerlisten uten reell sending.

## Video
V12-redigerbare kilder er hentet fra Library. Kun 3 av 57 scener har cursor-target i opprinnelig tidslinje. Ny videorekkefølge, gjennomgående peker og nye opptak er ikke levert. PR321 er separat teksthjelp og skal ikke beskrives som ferdig revidert video.

## Historisk blokkering før rettelse
Skynett åpnet permanent demo 12.11. Før innlogging viste appen «Kunne ikke hente FDV-register ... permission denied for function app_support_prepare_request». Read-only SQL bekrefter offentlig pre-request-funksjon har EXECUTE kun for authenticated, mens hook er global. Ny boligmigrasjon er ikke installert. Dette må isoleres og rettes i supportleveransen før samlet test.

Boligarbeidsbranch er opprettet fra eksakt main-baseline. Branch-spesifikk Preview-variabel EXPO_BACKEND_TARGET=sandbox er registrert i Vercel; ingen produksjonsvariabler endret.

Før produksjon: avstem mot faktisk main og support PR322 + companion PR320. Test samlet kandidat, særlig offentlig/innlogget portal, flere eiere, supportskriving/slettesperrer, firmaskille og ordinær tilbudslagring. Grønn status for separate eldre commits er ikke tilstrekkelig. Ny vesentlig supportrettelse krever fornyet vurdering av tidligere TEST OK. Ingen endring av køinnstillinger, ekstra feilsøkingskjøringer eller erstatnings-PR-er.

## Verifisert sandbox-kontroll 12.11 kl. 23 UTC

Frontend 59337a1a2e08af8957c70763763980b5ba947ca0, READY deployment dpl_BoHDts56CykQXCBLYyjxpz84ma52. Fast testadresse: https://expo-proffdok-git-feature-bolig-residents-build-739874-ringside.vercel.app/?progressTest=safe . Utsendt klientkode er kontrollert bundet til sandbox ppvircenkjizeiqdxphj, ikke produksjon.

Local 20261112222106_bolig_household_contacts installert kun i sandbox som remote 20261112225500 etter kontroll av at den manglet. Sikkerhetsrådgiver før/etter viste samme funn. Eksisterende advarsler er ikke rettet av denne leveransen.

Skynett opprettet syntetisk prosjekt QA – Orvei import og felleseiere 12.11, referanse QA-ORVEI-20261112, root 6dd4a9b9-be93-4428-b060-5cdb74157607. QA Bygg A har fire boliger, QA Bygg B seks. Eksisterende nummereringsdialog lagret 24,25,38. Import via innlimt tabell koblet fire eiere til tre eksisterende boliger. Æ/Ø/Å og ledende nuller i mobil ble bevart. Lagring uten valgt hovedkontakt ble korrekt stoppet. Etter valg av hovedkontakt ble utkast og valg bevart ved lukking/gjenåpning. Lagring viste tre boliger oppdatert. Databaseavlesing bekreftet ti boliger totalt, ingen dublett, begge eiere på 24 og én importkvittering.

Leilighetsinformasjon viser hovedkontakt og tilleggseier i høyrepanelet. Varsel → Flere bygg: A+B viste ti mottakere, bare A fire, tilbake til begge ti. Lagret kun utkast. Database bekreftet ti mottakerrader, én gruppe, null publiserte meldinger og null leveranser. Ingen reell mottaker brukt.

Klargjør invitasjon → Lag portaltilgang opprettet testlenke uten sending. Den ble først avvist av support-hooken. Separat rettelse er lagret i PR322 f64efcc8d1b957d829e9ea96bd39ce539dde48ea, ikke i boligbranchen. Lokal supportmigrasjon 20261112230911 → sandbox remote 20261112230959. Etter installasjon åpnet samme lenke bolig 24 med Mine valg, Avtaler, Dokumenter og Meldinger. Ingen avtale/vilkår akseptert. Felles data og tilbakekalling ved endret eierliste dekkes også av lokal SQL-test; full to-enhetsprøve er ikke utført.

Komprimert XLSX generert med openpyxl og lest med faktisk parser: tre ekstra kontroller bestått (nummer 24, ledende nuller, norske tegn). Filvelgeropplasting i skynett er ikke prøvd; innlimingsløpet er prøvd ende til ende.

## Konkret restliste

- Eksisterende portal/invitasjon sier fortsatt «personlig / ikke videresend». Tilpass dette presist for flere registrerte eiere, behold sikker tekst for én eier. Ikke del med uvedkommende.
- Full React-dialogtest for usikkert svar/tilgangstap og visuell mobilkontroll. Faktisk XLSX-opplasting med Orveis fil når mottatt.
- Felles portal på to enheter og tilbakekalt gammel lenke i nettleseren (SQL-grunnlaget bestått).
- PR, grønne kontroller, egen TEST OK og kontrollert produksjonsplan. Produksjon uendret. Ingen utsending.
- A–Å/video/peker og norsk lyd gjenstår som beskrevet over.

Se [branchregister](BRANCH_REGISTER_20261112.md) og [samlet oversikt](RELEASE_OVERVIEW_20261112.md). Testbilder ligger i evidence/.

## Utvidelse avtalt 13.11.2026 (norsk tid)

Kenneth valgte: alle registrerte eiere får samme boligportal i separate e-poster; bestillingsfrist stopper nye tilvalg, men prosjektleder kan gi ny frist. Bygg/blokk/stamme/enkeltboliger velges samlet. Bekreftelsesliste viser navn, e-post, mangler, eksisterende lenke og valgmuligheter. Ingen automatisk utsending eller endring av avtalesvarfrister.

Implementert på samme featurebranch: bolig_resident_batch-gateway, atomisk portal-/fristbehandling, per-mottaker e-postvalidering, delte portaltekster, høyrepanel med bevart kladd/eksakt retry, hjelp. 1813 SQL-assertions (31 nye batchkontroller), 11 utvalgs-/mottaker-/maltester, 13 faktiske React-panelscenarier, 62 eksisterende e-posttester med mock transport og full build PASS. Første React-testoppsett manglet Vite cssFileName/array-håndtering og jsdom MessageChannel; rettet testmiljø, ingen appkontroll svekket. Første database-scenario prøvde melding i prosjekt med meldinger AV; test-fixturen aktiverer nå meldinger eksplisitt, appens standard forblir AV.

Ny SQL-test dekker hele utvalgets rollback, leser/fremmed firma, duplikatboliger, stale basis, samme retry, erstatningsbekreftelse, medeiere (og store bokstaver i e-post), avvist uvedkommende, pauset sending, friststopp, replay over frist, fortsatt aktivert dialog og gjenåpning av én bolig. React-test dekker fokus/dvale, endret servergrunnlag, kladd etter lukking, usikkert svar og samme token/referanse, pauset utsending, mottakerskjuling ved tilgangstap og sent svar etter bevisst lukking.

Ingen faktisk e-post er sendt. Live sandbox-/publiseringsstatus for denne utvidelsen må verifiseres før TEST OK. Endelig video er ikke oppdatert; nytt opptaksmanus ligger i BOLIG_BATCH_VIDEO_20261113.md.

### Installasjonskontroll for batchfunksjonen

Kun sandbox ppvircenkjizeiqdxphj: lokal 20261112232829 → remote 20261112234121. Verifisert anon EXECUTE=false, authenticated=true og mail_enabled=false. Sikkerhetsrådgiver: ingen nye WARN; én forventet INFO for privat kvitteringstabell med RLS uten direkte klientpolicy (197→198). Ingen direkte tabellrettigheter er gitt.

bolig-resident-link-email v4→v5 deployet kun i sandbox. verify_jwt=false beholdt; handlerens Auth.getUser og kanoniske SQL-autorisasjon består. Ny klient sender forventet bruker-ID; mismatch mellom supportvisning og faktisk innlogget JWT avvises før transport. 62 eksisterende +2 nye e-postkontroller bestått, også med nøyaktige sandbox-avhengigheter. Ved deploy ble eldre remote logo-/avsenderhjelpere oppdaget: disse ble bevart byte-for-byte, bare resident-link-email.mjs ble oppdatert. Ikke overskriv andre deployede hjelpere ukritisk ved produksjonssetting.

Sandbox site_origin i e-postinnstilling er fortsatt den eldre fase45b-previewadressen. Sending er AV. Før aktivering/ekte utsending må riktig mottakeradresse til appen kontrolleres per miljø (produksjon expo-proffdok.app); ingen konfigurasjon er endret for å sende nå.


## Live batchkontroll 13.11 norsk tid / PR323

Kandidat eb7efbb5a02dc37b2e1c1d5b7b42482839e9e2f1, READY dpl_8yekaeuMzWCVUB7QoUXeP9nR97PK, samme faste preview. I syntetisk QA–Orvei-prosjekt ble frist 2026-11-21 lagret samtidig for alle fire boliger i QA Bygg A og bekreftet i fersk UI. Native datofelt krevde tastaturhendelse i cloud-driver; vanlig fill alene oppdaterte ikke React. Ingen bekreftet appfeil i datofeltet.

Deretter valgt bolig24+25, eksplisitt erstattet gammel syntetisk lenke24, klargjort to portaler. Listen viser tre eiere:24 har to identiske portaladresser,25 egen. Pauset e-post vises, utsendingsknapp er deaktivert. Ingen e-post forsøkt eller sendt. Bilde: evidence/orvei-batch-recipients-20261113.jpg. Selve e-postleveransen, ny fristvisning på offentlig portal og mobilvisning av nytt panel er ikke live-verifisert i denne runden; server-/komponenttester dekker frist og mottakergrenser. Video er manus, ikke ferdig opptak.

PR323-kjøring43331389746: bolig-db, bolig-browser, build, HR og øvrige datatester bestått. app-browser feilet i bolig-guidance-workspace-browser-check fordi testens katalog bare inneholdt de gamle temaene (forventet8 i struktur, fikk12). Ny kontrakt: behold alle opprinnelige teksthash-kontroller, inkluder fem nye household-temaer, åpne og kontroller hvert av dem og tell faktisk hele gruppen. Ingen terskel senkes eller kontroll utelates. Etterfølgende commit retter dette og begrenser label-layout til det nye panelet for avkryssing ved siden av tekst. Ny GitHub-kontroll kreves. PR320 siste43097043078 fortsatt queued. Produksjon/main/demo uendret.

## Firmalogo i portal
Additiv migrasjon20261112235913 legger bare logo_url i portalidentiteten fra prosjektets firma. Klient bruker proporsjonal logo opptil260×88px (mobil220×76), firmanavn beholdes og ikon vises ved bildefeil. Krever sandbox-installasjon og visuell kontroll. Ingen produksjonsendring.

Logo: lokal database1815 og build PASS. Installert kun sandbox etter kontroll av eksisterende portal_state. Ingen realutsending.

Live logooppfølging: work_profile_company_profile krever auth.uid og returnerte null for anonym beboer. Additiv rettelse20261113000853 erstatter kun private portalprojeksjonen med prosjektfirmaets logo fra samme firmakilder. Ingen full firmaprofil eksponeres, og direkte funksjonskall forblir sperret. Ny SQL-test krever konkret firma-logo ved anonym portalåpning.

Endelig anonym logotest:1815SQL PASS med konkret prosjekteierlogo. Rettelsen installert sandbox; faktisk anonym portal viser lesbar Expo Proffsenter-logo proporsjonalt, frist21.11 og delt eierportal. Bilde evidence/orvei-portal-logo-20261113.jpg. Logoen i eksemplet følger QA-prosjektets firma; Orvei vil få sin lagrede firmalogo. Mobil er ikke visuelt prøvd i denne runden. Før logoens anonyme rettelse bestod GitHub43333662948 på b0e817c2; ny additiv migrasjon krever ny kontroll.
