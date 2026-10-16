# Fremdrift, bemanning og Startside – release 16. oktober 2026

Miljømål BEGGE. Kenneth ga TEST OK etter Preview-prøven og ba om at KS/HMS-bannerne bare vises på Startsiden. Han bekreftet deretter uttrykkelig «etter dette er test ok for produksjon» og autoriserte videre releasearbeid mens han var borte. Dette erstatter eldre ventende TEST OK-notater for leveransen.

## Publisering

[PR #254](https://github.com/ExpoProffsenter/expo-proffdok/pull/254) er merget med kontrollert head `450743401024a4e5be9e9e25e9867feb16f8338d`. [PR Core Safety #485](https://github.com/ExpoProffsenter/expo-proffdok/actions/runs/38928674553) SUCCESS. Full suite beholdt; ingen gammel kritisk kontroll svekket.

Funksjons-main `e7363f8a37cf84caebf829a27bc8c25c71559a00`, tre `d2a18ad4f808c5c7ccee45d9d083483f1aefec3d`, er identisk med lokalt og Preview-testet tre. Production `dpl_G2NWYyXfjqDbinnzQYy9U8KN3fZV` READY, target production, riktig SHA og expo-proffdok.app/www. HTML, entry, bootstrap, faktisk appkode, HomeFollowups og planasset HTTP 200. Production-binding bekreftet; Sandbox-URL er fraværende i kontrollerte entry/app-chunks. Åpne fremdriftsplan/Åpne bemanningsplan og siste dialogrettelse finnes i publisert kode.

Startsiden har én lukket oversikt med kategorier, antall og viktige fristmarkeringer. De to gamle KS/HMS-bannerne monteres ikke lenger i den globale headeren. De vises i Startsidens detaljer ved innlogging og bevisst retur. Kun lazyimport og global montering ble fjernet i siste main.jsx-rettelse; HomeFollowups-gaten, navigasjon, prosjekt-/tilbudsflyt, tilgang, fristregler, e-post og oppgavedata beholdes. Modulenes egne oppgaveinnganger er uendret.

Prosjekt, KS/HMS og egne planer bruker samme popup, med kompakt topp, normal radhøyde, dag/uke/måned, dra/strekk/Angre, NS-koder, deltakere og bemanning. Direkte PDF-nedlasting, egen forhåndsvisning/utskrift, CSV/kalender og aktiv firmalogo beholdes. Hovedplanen lukkes med Tilbake; Escape lukker mindre undervinduer. Prosjektvalg, tilbud og deling har normal checkbox og tydelig ramme. Tilbudsimport, opsjoner, kundedeling, private deltakere og eksisterende prosjektmail/server-PDF beholdes.

## Production-database

De fire tidligere Sandbox-testede migrasjonene er installert i denne rekkefølgen i `dqffxflaoyarbxyiyhop`:

| Versjon og navn | MD5 av eksakt kildetekst |
| --- | --- |
| 20261016114708_kshms_standalone_progress_plans | 96def739efaddd02ebb004cc1ec92912 |
| 20261016125012_kshms_progress_staffing | 37d373bb803cbadcee7385b139f5c429 |
| 20261016132206_kshms_progress_participants | 96853da60dc3f92e2bf4caade35acfed |
| 20261016142124_project_progress_workspace | 399e53ac4ed95cfe24f7cf1022baa282 |

Verktøyet ga Invalid or expired requestState ved første forsøk på siste migrasjon. Kontroll viste ingen installerte objekter fra dette forsøket; ett nytt forsøk lyktes. Historikken er normalisert til repoets eksakte versjoner etter at alle fire installasjoner var bekreftet. Sandbox-loggen for første/siste fil har ett ekstra avsluttende linjeskift; SQL-innholdet er ellers identisk. Alle 15 berørte funksjonsdefinisjoner har identiske fingeravtrykk i Production/Sandbox.

Faktisk authenticated Production-prøve: 16 assertions og to anonyme avslag PASS. Syntetisk prosjekt og KS-plan, personantall, deltakere, save/readback, egne aktive oppgaver, intern privat deltakerlagring, Min side, stale revisjon, ugyldig bemanning, feil firma og ingen direkte klientlesing. Alle QA-skrivinger lå i én transaksjon som ble rullet tilbake. Ingen testmail, nye profiler, varige eksempelrader eller nye Production-kursdata ble opprettet.

Eksisterende tre prosjektplaner er beholdt med samme innholdshash `fe0d040783dc5614986428000110973b` før/etter; 23 prosjekter og 57 Sales-saker før/etter. Nye KS-planer/assignments er tomme i Production etter rollback. Profiltallet var 42 før og 43 etter under normal drift; testen opprettet/endret ingen profiler, og dette tallet brukes ikke som bevis på uendret profilinnhold. Private tabeller har RLS og ingen direkte anon/authenticated SELECT. Alle sju nye RPC-er tillater authenticated og nekter anon.

Security-advisor: to nye INFO for tilsiktede private RLS-tabeller uten policy, og sju authenticated SECURITY DEFINER-RPC-varsler for denne tilgangskontrollerte arkitekturen. Ingen nye anonyme execute-varsler eller search_path-varsler. Øvrige eksisterende varsler er uendret. Se [RLS-lint](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Ikke beskriv dette som et varselfritt prosjekt.

## Demo og kurs

Main → demo er synkronisert med to foreldre, fra tidligere demo `fa6e873d5301ff31a33a8531f966621b70af68ac` og verifisert funksjons-main. Første synk-head `b8c50826e24ac82e7cc00f22be37bbb54f1bc1a7`, tre `c3906466d50f769854655553fe869178ce6aa3a4`, `dpl_6QUHTJJ39QkSg2uPeTDwWw3qwDWa` READY på fast demo-host. Demo-overlay, kontrollside, statisk nød-demo, bilder, katalog, Sandbox-binding og kursdata beholdes. To dokumentasjonskonflikter er løst ved å bevare både ny releasehistorikk og eksisterende demonotater. Ingen appkodekonflikter. Berørte Home/HR/KS/progress/main-kilder er identiske med Production.

Full demo critical/build PASS. Faktiske Home 128, Prosjekt 39 og KS/HMS 128 Chromium-kontroller PASS på den sammenslåtte demokoden. Publisert HTML/entry/bootstrap/app og demo-control med sin JS HTTP 200. Sandbox-binding bekreftet, Production-URL fraværende i kontrollerte app-chunks. Kontrollsidens produksjonsbaseline er oppdatert. Eventuell avsluttende dokumentasjons-main synkroniseres også inn i demo med tilsvarende baseline; endelige SHA/deploybevis føres i PR #254.

Faktisk authenticated preflight: alle 19 infrastruktur-/Golden-kontroller og fem kurskontroller grønne. Ingen reset/ny seed. Prosjekt `5ea8d503-e38c-43d4-94ce-7fab7df525e9` har fortsatt 21 oppgaver/282 økter og fire egne aktive oppgaver for Kenneth Demo. KS-plan `0eed1fa7-965a-422d-81e4-dfce6b89cb41` har fortsatt 21 oppgaver. Begge ligger i Expo Proffsenter/Sandbox. Utsending for kurset forblir av. Ingen demo → main-synk.

## Testbevis og grenser

Siste Startside-utvidelse bruker faktiske monteringsuttrykk fra main.jsx og faktiske globale/prosjektfaner ved 1280/390 px. Førtest ga to bannere i Befaring/Tilbud; etter rettelse ingen banner på arbeidsfanene. E-postinnganger, retur til Startsiden, oppgaver, frister, kontaktlagring, modaler, aktør/firma, tilgangstap og sene svar inngår. Full critical/build, reell modulnavigasjon og CI-suite består. Tidligere plan-/PDF-/databasebevis beholdes, ikke unødig gjentatt lokalt. QA-detaljer finnes i docs/qa/HOME_FOLLOWUPS_20261016.md, PROGRESS_LAYOUT_20261016.md, PROGRESS_FOCUS_20261016.md, PROJECT_PROGRESS_20261016.md og KSHMS_PROGRESS_20261016.md.

Utvikler har kontrollert publiserte assets og faktisk Production-backend; ingen ny innlogget fysisk Windows-/mobilprøve eller mottatt e-post påstås. Kenneths Preview-godkjenning gjelder. Ved retur kan han kontrollere Startsiden → en annen fane (ingen bannere), Prosjekt → Fremdrift og KS/HMS → Fremdriftsplaner. Kursplanen finnes via Prosjekter → DEMO – VVS – fremdrift og bemanning 3 måneder → Fremdrift.

Etter godkjent release/kursklargjøring beholdes stabilitetsfokus. Ingen nye funksjoner eller dataendringer legges til som del av denne avslutningen.
