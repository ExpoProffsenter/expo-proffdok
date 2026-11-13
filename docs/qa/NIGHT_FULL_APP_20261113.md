# Natt-QA 13.11.2026

## Eierskap og kontrollpunkt
Aktiv eier: Codex nattarbeid, første kjøring 13.11.2026. Arbeidsbranch `qa/night-review-20261113`. Ingen andre åpne natt-QA-PR-er funnet; PR321 teksthjelp holdes separat. Oppdater dette dokumentet før neste kjøring fortsetter. Ikke gjenta allerede dokumenterte tester uten endret grunnlag.

Baseline main `6377381476ad3ee8d6d6364dc5872a0b019da029`, demo `3d65c0e022ed11ec73aa569f79bfe6f362d30fae`. PR322/320/323/324 lest; alle merget. PR322s produksjonslogg er gjeldende, eldre CURRENT_RELEASE_STATUS/README er historikk. Ingen migrasjoner, Edge eller gammel kø skal kjøres på nytt.

Miljømål BEGGE for apprettelser; syntetisk data kun sandbox. Ingen produksjonsmerge uten ny TEST OK. Ingen e-post, reell ordre eller reell avtale.

## Reservert arbeid denne kjøringen
1. Inventar fra faktiske moduler, navigasjon, hjelp og videokatalog.
2. Undersøk BoligPortalManager: vist første rom mot draft.scope_id=common. Scope ved eventuell rettelse: kun romvalg i denne komponenten, relevant regresjonstest og endringsgrunnlag.
3. Tilgjengelig sandbox-UI og bolig38; identifiser tilgangsbegrensninger uten å blokkere uavhengige kontroller.
4. Videoscene-/ressursinventar. Ingen påstand om ferdig revidert film uten avspilling og visuell QA.

## Status
Pågår. Ingen nye feilrettelser eller tester attestert ennå. Neste oppdatering skal skille innlogget UI, automatisk test, kildeinspeksjon og ikke verifisert.

## Kontrollpunkt 1 – utført 13.11.2026
Eierskap: første kjøring ferdig; neste kjøring fortsetter her. Ingen overlappende appendringer: PR325 eier bare portalens romvelger.

### Verifisert grunnlag
Fersk Vercel-lesing: Production READY dpl_5XnCpe1fmkFxcKScWvUPaJFEdD5A på main63773814; permanent demo READY dpl_Dz7jRmLnNDgD4zcokmvBPucbR1oF på demo3d65c0e. Ingen deploy/migrasjon/aktivering utført i denne kjøringen.

### Innlogget sandbox – faktisk UI
Eksisterende demoøkt, Expo Proffsenter. Startside → Boligprosjekter → QA – Orvei import og felleseiere12.11 → ByggB → bolig38. Riktig prosjekt og bolig bevart ved retur fra portalpanelet.
- To eksisterende portalalternativer bekreftet: standardbad0kr/2varer og standardbad+speil2500kr/3varer.
- Romvalgfeil gjenskapt: fjern «Bruk boligens lagrede valg»; UI viser Bad1, men Legg til er deaktivert. Ingen ekstra portalalternativ opprettet. Avkryssingen satt tilbake.
- Endringer og beboeraksept hadde ingen avtale. Klargjør beboeraksept viste lagret boligvalg v2,3syntetiske varer og2500inkl.
- Lagret **ett** syntetisk avtaleutkast, utgave1, svarfrist13.12.2026 kl23:59 norsk tid. Beskrivelsen merker tydelig sandbox/ingen reell avtale. UI bekrefter lagret i avtalehistorikk. Ikke publisert, akseptert eller sendt. Ikke opprett ny duplikatutgave i neste kjøring.
- Bilde: evidence/night-bolig38-avtaleutkast-20261113.jpg. Ingen portal-token i bilde eller dokumentasjon.
- Bestillingsfrist på bolig38 er IKKE kontrollert. Svarfristen ovenfor er en annen frist.

