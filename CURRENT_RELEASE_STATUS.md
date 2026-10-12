Mobilpiler oppfølging 2: global nav-grid gjorde pilene horisontale og Vercel-knappen dekket ned. Egen vertikal kolonne + Preview-avstand + window.scrollTo. Før-fiks runtime-test feilet på global menystil; ny kontroll av begge trykk og scroll kjøres. Ikke publisert til main/demo.

Mobiltilbud oppfølging: topp/bunnpiler var dekket av flytende kundepreview-kort. Rettet til midt på høyre side etter brukerens ønske, med skjerm-/scrollflatekontroll. Avventer oppdatert Preview-test og eksplisitt TEST OK.

## Mobiltilbud – arbeid 13. oktober 2026

Miljømål BEGGE. Fra main 59682a0902615437677c129fb18fe154350b127e, egen lokal arbeidsmappe/branch fix-mobile-offer-reading. Kenneth meldte overlapping på mobil i Andreas sine tilbud, lang scrolling og manglende retur fra ny kunde-fane; ønsket også tydelig åpne/lukke. Ny avgrenset presentasjon: mobile hovedposter starter lukket; tekst/pris får riktig kolonne; små topp/bunnknapper; mobil modal med fast retur til samme sak. Desktop beholder egen fane. Ingen datalagring/publisering/mail/SQL/recoveryendring. Faktiske linjestrukturer fra F-2026-0087 og F-2026-0080 kontrollert lesende. Actual Chromium 320/360/390/760/1280 PASS. Gamle relevante critical PASS. Full critical/build og CI/Preview verifiseres før eksplisitt TEST OK. Tidligere PDF-TEST OK gjelder ikke denne nye mobil-UX-en.

## Rutiner sender ikke e-post – 12. oktober 2026

Etter Kenneths eksplisitte akuttinstruks er rutinetildelinger og lesepåminnelser bare i appen. Ny køtrigger blokkerer reading ved insert/retry; 670 ventende rutine-e-poster stanset i produksjon, ingen gjeldende rutinepost sendbar. 200 allerede sendte beholdes i loggen. Rutiner, tildelinger og egne bekreftelser beholdes. Andre oppgaver og frister beholder e-post. Produksjon og Sandbox installert, faktisk insert/retry-test rullet tilbake. Se docs/kshms/ROUTINE_EMAIL_STOP_20261012.md.

## Hele personalhåndboka som PDF – 12. oktober 2026

