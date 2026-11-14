# Orvei – produksjonsimport 14.11.2026

## Miljø og autorisasjon
Produksjon https://expo-proffdok.app, Supabase dqffxflaoyarbxyiyhop.
Appgrunnlag main 7343ea871be87d4a5c03b236f5528cc2477448c2, tidligere PR332/333 ferdig publisert.
Kenneth autoriserte import av beboerliste og fremdriftsplan i produksjon samt egen butikktilgang.
Avklart i samme arbeidsøkt: bruk foreløpig etasjefordeling fra sandbox; Thomas er aktivitetsansvarlig.
Ingen appkode, migreringer, Edge Functions, firmamedlemskap eller innstillinger ble endret.

## Resultat – ikke kjør importen på nytt
- Tore Orvei AS: company a937c278-566d-4bae-bb92-32dca76b63ee.
- Aamodthagen boligsameie: root 75db29b1-db64-4b88-89f7-348a08da02f8.
- Referanse: ORVEI · Etasjer foreløpige.
- 29 bygg, 126 boliger, 151 eiere. Første eier per seksjon er hovedkontakt.
- 1260 aktiviteter, alle planlagt, Thomas ansvarlig. Periode 02.12.2026–05.11.2027.
- 126 bestillingsfrister, prosjektets fristklokkeslett 12:00.
- Kenneth har personlig butikktilgang til 14.12.2026 kl. 17:39 UTC (30 dager).
- Ingen beboerportaler opprettet eller lenker sendt. Ingen prøveordre, kundeaksept eller e-post.
- Grunnpakker og tilvalg fra sandbox er ikke kopiert til produksjon.
- Styrerommet er ikke lagt inn som en fiktiv bolig. Fellesaktiviteten må avklares separat.

## Kilder og kontroll
Adresseliste datert 14.10.2026: 126 seksjoner og 151 eierlinjer.
SHA256: 893e5444e987261d2a7e43bfcba243f552958edfe2d1e1949f6f83dbb4603e0e.
Viktige datoer R01 11.11.2026 omfatter oppstart 1–17; R02 12.11.2026 omfatter 18–29 og styrerom.
R01 SHA256 e63fb97c0db249e93c2a57d4bbd0043d06baaa4f3f8f7ac2536e2530f06e1237.
R02 SHA256 00de3ce01b38ccc387e9972a1775189ae113baed17c988fadbbdb32b880b2f65.
R02 erstatter ikke hele R01. Tidligere bekreftet rettelse for seksjon 113–116: grunnpakkemøte 08.06.2027.
Alle 1260 aktivitetstitler/datoer og 126 frister ble maskinelt avstemt mot R01+R02.
Alle navn/telefonnumre og e-poster ble sammenlignet mot Excel; kun normalisert e-postcase og adressewhitespace.
Persondata og originalfiler ligger ikke i GitHub.

## Gjennomføring og verifikasjon
Eksisterende offentlige RPC-er brukt: bolig_workspace, bolig_progress, bolig_resident_batch og bolig_shop_staff.
Supportkontekst var Kenneth som faktisk administrator, Thomas som effektiv Orvei-bruker.
To atomiske prøvekjøringer ble rullet tilbake; siste inkludererte full sammenligning av kontakter, etasje/posisjon, datoer, ansvarlig og portalfravær.
Deretter samme validerte transaksjon committed. Supportøkten ble avsluttet i samme transaksjon.
Etter commit: separat readback bekreftet 29/126/151/1260, alle frister, Thomas, prosjektperiode og aktiv butikktilgang.
bolig_my_collaborations med Kenneths identitet returnerte prosjektet hos Tore Orvei AS uten firmabytte.
Inngang: Min side → Mine boligprosjekter → Aamodthagen boligsameie · Tore Orvei AS.
Produksjonens innloggede UI med Kenneth er ikke prøvd i denne økten; tilgangslisten er kontrollert gjennom samme RPC som UI benytter.

## Visuell vurdering
Kontrollert eksisterende sandbox-visning med samme foreløpige struktur, fire og seks boliger per bygg.
Ingen overlapp mellom boligknappene observert ved desktopbredde 1363 px.
Mørke vindusrammer dekker mye av illustrasjonen; numrene er små, særlig tresifrede.
Anbefalt avgrenset forbedring: større bolignummer, mindre statusmerke, roligere kort og jevn plassering per etasje.
Ingen layoutendring implementert eller publisert. Ny layout må prøves på mobil og desktop i Preview før TEST OK.

## Tilbakeføring og neste steg
Dette er autorisert forretningsdata, ikke engangs testdata. Ikke slett prosjektet som opprydding.
Eventuelle feil rettes i de berørte boligene/aktivitetene med appens revisjonskontroll.
Butikktilgang kan tilbakekalles under Butikktilgang; etasjer kan korrigeres med Flytt bolig etter avklaring.
Neste steg: Kenneth prøver personlig butikktilgang, avklar styrerommets plass i planen og gjennomfør separat fasadelayoutforbedring.
