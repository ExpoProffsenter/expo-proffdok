# Prosjektarbeidsflate – 17.10.2026

Miljømål: BEGGE. Ny brukerbestilt UX-runde fra ren main
462cc660c83399cf65f8c723443cda0261ded106, etter publisert PR #265.
Fast branch-Preview: fix-company-admin-scope-20261015.
Ny TEST OK kreves før merge; Production og demo er ikke endret av Preview.

## Avtalt scope

Kenneth ba om KS/HMS-layout i prosjektflaten, mindre dobbel meny og fullskjerm-
dialoger der de hjelper. Dette gjelder også generelle/enkle prosjekter.
Endringen berører main.jsx bare i prosjektets presentasjon/integrasjon:
headerhandlinger, prosjektmeny og status/mangler. ProjectWorkspaceChrome,
projectWorkspacePresentation og lokal CSS er nye. Legacy header-adapteren
viker for React-flaten, og status-adapteren lar React-dialogen eie synlighet.
Hjelp, README og arkitektur følger den faktiske arbeidsflyten.

Ingen endring i lagringsmotor, goToTab, recovery, tilgang, backend, database,
Sales, support/e-post eller timeføring. Ingen nye ansvarlige/frister/varsler
innføres. Eksisterende varsling og godkjenninger beholdes.

## Ny brukerflyt

- Felles toppfelt med prosjekt/ordrenavn, kunde og adresse. Arbeidsstatus vises
  separat fra antall avvik og uleste meldinger.
- Desktop: Oppstart, Gjennomføring, Overlevering. Bare valgt fases underfaner
  vises. Sidemenyen dupliserer ikke prosjektfanene. Startside/Hjelp/Support
  bruker fortsatt eksisterende callbacks og kildenavigasjon.
- Mobil/nettbrett: Prosjektmeny (Ordremeny for enkel ordre) åpner samme faner
  i eksisterende dialogkomponent. Mobil bruker hele skjermen.
- Status og mangler samler begge eksisterende statusseksjoner i en dialog.
  Sjekklisteprosenten beregnes i React også for enkle ordrer. Avvik, foreslått
  status, overtagelsens signerings-/lagringskrav og direkte handlinger beholdes.
- Lagre/Oppdater er synlig. PDF, nytt prosjekt, kopi og avslutning/opplåsing ligger i Flere
  handlinger. Opprinnelige callbacks og bekreftelser er uendret.
- Enkel ordre beholder sin eksisterende filtrering, UE-tilgang og terminologi.
  Ingen våtromsfunksjoner eller kundeportal introduseres.

## Utviklerens verifisering

- Full eksisterende Sandbox critical/build PASS. Gamle checker er urørt.
- project-workspace-browser-check.mjs: 71 Chromium-assertions PASS med faktisk
  komponent, native nav-renderer, status-renderer fra main og produksjons-CSS.
  1363/768/390/320 px uten horisontal side-scroll, innhold før 800 px,
  alle dialoger, mobil fullskjerm, kladd, avbrutt/vellykket navigasjon,
  fokusbytte, dynamiske ulest-/avvikstall, statusberegning, PDF/kopi/lagre/lås,
  opplåsing, direkte/nytt prosjekt, enkel ordre og skrivebeskyttet support.
- project-menu-return-react-check.mjs PASS: ordre → Startside/ordinært prosjekt,
  KS/HMS native klikk, bortfalt KS/HMS-tilgang og mobilkildeetiketter.
- project-checklist-workspace-react-check.mjs PASS: popup, lagring/gjenåpning,
  historikk, tapt svar, kollegakonflikt, kladd og avviksoppfølging.
- project-progress-react-check.mjs: 39 assertions PASS: import, utkast, konflikt,
  fokus, dag/uke/måned, PDF-logo, mobil, låsing og enkel ordre.
