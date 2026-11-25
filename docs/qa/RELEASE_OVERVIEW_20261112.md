# Aktuell status 13.11.2026

Dette dokumentets eldre oversikt nedenfor er historikk. Produksjon main f7298e118f672e0b261b8a0f3f95e6e2d4e5e657 og demo0984fe1c8a6284ae13909db6dc391a172689f2f9 er READY etter PR324. Invitasjonsrettelsen er levert. Ingen brancher slettet.

Orvei PR323 er samordnet med denne main og publisert som d0ff0d2d i sandbox. Tidligere4783fe64 bestod full QA; ny samlet kontroll43338701347 pågår. Egen Orvei-TEST OK og produksjonsplan gjenstår. Se BOLIG_ORVEI_20261112.md for konkret forberedelse, pauset beboer-e-post og faktisk livekontroll. PR322 support er grønn; companion320 siste43097043078 fortsatt queued. Ingen omkjøring/køendring eller omgåelse.

PR321 er fortsatt separat teksthjelp. Fullfilm er ikke revidert eller publisert; ny opptaksrekkefølge og manglende pekerdekning er kartlagt i BOLIG_AA_REVISION_20261113.json. Ingen stemmetjeneste er kjøpt eller reelle testmeldinger sendt.

## Historisk oversikt 12.11

# Samlet leveranseoversikt – 12. november 2026

Dette er kontrollpunktet for videre arbeid. Avgrenset Orvei-arbeid og sandbox-test fortsetter separat fra den ventende supportleveransen. Ingenting skal merges bare fordi GitHub-køen løsner.

## Hva er faktisk publisert?

Vercel bekreftet produksjonsdomenet https://expo-proffdok.app som READY på main **d68cf2e530d5ab6afcfe2f97d75150c977bcd64f**, deployment dpl_r8UpVCcCGxMxeir2qCb88JMYmdHM. GitHub main har samme commit.

| Leveranse | Status |
| --- | --- |
| Design og tidligere apprettelser, PR295 og PR311 | Inngår i dagens publiserte main-historikk. Ikke en ny attest på at hele appen er feilfri. |
| Første bolig-A–Å/hjelpleveranse, PR313 | Inngår i produksjon. Dette er den gamle videoen som skal revideres, ikke en ny ferdig film. |
| Tilbudsopsjoner, PR314 | Publisert. Hovedpost bruker oppdatert opsjonsliste; eldre frakoblede opsjoner vises. |
| Kundesøk, varekort og kundepriser, PR315 | Publisert. Varesøkets avgrensede supportvisning er med; full supportmodus er en annen leveranse. |
| Boligaktivering fra firmakort, PR316 | Inngår i bekreftet publisert main. |
| Produksjonslogg, PR317 | Publisert; beskriver kontrollene over. |

Permanent demo er READY på **8f7307bc909f19203ff2cfbf76de142936978748**, deployment dpl_FZJXXpEayyFn83nspZ5wmGCFwxK6. Demoens kode og backend må skilles: koden er denne versjonen, men supportmigrasjoner er allerede installert i sandbox-databasen. Det gjør at demokode kan påvirkes av upublisert backendarbeid.

## Hva venter?

