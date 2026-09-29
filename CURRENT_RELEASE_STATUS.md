# Gjeldende release-status – 29.09.2026

## Production

- PR #201 «Mobil Prissøk: Startside og EAN-skanning» er merget til `main` etter Kenneths `TEST OK` og `PRODUCTION GODKJENT`. Feature-merge: `0f61d1972e16afc40b8782319b4380f9c2099250`.
- Vercel Production-deployment for PR #201: `dpl_8hsM84W5Qj2PmJUWk1Zj24EhmEBn`, `READY`, `target=production`. https://expo-proffdok.app svarte 200 OK. Deployet klient hadde Production Supabase-ref og ingen Sandbox-ref; avgrenset runtime-kontroll fant ingen error/fatal.
- Mobil Prissøk har `← Startside` gjennom eksisterende close-flyt, skanning via bakre kamera når tilgjengelig, manuell EAN-fallback og eksisterende read-only RPC-søk. Kameraspor stoppes ved treff, avbrudd, navigasjon og bakgrunning. Desktop, prisrettigheter, database, lagring av varer/priser/historikk og intern nto-maskering er uendret.
- Supportmodus-rettelsen i PR #200 er ferdig og ikke del av mobilendringen.

## Permanent Demo Sandbox

- Godkjent Production-kode er synkronisert `main → demo` via PR #202. Demo-merge: `b98f7883b77f0b8ce1ebb0746a7f54101bf24a2d`.
- Fast Demo-deployment `dpl_5YaBnNU8Rkp9J1BDqSaUy7mDDSJC` var `READY`; app og `/demo-control.html` svarte 200 OK. Deployet klient hadde Sandbox Supabase-ref og ingen Production-ref; avgrenset runtime-kontroll fant ingen error/fatal.
- `npm run check:critical`, Sandbox-bundet build og diff-kontroll var grønne ved synk. Demo-overlay, kontrollside og demobilder ble bevart. Ingen demo-kode flyter tilbake til `main`.

## Åpent før viktig demo

- Kjør den innloggede knappen **Kjør preflight** på https://expo-proffdok-git-demo-ringside.vercel.app/demo-control.html. Dette ble ikke fullført i skybrowseren: dens gateway svarte 502, mens Vercel bekreftet 200 på det faste Demo-hostet. Innlogget preflight skal verifiseres før Demo regnes som fullt klar til kurs/visning.
- `main` og `demo` er de varige branchene. Midlertidige feature-/sync-brancher kan ryddes etter godkjent utrulling; ingen branch skal merges `demo → main`.
