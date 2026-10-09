## Kildeoppdateringsforslag – feature/Sandbox

Oppfølging og revisjon viser nyere sentrale tekstforslag og vurderte utkast som fortsatt må godkjennes. Sammenlign firmaets tekst med forslaget; velg bare feltene dere trenger. Ett felt markerer ikke hele forslaget som vurdert. **Jeg har vurdert hele tekstforslaget**, **Lagre utkast** og firmagodkjenning er separate handlinger. Gamle godkjente utgaver og ansattbekreftelser beholdes. Nettkilder kontrolleres manuelt. [Scope og QA](docs/kshms/SOURCE_UPDATES_20261009.md).

---

## Fristpåminnelser for avvik/RUH – feature/Sandbox

Oppgavelisten skiller passert frist, frist i dag og frist innen tre dager i norsk tid. Åpne avvik/RUH får styrte ukespåminnelser via eksisterende privat leveringskø når e-post senere aktiveres. Kø og leveringskontroll følger ansvarlig, frist og gjeldende tilgang; gamle perioder og reaktiverte køer spilles ikke av. Transport forblir deaktivert i Sandbox. [Scope og QA](docs/kshms/DEVIATION_REMINDERS_20261009.md).

---

# KS/HMS – versjonerte underskjema i Sandbox

Sjekklistesentral kan feste en eksakt publisert underskjemaversjon etter et punkt. Publisering lagrer rotpunkter, ferdig utføringsliste og komplett dependency-ID/hash/snapshot. Syklus, fremmed/arkivert mal og mer enn 100 ferdige punkter stoppes server-side. Eksisterende prosjekt- og selvstendige kontroller bruker samme utførelsesmodell; gamle publiserte utgaver omskrives ikke. Tom mal-PDF viser child-versjonene. [Scope/testbevis](docs/kshms/CHECKLIST_SUBFORMS_20261009.md), [kort prøve](docs/kshms/USER_TEST.md). Bare feature/Sandbox; Production er ikke godkjent.

---

# KS/HMS – egne rutine- og sjekkliste-PDF-er

Godkjente rutineutgaver og publiserte sjekklistemaler kan lastes ned. Lagrede prosjektkontroller har egen PDF med svar, bilder og eventuell fullføring. Utkast/maler og historikk merkes; tilgang og lagret innhold leses på nytt. Ingen automatisk deling eller egen ansattbekreftelse. [Omfang/testbevis](docs/kshms/DOCUMENT_PDF_20261008.md), [kort prøve](docs/kshms/USER_TEST.md). Samme feature/Sandbox; Production er ikke godkjent.

---

# KS/HMS – kompakt prosjektoversikt

Avvik/SJA/RUH starter med lukkede SJA-, RUH-, kontroll- og risikogrupper med antall/status. Sjekkpunkt- og prosjektavvik vises som lukkede rader med åpne saker først. Eksisterende redigering og oppfølging består. [Omfang og tester](docs/kshms/PROJECT_OVERVIEW_20261008.md), [kort brukerprøve](docs/kshms/USER_TEST.md). Samme feature/Sandbox før Production-godkjenning.

---

# KS/HMS – kontroll-/risiko-PDF i Sandbox

Lagrede vernerunder/kontroller og 5×5-risikovurderinger har **Last ned PDF**, med firmaprofil, lagrede bilder, farget matrise, tiltak og lagret fullføringsinformasjon. Utkast merkes under arbeid; ulagret tekst må lagres først. Prosjektets **Velg KS/HMS til rapport** inkluderer nå uttrykkelig valgte kontroller og risiko sammen med SJA/RUH. Ingen dokumenter tas automatisk med eller legges i portal. Ny lesende Sandbox-RPC; Production er uendret. [Omfang og testbevis](docs/kshms/EXECUTION_PDF_20261008.md), [gjeldende planstatus](docs/kshms/OVERSIKT.md).
---

# Expo ProffDok

KS/HMS har prosjektkoblede SJA-er og RUH-er. I Rapport/PDF/utskrift velger brukere med modultilgang hvilke dokumenter som skal følge rapporten. SJA viser lagret rutinehenvisning, deltakere og prosjektleders signatur; RUH viser tiltak, ansvarlig, status og eventuell dokumentert lukking. Utkast og åpne saker merkes tydelig. Rapportvalget tømmes helt ved prosjekt-, firma-, bruker- eller rollebytte. Samme feature/Sandbox Preview, før produksjonsgodkjenning. [Rapportomfang og testbevis](docs/kshms/PROJECT_REPORT_20261008.md). Tidligere TEST OK for SJA-utkast/RUH-oppfølging består.

Preview 07.10.2026: Retur fra generell ordre bevarer Reacts gjeldende menynavn, slik at Startsiden fortsatt bruker den kompakte Meny-knappen. Den faktiske returfeilen er gjenskapt og har fast runtime-regresjonsvern samt en React-prøve med appens menyadaptere. Se [menyprøven](docs/kshms/MENU_RETURN_20261007.md). KS/HMS er fortsatt kun feature/Preview.

Expo ProffDok er en produksjonsapp for håndverks- og prosjektbedrifter. Løsningen støtter prosjektstyring, dokumentasjon, sjekklister, bilder, avvik, kunde-/UE-portal, garanti, befaring, Badskisse, ordinære tilbud, Generelt tilbud, digital aksept, kontrakt og rapport/PDF.

