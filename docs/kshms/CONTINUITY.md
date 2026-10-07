# Gjeldende fortsettelsespunkt – sjekklistepopup, 7. oktober 2026

Miljømål **BEGGE**, først samme Sandbox Preview. Forrige kjøring fortsatte i bakgrunnen etter forbindelsesbruddet og publiserte kodehead `dba4ee3ad8ce700e5eb64df101f95063c65a1d91` (tree `207d8051c449aee8e94d6bdda11805739cc3f015`). En separat recovery-arbeidsmappe ble derfor åpnet på den eksakt samme lokale treutgaven for å unngå samtidige overskrivinger. Ikke bygg denne funksjonen på nytt.

Fast Preview: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe. Vercel `dpl_DCieSStSwjVhZq6rQS9iDNCAiG7C` READY; branchvariabelen `EXPO_BACKEND_TARGET=sandbox` er kontrollert. PR Core Safety run `37668916442` completed/success. Main var uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Ingen Production-migrasjon, merge eller demo-synk.

Avklart funksjon: kompakt ordremeny; ingen automatisk våtromsliste i generelle ordrer; egne punkter uten KS/HMS-/garantikrav på disse ordrene; publiserte firmamaler ved aktiv firmamodul. Listene starter kollapset. Popupen har **Lagre**, **Sjekkliste fullført**, **Start ny kontroll** og historikk. Vanlige åpne sjekkpunktavvik kan følges opp i en ny kontroll via Gå til punkt; historikken beholdes. Samtidige endringer gir konfliktvisning, og videreføring av lagret kontroll beholder tidligere lokal kladd for sammenligning.

Kontroll ved overtakelsen: full critical QA/Sandbox-build PASS; de eksisterende React-prøvene for sentralen/popupen samt en ekstra konkret prøve for konflikthåndtering og avviksoppfølging PASS. Utvidet faktisk Sandbox SQL har **35 kontroller PASS med rollback**. Ingen ny databasemigrasjon ble nødvendig i denne overtakelsen. Den ekstra SQL-prøven verifiserer lukking i ny kontroll, egne nye punkter, gjenåpning, koblet KS/HMS-status og bevart fullført snapshot.

Innlogget desktopprøve på samme Preview er nå PASS: demoordre `a45b0000-0000-4000-8000-000000000001`; egen kategori Annet fag med punkt **QA – sjekklistepopup, syntetisk prøve 07.10.2026**. Lagre → lukk → reload → åpne bevarer Ok og kommentaren. Første fullføring `ddee47a5-84fe-43b1-a18c-a93d0707ca4c` kl. 20:55:53 Europe/Oslo; ny kontroll starter uten tidligere svar og fullføres separat som `7832ff92-31e3-479a-bc2c-13c7a0261bdf` kl. 20:57:08 med Ikke aktuelt og en annen kommentar. Begge har Kenneth Demo som faktisk aktør. Historikken viser begge; første kontroll gjenåpnes skrivebeskyttet med sitt opprinnelige Ok og sin opprinnelige kommentar. [Skjermbevis](checklist-popup-history-proof.jpg). Bare det tydelig merkede testpunktet har fått disse syntetiske gjennomføringene; den innhentede Bunnledning-listen er bare åpnet og inspisert.

Neste handling er Kenneths korte prøve øverst i USER_TEST.md. Ingen ny bruker-TEST OK eller Production-godkjenning hevdes. Ikke gjenta allerede beståtte runder uten en ny feil. To samtidige personer er kontrollert i database-/komponentprøver, ikke som to faktiske browserinnlogginger. Mobilbredde, fysisk kamera, ny PDF og UE-portal for lister med nye gjennomføringer er ikke verifisert her. De gjenværende roadmapdelene består.

---

## Siste overgangskontroll – åpne sjekkliste i generell ordre

Den avklarte inngangen består: generelle ordrer henter under **Sjekklister**, våtrom under **Fag/utstyr**. Baseline er 4b84bab86d1172f84c189615c4f99d17401d9be4. «Åpne sjekkliste» kan nå også åpne riktig gruppe når ChecklistEditor allerede er montert på samme fane; den eksisterende hopprutinen håndterer både mount og et avgrenset åpningssignal. Svar/kladd og prosjektrettigheter endres ikke. Kort faktisk React-prøve av kollapset gruppe → åpnesignal PASS; full critical QA/Sandbox-build PASS. Ingen ny SQL, e-post, main-/demo-merge eller Production-endring. Sjekk aktuell feature-HEAD og fast Preview ved videre arbeid; ikke gjenta eldre fulltester. Den korte prøven i USER_TEST er fortsatt neste brukerhandling.

