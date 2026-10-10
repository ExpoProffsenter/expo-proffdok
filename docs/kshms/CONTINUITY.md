## Ny nøkkel passerer auth; første skyfase feilet – 11. oktober 2026 ca. 00:28 Europe/Oslo

Kenneths brukerbilde etter manuell kopiering fra hr_cloud_probe viser **ok:false, mode:ISOLATED_CLOUD_QA, stage:create, passed:[], cleaned:true**. Bare venstre headernavn og responsdelen ble inspisert; nøkkelverdifeltet ble ikke lest og originalbildet publiseres ikke. Responsutsnittet lagres som **HR_CONTROL_INITIAL_READ_FAILED_20261011.png**. Det viser ikke HTTP-status og hele runId er avklippet. Faktisk v6-kilde er hentet og matcher alle fem forventede filer. I denne koden kan responsen bare nås etter korrekt navngitt auth, body og Blob-binding. cleaned:true på denne feilstien betyr at skrivingen fullførte og oppryddingen kontrollerte egen fil som borte. stage:create omfatter også metadata og første ferske readback; dermed er årsaken ikke bevist som en skrivefeil. Ny nøkkel er akseptert i brukerprøven, men **ingen nye skyscenarioer PASS**. En smal metadataforespørsel i unified logs viste bare v6 Boot i tidsvinduet, ikke en uavhengig bekreftet respons eller rotårsak.

Miljømål **SANDBOX/DEMO**: kun kontrollprobe, tilhørende critical-check, ops-README, kontinuitetsnotater og sikker responsevidens. v7 skiller skrivefasen create, initial_write_metadata og initial_fresh_read, og returnerer bare en fast allowlist av errorCode-klasser samt created-flagget ved feil. Ingen providertekst, stack, URL, token, header, signatur eller private data returneres/logges. Ingen endring i auth, skytransport, signatur/CAS/readback, cleanup, appkode eller migrasjoner. Alle tidligere 38 scenarioer beholdt; sju presise skrive-/metadata-/readback-/providerfeil med lekkasje- og oppryddingsassertions: **45 syntetiske scenarioer PASS**. Full **EXPO_BACKEND_TARGET=sandbox npm run build PASS**. Tester er ikke faktisk skybevis.

Bare **expo-hr-control / amduqhmgmeetaatwlmmt** fikk **hr-cloud-probe v7 ACTIVE**, bundle SHA256 **cb4d94d88c3cfc1723b4eaddd3c5ef102f995d3a7f6926cff305063722f97247**; alle fem installerte filer samsvarer eksakt. Faktisk GET uten apikey/Authorization/cookies, med curl-konfigurasjon deaktivert, ga **HTTP 403 / service_only** også etter v7. Ingen ny autentisert v7-skyprøve er gjort. Neste konkrete prøve er én Send Request med samme manuelt innlagte nøkkel/body for å lese presis fase/feilkode; ikke flere nøkler eller generell gjentakelse av gamle TEST OK.

Før endringen er faktisk PR #217 fortsatt open/draft, head **982da99ddcdded8a1c8aeed7b8d1d26e4216573d**, tree **e39532a5019dd1e149eba6747b3c12b0919ef92a**, Core Safety **38090703675 SUCCESS**, READY Preview **dpl_6FRudhzvwgogaAanfjQFVp8BYjHB**. Main **c3d873e0** / READY **dpl_BHpnnv8bnyo8wU3oLUE9NEsgixd5** og demo **11f1b45d** / READY **dpl_3uegJLq87zotYZFvFQQpfLM5vEsw** kontrollert uendret. Begge private HR-porter content_enabled=false/restore_quarantined=true; Production uten ack-tabell; kontrollprosjekt **0 checkpoints/aktive bindinger/låser**. Nettleservernets manuelle stopp beholdes; ingen ny automatisk nettleserhandling eller credential-omvei.

Default-nøkkelen er fortsatt ikke tilbakekalt; manuell utskifting må fullføres. Den tidligere ni-punkts sky-PASS med syntetisk minneanker er historisk, ikke et nytt v7-resultat. Restfil fra avbrutt historisk kjøring, betrodd bootstrap/varig anker, kontroll-ack, scheduler/varsling og full isolert database/Auth/Storage-byte-restore gjenstår. Ingen merge, HR-åpning eller Production-overføring.

## Kontrollnøkkel finnes i faktisk runtime; avvisning uten nøkkel verifisert – 11. oktober 2026 ca. 00:15 Europe/Oslo

Kenneths neste bilde ble kun inspisert som et venstreutsnitt for headernavn: **én apikey-rad**, ikke flere. Originalbildet er ikke lest i full bredde eller publisert, fordi det kan inneholde nøkkelfelt. En ekstra header-rad er dermed ikke dokumentert som årsak til den tidligere service_only-avvisningen.

Miljømål **SANDBOX/DEMO**: bare isolert kontrollverktøy, tester og driftsnotater. Kontrollfunksjonen skiller nå mellom manglende/ugyldig hr_cloud_probe-binding (**403 / control_key_not_configured**) og avvist request (**403 / service_only**). Samme eksakte navngitte nøkkel, prefix-/lengdekrav og konstant-tid-sammenligning før skyoperasjoner; ingen nøkkelfallback, verdi, nøkkelliste eller requestheader returneres/logges. Alle tidligere 31 scenarioer beholdt; sju nye kontroller for manglende/feil konfigurasjon, gammel nøkkel og kombinerte apikey-headere: **38 PASS**. Full **EXPO_BACKEND_TARGET=sandbox npm run build PASS**, PR-scope-/release-guards og diff-check PASS.

Bare **expo-hr-control / amduqhmgmeetaatwlmmt** fikk **hr-cloud-probe v6 ACTIVE**, bundle SHA256 **9dfeaad7b2e76594abb18b4403e7b142592813c915cd4edcf5cba6c880f4cc25**. Faktisk HTTPS GET til kontrollfunksjonen, uten apikey/Authorization/cookies og med curl-konfigurasjon deaktivert, fikk **HTTP 403 / {ok:false,code:service_only}**. Med v6-kontrollen betyr dette at den navngitte runtime-bindingen er gyldig konfigurert, mens forespørselen uten nøkkel avvises før noen skyoperasjon. Ingen hemmelig verdi ble lest. Dette er **ikke** vellykket autentisering med Kenneths kopierte nøkkel eller nye Blob-/ack-/restoreprøver.

Neste konkrete handling: Kenneth kopierer nøkkelverdien på nytt fra kopierikonet ved **hr_cloud_probe** i kontrollprosjektets Secret keys, erstatter verdien i den eneste apikey-raden og sender eksisterende isolerte testbody. Dette er en konkret feilsøking av faktisk tilgangsavvisning, ikke gjentakelse av tidligere app-TEST OK. Den gamle default-nøkkelen forblir urørt frem til ny-nøkkel-resultatet er kontrollert. Nettleservernets tidligere manuelle handoff/stopp beholdes; ingen nye automatiske browserforsøk, reset eller loginomvei.

Faktisk main **c3d873e0** og demo **11f1b45d** kontrollert uendret. PR #217 fortsatt open/draft; før endringen head **21eed46ad815e77deef1df04a3ec4aa91114b4eb**, tree **1ab373861c8683b752e4e2cb963a80b5bfb4b778**, Core Safety **38090195722 SUCCESS**, eksakt READY Preview **dpl_68KExxMHhcnBpSkXwDq7uBqNSkqx**. Ingen appkjerne, migration, aktiv DB-binding, bootstrap, scheduler, merge, Production-ack eller HR-åpning. Tidligere faktisk sky-PASS med kjent syntetisk minneanker står som historikk; varig anker/ack/full isolert byte-restore gjenstår.

## Ny manuell tilgangsprøve avvist; nettleservern begrenser kontroll – 11. oktober 2026 ca. 00:08 Europe/Oslo

Kenneth meldte «test sendt» og vedla bare responsdelen. Bildet **HR_CONTROL_AUTH_DENIED_20261011.png** viser `ok:false` og `code:"service_only"`. Det viser ikke HTTP-status, målprosjekt, nøkkelheader eller kjørings-ID. Dermed er faktisk autentisering med den nye nøkkelen **IKKE PASS**; bildet beviser ikke hvilken nøkkel som ble sendt. Denne avvisningen skjer før skyoperasjonene. Ingen ny vellykket Blob-/ack-/restoreprøve hevdes.

Supabase-connectorens faktisk installerte **hr-cloud-probe v5** ble hentet som kildefiler og sammenlignet med alle fem forventede deployfiler: **eksakt likhet**, inkludert bindingen til **hr_cloud_probe**. Bundle fortsatt **a3ef9becdf845ce02c141395bbb41d8f738988cec517335e015dbd49ba3b7a2b**. Ingen funksjonsendring, ny deploy, nøkkellesing eller svekket auth. Den tidligere default-nøkkelen er ikke fjernet; manuell utskifting er fortsatt ufullført. Neste konkrete kontroll er én apikey-rad med brukerens manuelt kopierte verdi fra hr_cloud_probe, før eventuell ny prøve. Ingen nøkkelverdier skal sendes i chat eller bilder.

Nettleservernet meldte retained_data_restricted og instruerte én ny fane. Ny fane på funksjonsoversikten virket; gammel fane ble lukket. Påfølgende klikking og loggoppdatering ble igjen begrenset av credential_observation_restricted. Dokumentert navigasjon til nytt dokument ga kjørehistorikk, men siste synlige rad var bare **10. oktober 23:52:51 / 403**, ikke en verifisert ny kjøring. Refresh ble blokkert; dokumentert manuell overtakelse ble utført, og automatiske nettleserhandlinger stoppet. Ingen reset-, innloggings- eller nyfaneløkke. Nåværende fane er kontrollprosjektets invocations-side.

Før dette dokumentasjonssteget var PR #217 **open/draft**, head **769557fdf3a9d55f7cbde979d40a87aa082dbb17**, tree **ae4b80ee4ba6b8050e49e5d999fa1a9242e38982**, Core Safety **38089447651 SUCCESS**, eksakt READY Preview **dpl_ACHTadvYuRZ85CPzg9xQYTb8UUJW**. Main/demo/Production/kursdata og private HR-porter er ikke endret. Ingen merge, bootstrap, scheduler, Production-ack eller HR-åpning. Innlagt QA-bilde inneholder bare sikker respons, ingen headers/nøkler.

## Navngitt kontrollnøkkel opprettet; default avvist – 10. oktober 2026 ca. 23:56 Europe/Oslo

Kenneth godkjente manuell utskifting av kontrollprosjektets servernøkkel og opprettet **hr_cloud_probe**. Navnet og riktig prosjekt **expo-hr-control / amduqhmgmeetaatwlmmt** er verifisert med målrettet DOM uten å lese nøkkelverdien. Bindestreker i første foreslåtte navn ble avvist av UI; korrekt navn bruker understrek. Den tidligere default-nøkkelen er fortsatt aktiv i Supabase og **ikke tilbakekalt**. Blob-tokenen er ikke lest eller endret.

Kontrollfunksjonen **hr-cloud-probe v5 ACTIVE**, bundle SHA256 **a3ef9becdf845ce02c141395bbb41d8f738988cec517335e015dbd49ba3b7a2b**, godtar nå bare `SUPABASE_SECRET_KEYS.hr_cloud_probe` på apikey med samme konstant-tid-sammenligning. Ingen generell aksept av alle servernøkler. Eksisterende assertions er bevart; to nye regresjonsprøver avviser default-only-oppsett og den gamle default-verdien når begge navngitte nøkler finnes. **31 handler-/isolasjons-/feilscenarioer PASS**, faktisk pinnet SDK-kontrakt PASS med syntetisk HTTP og ekstern nettverking sperret, full **EXPO_BACKEND_TARGET=sandbox npm run build PASS**.

Supabases automatiske **Add secret key** setter fortsatt default i testpanelet. Faktisk POST med isolert testbody fikk **HTTP 403 / service_only** etter bindingen ble endret. Kun responsdelen ble observert og fotografert; ingen full AX/header-screenshot. Dette beviser avvisning av den automatiske gamle nøkkelen, **ikke** vellykket autentisering eller skyprøve med den nye. Faktisk ny nøkkel må legges inn manuelt av Kenneth og kontrolleres før default fjernes. Hele utskiftingen er derfor **ikke ferdig**. Den tidligere faktiske ni-punkts Blob-kjøringen med d51b7230 er historisk gyldig bevis; ingen ny full sky-/ack-/restore-PASS hevdes.

Faktisk remote main **c3d873e0**, demo **11f1b45d**, PR #217 open/draft head **19630a88** og eksakt READY Preview **dpl_3GskR2C6QCrawwdDAPNYGDmtAkay** ble kontrollert før endringen. App-/migrasjons-/schedulerkode er ikke endret. Privat HR skal fortsatt være stengt. Én tidligere syntetisk restfil og betrodd bootstrap, varig anker, isolert kontroll-ack, scheduler/varsling og database/Auth/Storage-byte-restore gjenstår. Ingen merge eller Production-overføring.

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

Forsøk på å åpne det nye kontrollprosjektets Edge Functions-side for å klargjøre server-only tokenprovisionering ble avvist av automatisk godkjenningskontroll: navigasjonen ble tolket som credential-probing, med manglende autorisasjon til lesing/håndtering av hemmeligheter. Ingen secret-side eller nøkkel ble åpnet/lest/endret. Ingen reset, omvei eller nytt forsøk. Fortsett bare med eksplisitt avklaring av denne konkrete navigasjonen/provisioneringen; token skal angis av brukeren selv til expo-hr-control, aldri i chat/git/VITE. Betrodd anker, Edge/runtime, faktisk sky, scheduler/varsling og isolert database/Auth/Storage-byte-restore gjenstår. Kontrollprosjekt fortsatt uten aktive bindinger/ankre/låser/Edge Functions; Production/demo/main uendret og privat HR stengt. [Eksakt binding og QA](HR_SUPABASE_CONTROL_20261010.md).

## Kontrollprosjekt opprettet og første tekniske QA levert – 10. oktober 2026 ca. 22:47 Europe/Oslo

Kenneth fullførte opprettelsen av **expo-hr-control / amduqhmgmeetaatwlmmt**, ACTIVE_HEALTHY, Micro, eu-west-1, samme godkjente organisasjon og $10/måned-grunnramme uten betalte tillegg. Ett prosjekt til senere Production-vern; ingen permanent kursjobb. Privat checkpoint/lås og fire service-only RPC-er er installert bare der via separate ops/hr-control-migrasjoner (live 20261010204017/20261010204144). Etter rollback: 0 checkpoints/aktive bindinger/låser/Edge Functions. 37 faktiske PostgreSQL-assertions PASS i kontrollprosjektet og PGlite; 21 faktiske adapterfeilscenarioer PASS med syntetiske transporter. Eksisterende filoperator/20 tester uendret PASS; full EXPO_BACKEND_TARGET=sandbox critical/build PASS. Ny adapter krever ISOLATED_QA, avviser aktive miljøer som kilde, kontrollerer varig readback/skyread før ack og beholder lås ved ukjent utfall. Ingen automatisk takeover/bootstrap. Ny sjekk lagt til Core Safety uten å svekke eksisterende tester. Supabase-standard auto-RLS-eventtrigger fikk offentlig kjørerett tilbakekalt; faktisk rollback-DDL bekreftet fortsatt auto-RLS. Advisor: ingen WARN/ERROR, én tilsiktet INFO for RLS uten offentlig policy.

Begrenset Blob-token og faktisk resource-ID/token-ID/origin/SDK-binding, betrodd bootstrap, Edge/runtime, skytester, scheduler/varsling og full isolert database/Auth/Storage-byte-restore gjenstår. Ingen betrodd produksjonsanker eller full sky-/restore-PASS. Ingen restore av aktive miljøer/kontrollprosjekt. Main c3d873e0 og demo 11f1b45d uendret; begge private HR-porter false/quarantined=true. PR #217 draft, ingen merge/Production-ack-tabell/appendring. Tidligere TEST OK og testmailens dokumenterte mottak beholdes. Tidligere status om ikke opprettet prosjekt er historikk. [Ressurs og bevis](HR_SUPABASE_CONTROL_20261010.md), [eksakt kontrollkontrakt/QA](../../ops/hr-control/README.md).

## Production-formål avklart; kursressurs skal ikke bestilles – 10. oktober 2026 ca. 22:29 Europe/Oslo

Kenneth presiserte at Sandbox bare brukes til kurs. Varig H5b-kontroll foreslås som ett selvstendig **expo-hr-control** for senere Production, innen allerede godkjent organisasjon/Micro/EU/$10-månedsramme uten betalte tillegg. Kursdemoen trenger ingen egen permanent kontrolljobb med privat HR stengt. Main betyr kodegren; Production betyr aktiv app/backend/reelle data. Tidligere expo-hr-control-sandbox-oppskrift blandet test og varig drift; den er nå uttrykkelig korrigert. Ferskt list_projects viser bare eksisterende Production-prosjekt; ingen ny kontrollressurs. Opprettelsen er satt på vent uten å inspisere brukerens eventuelle manuelle passordsteg. Før bruk: isolert syntetisk sky-QA, separate test-/Production-bindinger/nøkler/ankre, faktisk isolert database/Auth/Storage-byte-restore og scheduler/varsling. Ingen restore av aktive miljøer/kontrollprosjekt, automatisk ombinding av eksisterende Sandbox-operator, Production-migrasjon, PR #217-merge eller HR-åpning. Ekstra betalt restoretestressurs inngår ikke automatisk i $10-rammen. Tidligere TEST OK består; utvikleren eier teknisk QA. Siste kontrollerte dokumentasjonshead før denne presiseringen 2d688e959a96035109bccb26b0dcb47d53a0c79c, Core Safety 38083571980 SUCCESS og READY dpl_3FGcP1LLgt5fg1VSzEwt9b4zH4zZ; funksjonskode fortsatt ecd700ac. [Gjeldende ressursformål](HR_SUPABASE_CONTROL_20261010.md).

## Supabase-konto/pris kontrollert; opprettelsesskjema klart – 10. oktober 2026 ca. 22:22 Europe/Oslo

Kenneth bekreftet eksisterende organisasjon og ekstra grunnkostnad opptil $10/måned uten betalte tillegg. Faktisk sikker Supabase-eierøkt bekrefter Ringside-fakturakontotilhørighet; ExpoProffsenter's Org er arbeidsområdenavnet. Ingen faktura-/betalings-/eier-/spend-cap-endring. Nytt opprettelsesskjema viser faktisk $10/m for Micro; expo-hr-control-sandbox, EU/Ireland eu-west-1, ingen GitHub-kobling, Data API på, automatisk tabellprivilegering av, automatisk RLS på. Passord og Create new project gjenstår til brukerens manuelle credential-steg. Confirm_cost er UNAVAILABLE, ingen gyldig bekreftelses-ID eller create_project-API-kall. List_projects viser fortsatt bare eksisterende Production-prosjekt. Ingen nytt prosjekt/anker/adapter/scheduler/sky-/restore-PASS, ingen merge eller HR-åpning. [Konkret skjema, faktisk pris og neste verifikasjon](HR_SUPABASE_CONTROL_20261010.md). Siste head før denne dokumentasjonen d3a93af9, Core Safety 38082670248 SUCCESS, eksakt READY dpl_4GJCPSiMVnQvDR4WP4B6VfhtM5oX; funksjonskode fortsatt ecd700ac.

## Main beskyttet; Supabase-kontrolldrift foreslått – 10. oktober 2026 ca. 22:05 Europe/Oslo

Faktisk main-regel 84605695 er opprettet og gjenåpnet: PR, Core safety + critical build fra GitHub Actions, up-to-date og ingen adminbypass; ingen force-push/sletting. Branch API protected=true/enforcement everyone/app_id 15368. Main/Production og demo fortsatt samme SHA/READY. Ingen appkode eller merge. Separat Supabase-kontrollprosjekt er konkret foreslått til Edge/pg_cron og varig transaksjonelt anker/lås; eksisterende filoperator endres ikke i dette steget. Supabase-org er faktisk Pro; ekstra prosjekt fra $10/måned er listepris, ikke kontotilbud/budsjett. Ingen nytt prosjekt/token/scheduler eller sky-/restore-PASS. Privat HR fortsatt stengt. Siste head før dokumentasjon bdd0b83c, Core Safety 38081733839 SUCCESS og eksakt READY dpl_58A2cfghU9Ti1waM4WjM734ahoAW; funksjonskode ecd700ac. Branch-påminnelse 11. oktober er allerede opprettet, ingen sletting. [Faktiske beviser](HR_LEDGER_OPERATIONS_20261010.md), [separat Supabase-scope og kostnad](HR_SUPABASE_CONTROL_20261010.md). Eldre avsnitt er historikk.

## Vercel-kostnad og Git-sikkerhet – 10. oktober 2026 ca. 21:56 Europe/Oslo

Faktisk main protected=false/rulesets=[]; GitHub detaljadminoppslag fikk 403. Beskyttelse anbefales før neste release, ikke installert. Foundation/merged PR #216 er innlemmet med 0 fildiff mot main; checkpoint og testbranch har 2/16 egne commits og beholdes til arkivkontroll. Branch-påminnelse opprettet for 11. oktober morgen, ingen sletting. Faktisk Vercel Total size: 14,26 GB deploys og 429,72 kB Functions; anslag $1,43/hel måned ved konstant volum før kreditt/avgifter. Team og ProffDok varsler 23. oktober 30-dagers retention i stedet for dagens Preview 180 dager/Production 1 år. Ingen opt-out, Save eller annen innstillingsendring. Supabase/HR Blob er separate; behold Production-/demo-aliaser og nødvendig rollbackhistorikk. H5b fortsatt blokkert på varig operatorvert/sikker tokenprovisionering og ekte sky-/restoreprøver. Siste forrige dokumentasjonshead fd8cd596, Core Safety 38081372877 SUCCESS, eksakt READY Preview dpl_Hu94FZuKdg7cB4rGc3N6CuufDFsk; funksjonskode uendret ecd700ac. [Presise faktiske kontroller og kilder](HR_LEDGER_OPERATIONS_20261010.md#git-sikkerhet-opprydding-og-vercel-varsel-ca-2156-europeoslo). Ingen merge, Production/demo-endring eller HR-åpning.

## Seneste lagerkontroll – 10. oktober 2026 ca. 21:48 Europe/Oslo

Kenneth fullførte Vercel-innlogging i samme cloud-fane. Faktisk eierøkt opprettet separat **expo-hr-ledger-sandbox**, **Private**, **FRA1**, ID `store_feUEeykOyyvZVMca`; tomt lager, ingen prosjekttilkobling eller env-kopiering. Det tidligere 403-avviste connector-opprettelseskallet ble ikke gjentatt. Lagerbegrenset token er ikke hentet/provisionert til operator; privat origin er ikke verifisert. Connectorens lesende oppslag på riktig ID/team returnerte 404, selv om lageret er synlig i eierøkten. Ingen bootstrap, sky-/ack-PASS, varig operator/scheduler eller restore påstås. Supabase kostnadsoppslag og native artifact-download er fortsatt blokkert. Production/main og demo fortsatt samme READY-kode; begge HR-porter false/quarantined=true, Production uten ack-tabell, Sandbox ledger disabled/1 medarbeider/0 receipts/acks/innhold/filer/jobber. Testmail er allerede sendt én gang og mottak dokumentert. H5b fortsatt bare draft PR #217; ingen merge eller HR-åpning. Eldre blokkeringer nedenfor er historikk. [Faktisk lagerbevis og neste driftstrinn](HR_LEDGER_OPERATIONS_20261010.md).

## Seneste driftssjekk – 10. oktober 2026 ca. 21:33 Europe/Oslo

Den ene testmailen er sendt og mottak dokumentert. H5b er fortsatt bare draft PR #217; main/Production og demo er uendret READY. Videre arbeid er faktisk blokkert av Vercels authenticator/recovery-steg, manglende dokumentert ny lagertilgang, utilgjengelig Supabase kostnadsoppslag og DNS-timeout ved ekte lokal Supabase-native artifact-download. Ingen lager/token, scheduler, database/Auth/Storage eller restore ble etablert. Privat HR fortsatt false/quarantined=true i begge miljøer; Sandbox ledger disabled, 1 medarbeider og 0 receipts/acks/innhold/filer/jobber. Ingen av disse blokkerte forsøkene er PASS. [Klargjort driftsoppskrift og eksakte blokkeringer](HR_LEDGER_OPERATIONS_20261010.md). Eldre status er historikk og bevarer tidligere QA/TEST OK.

## Gjeldende status – 10. oktober 2026 ca. 21:14 Europe/Oslo

PR #216 er merged; Production/main `c3d873e0` og demo `11f1b45d` er levert og ferskt kontrollert READY. Ny H5b er **bare draft PR #217**, funksjonscommit `ecd700ac`, siste kontrollerte dokumentasjonshead `287a80aa`, grønn Core Safety/READY Preview med direkte Sandbox-binding; ingen merge eller privat HR-åpning. Den tidligere blokkerte, uendrede **live Sandbox rollback-SQL-prøven bestod nå**; etterkontroll: 1 bevart medarbeider, 0 receipts/acks/innhold/filer/jobber, deaktivert binding og privat HR false/quarantined=true. Dette er faktisk DB-prøve med syntetisk filjobbflag, ikke ekte skylager-/Storage-byte-/restore-/browser-PASS. Kenneth fullførte manuell Production-innlogging; **én autorisert testmail til kenneth@ringside.no er sendt gjennom eksisterende systemadmin-testflyt** 10. oktober ca. 21:08 Europe/Oslo. Synlig bekreftelse: «Test er sendt kun til kenneth@ringside.no.» Ingen gruppesending; Kenneths vedlagte skjermbilde av åpnet e-post dokumenterer mottak med eksakt emne og melding. Dette er ikke ende-til-ende-bevis for KS/HMS-tildelingsarbeideren. Privat uavhengig lager, varig operator/scheduler og full isolert Supabase/Auth/Storage-restore gjenstår. [Eksakte miljøer, nye bevis og neste konkrete driftshandling](HR_LEDGER_ACK_20261010.md). Eldre avsnitt nedenfor er leveringshistorikk og overstyrer ikke denne statusen. Tidligere TEST OK beholdes uten omtest.

