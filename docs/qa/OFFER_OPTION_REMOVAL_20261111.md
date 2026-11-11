# Opsjoner ved sletting av hovedpost – 11. november 2026

Miljømål BEGGE. Baseline main 58965d93. Arbeidsbranch fix/offer-orphan-options-20261111.

## Bekreftet årsak
removeProduct og removeInstallation satte nextOptions, men applyGroups rekalkulerte etterpå gamle options fra renderens closure. Dermed ble den tilsiktede endringen overskrevet i samme brukerhandling. standaloneOptions utelot samtidig opsjoner med en ikke-tom, men slettet storeParentProductId. Forhåndsvisningen viste dem fortsatt.

Skrivebeskyttet kontroll av Bademiljø Expo / F-2026-0044 bekreftet tre serverlagrede opsjoner: to uten eksisterende hovedpost, én med eksisterende hovedpost. Ingen tilbud, publisert versjon, vedlegg eller priser er endret. Andre firma har samme referansenummer og ble ikke forvekslet med denne saken.

## Rettelse og avgrensning
applyGroups tar eksplisitt nytt opsjonsutvalg ved sletting. Alle eksisterende opsjoner er synlige enten under hovedposten eller Andre opsjoner. Ingen automatisk opprydding av historiske data. Brukeren vurderer og fjerner uønskede oppføringer i editoren; publiserte versjoner endres bare gjennom vanlig tilbudsflyt.

## Verifisering
Fem regresjonskrav bruker de faktiske handlerfunksjonene og utvalgskoden. De beskytter sletting av hovedpost/tilhørende montering/opsjoner, avkobling av montering, direkte opsjonssletting og synlighet for eldre frakoblede opsjoner. Critical build og Preview/CI-status suppleres i PR.

Tilbakeføring: revert denne avgrensede frontend-committen. Ingen migrasjon eller datarollback.

## Boligprosjekter og testmiljø
Bolig bruker en separat katalog/valgmodell, uten tilbudsbyggerens applyGroups. Lokal boligdatabasekontroll bestod 1758 krav; boligkatalogens React-kontroll bestod (tilvalg, erstatning, prisfradrag, lagret varegrunnlag, konflikt- og firmaskille). En ekstra regresjon tester eksplisitt arkivering og nyoppretting av tilvalg og at lagret kundevalg bare inneholder det nye tilvalget.

Første CI-kjøring 43061797488 stoppet nettleserjobbene i installasjon: ubuntu-latest ble Ubuntu 26.04, som låst Playwright 1.58.2 ikke støtter. PR Core Safety låses til Ubuntu 24.04; alle 147 opprinnelige testinvokasjoner beholdes. Ingen appavhengighet endres. Ny CI må bestå før merge.
