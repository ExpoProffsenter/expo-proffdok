# Saksbehandler og akseptvarsel

Miljømål: BEGGE. Dette er en separat core-rettelse fra ren `origin/main` (`5f58b1c6`). Sandbox fikk migrering `20261029191431` og acceptance-notify v6 med `verify_jwt=false` etter lokal QA og lesende miljø-/ACL-kontroll. Migreringsfilen heter `supabase/migrations/20261029191431_sales_case_handler_identity.sql` og følger serverens registrerte versjon. Production er ikke endret. Ingen saksbinding, tilbakefylling eller utsending er utført; den private Sandbox-tabellen har 0 bindinger. App-Preview og innlogget integrasjonsprøve mot Sandbox gjenstår.

## Identitet og lagring

En saksbehandler velges fra `sales_case_handler_candidates` i aktivt arbeidsfirma. Valget bruker Auth-brukerens UUID; navn og e-post gjør listen lesbar, men identifiserer aldri brukeren alene. Like navn har separate valg med e-post. `raw_user_meta_data` brukes bare til visningsnavn, aldri tilgang. Mottakerens adresse kommer fra bekreftet Auth-e-post for den valgte UUID-en, ikke fra `profiles.email`, kunden, signaturfelt eller publisist.

`sales_handler_private.request_handlers` er kanonisk binding til `sales_requests.id`, med firma, bruker-ID, navnesnapshot, revisjon og hvem/når som valgte. Tabellen er privat med RLS og uten klientrettigheter. `sales_set_case_handler` kontrollerer fersk aktørtilgang og må få forventet revisjon. Stale valg, også A → B → A, gir HTTP409. Aktørens vanlige aktive Sales-firmatilgang gjelder; ingen ny rollesnarvei er introdusert. Read-only supportvisningen kaller ikke setter-RPC-en, og klientadapteren avviser slike kall. URL-support er en klienttilstand, ikke en serverlagret sikkerhetsrolle; normal systemadminrepresentasjon følger eksisterende policy.

En ny sak kan binde en eksplisitt valgt UUID atomisk under INSERT. Triggeren validerer fersk kandidattilgang og speiler ID, revisjon og navn inn i eksisterende payload. På eksisterende saker er bare setter-RPC-en autoritativ. Vanlige bulk-upserts, offlinekladd og gamle faner kan ikke bytte eller fjerne bindingen. Triggeren kjører før eksisterende listeprojeksjon, slik at også oversikten får kanonisk navn. Ingen kunde-, tilbuds- eller aksepthistorikk kopieres eller omskrives av setter-RPC-en.

En eldre sak uten binding beholder synlig fritekstnavn og får ingen gjettet bruker-ID. Den åpne saken viser at saksbehandler må velges. Feltet **Saksbehandler** og **Lagre saksbehandler** finnes også på aksepterte/aktiverte saker; bindingen opprettes uten å åpne kundens låste akseptinnhold. Det finnes ingen navnemapping, automatisk backfill eller retroaktiv utsending.

## Utsending og deduplisering

`sales_acceptance_case_handler` kan bare kjøres av `service_role`. Den kobler serverens tilbud til én faktisk sak i samme firma og krever en kanonisk binding. Den kontrollerer godkjent, aktiv, intern profil, reelt firmamedlemskap, gjeldende Sales-tilgang og bekreftet/ikke slettet/ikke sperret Auth-e-post. Generelt tilbud krever også firmaets eksisterende tilbuds-/katalogtilgang når enten dagens sak eller akseptert versjon er Generelt tilbud. Manglende eller tvetydig sak, manglende binding eller bortfalt tilgang returnerer ingen mottaker.

Akseptfunksjonen krever fortsatt public-token, registrert aksept og riktig akseptert tilbudsversjon. Intern mottaker slås opp på nytt etter reservasjon. Endret identitet/revisjon/e-post eller bortfalt tilgang stopper sendingen og merker reservasjonen feilet. En endring etter siste kontroll og før leverandørens nettverkskall kan ikke utelukkes uten en større transaksjons-/utsendingsmotor; den eksisterende direkte transporten beholdes.