Produksjon: https://expo-proffdok.app

**Produksjonsbaseline:** kontrollert 2026-10-05: `main` er `155f6c4`, Vercel Production er READY på samme SHA. Godkjent PR #214 gir firmakunder og mva.-visning, og tidligere Cordel-/prosjekt-/tilbudsfunksjoner er bevart. KS/HMS trinn A er fortsatt feature/Preview og ikke produksjonsgodkjent. Se [gjeldende release-status](CURRENT_RELEASE_STATUS.md).

## Cordel-eksport

Cordel-eksporten finnes ved aksepterte/aktiverte tilbud, prosjektets kontraktkort og plukklister. Tilbud lastes ned som én ZIP med jobbliste og AFG-spesifikasjon, og leses direkte inn i en tom Cordel-ordre. AFG alene brukes uten jobbliste; ved jobbliste brukes begge importer med jobbliste først. Faste filnavn i `P:\Expo ProffDok` gjør at importdefinisjoner kan gjenbrukes. A–Å-veiledningen ligger under **Hjelp → Eksport av tilbud til Cordel**. Se [Cordel-modulen](src/modules/cordel/README.md) for kildegrunnlag, validering og pris-/kostbegrensninger.

## Teknologi

- React / Vite
- Supabase Postgres, Auth, Storage, RLS og RPC
- Supabase Edge Functions
- Resend
- Vercel
- jsPDF / pdf-lib
- GitHub

## Repository – hovedstruktur

```text
src/
├── main.jsx                 # sentral app-orkestrering
├── bootstrap.jsx
└── modules/                 # app, access, sales, storeCatalog, project, progress, portal, help, report m.fl.

docs/
└── architecture/            # gjeldende arkitekturkart og fasespesifikke sikkerhetsnotater

scripts/
├── critical-pr-scope-guard.mjs
├── critical-build-check.mjs
├── critical-systemadmin-broadcast-email-check.mjs
├── critical-sales-recovery-check.mjs
├── critical-sales-tab-resume-check.mjs
├── critical-sales-entry-resume-check.mjs
├── critical-sales-server-hydration-check.mjs
├── critical-sales-lazy-loading-check.mjs
├── critical-work-profile-check.mjs
├── critical-project-navigation-check.mjs
└── øvrige målrettede guards
```

Detaljert nå-arkitektur: [docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md)

Sales-domene: [src/modules/sales/README.md](src/modules/sales/README.md)

Internt vareregister / Fase 39B: [docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md)

Plukklister på PC/mobil og tilbudsskanning: [docs/architecture/MOBILE_PICKLIST_AND_GENERAL_OFFER_SCAN.md](docs/architecture/MOBILE_PICKLIST_AND_GENERAL_OFFER_SCAN.md)

## Kritisk produksjonsarkitektur

- Sales-oversikten bruker lett summary/lazy loading; komplett sak hentes først når brukeren åpner den.
- Komplett valgt Sales-sak skal være server-hydrert før editor/autosave aktiveres.
- Ny forespørsel og nytt tilbud skal tåle PC-fanebytte og mobil appbytte også før saken har fått `request_ref`.
- Bevisst brukerhandling vinner alltid over automatisk recovery. Bare den faktiske Befaring/Tilbud-arbeidsflaten kan armere Sales-recovery; gjenbrukte kontraktkomponenter i Prosjekt skal ikke trekke brukeren tilbake til Sales etter fanebytte eller oppfriskning.
- Systemadmins ordinære prosjektarbeidsflate følger valgt **Representerer**-firma; brede supportrettigheter skal ikke blande firma i vanlig prosjektliste.
- Nye prosjektrader får `company_scope_id` fra aktiv arbeidsprofil i en server-side `BEFORE`-trigger før RLS validerer innsettingen.
- Nye rader i garantiregisteret arver prosjektets `company_scope_id` i en server-side `BEFORE`-trigger, og en separat trigger avviser garanti når signert kontrakt ikke finnes i Avtalegrunnlag. Migrasjonen er idempotent og gjenoppretter samme vern i Sandbox-baselines som mangler triggerne.
- Låsing og opplåsing av prosjekt går gjennom `set_project_lock`, som kontrollerer prosjekt-/firmatilgang og oppdaterer både radens låsekolonner og speilet i `projects.data` atomisk. En idempotent parity-migrasjon gjenoppretter samme Production-RPC i eldre Sandbox-baselines.
- Prosjektets sky-autolagring sammenligner normalisert data og tittel med serverraden før `PATCH`; ren gjenåpning eller oppfriskning skal ikke flytte `updated_at`. Etter en reell, bekreftet sky-lagring nullstilles «ulagret»-flagget bare når samme snapshot fortsatt er gjeldende, slik at unødige navigasjonspopuper fjernes uten å kunne skjule nyere endringer.
- Desktop prosjektarbeidsflate bruker kollapset meny med få native hurtigvalg; full funksjonsliste ligger fortsatt i Meny.
- Prissøk på mobil har `← Startside`, som avslutter aktivt Prissøk og rydder resume-markøren uten reload. `Skann strekkode` lastes ved behov, foretrekker bakre kamera og setter EAN/GTIN i det eksisterende read-only RPC-søket. Kamerasporet stoppes ved treff, avbrudd, navigasjon og bakgrunning; kamera/bilde lagres eller lastes ikke opp. Manuell EAN-inntasting fungerer hvis kameratilgang mangler. Kameraskanning finnes bare på mobil.
- Interne brukere kan opprette og redigere plukklister med antall og valgfritt Cordel-ordrenummer på både PC og mobil. Inntil tre lister per bruker med maks 30 ulike varer lagres uten priser eller kameradata. **Skriv ut plukkliste** viser antall/ordrenummer uten priser; PC har i tillegg **Skriv ut priser**, med eksplisitt valg av interne priser for brukere med egen rettighet. Cordel-registreringen er fortsatt manuell. Mobilskanning i Generelt tilbud fyller søket i aktuell post eller opsjon; brukeren velger selv varen før tilbudskladden oppdateres. Tilgang og prisfelter kontrolleres fortsatt på serveren.
- Tilbudsrecovery skiller mellom lokal sikkerhetskopi og aktiv kladd. Et valg knyttes til sikkerhetskopiens stabile revisjon, slik at senere autolagring av aktiv kladd ikke viser samme valg om igjen. Valgt kladd bevares også når en separat serverkonflikt må håndteres, og varig autolagring forsøkes på nytt etter recovery-overgangen.
- Ordinært akseptert tilbud kan gå videre til prosjekt uten kontrakt, egen opplastet kontrakt eller Expo-kontrakt. Hvis Expo-kontrakt ikke ble opprettet før prosjektaktivering, kan samme låste aksept og kontraktmotor åpnes direkte fra prosjektets **Avtalegrunnlag** uten retur til Sales. Åpning av en allerede synkronisert sluttkontrakt er ren lesing og skal ikke berøre prosjektets endringstidspunkt. Kontrakt er valgfri med mindre garanti-/avtalegrunnlaget krever den.

