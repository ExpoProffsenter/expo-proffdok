# Handoff – Orvei, butikkflyt og reviderte boligvideoer
Dato: 14.11.2026. Systemeier: Kenneth Skogsrud.

## Start her
Les AGENTS.md, PROJECT_GUARDRAILS.md, CURRENT_RELEASE_STATUS.md og denne filen. Bekreft fersk main, demo, PR-status og faktisk publisert versjon før endringer. Brukeren ber om handoff til ny chat for å fullføre avtalte videoer, og har nå pekt på mangler i butikkvisningen. Rett og test butikkflyten før nye opptak. Denne overleveringen endrer ikke app, database, tilgang eller e-post.

## Bekreftet baseline
- Repo: ExpoProffsenter/expo-proffdok.
- Produksjon: https://expo-proffdok.app.
- Main: 93e948775ff327534d297e24df8f15e181c57ca6 (PR339 dokumentasjon, app fra PR338 / 2385a144d6628ea2f8db791f295b99766e1e9c5a).
- Produksjonsdeployment: dpl_CE8fPNTz89VvLMY7hSEtPArU9Fm5, READY.
- Demo: 804419397b52e5ae166c0cc38ec1a403496fd5f1, dpl_7L36FDeBqzRCctDGoiF5AEdgsLxt, READY.
- Demo-URL: https://expo-proffdok-git-demo-ringside.vercel.app.
- Produksjonsdatabase: dqffxflaoyarbxyiyhop. Sandbox: ppvircenkjizeiqdxphj.
- Orvei firma: a937c278-566d-4bae-bb92-32dca76b63ee.
- Aamodthagen prosjekt: 75db29b1-db64-4b88-89f7-348a08da02f8.
- Verifisert sist: PR338 full CI43631861468, PostgreSQL 2035, React, mobil/desktop, førsteside 100 og boligveiledning 276 kontroller PASS. Første CI fant økt topphøyde; rettet uten å svekke testen. Sandbox-preflight 19/19 og kurs 5/5 PASS. Faktiske publiserte ressurser har riktig produksjons-/sandboxbinding.
- Ingen innlogget produksjons-UI-prøve i siste runde; UI testet med faktiske komponenter/CSS i Chromium. Ikke beskriv dette som en reell utsendingstest.

## Hva Orvei har fått og hva som gjenstår
Kenneth opplyser at e-posten til Orvei er sendt. Ikke send den på nytt. Meldingen sier at beboerliste og plan er lagt inn, at etasjeplassering må rettes, og at pakker, UE-/leverandørtilganger og sjekklister gjenstår. Orvei kan jobbe videre med oppsettet nå; ikke erklær beboerbestilling eller hele prosjektleveransen ferdig.
- 29 bygg, 126 boliger, 151 eiere, 1260 aktiviteter og 126 bestillingsfrister er importert (PR335).
- Etasjeplassering var ikke oppgitt i grunnlaget. Orvei må kontrollere/rette dette; ikke gjett.
- Grunnpakker og tilvalg skal være TOMME i produksjon. Siste kontroll: 0 pakker, 0 tilvalg, 126 aktive boliger.
- UE-/leverandørtilganger, sjekklister og senere prosjektoppsett skal avklares med Orvei.
- Kenneth har personlig butikktilgang i 30 dager; kontroller faktisk utløp før senere test.
- PR336: prosjektinfo redigerbar, lyse delvis transparente fasadebokser, prosjektvis opt-in for fristpåminnelser.
- PR338: Rediger prosjektinfo ved navnet og under Oppsett → Bygg og boliger, felles dialog med lokal kladd. Kun manager på aktivt prosjekt. Prisfri catalog_empty i bolig_overview. Ingen valg + tom katalog viser «Grunnpakke og tilvalg er ikke klargjort», ellers «Boligvalg ikke startet». Reelle lagrede valg/avvik bevares.

## Nytt, bekreftet UX-gap – gjør dette før videoopptak
Brukerens skjermbilde viser Min side → Mine boligprosjekter → Aamodthagen. Søket er «muraas», tre treff, men tidligere bolig 25 / annen kontakt er fortsatt valgt.

