# Avviksdialog og removeChild-feil – 7. oktober 2026

Miljømål: **BEGGE**. Arbeid fra kontrollert feature-HEAD 794a9e5f4e875f4212ad4123c46d518446e87dce. Main 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen merge eller Production-/demo-oppdatering i denne runden.

## Brukerens problem

Koble til KS/HMS viste appens feilside. Teknisk informasjon i nytt skjermbilde: `Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.` Nytt HMS/prosjektavvik spurte bare om tittel i window.prompt, hoppet til toppen og hadde fritekstansvarlig.

## Påvist årsak og avgrensning

Den faktiske bottomPrevNext-rendereren i main.jsx ga React flere tekstnoder, inkludert betingede tekstbiter for previousTab/nextTab. projectWorkflowUx.js kan erstatte button.textContent. Når React deretter fjerner de betingede nodene ved overgang til KS/HMS, er de allerede fjernet av adapteren. En isolert prøve med faktisk JSX-runtime, React DOM, jsdom 26.1.0, faktisk renderer og faktisk updateDesktopFlowButton gjenskaper `The node to be removed is not a child of this node.` før rettelsen. Samme prøve passerer etter rettelsen. Live kobling før rettelsen åpnet i denne skyøkten; brukerens eksakte fane-/timingforløp ble ikke gjenskapt der.

Rettelse: to knappetiketter rendres som én tekstverdi. Menyrekkefølge, mål, goToTab og adapteren endres ikke. critical-project-navigation-check.mjs kontrollerer den faktiske rendererens knapper med prosjektmål og uten mål, inkludert tekst/én host-tekstverdi.

Øvrig scope: deviationViewTools.js, ProjectDeviationCreator.jsx, DeviationDialog.jsx, deviationDialog.css, projectDeviationCreate.mjs, KshmsDeviations.jsx; kun avvikets nødvendige props/save/open-callbacker i main.jsx; eksisterende to critical-checker og KS/HMS-dokumentasjon. Ingen SQL/RLS/Auth/Storage/e-post-endring.

## Ny opprettelse

Nytt HMS/prosjektavvik åpner en stor React-eid dialog med tittel, beskrivelse, type/alvorlighet, ansvarlig, frist og strakstiltak. Utforming følger Tilgang-dialogens ramme: dempet bakgrunn, fast topp og lagrefelt; full skjerm på smale skjermer, 44 px kontroller, tastaturfokus og Escape. Ansvarlige hentes fra eksisterende firmakontrollerte kshms_deviation_state. Bare aktive interne brukere med KS/HMS-tilgang kan velges; intet navnefelt tolkes automatisk som bruker-ID.

Lagre avvik for oppfølging bekrefter prosjektkilden på server før eksisterende KS/HMS create/detail kjøres med stabile kilde-/request-ID-er. Bekreftet lagring åpner konkret avvik for oppfølging. Bare valgt ansvarlig kan lukke. Brukere uten modulgrant får fortsatt prosjektavvik uten KS/HMS-kobling, nå med dialog og fokus på posten. Ulagret prosjekt forklares som lokalt utkast; KS/HMS-kobling krever lagret prosjekt.

Feil beholder dialog/kladd. Kladd er scoped til bruker/firma/prosjekt og har syv dagers gjenopprettingsfrist. Retry bevarer ID-er, eksisterende bilder og andre rader. Allerede koblet kilde skrives ikke over fra en gammel kladd; lukket kilde gjenåpnes ikke av kladdlagring. KS/HMS sin Registrer avvik/Koble-dialog bruker samme ramme. Bekreftet lagring gir fokus til lagret sak.

## Kontrollert kode og Preview

Første dialogcommit: 88e1bfec7655026ecdb08c9b9796d7cb5b97938b. Siste testede funksjonskode: **d73cd78935ab769b36c37ae4721934f586f05d27**. Siste rettelse bruker egen checkbox-layout og lar ansvarlig-ID være autoritativ i KS-saken, uten redundant ID i den gamle prosjektposten. Eksisterende SQL-projeksjon endres ikke. Historisk source_snapshot fra første test er uforanderlig og kan inneholde den daværende ID-en; den styrer ikke nåværende ansvarlig eller lukkebehørighet.

