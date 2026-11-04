# Bolig-flyt etter innlogget designgjennomgang

Miljømål BEGGE. Baseline main34daef4c0526b93ddbd84c3bfd97fb0833d97caf, demo fd5aafa17d0a6412bebc60b586e328d682393d8e. Egen branch fase45b-bolig-flow-qa-20261104 fra ren main; hjelpepakken PR308 holdes separat på grunn av permanent Bolig-core-isolasjon. Ingen TEST OK, merge eller produksjonsendring.

## Bevis og scope

Kenneth har bedt om videre selvstendig full kvalitetssikring og fintuning etter kundemøtet. Første innloggede gjennomgang og første pakke er dokumentert i PR308 og docs/qa/LIVE_DESIGN_REVIEW_20261104.md på den branchen. Denne pakken omfatter bare Bolig-komponentenes katalogventing, intern UE-oppgaveliste, arbeidsstedsetiketter, endringsordreveiledning, native dialogfokus, tilhørende brukerhjelp og scenariovern.

| Faktisk førtilstand | Rettelse | Bevaring |
| --- | --- | --- |
| Katalogen viser manglende tilgang mens autorisering venter, deretter kommer søk frem | Egen ventebeskjed; bekreftet avslag, kontrollfeil og endret tilgang skilles | Samme eksisterende lesekontroller og salgsrettede varefelt, ingen nye RPC-er |
| Et gammelt katalogtilgangssvar kontrollerer ikke at managed-access-hendelsen har tilbakekalt oppslaget | Invalidert forespørsel kan ikke gjenåpne søk | Bruker/firma må fortsatt samsvare; samme arbeidsfirma bevarer pågående søk |
| H0101 opptrer to ganger uten bygg/adresse i HMS-velgeren | Nummer, bygg og adresse vises samlet | Uendret bolig-ID, kobling og native callbacks |
| Intern UE-detalj viser161aktiviteter i én lang liste | Søk/status,20første,Vis flere | Hele autoriserte listen er søkbar; hendelser, native datoer og statuser uendret; ekstern partnerportal beholder egen navigasjon/paging |
| Endringsordrekladd ber brukeren laste ned et grunnlag uten nedlastingsknapp | Teksten følger faktisk utkast/publisert/akseptert status | Nedlasting/leverandøroppfølging er fortsatt sperret før aksept |
| Flere underpaneler returnerer til AXWebArea når native dialog fjernes fra DOM | Fokus tilbake til faktisk eksisterende åpner etter unmount | Bevisst navigasjon, nytt panel, suspend/revalidering, eksisterende RAM-kladd og sperrer vinner |

## Utførte kontroller

- Git main/demo-hoder oppfrisket før endring; ren separat worktree.
- PROJECT_GUARDRAILS og aktuelle katalog-/integrasjons-/partner-/commerce-checker lest. Bolig-core-boundary55assertions PASS før full kandidat.
- Eksisterende actual catalog React/JSDOM PASS: priser, fratrekk, varelinjer, lokale kladder, retry/konflikt, lesetilgang, bestillingsutvalg og sene firmasvar. Native lesekontroller erstattes bare av syntetisk transport i testen.
- Full lokal Sandbox critical/build PASS på første implementasjon. En påfølgende presisering bevarer søk ved samme arbeidsfirma; endelig CI dekker denne kandidaten.
- Nye native scenarier er koblet til eksisterende Bolig-katalog-nettleserprøve, uten å endre workflow eller svekke krav. Egen161oppgavefixture med historikk, fembredder/44px16px, søk på siste bolig, statuskombinasjon, paging, oppfrisking, native nested focus/Escape/suspend/kladd og bevisst nytt panel. Utsatt/avvist/feilet/fremmed/tilbakekalt katalogautorisasjon, samme arbeidsfirma og eksakte offentlige varefelt kontrolleres.
- HMS-prøven har to H0101 med forskjellige bygg/adresser og samme opprinnelige callback-ID. Commerce-prøven kontrollerer statusriktig tekst før og etter aksept og egne utkastgrenser.
- Lokal Chromium er tidligere blokkert før oppstart av miljøets socket()/ProcessSingleton-begrensning. Denne runden gjenbruker den kjente grensen og lar ordinær CI utføre native prøver, uten ny omgåelses-/oppstartsløkke.

## Neste kontroll

Grønn full CI og faktisk innlogget Sandbox-preview for denne separate branchen. Kontroller riktig backend før innlogging. Eksisterende testdata og katalogrettigheter beholdes; ingen testutsending eller reell aksept/signering. Deretter fullføres videre helreiser og grunnlaget for full A–Å-film. Grønn bygning og disse avgrensede testene er ingen full appattest.
