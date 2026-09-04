# Expo ProffDok – arkitekturkart

**Fase:** 35C – fremdriftskalender + PDF-vedlegg  
**Status:** Feature branch / Preview-QA – ikke merget  
**Dato:** 04.09.2026  
**Produksjonsbaseline ved oppstart:** `main` på `4d6fe8b2f8ebf6d09ac47f79683ea453e6e38878`  
**Supabase:** `dqffxflaoyarbxyiyhop`

Dette kartet beskriver gjeldende arkitektur og sikkerhets-/bakoverkompatibilitetskrav som må bevares. Historiske detaljer finnes i Git.

## 1. Styrende prinsipper

1. `main` er kilde til sannhet for produksjonskode.
2. Produksjon beskyttes foran alt: feature-branch → Vercel Preview → eksplisitt `TEST OK` → merge → verifiser eksakt Production-SHA, HTTP/runtime og relevant Supabase-status.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang eller siste autoritative validering.
4. Publiserte tilbud, aksepterte tilbudsversjoner, signerte kontrakter og utstedte garantier er historikk og skal ikke overskrives vilkårlig.
5. Prosjekt kan opprettes og eksistere uten tilbud og uten kontrakt.
6. Kontrakt er bare obligatorisk når dokumentert tetthetsgaranti faktisk skal utstedes.
7. Privatkundeorienterte priser vises inkl. mva.
8. Ingen historisk backfill uten eksplisitt beslutning.
9. Supportmodus er ikke skrive-bypass og skal ikke registrere systemadmin som feil oppretter, ansvarlig eller signatar.
10. Sales recovery/hydration og IndexedDB-sikring av befaringsbilder er kritiske kontrakter.
11. Historiske Storage-paths/URL-er flyttes ikke spontant.
12. Modulisering gjøres bare ved naturlige ansvargrenser som gir reell oversikt eller mindre risiko.
13. Brukerrettede endringer oppdaterer HJELP samme runde.
14. Fremdriftsplan er operativ prosjektdata og skal aldri endre låst tilbuds-/aksepthistorikk.
15. Vercel Preview skal være trygg testmodus for Fremdrift/Prosjektinvolverte og skal aldri sende ekte prosjektmail eller skrive 35B/35C-testdata til produksjon.
16. Kalender- og PDF-eksport skal alltid lese lagret fremdriftsdata; eksport skal ikke bli en ny sannhetskilde.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti, fremdriftsplan, prosjektinvolverte og produktdata |
| Serverlogikk | Supabase RPC/trigger/RLS | Firmascoping, validering, låsing, portalfiltrering og dokumentkobling |
| Filer | Supabase Storage | Bilder og private/offentlige dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, aksept, kontrakt, portal, chat og prosjektmeldinger |
| Hosting | Vercel | Preview og Production |
| PDF | jsPDF + nettleserutskrift + `pdf-lib` i Edge Function | Rapport/tilbud/garanti/kontrakt, Fremdrift-utskrift og servergenerert fremdriftsvedlegg |
| Kalender | standard `.ics` | Enveis eksport av daterte fremdriftsøkter til kalenderprogram |

Produksjon: `https://expo-proffdok.app`

## 3. Prosjekt og Avtalegrunnlag

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Den synlige fanen heter **Avtalegrunnlag**, mens intern nøkkel fortsatt er `tilbud` / `data.tilbud` for bakoverkompatibilitet.

Vanlige prosjektveier:

```text
A) Direkte prosjekt uten tilbud
B) Akseptert tilbud → prosjekt uten kontrakt
C) Akseptert tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert tilbud → Expo-kontrakt → prosjekt
```

Avtalegrunnlag kan inneholde akseptert tilbud/akseptbevis, signert Expo-kontrakt, bedriftens egen kontrakt, andre avtaledokumenter og senere tillegg/fradrag.

