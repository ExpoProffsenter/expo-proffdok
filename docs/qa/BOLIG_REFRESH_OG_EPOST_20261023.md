# UE-vindu, innlasting og e-postkart – 23. oktober 2026

Miljømål **BEGGE**, først eksisterende feature-Preview/Sandbox i PR278. Start c45047b12040c82838f69204142a2640b1866a0f, main36462e2b05ecd8e53dcdd7818c4b791b7c7cb2ed. Kenneth rapporterte treg UE-/leverandørliste og popup som forsvant ved forhåndsvisning, ba om søk etter lignende feil og oversikt over e-postbehov. Testadresse er bekreftet av Kenneth: **kenneth@ringside.no**; den først skrevne ringsiude.no skal ikke brukes. Konkret test til denne adressen er tillatt; dette autoriserer ikke generell Sandbox-utsending. Ingen Bolig TEST OK eller Production-merge.

## Scope og rotårsak

`useLivePartner`, de tre forbrukerne `BoligPartners`, `BoligPartnerPage`, `BoligPartnerInvitation`, egne regresjonstester, additiv ytelsesmigrasjon og relevant dokumentasjon. Ingen hovedmeny, Sales/recovery, andre modulimplementasjoner eller transportbrytere endres.

1. Felles hook tømte data før hvert minuttkall. Kontakt-/svarvindu og invitasjonsbarn ble demontert mens svaret kom tilbake.
2. Et faktisk klikk i sandboxet e-post-iframe utløser parent-window blur selv om dokumentet fortsatt har fokus. Dette ble behandlet som reelt appbytte.
3. SQL-planen evaluerte den samme `partner_target`-projeksjonen flere ganger ved filtrering og sortering. Det skjedde i både intern oversikt og mottakerside.

Bakgrunnslesing beholder nå samme DOM og blokkerer serverhandlinger inntil ferskt svar. Parallelle lesinger i samme hook slås sammen; timeren hopper over aktive skriveoperasjoner. Reelt fokusbytte/dvale og scopebytte skjuler fortsatt innhold og ugyldiggjør sene svar; timeren kan ikke hente det frem igjen mens vinduet er forlatt. Bare vår eksplisitt merkede forhåndsvisningsramme med `document.hasFocus()` behandles som intern fokusflytting. Iframe beholder tom sandbox og no-referrer. Lesekontroll vises som «Kontrollerer …», ikke som en påstått sending/lagring. Feil i fersk tilgangskontroll skjuler innhold. Eksakte retry-ID-er, native filinput, usendte kladder og serverkontroll før alle mutasjoner beholdes.

Migrasjon **20261023212214_bolig_partner_projection_once** er installert bare i Sandbox. MATERIALIZED CTE beregner hver whitelistet ordre-/aktivitetsrad én gang per projeksjon før filtrering/sortering. Ingen data, funksjonsgrants, autorisasjonsregler, skrivekommandoer eller låseregler endres. Ingen cache på tvers av brukere/forespørsler.

## Måling og kontrakt

Faktisk autentisert rollback-lesing av 40-boligpiloten med161 aktiviteter og6 tilganger: før **2843,5 /3454,1 ms**, etter **572,0 ms**. Én aktivitetsdel før707,8 ms, med én evaluering127,4 ms. Dette er databaseberegning, ikke total mobil-/nettverkstid eller en p95-garanti. Payload fortsatt220500 tegn.

Alle seks faktiske partnerprojeksjoner er feltvis identiske før/etter i samme SQL-lesing. Intern toppnivåliste inneholder de samme161 aktivitetsobjektene; rader med identiske eksisterende sorteringsnøkler kan komme i annen innbyrdes rekkefølge når planen endres. Det er derfor ikke hevdet lik helrespons-hash. Ingen ordregrunnlag, status, mottak, kladd, tilgang eller revisjon er omskrevet. Lokale kontraktscenarioer sammenligner komplett JSON og sikkerhetsattributter før/etter migrasjonen og prøver reader/utenforstående på nytt.

## Søk etter samme feil ellers

