# EXPO PROFFDOK – FASE 39B.2
## Internt vareregister + Butikktilbud

**Status:** Implementert og Preview-testet 08.09.2026  
**Scope:** Ringside Rørleggerbedrift AS / Bademiljø Expo  
**Katalog:** 468 425 aktive brukbare varer etter validering

## 1. Formål

FASE 39B etablerer et stort internt ERP-vareregister og kobler dette trygt til Butikktilbud. Målet er raskere tilbudsarbeid uten at interne innkjøpspriser lekker til kundegrunnlag eller historiske tilbud endres ved senere prisoppdateringer.

Butikktilbud er samtidig utvidet fra en ren varelinjeflyt til en generell tilbudsbygger for butikk, service og mindre leveranser. Et tilbud bygges med **tilbudsposter og avsnitt**, der vareregisteret er et valgfritt oppslag – ikke et krav.

## 2. Sikkerhetsgrense

Katalogtilgang krever samtidig:

1. godkjent og aktiv bruker,
2. `store_offers`-modultilgang,
3. faktisk medlemskap i tillatt Sales-firmascop:
   - `Ringside Rørleggerbedrift AS`, eller
   - `Bademiljø Expo`.

`Expo Proffsenter` har ikke katalogtilgang selv om juridisk organisasjonsnummer kan være felles. **Org.nr. er ikke sikkerhetsgrense.** Faktisk firma-/Sales-scope er grensen.

RLS/RPC er autoritativ tilgangskontroll. Frontend alene gir aldri katalogtilgang.

Kun **systemadministrator** kan starte/aktivere ERP-oppdatering. Firmaadministrator kan ikke administrere katalogen.

Direkte klient-INSERT/UPDATE/DELETE mot katalogtabellene er sperret.

## 3. Ingen nettopris i kundedata

Katalogen kan inneholde:

- leverandør/bruttopris eks. mva.
- innkjøpsrabatt
- netto innkjøpspris eks. mva.
- påslag/DG
- kundepris eks. og inkl. mva.

`purchase_net_ex_vat` og øvrig intern kalkulasjonsinformasjon skal **aldri** kopieres til:

- Sales-kladd som kundedata,
- `sales_offer_versions`,
- offentlig kundelenke,
- tilbuds-PDF,
- akseptbevis,
- kunde-e-post.

Når bruker velger en katalogvare kopieres bare kundeegnet produktsnapshot og salgspris til tilbudet. Intern katalogreferanse kan beholdes separat for sporbarhet.

## 4. ERP-format

Fast ERP-eksport behandles som:

- Windows-1252
- én fysisk vare per linje
- semikolon som skilletegn
- nøyaktig 18 felt
- ingen CSV-quote-tolkning

Kartlegging:

| Felt | Bruk |
|---|---|
| 1 | Leverandør |
| 2 | Leverandørens varenummer |
| 3 | Leverandør/bruttopris eks. mva. |
| 4 | Innkjøpsrabatt % |
| 5 | Netto innkjøpspris eks. mva. |
| 6 | Påslag % |
| 7 | Bruttomargin/DG % |
| 8 | Kundepris eks. mva. |
| 9 | Kundepris inkl. mva. |
| 10 | Produktgruppe |
| 11 | Prisdato `YYYYMMDD` |
| 12–15 | ERP-flagg |
| 16 | Varetekst |
| 17 | GTIN/EAN |
| 18 | Reservert/tomt |

Rader avvises dersom:

- leverandørens varenummer mangler,
- netto innkjøpspris er `<= 0`,
- kundepris eks. mva. er `<= 0`, eller
- kundepris inkl. mva. er `<= 0`.

ERP-filen og prisdata skal aldri legges i GitHub-repositoriet.

## 5. Validering mot ERP-eksport 08.09.2026

Eksporten inneholdt:

- 489 923 rå linjer
- nøyaktig 18 felt på samtlige linjer
- 21 494 rader hoppet over på grunn av null/ikke positiv pris
- 3 rader uten varenummer
- 1 duplikat på leverandør + varenummer
- **468 425 unike brukbare varer**

Rundt 261 700 av de brukbare varene hadde plausibel GTIN/EAN og kan brukes til leverandøralternativer.

## 6. Vareidentitet og leverandøralternativer

