# Expo ProffDok – Befaring / Tilbud / Aksept / Kontrakt

**Status:** Produksjonskoblet Sales-modul  
**Oppdatert:** Fase 35A – 04.09.2026

Sales håndterer flyten fra forespørsel til eventuelt ProffDok-prosjekt. Etter akseptert tilbud kan brukeren frivillig opprette Expo-kontrakt, laste opp egen kontrakt eller gå videre uten kontrakt. Prosjekt kan også opprettes direkte uten Sales/tilbud.

**Kontrakt er ikke et generelt prosjektkrav.** Signert kontrakt kreves først når dokumentert tetthetsgaranti faktisk skal utstedes.

## Gyldige prosjektveier

```text
A) Direkte prosjekt uten tilbud
B) Akseptert tilbud → prosjekt uten kontrakt
C) Akseptert tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert tilbud → Expo-kontrakt → prosjekt
```

Alle fire er gyldige normaltilstander.

## Sales-hovedflyt

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
   → kunden får akseptbekreftelse på e-post
   → brukeren som publiserte eksakt akseptert tilbudsversjon varsles på e-post
→ låst akseptbevis
→ valgfritt kontraktsteg
→ eventuell prosjektaktivering
```

Tilbud kan også opprettes uten befaring.

## Styrende kontrakter

- Publiserte tilbudsversjoner og kundeaksept overskrives aldri.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Privatkundeorienterte priser vises inkl. mva.
- Prosjekt uten tilbud og/eller kontrakt er gyldig.
- Ingen historisk backfill uten eksplisitt beslutning.
- RLS/server er sikkerhetsgrensen; frontend er ikke tilgangskontroll.
- Supportmodus er ikke skrive-bypass.
- Sales recovery/hydration og IndexedDB-sikring av befaringsbilder skal ikke svekkes.
- Eksisterende `contractFile` og gamle kontraktdokumenter er gyldig legacy.
- Brukerflaten heter **Avtalegrunnlag**, mens intern prosjekt-/tabnøkkel `tilbud` / `data.tilbud` beholdes.

## Fase 35A – Sales som kilde til forslag i fremdriftsplan

Når et prosjekt stammer fra et akseptert tilbud kan fremdriftsmodulen lese det **låste aksepterte tilbudsgrunnlaget og de faktisk valgte opsjonene** og bruke hovedpostene som forslag til arbeidsoperasjoner.

Dette er en enveis grense:

```text
akseptert tilbud + valgte opsjoner
  → leses av fremdriftsmodulen
  → kopieres til redigerbare arbeidsoperasjoner i prosjektet

fremdriftsplan
  ✕ skriver ikke tilbake til sales_offers
  ✕ skriver ikke tilbake til sales_offer_versions
  ✕ endrer ikke accepted_payload
  ✕ endrer ikke kontrakt eller akseptbevis
```

Kun valgte opsjoner skal kunne påvirke forslagene. Dersom en valgt opsjon tilhører en hovedpost som ikke har grunnpris i tilbudet, kan hovedposten likevel bli en egen arbeidsoperasjon i fremdriftsplanen. Uvalgte opsjoner importeres ikke.

Direkte opprettede prosjekter uten Sales-opphav bygger fremdriftsplan manuelt. Sales er derfor en valgfri kilde til forslag, ikke et krav for fremdriftsplanen.

Selve fremdriftsplanen eies av `src/modules/progress/` og lagres separat fra Sales-historikken.

## Fase 34B – e-post ved tilbudsaksept

Selve aksepten lagres fortsatt gjennom eksisterende `accept_sales_offer(...)`. E-post er et etterfølgende sideutfall og kan aldri reversere en lagret aksept.

Ny Edge Function:

```text
sales-offer-acceptance-notify
```

Funksjonen mottar kun offentlig tilbudstoken. Den bruker tokenet til å hente den allerede aksepterte saken server-side og bestemmer selv mottakerne:

- **publisher:** `sales_offer_versions.published_by` for den eksakte aksepterte versjonen
- **customer:** kunde-e-posten som ligger på `sales_offers`

Klienten kan dermed ikke velge en vilkårlig mottaker.

Varslene inneholder tilbudsnummer, kunde, arbeidssted, akseptert tidspunkt, akseptert sum inkl. mva. og valgte opsjoner.

### Idempotens

Tabellen:

```text
sales_offer_acceptance_notifications
```

har unik nøkkel på:

```text
offer_id + offer_version_id + recipient_type
```

Dermed kan refresh, dobbelklikk eller nytt besøk på en allerede akseptert kundelenke ikke sende samme varsel flere ganger.

Nye aksepter gir varslingsforsøk umiddelbart etter at aksept-RPC-en har lykkes. Åpning av en allerede akseptert offentlig tilbudslenke forsøker også varslingsendepunktet som recovery. Serverens uniknøkkel avgjør om e-post faktisk skal sendes.

Edge Function har `verify_jwt=false` fordi kunden ikke er innlogget. Sikkerhetsgrensen er den eksisterende høyt entropiske `publicOffer`-tokenen, serveroppslag mot akseptert tilbud og serverbestemte mottakere. Ingen e-postadresse tas fra klienten.

Migrasjoner:

```text
20260904113833  fase34b_sales_offer_acceptance_notifications
20260904113915  fase34b_sales_offer_acceptance_notification_updated_at
```

## Kontrakt etter aksept

Etter aksept kan saken fortsette med:

- Expo-kontrakt
- bedriftens egen kontrakt
- ingen kontrakt

Expo-kontrakten er egen, låst historikk knyttet til eksakt akseptert tilbudsversjon. Bedriften signerer først, deretter kunden via sikker tokenlenke. Når begge har signert, opprettes en privat slutt-PDF med kontrakt, tilbud, aksept og signatursporbarhet.

Viktige RPC-er:

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

## Avtalegrunnlag og garanti

Synlig prosjektfane heter **Avtalegrunnlag**. Intern nøkkel er fortsatt `tilbud`.

Avtalegrunnlag kan inneholde akseptbevis, signert Expo-kontrakt, bedriftens egen kontrakt og senere avtaledokumenter/endringer. Tom Avtalegrunnlag-flate er normalt for direkte prosjekt uten tilbud/kontrakt.

Ved dokumentert tetthetsgaranti gjelder:

```text
prosjekt lagret
→ signert kontrakt i Avtalegrunnlag
→ øvrige garanti-/Sopro-/overtagelseskrav oppfylt
→ garanti kan utstedes
```

Serververnet ligger på `warranty_registry`. Etter utstedt garanti kan prosjektets signerte kontraktsgrunnlag ikke fjernes.

## Recovery og QA

`critical-sales-recovery-check.mjs` er obligatorisk del av build. En tom eller uhydrert tilbudskladd skal aldri overskrive nyere serverdata.

Ved endringer i Sales eller integrasjoner som leser Sales-grunnlaget skal minst følgende verifiseres før merge:

- critical build
- critical Sales recovery
- Vite build
- Preview/runtime
- gammel og ny salgssak ved relevant endring
- offentlig tilbud/aksept ved relevant endring
- e-post-/Edge-status ved kommunikasjonsendringer
- at immutable tilbud/aksept ikke endres av prosjektfunksjoner
- HJELP samme runde ved brukerrettet flyt
