# Overlevering – Design 03.6, rapportbilder og release
Dato: 1. november 2026. Systemeier: Kenneth Skogsrud. Repo: ExpoProffsenter/expo-proffdok.

## Start her
Les AGENTS.md og PROJECT_GUARDRAILS.md, denne filen, CURRENT_RELEASE_STATUS.md og siste kommentarer i PR295. Bruk ferske refs/PR-/deployresultater som fasit. Ikke tolk eldre restlister eller produksjonsplaner som aktuelle installasjonsordre.
Kenneth ønsker korte norske svar og selvstendig arbeid i sammenhengende pakker. Ikke start ny totalinventering eller gjenta beståtte uendrede tester. Ikke be om samme godkjenning igjen. «Kjør» er arbeidstillatelse, men samlet redesign har ennå ikke uttrykkelig TEST OK.

## Faktisk GitHub-status ved overlevering
| Del | Branch / SHA | Status |
| --- | --- | --- |
| main | b389c7071b03f7e1d96a0ff0c0d5458edeebca3f | Uendret i denne chatten. Ingen redesign-merge eller Production-migrering |
| PR295 | design01-app-ramme-20261028 / a39b73d462ec5ec809e43a514d58180ce73b45b8 før denne dokumentasjonsfilen | Åpen, draft, ikke merget. Appkode61076b47caf55d5ccfbe018a464408951aed0b1a |
| demo | fd04ac9a31dee75d29d1c770b65b5edf023b619c | Nyeste commit indeholder bare billedkilder/QA og status. Appkode uendret fra8ee9c23d0209f72484830cf6cc7f0206f0c87da0. Ny deploy-READY er ikke kontrollert i denne chatten |
| PR294 | fase45b-bolig-portal-polish-20261025 / c3594f108d605aeae0d895b9d8e71b1824d1f854 | Åpen, ikke merget |
| PR298 | fix-kshms-extract-scope-lock-20261029 / 338094b1d77bade1fef897c410c22d9e5d8750e4 | Åpen, ikke merget |
| PR305 | standalone-checklists-20261030 / 09b1ece3839a367c2e61faeea3f184999f6a88d1 | Åpen, ikke merget; kode er ancestor i PR295 |

Denne handoffen er en ren dokumentasjonsendring på PR295-branchen. Nytt dokumentasjonshode får egen CI/deploy; ikke bruk forelders grønne kjøring som fersk attest på nytt hode.
Siste kjente fulle kandidatattest: a39b73d4, CI867/run41282303882 SUCCESS10/10 og READY. App61076b47 har også fullCI866SUCCESS10/10. Ingen ny appendring i denne chatten.

## Miljøer
- Fast design-Preview: https://expo-proffdok-git-design01-app-ramme-20261028-ringside.vercel.app/?progressTest=safe
- Production: https://expo-proffdok.app – Supabase dqffxflaoyarbxyiyhop.
- Permanent demo: https://expo-proffdok-git-demo-ringside.vercel.app – Sandbox ppvircenkjizeiqdxphj.
- Fast design-Preview er særskilt bundet til Sandbox via EXPO_BACKEND_TARGET=sandbox; ikke anta at andre feature-Previewer har samme binding.
- Ordinær appkode: feature → Preview → uttrykkelig TEST OK → main/Production → kontrollert main → demo. Demoressurser skal aldri demo → main.

## Levert i denne chatten: demobilder er faktisk reparert
Kenneth mente bildene manglet fordi prosjektet aldri hadde fått ordentlige bilder. Verifisert årsak: to relative SVG-er finnes ikke i design-Preview, og fem JPG-er på demovert er ugyldige bildefiler.
Brukeren valgte i avklaring uttrykkelig **Realistiske AI-demobilder**. Sju nye enkeltbilder er generert: før arbeid, underlag/primer, membran/tettebånd, slukmansjett, rørmansjett, varmekabel og ferdig bad. Hvert bilde er tydelig merket **DEMO · AI-generert**. De er fiktive illustrasjoner, ikke ekte prosjektbevis, produktfoto eller verifisert monteringsanvisning.

