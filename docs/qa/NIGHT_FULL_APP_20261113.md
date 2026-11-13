# Natt-QA 13.11.2026

## Eierskap og kontrollpunkt
Eier: Codex nattarbeid, kontrollpunkt2 fullført 13.11.2026. Arbeidsbranch `qa/night-review-20261113`. Ingen andre åpne natt-QA-PR-er funnet; PR321 teksthjelp holdes separat. Oppdater dette dokumentet før neste kjøring fortsetter. Ikke gjenta allerede dokumenterte tester uten endret grunnlag.

Baseline main `6377381476ad3ee8d6d6364dc5872a0b019da029`, demo `3d65c0e022ed11ec73aa569f79bfe6f362d30fae`. PR322/320/323/324 lest; alle merget. PR322s produksjonslogg er gjeldende, eldre CURRENT_RELEASE_STATUS/README er historikk. Ingen migrasjoner, Edge eller gammel kø skal kjøres på nytt.

Miljømål BEGGE for apprettelser; syntetisk data kun sandbox. Ingen produksjonsmerge uten ny TEST OK. Ingen e-post, reell ordre eller reell avtale.

## Reservert arbeid denne kjøringen
1. Inventar fra faktiske moduler, navigasjon, hjelp og videokatalog.
2. Undersøk BoligPortalManager: vist første rom mot draft.scope_id=common. Scope ved eventuell rettelse: kun romvalg i denne komponenten, relevant regresjonstest og endringsgrunnlag.
3. Tilgjengelig sandbox-UI og bolig38; identifiser tilgangsbegrensninger uten å blokkere uavhengige kontroller.
4. Videoscene-/ressursinventar. Ingen påstand om ferdig revidert film uten avspilling og visuell QA.

## Status
Kontrollpunkt 2 fullført 13.11.2026 kl. 04:38 norsk tid. Hele appen er fortsatt ikke ferdig kvalitetssikret. Nyeste kontrollpunkt nedenfor erstatter eldre «gjenstår»-status for de samme testene. PR325 er eneste apprettelse; PR326 inneholder kontrollgrunnlag og videoutkast.

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

## Kontrollpunkt 2 – utført 13.11.2026
Eier: Codex nattarbeid. Arbeidsbranch `qa/night-review-20261113`, PR326. Main/demo uendret. Åpne PR321/325/326 kontrollert; ingen overlappende appendring. Første kontrollpunkts ferdige filtester ble ikke kjørt om igjen.

### Faktisk innlogget sandbox og beboerflate
Eksisterende demoøkt, Expo Proffsenter, samme Orvei-root og bolig38. Desktop viewport 1348 × 926. Dette er UI-bevis, ikke kildebasert antakelse:

| Kontroll | Resultat / lagret tilstand |
|---|---|
| Eksisterende avtaleutgave1 | Gjenbrukt; ingen duplikat. Opprett beboerlenke → Venter på beboer. Pauset e-posttransport synlig; Send beboerlenke deaktivert. Ingen sending. |
| Beboerens pris og varer | Riktig prosjekt/ByggB/38, 2500 inkl. mva., grunnpakke inkludert og 3 syntetiske varelinjer i Bad1. |
| Tomt svar | Navn er påkrevd. Kontroller svaret uten navn blir stoppet av nettleservalidering. Nettleseren viste engelsk standardtekst; ikke klassifisert som norsk apptekstfeil. |
| Syntetisk aksept | «QA Beboer 38 – syntetisk sandbox» → kontrollside → Registrer aksept. Kvittering 13.11 kl.04:21, utgave1. Tydelig testbeskrivelse; ingen reell avtale. |
| Reload / retur | Beboerkvitteringen består reload. Prosjektleder viste først gammel status i allerede åpent panel; ved lukking og gjenåpning ble Akseptert hentet. Ingen automatisk umiddelbar kryssfaneoppdatering attestert. |
| Bestillingsutkast | Versjon1 lagret, 3 av 3 linjer, 0 utelatt. «Ingen bestilling er sendt». Egen fiktiv leveringsadresse kun for bolig38 lagret. Leverandør-/sendeskjerm åpnet og lukket uten ordre-/sendebekreftelse. |
| Felleseiere | Bolig24 lest: Test Eier Æ + Test Eier Ø. Ingen kontakt-/tilgangsendring. Bolig38 har bare eksisterende hovedkontakt. Felleslenke-/tilbakekallingsgrenser er ikke end-to-end-testet. |
| Faktiske bestillingsfrister | Før: ByggA 21.11, bolig38 «Ikke satt». Bare bolig38 fikk testfrist 22.11.2026. Gjenåpnet oversikt bekrefter lagring; øvrige ByggB fortsatt uten frist, ByggA fortsatt21.11. |
| Skille mellom frister | Avtaleutgave1 fortsatt Akseptert med svarfrist13.12.2026 kl.23:59 norsk tid etter fristendringen. Ingen avtalesvarfrist endret. Portalens tilgangsutløp er en tredje, separat verdi. |

