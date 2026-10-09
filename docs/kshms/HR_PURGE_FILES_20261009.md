# HR H3 – privat fil-/slettefundament og samlet Hjelp, 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Preview og Sandbox `ppvircenkjizeiqdxphj`. Faktisk remote baseline `c8a2deeb69dd910d58ca4922124eca91e5771d65`, tree `a47f294ec793df659c395a09644c5aa7fe523406`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Lokal commit-ID er annerledes med identisk tree. Draft PR #216 beholdes.

## Avklart første scope før kode

H3 følger Kenneths «kjør» for privat fil-/slettefundamentet etter H2. Avgrenset til HR-klient/modul, nye private HR-tabeller/RPC-er, én fil-/purge-Edge, relevante critical-/SQL-/React-prøver og prosjektstatus. Brukeren ba deretter om ett KS/HMS-punkt og ett HR-punkt i Hjelp; dette inngår med alle eksisterende veiledninger bevart. Ingen nye samtale-/fraværseditorer, juridiske frister, brukeropplasting eller generelle eksportflater. Ingen endring av Sales, auth/bootstrap, global meny, andre KS/HMS-dataflyter eller e-postworker.

Sikkerhetsprøvene ble bestemt før kode: egen/leder/eksplisitt leser/admin; KS/systemadmin/fremmed firma/avsluttet ansatt uten bypass; tilbakekalling under bytehenting; samtidige endringer; feil/utløpt/sent purge-forsøk; komplett fysisk sletting av alle registrerte innholdstyper og filbytes; restore av eldre generasjoner med uavhengig slettesperre. Aktiv Sandbox skulle ikke restores eller lasttestes.

## Kontrakt som er levert

- Privat serverregistrering for innhold, versjoner, kladder, søkeuttrekk og eksporter. Filer har serverbestemt UUID-sti, generasjon, størrelse, MIME og SHA-256. Ingen offentlig bucket, klientpolicy, signed URL eller lokal HR-lagring. Ingen brukeropplastings-API er åpnet.
- Filproxy kontrollerer Auth-aktør og ferske HR-rettigheter før henting, buffer maks 10 MB, kontrollerer størrelse/hash og kontrollerer tilgang/revisjon igjen før noen byte leveres. Tilbakekalling under hentingen stanser leveransen. Svar er private/no-store uten gjenbrukbar fil-URL.
- **To lukkede porter:** database `content_enabled=false`, `restore_quarantined=true`; uavhengig Edge-kode `contentEnabled=false` som standard. En gjenopprettet eldre database kan derfor ikke alene åpne sensitivt innhold. Nye innholdsrader er også sperret av database-trigger.
- Avsluttet arbeidsforhold blokkerer ansattens HR-tilgang straks, fjerner register/tildelinger og fysisk registrert innhold. Filer legges i privat gjenopptakbar purge-kø. Avslutningens retur sier `deleted=false` mens bytejobber gjenstår, aldri falsk «fullført». Firmaadmin ser **Slettekvitteringer** med cursor/paging. En admin-RPC kan også slette innhold for fortsatt aktiv ansatt med uttrykkelig bekreftelse og fersk revisjon; ingen slik klientknapp innført nå.
- Filworker bruker Storage API for å slette bytes og beviser at objektet er borte før kvitteringen blir komplett. SKIP LOCKED, tidsavgrenset lease, unik forsøkstoken og backoff beskytter parallelle/utløpte/sene svar. Ingen SQL-sletting av Storage-metadata. Kanoniske foreldreløse filer ved avslutning fanges opp. Minimale kvitteringer beholdes uten navn, fritekst eller innhold.
- Operator-only restore-manifest/reconcile: kontrollerte minimale person-/firmareferanser, generasjon og tidspunkt; replay stenger innhold og sletter gjenopprettede eldre generasjoner på nytt. Reconcile kan ikke åpne portene.
- Hjelp har nøyaktig ett **KS/HMS**-punkt med 11 kapitler og ett **HR**-punkt med ett kapittel. Kapitlene bruker native details/summary, minst 44 px klikkflate og tekstbryting. Andre hjelpetemaer, roller og innhold beholdes.

## Nye faktiske bevis

