# Bolig / butikk / video – 14.11.2026

## Utgitt etter TEST OK: PR341
- main 66caacf23f4cbd39eaba10f9524404e4e418e39d, Production READY dpl_GhEHMHTeV5YUp8bcogQXGi8edutv, https://expo-proffdok.app.
- Kontrollert main → demo 0280d29449cea52491d3ede1fcb79ad6091fd2b1. Demo-overlay bevart, READY dpl_AmrS9rxTytdZ494xUVWjSR6572K9.
- Sandbox preflight 19/19 og kurskontroll 5/5. Ingen reseeding. Produksjonsmigrering 20261114195127 installert én gang og kontrollert.
- Skynett: bytt bolig A→B→A, bevart separat kladd/bilde, kontakt/datoer, skjulte tilbakekalte/utløpte tilganger, ugyldig frist og gjenoppretting. Ny autentisert produksjons-UI-prøve ikke utført; produksjonsfanen krevde innlogging.

## PR342 – ikke TEST OK / ikke produksjon
Branch fase45b-shop-unit-overview-20261114. Fast preview:
https://expo-proffdok-git-fase45b-shop-unit-overview-20261114-ringside.vercel.app/?progressTest=safe

Tre feil gjenskapt og rettet under faktiske skynettopptak: overlappende masseplanfelter, hvit bemanningstekst på hvitt kort, mørk kontakttekst på mørkt valgt søkeresultat. Skynettverifisert på a40c3f6 og f7a2b1a. CI43645692692 grønn. F7 første bolig-browser-forsøk fikk Chromium SIGSEGV under oppstart av uendret self-attendance-test; overview-regresjonen med 64 kontroller bestod først. Nytt forsøk fullført grønt; se endelig CI nedenfor. Mobil 320/390 er automatisert browserkontroll, ikke fysisk mobil/skynett-resize.

## Faktisk Sandbox-flyt og opptak
Lindeparken, prosjekt e09430fb-b1da-4685-87fe-c9226367115f: fire syntetiske boliger og kontakter; ingen kundedata eller e-postutsending. Oppsett/import/manuell retting/medeiere, grunnpakke/tilvalg/bilder/rom, publisering, beboervalg, prosjektlederkontroll og aksept av 4500-kroners eksempeltilvalg gjennomført. Masseplan: åtte aktiviteter 20.11–16.12, takt to arbeidsdager. Tilvalgsfrist 30.11 kl.12 Oslo. Ordre B-2 klargjort, leverandør .invalid, forhåndsvisning uten sending. Bemanning inn/ut og lagret historikk kontrollert. Påkrevd sjekkliste fordelt til fire boliger, H0101 fullført 2 OK/1 ikke aktuelt med tydelige DEMO-kommentarer. Tre manglende FDV. Kritisk forhold lagret, men negativ overtakelsesprøve stoppet konkret på øvrige uvurderte forhold; den er ikke bevis på isolert kritisk-sperre. Kontrakt/indexgrunnlag/a-konto er syntetiske, ingen faktura sendt.

Eksisterende QA-butikktilgang: boligbytte, kontakt/frister, manuelt tilvalg med foto, kontroll og aksept; konflikt 409 løst med Hent sist status og bevart kladd. Ingen nye butikktilganger opprettet.

Eksisterende PILOT: levert ordre B-3 og historikk inspisert uten å nullstille. H0101 overtatt med restpunkter beholdt. Faktisk samlet PDF lastet ned (10 sider, 46111 byte), alle ti sider visuelt gjennomgått. Faktisk ZIP lastet ned med samlet PDF, JSON-historikk/manifest/LES-MEG og to originale UE-testbilder. Hjelp/retur bevarte B103/H0101. Firmaadmin-roller bare lest.

## Videoer
Mal PROFFDOK-VIDEO-1.0: virkelige Sandbox-skjermer, tekst uten lyd, animert peker og klikk bare ved faktiske klikkmål. Ingen genererte UI-bilder. V1-filer beholdes.

| Film | Varighet / kapitler | SHA256 |
|---|---|---|
| finn-bolig-v2.mp4 | 112 s / 8 | 68e01deb5fb6b9ac72b6c3bb462de1ad51f71f2a63928088aaf129689164bfea |
| bolig-masseplan-v2.mp4 | 90 s / 5 | 6e4fcb18fb8ab1b67c1c301e98ff52ef1537d40fc46eae9722dda486bb855037 |

Begge 1920×1080, 24 fps, ingen lyd, VTT/kapitteltekst følger. Ferdige MP4-er visuelt kontrollert hvert andre sekund gjennom hele varigheten. Finn-bolig-opptak fra f7a2b1a; masseplan fra tidligere planrettet kandidat på samme branch (før kontrastrettelsene som ikke berører planpanelet). Guide sourceCommit er f7a2b1a som integrasjonsgrunnlag, ikke påstand om identisk opptakscommit for alle scener.

A–Å V13: 92 scener / 1037 sekunder. Rollen er tatt med og UE-portal er faktisk testet. Eksisterende Lindeparken-tilgang Eksempel UE – DEMO / Robin Eksempel ble funnet med mottakerlenke og utløp 21.11. Ingen ny tilgang ble opprettet. Den tidligere antakelsen om at ny UE-tilgang måtte opprettes er avklart og gjelder ikke lenger. Bekreftet H0101 førbefaring 20.11 med tydelig DEMO-merknad, fullført egen H0102-kontroll (2 OK / 1 ikke aktuelt), gjenåpnet og kontrollert lagrede svar. Prosjektlederen ser bekreftelsen; planen er uendret.