- React best practices gjennomgått: eksisterende dialog/fokusfelle gjenbrukes,
  ingen ny datalasting/global listener/recovery-motor, stabil nøkkel per prosjekt.
- git diff --check PASS. Diff mot main avgrenset til avtalt prosjekt-UX og QA/docs.

Lokal testmiljøtilpasning: eldre fremdriftstest krevde TMPDIR under repoet for
React-resolusjon og eksisterende KSHMS_JSPDF_PATH. Ingen testkode ble endret.
Første forsøk uten disse miljøverdiene stoppet i bundling; korrekt oppsett PASS.

## Brukerprøve på fast Preview

1. Åpne et vanlig prosjekt. Velg Gjennomføring → Bilder og tilbake til Oppstart
   → Oversikt. Bare valgt fases faner vises. Forrige/Neste skal fortsatt virke.
2. Velg Status og mangler. Kontroller status, sjekklister og Åpne-handlingene.
   Lukk dialogen; du skal være tilbake i samme prosjekt/fane.
3. På mobil: åpne Prosjektmeny, velg en fane og kontroller fullskjermdialogen.
   Prøv utklipp/fokusbytte mens dialogen er åpen.
4. Åpne et generelt/enkelt prosjekt. Kontroller Ordremeny, relevante verktøy,
   UE-tilgang og Sluttdokumentasjon. Ingen tunge våtromsfaner skal dukke opp.
5. Kontroller Flere handlinger og vanlig Lagre/Oppdater. Ikke avslutt eller lag
   kopi av et ekte prosjekt bare for layouttesten.

Faktisk innlogget Preview og CI-/deploybevis føres i PR før TEST OK.

Innlogget Preview avdekket at gammel scroll-to-content kunne rulle prosjektets
nye meny ut av bildet. Den eksisterende scroll-hjelperen bruker nå topposisjon
når den nye prosjektflaten er i DOM. Dette gjelder bevisste åpninger/fanebytter;
focus-/visibility-/draft-recovery er urørt. Den faktiske scroll-hjelperen er med
i nettlesertesten, og eksisterende page-scroll-memory-check beholdes uendret.

## Siste kompakte justering etter Kenneths bilde kl. 02:42

Kenneth ba kl. 02:45 om å stramme inn toppfeltet, fjerne doble prosjektdata og
gjøre Garanti lettere å finne. Samme PR/Preview oppdateres, fortsatt uten TEST OK.
Scope: projectWorkspace.css, ProjectWorkspaceChrome, projectWorkspacePresentation,
intern renderProjectOverviewPanel, Hjelp og QA/docs. Ingen ny main.jsx-endring.
Den ordinære fasen heter nå Overlevering og garanti. Enkel ordre beholder
Overlevering uten garanti. Toppfeltet har navn, kunde og full adresse. Intern
oversikt beholder telefon, e-post, ansvarlig og akseptert sum inkl. mva.
ProjectInformationReadOnly for kunde/UE og rapportinnhold er uendret.

86 Chromium-assertions PASS, inkludert responsive kontaktfelt ved 1363/768/390/320 px.
Apphodet testes <=80 px og prosjektkortet <310 px ved 1363 px i fixturen.
Alle tidligere 71 assertions beholdes, i tillegg til reell Garanti-navigasjon,
én prosjekttittel, full adresse og akseptert beløp med mva. Siste QA/CI/deploy og
faktiske mål i innlogget Preview føres i PR-statusen. Full critical/build PASS
og eksisterende prosjektmeny-retur PASS etter selve kodejusteringen.

Brukerprøve: Åpne vanlig prosjekt → Overlevering og garanti → Garanti.
Kontroller at arbeidsinnholdet begynner høyere, kontakt-/økonomifeltene fortsatt
vises og at enkle ordrer har tilsvarende kompakt layout med sitt funksjonsutvalg.

## Veiledet oppstart og feltbruk – bestilt kl. 02:54

