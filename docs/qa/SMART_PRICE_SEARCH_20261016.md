## Sluttkontroll og CI-venting

Innlogget Preview finner DEMO-ORA-002 ved «termostat oras dusj» og merket DEMO-HG-001 ved «krom hansgrohe servantkran». Samme sistnevnte søk gir null treff med Smartere søk av, som forventet med den opprinnelige RPC-en. Ingen vare ble lagt til/lagret og ingen bestilling sendt. Eksisterende lagret plukkliste ble fortsatt vist. Preview bruker Sandbox-demovarer.

Core Safety #498 hadde grønn build, 128 editor-/valg-kontroller og 70 smartsøk-kontroller, men den eksisterende mobiltesten traff null boundingBox etter responsive modusbytte. Den rehydrerer plukklistene asynkront ved mobil → PC. Testen venter nå også på at eksisterende .priceSearchSavedLists er synlig før de samme uendrede ni kravene måles. Ingen appkode eller forventning er endret for denne CI-justeringen. Slutt-CI føres i PR #260.

Security-advisor før/etter har uendrede øvrige antall. Én ekstra tilsiktet authenticated SECURITY DEFINER-RPC er flagget (225 → 226), manuelt kontrollert med uid/gate/maskering, fast search_path og ingen anon-execute. Ingen annen ny linterkategori/funn i dette scopet. Veiledning: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable.

# Smartere Prissøk – 16.10.2026

Miljømål: BEGGE. Preview først, ny TEST OK før migrasjon/merge til Production, deretter main → demo og preflight. Samme faste Preview/branch som editorleveransen, separate commits. Endelig SHA/CI/deploy føres i PR #260.

## Problem og avgrensning

Dagens paginerte søk bruker én sammenhengende ILIKE-streng. Flerordssøk kan derfor miste relevante varer når merke, modell, farge og varetype står i annen rekkefølge. Lesende kontroll fant 470 178 aktive varer i Production, med bl.a. SERVANTKRAN, SERVANTBATTERI, MATTSVART og sammentrukne leverandørnavn. Bare varenavn/felter er brukt til testgrunnlag, ingen priser eller kundedata er kopiert.

Scope: additiv migrasjon 20261016190242_smart_price_search.sql, eksisterende StorePriceSearchView sitt søkeoppslag og små modus-/trefftekster, additive QA/CI og dokumentasjon/hjelp. Ingen main, navigasjon, Prissøk-recovery/arbeidsliste, vare-/prisdata, RLS, eksisterende tilgangsregler, katalogimport, tilbuds-/Proff-vareoppslag, varetelling eller utsending endres. Editorrettelsen dokumenteres separat.

## Ny oppførsel

- Alle ord må matche, i valgfri rekkefølge. Begrenset til 160 tegn/ti ord; ingen stille avkorting.
- Avgrensede fagaliaser: servantbatteri/servantkran/servbatt, dusjbatteri/-kran/-armatur, kjøkkenbatteri/-kran (og ASCII kjokken), WC/toalett/klosett, sort/svart, krom/chrome. Delord i varenavn beholdes. Generell batteri/elektronikk utvides ikke til armatur.
- Eksakt SKU/EAN først, deretter bokstavelige ord, deretter aliaser. Stabil description/supplier/id-sortering og totalt antall før paginering.
- Alias-treff merkes «Treff via tilsvarende fagord eller forkortelse». Slå av «Smartere søk» for uendret vanlig søk. Ingen ekstern KI eller generell stavekorreksjon; flere leverandørforkortelser krever konkrete eksempler/verifisert mapping.
- Farge, modell, merke og dimensjon slettes aldri fra søket. Varene velges fortsatt aktivt av bruker.
- Ingen resultatsammenslåing i klient av avkortede søk. Nye sider forkastes etter tekst-/modus-/firmabytte gjennom et søkegenerasjonsvern.

## Database og sikkerhet

