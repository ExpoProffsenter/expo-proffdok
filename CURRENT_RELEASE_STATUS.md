## Faktiske skyprøver PASS; kontrollnøkkel må byttes manuelt – 10. oktober 2026 ca. 23:27 Europe/Oslo

Kenneth lagret HR_LEDGER_BLOB_TOKEN manuelt. Registrert navn og prosjekt **expo-hr-control / amduqhmgmeetaatwlmmt** ble kontrollert uten å lese Blob-tokenen. **hr-cloud-probe** er installert bare i kontrollprosjektet, v3 ACTIVE, bundle SHA256 **40c66c4ef33c8a1db5899c31e67a23588314a0f5b2492c28ac7030eb4e8d40b4**. Eksisterende appdatabase, ack og bootstrap er ikke koblet til. Supabases dokumenterte default server-secret på apikey kontrolleres med konstant-tid-sammenligning før skyoperasjoner; verify_jwt=false gjelder denne server-only QA-funksjonen, ikke offentlig/anon tilgang. Faktisk klientforsøk fikk service_only-avvisning.

En reell Edge-feil i Deno/Undici BrotliDecompress ga først HTTP 503 uten respons: **IKKE PASS**. Avgrenset Edge-transport ber nå om identity-komprimering og tillater bare Vercel API og det eksakte private lagerets origin. Auth/TLS/signatur/CAS beholdes; det faktiske SDK-kontraktchecket har alle tidligere assertions og nye identity-assertions, med ekstern nettverking sperret. **29 handler-/isolasjons-/feilscenarioer PASS** med syntetiske transporter; eksisterende 40 skyadapter-, 21 kontrolladapter- og 20 filoperatorscenarioer PASS. Full EXPO_BACKEND_TARGET=sandbox npm run build PASS.

**Faktisk Edge → privat Vercel Blob HTTP 200 / ok=true**, kjøring **d51b7230-933e-4bd8-abc2-f40d0903f47a**: privat skriv/fersk lesing, anonym 401/403-avvisning, signert union/readback, faktisk stale-ETag-konflikt, bevaring ved tom syntetisk kilde, faktisk skriving med injisert tapt respons som nekter success, gammel ankeravvisning, fersk skyrecovery med kjent syntetisk minneanker, og sletting/404 av egen testfil. **cleaned=true gjelder bare denne kjøringen**. Eier-UI fant én syntetisk rest fra den avbrutte kjøringen: **hr-ledger-qa/c798691e-4249-4670-934b-3eb40bc183d8/ledger.json**. Den er ikke slettet eller behandlet som reelle data; ingen påstand om totalt tomt Blob-lager. Ingen private referater/svar/diagnoser eksportert. Dette er **ikke** varig anker, DB-ack, isolert database/Auth/Storage-byte-restore eller full H5b browser-PASS.

Ved lukking av testpanelet returnerte nettleserverktøyet dessverre kontrollprosjektets default servernøkkel i AX-tekst før panelet var borte. Verdien er ikke kopiert til repo, dokumentasjon eller bevisbilder; Blob-tokenen er ikke lest. Kontrollnøkkelen bør byttes av brukeren via manuell overtakelse før videre serverdrift. Bruk kun målrettede DOM-observasjoner mens slike testpaneler finnes; ingen full AX/screenshot av nøkkelfeltene. Ingen nøkkel er byttet/rotert eller offentliggjort i repoet.

Main **c3d873e0** og demo **11f1b45d** er kontrollert uendret READY; private HR-porter **false/quarantined=true** i begge aktive backender. Kontrollprosjektets siste SQL viser **0 checkpoints/aktive bindinger/låser**. Betrodd bootstrap, permanent signing key, kontroll-ack-integrasjon mot isolert appkilde, scheduler/varsling og full isolert restore gjenstår. Ingen merge, Production-migrasjon eller HR-åpning.

## Tokenfelt klargjort etter eksplisitt godkjenning – 10. oktober 2026 ca. 23:02 Europe/Oslo

Kenneth godkjente konkret navigasjon til Edge Functions i **expo-hr-control** og klargjøring av **HR_LEDGER_BLOB_TOKEN**, med manuell tokeninnlegging. Denne nye autorisasjonen erstatter den tidligere manglende autorisasjonen; det samme dokumenterte inngangspunktet fungerte uten guard-feil. Faktisk prosjekt **amduqhmgmeetaatwlmmt**, Edge Functions → Secrets: navnefeltet er fylt, verdifeltet er tomt, og UI viser **No custom secrets created**. Ingen eksisterende nøkkelverdi er lest, ingen token hentet/rotert/lagret, og Save er ikke utført. Brukeren skal selv legge inn tokenen som tilhører bare det private lageret **expo-hr-ledger-sandbox / store_feUEeykOyyvZVMca**, og lagre den server-side i dette kontrollprosjektet. Aldri chat/git/VITE.

Neste steg etter brukerens bekreftelse er å verifisere lagring uten å lese verdien, deretter faktisk isolert Edge-/sky-QA, betrodd bootstrap, scheduler/varsling og separat database/Auth/Storage-byte-restore. Klargjort felt er ikke provisionering, sky-/ack-/restore-PASS eller HR-åpning. Ingen backend-/appkode, Production/main/demo eller aktive data endret i dette steget. PR #217 forblir draft. Forrige publiserte head **37c32f0c8ca03341795e8ed8041ba43075aaa096**, tree **bd425d62ce970ae4197d603cfb9adf73b571152c**, har Core Safety **38085512647 SUCCESS** og eksakt READY Preview **dpl_ENLTpQ58uAeJZWqsAVww9NTG31mm**. Privat HR forblir stengt.

## Lagerbinding rettet; credential-UI blokkert av automatisk review – 10. oktober 2026 ca. 22:52 Europe/Oslo

Eier-UI bekreftet katalog-ID store_feUEeykOyyvZVMca og privat origin https://feueeykoyyvzvmca.private.blob.vercel-storage.com. Konkret regresjon i token-IDens bokstavformat rettet: kanonisk nedre-case DB-/ankerbinding store_feueeykoyyvzvmca sammenlignes med normalisert token-ID; andre lagre/origin avvises fortsatt før nettverk. To nye prøver lagt til uten å svekke gamle: 40 skyadapter-scenarioer PASS. Faktisk pinnet SDK 2.8.1 med mixed-case syntetisk token PASS for privat/cache=0/token/ifMatch/fersk readback/412; ekstern nettverking sperret. Ingen faktisk token eller autentisert sky-/restore-PASS. Kontrolladapter 21 og filoperator 20 scenarioer fortsatt PASS. Full Sandbox critical/build PASS etter rettingen. Kontrollgrunnlagets forrige head 9e62699f972601a726f5462416733546d842ba1f hadde Core Safety 38085191843 SUCCESS og eksakt READY Preview dpl_F2XqhXJVhBi69E5MsUYncx5ERybj; den siste rettingen må få eget head-bevis.

Forsøk på å åpne det nye kontrollprosjektets Edge Functions-side for å klargjøre server-only tokenprovisionering ble avvist av automatisk godkjenningskontroll: navigasjonen ble tolket som credential-probing, med manglende autorisasjon til lesing/håndtering av hemmeligheter. Ingen secret-side eller nøkkel ble åpnet/lest/endret. Ingen reset, omvei eller nytt forsøk. Fortsett bare med eksplisitt avklaring av denne konkrete navigasjonen/provisioneringen; token skal angis av brukeren selv til expo-hr-control, aldri i chat/git/VITE. Betrodd anker, Edge/runtime, faktisk sky, scheduler/varsling og isolert database/Auth/Storage-byte-restore gjenstår. Kontrollprosjekt fortsatt uten aktive bindinger/ankre/låser/Edge Functions; Production/demo/main uendret og privat HR stengt. [Eksakt binding og QA](docs/kshms/HR_SUPABASE_CONTROL_20261010.md).

## Kontrollprosjekt opprettet og første tekniske QA levert – 10. oktober 2026 ca. 22:47 Europe/Oslo

Kenneth fullførte opprettelsen av **expo-hr-control / amduqhmgmeetaatwlmmt**, ACTIVE_HEALTHY, Micro, eu-west-1, samme godkjente organisasjon og $10/måned-grunnramme uten betalte tillegg. Ett prosjekt til senere Production-vern; ingen permanent kursjobb. Privat checkpoint/lås og fire service-only RPC-er er installert bare der via separate ops/hr-control-migrasjoner (live 20261010204017/20261010204144). Etter rollback: 0 checkpoints/aktive bindinger/låser/Edge Functions. 37 faktiske PostgreSQL-assertions PASS i kontrollprosjektet og PGlite; 21 faktiske adapterfeilscenarioer PASS med syntetiske transporter. Eksisterende filoperator/20 tester uendret PASS; full EXPO_BACKEND_TARGET=sandbox critical/build PASS. Ny adapter krever ISOLATED_QA, avviser aktive miljøer som kilde, kontrollerer varig readback/skyread før ack og beholder lås ved ukjent utfall. Ingen automatisk takeover/bootstrap. Ny sjekk lagt til Core Safety uten å svekke eksisterende tester. Supabase-standard auto-RLS-eventtrigger fikk offentlig kjørerett tilbakekalt; faktisk rollback-DDL bekreftet fortsatt auto-RLS. Advisor: ingen WARN/ERROR, én tilsiktet INFO for RLS uten offentlig policy.

Begrenset Blob-token og faktisk resource-ID/token-ID/origin/SDK-binding, betrodd bootstrap, Edge/runtime, skytester, scheduler/varsling og full isolert database/Auth/Storage-byte-restore gjenstår. Ingen betrodd produksjonsanker eller full sky-/restore-PASS. Ingen restore av aktive miljøer/kontrollprosjekt. Main c3d873e0 og demo 11f1b45d uendret; begge private HR-porter false/quarantined=true. PR #217 draft, ingen merge/Production-ack-tabell/appendring. Tidligere TEST OK og testmailens dokumenterte mottak beholdes. Tidligere status om ikke opprettet prosjekt er historikk. [Ressurs og bevis](docs/kshms/HR_SUPABASE_CONTROL_20261010.md), [eksakt kontrollkontrakt/QA](ops/hr-control/README.md).

## Kontrolltjenesten skal beskytte Production; ingen permanent kursjobb – 10. oktober 2026 ca. 22:29 Europe/Oslo