Bevis: `evidence/night-bolig38-accepted-20261113.jpg`, `evidence/night-bolig38-order-draft-20261113.jpg`, `evidence/night-bolig38-deadline-20261113.jpg` og videokildene. Ingen token i repo. Datofeltet fungerte med vanlig tastatur; verktøyets direkte fill oppdaterte først DOM uten React-state, og ble derfor ikke brukt til lagring. Dette er ikke attestert som appfeil.

### PR325: grønn CI og avgrenset Preview
- Full CI [43353049742](https://github.com/ExpoProffsenter/expo-proffdok/actions/runs/43353049742) **success** for uendret commit `f9875bd742ba40319fd08396b1f5628b5f3e37ae`. Ingen Actions-rerun.
- Opprinnelig Preview manglet branchspesifikk sandboxbinding. Vercel-metadata og `environmentBindingCore.mjs` viste produksjon som standard. Ingen skrivetest ble gjort der.
- Bare `fix/bolig-portal-scope-selection-20261113` fikk `EXPO_BACKEND_TARGET=sandbox`, target preview. Samme commit redeployet én gang. Production/default-variabler og demo er uendret.
- Ny Preview **READY**, `dpl_4xfdrXA4X9xAoa5fwLPeU5QAW89S`, samme faste adresse: https://expo-proffdok-git-fix-bolig-portal-scope-select-8ccd40-ringside.vercel.app . Vite-bindingen velger sandbox `ppvircenkjizeiqdxphj` og blokkerer feil bundlebinding. READY er build-/konfigurasjonsbevis; nettverksbinding etter innlogging er ikke observert.
- Faktisk Preview åpner innloggingsskjermen; demoøkten deles ikke automatisk med dette domenet. Ingen legitimasjon lest/kopiert og ingen innlogging omgått. **Innlogget Preview-prøve gjenstår.** Ny TEST OK mangler; ingen merge.

### Hjelp og faktisk filmproduksjon
Alle15filmer åpnet fra innlogget Hjelp som Systemadministrator. Native Spill av via tastatur og hopp til siste kapittel gjennomført; alle viste currentTime >0, paused=false, readyState=4 og ingen mediafeil. Retur til Hjelp virket. Dette er avspillings-/kapittelbevis, ikke gjennomgang av hver scene eller alle roller. Se `evidence/night-help-playback-20261113.json` og kontaktarket.

Produsert **36-sekunders videoutkast,3scener**, med ferske sandboxbilder: «Bestillingsfrist og avtalesvar». MP4,H.264,1920×1080,24fps,ingen lyd,636137byte. Samme tegnede peker i alle scener, løpenumre fra renderer, ingen simulerte klikkringer. Full ffmpeg-dekoding og visuell kontroll av tre frames fra ferdig film PASS. Kilder, renderer, VTT, manifest og MP4 i `video-drafts/frist-20261113/`. Dette er en konkret delproduksjon; ikke ferdig A–Å eller publisert i appens Hjelp. Godkjent originalrenderer/mal må fortsatt sammenlignes før publisering.

### Begrensninger og åpne funn
- **V12-kilder:** korrekt redigerbar ZIP funnet, men autorisert materialisering feilet med HTTP401. Ingen kildepakke lastet ned og ingen eldre bilder framstilt som nye. Ny delproduksjon bruker bare egne ferske sandboxbilder.
- **Mobil:** nettleseradministrasjonen blokkerer DevTools/device-emulering. Ingen omgåelse. Innlogget mobil/touch/dvale er ikke testet; CI-browserbredder er ikke det samme.
- **N-UX-002, lav / undersøk:** prosjektlederens åpne avtalepanel viste Venter på beboer etter ekstern aksept til panelet ble gjenåpnet. Datagrunnlaget er korrekt ved ny henting. Avklar forventet fokus-refresh før eventuell avgrenset rettelse; ingen kjernerefresh endret her.
- **N-VIDEO-001, middels:** A–Å har fortsatt57scener og innebygde gamle kapittelnumre (siste kapittel «18 · Hent sluttpakken»). Eksisterende revisjonsplan gjelder. Avspilling er god, men innhold/rekkefølge/pekere er ikke ferdig revidert.
- Øvrig fullapp-matrise, fysisk mobil, rollebytte/tilbaketrekking, offline/dvale, PDF-utskrift av kvittering, utløpt frist, fellesportalgrenser, ordreeksporter og FDV er fortsatt åpne. Ingen nye backend-/appfiler endret i denne kjøringen.

### Neste kjøring – fortsett her
1. Les dette kontrollpunktet og fersk main/demo/PR-status. PR325 eier romvelgeren; PR321 eier teksthjelp. Ikke dupliser rettelser.
2. PR325 har grønn CI og sandbox-Preview. Gjør innlogget prøve når sikker innlogging er tilgjengelig: bolig38 → Beboerportal → Valgmuligheter → slå av Bruk boligens lagrede valg. Forvent «Velg rom eller pakke» og sperret Legg til; velg Bad1 eksplisitt og kontroller at knappen aktiveres. Ingen nytt alternativ må lagres for denne testen. Deretter ny eksplisitt TEST OK før produksjonsmerge.
3. Bolig38: avtaleutgave1 er allerede akseptert, bestillingsutkastv1 lagret, egen syntetisk adresse og bestillingsfrist22.11. Ikke opprett duplikater eller send. Fortsett utløpt-frist/felleseiergrense/ordreeksport og kvitterings-PDF når teknisk tilgjengelig.
4. Gjenbruk ferdig avspillingsaudit av15filmer. Fortsett innholdsrevisjon og øvrige57A–Å-scener; integrer/tilpass36sekunders utkastet først etter mal-/innholdsvurdering. V12-materialisering har401-blokkering.
5. Gå videre til uavhengige matrisedomener (salg/prosjekt/HR/KS/HMS) i eksisterende sandbox. Ikke la Preview-innlogging eller V12 stoppe annet arbeid. Ingen fullapp-attest før bevis foreligger.

## Kontrollpunkt 3 – gjennomført avgrenset desktop-QA
Eier Codex nattarbeid13.11 kl05:19. Reservert scope: uavhengig desktopkontroll av HR/KS-HMS/Min side og dokumentasjon. Ingen overlapp med PR321/325, ingen produksjonsendringer. Ferdig beboeraksept og15filmers avspilling gjentas ikke.

### Kontrollpunkt 3 – reservert rettelse N-UX-003
Faktisk sandbox-repro: lokal HR-prøvesamtale fullført utgave4, PDF viser fullført; etter reload viser låst gjennomgått-checkbox tom. Eier Codex. Isolert branch `fix/hr-practice-completed-state-20261113` fra main. Miljømål SANDBOX/DEMO (eksisterende produksjonsgate beholdes). Scope: HrPracticeConversation.jsx, eksisterende HR-prøvetester og ett endringsgrunnlag. Ingen ordinære HR-samtaler, backend, tilgang, e-post eller navigasjonskjerne endres.

### Resultat og bevis – HR, KS/HMS og Min side
Gjennomført i innlogget permanent demo, samme demo-SHA3d65c0e0 og sandbox ppvircenkjizeiqdxphj. Bruker demo-konto, Expo Proffsenter; modulene viser Firmaadmin, personlig håndbok viser Ansatt. Desktop1363×936. Dette er ikke en selvstendig test med ordinær ansattkonto. Ingen produksjonsdata, e-post, reelle avtaler/ordre eller tilgang endret. Den eneste nye lagringen i UI er ett lokalt, syntetisk prøvereferat med appens egne eksempeltekster, fire utgaver, i denne nettleseren.

| Område | Faktisk innlogget kontroll | Resultat og avgrensning |
|---|---|---|
| HR-register | 2 syntetiske oppføringer; søk uten treff; tøm søk; funksjonsoversikt og tilbake | PASS for disse handlingene; medarbeiderprofil/tilgang ikke endret |
| Samtalemaler | 3 lagrede maler; Lag egen mal; fjern navn; Lagre mal; Forkast endringer | Tomt navn avvist. Ingen gyldig mal lagret. Feilteksten var fortsatt synlig etter forkasting til listen; lavt prioritert kandidat N-UX-004, ikke fullreprodusert eller rettet |
| Sykefraværsoppsett | Generell veiledning; regneeksempel full/gradert | Gradert valg oppdaterer møteteksten. Ingen personlig fraværssak eller rettslig innholdskontroll |
| HR-oppsett | Lagrede felt og kontrollfrist23.10 vist | Kun lesing; ingen ny grunnlagsvurdering/aktivering |
| Slettekvitteringer | Åpne, tom liste, tilbake | Forståelig tom tilstand; slettemotor ikke testet |
| Frister/tiltak | 7 åpne; passerte og framtidige datoer; e-postpausen forklart | Lesing og navigasjon PASS; ingen tiltak lukket |
| KS/HMS Daglig arbeid | 2 kontroller, 10 rutiner til gjennomgang | Laster i riktig firma; andre roller og kontroller ikke gjennomført |
| Rutiner/håndbok | 73 rutiner, 10 godkjente; søk uten treff; Tøm søk | Forståelig tomtilstand og gjenopprettet liste. Ingen rutine/publisering endret |
| Forvaltning | 5 kildeforslag, 4 medarbeidere/40 bekreftelser, kontrollfrist | Lesing PASS; ingen revisjon eller godkjenning |
| Avvik/RUH | 1 åpen/7 lukkede; tom Registrer RUH → Lagre | 4 konkrete mangler; feillenke flytter fokus til Kort tittel. Lukk returnerer fokus til Registrer RUH. Ingen sak opprettet |
| Min side | I dag og alle6underfaner | Lasting overgår til innhold. Full reload går til Startside; Min side åpnet manuelt igjen |
| Mine planer | Begge kilder listet; prosjektplan åpnet | Kun visning, 4 egne oppgaver. Lukk returnerer fokus til samme plan. Andre plandetaljer/bemanning/eksport ikke prøvd |
| Boligoppgaver/tilstedeværelse | 476 åpne oppgaver og innregistreringskort | Bare visning. Ingen inn/utregistrering |
| Personlig håndbok | 10 tildelte utgaver | Ingen bekreftelser sendt. Egen rollepresentasjon er ikke bevis på backend-rolleskille |
| Profil | Kontaktfelter lastet; Lagre deaktivert uten endring | Ingen kontakt/e-post/pårørende endret; underseksjoner ikke åpnet |
| Mine timer | Uke09.–15.11, 0timer; Ny registrering; tom lagring; Avbryt | Nettleserens validering stopper på påkrevd prosjekt, Avbryt returnerer fokus. Ingen timer/uke sendt; andre kategorier/godkjenning/eksport ikke testet |
| Lokal HR-prøvesamtale | Eksempeltekster → Forberedelse → Samtale → Tiltak → Referat → egen prøvebekreftelse | Fire lokale utgaver; fullført utgave4. Ingen annen person bekreftet og ingen ordinær HR-samtale opprettet |
| Prøvereferat-PDF | Faktisk nedlasting fra UI;2A4-sider; tekstuttrekk og begge sider rendret/visuelt sett | Fullført utgave4, eksempelmerking, fire svar/notatpar,2tiltak, oppsummering og avgrensning. Ingen klipping observert; side2 har bare avslutningsblokk og mye tomrom |
| Reload av prøvereferat | Full reload, Min side/Mine oppfølginger | Lokal utgave4 og innhold gjenåpnes korrekt. Bekreftelsesboks tom/låst: N-UX-003 |

Skjermbevis og PDF: `docs/qa/evidence/night-hr-kshms-personal-20261113.json` inneholder filstørrelser og SHA256. HR-fristpanel, RUH-validering, personlig prosjektplan, prøvereferat før/etter reload og faktisk PDF ligger ved. Ingen hemmelig portaladresse eller innloggingsdata er tatt med. Profilens kontaktopplysninger er ikke lagret i bevis.

### N-UX-003 – lav alvorlighet, rettelse PR327
Feilen gjelder lokal Sandbox-prøvesamtale: fullført lagret utgave viste tom, deaktivert gjennomgått-boks ved gjenåpning. Ingen tap av referat/status; PDF viste korrekt fullført. Rotårsak: `select()` nullstiller den midlertidige bekreftelsen også i lesemodus, og checkboxen viste denne i stedet for lagret stage.

[PR327](https://github.com/ExpoProffsenter/expo-proffdok/pull/327), kandidat `75255692802064007f2e55328fd2d5703b742e26`, branch `fix/hr-practice-completed-state-20261113` fra ren main. Låst visning bruker lagret completed-status; redigerbar ny utgave krever fortsatt ny bekreftelse. Scope er4filer: prøvekomponent, to eksisterende testscripts, endringsgrunnlag. Ingen navigasjonskjerne, ordinær HR, backend eller lagringsformat endret.

Verifisering: ny faktisk React-assertion rød på gammel kode og grønn etter rettelse. HR React sandbox/production, modelltester, full lokal npm build/critical, scope- og dokumentasjonsvakt PASS. Production-target viser fortsatt ingen prøve-UI/lokale skrivinger. Eksisterende Chromium-script utvidet for faktisk reload; ikke kjørt lokalt grunnet kjent socket-begrensning. Ingen tester svekket. CI inkluderer HR React; den separate HR-practice-browser-filen er ikke en av dagens CI-kommandoer, så dens nye reload-assertion er ikke attestert kjørt.

Preview READY: `dpl_2ED6QcBov3MC758fSgRFeAZ5hkSx`, eksakt kandidat. [Fast Preview](https://expo-proffdok-git-fix-hr-practice-completed-sta-0fad0b-ringside.vercel.app/?progressTest=safe) åpner innloggingsskjermen. Ny branch har egen `EXPO_BACKEND_TARGET=sandbox`; ingen default/production/demo-variabel endret. Første env-oppretting avvist fordi branch ikke eksisterte; etter branchoppretting lyktes samme avgrensede innstilling. Ingen hemmelige verdier lest. Innlogget Preview-prøve gjenstår fordi domenet mangler sikker innlogget økt. Ingen credential/session kopiert og ingen ny konto opprettet.

[CI43366094210](https://github.com/ExpoProffsenter/expo-proffdok/actions/runs/43366094210) kjører; build, HR React, company-db og scope var grønne ved kontroll. Endelig status føres i PR327. Ingen TEST OK eller merge. PR325 og321 beholdes separate.

### Ikke undersøkt / ikke fullført
18 matriserader er oppdatert med avgrenset ny UI-dekning, ikke stemplet fullført. Mobil/touch/dvale, ordinære HR-roller, gyldig serverlagring i disse modulene, særskilt sykefraværstilgang, godkjenning/signatur, vedlegg, timer/utleggseksport, håndbokpublisering og hele appens øvrige reiser står åpne. Teknisk CI er ikke bevis på innlogget produksjonsflyt. Denne kjøringen endret ingen film; tidligere36sekunders utkast og15avspillingskontroller gjenbrukes. Full A–Å-revisjon gjenstår.

### Neste kjøring – kontrollpunkt3
1. Hent fersk main/demo og PR321/325/326/327. PR327 eier den lokale prøvesamtalens gjennomgått-visning; ikke lag konkurrerende rettelse. Kontroller endelig CI43366094210 før videre vurdering. Ingen merge uten relevant Preview-prøve og ny TEST OK.
2. Ikke gjenta ferdig register-/rutinesøk, tom RUH eller den lokale prøvesamtalens fire steg/PDF. Prøven ligger som én lokal samtale utgave4 i eksisterende demofane. Full app-QA er åpen.
3. Fortsett uavhengige hull: SJA/risikovurdering/vernerunde, sjekklister/signatur, ordinære HR-saker med syntetisk konto/rolle eller salg/prosjekt. Bruk eksisterende sandbox-data; ingen reell utsending/ordre.
4. Undersøk N-UX-004 avgrenset: HR → Samtalemaler → Lag egen mal → tomt Malnavn → Lagre → Forkast endringer. Mulig foreldreløs valideringsfeil i listen. Ikke bland med PR327.
5. Beboer38 er allerede akseptert/bestillingsutkast/frister lagret fra kontrollpunkt2. Fortsett bare gjenstående utløpt-frist/felleseiergrense/ordreeksport/PDF når mulig. Filmrevisjon fortsetter fra eksisterende A–Å-plan og36sekunders utkast.

Eierskap ved avslutning: denne avgrensede UI-runden og PR327-kodearbeidet er ferdig dokumentert; ingen aktiv lokal redigering overlates. Fullapp-oppdraget fortsetter fra dette kontrollpunktet. Ingen ny automasjon opprettet, ingen produksjonssetting utført.
