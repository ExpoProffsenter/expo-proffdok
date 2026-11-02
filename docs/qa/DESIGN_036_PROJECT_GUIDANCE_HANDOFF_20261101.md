# Prosjektgjennomgang – sjekklisteveiledning og faktisk testtilgang

Dato: 1. november 2026. PR295, design01-app-ramme-20261028. Grunnlag ea225b203d720c6ce2e63c4e1caf83f003538164. Miljømål BEGGE; utførelse bare arbeidsbranch/Preview. Ingen samlet TEST OK.

## Hva som faktisk er gjort

Tre påviste sammenhengende feil i sjekklisteveiledningen rettes: falsk Klar til sluttkontroll, kommentar som manglet i dokumentasjonsfilteret, og påbegynt kontroll med dokumentasjonsmangel som ikke ble anbefalt videre. Tre kompakte filterbokser skiller arbeid, sluttkontroll og fullført kontroll. Tomt filter har tydelig tilbakevei. Eksisterende editor, native panel, innsteg, lokal sikring, lagring, signering og historikk beholdes.

[Endrings- og testgrunnlag](../changes/project-checklist-work-guidance-20261101.json). Endelig commit, CI-resultat og eksakt READY skal leses i fersk PR295-status, ikke utledes fra denne filen.

## Testgrenser

Lokal isolert Node-prøve: 287 krav PASS. Førkildens falske ready-status er gjenskapt. Kildene checklistFields, checklistRuns og checklistSignatures er kontrollert mot Git-blob og uendret. JSX-syntaks er kontrollert, men lokal full checkout/build/React kunne ikke kjøres. De eksisterende native 53 kravene er bevart, og ny faktisk React/Chromium-prøve er koblet til samme CI-inngang. Den bruker syntetiske data og lesetransport, ikke levende Sandbox-data. Ikke bruk den som full prosjekt- eller rolletest.

Den administrerte nettleseren i denne ChatGPT-økten har URLBlocklist=["*"]. Dette er verifisert ved lesing av policy, ikke utledet fra en generell timeout. Den tidligere innloggede skynettleseren er ikke tilgjengelig her. Sperren er ikke endret, alternative profiler er ikke brukt til omgåelse, og appens innlogging/Vercel-beskyttelse er urørt. Brukeren avslo TinyFish; ikke foreslå det igjen. Det er ikke dokumentert hvilken brukerinnstilling som kan gjenopprette den gamle nettlesertilgangen.

## Åpent – ikke kall total UX ferdig

Full innlogget prosjektløype fra liste via oppsett, deltakere, avtale/prosjektering/fremdrift, sjekklister, bilder, avvik, produkter/FDV, chat/notater og overtagelse/garanti/rapport er fortsatt ikke gjennomført i denne økten. Hovedoversiktens arbeidsprioritering og samlet navigasjonsdybde er ikke endret i denne avgrensede pakken. Dette skal ikke overskygges av antallet grønne testkrav.

Sju installerte AI-bilder, Golden, faktisk kontrollert PDF og tidligere grønne uendrede prøver beholdes. Ikke installer bildene eller eksporter PDF på nytt uten relevant grunn. Produksjon og permanent demo endres ikke. Ingen SQL, datareset, kundeutsending eller release er autorisert av denne pakken. Ny relevant Preview-prøve og Kenneths uttrykkelige TEST OK kreves før produksjonssetting.
