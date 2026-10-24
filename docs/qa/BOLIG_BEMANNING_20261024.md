# Faktisk bemanning – 24. oktober 2026

Miljømål BEGGE. Utførelse bare eksisterende feature/Preview og Sandbox ppvircenkjizeiqdxphj. Produksjon, main, permanent demo, eksterne grants og e-post er urørt. Baseline 6259b774; main 36462e2b. PR278 skal fortsatt være OPEN DRAFT, ingen samlet Bolig TEST OK.

## Scope og bruk

BoligAttendance-komponent, egen hook/CSS, ett menyvalg under Oppsett i BoligEntry. Additiv privat migration 20261024011416_bolig_attendance med egen invoker-gateway og kontekstkontrollert privat definer. Nye scenarioer, én innkobling i eksisterende DB-runner og ekstra browserkommando i CI. Ingen eksisterende gateway/migrasjon, Sales-, fremdrifts-, HR-, KS/HMS- eller navigasjonskjerne endret.

Oppsett → Faktisk bemanning → Aktiver bemanning. Prosjektleder velger Registrer deltaker inn, navn/firma og tidspunkt, deretter Lagre registrering. Grønn/rød status har tekst. Registrer ut / rett tidspunkt åpner samme registrering; begrunnelse kreves. Registreringshistorikk viser før/etter, tidspunkt og registrerende bruker. Prosjektdag henter tidligere dager; åpne registreringer fra tidligere dager følger med og merkes. CSV inneholder navn/firma/inn/ut, prosjekt og prosjektdag; formelstart escapes. Deaktivering beholder historikk. Arkivert prosjekt kan leses, ikke skrives.

Første del er prosjektleders manuelle liste. Ingen nye roller eller person-/UE-grants, anonym innlogging, lønn/timeføring eller automatisk varsel. Kun eksisterende manager får lese/skrive; vanlig reader og eksterne har ikke innsyn i personlisten. Egen håndverkerregistrering og eventuelt utvidet lesing må avklares. Ingen bookingmodell, kontraktsdeling eller SJA/Min side-kobling er oppfunnet.

## Lagringskontrakt

Eget aktiverings-/revisjonsgrunnlag per hovedprosjekt, registreringer med stabile UUID-er og append-only hendelser. Root/share-lås og egen advisory-lås serialiserer mot arkiv og samtidige skriver. Eksakt request-ID/payload/actor-kvittering tillater replay etter tapt svar uten dublett og uten å gjeninnføre gamle verdier. Nyere revisjon krever gjennomgang. Private tabeller har RLS og ingen direkte grants; gateway kontrollerer fersk identitet/firma/manager hver gang. Kladd og ventende request sikres lokalt per bruker/firma/root. Skjuling/feilet lesing sperrer innhold; fokus/gjenopptak leser på nytt. Tid tolkes eksplisitt Europe/Oslo på server, ikke maskinens tidssone. Fremtidige eller omvendte tider avvises.

## Faktisk QA før publisering

- DB1492 assertions PASS (1458 tidligere +34 nye): av/på, inn/ut, opprinnelig historikk, obligatorisk begrunnelse, replay/endret replay, konflikt, datoavgrensning, disable-bevaring, reader/fremmed firma/revokering/arkiv, eksisterende prosjekt uendret.
- Ny Chromium14 PASS: mount uten skriv, kladd ved fokus/reload, tapt svar med eksakt retry, konflikt/gjennomgang, retting/historikk, CSV-download, mobilbredder320/390/768 og desktop1366, simulert skjuling/gjenopptak og revokering. Mocked RPC; dette er ikke innlogget ende-til-ende.
- Eksisterende Foundation React, overview42, rooms51, boundary51, scope/release-docs PASS. Full critical Sandbox-build PASS. Fysisk Safari/iPhone er ikke testet.
- Sandbox migration først syntaksprøvd i rollback, deretter additivt installert. Filnavn avstemt med serverens faktiske versjon.

## Eksisterende CI-feil og sammenligning

CI673/40039811087 på baseline6259 er SUCCESS. CI672-loggen viser zoom-testens horisontale scrollLeft150→0 mens scrollTop360 og ytre scroll318.1818 beholdes. Testfilen er byte-identisk med main36462e2b (SHA256 d1cab46ab40c2b937e2a87fa08f8641b23790fccf171b58a02595fea05e8a06). Lokal feature-test28 PASS. Dette beviser symptomet og fravær av testendring, ikke endelig rotårsak; ingen fremdriftskode/test endret eller svækket. Main-runtime på separat, uendret checkout gav også28 PASS med samme nettleser/avhengigheter. Endelig rotårsak er fortsatt uavklart.

## Kartlagte integrasjoner og avklaringer til Kenneth

SJA har allerede project_id, separat prosjektavgrenset kladd og kshms_sja_command. RUH/avvik bruker prosjektkobling i kshmsDeviations.mjs og bekrefter project_id i lagringssvaret. Bolig har hovedprosjekt/bygg/bolig-ID-er; enkelte boliger har en egen ordinær project_id. Disse ID-typene kan ikke likestilles stille.

Min side (PersonalPage.jsx) har Oversikt, Mine timer, Mine oppfølginger og Mine aktive planer. Neste kobling må velge oppgavekilde og rettigheter før nye boligoppgaver vises der.

1. Skal SJA/RUH knyttes til hovedprosjekt, bygg, bolig eller rom, og kan én sak gjelde flere?
2. Hvilke Bolig-oppgavetyper skal vises på Min side, med hvilken ansvarlig og hva lukker oppgaven? Hvem får fristvarsel?
3. Håndverkerens egen registrering: hvilke eksisterende navngitte identiteter skal brukes? UE-lenker alene gir ikke sikker personidentitet.
4. Bookingstyring og selvbooking, og privat kontraktsområdes særskilte personrettigheter, er fortsatt uavklart. Excel sist.

Publiserings-SHA, CI, Sandbox-smoke og faktisk Preview-prøve oppdateres etter publisering. Ingen påstand om full app-regresjonsgaranti.

Sandbox native Auth/gateway/direct-table rollback-smoke PASS: aktivering, registrering, retting, eksakt retry og uendret ordinært prosjekt. Alle prøveskriver rullet tilbake. Security-advisors: WARN-antall uendret i alle fem kategorier; tre nye INFO for bevisst deny-all private tabeller.