# Gjeldende fortsettelsespunkt – Sjekklistesentral, 7. oktober 2026

Kenneth har gitt **TEST OK for popup og direkte lukking på ca2f0cb676755338c87e3d4f2a082281d309da8b**. Ikke start denne hele flyten igjen automatisk. Ny bestilling er fagspesifikk Sjekklistesentral med innhenting under Sjekklister i generelle ordrer og Fag/utstyr i våtromsprosjekter. Tilgang avklart: **«Har firma KS/HMS modulen så ja»** – prosjektbrukere trenger ikke personlig KS/HMS-grant for å hente publiserte lister. Sentralen bygges av firmaadmin/KS/HMS-ansvarlig. Ukoblede prosjektavvik fungerer som før.

Sjekklistesentral, publisering og versjonsfaste prosjektkopier er implementert. Kenneth presiserte at generelle ordrer ikke trenger Fag/utstyr. Innhenting ligger derfor direkte under Sjekklister i generell ordre, mens våtrom bruker Fag/utstyr. Ordrebegrensningene består. Nye migrasjoner er anvendt kun i Sandbox. **27 faktiske databasekontroller PASS med rollback**, permanent handler-/kopiregresjon PASS, kort faktisk React-flyt PASS. Se [CHECKLIST_CENTRAL_20261007.md](CHECKLIST_CENTRAL_20261007.md) for eksakt scope, migrasjoner og begrensninger. USER_TEST har neste korte prøve. Arbeidsbranchen er fortsatt feat-kshms-foundation/PR #216; bruk samme faste Preview. Main ved siste kontroll er 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen merge eller Production-/demo-endring er utført.

Dette er én avgrenset del av B, ikke hele roadmapen. Bevar kapitler/rutiner og gjeldende avviksrettigheter. Selvstendige gjennomføringer, vernerunder, SJA, risiko, HR, påminnelser, eksport/PDF og pilot/drift gjenstår. Bruk korte målrettede kontroller; Kenneth tester i Preview. Ikke erstatt historikk nedenfor eller spør om avklarte tilgangsvalg igjen.

---

# KS/HMS – gjeldende fortsettelsespunkt

Oppdatert 7. oktober 2026, Europe/Oslo. Dette dokumentet samler gjeldende brukerbeslutninger og verifiserte referanser etter to avbrutte samtaler. En ny chat skal lese dette først, deretter PLAN.md, SCOPE_A2.md, QA.md og USER_TEST.md. Dette er ikke en ordrett kopi av historikken eller en attest på at hele modulen er ferdig.

## Gjeldende rettelse – kontrolltekst, direkte lukking og popup

Brukeren har lagt inn kontrolltekst flere ganger; «Lagre endringer» slettet den og flyttet fokus oppover. Rotårsaken er gjenskapt i en avgrenset Sandbox-transaksjon: kshms_deviation_command satte control_note til tom streng ved vanlig save. Den gamle fokus-/scroll-effekten kjørte også etter lagring. Brukeren ønsker eksisterende avvik i en popup som lukkes ved lagret lukking, og korte tekster som «OK» i lukkefeltene.

Miljømål BEGGE, først samme Sandbox-Preview. Kontrollert branch-parent 342cf3cadcea3aaa1ecfdb8130ffde96bf17996f; main før endring 155f6c4ac01f126c1db0c65da385cfd9305587d5. Scope: KshmsDeviations.jsx, kshmsDeviations.mjs, DeviationDialog.jsx, deviationDialog.css, eksisterende critical-avvikscheck, én målrettet SQL-check, én ny migrasjon og disse fire test-/fortsettelsesdokumentene. Toppvarselets kompakte utforming fra forrige rettelse består.

