# ProffDok: UX- og designvurdering med Byggbase som referanse

Dato: 27.10.2026. Bestilt av Kenneth Skogsrud. Dette er en vurdering og prioritert forslagsliste, ikke en godkjent implementeringsplan.

## Avklart med Kenneth – designskisse 01

Oppfølging 28.10.2026 (Europe/Oslo). Kenneth korrigerte prioriteringen: fasadebildene er en styrke, og målet er en gjennomført, moderne UX i absolutt hele appen med alle funksjoner bevart.

- **Bolig:** Behold fasaden som standard. Tett liste er et valgfritt supplement. Reduser samtidig informasjonsmengde med faner, boligdetaljer og utvidbar arbeidsflate. «Krever handling» på tvers av boliger er ikke avtalt som erstatning eller ny hovedvisning.
- **HR:** HR og medarbeidersamtaler er produktstyrker. Bevar hele dybden og rolleflyten, og gi dem samme moderne ramme.
- **Økonomi:** Ny prosjektøkonomi er lavt prioritert fordi kundene allerede bruker ERP. Mulig API-inngang vurderes senere. Dagens økonomifunksjoner fjernes ikke.
- **Helhet:** Én rød tråd i navigasjon, typografi, knapper, status, tabeller, faner, detaljer og mobilflyt. Alle eksisterende funksjoner og innganger må kartlegges og videreføres før noen modul erstattes.

