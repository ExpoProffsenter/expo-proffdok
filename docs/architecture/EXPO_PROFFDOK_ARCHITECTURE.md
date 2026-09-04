# Expo ProffDok – arkitekturkart

**Fase:** 35B – fremdrift eksport/deling + prosjektinvolverte  
**Status:** Feature branch / Preview-QA – ikke merget  
**Dato:** 04.09.2026  
**Produksjonsbaseline ved oppstart:** `main` på `60e227efd9b1b95749a20ac141c44f7dfe45d776`  
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
15. Vercel Preview skal være trygg testmodus for 35B-data og skal ikke sende ekte prosjektmail.

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
| PDF | jsPDF + nettleserutskrift | Rapport/tilbud/garanti/kontrakt og fremdriftsplan |

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

Ved **+ Egen arbeidsoperasjon** opprettes første økt automatisk med dato og standardtid `08:00–16:00`; brukeren kan endre dette og legge til flere økter. Minst én datofestet økt kreves for at aktiviteten skal vises i Gantt.

### Modulansvar

- `src/modules/progress/progressPlanUx.jsx` – stabil inngang, Preview-sikkerhet, eksport/deling og prosjektfane.
- `src/modules/progress/progressPlanUxV2.jsx` – arbeidsflate, ukevisning, mobil, redigering, dirty-state og read-only portalvisning.
- `src/modules/progress/progressPlanSupabase.js` – data-/portalbro, separat planlagring og tilbudslesing.
- `src/modules/progress/progressPlanOfferCore.js` – enveistransformasjon fra akseptert tilbud til arbeidsoperasjoner.
- `src/main.jsx` – eier intern Fremdrift-fane, prosjekt-/fane-URL og sentral ulagret-guard.
- `scripts/critical-progress-plan-check.mjs` – permanent QA av tilbudsimport og 13 standard arbeidsoperasjoner.

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

Fremdriftsmail sender i 35B en prosjektmelding/oppsummering til valgte prosjektinvolverte og henviser til siste plan i Expo ProffDok. PDF-filen er ikke vedlagt direkte i e-posten i 35B.

Direkte Google/Outlook-synk og `.ics`-eksport er ikke del av 35B og kan vurderes senere.

Aktiv eksportkode:

- `src/modules/progress/progressPlanExportV3.jsx`
- `src/modules/progress/progressPlanExportV3.css`
- `src/modules/progress/progressPlanExport.css`

Midlertidige V1/V2-eksportvarianter fra utviklingen er fjernet før merge.

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

Begge tabeller har prosjekt-/tilgangsbasert RLS. Migrasjon:

```text
20260904172100_fase35b_project_participants_and_notices.sql
```

Edge Function:

```text
project-participants-mailer
verify_jwt = true
```

Funksjonen krever autentisert/godkjent bruker, verifiserer tilgang til prosjektet og verifiserer at mottakerens e-post finnes som aktiv prosjektinvolvert med `receive_email = true`. Klienten kan derfor ikke bruke funksjonen som vilkårlig e-postsender.

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

## 7. Fase 34B – akseptvarsler

Når en ny kundeaksept er lagret server-side, forsøkes to separate e-poster:

1. kunden får bekreftelse på at aksepten er registrert
2. brukeren som publiserte den eksakte tilbudsversjonen får beskjed om at tilbudet er akseptert

Mottaker for intern e-post bestemmes av `sales_offer_versions.published_by`, ikke mutable «Ansvarlig»-felt. E-postfeil kan aldri reversere eller endre selve aksepten.

`sales_offer_acceptance_notifications` har uniknøkkel på:

```text
offer_id + offer_version_id + recipient_type
```

Edge Function `sales-offer-acceptance-notify` verifiserer akseptgrunnlaget server-side og har historikkvern mot utsending fra gamle aksepter.

## 8. Kontraktserver – `sales_contracts`

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

## 9. Endelig Expo-kontrakt og prosjektkobling

Endelig PDF genereres bare fra låst `sales_contracts.snapshot` og registrerte signaturer. Slutt-PDF lagres privat og kobles til prosjektets Avtalegrunnlag uten duplikater.

## 10. Kontrakt som garantikrav

**Dokumentert tetthetsgaranti kan bare utstedes når en signert kontrakt ligger i prosjektets Avtalegrunnlag.** Dette gjør ikke kontrakt obligatorisk for prosjektet i seg selv.

Relevant migrasjon:

```text
20260831230412  fase33b6_warranty_requires_signed_contract
```

## 11. HJELP

HJELP forklarer i vanlig proffspråk blant annet:

- kontrakt er valgfritt for vanlige prosjekter
- garantiprosjekt krever signert kontrakt før garantiutstedelse
- arbeidsstatus og åpne avvik er forskjellige ting
- fremdriftsplan kan bygges manuelt eller hente arbeidsoperasjoner fra akseptert tilbud
- UE kan se fremdriftsplanen; kunde ser den bare når bedriften deler den
- endringer i fremdriftsplanen endrer aldri det aksepterte tilbudet
- mobil viser aktivitetskort, desktop viser ukeoversikt
- egen arbeidsoperasjon får første dato/tid automatisk og må ha minst én datofestet økt for Gantt
- Gantt bruker dynamiske prosjektuker og viser dato/tid per økt
- Gantt/PDF kan lagres via nettleserens PDF-utskrift
- Prosjektinvolverte brukes som kontakt- og distribusjonsliste
- **Prosjektmail** bestemmer hvem som mottar felles prosjektmeldinger/fremdriftsmeldinger
- Prosjektinvolverte finnes først etter at prosjektet er opprettet
- Enter oppretter ny tom personrad; tom rad lagres ikke
- ulagrede endringer i Prosjektinvolverte varsles før brukeren forlater siden

## 12. QA / handover

35B skal før merge minst verifisere:

- `critical-build-check`
- `critical-sales-recovery-check`
- `critical-progress-plan-check`
- Vite build
- diff mot `main`; branch skal være foran og ikke bak
- Preview READY på eksakt branch-SHA
- trygg Preview aktiveres automatisk på Vercel Preview
- ingen ekte e-post kan sendes i trygg Preview
- ingen Preview-testdata i `project_progress_plans`, `project_participants` eller `project_participant_notices`
- Prosjektinvolverte er skjult før prosjekt er opprettet
- Prosjektinvolverte beholder data/fokus under skriving og parent-rerender
- Enter-flyt, tom-rad-filter, sticky lagring og ulagret-guard
- Prosjektmail-komponist henter valgte mottakere
- Fremdrift-deling henter samme Prosjektmail-mottakere
- Gantt viser dynamiske prosjektuker over 5 uker
- plan over 8 prosjektuker deles automatisk i flere Gantt-seksjoner
- flere økter samme uke viser hver dato og tid separat
- korte PDF/utskrifter unngår unødvendig ekstra side
- HJELP og arkitekturkart er oppdatert
- aktive 35B Edge Functions/tabeller og RLS er verifisert
- utfasete midlertidige V1/V2-filer er fjernet

Kontrollert ekte e-post/varselstest kan gjøres separat før produksjonsbruk dersom mottaker og testprosjekt er eksplisitt valgt. Det skal ikke gjøres gjennom trygg Preview.

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
