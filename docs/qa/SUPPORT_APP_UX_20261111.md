# Supportmodus: UX-feil og utvidet produktkrav – 11.11.2026

Miljømål BEGGE. Arbeidsbranch `fix/support-project-sales-20261111` fra main `d68cf2e530d5ab6afcfe2f97d75150c977bcd64f`. Ikke TEST OK, ikke produksjonssatt.

## Systemeiers avklarte krav

Support skal velge en konkret kunde-/firmabruker og se vedkommendes faktiske app, startside, menyer, moduler og egne priser. Tilbake fra et prosjekt skal gå til firmaets startside uten å avslutte support. Bare Avslutt supportmodus skal gjenopprette supportaktørens egen app. Systemeier har eksplisitt valgt **også redigere**, i tillegg til lesing og opprettelse. Sletting skal være sperret. Endringer skal spores til faktisk supportaktør og valgt bruker/firma. Eksisterende begrensninger for reell utsending, kundeaksept, produksjonsdata og privilegieendring gjelder fortsatt.

Dette er målet, ikke en beskrivelse av dagens implementering. Ikke kall dagens prosjekt-, Sales- eller katalogstøtte en full kundemodus.

## Faktisk gjennomgang

- Innlogget produksjon https://expo-proffdok.app: åpnet ML Flis-prosjektet fra Firmaer og prosjekter. Åpne salgsgrunnlag er ikke disabled, men har MAIN med inert som ancestor. Bekreftet med DOM. Ingen prosjektfelt ble endret.
- Prosjektmeny → Salgsgrunnlag åpner fanen, men innholdet blir tomt: prosjektadapteren skjuler SalesCore, samtidig som generell Sales-CSS skjuler introen med dokumentinngangene.
- Tilbake tar til Systemadmin, ikke firmaets startside. I min prøve ble Ringside-logo gjenopprettet; brukerens skjermbilde viser at ML Flis-logo/supportbanner kan henge igjen. Identifiserte ubeskyttet forsinket projeksjon og asynkron opprydding.
- Tilbudsstøtte har en separat firmavelger og egne sperrer. `upsertSalesRequests` er ikke generelt skrivebeskyttet av supportmodus, og `publishSalesOffer` fører med support_company_id. Ikke åpnet kundens tilbudseditor under denne prøven og ikke testet publisering eller e-post.
- Katalogstøtte har separat målbruker og pris-RPC. Ingen felles brukerøkt binder denne til prosjekt/Sales.
- Read-only metadataoppslag i faktisk Production fant Sales-scope-funksjoner og supportsakskontekst, men ingen support-session/impersonation-funksjon. Ingen databaseendring utført.

## Avgrenset klientrettelse i denne kandidaten

Prosjektoversiktens rene navigasjon flyttes utenfor det inerte redigeringsområdet i support; felter og eksisterende Sales-editor forblir sperret. Hjelpetekst oppgir skrivebeskyttelse. Dokumentinngangen i Salgsgrunnlag skjules ikke av Sales-overblikkets CSS. Avslutning ugyldiggjør ventende projeksjoner og sender synkron opprydding til Sales-banner/logo.

Denne delrettelsen implementerer **ikke** det utvidede produktkravet om full app, opprettelse/redigering eller firmaets startside. Eksisterende retur til Systemadmin står foreløpig uendret. Må ikke merges som om hele oppgaven er løst.

## Kontroller

`npm run build` bestod, inkludert eksisterende critical checks. Ny `support-navigation-lifecycle-check.mjs` bruker faktiske navigasjonshandlere og projeksjonsfunksjoner; normal projeksjon, avslutning, sent svar etter avslutning og svar fra forrige firma består. Kjøres nå også fra critical-work-profile-check. Innlogget kandidat/Preview er ikke kontrollert ennå. Produksjon/demos SHA er uendret.

## Neste arbeid før samlet leveranse