## Fase 45B – Proff, Generelt tilbud og Enkel ordre

- Tilgang til Expo ProffDok forutsetter at virksomheten kjøper og benytter SoPro-produkter i relevant omfang, slik gjeldende brukervilkår beskriver.
- Kun Systemadministrator kan aktivere Proff-vareregisteret for et eksternt firma, styre leverandører/rabatter og slå på **Generelle tilbud** for firmaet. Tilgangen gjelder automatisk alle nåværende og nye brukere i firmaet. **Enkel ordre** velges først etter at kunden har akseptert tilbudet.
- Ekstern proffkunde søker bare i godkjente leverandører. Ringsides interne innkjøps-/nto-pris, innkjøpsrabatt, DG og påslag skal aldri eksponeres.
- «Din nto pris» er en egen bruker- og firmascopet rettighet. Firmaadmin kan administrere egne brukere, men kan ikke gi rettigheten til seg selv. Intern Ringside-nto krever fortsatt eksplisitt `view_internal_net_prices`.
- Den synlige betegnelsen er **Generelt tilbud**. Teknisk legacy-identitet beholdes der det er nødvendig, og historiske Butikktilbud skal fortsatt åpnes og fungere.
- Brukervilkårstatus, firmaets Proff-status og brukerens modultilgang er separate forhold. Manglende aksept av ny vilkårsversjon skal vises separat og skal ikke feilaktig presenteres som årsak til at Systemadmin ikke kan tildele modulen.
- Etter aksept av et Generelt tilbud kan firmaet velge **Enkel ordre** eller ordinært prosjekt. Akseptert versjon og valgte alternativer er låst bestillingsgrunnlag.
- Enkel ordre bruker en lett prosjektmotor med produkter, bilder, relevante sjekklister, UE og sluttdokumentasjon. Fremdriftsplan og FDV er valgfrie. Kundeportal er blokkert.
- Kundepreview åpnes separat og er read-only. Den skal ikke publisere, sende e-post eller kunne akseptere tilbudet.
- Tilbudsmaler kan gjenbruke varige app-/Storage-bilder på poster og opsjoner. Midlertidige nettleserbilder og kundespesifikke PDF-vedlegg følger ikke malen.
- Kontrakt-PDF holder sammenhengende avsnitt samlet og bryter opsjonskort kontrollert uten å skille beskrivelse fra pris.
- Sluttflyten er overtagelse/signering → garantiutstedelse → komplett PDF → låsing. PDF-en skal bruke samme effektive garantivilkårstatus som appen, vise faktisk genereringstidspunkt og bevare autentisert aktør på automatisk arkivert kontrakt og nye Fag/utstyr-poster.
- «Fullfør overtagelse og lås prosjekt» er i seg selv en eksplisitt låsehandling. Etter eventuelt valg om kundeutsendelse skal appen ikke vise en ekstra identisk låsebekreftelse.

## Systemadmin – felles e-post

- Systemadministrator velger mottakergruppe og klassifiserer hver utsending som **Driftsmelding** eller **Nyheter og markedsføring**.
- Mottakerlisten løses i Edge Function og eksponeres ikke samlet i nettleseren. Hver mottaker får en separat e-post.
- Markedsføring går bare til brukere med aktivt, frivillig samtykke. Samtykket kan endres under Innlogging og brukerprofil, og hver markedsførings-e-post har personlig avmelding.
- Før reell sending må mottakertallet kontrolleres og en test sendes til innlogget systemadministrator.
- Avsendernavnet er Expo Proffsenter og Expo Proffsenter-logoen ligger i e-postmalen. Visning som profil-/avatarlogo i mottakerens innboks styres av e-postleverandøren og kan ikke garanteres av appen.

## Permanent Demo Sandbox

