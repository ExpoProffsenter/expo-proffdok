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
| `SUPPORT_REPLY_DOMAIN` | Verifisert dedikert mottaksunderdomene, for eksempel et support-underdomene på kontrollert domene. |
| `SUPPORT_INBOUND_ENABLED` | `true` først etter kontrollert MX/webhook-oppsett og avtalt mottaksprøve. |
| `SUPPORT_WEBHOOK_SECRET` | Resends separate signeringshemmelighet for akkurat dette miljøets mottakswebhook. |
| `SUPPORT_WORKER_SECRET` | Separat tilfeldig hemmelighet, minst 32 tegn, for køarbeideren. |

Ikke bruk Kenneths private mottaker som From/Reply-To. Arbeideren stanser ved en
slik feilkonfigurasjon. Svaradresser inneholder 128-bit tilfeldig sakstoken, som
aldri returneres til nettleseren. Sandbox krever egen mottaksruting og lar bare
prøveadressen sende inn e-post. Production-modus på Sandbox hard-feiler.

## Resend og DNS

1. Kontroller eksisterende From-domene i Resend. Bruk avsendernavn ProffDok Support.
2. Legg til eget mottaksunderdomene og de eksakte MX-postene Resend oppgir.
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

## Kø og retry

Sak/melding og outbox opprettes i samme transaksjon. Nettleseren forsøker varsling
etter bekreftet lagring. For autonom oppfølging av en avbrutt nettleserforespørsel,
registrer en egen serverjobb hvert femte minutt som gjør POST til `support-mail`
med header `x-support-worker-token` fra en sikker serverhemmelighet. Bruk separat
jobb per miljø. Ingen scheduler er aktivert av migrasjonene i denne leveransen.
Ikke bruk ChatGPT Automations som appens driftsarbeider.

Arbeideren tar maksimalt ti meldinger, har 45-sekunders lease, fem minutters
ventetid og inntil seks automatiske forsøk. Stabil Resend-idempotensnøkkel bevares.
Ukjent sendestatus eldre enn 23 timer går til manuell kontroll for å unngå ny
utsending etter leverandørens idempotensvindu. Systemadmin skal da kontrollere
Resend-loggen; opprett ikke blindt en ny melding. Aksepterte meldinger sendes ikke
på nytt. Tilbakekalt brukertilgang/firmamedlemskap stanser ventende utsending.

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
