# Egne fasader og plantegninger – 24. oktober 2026

Miljømål **BEGGE**, kun samme feature-Preview/Sandbox **ppvircenkjizeiqdxphj** nå. Ingen produksjonsmerge/migrasjon, e-postaktivering, main→demo-synk eller eksterne tilganger. Baseline **ba14f4fb**, main **36462e2b**.

## Avklart scope

Kenneth ber om flere funksjoner samlet, egen skynett-/mobiltest og vern av eksisterende funksjoner. Han valgte bildeplassering med forslag som kan flyttes. Pakken samler eget fasadebilde per bygg, flere plantegninger per bolig, justerbare bolig-/romfelt, forhåndsvisning og versjonshistorikk.

Booking vil ofte styres av andre, fremdrift, beboermøter og varsler. Booking og faktisk bemanningsoversikt skal, når de bygges, være **valgfrie per prosjekt og aktiveres i Oppsett**. Selvbooking er ikke valgt. Ingen tomme brytere eller booking-/bemanningsmotor er laget nå.

Endrede runtime-filer er bare egne BoligVisual*-komponenter/hook/klient/CSS, lokale integrasjoner i BoligBuildingOverview/BoligRooms/BoligEntry og BoligHelp. Additiv privat migration, Bolig-tester, én ekstra CI-kommando og dokumentasjon. Ingen ny endring av felles main/navigation, Sales, Timer, HR, KS/HMS, Badskisse eller mailmotorer. Eksisterende critical-checker/migrasjoner er urørt.

## Brukerreise og grenser

- **Oppsett → Bilder og plantegninger**: velg bygg for fasade eller bolig for plantegning. **Fasadebilde** finnes også i byggoversikten. **Plantegninger** er sammenfoldet i boligens romvisning.
- JPG/PNG/WebP, inntil 12 MB og 12 000 piksler på lengste side. Ingen omskalering/beskjæring. PDF må eksporteres som bilde først; PDF-rendering/OCR er ikke implementert.
- Forslag kommer fra registrerte boliger/rom. Dra, bruk piltaster, prosentfelter eller velg et felt og trykk på bildet. Flytt/skaler også hele oppsettet. Nytt forslag erstatter bare bildeutkastet.
- **Forhåndsvis endringer → Lagre bilde og felt**. Ingen automatisk lagring eller endring av struktur, valg, leveranser, sjekklister eller ferdigstatus. Felter uten plassering finnes fortsatt i eksisterende lister og i eget utvalg under bildet.
- **Bildehistorikk → Bruk som nytt bildeutkast** åpner tidligere innhold for ny gjennomgang og ny versjon. Skjult fasade gir den etablerte illustrasjonen tilbake. Flere plantegninger er uavhengige ark per bolig.

## Lagring og tilgang

Sandbox-migrasjon **20261023224653_bolig_project_visuals**, CLI-generert fil avstemt mot faktisk serverversjon. Egne deny-all private visual_sheets/visual_versions, public invoker-gateway, private auth-/context-kontrollerte definers. Ingen eksisterende gateway erstattet.

Privat immutable bucket **bolig-project-visuals**. INSERT krever manager og aktivt scope/firma. Reader leser bare publiserte filreferanser. Ingen UPDATE/DELETE-policy. Filene deles ikke automatisk til beboere/UE. Server validerer scope, aktive mål-ID-er, koordinater og bildegrenser. Et fingerprint av gjeldende målgrunnlag og bildeversjon må stemme ved skriving. Romskriving og bildevalidering har samme root→room-låserekkefølge.

Kladd avgrenses per bruker/firma/prosjekt/scope, originalfil sikres i IndexedDB før upload. Tapt uploadkvittering verifiseres mot samme immutable fils SHA-256. Pending RPC fryses lokalt før nettverk og gjentas eksakt etter remount/omlasting. Gammel kvittering kan ikke rulle siste bildeversjon tilbake. Nyere grunnlag krever eksplisitt gjennomgang; utilgjengelige felt fjernes bare ved valgt rebase-handling.

Normal fokuslesing beholder DOM/native filinput. Ekte skjuling/feilet reautorisasjon sperrer gammel bildevisning og skriving. Scopebytte og sene svar gjenåpner ikke gammel dialog.

## Verifisert før publisering

- **1458 PostgreSQL-assertions PASS**, alle tidligere 1392 beholdt. Nye scenarioer: fil-/mål-scope, uendret struktur/romrevisjon, versjoner, eksakt replay og gammel kvittering etter nyere versjon, konflikt, koordinater, flere planer, omdøping, reader/fremmed firma, arkiv/revokering.
- **42 nye Chromium-assertions PASS** med faktiske komponenter: forslag/keyboard/mobilt trykk, formatstopp før nettverk, privat blobkladd etter reload, eksakt retry etter tapte upload-/RPC-svar, rebase/historikk/gjenoppretting/skjuling, native input ved fokus/revokering og firmabytte. Proporsjoner og ingen dialogoverflow ved **320/390/768/1366px**. Ikke fysisk Safari/iPhone.
- Eksisterende overview **42**, rooms **51**, builder **143**, catalog images **29**, scoped packages **36**, shared board parity mot main **13**, ordinær mobilheader **91**, Sales-editorer **196** PASS. Faktisk Foundation React og full critical Sandbox-build PASS.
- Faktisk **bolig-visuals-sandbox-smoke.sql PASS** mot native Auth/gateways/Storage-RLS: publisering/retry, feil marker/fil-scope avvist, struktur uendret. Alle syntetiske metadata/røtter rullet tilbake. Denne SQL-prøven attesterer ikke filbytes.
- Sikkerhetsrådgiver: samme seks kategorier og samme WARN-antall. To nye INFO-funn for bevisst deny-all private visual_sheets/visual_versions. Ingen nye public definer-executable-funn.

Nettleseroppsett måtte repareres: eksisterende /tmp/chromium var tom og Playwright-CDN gav ugyldig nedlasting. Offisiell npm-pakke @sparticuz/chromium153.0.0 gav lokal kjørbar Chromium. Første nye tester avdekket fixture-RPC/selektorer og rekkefølgeantakelser, samt for bred seed-kopiering i editor. Rettet uten å fjerne krav. Oversiktens eksisterende read-only-assertion tillater kun den nye spesifikke bolig_visuals/list-lesingen i tillegg til gamle lesinger.

Publisert SHA/READY, samlet CI og faktisk innlogget Preview-prøve avleses etter publisering. Ingen samlet Bolig TEST OK.

## Brukerprøve

Samme Preview/innlogging: **Oppsett → Bilder og plantegninger → velg bygg → Fasadebilde**. Last opp, flytt et felt og forhåndsvis. Etter lagring skal feltet åpne samme bolig. Under boligens **Rom og oversikt → Plantegninger** skal romfeltet åpne samme rom og rompakke. Prøv Bildehistorikk og kontroller vanlig boligliste/bestilling.
