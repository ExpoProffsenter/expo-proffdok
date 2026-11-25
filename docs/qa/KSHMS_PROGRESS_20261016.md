# KS/HMS – egne fremdriftsplaner, 16. oktober 2026

Miljømål: BEGGE. Main-baseline a7bd4795e78e0ba1cbdc747960384bbf01338581. Preview først; Production og permanent demo venter på ny TEST OK.

## Scope og kontrakt

Ny Fremdriftsplaner under KS/HMS/Daglig arbeid. Brukeren valgte uttrykkelig selvstendige firmaplaner med navn/adresse/valgfri ekstern referanse. Ny privat tabell med RLS uten direkte klientprivilegier; tre authenticated-RPC-er med eksisterende require_context og managerkrav ved skriving. UUID-paging, CAS, størrelses-/dato-/kodekontroll og audit. Ingen endring av eksisterende prosjektdata, kundedelinger, tilbud, HR, e-post eller globale menyer.

Eksisterende planeditor og print/Gantt-renderer er trukket ut til rene delte komponenter. Prosjekt-wrapperen tilfører identiske gamle tjenester; KS/HMS bruker bare egne RPC-er. Det hindrer at KS/HMS importerer prosjektets Sales/Supabase-klient ved lasting. Prosjektets 13 standardoperasjoner, tilbudsimport og kundedeling beholdes. KS/HMS har egne NS-forslag, valgfrie manuelle koder og ingen tilbuds-/kundekontroller.

Planer er lesbare for firmaets KS/HMS-brukere; firmaadmin/KS/HMS-ansvarlig redigerer. Person/firma er eksisterende fritekst i planeditoren, ingen registrert ansvarlig eller tildelt oppfølging. Eksisterende fristvarslingsmotor får ingen nye oppgaver. KS/HMS-planer er ikke automatisk med i prosjektets dokumentuttrekk.

Lokal kladd nøkkeles med firma/aktør/plan. Fersk dobbel serverlesing før kladden åpnes og før eksport. Ulik serverrevisjon stopper åpning; kladden beholdes til eksplisitt forkasting. Lagring bekreftes først etter readback av innhold og revisjon. Ved utilgjengelig nettleserlagring beholdes kladden bare i minnet. Lagringsfeil viser feilen og beholder editoren.

## NS 3451-grunnlag

Standard Norge oppgir NS 3451:2022 og skillet mellom bygningsdeler og systemkoder:
https://standard.no/fagomrader/ns-3420-/bygningsdels--og-systemkodetabell--ns-3451/

24 utvalgte kodekoblinger kontrollert mot Bergen kommune, FDVU-dokumentasjon versjon 3.0, gyldig 01.01.2025, tabell 4, side 19–23:
https://www.bergen.kommune.no/api/rest/filer/V51045623

Kortnavnene er egne visningsnavn; fagfordelingen er appens praktiske forslag, ikke en normativ fagklassifisering. 35 gjelder varmepumpe/kulde, 3200 er systemkode mens 32 er bygningsdel. Mur/flis/maler kan arbeide på samme bygningsdel; rigg/drift kan være uten kode. Full betalt standard er ikke lest eller kopiert. Manuell kode er formatkontrollert, ikke kontrollert mot komplett standardtabell.

## Regresjonsvern og QA

- Ny DB-check bruker faktisk migrasjon og eksisterende require_context: firmaskille, manager/leser, CAS, ugyldige tilbudskilder/datoer/koder, arkiv/gjenoppretting, paging og direkte/anon/service_role-nekt.
- Ny Chromium-check bruker faktisk delt editor og KS/HMS-flate: opprettelse, NS-operasjon, første økt, readback, feil/kladd/fokus/nettleserreload, referanse/PDF, faktisk ICS, 320/390/1280 px, arkiv/lesetilgang/tilbakekalt tilgang/sene firmasvar, ingen prosjektwrites og eksisterende Prosjekt-kontroller.
- Navigasjonscheckens forventede meny er bevisst utvidet med progress etter risk, fordi brukeren ba om ny KS/HMS-funksjon. Alle tidligere ruter/rekkefølge og sikkerhetssperrer beholdes. Faktisk ikon/rendering og recovery testes med ny rute i eksisterende module-navigation-resume-react-check. Den nye Hjelp-guiden øker KS/HMS-familien fra 12 til 13 kapitler; de to eksakte antallskontrollene oppdateres tilsvarende, med eksplisitt kontroll av ny guide. Alle tidligere guider og grupperingskontroller beholdes. Ingen gammel kontroll svekkes.
- Ny DB-/Chromium-check kjører også i eksisterende PR Core Safety. Full critical/build og relevante gamle KS/HMS/HR/Min side-tester kjøres.