Kenneth presiserte at Sandbox er kursmiljø. Foreslått varig ressurs er derfor ett separat **expo-hr-control** for senere privat HR i Production, ikke egen betalt permanent kontrolltjeneste til kursdemoen. Tidligere sandbox-navn/miljømål i opprettelsesforslaget er historikk. Teknisk sky-/restore-QA må fortsatt gjennomføres med isolerte syntetiske data og adskilte bindinger/ankre; aldri restore av aktiv Sandbox/Production/kontrollprosjekt. Nytt list_projects viser bare eksisterende Production-prosjekt: ingen ny kontrollressurs opprettet. Skjema/opprettelse er satt på vent; ingen credential-inspeksjon, Production-installasjon, automatisk ombinding av Sandbox-operator, PR #217-merge eller HR-åpning. Godkjent ramme opptil $10/måned uten betalte tillegg består; ekstra betalt restoretestmiljø inngår ikke automatisk. [Presisert formål og isolasjon](docs/kshms/HR_SUPABASE_CONTROL_20261010.md).

## Supabase-kontrollprosjekt klargjort, ikke opprettet – 10. oktober 2026 ca. 22:22 Europe/Oslo

Kenneth har bekreftet valgt eksisterende organisasjon og ekstra grunnkostnad opptil $10/måned uten betalte tillegg. Faktisk Supabase-eierøkt og kontotilhørighet kontrollert; arbeidsområdenavn og fakturaselskapsnavn er forskjellige og eksisterende fakturakonto stemmer. Opprettelsesskjemaet viser kontopris $10/m for Micro, navn expo-hr-control-sandbox, EU/Ireland, ingen GitHub-kobling, automatisk tabellprivilegering av/RLS på. Passord og endelig opprettelse må fullføres av brukeren i manuell overtakelse. Confirm_cost er UNAVAILABLE; ingen gyldig cost-ID, create_project-API-kall eller nytt prosjekt. Ingen appkode, aktive data, HR-port, Production/demo eller main-commit endret; main-beskyttelsen består. [Faktisk skjema, pris, sperre og neste steg](docs/kshms/HR_SUPABASE_CONTROL_20261010.md). Eldre pris-/driftsstatus nedenfor er historikk.

## Main beskyttet og Supabase-kontrolldrift avklart – 10. oktober 2026 ca. 22:05 Europe/Oslo

Main har faktisk GitHub-regel 84605695: PR, obligatorisk Core safety + critical build fra GitHub Actions, up-to-date og ingen administratorbypass; force-push/sletting ikke tillatt. API protected=true/enforcement everyone bekreftet. Main/Production `c3d873e0` og demo `11f1b45d` fortsatt samme READY-deploys; ingen merge eller appendring. Supabase kan brukes som operatorvert i et nytt separat kontrollprosjekt, men krever transaksjonelt varig anker/lås og faktisk runtime-/sky-/restore-QA. Eksisterende filoperator er uendret. Organisasjonen er faktisk Pro; ekstra prosjekt fra $10/måned er listepris, ingen kontospesifikk pris/kostnadsbekreftelse eller prosjektopprettelse. Privat HR fortsatt stengt, PR #217 open/draft. Testmail er allerede sendt én gang og mottatt; branch-påminnelse opprettet for 11. oktober, ingen sletting. [Faktisk main-bevis og drift](docs/kshms/HR_LEDGER_OPERATIONS_20261010.md), [konkret Supabase-forslag](docs/kshms/HR_SUPABASE_CONTROL_20261010.md). Eldre status nedenfor er historikk.

## Seneste lagerkontroll – 10. oktober 2026 ca. 21:48 Europe/Oslo

Kenneth fullførte Vercel-innlogging i samme cloud-fane. Faktisk eierøkt opprettet separat **expo-hr-ledger-sandbox**, **Private**, **FRA1**, ID `store_feUEeykOyyvZVMca`; tomt lager, ingen prosjekttilkobling eller env-kopiering. Det tidligere 403-avviste connector-opprettelseskallet ble ikke gjentatt. Lagerbegrenset token er ikke hentet/provisionert til operator; privat origin er ikke verifisert. Connectorens lesende oppslag på riktig ID/team returnerte 404, selv om lageret er synlig i eierøkten. Ingen bootstrap, sky-/ack-PASS, varig operator/scheduler eller restore påstås. Supabase kostnadsoppslag og native artifact-download er fortsatt blokkert. Production/main og demo fortsatt samme READY-kode; begge HR-porter false/quarantined=true, Production uten ack-tabell, Sandbox ledger disabled/1 medarbeider/0 receipts/acks/innhold/filer/jobber. Testmail er allerede sendt én gang og mottak dokumentert. H5b fortsatt bare draft PR #217; ingen merge eller HR-åpning. Eldre blokkeringer nedenfor er historikk. [Faktisk lagerbevis og neste driftstrinn](docs/kshms/HR_LEDGER_OPERATIONS_20261010.md).

## Seneste driftssjekk – 10. oktober 2026 ca. 21:33 Europe/Oslo

Den ene testmailen er sendt og mottak dokumentert. H5b er fortsatt bare draft PR #217; main/Production og demo er uendret READY. Videre arbeid er faktisk blokkert av Vercels authenticator/recovery-steg, manglende dokumentert ny lagertilgang, utilgjengelig Supabase kostnadsoppslag og DNS-timeout ved ekte lokal Supabase-native artifact-download. Ingen lager/token, scheduler, database/Auth/Storage eller restore ble etablert. Privat HR fortsatt false/quarantined=true i begge miljøer; Sandbox ledger disabled, 1 medarbeider og 0 receipts/acks/innhold/filer/jobber. Ingen av disse blokkerte forsøkene er PASS. [Klargjort driftsoppskrift og eksakte blokkeringer](docs/kshms/HR_LEDGER_OPERATIONS_20261010.md). Eldre status er historikk og bevarer tidligere QA/TEST OK.

## Gjeldende status – 10. oktober 2026 ca. 21:14 Europe/Oslo

PR #216 er merged; Production/main `c3d873e0` og demo `11f1b45d` er levert og ferskt kontrollert READY. Ny H5b er **bare draft PR #217**, funksjonscommit `ecd700ac`, siste kontrollerte dokumentasjonshead `287a80aa`, grønn Core Safety/READY Preview med direkte Sandbox-binding; ingen merge eller privat HR-åpning. Den tidligere blokkerte, uendrede **live Sandbox rollback-SQL-prøven bestod nå**; etterkontroll: 1 bevart medarbeider, 0 receipts/acks/innhold/filer/jobber, deaktivert binding og privat HR false/quarantined=true. Dette er faktisk DB-prøve med syntetisk filjobbflag, ikke ekte skylager-/Storage-byte-/restore-/browser-PASS. Kenneth fullførte manuell Production-innlogging; **én autorisert testmail til kenneth@ringside.no er sendt gjennom eksisterende systemadmin-testflyt** 10. oktober ca. 21:08 Europe/Oslo. Synlig bekreftelse: «Test er sendt kun til kenneth@ringside.no.» Ingen gruppesending; Kenneths vedlagte skjermbilde av åpnet e-post dokumenterer mottak med eksakt emne og melding. Dette er ikke ende-til-ende-bevis for KS/HMS-tildelingsarbeideren. Privat uavhengig lager, varig operator/scheduler og full isolert Supabase/Auth/Storage-restore gjenstår. [Eksakte miljøer, nye bevis og neste konkrete driftshandling](docs/kshms/HR_LEDGER_ACK_20261010.md). Eldre avsnitt nedenfor er leveringshistorikk og overstyrer ikke denne statusen. Tidligere TEST OK beholdes uten omtest.

## Godkjent release til Production og kursdemo – 10. oktober 2026

Kenneth har godkjent releaseløpet med «Kjør», mobiltilpasning og eksempelinnhold for kurs. Miljømål: **BEGGE**. Eldre avsnitt om manglende Production-godkjenning er historiske.

Production har alle 54 migrasjoner og begge nye serverarbeidere. 146 relevante funksjonsdefinisjoner samsvarer med Sandbox. Faktiske Production SQL-prøver består: håndbok, 73 avvikskontroller, 93 SJA/RUH, 27 sjekkliste, 54 utførelse, 95 samtalemal og 64 organisasjonsgruppekontroller. Alle syntetiske rader er rullet tilbake. Reelle profiler/prosjekter/Sales-saker er uendret i antall. Ingen automatisk modulaktivering for reelle firmaer.

Production-transport er konfigurert og aktivert fra tom kø; Sandbox-transport forblir avslått. Personlig HR-innhold er fortsatt sperret. Mobiltilpasning inkluderer én kolonne på smal skjerm og lagringsfelt i vanlig dokumentflyt under 500 px skjermhøyde. Fysisk mobil-/kameraprøve og faktisk mottak av én autorisert testmail er ikke attestert.

Merge og main → demo er gjennomført og READY-verifisert; PR #216 er merged. Se [releasekontrollen](docs/kshms/RELEASE_20261010.md) for installasjon, QA og konkrete begrensninger. Demoens kursdata holdes på demo/Sandbox.

## HR: tydelig hjelp der du arbeider – 10. oktober 2026

Synlig **Start her** viser oppsett → medarbeider/leder → samtalemal for firmaadmin, og relevant lesehjelp for leder/personlig bruker. Malbyggeren forklarer velg → tilpass → forhåndsvis/lagre, navn/tema/spørsmål, forberedelse/felles møte, kladd/Forkast og utgave/arkiv. En lagret mal starter ingen samtale og sender ingenting til ansatte. Bare presentasjon/hjelp; handlinger, roller, SQL og privat innholdsport beholdes.

Berørte faktiske HR-/mal-/Hjelp-React-prøver og full Sandbox critical/build PASS. Eksisterende tester beholdt uten nye speiltester. Miljømål BEGGE, bare feature/Preview; tidligere TEST OK beholdes. [Scope og bevis](docs/kshms/HR_HELP_20261010.md). CI/innlogget visuell Preview kontrolleres etter publisering.

## HR: versjonerte samtalemaler – 10. oktober 2026

Firmaadmin får **HR → Samtalemaler**: årlig medarbeidersamtale, prøvetid og oppfølging, egne tema/spørsmål, medarbeiderforberedelse/felles møte, forhåndsvisning og tydelig **Lagre mal**. Immutable malutgaver, historikk, gjenbruk som ny kladd, arkivering/gjenåpning, paginering og avvisning av samtidige revisjoner. Kladd beholdes i midlertidig aktør-/firmabundet minne over fokus/remount, først etter fersk admin-tilgang. Ingen ansattes svar, personreferater, signaturer eller fraværsinnhold åpnes.

