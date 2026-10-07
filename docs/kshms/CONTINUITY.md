# KS/HMS – gjeldende fortsettelsespunkt

Oppdatert 7. oktober 2026, Europe/Oslo. Dette dokumentet samler gjeldende brukerbeslutninger og verifiserte referanser etter to avbrutte samtaler. En ny chat skal lese dette først, deretter PLAN.md, SCOPE_A2.md, QA.md og USER_TEST.md. Dette er ikke en ordrett kopi av historikken eller en attest på at hele modulen er ferdig.

## Mål og leveranseomfang

Bygge en integrert KS/HMS-modul i Expo ProffDok, med Ringside som pilot og mulighet for flere firmaer. Modulen skal omfatte selvstendige, tilpassbare rutiner, dokumentert egen gjennomgang, oppfølging/revisjon, utførelsessjekklister, SJA, risikovurdering, avvik/RUH, varsler og rapporter. Valgfrie deler omfatter individuell personal/kompetanse og stoffkartotek. Kapasitetsmålet på 100 firmaer er en plan, ikke en utført lasttest.

Modulen aktiveres per firma av systemadmin. Firmaadmin gir aktive interne medarbeidere tilgang. Kunde, UE og innleid får ingen ny KS/HMS-modulrettighet. Online mobilbruk er tilstrekkelig i første leveranse. Ordre, timer, materiell, ressursplanlegging og betalingsintegrasjon bygges ikke i denne modulen. Pris/fakturering er fortsatt uavklart og blokkerer ikke gjeldende Preview-arbeid.

## Kontrollert Git- og miljøpunkt

| Referanse | Status ved kontroll 7. oktober |
|---|---|
| Repo | ExpoProffsenter/expo-proffdok |
| Arbeidsbranch | feat-kshms-foundation |
| Kontrollert head før dette dokumenttillegget | 228357afbaf175cf8cf0453e5556b503296e87f6 |
| Testet funksjonskode, ifølge lagret sluttkontroll | 6bf84204db9c7869bebafb19c034dc02f53f25ca |
| PR | #216, åpen draft, ikke merget |
| Eksisterende checkpoint | checkpoint-kshms-recovery-20261006, 9e88f4cc41db905898a4fbf0e013905ddee30343 |
| Fast Preview | https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe |
| Preview-backend | Sandbox ppvircenkjizeiqdxphj; branch-spesifikk EXPO_BACKEND_TARGET=sandbox |
| Main ved kontroll | 155f6c4ac01f126c1db0c65da385cfd9305587d5 |
| Production-backend | dqffxflaoyarbxyiyhop |
| Dokumentert siste kode-Preview | dpl_DyJEcTbmRETSNCWMB8UYJompaF8r, READY på 6bf84204 |
| Permanent demo | demo; https://expo-proffdok-git-demo-ringside.vercel.app |

Dette tillegget endrer dokumentasjon. De dokumenterte database-, build- og deployment-resultatene er fra forrige kjøring, ikke nye full-app-tester i denne samtalen. GitHub-HEAD, PR-status, faktisk lagring av katalog/avvik/UI/worker/testfiler og original-PDF-ene er kontrollert på nytt. Miljømål for den samlede funksjonen er BEGGE; leveransen går først gjennom eksisterende Sandbox-Preview.

Tidligere håndbok-TEST OK for 6dfb74dad244ff9bd0e416a08f0a34bc88da3c3a gjelder den prøvde håndboken. Ny A2-TEST OK og eksplisitt Production-godkjenning er ikke gitt.

## Originaler og kapittelvalg – brukerpresiseringer 7. oktober

Kenneth ønsker at originalenes kapittelinndeling tas med i vurderingen, samtidig som rutinetekstene skal være selvstendig skrevet. Han har deretter presisert at han ennå ikke har sett ProffDoks inndeling, og spør om den kanskje er bedre. De fem originalkapitlene er dokumentert som kildegrunnlag; det er ikke besluttet å erstatte dagens seks grupper. Vis begge inndelingene og anbefal en praktisk struktur før eventuell endring.

Begge originalene har følgende hovedkapitler, kontrollert i tekst og visuelt på PDF-side 4–5:

