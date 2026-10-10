# Kompakt Avvik/SJA/RUH – 2026-10-08

Miljømål BEGGE. Først samme feature/Sandbox, PR #216 draft. Brukerens skjermbilder (alle 14 lest) viste at beskrivelser, dokumentknapper og alle åpne/lukkede avvik tok mange skjermhøyder. Oppgaven er avgrenset til prosjektets dokumentinngang og avviksvisning, tilhørende hjelp/tester/dokumentasjon.

## Endret visning

- Fire lukkede dokumentgrupper viser antall utkast/signerte, åpne/lukkede RUH og uferdige/fullførte kontroller/risiko. Åpning viser eksisterende registrering og oversikt; bare én dokumentgruppe er åpen. Antall gjelder alle synlige prosjektvalg.
- Native details/summary lukker sjekkpunkt-/prosjektgrupper og enkeltsaker. Åpne saker står først. Radene viser tittel, status, ansvarlig og frist der de finnes.
- Besøkte dokumentbarn og avviksfelt beholdes i DOM mens de skjules. Nytt prosjektavvik åpner omsluttende gruppe/rad før fokus/scroll.
- Oppfrisking er lesende. Scope kontrolleres på bruker/firma/prosjekt. Sene svar forkastes; nettverksfeil beholder bekreftede antall; tapt tilgang rydder og sperrer.

## Kontroller

Pure critical-project-document-overview-check: riktige antall/tekster, parallelle lesende kall, ingen kommandoer, duplikat/ugyldig metadata, tilgangsgrenser og sene svar. Den importeres fra eksisterende critical-kshms-executions-check og kjøres i build/CI.

project-document-overview-react-check: faktiske React-komponenter med CSS, kun simulert transport. Ingen kall uten modultilgang, nøyaktig to metadata-RPC-er før åpning, alle grupper lukket, én åpen gruppe, avviks-/kontrollhendelse, offline/tapt tilgang/forsinket prosjektbytte, låst oppretting, åpne avvik først, folding uten tap av redigering, eksisterende legacy-lukking og koblet sak, nytt prosjektavvik synlig etter lagring, ingen writes fra folding/antall.

Eksisterende kshms-job-links-react-check og kshms-project-executions-react-check: prosjekt/SJA/RUH, registrering, kladd/retry, ansvarlig, rutineutgaver, egen fullføring, readbackfeil, oppgaver og låst tilgang PASS. Job-links sitt gamle «ingen kall før åpning» er erstattet med nøyaktig to lesende metadata-kall fordi statusantall nå er ønsket kontrakt; ingen øvrig test er svekket.

React-sjekklisten er gjennomgått for lazy barn, monteringsbevaring, funksjonelle state-oppdateringer, scopesatt effekt/opprydding, tilgjengelig summary/knapper og avgrenset CSS. Ingen main-/bootstrap-/meny-/Sales-/lagrings-/tilgangskjerne endres. Sammenligning mot main før og etter bygger videre på eksisterende feature-arbeid; denne UX-diffen har bare oppgitt scope. Ingen nye SQL-tester trengs fordi databasen ikke endres.

Full Sandbox critical/build PASS med exit code 0. Eksakt funksjons-SHA 990ce731, identisk source tree, READY dpl_Gm7bVWwzsQ7N3nrcXiaL32RQbebW på fast alias og Core Safety 37844000342 / jobb 113540184367 completed/success er bekreftet. Detaljer står i CONTINUITY.md. Innlogget fullapp/mobil er ikke prøvd av utvikleren: skyfanen viser innlogging, og bildene er førbildene fra brukerens økt. Kort brukerprøve står i USER_TEST.md. Ny UX-TEST OK og PDF-TEST OK gjenstår; tidligere TEST OK består. Ingen Production/main/demo eller reell e-postsending.
