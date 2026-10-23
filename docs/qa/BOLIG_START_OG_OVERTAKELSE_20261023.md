# Boligprosjekter – veiledning og prosjektleders overtakelsesvurdering

Miljømål **BEGGE**. Samme foundation-branch og draft PR #278. Kun Preview og Sandbox til egen TEST OK. Ingen produksjonsmigrasjon, main-merge eller main → demo i denne etappen.

## Avtalt produktendring

Kenneth ønsker en enkel A–Å-oppskrift med bilder og anbefalt rekkefølge. Åpne forhold skal gi oversikt; prosjektleder skal vurdere om de hindrer overtakelse. Registrering av en gjennomført overtakelse må ikke kreve at uferdig arbeid markeres som ferdig.

Dette erstatter eldre beskrivelser av at all intern sluttkontroll må være godkjent før en faktisk overtakelse kan registreres. Intern sluttgodkjenning har fortsatt sine dokumentasjonskrav. Den gjennomføres separat og kan fullføres senere.

## Scope og faktisk løsning

- `BoligStartGuide`: åtte steg fra prosjektstruktur til sluttpakke, anbefaling, hva som kan vente og konkret neste handling. Tilgjengelig direkte ved Bolig-hjelpen. Fire illustrasjoner fra virkelige komponenter med fiktive data, forstørring, forrige/neste og mobiltilpasning. Ingen prosjektdata endres av veiledningen.
- `BoligHandoverReview`: felles søkbar liste for valgt bolig, bygg eller prosjekt. Mangler fra intern kontroll, avvik/protokoll, påminnelser, uferdige aktiviteter (også valgfrie), manglende intern godkjenning og ubehandlede beboermeldinger. Meldingsinnhold kopieres ikke til vurderingen.
- Prosjektleder kan lagre en delvis vurdering. Uvurderte forhold beholdes. Vanlige filtrerte forhold uten vurdering kan få felles begrunnelse og ansvarlig. Kritiske forhold må behandles enkeltvis med særskilt bekreftelse og minst 15 tegn konkret begrunnelse.
- Hvert ferdig vurdert forhold får «Hindrer overtakelse» eller «Følges opp etter overtakelse», begrunnelse og aktiv intern ansvarlig. Bare lederens eksplisitte hinder stopper registrering. Ingen påkrevd sjekkliste eller beboermelding ferdigmeldes som følge av dette.
- Faktisk overtakelse krever gjennomgått aktuell liste, ingen forhold vurdert som hinder, protokollreferanse og faktisk dato senest i dag. Ingen automatisk intern godkjenning eller digital signatur. Ny registrering på samme område krever rettingsbegrunnelse; tidligere versjoner bevares.
- Bygg/prosjekt kan registreres etter egen vurdering uten tvungen registrering av hvert barn. Dette overtar ikke barn automatisk. Intern kontroll for barn forblir synlig som åpne forhold.
- Registrert faktisk overtakelse blir stående ved senere endringer. UI viser intern kontrollstatus separat og nye/endrede åpne forhold. Tidligere vurderinger kan åpnes fra egen historikk.
- Oppfølgingsansvarlig dokumenteres i vurderingen. Det er ikke en ny oppgavemotor. Frister og fristvarsler brukes i eksisterende aktiviteter. Vurderingen sender ingen e-post.
- PDF viser prosjektleders vurdering, protokoll, dato, begrunnelse og ansvarlig. ZIP har full historikk. En boligs uttrekk får ikke andre boligers vurderinger via felles dokumentasjon.

## Database, sikkerhet og konflikter

Additiv migrasjon `20261023130433_bolig_manager_handover_review.sql`, kun installert i Sandbox `ppvircenkjizeiqdxphj`. To private RLS-tabeller uten direkte app-/service-grants, én public SECURITY INVOKER gateway til en avgrenset privat definer med tom search_path og fersk firma-/bruker-/modul-/rolle-/scope-/prosjekttilgang.

Eksisterende intern kontrollberegning bevares i privat funksjon; visning av faktisk overtakelse legges på separat. Eksisterende streng godkjenning validerer fortsatt eget kontrollgrunnlag, også etter at faktisk overtakelse er registrert. Ingen annen modul eller tilgangskjerne endres.

Samme rot-/kataloglåsing som andre Bolig-skriv. Gjeldende saksliste og kildegrunnlag inngår i serverberegnet basis; revisjon og basis kontrolleres på hvert skriv. Forged/manglende/dupliserte saks-ID-er, fremmede eiere og stale grunnlag avvises atomisk. Eksakt lost-response-retry beholder request-ID og payload, og gir samme kvittering uten doble hendelser. Endret payload med samme ID avvises. Ingen automatisk write-retry.

Kladd er avgrenset per bruker/firma/område og beholdes ved fokus, lukking og nettverksfeil. Ferskt bakgrunnsgrunnlag overstyrer ikke kladden; eksplisitt gjennomgang kreves. Reelt firma-/bruker-/rolle-/tilgangsbytte skjuler tidligere innhold umiddelbart, og sene svar ignoreres. Manglende tilgang til et koblet prosjekt skjuler samlet vurdering/historikk og blokkerer skriv for det området.

