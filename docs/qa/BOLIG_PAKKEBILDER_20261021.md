# Grunnpakker og tilvalg – kompakt tilbudsmønster, bilder og prosjektforside

Miljømål: BEGGE. Eksisterende feature-branch/PR #278 og fast Preview. Ingen merge eller Production-/demo-synk uten relevant TEST OK.

Kenneths skjermbilder/krav 21. oktober: alle tilvalg synlige i liste med «Legg til tilvalg», minst mulig scrolling, bildeopplasting i begge editortyper, ingen nettsidelenke som sender kunden ut av appen, tydelige fargede menyvalg, ny åpning til prosjektoversikten. «Bytt prosjekt» fjernes fra prosjektbildet; «Byggoversikt» blir «Hovedside». Arbeidsmåten skal følge tilbudsbyggeren ellers i appen.

## Avgrenset løsning

- Boligkatalogen følger tilbudsbyggerens mønster med varekort, katalogoppslag, antall/enhet, pris/fratrekk og direkte bildevalg. Eksisterende Sales-komponenter, økonomimotor, auth, globale menyer og andre moduler er ikke endret.
- Grunnpakker og Tilvalgsliste viser alle lagrede navn. Vareinnhold/prisdetaljer kan foldes ut per kort. Rediger ligger synlig utenfor innholdet. Hele listen skjules ikke når en editor lukkes.
- Begge opprettelsesknappene er synlige: Ny grunnpakke og Legg til tilvalg. Lagrede grunnpakkevarer er også sammenlagt inne i editoren. Ugyldig felt åpner sin varelinje før valideringsmeldingen vises.
- Bilde per grunnpakkevare og tilvalg: dra inn eller Last opp bilde, forhåndsvisning, Bytt bilde og Fjern bilde. JPG/PNG/WebP inntil 10 MB dekodes i nettleseren og lagres som JPEG på inntil 1600 px / 2 MB. Bildets bytes lagres ikke i lokal kladd eller RPC-payload.
- Eksterne bilde-/produktadressefelt er fjernet fra boligeditorene, og boligvarekort har ingen utgående produktknapp. Eldre lagrede lenkefelt beholdes i data og uforanderlige snapshots; brukeren sendes ikke ut av flyten.
- Ugjennomsiktig blå menyvalg og turkis aktivt valg, også i pakkeoppsett, boligfaner, oppsett og byggeveiviseren. Hovedside viser prosjektets bygg/boliger. Prosjektoversikt velger/oppretter prosjekt. Bytt prosjekt finnes ikke i prosjektbildet.
- Ny modulåpning og full sideoppdatering viser prosjektoversikten uansett gamle sessionStorage-peker. Arbeidssted ligger i den aktive BoligEntry-instansen; samme besøks tilgangsgate/fokus/fanebytte beholder det. Brukerens uttrykkelige prosjektvalg går til hovedsiden. Lokale redigeringsutkast beholdes og hentes når brukeren åpner editoren igjen. Manglende lagret prosjekt-ID skal aldri velge et annet prosjekt automatisk.
- OrderDraft beholder montert skjema ved ny boligvalgsrevisjon innen samme bruker/firma/bolig. Basisavvik krever eksplisitt gjennomgang; usendte vareutelatelser må ikke bli en tilsynelatende fersk ordre ved remount. Dette ble fanget av den eksisterende rompakke-/ordreprøven; ingen pris-/ordresnapshot endres automatisk.

## Storage og migrasjon

Kilde: 20261021173913_bolig_catalog_image_uploads.sql. Anvendt kun i Sandbox ppvircenkjizeiqdxphj, serverversjon 20261021174611.

