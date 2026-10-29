# Expo ProffDok – kontrollmatrise 29.10.2026

## Gjeldende vurdering: totalgjennomgangen er ikke fullført

Denne statusen presiserer eldre inventar og testoppsummeringer nedenfor. De 36 modulene og 605 kildefilene er et kildeinventar, ikke 605 gjennomførte brukerprøver eller visuell godkjenning. Grønn CI er et separat funksjons-/regresjonsbevis. Ingen samlet designgodkjenning eller redesign-TEST OK er gitt.

### Fast referanse og godkjente tilpasninger

- Originalskisse 03.6 er uendret kilde `f67f236784b4de9a92f52c5b74b67335ec94606a`, Sites-prosjekt `appgprj_6ae13253b87c8191ba560175fcd6c3d9`. Skissen skal ikke endres for å få appen til å se riktig ut i en sammenligning.
- Senere uttrykkelige brukeravklaringer skal følge referansen. Kenneth prioriterte seks arbeidsområder og svarte 29.10 «Mye bedre, bortsett fra nederste delen. Kjør videre» etter bildet av den nye Startsiden. **Seksområdestrukturen beholdes.** Den skal ikke rulles tilbake til conceptHome bare fordi denne delen av skissen har en annen oppbygning. Nederste oppfølgingsdel er et eget avvik.
- Behold innloggingsbildet, firmaenes logoer, større/tydelig tekst, god breddeutnyttelse og alle eksisterende autoriserte funksjoner. Firmaadminstyrt timeføring finnes allerede i Timeoppsett og er avslått som standard. Det åpne kravet er faktisk off→on→off-verifikasjon og samsvar mellom lagret aktivering og synlige personlige innganger; styling lukker ikke dette.

### Hva nattkjøringen faktisk gjorde

Oppgaven «Gjennomgå hele ProffDok», ID `6ae2954cd7b8819189ee7818e6ab5a54`, krevde alle funksjoner, inkludert adminområder og portaler, og trygge syntetiske transportprøver. Registrert kjøring `396d7276-5a5c-8331-a4ee-fc88e8a971fc` startet 29.10 kl.02:44 og sluttet kl.03:08 Europe/Oslo. Den tekniske kjøringen står som completed. Resultatet beskrev boligrettelse, inventar og regresjonstester, og sa uttrykkelig at alle underdialoger og rollevarianter ikke var manuelt kontrollert. **Teknisk fullført kjøring er ikke fullført totaloppdrag.** Oppgaven har ingen neste kjøring registrert; denne statusoppdateringen oppretter eller starter ingen ny nattjobb.

### Åpne designområder etter brukerens fem bilder

Bildene fra 29.10 dokumenterer avvik, ikke bestått designkontroll. Nyere kode må sammenlignes og testes før et punkt kan lukkes; en påfølgende CSS-endring lukker ikke punktet i seg selv.

| Område | Fast utgangspunkt | Hva som fortsatt må dokumenteres |
|---|---|---|
| Startside | Brukergodkjente seks arbeidsområder beholdes. | Kompakt nederste oppfølging med faktiske varsler og eksisterende handlinger; ingen tilbakeføring av godkjent struktur. |
| Min side | Skissens prioriterte arbeidsdag, planer og oppfølging, med brukerens godkjente funksjoner. | Sammenhengende oversikt og alle tilgjengelige underfaner; støtte, planer, håndbok, oppfølging og profil må fortsatt kunne nås. |
| Prosjektliste | Kompakt prosjektoverblikk og samlet søk/filter. | Faktisk radstruktur, tilgjengelig informasjon, åpne/arkiv/detaljer, varsler, responsivitet og retur med bevart filter. |
| HR | Medarbeidere, samtaler og tiltak foran sjeldnere oppsett. | Register og hele medarbeider-/samtale-/tiltaksflyten mot skissen; prøvefunksjon og verktøy skal være tilgjengelige uten å dominere arbeidsstarten. |
| KS/HMS | Daglig arbeid og aktuelle kontroller/oppfølging, med rutiner og forvaltning tilgjengelig. | Sammenhengende arbeidsflate, underfunksjoner og høyrepaneler; rolleavgrensning og alle native handlinger beholdes. |

### Krav til bevis og gjenopptakelse

Dette konkretiserer den eksisterende UX/UI-listen; det er ingen ny produktdesign eller endring i CI-regler.

