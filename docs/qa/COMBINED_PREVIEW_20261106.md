# Samlet Preview –6.november2026

Miljømål BEGGE. Integrasjon av eksisterende godkjenningskandidater, kun arbeidsbranch/Preview/Sandbox. Ingen ny produktfunksjon, backendkontrakt eller konfigurasjon utvikles. Ingen TEST OK eller main/demo-release er gitt.

## Eksakte kilder

|PR|Kildehead|Innhold|
|---|---|---|
|308|d3759ce54a7f2bc75328c85c703c4d5e616f5662|Hjelp øverst, temaer,14filmer inkludert bemanningsplanens eksport|
|309|1b59d937f7614328030b71a617fa6a3c717a5a8f|Boligoppsett, boligliste og navigasjon|
|310|1a3f615e22cd84cc4fb20f18281509e4ec8ee45a|Låst overtagelse, opprinnelige signaturbilder, prosjektfelter og lagringsknapp|
|311|8f4468202988ea9a4c0d3baebad0208693c2533a|Helapp/HR/plan/områdetelling og siste tekstfeilrettelser|

PR311/8f446820 har full CI986/run42249529048 SUCCESS. Den lenge ventende Bolig-nettleserpakken bestod til slutt; ikke en appfeil. PR308/d3759ce5 har full CI984SUCCESS. Disse er kildebevis, ikke attest for den sammensatte kandidaten.

## Scope og konfliktløsning

Før implementering: avgrenset til sammensetning av de fire eksisterende kildehodene, de beviste konfliktpunktene og ett integrasjonsgrunnlag. Main/demo/kildebranchene er urørt. Lokal integrasjon startet på311/8f446820 og bevarer alle fire kildehodene i historikken.

- main.jsx: bevar HeaderHelp fra308 og useSupportUsers/usePortalAccessStatus fra311. Alle øvrige main-endringer kombineres med Gits ordinære treveisfletting. Ingen ny navigasjons-/lagringskode skrives.
- project-subflows-036-browser-check.mjs: bevar310s faktiske informationExpression og311s tre produktkategorier. Alle assertions fra begge kilder beholdes. Ingen testkrav eller terskler svekkes.
- CURRENT_RELEASE_STATUS.md: én aktuell kort topp erstatter sammenfallende historiske topptekster. Historikken finnes fortsatt i hver kildecommit og i de separate QA-filene.
- HelpToolsCore/BoligHelp/ProjectWorkspaceChrome og øvrige overlapp er ordinært kombinert; ny full regressjon kreves.

PR308/d3759ce5 er en faktisk film-/app-/testcommit med14filmer, ikke bare dokumentasjon og13filmer. Tidligere omtale som dokumentasjonshode/13filmer var utdatert og korrigeres her. Alle opprinnelige filmer bevares; ingen ny film genereres i denne integrasjonen.

## Lokal kontroll

Full EXPO_BACKEND_TARGET=sandbox npm build med uendret critical-kjede PASS. Faktisk HR-React145PASS. PROJECT_036_BUILD_ONLY bygger den reelle sammensatte prosjektfixtureen uten å starte browser; dette er ikke native browserattest. Workflowvakten bekrefter147opprinnelige direkte kommandoer/varianter og uendret build-kjede. Videoregister145reiser/18områder PASS. Alle14filmfiler/metadata og help-video-browser-check er byteidentiske308/d3759ce5. .github, package/lock, QA-lock og vite.config er identiske main. Whitespace/scope/release-docs kontrolleres før publisering. Lokal native kjøring er ikke gjentatt etter kjent socket/ProcessSingleton-stopp; samlet eksakt CI og innlogget Preview skal gi runtimebevis.

## Allerede utført innlogget kildeprøve

311/46b66835: egen syntetisk QA-PLAN-0511,758tegn/trelinjer eksplisitt lagret og hentet tilbake eksakt fra server. Original72tegn tilbakeført og lagret, samme datoer/to personer/status og korrekt fokusretur.311/8f446820: demomedarbeider2/samtaleutgave4,10001tegn beholdt uten avkorting og lagring avvist; tilbakeføring til112tegn fjernet alert straks. Referat viste fortsatt utgave4/Lagret på serveren, ingen HR-mutasjon/deling/bekreftelse eller utsending;0dialoger og samme medarbeiderrad/fokus etter lukking. Dette er desktop Chrome, ikke fysisk mobil/Safari.

## Samlet Preview som gjenstår

Fast adresse beholdes: https://expo-proffdok-git-fase45b-whole-app-qa-20261104-ringside.vercel.app/?progressTest=safe . Kontroller eksakt publisert SHA/READY/targetnull og faktisk Sandbox-binding før innlogget arbeid.

1.Hjelp øverst → KS/HMS → Bemanningsplan – les tall og eksporter: ordinær avspilling, kapittel1:18,tekst og retur/fokus. Samme underliggende arbeid bevares.
2.HR → demomedarbeider2 → samtale: tre steg, tekstgrense/rettefeil, bevart kladd uten utsending.
3.Prosjektliste → DEMO–RESERVE → Overtagelse: lagrede navn/signaturstatus leses, felter og lagring sperret. Gjennomgå produktkategorier/rapport uten å endre reelle data.
4.Boligprosjekter: oppsett/liste/retur og eksisterende valgte bolig må kontrolleres sammen med Hjelp. Ingen bestilling/portalinvitasjon sendes.

Sluttstatus på eksakt kandidat føres i PR311. Full helapp-/filmdekning kan ikke utledes av disse prøvene.

## Releaseavhengigheter og rollback

Production34daef4c og demoabc38f7e er bevart. Eksisterende additiv SQL fra kildePR309/311 følger med som kode; ingen DDL kjøres av denne etappen. Sandbox-steg er allerede utført og må ikke installeres på nytt. Production krever separat kontroll av gjeldende migrasjonstilstand og de nødvendige Bolig/område/HR-stegene når release er autorisert. Rutine-e-post forblir deaktivert.

Før TEST OK: rollback er å returnere arbeidsbranch/Preview til dokumentert8f446820, uten DB-steg eller tap av kildebranchene. En eventuell senere produksjonstilbakeføring må vurderes mot utførte migreringer og lagrede lange HR-tekster; ikke senk servergrenser eller slett historikk som standard. Ingen opprydding/sletting av PR308/309/310 eller demo-overlay er utført.
