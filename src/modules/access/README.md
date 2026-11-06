# Arbeidsprofil og representert firma

Arbeidsprofilklienten henter og publiserer serverens tilgjengelige firmaer. Database/RLS eier faktisk tilgang. Vanlig firmabytte har eksisterende bekreftelse, serverlagring og kontrollert reload; systemadmins Representerer-valg og supportmodus er separate flyter.

`workProfileUx.jsx` viser velgeren i eller under headeren avhengig av skjermbredde. Responsiv flytting av en eksisterende velger skal bevare samme host/React-root, påkrevd førstegangsvalg, ventende engangsvalg, serverfeil og åpen meny. Tilgjengelig fokus beholdes ved flytting. Layoutendring skal aldri starte et firmabytte.

Bortfalt bytterett, færre enn to firmaer, portal og eksplisitt supportmodus skal fortsatt fjerne velgeren. Escape lukker vanlig meny og gjenoppretter åpnerfokus, men kan ikke omgå påkrevd førstegangsvalg. Bekreftelse og lagring skal ikke kobles til montering, resize eller fokusretur.
