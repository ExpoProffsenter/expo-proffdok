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
