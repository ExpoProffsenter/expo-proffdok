# Samlet design- og videokontroll – hele appen

145 registrerte brukerreiser i18 områder er grunnlaget, med tre kjente nye sjekklistefunksjoner i tillegg. Det er ikke et bevis på at alle konkrete knapper/underfunksjoner er uttømmende funnet eller sluttkontrollert. Behold tidligere faktiske delbevis; gamle radstatuser skal ikke brukes som en nullstilling av gjennomført arbeid.

Brukeren31.10: «Vi har hengt oss litt opp i boligprosjekt og må ikke glemme både design og videoer av appen alle andre funksjoner og undermapper. KJØR». Fortsett i samlepakker på tvers, med samme PR295/Preview. «Virker ok» på boligpakken er ikke en uttrykkelig global redesign-TEST OK. Solgløtt forblir utsatt til design+QA, TEST OK, Production og kontrollert main→demo er fullført.

## Felles kontrollgrunnlag

- [Reiseregister med konkrete innganger, roller, steg og QA-kilder](proffdok-journey-review-20261029.json).
- [Videoregister for alle kjente områder og funksjonspunkter](proffdok-video-coverage-20261031.json). Bevarer godkjent mal1.0 og pilot; funksjon, design og videostatus skilles.
- Fersk kandidat, fullCI, deploy og levende etterkontroll vedlikeholdes i PR295. Ingen helreise lukkes automatisk på grunn av en felleskomponent eller et testantall.

## Alle områder står i samme kø

| Område | Registrerte reiser | Neste kontroll før området lukkes |
| --- | ---: | --- |
| Innlogging og tilgang | 6 | Firma-/brukerbytte, tilbakekalling, innlogging og recovery; produksjonsinnloggingens utseende beholdes. |
| Startside | 3 | Alle seks arbeidsområder og dynamiske varsler følger faktiske rettigheter. |
| Min side | 7 | Alle faner og faktiske plan-/HR-/håndbok-/time-/profilbarn, tomme og fylte tilstander. |
| Forespørsel, befaring og begge tilbudstyper | 16 | Lagret sak, kalender, begge tilbud, logo/maler, kundepreview, aksept/avvisning og kontrakt; transport isolert. |
| Prissøk og varebestilling | 6 | Søk/plukkliste, leverandørskjema/preview/retry, varebestilling/mottaker og ASCII/Excel. |
| Varetelling | 3 | Åpen/lukket telling, null/desimaler, skann/manuell vare, konflikt og alle sider i eksport. |
| Prosjektets faser og underfunksjoner | 16 | Hver fase med faktiske redigerere, underdialoger, historikk, roller og rapport/PDF. |
| Sjekklister og firmamaler | 4 | Egne punkter, kladder, betingede felt, firmamalforslag/godkjenning, signert historikk/PDF. |
| Boligprosjekter | 33 | Tidligere delbevis beholdes; PR294/live16bygg, roller/portaler og sluttpakker står separat. |
| HR | 11 | Ansatt/leder, samtale/sykefravær, maler, historikk og tilgang; ingen ekte sending eller tilgangsendring. |
| KS/HMS | 13 | Rutiner, SJA, avvik, fremdrift, ansatte, kontrollfrister, vedlegg og uttrekk. |
| Firmaadmin | 7 | Invitasjoner, tilgang, firmaprofil/logo og eksisterende time-opt-in. |
| Systemadmin | 9 | Alle adminfaner, underhandlinger og firma-/rollegrenser. |
| Kunde- og kontrollørportaler | 2 | Kunde/kontrollør og egne PDF-/leseruter uten reell signering eller ny lenketilgang. |
| Timer og utlegg | 3 | Registrering, timer, utlegg, innsending/retur og deaktivert firmafunksjon. |
| Support | 2 | Saksoversikt, nytt/svar/vedlegg og Min side-inngang. |
| Hjelp og A–Å | 2 | Kontekstinnganger, søk/A–Å, fungerende mål og retur med kladd bevart. |
| Meny og arbeidsflate | 2 | Desktop/mobil, høyre verktøy, Escape/fokus, navigasjon og bevisst exit. |

## Arbeidsrekkefølge og sluttkrav

Denne samlepakken kontrollerer Min side og vareflyten. Fortsett deretter Forespørsel/befaring/begge tilbud, prosjekt og HR/KS/HMS/sjekklister, så admin/support/hjelp/portaler og de øvrige navngitte områdene. Ikke gå tilbake til bare Bolig fordi demoen skal bruke den. Felles feil rettes samlet; ingen ny parallel modell for eksisterende timeføring, tilgang eller kladd.

For hver inngang: åpne alle relevante faner/utvidelser, feltvalg, underdialoger, forhåndsvisninger, historikk og eksport. Kontroller også tomt innhold, feil/pending, leser/leder, smal/kort skjerm, lukk/tilbake/fokus og bevart kladd. Serverhandlinger kontrolleres med isolert transport når levende QA ville sendt, signert, bestilt eller endret tilgang. Fysisk mobil/Safari og reelle rolle-/transportforløp skal skilles fra Chromium i endret vindusstørrelse.

## Videoer

Godkjent PROFFDOK-VIDEO-1.0 beholdes: faktiske skjermbilder, lesbar tekst, animert peker/klikkring, hele nødvendig innhold, ingen lyd. Hvert funksjonspunkt skal få søkbar video-/kapittelkobling. En oversiktsfilm teller ikke som dekning av alle underfunksjoner. Lengde følger innholdet; del lange oppgaver i egne klipp. Kilder, markeringer, tekst, timing og renderer bevares separat.

Første pilot dekker et avgrenset bolig-/hjelpforløp. Første nye film utenfor Bolig er produsert og kontrollert: [Min side – åpne og lese egne planer](https://chatgpt.com/library?file_id=libfile_e1f75f1c86648191bbfbdb7406c24940&account_id=personal),95sekunder/ti scener, uten lyd. [Redigerbare kilder](https://chatgpt.com/library?file_id=libfile_a6bcd192278c8191bef76968681d8c06&account_id=personal). Hele2280bilder dekodet og Chromium-avspilling/start/seek/sluttPASS. Den dekker ikke planredigering, bemanningsstyring eller eksport. Filmene bør være tilgjengelige i konteksthjelp, modulens videoserie og søkbar Hjelp, med kapitler og stor avspiller/fullskjerm. Ingen tomme videoknapper publiseres før filer og koblinger er kontrollert.
