## Gjeldende A2-brukerprøve

Status 7. oktober: utvikleren har prøvd faktisk innlogget desktopflyt med Kenneth Demo som både melder og ansvarlig. Kapittelfilter, registrering, varsel gjennom lesing/navigasjon/ny fane, beholdt kladd og lagret lukking passerer. Etter brukerbestilt nettlesernullstilling passerer også eget testsjekkpunkt → KS/HMS-kobling → sperret direkte lukking → ansvarligs lagrede lukking tilbake til prosjektet og faktisk omlasting med bevart innlogging/status; se [testloggen](UI_TEST_20261007.md). **Gjenstående prøve gjelder to forskjellige brukere, separat HMS-/prosjektavviksrad/full legacy-lukking og mobil**, samt avviksteller for egne sjekkpunkter og reelt e-postmottak etter sikkert avsenderoppsett. Enkeltkonto-prøvene er ikke en ny A2-TEST OK. Firmaets ti eksisterende godkjenninger skal ikke gjøres om. Brukerens egen Preview-prøve erstatter ikke utviklerens skjermtest.


A2 oppdatert 6. oktober 2026: Biblioteket har 73 egne forslag med sporbar dekning av alle 121 innholdstemaer + fire metadatarader fra kvalitetshåndboken (148 sider) og personalhåndboken (127 sider). Avvikssentral gir ansvarlig/frister, åpne/lukkede saker, tiltak/egen kontroll, private vedlegg og hendelseshistorikk. Bare valgt ansvarlig får fast varsel i interne faner og lukker selv. Prosjekt-/sjekkpunktavvik som kobles inn har serverbeskyttet status; ukoblet legacy-flyt består. 73 Sandbox-kontroller PASS med rollback; ingen ekte e-post eller produksjonsendring. Enkeltkonto-prøvene er gjennomført 7. oktober, inkludert eget prosjektsjekkpunkt med lagret kobling/lukking/omlasting; to separate brukerøkter, separat prosjektavviksrad/full legacy-lukking, avviksteller, full-app-mobil og e-postmottak gjenstår. Sandbox mangler RESEND_API_KEY og CHAT_FROM_EMAIL; utsending er derfor deaktivert. Gammel TEST OK for 6dfb74d dekker håndbokversjonen, ikke A2.

Bruk samme faste adresse: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe . Oppdater siden etter at ny Preview er klar. Samme adresse/nettleser skal normalt beholde innlogging.

1. **Håndbok → Legg til flere rutiner → Alle forslag.** Biblioteket har 73 forslag. Søk «asbest», «arbeidstid» og «e-post», eller velg kapittel. **Les forslag** skal vise temaets konkrete tekst og kilder. Dagens firmatekster/godkjente utgaver beholdes. Nye valgte rutiner blir kladder først etter **Legg inn**.
2. **Trond: KS/HMS → Avvikssentral → Registrer avvik.** Skriv en tydelig testsak, velg Eli som **Ansvarlig**, sett **Frist**, og trykk **Lagre avvik**. Trond finner saken han meldte og får ikke Elis ansvarligvarsel. Eli må ha godkjent intern KS/HMS-tilgang i firmaet.
3. **Eli:** Hun ser **Du er ansvarlig for 1 åpent avvik**. Bytt mellom interne faner og åpne saken med **Åpne avvik**. Varselet skal stå også etter lesing.
4. **Eli:** Skriv **Årsak**, **Utførte tiltak / forbedring** og **Egen kontroll av resultatet**. Huk av at tiltak og kontroll er gjennomført. Trykk **Kontroller og lukk avvik** og vent på **Lukkingen er lagret**. Varselet forsvinner. **Lukkede** viser saken, Elis navn/tidspunkt og historikk. Firmaadmin kan ikke lukke Elis sak som en annen aktør.
5. **Prosjekt og feil:** Fra et lagret testsjekkpunkt-/prosjektavvik, velg **Koble til KS/HMS** i prosjektets Avvikssentral. Etter kobling brukes **Åpne i KS/HMS**; gamle prosjektknapper kan ikke lukke saken. Et annet ukoblet avvik bruker dagens flyt. Nettverks-/lagringsfeil beholder kladd/avkrysning, åpen sak og sist bekreftede varsel. Prøv igjen etter gjenopprettet forbindelse.