## Innlogget brukerprøve

Fast Preview: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app

1. KS/HMS → Fremdriftsplaner → Ny fremdriftsplan. Opprett med navn/adresse/ekstern referanse.
2. + Arbeidsoperasjoner → velg relevant NS-forslag. Tilpass navn, person/firma og planlagte tider. Lagre fremdriftsplan.
3. Åpne Gantt / PDF og Last ned kalender (.ics). Kontroller navn, referanse, kode og dato/tid.
4. Åpne Prosjekt → Fremdriftsplan og bekreft at Hent arbeidsoperasjoner fra tilbud fortsatt finnes der.

Utviklertester attesterer ikke brukerens innloggede prøve eller PDF-utskrift fra brukerens egen nettleser. TEST OK fra tidligere leveranser gjelder ikke denne funksjonen.

## Releasebevis

Lokal full critical/build PASS. Databasecheck: 56 kontrollpunkter PASS. Chromium: 40 kontrollpunkter PASS, inkludert reload-kladd og eksplisitt servervalg etter kollegakonflikt. Eksisterende navigasjon (13 faner), prosjektets standardoperasjoner/import/kalender, KS/HMS SJA/gjennomføring/revisjon, Min side og HR/Hjelp runtime PASS.

Sandbox har migrasjon `20261016114708_kshms_standalone_progress_plans`, kildens MD5 (ett avsluttende linjeskift) `96def739efaddd02ebb004cc1ec92912`. Faktisk authenticated create/get/archive/list med syntetisk firmadmin besto i full rollback; null testrader etterpå. RLS og ingen direkte tabellprivilegier bekreftet. Bare authenticated kan utføre de tre avgrensede RPC-ene. Advisor INFO for privat tabell uten policy og SECURITY DEFINER er tilsiktet RPC-arkitektur; eksisterende øvrige advisories endres ikke. Sandbox-preflight 19/19 og kurs-preflight 5/5 grønne, ingen nye plandata.

Preview/CI-bevis føres i PR etter publisering. Ingen Production-skjemaendring før relevant TEST OK.


## UX-oppfølging etter Kenneths Preview-prøve, 16. oktober

Kenneth ønsket underkoder, dag/uke/måned, dra/strekk og mindre scrolling. UX-scope er KS/HMS-planflaten, det faktiske kodeutvalget og en valgfri renderWorkspace-kobling i den delte editoren. Tidligere planlagring, private RPC-er, SQL, autorisasjon og Prosjekt/portal-visning endres ikke av denne oppfølgingen. Ingen TEST OK for den nye funksjonen er gitt ennå. Miljømål fortsatt BEGGE.

Ny ren KshmsProgressBoard bruker eksisterende server-first-hydrering, normalisering, kladd, validering og save/readback fra ProgressPlanWorkspace. Den delte save-funksjonen returnerer nå suksess/feil slik at sidepanelet bare lukkes etter bekreftet lagring. KS/HMS blokkerer planvalg/eksport mens save pågår. Ingen tilbudsimport i KS/HMS.

57 faktiske kodekoblinger med egne korte navn, kontrollert mot samme offentlige tabell s19–23. Hierarkiet grupperer 3-/4-sifferkoder under 2-sifferoverskriften, og merker systemkode eksplisitt. Eksempel: 32 → 321/322/324/325/326 og separat system 3200. Egen arbeidsoperasjon tillater flere oppgaver på samme bygningsdel.