Expo ProffDok har et separat, langlivet demomiljø for presentasjon og opplæring:

- branch: `demo`
- fast host: `https://expo-proffdok-git-demo-ringside.vercel.app`
- separat Sandbox-Supabase: `ppvircenkjizeiqdxphj`
- egen Auth, database, Storage, Golden/reset og fiktive/sanitiserte demodata
- `demo` skal **aldri merges til `main`**
- ordinær appkode synkroniseres kontrollert **main → demo** etter godkjent Production-verifisering når endringen også skal finnes i demo
- demo-overlay, demodata, syntetiske ressurser og sandbox-konfigurasjon skal aldri flyte **demo → main**
- demo-builden skal feile dersom Production-Supabase blir bundet inn i emitted JS

Fase 45B-hotfix-Preview bygges fra en ren `main`-basert branch mot isolert Sandbox-Supabase, men er ikke permanent Demo og skal ikke hente produktregler eller kode tilbake fra `demo`.

Sandboxen har egen demo-/kursmigrasjonslinje og skal aldri branch-merges til Production. Production-endringer skal komme fra versjonerte migrasjoner i en `main`-basert og godkjent release.

Detaljert demo-dokumentasjon ligger på `demo`-branchen.

## Utviklings- og mergepolicy

`main` er produksjonsbranch og kilde til sannhet.

Før kodeendring skal miljømål oppgis som:

- `Miljømål: PRODUKSJON/PREVIEW`
- `Miljømål: SANDBOX/DEMO`
- `Miljømål: BEGGE`

For brukerrettede produksjonsendringer:

1. Opprett feature-/hotfix-branch fra gjeldende `main`.
2. Kjør `npm run build` og relevante critical checks.
3. Test Vercel Preview på desktop og mobil der relevant.
4. Kontroller både ny funksjon og berørte eksisterende brukerreiser.
5. Ikke merge før eksplisitt `TEST OK`.
6. Etter merge: bekreft eksakt `main`-SHA, Vercel Production `READY`, HTTP/runtime og relevant Supabase-status.
7. Ved miljømål `BEGGE`: synkroniser deretter gjeldende `main` kontrollert inn i `demo` og kjør sandbox-preflight.

Når Fase 45B er merget og Production er trippelverifisert, ryddes midlertidige release-/feature-/backup-brancher. Sluttbildet skal være kun `main` og permanent `demo` i GitHub, og kun Production/default samt `demo-sandbox` i Supabase. Opprydding skal aldri skje før godkjent Production-QA.

`PR Core Safety` kjører på pull requests mot `main` og skal stoppe Demo/Test-PR-er som samtidig forsøker å endre beskyttet kjerne.

## Dokumentasjonsregel

Repositoryet skal kunne overtas av en kvalifisert utvikler uten tilgang til tidligere ChatGPT-samtaler.

- Endret arbeidsflyt, begreper, knapper, roller eller brukeropplevelse → oppdater HJELP i samme runde.
- Endret datamodell, modulansvar, Storage, RPC, RLS, sikkerhetsmodell eller større teknisk struktur → oppdater arkitekturkartet.
- Sales-endringer vurderes mot Sales README.
- Vareregister-/katalogendringer vurderes mot Fase 39B-arkitekturdokumentet.
- Arbeidsprofil/systemadmin-endringer vurderes mot `critical-work-profile-check.mjs` og arkitekturkartet.
- Viktige utsatte produktvalg registreres som GitHub issue.
- Root README skal være kort og fungere som inngangsdør, ikke duplisere detaljdokumentasjon.

Ikke skriv secrets, passord, service_role keys, ERP-prisfiler eller andre sensitive verdier i README eller docs.

## Kritiske sikkerhets- og kompatibilitetsregler

- RLS og serverkontroll er sikkerhetsgrensen; frontend alene er ikke nok.
- Ikke svekk company-scoping eller bruk systemadmin/supportmodus som write-bypass.
- Prosjekter åpnet på tvers av firma i eksplisitt Systemadmin-supportmodus er skrivebeskyttet. Salgsgrunnlag og Avtalegrunnlag tillater kontroll og åpning av eksisterende tilbud, akseptbevis, kontrakter og øvrige dokumenter, mens lagring, opplasting, fjerning, kopiering, låsing og andre endringer er blokkert. Supportoversikt går tilbake til samme firmas supportvisning uten å avslutte supportmodus.
- Aktiv arbeidsprofil/representert firma skal styre normal arbeidsflate.
- Publiserte og aksepterte tilbud er immutable historikk.
- Ingen historisk backfill uten eksplisitt beslutning.
- Bevar Sales recovery/hydration, lazy loading, regelen «brukerhandling vinner» og IndexedDB-/serverbevaring av befaringsbilder og Badskisse.
- Summary-data skal aldri skrives tilbake som komplett Sales-payload.
- Ikke endre Storage-policyer, offentlige/private filer eller historiske URL-er uten egen migreringsplan.
- Privatkundepriser vises inkl. mva.
- Intern ERP-nettopris skal aldri lekke til kundelenke, tilbuds-PDF eller publisert Sales-historikk.
- Historiske Butikktilbud beholder tidligere avslutning og skal ikke endres. Nye Generelle tilbud kan etter aksept aktiveres som Enkel ordre eller ordinært prosjekt.
- Aksept-/avvisningsvarsler skal være sekundære sideutfall: en e-postfeil skal aldri reversere kundens allerede lagrede beslutning.
- `main.jsx` og store Core-filer skal bare splittes når det gir reell vedlikeholdsgevinst.