Eksisterende syntetisk PDF-kladd fikk CORS403 fra bolig-partner-files. Live Sandbox v5 manglet den faste preview-origin. Sandbox-only v6 la til akkurat denne adressen, beholdt samtlige øvrige live filer, verify_jwt=false og grant-/filkontroll. Skynett retry lagret vedlegget. Faktisk nedlastet PDF er byte-identisk med originalen: SHA2563108ad97d1844ac6649170e92031f245961fbe3c1fef312d0a8d04932e53a8e1. Partnerfiltest 20/20 PASS. Sandbox-kilde a47455730af022bf38a83804784b1bb499872115 på sandbox/video-image-origin-20261114. Produksjon urørt.

Varslingsscene viser prosjektets opt-in AV og transport deaktivert. Forklarer straks-publisering hele døgnet, dialogsamling to minutter, datoplanlagt fra08, automatisk fristpåminnelse08–18 norsk tid. Ingen transport eller opt-in aktivert.

PR342 er nå bare UI/relevante tester/dokumentasjon: e1346b45652f06450420bfdb48e5be7894be8b96, CI43648967422 alle10grønne. Videoene er skilt til PR343 fra ren main fordi bolig-core-boundary korrekt avviste blandet scope. Ingen guard svekket. Kortfilm-kandidat9ffc9345db0a35d1af865fe61a321bb3e679ee2d, CI43649505105 alle10grønne. V1-metadata brukes som frosset baseline; bare de to avtalte filmene kan avvike, med eksplisitt V2-hash/varighet/kapitler og uendret identitet/tilgang. All eksisterende native video-QA beholdt.

Faktisk skynett på integrasjonscommit35954d9: begge kortfilmer lastet, riktige varigheter, native avspilling, kapittelhopp, slutt, tekstalternativ og retur. Separat PR343-origin viser innlogging for appen; offentlig masseplanfil ble avspilt der i skynett. Ny innlogget appprøve på separat origin er ikke attestert. A–Å V12 forblir produksjonsutgaven til godkjent publisering.

## Endelig A–Å-filkontroll

Leveransefil: 41820939 byte, SHA256 e1d52d0fc2a2561a53b62ad41e4a2fe6eb32a38610d2e828bec8ff357d27ab0d. H.264 1920×1080, 24 fps, 1037 sekunder, ingen lyd og 92 innebygde kapitler + VTT. Hele masterfilen dekodet og 519 bilder (hvert andre sekund) gjennomgått i 33 kontaktark; alle scenenumre 1–92 og overganger kontrollert. Leveransefilen er komprimert fra samme master, full dekoding bestått og tekstkvalitet kontrollert i 1080p. Alle 92 scener har eksplisitte pekerkoordinater. Ikke kontinuerlig 17-minutters sanntidsvisning i nettleser.

## Gjenstår / publiseringsport
- V13 skynettavspilling og manifest/CI må kontrolleres på endelig videokandidat; lokal filkontroll er bestått.
- TEST OK for nye UI-rettelser og videoer før main → Production → demo. PR341s tidligere TEST OK gjelder ikke disse nye endringene.
- Sandbox-only origin-kilder holdes utenfor main og synkes bevisst til demo-overlay. Ingen ny e-posttest er nødvendig for filmene.
- Fysisk mobil/Safari er ikke testet. Automatisert mobilavspiller inngår i eksisterende native regresjon.

Rollback: PR341 egen revert med kontroll av kompatibel additiv DB-funksjon. PR342/343 ikke utgitt. Videorollback er tidligere manifestposter til V1/V12; gamle filer beholdt. Ingen passord eller tokenlenker lagres.

Redigerbar kildepakke: libfile_fde3_f-669751fc82788191ac917cff3cf24374_8c23f6c69fcc81918d7107a6c6360e14, versjon1 inneholder tidligere85-scene arbeidsrender og kortfilmene. Endelig92-scene kildepakke erstatter samme identitet etter ferdig filkontroll.

## Opplastingsblokkering 15.11.2026 UTC

GitHub MCP create_blob avviser 42 MB-filen: HTTP400, «MCP request body is invalid or exceeds the 16 MiB limit». Første59MB-forsøk oversteg også gRPC64MiB. Dette er transportgrenser, ikke avslag fra automatisk godkjenning. Ingen feil fil eller ufullstendig blob ble installert. Lokal gh har ingen innlogging. Den ferdige leveransefilen krever autentisert Git-push; ingen produksjonsendring eller CI-svekkelse er gjort for å omgå transportgrensen.

Neste konkrete steg: autentiser GitHub CLI, opprett isolert checkout på PR343 HEAD9ffc9345db0a35d1af865fe61a321bb3e679ee2d, installer ferdig MP4/VTT og manifest-entry samt lokal oppdatert hjelpetest/README/dekning. Kjør CI, sjekk publisert commit, test native Hjelp og full film i skynett. Ikke merge før nytt TEST OK. PR342e134 og PR3439ffc har begge10grønne kontroller; nye A–Å-filer er foreløpig utenfor aktiv manifestpost.

Ferdig MP4 lagret separat: Library libfile_fde3_f-d715210c99a08191aeb3caa6264588a5_8c23f6c69fcc81918d7107a6c6360e14. Kildepakken ble versjonsavstemt: gjeldende versjon2 inneholdt87 scener; denne bevares som historikk og sluttpakken legger til92-scene kandidaten. Aktiv Hjelp-manifestpost er fortsatt V12.
