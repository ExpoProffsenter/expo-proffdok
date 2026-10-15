# Plukkliste → leverandørbestilling, 15.10.2026

Miljømål: **BEGGE**. Featurebranch: `fase45b-picklist-order`, fra main `f65a9768db342687caff220a3081b65a2ab732f2`.

## Funksjon

Prissøk → plukkliste → **Send bestilling til leverandør**. Velg en lagret firmakontakt eller skriv leverandørnavn og én e-postadresse. Velg varer, eventuelt med filter på vareleverandør, og angi valgfri referanse og melding, og en påkrevd leveringsadresse. **Forhåndsvis bestilling** viser et uforanderlig varegrunnlag med varenummer, netto enhetspris, linjesummer og varesum eks. mva. hentet på serveren. **Send bestilling** sender HTML og tekst med varenummer og netto-pris eks. mva., med den innloggede brukerens e-post som svaradresse. «Husk leverandør og e-post» lagrer kontakten etter provider-aksept. Plukklisten endres ikke.

Kontaktlisten gjelder aktivt firma og kan gjenbrukes eller ryddes. Den endrer ingen katalog-, leverandøravtale- eller ERP-data. Priser kan ikke sendes fra klienten. Netto-pris hentes på serveren med fersk view_internal_net_prices-tilgang; kundepris, rabatt og margin tas ikke med. Gjeldende Prissøk-tilgang, firma og medlemskap sjekkes på nytt ved hvert brukerkall. Frontend bruker ingen service-nøkkel.

Retry-kvitteringer lagres i privat schema i omtrent to døgn, med en egen daglig ryddejobb. Forsøk kan gjentas med samme uforanderlige innhold/nøkkel i 23 timer. E-posttjenestens idempotens beskytter mot doble e-poster ved uklare svar. Avbryt lukker uten ekstra varsel og beholder forsøket i den monterte arbeidsflaten. En ny bestilling eller reload er ikke samme forsøk.

## Verifisert lokalt

- `supplier-order-db-check.mjs`: 44 assertions med faktisk PostgreSQL/PGlite og hele migreringen; autentisering, firmaskille, medlemskap, tilbakekalt tilgang, service-only kvittering, nettopriser fra serveren, aktive/importerte varer, replay, ugyldige felt/antall, opt-out, lagring og sletting.
- `supplier-order-email-check.mjs`: 47 assertions; faktiske handler-/e-postfunksjoner med mock provider. Dette er mock-tester; de to uttrykkelig bestilte test-e-postene er dokumentert nedenfor.
- `supplier-order-react-check.mjs`: 34 assertions i Chromium på desktop og 390px mobil. Manuell e-post, lagret kontakt, blandet plukkliste, serverens forhåndsvisning, dobbelklikk, usikkert svar/retry, stille Avbryt, firmabytte, deaktivert tilgang og ingen horisontal mobiloverflow. Mock API; dette er ikke en innlogget sandbox-prøve.
- Hele eksisterende `npm run build` med critical checks er grønn, inkludert Prissøk, plukkliste, Cordel, recovery, firmaprofil og tilgang. Skjermbilder av skjemaet er visuelt kontrollert.
- Avgrenset diff: plukklisteintegrasjon, ny bestillingskomponent/klient/stil, ny privat database/RPC/worker, egne tester og påkrevd dokumentasjon. Database- og e-posttestene kjøres også i PR Core Safety. Ingen endringer i main.jsx, navigasjon, HR, eksisterende RLS eller andre e-postfunksjoner.

## Sandbox og faktisk testutsending

Sandbox-migreringen `20261015094130_picklist_supplier_order.sql` er nå anvendt på `ppvircenkjizeiqdxphj`, med samsvarende migreringsversjon. Kun nye tabeller/funksjoner/grants/egen ryddejobb er opprettet. `supplier-order-email` er ACTIVE v3, med manuell Auth-validering for brukerflyt og eget Vault-token for intern dispatch. Tokenet vises aldri i klienten eller testutdata.

`scripts/supplier-order-sandbox-smoke.sql` er kjørt mot faktisk sandbox med authenticated/service_role: kontekst, kanonisk netto/varenummer/sum, uforanderlig replay, feil firma, avvist klientpris, påkrevd levering, service-only fullføring/dispatch, lagring/sletting og tilbakekalt bruker. Alle endringer ble rullet tilbake. Demo-profilen er fortsatt godkjent, og ingen QA-kontakt ble stående igjen. Fingeravtrykket av eksisterende public-funksjoner (uten supplier_order) er uendret: `349de60329daad68e8e8823adb8a1865`. Advisors varsler bare de forventede private tabellene uten klientpolicies og de tre bevisst autentiserte SECURITY DEFINER-RPC-ene i dette scopet. Ingen nye anonymous grants.

