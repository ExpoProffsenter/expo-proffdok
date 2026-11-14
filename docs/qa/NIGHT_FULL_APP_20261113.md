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

## Kontrollpunkt 4 – avgrenset KS/HMS-QA 13.11.2026
Eier Codex. Reservert scope: uavhengig KS/HMS SJA/risikovurdering/vernerunde i innlogget sandbox og oppdatert CI-status. PR327 full CI43366094210 SUCCESS; PR326 head8ac90ade full CI43366516247 SUCCESS. Ingen omkjøring. Ingen overlapp med PR321/325/327 og ingen produksjonsendringer.

### Resultat – SJA, risiko og vernerunde
Faktisk innlogget desktopkontroll i permanent demo/sandbox, demo-konto og Firmaadmin, 1363×936. UI-handlinger ca.06:22–06:31 norsk tid (05:22–05:31 UTC). Fersk main63773814/demo3d65c0e0 og PR320/322/323/324 avstemt; alle fire PR-er merget. PR322s produksjonslogg lest. Produksjon READY dpl_5XnCpe1fmkFxcKScWvUPaJFEdD5A, demo READY dpl_Dz7jRmLnNDgD4zcokmvBPucbR1oF på de samme SHA-ene. Ingen deploy, rerun eller produksjonsendring.

| Område | Faktisk prøve | Resultat / grense |
|---|---|---|
| SJA | Nytt skjema; legg til/fjern arbeidstrinn2 og deltaker2; lukk/gjenåpne navngitt lokal kladd | Innhold beholdt. Ny SJA mens lokal kladd finnes blir avvist med konkret beskjed. Eneste trinn/deltaker kan ikke fjernes. Signering sperret uten ansvarlig. Ingen serverlagring/signatur, eksisterende2analyser urørt |
| Risikovurdering | Nytt skjema; tom Vurdering fullført | «Skriv et navn før du lagrer. Kladden er beholdt.» Ingen gyldig fullføring forsøkt |
| Risikoscore | Før5×5, etter2×2 i første lokale fare | Før25/Høy, etter4/Lav (forventet), riktig oppsummering. Teksten skiller planlagt effekt fra kontrollert effekt. Ikke en faglig risikovurdering av en faktisk jobb |
| Risiko/prosjekt | Prosjektvelger lastet5aktive tilgjengelige prosjekter; standard eksternt oppdrag | Kun liste/UI; ingen valgt kobling lagret, tilgangsgrense ikke testet |
| Vernerunde | Nytt skjema; tom Kontroll fullført | Samme konkrete navnevalidering. PDF deaktivert før serverlagring |
| Publisert kontrollmal | DEMO – Kontroll før innbygging, versjon1 | 3punkter hentes; fast malutgave synlig. Ingen publisert mal endret |
| Avvik i kontroll | Første punkt satt Avvik, øvrige Ubesvart | Ansvarlig/frist for retting vises; tydelig beskjed om at fullføring vil opprette RUH og ikke lukke saken. Fullføring ikke sendt, ingen RUH opprettet |
| Reload og gjenoppretting | Lokal kontrollkladd navngitt, lukk, full reload, naviger tilbake, Fortsett lokal kladd | Navn, malversjon1, første Avvik og øvrige Ubesvart beholdt. Full reload går til Startside; arbeidsflaten åpnes igjen via meny. Dette beviser lokal hydrering, ikke serverlagring eller dvale |
| Layout og tilbake | Sidepaneler, scrolling, lukk og verktøynavigasjon | Ingen klipping observert i de viste desktoputsnittene. Ingen målt kontrast- eller mobilattest |

Tre faktiske skjermbilder og SHA256/filstørrelser i `evidence/night-kshms-controls-20261113.json`. Ingen nye bekreftede feil i denne avgrensede runden; det betyr ikke at hele funksjonene er ferdig testet.