- Alle KS/HMS-saker åpner i den eksisterende React-eide popupen. «Lagre og lukk avvik» lagrer hele skjemaet og lukker popupen først etter kontrollert readback av firma/sak, egen signatur, status og innsendt tekst. Ved feil beholdes popup, tekst og lokal kladd. Lukkekrysset beholder kladden; åpning av samme sak henter den automatisk tilbake. Samtidig nyere serverversjon vises som konflikt.
- «Lagre uten å lukke» bevarer kontrollteksten uten å signere/lukke saken, og flytter ikke fokus eller scroll oppover. Readback som ikke inneholder innsendt tekst godtas ikke som vellykket lagring.
- Årsak, Utførte tiltak / forbedring og Egen kontroll av resultatet krever bare ikke-tom tekst; «OK» godtas både i klient og server. Tomme/blanke felter, manglende egen kontroll og lukking på andres vegne avvises fortsatt. Tittel/hendelse/ansvar/frister følger eksisterende regler.
- Migrasjon 20261007163024_kshms_control_note_direct_close.sql er anvendt bare på Sandbox ppvircenkjizeiqdxphj. Vanlig save bevarer control_note. Firma-/tilgangs-/ansvars-/revisjonskontroller, prosjektlås, historikk og varsler er videreført. CLI var ikke installert og npm-tilgang returnerte 403; lokal fil bruker versjonen fra faktisk MCP-migrasjonslogg, ikke en oppdiktet tidsverdi.

Utviklerbevis: permanent critical-kshms-deviations-check PASS med korttekst, uventet teksttap/readback-avslag, lokal gjenåpning, vanlig save, feilet close og bekreftet close som fjerner popupstate. Full EXPO_BACKEND_TARGET=sandbox npm run build PASS. En kort prøve med de faktiske React-komponentene i jsdom og avgrenset RPC-stub PASS: eksisterende sak i portal, gjenfunnet tekst, samme popup/scroll etter vanlig save, beholdt tekst ved feil og automatisk lukking etter bekreftet close. Dette er ikke en innlogget skynettleserprøve.

Databasebevis: scripts/kshms-deviation-save-close-sandbox-check.sql gjenskaper først «Save erased the control note». Rettelsen passerer deretter 14 kontroller både i kandidattransaksjon og etter anvendt migrasjon. Alle syntetiske rader rulles tilbake; ingen reell sak, HTTP eller e-post berøres. EXECUTE er fortsatt sperret for anon, tillatt for authenticated; tom search_path og private tilgangskontroller består. Advisor er kontrollert; den generelle merknaden om bevisst SECURITY DEFINER-RPC vurderes sammen med require_context, firmakontroll og ansvarligsperre. E-postworker er fortsatt deaktivert.

Brukerens korte Preview-prøve gjenstår. Ingen ny full skynettleserrunde; mobil, to faktiske brukerøkter og e-postmottak er fortsatt uprøvd. Ikke gjenta hele opprettelses-/omfordelingsløpet automatisk. Ingen main-/demo-merge eller Production-endring. Hele roadmapen nedenfor består. Det tidligere avsnittets 5/10/10-grenser er erstattet etter brukerens uttrykkelige ønske.

## Tidligere fortsettelsespunkt etter nytt chatbrudd – 7. oktober 2026

**Tillegg med de konkrete bevisene fra den opprinnelige dialogkjøringen:** AVVIK_DIALOG_20261007.md er nå ferdig med case-ID-er 68a26ff6-d9c2-4e1e-a766-e3769b2060fa og 6dc89fcd-bb48-44a0-9430-31dbeb75bcaa, SQL-bekreftet egen lukking, Lukket tilbake i prosjektet og siste faktiske reload på d73. To skjermbevis er lagret med varige referanser. Alle tre opprinnelige prosjektavvik er uendrede, worker er verifisert deaktivert og ingen sending er utført. Dette kompletterer den avbrutte kjøringens bevis; det er ikke en ny automatisk full omtest. Delavsnittet «Siste skjermstatus fra den avbrutte chatten» beskriver hva som var tilgjengelig ved den parallelle gjenopptakelsen før bevisene ble lagret. Den korte tretrinnsprøven i USER_TEST.md og hele roadmapen beholdes.

Dette avsnittet er nyere enn statusene og testlistene nedenfor. Brukeren har bedt om at han tester skjermflyten i den faste Preview-adressen, mens assistenten gjør korte, målrettede utviklerkontroller. Ikke start en ny full skynettleserrunde eller gjenta beståtte prøver uten en konkret grunn. Gi én avgrenset brukerprøve om gangen, rapporter resultat og lagre neste steg før videre arbeid. Dette erstatter de eldre arbeidsmåteformuleringene om at brukerens Preview-prøve ikke kan erstatte utviklerens lange skjermrunde. Relevante permanente critical checks, sikker lagring og eksplisitt TEST OK før eventuell merge gjelder fortsatt.

### Uavhengig kontrollert ved denne gjenopptakelsen

