# Kapasitet og drift for KS/HMS

Grunnvurdering kontrollert 2026-10-06; oppdatert med lesende Sandbox-måling 2026-10-09. Supabase med Postgres og Storage er et egnet utgangspunkt for 100 firmaer i ett firmaseparert system. Dette er en teknisk vurdering av arkitekturen, ikke en garanti for dagens compute eller en utført belastningstest. Antall firmaer alene sier lite om samtidige forespørsler, historikk, vedlegg og utsendinger.

## Grunnobservasjoner 6. oktober (historisk)

- Read-only databasekontroll: Sandbox `ppvircenkjizeiqdxphj` svarer og har åtte KS/HMS-tabeller med RLS. Indekser finnes for firmarutiner/arkiv, firma+rutine+versjonsnummer, firma+bruker ved tildeling/bekreftelse og firma+tid for audit/revisjon. Direkte klienttilgang er stengt; eksisterende smale RPC-er gjør eksplisitte tilgangskontroller.
- Begge databasene oppgir `max_connections=60`. Dette er databaseforbindelser, ikke en grense på 60 appbrukere eller firmaer. Plattformens compute-/planmetadata er ikke fastslått av dette tallet. Production er ACTIVE_HEALTHY, Postgres 17; den har ingen KS/HMS-tabeller ennå. Sandbox er en databasebranch; eget get_project-oppslag finner den ikke, mens autorisert SQL svarer. Ingen miljøendring er utført.
- `kshms_get_state` henter i A alle relevante rutiner, versjoner, tildelinger og bekreftelser for lederen. Selv med firmaseparasjon blir én stor historikkrespons unødvendig tung. Klientsøk i allerede tillatt state er nyttig nå, men er ikke full løsning for store arkiv.
- Dagens datasett og metadata er ikke bevis på at 100 firmaers fremtidige arbeidsmengde passer på dagens compute. Ingen faktiske kundedata er brukt i belastningstest.

## Oppdatert kontroll 9. oktober

[Samlet B/C-sluttkontroll](BC_CLOSEOUT_20261009.md) har scope, tall, planbegrensninger og releasepunkter. Lesende Sandbox-måling viste 20 av 20 offentlige KS-tabeller med RLS, database 30 108 819 byte, senere KS-relasjoner 3 858 432 byte inkludert indekser/TOAST, og 15 forbindelser av konfigurert maks 60. Dette er øyeblikksverdier, ikke compute-plan eller brukerkapasitet.

Datasettet har 73 rutiner, ti utgaver, 40 tildelinger og ingen lesebekreftelser; de ti versjonenes JSON utgjør 19 928 byte uten RPC-konvolutt. Køen har 48 pending assignment-poster (40 reading / åtte deviation), ingen sending/failed. Eldste pending er 53,2 timer med worker bevisst disabled; dette er ikke leveringstid med aktiv transport. Cron er aktiv hvert minutt. Ingen data eller køposter er endret.

Tre avgrensede komponentqueries med EXPLAIN ANALYZE og 3-sekunders timeout hadde SQL execution time 0,480 / 0,482 / 0,158 ms. Risikospørringen ga null rader. Dette er ikke hele RPC-er, HTTP/nettleser, samtidig last eller p95; tallene gir ingen garanti for 100 firmaer. Indeksmetadata finnes for firma/bruker, versjoner, avvik, utførelser og kø/deduplisering. Ingen indeksendring er begrunnet av disse små enkeltmålingene.

Live `kshms_get_state` **og** `kshms_checklist_state` samler historikk uten LIMIT. Avvik har 50-posters cursorlesing og utførelser 100-posters cursorlesing; det tidligere generelle avvikstiltaket nedenfor er dermed delvis levert. Store PDF/ZIP-uttrekk bygges fortsatt i klienten. E-postworker har høyst 20 iterasjoner og 40-sekunders grense før neste iterasjon, ikke målt sendekapasitet eller hard maksimal totalvarighet. Dette er de konkrete vekstpunktene før større utrulling.

`kshms-private` er privat; eksisterende `project-images` er offentlig og uendret. Individuell HR krever egen privat fil-/tilgangskontrakt. Faktisk fil-/mobil-/flerbrukerbevis, providerlatens, compute-plan, CPU/minne/IO, Storage/egress og restore er ikke verifisert i denne runden.

