# Min side og prosjektlisten – avgrenset UX

Miljømål BEGGE. Preview først. Kenneth prioriterer ansatte på mobil og prosjektleder på PC likt, og liker fargede bokser i KS/HMS/HR. Denne leveransen gjenbruker formspråket uten å endre disse modulenes layout eller funksjoner.

## Oppfølging 19:33: samlet planboks og synlig fokuskontroll

Baseline før denne oppfølgingen: PR #256 fortsatt åpen på 05cfb850f3f620ce3cd805ceffb86ae51939f2a0, main e492816350cc0d7ce38232645599c505e943090e. Fast Preview dpl_J3aq8DLdqWtzXXnQXiWP5aDZiuDp READY, Core Safety #489 SUCCESS. Ingen TEST OK for ny UX. Kenneths vedlagte bilde er faktisk lest: Min side står i Kontrollerer tilgangen din ved klipping.

Ny kontrakt/scope erstatter tidligere beskrivelse om to separate plankort og ingen main-endring: PersonalPage.jsx/personal.css samler de to eksisterende own-plan-kontrollerne i én boks med kildeoverskrifter. KshmsMyProgressPlans.jsx får valgfri grouped-presentasjon, kort oppdateringsknapp per kilde og kildespesifikk tomtekst. Separate mine-RPC-er, egne oppgaver, aktive datoer, lesemodus og eksport beholdes. Ingen nye oppgaver, varslingsregler, e-post, datamodell eller migrasjon.

personalAccess.js beholder kun allerede verifiserte scope-/modulmetadata ved fokus og synlig visibilitychange, mens samme ferske RPC fortsatt kjøres. useHrAccess får et valgfritt preserveVisibleMetadata, false som standard. main.jsx har nøyaktig én begrunnet linje: useHrAccess(authUser?.id, tab === "innlogging"). Bare Min side velger dette. Forsøk på generell HR-endring ble fanget av den eksisterende navigation-testens krav om at HR-medarbeiderdialogen skjules mens tilgang sjekkes; generell HR-oppførsel er derfor bevart, og testen består uendret. Private HR-payloadkontrollere, RLS, serverautorisasjon og alle skrivefunksjoner er urørt.

Egne planers refresh beholder den åpne read-only popupen under en synlig fokuskontroll. loading/busy sperrer eksport og åpning til listen og eventuell dobbel detaljlesing er bekreftet. Skjult dokument rydder data/record straks. Feil/avslag rydder data/record/valg; epoch og synkron valgt-ID hindrer sent svar i å gjenåpne etter bevisst lukking. Ingen nye payload-cacher eller browserlagring.

Førtest: faktisk usePersonalAccess + useHrAccess + useKshmsAccess og PersonalPage med forsinkede metadata gir 1 Kontrollerer tilgangen din-panel under synlig fokus, forventet 0. Etter: 83 faktiske Chromium-kontroller PASS, inkludert alle tidligere 65; én planboks/to merkede kilder, 320/390/768/1363, synlig blur/focus med tre forsinkede metadata-svar, begge plan-kilders uavbrutte popup-node/Måned-visning, eksport sperret under kontroll, oppdatering etter ferske svar, lukking før sent svar, skjult/avvist retur og ingen live writes. Den faktiske app-hookens Min side-opt-in kontrolleres strukturelt. Ekte Windows-klipp er ikke kjørt av utvikler.

Tidligere KS/Prosjekt-browserchecks endrer bare selektorer for de ønskede nye kildeoverskriftene. Alle oppgave-, eksport-, lagrings-, kladd-, lås-, frist-/datoperiode- og tilgangskontroller beholdes. Prosjekt 39 assertions PASS; personlig profil/kontakt/e-post og HR-varsler 110 PASS; eksisterende modulnavigasjon PASS. KS/HMS 128 og full Sandbox critical/build PASS. Den strukturelle HR-testen følger den eksakte nye main-signaturen og krever eksplisitt false som standard; alle tidligere livssyklus-/avslagstester beholdes. Endelig CI og innlogget ny Preview føres i PR.

Kort ny prøve: Min side → Oversikt. Kontroller én Mine aktive planer-boks med Fra ProffDok-prosjekter og Andre fremdriftsplaner. Prøv Windows-utklipp på oversikten, åpne deretter en egen plan, velg Måned og prøv utklipp igjen. Bildet og planen skal bli stående ved synlig fokus. Prøv også å lukke planen, bytte nettleserfane og komme tilbake; bevisst lukket plan skal forbli lukket. Faktisk dvale kan fortsatt vise kort tilgangskontroll ved retur.

## Baseline og scope

Fersk GitHub-kontroll: main e492816350cc0d7ce38232645599c505e943090e, Production dpl_F6nPqQjmJBgYq3LQuJa7nsTpo5U3 READY. PR #254 er merget. Feature-branch fix-company-admin-scope-20261015 står fortsatt på 450743401024a4e5be9e9e25e9867feb16f8338d, som er ancestor til main. Ny PR bygger på main og viderefører samme branch/Preview med vanlig fast-forward. Ingen historikk slettes, ingen reset/demo → main.