Primær intern vareidentitet er:

```text
leverandør + leverandørens varenummer
```

Varenummer alene er ikke trygt på tvers av leverandører.

Leverandøralternativer kobles bare automatisk når varer har samme normaliserte GTIN/EAN. Manglende GTIN gir ingen automatisk alternativkobling basert kun på varenummer.

ERP-filen inneholder ikke NOBB-nummer eller produkt-URL. Feltene `nobb_number`, `product_url` og `image_url` er klargjort for senere berikelse, men ekstern NOBB/Byggtjeneste-integrasjon er ikke en avhengighet i FASE 39B.2.

## 7. Prisoppdatering – single-copy

Den første staging/aktiveringsmodellen ble forkastet etter at dobbel katalogkopi og indeks/WAL-belastning ga unødvendig diskpress.

Gjeldende modell er **single-copy**:

1. Systemadministrator starter import i Systemadmin.
2. Vareregister-søk låses mens importen pågår.
3. TXT-filen parses lokalt i nettleseren.
4. Gyldige varer sendes i kontrollerte batcher direkte til den primære katalogen/importkonteksten.
5. Det holdes ikke en ekstra full aktiv katalogkopi gjennom hele importen.
6. Avsluttende aktivering er liten og gjør ny katalog søkbar.
7. Midlertidig importtilstand ryddes etter ferdig import.
8. Historiske publiserte/aksepterte tilbud endres aldri.

Denne modellen reduserer database-/WAL-belastning og holder katalogen rundt 283 MB ved 468 425 varer i målt produksjonsdatabase.

## 8. Søkemodell

Aktive varer kan søkes på:

- leverandør
- leverandørens varenummer
- GTIN/EAN
- varetekst / samlet søketekst

Søk returnerer begrenset antall relevante treff og krever katalogtilgang på server.

Hele treffraden i Butikktilbud er klikkbar. Valg fyller posten med kundeegnet produktinformasjon og gjeldende salgspris.

## 9. Butikktilbud – post-/avsnittsmodell

Butikktilbud bruker følgende hovedmodell:

```text
Tilbud
  ├─ Avsnitt: Varmepumpe
  │   ├─ Post: Thermia Calibra
  │   │   ├─ knyttet montering
  │   │   └─ opsjoner / alternativer
  │   ├─ Post: Akkumulatortank
  │   └─ Post: Rør og deler
  └─ Avsnitt: Elektriker
      └─ Post: Elektrikerarbeid
```

Avsnitt er interne `store_text`-linjer med `storeSectionMode = "group"`. De har ingen pris og skal presenteres som overskrifter – aldri som `0 kr`-linjer.

Robust seksjonsdeteksjon må også kjenne igjen eldre/migrerte markører, blant annet `store-section-*` og seksjonsmarkør i produkt-URL/metadata.

Avsnitt skal behandles likt i:

- tilbudsbygger
- intern Sales-visning
- kundelenke
- tilbuds-PDF
- akseptbevis

De skal ikke bruke prislinjenummer. Nummerering gjelder bare reelle tilbudsposter.

## 10. Poster, montering og opsjoner

En post kan være:

- manuelt arbeid/service
- katalogvare
- annen vare/materiale
- elektriker/maler/avfall/rigg o.l.

Katalogkobling låser ikke kundeteksten. Bruker kan gjøre beskrivelsen mer kundevennlig uten å miste katalogreferansen.

Montering kan:

- knyttes direkte til en post
- registreres som antall/timer × pris pr. enhet
- opprettes som selvstendig «Kun montering»

Opsjoner kan være:

- tillegg/oppgradering
- alternativ/erstatter

Ved alternativ vare velges monteringsmodell:

- samme montering som grunnpost
- egen/endret monteringsmengde og enhetspris
- ingen montering

## 11. Autosave, recovery og navigasjon

Butikktilbud har serverautosave av aktuell sak i stedet for å være avhengig av full omskriving av hele Sales-listen.

Kritiske kontrakter:

- tom/stale lokal kladd skal aldri overstyre et eksisterende servertilbud med reelt innhold
- tom Enter-opprettet post prunes ved lagring
- avsnitt skal overleve normalisering som `store_text`, ikke bli vanlig `work`-linje
- Tilbake fra Butikktilbud lagrer kladden direkte uten gammel full tilbudsvalideringsdialog
- vanlig klikk på Befaring/Tilbud åpner sakslisten
- full reload inne i en Sales-sak kan gjenåpne aktuell sak

