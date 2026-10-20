# Boligprosjekter – isolert klikkbar prototype

Miljømål: **SANDBOX/DEMO**. Baseline main `0730eeb46c49bf45b5d910772da5c2ad7ed60771`. Fast Preview-branch `fix-company-admin-scope-20261015` starter denne etappen fra eksakt main, ikke fra gammel PR-head. Ingen Production-merge eller permanent demo-synk er autorisert av prototypearbeidet.

## Scope

- `public/demo/boligprosjekter/index.html`, `style.css`, `model.mjs`, `app.mjs`.
- Egne `scripts/critical-demo-boligprosjekter*` og krav-/QA-/handoff-dokumentasjon.
- Ingen modifikasjon av eksisterende app, menyer, Sales, prosjektmotor, backend, RLS, Storage, e-post, checker, dependency-input eller miljøkonfigurasjon.
- Siden er tilgjengelig via direkte sti, ikke en ny inngang i produksjonsmenyen.

## Implementert i prototypen

- 312 syntetiske leiligheter i 13 oppganger / 3 blokker. Automatisk fasade, valgt leilighet, adresser, etasjer og statuslag for fremdrift/tilvalg/bestilling/dokumentasjon.
- Separate leilighetsvisninger, grunnpakkeeksempel, tilvalg og simulerte versjonerte aksepter/tillegg.
- Enkle avhengighets-/kombinasjonsregler for tilvalg og eksempel på erstatning av standardvarer i varegrunnlaget.
- Brukerbedriftens «Vårt ordrenummer» per leilighet, separat fra leverandørens ordrenummer (avventer egen ordre hos Expo/Ringside), klargjøring av to delleveranser, sperre mot samme delleveranse to ganger. Ingen importfil eller virkelig sending.
- Illustrativ hovedplan og godkjenning av datoendring per bolig/opplegg/oppgang. Endret relevant dato ugyldiggjør godkjente eksempelvarsler.
- Redigerbar varselforhåndsvisning, kanaler og lokal godkjenning, utskrift/PDF via nettleser. Ingen mail/SMS.
- Redigering av etasjeantall/leiligheter per etasje/adresse. Skjulte tidligere leiligheter og historikk slettes ikke.
- Eksempelindeks med forhåndsvisning/godkjenning. Beregnes fra basis; aksepterte summer bevares.
- Valgfrie beboerfunksjoner som oppsettseksempel, lokal fasadereferanse og beskrivelse av fremtidig Excel-import.
- Egen navngitt localStorage-nøkkel. Reset endrer kun egen prototype. CSP `connect-src 'none'`, ingen CDN, serviceklient, autentisering eller API-kall.

## Bevis og begrensninger

- `node scripts/critical-demo-boligprosjekter-check.mjs` PASS: unike/stabile ID-er, reversibel struktur, bevart aksept, tilvalgsregler, ordrededuplisering, ny varselgodkjenning, restore og nettverksisolasjon.
- Faktisk `app.mjs` kjøres i jsdom via `critical-demo-boligprosjekter-dom.mjs`: klikk, søk, låste tilvalg, tillegg/aksept/historikk, delleveranse, indeksgodkjenning, varsel/datoendring, struktur, escaping og avgrenset reset. Native dialogprimitiver adapteres. Dette er DOM-QA, ikke visuell nettleser-QA.
- Full eksisterende critical/build PASS med eksplisitt Sandbox Supabase only. Eksisterende storklump-warning i Vite er uendret.
- Lokalt Chromium-nedlasting mislyktes i miljøet. Ikke påstå lokal Chromium-/mobil-QA. Visuell prøve i publisert Preview skal dokumenteres separat når utført.
- Grønn `PR Core Safety` og READY på eksakt commit skal kontrolleres etter push; endelig PR-status er autoritativ fremfor dette arbeidsnotatet.
- Ingen påstand om fungerende Excel-import, BankID, SMS, e-post, Cordel-integrasjon, reell autorisasjon, produkt-/priskatalogkobling, dynamisk avhengighetsmotor eller operativ fullmodul.

## Brukerprøve på fast Preview

Åpne den faste Preview-adressen med stien `/demo/boligprosjekter/index.html`.