## 4. Sales – tilbud, aksept og kontrakt

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ akseptbekreftelse
→ valgfritt kontrakt/prosjekt
```

Kritiske Sales-kontrakter:

- tom/uhydrert tilbudskladd skal aldri overskrive nyere serverdata
- recovery skal fungere ved reload, dvale og appbytte
- befaringsbilder beholder IndexedDB/Storage-flyt
- publiserte/aksepterte tilbudsversjoner er immutable snapshots
- kundeaksept knyttes til eksakt versjon og valgte opsjoner
- `critical-sales-recovery-check.mjs` er obligatorisk del av build

## 5. Fase 35A – operativ fremdriftsplan

Fremdriftsplanen har egen lagring i `public.project_progress_plans` og ligger **ikke** inne i `projects.data`. Dette hindrer at vanlig prosjektlagring overskriver arbeidsøkter eller kundedelingsvalget.

```text
projects.id
  1 ── 1 project_progress_plans.project_id
```

Viktige felt:

```text
project_id         prosjektets id / primærnøkkel
company_scope_id   firmascope kontrollert fra prosjektet
customer_visible   false som standard
plan               JSON med versjon, aktiviteter og arbeidsøkter
created_by / updated_by + tidsstempel
```

En aktivitet kan ha valgfritt antall arbeidsøkter. Hver økt har dato, fra-/til-tid og merknad. Aktiviteten har blant annet arbeidsoperasjon, fag, person/firma og status.

### Tilgang

RLS er aktivert på `project_progress_plans`. Intern lesing/skriving krever gyldig prosjekt-/firmatilknytning. Kunde og UE får planen gjennom serververifisert portalgrunnlag, ikke direkte tabelltilgang.

```text
intern bruker med prosjekttilgang
  → kan arbeide med planen når prosjektet ikke er låst

UE med gyldig UE-kode
  → read-only fremdriftsplan

kunde med gyldig kundekode
  → får planen bare når customer_visible = true
```

Låst prosjekt viser planen som historikk og skal ikke redigeres i vanlig brukerflyt.

### Akseptert tilbud som forslag – aldri som ny sannhet

Et prosjekt med Sales-opphav kan lese eksakt akseptert tilbudsgrunnlag og valgte opsjoner og omforme dem til forslag til arbeidsoperasjoner.

```text
låst akseptert tilbud + valgte opsjoner
  → leses
  → grupperes
  → kopieres som redigerbare forslag

fremdriftsplan
  ✕ endrer ikke tilbud
  ✕ endrer ikke aksept
  ✕ endrer ikke kontrakt
