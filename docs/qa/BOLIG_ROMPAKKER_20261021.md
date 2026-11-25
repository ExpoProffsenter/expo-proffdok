# Boligprosjekter: rompakker og felles boligpakke

Miljømål BEGGE. Kenneth valgte støtte for begge 21. oktober. Samme foundation-branch/PR #278 og faste Preview. Main/demo/Production er urørt.

## Resultat og scope

«Rom og oversikt» har Velg/Endre fellespakke under Alle rom og Velg/Endre rompakke på hvert rom. Prosjektets pakker kan gjenbrukes; samme badpakke får egne tilvalg i Bad 1 og Bad 2. Fratrekk gjelder bare standardlinjen i den valgte pakken/rommet. Kompakte kort har sammenfoldet vareinnhold. Pakkevalget åpnes i egen dialog med forhåndsvisning av hele boligen før lagring. Arkiverte rompakker varsles og kan fjernes eksplisitt fra Alle rom. Boligen kan ha bare rompakker, bare fellespakke eller begge.

Gamle valg beholdes som fellespakke ved første eksplisitte lagring. Rompakker kommer i tillegg; dette sies i forhåndsvisningen. Ingen automatisk flytting eller endring av historikk. Manuell fordeling for uendrede fellesvarer beholdes, og kan eksplisitt fjernes mens varene beholdes felles. Gamle klienters enkeltpakke- og fordelingsskrivere sperres for scoped-v1. Eldre valg kan fortsatt behandles med tidligere flyt.

Én samlet boligvalgsversjon inneholder frozen komponenter for common/rom-ID og ett samlet varegrunnlag. Endring av ett rom beholder andre komponenter. Scope og kildenøkkel danner stabil varenøkkel. Ordrelinjer viser rom, og utelatte uendrede varer følger samme identitet selv om posisjoner endres. Nye/endrede varer er valgt. Lokal usendt utelatelse rebases også etter identitet når brukeren eksplisitt gjennomgår siste grunnlag. Tidligere ordre beholdes som egen versjon frem til ny lagring. Ingen faktisk bestilling/aksept/utsending.

Scope: egne boligkomponenter/klienter/CSS, boligveiledning, additiv migrasjon og boligtester/CI-tillegg. Sales, global meny/auth, HR og øvrig prosjektkjerne er urørt. Bestillingsskjemaets nye rebase-hook brukes kun av boligordre; andre eksisterende skjemaer beholder sin kontrakt.

## Database og samtidighet

CLI-kilde `20261021163256_bolig_scoped_package_choices.sql`, Sandbox-versjon `20261021164838`. Syttende additive bolig-migrasjon, kun `ppvircenkjizeiqdxphj`. Ingen nye tabeller eller direkte tabellgrants.

Ny SECURITY INVOKER-gateway bolig_package_choices → privat implementation med fersk eksisterende firma-/bruker-/rolle-/aktiv boligkontroll. Root-share-lock, kataloglås og romlås i samme rekkefølge som eksisterende skrivere. Valg-, katalog- og romrevisjon må stemme samtidig for preview/save. Preview gjør ingen mutasjon og returnerer lagrede komponenter separat fra forslag. Pakker/alternativer/grunnsum valideres på server, og rom-ID normaliseres. Opp til 1000 samlede varelinjer per bolig; ordregrensen er utvidet tilsvarende. Tidligere private skrivere er gitt interne navn og direkte execute er tilbakekalt; gateways er erstattet med scoped-guard. Ingen gammel klient kan slette romkomponenter via enkeltpakkevalg.

Alle nye funksjoner har eksplisitt tom search_path og begrenset execute. Historikk er fortsatt eksisterende immutable choice_versions/order_draft_versions med RLS/deny-all. Ordreforslag sammenligner kildeversjonen og stabile vareidentiteter; samme SKU i to rom er uavhengige. Endringer i katalogen skriver ikke om gamle romvalg. Fjerning krever preview/save, også siste pakke; tomt varegrunnlag gir ingen bestilling.

## QA

