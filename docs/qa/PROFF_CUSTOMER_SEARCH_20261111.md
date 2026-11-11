# Kundens varesøk – 11. november 2026

Arbeidsbranch fase45b-proff-search-company-ux-20261111. Miljømål BEGGE. Baseline 58965d93. Ikke produksjonssatt.

## Omfang
Varesøk viser treff og et eget varekort med metadata og kundens pris. Varevalg og Enter åpner informasjon; eksplisitt Legg i varebestilling legger til uten navigasjon. Antall og pris er tilgjengelig også i bestillingen. Treffrader får innholdsstyrt høyde. Smartere søk gjenbruker fagord, men ikke det interne prisendepunktet.

Firmakortet inkluderer boligaktivering, slik at administrator slipper separat side for dette. Supportvisning av varesøk lar administrator velge bruker og brukerens prisinnsyn på firmaets katalog, med samme varekort. Den er skrivebeskyttet og er ikke generell innlogging som kunden. Eksisterende prosjekt-supportmodus endres ikke i denne avgrensningen.

## Tester og grenser
Full critical/build bestått lokalt før siste supportjustering. SQL-test 14 krav bestått: fagord, eksakt varenummer, leverandøravgrensning, egne priser, tilbakekalt prisinnsyn, systemadmin-scope og anonym avvisning. Ingen innkjøpspris/margin returneres av nytt RPC. Nettleserregresjonen tester detaljkort, eksplisitt bestilling og uendret søkeside ved fire skjermbredder; må kjøres i CI fordi Chromium lokalt stoppet ved socket() Operation not permitted.

## Utrulling – ikke utført
Installer 20261111164011_pro_catalog_smart_search.sql i permanent Sandbox etter kontroll av prosjekt og eksisterende funksjon. Kjør faktisk UI-test i korrekt Preview. Kontroller komplett CI og migrasjonens eksisterende status i Production før eventuell installasjon der. Ingen utsending til reelle mottakere i test. Publiser klienten først etter at RPC finnes. Synk main til demo med overlay bevart.

Tilbakeføring: revert klientcommit. Ny lesefunksjon kan bli stående uten klient; den erstatter ingen gammel funksjon. Ingen datamigrering eller prisendring.

Sandbox ppvircenkjizeiqdxphj: additiv search_pro_store_catalog_smart installert 11.11 etter skjema- og rådgiverkontroll. Fast tom search_path, authenticated execute og ingen anon execute bekreftet. Produksjonsmigrasjon ikke utført. Siste lokal build/critical bestått også etter supportjusteringen.
