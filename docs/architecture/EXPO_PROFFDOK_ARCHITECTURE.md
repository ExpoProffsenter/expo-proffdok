# Expo ProffDok – arkitekturkart

**Fase:** 33B.6 – garantikobling og slutt-QA  
**Status:** Feature/Preview – venter på brukerens TEST OK før merge  
**Dato:** 01.09.2026  
**Produksjonsbaseline ved oppstart:** `main` på `35a1c29cab3dbe72b03ff624b2a2d354961c532d`  
**Supabase:** `dqffxflaoyarbxyiyhop`

Dette kartet beskriver den gjeldende arkitekturen og de sikkerhets-/bakoverkompatibilitetskravene som må bevares. Historiske detaljer finnes i Git.

## 1. Styrende prinsipper

1. `main` er kilde til sannhet for produksjonskode.
2. Produksjon beskyttes foran alt: feature-branch → Vercel Preview → `TEST OK` → merge → verifiser eksakt Production-SHA, HTTP/runtime og relevant Supabase-status.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang eller siste autoritative validering.
4. Publiserte tilbud, aksepterte tilbudsversjoner, signerte kontrakter og utstedte garantier er historikk og skal ikke overskrives vilkårlig.
5. Prosjekt kan opprettes og eksistere **uten tilbud**.
6. Prosjekt kan eksistere **uten kontrakt**. Kontrakt er kun obligatorisk når dokumentert tetthetsgaranti faktisk skal utstedes.
7. Eksisterende opplasting av bedriftens egen kontrakt er fortsatt gyldig.
8. Privatkundeorienterte priser vises inkl. mva.
9. Ingen historisk backfill uten eksplisitt beslutning.
10. Supportmodus er ikke skrive-bypass og skal ikke registrere systemadmin som feil oppretter, ansvarlig eller signatar.
11. Sales recovery/hydration og IndexedDB-sikring av befaringsbilder er kritiske kontrakter.
12. Historiske Storage-paths/URL-er flyttes ikke spontant.
13. Modulisering gjøres bare ved naturlige ansvargrenser som gir reell oversikt eller mindre risiko.
14. Brukerrettede endringer oppdaterer HJELP samme runde.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti og produktdata |
| Serverlogikk | Supabase RPC/trigger | Firmascoping, validering, låsing og dokumentkobling |
| Filer | Supabase Storage | Bilder og private/offentlige dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, kontrakt, portal, chat og systemmeldinger |
| Hosting | Vercel | Preview og Production |
| PDF | jsPDF | Rapport, tilbud, akseptbevis, garanti og endelig kontrakt |

Produksjon: `https://expo-proffdok.app`

## 3. Prosjekt og Avtalegrunnlag

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Den synlige fanen heter **Avtalegrunnlag**, mens intern nøkkel fortsatt er `tilbud` / `data.tilbud` for bakoverkompatibilitet.

Fire vanlige prosjektveier er fortsatt gyldige:

```text
A) Direkte prosjekt uten tilbud
B) Akseptert tilbud → prosjekt uten kontrakt
C) Akseptert tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert tilbud → Expo-kontrakt → prosjekt
```

Ingen av disse veiene blokkeres av Fase 33B.6. Det nye kravet gjelder først dersom brukeren senere velger å **utstede dokumentert tetthetsgaranti**.

Avtalegrunnlag kan inneholde:

- akseptert tilbud/Sales-opprinnelse når dette finnes
- akseptbevis
- signert Expo-kontrakt
- bedriftens egen signerte kontrakt
- andre avtaledokumenter
- senere tillegg/fradrag

Direkte prosjekt uten tilbud eller kontrakt er en normaltilstand.

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
→ valgfritt:
   ├─ Expo-kontrakt → bedriftssignatur → kundesignatur → slutt-PDF
   ├─ egen kontrakt
   └─ ingen kontrakt
