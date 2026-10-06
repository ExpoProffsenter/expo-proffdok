# Ansvarlig-e-post – oppsett som gjenstår

Sandbox ppvircenkjizeiqdxphj har kshms-assignment-mailer v3, deduplisert kø, privat cron og tilgangskontroll. Health svarte HTTP503: transport_safe=true, api_key_configured=false, sender_configured=false. enabled=false. Ingen ekte e-post er sendt.

1. En autorisert administrator setter **RESEND_API_KEY** og **CHAT_FROM_EMAIL** som Edge Function Secrets i Sandbox, via egen innlogging i Supabase eller autentisert CLI. Bruk godkjent Resend-konto og verifisert avsenderdomene. Ingen hemmelighet skal i chat, kode eller dokumentasjon. En onboarding-avsender er ikke valgt som reserve.
2. Hold net utenfor eksponerte Data API-skjemaer. SQL-login gis bare til betrodde tjenester. pg_net er plattformeid; REVOKE-forsøket endret ikke grants. Worker kontrollerer faktisk schema-avslag før mailbehandling, og stopper ved uventet/feilet svar.
3. Aktiver private email_worker_settings.enabled i Sandbox og kjør autentisert check-mode. Token hentes internt fra Vault; aldri skriv det ut. Krev HTTP200/configured=true og alle tre sikkerhets-/konfigurasjonsbooler true. Check reserverer ingen oppgave og sender ingen mail. Deaktiver ved feil.
4. Kontroller kø/mottaker før sending. Kjør avtalt Trond → Eli-prøve: én mottatt e-post, beskyttet case-lenke, korrekt firma/rolle og ingen duplikat ved retry. Lukking/omfordeling/revokering skal undertrykke gammel oppgave.

Endpoint og app-origin er allerede satt til Sandbox-funksjonen og den faste feature-Preview-en. Production er ikke konfigurert/migrert. Appvarslene virker uavhengig av dette oppsettet.

Arbeideren autentiserer eget 256-bit Vault-token gjennom service-only RPC før reservasjon. Forsøksnummer fencer validate/finish; stabil Resend-idempotens/body gir retry uten ny oppgave. Ti forsøk/23 timers første-forsøksvindu ender i failed. E-post har bare oppgavetype/nødvendig handling og firma-/sak-ID i beskyttet lenke, aldri sakstittel, hendelse, tiltak, bilder eller personlige notater. Grant/aktivitet/ansvar/status/mottaker sjekkes før levering. Manglende oppsett bruker ingen leveringsforsøk. Fristpåminnelser er fortsatt senere trinn.
