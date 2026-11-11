# Kundens varesøk – 11. november 2026

Arbeidsbranch fase45b-proff-search-company-ux-20261111, PR315. Miljømål BEGGE. Publisert i produksjon som4cbf31e1a4c4b4c0dd9c396c6d8cb8cd4df06f88. Endelig demosynk og firmatilgang følges i CURRENT_RELEASE_STATUS.md og PR316.

## Omfang
Varesøk viser treff og et eget varekort med metadata og kundens pris. Varevalg og Enter åpner informasjon; eksplisitt Legg i varebestilling legger til uten navigasjon. Antall og pris er tilgjengelig også i bestillingen. Treffrader får innholdsstyrt høyde. Smartere søk gjenbruker fagord, men ikke det interne prisendepunktet.

Boligaktivering på firmakortet er skilt ut til fix/company-bolig-access-20261111 for å bevare boligmodulens scope-kontroll. Supportvisning av varesøk lar administrator velge bruker og brukerens prisinnsyn på firmaets katalog, med samme varekort. Den er skrivebeskyttet og er ikke generell innlogging som kunden. Eksisterende prosjekt-supportmodus endres ikke i denne avgrensningen.

## Tester og grenser
Full critical/build bestått lokalt før siste supportjustering. SQL-test 14 krav bestått: fagord, eksakt varenummer, leverandøravgrensning, egne priser, tilbakekalt prisinnsyn, systemadmin-scope og anonym avvisning. Ingen innkjøpspris/margin returneres av nytt RPC. Nettleserregresjonen tester detaljkort, eksplisitt bestilling og uendret søkeside ved fire skjermbredder; må kjøres i CI fordi Chromium lokalt stoppet ved socket() Operation not permitted.

## Utført utrulling og kontroll
Full CI43066909920 og ready-for-review CI43068293489 bestod. GitHub avviste korrekt merge mens siste gate ventet; sperren ble ikke omgått. Samlet kode fra PR315/316 er i tillegg kontrollert med lokal full critical/build.

Migrasjonen20261111164011_pro_catalog_smart_search.sql er installert i permanent Sandbox ppvircenkjizeiqdxphj og Production dqffxflaoyarbxyiyhop etter miljø-, skjema- og rådgiverkontroll. Begge har tom search_path, security definer, authenticated execute og ingen anon execute. Klienten ble publisert etter RPC. Vercel dpl_6KocpoNRJ6HsWuRqTJsQP7P6fnua var READY på expo-proffdok.app med main4cbf31e1.

Read-only SQL med begge Tore Orvei-brukernes identitet bekreftet riktig pris, og smart/eksisterende søk ga samme kundepris. SKU02606 gir7 560kr eks. mva. Ingen interne prisfelt returneres. En kundebruker som forsøkte å velge annet supportfirma ble avvist42501. Ingen permanente identitets- eller tilgangsendringer.

Innlogget skynett-kontroll i Production: Systemadmin → Brukere og roller → Tore Orvei AS → Supportvisning av kundens varesøk. Valgt faktisk kunde, søk fly,19treff. Vare02606 viser egen pris7 560eks./9 450inkl., prisdato16.01.2026 og metadata. Alle19resultatrader uten overlapp/innholdsoverflyt, også lange navn. Enter åpner første vare uten navigasjon. Ingen bestillingsknapp i skrivebeskyttet support. Ingen ordre/e-post sendt, og ingen tilgangsvalg endret.

Tilbakeføring: revert klientcommit. Ny lesefunksjon kan bli stående uten klient; den erstatter ingen gammel funksjon. Ingen datamigrering eller prisendring.

Sandbox-preview ble også kontrollert innlogget med demo-bruker: fagordsøk sopro mansjett, lange fly-resultater, varekort, Enter og korrekt veiledende pris for en bruker uten eget prisinnsyn. Nettleserregresjonen bestod i CI på320/390/768/1366px, inkludert eksplisitt varetillegg, kundepris uten interne felt og lange resultatrader. Fysisk mobil/Safari og generell brukerovertakelse er ikke verifisert eller innført av denne leveransen.