Fast Preview: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe. READY dpl_G5pZJCaMa4pQwNyu1DcakbXt4AiA på eksakt d73-head. PR Core Safety run 37644638589 success. Branch-binding EXPO_BACKEND_TARGET=sandbox verifisert; database ppvircenkjizeiqdxphj. Main fortsatt 155f6c4ac01f126c1db0c65da385cfd9305587d5. Main → d73: ahead 20, behind 0, 91 filer. Denne runden fra 794 berører 13 avgrensede funksjons-/kontroll-/dokumentfiler, pluss eksisterende UI-testlogg i sluttregistreringen, totalt 14 stier.

## Lokale og automatiske kontroller

- Målrettede avvik-, prosjektmeny-, Tilgang- og mobil-shell-checker: PASS. Ingen eksisterende check er svekket.
- Faktisk React DOM/adapter-prøve: eksakt removeChild-unntak før rettelsen, PASS etter rettelsen. jsdom ligger kun i separat prøvemappe; package.json/lock er uendrede.
- Utvidet regresjonskontroll: kilde lagres/bekreftes før kobling, feilet readback, feil mottaker/kilde, sene svar, grantløs legacy, kladdscope, faktiske prosjekt-save-callbacker og bevarte bilder/sjekkliste/signatur/øvrige avvik. Gamle koblede/lukkede kilder overskrives eller gjenåpnes ikke av kladd. Redundant ansvarlig-ID lagres ikke i prosjektkilden.
- Full EXPO_BACKEND_TARGET=sandbox npm run build: PASS etter siste kodeendring, dialog-build-layout.log exit 0. Første dialog-build-final.log passerer også. Vercel READY og Core Safety kontrollert på samme SHA.
- Tidligere 73 SQL-scenarier med rollback er kontrollhistorikk; ingen DB-/mailer-endring krever ny migrasjon eller gjentatt SQL-scenariokjøring i denne dialogrunden.

## Egen faktisk skynettleserprøve

Innlogget Kenneth Demo / Expo Proffsenter, eksisterende firmaadmin-/KS/HMS-grant. Prosjekt DEMO – HOVED – Badrenovering i arbeid, a0000000-0000-4000-8000-000000000001. Vanlige synlige DOM/AX-felt og native date-setValue brukt; ingen browser-state/auth-/RPC-omgåelse. Ingen reell hendelse eller privat personalsak registrert.

