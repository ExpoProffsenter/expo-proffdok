# Boligprosjekter – arbeidsflate og videre produktkrav

## Oppdatert 22. oktober: dokumentert ferdigstilling i Preview-etappen

Ferdigstillingsmotor for bolig, bygg og prosjekt er implementert med kontrollbevis, ansvarlig, manuell dokumentreferanse, native prosjekt-/sjekkliste-/avvikskontroll, egne fellesarbeider, godkjenning, intern overtagelsesregistrering og begrunnet gjenåpning. Endret grunnlag opphever gyldig grønn status og påvirker foreldre. Se `docs/qa/BOLIG_FERDIGSTILLING_20261022.md` for kontrakt, grenser, tester og publiseringsstatus. Eldre formuleringer nedenfor om at motoren mangler er historiske. Automatisk FDV/filverifisering, kontrollmaler/massefordeling og Bolig-frister med varsling er ikke levert i denne etappen.


Kenneths instruks 21. oktober 2026: så nær den godkjente Solgløtt-konseptskissen som mulig. Førsteinntrykket av foundation var svakt, med mye luft og lange skjemaer. Denne filen skiller nåværende leveranse fra ønskelisten.

## Oppfølging: individuelle avvik, boligkort og samlede leveranser

Neste prioritering etter denne Preview-runden: samlet, dokumentert ferdigstilling per bolig med sjekklister/kontroller, avklarte avvik, bilder/sluttdokumentasjon og overtagelse som grunnlag. Vis antall faktisk ferdige boliger mot aktive boliger i valgt bygg og hele hovedprosjektet. Et bygg er først ferdig når alle relevante boliger og byggets fellesarbeider er ferdigstilt. Prosjektet følger alle aktive bygg og prosjektets fellesarbeider. Ingen fri grønn status fra et utkast eller fra varemottak. Avklar regler for gjenåpning, godkjenner og endringer etter overtagelse i denne etappen.

Individuell vare-/mengdetilpasning ligger nå i Preview/Sandbox med begrunnelse, forhåndsvisning, ny boligvalgsversjon, separat pristillegg/fratrekk og gjenoppretting av opprinnelig fryst pakkevalg. Delte grunnpakker/tilvalgspakker og andre boliger beholdes. Aktive ordre sperrer tilpasningen for eksplisitt avklaring. Høyrekolonnen har korte, ugjennomsiktige handlingskort som åpner popuper for rom/pakker, bestilling/levering, sjekklister/dokumentasjon og ferdigstilling. Sjekklister og overtagelse gjenbruker eksisterende koblede prosjektflater, med eksisterende prosjekttilgang. Samlede leveransetall og boligliste finnes per bygg og prosjekt. Ferdigstillingsdialogen forklarer kontrollene og åpner eksisterende overtagelse, men oppretter ingen ny ferdigstatus. Se docs/qa/BOLIG_INDIVIDUELLE_AVVIK_20261021.md.

## Nå: prosjektoversikt, bygg, rom og varevalg

Bestilling/levering er utvidet i samme Preview: felles/egen leveringsadresse, samlet/delt bestilling og levering, valgfritt leverandørordrenummer, frosset ordregrunnlag og mengdeført varemottak med historikk. Eksplisitt bestillingsmail har to vedlegg (eksisterende Cordel ASCII-format og Excel), firmalayout og tydelig leilighets-/leveringsinformasjon. Ingen sending uten brukerens sendeknapp. Reell provider-sending er ikke utført under QA. Faktiske statuskoder er koblet til byggoversikten. Se docs/qa/BOLIG_BESTILLING_LEVERING_20261021.md for gjeldende scope og begrensninger. «Neste anbefalte»-avsnitt om dette nedenfor er historisk; neste etappe er faktisk fremdrift/sjekklister per bolig/rom, kundeaksept og eksterne roller. Excel-import forblir sist.

