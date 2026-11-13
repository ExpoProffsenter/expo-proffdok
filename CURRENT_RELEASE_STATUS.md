# Gjeldende leveransestatus – 13.11.2026

Miljømål BEGGE. Produksjon main f7298e118f672e0b261b8a0f3f95e6e2d4e5e657 og demo0984fe1c8a6284ae13909db6dc391a172689f2f9 er publisert READY etter PR324. Invitasjonsrettelsen er levert og demosynket; se [PR324](https://github.com/ExpoProffsenter/expo-proffdok/pull/324) for faktisk produksjonslogg. Ingen reell e-post sendt.

PR323 Orvei/logo4783fe64 bestod full QA43335383199. Denne arbeidsbranchen avstemmes nå mot publisert main, med ny samlet kontroll. Ingen Orvei-TEST OK eller produksjonsinstallasjon. PR322 support f64efcc8 bestod43326959905; companion PR320 siste43097043078 er fortsatt queued. Ingen ny køfeilsøking eller omgåelse. PR321 er separat teksthjelp, ikke ferdig film.

Se [Orvei QA](docs/qa/BOLIG_ORVEI_20261112.md), [branchregister](docs/qa/BRANCH_REGISTER_20261112.md) og [videoopptaksmanus](docs/qa/BOLIG_BATCH_VIDEO_20261113.md). Historikk nedenfor er ikke aktuell restliste.

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
