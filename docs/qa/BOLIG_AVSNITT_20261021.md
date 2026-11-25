# Grunnpakker og Tilvalgspakker – avsnitt og vareinnhold

Miljømål BEGGE. Først eksisterende feature-Preview/Sandbox i draft PR #278. Ingen produksjonsmerge eller main→demo-synk uten TEST OK.

## Scope og endring

Egne boligeditorer, visning av pakker, hjelp, additive private katalogfelt og egne tester. Ingen endring av tilbudskjerne, global meny, innlogging, e-post eller øvrige moduler.

- Felles editor: pakkenavn, ordnede avsnitt med kort kundetekst, varer med varenummer/antall/enhet/bilde, flytting og piltastknapper for rekkefølge. Avsnitt og varer kan foldes sammen. Fjern avsnitt beholder varene under Uten avsnitt. Kladd bevares ved fokus/lukking/retur.
- Tilvalgspakke brukes konsekvent. Flere varer/avsnitt kan velges samlet til én pakkepris. Eksisterende alternativ/tillegg og eksplisitt fratrekk for én erstattet standardvare beholdes. Gamle enkeltvarer konverteres med stabil legacy-nøkkel og uendret samlet pris.
- Nye valg fryser hver vare og avsnittsnavn. Historiske valg, bilder og bestillinger oppdateres aldri. Rom-/fellespakker og eldre boligvalg bruker samme produktutvidelse. Bestillingsutkast kan utelate enkeltvarer, også etter ny avsnittsrekkefølge.
- Inntil 30 avsnitt og 100 varer per pakke; eksisterende 1000-varegrense per bolig beholdes. Server validerer referanser, ID-er og produktdata. Eksisterende firma-/rolle-/revisjonskontroll og låser beholdes. Gamle klienter får konflikt ved redigering av ny struktur uten å sende den. Ingen nye offentlige privilegerte funksjoner/tabellgrants.
- Tom bolig med content=null og selection=null gir tom fordeling. Før kunne undefined===undefined forsøke å lese content.allocations. Begge innlastingsgrener er rettet og testet ved oppfriskning.
- Rediger bygg har Lagre endringer som hovedhandling. Den åpner gjennomgang, før Bekreft og lagre utfører atomisk lagring. Hent siste grunnlag ligger under Flere valg. Lokal kladd og forhåndskontroll beholdes.

## Sandbox

Kilde: supabase/migrations/20261021194409_bolig_catalog_sections.sql, generert med Supabase CLI. Kun ppvircenkjizeiqdxphj, serverversjon 20261021195933.

Faktisk autentisert Sandbox-test: avsnitt, tre frosne varer etter alternativ, eksakt fratrekk 25000−10000=15000 øre, separat utelatelse i ordre og scopet fellespakke. PASS og full ROLLBACK. QA-SECTIONS-ROLLBACK har 0 rader. Direkte authenticated EXECUTE på ny validator er false.

Advisors: eksisterende private deny-all-tabeller gir RLS INFO; ingen nye FK-er. Eksisterende public.bolig_catalog_image_access er en tilsiktet autentisert Storage-policykontroll med separat firma-/rolle-/root-sjekk, ikke introdusert her. Ingen nye advisorfunn fra avsnittsendringen.

## Lokal QA

- PostgreSQL/PGlite: 407 assertions PASS, tidligere 367 beholdt og 40 nye avsnitt-/produkt-/fryse-/ordre-/tilgangskontroller.
- Ny avsnitt Chromium: 27 assertions med faktisk global app-CSS og 320/390/1024/1366 px. Innhold, rekkefølge, fjerning uten varetap, kladd/fokus, pakkepris/fratrekk og gjenåpning.
- Katalog og Foundation React PASS. Forventede etiketter følger brukerens nye ordlyd. Lagrings-, fokus-, kladd- og tilgangsscenarier beholdes.
- Eksisterende Chromium: pakkevalg 36, bilder 26, kataloginngang 24, rominnhold 35 (to nye tom-bolig-kontroller), samlet klargjøring 33, rom 51, byggveiviser 102 PASS.
- Full critical build og scope-guard PASS. Ny avsnitt-Chromium inngår i PR Core Safety.

## Brukerprøve og videre arbeid

Publisering/CI/skynett kontrolleres på eksakt head og fast branch-alias. Kun syntetiske QA-prosjekter; kundens Testprosjekt 79800 brukes ikke.

1. Grunnpakker og tilvalgspakker → Ny grunnpakke → Legg til avsnitt. Lag Fliser og Baderomsinnredning. Legg varer i hvert avsnitt, lagre og gjenåpne.
2. Ny tilvalgspakke: lag Dusjvegger med to varer, pris og eventuelt alternativ/fratrekk. Lagre/gjenåpne. Velg pakken og se at hver vare følger bestillingsutkastet.
3. Åpne en tom bolig. Vareinnhold på rom skal vise veiledning uten teknisk nullfeil.
4. Oppsett → Rediger bygg → Lagre endringer → Bekreft og lagre. Lukk og behold kladd lagrer lokalt frem til eksplisitt bekreftelse.

Fysisk mobil/Safari og to reelle samtidige kontoer er ikke særskilt prøvd. Tilvalgspakken erstatter én standardvarelinje om gangen. Neste samlede pakke: bestilling/levering med kjøpers Vårt ordrenummer, eget leverandørordrenummer, felles/individuell leveringsadresse og delleveranser. Deretter faktisk fremdrift/sjekklister på bolig/rom, kundeaksept og avgrenset ekstern tilgang. Excel-import sist.
