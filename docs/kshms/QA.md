# KS/HMS QA – trinn A

2026-10-05. Branch `feat-kshms-foundation`, baseline main `155f6c4`. Miljømål BEGGE. Kun Supabase Sandbox er endret. Trinn A er ikke full KS/HMS eller produksjonsgodkjent.

## Verifikasjonskontrakt

Firmaadmin etablerer → tilpasser → godkjenner → ansatt leser og bekrefter. Utpekt ansvarlig reviderer og signerer eksakte publiserte versjoner. Navigasjon/auth og eksisterende prosjekt-/salgssikkerhet skal fortsatt virke.

| Kontroll | Resultat og grense |
|---|---|
| Kildekapitler og rutiner | 125 sporbare rader; 105 kvalitetsoppføringer/88 personaloppføringer, 16 underemner og 4 metadatarader; 148/127 sider og begge filhash registrert. Alle 275 sider dekket av kildeintervallkontrollen. |
| Krav/kilder og produktvalg | Registrert i PLAN og de 12 selvstendige standardutkastenes referanser, kontrollert 2026-10-05. Dette er ikke ferdig forfatting av alle kildetemaer. |
| Preview-miljø | Branch-spesifikt `EXPO_BACKEND_TARGET=sandbox` verifisert via Vercel. Feature `dpl_DjdWNA3MuAWkLXtjyMzQ7DPwa7p4` READY, kode-SHA `f88eb975a541ee875f50eef233cb1e09245c44ac`. Publisert `workProfileClient-BeVSXbh6.js` inneholder Sandbox-URL og ingen Production-URL. Dette er første feature-deploy; gjeldende branch-Preview og siste deploy-status følger PR #216. |
| Migrasjon | Håndbokfundament og avgrensede reparasjoner anvendt på Sandbox `ppvircenkjizeiqdxphj`. Ingen Production-endring eller blind branchmerge. Git-migrasjonene inneholder den endelige funksjonsdefinisjonen. |
| Database/API | `scripts/kshms-sandbox-check.sql` PASS mot faktisk `authenticated`-rolle og ferske syntetiske auth-identiteter. Alle testdata rulles tilbake. Ingen faktisk ansatt eller håndbok bekreftet. |
| Klient og eksisterende kritiske flyter | Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS med hele eksisterende critical-kjeden og ny KS/HMS-kontroll. Vite-build PASS. Eksisterende advarsel om store bundle-chunks beholdes. |
| Desktop-komponentflyt | PASS med faktisk React-modul og syntetiske RPC-svar: standardutkast, kilder/type/kontrolldato, firmatilpasning, publiseringsforhåndsvisning, godkjenning, ansattbekreftelse, ansvarlig revisjon/historikk og vesentlig ny versjon. V1-bekreftelsen beholdes; V2 vises som manglende. |
| Mobil komponent | PASS i iframe med 390 px ramme / 375 px innvendig viewport. Ingen horisontal overflow; synlige tekstfelt og knapper har minst 44 px høyde. Mobil rutinekladd beholdes ved skjul/åpning av appfane. Dette er ingen fysisk enhetstest. |
| Nettleserfeil | Ingen app-/React-feil observert i komponentflyten. Nettleserutvidelsen logger egne metadatafeil; disse er ikke appfeil. |
| Git-scope/dokumentasjon | PASS mot hele committede endringen og `origin/main`. Første kodepublisering brukte verifisert tree `694b78ce0c497c9708ed77e80238fe5723bc7a3e`; senere rettelser gjennomgår samme lokal/API-tree-kontroll. Ingen QA-fixture eller demo-overlay i feature-PR. GitHub Actions-status følges separat. |
| Innlogget full-app Preview / bruker TEST OK | GJENSTÅR. Komponenttesten erstatter ikke reell innlogging og serverflyt via appen. |
| Merge / Production / main → demo | IKKE GODKJENT / IKKE UTFØRT. |

SQL dekker deaktivert modul; systemadminaktivering uten automatisk innholdsinnsyn; firmaadmin grant; KS-ansvarlig kan redigere, men ikke publisere, arkivere, tildele tilgang eller utpeke ny revisjonsansvarlig; ansatt ser bare egne tildelinger uten utkast/roster; kryssfirma og feil forventet arbeidsfirma; tilbakekalt tilgang; deaktivert/ekstern bruker; stale oppstart/utkast; gamle versjoner/bekreftelser; ny versjon krever egen bekreftelse; serveravledet identitet/tid; idempotent tildeling; uforanderlige versjoner/bekreftelser/revisjoner; eksakt revisjonssnapshot, stale snapshot, ettårsgrense og avvisning av tom aktiv håndbok; kildekontrolldato i fremtiden avvises; direkte tabell/private helper/anon-adgang avvises.

