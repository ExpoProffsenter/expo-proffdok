# Gjeldende release-status – Fase 45B

## Nyeste status – Systemadmin-utsending på e-post (28.09.2026)

- Funksjonsbranch: `fase45b-systemadmin-broadcast-email`, head før denne dokumentasjonsoppdateringen `8fc656defdb762bd9171135b791b035789baafc4`.
- PR #194 er `open`, `draft`, mergebar og ikke merget. Base er Production-`main` `4f016ce35b2d22c9edcd30cddc1aaa3b38d715a3`.
- Production-kode, Production-deployment og Production-Supabase er urørt av denne funksjonen.
- Verifisert Vercel Preview/Sandbox: `dpl_qXYzVo7AZKD2nusPGda4P2ivHmVj`, `READY`, med alias `expo-proffdok-git-fase45b-systemadmin-broadcast-email-ringside.vercel.app`.
- Supabase-migrasjonene og Edge Functions `systemadmin-broadcast-email` og `marketing-email-unsubscribe` er lagt kun i permanent `demo-sandbox` (`ppvircenkjizeiqdxphj`).
- Systemadmin velger mottakergruppe ved hver utsending og må velge eksplisitt mellom driftsmelding og samtykkebasert markedsføring. Mottakerkontroll og test til innlogget administrator kreves før gruppeutsending.
- Faktisk innlogget Sandbox-kontroll fant 1 kvalifisert mottaker for driftsmelding til aktive, godkjente brukere. Markedsføringskontrollen fant 0 kvalifiserte og utelukket 1 bruker uten samtykke.
- Sandbox har 0 markedsføringssamtykker og 0 kampanjelogger. Ingen e-post er sendt, og ingen brukers samtykke er endret.
- Målrettet kritisk test, full critical-suite, `git diff --check` og Sandbox-bundet build er grønne. Sendernavn, HTML-escaping, mottakerisolasjon, idempotens, avmelding, RLS og ACL er kontrollert.
- Gjenstående live-steg er én faktisk test-e-post til innlogget Sandbox-systemadmin. Det krever eksplisitt bekreftelse på handlingstidspunktet. PR #194 skal forbli draft og umerget; ingen Production-deploy uten ny uttrykkelig godkjenning.

Resten av dokumentet under er historisk Fase 45B-status og beholdes som revisjonsspor.


Dato: 28.09.2026. Kode, backend og live system er fasit. Dokumentet skiller mellom godkjent Production-release og den fortsatt umergede QA-hotfixen i PR #191.

## Kort status

- Gjeldende Production-release fra PR #190 er fortsatt uendret og operativ.
- Hotfixen i PR #191 er ferdig testet i faktisk Preview/Sandbox fra forespørsel til låst prosjekt med garantidokument. I tillegg er Systemadmin-tilgangsflaten kontrollert og rettet slik at gammel UI ikke kan beholde et foreldet tilgangsbilde etter en fullført skriving.
- PR #191 skal fortsatt være draft og skal ikke merges eller deployes til Production uten Kenneths nye uttrykkelige godkjenning. Godkjenningen som ble gitt for PR #190 kan ikke gjenbrukes.
- Permanent `demo`-branch er beholdt. Sandbox-databasen har fått tre avgrensede parity-migrasjoner og syntetiske QA-data; ingen Production-data eller Production-databaseobjekter er skrevet i denne runden.

## GitHub og Vercel

