# Support – drift og aktivering

Status: app, database og transport er implementert for Preview. Faktisk e-post er
ikke aktivert eller prøvd. Ikke beskriv toveis e-post som ferdig før punktene
nedenfor er verifisert. Mottakeradressen er bevisst ikke lagret i repoet.

## Serverinnstillinger

Disse verdiene settes som Supabase Edge Function Secrets, aldri som VITE-variabler,
klientkonfigurasjon, offentlig firmaprofil eller RPC-retur til nettleseren:

| Innstilling | Bruk |
|---|---|
| `SUPPORT_INTERNAL_TO` | Kenneths avtalte interne varslingsmottaker. Ingen fallback til en adresse i kildekoden. |
| `SUPPORT_FROM_EMAIL` | Verifisert offentlig avsender. Fallback er eksisterende `CHAT_FROM_EMAIL`; aldri intern mottaker. |
| `RESEND_API_KEY` | Utgående Resend-nøkkel. Eksisterende nøkkel kan brukes med riktige rettigheter. |
| `RESEND_RECEIVING_API_KEY` | Mottakslesing; fallback til RESEND_API_KEY dersom den har nødvendig rettighet. |
| `SUPPORT_APP_URL` | Production: https://expo-proffdok.app. Sandbox: fast Preview-adresse. |
| `SUPPORT_MAIL_MODE` | `disabled` som standard. Production krever `production`. Andre prosjekter kan bare bruke `sandbox-test`. |
| `SUPPORT_TEST_TO` | Bare Sandbox. Alle utgående meldinger tvinges til denne eksplisitt avtalte prøveadressen. |
| `SUPPORT_REPLY_DOMAIN` | Kontoens ferdige mottaksdomene `ualoomorai.resend.app`, eller et separat verifisert mottaksunderdomene. |
| `SUPPORT_INBOUND_ENABLED` | `true` først etter kontrollert MX/webhook-oppsett og avtalt mottaksprøve. |
| `SUPPORT_WEBHOOK_SECRET` | Resends separate signeringshemmelighet for akkurat dette miljøets mottakswebhook. |
| `SUPPORT_WORKER_SECRET` | Valgfri alternativ arbeiderhemmelighet. La den være usatt når den medfølgende Vault-/cron-jobben brukes. En eksplisitt verdi overstyrer Vault og skal ikke blandes med cron-oppsettet. |

Ikke bruk Kenneths private mottaker som From/Reply-To. Arbeideren stanser ved en
slik feilkonfigurasjon. Svaradresser inneholder 128-bit tilfeldig sakstoken, som
aldri returneres til nettleseren. Sandbox krever egen mottaksruting og lar bare
prøveadressen sende inn e-post. Production-modus på Sandbox hard-feiler.

## Resend og DNS

1. Kontroller eksisterende From-domene i Resend. Bruk avsendernavn ProffDok Support.
2. Kontoens ferdige mottaksdomene `ualoomorai.resend.app` er kontrollert i Emails →
   Receiving. Det krever ingen DNS-endring. Et eget profilert mottaksunderdomene
   kan eventuelt erstatte dette senere med de eksakte MX-postene Resend oppgir.
   Ikke endre MX for eksisterende Ringside-/andre postbokser.
3. Opprett miljøspesifikk `email.received`-webhook til
   `https://<prosjekt>.supabase.co/functions/v1/support-inbound`.
4. Sett hemmeligheter direkte i tjenesten. Ikke lim nøkler inn i chatten.
5. Avtal én faktisk prøve med eierens verifiserte adresse: opprett sak, send
   Systemadmin-svar, motta i innboks, svar fra e-post og se samme svar i saken.
   Prøv også provider-feil, retry, ugyldig signatur og webhook-redelivery.
6. Kontroller faktiske Message-ID/References, tråding, avsender, Reply-To, logo,
   tekstversjon og lenken Åpne supportsak. Provider-aksept er ikke mottaksbevis.

Innkommende kontroller bruker Resends beregnede autentisering, ikke e-postens
selvrapporterte Authentication-Results. DMARC pass eller gray med passert SPF/DKIM
kreves, i tillegg til kjent token og eierens nåværende verifiserte avsenderadresse.
Ingen ny supportsak opprettes fra ukjent e-post. Ukjent/forfalsket avsender og
autosvar ignoreres uten å sende en e-post tilbake. Signaturvindu er fem minutter.
Provider-ID og Message-ID dedupliseres atomisk. HTML omgjøres til ren tekst; ingen
innkommende HTML, fjernbilder eller vedlegg rendres/lastes ned. Maks 12 000 tegn i
ny melding. Vedlegg er uttrykkelig ikke med i første versjon.

### Eksisterende konto kontrollert 16.10