- Arbeidsbranch: feat-kshms-foundation. Funksjonskode: d73cd78935ab769b36c37ae4721934f586f05d27.
- Siste kodecommit er «fix(kshms): keep assignment identity in case and align dialog controls». Forrige kodecommit 88e1bfec7655026ecdb08c9b9796d7cb5b97938b inneholder stor avviksdialog og sikker prosjektkobling.
- Vercel dpl_G5pZJCaMa4pQwNyu1DcakbXt4AiA er READY på d73cd789. Fast alias peker på denne deploymenten: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe .
- GitHub PR Core Safety 37644638589 er completed/success på d73cd789. Eksisterende CI er lest; ingen full lokal build eller database-/skynettleserprøve er gjentatt i denne gjenopptakelsen.
- PR #216 er fortsatt åpen draft, ikke merget. Main er fortsatt 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen Production- eller demo-endring utføres.
- Begge håndbøkenes dekningsgrunnlag, 73 selvstendige forslag, 121 innholdstemaer og seks vedtatte hovedkapitler er bevart. Ikke spør om kapittelvalget på nytt.
- Gjenværende B–E er fortsatt hele utførelsesdelen med firmamaler/sjekklister/vernerunder, SJA, 5×5 risiko, øvrige varsler/PDF/rapporter, separat individuell HR/kompetanse/medarbeidersamtaler, valgfritt stoffkartotek og pilot/drift.

### Siste skjermstatus fra den avbrutte chatten

Brukeren har limt inn den siste assistentstatusen fra forrige økt. Den rapporterer at ny dialog åpner med tittelfokus, kladd overlever omlasting, valgt annen syntetisk ansvarlig beholdes og lagring åpner riktig KS/HMS-sak direkte. Melder får ikke den andres ansvarligvarsel og kan ikke lukke på den andres vegne. Deretter er overtakelse/egen lagret lukking, forsvunnet ansvarligvarsel, Lukket i prosjektet og tildelings-/overtakelses-/lukkehistorikk rapportert. Full-app-mobil var fortsatt utestående. Chatten frøs ved «Bekrefter lukket prosjektavvik etter omlasting», med planindikator «1 av 4».

Dette videreføres som rapportert resultat fra den avbrutte økten, ikke en ny skjerm- eller databaseprøve. Eksakt sak-ID, nye rå skjermbevis og en eksplisitt siste readback etter den aller siste omlastingen er ikke lagret i de gjenfunne testnotatene. Ikke konstruer disse eller grader siste omlasting som ny PASS. Eldre dokumenterte case-ID-er og UI-prøver beholdes som historikk. Koden og deploymenten over er uavhengig gjenfunnet; arbeidet skal ikke bygges på nytt fordi testnotatene var eldre.

### Neste avgrensede handling

Brukeren prøver først bare den nye dialogen på samme faste Preview: lagret prosjekt → Avvik → + Nytt HMS/prosjektavvik → velg ansvarlig og frist → Lagre avvik for oppfølging. Stor dialog, faktisk brukervalg og direkte åpning av riktig KS/HMS-sak skal vises. Se den korte aktuelle listen øverst i USER_TEST.md. Deretter håndteres brukerens resultat før neste avgrensede prøve eller utførelsesleveranse. To separate faktiske brukerøkter, mobil, avviksteller/ukoblet legacy og reelt e-postmottak beholdes som ufullførte kontroller; ingen lang omtest startes automatisk.

E-postlevering i Preview er fortsatt dokumentert deaktivert på grunn av manglende Sandbox-avsenderoppsett. Ingen faktisk mottaksprøve er bekreftet. Den tilstanden er ikke kontrollert på nytt i databasen ved dette dokumentarbeidet.

## Tidligere checkpoint: ny avviksrunde – 7. oktober, etter brukerens krasjrapport