Sandbox-transporten returnerer kontrollert HTTP 503 «E-posttjenesten er ikke konfigurert». `RESEND_API_KEY`/`CHAT_FROM_EMAIL` er ikke tilgjengelig som komplett oppsett der. Det ene sandbox-forsøket sendte ingen e-post (kvittering har ingen provider-ID). Full innlogget sending fra denne Preview-en er derfor ikke verifisert. Ikke påstå at sandbox-utsending virker, og ikke kopier produksjonshemmeligheter inn i chatten.

Kenneth ba uttrykkelig om en test til kenneth@ringside.no. En midlertidig fast-mottaker-probe brukte den samme `supplierOrderMail`-funksjonen og den eksisterende ordinære e-posttjenesten. Den tok ikke imot dynamisk mottaker/innhold, krevde et tilfeldig SHA-256-verifisert token, utløp etter 15 minutter og brukte stabil provider-nøkkel. Ingen produksjonsordre eller bestillingsbackend ble opprettet. Testen brukte Kenneths kontrollerte firmaprofil (Ringside), én katalogvare med varenummer/netto og firmadressen som tydelig testlevering.

- Første test: provider aksepterte med ID `01a13f0a-0646-7815-b0cf-933776e3c82c`. Kenneth viste deretter skjermbilde av mottatt melding og ba om tydeligere bekreftelsesadresse og appens vanlige layout.
- Oppdatert test: provider aksepterte med ID `01a13f11-3ebb-7dc7-9e61-1980f6d540f1`. Kenneth bekreftet mottatt og OK 15.10.2026 kl. 12:26 norsk tid.
- Proben `supplier-order-test` er etterpå erstattet med v4 som alltid svarer 410, med JWT-krav aktivert. Midlertidige lokale tokenfiler er slettet. Dette er ingen åpen produksjonsutsendingsfunksjon.

## Gjeldende e-postkontrakt og manuell prøve

Ordrebekreftelse og forventet leveringsdato skal sendes til en **uttrykkelig oppgitt, klikkbar adresse** i et fremhevet felt øverst. Adressen gjentas i signaturen. Formuleringen «ved å svare på denne e-posten» er fjernet. Reply-To er i tillegg satt til samme innloggede avsenderadresse. Firmalogo, Expo ProffDok-toppfelt, mørk ramme og innholdsfelt følger eksisterende app-e-poster. Ringside/Bademiljø Expo bruker appens etablerte firmalogoer. Varenummer, netto eks. mva., linjesum, varesum, leveringsadresse, leveringsomkostningstekst og firmainfo beholdes.

Fast Preview: https://expo-proffdok-git-fase45b-picklist-order-ringside.vercel.app . Prøv Prissøk → legg til vare/antall → Send bestilling til leverandør → skriv mottaker og leveringsadresse → Forhåndsvis bestilling. Kontroller varene, netto og «Ordrebekreftelse sendes til». Lagret kontakt krever faktisk bekreftet sending; ingen kontakt lagres ved Preview/503.

Ny **TEST OK** kreves før merge/produksjonssetting av bestillingsfunksjonen, deretter main → demo med preflight. Sandbox trenger eget e-postoppsett før full ende-til-ende-sending kan prøves der. Draft-PR #247 er ikke en produksjonsaktivering.

## Ryddigere knapper etter brukerprøve

Kenneth viste 15.10.2026 et skjermbilde der utskrift, Cordel, internt prisvalg, sletting og leverandørbestilling stod på ulike linjer. Oppsettet er nå samlet: lagre/vis/slett ved overskriften og en fast handlingsrad under med bestilling, utskrift av plukkliste, Cordel og prisutskrift. Alle fire handlingsknapper er 56 px høye og står på samme linje på desktop. Prisvalget står under prisutskrift og importveiledningen under Cordel. På mobil står bestilling i full bredde, med utskrift/Cordel på raden under.

`SupplierOrder` tar en ren `renderActions`-prop for å plassere triggeren sammen med de andre handlingene; bestillingspanelet ligger fortsatt nedenfor og beholder samme state/firmakey. Ingen backend-, e-post-, lagrings- eller eksportlogikk er endret. Den utvidede Chromium-testen monterer nå også faktisk `StorePriceSearchView`, med ekte interne komponenter/Cordel-hook og mock RPC. Den verifiserer synlig handlingsrad, like høyder og vertikal plassering, riktig plassering av prisvalget, vis/skjul, mobilbredde og at en åpen bestillingskladd beholdes ved endring av vareantall. Nye desktop-/mobilbilder er visuelt kontrollert. Hele critical/build er grønn.
