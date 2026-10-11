## HR, firmanavn, felleskart og PDF – godkjent synk 11. oktober 2026

Miljømål SANDBOX/DEMO for kursinnholdet; godkjent appkode fra #222 er synkronisert kun main → demo. Gjeldende main-baseline er `ce3f4d0f23e56e8e2ec283ac8d02aca2f8d193e1`, etter Production READY og dokumentasjonsrelease #223. Ordinær HR-/kart-/main-kode matcher main. Eksisterende demo-overlegg, medier, Sales, prosjektdata og historikk er bevart.

Ny Sandbox-only migrasjon `demo_sick_leave_course` legger til én fiktiv sykefraværsplan hos eksisterende demo.ansatt2 med demobrukeren som leder. Delte innspill, møtekladd, ett åpent tiltak og beregnede frister. Ingen persondiagnose, bekreftelse, fullført oppfølging eller NAV-/sykmelderdeling seedes. Eksisterende sykefraværssak og brukerutfylt kontakt-/samtaleinnhold beholdes. Idempotent snapshot `sick-leave-course-v1`; egne kurs-/resetkontroller. Alle tre mailtransporter forblir AV.

Faktisk Sandbox-preflight: 19 eksisterende infrastrukturpunkter + fem kurspunkter grønne. Gamle fire kurspunkter og nytt sykefraværspunkt kommer fra samme tilgangskontrollerte kurs-RPC. Kontrollsidens gamle tre-punktskrav er rettet til den nye fem-punktskontrakten. Faktisk kontrollfunksjon er prøvd med riktig payload og avviser gammel/uventet kontrakt, mailfeil, backendfeil, gammel main-baseline, manglende lokal skisse og offline-RPC. Lokal skisse og innlogget klient må fortsatt kontrolleres i kursoperatørens nettleser; dette er ikke attestert som ny innlogget prøve.

Full Sandbox critical/build PASS. Eksisterende kurs-rollback-QA PASS: ordinær SJA-signering/fullføring, reset beholder uforanderlig historikk, revokasjon/karantene/mail stopper kurset. Ny sykefraværs-rollback-QA PASS: leder/medarbeidertilgang, fire milepæloppgaver, ubekreftet plan, ingen delingsregistreringer, aktiv fristmail stopper preflight, feil leder avvises og kursreset bevarer alle personlige sykefraværssaker. Bare `demo_kshms_hr_course_preflight` endres i Sandbox; alle øvrige funksjoner, policies, triggere, profiler, medlemskap, modulrettigheter og beskyttede worker-innstillinger er identiske før/etter.

Fersk tre-siders sykefraværs-PDF er generert fra den autoriserte, lagrede Sandbox-utgaven og visuelt kontrollert på alle sider. Ingen gammel PDF brukes som bevis. Ingen testmail er sendt. Endelig demo-commit, READY-deployment og HTTP-/assetkontroll føres i PR #222 etter oppdatering av demo-ref. Fast host: https://expo-proffdok-git-demo-ringside.vercel.app . Produksjonens endelige docs-release: `dpl_H5egSh65ssneoQWYM3NWTCYvzxdx` READY på siste main; godkjent appkode uendret fra #222.

## Sluttført HR-release og demo-synk – 11. oktober 2026

Kenneth TEST OK kl. 17:10 Europe/Oslo gjelder #220 og skal ikke gjentas. Production funksjonsmerge 6b557c71f97cfecd7114b61883c964a3aaa88c25 READY, dokumentasjons-main 61a42e6c7d996a6abc6c5146de45e3759e682b4d etter grønn #221 Core Safety 38151822834/114506673049. Demo synkretning kun main → demo; appfunksjonene matcher godkjent kilde. Demoens main-baseline er nøyaktig 61a42e6c7d996a6abc6c5146de45e3759e682b4d.

