# Lesbar periodemerknad – 6. november

Miljømål BEGGE. PR311 fra6c223547, kun Preview/Sandbox. Scope: KshmsProgressBoard.jsx, periodens textarea-stil, eksisterende kshms-progress-react-check, KS/HMS README og dette endringsgrunnlaget. Ingen annen planlogikk, server, tilgang, PDF eller utsending.

Innlogget førkontroll på PR308/04392220 (samme originale felt): KS/HMS → Verktøy og maler → Fremdriftsplaner → DEMO – planoppsett og redigering05.11/QA-PLAN-0511 → Grovmontering sanitær. Lagret merknad på72tegn var INPUT/clientWidth553/scrollWidth579. Feltet klipper slutten i normal visning. Ingen data endret; begge dialoger lukket og ingen ulagret kladd.

Textarea har fire rader, vertikal resizing,16px tekst, linjeskift og bryting av lange ord. Samme maxLength5000, value og applyPeriod-handler. Lesemodus beholder eksisterende låste fulltekstvisning. Testen bevarer alle tidligere krav og legger til flerlags tekst med sluttsentinel, alle sessionnotater, lagring og gjenåpning, samt feltgeometri ved320/390/768/1363/1920. Eksakt kandidat-CI/READY føres i PR311; ingen lokal native attest.

Rollback: revert bare denne felt-/CSS-/testpakken. Ingen DB-steg eller datareset. Ingen TEST OK eller main/demo-publisering. Hjelp-filmene er integrert separat i PR308; deres nye innloggede avspilling og retur er kontrollert6.11. Full HR/Bolig A–Å og resten av helappmatrisen gjenstår.

## Gjenopptakelse 6. november – stabilt feltnavn

Fersk kontroll av eksakt e650ff74: CI983/run42227322709 feilet i app-browser/job127984692982, kshms-progress-react-check.mjs:63. Feltet ble funnet og fylt, men etter innskriving feilet samme eksakte Merknad-lokator under breddekontrollen. Åtte øvrige pakker bestod. Ikke en shell-feil og ikke grunnlag for blind omkjøring.

Textarea får eksplisitt aria-label=Merknad, slik at navnet er uavhengig av tekstinnhold. Eksisterende kontroller beholdes; ett ekstra krav bekrefter samme navn etter innskriving. Ingen lagrings-/plan-/backendendring.

Lokalt: full Sandbox npm build med critical-kjede PASS; timeline102 og launcher11 faktiske React-krav PASS; release-docs selvtest og whitespace PASS. Native Chromium stopper før første browserassertion med ProcessSingleton socket Operation not permitted. Nettlesernedlasting ga avkortet ZIP og ble avbrutt; eksisterende system-Chromium bekreftet begrensningen. Ingen lokal native eller innlogget attest. Ny kandidat må gjennom CI og Preview før TEST OK.

Main34daef4c og demoabc38f7e er uendret ved fersk git-kontroll. PR308 har samtidig nyere dokumentasjonshode d3759ce5 og CI984; ikke overskriv eller bruk gammel PR308-status som sluttattest.

## Faktisk innlogget etterkontroll på46b66835

Fast PR311-host er READY/dpl_FQ8FqQHyUUu6TwkJ5rttfn3Swui4 på eksakt46b66835/targetnull. Faktisk main-D9AploPk.js:278291tegn, Sandbox-ref til stede og Production-ref fraværende. CI985/run42247360494: app-browser127993084522 SUCCESS med196plankrav og11launcherkrav. Øvrige pakker/sluttgate avstemmes i PR311.

Demokonto/QA-PLAN-0511: lagret72tegn åpnet i TEXTAREA,16px,108px høyde,clientWidth=scrollWidth=553,vertikal resize. Syntetisk758tegn/trelinjer/SLUTT-QA-0611 skrevet og eksplisitt lagret. Lukk planbygger → Hent lagret plan → faktisk ny serverhenting åpnet planbygger igjen. Gjenåpnet arbeidsoperasjon viste eksakt alle758tegn og linjeskift, fortsatt riktig navn og bryting. Deretter opprinnelige72tegn tilbakeført og lagret; ny åpning bekreftet eksakt original. Samme datoer/status/to personer beholdt. Lukk planbygger returnerte fokus til eksakt Åpne fremdriftsplan. Ingen eksport, migrering eller utsending. Dette er desktop Chrome; fem bredder er CI-bevis, ingen fysisk mobil/Safari-attest.