**91 nye faktiske rollback Sandbox-assertions PASS**, samme 91 i fysisk PostgreSQL/PGlite med syntetisk plattformadapter. Faktisk ny mal-React og berørt HR/register/KS-meny/Hjelp-React PASS; permanent critical og full Sandbox build PASS. Fem live funksjonskropper matcher lokale MD5-er, tomt search_path og riktige ACL. Sandbox-migrasjon **20261010005833**, CLI **20261010004928**. Eksisterende 1 HR-firma/1 medarbeider beholdt; 0 aktive utviklermaler/utgaver/artifacts/filer/receipts. Privat innhold fortsatt content=false/restore quarantined. Første live prøving ble korrekt avvist av eksisterende profile-guard under endring av egen syntetisk aktør; fixtureoppsettet ble korrigert til eksisterende systemaktør, uten endret guard eller produktkode. Hele første prøve rullet tilbake.

Miljømål **BEGGE**, bare feature/Preview/Sandbox, draft PR #216. Tidligere O3/B/C/PDF/ZIP og Kenneth TEST OK beholdes; ingen Production/main/demo/e-post. Uavhengig varig manifest/automatisk eksport og DB-ack/full isolert Supabase database- og Storage-restore gjenstår før privat HR-kontakt og individuelle samtaler/fravær åpnes. [Scope, kontrakt og nye bevis](docs/kshms/HR_TEMPLATES_20261010.md).

