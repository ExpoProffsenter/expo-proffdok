# Boligprosjekter – KS/HMS, timer og Mine oppgaver

## Oppdatert gjennomgang: HR inkludert og bevart KS/HMS-arbeidsflate

Kenneth 24. oktober: «Inkluder HR funksjonen for de som har tilgang til boligprosjekt» og «Prioriter gjennomgang av KS/HMS-integrasjonen først». Miljømål BEGGE, fortsatt bare samme feature/Preview og Sandbox. Ingen produksjonsmerge eller produksjonsmigrasjon. Kontraktsområdet er ikke startet. Dette avsnittet går foran eldre avgrensninger nedenfor.

- Aktiv intern Bolig-rolle (leser/prosjektleder/firmaadmin), aktiv firmalisens og Prosjekter gir HR-modultilgang fra ferske serverrettigheter. Ingen kopiering av grants, medarbeideropprettelse, HR-aktivering eller time-/lønnsskriving. Firmaadmin fullfører firmaets HR- og timeoppsett som før. Egen medarbeider, nærmeste leder, firmaadmin og eksplisitte lesere har fortsatt vanlige innsynsrettigheter. Bolig-prosjektleder blir ikke HR-administrator eller leder for alle ansatte. Eksterne lenker gir ikke HR-tilgang.
- Tilbakekalt Bolig-rolle/lisens, Prosjekter, medlemskap, profil eller avsluttet arbeidsforhold fjerner avledet tilgang. Separat HR-tilgang beholdes. Bolig-tilgangsskjemaene sender eksisterende managed-access-hendelse etter bekreftet lagring.
- Administrativ metadata oppgir `bolig_hr_included`. Delt tilgangskomponent får kun én serverstyrt forklaringslinje; de eksisterende avkryssingene gjelder separat HR-tilgang. Scope-kontrollen krever byte-identisk komponent mot main når linjen fjernes.
- Bolig-integrasjonen demonterte tidligere `ProjectSjaEntry` ved ny prosjektkoblingslesing og mistet valgt dokumentgruppe. Den monterte arbeidsflaten beholdes nå med verifisert metadata i minnet, mens dialogen lukkes/skjules under ny kontroll. Feil/scopebytte rydder gammelt grunnlag. En sen lesing gjenåpner ikke et vindu brukeren har lukket. Native KS/HMS-/timekomponenter og felles partner-refresh-hook er uendret.
- Den delte `DeviationDialog` får et valgfritt React-context for portalplassering. Kun Bolig-integrasjonen setter et mål inne i sitt native `<dialog>`, slik at underdialoger er interaktive i riktig topplag og skjules sammen med hovedvinduet. Alle øvrige brukere beholder `document.body` som før. Scope-kontrollen krever byte-identisk komponent mot main når disse tre context-linjene og importen fjernes. Browser-testen bruker både faktisk `ProjectSjaEntry` og faktisk `DeviationDialog`.
- HR-testen fant en eksisterende NULL-feil i `hr_private.can_read`: uten nærmeste leder kunne en uautorisert detaljlesing slippe gjennom `NOT can_read(...)`. Bare lederens likhetstest endres til `coalesce(...,false)`, slik at manglende leder gir avslag. Alle uttrykkelige, lovlige innsynsveier beholdes. Dette er nødvendig før utvidet HR-adgang. Historiske migrasjoner og produksjon er urørt.

Additiv migrasjon `20261024171757_bolig_hr_included_access.sql` er installert kun i Sandbox `ppvircenkjizeiqdxphj`; versjon/navn er kontrollert i `schema_migrations`. Security advisor-typer/antall er uendret. Ingen nye tabeller, RLS-policyer, e-postkøer eller utsendinger.

| Kontroll i denne gjennomgangen | Resultat |
|---|---|
| Full Sandbox-build med eksisterende critical checks | PASS |
| Bolig PostgreSQL | 1575 assertions PASS |
| HR-modultilgang med ekte HR actor/oppsett/medarbeider/CAS-funksjoner, lokal syntetisk plattform | 41 assertions PASS |
| Chromium med faktisk `ProjectSjaEntry`/`DeviationDialog`, syntetiske undereditorer/transport | 25 assertions PASS, 320/390/768/1366 px |
| Regresjonsbevis mot forrige integrasjonskode | Ny dokumentgruppe-/fokustest feiler på gammel kode, består med rettelsen |
| Ekte timeføring i React | 91 assertions PASS |
| Ekte SJA-parent, prosjekt-HMS og prosjekt-sjekklister i React | PASS |
| Bolig-workspace og firma-/medarbeidertilgang i React | PASS |
| Delt KS/HMS-/HR-tilgangskomponent og Hjelp, inkl. bundlemetadata og tilbakekalling | PASS |
| Native Sandbox-integrasjon | PASS: prosjekt-ID i SJA/RUH/HMS og timeprosjektliste, egne oppgaver og eksakt retry; rollback |
| Native Sandbox HR uten separat firma-/brukergrant | PASS: HR-kontekst, Min side, egen medarbeider/timer, avslag på annen medarbeider uten leder, tilbakekalling og separat HR; rollback |

