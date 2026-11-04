# Helappkontroll – fortsettelse 4. november 2026

## Gjeldende grunnlag

Miljømål **BEGGE**. Arbeid og innlogget QA begrenses til Preview/Sandbox. Ingen ny TEST OK, produksjonssetting, migrering eller demo-synk.

- Fersk main: `34daef4c0526b93ddbd84c3bfd97fb0833d97caf`; demo: `fd5aafa17d0a6412bebc60b586e328d682393d8e`.
- PR308s masseplanpakke er bevart på `b2c3a42269afa4ef5d7b1edd07af946dc3142d3f`, Vercel `dpl_6qQsU2r1azxUr3tDdnMehimUnr5L` READY/target null/riktig branch. CI910/run41886555578 var under arbeid ved første kontroll.
- PR309: `73c97450`, tidligere full CI903 grønn, avgrenset Bolig-UX. PR310: `1a3f615e`, full CI909/run41884890173 SUCCESS. Ingen av dem er merget.
- Faktisk nettleser: fast PR308-host `https://expo-proffdok-git-fase45b-ux-live-review-20261104-ringside.vercel.app/?progressTest=safe`, eksisterende demokonto/Expo Proffsenter. Samme innlogging er bevart. Nettleseren viser Chromium 1363×1023 inklusive chrome; ingen fysisk mobil-/Safari-attest.
- Denne rettelsen tas fra ren main i `fase45b-whole-app-qa-20261104`, med egen Preview. PR308/309/310 blandes ikke inn i kjernepakken.

## Hele appen skal beholdes i køen

Kenneth presiserte etter bruddet at **hele appen** skal sjekkes. Det eksisterende 145-reisers registeret er beholdt som inventar, med senere delbevis avstemt separat. En grønn testpakke, et hovedsidebesøk eller en enkelt film betyr ikke at alle underfunksjoner er ferdig kontrollert.

| Område | Registrerte reiser |
| --- | ---: |
| HOME | 3 |
| PERSONAL | 7 |
| PROJECT | 16 |
| HR | 11 |
| KSHMS | 13 |
| SALES | 16 |
| COMMERCE | 6 |
| CHECKLIST | 4 |
| BOLIG | 33 |
| COMPANY | 7 |
| SYSTEMADMIN | 9 |
| PORTAL | 2 |
| SUPPORT | 2 |
| HELP | 2 |
| TIME | 3 |
| STOCK | 3 |
| ACCESS | 6 |
| SHELL | 2 |

Dette er et inventar, ikke en ferdigprosent. Nye sjekklistefunksjoner fra PR305 kommer i tillegg der de ikke er selvstendige ID-er i registeret. Videre videoer skal følge verifiserte faktiske arbeidsflyter i alle områder, uten å fremstille korte delkapitler som full A–Å.

## Ferske innloggede delkontroller

| Reiser | Faktisk utført | Fortsatt åpent |
| --- | --- | --- |
| HOME-001/002 | Startside med tillatte arbeidsområder og oppfølging lastet. Demo viser tre autoriserte områdekort i denne kontoen. | Full rolle-/oppgavematrise, alle varselmål og mobil. Ingen retur til en annen forsidevariant. |
| SALES-001/011 | 19 Sandbox-saker, filter Alle og Generelle tilbud (11), åpnet DEMO–Generelt tilbud utkast. Kundens tilbud viser lagret kladd, utvides til høyrepanel og returnerer til samme sak. | Våtromstype, aksepterte/historiske versjoner og reell kundelenke/aksept i den innloggede helreisen. |
| SALES-005/ACCESS-004 | Befaringsnotat på samme fiktive sak, fire felt og Badskisse-inngang. Nettleserfanebytte tilbake beholdt notat/sak. | Ingen ny tekst skrevet; dette er ikke bevis for usendt tekst, bilder, mobil dvale eller server-first på tom enhet. |
| SALES-008 | Faktisk Generelt tilbud-editor åpnet. Lagret tittel, firma-/signaturvalg, vilkår og kundevisning lest. Retur til samme sak bekreftet. | **Funn GENERAL-CATALOG-CLIP**, se nedenfor. Ingen pris/tekst endret manuelt; editor viser egen automatisk lagringsstatus, så dette er ikke en påstand om null bakgrunnslagring. |
| HR-001/005/006/007 | To demoansatte. Demo medarbeider2 åpnet fra register, eksisterende DEMO-årssamtale, Felles møte og Tiltak lest. Tiltak viser ansvar/frister, separat lagring og steg som ikke lagrer. Escape lukket medarbeiderpanelet og returnerte fokus synlig til samme rad. | Ingen samtale opprettet, endret, sendt, bekreftet eller avsluttet. Private reelle ansatte brukes ikke som visningsdata. |
| HR-004 | Alle HR-funksjoner → Samtalemaler åpnet i samme native høyrepanel. | Videre kladd/forhåndsvisning/retur, lagring og rollevarianter må kontrolleres. |

