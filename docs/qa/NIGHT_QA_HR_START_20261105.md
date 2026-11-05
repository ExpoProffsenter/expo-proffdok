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
