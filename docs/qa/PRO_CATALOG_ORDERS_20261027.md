# Proff varebestilling – QA 27.10.2026

Miljømål BEGGE. Main-baseline 9a780e53. Samme arbeidsbranch/Preview gjenbrukes.

Bestilt: alle med proffkatalogtilgang kan bestille varer fra tillatt katalog. Mottakeradresse velges av kunden og kan lagres. Leveringstidspunkt velges/avtales. Bestillingsmailen minner mottakeren om ordrebekreftelse. To vedlegg: samme prisfrie Cordel ASCII som Bolig, samt Excel for kontroll.

Scope: nye proffordre-/mottaker-/transportfiler, liten eksplisitt navigasjonsintegrasjon i main/globalTabs, tilgangsstyrt snarvei i Prissøk, eksisterende proffoppslagets valgfrie query-recovery, ny additiv migrasjon/Edge, Hjelp, arkitektur, moduldokumentasjon og additive CI-prøver. Ingen endring i intern leverandørbestilling, Boligbestilling, priser/rabatter, tilgangstildeling, tilbud/aksept/PDF, arbeidsprofilkjerne eller rutine-e-post.

## Utviklertest

- PostgreSQL: 48 assertions PASS med faktisk ny migrasjon og eksisterende kataloggate. Firma-/aktørskille, gjentatt ID, uforanderlig grunnlag, aktive varer/leverandører, mengder, e-post, dato/tid, rolle-ACL og utløpt retry. Ingen intern pris i snapshot, heller ikke når klienten injiserer en pris.
- Edge/vedlegg: 34 assertions PASS. Faktisk ASCII-byteidentitet mot eksisterende eksportør, to vedlegg, mottaker/reply-to, ordrebekreftelsestekst, escaping, manglende auth, revoke før provider, idempotent ID, providerfeil og tapt kvittering. Syntetisk provider; ingen mail sendt.
- Uavhengig XLSX-leser (openpyxl): PASS. Varenummer med innledende nuller er tekst, antall numerisk, norsk tekst, leverandørskille, dato/tid og tekst som begynner med = er ikke en formel.
- Ny migrasjon `20261027194442_pro_catalog_goods_orders.sql` installert kun i Sandbox via apply_migration. Ingen eksisterende funksjoner erstattet.
- Ny Sandbox Edge Function `pro-catalog-order-email` v1 ACTIVE. Auth.getUser og ferske katalogkontroller i handler; ingen reell sending testet.
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