| Del av flyten | Resultat og bevis |
|---|---|
| Stor dialog og faktisk ansvarlig | PASS. + Nytt HMS/prosjektavvik åpner fullskjema; første input får fokus. Fire aktive KS-brukere i dropdown. Første test velger Demo medarbeider 1 og frist 2026-10-08. Ingen fritekst gjettes som ID. |
| Kladd etter lukking/reload | PASS. Behold kladd og lukk → Hent avvikskladd → faktisk reload → samme tittel/beskrivelse/bruker/frist/strakstiltak. Ingen native prompt. |
| Lagre → prosjektkilde → KS-sak | PASS. Lagre avvik for oppfølging åpner konkret bekreftet sak direkte. SQL bekrefter prosjekt/kilde/request-ID, valgte ansvarlig-ID og felt. Én kilde og én sak per opprettelse. |
| Melder er ikke valgt ansvarlig | PASS innen denne økten. Melder får ingen ansvarligoppgave eller lukkeknapp for den andres sak. Admin kan omfordele; det er ikke en separat medarbeiderinnlogging. |
| Omfordeling og egen lukking | PASS. Lagre endringer flytter ansvarlig til Kenneth Demo; egen oppgave/lukkekontroller vises. Lukking deaktivert før egenkontroll-avkrysning. Årsak/tiltak/kontroll → avkrysning → Kontroller og lukk avvik gir bekreftet lukking, egen aktør/tid/historikk og varsel bort. |
| Prosjektvisning/omlasting | PASS. Koblet prosjektpost viser Lukket, Kenneth Demo, frist og Åpne i KS/HMS, uten legacy-lukk/fjern-bypass. Faktisk reload beholder innlogging og lagret lukking. |
| Eksisterende brukeravvik → koblingsdialog | PASS for åpning/lesing på d73. Test-prosjektavvik mad549mztrmuy7nmwb åpner Registrer avvik med tittel/beskrivelse/frist 2026-10-08; ansvarlig er Velg medarbeider. Lukket uten endring/lagring. Ikke koblet eller lukket av utvikleren. |
| Ny opprettelse på siste d73 | PASS. Nytt syntetisk avvik med egen ansvarlig åpner riktig sak, lukkes dokumentert og vises Lukket etter reload. SQL bekrefter faktisk ansvarlig-ID i KS og ingen responsible_id i prosjektkilden. |
| Bevaring og ingen utsending | PASS innen testgrensen. Alle tre opprinnelige prosjektavviksrader identiske før/etter: mad549mztrmuy7nmwb, demo-dev-open-01, demo-dev-closed-01. Worker enabled=false; tre nye utboksrader pending, attempts=0, sent_at=null. Ingen e-post sendt. |

### Eksakte lagrede kontrollspor

| Test | KS-sak | Prosjektkilde | Lagret lukking |
|---|---|---|---|
| UI-TEST 2026-10-07 – stor avviksdialog, opprettet på 88 og omfordelt til egen bruker | 68a26ff6-d9c2-4e1e-a766-e3769b2060fa | nvlgxwqf6lmuy97b4n | closed revision 3, 2026-10-07T15:29:30.020749+00:00 / 17:29:30 Europe/Oslo |
| UI-TEST 2026-10-07 – bekreftet dialog, ny opprettelse på d73 | 6dc89fcd-bb48-44a0-9430-31dbeb75bcaa | x7oiji8yi5pmuy9wk64 | closed revision 2, 2026-10-07T15:40:21.99489+00:00 / 17:40:21 Europe/Oslo |

Aktør for begge lukkinger: d0000000-0000-4000-8000-000000000001, lik aktuell responsible_id. Første historikk: create til Demo medarbeider 1 → save med Kenneth Demo som ansvarlig → close som Kenneth Demo. Andre: create → close som Kenneth Demo. Syntetiske saker beholdes lukket som kontrollspor.

### Skjermbevis fra siste d73-kode

| Bilde | Varig filreferanse |
|---|---|
| kshms-ny-avviksdialog-1791387585936.jpg – stor dialog, felt, faktisk bruker og lagreknapp | libfile_a3e59a101f048191b17642b44cc838db |
| kshms-dialog-lukket-prosjekt-1791387726113.jpg – Lukket tilbake i prosjektet etter faktisk reload, kildekobling beholdt | libfile_25adef42c84481918e0afd92846e7a72 |

## Konkret testgrense og neste steg

Desktopprøven er utført av utvikleren i skynettleseren. Mobilbredde kan ikke settes med denne øktens dokumenterte API; ett vanlig zoomforsøk endret ikke 1363 px-viewporten. Mobil-CSS er bygget, men ingen faktisk mobil/full-app-mobil-PASS. To separate innloggede brukere etter Trond → Eli-eksemplet gjenstår; omfordeling i én adminøkt erstatter ikke Eli sin økt. Dev-logs returnerer retained_data_restricted etter tidligere sikker innlogging og er ikke omgått. DOM/AX/skjerm/reload/data bekrefter de graderte resultatene. Brukerens eksakte opprinnelige timing er ikke gjenskapt i live UI; samme unntak er gjenskapt med faktisk React-renderer/adapter isolert.

