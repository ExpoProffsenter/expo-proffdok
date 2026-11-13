# Orvei / Aamodthagen – komplett sandboximport 13.11.2026

Miljømål: SANDBOX/DEMO. Ingen appkode, migreringer, produksjonsdata eller e-postinnstillinger endret.

## Faktisk resultat
- Sandbox: `ppvircenkjizeiqdxphj`.
- Prosjekt: **QA – Aamodthagen – Orvei komplett**, root `df971415-1232-4199-8bd8-ce1e2246deaa`.
- 29 boligbygg, 126 leiligheter (seksjon 1–126), 151 eiere.
- Første eier i original Excel er hovedkontakt; 25 ekstra eiere beholdt som medeiere.
- 1 260 planlagte aktiviteter: 8 milepæler og én arbeidsperiode per bolig, pluss 126 grunnpakkemøter.
- Offisielle H-numre er tomme. Etasje/plass er foreløpig, fordelt på to etasjer, og må kontrolleres. Bygg/adresse og seksjon er kryssjekket mellom Excel og datoplanene.
- Eksisterende 22-boligers Aamodthagen-utkast og tidligere QA-prosjekter bevart.
- Ingen beboerportaler opprettet; ingen utsending. Begge sandboxtransportene (progress/resident_links) kontrollert deaktivert.
- Ansvarlig på planaktivitetene er sandboxens demoaktør, ikke en faktisk avtalt Orvei-ansvarlig. Alle aktiviteter er planlagt og ikke obligatoriske kontrollkrav.

## Kilder og tolkning
De to datodokumentene er komplementære: R01 dekker oppstart 1–17, R02 dekker 18–29 samt kontor/styrerom. Datoer per bolig kommer fra disse nyere novemberarkene; oktoberoversikten brukes som overordnet kontrollgrunnlag. Klokkeslett er bevart i aktivitetsnavn, mens appens planfelter lagrer dato.
Kontor/styrerom, overordnet rigg og fellesarbeid er ikke opprettet som fiktive beboerboliger.

| SHA-256 | Kilde |
| --- | --- |
| `e63fb97c0db249e93c2a57d4bbd0043d06baaa4f3f8f7ac2536e2530f06e1237` | Viktige datoer Aamodthagen BS-R01-11.11.26.pdf |
| `00de3ce01b38ccc387e9972a1775189ae113baed17c988fadbbdb32b880b2f65` | Viktige datoer Aamodthagen BS-R02-12.11.26.pdf |
| `893e5444e987261d2a7e43bfcba243f552958edfe2d1e1949f6f83dbb4603e0e` | Aamodthagen boligsameie-adresseliste beboere til Orvei, 14.10.2026.xlsx |
| `df12b3b78e8252fb356f9763298f6a113634069d238fa2cf35749f8fa61d4821` | Fremdriftsplan_Aamodthagen_131026.pdf |

## Verifisering
- Originalparser: alle seksjoner 1–126 finnes nøyaktig én gang i byggkartet; 151 kontakter fordelt etter original rekkefølge.
- Full readback: alle 126 seksjoner/adresser, primærkontakter og medeiere sammenlignet med importgrunnlaget.
- Seks primære e-postadresser normalisert til små bokstaver av eksisterende app; ingen semantiske avvik.
- Alle 1 256 aktivitets-ID-er, boligkoblinger, titler, ansvarlige, datoer og required-flagg sammenlignet mot grunnlaget.
- Import utført gjennom eksisterende autoriserte public RPC-er: create_plan, numbering, resident_import og fire progress batch-kall (350/350/350/206).
- Ingen direkte tabellskriving eller endring i RLS. Kvitterings-ID-er sikrer sporbarhet.
- UI: prosjektet åpnet i innlogget PR329 sandbox-preview, 126 boliger og 29 bygg bekreftet. Samlet Gantt viser 1 256 aktiviteter; søk på Granåsvegen 14 viser 40. Uke/måned og samlet tidslinje er kontrollert. Boligfilter 17 viser alle 10 aktiviteter og desemberdatoene 2., 8. og 18.12 korrekt. Skjermbilde tatt. Mobil, drag/lagring og beboerportal er ikke testet i denne importkontrollen.

## Avklaringer før produksjon
1. **Endelig avklart av Orvei via Kenneth 13.11:** Møtene for seksjon 113–116, Hans Rustads veg 2, skal være **tirsdag 8. juni 2027**, kl. 08.30–09.30, 10.00–11.00, 12.00–13.00 og 13.30–14.30. Dette erstatter tidligere antakelse om mandag 7. juni. Alle fire eksisterende aktiviteter er flyttet via progress batch (dates), uten duplikater. Readback bekrefter dato 2027-06-08 og ISO-ukedag 2 (tirsdag). Fremdriftsrevisjon 6. Original-PDF-en er uendret; Orveis avklaring skal brukes ved produksjonsimport.
2. Kontor/styrerom Aamodtterrassen 8 har avvik mellom oktoberoversikt og novemberark og feil oppstartsnummer i R02. Ikke tatt inn som bolig.
3. Bestillingsfrister er kl. 12.00 i kilden. Dette står i fremdriften, men er **ikke** satt som automatisk portalstenging. Gjeldende boligfristmodell må avklares/tilpasses før produksjon.
4. Faktiske etasjer/plasser og arbeidsansvarlige må bekreftes.
5. Grunnpakke, tilvalg, monteringsposter, portalaksept og ordreflyt skal testes med tydelig fiktive sandboxpakker før produksjonsimport. Kenneth lager de faktiske pakkene sammen med Orvei direkte i produksjon neste uke. Disse pakkene er derfor ikke en forutsetning for å overføre godkjent prosjektgrunnlag. Testpakker, testvalg og testbestillinger skal ikke overføres. Full beboertest gjenstår.
6. Kenneth skal gi TEST OK for prosjektgrunnlaget før produksjon. Kontroller målbedrift og eventuelt eksisterende produksjonsprosjekt før innlasting.

