# Nattoppdrag og HR-startfunn – 5. november 2026

Kenneth har bestilt selvstendig nattarbeid etter låst chat: komplett videre QA/bugfix/UX/UI i hele appen og flere faktiske videoer. Ny konkret prioritet er medarbeidersamtaler: tegnbegrensning og unødig frem/tilbake rundt ansvar, frister og varsler. Dette er ikke TEST OK eller produksjonsautorisasjon.

Miljømål BEGGE. Nå utføres arbeid bare i Preview/Sandbox. PR311 / fase45b-whole-app-qa-20261104 er helappgrunnlag; PR308/309/310 bevares som separate pakker. Fast Preview:
https://expo-proffdok-git-fase45b-whole-app-qa-20261104-ringside.vercel.app/?progressTest=safe

## Kontinuitet og faktisk kontroll ved nattstart

- AGENTS.md, hele PROJECT_GUARDRAILS.md og docs/DEVELOPMENT_WORKFLOW.md er lest.
- Faktisk remote og eksisterende lokale checkout samsvarer på eea4537370405b808ed6b0361b40e8de0f26ab96. Lokal checkout: /workspace/scratch/dce73051881d/expo-proffdok; scratch er ikke varig fasit.
- CI945/run41954050830 er fortsatt in_progress ved kontrollen ca.03.20 norsk tid. Scope, build, hr-db, hr-react, company-db og bolig-db var grønne; app-browser, projects-support og bolig-browser pågikk. Ingen full grønn attest ennå.
- Les docs/qa/STOCKTAKE_AREAS_20261105.md før videre varetellingsarbeid. Sandbox-migrasjonen er allerede installert og canonical20261105014939; ikke installer på nytt. Ny status-/utkastrettelse ligger i eea45373. Opprinnelige tellinger skal bevares.
- Timevise oppfølginger er opprettet for denne natten frem til07.20 Europe/Oslo. Umiddelbar start ble kjørt i denne samtalen, ikke bekreftet som separat bakgrunnsjobb. Ikke start konkurrerende skriving dersom annen kjøring er aktiv.

## HR: bekreftede kildefunn, ingen apprettelse ennå

Gjennomgått kilde på eea45373, uten lesing eller endring av reelle personlige samtaler:

| Område | Bekreftet kildeatferd |
| --- | --- |
| Tiltakstekst | HrConversations.jsx bruker maxLength600. SQL-versjonene av hr_conversation_command validerer samme600-grense. En ren økning i HTML-feltet er derfor utilstrekkelig. |
| Forberedelse og møtesvar | HTML-feltene bruker maxLength4000. Den opprinnelige private svarvalidatoren i20261011134804 validerer4000. Avstem senere funksjonsdefinisjoner før endring. |
| Kommentarer | HTML-feltene bruker maxLength4000. Senere kommentarhåndtering i20261012080426 validerer4000. |
| Dobbeltregistrering | Standardmalens møtespørsmål «Avtaler og tiltak» ber om hva, ansvarlig, frist og neste oppfølging. Neste separate Tiltak-steg krever de samme strukturerte opplysningene. |
| Kommentarer | Standardmal har «Egne kommentarer» i møtefelt og egne rolleavgrensede kommentarer under Referat. Bevar meningsfullt innhold i eksisterende lagrede maler; ikke omtolk historikk. |
| Oppfølgingsdato | SQL krever next_on når tiltak finnes, i tillegg til frist på hvert tiltak. Betydningen og varslingskoblingen må avstemmes før forenkling. |
| Varsler/kalender | Kalender, lederpåminnelse, invitasjonsstatus og endring av tid/sted ligger på flere flater. Eksisterende reminder-kommando er sperret ved dirty kladd. Bevar denne lagrings-/revisjonskontrakten ved eventuell samling. |

Dette er kildefunn, ikke innlogget gjenskaping av Kenneths konkrete samtale eller verifikasjon av produksjonens installerte SQL. Ingen persondata, appkode, migrasjon, varsling eller tilgang er endret i denne startkontrollen.

## Konkret neste arbeid

