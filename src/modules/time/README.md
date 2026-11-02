# Personlig timeinngang

Firmaets eksisterende `TimeSetup` eier `enabled`. `mobile_shortcut` er et separat valg. HRs autoriserte administrasjonsinngang må finnes også når timeføring er avslått, slik at firmaadmin kan åpne oppsettet.

`usePersonalTimeAccess` bruker `createTimeSession` og `time_tasks_get`. Bare et ferskt svar med riktig bruker/firma og `enabled === true` åpner Min sides personlige timeinnganger. Det innfører ingen ny rettighet eller lagring av firmaoppsett. Hooken deler det samme bekreftede svaret med `PersonalTimeCard`.

Under ny kontroll i samme scope beholdes bare navigasjonsfaktumet. Data skjules. Min sides `TimeSurface` holder native arbeidsflate og `DialogPortalTarget` montert, slik at også underdialogen skjules og kladden bevares. Ferskt ja-svar viser samme editor. Bekreftet av eller 42501 fjerner inngangen og velger I dag dersom Mine timer var valgt. Andre lesefeil beholder valgt inngang og tilbyr **Kontroller timeføring igjen**. Profil og andre valgte arbeidsflater påvirkes ikke.

Focus, visibility, arbeidsprofil, tilgang og lagret `TIME_SETTINGS_EVENT` kontrollerer på nytt. Epoch/dispose og eksakt resultatkontekst avviser gamle svar ved nytt scope. Eksisterende TimeSheet eier fortsatt felt, RAM-kladd, timer, kvitteringer, innlevering og serverkontroller. Ingen timekommando sendes av inngangsgaten.

`TimeField` beholder barn og deres props/handlers. Native input/select/textarea kobles til stabilt etikett-ID, også etter innskriving; øvrige barn beholdes. `time-subflows-036-browser-check.mjs` verifiserer faktiske skjemaer, utlegg/vedleggsfelt, historikk, kontroll, oppsett og eksport med sen app-CSS og isolerte lesekall. Den erstatter ikke eksisterende React-/database-/Storage-/eksportprøver.
