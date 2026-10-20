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


## Tredje prototypeetappe: tydelig oppsett og bestillingsmail

Scope/miljømål er fortsatt isolert SANDBOX/DEMO. Ny lokal scenariofil: `scripts/critical-demo-boligprosjekter-setup.mjs`. Eksisterende critical-kontroller endres ikke.

- «Slik styrer du prosjektet» er en rammet veiledningsboks med ikon, forklaring og handlingssnarveier. «Prototype · se status» forklarer hva som er lokalt prøvbart og hva som gjenstår.
- Oppsett har tre konkrete områder: (1) bygg/oppganger/etasjer/leiligheter, (2) grunnpakkers innhold og (3) prosjektets tilvalgsliste. Legg til blokk med første oppgang; legg til flere oppganger i en blokk. Skjul/gjenopprett bevarer samme ID-er/historikk. Minst én synlig oppgang må beholdes.
- Eksisterende etasjeredigerer beholdes. Nye boliger starter uten syntetisk aksept eller bestilling. Dynamisk struktur kan gjenåpnes etter reload, også med flere enn de opprinnelige 13 oppgangene. Lokal demonstrasjonsgrense: 10 blokker og 80 oppganger inkludert skjulte, 1–20 etasjer og 1–8 boliger per etasje.
- Pakkeinnhold og prosjektets tilvalg/tilleggspriser kan redigeres lokalt. Tilvalg kan legges til; fjerning og ny administrasjon av avhengighetsregler inngår ikke. Standardvarers stabile vareplass bevarer erstatningsregelen ved navneendring. Akseptert pakke-/vare-/pristekst lagres som snapshot og skrives ikke om. Gamle eksempeldata utvides ved restore. Pakke kan velges for ikke-akseptert bolig; akseptert grunnlag er låst.
- «Tilvalg for Hxxxx» forklarer skillet mellom prosjektets liste og det konkrete valget. Snarvei fra Oppsett åpner valgt bolig.
- Bestillingsoppsett har avtalt mottakeradresse og felles leveringsadresse. Mailforhåndsvisning krever mottaker, leveringsadresse og gyldig dato, og viser prosjekt, leilighetsadresse, navn, leilighetsnummer, kjøpers referanse og ønsket levering. Ingen priser lekker inn i leverandørmailen. Retur bevarer eksempeldato/adresse/mottaker og ønske om ASCII-vedlegg.
- Mailen viser samlet varegrunnlag for boligen. Korrekt varefordeling per delleveranse gjenstår. ASCII er et dokumentert vedleggsønske i prototypen, ikke en generert/prøveimportert fil. Ingen sending, mailto-lenke eller nettverkskall.

Lokal QA før push: tidligere modell/DOM/flyt + ny oppsett-/e-postscenariofil, isolasjon og full sandbox critical/build. Fersk PR #277 dokumenterer eksakt commit, CI/READY og faktisk etterfølgende Skynett-prøve. Ingen uutført live-/mobiltest hevdes her.

Samlet brukerprøve:
1. Åpne veiledningsboksen og «Prototype · se status».
2. Oppsett → Bygg og oppganger → Legg til blokk, deretter Legg til oppgang. Etasjer og leiligheter endres i den aktuelle oppgangen. Skjul/gjenopprett og se at samme bolig/historikk kommer tilbake.
3. Oppsett → Grunnpakker → rediger innhold. Oppsett → Rediger prosjektets tilvalgsliste → rediger et tillegg eller legg til et nytt.
4. «Velg tilvalg for …» åpner den valgte boligen. Akseptert eksempel krever «Opprett nytt tillegg» før endring; gammel aksept bevares.
5. Bestillinger for H0302 → Klargjør bestilling → fyll eksempeladresse (for eksempel ordre@example.invalid), leveringsadresse og dato → Forhåndsvis bestillingsmail. Adresse, navn/leilighet, referanse og dato skal vises. Ingen mail sendes.