## Start her som ny utvikler

1. Les `AGENTS.md` og `PROJECT_GUARDRAILS.md`.
2. Les [arkitekturkartet](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md).
3. Les [Sales README](src/modules/sales/README.md) før endringer i befaring/tilbud/aksept/kontrakt/Generelt tilbud/recovery/lazy loading.
4. Les [Fase 39B](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md) før endringer i vareregister, ERP-import eller katalogtilgang.
5. Les relevante HJELP-moduler før brukerrettede endringer.
6. Kontroller åpne GitHub issues, åpne PR-er og siste legitime `main`-SHA.
7. Kontroller Production og Supabase-status før større arbeid.
8. Endre minst mulig per runde og beskytt produksjon foran alt.


### Cordel: importvalg og brukertilgang (05.10.2026)

Samme eksport beholdes for våtromstilbud og generelle tilbud. AFG kan importeres alene uten jobbliste, med ønsket ordremetode. Ved bruk av jobbliste må jobblistefilen importeres først, med tilsvarende jobblisteoppsett i Cordel, deretter AFG uten sletting. 0 % materiellpåslag og øreavrunding kreves for å beholde akseptert pris også ved AFG alene. Den bekreftede Cordel-testen gjelder den kombinerte flyten; AFG alene med andre metoder må kontrolleres hos mottaker. Prisposter er fortsatt Rundsum; faktisk timebudsjett og kildekost følger ikke med.

Systemadmin → bruker → **Eksport til Cordel** styrer tilbudseksport, plukklisteeksport og det spesifikke Hjelp-temaet samlet. Godkjent, aktiv Systemadmin har automatisk tilgang; andre brukere må få den eksplisitt. Firmaadmin kan ikke tildele den. Grantet bindes til brukerens firma; firmabytte krever ny tildeling. Eksisterende datatilgang og pristilganger gjelder i tillegg. `cordel_export_user_access` er RLS-beskyttet uten direkte klientrettigheter; avgrensede RPC-er leser egen tilgang og lar kun Systemadmin administrere. UI feiler lukket og sjekker tilgang på nytt før nedlasting.

## Firmaets kunder og prisvisning i tilbud

Kundeinformasjon kan frivillig lagres i firmaets kunderegister fra prosjekt eller forespørsel/tilbud. Velg **Lagre i firmaets kunderegister** og deretter **Lagre kunde**; engangskunder trenger ikke lagres. Søk og velg faste kunder for å fylle kundedata på nytt. Kontroller prosjektadressen. Registeret er låst til innlogget arbeidsfirma på serveren.

Begge tilbudstyper starter inkl. mva. **Vis priser eks. mva.** velges per tilbud i editoren og følger kundepreview, publisert kundelenke, akseptvisning og tilbuds-PDF. Valget fryses i tilbudsversjonen; eks. mva. er prisvisning, ikke avgiftsfritak. Mva. og total inkl. mva. vises ved totalsummen. Gamle versjoner uten flagget beholder inkl. mva.

I Generelt tilbud velges prisvisningen i den aktive grupperte tilbudsbyggeren under «Prisvisning til kunden». Forhåndsvisning og editorens grunnsum følger valget.

Kunderegisteret har nedtrekksmeny og søk på navn/e-post i egen ramme. Frivillig kundelagring ligger nederst i kunde-/tilbudsskjemaet, før Opprett tilbud, med avkrysning av som standard og egen Lagre kunde-knapp. Eks. mva. brukes vanligvis for bedriftskunder.
# KS/HMS – håndbokfundament i Preview/Sandbox

KS/HMS videreutvikler eksisterende ProffDok. [Plan og faktisk gap-analyse](docs/kshms/PLAN.md), [full kapittel-/rutinedekning](docs/kshms/COVERAGE.md) og [QA-status](docs/kshms/QA.md) beskriver hele minimumsomfanget. Trinn A gir firmaktivering, firmabundet ansattilgang, flerfaglig oppstart, 73 selvstendige tilpasningsutkast, blank/kopi, kapitler, kladd/godkjent versjon, ansattbekreftelse og signert årlig revisjon. Det er ikke et komplett KS/HMS-system; utførelse/SJA/risiko, samlet firmavvik, varsler/PDF og begrenset personal/stoffkartotek gjenstår i registrerte trinn.

I håndboken kan flere standardrutiner hukes av samtidig. Kortene viser «Valgt», og «Disse rutinene legges inn» viser hele utvalget før **Legg inn** lagrer hver rutine som en firmakladd. «Utkast – må godkjennes» og **Rediger her** viser hvor den enkelte rutinen tilpasses. Godkjente utgaver viser «Godkjent vN». Firmaets rutiner er hovedlisten; forslag ligger under **Legg til flere rutiner**. «Anbefalte» og «Alle forslag» deler samme utvalg. Allerede aktive rutiner beholdes ved ny innlegging; eksisterende tilpasninger overskrives ikke. Firmaadmin eller KS/HMS-ansvarlig godkjenner publisering separat. De 73 forslagene dekker temaene i begge håndbøkene, også personal/HR og VVS. Kapittelvalg og søk bevarer avkrysninger. Firmaets utgaver og bekreftelser endres ikke automatisk.

