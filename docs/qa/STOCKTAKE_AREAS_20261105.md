# Varetelling: hyller, overtakelse og historikk – 5. november 2026

Miljømål BEGGE. Arbeidsbranch fase45b-whole-app-qa-20261104 / PR311. Utgangspunkt 86b56c99; main/Production 34daef4c. Oppdrag: velg hylla én gang, flere tellere på samme telling, overta halvferdig hylle og behold kontrollhistorikk. Ingen TEST OK eller produksjonssetting.

Scope: kun stocktake-komponenter/CSS, eksisterende varetellingsprøver + additive områdeprøver, stocktake-hjelp, ny privat additiv migrasjon og relevant dokumentasjon. Tidligere innhold i PR311 beholdes. Ingen meny, main.jsx, andre moduler, katalog-/prismotor, aktiveringer, demo-overlay eller e-post endres av denne etappen.

## Faktisk lokal kontroll

- Opprinnelig modell-/Cordel-byteprøve PASS; uendret eksportmotor.
- Opprinnelige 51 databaseassertions kjøres også etter ny migrasjon og verifiserer gamle klienter før områdeaktivering. Additiv prøve: 89 assertions PASS med ekte PostgreSQL-migrasjoner i PGlite; ti separate identiteter, hver sin hylle, delantall, null, katalogidentitet, pause/merknad, overtakelse og tilbakeovertakelse, stale-skrivesperre, retting/sletting og før/etter-historikk, eksakt retry, firmatilgang, tilbakekalt aktivering, skrivevern og avslutning. Første råkjøring og ny kjøring med gjeldende PT409-adapter PASS.
- PGlite serialiserer forespørsler: overlappende promises fra ti aktører er et samarbeids-/kontraktsbevis, ikke en belastningsattest av ti samtidige PostgreSQL-sesjoner.
- Ny faktisk React + PGlite-RPC-bro kjører to nettleserbrukere gjennom halvferdig hylle, pause, overtakelse med bekreftelse, avvist gammelt utkast, historikk, fem bredder, Cordel og avslutning. Koblet etter samtlige opprinnelige native stocktake-prøver. Native resultat må bekreftes i CI.
- Lokal Chromium kunne ikke starte: socket()/ProcessSingleton er nektet av kjøremiljøet. Ingen omgåelse eller lokal browser-PASS. Nedlasting av separat browser feilet også; det endrer ikke produktstatus.
- Full lokal Sandbox-build inklusive critical-kjeden PASS. JSX-fixture bundling og RPC-error-code guard PASS. Nyere rettelser må fortsatt bekreftes på endelig kandidat.

## Miljøkontroll før installasjon

Sandbox er ppvircenkjizeiqdxphj (demo-sandbox under dqffxflaoyarbxyiyhop), ikke expo-hr-control. Sandbox preflight bekreftet opprinnelige stocktake_record/get, installert remote20261015105313 og to eksisterende tellinger. Kun skjema/antall/profilkolonner er lest; ingen data reset eller reell utsending. Eksisterende profilers navn finnes ikke som full_name/name; historikk bruker e-post med ID som reserve. Security-advisors før endringen er registrert for sammenligning.

Ny fil er opprettet med Supabase CLI migration new. Ikke kjør gamle installasjonsskript. Eventuell Sandbox-installasjon, faktisk remoteversjon, CI, eksakt READY og innlogget prøve føres nedenfor før attest. Production er urørt.

## Brukerprøve i fast Preview

https://expo-proffdok-git-fase45b-whole-app-qa-20261104-ringside.vercel.app/?progressTest=safe

1. Prissøk → Varetelling → opprett egen prøvetelling med lager QA-IKKE-IMPORTER.
2. Opprett en hylle via Opprett en hylle eller et område → Opprett og start område. Registrer to varer. Området skal følge automatisk.
3. Skriv hvor du stoppet og bruk Sett område på pause. En annen teller åpner samme telling/område og bruker Fortsett telling her. Varelisten og stoppmerknaden skal være bevart.
4. Prøv Overta område → Bekreft overtakelse når en annen teller allerede har området. Gammel skjerm får ikke registrert mer; et usendt utkast beholdes og kan avbrytes.
5. Se Historikk og kontroll. Marker Området er ferdig telt. Alle områder skal være ferdig før Avslutt telling. Cordel inneholder bare varenummer, antall og leverandør; kontroll-CSV beholder områdene. Ikke importer prøvefilen i et reelt lager.

## Tilbakeføring

Før merge kan appcommit reverteres i arbeidsbranch. Installert migrasjon skal ikke droppes eller resettes: områder, hendelser, kvitteringer og quantities må beholdes. Gamle klienter fungerer på tellinger der områdeflyten ikke er aktivert; allerede aktive områdetellinger må fortsatt bruke den nye klienten. Ved feil etter installasjon foretrekkes avgrenset fremoverrettelse. Produksjonsplanen må ta hensyn til denne klient-/databasekontrakten og synkretningen main → demo.

## Kandidat, Sandbox og CI943

Appkandidat **8f7802f128219aec8d64528b9d8a9a25533c5e40**, tree71f85f09. Vercel dpl_FyF9rUE2Fv8bLJ2BfyNGxewxKEaW READY/target null på eksakt kandidat. Fast Preview og samme demoinnlogging er beholdt. Lokal git-push manglet autentisering; publisert med GitHub-connectorens atomiske tree/commit/ref med forventet forrige head, og identisk lokalt/remote tree71f85f09. Ingen force, annen branch eller produksjon er endret.

