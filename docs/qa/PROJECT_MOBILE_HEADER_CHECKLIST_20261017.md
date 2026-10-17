# Mobil prosjektbredde og neste uferdige sjekkliste – 17.10.2026

Miljømål: BEGGE. Ren baseline main `8afb2246a5126665e7c89af8a0da3c2f81614e9c` / merget og godkjent PR #266.

## Brukerbestilling og scope

Kenneth bekreftet at Sjekklister skal beholdes i fast meny nederst. Feilen er toppområdet fram til selve innholdet i valgt fane: høyrekanten klippes, og teksten Flere handlinger går utenfor knappen. I tillegg skal klikk på Sjekklister åpne første uferdige liste.

Produksjonsendringer er avgrenset til prosjektlokal CSS, sjekklistens eksisterende workspace og prioritetsmodell, og åtte linjer integrasjon i main.jsx. Hjelp, README, architecture og permanente tester følger endringen. Ingen annen modul, database/RLS, mail/worker, lagringskommando, rapport, rettigheter eller gjenopprettingsmotor endres.

## Beviste feil og løsning

- Global mobilregel gir alle section-elementer width:100%!important. Prosjektfeltet er utenfor main og har egne marger på 12 px. Bredden pluss marger klipper høyrekanten. Global overflow-x:hidden gjorde at tidligere scrollWidth-test kunne være grønn selv om høyre marg var borte. Prosjektfeltets egen mobilbredde blir derfor calc(100% - 24px), uten endring av global CSS eller skjuling som ny løsning. Ny faktisk Chromium-test feilet før rettelsen på «entire project context keeps both side margins 390».
- Apphodet har to mobilkolonner: 92 px logo og fleksibel tittel. Ny handlings-wrapper falt i logokolonnen. Nå spenner bare prosjektets handlingsrad over begge kolonnene, med to like brede felt, min-width:0 og brytbar knappetekst. Alle eksisterende callbacks og den lille nedtrekksmenyen beholdes.
- Eksisterende workspace-fixture manglet Logg ut og plasserte Representerer inne i hodet på mobil. Ny test kompilerer faktisk siste head/Brand-renderer fra main og bruker ekte runtime-/workprofile-CSS; mobil-host ligger etter head som i appen. Den gamle 138-punkts testen får samme korrekte mobile vertsposisjon. Ingen gamle assertions fjernes eller svekkes.

## Direkte sjekklistestart

- Eksisterende goToTab beholder alle navigasjons- og kladdvakter. Bare etter godkjent navigasjon opprettes en engangsforespørsel med bruker, firma og prosjekt. Klikk på gjeldende Sjekklister-fane støttes også.
- Bare den ordinære sjekklistesiden mottar forespørselen. Prosjektering, UE-visning og ren mount/fokus starter ingen kontroll.
- Samme project_checklist_state og begin/dialog/editor brukes. Fersk state velger påbegynt lokal/serverkladd først, ellers første liste som ikke har en fullført kontroll. Tomme lister hoppes over.
- En åpen editor beholdes. Eksakt lenke til sjekkpunkt/avvik tar eksisterende begin-lås først og vinner. Fullførte kontroller forblir immutable og tilgjengelige. Når alle er fullført vises dette i oversikten.
- Ny pointer-/tastaturhandling eller blur avbryter sen automatisk åpning. Unmount/firma-/prosjektbytte avviser gammel respons. Read-only/support åpner ikke redigering. Feil i henting blir synlig og gjentas ikke automatisk som åpning ved fokus.
- Åpning skriver ingen kontroll til server. Vanlig lokal sikring fra begin beholdes. Lagre og Sjekkliste fullført bruker opprinnelige kommandoer og readback.

## Verifisering