→ eventuell prosjektaktivering
```

Kritiske Sales-kontrakter:

- tom/uhydrert tilbudskladd skal aldri overskrive nyere serverdata
- recovery skal fungere ved reload, dvale og appbytte
- befaringsbilder beholder IndexedDB/Storage-flyt
- publiserte/aksepterte tilbudsversjoner er immutable snapshots
- kundeaksept knyttes til eksakt versjon og valgte opsjoner
- `critical-sales-recovery-check.mjs` er obligatorisk del av build

Fase 33B.6 endrer ikke tilbuds-, aksept- eller signeringsflyten.

## 5. Kontraktserver – `sales_contracts`

Sales-kontrakt knyttes til faktisk firma, `request_ref`, tilbud og eksakt akseptert tilbudsversjon.

```text
source: expo | external
status: draft | awaiting_customer | signed | external_confirmed | void
```

Viktige kontrakter:

- RLS er aktivert.
- Intern kontraktskriving går gjennom kontrollerte RPC-er.
- Offentlig kunde bruker unik kontrakttoken/RPC, ikke direkte tabelltilgang.
- Signert snapshot og signaturmetadata låses server-side.
- `final_document` kan settes første gang etter signering og er deretter immutable.
- Ingen normal DELETE-flyt for kontrakthistorikk.

Relevante RPC-er:

```text
create_sales_contract(...)
save_sales_contract_draft(...)
sign_sales_contract_company(...)
get_sales_contract_by_token(...)
sign_sales_contract_customer(...)
register_external_sales_contract(...)
void_sales_contract(...)
attach_sales_contract_final_document(...)
sync_sales_contract_final_document_to_project(...)
```

Migrasjoner i kontrakt-/garantikjeden:

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
20260831210107  fase33b4_company_signature_validation
20260831210119  fase33b4_customer_signature_acknowledgements
20260831215906  fase33b5_sync_final_contract_to_project
20260831220648  fase33b5_project_contract_auto_link
20260831230412  fase33b6_warranty_requires_signed_contract
```

Ingen av migrasjonene backfiller historiske tilbud, kontrakter eller garantier.

## 6. Endelig Expo-kontrakt og prosjektkobling

Endelig PDF genereres kun fra låst `sales_contracts.snapshot` og registrerte signaturer. Den inneholder:

1. kontraktens avtalepunkter
2. begge signaturer
3. Vedlegg A – eksakt akseptert tilbud og valgte opsjoner
4. Vedlegg B – aksept- og signaturbevis

Kundesynlig tilbudstekst, forutsetninger/forbehold, inkludert/ikke inkludert, kundens leveranser, vilkår og betalingsbetingelser følger med når de faktisk finnes i den låste tilbudsversjonen. Eldre tilbud får ingen etterkonstruert tekst.

Slutt-PDF lagres privat under logisk `sales-contracts/...` og kobles til `data.tilbud.files`. Eksisterende prosjekt kan synkroniseres via RPC, mens senere prosjekt får dokumentet via `trg_projects_link_signed_sales_contract`. Samme Storage-objekt gjenbrukes; det kopieres ikke.

## 7. Fase 33B.6 – kontrakt som garantikrav

### 7.1 Forretningsregel

**Dokumentert tetthetsgaranti kan bare utstedes når en signert kontrakt ligger i prosjektets Avtalegrunnlag.**

Gyldig grunnlag er:

- ferdig signert Expo-kontrakt/slutt-PDF, eller
- bedriftens egen signerte kontrakt.

Dette gjør **ikke** kontrakt obligatorisk for prosjektet i seg selv. Brukeren kan fortsatt opprette, gjennomføre og ferdigstille vanlige prosjekter uten tilbud og/eller kontrakt.

### 7.2 Dokumentklassifisering

Ny tynn wrapper rundt eksisterende Avtalegrunnlag:

```text
src/modules/contract/
├── contractViewToolsCore.js   ← eksisterende testet visning uendret
└── contractViewTools.js       ← klassifiserer bedriftens signerte kontrakt
```

Expo-kontrakt kommer allerede med `documentType=contract` / `contractSource=expo`.