Ny pakkeetappe: grunnpakker og Tilvalgspakker får egendefinerte, ordnede avsnitt med kort kundetekst. Tilvalgspakker kan inneholde flere varer som velges samlet til én pakkepris. Pris/fratrekk beholdes, mens hver vare forblir selvstendig i bestillingsutkastet. Gamle enkeltvarer og lokale utkast oppgraderes uten endring av historiske valg. Nullfordeling på tom bolig er rettet. Rediger bygg har nå Lagre endringer som hovedhandling før eksplisitt gjennomgang/bekreftelse. Se docs/qa/BOLIG_AVSNITT_20261021.md.

Neste anbefalte samlede funksjonspakke er bestilling og levering: kjøpers Vårt ordrenummer, separat leverandørordrenummer, felles/individuell leveringsadresse, delleveranser og tydelig overgang fra utkast til faktisk bestilling. Etterpå kobles faktisk fremdrift/sjekklister til bolig og rom, deretter kundeaksept og avgrenset ekstern tilgang. Excel-import forblir sist.

Siste UX-pakke: én Oppsett-knapp øverst i prosjektet, «Leilighetsinformasjon» som navn på boligdialogen og kompakte glassvinduer med små statusmerker på fasaden. «Boligliste» og «Filtrer boliger» søker samlet i hele hovedprosjektet med kontakt, offisielt bolignummer og status. Resultatet har 50 boliger per side. Fasade nullstiller søk/filter. Se docs/qa/BOLIG_OVERSIKT_20261021.md.

Samlet klargjøring er lagt til under Oppsett → Bygg og boliger: Rediger bygg, Nummerer boliger og Rom og pakker til flere boliger. Prosjektlagrede rommaler kan tilføre rompakker/fellespakke til utvalgte boliger etter forhåndsvisning. Egne valg beholdes som standard; eksplisitt tillegg fyller bare manglende innhold. Eget offisielt bolignummer er separat fra prosjektets leilighetsnummer. Se docs/qa/BOLIG_KLARGJORING_20261021.md for gjeldende status og begrensninger. Eldre «gjenstår»-avsnitt nedenfor er historiske der denne leveransen dekker dem. Kenneth har uttrykkelig utsatt Excel-import til slutt.

Oppdatert pakkeinngang: «Grunnpakker og tilvalg» er et eget arbeidsområde øverst i prosjektet, ved siden av Hovedside og Oppsett. Ny grunnpakke/Legg til tilvalg er synlige samtidig. Rompakke-dialogen har snarvei til opprettelse/redigering med bevart utkast. Se docs/qa/BOLIG_PAKKEINNGANG_20261021.md.

Siste brukerjustering: samme kompakte varekortmønster som tilbudsbyggeren, sammenlagte varelinjer og tilvalg, direkte bildeopplasting i begge editortyper og ingen utgående produktlenker. Menyvalgene er ugjennomsiktig blå/turkis. Bytt prosjekt er fjernet fra prosjektbildet; Hovedside viser bygg/boliger og Prosjektoversikt velger/oppretter prosjekt. Ny modulåpning eller sideoppdatering starter på Prosjektoversikt, mens tilgangsoppfriskning/fanebytte i samme besøk bevarer arbeidsstedet. Privat bildebucket er kun migrert i Sandbox. Se docs/qa/BOLIG_PAKKEBILDER_20261021.md.

Miljømål BEGGE, først eksisterende foundation-Preview/Sandbox i PR #278. Scope: egne boligkomponenter/CSS, boligveiledning, fasadeillustrasjon, egne tester og én additiv lesefunksjon for status. Ingen endring i eksisterende Sales, innlogging, prosjektlagring, menyer, HR, e-post, eksisterende katalogrettigheter eller øvrige critical checks.

