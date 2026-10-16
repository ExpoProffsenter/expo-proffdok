# Startsiden – kompakt varseloversikt

Miljømål BEGGE. Fortsetter umerget PR #254 og den faste branch-Previewen. Fersk førkontroll: main a7bd4795e78e0ba1cbdc747960384bbf01338581, PR/head 614c2562366aafd89fe22012f1adb4876f63bae9, Vercel dpl_E5rPyQhvLFguHEcA45AnqLKAMSEo READY med samme commit/alias. Lokal feature feat-project-progress-ux-20261016 bygger videre på nøyaktig samme head. Ingen allerede leverte planfiler endres av dette arbeidet.

## Scope og begrunnelse

Ny src/modules/home/HomeFollowups.jsx/homeFollowups.css samler eksisterende controlleres presentasjon. Fire små render-props i HrFollowupNotice, HrContactReminder, KshmsTasks og KshmsExecutionTasks endrer bare hvor varselmarkup vises og rapporterer telle-/fristmetadata. Standardrendereren gir gammel markup på øvrige flater. HR-overskriften heter HR-oppfølginger bare i samlet Startside. Hver oppgave vises én gang; flere handlinger for samme oppgave er beholdte snarveier.

main.jsx må endres for å unngå dobbel KS-montering: global banner beholdes overalt unntatt nøyaktig samme Startside-gate som den nye oversikten. Eksisterende HR-Startside-montering erstattes, og lazy-import peker på HomeFollowups. Ingen navigasjonsfunksjon, prosjekt-/tilbudshandling, planbygger, bootstrap, varslingsmotor, tilgang, SQL eller e-postkode endres. Home-instansen er nøkklet på bruker, ikke transient HR-kontekst; fokusvalidering skal ikke remontere KS-dialoger som sideeffekt.

## Presentasjonskontrakt

- Starter lukket. Én tastaturbetjent knapp med aria-expanded/aria-controls viser total og kategorier. Plusstegn betyr flere HR-oppgaver kan hentes; det viste antallet er ikke påstått eksakt total ved paginering.
- Passerte arbeidsfrister, dato i dag, avvik innen tre dager og kontroller etter planlagt dato vises separat. Samtaleinnspill får ingen oppdiktet frist. Møtedato brukes som dato, ikke automatisk passert arbeidsfrist. Første HR-dato vises når oversikten ikke allerede har tidskritiske markeringer.
- Kontakt teller én påminnelse, med alle manglende felter og samme direkte skjema. Alle oppgaver/handlinger, metadata, flere-knapper, retry og e-postinnganger beholdes. Ingen markeres som lest/ferdig av å åpne/lukke oversikten.
- Lokalt avgrenset CSS gjør KS/HMS-banner og detaljliste statiske på Startsiden. Åpne detaljer skyver neste innhold ned; ingen sticky/absolutte overlegg eller ny scrollfelle. Andre sider beholder eksisterende KS/HMS-banner og Min side beholder vanlig HR-/kontaktflate.
- Kildenes gjeldende autorisasjon, frisk lesing, firmasikring, fristregler, polling og hendelser beholdes. Ingen nye RPC-er eller utsendinger.

## Utviklerkontroll

Ny faktisk Chromium-test med appens style.css, APP_RUNTIME_STYLES og virkelige varselcontrollere. Kun RPC-transport er syntetisk. Kontrollerer lukket antall/kategorier/prioritet, én kildemontering, tastatur, utviding, paginering, avvik/direkte/all-knapper, utilgjengelig kontroll, kontaktmodal med faktisk lagring/readback, gjennomføringsmodal, fokus etter bevisst lukking, offline/retry, tom oversikt, KS-only/HR-only, tilbakekalt tilgang, annen aktør/firma, sene svar etter unmount, gammel visning og fravær av e-post. Ingen ekte brukerdata eller e-post brukes.

62 kontrollpunkter PASS på siste kode, inkludert begge e-postinnganger og e-postlenke uten åpne oppgaver. Maksbelastning i syntetisk prøve (3 avvik, 2 kontroller, 7 HR-oppgaver, 1 kontaktpåminnelse og flere fristmarkeringer): ca. 95 px lukket desktop, 124 px ved 390 px og 163 px ved 320 px. Visuelt kontrollert ved 320/390/768/1280 px. Åpne KS-detaljer, neste innhold, modaler og faktisk side-scroll inngår. Globale mobile section-paddingregler oppdaget og lokalt nøytralisert. Ingen global CSS endret.

