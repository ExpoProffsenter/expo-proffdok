# Expo ProffDok – arkitekturkart

Preview 07.10.2026: Native React-menykontroller bærer gjeldende navn i `data-expo-nav-label`. Enkel ordre bruker dette ved gjenoppretting etter sidebytte, fordi React gjenbruker knapper og samme salgsprop også når arbeidsflaten endres. Den eksisterende desktop-/prosjektmenyen klikker fortsatt de samme native kontrollene. Ingen ny navigasjonsmotor, tilgangsregel eller datastrøm innføres. Se [avgrenset returprøve](../kshms/MENU_RETURN_20261007.md).

**Fase:** eksisterende ProffDok med firmakunder/mva.; KS/HMS trinn A under utvikling i feature/Preview
**Status:** Production inkluderer godkjent PR #214 og tidligere Cordel-/prosjekt-/tilbudsfunksjoner. KS/HMS er ikke merget eller produksjonsgodkjent.
**Kontrolldato:** 05.10.2026
**Produksjonsbaseline:** `main` = `155f6c4ac01f126c1db0c65da385cfd9305587d5`; Vercel `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z` READY på samme SHA. Kode, backend og live system er autoritativt dersom statusdokumentet henger etter.
**Production Supabase:** `dqffxflaoyarbxyiyhop`  
**Permanent Demo Sandbox:** branch `demo`, Supabase `ppvircenkjizeiqdxphj`

Dette dokumentet beskriver gjeldende Production-arkitektur og sikkerhets-/bakoverkompatibilitetskrav som må bevares. Historiske detaljer finnes i Git og fasespesifikke arkitekturfiler.

## 1. Styrende prinsipper

### Cordel: lokal eksport fra låst grunnlag

`src/modules/cordel` er en ren filgenerator og React-presentasjon. Eksportknapper integreres i Sales-detalj, prosjektets eksisterende kontraktkort og Prissøk/plukkliste. En separat, firmascope-bundet Cordel-tilgang leses fra server og administreres i eksisterende Systemadmin-brukerkort. Filgeneratorene endrer ikke tilbud, plukklister, recovery eller hydration.

Aksepterte tilbud blir Windows-1252-jobbliste og native AFG v4 med komplette tekster, Rundsum-priser, nummererte overskrifter og delsummer. Akseptert sum kontrolleres i øre mot hver eksportert post. På en tom ordre kan AFG importeres alene; ved jobbliste brukes jobbliste først og AFG uten sletting etterpå. AFG-oppsettet bygger på faktisk Cordel-eksport og bekreftet TEST-import, ikke et publisert skjema. Egen Cordel-metode med 0 % materiellpåslag og øreavrunding kreves. Kildekost, timer og fortjeneste overføres ikke.

Plukklistefilen inneholder kun NR, Mengde og Fagområde/leverandør; Cordel bruker sin prisbok. Faste P:-filnavn gjenbruker importdefinisjoner. **Hjelp → Eksport av tilbud til Cordel** rendres i eksisterende React-Hjelp som ett nytt tema. TEST-bildene leveres som lazy-lastede, lokale bildeassets med originale PNG-bytes bevart. Øvrige Hjelp-temaer og deres rettighets-/åpne/lukk-logikk er bevart.

1. `main` er kilde til sannhet for produksjonskode.
2. Produksjon beskyttes foran alt: feature-branch → Vercel Preview → eksplisitt `TEST OK` → merge → bekreft Production-SHA, `READY`, HTTP/runtime og relevant Supabase-status.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang eller autoritativ validering.
4. Publiserte tilbud, aksepterte tilbudsversjoner, signerte kontrakter og utstedte garantier er historikk og skal ikke overskrives vilkårlig.
5. Prosjekt kan opprettes og eksistere uten tilbud og uten kontrakt.
6. Kontrakt er bare obligatorisk når dokumentert tetthetsgaranti faktisk skal utstedes eller øvrig avtalegrunnlag krever den.
7. Privatkundeorienterte priser vises inkl. mva.
8. Ingen historisk backfill uten eksplisitt beslutning.
9. Supportmodus er ikke skrive-bypass og skal ikke registrere systemadmin som feil oppretter, ansvarlig eller signatar.
10. Sales recovery/hydration og IndexedDB-sikring av befaringsbilder er kritiske kontrakter.
11. Historiske Storage-paths/URL-er flyttes ikke spontant.
12. Modulisering gjøres bare ved naturlige ansvargrenser som gir reell oversikt eller mindre risiko.
13. Brukerrettede endringer oppdaterer HJELP samme runde.
14. Fremdriftsplan er operativ prosjektdata og skal aldri endre låst tilbuds-/aksepthistorikk.
15. Vercel Preview skal være trygg testmodus for prosjektfunksjoner som ellers kan sende e-post eller skrive produksjonsdata.
16. Kalender- og PDF-eksport skal lese lagret data; eksport blir ikke ny sannhetskilde.
17. Intern ERP-nettopris er sikkerhetskritisk intern data og skal aldri inngå i kundens tilbudsgrunnlag.
18. Historiske Butikktilbud beholder tidligere avslutning og skal ikke omskrives. Nye Generelle tilbud kan etter aksept aktiveres som Enkel ordre eller ordinært prosjekt.
19. Aktiv arbeidsprofil/representert firma er arbeidsscope. Systemadministrator skal ikke få tverrfirma-prosjekter projisert inn i ordinær arbeidsflate bare fordi rollen har brede supportrettigheter. Et prosjekt som åpnes via eksplisitt tverrfirma-support er skrivebeskyttet i hele prosjektflaten: lesing, fanenavigasjon og PDF er tillatt, mens lagring, kopiering, låsing, opplasting, autolagring og øvrige mutasjoner blokkeres. Integrasjonslag som starter før hovedappen skal vente på hovedappens registrerte Supabase-klient og skal ikke opprette parallelle GoTrue-klienter mot samme auth-storage.
20. Ved recovery/hydration vinner en eksplisitt brukerhandling alltid over automatisk gjenoppretting.
21. Sales-oversikten skal være lett: listevisning henter bare summary/metadata. Komplett tilbud, bilder, Badskisse og historikk hentes først når én konkret sak åpnes.
22. Aktivt arbeidsbilde skal tåle PC-fanebytte og mobil appbytte. Også en ny forespørsel uten `request_ref` er et gyldig recovery-arbeidsbilde.
23. Før implementering klassifiseres miljømålet som `PRODUKSJON/PREVIEW`, `SANDBOX/DEMO` eller `BEGGE`.
24. Permanent Demo Sandbox ligger på branch `demo`. Ordinær appkode kan synkroniseres **main → demo** etter godkjent Production-verifisering; demo-overlay og demodata skal aldri flyte **demo → main**.
25. Demo/Test skal ikke brukes som begrunnelse for å endre beskyttet Production-kjerne i samme PR. Reell produktfeil splittes til egen core-PR fra ren `main`.
26. Kun Systemadministrator kan aktivere Proff-vareregisteret for eksterne firma, styre leverandører/rabatter og aktivere Generelle tilbud for firmaet. Firmatilgangen gjelder alle nåværende og nye brukere. Enkel ordre er en videreføring som velges først etter kundeaksept.
27. Intern Ringside-nto og ekstern «Din nto pris» er to separate rettigheter. Begge krever eksplisitt serververifisert tilgang.
28. Enkel ordre bruker prosjektmotoren, men kundeportal er blokkert. Fremdriftsplan og FDV er valgfrie.
29. App-tilgang forutsetter at virksomheten oppfyller gjeldende SoPro-vilkår. Eventuell særskilt betaling for Generelt tilbud er et senere produktvalg og er ikke en teknisk tilgangsregel i Fase 45B.
30. En generert sluttrapport er et konsistent øyeblikksbilde av samme effektive status som brukerflaten. Signert overtagelse kan derfor bekrefte garantivilkår i rapporten selv om siste eksplisitte persist-hook først kjøres ved låsing, og rapporten viser tidspunktet for den aktuelle genereringen – aldri en pågående-status i en ferdig fil.
31. Auditfelt på nye Fag/utstyr-poster og automatisk arkivert Expo-kontrakt skal komme fra autentisert aktør/signatar, ikke bare fra eventuelt tomt prosjektsnapshot.
32. En eksplisitt «Fullfør overtagelse og lås prosjekt»-handling kan hoppe over den generelle, dupliserte låsebekreftelsen. Direkte låsing/opplåsing fra topplinjen beholder egen bekreftelse.
33. Felles e-postutsending er en separat systemadminhandling. Mottakere løses server-side, adresser sendes individuelt, driftsmelding og markedsføring er eksplisitte typer, og markedsføring krever aktivt samtykke samt personlig avmelding.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti, fremdrift, katalog og systemdata |
| Serverlogikk | Supabase RPC/trigger/RLS | Firmascoping, validering, låsing, portalfiltrering og katalogtilgang |
| Filer | Supabase Storage | Bilder og private/offentlige dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, aksept, kontrakt, portal, chat og prosjektmeldinger |
| Hosting | Vercel | Preview, Production og permanent Demo Sandbox |
| PDF | jsPDF + nettleserutskrift + `pdf-lib` | Rapport, tilbud, akseptbevis, garanti, kontrakt og fremdriftsdokumenter |
| Kalender | standard `.ics` | Enveis eksport av daterte fremdriftsøkter |

Produksjon: `https://expo-proffdok.app`  
Permanent demo: `https://expo-proffdok-git-demo-ringside.vercel.app`

## 3. Repository – hovedansvar

```text
src/main.jsx
  sentral app-/prosjektorkestrering og eldre funksjoner

src/bootstrap.jsx
  installer små, avgrensede bootstrap-/UX-lag

src/modules/app/
  app-shell, desktopmeny og prosjektveiviser/hurtigvalg

src/modules/access/
  modul-/rolletilgang, arbeidsprofiler, systemadmin-representasjon og support-/scope-guards

src/modules/sales/
  forespørsel, befaring, ordinært/Generelt tilbud, aksept, recovery og kontrakt

src/modules/storeCatalog/
  internt ERP-vareregister, søk/import og Systemadmin-katalogflate

src/modules/progress/
  fremdriftsplan, eksport, kalender og kunde-/UE-presentasjon

src/modules/help/
  rollebasert brukerveiledning

src/modules/project/
  prosjektfunksjoner og prosjektinvolverte

docs/architecture/
  gjeldende arkitekturkart + fasespesifikke sikkerhets-/designnotater

scripts/
  kritiske pre-build-regresjonskontroller og PR-scope-guard
```

