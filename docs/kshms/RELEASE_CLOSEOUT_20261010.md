# Verifisert produksjon og kursdemo – 10. oktober 2026

Miljømål: **SANDBOX/DEMO**. Dette sluttarbeidet endrer bare dokumentasjon på demo. Kenneth har autorisert release, mobiltilpasning og fiktivt kursinnhold. Produksjonsfunksjoner skal bevares. Ingen ny produksjonsendring er gjort under denne kontrollen.

## Faktisk status etter gjenopptakelse

- PR #216 er merged. Main er `c3d873e0e5bd2677f0205143de6edc1fbd95ae4c`, tree `75e07665d71047e187111eb7476949fa7902688b`.
- Production `dpl_BHpnnv8bnyo8wU3oLUE9NEsgixd5` er READY på dette head, target production, med `expo-proffdok.app` som alias.
- Main → demo er publisert som `d959b970a32331844bb502e3e7dd088bdcafa74e`, med main som merge-parent. Demo `dpl_27Ze7uN3i9e9CwFkwXSQcHfuHZto` er READY på eksakt head og fast demo-alias. Sluttnotatet kan få en etterfølgende dokumentasjonscommit; appkoden er den samme.
- Publisert Demo-tree `ce7488586d7f41d53e121269f44a43f02259fe3f` er identisk med den gjenfunne lokale koden: alle 813 blob-filer samsvarer. Den lokale snapshot-committen `76f195c5` er ikke den publiserte GitHub-committen; deres tree er identisk.
- Tidlig status om at demo fortsatt var gammel ble avløst av fersk GitHub-/Vercel-kontroll. Ikke gjenta synk eller seed som allerede er ferdig.

## Bevaring og miljøskille

Direkte sammenligning av komplette GitHub-trees: alle 782 main-filer finnes i demo, ingen mangler. 773 er byteidentiske. Seks forskjeller er uendrede eksisterende demo-overlays (index, Vite, tre Sales-filer og Sales lazy-loading-check). To er dokumentasjon. Den siste er én blank linje i prosjektets navigasjonsfil; navigasjonskontrakten er identisk. Ingen nye core-endringer er introdusert av kursinnholdet.

Production har 0 dedikerte kurs-preflight/reset-funksjoner. E-post er enabled=true i Production og false i Sandbox. Privat HR-innhold forblir content_enabled=false og restore_quarantined=true i begge miljøer. Ingen personlige HR-svar, fraværssaker eller diagnoser åpnes av releasen. Produksjonskontrollen var lesende.

## Kontroller i gjenopptatt økt

| Kontroll | Bevis |
| --- | --- |
| Full `npm run build` fra publisert Demo-tree | PASS, alle critical-checks; emitted JavaScript utelukkende bundet til Sandbox |
| Eksisterende server-preflight | 19/19 grønne, faktisk Sandbox med dedikert demoaktør |
| Kurs-preflight | 3/3 grønne: tre HR-maler, SJA/vernerunde/risiko/sjekkliste/RUH og lukket HR/avslått mail |
| Kursreset | Faktisk Sandbox rollback-QA PASS: ordinær signering/fullføring, ferske utkast og bevart signert/fullført historikk; ACL, deaktivert aktør og mail-guard |
| Varige data etter QA | Alle testsignaturer/fullføringer og reset-endringer rullet tilbake; lagret people-course-v1 har tre maler og to utførelser |
| Publisert kursveiledning | Skynettleser PASS på `/demo-course.html`; fem kursdeler og tre lenker vises |
| Desktop på kursveiledningen | 1363 × 936 viewport, scrollWidth 1348; ingen horisontal overflow |
| Publisert kontrollside | Åpner og viser riktig Demo Sandbox; ingen aktiv innlogget økt |

De 22 grønne punktene er **serverbevis**, ikke en grønn innlogget full kontrollside. Nettleserens lokale Badskisse og klientens GitHub-baseline-kontroll er separate punkter.

## Bruk ved kurs

Åpne [kursveiledningen](https://expo-proffdok-git-demo-ringside.vercel.app/demo-course.html). Bruk dedikert demobruker, velg Expo Proffsenter og HOVED-prosjektet. På kontrollsiden: installer lokal demoskisse ved behov og kjør **Kjør preflight**. Alle punkter skal være grønne før viktig kurs/kundedemo. **Tilbakestill kurseksempler** er separat fra Sales/Prosjekt-reset.

Lagrede eksempler og eksisterende demo er beholdt. Ikke signer eller fullfør noe på vegne av ekte ansatte. Personlige samtaler og fravær er fortsatt sperret, mens generelle maler og veiledning er tilgjengelige.

## Gjenstående bevis og videre arbeid

- Ny innlogget kursrunde og grønn full klient-preflight/lokal Badskisse mangler i denne skynettleserøkten. Ingen credential-entry eller kontoendring er gjort.
- Fysisk mobil/kamera og to reelle samtidige brukerøkter er ikke attestert. Tidligere kontroller av responsive bredde-/høyderegler beholdes.
- Den ene autoriserte kontrollmailen til Kenneth er fortsatt ikke sendt/mottaksbekreftet; check-mode er ikke innboksbevis.
- Uavhengig slettemanifest/DB-ack og full isolert Supabase/Auth/Storage-restore gjenstår før personlige HR-samtaler/fravær åpnes. Dette er videre utvikling, ikke levert kursinnhold.

Freeze for nye funksjoner gjelder etter denne releasen. Kritiske feil tas gjennom avtalt scope og QA. Ingen demo → main-synk, ingen ny obligatorisk gjentakelse av tidligere TEST OK.