Klientkontrollen dekker faktiske hook-racer ved grant-/arbeidsprofilbytte, auth-identitetsbytte før effekter, nettfeil, unmount og listener-opprydding; eksplisitt bruker-/firmabundet kladd med opprinnelig revisjon; global navigasjon bak grant, uendrede prosjektfaner; flerfaglig relevans og publisert versjonssnapshot.

## Review-Preview og PR

[Draft PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216). [Faktisk feature-Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe) er åpnet i nettleser og viser eksisterende innloggingsflate. Brukeren har prøvd oppstart og rapportert avvik som er rettet nedenfor. Utviklerkontrollen omfatter komponent med syntetiske svar og faktisk authenticated SQL-scenario; full innlogget appflyt og brukerens nye TEST OK gjenstår. Utvikleren har ikke aktivert et eksisterende firma eller endret reelle ansattilganger.

Før innlogging logger eksisterende arbeidsprofilklient «Innlogging er ikke klar ennå». Samme melding, samme `workProfileClient-BeVSXbh6.js` og fungerende innloggingsflate er observert i uendret main-baseline i Sandbox QA-Preview. Dette er et eksisterende oppstartsloggfunn, ikke rettet som sideendring i denne PR. Det hevdes derfor ikke null appfeil i hele Preview. Innlogget kontroll skal avklare at arbeidsprofilen lastes etter autentisering.

## Nettleserbevis og avgrensning

Komponentkontroll i isolert QA-branch `test-kshms-handbook-ui`: desktop `dpl_2PAw3RxR6T84MXA2tnnSNxy673XD`, mobil `dpl_GZsRvceK7f8HFVLETD7dEiAAbK57`, begge READY. QA-branchens statiske fixture/telefonramme ligger **ikke** i feature-PR eller main og skal aldri merges derfra. Den inneholder bare syntetiske navn/identiteter og mock-klient; ingen reell Supabase-innlogging eller sending. Desktopbildet viser tydelig dette og forskjellen mellom gammel bekreftelse og ny versjon:

![Syntetisk komponentkontroll: v1 bekreftet, v2 mangler](reading-proof.jpg)

## Sikkerhetsrådgiver

Supabase advisors rapporterer tilsiktet INFO [RLS aktiv uten policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) og WARN [authenticated SECURITY DEFINER-funksjon](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) for RPC-modellen. Direkte tabellprivilegier er fjernet; funksjonene har tom search_path, privat hjelpe-schema og eksplisitte auth-/firmaskope-/grant-/rollevern. Avslagene testes med faktisk authenticated-rolle, ikke bare som databaseeier. Det hevdes ikke at advisors har null funn. Legacy-funn ligger utenfor denne PR.

## Test som gjenstår før merge

Systemadmin aktiverer kun testfirma i feature-Preview/Sandbox. Firmaadmin gir ansvarlig/leser grant og lagrer flerfaglig oppstart; tilpasser og publiserer rutine. Leser bekrefter; utpekt ansvarlig reviderer. Vesentlig endring publiseres, og ny bekreftelse mangler mens gammel historikk beholdes. Kontroller også faktisk appfanebytte, arbeidsprofilbytte og tilbakekalling. Ingen faktisk e-post sendes.

HR-tilgang, private storage-filer, SJA-signering, rapport-PDF, varselutsending og kontrollert avvikslukking er fortsatt krav i senere trinn og rapporteres ikke som testet i A. Persondatautlevering/sletteservice gjenstår før produksjonsklar full modul. AGENTS krever ny eksplisitt bruker TEST OK før merge, deretter Production-verifisering og main → demo/preflight.

## Rettelser etter oppstartstest (2026-10-05)

Brukeren meldte uklar oppstartstekst, ønsket VVS uten pilotnavn, mistet arbeidsbilde ved nettleserfanebytte og manglet egen firmaadmin i ansvarliglisten. `installWorkProfileUx` henter arbeidsprofil på fokus og publiserer også uendret firma. KS-hooken nullstilte da kontekst og unmountet modulen. Den permanente runtime-kontrollen gjenskapte tap av oppstartsvisning/lokale felt før rettelsen, og passerer med samme-firma-prinsippet fra eksisterende Sales `syncWorkProfileScope`. Ingen ny recovery-motor, timere, reload eller endring i Sales/bootstrap er introdusert. Reelt firmascopebytte, tilbakekalling, identitetsbytte og gamle RPC-svar beholder avslagene.

