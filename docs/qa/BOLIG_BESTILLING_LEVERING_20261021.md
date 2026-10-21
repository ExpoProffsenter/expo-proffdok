# Boligprosjekter – bestilling, levering og to e-postvedlegg

Miljømål BEGGE. Samme foundation-branch og draft PR #278; først Preview/Sandbox. Ingen TEST OK, Production-merge, produksjonsmigrering eller main→demo-synk er utført.

## Endring og scope

Egne boligkomponenter/klient/CSS, boligstatus og hjelp, tre additive bolig-migrasjoner, en ny boligspesifikk Edge Function med egne delte eksport-/mailfiler, og egne QA-tester/CI. Eksisterende Cordel-eksport, ordinær bestillingsmail, Sales, HR, global meny, auth og andre moduler er uendret. Cordel- og selskapsprofilfunksjoner gjenbrukes med fersk rettighetskontroll.

- Vårt ordrenummer er kjøpers referanse. Leverandørordrenummer er valgfritt, kan fylles senere og er separat fra appens interne B-referanse.
- Felles prosjektadresse/merknad er standard. Hver bolig kan ha egen adresse og uavhengig valg av samlet/delt bestilling og samlet/delt levering.
- Lagret bestillingsutkast er kilde. Alle tilgjengelige varer velges som standard, og delt bestilling kan velge underutvalg. Uendrede varer som allerede er klargjort/bestilt kan ikke bestilles på nytt. Annullering av et usendt grunnlag beholder historikken og frigir varene.
- Ordre fryser hver vare, rom/avsnitt, varenummer, mengde/enhet, prosjekt/bygg/oppgang/bolignummer/offisielt nummer, leveringsadresse og ønsket dato. Endring av fellesoppsett endrer aldri tidligere ordre. Leverandørreferanse har separat, logget metadataoppdatering.
- Klargjort er ikke Bestilt. Eksplisitt manuell registrering krever dato/bekreftelse. E-post markeres først Bestilt etter provider-kvittering. Varemottak krever faktisk bestilt ordre; delmengder og negativ korrigering med forklaring er begrenset til 0–bestilt mengde. Levert beregnes fra alle varelinjer, ikke en fri statusvelger.
- Byggoversiktens Bestilling og levering viser faktiske telledata og gjenstående varer. Ingen mailmottakere eller vareinnhold eksponeres i oversiktssammendraget.
- Firma-/rolle-/arkivkontroller, samme rotlås som pakkevalg, revisjonskontroll, immutable kommando-/sendekvitteringer og request-replay bevarer data ved samtidige endringer eller mistet svar. Ny bruker/firma/rolle monterer egen arbeidsflate; kladd er avgrenset per bruker/firma/prosjekt/bolig. Fokus og visibility henter nytt grunnlag uten å nullstille editoren.

## E-post og vedlegg

Ny `bolig-order-email` er installert kun i Sandbox. Ingen faktisk mail er sendt under QA.

1. Brukeren oppgir en eksplisitt e-postmottaker og Cordel-fagområde for varene, eventuelt fyller alle med ett bekreftet felles fagområde. Det gjøres ingen gjetting av mottaker eller leverandørens prisbok.
2. Serverlagret forhåndsvisning har fast mottaker, firma/avsender, ordren og tillatte varefelt. Ingen nettopriser, marginer eller beboerkontakt kopieres. Lokal bruker kan laste ned begge vedlegg før sending og se nøyaktig mail i en sandboxed iframe.
3. Cordel-vedlegget bruker uendret `createCordelPicklist` fra varesøk: Windows-1252, CRLF, `NR;Mengde;Fagområde`, komma i desimalantall, ingen pris. Manglende/ugyldig varenummer/fagområde stopper før sendekravet låses.
4. Ekte `.xlsx` (OOXML/ZIP) genereres i produktets runtime fra samme kanoniske ordre. Metadata øverst, tabell med Rom/Avsnitt/Varenummer/Beskrivelse/Antall/Enhet/Fagområde, frosne overskrifter, filter og tekstceller for identifikatorer. Formel-lignende beskrivelser lagres som tekst. Ingen makroer eller eksterne workbook-lenker.
5. Mail bruker etablert mørk/turkis appstil, firmalogo, prosjekt, bygg/oppgang, leilighet, leveringsadresse, ønsket leveringsdato, referanser, varetabell og svaradresse for ordrebekreftelse.
6. Kun eksplisitt sendeknapp kaller Edge Function. Den validerer innlogget bruker og ferske manager-/Cordel-rettigheter, henter kanonisk snapshot, validerer begge vedlegg, låser ett sendeforsøk per ordre og bruker stabil provider-idempotensnøkkel. Mottaker, avsender, varer og vedlegg kan ikke velges av klientens sendebody.
7. Mistet svar bruker samme request-ID. Endring/annullering/manuell Bestilt sperres mens sending må avklares. Kvittering kan fullføres én gang av service_role. Etter 23 timer sperres automatisk sending; mottatt mail må kontrolleres før en manuell avklaring. Appen påstår ikke mottak hos leverandør ut fra provider-aksept.