Ny lesende stable SECURITY DEFINER-funksjon bruker samme etablerte tilgang og nettoprismaskering som vanlig Prissøk, med ekstra auth.uid-sjekk. search_path er tom og objekter kvalifisert. Bare authenticated har execute; eksisterende tilgang kontrolleres i funksjonen. Privat mønsterhjelper har ingen execute for public/anon/authenticated. Ingen tabell, policy, vare eller pris er endret. SQL-litteraler quotes med format %L, øvrige verdier bindes. Ingen input kjøres som regex eller SQL. Gamle RPC-er er uendret, også oppslag brukt til rehydrering av arbeidslisten.

Opprettet med Supabase CLI migration new; installert gjennom migrasjonsverktøyet bare i Sandbox ppvircenkjizeiqdxphj. Verktøyets faktiske versjon 20261016190242 er fulgt i filnavnet. Kilde-MD5 d6c2e3880a9e055d4cf0f230d9d35efb, lik migrasjonsloggen. Production dqffxflaoyarbxyiyhop er IKKE migrert. Ved release: bruk nøyaktig samme SQL, kontroller hash/privilegier og utfør autentisert lesetest før appmerge. Ingen seed/reset.

Sandbox-privilegier og empty search_path er kontrollert direkte. Faktisk authenticated demoaktør får DEMO-ORA-002 ved «termostat oras dusj». Netto-tilgang følger den eksisterende aktørrettigheten. Security advisors er kjørt før/etter: forventet varsel om en tilsiktet authenticated SECURITY DEFINER-RPC må vurderes sammen med eksplisitt UID/gate/maskering; andre eksisterende prosjektvarsler er utenfor dette scopet. Ingen global sikkerhetsinnstilling er endret.

## Tester og begrensninger

- 41 PGlite/PostgreSQL-kontroller PASS med faktisk migrasjon: rekkefølge/aliaser, eksakte koder, ufravikelig merke/farge/dimensjon, batteri-avgrensning, inaktive varer/importer, stabile sider/total, maskerte prisfelt, autorisert nettopris, direkte tabell-/helper-avslag, manglende/avvist aktør, anon og importlås. Ingen katalogskriving.
- 70 Chromium-kontroller PASS med faktisk View og global/mobil-CSS, syntetisk transport på 1363/768/390/320: modusbryter, aliasmerking, total/paginering, sen side ved modusbytte, uendret strekkode, valg til arbeidsliste uten lagring/sending, ingen priser/søkemetadata i sessionStorage, tilgangsfeil og ingen sideveis scrolling. Smale skjermer bruker mobile/touch.
- Eksisterende price-search-mobile-check: ni kontroller PASS, uendret: skann, ingen automatisk tastaturåpning og bevart PC-rekkefølge. Eksisterende critical pris-/tilgangs-/plukkliste-/varetellingsvern beholdes. Ny DB-/UI-QA er lagt additivt i CI.
- Lesende representativ EXPLAIN ANALYZE i Production (ingen funksjonsinstallasjon): bruker eksisterende trigramindeks, ca. 100 ms for «bronse oras kjøkkenbatteri»-predikater i dette ene kaldere oppslaget. Dette er ikke en generell ytelsesgaranti eller fullskalatest av alle nye RPC-søk. Sandbox har en liten demokatalog.
- Fysisk telefon/kamera er ikke testet. Full critical/Sandbox build PASS. Faktisk innlogget Preview og siste CI føres i PR.

## Kort brukerprøve

1. Prissøk → skriv flere ord, f.eks. «termostat oras dusj» eller «krom hansgrohe servantkran». Bytt rekkefølge; samme relevante varer skal finnes.
2. Søk både servantkran og servantbatteri med samme merke. Tilsvarende treff merkes. Slå av/på Smartere søk og sammenlign.
3. Søk et kjent varenummer/EAN. Riktig vare skal komme først. Kontroller farge/dimensjon og legg varen i arbeidslisten; antall, utskrift og eksisterende lagring skal fungere som før. Ikke send en bestilling som del av lesetesten.
4. Prøv gjerne noen vanskelige ekte varenavn i riktig miljø; gi konkrete søk/ønsket varenummer ved manglende treff. Preview bruker Sandbox-katalogen, som har demovarer.

Ny TEST OK gjenstår. Ingen merge, Production-migrasjon eller main → demo-synk er utført i denne leveransen.