Faktisk nåværende oppførsel i src/modules/bolig/BoligMyCollaborations.jsx:
- Søket filtrerer alternativer på bolignummer, adresse og kontaktnavn.
- Søket bytter IKKE bolig automatisk. Velg ny bolig i nedtrekkslisten «Bolig». Ingen ut/inn nødvendig.
- Valgt bolig legges inn blant alternativene selv om den ikke matcher søket, for å bevare usendt kladd. Dette er bevisst, men forvirrende i bildet.
- Boligbytte remonterer ShopProposal og PackageChoices med bolig-ID som nøkkel. Butikkkladd er lagret per bruker/firma/prosjekt/bolig.

Bekreftet ved faktisk pg_get_functiondef i PRODUKSJON:
bolig_private.my_collaborations(uuid) returnerer bare id, number, contact_name og e.address per bolig. Den returnerer ikke telefon, e-post, bestillingsfrist eller fremdrift. Butikkvisningen har ikke et kontakt-/fremdriftskort. Backend håndhever frister, men en skjult fristsperre er ikke en synlig fristoversikt.

Ønsket forbedring:
1. Gjør bevisst boligbytte tydelig: «Bytt bolig» og/eller klikkbare søkeresultater med navn, adresse og bolignummer. Marker valgt bolig som ikke matcher søket. Ikke automatisk velg første treff; feil mål kan gi feil tilbud.
2. Vis et kompakt kort for valgt bolig over varer: full registrert adresse, bolignummer, hovedkontakt, telefon og e-post med tel/mailto. Vis eventuelle manglende data ærlig; ikke konstruer postnummer/sted eller rett ekte kontaktdata uten grunnlag. Avklar eksisterende eiermodell før eventuelle medeiere vises.
3. Vis relevant oppstart, gjeldende bestillingsfrist med klokkeslett/norsk tid, og kommende relevante aktiviteter. Ikke kall første aktivitet «arbeidsoppstart» hvis det egentlig er førbefaring eller grunnpakkemøte. Bruk eksisterende plan og fristberegning, inkludert prosjektets klokkeslett; ikke innfør en ny parallell fristregel.
4. Begrens nye lesefelt til boligprosjekter personen faktisk har personlig butikktilgang til. Behold ansattkravet i de tre godkjente firmaene, utløp/tilbakekalling og aktiv bruker. Ingen nytt Orvei-medlemskap, ingen endring av Representerer og ingen tilgang til andre firmaers kataloger/økonomi.
5. Test søk → bytte → tilbake, usendt varekladd, pågående bildeopplasting, uavklart publisering/retry, samme navn på flere beboere, flere prosjekter/firmaer, focus/dvale, utløpt/tilbakekalt tilgang, mobil/desktop, tom kontakt og manglende dato. Kontroller målbolig i forhåndsvisning og publisering.
6. Oppdater hjelp før opptak. Dette gapet er dokumentert, IKKE rettet i denne handoff-runden.

Relevante kilder:
- src/modules/bolig/BoligMyCollaborations.jsx
- src/modules/bolig/BoligShopProposal.jsx, boligShopCore.js, boligCollaborationClient.js
- src/modules/bolig/BoligPackageChoices.jsx
- supabase/migrations/20261113194437_bolig_partner_commerce.sql
- supabase/migrations/20261113235139_bolig_shop_proposals.sql
- supabase/migrations/20261114001703_bolig_shop_project_deadline.sql
- scripts/bolig-shop-staff-db-scenarios.mjs, bolig-shop-staff-react-check.mjs og relevante samarbeids-/butikkregresjoner.
Les gjeldende funksjonsdefinisjoner og alle senere migrasjoner før endring; ikke kjør gamle migrasjoner på nytt.

## Videoarbeidet som er avtalt
Den nye revisjonen er IKKE ferdig. Gjeldende publiserte Bolig A–Å er fortsatt v12:
- public/help-videos/bolig-a-til-aa-v12.mp4 og .vtt.
- Guide-ID bolig-a-til-aa i src/modules/help/videoGuides.json.
- 580 sekunder, 57 kapittelmarkører.
- Kildecommit d0ebe96ccd0717412a9c81d587fa52a0dbd93d25.
- SHA256 5f3b269e992ab4b45723366ffc2b2ecbb55c1dffb554cc4bdbc2f2cb5c44e183.
- Tidligere kildeaudit: bare 3 av 57 scener hadde eksplisitt pekerposisjon. Dette er historisk audit, ikke bevis for at ny film er laget.
- Redigerbare V12-kilder var hentet fra Library i tidligere arbeid. Finn eksisterende kildepakke ved navn/manifest hvis den ikke ligger i arbeidsområdet; ikke oppgi eller bruk en gjettet Library-ID.
- Les docs/qa/BOLIG_AA_REVISION_20261113.json (opptaksplan, ikke ferdig film), docs/qa/BOLIG_BATCH_VIDEO_20261113.md og src/modules/help/README.md. Eldre dokumenter som sier «ingen A–Å-film finnes» er historiske; manifestet viser publisert V12.

