# Kontrollert førstegangsoppretting av HR-kontrollpunkt – 11. oktober 2026

Miljømål **SANDBOX/DEMO**. Leveres bare på draft PR #217. Ingen appkode, appmigrasjon, privat HR-port, Production/demo, eksisterende operator/checker eller credentials endres. Ny kontrollmigrasjon er installert bare i **expo-hr-control / amduqhmgmeetaatwlmmt**; ingen rader, bootstrap, binding, ack eller scheduler aktiveres.

## Kontrakt og operatørgrense

`scripts/lib/hr-control-bootstrap.mjs` lager en eksplisitt staging-plan med forventet generation=0/HMAC. Planen har ingen signeringsnøkkel/token og bruker INSERT uten upsert. En gjennomgått operatør må lagre signeringsnøkkelen sikkert og sette inn den nøyaktige deaktivert staging-raden separat. Verktøyet krever ISOLATED_QA og avviser Production, aktiv kurs-Sandbox og kontrollprosjektet som kilde. Ingen manglende kontrollrad opprettes automatisk; dette er ikke en recovery-funksjon.

Flyt: atomisk claim av forhåndsopprettet kontrollrad → fersk privat missing-kontroll → create-only signert tom logg → fersk verifisert skyreadback → kontrollread → kontrollcommit → separat kontrollread → ny fersk verifisert skyreadback → kontrollread. Eksisterende objekt overskrives aldri. Feil eller ukjent resultat bevarer låsen, også når et faktisk skriv/commit kan ha lyktes. Vellykket bootstrap ender **deaktivert og fortsatt låst**. Verktøyet har ingen unlock, retry/rebootstrap, app-RPC, ack eller aktivering. Den normale cycle-adapteren kan ikke overta en slik binding. Providerfeil vises bare som fast kode.

Dette separate kontrollpunktet skal ligge utenfor alle appens database/Auth/Storage-restoregrenser. Tilbakerulling/tap av kontrolltabell eller nøkkel krever særskilt uavhengig recovery; en ny staging-rad er ikke bevis for at det aldri har eksistert en nyere slettelogg. Før aktivering må den gamle operatorprosessen være stoppet og sky-/kontrolltilstanden verifisert. Ingen timeout-overtakelse. Denne isolerte bootstrap-ruten kan **ikke brukes direkte til produksjonsbinding**.

## Filer og faktisk installasjon

| Del | Fil/resultat |
| --- | --- |
| Kontrollskjema, tre smale service-only RPC-er | `ops/hr-control/supabase/migrations/20261010232752_hr_control_bootstrap.sql`, opprettet med CLI 2.120.0 migration new. Installert kun i kontrollprosjektet som **20261010233316**. |
| Faktisk rollback-SQL | `ops/hr-control/bootstrap-check.sql`: **29 assertions PASS** i live kontrollprosjekt og PostgreSQL/PGlite; alle syntetiske rader rullet tilbake. |
| Operator og begrenset klient | `scripts/lib/hr-control-bootstrap.mjs`: bare tre bootstrap-RPC-er, fast kontrollorigin, apikey for sb_secret, redirects avvist, timeout 30 s, svar maks 16 KiB, fast feilkode. |
| Feil/rekkefølge/samtidighet | `scripts/critical-hr-control-bootstrap-check.mjs`: **26 scenarioer PASS** med syntetiske transporter, samt staging-/hemmelighets-/HTTP-grenseprøver. |
| Faktisk PostgreSQL-bootstrap | `scripts/hr-control-bootstrap-db-check.mjs`: **48 nye assertions + 29 rollback-SQL-kontroller PASS**, alle opprinnelige **37** kontrollassertions beholdt uendret. Plattformroller syntetiske. |
| Isolert app/control-integrasjon | `scripts/hr-control-integration-db-check.mjs`: **87 assertions PASS** over to separate PostgreSQL/PGlite-instanser. Faktiske H5b snapshot/ack og kontroll-RPC-er kjøres som service_role gjennom begge virkelige operatormoduler. Cloud/Auth/Storage er syntetiske. |
| Faktisk pinnet SDK | `scripts/hr-bootstrap-sdk-contract-check.mjs`: @vercel/blob **2.8.1**, undici **6.29.0**, syntetisk HTTP og ekstern nettverking deaktivert; missing/create-only/private/token/identity/to ferske readbacks PASS. |
| CI | Kun tillegg i PR Core Safety; ingen eksisterende kontroll fjernet, endret eller svekket. Midlertidig separat pinnet QA-runtime; ingen secrets eller apppakkeendring. |