Tidslinjen har Dag/Uke/Måned, periodepiler, I dag, Til planen og valgfri Vis dato. Dag har klokkeslett; uke/måned har kalenderdatoer. Periode uten opphold tegnes som én strek, med bevart separat dagsøkt for hver dato. Ulike tider/notater og opphold forblir egne perioder. Dra flytter perioden; begge ender kan strekkes. Klokkeslett flyttes 30 minutter i dagvisning, datoer én dag i uke/måned. Overlapp på samme oppgave og ugyldig varighet nektes. Muse-/berøringsslipp oppdaterer bare kladd. Escape/blur/skjult vindu avbryter gesten. Ingen automatisk serverlagring. Angre gjelder de siste 30 endringene i den åpne arbeidsflaten; det er ikke versjonshistorikk etter omlasting.

Sidepanelet lar brukeren endre feltene direkte og legge til/fjerne flere perioder. Perioder inkluderer helg; teksten forklarer dette. Separate opphold planlegges med separate perioder. Utvid viser tidslinjen i en dialog over appen; nested redigering har fokus-/scrollstyring og begge visningene gjenopprettes bare etter fersk firmatilgang. Tilbake minimerer; planvalg/eksport er tilgjengelig i normalvisning. Sticky oppgavenavn/kolonneoverskrift og begrenset intern scrolling hindrer at 30+ oppgaver forlenger siden.

Den tidligere 40-punkts Chromium-testen er tilpasset den uttrykkelig ønskede nye UI-kontrakten og utvidet. Samme opprettelse/readback/NS-kode/PDF/ICS/metadata/feil/kladd/reload/kollegakonflikt/arkiv/leser/tilbakekalling/sene firmasvar/Prosjekt-kontroller er beholdt. Tillegg kontrollerer faktisk museflytting, begge håndtak, Angre, klokkeslett, tastatur, berøring, zoom, kompaktfilter, intern scrolling, sticky navn, Utvid og nestede dialoger. Ny ren tidslinjecheck dekker DST/skuddår, flytting med bevarte ID-er, utvidelse/krymping, grense/overlapp, opphold/laneplass og kodehierarki. Begge kjører i CI.

### Oppdatert brukerprøve

1. Åpne KS/HMS → Fremdriftsplaner og en plan. Velg + Arbeidsoperasjoner, søk 32 og åpne Varme for underkoder.
2. Velg en underkode, gi oppgaven navn og en periode. Lagre fremdriftsplan.
3. Prøv Dag/Uke/Måned. Flytt perioden og dra i begge ender. Kontroller dato/tid i sidepanelet. Prøv Angre og lagre ønsket resultat.
4. Prøv Utvid, Kompakte rader og Søk i oppgavene. Tilbake går til normalvisning. Under Planvalg og eksport kan lagret Gantt/PDF og kalender kontrolleres.

Eksakt testresultat og oppdatert Preview-/CI-bevis føres i PR #254 før brukerprøven.


Utviklerkontroll etter UX-oppfølging: 40 tidslinje-/kodekontroller, 61 PostgreSQL-kontroller og 72 Chromium-kontroller PASS. PostgreSQL-checken lagrer også faktiske data generert av flytting, strekk og klokkeslettsendring gjennom uendret save-RPC, med rollback av testplanen. Chromium bruker faktisk mus, berøringshendelser og tastatur; ingen cloud-klient eller ekte brukerdata brukes i nettleserharnessen. Ingen nye databaseendringer i denne oppfølgingen. Full critical/build, faktisk KS/HMS/HR/Min side-navigasjon, Hjelp og kontaktflate PASS. Mobil ved 320/390 px og desktop ved 1280 px er visuelt kontrollert, inkludert kodevalg og Utvid. Nytt publisert tre/CI/deploy føres i PR #254.

## Popup, bemanning, søndager og utvidet kodeutvalg (oppfølging)
Ny ønsket kontrakt: planvalg/opprettelse åpner popup direkte. Bevisst lukking gir en åpneknapp og respekteres ved fokus. Derfor tilpasses tidligere Utvid-test; dialog-/fokus-/mobilkontrollene beholdes. Nye planer utelater søndager, men gamle planer beholder sine økter til brukeren bekrefter fjerning i kladden og lagrer. Uke-/månedsforventninger endres til synlige arbeidsdager; kalenderaritmetikk uten flagget beholder alle tidligere tester. Kodeantall økes fra 57 til 256; tidligere absolutte antall erstattes av ny eksplisitt forventning, unikhet og utvidet fag-/kodekontroll. Fagkoblinger kan være flere per kode, så fagfilter verifiseres mot relevante fag fremfor bare primærfaget.

