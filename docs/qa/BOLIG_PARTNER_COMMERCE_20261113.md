# Personstyrt grunnpakke og tilvalg

## Status 13.11.2026
PR333: `feat/bolig-partner-commerce-20261113`, fra main `6eb54148b3d61e318c5447810cdf89deab6afffa`. Miljømål BEGGE. Appkandidat `19419f136cbb8d0410097fa033ef2e0f21dc8514`; testgrense presisert i `b375f63e7fb977b0c4fa299e9f1651dad8548e06`. Ikke produksjonssatt. Ingen reelle personrettigheter, medlemskap eller e-post endret.

Fast Preview: https://expo-proffdok-git-feat-bolig-partner-commerce-20261113-ringside.vercel.app/?progressTest=safe

## Implementert
Navngitte brukere hos Bademiljø Expo, Expo Proffsenter og Ringside kan få eksplisitt prosjektadgang via eksisterende partnerkontakt. Lesing, individuell vare-/arbeidstilpasning og felles katalog er separate rettigheter. Min side → Mine samarbeid viser bare tildelte prosjekter; arbeidsfirma og medlemskap beholdes. Prosjektleder deler ferdige forslag, beboer godkjenner selv.

Privat konto-/prosjektbundet RLS-tabell og kontrollerte RPC-er. Hvert kall kontrollerer kontoens e-post, profil, internt medlemskap, aktiv partneradgang, firmaaktivering og prosjekt. Partnerlenke alene gir ikke priser/valg. Publisert/akseptert avtale og klargjort ordre stopper samarbeidsskriving. Eksisterende revisjon/audit og boligvalg brukes.

Min side har to isolerte integrasjonslinjer; grensekontrollen krever byteparitet for alt annet. To eksisterende regresjonsfixtures har fått akkurat ett nytt lesekall; grensekontrollen normaliserer kun disse eksakte tilleggene og bevarer øvrige assertions. Ingen generell tilgangskjerne endres. Oppfrisking beholder editor/utkast; tilbakekalling eller ufullstendig svar lukker innholdet. Varetilpasning bruker egen arbeidsdialog.

## Testbevis
- Full lokal PostgreSQL-pakke PASS: 1877 assertions. Tillegg dekker tre vare-/arbeidslinjer, sum 580000 øre, uendret nabobolig/katalog, uavhengige rettigheter, e-postbytte, utløp, deaktivert profil og tilbakekalling.
- Faktisk kommersiell databaseflyt: manager oppretter/godkjenner/publiserer forslag, beboer aksepterer, samarbeidspartner nektes endring av publisert/akseptert avtale.
- React PASS: dialog og faktisk CSS; forsinket tilgangsoppfrisking bevarer mount/utkast; tilbakekalling og feilformet svar fjerner editor. Selve vareeditoren er stubbet i denne isolerte refresh-testen.
- KS/HMS/HR/Min side navigasjon PASS lokalt og i CI etter oppdatert lesefixtures. Opprinnelige felt-, utkast-, navigasjons- og frakoblingskrav beholdt.
- Full lokal build/critical PASS; boundary PASS (55 assertions, eksakt endringskontroll), workflowvern PASS (147 opprinnelige kommandoer).
- Full CI for 050a676b: alle pakker bestod bortsett fra app-browser. Den siste feilen var hjelpetekstens for lange førsteside. Samarbeidsveiledningen er flyttet til et søkbart, sammenleggbart tema; opprinnelig grense på 1400 tegn og alle gamle hjelpeblokker beholdes. Ny full CI må bekreftes.
- 050a676b publisert READY som dpl_H8RDyX64ncuDBmsbbn3PojCx4urt; buildlogg bekreftet Sandbox Supabase only.

## Hosted sandbox
Prosjekt `ppvircenkjizeiqdxphj`. Repo-migrasjon `20261113194437_bolig_partner_commerce.sql` installert som `20261113204410_bolig_partner_commerce`. Før installasjon: tabell/RPC/historikk fraværende og funksjonsankre bekreftet. Ikke kjør SQL på nytt under repo-tidsstempelet.

Etter installasjon: RLS aktiv og null tildelinger. Faktisk authenticated demo-bruker får tom liste uten tildeling. Spesifikt prosjekt uten tildeling, direkte tabelltilgang og anonymous RPC ble avvist med 42501 i tilbakerullet transaksjon. Ingen positiv cross-firma-test med innlogget hosted bruker er gjennomført.

Advisors: 475 → 476 funn, kun nytt INFO for RLS uten policy på privat partner_commerce_access. Dette er tilsiktet: alle klientroller er fratatt direkte tabelltilgang, og funksjoner kontrollerer all adgang. Ingen nye WARN/ERROR-funn. [Supabase forklaring](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Previewbinding og visuell blokkering
Før første åpning ble manglende branchbinding oppdaget. EXPO_BACKEND_TARGET=sandbox ble satt kun for Preview og denne featurebranchen. d0179dec ble redeployet som dpl_ACxgF1EbySrrek9B7KSHqhhSCSDd, READY; buildloggen bekreftet «Explicit backend target: Sandbox Supabase only». Nye bygg arver samme branchbinding; siste deploy/commit skal bekreftes før test. Eldre preview uten denne bindingen skal ikke brukes; ingen test ble utført der.

Fast Preview åpnet i native Chromium og viste innloggingssiden. Eksisterende økt til PR332 følger ikke med til PR333s nye origin. Ingen passord/økt ble hentet eller flyttet. Innlogget visuell test av tildeling og vare-/arbeidseditor gjenstår. Produksjon og permanent demo er uendret.

## Neste steg og konkret test
1. Bekreft grønn siste CI og Vercel-commit/binding.
2. Logg inn på fast Preview. Bruk isolert sandboxprosjekt og avklart testperson, ikke reell kundetilgang.
3. UE-/leverandøradgang: åpne en aktiv prosjektkontakt med godkjent intern konto. «Grunnpakke og tilvalg»: slå på lesing, bekreft personen, lagre. Testpersonen skal se kun dette prosjektet under Min side → Mine samarbeid, med uendret arbeidsfirma.
4. Gi «Endre boligtilvalg, legge til varer og arbeid» separat. Velg bolig; tilpass vare-/arbeidslinjer; les tilbake og kontroller sum/nabobolig. Felles pakker skal fortsatt være skrivebeskyttet uten egen katalogrett.
5. Test utløp/tilbakekalling og at publisert/akseptert forslag ikke kan overskrives. Ingen e-post eller reell beboeraksept i testen.
6. Før produksjon: TEST OK, fersk main/migrasjonshistorikk, kontrollert installasjon/publisering, deretter main → demo med overlay bevart.

Tilbakeføring: deaktiver aktuelle prosjektbundne personrettigheter og rull frontend tilbake ved behov. Bevar audit, boligvalg og additive tabeller; ingen blind sletting/down-migrasjon. Ved eventuell produksjonsutrulling skal konkret forrige deploy registreres først.