For bedriftens egne opplastede dokumenter kan brukeren markere hvilken fil som er den **endelige signerte kontrakten**. Markeringen lagrer `documentType=contract` og `contractSource=external`. Gamle dokumenter med kontraktnavn gjenkjennes fortsatt som legacy-kompatibilitet.

### 7.3 Klientkontroll i Garanti

Eksisterende Warranty-visning er bevart som Core:

```text
src/modules/warranty/
├── warrantyViewToolsCore.js   ← eksisterende garanti-/PDF-visning uendret
└── warrantyViewTools.js       ← leser prosjektets Avtalegrunnlag og supplerer readiness
```

Wrapperen bruker den allerede delte Sales-Supabase-klienten og leser kun prosjektet i gjeldende firmascope. Før utstedelse:

- kontrakt kontrolleres mot lagret prosjekt
- manglende kontrakt legges inn i eksisterende `readiness.missing`
- kortet blir ikke «Klar til garanti» før kontraktkravet er oppfylt
- utstedelsesknappen forblir deaktivert ved manglende/uklar kontroll
- brukeren kan gå tilbake til Avtalegrunnlag og rette dette

Frontend er kun forhåndskontroll; server er autoritativ.

### 7.4 Autoritativ serverkontroll

Migrasjon `20260831230412 fase33b6_warranty_requires_signed_contract` legger inn:

- `project_data_has_signed_contract(project_data jsonb)` – klassifiserer kontraktdokument i prosjektdata
- `trg_warranty_registry_require_signed_contract` – **BEFORE INSERT** på `warranty_registry`
- `trg_projects_preserve_warranty_contract` – hindrer at siste kontraktsgrunnlag fjernes etter at garanti er registrert

Garanti registreres i `warranty_registry` før klienten setter prosjektets `warranty.issued`. Derfor ligger den avgjørende kontrollen nettopp på garantiregisterets INSERT, ikke bare på en senere prosjektoppdatering.

Gamle allerede utstedte garantier uten kontrakt berøres ikke. Det kjøres ingen backfill. Bevaringsvernet gjelder kun når et prosjekt faktisk hadde kontrakt og en garanti allerede finnes.

## 8. Garanti – øvrige krav

Kontraktkravet kommer i tillegg til eksisterende garantikrav, blant annet:

- garantivilkår/mottak
- signert overtagelse fra begge parter
- ingen åpne avvik
- fullførte ordinære og relevante Sopro-kontrollpunkter
- nødvendig bildedokumentasjon
- godkjent Sopro-system

Garantiregisterets eksisterende RLS/company-scope-policy er ikke svekket i 33B.6.

## 9. HJELP

HJELP skal forklare i vanlig proffspråk:

- kontrakt er fortsatt valgfritt for vanlige prosjekter
- garantiprosjekt krever signert kontrakt før garantiutstedelse
- signert Expo-kontrakt registreres automatisk
- bedriftens egen signerte kontrakt kan markeres i Avtalegrunnlag
- prosjektet må lagres etter markering før garantien kontrolleres
- gamle prosjekter/garantier backfilles ikke

## 10. QA / handover

Før merge skal 33B.6 ha:

- critical-build-check
- critical-sales-recovery-check
- Vite build
- diff mot `main`
- Preview READY på eksakt branch-SHA
- runtime error/fatal = 0
- Supabase security/performance-advisor vurdert uten blind opprydding
- server-QA: garanti uten kontrakt stoppes
- server-QA: garanti med kontrakt godtas
- server-QA: kontrakt kan ikke fjernes etter utstedt garanti
- bruker-QA av Avtalegrunnlag og Garanti

Kontrollert flyt:

```text
33B.2  servermodell/RLS/RPC                           ← ferdig
33B.3  intern kontraktveiviser/autofyll                ← ferdig
33B.4  bedriftssignatur + kundelenke + kundesignering ← ferdig
33B.5  slutt-PDF + Avtalegrunnlag + prosjektkobling   ← ferdig
33B.6  garantikobling + slutt-QA/dokumentasjon        ← denne runden
```

GitHub issue #110 om flere rom under samme prosjekt forblir fremtidig backlog og endrer ingen data i Fase 33B.

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