E-postprøven krever først sikkert avsenderoppsett (EMAIL_SETUP.md); sending er deaktivert. Begge syntetiske enkeltkonto-saker er lagret lukket; ingen e-post ble sendt. Nettlesernullstillingen gjenopprettet en innlogget appøkt, og faktisk reload etter sjekkpunktlukking passerte. En separat HMS-/prosjektavviksrad og full legacy-lukking/gjenåpning er fortsatt uverifisert fordi nettleserverktøyet sperret den native tittelprompten (`getJsDialog`, `retained_data_restricted`). Toppteller for egne sjekkpunkter skal undersøkes; se testloggen. To separate brukerøkter, visuell full-app-mobil og faktisk e-postmottak gjenstår. Tidligere testlister under gjelder håndbokhistorikken.

# Brukertest av KS/HMS-håndboken

Oppdatert 2026-10-06. Dette gjelder håndboken som er klar for testing nå. Resten av KS/HMS-modulen følger leveranseplanen.

Bruk alltid [samme Preview-adresse](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe) i samme nettleser. Nye oppdateringer kommer på denne adressen. Oppdater siden etter at en ny versjon er klar. Du skal normalt fortsatt være innlogget. En annen adresse, en annen nettleser, privat vindu eller en avsluttet økt kan kreve ny innlogging. Preview bruker Sandbox.

## Siste presisering: gjennomgang er påkrevd

TEST OK er mottatt 2026-10-06 kl. 18:56 Europe/Oslo for Preview-head `6dfb74dad244ff9bd0e416a08f0a34bc88da3c3a`. Valget gjelder bare om firmaadmin/KS-HMS-ansvarlig bekrefter egen gjennomgang ved publisering eller etterpå. Egen gjennomgang er fortsatt påkrevd før arbeid etter firmaets regel. Production-godkjenning er en egen beslutning.

Bare én tekstkontroll er relevant nå: På samme Preview, åpne **Les og bekreft** eller **Min personalhåndbok** og se at kravet før arbeid står tydelig. Når dere senere faktisk publiserer, skal godkjenningspanelet forklare «her eller etterpå» uten å kalle gjennomgangen valgfri. Ikke lag ny utgave, godkjenning eller bekreftelse bare for teksten. Den tidligere godkjente funksjonsprøven skal ikke gjentas.

## Testet endring: Min personalhåndbok og egen gjennomgang ved publisering

Oppdater samme Preview én gang. Dine ti godkjente rutiner og tidligere bekreftelser beholdes. De gamle godkjenningene er ikke gjort om til egne lesebekreftelser.

1. **Finn din rutine:** Åpne **Min personalhåndbok**, også som firmaadmin. Søk for eksempel etter «ferie», åpne rutinen og se **Godkjent for firmaet av** og **Din egen gjennomgang**. Riktig rutineutgave, person og tidspunkt skal vises. Mangler registrert navn på brukerkontoen, vises e-post. Du skal bare finne utgaver som er tildelt deg. **Tøm søk** viser alle dine rutiner igjen.
2. **Slå opp etter bekreftelse:** Har du en rutine du faktisk har lest og skal bekrefte, bruk **Les og bekreft denne utgaven**. Bekreft egen gjennomgang. Neste gjenstående utgave skal åpnes med avslått avkrysning. Gå tilbake til **Min personalhåndbok**: rutinen skal fortsatt finnes med **Bekreftet**, ditt navn og tidspunktet. Har du allerede bekreftet, kontroller bare oppslaget og historikken.
3. **Unngå dobbel gjennomgang ved neste ekte godkjenning:** Når du senere har en testklar ny rutine eller endring, kan du selv velge **Jeg bekrefter også egen gjennomgang av denne utgaven.** før **Godkjenn og publiser**. Etter lagring skal akkurat denne nye utgaven være både godkjent for firmaet og bekreftet av deg. Du skal slippe ny egen bekreftelse av samme utgave. Andre ansatte skal fortsatt bekrefte selv. Neste godkjenning skal starte med dette valget avslått. Ikke endre eller godkjenn de ti rutinene på nytt bare for testen; utvikleren har kontrollert dette med syntetiske data og en databaseprøve som rulles tilbake.

Permanent kontroll, databasekontroll og syntetisk visning på stor skjerm/mobil passerer. Brukeren har meldt TEST OK for Preview-head 6dfb74dad244ff9bd0e416a08f0a34bc88da3c3a den 2026-10-06 kl. 18:56 Europe/Oslo. Medarbeidersamtaler og private kompetansedokumenter er ikke levert i denne endringen; de følger senere med egen personaltilgang.

## Tidligere endring: kort oversikt over medarbeiderne

Oppdater samme Preview én gang. De ti godkjente rutinene beholdes; du trenger ikke godkjenne dem på nytt.