### Lokale kladder ved overlevering
Kun nettleserlokale syntetiske kladder ble opprettet; ingen ny serverpost. SJA: «QA 13.11 – lokal SJA-kladd, ikke utført arbeid», kun navn og opprinnelig ett trinn/en deltaker. Risiko: navnløs lokal kladd, første fare før25/etter4. Vernerunde: «QA 13.11 – lokal kontrollkladd, ikke utført kontroll», DEMO-malv1, første punkt Avvik. Ikke opprett nye duplikater. Eksisterende serverlister var2SJA,1risikovurdering og3kontroller. Kladdene er ikke signert/fullført og må aldri omtales som utført arbeid.

### CI og produksjonsbetydning
PR327 kandidat75255692802064007f2e55328fd2d5703b742e26 har nå **hele CI43366094210 SUCCESS**. Den separate hr-practice-browser-filen er fortsatt ikke kjørt som egen kommando; grønn samlet CI endrer ikke denne avgrensningen. PR326 forrige dokumentasjonshead8ac90ade har **CI43366516247 SUCCESS**. Denne runden kjører ingen ny testomkjøring og endrer ingen app-/backendkode. Ny dokumentasjonshead har egen automatisk CI og må ikke tilskrives forrige heads resultat.

PR325/327 er fortsatt reviewbare kandidater med Preview, men mangler innlogget Preview-prøve og ny eksplisitt TEST OK. Ingen av dem er produksjonsgodkjent av denne rapporten. Produksjonen er uendret.

### Gjenstående og neste kontrollpunkt
1. Fortsett fra de tre lokale KS/HMS-kladdene hvis disse reisene utvides. Serverlagring, prosjektbinding, PDF/vedlegg, fullføring, signatur, avviksoverføring og rollegrenser står åpne. Ikke gjenta bare tomnavn-/scorings-/reload-prøvene.
2. Prioriter uavhengige hull i matrisen: sjekklister, salg/prosjekt og resterende beboergrenser/ordreeksport/PDF. PR321/325/327 eier sine respektive rettelser; ikke overlapp.
3. N-UX-004 fra kontrollpunkt3 krever fortsatt selvstendig reproduksjon. Ingen kodeendring eller ny PR er laget i kontrollpunkt4.
4. Ingen film endret denne runden.15avspillinger og36sekunders delproduksjon fra tidligere kontrollpunkt gjelder; full A–Å-revisjon og øvrig sceneinnhold gjenstår. V12-materialisering401 er uavklart.
5. Mobil/touch/dvale, rollebytte og innloggede Preview-domener er fortsatt uverifisert/blokkert som tidligere beskrevet. Ikke konverter kilde/CI-bevis til faktisk innlogget UI-attest.

Eier ved avslutning: Codex, kontrollpunkt4 dokumentert; ingen aktiv koderedigering. Fullapp-QA er **ikke ferdig**. Neste kjøring fortsetter fra dette punktet. Ingen ny automasjon opprettet.

## Kontrollpunkt 5 – video og samlet overlevering 13.11.2026
Eier Codex. Scope: videre dokumentasjon/video av faktisk kontrollert KS/HMS-kladdflyt, uavhengig sjekkliste-UI hvis innlogget økt er tilgjengelig, samlet sluttrapport med åpne hull. Miljømål SANDBOX/DEMO. Ingen appkode, ingen overlapp med PR321/325/327. Fersk CI for PR326 head868f45eb er SUCCESS43372855302; PR325/327 fortsatt grønne. Main/demo og READY-deployments er uendret. Ingen rerun eller produksjonsendring.

### Konkret ny leveranse
Produsert `video-drafts/kshms-kladd-20261113/kshms-kladd-og-gjennomgang-utkast.mp4`:36sekunder,3scener,1920×1080,24fps,H.264,604301byte,uten lyd. Faktiske, uretusjerte sandboxbilder fra kontrollpunkt4; ikke fremstilt som nye opptak. Samme hvite pekerform i alle scener, statisk over opptakets opprinnelige peker, ingen simulerte klikk. Løpenummer1–3 fra renderer, norsk tekst, VTT, renderer, kilder og SHA256-manifest følger.

