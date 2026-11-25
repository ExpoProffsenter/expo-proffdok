## Oppdatert leveranse: tilgangsvalg før invitasjon

Kenneth ba 15.10 kl. 14:40 også om å velge tilganger i selve invitasjonen og bekrefte vanlig proffkundes firmagrense. Samme BEGGE-scope/Preview/PR #249. `company_admin_invite_with_access` validerer gjeldende manager, aktivt firma, firmaavtale og inviterens hovedmoduler før eksisterende invitasjons-RPC kalles. Valgene lagres i privat RLS-tabell uten klientgrants og vises på invitasjonsraden gjennom autorisert snapshot.

Ny konto får eksakte valgte hovedmoduler og firmaets valgte People-grants i samme transaksjon som invitasjonsaksepten. Uvalgt Projects blir ikke hengende igjen fra tidligere approval-seeding. Nye valg for eksisterende konto endrer People-tilgang i valgt firma; eksisterende hovedmoduler, primærfirma og historikk beholdes og dette forklares i skjemaet. Firmaadmin arver lisensierte People-moduler gjennom rollen. Ingen personlig HR-lesetilgang eller medarbeideropplysning opprettes. Ansvarligvern og avsluttet arbeidsforhold beholdes.

Privat aksept-trigger låser riktig invitasjon og rettighetsrad, sammenligner lagret inviter/e-post/firma/rolle/opprettelsestid, og gjenkontrollerer aktiv inviterende manager, gjeldende delegerbare moduler og firmaets lisenser. Falske/tilbakekalte/lisensløse valg stopper hele aksepten uten delvis godkjenning. Applied-markør hindrer gjentatt innlogging fra å overstyre senere tilgangsendringer. Resending erstatter gamle valg i samme transaksjon. Gamle invitasjoner uten valg følger eksisterende aksept. `accept_company_user_invite`, eksisterende hovedmodul-/People-RPC-er og eksisterende policies er uendret i denne oppfølgingen.

QA: **72 PostgreSQL**-assertions (39 tidligere + 33 nye), **31 Chromium**-assertions (22 tidligere + 9 nye) og full critical/build består. Nye scenarioer i `company-invitation-db-check.mjs` importeres av eksisterende Firmaadmin-CI-test. Ny registrering/eksakte moduler, bevaring av eksisterende konto, frakoblet lisens og endret inviterrett ved aksept, ansvarlig/avsluttet arbeidsforhold, resending, private ACL og ordinær proffkunde mot fremmed firma/arbeidsprofil er dekket. Faktisk `company-invitation-sandbox-check.sql` består med `clean=true`, random auth.users/profil/aksept/grants og alle data rullet tilbake; ingen mail. 320/390/1280 har ingen horisontal overflow, og mobilskjemaet er sett visuelt.

Før særskilt Sandbox-reparasjon beholdt invitasjonsmigrasjonen alle 319 øvrige public-funksjoner byteidentisk (`fb26326702e264ecea4f5139b0831dac`); bare firma-snapshot ble utvidet og ett nytt public-endepunkt lagt til. Security-advisors kontrollert: ny privat RLS-tabell uten klientpolicies/grants og tilsiktet autentisert, internt autorisert SECURITY DEFINER-endepunkt. Ingen anon-grants.

Den faktiske proffprøven fant en **allerede eksisterende avvikende Sandbox-baseline**: demoens set_active_work_profile manglet medlemskapskontroll, current_active_company_scope_id brukte usjekket valg, get_my_work_profile_state projiserte alle ordinære firmaroller som firmaadmin, og set_managed_work_profiles manglet. Production ble lest og hadde riktige sperrer. Bare Sandbox er gjenopprettet fra repoets eksisterende 20260910161200 og 20260910152200 gjennom `company-workspace-sandbox-restore.sql`. Ingen firma-/medlemskaps-/kursdata ble endret av reparasjonen. Full faktisk nyregistrering og proffkundes avslag på fremmed firma, intern firmabytte og egen tildeling består etter reparasjonen. Dette er Sandbox-vedlikehold, ikke en ny Production-migrasjon eller svekkelse av grensene.

Supabase apply_migration svarte to ganger Invalid/expired requestState uten installert objekt eller historikk (verifisert før neste forsøk). Den eksakte prøvde DDL-en ble derfor installert gjennom ferdighetens execute_sql-fallback i én transaksjon med kort lock_timeout, eksakt CLI-versjon `20261015124223`, historikk og schema-reload. Ingen delvis/ukjent installasjon ble gjenforsøkt.

