# B/C-sluttkontroll og drift – 9. oktober 2026

## Scope og grunnlag

Miljømål **BEGGE**, levering bare feature/Preview. Baseline: remote feature `8a29c244ff58d008d84aaa636e9b4eb058bace67`, tree `43096499232c4e903189715241421afe2a8e23d6`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Lokal tree var identisk og ren. Draft PR #216 hadde 265 endrede filer mot main før denne runden.

Scope er dette notatet, CAPACITY, EMAIL_SETUP, OVERSIKT, PLAN, QA, CONTINUITY, USER_TEST, rotens CURRENT_RELEASE_STATUS og README. Bare dokumentasjon. Sandbox-kontrollene er lesende og returnerer tall, planer og tilgangsmetadata. Ingen appkode, migrasjon, køendring, utsending, Production eller main/demo-merge.

## Resultat

Den planlagte samlede B/C-utviklergjennomgangen er gjennomført. Underskjema, kildeoppdatering, ti-gruppe PDF/ZIP og påminnelser for alle seks varseltyper er levert i feature/Sandbox. Det er ikke funnet et nytt funksjonsgap som begrunner en ny runde med de samme brukertestene. Hele KS/HMS eller Production-release er ikke erklært ferdig.

| Område | Bevis som beholdes | Rest før release / større utrulling |
|---|---|---|
| B – utførelse, roller og ansvar | Samlet 45-assertions Sandbox-RPC-prøve, faktiske React-flyter, tidligere TEST OK for prosjekt/vernerunde/risiko/SJA/RUH og bilder. | Faktiske private filer, mobilkamera og separate samtidige innloggede økter. SQL-rollebytte er ikke browser-samtidighet. |
| C – oppgaver og påminnelser | Opprinnelige varsler 36 PASS, avvikspåminnelser 37 PASS, håndbokrevisjon 36 PASS, øvrige oppgavepåminnelser 41 ulike assertions PASS; React-flyter og full critical/build PASS på funksjonsleveransen. | Ekte transport og mottak, beskyttet lenke, retry/revokering og kontrollert Production-aktivering. |
| C – eksport og kildeoppdatering | Kombinert PDF 26 sider / 25 uten rutine, ZIP 13 filer + manifest, innholds-/CRC-/hashkontroll og visuell PDF-kontroll. Kildeoppdatering har egne SQL-/React-bevis. | Eksportprøven bruker syntetisk filtransport. HR/opplæringsbevis og ansattes lesebekreftelser inngår ikke i samlet uttrekk. |
| E – drift og kapasitet | Ny lesende måling, faktiske indekser, RLS og avgrensede SQL-planer nedenfor. | Representativ isolert belastningstest, fil-/egress-/ressursmålinger og gjenopprettingsprøve før større utrulling. |

Dette er videreføring av [tidligere B/C-review](BC_REVIEW_20261009.md), [revisjonspåminnelser](REVIEW_REMINDERS_20261009.md) og [oppgavepåminnelser](TASK_REMINDERS_20261009.md). Historiske bevis gjelder tidspunktet og funksjonsheaden i hvert notat. De kalles ikke nye tester av dokumentasjonsendringen.

## Lesende Sandbox-måling

Målt 9. oktober kl. 18:09 UTC / 20:09 Oslo i `ppvircenkjizeiqdxphj`; senere kontroll samme runde. Databasens størrelse varierer over tid. Størrelser for tabeller inkluderer indekser/TOAST og kan inkludere plass fra tilbakerullede tester; de er ikke levende innholdsvolum eller Storage-filbytes.

| Måling | Observert |
|---|---:|
| Hele database, første måling | 30 108 819 byte |
| KS-tabeller og private KS-tabeller, senere måling | 3 858 432 byte |
| Offentlige KS-tabeller med RLS | 20 av 20 |
| Databaseforbindelser ved målepunkt / konfigurert maks | 15 / 60 |
| Rutiner / publiserte utgaver / tildelinger / bekreftelser | 73 / 10 / 40 / 0 |
| Serialisert JSON for de ti utgaver, uten RPC-konvolutt | 19 928 byte |
| Kø, pending reading / deviation assignment | 40 / 8 |
| Kø, sending / failed | 0 / 0 |
| Eldste pending, målepunkt | 53,2 timer |
| Worker / cron | disabled / aktiv hvert minutt |
| Siste migrasjon | 20261009171349 |

Køalderen er forventet når transporten er bevisst avslått; den er ikke målt leveringsforsinkelse med aktiv worker. Køen er beholdt. Før aktivering må gamle tildelinger vurderes med fersk tilgang-/ansvarskontroll og avklart mottakeromfang. Sandbox-kø skal ikke kopieres til Production.

