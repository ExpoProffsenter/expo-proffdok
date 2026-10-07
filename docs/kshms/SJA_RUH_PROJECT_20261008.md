# SJA/RUH – prosjektvalg og nummererte firmarutiner

Oppdatert 8. oktober 2026, Europe/Oslo. Miljømål BEGGE, først samme Sandbox Preview. Kenneths avklaringer ca. 00:24–00:32 er ny leveransescope, ikke SJA/RUH-TEST OK eller produksjonsgodkjenning.

## Levert

- **Prosjektoversikt / Ordreoversikt og Avvik/SJA/RUH → Opprett SJA / Registrer RUH** åpner blankt skjema med faktisk prosjekt-ID. **Åpne SJA / Åpne RUH** viser prosjektets egne dokumenter. Fane-ID og eksisterende navigasjonsflyt består. Utvidet navn/verktøy krever verifisert personlig KS/HMS-tilgang; øvrige brukere har fortsatt Avvik. Support-/skrivebeskyttelse og prosjektlås respekteres.
- SJA betyr **sikker jobbanalyse**, planlegging av oppgave, farer og tiltak før arbeid. RUH betyr **rapport om uønsket hendelse**, også farlige forhold og nestenulykker. Begrepene forklares i prosjektinngangen, skjemaene og Hjelp.
- **Prosjekt i ProffDok** tilbyr bedriftens faktiske aktive, ulåste prosjekter som innlogget bruker har adgang til, inkludert aktiverte generelle ordrer. Server filtrerer firma/eksisterende prosjektadgang før søkeresultat. **Manuelt / eksternt oppdrag** og egen referanse beholdes. Velg før første lagring; en lagret kobling kan ikke flyttes i editoren. Ingen risikosvar, datoer eller bekreftelser fylles av prosjektvalget.
- **Velg fra bedriftens godkjente rutiner** viser gjeldende godkjent utgave, nummer, tittel og tekst som brukeren har adgang til. **Legg inn rutine** legger til redigerbar referanse, for eksempel `R-012 – Støv ved mur og flis (versjon 3)`. Rutinenummeret er nå fast per firma og vises også i firmaets og egen håndbok. Tidligere fantes bare versjonsnummer. Arkivering eller ny utgave endrer ikke rutinenummeret. Opprettet kopi får nytt nummer. Ingen publisert tekst, signert analyse eller lesebekreftelse endres.
- SJA-forslag dekker mur/puss, flis/kapping, tømrerarbeid, VVS og generelle jobber. Utstyrs-/fare-/tiltaksforslag er valgbare og må tilpasses. Egen tekst bevares; i ettlinjefelt skilles tillegg med midtpunkt, i flerlinjefelt med ny linje.
- RUH bruker eksisterende avvikssentral: kategori `ruh`, ansvarlig/frister, fast appvarsel, privat vedleggsflyt, tiltak, ansvarligs egen kontroll/lukking og historikk. Ny direkte prosjektrapport lagres med `source_kind=company` og faktisk `project_id`, uten å endre legacy prosjekt-/sjekkpunkt-JSON. Ekstern referanse og rutiner er valgfrie tekstfelt. Tomt RUH-registreringsforsøk viser samlet, fokusert liste over tittel/hendelse/ansvarlig/frist. **Lagre RUH for oppfølging** og **Lagre og lukk RUH** er separate handlinger.
- Prosjektets lokale RUH-kladd er separat fra andre prosjekter og gammel global avvikskladd. Eldre avvikskladder får tomme nye valgfrie felt ved lesing og beholdes. Nytt RPC-resultat må bekrefte prosjektkobling og innskrevet tekst før UI rydder kladden. Eksisterende prosjekt-/sjekkpunktavvik og ansvarligs egen lukking består.

Scope: KS/HMS SJA/RUH-komponenter og delte prosjekt-/rutinevalg, rutinenummer i håndbok, smal avviksetikett i projectNavigationTabs, eksisterende main-gate for Prosjektoversikt/avviksfane, Hjelp, dokumentasjon/QA og én additiv migrasjon. Ingen nye authklienter, HR-rettigheter, global menyombygging, legacy prosjekt-JSON-endringer eller e-postsending.