Arbeid fra kontrollert 794a9e5f, nå testet funksjonskode d73cd78935ab769b36c37ae4721934f586f05d27. Brukerens removeChild-feil er gjenskapt med faktisk React-renderer/DOM-adapter og løst i samme prøve. Stor dialog, faktisk ansvarligvalg, frist, «Lagre avvik for oppfølging», bekreftet prosjektkilde/KS-kobling og beholdt kladd er publisert på den faste Preview-adressen. Egen innlogget skynettleserprøve passerer ny separat prosjektavviksrad → valgt medarbeider → direkte åpnet sak → omfordeling til egen bruker → dokumentert egen lukking → Lukket tilbake i prosjektet → faktisk reload. Ny opprettelse/lukking på siste d73-kode passerer også; ansvarlig-ID beholdes i KS-saken, uten redundant ID i prosjektposten. Ditt eksisterende Test-prosjektavvik åpner riktig koblingsdialog med beskrivelse/frist og uten automatisk tolking av fritekstnavn; det er ikke endret eller koblet av utvikleren. Se AVVIK_DIALOG_20261007.md for case-ID-er, skjermbevis og testgrenser. Mobil og to separate innloggede brukere gjenstår. Tidligere UI-prøver beholdes som historikk.

## Mål og leveranseomfang

Bygge en integrert KS/HMS-modul i Expo ProffDok, med Ringside som pilot og mulighet for flere firmaer. Modulen skal omfatte selvstendige, tilpassbare rutiner, dokumentert egen gjennomgang, oppfølging/revisjon, utførelsessjekklister, SJA, risikovurdering, avvik/RUH, varsler og rapporter. Valgfrie deler omfatter individuell personal/kompetanse og stoffkartotek. Kapasitetsmålet på 100 firmaer er en plan, ikke en utført lasttest.

Modulen aktiveres per firma av systemadmin. Firmaadmin gir aktive interne medarbeidere tilgang. Kunde, UE og innleid får ingen ny KS/HMS-modulrettighet. Online mobilbruk er tilstrekkelig i første leveranse. Ordre, timer, materiell, ressursplanlegging og betalingsintegrasjon bygges ikke i denne modulen. Pris/fakturering er fortsatt uavklart og blokkerer ikke gjeldende Preview-arbeid.

## Kontrollert Git- og miljøpunkt

| Referanse | Status ved kontroll 7. oktober |
|---|---|
| Repo | ExpoProffsenter/expo-proffdok |
| Arbeidsbranch | feat-kshms-foundation |
| Siste faktisk UI-testede funksjonskode | d73cd78935ab769b36c37ae4721934f586f05d27 |
| Tidligere A2-funksjonskode med 73 SQL-kontroller | 6bf84204db9c7869bebafb19c034dc02f53f25ca |
| PR | #216, åpen draft, ikke merget |
| Eksisterende checkpoint | checkpoint-kshms-recovery-20261006, 9e88f4cc41db905898a4fbf0e013905ddee30343 |
| Fast Preview | https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe |
| Preview-backend | Sandbox ppvircenkjizeiqdxphj; branch-spesifikk EXPO_BACKEND_TARGET=sandbox |
| Main ved kontroll | 155f6c4ac01f126c1db0c65da385cfd9305587d5 |
| Production-backend | dqffxflaoyarbxyiyhop |
| Siste faktiske skjermprøve-Preview | dpl_G5pZJCaMa4pQwNyu1DcakbXt4AiA, READY på d73cd789 |
| Siste funksjonskode CI | PR Core Safety 37644638589, success på d73cd789 |
| Permanent demo | demo; https://expo-proffdok-git-demo-ringside.vercel.app |

Denne runden endrer avviksdialog, nødvendige prosjektkoblinger og to tekstetiketter som utløste krasjet; ingen SQL/RLS/Auth/e-post- eller demoendring. Full EXPO_BACKEND_TARGET=sandbox npm run build passerer på siste kode. READY, Core Safety og branch-spesifikk Sandbox-binding er kontrollert. Dokumentasjon av siste prøve lagres etter funksjonscommiten. Tidligere 73 SQL-kontroller gjentas ikke uten ny grunn. Historiske håndbok-/sjekkpunktprøver står i UI_TEST_20261007.md; ny dialogprøve står i AVVIK_DIALOG_20261007.md. Miljømål BEGGE; kun eksisterende Sandbox-Preview er oppdatert.

Tidligere håndbok-TEST OK for 6dfb74dad244ff9bd0e416a08f0a34bc88da3c3a gjelder den prøvde håndboken. Ny A2-TEST OK og eksplisitt Production-godkjenning er ikke gitt.

## Originaler og vedtatt kapittelinndeling – 7. oktober

Kenneth har etter sammenligningen besluttet å beholde ProffDoks seks inndelinger **som egne hovedkapitler**: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet. Originalenes fem kapitler beholdes som sporbar kildestruktur. Rutinetekstene skal fortsatt være selvstendig skrevet. Kapittelvalget er avklart og skal ikke spørres om på nytt.

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