1. 01. Vår bedrift
2. 02. HMSK
3. 03. Rutiner
4. 04. Miljø
5. 05. Personvern

| Original | Sider | Varig filreferanse | SHA-256 for kontrollert original |
|---|---:|---|---|
| QualityHandbookpdf.pdf | 148 | libfile_0034077571608191af2e8bfbddf996e7 | 8bf7d80348926287aa34a66282e4bade14ff0d7fcbda186fd365ba77b81f4403 |
| PersonalHandbookpdf.pdf | 127 | libfile_3cebf82948a88191bde1b4dc7a7f8a05 | 49b0e66ebd9a24d259b0971fe3fc0934078c42eaeb71e4ccd9d4a2bb84e1b70a |

Originalene kan hentes igjen med disse filreferansene. Gjeldende lokale kopier i denne samtalen ligger i /workspace/scratch/19673519cc9a/sources/. Ikke bygg videre utelukkende på en gammel lokal filsti. Ikke legg originalenes fulltekst, personlige svar, skjemaer eller illustrasjoner inn i Git-repoet.

Kilder og tema brukes som dekningsgrunnlag. Skriv egne mål, ansvar, fremgangsmåte og dokumentasjonskrav fra arbeidsoppgaven og aktuelle primærkilder. Ikke omskriv originalen setning for setning. Rutineoverskrifter kan være egne, korte beskrivelser. Originalenes kapittel/tema og kildetilknytning skal være sporbar også dersom brukerflaten beholder ProffDoks seks grupper. Gjeldende krav må kontrolleres ved faglig forfatting; historiske covid-regler skal ikke publiseres som universelle gjeldende regler.

### Originalenes fem kapitler og katalogens seks grupper

Katalogen på 228357af bruker fremdeles seks grupper: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet.

Siste brukerinnspill åpner for å beholde ProffDoks seks grupper etter å ha sett dem. Agentens anbefaling er å beholde disse fordi de skiller personal, sikker utførelse og faglig kvalitet som originalene samler i Rutiner. Kapittelvalget er ikke endelig avklart. Inntil konkret nytt valg foreligger beholdes eksisterende struktur. Bevar stabile rutine- og kilde-ID-er, firmaets egne utkast/kapittelvalg, publiserte versjoner, signaturer og bekreftelser. Eventuell senere omgruppering av standardforslag skal ikke automatisk omskrive allerede godkjent firmainnhold.

### Tekstlikhetskontroll utført i denne samtalen

Alle 73 forslag på 228357af ble kontrollert mot full sidevis tekstuttrekking fra begge originalene. Felt: goal, responsibility, procedure, documentation og confirmation. Metode: ordtokenisering uten hensyn til store/små bokstaver; søk etter identiske sammenhengende sekvenser på 16 ord. Resultat: 0 treff.

Denne kontrollen dokumenterer direkte lang tekstlikhet i de valgte feltene. Den avgjør ikke kortere likhet, parafrase, rettslig status eller full faglig kvalitet. Manuell redaksjonell/faglig gjennomgang og firmatilpasning er fortsatt nødvendig.

## Beslutninger som ikke skal spørres om på nytt

