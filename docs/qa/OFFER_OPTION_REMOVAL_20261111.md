# Opsjoner ved sletting av hovedpost – 11. november 2026

Miljømål BEGGE. Baseline main 58965d93. Arbeidsbranch fix/offer-orphan-options-20261111.

## Bekreftet årsak
removeProduct og removeInstallation satte nextOptions, men applyGroups rekalkulerte etterpå gamle options fra renderens closure. Dermed ble den tilsiktede endringen overskrevet i samme brukerhandling. standaloneOptions utelot samtidig opsjoner med en ikke-tom, men slettet storeParentProductId. Forhåndsvisningen viste dem fortsatt.

Read-only SQL av Bademiljø Expo / F-2026-0044 bekreftet tre serverlagrede opsjoner: to uten eksisterende hovedpost, én med eksisterende hovedpost. Ved senere åpning av editoren i produksjonsnettleseren kjørte appens normale initialisering/autolagring, og updated_at ble oppdatert 17:08:13.689 UTC. Ingen felt ble manuelt endret, ingen opsjoner slettet, ingen publisering eller e-post utført. Tre opsjoner og observert tilbudssum var uendret. Andre firma har samme referansenummer og ble ikke forvekslet med denne saken. Presisering er også logget i PR314, kommentar6802495052.

## Rettelse og avgrensning
applyGroups tar eksplisitt nytt opsjonsutvalg ved sletting. Alle eksisterende opsjoner er synlige enten under hovedposten eller Andre opsjoner. Ingen automatisk opprydding av historiske data. Brukeren vurderer og fjerner uønskede oppføringer i editoren; publiserte versjoner endres bare gjennom vanlig tilbudsflyt.

## Verifisering
Fem regresjonskrav bruker de faktiske handlerfunksjonene og utvalgskoden. De beskytter sletting av hovedpost/tilhørende montering/opsjoner, avkobling av montering, direkte opsjonssletting og synlighet for eldre frakoblede opsjoner. Critical build og Preview/CI-status suppleres i PR.

Tilbakeføring: revert denne avgrensede frontend-committen. Ingen migrasjon eller datarollback.

## Boligprosjekter og testmiljø
Bolig bruker en separat katalog/valgmodell, uten tilbudsbyggerens applyGroups. Lokal boligdatabasekontroll bestod 1758 krav; boligkatalogens React-kontroll bestod (tilvalg, erstatning, prisfradrag, lagret varegrunnlag, konflikt- og firmaskille). En ekstra regresjon tester eksplisitt arkivering og nyoppretting av tilvalg og at lagret kundevalg bare inneholder det nye tilvalget.

Første CI-kjøring 43061797488 stoppet nettleserjobbene i installasjon: ubuntu-latest ble Ubuntu 26.04, som låst Playwright 1.58.2 ikke støtter. PR Core Safety er låst til Ubuntu 24.04; alle 147 opprinnelige testinvokasjoner beholdes. Ingen appavhengighet er endret. Full CI43062829574 bestod, inkludert 1763 boligdatabasekrav og bolig-nettlesertester.

## Publisert og kontrollert
PR314 er merged som main6e60c1cb1c1a08255755af343310a981e2506f33. Production dpl_5cN1yiSj6iHxmPCiEukgij1ZyXrs var READY på expo-proffdok.app med samme SHA. De to frakoblede opsjonene var synlige under Andre opsjoner i den faktiske saken. Historiske opsjoner er ikke automatisk slettet; saksbehandler må vurdere dem og bruke vanlig publiseringsflyt.

Demo ble synkronisert som3df9634b4ac9dd2fa07cda67af0e214461898aa4 med overlay bevart, READY dpl_85FvXt51cKydn4xaNWmKrBKY2K3X på fast demo-host. Demo critical/build og kontrollside bestod; Sandbox-preflight hadde19grønne punkter. Senere kundesøk/firmatilgang følges i PR315/316 og CURRENT_RELEASE_STATUS.md.