[Åpne separat, privat designskisse 01](https://proffdok-designskisse.warmyak16384.chatgpt.site/). Visningen bruker ChatGPT-innlogging og fiktive eksempeldata. Ingen forbindelse til produksjonsdata eller utsendinger. Site-kilde: `a19c1bca05da5288e1c82b74c2972953ac4e263a`.

Skissen prøver felles ramme i oversikt, Min side, prosjekt/prosjektkart, bolig, plan, tilbud, vareflyt, KS/HMS og HR. Detaljfunksjoner er delvis illustrerte paneler. Den dokumenterer verken implementert funksjonsparitet eller TEST OK for en ny appversjon. Neste beslutning er visuell retning og informasjonsstruktur. Produksjonsimplementering er ikke utført.

## Konklusjon

Kundetilbakemeldingen er forståelig: Byggbase formidler en tydeligere, roligere og mer sammenhengende arbeidshverdag. Særlig arbeidsdeling mellom kontor og montør, oversikter og overgangen mellom oppgavene gir et moderne inntrykk. Dette er min designvurdering av det offentlige materialet, ikke en måling av faktisk brukervennlighet eller kvalitet i deres innloggede app.

ProffDoks viktigste mulighet er å gjøre eksisterende funksjoner enklere å finne og bruke som én arbeidsflyt. Vi har allerede mye av funksjonaliteten. En ny omgang med mange enkeltknapper eller store introduksjonskort vil gi mindre effekt enn en gjennomført arbeidsflate. Behold fagdybden, garantien, boligflytene og firmaskillet. Prioriter helhet og færre beslutninger per oppgave.

De første kandidatene bør være navigasjon, rollebasert arbeidsdag, prosjektets dagligvisning og tilbudets arbeidsflate. Ny prosjektøkonomi har lav prioritet; mulig ERP/API vurderes på sikt. Kapasitetsplanlegging vurderes separat med reelt datagrunnlag.

## Grunnlag og avgrensning

### Bekreftet ProffDok-baseline

- GitHub main: `5f58b1c6ca974e0cf97cb4b945c8d6603a39f485`.
- GitHub demo: `dcff082f06be7b68e1e00c8a2d43794a1393f1cf`.
- Vercel Production: `dpl_5rvFAAsZ4WDeDwWj7Gg6qa3NLfkm`, READY, main-SHA som over, alias `expo-proffdok.app`.
- Vercel demo: `dpl_5JwQAZx9Z7BYvGUnfnaYQvgg6ADK`, READY, demo-SHA som over, fast demo-host.
- Eksisterende arbeidsbranch: `fase45b-bolig-portal-polish-20261025`. Før rapporten hadde den ingen unike filer mot main, og lå én mergecommit bak. Ingen historiske installasjonssteg er kjørt.
- AGENTS, guardrails, arbeidsflyt og aktuell releasestatus er lest. Historiske Preview-tekster er ikke brukt som bevis på at en funksjon fortsatt mangler.
- Sammenligningen bygger på gjeldende kildekode og dokumenterte brukerreiser/QA. Demoens innloggingsside er åpnet; innloggede ProffDok-flater er ikke brukertestet på nytt i denne vurderingen. Ingen nye ytelsestall, klikkmålinger eller Safari-attest hevdes.

### Offentlig materiale fra Byggbase

- Forsiden og alle åtte produktsider: sju operative moduler og én AI-side.
- Hovedfilm: én identifisert MP4, 76 sekunder, gjennomgått visuelt med 19 bildeuttrekk over hele tidslinjen, omtrent hvert fjerde sekund. Dette er bildeanalyse, ikke sanntidsavspilling av hvert bilde.
- Alle sju produktdemonstrasjoner: fire navigerbare trinn per modul. Disse er animerte demonstrasjonsflater på nettstedet, ikke en innlogget prøve av produktet.
- Alle sju valgbare AI-eksempler. De er merket «kommer snart» og regnes som planlagte konsepter.
- Alle 16 hjelpeartikler som var listet i hjelpesenteret. Ingen innebygde video-/iframe-avspillere ble funnet i disse artiklene. Minuttangivelsene der er lesetid, ikke videolengde.
- Offentlige skjermbilder i veiledningene er også undersøkt. De gir et bedre grunnlag enn markedsføringsillustrasjonene alene, men dokumenterer ikke responstid, stabilitet eller all tilgjengelig funksjonalitet.
- Ingen prøvebruker er opprettet, ingen betalt prøve er startet og ingen henvendelse er sendt til Byggbase.

Dette er en bred gjennomgang av det tilgjengelige offentlige materialet. Skjulte innstillinger og funksjoner bak innlogging kan ikke fullstendig kartlegges uten tilgang.

## Hva som skaper det moderne inntrykket

1. **En forståelig fortelling.** Opplysningene følger jobben fra forespørsel til tilbud, gjennomføring og oppfølging. Brukeren får et bilde av hva som skjer etterpå.
2. **Ulik arbeidsflate for ulikt arbeid.** Kontoret ser oversikt og oppfølging. Ansattflaten vektlegger dagens jobb, timer, bilder og oppgaver.
3. **Rolig informasjonsrangering.** Tittel, status, hovedhandling og detaljer har forskjellige visuelle nivåer. Flate lister og tabeller bærer mye av informasjonen.
4. **Tall tett på beslutningen.** Pris og fortjeneste vises i kalkylen, ikke bare i en etterfølgende rapport. Det gjør resultatet av en endring synlig.
5. **Korte, konkrete handlinger.** Handlingsnavn og hjelpetekster beskriver hva som skjer. Tekstene om lokale bilder og synkronisering skiller telefonlagring fra innsending.
6. **Dokumentasjon med skjermbilder.** Veiledningene forklarer både kontorets og den ansattes side av oppgaven.

Vi bør hente prinsippene. ProffDoks egen petrol-/turkisprofil og godkjente Min side-retning bør videreføres. Fargebytte til Byggbase-grønt, ekstra animasjoner og store illustrasjoner er ingen nødvendig UX-forbedring.

## Funksjonsgjennomgang og konsekvens for ProffDok

«Finnes» nedenfor betyr funnet i gjeldende kildekode eller dokumentert leveranse. Det betyr ikke at hele funksjonen er prøvd innlogget på nytt i denne gjennomgangen.

| Område | Byggbase-materialet viser/beskriver | ProffDok i gjennomgått grunnlag | Anbefaling |
| --- | --- | --- | --- |
| Oversikt og oppfølging | Nøkkeltall, aktive jobber og handlinger som venter. | Startside, Min side, salgsoppfølging og HR/KS-oppfølging finnes. | Samle dagens relevante handlinger på tvers, med kilde, ansvarlig og direkte åpning. Unngå parallelle tellinger av samme sak. |
| Global navigasjon | Fast inndelt venstremeny på kontoret. | Desktop har menyknapp/drawer og egne prosjektinnganger. | Prøv en fast, sammenleggbar sidemeny på brede skjermer. Behold prosjektets egen navigasjon og vis bare autoriserte mål. |
| Ansattes hverdag | Egen mobilflate med Min dag, prosjekter, timer og plan. | Min side, egne planer, boligoppgaver, tilstedeværelse og timeføring finnes. | Løft dagens prosjekt og 3–4 hyppige handlinger foran håndbok/profil. Gjenbruk modulene, ikke opprett en konkurrerende ansattapp. |
| Første oppstart | Firmaoppsett, økonomistandarder og invitasjoner i veiledet rekkefølge. | Firmaregistrering, aktivering, invitasjoner og moduloppsett finnes. | Lag en kort oppstartsliste per rolle. Ikke gjør moduloppsett til en daglig hindring. |
| Befaring | Befaring inngår i meny-/veiledningsbeskrivelsen. | Befaringsnotat, bilder og Badskisse finnes. | Samle notat, bilder, kundedata og neste salgssteg. Behold skisseverktøyet og eksisterende kladdsikring. Det er ikke dokumentert at Byggbase har tilsvarende Badskisse. |
| Kalkyle | Elementbibliotek, ressurser, mengder, egne priser, timer og løpende fortjeneste. | Våtromstilbud, Generelt tilbud, maler, vareoppslag og prisberegning finnes. | Lag en tydelig oppsummering av gjeldende sum mens man arbeider. Et avansert ressursbasert kalkylebibliotek er et eget behov, ikke en kosmetisk endring. |
| Tilbudsredigering | Sidepanel, større arbeidsvindu, direkte justering og kundevendt forhåndsvisning. | Tilbudseditor og kundepreview i samme dokument finnes. | På PC: redigering og valgfri forhåndsvisning side om side. På mobil: tydelig veksling. Behold ett pris-/akseptgrunnlag. |
| Tilbudsoppfølging | Status og tidslinje, åpnede lenker og kundesvar. | Forespørsler, Under arbeid, Må følges opp, Akseptert/Avvist og historikk finnes. | Gjør neste handling tydelig på saken. Eventuell visning av lenkeåpning må beskrive hendelsen, ikke påstå hvem som leste eller at e-post er mottatt. |
| Kundeaksept og kontrakt | Frossen kundevisning og digitalt svar. | Publiserte versjoner, opsjonsvalg/antall, akseptbevis og valgfritt kontraktsteg finnes. | Forbedre lesbarhet, prisoppsummering og statustekst. Ikke gjenoppbygg akseptmotoren eller gjør kontrakt obligatorisk for alle prosjekter. |
| Tilbud til prosjekt | Kunde og lagret avtalegrunnlag følger med. | Flere godkjente veier finnes: direkte prosjekt, fra tilbud, med/uten kontrakt, enkel ordre. | Vis én relevant «Neste steg»-handling etter aksept, med tydelig valg av videre vei. Behold fleksibiliteten. |
| Prosjektarbeidsflate | Samlet prosjektside med tabeller, dokumenter og team. | Tre faser, prosjektkart, statusdialog, nestehandling og mobil feltmeny finnes. | Prøv valgfri kompakt dagligvisning. Behold det uttrykkelig godkjente prosjektkartet som tilgjengelig oversikt. |
| Fremdrift | Tidslinje, faser, ansvar og ansattplan. | Planbygger, tilbudsimport, tidslinje, PDF og kunde-/UE-visning finnes; Bolig har egen samlet Gantt. | Standardvisning for inneværende uke/neste arbeid. Vis detaljer i panel/fullskjerm. Ikke bygg en tredje planmotor. |
| Kapasitetsplanlegging | Personer, skift, fravær og konflikter på tvers av prosjekter beskrives. | Deltakere, arbeidsøkter, egne planer og Bolig-bemanning finnes. | Kartlegg om vi mangler en samlet kapasitetsvisning. Tilstedeværelse, arbeidstid og fremdriftsprosent må ikke tolkes som kapasitet uten grunnlag. |
| Timeføring og utlegg | Manuell registrering, fra–til, stoppeklokke, ukegodkjenning og eksport. | Dagens snarveier, manuell/fra–til, serverbasert tidtaking, kopiering, ukegodkjenning, kvitteringer og lønnseksport finnes. | Forenkle daglig inngang og standardvalg. Undersøk en vedvarende liten indikator for aktiv tidtaking på tvers av arbeidsflater. Ikke endre godkjennings-/eksportreglene som sideeffekt. |
| Oppmøte | Valgfri GPS ved inn-/utsjekk, atskilt fra timeføring. | Bolig har inn-/utregistrering og oversiktsliste ved tilsyn. | Tydelig inn-/utstatus er relevant. GPS er ikke en forutsetning for god UX og prioriteres ikke automatisk. |
| Sjekklister | Utfylling i felt, bilde på punkt og direkte avvik. | Prosjektsjekklister, gjennomføringer, bilder, historikk og avviksoppfølging finnes. | Vis Pågår/Neste først og ferdige nederst. Bruk store svarvalg, kort punkttekst, bevar arbeidssted og gi riktig direkte avviksinngang. Ingen automatisk masse-OK. |
| KS/HMS, SJA, RUH og rutiner | Maler, rutiner, lesebekreftelser og avviksbehandling. | Rutinebibliotek, versjoner, godkjenning, lesebekreftelser, SJA/RUH, risiko og avvik finnes. | Gjør «Mitt arbeid» tydeligere enn «Forvaltning». Skjul forklaringer ved behov, men behold krav og konsekvenser synlige ved handlingen. |
| Bilder | Bildestrøm, kommentarer, kameraopptak og synk-kø beskrives. | Bildearkiv, bildeoptimalisering, stor visning og samlet oversikt fra bilder/sjekkpunkter finnes. | Tydelig bildestrøm med kilde, dato og kommentar. Vis per fil om bildet bare er lokalt, venter eller er bekreftet lagret. En offline-kø må først verifiseres/bygges, ikke bare loves med tekst. |
| Dokumenter og FDV | Firma-/prosjektdokumenter og tydelige delingsnivåer. | Produktdokumentasjon, FDV, rapporter og eksterne portaler finnes. | Lag én lesende dokumentinngang med kilder og status. En samling i grensesnittet skal ikke kopiere dokumentene eller utvide tilgangen. |
| Prosjektøkonomi | Budsjett, faktiske kostnader og prognose samles. | Salgspriser og Bolig sitt fakturaregister/a konto/indeks er dokumentert. En tilsvarende samlet kostnadsprognose er ikke bekreftet i gjennomgått flate. | Lav prioritet etter Kenneths avklaring. Bevar eksisterende funksjoner; vurder ERP/API på sikt. Ingen ny økonomioversikt i denne UX-runden. |
| Kunder og firma | Kunderegister, ansatte og innstillinger. | Firmaavgrensede kundeprofiler, HR, organisasjon, flerfirmatilgang og rolle-/modulstyring finnes. | Samme språk for kontakt og tilgang overalt. Kontakttildeling skal aldri se ut som en portalinvitasjon eller modulrettighet. |
| HR | Fravær, ansatte og lønnsgrunnlag beskrives. | Egen HR-modul med oppfølging, håndbok og timer/utlegg finnes. | Behold særskilt HR-innsyn. Vis bare oppgaver/antall som passer rollen i en samlet oversikt; ikke flytt privat innhold ut på en generell startside. |
| Varesøk, ordre og telling | Leverandørprisfiler til kalkyle beskrives. | Prissøk, strekkode, plukklister, varetelling og ny proffvarebestilling finnes. | Gjenbruk siste leveranse som mønster: tastaturflyt, fokus på antall, bevart kladd og tydelig sendestatus. Samme varekort/antallsgrep der betydningen er den samme. |
| Boligprosjekter og eksterne | Underprosjekter beskrives; tilsvarende bolighierarki og beboerflyt er ikke dokumentert i materialet. | Bygg/boliger, grunnpakker, tilvalg, endringsaksept, ordre, Gantt, portaler, løpende overtakelse og indeks/a konto finnes. | Behold fasaden som standard og gi valgfri tett liste. Relevant informasjon åpnes gjennom faner og boligdetaljer. Viderefør rollebestemt UE-/leverandør-/beboerflyt. |
| Garanti og overlevering | Generell prosjektdokumentasjon vises. | Dokumentert tetthetsgaranti, sluttkontroll og rapportgrunnlag er en egen fagstyrke. | Én forståelig liste med reelle mangler, direkte åpning og status. Ikke fjern fagkrav for å gjøre skjermen grønn. |
| Hjelp, støtte og gjenoppretting | Oppgaveorienterte guider, skjermbilder og gjenoppretting fra papirkurv beskrives. | Søkbart hjelpesenter, Bolig A–Å, support, arkiv og versjonshistorikk finnes. | Kort hjelp ved oppgaven og lenke til full guide. Enhetlig Arkiv/Angre/Gjenopprett må kartlegges per datatype; ikke innfør generell automatisk sletting. |
| AI | Sju fremtidskonsepter med kilde og brukerens godkjenning. | Flere regel-/tekstforslag finnes; kontrakt-AI er tidligere utsatt. | Start eventuelt med avgrenset søk eller tekstutkast med kilde. Ingen automatisk pris, sikkerhetsvurdering, rutinepublisering eller dokumentasjon av arbeid som ikke er utført. |

## Prioritert arbeidsliste

| Pri. | Konkret forslag | Brukergevinst | Type og risiko | Ferdig når |
| --- | --- | --- | --- | --- |
| 1 | Felles navigasjon og kompakt apphode på desktop. | Brukeren ser hvor han er og kan bytte modul uten å lete. | Visning/navigasjon. Høy regresjonsrisiko selv uten databaseendring. | Aktivt mål er synlig, riktig firma følger med, kladd/retur/dvale fungerer og gamle mål fortsatt finnes. |
| 1 | Min side: dagens arbeid og 3–4 relevante hurtighandlinger først. | Montøren kommer rett til jobben. | Gjenbruk/presentasjon; nye samlekilder kan kreve eget lesegrunnlag. | Dagens prosjekt, timer, sjekkliste og bilder åpner riktig mål uten nytt prosjektvalg når konteksten er kjent. |
| 1 | Prosjekt: valgfri dagligvisning med status, neste handling og arbeidsinnhold. | Mindre navigasjon og scrolling etter oppstart. | Presentasjon med bevaring av prosjektkart. | Prosjektkartet er fortsatt tilgjengelig; viktig arbeidsinnhold og lagrehandling er lett å nå på PC og mobil. |
| 1 | Tilbud: roligere editor med fast sum og valgfri kundepreview ved siden av. | Færre hopp mellom redigering og kontroll. | Presentasjon rundt eksisterende editor; pris/aksept/hydrering er fredet. | Beløpet stemmer med dagens beregning, preview bruker riktig lagret utgave og kladd tåler retur/fanebytte. |
| 1 | Lik visning av lokal kladd, lagring og serverbekreftelse. | Brukeren vet om arbeidet faktisk er trygt lagret. | Visning som må følge reell lagringstilstand; eventuell kø er ny funksjon. | Appen skiller «lagret på enheten» fra «lagret på server», og gir nyttig retry uten dobbeltføring. |
| 2 | Felles arbeidslister og oppfølging med ansvar, frist og neste handling. | Det som haster blir lettere å finne. | Presentasjon/integrasjon med kontroll av kilder og tilgang. | Samme sak telles én gang, ukjent status vises ikke som null, og direkte åpning bevarer riktig modul/prosjekt. |
| 2 | Samlet plan- og kapasitetsoversikt. | Bedre ressursfordeling på flere jobber. | Funksjon/produktkartlegging; potensielt større databehov. | Reell tildeling, fravær og arbeidstid definerer kapasitet; tilstedeværelse alene gjør det ikke. |
| Senere | Eventuell ERP/API-inngang. | Bruk kundens eksisterende økonomisystem. | Separat produkt- og integrasjonsoppgave; lav prioritet. | Datakilder, tilgang og behov er avklart før noe bygges. |
| 2 | Ensartet bildestrøm og dokumentinngang. | Mindre leting, enklere dokumentasjon. | Først lesende oversikt; eventuell ny offline-kø separat. | Bilder finnes én gang med kilde, og feil/opplastingskø kan følges opp uten tapt kladd. |
| 2 | Bolig: fasaden som standard, valgfri tett liste og gradvis åpning av detaljer. | Roligere oversikt med all relevant informasjon tilgjengelig. | Visningsendring med alle boligfunksjoner bevart. | Fasaden er bevart, liste er valgfri, og pakker, bestillinger, samarbeid, dokumentasjon og overtakelse er lette å nå. |
| 3 | Enkel førstegangsveiledning og korte videoer fra den faktiske appen. | Potensielle kunder og nye ansatte forstår verdien raskere. | Onboarding/hjelp, etter stabilisering av valgt UX. | Oppgavene kan løses uten opplæring i alle moduler og filmen viser det som faktisk finnes. |
| 3 | Kildebasert AI-hjelp der et dokumentert tidsproblem finnes. | Mindre søk-/skrivearbeid. | Ny funksjon med egen kostnads-/tilgangsvurdering. | Kilde, begrensninger og brukerens endelige handling er tydelige. Ingen automatisk godkjenning. |

Prioritet er en anbefaling, ikke et estimat i utviklingstimer. Rekkefølgen må justeres etter faktisk brukertest og hvor mange eksisterende brukerreiser hvert grep påvirker.

## Designretning å prøve

### Kontor på PC

- Én stabil venstremeny på brede skjermer, med sammenlegging. Mulig gruppering: Arbeid, Salg og varer, Firma. Oppsett og systemadministrasjon holdes unna den vanlige arbeidsrekkefølgen. Alle mål følger fersk tilgang.
- Ett kompakt apphode med arbeidsfirma, kontekst og relevante handlinger. Firma og representasjon skal være tydelige, også for brukere på tvers av firmaer.
- Modulens tittel, en kort statuslinje og én tydelig hovedhandling. Sekundære handlinger i «Flere handlinger» når de sjelden brukes.
- Lister og tabeller der brukeren sammenligner mange saker. Kort der hvert element faktisk trenger mer forklaring. Små forhåndsvisninger og sidepanel for detaljer.
- Behold store arbeidsflater/fullskjerm for tilbud, planer og større skjemaer. Ikke legg store skjemaer inn i flere små dialoger inni hverandre.

### Montør på mobil

- Første skjerm vektlegger dagens arbeid, aktiv tidtaking og relevante sjekklister. Vanlig arbeid skal ikke begynne med firmainnstillinger.
- Gjenbruk prosjektets etablerte feltmeny. Vurder faste innganger på tvers av Min side og prosjekt, men unngå to konkurrerende bunnmenyer.
- Ett trykk fra valgt prosjekt til timeføring, bilder eller sjekkliste når rettigheten og konteksten er kjent.
- Lange skjemaer fyller skjermen. Viktig lagre-/fullførhandling og avbryt er lette å finne, også med skjermtastaturet åpent.
- Etter kamera, avbrudd eller dvale kommer brukeren tilbake til samme punkt. Vis reell lagrings-/sendestatus.

### Visuelle regler

- Viderefør vedtatt Min side-retning fra 10.10: petrol, lyse arbeidsflater, kompakte kort og konsekvente ikoner med tekst.
- Reduser konkurrerende gradienter, kort inni kort, store velkomstfelt og gjentatt veiledning på daglige arbeidsflater.
- Lag et lite felles sett for typografi, avstander, knapper, tabeller, statusbrikker, dialoger, tomtilstander og feilmeldinger. Innfør det modulvis.
- Bruk rolige semantiske statuser. Rødt skal beskrive et reelt problem, ikke pynte på en boks. Farge alene er ikke status.
- Sentrale trykkflater minst 44 px; skjemafelt og brødtekst skal være lesbare på mobil. Tette desktop-tabeller kan ha mindre tekst når kontrast og lesbarhet er god.
- Behold tallformater, mva.-merking, enheter og norske datoer konsekvent. En sirkelprosent er bare nyttig når beregningsgrunnlaget er definert.

## Hva vi ikke bør kopiere ukritisk

De offentlige skjermbildene viser også mange menyvalg og prosjektfaner hos Byggbase. Et pent uttrykk er derfor ikke bevis på at alle arbeidsoppgaver er enklere. Deres enklere rollemodell er heller ikke en oppskrift for ProffDok, som har flerfirmabruk, særskilt HR-innsyn og forskjellige eksterne portaler. Vi bør måle konkrete oppgaver i stedet for å konkurrere i antall moduler eller nye grafer. Skjermbildene kan dessuten vise en tidligere produktversjon; de er ikke en fersk innlogget kontroll.

Unngå å kopiere automatisk sletting etter en bestemt frist, bredere dokumentdeling eller nye godkjenningskrav uten et selvstendig behov. Det samme gjelder ubekreftede økonomigrafer, påstander om at en bestemt kunde har lest en lenke, og at lokalt lagret arbeid allerede er sikkert på serveren.

## Anbefalt gjennomføring

1. **Mål nåsituasjonen på et fast demosett.** Fem brukerreiser: opprette et enkelt tilbud, fortsette en befaring, føre dagens timer, ta bilde/lukke sjekkpunkt og finne det som stopper en boligoverlevering. Bruk både en ny bruker og en erfaren bruker. Registrer tid, feil, tilbakehopp og om oppgaven ble fullført uten hjelp. Ingen slike målinger er gjennomført i denne rapporten.
2. **Lag to avgrensede visninger.** En kontorflate for prosjektleder og en mobilflate for montør. Bruk faktiske moduler og realistiske, syntetiske data. Behold det godkjente prosjektkartet som et tilgjengelig valg.
3. **Bestem ett designsystem fra prøven.** Gjennomfør først Startside/Min side, prosjektoversikt og ett prosjekt. La erfaringen styre tilbud og øvrige moduler.
4. **Skill visningsendringer fra nye funksjoner.** Ny kostnadsprognose, kapasitetsmotor, offline-kø, AI eller globale søkeendepunkter får eget scope, datakrav og tilgangskontroll.
5. **Release modulvis.** Relevante critical checks og innlogget Preview, Kenneths TEST OK, korrekt Production-commit og kontrollert main → demo med bevart overlay. Ingen stor samtidig omskriving.

Første implementeringsforslag bør derfor være én samlet, avgrenset UX-prøve av navigasjon, Min side og prosjektets dagligvisning. Tilbudets editor følger som eget område etter at retningen er avklart. Økonomi og kapasitetsplanlegging skal ikke snikes inn i en designendring.

## Forbedringer som allerede er levert og må gjenbrukes

Ikke presenter disse som manglende funksjoner: mobil feltmeny, prosjektkart/nestehandling, fullskjermvisning, dagens timehandlinger, egne planer, samlet bildeoversikt, søkbart hjelpesenter, kundepreview i samme dokument, antall og tastaturflyt i varebestilling, Bolig sin samlede Gantt, eksterne portaler og løpende overtakelse.

Særlig prosjektkartet med alle tre faser er et bevisst og godkjent valg fra 17.10 kl. 11:50. En kompakt variant bør være valgfri og prøves, ikke fjerne dette som en påstått feil. Fullskjermvisning finnes allerede og er heller ikke en ny funksjon å bygge.

## Kilder

### Byggbase: produkt og demonstrasjoner

- [Forside og hovedfilm](https://byggbase.no/)
- [Kalkyle](https://byggbase.no/produkter/kalkyle)
- [Tilbud](https://byggbase.no/produkter/tilbud)
- [Prosjekter](https://byggbase.no/produkter/prosjekter)
- [Fremdriftsplan](https://byggbase.no/produkter/fremdriftsplan)
- [Timeføring](https://byggbase.no/produkter/timeforing)
- [HMS/KS](https://byggbase.no/produkter/hms-ks)
- [Økonomi](https://byggbase.no/produkter/okonomi)
- [AI – planlagte eksempler](https://byggbase.no/produkter/ai)

### Byggbase: alle 16 gjennomgåtte hjelpeartikler

- [Lag din første kalkyle](https://byggbase.no/ressurser/hjelpesenter/lag-din-forste-kalkyle)
- [Last opp prisfil](https://byggbase.no/ressurser/hjelpesenter/last-opp-prisfil)
- [Send tilbudet til kunden](https://byggbase.no/ressurser/hjelpesenter/send-tilbud-til-kunden)
- [Før timer](https://byggbase.no/ressurser/hjelpesenter/fore-timer)
- [Kom i gang](https://byggbase.no/ressurser/hjelpesenter/kom-i-gang-med-byggbase)
- [Installer ansatt-appen](https://byggbase.no/ressurser/hjelpesenter/installer-ansatt-appen)
- [Prisoppdatering](https://byggbase.no/ressurser/hjelpesenter/prisoppdatering-av-kalkyle)
- [Rediger maler](https://byggbase.no/ressurser/hjelpesenter/rediger-og-oppdater-maler)
- [Papirkurv](https://byggbase.no/ressurser/hjelpesenter/papirkurv-for-saker-og-kalkyler)
- [Fra tilbud til prosjekt](https://byggbase.no/ressurser/hjelpesenter/fra-tilbud-til-prosjekt)
- [Fremdrift og bemanning](https://byggbase.no/ressurser/hjelpesenter/fremdriftsplan)
- [Del firmadokumenter](https://byggbase.no/ressurser/hjelpesenter/del-firmadokumenter-med-ansatte)
- [Bilder](https://byggbase.no/ressurser/hjelpesenter/bilder-i-prosjektet)
- [GPS-oppmøte](https://byggbase.no/ressurser/hjelpesenter/gps-oppmote)
- [Lønnsgrunnlag](https://byggbase.no/ressurser/hjelpesenter/slik-fungerer-lonn-i-byggbase)
- [Sjekklister og avvik](https://byggbase.no/ressurser/hjelpesenter/sjekklister-og-avvik)

### ProffDok: dagens kildegrunnlag

Alle kildekodereferanser i vurderingen gjelder main-SHA oppgitt over.

- [Aktuell releasestatus](../../CURRENT_RELEASE_STATUS.md)
- [Arbeidsflyt](../DEVELOPMENT_WORKFLOW.md)
- [Arkitektur og historiske endringskontrakter](../architecture/EXPO_PROFFDOK_ARCHITECTURE.md)
- [Vedtatt visuell retning](../architecture/UX_DIRECTION_20261010.md)
- [Tidligere samlet UX-gjennomgang](../qa/APP_UX_REVIEW_20261016.md)
- [Prosjektarbeidsflate og godkjent prosjektkart](../qa/PROJECT_WORKSPACE_UX_20261017.md)
- [Min side og prosjektoversikt](../qa/PERSONAL_PROJECT_UX_20261016.md)
- [Varebestillingens tilgang og sendekontrakt](../architecture/PRO_CATALOG_ORDERS.md)
- Kildekode: desktopSideMenu, WorkspaceViewMode, ProjectWorkspaceChrome/presentation/CSS, HomeFollowups, PersonalPage, SalesListView og Sales README, TimeSheet/TimeManagement, ProgressPlanWorkspace, KshmsModule/KshmsDeviations, HrModule, PhotoOverview, StorePriceSearchView, BoligEntry/BoligProjectHome og tilhørende modul-/QA-dokumentasjon.

## Endringsstatus

Rapporten er oppdatert med Kenneths føringer, og en separat privat designprototype er opprettet. Ingen appkode, database, tilgang, e-post, ProffDok-produksjon, demo, WordPress eller eksterne kundedata er endret. Ingen nye utsendinger er gjort. Vurderingen og skissen krever ikke en ny app-release.
