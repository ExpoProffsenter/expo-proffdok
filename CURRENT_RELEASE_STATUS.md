# Samlet status – 13. november 2026

Se [samlet leveranseoversikt](docs/qa/RELEASE_OVERVIEW_20261112.md) for bekreftet produksjonsversjon, ventende supportleveranse, nye Orvei-endringer og rettet sandbox-blokkering. Dette dokumentet ligger på arbeidsbranchen og innebærer ingen produksjonspublisering.

PR322 f64efcc8 har bestått full GitHub-kontroll43326959905. PR320 siste kontroll er fortsatt queued. Orvei-arbeidet har nå samlet portal-/fristbehandling i sandbox, ikke produksjon. Se [QA](docs/qa/BOLIG_ORVEI_20261112.md) og [branchregister](docs/qa/BRANCH_REGISTER_20261112.md).

# Produksjonsrettelser – 11. november 2026

Miljømål BEGGE. Arbeidet gjelder kundens varesøk, firmatilgang og opsjoner i generelle tilbud. Dette er ikke en erklæring om fullført QA av hele appen.

## Publisert og verifisert
- [PR314](https://github.com/ExpoProffsenter/expo-proffdok/pull/314): sletting av hovedpost bruker oppdatert opsjonsliste. Eldre frakoblede opsjoner vises under Andre opsjoner. Main6e60c1cb og demo3df9634b ble bekreftet READY. Full CI43062829574 bestod.
- [PR315](https://github.com/ExpoProffsenter/expo-proffdok/pull/315): kundens varekort, egne priser eks./inkl. mva., smartsøk og resultatlinjer uten overlapp. Valg/Enter åpner varekort; bestilling krever egen knapp. Skrivebeskyttet supportvisning finnes på kundens firmakort. Main4cbf31e1 ble bekreftet READY på https://expo-proffdok.app. Full CI43068293489 bestod.
- [PR316](https://github.com/ExpoProffsenter/expo-proffdok/pull/316): boligaktivering samlet på valgt firmakort. Full CI43070168307 bestod. Main573c1a6b er merged; publisert commit, fast domene og endelig demosynk/preflight dokumenteres med faktiske kontrollresultater i PR316.

## Testgrunnlag og avgrensninger
1763 boligdatabasekrav, boligkatalogens React-kontroll og full bolig-nettleserpakke består. Arkivert tilvalg kan ikke velges; nytt tilvalg lagres uten den gamle opsjonen. Bolig bruker en separat modell og deler ikke den feilaktige tilbudshandleren.

Kundesøkets14SQL-krav og nettleserregresjon på320/390/768/1366px består. Faktisk produksjonskontroll med Tore Orvei AS viser korrekt kundepris7 560eks./9 450inkl. mva. på02606, uten interne kalkylefelt, og Enter uten sidebytte. Andre firma kan ikke velges av kundebruker. Ingen prøveordre, invitasjon eller e-post er sendt.

Den additive lesefunksjonen search_pro_store_catalog_smart er installert og kontrollert i Production og permanent Sandbox. Ingen kundepriser, roller eller leverandøravtaler er endret. Supportvisningen gjelder varesøk; generell innlogging som kunden er ikke innført. Fysisk mobil/Safari er ikke kontrollert i denne leveransen.

## Saksbehandlerens gjenstående handling
I Bademiljø Expo F-2026-0044 er de to tidligere skjulte opsjonene nå synlige. Steffan må vurdere og fjerne uønskede oppføringer og følge vanlig publiseringsflyt. Ingen historiske opsjoner er automatisk slettet. Åpning av editoren under QA utløste normal autolagring; dette er uttrykkelig dokumentert.

## Dokumentasjon og tilbakeføring
Se [opsjonslogg](docs/qa/OFFER_OPTION_REMOVAL_20261111.md), [kundesøklogg](docs/qa/PROFF_CUSTOMER_SEARCH_20261111.md) og PR314–316 for eksakte publiseringsbevis. Tilbakefør en berørt klientendring med revert av aktuell PR; den additive søkefunksjonen kan stå ubrukt. Ingen datarollback er nødvendig. Demo synkroniseres fra publisert main med særtilpasningene bevart.
