# Fase 42N – ny bruker med firmagrunnlag

## Formål

Ny egenregistrering skal gi Systemadmin nok firmainformasjon til å godkjenne brukeren uten først å måtte opprette eller gjette firmatilknytning manuelt.

## Brukerflyt

### Nytt firma

1. Brukeren velger **Opprett bruker**.
2. Personfeltene fra eksisterende Auth-flyt beholdes: fullt navn, mobil, e-post og passord.
3. Registreringen krever i tillegg:
   - firmanavn
   - organisasjonsnummer (9 sifre)
   - full firmaadresse
   - firmatelefon
   - nettside er valgfritt
4. Før signup kontrolleres bare om firmanavn/organisasjonsnummer allerede finnes. Ingen firmadetaljer eksponeres offentlig.
5. Samme eksisterende Supabase Auth-signup kjøres videre. Firmaopplysningene legges kun til som user metadata.
6. `auth.users`-triggeren oppretter en komplett `profiles`-rad med `approved=false` og `company_role='firmaadmin'`.
7. Systemadmin må fortsatt godkjenne kontoen før den kan brukes.

### Invitert bruker

Velger brukeren **Jeg er invitert til et eksisterende firma**, opprettes ikke firma gjennom Fase 42N. Eksisterende `company_user_invites`-flyt i `main.jsx` kobler brukeren til riktig firma etter innlogging, som før.

## Sikkerhetsmodell

- Fase 42K-kravet om valgt firma før godkjenning beholdes uendret.
- Nyregistrering kan aldri sette `approved=true`.
- Nyregistrering kan aldri bli systemadministrator.
- Firmanavn og organisasjonsnummer kontrolleres mot `profiles`, `companies` og `sales_company_scopes`.
- Et eksisterende firma kan ikke registreres som et nytt firma. Brukeren må inviteres av eksisterende firma/systemadmin.
- Preflight-RPC returnerer bare `available`/årsak og eksponerer ikke firmaopplysninger.
- Backend-triggeren gjentar samme kontroll atomisk; frontend/preflight er ikke sikkerhetsgrensen.

## Implementasjon

- `src/modules/auth/companySignupOnboarding.js`
  - isolert signup-UX
  - validering
  - kobler firmametadata på eksisterende `/auth/v1/signup`-request
  - gjenbruker dagens React-signup, adminvarsel og meldinger
- `supabase/migrations/20260916152000_fase42n_signup_company_onboarding.sql`
  - `signup_company_application_available(...)`
  - `handle_auth_signup_company_application()`
  - trigger på `auth.users`
- `scripts/critical-signup-company-onboarding-check.mjs`
  - verner at `main.jsx`/eksisterende Auth-kjerne forblir urørt
  - verner at auto-godkjenning ikke introduseres
  - verner invitasjonsveien og backend-duplikatkontrollen

## Miljø

Miljømål: **BEGGE**.

Production følger feature → Preview → critical QA → eksplisitt `TEST OK` → merge → Production-verifisering. Deretter synkroniseres godkjent `main → demo`. Sandbox bruker samme kode mot separat Supabase via Demo-buildvernet.