- Production `main`: `517086b30a3bbfe14025bf9cda4faa2490d9c9a1`, merge-commit fra PR #190.
- Vercel Production: `dpl_DVnRrEqpNbv1sTpjSZQQF1sceoNd`, `READY`, `target=production`, med samme commit og aliasene `expo-proffdok.app` / `www.expo-proffdok.app`.
- PR #190: lukket og merget 27.09.2026 kl. 22:38:52 UTC etter Kenneths uttrykkelige `PRODUCTION GODKJENT`.
- Release-branchen `fase45b-production-release-clean` finnes ikke lenger på GitHub. Resultatet er bevart i merge-commit på `main` og PR #190.
- Hotfix-branch: `fase45b-production-qa-hotfix`.
- PR #191: `open`, fortsatt draft og ikke merget, base `main`.
- Siste funksjonsbærende GitHub-head: `2ad6290aa8939480192d654a9810a3f0fd03e349` (`refactor: remove timed managed-access reloads`). Den bygger på `4d79caff8a6f429d5fb0426de2e17b93c426913c` (`fix: refresh managed access after completed writes`). Etterfølgende commits oppdaterer bare hjelp og release-status.
- GitHub `PR Core Safety` for denne funksjonskoden: run `36427714589`, run 132, `completed/success`.
- Vercel commit-status: `success`.
- Verifisert funksjons-Preview: `dpl_9EAb14f6YoG4U8FbhVgeb9LM7XuY`, `READY`, `target=null`, commit `2ad6290…`, alias `expo-proffdok-git-fase45b-production-qa-hotfix-ringside.vercel.app`. Senere dokumentasjonsdeploy har identisk funksjonskode.

## Supabase og miljøisolasjon

- Production/default: `dqffxflaoyarbxyiyhop`.
- Permanent `demo-sandbox`: `ppvircenkjizeiqdxphj`.
- Supabase viser kun disse to miljøene. Begge har runtime-status `ACTIVE_HEALTHY`. Kontrollplanstatusen `MIGRATIONS_FAILED` på demo-sandbox stammer fra den opprinnelige branchopprettelsen og beskriver ikke dagens runtime.
- Production ble bare lest under denne kontrollen. Production har allerede de samme autoritative funksjonene og triggerne som Sandbox nå bruker for prosjekt-scope, garantiutstedelse og prosjektlås.
- Følgende idempotente parity-migrasjoner er lagt på hotfix-branchen og kjørt kun i Sandbox:
  - `20260928103600_restore_project_company_scope_trigger.sql`
  - `20260928113600_restore_warranty_registry_scope_triggers.sql`
  - `20260928114200_restore_set_project_lock_rpc.sql`
- Sandbox har verifisert `projects_sync_company_scope_id`, begge garantitriggere og funksjonene `sync_project_company_scope_id`, `sync_warranty_registry_company_scope`, `project_data_has_signed_contract`, `enforce_warranty_signed_contract_before_issue` og `set_project_lock`.
- De nye `SECURITY DEFINER`-funksjonene har fast `search_path`. Triggerfunksjonene for scope kan bare kjøres av `service_role`; `set_project_lock` kan kjøres av innlogget bruker og `service_role`, men ikke `anon`, og håndhever selv prosjekttilgang.

## Gjennomført Production-QA på PR #190-releasen

Før hotfixarbeidet ble QA-prosjektet `PRODUCTION QA FASE45B – bad og garanti` (`QA-45B-20260928`) ført gjennom den reelle Production-flyten med syntetiske identiteter:

- Forespørsel, befaring og badskisse ble fullført.
- Et våtromstilbud med 12 seksjoner, 17 linjer og 30 opsjoner ble publisert og akseptert. Kontrollert totalsum var 463 663 kr inkl. mva.
- Akseptbevis, prosjekt og signert Expo-forbrukerkontrakt ble opprettet.
- Prosjektering, 11 fremdriftsoperasjoner, åtte Sopro-produkter, overflater/innredning og Fag/utstyr ble registrert.
- 64 av 64 ordinære kontroller og 14 av 14 Sopro-garantipunkter ble fullført uten åpne avvik.
- Overtagelsen ble signert av syntetisk utførende og kunde.
- 10 års garanti `EPD-26-HCVY6U`, gyldig til 2036-09-28, ble utstedt for Sopro AEB 815 / SINTEF TG 20918.
- Komplett PDF på 22 A4-sider ble lastet ned og kontrollert visuelt side for side.
- Prosjektet ble låst 28.09.2026 kl. 00:40:18 UTC. Databasekontrollen viste `locked=true`, prosjektstatus `locked`, mottatte garantivilkår og registrert rapportfil/tidspunkt.
- Ingen reell kundeadresse ble brukt. Ferdigmeldingskallet traff kun en syntetisk `example.invalid`-adresse.

