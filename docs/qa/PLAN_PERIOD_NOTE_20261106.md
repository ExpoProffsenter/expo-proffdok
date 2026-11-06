# Lesbar periodemerknad – 6. november

Miljømål BEGGE. PR311 fra6c223547, kun Preview/Sandbox. Scope: KshmsProgressBoard.jsx, periodens textarea-stil, eksisterende kshms-progress-react-check, KS/HMS README og dette endringsgrunnlaget. Ingen annen planlogikk, server, tilgang, PDF eller utsending.

Innlogget førkontroll på PR308/04392220 (samme originale felt): KS/HMS → Verktøy og maler → Fremdriftsplaner → DEMO – planoppsett og redigering05.11/QA-PLAN-0511 → Grovmontering sanitær. Lagret merknad på72tegn var INPUT/clientWidth553/scrollWidth579. Feltet klipper slutten i normal visning. Ingen data endret; begge dialoger lukket og ingen ulagret kladd.

Textarea har fire rader, vertikal resizing,16px tekst, linjeskift og bryting av lange ord. Samme maxLength5000, value og applyPeriod-handler. Lesemodus beholder eksisterende låste fulltekstvisning. Testen bevarer alle tidligere krav og legger til flerlags tekst med sluttsentinel, alle sessionnotater, lagring og gjenåpning, samt feltgeometri ved320/390/768/1363/1920. Eksakt kandidat-CI/READY føres i PR311; ingen lokal native attest.

Rollback: revert bare denne felt-/CSS-/testpakken. Ingen DB-steg eller datareset. Ingen TEST OK eller main/demo-publisering. Hjelp-filmene er integrert separat i PR308; deres nye innloggede avspilling og retur er kontrollert6.11. Full HR/Bolig A–Å og resten av helappmatrisen gjenstår.
