# Beboerportal, oppgavehenting og bemanningsavklaring – 25. oktober 2026

Miljømål **BEGGE**, Preview/Sandbox først. Baseline er faktisk publisert main
`5127795f07c8403dac89a75b58a092194d36124a`. PR278 er allerede installert og
produksjonssatt. Gamle clean-install-planer skal ikke kjøres på nytt.

Arbeidsbranch: `fase45b-bolig-portal-polish-20261025`.
Denne endringen er ikke produksjonsmerget. Kenneths nye TEST OK gjenstår.

## Avtalt scope og endring

- Portalens firma-/boligidentitet, mørkt petrolfarget toppfelt, kompakte mobilfelt,
  fire eksisterende faner med ikoner, tydelig valgt pakke og «Neste steg».
  Neste steg leser eksisterende avtaleoversikt/valgstatus og bytter bare fane.
  Ingen avtale aksepteres, publiseres eller sendes fra denne snarveien.
- Kun portalens komponent importerer ny `boligPortalPresentation.css`.
  Den separate avtalesiden og interne appen får ikke de nye portalstilene.
  Backend deler ikke firmalogo i portalgrunnlaget. Firmaets autoriserte navn og
  et nøytralt bygningsikon brukes; ingen logo eller bilde hentes fra andre kilder.
- Egne boligoppgaver: en nettverksfeil kan ikke lenger skjule hele kortet som om
  listen var tom. Vis generisk feil og lesende retry uten cached oppgavedata.
  Serveravvist tilgang (42501) og bekreftet tom liste forblir skjult.
  Klassifiseringen er avgrenset til bruker/firma og siste lokale leseforsøk.
  Den delte `useLivePartner` og eksisterende tilgangskontroller er uendret.
- Hjelp og dokumentasjon forklarer flyten og bemanningslistens faktiske dekning.

Beskyttet og uendret: main/bootstrap, navigasjon, auth, firma-/rollekjerne,
backend/RLS/Storage, database/migrasjoner, Edge Functions, e-post, priser,
akseptmotor, portal-RPC, kladdlagring, ordremotor og demo-overlegg.

## Testvakten etter PR278

Den eksisterende `bolig-core-boundary-check` feilet mot dagens main uten noen
endring i pakker eller felleskjerne: den fjernet fortsatt PR278s godkjente
integrasjoner før sammenligning, selv om main nå inneholder dem.

Den gjenkjenner nå en baseline som allerede har BoligEntry. Mot denne sammenlignes
beskyttede fellesfiler og package.json direkte. Mot den frosne baselinen fra før
PR278 beholdes opprinnelig rekonstruksjon og alle eksisterende assertions.
`CURRENT_RELEASE_STATUS.md` er lagt til som eksplisitt dokumentasjonssti.
Ingen eksisterende critical-check, migrasjon eller CI-jobb svekkes eller hoppes over.

Kontrollert lokalt:

- 55 assertions mot faktisk main 5127795f.
- 55 assertions / 454 paths i separat worktree på godkjent f39d374, mot den
  opprinnelige pre-release-main 36462e2b.
- Åtte tilsiktede lokale mutasjoner blokkeres: main, Min side, tilgangskort,
  dialog, timeføringstest, Sales-critical, pakkeversjon og eksisterende
  Bolig-migrasjon. Filene er gjenopprettet og ren kontroll består igjen.

## Faktisk QA

- Full critical Sandbox-build PASS. Ingen pakke-/lockfilendring.
- Portal: 51 Chromium-assertions PASS, inkludert eksisterende request/retry,
  kladd etter reload/fokus, faktisk avtalesvar, dokumentlenke, meldinger,
  leserrolle, invitasjonsflate og tilbakekalling.
- Nye portalprøver: riktig firma/bolig, lesende nestehandling uten mutasjon,
  44 px eller høyere faneknapper, tastaturtilgang, 320/390/1366 px,
  svært lange firma-/bolig-/adressefelt og rydding av hele identitetsfeltet ved
  tilbakekalling. Alle tidligere assertions er beholdt.
- Faktisk React-grunnflate PASS: serverstyrt meny, firmaaktivering, individuelle
  roller, skifte av firma, tilbakekalling, kladd/fokus, konflikt/retry og skjema-/
  fullskjermisolasjon. Transporten i disse lokalscenariene er syntetisk.
