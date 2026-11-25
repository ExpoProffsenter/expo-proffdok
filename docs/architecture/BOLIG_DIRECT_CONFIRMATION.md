# Direkte bestillingsbekreftelse

## Kontrakt

Beboeren velger publisert, fryst grunnpakke og kombinerbare tilvalg eller ett komplett alternativ. Se over valget viser varer, bilder, rom, prisdetaljer, fratrekk og pristillegg inklusive mva. Navn og eksplisitt bekreftelse kreves før Bekreft bestilling. Serveren bygger den faktiske kombinasjonen fra sine publiserte snapshots; klienten kan ikke fastsette pris, varenummer, mengde eller bilde. Grunnpakken er inkludert i hovedleveransen, ikke solgt på nytt.

En privat trigger hindrer at en intern pakke-/varetilpasning oppretter et nytt boligvalg over en beboerbekreftet utgave. Bare den nye, aksepterte bekreftelsens eksakte valgversjon kan lagres. Avtale og valg ligger i samme transaksjon. Boligoversikten viser prisfri status «Bekreftet og låst», eller «Åpent for nye beboervalg» under et endringsvindu.

Under samme prosjektlås valideres den eksisterende portalkapasiteten, beboerkontakten, aktivt firma/prosjekt/bolig, fristen, menyutgaven, endringsvinduets revisjon og boligvalgets basis. Deretter opprettes en ny choice_versions-utgave og en allerede akseptert commercial_documents-utgave med source=resident. Tidligere aksepterte rader endres ikke. Hver bekreftelse får egen gruppe og stigende beboerutgave; gamle godkjente/publiserte valgutkast supersedes. Historiske ønsker aksepteres aldri automatisk. Den nye handlingen har egen request-ID/fingerprint og varig kvittering; nøyaktig retry gir ingen ny bestilling eller e-postjobb.

Akseptert kilde inneholder projiserte kundedata, prisdetaljer, identitet og referanse til eksakt choice_revision. Ingen innkjøpspris eller intern katalogmetadata eksponeres. Bilder signeres bare fra portalens eget prosjekt og publiserte eller bekreftede historiske kilder. Kundens bestillingsbekreftelse viser priser; håndverkerens eksisterende A4-oversikt er fortsatt prisfri. De opprinnelige leverandørordrene beholdes, og endring etter bestilling markeres for leverandøroppfølging.

## Gjenåpning og innsyn

Prosjektleder kan åpne den enkelte boligen til en ny dato skrevet som dd.mm.åååå, med prosjektets eksisterende fristklokkeslett og norsk tid. Det er et tidsbegrenset unntak for denne boligen; andre boligfrister endres ikke. Gammel bekreftelse er gjeldende under redigering. Tidligere valg forhåndsutfylles uten å overskrive en usendt kladd eller uavklart forespørsel. Ny bekreftelse lukker vinduet og fryser en ny utgave. Steng for endringer avslutter unntaket. Navn-/eierbytte fjerner også et tidligere endringsunntak og tilbakekaller historiske kundelenker som før.

Har boligen en akseptert individuell endringsavtale utenfor katalogpakken, brukes den eksisterende endringsavtaleflyten. Slike spesialleveranser kan ikke erstattes automatisk med eldre katalogvarer/priser. Aksepterte butikktillegg er separate avtaler og beholdes. Dette er en kontroll av et annet avtalegrunnlag, ikke en ny prosjektledergodkjenning av ordinære pakkevalg.

Se som beboer bruker samme PortalPage i et isolert iframe med samme CSS, autentisert prosjektlederlesing og skrivebeskyttede handlinger. Ingen kundekapasitet opprettes eller lagres for forhåndsvisningen. Firma-/boligbytte og bortfalt tilgang fjerner gammel visning. Den faktiske kundelenken kan fortsatt deles separat; den er ikke en skrivebeskyttet forhåndsvisning.

## E-post

To separate confirmation_deliveries opprettes i bekreftelsens transaksjon: boligens registrerte hovedkontakt og den aktive prosjektlederen fra prosjektets eksisterende dialogoppsett. Nettleseren velger ingen mottaker. De registrerte eierne deler samme portal; e-postkvitteringen går til hovedkontakt. Mangler aktiv prosjektleder, kan ikke en uadressert prosjektbestilling bekreftes.

