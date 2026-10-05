# Release-status – kontrollert 05.10.2026

## Production

- Main inkluderer godkjent PR #207 med PC-antall, serverlagrede plukklister og separate utskrifter. Cordel PR #208 er ennå ikke merget.
- Gjeldende Production-deployment er READY på main. Tidligere mobilskanning, recoveryvern og tilgangsregler er bevart.

## Aktiv release

- PR #208: Cordel-eksport av låste aksepterte tilbud og prisfrie plukklister, med Hjelp → Eksport av tilbud til Cordel og seks TEST-bilder.
- Miljømål: BEGGE. Kenneth har eksplisitt godkjent denne avgrensede endringen for Production; ingen andre funksjoner skal endres.
- Tilbud: én ZIP, jobbliste først og AFG deretter på samme tomme Cordel-serviceordre. Faste filnavn under P:\Expo ProffDok. 0 % materiellpåslag og øreavrunding kreves. Innkjøpskost, timebudsjett og fortjenestefordeling overføres ikke.
- Full critical-suite, Cordel 11-jobber/30-poster/402164,10-test, Core Safety og dokumentkontroll er grønne. Publisert funksjonskode er identisk med lokalt kontrollert bygg. Tidligere lokal nettleser-QA verifiserte ZIP, knapper og Hjelp med seks bilder.
- Første Preview var feilaktig bygget med Production-binding. Ingen QA-skriving er utført. Branch-scopet EXPO_BACKEND_TARGET=sandbox er nå satt på Vercel for feat-cordel-export, kun Preview. Nytt bygg skal verifiseres før merge.

## Demo og neste handling

- Permanent demo har PR #207 og bevart Sandbox-overlay. Ingen demo → main-synk.
- Neste: verifiser nytt Sandbox Preview og relevant brukerflate, merge godkjent PR #208, målrettet Production-QA, deretter kontrollert main → demo og preflight.
