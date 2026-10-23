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


### Nyeste tillegg: UE skriver og laster opp

Kenneth ber om utfylling av sjekklister, egne PDF-lister/andre filer og bilder. Ny eksplisitt `quality_write` krever UE+checklists; gamle grants er fortsatt read-only. Egne native utfyllinger fra prosjektgrunnlag eller egen liste, egne vedlegg på scope, revisorhistorikk med partner-ID (ingen issuer-imitasjon), native valideringer og fullført-lås. Privat capability-kontrollert filproxy før/etter Storage,20MB PDF/bilder/DOCX/XLSX/TXT/CSV. IndexedDB-filblob før nettverk og eksakte receipts. Migrasjon20261023193507 og Edge bolig-partner-files v1 kun Sandbox.1308 DB,48 gammelpartnerbrowser,20 UE-browser,20 filgateway,35 nativekvalitetsbrowser og fullbuild PASS. Les siste QA-avsnitt for publisering/faktisk UI-prøve. Samme PR/Preview; ingen prod eller TEST OK.


UE-flyten er faktisk UI-testet på korrigertb45c486e/READY dpl_DyD3ACPmLEKKuiQzQNFS8x4Wev48: egen prosjektliste, PDF1452/PNG2629 bytes, privat nedlasting med lik SHA256, begge på kontrollpunkt, fullført i native kvalitet revision4. Prosjektleder så liste/filer/historikk i Ferdigstilling av prosjekt → Åpne dokumentasjon. Filvelgerens focus/reautorisasjon er rettet med skjult, fortsatt montert input og kontrollerte detaljer;23 UE-browser PASS. Historikkvariabel action skjulte eventkolonnen; Sandbox20261023195824 kvalifiserer kolonnene, nye UE-etiketter,1309 DB+faktisk manager-gateway-smoke PASS. Prøvegrant07e9abb4 tilbakekalt og gammel lenke faktisk avvist;0 aktive grants. Fiktiv liste/to filer/fire historikksteg beholdes, øvrig pilot/ordre/plan/mail bevart. Screenshot og siste testliste i QA. Nyeste SHA/CI/READY avleses fra PR278; ikke erklær siste CI grønn før den er ferdig. Ingen prod/utsending/Bolig TEST OK.


### Mottakersiden: Gantt og design

Kenneth fant lenken selv. Automatisk invitasjonsmail finnes ikke; produksjonssetting aktiverer den ikke av seg selv. Ny forespørsel er Gantt fremfor lang aktivitetskortliste og tydelig logo/appdesign. Implementasjonen gjenbruker BoligGantt readOnly, foldet per leilighet, første delte fane Fremdrift, detaljer→eksisterende svar. Kun frontend/QA/docs; ingen SQL/Edge/migrasjoner. Statisk eksisterende Expo-logo er produktprofilering, faktisk prosjektfirma navngis fra eksisterende data. Gantt-søk/gruppefilter persisteres nå i session UI-state som øvrige chartkontroller. Native UE-filinput må fortsatt være montert skjult under reauth. Les siste QA-avsnitt for status; SHA/CI/READY må alltid avleses fra gjeldende head.


Gantt/appdesign publisert på3fe86251 / tree69ae0846 / READY dpl_6A4kUapQDjry2WPzHAB9TBWSsk2M, fast Preview-alias og eksakt SHA verifisert.60 partnerbrowser,23 UE-browser,30 intern bulk/Gantt og full critical Sandbox-build PASS, scope/docs/diff PASS. Faktisk syntetisk leselenke viste40/161, H0101 fold/stolpe→Aktivitetsdetaljer→svar med riktige rosettdatoer, usendt prøve forkastet; måned/søk og2 sjekklister pass. Midlertidig DEMO – Gantt QA tilbakekalt. VIKTIG: brukeren har siden forrige tur laget egen aktiv tilgang;1 aktiv skal bevares, ikke rydd til0. Ingen nye svar/ordre/plan/kvalitetsendringer/mail. Skjermbilde docs/qa/evidence/bolig-partner-gantt-20261023.jpg. CI660 under kjøring ved dokumentasjon;659 kansellert ved oppfølgingscommit, baseline658 success. Dokumentasjon/bevis-commit kan gi ny CI; hent faktisk nyeste SHA/CI/READY. Ingen prod/Bolig TEST OK.