Kun Sandbox-migrasjon installert. Verktøyets remote20261105020338 er kontrollert og justert til CLI-kildens canonical20261105014939. Installer ikke på nytt. To opprinnelige tellinger/fire linjer er bevart med identisk MD5 `49dd51ba1c3516312cd4575fef60ffa6`. Fire områder og fire sannferdige baseline-hendelser lagt til. De fem øvrige offentlige stocktake-funksjonenes definisjonshasher er uendret. Basefunksjonens EXECUTE for authenticated er false.

Security-advisors: bare to nye forventede INFO-funn om private RLS-tabeller uten policies, med alle direkte klientgrants tilbakekalt. Tidligere offentlige record/get-SECURITY DEFINER-advarsler er fjernet av invoker-wrapperne; fem øvrige stocktake-funksjoner beholder tidligere avgrensning. Ingen nye offentlige definer-ruter.

Faktisk legacy-Sandbox-smoke med106 syntetiske linjer, sidevisning, replay, null, firmaskille og avslutning PASS og rollback. Egen ny Sandbox-telling **QA – hyller og overtakelse 05.11.2026**, lager QA-IKKE-IMPORTER, er opprettet for innlogget prøve. Ti samtidige execute_sql-forespørsler/egne transaksjoner med samme eksisterende demoteller la til1,25 hver på samme område/vare. Alle ti godtatt; sum12,5, ti kvitteringer og ti count-events. Dette er reell samtidig serverskriving med én identitet, separat fra PGlites ti forskjellige identiteter; ingen påstand om fysisk prøve med ti personer.

Innlogget UI opprettet Reol A – kontroll, viste riktig eier og alle serverantall, og lagret pausemerknaden «Venstre halvdel telt. Fortsett ved røde rørdeler.». En annen allerede godkjent syntetisk Sandbox-teller tok paused område via native RPC og registrerte2,5: total15, merknad beholdt. UI viste denne telleren, egen Bekreft overtakelse og korrekt retur til Du. Gammelt peer-skriveforsøk med99 ble avvist PT409; replay av tidligere akseptert kommando returnerte gammel kvittering uten ny tilleggstelling. UI-historikk viste blant annet12,5→15, begge aktører og overtakelsen. Manuell nullvare000124 ble deretter registrert fra UI med automatisk, skrivebeskyttet område. De opprinnelige fire linjene har fortsatt identisk hash.

CI943/run41952614765: åtte pakker grønne. App-browser bestod alle81 opprinnelige varetellingskontroller og startet ny faktisk React/PostgreSQL-prøve. Den nye prøven stoppet på tvetydig testlocator: «2 registrerte varelinjer» finnes både i totaloversikt og områdestatus. Ingen appfeil: lokatoren avgrenses til faktisk session-header; vareantallsforventningen beholdes. Eksportassertionen kontrollerer begge eksakte rader uavhengig av tilfeldig UUID-rekkefølge. Den samme nye prøven kontrollerer også reload av valgt område/usendt antall. Ny CI kreves; CI943 er ikke full grønn.


## Faktisk eksport og ferdigstilling

UI lastet ned Cordel-filen:45 byte, SHA256 `9dbe20dd3922cb8cc2f2ddf41ad8a171f3dc0222192ed239a6be108302e46c2c`. Eksakt innhold er000123;15;QA grossist og000124;0;QA grossist, med CRLF. Ingen hylle/status/historikk/pris i filen. Ingen import eller sending. UI markerte hylla ferdig telt og bekreftet ordinær avslutning. Etterkontroll viser closed=true,15 og0 på de to egne QA-linjene, aktiv eksport og ingen registrerings-/redigeringsknapper. Opprinnelig linjehash er fortsatt uendret.

Innlogget lesbarhetsfunn: en generell ventetekst viste «Fortsett telling her» også på et ferdig område. Teksten avledes nå av faktisk paused/done/annen teller/ukjent område. Egen Bruk oppdatert område lar en eier eksplisitt godta nytt arbeidsgrunnlag når det ikke finnes usendt tellekladd; den oppdaterer aldri revisjonen under en kladd. Avsluttet telling tilbyr bare lesing av valgt område. Ingen backendendring eller ny migrasjon for denne teksten. Native områdescenario krever korrekt neste handling på ferdig område.

## Lukket native checkpoint – CI946

Eksakt18f28f9df788d31c8776cd1a21baaf71d13e05e7/tree7538f941df9167126e59476cbbdbab3e9e8f1cd4: CI946/run41954513587 fullført SUCCESS, alle ni pakker og samlet gate. App-browser127006407195 bekrefter opprinnelige81stocktake-kontroller PASS og nye34områdekontroller PASS: faktisk React+PostgreSQL-migrasjon, to brukere, halvferdig hylle/overtakelse, fencing, kladd, historikk, fem bredder, eksport og avslutning. Dette er sluttbevis for den nyere status-/Bruk oppdatert område-kandidaten, ikke bare8f7802f1.

Vercel dpl_A7uHpbDLTZc6k1SZfc9Tig655hYs READY på eksakt18f28f9d, fastalias/targetnull. Innlogget vanlig reload beholdt demo-innlogging. Avsluttet QA–hyller og overtakelse viste1av1område Ferdig telt, stoppmerknad og2linjer15/0; ingen skriveknapper. Ingen ny migrering, fixtureopprettelse eller dataendring. Tidligere faktisk Sandbox-binding/SQL-samtidighetsbevis beholdes; denne read-only UI-runden er ikke ny10-personersbelastning eller full portal/Safari-attest.

Checkpoint for områdeflyten er dermed testmessig lukket på18f28f9d. Ny etterfølgende HR-appkode krever egen kandidat-CI/READY. Ingen TEST OK eller produksjonssetting.
