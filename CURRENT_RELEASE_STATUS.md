# Gjenopptatt kontroll – 6. november

PR311: CI983 på e650ff74 feilet etter innskriving i periodemerknaden: samme eksakte feltnavn ble ikke funnet ved breddekontroll. Feltet får nå fast tilgjengelig navn; alle tidligere tester beholdes. Full lokal Sandbox-build/critical, timeline102 og launcher11 PASS. Lokal native Chromium stopper før test med socketbegrensning; ny CI/Preview-attest gjenstår. Se [konkret feil og kontroll](docs/qa/PLAN_PERIOD_NOTE_20261106.md). Ingen TEST OK, produksjonsendring, migrasjon eller utsending.

PR308 har13filmer og nyere dokumentasjonshode d3759ce5; CI984 pågår ved avlesning. Main34daef4c/demoabc38f7e er bevart. Full helapp-/videoarbeid er fortsatt ikke ferdig.

---

# Kontrollert checkpoint – 5. november kveld

Miljømål BEGGE, bare Preview/Sandbox. PR311 appkode `4c5c0632` er uendret. Ny innlogget positiv prøve har bekreftet oppretting/redigering/lagring/kladd og fersk serverlesing av egen eksempelplan. Egen områdetelling har automatisk hylle, 3+2=5 og 0, pause/videreføring, historikk, faktisk Cordel/CSV og avslutning med skrivevern etter ny serverhenting. Ingen produksjon, migrering, import eller utsending. Full QA, filhash, film-/kildelenker og avgrensninger: [planoppsett og områdekontroll](docs/qa/PLAN_SETUP_AND_AREA_VIDEO_20261105.md).

To nye lydløse filmer er levert separat med redigerbare kilder: planoppsett 2:04 og områdetelling 2:30. Begge er fullt dekodet og alle 21 scener kontrollert. Neste konkrete steg er integrasjon i PR308s eksisterende Hjelp, med bevart ellevefilmsgrunnlag og egen eksakt kandidatkontroll. Lang planmerknad i énlinjefelt er et nytt dokumentert UX-punkt. Hele appens restliste står videre åpen.

PR308s eksisterende planvisningsfilm er kontrollert innlogget; dokumentasjonshead `6c23091f`, full CI978 SUCCESS og Vercel SUCCESS. Main/Production er ferskt kontrollert `34daef4c` READY; demo `abc38f7e` urørt. Denne PR311-oppdateringen endrer bare QA-/statusprosa; app-/test-/database-/mediekode er identisk før dokumentasjonen. Siste dokumentasjonshead og automatisk kontroll føres i PR311 uten å late som ny appkode er testet.

---

## Tidligere grunnlag og historikk

# Nyeste PR311-kandidat – planbyggerens fokusretur, 5. november

Etter fullgrønn61eb31e8/CI975 får planbyggerens hovedvindu riktig standard fokusmål ved lukking: schedule-/staffing-launcher etter valgt visning. Eksplisitt Min side-retur/null, skjult eier og stateKey-sperre beholdes.11nye faktiske React-krav og full lokal Sandbox-build/critical PASS; negativ prøve på gammel kode feiler på faktisk retur. Native prøve utvidet med21krav, uten svekket originaldekning. Siste eksakte CI/READY/innlogget etterkontroll føres i PR311. Ingen TEST OK/produksjon. Grunnlag: docs/changes/kshms-plan-launcher-focus-20261105.json.

# Nyeste PR311-kandidat – rutineeditor 5. november

Ny avgrenset rettelse etter fullgrønn55e084ab/CI973: synlig rutineoverskrift under faktisk toppfelt og fokus tilbake til samme åpneknapp ved Lukk redigering. Kildesammenligning får samme sikre retur til editorens sammenligningsknapp; delvis lokalt valgte felt beholdes ved gjenåpning. Lokalt sikret kladd bevares; ingen lagrings-/godkjennings-/backendendring. Lokal Sandbox-build/critical og source-update-React PASS; lokal native Chromium sperret før test. Ny eksakt CI/READY/innlogget etterkontroll føres i PR311. Ingen TEST OK eller produksjonsendring. Grunnlag: docs/changes/kshms-routine-editor-return-20261105.json.

# Gjeldende Preview-kandidater – 5. november 2026

Ettermiddagens andre avgrensede funn: TimeManagement beholdt eksportavkrysningen etter refresh som tømte kontrollgrunnlaget. Reprodusert i faktisk React og rettet med samme eksisterende avkrysning; fane/periode beholdes.122lokale React-kontroller og128ordinære lokale PostgreSQL-kontroller PASS. Native12kravsutvidelse har egen ny kandidat-CI/READY i PR311. Ingen faktisk eksport/innlevering eller produksjon berørt. Se docs/changes/time-export-confirmation-refresh-20261105.json.

Miljømål BEGGE; arbeid bare arbeidsbranch/Preview/Sandbox. Ingen ny TEST OK, main/demo-merge eller Production-installasjon. Main/Production er kontrollert til34daef4c0526b93ddbd84c3bfd97fb0833d97caf.

