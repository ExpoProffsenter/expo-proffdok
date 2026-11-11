# Supportmodus: UX-feil og utvidet produktkrav – 11.11.2026

Miljømål BEGGE. Arbeidsbranch `fix/support-project-sales-20261111` fra main `d68cf2e530d5ab6afcfe2f97d75150c977bcd64f`. Ikke TEST OK, ikke produksjonssatt.

## Systemeiers avklarte krav

Support skal velge en konkret kunde-/firmabruker og se vedkommendes faktiske app, startside, menyer, moduler og egne priser. Tilbake fra et prosjekt skal gå til firmaets startside uten å avslutte support. Bare Avslutt supportmodus skal gjenopprette supportaktørens egen app. Systemeier har eksplisitt valgt **også redigere**, i tillegg til lesing og opprettelse. Sletting skal være sperret. Endringer skal spores til faktisk supportaktør og valgt bruker/firma. Eksisterende begrensninger for reell utsending, kundeaksept, produksjonsdata og privilegieendring gjelder fortsatt.

Dette er målet, ikke en beskrivelse av dagens implementering. Ikke kall dagens prosjekt-, Sales- eller katalogstøtte en full kundemodus.

## Faktisk gjennomgang

- Innlogget produksjon https://expo-proffdok.app: åpnet ML Flis-prosjektet fra Firmaer og prosjekter. Åpne salgsgrunnlag er ikke disabled, men har MAIN med inert som ancestor. Bekreftet med DOM. Ingen prosjektfelt ble endret.
- Prosjektmeny → Salgsgrunnlag åpner fanen, men innholdet blir tomt: prosjektadapteren skjuler SalesCore, samtidig som generell Sales-CSS skjuler introen med dokumentinngangene.
- Tilbake tar til Systemadmin, ikke firmaets startside. I min prøve ble Ringside-logo gjenopprettet; brukerens skjermbilde viser at ML Flis-logo/supportbanner kan henge igjen. Identifiserte ubeskyttet forsinket projeksjon og asynkron opprydding.
- Tilbudsstøtte har en separat firmavelger og egne sperrer. `upsertSalesRequests` er ikke generelt skrivebeskyttet av supportmodus, og `publishSalesOffer` fører med support_company_id. Ikke åpnet kundens tilbudseditor under denne prøven og ikke testet publisering eller e-post.
- Katalogstøtte har separat målbruker og pris-RPC. Ingen felles brukerøkt binder denne til prosjekt/Sales.
- Read-only metadataoppslag i faktisk Production fant Sales-scope-funksjoner og supportsakskontekst, men ingen support-session/impersonation-funksjon. Ingen databaseendring utført.

## Avgrenset klientrettelse i denne kandidaten

Prosjektoversiktens rene navigasjon flyttes utenfor det inerte redigeringsområdet i support; felter og eksisterende Sales-editor forblir sperret. Hjelpetekst oppgir skrivebeskyttelse. Dokumentinngangen i Salgsgrunnlag skjules ikke av Sales-overblikkets CSS. Avslutning ugyldiggjør ventende projeksjoner og sender synkron opprydding til Sales-banner/logo.

Denne delrettelsen implementerer **ikke** det utvidede produktkravet om full app, opprettelse/redigering eller firmaets startside. Eksisterende retur til Systemadmin står foreløpig uendret. Må ikke merges som om hele oppgaven er løst.

## Kontroller

`npm run build` bestod, inkludert eksisterende critical checks. Ny `support-navigation-lifecycle-check.mjs` bruker faktiske navigasjonshandlere og projeksjonsfunksjoner; normal projeksjon, avslutning, sent svar etter avslutning og svar fra forrige firma består. Kjøres nå også fra critical-work-profile-check. Innlogget kandidat/Preview er ikke kontrollert ennå. Produksjon/demos SHA er uendret.

## Neste arbeid før samlet leveranse

1. Etabler en eksplisitt, servervalidert supportøkt med faktisk aktør, valgt bruker og firma; klientens data/cache/recovery må skille denne fra egen arbeidsprofil.
2. Kartlegg alle modul-RPC-er, tabellskriv, Storage og Edge Functions. Samme effektive brukerrettigheter/priser skal gjelde. Ikke bytt auth.uid globalt eller utsted kundens innlogging som en snarvei.
3. Serverstyrt slettesperre må dekke DELETE, slettende RPC-er, myk sletting, fjerning fra JSON-lister, filfjerning og erstattingsoperasjoner. Audit må bevare før/etter og supportaktør; UI-sperrer alene er utilstrekkelige.
4. Knytt startside, prosjekt, Sales, katalog og øvrige aktiverte moduler til samme økt. Skille Tilbake fra Avslutt. Test tilbake, refresh, dvale, firmabytte, tilbakekalt tilgang og sent svar.
5. Sandbox: legg til/rediger syntetisk tilbud/prosjekt og øvrige berørte moduler, verifiser korrekt firma, ingen sletting/utsending og audit. Publiser samlet Preview for TEST OK før kontrollert Production og main → demo.

Ingen tilbud, prosjekter, brukere, bestillinger eller meldinger ble opprettet, endret eller slettet under produksjonskontrollen. Ingen utsending.
