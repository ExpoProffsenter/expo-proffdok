# Timer, utlegg og lønnsgrunnlag – 14. oktober 2026

Miljømål: BEGGE. Fra main d95f14c80e2a87bd4fed4e31cf47f712c3c2ca48. Feature/Preview først. Ingen produksjonsmigrasjon, main/demo-merge eller e-postaktivering før ny avgrenset TEST OK.

## Avklart produktomfang

Kenneth ønsker timeregistrering for prosjektkundene, med enkel bruk som et konkurransepunkt. Ansatte fører på Min side; leder kontrollerer i HR. Første versjon støtter både antall timer og fra–til med pause, arbeid på prosjekt/internt, overtid, ferie/sykdom/annet fravær, reisetid, kilometer, tillegg og utlegg med private kvitteringer. Firmaets timeansvarlige skal kunne sette opp og lagre egne kategorier og lønnskoder. Mottakende lønnssystem er ikke valgt.

Kategoriforslag er uttrykkelige forslag, ikke automatisk firmapublisering. Firmaadmin/registrert timeansvarlig lagrer kategorinavn, type, enhet, lønnskode, aktivitet og prosjekt-/kvitteringskrav. Brukte kategorier kan deaktiveres, ikke fjernes eller endre type/enhet. Ansattnumre, prosjektmapping, ukefrist og CSV-kolonner/skilletegn/datoformat har eget oppsett. Lønnskoder er tomme i forslagene; ingen koder eller satser gjettes.

## Brukerreise

1. HR → Timer og utlegg → Timeoppsett: tilpass og lagre. Firmaadmin kan gi Timeansvarlig. En delegert timeansvarlig som ikke har HR i hovedmenyen bruker Min side → Mine timer → Timeadministrasjon. Eksisterende global HR-/Min side-autorisasjon endres ikke.
2. Min side → Mine timer: kompakt uke, sju dager, summer og status. Ny registrering/Legg til åpner ett skjema. Arbeidskategori, prosjekt og føringsmåte kan følge siste arbeidsregistrering. Kopier en dag kopierer timer/tillegg med nye ID-er, uten utlegg/kvitteringer. En valgfri serverlagret Start tidtaking nå/Stopp og lagre tiden finnes for dagens timer.
3. Lagre registrering gir bekreftet serverlagring og lukker registreringsdialogen. Utlegg kan lagres som kladd uten fil, men påkrevd kvittering må være opplastet og knyttet til linjen før innlevering. PDF/JPG/PNG, maks. 10 MB, maks. fem filer per linje/femti per uke. Tidligere lagrede vedlegg i samme uke kan velges igjen ved avbrutt respons.
4. Send uken til godkjenning. Tom uke krever uttrykkelig bekreftelse. Ansatt kan trekke tilbake innlevering som fortsatt venter. Ingen kan godkjenne egne timer. Nærmeste leder eller firmaets timeansvarlige godkjenner/returnerer med begrunnelse. Historikken er separate lagrede snapshots.
5. Lønnseksport tar godkjente, ikke tidligere eksporterte linjer med dato i valgt periode. Ansattnummer, lønnskode og påkrevd prosjektnummer valideres før en atomisk batch opprettes. Uken låses etter første eksport; øvrige linjer kan inngå i neste periode. Samme batch lastes ned fra arkivet ved feil/nytt behov. Eksport er ikke bevis på import eller utbetaling.

## Scope og sikkerhet

Ny `src/modules/time/**`, additiv `time_private`-migrasjon/privat Storage-bucket og egen generisk varselworker. Små innganger i PersonalPage/HrModule. Hjelp, README, arkitektur og permanent QA/CI oppdateres. Ingen main/bootstrap/Sales/recovery/prosjektdata-/garanti-/kunde-/UE-/kontrollørendring. Rutine-e-postsperre beholdes. Parkert PR #217 er ikke brukt eller endret. Ingen demo-overlay flyter til main.

Alle time-RPC-er bruker eksisterende ferske HR-modul-/medlemskaps-/aktiv-firma-/innholdsporter, deretter nye tidsrettigheter. Ingen direkte private tabellgrants; alle private tabeller har RLS. Eksisterende ekstra HR-leser, KS-rolle, support eller systemadmin gir ingen ny lønnsrett. Delegert timeansvar gir bare timeområdet; ingen individuell samtale-/sykefraværsrett gis. Oppsett kan bare delegeres av firmaadmin. Lederbytte gjelder straks ved ny lesing/utsending.

Serverberegning validerer klokkeslett, positiv varighet, pause, dag/uke og overlapp over midnatt. Norsk sommertid/vintertid tas med i varigheten. Tvetydige/ikke-eksisterende klokkeslett krever eksplisitt antall timer. Manuelt antall gir ikke en oppdiktet tidsperiode. Ingen automatisk vurdering av overtidsrett, lønn, skatt eller satser.

Kvitteringer har eget privat `time-private`-lager. Reservert kanonisk objekt kreves for INSERT; ferdige bytes kan ikke oppdateres/overskrives av klient. Ingen offentlige/signerbare fillenker. Nedlasting krever fersk tilgang før/etter og verifisert størrelse/SHA-256 i klient. Upload registreres først etter faktisk Storage-metadata/readback, og linjen må bekreftes lagret. Storage-metadata bekrefter ikke i seg selv et serverberegnet bytehash; klienten kontrollerer bytehash ved nedlasting.

