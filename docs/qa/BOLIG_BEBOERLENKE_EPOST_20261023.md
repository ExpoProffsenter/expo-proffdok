# Beboerlenker på e-post – 23. oktober 2026

Miljømål **BEGGE**, eksisterende feature/Sandbox/PR278. Start e5d3037ee7e4e894866d26d4bc1368ece6999df3; main36462e2b05ecd8e53dcdd7818c4b791b7c7cb2ed. Kenneth «kjør» gjelder direkte sending av portalinvitasjon, påminnelse og beboeravtale-/endringsordrelenke fra eksisterende mottakervindu, med samme e-postmal. Ingen produksjonsmerge eller generell e-postaktivering.

## Scope og gjennomføring

BoligPortalManager og BoligCommerce, ny felles BoligResidentInvitation/boligResidentMailClient, delt brandedInvitationMail fra eksisterende UE-mail, ny bolig-resident-link-email, én additiv migrasjon, egne DB/handler-/nettleserprøver og relevant hjelp/handoff. Eksisterende aksept, publiseringstrinn, portaltilgang, kontaktbytteregler, ordre, RLS/Storage og global navigasjon beholdes. Ingen andre moduler eller timeadministrasjonskandidaten endres i denne pakken.

- Beboerportal → Klargjør invitasjon → Lag portaltilgang holder samme vindu åpent og viser Send beboerlenke. Eksisterende lenke kan sendes via Send invitasjon på e-post. Klargjør påminnelse bruker samme lenke uten å fornye den. Kopiering beholdes.
- Endringer og beboeraksept → Opprett beboerlenke viser sending i samme avtalevindu for både boligavtale og endringsordre. Godkjent/publisert status og gjeldende token må allerede finnes. E-post oppretter/publiserer/aksepterer ingen avtale.
- Serverbestemt navngitt mottaker, firmalogo/signatur, prosjekt/bolig, gyldighet og eventuell avtaleutgave. Avtalepriser, private meldinger og saksvedlegg sendes ikke i invitasjonen; disse gjennomgås på riktig lenkeside. Forhåndsvis e-post er valgfri. Sendingshistorikk og eksakt retry ligger i samme vindu.
- Samme faktiske mørke invitasjonslayout som UE, gjenbrukt som én renderfunksjon. Lange overskrifter brytes, og headeren stables på svært smal iframe. Egne tester klikker inne i den sandboxede rammen. Ingen ny separat godkjenningsmodul eller automatisk sending ved lenkeopprettelse.

## Serverkontrakt

**20261023214107_bolig_resident_invitation_mail**, kun Sandbox. Nye private deny-all resident_link_mail og resident_link_mail_settings; separat transportbryter starter AV. RPC er authenticated invoker → smal privat definer. Eksisterende work-profile-context/Projects/manager/aktivt selskap og prosjekt kreves. Riktig bolig/target/type, kanonisk mottaker og tokenhash sjekkes. De faktiske native portal-/avtalegatewayene gjenbrukes i get/prepare/begin, med eksisterende kontakt-, bygg-, lisens-, revokerings- og utløpsgrenser. Besvart/tilbakekalt/utløpt avtale kan ikke sendes. Portalens menu_version og avtalens revision binder siste gjennomgang. Kontaktbytte A→B→A gjenoppliver ikke lenken.

Raw token finnes i opprinnelig nettleserlenke og requestminne, aldri i snapshot eller historikk. Serveren bestemmer origin. Frosset innhold, mottaker/revisjon og samme sendings-ID/provider-idempotens håndterer nettbrudd. Uavklart påbegynt forsøk blokkerer ny sending også på tvers av portalinvitasjon/påminnelse. Cooldown1min, maksimum10 opprettelser/døgn/target og23t dedupliseringsgrense. Kun service_role kan kvittere provideraksept; sen kvittering kan lagres selv om lenken etterpå er sperret. Mottak i innboks er aldri utledet av providerkvittering.

Edge **bolig-resident-link-email v2 ACTIVE**, egen Auth.getUser før RPC/prepare/begin; verify_jwt=false fordi handleren utfører Auth-valideringen. Gjenbruker serverhemmelighetene RESEND_API_KEY/CHAT_FROM_EMAIL når konfigurert, uten å hente dem til klienten. Egen bryter AV også om andre motorer er aktive. UE-edge v3 får kun den samme delte responsive layouten; eksisterende56 handlerasserts består. Ingen cron, køvask, nye utsendingsmottakere eller endring av progress/KS/HMS/HR-motorene.