## Faktisk Sandbox-E2E på hotfixen

Syntetisk testgrunnlag:

- Forespørsel: `F-2026-0042`.
- Prosjekt-ID: `fd2c4792-418a-4bb0-9ca7-46cd25c82a5c`.
- Prosjekt: `QA FASE45B – kontrakt fra prosjekt – IKKE REELL`.
- Kunde: `QA TESTKUNDE – IKKE REELL`.
- Akseptert tilbud: 198 413 kr inkl. mva., inkludert valgt opsjon `Ekstra spot` på 3 000 kr.

Gjennomført i faktisk, innlogget Preview/Sandbox-app:

1. Forespørsel ble opprettet.
2. Befaring ble gjennomført, inkludert badskisse.
3. Tilbud ble laget, publisert og akseptert med valgt opsjon.
4. Akseptbevis ble opprettet og prosjektet aktivert.
5. Avtalegrunnlag viste tydelig `Kontrakt fra prosjektet`; Expo-kontrakt ble opprettet og signert direkte fra Prosjekt uten retur til Sales.
6. Kundevisningen åpnet nøyaktig én ny fane og ble lukket etter kontroll. Dette er ønsket UX.
7. Prosjektet inneholder nøyaktig to avtalefiler i tilbudsgrunnlaget: akseptbevis og signert kontrakt, begge med aktør `Kenneth Demo`.
8. Sjekklisten har 38 av 38 vurderte punkter, hvorav 14 av 14 er Sopro-garantipunkter. Ingen åpne avvik.
9. Sluttbefaring/overtagelse ble registrert 28.09.2026 og signert av `Kenneth Demo` og `QA TESTKUNDE – IKKE REELL`.
10. Sopro AEB 815 / SINTEF TG 20918 og 15 års garanti ble valgt.
11. Garantien ble utstedt som `EPD-26-TU4MTC`, status `Gyldig`, gyldig til 2041-09-28.
12. Komplett PDF ble generert i appen. Prosjektdata har `reportGeneratedAt=2026-09-28T11:37:31.235Z` og filnavnet `QA FASE45B – kontrakt fra prosjekt – IKKE REELL.pdf`. Nettleserautomatiseringen fikk ikke en pålitelig lokal filsti fra nedlastingshendelsen, så denne Sandbox-filen er ikke hevdet kontrollert side for side.
13. Prosjektet ble låst 28.09.2026 kl. 11:43:59 UTC av `demo@expo-proffdok.no`. Database og app viser `locked=true`, prosjektstatus `locked`, registrert overtagelse og arkivert garanti.
14. Ferdigmeldingsprompten ble avvist; ingen ekstern kunde-e-post ble sendt.

## Feil funnet og rettet i PR #191