- Egen gjennomgang/signering av tildelte rutineutgaver er påkrevd før arbeid etter firmaets regel. Det gjelder også firmaadmin og KS/HMS-ansvarlig. Valget ved publisering gjelder tidspunktet for egen bekreftelse, ikke om kravet er frivillig. Ingen automatisk sperre av andre prosjektmoduler er levert.
- Min personalhåndbok er et søkbart oppslag i egne tildelte publiserte utgaver, også etter bekreftelse. Eksakt utgave, faktisk firmagodkjenner og egen gjennomgang med identitet/tidspunkt skal være synlig.
- Firmaadmin og intern medarbeider med aktiv KS/HMS-ansvarligrolle kan utarbeide og godkjenne rutiner. Firmaadmin styrer modultilgang, utpeking av revisjonsansvarlig og arkivering. Den eksplisitt utpekte ansvarlige signerer årlig revisjon.
- Nye sentrale forslag skal aldri automatisk overskrive firmaets tilpassede utkast, godkjente utgaver eller signaturer.
- Melder velger en aktiv intern bruker med KS/HMS-tilgang som ansvarlig. Eksemplet er Trond som velger Eli.
- Eli får tildelings-e-post og et fast ansvarligvarsel i alle interne appfaner. Trond skal ikke få Elis ansvarligoppgave.
- Eli dokumenterer årsak/tiltak/egen kontroll og lukker selv. Bare valgt ansvarlig kan lukke; firmaadmin kan ikke lukke Elis sak som en annen aktør. Tidligere forslag om separat kontrollør er erstattet.
- Lesing, åpning og fanebytte fjerner ikke oppgaven. Varselet forsvinner først ved bekreftet lagret lukking. Feilet eller tapt lagringssvar skal ikke skape falsk lukking.
- Prosjekt-/sjekkpunktavvik kan kobles inn med stabil kilde. Deretter bestemmer KS/HMS status; den gamle prosjektvisningen kan ikke omgå lukking. Ukoblede prosjektavvik og brukere uten modultilgang beholder eksisterende flyt.
- Avvikssentralen har åpne/lukkede saker, ansvarlig, frist, tiltak, egen kontroll, private vedlegg og hendelseshistorikk. Gjenåpning, omfordeling og revokert tilgang kontrolleres på serveren.
- E-post under utvikling skal ikke sendes til ekte medarbeidere. Mottaker/grant/status kontrolleres før levering; deduplisering, retry, lukking og omfordeling inngår. Ekstern rapportdeling krever konkret mottaker-/innholdsgodkjenning og sendehandling.
- Eksisterende tilbud, autosave/hydrering, innlogging, prissøk, prosjektflyter, garantier og sjekklister skal vernes etter AGENTS.md/PROJECT_GUARDRAILS.md. Main → demo er eneste synkretning.

## Roadmap og faktisk status

| Trinn | Målet | Status / neste arbeid |
|---|---|---|
| A | Aktivering, firmatilgang, oppstart, håndbok/utkast/publisering/versjoner, Min personalhåndbok, egne bekreftelser, oppfølging og signert revisjon | Fundamentet er levert i Preview. Tidligere håndbokprøve er godkjent for sin eksakte versjon. |
| A2 + fremskyndet avvik | Full tematisk rutinedekning fra begge håndbøkene, avvikssentral, prosjektkobling, fast ansvarligvarsel og tildelings-e-post | 73 forslag dekker 121 innholdstemaer + fire metadatarader. Kode og testfiler er lagret. Kapittelvalget vurderes etter sammenligning (Preview har seks grupper). Full-app-/mobilprøve, reelt e-postmottak og A2-TEST OK gjenstår. |
| B | Versjonerte firmamaler/gjennomføringer med og uten prosjekt, typede svar/bilder/filer/signaturer, mobile SJA og 5×5 risikoanalyse | Utførelsesverktøy/SJA/risiko gjenstår. Håndbokrutiner erstatter ikke gjennomføringer. SJA signeres av ansvarlig PL; deltaker-/medvirkningsbevis uten automatisk krav om alle deltakersignaturer. Betingede krav og senere underskjema skal versjoneres og bevare signerte snapshot. |
| C | Flere varsler/påminnelser, kildeoppdateringsforslag, PDF rutine/sjekkliste/SJA/risiko/avvik, begrenset rapportutdrag og valgfritt sluttrapportvalg | Tildelingsworker er fremskyndet til A2. Fristpåminnelser, eksport/PDF/tilsynsuttrekk og øvrig C gjenstår. |
| D | Valgfri individuell kompetanse/kurs/sertifikater/utløp, medarbeidersamtaler/oppfølging med separat HR-tilgang; valgfritt stoffkartotek | Gjenstår. KS-rolle gir ikke automatisk tilgang til andres personalmappe. Innsyn, personvern, oppbevaring og kontrollert sletting må spesifiseres før implementering. |
| E | Ringside-pilot, komplett tematisk/funksjonell kontroll, hjelp, drift/kilderevisjon, kapasitet, godkjenning per release og senere supportmodus | Gjenstår. Support skal være firmagodkjent, tidsbegrenset og logget; ingen signering på vegne av andre. Delvis leveranse skal ikke kalles komplett. |

