# Samlet Bolig-gjennomgang – 25. oktober 2026

Miljømål BEGGE. Kun feature-Preview/Sandbox ppvircenkjizeiqdxphj. Ingen
produksjonsmerge, produksjonsmigrasjon, betalingsendring eller e-postaktivering.
Kenneth bestilte samlet gjennomgang og ønsker spørsmål med svaralternativer når
et reelt produktvalg må avklares. Tidligere avklarte regler videreføres.

## Startpunkt og avgrensning

Remote 897685c44861574e91373e8b821d5fb51a4dc9a8, main 36462e2b.
CI701 / 40148103460 COMPLETED SUCCESS, inkludert hele Bolig-steget.
Lokal 166a4ee har identisk tree med remote. Ingen reset/force-push.
PR278 OPEN DRAFT. Samme faste branch-Preview brukes.

Kontroll av berørte eksisterende moduler inngår i samlet CI. Native SQL-prøver
bruker eksisterende syntetiske identiteter og ruller tilbake alle endringer.
Dette er separate bevis fra faktisk UI, og erstatter ikke fysisk Windows/Safari.

## Ny, faktisk innlogget pilot

Opprettet fra tomt prosjekt gjennom vanlig veiviser i delt Preview:

- DEMO – Samlet gjennomgang 25.10.2026, QA-SAMLET-20261025.
- Root e31d3dcb-0642-4922-936a-62ad42266a5b.
- QA Bygg A: to etasjer med to leiligheter hver, DEMO – Testveien 101.
- QA Hus B: én enebolig over to etasjer, DEMO – Testveien 103.
- Fem boliger totalt; eneboligens etasjer blir ikke flere husstander.
- H0101 er 13570ed7-fdad-4df3-aa0a-60fbca2d6f48. Kun fiktiv kontakt på
  example.invalid. Andre boligkontakter og eksisterende piloter er urørt.
- Ny prosjektgrunnpakke med to testvarer; rom Bad QA25 i H0101.
- Én ekstra speilpakke til 2 500 kr inkl. mva. Bare H0101 har boligvalg.
  Readback bekrefter at H0102 fortsatt har null selection.
- Avtale a2cb02a9-6bf9-4749-966a-3d716ce80a86 ble opprettet og publisert
  gjennom UI uten e-post. Faktisk offentlig lenkeside viste utgave 1, tre varer,
  2 500 kr og tydelig tekst om at dette er en fiktiv test uten virkelig avtale.
- Testaksept gjennom den offentlige siden ga kvittering; faktisk manager-RPC
  bekrefter accepted og det fiktive navnet på samme dokument-ID.
- Fiktiv ordre cefdd64c-e959-4b56-825f-d9ac4f2d1325, B-2, ble klargjort fra
  tre valgte varer. Status prepared. Ingen ordre ble sendt eller merket levert.
- Faktisk nedlastet Excel har riktig prosjekt, H0101, rom og nøyaktig SKU-ene
  DEMO-QA25-001/002/003, antall 1 hver. Cordel-vedlegget har samme tre varer og
  antall, CRLF og valgt vareleverandør. Begge vedlegg er kontrollert fra faktiske
  browser-downloads, ikke rekonstruert fra serverdata.
- Påkrevd romsjekkliste DEMO – Sluttkontroll QA25 ble opprettet i UI og bevisst
  beholdt ubesvart. Faktisk samlet PDF/ZIP ble lastet ned i UI: seks PDF-sider,
  40 423 byte, SHA256 a76bc4dd3cdf323e7554f7acc6aa510ff2c6b7a2955311f8cc0feb22bbb4c8dd.
  Alle sider er visuelt kontrollert med MuPDF. Poppler i denne containeren har
  kjent fontsubstitusjon; alternativ renderer bekrefter korrekt tekst/layout.
- PDF-en viser Ikke startet, Ikke godkjent, påkrevd ufullført sjekkliste, riktig
  rom, firmalogo, tre FDV-varer, én eksempel-lenke og to manglende lenker. Ingen
  H0102 eller eneboligdata i H0101-pakken. ZIP har samlet PDF, lagret dokumentasjon
  og historikk, filmanifest og LES-MEG. Null originalfiler er korrekt for piloten.

## Produktfeil funnet: gammel status i åpnet avtale

En avtale kunne åpnes fra en tidligere lastet intern liste og fortsatt vise
Venter på beboer etter at beboeren hadde akseptert. Sendingspanelets ferske
serverkontroll sa samtidig at avtalen ikke lenger ventet på svar. Det ble
observert i faktisk Preview med den nye pilotaksepten og bekreftet mot databasen.

Endring: BoligCommerce.jsx henter fersk eksisterende commerce-RPC når en avtalerad
åpnes. Ingen ny polling, skriving, e-post eller tilgangsendring. Valgt avtale og
kladd beholdes; eksisterende revisjons-/firma-/rolle-/retry-sperrer gjelder.

Ny browser-regresjon aksepterer et fiktivt serverdokument uten fokusvarsel og
åpner den gamle raden. Før rettelsen feilet den med timeout på Akseptert av QA
Beboer; etter rettelsen er gjeldende status synlig og publish-antallet fortsatt 1.
Samlet commerce-browser: 70 assertions PASS. Full critical Sandbox-build og
51 core-boundary assertions PASS; ingen eksisterende critical check er endret.

## Oppdaterte native kontrollskript

Tre eldre smokes hadde forutsetninger som ikke lenger gjaldt. Dette var feil i
kontrollgrunnlaget, ikke feil som krevde ombygging av produktreglene:

- streamlined-sandbox-smoke brukte den avviste gamle completion/handover-ruten.
  Bruker nå handover_review med en uttrykkelig vurdering av hvert åpent forhold.
  Tester at gammel snarvei fortsatt avvises, intern godkjenning blir review ved
  ny kritisk feil, og historisk faktisk overtakelse bevares uendret.
- partner-project-sandbox-smoke antok én sjekkliste. Delte pilotdata har nå to.
  Portalen skal matche nøyaktig managerens ferske antall, og fortsatt vise
  avviksstatus uten private felt. Fjerning av funksjoner stopper også eksakt retry.
- partner-quality-sandbox-smoke kopierte første liste fra delt pilot. Den listen
  hadde nye obligatoriske vedlegg og ble korrekt avvist ved ufullstendig svar.
  Testen oppretter nå sin egen root/kildeliste i transaksjonen og sammenligner
  hele originalposten før/etter. Original brukerdata endres ikke.

Alle tre oppdaterte native smokes PASS i faktisk Sandbox og ruller tilbake.
Native commerce/anon-aksept/replay/privat projeksjon, masseplan/avhengigheter,
KS/HMS-/timekobling/Mine oppgaver, redigerbar faktura/kreditering/ACL og
prosjektleders faktiske overtakelse/eksport PASS på aktuelle Sandbox-funksjoner.

## Utsending og gjenstående kontroll

Progress-, partner- og beboerinvitasjonsbryterne er false før gjennomgangen.
Ordinær ordre-e-postdialog kan forhåndsvises og har Send-knapp; denne knappen
ble ikke brukt. Ingen e-post til fiktive eller virkelige mottakere er testet.

Gjennomført UI-prøve er prosjektopprettelse, grunnpakke/tilvalg/rom, fiktiv
beboeraksept gjennom offentlig side, bestillingsgrunnlag/vedlegg og uferdig
sjekkliste/FDV/sluttpakke. Native SQL-prøver dekker dessuten UE, fremdrift,
KS/HMS/timer, fakturaregister og prosjektleders faktiske overtakelse. Dette er
ikke en påstand om full innlogget UI-prøve av alle disse øvrige arbeidsflatene.

Produktvalg til Kenneth før nye bestillingssperrer: skal uaksepterte beboertilvalg
stoppes ved bestilling, tillate prosjektleders begrunnede overstyring, eller bare
gi varsel? Dagens første bestillingsopprettelse krever ikke en slik aksept.
Endring av denne forretningsregelen er ikke del av statusrettelsen.

Statusrettelsen ble publisert som 7e76c4519abadc7ee8b2785b69619e3196cb7d7f,
tree de3f4197694fddba5b984011f8aeb19fb1f0ba72, Vercel READY.
Fristkravet nedenfor er en separat, etterfølgende endring i samme draft-PR.
Fysisk Windows Utklippsverktøy, Safari og Kenneths samlede TEST OK gjenstår.
Excel-import er fortsatt lagt sist. Booking og virkelig AI-analyse er utsatt.

## Avklart svarfrist per avtale

Kenneth krevde frist for beboerens tilvalgsaksept og kontakt med prosjektleder
etter utløp. På spørsmål med svaralternativer valgte han **Dato for hver avtale**.
Opprettelse av første bestilling og eventuell overstyring er fortsatt et eget,
uavklart produktvalg. Det er ikke lagt inn en ny bestillingssperre på antakelse.

- Prosjektleder velger «Svarfrist for beboeren» ved klargjøring. Utgangspunktet
  er 30 kalenderdager. Datoen kan endres før deling, også på et lagret utkast.
- Valgt dag er inkludert til kl. 23:59 norsk tid. Serveren lagrer neste midnatt
  i Europe/Oslo som eksklusiv grense; vinter- og sommertid håndteres i Postgres.
- Eksisterende delte/aksepterte avtaler og deres frister endres ikke. Gammelt
  klientforsøk uten nytt datofelt følger eksisterende 30-dagerskontrakt, eller
  den allerede lagrede utkastfristen. Eksakt retry forlenger aldri fristen.
- Begge beboerinnganger viser dato/tid og at beboeren må kontakte prosjektleder.
  Direkte lenke og portal avviser aksept etter utløp på serveren. Prosjektleder
  beholder historikken; allerede aksepterte avtaler beholder kvitteringen.
- Native regresjonsprøve avdekket at now() brukte transaksjonens starttid:
  et svar som ventet over fristen, kunne aksepteres sent. Separat additiv
  migrasjon bruker clock_timestamp() etter låsen. Samme prøve feilet før
  rettelsen («Expired direct acceptance succeeded») og passerer etterpå.
- Ingen varsling er aktivert eller sendt. Dette innfører ikke automatiske
  påminnelser om akseptfrister. De eksisterende invitasjonsbryterne er fortsatt av.

Begge nye migrasjoner er generert med Supabase CLI 2.122.0 og lagt i Sandbox.
Den første migrasjonens lagrede SQL er beholdt; klokkerettelsen er en ny migrasjon.
Historiske avtaler før/etter første migrasjon: 8 poster med identisk fingerprint
4e85cdcc9fd66321746f7a8d44d1b4df. Security advisors har ingen nye funn.
Native frist-smoke oppretter eget fiktivt prosjekt og ruller alt tilbake.

Lokalt: hele PostgreSQL-kjeden, publisering/retry/tilgang, utløpt direkte/portal-
aksept og uendret kvittering er testet. Nettlesertesten dekker beholdt fristkladd,
lagret utkast, ny dato ved deling, mobil, tapt svar i alle tre publiseringssteg,
og fristutløp mens beboerens svar står åpent. Full critical Sandbox-build og
core-boundary passerer. Sluttcommit/READY/CI avleses etter publisering.