Full ffmpeg-dekoding PASS og alle3renderte scenebilder visuelt kontrollert: tekst innenfor rammer, ingen påstand om utført HMS-arbeid. Filmen forklarer SJA-kladd, risikoscore før/etter og gjenåpnet kontrollkladd. Den er et reviewutkast, ikke komplett HMS-veiledning eller publisert film i Hjelp. Nye rene opptak/fullflyt, mobil-lesbarhet og avstemming mot original PROFFDOK-VIDEO-1.0-mal gjenstår. Ingen kjøpt stemmetjeneste.

### Sjekklister – ny kildeinspeksjon, ikke UI-attest
Lest modulens README og de faktiske `standaloneChecklists.mjs`, `checklistSignatures.mjs`, relevante felt i `StandaloneChecklists.jsx` og `ChecklistSignatures.jsx` på main63773814. Ordrenummer/arbeidssted valideres før RPC; ny fullføring krever egen signatur. Valgfri ekstern signatur krever tegning/navn/rolle når den brukes. Endrede svar/sporingsdata nullstiller tegning. Lagring følges av egen readback med firma, bruker, ID, revisjon, svar og signaturgrunnlag; ukjent resultat skal beholde kladd/request. Malforslag kopierer definisjon, ikke kontrollsvar/signatur.

Dette er lest kode, ikke bevis på installert serverpolicy, faktisk touch-signering, PDF eller vellykket serverlagring. Ingen ny innlogget sjekklisteprøve gjennomført denne runden. Kjente browser-/mobilbegrensninger er ikke omgått. Ingen nye automatiske app-tester kjørt siden appkode er uendret og tidligere grønne kontroller gjenbrukes. N-UX-004 er fortsatt uavklart; ingen konkurrerende rettelse opprettet.

### Samlet status etter fem kontrollpunkter
| Leveranse | Faktisk oppnådd | Fortsatt åpent |
|---|---|---|
| Inventar |145registrerte reiser +6nyere tillegg, med kildehenvisninger og avgrenset UI-status | Store deler ikke fullstendig prøvd; ingen totalattest |
| Beboer38 | Syntetisk avtalev1 akseptert,2500inkl, kvittering etter reload, bestillingsutkastv1 og frist22.11 | Utløpt frist, felleseiergrenser, ordreeksport, kvitterings-PDF/FDV |
| Romvelger | PR325 f9875bd7, grønn CI43353049742, Preview READY | Innlogget Preview og ny TEST OK; ikke produksjonsmerget |
| HR-prøvesamtale | PR32775255692, red/green React-test, grønn CI43366094210, Preview READY | Innlogget Preview/TEST OK; separat browser-reload-test ikke kjørt |
| Desktop-QA | Avgrenset HR/KS-HMS/Min side og lokale SJA/risiko/kontrollkladder dokumentert med skjermbilder/PDF | Rollegrenser, komplette serverløp og øvrige moduler |
| Video |15aktive filer teknisk kontrollert og avspilt gjennom Hjelp; nå2reviewutkast à36sekunder med kilder | Full57sceners A–Å-revisjon og alt sceneinnhold; ingen ny film apppublisert |
| Miljø | Main63773814/demo3d65c0e0, begge eksakte deployments fortsatt READY; PR320/322/323/324 merget | Produksjon holdes uendret; nye rettelser trenger ny godkjenning |

PR326 head868f45eb fra forrige kontrollpunkt har grønn CI43372855302. Den nye dokumentasjons-/videokandidaten må vurderes på egen automatiske CI; ingen rerun eller manuell ny testkjøring startet. Lokale scope-/dokumentasjonsvakter og diffkontroll kjøres før publisering av dette kontrollpunktet.

