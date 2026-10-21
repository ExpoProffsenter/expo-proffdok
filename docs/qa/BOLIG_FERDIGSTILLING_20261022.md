# Dokumentert ferdigstilling – 22. oktober 2026

Miljømål **BEGGE**. Fortsatt samme foundation-branch og draft PR #278. Utgangspunkt `83777dfa`. Først Preview/Sandbox; ingen produksjonsmigrasjon, merge, TEST OK eller main → demo-synk i denne etappen.

## Kontroll før endring og avgrensning

Begge oppgitte arbeidsmapper og remote main/feature kontrollert. Ingen nyere sporet kode. `work/bolig-completion-20261022` med den tomme `20261021221611_bolig_completion_review.sql` er beholdt urørt. Den eksisterende delte feature-mappen brukes videre. Ingen ny branch eller branchrydding.

Scope: egne Bolig-komponenter/klient/CSS, Bolig-hjelp, to additive migrasjoner og tilhørende permanente QA. Eksisterende prosjekt-/sjekklistemotor leses gjennom original tilgangskontroll; ingen endring av motor, Sales, innlogging, globale menyer eller HR. Tidligere diff mot main inneholder allerede avtalte integrasjoner; denne etappen legger ikke til nye slike kjerneendringer.

## Produktkontrakt

- Boligens **Ferdigstilling** åpner kontrollplan i eksisterende arbeidsdialog. Hvert kontrollkort åpner egen popup med bevis, bekreftelse og lagring, uten scrolling for å finne editoren. Fem faste krav: utførelse, sjekklister/kontroller, avvik, bilder, sluttdokumentasjon. Egne påkrevde kontrollpunkter kan legges til og knyttes til aktive rom. Punkter kan stå som ikke utført. Arkivert rom gjør tilknyttet dokumentasjon ugyldig til den er kontrollert/tilknyttet på nytt.
- Dokumentreferanse/kontrollbeskrivelse og eksplisitt bekreftelse kreves for utført punkt. Bevisst endring til ikke utført sperrer godkjenning. Dato/aktør og endringer bevares.
- Ansvarlig velges blant aktive interne firmamedlemmer. Opprettelse setter innlogget leder som ansvarlig. Ingen nye arbeidsfrister eller fristutsendinger innføres her. Eksisterende sjekkliste-/avvikspåminnelser beholdes; en egen frist-/varslingsflyt for Bolig-kontroller gjenstår før fristfelt innføres.
- **Utført → Kontrollert → Klar for overtagelse → Overtatt** er ulike tilstander. Kontrollert er ikke godkjent. Bolig-prosjektlederrollen kan godkjenne etter egen bekreftelsesside når mangellisten er tom. Det kreves ikke en annen person enn utføreren i denne første modellen.
- Overtagelse registrerer referanse til en **allerede gjennomført protokoll**, med registreringsdato og navn. Dette er intern oppfølging, ikke juridisk aksept eller signering. Protokollen må vise faktisk overtagelsesdato/signatur.
- Bygg aggregerer aktive boliger og egne fellesarbeider. Prosjektet aggregerer aktive bygg og egne prosjektfellesarbeider. Manglende kontrollplan, tomt bygg eller fravær av aktive barn kan aldri bli automatisk ferdig. Ingen fellesarbeider krever uttrykkelig begrunnelse og etterfølgende godkjenning. Samlet Utført krever også utførte barn. Samlet Overtatt krever overtatte barn.
- Nytt statusområde **Ferdigstilling** i fasaden/boliglisten. **Ferdigstilling av bygg/prosjekt** åpner søkbare, sidebegrensede oversikter med underliggende mangler og klikk videre til bygg/bolig. Varelevering beholder eget statusområde og egne tall.

## Datagrunnlag og grenser

Et koblet ordinært leilighetsprosjekt kontrolleres med eksisterende prosjekt- og modulrettighet. Seneste kontroll per kategori må være fullført, prosjektets aktuelle autoritative sjekkliste må ikke ha Avvik, og avvikssentralen må ikke ha åpne saker på prosjektet. Ingen gjennomført kontroll er en mangel. Historiske fullførte sjekklister endres ikke. Sjekklister, bilder og dokumenter åpnes i eksisterende prosjekt.

Bilder, sluttdokumentasjon og utførelse **gjennomgås manuelt** og dokumenteres med presise referanser. Filinnhold/eksternt arkiv kontrolleres ikke automatisk. Uten koblet prosjekt er også sjekkliste-/avviksreferanser manuell kontroll, tydelig angitt i UI. Dette er ikke automatisk FDV-generering eller en ny filmodul.

En godkjenning bindes til faktisk lagret grunnlag: bolig/rom/valg/ordre/mottak, relevant prosjekttilknytning, prosjektets lagrede JSON, kontrollhistorikk, avviksrevisjoner, egne krav/ansvarlig og barnas aktuelle kontrollgrunnlag/status/revisjon. Modellen er bevisst konservativ: også andre lagrede endringer i koblet prosjekt-JSON kan kreve ny kontroll. Endret innhold i et eksternt dokumentarkiv kan ikke oppdages; prosjektleder må gjenåpne manuelt.

Endret grunnlag gjør tidligere godkjenning/overtagelse til **Ny kontroll kreves**. Gjenåpning krever begrunnelse. Eldre overtagelse bevares i historikken. Godkjent grunnlag kan ikke skrives over; etter gjenåpning må foreldet boligbevis kontrolleres på nytt. Foreldre får også ny kontroll når underliggende grunnlag endres.

