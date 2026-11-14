# Beboerportal: komplett bad mot vanlige tilbud – 14.11.2026

Miljømål: SANDBOX/DEMO. Oppdrag: selvstendig realistisk UX-test mens systemeier er borte.
Appkandidat PR333: 5249cf0bbe88a81f4d65f90ac36c31621ea8ca0b.
Fast preview: https://expo-proffdok-git-feat-bolig-partner-commerce-20261113-ringside.vercel.app/?progressTest=safe
Sandbox: ppvircenkjizeiqdxphj. Main/produksjon uendret. Ingen appkode eller tilgangsregler endret i denne testen.

## Konklusjon
Den tidligere testen med én vare skjulte reelle begrensninger. Flere varer gjør ikke automatisk beboerportalen lik ordinære tilbud. Eksisterende flyt virker for ferdige pakkealternativer, men er ikke tilstrekkelig som selvbetjent kombinasjon av utstyr, fliser og elektro. Ikke betrakt den utvidede beboer-UX-en som godkjent for dette brukstilfellet.

## Syntetisk prøveoppsett
Nytt prosjekt: QA – Komplett bad og tilvalg 14.11, referanse QA-FULL-PORTAL-20261114.
Én bolig H0101; kontakt qa-full-portal@example.invalid. Eksisterende Kenneth-mailtest ble ikke endret.
Grunnpakke: servantskap60cm, batteri, dusjvegger, toalett, gulvflis8m², veggflis24m², tak-/speillys og standard montering. Åtte poster. Testpriser, ikke kommersielle produktpriser.
Bilde-URL ble satt på grunnpakkevare og to alternativer, med eksisterende auth-bathroom.jpg som tydelig testillustrasjon, ikke produktfoto.

| Alternativ | Beregning inkl. mva. | Forventet og faktisk |
| --- | --- | --- |
| Grunnpakke | Inkludert | 0 kr tillegg |
| Eikeskap80cm + ekstra montering | 8500 − 5000 grunnfradrag + 1500 montering | 5000 kr |
| Større gulvflis | 5600 − 3200 grunnfradrag | 2400 kr |
| To ekstra downlights inkl. montering | Samlet tilvalgspris | 4200 kr |
| Alle oppgraderinger samlet | 5000 + 2400 + 4200 | 11600 kr |

Opprettet gjennom eksisterende autentiserte bolig-RPC-er; ingen DDL, direkte tilgangsutvidelse eller nye migrasjoner.

## Faktiske kontroller
1. Åpnet reell publisert portal fra PR333-preview, fem pakkealternativer og riktig bolig.
2. Valgte eikeskap, deretter ekstra lys. Bare lys sto valgt; eikeskap ble avvalgt. Dette er faktisk radio-/ett-pakkevalg, ikke uavhengige tilvalg.
3. Utvidet grunnpakke og elektro. Riktig navn, SKU, mengde/enhet; grunnvarene gjentas i hvert komplett alternativ. Ingen produktbilder rendres i valgkortene (DOM-antall0), selv med bildegrunnlag. Kildekontroll av BoligPortalPage bekrefter tekstliste uten bildemapping.
4. Valgte forberedt samlepakke og skrev syntetisk merknad. Hent siste status bevarte valg og tekst. Se over valget viste11600kr.
5. Send valg til gjennomgang ga tydelig kvittering. Ekte manager-RPC viste nøyaktig én pending request, samme total1160000øre. Full omlasting beholdt valgt pakke og innsendt merknad.
6. Ingen avtale ble opprettet/akseptert. DB-kontroll: commercial_documents0 og resident_link_mail0 for testprosjektet. Global residentmail er fortsatt pauset.
7. Desktop1363px: dokumentbredde1348px. Smal CSS-visning via nettleserzoom545px/doc539px og340px/doc337px: ingen horisontal overflow. Dette er ikke fysisk mobil/Safari eller touch-test. Lange åpne varekort krever mye vertikal scrolling.
8. Meldinger var avslått. Mine valg sier likevel «Send en melding hvis du ønsker å endre det». Meldinger-fanen forklarer korrekt at funksjonen er av og tilbyr e-postkontakt. Veiledningen bør følge faktisk aktivering.
9. «Se innsendte valg» aktiverer Mine valg, men førte ikke direkte ned til kvitteringen ved den observerte smale visningen. Test målrettet fokus/scroll i oppfølgingsendringen.
10. Åpnet eksisterende DEMO-03-TILBUD via Befaring/Tilbud → Se kundens tilbud. Reell kundeside viser faggrupper, individuelle opsjoner, prisforklaringer, monteringsposter, bilde-/større-bilde-lenke og totalsammendrag. Tilbudet var utløpt og opsjoner deaktivert; ingen aksept/ny publisering eller interaktiv prisendring ble utført der. Sammenligningen er visuell og kildebasert, ikke ny end-to-end-test av tilbudsaksept.

## Prioriterte funn
- Høy: uavhengige ønsker kan ikke kombineres av beboer. Manuelt forhåndsoppsett av kombinasjoner skalerer dårlig og gjør butikkarbeidet unødvendig tungt.
- Høy: bilder, hva som erstattes, grunnfradrag og eventuell monteringspris er ikke tydelig presentert i valglisten. Riktig sluttsum alene forklarer ikke hva kunden kjøper.
- Middels: grunnpakke fremstår som enda et radiovalg med «Tilvalg:0kr»; ønsket tydelige «Dette er inkludert»-seksjon mangler.
- Middels: hele grunnlisten gjentas i hver pakke. Ingen oversiktlig sortering av uavhengige valg under Utstyr/Fliser/Elektro i denne flyten.
- Middels: sendingskvittering og endringsveiledning bør ha direkte navigasjon og følge om meldinger er aktivert.

## Konkret neste implementering
Avgrens til beboerportalens valgvisning og nødvendig validert prosjektbundet kombinasjonsmodell. Bevar vanlig tilbudsmodul og eksisterende butikktillegg/aksept.
Vis grunnpakken én gang med bilder og mengder. Grupper alternativer per fag/produkt; bruk ett valg innen gjensidig utelukkende erstatninger og uavhengige avkrysninger for tillegg. Vis «erstatter», fradrag, varetillegg, montering og samlet tillegg inkl. mva. Sammenlign bilder og spesifikasjon før innsending.
Dette kan ikke løses trygt bare ved å bytte radio til checkbox: dagens server mottar ett offer_id med ferdig snapshot. Kombinasjoner må valideres på server med tillatte valg, konflikter/avhengigheter, pris, frist, revisjon og eksakt retry. Beboerønske og bindende avtale må fortsatt skilles.

Gjenbruk dette testprosjektet i neste retest. Kontroller utstyr+lys uten fliser, fliser alene, alle, tilbake til standard, alternativbytte med fradrag, avhengig montering, endret pris under åpen side, frist, tilbakekalt lenke og akseptert historikk. Sammenlign også mobilhandlinger og fokus.
Ingen produksjonssetting før UX-rettelsen er vurdert/testet og systemeier har gitt TEST OK. Historikken og den syntetiske testen beholdes; ingen hemmelige portallenker/token lagres i GitHub.
