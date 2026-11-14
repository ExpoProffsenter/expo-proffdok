# Orvei – butikk- og portalkontroll 13.11.2026

Miljømål SANDBOX/DEMO. Main 6eb54148b3d61e318c5447810cdf89deab6afffa uendret. Ingen e-post, produksjonsdata eller varige portalendringer.

## Innlogget UI
- Komplett Aamodthagen-testprosjekt: bolig 38 viser TEST-grunnpakken, seks varelinjer, individuell knagg og 5 800 kr inkl. mva.
- Tilpass denne leiligheten åpner med varekatalog, legg til varelinje, antall, prisjustering og begrunnelse. Teksten presiserer at endringen gjelder bare boligen.
- Tidligere syntetisk QA-prosjekt 6dd4a9b9-be93-4428-b060-5cdb74157607, bolig 38: eksisterende portal har to alternativer, standardbad 0 kr og standardbad med speil/lys 2 500 kr. Ingen tilgang fornyet i UI.
- Skjermbilde: orvei-portal-testvalg.jpg. Nettleserprøve utført på fast PR329-preview knyttet til sandbox.

## Serverprøve med ROLLBACK
Eksisterende syntetisk testbolig, ikke faktisk Orvei-beboer. Kall går gjennom public RPC-er under authenticated og anon.
- Første forsøk ble korrekt avvist fordi eksisterende portalalternativer hadde eldre valgversjon. Ingen endring lagret.
- Tilpasset prøve klargjorde ferskt alternativ gjennom eksisterende RPC-er inne i transaksjonen.
- Anonym portal GET og innsending av valg: PASS.
- Eksakt gjentatt innsending: PASS, bare én ny hendelse.
- Ny innsending mens et valg venter: korrekt PT409.
- Prosjektleders forsøk på å bruke nytt valg direkte over en eksisterende akseptert avtale: korrekt PT409, krever endringsavtale.
- Hele transaksjonen rullet tilbake. Etterkontroll: portalrevisjon 6, menyversjon 2, to alternativer, null ventende valg, opprinnelig tilgang bevart.
- Den eksisterende aksepterte avtalen ble observert, ikke nyakseptert av agenten.

## Gjenstår før produksjon
- Bestillingsfrist er date og stenger ved (choice_deadline + 1) kl.00 Europe/Oslo. Orvei krever kl.12.00. Eget avgrenset app-/backendarbeid med regresjonstester og TEST OK kreves før fristene aktiveres.
- Full offentlig nettleserprøve av valg/aksept og to eiere, mobil og endringsavtale er ikke gjennomført i denne runden.
- Fullstendig prosjekt kan etter godkjente tester overføres uten testpakker/testvalg/testbestillinger. Kenneth lager faktiske pakker i produksjon med Orvei.
