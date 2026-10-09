# Hjelp, firmaavtale og brukerkort – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Preview og Sandbox `ppvircenkjizeiqdxphj`, draft PR #216. Faktisk remote før endring: `351b3b7fcfd348c81d711271539b3f6bae76405b`, tree `7f2bb1d0100f0f9f05236d081b5818297bbf0c0c`; lokalt tree identisk, annen lokal commit-historikk. Main kontrollert `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Publisering skjer på faktisk remote parent med expected-head lease.

## Avklart, avgrenset scope

Kenneth ber om ikon på alle hjelpepunkter, rekkefølge etter arbeidsflyt, relevant hjelp bare ved faktisk tilgang og KS/HMS-/HR-valg på eksisterende brukerkort. Firmaet avtaler modulene; systemadmin aktiverer på firmaet, og firmaadmin/systemadmin gir individuell modultilgang. Firmaadmin beholder administrasjon gjennom firmarollen i eget aktiverte firma. HR-modultilgang gir ikke personlig HR-innsyn.

Berørte filer: React-Hjelp og nytt presentasjons-/fersk-tilgangslag, eksisterende firma-/brukerkort, isolert `PeopleModuleAccess`, to nye migrasjoner, direkte Help-props/fjerning av gammel separat KS-aktivering i main, relevante QA-/statusfiler. Ingen Sales/recovery/autosave, prosjektrapport/PDF/ZIP, varsler, e-posttransport, HR-innhold/editor eller Storage/Edge-konfigurasjon endres.

## Hvor gis tilgang?

| Hvem | Firma/bruker | Faktisk vei |
|---|---|---|
| Systemadmin | Firmaets kjøpte moduler | **Systemadmin → Firmaer, brukere og tilganger → firma → Firmaets KS/HMS- og HR-avtale → Lagre firmaets moduler** |
| Firmaadmin | Brukere i eget aktive firma | **Firma → Brukere og tilganger → brukerkort → KS/HMS og HR → Lagre KS/HMS- og HR-tilgang** |
| Systemadmin | Firmaets brukere | Eksisterende brukerkort under samme firmaoversikt, samme **KS/HMS og HR**-felt og lagreknapp. |

KS/HMS har medarbeider-/ansvarligvalg. En utpekt ansvarlig må erstattes i oppstarten før nødvendig tilgang fjernes. Firmamodul av viser kontaktbeskjed og tillater ikke ny tildeling. Firmaaktivering er tilgangsregistrering, ingen betalingshendelse. Firmaadmin kan ikke endre en systemadministrators brukertilgang. Firmaadmins egne modulrettigheter følger firmarollen, uten kunstig checkbox-grant.

Alle Hjelp-punkter har 20 px Lucide-ikon til venstre. Rekkefølgen begynner med Startside/Mobil/Befaring/Tilbud, følger firma og prosjektarbeidet, deretter KS/HMS og HR, Hjelp og systemadministrasjon. Alle 11 KS/HMS-kapitler og HR-kapitlet beholdes; **Bygg firmaets håndbok** er fortsatt første KS-kapittel og HRs tre anbefalinger består. Prosjekt-/Sales-/butikk-/Cordel-/Proff-hjelp følger også respektive rettigheter. Rollene kontrolleres fra fersk serverrespons. KS/HR bruker egne ferske appkontekster; ingen generell systemadmin-bypass.

## Sikkerhet og kompatibilitet

`people_modules_company_get/set` og `people_modules_user_get/set` gjelder modulmetadata, ikke personregistre. Hver skriving kontrollerer aktiv administrator, firma, bruker og expected-snapshot under firmalås; feil firma, stale snapshot og inaktiv firmamodul avvises. HR-tabellen har RLS, ingen direkte API-rettigheter. Private hjelpefunksjoner er owner-only, tom search_path; fire offentlige RPC-er er bare authenticated og krever serverens administrative kontroll.

HR krever firmaaktivering og personens eksplisitte modulgrant, eller firmaadmin i firmaet. De eksisterende medarbeider-/leder-/ekstra leserreglene gjelder i tillegg. Systemadmin kan administrere modulmetadata uten å lese HR-register eller innhold. Slutt på arbeidsforhold sperrer fortsatt umiddelbart og fjerner nå også HR-modultildelingen. Historikk/register slettes ikke ved ordinær modulrevokering eller deaktivering av firmaavtale.

Eksisterende konfigurerte HR-firmaer og allerede registrerte medarbeider-/leder-/leserrelasjoner videreføres ved migrering. Det er kompatibilitet med tidligere Preview-autorisasjon, ikke påstand om betaling og ikke nye personlige leserettigheter. Fersk lesende kontroll: **1 HR-firma, 1 medarbeider, 2 modulgrants fra eksisterende relasjoner, 1 HR-firmaaktivering**. **0 artefakter/filer/Storage-objekter, 0 syntetiske firmaer**, innhold **false**, restore-quarantine **true**.

Lokale CLI-genererte migrasjoner `20261009203431_people_module_entitlements` / `20261009203950_people_module_access_closure`. Faktisk Sandbox-versjon **20261009203754** / **20261009204042**. Production ikke migrert. Gamle migrasjoner er uendret.

## Utviklerbevis

- **38 nye faktiske rollback SQL-assertions PASS**: systemadmin firmaaktivering uten HR-bypass, firmaadmin bare eget firma, individuell tildeling/revokering, feil firma/bruker, optimistic konflikt, manglende firmalisens, systemadmins eksplisitte modulgrant uten personlig leserett, bevaring ved deaktivering og fratredelsens grant-sletting/sperring.
- Berørte eksisterende H1/H2/H3: **75 / 16 / 61 faktiske rollback assertions PASS**. Samme relasjons-/fil-/slettekrav består. Fixtures har nå eksplisitt testfirma-/modultilgang; tidligere assertions er ikke fjernet eller svekket. Dette er nye databasebevis, ikke separate innloggede brukere.
- Faktisk React/DOM: alle ikoner, workflow order, fersk generisk-/modul-/rolle-/supplerende Help-filtrering, feil aktør, eksisterende kapitler/råd, firma-/brukerskriving, valgt firma, firmaadmin-arv, deaktivert lisens, CAS-feil og sent/feil svar **PASS**. Syntetisk transport, ingen ekte brukertilgang endret i browser.
- Permanent `critical-people-module-access-check` inngår i full critical build. Eksisterende HR/Help React **PASS**. Full lokal Sandbox critical/Vite build **PASS**.

Faktisk innlogget Preview-kontroll og publisert eksakt SHA/CI/deployment føres etter publisering. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes. Sensitivt HR-innhold fortsatt stengt; uavhengig slettemanifest/full isolert restore gjenstår før innhold åpnes. Ingen ny obligatorisk B/C-omtest, e-post, merge eller Production-release.