- Egen privat bucket bolig-catalog-images. Immutable objektnavn company/root/randomUUID.jpg. Kun aktiv prosjektleder kan laste opp i eget aktivt prosjekt; lesetilgang følger fersk boligmodultilgang og arbeidsfirma, også for arkivhistorikk. Anon og andre firmaer avvises.
- Ingen UPDATE/DELETE-policy. Nytt bilde gir ny objekt-ID; Fjern bilde fjerner kun katalogreferansen. Tidligere valg-/ordresnapshots beholder sine bilder. Ubrukte opplastinger er foreløpig beholdt; kontrollert opprydding av ubundne objekter er en senere driftsoppgave.
- Eksisterende image_url inneholder stabil HTTPS-objektreferanse, ikke utløpende token. Rendereren henter kort signert leselenke (5 min), fornyer ved fokus og før utløp. Filbytes/rettigheter er fortsatt private selv om den stabile referansen bruker Supabase-formatet /object/public/.
- Dobbeltopplasting sperres, lagring venter på aktiv opplasting, sene svar etter unmount brukes ikke, og async opplastingssvaret må ikke overskrive tekst som er skrevet i mellomtiden. Feil beholder tidligere bilde og kladd.
- Sandbox readback bekreftet bucket.public=false, 2 MB, kun JPEG, to avgrensede SELECT/INSERT-policyer, ingen anon-EXECUTE. Autentisert rollback-prøve bekreftet egen lesing/opplasting samt avvisning av feil firmafolder/ugyldig sti. Ingen brukerprosjekter eller Storage-objekter ble endret i denne prøven.
- Sikkerhetsadvisor kjørt. Målrettet funn er tilsiktet authenticated SECURITY DEFINER for bolig_catalog_image_access; funksjonen er en boolsk Storage-policyhelper med auth.uid, eksisterende context-kontroll, rot/firma/rolle/arkivkontroll og fast search_path. Anon/PUBLIC/service_role EXECUTE er tilbakekalt. Øvrige eksisterende advisorfunn er utenfor denne endringen. Se https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable.

## Verifisering

- Isolert ekte Postgres/PGlite: 310 assertions, inkludert 21 nye bildepolicyprøver. Tidligere 289 beholdt.
- Faktisk React/JSDOM foundation og katalog PASS. Oppdatert remount-kontrakt er uttrykkelig bestilt av brukeren: full modulåpning går hjem; tilgangsremount i samme besøk beholder arbeidssted/kladd. Gammel dropdown-prøve er erstattet med prosjektoversikt/søk/retur, samme kladd-DOM og ingen ekstra get ved retur.
- Faktisk Chromium bildeflyt: 26 assertions. Begge editorers faktiske filvalg/komprimering, privat stabil referanse, readback via signert URL, lagringssperre under opplasting, tekst skrevet mens svaret er forsinket, feilbevaring, avvist SVG, fjern bilde, kollaps og 320/390/1024/1366 px. Isolert mock-transport for fil-/katalogserver.
- Faktisk Chromium Entry: 24 assertions; prosjektforside ved ny åpning/reload, Hovedside, ingen Bytt prosjekt, direkte katalog, synlige opprettelses-/redigeringsknapper, kladd og mobilbredder. Rompakke/ordre 36 assertions og eksisterende rominnhold 33 assertions PASS.
- Full critical build og eksakt publisert PR Core Safety-status føres i PR. Skynett ga tidligere tidsavbrudd; innlogget Preview-prøve med reell brukeropplasting gjenstår. Lokal Chromium er ikke påstått å være en slik prøve.

## Kort Preview-prøve

Fast adresse: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Åpne Boligprosjekter på nytt: Prosjektoversikt skal vises. Åpne et prosjekt: Hovedside, Grunnpakker og tilvalg og Oppsett er fargede; Bytt prosjekt er borte.
2. Grunnpakker og tilvalg → Ny grunnpakke. Legg inn vare og Last opp bilde. Lagre, velg Rediger og åpne varelinjen: bilde/innhold skal være der.
3. Legg til tilvalg → navn/pris → Last opp bilde → Lagre tilvalg. Alle tilvalgsnavn skal vises samlet; åpne Vis innhold ved behov. Rediger skal la deg bytte/fjerne bildet.
4. Bytt nettleserfane og kom tilbake under redigering: samme tekst beholdes. Prosjektoversikt går tilbake til prosjektvalg. En full ny åpning starter der, uten å slette lokale utkast.
