# SJA-bilder i lagret revisjon, PDF og ZIP

Oppdatert 9. oktober 2026. Miljømål **BEGGE**, men bare `feat-kshms-foundation` og Sandbox kan publiseres i denne leveransen. Kontrollert start-head er `7a68293c8ad3aae4191a1e766b1dbf278ab54eef`; main er `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 skal forbli draft.

## Avgrenset scope

- SJA-utkast kan få inntil tre JPG/PNG/WebP-bilder fra arbeidsstedet. Nettleseren komprimerer til JPEG, maks 1280 px og 400 000 tegn per snapshot.
- Bildene er del av `content.photos` i samme SJA-revisjon som tekst, arbeidstrinn og deltakere. Lagre/readback, revisjonskonflikt og signert-uforanderlighet omfatter derfor også bildene.
- Egen lagret SJA-PDF og valgt SJA i samlet Dokumentuttrekk viser bildene i en egen blokk.
- Dokumentuttrekkets bekreftede ZIP gir hvert bilde som `SJA-bilde-N.jpg`; manifestet binder filen til dokument-ID, revisjon, arbeidsstedsblokk, byteantall og SHA-256.
- Migrasjonen erstatter bare den private JSON-validatoren. Ingen ny tabell, kolonne, Storage-bucket, RLS, policy, offentlig funksjon eller rettighet.

Risikovurderingsbilder, nye opplastingslagre, faktiske private avviks-/prosjektkontrollfiler, mobil/kamera og flerbruker er utenfor denne leveransen. Ingen reell SJA opprettes, signeres eller endres bare for testdata. HR, e-post, Production, main/demo-merge og branchsletting er utenfor scope.

## Utviklerbevis før apppublisering

- Permanent SJA-kontroll: klient-/validatorgrenser, ugyldig MIME/data, duplikat-ID, maks tre bilder, readback/retry/signatur og migrasjonsscope.
- Faktisk React-handler: JPEG-fil gjennom browserens bilde/canvas-flyt, komprimert preview, lokal kladd, lagring/readback og bevart bilde i signert syntetisk snapshot. Ingen faktisk innlogging eller data.
- Egen faktisk jsPDF/PDF.js: tre SJA-PDF-er; signert prøve har bilde, historisk identitet, langtekst og to A4-sider. Endret/revokert snapshot og sent scopebytte sperrer eksport.
- Samlet faktisk React/jsPDF/PDF.js: åtte dokumenttyper, 15 sider, SJA-bilde, øvrige bilder, manifest og sluttkontroll. Alle sider maskinelt kontrollert; SJA-sider og manifest visuelt kontrollert uten klipp/overlapp.
- Faktisk React/ZIP: seks filer, inkludert `SJA-bilde-1.jpg`; ZIP kan åpnes, CRC32, byteantall og SHA-256 stemmer mot `manifest.json`. Tom pakke, endret valg/scope, manglende fil, tilgang og sent firma-/brukerbytte sperres.

Supabase CLI finnes ikke i checkout-miljøet; lokal databasekjøring hevdes derfor ikke. Migrasjon `20261009022028 kshms_sja_photos` er anvendt bare på autorisert Supabase-utviklingsgren `demo-sandbox` (`ppvircenkjizeiqdxphj`). Direkte Sandbox-prøve bekrefter ett lagret JPEG-bilde og legacy-normalisering til `photos: []`; fire bilder, PNG-data og duplikat-ID avvises. Funksjonen er `IMMUTABLE`, har tomt `search_path`, og PUBLIC/anon/authenticated har ikke EXECUTE. Ingen tabell-, Storage-, RLS-, policy- eller produksjonsendring er gjort. Full `EXPO_BACKEND_TARGET=sandbox npm run build`, scope/docs-guard og diff-check var grønne før apppublisering.

## Publisering og innlogget lesekontroll

Funksjonshead `785d01389d2059026711ea1a8af12762e75fc4b9`, tree `cd5257609f1a3e2c375b9faf7d9146bc561ed429`. Alle 25 endrede blobber og samlet tree er hash-/byteidentiske med lokal testet kilde. Publisert med expected-head `7a68293c8ad3aae4191a1e766b1dbf278ab54eef`, uten force; main uendret. PR Core Safety `37874352426`, jobb `113639379783`, full critical build completed/success. Vercel `dpl_Dd3VioNsdD4idRkMGodqfpTamDqG` er READY på eksakt commit, `feat-kshms-foundation` og fast alias; branchvariabelen `EXPO_BACKEND_TARGET=sandbox` er lest direkte.

Eksisterende innlogget demoøkt ble gjenbrukt i én fane. Etter eksplisitt reload åpnet eksisterende signert «Test sja» i read-only modus og viste ny **Bilder fra arbeidsstedet (inntil tre)**-seksjon med personvernstekst. Ingen fil ble valgt, og ingen SJA ble opprettet, lagret, signert eller endret; ingen PDF/ZIP ble lastet ned. Popupen ble lukket. Dette er regresjons-/publiseringsbevis, ikke faktisk bildeopplasting eller Kenneths TEST OK.

## Godkjenninger og restprøve

Bevar Kenneths TEST OK 9. oktober Europe/Oslo: egen lagret SJA-PDF 00:59, samlet PDF 01:29, ZIP med to bilder og manifest 01:55 og kvalitet-/HMS-uttrekk 02:28 på `f9e0f7b52a0573cf662fce07f8158c47576c8598` (funksjon `0e2de193164dad2342206cac1e2a7610f3c265d0`). Denne leveransen endrer SJA-PDF/uttrekk ved at nye lagrede SJA-bilder kan følge med; den trenger en ny kort, avgrenset brukerprøve, men ingen omtest av de allerede godkjente delene uten konkret regresjon.

Etter denne leveransen gjenstår faktisk innlogget SJA-bilde/kamera, risikovurderingsfiltilknytning, faktiske private avviks-/prosjektkontroll-/legacyfiler, mobil/flere brukere og annen dokumentert vedleggsdekning. Deretter følger versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke i natt.
