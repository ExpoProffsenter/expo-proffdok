# Arbeidsflyt for Expo ProffDok

Avtalt 26.10.2026 etter gjennomgangen i [PR288](https://github.com/ExpoProffsenter/expo-proffdok/pull/288).

## En avgrenset rettelse

1. Les guardrails og relevante tester. Oppgi kort scope og miljømål; gjenbruk eksisterende arbeidsbranch/Preview.
2. Gjenskap feiltilstanden med faktiske komponenter når mulig. Rett årsaken og kontroller berørte eksisterende brukerreiser. Firmaskille, fersk tilgang, kladd/hydrering og sending sperres som før.
3. Lag ett varig grunnlag i `docs/changes/<endring>.json`. Beskriv endringen og faktisk verifisering. Begrunn om Hjelp, arkitektur, oppsett/bruk og modulkontrakt berøres. Dokumentasjonsvakten krever de dokumentene som er markert relevante, uten automatisk krav om fire filer.
4. Kjør relevante lokale kontroller én gang og la CI kjøre full dekning. Ikke gjenta vellykket uendret kontroll uten ny risiko eller feil. Oppgi begrensninger ærlig.
5. Ved appendring: gi fast Preview og kort testliste. Brukerens uttrykkelige TEST OK kan bygge på dokumenterte tester; brukeren behøver ikke gjenskape en feil som bare oppstår hos en annen bruker.
6. Etter TEST OK: merge, bekreft riktig Production-commit/miljø og fullfør main → demo med bevart overlay og grønn preflight. Ingen ekstra godkjenning for de allerede avtalte trinnene.

Rene dokumentasjons-/regel-/CI-oppdrag har passende tekniske kontroller, men trenger ingen innlogget appprøve av uendret funksjonalitet. Ukjent eller blandet omfang klassifiseres konservativt.

## CI-pakker og feilsøking

Scope-/dokumentasjonsvaktene kjøres først. Deretter kjøres build, HR React, HR database, firma/database, app/nettleser, prosjekt/support, Bolig database/React og Bolig nettleser uavhengig. Alle opprinnelige direkte kommandoer og scenario-varianter er bevart i `scripts/qa/core-safety-coverage.json`; `core-safety-workflow-check.mjs` kontrollerer at de fremdeles kjøres. Rotens npm build/critical-kjede er uendret.

QA-avhengighetene er låst én gang i `scripts/qa/package-lock.json`, installert isolert og brukt i alle pakker. Npm-nedlastinger og den versjonsbundne Chromium-nedlastingen caches. Nettleserpakker installerer også nødvendige systembiblioteker. Det kreves ingen lokale tester mot produksjonsdata eller sending.

En feil i én pakke kan undersøkes og kjøres igjen med GitHubs «Re-run failed jobs». Allerede grønne pakker skal ikke kjøres på nytt bare fordi en uavhengig pakke feilet. Noter årsaken til omkjøring; spor en ustabil test separat. Ikke svekk assertioner eller bruk automatisk gjentakelse til det blir grønt.

Den eksisterende påkrevde sjekken **Core safety + critical build** er en sluttkontroll med samme navn som før. Den avviser feil, avbrudd, manglende pakker og uventet hopp over pakker. Rene proseendringer i kjente dokumentasjonsstier kan få kortløpet. Regler, CI, runtime, backend, evidensfiler og ukjente stier får full dekning. Selektiv modultesting er ikke innført.

## Ett oppdatert statuspunkt

`CURRENT_RELEASE_STATUS.md` er kort aktuell status med lenker til PR/bevis. PR-en oppdateres med faktisk kandidat, CI, godkjenning og resultat. README, arkitektur og Hjelp skal beskrive bruk/oppsett/kontrakt, ikke kopiere samme releaselogg. Historiske bevis beholdes i arkiv og PR-er.

Eksempel på et avgrenset endringsgrunnlag finnes i `docs/changes/process-simplification-20261026.json`. `required: false` trenger konkret begrunnelse; `required: true` krever den relevante dokumentasjonsfilen i samme PR. Feilrettinger uten endret brukerflyt trenger ikke en kunstig Hjelp-endring.

## Fast main → demo-prosedyre

Apprelease er først ferdig etter følgende faste kontroll. Prosedyren gjelder eksisterende permanent demo; aldri merge demo tilbake til main.

1. Registrer publisert main-SHA og eksisterende demo-SHA. Bruk et separat arbeidsområde med ren demo som utgangspunkt.
2. Merge eksakt publisert main inn i demo. Gå gjennom konflikter og bevar demo-overlay, syntetiske ressurser, Sandbox-konfigurasjon og kontrollverktøy. Ikke erstatt demo ukritisk med main.
3. Sammenlign produktendringen med publisert main og overlay med forrige demo. Oppdater bare nødvendige integrasjonspunkter og kontrollsidens main-baseline.
4. Kjør demo critical/build og kontrollside-regresjon. Oppdater remote demo uten force, med forventet gammel SHA.
5. Bekreft READY på eksakt commit og fast demo-host, faktisk Sandbox-binding og ny grønn Sandbox-preflight. Registrer avvik/begrensninger; ikke seed, reset eller send e-post som sideeffekt.

Automatisk konfliktløsning og modulbasert testutelating er egne mulige neste endringer, ikke en del av denne forenklingen. Dette hindrer at hastighetsarbeidet utilsiktet endrer demofunksjon eller testdekning.