## Verifikasjon og grenser

- **1392 PostgreSQL-assertions PASS**, tidligere1351 beholdt. Nye41 inkluderer aktuelle portal-/avtalemottakere og type, ugyldig token/firma/bolig/rolle, direkte tabell/service-only-kvittering, frozen replay, purpose-binding, pauset begin, felles uavklart-sperre/cooldown, menyskifte, begge avtaletyper, besvart avtale, utløp/revokering, Projects-bortfall og kontakt A→B→A.
- **60 resident-mail-handlerasserts PASS** med providerstub: alle fire invitasjonsvarianter, normal appmal/logo/reply-to, korrekte fragmentruter, ingen implisitt aksept, escaping, kanonisk serverinnhold, Auth/pauset/konflikt, providerfeil, fast idempotens og private feilmeldinger. Eksisterende UE56 PASS.
- Portal/avtale-Chromium dekker samme vindu etter publisering, faktisk iframeklikk, mottaker, eksakt sendingsreplay etter nettbrudd/remount, påminnelse uten ny lenke, pauset transport og mobilbredder390/320. Tidligere portal-/aksept-/kladd-/scope-/ordreflyter beholdes. Endelige antall og full build/publisert status føres etter kontroll.
- Faktisk Sandbox **rollback-smoke PASS** gjennom native prosjekt-/kontakt-/pakke-/portal-/avtale-RPC-er: serverprofil/mottaker, portal/påminnelse/boligavtale, ingen råtoken i retur, eksakt prepare, pauset begin og revokert replay. Alt rullet tilbake. Uautentisert faktisk Edge-POST gir401 med uncertain=false; ingen providerkall.
- Sikkerhetsrådgiver har samme seks kategorier. To nye private tabeller er bevisst deny-all med tilbakekalte klientgrants; negativ direkte-tilgangstest består. Ingen generell advisor-opprydding påstås.

Sandbox-origin er fast Preview. Resident-, UE- og fremdriftstransport forblir AV; ingen ekte mail er sendt. Testadresse er allerede bekreftet **kenneth@ringside.no**, og kan brukes ved en kontrollert senere test. Ingen innboksmottak eller fysisk Safari attestert. Manglende rålenke i annen nettleser gir ikke rett til å hente en ny token fra server; bruk opprinnelig nettleser eller klargjør ny tilgang bevisst.

## Brukerprøve

Samme Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Beboerportal → Klargjør invitasjon → se over kontakt/valg → Lag portaltilgang. I samme vindu: Forhåndsvis e-post. Korrekt firma, beboer, bolig og personlig portalrute. Send beboerlenke er pauset i testmiljøet.
2. Åpne eksisterende lenke via Send invitasjon på e-post eller Klargjør påminnelse. Påminnelsen skal ha samme lenke, eget emne og samme mal.
3. Endringer og beboeraksept → åpne en publisert boligavtale/endringsordre med lokalt beholdt lenke → Forhåndsvis e-post. Riktig avtaleutgave og Se gjennom avtalen. Ingen aksept ved bare å åpne mail/lenke.
4. Klikk i forhåndsvisningen, bytt fane og tilbake: samme arbeidsvindu/kladd, fersk tilgangskontroll. På mobil skal overskriften brytes og logo/header få plass.

Neste funksjonskandidat etter kontroll: egne fasader/plantegninger med stabile bolig-/rommarkører. Timeadministrasjonens fokusmønster står til egen scenario-QA. Bemanning med enkel grønn/rød inn/ut og prosjektleders sporbare korrigering senere; Excel-import sist. Ingen merge uten samlet Bolig TEST OK.

Endelig lokal verifisering: portal39, avtale67, UE/leverandør86 Chromium PASS; DB1392, residenthandler60, UE-handler56, faktisk foundation React og full critical Sandbox-build PASS. Mobilmal visuelt gjennomgått ved320px; ingen klippet lang overskrift. En test-remount ble gjort deterministisk ved å vente til reader-flaten faktisk var montert før manager gjenopprettes; ingen brukerkrav eller assertions fjernet. Sikkerhetsrådgiver samme seks kategorier. Faktisk Sandbox-readback: resident_mail0 rader,0 QA-smokerøtter, alle tre Bolig-mailbrytere AV. Forrige HEAD e5d3037 fikk CI667 SUCCESS. Ny SHA/CI/READY avleses etter publisering; ikke bruk tidligere CI som bevis for nye endringer.