1. Bekreft sluttresultatet av CI945 på eksakt eea45373. Undersøk eventuell reell feil før omkjøring; ikke svekk assertioner.
2. Gjennomgå HR-modulens README/arkitektur og eksisterende hr-conversations runtime/React/database/browser-checker, gjeldende service/validator, SQL-wrapperkjeden og hrConversationPdf.mjs. Avstem faktisk Sandbox-funksjon dersom backend skal endres.
3. Definer separat avgrenset HR-scope før kode. Håndter lange tekster uten stille avkorting og med tydelig grense. UI, JavaScript, SQL, kladd, historikk og PDF må følge samme kontrakt. Lengdeendring må testes med eksisterende samtaler og rolleskille.
4. Samle møtereferat/tiltak/ansvar/frister til færre naturlige handlinger, med nødvendig lagring, gjennomgang og partenes egne bekreftelser bevart. Ikke automatisk aktivér eller send e-post.
5. Fortsett resten av helappmatrisen og videoer uten å gjenta ferdig QA. Se WHOLE_APP_REVIEW_20261104, ADMIN_STOCK_ORG_QA_20261105, SUPPORT_USERS_20261105 og eksisterende reise-/videoregister. Full Bolig A–Å og øvrige modulfilmer gjenstår.
6. Hver leveranse får relevant QA, faktisk kilde/CI/READY/miljø, oppdatert PR og konkret neste steg. Bruk godkjent PROFFDOK-VIDEO-1.0 uten lyd, faktiske syntetiske skjermbilder, kapitler/tekstalternativ og redigerbare kilder. En plan er ikke en ferdig film.

Ingen main/demo-merge, produksjonsmigrasjon, ekte utsending, reell HR-dataendring eller branchopprydding er autorisert av nattoppdraget. Produksjonssetting venter på uttrykkelig TEST OK for nye endringer.

## Første avgrensede HR-rettelse

Scope: HrConversations.jsx, hrConversations.css, ny hrConversationText.mjs, eksisterende hr-conversations-react-check, HR-README/Hjelp og dette endringsgrunnlaget. Miljømål BEGGE; kun PR311 Preview/Sandbox. Base18f28f9d. Remote head var stabil og tidligere checkout ren ved overtakelsen. Ingen konkurrerende skriver observert.

HTML maxLength kuttet innlimt tekst før appens state mottok den. Private forberedelses-/møte-/tiltaks-/kommentarfelt beholder nå hele teksten og viser tegnantall/feltfeil. Eksisterende4000/600-servergrenser er fortsatt gjeldende; dette er ingen ferdig lengdeutvidelse. Lagre validerer samtlige skrivbare tekstfelt før første mutasjon, så for lang egen kommentar ikke gir et delvis lagret møte eller tidspunkt. Andre partens tekst og utilgjengelige felt gir ikke utilsiktet sperre. In-memory-kladd, fersk tilgang, revisjonskonflikter og historiske utgaver beholdes. Ingen ny lagring i nettleseren, backend, tilgang eller sending.

121 faktiske React-/modellassertions PASS, inkludert full lang innliming, null mutasjoner ved overskridelse av forberedelse/tiltak/kommentar, komplett kladd etter focus/remount,4000Unicode-kodepunkter ved grensen og opprinnelige rolle-/firma-/historikk-/bekreftelses-/PDF-scenarioer. Full EXPO_BACKEND_TARGET=sandbox npm run build/critical PASS. Dette er syntetiske data; Espens reelle samtale er ikke åpnet. Ny kandidat-CI og innlogget etterkontroll må føres i PR311. Rollback: revert denne avgrensede apppakken; ingen databaseendring.

Neste HR-pakke er fortsatt større tekstgrenser gjennom hele SQL-wrapperkjeden og mindre dobbeltregistrering av tiltak/ansvar/frister. Ikke regn disse som levert av tellerrettelsen.

## Varetellingsfilm: faktisk fil funnet og innhold avstemt

Lokal faktisk fil /workspace/scratch/62bf25dcaa5c/ProffDok_Varetelling_20261105.mp4: ffprobe bekrefter H264/1920x1080/198sekunder, ingen lydstrøm. Redigerbar kilde finnes i samme mappe/stocktake_video_20261105 med timeline.json, render.py, assets, fonts og captions.vtt. Dette er eldre kilde86b56c99 og17kapitler. Kapittel5/7 viser område per registrering, og pause/overtakelse/historikk finnes ikke. Filmen passer derfor ikke hele den nye områdeflyten og publiseres ikke som oppdatert veiledning. Registrering i PR308 og varig lagring må avstemmes før ny versjon; ingen ny film er produsert i denne pakken.