1. Byggoversikt: velg blokk/oppgang og statuslag. Trykk H0302 i 12A. Riktig bolig/adresse skal vises. På mobil åpnes leiligheten med tydelig retur.
2. Åpne leilighetsprosjekt → Tilvalg. Akseptert grunnlag er låst. Opprett nytt tillegg, velg et tillegg, forhåndsvis og simuler aksept. Forrige versjon skal finnes i historikken.
3. Bestillinger: prøv Klargjør bestilling. Eksempelordre skal følge leiligheten, uten utsending. Allerede klargjort delleveranse skal være sperret.
4. Varsler: velg oppgang og fyll melding, forhåndsvis og godkjenn eksemplet. Flytt oppstart under Fremdrift og godkjenn datoendringen. Berørt varsel skal kreve ny godkjenning.
5. Rediger bygg: endre etasjer og antall i én etasje. Lagre, kontroller antall og åpne igjen. Tidligere skjulte leiligheter skal få tilbake historikken når strukturen gjenopprettes.
6. Oppsett: forhåndsvis/godkjenn en eksempelregulering. Et allerede akseptert tilbud skal beholde beløpet.
7. Nullstill eksempel etter prøven ved behov. Innlogging og andre appdata skal være bevart.

Kenneths TEST OK vil gjelde denne avgrensede prototypen og brukeropplevelsen, ikke produksjonsgodkjenning av hele boligmodulen.


## Samlet prosjektlederflyt – andre prototypeetappe 20.10.2026

Kenneth ba om egne tester i Skynett og én samlet oppdatering, med en fersk prosjektleder som målgruppe. Miljømål og isolasjon er uendret: SANDBOX/DEMO. Ingen Production-merge eller permanent demo-synk.

Faktisk Skynett-prøve av tidligere head `a2709c4` avdekket dobbelt standard/oppgradert servantskap i varegrunnlaget. Kildegjennomgang avdekket at leveringsdatoen ikke ble tatt med i lokal bestilling, og at valgt oppgang kunne avvike fra leiligheten datoendringen gjaldt. Disse er rettet i prototypen.

Samlet endring:
- Kort forklaring per hovedvisning og sammenleggbar veiledning for oppsett → tilvalg → bestilling → plan/varsler → dokumentasjon.
- Dynamisk neste steg per bolig. Oppfølgingsfiltre viser faktiske eksempelboliger som trenger oppfølging/tilvalgsavklaring eller er klare for bestilling.
- Søk i alle aktive leiligheter, også utenfor vist blokk. Adresse, leilighet, kontakt og egen ordrereferanse kan kombineres uavhengig av ordrekkefølge. De første 30 treffene vises; snevr inn søket ved flere treff.
- Valgt blokk/oppgang og aktuell leilighet holdes sammen. Datoendringen gjelder den viste oppgangen.
- Oppgraderinger erstatter standardvaren i et felles, testet varegrunnlag. Ønsket leveringsdato valideres, lagres og vises. Historiske bestillinger uten dato får ingen oppdiktet leveringsdato.
- Alle klargjorte delleveranser gir en forklaring fremfor tomt bestillingsskjema. Manglende aksept fører brukeren til tilvalg. Lokal klargjøring beskrives som klargjøring.
- «Gjennomgå varsel» åpner dato/tekst/mottakere for retting før ny forhåndsvisning og godkjenning. Samme varsel oppdateres; tidligere innhold bevares i lokal revisjonshistorikk.

Lokale bevis: egne modell-/DOM-kontroller, ny `critical-demo-boligprosjekter-flow.mjs`, PR-isolasjon og full critical/build kjøres før samlet push. Den nye scenariofilen beskytter faktiske feil: dobbel vare, tapt dato, feil oppgang og foreldet varsel. Eksisterende checker er ikke endret. Sandbox-build må vise «Explicit backend target: Sandbox Supabase only».

Fersk READY/CI og Skynett-readback av den samlede oppdateringen dokumenteres i PR #277 etter push. Dette avsnittet hevder ikke at ennå ventende live-QA er gjennomført. PR-ens nyeste head/resultater er autoritative.

Samlet brukerprøve etter utviklerens live-QA:
1. Byggoversikt → «Slik styrer du prosjektet» og oppfølgingsfiltrene. Åpne en bolig fra trefflisten; «Neste steg» skal forklare handlingen.
2. Søk «14D H0604» fra Blokk B. Treffet skal åpne riktig bolig i Blokk C.
3. H0302 i 12A → Bestillinger → «Se varegrunnlag»: bare oppgradert servantskap/dusjsett. Klargjør sanitærutstyr med en valgt dato; datoen skal følge oversikten også etter omlasting.
4. Varsler → forhåndsvis/godkjenn eksempel. Fremdrift → flytt oppstart → godkjenn. Varsler → «Gjennomgå varsel» → rett dato/tekst → forhåndsvis/godkjenn. Samme varsel skal få oppdatert innhold.

Full operativ modul, ekte roller, utsending, Cordel, BankID og dynamisk produksjonsplan er fremdeles ikke implementert. Mobil/Safari-verifikasjon må spesifiseres separat fra desktop-Skynett. TEST OK gjelder prototypens brukeropplevelse.
