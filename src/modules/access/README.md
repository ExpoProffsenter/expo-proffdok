# Arbeidsprofil og representert firma

Arbeidsprofilklienten henter og publiserer serverens tilgjengelige firmaer. Database/RLS eier faktisk tilgang. Vanlig firmabytte har eksisterende bekreftelse, serverlagring og kontrollert reload; systemadmins Representerer-valg og supportmodus er separate flyter.

`workProfileUx.jsx` viser velgeren i eller under headeren avhengig av skjermbredde. Responsiv flytting av en eksisterende velger skal bevare samme host/React-root, påkrevd førstegangsvalg, ventende engangsvalg, serverfeil og åpen meny. Tilgjengelig fokus beholdes ved flytting. Layoutendring skal aldri starte et firmabytte.

Bortfalt bytterett, færre enn to firmaer, portal og eksplisitt supportmodus skal fortsatt fjerne velgeren. Escape lukker vanlig meny og gjenoppretter åpnerfokus, men kan ikke omgå påkrevd førstegangsvalg. Bekreftelse og lagring skal ikke kobles til montering, resize eller fokusretur.

## Samlet supportøkt – deaktivert utviklingsgrunnlag

PR319 bygger en separat økt med faktisk systemadminaktør, valgt kundebruker og firma. `appSupportRuntime.mjs` er ennå **ikke installert i bootstrap**. Vanlig innlogging, arbeidsprofil og lokal lagring bruker eksisterende kode. Ikke aktiver migrasjonenes innstillinger eller PostgREST-hook før gjenstående transport-/UI-arbeid og QA er ferdig.

Se [supportarkitektur](../../../docs/architecture/APP_SUPPORT_SESSION.md) for kontrakt, avgrensninger og aktiveringskrav. [QA-loggen](../../../docs/qa/SUPPORT_APP_UX_20261111.md) skiller testet lokalt grunnlag fra publisert funksjon.
