# Design 036 – godkjent samlet produksjonsløp, 2. november 2026

## Autorisasjon og omfang

Kenneth ga uttrykkelig TEST OK kl.16:02 CET for PR294, PR295, PR298 og PR305-funksjonen, betinget av nødvendige kontroller. Miljømål BEGGE. Ingen PR217/277, nye funksjoner, branchopprydding, Solgløtt-opprettelse, datareset, invitasjon eller prøve-e-post inngår. Rutine-e-post forblir deaktivert.

Låste opprinnelige hoder: design d9ca45e0, bolig c3594f10, uttrekk338094b1, sjekklister09b1ece3. Main før release b389c707, demo fd04ac9a. Dette dokumentet er releasehistorikk og må suppleres med sluttkvitteringen i PR295 for endelig publisert SHA og demo.

## Utført databaseoppdatering

Production dqffxflaoyarbxyiyhop: eksakt additiv kilde supabase/migrations/20261031012504_checklist_template_proposals.sql, blob a37e88e0aa3b9eef8de67bcd5a265870a6789e63, installert som remoteversjon **20261102151721** / checklist_template_proposals. Canonical og remoteversjon har ulik tidsmerking; ikke installer på nytt fordi canonicalversjonen ikke finnes i remotehistorikken. Førkontroll avviste delinstallasjon: tabell, fire nye funksjoner og migreringsnavn var fraværende.

Etterkontroll: 0 forslag; privat tabell har RLS og ingen klientpolicy; anon/authenticated/service_role kan ikke lese/skrive tabellen direkte. Tre nye offentlige RPC-er er authenticated-only, SECURITY DEFINER med tom search_path. Privat hjelpefunksjon har ingen klientrettigheter. Alle funksjonskropper samsvarer med kilden. READ ONLY/ROLLBACK-prøven avviser anon, service_role, tom bruker og ukjent bruker, fire av fire. Dette er SQL-rolleprøver, ikke separate nettleserinnlogginger.

Uendrede før-/etterverdier: runs0/hash d41d8cd98f00b204e9800998ecf8427e; maler1/hash1ff4b2af1bb580daebcbab3d6a8eaf16; versjoner1/hashb52f4eff3578ac38ee4a3c312ce860a7; profiler46 og medlemskap62. Signatur-enforced forblir true. Avhengighetsfunksjonenes MD5 er identiske: checklist_private.context b61646b22e6fbb83c15d7fe4621a52f8; checklist_content f49e57d31f3a38f24784bfd87e52c8b7; checklist_snapshot a08a67342bd4831b34053f816ac3286d; identity_snapshot30c8833f954a6e8bc8d984cd8611ac4b.

Security advisors før/etter: én forventet ny privat-RLS-uten-policy INFO og tre authenticated-definer WARN. Ingen nye anon-defineradvarsler. Eksisterende mutable-search-path og leaked-password-protection-advarsler er ikke endret eller forsøkt løst utenfor scope. Dette er ingen total sikkerhetsattest.

## Faktisk releasekjede før designens sluttmerge

PR305: ready-for-review CI880 feilet korrekt fordi HR-fixturens faste 2.november kl.14:45 var passert. Identisk godkjent QA-fil fra PR295, blob f138e28e7756524780ccb11b7aea1c9cfab14266, ble ført frem. Alle267 assertions beholdt og bestått; ingen scheduler-/app-/workflowendring. CI883 SUCCESS10/10 på13af9bad. Merge2e5a56912a93f79dddf20889f894a7297157b1a9, Production READY dpl_inoWqc5W4gmByAxMgYzQ5FonHZ9k, faktisk Production-binding kontrollert.

PR298: oppdatert mot den faktiske main, CI884 SUCCESS på9d86e8b0; produktet beholdt den ene godkjente operasjonslåsrettelsen. Mergea3930794a88ca17da1c54911233a2c1230efd0d2, Production READY dpl_C8YCzY3w62MVfgmyiYA6x7JAfGWA. Faktisk loader main-887IvovM.js har Production-ref og ingen Sandbox-ref.