### 3.1 Permanent Demo Sandbox

`demo` er en langlivet, isolert branch som bygger den ekte appen mot separat Sandbox-Supabase. Den brukes til kundedemo, opplæring og funksjonell presentasjon uten risiko for Production-data.

Kritiske regler:

- `demo` skal aldri merges til `main`.
- Production-funksjonalitet utvikles og godkjennes fra `main`-baserte feature-/hotfix-brancher.
- Når godkjent Production-kode også skal finnes i demo, synkroniseres gjeldende `main` kontrollert inn i `demo`.
- Demo-spesifikke kontrollflater, Golden/reset, syntetiske ressurser, sandbox-RPC-er og konfigurasjon bevares kun i demo.
- Demo-builden skal feile dersom emitted JS fortsatt inneholder Production-Supabase-binding.
- Sandbox har egen Auth, database og Storage og skal bare inneholde fiktive/sanitiserte data.
- Fast kontrollside er `/demo-control.html` på det permanente demo-hostet.

## 4. Prosjekt og Avtalegrunnlag

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Den synlige fanen heter **Avtalegrunnlag**, mens intern nøkkel fortsatt er `tilbud` / `data.tilbud` for bakoverkompatibilitet.

Gyldige prosjektveier:

```text
A) Direkte prosjekt uten tilbud
B) Akseptert ordinært tilbud → prosjekt uten kontrakt
C) Akseptert ordinært tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert ordinært tilbud → Expo-kontrakt → prosjekt
E) Akseptert Generelt tilbud → Enkel ordre eller ordinært prosjekt
```

Avtalegrunnlag kan inneholde akseptert tilbud/akseptbevis, signert Expo-kontrakt, bedriftens egen kontrakt, andre avtaledokumenter og senere tillegg/fradrag.

For ordinære prosjekter aktivert fra et akseptert Sales-tilbud viser Avtalegrunnlag også kontrakthandlingen. Dersom kontrakten ikke ble laget før aktivering, henter prosjektet den samme låste, aksepterte tilbudsversjonen via eksisterende offentlig tilbudstoken og åpner eksisterende `SalesContractActions`/`SalesContractWizard` i prosjektfanen. Nye aktiveringer bevarer også `salesOfferId` i `project.salesOrigin`; eldre prosjekter kan utlede ID-en fra serverresponsen. Det opprettes ingen ny kontraktmodell, RPC, tabell eller RLS-bypass. Kunde-/UE-portal skjuler handlingen. I eksplisitt Systemadmin-supportmodus er Salgsgrunnlag og Avtalegrunnlag interaktive for lesing og åpning av eksisterende dokumenter, mens all kontraktskriving, opplasting og fjerning fortsatt er blokkert. Private Sales-dokumentlenker bærer en eksplisitt supportmarkør; eksisterende systemadmin-vakt tillater den bare for autentisert Systemadmin og bare på GET/HEAD. Når prosjektet allerede inneholder slutt-PDF med samme `contractId`, Storage-path eller URL som kontraktraden, hoppes automatisk sluttarkivering/prosjektsynk over; ren visning skal ikke flytte `projects.updated_at`.

Historiske Butikktilbud beholder gammel avslutning uten prosjektaktivering. Fase 45B endrer den synlige funksjonen til Generelt tilbud; teknisk legacy-identitet kan fortsatt være `store offer` av hensyn til kompatibilitet.

### 4.1 Prosjektnavigasjon – Fase 42J/42K

Desktop bruker kollapset prosjektmeny for å frigjøre plass i headingen. Når et prosjekt er aktivt viser `projectWorkspaceHeaderGuide.js` en kort veiviser og noen få hurtigvalg: **Oversikt, Bilder, Sjekklister og Chat**. Hurtigvalgene klikker eksisterende native prosjektfaner og lager ikke en ny navigasjonsmotor. Alt øvrig prosjektinnhold ligger fortsatt i **Meny**.

Når Systemadmin har åpnet et annet firmas prosjekt i eksplisitt supportmodus, heter prosjektets returhandling **Supportoversikt**. Den går tilbake til Systemadmin-visningen med samme firma valgt og supportpanelet åpent; den avslutter ikke supportmodus. Bare den separate handlingen **Avslutt supportmodus** rydder supportkonteksten.

Fase 42K stabiliserte legacy-prosjektmenyer slik at eldre prosjektdata ikke gir feil anbefalt rekkefølge. Mobilskallet endres ikke av desktop-veiviseren.

