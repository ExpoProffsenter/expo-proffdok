# Demobilder – 4. november 2026

Miljømål: SANDBOX/DEMO. Kenneth ba uttrykkelig om å erstatte gamle demobilder.
Utgangspunkt demo fd5aafa17d0a6412bebc60b586e328d682393d8e.

## Endring
Erstatter 12 eksisterende filer under public/demo-images: fem JPEG-er og sju SVG-adresser. Bruker sju allerede godkjente, tydelig AI-merkede eksempelbilder fra DEMO – RESERVE. SVG-adressene inneholder samme JPEG i et SVG image-element. Ingen bildeendring eller ny generering. Badskisse.svg bevares.

Gamle JPEG-er kunne svare HTTP200 med image/jpeg uten å være gyldige JPEG-filer. Eksisterende kontrollpunktlenker beholdes; det er filinnholdet som repareres. Ingen database-, golden-, svar-, signatur-, pris-, tilgangs- eller e-postendring. Ingen main/Production-endring eller demo → main.

## Kontroll før publisering
Alle tolv filer er dekodet med PIL, inkludert JPEG inni SVG, og er 1200×800. Kilde er de sju fungerende bildene i RESERVE, som ikke endres. Diff skal kun inneholde disse tolv filene og denne dokumentasjonen/endringsposten.
Sandbox-build og publisert commit kontrolleres særskilt; se oppfølging.

## Tilbakeføring
Gjenopprett kun de tolv filene fra fd5aafa1 i en ny demo-commit. Ikke reset prosjektdata eller branch. Dette vil også gjeninnføre gamle ødelagte bilder og er derfor kun en teknisk tilbakeføringsmulighet.

## Avgrensning
Main-baserte previewer uten demo-overlay har fortsatt ikke relative /demo-images-filer. Denne rettingen gjelder permanent demo. Full PDF-kontroll er ikke attestert av fildekoding alene.

## Publisert og kontrollert
Bildefil-commit 3c3f804fd12aa7e64db87ed779c6ad53994ad753 er publisert READY på fast demovert (Vercel dpl_B9HbDDjbMvJcSZXqhHaa3QGaMnbV). Nettleseren viste slukmansjett.jpg som faktisk dekodet 1200×800, og befaring-for.svg viste nytt AI-merket bilde ved gammel adresse. Hele HOVED-data fortsatt md5 a32354ec299402ce6e4d70b1844742a0, RESERVE fortsatt 448e9f47a70c493781cbcb69b98f41b4. Main bekreftet uendret 34daef4c0526b93ddbd84c3bfd97fb0833d97caf. Ingen Actions-kjøring returnert for demo-commit ved kontroll; lokal Sandbox-build er grønn. Ingen ny innlogget prosjekt- eller PDF-attest i denne avgrensede bildefilrunden.