**Faktisk mal-Preview-kontroll:** kode `70f12015b616e8e9b4c6e0efc06d82ab4e6df1ef`, Core Safety **38011669656 / jobb 114092844672 SUCCESS**, `dpl_6QTL7UM5H55ek25V7mrsqkEdyPys` READY med eksakt SHA/ref/prosjekt/fast alias. Direkte branch-env `EXPO_BACKEND_TARGET=sandbox`. Innlogget desktop: HR/admin, tre forslag, generisk kladd/redigering, tom forhåndsvisning, dirty bytte/Behold kladden, Oppdater maler med bevart kladd og Forkast PASS. Ingen testmal lagret. Ingen horisontal overflow; Lagre mal 44px. Lagret historikk/arkiv/CAS har SQL og React-bevis; mobil og separate samtidige browserøkter gjenstår. [Originalbilde og presise bevis](docs/kshms/HR_TEMPLATES_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

**Faktisk O3 Preview-kontroll:** kode d4b5270e916dc06a764fbd35af36a8db6f238470, Core Safety 38009716896/jobb114086648809 SUCCESS, dpl_GKkbK6sdQd5si4yqYpeEd44NomJx READY eksakt SHA/Sandbox. Innlogget Skynett: ny kartvelger/bevart enkeltfirmakart/fokusretur/PDF to sider/fire demonavn PASS. Nytt felles kart er riktig skjult for demo uten to kvalifiserte firmaer; flerfirmahandlinger har SQL/React-bevis, ikke nytt browserbevis. Ingen aktiv rettighets-/kartendring. [Originalbilde og presise bevis](docs/kshms/ORGANIZATION_GROUPS_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

## Organisasjonskart O3 – felles kart for flere firmaer, 10. oktober 2026

Miljømål **BEGGE**, leveres bare feature/Preview og Sandbox. Et separat felles organisasjonskart kan knytte **2–10 firmaer** sammen. Én brukerkonto kan ha forskjellig stilling og plassering i hver firmagren. Opprettelse lager Styret og sideordnede firmagrener; toppnavn og struktur kan redigeres med **Lagre kart**, og hele kartet kan slettes med uttrykkelig bekreftelse. Firmautvalget er fast i denne første versjonen. Eksisterende firmakart, brukere og HR beholdes.

**Hele felleskartet krever fersk KS/HMS i alle firmaene; redigering krever firmaadmin i alle.** En kartleder gir ingen ekstra redigering eller HR-innsyn. En bruker med ett firma ser sitt vanlige firmakart. Firmamedlemskap, avsluttet arbeidsforhold, tilbakekalling, firmagrense og revisjon kontrolleres på serveren ved hver handling. Ingen automatisk konto-/medlemskapsopprettelse eller modulaktivering.

**64 nye faktiske rollback Sandbox-assertions PASS**; fysisk PostgreSQL/PGlite **63 + 33 + 64 PASS**, faktiske nye/berørte React-flyter, permanent critical og full Sandbox build PASS. Felles PDF: **49 syntetiske personer / 51 firmaplasseringer / fire A3-sider**, alle tekst- og visuelt kontrollert. Samme person har tre ulike stillinger i tre firmaer. Dette er utviklerbevis, ikke nytt innlogget flerfirma-browserbevis. Sandbox-migrasjon **20261010002710** (CLI 20261010001921), ni live funksjonskropper/ACL/tomt search_path verifisert mot kilden. Ingen aktive felleskart opprettet, rettigheter utvidet eller HR-innhold åpnet.

[Scope, knapper, sikkerhetsprøver og presise bevis](docs/kshms/ORGANIZATION_GROUPS_20261010.md). Kenneths tidligere TEST OK/B/C/PDF/ZIP/SJA-bevis beholdes uten gjentatt omtest. Ingen main/demo/Production eller e-post. Privat HR-kontakt/samtale/fravær fortsatt stengt; uavhengig driftsmanifest/ack og isolert Supabase-restore gjenstår før åpning. Mobil, separate samtidige browserøkter og belastningstest på isolert database gjenstår som egne bevis.

**Feature/Preview 10. oktober – kartredigering:** eksplisitt Lagre kart, synlig redigering/flytting/sletting, frie toppnavn og tydelig tre. 33 nye + 63 berørte Sandbox assertions, faktisk React og fire syntetiske PDF-sider kontrollert. Flerfirma-Ringside-kart er avklart eget neste scope før deres Production. [Scope og bevis](docs/kshms/ORGANIZATION_EDITOR_20261010.md). Ingen Production/main/demo/e-post.

**Feature/Preview 10. oktober:** Organisasjonskart under KS/HMS, også uten HR-avtale: avdelinger, stillinger, lærlinger og egen PDF. 63 Sandbox assertions, berørt H1/H3 75/61, faktisk React og visuelt kontrollert syntetisk PDF PASS. Privat HR fortsatt stengt; ingen mail/merge/Production. [Scope og bevis](docs/kshms/ORGANIZATION_SCOPE_20261010.md). Skynett: faktisk kartvisning/dialog/fokusretur og PDF-nedlasting kontrollert på kode 0b638fc27d0b987cb61a54fc439727b4d03b5325; Core Safety 38005156679 SUCCESS, eksakt READY Preview/Sandbox. Originalbilder og kontrollgrenser er lagret i scope-dokumentet.

**Feature/Preview 10. oktober:** Kenneth TEST OK for KS/HMS-/HR-layout er mottatt. H5a gir privat slettemanifest-adapter med 38 lokale feil-/samtidighetsscenarioer og faktisk versjonslåst SDK på syntetisk HTTP; full Sandbox build PASS. Eksternt lager ikke opprettet: Vercel 403 forbidden. Privat HR fortsatt stengt; driftsbinding/DB-ack og isolert Supabase-restore gjenstår. [Scope og konkret blokkering](docs/kshms/HR_CLOUD_LEDGER_20261010.md). Ingen main/demo/Production eller e-post.

**Feature/Preview 9. oktober:** Min side og HR-tekstforslag er utviklerverifisert; privat adresse/pårørende fortsatt bak lukket HR-port. [Avgrenset scope og bevis](docs/kshms/PERSONAL_PAGE_20261009.md). Ingen Production/main/demo-release.

## H3 og samlet Hjelp – 9. oktober 2026

Miljømål **BEGGE**, bare feature/Preview og Sandbox, draft PR #216. Hjelp har nå ett **KS/HMS**-punkt med 11 kapitler og ett **HR**-punkt; tidligere hjelpeinnhold beholdes. HR-slettefundamentet omfatter registrert innhold, versjoner, kladder, søkeuttrekk, eksporter og private filer. Tilgang sperres straks; **Slettekvitteringer** viser pågående filsletting og ferdig sletting korrekt.

**61 nye faktiske Sandbox-assertions PASS**, faktisk privat Storage-opplasting/hashkontroll/API-sletting av én syntetisk 62-bytes fil PASS, faktisk HR/Hjelp-React og full critical build PASS. Alle 16 live SQL-funksjoner og Edge v3 er lest tilbake mot kilden. Sensitivt HR-innhold og filnedlasting er fortsatt stengt, både i databasen og i Edge-koden. Uavhengig slettemanifest og full isolert backup-restore er neste sikkerhetsbevis før åpning. Sandbox har nå én firmaoppføring og én medarbeider; eksisterende oppføring beholdes, ingen sensitive data eller testrester finnes. Ingen e-post, merge eller Production. Kenneths **TEST OK for H2-menyen** er mottatt; eldre B/C/PDF/ZIP-bevis beholdes. [Scope, kontrakt og QA](docs/kshms/HR_PURGE_FILES_20261009.md).

## HR-register og smartere KS/HMS-meny – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Preview/Sandbox, draft PR #216. H2 gir eget HR-hovedvalg med firmaadmins medarbeider-/leder-/leserregister og medarbeiderens Mine oppfølginger. HR har fortsatt ingen samtale-/fraværsinnhold, filer eller eksport; full innholdspurge/restore må leveres før sensitivt innhold åpnes. Ingen firma aktivert av leveransen. KS/HMS-menyen er gruppert i Daglig arbeid, Mine rutiner og Forvaltning; eksisterende faner, snarveier og utkastbevaring beholdes.

**16 nye faktiske Sandbox-assertions PASS**, faktisk HR/meny-React og berørt håndbok/kildeforslag-React PASS, permanent hook/tilgang/revisjon/late-response-prøve og full critical build PASS. Fem HR-FK-indekser forbedrer slettestien. Skynettleseren fungerer igjen; faktisk ny layout etter publisering og eksakt SHA/CI/Preview føres i PR #216. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes uten ny obligatorisk omtest. Ingen mail/merge/Production. Neste: privat fil-/full slettekontrakt. [Scope og QA](docs/kshms/HR_UI_MENU_20261009.md).

---

## HR H1 – første sikkerhetsfundament, 9. oktober 2026

Firmabundet medarbeider-/lederregister, eksplisitte ekstra lesere, fersk tilgang og fysisk sletting av register/tildelinger er levert i feature/Sandbox. **75 faktiske rollback-assertions PASS**, permanent klientprøve og full critical build PASS; alle ti live funksjoner byteidentiske. HR er deaktivert for alle firmaer, private filer stengt og tomme. Dette er backend uten ny HR-meny, referat, fravær eller eksport. Full sletting av fremtidig HR-innhold/filbytes og restore er ikke levert. Neste: HR-registerets brukerflate, deretter privat fil-/innholdspurge før sensitivt innhold. Tidligere TEST OK beholdes; ingen ny Kenneth-prøve eller browser-PASS. Miljømål **BEGGE**, bare feature/Preview; KS-e-post fortsatt disabled. [Scope, QA og grenser](docs/kshms/HR_FOUNDATION_20261009.md). Publisert SHA/CI/Preview føres i draft PR #216.

---

## B/C-sluttkontroll og drift – 9. oktober 2026

Samlet B/C-utviklerreview er gjennomført. Alle seks påminnelsestyper er levert; tidligere TEST OK beholdes. Ny lesende Sandbox-måling og konkrete kapasitetsrestpunkter er dokumentert, uten påstand om 100-firma-lasttest. Bare dokumentasjon endret, ingen ny obligatorisk Kenneth-prøve. Neste utviklingspunkt: avklart HR-tilgang/private filer/sletting før sensitivt innhold. Faktiske fil-/mobil-/flerbrukerbevis, den ene usendte testmailen og aktivert/verifisert Production-e-post er separate releasepunkter. Miljømål **BEGGE**, levering bare feature/Preview. [Sluttstatus og drift](docs/kshms/BC_CLOSEOUT_20261009.md). Publisert SHA, grønn CI og READY Preview føres i draft PR #216.

---

## Oppgavepåminnelser – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Påminnelser følger opp ufullførte vernerunder, risiko, SJA og egne lesebekreftelser etter minst sju dager. Framtidig planlagt dato utsetter oppfølgingen. Ingen nye arbeidsfrister eller automatiske signeringer. Egen appoversikt åpner eksisterende arbeidsflater. **41 ulike Sandbox-assertions PASS**; eksisterende seks varseltyper **36 PASS**, avvikspåminnelser **37 PASS** og revisjonspåminnelser **36 PASS**. Faktisk React-appflyt og berørte kilde-/revisjonsflyter PASS; full critical/build PASS. Migrasjon 20261009171349 og Edge v7 levert, worker **enabled=false**, 0 syntetiske firma/brukere. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve. Testmailen er ikke sendt. Neste punkt: samlet B/C-sluttkontroll og drift/kapasitet før HR. [Scope og QA](docs/kshms/TASK_REMINDERS_20261009.md). Publisert SHA, CI og READY Preview føres i draft PR #216.

---

## Håndbokrevisjonspåminnelser – 9. oktober 2026

Miljømål **BEGGE**, leveranse bare feature/Sandbox. Utpekt ansvarlig får egen revisjonsoppgave og åpner eksisterende skjema uten automatisk signering. Ukentlige påminnelser bruker bare aktuell periode, med sju dagers sendepause og fersk kontroll av ansvar, dato og tilgang. **36 nye Sandbox-assertions PASS**, eksisterende varseltyper **36 PASS**, avvik/RUH-påminnelser **37 PASS** og faktisk React-flyt/kildeoppdateringsregresjon PASS. Full critical/build PASS. Migrasjon 20261009164036 og Edge v6 levert; worker fortsatt **enabled=false**, syntetiske data rullet tilbake. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve. Testmailen er ikke sendt. Neste funksjon er øvrige C-påminnelser; faktisk innlogget fil-/mobil-/flerbrukerbevis og kontrollert release gjenstår. [Scope og QA](docs/kshms/REVIEW_REMINDERS_20261009.md). Publisert SHA, CI og READY Preview føres i draft PR #216.

---

## Samlet B/C-gjennomgang – 9. oktober 2026

[OVERSIKT](docs/kshms/OVERSIKT.md) er nå en kompakt, oppdatert A–E-status; tidligere oversikt er arkivert. Underskjema, avvik/RUH-påminnelser, kildeoppdatering og ti-gruppe PDF/ZIP er registrert som levert. Gjenstående funksjonsgap skilles fra innlogget fil-/mobil-/flerbrukerbevis. Neste konkrete utviklingsscope er håndbokrevisjonspåminnelser, deretter øvrige C-påminnelser før HR. Tall/dato er dekket i faste skjemaer; generell skjemabygger legges ikke til som nytt obligatorisk krav. **45 faktiske Sandbox-RPC-assertions PASS**, kombinert React/PDF med alle ti grupper **26 / 25 sider**, ZIP **13 filer + manifest** og visuell kontroll av alle 26 sider PASS. Syntetisk transport er ikke faktisk innlogget Storage-bevis. Ingen ny obligatorisk Kenneth-prøve; tidligere TEST OK beholdes. Testmailen er autorisert, ikke sendt; transport fortsatt disabled. Miljømål BEGGE, bare feature/Sandbox. [Kravkart og bevis](docs/kshms/BC_REVIEW_20261009.md).

---

## Kildeoppdateringsforslag – gjeldende fortsettelsespunkt 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Oppfølging og revisjon har nå en samlet oversikt over nyere sentrale ProffDok-tekstforslag og vurderte utkast som fortsatt må firmagodkjennes. Sammenligningen viser firmaets tekst og forslaget felt for felt. Å bruke ett felt endrer bare dette feltet; bare **Jeg har vurdert hele tekstforslaget** flytter utkastets forslagsutgave. Egne tilpasninger beholdes. Lagre utkast og Godkjenn og publiser er separate handlinger. Gjeldende godkjente utgaver og gamle ansattbekreftelser omskrives ikke. Ingen nettkilde markeres kontrollert av denne vurderingen, og dette er ikke automatisk lovovervåking.

**Utvikler-QA:** permanent critical-kjede og full lokal build PASS; faktisk React/Vite/JSDOM PASS for sammenligning, manuell kildedato, lokal kladd, feilet lagring/retry, lagret vurdering uten publisering, eksplisitt godkjenning, nye tildelinger og bevarte historiske bekreftelser. Ekte Sandbox-RPC i rollback-transaksjon: **22 assertions PASS**, inkludert firma-/rolle-/revisjonskontroll, kildegrunnlag, immutable v1/v2 og avslått modul. Direkte sluttkontroll: 0 syntetiske firma/brukere, worker `enabled=false`. Ingen ny migrasjon, RPC, RLS/Storage eller global navigasjon. Publisert SHA, Core Safety og READY Preview dokumenteres i draft PR #216 etter levering. [Scope og QA](docs/kshms/SOURCE_UPDATES_20261009.md).

Kenneths TEST OK **00:59 / 01:29 / 01:55 / 02:28 / 15:01** beholdes. Ingen ny obligatorisk Kenneth-prøve opprettes. Innlogget browserbevis er fortsatt blokkert etter reset av `native credential state cannot be safely resumed`; dette er ikke browser-PASS. Neste punkt er samlet helhetlig B/C-vurdering og målrettet dekning av faktiske filer, mobil og flerbruker før HR. Tidligere fortsettelsespunkter nedenfor er historikk.

**E-postavklaring:** Kenneth autoriserte én kontrollert test til sin valgte arbeidsadresse 9. oktober kl. 17:29. Testen er ikke sendt; Production-testendpoint krever fungerende innlogget systemadminøkt. Generell køaktivering er fortsatt avslått. KS/HMS-varsler og fristpåminnelser skal aktiveres og verifiseres ved senere godkjent produksjonssetting. Ingen Production-release eller main/demo-merge er bestilt. Denne avklaringen supplerer de eldre sendingstillatelsene nedenfor.

---

## TEST OK – SJA-bilder, 9. oktober 2026 kl. 15:01

Kenneth svarte «test ok» etter den avgrensede SJA-bildeprøven i samme Sandbox Preview. Godkjenningen gjelder ett testbilde i SJA-utkast med lagring/gjenåpning, egen og samlet PDF, og bilde/manifest.json i vedleggs-ZIP på head `65655dea4a220352075b3c50dd0530a53aab758f`. Dette er brukerens godkjenning, ikke en ny utviklerdrevet nettleserprøve. Ingen bestemt sak, enhet eller antall filer utover prøven er dokumentert.

Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes uten omtest. SJA-bildeprøven trenger ikke gjentas uten konkret feil eller relevant regresjon. Mobilkamera, flerbruker, faktiske private avviks-/prosjektkontroll-/legacyfiler, risikobilder, eldre prosjektavviksuttrekk og versjonerte underskjema beholder sine egne restprøver. Neste uavhengige utviklingspunkt er påminnelser, deretter kildeoppdatering. HR er ikke startet.

Denne registreringen endrer bare dokumentasjon på feature-branchen; PR #216 forblir draft. Ingen Production-release eller main/demo-merge er godkjent eller utført. KS/HMS-e-postutsending skal fortsatt være deaktivert. Eldre beskrivelser av «ikke TEST OK for SJA-bilder» nedenfor er historisk status før denne godkjenningen.

---

## Versjonerte underskjema – avgrenset B-leveranse 9. oktober 2026

Kontrollert start remote feature `131d65ca97b7a401417e439b185ceac2afa5b6ff` / tree `806b61458891c92b25ed61a02676377101e9d1f2`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft. Sjekklistesentral kan feste eksakt publisert child-versjon etter et rotpunkt. Publisering lagrer root, utflatet utføringsliste og komplett child-versjon/hash/innhold. Samme-firma/aktiv-mal, syklus og maks 100 ferdige punkter håndheves server-side. Gamle parent-/prosjektkopier omskrives ikke.

Sandbox-migrasjonene `20261009040633 kshms_checklist_subforms` og `20261009041152 kshms_checklist_subform_execution_shape` anvendt. 17 rollback-assertions PASS, inkludert faktisk selvstendig kontroll; faktisk React og fem faktiske PDF-er PASS; A4-mal visuelt kontrollert. RPC/privat ACL og mailer `enabled=false` direkte kontrollert. Funksjonshead **6faf58df375ce12a4779f71fac98b1c2bfc5ce5e**, tree **2e8562f56150509669bc8635acda3800f3be3f14**, publisert fra expected-head uten force; alle 20 blobber matcher lokalt testtre. Full Sandbox critical build lokalt PASS. Core Safety **37883044933**, jobb **113666839672**, success. Vercel **dpl_JACGxacWsYSkCxcdKZGDAk8UK14F** READY på eksakt SHA/feature-ref/fast alias; branch-env direkte `EXPO_BACKEND_TARGET=sandbox`.

Innlogget samme Preview etter reload: bevart demoøkt i én fane, Bunnledning v1 åpnet skrivefritt. Versjonsvelger/forklaring vises på begge punkter; selvvalg er utelatt og bare «Ingen underskjema» finnes fordi dette er firmaets eneste sjekklistemal. Dialogen ble lukket uten lagring/publisering eller prosjekt-/kontrollendring. [Scope/QA](docs/kshms/CHECKLIST_SUBFORMS_20261009.md).

Dette er ikke Kenneths TEST OK. Tidligere TEST OK 00:59 / 01:29 / 01:55 / 02:28 beholdes. Faktiske private filer, mobil/flere brukere og separate restprøver består. Neste B/C er påminnelser, deretter kildeoppdatering; HR er ikke startet. Ingen ekte e-post eller Production/main/demo-merge.

---

## Risikobilder – publisert utviklerbevis 9. oktober 2026

Start kontrollert mot remote feature `0b6c0ffab2705c06b7314f2484cb187412c9f02d` / tree `d84c3ae5742d07b3d431132be99a3f0b579a5932`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft. Funksjonshead **bcd0579cebdeaaaa4578abab14dc5522bf0abd88**, tree **03e3ecf71fcde6c43e714997f57a24f1f213f810**, publisert fra expected-head uten force; alle 24 endrede blobber og samlet tree matcher lokal testcommit. Core Safety **37878651320**, full critical jobb **113652964404** completed/success. Vercel **dpl_AKRXJxtRxZuNRif9ej4d2oUJ5vk3** er READY på eksakt SHA/feature-ref/fast alias og direkte lest `EXPO_BACKEND_TARGET=sandbox`.

Risikovurdering kan lagre inntil tre komprimerte bilder per fare i samme private revisjonssnapshot. Egen PDF, valgt prosjektrapport, samlet PDF og ZIP/manifest er faktisk prøvd; visuell PDF-kontroll og full Sandbox critical build PASS. Privat migrasjon `20261009031544 kshms_risk_photos` er anvendt bare på Sandbox og direkte verifisert for bilde, legacy og stengte EXECUTE-grants; e-post-worker er fortsatt `enabled=false`. Innlogget Preview etter reload viste ny bildefunksjon og personverntekst i et tomt, ulagret skjema; ingen eksisterende risikovurderinger, filvalg, lagring eller fullføring. Popup ble lukket og listen sto fortsatt på null. [Scope/QA](docs/kshms/RISK_ATTACHMENTS_20261009.md).

Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes. Dette er ikke ny risikobilde-TEST OK. Faktisk innlogget risiko-/SJA-bilde/kamera, private filer, mobil/flere brukere og restbevis gjenstår. Neste uavhengige punkt er versjonerte underskjema; deretter påminnelser og kildeoppdatering. Ingen HR i natt, e-post, Production/main/demo-merge.

---

## Publiserte SJA-bilder – utviklerbevis 9. oktober 2026

Funksjonshead **785d01389d2059026711ea1a8af12762e75fc4b9**, tree **cd5257609f1a3e2c375b9faf7d9146bc561ed429**, publisert fra expected-head `7a68293c8ad3aae4191a1e766b1dbf278ab54eef` uten force; alle 25 blobber og samlet tree hash-/bytekontrollert. Main er fortsatt `155f6c4ac01f126c1db0c65da385cfd9305587d5`, PR #216 draft. Core Safety **37874352426**, jobb **113639379783**, full critical build completed/success. Vercel Preview **dpl_Dd3VioNsdD4idRkMGodqfpTamDqG** er READY på eksakt SHA/feature-ref/faste alias; branch-env er direkte lest som `EXPO_BACKEND_TARGET=sandbox`.

Leveransen gir inntil tre komprimerte SJA-bilder i samme revisjonssnapshot, egen PDF, samlet PDF og bekreftet ZIP/manifest. Lokal faktisk React/PDF/ZIP, visuell kontroll og full Sandbox-build PASS. Privat validator-migrasjon `20261009022028 kshms_sja_photos` er anvendt bare på `demo-sandbox` (`ppvircenkjizeiqdxphj`): ett JPEG-bilde og legacy uten `photos` PASS; fire bilder, PNG og duplikat-ID avvises; PUBLIC/anon/authenticated har ingen EXECUTE. Innlogget Preview etter reload: eksisterende signert «Test sja» åpnes uendret/read-only og viser ny bildeseksjon/personverntekst; ingen opplasting, lagring, signering eller annen dataendring. Popup lukket.

Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes; dette er ikke ny SJA-bilde-TEST OK. Faktisk innlogget SJA-bilde/kamera, risikovurderingsfiltilknytning, faktiske private filer, mobil/flere brukere og annen vedleggsdekning gjenstår. Deretter versjonerte underskjema, påminnelser og kildeoppdatering; ingen HR i natt. Ingen e-post, Production/main/demo-merge. [Scope/QA](docs/kshms/SJA_ATTACHMENTS_20261009.md).

---

## Publisert eldre prosjektavviksuttrekk – utviklerbevis 9. oktober 2026

Funksjonshead **37cd906b697763c4865650d9393a33d05fb78303**, tree **bf3c2e0ee256eb2cb9dddcc052b07aaf4490c8a2**, identisk med lokal testcommit 4316675cb99a3d1a004494eac2bb376df5c878c3. Alle 18 blobber opprettet/hashkontrollert og lest tilbake byte-/tekstidentisk; faktisk publisert git-commit rekonstruert og SHA-verifisert, 668 recursive tree-oppføringer kontrollert med korrekt tree og alle endrede filer. Lokal feature-head følger eksakt publisert kode. Publisert expected-head bd506a65 uten force; main fortsatt **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Vercel READY **dpl_8kaLkrvrwtiBGmksLnSRLFaUGUmi**, riktig SHA/feature-ref/prosjekt/faste alias, EXPO_BACKEND_TARGET=sandbox direkte lest. PR Core Safety **37868239123**, jobb **113620009941** med full critical build: completed/success. Final lokal full Sandbox build, scope/docs-guard og diff-check PASS.

Innlogget fast Sandbox Preview, gjenbrukt demoøkten i én fane: hovedprosjektet viste **3 ukoblede eldre saker**, alle startet uten valg. Tre koblede saker ble utelatt. De tre valgte eksisterende sakene (to åpne, én lukket) ga faktisk nedlastet **5-siders PDF** med innhold/status/eldre lukking, forklaring om uversjonert lagret tilstand og manifest. Tekst-/sidekontroll PASS; alle fem sider rendret og visuelt kontrollert uten overlapp/klipp. Vedleggslisten viste 0 og sperret ZIP/bekreftelse. Fjerning av lukket sak ga 2 valg, tømte vedleggsliste og PDF-bekreftelse og sperret PDF. Deretter valg/omfang tømt; én fane, ingen popup eller sak-/database-/Storage-skriving. [Nettleserbevis](docs/kshms/legacy-extract-proof.jpg).

Dette er **utviklerbevis, ikke Kenneths TEST OK** for ny legacy-del. Ny kort prøve står i USER_TEST.md. Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes. Ingen gamle godkjente deler skal prøves på nytt uten konkret feil/relevant regresjon. Faktisk lagret eldre avviksfil, private avviks-/prosjektkontrollfiler og mobil/flere brukere er fortsatt separate restprøver: eksisterende gamle testsaker hadde ingen photos. Lokal React/ZIP med syntetisk transport verifiserer 7 originaler og manifest/CRC32/SHA-256; dette er ikke faktisk innlogget filbevis. Øvrig vedleggsdekning/SJA-/risikofiltilknytning består før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå. KS/HMS enabled=false er direkte lest, ingen e-post/Production/main/demo-merge. Etterfølgende beviscommit har bare docs/skjermbilde og uendret funksjon.

---

## Eldre ukoblede prosjektavvik – avgrenset leveranse 9. oktober 2026

Miljømål **BEGGE**; bare feature/Sandbox-publisering. Verifisert start **bd506a652bd2b4d339b43946f80a121ecea294f9**, main **155f6c4ac01f126c1db0c65da385cfd9305587d5**, draft PR #216. Denne del-leveransen gjør eldre ukoblede prosjektavvik eksplisitt valgbare i Dokumentuttrekk: lagret innhold/bilder i PDF, originalfiler i separat bekreftet ZIP. Koblet KS/HMS-sak utelates. Eldre ansvar/lukking merkes som lagret tekst uten versjonert historikk eller KS/HMS-signatur; innholdets SHA-256 følger valget/manifestet.

Utviklerbevis: permanent tilgangs-/innholds-/fil-/avbruddsvern PASS; faktisk React/jsPDF gir 20-siders prøve-PDF og ZIP med 7 originaler, CRC32/SHA-256 verifisert. Alle 20 sider rendret, kontaktark og åpne/lukkede avvik visuelt kontrollert. Opprinnelige åtte-gruppe-prøver og kvalitet-/HMS-modus PASS (ZIP 5/9 originaler). Full critical Sandbox build PASS. Transport i disse lokale prøvene er syntetisk. Innlogget publisert prøve og eksakt publisert head/tree/CI/deploy er ført ovenfor. Vercels branch-binding er direkte kontrollert: EXPO_BACKEND_TARGET=sandbox. KS/HMS-worker enabled=false er direkte lest; utsending forblir deaktivert.

**Ny bruker-TEST OK foreligger ikke for eldre prosjektavvik.** Bevar Kenneths TEST OK 9. oktober Europe/Oslo: egen SJA-PDF 00:59, samlet PDF 01:29, ZIP med to bilder/manifest 01:55, kvalitet-/HMS-uttrekk 02:28 på f9e0f7b52a0573cf662fce07f8158c47576c8598 (funksjon 0e2de193164dad2342206cac1e2a7610f3c265d0). Ingen ny prøve av disse delene kreves uten konkret feil/relevant regresjon. Faktiske private avviks-/prosjektkontrollfiler, faktisk eldre prosjektavviksfil, mobil/flere brukere og øvrig vedleggsdekning består. Nye filtilknytninger på SJA/risiko er ikke levert. Fortsett øvrig vedleggsdekning før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå; kravene i HR_SCOPE_20261008.md beholdes.

Ingen migrasjon, backend-/database-/policyendring, saks-/Storage-skriving, signering/lukking, ekte e-post, Production-release eller main/demo-merge. [Eksakt scope, prøver og neste steg](docs/kshms/LEGACY_ATTACHMENTS_20261009.md).

---

## TEST OK – kvalitets-/HMS-avvik, 9. oktober kl. 02:28

Kenneth ga **TEST OK 9. oktober 2026 kl. 02:28 Europe/Oslo** for den avgrensede kvalitets-/HMS-leveransen på publisert head **f9e0f7b52a0573cf662fce07f8158c47576c8598** (funksjonskode **0e2de193164dad2342206cac1e2a7610f3c265d0**). Godkjenningen gjelder den nye avviksdekningen i Dokumentuttrekk og den fremlagte korte brukerprøven. Utviklers innloggede bevis omfatter seks lagrede avvik, 23-siders PDF med begge kategorier/historikk/manifest, tom vedleggsliste med sperret ZIP og nullstilling ved fjerning. Bevishead f9e0f7b5 var READY **dpl_3DB6k8cwp3K1eBvzMcG8Ludc8JFk**, grønn Core Safety **37864641901** / full critical build **113608347101** completed/success.

Tidligere TEST OK **00:59 egen SJA-PDF / 01:29 samlet PDF / 01:55 ZIP med to bilder og manifest.json** beholdes. Denne nye godkjenningen er **ikke faktisk privatfilbevis**: Sandbox-avvikene har ingen private originaler/bilder. Faktisk private avviksfiler, private prosjektkontrollfiler, mobil/flere brukere og øvrige tidligere separate restprøver består. Den godkjente avviksprøven skal ikke gjentas uten konkret feil eller relevant regresjon. Ukoblede eldre prosjektavvik og andre filtilknytninger/full tilsynsdekning er fortsatt ufullført B/C-scope. Fortsett én avgrenset del av øvrig vedleggsdekning før versjonerte underskjema, påminnelser og kildeoppdatering; HR følger senere etter avklart HR_SCOPE_20261008.md.

Denne oppfølgingen endrer bare dokumentert godkjenningsstatus. Miljømål **BEGGE**, kun feature/Sandbox. Faktisk branch/main kontrollert før endring: f9e0f7b5 / **155f6c4ac01f126c1db0c65da385cfd9305587d5**, draft PR #216. Ingen app-/backend-/databaseendring, Production-release/main/demo-merge eller ekte e-post. KS/HMS-e-postutsending forblir deaktivert.

---

## Kvalitet-/HMS-uttrekk: READY og grønn full critical build

Funksjonshead **0e2de193164dad2342206cac1e2a7610f3c265d0** er READY/grønn Core Safety. Innlogget utviklerprøve lastet ned seks lagrede kvalitets-/HMS-saker på 23 sider med historikk/manifest; tom privat vedleggsliste sperret ZIP, endret utvalg nullstilte bekreftelsen. Eksakt head/tree/deploy/CI og [nettleserbevis](docs/kshms/deviation-extract-proof.jpg) er ført i CONTINUITY/QA. Tidligere TEST OK **00:59 / 01:29 / 01:55** beholdes. Ny avviks-TEST OK, faktisk private avviksfiler, mobil/flere brukere og øvrig vedleggsdekning gjenstår. KS/HMS-e-post deaktivert; ingen Production/main/demo-merge. Én avgrenset leveranse, ingen underskjema/HR i denne runden.

---

## Kvalitet-/HMS-avvik i dokument- og vedleggsuttrekk – 9. oktober 2026

Miljømål **BEGGE**, kun feature/Sandbox nå. Baseline `da2e5a79824c1358948ed535768b81277a2ecb41`, faktisk main `155f6c4ac01f126c1db0c65da385cfd9305587d5`, draft PR #216. Ny avgrenset del av øvrig vedleggsdekning: egen gruppe **Kvalitets- og HMS-avvik med historikk og bilder** i Dokumentuttrekk. Valgte lagrede KS/HMS-saker får full historikk/private bilder i PDF og private originaler i ZIP, med eksisterende bekreftelse/manifest/konsistens-/tilgangsvern. [Scope og QA](docs/kshms/DEVIATION_ATTACHMENTS_20261009.md).

TEST OK for egen SJA-PDF **00:59**, samlet PDF **01:29** og ZIP med to bilder/manifest **01:55** 9. oktober beholdes som separate dokumenterte godkjenninger. De er ikke ny TEST OK for kvalitet/HMS. Innlogget Sandbox har fem HMS-saker/én kvalitetssak, ingen private avviksfiler. Ny faktisk privatfilprøve, mobil/flere brukere og tidligere separate restprøver er fortsatt åpne. Nye filtilknytninger på andre dokumenttyper og full legacy-/tilsynsdekning er ikke erklært ferdig. Øvrig vedleggsdekning følger før versjonerte underskjema, deretter påminnelser og kildeoppdatering før HR; HR_SCOPE_20261008.md beholdes. Ingen Production/main/demo-merge eller ekte e-post; Sandbox KS/HMS-enabled=false bekreftet direkte og beholdt.

---

## TEST OK – ZIP med to bilder og filoversikt, 9. oktober kl. 01:55

Kenneths TEST OK er presisert **9. oktober 2026 kl. 01:55 Europe/Oslo**: ZIP fra Voldsløkka-vernerunden er lastet ned og åpnet, med **to bilder i vedlegg og én JSON-fil**. Skjermbildet viser åpnet «KS-HMS vedlegg – test omfang», mappen «vedlegg» og «manifest.json». Dette bekrefter innlogget ZIP-nedlasting/innhold på publisert head **359dac0ed2df86ab43cb545ece6716161f9bdc87** (funksjon 42a38e91), etter PDF-/ZIP-avklaringen kl. 01:51–01:53. Tidligere TEST OK beholdes. Ingen ny mobil-, flerbruker-, privat RUH-original-/prosjektkontrollfil- eller Production-/merge-/e-postgodkjenning følger.

Brukerens «det var ikke selvsagt» følges opp med avgrenset tekst i Dokumentuttrekk og HJELP: PDF og ZIP har hver sin nedlasting; ZIP-knappen vises etter Vis vedleggslisten; manifest.json forklares som filoversikt som beholdes med vedleggene. Ingen handler, eksportformat, backend eller knappnavn endres. Miljømål BEGGE, først samme feature/Sandbox. Neste faglige B/C-punkt er fortsatt øvrig vedleggsdekning og versjonerte underskjema; deretter påminnelser/kildeoppdatering før HR. Gjenværende prøver videreføres uten å gjenta godkjent ZIP-nedlasting.

---

## KS/HMS: vedleggspakke – feature/Sandbox READY

Kenneth ga **TEST OK 9. oktober 2026 kl. 01:29 Europe/Oslo** for samlet dokument-/tilsynsuttrekk på publisert head `c5e128c6fde2d0fb1368accb78a9414c05f0c81d`. HJELP, architecture og README var oppdatert ved godkjenningen. Tidligere TEST OK beholdes, inkludert egen SJA-PDF kl. 00:59. Dette er ingen Production-/merge-/e-postgodkjenning.

Funksjonskode **42a38e91** / tree **96ed970e**, READY **dpl_HY7SG3fjVEMjYJtV4JR8nkYnMvKa**, Core Safety **37860831491** / full critical build **113595879925** success. Innlogget ZIP med to allerede lagrede Voldsløkka-bilder + manifest (381240 byte) PASS: CRC, JPEG-er, riktige dokument/revisjon/punkt og SHA-256 kontrollert. Bekreftelse, tomt omfang, nullstilling og RUH uten vedlegg PASS. Publisert HJELP kontrollert. Eksisterende samle-PDF med SJA/signatur og begge vernerundebilder fortsatt PASS (5 sider). Én fane, alle popup lukket, ingen lagrede data mutert. Eksakt bevis/handoff i CONTINUITY. Ny ZIP-TEST OK, private RUH-originaler/prosjektkontrollvedlegg innlogget, mobil/flere brukere gjenstår. ZIP har egen ny brukerprøve. PR #216 forblir draft; samme Preview, main og Production urørt. [Scope](docs/kshms/ATTACHMENT_ARCHIVE_20261009.md).

---

## KS/HMS: valgt samlet uttrekk – feature/Sandbox READY

Funksjonskode `8d045d0cd9956d47d93e1b606b75eef7097dda32`, tree `ded14b7df45dc08e810ed569c2630e6e8e65a033`, READY `dpl_FpiuDdxSxd5yaauYXkSgpKfDcmC3`; Core Safety `37858562063` / full critical build `113588549210` success. Ny intern managerflate Dokumentuttrekk med eksplisitt valg av åtte dokumentgrupper, full RUH-historikk/private bilder og manifest. Innlogget faktisk PDF: seks dokumenter/12 sider; uten rutine fem/10 sider. SJA-signatur, begge RUH-hendelser og to faktiske vernerunde-bilder bevart. Én fane, popup lukket; ingen lagrede data mutert. Lokale relevante React/PDF og full Sandbox build PASS. [Scope og QA](docs/kshms/INSPECTION_EXTRACT_20261009.md), [eksakt bevis/handoff](docs/kshms/CONTINUITY.md), [kort ny prøve](docs/kshms/USER_TEST.md).

Samme branch-Preview og tidligere TEST OK beholdes; samlet uttrekk TEST OK 9. oktober kl. 01:29. Neste B/C: øvrig vedleggsdekning/versjonerte underskjema/påminnelser/kildeoppdatering før HR. PR #216 fortsatt draft, main uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Ingen Production-release, main/demo-merge eller ekte e-postsending; KS/HMS-utsending forblir deaktivert. Etterfølgende beviscommit endrer bare dokumentasjon/skjermbilde.

---

## Publisert rutine-/sjekkliste-PDF – READY

Funksjonskode **64143a3a4a982f442bbafcacaf40d535073751a8**, tree **86813dd63f72714995ea88bf71d26bd7b72cb571**. Hver publisert blob og samlet tree er identiske med lokal testet commit bb4b0053. Git-push manglet skriveinnlogging; GitHub-koblingen publiserte samme tree med expected-head aea7e766 og uten force. Ingen lokal branchhistorikk er slettet.

Fast Sandbox Preview er **READY** på **dpl_83H3TYNf6vdiwWqZuRU8LTT3m5WV**, eksakt funksjons-SHA og alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app. **PR Core Safety 37846961060**, jobb **Core safety + critical build 113550101731**, completed/success. Endelig lokal full Sandbox critical/build PASS exit 0. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, gitBranch feat-kshms-foundation er kontrollert. PR #216 er open/draft; main er uendret **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Samlet branch-diff etter funksjonscommit: 196 filer; ny avgrenset slice: 20 filer.

Neste er bare den nye korte rutine-/sjekkliste-PDF-prøven i USER_TEST.md. Fem faktiske React/jsPDF-uttrekk, tre berørte eksisterende React-flyter, permanent critical og visuell PDF-kontroll PASS. Transport/innlogging var simulert; innlogget bruker-/mobilprøve er ikke hevdet. Tidligere TEST OK og separate åpne oversikts-/kontroll-/risiko-/popup-prøver beholdes. Ingen ny database-/Production-/main-/demo-endring, e-postaktivering/sending eller HR. Øvrige B/C-punkter består. Etterfølgende ren dokumentcommit lagrer dette beviset uten funksjonsendring.

---

## Rutine- og sjekkliste-PDF – avgrenset B/C-del, 8. oktober 2026

Utgangspunkt feature-head `aea7e76672380e8e914a234d8cc9ae9b629434c3`, main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Miljømål BEGGE, bare samme feature/Sandbox nå. Tidligere TEST OK og åpne nye delprøver beholdes. PR #216 er draft. Ingen HR, Production/main/demo-release, databaseendring eller ekte e-postsending.

Egne PDF-er fra godkjente rutineutgaver, publiserte sjekklistemaler og lagrede prosjektkontroller er implementert. Rutine viser R-nummer/utgave, firmaets lagrede tekst, godkjenner/kilder og ID/hash. Egen ansattbekreftelse og andre ansattes opplysninger eksporteres ikke. Historiske kontooppslag merkes når navnesnapshot mangler. Sjekklistemal er tydelig tom mal; upublisert kladd tas ikke med. Prosjektkontroll viser eksakt lagret mal-ID, kontroll/revisjon, svar, kommentarer, bilder og eventuell lagret fullføringsidentitet/tid. Utkast merkes under arbeid; kontrollens fullføring lukker ikke avvik. Filvedlegg er navngitt med tydelig beskjed om at originalfilen ikke følger PDF-en. Ingen automatisk rapport-/portaldeling.

Eksisterende lesende RPC-er og firmaprofil brukes. Tilgang og samme utgave kontrolleres både før og etter PDF-/bildeinnlasting. Prosjektkontroller beholder eksisterende prosjekttilgang uten krav om personlig KS/HMS-grant. Nye/ulagrede kontroller og redigerte svar sperres. Manglende bilde stopper eksport; manglende logo gir firmanavn og synlig beskjed. Filadresser/token kommer ikke i PDF-en. Profil-, bruker-, skjerm-/dokumentbytte stopper sene uttrekk. Ingen automatisk save/publish/sign/complete.

Utviklerprøver: permanent ny document-PDF-critical PASS; fem faktiske React/jsPDF-uttrekk PASS med simulert RPC, inkludert rutine i Les og bekreft/Min personalhåndbok, mal ved endret utkast, fullført kontroll og utkast. Langtekst, logo/bilde, ikke-bekreftelse, ulagret sperre, nyere revisjon, tilgang tilbakekalt etter bildefremhenting og sent brukerbytte er prøvd. Tre eksisterende React-flyter for sjekklistesentral/prosjektpopup/workspace PASS; lagring/gjenåpning/fullføring/historikk/kladd/konflikt/legacy er bevart. Poppler-layout kontrollert på lang rutine (7 sider), mal (1 side), fullført kontroll/utkast (3 sider). Ingen kutt/overlapp; sider og originalbilder er beholdt. Endelig full Sandbox critical/build etter hjelpeoppdatering PASS, exit 0. Eksisterende bundle-size-advarsel består. Ingen ny innlogget mobil-/flere-konto-PASS hevdes.

Publisering/CI/READY er bekreftet i beviset ovenfor. Neste er kun den korte nye PDF-prøven i USER_TEST.md. Øvrige B/C-punkter (full vedleggsdekning, versjonerte underskjema, RUH-bilder/historikk, tilsynsuttrekk, påminnelser/kildeoppdatering) gjenstår før HR. Samme faste Preview; ingen gamle TEST OK gjentas automatisk.

---

## Publisert kompakt prosjektoversikt – READY

Funksjonskode **990ce731d983c8f6bbfd92b8498723d03c956868**, tree **18151a4384ba493e166801500bd5af7d09b78aee**. Lokal testet og publisert source tree er identiske. Fast Sandbox Preview er **READY** på **dpl_Gm7bVWwzsQ7N3nrcXiaL32RQbebW**, alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app, med eksakt SHA. PR Core Safety **37844000342**, jobb Core safety + critical build **113540184367**, completed/success på samme SHA. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, gitBranch feat-kshms-foundation er kontrollert. PR #216 er fortsatt open/draft. Main står uendret på **155f6c4ac01f126c1db0c65da385cfd9305587d5**.

Neste er den korte oversiktsprøven i docs/kshms/USER_TEST.md. Alle 14 skjermbilder er lest. Tidligere TEST OK består; denne UX-delen og PDF-prøven har fortsatt ikke egen bruker-TEST OK. Ingen main-/Production-/demo-, database- eller e-postendring i UX-runden. En etterfølgende ren dokumentcommit registrerer dette beviset uten funksjonsendring.

---

## Prosjektoversikt – sammenfolding, 8. oktober 2026

Kenneths 14 skjermbilder er lest. Avvik/SJA/RUH er gjort kompakt i samme feature/Sandbox: fire lukkede dokumentgrupper med antall/status, og lukkede grupper/rader for sjekkpunkt- og prosjektavvik. Åpne avvik står først; ansvarlig og frist vises på raden. Nye prosjektavvik åpnes etter lagring. Miljømål BEGGE, først Sandbox Preview; tidligere TEST OK består.

Faktisk React/DOM med simulert RPC PASS: metadataantall, folding, bevart redigering, ny sak synlig etter lagring, offline/tapt tilgang/sene svar, låst prosjekt, legacy-lukking og koblet KS/HMS-sak. Eksisterende prosjekt/SJA/RUH- og gjennomføringsprøver PASS. Ingen ny innlogget mobil-/flere-konto-PASS hevdes. Full Sandbox critical/build PASS med exit code 0. Publiseringsbevis er bekreftet ovenfor. Ingen database-, e-post-, main-, Production- eller demo-endring i denne UX-runden. PR #216 beholdes draft.

Neste er den korte oversiktsprøven øverst i docs/kshms/USER_TEST.md. PDF-prøven under den er fortsatt åpen. [Omfang og kontroller](docs/kshms/PROJECT_OVERVIEW_20261008.md).

---

## Publisert kontroll-/risiko-PDF – READY

Funksjonskode **c6dc21d5073388eb4c57ce16eed447887ff17495**, tree **5642f9df18d308124fcf970b8f6900e702e00785**. Lokal testet og publisert source tree er identiske. Fast Sandbox Preview er **READY** på **dpl_AF8RKPJdjkFDcfSu32MPDauYy3xG**, alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app, eksakt funksjons-SHA. PR Core Safety **37840420573** og jobb Core safety + critical build **113528082970** er completed/success på samme SHA. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, er kontrollert. PR #216 er open/draft. Main står uendret på **155f6c4ac01f126c1db0c65da385cfd9305587d5**.

Neste er bare ny PDF-prøve øverst i USER_TEST.md. Ingen gammel TEST OK gjentas. PDF-leveransen er utviklertestet/publisert, men egen bruker-TEST OK for denne nye delen er ikke mottatt. Øvrige B/C-punkter før separat HR og pilot består. Ingen Production-migrasjon/merge/deploy eller reell e-postsending. Etterfølgende ren dokumentcommit registrerer dette beviset uten funksjonsendring.

---

## Gjeldende leveranse – kontroll-/risiko-PDF 8. oktober 2026

Kenneths «kjør» autoriserer neste avgrensede PDF-del i samme feature/Sandbox. Avklarte valg: lagrede kontrollbilder, farget 5×5 med detaljer, lagrede utkast tydelig under arbeid, både egen PDF og valgfritt prosjektvedlegg, firmaprofilens navn/logo. Miljømål BEGGE; først Sandbox. Ingen main-/Production-/demo-endring eller reell e-postsending.

Egen **Last ned PDF** og **Velg KS/HMS til rapport** er implementert. Fersk lesing kontrollerer tilgang/revisjon; ulagrede endringer stopper egen PDF. Lagrede identiteter, rutine-/malutgaver og egen fullføring beholdes. Forventet risiko er tydelig skilt fra kontrollert effekt; fullført kontroll lukker ikke avvik. Utkast kan eksporteres, men får ingen oppdiktet fullføring. Bare uttrykkelig valgte prosjektdokumenter følger rapporten, og portal får ingen KS/HMS-data.

Sandbox-migrasjon **20261008202524_kshms_execution_report** er anvendt. Ny lesende RPC; gamle SJA/RUH-RPC-er og kommandoer er uendret. **79** faktiske SQL-assertioner PASS med full rollback. Faktisk React/jsPDF: tre egne PDF-er og syv prosjektrapport-PDF-er/fire utskrifter PASS med simulert transport. Lange dokumenter, bilder/logo, matrise og kombinasjon er visuelt kontrollert. Permanent critical og full Sandbox build PASS. Ingen ny innlogget mobil-/flere-konto-PASS eller brukerens TEST OK for PDF er hevdet. Signert SJA/rutineutgaver har samme fingeravtrykk; e-post-enabled=false. [Detaljer](docs/kshms/EXECUTION_PDF_20261008.md).

Publisering/CI/READY er bekreftet ovenfor. Fortsett med den korte nye PDF-prøven i USER_TEST.md; tidligere godkjente deler gjentas ikke. Fullplanen A–E og øvrige vedlegg/rapporter/påminnelser/HR består.
---

## Gjeldende avklaring – eksisterende Resend, Sandbox uten reell sending

8. oktober 2026: Kenneth autoriserer videre kontroll og gjenbruk av eksisterende Resend. Sandbox/Preview holdes uten ekte KS/HMS-e-post; tidligere krav om å sette Sandbox-hemmeligheter/aktivere der er erstattet. Lesende Production-kontroll bekrefter smart-worker v18 ACTIVE med RESEND_API_KEY/CHAT_FROM_EMAIL. KS/HMS-kilde bruker allerede de samme prosjekthemmelighetene; smart-worker/payload endres ikke. Sandbox har også smart-worker v18, så eldre e-posttester kan ikke utelukkes; metoden er ikke gjenfunnet. KS/HMS enabled=false er direkte SQL-verifisert. Dagens permanent-test bruker providerstub, ikke innbokslevering. Se [gjeldende oppsett](docs/kshms/EMAIL_SETUP.md).

Miljømål BEGGE; kun dokumentasjon endres i denne runden. Ingen Production-merge/DDL/deploy, ingen hemmelighetsendring og ingen sending. Før senere uttrykkelig godkjent release: gjenbruk Production-konfigurasjon, riktig Production-origin/endepunkt, autentisert check uten sending og kontrollert mottaksprøve. Tidligere QA/popup/Preview-bevis består; ikke bygg om ferdig kobling.

# Gjeldende release-status – 8. oktober 2026

Miljømål: **BEGGE**, først feature/Sandbox Preview.

## Production

Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Production Vercel `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`, https://expo-proffdok.app, Supabase `dqffxflaoyarbxyiyhop`. Ingen KS/HMS-produksjonsmigrering, merge eller release er utført.

## Aktiv branch og Preview

Branch `feat-kshms-foundation`, [PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216), open/draft. Fast [Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe), backend ppvircenkjizeiqdxphj. Nyeste funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`, READY med grønn CI (bevis nedenfor). Tidligere prosjekttillegg: Funksjonskode `8bce982fb75bf105ee614601e604e438f89a78bc`, tree `ed17f78782d6a49944bd55be6b008d0ef29995e9`. Fast Sandbox Preview er READY på `dpl_4gwb3VsRp7Wf2GWmRrxFNre8DY87`, med samme feature-alias og eksakt SHA. PR Core Safety `37827572425` og jobb Core safety + critical build `113484256816` er completed/success på samme SHA. Lokal og publisert tree er identiske. Tidligere funksjonskode med kladdrettelsen `cdac7cf1fe50b724bb87163422e5a0424b01fd58`, tree `47f6249fb6433a6181c9ac94256dd862b097f3bd`: samme faste Preview er READY på `dpl_7ViZBuSk1G3bjNJ8vUfozN2u8Qhn`. PR Core Safety `37788569184`, jobb Core safety + critical build `113349595488`, er completed/success på samme SHA. Branch-spesifikk `EXPO_BACKEND_TARGET=sandbox` er kontrollert (target preview, branch feat-kshms-foundation). Senere dokumentregistrering endrer bare notater. Bevis: [EXECUTIONS_20261008.md](docs/kshms/EXECUTIONS_20261008.md).

## Popup og ansvarse-post – publisert og grønn

Prosjekttilleggets TEST OK er registrert 8. oktober kl. 21:04 Europe/Oslo. Fullført-popupen lukker etter bekreftet lagring/readback. Ansvarse-post omfatter alle dagens KS/HMS-oppgavetyper, pliktig rutinegjennomgang og forfalt håndbokrevisjon. 36 nye + 45/54/73/93 relevante rollback SQL-kontroller PASS; faktisk React/DOM med simulerte RPC-er og permanent mailer-/lenkeprøve PASS. Full Sandbox critical/build PASS exit 0. Signert SJA/rutineutgaver er uendret. Sandbox-migrasjon 20261008192529 og mailer v4 ACTIVE. Faktisk check HTTP503 viser manglende Resend-nøkkel og avsender; enabled=false, ingen ekte sending. Samme feature-Preview er READY med grønn CI. Funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`. Samme faste feature-Preview er READY på `dpl_HNUqhySypafZmk9d9CaQXSUVZcVn` med eksakt SHA/alias. PR Core Safety `37833698123`, Core safety + critical build `113505254109`, completed/success. Lokal og publisert source tree er identiske. Preview-binding EXPO_BACKEND_TARGET=sandbox er kontrollert for feat-kshms-foundation. Ingen Production-endring. Se [testbevis og omfang](docs/kshms/NOTIFICATIONS_20261008.md) og [oppsett](docs/kshms/EMAIL_SETUP.md).

## Prosjekttillegg – publisert og grønn

Originalarbeidet er gjenfunnet etter environment_offline; forbindelsen er tilbake. Vernerunde/5×5 har prosjektinnganger, separate prosjektoversikter/kladder, fast ansvarligvarsel til lagret egen fullføring, valgbare godkjente rutineutgaver og stor avkrysning ved fullføringsknappen. 44 nye rollback SQL-kontroller, faktisk React-prosjekt/varsel/dialog og eksisterende relevante scenarioer PASS. Ny Hjelp og kort testliste er oppdatert. Ingen ny DDL i gjenopprettingen. Full sluttbygg/critical-kjede PASS med exit code 0; CI og fast Preview er bekreftet grønne på 8bce982f. Se [prosjekttillegget](docs/kshms/PROJECT_EXECUTIONS_20261008.md).

## Ny leveranse – vernerunder/kontroller og 5×5-risiko

Begge verktøyene ligger i KS/HMS og kan brukes med eller uten et faktisk firmaprosjekt. Utkast, egne sjekkpunkter/fast malutgave, svar/bilder, ansvar/frister, egen fullføring og bevart historikk er bygget. Kontrollavvik opprettes én gang via eksisterende sak/varsel. Risiko har tomme scorer, firmavurderte grenser, planlagt/kontrollert effekt og uttrykkelig beslutning. Fullførte dokumenter og historisk identitet beholdes.

54 faktiske Sandbox SQL-kontroller PASS med full rollback. Reell React-/dialogflyt med RPC-fixture og permanent kritisk prøve PASS. Signert SJA (1) og rutineutgaver (10) har samme fingeravtrykk før/etter. Migrasjon 20261008131207 finnes bare i Sandbox. Advisor-varslene om RPC-only RLS og tilsiktede SECURITY DEFINER-grants er vurdert mot faktiske negative tilgangsprøver; nye FK-indekser beholdes. Ingen generell advisor-opprydding er hevdet. Endelig full Sandbox critical/build PASS. Samme Preview er READY; publiseringsbevis står i [EXECUTIONS_20261008.md](docs/kshms/EXECUTIONS_20261008.md). Prosjekttillegget er TEST OK 8. oktober kl. 21:04; bare ny popup-prøve og senere faktisk e-postlevering gjenstår.

## Tidligere rapportleveranse og QA

Kenneths «kjør» kl. 13:38 autoriserer valgfri prosjekt-SJA/RUH i Rapport/PDF/utskrift. Dialogen brukes av alle tre eksportfunksjoner og viser bare prosjektets tilgjengelige dokumenter. SJA får lagret rutinehenvisning, deltakere/medvirkning og PL-signatur. RUH får hendelse/tiltak/ansvarlig/frist/status/egen kontroll/lukking. Utkast/åpne saker merkes. Ingen automatisk avkrysning eller ny lagring i prosjekt-/portal-JSON.

34 rollback SQL-kontroller PASS; faktisk React, 5 PDF-er med jsPDF 2.5.1, 3 utskriftsdokumenter og visuell kontroll av 12-siders lang PDF PASS. Eksisterende signert SJA og 10 rutineutgaver er bevart. Full endelig Sandbox critical QA/build, PR Core Safety og release-docs-guard PASS. Ny read-only RPC/migrasjon 20261008115650 er bare i Sandbox. Security Advisor: tilsiktet authenticated SECURITY DEFINER-grant er gjennomgått med funksjonens porter og negative tilgangsprøver. Ingen påstand om at alle eksisterende advisor-varsler er løst. Se [rapportomfang og QA](docs/kshms/PROJECT_REPORT_20261008.md).

## Kenneths tester

Rapporttillegget er TEST OK 8. oktober kl. 14:48 Europe/Oslo på kontrollert head 564778722c17d77358464de4fe465d02d336956e / funksjonskode f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c. Gjelder prosjektets rapportvalg og PDF med/uten SJA/RUH. Neste del er vernerunder/selvstendige kontroller og 5×5-risikovurdering; ingen Production-godkjenning.

Tidligere håndbok-, avvikspopup/lukking-, menyretur- og sjekklistepopup-prøver er TEST OK for sine prøvde leveranser. TEST OK 8. oktober kl. 01:28 Europe/Oslo for meny, RUH-inngang og norsk dato gjelder kontrollert head 42204af397fc1fb6187e7e475c951ecdcd007550. TEST OK kl. 13:30 for SJA-utkast/rutinenummer/lagring/gjenåpning og RUH-oppfølging/ansvarligvarsel/egen dokumentert lukking/bevart sak gjelder kontrollert head 75f6ba1f53817a17e4efb3cac778a63d3cfcb9c5. Dette godkjenner ikke hele KS/HMS eller Production. Rapporttillegget er også TEST OK kl. 14:48 og skal ikke prøves på nytt uten konkret feil.

## Gjenstående og neste handling

Bare de nye vernerunde-/risikoflytene i USER_TEST.md skal prøves nå; godkjente delprøver gjentas ikke. Første rapportdel har dokumenttekst og elektronisk signering/lukking; RUH-bildevedlegg og full endringshistorikk følger ikke med. Ingen ny innlogget nettleser-/mobil-/flere faktiske brukerøkter-PASS hevdes. Den eksisterende skynettleserfanen åpner fast Preview på innloggingssiden; tidligere avviste credential-kall gjentas ikke.

Vedleggs-/øvrige rapportuttrekk, separat HR/kompetanse/medarbeidersamtaler og fristpåminnelser gjenstår før Ringside-pilot som avtalt. Sandbox-e-postsending er deaktivert; avsenderoppsett/faktisk mottaksprøve gjenstår. Utførelse før HR; leder bare tildelte ansatte, firmaadmin alle/tildele ansvar. Relevant TEST OK og eksplisitt PRODUCTION GODKJENT for PR #216 kreves før Production-migrering/merge. Senere synkretning main → demo.

Fortsettelsespunkt: [OVERSIKT.md](docs/kshms/OVERSIKT.md) og [CONTINUITY.md](docs/kshms/CONTINUITY.md). Eldre release-status er bevart i [arkivet](docs/kshms/archive/CURRENT_RELEASE_STATUS_before_TEST_OK_20261008.md).
