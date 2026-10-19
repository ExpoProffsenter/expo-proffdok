# Systemadmin – firmavalg 19.10.2026

Miljømål: **BEGGE**. Baseline main `68c3eaf275abdd3dfbc448e1bebc286322dc2d84` (PR #270). Scope: bare firmaverdi/samme-firma-sammenligning i eksisterende Systemadmin-kort, CI-regresjonsvern og påkrevd dokumentasjon/hjelp. Ingen endring i database, roller, autorisasjon, menyer, firmaprofil, e-post, prosjekt- eller salgskjerne.

## Årsak og rettelse

Lesekontroll i Production bekreftet en godkjent firmaadmin med firmanavn som endte i et mellomrom. `registeredCompanyOptions` trimmer og dedupliserer navn uten hensyn til store/små bokstaver, mens brukerkortet brukte eksakt `includes` på rånavnet. Derfor ble verdien tom og feltet viste «Velg firma». Lagringshandleren sammenlignet allerede trimmede navn og gjorde ingenting når samme firma ble valgt.

Feltet finner nå eksisterende valgmulighet med samme trim/lowercase-nøkkel som listen. Lagringshandleren bruker samme sammenligning for å unngå at en forskjell bare i bokstavbruk utløser en flytting. Ingen data renses automatisk. Et reelt firmabytte har uendret registrert-firma-validering, systemadmin-vakt, bekreftelse, serveroppdatering, feilmelding og ny henting.

## Verifikasjon

- Ny Chromium-test kjører de faktiske memo-, Select-, firmafelt- og lagringshandlerblokkene fra `src/main.jsx`. Bare omgivende state og servertransport er syntetiske.
- Testen feiler på gammel main med forventet regresjon: feltets verdi er tom i stedet for lagret firma med sluttmellomrom.
- Rettet kode: 18 assertions PASS for mellomrom, bokstavvarianter, deduplisering, ingen skriving ved rendering/samme firma, avbryt, annet firma, serverhenting, feil, ukjent firma, manglende systemadmin og tomt firma. Rolle/godkjenning/deaktivering beholdes i testen.
- Testen er lagt til eksisterende Chromium-steg i PR Core Safety. Ingen eksisterende sjekk svekket eller fjernet.
- Full critical/build med eksplisitt Sandbox-binding PASS. Eksisterende `company-admin-react-check.mjs`: 52 Chromium assertions PASS for firma-/rolle-/tilgangsflyt, invitasjon, scope, feil, sen respons og mobilbredder.
- Production ble bare lest. Ingen bruker flyttet, ingen database-/tilgangsendring og ingen faktisk e-post sendt.

## Innlogget Preview-prøve

1. Systemadmin → Firmaer, brukere og tilganger → finn et brukerkort. Firma-feltet skal vise samme firma som kortets overskrift, også ved ekstra mellomrom/bokstavvarianter.
2. Velg et annet firma og trykk Avbryt i bekreftelsen. Brukeren skal beholde sitt lagrede firma.
3. Et reelt firmabytte prøves bare på en egnet testbruker i Sandbox. Bekreft, oppdater brukerlisten og se at nytt firma er lagret. Ikke flytt en ekte produksjonsbruker for å teste.

Ny eksplisitt TEST OK kreves før merge. Deretter Production-verifisering og kontrollert main → demo med 19+5 preflight. Denne rettelsen krever ingen migrasjon.

## CI-datoavhengighet i eldre test

CI #539 stoppet i uendret `time-registration-db-check.mjs`: manuelle føringer brukte fast uke 12.10.2026, mens ekte tidtaker ble stoppet i dagens Oslo-uke. Feilen ble gjenskapt lokalt med uendret test. Bare testens to tidtakerscenarier er korrigert: eksisterende linje og etterlesing bruker uken for testens `now() - 2 hours`, i Europe/Oslo. Alle opprinnelige assertions, ekte RPC-er, migrasjoner og resten av testdataene beholdes. Korrigert test: 123 PostgreSQL assertions PASS. Ingen timeføringskode, database eller tidligere utsatt funksjonalitet er endret.
