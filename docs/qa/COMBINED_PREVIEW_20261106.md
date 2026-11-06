# Samlet kjernekandidat –6.november2026

Miljømål BEGGE, kun PR311 Preview/Sandbox. Ingen TEST OK eller produksjonssetting. Dette integrerer eksisterende kandidater, ingen ny produktfunksjon, backendkontrakt eller konfigurasjon utvikles.

## Kildehoder

|PR|Eksakt head|Status i kandidaten|
|---|---|---|
|308|d3759ce54a7f2bc75328c85c703c4d5e616f5662|Hjelp øverst og14filmer, inkludert bemanningsplanens eksport|
|310|1a3f615e22cd84cc4fb20f18281509e4ec8ee45a|Låst overtagelse/signaturvisning, prosjektfelter og lagringsknapp|
|311|8f4468202988ea9a4c0d3baebad0208693c2533a|Helapp/HR/plan/område og lokale tekstfeilrettelser|
|309|1b59d937f7614328030b71a617fa6a3c717a5a8f|Separat; skal ikke inngå i denne kandidatens foreldre eller Bolig-diff|

311/8f446820 har full CI986/run42249529048 SUCCESS; den ventende Bolig-nettleserpakken bestod også.308/d3759ce5 har full CI984SUCCESS. Disse bevisene er ikke samlet runtimeattest.

## Firepakksforsøk stoppet av uendrede avgrensninger

ff1f047b50ea7d4d64c96d34f453a23beeb33cfe/tree1d295863 kombinerte først308/309/310/311. Bevares på qa-history-combined-bolig-20261106. CI987/run42252354547: bolig-db128010600069 feilet i bolig-core-boundary-check:69 fordi HR/filmer/øvrig app lå utenfor Bolig-scope. Bolig-browser128010600116 feilet i bolig-shared-board-browser-check:240,390px/manager: produksjonens INPUT-merknad og den nye TEXTAREA gir tilsiktet ulikt kontrollsnapshot. Andre bevis må avleses separat; ingen full PASS på denne kandidaten.

Dette er en reell leveranse-/scopekonflikt, ikke grunnlag for blind omkjøring eller for å svekke testene. Begge checkerfiler og CI forblir byteidentiske main. Ny kjernekandidat bygges på8f446820 med308/310, uten309 som forelder og uten Bolig-feature/migrasjonsdiff. Kilde309 er urørt. Etter eventuell godkjent publisering av kjernen må309 avstemmes mot ny main, slik at den samme byte-/paritetskontrollen fortsatt beskytter mot urelaterte sideeffekter. Ingen unntaksflagg, endret base eller omgåelse innføres.

Før arbeidsbranch flyttes med forventet head ff1f047b, er forsøket sikret i egen referanse. Main/demo flyttes ikke. Samme PR311-Preview beholdes for å bevare brukerens testøkt.

## Konfliktløsning og faktisk scope

main.jsx-importblokken beholder HeaderHelp fra308 og useSupportUsers/usePortalAccessStatus fra311. Prosjektfixtureen beholder310s faktiske informationExpression for låste prosjektfelt og311s tre produktkategorier. Alle øvrige endringer kombineres med ordinær treveisfletting. Ingen assertion fjernes/svekkes, ingen eksisterende kildefunksjon erstattes med en ny designretning. Ett kort CURRENT_RELEASE_STATUS erstatter gjentatte historiske topptekster; historikken ligger fortsatt i kildecommitter og separate QA-filer.

308/d3759ce5 er en faktisk film-/app-/testcommit med14filmer, ikke dokumentasjonshode/13filmer. Tidligere opptelling var feil og korrigeres her. Alle filmbytes/metadata/eksisterende filmtest er bevart uendret; ingen ny film genereres. Bolig-hjelpens eksisterende endringer fra308 følger med, mens309s Bolig-featurekode/migrasjon er separat.

## Verifisering

