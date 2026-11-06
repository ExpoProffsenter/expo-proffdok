# Bemanningsplanens eksportfilm – 6. november 2026

Miljømål BEGGE, kun PR308 Preview/Sandbox. Baseline 043922206e4cf3fc0aa54a1c9cfb9937e2b9a295; fersk main 34daef4c0526b93ddbd84c3bfd97fb0833d97caf. Ingen TEST OK eller main/demo-merge. Scope: én MP4/VTT og guidepost, eksisterende filmprøve og dekningsregister, Hjelp-README og dette QA-grunnlaget. Ingen plan-, avspiller-, auth-, tilgangs-, database- eller utsendingskode endres.

## Gjenfunnet faktisk leveranse

Filmen var allerede produsert og lagret før chatbruddet. Den gjenskapes ikke. [Film](https://chatgpt.com/library?file_id=libfile_3f6f5aa287348191b5640c2b0e8ae46d&account_id=personal) og [redigerbare kilder](https://chatgpt.com/library?file_id=libfile_ab23bc5c39e48191acd318bde443a90e&account_id=personal).

102 sekunder, åtte kapitler, H264/1920×1080/24fps/2448 frames, ingen lyd; 3927488 bytes, SHA256 240f3d8945c215f3c49c19c58175148b109180bb00e4f24ddd28c581def293db. VTT SHA256 0b51cbe67b539754a7966f7a7ea9e44c8a86efa51be5e91c7fd018e1f51a8424. Gjenopptatt kontroll har bekreftet alle kildefilers SHA256, ffprobe og visuelt alle åtte kodede representantscener. Tidligere validation.json dokumenterer full decode PASS; ingen ny filmbytes eller rekonstruksjon av apptekst.

Opptak: eksisterende syntetisk QA-PLAN-0511 på PR308/04392220 Preview/Sandbox. Én oppgave, to personer, 5.–6.11 kl.08–16; samtidig behov to personer, 16 persontimer per dag/32 totalt. Kildene har faktisk bemannings-PDF på tre sider/35389 bytes/SHA256 7a746b9dea5c83f9fdf90c72b7b9bab739aad5fb401ed4e6a522aa02efce8e20, CSV338 bytes og ICS1617 bytes/to arbeidsøkter i Europe/Oslo. Tidligere visuell PDF-kontroll og innlogget kildeprøve er historiske kildebevis, ikke en ny innlogget test i denne chatten. Kalenderimport er ikke utført.

## Integrasjon og kontroll

Ny filmknapp ligger direkte under KS/HMS og i åpnet tema. Samme eksplisitte ferske forvaltertilgang som eksisterende planfilmer; ingen ny kontekstlesning. Kapitler/VTT/full tekst/søk og avspiller gjenbrukes. Alle tretten tidligere guideposter er identiske: JSON SHA256 0fee5b378bc83a1f08d6726750acb7669fd45a1e54bbe65485c89b1636c159f3. Alle gamle MP4/VTT beholdes.

Eksisterende native filmprøve beholder historiske bevarings-/avspillings-/rolle-/retur-/kladdekrav. Den nye filmen får full faktisk start/spoling/slutt/VTT/tekst, fem bredder/kortskjerm/fullskjerm, søk/nested retur/eksakt fokus og tilbakekalling av forvalterrett under åpen avspilling. Antall skjulte forvalterfilmer øker fra tre til fire fordi en ny identisk filtrert post legges til; tilgangskravene er uendret.

Lokal Sandbox npm build inkludert full critical-kjede PASS. Metadata/hash, komponentbuild, syntaks, scope/release-docs, 145-reisers videoregister og whitespace PASS. Første lokale native forsøk manglet Playwrights versjonsbundne executable. System-Chromium ble deretter prøvd én gang, men stoppet før første assertion av socket/ProcessSingleton og ptrace Operation not permitted. Ingen lokal native PASS. Ny eksakt kandidat-CI/READY føres nedenfor.

Faktisk skybrowser på PR311s faste Preview viser ordinær appinnlogging. Tidligere innlogging er ikke videreført; ingen ny innlogget plan-/HR-/filmkontroll påstås. HR-malflyt og eksportprøve i forrige chat var delkontroller uten serverlagring/utsending, ikke full HR-/KS/HMS-attest.

## Produksjon og neste steg

Fast testadresse: https://expo-proffdok-git-fase45b-ux-live-review-20261104-ringside.vercel.app/?progressTest=safe . Hjelp → KS/HMS → Bemanningsplan – les tall og eksporter. Prøv avspilling, kapittel 1:18, Les filmens steg og Tilbake til veiledningen. Ingen data trenger å lagres eller sendes.

Full kandidat-CI og READY må kontrolleres. Innlogget sluttprøve, full HR/Bolig A–Å, positive eksterne portaler, resterende helappregister og fysisk mobil/Safari står åpne. Ingen kalenderimport eller reell utsending. Ved senere autorisert release må PR311s aktuelle plan-/HR-/rapportrettelser vurderes sammen med filmene. Gamle Sandbox-migreringer skal ikke kjøres igjen.

Tilbakeføring: revert bare denne film-/guide-/testpakken til 04392220; ingen DB-steg, datareset eller sletting av kildefilene.
