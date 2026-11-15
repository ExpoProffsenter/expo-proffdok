# Befaring per bolig

Befaring er avgrenset til aktiv bolig og boligprosjekt. Prosjektleder lagrer tidspunkt, ansvarlig, befaringsfelter, Badskisse-geometri og mediereferanser med en revisjon i `bolig_private.unit_inspections`. Nettleserkladden er avgrenset til bruker, firma, prosjekt og bolig. En revisjonskonflikt beholder kladden.

Bilder ligger i den private bøtten `bolig-inspection-photos` med prosjekt- og bolig-ID i banen. Serveren kontrollerer at hvert bilde tilhører boligen før det lagres på notatet. Ved nedlasting sjekkes aktiv tilgang og at bildet finnes i gjeldende befaring. Bare prosjektleder kan laste opp. Urefererte bilder har ingen lesetilgang i appen og blir liggende privat inntil en separat lagringsopprydding. Beboer- og UE-portaler får ingen ny inngang.

En aktiv personlig butikktilgang gir lesetilgang til lagret befaring i tildelt prosjekt. Utvidet Min side og profilvisning bruker samme kontobundne prosjektliste. Butikk kan ikke lagre befaring eller lese en usikret kladd. Tilbakekalling eller utløp fjerner servertilgangen til notat og bilder.

Prosjektmaler inneholder bare Badskisse-geometri. Prosjektleder oppretter og leser maler for valgt, tilgjengelig prosjekt. Kopien blir en del av boligens kladd. Senere redigering av kopien endrer ikke malen eller andre boliger.

Produksjonssetting krever først `bolig_inspection`, deretter `bolig_inspection_sketch_templates`. Ved tilbakeføring kan appen rulles tilbake, med tabeller og private filer bevart.