### Prioritert videre arbeid og eierskap
1. Codex neste avgrensede arbeid: innlogget sjekklisteflyt med syntetisk ordrenummer, serverlagring/readback, signatur og PDF; deretter salg/prosjekt. Gjenbruk eksisterende data og dokumenter handlingene før nye skriverunder.
2. Preview325/327: sikker innlogging og relevant prøve, deretter Kenneths nye TEST OK. Ingen merge basert bare på grønn CI. PR321tekst er separat.
3. Beboer38: fortsett bare åpne grenser/eksporter. Ikke opprett ny avtale eller nytt bestillingsutkast av allerede fullførte prøver. Ingen ordre/e-post sendes.
4. Video:36sekunders fristutkast og36sekunders KS/HMS-utkast kan vurderes som delmateriale. Full A–Å må fortsatt produseres fra revisjonsplanen; V12-kildenedlasting ga401. Denne tilgangen stopper ikke andre moduler.
5. Fysisk mobil/touch/dvale og egne ansatt-/leder-/portalroller krever faktisk prøving. Desktop og kildekode er ikke erstatning. Matrisen skal fortsatt vise hull.

Denne rapporten avslutter den dokumenterte nattbatchen, ikke hele QA-oppdraget. Ingen påstand om full appdekning, ingen produksjonsendringer, ingen nye reelle meldinger eller automasjoner. Arbeidsbranch er PR326; ingen aktiv appkoderedigering overlates.


## Kontrollpunkt 6 – oppfølging etter nattkjøringen 13.11.2026

Nattbatchen var utført, men rapporten lå i en annen samtale. Brukeren fikk direkte lenke til rapport/PR326 og avgrensningene. Eksisterende automasjon er avsluttet/deaktivert; ingen duplikat er opprettet. Dette kontrollpunktet er interaktiv videreføring, ikke en ny nattkjøring.

### Kandidater og innlogget Preview

- PR325, f9875bd742ba40319fd08396b1f5628b5f3e37ae: innlogget med sandboxkonto i fast branch-Preview. Bolig38 → Beboerportal → Valgmuligheter → slå av Bruk boligens lagrede valg viste Velg rom eller pakke og deaktivert Legg til. Velg Bad1 aktiverte knappen. Av/på/av av lagrede valg bevarte eksplisitt valgt rom. Eksisterende standardalternativ0kr/2linjer og speilalternativ2500kr/3linjer var bevart. Ingen nytt alternativ lagret, ingen portalfornyelse eller utsending. Mobil og bytte mellom arbeidsområder ikke attestert i denne prøven. Skjermbevis: evidence/pr325-room-selection.jpg. Ny TEST OK før merge gjenstår.
- PR327, 75255692802064007f2e55328fd2d5703b742e26: innlogget sandbox-Preview. Fire lokale øvingstrinn med eksempeltekst, fullført utgave4. Full reload og Min side → Mine oppfølginger åpnet lagret fullført utgave med avkrysset/låst gjennomgang. Rediger som ny utgave nullstilte gjennomgang og sperret fullføring/PDF før lagring. Ufullført utgave5 lagret; historisk utgave4 fortsatt avkrysset, ufullført utgave3 tom/låst. PDF utgave4 lastet ned og begge sider visuelt kontrollert: riktig fullførtstatus, eksempelmerking og innhold, ingen klipping; side2 har mye ledig plass. Kun lokalt prøveinnhold, ingen server-HR eller mottakere. Skjermbevis: evidence/pr327-completed-reopened.jpg. Ny TEST OK før merge gjenstår.

### Sjekklister – faktisk UI og PDF

På PR325-Preview med sandboxdata åpnet eksisterende TEST – signert utførelsessjekkliste, ordre TEST-SIGN-20261031-01. Fullført kontroll var skrivebeskyttet; lagret egen og ekstern prøvesignatur ble vist. Ny PDF lastet ned, begge sider rendret/kontrollert: firma/logo, ordre/adresse, svar, kontroll-ID/revisjon og begge signaturbilder til stede. Ingen utsending, ingen endring av historisk kontroll.

