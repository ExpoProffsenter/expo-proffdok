# Gjeldende leveransestatus – 14.11.2026

[PR338](https://github.com/ExpoProffsenter/expo-proffdok/pull/338) er merget som `2385a144d6628ea2f8db791f295b99766e1e9c5a`. «Rediger prosjektinfo» ligger ved prosjektnavnet og under Oppsett → Bygg og boliger. Skjemaet åpnes i dialog med bevart kladd. Kun prosjektleder på aktivt prosjekt kan redigere. Bolig uten valg viser «Grunnpakke og tilvalg er ikke klargjort» ved tomt pakkeoppsett, ellers «Boligvalg ikke startet». Lagrede valg, endret grunnlag og øvrige statuslag beholdes.

Verifisert: PostgreSQL2035, React, build/critical og hele CI43631861468 PASS på kandidat26996f7a46b06ccae1f24a8f214048d5162b971c. Førstesidens100 kontroller og boligveiledningens276 kontroller inkluderer den nye dialogen ved320/390/1363px, kladd, focus, Escape og tilgang. Første CI fant økt topphøyde; rettet uten svekket test. Migrasjon bolig_catalog_setup_status er installert én gang i begge miljøer. Faktisk produksjons-RPC som Orveis prosjektleder returnerer catalog_empty=true. Ingen pakker, beboerdata eller e-postinnstillinger er endret. Ingen reell test-e-post sendt. Innlogget produksjons-UI er ikke prøvd på nytt; UI er kontrollert med faktiske komponenter i Chromium og publiserte ressurser etterkontrolleres.

[PR337](https://github.com/ExpoProffsenter/expo-proffdok/pull/337): «Publiser nå» og dialog behandles hele døgnet. Dialog samles i to minutter. Datoplanlagte varsler publiseres fra08 på valgt dato. Automatiske fristpåminnelser krever prosjektvis opt-in og starter08–18 Europe/Oslo. Orvei har dem av. Beboer-/partnerlenke- og fremdriftstransport er aktive i produksjon; demo har transport av. Import og lagring av plan sender ikke beboervarsler.

Orvei/Aamodthagen: 29bygg,126boliger,151eiere,1260aktiviteter og126bestillingsfrister ([PR335](https://github.com/ExpoProffsenter/expo-proffdok/pull/335)). Grunnpakke og tilvalg skal fortsatt være tomme. Kenneth har personlig butikktilgang i30dager. Ingen aktive aktivitetstitler inneholder Orvei-plan. Fasadebokser har82prosent dekning ([PR336](https://github.com/ExpoProffsenter/expo-proffdok/pull/336)).

Main → demo synkroniseres kontrollert med bevart overlay og data. Endelige SHA-er, READY-status, faktiske produksjons-/sandboxbindinger og siste preflight føres i PR338, som er releasefasit. Ingen seed/reset eller eksterne prøveutsendinger.

Tilbakeføring av PR338: revert appendringen. Det prisfrie catalog_empty-feltet kan bli stående bakoverkompatibelt. Ingen datatilbakeføring nødvendig. E-postpolicy og aktiveringstidspunkt fra PR337 beholdes. Sikkerhetsrådgiverens eksisterende generelle funn er uendret og er ikke erklært løst.

## Permanent demo

Synkronisert fra main `93e948775ff327534d297e24df8f15e181c57ca6` med bevart demo-overlay og Sandbox-data. Build/critical og kontrollside-regresjon bestått. Faktisk sandbox-preflight og kurssjekker er grønne; transport er fortsatt av. Endelig demo-SHA og READY dokumenteres i PR338.
