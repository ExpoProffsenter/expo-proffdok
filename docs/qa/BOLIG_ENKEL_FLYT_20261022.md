# Boligprosjekter – enkel flyt og samlet sluttdokumentasjon

Miljømål **BEGGE**. Arbeid på samme feature-branch/Preview, først sandbox. Ingen produksjonsmerge eller produksjonsmigrasjon uten brukerens TEST OK.

## Avklart med Kenneth

1. Prosjektnavn og foreløpig boligstruktur er nok ved opprettelse. Adresser og kontakter kan komme senere.
2. Bare sjekklister merket påkrevd i kontrollplanen stopper sluttgodkjenning. Andre gir påminnelser.
3. Kritiske avvik stopper. Mindre avvik gir en tydelig «Klar med restpunkter» etter godkjenning; restpunktene følger dokumentasjonen.
4. Fordel firmamaler fra sjekklistesentralen eller prosjektets egne lister til valgte boliger/rom samtidig. Eksisterende svar skal ikke overskrives.
5. Samlet PDF og ZIP for bolig, bygg og prosjekt med lagrede dokumenter, kontroller, protokoller og FDV-oversikt. Ekstern FDV følger som eksplisitte lenker.
6. Valgfritt «Bekreft og send», med valgt mottaker og forhåndsvisning før sending.

Brukeren har bedt om samlet gjennomføring, med design og enkel UX først, og egenprøve i skynett uten løpende avklaringer.

## Scope

Bolig-komponenter/klienter/CSS/hjelp, additive Bolig-migrasjoner, isolert dokumenteksport og relevante QA-scenarier. Eksisterende sjekklistesentral er kilde; ingen endring av sentralens publisering, garantier eller utfylte kontroller. Sales, HR, innlogging, tilgangskjerne, globale menyer og ordinær prosjektmotor er utenfor scope.

Kontrollert utgangspunkt: feature `f91e9ac2`, main `0730eeb4`. Eksisterende node_modules/supabase CLI-scratch skal ikke inn i git.

## Arbeid og verifikasjon

- [x] Enkel oppstart uten adressekrav, også serverkontroll.
- [x] Påkrevde kontroller, konkrete påminnelser og kritiske/mindre avvik.
- [x] Samlet gjennomgang uten fem gjentatte tekstbevis.
- [x] Massefordeling med forhåndsvisning, revisjonsvern og gjentakelsessikker lagring.
- [x] Samlet PDF/ZIP med tilgangs- og grunnlagskontroll, filmanifest og ekte filbyte.
- [x] Valgfri bekreft-og-send-flyt med lagret bekreftelse og separat sendestatus.
- [x] Automatiserte tester, PDF-render, sikkerhetskontroll og sandbox.
- [x] Innlogget skynett: oppstart, prosjektliste, fordeling, sentralimport og samlet sluttkontroll.
- [ ] Siste innloggede opplasting/nedlasting etter nettleseravbrudd.
- [ ] Samme Preview oppdatert, eksakt CI grønn, kort brukertest og handoff.

Tidligere dokumentasjon beskriver eldre sperreregler. Denne etappens ferdige kontrakt og tester skal dokumentere hva som erstatter dem; sikkerhets-, historikk- og konfliktvern skal beholdes.

## Implementert kontrakt