## HR: samtalemaler i menyen og sykefraværsoppsett – 10. oktober 2026

**Åpne samtalemaler** og **Åpne sykefravær** ligger i HR-snarveiene øverst. Firmaadmin kan klargjøre en generell sykefraværsmal med 11 spørsmål om arbeid, kontakt, tilrettelegging og oppfølging. Eksisterende admin-/firmagater, utgaver, CAS og kladdbevaring gjelder. Fristveiledning med NHO/NAV-kilder og et avgrenset regneeksempel for 4/7/8/26 uker; fullt og gradert fravær forklares ulikt. Ingen personlig sak, fraværsdata, påminnelse eller innsending opprettes.

**94 faktiske Sandbox-rollback-assertions og 94 PostgreSQL/PGlite-assertions PASS**, berørte faktiske mal-/register-/Hjelp-React-prøver og full critical/build PASS. Ingen nye sikkerhetsråd ved sammenligning uten observasjonstidsstempler. Privat innhold forblir stengt med restore quarantine. Miljømål BEGGE, levering bare feature/Preview/Sandbox. Tidligere TEST OK består. [Scope, kilder, leveranse og grenser](HR_SICK_LEAVE_SETUP_20261010.md).

## HR: tydelig hjelp der du arbeider – 10. oktober 2026

Synlig **Start her** viser oppsett → medarbeider/leder → samtalemal for firmaadmin, og relevant lesehjelp for leder/personlig bruker. Malbyggeren forklarer velg → tilpass → forhåndsvis/lagre, navn/tema/spørsmål, forberedelse/felles møte, kladd/Forkast og utgave/arkiv. En lagret mal starter ingen samtale og sender ingenting til ansatte. Bare presentasjon/hjelp; handlinger, roller, SQL og privat innholdsport beholdes.

Berørte faktiske HR-/mal-/Hjelp-React-prøver og full Sandbox critical/build PASS. Eksisterende tester beholdt uten nye speiltester. Miljømål BEGGE, bare feature/Preview; tidligere TEST OK beholdes. [Scope og bevis](HR_HELP_20261010.md). CI/innlogget visuell Preview kontrolleres etter publisering.

## HR: versjonerte samtalemaler – 10. oktober 2026

Firmaadmin får **HR → Samtalemaler**: årlig medarbeidersamtale, prøvetid og oppfølging, egne tema/spørsmål, medarbeiderforberedelse/felles møte, forhåndsvisning og tydelig **Lagre mal**. Immutable malutgaver, historikk, gjenbruk som ny kladd, arkivering/gjenåpning, paginering og avvisning av samtidige revisjoner. Kladd beholdes i midlertidig aktør-/firmabundet minne over fokus/remount, først etter fersk admin-tilgang. Ingen ansattes svar, personreferater, signaturer eller fraværsinnhold åpnes.

**91 nye faktiske rollback Sandbox-assertions PASS**, samme 91 i fysisk PostgreSQL/PGlite med syntetisk plattformadapter. Faktisk ny mal-React og berørt HR/register/KS-meny/Hjelp-React PASS; permanent critical og full Sandbox build PASS. Fem live funksjonskropper matcher lokale MD5-er, tomt search_path og riktige ACL. Sandbox-migrasjon **20261010005833**, CLI **20261010004928**. Eksisterende 1 HR-firma/1 medarbeider beholdt; 0 aktive utviklermaler/utgaver/artifacts/filer/receipts. Privat innhold fortsatt content=false/restore quarantined. Første live prøving ble korrekt avvist av eksisterende profile-guard under endring av egen syntetisk aktør; fixtureoppsettet ble korrigert til eksisterende systemaktør, uten endret guard eller produktkode. Hele første prøve rullet tilbake.

Miljømål **BEGGE**, bare feature/Preview/Sandbox, draft PR #216. Tidligere O3/B/C/PDF/ZIP og Kenneth TEST OK beholdes; ingen Production/main/demo/e-post. Uavhengig varig manifest/automatisk eksport og DB-ack/full isolert Supabase database- og Storage-restore gjenstår før privat HR-kontakt og individuelle samtaler/fravær åpnes. [Scope, kontrakt og nye bevis](HR_TEMPLATES_20261010.md).