- «Prosjektoversikt» øverst i et åpent prosjekt går til modulens forside med prosjektvalg/nytt prosjekt. Appens globale Startside er separat. Nye fotorealistiske eksempelbilder for hus/boligfelt følger blokkens stil; egne prosjektbilder er fortsatt et senere steg. Se docs/qa/BOLIG_NAV_BILDER_20261021.md for UX-gjennomgang og prioritering.
- Kompakt prosjektvalg og prosjektets bolig-/blokk-/oppgangstall. Første åpning viser Prosjektoversikt; et arbeidssted i samme besøk kan gjenopptas uten å miste kladd. Bygg nytt prosjekt og Fortsett prosjektkladd er separate innganger. Veiledning tilgjengelig, sammenlagt som standard.
- Byggoversikt som hovedflate. Faktiske etasjer og bolig-ID-er danner klikkbare vinduer over en illustrert fasade. Boligpanelet står ved siden av på desktop. På mobil kan man gå tilbake til bygget.
- Egne arbeidsområder Hovedside, Grunnpakker og tilvalg og Oppsett. Oppsett samler struktur og arkiv. Skjulte arbeidsområder beholder monterte skjemaer og lokal kladd.
- Boligpanelet skiller Boligvalg fra Bestilling. Lagret boligvalg vises før redigering; kontakt/prosjektkobling ligger under eget valg.
- Statuslag for lagrede boligvalg, bestillingsutkast og prosjektkobling. Aldri vis «Bestilt», «Ferdig» eller fremdriftsstatus basert på et utkast. Ny lesefunksjon returnerer kun statussammendrag for godkjent firma/prosjekt. Utdatert kildevalg og endret katalog markeres.
- Katalogoppslag bruker eksisterende serverrettigheter: interne brukere med intern katalogtilgang kan søke internt; proffoppslag følger firmaets aktive leverandører og nødvendige modultilganger. Prisinnsyn gir ingen ekstra katalogtilgang. Kun varebeskrivelse, varenummer, bilde/produktlenke og eventuell salgspris kopieres. Innkjøpsnetto og rabatter følger aldri boligvalg/bestillingsgrunnlag.
- Eksisterende revisjoner, historikk, kildevalg og bestillingsutvalg beholdes. Ingen reell utsending eller kundeaksept.

## Første rometappe levert i Preview/Sandbox

«Rom og oversikt» har Alle rom, egne romnavn, standardtyper, valgfri etasje og Legg til/Rediger rom i popup. Stabile ID-er, romrevisjoner, arkiv/gjenopprett og varig versjonshistorikk er implementert. Ett ordinært prosjekt per bolig beholdes. Eksisterende boligvalg og bestillingsutkast gjelder fortsatt hele boligen og er uendret. Varefordeling er beskrevet i andre rometappe nedenfor. Egne rompakker, sjekklister, rommal og plantegninger gjenstår. Se docs/qa/BOLIG_ROOMS_20261021.md for scope, migrasjoner, QA og begrensninger. Ingen produksjonsmerge er utført.

## Andre rometappe: varer på rom og enklere pakkeeditor

«Ny grunnpakke» og «Nytt tilvalg» er synlige uten å åpne biblioteket. Redigering skjer i egne native dialoger og bevarer lokale utkast ved lukking/retur. «Legg innhold på rommet» fordeler vareantall fra lagret boligvalg til aktive rom. Antall kan deles mellom rom; rest vises som Ikke fordelt. Forhåndsvisning kreves før lagring. Egen immutable fordelingshistorikk med kildevalg og romrevisjon bevarer priser, boligvalg og ordrenes utelatte linjer. Et nytt boligvalg arver aldri gammel fordeling stille.

Dette første steget var mengdefordeling av boligvalget. Uavhengige rompakker og fellespakke er nå lagt til i tredje etappe nedenfor. Flerboligfordeling, rommaler med romstruktur og neste faktiske bestillingsprosess gjenstår. Se docs/qa/BOLIG_ROMINNHOLD_20261021.md. Preview/Sandbox, ingen produksjonsmerge.

## Tredje rometappe: egne rompakker og felles boligpakke

Kenneth valgte 21. oktober støtte for begge deler. «Alle rom» har Velg/Endre fellespakke. Hvert rom har Velg/Endre rompakke, med gjenbruk av prosjektets grunnpakker og uavhengige alternativer/tillegg. Preview viser hele boligens foreslåtte grunnlag før lagring. Hvert rom fryses separat i én samlet boligvalgsversjon. Varelinjene har stabile nøkler per rom/fellespakke; bestillingen viser rom og holder samme vare i to rom adskilt.

