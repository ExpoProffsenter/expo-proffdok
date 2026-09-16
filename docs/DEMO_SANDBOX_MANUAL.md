# Expo ProffDok – Demo Sandbox A–Å

Denne manualen er laget for presentasjon, opplæring og intern QA i det permanente isolerte demo-miljøet.

> **Viktig:** Demo Sandbox er ikke Production. Bruk aldri `expo-proffdok.app` til demoendringer/testdata.

## Kortversjon – før kurs eller demo

Bruk denne regelen hver gang:

1. Åpne `/demo-control.html`.
2. Trykk **Tilbakestill demo** hvis forrige visning kan ha endret DEMO-saker/prosjekter.
3. Trykk **Kjør preflight**.
4. Start opplæringen først når kontrollene er grønne.

Husk forskjellen:

- **Golden Demo** er lagret fasit/starttilstand for DEMO Sales-saker og demo-prosjekter.
- **Tilbakestill demo** gjenoppretter denne fasiten. Innlogging og DEMO-varekatalog beholdes.
- **Oppdater Golden Demo** erstatter selve fasiten med dagens DEMO Sales/prosjektdata. Dette er ikke en vanlig kursknapp og skal bare brukes etter bevisst QA av ny starttilstand.
- **Refresh/appbytte nullstiller ikke sandboxen.** Endringer blir liggende til de resettes eller endres igjen.
- **HOVED** er normal sammenhengende demo. **RESERVE** er ferdige checkpoints/sluttresultat når du vil hoppe frem.

## 1. Før du starter

Kontroller alltid følgende før en demo:

1. Åpne det faste sandbox-hostet `https://expo-proffdok-git-demo-ringside.vercel.app`.
2. Kontroller at demo-kontrollen er tilgjengelig øverst og at `/demo-control.html` åpner.
3. URL-en skal ikke inneholde `progressTest=safe` eller `progressTest=andreas`.
4. Logg inn med den dedikerte demo-brukeren. Innloggingspassord lagres ikke i repositoryet.
5. Kontroller at **Representerer** viser demo-firmaer, ikke ekte Production-firmaer fra kundedata.
6. Kontroller at Sales-listen kun viser tydelig merkede DEMO-saker.
7. For kurs i vareflyt: kontroller at **Prissøk/Varesøk** og **Butikktilbud** er synlig under Expo Proffsenter.

Hvis ett av disse punktene ikke stemmer: stopp demoen og bruk den statiske nød-demoen i stedet.

## 2. Miljøer

### Production

- URL: `https://expo-proffdok.app`
- Branch: `main`
- Supabase ref: `dqffxflaoyarbxyiyhop`
- Ekte data

### Permanent Demo Sandbox

- URL: `https://expo-proffdok-git-demo-ringside.vercel.app`
- Branch: `demo`
- Supabase ref: `ppvircenkjizeiqdxphj`
- Egen Auth
- Egen database
- Egne Storage-buckets
- Kun fiktive/sanitiserte demodata
- Skal aldri merges til `main`

Produksjonskode kan etter godkjent Production-verifisering synkroniseres **main → demo**. Demo-overlay, demodata og sandbox-konfigurasjon skal aldri flyte **demo → main**.

## 3. Demoens anbefalte historie

Bruk denne rekkefølgen i presentasjonen:

1. Forespørsel
2. Befaring
3. Tilbud
4. Kundevisning og opsjoner
5. Akseptert tilbud
6. Prosjekt
7. Kontrakt / avtalegrunnlag
8. Prosjektering og dokumentasjon
9. Fremdriftsplan
10. Bilder / Badskisse
11. Chat
12. Rapport
13. Garanti
14. Kundelink / portal

For opplæring av butikk/varesøk kan du i tillegg vise **Prissøk/Varesøk → Butikktilbud → velg vare → pris/opsjon/montering**.

Du trenger ikke åpne alle detaljer. Målet er å vise sammenheng fra kundedialog til ferdig dokumentasjon.

## 4. Representerer

Sandbox har egne demo-firmaer for å vise flerfirma-flyten:

- Expo Proffsenter
- Bademiljø Expo
- Ringside Rørleggerbedrift AS

Bytt gjerne firma én gang for å demonstrere branding og arbeidsprofil. Gå deretter tilbake til **Expo Proffsenter** for resten av demoen.

Forventet:

- logo følger valgt firma
- prosjekt/Sales-scope følger valgt firma
- Production-data skal aldri dukke opp

### Varesøk, Prissøk og Butikktilbud

Fase 44A har en egen syntetisk opplæringskatalog i Sandbox. Den er laget for kurs og demonstrasjon og inneholder ikke Production-prislister eller ekte kundeopplysninger.

Bruk Expo Proffsenter som aktivt firmascope når du viser dette.

Du kan demonstrere:

- søk på varenavn
- søk på varenummer
- søk på GTIN/EAN
- kundepris inkl. mva.
- intern netto/rabatt/margin for autorisert demo-systemadmin
- alternative leverandører på samme GTIN
- valg av vare direkte inn i Butikktilbud
- videre redigering med montering og opsjoner i ordinær Butikktilbud-flyt