Scope utvidet av Kenneth: tydelig rekkefølge ved prosjektopprettelse og rask
tilgang til sjekklister på mobil. Implementert i samme PR/faste Preview, fortsatt
utestet av bruker. main.jsx får ny lagringsretur og avgrenset fortsett-handler.
Eksisterende saveProject-writes, goToTab og de ordinære lagringsbekreftelsene
beholdes. Kun forStep-handlingen bruker ekstra readback-/snapshotkontroll.

- Oppstart har 5 nummererte steg; enkel ordre har 3. Avtalegrunnlag, Prosjektering
  og Fremdrift er Ved behov; Salgsgrunnlag er separat historikk uten stegnummer.
- Lagre og fortsett viser neste mål. Nytt prosjekt bruker bekreftet server-ID.
  Nyere kladd, feil, endret kontekst, dobbeltklikk eller ny pointer-/tastatur-
  handling under venting skal ikke rydde kladd eller tvinge navigasjon.
  Nyopprettet ID beholdes ved avbrudd i samme arbeidsflate, så retry ikke lager
  en ny rad. Ulagret fremdriftsplan behandles i eksisterende planbygger.
- Fast mobilfelt har Oversikt, Sjekklister, Bilder, Avvik og Meny. Det er synlig
  etter rulling og har plass til safe-area. Chat, PDF og øvrig innhold finnes
  i samme prosjektmeny. Nye prosjekter må lagres før feltverktøyene aktiveres.
- Påbegynte sjekklister står først med Fortsett utfylling. Originale Åpne-
  knapper, filtre, begin(), fullskjermdialog, lagring/konflikt, historikk, fullført
  kontroll og lesetilgang beholdes. En tom lokal init blir ikke et påbegynt arbeid.

Verifikasjon: project-step-save-check 98 assertions PASS med faktisk saveProject
og continueProjectStep fra main; project-workspace-browser-check 95 assertions
PASS ved 1363/768/390/320 px; project-checklist-resume-react-check 12 assertions
PASS. Original project-checklist-workspace-react-check PASS uendret. Full
critical/build PASS. Apphodegrensen <=80 px beholdes; prosjektkortgrensen i den
nye testen er endret fra <310 til <440 px fordi brukerbestilt veiledning nå
ligger der. Testen krever samtidig at steg og neste mål er synlige. Ingen eldre
critical-check er endret eller svekket. Den ekstra CI-jobben kjører alle nye
kontroller samt gamle sjekkliste- og prosjektmeny-returer.

Brukerprøve i fast Preview:
1. Nytt prosjekt → fyll inn kunde/prosjekt → Lagre og fortsett. Samme prosjekt
   skal åpne Prosjektbeskrivelse. Valgfrie steg og neste mål skal være tydelige.
2. Enkel ordre skal vise kortere løp, uten våtromssteg eller garanti.
3. Mobil: rull ned, trykk Sjekklister i fastmenyen. Samme prosjekt skal åpnes.
   Velg Fortsett utfylling på en påbegynt liste og prøv utklipp/appbytte.
4. Bruk Meny for Chat/Rapport og andre funksjoner. Originale funksjoner og
   lagringskrav skal være tilgjengelige. Ny TEST OK kreves før merge.

Presisering: Avtalegrunnlag merkes For garanti når garanti er aktivert/utstedt,
og vises da ikke som valgfritt. Kontrakts- og garantigatene er uendret.
Nye tester bekrefter dette. Ekstra lagringsvernet hindrer også at et sent svar
rydder eller erstatter nyere feltinnhold; testene bruker faktisk saveProject.


## Prosjektkart og samordnet nestehandling – 17.10 kl. 11:50

Kenneth godkjente en miks av oversiktskartet og den nye kompakte prosjektflaten.
Miljømål: BEGGE, samme PR #266 og faste Preview. Denne delen erstatter tidligere
beskrivelse av ett valgt fasepanel og nummererte underfaner. Alle tre faser er
synlige på PC i like brede bokser med lik topp-/bunnkant. Mobil beholder fast
feltmeny og fullskjermdialog for alle prosjektfanene.

