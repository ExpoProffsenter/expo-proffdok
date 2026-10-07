# Gjeldende release-status – 8. oktober 2026

Miljømål: **BEGGE**, først feature/Sandbox Preview.

## Production

- Main: `155f6c4ac01f126c1db0c65da385cfd9305587d5`.
- Vercel: `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`, READY, target=production, https://expo-proffdok.app.
- Backend: Production `dqffxflaoyarbxyiyhop`.
- KS/HMS er ikke merget, migrert eller publisert i Production.

## Aktiv branch og Preview

- Branch: `feat-kshms-foundation`; [PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216), åpen draft.
- Kontrollert head før denne dokumentoppdateringen: `42204af397fc1fb6187e7e475c951ecdcd007550`.
- Siste funksjonskode: `4cebc9f8e7d115887a7ef4264c9f5390b3504265`.
- [Fast Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe): READY på `dpl_6LSTm6CzDM94bZEj6Wf58NwvhP27`.
- Branch-spesifikk `EXPO_BACKEND_TARGET=sandbox`; backend `ppvircenkjizeiqdxphj`. SJA-, prosjektkoblings- og RUH/rutinereferansemigrasjonene er bekreftet i Sandbox-historikken.

## Implementert og siste QA

Håndbok/73 rutineforslag i seks kapitler, egne bekreftelser/personlig håndbok, avvikssentral/prosjektkobling/ansvarligvarsel, sjekklistebygging/innhenting, popup med versjonerte gjennomføringer, blank SJA med egen PL-signatur, prosjekt-SJA/RUH, faktisk aktivt firmaprosjektvalg/manuell referanse og faste rutinenumre er implementert i Preview. Avvik/SJA/RUH-menyen og norske datoer er rettet.

Dokumentert full critical QA/build, faktiske DOM-/React-prøver og 93 rollback SQL-assertioner for siste SJA/RUH-migrasjon PASS. PR Core Safety completed/success er kontrollert på siste funksjonskode. Ingen nye kode-/databaseprøver kjøres bare for denne dokumentregistreringen. Eksisterende signert SJA og publiserte rutineutgaver er bevart. Det er ingen ny innlogget utvikler-/fysisk mobil-PASS i denne overtakelsen.

## Kenneths tester

- Tidligere håndbok-, avvikspopup/lukking-, menyretur- og sjekklistepopup-prøver er TEST OK for sine prøvde leveranser.
- **TEST OK 8. oktober 2026 kl. 01:28 Europe/Oslo: meny, RUH-inngang og norsk dato**, registrert mot kontrollert head `42204af397fc1fb6187e7e475c951ecdcd007550`.
- Prosjekt-SJA-utkast/lagring/gjenåpning og RUH-oppfølging/egen lukking har fortsatt den korte nødvendige brukerprøven i USER_TEST.md. Ingen godkjenning av hele KS/HMS eller Production er gitt.

## Gjenstående og blokkere

- Den korte SJA/RUH-brukerprøven; signerings-/mobil-/flere faktiske brukerøkter, sentral-/portal-/rapportkontroll etter avtalt scope.
- Vernerunder/selvstendige kontroller, 5×5-risiko, SJA-vedlegg/PDF, separat HR/kompetanse/medarbeidersamtaler, fristpåminnelser/rapportuttrekk og øvrig minimum før Ringside-pilot.
- Sandbox-e-postsending er deaktivert; sikkert avsenderoppsett og avtalt faktisk mottaksprøve gjenstår.
- Eksisterende Preview-fane kunne ikke bindes i denne skynettleserøkten. Ingen nye faner eller gjentatte blokkerte innloggingsforsøk er gjort.
- Ingen åpen meny-/datofeil er meldt etter Kenneths TEST OK.

## Neste handling

Kenneth tester bare SJA-utkast → lagring/gjenåpning fra samme prosjekt og RUH → oppfølging/ansvarligvarsel → ansvarligs egen lukking/bevart rapport, etter [USER_TEST.md](docs/kshms/USER_TEST.md). Beståtte delprøver gjentas ikke. Deretter videreføres utførelsesdelen før separat HR. Relevant TEST OK og eksplisitt PRODUCTION GODKJENT for PR #216 kreves før Production-migrering/merge; senere synkretning er main → demo.

Fortsettelsespunkt: [OVERSIKT.md](docs/kshms/OVERSIKT.md) og [CONTINUITY.md](docs/kshms/CONTINUITY.md). Historiske release-statusnotater er bevart i [arkivet](docs/kshms/archive/CURRENT_RELEASE_STATUS_before_TEST_OK_20261008.md).
