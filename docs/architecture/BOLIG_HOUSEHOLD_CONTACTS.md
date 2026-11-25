# Beboere og delt portal

Miljømål BEGGE. Ny migrasjon: 20261112222106_bolig_household_contacts.sql. Ingen eldre installasjonsskript skal kjøres.

En bolig beholder én primær kontakt og får et validert JSON-felt med maksimalt ni ekstra kontakter (stabil UUID, navn, e-post, mobil). Dette er kontaktdata, ikke egne brukerkontoer. Den eksisterende portalens bolig-ID, valg, avtaler og bestillinger deles. Ingen separat tilgang eller signaturidentitet per eier innføres.

Endret liste over ekstra eiere tilbakekaller eksisterende portaltoken og dokumenttoken. A→B→A gjenoppliver ikke token. Hovedkontaktens eksisterende tilbakekallingsregler beholdes. Ren endring av hovedkontaktens mobil beholder portal. Uendret liste skal bevare lenker.

Workspace-wrapperen beholder gjeldende gateway/firmatilgang og revisjonskontroll. resident_import krever manager, aktivt firma og prosjekt, forventet revisjon, før-verdier, unike aktive boliger og gjennomgått liste. Maks 500 boliger lagres atomisk. Eksakt retry bruker eksisterende preparation_receipts med separat intent og kontrollerer identisk payload. Gamle unit-kall uten additional_contacts bevarer eksisterende eiere. Ingen tabelltilgang gis til klienten.

Regnearket leses i nettleseren med størrelsesgrenser. Formler og eksterne ark avvises. Kladd lagres med eksisterende bruker-/firma-/prosjektavgrensning. Før lagring vises eksisterende kontakter og eksplisitt erstatning kreves. Serveren håndhever de samme data- og tilgangsgrensene.

Flere bygg ved beboervarsel er klientvalg som lagrer eksplisitte bolig-ID-er i eksisterende utkast. Serverens publisering og transportregler er uendret. Beboervarsler beholder eksisterende transport. Samlet portalutsending er et eget, uttrykkelig bekreftet løp som beskrevet nedenfor. Rutine-e-post aktiveres ikke.

Tilbakeføring: rull tilbake appkode; behold tilleggskolonnen og registrerte kontakter. Ikke dropp kolonnen eller slett eiere. En eventuell database-reversering krever egen kontroll av gatewaykjeden, inkludert supportleveransen.

## Samlet portalutsending og bestillingsfrist (13.11 norsk tid)

Avklart med Kenneth: alle registrerte eiere med e-post får hver sin melding med boligens samme portal. Bestillingsfrist stopper nye tilvalg, med mulighet for ny frist på valgte boliger. Eksisterende avtalesvarfrister og aksepterte avtaler endres ikke.

Ny additiv migrasjon `20261112232829_bolig_resident_batch_deadlines.sql` forutsetter household_contacts. En bestillingsdato ligger på hver bolig, gjelder ut norsk kalenderdag (Europe/Oslo) og håndheves server-side ved nye portal-request. Kvittering for allerede lagret request kontrolleres først, så en eksakt retry etter fristen ikke dobbeltskriver eller feilaktig avvises. Ingen frist betyr tidligere åpen oppførsel. Ny dato fremover åpner igjen. Dialogens eksisterende av/på-innstilling beholdes.

`bolig_resident_batch` har offentlig invoker-wrapper og privat manager-/firma-/medlemskontroll. Tabellen for batchkvitteringer er privat med RLS og ingen klientrettigheter. Roten låses før catalog-låsen, i samme rekkefølge som struktur/stammeendringer. Kun eksplisitte bekreftede bolig-ID-er (maks500), unike og aktive, kan endres. Fingeravtrykk dekker bolig, hierarki, stamme, kontaktliste, portalrevisjon og rotrevisjon. Hele utvalget valideres før atomisk fristlagring eller portalpublisering. Eksakt payload-retry bruker samme kvittering; feil basis stopper alle endringer.

Klargjøring lager én token per bolig, aldri per eier, og bruker eksisterende portalpublisering. Eksisterende aktive lenker krever eksplisitt bekreftet erstatning. Serverkvitteringen lagrer ikke token i klartekst. Klientens brukerspesifikke kladd bevarer samme forsøksreferanser og token som eksisterende portalverktøy.

Utsending er separat fra klargjøring. Hver registrerte e-post valideres mot ferske kontakter på serveren. Duplikatadresser innen samme bolig får én melding; samme eier på ulike boliger får hver boligs lenke. Tilleggseieradresser sammenlignes normalisert. Mottakere settes aldri som felles To/CC/BCC. Per-mottaker forsøksreferanse, kvittering og provider-idempotens beholdes. Rate-/uavklart-vern avgrenses per portal+mottaker så flere eiere ikke sperrer hverandre. Avtaleslenker beholder eksisterende hovedkontaktregel. Senderens pauseflagg, konfigurasjon og tilgang kontrolleres fortsatt før transport.

For publisering kreves database + frontend + oppdatert bolig-resident-link-email-template. Behold eksisterende verify_jwt-kontrakt ved Edge-deploy. Ingen transport/cron eller automatisk påminnelse aktiveres. Bekreftet provider-sending betyr ikke levering/lesing hos mottaker.

Rollback: tidligere frontend kan brukes med beholdte nye felt/tabeller. Serverfrister fortsetter å gjelde til de uttrykkelig endres av prosjektleder. Ikke dropp data eller opphev frister som skjult rollback. Kontroller gammel frontend mot serverfrister før tilbakerulling. Pending sendinger må avstemmes mot kvitteringer før nye forsøksreferanser brukes.

Nye sendekall inkluderer forventet aktiv bruker-ID. Edge sammenligner denne med Auth.getUser og avviser supportens effektive kundeidentitet når JWT tilhører administratoren. Eldre klienter uten felt beholder sin eksisterende kontrakt. SQL bekrefter fortsatt firma, rolle, registrert mottaker, aktiv token og revisjon før både prepare og begin.

Portalens identity.logo_url hentes fra prosjektets eget company_id og eksisterende logo i companies/profiles, aldri fra besøkendes aktive firma. Bare logofeltet eksponeres; øvrig firmaprofil følger ikke med. Bilde vises proporsjonalt, med firmanavn/ikon ved manglende eller feilet bilde.
