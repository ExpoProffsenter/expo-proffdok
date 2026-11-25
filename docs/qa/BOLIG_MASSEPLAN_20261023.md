# Boligprosjekter – masseplan og felles tidslinje, 23. oktober 2026

Miljømål BEGGE. Samme feature-branch og draft PR #278. Leveres kun til Preview/Sandbox frem til Kenneths TEST OK. Main og permanent demo-branch endres ikke.

## Leveranse

«Fremdrift og varsler» har «Planlegg flere boliger», «Flytt datoer samlet» og «Åpne samlet tidslinje». Masseoppsett velger bygg, oppgang, etasje og individuelle boliger. Utvalg beholdes mellom filtre. Rekkefølge er bygg, adresse, etasje, posisjon og bolignummer. Første oppstart, takt (0 = samtidig) og varighet beregnes med alle kalenderdager eller mandag–fredag. Helligdager håndteres manuelt. Malen kan inneholde inntil 20 aktiviteter med varighet og påkrevd-markering; neste aktivitet følger forrige aktivitet i samme bolig. Appens eksisterende 13 standardaktiviteter gjenbrukes. Sist brukte oppsett beholdes som lokal arbeidsmal per bruker/firma/prosjekt/bolig, ikke en ny sentral malbank.

Forhåndsvisningen viser hver aktivitet og dato før én samlet lagring. Maks 400 aktiviteter per operasjon og eksisterende grense 4000 aktive per prosjekt. Eksempel 100 boliger × fire aktiviteter er verifisert. Eksisterende aktiviteter beholdes; UI advarer mot dobbelt oppsett. Identisk nytt forsøk etter ukjent svar bruker samme request-ID. Konflikt gir ingen delvis lagring og bevarer kladden.

Samlet forskyvning tar med planlagte/stoppede aktiviteter uten faktisk oppstart og teller påbegynt/utført som utelatt. Ingen faktisk utførelse oppdiktes eller flyttes automatisk. Serveren kontrollerer sluttresultatet av alle avhengigheter, slik at en hel kjede kan flyttes samlet. Brudd stopper hele transaksjonen. Enkel redigering per aktivitet/rom beholdes for unntak.

Tidslinjen gjenbruker `KshmsProgressBoard`, dato-/dra-/resize-/tastaturmotor og angre. To valgfrie adapteregenskaper (`dateOnly`, `onOpenActivity`) lar Bolig bruke datoer og egen aktivitetsdialog. Ordinære prosjekt-/KS-planer beholder standardoppførsel, dag/klokkeslett, bemanning, deltakere og eksport. Bolig har ingen oppdiktet bemanning eller klokkeplan. Uke/måned, oppgang, boligfilter og 200 rader per side gjør alle aktiviteter tilgjengelige. Søk gjelder gjeldende side. Ulagrede datoendringer bevares på tvers av sider og fokus/reload. Bevisst lukking gjenåpnes ikke av statuslast. Lesere ser tidslinje og aktivitetsdetaljer uten redigeringsknapper.

## Ett grunnlag og sikkerhet

Ingen kopi opprettes i project_progress eller KS/HMS-planlagring. Tidslinjen er en projeksjon av eksisterende `bolig_private.progress_tasks`; kun godkjente datoendringer går tilbake til disse oppgavene. Samme revisjoner styrer ferdigstillingsgrunnlag, varselgodkjenning og gjeldende mottakerkontroll. Berørte beboervarsler krever ny utgave/godkjenning. Masseplanen publiserer ingen varsler. Utsending er fortsatt deaktivert; ingen worker eller eksisterende HR-/KS-varslingsmotor er endret.

Additiv CLI-generert migrasjon 20261022231401_bolig_progress_bulk_planning.sql, oppretter privat batch-funksjon og avgrenset historikkprojeksjon. Eksisterende gateway gjenautoriserer bruker/firma/leder/root, låser root og sjekker revisjon. Én kvittering og historikkrevisjon per batch. Nye oppgaver får bare planlagte felt; datoflytting kan ikke endre status, ansvarlig, faktisk utførelse eller interne notater. Nye avhengigheter må referere tidligere opprettet aktivitet i samme mal/bolig. Arkivert root/bolig/bygg/rom og arbeid med faktisk start avvises. Ingen nye tabellgrants; private hjelpere og anonym gateway er sperret. Boligvise historikkrader filtrerer bort naboens før-/etter-bilder.

