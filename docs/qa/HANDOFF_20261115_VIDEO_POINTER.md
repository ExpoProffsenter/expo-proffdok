# Videopeker – status 15.11.2026

Miljømål BEGGE. Ingen TEST OK eller produksjonssetting. PR342 er separat UI-rettelse; PR343 er filmleveransen. Main bekreftet 66caacf2.

## Ferdig kandidat, ennå ikke pushet
Lokal commit 6ab83da8a66d4f29bc76546d659bde01f6bafee6, parent 9ffc9345db0a35d1af865fe61a321bb3e679ee2d, branch video/bolig-complete-v13-review. Arbeidsområde /workspace/scratch/c55ece78a309/video-work.

Tre oppdaterte filmer: Finn bolig V3 112s/8 kapitler, Masseplan V3 90s/5 kapitler, A–Å V13 1036s/91 kapitler. Stor hvit peker, mørk kant, rolig bevegelse og klikkpuls; flytende turkise rammer fjernet. Hjelp-kobling, VTT og kapitteltekst er oppdatert i kandidaten; gjeldende remote peker fortsatt på V12.

V13 SHA256 3e456bfce02bda0197ce4450b97d03d090c878acf59513a435d8621d661548c1. Hele filen dekodet feilfritt, faktisk sluttbilde fra alle 91 scener visuelt kontrollert. UE-scener 78–81 viser portal og eksisterende demovedlegg. Ingen ny backend- eller opplastingstest påstås. Tidligere filmer beholdes.

Mediehash/bytes og statiske guidekontroller bestod før nettleserstart. Native lokal test stoppet før avspilling: standard Chromium manglet, nedlasting gav ugyldig ZIP; installert Chromium kunne ikke opprette socket (Operation not permitted). Ingen test svekket. Video coverage registry PASS (145 reiser/18 områder). Ingen skynettfaner eller innlogget økt fantes i ny samtale.

## Varig gjenoppretting
Hele kandidatcommiten er bevart som verifisert inkrementell Git-bundle: ProffDok_video_V13_6ab83da8.bundle, Library ID libfile_fde3_f-2cdc6f0ce96c8191b54b0d117fbb1c7e_8c23f6c69fcc81918d7107a6c6360e14. Krever parent 9ffc9345. Bundle inneholder filmene, VTT, manifest, tester og dokumentasjon.

Redigerbare kilder: eksisterende ProffDok_Bolig_V13_opptak_arbeidskopi.zip, Library ID libfile_fde3_f-669751fc82788191ac917cff3cf24374_8c23f6c69fcc81918d7107a6c6360e14. Nyeste metadata viser versjon3, 133813694 bytes. Forsøk på å erstatte forventet versjon2 ble korrekt avvist; versjon3 er ikke overskrevet. Lokale kilder med ny peker finnes /workspace/scratch/c55ece78a309/video_sources/current.

## Neste steg
1. Fullfør GitHub CLI-innlogging. GitHub-connector leser/skriver tekst, men Git-push feilet med manglende brukernavn; gh var ikke innlogget. Ingen hemmeligheter eller innloggingskoder lagres her.
2. Hent nyeste PR343-branch, bevar dette dokumentasjonscommitet og legg kandidatcommit 6ab83da8 på toppen (cherry-pick eller kontrollert rebase). Push uten force til video/bolig-short-guides-20261114. Ikke overskriv remote med den eldre lokale forelderen.
3. La full CI kjøre browserkontrollen og kontroller eksakt READY-commit. Test de tre filmene i Hjelp i skynett, inkludert start, klikkpuls, kapittelhopp, slutt og retur.
4. PR342s UI-rettelser må følge med før produksjonssetting. Be om TEST OK når konkret preview er kontrollert; deretter avtalt main → demo med bevart overlay.