## Sjekklisteprioritering 23.10 – neste tillegg etter32ff94a4

UE-portalens delte prosjektlister og egne utfyllinger grupperes Pågående/Neste sjekklister/Fullførte. Fullførte er sammenfoldet nederst med antall og reell dato. Egen gruppering bruker lagrede svar/kommentarer/felt/dokumenter; delte lister kun den whitelistede punktstatusen. Søk inkluderer egne lister/plasseringer. Uavhengig sidevisning per gruppe hindrer at45 ferdige skjuler neste uferdige. Kort bruker stabile scope+ID-nøkler; delte kontrollpunkter/folding bevares ved refresh. Fullføring flytter etter serverkvittering og neste arbeid fokuseres; native kladd/filinput/retry beholdes. Interne kvalitetskort er gjennomgått og uendret.

Lokal QA:49 UE-browser +60 partnerbrowser +35 native kvalitetsbrowser og full critical Sandbox-build PASS. Ingen SQL/gateway-/e-post-/Production-endring. Faktisk pilottest/Preview/CI oppdateres etter publisering; ikke erklær grønn CI før eksakt SHA er sjekket. Brukerens1 aktive tilgang skal bevares. Samme PR278 og faste Preview. Ingen merge uten Kenneths samlede Bolig TEST OK; fysisk Safari/mobil gjenstår.


### Faktisk Preview-prøve av prioriteringen

Kode1bdae9ec7e4f5eec108d786ecda246bd8b36cc47, tree753e17f191b7e0da1e11cfcf483f66c93a2d98dd, Vercel dpl_BXvQZVpvBtEJScGe7DpFaLJXek5D READY med eksakt SHA og fast alias verifisert. Gjeldende main36462e2b er uendret.

Egen fiktiv UE-grantf8701f60-d7a2-4b01-a610-1b9260c8ddf6,1 dag, kun Sjekklister+egen utfylling. Tre syntetiske native prosjektlister ga én fullført, én pågående og én urørt. Faktisk cloud-UI viste Pågående/Neste/Fullførte i begge eksisterende oversikter. En pågående liste ble fullført i UI; serverkvittering ble vist, begge oversikter flyttet listen til Fullførte, og faktisk fokus gikk til neste uferdige utfylling. Fullførte-gruppen åpnet de to tidligere kontrollene med faktisk dato23.10. Bevis: `evidence/bolig-sjekklister-prioritering-20261023.jpg` (uten token).

Alle tre QA-listene er deretter arkivert gjennom native managerfunksjon med begrunnelse; historikken beholdes. Bare egen QA-grant er tilbakekalt, og samme lenke er faktisk åpnet på nytt og avvist uten prosjektinnhold. Readback:1 aktiv tilgang (brukerens beholdt), QA revoked=true,3 QA-lister arkivert og original H0101 fortsatt Avvik. Ingen filer, bestillinger, fremdriftsdatoer, e-post eller produksjonsdata endret av prøven. En første sammensatt QA-transaksjon ble automatisk rullet tilbake ved deadlock; separat avgrenset oppretting/prøve/arkivering lyktes. Ingen endring i backendens låsemekanisme er gjort i denne visningspakken; observasjonen må vurderes i senere concurrency-QA.

CI662/40021028773 på appkoden1bdae9ec er fortsatt in_progress ved denne dokumentasjonen. Sjekk gjeldende HEAD/CI etter dokumentasjonspublisering; grønn lokal QA er ikke en påstand om ferdig samlet CI. Kenneths Bolig TEST OK og fysisk Safari/mobil gjenstår før merge.