Eksisterende boligvalg beholdes som fellespakke ved eksplisitt første lagring. Historiske valg/ordre skrives aldri om. Manuell fordeling av uendrede fellesvarer beholdes, eller kan eksplisitt fjernes med varene beholdt. Gamle klienter kan ikke skrive over et rombasert valg med et enkelt boligvalg. Eldre manuell fordeling er bevart for eldre valg. Utelatte uendrede varer mappes til nye posisjoner; nye/endrede varer velges. Lokal usendt utelatelse følger også riktig rom ved bevisst gjennomgang. Se docs/qa/BOLIG_ROMPAKKER_20261021.md.

Flerboligfordeling med målgruppe/forhåndsvisning, struktur-/sjekkliste-/dokumentasjonsmaler per rom, egne prosjektbilder/plantegninger og faktisk ordre/aksept/fremdrift gjenstår. Ingen produksjonsmerge.

## Ønskeliste: privat kontraktsgrunnlag og analyse

Entreprisekontrakt med vedlegg kan lastes opp som PDF og brukes som salgs-/leveransegrunnlag. Dette er ikke bygget i denne etappen.

- Eget privat område per hovedprosjekt. Kun prosjektleder eller uttrykkelig utpekt person får lese kontrakten. Vanlig prosjekt-/firmatilgang og leverandørtilgang gir ikke kontraktsinnsyn.
- Samme rettighet kreves ved søk, tekstuttrekk, OCR, vektorindeks, analysesvar, eksport, vedlegg og eventuelle forhåndsvisninger. Private kontraktopplysninger skal ikke lekke i generelle statussammendrag eller leverandør-/beboerflater.
- Versjonert original og tilhørende analyse. Tekstbaserte og skannede PDF-er håndteres, med OCR-kvalitet og uleselige sider synliggjort. Tillegg/revisjoner beholdes; gjeldende dokumentrekkefølge angis av prosjektleder.
- Søk med vanlige ord og spørsmål. Svar og kravkort skal vise dokument, versjon og side, med mulighet til å åpne originalen.
- Strukturert uttrekk: leveransegrenser, unntak, særlige tekniske krav, produkter/systemer, kontroll/dokumentasjon, frister, varsling, betaling, endringer og garantier. Skill uttrykkelige krav fra forslag og usikre tolkninger.
- Forslag til røde flagg: motstrid mellom dokumenter, uklart ansvar, uavklarte leveranser, manglende vedlegg og vilkår som bør gjennomgås nærmere. Analysen skal kunne si at svaret ikke finnes eller ikke kan fastslås.
- Prosjektleder gjennomgår og godkjenner før krav blir oppgaver, sjekkpunkter eller endringsgrunnlag. Ingen automatisk kontraktsaksept, bestilling eller endring. Dokumentinnhold behandles som data, aldri som systeminstruksjoner.

## Ønskeliste: hus, boligfelt, rom og plantegninger

- Prosjekttype velges: blokk/leiligheter, enkeltbolig eller boligfelt. Byggbildet skal følge typen; et hus skal ikke fremstilles som en blokk.
- Struktur: hovedprosjekt → bygg/hus → bolig ved behov → rom. En enkeltbolig trenger ikke kunstig oppgang/leilighetsstruktur.
- Rom: Bad 1, Bad 2, vaskerom, WC 1/WC 2, teknisk rom og egendefinerte navn. Pakker, varer, valg, kontroller og dokumentasjon skal kunne knyttes til riktig rom.
- Last opp versjonerte plantegninger. Start med at prosjektleder definerer rom manuelt, med navn og område/markør på riktig side/etasje. Senere automatisk romforslag må bekreftes, særlig ved uklare tegninger.
- Rom-ID-er og tidligere valg beholdes ved omdøping eller ny tegning. Ingen automatisk skalamåling eller mengdebestilling fra en ubekreftet tegning.

