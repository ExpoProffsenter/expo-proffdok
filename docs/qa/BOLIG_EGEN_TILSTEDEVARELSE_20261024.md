# Egen inn- og utregistrering – 24. oktober 2026

Miljømål: BEGGE. Kun feature/Preview og Sandbox ppvircenkjizeiqdxphj. Ingen main/Production-merge, ingen permanent demo-synk, ingen e-post. Baseline 50c8863f; main 36462e2b. PR278 forblir OPEN DRAFT.

## Avklart og implementert

Kenneth ønsket kort øverst på Min side, kun for navngitte prosjektdeltakere. UE skal ha samme handling i sin egen lenke og kunne lagre lenken på telefonens hjemskjerm.

Oppsett → Faktisk bemanning → Hvem kan registrere seg inn og ut? → Legg til prosjektdeltaker. Velg en aktiv ansatt fra firmaet og fyll navn, eller velg en aktiv personlig UE-lenke fra prosjektet. Opprett én eksisterende UE-tilgang per person; en felles firmalenke identifiserer ikke flere håndverkere. Eksisterende e-postsending og UE-funksjonsvalg endres ikke.

Bemanning må være aktivert. Personen får Utlogget/grått lys og Logg inn på prosjektet. Etter serverkvittering vises Innlogget/grønt lys, norsk innregistreringstid og Trykk her for utlogging. Flere egne prosjekter gir prosjektvalg, og et pågående besøk prioriteres. Deltakeren ser bare egen status. Prosjektleder får registreringene og historikken i den eksisterende listen/CSV. Utregistrering avslutter bare besøket. Ingen kobling til apputlogging, lønn eller timeføring.

UE-kortet forklarer Safari → Del → Legg til på Hjem-skjerm og Chrome → meny → Legg til på startsiden. Dette er en lenkesnarvei, ikke en ny offline-app eller en ny installasjonsmotor. Faktisk installasjon/åpning på fysisk telefon er ikke testet.

## Avgrensning og bevaring

Egne Bolig-komponenter/CSS og ny additiv migrasjon 20261024100223_bolig_named_self_attendance. Ett isolert lazy-kort i PersonalPage og ett kort i BoligPartnerPage. Ny deltakerseksjon i BoligAttendance. Eksisterende migrations, critical checks, Sales-, time-, HR-, KS/HMS-, innloggings- og navigasjonskode er uendret. Unntaket er ett nytt eget deltakerpredikat i get_my_personal_context sin personal_page-bool, lagt til med kontrollert anker; eksisterende øvrige rettigheter beholdes. Bolig-grensekontrollen tillater bare de to nye integrasjonslinjene i PersonalPage og krever byte-identisk main når de fjernes.

Tre nye private deny-all/RLS-tabeller holder eksplisitt identitet, kobling til eksisterende besøk og eksakte forespørselskvitteringer. Eksisterende attendance_visits og manager-gateway er ikke endret. Selvregistrering låses på samme prosjekt som manuelle registreringer, bruker serverklokke, ny revisjon og før/etter-hendelse. UE-hendelsen er merket personlig UE-lenke og navn; den skal ikke fremstilles som personlig Auth-innlogging. Internt kontrolleres aktiv bruker/arbeidsfirma og registrert deltaker. UE kontrollerer token, UE-type, aktuell utløp/revokering og utsteders eksisterende autorisasjon. Ingen person får andre personers status via egenregistreringsendepunktet.

Kvittering og eksakt retry hindrer dublett ved mistet svar/reload. Gamle forespørsler returnerer aktuell status og gjeninnfører aldri gamle besøk. Manuell retting vises på personens kort. Deaktivering av en deltaker krever først utregistrering; historikken beholdes. Arkiv, avskrudd bemanning, utløpt/revokert UE-lenke og feil bruker/firma sperrer registrering.

## Kontroller før Preview

- PostgreSQL/PGlite1534 PASS, inkludert42 nye kontroller. Eksisterende1492 bevares.
- Native Sandbox: migrasjonen syntaksprøvd i rollback, installert additivt, deretter prøvd igjen med interne og UE-registreringer, kvitteringer, feil identitet, felles historikk og uendret prosjekt. Alle smoke-prøveskriver rullet tilbake.
- Security-advisors: samtlige WARN-antall uendret. Tre nye INFO gjelder bevisst deny-all/RLS uten direkte tilgangspolicyer.
- Ny nettleserprøve12 PASS: intern/UE, eget prosjektvalg, inn/ut, tapt svar/reload/eksakt retry, kladd og åpen deltakerredigering ved fokus, dvale, tilbakekalt tilgang og320/390/768/1366px. Mock-transport, faktiske komponenter og globale stiler.
- Eksisterende manuell bemanning15 PASS, Min side React PASS, Min side/prosjekt-layout108 PASS, Sales-editor196 PASS, mobilheader91 PASS, full critical Sandbox-build PASS, scope/grensekontroll og diff-check PASS.

Regresjon fanget og rettet før Preview: en ny kortbetingelse kunne krasje under anonym oppstart med undefined bruker og null kontekst. Eksisterende Min side React-test fanget dette. Layoutprøven fanget at en bruker uten bemanning kunne få et stort feilkort; kortet vises nå først ved bekreftet aktivt deltakerforhold. Deltakerkladdens åpne seksjon mistet først sin tilstand ved fersk fokuslesing; den er nå eksplisitt kontrollert.

## Publisering og faktisk brukerprøve

Fast Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

Eget syntetisk prosjekt DEMO – Inn- og utregistrering, root715c2ae7-604d-45a3-847b-1e05dbfee063. Navngitt demoansatt og QA UE Testperson; kun syntetiske data og eksisterende demoidentitet. Ingen andre pilotprosjekter/grants endret. Den nye QA UE-lenken er avgrenset til dette syntetiske prosjektet, med sju dagers utløp. Ingen invitasjon er sendt.

Faktisk UE-prøve og CI-status føres etter publisering. Skynettets innloggede Min side-prøve krever ny sikker innlogging; lokal faktisk React-/Chromium-prøve og native Auth/gateway-kontroll består. Fysisk Safari/iPhone og lagring på telefonens hjemskjerm gjenstår. Ingen full app-regresjonsgaranti eller produksjonsklarering gis.