## Nytt senere-ønske: faktisk bemanningsliste – 23.10.2026

Kenneth ber om å notere, ikke bygge nå: prosjektets involverte håndverkere skal svært enkelt registrere seg inn ved ankomst og ut ved hjemreise, særlig på mobil. Dagens oversikt viser registrerte personer/firma, antall inne og inn-/uttider og kan brukes mot byggherre/tilsyn. Prosjektleder må kunne registrere inn/ut manuelt og rette glemte tidspunkt, med sporbar historikk. Felles prosjektfunksjon vurderes, også for boligprosjekter. Full kravtekst er lagt øverst i `docs/architecture/BOLIG_VIDERE_PLAN_20261021.md`. Skal ikke forveksles med planlagt bemanning i Gantt. Ikke implementert; prioriteres senere.

Neste anbefalte funksjon etter levert sjekklisteprioritering: e-post med eksisterende UE-/leverandørlenke fra samme kontaktvindu, tydelig mottaker og enkel Send-handling, via eksisterende utsendingsmotor uten eget godkjenningssted. Bruker har i denne turen kun bedt om notat og neste-status; ingen ny funksjonskode eller ekte utsending er igangsatt. Produksjonsløpet krever fortsatt separat Bolig TEST OK.


## E-post med UE-/leverandørlenke – 23.10.2026

Kenneth sa kjør etter forslaget om e-post fra samme kontaktvindu og presiserte at malen skal være lik eksisterende appmailer. Miljømål BEGGE. Baseline2c938530, main36462e2b, samme feature/PR278/faste Preview. Scope: BoligPartners, ny BoligPartnerInvitation/klient og e-posthandler, delt logohelper, additiv privat sendingsmetadata/transport, scoped CSS, tester, hjelp og dokumentasjon. Ingen subagenter. Bemanning er fortsatt senere: grønn/rød inn-/utsirkel med tydelig tekst og plassering som ikke dekker øvrige mobilfunksjoner, registrert i videreplanen.

Kontaktvinduet har synlig, serverbestemt mottaker og firmaprofil, valgfri Forhåndsvis e-post, Send tilgangslenke / Send lenken på nytt og Sendingshistorikk. Ingen ekstra godkjenningsflate, automatisk opprettingssending eller separat arbeidssentral. Appens etablerte controller-invitasjonsstil er fulgt: mørk flate, turkis Expo/knapp, firmalogo, detaljfelt og signatur. Avsender-/logohelper gjenbrukes fra eksisterende leverandørmail. Tom logo ga tidligere rot-URL som bilde; den delte helperen gir nå faktisk fallback-PNG, uten øvrig endring i leverandørmail. Preview-iframe er sandboxet og har egen mobiltilpasning.

Råtoken ligger fortsatt bare i opprinnelig lokal lenke og HTTP-minnet frem til sending. Mottaker kan ikke byttes i e-postflaten; tokenhash, gjeldende grantrevisjon, manager/aktivt arbeidsfirma/prosjekt/modulrett og opprinnelig utsteders rett kontrolleres før klargjøring og igjen før begin. Serverstyrt site_origin hindrer klientstyrt phishinglenke. Frozen snapshot utelater råtoken. Ny privat deny-all partner_mail og partner_mail_settings; public gateway er invoker med smal privat definer, kvitteringsfunksjon kun service_role. Handleren autentiserer Auth.getUser; verify_jwt=false er tilsiktet som øvrige appmailer med egen Auth-validering. Serviceklient brukes bare til providerkvittering. Ingen offentlige tabellgrants eller ny Storage-policy.

