# Låst overtagelse – visning og originalsignaturer

Miljømål BEGGE. Egen branch fase45b-locked-handover-ux-20261104 fra main34daef4c0526b93ddbd84c3bfd97fb0833d97caf. Demo fd5aafa17d0a6412bebc60b586e328d682393d8e. Ingen TEST OK eller produksjonssetting.

## Bevist førtilstand

Ved forrige faktiske Sandbox-gjennomgang viste DEMO–RESERVE låst prosjekt og disabled Fullfør overtagelse, men dato, bekreftelse, kommentar, navn, signaturtegning/tømming og Lagre overtagelse så redigerbare ut. Ingen opplysning, signatur eller lås ble forsøkt endret. saveProject leser allerede serverraden og avviser låst prosjekt før skriving. Dette er en visningsrettelse, ingen bevist omgåelse av backendlås.

## Avgrensning

Kun src/modules/overtagelse/overtagelseTools.js sin visningsfunksjon får funksjonell endring. Eksisterende isProjectLocked styrer disabled på feltene og Lagre. Et låst signaturfelt viser lagret originalbilde med beskrivende alternativtekst, eller «Ingen tegnet signatur er lagret.». Det finnes ingen tegneflate/tømmeknapp i låst visning. Opprinnelig SignaturePad og callbacks brukes helt uendret når prosjektet er ulåst. Garantivilkår/PDF og tilsiktet dokumentasjonsutsending beholdes; ingen testutsending utføres.

createOvertagelseCompletionTools, main.jsx, lagring, fersk serverlås, garanti-/signaturkrav, dato-/bekreftelsessemantikk, PDF, priser, SQL, RLS, kundeaksept, roller og e-post er urørt. Ingen firma- eller brukertilgang utvides.

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