Ulagret registrering/oppsett holdes bare i avgrenset aktør-/firma-/uke-bundet RAM. Fersk autorisasjon og serverrevisjon kreves før gjenvisning etter bakgrunn/remount. Reell konflikt bevarer kladd og sperrer lagring til uttrykkelig valg. Ny enhet begynner med serverens lagrede uke. Lukket nettleser beholder ikke ulagret kladd.

Time-/utleggsgrunnlag er et eget lønnsområde. Avsluttet HR-arbeidsforhold sperrer ansatt/tidligere leder straks, mens firmaets aktive timeansvarlige beholder historikk/kvitteringer/eksporter. Ingen automatisk slettingstid er vedtatt i denne leveransen. Oppbevarings-/sletterutine må avklares særskilt; det er ikke innført en automatisk tomåneders purge eller restore-/slettegaranti fra #217.

## Oppgaver og e-post

Firmaets ukefrist har dag/klokkeslett i Europe/Oslo. Ny aktivering/registrering får en startdato; det opprettes ikke retroaktive manglende uker før start. Ansatt ser eldste manglende uke/returnerte uker på Min side. Leder/timeansvarlige ser innleverte uker som venter.

Egen server-only Vault-autentisert transport, generisk HTML/tekst uten navn, fravær, beløp eller bilag. Manglende innlevering varsler ansatt og gjeldende ansvarlig; innlevering varsler gjeldende leder/timeansvarlige; retur varsler ansatt. Oppgave, revisjon, ansvarlig og tilgang kontrolleres ved utsending. Ferdige/endret oppgave eller bortfalt tilgang undertrykker ventende varsel. Stabil provider-idempotens, provider-ID og bekreftet databasefinish kreves. Preview transport AV, ingen ekte mail i QA. Rutine-arbeider/-kø endres ikke.

## Verifisering og kjente grenser

Aktuell QA, publisert SHA, CI og Preview føres nedenfor før brukerprøve. Lokal PostgreSQL kjører faktisk additiv migrasjon og RPC-er mot syntetisk eksisterende Auth/Storage/prosjekt-substrat. React/JSDOM kjører faktiske komponenter med syntetisk transport; dette erstatter ikke fysisk mobil/kamera eller innlogget Storage-bevis.

Før produksjon: relevant Preview-TEST OK, grønn CI, korrekt produksjonsmigrasjon/worker/binding og Production-verifisering. Deretter kontrollert main → demo med overlays bevart og sandbox-preflight. Konkrete lønnsprogrammer krever en prøvd importspesifikasjon når program er valgt. CSV er nå et kontrollerbart konfigurerbart grunnlag, ikke attestert kompatibilitet med alle lønnssystemer.

## Siste faktiske QA og driftsstatus

- Lokal additiv PostgreSQL: 85 assertions PASS, med reell funksjonskode og syntetisk Auth/Storage/prosjektplattform. Omfatter manuell prosjektreferanse og serverlagret timer. Dette er ikke attestert nettleserinnlogging eller Storage-byteintegrasjon.
- Faktisk React/JSDOM: 33 assertions PASS for begge føringsmåter, komma-beløp, kvittering, lagring/innlevering/retur/godkjenning, kategori-/timeansvar-oppsett, eksportbekreftelse og konflikt/fokus/remount/tilbaketrukket tilgang. Transport/Storage er syntetisk.
- Eksisterende HR/register/Hjelp, Min side/kontakt/e-post og KS/HMS/HR/Min side navigasjon PASS. Full Sandbox critical/build PASS. Forventninger om Hjelp-kapitler og kort er utvidet for den nye timeinngangen; ingen eksisterende scenarioer er fjernet.
- Sandbox har et tidligere timeprototyp-skjema. Fersk kontroll viser HR-funksjonsfingerprint `cd3b5b12be87deee00bc827ad794734e` og HR/public-policyfingerprint `d68f0ad75386801f07419b16ec17a5ba`, begge uendret fra baseline. E-posttransport for timer er AV.
- En uavklart tomåneders oppryddingsjobb fra prototypen er stanset i Sandbox. Fersk kontroll viser null aktive `time-registration-cleanup`-jobber. Den automatiske slettingen inngår ikke i denne leveransen; kilde er bevart separat i tidligere arbeidskopi.
- Supabase-installasjonskallet og deretter kall for kontraktsavstemming ble avbrutt. Fersk lesing bekrefter installert `time_registration`, men ikke `time_registration_review_contract`. Ingen installasjon kjøres dobbelt eller påstås verifisert fra et avbrutt svar. Gjennomgått additiv kontraktsavstemming ligger i egen migrasjon. Ikke kjør den opprinnelige migrasjonen på nytt i Sandbox.
- Publisert kode-SHA/CI/READY og innlogget endelig ende-til-ende-prøve føres i PR før noen Production-godkjenning. Ingen faktisk lønnsimport, utbetaling eller mottatt e-post er attestert. Main/demo/PR #217 er urørt.

Tilgangsoppfølging: oppsett og timeadministrasjon maskerer data ved aktør-/firmabytte og tømmer lønnsgrunnlag ved 42501. Fersk kontroll hvert minutt, samt ved fokus/tilbakekomst. Navigasjon til medarbeideruke lagrer bare medarbeider-ID og uke. Nye React-scenarioer dekker kjent tilgangsbortfall i begge skjermene. HR-avslutningsdialogen opplyser uttrykkelig om bevart lønnsgrunnlag.