Oppstart viser Deltakere og tilganger rett etter Oversikt. Eksisterende
Prosjektinvolverte-root får en plass foran portalene i eksisterende tilgangsfane;
oversiktens opprinnelige plass beholdes. Samme editor og kladd gjenbrukes ved
flytting, med eksisterende egen lagring. Registrert kontakt gir ikke portaltilgang.
Kunde-, UE- og kontrollørhandlinger bruker opprinnelige callbacks, koder, RLS og
e-postmotor. Enkle ordrer beholder UE/funksjonsutvalg uten kundedeling.
Ingen ny deltakereditor injiseres i skrivebeskyttet tilgangsfane eller før lagring.

Begge handlingsrader bruker projectWorkspaceFlow og ProjectFlowActions.
Fremdrift peker til Sjekklister begge steder. Den gamle bottomPrevNext beholdes
som skjult kompatibilitetskilde for urørte legacy-checker og er ikke brukerens
navigasjon i React-skallet. Generisk prosjektlagring brukes bare for prosjektets
felter; kontaktlisten, fremdriftsplanen og sjekklister beholder egen lagring.
Nye data-project-navigation-markører sikrer at gammel deltaker-kladdvakt
fortsatt stopper nye meny-/neste-/mobilhandlinger ved ulagrede kontakter.

Scope: ProjectWorkspaceChrome/presentation/CSS, to integrasjonspunkter i main,
accessViewTools sin presentasjonsplass, deltakeradapterens hostvalg og
kladdvaktmatch, Hjelp, nye UX-tester, QA/docs og tillegg i CI. Ingen endring i
Sales, goToTab, lagringsmotor, database, autorisasjon, e-post eller timeføring.

Testendringens begrunnelse: gammel UX-test forventet skjulte faser og fem/tre
oppstartssteg. Ny avtalt kontrakt krever alle faser, synlige deltakere og samme
nestehandling. Nytester fra denne PR oppdateres. I critical-project-navigation-check
oppdateres kun hjelpetekstkontrakten til tre synlige bokser, deltaker-/portalvalg
og lik nestehandling, med ekstra vern mot at kontakt likestilles med tilgang.
Alle øvrige eksisterende critical-assertions beholdes. Prosjektkortets grense økes fra 440 til 560 px fordi
hele kartet nå er synlig. Apphode <=80 px og innhold før 800 px beholdes.

Brukerprøve: Åpne vanlig prosjekt → Deltakere og tilganger. Prosjektinvolverte
skal stå før portalene. Åpne Fremdrift og kontroller at øvre/nedre handling går
til Sjekklister. Prøv enkel ordre og mobilmeny, og avbryt navigasjon fra en
ulagret kontakt. Faktisk QA/CI/deploybevis føres i PR før ny TEST OK.

Lokal slutt-QA for prosjektkartet: full Sandbox critical/build PASS; 108 Chromium-
assertions ved 1363/768/390/320 px PASS, inkludert like bokser og samme øvre/nedre
handling, originalstatus, dialoger, kopi/PDF/låsing og enkel/direkte/ny/read-only.
98 faktiske save/continue-assertions PASS. Ny deltaker-workspace-test: 21
assertions PASS med faktisk editor og adapter: flytting av samme input/root,
lagring, avbrutt navigasjon fra både kart/footer/mobil, fokusretur, annet
prosjekt og kundeportal/read-only-isolasjon. Original kontrollør-React-QA PASS
(kunde/UE-kopieringscallbacks, kontrollør opprettelse, utløp, tilbakekalling og
e-postgrenser med syntetisk transport); gammel sjekkliste-workspace og
prosjektmeny-retur PASS. Resume-test 12 assertions PASS.
