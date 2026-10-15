# Plukkliste → leverandørbestilling, 15.10.2026

Miljømål: **BEGGE**. Featurebranch: `fase45b-picklist-order`, fra main `f65a9768db342687caff220a3081b65a2ab732f2`.

## Funksjon

Prissøk → plukkliste → **Send bestilling til leverandør**. Velg en lagret firmakontakt eller skriv leverandørnavn og én e-postadresse. Velg varer, eventuelt med filter på vareleverandør, og angi valgfri referanse, leveringsadresse og melding. **Forhåndsvis bestilling** viser et uforanderlig varegrunnlag hentet på serveren. **Send bestilling** sender prisfri HTML og tekst, med den innloggede brukerens e-post som svaradresse. «Husk leverandør og e-post» lagrer kontakten etter provider-aksept. Plukklisten endres ikke.

Kontaktlisten gjelder aktivt firma og kan gjenbrukes eller ryddes. Den endrer ingen katalog-, leverandøravtale- eller ERP-data. Ingen kundepris, netto, rabatt eller margin aksepteres i RPC-en eller tas med i e-posten. Gjeldende Prissøk-tilgang, firma og medlemskap sjekkes på nytt ved hvert brukerkall. Frontend bruker ingen service-nøkkel.

Retry-kvitteringer lagres i privat schema i omtrent to døgn, med en egen daglig ryddejobb. Forsøk kan gjentas med samme uforanderlige innhold/nøkkel i 23 timer. E-posttjenestens idempotens beskytter mot doble e-poster ved uklare svar. Avbryt lukker uten ekstra varsel og beholder forsøket i den monterte arbeidsflaten. En ny bestilling eller reload er ikke samme forsøk.

## Verifisert lokalt

- `supplier-order-db-check.mjs`: 35 assertions med faktisk PostgreSQL/PGlite og hele migreringen; autentisering, firmaskille, medlemskap, tilbakekalt tilgang, service-only kvittering, prisfrie snapshots, aktive/importerte varer, replay, ugyldige felt/antall, opt-out, lagring og sletting.
- `supplier-order-email-check.mjs`: 31 assertions; faktiske handler-/e-postfunksjoner med mock provider. Ingen reelle e-poster sendt.
- `supplier-order-react-check.mjs`: 19 assertions i Chromium på desktop og 390px mobil. Manuell e-post, lagret kontakt, blandet plukkliste, serverens forhåndsvisning, dobbelklikk, usikkert svar/retry, stille Avbryt, firmabytte, deaktivert tilgang og ingen horisontal mobiloverflow. Mock API; dette er ikke en innlogget sandbox-prøve.
- Hele eksisterende `npm run build` med critical checks er grønn, inkludert Prissøk, plukkliste, Cordel, recovery, firmaprofil og tilgang. Skjermbilder av skjemaet er visuelt kontrollert.
- Avgrenset diff: plukklisteintegrasjon, ny bestillingskomponent/klient/stil, ny privat database/RPC/worker, egne tester og påkrevd dokumentasjon. Ingen endringer i main.jsx, navigasjon, HR, eksisterende RLS eller andre e-postfunksjoner.

## Blokkert før full Preview-test

Kallet `apply_migration` mot sandbox `ppvircenkjizeiqdxphj` ble avvist med **«Migration was declined»**, uten nærmere begrunnelse. Etterfølgende read-only kontroll viste at `supplier_order_private` ikke finnes, og at migreringen ikke er registrert. Avslaget er ikke omgått med SQL eller andre skriveverktøy. Ingen produksjonsdatabase eller e-postworker er endret.

Det gjenstår å godkjenne og anvende `20261015094130_picklist_supplier_order.sql` i sandbox, deploye kun den nye `supplier-order-email`-workeren, kontrollere eksisterende `RESEND_API_KEY`/`CHAT_FROM_EMAIL` uten å vise verdiene, kjøre faktiske sandbox-RPC-/tilgangstester og kontrollere Preview mot riktig backend. Deretter kan Kenneth teste med egen e-postadresse og bekrefte mottak samt gjenbruk av lagret kontakt. Ny **TEST OK** kreves før produksjon, deretter main → demo med preflight. Draft-PR skal ikke merges før dette er utført.
