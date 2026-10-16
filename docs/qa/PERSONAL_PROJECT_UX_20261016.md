# Min side og prosjektlisten – avgrenset UX

Miljømål BEGGE. Preview først. Kenneth prioriterer ansatte på mobil og prosjektleder på PC likt, og liker fargede bokser i KS/HMS/HR. Denne leveransen gjenbruker formspråket uten å endre disse modulenes layout eller funksjoner.

## Baseline og scope

Fersk GitHub-kontroll: main e492816350cc0d7ce38232645599c505e943090e, Production dpl_F6nPqQjmJBgYq3LQuJa7nsTpo5U3 READY. PR #254 er merget. Feature-branch fix-company-admin-scope-20261015 står fortsatt på 450743401024a4e5be9e9e25e9867feb16f8338d, som er ancestor til main. Ny PR bygger på main og viderefører samme branch/Preview med vanlig fast-forward. Ingen historikk slettes, ingen reset/demo → main.

Appscope: PersonalPage.jsx, personal.css, projectListTools.js og ny projectList.css. Min side gjenbruker HomeFollowups med bare HR-kontekst: ingen nye KS/HMS-oppgavekall. Kontroller, frisk autorisering, egne dialoger, kontaktlagring, paginering og fristmetadata beholdes. Fanene ligger før oversikten. Kontrolleren holdes montert, mens wrapperen skjules utenfor Oversikt; ingen ny lagring av valg/payload. Skjult profil og eksisterende kladdkontrakt beholdes. Egne planer får sideordnet presentasjon på PC via lokal CSS; separate datakilder og handlinger er urørt.

Prosjektlisten får egen CSS-rot. Fire nøkkeltall deler rad på PC. Tomt samarbeidsfelt komprimeres bare innen denne roten. Status/garanti beholdes i korttoppen; de dupliserte toppetikettene for chat, avvik, produkter og bilder fjernes fordi samme tall/handlinger finnes i tellerraden. Alle bunnsnarveier og callbackargumenter beholdes, inkludert filtrerte avvik, rapport og sletting. Ansvarlig blir synlig også på mobil. Ingen søk-/filtermodell, datalesing eller tilgangskjerne endres.

main.jsx, bootstrap, globale stiler, Sales recovery/hydrering/autolagring, prosjekt-/tilbudsflyt, planbygger/eksport, tilgang, e-post, varslingsregler, SQL og demodata er urørt. Kontakt teller fortsatt som én påminnelse med alle manglende felter i detaljene. Ingen nye frister/oppgaver eller varslingshull introduseres. Eksisterende varslingsmotor og dens dokumenterte begrensninger gjelder fortsatt; ingen ny påstand om mottatt e-post eller full appdekning.

## QA

- Full Sandbox critical/build PASS.
- Faktisk Min side React: profil/e-postkladd, egen kontaktlagring, feil aktør, kontaktkonflikt/revokasjon, personlige modulvalg og sene svar PASS.
- Faktisk modulnavigasjon/recovery for KS/HMS, HR og Min side PASS.
- Ny faktisk Chromium-check: 62 kontroller ved 1363, 768, 390 og 320 px. Kompakt oversikt, sju oppgaver, kontakt, passert frist, faner før varsler, skjult varselområde i Mine timer, beholdt eget åpnevalg ved retur/fersk lesing, bortfalt tilgang, ingen uventet skrive-/sendekall; begge prosjektkort, ansvarlig, alle snarveier/argumenter, avviksfilter, søk, arkiv, nullstill, ulest og oppdatering.
- Tidligere HR-test krevde varsler før faner. Kontrakten endres bevisst til faner før sammenfoldet oversikt, med samme oppgaver inni. Alle øvrige direkte sak-/frist-/lagrings-/tilgangstester beholdes; 110 assertions PASS. Ny Chromium-check er lagt til eksisterende Core Safety-jobb.
- Innlogget Skynett-kontroll av publisert Preview og endelig CI/deploy-status føres etter publisering. Ingen fysisk mobil-/Windows-prøve påstås.

## Kort brukerprøve

Fast Preview: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app

1. Min side → Oversikt: fanene skal vises før en lukket Varsler og oppfølginger. Kontroller antall og frister. Vis detaljer skal vise alle oppgaver og kontaktpåminnelsen.
2. Velg Mine timer, Personalhåndbok og Profil og e-post. Arbeidsflaten skal komme rett etter fanene. Gå tilbake til Oversikt og åpne en egen plan.
3. Prosjektliste: prøv søk, Aktive/Arkiv, Kun uleste og Nullstill. Åpne et prosjekt via Åpne, Bilder, Sjekklister, Rapport eller Chat. Avvik skal fortsatt åpne riktig filtrerte liste.
4. Prøv på mobil og PC: ingen sidelengs sidescroll, overlapp eller skjulte knapper. Kortene skal beholde farger, tydelige rammer og lesbar tekst.

Ny TEST OK kreves før merge/Production. Permanent demo oppdateres først fra godkjent main med kontrollert preflight.
