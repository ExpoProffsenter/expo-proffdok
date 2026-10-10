# Sykefraværsoppsett og HR-snarveier – 10. oktober 2026

Miljømål **BEGGE**. Denne runden leveres på `feat-kshms-foundation`, fast Preview og Supabase Sandbox `ppvircenkjizeiqdxphj`. Ingen merge til main/demo, Production, e-post eller NAV-innsending.

Kenneth ber om Samtalemaler i menyen øverst og fortsatt arbeid med sykefraværsoppsettet mens han er borte. Autorisert scope: HR-snarveier i `HrModule.jsx`/`hr.css`; `HrSickLeaveSetup.jsx`, `hrSickLeave.mjs`/CSS for veiledning og et tydelig avgrenset datoregneksempel; maltypen `sickleave` i malmodell/editor og privat malvalidator via en additiv migration; relevante critical-, React- og SQL-tester og dokumentasjon. Hjelp-kapitlet i `helpToolsCore.js`, README og arkitekturkart oppdateres etter repoets releasekrav; ingen annen Hjelp-funksjon endres. Ingen global meny, bootstrap, Sales, andre moduler eller personlige HR-tabeller endres.

Før-basis: remote feature `86d3cf7961cee758642909f5f289b15b6865c50a`, main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Lokal HEAD `b195ea9d` har samme tre som remote (`95bbe16a5a3917457e06885f321bfaa07236f239`); remote-historikk bevares ved lease og direkte Git-objekter. Samlet eldre feature-diff er 396 filer; ny delta vurderes separat.

## Leveransekontrakt

- Samtalemaler blir en egen HR-snarvei. Avslått register gir forklaring og deaktivert malvalg.
- Sykefravær gir nærmeste leder/firmaadmin lettlest veiledning med en konkret neste handling. Firmaadmin kan åpne en ny generell sykefraværsmal i den eksisterende editoren. Ulagret annen mal beholdes til brukeren uttrykkelig velger å forkaste; åpning/forslag lagrer ingenting.
- Malforslaget dekker kontakt, mulige oppgaver, tilrettelegging, felles plan, tiltak med ansvar/frist/neste oppfølging, støtte, uenighet og retur. Bare generelle spørsmål lagres; ingen svar, personlige fraværsdatoer eller medisinsk innhold.
- Det eksisterende malregisterets firmaadmin-/modul-/aktiv-firma-gater, CAS, historikk, readback og kvoter gjelder også `sickleave`. Validatorutvidelsen åpner ingen nye tabeller eller privilegier.
- Fristregneksemplet har bare en eksempelstartdato og full/gradert eksempeltype. Ingen medarbeidervalg, lagring, påminnelse, eksport eller nettverkskall. Dato pluss kalenderuker beregnes uten DST-/tidssoneforskyvning; ugyldige datoer avvises. Ingen automatisk unntaksavgjørelse eller sykepengemaksdato.
- **Personlige saker forblir stengt** (`content_enabled=false`, `restore_quarantined=true`). Nærmeste leders manuelle sakstart, perioder, felles plan/referat, begge bekreftelser, PDF og dokumentert faktisk deling gjenstår til H4-porten er oppfylt. Dette oppsettet presenteres ikke som ferdig saksbehandling.

## Kilder kontrollert på nytt

- [Brukerens NHO Arbinn-lenke](https://arbinn.nho.no/arbeidsrett/sykefravar_og_permisjoner/sykefravarsoppfolging/sykefravarsoppfolging-skritt-for-skritt/): forhåndsrutiner/tilrettelegging og trinnene i oppfølgingen. Egen parafrase, ingen kopiert medlemsmal.
- [NAV – slik følger du opp sykmeldte](https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte): arbeidsgiver har hovedansvar; plan innen 4 uker, dialogmøte 1 innen 7 uker ved fullt fravær med unntak, ved gradert fravær hvis hensiktsmessig; NAV vurderer aktivitet ved 8 uker og har ansvar for dialogmøte 2 innen 26 uker med unntak.
- [NAV – oppfølgingsplan](https://www.nav.no/arbeidsgiver/oppfolgingsplan): planen deles med sykmelder innen 4 uker og NAV før møter/på forespørsel. Lokal mal eller PDF er ingen innsending. Egne verktøy og NAVs digitale plan er forskjellige tjenester.
- [OpenAI – Permissions](https://learn.chatgpt.com/docs/permissions): lokale kommandoer, appkoblinger og nettleser har ulike tillatelseskontroller. Denne økten har administrert granular/auto-review-policy; ingen eksponert innstilling for å slå av brukerens vinduer. Ingen endring av policy eller autentisering forsøkes.

## Verifikasjon og publisering

- Faktisk mal-React PASS: alle gamle scenarioer samt sykefraværsforslag via snarvei, lagring/readback, 11 spørsmål og dirty kladdvalg uten automatisk skriv. Faktisk HrModule/register/KS-meny/Hjelp-React PASS: fem adminsnarveier, deaktivert malvalg ved avslått register, åpning/fokus, eksempelberegning, full/gradert veiledning, bevart kladd og ingen skriv gjennom snarveier/eksempler; gamle register-/tilgangsreiser beholdt.
- Permanent critical for kalenderdatoer PASS i UTC, Europe/Oslo og America/Los_Angeles: årsskifte, skuddår, begge DST-overganger, ugyldige datoer, fullt/gradert og separate NAV-ansvar. Ingen antatt 52-ukers maksdato.
- **94 faktiske assertions i Supabase Sandbox med full rollback PASS**, samme **94 i PostgreSQL/PGlite** med syntetisk plattformadapter. Maltype, katalog, historiske annual-utgaver, CAS, arkiv, kvoter, negative roller/annet firma/modul/aktiv bruker og privat gate dekkes. 0 testfirmaer igjen etter rollback. CLI-generert migration `20261010105649`, faktisk Sandbox-version **20261010110010**. Ingen prodmigrasjon.
- Etter migration: validator postgres-eid, tomt search_path, ingen EXECUTE for anon/authenticated/service_role; bare eksisterende autoriserte RPC-er bruker den. `content_enabled=false`, `restore_quarantined=true`. Supabase security advisors før/etter har samme 6 grupper og funn når `observed_at` fjernes; ingen nye funn. Eksisterende private RLS/no-policy er tilsiktet deny-all/RPC-mønster; øvrige tidligere råd endres ikke i dette scope.
- Full Sandbox critical/build PASS. jsdom og pinned PGlite 0.5.8 er isolerte QA-avhengigheter i /tmp; ingen repo-dependency/lockendring. React-review: komponentlokal CSS, semantiske labels/knapper, scoped og kvittert malintensjon, fersk autorisert katalog før opprettet generisk kladd; ingen nye nettverkskall for fristregneksemplet. Ingen globale handlers/auth-endringer.
- Fast branch-env `EXPO_BACKEND_TARGET=sandbox`, target preview, ref `feat-kshms-foundation` verifisert direkte før publisering.
- Skynettleserens eksisterende fane viser ordinær innlogging; ingen credentials/session/JWT lest eller ny innlogging krevd. Ingen innlogget visuell/mobil PASS påstås. Ingen aktiv HR-post eller mal endret gjennom browser. Ny kort brukerprøve er i USER_TEST; gamle prøver skal ikke gjentas.

Publiserings-SHA, CI og deployment føres etter eksakt ref-oppdatering.
