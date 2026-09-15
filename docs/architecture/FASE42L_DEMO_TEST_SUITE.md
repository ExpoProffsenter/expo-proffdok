# Fase 42L – Demo/Test-saker

## Formål

Demo/Test gir systemadministrator et lite, resetbart datasett for produktvisning uten å opprette stadig nye testkunder og prosjekter. Demosakene bruker de ordinære Sales- og prosjektflatene; det bygges ikke en parallell «fake app».

## Arbeidsflyt

Systemadmin-panelet oppretter fem deterministiske steg for firmaet som er valgt under **Representerer**:

1. `DEMO42L-01-FORESPORSEL` – Forespørsel
2. `DEMO42L-02-BEFARING` – Befaring
3. `DEMO42L-03-TILBUD` – redigerbart tilbudsutkast
4. `DEMO42L-04-AKSEPTERT` – akseptert og klar for ekte prosjektaktivering
5. `DEMO42L-05-PROSJEKT` – ferdig demo-prosjekt for prosjektflaten

Alle payloads har både `demoCase: true` og `demoSuiteKey: "expo-proffdok-demo-42l"`.

## Sikkerhetsgrense

Reset er bevisst smal:

- bare systemadministrator kan bruke panelet;
- aktivt `active_company_id` fra arbeidsprofilen er obligatorisk;
- Sales-rader identifiseres med eksakte, deterministiske request refs;
- reset upserter disse fem radene i stedet for å slette vilkårlige Sales-rader;
- prosjekt slettes bare innen aktivt `company_scope_id` når tilhørende Sales-rad først er bekreftet som serverlagret 42L-demo;
- panelopprettet prosjekt har egen demo-markør;
- prosjekt som opprettes fra `DEMO42L-04-AKSEPTERT` kan ryddes bare når request ref matcher eksakt og den serverlagrede Sales-raden fortsatt er en gyldig 42L-demo;
- det finnes ingen sletting på kundenavn, prosjektnavn, `LIKE` eller fritekstsøk.

Dette betyr at en vanlig kundesak ikke kan havne i reset bare fordi noen har skrevet «demo» i navnet.

## Irreversible handlinger

42L-sakene er laget for arbeidsflytvisning, ikke for å bygge varig kundehistorikk.

- `publishSalesOfferAndBuildLink()` avviser en servermerket demosak før `publish_sales_offer` kalles.
- Akseptbevis-PDF avvises før PDF/Storage opprettes.
- Demosaken «Akseptert» er forhåndsseedet med akseptdata i `sales_requests`, men uten `publicToken` eller låst `sales_offer`/versjon.
- Prosjektaktivering er tillatt fordi dette er et sentralt demosteg. Neste reset rydder prosjektet gjennom den strenge demoavgrensningen og setter den aksepterte saken tilbake.

## Data og RLS

42L v1 bruker eksisterende tabeller og eksisterende RLS:

- `sales_requests`
- `projects`

Det innføres ingen ny Production-tabell, RLS-policy, Storage-policy eller Edge Function i 42L v1. `created_by` settes til innlogget systemadministrator slik at eksisterende Sales-insertkontrakt beholdes. Prosjekt opprettes med innlogget bruker som eier; eksisterende prosjekt-trigger binder det til aktiv arbeidsprofil.

## Regresjonsvern

`scripts/critical-demo-suite-check.mjs` kontrollerer blant annet:

- fast suite-key og alle fem request refs;
- systemadmin- og aktiv firmakrav;
- company-scopet prosjektrydding;
- serververifisert demo-Sales-rad før sletting;
- at reset ikke sletter etter navn/fritekst;
- at publiseringssperren ligger før `publish_sales_offer`;
- at akseptbevis sperres før PDF/Storage;
- at Demo/Test-panelet faktisk er montert i Systemadmin.

Checken kjøres både av `npm run check:critical` og `npm run build`.

## QA før merge

Preview skal minst verifisere:

1. Velg `Representerer Expo Proffsenter` og opprett/reset demosuiten.
2. Kontroller at fem DEMO42L-saker vises i riktig Sales-stadium.
3. Åpne og rediger Forespørsel, Befaring og Tilbud som vanlige saker.
4. Forsøk å publisere DEMO-tilbud og bekreft at handlingen stoppes uten kundelenke/versjon.
5. Åpne `DEMO42L-04-AKSEPTERT`, aktiver som prosjekt og kontroller ordinær prosjektflate.
6. Gå tilbake til Systemadmin og reset. Det nyaktiverte demo-prosjektet skal forsvinne og Akseptert-saken være klar på nytt.
7. Åpne `DEMO42L-05-PROSJEKT` og kontroller anbefalt prosjektløp: Oversikt → Avtalegrunnlag → Prosjektering → Fremdrift.
8. Bytt Representerer-firma og kontroller at demosuiten er separat per firma.
9. Kontroller en vanlig eksisterende Sales-sak/prosjekt og bekreft at den ikke endres av reset.

Ingen merge før eksplisitt `TEST OK`.
