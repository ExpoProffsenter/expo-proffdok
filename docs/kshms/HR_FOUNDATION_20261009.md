# HR H1 – tilgangsregister før sensitivt innhold

## Første scope og baseline

Miljømål **BEGGE**, levering bare feature/Preview og Supabase Sandbox `ppvircenkjizeiqdxphj`. Faktisk remote før endringer: feature `68a267d4db894999dfeccde01d7d5d6cc269f404`, tree `e676ce8527dc1f69d2053b17c33b7d7e0a717264`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. PR #216 åpen/draft. Lokal annen commitidentitet hadde eksakt samme tree. Diff før H1: 266 filer mot main.

Dette er første avgrensede del av [HR_SCOPE](HR_SCOPE_20261008.md), etter ferdig B/C-utviklerreview. Scope: ny `src/modules/hr/hrFoundation.mjs`, to nye HR-migrasjoner, permanent HR-critical + rollback-SQL, ett tilleggsimport i eksisterende critical-kjede og relevant README/HJELP/architecture/KS-HMS-status. Ingen hovedmeny, main.jsx, KS-rollemodell, salgs-/prosjektkode, worker, generell e-postaktivering eller main/demo-merge.

H1 lagrer bare administrativt formål/grunnlag/kontrollfrist, aktive appbrukeres medarbeider-/lederrelasjon og uttrykkelig ekstra lesetilgang. Ingen fraværsdato, samtaletekst, referat, versjon, kladd, fil eller eksport-API. Fritekst om tilgangsformål/begrunnelse skal bare være administrativ; helseopplysninger skal ikke legges der. Firmaet må selv dokumentere faktisk formål og behandlingsgrunnlag. Et tekstfelt er ikke juridisk godkjenning og tillater ikke helsebehandling.

## Levert kontrakt

| Punkt | H1-resultat |
|---|---|
| Aktivering | Egen privat firmainnstilling, ingen automatisk aktivering eller endring av company_module_access. Firmaadmin i eget aktive firma må oppgi formål, vurdert grunnlag og kontrollfrist innen ett år. HR er uavhengig av KS-grant. |
| Medarbeider | Én register-ID per aktiv medarbeider/firma. Brukeren må være godkjent, aktiv intern appbruker med medlemskap i samme firma. Ingen kopi av auth-identitet i HR. |
| Innsyn | Medarbeider selv, nåværende leder, firmaadmin og uttrykkelig ekstra leser. Fersk medlemskap/profil/aktiv arbeidsprofil ved hver RPC; ingen JWT-metadata, KS-rolle eller support-/systemadmin-bypass. En systemadmin kan bare få ordinær rett gjennom en uttrykkelig kvalifiserende firmarolle/relasjon. |
| Lederbytte | Samme medarbeider-ID beholdes. Tidligere leder mister ordinær ledertilgang. Har denne personen også ekstra lesetilgang, stoppes byttet til den særskilte tilgangen uttrykkelig fjernes. Ingen innholdshistorikk finnes ennå. |
| Ekstra leser | Bare firmaadmin kan gi/trekke tilbake rett per medarbeider. Aktør, tidspunkt og administrativ begrunnelse lagres. Leseren har ingen registerendringsrett eller rett til å starte/bekrefte samtaler. |
| Fratredelse | Firmaadmin bekrefter END_AND_DELETE med fersk revisjon. Register og alle egne lesertildelinger/begrunnelser slettes fysisk. Den fratredende personens ledertilordninger og ekstra leserrett hos andre fjernes, med ny revisjon på berørte rader. Hele personens HR-tilgang sperres; øvrig app/KS-tilgang endres ikke. |
| Retry og restore | Minimal separat slettesperre med firma-/bruker-/medarbeider-ID, tidspunkt og tidligere revisjon; ingen navn, begrunnelse, leder eller saksinnhold. Samme avslutningsretry returnerer samme kvittering. Automatisk gjenregistrering er sperret; gjenansettelse krever senere egen vurdert flyt. Restore må bevare disse sperrene utenfor backupen. Faktisk restore og utløp for backup/sperre er ikke levert. |
| Filer | Ny `hr-private` er privat og tom, helt uten klientpolicy. Lesing/opplasting/overskriving/sletting er stengt. Ingen signerte lenker eller filtransport. Eksisterende Storage-policyer/buckets er uendret. |
| Klient | Ny transporttjeneste har kun flyktig tilstand, ingen localStorage/IndexedDB. Egen invalidate/dispose og generationsvern hindrer sene svar etter scope-endring. Detail hentes med en ny serverkontroll før retur og krever samme register-ID/revisjon. Tjenesten er ikke koblet til React eller globale events ennå. |
| Omfang | Firmabundet adminoppsett/brukervalg og autorisert medarbeiderliste med stabil UUID-cursor og maks 100 rader. Dette er ikke lasttest. |

Alle private tabeller har RLS og ingen klient-/servicegrants. Fem private hjelpere har ingen anon/authenticated/service EXECUTE. Fem smale offentlige RPC-er har bare authenticated EXECUTE og tomt search_path. SECURITY DEFINER er tilsiktet for disse RPC-ene: direkte tabelltilgang er stengt og autorisasjon gjøres eksplisitt. Felles firmalås serialiserer H1-endringer og registerlesing. Separate samtidige browser-/databasesesjoner er ikke testet.

## Prøver definert for H1 og faktisk resultat

