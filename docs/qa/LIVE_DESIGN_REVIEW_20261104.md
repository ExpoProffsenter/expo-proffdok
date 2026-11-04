# Innlogget designgjennomgang 4. november 2026

Miljømål BEGGE. Baseline main/Production 34daef4c0526b93ddbd84c3bfd97fb0833d97caf, Vercel dpl_3D5fzV9TVkidd7x7Eowg3V6hWjQ2 READY. PR295 er merget 2. november; PR294/298/305 inngår. Demo fd5aafa1 ifølge siste releasekvittering, ikke nyverifisert i denne runden. Ny arbeidsbranch fase45b-ux-live-review-20261104 / PR308. Ingen ny TEST OK eller produksjonsendring.

## Oppdrag og avgrensning

Kenneth ønsker helhetlig QA etter kundemøtet 3. november: hele appen og underfunksjoner, Hjelp øverst, filmer under relevante temaer og full A–Å-film for Boligprosjekter. Alle tidligere grønne delbevis beholdes. Denne loggen er en løpende kontroll, ingen totalattest.

Første kodepakke berører bare main.jsx sin eksplisitte Hjelp-integrasjon i eksisterende interne toppfelt, HeaderHelp, hjelpetemaenes presentasjon/søk, videoknapper og tilhørende tester/dokumentasjon. Den nye knappen åpner et native høyrepanel uten navigasjon eller lagring. Oppgavene bak panelet beholdes montert. Nytt firma/bruker lukker hjelp; tekst-/filmtilgang følger eksisterende kontekst. Bolig får egen hjelpeinngang med eksisterende 18-stegsguide og detaljhjelp. Fem opprinnelige filmer og avspilleren beholdes. Ingen endring i auth, kundeaksept, beregninger, autosave/recovery, backend, database, e-post, demo-overlay eller produksjonsdata.

## Faktisk innlogget Production-kontroll

Ny skynettøkt, vellykket sikker innlogging, Ringside Rørleggerbedrift. Lesing/disclosures/søk, ingen skjemalagring, sending, signering eller tilgangstildeling. Arbeidsfirmabytte til Expo er en separat bevisst brukerprofilhandling, ikke datamigrering.

| Område | Faktisk kontroll | Grense / neste kontroll |
| --- | --- | --- |
| Innlogging | E-post/passord, godkjent konto, riktig firma/logo og hovedmeny | Separate ansatt-/leserroller og fysisk Safari mangler |
| Startside | Arbeidsområder, sjekklisteinnganger og eksisterende tilbudsoppfølging | Alle oppgavetyper, mobil og rollevarianter mangler |
| Boligprosjekter | Firmaoversikt med 0 aktive, åpne/lukke prosjektbygger, A–Å 18-stegsguide og retur | Fylt prosjekt, hele PL-/UE-/beboerreisen, lagring og full film mangler |
| Hjelp | Hovedmeny → Hjelp, sent lastede roller/temaer, teksttema og retur | Videoavspilling i levende miljø og nye topperstatning kontrolleres separat |
| Prosjektliste | Egen/felles liste, åpne eksisterende prosjekt | Dupliserte egne/felles rader bør vurderes; ikke slett data |
| Prosjekt | Oversikt, prosjektbeskrivelse, Prosjektmeny, Sjekklister, Rapport/tilbake | Øvrige faner og konsekvensfulle helreiser mangler |
| Sjekklister i prosjekt | Native høyrepanel, 7 uferdige kontroller, filtre/status og retur | Full utfylling/signering i isolert miljø mangler; lukket panel etterlater tynt arbeidsinnhold |
| Rapport | Native panel og lagret rapportinnhold, synlig PDF-knapp, retur til samme prosjektbeskrivelse | Ny full PDF-eksport ikke utført i denne runden |
| Forespørsel/tilbud | Lastet 42 saker, type/statusfiltre, Ny forespørsel/avbryt, Nytt tilbud/typevalg/avbryt | Begge editorer, befaringsnotat, kundevisning, aksept og kontrakt mangler |
| Prissøk | Faktisk søk Dansani gir katalogtreff, prisnivåer og varedata | Ingen vare lagt til eller plukkliste lagret |
| Varebestilling | Tom kladd, vareinngang, mottaker/levering, kontrollknapp sperret uten varer | Leverandørfiler, mottakerlagring, sending kun isolert |
| HR | Lastet medarbeiderregister, Alle HR-funksjoner, meny og retur | Private samtaler åpnes ikke som UI-demo i Production; native isolerte prøver kreves |
| KS/HMS | Daglig arbeid, Rutiner og håndbok, Avvik og RUH | 87 rutiner lastet; underredigerere, dokumentuttrekk og komplette flyter mangler |
| Min side | I dag, Mine planer, tomme prosjekt-/andre planer, støttesaker | Timeføring er av i dette firmaet og skjules; andre faner/innhold mangler |
| Firmaadmin | Lastet brukeroversikt, Inviter en ansatt/native panel, uendret skjema/lukk | Tilgangsendringer og utsending ikke prøvd |
| Systemadmin, firmaprofil, support | Ikke ferdig kontrollert | Må tas med, ikke utled full dekning fra felles CSS |