### Funn og rettelse
N-UX-001, middels alvorlighet: misvisende romvalg. PR325 https://github.com/ExpoProffsenter/expo-proffdok/pull/325, commit f9875bd742ba40319fd08396b1f5628b5f3e37ae. Eksplisitt «Velg rom eller pakke» når scope mangler; gyldig valgt rom bevares. Ingen data-/tilgangs-/prisendring.
Faktisk komponent/jsdom viste rød assertion før rettelse (room-1 i stedet for tomt valg), deretter fem kontroller PASS: manglende scope, eksplisitt valg, fokus-refresh, fjernet rom og sperret innsending. Seks permanente assertions lagt til scripts/bolig-portal-browser-check.mjs.
npm run build inkl. critical-kjede PASS; scope/dokumentasjonsvakt PASS; git diff --check PASS. Lokal Chromium kan ikke starte: socket Operation not permitted. Dette er en lokal testmiljøbegrensning, ikke appfeil; nettlesertest må fullføres i CI.
CI43353049742 pågår ved kontrollpunktet; build, HR og firma-db bestått, øvrige pakker pågår. Preview READY dpl_BHyBPLLKddCPUEB9bcbwMhPW7qH7, fast host https://expo-proffdok-git-fix-bolig-portal-scope-select-8ccd40-ringside.vercel.app . **Backendbinding og innlogget Preview er ikke verifisert. Ingen skrivetest der før sandboxbinding er bekreftet.** Ingen ny TEST OK; ingen produksjonsmerge.

### Inventar og videoer
Se NIGHT_FULL_APP_MATRIX_20261113.md:145eksisterende brukerreiser i18domener +6eksplicitte nyere tillegg. Alle registerets kildebaner finnes. Hver rad skiller nye UI-bevis fra ikke nyverifisert; ikke full appattest.
Se NIGHT_VIDEOS_20261113.md:15aktive videoer fullstendig dekodet med ffmpeg uten feil. SHA256, byteantall, ffprobe-varighet, stigende kapitler og VTT-eksistens PASS. Video-dekningsregisterets egen kontroll PASS. Dette er ikke visuell revisjon eller bevis for Hjelp-avspilling.
A–Å-revisjonsplan og batchmanus lest. Ny A–Å-film er ikke produsert;57scener gjenstår å revidere/oppta. Ingen stemmetjeneste brukt.

### Neste kjøring – konkret rekkefølge
1. Hent fersk main/demo/åpne PR-er og les dette kontrollpunktet. Kontroller PR325 CI uten rerun av beståtte uendrede tester. Rett eventuell reell testfeil på samme branch.
2. Bekreft Preview-binding og utfør desktop/mobilprøve av PR325. Bruk aldri produksjonsbackend til syntetiske writes. Bevar PR321 og alle nyere endringer.
3. Fortsett bolig38 fra eksisterende avtaleutgave1. Kontroller faktisk bestillingsfrist, felleseiergrenser og syntetisk aksept/bestillingsutkast. Hent portal via autorisert UI; ikke lagre token i repo. Ingen mail behøves. Syntetisk avtale er tydelig merket.
4. Hent redigerbare V12-kilder og produser revidert A–Å-video fra ferske sandboxbilder med gjennomgående peker. Gjennomgå alle15Hjelp-innganger/avspilling og visuell relevans.
5. Fortsett øvrig matrise systematisk (desktop/mobil, roller, lagring/hydrering/dvale, PDF/vedlegg). Ikke attestér utestede rader. Oppdater dette dokumentet etter hver avgrenset leveranse.

### Ikke utført / fortsatt åpent
Full beboeraksept og bestillingsutkast; ny felleseier-/fristtest; mobil og fysisk dvale; øvrige HR/KS/HMS/salg/prosjekt/ordre/FDV-reiser; all visuell videorevisjon og ny film. Ingen generell tilgangsblokkering: sandbox-økten virker. Arbeidet er påbegynt, ikke fullført.