Sendings-ID/mottaker/revisjon sikres lokalt før nettverk. Eksakt retry etter remount/dvale/nettbrudd bruker samme Resend-idempotensnøkkel og fryst innhold. Sent svar gjenåpner ikke gammelt scope. Lagret providerkvittering kan gjenfinnes uten ny sending. Påbegynt uavklart sending blokkerer ny ID;23-timers grense, cooldown og antallsgrense bevares på server. Et foreldet aldri-startet forsøk kan oppdateres ved ny monotont økende grantrevisjon; et påbegynt forsøk ryddes ikke stille. Provideraksept betyr ikke levert/lest e-post.

Sandbox-migrasjon **20261023210201_bolig_partner_invitation_mail** (CLI migration new, lokal fil avstemt mot faktisk serverversjon). Edge **bolig-partner-email v2 ACTIVE**. Privat site_origin er satt til fast feature-Preview kun i Sandbox. Ny transportbryter er **AV**, og eksisterende progress-mail-brytere er urørt. Produksjon er ikke endret. Ved senere godkjent lansering må korrekt produksjonsorigin/transport og kontrollert e-postmottak verifiseres; dette er ikke en ny daglig godkjenningsrutine.

Verifisering på endelig kode: **1345 PostgreSQL-foundationassertions**, **75 partner-Chromium**, **49 UE-kvalitets-Chromium**, **35 native kvalitets-Chromium**, **56 nye mailhandlerassertions** + **47 eksisterende supplier-mail** + **46 eksisterende Bolig-bestillingsmail** PASS. Tidligere assertions beholdt; ny partnerreise dekker samme kontakt, mal/sandboxet iframe, eksakt retry etter remount, sen kvittering ved blur, pauset transport, sikker oppdatering av foreldet aldri-startet forsøk og ingen horisontal overflow i både app og e-post ved390/320px. Full critical Sandbox-build PASS. Faktisk Sandbox rollback-smoke PASS: mottaker/firmaprofil, ingen råtoken i read/snapshot, eksakt replay, pauset begin, fremmed token og revokert receipt avvist. Alle prøvedata rullet tilbake. Publisert Edge avviser faktisk uautentisert POST med Logg inn/uncertain=false; ingen providerkall. Sikkerhetsrådgiver beholder de samme seks kategoriene, med to nye bevisst deny-all privat-tabeller.

Visuelt eksempel av den faktiske renderfunksjonen med kun syntetisk innhold og ugyldig null-token: `evidence/bolig-partner-mail-example-20261023.png`. Dette er malbevis, ikke en sendt/mottatt e-post eller innlogget managerprøve i publisert Preview. Ekstern publiseringsstatus/CI leses på nyeste HEAD etter push. Innlogget brukerprøve, fysisk Safari/mobil, kontrollert reell e-postprøve og Kenneths samlede Bolig TEST OK gjenstår før produksjonsløpet.

Brukerprøve: **UE og leverandører → åpne kontakten → E-post med tilgangslenke → Forhåndsvis e-post**. Se korrekt kontakt, e-post, firmalogo, prosjekt/funksjoner og gyldighet. Send-knappen er pauset i testmiljøet; manuell deling virker som før. Opprinnelig rålenke må finnes i samme nettleser.

## Nyest: treg UE-liste, popup og samlet e-postkart

Kenneths feilrapport og e-postgjennomgang følges i `docs/qa/BOLIG_REFRESH_OG_EPOST_20261023.md`. Miljømål BEGGE, start c45047b1, samme Preview/Sandbox/PR278. Intern iframe-fokusveksling og ubetinget minutt-nullstilling rettet i felles partnerhook, ekte dvale/tilbakekalling fortsatt sperret. Sandbox-migrasjon20261023212214 reduserer gjentatt SQL-projeksjon: ca2,8–3,5s til0,57s målt DB-lesing. Ingen data/grants/transportendring. Lokalt DB1351, partner86, UE-kvalitet49, intern kvalitet35 og fem e-posthandlerprøver PASS. Endelig React/build/CI/READY og publisert etterprøve må avleses. E-postkartet dokumenterer konkrete hull: direkte sending av portalinvitasjon/påminnelse og avtale-/endringsordrelenker. Ikke lov full appdekning eller gjeninnfør bevisst stoppet rutine-e-post. Timeadministrasjonens fokusnullstilling er en kildekandidat for egen scenario-QA, ikke påstått ferdigrettet. Kenneth har bekreftet kenneth@ringside.no for eventuell kontrollert test; ingen ekte mail sendt og Sandbox-brytere fortsatt AV. Neste anbefaling er de manglende invitasjonsflytene før fasade/plantegning; bemanning senere, Excel sist. Ingen Bolig TEST OK/produksjonsmerge.

