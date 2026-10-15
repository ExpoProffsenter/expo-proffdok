# Firmaaktivert varetelling – 15. oktober 2026

Miljømål: BEGGE. Egen branch fra main `f65a9768`, uten leverandørbestillings-PR #247.

## Scope og bruk

- Systemadmin → firma → **Aktiver varetelling**. Standard av. Eksisterende godkjent/aktiv bruker, Prissøk-tilgang og medlemskap i aktivt firma kreves i tillegg. Systemadmin beholder eksisterende støtteadgang.
- Prissøk viser en egen varetellingsseksjon bare når serveren bekrefter aktivering. Hjelpen monteres bare i denne autoriserte flaten. Ingen global meny eller Startside er endret.
- Opprett telling med navn, lager i Cordel og telledato. Firmaets tellere samarbeider på samme telling. Skann/søk, velg en konkret katalogvare med leverandør, angi hylle/område og antall. Alternative leverandører på samme strekkode blir separate valg. Søk har sidevisning med «Vis flere leverandører og varer».
- Manuell vare krever leverandør, varenummer og beskrivelse; strekkode er valgfri. Katalogvarer får identiteten fra aktiv serverkatalog, aldri klientens kopierte metadata.
- Antall 0 og inntil tre desimaler støttes. Gjentatt registrering summeres per leverandør + varenummer + område. «Endre antall» erstatter med eksplisitt revisjonskontroll. Ulagret innlegging hindrer bytte av telling og ny vare før lagring/avbryt.
- Varetellingslinjer har ingen grense på 30. Server-/skjermside er 100 linjer. Tellelisten har begrenset rullehøyde også på mobil. Listevelgeren viser de siste 200 tellingene. Ingen automatisk sletting er innført; to måneders HR-retensjon gjelder ikke denne modulen.
- Serverlagring etter hvert trykk på «Registrer antall». Prisfri kladd i fanens sessionStorage er isolert per bruker/firma. Remount og reload henter serverdata før registrerte linjer vises. Ubekreftet nettverksresultat beholder eksakt kommando-ID og låser payload til retry; serverkvittering gjør retry idempotent. Ingen offlinebekreftelse vises.
- Avslutning låser tellingen og kontrollerer at ingen ny registrering har kommet siden sist lest. Telling kan fortsatt eksporteres. Ingen frist/ansvarligvarsel eller e-post innføres.

## Cordel-grense og eksport

Brukerbildet viser Import → ASCII-Tekstfil, ikke feltdefinisjonen. Cordels primærkilder bekrefter filimport, men spesifiserer ikke kundens kolonnemapping:

- https://kundesider.cordel.no/hc/no/articles/19956139893521-Generelt
- https://kundesider.cordel.no/hc/no/articles/19571629736593-Varetelling-med-h%C3%A5ndterminal

Kenneth bekreftet 15.10 kl. 13:10 at vareimporten følger samme oppsett som ved tilbud. UI bruker derfor det eksisterende vare-ASCII-formatet: NR = 1, Mengde = 2, Fagområde/leverandør = 3; semikolon, desimalkomma, Windows-1252, CRLF og ingen overskrift/BOM. Fast filnavn ProffDok_Cordel_Varetelling.txt gjør at importdefinisjonen kan gjenbrukes. Byte-likhet med eksisterende plukklisteeksport er testet for felles gyldige antall; varetelling støtter i tillegg 0 og større antall. Områder summeres per leverandør og varenummer. Ingen tvetydig automatisk sammenslåing på GTIN. Cordel-knappen følger eksisterende brukerrettighet «Eksport til Cordel», også med fersk kontroll før nedlasting. Ingen avansert formatvelger kreves av tellerne.

Kontrollfil er UTF-8 CSV med firma, dato, lager, område, leverandør, varenummer, GTIN, beskrivelse og antall. Formelfelt sikres for regneark. Ingen prisfelt. Begge filer leser alle sider og stopper hvis tellingens revisjon endres under eksport. Ingen direkte lageroppdatering eller ERP-sending.

**Før produksjonsgodkjenning:** liten prøveimport av den nye varetellingsfilen i Cordel gjenstår. Kundens bekreftelse av samme importoppsett legges til grunn; det bes ikke om nye skjermbilder for allerede kjent vareformat. Kontroller at riktig lager er valgt og om import erstatter/legger til beholdning.

## Verifisering

- `stocktake-check.mjs`: eksakte eksportbytes, ledende nuller, antall 0/desimaler, leverandørskille, områdesummering, ugyldige tegn og CSV-formelfelt.
- `stocktake-db-check.mjs`: **51 assertions**, reell PostgreSQL-migration og RPC-kall i PGlite, default av, admin-CAS, firmaskille, samarbeid, katalogidentitet, 117+ rader, nulltelling, nettverksreplay, stale edit/delete, deaktivert bruker/firma, anon-avslag og avslutning.
- `stocktake-react-check.mjs`: **25 assertions**, reelle React-komponenter/CSS i Chromium med kontrollert API-grense, PC/mobil, to leverandører på samme strekkode, manuell vare, 0/desimaler, reload-kladd, tapt svar og samme kommando-ID, konfliktbevaring, 122 linjer og eksport av alle sider, avslutning og firmabytte/tilbakekalling. Skannerens kameraavlesning er simulert; fysisk kamera må brukerprøves.
- Full `npm run build` inklusive eksisterende critical-suite grønn. Eksisterende Prissøk/plukkliste, Cordel-eksport, tilgang og firmaprofil er kontrollert uten endring av tidligere kontrakter.
- Faktisk Sandbox-smoke (`stocktake-sandbox-smoke.sql`) opprettet 106 syntetiske linjer, testet sider, replay, firmscope og avslutning; alle syntetiske rader rullet tilbake. Etterpå 0 sessions/0 lines.
- Sandbox-migrering anvendt og migreringsversjon justert til CLI-fil `20261015105313`. Bare Expo Proffsenter er aktivert i Sandbox for Preview-prøven. Ingen produksjonsmigrering eller firmaaktivering utført.
- Fingeravtrykk for alle tidligere public-funksjoner før/etter: `ed4f8cf1aff9743801bd12cab19bd9e6`, uendret.
- Security-advisors kontrollert: egne fire private RLS-tabeller uten direkte klientgrants (forventet INFO), syv bevisst autentiserte SECURITY DEFINER-RPC-er med intern aktør-/scopekontroll (forventet WARN). Ingen anon-grants eller prisfelt. https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

Kenneth godkjente alt 15.10 kl. 13:18 og godkjente samtidig den avgrensede mobilflyttingen. Ny manuell godkjenningsrunde kreves ikke for denne rettingen. `price-search-mobile-check.mjs`: 9 Chromium-kontroller av mobilrekkefølge, kamera/treff, ingen automatisk tastaturåpning ved åpning/skann/valg og uendret PC-rekkefølge. Produksjon og demo publiseres kontrollert etter samlet grønn QA. Sandbox-epostbegrensningen beholdes; ingen hemmeligheter er kopiert dit.