Miljømål SANDBOX/DEMO. Endringen er **installert**, ikke bare forberedt:
- Kun prosjekt a0000000-0000-4000-8000-000000000002, «DEMO – RESERVE – Ferdig våtrom med garanti».
- Sju galleri-URL-er og fem eksisterende referanser under kontrollpunkter er erstattet med innebygde, gyldige JPEG-data-URL-er,1200×800.
- Kun de tilsvarende photos/checklist-delene i reserveposten i golden-v1 er oppdatert. Ingen full capture og ingen reset. Senere ordinær demo-reset vil derfor beholde nye bilder.
- Prosjektets låste status, kontrollsvar, garanti, signaturer, priser og øvrige felt er bevart. Ingen kode/RLS/Storage/tilgang/e-post/Production-endring.
- Gamle public/demo-images-filer og andre prosjekter er ikke endret. Dette er ikke en generell endring av bildelagring.

### Faktisk verifisering
Alle sju JPEG-er er dekodet; SHA256 lest tilbake fra lagrede databasebyte matcher de eksakte kildefilene. Installasjonen ble først kjørt i transaksjon med rollback, deretter installert atomisk med guards.
Vernet prosjektdatahash uten photos/checklist:81376df8a2c5210e1b07ae11497eb9bd.
Kontrollsvar uten bilde-URL-er:cd86a44deb44bfa6ce0aca91065767a7.
Transaksjonen kontrollerte at hele Golden-payloaden uten reservepostens to bildedeler var uendret.
Innlogget skynett: alle sju galleribilder og alle tolv rapportplasseringer complete=true/naturalWidth1200/naturalHeight800.
Ny fane bekrefter varig lagring og åpning av «DEMO – Ferdig bad» i stort høyrepanel med AI-merking. Skjermbilde er vist til Kenneth. Ikke oppgi total app-/rolle-/mobilattest.

### Varig kilde, backup og sikker videreføring
Eksakte JPEG-er, manifest, prompts, historisk kontrollert installasjonsmal, byggescript og presise prøvegrenser:
https://github.com/ExpoProffsenter/expo-proffdok/tree/fd04ac9a31dee75d29d1c770b65b5edf023b619c/docs/qa/demo-reserve-ai-media-20261101

Backup i Sandbox: demo_sandbox_snapshots.snapshot_key=backup-reserve-media-before-ai-20261101, feltene live_media/golden_media.
Ikke kjør installasjonen igjen eller erstatt hele Golden-snapshotet. Eventuell tilbakeføring gjenoppretter bare photos/checklist fra disse to backupfeltene og beholder øvrige ferske data. Ingen nøkler, passord eller portal-token er lagret i dokumentasjonen.
PR295 har ny statuskommentar6558520821; den store PR-beskrivelsen har eldre historikk. Eldre tekst om at levende rapportbilder fortsatt mangler er nå utdatert.

## PDF-nedlasting: fortsatt åpent
Faktisk innlogget flyt: Rapport → Last ned PDF → Fortsett uten KS/HMS → Generer PDF.
Vent på download ble startet før Generer PDF. Deretter tidsavbrøt nettleserstyringen og nullstilte REPL. Gjenbinding av den gamle fanen gav Emulation.setFocusEmulationEnabled-timeout. Ingen ny PDF-fil ble mottatt.
En ny fane på samme adresse fungerte og beholdt innloggingen.
Dette beviser verken generatorfeil eller vellykket eksport. Ikke påstå at ny levende PDF eller bildeinnbygging i PDF er kontrollert. Ikke gjenta samme fastlåste eksport uten konkret ny grunn. Neste undersøkelse må skille generator, eventuell dialog, nedlastingshendelse og filoverføring.

