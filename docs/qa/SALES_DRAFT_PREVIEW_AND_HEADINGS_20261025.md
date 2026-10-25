# Kundepreview og PDF-overskrifter – Preview 25.10.2026

Miljømål: **BEGGE**. Separat core-branch fra `main` a939d332918d5cd2daed3e14788188b3f50597fe. Ny TEST OK kreves før merge/Production. Deretter main → demo med sandbox-preflight. Tidligere Bolig TEST OK gjelder ikke denne rettelsen.

## Problem og avgrensning

Rapportert kundepreview viser tidvis manglende innlogging etter ferdig tilbud. Innlogget ny fane på eksisterende Production fungerer i denne undersøkelsen; den utløsende periodiske null-sessionen er ikke gjenskapt. Koden hadde derimot en bekreftet feilbane: én session-lesing ved mount, der null eller feil ble stående permanent. Ingen auth-abonnement, foreground-kontroll eller ny prøvehandling kunne gjenåpne forhåndsvisningen. Session-feil ble dessuten behandlet som manglende innlogging.

Rettelsen begrenses til `SalesDraftCustomerPreview` og dens egen `salesDraftPreviewSession.mjs`. Appens klientregister, main/bootstrap, SalesModule, editor/autosave, server-first-hydrering, recovery, navigasjon, publisering, e-post, kundebeslutninger og backend/RLS er uendret. Kravpålagt release-dokumentasjon/hjelp og additive QA-koblinger følger samme PR.

Forhåndsvisningen abonnerer nå på auth-hendelser og kontrollerer session/firma ved synlig foreground. SDK-kall skjer i en senere oppgave, aldri inne i Supabase-auth-callbacken. En senere innlogging eller Prøv igjen kan hente den lagrede kladden. Session-feil får egen nettverks-/prøv-igjen-tekst. Innlogging åpnes på samme origin uten å overføre tokens. Ingen session kopieres fra en annen adresse eller fra opener.

Samme bruker/firma ved tokenfornyelse/fanebytte beholder kundenes lokale prøvevalg og DOM. Utlogging/brukerbytte fjerner gammelt innhold; firmascope/tilgang kontrolleres gjennom eksisterende autentiserte resolver/RLS før henting. Session og firmascope kontrolleres igjen før data får vises. Versjonsnummer på lastingen avviser sene svar etter brukerbytte, utlogging, ny kontroll og unmount. Innhold kommer fremdeles bare fra serverlagret kladd. Ulagrede editorendringer inkluderes ikke.

I den aktive tilbuds-PDF-generatoren var mellomtitler gjenkjent på kolon eller noen bestemte sluttord. «Oppstart, tildekking og riving» og «Gulv og membran» manglet. Disse to eksakte titlene (uavhengig av store/små bokstaver) får eksisterende mellomtittelstil: 8,7 pt, bold og mørk farge. Brødtekst, priser, datagrunnlag, aksept og øvrige PDF-generatorer endres ikke. Nettsidens eksisterende fritekstpresentasjon er uendret.

## Utført utvikler-QA

- Hele `npm run build` med eksisterende critical-checker: PASS.
- Ny permanent `critical-sales-draft-session-check.mjs`, koblet til begge critical/build-kommandoer: første null-session → senere innlogging, forsinket SDK, midlertidig feil → retry, samme-bruker token/foreground, logout, bruker/firma/tilgangsbytte, sene svar og cleanup. Også installert Supabase SDK med syntetisk lagret utløpt session og injisert refresh-transport: én faktisk SDK-refresh før tilbudslasting, ingen live-auth.
- `sales-draft-preview-browser-check.mjs`: 30 kontroller med faktisk React-komponent/Chromium ved 390 og 1366 px, syntetiske transportgrenser. Mobil hovedpost åpnes før opsjon prøves. Ingen aksept/avvisningskontroller og ingen live API/e-post. Testen er lagt til eksisterende PR Core Safety-jobb.
- Samme test lager en faktisk jsPDF og kontrollerer font, størrelse og farge for de to rettede og to eksisterende titlene, vanlig brødtekst og uendret 12 500 kr inkl. mva. PDF-tekst er lest med pdftotext, første side rendret med pdftoppm og visuelt gjennomgått.
- Eksisterende `sales-editor-ux-browser-check.mjs`: PASS, 196 kontroller med reelle editorer, media, callbacks og fire bredder.
- PR-scope, release-dokumentasjon og diff mot faktisk main skal være grønne før publisering.

Ingen melding er sendt til avsenderen av feilrapporten. Ingen kundetilbud er publisert, sendt eller akseptert som del av rettelsen. Fysisk mobil/Safari og den rapporterte brukerens arbeidsøkt er ikke attestert av de syntetiske testene.

## Innlogget Preview-prøve før TEST OK

1. Åpne en eksisterende tilbudssak. Velg **Forhåndsvis som kunde**. Lagret tilbud, logo, hovedposter, opsjoner og totalsum skal vises med **Forhåndsvisning – ikke sendt til kunde**. Ingen utsending skjer.
2. På mobil: åpne en hovedpost. Prøv en opsjon, bytt fane/app og kom tilbake. Prøvevalget og leseposisjonen skal beholdes. Lukk med **Tilbake til tilbudet**. Kontroller at samme interne sak/arbeidsflate står åpen.
3. Hvis innloggingsfeilen kommer: logg inn på samme Preview-adresse via lenken i feilmeldingen, gå tilbake og velg **Prøv igjen**. Forhåndsvisningen skal hente kladden. En konto uten tilgang skal fremdeles sperres.
4. På en allerede publisert egnet testversjon: **Last ned tilbud PDF v…**. Kontroller de to mellomtitlene mot Rørleggerarbeider/Snekkerarbeider. En gammel nedlastet PDF endres ikke. Ikke publiser eller send et nytt kundetilbud bare for denne prøven.

Preview/CI-status og eventuell senere Production/demo-verifisering dokumenteres i PR-en. Denne filen dokumenterer kode og utført lokal QA, ikke en gjennomført produksjonssetting.