Prøv samme Preview: Firmaadmin → Legg til ansatt → kontroller rolle og Tilganger ved invitasjon. Velg ønskede moduler før en faktisk ønsket invitasjon. Vanlig proffkunde får teksten «Du administrerer bare ditt eget firma». Tidligere TEST OK for andre funksjoner dekker ikke denne nye delen. Production og permanent demo er uendret; gjeldende head/READY/CI føres i PR #249.

---

# Aktivt firma og samlet Firmaadmin

Miljømål **BEGGE**, fra main `143d78cec139eb79b8adc941210d31c501a43baf`, branch `fix-company-admin-scope-20261015`. Kenneth ba 15. oktober om retting av Ringside-tekst ved administrasjon av Bademiljø Expo og samlet valg av tilganger. Tidligere TEST OK for timer/varetelling dekker ikke denne endringen.

## Årsak og kontrakt

Legacy Firmaadmin brukte `profiles.company_name`/primærfirma både til liste, invitasjon, rolle og status. Systemadmin kunne representere et annet firma samtidig. Det separate modul-panelet ble dessuten bare montert under Systemadmin når kontoen hadde systemrolle.

Ny CompanyAdminPanel erstatter bare Firmaadmin-rendereren. Ingen main/bootstrap-, salgs-, navigasjons-, garanti-, e-postworker-, RLS-policy- eller HR-dokumentendring. Gamle hovedmodul-, pris- og PeopleModuleAccess-RPC-er beholdes. Samme UserAccessRow gjenbrukes med uttrykkelig firma for PeopleModuleAccess og rolle ved kortets topp. Den separate DOM-modulflaten monteres ikke i den nye Firmaadmin-flaten. Systemadmin beholder sin eksisterende samlede seksjon.

Nye firma-RPC-er bruker serverens aktive firma og forventet company_id ved alle mutasjoner. Eksisterende require_module_manager verifiserer aktiv konto, systemrolle eller faktisk firmaadmin-medlemskap. Anon er avvist og den private helper-skjemaet er utilgjengelig for klientroller. Ingen brukerredigerbare JWT-rolleclaims brukes.

- Liste og invitasjon gjelder aktivt firma. Ekstra firmamedlemmer vises med primærfirma separat. Fornyede lesinger sperrer handlinger; bytte av firma/aktør og tilbakekalt tilgang skjuler gamle kontroller. Gamle svar forkastes med revisjonsnummer.
- Rolleendring bruker forventet gammel rolle. Egen rolle/systemadmin kan ikke endres her. Primærrolle bruker gammel profiles-guard og medlemskapssynk. Ekstra firmarolle endrer bare det aktuelle medlemskapet. En sekundær firmaadmin kan ikke endre en primærrolle som gammel profiles-guard ikke tillater; kontrollen er da deaktivert.
- Hovedmoduler gjelder brukerkontoen og vises som dette. Eksisterende firmastyrte Generelle tilbud/Befaring-lås og egen hovedmodultilgang beholdes. En sekundær firmaadmin får ikke utvidet hovedmodul- eller prisrettighet til andre primærfirmaer.
- KS/HMS og HR bruker valgt company_id, også på delte ansatte. Firmaets lisens, CAS, arvet firmaadmin, HR-innsyn og ansvarligvern er uendret. «Din nto pris» bruker eksisterende endpoint, bare på kort med relevant primærfirma/katalog; egen tilgang er låst.
- Kontostatus er global. Bare systemadmin tilbys knappen; bekreftelsen oppgir at handlingen gjelder alle firmaer og beholder historikk. Eksisterende profilguard tillot heller ikke vanlig firmaadmin å endre approved/deactivated.
- Nye invitasjoner beholdes i eksisterende register og aksepteres via eksisterende registreringsløp. Invitasjonsakseptens eneste endring er å gjenkontrollere også firmaadmin i riktig workspace. Deaktiverte kontoer kan ikke reaktiveres via invitasjon. Andre primærfirmaer avvises, med særskilt systemadmin-støtte for ekstra medlemskap innen den allerede definerte interne gruppen. Primærfirma, historiske tilbud/prosjekter og eksisterende medlemskap beholdes.
- Ved navneendring brukes stabil normalized_name/kanonisk profiles-firmanavn ved registrering. Nytt visningsnavn/logo brukes i brukerflaten/e-posten. Dermed opprettes ingen ny firmaidentitet pga. navneendring.
- E-post sendes bare ved bevisst Inviter ansatt for ventende ny invitasjon. Registrering og e-postkvittering skilles; feil transport gir «registrert, men e-posten ble ikke sendt». Fersk kontroll av firma/aktør og ventende invitasjon skjer før transport. Ingen ekte e-post er sendt under utviklerprøvene. Rutine-e-postsperren er urørt.

