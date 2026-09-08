# EXPO PROFFDOK – FASE 39B.1
## Internt vareregister – Ringside / Bademiljø Expo

### Formål
FASE 39B.1 etablerer grunnmuren for et stort, søkbart vareregister til Butikktilbud uten å endre eksisterende publisering, kundelenker, aksept eller historikk.

Vareregisteret inneholder Ringsides innkjøps-/nettopriser og er derfor en egen intern sikkerhetssone.

### Sikkerhetsgrense
Tilgang til katalogen krever samtidig:

1. godkjent og aktiv bruker,
2. `store_offers`-modultilgang,
3. faktisk medlemskap i Sales-firmascopet:
   - `Ringside Rørleggerbedrift AS`, eller
   - `Bademiljø Expo`.

Org.nr. brukes **ikke** som sikkerhetsgrense. Dette er bevisst fordi flere Ringside-profiler/merkevarer kan dele samme juridiske organisasjonsnummer.

Systemadministrator får ikke katalogtilgang bare fordi rollen er systemadministrator; brukeren må også være medlem av et av de to tillatte firmascopene.

Direkte INSERT/UPDATE/DELETE fra klient er sperret. Import skjer kun gjennom security-definer RPC-er og krever i tillegg systemadministrator- eller firmaadministratorrolle.

### Ingen nettopris i kundedata
`purchase_net_ex_vat` ligger kun i intern katalog/staging.

Når katalog senere kobles til Butikktilbud skal kundens tilbudslinje bare få kundeegnet produktinformasjon og salgspris. Intern nettopris skal ikke kopieres til publisert tilbudsversjon, PDF eller offentlig kundelenke.

### ERP-format
Den faste ERP-eksporten behandles som:

- Windows-1252
- én fysisk vare per linje
- semikolon som skilletegn
- nøyaktig 18 felt
- ingen CSV-quote-tolkning; varetekster kan inneholde dobbelapostrof uten at feltstrukturen endres

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
| 12–15 | ERP-flagg, bevart uten å tillegge dem forretningsbetydning |
| 16 | Varetekst |
| 17 | GTIN/EAN |
| 18 | Foreløpig tomt/reservert |

Varer droppes før staging dersom:
- varenummer mangler,
- netto innkjøpspris er `<= 0`,
- kundepris eks. mva. er `<= 0`, eller
- kundepris inkl. mva. er `<= 0`.

### Validering mot eksport 2026-09-08
Den analyserte ERP-eksporten hadde:
- 489 923 fysiske linjer,
- 18 felt på samtlige linjer,
- 468 426 brukbare linjer etter nullpris-/varenummerfilter,
- 3 linjer uten varenummer,
- 21 494 linjer med null/ikke positiv netto- eller utsalgspris,
- kun én duplikat på kombinasjonen leverandør + varenummer i det brukbare datasettet.

Selve ERP-filen og prisdata skal **aldri** legges i GitHub-repositoriet.

### Identitet og leverandøralternativer
Primær intern vareidentitet er:

`leverandør + leverandørens varenummer`

Samme varenummer på tvers av leverandører er ikke en sikker produktidentitet.

Leverandøralternativer kobles derfor kun automatisk når aktiv vare har samme normaliserte GTIN/EAN. Dersom GTIN mangler, vises ikke automatiske leverandøralternativer basert kun på varenummer.

### NOBB og produktlink
ERP-filen inneholder ikke et eget NOBB-nummer eller produkt-URL.

Katalogtabellen har likevel feltene:
- `nobb_number`
- `product_url`
- `image_url`

Disse er klargjort for en senere berikelsesfase, for eksempel via GTIN mot NOBB/Byggtjeneste. Ingen ekstern NOBB-integrasjon er aktivert i 39B.1.

### Prisoppdatering
Prisoppdatering bruker staging:

1. Start import.
2. Les ERP-filen lokalt i nettleseren som Windows-1252.
3. Valider hver linje.
4. Send kun gyldige varer i batcher på maks 2 500 rader.
5. Hele den gamle aktive katalogen brukes fortsatt mens importen pågår.
6. Ved `finalize` låses aktiveringen i én databasetransaksjon.
7. Nye/endrede varer upsertes, varer som ikke finnes i ny fil blir inaktive.
8. Staging slettes etter vellykket aktivering.
9. Tidligere publiserte/aksepterte tilbud påvirkes ikke.

Dette gjør kvartalsvise prisoppdateringer trygge uten å beholde fire komplette katalogkopier per år.

### Søkemodell
Aktive varer indekseres på:
- leverandør + varenummer,
- GTIN,
- samlet søketekst med trigramindeks.

Søk-RPC returnerer maks 50 treff og krever samme interne katalogtilgang.

### Neste runde – FASE 39B.2
39B.2 kobler grunnmuren til Butikktilbud:

- søkefelt i varebygger,
- velg vare fra katalog,
- vis leverandøralternativer via GTIN,
- kopier kun kundeegnet snapshot til tilbudet,
- behold valgt intern katalogreferanse separat fra kundedata,
- ERP-vareliste etter kundeaksept,
- enkel importside med fremdrift og kontrolltall.

FASE 39B.1 endrer ikke eksisterende Butikktilbud-UI.