- PostgreSQL/PGlite: **289 assertions PASS**, alle tidligere 228 beholdt. Preview uten skriving, eldre valg/fordeling/ordre bevart, uavhengige romtilvalg/fratrekk, standardvare fjernet bare i riktig rom, andre rom frosset, tre revisjonskonflikter, feil rom/pakke/tilvalg, duplikatvalg, UUID-normalisering, fjerning/arkiv, bare rompakke og tomt valg, eksplisitt tømming av manuell fordeling, 1000 varelinjer/ordre og overgrense, scopebaserte utelatelser gjennom flyttede posisjoner, leser/firma/anon/rootarkiv og direkte legacy-skrivernekt.
- Faktisk Chromium med React/CSS og mocktransport: nye scenarier ved 320/390/1024/1366 px; eksakt antall og CI-status i PR. Romvalg og tilvalg, fratrekk/samlet preview, lokal kladd/DOM/focus/visibility/Escape/remount, lagring, ordresammendrag/romnavn, bevart utelatelse, usendt romspesifikt ordrevalg gjennom rebase, konflikt, lokal sikringsfeil, tapt svar + reload, kontrollert arkivfjerning, avbrutt preview, sen lesing/lukk og leser/firmabytte. Desktop-/mobilbilder er visuelt kontrollert.
- Eksisterende foundation/katalog-React, rom-Chromium 51 og fordelings-Chromium 33 beholdt og kjørt. Full critical build og CI-status følges i PR. Ingen gammel assertion er fjernet eller svekket; mocks får ny separat RPC-respons.
- Faktisk Sandbox under authenticated-rolle: isolert nytt prosjekt med fellespakke/to rom, alternativ/fratrekk bare i ett rom, preview vs lagret state, uendret annet rom, uendret ordre med ekskludert vare, foreslåtte posisjoner, konflikt og privat legacy-nekt. BEGIN/ROLLBACK; 0 prøveprosjekter igjen.
- Advisors: ingen nye manglende FK-indekser eller sikkerhetsadvarsler for den nye funksjonen. Eksisterende deny-all INFO og forventede ubrukte indekser står. Se [RLS-lint](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Skynett var utilgjengelig med to tidsavbrudd i foregående runde. Denne etappen er prøvd med faktisk lokal Chromium og separat faktisk Sandbox PostgreSQL. Innlogget cloud-browser→API→DB-prøve, fysisk mobil/Safari og to ekte samtidige brukerøkter er ikke bekreftet.

## Beholdt eksempel og kort prøve

Nytt syntetisk `DEMO – Rompakker og fellespakke` / `QA-ROMPAKKER-20261021` → Eksempelhuset → Bolig. Bad 1, Bad 2, Teknisk rom. Felles boligpakke har bereder og hovedstoppeventil. Begge bad bruker Bad – standardpakke; Bad 1 har oppgradert servant med fratrekk, Bad 2 har speil med lys. Samlet tilvalg 2 990 kr inkl. mva., 9 varelinjer. Lagret ordredraft utelater bereder. Bare opprettet hvis eksempelet manglet; den forrige fordelingsdemoen og brukerprosjekter er ikke endret.

Fast Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Åpne eksempelet → Rom og oversikt → Bad 1 → Endre rompakke. Kontroller fratrekk og forhåndsvis før lagring. Bad 2 skal beholdes.
2. Alle rom → Endre fellespakke. Fellesvarene skal stå separat fra badpakkene.
3. Bestilling → se romnavn på varelinjer. Bereder skal være utelatt. Ved endret valg: Se over og bruk siste grunnlag → kontroller utvalget før Lagre bestillingsutkast.
4. Skriv usendt pakke-/ordrevalg, bytt fane og lukk/åpne dialogen. Utkastet skal beholdes.

Neste: kontrollert fordeling av disse pakkene til flere boliger, deretter bredere rommaler med struktur/sjekklister/dokumentasjon. Ingen produksjonsmerge uten grønn critical QA, relevant Preview-prøve og uttrykkelig TEST OK.
