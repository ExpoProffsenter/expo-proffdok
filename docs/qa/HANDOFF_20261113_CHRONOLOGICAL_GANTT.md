# Handoff – kronologisk fremdrift, dato/frister og personstyrt samarbeid

## Start her

Les AGENTS.md, PROJECT_GUARDRAILS.md og docs/DEVELOPMENT_WORKFLOW.md. Hent fersk main-, PR-, CI- og Vercel-status. Brukeren er Kenneth Skogsrud. Arbeid videre selvstendig, med korte norske forklaringer. Ikke gjenta allerede installerte migrasjoner eller send e-post som sideeffekt.

Miljømål BEGGE. Ingen TEST OK for aktuelle endringer. Ingen merge/produksjonssetting eller main → demo er gjennomført. Brukerens «det fungerer» kom med konkrete rettelser og er ikke TEST OK. Punkt 2 står uttrykkelig igjen.

## PR332 – dato, frister og fremdrift

- Repo: ExpoProffsenter/expo-proffdok. PR: https://github.com/ExpoProffsenter/expo-proffdok/pull/332
- Branch: fix/orvei-deadline-layout-20261113. Base ved overlevering: main 6eb54148b3d61e318c5447810cdf89deab6afffa.
- Fast testadresse: https://expo-proffdok-git-fix-orvei-deadline-layout-20261113-ringside.vercel.app/?progressTest=safe
- Siste publiserte og innlogget visuelt kontrollerte kandidat FØR denne handoffens sorteringsendring: 5bb736d40653ccb3633c7138b29c92adf74e01b7, Vercel dpl_4oN7432vnyLN3LtkAefRePrMyT4P READY, logg Sandbox Supabase only. CI43517869000 var fortsatt under kjøring ved ny sorteringsoppgave. Hent faktisk sluttstatus, ikke anta grønt.
- Denne handoffen følger ny kode i samme commit. Hent PR-head for eksakt SHA og ny CI/deployment. PR-beskrivelsen er løpende status etter filens opprettelse.

Levert før siste ønske: hele planen som standard, full aktivitetstekst/adresse i tooltip og tilgjengelig navn, bare reelle endringer gir utkastvarsel, lesbare byggadresser, prosjektfelles bestillingsklokkeslett. Oppsettets beboerimport og frister er tydelige handlingskort. Dato/klokkehandling før kompakt 126-boligers liste, sammenfoldet detaljkontroll. Norske datoer i fristoversikt, portalfrist og Gantt. Bestillingsdato tastes dd.mm.åååå med faktisk datovalidering uavhengig av nettleserspråk, payload fortsatt ISO.

Siste brukerønske: «fremdriftsplanen må vises etter dato for aktiviteter ... ift månedsvisningen», presisert «rekkefølgen må være først til sist». Ny kode sorterer grupper etter første aktivitet i utvalgt periode og aktivitetene innen hver gruppe etter startdato, sluttdato og stabile reservekriterier. Periodevisning (dag/uke/måned) viser bare aktiviteter som overlapper perioden; hele planen beholder alle. Utgangspunktets dato er tidligste aktivitetsdato, ikke første tilfeldige datarad. Antall viste aktiviteter og hjelpetekst oppdateres. Row-limit nullstilles ved periodebytte. Ingen aktivitetsdata endres.

Målrettet Gantt React-test PASS med motsatt adresse-/inputrekkefølge, kronologiske grupper og aktiviteter, måned uten tomme bygg, neste tomme måned, tilbake til hele planen, hover/fokus, klikk og eksisterende uke-redigering. Batch React 28 tester PASS på uendret batchkode. Full build for siste endring kjøres; les PR-status for resultat. Lokal Chromium er blokkert av miljøets socket-rettigheter; CI Chromium og native nettleser virker. Ingen svekkelse av tester.

Neste kontroll: vent ny CI, undersøk eventuelle reelle feil; kontroller korrekt SHA READY og Sandbox-binding. Innlogget preview → Boligprosjekter → Aamodthagen → Fremdrift og varsler → Visning Måned. Kontroller første til siste dato, bare relevante bygg/boliger, aktivitet som går over månedsskifte, forrige/neste måned, Hele planen, gruppering, filtre, tooltip og åpne/lukke aktivitet uten endring. Ikke lagre flyttede datoer i denne visuelle testen. Gi Kenneth samme faste URL og kort testliste. Avvent TEST OK før produksjon.

