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