- Adresser kan være reelt tomme, også i flere oppganger. Ingen syntetisk gateadresse lagres. Kjente adresser er fortsatt unike. Oppsett kan senere redigere/tildele adresser med stabile bolig-ID-er.
- Native kontroller har eksplisitt `required`. Eksisterende kontroller uten felt beholdes som påkrevde. Kravet kan endres med historikk; under arbeid lagres krav sammen med svar. Fullførte svar endres ikke ved kravendring. Valgfrie kladder/arkiverte rom blir påminnelser; påkrevde kladder/arkiverte rom stopper.
- Avvik og protokollmerknader har kritisk/mindre alvorlighetsgrad. Eksisterende uklassifiserte avvik er kritiske til de faktisk vurderes. Kritiske forhold stopper også når listen ellers er valgfri. Mindre restpunkter følger serverberegnet `ready_with_rest` / `handed_over_with_rest`, godkjenning, bygg/prosjekt og eksport. Rettede protokoller krever fortsatt faktisk dokumentert retting før rettingsbekreftelse.
- «Samlet gjennomgang» viser native dokumentgrunnlag og lagrer én eksplisitt kontroll av de fem faste områdene med valgfritt notat. Egne ekstra/romspesifikke krav må fortsatt dokumenteres særskilt. Kildeendring ugyldiggjør godkjenning, men krever ikke at fem gamle manuelle tekster skrives på nytt. Registrering av underliggende overtagelse endrer ikke godkjenningen av uendret arbeid; ny kritisk feil ugyldiggjør hele kjeden. «Ingen egne fellesarbeider» er et uttrykkelig valg med valgfritt notat.
- «Fordel sjekklister» bruker siste publiserte firmamal fra sentralen eller en eksisterende prosjektlistes serverlagrede definisjon. Tomme, uavhengige svar per bolig/rom. Eksisterende kilde/mål/rom hoppes over. Forhåndsvisning og kilde-/målrevisjoner bindes til lagring; alle nye kontroller opprettes atomisk, med kvittering for nøyaktig gjentakelse. Høyst 2 000 kontroller per fordeling. Ingen sentralmal eller eksisterende svar omskrives.
- Samlet PDF og ZIP kan tas ut underveis. ZIP har PDF, faktiske originale filer/bilder, full lagret native dokumentasjons-/kontrollhistorikk, full egen ferdigstillingshistorikk, filmanifest med SHA-256 og leseforklaring. Relevant fellesdokumentasjon inkluderes. Boligpakke utelater andre boligers innhold, også restpunkter via overliggende godkjenninger/historikk. Private objektstier og arbeidsprofilkapabiliteter fjernes fra mottakerens datafil. Ekstern FDV er klikkbare lenker; originale eksterne dokumenter lastes ikke ned. Koblede ordinære prosjekter er referanser og eksporteres ikke inn i denne pakken.
- Eksport gjenkontrollerer tilgang/grunnlag før filer, etter filer og etter generering. Manglende/endrede filer eller endret firma/grunnlag stopper uttrekket; ingen delvis ZIP. PDF gjengir kontroller/merknader/indeks/FDV, mens originale PDF-er og bilder følger ZIP separat. Read-only eksport endrer ingen status eller godkjenning. 250 MB / 6 000 originalfiler og 20 MB dokumentasjonsmetadata per uttrekk; store prosjekter kan tas ut per bygg/bolig. Nedlasting kan avbrytes. Pakken lagres hos brukeren; den er ikke et nytt serverarkiv eller en digital signatur.
- «Bekreft og send» samler valgt mottaker og rettingsbekreftelse i samme inngang. Bekreftelsen lagres først; canonical e-postforhåndsvisning åpnes direkte med valgt mottaker. Eksplisitt «Send bekreftelse» gjenbruker eksisterende uforanderlige forsøk og usikker-retry-kontrakt. Avbrutt e-postreview opphever ikke den lagrede rettingsbekreftelsen. Ingen automatisk reell utsending i QA.

## Verifikasjon før skynett

PGlite/PostgreSQL **681 assertions PASS**. De tidligere scenariene beholdes; nye scenarier dekker alle seks valg, sentralimport/romfordeling, snapshot/replay/stale/atomisk rollback, samlet gjennomgang, godkjenningskjede, og konkret regresjonsvern mot naboboligens restpunkter i en boligpakke.

Native Chromium **33 assertions PASS**, ferdigstilling **28 PASS**. Builder **103**, oversikt **42**, klargjøring **33**, boligtilpasning **22**, levering **31**, foundation/catalog/overview React PASS. Native testene dekker samlet bekreft-og-send med valgt mottaker og eksplisitt provider-mock, kladd/fokus/lukking, fordeling til bolig/rom, forhåndsvisning før skriv, og dokumentpakke med synlige restpunkter. Eksisterende tester oppdatert bare for nye faktiske feltetiketter og kollapset detaljvisning; ingen tilgangs-/historikk-/konflikttest fjernet.

PDF/ZIP **31 assertions PASS** med ekte jsPDF-byte, arkivkontroll via Python zipfile/CRC, SHA-256-verifikasjon av alle filer, originalbyte-identitet, underskjemasvar, historikk og klikkbar FDV. Seks sider i vanlig rapport og ti sider i langt eksempel rendret og visuelt kontrollert uten avkutting/overlapping. Eksisterende FDV PDF **12 PASS**, protokollmail **24 PASS**. Full critical build PASS; eksakt CI kontrolleres ved publisering.

## Sandbox

Kun `ppvircenkjizeiqdxphj`: `bolig_streamlined_workflow` **20261022004107**, `bolig_quality_distribution` **20261022004109**, `bolig_documentation_export` **20261022004110**. `scripts/bolig-streamlined-sandbox-smoke.sql` PASS med reell Auth/gateways/RLS og alle syntetiske skriver rullet tilbake; verifisert null root-rester. Riktig firma-/scope, krav/severitet, review, fordeling/replay, tomme kopisvar, samlet overtagelse og senere kritisk feil er kontrollert. Dette verifiserer ikke filbyte eller faktisk e-postlevering; filbyte/brukerflyt prøves separat i skynett.

Security advisors før/etter: bare ett nytt INFO-funn for den bevisst private deny-all/RLS-kvitteringstabellen. Ingen ny anon/utvidet offentlig definer, mutabel search_path eller brede tabellgrants. Eksisterende urelaterte funn er uendret.

## Gjenstår før gjennomgang

