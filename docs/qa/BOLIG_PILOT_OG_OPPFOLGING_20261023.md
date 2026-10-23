# Boligpilot, restpunktoppfølging og papirvarsel – 23.10.2026

Miljømål **BEGGE**. Kun feature-Preview og Sandbox til egen eksplisitt TEST OK for Bolig. Ingen produksjonsmigrasjon eller merge. Sandbox e-post er AV.

## Resultat og avgrensning

- **Ferdigstilling → Se åpne forhold → Oppfølging i fremdriftsplanen**: koble et forhold til eksisterende arbeid, eller opprett en vanlig Bolig-aktivitet med bolig, ansvarlig, start og frist. Aktivitetsforhold viser sin egen eksisterende aktivitet. Flere forhold kan dele én aktivitet. Arbeidet vises i samme Gantt og bruker samme varslingsmotor. Ny aktivitet er valgfri (`required=false`); ingen ny automatisk overtakelsessperre.
- Koblingen er en privat, uforanderlig kildereferanse med kildeøyeblikksbilde, aktør og tidspunkt. Den ferdigmelder ikke avvik, sjekklister eller meldinger og endrer ikke prosjektleders vurdering. Kildens innholdsendring gir et nytt forhold som må vurderes. Koblet arbeid kan endres/utføres i ordinær fremdriftsfane. Fullført aktivitet lukker ikke kilden.
- Ansvarlig foreslås fra lagret vurdering når den finnes. Aktivitetens faktisk lagrede ansvarlige styrer fristvarsler. Vurderingens ansvarlige endres ikke automatisk.
- Ny oppfølging bruker eksisterende `progress_workspace save` med vanlig validering, revisjon og historikk. Ytre kvittering i `progress_receipts` gir eksakt gjenspilling ved tapt svar, også når opprettelsen har endret vurderingsgrunnlaget. Fersk tilgang og aktivt prosjekt kontrolleres før gjenspilling. Kladder og forsøks-ID overlever lukking, fokus og ny åpning. Nye forsøk etter endret innhold får ny ID.
- Gjenbruk krever ingen ny malmotor: A–Å og klargjøring anbefaler bygg/nummerering → én god rommal med grunnpakker → prøv én bolig → forhåndsvis og fordel resten → individuelle unntak. Eksisterende bulk-/mal-/sjekklisteflyt beholdes.
- **Fremdrift og varsler → Beboervarsler → PDF / oppslag** gir en A4-PDF med bolig/adresse, arbeid, datoer, tekst og prosjektkontakt. Kontaktkladd beholdes lokalt i bruker/firma/prosjektscope. Beboerens mottakernavn/e-post settes ikke automatisk på et felles oppslag. Brukerens egen varseltekst følger med, og dette forklares før nedlasting.
- Papirutgave kan tas fra lagret varselutkast uten beboer-e-post eller portalpublisering. Den merkes UTKAST før godkjenning. Plan/varsel/kontakt må være uendret; fersk RPC-lesing skjer både før og etter lasting av PDF-motor. Endret grunnlag eller bortfalt tilgang stopper nedlasting.

## Kontaktbytte og funn fra pilot

Tidligere beboerportal sjekket gjeldende kontakt, men separate avtaleslenker var ikke tilbakekalt ved kontaktbytte. Ny privat trigger ved endring av kontaktnavn/e-post fjerner portal- og avtaletokener og ugyldiggjør tidligere godkjenning av beboervarsler. A→B→A gjenoppliver ingen gammel lenke. En ny portal viser og kan avgjøre bare avtaler som fortsatt har en gjeldende beboerkapasitet. Avtaleøyeblikksbilder, beslutninger, kvitteringer og leverandørbestillinger endres ikke. Telefonendring alene tilbakekaller ikke lenker.

Managerens interne historikk beholdes. Før ny portal deles skal prosjektleder se over eventuelle dokumentlenker og valgmuligheter; disse er boliginnhold og fjernes ikke automatisk som følge av kontaktbytte. Kontaktfeltet forklarer dette før lagring. Bolig er ennå ikke i produksjon; funnet gjelder feature-/Sandbox-koden.

Piloten avdekket dessuten at endringsordre-migrasjonen tidligere erstattet `o.snapshot` inne i aliaset `po.snapshot`, slik at ny bestilling etter installasjon kunne kalle ugyldig `pcoalesce(...)`. Ny smal migrasjon reparerer til `coalesce(po.effective_snapshot,po.snapshot)`. Eksisterende kontroll mot dobbeltbestilling beholdes. Piloten oppretter nå bestilling fra bunnen av etter at alle migrasjoner er installert; dette manglet i tidligere ende-til-ende-dekning.

## Varslingsregel

Oppfølginger bruker eksisterende Bolig-aktiviteter og Bolig-worker. Tildelingsvarsel, nær frist fra to dager før, fristdag og forsinket ukentlig oppfølging følger faktisk ansvarlig. Motoren begrenser gjentakelse, sjekker gjeldende ansvar/dato/revisjon/tilgang og stopper uaktuelle eller ferdige aktiviteter før utsending. Dette bygger på arbeidsfrist, ingen oppdiktet lovfrist. Sandbox-bryteren er AV; køstatus er ikke bevis på mottatt e-post.

## Sandbox-migrasjoner

- `20261023144403_bolig_handover_followup.sql`: privat kobling, RLS deny-all, kun autorisert RPC, offentlig SECURITY INVOKER.
- `20261023144404_bolig_contact_agreement_boundary.sql`: tilbakekalling og portalavgrensning.
- `20261023144405_bolig_delivery_effective_order_alias.sql`: reparasjon av eksisterende bestillingskontroll.

