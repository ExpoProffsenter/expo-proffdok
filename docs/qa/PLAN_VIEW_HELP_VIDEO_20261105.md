# Planvisning, bemanning og PDF – filmintegrasjon 5. november

Miljømål BEGGE, utført bare PR308 Preview/Sandbox fra7aeaaa09. Main34daef4c og PR3114c5c0632 kontrollert via fersk GitHub/ls-remote. Ingen konkurrerende skriver observert.

Scope: ny MP4/VTT og guidepost, additiv avspillerprøve, avgrenset dekningsrad, modul-README, manifest og releaseprosa. Ingen plan-/backend-/tilgangskjerne, migrering eller demo-overlay kopieres fra PR311.

Opprinnelig film:120s/11scener/1920×1080/H264/24fps/2880frames/ingen lyd.6854659bytes, SHA256 e8be7c1b6384c96c329ccdbe7bd027991e52f25ab04c9b0fe54cfd839b69ebb2. Ti opprinnelige faktiske Sandbox-bilder og full første PDF-side. Full decode/visuell kontroll er dokumentert i de eksisterende kildene. [Film](https://chatgpt.com/library?file_id=libfile_9f220ccc022c8191a7d769850baeaf3f&account_id=personal), [redigerbare kilder](https://chatgpt.com/library?file_id=libfile_452b935c00e88191a9291c29eedf98a7&account_id=personal).

Ti tidligere metadata/filmer beholdes byteidentisk; eget hashvern907b04a641c6caa4f3cc606ca0c183a6b1812d22cbb839713104e6d65e650a17. Alle historiske hashkrav beholder sine nøyaktige opprinnelige filmutvalg. Ny film bruker eksisterende kshms-manage-filter/tema og native avspiller. Nye native krav: avspilling/start/seek/slutt/VTT/tekst,320/390/768/1363/1920/kort/fullskjerm, rolle-revokasjon uten tap av foreldrekladd, samme tema og eksakt fokus ved retur.

Oppretting/redigering, bemannings-PDF/CSV/ICS, full KSHMS-006, fysisk Safari og øvrige helappreiser er fortsatt åpne. Eksakt kandidat-CI/READY/publisert binding føres i PR308 etter faktisk resultat; tidligere CI972/976 er ikke sluttattest. Tilbakeføring: revert bare dette filmtillegget til7aeaaa09, ingen DB-steg. Ingen TEST OK/main/demo-merge eller utsending.

## Fullført kandidatkontroll etter avbrutt chat

Kandidat `63a9bc8dfea10e5f2f96aa1caf9efc65ab4a6efe`: CI977/run42063219007 er SUCCESS, alle ni pakker samt sluttgate127374428459. App-browser127370392505 bekrefter 565 filmkrav, inkludert den nye planfilmens metadata, faktiske dekoding/start/kapittel/seek/slutt, fem bredder, kort skjerm, fullskjerm, tilgangsbortfall og retur. Loggens oppsummeringstekst nevner fortsatt forrige filmutvalg; den aktuelle testen går gjennom alle elleve guideposter. Ingen tester er endret i denne etterkontrollen.

Vercel `dpl_7PfhUMmqJRCdc4ukhiMsLp7CowvM` er READY på eksakt kandidat, target=null og fast PR308-alias. Publisert `/assets/main-Cbw4yqEn.js` inneholder Sandbox-binding `ppvircenkjizeiqdxphj`, uten Production-binding `dqffxflaoyarbxyiyhop`. HTTP200 MP4:6854659bytes, SHA256 e8be7c1b6384c96c329ccdbe7bd027991e52f25ab04c9b0fe54cfd839b69ebb2.

Ny innlogget skybrowserøkt med eksisterende demokonto: Hjelp viser filmen direkte under KS/HMS. Faktisk video120s/1920×1080/readyState4/paused=true/autoplay=false; VTTreadyState2. Kapittel1:30 gir90s; ordinær avspilling bekreftet paused=false/time90.2734 og senere104.1118. Alle elleve tekststeg kontrollert. Lukk video returnerer fokus til samme filmknapp og fjerner video. Åpning inne i KS/HMS og Tilbake til veiledningen returnerer samme tema og eksakte knapp/fokus,0videoer. Lukk tema og Lukk hjelp gir samme Startside/fokusHjelp. Innledende rolleoppfrisking byttet Hjelp-treet; gammel AX-peker ble erstattet med fersk semantisk knapp. Ingen appfeil utledes av den utdaterte testpekeren. Ingen serverlagring, utsending eller tilgangsendring.

Main34daef4c, demoabc38f7e og PR3114c5c0632 er ferskt kontrollert uendret. Denne kvitteringen er bare dokumentasjon for uendret kode/media. Ingen TEST OK eller produksjonssetting. Neste: avgrenset planoppretting/redigering og områdeflyt/ny områdefilm i PR311; behold tidligere åpne helappreiser.
