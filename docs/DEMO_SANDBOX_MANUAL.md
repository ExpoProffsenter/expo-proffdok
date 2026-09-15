# Expo ProffDok – Demo Sandbox A–Å

Denne manualen er laget for presentasjon, opplæring og intern QA i det isolerte demo-miljøet.

> **Viktig:** Demo Sandbox er ikke Production. Bruk aldri `expo-proffdok.app` til demoendringer/testdata.

## 1. Før du starter

Kontroller alltid følgende før en demo:

1. Åpne det faste sandbox-hostet for `feature/demo-showcase-isolated`.
2. Kontroller at gult merke **DEMO SANDBOX · IKKE PRODUKSJON** vises.
3. URL-en skal ikke inneholde `progressTest=safe` eller `progressTest=andreas`.
4. Logg inn med den dedikerte demo-brukeren. Innloggingspassord lagres ikke i repositoryet.
5. Kontroller at **Representerer** viser demo-firmaer, ikke ekte Production-firmaer fra kundedata.
6. Kontroller at Sales-listen kun viser tydelig merkede DEMO-saker.

Hvis ett av disse punktene ikke stemmer: stopp demoen og bruk den statiske nød-demoen i stedet.

## 2. Miljøer

### Production

- URL: `https://expo-proffdok.app`
- Branch: `main`
- Supabase ref: `dqffxflaoyarbxyiyhop`
- Ekte data

### Demo Sandbox

- Branch: `feature/demo-showcase-isolated`
- Supabase ref: `ppvircenkjizeiqdxphj`
- Egen Auth
- Egen database
- Egne Storage-buckets
- Kun fiktive/sanitiserte demodata
- Skal aldri merges til `main`

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

Sandboxen kjører samme ordinære Sales-recovery som `main`. Bytt gjerne fane/app og gå tilbake for å demonstrere at arbeidet beholdes.

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

Dette er et viktig demopunkt.

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

### Viktig forskjell mot gammel Preview-test

Vanlige Vercel Previewer tvinges til `progressTest=safe`, som med vilje blokkerer tilbudsimport/serverlagring. Demo Sandbox er fysisk isolert og skal **ikke** bruke denne parameteren.

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

Vis gjerne:

- intern/prosjektrelatert dialog
- tidslinje
- bilde i chat hvis ønskelig
- sammenheng med kundelink/prosjektportal

E-postvarsling/eksterne sideeffekter er ikke et nødvendig demopunkt i sandboxen.

## 14. Rapport

Bruk demo-prosjektet til å vise rapportlayout og hvordan dokumentasjonen samles.

Sandbox kan inneholde ferdig rapportgrunnlag. Rapporten er demonstrasjon, ikke juridisk prosjektarkiv.

## 15. Garanti

Vis garantiutseendet og forklar de reelle produksjonskravene:

- overtagelse signert
- ingen åpne avvik
- sjekklister fullført
- nødvendige bilder lastet opp
- valgt godkjent system der dette kreves

Demo-garantien er kun visuell/funksjonell demonstrasjon.

## 16. Kundelink / portal

Demo-prosjektet har egen sandbox-portaltilgang.

Vis:

- prosjektinformasjon
- eventuell fremdrift når kundesynlighet er aktiv
- dokumentasjon
- chat der tilgjengelig

Bruk kun sandboxens demo-kode. Production-kundekoder skal aldri brukes eller kopieres inn.

## 17. Hva lagres i sandboxen?

I motsetning til den statiske nød-demoen lagrer ekte Sandbox:

- Sales-endringer
- prosjektendringer
- fremdriftsplan
- bilder/filer
- chat og annen demoaktivitet som støttes

Dette er ønsket fordi vi vil teste app-/fanebytte og realistisk persistens.

**Refresh nullstiller derfor ikke sandboxen.**

## 18. Reset før neste demo

Per 15.09.2026 er reset en kontrollert backend-operasjon, ikke en knapp i appen.

Før neste viktige demo bør starttilstanden verifiseres. En framtidig forbedring er en Kenneth-only atomisk `Reset sandbox`-handling.

Ikke bruk generiske DELETE-spørringer eller navnesøk i Production for å rydde demo.

## 19. Hvis noe oppfører seg annerledes enn Production

Bruk denne beslutningen:

### A. Permission denied / tom tabell / manglende RPC

Mest sannsynlig sandbox-schema/grants/seed. Rett sandboxen, ikke Production-koden.

### B. Manglende bilder/opplasting

Sjekk sandbox Storage-bucket/policy først.

### C. Fremdrift henter ikke tilbud

Sjekk:

1. URL har ikke `progressTest=safe`
2. prosjektet har `salesOrigin.publicToken`
3. token peker til akseptert sandbox-tilbud
4. `get_sales_offer_by_token` returnerer tilbud + versjon

### D. Sales/recovery-feil som også kan gjelde ekte app

Ikke reparer direkte på sandbox-branchen. Reproduser først mot ren `main` og ta eventuell produktretting i egen branch med ordinær critical QA og `TEST OK`.

### E. E-post eller automatiske varsler uteblir

Dette kan være tilsiktet. Sandbox skal ikke ukritisk sende ekte e-post eller kjøre Production-cron.

## 20. Nød-demo

Det finnes også en statisk demo-side på sandbox-branchen. Den har:

- ingen Supabase
- ingen Auth
- ingen lagring
- ingen e-post
- ingen mulighet til å påvirke Production

Bruk denne hvis ekte sandbox får en uforutsett feil rett før en presentasjon.

## 21. Etter demo

1. Noter eventuelle avvik.
2. Ikke endre `main` direkte.
3. Skill sandbox-feil fra produktfeil.
4. Reset sandbox ved behov.
5. Produktfeil tas gjennom ordinær Works-flyt.
6. Production verifiseres separat ved alle Production-endringer.

## 22. Kjøreregel

Demo-funksjonalitet skal aldri være begrunnelse for å svekke eller endre eksisterende Production-recovery, autosave, firmascoping, navigasjon eller historikk uten at samme feil først er bevist i ren `main` og behandlet som en separat produktendring.
