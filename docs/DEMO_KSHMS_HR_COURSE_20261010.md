# HR og KS/HMS – fiktivt kursoppsett 10. oktober 2026

Miljømål: **SANDBOX/DEMO**. Main → demo fra verifisert Production-commit `c3d873e0e5bd2677f0205143de6edc1fbd95ae4c`. Ingen demoendringer skal merges tilbake til main.

## Kurset

Åpne `/demo-course.html` for trinnvis veiledning. Bruk dedikert demobruker, firma **Expo Proffsenter** og HOVED-prosjektet. På `/demo-control.html`: installer lokal demoskisse hvis nødvendig, tilbakestill relevante kursutkast og kjør preflight før visning.

| Fane | Lagret fiktivt innhold | Kursoppgave |
| --- | --- | --- |
| HR → Samtalemaler | Medarbeidersamtale, prøvetid og sykefraværsoppfølging, alle merket DEMO | Tilpass spørsmål, lagre og sammenlign historiske utgaver |
| KS/HMS → SJA | DEMO – Bytte rør og sanitær på HOVED, utkast med tre arbeidstrinn | Tilpass fare/tiltak/ansvar, lagre og vis utkast-PDF |
| Vernerunder/kontroller | DEMO – Vernerunde før oppstart, tre ubesvarte punkter | Dokumenter svar, ansvar og frist |
| Risikovurdering | DEMO – Risiko ved demontering og transport | Vurder planlagte tiltak og videre oppfølging |
| Sjekklistesentral | DEMO – Kontroll før innbygging, publisert generisk firmamal | Start en ny kontroll fra firmamalen |
| Avvik/RUH | DEMO – RUH: utstyr i rømningsvei, åpen | Vis oppfølging og krav før lukking |

Personlige HR-svar, kontaktdata, individuelle samtaler, filer og sykefraværssaker åpnes ikke. `content_enabled=false`, `restore_quarantined=true`. Ingen sykdom eller diagnose er seedet. SJA og kontroller er utkast; gjennomgang/signering/fullføring er ikke forhåndsattestert. Sandbox mail-worker er fortsatt avslått.

## Repeterbart oppsett

`scripts/demo/kshms-hr-course-seed.sql` er idempotent og skal kun brukes i dedikert Sandbox. Faktisk demobruker/firma/HOVED finnes fra eksisterende data og valideres. Eksemplene opprettes gjennom ordinære HR-/KS/HMS-RPC-er med vanlige tilgangs- og revisjonskontroller. Resetgrunnlaget lagres i egen `people-course-v1`-nøkkel. Ingen eksisterende rutiner eller brukertester slettes.

**Tilbakestill kurseksempler** kaller dedikert, actor- og firmasjekket RPC. Malene får vanlige historiske utgaver. Arbeidsutkast gjenopprettes; signert SJA/fullførte kontroller beholdes og får nye kursutkast. En lukket kurs-RUH beholdes og får en ny åpen kopi. Åpen RUH beholder sin oppfølgingshistorikk. Publiserte sjekklisteutgaver omskrives ikke. Vanlig **Tilbakestill demo** for Sales/Prosjekt er separat.

Funksjonene er `SECURITY DEFINER` med tom `search_path`, kun `authenticated` har execute, og aktiv godkjent dedikert demobruker kreves. Reset bruker advisory lock, firma og radlås. Underliggende produkt-RPC-er kontrollerer fersk tilgang. Preflight kontrollerer både innhold, originale utgaver og transport/HR-port; røde punkter kan ikke skjules med kursreset.

## Utviklerkontroll

- Tørrkjøring av seed med rollback: PASS. Faktisk kursinnhold lagret i Sandbox.
- `scripts/demo/kshms-hr-course-check.sql`: PASS i faktisk Sandbox. Vanlig signering/fullføring innen rollback-transaksjon, ferske utkast etter reset, uendret signert/fullført historikk, ACL, deaktivering, avslått mail og lukket HR-port. Alle testsignaturer og fullføringer rullet tilbake.
- Eksisterende 19 backend-preflightpunkter og tre nye kurspunkter grønne. Lokal Badskisse og klientens main-kontroll må fortsatt kjøres i kursoperatørens innloggede nettleser.
- Ett eldre medieavvik rettet: opplastet JPG-Badskisse manglet `kind=bathroom-sketch`. Bare typefeltet gjenopprettet for kjent DEMO-02-element; foto/path/innhold beholdt, tidligere metadata sikkerhetskopiert. Golden hadde allerede riktig type. Ingen guard svekket.
- Full Sandbox build med critical checks: PASS. Produksjonsbackend skal ikke finnes i emitted Demo-JS.
- `/demo-documents/DEMO-kurs-SJA.pdf`: fersk eksport fra ordinært autorisert, lagret Demo SJA-readback gjennom appens PDF-kode (offline snapshot-adapter). To A4-sider rendret og visuelt kontrollert. Utkast/ikke signert, prosjekt og lagret revisjon synlige; ingen klipping eller manglende tekst.
- Responsive bredde-/høyderegler fra release beholdt; kursveiledningen får én kolonne under 650 px og knapper på minst 46 px. Fysisk mobil, kamera og ny innlogget ende-til-ende kursrunde er ikke testet i denne økten. Kontrollmail til Kenneth er ikke sendt.

Production er separat: PR #216 merged; Vercel `dpl_BHpnnv8bnyo8wU3oLUE9NEsgixd5` READY på riktig main-commit/Production-backend. Mail-worker konfigurert og autentisert check-mode HTTP 200, ingen testsending eller automatisk modulaktivering. Endelig Demo-commit/deployment-bevis registreres i PR #216 etter publisering. Nye funksjoner fryses etter denne releasen.