## Ønskeliste: leverandørtilgang for saksbehandlere

- Prosjektleder kan invitere navngitte saksbehandlere hos leverandør til et bestemt prosjekt, eventuelt bare utvalgte boliger/rom eller leveranser.
- Lesetilgang til relevant fremdrift, eget bestillingsgrunnlag, leveringsadresser og leveringsoppfølging. Egen bekreftelse eller datoendring kan innføres som avgrenset handling med historikk; ikke generell prosjektlederrolle.
- Tilgangen skal være serverkontrollert, tilbakekallbar og kunne tidsbegrenses. Identitet, firma, faktisk innsyn og endringer logges.
- Entreprisekontrakt, kontraktsanalyse, interne marginer/priser, HR og andre leverandørers fortrolige opplysninger er utilgjengelige. Minimer beboerkontakt til det som trengs for leveransen.
- Kundens «Vårt ordrenummer» er kjøpers referanse. Expo/Ringside registrerer sitt eget leverandør-/Cordel-ordrenummer separat.

## Rekkefølge

1. Ferdigstill og brukertest byggoversikt, boligpanel og katalogoppslag.
2. Etabler hus-/romstruktur og plantegningskobling uten å miste eksisterende leiligheter.
3. Koble faktisk fremdrift og leveranser, og gi leverandører avgrenset tilgang.
4. Bygg privat dokumentområde og deretter kontraktsanalyse med kildehenvisninger.

Rekkefølgen kan justeres etter kundebehov. Ingen produksjonsmerge uten relevant QA og Kenneths uttrykkelige TEST OK. Varsle om ny chat før en stor ny etappe, med repo-basert overlevering. Den separate Sandbox-feilen `list_managed_work_profiles` fra brukeradministrasjonen er registrert for egen undersøkelse; den endres ikke som sideeffekt av boliglayouten.

## Presisering fra Kenneth: skalerbar bygning og eget prosjektbilde

- Byggets høyde skal følge etasjeantallet; bredde og vindusfordeling følger antall leiligheter i hver etasje. Ulike antall per etasje må kunne vises uten at boliger eller ID-er flyttes. Mange leiligheter skal gi horisontal panorering fremfor uleselig små klikkfelt.
- Dagens fase har dynamisk etasje-/boligrutenett og en felles dekorativ fasadeillustrasjon som skaleres. Det er ikke en full parametrisk arkitekturmodell; dekorative balkonger er ikke registrerte boliger.
- Prosjekttype velger passende standardbilde: blokk eller flott enebolig. Boligfelt skal ha oversiktsbilde og klikkbare hus, med videre valg av riktig hus og rom. Dette inngår i neste hus-/rometappe.
- Prosjektleder skal kunne laste opp prosjektets eget bilde/visualisering. Originalens sideforhold beholdes. Bildeutsnitt skal ikke endres automatisk slik at feltene forskyves.
- Enkel redigering for å flytte og skalere innholdsrammen over fasaden. Hvert felt kan ved behov finjusteres. Lagre posisjon og størrelse som prosent av selve bildet, ikke av hele nettleservinduet. Ta hensyn til tomme marger ved proporsjonal visning. Samme transformasjon brukes på bilde og felter ved zoom/panorering.
- Felt bindes til stabile bygg-/hus-/bolig-/rom-ID-er. Vinduer/rom/hus trenger ikke ligge i et perfekt rutenett; senere støtte for frie polygoner kan brukes ved skrå fotografier eller situasjonsplaner.
- Ny bildeversjon skal ha egen kontrollert tilpasning/forhåndsvisning før den erstatter gjeldende bilde. Bytt bilde uten å endre bolig-/romhistorikk. Prosjektleder bekrefter forslag til plassering.

## Kenneths prosjektveiviser: «Bygg prosjekt»

Avklart retning 21. oktober 2026: start med å bygge prosjektet gjennom korte trinn med Tilbake/Neste, en visuell forhåndsvisning og en avsluttende kontroll. Veiviseren er neste produktetappe; den nåværende popupvelgeren og designforbedringen implementerer ikke denne byggeflyten.

