# E-postsvar og bevaring av tråd – 17.10.2026

Miljømål: BEGGE. Baseline main 14ce2bcebb9f380bbef1b0cbb19a6f49a501dd87.
Scope: én ny supportmigrasjon, eksisterende support-db-check, relevant Hjelp og
release-/driftsdokumentasjon. Ingen navigasjon, recovery, tidsføring, roller,
innholdstilgang, andre e-postarbeidere eller gamle migrasjoner endres.

## Faktisk Production-prøve og tilbakeføring

Kenneth godkjente utsending til sin verifiserte adresse og svarte selv fra den.
Resend leverte brukersvaret kl.01:53 Oslo og mottok svaret kl.01:55. Signert
email.received-webhook gav 200 OK. Eierens autentiserte support_get returnerte
samme svar i samme sak. Ett internt varsel ble akseptert av Resend. Mottaks-
hendelsen ble gjentatt med Resends Replay; etter to forsøk med 200 OK var det
fortsatt én source=email-melding, én inbound_event og samme antall køforsøk.
Ingen innkommende vedlegg ble lastet ned eller rendret. Faktiske linjeskift
ble bevart. Intern mottaker og hemmeligheter er bare serverinnstillinger.

Begge midlertidige testinnganger er tilbakeført byteidentisk til godkjent kode
(support-mail v7, support-inbound v5). Bare den identifiserte testsaken og dens
tre meldinger, tre køoppføringer og ene dedupliseringshendelse ble slettet etter
kontroll av uendret omfang. Ingen annen sak ble berørt; køen er tom. Saksnummer-
telleren er ikke tilbakestilt. Webhooken er deaktivert; global mail-modus,
inbound-flagg og scheduler er AV, endpoint er tom. Opprinnelige nøkler og DNS/MX
er uendret. Mottaksdomene og signeringshemmelighet er beholdt kun på serveren.

## Påvist feil og rettelse

support_mail_finish skrev varselets Message-ID over den mottatte meldingens ID.
Svaret var lagret og lesbart, men et senere svar kunne referere til varselet
framfor brukerens originale e-post. Det samme gjaldt interne opprettelsesvarsler.

Migrasjonen support_preserve_inbound_message_id beholder opprinnelig lease- og
sendestatuslogikk, men skriver samtalens utgående ID bare for appens offentlige
support-svar med user-audience. Innkommende ID og interne aktivitetsvarsler
beholdes adskilt. Ingen eksisterende varige brukerdata trenger historisk
retting: kun den isolerte testsaken hadde mottatt e-post og den er ryddet.

## Verifikasjon og neste gate

Ny PostgreSQL-scenarioprøve feilet mot original kode fordi mottatt ID ble
overskrevet. Med ny migrasjon: 116 assertions PASS (tidligere 109 beholdt),
inkludert feil lease, original mottaks-ID etter intern varsling, neste offentlige
svars References, ingen intern varslings-ID i tråden og engangslagring av utgående
offentlig ID. Eksisterende transport-/HMAC-/mottakskontroller: 55 PASS.

Ny migrasjon er installert bare i Sandbox som 20261017000117. En faktisk
Sandbox-rolleprøve bekrefter original mottaks-ID, korrekte References og offentlig
utgående ID; alt testinnhold ble rullet tilbake uten HTTP. Funksjonens ACL er
fortsatt service_role-only. Full Sandbox critical/build PASS. Production-funksjon
og mail-aktivering venter på grønn Core Safety, fast Preview og Kenneths nye
TEST OK for rettelsen. Deretter: Production-migrasjon/verifisering, kontrollert
main → demo og separat kontrollert aktivering med tom kø. Påstå ikke at vanlig
Production-utsending er aktivert før dette faktisk er gjort.
