## Supportkandidat 11.11 – ikke produksjonssatt
PR319 + PR320. Sandbox-only testaktivering. Faktisk Sales-lagring/redigering/reload og PDF Storage-opplasting/lesing bekreftet. Bolig create/update/archive-fence kontrollert gjennom native RPC i rollback-transaksjon. 78 lokale SQL-krav består. Se docs/qa/SUPPORT_APP_UX_20261111.md for kandidat, begrensninger og nyeste CI; docs/architecture/APP_SUPPORT_SESSION.md for produksjons-/rollback-plan. TEST OK er ikke gitt.

# Produksjonsrettelser – 11. november 2026

## Pågående, ikke publisert: samlet supportmodus

[PR319](https://github.com/ExpoProffsenter/expo-proffdok/pull/319) er draft. Fullapp-oppstart, kundens Auth-visning, separate kladder/IndexedDB, Storage-policyadapter og kontraktfiladapter er implementert, men samlet innlogget sandbox-test gjenstår. 67 SQL-krav, 45 runtimekrav, Auth/cache-scenarioer, 25 kontraktfilkrav og begge lokale miljøbygg består. Tre migrasjoner er installert deaktivert i Sandbox; ingen hook/aktivering i Production, ingen TEST OK. Se [gjeldende QA](docs/qa/SUPPORT_APP_UX_20261111.md). Main og demo er uendret.

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