Native prøver bruker bare eksisterende syntetiske demoidentiteter og ruller tilbake alle testendringer. Ingen private medarbeiderdata er lagt i repoet. Innlogget samlet brukerprøve og fysisk iPhone/Safari gjenstår. Agentens testnettleser viser vanlig innlogging; dette sier ingenting om Kenneths økt. Ingen TEST OK. Siste publiserte CI og Preview kontrolleres separat.

Kort brukerprøve:

1. Boligprosjekter → velg prosjekt → **KS/HMS og timer**. Kontroller riktig koblet prosjektnavn.
2. **SJA, RUH og HMS-kontroller** → **Åpne SJA**. Åpne et utkast, skriv en testtekst, bytt nettleserfane og gå tilbake. Samme gruppe/utkast skal være åpent.
3. **Prosjektets sjekklister** og **Før timer og utlegg**: kontroller samme prosjekt og bevart innhold/uker.
4. Med aktiv intern Bolig-tilgang og ferdig HR-oppsett: Min side → **Mine timer** / **Mine oppfølginger**, og eksisterende HR-inngang for firmaadmin/leder. Vanlige personrettigheter gjelder. Firmaadmin viser at HR er inkludert via Boligprosjekter.

## Forrige integrasjonsetappe – historisk leveransegrunnlag

24. oktober 2026. Kenneth: «Kjør og pass på at ingen andre funksjoner i appen berøres».
Miljømål: BEGGE. Levert som feature for samme Preview og Sandbox; ingen merge til main eller produksjonsmigrasjon. PR #278 beholdes som draft.

## Funksjon

I boligprosjektet åpner «KS/HMS og timer» hovedprosjektets eksplisitte ordinære prosjektkobling eller en eksisterende koblet bolig. Prosjektleder velger «Opprett nytt koblet prosjekt» eller «Bruk eksisterende prosjekt». Ingen prosjekt opprettes ved innlasting. Én bekreftet kobling beholdes for stabil dokument-/timereferanse. Nytt prosjekt får boligprosjektets navn og referanse, riktig firma/bruker og privat deling. Eksisterende prosjektdata, boligstruktur og dokumenter endres ikke av koblingen.

«SJA, RUH og HMS-kontroller» gjenbruker ProjectSjaEntry. «Prosjektets sjekklister» bruker eksisterende prosjektåpning med sjekklistefanen. «Før timer og utlegg» åpner eksisterende PersonalTimeWorkspace. Det koblede prosjektet velges manuelt i vanlig prosjektfelt; eksisterende uker flyttes ikke. Firma-/person-/prosjektrettigheter og HR-/timeoppsett er uendret.

Min side får et sammenfoldet «Mine oppgaver i boligprosjekter». Kun egne registrerte ansvar vises: uferdig Bolig-fremdrift, native åpne RUH/avvik og native utkast til vernerunde/risikovurdering. Kildestatus og kildedato vises; planlagt ferdig/kontroll er merket som dette, og RUH viser faktisk frist. Ingen duplikate oppgaverekorder eller køer opprettes. SJA og sjekklister uten personoppgave-motor gjøres ikke om til oppdiktede personoppgaver. Åpning bruker de eksisterende arbeidsflatene; Bolig-lesere får lesedetaljer for fremdrift.

## Avgrensning og regresjonsvern

- Nye filer under `src/modules/bolig`, to isolerte mount/import-linjer i PersonalPage og import/fane/mount i BoligEntry. Nye CSS-regler er prefikset med bolig-integration eller bolig-my-tasks.
- Ingen endring i eksisterende Time/HR, KS/HMS, Sales, sjekklistekjerne, bootstrap, global meny eller navigasjonsmotor i denne leveransen. Byte-diff mot forrige HEAD kontrolleres før publisering. Min side matcher main byte for byte når de to isolerte Bolig-kortene fjernes.
- CI på forrige HEAD avdekket en timingfeil ved gjenåpning av «Legg til prosjektdeltaker» etter fokus. Kun BoligAttendancePeople er rettet: eksplisitt summary-klikk lagrer disclosure-tilstand synkront før en tilgangslesing kan remontere details. Eksisterende selvregistreringstest er styrket med tre forsinkede fokuslesinger; ingen kritiske tester er svekket.
- Additiv migrasjon `20261024115852_bolig_project_integration.sql` legger kun til Bolig-private koblinger/kvitteringer og nye gatewayer. Ingen eksisterende funksjoner, tabeller, triggere, RLS-policyer eller migrasjoner endres.
- Firma-/person-/root-/prosjekttilgang valideres på server. Native KS/HMS-synlighet beholdes. Ingen nye HR-, UE- eller lisensgrants. Direkte tabelltilgang og anonym RPC er sperret.
- Eksakt kvittert retry ved tapt svar; lokal koblingskladd sikres før skriving. Samme bruker/firma/scope, aktive skjemaer og valgt oppgave valideres ved nye svar. Skjult side og bortfalt tilgang fjerner innhold. Oppgaver etter første side kan gjenfinnes separat med verifisert ID/type.
- Eksisterende fremdrifts-/KS-varsling gjenbrukes. Ingen ekstra utsending eller endring av pauset e-post. Sandbox-testdata og native varslingsrader rulles tilbake.

