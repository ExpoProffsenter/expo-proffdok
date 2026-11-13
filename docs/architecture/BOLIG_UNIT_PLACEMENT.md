# Plassbytte for eksisterende boliger

Miljømål: BEGGE. Utgangspunkt main `20d2917db861c6ccccddd6c24e435cf540963593` (13.11.2026). Gammel app støtter bildefeltflytting og endret boligfordeling, men ikke flytting av eksisterende boligidentitet mellom etasjer. Å bytte bolignumre flytter ikke tilhørende beboere eller valg.

Ny `kind: placement` i eksisterende `bolig_private.preparation` validerer to forskjellige aktive boliger i samme aktive oppgang/bygg/prosjekt. Gjenbruker manager/firmalisens, rootlås, basis, intent, request-ID og kvitteringer. Forhåndsvisningen skriver ingen boligdata. Lagring bytter bare `floor` og `position` og øker rootrevisjonen. Hendelsen journalføres; kvitteringen inneholder begge før/etter-posisjoner. Samme request-ID gir samme kvittering, ikke nytt bytte.

Ingen constraints, RLS, roller, e-post eller portalnøkler endres. Den umiddelbare unike plasseringsconstrainten beholdes fordi eksisterende resize bruker ON CONFLICT. Byttet bruker én ledig koordinat innenfor tabellens tillatte intervall midlertidig i samme transaksjon. Den er aldri en ferdig lagret boligplass. Ved full oppgang (alle 600 koordinater opptatt, inklusive arkiverte boliger) avvises handlingen tydelig uten endringer. Både preview og lagring kontrollerer dette.

Første versjon flytter ikke mellom oppganger eller bygg, endrer ikke antall boliger og gjetter ikke etasjer. Alle aktive strukturplasser er normalt allerede opptatt, derfor er handlingen et eksplisitt plassbytte. Egne fasadebilder knytter felter til bolig-ID og må justeres separat. Ferdige dokumenter/bestillinger beholder opprinnelig snapshot. Offisielt bolignummer endres ikke automatisk.

## Verifisering og publisering

Nye database-scenarioer ligger i eksisterende bolig-foundation-pakke. De kontrollerer preview, rader før/etter, avhengige tabeller, gjentatt identisk lagring, endret retry, foreldet revisjon, roller/firmaskille og eksisterende resize etter bytte. React-testen inngår i bolig-foundation-react og tester faktisk komponent med simulert RPC: målvalg, preview, focus, usikkert svar/exakt retry og tilbakekalt tilgang. Den erstatter ikke innlogget test med faktisk database.

Lokal critical/build PASS. Full bolig-PostgreSQL-pakke: 1837 assertions PASS. Placement React og full bolig-foundation-react PASS. Nettleser/innlogget sandbox og server-CI gjenstår. Produksjonsalias verifisert READY på main-commit ovenfor.

Sandbox ppvircenkjizeiqdxphj: installert én gang som 20261113175945 / bolig_unit_placement. Autentisert public-RPC-test med syntetisk prosjekt, preview, plassbytte, databevaring og eksakt retry PASS; hele testtransaksjonen rullet tilbake. Sikkerhetsrådgiver uendret før/etter. Produksjon er ikke migrert. PR329-preview er eksplisitt bundet til sandbox via branchbegrenset EXPO_BACKEND_TARGET=sandbox. Innlogget nettleserprøve gjenstår. Første CI stoppet fordi boligHelpContent.jsx lå utenfor boliggrensen; hjelpen er flyttet til egen tillatt BoligPlacementHelp.jsx uten endring i grensekontrollen. Før installasjon: kontroller miljø-ID og migrasjonshistorikk, installer bare denne nye migrasjonen i sandbox, test innlogget på syntetiske boliger med egne valg/fremdrift. Etter grønn CI og TEST OK: installer den nye migrasjonen én gang i produksjon, publiser riktig appcommit, verifiser og synkroniser main → demo med bevart overlay. Ikke kjør gammel seed/reset eller tidligere migrasjoner.

Tilbakeføring av UI: revert PR til forrige publiserte main. Backendutvidelsen er additiv og kan bli liggende ubrukt. Et ønsket reversert plassbytte utføres med ny forhåndsvisning og ny request-ID; aldri ved omnummerering eller sletting. Ingen produksjonsdata er flyttet under utvikling.
