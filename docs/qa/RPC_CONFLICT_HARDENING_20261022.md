# Vern mot gjentakende RPC-konflikter

Miljømål: **BEGGE**. Kenneth ba om forebygging og autoriserte gjennomføringen
etter tilbudshendelsen i PR #281. Arbeidet holdes adskilt fra Boligprosjekter.

## Omfang og bevaring

46 funksjoner er lest fra produksjon og sandbox; definisjonene er identiske.
De har 77 manuelle `errcode='40001'` for versjons-, status- og replaykonflikter.
Migrasjonen krever riktig signatur, definisjonshash og antall treff for alle
46 før noe endres. Den erstatter bare disse kodene med `PT409` (HTTP 409).
Ukjent eller manglende funksjon stopper hele migrasjonen. Ikke rediger eller
kjør den på nytt etter anvendelse.

Stocktake returnerer enkelte feil som JSON. Den beholder håndteringen av ekte
PostgreSQL-40001 og håndterer også PT409. Rolle, eier, ACL, SECURITY DEFINER,
search_path, andre innstillinger, tilgangskontroller, versjonslås, pris/mengde,
idempotens og resten av funksjonskroppen bevares. Ingen skjemaer/tabeller,
brukerdata, e-post eller aksepter opprettes av migrasjonen.

14 React-flater bruker felles `isRpcConflict` for PT409 og eldre 40001 under
trinnvis utrulling. Eksisterende kladd-, sammenlignings- og konfliktflyter
bevares. HR-start nullstiller et avvist forsøk også ved PT409. Ingen recovery-,
navigasjons-, autosave- eller tilgangskjerne endres.

Sandbox har i tillegg en eldre HR-ledger-funksjon som mangler i produksjon.
Den håndteres i separat sandbox-migrasjon og skal ikke flyte inn i main.

## Permanent regresjonsvern

- CI og `npm run build` kjører `critical-rpc-error-codes-check.mjs`.
  Manuelle transaksjonsfeilkoder i klasse 40 og navngitte varianter stoppes
  før publisering. Vanlige PT409-feil og rethrow av ekte databasefeil tillates.
  Bare 59 historiske migrasjoner med uendret SHA-256 er unntatt. De skrives
  ikke om; den nye migrasjonen retter deres endelige funksjoner.
- 508 PGlite-kontroller bruker et snapshot av de faktiske 46 kodedefinisjonene,
  uten brukerdata. De verifiserer nøyaktig migrasjon og metadata, alle 77
  endrede RAISE-setninger, atomisk rollback og gyldig skrivegren. Manglende,
  endret og allerede migrert funksjon stopper migrasjonen.
- 16 eksisterende PostgreSQL-modulsuiter kjøres også med den nye kontrakten.
  Testadapteren legger samme kodeendring på innleste historiske migrasjoner;
  ingen tester eller assertions fjernes. De ordinære historiske CI-løpene
  beholdes. Adapteren er testkode og brukes ikke i appen eller skybasen.
- Eksisterende React-scenarioer sender nå PT409, slik at kladd og sammenligning
  prøves med faktisk ny feilkode. Legacy-gjenkjenning testes separat.

## Utrulling og kontroll

1. Lokal QA og Preview/CI må være grønne. Kontroller funksjonshashene på nytt.
2. Anvend migrasjonen i sandbox. Les tilbake alle definisjoner og rettigheter.
3. Publiser klienten som håndterer både gammel og ny kode, deretter den
   godkjente migrasjonen i produksjon. Ikke reverser til manuell 40001 ved
   eventuell klientrollback; klienten kan fortsatt lese PT409 som vanlig feil.
4. Kjør `scripts/ops/rpc-retry-health.sql` før og etter. Forvent ingen manuelt
   hevede retry-koder, og sammenlign rollbackteller over et kontrollintervall.
5. Kontroller feil gjennom faktisk HTTP/RPC uten ekte aksept eller utsending.
6. Synkroniser main → demo og kontroller kodebaseline og backend-preflight.

## Drift og grenser

Ved nytt CPU-varsel: kontroller CPU-graf, loggvolum, feilkoder og aktive
authenticator-kall. En stigende rollbackteller alene identifiserer ikke årsak.
Knytt eventuelle løkker til konkrete logg-PID-er før en prosess stoppes;
ikke terminer alle tilkoblinger eller øk compute som første feilsøkingstiltak.
Bruk helsesjekken etter senere databaseendringer, også utenom CI.

Supabase dokumenterer at PostgREST 14 kan gjenta manuell 40001 uendelig, og
at plattformfeilen er rettet i PostgREST 16. Prosjektene kjørte 14.5 ved
hendelsen. Tilgjengelig oppgradering må følges opp gjennom Supabase; denne
leveransen påstår ikke at plattformen er oppgradert eller at alle mulige
CPU-årsaker er eliminert. Eksisterende CPU-varsling beholdes.

Kilde: https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions

Resultater fra utrulling føres i PR-beskrivelsen med miljø, commit og faktisk
kontroll. Grønn build er ikke alene bevis på en vellykket kundetransaksjon.
