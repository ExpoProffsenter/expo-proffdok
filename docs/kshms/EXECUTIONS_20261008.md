# Vernerunder og 5×5-risiko – avgrenset leveranse

Kenneths rapport-TEST OK 8. oktober 2026 kl. 14:48 følges av tidligere avtalt utførelsesarbeid. Miljømål BEGGE, først samme feature/Sandbox Preview. Main 155f6c4ac01f126c1db0c65da385cfd9305587d5 beholdes.

## Scope før implementering

Nye filer: src/modules/kshms/kshmsExecutions.mjs, KshmsExecutions.jsx og kshmsExecutions.css; avgrenset RPC/tabell-migrasjon for private gjennomføringer, nye critical/React/rollback-databaseprøver og dette notatet. KshmsModule.jsx får to interne faner med bevart montert arbeidsflate. package.json får den nye kritiske kontrollen. README, arkitektur, Hjelp og fortsettelsesnotater beskriver den ferdige leveransen. Eksisterende prosjekt-/SJA-/RUH-lagring, rapport, global meny, innlogging, autosave, offentlig portal og eksisterende avviks-/varslingsfunksjoner endres ikke. Kontrollavvik opprettes via den eksisterende avvikskommandoen, med separat stabil kildekobling.

Vernerunder kan startes med egne punkter eller en publisert firmamal, med eller uten prosjekt. OK/avvik/ikke aktuelt, kommentarer og nødvendige bilder sikres i privat gjennomføring. Lagre viderefører utkast; fullføring krever dokumenterte svar og utførerens egen bekreftelse. En ny gjennomføring beholder den gamle. Fullføring lukker ingen avvik.

Risiko har tomme, jobbspesifikke fare-/konsekvens-/tiltaksfelt, begrunnelse, medvirkning, sannsynlighet/konsekvens før og etter planlagte tiltak, ansvarlig, frist og dokumentert oppfølging. 5×5 er valgt produktmodell, ikke et universelt lovkrav. Grenser og aksept dokumenteres av firmaet for den konkrete vurderingen; lav score skal ikke fremstilles som automatisk klarsignal. Fullførte vurderinger bevares og ny vurdering opprettes separat.

Utkast avgrenses på bruker/firma/type/ID, med revisjonskontroll, idempotent retry, kontrollert readback og vern mot sene svar. Utviklerkontrollene nedenfor er gjennomført. Full build og samme Preview-publisering registreres separat. Ingen ny innlogget nettleser-/mobil-PASS hevdes ved oppstart.

## Faktiske utviklerbevis

- `scripts/critical-kshms-executions-check.mjs` PASS: tomme faktiske jobb-/scorefelt, gyldige datoer og 5×5-matte, bilde-/kommentarkrav, NA-begrunnelse, planlagt/høy risiko avvises ved aksept, scoped kladd og verifisert egen fullføring. Feil firma/dokument/revisjon/tekst/utfører eller sene svar gir ingen falsk fullføring.
- `scripts/kshms-executions-sandbox-check.sql` PASS: 54 faktiske assertioner, transaksjon med full rollback. Firma-/modul-/prosjektporter, private utkast, egen fullføring, fast malutgave v1 etter v2, CAS-konflikt, idempotent retry, nøyaktig én avvikssak/køoppgave, ansvarligs egen eksisterende lukking, låst prosjekt, tilbakekalt tilgang, anon og direkte tabellavslag. Prosjektets JSON/signering/sjekkpunktdata er uendret.
- `scripts/kshms-executions-react-check.mjs` PASS med reell `ExecutionSurfaces`, `KshmsExecutions`, `DeviationDialog` og prosjektvalg. Bare RPC-transporten er simulert. Fanebytte, kommandofeil/readback-feil/retry, bevisst konfliktvalg, fullført historisk identitet/malutgave, tom ny gjennomføring, 25 matriseceller, sperret forventet aksept, dokumentert kontroll og sent svar etter firma-/brukerbytte er prøvd. Ingen act-advarsler i sluttkjøringen.
- Sandbox-migrasjon `20261008131207_kshms_executions` anvendt og registrert i faktisk migrasjonshistorikk. Ingen Production-DDL.
- Uendrede fingeravtrykk før/etter: signert SJA 1 / `4fa9e00d8a7e8a2c94f3bf55107c515b`; rutineutgaver 10 / `71c3e97afc643e040ea05638f725aa58`.
- Supabase security/performance advisors kontrollert: nye tabellers RLS uten policies er tilsiktet RPC-only med alle klienttabell-grants tilbakekalt; tre authenticated SECURITY DEFINER-RPC-er har eksplisitte porter, tom search_path og negative databaseprøver. Ubrukte nye FK-indekser beholdes. Ingen andre eksisterende varsler er hevdet løst.

## Brukergrense og neste steg

Ny innlogget skjerm-/mobil-/flere faktiske kontoer-prøve er ikke hevdet. Tidligere dokumentert nettleserblokkering er ikke gjentatt. Den korte nye prøven i USER_TEST.md gjelder vernerunde, historikk og risiko med forventet effekt. Kenneths rapport-TEST OK og øvrige godkjente delprøver består.

Kontrollbilder lagres med begrenset oppløsning i privat dokumentasjon (JPG/PNG/WebP inn, inntil tre per punkt, total payload begrenset). Dette er ingen ny offentlig Storage-bøtte. Utkast kan lagres ufullstendig. Fullføring krever dokumentert kontroll/medvirkning og valgt ansvarligs egen bekreftelse. En fullført vurdering kan fortsatt ha planlagte tiltak eller stans som beslutning. Eksport av disse nye dokumenttypene, samlet tilsynsuttrekk, ekstra vedlegg, HR/kompetanse og fristpåminnelser er senere avgrensede leveranser.

Faglig veiledning: Arbeidstilsynets https://www.arbeidstilsynet.no/hms/risikovurdering/ er kontrollert. 5×5 og de foreslåtte grensene er produktvalg. Firmaet definerer og dokumenterer skala og akseptkrav for jobben; modellen gir ingen automatisk lovlighets-/sikkerhetsgodkjenning.

## Endelig lokal QA

`EXPO_BACKEND_TARGET=sandbox npm run build` PASS etter siste app-/Hjelp-endring. Hele eksisterende kritiske kjeden er kjørt, inkludert håndbok/SJA/rapport/avvik/maler/prosjektkontroller og Sales server-hydrering, kladd/faneretur, meny, auth/firmatilgang, Badskisse og portalvern. Vite bygger. Ingen eksisterende tester er svekket. Git-diff sammenlignet med main og med leveransens dokumentbase; app-delta er bare ny utførelse, to interne KS/HMS-faner og Hjelp. Resten av den store feature-diffen er tidligere KS/HMS-leveranser, ikke nye endringer i denne runden.