1. Etabler en eksplisitt, servervalidert supportøkt med faktisk aktør, valgt bruker og firma; klientens data/cache/recovery må skille denne fra egen arbeidsprofil.
2. Kartlegg alle modul-RPC-er, tabellskriv, Storage og Edge Functions. Samme effektive brukerrettigheter/priser skal gjelde. Ikke bytt auth.uid globalt eller utsted kundens innlogging som en snarvei.
3. Serverstyrt slettesperre må dekke DELETE, slettende RPC-er, myk sletting, fjerning fra JSON-lister, filfjerning og erstattingsoperasjoner. Audit må bevare før/etter og supportaktør; UI-sperrer alene er utilstrekkelige.
4. Knytt startside, prosjekt, Sales, katalog og øvrige aktiverte moduler til samme økt. Skille Tilbake fra Avslutt. Test tilbake, refresh, dvale, firmabytte, tilbakekalt tilgang og sent svar.
5. Sandbox: legg til/rediger syntetisk tilbud/prosjekt og øvrige berørte moduler, verifiser korrekt firma, ingen sletting/utsending og audit. Publiser samlet Preview for TEST OK før kontrollert Production og main → demo.

Ingen tilbud, prosjekter, brukere, bestillinger eller meldinger ble opprettet, endret eller slettet under produksjonskontrollen. Ingen utsending.

## Videreført grunnlag – fortsatt WIP

To lokale migrasjoner er laget via Supabase CLI 3.1.0: `20261111182756_app_support_sessions.sql` og `20261111183233_app_support_write_gateway.sql`. De oppretter privat økt-/auditgrunnlag, deaktivert transport, request-lokal målidentitet og slettesperrer for eksisterende virksomhetstabeller. Ingen PostgREST-hook aktiveres. **Ingen migrasjoner er kjørt i Production eller Sandbox.**

`scripts/app-support-session-db-check.mjs`: **60 PASS** i PGlite 0.5.8. Faktisk SQL kjøres med syntetiske aktør-/kunde-/firmadata og RLS. Dekker tilbakekalling, utløp, annen aktørøkt, firma, privat audit, direkte DELETE, slettende SECURITY DEFINER-RPC, TRUNCATE, JSON-linjer/filer, soft-delete og uendret ordinær oppdatering/sletting. Dette er ikke test av alle appens eksisterende RPC-er eller Supabases faktiske Storage/API-tjenester.

`scripts/app-support-runtime-check.mjs`: **40 PASS**. Serverkontekst må bekreftes før aktiv tilstand. Dekker målidentitet uten mutasjon av aktørens Auth-objekt, opprinnelig token, blokkerte transporter, credential-grenser, utløp, byttet aktør, sent svar etter avslutning og separate kladder. `appSupportRuntime.mjs` er ennå **ikke koblet til bootstrap eller UI**. Begge tester er lagt til eksisterende CI-jobb for support.

Full `npm run build` med eksisterende critical checks bestod etter grunnlagsendringene. Kandidaten er ikke testet som samlet kundemodus i nettleser; UI-integrasjon, IndexedDB/recovery, Storage/Edge-adaptere og modulvis backendgjennomgang gjenstår. Generisk JSON-kontroll må ikke omtales som full slettegaranti for alle modeller. Se [arkitektur og aktiveringskrav](../architecture/APP_SUPPORT_SESSION.md).

Fersk remote-kontroll: main `d68cf2e530d5ab6afcfe2f97d75150c977bcd64f`, demo `8f7307bc909f19203ff2cfbf76de142936978748`. Disse er ikke endret av supportarbeidet. PR319 forblir draft og skal ikke merges eller aktiveres som fullført supportmodus.

## Innlogget Preview og korrigering etter nettleserprøve

Fast Preview er `https://expo-proffdok-git-fix-support-project-sales-20261111-ringside.vercel.app`. Denne ordinære arbeidsbranchen bruker produksjonsinnlogging, ikke sandbox-brukeren. Dette ble ikke presisert tydelig nok før første innloggingsforsøk. Ny sikker innlogging med vanlig konto lyktes; ingen passord-/konto-/miljøendring var nødvendig. Preview er ikke et miljø for skrivetester mot kundedata.

På kandidat `2f2ee38b` reagerer Åpne salgsgrunnlag, men innholdet er fortsatt usynlig: eksisterende `:has()`-regel har høyere CSS-spesifisitet enn den nye prosjektregelen. Korrigert prosjektregelen og lagt til faktisk CSS-kaskadetest i eksisterende nettleserpakke, med ordinær Sales fortsatt skjult og prosjektets dokumentinngang synlig for overview/case/editor.