PLAN.md inneholder detaljert minimumsdekning, offentlige kilder, roller, datamodell og akseptanse. CONTENT_STATUS.md/COVERAGE.md/coverage.json bevarer kildetemaer og sporbarhet. CAPACITY.md beskriver planlagte målinger før bred utrulling.

## Tester og gjenstående blokkeringer

Lagret QA på funksjonskode 6bf84204 dokumenterer 73 Sandbox-kontroller med full rollback, grønn eksisterende håndbokkontroll, faktiske React-handler-/task-/legacy-scenarioer, mailer med erstattet transport og grønn full critical build/Core Safety. Disse kontrollene skal ikke omtales som en innlogget full-app-/mobilprøve.

Full-app/visuell nettleserkontroll gjenstår. Forrige logg registrerer environment_offline i nettleserverktøyet og utilgjengelig lokal testserver. Dette er et verktøyproblem, ikke dokumentasjon på at lagret implementasjon er tapt.

Sandbox-worker v3 er lagret/deployet, men RESEND_API_KEY og CHAT_FROM_EMAIL er ikke konfigurert og sending er deaktivert. EMAIL_SETUP.md beskriver sikkert oppsett, health/check-mode og avtalt mottaksprøve. Ingen hemmeligheter skal legges i chat, kildekode eller dokumentasjon. Faktisk avsenderoppsett og avtalt testmottaker må avklares ved e-postprøven; dette er ikke et åpent spørsmål om avviksfunksjonen.

## Neste avgrensede oppgaver og avbruddsrutine

1. Vis og sammenlign originalenes fem kapitler med katalogens seks grupper. Siste brukerinnspill ber om denne vurderingen før valg. Behold dagens struktur inntil et annet konkret valg foreligger; hvis seks beholdes, trengs ingen omgruppering før skjermprøven. Bevar eksplisitt kildedekning av alle 121 temaer.
2. Gjennomfør relevant skjermprøve på samme faste Preview. USER_TEST.md gir faktiske knappnavn for Trond → Eli → fanebytte/lesing → egen kontroll/lukking → varsel bort, samt koblet/ukoblet prosjektavvik. Hvis nettleserverktøyet fortsatt er utilgjengelig, rapporter den konkrete grensen og bruk dokumentert brukerprøve; ikke start samme verktøykall om og om igjen.
3. Klargjør/avklar e-postoppsett og testmottaker sikkert, og kontroller reelt mottak før funksjonen omtales som ferdig verifisert.
4. Fullfør resterende B–E i avgrensede leveranser etter planen. Ny relevant TEST OK og Production-godkjenning kreves før release.

Ved videre arbeid: les AGENTS.md/PROJECT_GUARDRAILS.md og relevante critical checks; hent aktuell GitHub-HEAD før endring. Bruk separat arbeidsmappe på aktuell head. Ikke resett eller overskriv de gamle arbeidsmappene blindt.

Arbeid i korte, avgrensede deler. Etter hver del lagres kode, migrasjoner, kontrollresultat og oppdatert neste steg i GitHub. Bruk kontroll av forventet branch-SHA ved oppdatering. Endret SHA skal utløse ny lesing/sammenligning; aldri tvangsoverskriv en annen kjøring. Ikke kjør allerede anvendte Sandbox-migrasjoner på nytt uten å kontrollere migrasjonsloggen.

En ny chat kan få denne teksten: «Fortsett KS/HMS Expo ProffDok. Les docs/kshms/CONTINUITY.md på feat-kshms-foundation, deretter gjeldende PLAN/QA/USER_TEST og faktisk branch/PR. Bevar alle beslutninger og hele roadmapen. Fortsett fra første dokumenterte ufullførte oppgave.»

Kapittelsammenligningen er lagt frem i samtalen, med anbefaling om de seks ProffDok-gruppene. Nye funksjonsavklaringer er ikke nødvendige for å fortsette eksisterende Preview-test; kapittelpreferansen kan avgjøres særskilt.

Arbeidsmåten begrenser tap av kontekst og gjenoppbygging ved avbrudd. Den gir ingen garanti mot feil i selve chat-/verktøyplattformen.