## Sandboxdata – IKKE installer på nytt

Aamodthagen boligsameie (ORVEI-SANDBOX), root df971415-1232-4199-8bd8-ce1e2246deaa. 29 bygg,126 boliger,151 eiere,1260 aktiviteter. Plan 02.12.2026–05.11.2027. Alle126 boliger har bestillingsfrist kontrollert mot datert planaktivitet,29 datogrupper,kl12. Ingen produksjonsimport. Se docs/qa/ORVEI_PROJECT_SETTINGS_20261113.md.

Klokkemigrasjon repo20261113191737_bolig_project_deadline_time.sql er allerede installert i sandbox som20261113203013_bolig_project_deadline_time. Historiske datoprosjekters dagsslutt bevares. Ikke kjør gamle scripts ukritisk. Ingen e-post er sendt i de siste UX-testene. Lokal testdato/utvalg ble tømt uten serverlagring.

## Punkt2 / PR333 – fortsatt utestet av bruker

- PR https://github.com/ExpoProffsenter/expo-proffdok/pull/333
- Branch feat/bolig-partner-commerce-20261113, head1a62cfddd322405af7211fcd3c82b4f76dea0c6d.
- Full grønn CI43506009179. Vercel dpl_2gbJ2xd3HehrDLB1qJdmJFcD4mif READY på samme commit, Sandbox-binding bekreftet.
- Fast URL https://expo-proffdok-git-feat-bolig-partner-commerce-20261113-ringside.vercel.app/?progressTest=safe
- Navngitte interne kontoer kan få eksplisitt prosjektbundet lese-/boligvalg-/katalogrett via partnerkontakt. Min side → Mine samarbeid, uten å endre vanlig arbeidsfirma. Varer/arbeid, publiserte og aksepterte avtaler, tilbakekalling/utløp og firmaisolasjon er beskyttet. Beboeren godkjenner selv.
- 1877 lokale databasekontroller PASS, faktisk React-refresh/draft/tilbakekalling PASS, hosted negative tilgangskontroller PASS. Null personrettigheter opprettet. Ny origin viste innlogging: gjenbruk bare legitim innlogging; ikke flytt auth-tokens mellom origin.
- Sandbox ppvircenkjizeiqdxphj: repo20261113194437_bolig_partner_commerce.sql installert som20261113204410_bolig_partner_commerce. Ikke installer på nytt.
- Neste: innlogget visuell kontroll med avklart testperson → tildeling → Min side/Mine samarbeid → bolig → vare-/arbeidstilpasning → readback; katalogrett separat; tilbakekalling. Ingen reelle mottakere eller utsending uten konkret autorisasjon. Se docs/qa/BOLIG_PARTNER_COMMERCE_20261113.md.

## Integrasjon og videreføring

Tidligere lokal sammenstilling av PR3329d29c7 og PR3331a62cf hadde grønn fullbuild/boundary og1897DB assertions, men dekker IKKE siste UX/sortering. Ikke publisert. Kjente konflikter: bolig/README behold begge avsnitt; bolig-guidance-workspace-browser-check behold PR333s collaboration-import/11tilleggstemaer og PR332s fristklokketekst. Gjenta relevant kontroll på faktisk integrert kandidat. Bevar demo-overlay ved senere main → demo; aldri demo → main.

Lokalt arbeidsområde: /workspace/scratch/15023a76e070/orvei-deadline-layout. Local HEAD ligger på main-base, hele PR-diffen er staged/arbeidsfiler; remote oppdateres via GitHub tree/commit/ref med expected SHA. Ikke reset/checkout over disse filene. node_modules og supabase/.temp er utrackede og skal ikke pushes. GitHub er varig kilde. Ny chat kan hente ren arbeidsbranch fra GitHub. Ingen hemmeligheter eller portaltokens skal lagres i handoff.
