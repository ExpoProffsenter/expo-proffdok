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
