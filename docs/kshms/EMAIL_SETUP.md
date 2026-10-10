# Ansvarlig-e-post – eksisterende Resend gjenbrukes

## Gjeldende status 10. oktober 2026

Kenneth har nå godkjent Production-release og main → demo. Production har alle 54 migrasjoner og `kshms-assignment-mailer` v1 ACTIVE. Autentisert check-mode ga HTTP 200 med alle fire konfigurasjonsflagg sanne. Eksisterende Resend-hemmeligheter er brukt server-side. Production-transport er aktivert etter kontroll av tom kø, med origin `https://expo-proffdok.app`; ingen test-/Sandbox-kø er kopiert. Én autorisert systemadmin-testmail til `kenneth@ringside.no` er sendt, og mottak er dokumentert med Kenneths vedlagte skjermbilde. Dette verifiserer ikke KS/HMS-tildelingsarbeiderens fullstendige flyt. Se [releasekontrollen](RELEASE_20261010.md).

Sandbox holdes fortsatt `enabled=false`. Historiske godkjenningsnotater nedenfor beskriver situasjonen før brukerens «Kjør».

## Faktisk testmail, 10. oktober ca. 21:08 Europe/Oslo

Én tidligere autorisert test til `kenneth@ringside.no` ble sendt **én gang** 10. oktober ca. 21:08 Europe/Oslo i den eksisterende innloggede Production-flyten **Systemadmin → Send e-post til brukere → 1. Kontroller mottakere → 2. Send test**. Kenneth meldte «innlogget» før handlingen; synlig økt viste riktig konto. Emne: «Expo ProffDok – avtalt test av e-post 10.10.2026». Meldingen inneholdt bare ufølsom testtekst.

Appen bekreftet **«Test er sendt kun til kenneth@ringside.no.»** Mottakerpreview viste 37 kvalifiserte brukere, men **3. Send til mottakergruppen ble ikke klikket**. Ingen masseutsending eller nytt sendeforsøk. Etter skjermbevis gikk fanen tilbake til Startside. Den ene sendeautorisasjonen er brukt.

[Originalt skjermbevis](evidence/TESTMAIL_SENT_20261010.jpg). Dette er faktisk innlogget appbekreftelse for `systemadmin-broadcast-email` sin testhandling. **Mottak er dokumentert med Kenneths vedlagte skjermbilde** av den åpnete e-posten med eksakt `[TEST]`-emne, testmerke og melding; [originalt mottaksbevis](evidence/TESTMAIL_RECEIVED_20261010.png). Bildet kom i denne samtalen ca. 21:13 Europe/Oslo. Dette beviser ikke KS/HMS-tildelingskøens fullstendige leverings-/lenke-/retryflyt eller at e-postlenken er åpnet. Ingen credentials, JWT, cookies eller intern auth-state ble lest; ingen SQL/service-role-omgåelse av innlogging.

## Status 9. oktober 2026 (historisk)

Sandbox KS/HMS-worker er v7 ACTIVE, med tildeling og påminnelse for alle seks typer. Transport er fortsatt direkte kontrollert **enabled=false**; appoppgavene virker. Provider-stub dekker de tolv type/fase-kombinasjonene, ikke mottak i innboks. Ekte levering er et krav ved senere godkjent Production-release. Én separat kontrollert test til Kenneths valgte adresse er autorisert, men ikke sendt; den krever fungerende innlogget adminøkt. Den skal ikke dupliseres eller brukes som generell aktivering.

[Sluttkontroll](BC_CLOSEOUT_20261009.md) målte 48 eksisterende pending assignment-poster i Sandbox. Før aktivering må gammelt køinnhold og mottakeromfang kontrolleres; Sandbox-kø kopieres ikke til Production. Nåværende funksjoner stanser gamle usendte oppgaver ved fullføring, omfordeling eller revokering og gjenkontrollerer tilgang før levering.

## Avklaring og kontroll 8. oktober 2026 (historisk)

Kenneth har avklart at Sandbox/Preview skal brukes uten reell e-postutsending, og at eksisterende Resend i Production kan gjenbrukes. Det er ikke et krav å opprette Resend-hemmeligheter i Sandbox. Tidligere instruks om å aktivere Sandbox-utsending er erstattet av dette notatet.

