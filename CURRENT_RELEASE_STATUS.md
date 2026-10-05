# Release-status – kontrollert 05.10.2026

## Production

- PR #208 er merget etter Kenneths eksisterende Production-godkjenning og TEST OK 05.10.2026 kl. 15:42 Europe/Oslo. Main funksjonscommit: 7acc8782decd2d3ca7c4b7b3154858de4840dabf.
- Deployment dpl_5p8ou9Zxsbcr8BzLwNYYoDvTc1fz er READY, target=production, med riktig main-commit. App og Cordel-asset svarer HTTP 200. Build bekrefter bare Production Supabase. Ingen backend, RLS, data eller eksisterende tilgangs-/recoverylogikk er endret.
- Ferdig: aksepterte/aktiverte tilbud og prosjektets kontraktkort har Last ned til Cordel. Én ZIP med jobbliste og AFG; direkte til samme tomme Cordel-ordre, jobbliste først. Plukklister har prisfri ASCII-eksport. Hjelp → Eksport av tilbud til Cordel har A–Å-flyt og seks TEST-bilder.
- Cordel-metode krever 0 % materiellpåslag og øreavrunding. Reell innkjøpskost, timebudsjett og fortjenestefordeling overføres ikke.
- PC-antall, serverlagrede plukklister, mobilskanning og tidligere recoveryvern er bevart.

## Siste QA

- Full critical-suite, eksakt 11-jobber/30-poster/402164,10-fixture, Core Safety, dokument- og scopekontroll er grønne.
- Preview dpl_A2SyGWarJLz2vN28MxevgXjHNpuc er READY og bygget bare mot Sandbox. Branch-spesifikk EXPO_BACKEND_TARGET=sandbox gjelder kun Preview.
- Kenneth har bekreftet TEST OK for nedlasting, Hjelp og relevante Preview-flater. Lokal nettleser-QA fra implementeringen kontrollerte ZIP, knapper, seks bilder og eksisterende Hjelp.
- Production-verifisering omfatter riktig deployment, miljøbinding, HTTP og Cordel-asset. Innlogget Production-UI er ikke kontrollert i den nye skynettleseren, som ble blokkert under innlogging; ingen Production-testdata er skrevet.

## Demo og neste handling

- Miljømål: BEGGE. Kontrollert main → demo-synk gjenstår. Demo-overlay, Sandbox-binding og eksisterende Golden Demo-data skal bevares.
- Neste: synkroniser main til demo, oppdater kontrollsidens baseline og verifiser Sandbox-build. Innlogget demo-preflight kreves før kurs/kundedemo.
- Ingen branches eller data er slettet. Behold main og permanent demo; gammel feature-branch kan ryddes etter Kenneths bekreftelse.