## Gjennomført QA

| Kontroll | Resultat |
|---|---|
| Full Sandbox-build og eksisterende kritiske byggsjekker | PASS |
| Bolig PostgreSQL, inkl. nye integrasjonsscenarier | 1575 assertions PASS, hvorav 41 nye |
| Ny faktisk integrasjons-React i Chromium | 17 assertions PASS, 320/390/768/1366 px |
| Eksisterende Min side React / layout | PASS / 108 Chromium assertions PASS |
| Eksisterende timeføring, faktisk React | 91 assertions PASS |
| Eksisterende SJA, faktisk React | PASS |
| Eksisterende prosjekt-HMS-kontroller, faktisk React | PASS |
| Eksisterende prosjekt-sjekklister, faktisk React | PASS |
| Eksisterende Bolig-workspace, faktisk React | PASS |
| Eksisterende Bolig-fremdrift, Chromium | 39 assertions PASS |
| Sales-editorer, Chromium | 196 assertions PASS |
| Egen inn/ut og deltakere, Chromium | 19 assertions PASS, inkl. tre forsinkede fokuslesinger |
| Bolig scope mot faktisk main + kritisk Min side | 51 assertions PASS / PASS |
| Native Sandbox, reelle offentlige gatewayer som authenticated, rollback | PASS: kobling/opprettelse/replay, uendret Bolig, sjekkliste, lagret SJA/RUH/HMS og egne oppgaver; ordinær timeprosjektliste inneholder nytt prosjekt |
| Supabase security advisors før/etter | WARN uendret (1/1/22/238/1); 2 ekstra INFO for bevisst lukkede private RLS-tabeller |

Browser-harness bruker faktisk ny integrasjonskode og global CSS, syntetisk transport og stubb bare ved eksisterende KS/HMS-/time-/fremdrifts-komponentgrense. Disse eksisterende komponentene testes separat med sine egne uendrede runtime-scenarier. Native Sandbox-smoke bruker reelle KS/HMS-funksjoner med eksisterende syntetisk demoidentitet, og verifiserer lagret `project_id` ved readback. Alle testskrivinger rulles tilbake. Timeføringens native prosjektliste er testet, ikke en ny innlevering/eksport i delt Preview.

Mobil-/desktopbilder fra den syntetiske integrasjonsharnessen, uten åpne stubbkomponenter:

- `evidence/bolig-integrasjon-390-20261024.jpg`
- `evidence/bolig-integrasjon-1366-20261024.jpg`

## Brukerprøve i delt Preview

Fast adresse: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Åpne Boligprosjekter → velg prosjekt → «KS/HMS og timer».
2. Velg «Hele boligprosjektet». Opprett en prosjektkobling eller søk og koble riktig eksisterende prosjekt. Se riktig prosjektnavn etter serverbekreftelse.
3. Åpne «SJA, RUH og HMS-kontroller» og kontroller at eksisterende arbeidsflate viser riktig prosjekt. Prøv «Prosjektets sjekklister».
4. Med eksisterende timerettighet: åpne «Før timer og utlegg», velg samme prosjekt i vanlig prosjektfelt. Eksisterende timer og uker skal fortsatt være på samme sted.
5. Med egen tildelt oppgave: gå til Min side → utvid «Mine oppgaver i boligprosjekter». Åpne riktig oppgave. Fullfør via vanlig kildefunksjon og kontroller at oppgaven forsvinner. Prøv fanebytte/dvale med usendt kladd.

Innlogget brukerprøve i delt Preview gjenstår. Ingen gyldig brukerøkt var tilgjengelig i agentens delte nettleser. Bygg, lokale komponenttester og native databaseprøver er separate bevis og erstatter ikke denne brukerprøven. Ingen TEST OK eller produksjonsgodkjenning er gitt.
