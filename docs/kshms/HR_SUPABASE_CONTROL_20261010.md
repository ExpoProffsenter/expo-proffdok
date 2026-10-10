# H5b med separat Supabase-kontrollprosjekt

## Faktisk kontokontroll og klargjort opprettelse ca. 22:22 Europe/Oslo

Kenneth bekreftet valgt eksisterende organisasjon og opptil **10 USD/måned i ekstra grunnkostnad**, uten betalte tillegg. Sikker GitHub-innlogging til Supabase i samme cloud-fane gav faktisk eierøkt. Team-/fakturakontroll stemmer med Kenneths oppgitte Ringside-fakturakonto; arbeidsområdenavnet **ExpoProffsenter's Org** er ikke fakturamottakerens selskapsnavn. Ingen fakturanavn, adresse, MVA-nummer, betalingsmiddel, eierrolle eller spend cap er endret. Private faktura-/betalingsdetaljer og fakturabilder publiseres ikke i repoet.

Faktisk opprettelsesskjema for organisasjon `oolmxqndmldzpylahcjl` viser **Additional costs $10/m** med **Micro / 1 GB Shared compute**. Navn **expo-hr-control-sandbox**, konkret region **West EU (Ireland) / eu-west-1**, ingen GitHub-kobling, Enable Data API på, Automatically expose new tables av og Enable automatic RLS på. Nytt passord er ikke angitt, generert, lest eller lagret av agenten. Create new project er ikke trykket. Dette er ikke et opprettet prosjekt, kontrollanker eller operator-PASS. Seneste list_projects viser fortsatt bare eksisterende Production-prosjekt; aktiv Sandbox er dets eksisterende branch.

Det tidligere utilgjengelige get_cost ble ikke blindt gjentatt. Et nytt, separat `confirm_cost`-kall med den faktisk kontobekreftede prisen 10 USD/month/project fikk **UNAVAILABLE: MCP tool confirm_cost was not returned by tools/list**. Ingen gyldig confirm_cost_id finnes; create_project-API kalles ikke med oppdiktet ID. Nettleserskjemaet er ferdig klargjort for manuell overtakelse, fordi nye databasecredentials må angis av brukeren selv etter nettleserens credential-regel. Kenneth trenger å angi/generere og beholde databasepassordet i sin egen passordbehandling, deretter fullføre Create new project i dette skjemaet. Ingen hemmelighet i chat, git, clipboard-uttrekk eller intern auth-state.

![Klargjort kontrollprosjekt, valgt EU-region, sikkerhetsvalg og faktisk kontopris](evidence/SUPABASE_CONTROL_COST_20261010.jpg)

Etter opprettelse må faktisk ny project-ref, organisasjon, region/compute, sikkerhetsvalg og ACTIVE_HEALTHY verifiseres før noen kontrollprosjekt-SQL/Edge-jobb. Bootstrap, Blob-token/originbinding, adapter, scheduler/varsling og isolert database/Auth/Storage-byte-restore gjenstår. Privat HR holdes fortsatt stengt; ingen Production/demo-appkode eller data endres. Tidligere pris-/scopeavsnitt nedenfor er historikk.

Status 10. oktober 2026 ca. 22:05 Europe/Oslo. Miljømål **SANDBOX/DEMO**. Kenneth ba om videre arbeid og spurte om Supabase kan brukes i stedet for egen server. Dette er et konkret driftsforslag, **ikke implementert eller skytestet**. Eksisterende H5b-operator, app, migrasjoner og tester er uendret. Ingen ressurs, nøkkel, scheduler eller HR-port er opprettet/aktivert av denne avklaringen.

## Enkel forklaring

Supabase kan kjøre den automatiske kontrolljobben. Et separat prosjekt lagrer siste godkjente kontrollpunkt og hindrer samtidige kjøringer. Vercel Blob beholder den signerte sletteloggen. Dagens Supabase beholder appdataene. Dermed kan en gammel appbackup ikke rulle tilbake kontrollpunktet og få slettet innhold til å fremstå som gyldig igjen. Egen driftet server er ett alternativ, ikke et nødvendig plattformkrav.

## Foreslått ressurs og gjenopprettingsgrense

| Del | Mål og kontrakt |
| --- | --- |
| App | Eksisterende Production `dqffxflaoyarbxyiyhop` og aktiv Sandbox `ppvircenkjizeiqdxphj`; ingen restore eller ny kode her i dette steget. |
| Signert slettelogg | Eksisterende private Vercel Blob `store_feUEeykOyyvZVMca`, FRA1, team ringside. Ingen private referater/svar/diagnoser. |
| Kontrollprosjekt | Foreslått nytt selvstendig `expo-hr-control-sandbox`, Micro, EU/Ireland (`eu-west-1`). Organisasjon og faktisk kontopris må bekreftes før opprettelse; foreslått eksisterende `ExpoProffsenter's Org`. Ingen PITR-/domene-/loggtillegg foreslås. |
| Varig kontrollpunkt | Privat Postgres-tabell i kontrollprosjektet, med eksplisitt project/store/origin-binding, revisjon, generasjon og HMAC. Utenfor alle applikasjonens database/Auth/Storage-backuper og restorekommandoer. |
| Kjøring | Edge Function i kontrollprosjektet, kalt av samme kontrollprosjekts pg_cron/pg_net; foreslått hvert femte minutt etter reell QA. Autentisert serverkall og egne hemmeligheter, ingen offentlig kjøreknapp eller browsernøkkel. |
| Restoreprøve | Eget isolert testmiljø med syntetiske Auth-brukere og Storage-bytes. Kontrollprosjektet skal aldri brukes som restoretestmål. Ressurs/pris for dette miljøet er separat og uavklart. |

