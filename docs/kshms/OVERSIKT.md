# KS/HMS – gjeldende planstatus

Oppdatert 8. oktober 2026, Europe/Oslo. Dette er samlet gjeldende status. PLAN.md inneholder hele omfanget og historiske gap; CONTINUITY.md inneholder overlevering og testbevis. Historiske «gjenstår»-tekster der må ikke overstyre denne oversikten.

## Nyeste forbedring

Egen **Last ned RUH-PDF** fra lagret sak med hele historikken og private bilder er READY på funksjonskode 7ed7eefa med grønn Core Safety/full critical build. Innlogget test ruh ga faktisk 4-siders PDF med begge hendelser og bevart lukking. Saken har 0 vedlegg; innlogget bildeprøve gjenstår. Ulagret tekst og endret/avslått tilgang sperrer uttrekk; andre vedlegg listes med tydelig originalfil-beskjed. [Scope/bevis](RUH_PDF_20261009.md), publisering i CONTINUITY og kort ny prøve i USER_TEST. Full historikk/bilder er avgrenset til egen RUH-PDF; prosjektrapportens tidligere sammendrag er uendret. Øvrige B/C-punkter består.

HR-lesetilgang er presisert: medarbeideren selv, registrert nærmeste leder og firmaadmin; firmaadmin kan gi uttrykkelig, tilbakekallbar lesetilgang til andre per medarbeider. [Byggekontrakt](HR_SCOPE_20261008.md). Ingen faktisk HR-implementering/rettigheter ennå.

Innlogget skynettleser 8. oktober: **test vernerunde** funnet i testprosjektets **Avvik/SJA/RUH → Vernerunde / kontroll**, gjenåpning og faktisk PDF kontrollert. Også rutine R-008 og tom Bunnledning-mal lastet ned. [Bevis og konkrete begrensninger](UI_TEST_20261008_PDF.md). Tidligere TEST OK beholdes; gjenværende PDF-/mobil-/flere-brukerprøver består.

Kenneths ti HR-svar er avklart: eget HR-valg, separat medarbeider-/ledertilgang, forberedelse før felles møte, firmamaler, behovsstyrte tiltak, begge bekreftelser, lederbytte og sletting ved fratredelse. Nærmeste leder velges blant aktive appbrukere og starter sykefravær manuelt. [Byggekontrakt og anbefalt sykefraværsflyt](HR_SCOPE_20261008.md) er dokumentert, ikke implementert. B/C før HR, ingen Production eller ekte e-postsending, består.

Egne PDF-er for godkjente rutineutgaver, publiserte tomme sjekklistemaler og lagrede prosjektkontroller er READY på funksjonskode 64143a3a med grønn Core Safety/critical build. Kort ny prøve står først i USER_TEST.md; publiseringsbevis står i CONTINUITY.md. Ingen ny HR- eller Production-leveranse.

Prosjektets Avvik/SJA/RUH er publisert READY på funksjonskode 990ce731 med grønn Core Safety/critical build. Visningen er gjort kompakt: fire lukkede dokumentgrupper viser antall/status, og avviksgrupper/rader er lukket med åpne saker først. Kort oversiktsprøve i USER_TEST.md gjenstår sammen med PDF-prøven. Samme Sandbox Preview; tidligere TEST OK består. Dette endrer visning og hjelp, ikke planens øvrige omfang.

## Hvor vi er

Vi har levert håndbokfundamentet og rutinebiblioteket i Sandbox Preview. Utførelsesdelen er langt på vei bygget. Varsling og rapporter er delvis levert. Individuell HR og full Ringside-pilot er ikke startet. Hele KS/HMS-modulen er ikke ferdig eller satt i produksjon.

[Samme Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe). PR #216 er fortsatt draft på feat-kshms-foundation. Kontroll-/risiko-PDF med bilder, matrise, utkastmerking og firmaprofil er implementert og utviklertestet. Funksjonskode c6dc21d5 er READY på samme feature/Sandbox, med grønn Core Safety/critical build. Eksakt publiseringsbevis står i CONTINUITY.md. Main er 155f6c4ac01f126c1db0c65da385cfd9305587d5 ved siste kontroll. Godkjenningen kl. 22:09 gjelder dokumentasjonsendring til feature-branchen, ikke Production-release.

## Planen A–E

