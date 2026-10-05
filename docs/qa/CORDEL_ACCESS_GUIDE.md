# Cordel importvalg og tilgang

Miljømål: BEGGE. Feature fra main `07f01ac6`. Kun Preview/Sandbox er autorisert for denne endringen.

Scope: eksisterende Cordel-exportkort og guide, filtrering av dette ene Help-temaet, Systemadmin-brukerkort, separat tilgangstabell/RPC-er og dokumentasjon. Filgeneratorer og akseptert grunnlag beholdes.

Sandbox: `scripts/cordel-access-sandbox-check.sql` tester Systemadmin automatisk, tildeling/fjerning, ordinær bruker og Firmaadmin uten administrasjonsrett, annen bruker skjermet, firmascope, deaktivert/ikke godkjent og anonym avvist, direkte tabelltilgang stengt og eksisterende prisrettigheter bevart. Alle fixture-endringer rulles tilbake.

Preview-test hos bruker:
1. Systemadmin → bruker → Eksport til Cordel: slå på og lagre.
2. Brukeren åpner et akseptert tilbud og Hjelp: eksportkort og Cordel-tema skal vises.
3. Slå av og lagre; etter oppdatering skal begge skjules. Andre Hjelp-temaer og eksisterende tilbudsredigering skal fungere.
4. Kontroller samme tilgang på PC og mobil, plukklisteknappen og nedlasting.
5. Les importvalgene: AFG alene uten jobbliste; med jobbliste kreves jobbliste først og tilsvarende Cordel-oppsett. Kontroller valgt Cordel-metodes påslag/avrunding og mottatt sum.

Grønn build og SQL-test er ikke innlogget Preview-aksept eller bevis på AFG alene i alle Cordel-metoder. Ny Production-publisering krever konkret godkjenning.

Verifisert 05.10.2026: full critical-suite og Vite-build grønne. Sandbox SQL-scenarioer passerte med rollback. Refresh-runtime-test dekker grant/revoke, eldre respons etter profilbytte, nettfeil og cleanup. Advisors: kun forventet RLS-uten-direkte-policy og authenticated SECURITY DEFINER for den nye avgrensede tilgangen; ingen anonym RPC eller muterbar search_path. Eksisterende prosjektfunn er utenfor scope.