Kildesøk gjennom modulenes focus/blur/visibility/timer-håndtering og begge e-post-iframe-er. Gjennomgått Bolig: rom, rominnhold, pakkevalg, boligvalg, avtaler, klargjøring, bestillingsutkast, levering, plan, koordinering, portal/portaladministrasjon, kvalitet, ferdigstilling, restpunkt og dokumenteksport. Disse beholder i hovedsak data under vanlig lesing, og tømmer ved scope-/tilgangsendring. Den bekreftede ubetingede minutt-/iframe-feilen var i `useLivePartner`, som nå retter alle tre forbrukerne. Bestillingsmailens iframe har ikke samme blur-abonnement. Gantt-blur avbryter bevisst bare dragging.

Appbrede kontrollpunkter: TimeEntryPoint/TimeManagement/TimeSetup tømmer lesetilstand ved fokus/tilgangskontroll. Det kan gi tilsvarende blink i underflater og bør prøves med aktivt ukeskjema/eksport før eventuell egen endring. HR og KS/HMS har egne sperre-/kladd-/recoverykontrakter; disse skal ikke erstattes med én global hook. ControllerPortal beholder data under normal polling. Sales og arbeidsprofil har egne beskyttede recoverytester. Dette er kildekartlegging, ikke en påstand om full innlogget ende-til-ende-prøve av alle appflater.

## E-postkart og dokumenterte hull

| Flyt | Nåværende inngang og motor | Status / neste behov |
| --- | --- | --- |
| UE-/leverandørinvitasjon | Kontaktvindu → Send tilgangslenke, `bolig-partner-email` | Implementert, etablert appmal, preview/eksakt retry/historikk. Egen Sandbox-bryter AV. Mottak ikke attestert. |
| Boligbestilling | Bestillingsgjennomgang, `bolig-order-email` | Eksplisitt sending med Cordel ASCII og Excel; providerkvittering. Ingen ekte ordre sendes som QA. |
| Rettet protokoll | Bekreft og send, `bolig-protocol-email` | Navngitt mottaker og frosset innhold gjennomgås før send. |
| Beboervarsel | Nytt beboervarsel → digital publisering, `bolig-progress-notifications` | Utvalg/PDF/oppslag og digital kø. Sandbox-transport AV. |
| Aktivitetsfrist / ansvarlig | Eksisterende fremdriftsmotor, samme worker | Varslingsregel og gjeldende ansvar/tilgang kontrolleres. Ferdig/omfordelt/endret grunnlag stopper gamle jobber. |
| Beboerdialog | Portalinnstilling og dialog, samme worker | Valgfri generell e-post ved ny melding/svar, uten meldingstekst. Sandbox AV. |
| Beboerportalinvitasjon / påminnelse | Portaladministrasjon → Kopier invitasjon/påminnelse | Direkte sending er nå implementert i samme vindu; se BOLIG_BEBOERLENKE_EPOST_20261023.md. Transport AV, mottak ikke attestert. |
| Beboeraksept / endringsordre | Opprett beboerlenke i avtalevindu | Direkte sending og historikk er nå implementert i avtalevinduet; se BOLIG_BEBOERLENKE_EPOST_20261023.md. Transport AV. |
| Partnersvar / leveringsavvik | Eksisterende partnerhistorikk og intern oppfølging | **Ingen særskilt automatisk e-post til prosjektleder for hvert partnersvar. Behov/regel må velges før innføring.** Intern ansvarlig aktivitet beholder fristmotoren. |
| Prosjektdeltakere / plan | Prosjektdeltakere og planeksport, `project-participants-mailer` | Eksisterende eksplisitt sendeflyt utenfor Bolig. Kildeinnganger kontrollert; ikke ny leveringsprøve i denne runden. |
| Uavhengig kontrollør | ControllerAccessPanel, `controller-access-email` | Eksisterende tilgangsinvitasjon og malreferanse. Ikke ny leveringsprøve. |
| Befaring / tilbud / kontrakt | `salesCommunication` og eksisterende Sales-handlinger | Egne etablerte utsendingsløp, automatisk tilbudsoppfølging og avslag. Ingen endring eller full ny ende-til-ende-test. |
| Ordinær varebestilling | `supplier-order-email` | Eksisterende motor/mal. Handlerregresjon kjørt. |
| KS/HMS-ansvar og frister | `kshms-assignment-mailer` | Egen motor. **Rutine-/lesebekreftelses-e-post er bevisst permanent stoppet**, jf. `docs/kshms/ROUTINE_EMAIL_STOP_20261012.md`; skal ikke «fylles inn» som hull. |
| HR og timer | `hr-followup-reminders`, `hr-deletion-alerts`, `time-notifications` | Egne mottaker-/tilgangs-/personvernregler. Kilder kartlagt; ikke ny faktisk leveringsattest. |
| Support / systemadmin | `support-mail`/`support-inbound`, `systemadmin-broadcast-email` | Separate brukerinitierte løp. Markedsføring har egen avmelding. Ingen testkampanje. |

