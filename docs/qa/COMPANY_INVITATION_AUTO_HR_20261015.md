# Automatisk medarbeider fra firma-invitasjon

Miljømål: BEGGE. Ren main 657a430fac538275f024205f2263c3f65016e610. Oppfølging av samme invitasjonsleveranse; Kenneth har eksplisitt gitt TEST OK og valgt egen test i produksjon fordi ekte brukere ikke finnes i Sandbox. Ingen ny manuell prøve på den nye commit-en påstås.

## Kontrakt

- HR valgt på invitasjonen gir én medarbeider i det inviterende firmaet etter bekreftet aktivering. Eksisterende aktiv konto registreres ved invitasjonsbehandling.
- Det kreves faktisk, aktivt HR-oppsett. Manglende/deaktivert oppsett fullføres ved senere aktivering/lagring, uten oppdiktet formål eller behandlingsgrunnlag.
- Bare lagret, brukt tilgangsvalg med samsvarende invitasjonsfingeravtrykk kan registreres. Nåværende HR-lisens, aktiv firmatilknytning og personlig HR-tilgang kontrolleres igjen. Lukket arbeidsforhold blokkerer gjenoppretting.
- Eksisterende HR-identitet, leder, revisjon, lesere og historikk beholdes. Manglende leder blir tom; gyldig lagret leder i samme firmakart gjenbrukes. Ugyldig eksisterende kartleder må korrigeres før automatisk innmelding kan fullføres ved lagring av HR-oppsettet.
- Normal HR-insert kjører dagens org- og timeregistreringstriggere. Feil ruller tilbake både aktivering, tilgangsvalg og HR-oppretting; ny aksept kan prøves igjen.
- Samme HR-oppsettlås tas før modulgrants. Ingen offentlig helper, ny offentlig RPC, generell modulgrant-trigger, medlemskapsendring eller masseoppretting fra arbeidsprofiler.
- Migrasjonen etterfyller kun tidligere eksplisitte, anvendte HR-invitasjonsvalg. Før installasjon hadde både Production og Sandbox null slike rader; eksisterende 13/2 medarbeidere forventes uendret.

## Verifisering

121 lokale PostgreSQL-assertions med ekte migrasjon, eksisterende profil-/invitasjonskontroller og reelle HR-funksjoner samt org-/timetriggere. Dekker ventende/akseptert/eksisterende konto, HR avslått, gjentakelse, bevart leder/historikk/lesere, manglende/deaktivert oppsett, fersk tilbakekalt tilgang, avsluttet arbeidsforhold, firmaskille og full transaksjonsrollback ved nedstrømsfeil. 52 faktiske Chromium-assertions for Firmaadmin, uendret resend og isolert Systemadmin. Eksisterende React HR-register/meny/Hjelp og full critical/build PASS. Sandbox-prøven bruker random syntetisk konto, ekte accept-RPC og kontrollerer HR-rad/leder/firmaskille; alt rulles tilbake. Ingen e-posttjeneste brukes i QA. CI/READY/kilde- og migrasjonskontroll dokumenteres på PR før ferdigmelding.

## Kort brukerprøve

Firmaadmin → Legg til ansatt → velg firmaets e-post, rolle og HR → Inviter ansatt. Etter at brukeren har aktivert kontoen: HR → HR-register skal vise medarbeideren uten Legg til medarbeider. Velg nærmeste leder der ved behov. Åpne på nytt og kontroller at bare én oppføring finnes. Det krever firmaets aktive HR-oppsett.

## Felles organisasjonskart: lesende funn

Produksjon har ennå ingen org-grupper, enheter eller plasseringer. Patrick har én HR-oppføring i Expo Proffsenter og arbeidsprofiler i tre firmaer; Ringside viser medlemskap uten egen HR-registrering. Espen har bare Expo-tilknytning. Derfor finnes han ikke i Ringsides firmasentrale ledervalg. Felleskart kan opprettes under KS/HMS → Organisasjonskart → Nytt felles kart med de tre firmaene. Dette samler kartet uten å kopiere HR-innhold eller automatisk gi alle tilgang til alle firmaer. Ingen faktiske firmamedlemskap, ledere eller kart endres i denne leveransen.

Faktisk Sandbox-akseptprøve PASS med clean=true etter rollback. Eksisterende 2 Sandbox-medarbeidere uendret. Connector apply_migration og første lange SQL-kall returnerte Invalid or expired requestState uten endringer (kontrollert). Eksakt DDL ble deretter kjørt i tre korte transaksjoner; privat helper ble fratatt execute før akseptfunksjonen ble koblet på. Kanonisk historikk 20261015175511 inneholder de tre sammenhengende delene av kildefilen; samlet SQL-kilde verifiseres med MD5. Ingen annen migrasjon endret.
