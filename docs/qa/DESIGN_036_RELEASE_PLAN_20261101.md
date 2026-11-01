# Design 03.6 – konkret releaseplan, 1. november 2026

Status: forberedt og lokalt integrasjonstestet. Ikke produksjonsgodkjent. Ingen merge, migrering eller demosynk er utført av denne planen. Alle fire PR-er er fremdeles separate. Full videodekning er en egen restleveranse.

## Oppdatert kontroll etter rapport-/listeendringene

Den opprinnelige e1f93ce0-tabellen og testhistorikken nedenfor beholdes som historikk. Ny lokal avstemming bruker d18681fb pluss sluttsidens rapportkildeblob `7eda4af5a848269ef876cc255927f03a12bdb90f` og PDF-testblob `905113e1004058bb17b970aac866fe3ffa6a187f`. Ferske PR294/298/305-hoder er uendret. Selve PR295-kandidaten, fullCI og READY registreres i PR295 etter push.

Eksisterende integrasjonsdiff SHA256 `09736927b104843ea529f38243b3c0c30ea7729a7b15e0b1cd5b21a8a2f192f8` er eksplisitt kontrollert med git apply --check mot d18681f og påført bare i separat detached worktree. Ingen av de nyere runtime-stiene overlapper diffens integrasjonspunkter. Siste rapportkilde og regresjonstest er kopiert identisk inn i øvingskandidaten. Hele critical/build består både eksplisitt Sandbox- og Production-binding. [Nytt maskinlesbart grunnlag](evidence/design036-integration-recheck-20261101.json).

De1372 tidligere browserassertions gjenbrukes for uendret patch/komponentgrunnlag; de fremstilles ikke som nye kjøringer. Nye rapportprøver består476krav/12PDF-er190sider. To kjente EOF-blanklinjer fra PR294 består. Ingen isolert Bolig-/uttrekkskode er lagt i PR295; ingen kombinert Preview eller merge utført. Ved faktisk integrering må fersk main og endelig CI fremdeles kontrolleres.

Faktisk ny innlogget RESERVE-PDF er mottatt; OK-varselet er håndtert. Nærlesing fant QR-overlapp på sluttsiden, og den konkrete rettelsen er dokumentert i [rapportgrunnlaget](../changes/report-final-qr-layout-20261101.json). En ny etterfil må kontrolleres fra publisert Preview før denne apprettelsen regnes som live-verifisert. Ingen reinstallasjon av de sju bildene.

## Opprinnelig låst grunnlag

| Pakke | Eksakt appkandidat | Kontrollert CI |
| --- | --- | --- |
| PR305 – egne sjekklister og malforslag | `09b1ece3839a367c2e61faeea3f184999f6a88d1` | 824 / 41157100897: success |
| PR298 – operasjonslås ved dokumentuttrekk | `338094b1d77bade1fef897c410c22d9e5d8750e4` | 833 / 41209872004: success |
| PR294 – boligoversikt, egne oppgaver og kontrollsvar | `c3594f108d605aeae0d895b9d8e71b1824d1f854` | 828 / 41168106406: success |
| PR295 – samlet design og fem filmer i Hjelp | `e1f93ce0d1bdf9ad67c9e7f4cdf20a94ff320f8d` | 858 / 41252882690: success, 10/10 |

Publisert Production er bekreftet READY på main `b389c7071b03f7e1d96a0ff0c0d5458edeebca3f`, deployment `dpl_HCNMdakvBh8qLupibztefMgrvBc8`. Permanent demo er READY på `8ee9c23d0209f72484830cf6cc7f0206f0c87da0`, deployment `dpl_7FvMzugKvcFeB2n5mhPgwqdqMY3X`. Disse er tilbakeføringsgrunnlaget før første apprelease.

Fast design-Preview: https://expo-proffdok-git-design01-app-ramme-20261028-ringside.vercel.app/?progressTest=safe

Branchens eksisterende, navngitte Preview-variabel `EXPO_BACKEND_TARGET=sandbox` er kontrollert lesende i Vercel. Ingen miljøvariabel er endret. Denne dokumentasjonsoppdateringen endrer ikke appkoden; ny deployment/CI må likevel kontrolleres før noen omtaler nytt hode som publisert.

