# Befaring per bolig i Aamodthagen

Status: eksisterende flyt og tilgang kartlagt. Funksjonen er ikke implementert eller aktivert. Arbeidsbranch `fase45b-bolig-befaring-orvei` fra main `85c36ef2`. Miljømål BEGGE.

## Første leveranse

- Legg til Befaring på den valgte boligen i Boligprosjekter. Gjenbruk befaringsnotatet fra Tilbud med kundens ønsker, eksisterende forhold, målinger, observasjoner, bilder og Badskisse. Gjenbruk planleggingens felt for dato, tidspunkt og ansvarlig der de passer med boligprosjektets fremdrift.
- Lagre per bolig-ID i prosjektet. Bruk et eget adapterlag for lagring og kladd. Den eksisterende editoren i `src/modules/sales/components/SalesInspectionNote.jsx` skal fortsatt fungere for eksisterende tilbud. Kontroller spesielt gjenoppretting ved gjenåpning og enhetsbytte, siden redigerbar skisse i dag ligger i lokal lagring, mens skissebildet lagres med befaringsbildene.
- Butikkansatt åpner lagret befaring fra den valgte boligen i **Min side → Mine boligprosjekter**, med notat, bilder og visning av Badskisse. Første leveranse gir lesetilgang. Bevar aktivt arbeidsfirma. Ulagrede kladder vises bare for den som jobber med dem.
- Gjenbruk aktiv personlig butikktilgang, inkludert kontroll av utløp og tilbakekalling. Avgrens begge leseveier på serveren til samme prosjekt og bolig. Dette gjelder også direkte medietilgang. Bruk privat medielagring. Knytt skisse, bilder og notat til samme lagrede revisjon, og behold kladden ved konflikt.
- Start med Aamodthagen boligsameie hos Tore Orvei AS etter Sandbox-test og produksjonsgodkjenning. Historikk om aktivt prosjekt og personlig butikktilgang finnes i [Orvei-importen](ORVEI_PRODUCTION_IMPORT_20261114.md). Bekreft gjeldende tilgang på nytt, uten å kjøre importen om igjen. Prosjektleder skal kunne aktivere befaring uten å opprette nye tilbudssaker per bolig.

## Gjennomføring og test

1. Integrer editoren via boligens oppgavekort i `BoligEntry.jsx` / `BoligUnitTasks.jsx`. Integrer butikkvisningen i `BoligMyCollaborations.jsx`. Bruk samme tilgangsgrunnlag som `bolig_private.my_collaborations` for personlig butikktilgang.
2. Test i Sandbox med syntetisk bolig. Tegn en skisse, legg til et bilde, lagre og åpne på nytt. Kontroller innhold som butikkansatt og bytt mellom to boliger. Test avslag for utløpt/tilbakekalt butikktilgang, feil prosjekt/bolig og butikkforsøk på skriving. Kontroller eksisterende Befaring/Tilbud.
3. Kjør CI og Skynett i Sandbox. Før produksjon: dokumenter test, eksakt migrering og tilbakeføring, og innhent TEST OK. Verifiser produksjon og Orvei-tilgang, og synk demo.