Feltforklaringene er varige, med selvstendige VVS-eksempler og tilgjengelig `aria-describedby`; eksemplene skriver ikke firmaets data. Ansvarliglisten inkluderer aktive firmaadministratorer, også egen bruker merket «deg». Ny funksjonsmigrasjon `20261005212145_kshms_firmaadmin_appointment.sql` er anvendt kun på Sandbox og lar firmaadmin utpekes uten ekstra grant. Server krever fortsatt eksplisitt utpeking før revisjonssignering. Utvidet authenticated-scenario PASS: egen utpeking/signatur med eksakte versjoner, ingen automatisk grant, erstattet ansvarlig mister signering, annen firmaadmin og vanlig leser kan ikke utpekes på feil grunnlag. Alle syntetiske data rullet tilbake. Advisors viser samme tilsiktede RPC/RLS-funn omtalt over. Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS etter rettelsen. Desktopkontroll i `dpl_HkQocyvBf1rhcaDmQ4Jc74Qt2pQy` / QA-SHA `5956f3910723edd66c99a5cb8dd8c5eb89766839` PASS: tre ulagrede felt og oppstartsvisning overlever samme-firma-event og skjul/åpning, og egen firmaadmin kan velges og lagres. Mobilkontroll av samme komponent/hook i 390 px ramme PASS: 375 px innvendig viewport, scrollWidth 375, alle tre textarea 126 px høye, tilknyttede feltbeskrivelser og bevart tekst etter profiloppfriskning. Ingen app-/React-feil observert; utvidelsens metadatafeil er separat. Dette er syntetisk komponentkontroll, ikke reell innlogget full-app-verifikasjon eller fysisk mobiltest.

![Oppstartsrettelse: feltforklaring og egen firmaadmin valgt. Syntetisk komponentkontroll.](setup-proof.jpg)

## Rutinebibliotek: flervalg og tydelig innlegging (2026-10-05)

Brukerens skjermbilder viste kort som så ut som et utvalg, men hvert klikk åpnet ett standardutkast i samme ulagrede editor. Bare det siste utkastet var derfor synlig; klikkene lagret ikke flere rutiner. Biblioteket har nå native avkrysning, «Valgt», samlet antall og «Disse rutinene legges inn» med alle valgte titler. «Legg inn» lagrer hver rutine som kladd med eksisterende save-RPC. Lagrede rutiner viser «Lagt til» og «Rediger her». Firmaets kapitteloversikt viser antallet rutiner og bruker samme redigeringsflyt. Godkjenning og tildeling skjer fortsatt separat.

| Kontroll | Resultat og grense |
|---|---|
| Permanent runtime-regresjon | `critical-kshms-check` PASS: ti utvalgte rutiner lagres én gang hver; dupliserte valg fjernes; de resterende to kan legges inn uten å overskrive eksisterende firmatekst. Feil ved tredje lagring og tapt svar etter commit testes med nytt forsøk uten duplisering. Feil firmascope avvises og unmount stopper videre kommandoer. Eksisterende hook-/fanereturkontroller beholdes uendret. |
| Desktop med faktisk React-modul | PASS i isolert QA `dpl_8N4125uLdZpz6JAYpjbSmYjQQcbz`, SHA `6db78418c4ba71156bc456c81b67c9f9d1afef43`: ti valg vises både i kort og samlet liste; filterskifte beholder utvalget; alle ti finnes som egne firmakladder etter innlegging. En åpen ulagret rutine/tekst beholdes gjennom valg, innlegging, samme-firma-refresh og skjul/åpning av appfane. «Rediger her» åpner og fokuserer riktig kladd; tilpasning lagres, publiseres og vises i ansattens eksakte v1. Leseren har ingen rutinebibliotek/editor; v1-bekreftelse vises registrert. |
| Mobil med samme komponent/hook | PASS i 390 px iframe med 375 px innvendig viewport: ti valg beholdes gjennom KS-visningsbytte, samme-firma-refresh og appfanebytte. Ti kladder legges inn; redigert mål beholdes ved ny faneretur. scrollWidth 375; knapper minst 44 px, avkrysningsetiketter minst 55 px. Dette er ikke en fysisk mobiltest. |
| Sluttkode og opprydding | Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS etter at også busy/progress nullstilles når en ny tilgangskontekst lastes. Et avbrutt gammelt utvalg låser dermed ikke den nye arbeidsflaten. Oppdatert fixture `dpl_DD8xmNPGWkgDeg41mPuYEYkX3rDr`, SHA `966573bb5ee689bf17c5bb67cd8eb3aea5aa9e18` PASS: alle 12 valg beholdes ved samme-firma-refresh og legges inn som 12 egne kladder; «Les standardutkast» åpner kun leseforhåndsvisning, uten ny editor eller ekstra rutine. Gjeldende feature-SHA/deploy følger PR #216. |
| Database, tilgang og historikk | Ingen ny migrasjon, tabellrettighet, direkte klientlagring, publisering, signering eller tilgangsregel introdusert av flervalg. Tidligere authenticated SQL-verifikasjon gjelder uendrede serverfunksjoner og er ikke gjentatt uten ny DB-endring. Samtidig innlegging fra to administratorer er ikke en ny garantert atomisk/idempotent operasjon. |
| Full-app / Production | Ny innlogget brukerprøve i feature-Preview gjenstår. Syntetiske UI-svar er ikke bevis på full-app-innlogging eller virkelig firmainnhold. Ingen merge eller Production-endring; ingen ny TEST OK. |

