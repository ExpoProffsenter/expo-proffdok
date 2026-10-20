# Automatisk personalhåndbok og komplette tildelinger

Miljømål BEGGE. Baseline main f03311b94b1c54353b173b8c8fe133e8fc31d160. Kenneth bestilte automatisk tildeling, «rett i produksjon» kl. 15:03, eksisterende ansatte kl. 15:08 og samme rutiner i alle tre firmaer kl. 15:10 Europe/Oslo 20.10.2026. Disse instruksjonene autoriserer denne releasen uten ny TEST OK-runde.

## Kontrakt

En aktiv, godkjent intern medarbeider med firmamedlemskap, aktiv firmamodul og KS/HMS-grant eller firmaadmin-arv får siste godkjente utgave av alle aktive rutiner i sitt firma. Bare manglende tildelinger opprettes. Utkast, arkiverte rutiner og andre firmaers utgaver tas ikke med. Ingen tilganger gis av migrasjonen. Ingen versjon, lesebekreftelse eller gammel tildeling endres. Tildeling er ikke ansattes gjennomgang.

Private SECURITY DEFINER-hjelpere med tom search_path er nødvendige for serverstyrte, allerede autoriserte writes til RPC-only-tabeller. Ingen API-rolle har execute, ingen ny offentlig RPC/policy eller tabelltilgang. Triggerne dekker member_access, membership, profile activation og company entitlement. Helperen bruker samme firmalås som eksisterende kshms_command-publisering, så en samtidig publisering eller tildeling ser hele resultatet. ON CONFLICT bevarer opprinnelig aktør/tid og hindrer duplikat.

Migrasjon generert med Supabase CLI: 20261020130549_kshms_auto_assign_handbook_on_access.sql. Installert og reell rollback-QA PASS i Sandbox, deretter installert i Production etter direkteinstruks. Eksisterende versjoner, rutiner, medlemskap, modul-/brukertilgang og lesebekreftelser har identiske før/etter-fingeravtrykk. Reading-e-post sendbar=0.

## Oppretting i produksjon

Ringside hadde 87 aktive rutiner / 90 utgaver. 8 medarbeidere hadde bare 2 gjeldende utgaver; 680 manglende tildelinger ble lagt til. Bademiljø Expo og Expo Proffsenter hadde ingen rutiner eller oppstart å overskrive. Etter uttrykkelig instruks er siste 87 godkjente Ringside-tekster kopiert likt til hvert firma. Generisk, parameterstyrt operasjon: scripts/operations/copy-approved-handbook.sql. Den krever tomme mål, aktiv firmaadmin i alle firmaer, aktive moduler og fryst kildefingeravtrykk. Den kjører eksisterende settings/access/save/publish-RPC-er og gjenoppretter aktørens opprinnelige arbeidsprofil/selected_at i samme transaksjon. Ingen ack-kall. Først full rollback-prøve på faktisk produksjonsgrunnlag, deretter identisk commit.

Resultat: Ringside 19, Bademiljø Expo 10 og Expo Proffsenter 11 aktive interne medlemskap, samtlige med KS/HMS-tilgang og 87/87 gjeldende rutiner. Innholdssettet er eksakt likt i alle firmaene. 7 aktive Expo Proffsenter-medarbeidere fikk KS/HMS-reader via eksisterende tilgangskommando; HR og øvrige moduler er uendret. Alle tidligere lesebekreftelser har samme fingeravtrykk. Ingen reading-e-post sendbar. Andre firmaers videre redigering/godkjenning forblir selvstendig.

## Tester

- Faktisk PostgreSQL med foundation/access/save/publish/read/ack: siste aktive utgaver, umiddelbar egen håndbok, uendret historie/kvittering, idempotente gjentakelser/roller, audit og full rollback PASS. Samme scenario PASS mot faktisk Sandbox.
- Company-admin PostgreSQL-scenariet har 148 assertions inkludert eksisterende firma/invitasjon/HR-vern samt faktisk akseptert invitasjon, unchecked KS/HMS, firmaadmin-arv, brukerkortets user_set, forsinket godkjenning/reaktivering/intern rolle, sent medlemskap, firmaaktivering og privat helper-nekt for anon/authenticated/service_role.
- Eksisterende faktisk PeopleModuleAccess/Hjelp og firmapublisering React PASS.
- Eksisterende CI beholdes, ny DB-scenario legges til ved company-admin-check. Ingen eksisterende sikkerhetsvern fjernet eller svekket.

Direkte produksjonsdata er allerede kontrollert. Kode-PR/CI/Vercel/main → demo og endelig preflight dokumenteres i release-PR.
