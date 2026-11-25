# Expo ProffDok – FASE 41B.2

## Prissøk, sensitiv nto-tilgang og samlet brukeradministrasjon

Dato: 10.09.2026

## Mål
FASE 41B.2 gir interne brukere et eget Prissøk mot aktivt ERP-vareregister uten at de må opprette et Butikktilbud. Samtidig skilles sensitiv intern nettopris fra vanlig katalog-/Prissøk-tilgang, og Systemadmin samler brukerstatus, firma, rolle, hovedmoduler og nto-rettighet på samme brukerkort.

## Omfang
Prissøk er tilgjengelig for godkjente, aktive brukere i:
- Ringside Rørleggerbedrift AS
- Bademiljø Expo
- Expo Proffsenter

Prissøk er read-only. Det oppretter eller endrer aldri tilbud, prosjekt eller vareregister.

Eksisterende Butikktilbud-katalogtilgang er ikke utvidet av denne fasen. Systemadmin beholder eksisterende Internt vareregister for import, oppdatering og aktivering.

## Brukerflate
### Prissøk
Eget menypunkt `Prissøk`, plassert etter Befaring/Tilbud. Søket bruker aktiv ERP-katalog og støtter varenavn, leverandør, varenummer og GTIN/EAN.

Treff viser alltid kunderelevante katalogfelt, blant annet kundepris inkl. og eks. mva. Produktlenke vises når den finnes.

### Sensitiv nto-pris
`Se interne nettopriser` er en separat brukerrettighet og ikke en hovedmodul.

Rettigheten gjelder både:
- selvstendig Prissøk
- varesøk inne i Butikktilbud

Uten rettigheten returnerer backend `NULL` for sensitive prisfelt, blant annet:
- purchase_net_ex_vat
- purchase_discount_percent
- gross_margin_percent

Frontend skjuler feltene helt når de er maskert. Sensitive verdier sendes dermed ikke til brukerens nettleser uten rettighet.

Systemadministrator har alltid nto-tilgang. Kun systemadministrator kan gi eller fjerne nto-rettigheten for andre brukere. Rettigheten kan bare tildeles brukere i de tre interne firmaene over.

## Samlet brukeradministrasjon
Systemadmin bruker eksisterende bruker-/godkjenningsflate som autoritativ arbeidsflate. På samme brukerkort vises:
- e-post og status
- firma og firmarolle
- systemadminrolle
- Prosjekter og dokumentasjon
- Befaring / Våtromstilbud
- Butikktilbud
- Se interne nettopriser, når firmaet er kvalifisert

Eksisterende godkjenn/deaktiver/reaktiver/systemadmin-flyt i hovedappen beholdes. Det separate moduladministrasjonspanelet skjules for systemadministrator for å unngå dobbelt brukergrensesnitt. Firmaadministratorens moduladministrasjon i Firma-fanen beholdes, men firmaadministrator kan ikke gi sensitiv nto-rettighet.

## Backend og sikkerhet
Ny tabell:
- `public.user_feature_access`

Ny feature key:
- `view_internal_net_prices`

Autoritative funksjoner:
- `current_user_has_feature_access(text)`
- `set_managed_sensitive_access(uuid, boolean)`
- `current_user_has_internal_store_price_search_access()`
- `search_internal_store_catalog_prices(text, integer)`

Eksisterende Butikktilbud-funksjoner beholder dagens firmascope, men maskerer nto/rabatt/margin server-side dersom `view_internal_net_prices` mangler:
- `search_internal_store_catalog(text, integer)`
- `internal_store_catalog_alternatives(uuid)`

Prissøk bruker eget firmascope og endrer ikke `current_user_has_internal_store_catalog_access()`.

## Migrering og bakoverkompatibilitet
Systemadministratorer får effektivt alltid nto-tilgang uten egen rad i `user_feature_access`.

Migreringen er laget slik at eksisterende produksjonsadferd for eventuelle allerede godkjente Butikktilbud-brukere kan bevares, mens nye ordinære brukere ikke får nto-tilgang automatisk. Systemadministrator kan deretter stramme inn rettigheten per bruker.

## QA / guards
`critical-price-search-check.mjs` skal stoppe build hvis blant annet:
- eksisterende Butikktilbud-firmatilgang utvides utilsiktet
- Prissøk får skriveoperasjoner
- nto/rabatt/margin returneres uten feature-maskering
- firmaadministrator får adgang til å tildele sensitiv nto-rettighet
- frontend viser maskert nto som 0 kr
- samlet Systemadmin-brukeradministrasjon eller Hjelp-kobling fjernes

## Hjelp
Hjelp har eget tema `Prissøk` for kvalifiserte brukere. Temaet forklarer søk, read-only-adferd, firmascope og at nto/rabatt/margin krever separat rettighet.

Systemadmin-Hjelp forklarer samlet brukeradministrasjon og at `Se interne nettopriser` kun kan styres av systemadministrator.

## Ikke del av FASE 41B.2
Tverrfirma samarbeid mellom Bademiljø Expo og Ringside for prosjekter/tilbud inngår ikke her. Det behandles separat i FASE 41B.3 slik at datascope/RLS kan designes og testes isolert.
