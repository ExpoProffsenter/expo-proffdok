# Avtaleoversikt og synlig svarfrist – 25. oktober 2026

Miljømål BEGGE. Kun eksisterende feature-Preview/Sandbox. Kenneth har satt
Excel-import på vent og bedt om stabilitet/polering. Ingen produksjonsmerge,
migrasjon, e-postaktivering, utsending eller endret bestillingsregel.

## Påvist misvisende tomtilstand

På b9c9a788 var siste utløpte boligavtale bare i historikken. Oversikten skrev
«Ingen boligavtale er klargjort ennå». Dette var feil når avtalen faktisk hadde
vært delt. Ny før-/etterprøve feilet på denne baseline med undefined i stedet
for siste utløpte avtale.

Siste utløpte boligavtale vises nå én gang under «Siste boligavtale · svarfrist
utløpt». Tidligere utgaver blir i historikken. Prosjektleder får konkret neste
handling: åpne avtalen og velge «Lag ny utgave» hvis en ny frist avtales. Lesere
får ingen instruksjon om en handling de ikke kan utføre. Hvis bare tilbaketrukne
eller avslåtte avtaler finnes, sier teksten «Ingen aktiv boligavtale» og viser
til historikken.

En akseptert avtale har fortsatt prioritet. Aktiv kladd/delt utgave har prioritet
over utløpt historikk. En nyere tilbakekalt utgave henter ikke frem en eldre
utløpt avtale igjen. Gamle utgaver blir aldri publisert på nytt eller forlenget
automatisk. Ny kladd bruker samme avtalerekke og får egen foreslått svarfrist.

## Beboerens frist

Svarfristen er flyttet fra liten bunntekst til en tydelig ramme før navn og svar.
Den vises også ved bekreftelsen av svaret. Dato og norsk tid bruker samme helper
som før. Konsekvensen står i samme ramme: etter fristen må beboeren kontakte
prosjektleder. Serverens aksept-/fristkontroll og lagret avtaleinnhold er uendret.

## Avgrensning og verifikasjon

Produktendring: BoligCommerce, boligCommerceCore, BoligResidentPage og avgrenset
resident-CSS. To eksisterende Bolig-scenariofiler får permanente regresjoner.
Ingen globale komponenter, andre moduler, gamle migrasjoner eller critical-checker
endres. Portal bruker samme oversiktshelper; dagens serverprojeksjon filtrerer
fortsatt ut utløpte, ubesvarte avtaler, og portalens eksisterende flyt er testet.

- 21 eksport-/oversiktsassertions PASS, inkludert fem nye prioriteringsscenarioer.
- 89 avtale-/nettleserassertions PASS. Utløpt avtale vises én gang, eldre utgave
  blir i historikken, ny kladd beholder avtalerekken, og ingen gammel lenke
  publiseres eller forlenges i bakgrunnen. Fokus/kladd, trestegs retry, lesere,
  firmabytte, mobil og aksept etter utløp er fortsatt med.
- Nettleserprøven sjekker også at fristrammen ligger før beboerens skjema.
- Portal, full critical Sandbox-build og core-boundary kontrolleres separat.

Siste grønne samlede baseline er CI704 på b9c9a788. Nytt tree/HEAD, Preview READY
og siste CI-status avleses i PR278 etter publisering. Ingen samlet TEST OK er gitt.
