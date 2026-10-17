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
- Lagre/Oppdater er synlig. PDF, kopi og avslutning/opplåsing ligger i Flere
  handlinger. Opprinnelige callbacks og bekreftelser er uendret.
- Enkel ordre beholder sin eksisterende filtrering, UE-tilgang og terminologi.
  Ingen våtromsfunksjoner eller kundeportal introduseres.

## Utviklerens verifisering

- Full eksisterende Sandbox critical/build PASS. Gamle checker er urørt.
- project-workspace-browser-check.mjs: 69 Chromium-assertions PASS med faktisk
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
