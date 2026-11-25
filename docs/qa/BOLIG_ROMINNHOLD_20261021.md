# Boligprosjekter: vareinnhold på rom og opprettelse av pakker

Miljømål: BEGGE. Kun eksisterende foundation-branch/PR #278 og fast Preview/Sandbox. Main og permanent demo er uendret. Ingen produksjonsmerge eller Production-migrasjon.

## Endring og avgrensning

- Oppsett → Grunnpakker og tilvalg har synlig Ny grunnpakke / Nytt tilvalg uten å åpne biblioteket. Eksisterende vare-/pris-/fratrekkseditor vises i native dialog. Escape/lukk bevarer sikret lokal kladd; samme editor består ved focus. Katalogrettigheter og tidligere valg er uendret.
- Rom og oversikt → valgt rom → Legg innhold på rommet. Alle rom har også Fordel varer på rom. Varer kommer fra lagret boligvalg, inklusive tilvalg og erstatningsvarer.
- Hver vare kan deles mellom aktive rom med inntil tre desimaler. Summen kan ikke overstige boligvalgets antall. Rest blir Ikke fordelt. Forhåndsvisning grupperer varer/antall per rom før eksplisitt Lagre romfordeling.
- Mengdefordeling, ikke nye uavhengige rompakker: grunnpakken velges fortsatt for boligen. Egne rompakker/maler og kontrollert flerboligfordeling er videre arbeid. Ingen ekte ordre, aksept, utsending, romdokumentasjon eller sjekkliste er implementert med dette.
- Fordelingen lagres separat fra boligvalg og ordre. Ingen prisendring, ekstra bestillingsvare eller tap av utelatte ordrelinjer. Endret boligvalg krever eksplisitt ny gjennomgang; gamle posisjoner brukes aldri stille mot nye varer. Romarkiv sletter ikke historisk fordeling, og arkivert rom merkes.

## Data og samtidighet

CLI-opprettet kilde: `20261021155350_bolig_room_contents.sql`. Sandbox-versjon `20261021161355`, navn `bolig_room_contents`. Dette er sekstende bolig-migrasjon, kun installert i `ppvircenkjizeiqdxphj`.

Privat `room_content_versions` har composite unit/root- og unit/choice-FK, immutable normal API-historikk, alle FK-indekser, RLS og ingen direkte klientgrants. SECURITY INVOKER-gateway bruker privat implementasjon med tom search_path. Eksisterende rooms_workspace gjør fersk bruker/firma/rolle-/aktiv boligkontroll. Rotlås beskytter mot strukturarkiv; kataloglås og romlås beskytter kildevalg, romnavn og antall under lagring. Fordelings-, valg- og romrevisjoner må stemme samtidig. Serveren validerer romtilhørighet, arkiv, posisjon, talltype/presisjon, duplikate vare/rom-par og summer. Romnavn kommer fra serveren.

Server-first før utkastet kan brukes. Lokal sikring er påkrevd før mutasjon. Mistet svar gir fersk lesing og konfliktgjennomgang, ikke blind ny lagring. Reelt firma-/rollebytte remonterer innhold og fjerner gamle varer. Sen lesing kan ikke gjenåpne lukket dialog.

## Verifisering

- PostgreSQL/PGlite: 228 assertions PASS, alle tidligere 192 beholdt. Nye scenarier: deling mellom rom, desimalantall/rest, totalgrense, duplikat/ugyldig rom/posisjon/talltype, tre revisjonskonflikter, romrename/-arkiv, bevart historisk navn, eksplisitt tømming, nytt boligvalg, reader/firma/anon/privat tabell/arkiv og uendret konkret boligvalg/ordre med utelatt linje.
- Faktisk Chromium: 33 assertions PASS ved 320/390/1024/1366 px. Modal uten horisontal overflow, deling/overfordeling, visuell forhåndsvisning uten skriving, lokal kladd og samme DOM ved focus, Escape/remount, lagring/romfilter, konfliktgjennomgang, mistet svar + reload, nytt valg uten automatisk gjenbruk, lokal sikringsfeil stopper serverkall, sen lesing respekterer lukk, leser/firmabytte og pakke-/tilvalgsdialoger.
- Eksisterende foundation-, katalog-React og rom-Chromium PASS (51 romassertions beholdt). Testens hjem/retur-RPC-telling er nå eksplisitt avgrenset til bolig_workspace; rominnholdets separate GET må ikke feiltelles som ny prosjektlesing. Alle tidligere assertions er beholdt.
- Full critical build PASS. CI har ny Chromium-test etter eksisterende boligtester. Eksakt publisert CI/deploy-status står i PR.
- Faktisk Sandbox PostgreSQL under authenticated-rolle: opprettet isolert prøveprosjekt, valgt pakke, bestillingsutkast med utelatt linje og deling mellom to bad. Verifisert ny lesing, uendret valg/ordre, totalgrense, konflikt og privat tabellnekt. Full BEGIN/ROLLBACK; 0 prøveprosjekter igjen.
- Advisors: ingen nye manglende FK-indekser. RLS uten policy er tilsiktet deny-all; bare RPC er gitt tilgang. Nye ubrukte indekser forventes. Se [RLS-lint](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) og [indeks-lint](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
- Skynett: fanefinning og direkte binding til fast Preview tidsavbrøt begge. Innlogget skynettprøve kan ikke bekreftes i denne økten. Faktisk Chromium ovenfor er lokale komponentprøver med mocktransport; faktisk DB er prøvd separat. Ikke en full innlogget browser→API→DB-prøve. Fysisk mobil/Safari/to ekte brukerøkter gjenstår.

## Beholdt syntetisk eksempel

`DEMO – Pakker og rominnhold` / `QA-ROMINNHOLD-20261021` → Eksempelhuset → Bolig har Bad 1, Bad 2 og Teknisk rom. Grunnpakke To bad – standard og tilvalg Speil med lys er lagret. To servanter og to dusjsett er delt på badene; bereder er på teknisk rom og speilet på Bad 1. Bestillingsutkast utelater bereder. Opprettet bare dersom eksempelet manglet. Ingen brukerprosjekter, roller, kontakter eller vanlig prosjektkobling er endret.

## Kort brukerprøve

Fast Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Boligprosjekter → DEMO – Pakker og rominnhold → Eksempelhuset → Bolig.
2. Rom og oversikt → Bad 1 → Legg innhold på rommet. Rett antall/rom → Forhåndsvis romfordeling → Lagre romfordeling. Resten skal stå som Ikke fordelt.
3. Skriv usendt antall, bytt fane, lukk og åpne igjen. Utkastet skal bestå.
4. Bestilling: bereder skal fortsatt være utelatt. Romfordeling skal ikke endre pris eller ordreutvalg.
5. Oppsett → Grunnpakker og tilvalg → Ny grunnpakke / Tilvalgsliste → Nytt tilvalg. Dialog skal åpnes og beholde usendt kladd etter Escape/retur.
