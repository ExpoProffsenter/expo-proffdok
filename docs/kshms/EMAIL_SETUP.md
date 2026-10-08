# Ansvarlig-e-post – eksisterende Resend gjenbrukes

## Gjeldende avklaring 8. oktober 2026

Kenneth har avklart at Sandbox/Preview skal brukes uten reell e-postutsending, og at eksisterende Resend i Production kan gjenbrukes. Det er ikke et krav å opprette Resend-hemmeligheter i Sandbox. Tidligere instruks om å aktivere Sandbox-utsending er erstattet av dette notatet.

Lesende kontroll i denne runden bekrefter:

- Production `dqffxflaoyarbxyiyhop` har `smart-worker` v18 ACTIVE. Den bruker `RESEND_API_KEY` og `CHAT_FROM_EMAIL` for Resend. KS/HMS-arbeiderens eksisterende kilde bruker nøyaktig de samme prosjekthemmelighetene. Ingen ny e-posttjeneste eller kopiering av produksjonsnøkkel til Sandbox kreves.
- Sandbox `ppvircenkjizeiqdxphj` har også `smart-worker` v18 ACTIVE og KS/HMS-arbeider v4. Det beviser installert kode, ikke fungerende nøkkel eller tidligere levering. Kenneth opplyser at e-post har vært testet i Sandbox tidligere; metoden er ikke gjenfunnet. Ikke konkluder med at Sandbox aldri har sendt e-post.
- KS/HMS `kshms_private.email_worker_settings.enabled=false` er lest direkte i Sandbox. Tidligere autentisert check kl. 21:27 viste `transport_safe=true`, men manglende nøkkel/avsender. Dette er forventet når reell utsending ikke brukes der.
- KS/HMS sin permanente critical-test bruker simulert Resend-svar (`provider-stub`). Den kontrollerer seks meldingstyper, beskyttede lenker, minimalt innhold, avslått worker, konfigurasjonsfeil og idempotens. Den beviser ikke mottak i innboks.

## Før senere godkjent Production-release

1. Fullfør relevant Preview-QA og innhent eksplisitt Production-godkjenning for PR #216. Denne runden autoriserer ingen merge, Production-DDL, deploy eller ekte sending.
2. Følg migrasjonene i korrekt rekkefølge og deploy KS/HMS-arbeideren med utsending fortsatt avslått. Production har foreløpig ingen KS/HMS-arbeider.
3. Gjenbruk prosjektets eksisterende `RESEND_API_KEY` og `CHAT_FROM_EMAIL`. Bekreft konfigurasjonen gjennom autentisert check-mode uten sending. Dersom avsender mangler, må godkjent eksisterende avsender konfigureres sikkert; ikke bruk onboarding-avsender som reserve. Ingen hemmeligheter skal i chat, kildekode eller dokumentasjon.
4. Sett Production-endepunkt og app-origin `https://expo-proffdok.app`; Sandbox Preview-lenker eller testkø skal ikke overføres. Kontroller kø og avtalte mottakere før aktivering.
5. Test konkret godkjent tildeling/mottak, beskyttet lenke og retry uten duplikat. Fullføring, omfordeling og revokert tilgang skal stoppe gamle usendte oppgaver. Provider-aksept er ikke bevis på mottak i innboks.

Sandbox holdes `enabled=false`; appvarsler virker uavhengig av transporten. `smart-worker` og dens eksisterende payloadkontrakt endres ikke. KS/HMS bruker egen autentisert køarbeider for deduplisering og mottaker-/tilgangskontroll, med samme Resend-oppsett.

Arbeideren autentiserer eget 256-bit Vault-token via service-only RPC. Forsøksnummer fencer validate/finish; stabil Resend-idempotens/body gir retry uten ny oppgave. Manglende konfigurasjon bruker ingen leveringsforsøk. E-post inneholder bare type, nødvendig handling og beskyttet dokumentlenke. Seks typer er Avvik/RUH, vernerunde/kontroll, risiko, SJA, pliktig rutinegjennomgang og forfalt håndbokrevisjon. Fristpåminnelser er senere arbeid.

Transportkontrollen skal fortsatt bekrefte at `net` ikke er et eksponert Data API-skjema. Check-mode henter token internt fra Vault og krever HTTP200/configured=true og transport_safe/api_key_configured/sender_configured=true uten å reservere oppgave. Behold disabled ved feil. Eksisterende ti-forsøksgrense og 23-timers retryvindu består. Endret leveringsadresse etter første forsøk undertrykkes for stabil idempotens.
