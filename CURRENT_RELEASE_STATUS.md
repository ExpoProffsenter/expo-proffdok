# Gjeldende release-status – 8. oktober 2026

Miljømål: **BEGGE**, først feature/Sandbox Preview.

## Production

Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Production Vercel `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`, https://expo-proffdok.app, Supabase `dqffxflaoyarbxyiyhop`. Ingen KS/HMS-produksjonsmigrering, merge eller release er utført.

## Aktiv branch og Preview

Branch `feat-kshms-foundation`, [PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216), åpen draft. Fast [Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe), branch-spesifikk EXPO_BACKEND_TARGET=sandbox, backend ppvircenkjizeiqdxphj. Kontrollert feature-head før rapportleveransen: 81f317e3d47d4ad95e2208de94763eb9d7074f1d. Forrige funksjonskode 4cebc9f8e7d115887a7ef4264c9f5390b3504265. Ny rapportkode publiseres på samme adresse; endelig SHA/tree/CI/READY-bevis registreres i PROJECT_REPORT_20261008.md etter publisering.

## Siste avgrensede leveranse og QA

Kenneths «kjør» kl. 13:38 autoriserer valgfri prosjekt-SJA/RUH i Rapport/PDF/utskrift. Dialogen brukes av alle tre eksportfunksjoner og viser bare prosjektets tilgjengelige dokumenter. SJA får lagret rutinehenvisning, deltakere/medvirkning og PL-signatur. RUH får hendelse/tiltak/ansvarlig/frist/status/egen kontroll/lukking. Utkast/åpne saker merkes. Ingen automatisk avkrysning eller ny lagring i prosjekt-/portal-JSON.

34 rollback SQL-kontroller PASS; faktisk React, 5 PDF-er med jsPDF 2.5.1, 3 utskriftsdokumenter og visuell kontroll av 12-siders lang PDF PASS. Eksisterende signert SJA og 10 rutineutgaver er bevart. Full endelig Sandbox critical QA/build, PR Core Safety og release-docs-guard PASS. Ny read-only RPC/migrasjon 20261008115650 er bare i Sandbox. Security Advisor: tilsiktet authenticated SECURITY DEFINER-grant er gjennomgått med funksjonens porter og negative tilgangsprøver. Ingen påstand om at alle eksisterende advisor-varsler er løst. Se [rapportomfang og QA](docs/kshms/PROJECT_REPORT_20261008.md).

## Kenneths tester

Tidligere håndbok-, avvikspopup/lukking-, menyretur- og sjekklistepopup-prøver er TEST OK for sine prøvde leveranser. TEST OK 8. oktober kl. 01:28 Europe/Oslo for meny, RUH-inngang og norsk dato gjelder kontrollert head 42204af397fc1fb6187e7e475c951ecdcd007550. TEST OK kl. 13:30 for SJA-utkast/rutinenummer/lagring/gjenåpning og RUH-oppfølging/ansvarligvarsel/egen dokumentert lukking/bevart sak gjelder kontrollert head 75f6ba1f53817a17e4efb3cac778a63d3cfcb9c5. Dette godkjenner ikke hele KS/HMS eller Production. Rapporttillegget har egen kort prøve i USER_TEST.md og er ikke TEST OK ennå.

## Gjenstående og neste handling

Bare rapportvalget og PDF-innholdet skal prøves nå; godkjente delprøver gjentas ikke. Første rapportdel har dokumenttekst og elektronisk signering/lukking; RUH-bildevedlegg og full endringshistorikk følger ikke med. Ingen ny innlogget nettleser-/mobil-/flere faktiske brukerøkter-PASS hevdes; tidligere verktøyblokkering gjentas ikke.

Vernerunder/selvstendige kontroller, 5×5-risiko, vedleggs-/øvrige rapportuttrekk, separat HR/kompetanse/medarbeidersamtaler og fristpåminnelser gjenstår før Ringside-pilot som avtalt. Sandbox-e-postsending er deaktivert; avsenderoppsett/faktisk mottaksprøve gjenstår. Utførelse før HR; leder bare tildelte ansatte, firmaadmin alle/tildele ansvar. Relevant TEST OK og eksplisitt PRODUCTION GODKJENT for PR #216 kreves før Production-migrering/merge. Senere synkretning main → demo.

Fortsettelsespunkt: [OVERSIKT.md](docs/kshms/OVERSIKT.md) og [CONTINUITY.md](docs/kshms/CONTINUITY.md). Eldre release-status er bevart i [arkivet](docs/kshms/archive/CURRENT_RELEASE_STATUS_before_TEST_OK_20261008.md).
