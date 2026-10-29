# Design 03.6 – gjenoppta uten ny runde

Totaloppdraget er **ikke fullført**. Dette er et faktisk kode- og QA-checkpoint, ikke ny plan eller brukerens TEST OK. Miljømål BEGGE; bare design-Preview er autorisert for denne pakken. Root er eneste publisher. Production/main/permanent demo får ingen redesign før uttrykkelig godkjenning.

## Siste styring: samlet layout, ikke én-og-én-fiks

Brukeren avviste29.10 de gjentatte erkjennelsene og HR som separat leveranse. Original03.6 skal brukes på tvers av hele appen; ikke oppfinn modulvise varianter eller be om godkjenning for hver skjerm. HR-bildene viste en reell visuell mangel selv om funksjonstestene var grønne. Tidligere formuleringer om tilfredsstillende visuell gjennomgang er ikke en godkjenning.

Ny samlet pakke: `WorkspacePanel` deles av alle arbeidsverktøy og HR-støtte; `workspaceSurface.css` samler mål for ramme/typografi/bredde på tvers av modulene. Den lange HR-fristkolonnen og nederste oppsettstabel er flyttet til samme høyrepanel, med native skjemaer montert og kladder bevart. Felles dialogportalcontext er brukt så eksisterende timeadministrasjon ikke havner bak en native modal. Samlet lokalkjede1633, prosjekt/Personal253, kundepreview936 og HR-registerReact PASS. Kandidat, ny CI/deploy og faktisk visuell kontroll vedlikeholdes i PR295. Endringsgrunnlag: `docs/changes/shared-workspace-layout-036-20261029.json`.

Dette lukker ikke totaloppdraget. Visuell sammenligning av hele appen og de åpne reisene nedenfor gjenstår; ikke tell felleskomponent eller CI som attest på hver underflyt. Ingen redesign-TEST OK/merge. Ikke start en ny HR-only oppgave etter brudd.

## Les først etter brudd