## Lagring og tilgang

To private tabeller med RLS, alle direkte grants tilbakekalt. Public invoker-RPC går til en avgrenset privat definer med tom search_path, fersk firma-/modul-/rolle-/root-/aktiv-scope-kontroll. Interne tree/source-funksjoner er tilbakekalt fra authenticated. Eksisterende prosjektkontroll brukes før prosjektdata leses; manglende prosjekttilgang skjuler bevis, godkjenning, overtagelsesreferanse og historikk. UI viser konkret sperre.

Revisjon og serverberegnet grunnlag må stemme for hvert skriv. Rot-/katalog-/romlåser følger eksisterende låserekkefølge. Ingen automatisk write-retry. Mistet svar kan ikke gjenta et vellykket skriv med gammel revisjon. Full historikk lagres, UI viser siste 100 hendelser. Lokale usendte skjemaer er avgrenset per bruker/firma/prosjekt/scope/punkt. Fokusoppdatering bevarer editor og kladd; grunnlagskonflikt krever eksplisitt bruk av siste grunnlag. Forsinkede svar fra tidligere kontekst ignoreres.

## QA

- PGlite/PostgreSQL: **546 assertions PASS**, alle tidligere boligscenarier inkludert. Ny dekning: ingen fri ferdigstatus, fem krav, reader/fremmed firma/ukjent scope, ugyldig bevis/ansvarlig, revisjonskonflikt, kontrollert/godkjent/overtatt, sperret endring, begrunnet gjenåpning, historisk overtagelse, egen bygg-/prosjektfelleskontroll, underliggende boligkrav og overtagelseskrav, nytt rom opphever hele godkjenningskjeden, ekte sjekklistestatus/åpne avvik, skjult bevis ved bortfalt prosjekttilgang, private funksjons-/tabellsperrer.
- Ny Chromium-scenariofil: **24 assertions PASS**: usendt bevis, fokus/lukking, failed write, kontroll → bekreftelsesside → godkjenning → overtagelse → gjenåpning/historikk, eget ikke utført romkrav og reader/fremmed kontekst. 320/390/1024/1366 px, ingen horisontal overflyt og minst 16 px skrift i bevisfelt.
- Oversiktstest tilpasset ny **read-only** completion GET i tillegg til eksisterende overview. Ingen write er tillatt i testen. Ny assertion for særskilt ferdigstillingslag. Historisk veiledningsassertion i boligkorttest erstattet av ny integrasjonsslot, øvrige kontroller beholdt.
- Faktisk Sandbox: `scripts/bolig-completion-sandbox-smoke.sql` **PASS**. Originale prosjekt-/sjekklistetabeller og autentisert RPC, syntetiske fixturedata: bevis → godkjenning → overtagelse → nyere native kontrollkladd → Ny kontroll kreves. Full rollback; ingen e-post.
- Migrasjoner installert kun i Sandbox: `bolig_documented_completion`, `bolig_completion_aggregate_handover`. Security advisors kontrollert før/etter: nye meldinger er forventet deny-all RLS uten policies på de to private gateway-tabellene. Ingen brede grants eller generell advisor-opprydding.
- Full critical build, øvrig berørt regresjon, eksakt CI/READY og faktisk skynett-UX dokumenteres ved ferdig publisering nedenfor. Faktisk mobil/Safari og ekstern protokollsignering er ikke bekreftet av Chromium-testene.

## Videre

Neste etappe kan bygge gjenbrukbare kontrollmaler/massefordeling, faktisk dokument-/filtilknytning og FDV, samt avklarte frister/ansvarsvarsler. Portaler, endringsordre, privat kontraktsanalyse og Excel-import er fortsatt egne etapper. Ingen reell e-postsending er nødvendig eller utført for denne ferdigstillingsflyten.

## Gjennomført publisert skynett-test

Fast branch-Preview og bevart innlogging kontrollert. `DEMO – Dokumentert ferdigstilling` er opprettet som syntetisk testprosjekt med to boliger. H0101 ble gjennomført via fem kontrollpopuper, usendt bevis lukket/gjenåpnet, godkjent, registrert overtatt, gjenåpnet med begrunnelse og godkjent på nytt. Alle 10 hendelser ble vist i historikken. H0101 står Klar for overtagelse; H0102 Ikke startet. Byggets egne fellesarbeider er uttrykkelig avklart uten egne arbeider. Bygget står fortsatt Under arbeid og Godkjenn er sperret av H0102. Prosjektfellesarbeider er fortsatt uavklart. Ingen ekte kontaktdata, e-post eller reelle overtagelser er opprettet.

Servermåling på eksisterende syntetisk prosjekt med 500 boliger / 25 bygg: completion returnerte 526 scopes på 514 ms i én måling. Dette er ikke en full last-/ytelsestest. Full lokal critical build og eksisterende boligregresjon PASS (oversikt 40, rom 51, rominnhold 35, rompakker 36, avsnitt 35, boligkort/tilpasning 21, levering 31, klargjøring 33; e-post/mock 46). Faktisk popup-QA førte til egen bevispopup og siste lesbarhetspolering: naturlig boligrekkefølge, 16 px boligoverskrifter, minst 72 px radhøyde og lesbar nøytral deaktivert godkjenningsknapp. GitHub PR Core Safety for siste publiserte commit må være grønn før TEST OK/merge; ingen merge er utført.