DEMO-varekatalogen ligger utenfor Golden Sales/prosjekt-snapshotet. **Tilbakestill demo sletter derfor ikke varekatalogen.**

Hvis Varesøk er tomt, Prissøk mangler eller du får `permission denied`, behandles det først som Sandbox schema/grants/seed – ikke som grunnlag for å endre Production-koden.

## 5. Forespørsel

Åpne DEMO-saken for Forespørsel.

Vis:

- kunde
- adresse
- kontaktinfo
- neste steg
- at tilbud kan lages uten befaring hvis ønskelig

Forklar at normal anbefalt rekkefølge er forespørsel → befaring → tilbud, men at systemet ikke låser bedriften til denne rekkefølgen.

## 6. Befaring

Åpne DEMO-saken for Befaring.

Vis gjerne:

- befaringsdato
- ansvarlig
- notater
- bilder
- Badskisse / tegning
- målsatte observasjoner

Sandbox har egne Storage-buckets. Opplastinger lagres kun i sandboxen.

## 7. Tilbud

Åpne DEMO-saken for Tilbud.

Forventet grunnlag:

- 12 tilbudslinjer
- 38 opsjoner
- sanitert badtilbud basert på Andreas-malens struktur

Vis:

- hovedposter
- prislinjer
- opsjoner
- opsjon med bilde
- kundens total
- redigering av tilbud

### App-/fanebytte

Sandboxen kjører samme ordinære Sales-recovery som produksjonsbaselinen den bygger på. Bytt gjerne fane/app og gå tilbake for å demonstrere at arbeidet beholdes.

Hvis editoren blir tom eller viser konfliktvarsel:

1. Ikke velg en tilfeldig versjon.
2. Noter hvilken DEMO-sak du sto i.
3. Stopp denne delen av demoen.
4. Bruk ferdig kundevisning eller nød-demoen.
5. Feilen skal undersøkes som enten sandbox-datafeil eller separat Production-feil – ikke lappes direkte inn i Sales-kjernen.

## 8. Kundevisning tilbud

Kundevisningen åpnes separat som kundens visning.

Vis:

- tilbudstekst
- pris
- opsjoner
- opsjonsbilder
- totalsum
- digital akseptflyt

I demo bør irreversible utsendinger/e-post unngås. Bruk ferdig publisert sandbox-tilbud der det er mulig.

## 9. Akseptert tilbud

Den aksepterte DEMO-saken inneholder tre valgte opsjoner.

Vis:

- låst tilbudsgrunnlag
- valgte opsjoner
- akseptert total
- at aksepten blir historikk
- at prosjekt kan aktiveres

Publisert/akseptert historikk skal behandles som immutable også i måten vi forklarer systemet på.

## 10. Prosjekt

Åpne demo-prosjektet.

Vis anbefalt prosjektflyt:

1. Kontrakt / Avtalegrunnlag
2. Prosjektering
3. Fremdrift
4. Produkter / FDV
5. Bilder
6. Sjekklister
7. Avvik
8. Chat
9. Overtagelse
10. Rapport / garanti

Sandbox-prosjektet er fiktivt og kan endres uten risiko for Production.

## 11. Fremdriftsplan – hent poster fra tilbud

Sandbox-prosjektet er koblet til det aksepterte tilbudet via `salesOrigin.publicToken` og starter med tom gyldig fremdriftsplan.

Gå til **Fremdrift** og bruk handlingen for å hente poster fra akseptert tilbud.

Forventet import er 7 unike arbeidsoperasjoner:

- Tildekking
- Demontering og riving
- Rørlegger
- Elektriker
- Maler
- Rigg og drift
- Avfallshåndtering

Tre valgte opsjoner følger **Rørlegger** som opsjonsgrunnlag.

Deretter kan du:

- legge dato/tid
- velge fag
- velge ressurs
- endre status
- legge flere arbeidsøkter
- lagre planen
- velge om kunde skal se fremdriften
- eksportere kalender/PDF der funksjonen er tilgjengelig

Vanlige Vercel Previewer kan bruke `progressTest=safe`. Den permanente Demo Sandboxen er fysisk isolert og skal ikke bruke denne parameteren.

## 12. Bilder og Badskisse

Sandbox har følgende egne bucket-navn:

- `sales-inspection-photos`
- `project-images`
- `project-media-private`
- `project-documents-private`
- `chat-images`

Ingen Production-filer er kopiert.

Hvis du laster opp et bilde under demo, ligger det kun i sandboxen.

## 13. Chat

Vis gjerne intern/prosjektrelatert dialog, tidslinje og bilde i chat hvis ønskelig. E-postvarsling/eksterne sideeffekter er ikke et nødvendig demopunkt i sandboxen.

## 14. Rapport

Bruk demo-prosjektet til å vise rapportlayout og hvordan dokumentasjonen samles.

Sandbox kan inneholde ferdig rapportgrunnlag. Rapporten er demonstrasjon, ikke juridisk prosjektarkiv. Før neste viktig demo skal rapporten verifiseres eksplisitt hvis den skal vises; rapportkvalitet er et eget produktoppfølgingspunkt etter demoen 16.09.2026.

