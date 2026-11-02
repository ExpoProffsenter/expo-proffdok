# Design 036 – siste avgrensede kandidat, 2. november 2026

PR295 / design01-app-ramme-20261028. Forelder dc4601a6d51961fa7ddfded767e1b2ef7cec030e. Miljømål BEGGE, kun Preview nå. Ingen samlet TEST OK, merge eller produksjonsinstallasjon er utført. Dette er nyere status enn releaseplanen fra1.november, ikke en instruks om å kjøre den gamle planen blindt.

## Levert og avgrenset

Tilbake og status bruker én rad; prosjektets snarveier og Status og mangler er samlet under navn/adresse. Gjentatt Arbeidsrom/Prosjektverktøy-tekst vises ikke foran innholdet; Verktøy og maler beholdes. Lagret prosjektoversikt viser oppstartsveiledning bare etter Vis veiledning. Nye prosjekter og redigerbare underfaner beholder rådene. Låst/support viser Skrivebeskyttet og ingen anbefalt oppstartsreise, heller ikke i bunnen. Alle opprinnelige navigasjons-, lagrings- og dokumenthandlinger beholder eier/callback.

Tre app-/hjelpefiler berøres: ProjectWorkspaceChrome.jsx, ny screen-only projectCompactHeader.css og workspaceHelp.mjs. main.jsx, lagringsmotor, priser, PDF, tilgang, SQL og e-post er urørt. Ingen ny designvariant eller nye funksjoner skal legges til før visningen3.november.

## Bevis

[Endrings-/testgrunnlag](../changes/project-compact-header-20261102.json) og [maskinlesbare før/etter-mål](evidence/project-compact-header-20261102.json). [Visuelt kontrollert utsnitt](evidence/project-compact-header-20261102.webp) er ekte komponenter med syntetisk innhold, uten appens masthead og uten innlogging. Ikke presenter det som levende RESERVE.

246nye native nettleserkrav PASS, i tillegg prosjekt196, panel53, veiledning288+84, fellesramme99, mobilheader91 og HR/Hjelp/tilgangs-React. Seks skjermstørrelser fra320×480 til1920×1080. Eksisterende save/continue-prøver åpner nå eksplisitt Vis veiledning; alle lagrings-, konflikt-, historikk- og sen-responskrav beholdes. Den nye fixturens første ventebetingelse kunne lese forrige React-render; den er rettet ved å vente på faktisk valgt tilstand, uten svekkede krav. Førkilden feiler korrekt på misvisende Neste i låst prosjekt.

Full critical/build PASS med både Production- og Sandbox-binding. Historisk integrasjonsdiff for uendrede PR294/298 er påført bare i separat detached worktree med siste headerkode; begge miljøbuilds består. Dette er kompatibilitet, ikke ny full innlogget kombinasjonstest. Ingen slik kode er blandet inn i PR295. Eksakt publisert commit, kandidatens fullCI og READY dokumenteres i fersk PR295-kommentar etter push.

## Produksjon før merge

Ferske Git-refs: main b389c7071b03f7e1d96a0ff0c0d5458edeebca3f; demo fd04ac9a31dee75d29d1c770b65b5edf023b619c. Begge er uendret. PR294/298/305 er fortsatt egne åpne draft-PR-er; hoder i bevisfilen.

Production Supabase dqffxflaoyarbxyiyhop ble kontrollert i read-only-transaksjon med rollback. Versjon20261031012504, checklist_private.template_proposals og de tre proposal-RPC-ene mangler. PR295 inneholder denne sjekklistefunksjonaliteten; designen er derfor ikke en ren CSS-release. Den eksakte additive migreringen må etter uttrykkelig TEST OK og produksjonsautorisasjon kontrolleres på nytt for delinstallasjon, installeres kontrollert og verifiseres før avhengig frontend går i produksjon. Ingen db push, seed/reset eller gammel installasjonsliste.

Faktisk Sandbox-binding er ppvircenkjizeiqdxphj. Dagens Supabase-tilkobling returnerer Project not found for denne ID-en; hr-control er IKKE erstatning for demo. Dette beskriver manglende tilgang i denne økten, ikke sletting av prosjektet. Ingen policy er omgått og ingen autentisering er endret. Full levende HOVED/RESERVE-/rolletest og fysisk Safari er fortsatt ikke bekreftet. Automatiske testdata erstatter ikke disse grensene.

## Avslutning av release

1. Lås funksjonsomfanget. Kenneth godkjenner design og inkludert sjekklistefunksjonalitet med uttrykkelig TEST OK. PR294/298 inngår bare hvis også deres omfang godkjennes; de skal ikke merges bare for å rydde. Den tidligere felles releaseplanen er referanse ved slik samlet godkjenning.
2. Kontroller endelig main, backendtilstand og grønn CI. Installer bare nødvendig godkjent migrering; verifiser rolle-/firmaskille og historikk uten eksterne mottakere.
3. Merge godkjente pakker, bekreft eksakt Production-SHA/READY/riktig backend og berørte flyter. Stopp på avvik. Publiser ikke en Sandbox-bundet Preview som Production.
4. Synkroniser faktisk main → demo med bevart overlay, bilder og riktig Sandbox-binding. Demo må ha tilgjengelig preflight og målrettet innlogget kontroll før visningen. Ingen demo → main.
5. Etter godkjent kontroll: freeze før visningen. Videre videoer og øvrig finpuss er restleveranse, ikke grunn til enda en designrunde.

Tilbakeføring: før hver produksjonspublisering registreres fungerende deployment og SHA. Den nye topprettelsen kan reverseres separat. Ingen database-/mediarollback kreves for headeren. Dersom malforslag er installert og brukt, skal lagrede forslag/historikk beholdes ved frontend-rollback. Produksjon og demo har separate tilbakeføringsgrunnlag.
