# Hjelp-modulens HR-kontrakt

Denne filen dokumenterer eksisterende Hjelp og HR-veiledning for vedlikehold. Den er ikke importert i appen og endrer ingen synlig tekst, navigasjon eller tilgang. `helpToolsCore.js` beholder komplett innhold; `helpTopicGroups.mjs` grupperer kapitlene under KS/HMS og HR. Kontekstuell hjelp i HR skiller firmaadmin, leder og personlig bruker.

## Slettekvitteringer i draft H5b

HR → Slettekvitteringer viser oppfølgingen av en registrert sletting for autoriserte brukere. Tilgang til slettet medarbeiderinnhold sperres straks. «Slettet» skal først vises når både filjobber og den uavhengige bekreftelsen er ferdige; en ventende kvittering er ikke ferdig sletting. Oppdatering skal lese faktisk serverstatus, uten å gjøre en lokal antakelse om fullføring. Eksisterende ansvar, firmagrense og leserettigheter gjelder fortsatt.

Brukeren skal ikke opprette skyobjekter, kopiere token, reparere anker eller aktivere privat HR for å få ferdig status. Dette er separat drift med teknisk QA. Private referater, svar og diagnoser inngår ikke i den minimale eksterne slettekvitteringen. En ny lagret samtalemal starter ingen personlig samtale og sender ingenting til ansatte.

## Leveringsgrense 10. oktober 2026

Ett separat **expo-hr-control** er nå opprettet for teknisk drift til senere Production. Det gir ingen ny brukerhandling eller åpen HR-port. Varig kontrollpunkt/lås og service-only RPC-er er installert, med rollback-QA og syntetiske adapterfeilprøver; betrodd anker, ekte sky/runtime/scheduler/restore gjenstår. Kursdemoen trenger ingen egen permanent kontrolljobb med privat HR stengt. [Presis drifts-/QA-grense](../../../ops/hr-control/README.md). Eksisterende Hjelp-/HR-brukerflate er uendret.

Production har levert generell HR-hjelp, samtalemaler, sykefraværsveiledning og organisasjonskart gjennom merged PR #216. H5b tilhører bare draft PR #217/Preview/Sandbox. Personlige samtaler, private HR-svar og sykefraværssaker er fortsatt stengt i Production og Sandbox. Et nytt tomt privat lager beviser ikke faktisk skybekreftelse eller restore. Ingen ny brukeromtest av tidligere TEST OK kreves uten en konkret regresjon.

[H5b-kontrakt, status og QA](../../../docs/kshms/HR_LEDGER_ACK_20261010.md) og [driftskrav/restoreprotokoll](../../../docs/kshms/HR_LEDGER_OPERATIONS_20261010.md) angir faktisk bevis og gjenstående krav. Behold eksisterende sperrer og runtime-prøver; dokumentasjonen gir ingen merge-/åpningsautorisasjon.
