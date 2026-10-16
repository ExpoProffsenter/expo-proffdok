# Overlevering – Support etter TEST OK

Kenneth har godkjent siste Preview kl. 01:23 Europe/Oslo 17.10.2026.
PR #263 er merget; full CI #521 og #522 SUCCESS på godkjent head
1c8338f6129d0683a39bfbdb8a56864cc3b0e1ec. Main merge:
e50504b41c701728561ec47fa210ffb16f38e06b. Production Vercel
 dpl_3xd24np1sbrXRsD64SSNG5PswHks READY på expo-proffdok.app.
Avsluttende dokumentasjons-/demo-SHA og faktisk preflight føres i PR #263.

## Ferdig appflyt

Support ligger ved Hjelp. Min side viser uleste svar og åpner samme sak.
Systemadmin har grupper som KS/HMS, ett område om gangen, med bevarte
brukersøk/nyhetsutkast og Internt vareregister i eget område. Alle systemadmins
kan lese/svare på alle saker; Ansvarlig er fjernet. Send svaret først, bruk Merk
som løst for avslutning. Nytt brukersvar gjenåpner saken.

To utklippsfeil er rettet: samtalen ble først erstattet under fokus, og deretter
remontert av uendret publisert arbeidsprofil/modultilgang. Samme sak, kladd,
markering og scroll beholdes ved uendret autorisert kontekst. Reelt firma-/rolle-
eller kontobytte rydder privat innhold. Alle tidligere tester beholdes.
QA: 109 PostgreSQL-, 60 support-Chromium-, 30 layout- og 55 transportassertions
PASS. Se qa/SUPPORT_FOLLOWUP_20261017.md og qa/SUPPORT_LAYOUT_20261017.md.

## Production backend

MCP registrerte følgende versjoner; kildefilene beholder Sandbox-versjonene:

| Navn | Production-versjon | Kilde i supabase/migrations |
|---|---|---|
| support_cases | 20261016232401 | 20261016212201_support_cases.sql |
| support_queue_worker | 20261016232402 | 20261016212328_support_queue_worker.sql |
| support_deletion_compatibility | 20261016232410 | 20261016215024_support_deletion_compatibility.sql |
| support_scheduler | 20261016232412 | 20261016221008_support_scheduler.sql |
| support_queue_eligibility | 20261016232414 | 20261016221255_support_queue_eligibility.sql |
| support_overview | 20261016232415 | 20261016223601_support_overview.sql |

Alle 19 funksjoner/ACL stemmer med Sandbox-fingerprint
e3d61e72b22052102ff5e1060c43853b. support-mail v1 og support-inbound v1
er lest tilbake identisk med godkjent kilde. Én migrasjonsregistrering kolliderte
på sekundstempel; transaksjonen var rullet tilbake, og migrasjonen ble kjørt på
nytt med ny registrert versjon. Første inbound-bundling manglet en delt import;
ny pakking med begge delte filer lyktes, og sluttkilden er identisk. Ingen app-
eller SQL-kilde ble endret av disse operasjonelle korrigeringene.

Lesende Production-prøve under faktisk godkjent systemadmin bekrefter fersk gate,
aktivt firma og tom egen-/fellesinnboks. Ingen syntetisk Production-sak opprettet.
Private skjema-/tabelltilganger er nektet, anon har 0 supportfunksjoner. Advisor-
notatene om private deny-all-tabeller og tilsiktede autentiserte definer-fasader
er kontrollert mot denne ACL-/actor-kontrakten. Gamle bakgrunnsjobber er uendret.

## Neste etappe: faktisk support-e-post

E-post er AV i begge miljøer. Production Secrets har servermottaker, korrekt
SUPPORT_APP_URL, SUPPORT_MAIL_MODE=disabled, SUPPORT_INBOUND_ENABLED=false.
Production har godkjent separat RESEND_RECEIVING_API_KEY. Køarbeideren er AV med
tom endpoint. Ingen virkelig supportmail er sendt i QA eller denne releasen.

Resend: Kenneths vanlige passordkonto, team ringside. Ikke bruk den tomme
GitHub-innloggede kontoen. Gamle sendenøkler beholdes. Verifisert avsenderdomene
expoproffsenter.no, ferdig mottaksdomene ualoomorai.resend.app uten DNS-endring.
email.received-webhook er bare klargjort, ikke opprettet. Nøkkelverdier og intern
mottakeradresse skal aldri inn i repo, klient, API-svar eller brukerens Reply-To.

Neste chat bør lese AGENTS.md, hele PROJECT_GUARDRAILS.md, denne filen,
SUPPORT_OPERATIONS_20261016.md, SUPPORT_PLAN_20261016.md og siste status i PR #263.
Kontroller faktisk main/demo. Fullfør mottakswebhook og avtal én konkret prøve
med Kenneths verifiserte adresse. Mottak i innboks og e-postsvar tilbake til samme
sak må prøves før toveis støtte omtales som ferdig. Ikke aktiver hele gammel kø
ukritisk. Ingen nye kodenøkler eller MX-endring på eksisterende postbokser.
