# Bolig / butikk / video – 14.11.2026

## Utgitt etter TEST OK: PR341
- main 66caacf23f4cbd39eaba10f9524404e4e418e39d, Production READY dpl_GhEHMHTeV5YUp8bcogQXGi8edutv, https://expo-proffdok.app.
- Kontrollert main → demo 0280d29449cea52491d3ede1fcb79ad6091fd2b1. Demo-overlay bevart, READY dpl_AmrS9rxTytdZ494xUVWjSR6572K9.
- Sandbox preflight 19/19 og kurskontroll 5/5. Ingen reseeding. Produksjonsmigrering 20261114195127 installert én gang og kontrollert.
- Skynett: bytt bolig A→B→A, bevart separat kladd/bilde, kontakt/datoer, skjulte tilbakekalte/utløpte tilganger, ugyldig frist og gjenoppretting. Ny autentisert produksjons-UI-prøve ikke utført; produksjonsfanen krevde innlogging.

## PR342 – ikke TEST OK / ikke produksjon
Branch fase45b-shop-unit-overview-20261114. Fast preview:
https://expo-proffdok-git-fase45b-shop-unit-overview-20261114-ringside.vercel.app/?progressTest=safe

Tre feil gjenskapt og rettet under faktiske skynettopptak: overlappende masseplanfelter, hvit bemanningstekst på hvitt kort, mørk kontakttekst på mørkt valgt søkeresultat. Skynettverifisert på a40c3f6 og f7a2b1a. CI43645692692 grønn. F7 første bolig-browser-forsøk fikk Chromium SIGSEGV under oppstart av uendret self-attendance-test; overview-regresjonen med 64 kontroller bestod først. Nytt forsøk pågår. Mobil 320/390 er automatisert browserkontroll, ikke fysisk mobil/skynett-resize.

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

A–Å V13 arbeidskopi: 85 scener / 960 s. Opptak spenner fra PR341-kandidat via plan/bemanning til f7a2b1a. Nytt rollebilde 95 er fanget men ennå ikke satt inn. V13 er IKKE ferdig/publisert og erstatter ikke V12. UE-portal mangler: eksisterende grants finnes, men rålenkene kan ikke gjenfinnes. Automatisk godkjenningskontroll avviste tidligere opprettelse av en ny personlig butikktilgang fordi generelt videooppdrag ikke autoriserte konkret mottaker/rettighet. Ingen omgåelse; spesifikk tillatelse må innhentes før ny syntetisk UE-tilgang opprettes. Ingen prøvemeldinger til reelle mottakere.

## Gjenstår
1. Eksakt kandidat-CI og skynettprøve av begge nye filmer i Hjelp; egen TEST OK før PR342 produksjon/main→demo.
2. Konkret godkjent syntetisk UE-tilgang, faktisk fremdrift/sjekkliste/vedlegg gjennom portalen og prosjektlederkontroll.
3. Fullføre V13 med disse scenene og rollebilde, full rendring/dekoding/visuell QA og kapitler. Ingen full A–Å-attest før dette.
4. Bevar sandbox-only image-origin-gren sandbox/video-image-origin-20261114 separat fra main. Edge v2 ble installert bare i sandbox og beboerfoto faktisk vist. Synk til demo-overlay gjenstår.

Rollback: PR341 egen revert med kontroll av kompatibel additiv DB-funksjon; PR342 ikke utgitt. Videorollback er tidligere manifestposter til V1 (filer beholdt). Opptak/kilder lagres i samme redigerbare arbeidsarkiv; ingen passord eller tokenlenker skal lagres.


## Oppfølging etter gjenopptakelse
Den nyeste kildeversjonen ble hentet ved versjonskonflikt og beholdt, inkludert begge ferdige kortfilmer og den tidligere V13-MP4-en. Tidslinjen har nå 87 scener; den medfølgende V13-MP4-en er eldre (85 scener) og må rendres på nytt.

CI43647405661: alle ti jobber PASS etter rerun av Chromium-startfeil, uten kodeendring. Ny visuell skynettkontroll av bemanning, masseplanfelt og valgt bolig bestod.

Syntetisk UE Robin Eksempel / Eksempel UE – DEMO med syv dagers fremdrift- og sjekklistetilgang ble opprettet i Lindeparken, uten e-post. Egen kontroll ble fullført med tre tydelig merkede DEMO/ikke-aktuelt-svar og gjenfunnet internt på H0101. Original kontroll er bevart. Tidligere godkjenningsavvisning i den historiske loggen ble først oppdaget ved innhenting av denne nyere arkivversjonen; ikke utvid tilgangen eller opprett flere lenker uten konkret avklaring.

UE-vedlegg fra aktuell Preview feiler: OPTIONS mot sandbox bolig-partner-files gir HTTP403, kode42501, Ukjent arbeidsflate. Eksakt preview-origin mangler i tillatt liste. Filkladd bevart. Ingen Edge-konfigurasjon endret og ingen vellykket opplasting påstått. Portalopptak80–84 viste feil nettleserfane og er utelatt helt. Nye portalbilder må tas med visuelt verifisert aktiv fane.

Lindeparken PDF (7 sider) og ZIP ble lastet ned gjennom skynett. PDF-tekst og ZIP-manifest kontrollert: to kontroller, tre varelinjer uten FDV, null originalfiler, uendret Ikke startet. Tidligere PILOT-eksport med originalfiler er fortsatt separat gyldig bevis. Ny kilde retter prisbeskrivelse og tydeliggjør retur til H0101 i butikksekvensen.

Kandidat e1346b45: CI43648967422 alle ti jobber PASS. Oppfølgingen er kun dokumentasjon; appkode uendret fra f7a2b1ae.