```

Direkte opprettede prosjekter uten Sales-opphav kan bygge planen manuelt og er like gyldige.

### Brukerflyt

Desktop bruker ukeoversikt. Mobil bruker enklere aktivitetskort. Dirty-state er koblet til sentral guard mot å forlate ulagrede endringer. Fremdrift er isolert mot unødvendige parent-rerenderinger fra hovedprosjektets autolagring slik at pågående redigering ikke remountes.

Ved både **standard arbeidsoperasjon** og **+ Egen arbeidsoperasjon** opprettes første økt automatisk i synlig/valgt uke med standardtid `08:00–16:00`; brukeren kan endre dette og legge til flere økter. Minst én datofestet økt kreves for at aktiviteten skal vises i Gantt.

### Modulansvar

- `src/modules/progress/progressPlanUx.jsx` – stabil inngang, Preview-sikkerhet, eksport/deling/kalender og prosjektfane.
- `src/modules/progress/progressPlanUxV2.jsx` – arbeidsflate, ukevisning, mobil, redigering, dirty-state og read-only portalvisning.
- `src/modules/progress/progressPlanSupabase.js` – data-/portalbro, separat planlagring og tilbudslesing.
- `src/modules/progress/progressPlanOfferCore.js` – enveistransformasjon fra akseptert tilbud til arbeidsoperasjoner.
- `src/modules/progress/progressPlanCalendarExport.js` – ren bygging og nedlasting av `.ics` fra lagret plan.
- `src/modules/progress/progressPlanCalendarAction.jsx` – liten UI-handling for kalender-eksport.
- `src/main.jsx` – eier intern Fremdrift-fane, prosjekt-/fane-URL og sentral ulagret-guard.
- `scripts/critical-progress-plan-check.mjs` – permanent QA av tilbudsimport, 13 standard arbeidsoperasjoner, første økt og kalenderformat.

Ingen historiske prosjekter backfilles. Plan opprettes først når brukeren faktisk lagrer fremdriftsplanen.

## 6. Fase 35B – eksport, deling og prosjektinvolverte

### Gantt / PDF

Eksport leser bare den lagrede fremdriftsplanen. Den skriver ikke tilbake til Sales, tilbud, aksept eller kontrakt.

Prosjektuker beregnes dynamisk fra første til siste **datofestede arbeidsøkt**:

- første berørte kalenderuke blir **Prosjektuke 1**
- deretter Prosjektuke 2, 3 osv. uten fast øvre grense
- kalenderuke og datointervall vises under prosjektuken
- flere økter på samme aktivitet i samme uke vises med hver sin dato og klokkeslett
- lange planer deles i seksjoner på maksimalt 8 prosjektuker per Gantt-del

Utskriftsvisningen er A4 liggende og inneholder firma/prosjekt, kunde, periode, antall prosjektuker, planoversikt og Gantt. **Lagre som PDF** åpner nettleserens utskriftsdialog, der brukeren velger «Lagre som PDF». Korte planer komprimeres for å unngå unødvendige ekstrasider.

35B etablerte prosjektmelding/oppsummering til valgte Prosjektmail-mottakere og henvisning til siste plan i Expo ProffDok. 35C utvider denne flyten med servergenerert PDF-vedlegg og kalender-eksport.

Aktiv eksportkode:

- `src/modules/progress/progressPlanExportV3.jsx`
- `src/modules/progress/progressPlanExportV3.css`
- `src/modules/progress/progressPlanExport.css`

Midlertidige V1/V2-eksportvarianter fra utviklingen er fjernet.

### Prosjektinvolverte

Prosjektinvolverte finnes bare når prosjektet faktisk er opprettet og har `projectId`. Et helt nytt, ulagret prosjekt viser ikke seksjonen.

Aktiv klientmodul:

- `src/modules/project/projectParticipantsUxV3.jsx`
- `src/modules/project/projectParticipants.css`

Felter per person:

```text
navn
firma
rolle
email
telefon
receive_email / Prosjektmail
```

Arbeidsflyt:

- **+ Legg til** oppretter ny rad
- Enter i utfylt rad oppretter neste tomme rad
- helt tom ekstrarad lagres ikke
- endringer gir tydelig sticky **Lagre prosjektinvolverte**
- fanebytte/prosjektbytte/refresh varsler om ulagrede endringer
- panelet bruker stabil root og skal ikke remountes mens brukeren skriver

### Datamodell og sikkerhet

35B bruker:

```text
public.project_participants
public.project_participant_notices
```

Begge tabeller har prosjekt-/tilgangsbasert RLS. Produksjonsmigrasjoner:

```text
20260904172250  fase35b_project_participants_and_notices
20260904191815  fase35b_participant_notice_read_only_update
```

Den siste migrasjonen begrenser `authenticated` til kun å kunne oppdatere `read_at` på prosjektvarsler. Mottaker kan dermed markere varsel som lest, men kan ikke endre varselets prosjekt, mottaker, emne eller melding.

Edge Function:

```text
project-participants-mailer
verify_jwt = true
```

Funksjonen krever autentisert/godkjent bruker, verifiserer tilgang til prosjektet og verifiserer at mottakerens e-post finnes som aktiv prosjektinvolvert med `receive_email = true`. Klienten kan derfor ikke bruke funksjonen som vilkårlig e-postsender.

Emne og melding har server-side lengdevern. `mailKind` normaliseres til prosjektmelding eller fremdriftsplan. Lenken i utsendt e-post bygges server-side og kan bare peke til riktig prosjekt/fane på `https://expo-proffdok.app`; klienten kan ikke injisere en ekstern lenke.

Ved utsending opprettes prosjektvarsel i `project_participant_notices`. Innloggede brukere som matcher mottakerens e-post kan få varsel om at prosjektinformasjon kan være endret og markere varslet som lest.

### Trygg Vercel Preview

`src/modules/app/previewSafetyBootstrap.js` aktiverer trygg testmodus automatisk på Vercel Preview før Fremdrift/Prosjektinvolverte starter.

I trygg Preview:

- fremdriftsplan lagres lokalt i nettleseren
- prosjektinvolverte lagres lokalt i nettleseren
- produksjonstabeller skal ikke få testdata
- ekte prosjektmail er eksplisitt blokkert
- UI viser tydelig at Preview ikke sender ekte e-post

Denne sikkerheten skal ikke aktiveres på produksjonsdomenet.

## 7. Fase 35C – kalender og PDF-vedlegg

### Kalender / `.ics`