Eksisterende hr-conversations-runtime-check:131PASS med syntetisk transport/provider og faktisk jsPDF. Ingen utsending. Tellerens tilgjengelige navn og beskrivelse er kontrollert separat, så tegnantallet ikke endrer feltets navn.

Innlogget read-only etterkontroll på18f28f9d/dpl_A7uHpbDLTZc6k1SZfc9Tig655hYs READY: vanlig oppdatering beholdt demo-innlogging og plukkliste. Varetelling åpnet direkte, avsluttet egen QA-telling ble gjenfunnet. Reol A–kontroll viser Ferdig telt,2varelinjer,1av1område ferdig telt, bevart stoppmerknad og antall15og0 uten registrering/redigering. Ingen serverdata skrevet. HR-tekstpakken er ennå ikke live-attestert av denne kontrollen.

Video og redigerbare kilder er samlet som tydelig merket eldre arkiv i ProffDok_Varetelling_arkiv_for_omradeflyt_20261105.zip, varig fil libfile_9625bb339a04819184a0133fcbe5d03c. Filen inneholder originalfil, timeline, renderer, fonter, faktiske syntetiske assets, kapitler og VTT; den er ikke registrert som oppdatert film i appen.

Lokal HR-appkandidat8685868d40a0729efa622e4807e126b21336e8b6/treed2c0d5b666a9304e53e272caf31308034eb89ff2 har lokale121React-/modellkontroller,131runtime/PDF og full build PASS. Etterfølgende dokumentasjonscommit lukker stocktake-checkpointet og blir ny full CI-kandidat. Fersk PR-status skal brukes.

## Publisert HR-kandidat og sluttkvittering

GitHub-appkandidat6fd2efdc3ffcb4f5478492d7857802c046d6364b/treec0a47ad8bfdcb69e77ace5d6d67e1c5574a92517 er byteidentisk med det lokalt testede slutt-treet (git diff lokal HEAD→remote tom). Native git-push manglet innlogging; pakken ble i stedet skrevet med GitHub-tre/commit og expected-head18f28f9d, force=false. Ingen nyere arbeid overskrevet. De lokale8685868d/fcfc8181-committene er derfor lokale kontrollreferanser, ikke publiserte branchhoder.

**CI947/run41955806115 fullført SUCCESS på eksakt6fd2efdc**, alle ni pakker og samlet gate. HR-React121og runtime/PDF131 var også grønne lokalt; ny full kandidat-CI er fasit for hele pakken. Vercel **dpl_HsL4nGbfDiPk2vz4KZP5MKmSPbEg READY** på eksaktSHA/fastalias/targetnull. Faktisk anonymt hentet /assets/main-CPI8PmcT.js inneholder Sandbox-refppvircenkjizeiqdxphj og ingen Production-refdqffxflaoyarbxyiyhop. Main er fortsatt34daef4c. Ingen TEST OK/merge/produksjon/demo-synk.

Innlogget ordinær reload beholdt demo-konto/firma/plukkliste. HR→Demo medarbeider2→eksisterende DEMO-årssamtale åpnet i samme høyrepanel. De tre møtereferatfeltene viste bevart syntetisk tekst og112/4000tegn. Lagre samtale var disabled uten endringer. Tekstinnmating med skjermstyring feilet fordi AT-SPI-provider var utilgjengelig; etterkontrollen viste uendret tekst/teller, ingen vellykket lang innliming og ingen lagring. Escape returnerte til samme medarbeiderrad med fokus. Dette er lesings-/teller-/returbevis, ikke live-attest av lang paste, mobil eller Safari. Lang paste/ingen delvis mutasjon/focus/remount er bare attestert i de faktiske automatiske React-testene. Ingen reell samtale, serverfelt, e-post, bekreftelse eller rolle endret.

Neste kjøring: les denne kvitteringen og fersk remote først. HR-lengdeutvidelse/SQL-wrapperkjede og forenklet tiltak-/fristflyt er fremdeles neste funksjonspakke. Fortsett deretter helappmatrisens åpne reiser og stabile filmopptak. Eldre varetellingsfilm er sikret, men ingen ny oppdatert film er produsert i denne pakken.