CI43080943501 feilet i `project-workspace-browser-check.mjs` før nettlesertesten startet: kildeuttrekkets sluttmarkør forventet den gamle eksakte overview-betingelsen. Den nye read-only-betingelsen flyttet ikke StatusDialog, men gjorde markøren ugyldig. Uttrekket bruker nå neste panels stabile startgrense; eksisterende assertions er beholdt. Ny CI/nettleserkontroll gjenstår etter korrigeringen. Øvrige åtte pakker i kjøringen bestod. Full lokal build bestod også med CSS-rettelsen.

## Fullapp-integrasjon og sandbox-installering (erstatter WIP-statusen over)

Fullapp-oppstart er nå koblet til alle index-installatører. Kundens identitet vises via Auth-fasade; aktørens token er uendret. Supportkladder/IndexedDB/storage-events er isolert, også Sales lokale bruker-ID-er. Ny inngang på Systemadmin-brukerkortet er serverstyrt og skjult frem til aktivering. Banner/utløp og eksplisitt avslutning er implementert. Dokumentfaner kan arve innloggingsbundet supportøkt via et kortvarig fragment; det skrives ikke i lagrede dokumentlenker.

Storage bruker originale policyuttrykk etter request-lokal oppsett; nye filer tillates, endring/sletting sperres. Bolig-kontraktfiler sender verifisert supportkontekst til eksisterende RPC-er. Andre Edge-endepunkter er sperret. Realtime i prosjektchat bruker ikke aktørens rettigheter i support; eksisterende REST-polling beholdes. Net-køskriving er sperret i support, uten å endre ordinær levering.

Lokalt: SQL 67 PASS, runtime 45 PASS, Auth-fasade og cache/IndexedDB/storage-events PASS, kontraktfiler 25 PASS. Full build med critical checks bestod både standard og EXPO_BACKEND_TARGET=sandbox. Dette er ennå ikke en innlogget fullapp-prøve.

CI43083060216: prosjektets workspace/CSS-test bestod (202 krav), men checklist-panel-fixturen manglet den nye endProjectSupportProjection-avhengigheten. Den er lagt til med egne assertions for null opprydding ved vanlig navigasjon og én ved legacy-supportavslutning; eksisterende assertions beholdes. Ny CI kreves.

Sandbox ppvircenkjizeiqdxphj: migrasjoner installert via API. Lokale 20261111182756 / 20261111183233 / 20261111190543 tilsvarer remote 20261111191918 / 20261111191930 / 20261111192002. Den første Storage-installasjonen ble rullet tilbake ved kollisjon i API-ens sekundbaserte migrasjons-ID; fravær av snapshot-tabell ble bekreftet før ny installering. Verifisert: 220 write guards, 16 snapshots av sandboxens egne Storage-policyer, enabled=false og transport_ready=false. PostgREST-hook er ikke satt. Production er urørt. Ikke kjør samme migrasjoner igjen basert bare på lokale filversjoner.

Neste: full CI, egen Sandbox-Preview og kontrollert testaktivering med syntetisk bruker; faktisk HTTP/Storage/CORS, tilbud/bolig-lagring og full nettleserflyt. Ingen TEST OK eller fullført leveranse er registrert.

### CI og avgrenset kontrakt-PR

CI43086675561 bestod workspace, checklist-panel og checklist guidance, men common-frame-fixturen manglet samme nye oppryddingsavhengighet. Den har nå en assertion for hver navigasjonsvariant. Bolig core boundary avviste kontraktfiltilpasningen sammen med fullapp-endringene. Kontrollene er ikke endret: de tre Bolig-filene og egen regresjonstest er flyttet til separat PR320 fra ren main. Kontraktfiltesten har 28 krav; scopekontrollen har 55.

Innlogget standard-Preview beholdt Kenneths produksjonsøkt ved reload. Ny isolert QA-Preview: https://expo-proffdok-git-qa-support-full-app-20261111-ringside.vercel.app, branch qa/support-full-app-20261111 med branch-spesifikk EXPO_BACKEND_TARGET=sandbox. Første innloggingsforsøk brukte feil konto; brukeren bekreftet dette. Andre sikre innlogging lyktes som demo@expo-proffdok.no. Ingen passord eller Auth-konto er endret.

Transaksjonstest mot faktisk Sandbox med ROLLBACK: support for qa-firmaadmin@example.invalid returnerte riktig målidentitet, sales/store_offers og is_systemadmin=false samt arbeidsfirma Proffkunde Demo AS. Ingen varige data eller økter ble opprettet av testen. Neste kontrollerte steg er hook-registrering og testaktivering i Sandbox alene.