Beholdte tester: 108 HR-varselkontroller, 55 kontaktpåminnelsekontroller, prosjektets KS/HMS-gjennomføringskontroller og faktisk KS/HMS/HR/Min side-navigasjon PASS. Full critical/build, HR-navigation, release-docs og scope-guard PASS på siste kode. Fersk main-sammenligning bekrefter at alle nye filer gjelder presentasjon, Hjelp/dokumentasjon eller QA, mens hele tidligere planleveranse beholdes. CI og Preview kontrolleres på PR #254 etter push; kontrollenes commit og deploy/alias er den autoritative publiseringsstatusen. Tidligere plan-/PDF-/databasekontroller gjentas ikke lokalt uten relevant grunn. CI sin eksisterende suite beholdes og ny Home-test legges til.

React-gjennomgang: komponenter er definert utenfor render; effektavhengigheter er primitive og report-callback er stabil; metadata inneholder ingen kontakt-/saksinnhold; ingen nye nettverkskall eller lagring; kontrollere beholdes montert under sammenfolding; eksisterende portaldialoger/fokus og ferske åpnehandlinger beholdes. Kontekstoppsummeringen styres av aktuelle underkomponenter og fjernes ved unmount.

## Innlogget Preview-prøve

Fast adresse: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app

1. Gå til Startsiden. Varsler og oppfølginger skal være lukket og vise antall/kategorier. Viktige fristmarkeringer skal være synlige.
2. Trykk oversikten / Vis detaljer. Åpne en HR-oppgave, et avvik eller en gjennomføring. Lukk dialogen og kontroller at du kommer tilbake til samme oversikt. Skjul lukker detaljene.
3. Hvis Kontakt vises: velg Fyll ut kontaktopplysninger. Kontroller at skjemaet åpnes. Fullfør/lagre hvis ønskelig; påminnelsen forsvinner først etter bekreftet lagring.
4. Prøv mobil og PC: åpne Vis oppgaver, scroll forbi oversikten og kontroller at detaljer ikke dekker snarveiene under. Prøv en eksisterende snarvei og tilbake til Startsiden.

Brukerens innloggede prøve og relevant TEST OK gjenstår. Ingen merge/Production/demo-synk. Siste planleveranse i PR #254 er også fortsatt umerget uten TEST OK. Sandbox-migrasjonene og kurseksemplene bevares uendret.

## Oppfølging: bannere bare på Startsiden

Kenneth ga TEST OK, men viste at de gamle KS/HMS-bannerne fortsatt fulgte med i alle faner. Han autoriserte produksjonsløpet etter denne rettelsen. Tidligere beskrivelse av global banner-montering og ventende TEST OK over er historikk, erstattet av dette avsnittet.

Scope i main.jsx er nøyaktig to slettede linjer: global KshmsTasks-import og montering i header. HomeFollowups-gaten er uendret. Ingen modul-, navigasjons-, auto-save-, prosjekt-, tilgangs- eller varslingslogikk endres. Varsler kan åpnes på Startsiden ved innlogging og retur; oppgavene forblir tilgjengelige i sine moduler. E-postlenker leses av de samme controllerne i Startside-oversikten.

Eksisterende Home-test er utvidet med faktiske renderuttrykk hentet fra main.jsx, ikke en kopiert route-gate. Menymatrisen bruker reelle globale/prosjektfaner og inkluderer ny mobilprosjektflate og support. Før rettelse feiler faktisk Befaring/Tilbud med 2 bannere mot forventet 0. Etter rettelse: 128 assertions PASS (tidligere 62 beholdes), ved 1280/390 px, null banner/oversikt på andre faner, én sammenfoldet oversikt på Startsiden, begge oppgavetyper ved retur, begge e-posthandlinger gjennom faktisk app-shell-gate og alle tidligere frist-/handling-/dialog-/kontakt-/rolle-/offline-kontroller. Standalone-standardrendereren beholdes og testes fortsatt; dette betyr ikke at den monteres globalt. Ingen gamle sjekker svekkes. Full critical/build og faktisk KS/HMS/HR/Min side-navigasjon (13 faner) PASS. Tidligere plan-/PDF-/databasebevis beholdes uten unødig lokal repetisjon; CI-suite er uendret.

Godkjent produksjonsløp: ny Preview/CI kontrolleres før merge, planmigrasjoner installeres i Production i dokumentert rekkefølge, produksjon verifiseres og main → demo synkroniseres med bevart overlay og kursdata. Ingen seed-data eller ny migrasjon i denne bannerrettelsen.