Systemadmin aktiverer firmaets modul, firmaadmin styrer ansattes tilgang; firmaadmin og KS/HMS-ansvarlig kan publisere, og utpekt KS/HMS-ansvarlig signerer revisjon. Firmaadmin kan velge seg selv som ansvarlig uten et ekstra grant; signering krever fortsatt eksplisitt utpeking i oppstart. De tre oppstartsfeltene får redigerbare fagtilpassede tekstforslag; lagret eller egen tekst beholdes. Fagvalget heter VVS. Samme arbeidsfirma ved faneretur beholder visning og ulagrede felt, i tråd med eksisterende Sales-kontroll for arbeidsprofil. Alle API-operasjoner kontrollerer aktivt firma og rolle. Ingen pris-/betalingsintegrasjon innføres. Production er ikke endret, og ny TEST OK kreves før merge. Preview-branchen må ha eksplisitt `EXPO_BACKEND_TARGET=sandbox`.

Alle KS/HMS-faner forklarer hva brukeren gjør der og hva som kommer etterpå. Utkast, versjon og revisjon forklares med korte setninger; rutinefeltene har konkrete skrivehjelper. Grensesnittet bruker **Lagre utkast**, **Les forslag** og **Alle forslag**. [Brukertestlisten](docs/kshms/USER_TEST.md) gir handling og forventet resultat. Den faste branch-Preview-adressen oppdateres ved nye deployer; samme nettleser/adresse skal normalt beholde aktiv innlogging. Tekstendringen innfører ingen ny innlogging eller endring i auth-/firmascope.

**Åpne godkjenning** viser og fokuserer riktig rutine; dette publiserer ikke. Firmaadmin eller KS/HMS-ansvarlig leser teksten og fyller ut **Hva er vurdert eller endret?** før **Godkjenn og publiser** blir aktiv. Etter bekreftet lagring åpnes neste rutine som trenger godkjenning, med tomt vurderingsfelt. Antall faktisk godkjente rutiner vises. Etter siste godkjenning forsvinner godkjenningspanelet, og **Håndboken er klar** med **Neste: Ansattes gjennomgang** vises både øverst og nederst. Siden fokuserer kortet nederst; knappen åpner oppfølgingen. Allerede fullførte håndbøker får også knappen nederst. En grå publiseringsknapp betyr at vurderingen mangler, ikke at rutinen er godkjent. Gjentatt åpning av samme rutine beholder vurderingsteksten. Manglende vurdering og serverfeil vises ved godkjenningen; en feil går ikke videre.

Ansatte åpner KS/HMS direkte i **Les og bekreft**, med antall rutiner som gjenstår og egen versjons-/bekreftelsesstatus. Etter lagret egen bekreftelse åpnes neste tildelte utgave som krever bekreftelse, med avkrysningen avslått. Hver utgave må leses og bekreftes separat. Etter den siste vises **Du er ferdig med gjennomgangen** nederst. En feil beholder den åpne teksten og avkrysningen. Tidligere identitet, tidspunkt og eksakt utgave beholdes. De får ikke verktøy for oppstart, tilganger, utkast, godkjenning eller oppfølging av andre ansatte.

**Oppfølging og revisjon** viser én sammenfoldet rad per medarbeider med bekreftet-antall og hva som gjenstår. Fire medarbeidere med ti rutiner hver gir fire rader og 40 bekreftelser. Åpne en rad for eksakte utgaver og tidspunkter; **Søk etter medarbeider** avgrenser listen. **Gi godkjente rutiner til nye medarbeidere** viser bare utgaver noen faktisk mangler. Revisjonsdatoen er synlig, mens **Gjennomfør revisjon** åpner det eksisterende skjemaet. Neste steg etter publisering er ansattes gjennomgang; en ny revisjon er ikke nødvendig bare for å gå videre.

**Min personalhåndbok** er et søkbart oppslagsverk over egne tildelte, publiserte rutiner for både medarbeidere og firmaadmin. Bekreftede utgaver blir liggende; tidligere tildelte utgaver har egen historikk. Hver utgave viser **Godkjent for firmaet av** og **Din egen gjennomgang**, med navn, tidspunkt og eksakt versjon. Godkjenneren er den faktiske firmaadminen eller KS/HMS-ansvarlige, ikke automatisk systemadmin. Egen gjennomgang er påkrevd etter firmaets arbeidsregel, også for firmaadmin og KS/HMS-ansvarlig. Ved publisering kan vedkommende huke av **Jeg bekrefter også egen gjennomgang av denne utgaven.** for å utføre den samtidig, eller bekrefte påkrevde utgaver etterpå i **Les og bekreft** før arbeidet starter. Da lagres firmagodkjenning og egen bekreftelse samlet; samme utgave trenger ingen andre egen bekreftelse. Valget er avslått for neste rutine, og andre ansatte bekrefter selv. Gamle godkjenninger omskrives ikke til bekreftelser. Felles HR-rutiner inngår i håndboken; individuelle medarbeidersamtaler og kompetansedokumenter følger senere separat personaltilgang.