- Prosjektoversikten viser korrekt akseptert sum inkl. mva.
- Forrige/Neste-etiketter og mål gjenopprettes riktig ved fanebytte.
- Garantivilkår og rapporttidspunkt bruker samme effektive sluttstatus som appen.
- Nye kontraktdokumenter og Fag/utstyr-poster får autentisert aktør.
- Den dupliserte slutt-låsepopupen er fjernet. Nødvendige bekreftelses-popupvinduer beholdes, slik Kenneth har ønsket.
- Ordinære prosjekter aktivert fra akseptert tilbud kan opprette kontrakt direkte fra Avtalegrunnlag. Expo-kontrakt, egen opplastet kontrakt og ingen kontrakt er fortsatt tre gyldige valg.
- Bare den reelle Sales-arbeidsflaten får Sales recovery-markør; prosjektets gjenbrukte kontraktveiviser sender ikke brukeren tilbake til Tilbud etter refresh.
- Autoarkivering hopper over byte-lik prosjektsynk når sluttfilen allerede matcher på kontrakt-ID, path eller URL.
- Prosjektautolagring sammenligner kanonisk JSON med stabil nøkkelrekkefølge, hopper over reelle no-op-lagringer og flytter ikke `updated_at` ved ren visning.
- Etter vellykket autolagring nullstilles dirty-status og lokal kladd bare dersom snapshotet fortsatt er gjeldende. Nyere endringer som kom mens lagringen pågikk, forblir markert som ulagret.
- Faktisk Preview-reload ga `Ingen endringer å lagre`, uendret database-`updated_at` og ingen unødvendig popup.
- Den generelle knappen `Opprett tilbud` fanges ikke lenger av Befaring → tilbud-dialogen; de tre reelle befaringsknappene beholder sin eksplisitte markør.
- Systemadmin viser modultilgangen som `Generelle tilbud / Proff vareregister`. `Enkel ordre` er fortsatt riktig navn på videreføringen som velges først etter aksept, men er ikke lenger feilaktig brukt som navn på selve modultilgangen.
- Leverandør-, modul-, prisinnsyn-, firma-, rolle- og brukerstatusendringer sender ett felles oppdateringssignal først etter bekreftet serverskriving og ny serverlesing. Alle tilgangsprojeksjonene køer en ny lesing dersom en eldre lesing fortsatt pågår, slik at et gammelt svar ikke kan vinne.
- Fire gamle 450–500 ms klikk-/change-reloads og én 250 ms refresh ble fjernet fra den samme tilgangsklyngen. De kunne gjette for tidlig og ga ekstra RPC-kall.

## Audit av gammel UI mot nye funksjoner

- 33 kildefiler bruker `MutationObserver`; 26 av dem inneholder også skjuling, deaktivering eller fjerning av elementer. Dette er et søkesignal, ikke 26 feil: de fleste er avgrensede presentasjonsadaptere med eksplisitte markører eller eksisterende kritiske tester.
- Én reell risikoklynge ble funnet: flere Systemadmin-/Firmaadmin-projeksjoner leste `list_managed_module_access` uavhengig og forsøkte å oppdatere seg via fokus eller faste tidsforsinkelser. Denne klyngen er nå samlet rundt det serverbekreftede ferdigsignalet.
- To tidligere kollisjoner mellom gammel og ny UI i Sales er allerede rettet og beholdes i kritiske tester: generell `Opprett tilbud` skal ikke åpne Befaring-dialogen, og gammel DOM-skjuling skal ikke fjerne `Aktiver som prosjekt` fra et akseptert Generelt tilbud.
- Konklusjon: Det finnes mange legacy-adaptere, men auditen fant ikke mange uavhengige tilfeller der gammel UI fortsatt blokkerer ny funksjon. Den vesentlige gjenværende klyngen var tilgangsrefreshen, og den er rettet.

## Dokumentasjon og malbilder

- Root README, hovedarkitektur, Sales README og relevant Hjelp er oppdatert for prosjektkontrakt, Sales recovery, rekkefølgen overtagelse → garanti → PDF → låsing og autolagringsvernene.
- Brukerhjelpen inneholder ikke interne formuleringer om Storage-/HTTPS-adresser eller nettoprisvern.
- Bilder på tilbudsposter og opsjoner følger firmamalen når bildet har en varig `https:`- eller trygg rot-relativ app-/Storage-URL. Bildenavn bevares.
- Midlertidige `data:`/`blob:`-bilder og kundespesifikke PDF-vedlegg fjernes bevisst fra maldata. Eldre maler uten bildepeker må lagres på nytt fra et tilbud som fortsatt har bildet.
- Atferden er dekket av `critical-store-template-check.mjs` for både ordinær tilbudsmal og komplett Generelt tilbud-mal.

## Verifisering

