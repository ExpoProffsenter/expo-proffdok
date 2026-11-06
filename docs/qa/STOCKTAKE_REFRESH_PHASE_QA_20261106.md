# Varetellingstest: vent på riktig oppdateringsfase

Miljømål BEGGE, bare QA/arbeidsbranch. Ingen appendring, backendendring eller produksjonssetting.

CI997/core ca2134c3 feilet i app-jobb128091010268 på eksisterende stocktake-areas-react-check: «stale draft can be consciously cancelled». Appkode, database og test for området var uendret fra forrige grønne kandidat. Den nye Sales-prøven nådde ikke denne feilen via sine moduler; stocktake-fixturen importerer egne uendrede komponenter.

## Bekreftet testforløp

StocktakeWorkspace.command håndterer avvist, gammel områdekommando ved å rydde pending og vise feilen, deretter await refresh av faktisk områdestatus. run holder busy til denne oppdateringen er ferdig. Fieldset, inkludert Avbryt innlegging, er derfor korrekt sperret mens oppdateringen pågår. Den gamle testen ventet bare på feilmeldingen og målte isEnabled umiddelbart, før den nødvendige oppdateringen alltid var ferdig.

QA-fixturen holder nå akkurat denne etterfølgende stocktake_area_get-responsen tilbake. Holdet armeres først når den faktiske stale-record-responsen er mottatt, slik at en annen oppfrisking ikke kan ta holdet. Under holdet kreves disabled Avbryt og bevart usendt8. Deretter slippes responsen, testen venter avgrenset på enabled i faktisk DOM og beholder den opprinnelige isEnabled-assertionen og avbruddshandlingen. Etter avbrudd kreves fremdeles at gammel teller ikke kan telle videre i en annens område.

Alle tidligere krav, PostgreSQL-migrasjoner, to brukeridentiteter, overtakelse, antall, historikk, kladd, Cordel-eksport, fem bredder og avslutning beholdes. To nye krav legges til; ingen assertion er fjernet, ingen produksjonskode/tidsgrense/CI-kommando er endret og ingen blind omkjøring brukes.

Lokal native fixture-build består uten browser. Ny full native kjøring kreves på eksakt commit; resultat og head dokumenteres i PR309/311. Appkoden er identisk med Sales-rettingen på ca2134c3/3e5ac3cb. Denne QA-rettingen er ikke en retting av brukerdata eller en ny varetellingsfunksjon.

Tilbakeføring: revert bare denne QA-commit. Ingen data- eller approllback. Samlet kandidat med Bolig beholdes via vanlig core-integrasjon.

CI999 avdekket en feil i det nye QA-holdet: testen ventet på stocktake_get, mens refresh med valgt område bruker stocktake_area_get. Holdet er rettet til dette eksisterende områdeskalerte kallet. Timeouten var i QA-ventingen før nye assertions, ikke en app-/databasefeil. Ingen økt timeout eller fjernet assertion. CI999/1000 er ikke grønn attest; full pakke kjøres på nytt på korrigert head.