Ingen tabelltilgang for anon/authenticated/service_role til den nye koblingstabellen. Privat definer reautoriserer gjennom eksisterende handover- og progress-gateways, låser root og avgrenser bolig/bygg/prosjekt. Endringer er bare installert i Sandbox `ppvircenkjizeiqdxphj`. Produksjon har fortsatt 0 Bolig-migrasjoner.

## Realistisk pilot

**DEMO – Boligpilot med 40 leiligheter**, referanse `QA-PILOT-40-20261023`, root `80821082-c64a-41a9-91cb-db2aa049ed2e`.

To bygg med fem etasjer og fire boliger per etasje. Demoparken 101/103. 40 bad fra én prosjektlagret rommal, én grunnpakke og ett ekstra speil som individuelt tilvalg. To eksplisitte fem-boligers stammegrupper, 160 masseopprettede aktiviteter pluss én restpunktaktivitet. Rørlegger og elektro har parallelle datoer; H0103 ved Demoparken 101 har eget tredagers unntak. Gruppene er valgt med stabile bolig-ID-er, ikke utledet av bolignummer.

H0101 / Demoparken 101 (`03bdda5f-72de-4908-b7cc-87eca578ec0c`) har standardvalg akseptert gjennom faktisk anonym gateway, fiktiv registrert bestilling med del-levering, endringsforslag etter bestilling, mindre avvik «rosett justeres», koblet oppfølging, lagret varselutkast og uttrykkelig fiktiv overtakelse med åpne forhold. H0102 har ekstra speil. H0104 har én tydelig fiktiv melding som venter på behandling; dialog er AV som prosjektstandard og PÅ bare der.

`scripts/bolig-pilot-sandbox-seed.sql` brukes både i PostgreSQL-test og faktisk Sandbox. Den er idempotent og endrer aldri et allerede opprettet eksempel. Caller angir firma/innlogget syntetisk aktør og transaksjon. Bare syntetiske `.invalid`-kontakter, ingen rå beboertokener lagres i repo eller logg, ingen e-post sendes. Tidligere eksempelprosjekter nullstilles ikke.

## Verifikasjon

- 1125 PostgreSQL-asserts PASS, inkludert alle tidligere 1074 og nye oppfølgings-, kontakt- og realistiske pilotreiser.
- Eksisterende overtakelse/A–Å: 34 faktiske Chromium-asserts PASS.
- Oppfølging/papirvarsel: 16 faktiske Chromium-asserts PASS, med ansvar/frister, kladd ved fokus/lukking, 320/390/1366 px, lagring med tapt svar/eksakt gjenspilling, ingen dobbeltaktivitet og skjerming ved firmabytte.
- Eksisterende klargjøring: 33 Chromium-asserts PASS.
- Papirvarsel: 20 asserts PASS med faktisk jsPDF 2.5.1, PDF-tekst, utkastmerking, flere sider, ingen automatisk beboermottaker, fersklesing og scope/tilgangssperre. PDF visuelt inspisert som A4. Popplers fontsubstitusjon i denne containeren gir feil tegntetthet; MuPDF-rendring viser korrekt Helvetica-layout, og tekst/bokser er kontrollert.
- Full critical build PASS. Eksisterende fremdrift: 24 Chromium-asserts PASS. Faktisk Sandbox-RPC-smoke PASS med nye oppfølgingsaktiviteter, eksakt retry, gamle portal-/avtaleslenker, ny portal uten tidligere avtaler, A→B→A og uendret historisk aksept. Alle smoke-data rullet tilbake (0 restprosjekter). Nye browser/PDF-checks inngår i PR Core Safety; databasepiloten inngår i eksisterende foundation-check. Ingen gammel sjekk eller assert er svekket.
- Sandbox sikkerhetsrådgiver har samme seks kategorier før/etter. Bare INFO om privat RLS uten policy øker 151→152 for den bevisst stengte koblingstabellen; ingen nye offentlige definer-grants.
- Riktig Preview-SHA og endelig CI-status føres i handoff etter publisering.
- Fysisk Safari og Kenneths egen innloggede brukerprøve gjenstår. Ingen påstand om ekte mottatt e-post.

## Kort brukerprøve

Bruk fast branch-Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Åpne «DEMO – Boligpilot med 40 leiligheter». Se «Fremdrift og varsler»: to fag samtidig og H0103 med eget unntak. Åpne «A–Å-veiledning for Boligprosjekter» ved behov.
2. Åpne H0101 i Demoparken 101 → «Ferdigstilling» → «Se åpne forhold». Velg «Oppfølging i fremdriftsplanen» ved rosetten. Eksisterende oppfølging med ansvarlig og frist skal vises. Velg et annet forhold for å prøve kobling til eksisterende aktivitet eller opprettelse. Kilden skal fortsatt stå åpen.
3. I samme bolig → «Fremdrift og varsler» → «Beboervarsler» → «PDF / oppslag». Fyll prosjektkontakt og telefon, last ned. PDF viser riktige datoer og merket UTKAST. Dette sender eller publiserer ingenting.
4. Åpne H0104. Meldingen skal kreve oppfølging. Lesing alene skal ikke markere den behandlet.
5. Kontaktbytte kan prøves i en separat testbolig: lag lenker, bytt kontakt, bekreft at gamle lenker stopper, og del ny portal bevisst. Historiske avtaler og bestillinger skal fortsatt finnes internt.