Kilder og tema brukes som dekningsgrunnlag. Skriv egne mål, ansvar, fremgangsmåte og dokumentasjonskrav fra arbeidsoppgaven og aktuelle primærkilder. Ikke omskriv originalen setning for setning. Rutineoverskrifter kan være egne, korte beskrivelser. Originalenes kapittel/tema og kildetilknytning skal være sporbar sammen med brukerflatens seks egne hovedkapitler. Gjeldende krav må kontrolleres ved faglig forfatting; historiske covid-regler skal ikke publiseres som universelle gjeldende regler.

### Originalenes fem kapitler og katalogens seks grupper

Katalogen på 228357af bruker fremdeles seks grupper: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet.

Brukerens valg er bekreftet 7. oktober 2026 kl. 14:31 Europe/Oslo: seks egne hovedkapitler. Katalogen har allerede disse seks. Kodekontroll av KshmsModule.jsx bekrefter separate kapittelområder med egne h3-overskrifter for firmaets rutiner; KshmsRoutineLibrary.jsx har et kapittelvalg for standardforslagene. Innlogget skjermprøve 7. oktober bekrefter alle seks valg i «Vis kapittel», 73 forslag og eget filter for «Fag og kvalitet». Firmaets ti eksisterende rutiner ligger under fem befolkede kapitteloverskrifter; ingen fagrutine er valgt der ennå. Bevar stabile rutine- og kilde-ID-er, firmaets egne utkast/kapittelvalg, publiserte versjoner, signaturer og bekreftelser. Omgruppering til originalenes fem kapitler skal ikke gjennomføres. Ingen rutinetekst eller firmadata endres av denne beslutningsregistreringen.

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
| A2 + fremskyndet avvik | Full tematisk rutinedekning fra begge håndbøkene, avvikssentral, prosjektkobling, fast ansvarligvarsel og tildelings-e-post | 73 forslag dekker 121 innholdstemaer + fire metadatarader; seks egne hovedkapitler er vedtatt. Innlogget desktopprøve passerer kapittelfilter, firmaavvik, koblet eget sjekkpunkt og separat prosjektavvik med stor dialog, kladd, faktisk ansvarligvalg, egen lukking og omlasting. To separate brukerøkter, full ukoblet legacy-lukking/gjenåpning, avviksteller for egne sjekkpunkter, full-app-mobil, reelt e-postmottak og A2-TEST OK gjenstår. |
| B | Versjonerte firmamaler/gjennomføringer med og uten prosjekt, typede svar/bilder/filer/signaturer, mobile SJA og 5×5 risikoanalyse | Utførelsesverktøy/SJA/risiko gjenstår. Håndbokrutiner erstatter ikke gjennomføringer. SJA signeres av ansvarlig PL; deltaker-/medvirkningsbevis uten automatisk krav om alle deltakersignaturer. Betingede krav og senere underskjema skal versjoneres og bevare signerte snapshot. |
| C | Flere varsler/påminnelser, kildeoppdateringsforslag, PDF rutine/sjekkliste/SJA/risiko/avvik, begrenset rapportutdrag og valgfritt sluttrapportvalg | Tildelingsworker er fremskyndet til A2. Fristpåminnelser, eksport/PDF/tilsynsuttrekk og øvrig C gjenstår. |
| D | Valgfri individuell kompetanse/kurs/sertifikater/utløp, medarbeidersamtaler/oppfølging med separat HR-tilgang; valgfritt stoffkartotek | Gjenstår. KS-rolle gir ikke automatisk tilgang til andres personalmappe. Innsyn, personvern, oppbevaring og kontrollert sletting må spesifiseres før implementering. |
| E | Ringside-pilot, komplett tematisk/funksjonell kontroll, hjelp, drift/kilderevisjon, kapasitet, godkjenning per release og senere supportmodus | Gjenstår. Support skal være firmagodkjent, tidsbegrenset og logget; ingen signering på vegne av andre. Delvis leveranse skal ikke kalles komplett. |

PLAN.md inneholder detaljert minimumsdekning, offentlige kilder, roller, datamodell og akseptanse. CONTENT_STATUS.md/COVERAGE.md/coverage.json bevarer kildetemaer og sporbarhet. CAPACITY.md beskriver planlagte målinger før bred utrulling.

## Tester og gjenstående blokkeringer