Sandbox-migrasjon demo_hr_conversation_course er installert: bevisst ny kontrakt med åpen samtaleport, men både KS/HMS- og HR-varselmail AV og ingen HR-filer. Syntetisk demo.ansatt2@expo-proffdok.invalid har dedikert demo@expo-proffdok.no som leder; eksempelet er delt og har lagret møtekladd uten bekreftelser. Vanlige RPC-er er brukt. Eksisterende brukerutfylt kontaktpost er ikke overskrevet. Et første seedforsøk på demo.ansatt1 ble avvist av eksisterende ledersirkel-guard og rullet tilbake; guarden er uendret.

19 eksisterende demo-preflight + 4 HR/KS-kurskontroller PASS. Samlet Sandbox critical/build PASS, faktisk samtale-React 38 assertions PASS. Kursens rollback-QA bevarer signert/fullført historikk og avviser aktiv KS-mail, aktiv HR-mail, restore-karantene, tilbakekalt syntetisk medarbeider og feil eksempel-leder. Ingen ekte signering eller fullføring er seedet. Kursreset bevarer personlig samtalehistorikk; arbeidsutkast for KS/HMS resettes som før. Publiserings-SHA, READY-deploy og innlogget sluttkontroll føres i #220 etter kontrollert oppdatering av demo-ref.

Production er kontrollert innlogget. Ringsides register ble etter åpningen observert aktivt med medarbeidere; agenten har ikke fylt ut virkelige personalposter eller bestemt behandlingsgrunnlag. Den autoriserte Kenneth-testmailen er akseptert av Resend. Ingen ny betalt Supabase-ressurs. #217 ekstern ledger er fortsatt separat draft.

# HR og navigasjon – godkjent release 11. oktober 2026

Kenneth ga «test ok» 11. oktober 2026 kl. 14:17 Europe/Oslo. Dette godkjenner popup-/navigasjonsrettelsene i PR #219 og Sandbox-prøvesamtalen i PR #218. Eldre «draft», «ingen merge» og «TEST OK gjenstår» i daterte arbeidsnotater er historikk.

PR #219 er merget som `2a2d16d29f5749c1d36724db5ac5be80c0822d35`; PR #218 som `f6a74d828fb4c0110b4eae8c6e453d2a55ee9038`. Production er READY på sistnevnte SHA, deployment `dpl_4HRLSUAtink1hC3AhPAJ4K3p8rjr`, på https://expo-proffdok.app. Anonym HTTP-/assetkontroll bekrefter riktig Production-backend og publisert HR-popupkode.

Begge obligatoriske CI-kontroller etter ready-for-review er grønne: runs `38138777739` og `38139167429`. Samlet kildekode er kontrollert med bygg, faktisk React/access-hook-regresjon, Chromium på desktop/mobilbredder og eksisterende PDF-/samtidighetskontroll. Production-gate for prøvesamtalen er kontrollert separat.

Demo synkroniseres kun main → demo med denne main-committen som kodebaseline. Eksisterende demo-overlegg, medier, kursdata og backend beholdes. Overleggets baselinekonstant oppdateres; ingen seed, reset, migrasjon eller databaserad endres i denne releasen. Full Sandbox-bygg og beskyttet overleggskontroll er grønne. Read-only aggregatkontroll av de 22 eksisterende data-/infrastrukturpunktene er 22/22 grønn, inkludert kursinnhold og stengt personlig HR. Dette er ikke en ny attestasjon av innlogget klient-preflight eller autorisasjonstesting.

Den faste demo-adressen er https://expo-proffdok-git-demo-ringside.vercel.app. Endelig demo-commit og deployment registreres i PR-ene etter publisering. Innlogget nettleserautomatisering er fortsatt stoppet av tidligere credential-beskyttelse; ingen innlogging omgås. Brukerens TEST OK er den manuelle vurderingen av den aktuelle arbeidsflyten. Personlig HR forblir stengt (`content_enabled=false`, `restore_quarantined=true`).