## GENERAL-CATALOG-CLIP – rotårsak og avgrenset rettelse

Førtilstand i faktisk innlogget PR308: Generelt tilbuds tekst/felt klippes ved venstre arbeidskolonnes høyrekant. Tilbudsmalteksten går utenfor kolonnen, og felt mister synlig høyrekant. Ved scroll forsvinner leseområdet oppover som før; eventuell sticky-forbedring er ikke del av denne rettelsen.

Kildebevis: `SalesStoreOfferBuilderCatalog` rendrer en div rundt `SalesStoreOfferBuilderGrouped`. De tre delte reglene for `.sales-shell`, `.sales-app` og `.sales-main` krevde direkte `.sales-app` under `.sales-case-work-content`. Den gamle prøven rendret Grouped direkte og overså den faktiske wrapperen.

Rettelsen gir den eksisterende wrapperen klassen `sales-store-catalog-editor` og lar samme interne bredde-/paddingregler treffe denne. Scope: den ene className-linjen, tre CSS-selektorer + wrapperens min-width/max-width, eksisterende browserprøve og fixture, samt dette endringsgrunnlaget. Ingen ny navigasjon, lagringsmekanisme, prislogikk, auth, tilgang, portal, e-post eller database.

Regresjonsprøven rendrer faktisk Catalog→Grouped. Bare persistStoreOfferDraft-grensen er injisert syntetisk; den virkelige editoren og all opprinnelig kundevisnings-/kladd-/fokus-/viewporttest beholdes. Nytt geometrikrav kontrollerer hver synlig input/textarea/select og skall innenfor arbeidskolonnens grenser, ikke bare dokumentets scrollWidth (som kan skjules av overflow).

## Verifikasjon og grenser

- Full lokal `EXPO_BACKEND_TARGET=sandbox npm run build` inkludert uendret critical-kjede: PASS.
- `node --check scripts/sales-case-customer-preview-browser-check.mjs`, `git diff --check`: PASS.
- Ny lokal Chromium-prøve kunne ikke starte på grunn av miljøets `socket()/ProcessSingleton`-begrensning. Ingen runtime-PASS utledes. Ordinær CI skal kjøre den faktiske prøven.
- Endelig head, full CI, READY og innlogget etterkontroll føres nedenfor. Ingen TEST OK eller merge ved dette checkpointet. Før merge er tilbakeføring å lukke PR-en.

## Neste sammenhengende kontrollrekkefølge

1. Fullfør denne avgrensede Generelt tilbud-rettelsen med CI og innlogget før/etter.
2. KS/HMS: avvik/RUH, SJA, vernerunde, risiko, plan, rutiner/revisjon, sjekklister og dokumentuttrekk; bruk faktisk underpanel/retur/eksport.
3. Min side og timeføring (firmaets eksisterende opt-in); firmaprofil, firmaadmin, organisasjonskart og systemadmin.
4. Prissøk/plukkliste, varebestilling og varetelling; faktiske eksportbytes og sperret transport skal skilles fra reell utsending.
5. Ordinære prosjektfaner, selvstendige sjekklister, portal-/rollevarianter, support og hjelp. PR310s overtagelse er ett delbevis, ikke hele prosjektmodulen.
6. Fortsett gjenstående Bolig-helreise og kapittelfilm etter at øvrige områder har fått fremdrift. Full Bolig A–Å gjenstår.

Det brukes én varig oppfølgingslogg per avgrenset pakke. Ikke lag nye designretninger eller ombygg uberørte moduler som sideeffekt.
