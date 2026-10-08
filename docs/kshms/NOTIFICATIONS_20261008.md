# KS/HMS – popup og ansvarse-post, 8. oktober 2026

Kenneths TEST OK kl. 21:04 Europe/Oslo gjelder prosjektinnganger, rutinevalg og ansvarligvarsel fra 8bce982f. Samme melding bestiller automatisk popup-lukking etter fullføring og e-post til ansvarlige for KS/HMS-varsler. Miljømål BEGGE, først samme Sandbox/Preview. Ingen Production-godkjenning.

## Leveranse

Kontroll fullført og Vurdering fullført lukker egen dialog og eventuell oppgavedialog først etter kommando og autoritativ readback. Lagre utkast holder dialogen åpen. Feil beholder kladd/bekreftelse; en listefeil etter verifisert fullføring viser lagret status og kan ikke gjøre lagringen til en feil. Historikk, blank neste gjennomføring og åpne avviksoppgaver beholdes.

| Varsel | Mottaker | Utsendingsgrunnlag |
| --- | --- | --- |
| Avvik/RUH | Valgt ansvarlig | Oppretting, gjenåpning eller ny ansvarlig |
| Vernerunde/kontroll | Ansvarlig for gjennomføringen | Første lagrede utkast eller ny ansvarlig |
| Risikovurdering | Ansvarlig for vurderingen | Første lagrede utkast eller ny ansvarlig |
| SJA | Valgt prosjektleder | Lagret utkast med valgt leder eller ny leder |
| Les og bekreft | Hver tildelt medarbeider | Godkjent utgave som krever egen gjennomgang |
| Forfalt håndbokrevisjon | Utpekt KS/HMS-ansvarlig | Neste kontroll er passert; én per ansvar/datosyklus |

Eksisterende outbox/RPC/cron er utvidet. Privat tildelingsgenerasjon stopper gamle forsøk ved A→B→A uten å legge kolonner i signerte SJA-er, gjennomføringshistorikk eller rutineutgaver. Triggere køer atomisk med serverlagringen. Aktuelle uferdige appoppgaver er inkludert én gang. Vanlige lagringer/visninger gir ingen ny e-post. Fullføring/signering/egen bekreftelse, ny revisjonsdato eller omfordeling stopper usendte oppgaver. Aktivt firma-/modulmedlemskap og faktisk ansvar/status sjekkes ved reservasjon og rett før levering. Endret adresse etter første forsøk undertrykkes. Samme kø-ID, mottaker og app-origin beholdes ved retry; sen validate/finish kan ikke overta et nyere forsøk. Eksisterende Avvik/RUH-lukking er ikke endret.

E-posten inneholder type, nødvendig handling og beskyttet firma-/dokumentlenke. Ingen sakstittel, hendelsesbeskrivelse, bilder, tiltak eller personlige notater. Gjennomføringslenken leser faktisk kind/prosjekt fra autorisert detail-RPC; SJA/rutine/revisjon åpnes i eksisterende KS/HMS-faner. Feil firma viser byttebeskjed. Lenken signerer/bekrefter ingen ting.

## Kontroller

- 36 nye faktiske Sandbox SQL-assertioner PASS, full rollback og ingen HTTP/leverandørkall: RPC-lagring, tildeling/retry, A→B→A, SJA-leder, pliktig/informativ utgave, egen publiseringsbekreftelse, datoendring/revisjon, egen fullføring/signering/ack, adresser, tilgang, service-only reservasjon, forsinkelse og forsøk-fencing.
- Relevante eksisterende SQL-prøver: 45 prosjektgjennomføring, 54 gjennomføring, 73 avvik/worker og 93 SJA/RUH-assertioner PASS. Tidligere «ingen kontroll-e-post»-forutsetning er erstattet med den nye kontrakten; avvik fra samme kontroll skal fortsatt gi nøyaktig én avvikstildeling.
- Faktisk React/DOM med simulert RPC PASS: begge popuper lukker etter verified save, failure/readback retry beholder dialog, listefeil kan ikke feile lagret fullføring, historikk/ny blank gjennomføring, oppgavedialog, andre åpne avvik, beskyttet gjennomføringslenke og feil firma. Faktisk SJA-parent/prosjekt/SJA/RUH PASS, også SJA-/rutine-/revisjonslenker, ingen implisitt signatur/ack og feil firma.
- Permanent critical-test prøver seks meldingsvarianter, minste meldingsinnhold, ugyldige/ambivalente lenker, check-mode mens av, manglende oppsett uten reservasjon, providerstub og idempotens/fencing. Den kjøres automatisk gjennom eksisterende critical-kjede.
- Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS, exit 0. Eksisterende generelle bundlestørrelsesvarsler er ikke endret.
- Signert SJA: 1, fingeravtrykk `9a8185f140b7483664c0d98a62b54b8e`. Rutineutgaver: 10, `474ef0379b5149c307ad43be792c18f0`. Begge identiske før/etter. Ny schemahistorikk: `20261008192529_kshms_responsible_notifications`, bare Sandbox.
- Supabase advisors kontrollert. RLS uten policies er bevisst for RPC-only private kø-/tildelingstabeller med tilbakekalte klientgrants; negative tilgangsprøver PASS. Ny user-FK-indeks beholdes selv om den foreløpig er ubrukt. [RLS-advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) og [indeks-advisor](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index). Ingen generell advisor-opprydding hevdes.

## Faktisk e-postoppsett

Sandbox mailer v4 ACTIVE, verify_jwt=false videreført fra v3 med egen 256-bit Vault-auth og service-only RPC. Autentisert check-mode request 4 kl. 21:27 Europe/Oslo: HTTP503, configured=false, transport_safe=true, api_key_configured=false, sender_configured=false. enabled=false før/etter; ingen leveringsforsøk eller ekte e-post. Køen inneholder 40 uferdige rutinetildelinger og 8 tidligere avvikstildelinger. [Oppsettet som gjenstår](EMAIL_SETUP.md): RESEND_API_KEY og CHAT_FROM_EMAIL må settes i Sandbox Edge Function Secrets før check og kontrollert aktivering. Ingen ekte leverings-/innboks-PASS.

Funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`. Samme faste feature-Preview er READY på `dpl_HNUqhySypafZmk9d9CaQXSUVZcVn` med eksakt SHA/alias. PR Core Safety `37833698123`, Core safety + critical build `113505254109`, completed/success. Lokal og publisert source tree er identiske. Preview-binding EXPO_BACKEND_TARGET=sandbox er kontrollert for feat-kshms-foundation. Ingen Production-endring. Gjeldende status står i CURRENT_RELEASE_STATUS.md og CONTINUITY.md. Main `155f6c4ac01f126c1db0c65da385cfd9305587d5`, PR #216 open/draft. Ingen main/demo-merge, Production-DDL eller release. Ingen ny browser-fane, credential-/loginprøve eller innlogget mobil-PASS. Separat HR og kontroll-/risiko-PDF følger tidligere avtalt videre arbeid; vedvarende fristmarkering gir ikke daglig duplikat-e-post.
