# Organisasjon, systemadmin og varetelling 05.11.2026

Arbeidsbranch fase45b-whole-app-qa-20261104 / PR311. Miljømål BEGGE; kun Preview/Sandbox. Main 34daef4c. Ingen TEST OK eller produksjonssetting.

## Innlogget før endringen (81204ff9)

Organisasjonskart: firmavalg/filter og hierarki kontrollert uten endringer. PDF faktisk lastet ned: to sider, 568422 byte, SHA256 866f5bd4f0fb12e44b1d50fed48042d4b58e0023482b759cb080b0ab16742b65. MuPDF-render viser korrekt typografi; Popplers fontsubstitusjon var misvisende. PDF-motor beholdt.

Systemadmin: Dokumentsynk og E-postutsending kun lest. Ingen synk, send eller kontrollutsending. Firma/prosjektets supportoversikt viste Expo med 0 brukere / administrator ikke satt samtidig som kartet viste fire medlemmer. Dette er et åpent, ikke rotårsaksbekreftet avvik og omfattes ikke av rettelsen.

Opprettet bare egen Sandbox-telling QA – helappkontroll 05.11.2026, lager QA-IKKE-IMPORTER. Katalogvare DEMO-DAN-001, antall 2,5 og manuell vare 000123, antall 0. Begge bekreftet lagret, lukket/åpnet og beholdt. Tellingen ble avsluttet med skrivevern; eksport fortsatt tilgjengelig. Ingen Cordel-import eller bestilling. Eksisterende plukkliste med én Dansani-vare beholdt.

Cordel-tekst: Windows ANSI, 50 byte, SHA256 b066314e752455a1c6f2075b52419bcc194a1d8bf3577c5b4a197a9cf01cb882. Eksakt to CRLF-linjer: 000123;0;QA leverandør og DEMO-DAN-001;2,5;Dansani. CSV: UTF-8 BOM, 383 byte, SHA256 75ce1331250fc8ff41587a803a5f3b38a53261d0ab0f02df850f5e11e891f091. Varenummer med ledende null, nullantall, desimalkomma og leverandør beholdt; ingen priser i filene.

## Avgrenset rettelse

Kartets forklaring samles i details, statistikker deler bredde med introduksjon. Ingen kartdata, roller, redigering eller PDF-kontrakt endres. Varetelling trenger ikke ekstra Åpne-trykk etter fanen; valgt arbeidsflate beholdes under skjult vert, nøkkel fortsatt per bruker/firma. Eksisterende asynkron kontekstkontroll beholdes. Pågående kommando får ærlig ventestatus; tapt svar bruker fortsatt samme recovery-ID.

Lokalt: stocktake-check PASS, organization-react-check PASS (faktiske komponenter/syntetisk transport), Sandbox-build PASS. Native Chromium kan ikke startes i lokal kjører på grunn av socket-begrensning; ingen omgåelse forsøkt. Native CI og ny innlogget Preview-geometri gjenstår på kandidat. Ingen full helapp- eller full videodekningsattest.

Tilbakeføring: revert av avgrenset appcommit; ingen migrering eller datareset.

## Innlogget etterkontroll dd6b5e8b

Vercel dpl_8k8TExzVq1TBTKhXDKz4Pr6PxtXf READY på eksakt commit. På 1363×936: introdelen med statistikker er 79px høy. Begge veiledningssummeringer er 44px/16px og starter lukket, åpning viser opprinnelig innhold. Ingen horisontal side-overflow. Kartflaten begynner ved y874 i den komplette KS/HMS-verten; hovednoden ligger fremdeles nær skjermkanten. Ikke attestert som full kartoversikt uten scrolling. Avdelingsfilter viste Expo Proffsenter og retur Hele firmaet beholdt kartet.

Varetelling åpnet direkte etter ett trykk. Et lokalt, ulagret navnefelt beholdt eksakt tekst etter Søk varer → Varetelling, uten ekstra åpneknapp; feltet ble satt tilbake uten opprettelse. Eksisterende avsluttet QA-telling ble lest: 000123=0 og DEMO-DAN-001=2,5, ingen registreringsknapp, eksport aktiv. Ingen serverdata skrevet i etterkontrollen. Mobilgeometri gjenstår for kartet.

## CI936

Native varetelling: 81 kontroller PASS, fem bredder, tregt svar, bevart felt, reload, samme recovery-ID, konflikt, 122 linjer, eksport, avslutning og scope. Samlet app-browser stoppet senere i price-search-mobile-check fordi den gamle prøven krevde Åpne varetelling. Prøven er tilpasset den nye direkte inngangen: originalt lagerfelt og opprettelsesskjema må bli synlig etter ett trykk; manglende ekstra knapp og opprinnelige 44px-/overflowkrav kontrolleres. Syntetisk stocktake_list returnerer tom liste, ingen skriving. Ny full CI kreves; CI936 er ikke full grønn.

## Mobilkart: ny kontrollpakke

organization-workspace-browser-check.mjs bruker de faktiske komponentene, design-CSS og sen APP_RUNTIME_STYLES med sperret ekstern transport. Fem bredder 320/390/768/1363/1920 kontrollerer side-overflow, 44px/16px-kontroller, internt kart, statistikker, veiledning, filter/søk, beholdt lokalt kartnavn og dialogutkast, avbryt/forkast og sperret opprettelse av felles kart. Bare syntetiske read-RPC; ethvert skrivekall registreres og avvises. Dette er ikke fysisk mobil/Safari eller innlogget helappgeometri. Testen kjøres først i eksisterende app-browser-pakke. Lokal syntaks og fixture-bundling PASS; Chromium startes ikke lokalt på grunn av tidligere bekreftet socket-begrensning. Faktisk native CI-resultat må bekreftes før attest.

CI938 stoppet i den nye testharnessens Vite-resultathåndtering før nettleseren startet. Resultatet normaliseres nå for både enkelt-/array-output før lokal bundlekontroll. Fixturen inkluderer også faktiske KS/HMS-hostklasser og modul-CSS som brukes i appens designkaskade. Dette er en harnessrettelse, ikke appfeil eller mobilattest.

CI939 kom videre til nettleseren, men kartet startet ikke: lokal jsdom-evaluering av nøyaktig fixturebundle gjenskapte ReferenceError: process is not defined i Reacts lib-bundle. Fixturen definerer nå NODE_ENV som de øvrige lib-baserte React-prøvene. Lokal kjøring bekrefter faktisk montert .org-company-node i jsdom, uten geometriattest. Diagnostikk ved oppstartsfeil er beholdt. Ingen appkode endret.

## CI940: faktisk mobilfunn og rettelse

Kart, veiledning, statistikker, filter/søk og byggevisning kom gjennom de fem breddene. Native prøven stoppet i avdelingsdialogen på320px: horisontal overflow. Fargevelgeren hadde én ubrutt flexrad; avgrenset CSS lar den bryte og binder hver farge til44px bredde. Dialogens opprinnelige lagre-/avbryt-/dataflyt beholdes. Kravet om ingen overflow er beholdt og utvidet med konkrete utstikkende elementer ved feil og44px-måling av hver farge ved alle fem bredder. Ny native CI kreves. Miljømål BEGGE, foreløpig kun Preview/Sandbox.
