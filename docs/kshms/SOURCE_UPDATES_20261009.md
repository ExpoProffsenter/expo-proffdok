# Kildeoppdateringsforslag – avgrensning 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Remote feature `3fad9940b11837ec2d91aae1c1c5b6d2212ef827`, tree `43fc1988618c9cddc0906fdf11b55427f9d62471`, main `155f6c4ac01f126c1db0c65da385cfd9305587d5` og draft PR #216 kontrollert før kodeendring. Lokal tree matcher feature. Ingen Production/main/demo-merge eller generell e-postaktivering inngår. Den ene autoriserte testmailen til Kenneths valgte arbeidsadresse avventer fungerende nettleserøkt; den er ikke sendt.

## Scope før implementering

- Håndboken i `src/modules/kshms/KshmsModule.jsx`: åpne en sentral oppdatering gjennom eksisterende editor, kopiere bare eksplisitt valgte felt, kreve eksplisitt helhetsvurdering før `source_revision` flyttes, og vise samlet oppdateringsoversikt under Oppfølging og revisjon.
- Nye avgrensede readmodel-/redigeringshjelpere `kshmsSourceUpdates.mjs`, oversikt `KshmsSourceUpdates.jsx`, sammenligning `KshmsSourceProposal.jsx` og egen CSS. Bare firmaadmin/KS/HMS-ansvarlig med bekreftet eget firma-/brukerscope får oversikten.
- Målrettet critical-test og faktisk React/lagrings-/versjonstest; eksisterende critical-kjede utvides uten svekkede tester. README, HJELP, architecture og gjeldende KS/HMS-status oppdateres.

Ingen nye tabeller, RPC-er, RLS/Storage-, e-post-, signatur- eller global navigasjonsendringer. Eksisterende save/publish/ack og immutable utgaver beholdes. Ingen endring i sentrale fagtekster, kilde-URL-er eller påståtte lovendringer. Dette gjelder nye sentrale ProffDok-forslag; nettbaserte myndighetskilder må fortsatt kontrolleres manuelt. Det er ikke automatisk lovovervåking eller myndighetsgodkjenning.

## Problem og ønsket kontrakt

Tidligere setter «Bruk forslagets [ett felt]» `source_revision` til hele nyeste forslag, selv om resten ikke er vurdert. Ett felt skal bare endre dette feltet og sikre lokal kladd. Bare den særskilte bekreftelsen etter sammenligning markerer hele forslagsutgaven som vurdert. Lagre utkast og firmagodkjenning er fortsatt separate handlinger. Gjeldende publisert utgave og ansattes bekreftelser består til ny godkjenning. Kildenes kontrolldatoer endres aldri bare fordi tekstforslaget er vurdert.

Samlet readmodel skiller «nytt forslag må vurderes» fra «kildegrunnlag vurdert i lagret utkast, ny utgave må godkjennes». Arkiverte, andre firma-/brukerscope og rene egne rutiner skal ikke gis et sentralt oppdateringsvarsel. Forskjeller vises mot firmaets utkast, ikke som en påstått diff i lovverket.

## QA

- Permanent `critical-kshms-source-updates-check.mjs` gjennom eksisterende critical-kjede PASS: enkeltfelt flytter ikke forslagsutgave, eksplisitt vurdering bevarer egne tekster/datoer/historikk, fremtidig utgave senkes ikke, felt/scope avvises, JSONB-nøkkelrekkefølge gir ingen falsk forskjell.
- Faktisk `KshmsModule` og de nye React-komponentene bundlet med Vite, kjørt i JSDOM PASS: eget kildefelt kontrollert manuelt, enkeltfelt/helhetsvurdering sikrer lokal kladd uten serverhandling, lagringsfeil bevarer tekst og gammel v1, retry lagrer bare draft, separat godkjenning lager v2/nye tildelinger uten falske ansattbekreftelser. Oversikt skjules ved feil firma/bruker, deaktivert modul og manglende managerrett.
- `kshms-source-updates-sandbox-check.sql`: **22 assertions PASS** mot eksisterende faktiske Sandbox-RPC. Delvis og full vurdering, rolle/firma/revisjonsavslag, fremtidig kildedato, reader ser v1, v2 med firmaets tekst/kildedato, immutable v1 og historisk bekreftelse, nye tildelinger uten nye bekreftelser, avslått modul/transport. Testfixture oppdatert for eksisterende membership-trigger med ON CONFLICT. Hele transaksjonen rullet tilbake. Direkte sluttkontroll: 0 syntetiske firma og brukere, mail_enabled=false.
- Full lokal `npm run build` inkludert alle critical-checker PASS. Eksisterende varsel om store bundler består; ingen feil. Publisert SHA/tree, Core Safety og READY Preview føres i draft PR #216, uten en ny dokumentcommit bare for selvrefererende commit-ID.

Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve opprettes. Browserverktøyet avviser fortsatt getState/getTab/rewriteDocumentation etter reset med native-credential-state-feil; ingen nettleser-PASS eller ekte e-postlevering påstås.
