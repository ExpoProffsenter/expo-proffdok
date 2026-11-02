# Pågående godkjent Design 036-release – 2. november 2026

Kenneth ga TEST OK 2. november kl.16:02 CET for PR294, PR295, PR298 og sjekklistefunksjonen fra PR305, med nødvendige backendkontroller, produksjonssetting og main → demo. Ingen PR217/277, nye funksjoner eller branchopprydding inngår.

## Fersk base for boligpakken

PR305 er merget til main 2e5a56912a93f79dddf20889f894a7297157b1a9, etter CI883 SUCCESS10/10. Production er READY på dpl_inoWqc5W4gmByAxMgYzQ5FonHZ9k. Malforslagsmigreringen er installert som remote20261102151721 fra canonical20261031012504; historikk, signaturkrav og tilgangsvern er kontrollert og bevart. Releasen er ikke ferdig før de øvrige godkjente pakkene og demosynken er verifisert.

Denne PR294-oppdateringen integrerer bare fersk main. Boligproduktfilene er identiske med det godkjente c3594f108d605aeae0d895b9d8e71b1824d1f854. Eneste konflikt var denne statusfilen. Original bolig-/produksjonshistorikk er bevart i Git på c3594f10 og main2e5a; ingen funksjonsbevis eller tester slettes. Den allerede godkjente datouavhengige HR-fixturen følger med main og erstatter ingen produktkode.

Fersk kombinasjonsprøve av PR295 d9ca45e0 + PR294 c3594f10 + PR298 338094b1 består native bolig/builder/veiledning/oppgaver/kontroller/UE/uttrekk, malforslag44SQL og170browser samt begge miljøbuilds. Seks PDF-er og tre ZIP-er er faktisk generert fra syntetisk transport med original innholds-/tilgangs-/CRC-kontroll. Dette er ikke full ny innlogget rolle-/Safari-attest. Sluttstatus for denne nye kandidaten må leses i CI/PR-historikken.

Permanent demo er fortsatt fd04ac9a og skal få faktisk main først etter godkjent produksjonskontroll. Demoens SQL-preflight19/19 og kurs5/5 består uten reset, sending eller dataendring. Rutine-e-post forblir deaktivert.

Historikk: docs/changes/bolig-checklist-status-choices-20261031.json og øvrige boliggrunnlag, samt CURRENT_RELEASE_STATUS.md på de nevnte uendrede Git-committene. Samlet sluttkvittering føres i PR295 og varig releaselogg.
