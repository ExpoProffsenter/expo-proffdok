# Planbygger – mer plass til oppgavene

Miljømål BEGGE. Preview først på samme adresse/PR #254. Før endring: main a7bd4795, PR/head 21210b329e3c039a8a9d2a56ff17a6050f0aa099 og Vercel dpl_9xWp3ora4XVAcCy1bBH1kxVsuFwC READY med samme head/alias. GitHub/fetch bekrefter samme baseline. Brukeren ba om tettere verktøyområde og større tidslinje med dagens lesbare rader, og presiserte at det også gjelder Prosjekt → Fremdrift.

## Scope

Kun appkode i src/modules/kshms/KshmsProgressBoard.jsx og kshmsProgressBoard.css. Knapper og onClick/onChange-callbacks flyttes uendret mellom presentasjonscontainere. Planvisning, Angre, Arbeidsoperasjoner, Lagre og Eksport deler topplinje, med eksisterende Prosjektvalg, tilbud og deling ved siden av på brede skjermer. Tidsvisning og dato-/periodekontroller samles i én farget linje. Kortere søkefelt, fag, kompakte rader og søndagsvalg samles under. Søndagsvalget finnes også i bemanning.

Global kortpadding på section fjernes bare i den utvidede planpopupen. Ingen globale CSS-regler endres. Tidslinjen bruker gjenværende flex-høyde, med én scrollflate for oppgavene. Smale/korte skjermer kan scrolle verktøyområdet for å nå tidslinjen; ingenting skjules bak nye accordionvalg. Normalrader er fortsatt 66 CSS-px i prøven, med uendret statusfarge, undertekst, klikk og periodebånd. Drahjelp er fortsatt fast høyde og pointer-events:none, 20 px desktop / 32 px mobil. Datovelgeren har fortsatt tilgjengelig navn Vis dato selv om bare feltet vises på mobil.

Gjelder felles planbygger i Prosjekt, KS/HMS og Min side. Ingen main.jsx, Startside, bootstrap, planlagring/CAS/kladd, tilgang, SQL, e-post, tilbudsimport, kundedeling, PDF/CSV/kalender eller demodata endres. Tidligere umerget plan-/Startsidearbeid beholdes.

## Faktisk nettleserkontroll

Ny progress-layout-react-check bruker faktisk KshmsProgressBoard, appens style.css og APP_RUNTIME_STYLES. 21 syntetiske oppgaver. Valgfri PROGRESS_LAYOUT_BASE gir før/etter fra nøyaktig Git-baseline uten kildeendringer. Ingen ekte backend/kunde eller e-post brukes.

Målt med uendret normalradhøyde 66 px og lukkede prosjektvalg:

| Skjerm (CSS-px) | Før: hele oppgaver | Etter: hele oppgaver | Tidslinjens topp etter |
| --- | ---: | ---: | ---: |
| 1768 × 1002 | 5 | 9 | 298 px |
| 1440 × 900 | 3 | 8 | 298 px |
| 1280 × 800 | 2 | 6 | 298 px |
| 1024 × 768 | 1 | 4 | 402 px |
| 390 × 844 | Tidslinjen fortsatte under vinduet | 3 | 525 px |
| 320 × 740 | Tidslinjen var under vinduet | 1 | 550 px |

Tallene gjelder denne syntetiske prøven, uten lagrings-/feilmelding. Brukerens zoom, font og oppgaver med flere overlappende perioder påvirker antallet. 844 × 390 kontrolleres også med scrolling av verktøyområdet. Mobil prioriterer fortsatt store trykkflater og tydelige oppgaver fremfor å presse inn desktopmengden.

52 nettleserkontroller PASS på siste kode (58 med ekstra før/etter-kontroller). Full critical/build PASS. Kontroller: popupbredde/høyde, ingen horisontal overflyt i verktøyene, alle 21 oppgaver bevart, uendret radhøyde, mer tidslinjeplass, siste oppgave tilgjengelig, dag/uke/måned, periode/dato, søk/fagfilter, normalrader som standard, bemanning, prosjektvalg/importknapp og oppgavedialog. Før/etter måler minst 120 px spart høyde på desktop. Eksisterende 39 Prosjekt- og 128 KS/HMS-Chromium-kontroller PASS etter JSX-flyttingen: tilbudsimport/dedup/opsjoner, standardoppgaver, flytt/strekk/Angre, lagring/kladd/reload/konflikt, dato/tastatur/berøring, deltakere/egne planer, eksport/logo, låst/enkel ordre og firmasikring. Disse kontrollene beholdes uten svekkelser. Database-/PDF-modelltester gjentas ikke lokalt for ren layout; vanlig CI-suite beholdes.

React-gjennomgang: ingen nye hooks/effekter eller datalesinger; eksisterende komponenttilstand, nøkkel, åpne-/lagringshandlinger og dialogfokus beholdes. Ingen ny automatisk lagring. Detaljpaneler er fortsatt dialoger. Ny layouttest kjører i PR Core Safety med samme eksisterende Chromium-installasjon.

## Preview-prøve

Fast Preview: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app

1. Prosjekter → DEMO – VVS – fremdrift og bemanning 3 måneder → Fremdrift. Kontroller samlet topp og flere synlige oppgaver med normal radhøyde.
2. Prøv Dag/Uke/Måned, periodepilene, søk og Vis fag. Åpne/rediger en oppgave; prøv flytting og Angre.
3. Prøv Bemanningsplan, Eksport og Prosjektvalg, tilbud og deling. Prosjektets eksisterende tilbudsvalg skal fortsatt finnes.
4. Åpne KS/HMS → Fremdriftsplaner og kontroller samme layout. Prøv mobil og siste oppgave nederst.

Relevant innlogget Preview-prøve og TEST OK gjenstår. Ingen merge, Production-endring, migrasjon eller demo-synk i denne oppfølgingen. Releasebevis oppdateres i PR #254 når CI og fast Preview er verifisert.
