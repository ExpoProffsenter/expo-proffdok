# Boligprosjekter – historikk og gjenopptakelse 23. oktober 2026

## Avtalen nå
Kenneth: «I tilfelle du låser deg lag historikk og kjør».
Fortsett samlet pakke uten rutineavklaringer. Miljømål BEGGE, men kun eksisterende feature-Preview og Supabase Sandbox frem til Kenneths eksplisitte TEST OK for Bolig. Ingen produksjonsmerge. Godkjenningen av bildefiksen #283 gjelder bare den fiksen.

## Sikkert startpunkt
Repo ExpoProffsenter/expo-proffdok.
Lokal arbeidsmappe: /workspace/scratch/68f35cdb8be0/expo-bolig-foundation
Branch: fase45b-boligprosjekter-foundation-20261020.
PR #278, OPEN DRAFT: https://github.com/ExpoProffsenter/expo-proffdok/pull/278
HEAD før denne pakken: 980fdc7e92e419130e774e5138eef78484ce3005.
Fast Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe
Sandbox ppvircenkjizeiqdxphj. Produksjon dqffxflaoyarbxyiyhop skal bare leses.
Produksjon/main før pakken: 36462e2b05ecd8e53dcdd7818c4b791b7c7cb2ed.
Les AGENTS.md, hele PROJECT_GUARDRAILS.md, relevante checker og faktisk branch/main før videre kode.

## Levert før pakken
- Prosjektbygger, bygg/leiligheter, rom og gjenbrukbare pakker, tilvalg, bestilling/levering, beboeravtaler og endringsordre, sjekklister og dokumentasjon.
- Felles Gantt med parallelle aktiviteter, eksplisitte stammegrupper, masseplanlegging og individuelle unntak.
- Valgfri beboerdialog: prosjekt av/på og eget valg per leilighet. Ulest og ubehandlet er ulike tilstander. Lesing avslutter ikke oppfølging.
- A–Å-veiledning for Boligprosjekter med bilder som kan forstørres. Misvisende rollemerke ved knappen er fjernet.
- Prosjektleder vurderer åpne forhold ved overtakelse. Vanlige restpunkter blokkerer ikke automatisk; valget «hindrer»/«følges opp etterpå», begrunnelse og ansvar dokumenteres. Kritiske forhold krever individuell tydelig vurdering. Intern sluttkontroll og faktisk overtakelse er separate.
- Revisjonssikret vurderingshistorikk og dokumentasjon i PDF/ZIP.
Se docs/qa/BOLIG_START_OG_OVERTAKELSE_20261023.md og BOLIG_GANTT_DIALOG_20261023.md.

## Godkjent arbeid nå
1. Realistisk pilot med ca. 40 leiligheter, flere bygg, grunnpakker/tilvalg, stammer, individuelle unntak, del-levering, endring etter bestilling, dialog og overtakelse med åpne saker. Kun tydelig syntetiske data.
2. Forenkle prosjektstart ved å gjenbruke eksisterende maler, pakker, sjekklistespredning og masseplan. Ikke bygg en ny malmotor.
3. Koble/opprett eksisterende fremdriftsaktivitet fra restpunkt, med ansvarlig og frist og eksisterende varsling. Ikke lag en separat oppgavemotor.
4. Prøv kontakt-/eierskifte: gamle lenker og tilgang, ny kontakt, historiske avtaler/bestillinger. Rett dokumenterte hull.
5. Beboervarsel som utskrivbar PDF/oppslag med leilighet, arbeid, datoer og kontakt.
6. Samlet QA og enkel testveiledning med faktiske knappnavn.

## Utsatt
Leverandør/UE-tilgang, egne fasadebilder/plantegninger, booking, indeksregulering, privat kontraktsanalyse. Excelimport sist.

## Viktige begrensninger
Ingen ekte meldinger eller e-post sendes uten konkret tillatelse. Sandbox transportbrytere for e-post forblir AV; bruk .invalid-adresser.
Bevar lokale kladder, fanebytte/dvale og bevisst navigasjon. Reelt firma-/brukerbytte eller tilbakekalt tilgang skal sperre gammelt innhold straks. Eksisterende critical checks må ikke svekkes.
Gamle eksempelprosjekter skal ikke nullstilles.
Oppgaver som får ansvarlig skal ha dokumenterte fristvarsler gjennom eksisterende motor. Ikke påstå mottatt e-post ut fra køstatus.
Ingen subagenter autorisert.