PR294: CI885 på9f43e8d5 var grønn, men GitHubs strenge sluttgate krevde ny kandidat etter at main gikk videre. Ingen omgåelse. Oppdatert fra maina3930794 uten produktendring, CI886 SUCCESS på8b65067afa25d1ce0e763024d862394cd6443090. Merge70a99b3ece0ab562c5ee140f23c8b18da1b7b4a1. Boligproduktfilene er identiske med godkjentc3594f10. Eksakt publisering føres i sluttkvitteringen.

## Samlet integrasjon og tester

En separat detached worktree prøvde den kjente integrasjonsdiffen, etter hashkontroll og apply-check mot d9ca45e0. Native builder790, veiledning242, boligoppgaver53, egenregistrering21, Bolig-kontroller109, UE-kontroller121 og uttrekksvisning36 består, samlet1372 krav. Malforslag44SQL og170native/HTTP/PostgreSQL/PDF-krav består. Seks PDF-er med totalt62 sider og tre ZIP-er er generert gjennom faktiske renderere med syntetisk transport; originalfil-/CRC-/hash-/innholds-/tilgangs-/sen-responskontroller består. Ingen ny visuell attest på samtlige sider eller innlogget eksport hevdes. Begge full critical/build-miljøer består.

Testmaskinen manglet først PDFJS og pdftotext. Isolerte testverktøy ble installert; produktavhengigheter og testkrav er uendret. Ingen blind retry av produktfeil.

Den faktiske main70a99b3e integreres så inn i PR295. Tre forventede konfliktsteder: statusfil, buildertest og BoligHelp. Designets søkbare høyrepanel beholdes, og boligpakkens fire instrukser føyes til. De69 originale tekstblokkene flyttes byteidentisk til boligHelpOriginalContent.jsx, blob39579859da2d0f6b893970e22d6d74e6b566090f; boligHelpContent.jsx beholder samme eksport-API og legger bare til de fire godkjente emnene. Ny242-kravs nettleserprøve av akkurat denne kildebevaringen består. Buildertesten beholder både bolig- og designkrav. Uttrekkskoden beholder begge pakkene; eventuell siste blanklinje er uten funksjonell virkning. Kildeoverføring kontrolleres med Git-blob/tree før push. Ingen gammelt innhold skal mistes ved manuell tekstkopiering. Sluttkandidatens fullCI må bestå før merge.

## Demo, grenser og tilbakeføring

Før release: demo-sandbox ppvircenkjizeiqdxphj, READ ONLY/ROLLBACK preflight19/19 og kurs5/5 består. Prosjekter7, forslag0, snapshot-hash27f5b271a765a979174612454d70f2df, signaturkravtrue. Ingen reset/sending eller endring i Golden/bilder. Etter siste produksjonskontroll synkroniseres faktisk main inn i demo med overlay, bilder, demokontroll og Sandbox-binding bevart. Ny demo-preflight og faktisk publisert SHA kontrolleres før sluttkvittering.

Den tidligere innloggede skynettøkten er ikke gjenopprettet. Reelle separate rolle-/Safari-/kamera-/dvaleforløp og en ny full innlogget produksjonsrunde er ikke attestert. Godkjenningen bygger på dokumenterte utvikler-/regresjonsprøver og Kenneths Preview-vurdering. Anonym publisering og miljøbinding er egne kontroller, ikke erstatning for innlogget funksjonstest.

Tilbakeføringsgrunnlag før hele releasen: Production b389c707 / dpl_HCNMdakvBh8qLupibztefMgrvBc8; demo fd04ac9a / dpl_H8cXav9UGpnofomAu6pbN6Rt8CTq. Registrer også hver ny fungerende etappe. Ved frontend-rollback skal forslagstabell og innkomne forslag/historikk beholdes; ingen drop eller datareset. Ved Vercel-rollback kontrolleres alias og automatisk publisering før neste release. Demo bruker eget tilbakeføringsgrunnlag.