| Trinn | Levert i Preview | Det som gjenstår |
|---|---|---|
| A – håndbok og tilgang | Firmaaktivering, roller, oppstart, utkast/godkjenning, faste utgaver, egen bekreftelse, Min personalhåndbok og signert revisjon. Tidligere delprøver TEST OK. | Samlet QA før release. Firmaet må velge, tilpasse og godkjenne sine rutiner før bruk. |
| A2 – rutineinnhold | 73 egne forslag med sporbar dekning av 121 innholdstemaer fra begge håndbøkene, seks egne hovedkapitler og faste rutinenumre. | Firmatilpasning og konkret faglig vurdering. Temadekning er ikke godkjenning av alle spesialtilfeller. |
| B – utførelse | Sjekklistesentral, prosjektpopup/historikk, Avvik/RUH, SJA, vernerunder/kontroller og 5×5-risiko med prosjektkobling, egne fullføringer og bevarte utgaver. Flere delprøver TEST OK. | Ny kort popup-prøve; resterende sentral-/signerings-/mobil-/flere-brukerprøver. Fullstendig vedleggsdekning og senere versjonerte underskjema inngår fortsatt i planen; underskjema er ikke dokumentert levert. |
| C – varsler og rapporter | Faste appoppgaver, deduplisert e-postkø for seks oppgavetyper og valgfri SJA/RUH-del i prosjektets Rapport/PDF/utskrift (TEST OK). Egne kontroll-/risiko-PDF-er og valgfri inkludering i prosjektrapport er utviklertestet. Egne PDF-er for rutineutgaver, sjekklistemaler og prosjektkontroller er også utviklertestet. Egen RUH-PDF med full historikk/private bilder er utviklertestet. | Nye PDF-brukerprøver; øvrig samlet dokumentuttrekk; samlet tilsynsuttrekk, inkludert RUH-historikk/bilder i samlet uttrekk; frist-/utløpspåminnelser og kildeoppdateringsforslag. Faktisk e-postlevering etter separat godkjent oppsett/release. |
| D – HR og stoffkartotek | Felles personalrutiner er tilgjengelige i håndboken. | Individuelle kurs/sertifikater/kompetanse, utløp, medarbeidersamtaler/tiltak og separat HR-tilgang/oppbevaring/sletting. Valgfritt stoffkartotek med arbeids-/SJA-koblinger. |
| E – pilot og drift | Løpende database-/React-/critical-QA og delvise desktop-/PDF-prøver. | Full tematisk/funksjonell kontroll, mobil/flere brukere, kapasitet/drift, Ringside-pilot etter minimumsomfang, deretter release-godkjenning og Production-verifisering. Avgrenset supportmodus følger etter pilot. |

## Godkjente delprøver

- Håndbok, avvikspopup/egen lukking og menyretur: tidligere TEST OK for sine leveranser.
- Sjekklistepopup med lagring/fullføring/historikk: TEST OK 7. oktober kl. 23:02.
- Meny, RUH-inngang og norske datoer: TEST OK 8. oktober kl. 01:28.
- SJA-utkast med rutine/lagring/gjenåpning og RUH-oppfølging/egen lukking: TEST OK kl. 13:30.
- SJA/RUH-valg i prosjektrapport og PDF med/uten: TEST OK kl. 14:48.
- Vernerunde/5×5 i prosjekt, rutinevalg og ansvarligvarsel: TEST OK kl. 21:04.

Disse gjentas bare ved ny konkret feil eller relevant regresjon. De er ikke samlet produksjonsgodkjenning. Popupens automatiske lukking er en etterfølgende rettelse; egen TEST OK for den er ikke registrert.

## E-post – avklart

KS/HMS-koden bruker allerede samme RESEND_API_KEY/CHAT_FROM_EMAIL som Production smart-worker. Smart-worker finnes også i Sandbox; eldre testmetode er ikke gjenfunnet. Dagens KS/HMS-prøver bruker simulert Resend, ikke innbokslevering. Sandbox KS/HMS-enabled=false er direkte bekreftet og beholdes. Ingen nye Sandbox-hemmeligheter kreves for å fortsette planen. [Gjeldende e-postoppsett](EMAIL_SETUP.md).

## Videre rekkefølge

1. Avslutt utførelsesdelen med nødvendige gjenstående B-punkter og PDF/vedlegg/rapportuttrekk som dokumenterer arbeidet. Kontroll-/risiko-PDF er nå bygget og utviklertestet; prøv bare det nye uttrekket i USER_TEST.md. Fortsett øvrige B/C-punkter etterpå. Den korte popup-prøven i USER_TEST kan gjøres parallelt; ikke krev at gamle delprøver gjentas.
2. Fullfør øvrig varsling/påminnelser og dokumentuttrekk fra C, og separat individuell HR fra D. Ledere ser bare tildelte medarbeidere; firmaadmin ser/behandler alle og tildeler ansvar. KS-rolle gir ikke HR-innsyn.
3. Avklar og gjennomfør eventuell valgfri stoffkartotekdel innen avtalt minimum. Den er ikke automatisk et nytt obligatorisk produktkrav.
4. Gjennomfør samlet QA og Ringside-pilot etter minimumsomfanget. Ingen tidlig begrenset pilot er besluttet.
5. Etter relevant TEST OK og uttrykkelig Production-godkjenning: migrasjoner/release, kontrollert e-postmottak og Production-verifisering, deretter kontrollert main → demo-synk. Supportmodus følger etter pilot.

PDF-leveransen er avgrenset innen vedtatt utførelses-/rapportscope og endrer ikke fullplanen.

## Faste beslutninger

Seks hovedkapitler; egen gjennomgang av tildelte rutiner; valgt ansvarlig lukker avvik selv; faste godkjente rutineutgaver; fullførte/signerte dokumenter beholdes. SJA har ansvarlig prosjektleders egen signatur og dokumentert medvirkning. Utførelse før HR. Minimumsomfang før Ringside-pilot. Samme Preview-adresse og én avgrenset leveranse om gangen.

Detaljer: [PLAN.md](PLAN.md), [CONTINUITY.md](CONTINUITY.md), [USER_TEST.md](USER_TEST.md), [CONTENT_STATUS.md](CONTENT_STATUS.md), [EMAIL_SETUP.md](EMAIL_SETUP.md).