## Faktisk forberedelse og konfliktløsning

En separat lokal detached worktree kombinerer PR295s appkandidat med produkt-/testfilene fra PR294 og PR298. PR305 er allerede ancestor til PR295. Ingen kombinasjonskode er sendt inn i PR295 eller noen av de isolerte PR-ene. Dette er en øvingskandidat, ikke en ny publisert Preview eller en omgåelse av Bolig-grensen.

Tre tekstkonflikthunker ble gjenskapt:

- `src/modules/help/BoligHelp.jsx`: behold PR295s søkbare høyrepanel. Flytt alle nye PR294-instruksjoner til fire søkbare emner i `boligHelpContent.jsx`. De 69 opprinnelige tekstblokkene og deres uavhengige hash-baseline er beholdt uten endring.
- `scripts/bolig-builder-browser-check.mjs`: behold både designens reader-/footer-prøver og boligpakkens 16-byggsgrunnlag/sticky toppfelt. Ingen opprinnelig assertion fjernes.
- Dokumentuttrekkets enlinjerettelse kombineres rent med designens presentasjonsendringer.

Veiledningsprøven verifiserer fortsatt nøyaktig alle 69 originale innholds-hasher og referanselenker, i tillegg til fire nye emner. Den oppdaterte tellingen er derfor ikke en svekkelse av opprinnelig innholdsvern.

[Maskinlesbart grunnlag og filsummer](evidence/design036-integration-20261101.json) og [reproduserbar lokal integrasjonsdiff](evidence/design036-integration-20261101.patch) bevarer nøyaktige kilder og løsning. Diffen består `git apply --check` mot eksakt appbaseline e1f93ce0. Den skal aldri ukritisk påføres design-PR-en før de isolerte delene er integrert i main. Den er en test-/løsningsreferanse, ikke et produksjonsskript.

## Utførte kontroller av kombinasjonen

- Full `npm run build` med eksplisitt Sandbox-binding: PASS.
- Full `npm run build` med eksplisitt Production-binding: PASS. Begge beholder eksisterende critical-kjede og miljøvakter.
- Native Chromium/headless-shell: builder 790, veiledning 242, boligoppgaver/integrasjon 53, egen registrering 21, Bolig-kontroller 109, UE-kontroller 121 og dokumentuttrekk 36. Totalt 1 372 assertions PASS. Samme Chrome 145-versjon; vanlig Chrome kunne ikke starte i denne kjørecontaineren fordi prosesslåsen krevde en blokkert socket. Offisiell headless-shell startet uten endrede tester/krav. Førstefeilen er bevart i lokalt testgrunnlag.
- Dokumentuttrekk: ordinært, kvalitet/HMS og eldre prosjektavvik gjennom faktisk React/Storage/jsPDF. Seks PDF-er / 115 sider består innholds-/snapshot-/tilgangs-/sen-respons-kontroll. Tre ZIP-er med 7/11/9 originalfiler pluss manifest består uavhengig CRC, størrelse og SHA256. Dette er syntetisk transport, ikke innlogget nedlasting. Ingen ny visuell attest på alle 115 sider gis; PDF-layoutkoden er uendret fra tidligere dokumentert visuell kontroll.
- To eksisterende ekstra blanklinjer ved EOF i PR294s `BoligBuildingOverview.jsx` og `BoligEntry.jsx` følger originalkilden. De er ingen ny integrasjonsfeil; ikke kall diffen helt whitespace-ren.

## Databasen før PR305 kan publiseres

Kun migreringen `supabase/migrations/20261031012504_checklist_template_proposals.sql` er ny mot main i denne pakken. Kildeblob: `a37e88e0aa3b9eef8de67bcd5a265870a6789e63`.

Lesende Production-kontroll i eksplisitt read-only-transaksjon med rollback bekrefter at migreringsversjonen, privat forslagskø og de tre nye proposal-RPC-ene mangler. Ni eksisterende funksjons-/tabellankre finnes. Kontrollene opprettet eller endret ingen rader.

Etter relevant uttrykkelig TEST OK og autorisert produksjonsløp:

1. Kontroller prosjekt-ID/miljø og eksakt migreringsfil på nytt. Stopp hvis objekter eller migreringsversjon allerede finnes; avklar eventuell delinstallasjon i stedet for å kjøre filen blindt igjen.
2. Registrer eksisterende kontroll-/mal-/versjonshistorikk og migreringsstatus. Kontroller nødvendig gjenopprettingsmulighet. Bruk bare denne eksakte additive migreringen, aldri generelt `db push`, seed/reset eller gamle Bolig-installasjonslister.
3. Installer atomisk og kontroller privat tabell/RLS/ACL, authenticated-only-RPC-er, uendret historikk og riktig oppdatering av API-skjema. Kjør relevante rolle-/idempotens-/avslags-/publiseringsprøver uten ekte mottakere eller falsk reell signering.
4. Stopp publiseringen hvis etterkontrollen avviker. Den nye frontend-kontrakten må ikke publiseres før backend er klar.

Ingen rutine-e-post, nye roller, medlemskap, transportbrytere eller invitasjoner aktiveres i denne releasen.

## Avtalt løp etter godkjenning

1. Godkjenningen må navngi designen og den nye sjekklistefunksjonen, samt de separate PR294/298 dersom hele denne kombinasjonen skal publiseres. Et generelt «kjør» er fortsatt ikke redesignens TEST OK.
2. Integrer separat core PR305 etter kontrollert migrering. Deretter PR298 og isolert Bolig PR294, og til slutt design PR295. Behold native eiere, demogrense og alle eksisterende guards. Endelig rekkefølge kan justeres avhengig av fersk base/mergebarhet, uten å endre godkjent funksjonsomfang.
3. Før hver neste merge: kontroller ny main, faktisk produktdiff og gjenværende avhengigheter. Bruk den forberedte konfliktløsningen som referanse. Kjør relevante kombinasjonsprøver og påkrevd grønn CI på den faktiske kandidaten. Nye vesentlige funksjonsendringer trenger ny vurdering.
4. Bekreft riktig Production-commit, READY, Production-binding og berørte flyter: kundepreview/retur, dokumentuttrekk, boligoversikt/kontroller, sjekklister/malforslag og Hjelp/video. Bevar e-postsperrer. Loggfør feil og tilbakeføring.
5. Synkroniser den faktiske publiserte main kontrollert inn i permanent demo. Bevar overlay, syntetiske ressurser og Sandbox-binding. Kjør demo critical/build, kontrollside og ny Sandbox-preflight. Ingen demo → main.
6. Først deretter opprettes Solgløtt med seks bygg og 24 boliger etter avtalt produktgrunnlag. Full videoserie følger godkjent mal. Ingen branch- eller dataopprydding inngår her.

## Tilbakeføring

Før hver publisering registreres siste fungerende main-/deployment-SHA. Ved feil stoppes videre merge og demosynk. Gjenopprett siste verifiserte Production-frontend/deployment og bekreft binding og kritiske flyter. En Vercel-rollback kan endre automatisk domene-/publiseringsoppførsel; kontroller dette eksplisitt før neste release.

Den additive forslagskøen skal beholdes hvis noen forslag er lagret. Ikke dropp tabell, historikk eller nye data som automatisk rollback. Eldre frontend bruker ikke den nye køen. Eventuell separat backend-deaktivering krever egen vurdering; ikke gi bredere grants som feilretting. Demo tilbakeføres til sin egen siste kontrollerte versjon hvis demosynken allerede er utført.

## Ærlige, åpne grenser

Innlogget Preview viste rapporten og alle fem dokumentgruppene. Eksportforsøket gikk videre til rapportvalget, men nettleserstyringen tidsavbrøt og kunne deretter ikke fokusere fanen. Dette var tidligere status. Ny faktisk PDF er nå mottatt, med håndtert native OK-varsel; se oppdateringen over og DESIGN_036_LIVE_PDF_20261101.md. Førforsøket er ikke grunnlag for å hevde generatorfeil.

Fysisk mobil/Safari/kamera/dvale, separate ekte rolleøkter, alle portal-/transportforløp og hele funksjons-/undermappe-videoserien er ikke sluttattestert av disse prøvene. Reiseregisterets gamle åpne statuser skal avstemmes mot nyere konkrete bevis; ingen totalprosent eller «alt er testet» gis. Ingen global redesign-TEST OK er registrert.