- Ny mobilheader/Chrome/Workspace Chromium: 72 assertions PASS. Faktisk main-header, ekte globale stiler, 390/320/375/430/700 px; begge sidemarger, komplett knappetekst, lik handlingsbredde, dropdownplassering/fokus og alle gamle headercallbacks. Faktisk fast Sjekklister-knapp → faktisk goToTab → faktisk Workspace → fullskjermdialog, ferdig kontroll hoppes over, lokal kladd beholdes ved fokus og Bilder → Sjekklister. RPC-transporten er syntetisk og avviser enhver server-write.
- Eksisterende prosjekt-workspace Chromium: alle 138 assertions PASS, inkludert desktop/nettbrett/mobil, garanti, like nestehandlinger, dialoger, avbryt, lagring, read-only og enkel ordre.
- Sjekkliste resume/entry React: 36 assertions PASS (alle 12 opprinnelige beholdt), faktisk request/goToTab og Workspace. Avbrutt navigasjon, samme fane, lokal/serverkladd, første urørte liste, alle ferdige, tom liste, readonly, feil prosjekt, sen henting/ny handling/blur/unmount, feil henting og presist sjekkpunkt.
- Eksisterende faktiske sjekkliste-/prosjekteringsforløp PASS: lagring/gjenåpning/fullføring, tapt svar/retry, to kolleger, tidligere kladd, avvik, historikk og read-only.
- Faktisk prosjektlagring/fortsett: 98 assertions PASS. Deltaker-workspace/egen lagring/vakter: 21 assertions PASS.
- Full critical/Sandbox-build og scope-/release-docs-guard kontrolleres før Preview. Eksakt SHA, CI og deployment føres i PR.

React-review følger Vercel React Best Practices: ingen ny avhengighet, eksisterende state-RPC, én fersk lesing for snarveien, tidlige readonly-/identitetsvakter, siste callback/template i ref og lyttere bare mens åpning venter med cleanup. Supabase-integrasjonen bruker eksisterende RPC uendret; ingen schema-/SDK-/nøkkelendring.

## Preview-prøve og publisering

Samme faste Preview-alias brukes. Ingen ny innlogget ekstern nettleserprøve attesteres fra kontrollnettleseren; forrige sikre innlogging stoppet videre automatisk tilgang. Chromium-prøvene over er faktiske komponenter med syntetisk transport. Kenneth prøver fysisk mobil:

1. Åpne prosjekt og velg Sjekklister nederst. Påbegynt liste åpnes først, ellers første uferdige.
2. Lukk dialogen. Hele prosjektfeltet over Sjekklister og vedlegg skal ha synlig marg både til venstre og høyre. Oppdater prosjekt og Flere handlinger skal passe i to knapper på samme rad.
3. Åpne/lukk Flere handlinger. Menyen skal bli liggende under knappen.
4. Skriv en testkommentar i en autorisert testsjekkliste, lukk, velg Bilder og deretter Sjekklister. Samme kladd skal være der. Lagre med vanlig Lagre-knapp hvis den skal beholdes på server.

Ny TEST OK kreves av AGENTS.md før merge/Production. Etter godkjenning: Production-verifisering, kontrollert main → demo med bevart overlay og preflight.


## QA-oppfølging etter godkjent PR #267

Kenneth ga TEST OK og publiseringsgodkjenning 17.10.2026 kl. 14:14 norsk tid, men fikk ikke prøvd Preview på fysisk mobil. Main `e2cf10317f12f57e2dd6969ef32cdba1fb68c44d` / Production `dpl_J9oqmJ6MrzptjCCPMJLVN9Eun3du` er READY, identisk godkjent app-tre, HTTP 200 med riktig Production-binding.

Demo-kontrollen viste en tidsavhengighet i den eldre Chromium-fixturen: setViewportSize kan returnere før React har flyttet den syntetiske firmavelgeren fra desktop-hodet til mobilens søskenvert. En umiddelbar høydemåling brukte da fortsatt desktop-plassering. Instrumentering som ventet på DOM-oppdateringen besto alle 138 opprinnelige assertions. Den nye 72-punkts faktiske mobilheader-/sjekklistetesten besto også.

Avgrenset QA-rettelse: vent eksplisitt på vertsposisjonen som gjelder for aktuell skjermbredde, med eksisterende Playwright-timeout. Ingen sleep, terskelendring, fjernet assertion eller appkodeendring. Denne oppfølgingen berører bare testfil og dette QA-notatet. Endelig CI/main/demo og preflight føres i PR.