### Kontrollpunkt etter innlogget QA og lagringsrettelse

Denne statusen erstatter tidligere «hook ikke satt / disabled» for Sandbox alene. Produksjon og demo-branch er uendret. Sandbox-hook er installert (lokal 20261111193321 → remote 20261111193343), enabled=true og transport_ready=true. PR320 kontraktfil-adapter er deployet til Sandbox som Edge version 4. QA-Preview kjører 20aa0ded; vanlig Preview bruker fortsatt produksjonsbackend.

Innlogget nettleser: kundeidentitet qa-firmaadmin@example.invalid i Proffkunde Demo AS, Smartere søk, prisvisning etter kundens egne tillatelser (veiledende pris for denne testbrukeren), valg av vare uten sideskifte og lokal bestillingskladd. Ingen bestilling eller e-post sendt. Syntetisk tilbud F-2026-0042 / QA Supporttest 11.11 / QA Supportmodus – ikke send ble opprettet; audit har korrekt virkelig aktør og målbruker.

Tilbudsredigering ble AVVIST ved lagring: BEFORE-supportkontrollen så mellomtilstanden fra upsert før eksisterende saksbehandler-trigger gjenopprettet bindingen. Ny migrasjon 20261111194441 flytter INSERT/UPDATE-validering til AFTER, fortsatt atomisk rollback; DELETE/TRUNCATE beholder BEFORE-sperrer. Net-køens opprinnelige BEFORE-sperre beholdes, fordi køen eies av utvidelsen og alle supportskrivinger dit uansett er forbudt. Første installering rullet tilbake ved eierfeil på net-tabellen; avgrenset migrasjon er installert i Sandbox som remote 20261111195312.

SQL-regresjon: 71 PASS, inkludert canonical upsert, korrekt update-audit og rollback ved linjesletting. UI-slettesperre har lokale jsdom-kontroller for slett/arkiver, tillatt lagring/filter og React-rerender. Full CI for 20aa: øvrige pakker bestod, app-browser stoppet fordi admin-access-fixturen ikke kjente den nye app_support_available-lesingen; fixture håndterer nå false og krever at launcher er skjult. PR320 har grønn full CI43087870355. Ny CI kreves for dette kontrollpunktet.

Live-verifikasjon etter lagringsrettelsen er BLOKKERT: CUA får Emulation.setFocusEmulationEnabled timeout på eksisterende QA-fane 7, også etter dokumentert gjenoppretting. Fanene er fortsatt listet; dette er ikke påvist innloggingsfeil eller appfeil. Ingen UPDATE finnes ennå i serveraudit; redigering er derfor ikke bekreftet end-to-end.

Neste: gjenoppta fane 7 uten å miste tilbudskladden, lagre og endre syntetisk tilbud, bekreft server og reload, test Tilbake/Startside/Avslutt, Storage opplasting/lesing uten erstatning, Bolig med relevant testbruker og pris-/tilgangsgrenser. Publiser ny kandidat til QA-branch før UI-slettesperren kontrolleres. Ikke oppgi TEST OK/produksjonsklart før dette er bekreftet. Ingen hemmeligheter eller supportøkt-ID lagret her.

### Videre live-kontroll 20:11 UTC

Skynettleseren er tilgjengelig igjen. Sandbox-only oppfølging: 20261111200037 app_support_resume_same_target lar samme aktør/innlogging/mål fortsette samme økt uten å forlenge utløpet; andre mål krever fortsatt eksplisitt avslutning. Avslutt-knappen kan også avslutte aktørens økt etter at den lokale fane-ID-en er tapt. 20261111200339 app_support_empty_archive_fields retter andre lagringsårsak: hydrert archivedAt tom streng er ikke arkivering; ekte tidsstempel er fortsatt sperret. 75 SQL-kontroller bestått.

F-2026-0042 ble nå lagret fra nettleseren, endret fra 1 til 2 ×125 inkl.mva., og server viser quantity=2, total=200 eks.mva. Reload gjenopprettet samme kundekontekst og tilbud med 250 inkl.mva. PNG testbilde og PDF testvedlegg er lagret; PDF ble lastet opp via faktisk Storage HTTP/CORS til company-path, åpnet fra support i ny fane og innholdet visuelt bekreftet. Ingen publisering, ordre eller e-post. Fjern bilde/vedlegg og Arkiver/Slett er deaktivert i UI.

