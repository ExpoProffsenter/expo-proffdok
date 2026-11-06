# Låst overtagelse – visning og originalsignaturer

Miljømål BEGGE. Egen branch fase45b-locked-handover-ux-20261104 fra main34daef4c0526b93ddbd84c3bfd97fb0833d97caf. Demo fd5aafa17d0a6412bebc60b586e328d682393d8e. Ingen TEST OK eller produksjonssetting.

## Bevist førtilstand

Ved forrige faktiske Sandbox-gjennomgang viste DEMO–RESERVE låst prosjekt og disabled Fullfør overtagelse, men dato, bekreftelse, kommentar, navn, signaturtegning/tømming og Lagre overtagelse så redigerbare ut. Ingen opplysning, signatur eller lås ble forsøkt endret. saveProject leser allerede serverraden og avviser låst prosjekt før skriving. Dette er en visningsrettelse, ingen bevist omgåelse av backendlås.

## Avgrensning

src/modules/overtagelse/overtagelseTools.js sin visningsfunksjon og to tilhørende presentasjonskoblinger i main.jsx (statusoversikt og eksisterende readOnly-prop på kunde-/prosjektfeltene) får funksjonell endring. Eksisterende isProjectLocked styrer disabled på feltene og Lagre. Et låst signaturfelt viser lagret originalbilde med beskrivende alternativtekst, eller «Ingen tegnet signatur er lagret.». Det finnes ingen tegneflate/tømmeknapp i låst visning. Opprinnelig SignaturePad og callbacks brukes helt uendret når prosjektet er ulåst. Garantivilkår/PDF og tilsiktet dokumentasjonsutsending beholdes; ingen testutsending utføres.

createOvertagelseCompletionTools, main sin øvrige funksjonalitet, lagring, fersk serverlås, garanti-/signaturkrav, dato-/bekreftelsessemantikk, PDF, priser, SQL, RLS, kundeaksept, roller og e-post er urørt. Ingen firma- eller brukertilgang utvides.

## Kontroller

- Relevant guardrail/arbeidsflyt og eksisterende closeout-/hotfix-/prosjektbrowserprøver lest.
- Syntaks, diff-whitespace, critical-production-closeout-check og critical-production-hotfix-preservation-check PASS.
- Eksisterende native prosjektunderflyt-prøve får tilleggsassertions uten å svekke tidligere krav. Bruker faktiske komponentfunksjoner fra main og faktisk renderOvertagelsePanel med kun syntetisk data/transport. Låst tom/syntetisk lagret signatur, originalbilde/alternativtekst, fem skjermbredder, ikke tap av kladd ved låst/ulåst visning, faktiske gamle clear/draw-handlers og ingen lagrings-/ferdigstillings-/utsendingskommando kontrolleres.
- Lokal Chromium var tidligere blokkert før oppstart av miljøets socket-/ProcessSingleton-grense. Ingen ny omgåelses-/oppstartsløkke; ordinær CI utfører native scenarier.
- Full lokal Sandbox-build og endelig CI loggføres etter resultat.

## Preview-prøve før TEST OK

Kontroller først at branch-preview bruker Sandbox. I ferdigstilt demoprosjekt: Prosjektmeny → Overtagelse. Lagrede opplysninger skal leses, felter/Lagre/Fullfør være sperret, signaturbilder synlige uten Tøm signatur. Garantivilkår PDF skal være tilgjengelig. Ingen ekte signering, sending eller opplåsing er nødvendig. Ulåst registrering/tegning/tømming er dekket syntetisk uten juridisk handling.

Produksjon/main og demo er uendret. Separate øvrige pakker PR308/309 har grønne fulle kontrollkjøringer; deres innhold er ikke tatt inn i denne isolerte endringen. Samlet app/full Bolig A–Å er fortsatt ikke ferdigattestert.

Lokal full Sandbox npm build/critical-kjede PASS. Ingen native nettleser- eller innlogget sluttstatus utledes fra build.


## Første faktiske preview-kontroll

Vercel dpl_2k7JhZZW3Lp7fnCnfUHBuUDR2ZrL READY påf4fc2804. Offentlig loader main-CNuxT3fT.js: Sandbox-identitet til stede, Production-identitet fraværende. Sikker ny innlogging bekreftet som eksisterende demokonto/Expo Proffsenter. DEMO–RESERVE → Prosjektmeny → Overtagelse viste dato15.09.2026, merknad og registrerte navn bevart, alle redigeringsfelter/lagring/fullføring disabled og ingen Tøm signatur/tegneflate. Garantivilkårslenke og tilsiktet Send dokumentasjon-knapp finnes fortsatt; ingen sending utført.

Denne historiske posten har navn, men ingen signaturbilder. Tom-bilde-teksten presiseres derfor til «Ingen tegnet signatur er lagret.» slik at den ikke avviser eksisterende navnebasert historikk. Innledningen beskriver lesing i låst tilstand; ulåst instruksjon beholdes ordrett. To native tilleggskrav kontrollerer dette. Ingen dato, signatur, navn, lås eller serverpost er endret.