1. **Kort oversikt:** Åpne **Oppfølging og revisjon**. Fire brukere med ti ubekreftede rutiner hver skal gi fire lukkede medarbeiderrader og **40 bekreftelser gjenstår**. Har noen allerede bekreftet, skal antallet være lavere. Åpne din rad: alle aktuelle utgaver skal vises med status og eventuelt tidspunkt. Prøv **Søk etter medarbeider** og **Tøm søk**.
2. **Egen fremdrift:** Åpne **Les og bekreft**. Les én rutine du faktisk har igjen, huk av egen gjennomgang og trykk **Bekreft versjon N**. Neste utgave skal åpnes med avslått avkrysning. Tilbake i oppfølgingen skal bare din rad ha én ekstra bekreftelse, og totalsummen skal ha gått ned med én. Hvis du er ferdig, kontroller tidspunktet i raden uten å lage ny bekreftelse.
3. **Tildeling og revisjon ved behov:** Begge områdene skal være lukket til du åpner dem. Under **Gi godkjente rutiner til nye medarbeidere** skal det ikke ligge tomme rutinebokser når alle allerede har fått utgavene. Neste revisjonsdato skal fortsatt være synlig. **Gjennomfør revisjon** åpner feltene; lukking og ny åpning skal beholde skrevet tekst. Du trenger ikke fylle ut eller signere en revisjon nå bare for å gå videre. Neste steg er at hver ansatt leser og bekrefter i sin egen app.

Permanent kontroll og syntetisk komponentkontroll på stor skjerm og i mobilbredde passerer. Ingen av dine tildelinger, godkjenninger eller bekreftelser er endret av utviklerens tester. Din innloggede full-app-prøve gjenstår; påminnelser på e-post og i app er fortsatt et senere leveransetrinn.

## Tidligere endring: automatisk neste rutine og fullføring nederst

Du har allerede godkjent alle ti rutinene. Du trenger ikke godkjenne dem på nytt. Oppdater samme Preview én gang når oppdateringen er klar.

1. **Gå videre fra ferdig håndbok:** Åpne **Håndbok** og gå nederst. **Håndboken er klar**, **10 av 10** og **Neste: Ansattes gjennomgang** skal vises også der. Godkjenningsboksen med «Denne rutinen venter på godkjenning» skal være borte. Trykk Neste-knappen nederst: **Oppfølging og revisjon** åpnes og viser hvem som mangler bekreftelse.
2. **Les og bekreft selv:** Åpne **Les og bekreft** med din egen bruker eller en ansatt som har fått rutiner. Åpne en rutine, les den, huk av **Jeg bekrefter egen gjennomgang og teksten over.** og trykk **Bekreft versjon N**. Etter lagring skal neste rutine som trenger din bekreftelse, åpnes automatisk. Avkrysningen skal være avslått igjen. Les og bekreft hver utgave separat. Etter den siste skal **Du er ferdig med gjennomgangen** vises nederst. Hver tidligere utgave skal beholde sitt registrerte tidspunkt.
3. **Neste godkjenning, når dere har nye utkast:** Når minst to rutiner faktisk venter på godkjenning, skal **Godkjenn og publiser** åpne neste automatisk med tomt vurderingsfelt. Etter den siste skal fullføringskortet nederst fokuseres. Ikke lag nye utgaver bare for denne kontrollen; utvikleren har testet den med syntetiske data. Hvis lagring feiler, skal samme tekst og vurdering eller avkrysning bli stående, uten å gå videre.

Permanent runtime-kontroll og visuell komponentkontroll på stor skjerm og i mobilbredde passerer. Mobilkontrollen publiserte og bekreftet ti syntetiske rutiner, én om gangen. Den endret ingen av dine ti godkjenninger. Din innloggede full-app-økt må fortsatt prøves. Ingen automatisk e-post sendes.

## Tidligere endring: tilgangsvalg, tekstforslag og søk

Bruk samme Preview-adresse over og oppdater siden én gang når den nye versjonen er klar. De følgende fire kontrollene er den avgrensede testen for denne endringen; den eldre listen under dokumenterer hele håndbokflyten.

