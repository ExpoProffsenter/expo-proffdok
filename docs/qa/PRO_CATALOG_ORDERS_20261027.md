# Proff varebestilling – QA 27.10.2026

Miljømål BEGGE. Main-baseline 9a780e53. Samme arbeidsbranch/Preview gjenbrukes.

Bestilt: alle med proffkatalogtilgang kan bestille varer fra tillatt katalog. Mottakeradresse velges av kunden og kan lagres. Leveringstidspunkt velges/avtales. Bestillingsmailen minner mottakeren om ordrebekreftelse. To vedlegg: samme prisfrie Cordel ASCII som Bolig, samt Excel for kontroll.

Scope: nye proffordre-/mottaker-/transportfiler, liten eksplisitt navigasjonsintegrasjon i main/globalTabs, tilgangsstyrt snarvei i Prissøk, eksisterende proffoppslagets valgfrie query-recovery, ny additiv migrasjon/Edge, Hjelp, arkitektur, moduldokumentasjon og additive CI-prøver. Ingen endring i intern leverandørbestilling, Boligbestilling, priser/rabatter, tilgangstildeling, tilbud/aksept/PDF, arbeidsprofilkjerne eller rutine-e-post.

## Utviklertest

- PostgreSQL: 48 assertions PASS med faktisk ny migrasjon og eksisterende kataloggate. Firma-/aktørskille, gjentatt ID, uforanderlig grunnlag, aktive varer/leverandører, mengder, e-post, dato/tid, rolle-ACL og utløpt retry. Ingen intern pris i snapshot, heller ikke når klienten injiserer en pris.
- Edge/vedlegg: 35 assertions PASS. Faktisk ASCII-byteidentitet mot eksisterende eksportør, to vedlegg, mottaker/reply-to, ordrebekreftelsestekst, escaping, manglende auth, revoke før provider, idempotent ID, providerfeil og tapt kvittering. Syntetisk provider; ingen mail sendt.
- Uavhengig XLSX-leser (openpyxl): PASS. Varenummer med innledende nuller er tekst, antall numerisk, norsk tekst, leverandørskille, dato/tid og tekst som begynner med = er ikke en formel.
- Ny migrasjon `20261027194442_pro_catalog_goods_orders.sql` installert kun i Sandbox via apply_migration. Ingen eksisterende funksjoner erstattet.
- Ny Sandbox Edge Function `pro-catalog-order-email` v2 ACTIVE. Auth.getUser og ferske katalogkontroller i handler; ingen reell sending testet.
- Faktisk React/Chromium: 30 assertions PASS ved 390/1366 px, globalmenyenes rekkefølge og adgang, faktisk proffoppslag, mottakerlagring, leveringstidspunkt, fanefokus, varig usikkert sendeforsøk etter reload, firmabytte, tilbakekalt tilgang og ingen sideveis scrolling. Alle sendekall før og etter reload må ha samme ID; faktiske Excel-celler kontrolleres også direkte i CI. Hele prøveflyten bruker syntetisk transport. Skjermbilder mobil/PC er visuelt kontrollert; global sticky header ble avgrenset bort i den nye flaten og fikk regresjonsassertion.
- Full critical/Production-build og full critical/Sandbox-build PASS. Ingen eksisterende assertions svekket. Alle nye tester er lagt til eksisterende parallelle CI-pakker.
- Sandbox-migrasjons-ID `20261027195111` svarer til kildefilen `20261027194442_pro_catalog_goods_orders.sql`. Ingen registreringshistorikk er omskrevet.
- Faktisk Sandbox Edge-kall uten innlogging: HTTP401 med uncertain=false, ingen sending. Begge private tabeller har RLS; PUBLIC/anon har ingen EXECUTE på nye API-er og authenticated kan ikke fullføre sending.
- Security advisors gjennomgått: RLS uten policy i privat schema er tilsiktet deny-direct. Fire authenticated SECURITY DEFINER-gatewayvarsler er tilsiktede API-er med lukket search_path, eksplisitt ACL, fersk tilgang og firmakontroll, ikke åpne tabellrettigheter.
- GitHub CI og faktisk fast Preview kompletteres før leveranse. Production er uendret; ingen reell e-post er sendt.

## Brukerprøve

Bruk samme faste Sandbox Preview. Velg et firma/en bruker med proffkatalogtilgang.
1. Varesøk: søk vare og velg et treff. Kontroller varen i bestillingen og juster antall.
2. Åpne Varebestilling rett under Varesøk i menyen. Oppgi mottaker og prøv Lagre mottaker. Listen tilhører firmaet.
3. Velg Avtales eller ønsket leveringsdato/klokkeslett. Se over bestillingen og kontrollér mottaker, adresse, antall og bestillerens svaradresse.
4. Sending må være bevisst. Ingen reell sending inngår i automatiserte tester. Sjekk at bruker uten proffkatalog ikke ser menyene/snarveien og avvises på serveren.