Lesende kontroll i denne runden bekrefter:

- Production `dqffxflaoyarbxyiyhop` har `smart-worker` v18 ACTIVE. Den bruker `RESEND_API_KEY` og `CHAT_FROM_EMAIL` for Resend. KS/HMS-arbeiderens eksisterende kilde bruker nøyaktig de samme prosjekthemmelighetene. Ingen ny e-posttjeneste eller kopiering av produksjonsnøkkel til Sandbox kreves.
- Sandbox `ppvircenkjizeiqdxphj` har også `smart-worker` v18 ACTIVE og KS/HMS-arbeider v4. Det beviser installert kode, ikke fungerende nøkkel eller tidligere levering. Kenneth opplyser at e-post har vært testet i Sandbox tidligere; metoden er ikke gjenfunnet. Ikke konkluder med at Sandbox aldri har sendt e-post.
- KS/HMS `kshms_private.email_worker_settings.enabled=false` er lest direkte i Sandbox. Tidligere autentisert check kl. 21:27 viste `transport_safe=true`, men manglende nøkkel/avsender. Dette er forventet når reell utsending ikke brukes der.
- KS/HMS sin permanente critical-test bruker simulert Resend-svar (`provider-stub`). Den kontrollerer seks meldingstyper, beskyttede lenker, minimalt innhold, avslått worker, konfigurasjonsfeil og idempotens. Den beviser ikke mottak i innboks.

## Plan før godkjenningen 10. oktober (historisk)

1. Fullfør relevant Preview-QA og innhent eksplisitt Production-godkjenning for PR #216. Ingen merge, Production-DDL, deploy eller generell sending er autorisert nå. Den ene allerede autoriserte admin-testmailen er et separat punkt.
2. Følg migrasjonene i korrekt rekkefølge og deploy KS/HMS-arbeideren med utsending fortsatt avslått. Production har foreløpig ingen KS/HMS-arbeider.
3. Gjenbruk prosjektets eksisterende `RESEND_API_KEY` og `CHAT_FROM_EMAIL`. Bekreft konfigurasjonen gjennom autentisert check-mode uten sending. Dersom avsender mangler, må godkjent eksisterende avsender konfigureres sikkert; ikke bruk onboarding-avsender som reserve. Ingen hemmeligheter skal i chat, kildekode eller dokumentasjon.
4. Sett Production-endepunkt og app-origin `https://expo-proffdok.app`; Sandbox Preview-lenker eller testkø skal ikke overføres. Kontroller kø og avtalte mottakere før aktivering.
5. Aktiver Production-transport kontrollert for avklart mottakeromfang. Test konkret godkjent tildeling/mottak, beskyttet lenke og retry uten duplikat. Fullføring, omfordeling og revokert tilgang skal stoppe gamle usendte oppgaver. Provider-aksept er ikke bevis på mottak i innboks.

Sandbox holdes `enabled=false`; appvarsler virker uavhengig av transporten. `smart-worker` og dens eksisterende payloadkontrakt endres ikke. KS/HMS bruker egen autentisert køarbeider for deduplisering og mottaker-/tilgangskontroll, med samme Resend-oppsett.

Arbeideren autentiserer eget 256-bit Vault-token via service-only RPC. Forsøksnummer fencer validate/finish; stabil Resend-idempotens/body gir retry uten ny oppgave. Manglende konfigurasjon bruker ingen leveringsforsøk. E-post inneholder bare type, nødvendig handling og beskyttet dokumentlenke. Seks typer er Avvik/RUH, vernerunde/kontroll, risiko, SJA, pliktig rutinegjennomgang og forfalt håndbokrevisjon. Fristpåminnelser og oppfølging for alle seks typer ble levert 9. oktober; se gjeldende status øverst.

Transportkontrollen skal fortsatt bekrefte at `net` ikke er et eksponert Data API-skjema. Check-mode henter token internt fra Vault og krever HTTP200/configured=true og transport_safe/api_key_configured/sender_configured=true uten å reservere oppgave. Behold disabled ved feil. Eksisterende ti-forsøksgrense og 23-timers retryvindu består. Endret leveringsadresse etter første forsøk undertrykkes for stabil idempotens.