## 15. Garanti

Vis garantiutseendet og forklar de reelle produksjonskravene:

- overtagelse signert
- ingen åpne avvik
- sjekklister fullført
- nødvendige bilder lastet opp
- valgt godkjent system der dette kreves

Demo-garantien er kun visuell/funksjonell demonstrasjon.

## 16. Kundelink / portal

Demo-prosjektet har egen sandbox-portaltilgang. Vis prosjektinformasjon, eventuell fremdrift, dokumentasjon og chat der tilgjengelig. Bruk kun sandboxens demo-kode.

## 17. Hva lagres i sandboxen?

I motsetning til den statiske nød-demoen lagrer ekte Sandbox Sales-endringer, prosjektendringer, fremdriftsplan, bilder/filer, chat og annen støttet demoaktivitet.

**Refresh nullstiller derfor ikke sandboxen.**

Varesøk/Butikktilbud-katalogen er også persistent Sandbox-data, men er bevisst ikke del av Golden Sales/prosjekt-snapshotet.

## 18. Golden reset før neste demo

Sandboxen har Golden snapshot for kjent starttilstand.

### Hva gjør Tilbakestill demo?

- gjenoppretter DEMO Sales-saker fra Golden Demo
- gjenoppretter DEMO-prosjektene fra Golden Demo
- gjenoppretter tilhørende demo-kontrakt/garanti-data som inngår i snapshotet
- rydder lokal demo-/recovery-state på denne enheten
- installerer ren redigerbar DEMO-Badskisse
- beholder innloggingen
- beholder DEMO-varekatalogen for Varesøk/Butikktilbud

### Hva gjør den ikke?

- den nullstiller ikke Production
- den kopierer ikke Production-data
- den sletter ikke DEMO-varekatalogen
- den gjør ikke automatisk dagens tilstand til ny Golden Demo

### Hva betyr Oppdater Golden Demo?

Denne knappen tar dagens DEMO Sales/prosjekt-tilstand og lagrer den som ny fasit for fremtidige reset. Bruk den bare når du faktisk ønsker å endre standard demo-oppsett og tilstanden er kontrollert/godkjent.

Ved vanlig kursforberedelse skal du normalt bruke **Tilbakestill demo**, ikke **Oppdater Golden Demo**.

Reset skal utføres via den dedikerte sandbox-kontrollen/autoriserte backend-flyten. Ikke bruk generiske DELETE-spørringer, navnesøk eller Production-data for å rydde demo.

Etter reset: kjør preflight. Når alt er grønt kan du starte kurset.

## 19. Hvis noe oppfører seg annerledes enn Production

### A. Permission denied / tom tabell / manglende RPC
Mest sannsynlig sandbox-schema/grants/seed. Rett sandboxen, ikke Production-koden.

### B. Manglende bilder/opplasting
Sjekk sandbox Storage og permanente demo-URL-er først.

### C. Fremdrift henter ikke tilbud
Sjekk at URL ikke har `progressTest=safe`, at prosjektet har `salesOrigin.publicToken`, og at token peker til akseptert sandbox-tilbud.

### D. Sales/recovery-feil som også kan gjelde ekte app
Ikke reparer direkte på `demo`. Reproduser først mot ren `main` og ta eventuell produktretting i egen branch med ordinær critical QA og `TEST OK`.

### E. E-post eller automatiske varsler uteblir
Dette kan være tilsiktet. Sandbox skal ikke ukritisk sende ekte e-post eller kjøre Production-cron.

### F. Varesøk/Prissøk er tomt eller skjult
Kontroller aktivt firmascope, modultilgang og Sandbox-katalog/RPC-er. Ikke kopier ekte Production-prislister inn i Sandbox som en snarvei.

## 20. Nød-demo

Det finnes også en statisk demo-side på `demo`-branchen. Den har ingen Supabase, Auth, lagring eller e-post og kan ikke påvirke Production. Bruk denne hvis ekte sandbox får en uforutsett feil rett før en presentasjon.

## 21. Production → demo etter produktendringer

Når en produksjonsendring er godkjent, merged og verifisert i Production, vurder om den også skal være tilgjengelig i demo. I så fall synkroniseres gjeldende `main` **inn i `demo`**. Demo-overlayet beholdes.

Etter synk må sandbox-preflight bekrefte at builden bruker Sandbox-Supabase og ikke Production-Supabase, og at fast demo-host, kontrollside og demodata fortsatt fungerer.

## 22. Etter demo

1. Noter eventuelle avvik.
2. Skill sandbox-feil fra produktfeil.
3. Reset sandbox ved behov.
4. Produktfeil tas gjennom ordinær Works-flyt fra `main`.
5. Production verifiseres separat ved alle Production-endringer.

## 23. Kjøreregel

Demo-funksjonalitet skal aldri være begrunnelse for å svekke eller endre eksisterende Production-recovery, autosave, firmascoping, navigasjon eller historikk uten at samme feil først er bevist i ren `main` og behandlet som en separat produktendring.