Firepakkskandidatens lokale full Sandbox-build/critical, HR-React145 og faktisk prosjektfixture-build uten native browser PASS. Ny kjernekandidat har identisk HR-komponent/test og14filmbytes/metadata/test. Ny full Sandbox-build/critical og faktisk sammensatt prosjektfixture-build kjøres. Workflowvakt kontrollerer147opprinnelige kommandoer/varianter og uendret build. Video-register145reiser/18områder, scope/release-docs/whitespace kontrolleres. CI/build/dependency/miljøkonfigurasjon og begge Bolig-grensechecker er uendret mot main. Begge Bolig-prøver krever ingen Bolig-featureendring og rapporterer derfor ikke anvendelig; dette erstatter ikke deres fulltest på egen309. Lokal native kjøring er ikke gjentatt etter kjent socket/ProcessSingleton-stopp. Eksakt ny CI/READY og innlogget Preview gjenstår ved kandidatopprettelse; resultat føres i PR311.

## Faktiske innloggede bevis

Kilde311/46b66835: QA-PLAN-0511 lagret/hentet758tegn/trelinjer eksakt fra server; originale72tegn tilbakeført/lagret, samme datoer/to personer/status og korrekt fokusretur.311/8f446820: demomedarbeider2/samtaleutgave4 beholdt10001tegn uten avkorting og avviste lagring; retting til originale112tegn fjernet alert straks. Originaltekst/utgave4 og samme medarbeiderrad/fokus/0dialoger bevart. Ingen HR-mutasjon/deling/bekreftelse eller utsending.

FirepakksPreviewff1f047b var READY/dpl_9QFMjAi3Pffn2fX8EvzKCGd3shmo/targetnull. Faktisk main-CpsDLZAe.js inneholdt Sandbox-ref og ingen Production-ref. Innlogging bevart etter reload. Hjelp øverst →102s-bemanningsfilm:1920x1080,ready4,ingen autoplay,nb-tekstsporready2; kapittel78s, ordinær avspilling til88.7393s/pausedfalse,åtte tekststeg og retur til eksakt filmknapp/fokus. Lukk hjelp → samme Startside/Hjelp-fokus/0dialoger.

Sammeff1f: DEMO–RESERVE viste låst prosjekt, disabled Oppdater prosjekt og alle kunde-/prosjektfelt. Overtagelse viste opprinnelig15.09/navn/merknad,allefelter/lagring/fullføring disabled,0canvas,to forklaringer om at tegnet signatur ikke er lagret. Ingen manuell feltendring/lagring/utsending. Generell garantikonfigurasjon og prosjektinvolverte så fortsatt redigerbare ut i oversikten; dette er et separat åpent UX-skrivevernspunkt utenfor310s avgrensede overtagelse/feltrettelse og ble ikke prøvd endret. Boligoversikten lastet24aktiveprosjekter; ingen prosjekt-/oppgaveskriving. Dette er delbevis på forsøket, ikke ny kjernekandidatattest eller full mobil/Safari/HR/Bolig-A–Å.

## Ny kjernekandidat: Preview og release

Fast adresse: https://expo-proffdok-git-fase45b-whole-app-qa-20261104-ringside.vercel.app/?progressTest=safe . Bekreft eksakt nySHA/READY/targetnull og faktisk Sandbox-binding før innlogget etterprøve. Kontroller Hjelp/bemanningsfilm/retur, låst DEMO–RESERVE og HRs tre steg/tekstkorreksjon uten reell utsending. Bolig-featurepakken vurderes fortsatt i separat309.

Production34daef4c/demoabc38f7e er urørt. Ingen DDL,seed/reset,kalenderimport eller e-post. Bare311s eksisterende område-/HR-migrasjonsfiler følger kjernen;309s Bolig-migrasjon holdes separat. Sandbox-stegene er allerede utført og må ikke installeres på nytt. Ved senere autorisert Production-release kontrolleres faktisk migrasjonstilstand separat. Lange HR-tekster må ikke avkortes eller historikk slettes ved rollback. Før TEST OK kan Preview tilbakeføres til dokumentert8f446820 uten DB-steg, og alle kildebranchene/ff1f-forsøket er bevart.