Behold godkjent PROFFDOK-VIDEO-1.0: faktiske appskjermer, korte norske tekster, samme font/utsnitt, tydelig animert musepeker og klikkmarkering. Ingen stemme eller betalt tjeneste er bestilt.
- Film nye scener på samme godkjente sandbox-kandidat, med syntetiske data og sammenhengende naturlig arbeidsflyt.
- Gjennomgående peker i alle relevante scener; markering må treffe reell synlig kontroll. Ikke gjenbruk gamle innebygde scenenumre; rendereren eier kapittelnummer.
- Ta med prosjektinfo/redigering, bygg/etasje/boligplassering, import/medeiere, grunnpakker med bilder og tilvalg, frister/lenker, butikktilgang via systemadmin/support, Min side, tydelig boligbytte/kontakt/fremdrift, manuell butikkvare uten katalogtilgang, varenummer/beboerpris/bilde/montering, forhåndsvisning/publisering og beboeraksept.
- Ta med riktig e-postpolicy fra PR337, videre plan/roller/UE/sjekklister/bestilling/mottak/overtakelse/sluttpakke etter opptaksplanen. Ikke vis produksjon som testprosjekt.
- Sandbox har reell utsendingssperre. Demonstrer dette ærlig; ikke påstå at en ekte e-post er mottatt.
- Ingen Orvei-personopplysninger, private portaladresser eller tokens i offentlige filmer.
- Oppdater berørte kortfilmer (Finn bolig, masseplan) hvis deres viste flyt er utdatert. Før separat dekningsliste for øvrige appfilmer; ikke kall hele appens videoer ajour basert på boligfilmen.
- Ny versjonert filsti, oppdatert manifest/hash/varighet/kapitler/VTT og tekstalternativ. Behold gamle filer/kilder som historikk.
- Se HELE ferdige filmen, sjekk alle klikk, lesetid, rekkefølge, tekst/nummerering og mobilavspilling. Test eksisterende native avspiller, søk, kapittelhopp, fullskjerm, feil/retry, retur med bevart kladd og ferske tilganger. Filmen skal ligge under relevante Hjelp-temaer, ikke som separat mellomside.
- Bruk scripts/help-video-browser-check.mjs og scripts/proffdok-video-coverage-check.mjs samt faktisk fil/hash/metadata-kontroll. Manus eller grønn build alene er ikke levert video.

## E-post og sikker videreføring
PR337 gjelder: manuell «Publiser nå» og dialog hele døgnet; dialog samles i to minutter. Datoplanlagte varsler fra kl.08 på valgt dato. Automatiske fristpåminnelser starter kl.08–18 Europe/Oslo og krever prosjektvis opt-in; Orvei har dem av. Ikke endre transportflagg eller enabled_since som sideeffekt.
Kenneth har tillatt egen e-post kenneth@ringside.no ved nødvendig test. Ingen andre ekte kunder/beboere/UE/leverandører er autorisert som testmottaker. Ikke send noe bare for å lage video.
Grunnpakke/tilvalg skal fortsatt stå tomt i Orvei-produksjon. Bruk sandbox til syntetisk utfylling og opptak. Ingen seed/reset av eksisterende demo uten uttrykkelig oppdrag.
Miljømål for apprettelsen er BEGGE, med egen featurebranch, relevant QA/Preview, avtalt produksjonsløp, verifisert commit og kontrollert main → demo. Aldri demo → main. Skill dokumentert funksjonstest fra reell e-postlevering.

## Konkret første oppgave i neste chat
Avstem baseline, rett butikkens boligbytte og lesbare kontakt-/frist-/fremdriftskort med uendret firmaskille. Test hele butikkreisen i sandbox. Fullfør godkjent release. Deretter oppdater opptaksplanen mot ferdig UI, hent V12-kildene og gjennomfør videoopptak/render/visuell kontroll/publisering. Ikke stopp etter et nytt manus eller en ny plan.