## Testbevis

- `scripts/kshms-sja-sandbox-check.sql`: **93 faktiske assertioner PASS**, alle syntetiske rader rullet tilbake. Nye kontroller: faktiske prosjektvalg/søk, prosjekt-/firma-/modulavslag, låst prosjekt, stabile rutinenumre, arkiv/kopi/utgaver, leserens kvalifiserte gjeldende utgave, RUH-prosjekt/ekstern referanse, idempotent retry, egne appoppgaver, historikk, ansvarligs egen lukking og ACL. Opprinnelig prosjekt-JSON er identisk ved avslutning.
- `scripts/kshms-job-links-react-check.mjs`: faktisk lazy prosjektinngang og React/DOM-handlerflyt PASS med simulert transport. Modulbegrensning, direkte blank oppretting, prosjektvalg/manuell referanse, nummerert godkjent utgave, fagforslag, samlet mangelliste, feil/retry og kladd, egen RUH-lukking, prosjektavgrenset historikk og skrivebeskyttelse.
- Eksisterende faktisk SJA-React-prøve og parent-/fanebytteprøve PASS. Permanent SJA-, avviks-, håndbok-, prosjektmeny-/generell-ordre-QA består. Utvidede permanente kontroller beskytter gamle kladder, separate prosjektkladder, norsk mangelliste, nummer/utgave og fagforslag. Feil i syntetisk rutinefixture (manglende `references`-array) ble korrigert; ingen databasekrav ble svekket.
- Full `EXPO_BACKEND_TARGET=sandbox npm run build` / critical QA PASS. React-skillgjennomgang: primitive scopeavhengigheter og serialvern, lazy prosjektverktøy, stable IDs/labels, eksplisitte handlinger, fokusert mangelliste og oppdelte editor-/katalogfeil. Ufullstendig SJA-utkast beholdes mulig.
- Eksisterende signert SJA (1): uendret samlet fingeravtrykk `4fa9e00d8a7e8a2c94f3bf55107c515b`. Alle eksisterende publiserte rutineutgaver (10): uendret `71c3e97afc643e040ea05638f725aa58` før/etter migrasjon og rollback-prøve.

Migrasjon `20261007224149_kshms_job_choices_routine_references_ruh.sql` er registrert bare i Sandbox `ppvircenkjizeiqdxphj`. RPC-only tabell-ACL og RLS består; nye RPC-er avviser anon. Advisorens eneste mutable search_path-funn er eksisterende Sales-funksjon `build_sales_request_list_payload`, ikke ny KS/HMS-kode. Autoriserte authenticated definer-RPC-er og private deny-by-default RLS-tabeller har forventede notices. E-postworker er fortsatt deaktivert.

Faglige primærkilder kontrollert 8. oktober: [avvik/nestenulykker](https://www.arbeidstilsynet.no/hms/avvik-og-avvikshandtering/), [kvartsstøv](https://www.arbeidstilsynet.no/risikofylt-arbeid/kjemikalier/kvarts/) og [arbeid i høyden](https://www.arbeidstilsynet.no/risikofylt-arbeid/arbeid-i-hoyden/). Forslagene er egne skrivehjelper; arbeidslaget vurderer faktisk risiko og tiltak.

## Publisering og neste prøve

Publiseringsbevis oppdateres før avslutning. Fast Preview:
https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe

Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Ingen merge, Production-DDL/-release eller demo-synk. PR #216 beholdes draft. Ny innlogget skjerm-/mobilprøve er ikke gjennomført; den tidligere verktøyblokkeringen ble ikke gjentatt. Neste handling er den korte prøven først i USER_TEST.md. SJA/RUH-TEST OK gjenstår. Meny og sjekklistepopup er tidligere TEST OK og gjentas ikke uten ny feil.