1. Del modulene i navngitte brukerreiser, underdialoger og relevante tilstander/roller. Fil- eller testantall alene kan ikke lukke en funksjon. Utestede kombinasjoner står åpne.
2. Før **designstatus og funksjonsstatus hver for seg**. Visuell kontroll krever faktisk sammenligning med fast referanse og godkjente tilpasninger ved samme skjermstørrelse, med skjermbevis og eksakt kodekandidat. Oppgi om bildet er fra innlogget Preview eller syntetisk komponentprøve.
3. Funksjonskontroll skal navngi handling og forventet resultat, inkludert lagring/gjenåpning, tilbakevei, kladd, dvale/fanebytte og fersk tilgang der dette er relevant. Sending/bestilling/signering prøves med isolert transport; ingen ekte utsendinger eller tilgangsendringer innføres som test.
4. Delarbeid kan fordeles parallelt på avgrensede filer, men én hovedkjøring samler og publiserer kandidaten. Kontroller fersk branch-head før skriving; ikke konkurrer med en annen aktiv publiseringsflyt eller overskriv nyere arbeid. En separat kontroll skal forsøke å finne avvik i det sammensatte resultatet.
5. Etter hver ferdig avgrensede pakke lagres faktisk kode og tilhørende resultat i GitHub: kandidat, berørte funksjoner, design-/funksjonsbevis, åpne feil, konkrete blokkeringer og neste navngitte oppgave. Uferdig arbeid må være synlig før en kjøring avsluttes.
6. Ved chatbrudd leses CURRENT_RELEASE_STATUS, denne matrisen og fersk PR/branch før videre arbeid. Start ved første åpne brukerreise; ikke lag ny designretning eller gjenta uendret grønn QA. En innloggingsblokk skal stå som blokkering, ikke omskrives til bestått innlogget prøve.

Appgrunnlag ved denne statuskontrollen: designbranch `5680c9bf4f5cff9cdb001374683cb044b07a9873`, med tidligere fullgrønn kandidat `dfb7656c` / CI771. Nyere HR/KS/HMS-kode har eget testgrunnlag; denne dokumentasjonskontrollen attesterer ikke dens visuelle samsvar med hele skissen. Gjeldende kandidat og CI føres i PR295. Neste implementasjonspakke må avgrenses mot åpne brukerreiser ovenfor før nye appendringer.

### Ny strukturell pakke etter statuspresiseringen

Startoppfølging, Min side, prosjektliste, HR og KS/HMS har nå reelle strukturelle endringer og permanente komponentprøver. Dette erstatter den tidligere rene flatejusteringen for disse inngangene. Brukerens seksområdestruktur og originalskissen beholdes. [Handoff med konkret bevis og neste arbeid](DESIGN_036_HANDOFF_20261029.md) og [145 navngitte kontrollreiser](proffdok-journey-review-20261029.md) skiller faktisk test fra manglende dekning. **Pakken lukker ikke totalgjennomgangen.** Eksakt kandidat, CI og deploy finnes i PR295.

## Historisk inventar og tidligere bevis

Miljømål BEGGE, kun Preview. Produksjon/main/demo er urørt. Denne matrisen skiller kildeinventar fra faktisk testbevis. Ingen påstand om 100 % manuell funksjonskontroll.

Felles visuelle og praktiske kriterier er samlet i [UX/UI-kontrollisten](UX_UI_REVIEW_CHECKLIST.md). Dialogpakken 29.10 utvider faktiske komponentprøver med knappegeometri, korte skjermer og høyrepanelets lukkekontroller; eksakt kandidat, CI og publisering logges i PR295. Dette utvider ikke automatisk den manuelle dekningen i tabellen.