### Publisert etterprøve og checkpoint

Appkode **e6a9b44ad8f67c4b12f9d2f4619c52e1877df126**, tree **ef12f73388a7df2ddc3170727a19df333d74d66e**, lokal/ekstern kilde identisk. Vercel **dpl_F6kSE8ZA3b3m62FQKkJbzWxtxcad READY**, eksakt SHA og fast branch-alias kontrollert. Full critical Sandbox-build, faktisk foundation React, scope/docs/diff PASS. Første React-forsøk manglet JSDOM-modulsti; korrekt eksisterende KSHMS_JSDOM_PATH ga PASS uten kodeendring. CI666/40027032878 kjørte ved denne kontrollen; forrige665 SUCCESS. Les siste SHA/CI på PR278, ikke anta grønn ny HEAD.

Faktisk innlogget samme demoøkt i publisert Preview åpnet40-boligpilot → UE og leverandører → eksisterende aktive Expo/Eli-kontakt. Korrekt navngitt mottaker kenneth@ringside.no,40 boliger/161 aktiviteter og pauset Send-knapp. Vinduet kontrollert fortsatt åpent etter bakgrunnsoppdatering. Denne nettleseren mangler brukerens rålenke; invitasjonsvisningen opplyser korrekt at lenken bare finnes der den ble opprettet. Derfor ingen innlogget ekte iframe-/sendetest på brukerens eksisterende grant. Faktiske iframeklikk med DOM-identitet og forsinket timer er testet i86-assertioners Chromium-harness. Ingen brukergrant endret, ingen ny tilgang opprettet, ingen ekte mail. Readback:1 aktiv brukergrant,161 aktiviteter,0 partner_mail-rader og begge Bolig-transportbrytere AV. Produksjon/main urørt. Fysisk Safari/brukerens egen samlede Bolig TEST OK gjenstår.

## Senest: direkte e-post med beboerlenker

Kenneth «kjør»: portalinvitasjon, påminnelse og boligavtale-/endringsordrelenke er implementert i eksisterende vinduer. Samme brandedInvitationMail som UE, servermottaker, optional preview, frosset sending/historikk/eksakt retry. Lenkeoppretting sender aldri automatisk. Se `docs/qa/BOLIG_BEBOERLENKE_EPOST_20261023.md` for presis scope, native tilgangsgater, tester og brukerprøve. Sandbox-migrasjon20261023214107, resident-link-email v2 og partner-email v3 ACTIVE. Nye transportbryter AV, progress/UE AV. Ingen reell e-post, produksjon eller brukergrant endret. Lokalt DB1392, ny handler60 og UE56 PASS; faktisk rollback-smoke/Edge401 PASS. Endelig browser/build/CI/READY avleses ved publisering. Ingen Bolig TEST OK/merge. Neste fasade/plantegning, egen time-QA-kandidat, bemanning senere og Excel sist.

Endelig lokal verifisering: portal39, avtale67, UE/leverandør86 Chromium PASS; DB1392, residenthandler60, UE-handler56, faktisk foundation React og full critical Sandbox-build PASS. Mobilmal visuelt gjennomgått ved320px; ingen klippet lang overskrift. En test-remount ble gjort deterministisk ved å vente til reader-flaten faktisk var montert før manager gjenopprettes; ingen brukerkrav eller assertions fjernet. Sikkerhetsrådgiver samme seks kategorier. Faktisk Sandbox-readback: resident_mail0 rader,0 QA-smokerøtter, alle tre Bolig-mailbrytere AV. Forrige HEAD e5d3037 fikk CI667 SUCCESS. Ny SHA/CI/READY avleses etter publisering; ikke bruk tidligere CI som bevis for nye endringer.


