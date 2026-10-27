# Varebestilling – produksjonslogg 27.10.2026

Miljømål BEGGE. Kenneths TEST OK gjelder begge brukergrupper, etablert e-postlayout og reell e-postprøve i Production. Ingen reell testutsending er utført av agenten. Testmottaker kenneth@ringside.no er kontrollert mot aktiv Production-profil og Auth-svaradresse; faktisk mottak må bekreftes av Kenneth.

## Godkjent grunnlag

- PR290, kandidat `7ce1a3f21a53617c9e977e32006f6191387894e3`, tre `cb5f76548bd0b3c30b6029a0368315ece05bff25`.
- Full Core Safety #729 / [40580430716](https://github.com/ExpoProffsenter/expo-proffdok/actions/runs/40580430716) SUCCESS. Alle åtte pakker, plan og stabil sluttkontroll grønne.
- 65 PostgreSQL-, 50 faktiske Chromium- og 39 mail-/vedleggskontroller. Mobil/PC, nøyaktig menyrekkefølge og faktisk Prissøk-snarvei, gamle proffavgrensninger, interne aktive varer, firmaskille, revocation og varig retry-ID.
- E-postens ytre HTML/toppfelt og hele bunntekst er byteidentisk med eksisterende leverandørbestillingsmal ved samme firmagrunnlag. Rendering ved 390/900 px kontrollert uten sideveis scrolling. Ingen påstand om faktisk Outlook-rendering eller mottatt mail før Production-prøven.

## Production

- Funksjonsrelease main `4a33cef5d791a7bc804e7acfdad4d59dae772601`, identisk kildekodetre med grønn kandidat. Vercel `dpl_68TcvTZB7PbWgxxUHknbZRKPk5pR` READY på denne SHA og expo-proffdok.app.
- Opprinnelig ny ordre-migrasjon installert som `20261027204615`; intern utvidelse som `20261027204636`. Begge kilder er bevart i repoet. Installer aldri gamle skript på nytt uten å kontrollere registrert versjon og faktiske ressurser.
- Første forsøk på den andre migrasjonen traff kontrollplanets sekundbaserte versjonskollisjon med den første. Historikk og funksjoner ble kontrollert: bare den første var registrert; helper/søke-API fra den andre fantes ikke. Bare det ikke-installerte trinnet ble deretter kjørt på nytt. Ingen delvis kode eller omskrevet migrasjonshistorikk ble beholdt.
- Ny Edge pro-catalog-order-email v1 ACTIVE. Samme bundle-SHA256 som Sandbox v3: `395f946f7baded04d21bb36d1a1c594ec5ec0856928c320f7afe30874fa980f4`. Gateway har samme tilsiktede verify_jwt=false som Sandbox; handler bruker Auth.getUser og revaliderer prepare/begin før provider.
- Faktisk anonymt Production-POST: HTTP401, uncertain=false, Logg inn før du bestiller. Ingen sending.
- Faktisk authenticated lesetest for Kenneth: riktig bruker, intern katalogtilgang, korrekt Auth-svaradresse og faktisk vareoppslag PASS i rollback-transaksjon. Ingen bestilling opprettet eller e-post sendt i denne prøven.
- Alle seks nye public-API-definisjoner samsvarer med Sandbox. To private tabeller har RLS og ingen direkte authenticated SELECT; anon har ingen EXECUTE på nye public-API-er; authenticated kan ikke kvittere sending. Ordretabellen var tom før brukerens Production-prøve.
- Public-funksjoner/ACL utenfor de nye ordre-API-ene er uendret før/etter: `913952480ab04cbd5253ae434f6db2e4`. Ingen eksisterende tilgangsfunksjon, medlemskap, pris, e-postjobb, tilbud/aksept/PDF eller annen modul er endret.
- Advisor-differanse er tilsiktede deny-direct-varsler for de to private RLS-tabellene og fem authenticated, eksplisitt autoriserte definer-gatewayer. Ingen nye anon-grants.

Faktiske leverte frontendfiler, senere dokumentasjons-SHA og kontrollert demo-synk/preflight registreres i PR290. Dette dokumentet beskriver gjennomført funksjonsrelease; senere dokumentasjonscommits endrer ingen funksjon.

## Tilbakeføring

Forrige Production-deployment er `dpl_9STdvRH5GEmEKX3QE3s1gbF8rpya`, main `9a780e53dbbfa585b4a29e6e862d3781dfe90cff`. Frontend kan tilbakeføres dit. De nye additive, private ordretabellene skal bevares; ikke slett bestillinger eller kjør destruktiv nedmigrering. Ved backendfeil stanses den nye senderen særskilt. Rutine-e-post og eksisterende transportflyter skal ikke endres som rollback-sideeffekt.

## Reell e-postprøve

I faktisk Production: Meny → Varebestilling → velg en vare og et antall → mottaker Kenneth / kenneth@ringside.no → tydelig TEST-referanse og merknad om at det ikke skal leveres → Se over bestillingen → Send bestilling. Kontroller mottatt mail, riktig avsenderfirmalogo, ordrebekreftelsesadresse, ønsket levering og begge vedlegg. Provider-aksept er ikke tilstrekkelig bevis for mottatt mail. Ikke send til reelle kunder eller leverandører som test.