1. **Teksttap ved ansattvalg:** I **Oppstart og tilgang**, skriv en egen setning i **Aktiviteter – hva gjør dere?**. Endre tilgang for to av de syntetiske medarbeiderne etter hverandre. Samme fane og den egne setningen skal bli stående. Gjenta gjerne med et åpent, endret rutineutkast: gå til tilgangsfanen, endre en annen ansatt og gå tilbake til **Håndbok**. Editor og teksten skal være beholdt. Lagre til slutt hvis teksten skal beholdes på server. Rettelsen gjenoppretter ikke tekst som allerede er tapt.
2. **Tekstforslag:** Tomme oppstartsfelt skal ha redigerbar standardtekst. Velg flere fag: urørte forslag kan endre seg, mens lagret/egen tekst beholdes. **Fyll tomme felt med tekstforslag** fyller bare tomme bokser når du selv trykker. I **Håndbok**, prøv **Ny rutine med tekstforslag**: feltene har en generell start, mens du må skrive tittel og tilpasse oppgaven. **Ny rutine fra blank mal** er fortsatt helt blank. Vurdering ved godkjenning og revisjonsfunn fylles aldri automatisk.
3. **Søk:** I **Håndbok**, skriv for eksempel «førstehjelp» i **Søk i firmaets rutiner**. Bare passende rutiner skal stå i listen. **Tøm søk** viser alle igjen. Under **Legg til flere rutiner** kan du søke i forslag. Huk av en rutine som ikke er lagt til, søk etter en annen og huk av den også. Begge skal fortsatt stå under **Disse rutinene legges inn**. Har dere lagt til alle forslag, test søket uten ny innlegging.
4. **Ansattens rutine:** Etter at du selv har tilpasset og godkjent en testklar rutine, åpne den i **Les og bekreft**. Fremgangsmåten skal vises under **I vår bedrift har vi følgende rutine**. Skrivehjelp og tips fra editoren skal være borte. Søket her skal bare finne utgaver tildelt den innloggede brukeren. Som firmaadmin: eldre egen tekst skal være beholdt; **Rediger her → Vurder ProffDoks tekstforslag** lar deg velge eventuelle oppdaterte felter før ny lagring/godkjenning.

Utviklerens permanente runtime-kontroll og isolerte desktop-/mobilkomponentprøve dekker de nye scenarioene. Den faktiske innloggede full-app-økten, ansattes egne ekte kontoer og TEST OK må fortsatt prøves av bruker. Se [QA](QA.md). Ingen automatisk e-post eller tilsynsrapport finnes i dette trinnet.

## Tidligere testliste for hele håndbokflyten

| Steg | Dette gjør du | Dette skal skje |
|---|---|---|
| 1. Fast adresse og forklaringer | Oppdater siden på den faste adressen. Åpne KS/HMS og se gjennom de fire fanene. | Du er fortsatt innlogget hvis økten er aktiv. Hver fane forklarer hva du gjør der og hva du skal gjøre videre. Si fra hvis en tekst eller et ord er uklart. |
| 2. Oppstart og tilgang | Velg først ansvarlig blant firmaets aktive brukere, eller velg deg selv. Velg minst ett fag og trykk **Lagre og gå videre**. De tre tekstfeltene har redigerbare forslag og er fortsatt valgfrie. | Egen firmaadmin vises som «deg». Firmaadmin kan velge en intern medarbeider selv uten tidligere KS/HMS-grant; ved lagring gis responsible-tilgang. Håndboken åpnes med faktisk fremdrift og neste knapp. |
| 3. Velg flere rutiner | I **Håndbok**, åpne forslagene eller **Legg til flere rutiner**. Huk av to eller tre rutiner som ikke allerede er lagt til. Bytt mellom **Anbefalte** og **Alle forslag**. Trykk **Legg inn**. | Kortene viser **Valgt**, og alle valgene står under **Disse rutinene legges inn**. Valgene beholdes ved filterskifte. Etter innlegging viser hver rutine **Utkast – må godkjennes** og **Rediger her**. Ingen rutine publiseres ennå. Har du allerede lagt inn alle forslagene, bruker du en eksisterende rutine i neste steg. |
| 4. Endre og bytt fane | Trykk **Rediger her**. Endre litt tekst. Bytt nettleserfane og gå tilbake. Bytt også til en annen appfane og tilbake. Trykk deretter **Lagre utkast**. | Den samme rutinen og teksten står fortsatt åpen. Etter lagring åpnes godkjenningen av den lagrede teksten. En endret godkjent rutine viser **Endringer må godkjennes · vN gjelder fortsatt**. Ansatte beholder den gamle godkjente utgaven. |
| 5. Godkjenn og åpne neste | Som firmaadmin eller KS/HMS-ansvarlig: trykk **Åpne godkjenning** på en testklar rutine. Les teksten og skriv i **Hva er vurdert eller endret?**. Trykk **Godkjenn og publiser**. | Siden flytter deg til riktig rutine. Tomt felt gir en tydelig beskjed og grå publiseringsknapp. Når vurderingen er skrevet, blir knappen aktiv. Etter lagring ser du riktig navn/versjon og oppdatert godkjent-antall. Neste gjenstående rutine åpnes automatisk med tomt vurderingsfelt; forrige vurdering kopieres ikke. Etter den siste forsvinner godkjenningspanelet og Neste-knappen vises også nederst. Ansatte får publiserte rutiner i **Les og bekreft**. Dette er Sandbox. |
| 6. Les, bekreft og følg opp | Med en bruker som har fått rutinen: åpne KS/HMS. **Les og bekreft** skal åpnes direkte, med antall rutiner som gjenstår. Les og bekreft denne utgaven. Ansatt skal ikke få redigerings-, godkjennings- eller tilgangsverktøy. Se deretter **Oppfølging og revisjon** som firmaadmin/ansvarlig. | Bekreftelsen viser tidspunkt og riktig utgave og forsvinner fra manglende-listen. Neste egen påkrevde utgave åpnes automatisk med avslått avkrysning; etter siste vises fullføringskortet. Veiledningen forklarer hvordan håndboken skal kontrolleres. En faktisk revisjon signeres bare når kontrollen er gjort. |

