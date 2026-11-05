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
