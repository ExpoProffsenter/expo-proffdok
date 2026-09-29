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

En invitasjonslenke åpner registreringen eksplisitt i invitert modus med firma og e-post forklart i skjermbildet. Etter bekreftet registrering eller innlogging validerer `accept_company_user_invite()` invitasjonen mot e-post, firma og en aktiv Systemadmin/Firmaadmin. En gyldig invitasjon kobler brukeren til firmaet og godkjenner kontoen uten en ny Systemadmin-handling. Deaktiverte kontoer kan ikke reaktiveres via invitasjon.

Har firmaet Generelle tilbud, arver den inviterte brukeren automatisk denne modulen. «Din nto pris» arves aldri og må styres individuelt av Firmaadmin.

## Sikkerhetsmodell

- Fase 42K-kravet om valgt firma før godkjenning beholdes uendret.
- Nyregistrering kan ikke selv sette `approved=true`; bare den validerte invitasjons-RPC-en kan godkjenne den inviterte brukeren.
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
  - verner eksisterende Auth-kjerne og den eksplisitte invitasjonsinngangen
  - verner at bare en gyldig invitasjon kan gi automatisk godkjenning
  - verner invitasjonsveien, firmatilgangen og backend-duplikatkontrollen

## Miljø

Miljømål: **BEGGE**.

Production følger feature → Preview → critical QA → eksplisitt `TEST OK` → merge → Production-verifisering. Deretter synkroniseres godkjent `main → demo`. Sandbox bruker samme kode mot separat Supabase via Demo-buildvernet.