## QA-baseline før pakken
1074 PostgreSQL-scenarioer, 34 Chromium-vurdering/veiledning, 29 sluttkontroll, 42 oversikt, 103 bygger, 48 Gantt/dialog, 40 PDF/ZIP-asserts og actual foundation React PASS.
Full critical build PASS. CI #642 / 39960710739 SUCCESS for forrige funksjonscommit. Siste #643 / 39966181129 (tekstendring) må avleses på nytt.
Siste Preview dpl_HgZf1kZPAMoTbAsYZ497ocmV3oC4 READY på HEAD980fdc7.
Fysisk Safari og Kenneths innloggede ende-til-ende-prøve gjenstår.

## Verktøy og oppstart
node_modules er lokal symlenke; ikke stage den eller supabase/.temp/.
PGlite: /tmp/bolig-collab-qa/node_modules/@electric-sql/pglite/dist/index.js
Chromium: /tmp/inspection-chromium
Playwright: /opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs
Repoets npm run build kjører critical checks.
Git push fra shell mangler autentisering: bruk GitHub tree/commit/ref-verktøy, expected_sha og force=false. Verifiser lokal git write-tree mot publisert tre før reset --soft.
Bruk supabase migration new for ny migrasjon. Installer bare i Sandbox; les serverens faktisk registrerte migrasjonsversjon og samsvar lokalfil.
Les aktuelle relevante skills før bruk.

## Arbeidslogg
- Start: historikk sikres før ny implementering. Ingen funksjonsendringer i denne pakken på dette tidspunktet.
- Neste: les eksisterende fremdrifts-/overtakelses-/PDF-flyt og tester, avgrens endringene, implementer og verifiser, oppdater denne loggen med funn og konkret resultat.


## Checkpoint etter implementering
Historikken er først sikret eksternt og i commit f0ce4790cd24196b883fe74789bd37220e5339a9.
Den nye pakken er implementert lokalt. 1125 PostgreSQL, 34 eksisterende overtakelse/A–Å, 16 nye browser, 33 klargjøring og 20 faktiske PDF-kontroller PASS; full critical build PASS.
Sandbox-migrasjoner: 20261023144403, 20261023144404, 20261023144405. Produksjon fortsatt 0 Bolig-migrasjoner. E-post AV og ingen pending/sending jobber før pilot.
Pilot er opprettet: 80821082-c64a-41a9-91cb-db2aa049ed2e. Se docs/qa/BOLIG_PILOT_OG_OPPFOLGING_20261023.md for eksakt innhold, brukerprøve, migrasjoner og sikkerhetskontrakt.
Pilot avdekket og rettet kontakt-/avtaleslenkegrense samt ugyldig alias i bestillingsopprettelse. Ingen produksjonsendring.
Cloud-smoke er PASS med alle syntetiske data rullet tilbake; 0 restprosjekter. Eksisterende fremdrift 24 Chromium PASS. Sikkerhetsrådgiver har samme kategorier; kun privat RLS deny-all tabell 151→152. Sandbox mail AV, 0 ventende jobber og én idempotent pilot.
Neste: publiser branch med GitHub create_tree/commit/update_ref, kontroller CI og READY Preview på eksakt ny SHA, oppdater denne handoffen og filhistorikken. Ingen merge uten Kenneths egen TEST OK.

## Nyeste pakke: beboervarsler uten separat godkjenningsrunde

Se **docs/qa/BOLIG_BEBOERVARSEL_FORENKLING_20261023.md** før videre arbeid. Kenneth ønsket Nytt beboervarsel på et tydelig sted, prosjekt/bygg/oppgang/boligutvalg, logo/design og utkast/papir/digital publisering i samme vindu. Implementert og testet lokalt, installert bare i Sandbox (20261023155220, worker v3). 1154 DB, 34 fremdrift/composer browser, 28 PDF, 30 plan, 34 overtakelse, 16 restpunkt og actual foundation React PASS. Full critical build og faktisk rollback-smoke PASS. Mail AV, pending/sending 0. Publisert commit/CI-status må leses fra siste PR #278. Ikke merge uten egen Bolig TEST OK. Videre forenklingskandidater er kartlagt i QA-notatet, særlig boligavtalenes Lagre→Godkjenn→Lag lenke; ikke implementert nå.

## Seneste pakke: proporsjonale byggbilder og avtaleopprettelse