Oppstarten begynner med **1. Velg KS/HMS-ansvarlig**. Firmaadmin velger blant alle aktive interne brukere i gjeldende firma. **Lagre og gå videre** gir ved behov den valgte medarbeideren eksisterende responsible-grant før oppstart lagres; deretter åpnes håndboken. De to kallene er ikke atomiske: ved feil etter grant vises at tilgang er gitt, mens oppstart må lagres på nytt. Verneombud og firmaets KS/HMS-ansvarlig er ulike roller; lenket offentlig veiledning og kontrolldato inngår i oppstarten. Ny redigering av en godkjent rutine vises som **Endringer må godkjennes · vN gjelder fortsatt**; lagring åpner godkjenningen av den lagrede teksten. Ulagret tekst stopper publisering/neste steg. Eksisterende fanereturløsning og versjons-/signeringsgrunnlag beholdes.

Oppdatering 2026-10-06: Tilgangsvalg for andre ansatte bruker eksisterende målrettet managed-access-hendelse og bevarer ulagret oppstart, rutineeditor og vurdering; egen/uavgrenset tilgangsendring og reelt firmabytte kontrolleres fortsatt. Oppstart og nye rutiner kan begynne med redigerbare tekstforslag. Skrivehjelp ligger utenfor rutineinnhold og signerte versjoner. Fire standardforslag har fått renset tekst, source_revision 2 og manuell vurdering; tidligere firmatekst overskrives ikke. Søk finnes i firmaets rutiner, ProffDoks forslag og ansattens tildelte publiserte utgaver. [Innholdsstatus for alle 125 kildereferanser](docs/kshms/CONTENT_STATUS.md) viser kobling fra alle innholdstemaer til de 73 egne forslagene og nødvendig firmatilpasning. [Planen](docs/kshms/PLAN.md) presiserer tilsynsuttrekk, samlet avvik med aktive ansvarlige og app-/e-postoppgaver, og senere avgrenset supportmodus. [Kapasitetsplanen](docs/kshms/CAPACITY.md) beskriver Supabase for 100 firmaer uten å hevde utført belastningstest.

## KS/HMS A2 – rutiner og Avvikssentral

A2 oppdatert 6. oktober 2026: Biblioteket har 73 egne forslag med sporbar dekning av alle 121 innholdstemaer + fire metadatarader fra kvalitetshåndboken (148 sider) og personalhåndboken (127 sider). Avvikssentral gir ansvarlig/frister, åpne/lukkede saker, tiltak/egen kontroll, private vedlegg og hendelseshistorikk. Bare valgt ansvarlig får fast varsel i interne faner og lukker selv. Prosjekt-/sjekkpunktavvik som kobles inn har serverbeskyttet status; ukoblet legacy-flyt består. 73 Sandbox-kontroller PASS med rollback; ingen ekte e-post eller produksjonsendring. Full-app-brukerprøve og e-postmottak gjenstår. Sandbox mangler RESEND_API_KEY og CHAT_FROM_EMAIL; utsending er derfor deaktivert. Gammel TEST OK for 6dfb74d dekker håndbokversjonen, ikke A2.

Melder velger en kvalifisert ansvarlig og frist. Ansvarlig dokumenterer årsak, utførte tiltak og egen kontroll og trykker **Kontroller og lukk avvik**. Først bekreftet command + fersk detail installerer lukket snapshot og oppdaterer oppgaven. En feil beholder felt/avkrysning og lokal kladd. **Lukkede** viser kontroll og historikk. [Brukersteg](docs/kshms/USER_TEST.md), [QA](docs/kshms/QA.md) og [e-postoppsett](docs/kshms/EMAIL_SETUP.md) beskriver det som er prøvd og det som gjenstår. SJA/risiko/utførelsesmaler, PDF/tilsynsuttrekk, individuell HR og stoffkartotek følger fortsatt planen.


## Prosjektsjekklister – popup og gjennomføringer i Preview

Generelle ordrer starter uten våtromsstandarder og tillater egne punkter uavhengig av KS/HMS. Publiserte firmamaler hentes ved aktiv firmamodul. Interne prosjektlister åpner i popup: Lagre viderefører pågående kontroll; Sjekkliste fullført lagrer et uforanderlig snapshot med identitet/tid; neste kontroll bevarer historikken. Serverens revisjonsvern og lokale kladder beskytter samtidige endringer. Dette er prøvd i Sandbox, ikke produksjonsgodkjent. Se docs/kshms/CONTINUITY.md, QA.md og USER_TEST.md.

Oppfølging 8. oktober 2026: Prosjektets Avvik/SJA/RUH har Opprett SJA og Registrer RUH bare ved personlig KS/HMS-tilgang. SJA/RUH har faktisk firmaprosjektvalg og fortsatt manuell ekstern referanse. Godkjente firmarutiner kan leses og velges med fast R-nummer og eksakt versjon. Forslag dekker mur, flis, tømrerarbeid og VVS. RUH bruker eksisterende ansvar, appvarsel, egen kontroll og historikk. Testbevis: [SJA/RUH-prosjektoppfølging](docs/kshms/SJA_RUH_PROJECT_20261008.md). Samme Sandbox Preview; Production er ikke oppdatert.

Rettelse 8. oktober 2026: Desktopmenyen og Åpne Avvik gjenkjenner Avvik/SJA/RUH. KS/HMS har Avvik/RUH → Registrer RUH. Frister vises norsk, og avvikshistorikk bruker Oslo-tid. Testbevis: [meny/RUH/dato](docs/kshms/NAV_RUH_DATE_20261008.md). Ingen SQL-endringer i denne rettelsen.