Appscope: PersonalPage.jsx, personal.css, projectListTools.js og ny projectList.css. Min side gjenbruker HomeFollowups med bare HR-kontekst: ingen nye KS/HMS-oppgavekall. Kontroller, frisk autorisering, egne dialoger, kontaktlagring, paginering og fristmetadata beholdes. Fanene ligger før oversikten. Kontrolleren holdes montert, mens wrapperen skjules utenfor Oversikt; ingen ny lagring av valg/payload. Skjult profil og eksisterende kladdkontrakt beholdes. Egne planer får sideordnet presentasjon på PC via lokal CSS; separate datakilder og handlinger er urørt.

Prosjektlisten får egen CSS-rot via eksisterende Section.className; ingen ekstra DOM-wrapper. Fire nøkkeltall deler rad på PC. Tomt samarbeidsfelt komprimeres bare innen denne roten. Status/garanti beholdes i korttoppen; de dupliserte toppetikettene for chat, avvik, produkter og bilder fjernes fordi samme tall/handlinger finnes i tellerraden. Alle bunnsnarveier og callbackargumenter beholdes, inkludert filtrerte avvik, rapport og sletting. Ansvarlig blir synlig også på mobil. Ingen søk-/filtermodell, datalesing eller tilgangskjerne endres.

main.jsx, bootstrap, globale stiler, Sales recovery/hydrering/autolagring, prosjekt-/tilbudsflyt, planbygger/eksport, tilgang, e-post, varslingsregler, SQL og demodata er urørt. Kontakt teller fortsatt som én påminnelse med alle manglende felter i detaljene. Ingen nye frister/oppgaver eller varslingshull introduseres. Eksisterende varslingsmotor og dens dokumenterte begrensninger gjelder fortsatt; ingen ny påstand om mottatt e-post eller full appdekning.

## QA

- Full Sandbox critical/build PASS.
- Faktisk Min side React: profil/e-postkladd, egen kontaktlagring, feil aktør, kontaktkonflikt/revokasjon, personlige modulvalg og sene svar PASS.
- Faktisk modulnavigasjon/recovery for KS/HMS, HR og Min side PASS.
- Ny faktisk Chromium-check: 65 kontroller ved 1363, 768, 390 og 320 px. Kompakt oversikt, sju oppgaver, kontakt, passert frist, faner før varsler, skjult varselområde i Mine timer, beholdt eget åpnevalg ved retur/fersk lesing, bortfalt tilgang, ingen uventet skrive-/sendekall; begge prosjektkort, ansvarlig, alle snarveier/argumenter, avviksfilter, søk, arkiv, nullstill, ulest og oppdatering.
- Tidligere HR- og kontakttester krevde varsler før faner og alltid synlig kontaktpåminnelse. Kontrakten endres bevisst til faner før sammenfoldet oversikt, med samme oppgaver og kontaktpåminnelse inni. Kontakttesten åpner Vis detaljer før alle eksisterende kontakt-, lagrings-, feilsvar- og revokasjonskontroller fortsetter. Alle øvrige direkte sak-/frist-/lagrings-/tilgangstester beholdes; 110 assertions PASS. Ny Chromium-check er lagt til eksisterende Core Safety-jobb.
- Innlogget Skynett på fast Preview: varselområdet er 95 px mot tidligere 126 + 841 px (samme 7 HR-oppgaver + 1 kontakt). Faner før varsler, kontaktpopup åpning/lukking uten lagring, Mine timer uten synlige varsler og sideordnede egne planer er bekreftet. 1363 × 936, ingen sidescroll.
- Skynett avdekket at en ekstra DOM-wrapper forstyrret eksisterende samarbeidsadapter: den forventer at søkepanel/host ligger direkte i Section. Wrapperen er fjernet, og eksisterende Section.className brukes i stedet. Ingen adapter-/tilgangskjerne endres. Ny test monterer faktisk Section og faktisk samarbeidsadapter med syntetisk transport og krever synlig tomtilstand, direkte foreldreskap og nøyaktig én stabil lesing gjennom flere renderframes. Denne kontrollen består etter rettelsen.
- Korrigert innlogget prosjektliste i Skynett: samarbeidsfelt synlig/stabilt og 95 px høyt, søk VVS gir 1/5 treff, Arkiv 2/5, Nullstill 5/5. Bilder åpner korrekt prosjekt-ID og tab=bilder, med Ingen endringer å lagre. Ingen sidelengs sidescroll. Kontaktregresjonen består alle 57 assertions. CI/deploy-status og eksakt endelig head føres i PR. Ingen fysisk mobil-/Windows-prøve påstås.

## Kort brukerprøve

Fast Preview: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app

1. Min side → Oversikt: fanene skal vises før en lukket Varsler og oppfølginger. Kontroller antall og frister. Vis detaljer skal vise alle oppgaver og kontaktpåminnelsen.
2. Velg Mine timer, Personalhåndbok og Profil og e-post. Arbeidsflaten skal komme rett etter fanene. Gå tilbake til Oversikt og åpne en egen plan.
3. Prosjektliste: prøv søk, Aktive/Arkiv, Kun uleste og Nullstill. Åpne et prosjekt via Åpne, Bilder, Sjekklister, Rapport eller Chat. Avvik skal fortsatt åpne riktig filtrerte liste.
4. Prøv på mobil og PC: ingen sidelengs sidescroll, overlapp eller skjulte knapper. Kortene skal beholde farger, tydelige rammer og lesbar tekst.

Ny TEST OK kreves før merge/Production. Permanent demo oppdateres først fra godkjent main med kontrollert preflight.
