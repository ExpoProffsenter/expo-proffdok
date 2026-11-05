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