- `scripts/hr-foundation-sandbox-check.sql`: **75 assertions PASS**, faktiske RPC-er under authenticated/anon/service_role med ni syntetiske kontoer og to firmaer. Egen bruker/leder/admin, ekstra leser, gammel leder, KS-ansvarlig, systemadmin, uvedkommende og annet firma; grant-attribusjon, stale revisjon, feil payload, lederbytte med særskilt grant, revokering, aktivt firmabytte, profil-deaktivering og fjernet medlemskap. Fratredelse/avhengige leder- og leserrelasjoner, fysisk register-/grantsletting, retry og sperret reaktivering dekkes.
- Storage-prøven bruker kun en tilbakerullet syntetisk metadataoppføring, **ingen faktiske filbytes**: privat bucket, firmaadmin ser ikke oppføringen, INSERT avvises, UPDATE endrer null rader og direkte DELETE avvises av Storage-beskyttelsen. Dette er negativ SQL/Storage-metadata-QA, ikke faktisk HTTP-filnedlasting eller API-sletting.
- `critical-hr-foundation-check.mjs` PASS: kjører faktisk eksportert transporttjeneste med styrte asynkrone svar; fersk detaljkontroll, endret revisjon, sene svar/invalidate/dispose, feil firma/bruker og nettfeil. Permanent import er lagt til i full critical-kjede uten å svekke eksisterende sjekker.
- Full lokal `EXPO_BACKEND_TARGET=sandbox npm run build` PASS. Eksisterende B/C-prøver/TEST OK beholdes som tidligere bevis; ingen ny browser-PASS eller Kenneth-prøve påstås.
- Første SQL-prøve fant en reell PL/pgSQL id-/kolonnekollisjon. Rettet med egen command-migrasjon; endelig **75** passerer. Innledende test-fixturefeil ble korrigert uten å endre produktets eksisterende profil-/Storage-vern.
- Alle ti live funksjonskropper lest tilbake og **byteidentiske** med endelig lokal migrasjonssekvens. Alle har tomt search_path og forventet EXECUTE-matrise. Direkte sluttkontroll: **0 HR-firmaer/medarbeidere/lesere/slettesperrer, 0 QA-firmaer/brukere, 0 HR-objekter**, privat bucket og KS-worker **enabled=false**. Ingen HTTP-sender invoked.
- Sandbox migrasjonshistorikk: `20261009184031 hr_access_foundation`, `20261009184156 hr_access_command_scope_fix`. Repoets CLI-genererte filer `20261009182551` og `20261009184122` er tilsvarende kode i samme rekkefølge. Ingen Production-migrasjon.
- Security Advisors kjørt: H1s fire RLS-uten-policy INFO er tilsiktet stengte private tabeller; fem authenticated SECURITY DEFINER-varsler gjelder de tilsiktede smale RPC-ene. Ingen H1 anon-EXECUTE eller mutable search_path. Eksisterende prosjektvarsler er ikke utbedret i dette scope. [Advisorforklaring](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Neste del og grense før innhold

H2: eget HR-hovedvalg med firmadminens register/leder/ekstra leservalg og medarbeiderens Mine oppfølginger. Bruk transportens invalidate ved bruker-/firma-/tilgangsendring og rydd sensitiv UI før sene svar; test faktisk React og brukerkontoer. Registerets eneste handlinger er administrasjon, ingen samtale eller sykefravær ennå.

Før sensitivt innhold/filer åpnes: privat autentisert filhenting med fersk tilgang, serverstyrt filregister og gjenopptakbar API-purge av bytes, versjoner, kladder og avledede uttrekk. End-kommandoen må først utvides slik at den umiddelbart sperrer alt og ikke melder full sletting før fil- og innholdsarbeidet er fullført. Ingen SQL-sletting av Storage-metadata som erstatning for filbytes. Dokumenter håndtering av allerede nedlastede kopier, konkrete bevaringsunntak, sletting under aktiv ansettelse, kontrollfrist, backup-utløp og prøvd restore. H1s sletting gjelder **bare H1-registeret**, ikke fremtidige HR-saksdata eller en ferdig full HR-slettefunksjon.

Deretter medarbeiderforberedelse → felles møte → begge bekreftelser med uenighet/utgaver, og senere manuelt startet sykefraværsoppfølging. Juridiske sykefraværsfrister implementeres ikke nå. Aktuelle primærkilder skal verifiseres når dette blir konkret scope.

## Kilder kontrollert 9. oktober 2026

[Datatilsynet personalmappe](https://www.datatilsynet.no/personvern-pa-ulike-omrader/personvern-pa-arbeidsplassen/personalmappe/) understøtter tjenstlig innsyn, konkret formål/grunnlag og oppbevarings-/slettevurdering; ingen automatisk generell bevaringsfrist innføres. [Supabase privat Storage](https://supabase.com/docs/guides/storage/buckets/fundamentals), [RLS](https://supabase.com/docs/guides/storage/security/access-control) og [API-sletting](https://supabase.com/docs/guides/storage/management/delete-objects) kontrollert via offisiell docs. Changelog-indeks lest; Postgres 15.19/17.11-endring om ltree/legacy-krypto/btree_gist/custom operators gjelder ikke H1s nye ordinære UUID-tabeller/funksjoner. Ingen slik plattformendring utført.

Grønn CI, publisert commit/tree og eksakt READY Sandbox Preview føres i draft PR #216 etter lease-publisering. Production/main/demo og generell e-postaktivering forblir uautorisert. Den ene autoriserte testmailen er fortsatt ikke sendt. Tidligere TEST OK beholdes; H1 har ingen ny brukerflate å prøve.