1. Les CURRENT_RELEASE_STATUS.md, denne filen og fersk PR295/head/CI. Arbeidsbranch: `design01-app-ramme-20261028`. Baseline før denne pakken: `50a8dda399198198c8cad3b9b08b0223cae4c7f1`; main-grunnlag `71d157f7bdf5e5ff87fe4bdf6bf4ce86674e8e2b`. Eksakt ny kandidat/deployment/CI vedlikeholdes i [PR295](https://github.com/ExpoProffsenter/expo-proffdok/pull/295), slik at denne kildefilen ikke må peke på sin egen SHA.
2. Behold originalskisse `f67f236784b4de9a92f52c5b74b67335ec94606a`, Sites `appgprj_6ae13253b87c8191ba560175fcd6c3d9`. Den lokale read-only-kilden er `proffdok-original-reference/dist/`: `app.js` personal/personalOther/projectList/ks/offer og `concept.js` conceptHr. Ikke endre referansen for å få appen til å passe.
3. Brukerens uttrykkelig godkjente Startside med **seks arbeidsområder beholdes**. Ikke rull tilbake til conceptHome. Behold innlogging, logoer, tydelig tekst og alle autoriserte native funksjoner.
4. Fortsett første åpne konkrete reise nedenfor. Ikke start ny inventering eller krev at Kenneth forklarer gamle avklaringer. [145 navngitte reiser](proffdok-journey-review-20261029.md) og JSON-filen har trinn, roller, tilstander og bevisnivå; de er ikke en liste over145 beståtte prøver.

## Implementert og lokalt kontrollert i denne pakken

| Flate | Faktisk resultat | Kontroller på samlet kode |
|---|---|---|
| Startside | Seks områder beholdt; knappebaseline deler radhøyde; kompakte native prosjekt-/tilbudsoppfølginger | Home51 Chromium + opprinnelige callbacks i app-UX og prosjektprøven |
| Prosjektliste | Samlet søk/status; Listevalg; faktiske kompakte rader; Åpne og Vis detaljer; fire delteprosjektknapper i2×2 på320/390 | Samlet prosjekt/Personal253 Chromium; lange navn, egne/delte/arkiv, alle tidligere assertions beholdt |
| Min side | I dag/Mine planer; ekte varsler og HR før timekort; fulle planlister i native details, samme planDOM; eksisterende profil/e-post/HR/håndbok/timer/support | Personal1031 Chromium, PersonalReact og critical; fem bredder og600px høyde, lange navn, Enter/Space, kladd og scope |
| HR | Faktisk register og tiltak før hjelp/oppsett/prøve; skissens støtte til venstre/register høyre påPC, register først påmobil; native medarbeiderhøyrepanel | HR113 Chromium; faktisk syntetisk lagre→lukk→nytt oppslag/gjenåpne av samtale, leder, leser, revoke og ny medarbeider; samlet registerReact PASS |
| KS/HMS | Daglig arbeid med faktiske oppgaver/revisjoner; fire PC-faser; Visning og native rollefiltrert høyrepanel; kompakt utvidbar håndbokforklaring | KS197 Chromium, manager/reader/personal×fem bredder, komplett13/8/2målsett; SJA/oppsettkladd, hidden/active-portaler, firma/sene svar/tilgang |
| Felles drawer | Ren WorkspaceToolDrawer med appadapter WorkspaceTools; samme native dialog, fokus/Escape/backdrop, disabled, callbacks og kontekstlukking |122 opprinnelige app-UX; ekstra lokal adapter8/pureleaf37; ny samlekjede nedenfor |

Root kjørte `scripts/app-ux-review-browser-check.mjs` på samlet frosset tre: **122+89+51+1031+113+197 PASS**. Nye permanente prøver er importert fra dette eksisterende scriptet, uten workflow-/avhengighetsendring. Root kjørte også samlet prosjektprøve253, HR-registerReact, HR-conversationsReact105, HR conversation session/actual-jsPDF runtime131 og full `npm run build` med eksplisitt Sandbox/Preview-binding: PASS.

KS-agentens øvrige eksisterende kontroller: module-navigation-resume, SJA-parent, job-links, review/task-reminders, bulk-ack87utgaver/3roller, handbook-jsPDF, document5PDF, SJA3PDF, execution3PDF og RUH/privateStorage/PDF: PASS. Full relevante KS-critical PASS. HR foundation/navigation/templates/sickleave/practice critical PASS. Bevar eksisterende CI-pakker; full ny CI på faktisk publisert kandidat kreves og føres i PR.

En uavhengig kilde-/bildekontroll fant og fikk rettet hele mobilord i HR/KS, prosjektknappstabling, plan-/varselprioritet og Startknappenes baseline. Dette er syntetiske komponentbilder ved320/390/768/1363/1920, sammenlignet med uendret skisse og den godkjente Start-tilpasningen. Ingen innlogget helapp-/Safari-/fysiskkamera-/ekte transportattest gis.

To testintegrasjonsfeil ble rettet uten svakere funksjonsassertions: Personal-prøven bruker nå faktiske åpneplan/Mine planer/I dag-innganger før de samme asserts; KS-fixturen venter på en unik React-commitserial, ikke allerede sann rolleverdi som kunne måle en nettopp frakoblet DOM. Opprinnelig44px/font/DOM/kladd/tilgangskrav beholdes. PDF-JSDOM får kun browser-native structuredClone.

## CI774 fant en faktisk dialogfeil

Første publiserte strukturelle kandidat er68a22e0, trebf390da8. Lokal samlekjede ovenfor var grønn, men faktisk CI774/40957638451 app-browser feilet på Escape etter lagret HR-samtale. Holdt faktisk mock-RPC gjenskapte disabled-render→BODY-fokus→Escape uten lokal dialoglytter. Dette er en produktfeil, ikke en assertion som skal fjernes. Ny avgrenset fellesdialog-fallback og deterministisk regresjonsfixture inngår i neste kandidat. Top-dialog, Tab/ShiftTab, native modal og eksisterende onClose/busy-gater skal bevares. Ny lokal samlekjede122+89+51+1031+132+197PASS, full Sandbox critical/buildPASS og eksisterende checklist-resume36PASS. Ny HR132 beholder alle tidligere113 og legger19 konkrete regresjonsassertions til. Faktisk ny CI/deploy-kvittering vedlikeholdes i PR295. Ikke erklær68a22 samlet grønn.

CI776 bekrefter alle nye arbeidsflatesuiter og compact-reference29, men feiler deretter i prosjektfixturens første langnavnassert: den leser gammel tittel før Reactroot.render har committet ny. Samme-JS-oppgave gjenskaper det. En eksakt observerbar DOM-venting før de uendrede253 assertions er den avgrensede testrettelsen; en uteblitt render skal fortsatt feile. Ingen produktendring eller retry. Fersk samlet CI kreves på neste checkpoint.

## Gjenopptatt etter brudd – CI776

Kandidat89a42103 er publisert i fast design-Preview, Vercel dpl_9g1pLrW9SLxQSiTzUJcYTBtf8w6b READY på eksakt SHA. CI776/40958787254 bekrefter nå hele app-UX-kjeden122+89+51+1031+132+197PASS, inkludert den tidligere Escape-feilen. Alle sju øvrige pakker er grønne. app-browser stopper senere i personal-project-layout linje245: QA-setter kaller asynkron root.render, mens testen leser gammel tittel før React-commit. Testfixturen får en useLayoutEffect-kvittering for faktisk committet prosjektnavn; testen venter på denne før de uendrede fulltekst-/geometri-/callback-assertionene, også ved tilbakestilling. Ingen appkode, workflow eller runtimeavhengighet endres. Lokal samlet Personal/prosjektprøve253PASS etter rettelsen. Ny CI kreves og kvitteres i PR295. Dette lukker ikke åpne helappreiser nedenfor.

Separat Dokumentuttrekk-rettelse er nå konkret draft [PR298](https://github.com/ExpoProffsenter/expo-proffdok/pull/298), ac54c32d9910729ae3311e34eb677fbe9ec921fb fra main71d157. Én produktlinje,13 additive regresjonslinjer og ett grunnlag. Før/etter-faktisk React/Storage/jsPDF og full lokal critical/build består etter fiks; ingen merge/Production er gitt. Feilen står fortsatt i PR295 til separat rettelse er godkjent/integrert.

## Fortsettelse etter CI777 og sikker innlogging

CI777/40959697623 på1eda9f21: alle sju øvrige pakker PASS. app-browser bekrefter prosjektliste253, Sales311+277+229, kundeopsjoner116, passiv salgspreview875, ordre216 og øvrige foregående prøver, men stopper deretter i project-progress-react linje51: gammel test forventer planliste synlig på I dag. Prosjekt-/KS-plantestene bruker nå faktisk Min side visning → Mine planer før de uendrede egne-plan/leser/firmabytte/utløpt-assertionene. KS-testen venter også på ny scopes I dag før Mine planer velges etter firmabytte. Ingen produkt-, transport-, workflow- eller tilgangsendring. Lokalt prosjektplan39, KS-plan128, fokus28, scrollmemory, PDF24 og tidslinje102PASS. Ny full CI kreves; eksakt kandidat/status føres i PR295.

Ny faktisk innlogget skynettprøve på design-Preview1eda9f21 med eksisterende demobruker/Expo Proffsenter: Befaring/Tilbud → Under arbeid → DEMO – Generelt tilbud utkast. Høyre Kundens tilbud viser Lagret tilbudsgrunnlag · kladd og Ikke sendt, sum17050inkl.mva. Visuelt kontrollert side-ved-side på1349px. Rediger kunde → Kort notat fikk en usendt QA-tekst; Verktøy og maler → Escape og Utvid kundevisning → Escape bevarte teksten. Feltet ble tømt til opprinnelig verdi og Avbryt valgt, ingen Lagre endringer eller kunderegistervalg. Rediger tilbud: eksisterende overskrift og selection0–33 bevares gjennom verktøypanel og utvidet kundevisning. Ingen publisering, sending, aksept, eksplisitt tilbudslagring eller tilgangsendring utført. Tilbudsbyggerens eksisterende autosave viste Lagret på server etter hydrering; dette er derfor ikke attest på null bakgrunnsskriving. Ingen pris-/vare-/vilkårsfelt endret i prøven. Den tidligere generelle teksten om at skynett står på innlogging er historisk; økten er nå innlogget og må beholdes.

## Reelt funn i innlogget publisert våtromstilbud

Full CI778/40961229122 på e99a1fa er SUCCESS, alle åtte pakker og sluttkontroll. Deretter fant faktisk skynett på DEMO-03-TILBUD at høyre felt mangler snapshot mens saken har publisert v1. Ny avgrenset SalesCaseStoredPreview leser den etablerte kundeversjonen med RLS/session/scope/eksakt-ID-kontroll. Editor og requests/hydrering/autosave holdes utenfor. Ny service35 + UI26 + opprinnelige875PASS, negativ originalkomponent feiler som forventet, full Sandbox critical/buildPASS. Dokumentert i docs/changes/sales-case-stored-preview-20261029.json og arkitekturfilen. Fersk kandidat/CI og faktisk live skynett etter deploy skal kvitteres i PR295. Ikke erklær den gamle mangelfulle publiserte visningen ferdig fordi kladdprøven besto.

## Kjente åpne funn og neste arbeid

1. **BOLIG-002:16 flerfamiliehus i faktisk Preview.** Bruk separat Bolig-branch/PR294 og fast Bolig-Preview. Verifiser16bygg, adressefokus, fasadehøyde, boligvalg og tilbakevei ved320/390/768/1363. Ikke bland `src/modules/bolig/**` inn i PR295; eksisterende Bolig-grensevakt krever isolert scope. Tidligere boligbevis er baseline, ikke ny attest.
2. **SALES-011: høyre kundepreview i helappen.** I fast design-Preview: åpne befaring/tilbud, begge tilbudstyper, behold usendt editorfelt gjennom åpne/lukk/utvid, kontroller lagret/publisert/akseptert grunnlag og at passiv visning ikke sender/aksepterer. Nye sales-komponentkontroller fra tidligere pakke beholdes; faktisk ny innlogget økt mangler.
3. **COMPANY-007: eksisterende firmaadminstyrt time-aktivering.** TimeSetup har allerede `enabled:false` som standard og «Aktiver timeregistrering i firmaet»; TimeSheet sperrer føring når avslått. Mobil snarvei har separat opt-in. Ikke lag en duplisert bryter. Åpent: synlige PersonalTimeCard/Mine timer-innganger følger i dag HR-gate, ikke lagret enabled. Verifiser off→on→off, roller og tilbakekalt tilgang før eventuell avgrenset UI-rettelse.
4. **PERSONAL-003: Boligoppgaver og presence.** Native BoligMyTasks starter fortsatt sammenfoldet; BoligPresenceCard sier «Utlogget» om prosjektregistrering selv om brukeren er app-innlogget. Dette er uendret og må avklares/rettes i egen Bolig-scope. Ikke CSS-tving hidden/åpning eller simuler klikk som produktrettelse.
5. **HELP-001: konteksthjelp/A–Å.** Prøv nye faktiske HR/KS/Listvalg/Personal-innganger og deres tilbakevei. Hjelpteksten er oppdatert; source-/eksisterende HR Help-prøve er ikke full visuell attest for alle temaer.
6. Fortsett de øvrige navngitte reisene, inkludert admin/portaler og deres underdialoger, med separat funksjons- og designstatus. Auditen klassifiserte37 opprinnelig svake koblinger:13 uten direkte reisestøtte,12statisk delkontrakt,3helper,5UI-deltest,3SQL-deltest,1mocktransport. Ingen helreise ble lukket av filnavn eller grønn CI alene.

**Separat konkret corefeil funnet:** Dokumentuttrekk beholder `locked.current=true` ved company/user-bytte under eksport. Cleanup øker sequence, men scopeeffect nullstiller ikke låsen; gammel finally har feil sequence og frigir den ikke. Ny enabled Hent dokumentlisten gjør da ingenting. Eksakt eksisterende `scripts/kshms-inspection-extract-react-check.mjs` feiler linje64 på både tidligere50a8 og denne designkandidaten, samme runtime/PNG/transport. Produkt- og testkilde er identiske i begge. De faktiske åtte dokumenttypene/fersk tilgang testes frem til denne feilen. Dette er **FAIL**, ikke bestått total PDF-prøve. Ingen Extract-produktendring er lagt i designpakken. Separat avgrenset corearbeid fra ren main er autorisert og logges som egen kandidat/PR før eventuell sammenslåing; gammel asynkron operasjon må ikke kunne låse opp en nyere operasjon.

## Faktisk tilgjengelig miljø og sikre grenser

Fast design-Preview: https://expo-proffdok-git-design01-app-ramme-20261028-ringside.vercel.app/?progressTest=safe

Fast Bolig-Preview: https://expo-proffdok-git-fase45b-bolig-portal-polish-20261025-ringside.vercel.app/

Den tilgjengelige cloud-nettleseren viser innlogging på begge designfanene. Den ene har tidligere mislykket innlogging; ikke gjenbruk/blindt send gamle felter eller hent passord ut. Bruk sikker browserAuth eller brukerens innloggede takeover når faktisk helappkontroll skal fortsette. Ikke opprett brukere, nullstill passord, endre roller eller omgå innlogging for å få testbevis. Fortsett uavhengige kilde-/fixtureoppgaver mens dette er blokkert.

Akseptvarselets canonical-saksbehandlerrettelse er allerede separat publisert i PR296/297, Production acceptance-notifyv8 og Sandboxv6 med samme kildehash. Ikke gjenåpne eller sende prøve-e-post som sideeffekt. Rutine-e-post er fortsatt deaktivert. Ingen reelle bestillinger, signeringer, invitasjoner eller tilgangsendringer inngår i QA.

Reproduserbar lokal runtime i denne økten: Playwright `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`, Chromium `/tmp/proffdok-chromium`, JSDOM `/tmp/proffdok-resume-qa/node_modules/jsdom/lib/api.js`, jsPDF2.5.1 `/tmp/proffdok-036-pdf-runtime/node_modules/jspdf/dist/jspdf.node.min.js`. Dette er lokale QA-stier; CI bruker sine eksisterende låste avhengigheter. Skjermbilder/loggfiler under `/tmp` er midlertidige; permanent scenario/testkode og denne faktiske resultatoppsummeringen ligger i repoet.
