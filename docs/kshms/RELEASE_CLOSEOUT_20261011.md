# HR og navigasjon – godkjent release 11. oktober 2026

Kenneth ga «test ok» 11. oktober 2026 kl. 14:17 Europe/Oslo. Dette godkjenner popup-/navigasjonsrettelsene i PR #219 og Sandbox-prøvesamtalen i PR #218. Eldre «draft», «ingen merge» og «TEST OK gjenstår» i daterte arbeidsnotater er historikk.

PR #219 er merget som `2a2d16d29f5749c1d36724db5ac5be80c0822d35`; PR #218 som `f6a74d828fb4c0110b4eae8c6e453d2a55ee9038`. Production er READY på sistnevnte SHA, deployment `dpl_4HRLSUAtink1hC3AhPAJ4K3p8rjr`, på https://expo-proffdok.app. Anonym HTTP-/assetkontroll bekrefter riktig Production-backend og publisert HR-popupkode.

Begge obligatoriske CI-kontroller etter ready-for-review er grønne: runs `38138777739` og `38139167429`. Samlet kildekode er kontrollert med bygg, faktisk React/access-hook-regresjon, Chromium på desktop/mobilbredder og eksisterende PDF-/samtidighetskontroll. Production-gate for prøvesamtalen er kontrollert separat.

Demo synkroniseres kun main → demo med denne main-committen som kodebaseline. Eksisterende demo-overlegg, medier, kursdata og backend beholdes. Overleggets baselinekonstant oppdateres; ingen seed, reset, migrasjon eller databaserad endres i denne releasen. Full Sandbox-bygg og beskyttet overleggskontroll er grønne. Read-only aggregatkontroll av de 22 eksisterende data-/infrastrukturpunktene er 22/22 grønn, inkludert kursinnhold og stengt personlig HR. Dette er ikke en ny attestasjon av innlogget klient-preflight eller autorisasjonstesting.

Den faste demo-adressen er https://expo-proffdok-git-demo-ringside.vercel.app. Endelig demo-commit og deployment registreres i PR-ene etter publisering. Innlogget nettleserautomatisering er fortsatt stoppet av tidligere credential-beskyttelse; ingen innlogging omgås. Brukerens TEST OK er den manuelle vurderingen av den aktuelle arbeidsflyten. Personlig HR forblir stengt (`content_enabled=false`, `restore_quarantined=true`).