Kalender-eksporten er en ren enveis eksport fra **lagret fremdriftsplan**. Den gjør ingen databaseendring og oppretter ingen kobling tilbake fra kalenderprogrammet.

```text
lagret project_progress_plans.plan
  → daterte arbeidsøkter
  → standard VCALENDAR / VEVENT
  → én .ics-fil
  → Outlook / Google Kalender / Apple Kalender
```

Viktige kontrakter:

- bare daterte arbeidsøkter eksporteres
- klokkeslett eksporteres i `Europe/Oslo`
- arbeidsoperasjon + prosjektnavn brukes som kalendernavn
- prosjektadresse brukes som LOCATION når den finnes
- fag, person/firma, status og merknad legges i beskrivelsen når de finnes
- eksportert kalender er ikke direkte synk; senere endringer i Expo ProffDok oppdaterer ikke en allerede importert avtale automatisk
- filnavn saniteres og ender på `-fremdrift.ics`

Aktiv kode:

- `src/modules/progress/progressPlanCalendarExport.js`
- `src/modules/progress/progressPlanCalendarAction.jsx`
- `src/modules/progress/progressPlanCalendarAction.css`

### PDF som prosjektmail-vedlegg

Når `mailKind = progress_plan` sendes i produksjon, skal PDF-en **ikke** komme fra klienten. Edge Function leser prosjektet og siste lagrede rad i `project_progress_plans`, genererer PDF server-side og sender den som Resend-vedlegg.

```text
autentisert aktiv bruker
  → prosjekt-tilgang verifiseres
  → mottaker må være aktiv Prosjektmail-mottaker
  → lagret project_progress_plans.plan leses server-side
  → pdf-lib bygger fremdrifts-PDF
  → PDF vedlegges Resend-mail
  → prosjektvarsel registreres
```

Sikkerhetskrav:

- klienten kan ikke sende vilkårlig fil/base64 som vedlegg
- prosjekt og plan bestemmes server-side fra `projectId`
- mottaker må finnes i `project_participants` med `receive_email = true`
- manglende lagret plan stopper PDF-utsending
- PDF over 6 MB stoppes før utsending
- prosjektlenke bygges server-side til `https://expo-proffdok.app`
- Preview blokkerer klientkallet før ekte e-post kan sendes

Server-PDF bruker A4 liggende, sammendragsside og Gantt-sider med maksimalt 8 prosjektuker per sidegruppe og opptil 13 arbeidsoperasjoner per Gantt-side. Den er en separat servergenerert leveranse og er ikke avhengig av nettleserens utskriftsdialog.

Aktiv serverkode:

- `supabase/functions/project-participants-mailer/index.ts`
- `supabase/functions/_shared/progress-plan-pdf.ts`

Produksjonsfunksjon ved 35C-QA:

```text
project-participants-mailer
version = 3
status = ACTIVE
verify_jwt = true
```

35C ble kontrollert med én eksplisitt ekte utsending til valgt testmottaker. E-posten mottok `Nybygg-bad-fremdrift.pdf`, vedlegget åpnet korrekt, og test-radene i `project_progress_plans`, `project_participants` og `project_participant_notices` ble deretter slettet. Selve prosjektet ble ikke endret/slettet.

## 8. Fase 34B – akseptvarsler

Når en ny kundeaksept er lagret server-side, forsøkes to separate e-poster:

1. kunden får bekreftelse på at aksepten er registrert
2. brukeren som publiserte den eksakte tilbudsversjonen får beskjed om at tilbudet er akseptert

Mottaker for intern e-post bestemmes av `sales_offer_versions.published_by`, ikke mutable «Ansvarlig»-felt. E-postfeil kan aldri reversere eller endre selve aksepten.

`sales_offer_acceptance_notifications` har uniknøkkel på:

```text
offer_id + offer_version_id + recipient_type
```

Edge Function `sales-offer-acceptance-notify` verifiserer akseptgrunnlaget server-side og har historikkvern mot utsending fra gamle aksepter.

## 9. Kontraktserver – `sales_contracts`

Sales-kontrakt knyttes til faktisk firma, `request_ref`, tilbud og eksakt akseptert tilbudsversjon.

```text
source: expo | external
status: draft | awaiting_customer | signed | external_confirmed | void
```

Viktige kontrakter:

- RLS er aktivert
- intern kontraktskriving går gjennom kontrollerte RPC-er
- offentlig kunde bruker unik kontrakttoken/RPC, ikke direkte tabelltilgang
- signert snapshot og signaturmetadata låses server-side
- `final_document` kan settes første gang etter signering og er deretter immutable
- ingen normal DELETE-flyt for kontrakthistorikk

## 10. Endelig Expo-kontrakt og prosjektkobling

Endelig PDF genereres bare fra låst `sales_contracts.snapshot` og registrerte signaturer. Slutt-PDF lagres privat og kobles til prosjektets Avtalegrunnlag uten duplikater.

## 11. Kontrakt som garantikrav

**Dokumentert tetthetsgaranti kan bare utstedes når en signert kontrakt ligger i prosjektets Avtalegrunnlag.** Dette gjør ikke kontrakt obligatorisk for prosjektet i seg selv.

Relevant migrasjon:

```text
20260831230412  fase33b6_warranty_requires_signed_contract
```

## 12. HJELP

HJELP forklarer i vanlig proffspråk blant annet:

- kontrakt er valgfritt for vanlige prosjekter
- garantiprosjekt krever signert kontrakt før garantiutstedelse
- arbeidsstatus og åpne avvik er forskjellige ting
- fremdriftsplan kan bygges manuelt eller hente arbeidsoperasjoner fra akseptert tilbud
- UE kan se fremdriftsplanen; kunde ser den bare når bedriften deler den
- endringer i fremdriftsplanen endrer aldri det aksepterte tilbudet
- mobil viser aktivitetskort, desktop viser ukeoversikt
- standard og egen arbeidsoperasjon får første dato/tid automatisk i valgt uke
- Gantt bruker dynamiske prosjektuker og viser dato/tid per økt
- Gantt/PDF kan lagres via nettleserens PDF-utskrift
- `.ics` eksporterer daterte arbeidsøkter til kalenderprogram
- Fremdriftsmail legger siste lagrede plan ved som servergenerert PDF
- Prosjektinvolverte brukes som kontakt- og distribusjonsliste
- **Prosjektmail** bestemmer hvem som mottar felles prosjektmeldinger/fremdriftsmeldinger
- Prosjektinvolverte finnes først etter at prosjektet er opprettet
- Enter oppretter ny tom personrad; tom rad lagres ikke
- ulagrede endringer i Prosjektinvolverte varsles før brukeren forlater siden
- trygg Preview lagrer lokalt og sender ikke ekte e-post

## 13. QA / handover

35C skal før merge minst verifisere:

- `critical-build-check`
- `critical-sales-recovery-check`
- `critical-progress-plan-check`
- Vite build
- diff mot `main`; branch skal være foran og ikke bak
- Preview READY på eksakt branch-SHA
- trygg Preview aktiveres automatisk på Vercel Preview
- ingen ekte e-post kan sendes i trygg Preview
- ingen Preview-/QA-testdata i `project_progress_plans`, `project_participants` eller `project_participant_notices`
- standard og egen arbeidsoperasjon får automatisk første økt `08:00–16:00` i valgt uke
- `.ics` lastes ned fra lagret plan
- `.ics` aksepteres og importeres korrekt i Outlook/kontrollert kalenderprogram
- `.ics` inneholder korrekt prosjekt, arbeidsoperasjon, dato, tid og adresse
- Fremdrift-deling henter Prosjektmail-mottakere
- ekte kontrollert prosjektmail mottar servergenerert PDF-vedlegg
- PDF-vedlegget åpner korrekt og har prosjektdata + Gantt
- klienten kan ikke levere vilkårlig vedlegg til mailfunksjonen
- Edge Function v3 er ACTIVE med `verify_jwt = true`
- Gantt viser dynamiske prosjektuker og lange planer deles kontrollert
- HJELP og arkitekturkart er oppdatert
- produksjons-QA-data ryddes selektivt etter ekte e-posttest

Handover-regel:

```text
Les faktisk main
→ kartlegg relevant område
→ gjør additiv/minimal endring
→ behold data- og sikkerhetskontrakter
→ critical build/recovery
→ Vercel Preview
→ TEST OK
→ merge
→ verifiser eksakt Production-SHA + HTTP + runtime
→ verifiser Supabase når relevant
→ slett feature-branch manuelt
```