`email_worker_settings` er privat: SELECT er avslått for anon, authenticated og service_role. Privat konfigurasjon leses av avgrensede worker-RPC-er. `kshms-private` er privat; eksisterende `project-images` er offentlig og uendret. Dette er metadata, ikke et bevis på faktisk innlogget filnedlasting. Individuell HR skal ikke bruke offentlig bucket.

## Avgrenset queryanalyse

Tre lesende komponentqueries ble kjørt med `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`, read-only transaksjon og lokal 3-sekunders timeout. Firma ble valgt inne i SQL; ingen dokumentinnhold, adresser eller tokens ble returnert. Ingen worker-funksjon ble kalt og ingen køpost reservert.

| Komponent | SQL execution time | Plan / begrensning |
|---|---:|---|
| Samle versjons-JSON for ett firma | 0,480 ms | Firmaindeks; bare ti utgaver. Ikke hele kshms_get_state med identiteter/rollelogikk. |
| Risiko-liste, firma/kind, sortering, limit 101 | 0,482 ms | Firma/kind/updated-indeks og incremental sort. Null risikorader i valgt firma; dette beviser ikke lastkapasitet. |
| Eldste tilgjengelige kø-ID, limit 1 | 0,158 ms | Sequential scan på 48 rader og top-N sort; pending-indeks finnes. Ingen FOR UPDATE, validate eller ekstern transport. |

Dette er enkeltmålinger av SQL på et lite datasett, uten HTTP, nettleser, samtidighet eller providerlatens. Ingen p95 eller kapasitet for 100 firmaer er målt. En sequential scan på 48 rader er ikke i seg selv en feil og gir ikke grunn til en uprøvd indeksendring.

Faktisk indeksmetadata bekrefter firma/bruker på tildeling og bekreftelse, firma/rutine/nummer på utgaver, firma/status/tid på avvik, firma/kind/tid på utførelser, pending-køindeks og de separate unike assignment-/reminder-indeksene. Ingen indeks, RLS eller autorisasjon er endret.

## Konkrete vekstpunkter

1. **Håndbok og malhistorikk:** både live `kshms_get_state` og `kshms_checklist_state` er uten LIMIT og samler historikk. Før større utrulling: smal aktuell oversikt, historikk ved behov og stabil paginering uten å skjule pliktige oppgaver. Avvik og utførelser har allerede begrenset/paginert lesing; dette skal bevares.
2. **Store eksporter:** PDF/ZIP bygges i klienten. Eksportkontrakten er testet; minne, store filer og samtidighet er ikke lasttestet. Ved behov flyttes store uttrekk til avgrenset jobb med fersk tilgang ved kjøring og henting.
3. **E-postkø:** worker-koden forsøker høyst 20 poster per invokasjon og starter ikke ny iterasjon etter 40 sekunder. Det er en arbeidsgrense, ikke en hard totalvarighet eller målt sendekapasitet. Provider-/RPC-latens, retry og overlapp må måles når transport testes.

[CAPACITY](CAPACITY.md) beholder det isolerte 100-firma-scenarioet og foreslåtte mål. Det er en plan, ikke et resultat. Ingen belastning kjøres mot Production eller aktive Sandbox-fixtures. Compute-plan, p95/p99, CPU/minne/IO, Storage/egress og restore er ikke fastslått av denne kontrollen.

## Fortsettelse og release

Neste utviklingspunkt er HR-fundamentet etter [avklart HR-scope](HR_SCOPE_20261008.md): ansatte/lederrelasjoner, egne tilganger, eksplisitt ekstra leser, private filer og full sletting før sensitivt innhold. KS/HMS/systemadmin-rolle skal ikke automatisk gi individuell HR-innsyn. B/C-releasebevis og kapasitetsarbeid følges opp som konkrete egne punkter; gjennomgangen starter ikke på nytt ved neste «kjør».

Tidligere TEST OK beholdes. Ingen ny obligatorisk Kenneth-prøve i denne dokumentasjonsrunden. Skynett-runtime har kjent credential-state-feil; ingen ny browser-PASS påstås. Når runtime virker, bruk én fane og lukk popup. Den ene autoriserte testmailen til Kenneth er **ikke sendt**.

Ved senere godkjent Production-release skal KS/HMS-e-post **aktiveres og mottak verifiseres**, med eksisterende Resend og riktig app-origin. [EMAIL_SETUP](EMAIL_SETUP.md) har den konkrete rekkefølgen. Production-release, main → demo og full pilot krever egne relevante beslutninger/bevis; grønn CI er ikke mergegodkjenning.
