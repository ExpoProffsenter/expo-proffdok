# SJA – tydelig signeringsvarsel, forslag og prosjektinngang

Oppdatert 8. oktober 2026, Europe/Oslo. Miljømål: BEGGE; først samme feature/Sandbox Preview.

Kenneth meldte at signering krevde flere forsøk fordi manglende utfylling ikke var tydelig. Han ba også om forslag i alle tekstfeltene og inngang fra prosjekt for brukere med modulen. Dette er korrigeringer og ny prosjektkobling, ikke SJA-TEST OK eller produksjonsgodkjenning.

## Levert

- **Signer SJA** viser én samlet, fokusert mangelliste ved signeringsknappene. Norske feltnavn og lenker tar brukeren til riktig felt. Tomme felt markeres etter forsøket, og egen bekreftelse vises som egen mangel. Signeringsforsøk med ufullstendig innhold sender ingen kommando. Ufullstendig utkast kan fortsatt lagres med et jobbnavn.
- Alle 20 typer tekstfelt i analysen har aktivt valgte, redigerbare forslag. Datoer velges i datofelt og prosjektleder i brukerlisten. Reelle navn/firma kan velges der de er tilgjengelige. Tekst med [klammer] må tilpasses. Feltene starter tomme; valg bekrefter ingen utført kontroll.
- **Prosjektoversikt / Ordreoversikt → Åpne SJA** viser prosjektets analyser. **Ny SJA** opprettet der får prosjektets faktiske ID som egen metadata, mens alle risikosvar er tomme. Lagret og signert innhold følger prosjektet. KS/HMS-oversikten viser også prosjektkoblingen.
- Personlig KS/HMS-grant og eksisterende prosjekt-/arbeidsfirmatilgang kreves både i UI og server. Låste/skrivebeskyttede prosjekter kan leses; skriving avvises. En valgt prosjektleder trenger også prosjekt- og KS/HMS-tilgang. Lokal kladd for hvert prosjekt beholdes separat fra tidligere lokal kladd i KS/HMS. En eldre klient kan lagre uten å miste en allerede lagret prosjektkobling.
- Tidligere selvstendige analyser blir ikke flyttet automatisk. Et lagret prosjektforhold kan ikke fjernes eller endres via SJA-kommandoen. Signert innhold, signatur og tidspunkt er fortsatt uforanderlige.

Scope: SJA-komponent/helper/CSS, ny ProjectSjaEntry, to eksplisitte integrasjonslinjer i main.jsx, SJA-kontroller og additiv prosjektkoblingsmigrasjon. Eksisterende navigasjon, prosjekt-JSON, sjekkliste-/avviksregler, auth og e-post er ikke ombygget. Prosjektkobling er eget felt med fremmednøkkel og indeks.

## Kontroller

- `scripts/critical-kshms-sja-check.mjs`: PASS. Forslagsdekning, norske mangelfelt, faktisk prosjektinngangs-gate, gamle og nye kladdnøkler, bekreftet prosjekt-ID i readback, eksisterende feil/retry og egen signering.
- `scripts/kshms-sja-react-check.mjs`: PASS med faktisk React/DOM og simulert transport. Tomme felt, aktivt valgte forslag overalt, varselfokus og gjentatte forsøk, lenker til felt/egen bekreftelse, prosjektfilter, prosjektbytte, separate lokale kladder, skrivebeskyttelse og faktisk ProjectSjaEntry med adgangsrevokering. Tidligere kladd-/konflikt-/signatur-/firmaforløp består.
- `scripts/kshms-sja-parent-react-check.mjs`: PASS. Faktisk KS/HMS-parent, skjulte faner, tapt readback, signering og bevart historikk. Den gamle kopisjekken for et generelt varsel er erstattet med én konkret mangel i den nye listen.
- `scripts/kshms-sja-sandbox-check.sql`: **60 faktiske SQL-kontroller PASS**, alle syntetiske data rullet tilbake. De tidligere 38 kontrollene ble utvidet fordi prosjektkoblingen endrer RPC-ene. Ny kobling/filter, annet/utenlandsk prosjekt, manglende modul/prosjekttilgang, låst prosjekt, egen signatur, immutable link og retry-kvittering etter tapt prosjektadgang er dekket. Første fixtureforsøk manglet prosjektmodulgrant; fixture ble korrigert til den eksisterende prosjektkontrollens kontrakt. Ingen tilgangsregel ble svekket.
- Eksisterende signerte analyse (1 post) hadde identisk kontrollsum for innhold, leder, oppretteridentitet, signerende identitet, tidspunkt og erklæring før/etter migrasjonen.
- Full `EXPO_BACKEND_TARGET=sandbox npm run build` / critical QA: PASS. Relevant React-skillkontroll: hooks/primitive scopeavhengigheter, sen-responsvern, tydelige labels/aria/fokus, ingen native required som blokkerer utkast, lazy prosjekteditor og bevaring ved skjuling/unmount.

`20261007220221_kshms_sja_project_link.sql` er registrert i Sandbox `ppvircenkjizeiqdxphj`. Ingen Production-migrasjon. Gamle signerkrav og RLS-/RPC-ACL består. SJA-relaterte advisorfunn er forventet INFO om private RLS-tabeller uten direkte policy og WARN om eksplisitt autoriserte authenticated SECURITY DEFINER-RPC-er; negative tilgangsprøver bekrefter kontrakten. Nye/eksisterende indekser kan ha INFO om ubrukt indeks. Ingen ny tabell, åpen direkte tabelltilgang eller fjerning av guards.

Advisorreferanser: [private RLS-tabeller](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [autoriserte RPC-er](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [ubrukt indeks](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Publisering

Funksjonskode `06a5abbed3ed6a921265c96468f1253d278ca5ee`, tree `ce2df79089500734b0770a0938e0f3f0d736a6c3`, er identisk med den lokalt testede treen. Vercel `dpl_DPUuLEqTcrN2mFr3HN5nrE8D3u4r` er **READY** på samme faste branch-alias, med `EXPO_BACKEND_TARGET=sandbox` for feat-kshms-foundation/preview. GitHub **Core safety + critical build** check `113042525234` er completed/success på koden. PR #216 er fortsatt draft.

https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe

Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Ingen merge, Production-release eller demo-synk. Ingen ny innlogget nettleser-/fysisk mobilprøve hevdes. Kenneths korte brukerprøve står først i USER_TEST.md. Meny og sjekklistepopup er allerede TEST OK og skal ikke tas om uten ny feil.