KS/HMS-utførelse 8. oktober 2026: **Vernerunder/kontroller** bruker egne punkter eller en fast publisert firmamal, med valgfri prosjektkobling, utkast, egen fullføring og bevart historikk. Hvert avvik får én ansvarlig/frist-sak i Avvik/RUH; kontrollens fullføring lukker ingen saker. **Risikovurdering** har en jobbspesifikk 5×5-matrise, risiko før/etter tiltak, firmaets dokumenterte grenser, medvirkning, ansvar/frist og uttrykkelig beslutning. Forventet effekt kan ikke godtas som kontrollert effekt. Se [scope og testbevis](docs/kshms/EXECUTIONS_20261008.md) og [kort brukerprøve](docs/kshms/USER_TEST.md). Rapportens TEST OK 8. oktober kl. 14:48 består.

Prosjektoppfølging 8. oktober: **Avvik/SJA/RUH** har også **Opprett vernerunde** og **Opprett risikovurdering 5×5**, med oversikter for bare dette prosjektet. Begge krever personlig KS/HMS-tilgang. Valgt ansvarlig får et fast appvarsel frem til bekreftet lagret fullføring; lesing fjerner det ikke, og omfordeling flytter oppgaven. Godkjente firmarutiner velges med R-nummer og eksakt utgave. En stor avkrysning for egen gjennomgang står ved **Kontroll fullført** / **Vurdering fullført**. Se [tilleggets testbevis](docs/kshms/PROJECT_EXECUTIONS_20261008.md). Publiseringsstatus står i CURRENT_RELEASE_STATUS.md.

Oppfølging etter TEST OK 8. oktober kl. 21:04: gjennomføringspopupen lukkes etter bekreftet lagret fullføring. Ansvarse-post omfatter Avvik/RUH, vernerunder, risiko, SJA, pliktig rutinegjennomgang og forfalt revisjon; køen dedupliserer tildelinger og stopper inaktivt ansvar. Sandbox-mailer v4 er publisert, men kontrollert HTTP 503 viser manglende Resend-nøkkel og avsender. Faktisk utsending er derfor fortsatt av. Se [varsler og popup](docs/kshms/NOTIFICATIONS_20261008.md).

KS/HMS har nå et valgt **Dokumentuttrekk** for firmaadmin/KS/HMS-ansvarlig: beskriv omfang, velg lagrede dokumenter og last ned én PDF med RUH-historikk/private bilder og manifest. Ingen dokumenter velges automatisk. Samlet PDF er Kenneths TEST OK 9. oktober kl. 01:29; ZIP-nedlasting med to bilder og manifest er TEST OK kl. 01:55. PDF og ZIP har separate knapper; ZIP-knappen vises etter Vis vedleggslisten. En separat **Vis vedleggslisten → Last ned vedlegg (ZIP)** samler valgte kvalitet-/HMS-/RUH-originaler, vernerunde-bilder og prosjektkontrollvedlegg etter egen bekreftelse. Manifest gir dokument/revisjon, filstørrelse og SHA-256. Maks 100 vedlegg/50 MB, 10 MB per fil; ZIP er ikke kryptert. [PDF-scope](docs/kshms/INSPECTION_EXTRACT_20261009.md) og [ZIP-scope/QA](docs/kshms/ATTACHMENT_ARCHIVE_20261009.md). Feature/Sandbox først; tidligere TEST OK beholdes, e-post forblir deaktivert.

Vedleggsdekning 9. oktober: Dokumentuttrekk har også **Kvalitets- og HMS-avvik med historikk og bilder**. Eksplisitt valgt lagret sak gir full historikk/private bilder i samlet PDF og private originalfiler i ZIP. Eldre ukoblede prosjektavvik kan nå hentes for valgt prosjekt i en egen gruppe. Lagret innhold og bilder følger PDF, originalfiler følger bekreftet ZIP. Ingen versjonsnummer eller signatur konstrueres; SHA-256 binder valget til innholdet. Se [ny avgrenset leveranse](docs/kshms/LEGACY_ATTACHMENTS_20261009.md). Egen RUH-PDF beholder sitt avgrensede scope. [Ny leveranse/QA](docs/kshms/DEVIATION_ATTACHMENTS_20261009.md). Tidligere TEST OK beholdes; ny avgrenset brukerprøve og øvrig B/C-scope består.

SJA kan lagre inntil tre komprimerte arbeidsstedsbilder i den samme versjonerte innholdssnapshoten som tekst og deltakere. Bildene følger egen SJA-PDF og valgt SJA i samlet PDF, og blir egne JPG-filer i bekreftet vedleggs-ZIP med manifestkontroll. Gamle SJA-er er bakoverkompatible uten bilder. Ingen ny Storage-bucket, tabell, RLS eller policy; eksisterende private SJA-RPC og signert-uforanderlighet består. [Avgrensning og QA](docs/kshms/SJA_ATTACHMENTS_20261009.md).

Risikovurderinger kan lagre inntil tre komprimerte bilder per fare i den samme private, versjonerte gjennomføringssnapshoten som risikoteksten. Bildene følger egen PDF, prosjektrapport og samlet dokumentuttrekk, og blir egne originalfiler i bekreftet vedleggs-ZIP med fare og SHA-256 i manifestet. Eldre vurderinger virker uten bilder, og «Ny vurdering med samme farer» arver ikke bilder. Ingen ny Storage-bucket, tabell, RLS eller policy er innført. [Avgrensning og QA](docs/kshms/RISK_ATTACHMENTS_20261009.md).
