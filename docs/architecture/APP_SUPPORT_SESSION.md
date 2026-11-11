# Samlet supportøkt – utviklingsgrunnlag, ikke aktivert

PR319. Kravet er kundens faktiske app og egne priser, med opprettelse/redigering, uten sletting. Tilbake skal forbli i kundens app; eksplisitt avslutning skal gjenopprette administratorens arbeidsflate. Dette dokumentet beskriver grunnlaget og åpne integrasjonspunkter, ikke en ferdig brukerreise.

## Identitet og levetid

Den opprinnelige administratorens Auth-token beholdes. Privat økt binder aktør, innloggingsøkt fra `auth.sessions`, målbruker og firma. Aktiv og godkjent aktør/målbruker samt medlemskap kontrolleres på nytt. Varighet er én time. Parallelle starter fra samme innlogging avvises. Avslutning fungerer etter at målets medlemskap eller funksjonsaktivering er trukket tilbake.

Det utstedes ikke kundetoken, og `auth.uid()` eller brukerkontoene endres ikke. Den foreløpige Data API-hooken validerer aktøren, setter transaksjonslokale claims til målbrukeren og lar eksisterende RLS/RPC-er beholde autorisasjonsansvaret. Målets faktiske aktive firma må samsvare med supportfirmaet. Dette er ikke bevis på at alle eksisterende RPC-er fungerer i support; det må kontrolleres per modul.

## Lagring og sletting

Private tabeller for innstillinger, økter og revisjonslogg har RLS uten direkte kundetilgang. Triggerne avviser fysisk sletting, TRUNCATE, eierskifte, kjente arkiveringsflagg og fjerning av identifiserte elementer i JSON. Før/etter logges med faktisk aktør og mål. Hemmelighetsfelter redigeres bort fra loggen. Vanlig aktivitet uten supportkontekst følger eksisterende behandling.

Generisk JSON-kontroll er **ikke tilstrekkelig som full modellgaranti**: navnløse objekter, egne statusfelt, lagringsrutiner som erstatter rader, nye tabeller og felter med særskilt slettesemantikk må gjennomgås. Audit er privat, men før/etter kan inneholde personopplysninger; tilgang og bevaring må inngå i endelig driftsoppsett. Ingen aktivering før de aktuelle modellene er kontrollert.

## Klientgrunnlag

Runtime krever først servervalidert økt og deretter et eget kontekstsvar gjennom Data API-hooken. Manglende hook, feil firma, utløp og byttet aktør stopper kundemodus. Sene svar etter avslutning kastes. Den faller aldri automatisk tilbake til administratorens data.

Lagringsadapteren skiller supportkladder og navigasjon med økt-ID. Administratorens Auth-lagring deles; egne kladder og andre supportøkter bevares. Ved en lagret supportøkt venter alle app-installatører på serverbekreftelse. Local/sessionStorage, IndexedDB og storage-events er navneromsisolert; Auth-lagringen beholdes. Auth-fasaden viser målbrukeren uten å endre administratorens lagrede bruker/token. Utløp blokkerer flaten. Ny innlogget prøve av recovery/dvale gjenstår.

## Transportgrenser og aktiveringskrav

Supabases `db_pre_request` gjelder bare Data API. Storage, Realtime og Edge Functions omfattes ikke. Storage-policyene pakkes rundt sine opprinnelige uttrykk, som evalueres etter validert kontekst. UPDATE/DELETE er i tillegg sperret med restriktive policyer. Kontraktfil-Edge validerer konteksten og sender den videre til eksisterende RPC-er før privilegert fillesing/opprettelse. Øvrige Edge-endepunkter er fortsatt sperret. Realtime kobles ikke til med administratorens identitet; prosjektchat beholder sin eksisterende 5-sekunders REST-oppdatering. Faktisk HTTP/CORS og moduldekning må verifiseres før aktivering.

Før aktivering må følgende være ferdig:

- Kundeautoriserte dokumentlesinger og nye filopplastinger, med filfjerning og overskriving sperret på serveren.
- Edge Functions/andre tjenester gjennomgått; reell utsending, bestilling og aksept skal beholde egne sperrer.
- Full dekning av berørte tabeller/RPC-er, også Boligprosjekter. Nye tabeller må ikke slippe utenom slettesperren.
- Felles bruker-/firmavelger, Auth-visning, banner, cache/IndexedDB-isolasjon og navigasjon gjennom hele appen.
- Innlogget sandbox/Preview-test med syntetiske data: opprette/redigere, slettingsforsøk, dvale/refresh, tilbakekalling, sent svar, tilbudsrecovery og avslutning.

Begge innstillinger starter `false`. Migrasjonene konfigurerer **ikke** `pgrst.db_pre_request`. Ikke slå på innstillinger eller hook manuelt for å prøve UI før transportene er klare. Tre migrasjoner er installert deaktivert i Sandbox, ikke Production. Se QA-loggens versjonsmapping; ikke kjør lokale migrasjonsversjoner ukritisk på nytt. Full produksjonsplan, tilbakeføring og TEST OK må foreligge før aktivering.