Det historiske `recipient_type='publisher'` beholdes **bare som dedupliseringsnøkkel** for internt varsel. Det er ikke lenger mottakerregelen. Den faktiske databasens constraint tillater bare `publisher/customer`, med unik `(offer_id,offer_version_id,recipient_type)`. Et nytt typenavn ville kunne sende gamle varsler igjen. Eksisterende pending/sent/failed-rader endres ikke av migreringen, og automatisk retry/ny sending innføres ikke. Etter et fail-closed stopp med reservert rad krever eventuell ny sending egen vurdering; brukerbytte utløser ingen ny e-post. Offentlig resultat heter `results.caseHandler` og oppgir sendt/ikke sendt uten intern adresse.

Kundens reservasjon, emne, HTML, summer, valgte opsjoner, lenke og fallback-regler er uendret fra kjørende v7. Manglende intern mottaker hindrer ikke kundens separate kvittering.

## Kildegrunnlag og review

Production `sales-offer-acceptance-notify` v7 ble hentet lesende 29.10.2026. Kilden manglet på undersøkt main og er nå lagt inn under `supabase/functions/sales-offer-acceptance-notify/index.ts`, med endret internrouting. Den eksakte hentede baseline ligger som testfixture `scripts/fixtures/sales-offer-acceptance-notify-v7.txt` (SHA256 `74b636964cd0761564b23152e01b19f15a0bdddd02d8de64be164703eeb0ab40`). Deployed bundle-hash var `002aa9e5bbefbdfe3f1ea29a3dca77b1d5cf09dc4bfa05128df0d4102696804b`; dette er en annen hash enn kildefilens hash. Ingen secrets er hentet.

v7 brukte akseptert versjons `published_by` til intern mottaker. Dette forklarer valgt teknisk bruker, men beviser ikke hvem som fysisk utførte en handling eller hvilken knapp/flyt som utløste RPC-en. Rettelsen baserer seg derfor ikke på publiseringsattribusjon.

Deployrekkefølge ved en senere særskilt godkjent Production-release: migrering og verifisert resolver/ACL først, deretter Edge-kandidat og app med eksisterende `verify_jwt=false`/public-capability-kontrakt. Sandbox-backend er installert: eksisterende notifications-kontrakt er kontrollert, privat RLS/ACL er verifisert og ingen bindinger er opprettet. Sandbox-versjon v6 og Production-baseline v7 er versjonsnumre i hvert sitt prosjekt. App-Preview, full innlogget integrasjonsprøve mot Sandbox og Production-release er fortsatt ikke utført. Full kritisk CI, relevant isolert Preview/Sandbox-prøve og brukerens TEST OK kreves før merge/Production. Ved tilbakeføring må internrouting forbli sperret eller bruke kanonisk mottaker; den gamle publisherfallbacken må ikke gjeninnføres som en stille rollback.

## Verifisering

- 105 lokale PostgreSQL/PGlite-kontroller kjører faktisk migrering: ACL, privat tabell, INSERT/upsert, revisjon, legacybinding, aktivt firma, tilbakekalt tilgang, bekreftet Auth-e-post, acceptedtype og listeprojeksjon. Dette er en isolert databasefixture, ikke hele produksjonsskjemaet.
- 111 Edge-/klientwrapperkontroller kjører faktisk kilde med mockede database-/transportgrenser og sammenligner kundekvitteringen mot v7 for begge tilbudstyper.
- 31 kontraktkontroller kjører faktiske opprettingshandlere og RPC-adaptere, med like navn, eksakt UUID og ugyldig/stale valg.
- 23 Chromium-kontroller kjører faktisk nytt skjema og handlerkontroll på 320/390/768/1366 med blokkerte eksterne nettverkskall. Eksisterende kundeopsjoner/aksept/ordregrunnlag har 116 Chromium-kontroller og 41 PostgreSQL-kontroller.
- Eksisterende entry-resume, auth/client, server-hydrering, recovery, tab-resume og critical-build er grønne. Ingen ekte e-post eller live dataendring er brukt som test.

Innlogget fullapp i publisert Preview/Sandbox, mobil Safari og virkelig leverandørtransport er ikke verifisert i denne lokale reviewrunden.