Full ukoblet legacy-lukking/gjenåpning, toppfanens teller for egne sjekkpunkter og reelt e-postmottak etter sikkert avsenderoppsett gjenstår. Ingen e-postarbeider er aktivert. Ny A2-TEST OK/merge/Production-godkjenning er ikke gitt.

Bevar seks hovedkapitler, 73 egne rutineforslag, firmaets publiserte utgaver og tidligere egne bekreftelser. Roadmap B–E ligger i PLAN/CONTINUITY: eksisterende prosjektsjekklister finnes; versjonerte firmamal-/gjennomføringsverktøy, SJA og 5×5 risiko er neste B-arbeid. HR/kompetanse/medarbeidersamtaler er ikke bygget og hører til D med separat tilgang. Chatavbrudd kan ikke garanteres borte; Git-checkpoint, testloggen og CONTINUITY gjør at arbeidet kan gjenopptas uten å bygge funksjonen på nytt.


## Historikk: samtidig gjenopptakelse før de konkrete bevisene var lagret

Følgende notat ble lagt inn i parallell dokumentoppdatering 65f3aa51. Da var case-ID-er og endelig readback ikke tilgjengelige i testloggen. De er nå lagret og verifisert i tabellene ovenfor. Avtalen om korte brukerprøver beholdes.


Funksjonskode d73cd78935ab769b36c37ae4721934f586f05d27 er uavhengig gjenfunnet. Vercel dpl_G5pZJCaMa4pQwNyu1DcakbXt4AiA er READY, fast branch-alias peker dit, og PR Core Safety 37644638589 er completed/success. PR #216 er fortsatt draft. Main er uendret. Dette er dokumentarbeid, ikke en ny full build eller skjermprøve.

Siste assistentstatus som brukeren limte inn fra den avbrutte økten rapporterer bestått desktopopprettelse med tittelfokus, beholdt kladd ved omlasting, annen valgt ansvarlig, automatisk KS/HMS-kobling og konkret åpnet sak. Melder fikk ikke den andres ansvarligoppgave og kunne ikke lukke på den andres vegne. Overtakelse/egen lagret lukking, bortfalt varsel, Lukket i prosjektet og hendelseshistorikk ble deretter rapportert. Eksakt ny case-ID/skjermbevis er ikke lagret i denne rapporten; siste endelige omlastingsreadback ble avbrutt. Disse resultatene er videreført som tidligere rapportert, uten å konstruere ny PASS-evidens. Full-app-mobil er fortsatt utestående.

Brukerens nyeste instrukser: bruker tester Preview; assistent gjør små, målrettede kontroller. Ikke gjenta hele skynettleserrunden. Første prøve gjelder bare ny avviksdialog, ansvarlig/frist og direkte åpning av lagret sak. USER_TEST.md har tre korte trinn. Hele roadmapen og øvrige ufullførte kontroller er bevart i CONTINUITY.md.

## Neste brukerinnspill: lukking og toppvarselets plass

Brukeren har skrevet årsak, men fikk den samlede meldingen om årsak/tiltak/kontroll. Eksisterende kontroll krever 5 tegn i årsak og 10 tegn i hver av utførte tiltak og egen kontroll. Meldingen fortalte ikke hvilket felt som manglet eller var for kort.

Avgrenset rettelse fra head 67efa376: konkrete feltmeldinger/minimumslengder og fokus til første manglende felt, med beholdt kladd. Ansvarligvarselet er en kompakt rad, mens veiledning/oppgaveliste åpnes under Vis oppgaver; mobil har kortere synlige etiketter og samme tilgjengelige knappnavn. Ansvarlig, lukkerettighet, egen kontroll og serverbekreftet lagring følger samme kontrakt.

Målrettet avvikscheck og håndbokcheck PASS, Sandbox Vite-build PASS. Ingen ny lang skjermrunde er kjørt. Bruker prøver nå den eksisterende åpne saken og toppvarselet etter oppdatering på samme Preview. Se aktuell kort liste i USER_TEST.md.