Startet lokal kladd fra DEMO – Kontroll før innbygging. Tom Fullfør ble korrekt avvist før transport, men feilen Fyll inn ordrenummer lå over skjermens synlige område; fokus ble på knappen. **N-UX-005 (middels): avvist lagring/fullføring ser ut som ingen respons.** Skjermbevis: evidence/checklist-hidden-validation-before.jpg.

Syntetisk lokal kladd QA-UX-20261113, QA – Fiktiv testadresse13, ingen reell kontroll og én kommentar ble bevart ved lukking/gjenåpning. Ingen serverlagring eller fullføring av den nye kontrollen, ingen signering på vegne av en reell person. Ny signaturtegning/touch og komplett ny serverlagring/readback gjenstår.

### Prosjekt – avgrenset kontroll

Åpnet eksisterende DEMO – RESERVE – Ferdig våtrom med garanti. Riktig skrivebeskyttet prosjekt og oversikt, Sjekklister åpnet høyre sidepanel. Ti grupper med registrert dokumentasjon vises, egne kontroller omtales uten å påstå fullført kontrollhistorikk. Skjermbevis: evidence/project-checklist-panel.jpg. Åpning av underdokumentasjon ga gjentatte Input.dispatchMouseEvent-tidsavbrudd og ingen observert overgang; ikke attestert. Ingen prosjektdata endret. Dette beviser ikke komplett prosjektflyt.

### Avgrenset rettelse av N-UX-005

PR328, fix/checklist-validation-focus-20261113, kandidat acaf74692bc5211303f9adec93fc1172f71b1d0d, tre7416b271643ff90353c73d37ed4b1ef97c21e176. Miljømål BEGGE, ren main63773814 som base. Bare StandaloneChecklists, tilhørende React-/browserprøver og endringsgrunnlag. Feilmeldingen får fokus og rulles inn etter avvist lagringsforsøk, inkludert gjentatt samme feil og signaturfeil. Ingen endring av krav, RPC, tilgang, signaturgrunnlag, data, PDF eller e-post.

Faktisk komponentprøve feiler på gammel kode (validation must receive focus), består på kandidat: ordre/arbeidssted/definisjon/svar/signatur, gjentakelse, ingen ugyldig RPC-skriving, bakgrunnsoppdatering uten fokusstjeling og lokal kladd. Prøven kjøres permanent fra eksisterende browserpakke. Browserkrav er lagt til for fokus og synlighet ved390/1363px. Full npm build/critical, scope-/dokumentasjonsvakt og diffkontroll PASS. Lokal Chromium manglet; nedlasting returnerte ugyldig ZIP. Ingen lokal browser-layoutattest, ingen svekket sjekk eller CI-rerun.

Ny branchspesifikk EXPO_BACKEND_TARGET=sandbox ble satt før appcommit. Preview dpl_8BCnLJYKXapv1ysVHie11RCNyXnM er READY på eksakt kandidat; CI43455685924 var i arbeid ved kontrollpunktet. Innlogget Preview-prøve og TEST OK gjenstår. PR-beskrivelsen er varig fasit for etterfølgende CI-status.

### Åpent videre

Ingen ny produksjonsmerge, migrasjon, Edge-installering, utsending, demoreset eller branchsletting. Supportrettelsene er fortsatt del av main63773814. PR321 holdes separat. PR325/327 er nå innlogget testet; PR328 krever full CI/Preview. Matrisens øvrige hull står ved lag: felleseiergrenser/utløpte frister/ordreeksport, komplette rolle- og serverløp, fysisk mobil/dvale og full57sceners videorevisjon. Ingen ny film produsert/publisert i dette kontrollpunktet.