Kode/motor finnes er ikke lik aktiv transport, provideraksept eller faktisk innboksmottak. Denne kontrollen lover ikke full appdekning. Bevar stopp for rutine-e-post. Nye eksterne invitasjoner bør følge appens etablerte firmamal og samme mottakervindu, uten separat godkjenningsmodul.

## Verifisering og neste

Lokalt:1351 PostgreSQL-asserts PASS;86 partner-Chromium PASS med faktiske iframeklikk, samme dialog/iframe under forsinket minuttlesing, overlappende lesing, blokkerte handlinger, reelt blur med ramme valgt, ingen polling/skjult gjenoppretting mens forlatt, og alle tidligere dvale-/retry-/revokeringstester. UE-kvalitet49 og intern dokumentasjon35 Chromium PASS. E-post: partner56, bestilling46, protokoll24, fremdrift22 pluss dialog/logo-scenarioer, ordinær leverandør47 PASS med providerstub. Ingen ekte e-post er sendt. Build/React/CI/READY og innlogget etterprøve føres etter kontroll.

Prioriter først gjennomgående e-post for beboerportal- og avtalenker, deretter egne fasadebilder/plantegninger med stabile bolig-/rommarkører. Bemanningsliste med enkel grønn/rød inn/ut og prosjektlederkorrigering står fortsatt som senere funksjon. Excel-import sist. Publiser først i samme faste Preview; ingen merge uten Bolig TEST OK.

### Publisert etterprøve og checkpoint

Appkode **e6a9b44ad8f67c4b12f9d2f4619c52e1877df126**, tree **ef12f73388a7df2ddc3170727a19df333d74d66e**, lokal/ekstern kilde identisk. Vercel **dpl_F6kSE8ZA3b3m62FQKkJbzWxtxcad READY**, eksakt SHA og fast branch-alias kontrollert. Full critical Sandbox-build, faktisk foundation React, scope/docs/diff PASS. Første React-forsøk manglet JSDOM-modulsti; korrekt eksisterende KSHMS_JSDOM_PATH ga PASS uten kodeendring. CI666/40027032878 kjørte ved denne kontrollen; forrige665 SUCCESS. Les siste SHA/CI på PR278, ikke anta grønn ny HEAD.

Faktisk innlogget samme demoøkt i publisert Preview åpnet40-boligpilot → UE og leverandører → eksisterende aktive Expo/Eli-kontakt. Korrekt navngitt mottaker kenneth@ringside.no,40 boliger/161 aktiviteter og pauset Send-knapp. Vinduet kontrollert fortsatt åpent etter bakgrunnsoppdatering. Denne nettleseren mangler brukerens rålenke; invitasjonsvisningen opplyser korrekt at lenken bare finnes der den ble opprettet. Derfor ingen innlogget ekte iframe-/sendetest på brukerens eksisterende grant. Faktiske iframeklikk med DOM-identitet og forsinket timer er testet i86-assertioners Chromium-harness. Ingen brukergrant endret, ingen ny tilgang opprettet, ingen ekte mail. Readback:1 aktiv brukergrant,161 aktiviteter,0 partner_mail-rader og begge Bolig-transportbrytere AV. Produksjon/main urørt. Fysisk Safari/brukerens egen samlede Bolig TEST OK gjenstår.

Oppdatert prioritering: de direkte beboerlenke-mailene er implementert i Preview-pakken BOLIG_BEBOERLENKE_EPOST_20261023.md. Eldre neste-tekst over er historikk; ikke bygg en ny parallell sendeflyt.