## QA

- `company-admin-db-check.mjs`: 39 reelle PostgreSQL-assertions i PGlite, med faktisk migrasjon, eksisterende profiles-guard, primærmedlemskapssynk og module-manager. Syntetiske fixtures. Scope, ordinary/system/secondary admin, anon, tilbakekalling, rolle-CAS, status-CAS, ny invitasjon/aksept og primæridentitet etter ekstra firma og visningsnavn er dekket.
- `company-admin-react-check.mjs`: 22 Chromium-assertions med faktiske React-komponenter og syntetisk API-grense. Samlet kort, rolle, hovedmodul og HR-lagring, riktig firmalogo/registreringsidentitet i e-postpayload, feil transport, scope-/aktørbytte, sene svar, tilbakekalling og 320/390/1280 uten horisontal overflow. Visuell mobilkontroll er utført. Lokal runtime Chromium 138; ingen innlogget flerbruker-/fysisk mobil- eller mottatt e-postprøve hevdes.
- Full `EXPO_BACKEND_TARGET=sandbox npm run build`/eksisterende critical-suite grønn. Relevante eksisterende PeopleModuleAccess/arbeidsfirma/firma-/invitasjons-/refresh-vern beholdes. Nye PostgreSQL- og nettlesertester legges i Core Safety CI.
- Sandbox-migrasjon er installert. Faktisk authenticated prøve: aktivt Bademiljø Expo, riktig invitasjonsprofil/logo og kanonisk firmaidentitet, ingen sending, full rollback. En ekstra arbeidsprofil-/rolleprøve viser bevart primærfirma og arvet PeopleModuleAccess etter firmaadmin-endring. En første assertion mot direkte medlemskapstabell feilet fordi RLS skjulte raden; kontrollen skal bruke autorisert snapshot/RPC, ikke antatt direkte lesetilgang.
- Alle 315 tidligere public-funksjoner unntatt den tilsiktede invitasjonsaksepten har identisk MD5 før/etter `c03dd84b5aa4be1ebdc410cac62bb040`. Ingen eksisterende policies endres. Security-advisors er kontrollert; egne funksjoner har fast search_path, auth-/scopekontroll og ingen anonyme execute-grants. Egne fire autentiserte SECURITY DEFINER-endepunkter er tilsiktet og har negative tilgangsprøver; [advisor-forklaring](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). Ingen generell opprydding i eldre funn påstås.
- Preview har branchbundet `EXPO_BACKEND_TARGET=sandbox`. Production og permanent demo er uendret. `company-admin-sandbox-check.sql` består med `clean=true`: ny invitasjon, ekstra arbeidsfirma, bevart primærfirma, arvet People-rolle, stale rolleavslag og feil-firma-avslag, full rollback.

## Kort brukerprøve i Preview

1. Velg **Bademiljø Expo** i firmavalget og åpne **Firmaadmin**. Overskrift og **Legg til ansatt i Bademiljø Expo** skal samsvare.
2. Finn en ansatt. Rolle, hovedmoduler og **KS/HMS og HR** skal stå på samme kort. Endre én ønsket tilgang, lagre med tilhørende knapp og hent oversikten på nytt.
3. Bytt til Ringside/Expo Proffsenter. Firmaoverskriften og brukerlisten skal følge valget. Delte ansatte beholder oppgitt primærfirma.

Inviter bare en faktisk ønsket bruker: Inviter ansatt er en virkelig sending i miljøer med aktiv transport. Sandbox kan fortsatt ha utilgjengelig e-posttransport, da vises dette tydelig. Ny TEST OK kreves før Production/main→demo. Publisert SHA/CI/Preview føres under når bekreftet.

Faktisk Sandbox-registrering og proffprøve etter baseline-reparasjon: `clean=true`. Permanent demo-infrastruktur **19/19** og KS/HMS-/HR-kurs **5/5** består etter reparasjonen. Ingen testkontoer/invitasjoner ble beholdt og ingen e-post ble sendt. Invitasjonsmigrasjonens historikk er registrert på eksakt CLI-versjon 20261015124223. Publiseringsbevis for gjeldende head og CI finnes i [PR #249](https://github.com/ExpoProffsenter/expo-proffdok/pull/249).