## 5. Sales – ordinær Befaring/Tilbud

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ valgfritt kontrakt/prosjekt
```

Kritiske Sales-kontrakter:

- tom/uhydrert tilbudskladd skal aldri overskrive nyere serverdata
- recovery skal fungere ved reload, dvale, PC-fanebytte og mobil appbytte
- befaringsbilder beholder IndexedDB/Storage-flyt
- publiserte/aksepterte tilbudsversjoner er immutable snapshots
- kundeaksept knyttes til eksakt versjon og valgte opsjoner
- supportmodus er ikke skrive-bypass
- summary-rader skal aldri kunne skrives tilbake som komplett Sales-payload
- komplette saksdetaljer skal være lastet før editor/autosave aktiveres

### 5.1 Recovery/hydration – Fase 42F

Fase 42F strammet inn Sales-gjenoppretting etter mobil dvale, appbytte og reload. Serverdata er autoritativt utgangspunkt, mens lokal recovery brukes kontrollert for ulagret arbeid.

Kritiske regler:

- eksplisitt brukerhandling vinner alltid over automatisk recovery
- recovery skal ikke hoppe brukeren tilbake til en sak eller fane vedkommende bevisst har forlatt
- ferske serverbilder og lagret Badskisse skal flettes inn uten å overskrive nyere lokal befaring
- manglende lokal media skal ikke tolkes som beskjed om å slette servermedia
- bakgrunns-/reloadmarkører skal ikke bli ny sannhetskilde

Disse kontraktene er permanent regresjonsbeskyttet og skal vurderes ved alle endringer i Sales-navigasjon, hydrering eller media.

PR #206 sikrer audit-recovery av tilbudskladd: brukerens valg identifiseres av den lokale sikkerhetskopiens revisjon, uavhengig av at aktiv kladd får nytt lagringstidspunkt. Dialogen navngir begge lokale versjoner korrekt. Valgt kladd bevares ved samtidig serverkonflikt, og autolagring prøves igjen etter overgangsvakten. Recovery skal fortsatt bare be om valg når to reelle versjoner krever det.

### 5.2 Badskisse og befaringsmedia – Fase 42A–42F

Badskisse er en mobiltilpasset del av befaringen for enkle romskisser med vegger/mål, dør/vindu og relevante baderomsobjekter. Fase 42E forbedret målsatt visning og redigering. Fase 42F sikret at lagret Badskisse og servermedia overlever recovery/hydration.

Badskisse og bilder er del av befaringsdata og skal følge samme recovery-prinsipp: serverinnhold bevares, nyere lokal brukerhandling bevares, og sammenslåing skal ikke gi stille datatap.

### 5.3 Skalerbar saksoversikt / lazy loading – Fase 42I

Sales-listen bruker en lett serverprojeksjon (`list_payload`) for metadata som kunde, adresse, status, ansvarlig, neste steg, dato og søkeinformasjon. Komplett `payload` med tilbudslinjer, bilder, Badskisse, akseptdata og historikk hentes først når brukeren åpner den konkrete saken.

Dette er en kritisk skaleringsgrense. Historiske Ringside-saker hadde titalls MB full payload selv med få saker; listeprojeksjonen reduserer dette til noen titalls KB for samme oversikt.

Kritiske regler:

- sakslisten må aldri begynne å hente komplette payloads for alle saker igjen
- firmascopet localStorage-listecache skal bare inneholde lett summary
- valgt sak skal hydreres komplett server-first før editor åpnes
- hvis komplett sak ikke kan hentes, skal editor blokkeres og brukeren få kontrollert retry i stedet for tom/ufullstendig redigering
- tilbudskladd, befaringskladd og media-recovery beholder egne lagringsmekanismer

### 5.4 Ulagret kundeinformasjon ved app-/fanebytte – Fase 42J

`Ny forespørsel` og `Nytt tilbud` har ingen `request_ref` før brukeren lagrer. Recovery må derfor tillate disse modusene uten valgt saks-ID. Kunde-/adressefelter mellomlagres lokalt og gjenopprettes bare når et eksplisitt, ferskt bakgrunns-snapshot viser at brukeren faktisk var i dette arbeidsbildet.

Dette gjelder både PC-fanebytte og mobil appbytte, for eksempel når bruker åpner SMS eller Outlook for å hente resten av kundenavn/adresse.

`Rediger forespørsel` bruker samme prinsipp, men kladden er bundet til konkret `request_ref`.

Viktig:

- normal navigasjon skal ikke gjenopplive gamle entry-kladddata
- første tomme React-render skal aldri overskrive entry-kladden som skal gjenopprettes
- bevisst Tilbake/Avbryt/menyvalg rydder recovery-markører slik at brukerhandling alltid vinner

### 5.5 Produksjonsstabilisering

Gjeldende Production-baseline inkluderer Fase 42K og senere godkjente rettelser, blant annet:

- korrekt systemadmin-arbeidsscope via valgt `Representerer`-firma
- videre beskyttelse av Prissøk-resume og bevisst navigasjon. Mobil-Prissøk er i Production fra PR #201; detaljene står i avsnitt 7.5.
- krav om Firma ved godkjenning av nye brukere
- vern av intern Butikktilbud-/nettopristilgang ved firmabytte
- legacy prosjektmeny og anbefalt prosjektløp konsolidert mot gjeldende navigasjon

## 6. Sales – Generelt tilbud

Generelt tilbud er Sales-flyten for varer, arbeid, underentreprenører og andre leveranser. Eksisterende historiske Butikktilbud skal fortsatt kunne åpnes og vises korrekt. Interne tekniske navn kan derfor fortsatt bruke `store offer`/`Butikktilbud`.

```text
Nytt Generelt tilbud
→ kunde/ansvarlig/merkevare
→ tilbudsposter og avsnitt
→ valgfritt katalogsøk
→ knyttet montering og opsjoner
→ autosavet kladd
→ kundepreview
→ publisert versjon
→ kundelenke/e-post
→ aksept eller avvisning
→ låst akseptert tilbudsversjon
→ Enkel ordre eller ordinært prosjekt
```

Aksept av Generelt tilbud:

- gir firmaet et eksplisitt valg mellom Enkel ordre og ordinært prosjekt
- bruker akseptert versjon og valgte alternativer som låst bestillingsgrunnlag
- beholder publisert versjon som låst historikk
- beholder eventuell automatisk oppfølgingshistorikk

Historiske Butikktilbud følger sin opprinnelige avslutning og skal ikke automatisk konverteres eller aktiveres som prosjekt.

### 6.1 Tilbudsposter og avsnitt

Avsnitt lagres som `store_text` med `storeSectionMode = "group"` og representerer visuelle grupper som `Varmepumpe`, `Elektriker`, `Bad 1` osv.

Avsnitt:

- har ingen pris
- skal ikke valideres som ordinær prislinje
- skal ikke bruke prislinjenummer
- skal vises som overskrift i internvisning, kundelenke, tilbuds-PDF og akseptbevis

Felles robust deteksjon ligger i `src/modules/sales/utils/storeSectionLine.js` og støtter også eldre seksjonsmarkører.

### 6.2 Montering og opsjoner

Montering kan knyttes direkte til post og beregnes med antall/timer × enhetspris. `Kun montering` støtter frittstående arbeid.

Opsjoner støtter tillegg/oppgradering og alternativ/erstatter. Alternativ vare kan beholde samme montering, bruke ny montering eller ha ingen montering.

Komplette tilbudsmaler kan lagre varige bildepekere (`https:` eller appens rot-relative Storage-/asset-URL-er) på poster og opsjoner. Midlertidige `data:`/`blob:`-bilder fjernes fordi de ikke er en stabil lagringskontrakt, og PDF-vedlegg er alltid saksspesifikke og følger ikke malen. Eksisterende maler uten lagret bildepeker kan ikke rekonstruere bildet automatisk; de må lagres på nytt fra et tilbud som fortsatt har bildet.

### 6.3 Autosave og recovery

Generelt tilbud har saksspesifikk serverautosave. Kritiske regler:

- tom/stale lokal kladd får ikke overstyre servertilbud med innhold
- tom Enter-opprettet post prunes ved lagring
- avsnitt bevares gjennom normalisering som avsnitt
- Tilbake lagrer kladd uten gammel generisk valideringsdialog
- vanlig inngang til Befaring/Tilbud åpner sakslisten
- faktisk reload inne i sak kan gjenåpne samme sak

Firmascopet lokal Sales-cache kan gi rask førstevisning, men Supabase er alltid autoritativ og oppdaterer listen etter serverlasting.

Kundepreview bruker samme presentasjon som kunden, men er isolert og read-only. Den åpnes i ny fane uten å flytte originalfanen bort fra tilbudet, og kan ikke publisere, sende e-post, akseptere eller avvise.

Kontrakt-PDF grupperer sammenhengende tekst i ett kort, bruker ledig sideplass og oppretter fortsettelseskort bare ved reelt sideskift. Lange overskrifter brytes, og opsjonsbeskrivelse og pris holdes samlet. PDF-generering endrer ikke det låste kontraktsgrunnlaget.

## 7. Internt ERP-vareregister – Fase 39B.2

Detaljert sikkerhet og importmodell: `docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md`.

Tilgang krever godkjent/aktiv bruker og eksplisitt serverautorisering. Interne brukere i Ringside/Bademiljø Expo/Expo Proffsenter kan gis tilgang til hele internkatalogen, mens eksterne proffbrukere bare kan søke hos leverandører firmaet er aktivert for. Org.nr. brukes ikke som eneste sikkerhetsgrense.

Kun systemadministrator kan administrere/importere katalogen.

### 7.1 Ekstern Proff-katalog – Fase 45B

Ekstern profftilgang er firma- og leverandørscopet:

1. Systemadministrator velger aktive leverandører og firmaets rabatt per leverandør i Proff-vareregisteret.
2. Systemadministrator aktiverer `store_offers` én gang for firmaet, synlig som **Generelle tilbud / Proff vareregister**. Backend sørger for at alle firmaets brukere får nødvendig `sales`-grunnlag og samme tilgang.
3. Brukeren må være godkjent og aktiv, ha begge modulene og tilhøre et firma med minst én aktiv leverandør.
4. Søk returnerer ikke Ringsides interne purchase-netto, innkjøpsrabatt, DG eller påslag.

Brukervilkårstatus er en separat compliance-/onboardingstatus og er ikke samme kontroll som firmaets leverandørtilgang eller brukerens modultilgang. **Enkel ordre** blir først et valg når et Generelt tilbud er akseptert.

Veiledende/kundepris brukes som foreslått salgspris, men tilbudsgiver kan endre salgspris/rabatt i eget tilbud. «Din nto pris» kan bare returneres når brukeren har eksplisitt bruker- og firmascopet rettighet. Firmaadmin kan administrere rettigheten for andre brukere i eget firma, men ikke gi den til seg selv. Systemadministrator kan gi og fjerne rettigheten.

Interne Ringside/Bademiljø Expo/Expo Proffsenter-brukere kan ha bred katalogtilgang uten automatisk tilgang til intern nto-pris. `view_internal_net_prices` beholdes som eksplisitt sikkerhetskrav.

### 7.2 Katalogdata

Katalogen kan inneholde intern netto innkjøpspris og kalkulasjonsdata. Ved valg i tilbud kopieres bare kundeegnet snapshot og salgspris.

Intern nettopris skal aldri finnes i:

- kundens Sales-payload
- publisert tilbudsversjon
- offentlig kundelenke
- tilbuds-PDF
- akseptbevis

### 7.3 Single-copy import

Gjeldende importmodell er single-copy for å unngå dobbel full katalog og unødvendig disk/WAL-belastning.

```text
Systemadmin starter import
→ søk låses
→ TXT parses lokalt
→ gyldige batcher skrives kontrollert
→ liten aktivering
→ søk åpnes
```

Historiske publiserte/aksepterte tilbud endres ikke av ny ERP-prisfil.

### 7.4 Vareidentitet

Primær vareidentitet er leverandør + leverandørens varenummer.

Leverandøralternativer kobles via samme normaliserte GTIN/EAN. Varenummer alene brukes ikke på tvers av leverandører.

### 7.5 Mobil Prissøk og strekkodeskanning

`← Startside` vises i mobil Prissøk og bruker eksisterende `closePriceSearch({ clearResume: true })` før appens ordinære Startside-navigasjon. Bevisst avslutning rydder recovery-markøren. Ved reelt appbytte/dvale kan aktivt Prissøk gjenopprettes; den midlertidige arbeidslisten beholder kun vare-ID/oppslagsnøkler i samme fanes `sessionStorage`, og priser hentes på nytt fra backend.

`Skann strekkode` vises bare på mobil. Skannerkomponenten og ZXing lastes ved behov, foretrekker bakre kamera og setter avlest EAN/GTIN i eksisterende søkefelt. Søket går gjennom de eksisterende read-only RPC-ene; ingen kamerabilder eller videodata lagres eller lastes opp. Videosporet stoppes ved treff, avbrudd, navigasjon, bakgrunning, unmount og sent innvilget kameratillatelse etter at skanneren er lukket. Manuell EAN-inntasting er fallback ved manglende kameratilgang. Desktop-visningen og serverens maskering av interne nettoprisfelter er uendret.

Interne brukere kan opprette og redigere høyst tre plukklister per bruker på både PC og mobil via de samme avgrensede RPC-ene. Listene inneholder vareidentitet, antall og valgfritt manuelt Cordel-ordrenummer, men ingen priser eller kameradata; de kan åpnes på begge enheter og slettes av eieren. Antall, ordrenummer og serversave vises også for en ny PC-kladd. Utskriftsmodus er separat fra redigeringsflaten: **Skriv ut plukkliste** skjuler alle priser og viser antall/ordrenummer, mens **Skriv ut priser** på PC beholder prisdokumentet og eksplisitt internprisvalg. React oppdaterer valgt dokument synkront før native utskrift, slik at bytte mellom de to aldri skriver ut forrige dokumenttype. Mobilskanning i Generelt tilbud gjenbruker skanneren og fyller søket for aktuell post/opsjon, mens varevalget fortsatt er bevisst. Serverkontroll av firmascope, katalogtilgang og prisvisning gjelder uendret. Se [plukklister og skanning i Generelt tilbud](MOBILE_PICKLIST_AND_GENERAL_OFFER_SCAN.md) for datamodell, revisjonsvern og tilgangsvilkår.

## 8. Modul-/rolle-tilgang

Modultilganger skiller blant annet:

- `projects`
- `sales`
- `store_offers`

Systemadministrator har tverrfirma-support, men dette er ikke en generell skrive-bypass.

Firmaadministrator kan delegere øvrige moduler innenfor eget firma og egne tillatelser. Generelle tilbud/katalog aktiveres samlet på firmaet av Systemadministrator og følger egne serverkontroller. Firmaadministrator kan ikke aktivere Proff for firmaet, endre leverandørrabatter eller selvtildele «Din nto pris», men kan styre prisinnsyn for andre brukere i firmaet.

Katalogimport er strengere enn ordinær Butikktilbud-bruk: systemadministrator-only.

### 8A. Arbeidsprofiler, representasjon og systemadmin-scope – Fase 41B / 42G / 42K

Aktiv arbeidsprofil lagres server-side. Vanlige flerfirma-brukere arbeider i valgt firma. Systemadministrator kan velge hvilket firma vedkommende **representerer**, uten at dette oppretter ordinært firmamedlemskap.

Ved ny prosjektinnsetting setter `projects_sync_company_scope_id` aktivt `company_scope_id` og autoritativt firmasnapshot i en `BEFORE INSERT`-trigger. Dette skjer før `projects_insert_scoped_authenticated` kontrollerer samme scope i RLS. Klienten sender fortsatt eierens `user_id`, men kan ikke velge et vilkårlig firmascope. Triggeren er versjonert og idempotent slik at Production og permanent demo-sandbox beholder samme grunnkontrakt.

Systemadministrator har fortsatt brede serverrettigheter for legitim administrasjon/support, men den vanlige prosjektflaten skal være låst til valgt representert firma. Fra Fase 42G installeres `systemAdminProjectScopeGuard.js` før app-bootstrap. For systemadministrator legges aktiv `company_scope_id` på prosjekt-REST for lesing og eksisterende endringer/sletting. Dersom systemadministrator ikke har aktivt firma, brukes et tomt/umulig scope i stedet for å vise alle prosjekter.

Dette er et ekstra klientsikkerhetsnett, ikke erstatning for RLS. RLS/RPC/server forblir autoritativ sikkerhetsgrense. Produktretningen er at tverrfirmaarbeid skal skje ved eksplisitt valg av firma/supportkontekst, ikke ved at prosjekter fra flere firma blandes i ordinær prosjektliste.

Sales-recovery aktiveres bare når den markerte hovedarbeidsflaten for Befaring/Tilbud faktisk er montert. Kontraktveiviseren gjenbruker Sales-visuelle komponenter inne i Prosjekt, men skal ikke kunne armere en Sales-retur som overstyrer `tab=tilbud`/Avtalegrunnlag etter kundesignering eller oppfriskning.

Prosjektets sky-autolagring henter autoritativ rad før skriving og stopper før `PATCH` når normalisert `data` og tittel er uendret. Dermed skal ren visning, kontraktstatusinnlasting og oppfriskning ikke flytte `projects.updated_at`; en skriveoperasjon utføres bare når faktisk prosjektinnhold eller tittel er endret. Etter en bekreftet skriving tømmes lokal kladd og dirty-status bare dersom det lagrede snapshotet fortsatt matcher siste klienttilstand. En eldre nettverksrespons kan derfor verken skjule nyere endringer eller utløse falsk «ulagret»-popup etter vellykket autolagring.

`warranty_registry` bruker to server-side `BEFORE`-triggere. Den første slår opp prosjektets autoritative `company_scope_id`, kontrollerer prosjekttilgang og setter scope før `NOT NULL`/RLS. Den andre krever at prosjektets Avtalegrunnlag inneholder et kontraktdokument før garanti kan registreres. Den idempotente parity-migrasjonen gjenoppretter disse eksisterende Production-vernene i eldre Sandbox-baselines; klienten får ikke sette firmascope selv.

Prosjektets arkivlås utføres av SECURITY DEFINER-RPC-en `set_project_lock`. RPC-en krever innlogget bruker, gjenbruker `project_row_access_allowed`, og oppdaterer `locked`, `locked_at`, `locked_by` samt de tilsvarende verdiene i `projects.data.project` i én transaksjon. Sandbox-parity-migrasjonen gjenoppretter Production-RPC-en uten å endre eksisterende prosjektrader.

Kritisk regresjonstest:

```text
Systemadmin primærfirma Ringside
→ velg «Representerer Expo Proffsenter»
→ ordinær prosjektflate viser/åpner bare Expo Proffsenter-prosjekter
→ Ringside-prosjekt krever eksplisitt firmabytte
```

## 9. Publisering, kundelenke og aksept

Publiserte Sales-versjoner er snapshots. En senere kladd eller katalogpris kan ikke endre en publisert versjon.

Offentlig tilbudslenke bruker høyt entropisk `publicOffer`-token og serveroppslag.

Kundevisning for Generelt tilbud viser avsnitt/poster, montering, opsjoner og priser inkl. mva. Forhåndsvisning bruker samme struktur, men er read-only og tillater ikke publisering, e-post eller faktisk aksept/avvisning.

Tilbuds-PDF og akseptbevis bruker samme seksjonsdeteksjon for å unngå `0 kr`-avsnitt og feil nummerering.

## 10. Automatisk oppfølging – Butikktilbud

FASE 37A2 er fortsatt egen, versjonslåst oppfølgingsmekanisme for Butikktilbud.

- ordinære tilbud følges manuelt
- Butikktilbud kan ha automatisk plan
- planen låses til publisert versjon
- aksept/avvisning/utløp/arkiv eller ny gjeldende versjon stopper gammel plan

Denne mekanismen er sensitiv/frozen med mindre endring er eksplisitt bestilt.

## 11. Kontrakt og akseptvarsling

Ordinær Sales-aksept kan gå videre til Expo-kontrakt eller ekstern kontrakt. Etter prosjektaktivering kan en manglende Expo-kontrakt opprettes direkte fra Avtalegrunnlag med samme låste aksept og samme kontraktmotor. Signert slutt-PDF er privat historikk og synkroniseres tilbake til prosjektets Avtalegrunnlag.

Kontraktfunksjonen finnes gjennom blant annet `SalesContractWizard`, `SalesContractActions`, `SalesContractCustomerView` og kontraktdokumentkomponentene. Prosjektinngangen er et tynt adapterlag og skal ikke forgrene eller kopiere kontraktmotoren.

Akseptvarsling er et etterfølgende sideutfall; lagret aksept kan ikke reverseres av e-postfeil.

Viktige serverkomponenter inkluderer:

```text
accept_sales_offer(...)
sales-offer-acceptance-notify
sales_offer_acceptance_notifications
create_sales_contract(...)
sign_sales_contract_company(...)
sign_sales_contract_customer(...)
```

## 12. Fremdriftsplan – Fase 35A–35C

Fremdriftsplan lagres separat i `public.project_progress_plans` og ligger ikke inne i `projects.data`.

```text
projects.id
  1 ── 1 project_progress_plans.project_id
