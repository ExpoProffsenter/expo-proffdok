# Expo ProffDok

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

KS/HMS videreutvikler eksisterende ProffDok. [Plan og faktisk gap-analyse](docs/kshms/PLAN.md), [full kapittel-/rutinedekning](docs/kshms/COVERAGE.md) og [QA-status](docs/kshms/QA.md) beskriver hele minimumsomfanget. Trinn A gir firmaktivering, firmabundet ansattilgang, flerfaglig oppstart, 12 selvstendige tilpasningsutkast, blank/kopi, kapitler, kladd/godkjent versjon, ansattbekreftelse og signert årlig revisjon. Det er ikke et komplett KS/HMS-system; utførelse/SJA/risiko, samlet firmavvik, varsler/PDF og begrenset personal/stoffkartotek gjenstår i registrerte trinn.

I håndboken kan flere standardrutiner hukes av samtidig. Kortene viser «Valgt», og «Disse rutinene legges inn» viser hele utvalget før **Legg inn** lagrer hver rutine som en firmakladd. «Lagt til» og **Rediger her** viser hvor den enkelte rutinen tilpasses. «Anbefalte» og «Alle forslag» deler samme utvalg. Allerede aktive rutiner beholdes ved ny innlegging; eksisterende tilpasninger overskrives ikke. Firmaadmin godkjenner publisering separat. De 12 utkastene er første utvalg; hele referansedekningen, også personal/HR og VVS, inngår fortsatt i videre leveransetrinn.

Systemadmin aktiverer firmaets modul, firmaadmin styrer grant og publisering, og utpekt KS/HMS-ansvarlig signerer revisjon. Firmaadmin kan velge seg selv som ansvarlig uten et ekstra grant; signering krever fortsatt eksplisitt utpeking i oppstart. De tre oppstartsfeltene har forklaringer og VVS-eksempler; fagvalget heter VVS. Samme arbeidsfirma ved faneretur beholder visning og ulagrede felt, i tråd med eksisterende Sales-kontroll for arbeidsprofil. Alle API-operasjoner kontrollerer aktivt firma og rolle. Ingen pris-/betalingsintegrasjon innføres. Production er ikke endret, og ny TEST OK kreves før merge. Preview-branchen må ha eksplisitt `EXPO_BACKEND_TARGET=sandbox`.

Alle fire KS/HMS-faner forklarer hva brukeren gjør der og hva som kommer etterpå. Utkast, versjon og revisjon forklares med korte setninger; rutinefeltene har konkrete skrivehjelper. Grensesnittet bruker **Lagre utkast**, **Les forslag** og **Alle forslag**. [Brukertestlisten](docs/kshms/USER_TEST.md) gir handling og forventet resultat. Den faste branch-Preview-adressen oppdateres ved nye deployer; samme nettleser/adresse skal normalt beholde aktiv innlogging. Tekstendringen innfører ingen ny innlogging eller endring i auth-/firmascope.