1. Prosjekt: navn, nummer og valgt firma. Angi boligtype med tydelige bildekort: leilighetsbygg, enebolig, tomannsbolig, flerfamiliehus og boligfelt. Tillat senere ulike typer per bygg i samme hovedprosjekt. Bildene er eksempler, ikke ferdige prosjektbilder.
2. Bygg: antall bygg. Hvert bygg har eget navn/nummer, adresse og boligtype. Vis kompakte kort «Bygg 1», «Bygg 2» med «Rediger bygg». «Kopier oppsett fra bygg 1» fyller bare struktur og skal ikke kopiere personer, boligvalg eller historikk.
3. Boliger: konfigurer hvert bygg separat. Antall oppganger ved behov, adresse per oppgang der den avviker, etasjer og antall boliger per etasje. Ulike etasjetall per bygg og oppgang støttes. Boligtotal beregnes fra etasjene; «leiligheter per oppgang» skal ikke være en separat motstridende sum. Enebolig hopper over oppgang, tomannsbolig foreslår to boenheter og flerfamiliehus et redigerbart antall. Eneboligens etasjer er romplan, ikke én ny husstand per etasje.
4. Rom: foreslå Bad 1, vaskerom, WC og teknisk rom, med avkryssing/egendefinerte rom og mulighet for en rommal per boligtype. Tegning/bilde og romdefinisjon kan komme etter første prosjektopprettelse, slik at veiviseren ikke blir for lang.
5. Kontroller: vis hvert bygg, adresse, oppganger, etasjer og boligtotal. «Opprett prosjektforside» oppretter den visuelle oversikten. Tillat endring av ett bygg fra kontrollbildet uten å begynne på nytt.

Prosjektforsiden blir arbeidsstedet etterpå, med tydelige neste handlinger: Grunnpakker → Tilvalgspakker → Fremdrift → Sjekklister per husstand/rom → Bestillinger. Innhold kan forberedes felles og tildeles utvalgte boliger. Endring av felles mal må aldri overskrive allerede lagrede individuelle valg eller utfylte sjekklister. Reelle fremdrifts-/leveringsdata skal kobles før de vises som status. «Manglende oppsett» må skilles fra faktisk byggeframdrift.

Dagens foundation gjenbrukes: flere blokker/oppganger, eget etasje-/boligoppsett per oppgang, stabile bolig-ID-er, kontakter, grunnpakker, tilvalg og bestillingsutkast. Nye boligtyper/byggadresse/rom og kobling mot fremdrift/sjekklister krever egen gjennomarbeidet modell; ingen hus skal få en kunstig blokkstruktur bare for å passe dagens skjema.

Veiviserkladd skal lagres per bruker/firma, tåle fanebytte og kunne fortsettes. Endelig opprettelse trenger en validert, idempotent serverkommando med entydig kvittering; ingen dubletter eller skjulte halvferdige prosjekter hvis forbindelsen brytes. Ved senere strukturendring beholdes ID-er, kontakter, bestillinger og historikk; reduksjon skjuler med eksplisitt kontroll. Brukeren skal alltid kunne gå tilbake og kontrollere før endelig opprettelse.

### Native dokumentasjon og FDV – 22. oktober

Oppfølgingen er bygget videre i samme feature-branch: egne kontroller og privat dokumentasjon per bolig/bygg/prosjekt, publisert firmamal eller manuell bygger, FDV-lenker og aggregert PDF-oversikt, valgfri ekstern protokoll med dokumentert retting og eksplisitt e-postreview/sending. Se `docs/qa/BOLIG_DOKUMENTASJON_20261022.md` for kontrakt og QA. Kontroller og protokoller er nå en del av serverberegnet ferdigstillingsgrunnlag. Neste utvidelse må avklare eventuell frist-/varslingsflyt, arkivert eksportpakke med faktiske dokumentfiler og kontroll av montert leveranse; ikke anta at et lagret varevalg alene er slutt-FDV.