| Område | Brukerreiser som må bevares | Kilde / relaterte tester | Faktisk status |
|---|---|---|---|
| access · Innlogging/økt/flerfirma/roller | Innlogging; serverprofil; firmabytte; tilgang tilbakekalt; fanebytte/dvale; recovery; utlogging | 21 filer / 20 relaterte kontroller i JSON | Not manually exercised in this run |
| app · Systemadmin og app-ramme | Oversikt; support; firmaer/prosjekter; brukere/roller; produktmaster; internt vareregister; nyheter; e-post; dokumentsynk; fullskjerm; høyrepanel; fokus/Escape | 25 filer / 10 relaterte kontroller i JSON | Not manually exercised in this run |
| auth · Innlogging/økt/flerfirma/roller | Innlogging; serverprofil; firmabytte; tilgang tilbakekalt; fanebytte/dvale; recovery; utlogging | 22 filer / 20 relaterte kontroller i JSON | Not manually exercised in this run |
| bolig · Boligprosjekter og portaler | Prosjektoppretting/kladd; bygg/oppgang/etasje/bolig; rom; fasade/egne bilder; grunnpakker; tilvalg; unntak; beboerkontakt; avtale/endringsaksept; UE/LEV; varegrunnlag; bestilling/ASCII/Excel; levering; fremdrift/Gantt; stammegrupper; bemanning/inn-ut/tilsyn; sjekklister; avvik; overtakelse/restpunkter; FDV/PDF/ZIP; kontrakt/OCR; indeks; akonto; portalvarsler/meldinger | 125 filer / 54 relaterte kontroller i JSON | Pilot 12 units loaded on PR295 baseline; structure/status/address controls visible; no mutations |
| chat · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 1 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| checklist · Sjekklister | Maler; redigering; publisering; utfylling; felter; vedlegg; avvik; lokal sikring; rapport; låsing/garanti | 11 filer / 14 relaterte kontroller i JSON | Not manually exercised in this run |
| company · Firmaadmin/Firmaprofil | Firma/profil/logo; brukere; invitasjoner; modultilganger; boligtilgang; organisasjon; firmaidentitet | 9 filer / 18 relaterte kontroller i JSON | Not manually exercised in this run |
| config · Innlogging/økt/flerfirma/roller | Innlogging; serverprofil; firmabytte; tilgang tilbakekalt; fanebytte/dvale; recovery; utlogging | 3 filer / 20 relaterte kontroller i JSON | Not manually exercised in this run |
| contract · Forespørsel/befaring og begge tilbudstyper | Ny forespørsel; befaring/tekst/bilder; våtrom; generelt tilbud; varelinjer; opsjoner/antall; maler; aksept; revisjon; avvisning; kontrakt; mva; kladd/hydration; dvale | 4 filer / 38 relaterte kontroller i JSON | Not manually exercised in this run |
| controller · Eksterne portaler | Beboer; kunde; UE/LEV; kontrollør; lenkeutløp; innsyn; syntetisk aksept; ingen reell signering | 4 filer / 14 relaterte kontroller i JSON | Not manually exercised in this run |
| cordel · Varesøk/pris/plukk/bestilling | Prisinnsyn; søk/skanning; antall; plukkliste; leveringsdato; mottaker; ASCII; Excel; mock e-post | 9 filer / 13 relaterte kontroller i JSON | Not manually exercised in this run |
| customers · Forespørsel/befaring og begge tilbudstyper | Ny forespørsel; befaring/tekst/bilder; våtrom; generelt tilbud; varelinjer; opsjoner/antall; maler; aksept; revisjon; avvisning; kontrakt; mva; kladd/hydration; dvale | 2 filer / 38 relaterte kontroller i JSON | Not manually exercised in this run |
| deviations · HMS/KS | Rutiner/håndbok; maler; sjekklister; publisering; lesebekreftelse; oppgaver; revisjon; kilder; SJA/RUH; tiltak; frister; rapport/PDF; vedleggsarkiv | 7 filer / 55 relaterte kontroller i JSON | Not manually exercised in this run |
| documents · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 2 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| help · Hjelp | Modulstyrt hjelp; A–Å; sjekklistemaler/tilbudsmaler; konkrete neste handlinger | 12 filer / 2 relaterte kontroller i JSON | Not manually exercised in this run |
| home · Startside | Seks arbeidsområder; varsler; prosjektoppfølging; riktige callback-ID-er | 4 filer / 3 relaterte kontroller i JSON | Startside loaded; compact follow-up visible; no mutations |
| hr · HR | Ansatte/register; tilgang; maler; samtaler; sykefravær; oppfølging; kontaktvarsler; praksis; dokumentasjon; personvern | 39 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| images · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 3 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| installations · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 1 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| kshms · HMS/KS | Rutiner/håndbok; maler; sjekklister; publisering; lesebekreftelse; oppgaver; revisjon; kilder; SJA/RUH; tiltak; frister; rapport/PDF; vedleggsarkiv | 77 filer / 55 relaterte kontroller i JSON | Not manually exercised in this run |
| organization · Firmaadmin/Firmaprofil | Firma/profil/logo; brukere; invitasjoner; modultilganger; boligtilgang; organisasjon; firmaidentitet | 5 filer / 18 relaterte kontroller i JSON | Not manually exercised in this run |
| overtagelse · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 1 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| personal · Min side | Egen profil; aktive planer; oppgaver; fravær; inn/ut; valgfri timeføring er separat krav | 4 filer / 6 relaterte kontroller i JSON | Not manually exercised in this run |
| portal · Eksterne portaler | Beboer; kunde; UE/LEV; kontrollør; lenkeutløp; innsyn; syntetisk aksept; ingen reell signering | 4 filer / 14 relaterte kontroller i JSON | Not manually exercised in this run |
| product · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 2 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| progress · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 17 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| project · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 20 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| report · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 16 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| sales · Forespørsel/befaring og begge tilbudstyper | Ny forespørsel; befaring/tekst/bilder; våtrom; generelt tilbud; varelinjer; opsjoner/antall; maler; aksept; revisjon; avvisning; kontrakt; mva; kladd/hydration; dvale | 97 filer / 38 relaterte kontroller i JSON | Not manually exercised in this run |
| stocktake · Varesøk/pris/plukk/bestilling | Prisinnsyn; søk/skanning; antall; plukkliste; leveringsdato; mottaker; ASCII; Excel; mock e-post | 6 filer / 13 relaterte kontroller i JSON | Not manually exercised in this run |
| storeCatalog · Forespørsel/befaring og begge tilbudstyper | Ny forespørsel; befaring/tekst/bilder; våtrom; generelt tilbud; varelinjer; opsjoner/antall; maler; aksept; revisjon; avvisning; kontrakt; mva; kladd/hydration; dvale | 26 filer / 38 relaterte kontroller i JSON | Not manually exercised in this run |
| support · Support | Saksoversikt; samtale; vedlegg; mock transport; lukking/oppfølging; tilgang | 5 filer / 5 relaterte kontroller i JSON | Not manually exercised in this run |
| surfaces · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 1 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| time · HR | Ansatte/register; tilgang; maler; samtaler; sykefravær; oppfølging; kontaktvarsler; praksis; dokumentasjon; personvern | 9 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |
| ui · Systemadmin og app-ramme | Oversikt; support; firmaer/prosjekter; brukere/roller; produktmaster; internt vareregister; nyheter; e-post; dokumentsynk; fullskjerm; høyrepanel; fokus/Escape | 9 filer / 10 relaterte kontroller i JSON | Not manually exercised in this run |
| warranty · Ordinært prosjekt | Prosjektoversikt; beskrivelse; tilbud/kontrakt; prosjektering; fremdrift; produkter; overflater; bilder; tilgang; fag/utstyr; sjekklister; avvik/SJA/RUH; chat; interne notater; overtagelse; garanti; rapport; hjelp; support | 2 filer / 33 relaterte kontroller i JSON | Not manually exercised in this run |

