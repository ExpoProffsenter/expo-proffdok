# Gjeldende release- og miljøstatus – 2. november 2026

## Nyeste arbeid: Prosjektinvolverte og korrigert miljøtilgang

Arbeidsbranch `design01-app-ramme-20261028`, PR295. Baseline før deltakerrettelsen: `4aaac8eebbf43414e03c69bdc0b860d18e847f58`, full CI878 SUCCESS10/10 og fast Preview READY. Ny rettelse er bare skjerm-CSS for deltakerpanelet: samme typografi som faktiske kunde-/prosjektfelt, uten endret lagring, tilgang, sending eller navigasjon. 156 nye native nettleserkrav og de opprinnelige23 deltakerkravene består; 36 kundefeltkrav og critical/build består. Eksakt ny commit/CI/READY skal leses i siste PR295-kommentar, ikke utledes fra dette dokumentet.

**Korrigering:** Demo-databasen er tilgjengelig som Supabase-branchen `demo-sandbox` (`ppvircenkjizeiqdxphj`) under Production `dqffxflaoyarbxyiyhop`. READ ONLY/ROLLBACK-spørringer virker i begge. Tidligere konklusjon om manglende Sandbox-tilgang basert på prosjektoppslag var for bred og trekkes tilbake. Den gamle innloggede skynettleserøkten er fortsatt ikke gjenopprettet; det er en separat begrensning.

[Full datert branch-/miljøavstemming, test og grenser](docs/qa/PROJECT_PARTICIPANTS_ENVIRONMENT_AUDIT_20261102.md) · [Endringsgrunnlag](docs/changes/project-participants-typography-20261102.json) · [Releasekandidat med korrigert tilgangsstatus](docs/qa/DESIGN_036_RELEASE_CANDIDATE_20261102.md).

## Miljøer og åpne leveranser

- Production/main: `b389c707`, READY `dpl_HCNMdakvBh8qLupibztefMgrvBc8`, https://expo-proffdok.app. Uendret.
- Permanent demo: `fd04ac9a`, READY `dpl_H8cXav9UGpnofomAu6pbN6Rt8CTq`, https://expo-proffdok-git-demo-ringside.vercel.app. Uendret.
- Fast design-Preview: https://expo-proffdok-git-design01-app-ramme-20261028-ringside.vercel.app/?progressTest=safe. Kun denne arbeidsbranchen oppdateres.
- PR295 design og inkludert PR305-sjekklistefunksjonalitet har ikke samlet TEST OK. Production mangler fortsatt den nødvendige additive malforslagsmigreringen. Ingen installasjon som del av denne CSS-rettelsen.
- PR294 og PR298 er fortsatt separate draft-leveranser. PR217 og PR277 er også åpne drafts og skal ikke merges som opprydding. Alle11 branchreferanser er registrert i miljøavstemmingen; ingen gammel branch er slettet.

Ingen Production-merge, databaseendring, demodatareset eller utsending er utført. Før release kreves relevant godkjenning, backendkontroll og faktisk verifisering. Gjenbruk dokumentert grønn QA for uendret kode, men sidestill ikke komponenttester med full innlogget rolle-/Safari-test. Installerte AI-bilder, Golden, tidligere PDF-/videobevis og demo-overlay beholdes.

## Historikk

Den tidligere fulle statusloggen er bevart uendret i Git på [baseline4aaac8ee](https://github.com/ExpoProffsenter/expo-proffdok/blob/4aaac8eebbf43414e03c69bdc0b860d18e847f58/CURRENT_RELEASE_STATUS.md). Den inneholder daterte checkpoints og henvisninger til opprinnelige bevisfiler. Bruk nyeste verifiserte PR-status fremfor historiske «gjenstår»-avsnitt. Den historiske releaseplanen fra1.november er referanse, ikke et skript som skal kjøres ukritisk.
