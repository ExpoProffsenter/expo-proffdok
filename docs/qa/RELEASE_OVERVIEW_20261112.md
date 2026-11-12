# Samlet leveranseoversikt – 12. november 2026

Dette er kontrollpunktet for videre arbeid. Nye funksjonsendringer er pauset mens den ventende supportleveransen avstemmes. Ingenting skal merges bare fordi GitHub-køen løsner.

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
| Full supportmodus | [PR322](https://github.com/ExpoProffsenter/expo-proffdok/pull/322), be48b7978a1d3bb4cd9d43e8938f67a25e9f661e | TEST OK registrert for denne kandidaten sammen med PR320. Siste kontroll 43097898264 fortsatt queued. Ny sandbox-feil under viser at køen ikke er eneste blokkering. |
| Support for boligkontraktfiler | [PR320](https://github.com/ExpoProffsenter/expo-proffdok/pull/320), 007364a4957a738f5b215b450060618c32befb42 | Omfattet av registrert support-TEST OK i PR319-kommentar. Siste kontroll 43097043078 queued; eldre 43087870355 bestått er ikke siste kontroll. |
| Gammel support-PR | [PR319](https://github.com/ExpoProffsenter/expo-proffdok/pull/319), samme supportcommit | Historikk og godkjenning. Skal ikke merges i tillegg til PR322. Lukk først etter vellykket erstatningsleveranse. |
| Boligteksthjelp | [PR321](https://github.com/ExpoProffsenter/expo-proffdok/pull/321), c09809a146d72797953140b932387b9007af479b, draft | 18 prosjektsteg og 73 temaer. Lokale tester dokumentert; ikke produksjonsgodkjent. |
| Revidert A–Å og enhetlig musepeker | Ingen ny ferdig film | V12-kilder er nå hentet. Bare 3/57 kildescener har cursor-target. Ny rekkefølge, nye opptak og gjennomgående peker gjenstår. Ingen betalt stemmetjeneste bestilt. |
| Orvei: beboerimport, flere eiere, flere bygg | feature/bolig-residents-buildings-20261112, fra publisert main | Lagret utviklingsarbeid. Ingen PR eller produksjonsgodkjenning. Ny migrasjon er IKKE installert noe sted eksternt. |

## Det som er laget for Orvei

- XLSX/CSV/innlimt liste kobles til eksisterende boliger etter forhåndsvisning.
- Vanlige bolignummer som 24 og 38 beholdes. Flere eierrader blir én bolig.
- Flere eiere deler én portal, samme tilvalg, avtaler og dokumenter. Ingen parallelle bestillinger. Hovedkontakt brukes fortsatt av eksisterende e-postfunksjoner.
- Endret eierliste tilbakekaller gammel felleslenke; ny lenke må deles med gjenværende eiere.
- Ett varsel kan velge flere bygg med eksplisitt liste over boliger. Ingen e-posttransport er aktivert.
- Import bruker høyrepanelet fra eksisterende felles klargjøring, med separat rulling og handlingsfelt.

Lokalt bestått: 1782 databaseassertions, eksisterende React foundation, 21 import-/XLSX-/mottakervalgskontroller, appbygging etter panelendringen og 55 scopekontroller. Lokal Chromium nektet oppstart med socket-begrensning; dette er ikke en gjennomført skjermtest. Full faktisk importdialog-/tap-av-tilgangstest og visuell sandbox-test gjenstår. Se [Orvei testgrunnlag](BOLIG_ORVEI_20261112.md).

Branch-spesifikk Vercel Preview-variabel EXPO_BACKEND_TARGET=sandbox er opprettet. Ingen produksjonsvariabler er endret. Dette er konfigurasjonsgrunnlag, ikke bevis på ferdig publisert eller godkjent testversjon.

## Ny konkret blokkering i sandbox – urettet

Skynett åpnet https://expo-proffdok-git-demo-ringside.vercel.app/ uten innlogging. Før innloggingsskjermen kom varsel:
> Kunne ikke hente FDV-register. Kontakt systemansvarlig hvis feilen vedvarer. Feil: permission denied for function app_support_prepare_request

Read-only SQL i sandbox ppvircenkjizeiqdxphj viser at public.app_support_prepare_request() har EXECUTE for postgres/authenticated, ikke anon. Den er registrert som global PostgREST pre-request-hook i supportinstallasjonen. Kilden i PR322 har samme rettigheter. Den private prepare_request returnerer straks når supportheader mangler, men forespørselen kommer ikke dit når offentlig inngang mangler kallrettighet.

Dette er en påvist feil før innlogging, med mulig konsekvens for anonyme portaler. Portalomfanget er ikke ennå prøvd ende til ende. Ikke gi nye rettigheter ukritisk eller skru av sikkerheten som omgåelse. Ingen database-/supportrettelse er utført i denne samtalen. Sandboxdata er ikke endret. Produksjon har ikke fått denne supportinstallasjonen i denne samtalen.

## Rekkefølge videre

1. Rett og test den konkrete support-hook-feilen isolert i supportleveransen. Kontroller vanlige anonyme og innloggede forespørsler, avvist falsk supportheader, offentlig portal og fortsatt support-/firmaskille. Ingen nye erstatnings-PR-er for å omgå kø.
2. Test PR322 og companion PR320 sammen på eksakte commits i sandbox. Bevar dokumenterte tidligere tester; suppler berørte brukerreiser. Dokumenter om rettelsen endrer grunnlaget for tidligere TEST OK. Ikke be om identisk godkjenning på nytt.
3. Vent på faktiske beståtte påkrevde GitHub-kontroller. Kontroller gjeldende main før merge. Følg eksisterende produksjonsplan med kontroll av allerede utførte backendsteg, adapter, publisert commit, produksjonskontroll og main→demo.
4. Avstem deretter Orvei-arbeidet mot den ferdige supportbasen og test samspillet. Orvei-endringene skal ikke følge med supportmergen eller forsinke urelaterte ferdige rettelser som skjult avhengighet. Egen TEST OK kreves.
5. Oppdater teksthjelp og videoer på faktisk avtalt appflyt. Alle filmer skal følge godkjent visningsstil og tydelig peker. Norsk lyd avklares etter kvalitet/pris; ingen abonnement bestilt.

Ingen merge, produksjonsdeploy, migrasjon, reell utsending, reset, sletting eller endring av GitHub-køinnstillinger er gjort i denne samtalen.

## Begreper

- PR: en samlet endring som ligger til gjennomgang før den tas inn i produksjonskoden.
- CI/GitHub-kontroller: automatiske tester som skal bestå før publisering.
- Preview: en testversjon av en arbeidsbranch. Databasen må kontrolleres særskilt.
- Sandbox/demo: testmiljø med egne data. Her er supportbackend allerede installert.
- Chromium: nettleseren for lokale automatiske skjermtester. Skynett er et separat alternativ og ble brukt til oppstartskontrollen.