Kenneths vanlige e-post-/passordinnlogging åpner den eksisterende kontoen, team
`ringside`. Faktiske ProffDok-invitasjoner fra 15.10 har providerstatus delivered
og From `Expo ProffDok <noreply@expoproffsenter.no>`. Domenet `expoproffsenter.no`
er verified, sending er aktivert og mottak på hoveddomenet er avslått. Den
tidligere tomme GitHub-kontoen skal ikke brukes. Innloggingsadresse og intern
supportmottaker lagres ikke i repoet.

De to eksisterende nøklene har bare Sending access; den brukte nøkkelens siste
logg peker på den kontrollerte ProffDok-invitasjonen. Eksisterende nøkkel skal
beholdes. Resends Receiving API trenger Full access. En separat mottaksnøkkel
krever derfor godkjenning av den bredere tilgangen før oppretting; nøkkelverdien
skal bare lagres server-side.

17.10 kl. 00:03 Europe/Oslo godkjente Kenneth denne separate nøkkelen. Den er
opprettet som `ProffDok Support Inbound – Production` og lagret kun som
`RESEND_RECEIVING_API_KEY` i Production-prosjektets Edge Function Secrets.
Lagret SHA256 matcher den opprettede verdien. Ingen nøkkelverdi er skrevet til
chat, repo eller klient; midlertidig overføringskopi og utklippstavle er tømt.
De to eksisterende Sending access-nøklene, RESEND_API_KEY og CHAT_FROM_EMAIL er
beholdt. Dette er eneste Production-konfigurasjonsendring og er ikke en
releasegodkjenning. Supportens Production-funksjoner/migrasjoner er ikke deployet,
og ingen supportmail er sendt. Webhook/scheduler og faktisk prøve gjenstår.

## Kø og retry

Sak/melding og outbox opprettes i samme transaksjon. Nettleseren forsøker varsling
etter bekreftet lagring. Migrasjonen `20261016221008_support_scheduler.sql`
installerer den separate cron-jobben `support-queue-worker` hvert femte minutt.
Den kaller kun `support_private.dispatch_queue()`. Innstillingen `enabled=false`
og tom endpoint gjør at jobben ikke sender noen HTTP-forespørsel etter installasjon.
Eksisterende cron-jobber endres ikke. Token genereres i Vault og ligger aldri i
cron-tekst, klient eller repo. Bare service_role kan validere det gjennom RPC;
avslag/konfigurasjonsfeil stanser før kølesing.

Etter godkjent Preview/TEST OK og kontroll av miljøets kø: sett riktig prosjekt-URL
som endpoint i den private worker_settings-raden, og sett enabled=true først når
Edge-konfigurasjon, mottakeromfang og transport er kontrollert. La
SUPPORT_WORKER_SECRET være usatt for dette Vault-oppsettet. Deaktivering skjer
med enabled=false; da stopper både HTTP-dispatch og tokenvalidering umiddelbart.
Jobben er installert bare i Sandbox og er fortsatt avslått. Ingen scheduler er
installert i Production. Ikke bruk ChatGPT Automations som appens driftsarbeider.

Arbeideren tar maksimalt fem meldinger, har 45-sekunders lease, fem minutters
ventetid og inntil seks automatiske forsøk. Stabil Resend-idempotensnøkkel bevares.
Ukjent sendestatus eldre enn 23 timer går til manuell kontroll for å unngå ny
utsending etter leverandørens idempotensvindu. Systemadmin skal da kontrollere
Resend-loggen; opprett ikke blindt en ny melding. Aksepterte meldinger sendes ikke
på nytt. Tilbakekalt brukertilgang/firmamedlemskap stanser ventende utsending.
Fem sekvensielle leverandørkall på maksimalt 20 sekunder passer innenfor cron-
forespørselens 120-sekunders frist. Resterende jobber ligger varig til neste runde.

Statuser: pending (lagret/venter), sending (lease), accepted (provider-aksept),
failed (avvist/ikke tilgang), uncertain (ukjent), review (manuell kontroll).
Sendestatus i UI viser ikke intern mottaker, leverandørens rå feilmelding,
sakstoken eller provider-ID. Lagring og mottak er tydelig separate.

## Release og bevaring

Bruk Sandbox for Preview. Production-migrasjon og nye funksjoner først etter
relevant Preview, grønn Core Safety og ny TEST OK. main → demo følger deretter
vanlig preflight med bevart overlay. Ingen gamle arbeidere, rutine-e-postsperre,
nav/recovery, HR, garantikrav eller salgsflyt endres av supportleveransen.

Migrasjonsfilenes versjoner er avstemt med faktisk Sandbox-historikk etter
Supabase MCP apply_migration. Første versjon ble opprettet med CLI migration new;
filnavnet ble deretter justert til den versjonen tjenesten registrerte.

Kilder kontrollert 16.10.2026: Supabase changelog og database/functions;
Resend send-email, retrieve-received-email (inkludert authentication og
html_format=cid), receiving/reply-to-emails og webhooks/verify-webhooks-requests.