Lagret QA på funksjonskode 6bf84204 dokumenterer 73 Sandbox-kontroller med full rollback, grønn eksisterende håndbokkontroll, faktiske React-handler-/task-/legacy-scenarioer, mailer med erstattet transport og grønn full critical build/Core Safety. Disse kontrollene skal ikke omtales som en innlogget full-app-/mobilprøve.

UI_TEST_20261007.md dokumenterer de tidligere innloggede desktopprøvene: firmaavvik 683a29cb-4ccd-47db-9377-8d8504d86db2 og koblet sjekkpunkt bbaa4b37-48d3-49d1-99d8-96da49e73cbf. AVVIK_DIALOG_20261007.md dokumenterer denne rundens to separate prosjektavvik 68a26ff6-d9c2-4e1e-a766-e3769b2060fa og 6dc89fcd-bb48-44a0-9430-31dbeb75bcaa, begge lagret lukket. Første prøve velger en annen ansvarlig og omfordeler deretter til egen testbruker; det er ikke en separat medarbeiderinnlogging. Kladd hentes etter reload, riktig sak åpner direkte, egen lukking bekreftes med aktør/tid og vises tilbake i prosjektet etter reload. Alle tre eksisterende prosjektavviksrader er uendrede. Ny stor React-dialog erstatter den tidligere native prompten; den gamle getJsDialog-grensen er historikk, uten omgåelse. Dev-logs er utilgjengelig i denne browserøkten; DOM/AX/skjerm og databasekontroll virker. Mobilbredde kan ikke settes med denne øktens dokumenterte API, så ingen mobil-PASS. To brukerøkter, full legacy-lukking/gjenåpning, toppfanens teller for egne sjekkpunkter og faktisk e-postmottak gjenstår. Arbeider enabled=false og samtlige tre nye utboksrader pending/attempts=0/sent_at=null. Tidligere environment_offline er kontrollhistorikk.

Sandbox-worker v3 er lagret/deployet, men RESEND_API_KEY og CHAT_FROM_EMAIL er ikke konfigurert og sending er deaktivert. EMAIL_SETUP.md beskriver sikkert oppsett, health/check-mode og avtalt mottaksprøve. Ingen hemmeligheter skal legges i chat, kildekode eller dokumentasjon. Faktisk avsenderoppsett og avtalt testmottaker må avklares ved e-postprøven; dette er ikke et åpent spørsmål om avviksfunksjonen.

## Neste avgrensede oppgaver og avbruddsrutine

1. Kapittelvalget er avklart og innlogget kapittelfilter er prøvd: behold seks egne hovedkapitler og eksplisitt kildedekning av alle 121 temaer. Ikke omgrupper standardbiblioteket til originalenes fem kapitler.
2. Fortsett med to separate brukere etter Trond → Eli-eksemplet, full ukoblet legacy-lukking/gjenåpning, målrettet undersøkelse av toppfanens antall for egne sjekkpunkter og mobil på samme faste Preview. Eget sjekkpunkt og separat prosjektavvik → KS/HMS → lagret lukking/omlasting er bestått; ikke gjenta disse eller firmaets håndbokgodkjenninger uten grunn. USER_TEST.md gir faktisk brukerprøve for den nye dialogen. Brukerens Preview-prøve erstatter ikke utviklerens skjermtest. Ved sperret innloggings-/dialogverktøy: følg dokumentert sikker overlevering når tilgjengelig; ikke omgå beskyttelsen eller kjør samme avviste kall i løkke.
3. Klargjør/avklar e-postoppsett og testmottaker sikkert, og kontroller reelt mottak før funksjonen omtales som ferdig verifisert.
4. Fullfør resterende B–E i avgrensede leveranser etter planen. Ny relevant TEST OK og Production-godkjenning kreves før release.

Ved videre arbeid: les AGENTS.md/PROJECT_GUARDRAILS.md og relevante critical checks; hent aktuell GitHub-HEAD før endring. Bruk separat arbeidsmappe på aktuell head. Ikke resett eller overskriv de gamle arbeidsmappene blindt.

Arbeid i korte, avgrensede deler. Etter hver del lagres kode, migrasjoner, kontrollresultat og oppdatert neste steg i GitHub. Bruk kontroll av forventet branch-SHA ved oppdatering. Endret SHA skal utløse ny lesing/sammenligning; aldri tvangsoverskriv en annen kjøring. Ikke kjør allerede anvendte Sandbox-migrasjoner på nytt uten å kontrollere migrasjonsloggen.