Miljømål **BEGGE**, fra verifisert main `55d43947b0bd991d282959ace41fdefc489984b2` (#237). Kenneth ba om at ansatte kan laste ned hele personalhåndboka med firmalogo. Ny knapp øverst i Min personalhåndbok bruker eksisterende lesende KS/HMS-state og firmaprofil. Alle egne tildelte rutiner med full tekst, kilder, godkjenning og egne bekreftelser med sekunder/norsk tid; søk begrenser ikke PDF. Gjeldende tildelte utgaver først, tidligere/utgåtte tildelte utgaver i merket historikkdel. Innholdsfortegnelse med faktiske sider og felles kompakt ramme-layout. Ingen bekreftelse registreres ved nedlasting.

Scope: PersonalHandbook integrasjon, ny egen PDF-knapp/renderer, permanent critical og React/jsPDF-QA, Hjelp og release-dokumentasjon. Eksisterende enkelt-PDF/samlet lesebekreftelse/firmapublisering beholdes. Ingen SQL/RLS/tilgang/worker/mail/meny/salg/HR-endring. Egen tildeling brukes også for admin og KS/HMS-ansvarlig. Fersk aktør-/firma-/tilgangskontroll før/etter PDF-motor og logo; endrede tildelinger/tekst/kvitteringer stopper nedlasting. Sent svar etter unmount eller scopeswitch forkastes. Manglende registrert logo stopper eksport; profil uten logo gir firmanavn og ærlig beskjed.

QA/status og Preview føres i `docs/kshms/HANDBOOK_PDF_20261012.md`. Ingen tidligere TEST OK påstås å dekke denne nye PDF-funksjonen. Ingen produksjonspublisering før relevant godkjenning.

## Samlet firmagodkjenning – 12. oktober 2026

Miljømål **BEGGE**, fra ferdig #236/main `5c5e32792895e213280d893975d8eeea6872c3cb`. Kenneth viste enkeltgodkjenning på R-087 og ba om en raskere firmagodkjenning. **Godkjenn flere rutiner** øverst i Håndbok lar firmaadmin og KS/HMS-ansvarlig velge lagrede utkast, inkludert Velg alle som venter, lese eksakte utkast/utgavenummer og bekrefte felles vurdering. Én ny additiv transaksjons-RPC bruker uendret kshms_command(publish) for hver utgave. Gammel godkjenning, historikk, tildeling, varsling og eksplisitt valgfri egen lesebekreftelse beholdes. Ulagret tekst og stale/feil aktør/rolle/firma stopper handlingen; ingen delvis publisering. 87-utkast/88-utgaveprøve i lokal PostgreSQL og ekte Sandbox rullet helt tilbake, faktisk React for begge roller og gammel enkeltgodkjenning/auto-neste PASS. 86 eksisterende funksjoner og 102 relasjoner/RLS/ACL er identiske i Sandbox. Kenneths avgrensede produksjonsautorisasjon for isolert samlet rutinebehandling gjelder; ingen ny manuell Kenneth test påstås. Preview/CI, Production og kontrollert main → demo verifiseres før sluttmelding. [Kontrakt og bevis](docs/kshms/BULK_PUBLICATION_20261012.md).

## Butikk/lager/truck og samlet egen bekreftelse – 12. oktober 2026

Miljømål **BEGGE**, etter ferdig #235/main `0ccedfe03f4e03c9ec19bde7a9f4077470141bcd`. Kenneth har autorisert produksjon hvis endringen isoleres; ny egen KS/HMS-lesebekreftelse gjelder medarbeider, KS/HMS-ansvarlig og firmaadmin, hver på egen bruker. Komplett utgaveliste, uttrykkelig lest-og-forstått-avkrysning og én atomisk RPC gir separate immutable kvitteringer med dato/klokkeslett på hver utgave. Enkeltbekreftelse og gammel historikk beholdes. 14 nye butikk-/lager-/truckforslag gir 87 forslag totalt uten automatisk publisering/tildeling. Opprinnelige 73 utkast verifiseres eksakt. Ingen øvrige funksjoner/tilganger/RPC/tabeller/arbeidere endres. Ny QA/Preview og kontrollert main → demo før endelig publiseringsmelding. [Kontrakt, forslag og bevis](docs/kshms/BULK_ACK_STORE_20261012.md).

## Tydelig gjennomføring og trygg referatgjennomgang – 12. oktober 2026

Miljømål **BEGGE**, fra ferdig publisert PR #234/main `c0f3a015d8a47b81d0d2a0f0a9ed7b18aa06da12`. Kenneth ba om faktisk UX-test og retting. Innlogget Preview med eksisterende syntetisk kursmedarbeider bekrefter uklar opprettingsinngang etter deling. Faktisk React og lokal PostgreSQL reproduserte at gjentatt Send til begge for gjennomgang nullstilte gitt bekreftelse.

Opprettingsinngangen heter **Opprett ny medarbeidersamtale** og forklarer at eksisterende samtaler fortsettes nedenfor. Status og neste steg forklares. Nytt lederinnspill åpner Felles møte mens møtet pågår, med delte svar og medarbeiderens delte kommentar; sendte/ferdige referater åpnes i Referat. Eksisterende RAM-kladd og valgt steg ved ny autorisasjon beholdes. Referat samler delt forberedelse, møtenotater, tiltak, ansvarlig, frist og neste oppfølging. Ulagret forhåndsvisning merkes tydelig og kan ikke sendes/bekreftes. Privat, ikke delt forberedelse tas ikke inn i oversikten.

**Lagre samtale** lagrer arbeidet. **Send til begge for gjennomgang** vises bare før sending. Begge bekrefter selv med **Jeg har lest referatet**. En ferdig samtale lukker ikke åpne tiltak. Forrige/Neste bytter steg uten å lagre. Endret referat eller delt kommentar krever fortsatt nye bekreftelser.

Scope: HrConversations, ny ren HrConversationReview, samtale-sessionens åpningssteg, scoped CSS, én migrasjon som bare gjør ready på samme awaiting-utgave til en lesende no-op, utvidet eksisterende React/PostgreSQL/session-QA og Hjelp/docs. Alle opprinnelige firma-/rolle-/medarbeider-/CAS-/required-field-kontroller beholdes før no-op. Ingen ny RPC/tabell, grants/RLS/tilgang, medlemskap, worker/cron/mail eller annen modul. Retry lager ingen revisjon, historikk, kvittering eller mail; faktisk innholdsendring beholder tidligere bekreftelsesregel.

QA, CI, eksakt Preview-kilde og innlogget ny visning føres i release-PR. Sandbox-mail beholdes AV; ingen kurssamtale resettes, og ingen ekte medarbeider/profil/leder/tilgang endres som QA. Tidligere TEST OK beholdes; godkjenningen for #234 gjelder ikke automatisk denne nye UX-/retry-rettingen. Kenneth ga avgrenset TEST OK 12. oktober 2026 kl.10:47 Europe/Oslo: «får ikke test så TEST OK». Godkjenningen gjelder denne leveransen i PR #235, basert på agentens innloggede Preview-kontroll og grønne automatiske scenarioer/CI. Kenneth gjennomførte ingen ny manuell Preview-prøve. Production-migrasjon/merge og kontrollert main → demo er autorisert; tidligere tester/godkjenninger beholdes.

Innlogget etterprøve: fast Preview beholder økten over deploy. Opprett ny medarbeidersamtale, status for delt forberedelse og samlet Referat er kontrollert i faktisk publisert kurssamtale. Midlertidig syntetisk RAM-tekst vises i ulagret forhåndsvisning og sperrer sending; original tekst er satt tilbake uten lagring. Kurssamtalen er fortsatt utgave 4, ingen mail/write/reset. Dialoghodet dekket 8 px av stegoverskriften; scrollmargin for bare den ordinære samtalens steg er økt slik at hele overskriften vises etter stegbytte. QA: 105 samtale-React, 108 varsel-React, 267 PostgreSQL og 131 runtime assertions PASS, berørte eksisterende brukerreiser og full critical/build BEGGE PASS. Endelig CI/READY/byteeksakt kilde og målt innlogget stegvisning føres i release-PR #235.

## Navn i åpnet medarbeidersamtale – 12. oktober 2026

Miljømål **BEGGE**, avgrenset feilretting etter ferdig publisert #233/main `a5be1c976ceb4c4ab19e326647dcf79c7b63e99e`. Kenneth viste en direkte åpnet samtale uten medarbeideridentitet. Dialogtittelen viser nå Medarbeidersamtale – navn, og selve samtalen viser Medarbeider: navn med e-post. E-post brukes som reserve hvis profilnavnet mangler. Navnet kommer fra den samme autoriserte medarbeiderens profil, aldri innlogget leder, e-postgjetting eller samtaletittel. Bare den åpne private samtalen viser navnet; generelle kort på Startsiden/Min side og e-post beholder eksisterende innhold.

Scope: én ny ren hrEmployeeLabel, HrFollowupNotice-dialogtittel, HrConversations-identitetsfelt/CSS, én migrasjon som bare utvider den eksisterende private employee_json-formatteringen med valgfritt full_name, permanent React/PostgreSQL-QA og Hjelp/docs. Profilnavnet er visningstekst fra typetestet/trimmet raw_user_meta_data.full_name, maks 120 tegn; ingen autorisasjonsbeslutning bruker metadata. Ingen ny RPC/tabell, grants/RLS/tilgang, medlemskap, leder, samtaleinnhold/revisjon/historikk, e-post/worker/cron, PDF/kalender, Sales/recovery, prosjektflyt eller menyendring. Formatterens tidligere felter og interne privilegier beholdes. Fersk reautorisasjon skjuler identitet sammen med resten av dialogen ved bortfalt tilgang, firma-/brukerbytte og sene svar.

QA: faktisk varselkort/direkte dialog/Min side React 101, samtale-React 89 og PostgreSQL 260 assertions PASS. Navn fra riktig medarbeider, navneløs/ugyldig metadata, e-postreserve, maksimal lengde og private helperprivilegier er dekket; tidligere tilgang/kladd/direkte sak/innspill/paginering/ingen mail-scenarier er beholdt. Eksisterende HR-foundation, Min side/kontakt og module-navigation runtime PASS. Full critical/build og kilde-/metadata-/CI/Preview-bevis føres i release-PR. Ingen faktisk medarbeider/profil/leder/tilgang endres eller e-post sendes som QA.

Sandbox-migrasjon installert: formatterens funksjonskropp er lest tilbake byteeksakt. Alle øvrige HR-funksjoner, policies, triggere, runtime, e-postinnstillinger og helperprivilegier er uendret. Faktisk lesende prøve med eksisterende syntetisk kursmedarbeider er rullet tilbake; navn/bruker-ID/revisjon stemmer. Ingen advisor-tillegg. Full critical/build Production og Sandbox PASS. PR #234: godkjent funksjonskode `6151ada6172ffc49ecb2d135dee1b85f37f85255`, Core Safety `38212621017` / jobb `114689997559`, alle steg SUCCESS. Fast Preview `dpl_4aNs4pSFirbzkJqYqoQB2yEPBtcG` READY, HTTP200 og 31 berørte JS/CSS-filer byteeksakte mot vanlig Sandbox-build. Endelig Production/main → demo-bevis føres i release-PR.

Dette er ny avgrenset navnevisning; tidligere TEST OK for #233 og alle andre funksjoner beholdes. Kenneth ga TEST OK for navnevisningen 12. oktober kl.08:34 Europe/Oslo. Godkjenningen gjelder denne avgrensede rettingen i PR #234. Ingen gamle tester skal gjentas. Production-migrasjon/merge og kontrollert main → demo er autorisert; tidligere godkjenninger er ikke brukt som generell fullmakt.

## Lederkort for delte medarbeiderinnspill – 12. oktober 2026

Miljømål **BEGGE**. Ny avgrenset leveranse etter ferdig publisert #232, fra main `ababf3f2c23f4ed9d54c36eed4000f4c397c3e53`. Ingen generell Production-godkjenning arves fra tidligere direkte bestillinger. Kenneth ga ny avgrenset TEST OK 12. oktober kl.07:27 Europe/Oslo: «noe jeg må teste? Hvis ikke er test ok». Ingen ekstra manuell prøve er nødvendig for godkjenningen; den nye funksjonen er kontrollert med faktisk React/PostgreSQL, publisert Preview/sourcekontroll og grønn CI. Ingen innlogget lederkortprøve er attestert, og tidligere godkjenninger gjenbrukes ikke som generell Production-fullmakt. Production-migrasjon/merge og kontrollert main → demo er autorisert for akkurat lederkortet.

Gjeldende nærmeste leder får **Nytt innspill til medarbeidersamtalen** i Dine varsler og oppfølginger på Startsiden og Min side i aktivt firma. Eksisterende `employee_feedback_revision` fra Klar til samtale eller endret delt medarbeiderkommentar styrer kortet, også når e-post er deaktivert. Privat kladd, lederens egen kommentar og uendret medarbeiderkommentar lager ingen ny feedback-revisjon. Kortet viser generell tekst og pekere, ingen personnavn, private svar eller kommentarer. Åpne samtalen går direkte til riktig samtales Referat, der kommentaren kan leses; Forberedelse/Felles møte viser de delte forberedelsessvarene.

Kortet håndteres uttrykkelig med **Marker innspillet som håndtert** i den ferskt autoriserte, gjeldende samtalen. Åpning/polling/lesing håndterer ingenting. Handlingen er sperret ved ulagret kladd, konflikt, historisk/annen sak eller endret revisjon. Privat kvittering gjelder samtale + faktisk leder + nøyaktig feedback-revisjon. Senere endret kommentar vises på nytt. Ny leder arver ikke forrige leders kvittering. Samtalen og dens revisjon/historikk/bekreftelser beholdes. E-postkø, utsending, worker, cron og mailstatus er uendret; håndtering sender ikke e-post på nytt.

Scope: HrFollowupNotice/transport, én HrConversations-propintegrasjon, ny isolert HrConversationFeedback, én additiv migrasjon med privat RLS-stengt kvitteringstabell/to RPC-er, permanent eksisterende React/PostgreSQL-QA og Hjelp/docs. Ingen eksisterende SQL-funksjon, tilgangskjerne, medlemskap, Sales, main/navigation, sykefraværseditor, autosave/recovery eller prosjektflyt endres. Kvitteringer følger samtalens eksisterende FK-sletting. Ved gjenoppretting uten kvitteringer blir innspillet ulest igjen; gammel kvittering kan aldri skjule nyere innspill. Full databasebackup inkluderer tabellen; eksisterende innholdseksport gjenbrukes uten kvitteringer.

QA før Production: faktisk React 92, PostgreSQL 245, eksisterende samtale-React 88 og sykefravær-React 48 PASS. Session/PDF 127 og sykefravær/mail 175 PASS. Min side/kontakt og module-navigation runtime PASS. Full critical/build Production og Sandbox PASS. Sandbox-migrasjon installert; begge funksjonskropper lest tilbake byteeksakte. Eksisterende HR-funksjoner samlet fingerprint `3496d74f97d72414dc7c318cdd223a3a`, policies `1cb764eb0dc8d86c5f051d4aa1f69915`, ikke-interne triggere `7362fa67a5dcd2a0eaa041e76710e1a6` uendret før/etter. Sandbox-mail fortsatt AV, runtime uendret. Rolletest rullet tilbake: manglende aktør og direkte tabelllesing avvist. Ny tabell har RLS, ingen direkte klient-/servicegrants, null kvitteringer etter QA. Advisor-differanse bare forventet én lukket RLS-tabell og to autentiserte, tilgangskontrollerte definer-RPC-er. Ingen virkelig medarbeiderwrite/utsending. Avgrenset TEST OK er mottatt; eldre godkjenninger beholdes.

PR #233: feature-kode `9a089c241ef336919a8207d9caa6dc12b0c3664b`, Core Safety `38207713606` / jobb `114674792407`, alle steg SUCCESS. Fast Preview `dpl_7ULrKS9LLF3KFBzSGqXyhVYhsitC` READY, HTTP200 og 30 berørte JS/CSS-filer byteeksakte mot vanlig Sandbox-build. Innlogget prøve er ikke attestert; Sandbox har ingen delte aktive innspill. Ingen ekstra gammel brukerprøve kreves. Endelig Production/main → demo-bevis føres i release-PR. Ingen faktisk medarbeidermail, konto-/leder-/tilgangsendring eller sletting brukes som QA. Ingen ny manuell prøve av gamle godkjente funksjoner kreves.

## HR-kontroll nær fristen og ryddige HR-e-poster – 12. oktober 2026

Miljømål **BEGGE**. Kenneth oppdaget at Kontroll av HR-oppsett og tilgang med frist 11.10.2027 allerede lå som varsel 12.10.2026. Det nye varselkortet filtrerer nå denne administrative kontrollen til 30 kalenderdager før fristen, på fristen og etter fristpassering. Invitasjoner vises straks, og andre åpne arbeidsplaner/tiltak beholdes slik at arbeidet kan starte i tide. Kontrollfristen kan fortsatt leses i HR-oppsettet/registerets fullstendige fristliste. E-postregelen er uendret.

Avgrenset retting av #231: visningsfilter, permanent QA, Hjelp/docs og generisk HTML-layout i eksisterende HR-mailworker. Ingen endring i SQL/RLS, firmatilgang, leder, kø/reservasjon/validering/dispatchregel eller beskyttet autentisering. Brukerens direkte Production-bestilling for varselkortet gjelder også denne feilrettingen. Ny faktisk React 65 assertions dekker den rapporterte årsfristen, 31/30-dagersgrense, fristdag, passert frist og Oslo-DST, samt tidligere invitasjon/direkte editor/kladd/paginering/tilgang. Ready CI/Preview/Production/Demo-bevis føres i release-PR.

Leder-e-post er allerede aktivert i Production: medarbeiderens Klar til samtale/deling og faktisk endring i egen delt kommentar køer generisk nytt innspill til registrert nærmeste leder. Lagring av privat forberedelseskladd sender ikke varsel. Dette nye frontendkortet har fortsatt ikke et separat ledervarsel om delte svar. Kenneths skjermbilde kl.01:16 bekrefter faktisk mottak av nytt innspill i lederens innboks, med ren tekst og lang omskrevet lenke. Feedback-, lederpåminnelse- og generiske fristmailer har nå samme mørke/turkise ProffDok-profil med tekstlogo, inline tabeller, tydelig appknapp og tekstalternativ. Firmalogoen i invitasjonen er uendret. Generiske varsler får ingen firmanavn, personnavn, svar, kommentarer, diagnose eller saksidentitet. Varsel-/køregler og målrettet testmodus er uendret. Ny mail-runtime QA 175 assertions PASS; ny faktisk innboksvisning av HTML eller en ny testmail er ikke attestert/sendt av utvikleren.

## Synlige HR-varsler og direkte åpning – 12. oktober 2026

Miljømål **BEGGE**. Kenneth ba kl.00:54 Europe/Oslo uttrykkelig om direkte Production-leveranse. Dine varsler og oppfølginger vises øverst på Startsiden og Min side i aktivt firma. Invitasjonen viser dato, klokkeslett, sted og om forberedelsen er delt. Åpne samtalen/Åpne oppfølgingen åpner riktig privat sak i dialog, med eksisterende redigering, lagring, kalender, PDF og historikk. Lederens eksisterende åpne tiltak og sykefraværsfrister bruker samme inngang. Kontroll av HR-oppsett åpnes fra eget varsel. Ingen oppgave oppdiktes når listen er tom. «Kommer» og «ikke åpnet ennå» er rettet til aktuell funksjon.

Avgrenset frontend: én Startside-render i main, Min side, nytt varselkort/minimal lesetransport og initialt saksvalg i de to HR-editorene. Dagens hr_followup_tasks og dobbel fersk medarbeider-/sakslesing gjenbrukes. Ingen SQL/RLS/grants/membership/e-post/worker/cron-endring. Ingen private svar, navn eller journalinnhold legges i varselkortet, URL eller nettleserlager. Kun de første seks invitasjonene per side får møtefelter hentet; øvrige viser oppgavefrist og kan åpnes direkte. Paginerte oppgaver kontrolleres mot samme servermarkør før åpning.

Snarveien autoriserer på nytt og nekter foreldet/ferdig oppgave. Min side beholder konto- og e-postkladd. Samme saks private RAM-kladd og valgte steg beholdes ved fokus/ny autorisasjon. En annen sak bytter ikke automatisk over en ulagret kladd; eksplisitt bytte bruker eksisterende avbryt/bekreftelse. Feil firma/aktør, tilbakekalt tilgang, skjult side og sene svar kan ikke vise gammelt innhold. Eksplisitt lukking respekteres.

QA: faktisk nytt varselkort/direkte editor/Min side React 56 assertions PASS, eksisterende Min side/kontakt og modulnavigasjon PASS, medarbeidersamtale React 88 og sykefravær React 48 PASS. Ny permanent test kjøres i PR Core Safety. Hjelp/README/architecture oppdatert; publisert SHA/CI/assetkontroll og main → demo-preflight føres i release-PR. Faktisk Outlook/innboks eller ny innlogget nettleserprøve attesteres ikke. Brukeren ba om direkte Production uten ny TEST OK-runde.

## Sted og firmaprofil i medarbeidersamtale-invitasjon – 12. oktober 2026

Miljømål BEGGE. Kenneth bestilte sted i invitasjonen kl.00:01:32 og sa uttrykkelig «gjør det rett i produksjon» kl.00:01:51 Europe/Oslo. Tillegg kl.00:05 om samme logo/profil som tilbudsmailene inngår i samme avgrensede leveranse. Direkte Production etter grønn QA/CI/sourcekontroll; ingen ny TEST OK eller faktisk medarbeidermail attesteres.

Nye samtaler krever Sted (møterom eller adresse, én linje, maks 200 tegn). Nærmeste leder endrer lagret dato/klokkeslett/sted under Endre tidspunkt og sted. Eksisterende samtaler kan fortsatt åpnes; manglende sted må legges til før invitasjon. Sted følger samme lagrede utgave til e-post, Outlook, .ics LOCATION og samtalens PDF. Historikk viser faktisk tidligere sted eller Ikke avtalt. Gamle start-/tidspunkt-RPC-er beholdes og overskriver ikke eksisterende sted.

Invitasjonen har firmaets lagrede logo/profil, samme mørke/turkise profil som tilbudsmail, datoboks og knapp til den generelle appadressen. Firmaprofil hentes fra samtalens firmascope på serveren. HTML bruker e-posttabeller/inline-stil, escaped tekst og HTTPS-logo eller appens standardlogo. Tekstalternativ følger med. Svar, kommentarer, personnavn og samtale-ID følger ikke e-post eller ekstern kalender-URL; møtested og firmaprofil følger uttrykkelig brukerbestilling.

Invitasjoner identifiseres etter lagret dato, klokkeslett og sted i eksisterende private, cascade-slettede artefaktsnapshot/outbox. Stedendring lager ingen e-post av seg selv. Leder sender den nye avtalen uttrykkelig. Gjentatte klikk gjenbruker samme jobb/provider-idempotency; tidligere sendt samme dato/tid/sted beholdes. Foreldet sted stopper kø/reservert jobb før provider-kall. Bare allerede undertrykt, aldri sendt invitasjon kan få ny jobb ved retur til tidligere sted. Sendetilgang, fersk mottaker, lease/backoff og opprinnelige forberedelses-/rolle-/CAS-/bekreftelseskrav beholdes. Nytt bucketområde isolerer invitasjon fra frist, lederpåminnelse, innspill og målrettet test.

Scope: samtale/session/kalender/PDF, eksisterende mailworker + ny formatter, én additiv funksjonsmigrasjon, HR-checks og Hjelp/docs. 7 nye funksjoner og 5 eksisterende invitasjonsfunksjoner endres. Ingen tabell, RLS, trigger, token, cron, firmatilgang eller annen modul endres. Lokal PostgreSQL 206, faktisk React 88, session/kalender/PDF 127 og sykefravær/mail 151 assertions PASS; full critical/build BEGGE PASS. Backup-test utvidet fra én til tre syntetiske saker med samme kontroll av gammel backup/purge. Eksakt Sandbox/Production-kilde/fingerprint/CI/READY og main → Demo føres i PR. Skyens store rollback-harness traff MCP «Invalid or expired requestState» to ganger; den attesteres ikke. Ikke-muterte funksjons-/privilegiekontroller og fingerprints brukes i tillegg til faktisk lokal PostgreSQL. Ingen virkelig samtale, tilgang eller mottaker er endret/sendttestet.

## KS/HMS og HR i flere arbeidsfirma – 11. oktober 2026

Miljømål BEGGE. Kenneth fant ikke Camilla eller HR-valget i Firmaadmin. Read-only Production-metadata bekrefter at profilen hennes ligger under Bademiljø Expo, med medlemskap i alle tre firmaer; samtalen ligger i Ringside. Kenneth er systemadmin. Den gamle Firmaadmin-listen henter profiler etter primærfirmanavn, og systemadmins tidligere KS/HMS-/HR-kort brukte bare primærfirmaets scope. Derfor kunne ikke individuell HR-tilgang i ekstra arbeidsfirma velges fra kortet. Ingen virkelig konto eller tilgang er endret.

Avgrenset separat retting: ny PeopleWorkspaceModuleAccess-wrapper og systemadmins eksisterende kortintegrasjon, relevante React-checks/CI, Hjelp og release-dokumentasjon. Wrapperen bruker eksisterende list_managed_work_profiles og PeopleModuleAccess/RPC/CAS. Ingen backend, migrasjon, arbeidsprofilendring, øvrige tilgangskontroller eller kalenderendring i denne PR-en. Systemadmin velger Firma for KS/HMS og HR blant brukerens faktiske medlemskap. KS/HMS-rolle og eksisterende tilgang i valgt firma beholdes ved HR-lagring. Firmaadmins arvede tilgang vises uten individuell lagreknapp. Andre tilganger på kortet beholder primærfirmaets scope. Ulagrede modulvalg krever uttrykkelig forkasting før firmabytte; pågående lagring sperrer bytte. Fersk metadata og sent svar etter unmount/tilgangsendring håndteres uten å gjenåpne gammel UI.

QA: faktisk wrapper + eksisterende PeopleModuleAccess React med syntetisk transport, eksisterende full People/Help-React og critical People-check PASS. CI inkluderer nå disse permanente kontrollene. Ingen faktisk Camilla-grant eller e-post sendes av utvikleren. Sandbox har ingen identisk Camilla/flerfirma-fixture; innlogget tilgangsvalg for det virkelige tilfellet er ikke attestert. Ny avgrenset tilgangs-UX krever TEST OK før Production; tidligere mail-/kalendergodkjenning brukes ikke som godkjenning av denne separate rettingen. Eksakt grønn CI/Preview/source føres i PR.

## Outlook / Office 365 og tydelig invitasjonsstatus – 11. oktober 2026

Miljømål BEGGE. Kenneth ba kl.23:18 om å oppdatere kalenderknappen i den aktive Production-leveransen. **Åpne i Outlook / Office 365** åpner en ny avtale i Outlook på nettet med fersk lagret dato, norsk klokkeslett og valgt varighet. Brukeren kontrollerer jobbkonto og kalender og lagrer i Outlook. Ingen kalenderkonto kobles til, og appen bekrefter ikke lagring i Outlook. **Last ned kalenderfil (.ics)** beholdes med konkret veiledning for Kalender → Legg til kalender → Last opp fra fil → velg kalender → Importer. Tidspunktendringer må oppdateres av brukeren. Gjentatt åpning kan lage en ny Outlook-avtale.

Begge kalenderformater bruker samme validering og Oslo → UTC-konvertering. To ferske autoriserte samtalelesinger og revisjonskontroll før eksport beholdes. Gjeldende medarbeider/leder kontrolleres på nytt før begge kalenderformater. Nytt vindu åpnes synkront på brukerklikk; opener fjernes straks, og et tomt vindu lukkes ved feil eller foreldet svar. Bare generell møtetittel, dato/tid/varighet og generell applenke sendes til Outlook. Ingen medarbeider, firma, samtale-ID, svar, referat eller kommentar følger nettadressen.

Camillas manglende sendeknapp skyldtes avslått individuell HR-modultilgang; aktiv brukerkonto og valgt nærmeste leder var korrekte. Det er kun lest tilgangsmetadata. Ingen virkelig tilgang, samtale eller e-post er endret/sendttestet i denne runden. UI forklarer nå riktig adminmeny og firmascope når forberedelsesoppgaven mangler, og sier ikke lenger at brukeren skal trykke på en skjult knapp. Sendebetingelser og eksisterende tilgangskontroll beholdes.

Avgrenset scope: samtale-React/CSS, kalenderformatter, Hjelp og relevant runtime/React/docs. Ingen backend, migrasjon, RLS, kontoendring eller annen modul. Tidligere TEST OK og Kenneths bekreftede test-e-post kl.23:11 beholdes. Faktisk innlogget Outlook-lagring/kalendervalg må bekreftes av bruker. QA: faktisk React 83 og samtale/session/kalender/PDF/mail 113 assertions PASS, full critical/build PASS. Eksakt QA/CI/Preview/Production/main → demo-bevis føres i PR.

## Lederpåminnelse, kalender og medarbeiderinnspill – 11. oktober 2026

Kenneths Production-instruksjon kl.22:24 gjelder aktiv leveranse; tillegg kl.22:35–22:36 om egen lederpåminnelse, kalender for begge og e-post ved medarbeiderkommentar er innarbeidet. Invitasjonsknappen fra #226 er allerede publisert. Disse tilleggene får egen avgrenset PR, grønn critical QA/CI og Production-verifisering; ingen innlogget Preview-mailprøve eller mottatt e-post attesteres.

Nærmeste leder velger **Send meg e-postpåminnelse dagen før** i den gjeldende samtalen. Valget lagres straks på serveren, krever gjeldende leder, fersk medarbeider-/samtalerevisjon og et fremtidig gyldig norsk tidspunkt. Det gjelder bare den lederen som valgte det. Utsending skjer 24 timer før, eller snarest før møtet ved senere valg. Avslått valg, leder-/tilgangsbytte, endret tid, ferdig referat eller sletting stopper ventende utsending. Samme avtale varsles én gang. Privat outbox, token og cron gjenbrukes; ingen nye tabeller/innstillinger.

Begge parter har **Varighet i kalenderen** og **Legg til i kalender**. Kalenderfil (.ics) bruker dobbel fersk autorisert serverlesing, lagret tidspunkt i Europe/Oslo konvertert til UTC, stabil samtale-UID og valgt varighet (standard 60 minutter). Bruker åpner filen og bekrefter avtalen i egen kalender. Ved endret tidspunkt må kalenderavtalen oppdateres av bruker. Ingen kalenderkonto tilkobles eller automatisk kalenderbooking. Filen inneholder generell møtetittel og applenke, ingen private innspill/personnavn/firma. Sommer-/vintertid, første gjentatte høstklokkeslett, ugyldig vårklokkeslett, dato, varighet, CRLF/UTF-8-linjebryting og sen tilgangsendring er testet. RFC 5545 brukes for formatet.

Når medarbeideren deler forberedelsen eller lagrer en endret egen kommentar til referatet, får gjeldende HR-leder en generell e-post når transport er aktivert. Private ikke delte forberedelser og lederens egne kommentarer varsler ikke. Nyere usendt innspill erstatter behovet for et eldre usendt varsel. Kommentar/svar leses i appen; ingen tekst/personnavn/firma/diagnose tas med i e-posten. Fersk mottaker, HR-rettighet, aktivt arbeidsforhold, lease og idempotency kontrolleres før provider-kall. Sandbox-mail forblir AV.

Scope: HrConversations/session/CSS, ny kalenderformatter, avgrenset utvidelse av eksisterende HR-mailworker, én migrasjon og HR-QA/Hjelp/docs. To eksisterende funksjoner endres: samtalekommandoens etterlagringsvarsel og eksisterende cron-invoker. Åtte funksjoner legges til; møte-/kommentarinnhold, originale CAS/rolle-/delings-/bekreftelses-/slettekrav og gammel fristworker beholdes. Påminnelsesvalget endrer ingen innholdsbetinget bekreftelse. Ingen meny/Sales/konto/firmaendring.

QA: PostgreSQL 172, faktisk React 63, samtale/session/kalender/PDF/mail 100 og sykefravær/session/PDF/mail 134 assertions PASS. Full critical/build PASS. Faktisk Sandbox rollback-QA 22 PASS, uten network/provider-dispatch. Production får samme kilde-/rollback-/fingerprintkontroll før merge. Eksakt CI/READY/SHA og main → demo-preflight føres i PR. Faktisk mottak i innboks og kalenderimport i brukerens kalender må bekreftes av bruker; Kenneth ba deretter uttrykkelig om en test til egen adresse og valgte jobbkontoen. Én tydelig merket test er provider-akseptert kl.23:02 Oslo (HTTP 200, attempts=1); ingen samtale opprettet eller endret. Testen bruker service-only exact-ID-reservering og egen negativ outbox-bucket som vanlig cron ikke kan hente. Inbox-mottak er ikke bekreftet av utvikleren. Tidligere TEST OK beholdes.

## Produksjonspublisering uttrykkelig godkjent – 11. oktober 2026 kl. 22:24 Europe/Oslo

Kenneth: «får ikke testet epost på preview så send det til produksjon». Dette er eksplisitt autorisasjon til Production uten ny innlogget Preview-e-postprøve og overstyrer tidligere prøvekrav for denne invitasjonsendringen. Ingen faktisk invitasjon sendes av utvikleren: bruker klikker Send e-postinvitasjon på sin lagrede samtale når publiseringen er verifisert. Critical QA/CI, Production-migrasjon/worker, publiserte assets og kontrollert main → demo gjennomføres før oppgaven regnes som publisert. Faktisk mottak i innboks bekreftes bare av bruker.

## Bekreftelse og manuell e-postinvitasjon – 11. oktober 2026

Miljømål BEGGE; ny kort Preview-prøve kreves før Production og main → demo. Tidligere TEST OK for klokkeslett/HR/kart beholdes. Etter Opprett samtale lukkes og tømmes opprettingsskjemaet, og Samtalen er opprettet får fokus med lagret dato/klokkeslett og separat app-/e-poststatus. Mistet opprettingssvar gjenbruker samme samtale-ID, også ved intern remount. Samtalen slettes ikke ved feil i e-poststatus.

Nærmeste leder bruker **Send e-postinvitasjon** på en lagret samtale i forberedelse, også en tidligere opprettet samtale. Opprettelse alene sender ingen invitasjon. Medarbeideren får en åpen forberedelsesoppgave på Min side. Invitasjonen har faktisk dato/klokkeslett i norsk tid og forklarer hvordan medarbeideren åpner og deler forberedelsen. Ingen svar, personnavn, firmanavn eller diagnose følger e-posten. Ingen kalenderbooking. Eldre samtale må ha klokkeslett før sending. Gjentatte klikk for samme medarbeider/samtale/dato/klokkeslett bruker samme private leveringsrad og provider-idempotency. Nytt tidspunkt får separat invitasjon; endret tidspunkt/tilgang eller delt forberedelse stopper gammel ventende utsending.

Status skiller disabled/not_queued/pending/sending/sent/failed/suppressed. «Sendt» er provider-aksept lagret på serveren, ikke attestert mottak i innboksen. Sandbox-mail forblir deaktivert; der vises knappen og tydelig avslått-status. Ingen ekte samtale eller virkelig mottaker er endret/sendttestet.

Scope: HrConversations, samtale-session/CSS, HR-forberedelsesoppgave, eksisterende hr-followup-reminders-transport, Hjelp, én additiv migrasjon og relevante QA/docs. Ingen nye tabeller/tokens/cron, ingen andre moduler, navigasjon, kontoer eller firmatilganger. Tre eksisterende HR-funksjoner endres og seks tilgangskontrollerte funksjoner legges til. Fristworker beholder kontortid; eksplisitt invitasjon kan sendes når leder klikker. Ingen Production-endring før relevant TEST OK.

QA: 136 PostgreSQL-assertions, 55 faktiske React-assertions, 81 samtale/session/PDF/slettemail og 94 sykefravær/session/PDF/frist-/invitasjonmail PASS. Eksisterende sykefravær SQL 83 PASS. Faktisk Sandbox rollback-prøve: 31 assertions PASS, uten network/provider-dispatch. Alle ni funksjonskilder matcher migrasjonen. Øvrige funksjoner, policies, triggere, tabeller, profiler, medlemskap, modulrettigheter og beskyttede worker-innstillinger er uendret før/etter. Bare to forventede advisor-notiser for eksplisitt autoriserte authenticated-definer-RPC-er legges til; performance-notiser uendret. Register/Min side og full critical/build verifiseres før publisering. Innlogget brukerprøve, faktisk Production-utsending og mottak i innboks attesteres ikke av disse testene.

Kort brukerprøve på fast Preview: Åpne lagret samtale som nærmeste leder → Send e-postinvitasjon. I Sandbox skal utsending være tydelig avslått. Ved ny samtale skal opprettingsskjemaet lukkes og Samtalen er opprettet vises med tidspunkt. Eksakt CI/READY/SHA og status føres i PR.

## Klokkeslett publisert – godkjent TEST OK 11. oktober 2026

Kenneth TEST OK kl. 21:39 Europe/Oslo godkjenner klokkeslett i medarbeidersamtaler. Feature `03bec590f3bd0396c63fc6b347e33c3428d13a04` er merget i #224 som `eaeb06d475d3134869505c4f12ea56f96c855f2f`. Ready-for-review Core Safety run `38168965204`, job `114557343986`: alle steg SUCCESS. Production `dpl_Aa7RUMwwmsgwuA9HitLEyeidnpWx` READY på https://expo-proffdok.app. Ingen ny innlogget Production-prøve attesteres; Kenneths Preview-prøve og live backend-/assetkontroller er separate bevis.

Nye samtaler krever Klokkeslett i norsk tid; nærmeste leder kan endre dato/tid i forberedelse/felles møte. Tidspunktet vises for begge parter og i PDF. Eldre samtaler har ingen oppdiktet tid. Hjelp er oppdatert. Ingen kalender-/e-postinvitasjon innføres.

Migrasjon `hr_conversation_meeting_time` er installert i Sandbox og Production. 21 faktiske rollback-assertions PASS i hvert miljø; alle tre funksjonskilder matcher eksakt. Bare listekroppen er endret og start_at/schedule lagt til. Øvrige funksjoner, profiler, medlemskap, policies, triggere, modulrettigheter og beskyttede worker-innstillinger er identiske før/etter. QA: PostgreSQL 100, React 44, session/PDF/mail 73, sykefravær 68 samt register/Min side og full critical/build PASS. Fersk PDF visuelt kontrollert. Kontrollert main → demo-synk, gjeldende main-baseline og 24 faktiske Sandbox-preflightpunkter føres i PR #224 etter ferdig publisering. Tidligere TEST OK beholdes.

## Godkjent Production-release #222 – 11. oktober 2026

Kenneths «flott test ok» kl. 20:49 Europe/Oslo godkjenner også logo og midtstilt, tilpasset PDF-tekst. Tidligere TEST OK for HR, firmanavn, felles kart og linjer/lederplassering beholdes. Eldre «venter», «draft» og prøvekrav nedenfor er daterte arbeidsnotater.

Godkjent feature `2d0ae997797f3f737e30778c2d6d4910ff3bedf9` er merget som `e466c5603f745081d00a8964e752bb4f6f76b36b`. Production `dpl_5uuswoKpL4NYvVkMH94Hjrq2eALT` er READY på https://expo-proffdok.app. Obligatorisk Core Safety etter ready-for-review: run `38166319985`, job `114549510315`, alle steg SUCCESS. Ingen ny innlogget Production-prøve attesteres; Kenneths Preview-prøve og utviklernes backend-/assetkontroller er separate bevis.

Alle seks godkjente migrasjoner er installert i Production: sykefraværssaker, fristvarsler, referanseindeks, worker-scope, firmavisningsnavn og felleskart/rekkefølge. 22 + 12 + 36 faktiske rollback-prøver PASS. Alle 23 funksjonskropper matcher godkjent SQL. Bare åtte avtalte eksisterende org-funksjoner er endret; 15 funksjoner og tre private RLS-tabeller er lagt til. Eksisterende policies, triggere, medlemskap, profiler, modulrettigheter og andre worker-innstillinger er uendret. Nye advisor-notiser gjelder tilsiktede private RLS-tabeller uten direkte klienttilgang, tilgangskontrollerte definer-RPC-er og to nye foreløpig ubrukte indekser; ingen nye manglende FK-indekser.

HR-fristworker `hr-followup-reminders` v1 er ACTIVE og aktivert med egen Vault-autentisering og minutt-cron. Utsending skjer i Oslo-kontortid, tre dager før, på frist og ukentlig etterpå for aktuelle åpne oppgaver; endret ansvar/tilgang kontrolleres på nytt. Anonym GET=405/POST=403. Serverautentisert tom-kø-prøve ga 200 `{idle:true}`, uten testmail eller providerkall. Dette er ikke bevis på mottatt fristmail. Tidligere mottatt slettevarsel skal ikke gjentas.

Kenneth, Tom og Kim har hver firmaadmin i de tre avtalte firmaene, med eksisterende kontoer og primærfirma beholdt. KS/HMS er aktivert i Expo Proffsenter. Ingen ny registrering eller invitasjon. Faktiske firmavisningsnavn og organisasjonskart bygges av brukeren i Production; utvikleren har ikke skrevet et virkelig personal-/kartoppsett.

Miljømål BEGGE. Permanent demo synkroniseres kontrollert kun main → demo, med egen Sandbox og bevart overlegg. Kurs-/preflight- og endelig demo-publisering dokumenteres separat på demo-branch og i PR #222. Ingen demoressurs eller syntetisk identitet skal tilbake til main.

## Midtstilt og tilpasset PDF-tekst – 11. oktober 2026

Miljømål **BEGGE**, først samme feature/Preview. Nytt kosmetisk tillegg gjelder organisasjonskartets PDF: firma-/avdelingskort, avdelingsoverskrifter, ledertekst og alle medarbeiderkort har midtstilt tekst. Navn/avdeling bruker inntil 18–20 pt, medarbeidernavn inntil 15 pt og tilhørende tekst inntil 12 pt. Brede/korte tekster vokser til feltets maks; lange tekster reduseres til en lesbar minste størrelse og brytes deretter fullstendig. Kort-/rad-/nivåhøyde beregnes fra faktisk tekst og skriftstørrelse. Rapporteringens eksisterende innrykk beholdes, med tekst sentrert i sitt kort. Logo og ferske profil-/kart-/tilgangskontroller beholdes.

Den gamle PDF-posisjonsprøven forventet tekst på kortets venstrekant +6 mm. Ny forventning er den uendrede midtkortaksen x=210 mm med align=center. Ordens-/linje-/tilgangs-/logoassertions beholdes. Nye faktiske jsPDF-prøver kontrollerer større korte navn, mindre lange navn, full tekstbryting, sentrum/bredde/høyde mot tegnede kort og bevaring av alle medarbeidere/dype grener. Ny brukerprøve er kun **Last ned PDF** og tekst/logo; tidligere godkjente HR-/kart-/tilgangsprøver skal ikke gjentas. Preview/CI-bevis og eksakt SHA føres i PR #222. Ingen ny backendendring. Production/main/demo venter på relevant TEST OK etter AGENTS.md punkt 10.

Faktisk jsPDF med små/store og dype kart PASS: tekstens senter og mål er kontrollert mot faktiske tegnede kort, alle navn/grener beholdes, og flersidige dokumenter beholder logo. Nye PDF-sider med kart, medarbeiderkolonner og smale/dype grener er visuelt kontrollert. Faktisk kart-React, permanente eksisterende guards og full Sandbox critical/build PASS. Dette er utviklerprøver med syntetisk innhold; innlogget ny eksport venter på brukerens korte Preview-prøve.


## Firmalogo i organisasjonskartets PDF – 11. oktober 2026

Miljømål **BEGGE**, først samme feature/Preview. Kenneths siste **TEST OK** gjelder linjer og lederplassering og beholdes. Nytt tillegg: **Last ned PDF** bruker eksisterende `work_profile_company_profile` for aktivt firma, også ved felleskart. Logoen gjentas i et hvitt felt øverst på hver A3-side med bevarte proporsjoner. Kartets toppnavn beholdes. Ingen nytt logo-register eller backendendring.

Profilens firma og logo kontrolleres på nytt, og kart-/tilgangskontrollen etter lasting beholdes. Endret logo/firma, navigasjon eller tilbakekalt karttilgang stopper levering. En utilgjengelig logo gir lesbar PDF og en tydelig melding om at logoen mangler. Hjelp beskriver samme kontrakt uten kundespesifikke navn. Ny brukerprøve gjelder bare **Last ned PDF** og logoen; tidligere HR-, kart- og tilgangsprøver skal ikke gjentas. Release av dette nye tillegget venter på relevant Preview-prøve etter AGENTS.md punkt 10.

Faktisk jsPDF med eksisterende Ringside-PNG: logo på alle sider, proporsjoner og headergrenser PASS; ferske PDF-sider er visuelt kontrollert. Endret/fremmed/offline firmaprofil, navigasjon, tilbakekalt tilgang og manglende logo er prøvd. Faktisk kart-React, permanent kart-critical og full Sandbox critical/build PASS. Dette er utviklerprøver med syntetisk kart, ikke en attestasjon av innlogget nedlasting. CI/READY og eksakt publisert SHA føres i PR #222.


## Kartets linjer og lederplassering – 11. oktober 2026

Miljømål **BEGGE**, først samme feature/Preview. Kenneth ga **TEST OK** for eksisterende løsning og ba deretter om å fjerne markerte overflødige streker, gjøre forbindelsene tykkere og sentrere ledere. En enkelt gren får bare loddrett forbindelse. Felles tverrlinje stopper på midten av første/siste kort; ingen strek går utenfor grenene. Skjerm bruker 3 px og PDF 0,65 mm. Leder/mellomleder-kort har felles midtakse uten dybdeinnrykk, og navn/stilling er sentrert. Ordinære medarbeideres rapporteringsinnrykk beholdes. Kortrekkefølge, HR-leder, lagring og tilgang følger uendret kontrakt.

Faktisk React med syntetisk RPC, eksisterende kart-critical og full Sandbox critical/build PASS. Faktisk jsPDF/paginering/fersk tilgang PASS; tegnede forbindelser bekrefter én tverrlinje mellom de tre ytteraksene, ingen horisontal strek for Styret alene og felles midtakse for leder/mellomleder. Fersk PDF-side er visuelt kontrollert. Skynettleseren viser innlogging; lokal syntetisk nettleserprøve kunne ikke åpnes, så ingen innlogget/visuell browser-PASS påstås. Tidligere TEST OK beholdes. Ny brukerprøve er kun å se linjene/lederkortene i **KS/HMS → Organisasjonskart**, gjerne også **Last ned PDF**; gamle HR-/tilgangsprøver skal ikke gjentas. Production/main/demo er ennå ikke oppdatert med disse kosmetiske kodeendringene.

Separat, uttrykkelig autorisert Production-tilgang er utført for Kenneth, Tom og Kim: eksisterende kontoer har firmaadmin i Ringside, Bademiljø Expo og Expo Proffsenter. KS/HMS er aktivert for Expo Proffsenter. Alle ni tilganger og appens faktiske kartvalg fra Ringside er kontrollert. Primærfirma Ringside, profiler og andre brukeres medlemskap er bevart. Dette er vanlig firmaadmin, ikke en ny delegert kartrolle. Ingen ny kartadmin-migrasjon, invitasjon eller duplisert konto er laget.

## TEST OK og generell veiledning – 11. oktober 2026 kl. 19:42 Europe/Oslo

Miljømål **BEGGE**. Kenneth har gitt **TEST OK** også for felles lesetilgang og sentrert kart. Tidligere HR/navn/kart-prøver er godkjent og skal ikke gjentas. Spørsmålet om hvem som ser eksemplene avdekket at Ringside-navn var lagt inn i felles veiledning og organisasjonskapittelet i Hjelp uten firmabegrensning. Disse eksemplene er erstattet med generelle navn/nivåer og venstre/midt/høyre. Hjelps oppdateringsdato er satt til 11.10.2026. Ingen kartnavn, avdelingsnavn, firmadata, tilgang eller lagringsflyt endres.

Rettelsen er tekst/placeholder og har ingen ny obligatorisk brukerprøve. Eksisterende faktisk React-kontroll krever nå generisk veiledning og fravær av andre firmas eksempler på et urelatert firmakart; alle eksisterende dataplasserings-/rettighetsprøver beholdes. Brukerens egne kartnavn vises fortsatt fra den autoriserte kartresponsen. Øvrige Hjelp-kapitlers omtale av leverandør/vareregister/produktmerke er utenfor denne kartrettelsen.

## Felles kart og sentrerte grener – 11. oktober 2026

Miljømål **BEGGE**, feature/Preview + Sandbox. Kenneths **TEST OK** på HR, firmavisningsnavn og forrige kartleveranse er registrert og beholdes. Nytt scope gjelder bare kartets felles lesetilgang og plassering.

Ett kart opprettes for de tilknyttede firmaene. **Vis hele kartet for brukere i hvert tilknyttet firma** åpner hele kartet for aktive brukere med KS/HMS i ett tilknyttet firma. Dette er uttrykkelig opt-in: eksisterende kart har uendret begrenset visning. Redigering/opprettelse krever fortsatt firmaadmin og KS/HMS i alle firmaene. Én tilgjengelig delt organisasjon åpnes automatisk; et bevisst valg av firmakart huskes. Ingen HR- eller medlemskapsrettigheter endres.

**Rekkefølge fra venstre** lagres på kortene: Expo Proffsenter 1, Ringside Rørleggerbedrift 2, Bademiljø Expo 3. Alle tre legges under Styret. Like brede grenfelt sentrerer det midterste kortet under Styret/Ringside AS. PDF bruker samme rekkefølge. Hjelp forklarer både oppsett og tilgang.

QA: 36 nye faktiske Sandbox-rollback-assertions PASS, også med én firmatilgang i hvert av de tre firmaene. 340 eksisterende funksjoner uendret; bare de åtte godkjente org-funksjonene endret. Ingen nye security-advisor-funn. Lokal PostgreSQL: 63 + 33 + 64 eksisterende og 36 nye PASS. Faktisk React, faktisk PDF-drawing/fersk tilgang og full Sandbox critical/build PASS. Nettleserinnlogging til flerfirmaflyt er ikke attestert. Ingen aktive kart, Production-innstillinger eller ekte medarbeiderdata er endret.

Fast Preview: https://expo-proffdok-git-fase45c-hr-sickleave-20261011-ringside.vercel.app/?progressTest=safe . Bare ny kartprøve: **Rediger kart → Vis hele kartet … → Lagre kart**, og rekkefølge 1/2/3 via **Rediger / flytt → Bruk endring → Lagre kart**. Kontroller samme felleskart med en konto som har bare ett tilknyttet firma. Tidligere HR/navn/mail-prøver gjentas ikke. [Kontrakt og QA](docs/kshms/ORGANIZATION_SHARED_20261011.md).

## Ny Preview: HR-oppfølging, firmavisningsnavn og organisasjonskart – 11. oktober 2026

Miljømål **BEGGE**. Draft PR #222 viderefører sykefraværsoppfølging og ansvarliges HR-frister. Kenneth ba også om redigerbart firmanavn, Ringside AS øverst, Styret med daglig leder/driftssjef/andre stillinger og tre underavdelinger. Firmaprofil får **Endre firmanavn → Lagre firmanavn**. Stabil firma-ID, medlemskap, kontakter og historiske dokumenter beholdes. Prosjektlisten bruker firma-ID for å tåle navnebytte. Karttopp og avdelingsnavn lagres separat med **Rediger kart → Lagre kart**; lederplasseringer vises også på lukkede kort.

**Hjelp er oppdatert i denne Preview**, med egne A–Å-kapitler for medarbeidersamtale og sykefravær. Nytt felles kart krever firmaadmin og KS/HMS i minst to registrerte firmaer. Kenneth har ett kvalifisert firma i Production; tre underavdelinger kan bygges i firmakartet. Personnavn krever aktive registrerte appbrukere; kartstillinger gir ikke HR-tilgang.

Full Sandbox/Production critical/build PASS. Navn: 22 DB + 14 faktiske React + 11 prosjektidentitetsprøver PASS, berørte kart-React PASS. 12 faktiske Sandbox-rollback-kontroller inkludert prosjekt-trigger/RLS PASS; fixtures rullet tilbake. Skynettleseren viste innlogging, så ingen ny innlogget browserprøve påstås. Production-navn og kart er ikke endret. Tidligere TEST OK og mottatt slettevarsel beholdes; ingen gamle tester eller mail skal gjentas.

Fast Preview: https://expo-proffdok-git-fase45c-hr-sickleave-20261011-ringside.vercel.app/?progressTest=safe . Ny, kort prøve: åpne **Firmaprofil**, prøv navneknappene i Sandbox; åpne **KS/HMS → Organisasjonskart**, les opprettelsesvilkåret og kontroller lederstillinger; åpne **Hjelp → HR** og de to nye kapitlene. Personlig sykefravær prøves bare med syntetisk innhold og riktig leder/medarbeider. Kenneths Hotmail-testkonto finnes bare i Production og skal ikke kopieres. Relevant ny **TEST OK** følger AGENTS.md før merge/Production; dette er ikke omtest av #220. Scope, arbeidsflyt, brukerprøve og bevis: [HR_SICK_LEAVE_CASES_20261011.md](docs/kshms/HR_SICK_LEAVE_CASES_20261011.md).

## Gjeldende HR-release – 11. oktober 2026

Kenneth fylte ut egen post og ga **TEST OK 11. oktober kl. 17:10 Europe/Oslo** for PR #220. Godkjenningen er fullført; gamle testkrav nedenfor er historikk og skal ikke gjentas. PR #220 er merget til main **6b557c71f97cfecd7114b61883c964a3aaa88c25**. Production **dpl_99mBYYt27bMJiSZ4KSyPcGVTB9Ad READY** på expo-proffdok.app er kontrollert innlogget som Kenneth: Startside, eksisterende meny og HR laster.

**HR-kontakt og individuelle medarbeidersamtaler er åpne i Production**, med versjoner, medarbeiderens private forberedelse, uttrykkelig deling, leders møtereferat, personlige bekreftelser og PDF. Systemadministrator får et minimalt varsel når arbeidsforhold avsluttes. HR-varselmail er aktiv. Ringside må selv fylle ut formål, behandlingsgrunnlag og kontrollfrist under HR → Oppsett og kontrollfrist og aktivere sitt register før virkelige medarbeidere legges til. Ingen reelle personalposter er opprettet av agenten.

Den godkjente leveransen bruker eksisterende Supabase. Ingen ny betalt ressurs. Automatisk ekstern sletteloggbok i draft #217 er separat og ikke aktivert. Individuelle sykefraværsplaner og HR-filopplasting er ikke levert i #220. Restore krever manuell lukket rutine beskrevet i [HR_CONVERSATIONS_20261011.md](docs/kshms/HR_CONVERSATIONS_20261011.md); fysisk PGlite-restore er ikke attestasjon av managed cloud-restore.

Production: begge migrasjoner og hr-deletion-alerts-worker er installert og lest tilbake mot godkjent kilde/ACL/search_path. Alle 17 nye funksjoner matcher. De beskyttede eksisterende funksjonene, RLS-policyene og triggerne har identiske før/etter-fingeravtrykk. 32 nye rollback-kontroller PASS; syntetiske SQL-fixtures er borte. Core Safety **38150427087 / 114502564630 SUCCESS**. Servertransport gir HTTP 200. Én autorisert syntetisk testmail til **kenneth@ringside.no** er godkjent av Resend (sent, ett forsøk); mottak i innboks er ikke uavhengig attestert. Ingen virkelig medarbeider ble avsluttet. Den syntetiske varsel-/leveringsraden beholdes i audit og er markert lest; ingen ventende jobb.

Miljømål **BEGGE**. Kontrollert main → demo følger samme godkjente funksjon. Sandbox-kurskontrakten er bevisst oppdatert fra stengt samtaleport til åpne samtaler, med separat kontroll av begge avslåtte e-posttransportene og syntetisk medarbeider/leder. 19 eksisterende demokontroller + 4 kurskontroller PASS, ny negativ rollback-QA og faktisk samtale-React (38 assertions) PASS. Demoens fiktive møtekladd har ingen forhåndsbekreftelser. Eksisterende kontaktutfylling beholdes. Endelig demo-head/deploy føres i demoens releaseavslutning og PR #220. Demo-overlay og syntetiske migrasjoner skal aldri til main.

## Rettet HR-prøveflyt – 11. oktober 2026

Kenneth meldte behov for scrolling ved neste steg og tap av åpen samtale etter PDF. Neste steg fokuseres og rulles til starten. Etter tilgangskontroll/PDF-retur gjenåpnes samme lagrede samtale, utgave og fane fra scoped navigasjon i denne nettleserfanen. Ny/lukk/slett respekteres. Faktisk React og Chromium-regresjon PASS; PDF-format og beskyttet kjerne uendret. Publiseres på samme PR #218 / faste Preview, uten ny godkjenningsrunde for tidligere områder. [Bevis](docs/kshms/HR_PRACTICE_20261011.md).

## HR-prøvesamtale i eksisterende Sandbox – 11. oktober 2026

Ny isolert branch `fase45b-hr-conversation-practice-20261011` fra ren main. Brukeren kan prøve eksempeltekster, fire samtalesteg, lokal lagring/gjenåpning og PDF med egen konto. Ingen nye nøkler eller testmiljøer. Production viser ikke prøveflaten. Personlig HR forblir stengt. Tidligere ledger/workerarbeid står separat i draft PR #217.

Ny faktisk React-/Chromium-/PDF-/samtidighetskontroll, berørte eksisterende HR-flyter og full Sandbox/Production critical/build PASS. Bare ny kort vurdering av arbeidsflyten gjenstår hos Kenneth. Ingen gammel godkjenning eller testmail skal gjentas. [Scope, bevis og grenser](docs/kshms/HR_PRACTICE_20261011.md).

Kanonisk main/Production er `c3d873e0e5bd2677f0205143de6edc1fbd95ae4c` (READY), demo `11f1b45dac4daa08efc850ba87ad5e28522dad4c`. Ingen merge eller endring av disse i denne leveransen. Eldre daterte avsnitt nedenfor er historikk, ikke nye utestående krav.

## Godkjent release til Production og kursdemo – 10. oktober 2026

## Separat navigasjonsretting – 11. oktober 2026

Miljømål **BEGGE**. Ren core-branch `fase45b-core-navigation-resume-20261011`, baseline main `c3d873e0e5bd2677f0205143de6edc1fbd95ae4c`. HR-ID/tillatt KS/HMS-fane bevares over tilgangsremount; uttrekksarbeidsflate bevares over interne fanebytter med gamle eksporter avbrutt. Ingen samtaleøvelse fra PR #218, backend/mail/SQL eller main/demo-endring. [Scope og QA](docs/kshms/NAVIGATION_RECOVERY_20261011.md). Eksakt publisert kode/CI/Preview føres i den nye core-PR-en; innlogget Preview og eksplisitt TEST OK gjenstår før merge.

Kenneth har godkjent releaseløpet med «Kjør», mobiltilpasning og eksempelinnhold for kurs. Miljømål: **BEGGE**. Eldre avsnitt om manglende Production-godkjenning er historiske.

Production har alle 54 migrasjoner og begge nye serverarbeidere. 146 relevante funksjonsdefinisjoner samsvarer med Sandbox. Faktiske Production SQL-prøver består: håndbok, 73 avvikskontroller, 93 SJA/RUH, 27 sjekkliste, 54 utførelse, 95 samtalemal og 64 organisasjonsgruppekontroller. Alle syntetiske rader er rullet tilbake. Reelle profiler/prosjekter/Sales-saker er uendret i antall. Ingen automatisk modulaktivering for reelle firmaer.

Production-transport er konfigurert og aktivert fra tom kø; Sandbox-transport forblir avslått. Personlig HR-innhold er fortsatt sperret. Mobiltilpasning inkluderer én kolonne på smal skjerm og lagringsfelt i vanlig dokumentflyt under 500 px skjermhøyde. Fysisk mobil-/kameraprøve og faktisk mottak av én autorisert testmail er ikke attestert.

Merge og main → demo pågår etter grønn CI. Se [releasekontrollen](docs/kshms/RELEASE_20261010.md) for installasjon, QA og konkrete begrensninger. Demoens kursdata holdes på demo/Sandbox.

## HR: tydelig hjelp der du arbeider – 10. oktober 2026

Synlig **Start her** viser oppsett → medarbeider/leder → samtalemal for firmaadmin, og relevant lesehjelp for leder/personlig bruker. Malbyggeren forklarer velg → tilpass → forhåndsvis/lagre, navn/tema/spørsmål, forberedelse/felles møte, kladd/Forkast og utgave/arkiv. En lagret mal starter ingen samtale og sender ingenting til ansatte. Bare presentasjon/hjelp; handlinger, roller, SQL og privat innholdsport beholdes.

Berørte faktiske HR-/mal-/Hjelp-React-prøver og full Sandbox critical/build PASS. Eksisterende tester beholdt uten nye speiltester. Miljømål BEGGE, bare feature/Preview; tidligere TEST OK beholdes. [Scope og bevis](docs/kshms/HR_HELP_20261010.md). CI/innlogget visuell Preview kontrolleres etter publisering.

## HR: versjonerte samtalemaler – 10. oktober 2026

Firmaadmin får **HR → Samtalemaler**: årlig medarbeidersamtale, prøvetid og oppfølging, egne tema/spørsmål, medarbeiderforberedelse/felles møte, forhåndsvisning og tydelig **Lagre mal**. Immutable malutgaver, historikk, gjenbruk som ny kladd, arkivering/gjenåpning, paginering og avvisning av samtidige revisjoner. Kladd beholdes i midlertidig aktør-/firmabundet minne over fokus/remount, først etter fersk admin-tilgang. Ingen ansattes svar, personreferater, signaturer eller fraværsinnhold åpnes.

**91 nye faktiske rollback Sandbox-assertions PASS**, samme 91 i fysisk PostgreSQL/PGlite med syntetisk plattformadapter. Faktisk ny mal-React og berørt HR/register/KS-meny/Hjelp-React PASS; permanent critical og full Sandbox build PASS. Fem live funksjonskropper matcher lokale MD5-er, tomt search_path og riktige ACL. Sandbox-migrasjon **20261010005833**, CLI **20261010004928**. Eksisterende 1 HR-firma/1 medarbeider beholdt; 0 aktive utviklermaler/utgaver/artifacts/filer/receipts. Privat innhold fortsatt content=false/restore quarantined. Første live prøving ble korrekt avvist av eksisterende profile-guard under endring av egen syntetisk aktør; fixtureoppsettet ble korrigert til eksisterende systemaktør, uten endret guard eller produktkode. Hele første prøve rullet tilbake.

Miljømål **BEGGE**, bare feature/Preview/Sandbox, draft PR #216. Tidligere O3/B/C/PDF/ZIP og Kenneth TEST OK beholdes; ingen Production/main/demo/e-post. Uavhengig varig manifest/automatisk eksport og DB-ack/full isolert Supabase database- og Storage-restore gjenstår før privat HR-kontakt og individuelle samtaler/fravær åpnes. [Scope, kontrakt og nye bevis](docs/kshms/HR_TEMPLATES_20261010.md).

**Faktisk mal-Preview-kontroll:** kode `70f12015b616e8e9b4c6e0efc06d82ab4e6df1ef`, Core Safety **38011669656 / jobb 114092844672 SUCCESS**, `dpl_6QTL7UM5H55ek25V7mrsqkEdyPys` READY med eksakt SHA/ref/prosjekt/fast alias. Direkte branch-env `EXPO_BACKEND_TARGET=sandbox`. Innlogget desktop: HR/admin, tre forslag, generisk kladd/redigering, tom forhåndsvisning, dirty bytte/Behold kladden, Oppdater maler med bevart kladd og Forkast PASS. Ingen testmal lagret. Ingen horisontal overflow; Lagre mal 44px. Lagret historikk/arkiv/CAS har SQL og React-bevis; mobil og separate samtidige browserøkter gjenstår. [Originalbilde og presise bevis](docs/kshms/HR_TEMPLATES_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

**Faktisk O3 Preview-kontroll:** kode d4b5270e916dc06a764fbd35af36a8db6f238470, Core Safety 38009716896/jobb114086648809 SUCCESS, dpl_GKkbK6sdQd5si4yqYpeEd44NomJx READY eksakt SHA/Sandbox. Innlogget Skynett: ny kartvelger/bevart enkeltfirmakart/fokusretur/PDF to sider/fire demonavn PASS. Nytt felles kart er riktig skjult for demo uten to kvalifiserte firmaer; flerfirmahandlinger har SQL/React-bevis, ikke nytt browserbevis. Ingen aktiv rettighets-/kartendring. [Originalbilde og presise bevis](docs/kshms/ORGANIZATION_GROUPS_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

## Organisasjonskart O3 – felles kart for flere firmaer, 10. oktober 2026

Miljømål **BEGGE**, leveres bare feature/Preview og Sandbox. Et separat felles organisasjonskart kan knytte **2–10 firmaer** sammen. Én brukerkonto kan ha forskjellig stilling og plassering i hver firmagren. Opprettelse lager Styret og sideordnede firmagrener; toppnavn og struktur kan redigeres med **Lagre kart**, og hele kartet kan slettes med uttrykkelig bekreftelse. Firmautvalget er fast i denne første versjonen. Eksisterende firmakart, brukere og HR beholdes.

**Hele felleskartet krever fersk KS/HMS i alle firmaene; redigering krever firmaadmin i alle.** En kartleder gir ingen ekstra redigering eller HR-innsyn. En bruker med ett firma ser sitt vanlige firmakart. Firmamedlemskap, avsluttet arbeidsforhold, tilbakekalling, firmagrense og revisjon kontrolleres på serveren ved hver handling. Ingen automatisk konto-/medlemskapsopprettelse eller modulaktivering.

**64 nye faktiske rollback Sandbox-assertions PASS**; fysisk PostgreSQL/PGlite **63 + 33 + 64 PASS**, faktiske nye/berørte React-flyter, permanent critical og full Sandbox build PASS. Felles PDF: **49 syntetiske personer / 51 firmaplasseringer / fire A3-sider**, alle tekst- og visuelt kontrollert. Samme person har tre ulike stillinger i tre firmaer. Dette er utviklerbevis, ikke nytt innlogget flerfirma-browserbevis. Sandbox-migrasjon **20261010002710** (CLI 20261010001921), ni live funksjonskropper/ACL/tomt search_path verifisert mot kilden. Ingen aktive felleskart opprettet, rettigheter utvidet eller HR-innhold åpnet.

[Scope, knapper, sikkerhetsprøver og presise bevis](docs/kshms/ORGANIZATION_GROUPS_20261010.md). Kenneths tidligere TEST OK/B/C/PDF/ZIP/SJA-bevis beholdes uten gjentatt omtest. Ingen main/demo/Production eller e-post. Privat HR-kontakt/samtale/fravær fortsatt stengt; uavhengig driftsmanifest/ack og isolert Supabase-restore gjenstår før åpning. Mobil, separate samtidige browserøkter og belastningstest på isolert database gjenstår som egne bevis.

**Feature/Preview 10. oktober – kartredigering:** eksplisitt Lagre kart, synlig redigering/flytting/sletting, frie toppnavn og tydelig tre. 33 nye + 63 berørte Sandbox assertions, faktisk React og fire syntetiske PDF-sider kontrollert. Flerfirma-Ringside-kart er avklart eget neste scope før deres Production. [Scope og bevis](docs/kshms/ORGANIZATION_EDITOR_20261010.md). Ingen Production/main/demo/e-post.

**Feature/Preview 10. oktober:** Organisasjonskart under KS/HMS, også uten HR-avtale: avdelinger, stillinger, lærlinger og egen PDF. 63 Sandbox assertions, berørt H1/H3 75/61, faktisk React og visuelt kontrollert syntetisk PDF PASS. Privat HR fortsatt stengt; ingen mail/merge/Production. [Scope og bevis](docs/kshms/ORGANIZATION_SCOPE_20261010.md). Skynett: faktisk kartvisning/dialog/fokusretur og PDF-nedlasting kontrollert på kode 0b638fc27d0b987cb61a54fc439727b4d03b5325; Core Safety 38005156679 SUCCESS, eksakt READY Preview/Sandbox. Originalbilder og kontrollgrenser er lagret i scope-dokumentet.

**Feature/Preview 10. oktober:** Kenneth TEST OK for KS/HMS-/HR-layout er mottatt. H5a gir privat slettemanifest-adapter med 38 lokale feil-/samtidighetsscenarioer og faktisk versjonslåst SDK på syntetisk HTTP; full Sandbox build PASS. Eksternt lager ikke opprettet: Vercel 403 forbidden. Privat HR fortsatt stengt; driftsbinding/DB-ack og isolert Supabase-restore gjenstår. [Scope og konkret blokkering](docs/kshms/HR_CLOUD_LEDGER_20261010.md). Ingen main/demo/Production eller e-post.

**Feature/Preview 9. oktober:** Min side og HR-tekstforslag er utviklerverifisert; privat adresse/pårørende fortsatt bak lukket HR-port. [Avgrenset scope og bevis](docs/kshms/PERSONAL_PAGE_20261009.md). Ingen Production/main/demo-release.

## H3 og samlet Hjelp – 9. oktober 2026

Miljømål **BEGGE**, bare feature/Preview og Sandbox, draft PR #216. Hjelp har nå ett **KS/HMS**-punkt med 11 kapitler og ett **HR**-punkt; tidligere hjelpeinnhold beholdes. HR-slettefundamentet omfatter registrert innhold, versjoner, kladder, søkeuttrekk, eksporter og private filer. Tilgang sperres straks; **Slettekvitteringer** viser pågående filsletting og ferdig sletting korrekt.

**61 nye faktiske Sandbox-assertions PASS**, faktisk privat Storage-opplasting/hashkontroll/API-sletting av én syntetisk 62-bytes fil PASS, faktisk HR/Hjelp-React og full critical build PASS. Alle 16 live SQL-funksjoner og Edge v3 er lest tilbake mot kilden. Sensitivt HR-innhold og filnedlasting er fortsatt stengt, både i databasen og i Edge-koden. Uavhengig slettemanifest og full isolert backup-restore er neste sikkerhetsbevis før åpning. Sandbox har nå én firmaoppføring og én medarbeider; eksisterende oppføring beholdes, ingen sensitive data eller testrester finnes. Ingen e-post, merge eller Production. Kenneths **TEST OK for H2-menyen** er mottatt; eldre B/C/PDF/ZIP-bevis beholdes. [Scope, kontrakt og QA](docs/kshms/HR_PURGE_FILES_20261009.md).

## HR-register og smartere KS/HMS-meny – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Preview/Sandbox, draft PR #216. H2 gir eget HR-hovedvalg med firmaadmins medarbeider-/leder-/leserregister og medarbeiderens Mine oppfølginger. HR har fortsatt ingen samtale-/fraværsinnhold, filer eller eksport; full innholdspurge/restore må leveres før sensitivt innhold åpnes. Ingen firma aktivert av leveransen. KS/HMS-menyen er gruppert i Daglig arbeid, Mine rutiner og Forvaltning; eksisterende faner, snarveier og utkastbevaring beholdes.

**16 nye faktiske Sandbox-assertions PASS**, faktisk HR/meny-React og berørt håndbok/kildeforslag-React PASS, permanent hook/tilgang/revisjon/late-response-prøve og full critical build PASS. Fem HR-FK-indekser forbedrer slettestien. Skynettleseren fungerer igjen; faktisk ny layout etter publisering og eksakt SHA/CI/Preview føres i PR #216. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes uten ny obligatorisk omtest. Ingen mail/merge/Production. Neste: privat fil-/full slettekontrakt. [Scope og QA](docs/kshms/HR_UI_MENU_20261009.md).

---

## HR H1 – første sikkerhetsfundament, 9. oktober 2026

Firmabundet medarbeider-/lederregister, eksplisitte ekstra lesere, fersk tilgang og fysisk sletting av register/tildelinger er levert i feature/Sandbox. **75 faktiske rollback-assertions PASS**, permanent klientprøve og full critical build PASS; alle ti live funksjoner byteidentiske. HR er deaktivert for alle firmaer, private filer stengt og tomme. Dette er backend uten ny HR-meny, referat, fravær eller eksport. Full sletting av fremtidig HR-innhold/filbytes og restore er ikke levert. Neste: HR-registerets brukerflate, deretter privat fil-/innholdspurge før sensitivt innhold. Tidligere TEST OK beholdes; ingen ny Kenneth-prøve eller browser-PASS. Miljømål **BEGGE**, bare feature/Preview; KS-e-post fortsatt disabled. [Scope, QA og grenser](docs/kshms/HR_FOUNDATION_20261009.md). Publisert SHA/CI/Preview føres i draft PR #216.

---

## B/C-sluttkontroll og drift – 9. oktober 2026

Samlet B/C-utviklerreview er gjennomført. Alle seks påminnelsestyper er levert; tidligere TEST OK beholdes. Ny lesende Sandbox-måling og konkrete kapasitetsrestpunkter er dokumentert, uten påstand om 100-firma-lasttest. Bare dokumentasjon endret, ingen ny obligatorisk Kenneth-prøve. Neste utviklingspunkt: avklart HR-tilgang/private filer/sletting før sensitivt innhold. Faktiske fil-/mobil-/flerbrukerbevis, den ene usendte testmailen og aktivert/verifisert Production-e-post er separate releasepunkter. Miljømål **BEGGE**, levering bare feature/Preview. [Sluttstatus og drift](docs/kshms/BC_CLOSEOUT_20261009.md). Publisert SHA, grønn CI og READY Preview føres i draft PR #216.

---

## Oppgavepåminnelser – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Påminnelser følger opp ufullførte vernerunder, risiko, SJA og egne lesebekreftelser etter minst sju dager. Framtidig planlagt dato utsetter oppfølgingen. Ingen nye arbeidsfrister eller automatiske signeringer. Egen appoversikt åpner eksisterende arbeidsflater. **41 ulike Sandbox-assertions PASS**; eksisterende seks varseltyper **36 PASS**, avvikspåminnelser **37 PASS** og revisjonspåminnelser **36 PASS**. Faktisk React-appflyt og berørte kilde-/revisjonsflyter PASS; full critical/build PASS. Migrasjon 20261009171349 og Edge v7 levert, worker **enabled=false**, 0 syntetiske firma/brukere. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve. Testmailen er ikke sendt. Neste punkt: samlet B/C-sluttkontroll og drift/kapasitet før HR. [Scope og QA](docs/kshms/TASK_REMINDERS_20261009.md). Publisert SHA, CI og READY Preview føres i draft PR #216.

---

## Håndbokrevisjonspåminnelser – 9. oktober 2026

Miljømål **BEGGE**, leveranse bare feature/Sandbox. Utpekt ansvarlig får egen revisjonsoppgave og åpner eksisterende skjema uten automatisk signering. Ukentlige påminnelser bruker bare aktuell periode, med sju dagers sendepause og fersk kontroll av ansvar, dato og tilgang. **36 nye Sandbox-assertions PASS**, eksisterende varseltyper **36 PASS**, avvik/RUH-påminnelser **37 PASS** og faktisk React-flyt/kildeoppdateringsregresjon PASS. Full critical/build PASS. Migrasjon 20261009164036 og Edge v6 levert; worker fortsatt **enabled=false**, syntetiske data rullet tilbake. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve. Testmailen er ikke sendt. Neste funksjon er øvrige C-påminnelser; faktisk innlogget fil-/mobil-/flerbrukerbevis og kontrollert release gjenstår. [Scope og QA](docs/kshms/REVIEW_REMINDERS_20261009.md). Publisert SHA, CI og READY Preview føres i draft PR #216.

---

## Samlet B/C-gjennomgang – 9. oktober 2026

[OVERSIKT](docs/kshms/OVERSIKT.md) er nå en kompakt, oppdatert A–E-status; tidligere oversikt er arkivert. Underskjema, avvik/RUH-påminnelser, kildeoppdatering og ti-gruppe PDF/ZIP er registrert som levert. Gjenstående funksjonsgap skilles fra innlogget fil-/mobil-/flerbrukerbevis. Neste konkrete utviklingsscope er håndbokrevisjonspåminnelser, deretter øvrige C-påminnelser før HR. Tall/dato er dekket i faste skjemaer; generell skjemabygger legges ikke til som nytt obligatorisk krav. **45 faktiske Sandbox-RPC-assertions PASS**, kombinert React/PDF med alle ti grupper **26 / 25 sider**, ZIP **13 filer + manifest** og visuell kontroll av alle 26 sider PASS. Syntetisk transport er ikke faktisk innlogget Storage-bevis. Ingen ny obligatorisk Kenneth-prøve; tidligere TEST OK beholdes. Testmailen er autorisert, ikke sendt; transport fortsatt disabled. Miljømål BEGGE, bare feature/Sandbox. [Kravkart og bevis](docs/kshms/BC_REVIEW_20261009.md).

---

## Kildeoppdateringsforslag – gjeldende fortsettelsespunkt 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Oppfølging og revisjon har nå en samlet oversikt over nyere sentrale ProffDok-tekstforslag og vurderte utkast som fortsatt må firmagodkjennes. Sammenligningen viser firmaets tekst og forslaget felt for felt. Å bruke ett felt endrer bare dette feltet; bare **Jeg har vurdert hele tekstforslaget** flytter utkastets forslagsutgave. Egne tilpasninger beholdes. Lagre utkast og Godkjenn og publiser er separate handlinger. Gjeldende godkjente utgaver og gamle ansattbekreftelser omskrives ikke. Ingen nettkilde markeres kontrollert av denne vurderingen, og dette er ikke automatisk lovovervåking.

**Utvikler-QA:** permanent critical-kjede og full lokal build PASS; faktisk React/Vite/JSDOM PASS for sammenligning, manuell kildedato, lokal kladd, feilet lagring/retry, lagret vurdering uten publisering, eksplisitt godkjenning, nye tildelinger og bevarte historiske bekreftelser. Ekte Sandbox-RPC i rollback-transaksjon: **22 assertions PASS**, inkludert firma-/rolle-/revisjonskontroll, kildegrunnlag, immutable v1/v2 og avslått modul. Direkte sluttkontroll: 0 syntetiske firma/brukere, worker `enabled=false`. Ingen ny migrasjon, RPC, RLS/Storage eller global navigasjon. Publisert SHA, Core Safety og READY Preview dokumenteres i draft PR #216 etter levering. [Scope og QA](docs/kshms/SOURCE_UPDATES_20261009.md).

Kenneths TEST OK **00:59 / 01:29 / 01:55 / 02:28 / 15:01** beholdes. Ingen ny obligatorisk Kenneth-prøve opprettes. Innlogget browserbevis er fortsatt blokkert etter reset av `native credential state cannot be safely resumed`; dette er ikke browser-PASS. Neste punkt er samlet helhetlig B/C-vurdering og målrettet dekning av faktiske filer, mobil og flerbruker før HR. Tidligere fortsettelsespunkter nedenfor er historikk.

**E-postavklaring:** Kenneth autoriserte én kontrollert test til sin valgte arbeidsadresse 9. oktober kl. 17:29. Testen er ikke sendt; Production-testendpoint krever fungerende innlogget systemadminøkt. Generell køaktivering er fortsatt avslått. KS/HMS-varsler og fristpåminnelser skal aktiveres og verifiseres ved senere godkjent produksjonssetting. Ingen Production-release eller main/demo-merge er bestilt. Denne avklaringen supplerer de eldre sendingstillatelsene nedenfor.

---

## TEST OK – SJA-bilder, 9. oktober 2026 kl. 15:01

Kenneth svarte «test ok» etter den avgrensede SJA-bildeprøven i samme Sandbox Preview. Godkjenningen gjelder ett testbilde i SJA-utkast med lagring/gjenåpning, egen og samlet PDF, og bilde/manifest.json i vedleggs-ZIP på head `65655dea4a220352075b3c50dd0530a53aab758f`. Dette er brukerens godkjenning, ikke en ny utviklerdrevet nettleserprøve. Ingen bestemt sak, enhet eller antall filer utover prøven er dokumentert.

Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes uten omtest. SJA-bildeprøven trenger ikke gjentas uten konkret feil eller relevant regresjon. Mobilkamera, flerbruker, faktiske private avviks-/prosjektkontroll-/legacyfiler, risikobilder, eldre prosjektavviksuttrekk og versjonerte underskjema beholder sine egne restprøver. Neste uavhengige utviklingspunkt er påminnelser, deretter kildeoppdatering. HR er ikke startet.

Denne registreringen endrer bare dokumentasjon på feature-branchen; PR #216 forblir draft. Ingen Production-release eller main/demo-merge er godkjent eller utført. KS/HMS-e-postutsending skal fortsatt være deaktivert. Eldre beskrivelser av «ikke TEST OK for SJA-bilder» nedenfor er historisk status før denne godkjenningen.

---

## Versjonerte underskjema – avgrenset B-leveranse 9. oktober 2026

Kontrollert start remote feature `131d65ca97b7a401417e439b185ceac2afa5b6ff` / tree `806b61458891c92b25ed61a02676377101e9d1f2`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft. Sjekklistesentral kan feste eksakt publisert child-versjon etter et rotpunkt. Publisering lagrer root, utflatet utføringsliste og komplett child-versjon/hash/innhold. Samme-firma/aktiv-mal, syklus og maks 100 ferdige punkter håndheves server-side. Gamle parent-/prosjektkopier omskrives ikke.

Sandbox-migrasjonene `20261009040633 kshms_checklist_subforms` og `20261009041152 kshms_checklist_subform_execution_shape` anvendt. 17 rollback-assertions PASS, inkludert faktisk selvstendig kontroll; faktisk React og fem faktiske PDF-er PASS; A4-mal visuelt kontrollert. RPC/privat ACL og mailer `enabled=false` direkte kontrollert. Funksjonshead **6faf58df375ce12a4779f71fac98b1c2bfc5ce5e**, tree **2e8562f56150509669bc8635acda3800f3be3f14**, publisert fra expected-head uten force; alle 20 blobber matcher lokalt testtre. Full Sandbox critical build lokalt PASS. Core Safety **37883044933**, jobb **113666839672**, success. Vercel **dpl_JACGxacWsYSkCxcdKZGDAk8UK14F** READY på eksakt SHA/feature-ref/fast alias; branch-env direkte `EXPO_BACKEND_TARGET=sandbox`.

Innlogget samme Preview etter reload: bevart demoøkt i én fane, Bunnledning v1 åpnet skrivefritt. Versjonsvelger/forklaring vises på begge punkter; selvvalg er utelatt og bare «Ingen underskjema» finnes fordi dette er firmaets eneste sjekklistemal. Dialogen ble lukket uten lagring/publisering eller prosjekt-/kontrollendring. [Scope/QA](docs/kshms/CHECKLIST_SUBFORMS_20261009.md).

Dette er ikke Kenneths TEST OK. Tidligere TEST OK 00:59 / 01:29 / 01:55 / 02:28 beholdes. Faktiske private filer, mobil/flere brukere og separate restprøver består. Neste B/C er påminnelser, deretter kildeoppdatering; HR er ikke startet. Ingen ekte e-post eller Production/main/demo-merge.

---

## Risikobilder – publisert utviklerbevis 9. oktober 2026

Start kontrollert mot remote feature `0b6c0ffab2705c06b7314f2484cb187412c9f02d` / tree `d84c3ae5742d07b3d431132be99a3f0b579a5932`; main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft. Funksjonshead **bcd0579cebdeaaaa4578abab14dc5522bf0abd88**, tree **03e3ecf71fcde6c43e714997f57a24f1f213f810**, publisert fra expected-head uten force; alle 24 endrede blobber og samlet tree matcher lokal testcommit. Core Safety **37878651320**, full critical jobb **113652964404** completed/success. Vercel **dpl_AKRXJxtRxZuNRif9ej4d2oUJ5vk3** er READY på eksakt SHA/feature-ref/fast alias og direkte lest `EXPO_BACKEND_TARGET=sandbox`.

Risikovurdering kan lagre inntil tre komprimerte bilder per fare i samme private revisjonssnapshot. Egen PDF, valgt prosjektrapport, samlet PDF og ZIP/manifest er faktisk prøvd; visuell PDF-kontroll og full Sandbox critical build PASS. Privat migrasjon `20261009031544 kshms_risk_photos` er anvendt bare på Sandbox og direkte verifisert for bilde, legacy og stengte EXECUTE-grants; e-post-worker er fortsatt `enabled=false`. Innlogget Preview etter reload viste ny bildefunksjon og personverntekst i et tomt, ulagret skjema; ingen eksisterende risikovurderinger, filvalg, lagring eller fullføring. Popup ble lukket og listen sto fortsatt på null. [Scope/QA](docs/kshms/RISK_ATTACHMENTS_20261009.md).

Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes. Dette er ikke ny risikobilde-TEST OK. Faktisk innlogget risiko-/SJA-bilde/kamera, private filer, mobil/flere brukere og restbevis gjenstår. Neste uavhengige punkt er versjonerte underskjema; deretter påminnelser og kildeoppdatering. Ingen HR i natt, e-post, Production/main/demo-merge.

---

## Publiserte SJA-bilder – utviklerbevis 9. oktober 2026

Funksjonshead **785d01389d2059026711ea1a8af12762e75fc4b9**, tree **cd5257609f1a3e2c375b9faf7d9146bc561ed429**, publisert fra expected-head `7a68293c8ad3aae4191a1e766b1dbf278ab54eef` uten force; alle 25 blobber og samlet tree hash-/bytekontrollert. Main er fortsatt `155f6c4ac01f126c1db0c65da385cfd9305587d5`, PR #216 draft. Core Safety **37874352426**, jobb **113639379783**, full critical build completed/success. Vercel Preview **dpl_Dd3VioNsdD4idRkMGodqfpTamDqG** er READY på eksakt SHA/feature-ref/faste alias; branch-env er direkte lest som `EXPO_BACKEND_TARGET=sandbox`.

Leveransen gir inntil tre komprimerte SJA-bilder i samme revisjonssnapshot, egen PDF, samlet PDF og bekreftet ZIP/manifest. Lokal faktisk React/PDF/ZIP, visuell kontroll og full Sandbox-build PASS. Privat validator-migrasjon `20261009022028 kshms_sja_photos` er anvendt bare på `demo-sandbox` (`ppvircenkjizeiqdxphj`): ett JPEG-bilde og legacy uten `photos` PASS; fire bilder, PNG og duplikat-ID avvises; PUBLIC/anon/authenticated har ingen EXECUTE. Innlogget Preview etter reload: eksisterende signert «Test sja» åpnes uendret/read-only og viser ny bildeseksjon/personverntekst; ingen opplasting, lagring, signering eller annen dataendring. Popup lukket.

Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes; dette er ikke ny SJA-bilde-TEST OK. Faktisk innlogget SJA-bilde/kamera, risikovurderingsfiltilknytning, faktiske private filer, mobil/flere brukere og annen vedleggsdekning gjenstår. Deretter versjonerte underskjema, påminnelser og kildeoppdatering; ingen HR i natt. Ingen e-post, Production/main/demo-merge. [Scope/QA](docs/kshms/SJA_ATTACHMENTS_20261009.md).

---

## Publisert eldre prosjektavviksuttrekk – utviklerbevis 9. oktober 2026

Funksjonshead **37cd906b697763c4865650d9393a33d05fb78303**, tree **bf3c2e0ee256eb2cb9dddcc052b07aaf4490c8a2**, identisk med lokal testcommit 4316675cb99a3d1a004494eac2bb376df5c878c3. Alle 18 blobber opprettet/hashkontrollert og lest tilbake byte-/tekstidentisk; faktisk publisert git-commit rekonstruert og SHA-verifisert, 668 recursive tree-oppføringer kontrollert med korrekt tree og alle endrede filer. Lokal feature-head følger eksakt publisert kode. Publisert expected-head bd506a65 uten force; main fortsatt **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Vercel READY **dpl_8kaLkrvrwtiBGmksLnSRLFaUGUmi**, riktig SHA/feature-ref/prosjekt/faste alias, EXPO_BACKEND_TARGET=sandbox direkte lest. PR Core Safety **37868239123**, jobb **113620009941** med full critical build: completed/success. Final lokal full Sandbox build, scope/docs-guard og diff-check PASS.

Innlogget fast Sandbox Preview, gjenbrukt demoøkten i én fane: hovedprosjektet viste **3 ukoblede eldre saker**, alle startet uten valg. Tre koblede saker ble utelatt. De tre valgte eksisterende sakene (to åpne, én lukket) ga faktisk nedlastet **5-siders PDF** med innhold/status/eldre lukking, forklaring om uversjonert lagret tilstand og manifest. Tekst-/sidekontroll PASS; alle fem sider rendret og visuelt kontrollert uten overlapp/klipp. Vedleggslisten viste 0 og sperret ZIP/bekreftelse. Fjerning av lukket sak ga 2 valg, tømte vedleggsliste og PDF-bekreftelse og sperret PDF. Deretter valg/omfang tømt; én fane, ingen popup eller sak-/database-/Storage-skriving. [Nettleserbevis](docs/kshms/legacy-extract-proof.jpg).

Dette er **utviklerbevis, ikke Kenneths TEST OK** for ny legacy-del. Ny kort prøve står i USER_TEST.md. Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes. Ingen gamle godkjente deler skal prøves på nytt uten konkret feil/relevant regresjon. Faktisk lagret eldre avviksfil, private avviks-/prosjektkontrollfiler og mobil/flere brukere er fortsatt separate restprøver: eksisterende gamle testsaker hadde ingen photos. Lokal React/ZIP med syntetisk transport verifiserer 7 originaler og manifest/CRC32/SHA-256; dette er ikke faktisk innlogget filbevis. Øvrig vedleggsdekning/SJA-/risikofiltilknytning består før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå. KS/HMS enabled=false er direkte lest, ingen e-post/Production/main/demo-merge. Etterfølgende beviscommit har bare docs/skjermbilde og uendret funksjon.

---

## Eldre ukoblede prosjektavvik – avgrenset leveranse 9. oktober 2026

Miljømål **BEGGE**; bare feature/Sandbox-publisering. Verifisert start **bd506a652bd2b4d339b43946f80a121ecea294f9**, main **155f6c4ac01f126c1db0c65da385cfd9305587d5**, draft PR #216. Denne del-leveransen gjør eldre ukoblede prosjektavvik eksplisitt valgbare i Dokumentuttrekk: lagret innhold/bilder i PDF, originalfiler i separat bekreftet ZIP. Koblet KS/HMS-sak utelates. Eldre ansvar/lukking merkes som lagret tekst uten versjonert historikk eller KS/HMS-signatur; innholdets SHA-256 følger valget/manifestet.

Utviklerbevis: permanent tilgangs-/innholds-/fil-/avbruddsvern PASS; faktisk React/jsPDF gir 20-siders prøve-PDF og ZIP med 7 originaler, CRC32/SHA-256 verifisert. Alle 20 sider rendret, kontaktark og åpne/lukkede avvik visuelt kontrollert. Opprinnelige åtte-gruppe-prøver og kvalitet-/HMS-modus PASS (ZIP 5/9 originaler). Full critical Sandbox build PASS. Transport i disse lokale prøvene er syntetisk. Innlogget publisert prøve og eksakt publisert head/tree/CI/deploy er ført ovenfor. Vercels branch-binding er direkte kontrollert: EXPO_BACKEND_TARGET=sandbox. KS/HMS-worker enabled=false er direkte lest; utsending forblir deaktivert.

**Ny bruker-TEST OK foreligger ikke for eldre prosjektavvik.** Bevar Kenneths TEST OK 9. oktober Europe/Oslo: egen SJA-PDF 00:59, samlet PDF 01:29, ZIP med to bilder/manifest 01:55, kvalitet-/HMS-uttrekk 02:28 på f9e0f7b52a0573cf662fce07f8158c47576c8598 (funksjon 0e2de193164dad2342206cac1e2a7610f3c265d0). Ingen ny prøve av disse delene kreves uten konkret feil/relevant regresjon. Faktiske private avviks-/prosjektkontrollfiler, faktisk eldre prosjektavviksfil, mobil/flere brukere og øvrig vedleggsdekning består. Nye filtilknytninger på SJA/risiko er ikke levert. Fortsett øvrig vedleggsdekning før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå; kravene i HR_SCOPE_20261008.md beholdes.

Ingen migrasjon, backend-/database-/policyendring, saks-/Storage-skriving, signering/lukking, ekte e-post, Production-release eller main/demo-merge. [Eksakt scope, prøver og neste steg](docs/kshms/LEGACY_ATTACHMENTS_20261009.md).

---

## TEST OK – kvalitets-/HMS-avvik, 9. oktober kl. 02:28

Kenneth ga **TEST OK 9. oktober 2026 kl. 02:28 Europe/Oslo** for den avgrensede kvalitets-/HMS-leveransen på publisert head **f9e0f7b52a0573cf662fce07f8158c47576c8598** (funksjonskode **0e2de193164dad2342206cac1e2a7610f3c265d0**). Godkjenningen gjelder den nye avviksdekningen i Dokumentuttrekk og den fremlagte korte brukerprøven. Utviklers innloggede bevis omfatter seks lagrede avvik, 23-siders PDF med begge kategorier/historikk/manifest, tom vedleggsliste med sperret ZIP og nullstilling ved fjerning. Bevishead f9e0f7b5 var READY **dpl_3DB6k8cwp3K1eBvzMcG8Ludc8JFk**, grønn Core Safety **37864641901** / full critical build **113608347101** completed/success.

Tidligere TEST OK **00:59 egen SJA-PDF / 01:29 samlet PDF / 01:55 ZIP med to bilder og manifest.json** beholdes. Denne nye godkjenningen er **ikke faktisk privatfilbevis**: Sandbox-avvikene har ingen private originaler/bilder. Faktisk private avviksfiler, private prosjektkontrollfiler, mobil/flere brukere og øvrige tidligere separate restprøver består. Den godkjente avviksprøven skal ikke gjentas uten konkret feil eller relevant regresjon. Ukoblede eldre prosjektavvik og andre filtilknytninger/full tilsynsdekning er fortsatt ufullført B/C-scope. Fortsett én avgrenset del av øvrig vedleggsdekning før versjonerte underskjema, påminnelser og kildeoppdatering; HR følger senere etter avklart HR_SCOPE_20261008.md.

Denne oppfølgingen endrer bare dokumentert godkjenningsstatus. Miljømål **BEGGE**, kun feature/Sandbox. Faktisk branch/main kontrollert før endring: f9e0f7b5 / **155f6c4ac01f126c1db0c65da385cfd9305587d5**, draft PR #216. Ingen app-/backend-/databaseendring, Production-release/main/demo-merge eller ekte e-post. KS/HMS-e-postutsending forblir deaktivert.

---

## Kvalitet-/HMS-uttrekk: READY og grønn full critical build

Funksjonshead **0e2de193164dad2342206cac1e2a7610f3c265d0** er READY/grønn Core Safety. Innlogget utviklerprøve lastet ned seks lagrede kvalitets-/HMS-saker på 23 sider med historikk/manifest; tom privat vedleggsliste sperret ZIP, endret utvalg nullstilte bekreftelsen. Eksakt head/tree/deploy/CI og [nettleserbevis](docs/kshms/deviation-extract-proof.jpg) er ført i CONTINUITY/QA. Tidligere TEST OK **00:59 / 01:29 / 01:55** beholdes. Ny avviks-TEST OK, faktisk private avviksfiler, mobil/flere brukere og øvrig vedleggsdekning gjenstår. KS/HMS-e-post deaktivert; ingen Production/main/demo-merge. Én avgrenset leveranse, ingen underskjema/HR i denne runden.

---

## Kvalitet-/HMS-avvik i dokument- og vedleggsuttrekk – 9. oktober 2026

Miljømål **BEGGE**, kun feature/Sandbox nå. Baseline `da2e5a79824c1358948ed535768b81277a2ecb41`, faktisk main `155f6c4ac01f126c1db0c65da385cfd9305587d5`, draft PR #216. Ny avgrenset del av øvrig vedleggsdekning: egen gruppe **Kvalitets- og HMS-avvik med historikk og bilder** i Dokumentuttrekk. Valgte lagrede KS/HMS-saker får full historikk/private bilder i PDF og private originaler i ZIP, med eksisterende bekreftelse/manifest/konsistens-/tilgangsvern. [Scope og QA](docs/kshms/DEVIATION_ATTACHMENTS_20261009.md).

TEST OK for egen SJA-PDF **00:59**, samlet PDF **01:29** og ZIP med to bilder/manifest **01:55** 9. oktober beholdes som separate dokumenterte godkjenninger. De er ikke ny TEST OK for kvalitet/HMS. Innlogget Sandbox har fem HMS-saker/én kvalitetssak, ingen private avviksfiler. Ny faktisk privatfilprøve, mobil/flere brukere og tidligere separate restprøver er fortsatt åpne. Nye filtilknytninger på andre dokumenttyper og full legacy-/tilsynsdekning er ikke erklært ferdig. Øvrig vedleggsdekning følger før versjonerte underskjema, deretter påminnelser og kildeoppdatering før HR; HR_SCOPE_20261008.md beholdes. Ingen Production/main/demo-merge eller ekte e-post; Sandbox KS/HMS-enabled=false bekreftet direkte og beholdt.

---

## TEST OK – ZIP med to bilder og filoversikt, 9. oktober kl. 01:55

Kenneths TEST OK er presisert **9. oktober 2026 kl. 01:55 Europe/Oslo**: ZIP fra Voldsløkka-vernerunden er lastet ned og åpnet, med **to bilder i vedlegg og én JSON-fil**. Skjermbildet viser åpnet «KS-HMS vedlegg – test omfang», mappen «vedlegg» og «manifest.json». Dette bekrefter innlogget ZIP-nedlasting/innhold på publisert head **359dac0ed2df86ab43cb545ece6716161f9bdc87** (funksjon 42a38e91), etter PDF-/ZIP-avklaringen kl. 01:51–01:53. Tidligere TEST OK beholdes. Ingen ny mobil-, flerbruker-, privat RUH-original-/prosjektkontrollfil- eller Production-/merge-/e-postgodkjenning følger.

Brukerens «det var ikke selvsagt» følges opp med avgrenset tekst i Dokumentuttrekk og HJELP: PDF og ZIP har hver sin nedlasting; ZIP-knappen vises etter Vis vedleggslisten; manifest.json forklares som filoversikt som beholdes med vedleggene. Ingen handler, eksportformat, backend eller knappnavn endres. Miljømål BEGGE, først samme feature/Sandbox. Neste faglige B/C-punkt er fortsatt øvrig vedleggsdekning og versjonerte underskjema; deretter påminnelser/kildeoppdatering før HR. Gjenværende prøver videreføres uten å gjenta godkjent ZIP-nedlasting.

---

## KS/HMS: vedleggspakke – feature/Sandbox READY

Kenneth ga **TEST OK 9. oktober 2026 kl. 01:29 Europe/Oslo** for samlet dokument-/tilsynsuttrekk på publisert head `c5e128c6fde2d0fb1368accb78a9414c05f0c81d`. HJELP, architecture og README var oppdatert ved godkjenningen. Tidligere TEST OK beholdes, inkludert egen SJA-PDF kl. 00:59. Dette er ingen Production-/merge-/e-postgodkjenning.

Funksjonskode **42a38e91** / tree **96ed970e**, READY **dpl_HY7SG3fjVEMjYJtV4JR8nkYnMvKa**, Core Safety **37860831491** / full critical build **113595879925** success. Innlogget ZIP med to allerede lagrede Voldsløkka-bilder + manifest (381240 byte) PASS: CRC, JPEG-er, riktige dokument/revisjon/punkt og SHA-256 kontrollert. Bekreftelse, tomt omfang, nullstilling og RUH uten vedlegg PASS. Publisert HJELP kontrollert. Eksisterende samle-PDF med SJA/signatur og begge vernerundebilder fortsatt PASS (5 sider). Én fane, alle popup lukket, ingen lagrede data mutert. Eksakt bevis/handoff i CONTINUITY. Ny ZIP-TEST OK, private RUH-originaler/prosjektkontrollvedlegg innlogget, mobil/flere brukere gjenstår. ZIP har egen ny brukerprøve. PR #216 forblir draft; samme Preview, main og Production urørt. [Scope](docs/kshms/ATTACHMENT_ARCHIVE_20261009.md).

---

## KS/HMS: valgt samlet uttrekk – feature/Sandbox READY

Funksjonskode `8d045d0cd9956d47d93e1b606b75eef7097dda32`, tree `ded14b7df45dc08e810ed569c2630e6e8e65a033`, READY `dpl_FpiuDdxSxd5yaauYXkSgpKfDcmC3`; Core Safety `37858562063` / full critical build `113588549210` success. Ny intern managerflate Dokumentuttrekk med eksplisitt valg av åtte dokumentgrupper, full RUH-historikk/private bilder og manifest. Innlogget faktisk PDF: seks dokumenter/12 sider; uten rutine fem/10 sider. SJA-signatur, begge RUH-hendelser og to faktiske vernerunde-bilder bevart. Én fane, popup lukket; ingen lagrede data mutert. Lokale relevante React/PDF og full Sandbox build PASS. [Scope og QA](docs/kshms/INSPECTION_EXTRACT_20261009.md), [eksakt bevis/handoff](docs/kshms/CONTINUITY.md), [kort ny prøve](docs/kshms/USER_TEST.md).

Samme branch-Preview og tidligere TEST OK beholdes; samlet uttrekk TEST OK 9. oktober kl. 01:29. Neste B/C: øvrig vedleggsdekning/versjonerte underskjema/påminnelser/kildeoppdatering før HR. PR #216 fortsatt draft, main uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Ingen Production-release, main/demo-merge eller ekte e-postsending; KS/HMS-utsending forblir deaktivert. Etterfølgende beviscommit endrer bare dokumentasjon/skjermbilde.

---

## Publisert rutine-/sjekkliste-PDF – READY

Funksjonskode **64143a3a4a982f442bbafcacaf40d535073751a8**, tree **86813dd63f72714995ea88bf71d26bd7b72cb571**. Hver publisert blob og samlet tree er identiske med lokal testet commit bb4b0053. Git-push manglet skriveinnlogging; GitHub-koblingen publiserte samme tree med expected-head aea7e766 og uten force. Ingen lokal branchhistorikk er slettet.

Fast Sandbox Preview er **READY** på **dpl_83H3TYNf6vdiwWqZuRU8LTT3m5WV**, eksakt funksjons-SHA og alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app. **PR Core Safety 37846961060**, jobb **Core safety + critical build 113550101731**, completed/success. Endelig lokal full Sandbox critical/build PASS exit 0. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, gitBranch feat-kshms-foundation er kontrollert. PR #216 er open/draft; main er uendret **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Samlet branch-diff etter funksjonscommit: 196 filer; ny avgrenset slice: 20 filer.

Neste er bare den nye korte rutine-/sjekkliste-PDF-prøven i USER_TEST.md. Fem faktiske React/jsPDF-uttrekk, tre berørte eksisterende React-flyter, permanent critical og visuell PDF-kontroll PASS. Transport/innlogging var simulert; innlogget bruker-/mobilprøve er ikke hevdet. Tidligere TEST OK og separate åpne oversikts-/kontroll-/risiko-/popup-prøver beholdes. Ingen ny database-/Production-/main-/demo-endring, e-postaktivering/sending eller HR. Øvrige B/C-punkter består. Etterfølgende ren dokumentcommit lagrer dette beviset uten funksjonsendring.

---

## Rutine- og sjekkliste-PDF – avgrenset B/C-del, 8. oktober 2026

Utgangspunkt feature-head `aea7e76672380e8e914a234d8cc9ae9b629434c3`, main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Miljømål BEGGE, bare samme feature/Sandbox nå. Tidligere TEST OK og åpne nye delprøver beholdes. PR #216 er draft. Ingen HR, Production/main/demo-release, databaseendring eller ekte e-postsending.

Egne PDF-er fra godkjente rutineutgaver, publiserte sjekklistemaler og lagrede prosjektkontroller er implementert. Rutine viser R-nummer/utgave, firmaets lagrede tekst, godkjenner/kilder og ID/hash. Egen ansattbekreftelse og andre ansattes opplysninger eksporteres ikke. Historiske kontooppslag merkes når navnesnapshot mangler. Sjekklistemal er tydelig tom mal; upublisert kladd tas ikke med. Prosjektkontroll viser eksakt lagret mal-ID, kontroll/revisjon, svar, kommentarer, bilder og eventuell lagret fullføringsidentitet/tid. Utkast merkes under arbeid; kontrollens fullføring lukker ikke avvik. Filvedlegg er navngitt med tydelig beskjed om at originalfilen ikke følger PDF-en. Ingen automatisk rapport-/portaldeling.

Eksisterende lesende RPC-er og firmaprofil brukes. Tilgang og samme utgave kontrolleres både før og etter PDF-/bildeinnlasting. Prosjektkontroller beholder eksisterende prosjekttilgang uten krav om personlig KS/HMS-grant. Nye/ulagrede kontroller og redigerte svar sperres. Manglende bilde stopper eksport; manglende logo gir firmanavn og synlig beskjed. Filadresser/token kommer ikke i PDF-en. Profil-, bruker-, skjerm-/dokumentbytte stopper sene uttrekk. Ingen automatisk save/publish/sign/complete.

Utviklerprøver: permanent ny document-PDF-critical PASS; fem faktiske React/jsPDF-uttrekk PASS med simulert RPC, inkludert rutine i Les og bekreft/Min personalhåndbok, mal ved endret utkast, fullført kontroll og utkast. Langtekst, logo/bilde, ikke-bekreftelse, ulagret sperre, nyere revisjon, tilgang tilbakekalt etter bildefremhenting og sent brukerbytte er prøvd. Tre eksisterende React-flyter for sjekklistesentral/prosjektpopup/workspace PASS; lagring/gjenåpning/fullføring/historikk/kladd/konflikt/legacy er bevart. Poppler-layout kontrollert på lang rutine (7 sider), mal (1 side), fullført kontroll/utkast (3 sider). Ingen kutt/overlapp; sider og originalbilder er beholdt. Endelig full Sandbox critical/build etter hjelpeoppdatering PASS, exit 0. Eksisterende bundle-size-advarsel består. Ingen ny innlogget mobil-/flere-konto-PASS hevdes.

Publisering/CI/READY er bekreftet i beviset ovenfor. Neste er kun den korte nye PDF-prøven i USER_TEST.md. Øvrige B/C-punkter (full vedleggsdekning, versjonerte underskjema, RUH-bilder/historikk, tilsynsuttrekk, påminnelser/kildeoppdatering) gjenstår før HR. Samme faste Preview; ingen gamle TEST OK gjentas automatisk.

---

## Publisert kompakt prosjektoversikt – READY

Funksjonskode **990ce731d983c8f6bbfd92b8498723d03c956868**, tree **18151a4384ba493e166801500bd5af7d09b78aee**. Lokal testet og publisert source tree er identiske. Fast Sandbox Preview er **READY** på **dpl_Gm7bVWwzsQ7N3nrcXiaL32RQbebW**, alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app, med eksakt SHA. PR Core Safety **37844000342**, jobb Core safety + critical build **113540184367**, completed/success på samme SHA. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, gitBranch feat-kshms-foundation er kontrollert. PR #216 er fortsatt open/draft. Main står uendret på **155f6c4ac01f126c1db0c65da385cfd9305587d5**.

Neste er den korte oversiktsprøven i docs/kshms/USER_TEST.md. Alle 14 skjermbilder er lest. Tidligere TEST OK består; denne UX-delen og PDF-prøven har fortsatt ikke egen bruker-TEST OK. Ingen main-/Production-/demo-, database- eller e-postendring i UX-runden. En etterfølgende ren dokumentcommit registrerer dette beviset uten funksjonsendring.

---

## Prosjektoversikt – sammenfolding, 8. oktober 2026

Kenneths 14 skjermbilder er lest. Avvik/SJA/RUH er gjort kompakt i samme feature/Sandbox: fire lukkede dokumentgrupper med antall/status, og lukkede grupper/rader for sjekkpunkt- og prosjektavvik. Åpne avvik står først; ansvarlig og frist vises på raden. Nye prosjektavvik åpnes etter lagring. Miljømål BEGGE, først Sandbox Preview; tidligere TEST OK består.

Faktisk React/DOM med simulert RPC PASS: metadataantall, folding, bevart redigering, ny sak synlig etter lagring, offline/tapt tilgang/sene svar, låst prosjekt, legacy-lukking og koblet KS/HMS-sak. Eksisterende prosjekt/SJA/RUH- og gjennomføringsprøver PASS. Ingen ny innlogget mobil-/flere-konto-PASS hevdes. Full Sandbox critical/build PASS med exit code 0. Publiseringsbevis er bekreftet ovenfor. Ingen database-, e-post-, main-, Production- eller demo-endring i denne UX-runden. PR #216 beholdes draft.

Neste er den korte oversiktsprøven øverst i docs/kshms/USER_TEST.md. PDF-prøven under den er fortsatt åpen. [Omfang og kontroller](docs/kshms/PROJECT_OVERVIEW_20261008.md).

---

## Publisert kontroll-/risiko-PDF – READY

Funksjonskode **c6dc21d5073388eb4c57ce16eed447887ff17495**, tree **5642f9df18d308124fcf970b8f6900e702e00785**. Lokal testet og publisert source tree er identiske. Fast Sandbox Preview er **READY** på **dpl_AF8RKPJdjkFDcfSu32MPDauYy3xG**, alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app, eksakt funksjons-SHA. PR Core Safety **37840420573** og jobb Core safety + critical build **113528082970** er completed/success på samme SHA. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, er kontrollert. PR #216 er open/draft. Main står uendret på **155f6c4ac01f126c1db0c65da385cfd9305587d5**.

Neste er bare ny PDF-prøve øverst i USER_TEST.md. Ingen gammel TEST OK gjentas. PDF-leveransen er utviklertestet/publisert, men egen bruker-TEST OK for denne nye delen er ikke mottatt. Øvrige B/C-punkter før separat HR og pilot består. Ingen Production-migrasjon/merge/deploy eller reell e-postsending. Etterfølgende ren dokumentcommit registrerer dette beviset uten funksjonsendring.

---

## Gjeldende leveranse – kontroll-/risiko-PDF 8. oktober 2026

Kenneths «kjør» autoriserer neste avgrensede PDF-del i samme feature/Sandbox. Avklarte valg: lagrede kontrollbilder, farget 5×5 med detaljer, lagrede utkast tydelig under arbeid, både egen PDF og valgfritt prosjektvedlegg, firmaprofilens navn/logo. Miljømål BEGGE; først Sandbox. Ingen main-/Production-/demo-endring eller reell e-postsending.

Egen **Last ned PDF** og **Velg KS/HMS til rapport** er implementert. Fersk lesing kontrollerer tilgang/revisjon; ulagrede endringer stopper egen PDF. Lagrede identiteter, rutine-/malutgaver og egen fullføring beholdes. Forventet risiko er tydelig skilt fra kontrollert effekt; fullført kontroll lukker ikke avvik. Utkast kan eksporteres, men får ingen oppdiktet fullføring. Bare uttrykkelig valgte prosjektdokumenter følger rapporten, og portal får ingen KS/HMS-data.

Sandbox-migrasjon **20261008202524_kshms_execution_report** er anvendt. Ny lesende RPC; gamle SJA/RUH-RPC-er og kommandoer er uendret. **79** faktiske SQL-assertioner PASS med full rollback. Faktisk React/jsPDF: tre egne PDF-er og syv prosjektrapport-PDF-er/fire utskrifter PASS med simulert transport. Lange dokumenter, bilder/logo, matrise og kombinasjon er visuelt kontrollert. Permanent critical og full Sandbox build PASS. Ingen ny innlogget mobil-/flere-konto-PASS eller brukerens TEST OK for PDF er hevdet. Signert SJA/rutineutgaver har samme fingeravtrykk; e-post-enabled=false. [Detaljer](docs/kshms/EXECUTION_PDF_20261008.md).

Publisering/CI/READY er bekreftet ovenfor. Fortsett med den korte nye PDF-prøven i USER_TEST.md; tidligere godkjente deler gjentas ikke. Fullplanen A–E og øvrige vedlegg/rapporter/påminnelser/HR består.
---

## Gjeldende avklaring – eksisterende Resend, Sandbox uten reell sending

8. oktober 2026: Kenneth autoriserer videre kontroll og gjenbruk av eksisterende Resend. Sandbox/Preview holdes uten ekte KS/HMS-e-post; tidligere krav om å sette Sandbox-hemmeligheter/aktivere der er erstattet. Lesende Production-kontroll bekrefter smart-worker v18 ACTIVE med RESEND_API_KEY/CHAT_FROM_EMAIL. KS/HMS-kilde bruker allerede de samme prosjekthemmelighetene; smart-worker/payload endres ikke. Sandbox har også smart-worker v18, så eldre e-posttester kan ikke utelukkes; metoden er ikke gjenfunnet. KS/HMS enabled=false er direkte SQL-verifisert. Dagens permanent-test bruker providerstub, ikke innbokslevering. Se [gjeldende oppsett](docs/kshms/EMAIL_SETUP.md).

Miljømål BEGGE; kun dokumentasjon endres i denne runden. Ingen Production-merge/DDL/deploy, ingen hemmelighetsendring og ingen sending. Før senere uttrykkelig godkjent release: gjenbruk Production-konfigurasjon, riktig Production-origin/endepunkt, autentisert check uten sending og kontrollert mottaksprøve. Tidligere QA/popup/Preview-bevis består; ikke bygg om ferdig kobling.

# Gjeldende release-status – 8. oktober 2026

Miljømål: **BEGGE**, først feature/Sandbox Preview.

## Production

Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Production Vercel `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`, https://expo-proffdok.app, Supabase `dqffxflaoyarbxyiyhop`. Ingen KS/HMS-produksjonsmigrering, merge eller release er utført.

## Aktiv branch og Preview

Branch `feat-kshms-foundation`, [PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216), open/draft. Fast [Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe), backend ppvircenkjizeiqdxphj. Nyeste funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`, READY med grønn CI (bevis nedenfor). Tidligere prosjekttillegg: Funksjonskode `8bce982fb75bf105ee614601e604e438f89a78bc`, tree `ed17f78782d6a49944bd55be6b008d0ef29995e9`. Fast Sandbox Preview er READY på `dpl_4gwb3VsRp7Wf2GWmRrxFNre8DY87`, med samme feature-alias og eksakt SHA. PR Core Safety `37827572425` og jobb Core safety + critical build `113484256816` er completed/success på samme SHA. Lokal og publisert tree er identiske. Tidligere funksjonskode med kladdrettelsen `cdac7cf1fe50b724bb87163422e5a0424b01fd58`, tree `47f6249fb6433a6181c9ac94256dd862b097f3bd`: samme faste Preview er READY på `dpl_7ViZBuSk1G3bjNJ8vUfozN2u8Qhn`. PR Core Safety `37788569184`, jobb Core safety + critical build `113349595488`, er completed/success på samme SHA. Branch-spesifikk `EXPO_BACKEND_TARGET=sandbox` er kontrollert (target preview, branch feat-kshms-foundation). Senere dokumentregistrering endrer bare notater. Bevis: [EXECUTIONS_20261008.md](docs/kshms/EXECUTIONS_20261008.md).

## Popup og ansvarse-post – publisert og grønn

Prosjekttilleggets TEST OK er registrert 8. oktober kl. 21:04 Europe/Oslo. Fullført-popupen lukker etter bekreftet lagring/readback. Ansvarse-post omfatter alle dagens KS/HMS-oppgavetyper, pliktig rutinegjennomgang og forfalt håndbokrevisjon. 36 nye + 45/54/73/93 relevante rollback SQL-kontroller PASS; faktisk React/DOM med simulerte RPC-er og permanent mailer-/lenkeprøve PASS. Full Sandbox critical/build PASS exit 0. Signert SJA/rutineutgaver er uendret. Sandbox-migrasjon 20261008192529 og mailer v4 ACTIVE. Faktisk check HTTP503 viser manglende Resend-nøkkel og avsender; enabled=false, ingen ekte sending. Samme feature-Preview er READY med grønn CI. Funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`. Samme faste feature-Preview er READY på `dpl_HNUqhySypafZmk9d9CaQXSUVZcVn` med eksakt SHA/alias. PR Core Safety `37833698123`, Core safety + critical build `113505254109`, completed/success. Lokal og publisert source tree er identiske. Preview-binding EXPO_BACKEND_TARGET=sandbox er kontrollert for feat-kshms-foundation. Ingen Production-endring. Se [testbevis og omfang](docs/kshms/NOTIFICATIONS_20261008.md) og [oppsett](docs/kshms/EMAIL_SETUP.md).

## Prosjekttillegg – publisert og grønn

Originalarbeidet er gjenfunnet etter environment_offline; forbindelsen er tilbake. Vernerunde/5×5 har prosjektinnganger, separate prosjektoversikter/kladder, fast ansvarligvarsel til lagret egen fullføring, valgbare godkjente rutineutgaver og stor avkrysning ved fullføringsknappen. 44 nye rollback SQL-kontroller, faktisk React-prosjekt/varsel/dialog og eksisterende relevante scenarioer PASS. Ny Hjelp og kort testliste er oppdatert. Ingen ny DDL i gjenopprettingen. Full sluttbygg/critical-kjede PASS med exit code 0; CI og fast Preview er bekreftet grønne på 8bce982f. Se [prosjekttillegget](docs/kshms/PROJECT_EXECUTIONS_20261008.md).

## Ny leveranse – vernerunder/kontroller og 5×5-risiko

Begge verktøyene ligger i KS/HMS og kan brukes med eller uten et faktisk firmaprosjekt. Utkast, egne sjekkpunkter/fast malutgave, svar/bilder, ansvar/frister, egen fullføring og bevart historikk er bygget. Kontrollavvik opprettes én gang via eksisterende sak/varsel. Risiko har tomme scorer, firmavurderte grenser, planlagt/kontrollert effekt og uttrykkelig beslutning. Fullførte dokumenter og historisk identitet beholdes.

54 faktiske Sandbox SQL-kontroller PASS med full rollback. Reell React-/dialogflyt med RPC-fixture og permanent kritisk prøve PASS. Signert SJA (1) og rutineutgaver (10) har samme fingeravtrykk før/etter. Migrasjon 20261008131207 finnes bare i Sandbox. Advisor-varslene om RPC-only RLS og tilsiktede SECURITY DEFINER-grants er vurdert mot faktiske negative tilgangsprøver; nye FK-indekser beholdes. Ingen generell advisor-opprydding er hevdet. Endelig full Sandbox critical/build PASS. Samme Preview er READY; publiseringsbevis står i [EXECUTIONS_20261008.md](docs/kshms/EXECUTIONS_20261008.md). Prosjekttillegget er TEST OK 8. oktober kl. 21:04; bare ny popup-prøve og senere faktisk e-postlevering gjenstår.

## Tidligere rapportleveranse og QA

Kenneths «kjør» kl. 13:38 autoriserer valgfri prosjekt-SJA/RUH i Rapport/PDF/utskrift. Dialogen brukes av alle tre eksportfunksjoner og viser bare prosjektets tilgjengelige dokumenter. SJA får lagret rutinehenvisning, deltakere/medvirkning og PL-signatur. RUH får hendelse/tiltak/ansvarlig/frist/status/egen kontroll/lukking. Utkast/åpne saker merkes. Ingen automatisk avkrysning eller ny lagring i prosjekt-/portal-JSON.

34 rollback SQL-kontroller PASS; faktisk React, 5 PDF-er med jsPDF 2.5.1, 3 utskriftsdokumenter og visuell kontroll av 12-siders lang PDF PASS. Eksisterende signert SJA og 10 rutineutgaver er bevart. Full endelig Sandbox critical QA/build, PR Core Safety og release-docs-guard PASS. Ny read-only RPC/migrasjon 20261008115650 er bare i Sandbox. Security Advisor: tilsiktet authenticated SECURITY DEFINER-grant er gjennomgått med funksjonens porter og negative tilgangsprøver. Ingen påstand om at alle eksisterende advisor-varsler er løst. Se [rapportomfang og QA](docs/kshms/PROJECT_REPORT_20261008.md).

## Kenneths tester

Rapporttillegget er TEST OK 8. oktober kl. 14:48 Europe/Oslo på kontrollert head 564778722c17d77358464de4fe465d02d336956e / funksjonskode f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c. Gjelder prosjektets rapportvalg og PDF med/uten SJA/RUH. Neste del er vernerunder/selvstendige kontroller og 5×5-risikovurdering; ingen Production-godkjenning.

Tidligere håndbok-, avvikspopup/lukking-, menyretur- og sjekklistepopup-prøver er TEST OK for sine prøvde leveranser. TEST OK 8. oktober kl. 01:28 Europe/Oslo for meny, RUH-inngang og norsk dato gjelder kontrollert head 42204af397fc1fb6187e7e475c951ecdcd007550. TEST OK kl. 13:30 for SJA-utkast/rutinenummer/lagring/gjenåpning og RUH-oppfølging/ansvarligvarsel/egen dokumentert lukking/bevart sak gjelder kontrollert head 75f6ba1f53817a17e4efb3cac778a63d3cfcb9c5. Dette godkjenner ikke hele KS/HMS eller Production. Rapporttillegget er også TEST OK kl. 14:48 og skal ikke prøves på nytt uten konkret feil.

## Gjenstående og neste handling

Bare de nye vernerunde-/risikoflytene i USER_TEST.md skal prøves nå; godkjente delprøver gjentas ikke. Første rapportdel har dokumenttekst og elektronisk signering/lukking; RUH-bildevedlegg og full endringshistorikk følger ikke med. Ingen ny innlogget nettleser-/mobil-/flere faktiske brukerøkter-PASS hevdes. Den eksisterende skynettleserfanen åpner fast Preview på innloggingssiden; tidligere avviste credential-kall gjentas ikke.

Vedleggs-/øvrige rapportuttrekk, separat HR/kompetanse/medarbeidersamtaler og fristpåminnelser gjenstår før Ringside-pilot som avtalt. Sandbox-e-postsending er deaktivert; avsenderoppsett/faktisk mottaksprøve gjenstår. Utførelse før HR; leder bare tildelte ansatte, firmaadmin alle/tildele ansvar. Relevant TEST OK og eksplisitt PRODUCTION GODKJENT for PR #216 kreves før Production-migrering/merge. Senere synkretning main → demo.

Fortsettelsespunkt: [OVERSIKT.md](docs/kshms/OVERSIKT.md) og [CONTINUITY.md](docs/kshms/CONTINUITY.md). Eldre release-status er bevart i [arkivet](docs/kshms/archive/CURRENT_RELEASE_STATUS_before_TEST_OK_20261008.md).

HR-popup 11.10: medarbeiderraden åpner eksisterende appdialog, med leder/tilgang, paginerte brukervalg og resultatmeldinger inne i vinduet. Dialog, Escape/kryss, fokusretur og fersk autorisering kontrollert i React og Chromium ved 1280/360/740. Tilgang/backend/privat HR uendret. Samme core-PR #219/Preview; ingen merge.

HR-prøveoppdatering 11.10: første åpning viser skjemaets topp; tom/ulagret/redigert samtale bevares gjennom ekte HR-tilgangsremount. Konto-/firmabundet sideminne, ingen ulagret browserlagring. Faktisk useHrAccess/JSDOM og Chromium 1280/360/740 grønne, inkludert konflikt og uendrede PDF-/neste-steg-løp. Samme PR #218/Preview; ingen merge.