Ny TEST OK kreves før Production-installasjon og merge. Etter godkjent Production-verifisering: kontrollert main → demo med bevart overlay og preflight. Ingen nye bakgrunnsjobber eller rutineutsendinger.

## Oppfølging – manglende inngang for intern testkonto

Kenneth testet riktig Preview som demo@expo-proffdok.no. Faktisk lesende Sandbox-kontroll viste Prissøk=true, proffkatalog=false; den nye gatewayen avviste dermed kontoen som tilsiktet etter den første, for snevre avklaringen. Kenneth avklarte eksplisitt at interne Ringside/Expo-brukere med Prissøk også skal ha Varebestilling.

Utvidet scope: bare ny ordre-gateway/søk, egen ordre-oppslagskomponent og de nye navigasjonsinngangene. Eksisterende tilgangsfunksjoner, kontorettigheter, supplier grants, Prissøk-plukklister/leverandørbestilling, Sales-oppslag, Bolig, priser, PDF og rutine-e-post er uendret. Ny additiv migrasjon `20261027202648_pro_catalog_internal_orders.sql` endrer bare funksjoner opprettet i denne PR-en og legger til et privat varefilter og et eksplisitt prisavgrenset søke-API. Production er uendret.

Interne brukere får Prissøk → Varebestilling → Firmaprofil. Bestillingen har eget varesøk på samme flate. Proffkunder beholder Varesøk → Varebestilling og eksisterende leverandørutvalg. Direkte serverkall krever fortsatt aktiv bruker, riktig aktivt medlemsfirma, fersk tilgang og gyldig vare. Ingen reell e-post inngår i testen.

Verifisert før ny Preview-publisering:
- 65 PostgreSQL-kontroller PASS, inkludert uendret proffleverandøravgrensning, intern bestilling uten proffgrant, tilbakekalt intern tilgang, aktiv import, firmaavgrensning og direkte ACL.
- 50 faktiske Chromium-kontroller PASS ved 390/1366 px. Ny regresjon bruker faktisk Prissøk-adapter, full globalmeny, tilgangshook, snarvei og ordresøk: Prissøk → Varebestilling → Firmaprofil, ingen duplisert Varesøk-meny for internbruker, bytte fra Prissøk, kladd ved fokus/reload og tilbakekalling. Skjermbilder gjennomgått. Testtransporten sender ingen mail.
- 35 e-post-/vedleggskontroller fortsatt PASS. Full critical/Sandbox-build og full critical/Production-build PASS. React-gjennomgang: samme appklient, egne firma-/brukerkladdnøkler, avvisning av sene svar, tastaturtilgjengelige handlinger og ingen nye bakgrunnsutsendinger. Eksisterende scope-/dokumentasjons-/143-kallskontrakt PASS.
- Ny migrasjon installert bare i Sandbox som versjon 20261027203247. Faktisk authenticated test med demo-kontoen: internal_catalog=true, gammel proffkatalogtilgang fortsatt false, faktisk vareoppslag og grunnlag med korrekt vare og antall 2. Alle syntetiske ordrer rullet tilbake; ingen sendekall.
- Alle public-funksjoner utenfor PR-ens nye pro_catalog_order_*-API-er og deres ACL er byteidentiske før/etter: fingerprint 0234ebfd860d4aca8a5f0c8ec0f5df56. Ingen kontorettigheter endret.
- Security-advisors før/etter: gjennomgått; ny authenticated definer-gateway er tilsiktet, med fresh-access og eksplisitt feltavgrensning. Ingen nye anon-grants, privat helper kan ikke kalles direkte.
- Lokal Chromium krevde CPU-rendering/systemfontkonfigurasjon i denne kjøreflaten; testassertionene er uendret. GitHub kjører sin låste Chromium-konfigurasjon.

Endelig GitHub-CI og faktisk Preview-deployment føres i PR #290. Ny TEST OK kreves før Production.

## Kenneths TEST OK og e-postprofil

Kenneth ga TEST OK for produksjonssetting etter at også interne brukere ble tatt med, med krav om at e-postlayout følger etablerte appmailer. Han avklarte at faktisk e-post skal prøves i Production. Den nye mailen er derfor tilpasset eksisterende leverandørbestillingsmal: identisk ytre tabellramme, EXPO/ProffDok-toppfelt, firmalogo, størrelser, farger, bekreftelsesboks og signatur/bunntekst. Egen regresjon sammenligner faktisk HTML-prefiks og hele bunnteksten byteeksakt mot eksisterende mal. Prisfri varetabell, ordrebekreftelsespåminnelse og begge vedlegg beholdes. 39 mail-/vedleggstester PASS. Faktisk mail er rendret ved 390/900 px og kontrollert visuelt. Ingen påstand om Outlook-rendering eller faktisk mottak før reell Production-prøve. Ingen e-post er sendt fra Sandbox.

Frontendtreet er identisk med forrige grønt testede kandidat 344b83d9, som bestod full Core Safety #728 / 40579513132. Siste kandidat endrer bare ny e-postmal, tilhørende test og dette QA-grunnlaget; ny full CI må være grønn før merge.