CI43091764726 kom videre forbi admin-access, men avdekket at importert support-bootstrap leste localStorage uten feilfangst i en isolert opaque-origin-visning. Oppstart behandler nå nektet lagring uten å bryte ordinær app; linked support failer lukket. Full lokal build bestod etter rettelsen. Retur fra Avslutt fikk korrekt egen identitet/logo, men tab=systemadmin ble ignorert av appens eksisterende innlasting; egen supportExit-markør venter nå på godkjent systemadmin-profil før tab velges. Ny CI og live-test på neste kandidat gjenstår.

### Avsluttende kontrollrunde

Nye remote-versjoner: resume_same_target 20261111200111; empty_archive_fields 20261111200404; file_and_consent_fences 20261111201546. Åtte migrasjoner totalt, bare sandbox. Native Bolig-RPC med aktiv supportøkt for demo.ansatt1 returnerte manager, system_admin=false. create_plan opprettet syntetisk enebolig; unit endret nummer til QA-02; archive ble avvist av supporttrigger. Alt i samme transaksjon, ROLLBACK utført. Nettleseren viste brukerens faktiske ikke-godkjente vilkår; ingen aksept utført.

Privat test-PDF ble faktisk lastet opp i project-documents-private under korrekt company/sales-path og visuelt åpnet. Storage-objektet har faktisk aktør som Storage owner_id (tjenestens uendrede Auth-token); original kundepolicy bruker firmapath. Både kundeidentitet, claims og SQL-audit er mål-/aktørseparert. Dette endrer ikke policysemantikken for andre bøtter.

Siste avgrensning: innebygde imageDataUrl/imageUrl kan ikke tømmes/erstattes i support; user_terms_acceptance skriving sperres. SQL-suite har 78 PASS. Native admin-route er admin, ikke systemadmin; returmarkøren bruker nå riktig route og users-område med profilgate, kontrollert i ekstraktert faktisk main-effekt. Ny kandidat må verifiseres i nettleser før TEST OK etterspørres.

## Kontrollpunkt 12.11.2026 – offentlig portal og branchkontroll

PR322 på release/support-verified-20261111 er aktiv leveranse. PR319 og qa/support-full-app-20261111 beholdes som eldre be48b797-grunnlag; de skal ikke merges i tillegg. Kenneth har gitt TEST OK for be48b797 sammen med companion PR320 007364a4. Dette erstatter eldre formuleringer om manglende TEST OK for den kandidaten.

Reprodusert i faktisk sandbox: beboerlenke til syntetisk bolig 24 viste «permission denied for function app_support_prepare_request». Samme feil var observert før innlogging ved FDV-register. Offentlig inngang manglet EXECUTE for anon, selv om hook er global.

Avgrenset rettelse: ny invoker-wrapper returnerer uten supportheader; med header kreves authenticated og eksisterende privat kontroll. Local migration 20261112230911 installert kun i sandbox ppvircenkjizeiqdxphj som remote 20261112230959. Ingen endring av innstillinger, mottakere eller produksjon.

Verifisert: 91 reelle SQL-assertions (78 eksisterende +13 nye), runtime 45, Auth/retur, cache/UX og critical-support/mail 55 PASS. Cachetesten krevde eksplisitt lokalt jsdom-bibliotek etter første manglende-pakke-feil; den bestod etter riktig testmiljø. Faktisk tidligere avvist beboerlenke ble lastet på nytt i skynett og åpnet korrekt bolig 24 med Mine valg, Avtaler, Dokumenter og Meldinger. Ingen avtale akseptert, ingen melding sendt. Sikkerhetsrådgiveren viser samme seks kategorier/nivåer som før; dette er ikke en attest på at eldre advarsler er løst.

Gjenstår: ny GitHub-kontroll for rettet supportcommit, samlet support/PR320-prøve og vurdering av endret kandidat før produksjonssetting. Historisk grønn kjøring for PR320 erstatter ikke siste ventende kjøring. Feilrettelsen er et tillegg til tidligere TEST OK-grunnlag; ingen automatisk produksjonsmerge. Eksisterende produksjonsplan skal bruke denne niende migrasjonen før hook-registrering.
