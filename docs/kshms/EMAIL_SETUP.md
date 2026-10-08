# Ansvarlig-e-post – oppsett som gjenstår

Sandbox ppvircenkjizeiqdxphj har kshms-assignment-mailer v4, deduplisert kø, privat cron og tilgangskontroll. Kontrollert 8. oktober kl. 21:27 Europe/Oslo: autentisert check-mode (request 4) svarte HTTP503: transport_safe=true, api_key_configured=false, sender_configured=false. enabled=false. Ingen ekte e-post er sendt.

1. En autorisert administrator setter **RESEND_API_KEY** og **CHAT_FROM_EMAIL** som Edge Function Secrets i Sandbox, via egen innlogging i Supabase eller autentisert CLI. Bruk godkjent Resend-konto og verifisert avsenderdomene. Ingen hemmelighet skal i chat, kode eller dokumentasjon. En onboarding-avsender er ikke valgt som reserve.
2. Hold net utenfor eksponerte Data API-skjemaer. SQL-login gis bare til betrodde tjenester. pg_net er plattformeid; REVOKE-forsøket endret ikke grants. Worker kontrollerer faktisk schema-avslag før mailbehandling, og stopper ved uventet/feilet svar.
3. Kjør autentisert check-mode mens private email_worker_settings.enabled fortsatt er false. Token hentes internt fra Vault; aldri skriv det ut. Krev HTTP200/configured=true og alle tre sikkerhets-/konfigurasjonsbooler true. Check reserverer ingen oppgave og sender ingen mail. Aktiver enabled først etter godkjent kontroll og gjennomgått kø/mottaker. Behold disabled ved feil.
4. Kontroller kø/mottaker før sending. Kjør avtalt Trond → Eli-prøve: én mottatt e-post, beskyttet case-lenke, korrekt firma/rolle og ingen duplikat ved retry. Lukking/omfordeling/revokering skal undertrykke gammel oppgave.

Endpoint og app-origin er allerede satt til Sandbox-funksjonen og den faste feature-Preview-en. Production er ikke konfigurert/migrert. Appvarslene virker uavhengig av dette oppsettet.

Arbeideren autentiserer eget 256-bit Vault-token gjennom service-only RPC før reservasjon. Forsøksnummer fencer validate/finish; stabil Resend-idempotens/body gir retry uten ny oppgave. Ti forsøk/23 timers første-forsøksvindu ender i failed. E-post har bare oppgavetype/nødvendig handling og firma-/dokument-ID i beskyttet lenke, aldri sakstittel, hendelse, tiltak, bilder eller personlige notater. Grant/aktivitet/ansvar/status/mottaker sjekkes før levering. Manglende oppsett bruker ingen leveringsforsøk. Fristpåminnelser er fortsatt senere trinn.


V4 omfatter Avvik/RUH, vernerunde/kontroll, risikovurdering, valgt SJA-prosjektleder, rutineutgaver som krever egen gjennomgang til hver tildelt medarbeider, og forfalt håndbokrevisjon til utpekt ansvarlig. Køen har én post per tildeling/generasjon og egen post per medarbeider/utgave. Vanlige lagringer og appens visninger sender ingen nye varsler. Fullføring, signering, egen bekreftelse, ny revisjonsdato, ny ansvarlig eller inaktiv tilgang stopper gamle usendte oppgaver. Endret leveringsadresse etter første forsøk undertrykkes for å beholde stabilt idempotent innhold. Lenker gir ingen nye rettigheter.

[Sandbox Edge Function Secrets](https://supabase.com/dashboard/project/ppvircenkjizeiqdxphj/functions/secrets). Sett RESEND_API_KEY og CHAT_FROM_EMAIL der; ikke del verdiene i chatten. Etter oppsett kontrolleres check-mode og aktivering gjennom eksisterende private arbeider. Nåværende kø: 40 uferdige rutinetildelinger og 8 tidligere avvikstildelinger. Inaktivt ansvar/ugyldige adresser filtreres før levering. Ingen reell leverings-/innboks-PASS er hevdet.