**Faktisk mal-Preview-kontroll:** kode `70f12015b616e8e9b4c6e0efc06d82ab4e6df1ef`, Core Safety **38011669656 / jobb 114092844672 SUCCESS**, `dpl_6QTL7UM5H55ek25V7mrsqkEdyPys` READY med eksakt SHA/ref/prosjekt/fast alias. Direkte branch-env `EXPO_BACKEND_TARGET=sandbox`. Innlogget desktop: HR/admin, tre forslag, generisk kladd/redigering, tom forhåndsvisning, dirty bytte/Behold kladden, Oppdater maler med bevart kladd og Forkast PASS. Ingen testmal lagret. Ingen horisontal overflow; Lagre mal 44px. Lagret historikk/arkiv/CAS har SQL og React-bevis; mobil og separate samtidige browserøkter gjenstår. [Originalbilde og presise bevis](HR_TEMPLATES_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

**Faktisk O3 Preview-kontroll:** kode d4b5270e916dc06a764fbd35af36a8db6f238470, Core Safety 38009716896/jobb114086648809 SUCCESS, dpl_GKkbK6sdQd5si4yqYpeEd44NomJx READY eksakt SHA/Sandbox. Innlogget Skynett: ny kartvelger/bevart enkeltfirmakart/fokusretur/PDF to sider/fire demonavn PASS. Nytt felles kart er riktig skjult for demo uten to kvalifiserte firmaer; flerfirmahandlinger har SQL/React-bevis, ikke nytt browserbevis. Ingen aktiv rettighets-/kartendring. [Originalbilde og presise bevis](ORGANIZATION_GROUPS_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

## Organisasjonskart O3 – felles kart for flere firmaer, 10. oktober 2026

Miljømål **BEGGE**, leveres bare feature/Preview og Sandbox. Et separat felles organisasjonskart kan knytte **2–10 firmaer** sammen. Én brukerkonto kan ha forskjellig stilling og plassering i hver firmagren. Opprettelse lager Styret og sideordnede firmagrener; toppnavn og struktur kan redigeres med **Lagre kart**, og hele kartet kan slettes med uttrykkelig bekreftelse. Firmautvalget er fast i denne første versjonen. Eksisterende firmakart, brukere og HR beholdes.

**Hele felleskartet krever fersk KS/HMS i alle firmaene; redigering krever firmaadmin i alle.** En kartleder gir ingen ekstra redigering eller HR-innsyn. En bruker med ett firma ser sitt vanlige firmakart. Firmamedlemskap, avsluttet arbeidsforhold, tilbakekalling, firmagrense og revisjon kontrolleres på serveren ved hver handling. Ingen automatisk konto-/medlemskapsopprettelse eller modulaktivering.

**64 nye faktiske rollback Sandbox-assertions PASS**; fysisk PostgreSQL/PGlite **63 + 33 + 64 PASS**, faktiske nye/berørte React-flyter, permanent critical og full Sandbox build PASS. Felles PDF: **49 syntetiske personer / 51 firmaplasseringer / fire A3-sider**, alle tekst- og visuelt kontrollert. Samme person har tre ulike stillinger i tre firmaer. Dette er utviklerbevis, ikke nytt innlogget flerfirma-browserbevis. Sandbox-migrasjon **20261010002710** (CLI 20261010001921), ni live funksjonskropper/ACL/tomt search_path verifisert mot kilden. Ingen aktive felleskart opprettet, rettigheter utvidet eller HR-innhold åpnet.

[Scope, knapper, sikkerhetsprøver og presise bevis](ORGANIZATION_GROUPS_20261010.md). Kenneths tidligere TEST OK/B/C/PDF/ZIP/SJA-bevis beholdes uten gjentatt omtest. Ingen main/demo/Production eller e-post. Privat HR-kontakt/samtale/fravær fortsatt stengt; uavhengig driftsmanifest/ack og isolert Supabase-restore gjenstår før åpning. Mobil, separate samtidige browserøkter og belastningstest på isolert database gjenstår som egne bevis.

**Faktisk O2 Preview-kontroll:** kode 512860dcfd8e2753789b97790e682a8003b10de9, Core Safety 38007754728 / jobb 114080388321 SUCCESS; dpl_3Z5PxtjxnXpi9P6geUP1iJuiKUSq READY på eksakt SHA/Sandbox. Skynett: synlig Lagre kart/Rediger/flytt/Slett, lokal flytte-/slettekladd, fokusretur og Forkast PASS; ingen aktiv struktur/tilgang lagret eller slettet. Faktisk tosidig PDF med alle fire demonavn kontrollert. Desktop noe vertikal scrolling, mobil/separate økter ikke påstått. [Originalbilder, eksakt bevis og avgrensninger](ORGANIZATION_EDITOR_20261010.md#faktisk-innlogget-preview-kontroll). Felles tre-firma-kart med én konto per person gjenstår som neste avgrensede scope før Ringsides Production-kart.

## Organisasjonskart O2: tydelig lagring og struktur – 10. oktober 2026

**Vis kart / Rediger kart**, frie toppnavn og nivåer. Firmaadmin kladder strukturen med synlige **Rediger / flytt / Slett**, deretter **Lagre kart**. Sletting forklares og flytter personer til Ikke plassert, med bevart stilling/nærmeste leder/HR. Tre like grener vises ved siden av hverandre under felles forelder; stor innvendig boksnesting er fjernet. Medarbeidere lagres separat etter strukturen. Faktiske Sandbox **33 nye + 63 berørte assertions PASS**, React/HR-Hjelp og fire syntetiske PDF-sider kontrollert. Kladd/fokus/remount/konflikt og fersk tilgang beholdes. Bare feature/Preview/Sandbox; brukerens to eksisterende testkort og plassering er ikke flyttet/slettet.

**Nytt krav før deres Production-kart:** ett Ringside-konsernkart med uttrykkelige koblinger til tre firmaer og én konto per bruker, også ved flere firmatilganger/roller. Dagens valgte-firma-RPC samler ikke firmabrukere på tvers. Flerfirma-kartet er eget neste scope; HR fortsatt separat per firma/person. Ingen Production/main/demo/e-post eller generell tilgangsutvidelse. [Avklart O2-scope, bevis og knapper](ORGANIZATION_EDITOR_20261010.md). Tidligere TEST OK og B/C-bevis beholdes.

## Organisasjonskart under KS/HMS – 10. oktober 2026

Kenneth plasserer byggeren under **KS/HMS**, tilgjengelig også uten HR-avtale. Avdelinger/underavdelinger, frie stillinger, ledere/mellomledere/ansatte/lærlinger, søk/filter/zoom og egen PDF. Firmaadmin bygger hele kartet; avdelingsledere sin gren; kartroller gir ingen automatisk HR-innsyn. Nærmeste leder deles kontrollert med eksisterende HR-register etter uttrykkelig firmaadminbekreftelse.

**63 nye faktiske rollback Sandbox SQL assertions PASS**, berørte H1/H3 **75/61 PASS**, faktisk ny/berørt React PASS, tre syntetiske PDF-sider med 48 medarbeidere visuelt kontrollert og ferske eksportavslag PASS. H3 fant og fikk rettet en konkret trigger-scope-regresjon uten svekket prøve. 8 live funksjoner byteidentiske/ACL/tomt search_path. Privat HR fortsatt stengt; ingen mail/main/demo/Production. Full critical/build og eksakt publiseringsbevis føres i draft PR #216. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes. [Avklart scope, prøver, PDF og nye brukerknapper](ORGANIZATION_SCOPE_20261010.md).

**Faktisk publisert og innlogget kontroll:** kode **0b638fc27d0b987cb61a54fc439727b4d03b5325**, Core Safety **38005156679 / 114072124333 SUCCESS**, **dpl_76xSBAeGxpsS2Q2W37X7BYJVVoZ7 READY** eksakt SHA/Sandbox. Skynett viser kartet under KS/HMS, fire aktive demobrukere, kompakt avdelingsdialog og bevart kart ved fokusretur. Faktisk PDF-nedlasting (én A3-side, fire navn) tekst- og visuelt kontrollert. Ingen data/rettigheter lagret; desktop har fortsatt noe vertikal scrolling. Originalbilder og presise grenser i [sluttbeviset](ORGANIZATION_SCOPE_20261010.md#faktisk-innlogget-preview-kontroll). Siste dokumentasjons-head/CI/Preview føres i draft PR #216; kode uendret.


## HR H5a og godkjent KS/HMS-/HR-layout – 10. oktober 2026

Kenneths «kjempefint, takk. kjør videre» er registrert som **TEST OK for levert KS/HMS-/HR-layout**. Varig ønske om senere vurdering av samme utforming i hele appen beholdes. Ingen ny layout-/B/C-/PDF-/ZIP-omtest kreves.

Privat ekstern slettemanifest-adapter er levert som **avgrenset operatorverktøy**: uavhengig anker, HMAC-/prosjekt-/lager-/tokenbinding, fersk lesing, ETag-konfliktvern og fersk verifisert readback. **38 permanente syntetiske scenarioer**, faktisk **@vercel/blob 2.8.1 med syntetisk HTTP/nettverk deaktivert**, berørt H4 og full Sandbox critical/build PASS. **Faktisk opprettelse av privat Vercel-lager avvist med 403 forbidden; intet lager opprettet eller cloud-PASS påstått.** Automatisk eksport/DB-ack og full isolert Supabase-restore gjenstår. Lesende Sandbox: content=false/quarantined=true, 1 firma/medarbeider, 0 innhold/filer/receipts. Ingen app-/database-/gate-endring, privat HR fortsatt stengt. Bare feature/Preview/Sandbox, draft PR #216; ingen merge/Production/e-post. [Scope, operatorløp, bevis og konkret blokkering](HR_CLOUD_LEDGER_20261010.md).

## KS/HMS og HR: Min side-stilen videreført – 10. oktober 2026

Kenneths «waowh, kjempebra» er registrert som **TEST OK for Min sides visuelle retning**. Samme petrolfargede toppfelt, ikoner og kortstil er nå ført videre til KS/HMS/HR innen eksisterende rettigheter. KS-navigasjonens flyt beholdes; HR får relevante snarveier og registeret foran oppsett. Berørte faktiske React-prøver, permanent HR-navigation-critical og full Sandbox build PASS. **Faktisk innlogget desktopkontroll PASS** på kode **427f0d2efb18de0f4806ca2cb0a2ed819cce89a0**, Core Safety **38000225285** / jobb **114056229607 SUCCESS**, **dpl_7qqUJk9xm3ChJsV5DQzwSp9Uqxun READY** eksakt SHA/Sandbox. Kontrast, ikoner, ordbrudd og tre HR-snarveier kontrollert; originalbilder lagret. HR-høyden redusert etter konkret visuell retting, fortsatt noe vertikal scrolling. Ingen data/rettigheter lagret i browseren. Ingen backend eller privat innholdsport endret, tidligere TEST OK beholdes. [Avgrenset scope/bevis](MODULE_LAYOUT_20261010.md). [Varig designretning: vurder senere i hele appen](../architecture/UX_DIRECTION_20261010.md).

### Min side: faktisk ny utforming kontrollert

Kode **5e2be88b1bee67963027ddd9d578fe7de2a20d4d**, Core Safety **37997879229** / jobb **114048436996 SUCCESS**, **dpl_3cam6F9TVUS2nqHWebsRm4ZHGX6L READY** eksakt SHA/Sandbox. Innlogget Skynett: velkomst/tre kort og kompakt egen HR uten scrolling ved 1363×936, hvit overskrift, egen detalj/fokusretur, bevart profil/rapport/e-post og fortsatt lukket privat kontaktport PASS. Første kontrastfeil funnet og rettet før sluttkontroll. F6/Escape er konkret browser-fokusprøve; Windows screenshotverktøy/mobil/separate kontoer ikke påstått. Ingen data/rettigheter lagret. [To originale skjermbilder og eksakt bevis](PERSONAL_UX_20261010.md#faktisk-innlogget-sluttkontroll). Tidligere TEST OK beholdes.

## Min side: mer personlig og stabil ved faneretur – 10. oktober 2026

Personlig velkomst, tre tydeligere kort og kompakt egen/delt HR-visning. Valgt fane/oppførings-ID beholdes ved screenshot/fokus, mens gamle HR-data fortsatt fjernes og først kommer tilbake etter fersk listetilgang/dobbel get. Ingen privat innholdsport eller database endret. Faktiske nye og berørte React-/critical-prøver samt full Sandbox build PASS. Bare feature/Preview; tidligere Kenneth TEST OK beholdes. [Scope, rotårsak, sikkerhetskontrakt og aktuelt bevis](PERSONAL_UX_20261010.md). Publisert SHA/CI/Preview føres i draft PR #216.

### Min side: faktisk Preview verifisert

Rettet kode **45051f8e4713f6351633d216c6a7912bdd64246c**, Core Safety **37995676186** / jobb **114040989598 SUCCESS**, Preview **dpl_3ACVRT1SreEnRNBZDLQM9Z9kQikq READY** på eksakt SHA/Sandbox. Innlogget Skynett-desktop: tre kort uten scrolling ved 1363×936, kompakt profil/eksisterende e-postvalg, faktisk personlig håndbok (10 rutiner), egen HR uten forvaltning, og HRs to tekstkolonner/forslag/Behold min tekst/datosnarvalg PASS. Oppstartsfeil ved null auth-kontekst funnet og rettet med permanent kritisk/React-prøve. Ingen kontoprofil, HR-oppsett eller rettighet lagret; prøvedato ikke lagret, faktisk kontrollfrist fortsatt 23.10.2026. Én fane/popup lukket. Private kontaktverdier fortsatt stengt; ikke faktisk pårørendeskrive-/mobil-/flerkonto-/cloud-restore-bevis. [Eksakt kontroll, originale bilder og grenser](PERSONAL_PAGE_20261009.md#faktisk-innlogget-preview-kontroll-etter-oppstartsretting). Tidligere TEST OK beholdes.

## Min side og kompakt HR-oppsett – 9. oktober 2026

**Min side** når firmaet har KS/HMS **eller** HR; personlige rettigheter styrer innholdet. Tre kompakte kort, personlig håndbok, egne/uttrykkelig delte HR-registeroppføringer og profil/e-postvalg. Hovedvalget HR vises bare for firmaadmin/registrert leder og viser firma/tildelt team. Fullt navn/mobil kan lagres i egen eksisterende kontoprofil; e-post er lesbar konto-adresse. Privat adresse/pårørende er bygget bak **fortsatt lukket innholdsport**; leder/firmaadmin/uttrykkelig leser kan lese ved senere åpning, egen medarbeider redigerer. Ingen pårørende samles/lagres nå. HR-oppsett har eksplisitte tekstforslag og 3-/6-måneders kontrollfristvalg. **59 nye faktiske rollback SQL assertions**, faktisk ny og berørt React, permanent critical/full build PASS. Fem live funksjoner byteidentiske/ACL/tomt search_path, faktisk Sandbox-migrasjon **20261009214042**; 1 HR-firma/medarbeider beholdt, 0 innhold/filer/fixtures og content=false/restore quarantined. Varig ekstern driftsbinding/ack og full Supabase-cloud-restore gjenstår før private kontakt-/samtale-/fraværsdata. Bare feature/Preview/Sandbox, tidligere TEST OK beholdes. [Scope, kontaktkontrakt, bevis og prøve](PERSONAL_PAGE_20261009.md). Eksakt publisering/CI/Preview føres i draft PR #216.

## HR H4 – manifestverktøy og isolert fysisk restore, 9. oktober 2026

HR ser foreløpig tom ut fordi bare medarbeider-/leder-/leserregisteret er åpnet. Samtalereferater, egne forberedelser, sykefraværsoppfølging og private vedlegg er kommende innhold. H4 gir privat HMAC-/prosjektbundet operator-manifest med holdbar skriving og komplette snapshots, samt konkret retting av orphan-filer ved restore uten medarbeiderrad. **39 lokale fysiske PostgreSQL-/filrestore-kontroller PASS**, **11 nye Sandbox-assertions og berørte H3 61 PASS**, permanent critical/full build PASS. Dette er fysisk PGlite-restore og lokale faktiske bytefiler, **ikke full Supabase-cloud-restore**. Varig ekstern driftsbinding/ack og full isolert Supabase-restore gjenstår; sensitivt innhold fortsatt stengt. 1 eksisterende HR-firma/medarbeider beholdt. Ingen UI-/B/C-omtest, e-post, merge eller Production. [Scope, bevis, operatorløp og grenser](HR_RESTORE_LEDGER_20261009.md). Neste synlige produktdel er medarbeidersamtalen etter gjenstående åpningskrav. Tidligere TEST OK beholdes.

## Hjelp: håndbok først og anbefalt HR-bruk – 9. oktober 2026

### Endelig Preview-kontroll av Hjelp og tilgang

Kode **b5d71aabf4eb461bfe8b5649e83a1db50a2d12dc**, Core Safety **37990397400 SUCCESS**, Preview **dpl_4tq9kauNxRxoQyfQhuLkSkHYduuZ READY**, eksakt SHA og Sandbox. Faktisk innlogget desktop: 34 Hjelp-punkter med ikon/riktig flyt, firmaaktivering og fire eksisterende brukerkort PASS. Lokal checkbox-layout og «Lagre og lukk»-integrasjon rettet; faktiske beregnede mål/visuell kontroll PASS. Browseren endret ingen rettigheter eller HR-personer; popup lukket. SQL/React tester tildeling og negative roller separat. [Originale bevis og detaljert scope](HELP_ACCESS_20261009.md#endelig-faktisk-desktopkontroll). Ingen ny B/C-omtest, mail eller merge.

## Hjelp og moduladgang på brukerkort – 9. oktober 2026

Alle hjelpepunkter har ikon, og rekkefølgen følger arbeidsflyten. KS/HMS og HR filtreres med egne ferske rettigheter; øvrig modulhjelp følger også tildeling. Systemadmin aktiverer KS/HMS/HR i firmaoversikten; firmaadmin/systemadmin gir individuelle valg på eksisterende brukerkort. HR-modultilgang gir ikke automatisk individuelt HR-innsyn. **38 nye faktiske SQL assertions PASS**, berørte H1/H2/H3 **75/16/61 PASS**, faktisk React/DOM og full Sandbox critical/build PASS. Eksisterende 1 HR-firma/1 medarbeider beholdt; innhold stengt og restore quarantined. Bare feature/Sandbox, ingen mail/merge/Production. [Scope, vei til tilgang og bevis](HELP_ACCESS_20261009.md). Publisert eksakt SHA, CI og Preview føres i draft PR #216.


Kenneths avgrensede rettelser: **Bygg firmaets håndbok** er første KS/HMS-kapittel; **Anbefalt bruk** under HR har tre konkrete råd. Faktisk React-prøve for første kapittel, bevart kildeforslagsflyt og ikke-tom HR-anbefaling PASS; eksisterende HR/Hjelp-critical PASS. Faktisk innlogget Skynett-Hjelp PASS på kode-SHA `5b6bcfa793f5fea4e4202057aa119bdc2a768d2b`: håndbok først/åpning og tre synlige HR-råd. Core Safety 37986453053 / jobb 114009533221 SUCCESS; Vercel `dpl_EV4CySfApys2RqoFbJ7wVVPLeZG4` READY, eksakt SHA og Sandbox-binding. Originale skjermbilder lagret. Bare hjelpeinnhold/prøve/status endret. HR-portene og neste manifest/restore-scope består. Tidligere tester/TEST OK beholdes. [Scope, QA og sluttbevis](HELP_ORDER_20261009.md).

## Faktisk Hjelp-Preview kontrollert – 9. oktober 2026

Ett KS/HMS-punkt med 11 kapitler og ett HR-punkt, riktig åpning/bytte/innhold og oppdateringsdato **09.10.2026** sett i én eksisterende innlogget Skynett-fane. Ingen HR-data endret. Kode-SHA `dd511f7577baa145836bfdb23bdcae283f1fa866`; Core Safety 37985178018 / jobb 114005274294 SUCCESS; Vercel `dpl_Dyv4mSiaEWNEi18BbidjqhXCcerD` READY Preview på eksakt SHA og Sandbox-binding. [Originalt skjermbevis og H3-kontrakt](HR_PURGE_FILES_20261009.md#faktisk-innlogget-hjelp-kontroll-etter-publisering). Historiske tester/TEST OK beholdes. Sensitivt HR-innhold fortsatt stengt; uavhengig manifest og full isolert restore gjenstår.

## H3 og samlet Hjelp – 9. oktober 2026

Miljømål **BEGGE**, bare feature/Preview og Sandbox, draft PR #216. Hjelp har nå ett **KS/HMS**-punkt med 11 kapitler og ett **HR**-punkt; tidligere hjelpeinnhold beholdes. HR-slettefundamentet omfatter registrert innhold, versjoner, kladder, søkeuttrekk, eksporter og private filer. Tilgang sperres straks; **Slettekvitteringer** viser pågående filsletting og ferdig sletting korrekt.

**61 nye faktiske Sandbox-assertions PASS**, faktisk privat Storage-opplasting/hashkontroll/API-sletting av én syntetisk 62-bytes fil PASS, faktisk HR/Hjelp-React og full critical build PASS. Alle 16 live SQL-funksjoner og Edge v3 er lest tilbake mot kilden. Sensitivt HR-innhold og filnedlasting er fortsatt stengt, både i databasen og i Edge-koden. Uavhengig slettemanifest og full isolert backup-restore er neste sikkerhetsbevis før åpning. Sandbox har nå én firmaoppføring og én medarbeider; eksisterende oppføring beholdes, ingen sensitive data eller testrester finnes. Ingen e-post, merge eller Production. Kenneths **TEST OK for H2-menyen** er mottatt; eldre B/C/PDF/ZIP-bevis beholdes. [Scope, kontrakt og QA](HR_PURGE_FILES_20261009.md).

## HR-register og smartere KS/HMS-meny – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Preview/Sandbox, draft PR #216. H2 gir eget HR-hovedvalg med firmaadmins medarbeider-/leder-/leserregister og medarbeiderens Mine oppfølginger. HR har fortsatt ingen samtale-/fraværsinnhold, filer eller eksport; full innholdspurge/restore må leveres før sensitivt innhold åpnes. Ingen firma aktivert av leveransen. KS/HMS-menyen er gruppert i Daglig arbeid, Mine rutiner og Forvaltning; eksisterende faner, snarveier og utkastbevaring beholdes.

**16 nye faktiske Sandbox-assertions PASS**, faktisk HR/meny-React og berørt håndbok/kildeforslag-React PASS, permanent hook/tilgang/revisjon/late-response-prøve og full critical build PASS. Fem HR-FK-indekser forbedrer slettestien. Skynettleseren fungerer igjen: faktisk innlogget desktopkontroll av gruppert meny, HR-oppsett og berørte skjerminnganger PASS. En konkret overlapp ved scrolling er rettet og kontrollert i begge moduler; originale skjermbilder og testet kode-SHA ligger i H2-notatet. Mobilviewport/filer/flere økter er ikke nye bevis. Eksakt publisert SHA/CI/Preview føres i PR #216. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes uten ny obligatorisk omtest. Ingen mail/merge/Production. Neste: privat fil-/full slettekontrakt. [Scope og QA](HR_UI_MENU_20261009.md).

---

## HR H1 – første sikkerhetsfundament, 9. oktober 2026

Firmabundet medarbeider-/lederregister, eksplisitte ekstra lesere, fersk tilgang og fysisk sletting av register/tildelinger er levert i feature/Sandbox. **75 faktiske rollback-assertions PASS**, permanent klientprøve og full critical build PASS; alle ti live funksjoner byteidentiske. HR er deaktivert for alle firmaer, private filer stengt og tomme. Dette er backend uten ny HR-meny, referat, fravær eller eksport. Full sletting av fremtidig HR-innhold/filbytes og restore er ikke levert. Neste: HR-registerets brukerflate, deretter privat fil-/innholdspurge før sensitivt innhold. Tidligere TEST OK beholdes; ingen ny Kenneth-prøve eller browser-PASS. Miljømål **BEGGE**, bare feature/Preview; KS-e-post fortsatt disabled. [Scope, QA og grenser](HR_FOUNDATION_20261009.md). Publisert SHA/CI/Preview føres i draft PR #216.

---

## B/C-sluttkontroll og drift – 9. oktober 2026

Samlet B/C-utviklerreview er gjennomført; alle seks påminnelsestyper er levert. Ny lesende Sandbox-kontroll bekrefter 20/20 offentlige KS-tabeller med RLS, worker disabled og en liten eksisterende kø. Avgrensede SQL-planer er dokumentert; ingen 100-firma-kapasitet eller browser-/fil-/leveringsbevis påstås. Håndbok-/malhistorikk og store eksporter er konkrete vekstpunkter før større utrulling. Bare dokumentasjon endret, ingen ny obligatorisk Kenneth-prøve; tidligere TEST OK beholdes. Neste utviklingspunkt er avklart HR-tilgang/private filer/sletting før sensitivt innhold. Releasebevis og ekte e-postaktivering/mottak følger egne konkrete punkter. [Sluttstatus, scope og målinger](BC_CLOSEOUT_20261009.md). Miljømål **BEGGE**, bare feature/Preview; ingen merge/Production. Publisert SHA og grønn CI/READY Preview føres i draft PR #216.

---

## Oppgavepåminnelser – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Påminnelser følger opp ufullførte vernerunder, risiko, SJA og egne lesebekreftelser etter minst sju dager. Framtidig planlagt dato utsetter oppfølgingen. Ingen nye arbeidsfrister eller automatiske signeringer. Egen appoversikt åpner eksisterende arbeidsflater. **41 ulike Sandbox-assertions PASS**; eksisterende seks varseltyper **36 PASS**, avvikspåminnelser **37 PASS** og revisjonspåminnelser **36 PASS**. Faktisk React-appflyt og berørte kilde-/revisjonsflyter PASS; full critical/build PASS. Migrasjon 20261009171349 og Edge v7 levert, worker **enabled=false**, 0 syntetiske firma/brukere. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve. Testmailen er ikke sendt. Neste punkt: samlet B/C-sluttkontroll og drift/kapasitet før HR. [Scope og QA](TASK_REMINDERS_20261009.md). Publisert SHA, CI og READY Preview føres i draft PR #216.

---

## Håndbokrevisjonspåminnelser – 9. oktober 2026

Miljømål **BEGGE**, leveranse bare feature/Sandbox. Utpekt ansvarlig får egen revisjonsoppgave og åpner eksisterende skjema uten automatisk signering. Ukentlige påminnelser bruker bare aktuell periode, med sju dagers sendepause og fersk kontroll av ansvar, dato og tilgang. **36 nye Sandbox-assertions PASS**, eksisterende varseltyper **36 PASS**, avvik/RUH-påminnelser **37 PASS** og faktisk React-flyt/kildeoppdateringsregresjon PASS. Full critical/build PASS. Migrasjon 20261009164036 og Edge v6 levert; worker fortsatt **enabled=false**, syntetiske data rullet tilbake. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve. Testmailen er ikke sendt. Neste funksjon er øvrige C-påminnelser; faktisk innlogget fil-/mobil-/flerbrukerbevis og kontrollert release gjenstår. [Scope og QA](REVIEW_REMINDERS_20261009.md). Publisert SHA, CI og READY Preview føres i draft PR #216.

---

## Samlet B/C-gjennomgang – 9. oktober 2026

[OVERSIKT](OVERSIKT.md) er nå en kompakt, oppdatert A–E-status; tidligere oversikt er arkivert. Underskjema, avvik/RUH-påminnelser, kildeoppdatering og ti-gruppe PDF/ZIP er registrert som levert. Gjenstående funksjonsgap skilles fra innlogget fil-/mobil-/flerbrukerbevis. Neste konkrete utviklingsscope er håndbokrevisjonspåminnelser, deretter øvrige C-påminnelser før HR. Tall/dato er dekket i faste skjemaer; generell skjemabygger legges ikke til som nytt obligatorisk krav. **45 faktiske Sandbox-RPC-assertions PASS**, kombinert React/PDF med alle ti grupper **26 / 25 sider**, ZIP **13 filer + manifest** og visuell kontroll av alle 26 sider PASS. Syntetisk transport er ikke faktisk innlogget Storage-bevis. Ingen ny obligatorisk Kenneth-prøve; tidligere TEST OK beholdes. Testmailen er autorisert, ikke sendt; transport fortsatt disabled. Miljømål BEGGE, bare feature/Sandbox. [Kravkart og bevis](BC_REVIEW_20261009.md).

---

## Kildeoppdateringsforslag – gjeldende fortsettelsespunkt 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Oppfølging og revisjon har nå en samlet oversikt over nyere sentrale ProffDok-tekstforslag og vurderte utkast som fortsatt må firmagodkjennes. Sammenligningen viser firmaets tekst og forslaget felt for felt. Å bruke ett felt endrer bare dette feltet; bare **Jeg har vurdert hele tekstforslaget** flytter utkastets forslagsutgave. Egne tilpasninger beholdes. Lagre utkast og Godkjenn og publiser er separate handlinger. Gjeldende godkjente utgaver og gamle ansattbekreftelser omskrives ikke. Ingen nettkilde markeres kontrollert av denne vurderingen, og dette er ikke automatisk lovovervåking.

**Utvikler-QA:** permanent critical-kjede og full lokal build PASS; faktisk React/Vite/JSDOM PASS for sammenligning, manuell kildedato, lokal kladd, feilet lagring/retry, lagret vurdering uten publisering, eksplisitt godkjenning, nye tildelinger og bevarte historiske bekreftelser. Ekte Sandbox-RPC i rollback-transaksjon: **22 assertions PASS**, inkludert firma-/rolle-/revisjonskontroll, kildegrunnlag, immutable v1/v2 og avslått modul. Direkte sluttkontroll: 0 syntetiske firma/brukere, worker `enabled=false`. Ingen ny migrasjon, RPC, RLS/Storage eller global navigasjon. Publisert SHA, Core Safety og READY Preview dokumenteres i draft PR #216 etter levering. [Scope og QA](SOURCE_UPDATES_20261009.md).

Kenneths TEST OK **00:59 / 01:29 / 01:55 / 02:28 / 15:01** beholdes. Ingen ny obligatorisk Kenneth-prøve opprettes. Innlogget browserbevis er fortsatt blokkert etter reset av `native credential state cannot be safely resumed`; dette er ikke browser-PASS. Neste punkt er samlet helhetlig B/C-vurdering og målrettet dekning av faktiske filer, mobil og flerbruker før HR. Tidligere fortsettelsespunkter nedenfor er historikk.

**E-postavklaring:** Kenneth autoriserte én kontrollert test til sin valgte arbeidsadresse 9. oktober kl. 17:29. Testen er ikke sendt; Production-testendpoint krever fungerende innlogget systemadminøkt. Generell køaktivering er fortsatt avslått. KS/HMS-varsler og fristpåminnelser skal aktiveres og verifiseres ved senere godkjent produksjonssetting. Ingen Production-release eller main/demo-merge er bestilt. Denne avklaringen supplerer de eldre sendingstillatelsene nedenfor.

---

## Fristpåminnelser for avvik/RUH – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Oppgavelisten viser passert frist, frist i dag og frist innen tre dager etter norsk kalenderdato. Periodiske e-postpåminnelser for åpne avvik/RUH bruker den private køen, høyst én per syv dager og tidligst syv dager etter siste tildelingslevering. Bare aktuell ukesperiode opprettes. Ansvar, frist, status, firmaaktivering, medlemskap og grant kontrolleres før levering. Deaktivering og reaktivering skal ikke spille av gamle påminnelser. E-posttransport forblir avslått.

Utviklerkontroller og faktiske bruker-TEST OK holdes atskilt; ingen ny obligatorisk Kenneth-prøve opprettes. Tidligere TEST OK beholdes. Skynettleseren er fortsatt blokkert av verktøyets credential-state-grense; det er ikke påstått innlogget nettleserbevis for denne leveransen. Påminnelser for andre oppgavetyper og HR-utløp inngår ikke i denne første avgrensningen. Neste utviklingspunkt er kildeoppdatering. [Scope og QA](DEVIATION_REMINDERS_20261009.md).

---

## Testarbeid – avklart med Kenneth 9. oktober 2026

Kenneth påpekte kl. 15:17 at gjentatte like brukerprøver skaper en testsløyfe, og ba om at agenten tester i skynettleseren. Agenten tar teknisk QA: felles PDF-/ZIP-flyter regresjonstestes samlet, med målrettede tester for hver dokumenttypes datakobling. En ny variant blir ikke automatisk en ny obligatorisk Kenneth-prøve. Brukerprøver samles til en kort helhetlig gjennomgang når det finnes en vesentlig ny arbeidsflyt eller et konkret hull som agenten ikke kan dekke. Kritiske regresjonsvern og krav til eksplisitt godkjenning før eventuell merge består. Ingen eksisterende TEST OK skal gjentas uten konkret feil/relevant regresjon.

Tidligere åpne lister nedenfor er testgrunnlag for agenten og dokumenterte bevisgap; de er ikke en automatisk kø av oppgaver for Kenneth. Skill utviklerverifisering, brukerens faktiske TEST OK og udekket bevis. Ikke merk risikobilder, underskjema eller flerbruker som bruker-TEST OK uten en slik godkjenning. Neste utviklingspunkt er fortsatt påminnelser, deretter kildeoppdatering; det skal ikke blokkeres av flere like PDF-/ZIP-brukerprøver. Production-release, main/demo-merge og ekte e-post er fortsatt ikke godkjent.

### Skynettleserforsøk i denne runden

Fast Sandbox Preview på funksjonskode/head `b4986bcf72b19e2bdef471a907e5f5c4393b150a`. Sikker innlogging ga synlig innlogget demo@expo-proffdok.no, Expo Proffsenter og KS/HMS. Risikolisten var tom. Et nytt ulagret skjema viste bildefeltet; lokal tekst ble fylt med «TEST SKY 20261009 – risikobilde – ikke reell vurdering». Ingen Lagre/fullføring/publisering/filopplasting ble utført. Før neste handling avviste nettleserverktøyet styring: `retained_data_restricted`; forsøket på ny testfane ble avvist med `native credential state cannot be safely resumed`. Stoppet ved innloggings-/verktøygrensen. Dette er ikke bildeopplasting, readback, PDF-/ZIP- eller underskjemabevis. En lokal ulagret kladd kan stå igjen; kontroller/lukk den ved neste fungerende browserøkt. Ingen ny brukerprøve er gitt som erstatning for denne verktøyfeilen.

---

## TEST OK – SJA-bilder, 9. oktober 2026 kl. 15:01

Kenneth svarte «test ok» etter den avgrensede SJA-bildeprøven i samme Sandbox Preview. Godkjenningen gjelder ett testbilde i SJA-utkast med lagring/gjenåpning, egen og samlet PDF, og bilde/manifest.json i vedleggs-ZIP på head `65655dea4a220352075b3c50dd0530a53aab758f`. Dette er brukerens godkjenning, ikke en ny utviklerdrevet nettleserprøve. Ingen bestemt sak, enhet eller antall filer utover prøven er dokumentert.

Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes uten omtest. SJA-bildeprøven trenger ikke gjentas uten konkret feil eller relevant regresjon. Mobilkamera, flerbruker, faktiske private avviks-/prosjektkontroll-/legacyfiler, risikobilder, eldre prosjektavviksuttrekk og versjonerte underskjema beholder sine egne restprøver. Neste uavhengige utviklingspunkt er påminnelser, deretter kildeoppdatering. HR er ikke startet.

Denne registreringen endrer bare dokumentasjon på feature-branchen; PR #216 forblir draft. Ingen Production-release eller main/demo-merge er godkjent eller utført. KS/HMS-e-postutsending skal fortsatt være deaktivert. Eldre beskrivelser av «ikke TEST OK for SJA-bilder» nedenfor er historisk status før denne godkjenningen.

---

## Gjeldende fortsettelsespunkt – versjonerte underskjema

Start kontrollert mot remote feature `131d65ca97b7a401417e439b185ceac2afa5b6ff`, tree `806b61458891c92b25ed61a02676377101e9d1f2`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft. Leveransen gjør én eksakt publisert underskjemaversjon valgfri etter hvert sjekkpunkt. Publisering lagrer root, ferdig utflatet utføring og komplett child-ID/hash/snapshot. Fremmed, manglende, arkivert og sirkulær dependency stoppes; historiske child-versjoner kan velges i manager-sentralen. Prosjektkopier og gjennomføringer forblir uforanderlige.

Sandbox `20261009040633 kshms_checklist_subforms` + `20261009041152 kshms_checklist_subform_execution_shape` anvendt; 17 rollback-assertions PASS, inkludert selvstendig kontroll med utflatet snapshot, og alle syntetiske rader rullet tilbake. Authenticated manager-RPC åpen, anon lukket og privat snapshot-hjelper lukket. Mailer direkte `enabled=false`. Faktisk React og fem faktiske PDF-uttrekk PASS; child v3-ID/hash og utflatet punkt finnes i mal-PDF. Poppler/A4 visuelt kontrollert uten klipp/overlapp.

Funksjonshead **6faf58df375ce12a4779f71fac98b1c2bfc5ce5e**, tree **2e8562f56150509669bc8635acda3800f3be3f14**; alle 20 blobber og samlet tree matcher lokal testcommit, expected-head uten force. Lokal full Sandbox critical build PASS. Core Safety **37883044933**, full critical jobb **113666839672** success. Vercel **dpl_JACGxacWsYSkCxcdKZGDAk8UK14F** READY på eksakt SHA/ref/fast alias; branch-env Sandbox. Innlogget Preview etter reload: én bevart demoøkt/fane, Bunnledning v1 åpnet skrivefritt, underskjemavelger og forklaring på begge punkter. Selvvalg korrekt utelatt; ingen annen mal finnes. Dialog lukket, ingen lagring/publisering/prosjekt-/kontrollendring. [Scope/QA](CHECKLIST_SUBFORMS_20261009.md).

Ingen Kenneth TEST OK for denne delen. TEST OK 00:59 / 01:29 / 01:55 / 02:28 beholdes uten omtest. Faktiske private filer, mobil/flere brukere og restprøver består. Neste uavhengige B/C er påminnelser og deretter kildeoppdatering; HR er ikke startet. Ingen ekte e-post, Production/main/demo-merge.

---

## Gjeldende fortsettelsespunkt – risikobilder publisert og verifisert

Kontrollert fra remote feature-head `0b6c0ffab2705c06b7314f2484cb187412c9f02d`, tree `d84c3ae5742d07b3d431132be99a3f0b579a5932`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft. Lokal checkout har annen commitidentitet etter tidligere GitHub-objectpublisering, men samme verifiserte tree og ren start. Miljømål BEGGE, kun feature/Sandbox.

Avgrenset implementasjon: inntil tre komprimerte bilder per fare i privat, revisjonert risikovurdering; egen PDF, valgt prosjektrapport, samlet uttrekk og ZIP/manifest. Ingen ny Storage/tabell/RLS/policy. Faktisk React-fil/canvas/readback, standalone-/prosjektrapport-/uttrekks-PDF, visuell kontroll, React/ZIP og full Sandbox critical build PASS. Privat validator `20261009031544 kshms_risk_photos` er anvendt og direkte funksjons-/ACL-prøvd i Sandbox; e-post-worker er fortsatt `enabled=false`.

Funksjonshead **bcd0579cebdeaaaa4578abab14dc5522bf0abd88**, tree **03e3ecf71fcde6c43e714997f57a24f1f213f810**, publisert fra expected-head `0b6c0ffa` uten force. Alle 24 endrede blobber/tree matcher lokal testcommit. Core Safety **37878651320**, jobb **113652964404** med full critical build success. Vercel **dpl_AKRXJxtRxZuNRif9ej4d2oUJ5vk3** READY på eksakt SHA/feature-ref/fast alias; branch-env direkte lest Sandbox. Innlogget reload viste bildefelt/personverntekst i tomt ulagret skjema; ingen eksisterende risikovurdering eller dataendring, popup lukket. [Scope](RISK_ATTACHMENTS_20261009.md).

Bevar TEST OK 00:59 / 01:29 / 01:55 / 02:28. Ny risikobildeprøve er ikke godkjent. Ikke opprett/fullfør reell vurdering for testdata. Åpne restpunkter etter denne leveransen: faktisk innlogget risiko-/SJA-bilde og kamera, faktiske private avviks-/prosjektkontroll-/legacyfiler, mobil/flere brukere; deretter versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke i natt.

---

## Gjeldende fortsettelsespunkt – SJA-bilder publisert og verifisert

Kontrollert 9. oktober 2026 fra ren `feat-kshms-foundation` på `7a68293c8ad3aae4191a1e766b1dbf278ab54eef`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft. Eksplisitt scope: `KshmsSja.jsx`/CSS, SJA-/bildevalidering, SJA PDF/samle-PDF/ZIP, én privat validator-migrering, relevante critical-/React-prøver og HJELP/README/architecture/statusdokumenter. Ingen HR, risiko-bilder, generell navigasjon, ny Storage/tabell/RLS/policy, e-post, Production/main/demo.

Lokalt PASS: faktisk React-fil/canvas-preview og readback; permanent SJA/PDF/ZIP/uttrekksvern; tre faktiske SJA-PDF-er; 15-siders åtte-type samle-PDF; faktisk ZIP med seks filer/manifest/CRC32/SHA-256; full `EXPO_BACKEND_TARGET=sandbox npm run build`. SJA-PDF side 1–2 og samle-PDF SJA/manifest er rendret og visuelt kontrollert uten klipp/overlapp. Supabase CLI mangler; ingen lokal database-PASS hevdes. Migrasjon `20261009022028 kshms_sja_photos` er anvendt bare på `demo-sandbox` (`ppvircenkjizeiqdxphj`) og direkte funksjonsprøvd: ett JPEG-bilde/legacy PASS; fire bilder, PNG og duplikat-ID avvises; privat ACL består.

Publisert funksjonshead **785d01389d2059026711ea1a8af12762e75fc4b9**, tree **cd5257609f1a3e2c375b9faf7d9146bc561ed429**. 25 blobber og tree er hash-/byteidentiske med lokal testet kilde; expected-head 7a68293c, ingen force. Core Safety **37874352426**, jobb/full critical build **113639379783** completed/success. Vercel **dpl_Dd3VioNsdD4idRkMGodqfpTamDqG** READY på eksakt SHA/feature-ref/faste alias; `EXPO_BACKEND_TARGET=sandbox` direkte lest. Innlogget fast Preview etter reload viser eksisterende signert «Test sja» uendret/read-only med ny bildeseksjon/personverntekst. Ingen fil valgt, PDF lastet ned, lagring, signering, database-/Storage-skriving eller popup igjen.

Bevar TEST OK 00:59 / 01:29 / 01:55 / 02:28. Ny SJA-bildeprøve er ikke godkjent ennå. Ikke opprett/signér en reell SJA for data. Åpne restpunkter: faktisk innlogget SJA-bilde/kamera, risikofiltilknytning, faktiske private avviks-/prosjektkontroll-/legacyfiler, mobil/flere brukere; deretter versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke i natt. [Detaljert scope](SJA_ATTACHMENTS_20261009.md).

---

## Publisert eldre prosjektavviksuttrekk – utviklerbevis 9. oktober 2026

Funksjonshead **37cd906b697763c4865650d9393a33d05fb78303**, tree **bf3c2e0ee256eb2cb9dddcc052b07aaf4490c8a2**, identisk med lokal testcommit 4316675cb99a3d1a004494eac2bb376df5c878c3. Alle 18 blobber opprettet/hashkontrollert og lest tilbake byte-/tekstidentisk; faktisk publisert git-commit rekonstruert og SHA-verifisert, 668 recursive tree-oppføringer kontrollert med korrekt tree og alle endrede filer. Lokal feature-head følger eksakt publisert kode. Publisert expected-head bd506a65 uten force; main fortsatt **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Vercel READY **dpl_8kaLkrvrwtiBGmksLnSRLFaUGUmi**, riktig SHA/feature-ref/prosjekt/faste alias, EXPO_BACKEND_TARGET=sandbox direkte lest. PR Core Safety **37868239123**, jobb **113620009941** med full critical build: completed/success. Final lokal full Sandbox build, scope/docs-guard og diff-check PASS.

Innlogget fast Sandbox Preview, gjenbrukt demoøkten i én fane: hovedprosjektet viste **3 ukoblede eldre saker**, alle startet uten valg. Tre koblede saker ble utelatt. De tre valgte eksisterende sakene (to åpne, én lukket) ga faktisk nedlastet **5-siders PDF** med innhold/status/eldre lukking, forklaring om uversjonert lagret tilstand og manifest. Tekst-/sidekontroll PASS; alle fem sider rendret og visuelt kontrollert uten overlapp/klipp. Vedleggslisten viste 0 og sperret ZIP/bekreftelse. Fjerning av lukket sak ga 2 valg, tømte vedleggsliste og PDF-bekreftelse og sperret PDF. Deretter valg/omfang tømt; én fane, ingen popup eller sak-/database-/Storage-skriving. [Nettleserbevis](legacy-extract-proof.jpg).

Dette er **utviklerbevis, ikke Kenneths TEST OK** for ny legacy-del. Ny kort prøve står i USER_TEST.md. Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes. Ingen gamle godkjente deler skal prøves på nytt uten konkret feil/relevant regresjon. Faktisk lagret eldre avviksfil, private avviks-/prosjektkontrollfiler og mobil/flere brukere er fortsatt separate restprøver: eksisterende gamle testsaker hadde ingen photos. Lokal React/ZIP med syntetisk transport verifiserer 7 originaler og manifest/CRC32/SHA-256; dette er ikke faktisk innlogget filbevis. Øvrig vedleggsdekning/SJA-/risikofiltilknytning består før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå. KS/HMS enabled=false er direkte lest, ingen e-post/Production/main/demo-merge. Etterfølgende beviscommit har bare docs/skjermbilde og uendret funksjon.

---

## Eldre ukoblede prosjektavvik – avgrenset leveranse 9. oktober 2026

Miljømål **BEGGE**; bare feature/Sandbox-publisering. Verifisert start **bd506a652bd2b4d339b43946f80a121ecea294f9**, main **155f6c4ac01f126c1db0c65da385cfd9305587d5**, draft PR #216. Denne del-leveransen gjør eldre ukoblede prosjektavvik eksplisitt valgbare i Dokumentuttrekk: lagret innhold/bilder i PDF, originalfiler i separat bekreftet ZIP. Koblet KS/HMS-sak utelates. Eldre ansvar/lukking merkes som lagret tekst uten versjonert historikk eller KS/HMS-signatur; innholdets SHA-256 følger valget/manifestet.

Utviklerbevis: permanent tilgangs-/innholds-/fil-/avbruddsvern PASS; faktisk React/jsPDF gir 20-siders prøve-PDF og ZIP med 7 originaler, CRC32/SHA-256 verifisert. Alle 20 sider rendret, kontaktark og åpne/lukkede avvik visuelt kontrollert. Opprinnelige åtte-gruppe-prøver og kvalitet-/HMS-modus PASS (ZIP 5/9 originaler). Full critical Sandbox build PASS. Transport i disse lokale prøvene er syntetisk. Innlogget publisert prøve og eksakt publisert head/tree/CI/deploy er ført ovenfor. Vercels branch-binding er direkte kontrollert: EXPO_BACKEND_TARGET=sandbox. KS/HMS-worker enabled=false er direkte lest; utsending forblir deaktivert.

**Ny bruker-TEST OK foreligger ikke for eldre prosjektavvik.** Bevar Kenneths TEST OK 9. oktober Europe/Oslo: egen SJA-PDF 00:59, samlet PDF 01:29, ZIP med to bilder/manifest 01:55, kvalitet-/HMS-uttrekk 02:28 på f9e0f7b52a0573cf662fce07f8158c47576c8598 (funksjon 0e2de193164dad2342206cac1e2a7610f3c265d0). Ingen ny prøve av disse delene kreves uten konkret feil/relevant regresjon. Faktiske private avviks-/prosjektkontrollfiler, faktisk eldre prosjektavviksfil, mobil/flere brukere og øvrig vedleggsdekning består. Nye filtilknytninger på SJA/risiko er ikke levert. Fortsett øvrig vedleggsdekning før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå; kravene i HR_SCOPE_20261008.md beholdes.

Ingen migrasjon, backend-/database-/policyendring, saks-/Storage-skriving, signering/lukking, ekte e-post, Production-release eller main/demo-merge. [Eksakt scope, prøver og neste steg](LEGACY_ATTACHMENTS_20261009.md).

---

## TEST OK – kvalitets-/HMS-avvik, 9. oktober kl. 02:28

Kenneth ga **TEST OK 9. oktober 2026 kl. 02:28 Europe/Oslo** for den avgrensede kvalitets-/HMS-leveransen på publisert head **f9e0f7b52a0573cf662fce07f8158c47576c8598** (funksjonskode **0e2de193164dad2342206cac1e2a7610f3c265d0**). Godkjenningen gjelder den nye avviksdekningen i Dokumentuttrekk og den fremlagte korte brukerprøven. Utviklers innloggede bevis omfatter seks lagrede avvik, 23-siders PDF med begge kategorier/historikk/manifest, tom vedleggsliste med sperret ZIP og nullstilling ved fjerning. Bevishead f9e0f7b5 var READY **dpl_3DB6k8cwp3K1eBvzMcG8Ludc8JFk**, grønn Core Safety **37864641901** / full critical build **113608347101** completed/success.

Tidligere TEST OK **00:59 egen SJA-PDF / 01:29 samlet PDF / 01:55 ZIP med to bilder og manifest.json** beholdes. Denne nye godkjenningen er **ikke faktisk privatfilbevis**: Sandbox-avvikene har ingen private originaler/bilder. Faktisk private avviksfiler, private prosjektkontrollfiler, mobil/flere brukere og øvrige tidligere separate restprøver består. Den godkjente avviksprøven skal ikke gjentas uten konkret feil eller relevant regresjon. Ukoblede eldre prosjektavvik og andre filtilknytninger/full tilsynsdekning er fortsatt ufullført B/C-scope. Fortsett én avgrenset del av øvrig vedleggsdekning før versjonerte underskjema, påminnelser og kildeoppdatering; HR følger senere etter avklart HR_SCOPE_20261008.md.

Denne oppfølgingen endrer bare dokumentert godkjenningsstatus. Miljømål **BEGGE**, kun feature/Sandbox. Faktisk branch/main kontrollert før endring: f9e0f7b5 / **155f6c4ac01f126c1db0c65da385cfd9305587d5**, draft PR #216. Ingen app-/backend-/databaseendring, Production-release/main/demo-merge eller ekte e-post. KS/HMS-e-postutsending forblir deaktivert.

---

## Publisert kvalitet-/HMS-uttrekk – innlogget utviklerbevis 9. oktober 2026

Funksjonshead **0e2de193164dad2342206cac1e2a7610f3c265d0**, tree **89b048c374fe88cea22251d1fdea387502c37bf4**, identisk med bevart lokal testcommit **2ec757530ca2736ed34ac56faa113250f3fb2209**. Alle 18 blobber/tree og faktisk publisert git-objekt hashkontrollert; lokal feature-branch er justert til eksakt publisert head. Baseline da2e5a79, main **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Publisert med expected-head og uten force. READY **dpl_BPX5n2GejD1xCUULTz9EUG7rAPoc**, samme faste Sandbox-alias, riktig SHA/feature-ref og Sandbox-backend. Core Safety **37863966196**, jobb **113606139996**, inkludert full critical build: completed/success. Lokal full Sandbox build, scope/docs-guard, nye og opprinnelige critical/React/PDF/ZIP-prøver PASS. PDF-rendering kontrollert.

Innlogget skyfane 5 gjenbrukte demoøkten etter appens «Oppdater nå». Dokumentlisten startet uten valg; ny gruppe viste seks avvik (fem HMS/én kvalitet). Alle seks eksisterende lagrede saker ble valgt uten å endre dem. «Vis vedleggslisten» viste 0 vedlegg og sperret ZIP/bekreftelse. Bekreftet dokumentvalg ga faktisk nedlastet **23-siders PDF** med begge kategorier, historikk og manifest. PDF-en ble tekst-/sidekontrollert og alle sider rendret/visuelt kontrollert. «Fjern Ulykke fra uttrekket» ga fem valg, nullstilte PDF-bekreftelsen/vedleggslisten og sperret PDF. [Nettleserbevis](deviation-extract-proof.jpg). Deretter valg og omfang tømt; én innlogget fane, ingen popup. Ingen saks-/database-/Storage-skriving, signering eller lukking.

Dette er utviklerbevis, **ikke Kenneths nye TEST OK**. Ny kvalitet-/HMS-brukerprøve, private originaler/bilder fra faktisk lagret avvik, mobil/flere brukere og tidligere åpne delprøver består. Sandbox-avvikene har ingen private filer; slik faktisk transport kan derfor ikke erklæres ferdig. Lokale syntetiske transportprøver dekker begge kategorier, fire private originaler, filinnhold/CRC/SHA-256 og feil-/tilgangsvern. Bevar brukerens TEST OK **00:59 egen SJA-PDF / 01:29 samlet PDF / 01:55 ZIP med to bilder og manifest.json**, 9. oktober Europe/Oslo. Øvrig vedleggsdekning gjenstår før versjonerte underskjema, påminnelser og kildeoppdatering; HR følger senere med avklart HR_SCOPE_20261008.md. KS/HMS-e-post forblir disabled (direkte lest enabled=false). Ingen Production/main/demo-merge eller ekte e-post.

Etterfølgende beviscommit inneholder bare dokumentasjon og skjermbilde; funksjonskode er uendret.

---

## Kvalitet-/HMS-avvik i dokument- og vedleggsuttrekk – 9. oktober 2026

Miljømål **BEGGE**, kun feature/Sandbox nå. Baseline `da2e5a79824c1358948ed535768b81277a2ecb41`, faktisk main `155f6c4ac01f126c1db0c65da385cfd9305587d5`, draft PR #216. Ny avgrenset del av øvrig vedleggsdekning: egen gruppe **Kvalitets- og HMS-avvik med historikk og bilder** i Dokumentuttrekk. Valgte lagrede KS/HMS-saker får full historikk/private bilder i PDF og private originaler i ZIP, med eksisterende bekreftelse/manifest/konsistens-/tilgangsvern. [Scope og QA](DEVIATION_ATTACHMENTS_20261009.md).

TEST OK for egen SJA-PDF **00:59**, samlet PDF **01:29** og ZIP med to bilder/manifest **01:55** 9. oktober beholdes som separate dokumenterte godkjenninger. De er ikke ny TEST OK for kvalitet/HMS. Innlogget Sandbox har fem HMS-saker/én kvalitetssak, ingen private avviksfiler. Ny faktisk privatfilprøve, mobil/flere brukere og tidligere separate restprøver er fortsatt åpne. Nye filtilknytninger på andre dokumenttyper og full legacy-/tilsynsdekning er ikke erklært ferdig. Øvrig vedleggsdekning følger før versjonerte underskjema, deretter påminnelser og kildeoppdatering før HR; HR_SCOPE_20261008.md beholdes. Ingen Production/main/demo-merge eller ekte e-post; Sandbox KS/HMS-enabled=false bekreftet direkte og beholdt.

---

## Publisert PDF-/ZIP-forklaring – innlogget kontroll

Tekst-/TEST OK-oppfølging publisert på **085336ade9be3a9778a3c5d00ad7c58c7dc0a98a**, tree **ecbbd5aa8be7fd6ccdc72e6eb254da104cc724ba**, identisk med lokal testcommit 496c73e25026d070bf38e2b8f72da7acc03d30f4 (bevart). Alle 11 blobber/tree og faktisk publisert git-objekt hashkontrollert, expected-head 359dac0e og uten force. READY **dpl_8wuuYDCorLQwMaZde1QL39pihcCs**, eksakt SHA og samme faste Sandbox-alias; Core Safety **37862362107**, jobb/full critical build **113600849615** completed/success. Lokal full Sandbox build og faktisk React/ZIP PASS. PR #216 fortsatt draft/main uendret 155f6c4ac01f126c1db0c65da385cfd9305587d5. Bare to apptekstfiler og ni dokumenter i denne slice; ingen handler/format/backend-endring. Etterfølgende beviscommit er bare dokumentasjon/skjermbilde.

Innlogget samme skyfane (4), bevart demoøkt etter reload: Dokumentuttrekk forklarer nå PDF og ZIP før valg. Valgt eksisterende Voldsløkka-vernerunde ga begge vedlegg (178896/200131 byte), hensiktstekst for separate filer/arkiv og forklaring av mappen vedlegg/manifest.json. ZIP-knappen er sperret før egen bekreftelse og aktiv etter. Det ble ikke lastet ned eller skrevet noen ny sak i denne tekstkontrollen. [Skjermbevis](zip-clarity-proof.jpg). Valg/omfang deretter tømt, null dialoger; én fane beholdt. Godkjent ZIP-nedlasting skal ikke gjentas bare fordi teksten er presisert. Hensikt og manifest er forklart direkte i chatten; TEST OK 9. oktober kl. 01:55 gjelder to-bilders nedlasting/innhold, øvrige åpne prøver består.

---

## TEST OK – ZIP med to bilder og filoversikt, 9. oktober kl. 01:55

Kenneths TEST OK er presisert **9. oktober 2026 kl. 01:55 Europe/Oslo**: ZIP fra Voldsløkka-vernerunden er lastet ned og åpnet, med **to bilder i vedlegg og én JSON-fil**. Skjermbildet viser åpnet «KS-HMS vedlegg – test omfang», mappen «vedlegg» og «manifest.json». Dette bekrefter innlogget ZIP-nedlasting/innhold på publisert head **359dac0ed2df86ab43cb545ece6716161f9bdc87** (funksjon 42a38e91), etter PDF-/ZIP-avklaringen kl. 01:51–01:53. Tidligere TEST OK beholdes. Ingen ny mobil-, flerbruker-, privat RUH-original-/prosjektkontrollfil- eller Production-/merge-/e-postgodkjenning følger.

Brukerens «det var ikke selvsagt» følges opp med avgrenset tekst i Dokumentuttrekk og HJELP: PDF og ZIP har hver sin nedlasting; ZIP-knappen vises etter Vis vedleggslisten; manifest.json forklares som filoversikt som beholdes med vedleggene. Brukerens oppfølgingsspørsmål kl. 01:57 presiserer hensikten: ZIP sparer enkeltvis henting og gir separate filvedlegg til arkiv eller sammen med rapporten; PDF er rapporten. Ingen handler, eksportformat, backend eller knappnavn endres. Miljømål BEGGE, først samme feature/Sandbox. Neste faglige B/C-punkt er fortsatt øvrig vedleggsdekning og versjonerte underskjema; deretter påminnelser/kildeoppdatering før HR. Gjenværende prøver videreføres uten å gjenta godkjent ZIP-nedlasting.

---

## Publisert vedleggspakke – READY, grønn QA og innlogget ZIP

Funksjonskode **42a38e91f38594a0b8ece947157481c77af93e91**, eksakt testet/publisert tree **96ed970ef2ab78cb1a610b0f53effe32e35fd719**, identisk med lokal testcommit **dd88b7aab0d203efca653c46971c1451cbce854b**. Alle 17 publiserte blobber/tree hashkontrollert via GitHub-kobling, expected-head c5e128c6 og uten force. Faktisk publisert git-objekt er hentet/hashkontrollert lokalt; testcommit bevart på refs/codex/local-zip-tested. Samlet branch mot main: 219 filer; denne funksjonsleveransen er 17 avgrensede filer (fire nye). Ingen SQL/backend/global navigasjon/konfigurasjon. Etterfølgende dokument-/skjermbevis endrer ingen funksjonskode.

READY **dpl_HY7SG3fjVEMjYJtV4JR8nkYnMvKa**, eksakt SHA og fast Sandbox-alias. **PR Core Safety 37860831491**, jobb **Core safety + critical build 113595879925**, completed/success; scope isolation og full critical build success. Lokal full Sandbox critical/build, PR-scope og release-docs-guard PASS. Permanent ZIP-check og faktisk React/ZIP-flyt PASS; eksisterende samle-PDF React/Storage/jsPDF også PASS etter felles leser. PR #216 open/draft, faktisk main kontrollert uendret **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Eksisterende branchbinding EXPO_BACKEND_TARGET=sandbox beholdt. Ingen main/demo/Production eller ekte e-post; KS/HMS-utsending forblir deaktivert.

### Faktisk skynettleser og bytebevis

Én eksisterende fane (4), samme faste URL og bevart demo@expo-proffdok.no-økt i Expo Proffsenter etter reload; ingen ny innlogging. Dokumentuttrekk startet med null automatisk valg. **Voldsløkka vernerunde 1**, dokument **21401807-1827-425f-858f-a3431737a611**, revisjon **2**, ga en vedleggsliste med de to allerede lagrede JPEG-bildene. Før egen bekreftelse var ZIP-knappen sperret. Faktisk ZIP-nedlasting: **381240 byte**, SHA-256 **eb521184f167d1e2acbc78fd1ef4199fde7a642a63e939972fe3fe8eb9e9b6ec**, arkiv-ID **1a006222-7bee-40f4-b5df-e4a01b69b98d**, tidspunkt **09.10.2026 kl. 01:43:24 Europe/Oslo**. Uavhengig Python zipfile/Pillow bekrefter CRC, tre ZIP-filer (to JPEG + manifest), to gyldige 960×1280 JPEG-er, riktig dokument/revisjon/punkt/byte og begge SHA-256. Ingen andre dokumenter, rapport-PDF eller Storage-/tokenlenker i manifest. [Skjermbilde etter nedlasting](attachment-archive-proof.jpg).

| Lagret bilde-ID | Punkt | Byte | SHA-256 |
|---|---|---:|---|
| 464db59a-84e4-440b-a753-0953d06c37e9 | Er underlaget sjekket og funnet tilfredstillende? | 178896 | ed23773ed5d339053cb0d9216a7e0fbc5b0a74c61e565dbd6f0294648c0d5679 |
| 54c7f57e-deab-4355-9775-c60d6a20e023 | Fall | 200131 | 18b6859fe94d7c179c588b24c84b012914d50580326c7c372f872b07b0e9c55a |

Omfangsendring tømte vedleggslisten og bekreftelsen; tomt omfang sperret ZIP selv etter ny liste/bekreftelse. **Fjern** Voldsløkka ga null valgt og sperret forhåndsvisning. Valgt eksisterende **test ruh** (e3b21d35-9acb-4a1f-b4db-842a46f44f3e) har 0 vedlegg: eksplisitt tom-liste-beskjed, deaktivert bekreftelse og ZIP. Oppdatering nullstilte dokumentvalget. Faktisk **Hjelp → KS/HMS – samlet dokumentuttrekk** viste de nye ZIP-trinnene, grenser, manifest og avgrensning.

Relevant eksisterende samle-PDF-regresjon: bare **Test sja** revisjon 2 og **Voldsløkka vernerunde 1** revisjon 2 ga **5 sider / 419287 byte**, SHA-256 **44e72f6dfd3ee9d3bea9eb36b74bb7ea74193903e5d93ff1f3e2160d6670bb7f**. Rendret og visuelt kontrollert: full SJA, bevart Kenneth Demo-signatur **07.10.2026 kl. 23:47:45**, begge vernerundebilder/fullføring, rammer og riktig to-dokumenters manifest. Ikke-valgt RUH-ID er borte. Ingen eksisterende lagring, signering, lukking, fullføring eller saksendring utført. Alle popup lukket. Til slutt Dokumentuttrekk med tømt dokumentvalg/omfang; én fane beholdt for brukerprøven.

### Handoff og gjenstående

Kenneths **TEST OK 9. oktober kl. 01:29 på c5e128c6** gjelder forrige samle-PDF. Ny ZIP-del venter på sin avgrensede brukerprøve i USER_TEST.md. Faktisk innlogget privat RUH-original/prosjektkontrollvedlegg var ikke tilgjengelig i eksisterende testdata og er ikke gradert PASS; lokale Storage-scenariotester dekker dem. Mobil/flere ekte brukere, øvrig vedleggsdekning, versjonerte underskjema, påminnelser og kildeoppdatering består før HR. Ingen testdokumenter er opprettet for å fylle hull. HJELP, architecture og README er oppdatert også for ZIP. Tidligere TEST OK og HR_SCOPE_20261008.md beholdes.

---

## Vedleggspakke – neste avgrensede B/C-leveranse

Kenneth ga **TEST OK 9. oktober 2026 kl. 01:29 Europe/Oslo** for samlet dokument-/tilsynsuttrekk på publisert head `c5e128c6fde2d0fb1368accb78a9414c05f0c81d`. HJELP, architecture og README var oppdatert ved godkjenningen. Tidligere TEST OK beholdes, inkludert egen SJA-PDF kl. 00:59. Dette er ingen Production-/merge-/e-postgodkjenning.

Ny levering: **Dokumentuttrekk → Vis vedleggslisten → Last ned vedlegg (ZIP)**. Valgte lagrede RUH-originaler, vernerunde-bilder og prosjektkontrollvedlegg med manifest, filstørrelser og SHA-256. Egen bekreftelse; endring av omfang/valg tømmer listen. ZIP-nedlasting/innhold TEST OK 9. oktober kl. 01:55. [Scope og QA](ATTACHMENT_ARCHIVE_20261009.md). Øvrig vedleggsdekning, versjonerte underskjema, påminnelser og kildeoppdatering følger før HR. Ingen ny backend eller sending.

---

## Publisert samlet uttrekk – READY, grønn QA og innlogget nedlasting

Funksjonskode **8d045d0cd9956d47d93e1b606b75eef7097dda32**, eksakt testet/publisert tree **ded14b7df45dc08e810ed569c2630e6e8e65a033**, identisk med lokal testcommit **a298a29b7bb784e5a60334ffb5db4c0994879e5b**. Feature ref oppdatert via GitHub-kobling med expected baseline 9ac259fa og uten force. Lokalt er faktisk publisert git-objekt/head også hentet og hashkontrollert; original testcommit bevart. Funksjonsleveranse: 16 filer, samlet branch mot main: 214 filer, fem nye scope-filer. Ingen ny SQL/backend/global navigasjon/konfigurasjon. Etterfølgende beviscommit er bare dokumentasjon og skjermbilde.

READY **dpl_FpiuDdxSxd5yaauYXkSgpKfDcmC3** med eksakt funksjons-SHA på samme faste Sandbox-alias. **PR Core Safety 37858562063**, jobb **Core safety + critical build 113588549210**, completed/success; scope isolation og full critical build success. Lokal full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS exit 0. Vercel branchbinding `EXPO_BACKEND_TARGET=sandbox`, target preview, gitBranch feat-kshms-foundation direkte kontrollert. PR #216 open/draft og main uendret **155f6c4ac01f126c1db0c65da385cfd9305587d5** ved sluttkontroll. KS/HMS-utsending forblir deaktivert; ingen e-post-/database-/Production-handling.

### Faktisk innlogget skynettleser

Eksisterende demo@expo-proffdok.no-økt i Expo Proffsenter ble bevart etter reload på samme URL. Én fane (4), ingen ny innlogging. **KS/HMS → Dokumentuttrekk** starter uten katalog/valg. Katalogen viste 10 godkjente rutineutgaver, én mal, én SJA, én RUH, to vernerunder, null signerte håndbokrevisjoner og null risiko. Prosjekt DEMO – HOVED kunne velges og **Hent prosjektkontroller** ga null lagrede strukturerte kontroller. Ingen testdokumenter ble opprettet for å fylle hullene.

Faktisk valg av R-007 v1, Bunnledning v1, Test sja revisjon 2, test ruh revisjon 2, test vernerunde revisjon 1 og Voldsløkka vernerunde 1 revisjon 2 ga **12 sider / 433696 byte**, SHA-256 **843367314c3456983cd8fd214479a6f5d090576fed39f7b62f40d2263d980e36**. PDF rendret og visuelt kontrollert: omfang, firmanavn/logo, full rutinetekst/kilder, tom mal, full SJA med lagret Kenneth Demo-signatur **07.10.2026 kl. 23:47:45**, begge RUH-historikkhendelser/bevart lukking, begge vernerunder og **to faktiske lagrede bilder fra Voldsløkka**, samt manifest med riktige seks ID-er/revisjoner/hashes og sideintervaller. Ingen ikke-valgt R-008-utgave i filen. [Skjermbilde etter vellykket nedlasting](inspection-extract-proof.jpg).

**Fjern** R-007 nullstilte bekreftelsen og sperret nedlasting. Ny bekreftelse ga **10 sider / 429751 byte**, SHA-256 **bfa69dd6d02e1231f01ecc6d2d7e371f6e25783871adcb183a2c56f014648dfe**; rutineutgave-ID og rutinetekst er borte, signatur/historikk/bilder/manifest beholdt. Tomt omfang sperret knappen. Søk «test» reduserte vernerunder fra to til én; **Oppdater dokumentlisten** ga null valgte dokumenter og ny bekreftelsessperre. **Tøm dokumentvalget** fungerte. Gruppevalg/filtrering/nedlasting endret ingen lagrede saker, signeringer eller fullføringer.

Relevant regresjon: **Avvik/RUH → Lukkede → test ruh → Last ned RUH-PDF** ga **2 sider / 36486 byte**, SHA-256 **98628a8c5445cd088a084a97b09d0ff6409353d8943a09a5a953a6f79b001bda**, begge historikkhendelser og lukking **08.10.2026 kl. 01:28:17** bevart. Dialogen ble lukket. Ingen lagring/signering/gjenåpning utført. Til slutt én fane på **Dokumentuttrekk**, alle popup lukket, valgt liste nullstilt. Observerte konsollfeil gjelder nettleserutvidelsens metadata, ikke appkode.

### Gjenstår / neste chat

Ny bruker-TEST OK for samlet uttrekk gjenstår; tidligere TEST OK består, inkludert Kenneths SJA-PDF 9. oktober kl. 00:59. Privat RUH-bilde er lokalt testet med ekte Storage/Blob/PDF, men faktisk innlogget test ruh har fortsatt 0 vedlegg. Innlogget signert håndbokrevisjon, risiko og strukturert prosjektkontroll var ikke tilgjengelig; disse åtte-type-gruppene er dekket i lokal React/PDF. Mobil og flere reelle brukere er fortsatt åpne. Dette er ingen tilsynsgodkjenning.

Fortsett fra første dokumenterte ufullførte B/C-punkt: **øvrig vedleggsdekning**, deretter **versjonerte underskjema**, **frist-/utløpspåminnelser** og **kildeoppdatering**, før separat HR. Ikke gjenta allerede avklarte HR-krav eller tidligere godkjente tester. Hent faktisk feature/main og CI/READY ved neste start; ikke anta at funksjons-SHA over er siste dokumenthead. Samme Sandbox Preview og eksisterende innlogging/én fane; ikke signér/fullfør reelle saker som test. Ingen Production-release, main/demo-merge eller ekte e-postsending er godkjent.

---

## Samlet dokument-/tilsynsuttrekk – ny avgrenset B/C-leveranse

Miljømål **BEGGE**, publisering først på samme feature/Sandbox. Baseline `9ac259fa8027a3d88e57c5ab761d71fbeaef5cb7`, faktisk main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 open/draft. Tidligere TEST OK beholdes, også Kenneths SJA-PDF-prøve 9. oktober kl. 00:59.

Firmaadmin/KS/HMS-ansvarlig får **KS/HMS → Dokumentuttrekk**: beskriv omfang, hent listen, velg lagrede dokumenter og bekreft valget før **Last ned samlet PDF**. Åtte dokumentgrupper, full RUH-historikk/private bilder, felles rammer og manifest med dokument-ID, utgave/revisjon og sider. Ingen dokumenter velges automatisk. [Scope, testbevis og avgrensning](INSPECTION_EXTRACT_20261009.md). Publisert head/CI/READY og faktisk skynettleserprøve føres ved sluttkontroll.

Neste ufullførte B/C-punkt etter denne leveransen er øvrig vedleggsdekning/versjonerte underskjema; deretter frist-/utløpspåminnelser og kildeoppdatering. Full tilsynsdekning, andre avvik enn RUH, separate originalfiler og framtidige HR-/opplæringsbevis er ikke levert gjennom denne PDF-en. Ingen databaseendring, Production/main/demo-merge eller ekte e-postsending; KS/HMS-utsending forblir deaktivert.

---

## TEST OK og handoff – 9. oktober 2026 kl. 00:59 Europe/Oslo

Kenneth svarte **«test ok. Lagre historikk der du pleier å gi meg en handoff prompt til ny chat»** etter leveransen av egen lagret SJA-PDF. **TEST OK gjelder denne avgrensede SJA-PDF-leveransen.** Tidligere TEST OK beholdes; ikke krev omprøving uten konkret feil/relevant regresjon. Ingen Production-release, main/demo-merge eller ekte e-postsending er godkjent.

Siste verifiserte head før denne dokumentoppdateringen: **0194b2c8173410af71f89a7b2c42c5c39c0b83eb**, tree **e8742eb9ea433caf52a97bda6769c2fca78e8f40**. READY **dpl_5hhq2T6pUeXRaaumhkkW7UWiFnaM** på samme Sandbox-alias. Core Safety **37856612512** / jobb **113582206113**, completed/success med full critical build. Funksjonskode/innlogget PDF-bevis står nedenfor. Main uendret **155f6c4ac01f126c1db0c65da385cfd9305587d5**. PR #216 fortsatt open/draft på **feat-kshms-foundation**. Denne oppdateringen gjelder bare fire KS/HMS-dokumenter; ingen appkode/SQL/test/konfigurasjon endres.

### Neste chat

1. Hent faktisk main og feature-head, kontroller PR #216/READY/QA. Ikke anta at et historisk head i teksten er nyeste branch-head.
2. Les AGENTS.md, hele PROJECT_GUARDRAILS.md, docs/kshms/OVERSIKT.md, CONTINUITY.md, USER_TEST.md og relevant PLAN/QA/critical-check før endring. HR-beslutninger er bevart i HR_SCOPE_20261008.md.
3. Fortsett **gjenstående B/C før HR**, én avgrenset leveranse om gangen: samlet dokument-/tilsynsuttrekk med RUH-historikk/private bilder, øvrig vedleggsdekning og versjonerte underskjema, frist-/utløpspåminnelser og kildeoppdatering. Mobil/flere reelle brukere, ny popup-prøve og ikke allerede bekreftede delprøver består. Velg og beskriv neste scope fra gjeldende plan; SJA-PDF skal ikke bygges om eller testes på nytt som obligatorisk start.
4. Samme Preview: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe . Supabase Sandbox ppvircenkjizeiqdxphj; EXPO_BACKEND_TARGET=sandbox på branch-Preview. KS/HMS-e-postutsending forblir deaktivert. Ingen nye hemmeligheter eller aktivering på grunnlag av denne TEST OK.
5. Skynettleser sist: én innlogget fane (3), KS/HMS → SJA, alle popup lukket. Gjenbruk samme fane/økt hvis tilgjengelig; kontroller faktisk økt ved gjenopptak. Ikke krev ny innlogging bare på grunn av deploy. Ikke signér eller fullfør reelle saker som test.
6. HR er avtalt, ikke implementert: medarbeideren selv, registrert nærmeste leder og firmaadmin kan lese; firmaadmin kan gi tilbakekallbar ekstra lesetilgang per medarbeider. Leder velges fra aktive appbrukere i nedtrekksliste og starter sykefravær manuelt. Lederbytte/historikk og sletting av sensitivt innhold ved fratredelse følger byggekontrakten. NHO/NAV-kilder må verifiseres på nytt ved faktisk implementering. KS/HMS/systemadmin/prosjektrolle gir ikke automatisk HR-innsyn.

Overleveringen ligger varig i Git-repoet; hele chathistorikken antas ikke automatisk overført til ny chat. Fortsett fra de gjeldende notatene og faktisk branch. TEST OK er en delprøve, ikke samlet ferdigstillelse av KS/HMS eller produksjonsgodkjenning.

---

## Publisert SJA-PDF – READY, grønn QA og innlogget nedlasting

Funksjonskode **f7128eff77de3950bfc59f228514069c6c4e3e5c**, tree **461df19cab19286b089d18d8d11461ce899ff541**, identisk med lokal testet commit **b19d54baa8c1260560ce7536b9485a1b826f74b1**. Publisert via GitHub-koblingen med expected SHA 5f19f330, uten force. Lokal originalcommit er bevart. 11 filer i denne leveransen; samlet branch mot main er 209 filer, fire nye scope-filer. Ingen nye backend-/navigasjonsfiler i siste diff.

READY **dpl_HxxWA3HJQKobyEcTXhkZmUa9v5Qy**, eksakt funksjons-SHA på samme faste Sandbox-alias. PR Core Safety **37856299814**, jobb **Core safety + critical build 113581173376**, completed/success (inkludert full critical build). Lokal full Sandbox critical/build exit 0. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, gitBranch feat-kshms-foundation kontrollert uten dekryptering. Main uendret **155f6c4ac01f126c1db0c65da385cfd9305587d5**; PR #216 open/draft.

Innlogget skynettleser på publisert funksjonskode: **Meny → KS/HMS → SJA → Test sja → Last ned PDF**. Lagret analyse **b0f0d6c2-c888-44d7-8b6e-60513aac1f48**, revisjon **2**, signert. Faktisk PDF **1 side / 33612 byte**. MuPDF-render og tekst kontrollert: rammer/tokolonner, hele analysen, arbeidstrinn, Tom/Ringside/bidrag, Kenneth Demo som lagret prosjektleder/signatur og **07.10.2026 kl. 23:47:45**, signert bekreftelse, ordre 78555 og arbeidsdato 12.10.2026. Denne eksisterende analysen har ingen valgte rutineutgaver og ingen prosjektkobling; begge er korrekt merket. Rutineutgaver og låst prosjekt er dekket av de faktiske lokale React/PDF-prøvene, ikke av denne innloggede saken.

Nedlasting viste «PDF er laget fra den lagrede dokumentasjonen». Lagret signatur/status stod uendret etterpå. Ingen lagring, ny signatur eller andre dataendringer. Popup lukket; inventar bekrefter kun fane 3 på samme faste Preview, innlogging beholdt etter deploy. Innlogget utkast-/mobil-/flere-konto-prøve gjenstår; lokale negative scenarioer er dekket. Etterfølgende dokumentcommit endrer bare bevisnotater.

Tidligere TEST OK beholdes. Ny kort SJA-PDF-prøve står først i USER_TEST. Øvrige B/C, samlet tilsynsuttrekk, vedlegg/underskjema og påminnelser/kilder består før HR. Ingen Production, main/demo-merge eller ekte e-postsending. [Scope og QA](SJA_PDF_20261009.md).

---

## Egen lagret SJA-PDF – ny C-leveranse

9. oktober 2026, Europe/Oslo. Miljømål BEGGE, først feature/Sandbox. Fra head 5f19f3304d7eb481ccbebfbb2ef07a2a783eb78b, main uendret 155f6c4ac01f126c1db0c65da385cfd9305587d5. [Scope/kontrakt/bevis](SJA_PDF_20261009.md). Lagret SJA får egen PDF-knapp, felles rammer, full analyse/lagrede rutiner og historisk signatur. Utkast merkes. Dobbel serverlesing sperrer ny revisjon/endret innhold/tilgang; sent svar etter redigering/lukking/firma-/brukerbytte avbrytes. Ingen ny DDL, tilgang, lagring eller signering.

Permanent check, faktisk SJA-PDF React, eksisterende SJA/parent React og fem eksisterende dokument-PDF-flyter PASS. Full Sandbox critical/build PASS exit 0. Tre faktiske QA-PDF-er / fire sider visuelt kontrollert. Eldre prosjekt-SJA-test bruker nå tilgjengelig navn og simulerte read-only antalls-RPC-er for allerede levert sammenfoldet oversikt; verneassertions beholdes. Publiserings-/innlogget bevis følger etter eksakt kontroll. Tidligere TEST OK beholdes. Ingen Production, main/demo-merge, ekte e-post eller HR-implementering. Øvrige B/C før HR består.

---

## Publisert felles KS/HMS-rammer – READY og faktisk nedlasting

Funksjonskode **709bf7d44bb0341a166299e8eab02a79b589afca**, tree **b04bdb0458fda7d42c820bd9add397afade6d157**, identisk med lokal testet commit **8a05bf53624b9fb6479d3c724ef2f3e16809f255**. GitHub-koblingen publiserte med expected head bf5d3449 og uten force. Denne leveransen er 17 filer; samlet branch mot main er 205 filer, kun to nye scope-filer. Lokal originalcommit er bevart.

Full lokal Sandbox critical/build PASS, exit 0. READY **dpl_9Y1JYgasP2332eYhrXZxGkKbFtKi** på samme faste alias, eksakt funksjons-SHA. PR Core Safety **37854417849**, Core safety + critical build **113575047296**, completed/success. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, gitBranch feat-kshms-foundation kontrollert uten dekryptering. Main uendret **155f6c4ac01f126c1db0c65da385cfd9305587d5**. PR #216 open/draft; beskrivelsen oppdatert med endelig layoutscope.

Innlogget skynettleser på publisert funksjonskode: **test ruh → Last ned RUH-PDF** gir **2 sider / 36486 byte før filens provenance-metadata**. Sak e3b21d35-9acb-4a1f-b4db-842a46f44f3e revisjon 2, begge historikkhendelser, alle tiltak/egen kontroll og lagret lukking **08.10.2026 kl. 01:28:17** kontrollert. MuPDF-render av begge sider viser lesbare rammer/tokolonner uten kutt/overlapp. Testsaken har fortsatt 0 vedlegg; faktisk innlogget privat RUH-bildeprøve gjenstår.

Også **Vernerunde / kontroll → test vernerunde → Åpne dokumentasjon → Last ned PDF** lastet ned på samme nye kode: **1 side**, ny rammet layout, R-007 v1, Kenneth Demo, lagret fullføring **08.10.2026 kl. 21:03:15**, deltakere, svar og egen bekreftelse kontrollert. Ingen ny fullføring eller datalagring. Begge popupene er lukket. Faneinventaret bekrefter kun fane 3 på samme prosjektadresse; innlogging ble beholdt etter deploy.

Fire berørte permanente checks og fire faktiske React/jsPDF-suiter PASS, inklusive rutine/mal/lagret kontroll, bilder/matrise, SJA/RUH i prosjekt-PDF, HTML/utskrift og negative tilgang-/revisjons-/avbryt-scenarioer. Endelig layout rendret for alle ulike dokumenttyper/sider; [scope og QA-kontrakt](BOXED_PDF_20261009.md). Dokumentcommit etter dette endrer bare bevisnotater. Tidligere TEST OK er bevart. Layout er fortsatt ny avgrenset brukerprøve; ingen Production, main/demo-merge, HR-rettigheter eller ekte e-postsending.

---

## Felles innrammet KS/HMS-layout – ny avgrenset leveranse

9. oktober 2026, Europe/Oslo. Miljømål BEGGE, bare feature/Sandbox publiseres. Kenneth presiserte at rammer/tettere oppsett gjelder alle KS/HMS-rapporter. [Scope, QA-kontrakt og bevis](BOXED_PDF_20261009.md). Felles PDF-renderer, to kolonner for korte felt og full bredde/fortsettelsesbokser for langtekst; tilsvarende scoped HTML/print. Alle lagrede verdier, status/bekreftelse, bilder og matrise beholdes. Fire relevante critical-checker og fire faktiske React/jsPDF-flyter PASS. Tidligere TEST OK beholdes; «det fungerte» er brukerbekreftelse på forrige RUH-uttrekk. Ny layout må fortsatt vurderes av bruker. Ingen nye HR-rettigheter, Production eller ekte e-postsending.

Publisering og innlogget prøve føres inn etter eksakt head/READY/Core Safety-kontroll. Øvrige B/C-punkter består før HR.

---

## Publisert RUH-PDF – READY og innlogget prøve

Funksjonskode **7ed7eefae961aeb56e6a3fbcee3c5bc3b8a68e45**, tree **567f57ccdeb447b7dbded48a2e75305b73fe253f**, identisk med lokal testet commit 4da0b46f. GitHub-koblingen publiserte med expected-head ff2b2aae og uten force. Lokal originalcommit er bevart. Samlet branch-diff mot main er 203 filer; denne avgrensede leveransen er 11 filer.

Samme faste Sandbox Preview er **READY** på **dpl_HJbefJLJnyttRvmktyQf4BMkcYS1** med eksakt funksjons-SHA og fast alias. **PR Core Safety 37851991453**, jobb **Core safety + critical build 113566887268**, completed/success. Lokal full Sandbox critical/build PASS. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, gitBranch feat-kshms-foundation er kontrollert. Main er uendret **155f6c4ac01f126c1db0c65da385cfd9305587d5**; PR #216 er open/draft.

Innlogget skynettleser på denne publiserte funksjonskoden: DEMO – HOVED → Avvik/SJA/RUH → RUH → Lukkede → **test ruh → Last ned RUH-PDF**. Faktisk fil lastet ned, 4 sider / 37231 byte. Sak **e3b21d35-9acb-4a1f-b4db-842a46f44f3e**, revisjon 2, bevart lukking Kenneth Demo **08.10.2026 kl. 01:28:17**. Tekstkontroll av sak, begge historikkhendelser (registrert/lukket), tiltak, egen kontroll og firmaprofil PASS. MuPDF-layout side 1/4 PASS. Denne saken har **0 vedlegg**; reell privat bildenedlasting er derfor ikke bevist av denne nettleserprøven. Bildeinnbygging/privat GET og feiltilfeller er prøvd med autentisert Storage-stub og ekte PDF-motor. Innlogget bilde-, mobil- og flere-konto-prøve består som eget gap.

Innlogging bevart etter ny deploy i samme fane. Alle dialoger lukket etter prøve; inventar bekrefter bare fane 3 på samme prosjektadresse. Ingen saker, vedlegg, godkjenninger, bekreftelser, signeringer eller varsler endret. Skjermbilde av vellykket uttrekk gjort tilgjengelig. Denne utviklerprøven er ingen ny Kenneth TEST OK. Tidligere TEST OK beholdes. Neste B/C er øvrig vedleggs-/dokumentdekning, samlet tilsynsuttrekk, underskjema og påminnelser/kildeoppdatering; deretter HR med presisert særskilt tilgang. Ingen Production/main/demo-release, databaseendring eller ekte e-postsending/aktivering. Etterfølgende ren dokumentcommit lagrer dette beviset uten funksjonsendring.

---

## RUH-PDF og presisert HR-lesetilgang – 9. oktober 2026

Utgangspunkt ff2b2aaee40902e74f53d4af019d51f4ff200a9a. Miljømål BEGGE; bare samme feature/Sandbox, draft PR #216. Main 155f6c4a. Avgrenset B/C: egen PDF fra lagret RUH med full paginert historikk og autentisert private bilder. Nye rapporthelper/knapp og to QA-scripts; KshmsDeviations får bare import/knapp, eksisterende critical-kjede får ny import. Ingen SQL, global navigasjon, e-post, portal- eller ordinær rapportendring. [Funksjon, sikkerhet, bevis og begrensninger](RUH_PDF_20261009.md). [Ny kort delprøve](USER_TEST.md) erstatter ikke eldre TEST OK.

Permanent eksport-/tilgangsvern, faktisk React-editor/Storage-stub/ekte jsPDF og tekst-/visuell QA av 8-siders historikk/bilder PASS. Berørt tidligere React-prosjekt/SJA/RUH og uendrede critical-avviksassertions PASS. Full lokal Sandbox critical/build PASS. Publisert funksjons-SHA, Core Safety og READY føres etter publisering; ingen innlogget ny PDF-PASS hevdes før faktisk prøve.

Kenneth presiserer at bare medarbeider, registrert nærmeste leder, firmaadmin og dem firmaadmin uttrykkelig gir tilgang, kan lese medarbeiderens innhold. HR_SCOPE oppdatert med egen tilbakekallbar lesetilgang per medarbeider til aktive appbrukere i samme firma. Anbefalt minste rettighet er lesing, ikke redigering/bekreftelse på andres vegne. Ingen automatisk innsyn fra KS/HMS/systemadmin. Dette er byggekontrakt; HR er ikke implementert. B/C før HR, samme Preview, tidligere TEST OK, ingen Production eller ekte e-post, består.

---

## Innlogget kontroll/PDF og HR-avklaringer – 8. oktober kl. 23:47

Kenneth logget inn skynettleseren. Én fane. På feature-head 7113e4bf ble test vernerunde i DEMO – HOVED funnet via Avvik/SJA/RUH → Vernerunde / kontroll → Åpne dokumentasjon. Fullført Kenneth Demo 08.10.2026 kl. 21:03:15 beholdt etter lukking/gjenåpning. Faktisk PDF nedlastet og tekst-/MuPDF-layout kontrollert. Også R-008 v1 fra Min personalhåndbok og tom Bunnledning v1 fra Sjekklistesentral faktisk nedlastet og tekstkontrollert. Ingen dokumenter/bekreftelser endret. Alle dialoger lukket. [Nettleserbevis og begrensninger](UI_TEST_20261008_PDF.md).

Gamle demosjekklister har svar, men mangler ny strukturert kontrollhistorikk; derfor ingen egen kontroll-PDF før en faktisk lagret kontroll. Ordinær prosjektrapport beholder tidligere dokumentasjon. Ny strukturert kontroll med bilder/ulagret sperre, risiko/PDF/prosjektvalg, mobil og flere faktiske kontoer gjenstår. Denne utviklerprøven er ikke ny Kenneth TEST OK.

Ti HR-svar mottatt 23:47: eget HR-valg/Mine oppfølginger; avtalt tildelt leder/firmaadmin-tilgang, KS-rolle uten HR; medarbeider forbereder før felles møte; temaer og egne firmamaler; tiltak valgfritt uten behov, ellers ansvar/frist; begge bekrefter og kan kommentere uenighet; egen historikk under ansettelsen, ny leder overtar tilgang; ansatt mister tilgang ved fratredelse og sensitivt innhold slettes; nærmeste leder settes i nedtrekksliste blant aktive appbrukere og starter sykefravær manuelt. Anbefalt sett: årlig samtale, prøvetid og enkel oppfølgingssamtale. NHO, NAV, Arbeidstilsynet og Datatilsynet lest. [Byggekontrakt](HR_SCOPE_20261008.md) skiller beslutninger, anbefalinger og nødvendig begrenset bevaringsvurdering.

Miljømål BEGGE. Denne runden bare dokumentasjon i feature. B/C før HR består; HR er ikke implementert. Main 155f6c4a og feature 7113e4bf bekreftet før dokumentendring. Ingen Production/main/demo-release, reell sletting, databaseendring eller e-postsending. Tidligere TEST OK består. Etterfølgende dokumentcommit publiserer dette beviset uten funksjonsendring.

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

Neste er den korte oversiktsprøven i USER_TEST.md. Alle 14 skjermbilder er lest. Tidligere TEST OK består; denne UX-delen og PDF-prøven har fortsatt ikke egen bruker-TEST OK. Ingen main-/Production-/demo-, database- eller e-postendring i UX-runden. En etterfølgende ren dokumentcommit registrerer dette beviset uten funksjonsendring.

---

## Prosjektoversikt – sammenfolding, 8. oktober 2026

Kenneths 14 skjermbilder er lest. Avvik/SJA/RUH er gjort kompakt i samme feature/Sandbox: fire lukkede dokumentgrupper med antall/status, og lukkede grupper/rader for sjekkpunkt- og prosjektavvik. Åpne avvik står først; ansvarlig og frist vises på raden. Nye prosjektavvik åpnes etter lagring. Miljømål BEGGE, først Sandbox Preview; tidligere TEST OK består.

Faktisk React/DOM med simulert RPC PASS: metadataantall, folding, bevart redigering, ny sak synlig etter lagring, offline/tapt tilgang/sene svar, låst prosjekt, legacy-lukking og koblet KS/HMS-sak. Eksisterende prosjekt/SJA/RUH- og gjennomføringsprøver PASS. Ingen ny innlogget mobil-/flere-konto-PASS hevdes. Full Sandbox critical/build PASS med exit code 0. Publiseringsbevis er bekreftet ovenfor. Ingen database-, e-post-, main-, Production- eller demo-endring i denne UX-runden. PR #216 beholdes draft.

Neste er den korte oversiktsprøven øverst i USER_TEST.md. PDF-prøven under den er fortsatt åpen. [Omfang og kontroller](PROJECT_OVERVIEW_20261008.md).

---

## Publisert kontroll-/risiko-PDF – READY

Funksjonskode **c6dc21d5073388eb4c57ce16eed447887ff17495**, tree **5642f9df18d308124fcf970b8f6900e702e00785**. Lokal testet og publisert source tree er identiske. Fast Sandbox Preview er **READY** på **dpl_AF8RKPJdjkFDcfSu32MPDauYy3xG**, alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app, eksakt funksjons-SHA. PR Core Safety **37840420573** og jobb Core safety + critical build **113528082970** er completed/success på samme SHA. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, er kontrollert. PR #216 er open/draft. Main står uendret på **155f6c4ac01f126c1db0c65da385cfd9305587d5**.

Neste er bare ny PDF-prøve øverst i USER_TEST.md. Ingen gammel TEST OK gjentas. PDF-leveransen er utviklertestet/publisert, men egen bruker-TEST OK for denne nye delen er ikke mottatt. Øvrige B/C-punkter før separat HR og pilot består. Ingen Production-migrasjon/merge/deploy eller reell e-postsending. Etterfølgende ren dokumentcommit registrerer dette beviset uten funksjonsendring.

---

## Gjeldende leveranse – kontroll-/risiko-PDF 8. oktober 2026

Kenneths «kjør» autoriserer neste avgrensede PDF-del i samme feature/Sandbox. Avklarte valg: lagrede kontrollbilder, farget 5×5 med detaljer, lagrede utkast tydelig under arbeid, både egen PDF og valgfritt prosjektvedlegg, firmaprofilens navn/logo. Miljømål BEGGE; først Sandbox. Ingen main-/Production-/demo-endring eller reell e-postsending.

Egen **Last ned PDF** og **Velg KS/HMS til rapport** er implementert. Fersk lesing kontrollerer tilgang/revisjon; ulagrede endringer stopper egen PDF. Lagrede identiteter, rutine-/malutgaver og egen fullføring beholdes. Forventet risiko er tydelig skilt fra kontrollert effekt; fullført kontroll lukker ikke avvik. Utkast kan eksporteres, men får ingen oppdiktet fullføring. Bare uttrykkelig valgte prosjektdokumenter følger rapporten, og portal får ingen KS/HMS-data.

Sandbox-migrasjon **20261008202524_kshms_execution_report** er anvendt. Ny lesende RPC; gamle SJA/RUH-RPC-er og kommandoer er uendret. **79** faktiske SQL-assertioner PASS med full rollback. Faktisk React/jsPDF: tre egne PDF-er og syv prosjektrapport-PDF-er/fire utskrifter PASS med simulert transport. Lange dokumenter, bilder/logo, matrise og kombinasjon er visuelt kontrollert. Permanent critical og full Sandbox build PASS. Ingen ny innlogget mobil-/flere-konto-PASS eller brukerens TEST OK for PDF er hevdet. Signert SJA/rutineutgaver har samme fingeravtrykk; e-post-enabled=false. [Detaljer](EXECUTION_PDF_20261008.md).

Publisering/CI/READY er bekreftet ovenfor. Fortsett med den korte nye PDF-prøven i USER_TEST.md; tidligere godkjente deler gjentas ikke. Fullplanen A–E og øvrige vedlegg/rapporter/påminnelser/HR består.
---

## Gjeldende avklaring – eksisterende Resend, Sandbox uten reell sending

8. oktober 2026: Kenneth autoriserer videre kontroll og gjenbruk av eksisterende Resend. Sandbox/Preview holdes uten ekte KS/HMS-e-post; tidligere krav om å sette Sandbox-hemmeligheter/aktivere der er erstattet. Lesende Production-kontroll bekrefter smart-worker v18 ACTIVE med RESEND_API_KEY/CHAT_FROM_EMAIL. KS/HMS-kilde bruker allerede de samme prosjekthemmelighetene; smart-worker/payload endres ikke. Sandbox har også smart-worker v18, så eldre e-posttester kan ikke utelukkes; metoden er ikke gjenfunnet. KS/HMS enabled=false er direkte SQL-verifisert. Dagens permanent-test bruker providerstub, ikke innbokslevering. Se [gjeldende oppsett](EMAIL_SETUP.md).

Miljømål BEGGE; kun dokumentasjon endres i denne runden. Ingen Production-merge/DDL/deploy, ingen hemmelighetsendring og ingen sending. Før senere uttrykkelig godkjent release: gjenbruk Production-konfigurasjon, riktig Production-origin/endepunkt, autentisert check uten sending og kontrollert mottaksprøve. Tidligere QA/popup/Preview-bevis består; ikke bygg om ferdig kobling. Denne runden: critical-kshms-notifications-check PASS og critical-kshms-deviations-check PASS på uendret kode. Første avvikscheck i ny dokument-worktree manglet React-avhengighet; prøven ble deretter kjørt i originalarbeidsmappen og besto. Ingen ny full build er nødvendig for ren dokumentendring.

## Sluttkontroll – popup/ansvarse-post READY

Popup og e-postflyt er bygget og tester grønne. Faktisk Sandbox-migrasjon 20261008192529, mailer v4 ACTIVE. Ny rollback-SQL 36 PASS + prosjekt 45, gjennomføring 54, avvik/worker 73, SJA/RUH 93 PASS. Faktisk React/DOM/prøvelenker og full Sandbox critical/build PASS. Fingeravtrykk signert SJA/rutineutgaver uendret. Check request 4 viser HTTP503, transport_safe=true, api_key_configured=false, sender_configured=false; enabled=false, ingen ekte e-post. Samme feature-Preview er READY, main uendret på 155f6c4a. [Bevis](NOTIFICATIONS_20261008.md). Funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`. Samme faste feature-Preview er READY på `dpl_HNUqhySypafZmk9d9CaQXSUVZcVn` med eksakt SHA/alias. PR Core Safety `37833698123`, Core safety + critical build `113505254109`, completed/success. Lokal og publisert source tree er identiske. Preview-binding EXPO_BACKEND_TARGET=sandbox er kontrollert for feat-kshms-foundation. Ingen Production-endring. Gjenstående ekstern konfigurasjon er RESEND_API_KEY/CHAT_FROM_EMAIL i Sandbox; ingen flere bruker-/Production-godkjenninger er utledet.

## Aktivt arbeid – 8. oktober kl. 21:04 Europe/Oslo

Kenneth: «test ok, popup burde lukke seg når godkjent. Alle varsler vi sender i appens ks/hms bør også sendes ansvarlig person på epost». TEST OK er registrert for prosjekttillegget publisert på 8bce982f: prosjektinnganger, rutinevalg og ansvarligvarsel. Dette er ikke Production-godkjenning. Nytt miljømål BEGGE, først samme Sandbox/Preview. Pågående rettelse lukker gjennomføringsdialogen først etter lagring og autoritativ readback; feil beholder kladden. E-post kobles til Avvik/RUH, vernerunder/kontroller, risiko, SJA, pliktig rutinegjennomgang og forfalt håndbokrevisjon, med deduplisering og undertrykking av inaktivt ansvar. Mailer er fortsatt avslått; helse/oppsett må verifiseres uten reell sending. Ingen Production-migrasjon, main-merge eller release er autorisert.

# Gjeldende fortsettelsespunkt – prosjektinnganger og ansvarligvarsel publisert

Funksjonskode `8bce982fb75bf105ee614601e604e438f89a78bc`, tree `ed17f78782d6a49944bd55be6b008d0ef29995e9`. Fast Sandbox Preview er READY på `dpl_4gwb3VsRp7Wf2GWmRrxFNre8DY87`, med samme feature-alias og eksakt SHA. PR Core Safety `37827572425` og jobb Core safety + critical build `113484256816` er completed/success på samme SHA. Lokal og publisert tree er identiske.

Begge brukerbestillingene er implementert: prosjektinngang kun med modultilgang, separate prosjektoversikter og kladder, ansvarligs appvarsel til lagret egen fullføring, godkjente rutineutgaver og stor avkrysning ved begge fullføringsknapper. 44 nye rollback SQL-kontroller, faktisk React/DOM med CSS, gamle berørte brukerreiser og hele critical/build PASS. Rutinene velges med nummer og eksakt utgave; avviksvarsler beholdes når kontroll eller risiko fullføres.

Neste handling er bare den nye korte innloggede brukerprøven i USER_TEST.md. Flere faktiske kontoer og mobil er ikke hevdet prøvd. Tidligere TEST OK består. Main/Production/demo er uendret; PR #216 er draft. Ved ny chat: bruk denne statusen og PROJECT_EXECUTIONS_20261008.md, og ikke behandle den historiske frakoblingen nedenfor som aktiv.

---

## Historikk – gjenoppretting og publisering

# Gjeldende fortsettelsespunkt – forbindelsen gjenopprettet, originalarbeid intakt

8. oktober 2026 etter kl. 20:34 Europe/Oslo svarte arbeidsmiljøet igjen. Originalarbeidet i `/workspace/scratch/31e71b5bfc49/expo-proffdok` er intakt, inkludert den nye faktiske React-prøven og critical-testtilleggene som ikke lå fullt i backupen. Forrige bygglogg viser ferdig Sandbox-bygg. Remote-head 8549888f er fast-forwardet inn uten tap av app-/testendringer. Backupen brukes bare som historisk gjenopprettingsbevis.

Prosjektinngang, separate prosjektkladder, ansvarligvarsler, godkjente rutineutgaver og stor egen bekreftelse ved begge fullføringsknapper er ferdig målrettet prøvd. 44 nye rollback SQL-assertioner og faktisk React-prosjekt/varsel/dialog PASS; tidligere relevante scenarioer og fingeravtrykk består. Hjelp, README, arkitektur og kort testliste er oppdatert. Endelig full Sandbox critical/build etter oppdatert Hjelp er PASS med bekreftet exit code 0; diff-check og branchens Vercel Sandbox-binding er kontrollert. Publisering til samme feature/Sandbox Preview følger nå. Endelig commit/CI/READY registreres her når det er bekreftet.

Miljømål BEGGE. Ingen ny DDL, main-/Production-/demo-endring eller tidligere godkjent brukerprøve gjentas. PR #216 beholdes draft. Ny vernerunde-/risiko-/ansvarligvarselprøve i USER_TEST.md gjenstår. Neste kilde for omfang og prøvebevis er PROJECT_EXECUTIONS_20261008.md. Det tidligere environment_offline nedenfor er historikk og skal ikke behandles som gjeldende hvis ny publisering er bekreftet.

---

## Historikk – frakoblingen før gjenoppretting

# Gjeldende fortsettelsespunkt – prosjektinnganger/ansvarligvarsler testet, arbeidsmiljø frakoblet

Chatten 8. oktober etter ca. 20:07 Europe/Oslo gjenfant arbeidsmappen `/workspace/scratch/31e71b5bfc49/expo-proffdok` på base `2079f5b4ec3e7eaeff0d755c37f7a31294b2182b`. Tilleggene for prosjektets vernerunde og 5×5, ansvarligs faste appvarsel, godkjente rutineutgaver og bekreftelse ved fullføringsknappen er skrevet og målrettet prøvd. Miljømål BEGGE, først samme feature/Sandbox Preview.

44 faktiske nye SQL-assertioner PASS med full rollback: begge oppgavetyper, lesing beholder varsel, omfordeling, minimal varsling uten prosjekttilgang, egen fullføring, beholdt historikk, prosjektisolasjon/paginering, låst prosjekt, revokert modul, anon og ingen e-postkø. Ny faktisk React-prosjekt/varsel/dialog-prøve med simulert RPC PASS; eksisterende utførelses-, SJA-parent- og prosjekt/SJA/RUH-prøver PASS. Utvidet permanent execution-critical for prosjektkladder og faktisk varseleffekt, samt deviation-critical PASS. Samme signerte SJA (1) og rutineutgaver (10) har uendrede MD5 av sortert jsonb_agg: `9a8185f140b7483664c0d98a62b54b8e` / `474ef0379b5149c307ad43be792c18f0`.

Sandbox-migrasjonene `20261008175102_kshms_project_executions_and_tasks` og `20261008180504_kshms_execution_task_access_hint` var allerede anvendt ved gjenopptakelsen. Den sistnevntes manglende lokale fil er gjenfunnet fra migrasjonshistorikken. Ikke kjør dem igjen. Nye funksjoner har eksplisitt firma-/bruker-/modul-/prosjektport, tom search_path og anon/PUBLIC-revokes; tilsiktet authenticated SECURITY DEFINER-advisor er vurdert mot negative SQL-prøver.

`EXPO_BACKEND_TARGET=sandbox npm run build` ble startet. Før sluttresultatet kunne leses, sluttet verktøyet å svare. Siste konkrete feil: `failed to query exec-server capabilities ... 409 Conflict, environment_offline: Environment is not connected.` Full build kan derfor IKKE graderes PASS. Ingen nye appfiler ble pushet, og de nye tilleggene er IKKE publisert. GitHub fungerer; kun dokumentasjon og kildebackup er lagret. Main/Production og PR #216 draft er bevart. Browser-listen var tom; ingen ny fane/reset, innlogget/mobil-PASS eller credential-kall.

Varig [kildebackup og prøvebevis](recovery/PROJECT_EXECUTIONS_20261008_environment_offline.json) er lagret i GitHub i commit `a79372a52a104c3be72fcb442f4e7335fbfe586d`. Backupen er et inert dokument, ikke installert appkode. Den inneholder syv app-/QA-filer og to allerede anvendte migrasjoner. Eksekveringsheader/hjelpere/CSS er rekonstruert fra hentet baseline og gjennomgåtte endringer; sammenlign med original arbeidsmappe når den svarer. Nye lokale React-/critical-testtillegg finnes i arbeidsmappen, men deres fulle kilde er ikke i backupen; ikke påstå at alt lokalt arbeid allerede er pushet.

Neste: gjenkoble arbeidsmiljøet, kontroller original arbeidsmappe og anvend kun backup dersom originalen mangler. Bevar `scripts/kshms-project-executions-react-check.mjs` og utvidet `critical-kshms-executions-check.mjs`; deviation-critical skal nå hente den uendrede gamle varseleffekten fra `function DeviationTasks`. Bekreft full critical/build, oppdater kort testliste/README/arkitektur/Hjelp, og publiser appkode kun til `feat-kshms-foundation` med expected-SHA-kontroll. Verifiser samme faste Preview, CI/Core Safety og Sandbox-binding. Ingen ny Production-godkjenning. Tidligere TEST OK består; ikke gjenta godkjente deler uten ny feil. Ingen nye unødvendige avklaringer kreves.

---

# Gjeldende fortsettelsespunkt – gjenopptatt kontroll-/risikoleveranse

Arbeidet fra avbrutt chat 8. oktober er gjenfunnet. Den opprinnelige vernerunde-/5×5-leveransen nådde Preview på 829ae353; etterfølgende bevis er på feature-head 65f62e0b. Rapportens TEST OK kl. 14:48 og tidligere godkjente delprøver består. Ingen av disse prøves på nytt uten feil.

En påvist kladdfeil er rettet: etter uttrykkelig valg av kollegaens lagrede utgave ryddes den forkastede lokale kladden, så gjenåpning beholder servervalget. Nye meldinger ryddes ved ny åpning. Matrise-/malhistorikk-/Avbryt-vern fra siste publisering er bevart. Ny faktisk React-remount/servervalg-regresjon, eksisterende SJA-parent/sjekklistebygger, 54 rollback SQL-kontroller og full Sandbox critical/build PASS. Migrasjon 20261008131207 og dens eksakte SQL er uendret; ingen ny DDL.

Kladdrettelsen er publisert: funksjonskode `cdac7cf1fe50b724bb87163422e5a0424b01fd58`, tree `47f6249fb6433a6181c9ac94256dd862b097f3bd`. Samme faste Preview er READY på `dpl_7ViZBuSk1G3bjNJ8vUfozN2u8Qhn`; PR Core Safety `37788569184` og jobb Core safety + critical build `113349595488` er completed/success. Branch-målet er Sandbox, main 155f6c4a og PR #216 open/draft. Publiseringsbevis står i EXECUTIONS_20261008.md; etterfølgende dokumentcommit endrer bare notater. Én eksisterende skynettleserfane er gjenbrukt, ingen nye faner/reset; faktisk visning når innloggingssiden, så ingen ny innlogget skjerm-/mobil-PASS hevdes. Ikke gjenta tidligere blokkerte credential-kall. Neste brukerhandling er bare vernerunde-/risikoprøven øverst i USER_TEST.md. Rapport-/vedleggsuttrekk, fristpåminnelser og separat HR følger fortsatt avtalt minimum før Ringside-pilot. Ingen Production-godkjenning.

---

## Opprinnelig publiseringsbevis fra forrige chat

# Fortsettelsespunkt – vernerunder/kontroller og 5×5-risiko READY

Kenneths rapport-TEST OK 8. oktober 2026 kl. 14:48 Europe/Oslo er registrert. Neste tidligere avtalte utførelsesdel er bygget: KS/HMS har Vernerunder/kontroller og Risikovurdering, med eller uten prosjekt, lokal kladd, serverlagring, egen fullføring og bevart historikk. Kontrollavvik går til eksisterende Avvik/RUH med ansvar/frister; fullføring lukker dem ikke. Risiko har blanke scorer, firmavurderte grenser, før/etter-matrise og planlagt/kontrollert effekt med uttrykkelig beslutning.

54 faktiske rollback SQL-kontroller, permanent ny kritisk prøve og reell React/dialog med simulert RPC PASS. Sandbox-migrasjon 20261008131207 er anvendt. Signert SJA (1) og rutineutgaver (10) har uendrede fingeravtrykk. Omfang/testbevis i [EXECUTIONS_20261008.md](EXECUTIONS_20261008.md). Full Sandbox critical/build PASS. Funksjonskode `829ae35315d5e09d4f4e18d7f231f4a2826b8915`, tree `50421488d1498c3045f1d68f56b5efd62c2043d0`: samme faste Preview er READY på `dpl_6nK5QuRTshRSYX5ZAbd3MMPNYBAg`. Core safety + critical build `113342140090` er completed/success på samme SHA. Branch-spesifikk `EXPO_BACKEND_TARGET=sandbox` er kontrollert på nytt (target preview, branch feat-kshms-foundation). Publiseringsbevis står i leveransenotatet. Ny innlogget skjerm-/mobil-PASS er ikke hevdet; tidligere avviste nettleserkall gjentas ikke.

Samme faste feature/Sandbox Preview beholdes. Main er kontrollert uendret 155f6c4ac01f126c1db0c65da385cfd9305587d5, PR #216 fortsatt draft, miljømål BEGGE. Ingen merge, Production-DDL/release eller demo-synk. Neste brukerhandling er bare den nye korte vernerunde-/risikoprøven øverst i USER_TEST.md; tidligere TEST OK gjelder fortsatt. Øvrige rapport-/vedleggsuttrekk, fristpåminnelser og separat HR/kompetanse følger minimumsplanen før Ringside-pilot. Utførelse før HR består.

---

## Historikk – rapport-TEST OK registrert før utførelsesarbeid

# Fortsettelsespunkt – prosjektrapport TEST OK; vernerunder og risiko er neste del

Kenneth svarte «test ok» 8. oktober 2026 kl. 14:48 Europe/Oslo på den korte rapportprøven gitt i chatten: velg prosjektets SJA/RUH i Rapport, PDF med valget og ordinær PDF uten SJA/RUH. Kontrollert feature-head `564778722c17d77358464de4fe465d02d336956e`, funksjonskode `f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c`, samme faste Preview READY på `dpl_5L5KriFjsuoex1g4e3WGfAvzJNZA`. Godkjenningen gjelder rapporttillegget, ikke hele modulen eller Production. Tidligere delprøver består og gjentas ikke uten konkret feil.

Neste avgrensede arbeid er vernerunder/selvstendige kontroller og 5×5-risikovurdering, fortsatt BEGGE og først samme Sandbox Preview. Egen lagring, fullføringshistorikk, valgfri prosjektkobling og kontrollerte avvik er innenfor dette. Se EXECUTIONS_20261008.md. Ingen Production-migrering/merge/release eller demo-synk er autorisert. Utførelse før separat HR og minimum før Ringside-pilot består.

---

# Historikk – SJA/RUH i prosjektrapporten bygget og publisert

Kenneths «kjør» 8. oktober 2026 kl. 13:38 Europe/Oslo godkjente avgrenset valgfri SJA/RUH-del i prosjektets Rapport/PDF/utskrift. Miljømål BEGGE, først samme Sandbox Preview. Brukere med modulen velger konkrete prosjektdokumenter; ingen automatisk avkrysning. SJA viser oppgave/arbeidstrinn/tiltak/rutinenummer og utgave/deltakere/lagret PL-signatur, RUH viser hendelse/tiltak/ansvarlig/frist/status/egen kontroll og lukking. Utkast og åpne saker merkes tydelig. Rapportvalg lagres ikke i prosjektets JSON eller kundeportal.

Implementering og 34 rollback databasekontroller PASS. Faktisk React/PDF/utskrift: 5 PDF-er og 3 utskrifter PASS; lang prøve-PDF på 12 sider kontrollert visuelt med Poppler Cairo. Eksisterende signert SJA og 10 rutineutgaver har uendrede fingeravtrykk. Endelig critical QA/build og publiseringsbevis samles i [PROJECT_REPORT_20261008.md](PROJECT_REPORT_20261008.md). Samme Preview er READY på funksjonskode f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c; Core safety + critical build completed/success. Publiseringsbevis står i PROJECT_REPORT_20261008.md. Ingen Production- eller demo-synk.

Neste brukerprøve gjelder bare rapportvalget og PDF-innholdet i USER_TEST.md. Tidligere TEST OK 8. oktober kl. 13:30 for SJA-utkast/rutine/lagring/gjenåpning og RUH-oppfølging/egen lukking bortfalt varsel/bevart sak består. Ingen nye signerings-/mobil-/flere faktiske brukerøkter-prøver er godkjent av dette. RUH-bildevedlegg/full endringshistorikk er ikke med i første rapportuttrekk. Ingen ny innlogget skjermtest hevdes; ikke gjenta tidligere avviste nettleserkall.

Hovedretningen består: utførelse først, vernerunder/selvstendige kontroller og 5×5-risiko gjenstår; så separat HR (leder bare tildelte ansatte, firmaadmin alle/tildele), minimumsomfang før Ringside-pilot. Production main 155f6c4ac01f126c1db0c65da385cfd9305587d5 er uendret. Hovedretning for senere demo-synk er main → demo.

---

## Historikk før autorisert rapportleveranse

# Gjeldende fortsettelsespunkt – SJA-utkast og RUH-oppfølging TEST OK; rapportkobling gjenstår

Kenneth svarte «test ok» 8. oktober 2026 kl. 13:30 Europe/Oslo på prøven rett ovenfor i chatten: SJA-utkast med rutinenummer → Lagre utkast → lukk/gjenåpne fra samme prosjekt, og RUH → lagring med ansvarlig/frister → egne tiltak/egen kontroll/lukking → bortfalt ansvarligvarsel og bevart sak under Lukkede.

Godkjenningen er registrert mot kontrollert feature-head `75f6ba1f53817a17e4efb3cac778a63d3cfcb9c5` og funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265`. Samme Preview var READY på `dpl_39J3zc2PeqRSq6A8GtGs5pzNwfoA`. Den gjelder de konkrete prøvepunktene, ikke en ny signerings-/mobil-/flere faktiske brukerøkter-prøve, hele KS/HMS eller Production. De godkjente lagrings-/gjenåpnings-/RUH-lukkepunktene og tidligere meny-/dato-/sjekkliste-/håndbokprøver skal ikke gjentas uten en ny feil.

Kodekontroll bekrefter at nye prosjektkoblede SJA-er og RUH-er foreløpig ikke inngår i prosjektets PDF-/rapportvisning. reportTools.js og reportViewTools.js leser eksisterende sjekkpunktavvik og project.projectDeviations valgt med includeInReport. createReportTools får ikke KS/HMS-/SJA-/RUH-data. Nye RUH-er opprettes med source_kind=company og project_id; projectAfterDeviation oppdaterer bare allerede koblede source_kind=project-saker. Dette er en bekreftet rapportmangel, ikke en feil i den godkjente lagringen.

En valgfri rapportdel for prosjektets SJA/RUH, med signatur/deltakere/rutineutgaver for SJA og status/tiltak/ansvarlig/lukking for RUH, foreslås som en egen avgrenset leveranse. Omfang, inkludering og prioritering er ikke besluttet av spørsmålet alene. Avtalt videre utførelsesarbeid med vernerunder/selvstendige kontroller og 5×5-risiko, deretter separat HR og Ringside-pilot etter minimumsomfang, består.

Denne registreringen endrer bare dokumentasjon. Ingen appkode, SQL, rapport, tilgang, e-post, signert analyse eller rutineutgave endres. Main uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 beholdes draft. Ingen Production-migrering/merge/release eller demo-synk. Ingen nye utviklerprøver er hevdet i denne dokumentregistreringen.

---

# Historikk – meny, RUH-inngang og norsk dato TEST OK

Kenneth svarte «test ok» 8. oktober 2026 kl. 01:28 Europe/Oslo på den avgrensede prøven for prosjektets Avvik/SJA/RUH, Opprett SJA / Registrer RUH, KS/HMS → Avvik/RUH og norsk dato. Godkjenningen er registrert mot kontrollert feature-head `42204af397fc1fb6187e7e475c951ecdcd007550` og funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265`. Dette er ikke godkjenning av hele SJA/RUH-lagrings-/signeringsflyten, hele modulen eller Production.

Den korte meny-/RUH-/datoprøven skal ikke gjentas uten en ny konkret feil. Neste nødvendige brukerprøve er SJA-utkast med rutinenummer → lagring/gjenåpning fra samme prosjekt, samt RUH → lagring for oppfølging → ansvarligs egen dokumenterte lukking → bevart rapport. Se de faktiske knappene øverst i [USER_TEST.md](USER_TEST.md). Tidligere håndbok-, avvik-, menyretur- og sjekklistepopup-TEST OK består.

Overtakelseskontrollen bekreftet samme faste Preview READY på `dpl_6LSTm6CzDM94bZEj6Wf58NwvhP27` / `42204af397fc1fb6187e7e475c951ecdcd007550`, PR Core Safety completed/success på funksjonskoden, branch-spesifikk `EXPO_BACKEND_TARGET=sandbox` og de tre SJA/prosjekt/RUH-migrasjonene i Sandbox-historikken. Denne registreringen endrer bare dokumentasjon. Ingen appkode, SQL, tilgang, e-post, signerte analyser eller rutineutgaver endres. Ingen ny innlogget utviklerprøve eller fysisk mobilprøve hevdes; eksisterende Preview-fane kunne ikke bindes og øktens tabbliste var tom.

Miljømål BEGGE, fortsatt feature/Sandbox Preview. PR #216 beholdes draft. Main/Production er kontrollert READY på `155f6c4ac01f126c1db0c65da385cfd9305587d5` / `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`. Ingen Production-godkjenning, merge, Production-DDL eller demo-synk. Vernerunder/selvstendige kontroller og 5×5-risiko følger den korte SJA/RUH-prøven; utførelse før separat HR og bygging før Ringside-pilot er fortsatt vedtatt.

CURRENT_RELEASE_STATUS.md viser nå bare dagens status. Det tidligere samlede statusinnholdet er bevart som [historisk arkiv](archive/CURRENT_RELEASE_STATUS_before_TEST_OK_20261008.md). Eldre avsnitt nedenfor er kontrollhistorikk og skal ikke starte nye godkjenningsrunder.

---

# Historikk før TEST OK – Avvik/SJA/RUH, RUH-meny og norsk dato READY

Oppdatert 8. oktober 2026, Europe/Oslo. Kenneths tre skjermbilder viste en faktisk desktopmenyfeil: det nye navnet Avvik/SJA/RUH ble ikke gjenkjent av adapteren og manglet i toppmenyen. Dette er rettet i menyen, bootstrap-snarveien og workflowmålet. Åpne Avvik går til den faktiske prosjektfanen, også fra Ordreoversikt. KS/HMS har nå Avvik/RUH → Registrer avvik / Registrer RUH og eget SJA-valg. Kun personlig modulbruker får prosjektets SJA/RUH-verktøy.

Frister vises dd.mm.åååå i liste, historikksaksbilder, fast ansvarligvarsel og koblede prosjektavvik. Hendelsestidspunkter viser norsk dato og Europe/Oslo. Date-input/payload/lagring forblir ISO. Ingen SQL-/Auth-/Storage-/e-postendringer i denne rettelsen. Forrige Sandbox-migrasjon består; syntetiske SQL-testdata ble rullet tilbake. De konkrete tekstene i Kenneths to SQL-godkjenningsdialoger er ikke kjent.

Funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265`, tree `c746110e2025cb11b06087bec2084abf651442b2`: READY på `dpl_7eswiB6TH89b1VcUJBxAsiX5ckDA`, Core safety + critical build `113066107707` completed/success. Fast Preview-alias og branch EXPO_BACKEND_TARGET=sandbox kontrollert. Full critical QA/Vite-bygg, faktisk desktop DOM og faktisk React parent/prosjekt/SJA/RUH med norsk listedato/historikk PASS. Ingen ny innlogget nettleserprøve er hevdet; den dokumenterte verktøyblokkeringen ble ikke gjentatt. Testbevis: [NAV_RUH_DATE_20261008.md](NAV_RUH_DATE_20261008.md).

Main er kontrollert uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`. PR #216 er draft. Ingen produksjonsrelease/DDL/demo-synk. Ingen ny SJA/RUH-TEST OK. Tidligere godkjente menyretur-/sjekkliste-/avvikprøver består, men denne nye menynavnfeilen krever den korte prøven øverst i USER_TEST.md.

Neste steg: Kenneth kontrollerer bare synlig Avvik/SJA/RUH, prosjektets Opprett SJA / Registrer RUH, KS/HMS → Avvik/RUH og norsk dato. Full ny SJA/RUH-godkjenning, mobil/flere faktiske brukerøkter og senere vernerunder/5×5-risiko/HR følger tidligere plan. Ikke bygg godkjente deler om eller gjenta gamle databaseprøver uten ny feil.

Notatet er lagret i Git-repoet og trenger ikke kopieres manuelt. Ved ny chat: «Fortsett KS/HMS; les docs/kshms/OVERSIKT.md og CONTINUITY.md.» Hele notatet forutsettes ikke automatisk overført av ChatGPT-prosjektet.

---

# Gjeldende fortsettelsespunkt – prosjekt-SJA/RUH og nummererte rutiner READY

Oppdatert 8. oktober 2026, Europe/Oslo. Les OVERSIKT.md først. Kenneth avklarte ca. 00:24–00:32 at ordreforslag skal være bedriftens faktiske aktiverte ProffDok-prosjekter, samtidig med manuell ekstern referanse. Han ba om nummererte bedriftens rutiner, fagforslag for mur/flis/tømrer, RUH med samme logikk og direkte Opprett SJA / Registrer RUH i prosjektets Avvik/SJA/RUH, bare ved personlig modultilgang. Dette er implementert, ikke SJA/RUH-TEST OK.

Prosjektoversikt / Ordreoversikt og Avvik/SJA/RUH har Opprett SJA og Registrer RUH samt Åpne SJA / Åpne RUH. Begrepene forklares. Ny blank analyse/rapport derfra binder prosjekt-ID. SJA og RUH i KS/HMS kan også velge faktisk tilgjengelig aktivt firmaprosjekt eller manuell ekstern referanse. Godkjente, tilgjengelige rutiner kan leses og velges med fast R-nummer og versjon. Nummer er metadata uavhengig av publisert innhold. Forslag dekker mur, flis, tømrer, VVS og generelle jobber; ingen risiko-/signatursvar autofylles. RUH gjenbruker existing deviation-category/kommando, ansvarligvarsel, egne tiltak/lukking, private vedlegg og historikk. Kladd og retry/readback er vernet per bruker/firma/prosjekt. Legacy avvik/prosjekt-/sjekkpunkt-JSON beholdes.

Funksjonskode `694a4a9a114044ead724532c18133c28045c5863`, tree `e25b2562a45dcde9ced79ecfb54a6b52b053416c`, er READY på `dpl_AX9QTyWPY7KQovT3bGBFPSyKxsdg` og fast alias. Core safety + critical build `113058866219` completed/success. Lokal og remote tree er eksakt like. EXPO_BACKEND_TARGET=sandbox gjelder feature-branchen/preview. Migrasjon `20261007224149_kshms_job_choices_routine_references_ruh.sql` er registrert bare i Sandbox. 93 SQL-assertioner PASS med full rollback, nye faktiske React/DOM-prosjekt-/SJA-/RUH-handlere PASS, eksisterende SJA- og parent-/fanebytteprøver og full critical/build PASS. Eksisterende signert SJA (1) og publiserte rutineutgaver (10) har identiske fingeravtrykk før/etter.

Neste handling: kort SJA/RUH-prøve først i USER_TEST.md. Ingen ny innlogget nettleser-/mobilprøve hevdes; dokumentert skynettleserblokkering ble ikke gjentatt. Kenneths SJA/RUH-TEST OK gjenstår. Gamle meny/sjekklistepopup-TEST OK består, uten nye omtester. Vernerunder, 5×5 risiko, SJA-vedlegg/PDF, separat HR og øvrig minimum gjenstår. Utførelse før HR og bygging før pilot er fortsatt vedtatt. Miljømål BEGGE, main uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft; ingen merge/Production-DDL/-release/demo-synk. Ikke bygg denne delen på nytt ved chatbytte.

Se [SJA_RUH_PROJECT_20261008.md](SJA_RUH_PROJECT_20261008.md) for scope/testbevis.

---

# Historikk – tidligere fortsettelsespunkter

# Gjeldende fortsettelsespunkt – SJA-UX og prosjektinngang READY

Oppdatert 8. oktober 2026, Europe/Oslo. Les OVERSIKT.md først. Kenneths nye tilbakemelding 7. oktober ca. 23:50 er håndtert: samlet mangelliste med feltnavn og fokus ved signering, aktive forslag i alle SJA-tekstfelt og inngang fra prosjekt ved KS/HMS-tilgang. Dette er tilbakemelding og ny scope, ikke ny SJA-TEST OK.

Prosjektoversikt / Ordreoversikt → Åpne SJA viser bare analyser med faktisk prosjekt-ID. Nye analyser derfra følger prosjektet etter lagring/signering. Gamle selvstendige analyser og signert innhold flyttes ikke. Lokale prosjektkladder og tidligere KS/HMS-kladd er separate. Server krever KS/HMS-grant, aktivt firma og prosjektadgang; låst prosjekt avviser endringer. Egen PL-signatur og dokumentert medvirkning består.

Funksjonskode `06a5abbed3ed6a921265c96468f1253d278ca5ee`, tree `ce2df79089500734b0770a0938e0f3f0d736a6c3`, er READY på `dpl_DPUuLEqTcrN2mFr3HN5nrE8D3u4r` med samme faste Preview og bekreftet branch-binding `EXPO_BACKEND_TARGET=sandbox`. Core safety + critical build check `113042525234` completed/success. Eksakt lokal/remote tree samsvarer.

Full critical QA/build, faktisk React/DOM-skjema/ProjectSjaEntry, parent-/fanebyttescenario og 60 faktiske SQL-kontroller PASS. Alle syntetiske SQL-rader er rullet tilbake. Eksisterende signerte analyse (1) bevart med identisk kontrollsum. Sandbox-migrasjon `20261007220221_kshms_sja_project_link.sql` er registrert; tidligere SJA-migrasjon `20261007212858` består. Ingen Production-DDL.

Neste handling er den korte brukerprøven først i USER_TEST.md. Ingen ny innlogget nettleser-/mobilprøve hevdes; tidligere verktøyblokkering må ikke gjentas i løkke. SJA-TEST OK er fortsatt ikke mottatt. Meny/sjekklistepopup er allerede TEST OK. Miljømål BEGGE, main fortsatt `155f6c4ac01f126c1db0c65da385cfd9305587d5`; ingen merge/Production-release/demo-synk. Vernerunder, 5×5 risiko, vedlegg/PDF, separat HR og resten av minimumsomfanget består.

Se [SJA_UX_PROJECT_20261008.md](SJA_UX_PROJECT_20261008.md) for scope og testbevis. Ikke bygg denne delen på nytt ved chatbytte.

---

# Historikk – tidligere SJA-status

# Gjeldende fortsettelsespunkt – SJA READY på samme Preview; kort brukerprøve gjenstår

Les OVERSIKT.md først. Kenneths svar 23:02 er lagret: begge delprøver TEST OK, utførelse før HR, bygg før Ringside-pilot, ledere bare tildelte HR-medarbeidere/firmaadmin alle, og tom SJA med hjelp over feltene. Meny/sjekklistepopup skal ikke testes på nytt uten ny feil.

Avgrenset SJA er bygget: blank jobb, valgbare forslag, utkast/readback, lokal kladd ved fanebytte/remount, kollegasammenligning, ansvarlig PLs egen signatur og uforanderlig analyse. 38 faktiske SQL-kontroller i Sandbox og faktisk React-scenario med simulert transport PASS. Begge faktiske React-scenarioer (den gjenfunne og parent-/fanebyttescenarioet) samt full critical/Vite-build PASS. Migrasjon 20261007212858_kshms_sja er bekreftet fra Sandbox-historikken og eksakt SQL lagret i repoet. Syntetiske rader rullet tilbake. Ingen ny nettlesertest hevdes; skynettleseren er fortsatt blokkert og ingen nye faner åpnes.

Miljømål BEGGE. Neste utviklingsdel er vernerunder og 5×5 risiko. Bare den korte SJA-prøven kan registrere egen SJA-TEST OK; Ringside-pilot kommer etter bygging av avtalt minimum. Bare SJA-prøven øverst i USER_TEST.md gjenstår for denne leveransen. Main/Production/demo er uendret på gjeldende baseline. Vernerunder, 5×5 risiko, PDF, HR og øvrige B–E-deler består. Se SJA_20261007.md.



Funksjonskode `8f14d58282408d872eee0505dc61646dfe4a5c20`, tree `8ad9492809bbd41f8ca37925c1f43e20bf2e53f1`, er publisert READY på `dpl_H3XMgUxRsSHW2pvUiTdxV9Spzuzs`. Fast branch-alias peker til denne deployen; `EXPO_BACKEND_TARGET=sandbox` gjelder feat-kshms-foundation/preview. PR Core Safety run `37691631432` er completed/success på koden. Lokal og publisert tree er identiske. Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`.

---

# Bevart publiseringshistorikk fra tidligere kjøring

# Gjeldende fortsettelsespunkt – SJA bygget og utviklertestet

Påbegynt SJA fra avbrutt chat er gjenopptatt i separat recovery-arbeidsmappe. Tomme jobbspesifikke felt, veiledning over feltene, aktivt valgte forslag, delvise utkast, prosjektleders egen signering og uforanderlig signert innhold er implementert. Migrasjon `20261007212858_kshms_sja.sql` er kun anvendt i Sandbox; 37 reelle SQL-kontroller med full rollback, permanent kontroll, faktisk React-flyt og full critical QA/build PASS. Se [SJA_20261007.md](SJA_20261007.md) for scope/kilder/testgrenser og [USER_TEST.md](USER_TEST.md) for kort prøve.

Funksjonskode `fcea0492531d860ea006e3650b85d3dd18b80c47`, tree `006797ae29ed0f9fb2fadb4897df25bf9c348a03`, er publisert på **samme** feature-Preview. Vercel `dpl_4LUb8LoDB3EVhkko6nwYae29Sy4G` READY og Core safety + critical build `37690659010` success på denne SHA-en. Fast alias/Sandbox-binding og eksakt lokal/remote tree er kontrollert. Eksisterende skynettleserfane 1 kunne bindes, men viste innlogging; ingen ny fane, credentialforespørsel eller innlogget SJA-skjerm-PASS. Ingen main-/Production-/demo-endring; main er kontrollert `155f6c4`.

Neste handling er den **korte SJA-prøven** øverst i USER_TEST.md. Ingen SJA-TEST OK er registrert ennå. Meny og sjekklistepopup er allerede TEST OK; ikke start gamle prøver automatisk eller bygg SJA på nytt. Vernerunder og 5×5-risiko er neste avgrensede utførelsesdeler etter SJA. Prosjektkobling/vedlegg/PDF, separat HR og øvrige roadmapdeler består. Denne dokumentoppdateringen endrer ikke funksjonskoden.

---

# Vedtatte avklaringer – meny og sjekklistepopup TEST OK; SJA

Kenneth svarte 7. oktober 2026 kl. 23:02 Europe/Oslo: TEST OK gjelder begge deler, meny og sjekklistepopup med lagring/fullføring/historikk. Utførelsesdelen prioriteres før HR; vi bygger før Ringside-piloten. Ved individuell HR får ledere bare tildelte medarbeidere; firmaadmin ser/behandler alle og tildeler ansvar. SJA starter tom for hver jobb, med forslag til rutiner/sjekkpunkter og hjelpetekst over feltene. Primærkilder undersøkes før innholdet skrives. Ansvarlig PL signerer fortsatt selv etter dokumentert medvirkning. Dette er ikke Production-godkjenning.

Miljømål BEGGE, først samme Sandbox Preview. Neste avgrensede kodeleveranse er SJA i KS/HMS, med nytt avgrenset datadomene og RPC-er; ingen endring av main.jsx, global meny, prosjektdata, avviksregler, auth eller e-post. Se OVERSIKT.md og kommende SJA-leveransenotat. Vernerunder, 5×5 risiko, PDF, HR og øvrige roadmapdeler består. Ingen gamle godkjenninger skal gjentas automatisk.

---

# Historikk – meny TEST OK, før godkjenning av sjekklistepopup

**Kort samlet status ved chatbytte:** Les [OVERSIKT.md](OVERSIKT.md) først. Den skiller implementert arbeid, Kenneths godkjente delprøver, gjenstående leveranser og spørsmål som fortsatt avventer svar. Eldre avsnitt nedenfor er testhistorikk og skal ikke utløse nye fulle omtester.

Kenneth meldte **«test ok» 7. oktober 2026 kl. 22:39 Europe/Oslo** etter den korte menyprøven. Dette er godkjenning av kompakt Meny og retur fra generell ordre til Startside. Registrert mot kontrollert feature-head `2c7c2b5ee68230056e9dd385986a33756a9b2561`, funksjonskode `9a8bc9d64ec2ac18d82778eca26fbaa9fae10a9f`. Ikke gjenta den beståtte menyprøven uten ny feil. Godkjenningen omfatter ikke hele KS/HMS, popupens lagring/historikk eller Production.

Neste avgrensede handling er den korte sjekklistepopup-prøven øverst i USER_TEST.md: et testpunkt → Lagre → omlasting/gjenåpning → Sjekkliste fullført → Start ny kontroll → bevart historikk med navn/tidspunkt. Utviklerens tidligere innloggede popupprøve, 35 rollback-databasekontroller og React-scenarioer består; ikke bygg funksjonen på nytt eller gjenta SQL-rundene. Miljømål BEGGE, først samme Sandbox Preview. Ingen main-merge, Production-endring eller demo-synk utføres ved registrering av meny-TEST OK. Utviklerens nye skynettleserøkt fikk ingen bekreftet innlogget flate; brukerens TEST OK er eget bevis, ikke en ny utvikler-skjermtest.

Kenneth ba kl. 22:44 Europe/Oslo om nullstilling av skynettleseren. Den støttede REPL-nullstillingen fullførte (`js kernel reset`). Deretter avviste både åpning av ny Preview-fane og gjenkobling til cdp med `native credential state cannot be safely resumed. Start a new browser runtime to continue.` Dette er en verktøyblokkering, ikke påvist botblokkering eller feil i appen. Full restart av nettleserprosessen er ikke eksponert i de tilgjengelige dokumenterte API-ene. Ingen full nettlesernullstilling eller ny skjermtest hevdes som bestått. Ikke gjenta de samme avviste kallene i løkke.

---

# Historikk før meny-TEST OK – hovedmeny etter ordre, 7. oktober 2026

Kenneth har meldt reell regresjon i den globale menyen etter bruk av generell ordre. Den er gjenskapt med hans nøyaktige Prosjektoversikt/Salgsgrunnlag-knapperekke. Årsaken er ordre-adapterens gamle etiketter som overskriver gjenbrukte React-kontroller ved retur, ikke manglende ny menykode. Rettelsen følger den gjeldende React-etiketten på source controls. Scope og før/etter-prøver står i [MENU_RETURN_20261007.md](MENU_RETURN_20261007.md). Miljømål BEGGE, først samme Sandbox Preview. Full critical/build, faktisk React-retur og eksisterende sjekklistepopupscenario PASS. Koden er publisert som 9a8bc9d64ec2ac18d82778eca26fbaa9fae10a9f, eksakt lokal/remote tree-kontroll, READY dpl_95rV35jiRQTjca3Mik9Yecp8qrYU, fast alias og Sandbox-binding kontrollert, Core Safety 37682948736 success. Sikker skynettleserinnlogging ga ingen bekreftet innlogget flate; ingen innlogget skjerm-PASS hevdes. Ikke bygg sjekklistefunksjonen på nytt eller gjenta gamle SQL-runder. Production er kontrollert uendret på 155f6c4. Neste handling er Kenneths samme Preview → generell ordre → ← Startside, og kompakt Meny skal bestå. Ingen ny TEST OK eller produksjonsgodkjenning hevdes.

---

# Gjeldende fortsettelsespunkt – sjekklistepopup, 7. oktober 2026

Miljømål **BEGGE**, først samme Sandbox Preview. Forrige kjøring fortsatte i bakgrunnen etter forbindelsesbruddet og publiserte kodehead `dba4ee3ad8ce700e5eb64df101f95063c65a1d91` (tree `207d8051c449aee8e94d6bdda11805739cc3f015`). En separat recovery-arbeidsmappe ble derfor åpnet på den eksakt samme lokale treutgaven for å unngå samtidige overskrivinger. Ikke bygg denne funksjonen på nytt.

Fast Preview: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe. Vercel `dpl_DCieSStSwjVhZq6rQS9iDNCAiG7C` READY; branchvariabelen `EXPO_BACKEND_TARGET=sandbox` er kontrollert. PR Core Safety run `37668916442` completed/success. Main var uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Ingen Production-migrasjon, merge eller demo-synk.

Avklart funksjon: kompakt ordremeny; ingen automatisk våtromsliste i generelle ordrer; egne punkter uten KS/HMS-/garantikrav på disse ordrene; publiserte firmamaler ved aktiv firmamodul. Listene starter kollapset. Popupen har **Lagre**, **Sjekkliste fullført**, **Start ny kontroll** og historikk. Vanlige åpne sjekkpunktavvik kan følges opp i en ny kontroll via Gå til punkt; historikken beholdes. Samtidige endringer gir konfliktvisning, og videreføring av lagret kontroll beholder tidligere lokal kladd for sammenligning.

Kontroll ved overtakelsen: full critical QA/Sandbox-build PASS; de eksisterende React-prøvene for sentralen/popupen samt en ekstra konkret prøve for konflikthåndtering og avviksoppfølging PASS. Utvidet faktisk Sandbox SQL har **35 kontroller PASS med rollback**. Ingen ny databasemigrasjon ble nødvendig i denne overtakelsen. Den ekstra SQL-prøven verifiserer lukking i ny kontroll, egne nye punkter, gjenåpning, koblet KS/HMS-status og bevart fullført snapshot.

Innlogget desktopprøve på samme Preview er nå PASS: demoordre `a45b0000-0000-4000-8000-000000000001`; egen kategori Annet fag med punkt **QA – sjekklistepopup, syntetisk prøve 07.10.2026**. Lagre → lukk → reload → åpne bevarer Ok og kommentaren. Første fullføring `ddee47a5-84fe-43b1-a18c-a93d0707ca4c` kl. 20:55:53 Europe/Oslo; ny kontroll starter uten tidligere svar og fullføres separat som `7832ff92-31e3-479a-bc2c-13c7a0261bdf` kl. 20:57:08 med Ikke aktuelt og en annen kommentar. Begge har Kenneth Demo som faktisk aktør. Historikken viser begge; første kontroll gjenåpnes skrivebeskyttet med sitt opprinnelige Ok og sin opprinnelige kommentar. [Skjermbevis](checklist-popup-history-proof.jpg). Bare det tydelig merkede testpunktet har fått disse syntetiske gjennomføringene; den innhentede Bunnledning-listen er bare åpnet og inspisert.

Neste handling er Kenneths korte prøve øverst i USER_TEST.md. Ingen ny bruker-TEST OK eller Production-godkjenning hevdes. Ikke gjenta allerede beståtte runder uten en ny feil. To samtidige personer er kontrollert i database-/komponentprøver, ikke som to faktiske browserinnlogginger. Mobilbredde, fysisk kamera, ny PDF og UE-portal for lister med nye gjennomføringer er ikke verifisert her. De gjenværende roadmapdelene består.

---

## Siste overgangskontroll – åpne sjekkliste i generell ordre

Den avklarte inngangen består: generelle ordrer henter under **Sjekklister**, våtrom under **Fag/utstyr**. Baseline er 4b84bab86d1172f84c189615c4f99d17401d9be4. «Åpne sjekkliste» kan nå også åpne riktig gruppe når ChecklistEditor allerede er montert på samme fane; den eksisterende hopprutinen håndterer både mount og et avgrenset åpningssignal. Svar/kladd og prosjektrettigheter endres ikke. Kort faktisk React-prøve av kollapset gruppe → åpnesignal PASS; full critical QA/Sandbox-build PASS. Ingen ny SQL, e-post, main-/demo-merge eller Production-endring. Sjekk aktuell feature-HEAD og fast Preview ved videre arbeid; ikke gjenta eldre fulltester. Den korte prøven i USER_TEST er fortsatt neste brukerhandling.

# Gjeldende fortsettelsespunkt – Sjekklistesentral, 7. oktober 2026

Kenneth har gitt **TEST OK for popup og direkte lukking på ca2f0cb676755338c87e3d4f2a082281d309da8b**. Ikke start denne hele flyten igjen automatisk. Ny bestilling er fagspesifikk Sjekklistesentral med innhenting under Sjekklister i generelle ordrer og Fag/utstyr i våtromsprosjekter. Tilgang avklart: **«Har firma KS/HMS modulen så ja»** – prosjektbrukere trenger ikke personlig KS/HMS-grant for å hente publiserte lister. Sentralen bygges av firmaadmin/KS/HMS-ansvarlig. Ukoblede prosjektavvik fungerer som før.

Sjekklistesentral, publisering og versjonsfaste prosjektkopier er implementert. Kenneth presiserte at generelle ordrer ikke trenger Fag/utstyr. Innhenting ligger derfor direkte under Sjekklister i generell ordre, mens våtrom bruker Fag/utstyr. Ordrebegrensningene består. Nye migrasjoner er anvendt kun i Sandbox. **27 faktiske databasekontroller PASS med rollback**, permanent handler-/kopiregresjon PASS, kort faktisk React-flyt PASS. Se [CHECKLIST_CENTRAL_20261007.md](CHECKLIST_CENTRAL_20261007.md) for eksakt scope, migrasjoner og begrensninger. USER_TEST har neste korte prøve. Arbeidsbranchen er fortsatt feat-kshms-foundation/PR #216; bruk samme faste Preview. Main ved siste kontroll er 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen merge eller Production-/demo-endring er utført.

Dette er én avgrenset del av B, ikke hele roadmapen. Bevar kapitler/rutiner og gjeldende avviksrettigheter. Selvstendige gjennomføringer, vernerunder, SJA, risiko, HR, påminnelser, eksport/PDF og pilot/drift gjenstår. Bruk korte målrettede kontroller; Kenneth tester i Preview. Ikke erstatt historikk nedenfor eller spør om avklarte tilgangsvalg igjen.

---

# KS/HMS – gjeldende fortsettelsespunkt

Oppdatert 7. oktober 2026, Europe/Oslo. Dette dokumentet samler gjeldende brukerbeslutninger og verifiserte referanser etter to avbrutte samtaler. En ny chat skal lese dette først, deretter PLAN.md, SCOPE_A2.md, QA.md og USER_TEST.md. Dette er ikke en ordrett kopi av historikken eller en attest på at hele modulen er ferdig.

## Gjeldende rettelse – kontrolltekst, direkte lukking og popup

Brukeren har lagt inn kontrolltekst flere ganger; «Lagre endringer» slettet den og flyttet fokus oppover. Rotårsaken er gjenskapt i en avgrenset Sandbox-transaksjon: kshms_deviation_command satte control_note til tom streng ved vanlig save. Den gamle fokus-/scroll-effekten kjørte også etter lagring. Brukeren ønsker eksisterende avvik i en popup som lukkes ved lagret lukking, og korte tekster som «OK» i lukkefeltene.

Miljømål BEGGE, først samme Sandbox-Preview. Kontrollert branch-parent 342cf3cadcea3aaa1ecfdb8130ffde96bf17996f; main før endring 155f6c4ac01f126c1db0c65da385cfd9305587d5. Scope: KshmsDeviations.jsx, kshmsDeviations.mjs, DeviationDialog.jsx, deviationDialog.css, eksisterende critical-avvikscheck, én målrettet SQL-check, én ny migrasjon og disse fire test-/fortsettelsesdokumentene. Toppvarselets kompakte utforming fra forrige rettelse består.

- Alle KS/HMS-saker åpner i den eksisterende React-eide popupen. «Lagre og lukk avvik» lagrer hele skjemaet og lukker popupen først etter kontrollert readback av firma/sak, egen signatur, status og innsendt tekst. Ved feil beholdes popup, tekst og lokal kladd. Lukkekrysset beholder kladden; åpning av samme sak henter den automatisk tilbake. Samtidig nyere serverversjon vises som konflikt.
- «Lagre uten å lukke» bevarer kontrollteksten uten å signere/lukke saken, og flytter ikke fokus eller scroll oppover. Readback som ikke inneholder innsendt tekst godtas ikke som vellykket lagring.
- Årsak, Utførte tiltak / forbedring og Egen kontroll av resultatet krever bare ikke-tom tekst; «OK» godtas både i klient og server. Tomme/blanke felter, manglende egen kontroll og lukking på andres vegne avvises fortsatt. Tittel/hendelse/ansvar/frister følger eksisterende regler.
- Migrasjon 20261007163024_kshms_control_note_direct_close.sql er anvendt bare på Sandbox ppvircenkjizeiqdxphj. Vanlig save bevarer control_note. Firma-/tilgangs-/ansvars-/revisjonskontroller, prosjektlås, historikk og varsler er videreført. CLI var ikke installert og npm-tilgang returnerte 403; lokal fil bruker versjonen fra faktisk MCP-migrasjonslogg, ikke en oppdiktet tidsverdi.

Utviklerbevis: permanent critical-kshms-deviations-check PASS med korttekst, uventet teksttap/readback-avslag, lokal gjenåpning, vanlig save, feilet close og bekreftet close som fjerner popupstate. Full EXPO_BACKEND_TARGET=sandbox npm run build PASS. En kort prøve med de faktiske React-komponentene i jsdom og avgrenset RPC-stub PASS: eksisterende sak i portal, gjenfunnet tekst, samme popup/scroll etter vanlig save, beholdt tekst ved feil og automatisk lukking etter bekreftet close. Dette er ikke en innlogget skynettleserprøve.

Databasebevis: scripts/kshms-deviation-save-close-sandbox-check.sql gjenskaper først «Save erased the control note». Rettelsen passerer deretter 14 kontroller både i kandidattransaksjon og etter anvendt migrasjon. Alle syntetiske rader rulles tilbake; ingen reell sak, HTTP eller e-post berøres. EXECUTE er fortsatt sperret for anon, tillatt for authenticated; tom search_path og private tilgangskontroller består. Advisor er kontrollert; den generelle merknaden om bevisst SECURITY DEFINER-RPC vurderes sammen med require_context, firmakontroll og ansvarligsperre. E-postworker er fortsatt deaktivert.

Brukerens korte Preview-prøve gjenstår. Ingen ny full skynettleserrunde; mobil, to faktiske brukerøkter og e-postmottak er fortsatt uprøvd. Ikke gjenta hele opprettelses-/omfordelingsløpet automatisk. Ingen main-/demo-merge eller Production-endring. Hele roadmapen nedenfor består. Det tidligere avsnittets 5/10/10-grenser er erstattet etter brukerens uttrykkelige ønske.

## Tidligere fortsettelsespunkt etter nytt chatbrudd – 7. oktober 2026

**Tillegg med de konkrete bevisene fra den opprinnelige dialogkjøringen:** AVVIK_DIALOG_20261007.md er nå ferdig med case-ID-er 68a26ff6-d9c2-4e1e-a766-e3769b2060fa og 6dc89fcd-bb48-44a0-9430-31dbeb75bcaa, SQL-bekreftet egen lukking, Lukket tilbake i prosjektet og siste faktiske reload på d73. To skjermbevis er lagret med varige referanser. Alle tre opprinnelige prosjektavvik er uendrede, worker er verifisert deaktivert og ingen sending er utført. Dette kompletterer den avbrutte kjøringens bevis; det er ikke en ny automatisk full omtest. Delavsnittet «Siste skjermstatus fra den avbrutte chatten» beskriver hva som var tilgjengelig ved den parallelle gjenopptakelsen før bevisene ble lagret. Den korte tretrinnsprøven i USER_TEST.md og hele roadmapen beholdes.

Dette avsnittet er nyere enn statusene og testlistene nedenfor. Brukeren har bedt om at han tester skjermflyten i den faste Preview-adressen, mens assistenten gjør korte, målrettede utviklerkontroller. Ikke start en ny full skynettleserrunde eller gjenta beståtte prøver uten en konkret grunn. Gi én avgrenset brukerprøve om gangen, rapporter resultat og lagre neste steg før videre arbeid. Dette erstatter de eldre arbeidsmåteformuleringene om at brukerens Preview-prøve ikke kan erstatte utviklerens lange skjermrunde. Relevante permanente critical checks, sikker lagring og eksplisitt TEST OK før eventuell merge gjelder fortsatt.

### Uavhengig kontrollert ved denne gjenopptakelsen

- Arbeidsbranch: feat-kshms-foundation. Funksjonskode: d73cd78935ab769b36c37ae4721934f586f05d27.
- Siste kodecommit er «fix(kshms): keep assignment identity in case and align dialog controls». Forrige kodecommit 88e1bfec7655026ecdb08c9b9796d7cb5b97938b inneholder stor avviksdialog og sikker prosjektkobling.
- Vercel dpl_G5pZJCaMa4pQwNyu1DcakbXt4AiA er READY på d73cd789. Fast alias peker på denne deploymenten: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe .
- GitHub PR Core Safety 37644638589 er completed/success på d73cd789. Eksisterende CI er lest; ingen full lokal build eller database-/skynettleserprøve er gjentatt i denne gjenopptakelsen.
- PR #216 er fortsatt åpen draft, ikke merget. Main er fortsatt 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen Production- eller demo-endring utføres.
- Begge håndbøkenes dekningsgrunnlag, 73 selvstendige forslag, 121 innholdstemaer og seks vedtatte hovedkapitler er bevart. Ikke spør om kapittelvalget på nytt.
- Gjenværende B–E er fortsatt hele utførelsesdelen med firmamaler/sjekklister/vernerunder, SJA, 5×5 risiko, øvrige varsler/PDF/rapporter, separat individuell HR/kompetanse/medarbeidersamtaler, valgfritt stoffkartotek og pilot/drift.

### Siste skjermstatus fra den avbrutte chatten

Brukeren har limt inn den siste assistentstatusen fra forrige økt. Den rapporterer at ny dialog åpner med tittelfokus, kladd overlever omlasting, valgt annen syntetisk ansvarlig beholdes og lagring åpner riktig KS/HMS-sak direkte. Melder får ikke den andres ansvarligvarsel og kan ikke lukke på den andres vegne. Deretter er overtakelse/egen lagret lukking, forsvunnet ansvarligvarsel, Lukket i prosjektet og tildelings-/overtakelses-/lukkehistorikk rapportert. Full-app-mobil var fortsatt utestående. Chatten frøs ved «Bekrefter lukket prosjektavvik etter omlasting», med planindikator «1 av 4».

Dette videreføres som rapportert resultat fra den avbrutte økten, ikke en ny skjerm- eller databaseprøve. Eksakt sak-ID, nye rå skjermbevis og en eksplisitt siste readback etter den aller siste omlastingen er ikke lagret i de gjenfunne testnotatene. Ikke konstruer disse eller grader siste omlasting som ny PASS. Eldre dokumenterte case-ID-er og UI-prøver beholdes som historikk. Koden og deploymenten over er uavhengig gjenfunnet; arbeidet skal ikke bygges på nytt fordi testnotatene var eldre.

### Neste avgrensede handling

Brukeren prøver først bare den nye dialogen på samme faste Preview: lagret prosjekt → Avvik → + Nytt HMS/prosjektavvik → velg ansvarlig og frist → Lagre avvik for oppfølging. Stor dialog, faktisk brukervalg og direkte åpning av riktig KS/HMS-sak skal vises. Se den korte aktuelle listen øverst i USER_TEST.md. Deretter håndteres brukerens resultat før neste avgrensede prøve eller utførelsesleveranse. To separate faktiske brukerøkter, mobil, avviksteller/ukoblet legacy og reelt e-postmottak beholdes som ufullførte kontroller; ingen lang omtest startes automatisk.

E-postlevering i Preview er fortsatt dokumentert deaktivert på grunn av manglende Sandbox-avsenderoppsett. Ingen faktisk mottaksprøve er bekreftet. Den tilstanden er ikke kontrollert på nytt i databasen ved dette dokumentarbeidet.

## Tidligere checkpoint: ny avviksrunde – 7. oktober, etter brukerens krasjrapport

Arbeid fra kontrollert 794a9e5f, nå testet funksjonskode d73cd78935ab769b36c37ae4721934f586f05d27. Brukerens removeChild-feil er gjenskapt med faktisk React-renderer/DOM-adapter og løst i samme prøve. Stor dialog, faktisk ansvarligvalg, frist, «Lagre avvik for oppfølging», bekreftet prosjektkilde/KS-kobling og beholdt kladd er publisert på den faste Preview-adressen. Egen innlogget skynettleserprøve passerer ny separat prosjektavviksrad → valgt medarbeider → direkte åpnet sak → omfordeling til egen bruker → dokumentert egen lukking → Lukket tilbake i prosjektet → faktisk reload. Ny opprettelse/lukking på siste d73-kode passerer også; ansvarlig-ID beholdes i KS-saken, uten redundant ID i prosjektposten. Ditt eksisterende Test-prosjektavvik åpner riktig koblingsdialog med beskrivelse/frist og uten automatisk tolking av fritekstnavn; det er ikke endret eller koblet av utvikleren. Se AVVIK_DIALOG_20261007.md for case-ID-er, skjermbevis og testgrenser. Mobil og to separate innloggede brukere gjenstår. Tidligere UI-prøver beholdes som historikk.

## Mål og leveranseomfang

Bygge en integrert KS/HMS-modul i Expo ProffDok, med Ringside som pilot og mulighet for flere firmaer. Modulen skal omfatte selvstendige, tilpassbare rutiner, dokumentert egen gjennomgang, oppfølging/revisjon, utførelsessjekklister, SJA, risikovurdering, avvik/RUH, varsler og rapporter. Valgfrie deler omfatter individuell personal/kompetanse og stoffkartotek. Kapasitetsmålet på 100 firmaer er en plan, ikke en utført lasttest.

Modulen aktiveres per firma av systemadmin. Firmaadmin gir aktive interne medarbeidere tilgang. Kunde, UE og innleid får ingen ny KS/HMS-modulrettighet. Online mobilbruk er tilstrekkelig i første leveranse. Ordre, timer, materiell, ressursplanlegging og betalingsintegrasjon bygges ikke i denne modulen. Pris/fakturering er fortsatt uavklart og blokkerer ikke gjeldende Preview-arbeid.

## Kontrollert Git- og miljøpunkt

| Referanse | Status ved kontroll 7. oktober |
|---|---|
| Repo | ExpoProffsenter/expo-proffdok |
| Arbeidsbranch | feat-kshms-foundation |
| Siste faktisk UI-testede funksjonskode | d73cd78935ab769b36c37ae4721934f586f05d27 |
| Tidligere A2-funksjonskode med 73 SQL-kontroller | 6bf84204db9c7869bebafb19c034dc02f53f25ca |
| PR | #216, åpen draft, ikke merget |
| Eksisterende checkpoint | checkpoint-kshms-recovery-20261006, 9e88f4cc41db905898a4fbf0e013905ddee30343 |
| Fast Preview | https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe |
| Preview-backend | Sandbox ppvircenkjizeiqdxphj; branch-spesifikk EXPO_BACKEND_TARGET=sandbox |
| Main ved kontroll | 155f6c4ac01f126c1db0c65da385cfd9305587d5 |
| Production-backend | dqffxflaoyarbxyiyhop |
| Siste faktiske skjermprøve-Preview | dpl_G5pZJCaMa4pQwNyu1DcakbXt4AiA, READY på d73cd789 |
| Siste funksjonskode CI | PR Core Safety 37644638589, success på d73cd789 |
| Permanent demo | demo; https://expo-proffdok-git-demo-ringside.vercel.app |

Denne runden endrer avviksdialog, nødvendige prosjektkoblinger og to tekstetiketter som utløste krasjet; ingen SQL/RLS/Auth/e-post- eller demoendring. Full EXPO_BACKEND_TARGET=sandbox npm run build passerer på siste kode. READY, Core Safety og branch-spesifikk Sandbox-binding er kontrollert. Dokumentasjon av siste prøve lagres etter funksjonscommiten. Tidligere 73 SQL-kontroller gjentas ikke uten ny grunn. Historiske håndbok-/sjekkpunktprøver står i UI_TEST_20261007.md; ny dialogprøve står i AVVIK_DIALOG_20261007.md. Miljømål BEGGE; kun eksisterende Sandbox-Preview er oppdatert.

Tidligere håndbok-TEST OK for 6dfb74dad244ff9bd0e416a08f0a34bc88da3c3a gjelder den prøvde håndboken. Ny A2-TEST OK og eksplisitt Production-godkjenning er ikke gitt.

## Originaler og vedtatt kapittelinndeling – 7. oktober

Kenneth har etter sammenligningen besluttet å beholde ProffDoks seks inndelinger **som egne hovedkapitler**: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet. Originalenes fem kapitler beholdes som sporbar kildestruktur. Rutinetekstene skal fortsatt være selvstendig skrevet. Kapittelvalget er avklart og skal ikke spørres om på nytt.

Begge originalene har følgende hovedkapitler, kontrollert i tekst og visuelt på PDF-side 4–5:

1. 01. Vår bedrift
2. 02. HMSK
3. 03. Rutiner
4. 04. Miljø
5. 05. Personvern

| Original | Sider | Varig filreferanse | SHA-256 for kontrollert original |
|---|---:|---|---|
| QualityHandbookpdf.pdf | 148 | libfile_0034077571608191af2e8bfbddf996e7 | 8bf7d80348926287aa34a66282e4bade14ff0d7fcbda186fd365ba77b81f4403 |
| PersonalHandbookpdf.pdf | 127 | libfile_3cebf82948a88191bde1b4dc7a7f8a05 | 49b0e66ebd9a24d259b0971fe3fc0934078c42eaeb71e4ccd9d4a2bb84e1b70a |

Originalene kan hentes igjen med disse filreferansene. Gjeldende lokale kopier i denne samtalen ligger i /workspace/scratch/19673519cc9a/sources/. Ikke bygg videre utelukkende på en gammel lokal filsti. Ikke legg originalenes fulltekst, personlige svar, skjemaer eller illustrasjoner inn i Git-repoet.

Kilder og tema brukes som dekningsgrunnlag. Skriv egne mål, ansvar, fremgangsmåte og dokumentasjonskrav fra arbeidsoppgaven og aktuelle primærkilder. Ikke omskriv originalen setning for setning. Rutineoverskrifter kan være egne, korte beskrivelser. Originalenes kapittel/tema og kildetilknytning skal være sporbar sammen med brukerflatens seks egne hovedkapitler. Gjeldende krav må kontrolleres ved faglig forfatting; historiske covid-regler skal ikke publiseres som universelle gjeldende regler.

### Originalenes fem kapitler og katalogens seks grupper

Katalogen på 228357af bruker fremdeles seks grupper: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet.

Brukerens valg er bekreftet 7. oktober 2026 kl. 14:31 Europe/Oslo: seks egne hovedkapitler. Katalogen har allerede disse seks. Kodekontroll av KshmsModule.jsx bekrefter separate kapittelområder med egne h3-overskrifter for firmaets rutiner; KshmsRoutineLibrary.jsx har et kapittelvalg for standardforslagene. Innlogget skjermprøve 7. oktober bekrefter alle seks valg i «Vis kapittel», 73 forslag og eget filter for «Fag og kvalitet». Firmaets ti eksisterende rutiner ligger under fem befolkede kapitteloverskrifter; ingen fagrutine er valgt der ennå. Bevar stabile rutine- og kilde-ID-er, firmaets egne utkast/kapittelvalg, publiserte versjoner, signaturer og bekreftelser. Omgruppering til originalenes fem kapitler skal ikke gjennomføres. Ingen rutinetekst eller firmadata endres av denne beslutningsregistreringen.

### Tekstlikhetskontroll utført i denne samtalen

Alle 73 forslag på 228357af ble kontrollert mot full sidevis tekstuttrekking fra begge originalene. Felt: goal, responsibility, procedure, documentation og confirmation. Metode: ordtokenisering uten hensyn til store/små bokstaver; søk etter identiske sammenhengende sekvenser på 16 ord. Resultat: 0 treff.

Denne kontrollen dokumenterer direkte lang tekstlikhet i de valgte feltene. Den avgjør ikke kortere likhet, parafrase, rettslig status eller full faglig kvalitet. Manuell redaksjonell/faglig gjennomgang og firmatilpasning er fortsatt nødvendig.

## Beslutninger som ikke skal spørres om på nytt

- Egen gjennomgang/signering av tildelte rutineutgaver er påkrevd før arbeid etter firmaets regel. Det gjelder også firmaadmin og KS/HMS-ansvarlig. Valget ved publisering gjelder tidspunktet for egen bekreftelse, ikke om kravet er frivillig. Ingen automatisk sperre av andre prosjektmoduler er levert.
- Min personalhåndbok er et søkbart oppslag i egne tildelte publiserte utgaver, også etter bekreftelse. Eksakt utgave, faktisk firmagodkjenner og egen gjennomgang med identitet/tidspunkt skal være synlig.
- Firmaadmin og intern medarbeider med aktiv KS/HMS-ansvarligrolle kan utarbeide og godkjenne rutiner. Firmaadmin styrer modultilgang, utpeking av revisjonsansvarlig og arkivering. Den eksplisitt utpekte ansvarlige signerer årlig revisjon.
- Nye sentrale forslag skal aldri automatisk overskrive firmaets tilpassede utkast, godkjente utgaver eller signaturer.
- Melder velger en aktiv intern bruker med KS/HMS-tilgang som ansvarlig. Eksemplet er Trond som velger Eli.
- Eli får tildelings-e-post og et fast ansvarligvarsel i alle interne appfaner. Trond skal ikke få Elis ansvarligoppgave.
- Eli dokumenterer årsak/tiltak/egen kontroll og lukker selv. Bare valgt ansvarlig kan lukke; firmaadmin kan ikke lukke Elis sak som en annen aktør. Tidligere forslag om separat kontrollør er erstattet.
- Lesing, åpning og fanebytte fjerner ikke oppgaven. Varselet forsvinner først ved bekreftet lagret lukking. Feilet eller tapt lagringssvar skal ikke skape falsk lukking.
- Prosjekt-/sjekkpunktavvik kan kobles inn med stabil kilde. Deretter bestemmer KS/HMS status; den gamle prosjektvisningen kan ikke omgå lukking. Ukoblede prosjektavvik og brukere uten modultilgang beholder eksisterende flyt.
- Avvikssentralen har åpne/lukkede saker, ansvarlig, frist, tiltak, egen kontroll, private vedlegg og hendelseshistorikk. Gjenåpning, omfordeling og revokert tilgang kontrolleres på serveren.
- E-post under utvikling skal ikke sendes til ekte medarbeidere. Mottaker/grant/status kontrolleres før levering; deduplisering, retry, lukking og omfordeling inngår. Ekstern rapportdeling krever konkret mottaker-/innholdsgodkjenning og sendehandling.
- Eksisterende tilbud, autosave/hydrering, innlogging, prissøk, prosjektflyter, garantier og sjekklister skal vernes etter AGENTS.md/PROJECT_GUARDRAILS.md. Main → demo er eneste synkretning.

## Roadmap og faktisk status

| Trinn | Målet | Status / neste arbeid |
|---|---|---|
| A | Aktivering, firmatilgang, oppstart, håndbok/utkast/publisering/versjoner, Min personalhåndbok, egne bekreftelser, oppfølging og signert revisjon | Fundamentet er levert i Preview. Tidligere håndbokprøve er godkjent for sin eksakte versjon. |
| A2 + fremskyndet avvik | Full tematisk rutinedekning fra begge håndbøkene, avvikssentral, prosjektkobling, fast ansvarligvarsel og tildelings-e-post | 73 forslag dekker 121 innholdstemaer + fire metadatarader; seks egne hovedkapitler er vedtatt. Innlogget desktopprøve passerer kapittelfilter, firmaavvik, koblet eget sjekkpunkt og separat prosjektavvik med stor dialog, kladd, faktisk ansvarligvalg, egen lukking og omlasting. To separate brukerøkter, full ukoblet legacy-lukking/gjenåpning, avviksteller for egne sjekkpunkter, full-app-mobil, reelt e-postmottak og A2-TEST OK gjenstår. |
| B | Versjonerte firmamaler/gjennomføringer med og uten prosjekt, typede svar/bilder/filer/signaturer, mobile SJA og 5×5 risikoanalyse | Utførelsesverktøy/SJA/risiko gjenstår. Håndbokrutiner erstatter ikke gjennomføringer. SJA signeres av ansvarlig PL; deltaker-/medvirkningsbevis uten automatisk krav om alle deltakersignaturer. Betingede krav og senere underskjema skal versjoneres og bevare signerte snapshot. |
| C | Flere varsler/påminnelser, kildeoppdateringsforslag, PDF rutine/sjekkliste/SJA/risiko/avvik, begrenset rapportutdrag og valgfritt sluttrapportvalg | Tildelingsworker er fremskyndet til A2. Fristpåminnelser, eksport/PDF/tilsynsuttrekk og øvrig C gjenstår. |
| D | Valgfri individuell kompetanse/kurs/sertifikater/utløp, medarbeidersamtaler/oppfølging med separat HR-tilgang; valgfritt stoffkartotek | Gjenstår. KS-rolle gir ikke automatisk tilgang til andres personalmappe. Innsyn, personvern, oppbevaring og kontrollert sletting må spesifiseres før implementering. |
| E | Ringside-pilot, komplett tematisk/funksjonell kontroll, hjelp, drift/kilderevisjon, kapasitet, godkjenning per release og senere supportmodus | Gjenstår. Support skal være firmagodkjent, tidsbegrenset og logget; ingen signering på vegne av andre. Delvis leveranse skal ikke kalles komplett. |

PLAN.md inneholder detaljert minimumsdekning, offentlige kilder, roller, datamodell og akseptanse. CONTENT_STATUS.md/COVERAGE.md/coverage.json bevarer kildetemaer og sporbarhet. CAPACITY.md beskriver planlagte målinger før bred utrulling.

## Tester og gjenstående blokkeringer

Lagret QA på funksjonskode 6bf84204 dokumenterer 73 Sandbox-kontroller med full rollback, grønn eksisterende håndbokkontroll, faktiske React-handler-/task-/legacy-scenarioer, mailer med erstattet transport og grønn full critical build/Core Safety. Disse kontrollene skal ikke omtales som en innlogget full-app-/mobilprøve.

UI_TEST_20261007.md dokumenterer de tidligere innloggede desktopprøvene: firmaavvik 683a29cb-4ccd-47db-9377-8d8504d86db2 og koblet sjekkpunkt bbaa4b37-48d3-49d1-99d8-96da49e73cbf. AVVIK_DIALOG_20261007.md dokumenterer denne rundens to separate prosjektavvik 68a26ff6-d9c2-4e1e-a766-e3769b2060fa og 6dc89fcd-bb48-44a0-9430-31dbeb75bcaa, begge lagret lukket. Første prøve velger en annen ansvarlig og omfordeler deretter til egen testbruker; det er ikke en separat medarbeiderinnlogging. Kladd hentes etter reload, riktig sak åpner direkte, egen lukking bekreftes med aktør/tid og vises tilbake i prosjektet etter reload. Alle tre eksisterende prosjektavviksrader er uendrede. Ny stor React-dialog erstatter den tidligere native prompten; den gamle getJsDialog-grensen er historikk, uten omgåelse. Dev-logs er utilgjengelig i denne browserøkten; DOM/AX/skjerm og databasekontroll virker. Mobilbredde kan ikke settes med denne øktens dokumenterte API, så ingen mobil-PASS. To brukerøkter, full legacy-lukking/gjenåpning, toppfanens teller for egne sjekkpunkter og faktisk e-postmottak gjenstår. Arbeider enabled=false og samtlige tre nye utboksrader pending/attempts=0/sent_at=null. Tidligere environment_offline er kontrollhistorikk.

Sandbox-worker v3 er lagret/deployet, men RESEND_API_KEY og CHAT_FROM_EMAIL er ikke konfigurert og sending er deaktivert. EMAIL_SETUP.md beskriver sikkert oppsett, health/check-mode og avtalt mottaksprøve. Ingen hemmeligheter skal legges i chat, kildekode eller dokumentasjon. Faktisk avsenderoppsett og avtalt testmottaker må avklares ved e-postprøven; dette er ikke et åpent spørsmål om avviksfunksjonen.

## Neste avgrensede oppgaver og avbruddsrutine

1. Kapittelvalget er avklart og innlogget kapittelfilter er prøvd: behold seks egne hovedkapitler og eksplisitt kildedekning av alle 121 temaer. Ikke omgrupper standardbiblioteket til originalenes fem kapitler.
2. Fortsett med to separate brukere etter Trond → Eli-eksemplet, full ukoblet legacy-lukking/gjenåpning, målrettet undersøkelse av toppfanens antall for egne sjekkpunkter og mobil på samme faste Preview. Eget sjekkpunkt og separat prosjektavvik → KS/HMS → lagret lukking/omlasting er bestått; ikke gjenta disse eller firmaets håndbokgodkjenninger uten grunn. USER_TEST.md gir faktisk brukerprøve for den nye dialogen. Brukerens Preview-prøve erstatter ikke utviklerens skjermtest. Ved sperret innloggings-/dialogverktøy: følg dokumentert sikker overlevering når tilgjengelig; ikke omgå beskyttelsen eller kjør samme avviste kall i løkke.
3. Klargjør/avklar e-postoppsett og testmottaker sikkert, og kontroller reelt mottak før funksjonen omtales som ferdig verifisert.
4. Fullfør resterende B–E i avgrensede leveranser etter planen. Ny relevant TEST OK og Production-godkjenning kreves før release.

Ved videre arbeid: les AGENTS.md/PROJECT_GUARDRAILS.md og relevante critical checks; hent aktuell GitHub-HEAD før endring. Bruk separat arbeidsmappe på aktuell head. Ikke resett eller overskriv de gamle arbeidsmappene blindt.

Arbeid i korte, avgrensede deler. Etter hver del lagres kode, migrasjoner, kontrollresultat og oppdatert neste steg i GitHub. Bruk kontroll av forventet branch-SHA ved oppdatering. Endret SHA skal utløse ny lesing/sammenligning; aldri tvangsoverskriv en annen kjøring. Ikke kjør allerede anvendte Sandbox-migrasjoner på nytt uten å kontrollere migrasjonsloggen.

En ny chat kan få denne teksten: «Fortsett KS/HMS Expo ProffDok. Les docs/kshms/CONTINUITY.md på feat-kshms-foundation, deretter gjeldende PLAN/QA/USER_TEST og faktisk branch/PR. Bevar alle beslutninger og hele roadmapen. Fortsett fra første dokumenterte ufullførte oppgave.»

Kapittelsammenligningen er lagt frem og Kenneth har valgt de seks som egne hovedkapitler. Nye funksjonsavklaringer er ikke nødvendige for å fortsette eksisterende Preview-test.

Arbeidsmåten begrenser tap av kontekst og gjenoppbygging ved avbrudd. Den gir ingen garanti mot feil i selve chat-/verktøyplattformen.


## 2026-10-07 — kompakt ordremeny og sjekklistepopup

Miljømål BEGGE. Arbeidet bygger på remote 12183b181e4ce603394ac71b817b3eccb3fac6fa. Bare eksisterende feature/Sandbox Preview oppdateres; ikke main eller produksjonsdatabasen.

Generelle ordrer bruker prosjektets kompakte desktopmeny med ordreetiketter og uten skjulte våtromsfaner. Ingen standard våtromsliste legges automatisk til. Egne sjekkpunkter kan legges til uten garanti eller personlig KS/HMS-tilgang. Firmaets aktiverte modul styrer fortsatt innhenting av publiserte malutgaver. Eksisterende svar som ikke er aktive i ordren, beholdes under «Tidligere dokumentasjon».

Sjekklistene og innhentingen vises kollapset. «Åpne sjekkliste» åpner en React-eid popup. «Lagre» lagrer en kontroll under arbeid for videreføring av personer som allerede har prosjektets redigeringsrett. «Sjekkliste fullført» lagrer en uforanderlig kontroll med definisjon, svar, bilder, serverens brukeridentitet og tidspunkt. «Start ny kontroll» beholder fullførte kontroller og viderefører åpne/koblede avvik. Fullføring lukker ikke avvik. Egne punkter kan legges til en pågående kontroll; fullførte og innhentede maldefinisjoner forblir faste.

Prosjektkontroller lagres i private tabeller med eksisterende prosjekt-/firma-/profilkontroll og låssjekk. Ingen personlig KS/HMS-rett kreves for egne punkter. Revisjonskontroll hindrer at to personer overskriver hverandre. Faste lagrings-ID-er gjør tapt svar trygt å prøve igjen. Readback kontrolleres før lokal kladd slettes. Triggeren beskytter popupens svar mot forsinket vanlig prosjekt-autolagring; eksisterende KS/HMS-trigger kjøres etterpå og beholder autoritativ avvikslukking. Andre prosjektdata, signaturer, vedlegg og legacyavvik beholdes.

Sandbox-migrasjonsloggen er fasit for filnavn: 20261007180955 project_checklist_runs, 20261007182126 project_checklist_command_scope, 20261007182209 project_checklist_command_block, 20261007182259 project_checklist_mirror_scope og 20261007182742 project_checklist_custom_points. De små oppfølgingsmigrasjonene retter SQL-variabelscope før publisering og tillater egne punkter i en kladd. De skal følge grunnmigrasjonen i samme rekkefølge ved senere godkjent produksjonsutrulling.

Verifisert: 31 reelle SQL-kontroller med syntetiske rader og rollback; faktisk React-popup med fanebytte, lagringsfeil/retry, kollegas videreføring, egne nye punkter, bilder, flere kontroller, historikk, konfliktvisning, skrivebeskyttelse og sen firmabytte-respons; kompakt ordremeny videresender til native knapper uten skjulte våtromsvalg. Eksisterende React-test for malbygging/publisering/innhenting og montert sjekklistehopp passerer. «Åpne først»-kravet endrer med vilje gammel tests forventning om automatisk utvidet liste; hoppkontrakten er bevart. Ny critical-check er lagt inn i build/QA. Innlogget Preview-prøve gjenstår før TEST OK/merge.

Kort brukertest på samme faste Preview: Åpne testordren → Sjekklister. Menyen skal være kompakt og listene kollapset. Åpne «Egne sjekkpunkter og vedlegg», legg til et punkt, åpne listen og lagre. Åpne den igjen (gjerne med en annen person som har prosjektadgang), fortsett og trykk «Sjekkliste fullført». «Start ny kontroll» skal åpne neste kontroll mens den første kan leses i historikken. Prøv også en publisert KS/HMS-liste.

ZIP-leveransens endelige lokale full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS exit 0. PR-scope/release-docs-guard PASS mot faktisk main. Berørt eksisterende samle-PDF React/Storage/jsPDF PASS: begge faktiske PDF-er, innhold/signaturer/bilder/manifest, fjerning av valgt dokument og sent kontekstbytte. QA-foto er større enn forrige testfoto, så sideantallet endret seg; dette er ingen tap av felter. Innlogget ny ZIP/nedlasting vurderes etter publisering, ikke gradert PASS her.

Tekstoppfølging: faktisk React/ZIP med fem syntetiske vedlegg, eksisterende permanent ZIP/PDF-check og full Sandbox critical/build PASS. Transport/filformat uendret; ingen ny brukernedlasting kreves for å beholde allerede godkjent ZIP-prøve. Publisert tekst/eksakt head følges opp i PR #216 og innlogget nettleser.