## Kontroll

Lokale resultater: 961 PGlite-assertions (tidligere 920 beholdt), 22 dato-/taktassertions, 30 nye Chromium-assertions og eksisterende fremdrift 24 PASS. Felles KS/HMS-planlegger 128, prosjektplanlegger 39, tidslinjekjerne 102 og provider-mockede fremdriftsmailkontroller 22 PASS. Full critical build PASS. Ny nettlesersuite dekker masseutvalg, standardaktiviteter, forhåndsvisning uten skriving, fokus/reload, identisk replay, forskyvning, felles tidslinje/angre, datogjennomgang, gammel revisjon, 390/320 px, leser og tilbakekalt tilgang.

Sandbox: to additive migrasjoner anvendt kun ppvircenkjizeiqdxphj: 20261022231401 (SHA256 6ce8688abe7d5e8bf7bdfe1958ac5cd4cb4465a602a665747c5d803d5b3d13ed) og 20261022232949 (SHA256 7ed68908acb732f8d24847b366fc77f67c16e31b193f425b7c0713dee6b2b264). Den siste beholder public-gateway som SECURITY INVOKER og flytter batch-dispatch inn i allerede autorisert privat workspace; private batch/historikkhjelpere har ingen nye app-grants. Første anvendte migrasjon er urørt. Security advisors 406 før og 406 etter, med uendrede grupper/funnantall. Et midlertidig ekstra funn for eksponert definer ble fjernet av den additive invoker-rettingen; ingen påstand om null eksisterende funn.

Faktisk public-RPC-smoke med syntetisk autentisert demoaktør, ti boliger og 20 aktiviteter: atomisk create/replay, boligfiltrert historikk, samlet kjedeflytting, ingen faktisk utførelse, avhengighetskonflikt med full rollback og deaktivert mail PASS. Alle midlertidige smokerader rullet tilbake. Separat varig syntetisk demo opprettet via public RPC, ikke gjennom UI: «DEMO – Masseplan og tidslinje», reference QA-MASSEPLAN-20261023, root 50533802-2212-4442-bd2e-7cb800597c7f. 60 boliger, 240 påkrevde planlagte aktiviteter, fire etterfølgende arbeid per bolig og to kalenderdager mellom starter fra 26.10.2026. Ingen kontakter, portallenker eller varsler opprettet for denne demoen. Tidligere demoer er urørt.

Felles planleggerfokus/deling har ytterligere 28 assertions PASS; builder 103, portal 27 og ferdigstilling 29 PASS. Build er kjørt på nytt etter siste funksjonsendring. GitHub CI kjører også den nye dato-/takt- og nettlesersuiten. Nøyaktig CI/Preview-status vedlikeholdes i PR #278. Tilkoblet nettleser timet ut ved oppstart av ny innlogget Preview-prøve; full komponent-Chromium og live RPC/database er verifisert separat. Innlogget prøve av ny Preview, fysisk Safari og faktisk mottatt e-post er gjenstående.

## Kort testguide

1. Åpne prosjekt → «Fremdrift og varsler» → «Planlegg flere boliger». Velg bygg/oppgang/etasje og «Velg alle treff». Sett start, takt og arbeid. «Forhåndsvis planen» skal vise alle boligenes datoer før lagring.
2. «Åpne samlet tidslinje»: bytt uke/måned, velg bolig og flytt et planlagt arbeid. «Lagre fremdriftsplan» viser datoene før «Lagre datoendringer». «Angre» gjelder før lagring.
3. «Flytt datoer samlet»: velg boliger, antall dager og forhåndsvis. Påbegynt/utført telles som beholdt. En ugyldig avhengighet skal stoppe hele lagringen.
4. Skriv en mal eller flytt en dato, lukk og åpne igjen/last siden på nytt. Utkastet skal finnes. Kontroller også en enkelt bolig og at varsel med endrede datoer krever ny godkjenning.

Visuell etterkontroll fant at generelle dialogregler gav den nye masseflaten fast full høyde og blokkstil på boligvalg. Dialogens egne klasser overstyrer nå bare dette oppsettet: innholdshøyde, én rullbar flate og boligvalg med avkryssing på samme rad. Permanente DOM-layoutassertions beskytter kaskaden. Ingen generelle boligdialoger er endret.
