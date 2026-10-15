# Firmaadmin-isolasjon 15. oktober 2026

Miljømål BEGGE. Fra main a5b27fd61630ec878a244c2aab6ad76b6f6efa62 / publisert PR #249. Kenneth ga TEST OK for invitasjonsleveransen og ville prøve faktiske produksjonsbrukere. Under prøven meldte han at alle firmaer dukket opp under Firmaadmin i Bademiljø Expo. Dette er regresjonsretting av samme leveranse, ikke en ny tilgangsfunksjon.

## Bevist årsak

company_admin_snapshot i produksjon returnerer korrekt Bademiljø Expo / 10 medlemmer for Kenneths aktive arbeidsprofil. get_my_work_profile_state gir bare tre interne arbeidsfirmaer. Den eksisterende globale list_managed_module_access returnerer 39 brukere for systemadmin. systemAdminCompanyAccessUx søkte globalt etter h3 «Brukere og tilganger» og valgte den nye Firmaadmin-flaten. Det monterte global firmavelger med de allerede eksisterende systemadmin-rettighetene. Tre andre legacy-adaptere brukte samme ubundne søk.

Ny Chromium-prøve på før-koden med alle fire reelle adaptere feiler på `global Systemadmin firm navigator must never mount inside Firmaadmin`, actual 1 / expected 0. De tidligere 31 kontrollene testet selve React-flaten uten disse observatørene og fanget ikke integrasjonsfeilen.

## Rettelse og scope

Ny systemAdminSurface.js søker bare innen section med direkte h2 Systemadmin, og avviser data-company-admin=unified eksplisitt. Firmavelger, samlede brukerkontroller, ekstra arbeidsprofiler og firmamodal bruker samme avgrensning. Omdøping av accordion-knapper er avgrenset på samme måte. Den nye Firmaadmin-komponenten og serverens autorisasjon er uendret. Ingen endring i main/bootstrap, meny, Sales, recovery, SQL/RLS, medlemskap, rutine-e-post eller workers.

## QA

- 40 faktiske Chromium-kontroller med React og alle fire eksisterende systemadmin-adaptere; kun transportdata er syntetiske.
- Før-fiks reproduksjon: global navigator monteres inne i Firmaadmin.
- Etter-fiks: ingen global firmaliste eller systemadminkontroller i Firmaadmin; overskriften forblir riktig; urelatert proffkunde er fraværende.
- Samtidig Systemadmin-seksjon får fortsatt den globale firmalisten, samlede brukerkontroller og arbeidsprofilkontroller. Etter at den fjernes, flyttes ingenting til Firmaadmin.
- Eksisterende rolle/modul/People-valg, invitasjonsvalg, e-postpayload/feilmelding, firmaswitch, sene svar, tilbakekalling, endret aktør og 320/390/1280 uten overflow består.
- Full sandbox critical/build består. Eksakt PR-CI og Preview kontrolleres før publisering.
- Production-diagnostikk lesende / rollback. Ingen ekte e-post eller faktisk kundetest påstås. Kenneth gjør innlogget prøve med egne brukere.

## Test i appen

Åpne Bademiljø Expo → Firmaadmin. Du skal se Bademiljø Expo, Legg til ansatt og de ansatte i dette firmaet. Den globale firmalisten skal være borte her. Systemadmin → Firmaer, brukere og tilganger skal fortsatt vise den samlede systemadmin-listen.