Skjermbildene viser samme utvalg før og etter innlegging i den syntetiske komponentkontrollen:

![Ti rutiner valgt med synlig avkrysning, Valgt og samlet antall. Syntetisk komponentkontroll.](library-selection-proof.jpg)

![Ti rutiner lagt til med Rediger her på hver rutine. Syntetisk komponentkontroll.](library-added-proof.jpg)

## Enkel veiledning og fast testlenke (2026-10-06)

Hver fane forklarer nå hva brukeren gjør der og neste steg. Håndboken viser fire korte trinn: velg, legg inn, tilpass og godkjenn. Utkast, versjon og revisjon forklares. Rutinefeltene har konkrete hjelpeord og varige feltbeskrivelser. Godkjenning, lesing og oppfølging bruker samme knappnavn som [brukertestlisten](USER_TEST.md) og Hjelp. AGENTS krever fremover en konkret testliste med handling og forventet resultat, enkel veiledning og samme stabile Preview-adresse.

| Kontroll | Resultat og grense |
|---|---|
| Klient og build | Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS med uendret critical-kjede. Etter én siste statisk presisering om å lese alle tildelte rutiner er Vite-build PASS. Ny GitHub Actions-kontroll av publisert HEAD følges i PR #216. |
| Desktop med faktisk React-modul | PASS i isolert QA `dpl_9WVR6ougoH43haYw7KFQxwc4cuKu`, SHA `8cbc8eeddd10e579782973e457aa901c06c4d009`: egen firmaadmin velges og lagres; to rutiner vises som Valgt og i samlet liste; filterskifte beholder begge; begge legges inn. Rutinefeltene viser tilknyttede forklaringer. Redigert mål beholdes ved samme-firma-refresh og skjul/åpning av appfane, lagres og vises i publiseringsvisningen. Begge rutiner godkjennes. Leser får begge eksakte v1, bekrefter dem og tas ut av listen over manglende bekreftelser. Oppfølgings- og revisjonsfeltene forklarer ansvar og neste steg. Ingen ny revisjonssignering er utført for denne tekstendringen. |
| Mobil med samme komponent/hook | PASS i 390 px iframe: 375 px innvendig viewport og scrollWidth 375; de fire trinnene står under hverandre. KS/HMS-knapper er minst 44 px høye. Dette er ikke en fysisk mobiltest. Ingen app-/React-feil observert i komponentkontrollen; nettleserutvidelsens metadatafeil er separat. |
| Innlogging og fast adresse | Vercels eksisterende branch-alias brukes videre. Appens eksisterende Supabase-klient og registrering er uendret; installert klient bruker vedvarende økt og automatisk tokenoppfriskning. Ny kode på samme adresse krever normalt ikke ny innlogging. Brukerens faktiske innloggede økt er ikke verifisert av komponenttesten. Oppfriskning på samme adresse/nettleser er derfor første brukertest. Ny adresse, nettleser, privat vindu eller avsluttet økt kan kreve innlogging. |
| Uendrede regler | Ingen migrasjon, auth-løsning, RPC-argument, tilgangsregel, firmascope, innholdsversjon eller signaturregel endret. Den eksakte ansattbekreftelsen og revisjonsbekreftelsen er uendret. Tidligere authenticated SQL-kontroll er ikke gjentatt uten DB-endring. |
| Leveransestatus | Håndbokfundament A; resten av minimumsomfanget er fortsatt planlagt. Ny innlogget brukerprøve/TEST OK gjenstår. Ingen merge, main/demo-endring eller Production-godkjenning. |

![Enkel veiledning med fire trinn. Syntetisk komponentkontroll.](guidance-proof.jpg)
