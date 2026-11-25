# Expo ProffDok – FASE 42K demo-stabilisering

**Dato:** 15.09.2026  
**Branch:** `feature/fase42k-demo-stabilisering`  
**Utgangspunkt:** `main` SHA `b5270b0701e60b98ab01ef21626f6f9107bc8fd9`

## Formål

Fase 42K er en avgrenset stabiliseringsrunde før demo. Målet er å forbedre de konkrete arbeidsflytene som skapte friksjon i demo uten å bygge om Sales, prosjektmotoren eller appens hovednavigasjon.

## Scope

Fasen endrer kun:

- desktop prosjektveiviser/hurtigvalg
- gjenkjenning av eldre prosjektmeny som viser `Salgsgrunnlag` i stedet for `Befaring/Tilbud`
- Prissøk workspace-resume ved appbytte/dvale
- systemadmin UX-policy for Firma og Butikktilbud
- backend-policy for godkjenning uten Firma og intern tilgang ved firmabytte
- relevante critical checks og permanente guardrails

Fasen endrer ikke:

- `main.jsx`
- Sales server-first hydration/recovery
- Sales lazy loading
- tilbuds-/aksepthistorikk
- prosjektdata
- e-postflyt
- Storage
- kunde-/UE-portal

## 1. Anbefalt prosjektløp

Desktop-veiviseren bruker fortsatt eksisterende native prosjektfaner. Det opprettes ingen ny navigasjonsmotor.

Synlig anbefalt rekkefølge:

```text
Oversikt
→ Avtalegrunnlag
→ Prosjektering
→ Fremdrift
```

Full **Meny** beholdes som før for Bilder, Produkter, Sjekklister, Avvik, Chat, Overtagelse osv.

Dette er en anbefalt arbeidsrekkefølge, ikke en ny teknisk sperre. Prosjekt uten tilbud og prosjekt uten kontrakt er fortsatt gyldige prosjektveier.

### 1.1 Eldre prosjektmenyer

Enkelte eldre prosjekter viser `Salgsgrunnlag` i native prosjektmeny i stedet for `Befaring/Tilbud`. Desktop-adapteren skal derfor kjenne igjen en prosjektarbeidsflate på stabile prosjektfaner (`Prosjektoversikt`, `Prosjektering`, `Sjekklister`, `Avtalegrunnlag`, `Hjelp`) og ikke være avhengig av Sales-etiketten.

Dette endrer ikke gamle prosjektdata eller native faner. Det sørger bare for at samme kollapsede desktopmeny og anbefalte prosjektveiviser brukes på både eldre og nye prosjekter.

## 2. Firma før godkjenning

Nye brukere skal ikke kunne godkjennes uten `profiles.company_name`.

Policyen håndheves på to nivåer:

1. Systemadmin-UI stopper `Godkjenn bruker` dersom Firma mangler.
2. Database-trigger stopper overgang fra `approved=false` til `approved=true` dersom Firma mangler.

Eksisterende godkjente legacy-brukere uten Firma backfilles eller deaktiveres ikke automatisk i denne fasen.

Expo Proffsenter-logo kan fortsatt brukes som visuell standardlogo når et firma ikke har lastet opp egen logo. Logo-fallback er ikke firmatilhørighet og skal ikke brukes som datascope.

## 3. Butikktilbud og intern handel

`store_offers` kan bare gis til brukere i:

- Ringside Rørleggerbedrift AS
- Bademiljø Expo
- Expo Proffsenter

Serverfunksjonen `set_managed_module_access` er fortsatt autoritativ ved tildeling.

FASE 42K legger i tillegg til:

- tydelig deaktivert Butikktilbud-valg i Systemadmin for andre firma
- cleanup-trigger ved firmabytte ut av intern gruppe

Ved slikt firmabytte fjernes:

- `store_offers`
- `view_internal_net_prices`

Vanlig `sales` / Befaring / Våtromstilbud beholdes.

## 4. Prissøk – appbytte/dvale

Valgte varer lagres fortsatt kun som vare-ID/oppslagsnøkkel i `sessionStorage`. Pris- og marginfelt lagres ikke lokalt og hentes på nytt fra backend.

FASE 42K legger til en separat fanespesifikk resume-markør som sier at **Prissøk faktisk var åpent**.

Forventet flyt:

```text
Åpne Prissøk
→ velg varer
→ bytt app / gå i bakgrunn / vanlig refresh
→ returner
→ Prissøk åpnes igjen
→ valgte varer rehydreres fra backend
```

Bevisst navigasjon til Startsiden, Meny eller annen arbeidsflate rydder resume-markøren. Regelen **bevisst brukerhandling vinner** gjelder også her.

## 5. QA-kontrakt

Fasen må bestå eksisterende full `npm run build` med alle critical checks, pluss følgende nye vern:

- anbefalt prosjektløp må være `Oversikt → Avtalegrunnlag → Prosjektering → Fremdrift`
- hurtigvalgene må fortsatt klikke native prosjektfaner
- eldre prosjektmeny med `Salgsgrunnlag` må fortsatt fanges av desktopmenyen
- Prissøk må ha sessionStorage-basert workspace-resume
- Prissøk må rydde resume-markør ved bevisst navigasjon
- nye brukere må ha Firma før godkjenning
- policy-migrasjonen skal ikke backfille eksisterende profiler
- ekstern firmatilhørighet skal ikke kunne beholde intern Butikktilbud/nto-tilgang etter firmabytte

### 5.1 Backend-verifikasjon uten testbruker

Policylogikken kan verifiseres uten å opprette eller endre reelle brukere ved å bruke midlertidige tabeller i en transaksjon som rulles tilbake. Følgende scenarier skal være grønne:

- godkjenning uten Firma stoppes
- godkjenning med Firma tillates
- internt → eksternt firmabytte fjerner `store_offers` og `view_internal_net_prices`
- vanlig `sales` beholdes ved slikt firmabytte
- internt → internt firmabytte beholder interne tilganger

## 6. Merge-/produksjonsregel

Ingen merge til `main` før:

1. Vercel Preview er `READY`
2. full critical build er grønn
3. bruker har manuelt testet relevante flows på Preview
4. eksplisitt `TEST OK` er gitt

SQL-migrasjonen skal ikke legges på Production før Preview-UX og branch er godkjent for merge.