```

Planen er operativ prosjektdata og skriver aldri tilbake til tilbud, aksept eller kontrakt.

Et akseptert ordinært tilbud kan brukes som **forslag** til arbeidsoperasjoner. Kun valgte opsjoner tas med. Direkte prosjekter uten Sales-opphav bygger planen manuelt.

### 12.1 Arbeidsøkter

Aktiviteter kan ha flere arbeidsøkter med dato, klokkeslett og merknad. Standard ny aktivitet får første økt i valgt/synlig uke, normalt `08:00–16:00`.

### 12.2 Gantt / PDF / kalender

Eksport leser lagret plan:

- Gantt/PDF er utskrift/read-only
- `.ics` er enveis kalender-eksport
- kalenderdata skriver ikke tilbake til Expo ProffDok

### 12.3 Prosjektinvolverte og prosjektmail

Prosjektinvolverte lagres separat i `project_participants`. `project_participant_notices` brukes til varsling/sporbarhet.

Edge Function `project-participants-mailer` validerer prosjekt- og mottakertilgang server-side.

## 13. Kunde-/UE-portal

Kunde og UE får tilgang gjennom serververifisert portalgrunnlag/koder og ikke ved direkte tabelltilgang.

Kunde kan bare se fremdriftsplan når `customer_visible = true`. UE er read-only der relevant.

Private dokumenter og kundelenker må fortsatt respektere eksisterende sikker Storage-/tokenflyt.

Enkel ordre skal ikke ha kundeportal. Servertrigger/RPC-regler blokkerer og tilbakekaller kundeportal dersom et prosjekt er markert som Enkel ordre. UE kan fortsatt brukes der det er relevant.

## 14. Garanti

Dokumentert tetthetsgaranti krever blant annet:

- riktig Sopro-system
- fullførte relevante sjekklister/bilder
- ingen åpne avvik
- overtagelse/signaturer
- signert kontrakt i Avtalegrunnlag når garanti skal utstedes

Historiske utstedte garantier og låste prosjekter skal ikke endres av produktmaster eller senere systemendringer.

Endelig garantiflyt er: registrert og signert overtagelse, utstedt garanti, komplett PDF kontrollert/arkivert og deretter prosjektlås. Rapportgeneratoren bruker `warrantyReadiness.termsAccepted` som effektiv fallback når signert overtagelse allerede gjør vilkårene bekreftet i brukerflaten, og stempler alle rapportsider med samme starttidspunkt for den aktuelle PDF-kjøringen.

## 15. Systemadministrasjon

Systemadmin er kontrollsenter for:

- bruker-/firmagodkjenning
- eksplisitt firma-/supportkontekst for tverrfirmaarbeid
- modul-/rollehåndtering
- produktmaster
- appnyheter
- felles e-post til en eksplisitt valgt brukergruppe
- **internt ERP-vareregister**

Systemadmin skal ikke bruke brede rolleprivilegier som normal prosjektflate på tvers av firma. Før prosjektarbeid/support velges riktig representert firma. For vareregister skal Systemadmin vise import/status/kontrolltall og være eneste sted for prisoppdatering.

Fase 42K krever Firma ved godkjenning av nye brukere og beskytter interne tilganger ved firmabytte.

Den samlede Systemadmin-flaten bygger fortsatt på enkelte legacy-brukerkort med nyere React-kontroller. Etter endring i firma, bruker, modul, arbeidsprofil, prisinnsyn eller Proff-leverandør skal alle projeksjonslag hente autoritativt snapshot på et felles ferdigsignal som sendes etter bekreftet serveroperasjon. Klikk-timere eller nettleserfokus skal ikke brukes som sannhetskilde for om en lagring er ferdig.

Felles e-post bruker `systemadmin-broadcast-email` og Resends batch-endepunkt med ett separat brev per mottaker. Nettleseren får bare mottakertall, aldri den samlede adresselisten eller Resend-nøkkelen. Serveren kontrollerer aktiv `systemadmin`-rolle, krever ny mottakerkontroll og testutsending før klienten tilbyr endelig sending, og bruker både kampanje-ID og Resend-idempotens for å hindre dobbeltutsending.

Datagrensen består av:

- `marketing_email_preferences`: gjeldende frivillig samtykke og serverbeskyttet avmeldingstoken
- `marketing_email_preference_events`: sporbar samtykke-/avmeldingshistorikk
- `systemadmin_email_campaigns`: auditstatus og tellere, uten direkte klienttilgang
- `get_my_marketing_email_preference` / `set_my_marketing_email_preference`: eneste autentiserte klientflate for eget e-postvalg
- `marketing-email-unsubscribe`: offentlig tokenbasert bekreftelse; GET viser valg og POST utfører avmelding

Driftsmelding er kun nødvendig tjenesteinformasjon. Nyheter, tips, tilbud og kampanjer er markedsføring og filtreres alltid mot aktivt samtykke, uansett hvilken brukergruppe Systemadmin velger.

## 16. HJELP

Digital Hjelp er gjeldende brukerveiledning og skal følge rolle.

Gjeldende sentrale temaer inkluderer:

- ordinær Befaring/Tilbud, Forespørsler-kø og recovery
- PC-fanebytte/mobil appbytte mens kundeinformasjon fylles ut
- Badskisse i befaring
- Butikktilbud som eget tema ved Befaring/Tilbud
- Proff vareregister, «Din nto pris», Generelt tilbud og Enkel ordre
- prosjektets kollapsede desktopmeny og hurtigvalg
- tilbudsposter og avsnitt
- vareregister som valgfritt oppslag
- montering/opsjoner
- autosave/recovery
- Systemadmin-ERP-import og sikkerhetsgrense
- arbeidsprofil/representert firma der rollen har flere firma
- brukerens frivillige e-postvalg og Systemadmins sikre skille mellom driftsmelding og markedsføring

Hjelp skal beskrive gjeldende funksjon, ikke historisk changelog.

## 17. Kritiske build-sperrer

`npm run build` kjører før Vite blant annet:

```text
scripts/critical-pr-scope-guard.mjs --self-test
scripts/critical-build-check.mjs
scripts/critical-systemadmin-broadcast-email-check.mjs
scripts/critical-bathroom-sketch-check.mjs
scripts/critical-sales-recovery-check.mjs
scripts/critical-sales-tab-resume-check.mjs
scripts/critical-sales-entry-resume-check.mjs
scripts/critical-sales-server-hydration-check.mjs
scripts/critical-sales-lazy-loading-check.mjs
scripts/critical-project-navigation-check.mjs
scripts/critical-progress-plan-check.mjs
scripts/critical-store-catalog-check.mjs
scripts/critical-work-profile-check.mjs
```

Disse beskytter kjente kontrakter som:

- Sales recovery og regelen «brukerhandling vinner»
- Ny/Rediger forespørsel ved PC-fanebytte og mobil appbytte
- Sales lazy loading og komplett detaljhydrering før editor
- befaringsmedia/Badskisse der dette inngår i recovery-testene
- prosjektets kollapsede desktopmeny/hurtigvalg
- fremdriftsplanens tilbudsimport/standardoperasjoner/kalender
- katalogsikkerhet og Butikktilbud-seksjonspresentasjon
- arbeidsprofiler, systemadmin-representasjon og 42G/42K prosjekt-scope
- PR-isolasjon slik at Demo/Test ikke samtidig endrer beskyttet appkjerne

Build-sperrer erstatter ikke Preview-test, men skal stoppe kjente regresjoner før deploy.

### 17.1 PR Core Safety

GitHub workflow `PR Core Safety` kjører på PR-er mot `main`. Dersom en PR inneholder Demo/Test-markører, skal den feile dersom samme diff også endrer beskyttet Sales-/app-/backendkjerne. Reell core-endring skal da splittes i egen PR fra ren `main`.

## 18. Preview-sikkerhet

Vercel Preview brukes for eksplisitt test før merge.

Prosjekt-/fremdriftsfunksjoner har egen Preview-sikkerhet som kan blokkere produksjonsmail/testdata der det er nødvendig.

Clean Fase 45B-Preview skal bindes eksplisitt til Sandbox Supabase `demo-sandbox`, aldri Production. Builden skal feile lukket ved feil branch-/miljøbinding. Preview-test bruker faste Sandbox-saker og skal ikke publisere eller sende e-post når kundepreview verifiseres.

`progressTest=safe` er Preview-sikkerhetsparameter og er ikke en del av endelig produksjonskundelenke.

### 18.1 Demo Sandbox er ikke ordinær Preview

Permanent Demo Sandbox bruker separat backend og er fysisk isolert fra Production. Den skal derfor ikke behandles som en tilfeldig Vercel Preview. Demo-builden har egen sandbox-binding, Golden/reset og fast branch-host.

Sandboxens migrasjonshistorikk inneholder en egen demo-/kursbaseline og er ikke samme lineære historikk som Production. `demo-sandbox` skal derfor aldri merges til Production gjennom Supabase branch-merge. Godkjente Production-migrasjoner kjøres fra den versjonerte, `main`-baserte releasekoden og verifiseres separat.

Før viktig demo skal preflight bekrefte:

- branch `demo`
- riktig permanent host
- sandbox-Supabase i emitted JS og ingen Production-binding
- fungerende `/demo-control.html`
- forventede demosaker/Golden
- kundetilbud før aksept og akseptert kundevisning
- rapport/PDF dersom dette skal vises

## 19. Databasestørrelse og store payloads

Etter full ERP-import var målt database rundt 348–356 MB og katalog rundt 283 MB.

Sales har enkelte store historiske JSON-payloads, blant annet inline/base64-bilder. Fase 42I løser listeytelsen ved lett summary/lazy loading uten å endre historiske payloads. Fremtidig opprydding kan flytte nye tunge bilder til Storage, men eksisterende historikk skal ikke migreres tilfeldig.

## 20. Frosne/sensitive områder

Endres bare eksplisitt og med egen QA:

- auth/login-presentasjon
- kompakt desktop header/menu og prosjektveiviser
- arbeidsprofil-/systemadmin-scoping
- publiserte/aksepterte tilbud
- aksepterte kontrakter
- offentlige kundelenker/private dokumentlenker
- RLS utenfor eksplisitt avtalt arbeid
- Edge Functions
- Fase 37A2 automatisk Butikktilbud-oppfølging
- Sales recovery/hydration/lazy loading
- Badskisse/bevaringen av befaringsmedia ved recovery
- permanent Demo Sandbox-isolasjon og main → demo-synkretning

## 21. Utsatt videreutvikling / observasjoner fra demo 16.09.2026

- forbedre kontraktfunksjonens finnbarhet etter akseptert ordinært tilbud
- kvalitetsløft av rapport/PDF, særlig forside/hero, bildeinnbygging, sjekklistetelling og dokumentasjonsgrad
- NOBB/Byggtjeneste-berikelse via GTIN
- ERP-vareliste/PDF etter aksept gruppert på leverandør
- CSV/Excel-varebehov
- målrettet Storage-opprydding for fremtidige Sales-bilder
- kontrollert oppgradering av eldre **redigerbare** tilbudsutkast til ny versjon; publisert/akseptert historikk forblir immutable
- komplett null-til-miljø databasebaseline/migrasjonskjede slik at nye isolerte miljøer kan bygges deterministisk

Disse skal gjennomføres som egne runder med samme Preview-/mergepolicy.

## 22. Før merge

Minimum:

1. Alle kritiske checks grønne.
2. Vite build grønn.
3. Preview `READY`, ingen fatale runtime-feil.
4. Ordinær Befaring/Tilbud-liste åpner raskt og viser korrekte tellere fra summary-data.
5. Åpne minst én større Sales-sak og bekreft at komplett tilbud/bilder/Badskisse lastes først ved åpning.
6. Ny forespørsel: skriv delvis kundeinfo → bytt PC-fane eller mobilapp → gå tilbake → samme skjema og tekst skal stå.
7. Rediger forespørsel: samme app-/fanebytte-test med eksisterende sak.
8. Prosjekt: kontroller veiviser/hurtigvalg og full Meny på desktop; mobilmeny skal være uendret.
9. Systemadmin: bytt mellom minst to representerte firma og bekreft at prosjektliste/åpning følger valgt firma.
10. Direkte prosjektlenke til annet firma skal ikke åpnes i feil representasjonskontekst.
11. Butikktilbud: redigering, autosave, Tilbake og kundepreview kontrollert ved relevante endringer.
12. Arkitektur og relevante README/HJELP-filer samsvarer med faktisk implementasjon.
13. `PR Core Safety` er grønn når PR-en går mot `main`.
14. Eksplisitt bruker-`TEST OK` før merge.
15. Etter merge: Production verifisert. Ved miljømål `BEGGE` synkroniseres deretter gjeldende `main` kontrollert til `demo`, og sandbox-preflight skal være grønn.
16. Fase 45B: ekstern bruker ser bare godkjente leverandører; sensitive interne prisfelt lekker ikke; «Din nto pris» følger eksplisitt bruker-/firmascope.
17. Fase 45B: kundepreview åpnes i ny fane, originalfanen står på samme tilbud, og preview kan ikke publisere, sende e-post eller akseptere.
18. Fase 45B: akseptert Generelt tilbud kan velges som Enkel ordre eller ordinært prosjekt; Enkel ordre blokkerer kundeportal og bruker låst akseptert snapshot.
19. Etter godkjent merge og trippel Production-QA ryddes midlertidige brancher. GitHub skal ende med `main` + `demo`; Supabase med Production/default + `demo-sandbox`.


### Cordel: importvalg og brukertilgang (05.10.2026)

Samme eksport beholdes for våtromstilbud og generelle tilbud. AFG kan importeres alene uten jobbliste, med ønsket ordremetode. Ved bruk av jobbliste må jobblistefilen importeres først, med tilsvarende jobblisteoppsett i Cordel, deretter AFG uten sletting. 0 % materiellpåslag og øreavrunding kreves for å beholde akseptert pris også ved AFG alene. Den bekreftede Cordel-testen gjelder den kombinerte flyten; AFG alene med andre metoder må kontrolleres hos mottaker. Prisposter er fortsatt Rundsum; faktisk timebudsjett og kildekost følger ikke med.

Systemadmin → bruker → **Eksport til Cordel** styrer tilbudseksport, plukklisteeksport og det spesifikke Hjelp-temaet samlet. Godkjent, aktiv Systemadmin har automatisk tilgang; andre brukere må få den eksplisitt. Firmaadmin kan ikke tildele den. Grantet bindes til brukerens firma; firmabytte krever ny tildeling. Eksisterende datatilgang og pristilganger gjelder i tillegg. `cordel_export_user_access` er RLS-beskyttet uten direkte klientrettigheter; avgrensede RPC-er leser egen tilgang og lar kun Systemadmin administrere. UI feiler lukket og sjekker tilgang på nytt før nedlasting.

## Firmaavgrensede kundeprofiler og tilbudets mva.-visning

Ny separat `company_customer_profiles` med serveravledet aktivt firmascope, godkjent profil/membership, RLS uten direkte klienttilgang og begrensede search/save RPC-er. Kunderegistrering er eksplisitt opt-in. Lagret profil kopieres ved bevisst valg til eksisterende kunde-/prosjektskjema; historiske prosjekter/tilbud er snapshots. Optimistisk revisjonsvern og expected-company guard beskytter samtidige endringer/profilbytte. Ingen automatisk import av tidligere kunder.

Avtalte integrasjonspunkter: SalesRequestForm og prosjektets kundedata i main.jsx. Endringen i main begrenses til én eksisterende kundedataflate; navigasjon/bootstrap/recovery røres ikke. Mva.-valg lagres med offer draft, og fryses som boolean `showPricesExVat` i eksisterende terms-metadata i versjonslinjene. Prisberegning og aksept er fortsatt eks. mva.; presentasjon velger multiplier 1 eller 1.25, inkl. store-alternativer som lagres inkl. mva. Public/accepted metadata har forrang fremfor kladd. Default for eldre versjoner er inkl. mva.

Mva.-valget i Generelt tilbud er integrert i `SalesStoreOfferBuilderGrouped` via eksisterende katalog/router-wrappere. Kladdforhåndsvisning bygger snapshot av nåværende formvalg; permanent render-QA verifiserer den faktiske routeren og begge prisvisninger.

CompanyCustomerProvider deler eksisterende firmascope, valgt profil og revisjonsvern mellom Search øverst og Save nederst i SalesRequestForm. Prosjekt bruker samme komponent sammensatt. Dropdown og søk bruker samme avgrensede RPC; maks 30 treff, presiserende søk finner øvrige kunder. Ingen endring i serverrettigheter eller automatisk lagring.
# KS/HMS – integrert domene, trinn A (2026-10-05)

Ny modul under `src/modules/kshms` kobles til eksisterende globale navigasjon og appens ene Supabase-klient. Eksisterende prosjekt-/salg-/rapportflyter beholdes. Miljømål er BEGGE; første feature-Preview bruker Sandbox. [Planen](../kshms/PLAN.md) fastsetter full dekning, gjeldende krav, gjenbruk, tilgang, personvern og resterende trinn.

Firmagrensen er `sales_company_scopes` med aktivt medlemskap, ikke legacy profil-/prosjektfirma. `company_module_access` utvides med `kshms`, mens `kshms_member_access` gir internt firmagrant. Systemadmin kan aktivere firma, men får ikke automatisk innholdsinnsyn. Firmaadmin utledes av aktivt medlemskap. Alle utsatte tabeller har RLS uten direkte API-privilegier; smale security-definer RPC-er med tom `search_path` utfører eksplisitt auth-, firma-, modul- og rollekontroll via ikke-eksponert `kshms_private`. Anonyme kall og direkte tabelltilgang avvises.

`kshms_settings` lagrer flerfaglig oppstart/utpekt ansvarlig/neste revisjon. `kshms_routines` har revisjonskontrollert kladd og arkiveringsstatus; `kshms_versions` lagrer uforanderlig publisert innhold, kildekontroll, godkjenner, tidspunkt og SHA-256. `kshms_assignments` og `kshms_acknowledgments` knytter bruker og nøyaktig versjon. `kshms_reviews` fryser gjeldende versjons-ID-er/hash og signert revisjonsnotat. Trigger hindrer omskriving av publiserte og signerte poster; minimal audit følger mutasjoner. Nye/vesentlige versjoner har egen bekreftelse; tidligere poster beholdes. Sentrale forslag tas manuelt felt for felt inn i kladd og krever ny firmagodkjenning.

React-komponenten beholdes montert ved vanlig appfanebytte; ordinær rutinekladd sikres lokalt per bruker/firma først ved faktisk redigering. Server leses før lokal gjenoppretting tilbys, og gjenoppretting er et bevisst valg med opprinnelig revisjonsnummer. KS/HMS følger eksisterende Sales `syncWorkProfileScope`-prinsipp: gjenpublisering av samme arbeidsfirma ved nettleserfokus beholder kontekst, montert visning og ulagrede felt. Et reelt profilbytte, manglende firmascope eller egen/uavgrenset administrert tilgangsendring nuller tilgang; gamle skrivekall får forventet firma og kan ikke krysse kontekst. Ingen egen authklient eller automatisk tom kladd skriver til server. Lokalt innhold er bare felles håndboktekst; individuelle HR-data er utenfor denne komponenten.

Trinn A har ingen filopplasting, betalingssystem, eksterne utsendinger eller individuelle personaldokumenter. Eksisterende offentlige bilde-buckets skal ikke brukes for senere sensitive KS/HR-filer. B/C/D bygger versjonerte maler/gjennomføringer/SJA/risiko, én samlet avvikssentral, varsler/PDF/avgrenset deling og separate HR-/SDS-domener. [Dekningsoversikten](../kshms/COVERAGE.md) beholder alle originale temaer, også VVS og historisk stoff. Årlig revisjon og 5×5 er produktvalg, ikke en generell lovpåstand.

Firmaadmin kan utpeke seg selv eller en annen aktiv firmaadmin som KS/HMS-ansvarlig uten en ekstra modultildeling. Andre interne medarbeidere krever fortsatt aktivt `responsible`-grant. Serverens `responsible`-rettighet krever eksakt utpeking i gjeldende firmas oppstart; adminstatus alene gir ikke revisjonssignering. `20261005212145_kshms_firmaadmin_appointment.sql` oppdaterer kun disse eksisterende funksjonene, uten nye tabeller eller automatisk grant/aktivering.

`KshmsRoutineLibrary` skiller avkrysning/lesing av standardutkast fra faktisk innlegging og redigering. Valgte kildenøkler ligger i modulens eksisterende monterte arbeidsflate; filter- og fanebytte åpner ikke en ny editor. «Disse rutinene legges inn» viser hele utvalget. `addLibraryRoutines` leser fersk firma-/rollekontrollert serverstate og bruker eksisterende `kshms_command/save` for hver manglende aktiv `source_key`. Ingen ny tabell, tilgangsmodell eller parallell rutineflyt innføres. Historikk og selskapets tilpasninger beholdes. Kopiering er fortsatt en eksplisitt separat handling.

Innleggingen er flere enkeltlagringer, ikke en atomisk transaksjon. Ved delvis nettfeil leses serveren igjen; bekreftede rutiner vises som lagrede utkast, mens resten forblir valgt for nytt forsøk. Fersk lesing før retry håndterer også tapt svar etter faktisk lagring. Modulen stopper videre kommandoer og UI-oppdateringer når arbeidsflaten unmountes eller dens tilgangskontekst endres. Dette er ikke en generell servergaranti mot samtidige innlegginger fra to administratorer. Innlegging beholder en åpen ulagret editor og publiserer eller tildeler ikke rutinene; eksisterende godkjennings-/versjonsflyt gjelder. Faneretur bruker den tidligere Sales-baserte rettelsen uten ny recovery-mekanisme.

Brukerveiledningen i de fire fanene og i redigering/godkjenning bruker korte handlingsbeskrivelser og angir neste steg. Begrepene utkast, versjon og revisjon forklares; feltets skrivehjelp knyttes til input med eksisterende `aria-describedby`. Backend-verdier, roller, rutineinnhold og selve signatur-/bekreftelsesgrunnlaget endres ikke av språkforenklingen. Hjelp bruker samme handlings- og knappnavn. `USER_TEST.md` og AGENTS fastsetter konkret handling/forventet resultat ved videre leveranser.

Vanlig brukerprøve følger én fast branch-alias hos Vercel. Nye deployer erstatter kode bak samme origin; appens registrerte Supabase-klient beholder eksisterende auth-oppsett med `persistSession` og tokenoppfriskning. En annen host/nettleser har ikke automatisk samme lokale økt. Den innloggede øktens varighet er ikke verifisert av syntetisk komponent-QA, og det innføres ingen deling av authdata mellom Preview-domener.

Godkjenningsåpning følger editorens eksisterende eksplisitte fokus-/scroll-prinsipp med ref og handlingsnummer. Hvert klikk på **Åpne godkjenning** viser riktig panel, også når samme rutine allerede er valgt. Samme rutine beholder vurderingsteksten; en annen rutine starter med tom vurdering. Selve publiseringen bruker uendret `kshms_command/publish`, forventet rutinerevisjon og eksisterende krav om minst fem tegn. Manglende vurdering, fremdrift og serverfeil vises ved panelet. Etter bekreftet publisering åpnes neste gjenstående godkjenning med tom vurdering; etter den siste fokuseres fullføringskortet nederst. Fokusrettelsen endrer ikke auth, global navigasjon eller signeringsgrunnlaget. Rolleendringen beskrevet nedenfor er en separat, uttrykkelig produkteierbeslutning.

Rollebeslutning 2026-10-06: `context.publish` gjelder firmaadmin eller aktivt internt `responsible`-grant. Ny serveravledet `context.administer` gjelder bare firmaadmin. `kshms_command` krever publish for publisering og administer for ansattes grant/arkivering; utpeking i oppstart krever fortsatt administer. Oppfølging/tildeling til allerede kvalifiserte interne medarbeidere følger eksisterende manage-rettighet. Revisjonssignering krever eksakt utpeking. Migrasjonen `20261005225124_kshms_responsible_publication.sql` oppdaterer bare eksisterende funksjoner og er først anvendt på Sandbox. Tabellenes ACL/RLS, signerte poster, aktive firmaskope, UE-avslag og betalt modulgate beholdes. Ansattens initiale KS/HMS-visning er reading, uten managerverktøy eller andre ansattes status.

## Veiledet håndbokflyt (2026-10-06)

Første manager-visning uten lagret oppstart er setup; med lagret oppstart er den handbook. Initialisering skjer én gang per firmabundet mount, uten ny fokus-/auth-/recovery-mekanisme. Oppstart har utpeking først og tilbyr alle interne, godkjente, ikke-deaktiverte medlemmer fra eksisterende manager-RPC. Firmaadminens lagring setter ved behov eksisterende `kshms_command/access` til responsible før `settings`. Ved settings-feil beholdes lokalt oppsett og det forklares at granten kan være gitt. Tilgangsevent sendes etter vellykket lagret oppstart. Ingen ny tabell, funksjonsmigrasjon eller serverrettighet innføres.

`routineApprovalState` sammenlikner lagret kladd med høyeste publiserte rutineversjon. JSON-objektenes nøkkelrekkefølge normaliseres; tekst, arrayrekkefølge og referanser er betydningsfulle. Dette er kun UI-status, ikke en erstatning for serverens hash/signaturkontroll. `handbookProgress` utleder oppstart → valg → gjenstående godkjenninger → ansattes gjennomgang fra serverstate. Arkiverte rutiner inngår ikke i antallet. En trukket ansvarlig-grant gjør oppstart ufullført. Ulagret editor stopper neste/publisering. Etter lagret endring åpnes eksisterende godkjenningspanel; uendret lagring krever ingen ny versjon i UI.

Firmaets rutiner er hovedlisten, og biblioteket ligger under «Legg til flere rutiner». Lagrede bibliotekrutiner har tekststatus og redigeringsknapp, uten avkrysning som kan forveksles med godkjenning. Neste-knapper bruker samme ref-/fokus-/scroll-prinsipp som redigering og godkjenning. Når alle valgte aktive rutiner er godkjent, vises «Neste: Ansattes gjennomgang» både øverst og nederst og åpner eksisterende oppfølging. Det gjelder også håndbøker som allerede var fullført før oppdateringen. Publisering tildeler til allerede kvalifiserte brukere; nyansatte kan få eksisterende versjoner med assign etter at firmaadmin har gitt tilgang. Ingen varsler eller e-post simuleres som sendt.

Automatisk fremdrift bruker fersk, autorisert state fra den eksisterende `run`-handlingens kommando og påfølgende `load`. En valgfri `onSaved`-callback endrer ikke eksisterende returverdier eller legger til serverkall. Samme aktive request-scope, firma og identitet må fortsatt gjelde; publisering krever fortsatt publish-rettighet. Neste godkjenning utledes av `handbookProgress`; neste lesing av `pendingReadingVersions`, kun egne tildelinger og egne eksakte bekreftelser. Informasjonsutgaver uten krav om ny bekreftelse åpnes ikke automatisk. Egen bekreftelse må finnes i den oppfriskede staten før fremdrift. Feil i kommando eller kontrolllesing beholder panel, vurdering eller avkrysning. Søket tømmes bare hvis det skjuler neste rutine. Ingen handler setter appfane etter et avventende kall; bevisst navigasjon og scopebytte vinner fortsatt.

`KshmsHandbookProgress` deler tekst, fremdrift og knapp mellom topp og bunn, uten duplisert liveannonsering. Godkjenningspanelet fjernes etter siste lagrede godkjenning. Lesepanelet har samme handlingsstyrte ref-/focus-/scroll-prinsipp; neste utgave starter med avslått avkrysning, og siste egen bekreftelse gir et fokusert «Du er ferdig med gjennomgangen»-kort. Hvert klikk publiserer eller bekrefter bare én rutineutgave med uendret identitet, ACK-tekst og versjonsgrunnlag. Ingen generell recovery, automatisk bekreftelse, database- eller tilgangsendring innføres.

Demomedarbeiderne for Expo Proffsenter er rene Sandbox-fixtures i eksisterende auth/profil/medlemsstruktur, med `.invalid`-adresser og ingen automatiske KS-grant. Seed, UI-harness og demo-overlay inngår ikke i feature/main-PR.

## Kompakt oppfølging per medarbeider (2026-10-06)

`kshmsFollowup` utleder oppfølging fra eksisterende, autorisert firmastate, bare når `context.manage` gjelder. `acknowledgmentOverview` grupperer tildelte påkrevde utgaver per bruker og kobler bekreftelser med eksakt bruker-/versjonspar. Første utgave og senere `requires_ack` følger eksisterende krav; informasjonsutgaver, ukjente versjoner og duplikatpar øker ikke antallet. Bekreftede utgaver med tidspunkt og ferdige medarbeidere beholdes. Map/Set-oppslag erstatter gjentatte søk uten ekstra serverlesing eller skriving.

`KshmsAcknowledgments` viser fremdrift, lokalt søk og native details per medarbeider. Komponenten har ingen bekreftelses- eller signeringshandling. `pendingAssignmentOptions` beholder eksisterende kvalifisering (aktiv modultilgang eller firmaadmin), men viser bare gjeldende utgaver som minst én kvalifisert bruker mangler. Eksisterende `assign`-kommando, busy-vern og tilgangskontroll brukes uendret; funksjonen gir ingen tilgang.

Ny tildeling og revisjon ligger i separate native details. Revisjonens eksisterende feltstate forblir montert og beholdes ved lukking/åpning og samme firmas faneretur. Dato, utpeking, signaturtekst, snapshot og revisjonspayload er uendret. Ansattes gjennomgang er neste steg etter publisering; revisjon innfører ingen ekstra fremdriftsport. Ingen auth-, nav-, database-, Storage-, rolle- eller betalt-tilgangsendring.

## Tekstforslag, søk og målrettet tilgangsoppdatering (2026-10-06)

`publishManagedAccessChange` har allerede source/userId/companyId. KS/HMS sender nå målmedlem og firma ved grantendring. `useKshmsAccess` beholder den monterte arbeidsflaten når hendelsen gjelder en annen bruker og sjekker serveren i bakgrunnen; egen eller uavgrenset hendelse nuller kontekst umiddelbart. Revision/racevern, feilavslag, reelt firmabytte og auth-identitetskontroll beholdes. Ingen ny global event, authklient eller recoverymekanisme.

`kshmsWriting` skiller redigerbar tekst fra rene UI-tips. Server leses først. Bare blanke oppstartsfelt fylles lokalt, og et ref-sett markerer urørte forslag som kan følge fagvalget. Egen redigering eller bevisst tømming tar feltet ut av settet; ikke-blank servertekst eies aldri av forslaget. Lagret settings tømmer settet. Ingen effekt skriver til server. Generell rutine med tekstforslag og eksisterende helt blank mal er separate bevisste valg. Tips kopieres aldri inn i draft/version; Content viser bare de eksisterende innholdsfeltene og referansene. Publiserte utgaver, hash og eksakte bekreftelser endres ikke ved sentral tekstoppdatering.

`kshmsSearch` filtrerer bare eksisterende autorisert state, med Unicode-/ordnormalisering og indeksert gruppering av versjoner. Manager kan finne kladd og gjeldende publisert tekst; ansatt får bare egne tildelte utgaver, aldri draft eller andres utgaver. Søk i katalogen beholder hele flervalget. Ingen nye serverkall, tabellprivilegier, HR-data eller firmabypass. Stor historikk må senere få smale lesemodeller, serverfiltrering og cursorpaginering, jf. [CAPACITY](../kshms/CAPACITY.md).

[Innholdsstatus](../kshms/CONTENT_STATUS.md) registrerer alle 125 kildereferanser. Dagens 12 utkast er delvis tekstgrunnlag og beviser ikke full innholdsdekning. A2 prioriterer full forfatting/kildevalidering. [PLAN](../kshms/PLAN.md) fastsetter B/C-avvik som en utvidelse av eksisterende sentral med intern aktiv bruker-ID, rettingsansvar/saksbehandling/kontrollert lukking, outbox/appoppgaver og entitlement ved hver levering. Tilsynseksport bruker manifest med eksakte versjoner og relevant utførelsesbevis. Support krever firmagodkjent, avgrenset, tidsbegrenset servergrant/audit; administrativ aktivering innebærer ikke innsyn, HR eller signering som annen bruker. Disse operative delene er fortsatt roadmap.


## Min personalhåndbok og eksplisitt egen gjennomgang (2026-10-06)

`KshmsPersonalHandbook` bruker eksisterende autorisert `get_state`, `Content` og firmabundet montert modul. `personalHandbook` filtrerer først egne eksakte assignment-par, også når managerens respons inneholder hele firmaet. Bare publiserte, tildelte utgaver fra riktig firma inngår; ingen managerkladd eller andres bekreftelser. Rutiner grupperes med siste tildelte utgave øverst, tidligere tildelte utgaver og eget tidspunkt som oppslagshistorikk. Bekreftelse fjerner ikke rutinen. Søket ligger i modulens eksisterende state og bevares ved samme firmas faneretur. En leser har personaloppslag og eksisterende Les og bekreft, uten managerfaner. Firmaadmin har samme personlige oppslag for egne tildelinger.

`KshmsVersionIdentity` viser firmagodkjenner og egen gjennomgang hver for seg med eksisterende aktør-ID, tidspunkt og eksakt utgave. `20261006141916_kshms_personal_handbook_identity.sql` legger til nullable `publisher_identity` på versjoner og `user_identity` på bekreftelser. Nye handlinger får et serveravledet, uforanderlig snapshot av bruker-ID, registrert navn og canonical auth-e-post (`source: account_at_action`). Navn fra kontometadata er en visningsetikett; tillatelse og faktisk aktør bestemmes fortsatt av `auth.uid()`, aktiv godkjent profil, internt firmamedlemskap, riktig arbeidsfirma, modulaktivering og eksisterende roller. Klientens navn, bruker-ID og tidspunkt kan ikke erstatte signeringsaktøren.

Den private security-invoker-helperen `identity_snapshot` har tom search_path og ingen PUBLIC/anon/authenticated-execute. Bare de eksisterende, autoriserte security-definer-RPC-ene bruker den. Leserresponsen inneholder nødvendige etiketter for godkjenneren på egne tildelte utgaver og egen bekreftelse, ikke en generell ansattliste eller full auth-metadata. Managerens eksisterende medlemsliste får et navn. Eksisterende poster backfilles aldri; get_state kan vise dagens kontonavn (`source: current_account`) for gamle null-snapshot, mens original bruker-ID, innhold, hash, tidspunkt og bekreftelse står urørt. Et nåværende kontonavn er ikke dokumentasjon på hvilket navn kontoen hadde ved den gamle handlingen. Nye snapshot beholder navnet ved senere kontoendring. Dette er minimal gjennomgangsidentitet, ikke individuell HR-data.

Publiseringspanelets valg om tidspunkt for egen bekreftelse sender `acknowledge_self: true` og eksakt eksisterende `ACK_STATEMENT` bare etter uttrykkelig egen avkrysning. Serverens eksisterende publish-kommando validerer boolsk valg og tekst før versjon opprettes. Firmagodkjenning, vanlige kvalifiserte tildelinger, egen versjonsbundet bekreftelse og audit lagres i samme transaksjon under eksisterende firma-/rutinesperrer. Manglende/ugyldig tekst avviser hele handlingen. Uten valget opprettes ingen egen bekreftelse. Bare innlogget publiserer får egen bekreftelse; andre ansatte må bekrefte selv. Både firmaadmin og aktiv KS/HMS-ansvarlig følger samme publish-rettighet.

Klienten kontrollerer både ny publisert utgave og eventuell egen bekreftelse i fersk state før den viser fullført eller går videre. Feil beholder vurdering og avkrysning, mens neste rutine starter uten egen avkrysning. Gamle bekreftelser og godkjenninger omskrives ikke; samme nye utgave trenger ingen ny egen bekreftelse. Egen bekreftelse uten publisering bruker fortsatt samme ack-kommando med eksakt statement og serveridentitet. ACL/RLS, aktivering, tilbakekallings-/scopevern, UE-avslag, versjonsimmutasjon og revisjonsregler består. Migrasjonen er anvendt bare på Sandbox; Production krever egen godkjenning. Ingen Storage-, betalings- eller e-postendring.

Felles HR-rutiner kan vises i personaloppslaget. Individuelle medarbeidersamtaler, kompetanse og oppfølging følger senere separat HR-domene/ACL/oppbevaringsvurdering; de innføres ikke som nye felles rutinefelt eller automatisk innsyn for KS-/firmaadminrollen.


Avklaring 2026-10-06 kl. 18:56 Europe/Oslo: Det er påkrevd å lese/bekrefte tildelte rutiner før arbeid etter firmaets arbeidsregel, også for firmaadmin/KS-HMS-ansvarlig. Valget i publiseringspanelet gjelder bare når egen påkrevd bekreftelse utføres. Uten samlet bekreftelse beholdes krav og manglende-status i Les og bekreft. Denne tekstpresiseringen endrer ingen handlers, requires_ack, personlige signeringskrav, RPC/RLS eller historiske poster. Regelen er et firmakrav, ikke en generell lovpåstand om signatur. Ledelsen følger opp etterlevelsen; A har ingen automatisk sperre av prosjektarbeid eller andre appmoduler. Et senere teknisk arbeidsadgangsvilkår må avgrenses eksplisitt mot arbeid, firma, aktivitet og tilgang før eksisterende prosjektflyter endres.

## A2: rutinebibliotek og serverstyrt Avvikssentral

A2 oppdatert 6. oktober 2026: Biblioteket har 73 egne forslag med sporbar dekning av alle 121 innholdstemaer + fire metadatarader fra kvalitetshåndboken (148 sider) og personalhåndboken (127 sider). Avvikssentral gir ansvarlig/frister, åpne/lukkede saker, tiltak/egen kontroll, private vedlegg og hendelseshistorikk. Bare valgt ansvarlig får fast varsel i interne faner og lukker selv. Prosjekt-/sjekkpunktavvik som kobles inn har serverbeskyttet status; ukoblet legacy-flyt består. 73 Sandbox-kontroller PASS med rollback; ingen ekte e-post eller produksjonsendring. Full-app-brukerprøve og e-postmottak gjenstår. Sandbox mangler RESEND_API_KEY og CHAT_FROM_EMAIL; utsending er derfor deaktivert. Gammel TEST OK for 6dfb74d dekker håndbokversjonen, ikke A2.

kshmsExtendedCatalog utvider 12 stabile nøkler til 73 forslag med egen fagtekst, kildetype/kontroll-dato og aktivitetstilpasset anbefaling. De ti grunnforslagene beholdes. Sentralt forslag omskriver aldri firmaets draft/version/ack; nye forslag legges bevisst inn som firmakladder. coverage.json/CSV og CONTENT_STATUS beholder alle kildesider og synlig samling/historisk håndtering.

KshmsDeviations leser status/søk/cursor, case/events og private vedlegg via smale RPC-er. Ordinary reader ser bare meldt/tildelt sak; manager ser firmaets saker. Hver handling krever aktivt modul/firma/medlemskap og kvalifisert intern ansvarlig. Bare aktuell ansvarlig kan lukke med dokumentert årsak/tiltak/egen kontroll og controlled=true. Firmaadmin kan omfordele/gjenåpne, ikke lukke en annens sak. Revisjoner hindrer stille overskriving; låseorden modul → prosjekt → case beskytter mot samtidige grant/statusendringer. Opprettelse har stabil request-ID. Uforanderlige events og identitet/snapshot følger handlingene.

Klienten installerer lukket case først etter command + fersk kontrollert detail. Feil beholder form/avkrysning, scopebundet lokal kladd og sist bekreftet oppgave. Cache valideres på user+firma, felttyper/revisjon/tid og sju dagers utløp. Serial/current-vern stopper sene lesinger. Vedlegg reserveres, lastes opp i privat bucket og vises etter kontrollert metadata-commit. Retry kan oppdage tapt opplastings-/commit-svar. Signerte leselenker varer 60 sekunder. Uferdig valgt vedlegg blokkerer lukking.

KshmsTasks monteres under eksisterende intern navigasjon med den samme verifiserte KS/HMS-konteksten og registrerte Supabase-klienten. Den leser kun auth-brukerens aktuelle åpne ansvar. Focus/visibility og 30 sekunders synlig polling oppfrisker; lesing skriver ingenting. Nettverksfeil beholder bekreftede tasks, 42501 rydder. Bekreftet case-event oppfrisker oppgaver og smal prosjekt-/sjekkpunktprojeksjon. Oppgavehopp følger eksisterende goToTab og respekterer avbrutt leave-confirm. goToTab returnerer boolsk resultat, uten ny recovery/autosave/hydrering.

Legacy-kobling krever lagret ulåst kilde; main stopper ved dirty/ventende/feilet prosjekt-/sjekkpunktlagring. Servertrigger håndhever koblet status og hindrer fjerning/omgåelse ved annen project-UPDATE. Klientkort tilbyr Åpne i KS/HMS på koblet case. Andre avvik og prosjektfelter beholder eksisterende flyt.

Outbox er unik per case/tildelingsnummer og opprettes atomisk med tildeling/gjenåpning. Privat postgres-cron → pg_net → Edge Function bruker et egen-generert Vault-token; cron-tekst har ikke hemmeligheter. Worker/service-RPC kontrollerer token/enabled, active membership/grant/ansvar/status og mottaker på hvert forsøk. Forsøksnummer fencer validate/finish; stabil Resend-idempotens/body gir retry uten ny oppgave. Etter ti forsøk/23 timer markeres failed. E-posten inneholder ikke sakstittel/hendelse/tiltak/vedlegg.

Hosted pg_net er eid av supabase_admin. REVOKE-forsøket i 20261006201244_kshms_worker_transport_privacy.sql hadde ingen effekt; dette er en verifisert plattformbegrensning, ikke oppnådd tabell-ACL-vern. Ingen bred rolle-/API-endring er gjort. Anon/authenticated er NOLOGIN, og net må holdes utenfor Data API. Worker v3 verifiserer faktisk schema-avslag (HTTP 406/PGRST106, null rader) før den behandler mail. Manglende/feilet eksponeringskontroll stopper sending. Databasetesten beskytter NOLOGIN, privat worker/settings og nødvendig postgres-cron-tilgang. Kun betrodde tjenester får direkte SQL-innlogging. Kildene er Supabases offisielle pg_net-/troubleshooting-dokumentasjon.

Autentisert helsekontroll på Sandbox: transport_safe=true, begge e-posthemmeligheter false. enabled er false. Appoppgaver virker uavhengig av e-postoppsettet. Se EMAIL_SETUP. Ingen Production-migrering, main-merge eller demo-synk. Tidligere sections er kontrollhistorikk for håndbokdelen.


## Prosjektsjekklistegjennomføringer – Preview 07.10.2026

ProjectChecklistWorkspace bruker eksisterende React-eide DeviationDialog og ChecklistEditor. Kladdnøkkel avgrenses av bruker, firma, prosjekt og kategori; Lagre/Fullført går gjennom project_checklist_command og kontrollert project_checklist_state-readback. Private project_checklist_runs har én kladd per kategori, revisjonskontroll, identitetssnapshot og uforanderlige fullføringer. project_checklist_receipts sikrer samme gjenforsøk etter tapt svar. Prosjektlåsen, aktivt firma, godkjent internt medlemskap og eksisterende prosjektrett kontrolleres server-side; egen KS/HMS-grant er ikke et krav for utfylling. Innlagte firmamaler beholder eksakt kildeutgave/krav. Projektsvarenes speil vernes mot forsinket vanlig autosave; eksisterende KS/HMS-avviksprojeksjon beholder autoritativ status. SQL- og React-kontroller samt faktisk desktopflyt er dokumentert i KS/HMS QA/CONTINUITY. Ingen produksjonsmigrering eller merge er utført.