## Lagring

Sandbox: ppvircenkjizeiqdxphj. Nye tabeller ligger i privat skjema, RLS deny-all uten tabellgrants til klientroller. Autentiserte invoker-RPC-er kaller private funksjoner med eksplisitt scopekontroll. Provider-kvittering har egen service_role-only wrapper. Eksisterende public-funksjoner for Cordel-tilgang og firmaprofil er uendret.

Kilder:
- 20261021202352_bolig_orders_deliveries.sql
- 20261021203036_bolig_order_email_attachments.sql
- 20261021204213_bolig_delivery_overview.sql

Tidsstempel hos server kan avvike fra kildefilen. Sammenlign innhold, ikke installer samme migrasjon en gang til på grunn av et annet versjonsstempel.

## QA

- PostgreSQL/PGlite kjører alle eksisterende boligscenarier og nye bestillings-/mottaks-/mail-/oversiktsscenarier. Nye tester omfatter firma-/leser-/anon-sperrer, gamle revisjoner, replay, endret mottaker, valgfri referanse, delordre, dellevering, korreksjon, fryst adresse, kildeendring, sendelås og service_role-only provider-kvittering.
- E-post: 46 assertions med mock-provider; to vedlegg, identiske Cordel-bytes, bare kanonisk mottaker, escaping, layout, ingen priser og stabil retry. Ingen mail sendt.
- OOXML: alle ZIP/XML-deler parses; rå tekstverdier beholder innledende nuller, antall er numeriske, formellignende tekst er ikke formler. Importert med artifact-tool og visuelt rendret. Rendererens General-format kan vise numeriske tekstverdier uten nuller; rå XLSX-cellene er inlineStr og importinspeksjon bekrefter strengverdiene.
- Chromium med faktisk global app-CSS: 26 assertions ved 320/390/1024/1366 px, ingen horisontal dialogoverflow. Felles/egen adresse, delvalg, valgfri leverandørreferanse, fokus og kladd ved lukking, ordre, mailpreview og Excel-nedlasting, mistet sendsvar med samme ID, manuell Bestilt, del-/sluttmottak og lesertilgang.
- Faktisk autentisert Sandbox-transaksjon: lagret leveringsoppsett, klargjort delordre fra eksisterende syntetisk boligvalg, kanonisk mailpreview og delmottak. Hele testen ROLLBACK. Ingen leverandørkontakt eller provider-kall. Se bolig-delivery-sandbox-smoke.sql.
- Eksisterende katalog React og full critical build PASS; siste relevante omkjøring/status legges i PR ved publisering. Nye tester inngår i PR Core Safety.

## Begrensninger og videre arbeid

Ingen ekte leverandørmail er sendt eller levert under QA; provider-transport er testet med mock. Fysisk mobil/Safari, import i virkelig Cordel og åpning i desktop Excel er ikke særskilt prøvd. Nærmere avsender-/providerkonfigurasjon kan kreve en eksplisitt kontrollert test etter at Kenneth har valgt mottaker.

Bestilling deles per bolig og varelinje; ikke mengdedeling av én varelinje i flere innkjøpsordrer eller en felles ordre på tvers av boliger. Dellevering kan ha delmengder. Ingen automatisk ombestilling/endringsordre etter revidert boligvalg når noe er bestilt; dette stopper for avklaring. Ingen forventet leverandørbekreftet dato, ekstern leverandørportal eller automatisk beboervarsling. Ønsket leveringsdato er en forespørsel, ikke en tildelt arbeidsfrist/ansvarlig; denne runden oppretter ingen automatiske fristvarsler. Eksisterende ansvarligvarsler er ikke endret.

Neste: faktisk fremdrift/sjekklister per bolig/rom, kundeaksept og avgrenset ekstern tilgang. Excel-import sist. Ingen Production uten relevant QA og Kenneths eksplisitte TEST OK.
