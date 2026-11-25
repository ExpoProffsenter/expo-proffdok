# Pågående – direkte beboerbekreftelse 25.11.2026

Miljømål BEGGE, PR350, branch fase45b-resident-direct-confirm-20261125. Kenneth har gitt TEST OK og bekreftet mottak av begge prøvekvitteringer. Godkjent kandidat74ea3c hadde alle10 CI-jobber grønne. Etterspurt avgrenset tillegg: Se som beboer viser sendeknappene deaktivert og tillater lokale valg/Se over valget uten lagring eller RPC. Ny Chromium45 PASS; siste CI/Preview må kontrolleres før autorisert Production og main→demo. Sandbox er installert og testutsending AV; Production er fortsatt d57645ca og demo178a6f44. Eksisterende Aamodthagen omfattes ved aktivering. Fortsett fra docs/qa/HANDOFF_20261125_RESIDENT_CONFIRMATION.md.

Gjeldende test- og utrullingsstatus: [QA](docs/qa/BOLIG_DIRECT_CONFIRMATION_20261125.md).

---

# Gjeldende leveransestatus – 25.11.2026

[PR349](https://github.com/ExpoProffsenter/expo-proffdok/pull/349) gjelder prisfri leveranseoversikt til håndverkeren i boligen, med bilder, bolig/adresse, automatisk én/to kolonner, sidemerking og bevarte merknader. Utskriften ligger i egen del «Til håndverkeren i boligen», utenfor varebestilling. Kundens prisvisning/bestillingsbekreftelse i beboerportalen beholdes. Kenneth har gitt TEST OK25.11.2026. PR349 er fasit for grønn sluttkontroll, publisert Production-SHA, kontrollert main→demo, databaseinstallasjon og tilbakeføring.

Tilbudsdato og flyttbar «Ny fri tekst» er tidligere publisert gjennom PR347/348. Ingen rutine-e-post aktiveres og ingen reelle prøvebestillinger sendes av utskriftsarbeidet. Ny lesende bolig_work_order er eneste produksjonsmigrasjon i PR349 og skal bare installeres hvis funksjon/migrasjon fortsatt mangler. Tilbakeføring av utskriften: revert appendringen; den lesende funksjonen kan stå uten datatap.

## Tidligere leveransestatus – 14.11.2026

[PR338](https://github.com/ExpoProffsenter/expo-proffdok/pull/338) er merget som `2385a144d6628ea2f8db791f295b99766e1e9c5a`. «Rediger prosjektinfo» ligger ved prosjektnavnet og under Oppsett → Bygg og boliger. Skjemaet åpnes i dialog med bevart kladd. Kun prosjektleder på aktivt prosjekt kan redigere. Bolig uten valg viser «Grunnpakke og tilvalg er ikke klargjort» ved tomt pakkeoppsett, ellers «Boligvalg ikke startet». Lagrede valg, endret grunnlag og øvrige statuslag beholdes.

Verifisert: PostgreSQL2035, React, build/critical og hele CI43631861468 PASS på kandidat26996f7a46b06ccae1f24a8f214048d5162b971c. Førstesidens100 kontroller og boligveiledningens276 kontroller inkluderer den nye dialogen ved320/390/1363px, kladd, focus, Escape og tilgang. Første CI fant økt topphøyde; rettet uten svekket test. Migrasjon bolig_catalog_setup_status er installert én gang i begge miljøer. Faktisk produksjons-RPC som Orveis prosjektleder returnerer catalog_empty=true. Ingen pakker, beboerdata eller e-postinnstillinger er endret. Ingen reell test-e-post sendt. Innlogget produksjons-UI er ikke prøvd på nytt; UI er kontrollert med faktiske komponenter i Chromium og publiserte ressurser etterkontrolleres.

[PR337](https://github.com/ExpoProffsenter/expo-proffdok/pull/337): «Publiser nå» og dialog behandles hele døgnet. Dialog samles i to minutter. Datoplanlagte varsler publiseres fra08 på valgt dato. Automatiske fristpåminnelser krever prosjektvis opt-in og starter08–18 Europe/Oslo. Orvei har dem av. Beboer-/partnerlenke- og fremdriftstransport er aktive i produksjon; demo har transport av. Import og lagring av plan sender ikke beboervarsler.

Orvei/Aamodthagen: 29bygg,126boliger,151eiere,1260aktiviteter og126bestillingsfrister ([PR335](https://github.com/ExpoProffsenter/expo-proffdok/pull/335)). Grunnpakke og tilvalg skal fortsatt være tomme. Kenneth har personlig butikktilgang i30dager. Ingen aktive aktivitetstitler inneholder Orvei-plan. Fasadebokser har82prosent dekning ([PR336](https://github.com/ExpoProffsenter/expo-proffdok/pull/336)).

Main → demo synkroniseres kontrollert med bevart overlay og data. Endelige SHA-er, READY-status, faktiske produksjons-/sandboxbindinger og siste preflight føres i PR338, som er releasefasit. Ingen seed/reset eller eksterne prøveutsendinger.

Tilbakeføring av PR338: revert appendringen. Det prisfrie catalog_empty-feltet kan bli stående bakoverkompatibelt. Ingen datatilbakeføring nødvendig. E-postpolicy og aktiveringstidspunkt fra PR337 beholdes. Sikkerhetsrådgiverens eksisterende generelle funn er uendret og er ikke erklært løst.

## Permanent demo

Synkronisert fra main `93e948775ff327534d297e24df8f15e181c57ca6` med bevart demo-overlay og Sandbox-data. Build/critical og kontrollside-regresjon bestått. Faktisk sandbox-preflight og kurssjekker er grønne; transport er fortsatt av. Endelig demo-SHA og READY dokumenteres i PR338.