## Tidligere ferdige rettelser skal beholdes
- Rapport åpnes i høyrepanel med synlig PDF-knapp og retur til samme prosjekt/URL; arkivbekreftelsen ligger i appen.
- Prosjektliste: navn/status/kunde er utenfor summary. Bare Vis detaljer utvider; Åpne beholder prosjekt-ID/callback.280Chromiumkrav og native kladdvern bestått.
- PDF-forsidens doble teksttegning er fjernet. Native avviksliste har kompakte kort, gjentatte etiketter og full lange fortsettelser.390krav/ti syntetiske PDF-er162sider,9PDF/5print er tidligere dokumentert.
- Disse syntetiske prøvene er ikke ny levende reserve-PDF med de nye AI-bildene.
- Hele brukerens observerte visningshopp, innlogget kortskjerm og total03.6-avstemming er fortsatt ikke sluttattestert.

## Video og videre produktarbeid
Fem originalfilmer er installert i Hjelp → Vis videoer med kapitler/tekstalternativ/retur. Godkjent mal PROFFDOK-VIDEO-1.0: faktiske skjermbilder, klikkmarkeringer og tekst, ingen stemme; redigerbare kilder. Alle funksjoner/underfunksjoner skal etter hvert få film.
Ny72sfilm VID-HELP-002-PLAYER er ferdig, men **ikke installert** i appregisteret:
- MP4: libfile_0fb95f0dba5c81919cbc4cf3ec1aee5f
- Kilder: libfile_a49c6fad48288191bcbca8d2cab2bfdd
- Kontaktark: libfile_4a558aee44bc8191971fe840ca55ed77
Eksisterende originalfilm er live-testet for avspilling/kapitler/retur. Ny MP4 er FFmpeg-dekodet. Ny MP4-browseravspilling/fullskjerm er ikke bekreftet. Rapportfilmen venter på stabil og kontrollert eksport. Ikke bland dette med full appdekning.

## Release og neste steg
1. Bekreft ferskt hode/CI/READY og miljøbinding, og les ny status før videre arbeid. Bevar uendrede grønne tester; ikke start samme totalrunde igjen.
2. Lukk PDF-nedlastingspunktet med en konkret annen diagnostisk tilnærming og avstem de navngitte restene for visningshopp/kortskjerm/design. Bildene er nå på plass.
3. Oppdater den eksisterende produksjonsplanen mot aktuell appkode. docs/qa/DESIGN_036_RELEASE_PLAN_20261101.md og evidence/design036-integration-20261101.patch bygger på gammel PR295-app e1f93ce0. De er historiske integrasjonsreferanser, må prøves mot senere rapport-/listeendringer og må aldri påføres blindt.
4. PR305 krever egen kontrollert Production-installasjon av supabase/migrations/20261031012504_checklist_template_proposals.sql før ny frontend. Den var kun installert i Sandbox ved siste kontroll. Kontroller faktisk status på nytt, ikke kjør gammel installasjonsliste eller db push.
5. Før merge kreves Kenneths uttrykkelige TEST OK for releasepakken PR294/298/305/295, inkludert nye sjekklister/databaseendringen. Ingen slik samlet godkjenning er gitt.
6. Etter godkjent Production og kontrollert main→demo/preflight: lag Solgløtt, seks bygg med fire boliger hver, totalt24boliger. Bruk realistiske bolignavn, komplett bad, FlisLab-fliser og Badehaus som grunnpakke, Dansani som tilvalg. Kenneth har visning tirsdag3.november. Prosjektet er fortsatt ikke opprettet. Design ferdigstilles først.
7. Fullfør flere funksjonsvideoer i naturlige pakker. Ingen branchopprydding inngår nå.

Bevar utsendingsbegrensninger. Ingen prøve-e-post/invitasjon/bestilling til reelle mottakere uten konkret autorisasjon. Ikke slett/nullstill data eller merge for å rydde.