- `npm run check:critical`: PASS etter alle kode- og migrasjonsendringer.
- Production-bundet dry build: PASS og eksplisitt `Production Supabase only`.
- Sandbox-bundet build: PASS og eksplisitt `Sandbox Supabase only`.
- `git diff --check`: PASS.
- `critical-project-contract-entry-check.mjs`: PASS, inkludert kontraktinngang og garantiparity.
- `critical-work-profile-check.mjs`: PASS, inkludert prosjekt-scope-trigger og låse-RPC.
- Autentisert Browser-kontroll etter låsing viser `Ferdigstilt`, garanti `EPD-26-TU4MTC`, `Gyldig`, 14/14 garantipunkter og `Komplett PDF generert`.
- Autentisert Browser-kontroll av Preview `2ad6290…` lastet bundle `main-DV3aRxAm.js`. Systemadmin viser én `Generelle tilbud`-kontroll og ingen gammel `Enkel ordre / Proff vareregister`-kontroll. `Proffkunde Demo AS` viser fire aktive leverandører og riktig hjelpetekst.
- Den deployede Preview-bundelen inneholder Sandbox-ref `ppvircenkjizeiqdxphj` og ikke Production-ref `dqffxflaoyarbxyiyhop` i Supabase-klientchunkene.
- Production-deployment og `main` står fortsatt på PR #190-release; hotfixen er bare Preview/Sandbox.

## Åpne restpunkter

- Fysisk mobiltest på minst én iOS- eller Android-enhet gjenstår. Automatiske tester for mobil shell, tilgang, app-/fanebytte og portalopprydding er grønne, men erstatter ikke fysisk enhet.
- `warranty_registry.pdf_generated` står fortsatt `false`, mens prosjektets autoritative `warranty.reportGeneratedAt` og appen viser at komplett PDF er generert. Feltet leses ikke av dagens app og påvirker ikke garantidokumentet, men metadataen bør enten synkroniseres gjennom en avgrenset, tilgangskontrollert backend-flyt eller tydelig avvikles i en egen oppgave.
- `public.demo_sandbox_snapshots` har RLS deaktivert, men verken `anon` eller `authenticated` har SELECT/INSERT. Det er ikke en offentlig lesbar tabell, men RLS bør aktiveres som defense-in-depth i en separat Sandbox-hardening.
- Supabase Advisor viser flere eldre, tverrgående sikkerhets-/ytelsesvarsler som ikke ble introdusert av denne hotfixen. De må behandles som egne, planlagte sikkerhetsoppgaver; de skal ikke masseendres inne i PR #191.
- Sandbox har ingen egen brukerprofil under `Proffkunde Demo AS`. Derfor ble ikke en faktisk brukerrettighet slått av/på bare for testen. Leverandørstatus, nytt navn, serverrekkefølge og event-kø er kontrollert i live UI og kritiske tester; en senere live overgangstest bør bruke en eksplisitt seedet ekstern demo-bruker.
- Én gammel automatiseringsfane i skynettleseren svarte ikke på lukking. Den aktive QA-fanen fungerer og ingen ekstra kundetilbudsfane står åpen. Dette er et verktøy-/øktproblem, ikke en observert appfeil.
- Syntetisk QA-prosjekt, forespørsel og tilhørende tilbud beholdes inntil Kenneth bekrefter sletting på selve handlingstidspunktet.

## Neste handling

1. Hold PR #191 som draft og umerget. Ingen Production-deploy uten Kenneths nye uttrykkelige godkjenning for akkurat denne hotfixen.
2. Gjennomfør kort fysisk mobiltest før en eventuell merge.
3. Opprett eventuelt en eksplisitt ekstern Sandbox-demo-bruker dersom leverandør → brukercheckbox-overgangen skal repeteres manuelt uten å endre eksisterende systemadmin.
4. Etter godkjent hotfix, merge og ny Production-QA: be om bekreftelse før syntetiske QA-data slettes.
5. Når hele releasen og Production-QA er avsluttet: minn om opprydding av gamle GitHub-brancher. Sluttbildet skal være `main` + permanent `demo`, og Supabase skal fortsatt bare ha Production/default + `demo-sandbox`.