Firmascopet lokal Sales-cache kan brukes for rask førstevisning, men Supabase er alltid autoritativ og overskriver cachen etter serverlasting.

## 12. Publisering og historikk

Butikktilbud følger eksisterende Sales-versjonering:

```text
redigerbar kladd
→ publisert låst versjon
→ kundelenke/e-post
→ kunde velger opsjoner
→ aksepterer eller avviser
→ saken avsluttes i Sales
```

Butikktilbud oppretter **ikke** ProffDok-prosjekt eller kontrakt ved aksept.

Publiserte, aksepterte og avviste versjoner er immutable snapshots. Senere ERP-prisoppdatering påvirker dem ikke.

Automatisk oppfølging fra FASE 37A2 beholdes uendret og er en egen låst oppfølgingsplan per publisert Butikktilbud-versjon.

## 13. Avvisning og serverstyrt varsel

Digital avvisning lagres først av `decline_sales_offer(...)` med eksakt publisert versjon i `declined_payload`. Deretter kan Edge Function:

```text
sales-offer-decline-notify
```

sende varsel til brukeren som publiserte akkurat den avviste tilbudsversjonen. Klienten kan ikke angi mottaker.

Idempotens ligger i:

```text
public.sales_offer_decline_notifications
```

med unik nøkkel på `offer_id + offer_version_id + recipient_type`. Tabellen har RLS aktivert og ingen klientpolicyer; bare service-role bruker loggen.

Åpning av en allerede avvist offentlig tilbudslenke kan forsøke varselet på nytt som recovery. Uniknøkkelen sørger for at samme versjon ikke gir flere e-poster. Varslingsfeil kan aldri reversere kundens allerede registrerte avvisning.

## 14. Systemadmin

Vareregistervedlikehold ligger i Systemadministrasjon.

Systemadministrator skal kunne:

- velge ERP TXT-fil
- starte oppdatering
- se importstatus/fremdrift
- kontrollere tellinger for leste, gyldige/hoppede og aktive varer
- se at katalogsøk er sperret under import

Vanlig Butikktilbud-editor skal ikke vise det store administrasjonspanelet for katalogimport.

## 15. Viktige filer

Klient/katalog:

```text
src/modules/storeCatalog/
src/modules/storeCatalog/systemAdminStoreCatalogUx.jsx
src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx
src/modules/sales/components/SalesStoreOfferBuilderCatalog.jsx
src/modules/sales/services/salesStoreOfferAutosave.js
src/modules/sales/services/salesStoreOffers.js
src/modules/sales/services/salesSupabase.js
src/modules/sales/utils/storeSectionLine.js
```

Presentasjon/historikk:

```text
src/modules/sales/components/SalesDetailView.jsx
src/modules/sales/components/SalesCustomerView.jsx
src/modules/sales/components/SalesCustomerViewCore.jsx
src/modules/sales/services/salesOfferPdf.js
src/modules/sales/services/salesAcceptanceProofPdf.js
```

Server/QA:

```text
supabase/functions/sales-offer-decline-notify/
supabase/migrations/20260908165435_fase39b2_store_decline_notifications.sql
scripts/critical-store-catalog-check.mjs
scripts/critical-store-decline-check.mjs
scripts/critical-sales-recovery-check.mjs
```

Supabase-migrasjoner i FASE 39B inkluderer blant annet:

```text
20260908105500_fase39b1_internal_store_catalog.sql
20260908114500_fase39b2_single_copy_catalog_import.sql
20260908115800_fase39b2_catalog_systemadmin_only.sql
20260908165435_fase39b2_store_decline_notifications.sql
```

## 16. Utsatt videreutvikling

Ikke del av ferdig 39B.2:

- ekstern NOBB/Byggtjeneste-berikelse via GTIN
- komplett Butikktilbud-mal med avsnitt/poster/montering/opsjoner
- ERP-vareliste/PDF etter aksept gruppert per leverandør
- eventuell CSV/Excel-eksport av varebehov

Disse må bygges som egne runder uten å svekke katalogsikkerhet eller immutable tilbudshistorikk.
