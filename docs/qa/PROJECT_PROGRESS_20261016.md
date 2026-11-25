# Prosjekt – felles fremdriftsplanbygger og aktiv firmalogo

Scope BEGGE, Preview først, samme PR #254 etter brukerens eksplisitte ønske om gjenbruk fra KS/HMS. Prosjekt beholder tilbudsimport/opsjoner/13 standardforslag, kundevalg, UE-lesing, enkel ordre og eksplisitt sending til prosjektinvolverte. Ny felles arbeidsflate, bemanning og eksport; prosjektets egen lagring/tilgang. Ingen milepæl-/avhengighetsfunksjon, timeregistreringskobling, nye fristvarsler eller automatiske e-poster. Serverens eksisterende prosjektmail-PDF beholdes; ny nedlastet PDF og forhåndsvisning har aktiv firmalogo.

## Ny kontrakt og bevarte kontroller

- Prosjektfanen åpner stor popup, med Dag/Uke/Måned, mus/berøring/tastatur, begge strekkhåndtak, Angre, panel, søk/fagfilter og kompakte rader. Gjenbruker den faktiske KS/HMS-planbyggeren.
- Prosjektvalg, tilbud og deling samler import og kundedeling. Standardoppgaver vises i samme velger som NS-koder; opsjoner vises i oppgavedetaljen. Import har ingen automatisk serverlagring og dedupliserer hovedposter.
- Ny serverkontrakt project_progress_editor bruker eksisterende prosjekt-access/write, aktivt firma, godkjent bruker og revision-CAS. Gamle direkte planoppdateringer øker også revisjonen. Kladd overlever feil, fokus, reload og konflikt, uten automatisk overskriving.
- Nye private assignments deles ikke i offentlig prosjektplan-JSON. Min side bruker project_progress_mine med egne aktive oppgaver og norsk dato. Ingen medlemskap eller prosjekt-/HR-/KS-tilgang opprettes. Deltakere uten HR/KS-lisens kan få personlig inngang via eksisterende context-felt.
- Logo/navn hentes fra gjeldende firmaprofil for fremdrift/bemanning i Prosjekt, KS/HMS og Min side. Manglende configured logo gir stopp/feilmelding; ingen stille eksport med feil merke. Frisk kontroll gjentas etter motor-/bildelast.
- Tidligere KS/HMS 128 kontroller beholdes. Den personlige eksportens nye profil-RPC tillates i tillegg til egne mine-lesinger; full firmaplan er fortsatt forbudt. Eksisterende modulnavigasjon får bare en tom mock for den nye egne-prosjektplan-kilden. Ingen gamle brukerreiser svekkes.
- Bound Sandbox bruker egen serverlagring. Legacy uknyttet safe-preview beholder lokal plan, utskrift/deling/kalender. Sandbox tillater ikke ekte sending fra prosjektmailflaten. Ingen global miljøbinding endres.

## Utviklerkontroll

Full critical/build PASS. Prosjekt: 56 PGlite/PostgreSQL-kontroller og 39 Chromium-kontroller PASS. Felles: 102 tidslinje-/kode-/bemanningskontroller, 24 faktiske jsPDF-kontroller og 128 KS/HMS Chromium-kontroller PASS. HR/Hjelp, 55 kontaktpåminnelse-kontroller og faktisk KS/HMS/HR/Min side-navigasjon PASS. React-gjennomgang: knapper er låst under arbeid, popup/fokus er gjenbrukt, PDF-motor lastes ved behov, ingen tom initialstate lagres automatisk, og epoch stopper sene svar/eksporter.

PostgreSQL dekker revisjon, gammel tilbudskilde/opsjoner, private deltaker-ID-er, egne oppgaver, norsk dato, fullført/fremtidig/utløpt/udatert/låst, paging 100+6, ugyldige/fremmede/doble/inaktive deltakere, personantall, søndager, firma/aktør/anon og Min side uten HR/KS-lisens. Chromium tester import/dedup/opsjoner, 13 standardoppgaver, reell musflytting/strekk/Angre og lagring, dag/uke/måned, bemanning, ekte PDF-bytes med bildeobjekt, aktiv firmaprofil fremfor historisk prosjektlogo, forhåndsvisning, kladd/reload/konflikt, bevisst lukking/fokus, 320/390/1280 px, låst/enkel ordre, egne planer og sene firmasvar. Felles KS-testene dekker fortsatt berøring/tastatur og resten av tidslinjen.

Visuell kontroll av mobil/desktop og begge faktiske logo-PDF-er PASS etter justering av plass mellom logo og tittel. Tremåneders eksport med logo gir 6 sider fremdrift og 8 sider bemanning. Alle 14 sider er rendret og visuelt kontrollert, uten logo-/titteloverlapp eller avkuttede tabeller.

## Faktisk Sandbox

Migrasjon 20261016142124_project_progress_workspace, MD5 (ett avsluttende linjeskift) 399e53ac4ed95cfe24f7cf1022baa282 lik logg. Additiv revision/trigger, privat assignment-tabell, editor/mine-RPC og utvidelse av personal_page for tildelt prosjektarbeid. Advisors: forventet privat RLS-tabell uten policy, og eksplisitte authenticated SECURITY DEFINER-endepunkter med fersk tilgangskontroll; ingen direkte privat klientrettighet eller anonym RPC.

Authenticated opprettelse/save/readback av kurseksempel bekreftet. Kenneth Demo har fire egne oppgaver; syntetisk montør har elleve og ingen andres deltaker-ID-er. Tidligere profil gjenopprettet. Kunde/UE med nye engangskoder i full rollback: skjult kundeplan, UE 21 oppgaver, delt kundeplan 21 oppgaver, null deltaker-ID-er i begge portaler. Ingen testkoder/tilgang/delingsvalg/revisjoner blir igjen etter rollback. Production er ikke migrert.

## Kurseksempel og brukerprøve

Expo Proffsenter → Prosjekter → DEMO – VVS – fremdrift og bemanning 3 måneder, ID 5ea8d503-e38c-43d4-94ce-7fab7df525e9. 16.10.2026–15.01.2027, 21 oppgaver, 282 økter, 1–5 personer, topp 23, 6408 persontimer. Eget illustrasjonsprosjekt med kundedeling av og ingen ekte byggeplass. Kildekopi av tidligere KS/HMS-eksempel; ikke seed i core-PR.

1. Åpne prosjektet → Fremdrift. Popupen skal fylle arbeidsområdet. Velg Måned og neste periode.
2. Flytt/strekk en oppgave, prøv Angre. Rediger antall personer og deltakere i panelet. Lagre og åpne på nytt.
3. Velg Bemanningsplan, og last ned begge PDF-er fra Eksport. Bekreft aktivt firmas logo og navn. Prøv også forhåndsvisning og CSV.
4. Min side → Oversikt → Mine aktive prosjektplaner viser Kenneth Demo sine fire oppgaver. Ingen kollegaoppgaver.
5. Kontroller tilbudsimport og kundedeling i et egnet testprosjekt. Enkel ordre skal ikke tilby kundedeling. Låst prosjekt skal være kun visning.

Innlogget Preview-prøve og relevant TEST OK gjenstår. Ikke merge/main/Production før dette. Etter godkjenning migreres/verifiseres Production og main → demo synkroniseres kontrollert, med Sandbox-preflight før kurs.