- Integrasjon og oppgavekort: 31 Chromium-assertions PASS på siste kilde.
  Nye feil-/retry-/tilgangs-/tomlisteprøver kjøres også separat: 7 PASS.
  Den nye feiltesten feiler som forventet mot uendret produksjonskomponent
  (feilmeldingen skjules), og består når rettelsen legges tilbake.
- Eksisterende faktisk bemanning: 19 Chromium-assertions PASS. Dette er en
  funksjonsprøve av tilstedeværelseslisten, ingen attest på komplett tilsynsliste.
- Skjermbilder ved 1366 og 390 er inspisert. Syntetiske identiteter brukes.
  [PC](evidence/bolig-portal-desktop-20261025.png) ·
  [Mobil](evidence/bolig-portal-mobile-20261025.png).

Ingen ekte kundeaksept, e-post, invitasjon eller databasemutasjon er utført.
Fysisk iPhone/Android/Safari og innlogget brukerprøve på ny Preview er ikke
attestert av disse lokale testene. Eksakt commit, server-CI og Preview føres i PR.

## Bemanning: svar til Kenneth og registrert videre behov

**Finnes i dag:** Boligprosjekter → valgt prosjekt → Oppsett → Faktisk bemanning.
Prosjektleder kan aktivere, legge til navngitte deltakere, registrere manuelt,
se registrert inne/ute, velge prosjektdag, se rettingshistorikk og eksportere CSV.
Ansatte bruker Min side; UE bruker én personlig lenke per person.

Listen viser navn, firma og inn-/uttider. Den er en tilstedeværelsesliste, ikke
en komplett elektronisk oversiktsliste etter byggherreforskriften § 15.
Den er heller ikke bevis på at alle som faktisk befinner seg der har registrert seg.

[Arbeidstilsynets veiledning, kontrollert 25.10.2026](https://www.arbeidstilsynet.no/hms/hms-i-bygg-og-anlegg/byggherreforskriften/elektroniske-oversiktslister/)
krever byggeplassens navn/adresse, byggherre, arbeidsgivere/enmannsbedrifter eller
innleievirksomhet, organisasjonsnummer samt personenes navn, fødselsdato,
arbeidsgiver og HMS-kortnummer. Listen skal føres elektronisk, kontrolleres og
oppdateres daglig, være tilgjengelig ved tilsyn og oppbevares seks måneder etter
arbeidets avslutning. Veiledningen krever arkivering etter endringer. Inn-/uttid
er nyttig i driften, men er ikke i seg selv et krav i § 15.

**Neste avgrensede leveranse, ikke implementert her:** gjenbruk deltakergrunnlaget
til en komplett oversiktsliste med virksomhetsidentitet, fødselsdato/HMS-kort,
byggherre-/byggeplassgrunnlag, synlige mangler, endringshistorikk og lesbart
tilsynsuttrekk. Avklar hvem som fører/kontrollerer listen, tilgang og arkivering.
Ikke merk dagens CSV som lovmessig fullstendig, og ikke vis denne informasjonen
i beboerportalen eller en felles UE-/leverandørlenke.

## Kort brukerprøve før TEST OK

1. Åpne en syntetisk beboerportal på den nye Preview-verten. Kontroller firma,
   bolig, adresse og neste steg på PC og mobil. En tidligere Sandbox-testlenke
   kan brukes med bare vertsdelen byttet; behold sti og hele fragmentet.
   Personlige lenker skal ikke lagres i repoet.
2. Trykk nestehandling og de fire fanene. Kontroller at riktig innhold åpnes.
   Skriv en usendt melding, bytt fane og kom tilbake. Teksten skal være der.
3. På Min side skal en midlertidig hente-feil tilby retry. Bekreftet tom liste
   eller manglende tilgang skal ikke vise andre personers oppgaver.
4. Bemanning er uendret; se den under Oppsett → Faktisk bemanning. Den komplette
   oversiktslisten ved tilsyn er fortsatt en egen gjenstående leveranse.

Etter ny TEST OK: vanlig merge, verifiser riktig Production-commit, deretter
kontrollert main → demo med bevart overlay og Sandbox-preflight. Ingen ny
backendinstallasjon eller aktivering av e-post inngår. Tilbakeføring av denne
UI-endringen kan gjøres via forrige frontend-deployment uten databasereversering.