Integrasjon prøver faktisk minimal snapshot → signert syntetisk skyunion → separat kontroll-DB-commit/read → faktisk service-only DB-ack. Ack alene gir ikke complete før SQL-filjobb er fullført; filjobbsuksess er uttrykkelig en fixture, **ikke ekte fysisk Storage-purge**. Senere lavere UUID fanges av full snapshot. Tapt respons etter syntetisk skyskriv, faktisk kontroll-commit og faktisk app-ack nekter success og beholder den faktiske SQL-låsen; neste kjøring kan ikke skrive på nytt. Privat kildeport forblir stengt.

Første integrasjonsforsøk feilet på fixture-filbane med SQLSTATE **23514 / purge_objects_object_path_check**, før cycle/ack. Det forsøket er FAIL. Testfilbanens siste del ble rettet fra synthetic.pdf til UUID i samsvar med eksisterende SQL-kontrakt. Ingen appmigrasjon, validator eller assertion ble svekket. Senere full kjøring bestod 87 kontroller.

## Etterkontroll og bevisgrenser

Alle fire nye installerte funksjonskropper har MD5 identisk med kilden, tomt search_path og forventet ACL. Private helper er SECURITY INVOKER uten klient-/service-execute; tre offentlige nødvendige SECURITY DEFINER-RPC-er er bare service_role. Eksisterende RLS/privat tabelladgang beholdes. Live Security Advisor: **ingen WARN/ERROR**, bare tidligere tilsiktet INFO om RLS uten policy for deny-all checkpoint-tabellen ([forklaring](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)). Live etterkontroll **0 checkpoints / 0 enabled / 0 locks**.

Full lokal Sandbox critical/build PASS; eksisterende 21 control-cycle-scenarioer beholdt PASS. Gjeldende ni-trinns ekte sky-PASS og 233 native restore-PASS beholdes uten ny manuell skytest eller ny native restore. Nye prøver gir **ikke faktisk Edge/kilde/control/Blob/ack-integrasjon, varig bootstrap/signeringsnøkkel/produksjonsanker, scheduler, managed-cloud restore eller innlogget browser-PASS**. Ikke legg sammen disse separate bevisene til et ubetinget ende-til-ende-PASS.

Remote main **c3d873e0**, demo **11f1b45d**, tidligere READY-deploys og privat HR-stenging er verifisert. PR #217 forblir draft/ikke merged. Production har ingen H5b ack-tabell, Sandbox ledger disabled. Nettleserens credential-stopp beholdes. Ingen e-post sendt eller kostnadsressurs opprettet. Den ene kjente syntetiske Blob-restfilen er fortsatt separat opprydding.

## Neste konkrete arbeid

1. Pakk faktisk isolert worker for bootstrap og H5b source/control/Blob/ack. Sørg for sikker permanent nøkkelprovisionering, nøyaktig isolert kilde og ingen gjenbruk av testanker i Production. De eksisterende Blob-/servernøkkelverdiene skal ikke hentes eller roteres.
2. Prøv ekte native/skytransport og ukjent resultat/fencing/recovery med appporten fortsatt stengt. Nåværende kilde-ack har ikke fencing-token; ingen automatisk unlock/overtakelse tillates.
3. Etabler scheduler og varsling først etter faktisk integrasjonsbevis. Ingen permanent kursjobb.
4. Utfør managed-cloud restore på separat syntetisk kilde/mål med komplett relevant appgrunnlag og Storage-bytes. Ingen aktiv Production/Sandbox/control-restore. Ekstra betalt ressurs har ikke konkret kontopris/godkjenning; ikke opprett den på grunnlag av generell dokumentasjonspris.

Supabase-changelog ble kontrollert via HTML etter markdown-endepunktets unsupported content-type; nyeste relevante PostgreSQL-/API-endringer gir ingen endring i checkpoint-kontrakten. Gjeldende offisiell dokumentasjon bekrefter sb_secret på apikey; klienten er ikke en browserinnloggingsomvei. Ingen ekstra credential-/innloggingshandling er utført.
