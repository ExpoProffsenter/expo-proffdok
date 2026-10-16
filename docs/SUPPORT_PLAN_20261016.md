# Support – avtalt plan 16. oktober 2026

Statusoppdatering: Implementert i separat Preview-leveranse etter publisert PR #262.
App/database/transport er skrevet og Sandbox er migrert. Faktisk toveis e-post
er ikke aktivert eller prøvd; serverhemmeligheter, Resend-/DNS-oppsett og egen
scheduler gjenstår. Se SUPPORT_OPERATIONS_20261016.md og qa/SUPPORT_20261016.md.
Planen nedenfor beskriver fortsatt kontrakten.

Kontrollert senere 16.10: eksisterende konto er gjenfunnet med Kenneths vanlige
innlogging. Avsenderdomenet er `expoproffsenter.no`, og kontoens ferdige
`ualoomorai.resend.app` kan brukes til svarmottak uten DNS-endring. Eksisterende
Sending access beholdes; separat Receiving API-tilgang, signert webhook og
faktisk prøve gjenstår. Ingen nøkkelverdier eller intern mottaker lagres her.
Oppfølging 17.10: Kenneth har godkjent separat mottaksnøkkel med Full access;
den er opprettet og lagret i Production Secrets som RESEND_RECEIVING_API_KEY.
Eksisterende sendetilgang er beholdt. Webhook, køjobb, faktisk prøve og TEST OK
gjenstår; nøkkelgodkjenningen aktiverer ikke support i Production.
Køjobben er deretter implementert med privat Vault-token og separat */5-cron.
Den er installert avslått bare i Sandbox, med 86 SQL- og 55 transportkontroller.
Production-aktivering og faktisk e-postprøve krever fortsatt egen godkjenning.

Opprinnelig planstatus: Planlagt som egen leveranse etter pågående UX-runde. Ingen supportkode,
SQL, mottaksadresse, DNS eller e-postutsending er endret i UX-runden.
Miljømål ved implementering: BEGGE, med Preview og ny TEST OK før produksjon.

## Brukerens avklarte valg

- Første versjon er for innloggede brukere, ikke offentlig skjema ved innlogging.
- Dialogen skal kunne føres både i appen og ved å svare direkte på e-post.
- Henvendelser skal varsles til Kenneths oppgitte Ringside-adresse. Den skal bare
  konfigureres på serversiden og ikke vises i skjema, klientkode, API-svar,
  avsenderadresse eller Reply-To i e-post til sluttbruker.
- Systemadmin skal ha en egen Support-oversikt og Svar-funksjon.
- Svar til brukeren skal ha ProffDok-layout.

## Foreslått brukerflyt

1. Hjelp → Kontakt support. Vis kompakt skjema: emne, kategori og beskrivelse.
   Innlogget avsender og aktivt firma følger saken automatisk fra autorisert
   serverkontekst. Skjermbilde kan være valgfritt dersom vedlegg inngår i scope.
2. Send henvendelse oppretter en varig supportsak før e-post varsles. Brukeren
   får saksnummer og kan se egne saker med status Ny, Under behandling og Løst.
3. Systemadmin → Support viser innboks med uleste saker, status og ansvarlig.
   Inne i saken: historikk, Svar, intern merknad (aldri kundesynlig), løs/gjenåpne.
   Firmaadmin får ikke automatisk tilgang til andre ansattes private supportsaker.
4. Svar lagres først. Deretter sendes én e-post med ProffDok-logo, saksnummer,
   svartekst, tydelig Åpne supportsak-knapp og enkel tekstversjon.
5. Brukerens svar i appen og svar på e-post havner i samme sak. UI må tydelig
   skille lagret svar, ventende utsending, provider-aksept og eventuell feil.

## Avsender og svaradresse

Eksisterende kode bruker Resend, serverinnstillingen CHAT_FROM_EMAIL og flere
modulspesifikke e-postarbeidere. supplier-order-email.mjs bruker allerede
reply_to; det er teknisk støtte i eksisterende leverandørintegrasjon.
Det beviser ikke at en bestemt supportadresse eller mottaksdomene er konfigurert.

Anbefaling: visningsnavn «ProffDok Support». Egen dedikert supportadresse på et
kontrollert domene er best når toveis dialog etableres. Eksisterende noreply kan
fortsatt brukes som From dersom en fungerende supportadresse settes som Reply-To.
Kenneths personlige mottakeradresse skal ikke brukes som Reply-To. Den brukes
kun til interne varsler. Brukeren skal alltid kunne åpne og svare i appen.

Direkte e-postsvar krever eget mottaksoppsett: verifisert mottaksdomene/underdomene,
MX, signert webhook, sikker mapping til sak og lagring av Message-ID/References.
Underdomene foretrekkes for å unngå å endre ruting for eksisterende postbokser.
Ikke lov direkte e-postsvar før dette er konfigurert og mottak er prøvd.
Ingen automatisk AI-besvarelse er avtalt; Systemadmin skriver og sender svar.

## Leveranse og kontroll

- Ny avgrenset PR: skjema, egne saker, Systemadmin-innboks/svar, e-postmal og
  separat innkommende e-postintegrasjon. UI og datamodell kan utarbeides først;
  toveis e-post ferdigstilles før funksjonen beskrives som komplett.
- Kontroller nåværende roller, eksisterende e-postmaler/branding og innstillinger.
  Tilgang kontrolleres ved lesing, svar, vedlegg og utsending. Minst mulig
  data i interne e-postvarsler; lenke til den tilgangsstyrte supportsaken.
- Webhook må signaturkontrolleres, duplikater håndteres og ukjent/forfalsket
  avsender skal ikke få tilgang til saksinnhold. Ikke stol på emne/saksnummer
  alene. Beskytt mot autosvarsløyfer, dupliserte sendinger og kryssfirmatilgang.
- Ingen nye støttetimer eller svartidsløfter uten Kenneths valg.
- Test ny sak, faktisk korrekt servermottaker uten adresselekkasje, brukerens
  egen historikk, Systemadmin-svar, utsendingsfeil/retry uten duplikater,
  gyldig/ugyldig innkommende svar og isolasjon mellom firmaer/brukere.
- Sandbox må ha isolert utsending/mottak. Faktisk e-postmottak prøves som en
  eksplisitt avtalt prøve; ingen e-post sendes automatisk under utviklings-QA.
- Kontroller berørte gamle brukerreiser, grønn Core Safety, samme faste Preview,
  TEST OK, produksjonsverifisering og main → demo med grønn preflight.

Kilder kontrollert 16.10.2026:
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/receiving/reply-to-emails
- https://github.com/resend/resend-skills/blob/main/skills/resend/references/receiving.md