## Verifikasjon

- PostgreSQL **1074 assertions PASS**, inkludert alle eksisterende Bolig-scenarier. Ny dekning: delvis lagring, kritisk begrunnelse/bekreftelse, manglende/forged/dupliserte saks-ID-er, aktiv eier, ledervalgt hinder, dato, faktiske statuser uten falsk intern godkjenning, urørte meldinger/aktiviteter, retry/revisjon, uforanderlig historikk, endret grunnlag etter overtakelse, retting, nabobolig- og felleseksportvern, reader/firma/anon og tilbakekalt prosjekttilgang. Senere intern godkjenning fungerer og erstatter ikke faktisk overtakelse.
- Ny faktisk Chromium-suite **34 assertions PASS**: samlet liste, batch unntar kritiske forhold, eksplisitt kritisk vurdering, kladd/fokus/lukking, vurdering uten registrering, nettfeil og eksakt retry, nye forhold etter overtakelse, eksplisitt rebase, firma-/rollebytte, åtte steg og bildevisning, 320/390/1366 px og ingen overflyt.
- Eksisterende ferdigstilling **29**, byggoversikt **42**, prosjektbygger **103**, Gantt/dialog **48** PASS. Ny read-only gateway er lagt til ferdigstillingsfixture uten å fjerne gamle assertions.
- PDF/ZIP **40 assertions PASS**; faktisk PDF/ZIP-byte, originaler, SHA-256/CRC og eksisterende eksportvern. Ny vurderingsside rendret og visuelt kontrollert.
- Full critical build PASS. Endelig CI og Vercel SHA registreres i PR #278 ved levering.
- Faktisk Sandbox smoke `scripts/bolig-handover-sandbox-smoke.sql` PASS gjennom ekte public RPC/Auth: opprettelse med tom adresse, delvis vurdering, faktisk overtakelse med åpne kontroller, retry, urørt intern status, eksport og separat byggregistrering uten tvungne barn. Alle syntetiske skriv rullet tilbake, 0 rester.
- Security advisor: samme seks funnkategorier før/etter; bare forventet INFO-telling for to nye bevisst private deny-all RLS-tabeller (149→151). Ingen ny offentlig definer, mutabel search_path eller brede grants.
- E-post fortsatt AV, 0 dialogjobber og 0 ventende fremdriftsjobber etter smoke. Ingen ekte e-post sendt.

En eksisterende køtest avdekket at to utdaterte burst-jobber kunne få ulik UUID-rekkefølge. Worker oppførte seg korrekt ved å undertrykke gammel jobb først. Testen tømmer nå slike undertrykte oppføringer før samme uendrede assertion om korrekt beboervarsel. Ingen produktregel eller sikkerhetstest er svekket.

## Kort brukertest

1. Samme faste Bolig-Preview → **Start her – Boligprosjekter fra A til Å**. Prøv Neste/Forrige, hopp til steg 4 og 7, forstørr et bilde og gå tilbake til prosjektet.
2. Åpne **DEMO – Stammeplan og meldinger → H0101 → Ferdigstilling**. **Overtakelse og åpne forhold** viser også uferdige aktiviteter og ubehandlet melding. Intern sluttkontroll ligger nedenfor.
3. **Vurder åpne forhold og overtakelse** → prøv delvis lagring. Prøv felles vurdering for vanlige forhold. Kritiske forhold må vurderes enkeltvis når de finnes.
4. I et fiktivt eksempel: vurder alle forhold som videre oppfølging med begrunnelse/ansvarlig, velg **En overtakelse som er gjennomført**, fyll dato og fiktiv protokollreferanse, bekreft og registrer. Arbeid og meldinger skal fortsatt være åpne. Merk ett forhold som hinder for å prøve at lederens vurdering stopper registreringen.
5. Se historikk og samlet PDF/ZIP. Endre et underliggende forhold: overtakelsen beholdes, mens oversikten varsler endret grunnlag.

Fysisk Safari og innlogget menneskelig vurdering av oppsett/flyten gjenstår. Reell e-postlevering er fortsatt ikke sluttprøvd og er utenfor denne endringens utsendinger. Ingen produksjonssetting uten egen TEST OK.

## Én inngang til registrering

Sluttkontrollen fanget den eldre «Registrer overtagelse»-snarveien fra intern godkjenning. Den åpner nå samme nye prosjektledervurdering. Den gamle RPC-skrivehandlingen avvises, slik at ingen eldre klient kan omgå en vurdert hindring eller et nytt grunnlag. Intern godkjenningsknapp heter «Godkjenn intern sluttkontroll». Historiske overtakelser beholdes. Additiv migrasjon `20261023132013_bolig_handover_single_entry.sql`, bare Sandbox. Eksisterende ferdigstillingsbrowser følger nå samme vurdering og verifiserer at intern gjenåpning bevarer faktisk overtakelse og historikk. Alle 29 assertions beholdes med den nye produktkontrakten; ny DB-assertion avviser den gamle snarveien.
