# Fase 45B – samlet firmaadministrasjon

Dato: 25.09.2026

## Beslutning

Systemadministrator skal ha ett sted for firma, brukere og tilganger. Den separate Systemadmin-flaten «Proff vareregister» fjernes som egen administrasjonsflate.

`Firmaer, brukere og tilganger` er hovedflaten:

- firmaer vises kollapset og ett firma åpnes om gangen
- søk finner firma, bruker eller e-post
- leverandør/rabatt vises inne på valgt eksternt firma
- eksisterende brukerkort beholdes som autoritativ UX for godkjenning, deaktivering, firma, rolle, moduler og prisinnsyn
- brukerkort filtreres til valgt firma uten å flyttes i DOM-en
- interne Ringside/Expo-firmaer bruker fortsatt separat `Internt vareregister` for ERP-katalogen

## Sikkerhetsgrense

Dette er en UX-endring. 45B-tabeller, RLS, RPC-er, firmascoping, `Din nto pris` og leverandørscoping endres ikke.

Legacy-brukerkort flyttes ikke eller bygges om. Et skjult kompatibilitetsanker gjør at eksisterende `systemAdminUnifiedUserAccessUx` fortsatt kan montere de testede tilgangskontrollene etter at den synlige overskriften er endret.

## QA

Før manuell godkjenning:

1. `critical-pro-access-single-surface-check` skal være grønn.
2. Full critical build/Vite skal være grønn.
3. RC Preview skal fortsatt være bundet til Sandbox.
4. Systemadmin skal se `Firmaer, brukere og tilganger`, med firmaer kollapset.
5. Åpning av Proffkunde Demo AS skal vise leverandører/rabatt og bare firmaets brukerkort.
6. Godkjenning/deaktivering/firma/rolle/moduler/`Din nto pris` skal fortsatt bruke eksisterende brukerkort.
7. `Internt vareregister` skal fortsatt finnes separat, men det skal ikke finnes en ny separat Proff-vareregisterflate under Systemadmin.