En ny chat kan få denne teksten: «Fortsett KS/HMS Expo ProffDok. Les docs/kshms/CONTINUITY.md på feat-kshms-foundation, deretter gjeldende PLAN/QA/USER_TEST og faktisk branch/PR. Bevar alle beslutninger og hele roadmapen. Fortsett fra første dokumenterte ufullførte oppgave.»

Kapittelsammenligningen er lagt frem og Kenneth har valgt de seks som egne hovedkapitler. Nye funksjonsavklaringer er ikke nødvendige for å fortsette eksisterende Preview-test.

Arbeidsmåten begrenser tap av kontekst og gjenoppbygging ved avbrudd. Den gir ingen garanti mot feil i selve chat-/verktøyplattformen.


## 2026-10-07 — kompakt ordremeny og sjekklistepopup

Miljømål BEGGE. Arbeidet bygger på remote 12183b181e4ce603394ac71b817b3eccb3fac6fa. Bare eksisterende feature/Sandbox Preview oppdateres; ikke main eller produksjonsdatabasen.

Generelle ordrer bruker prosjektets kompakte desktopmeny med ordreetiketter og uten skjulte våtromsfaner. Ingen standard våtromsliste legges automatisk til. Egne sjekkpunkter kan legges til uten garanti eller personlig KS/HMS-tilgang. Firmaets aktiverte modul styrer fortsatt innhenting av publiserte malutgaver. Eksisterende svar som ikke er aktive i ordren, beholdes under «Tidligere dokumentasjon».

Sjekklistene og innhentingen vises kollapset. «Åpne sjekkliste» åpner en React-eid popup. «Lagre» lagrer en kontroll under arbeid for videreføring av personer som allerede har prosjektets redigeringsrett. «Sjekkliste fullført» lagrer en uforanderlig kontroll med definisjon, svar, bilder, serverens brukeridentitet og tidspunkt. «Start ny kontroll» beholder fullførte kontroller og viderefører åpne/koblede avvik. Fullføring lukker ikke avvik. Egne punkter kan legges til en pågående kontroll; fullførte og innhentede maldefinisjoner forblir faste.

Prosjektkontroller lagres i private tabeller med eksisterende prosjekt-/firma-/profilkontroll og låssjekk. Ingen personlig KS/HMS-rett kreves for egne punkter. Revisjonskontroll hindrer at to personer overskriver hverandre. Faste lagrings-ID-er gjør tapt svar trygt å prøve igjen. Readback kontrolleres før lokal kladd slettes. Triggeren beskytter popupens svar mot forsinket vanlig prosjekt-autolagring; eksisterende KS/HMS-trigger kjøres etterpå og beholder autoritativ avvikslukking. Andre prosjektdata, signaturer, vedlegg og legacyavvik beholdes.

Sandbox-migrasjonsloggen er fasit for filnavn: 20261007180955 project_checklist_runs, 20261007182126 project_checklist_command_scope, 20261007182209 project_checklist_command_block, 20261007182259 project_checklist_mirror_scope og 20261007182742 project_checklist_custom_points. De små oppfølgingsmigrasjonene retter SQL-variabelscope før publisering og tillater egne punkter i en kladd. De skal følge grunnmigrasjonen i samme rekkefølge ved senere godkjent produksjonsutrulling.

Verifisert: 31 reelle SQL-kontroller med syntetiske rader og rollback; faktisk React-popup med fanebytte, lagringsfeil/retry, kollegas videreføring, egne nye punkter, bilder, flere kontroller, historikk, konfliktvisning, skrivebeskyttelse og sen firmabytte-respons; kompakt ordremeny videresender til native knapper uten skjulte våtromsvalg. Eksisterende React-test for malbygging/publisering/innhenting og montert sjekklistehopp passerer. «Åpne først»-kravet endrer med vilje gammel tests forventning om automatisk utvidet liste; hoppkontrakten er bevart. Ny critical-check er lagt inn i build/QA. Innlogget Preview-prøve gjenstår før TEST OK/merge.

Kort brukertest på samme faste Preview: Åpne testordren → Sjekklister. Menyen skal være kompakt og listene kollapset. Åpne «Egne sjekkpunkter og vedlegg», legg til et punkt, åpne listen og lagre. Åpne den igjen (gjerne med en annen person som har prosjektadgang), fortsett og trykk «Sjekkliste fullført». «Start ny kontroll» skal åpne neste kontroll mens den første kan leses i historikken. Prøv også en publisert KS/HMS-liste.