Siste faktiske opplastings- og nedlastingsprøve i skynett, reell e-postlevering og fysisk Safari-enhet er fortsatt ikke bekreftet. Omfang og verifiserte deler er dokumentert nedenfor. Produksjonssetting og main → demo krever TEST OK.

## Publisering og faktisk skynettprøve

Første samlede publisering: **8dfa35ee1ca94f6937658c0becf5b7642f99ad26**, tree **ffd783249ff79626a62ca1fb594c23511a953248**. Vercel **dpl_8kUfFPS6J6Ht62FbhC5wmPUg5ZCi READY** på riktig branch. **PR Core Safety #609 / 39701531965 SUCCESS** på eksakt commit. Samme faste Preview brukes videre.

I innlogget skynett er **DEMO – Enkel flyt og sluttpakke** opprettet med kun navn, foreløpig tomannsboligstruktur og tom adresse. Root **661ed7e7-76e4-4230-b5b6-f2f853290e6d**. H0101 **799b1cad-b981-4b3d-98a9-13ff4026ca3e**, H0102 **4876d46f-1990-4a82-a166-9e1c1bd41856**. En egen prosjektliste ble fordelt via forhåndsvisning/bekreftelse til begge boliger. H0101 ble fullført med et eksplisitt mindre restpunkt; H0102 beholdt selvstendige tomme svar. En publisert DEMO-firmamal v1 ble i tillegg importert i H0101 som valgfri, uferdig kontroll. «Samlet gjennomgang» ble lagret uten notat, og H0101 godkjent som **Klar med restpunkter**, med den valgfrie kladden som påminnelse. Reell server-readback etter avbruddet bekrefter kontrollene, påkrevd/valgfri, minor-svar og tom adresse.

Visuell skynettprøve fant en konflikt med global input-bredde: avkrysningsboksene i fordelingen ble 641 px brede og titlene 14 px. Avgrenset rettelse setter boksene til 22 px, titler/undertekst til 16 px, og kollapser valgseksjonene ved forhåndsvisning. To nye Chromium-assertions PASS lokalt før avbruddet, totalt 33. Siste polish retter også foreldet adressetekst og løse skilletegn når adressen er tom.

Skynettverktøyet stanset under åpning av filvelger for en syntetisk protokoll. Arbeidsmiljø og nettleserverktøy ble frakoblet. Ved gjenoppretting er den tidligere fanen borte; samme Preview åpner innloggingssiden og demoøkten er ikke videreført. Det er ikke registrert ny protokoll eller fil i denne nye demoen (server-readback viser 0/0). PDF/ZIP-generering, kontrollsummer og originalbyte er verifisert lokalt og i CI, men **ny faktisk PDF/ZIP-nedlasting i skynett og bekreft-og-send mot faktisk e-posttjeneste er ikke sluttprøvd**. Ingen ekte e-post er sendt. Tidligere demo «DEMO – Sjekklister, FDV og protokoll» har fortsatt sitt syntetiske FDV-grunnlag og originale protokoll.

Produksjon og main er kontrollert uendret ved gjenopptakelse: main **0730eeb46c49bf45b5d910772da5c2ad7ed60771**, **0 Bolig-migrasjoner i produksjon**. Ingen TEST OK, merge eller main → demo-synk. Lokal polish er sammenlignet med remote **1bdf5a73** og hele sporede arbeidstreet var identisk før neste rettelse; scope guard og diff-check PASS.

Polish **1bdf5a73** er READY. CI #610 bestod full critical build, 681 PostgreSQL-assertions, PDF/ZIP 31 og øvrige kontroller frem til ferdigstillingsbrowseren. Den fanget en timingfeil i testens rollebytte: `area.waitFor()` kunne finne den gamle manager-visningen før React hadde rendret reader. Testen venter nå på eksplisitt reader-wrapper og innlastet overskrift før samme kontroll av manglende skriveknapp. En ekstra assertion kontrollerer ingen muterende RPC-er etter rollebyttet; ingen produktrettighet eller gammel assertion er svekket. Endelig eksakt CI/READY dokumenteres i PR #278 ved overlevering.

## Kort brukertest

1. Åpne samme Preview → Boligprosjekter → **DEMO – Enkel flyt og sluttpakke** → H0101 → **Ferdigstilling**. Forvent «Klar med restpunkter», ett restpunkt og én valgfri påminnelse.
2. **Sjekklister og dokumentasjon → Fordel sjekklister**. Velg prosjektlisten og begge boliger → forhåndsvis. Begge eksisterende kontroller skal beholdes.
3. **Samlet PDF og ZIP** åpner innholdsoversikten. Samlet PDF/ZIP kan tas ut underveis uten at status endres. For prøve med FDV og en faktisk originalfil, bruk tidligere **DEMO – Sjekklister, FDV og protokoll → H0101**.
4. Valgfri ekte e-postprøve gjøres senere med en faktisk valgt mottaker; ikke send til syntetiske .invalid-adresser.