## Senest: misvisende prosjektkobling og core-vern – ingen merge

Kenneths skjermbilde viser Leilighetsinformasjon i aktivt boligprosjekt. Miljømål BEGGE, utførelse kun feature-Preview/Sandbox. «Lagre i firmaet» blir «Lagre endringer» / «Endringene er lagret.». Ekstra ordinær prosjektkobling foldes og forklares som valgfri; eksisterende ID og all native kladd/lagring bevares. Brukeren har meldt e-postforhåndsvisninger OK og eksplisitt **Vi skal ikke merge til produksjon ennå**. Ikke be om merge eller tolke dette som TEST OK.

Hele PR-en gjennomgått mot faktisk main36462e2b. Nye core-boundary og shared-board CI-kontroller,51 main-/e-postassertions og13 direkte Chromium-sammenligninger av standard tidslinje (390/1366px). Fant og avgrenset to tidligere sideeffekter: tom-logo-fallback gjelder nå kun Bolig-invitasjon, og eksportbetingelsen gjelder kun dateOnly. Vanlig leverandørmail er byte-identisk med main bortsett fra helper-export. Standard tidslinjereiser er like main. Foundation React, header91, Sales editor196, module navigation React, Bolig planning30, UE86, handler56/60 og full critical Sandbox-build PASS. Ingen gammel critical-test eller migrasjon endret. Ingen nye Supabase-endringer/ekte sendinger/brukergrant-/kontaktendringer. Full scope, tilsiktet historisk felles fullskjerm og begrensninger i `docs/qa/BOLIG_AVGRENSNING_OG_TEKSTER_20261023.md`. Ny CI/READY/faktisk Preview-tekst må avleses på publisert SHA. Egne fasader/plantegninger er neste kandidat, ikke implementert i denne rettings-/regresjonspakken. Bemanning senere og Excel sist.

## Egne fasader og plantegninger – 24. oktober

Kenneth autoriserte en samlet pakke og valgte plasseringsforslag som kan flyttes. Fasader per bygg, flere bildebårne plantegninger per bolig, justerbare stabile bolig-/romfelt, forhåndsvisning og immutable versjonshistorikk er implementert i feature/Sandbox. Scope/testbevis/grenser og konkrete brukerknapper finnes i `docs/qa/BOLIG_EGNE_BILDER_20261024.md`. PDF må eksporteres til JPG/PNG/WebP først. Ingen produksjonsmerge, transportaktivering eller ny ekstern tilgang.

Kenneth presiserte at booking og faktisk bemanningsoversikt skal være valgfrie prosjektfunksjoner, aktivert fra Oppsett når de bygges. Selvbooking er ikke avklart; tidspunkt vil ofte styres av andre via fremdrift, beboermøter og varsler. Ingen tomme funksjonsbrytere eller motorer er lagt inn nå. Kontraktsområdet og Excel-import er ikke startet.

Sandbox-migrasjon20261023224653, privat immutable bolig-project-visuals-bucket og egne private tabeller/gateway. Native rollback-smoke PASS; alle syntetiske skriver rullet tilbake. Lokal DB1458, ny Chromium42, gammel overview42/rooms51/builder143/catalogimage29/package36/shared-board13/header91/Sales196, faktisk Foundation React og full critical Sandbox-build PASS. Sikkerhetsrådgiver samme seks kategorier, kun to nye INFO for deny-all privat-tabeller. Ingen gammel critical-check/migrasjon svekket. Publisert SHA/CI/READY og faktisk innlogget prøve avleses etter publisering; lokal QA er ikke ferdig samlet CI eller fysisk Safari.