Valgfri crewSize (heltall 1–999, null/utelatt betyr ukjent) og excludeSundays lagres i privat plan-JSON. Additiv privat CHECK-validering uten nye offentlige endepunkter/grants. Bemanningsberegning unionerer overlapp på samme oppgave/dag, summerer persontimer og finner største samtidige behov med tidslinjesveip. Ukjent antall og manglende tider vises eksplisitt. Bemannings-PDF/CSV henter hele planen gjennom frisk, kontrollert RPC-lesing; ulagret kladd blokkerer eksport. Ingen nye navngitte ansvarlige/frister eller e-postoppgaver.

Oppfølging verifisert: 100 rene tidslinje-/kode-/bemanningskontroller, 98 PostgreSQL-kontroller og 93 Chromium-kontroller PASS. Full critical/build og faktisk KS/HMS/HR/Min side-navigasjon samt HR/Hjelp runtime PASS. Chromium dekker også direkte popup, bevisst lukking ved fokus, personantall etter reload/arkivering, ukjent antall, blokkert kladdeksport, bemannings-PDF/CSV, søndagsinkludering, avbrutt/bekreftet fjerning, Angre og fravær av autosave. Eksisterende Prosjekt-import/13 standardforslag/kundedeling og firmaskille/tilbakekalling er fortsatt med.

Visuell kontroll av popup på 390 px og bemanningsoversikt på desktop PASS; 320/390/1280 px passer vinduet. Dra/strekk holder pointer capture på den varige tidslinjen når et håndtak passerer synlig periodegrense. Tallfilter på NS-koder søker prefiks (32 → varme), og fagfilter omfatter alle relevante fagkoblinger. En kodes hovedfag er bare et forslag.

Sandbox-migrasjon `20261016125012_kshms_progress_staffing` installert; eksakt kildetekst MD5 `37d373bb803cbadcee7385b139f5c429` samsvarer med migrasjonsloggen. Faktisk authenticated lagring/readback av crewSize=3 og excludeSundays=true, avvisning av crewSize=0/søndagsøkt og uendret revisjon ved avvisning PASS i full rollback. Null syntetiske bemanningsrader etterpå. Ingen direkte brukertilgang til tabellen eller valideringsfunksjonen. Sikkerhetsadvisor viser bare tidligere tilsiktet privat RPC-tabell med RLS uten direkte lesepolicy for dette området. Production er ikke migrert eller endret. CI/deploy/publisert tre dokumenteres i PR #254; innlogget brukerprøve og relevant TEST OK gjenstår.

## Deltakere, Min side og drahjelp (oppfølging)
Scope BEGGE: deltakervalg per KS/HMS-oppgave, avgrenset lesing av egne aktive planer i Min side/Oversikt, stabil drahjelp og additiv privat deltakerkontroll. Tre måneders illustrasjonsplan legges separat som data bare i Sandbox, aldri i produksjonsmigrasjon eller demo-overlay i core-PR. Ny ønsket Min side-kontrakt har fem oversiktskort i stedet for fire; eksisterende time-/håndbok-/HR-/profilkort og alle tidligere navigasjons-/kladd-/tilgangstester beholdes. Ny RPC-mock legges til tester, uten å stubbe selve nye komponenten. Drahjelp flyttes til et fast felt over tidslinjen; størrelse på tidslinjen skal ikke endre seg når drag starter/slutter. Valgte deltakere er planlagt arbeidslag, ikke oppgaveeiere med frist; ingen varsler/e-post sendes.

