# KS/HMS – pågående, ikke produksjonsgodkjent (2026-10-05)

- Miljømål: **BEGGE**. Feature `feat-kshms-foundation` starter fra main `155f6c4`; eksisterende produksjonsrelease nedenfor gjelder fortsatt.
- Full kildekartlegging, [krav-/gap-/leveranseplan](docs/kshms/PLAN.md) og [125-raders dekningsoversikt](docs/kshms/COVERAGE.md) er laget fra begge vedlegg (148/127 sider).
- Trinn A bygger håndbok, firma-/ansattilgang, oppstart, tilpasningsutkast, firmagodkjenning, uforanderlige versjoner/bekreftelser og signert årlig revisjon. Dette er **ikke et komplett KS/HMS-system**. Hele resterende minimumsomfang er registrert i planen.
- Draft [PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216); [feature-Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe) har eksplisitt, kontrollert Sandbox-binding. Ny innlogget kontroll etter oppstartsrettelsene gjenstår.
- Preview-retting etter brukerens oppstartstest: samme arbeidsfirma ved faneretur beholder KS/HMS-visning og ulagrede oppstartsfelt, etter eksisterende Sales-prinsipp. Firmaadmin kan velge seg selv som utpekt ansvarlig; andre medarbeidere krever fortsatt responsible-grant. Oppstart har varige forklaringer/VVS-eksempler, og fagvalget heter VVS. Full critical/build, authenticated SQL-scenario og desktop-/mobilkomponentkontroll passerer; ny brukerprøve av hele Preview-appen gjenstår.
- Rutinebiblioteket har tydelig flervalg: avkrysning/«Valgt», full oversikt «Disse rutinene legges inn», eksplisitt innlegging av hver firmakladd og «Lagt til»/«Rediger her». Eksisterende aktive standardrutiner og firmatilpasninger beholdes ved nytt forsøk. Dette er de første 12 utkastene; øvrig kildekartlagt innhold, inkludert HR og VVS, gjenstår i planen. Gjeldende kontrollresultater og avgrensninger føres i KS/HMS QA.
- Kun Sandbox har fått nye KS/HMS-tabeller/RPC-er. Preview-branchen har eksplisitt sandbox-mål. Ingen Production-migrasjon, aktivering, betalingsintegrasjon, e-postutsending eller main/demo-merge er utført.
- Faktisk SQL-scenario med `authenticated`-rolle passerer, med rollback av alle syntetiske identiteter/data. Tilgangs-/arbeidsprofilracer og kilde-/kladd-/navigasjonsscenario er grønne. [QA-status](docs/kshms/QA.md) skiller reell databaseverifikasjon fra syntetisk komponent-UI og innlogget Preview-test.
- Ny bruker-**TEST OK**, relevant innlogget Preview-test og grønne repo-kontroller kreves før merge. Deretter kreves Production-verifisering og kontrollert main → demo-synk/preflight. Tidligere godkjenninger gjelder ikke denne modulen.

# Release-status – 05.10.2026

## Production

- PR #214 er merget etter Kenneths TEST OK og Production OK kl. 20:19 Europe/Oslo. Feature head 1a9f51acc0668a0b52eab117fe0d14ad7c3c74fc, main merge d86ac10f4cb90eb7c15fba6e6ff6547656030d58.
- Vercel dpl_AHHp5Bn8GvaHBWph5r3gkSHH1ydV READY, target=production, riktig SHA. expo-proffdok.app HTTP 200. workProfileClient-BQErwlYB.js bekrefter Production Supabase dqffxflaoyarbxyiyhop og ingen Sandbox-binding.
- company_customer_profiles-migrasjonen er anvendt i Production. RLS aktiv; direkte klienttabelltilgang og anonym RPC stengt. Godkjent/aktiv profil og medlemskap i serveravledet arbeidsfirma kreves; revisjonsvern ved oppdatering. Ingen migrerte kundedata eller Production-testdata.
- Frivillig kundelagring av som standard, nedtrekk og kundesøk i eget firma. Lagringsramme nederst før opprett tilbud. Gjenbruk i prosjekt og begge tilbudstyper. Prisvisning eks. mva. velges per tilbud og låses i publisert/akseptert versjon. Nye tilbud starter inkl. mva. Bedriftskundetekst, kundevisning, forhåndsvisning, tilbud-PDF og aksept-PDF oppdatert.
- Cordel fra PR #211 er tidligere godkjent og publisert: ZIP/Rundsum, AFG alene eller jobbliste først + AFG. Eksporttilgang og Cordel-Hjelp styres av egen Systemadmin-brukertilgang. Tidligere Production-verifisering beholdes.

## QA

- Godkjent Preview dpl_8MALMgf8H82dTKoJZNoUfwPZDSsZ, Sandbox-only. Publisert tree identisk med kontrollert lokal kode. Full critical-suite, Vite-build, Core Safety og dokumentasjonsguard grønne.
- Runtime mva.-test dekker defaults, publisert/akseptert valg, public-mapper og rehydrering. React-render bruker faktisk generell tilbudsrouter; kundesøk/nedtrekk, lagringsplassering og av-som-standard kontrollert. Sandbox SQL-scenarioer for firmascope, whitelist, revisjon, anonym og feil arbeidsfirma passerte med rollback.
- Kenneth har testet innlogget Preview. Ingen innlogget Production-test hevdes. Security advisors for kunderegister: tilsiktet RPC-only RLS uten direkte policy og authenticated SECURITY DEFINER; auth-/medlemskapskontroll og låst search_path. Eksisterende prosjektfunn er utenfor scope.

## Sandbox/demo

Miljømål: BEGGE. Main → demo synk via PR #215, merge c7017fc7a036a610e32571a0f900fb2ed8ca7e5c. Eksisterende overlay og Golden-data beholdes; lokal sammenslåing med full Sandbox-build grønn. Kunderegistermigrasjonen finnes i Sandbox. Server-preflight er grønn 19/19, kontrollert med demoidentitet i rollback-transaksjon. Kontrollbaseline oppdateres til gjeldende main etter denne release-dokumentasjonen.

Innlogget nettleser-preflight og lokal redigerbar Badskisse er ikke kontrollert her; bruk Kjør preflight før kurs/kundedemo. Featurebranch er ikke slettet. README, Architecture, modul-README, Hjelp og docs/qa/COMPANY_CUSTOMERS_VAT.md følger endringen.