## Byggkart
| Oppstart | Bygg/adresse | Seksjoner |
| --- | --- | --- |
| 1 | Granåsvegen 14 | 17, 18, 19, 20 |
| 2 | Granåsvegen 10 | 83, 84, 85, 86 |
| 3 | Granåsvegen 12 | 87, 88, 89, 90 |
| 4 | Granåsvegen 8 | 79, 80, 81, 82 |
| 5 | Granåsvegen 6 | 75, 76, 77, 78 |
| 6 | Granåsvegen 4 | 71, 72, 73, 74 |
| 7 | Granåsvegen 2 | 67, 68, 69, 70 |
| 8 | Aamodtterrassen 21 | 45, 46, 47, 48 |
| 9 | Aamodtterrassen 19 | 41, 42, 43, 44 |
| 10 | Aamodtterrassen 17 | 37, 38, 39, 40 |
| 11 | Aamodtterrassen 15 | 33, 34, 35, 36 |
| 12 | Aamodtterrassen 13 | 29, 30, 31, 32 |
| 13 | Aamodtterrassen 11 | 25, 26, 27, 28 |
| 14 | Aamodtterrassen 9 | 21, 22, 23, 24 |
| 15 | Mor Sme's veg 2 | 53, 54, 55, 56 |
| 16 | Mor Sme's veg 5 | 63, 64, 65, 66 |
| 17 | Mor Sme's veg 3 | 57, 58, 59, 60, 61, 62 |
| 18 | Mor Sme's veg 1 | 49, 50, 51, 52 |
| 19 | Aamodtterrassen 7 | 13, 14, 15, 16 |
| 20 | Aamodtterrassen 5 | 7, 8, 9, 10, 11, 12 |
| 21 | Aamodtterrassen 3 | 1, 2, 3, 4, 5, 6 |
| 22 | Hans Rustads veg 1 | 109, 110, 111, 112 |
| 23 | Hans Rustads veg 2 | 113, 114, 115, 116 |
| 24 | Hans Rustads veg 3 | 117, 118, 119, 120, 121, 122 |
| 25 | Sundhagavegen 1 | 91, 92, 93, 94 |
| 26 | Sundhagavegen 2 A | 103, 104, 105, 106, 107, 108 |
| 27 | Sundhagavegen 2 B | 95, 96, 97, 98 |
| 28 | Sundhagavegen 2 C | 99, 100, 101, 102 |
| 29 | Utsiktsvegen 1 | 123, 124, 125, 126 |

## Videreføring / tilbakeføring
Dette er et nytt, separat sandboxprosjekt. Ved feil: stans videre bruk/import og behold prosjektet for kontroll; ikke slett eller nullstill eldre prosjekter. En korrigering skal bruke gjeldende revisjoner og eksisterende RPC-er.
Produksjon og demo-kode er uendret: main `6eb54148b3d61e318c5447810cdf89deab6afffa`, demo `d4fb727ad718776a70cf9c243e7d1d9915ef503e`.
Ingen beboernavn, e-postadresser, telefonnumre eller hemmelige lenker inngår i denne rapporten.

## Fiktive pakker og butikktilpasning – 13.11.2026
Kun sandboxdata; ingen appkode eller produksjonsendring.
- Eksisterende QA-pakker undersøkt. Ny prosjektfelles **TEST – Orvei grunnpakke (fiktiv)**, ID `7a55a150-b054-4d8c-a52e-37f35beb7204`, med remontering, standard veggskål og fliseksempel. Innhold og priser er syntetiske, ikke avtalt Orvei-leveranse.
- Tre felles tilvalg opprettet: oppgradert veggskål, speil med lys, ekstra montering.
- Rommal med Bad – TEST og grunnpakken forhåndsvist: 126 ready. Lagret gjennom bolig_prepare: 126 berørte boliger. Felles katalogrevisjon 4.
- Bolig 38 i dette prosjektet (ikke det tidligere QA-prosjektets bolig 38) fikk alle tre tilvalg. Veggskål 3 500 minus standardfratrekk 2 000 + speil 2 500 + montering 1 500 = 5 500 kr.
- Individuell butikktilpasning: knagg 300 kr lagt til med bolig_unit_customization. Total 5 800 kr, valgversjon 3.
- Readback: 125 andre boliger har fortsatt valgversjon 1 og tillegg 0; kun bolig 38 har versjon 3 og tillegg 580000 øre. Felles grunnpakke er fortsatt én katalogpakke; boligene har egne lagrede versjoner.
- Bestillingsutkast på bolig 38 lagret med veggskål, speil og knagg. Remontering, ekstra montering og flis fra ekstern leverandør ble valgt bort fra denne varebestillingen. Ingen bestilling sendt.
- Viktig brukerflyt: foreslåtte bestillingslinjer omfatter alle seks linjer, også arbeid. Saksbehandler må derfor kontrollere hva som faktisk skal bestilles fra leverandør.
- Dette er server-/lagringstester gjennom appens eksisterende autoriserte RPC-er. Innlogget UI-kontroll av det nye pakkeoppsettet, beboerens portalaksept, deling mellom eiere og friststenging gjenstår; produksjonsgrunnlaget er ikke ferdig godkjent.
- Testpakker, rommalen Bad – TEST, testvalg og testbestillinger skal ikke kopieres til produksjon. Kenneth oppretter faktiske pakker med Orvei der neste uke.