| Leveranse | Nøyaktig grunnlag | Godkjenning og blokkering |
| --- | --- | --- |
| Full supportmodus | [PR322](https://github.com/ExpoProffsenter/expo-proffdok/pull/322), f64efcc8d1b957d829e9ea96bd39ce539dde48ea | Tidligere TEST OK gjelder be48b797 sammen med PR320. Offentlig hook rettet og prøvd i sandbox. Ny kontroll 43326959905 er completed/success. Endret kandidat krever vurdering. |
| Support for boligkontraktfiler | [PR320](https://github.com/ExpoProffsenter/expo-proffdok/pull/320), 007364a4957a738f5b215b450060618c32befb42 | Omfattet av registrert support-TEST OK i PR319-kommentar. Siste kontroll 43097043078 queued; eldre 43087870355 bestått er ikke siste kontroll. |
| Gammel support-PR | [PR319](https://github.com/ExpoProffsenter/expo-proffdok/pull/319), samme supportcommit | Historikk og godkjenning. Skal ikke merges i tillegg til PR322. Lukk først etter vellykket erstatningsleveranse. |
| Boligteksthjelp | [PR321](https://github.com/ExpoProffsenter/expo-proffdok/pull/321), c09809a146d72797953140b932387b9007af479b, draft | 18 prosjektsteg og 73 temaer. Lokale tester dokumentert; ikke produksjonsgodkjent. |
| Revidert A–Å og enhetlig musepeker | Ingen ny ferdig film | V12-kilder er nå hentet. Bare 3/57 kildescener har cursor-target. Ny rekkefølge, nye opptak og gjennomgående peker gjenstår. Ingen betalt stemmetjeneste bestilt. |
| Orvei: beboerimport, flere eiere, flere bygg | feature/bolig-residents-buildings-20261112, fra publisert main | Lagret utviklingsarbeid. Ingen PR eller produksjonsgodkjenning. Ny migrasjon er installert og prøvd kun i sandbox; produksjon uendret. |

## Det som er laget for Orvei

- XLSX/CSV/innlimt liste kobles til eksisterende boliger etter forhåndsvisning.
- Vanlige bolignummer som 24 og 38 beholdes. Flere eierrader blir én bolig.
- Flere eiere deler én portal, samme tilvalg, avtaler og dokumenter. Ingen parallelle bestillinger. Hovedkontakt brukes fortsatt av eksisterende e-postfunksjoner.
- Endret eierliste tilbakekaller gammel felleslenke; ny lenke må deles med gjenværende eiere.
- Ett varsel kan velge flere bygg med eksplisitt liste over boliger. Ingen e-posttransport er aktivert.
- Import bruker høyrepanelet fra eksisterende felles klargjøring, med separat rulling og handlingsfelt.

Lokalt bestått: 1782 databaseassertions, eksisterende React foundation, 21 import-/XLSX-/mottakervalgskontroller, appbygging etter panelendringen og 55 scopekontroller. Lokal Chromium nektet oppstart med socket-begrensning; dette er ikke en gjennomført skjermtest. Faktisk importdialog, bevart kladd, hovedkontaktkrav, høyrepanel og flere bygg er prøvd i skynett. Mobil og tilgangstap gjenstår. Se [Orvei testgrunnlag](BOLIG_ORVEI_20261112.md).

Branch-spesifikk Vercel Preview-variabel EXPO_BACKEND_TARGET=sandbox er opprettet. Ingen produksjonsvariabler er endret. READY sandbox-preview 59337a1a er publisert og backend-binding kontrollert. Dette er ikke produksjonsgodkjenning.

## Bekreftet og rettet sandbox-feil

Global support-hook avviste anonyme besøk med «permission denied for function app_support_prepare_request», både før innlogging og i faktisk beboerportal. Ny SECURITY INVOKER-inngang lar normale kall returnere uten å berøre privat skjema; supportheader krever fortsatt authenticated og alle eksisterende aktør-/mål-/firmakontroller.

Rettelsen ligger kun i eksisterende PR322. Sandbox remote 20261112230959, lokal 20261112230911. 91 SQL-kontroller og berørte runtime/Auth/cache/mailkontroller bestod. Samme tidligere avviste portal åpnet deretter riktig bolig 24. Produksjon er ikke endret.

Orvei-test opprettet kun syntetiske data: to bygg, ti boliger, fire eiere på tre boliger, ett felles meldingsutkast og én portaltilgang uten sending. Ingen reelle mottakere, publiserte varsler eller produksjonsdata er berørt. Detaljer og restliste i [QA](BOLIG_ORVEI_20261112.md).

## Rekkefølge videre

1. Avgrenset support-hook-rettelse er utført; GitHub-kontroll 43326959905 har bestått. Kontroller vanlige anonyme og innloggede forespørsler, avvist falsk supportheader, offentlig portal og fortsatt support-/firmaskille. Ingen nye erstatnings-PR-er for å omgå kø.
2. Test PR322 og companion PR320 sammen på eksakte commits i sandbox. Bevar dokumenterte tidligere tester; suppler berørte brukerreiser. Dokumenter om rettelsen endrer grunnlaget for tidligere TEST OK. Ikke be om identisk godkjenning på nytt.
3. Vent på faktiske beståtte påkrevde GitHub-kontroller. Kontroller gjeldende main før merge. Følg eksisterende produksjonsplan med kontroll av allerede utførte backendsteg, adapter, publisert commit, produksjonskontroll og main→demo.
4. Avstem deretter Orvei-arbeidet mot den ferdige supportbasen og test samspillet. Orvei-endringene skal ikke følge med supportmergen eller forsinke urelaterte ferdige rettelser som skjult avhengighet. Egen TEST OK kreves.
5. Oppdater teksthjelp og videoer på faktisk avtalt appflyt. Alle filmer skal følge godkjent visningsstil og tydelig peker. Norsk lyd avklares etter kvalitet/pris; ingen abonnement bestilt.

Ingen merge, produksjonsdeploy, produksjonsmigrasjon, reell utsending, reset, sletting eller endring av GitHub-køinnstillinger er gjort. To nye migrasjoner er installert kontrollert kun i sandbox. [Branchregister](BRANCH_REGISTER_20261112.md) beskriver alle åtte brancher og vilkår for senere sletting.

## Begreper

- PR: en samlet endring som ligger til gjennomgang før den tas inn i produksjonskoden.
- CI/GitHub-kontroller: automatiske tester som skal bestå før publisering.
- Preview: en testversjon av en arbeidsbranch. Databasen må kontrolleres særskilt.
- Sandbox/demo: testmiljø med egne data. Her er supportbackend allerede installert.
- Chromium: nettleseren for lokale automatiske skjermtester. Skynett er et separat alternativ og ble brukt til oppstartskontrollen.