Kenneths siste styring: boligene må inn i bildet for alle prosjekt-/boligtyper uten forvrengning. Dette er gjort før den autoriserte avtaleforenklingen. Detaljer, scope, testliste og konkrete QA-resultater: `docs/qa/BOLIG_BILDER_OG_AVTALEFLYT_20261023.md`. Alle fem typer har faktiske boligknapper over proporsjonalt foto; ferdig separat leilighetsbygg-eksempel og oppdatert A–Å-bilde. Avtaleeditor har én gjennomgang med Lagre utkast / Opprett beboerlenke. Eksisterende serversteg og uforanderlig beboeraksept beholdes; hvert steg kan gjenopptas etter tapt svar/omstart med samme nøkkel/token. Ingen ny SQL.

Lokalt PASS: bygger/fasade143, oversikt42, overtakelse/guide34, avtaler64, PostgreSQL1154, faktisk foundation React, full critical build/scope/docs/diff. Forrige CI646 CANCELLED i Bolig-steget, derfor ikke samlet grønnstatus. Neste commit/READY/CI leses fra faktisk PR278; ikke stol på eldre HEAD i toppen av dette notatet. Fast Preview og Sandbox uendret. Fortsatt ingen Bolig TEST OK og ingen produksjonsmerge.

## Senest: direkte aktivitet fra åpne forhold

Kenneth: «flott, hva er neste kjør». Start-SHA4c1782ee fikk **CI647 SUCCESS**. Neste kartlagte dobbeltarbeid er løst: Oppfølging i fremdriftsplanen → Åpne aktivitet bruker samme editor/lagringsvei som plan og aktivitetsliste. Endre ansvar/frister der man står og returner samme sak. Ingen ny oppgave/kildelukking ved redigering. Utkast fra annen aktivitet erstattes ikke stille; tapte lagrings-/arkiveringskvitteringer kan gjentas eksakt. En konkret feil i redigering er rettet: global planrevisjon brukes i CAS, ikke task.revision. Siste servergrunnlag må gjennomgås eksplisitt ved endring, uten tap av kladd. Ingen SQL eller utsending.

Detaljert scope/startpunkt/testliste: `docs/qa/BOLIG_DIREKTE_AKTIVITET_20261023.md`. Lokalt PASS: followup43, fremdrift35, plan30, koordinering48, overtakelse34, DB1154, faktisk React og full critical build/scope/docs. Ny commit/READY/CI leses i faktisk PR278, fast Preview uendret. Produksjon/main fortsatt urørt; ingen Bolig TEST OK. Ingen subagenter.

## Nyest: innlogget pilot og to UI-rettelser

Kenneth «flott, kjør neste». CI648 SUCCESS på 2c883138. Faktisk innlogget 40-boligpilot i samme feature-Preview/Sandbox: struktur, rom/pakke, eksisterende valg/avtaleutkast, delvis mottatt ordre, direkte restpunktredigering, overtakelse og faktisk PDF/ZIP kontrollert. Syntetisk aktivitet oppdatert til demo.ansatt1 og 31.10, samme ID/kobling/161 oppgaver; revisjon task3 mot plan5 beviser global CAS. Mail AV, pending/sending0. Faktisk 9-siders PDF og skjermbevis ligger i docs/qa/evidence. Ingen ekte utsending eller produksjonsendring.

Første bokstav lukket kontaktseksjonen i beboervarselet; nå separat UI-tilstand. Gantt boliggrupper sorteres naturlig etter adresse/bolignummer; ingen datoflytting. Scope og detaljer i docs/qa/BOLIG_INNLOGGET_PILOT_20261023.md. Lokale regresjoner: progress39, koordinering50, plan30, followup43. Full build og gjeldende commit/CI/READY avleses ved publisering i PR278. Fast Preview uendret, fysisk Safari/egen Bolig TEST OK fortsatt nødvendig. Ingen subagenter.

### Pilotens etterprøve fullført
Kode3f5ad246, Vercel dpl_6Jdy15utsGDsHX6JNiCxTmZjJCqa READY og faktisk BoligEntry-BLHHB0ED.js HTTP200. Samme innlogging/utkast; naturlig kontakttyping fungerer. Gantt sortert,161 oppgaver beholdt. Faktisk én-sides byggvarsel med logo generert, gruppe b95a5ac3-9901-4730-8e41-64708e633eed har20 papirrader,digitalfalse,publisert0; mailAV,kø0. Ny PDF/skjermbevis og eksakte grenser i QA-notatet. CI649 kjørte ved etterprøven; siste doc-checkpoint/CI-status leses i PR278. Ingen Production/TEST OK.

