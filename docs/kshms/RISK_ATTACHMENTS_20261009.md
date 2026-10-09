# Risikobilder i lagret vurdering, PDF og ZIP

## Avgrensning

Miljømål **BEGGE**, men bare `feat-kshms-foundation` og Sandbox publiseres nå. Hver fare i en 5×5-risikovurdering kan ha inntil tre komprimerte bilder. Bildene lagres i samme private, revisjonerte `kshms_executions.content`-snapshot som faren og følger egen PDF, uttrykkelig valgt prosjektrapport, samlet Dokumentuttrekk og bekreftet vedleggs-ZIP med dokument-ID, revisjon, farenavn, byteantall og SHA-256 i `manifest.json`.

Gamle risikovurderinger uten `photos` normaliseres til tom liste. **Ny vurdering med samme farer** tar ikke med tidligere score, beslutning eller bilder. Fullført snapshot er fortsatt skrivebeskyttet. Bilder vises som antall, ikke base64-innhold, i kollegakonflikten. Ingen ny Storage-bucket, tabell, RLS, policy eller ekstern deling.

Eksplisitt appscope: `KshmsExecutions.jsx`, `kshmsExecutions.mjs`, utførelses-/prosjekt-/uttrekks-PDF, vedleggsarkiv, eksisterende rapportblokk, én privat validator-migrering og berørte critical-/React-prøver. Hjelp, README, arkitektur og KS/HMS-statusdokumenter følger. Ingen generell navigasjon, HR, e-post, Production/main/demo eller ny tilgangsmodell.

## Utviklerbevis før publisering

- Klientvalidering: ett risikobilde og legacy uten bilder PASS; duplikat-ID og fire bilder avvises. Bildevalg bruker eksisterende `prepareKshmsPhoto` med format-/10 MB-port, maks 1280 px og JPEG-komprimering.
- Faktisk React: filvalg, canvas-preview, lagret command/readback, fullføring og historisk read-only-bilde PASS. Ny vurdering med samme farer starter uten bildet.
- Faktisk jsPDF/Poppler: egen 2-siders risiko-PDF, 16-siders åtte-type Dokumentuttrekk og 9-siders prosjektrapport med kontroll + risiko PASS. Risikobildet, matrisen, før/etter, forventet effekt, beslutning og fullføring er rendret og visuelt kontrollert uten klipp/overlapp.
- Faktisk React/ZIP: syv filer + manifest, inkludert `Risiko-1-bilde-1.png`; uavhengig ZIP-/CRC32-/byte-/SHA-256-kontroll PASS. Dokumentgruppen er Risikovurderinger 5×5 og punktet er den lagrede faren.
- Tilgang, fersk revisjon, endret utvalg/omfang, manglende bilde, filtype/størrelse, sen firma-/bruker-/avmonteringsrespons og ingen skrive-RPC i eksportflytene PASS.
- Sandbox-transaksjonstrial med rollback: nytt bilde og legacy-normalisering PASS; fire bilder, duplikat-ID og SVG avvises; PUBLIC/anon/authenticated har ikke EXECUTE. Migrasjonen endrer bare privat validatorfunksjon.

Full critical Sandbox-build PASS. Migrasjon `20261009031544 kshms_risk_photos` er anvendt bare på `demo-sandbox` (`ppvircenkjizeiqdxphj`); direkte prøve etter anvendelse gir bilde=1, legacy=0 og PUBLIC/anon/authenticated EXECUTE=false. E-post-worker er direkte lest `enabled=false`. Supabase security/performance-advisors er kontrollert etter DDL og viser ingen nytt funn knyttet til endringen.

Funksjonshead **bcd0579cebdeaaaa4578abab14dc5522bf0abd88**, tree **03e3ecf71fcde6c43e714997f57a24f1f213f810**, 24 endrede blobber/tree hashverifisert og publisert med expected-head uten force. Core Safety **37878651320**, full critical jobb **113652964404** success. Vercel **dpl_AKRXJxtRxZuNRif9ej4d2oUJ5vk3** READY på eksakt SHA/feature-ref/fast alias; `EXPO_BACKEND_TARGET=sandbox` direkte lest. Innlogget Preview etter reload viste bildefelt og personverntekst i et tomt, ulagret skjema. Det fantes ingen eksisterende risikovurderinger; ingen fil ble valgt, ingenting lagret/fullført, popup lukket og listen sto fortsatt på null.

## Brukerprøve og restpunkter

Dette er utviklerbevis, ikke Kenneths TEST OK. Bevar TEST OK 9. oktober Europe/Oslo: egen SJA-PDF 00:59, samlet PDF 01:29, ZIP med to bilder/manifest 01:55 og kvalitet-/HMS-uttrekk 02:28 på `f9e0f7b52a0573cf662fce07f8158c47576c8598` (funksjon `0e2de193164dad2342206cac1e2a7610f3c265d0`). De prøves ikke på nytt uten konkret regresjon.

Ny kort prøve gjelder bare et trygt eksisterende risikoutkast med bilde. Ikke opprett eller fullfør en reell vurdering bare for testdata. Faktisk innlogget bilde/kamera, SJA-bilde/kamera, private avviks-/prosjektkontroll-/legacyfiler, mobil og flere brukere er fortsatt åpne. Neste uavhengige planpunkt er versjonerte underskjema, deretter påminnelser og kildeoppdatering. HR starter ikke i natt.