| Kontroll | Resultat og grense |
|---|---|
| Sandbox SQL | **61 assertions PASS**, alle egne syntetiske firma/brukere/artifakter rullet tilbake. Egen/leder/leser/admin, tilbakekalling/ny leder, avslag, generasjonsvern, alle fem innholdstyper, feil/retry/lease, aktive innholdspurge og restore-reconcile. SQL request-claims finnes bare i isolert rollback, ikke browserinnlogging. |
| Restore-kontrakt | PASS med eldre syntetiske rader gjeninnsatt fra transaksjonens kopier og separat bevart manifest. Etter replay fjernes gamle rader, filjobber køes og porten forblir stengt. **Dette er ikke full backup-restore.** |
| Faktiske Storage-bytes | Privat API-opplasting og nedlasting av én **62-bytes syntetisk fil**, SHA-256 identisk, offentlig/anon tilgang avvist, Storage API-sletting og etterfølgende fravær PASS. HTTP request-id `5`, status 200. Ingen persondata. Testen beviser bytes og API, ikke PDF-format, mobilkamera eller innlogget brukerfilflyt. |
| Edge/SQL readback | Alle **16 SQL-funksjoner byteidentiske** med migrasjonen, låst tomt search_path og riktige authenticated/service/private ACL. Edge `hr-file-access` **v3 ACTIVE**, begge returnerte kildefiler byteidentiske med lokal kilde; deno.json sendt med deploy, ikke returnert av readback-API. Normal entrypoint har ingen QA-probe. |
| React/runtime | Faktisk HR-React og faktisk Hjelp-fabrikk PASS: 11+1 kapitler, åpning/bytte, eksisterende tilbudsveiledning; sletting pending → complete, paginering/tilgang/revisjon/fokus/sene svar. Permanent faktisk byteproxy/worker-prøve dekker tilbakekalling mens ReadableStream hentes, hash/størrelse/feil og uavhengig lukket Edge-port. |
| Build/advisor | Full critical Sandbox-build og H1-regresjon PASS. Nye private RLS-tabeller uten klientpolicy er tilsiktet RPC-only vern; authenticated SECURITY DEFINER har eksplisitt aktørkontroll. Ingen HR-FK-gap i performance-advisor. Ingen unrelated advisories endret. |
| Lesende sluttsjekk | Én eksisterende firmaoppføring og én medarbeider beholdes. **0** innhold, filer, receipts, purge-jobber, slettesperrer, Storage-objekter og syntetiske QA-firma/brukere. Registeret er ikke tilbakestilt. |

CLI-generert lokal migrasjon `20261009193953_hr_content_purge_foundation.sql`, live Sandbox-versjon `20261009195330`. Første apply fikk utløpt requestState; fravær av tabeller/RPC/migrasjon ble kontrollert før ett vellykket forsøk. Privat purge-cron er aktivert for faktisk filsletting; **KS/HMS e-postworker fortsatt enabled=false**. Det er to forskjellige arbeidere. QA-adapteren i `hr-storage-probe.fixture.ts` ble brukt midlertidig på Sandbox; normal Edge har ingen probeadapter, og testfilen er slettet.

## Før sensitivt innhold kan åpnes

1. Etablere et varig, tilgangsstyrt slettemanifest **utenfor databasebackupens gjenopprettingsområde**, inkludert holdbar eksport/kvittering/replay og avklart oppbevaring av de minimale ID-ene. Lokal manifestfunksjon alene oppfyller ikke dette driftskravet.
2. Full backup-/Storage-restore i en **isolert syntetisk database**, med portene stengt, innlesing av komplett separat slettemanifest, reconcile, Storage API-purge og fersk kontroll av metadata/bytes/tilgang. Ingen restore av aktive Sandbox-fixtures eller Production.
3. Avklare særskilte lovlige bevaringsbehov og eventuelle eksterne backup-/eksportkopier; appen kan ikke tilbakekalle filer brukeren tidligere har lastet ned. Åpne innhold/filer først i et uttrykkelig avgrenset senere scope. Brukeropplasting og reell innlogget HR-filprøve er heller ikke levert av denne backendprøven.

Databasebackup omfatter Storage-metadata, ikke filbytes. Derfor må database og filkopier kontrolleres sammen ved restore. [Supabase backups](https://supabase.com/docs/guides/platform/backups) · [Storage API-sletting](https://supabase.com/docs/guides/storage/management/delete-objects) · [Datatilsynet personalmappe](https://www.datatilsynet.no/personvern-pa-ulike-omrader/personvern-pa-arbeidsplassen/personalmappe/).

Tidligere H1 75 / H2 16 og B/C 45 / varsler 36 / avvik 37 / revisjon 36 / øvrige oppgaver 41 PASS beholdes som historiske bevis. Kenneths TEST OK for H2-menyen og særlig 9. oktober SJA-PDF, samlet PDF, ZIP/bilder/manifest, kvalitet/HMS-uttrekk og SJA-bilder beholdes. Ingen ny obligatorisk omtest. Ingen main/demo-merge, Production-release eller e-postsending; den ene autoriserte testmailen er ikke sendt. Faktisk mobilkamera/flere samtidige browserøkter, full restore og 100-firma-kapasitet er ikke gradert PASS. Endelig SHA/CI/READY Preview og faktisk Hjelp-browserkontroll føres etter publisering.
