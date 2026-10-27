# Varebestilling – antall og Enter, 27.10.2026

Miljømål BEGGE. Baseline publisert main 0301c8e570557da79bb0a7d86b27fc80207a0eff. Samme arbeidsbranch og faste Preview gjenbrukes. Denne UX-rettelsen krever ny TEST OK før merge.

## Scope

Bare ProCatalogOrders, det nye dedikerte OrderCatalogLookup, lokal antallshjelper, modulens CSS og relevante tester/Hjelp/docs. Ingen endring i hovednavigasjon, autentisering, tilgangshook, server, migrasjoner, Edge Functions, mailmal, eksportører, priser, tilbud/kundeaksept/PDF, intern Prissøk/plukkliste, Bolig eller rutine-e-post.

## Ønsket brukerflyt

Velg en vare → antall får fokus og markeres → skriv antall eller bruk +/− / pil opp/ned → Enter åpner et nytt søk rett under varelinjene → skriv søk og trykk Enter, eller velg et synlig treff → neste vares antall får fokus. Et nytt søk legger ikke til en tom produktlinje. Ugyldig antall stopper i feltet. Norsk desimalkomma og eksisterende grenser beholdes. Sendt/usikkert sendeforsøk er låst.

Søk avviser sene svar ved nytt søkeord eller unmount. Tidlige Enter-tastetrykk henter gjeldende søk og velger første treff. Tidligere treff ryddes straks ved nytt søkeord. Fokus flyttes bare ved en uttrykkelig varehandling, uten nye globale recovery-timere.

## Verifikasjon

Lokale grenseprøver: ugyldig/null/negativt/over maks og for mange desimaler avvises. Pluss/minus bevarer tusendeler uten flyttallsstøy; minus ved én/lavere gir ikke null, og pluss krysser ikke maks. Faktisk Chromium-regresjon tester komponenter/hooks, meny/snarvei, begge brukergrupper, 390/1366 px, pluss/minus/piltaster, fokus, rask Enter før søkesvar, flere varer, ingen tomlinje, ugyldig antall og eksisterende retry/reload/tilbakekalling. Status og faktisk innlogget skynettprøve føres i PR før leveranse.

## Reell Production-testmail på brukerens konkrete bestilling

Kenneth ba uttrykkelig om å få en test sendt til sin e-post. Agenten logget inn gjennom sikker browserAuth i faktisk Production som kenneth@ringside.no, valgte én faktisk katalogvare (2 × Sopro DFX lightbeige, varenr. 6HJ5602903), mottaker Kenneth Skogsrud / kenneth@ringside.no og referanse TEST 27.10.2026 – SKAL IKKE LEVERES. Adresse og merknad presiserer at dette ikke er en reell varebestilling, og at ingen varer skal leveres eller faktureres.

Faktisk Se over bestillingen bekreftet riktig avsenderfirma, mottaker, prisfrie varer/antall og begge vedlegg. Send bestilling ble trykket én gang i den innloggede skynettleseren. Faktisk Production-kvittering viste Bestillingen er sendt og e-posttjenestens bekreftelse til kenneth@ringside.no. Ingen retry eller andre mottakere. Skjermbilde av faktisk kvittering er tatt. Dette dokumenterer provider-aksept og lagret kvittering; mottak i innboksen og mottakerens kontroll av vedlegg/layout må fortsatt bekreftes av Kenneth. Ingen reell mail er sendt fra Preview/Sandbox.


## Godkjent release og verifikasjon

Kenneth ga ny TEST OK etter faktisk innlogget skynettprøve av publisert Preview. Kandidat `bbe67f1a1a880732ed80d8ee793ed75aece36786`, tre `aa55630f135822e0be7d6b406986457570777573`. Full PR Core Safety #731 / 40585298385 COMPLETED SUCCESS, alle åtte pakker og sluttkontrollen. Preview `dpl_J1GLQ547GuN2bQMM1YJUjPSRbVCP` READY på samme kandidat.

Faktisk Preview som dedikert demobruker: menyrekkefølge og Prissøk-snarvei; pluss/minus 2,5 → 3,5 → 2,5; Enter åpner/fokuserer neste søk; tidlig Enter velger samme vare uten duplikat; neste vare får antallsfokus; pil opp øker; 0 + Enter gir forståelig feil uten tomlinje; gyldig 2,5 fjerner feilen. Full reload går til Startside; ved gjenåpning er begge kladdelinjer/antall bevart. Kun testens ekstra linje fjernet; eksisterende kladd tilbake til opprinnelig antall. Ingen sending eller lagret mottaker. Automatiske Chromium-prøver dekker 390/1366 px og begge brukergrupper; manuell live-prøve gjelder desktop internbruker, ikke fysisk Safari/mobil eller separat proffkundeøkt.

Produksjonsmerge `a31c0673ba917a677954dc94bfd5ead0dbd0471f` har eksakt samme tre som grønn kandidat. Vercel `dpl_FVLJFLV6UJtwQ6NZ8wW9F3dbqFgZ` READY på eksakt SHA og https://expo-proffdok.app/. Lokal full critical/Production-build PASS. Faktisk HTTP200, hovedapp og ProCatalogOrders er byteidentiske med lokal build; hovedappen har kun Production-binding. Levert ordrekomponent SHA256 `b905f09fec008c282c7477da693352a8092796bf0d2b33e03d7bb8cbf0137f30`. Innlogget Production som Kenneth viser de nye kontroller og den tidligere sendte testordren med bevart kvittering og låste antallsknapper. Ingen ny bestilling, sending, database- eller konfigurasjonsendring i releasen.

Tilbakeføring: foregående Production `dpl_32vFTWECxNM2y4tBpxSkhe24oSpB`, main `0301c8e570557da79bb0a7d86b27fc80207a0eff`. Frontendrollback alene; eksisterende ordredata og backend bevares. Kontrollert main → demo med bevaret overlay og ny preflight fullføres etter publisert dokumentasjonsoppfølging. Faktisk gjeldende demo-SHA, deployment og sluttstatus føres i PR292, så denne historiske rekkefølgen ikke må tolkes som en utestående handling etter closeout.