## Bevis og avgrensning

Fullt filinventar, navngitte kontroller og CI-kommandoer finnes i JSON-filen ved siden av. Relaterte tester er koblet etter faktisk modul-/testnavn; dette er ikke bevis på at alle delfunksjoner har direkte assertion. Tidligere grønn CI gjenbrukes bare som baseline. Ny boligkandidat krever egen full grønn CI og faktisk Preview-kontroll.

Bolig: en ny fixture med 16 flerfamiliehus og seks boliger per bygg kontrollerer adressefokus etter byggvalg, synlighet og høyde ved 1366/768/390/320. Eksisterende fem boligtypeprøver beholdes. Lokal build av PR295 er grønn; lokal Bolig-grensekontroll gir 55 assertions. Chromium-nedlasting lokalt ga ugyldig arkiv; ingen lokal nettlesertest er ført som bestått.

Åpne begrensninger: fysisk mobil/Safari, alle rollevarianter manuelt, reell transport/mottak, full visuell detaljgjennomgang av alle underdialoger og nye PDF/ZIP fra alle portaler. Rutineutsending forblir deaktivert. Timeoppsett har eksisterende valgfri aktivering; personlig inngangsvisning og av/på-reisen er fortsatt en egen åpen kontroll.

Fast ramme-Preview: https://expo-proffdok-git-design01-app-ramme-20261028-ringside.vercel.app/

Isolert bolig-Preview: https://expo-proffdok-git-fase45b-bolig-portal-polish-20261025-ringside.vercel.app/

## Sluttbevis

Ramme 7875524e: full PR Core Safety #754 / 40803212792 SUCCESS. Bolig 435510c6: full #756 / 40803430458 SUCCESS, inkludert den nye 16-hus-prøven ved fire bredder. Begge faste Preview-er er READY på eksakt kandidat og faktiske main-bundler inneholder bare Sandbox-binding.

Faktisk siste boligprøve: innlogging beholdt etter deploy; bygg A/B velger riktig adresse og fokuserer den 12 px under faktisk sticky header (169 → 181 px). Fasade 328 px, seks boligknapper beholdt. Skjermbevis: proffdok-bolig-adresse-20261029.jpg. Firmaadmin og Systemadmin lastet i eksisterende autorisert konto; ingen rolle-/bruker-/invitasjonsendringer. Prosjektets 12 navigasjonsknapper er prøvd lesende, med konkrete bekreftelser/begrensninger i JSON.

Disse bevisene erstatter foreløpig CI-status ovenfor. Nye dokumentasjonscommits endrer ikke de verifiserte appfilene; gjeldende full CI følges i PR295. Portaler, konsekvensfulle handlinger og rollevarianter er testet syntetisk i CI, ikke manuelt attestert som alle reelle roller/enheter. Full visuell detaljgjennomgang av alle underdialoger gjenstår.