Ny ettermiddagspakke fra PR311/215a2d15: tidlig Escape under prosjektlesing får utsatt fokusretur uten transportendring. Ny input/skjult side/scopebytte/avmontering/avslag stopper sen fokus.119faktiske lokale React-kontroller og full lokal Sandbox build/critical PASS; gammel app feiler den nye fokusprøven. Native browserprøve er utvidet additivt; lokal Chromium er blokkert av socket()/ProcessSingleton, ikke attestert. Eksakt ny CI/READY føres i PR311. Skybrowser viser innlogging; ingen ny innlogget etterkontroll eller film. Dette erstatter den tidligere åpne tidlig-Escape-avgrensningen først når ny kandidat-CI er bekreftet.

- PR311 siste testede appkode6dbfe1bfc94c02fbfae485c5f36f7adc6bf551ba/treed9e0506f24630014d51715cafc942e18cc5f3ef8: full CI967/run41981429307 SUCCESS(9pakker+gate), READY dpl_EgipCSE2zZEazRi5RWnTzW53Lq1J og Sandbox-bundle main-DVx9KBd1.js uten Production. Områdetelling/pause/overtakelse, HRs tre steg/10000tegn per svar og kommentar/2000per tiltak, full paste/preflight/serverreadback/atomisk avvisning/PT409 og KS/HMS-gjennomføringers fokusretur har egne QA-bevis. Faktisk seks siders samlet KS/HMS-PDF er kontrollert.
- Personlige fokusrettelser er ferdig kandidatkontrollert på6dbfe1bf:321personal/prosjektkontroller,158timekontroller/40native views og63time-opt-in-kontroller PASS. Faktisk innlogget retur fra begge egne plankilder, Avbryt/kryss/Escape etter ferdig prosjektlesing og dagens-/tidtaking-forberedelsens innganger PASS. Lokal7,5timer-kladd avbrutt, ingen registreringer lagret. Helt tidlig Escape under fortsatt deaktivert prosjektlesing gir ingen fokusretur; dette er en presis åpen avgrensning. Firmaets opt-in og øvrig lagring/beregning/transport er uendret. Denne siste kvitteringen endrer bare QA/releaseprosa; eksakt dokumentasjonshead/CI/READY avstemmes i PR311.
- PR308 69181c70146b2691ac37acf761b2ec8732f074b4/treeee90bc4c: full CI965/run41978392901 SUCCESS(9pakker+gate), READY dpl_DkMEGiJF1Yi7vHPNwBUNce3hJgkW/Sandbox. Ni filmer, inkludert106s HR-v2 og ny122s samlet PDF fra KS/HMS.427native avspillerkontroller PASS, ny film ved320/390/768/1363/1920/kortskjerm/fullskjerm. Faktisk innlogget avspilling/kapitler/VTT/tekst/retur/fokus er kontrollert. Alle tidligere filmer og HR-v1 bevares. HR-filmen krever PR311s trestegsflyt og utvidede tekstkontrakt ved senere autorisert release.
- Sandbox har allerede canonical stocktake20261105014939 og HR20261105044245. Ikke installer dem igjen. Opprinnelige tellelinjer og DEMO-samtalens utgave4/hash er bevart. Rutine-e-post er fortsatt deaktivert; Production-migreringer er ikke autorisert.
- PR309 Bolig1b59d937 og PR310 prosjektvisning1a3f615e er separate og ferskt kontrollert uendret.

Varig grunnlag: [helappkontroll og restliste](docs/qa/WHOLE_APP_REVIEW_20261104.md), [HR](docs/qa/NIGHT_QA_HR_START_20261105.md), [områdetelling](docs/qa/STOCKTAKE_AREAS_20261105.md), [admin/lager/organisasjon](docs/qa/ADMIN_STOCK_ORG_QA_20261105.md), [support](docs/qa/SUPPORT_USERS_20261105.md). Filmens eget grunnlag ligger i PR308s docs/qa/KSHMS_PDF_VIDEO_20261105.md; siste eksakte kandidatattester er ført i PR-ene. Tidligere godkjenninger/bevis bevares i Git-historikken og PR295/305 og er ikke ny TEST OK.

Personlig timeflate er nå lest og lokal7,5timer-kladd er avbrutt med uken fortsatt0timer/0kr/0km. Innlevering/godkjenning/eksport er ikke manuelt attestert. Neste: videre gjenstående plan-/rutine-/ZIP-/prosjekt-/rolle-/portalreiser. Full HR/Bolig A–Å og fysisk Safari er ikke attestert.198s varetellingsfilm passer ikke områdeflyten og er arkivert, ikke publisert som gjeldende. Grønn CI er ikke full manuell appdekning. Katalogavviket current_user_can_manage_internal_store_catalog og positive eksterne portaløkter står åpne; ingen tilgang eller katalogfunksjon er installert som omvei.