Oppfølgingens lokale kontroller: 100 rene modell-/kodekontroller, 137 PostgreSQL-kontroller og 108 Chromium-kontroller PASS. Min side/privat kontakt/profil/e-post, faktisk modulnavigasjon og HR/Hjelp runtime PASS. Full critical/build PASS. PostgreSQL inkluderer nye RPC-er, identitets-/firmaskille, egen filtrert detalj, fullført/fremtidig/utløpt/udatert/arkivert, paginering 100+5, ugyldige/fremmede/doble/ikke-kanoniske IDs, tilgangstap og bevaring av gammel deltaker uten å tillate nytt valg. Chromium bruker faktisk Min side og planbygger, lagrer/gjenlaster deltakere, tester egne oppgaver og ingen kollegaoppgaver, lesetilgang, fokus/lukk/gjenåpning, dato-utløp og sent firmasvar. Nederste rad dras med uendret høyde på tidslinjen, og hjelpeteksten har pointer-events:none. Mobil egenplan ved 390 px og desktop/nederste rad er visuelt kontrollert. Den eneste gamle kontraktendringen er fem oversiktskort med det nye plankortet; alle fire gamle kort og deres brukerreiser er beholdt.

Sandbox har `20261016132206_kshms_progress_participants`, MD5 `96853da60dc3f92e2bf4caade35acfed` samsvarer med lagret migrasjon. Faktisk authenticated deltakerliste returnerte bare gjeldende KS-berettigede firmabrukere. Production er ikke migrert. Eksempel: VVS – eksempelplan 3 måneder, 16.10.2026–15.01.2027, 21 oppgaver/282 dagsøkter, 1–5 personer per oppgave, toppbehov 23 og 6408 persontimer; kun illustrasjon i Expo Proffsenter/Sandbox. Opprettes gjennom eksisterende manager-RPC og verifiseres med get/mine. Brukerens eksisterende aktive arbeidsprofil gjenopprettes. Eksakt CI/deploy og bekreftet eksempel-ID føres i PR #254.

## Direkte PDF-nedlasting og norske uker (oppfølging)
Scope BEGGE: KS/HMS/Min side sine PDF-handlinger, egen paginert PDF-renderer, norske ukenavn i bemanningsrapport/CSV, relevante hjelpe-/arkitekturtekster og eksporttester. Prosjektets eksisterende utskriftsvisning endres ikke. Ny ønsket kontrakt: Last ned fremdriftsplan (PDF) og Last ned bemanningsplan (PDF) lager PDF-filer direkte. Forhåndsvisning beholdes med separat Last ned PDF og Skriv ut. Tidligere popup-/HTML-kontroller navngis som forhåndsvisning; alle beholdes, med nye faktiske PDF-nedlastinger og fersk tilgangskontroll etter motorlast. Intern ISO-ukenøkkel beholdes, men vises som Uke 42 · 2026. CSV-forventningen tilpasses norsk visningsformat. Ingen database- eller eksempeldataendring.

Verifisert etter PDF-oppfølging: full critical/build PASS, 19 faktiske jsPDF-kontroller, 102 modell-/ISO-ukekontroller og 128 Chromium-kontroller PASS. Chromium laster ned ekte PDF-bytes fra både direkteknapper og forhåndsvisning, tester separat print, norsk uke i rapport/CSV, egne oppgaver i Min side og bevarer tidligere flytting/strekk/kladd/tilgangs-/Prosjekt-kontroller. HR/Hjelp-runtime og faktisk KS/HMS/HR/Min side-modulnavigasjon PASS. React-gjennomgang: ingen nye effekter/hooks, PDF-motor lastes først ved bruk, gjeldende eksportcallback og scope-fence beholdes, knapper deaktiveres under arbeid og statusfeil vises.

Faktisk tremåneders VVS-grunnlag rendret til 6 sider fremdriftsplan og 8 sider bemanning. Alle 14 sider visuelt kontrollert via Poppler; ingen avkuttet tekst eller overlapp. PDF-tekstkontroll fant alle 1150/1035 ord innenfor sidegrensene. Lang merknad beholdes gjennom paginering, med kontroll av siste sentinel. QA-filer er interne kontrollartefakter. Oppdatert publisert tre, CI og Preview føres i PR #254. Ingen ny databaseendring eller Production-publisering; innlogget brukerprøve og relevant TEST OK gjenstår.