## Påviste UX-forhold

1. Hjelp ligger bare under Alle områder på PC. Ny pakke gir synlig toppknapp og beholder arbeidsflaten.
2. Egen Vis videoer-oversikt legger til en mellomside og tar mye plass. Ny pakke legger Se video direkte under temaet med felles søk og uendret avspiller.
3. Global Hjelp mangler et Boligprosjekter-tema selv om en kort boligfilm finnes. Ny pakke kobler de eksisterende guidene/filmen til et tilgangsstyrt tema.
4. Introduksjonen i Hjelp er lang og blander oppgaver med forklaring av systemet. Den forkortes; faktiske fagveiledninger beholdes.
5. Prosjektets sjekklistefane blir nesten tom når panelet lukkes. Dette krever en egen gjennomgang av retur/oversikt før en eventuell kjernerettelse; ingen prosjektlogikk endres i hjelpepakken.
6. A–Å i Boligprosjekter er tekst og eksempelbilder. Finn bolig-filmen er avgrenset og skal ikke fremstilles som komplett A–Å. Ny full film gjenstår etter verifisert arbeidsflyt.
7. KS/HMS-håndboken gjentar Håndboken er klar og neste-handling øverst/nederst. Vurder samlet informasjonsmengde og rekkefølge i den videre helreisen.

## Testbegrensninger

Lokal full npm build med critical-kjeden PASS. Lokal native Chromium-prøve startet ikke: miljøet nektet socket()/ProcessSingleton før testen. Ingen produktfeil eller bestått nettlesertest utledes fra dette. Samme test kjøres i ordinær CI; ingen testkrav svekkes. Eksisterende video-/retur-/tilgangs-/feil-/mobilkrav tilpasses den uttrykkelig bestilte direkte temaplasseringen, og toppknappens monterings-/Escape-/fokus-/firmabyttekrav legges til.

En automatisk browserkontroll avviste et leseklikk med feilaktig domenetolkning. Produksjonsdomenet ble kontrollert mot Vercels verified prosjekt-domene og repoets README/arkitektur før videre vanlig lesing. Ingen omgåelse eller alternativ nettleser ble brukt.

## Neste steg

1. Grønn full CI, fast Preview og innlogget prøve av den nye hjelpepakken; ingen merge uten ny TEST OK.
2. Fullføre fylt Boligprosjekt fra oppsett til overtakelse, roller/portaler og sluttpakke i isolert miljø. Bruke den verifiserte rekkefølgen som manus for kapitteldelt A–Å-film uten lyd, med den godkjente videomalen og redigerbare kilder.
3. Fortsette alle 145 registrerte reiser og senere sjekklistefunksjoner med faktiske underfunksjoner. Registrere felt/retur/kladd/feil og eksport, uten å kalle hovedsidebesøk en fullført helreise.
4. Samle naturlig sammenhengende UX-rettelser og dokumentere eksakt QA/Preview/produksjonsstatus her og i PR.

## Kandidat og første CI

9cb46a16 publisert som Sandbox Preview dpl_3HsGvN34uQbk1VEitoaNhBGy6qNu READY, eksakt commit og fast alias expo-proffdok-git-fase45b-ux-live-review-20261104-ringside.vercel.app. Anonym loaderkontroll: Sandbox-ref til stede, Production-ref fraværende. Vellykket sikker innlogging som eksisterende demokonto. Hjelp-knapp, høyrepanel og direkte filmknapper faktisk sett; nytt Bolig-tema finnes. Avspilling/retur og øvrige tester er under arbeid.

Første branch ux-live-review-20261104 traff repoets historiske Production-standard for ordinære Preview. Oppdaget ved anonym assetkontroll før innlogging/testing; ingen datahandling. PR307 er lukket til fordel for identisk kandidat i PR308 med eksisterende fase45b-Sandbox-regel. Ingen bindingskode eller Vercel-konfigurasjon endret.

CI890: scope/build/company-db/bolig-browser/hr-react/app-browser/hr-db/bolig-db består. projects-support stopper fordi en kildeuttrekkende headertest manglet de nye hjelpereferansene (isReadOnly først). Testvertens import/scope kompletteres; alle opprinnelige header-/handlings-/kladdkrav beholdes. Selve HelpCenter testes med native komponent i den dedikerte hjelpeprøven, ikke gjennom headervertens tomme hjelpeinnhold. Ingen appendring for denne fixturfeilen.

Innlogget Sandbox: Finn bolig-film faktisk lastet (75s,1920×1080,readyState4), kapittel0:35 ga currentTime35 og ordinær Spill av ga35.2352/pausedfalse. Lukk video returnerte til samme Hjelp og opprinnelig filmknapp; Bolig-tema → A–Å → retur → tema → retur → Hjelp → retur → samme Startside er kontrollert. Ingen serverlagring eller sending. Global Bolig-guide viste opprinnelig misvisende Tilbake til prosjektet; valgfri returetikett gir Tilbake til hjelpetemaet her, mens originaltekst beholdes i prosjektet. Native nested cancel/close isoleres, og samme reise får scenariovern. Tomme Viktig/Anbefalt bruk under nytt Bolig-tema får relevante korte råd.
