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