CI905 påf4fc2804: build, scope og øvrige ferdige pakker består. App-browser passerer de opprinnelige modulprøvene og nye låst/empty/imagebytes-assertions, men stanser på den nye prøvens eksakte getByLabel etter at syntetisk notat settes. Lokal React/JSDOM med faktisk Textarea fra main gjenskaper årsaken: label.textContent inkluderer tekstområdets React-oppdaterte defaulttekst. Native AX-navn er fortsatt korrekt. Prøven bruker derfor eksakt textbox-rolle og tilgjengelig navn for dette feltet; verdi-/disabled-/kladdkrav beholdes. Ingen appendring for denne velgerfeilen.


## Bekreftet statusfunn etter reload

Påd2e2e5c2 er innlogging/prosjekt bevart ved vanlig reload. Arkivdata og disabled-felter er riktige, men visningen ber fortsatt om å lagre registreringen når dirtyBaseline-kvitteringen mangler. Kilde viser at persistedProjectHasOvertagelse leser en RAM-baseline; den er ikke et nytt serverbevis etter reload. Ingen tilstand, baseline eller registreringskrav endres. Scope utvides bare med den tilhørende main-statuslinjen: i låst tilstand undertrykkes utkastets skriveinstruksjon begge steder; confirmed/persisted og alle ulåste instruksjoner beholdes. Låst lagreknapp får stabil disabled «Lagre overtagelse». Native test henter det faktiske main-uttrykket/hjelperne og kontrollerer låst absent-baseline og uendret ulåst registreringsveiledning.

Den utvidede faktiske native prøveverten bygger lokalt med PROJECT_036_BUILD_ONLY (ingen nettleser startet); ordinær CI setter ikke dette og kjører alle eksisterende og nye scenarier. Full Sandbox-build etter statuslinjen PASS.

I native preview ble registrert-status riktig igjen etter at Status og mangler ble åpnet og visningen rendret på nytt. Det støtter avgrensningen til midlertidig baseline-/visningsstatus; ingen manglende lagring eller tapt historikk er påvist. Native prøven dekker både fraværende og bekreftet baseline, og kontrollerer at faktisk registrert-status fortsatt vises mens lagring forblir sperret.


## Tilsvarende feltkobling på prosjektoversikten

Lesing av faktisk arkivprosjekt og main viser at ProjectInformationFields får bare isProjectSupportReadOnly, mens komponentens eksisterende readOnly allerede sperrer navn, adresse, kontakt, notat og kunderegisterhandlinger. Main kobler nå inn isProjectLocked i samme prop. Dette er én ekstra presentasjonslinje; feltkomponenten, CRM og lagringslogikk endres ikke. Den native prøven rendrer nå den faktiske main-invokasjonen, ikke en manuelt riktig readOnly-prop. Den kontrollerer alle låste felt, skjult kunderegister, og uendret ulåst adresse/redigering/register. IsProjectLocked og support-flagg bindes eksplisitt i prøveverten for de faktiske uttrykkene. Øvrige arkivfaner er ikke automatisk attestert av denne avgrensningen.

Seneste lokale Sandbox-build og faktisk prøvevert-build består også etter at kunde-/prosjektfeltenes main-kobling tas med. Native endelig CI og oppdatert preview må fortsatt bekreftes.

CI906 (41881670963) påd2e2e5c2: alle ni pakker og sluttkontroll PASS. Den tidligere tekstområdevelgerfeilen er dermed rettet med alle opprinnelige og nye signatur-/kladdkrav beholdt. Dette er grunnbevis for overtagelsesdelen; senere main-status-/feltkobling krever sin nye CI.


Toppknappen Oppdater/Lagre i ProjectHeaderActions mottar allerede locked, men brukte den ikke på lagringsknappen. Samme avgrensede pakke kobler denne eksisterende propen til disabled, med native låst/ulåst kontroll. Kopi, PDF, menyfokus, bevisst opplåsing og lagringscallback er uendret. Dette er siste avstemte scope: overtagelsesvisning, tilhørende status, kunde-/prosjektfeltenes main-kobling og toppknappens låsevisning. Ingen generell ombygging eller endring av øvrige arkivfaner.

CI908 påd00db772 passerer låst/ulåst signatur, baseline/status og de første faktiske main-feltkoblingene, men ny Kunde-velger matcher både aria-label på Kunde-gruppen og Kunde-inputen. Native apptest brukte allerede entydig textbox-rolle. Testen bruker nå samme eksakte rolle/navn for tekstfeltene, og date-feltets opprinnelige label. Alle verdier og disabled-/ulåst-/registerkrav beholdes. Ingen appendring som følge av denne velgerfeilen.
