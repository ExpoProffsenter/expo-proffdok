# A2 – rutiner og avvik, 6. oktober 2026

Miljømål: BEGGE. Første leveranse er feature-Preview mot Sandbox. Ingen produksjonsmigrering, merge eller demo-synk i denne runden.

Avtalt scope: `src/modules/kshms/**`, den scope-styrte KS/HMS-monteringen og varsel-/prosjekthoppet i `src/main.jsx`, KS/HMS-koblinger i `deviationViewTools.js` og vern av allerede koblede sjekkpunkt i `checklistTools.js`. Serverkontrakten ligger i KS/HMS-migreringer og en ny ansvarlig-e-postfunksjon med egen kø. KS/HMS-checker, byggets testkommando og dokumentasjonen oppdateres. Sales, hydrering, prosjektlagring, portal, prissøk og øvrige flyter har eksisterende regresjonsvern og får ingen funksjonelle endringer.

Biblioteket utvides utover de 12 startforslagene. Derfor erstattes testen som krevde nøyaktig 12 katalogkort med kontroller for unike stabile nøkler, egen fagspesifikk tekst og dekning av alle 121 innholdstemaer. De første 12 nøklene beholdes. Tom oppstart beholder de 10 tidligere grunnforslagene; særtemaer anbefales bare ut fra aktiviteter/risiko. Firmautkast, godkjente utgaver og signaturer endres aldri automatisk.

Melder velger ansvarlig. Bare valgt ansvarlig får fast oppgavevarsel og e-post. Ansvarlig dokumenterer årsak, tiltak og egen kontroll, og lukker selv. Varselet fjernes bare ved autoritativt lagret lukking. Firmaadmin kan tildele/gjenåpne, men kan ikke lukke en annens sak. KS/HMS bestemmer status på prosjekt-/sjekkpunktavvik som er koblet inn; øvrige prosjektavvik følger dagens flyt.

QA omfatter eksisterende critical checks, nye scenariotester, rollback-tester i Sandbox og grensesnittprøve. E-posttester bruker syntetiske mottakere og erstattet transport. Publisering til den faste Preview-adressen bruker kontroll av forventet branch-SHA for å unngå overskriving av en eventuell annen kjøring.