## Pågående: UE-/leverandørtilgang

Kenneth ber om å fortsette fra handoff etter pilot. Start05ff9aef, main36462e2b og PR278 OPEN DRAFT bekreftet. Miljømål BEGGE, samme branch/Preview, utvikling kun Sandbox. Ny prosjektflate for eksplisitte ordre-/aktivitetsutvalg og navngitt, tidsbegrenset capability-lenke. Ingen ekte invitasjon, produksjonsmerge eller subagenter. Konkret scope, autorisasjon, sikkerhetsgrenser og testliste i `docs/qa/BOLIG_PARTNERE_20261023.md`. Arbeidet er lokalt til ekstern commit/CI/Preview er registrert der.

### Partnerpilot og kontrollert retting

Faktisk app5d7fc026 / Preview dpl_7421nwFqApTUG3dDgMxQ6vNuHi6n READY, innlogget pilot med avgrenset ordre+rosettaktivitet og to faktiske syntetiske svar. Tilgang319bd85a er tilbakekalt, gamle lenken faktisk avvist, to svar beholdt. 40 boliger/161 oppgaver, rosett revision3 og31.10, original ordre partial/mottatt1 og mailAV/kø0 er bevart. Detaljer/bevis i BOLIG_PARTNERE_20261023.md.

CI651 feilet på ny historikkrekkefølge: default now() ga transaksjonsstart i stedet for innsettingstid. Behold testen. Additiv Sandbox-migrasjon20261023183331 bruker faktisk clock_timestamp for svar/tilgang og utløp etter venting på prosjektlåsen. Ny korrekt nettlesertittel på mottakersiden. 29 partnerbrowser og fullbuild PASS; endelig DB/CI/READY må avleses på korrigert commit før grønnstatus. Ingen produksjonssetting eller ekte e-post.

### Nyeste tilgangsgrense

Sandbox20261023184654 kobler partnerlenkens aktive utsteder til eksisterende Projects-entitlement (`progress_member`) i tillegg til manager-rolle. 1224 DB og faktisk rollback-smoke med bortfalt vanlig modulrett PASS; fullbuild PASS. Systemadmins arvede modulrett beholdes. Ingen UI-endring utover tidligere korrekt sidetittel;29 browser PASS beholdt. Dokumentasjon i BOLIG_PARTNERE_20261023.md. Gjeldende SHA/CI/READY leses fra PR278 etter siste publisering; ikke bruk eldre651/652 som grønn fasit.


### Siste presisering: prosjektomfattende funksjonsvalg

Kenneth korrigerte enkeltutvalget: tildelt tilgang skal gjelde alle leiligheter i prosjektet, funksjonene velges for hver UE/leverandør. Gjeldende implementasjon erstatter radvelgeren med Fremdrift, Sjekklister (lesing) og Bestillinger og leveranser (avgrenset til valgt leverandørs ordre i hele prosjektet). UE foreslås fremdrift+sjekklister, leverandør fremdrift+bestillinger. Nye leiligheter følger automatisk. Endre funksjoner på samme lenke med CAS+eksakt retry. Gamle selected-row-lenker beholdes snevre; ikke migrer dem automatisk.

Sandbox-migrasjon20261023190621.1265 DB og48 partnerbrowser PASS. Baseline57179875 hadde CI653 success. Detaljer, grenser og testliste i siste avsnitt av `docs/qa/BOLIG_PARTNERE_20261023.md`. Fortsett på samme PR278/Preview og les siste publiserte SHA/CI/READY før grønnstatus. Ingen produksjonssetting/ekte e-post; Bolig TEST OK mangler fortsatt.


Prosjekttilgang publisert på kode4aeb307f / tree6c064e68 / Preview dpl_BFz1WUgK8HeNpw84V3xPJDpRTW5R READY, samme faste alias/økt. Faktisk UI-prøve: UE40 leiligheter/161 aktiviteter+1 lesesjekkliste; deretter Endre funksjoner til fremdrift+egen leverandørs ordre på samme lenke, sjekklistefanen borte. Fiktiv tilgang d40acf45 tilbakekalt og gammel lenke faktisk avvist.0 aktive tilganger, ingen nye svar, gammel pilot/order/plan bevart. Screenshot og readback i siste QA-avsnitt. CI654 først under kjøring; hent nyeste head/CI/READY fra PR278. Ingen produksjonsmerge, mail eller Bolig TEST OK.