bolig-confirmation-email er en separat, serverstyrt Edge-worker. Den eksisterende private Vault-hemmeligheten autentiserer serverkallet; bare service_role har tilgang til reserve/validate/finish. Alle nye tabeller er private med RLS og uten klientgrants. Rett før providerkallet kontrolleres firma, prosjekt, bolig, kontakt, tilbakekalling og gjeldende prosjektleder/e-post igjen. Mottakerbytte eller bortfalt tilgang stopper gammel levering.

Hver mottaker har egen varig leverings-ID som Resend-idempotensnøkkel. Tapt acknowledgement gir samme providernøkkel. Retry skjer innen 23 timer; eldre uavklarte sendinger undertrykkes for å unngå ny levering utenfor providerens idempotensperiode. Sendestatus betyr provideraksept, ikke lest eller garantert levert til innboks. Providerfeil opphever aldri den lagrede bestillingen. Prosjekt og portal viser pauset/ventende/sendt/undertrykt status uten å eksponere mottakeradressene i kundedata.

## Installasjon og aktivering

1. Kontroller fravær av migrasjonen og at eksisterende portal-/butikk-/kontakt-/utskriftsmigrasjoner finnes. Installer først 20261125172116_bolig_resident_direct_confirmation og deretter 20261125180724_bolig_confirmed_choice_overview én gang hver, deploy den nye bolig-confirmation-email-funksjonen med JWT-gateway av, og deploy oppdatert bolig-resident-link-email-mal. Begge funksjoner følger sine eksisterende valideringskontrakter. Nye innstillinger starter avslått.
2. Preview bruker eksisterende Sandbox. Bare et syntetisk QA-prosjekt får roots.resident_confirmation_enabled=true. Andre demoportaler beholder gammel flyt mens QA pågår. flow_enabled er globalt av. Bekreft at faktisk bundle er bundet til Sandbox.
3. E-posttest krever konkret avtalt adresse. Sett confirmation_mail_settings.test_recipient til denne adressen og test_root til det syntetiske QA-prosjektet. Bare dette prosjektets kvitteringer kan da sendes, og begge kopier omdirigeres til testadressen etter vanlig validering av de faktiske mottakerne. Sett enabled_since til før det nye syntetiske bekreftelsesforsøket og endpoint til samme miljøs /functions/v1/bolig-confirmation-email. Bare enabled for denne særskilte transporten kan settes på. Kvitteringer eldre enn aktivering sendes ikke. Skru utsending av etter test. Ikke endre progress_mail_settings, rutinevarsling eller beboerlenketransport.
4. Etter ny TEST OK: installer migrasjon og funksjoner kontrollert i Production, deploy eksakt kandidat til main, bekreft READY og riktig backend, og aktiver flow_enabled. Dette gjelder også det eksisterende Aamodthagen-prosjektet, med samme prosjekt-/bolig-ID-er og pakkegrunnlag. Ingen prosjektdata må opprettes på nytt. Bekreftelsestransport aktiveres separat for nye bekreftelser, med Production-endpoint og uten test_recipient/test_root. Ingen gamle dokumenter skal køes/sendes retroaktivt.
5. Synk main til demo med bevarte overlays. Etter publisering av samme UI kan global flow_enabled aktiveres i Sandbox; e-post forblir pauset. Kjør vanlig sandbox-preflight.

Cron-jobben ser bare confirmation_deliveries og gjør ingenting når denne transporten er av. Den aktiverer ingen rutinevarsler. Ikke seed/nullstill prosjekter, roter eksisterende kundelenker eller send reelle kundetester under installasjon.

## Tilbakeføring

Slå av flow_enabled og enabled i confirmation_mail_settings og fjern eventuelle eksplisitte QA-prosjektoverstyringer. Publiser tidligere frontend fra dokumentert main-baseline. Migrasjon, aksepterte snapshots, valgversjoner og sendekvitteringer beholdes. Gammel forespørsels-/avtaleflyt er fortsatt bevart bak bryteren. Kontroller mottaker-/versjonsgrunnlag før eventuell senere gjenopptakelse av uavklarte kvitteringer; ikke flytt enabled_since ukritisk eller send historikk.