Et separat prosjekt gir en eksplisitt restoregrense; det er ikke en garanti mot felles leverandør-/organisasjonsfeil. Kontrollprosjektets egne backuper skal aldri blindt rulles tilbake og deretter godtas som ferskt anker. Tap/tilbakerulling av kontrollpunkt eller signeringsnøkkel sperrer kvittering til særskilt, dokumentert recovery har etablert et uavhengig betrodd utgangspunkt. Appens restoreverktøy skal avvise både kontrollprosjektet og aktive Production/Sandbox som mål.

## Avgrenset operatortilpasning

Eksisterende `scripts/lib/hr-ledger-ack-cycle.mjs` krever privat absolutt katalog, `wx`-lås, `O_NOFOLLOW`, fil-/katalog-fsync og atomisk ankerpublisering. Den kan ikke kjøres uendret med anker i Edge `/tmp`, som nullstilles ved hver invokasjon. Supabase støtter også S3-montert lagring, men dokumentasjonen alene beviser ikke de nødvendige låse-/fsync-/rename-/samtidighetskontraktene. Ikke godkjenn et slikt bytte uten reelle prøver.

Foreslått neste kodearbeid er en separat kontrollprosjektadapter og Edge-inngang. Gjenbruk eksisterende normalisering, HMAC, Blob-CAS og minimal snapshot/ack-kontrakt. Behold filoperatoren og dens 20 feilscenarioer. Ikke endre Sales, navigasjon, HR-brukerflate eller innholdsport. Kontrollprosjekt-SQL må pakkes separat fra appens `supabase/migrations`, slik at normal appdeploy ikke installerer kontrolltilstand i Production/Sandbox.

Følgende må gjennomføres og testes før drift:

1. Service-only tabeller/funksjoner: ingen anon/authenticated-lesing, skriving eller kjøring; tomt search_path og minste nødvendige rettigheter. Hemmeligheter server-only, aldri i frontend, git, chat eller logger. Separate Sandbox-, kontrollprosjekt- og lagerbindinger.
2. Varig kjøringslås med unik kjørings-ID og kontrollpunktsrevisjon. Start/oppdatering/avslutning skal kontrolleres transaksjonelt. Ingen automatisk låsovertakelse etter timeout: en forsinket gammel operatør må ikke kunne kvittere etter at en ny har tatt over. Recovery krever kontroll av kjøring og sky-/ankertilstand; en eventuell senere lease-modell krever bevist sperre også ved selve DB-ack.
3. Bevar full eksport → signert ekstern union → varig kontrollpunktscommit → fersk ukachet Blob-readback → service-only ack. Kontrollpunktsoppdatering skal sammenligne forventet revisjon, binding og innhold, og skal aldri gå bakover. Etter commit må en ny lesing bevises, ikke bare stol på SQL-svar eller egen cache.
4. Tapt respons, ukjent commitutfall, samtidighet, gammel revisjon, filjobb ikke ferdig, feil før/etter Blob-skriv og feil før/etter kontrollpunktscommit skal sperre utrygg ack. Ny instans må ikke automatisk bootstrappe når kontrollpunktet mangler. Fysiske Storage-jobber må fortsatt fullføres før «Slettet».
5. Pinnet Blob SDK `2.8.1` og Node-kompatibilitet må faktisk prøves i Supabase Edge-runtime. Plattformgrensene er 256 MB, 2 s CPU per request, betalt worker opptil 400 s og request idle timeout 150 s. Eksisterende eksportgrense på 40 MB er ikke et kapasitetsbevis. Ved grensefeil: stans og varsle; ingen delvis snapshot/kvittering eller svekket sikkerhetsgrense.
6. Reell privat skylagerprøve, anonym avvisning mot et eksisterende objekt, konflikt/recovery og full isolert database/Auth/Storage-byte-restore gjenstår. Varig scheduler og varsling må få faktiske kjørings-/feil-/uteblitt-jobb-bevis før privat HR kan vurderes åpnet.

## Kostnad og faktisk tilgang

Lesende Supabase-organisasjonsoppslag bekreftet 10. oktober `oolmxqndmldzpylahcjl`, **ExpoProffsenter's Org**, plan **pro / tier_pro**. Offisiell listepris: ekstra Pro-prosjekter fra **10 USD/måned**; compute faktureres per time, og eksisterende organisasjonskreditt og forbruk påvirker fakturaen. Dette er ikke et bindende kontospesifikt tilbud eller et godkjent utgiftsbudsjett. To tidligere `get_cost`-forsøk var UNAVAILABLE; ingen blind gjentakelse eller falsk kostnadsbekreftelse. Opprettelse krever valgt organisasjon, faktisk pris og kostnadsbekreftelse. Ingen nytt prosjekt er opprettet.

Primærkilder lest: [planlagt Edge-kjøring](https://supabase.com/docs/guides/functions/schedule-functions), [midlertidig/varig fillagring](https://supabase.com/docs/guides/functions/ephemeral-storage), [Edge-grenser](https://supabase.com/docs/guides/functions/limits), [prising](https://supabase.com/pricing), [compute](https://supabase.com/docs/guides/platform/manage-your-usage/compute), [backup](https://supabase.com/docs/guides/platform/backups). Databasebackup omfatter ikke Storage-bytes; full restoreprøve består derfor fortsatt av begge deler. Supabase-changelog må kontrolleres før faktisk ny runtime-/SDK-implementering; tidligere markdown-oppslag ble avvist av leserverktøyets innholdstype, ikke dokumentert leverandørfeil.

Privat HR er fortsatt stengt i begge aktive miljøer. PR #217 er draft og skal ikke merges på grunnlag av dette forslaget.