På mobil: Se at tekst og knapper er leselige uten å dra siden sidelengs. Gjenta steg 4 dersom du bruker mobilen til rutinearbeid.

Du trenger ikke teste alt på nytt ved hver tekstendring. Hver leveranse skal få en avgrenset liste for det som er nytt og de eksisterende flytene som kan påvirkes. Denne listen dekker de aktuelle UX-rettelsene og den første innloggede håndbokflyten.

## Kort kontroll av godkjenningspanelet

1. Trykk **Åpne godkjenning**. Siden skal vise riktig rutine automatisk; rutinen publiseres ikke ved dette klikket.
2. La vurderingsfeltet stå tomt. **Godkjenn og publiser** skal være grå, og teksten skal forklare hva som mangler. Skriv hva du faktisk har kontrollert; knappen skal bli aktiv.
3. Godkjenn én testklar rutine. Neste gjenstående rutine skal åpnes automatisk med riktig tittel og tomt vurderingsfelt. Navn/versjon fra forrige godkjenning og nytt antall skal vises. Etter siste godkjenning forsvinner panelet, og **Neste: Ansattes gjennomgang** vises også nederst.
4. Skriv litt vurderingstekst, gå til rutinekortet og åpne godkjenning på samme rutine igjen. Siden skal vise godkjenningen og beholde teksten. Bytt også nettleserfane og tilbake; teksten skal være bevart.

Som KS/HMS-ansvarlig: prøv også godkjenning av en testklar rutine. Du skal kunne godkjenne, men ikke få listen for å endre ansattes tilgang, velge ny revisjonsansvarlig eller arkivere rutiner.

## Ved en feil

Oppgi fane, knapp, hva du gjorde og hva som skjedde. For ny innlogging: si om du brukte den samme adressen i samme nettleser. En fungerende syntetisk komponenttest er ikke bevis på din faktiske innloggede økt. `TEST OK` gjelder først når den avtalte brukerprøven er gjort; Production-godkjenning er en egen beslutning.

## Siste rettelse: ansvarlig, status og neste steg

1. I **Oppstart og tilgang**: Velg deg selv eller `demo.ks@expo-proffdok.invalid` som ansvarlig i Expo Proffsenter Sandbox. Velg minst ett fag. **Lagre og gå videre** skal åpne håndboken. Demomedarbeiderne er syntetiske oppstarts-/tilgangsfixtures, uten utdelte innloggingsopplysninger eller ekte e-post. De er ikke separate medarbeiderøkter for full innlogget brukerprøve.
2. I **Håndbok**: Se antallet faktisk godkjente rutiner. Bruk **Neste: Godkjenn rutinene**. Den grå **Godkjenn og publiser** skal forklares av tom vurdering. Skriv hva du faktisk har kontrollert og godkjenn bare testklar tekst. Antallet skal oppdateres.
3. Når alle valgte rutiner er godkjent: **Håndboken er klar** og **Neste: Ansattes gjennomgang** skal vises. Neste-knappen skal åpne manglende bekreftelser og forklaringen om ansattes egen lesing. Den skal ikke sende en e-post.
4. Rediger en godkjent rutine: Ulagret tekst skal stoppe neste/publisering. **Lagre utkast** skal åpne ny vurdering og vise **Endringer må godkjennes**. Ny godkjenning skal opprette v2, mens v1 og gamle bekreftelser beholdes. Bytt fane mens du redigerer for å kontrollere den eksisterende bevaringen.

Det er fortsatt bare de valgte rutinene i håndboken som er klare når neste-knappen vises. Sjekklister/SJA/risiko, samlet avvik, varsler/PDF og valgfri personal/stoffkartotek følger de neste leveransene i [planen](PLAN.md).