Aktuelle primærkilder kontrollert via Supabase docs 9. oktober: [databaseforbindelser](https://supabase.com/docs/guides/database/connecting-to-postgres), [performance](https://supabase.com/docs/guides/platform/performance) og [Reports](https://supabase.com/docs/guides/observability/reports). De understøtter metodevalg og hvilke driftsmålinger som trengs; ingen produktgrense eller garanti utledes av vårt lille datasett.

## Tiltak før større utrulling

| Område | Gjennomførbart tiltak |
|---|---|
| Liste og historikk | Smal oversiktslesing med aktuelle versjoner og tellinger. Hent innhold/historikk ved behov og bruk stabil cursorpaginering, også for avvik. Søk på server med samme firma-/rolle-/versjonskontroll før begrensning; grense/paginering må ikke skjule manglende oppgaver. |
| Indekser og tilgang | Mål relevante queries med EXPLAIN/pg_stat_statements. Tilpass sammensatte indekser til firma, mottaker, status, frist og sortering. RLS og RPC-autorisering beholdes; ingen global cache med blandede firmadata. |
| Bilder/filer | Filbytes i private Storage-buckets, bare metadata/referanser i Postgres. Gjenbruk eksisterende bildeoptimalisering, sett filstørrelsesgrenser og hent miniatyrer først. Kortvarige signerte URL-er med reell firmascope-/HR-ACL. Ingen offentlig bucket for sensitiv dokumentasjon. |
| Varsler og eksport | Transaksjonell outbox med idempotens/deduplisering, styrt parallellitet, retry og tydelig feilstatus. Store PDF-/tilsynsuttrekk kjøres som jobber, med autorisasjonskontroll både ved kjøring og henting. Lesing/skriving skal ikke vente på hele e-postkøen. |
| Forbindelser | Nettleseren bruker dagens registrerte Supabase Data API-klient. Nye serverjobber bruker egnet pooling og begrenset parallellitet; ikke én direkte databaseforbindelse per bruker eller jobb uten kontroll. |
| Drift og vekst | Mål svartid, feilrate, CPU/minne, disk-I/O, forbindelser, responsstørrelse, Storage/egress og køforsinkelse. Test gjenoppretting/bevaring før full utrulling. Compute kan justeres etter målt behov og konkret godkjenning av kostnad. |

## Planlagt prøve – ikke utført

Bruk en separat, midlertidig testdatabase med syntetiske data. Fyll 100 firmaer og eksempelvis 20 kontoer per firma (2 000 registrerte kontoer; de er ikke alle samtidige brukere). 150 rutiner per firma med tre versjoner gir 45 000 versjoner. Med 20 tildelinger per versjon blir det opptil 900 000 tildelinger og tilsvarende bekreftelsesposter. Tilfør representative avvik, SJA, revisjoner og vedleggsmetadata. Dette er et testscenario, ikke et estimat fra eksisterende kundedata.

Kjør blandet last med 50 samtidige aktive brukere, deretter en kort topp på 200, fordelt mellom firmaene. Utfør søk/oversikt, åpning av versjon, kladdlagring, bekreftelse, avvikstildeling og kontrollert lukking mens eksport/varsler går i bakgrunnen. Skill store filoverføringer fra vanlige API-kall. Foreslåtte ytelsesmål for normale API-kall: p95 under 1 sekund, synlig oversikt under 2 sekunder på avtalt nett/utstyr, ingen datatap eller firmalekkasjer og under 1 % tekniske feil. Målene fastsettes før testen og er ikke oppnådde resultater eller myndighetskrav. Køen må tømme seg innen avtalt varslingsfrist; feil/retry må ikke sende duplikater.

Rapporter volum, samtidighet, varighet, valgt compute, p50/p95/p99, feil, maksressurser og flaskehalser. Rett målte problemer og gjenta bare relevante scenario. Lasttesten kjøres ikke mot Production eller brukerens aktive Sandbox-fixtures.

## Kontrollerte primærkilder

Alle nedenfor kontrollert 2026-10-06:

- [Supabase Compute and Disk](https://supabase.com/docs/guides/platform/compute-and-disk): kapasitet/forbindelser avhenger av compute; flere faktorer enn databasevolum avgjør ytelse.
- [Performance Tuning](https://supabase.com/docs/guides/platform/performance): queryanalyse, forbindelser og pooling for kortvarige serverarbeider.
- [RLS performance](https://supabase.com/docs/guides/database/postgres/row-level-security-performance): mål riktige policyer, indekser og scannede rader; ikke fjern tilgang for å oppnå ytelse.
- [Storage scaling](https://supabase.com/docs/guides/storage/production/scaling): bildestørrelser, opplastingsgrenser og effektiv listing/egress.
- [Changelog](https://supabase.com/changelog) og [Data API auto-exposure-endringen](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically): markdownindeksen var utilgjengelig, HTML-indeksen/kunngjøringen er lest. Nye direkte tabell-API-er skal ikke antas automatisk eksponert; A bruker eksplisitte RPC-/ACL-kontrakter. Ingen Supabase-versjon oppgraderes her.
