# Orvei – beboere, bygg og delt portal

Arbeidsbranch: feature/bolig-residents-buildings-20261112. Base main d68cf2e530d5ab6afcfe2f97d75150c977bcd64f. Miljømål BEGGE. Ikke produksjonssatt. Ingen ny TEST OK er gitt. Ingen reelle mottakere eller produksjonsdata er brukt.

## Omfang
- XLSX/CSV/innliming til eksisterende boliger med manuell kontroll av kolonner og koblinger.
- Tallbaserte bolignummer, flere eiere på én bolig, én delt portal.
- Valg av ett/flere bygg i samme beboervarsel, eksplisitt mottakerliste.
- Import i appens høyrepanel, fast topp og handlinger; flere eiere i eksisterende boligheditor.

## Utført kontroll
- Lokal PostgreSQL/PGlite: 1782 assertions bestått, inkludert 19 nye kontroller av delt portal, tilbakekalling, atomisk import/retry, duplikater, leser- og firmaskille.
- Lokal React: eksisterende foundation-scenarier bestått; 21 nye importer-/XLSX-/mottakervalgskontroller bestått.
- Bygging og React foundation bestått igjen etter høyrepanel- og hjelpejustering.
- Lokal Chromium stoppet før appstart: socket() failed: Operation not permitted. Ingen visuelle browser-scenarier gjennomført i den kjøringen. Bruk skynett mot sandbox-preview.

## Gjenstår før godkjenning
- Full faktisk importdialog-test, inkl. beholdt utkast, usikkert svar og tilgangstap.
- Installere kun ny migrasjon i sandbox etter kontroll av support-gateway og migrasjonsstatus; ikke produksjon.
- Bekrefte publisert commit og sandbox-binding. Visuell skynett-test på bred og smal skjerm.
- Grønn GitHub-kontroll og Kenneths TEST OK før egen produksjonsplan/main→demo. Support-TEST OK omfatter ikke dette nye funksjonsomfanget.
- Orveis faktiske Excel og fremdriftsplan er ikke mottatt. Importoppsett må avstemmes mot dem.

## Kort brukertest i riktig testmiljø
1. Åpne boligoppsett → Importer beboere fra Excel. Panelet skal ligge til høyre, og lagre/lukk skal være tilgjengelig med lang liste.
2. Bruk syntetiske eiere med example.invalid-adresser. Koble to eiere til bolig 24; kontroller hovedkontakt og begge navn.
3. Lukk og åpne igjen. Kladden skal være bevart. Lagre én gang og kontroller at én bolig har begge eierne.
4. Kontroller samme beboerportal og felles tilvalg. Fjern en ekstra eier; gammel portal skal stoppe. Ikke send reell invitasjon.
5. Velg Flere bygg i et varsel. Kryss av to bygg og fjern ett. Kontroller mottakerlisten uten reell sending.

## Video
V12-redigerbare kilder er hentet fra Library. Kun 3 av 57 scener har cursor-target i opprinnelig tidslinje. Ny videorekkefølge, gjennomgående peker og nye opptak er ikke levert. PR321 er separat teksthjelp og skal ikke beskrives som ferdig revidert video.

## Skynett og samlet mergekontroll
Skynett åpnet permanent demo 12.11. Før innlogging viste appen «Kunne ikke hente FDV-register ... permission denied for function app_support_prepare_request». Read-only SQL bekrefter offentlig pre-request-funksjon har EXECUTE kun for authenticated, mens hook er global. Ny boligmigrasjon er ikke installert. Dette må isoleres og rettes i supportleveransen før samlet test.

Boligarbeidsbranch er opprettet fra eksakt main-baseline. Branch-spesifikk Preview-variabel EXPO_BACKEND_TARGET=sandbox er registrert i Vercel; ingen produksjonsvariabler endret.

Før produksjon: avstem mot faktisk main og support PR322 + companion PR320. Test samlet kandidat, særlig offentlig/innlogget portal, flere eiere, supportskriving/slettesperrer, firmaskille og ordinær tilbudslagring. Grønn status for separate eldre commits er ikke tilstrekkelig. Ny vesentlig supportrettelse krever fornyet vurdering av tidligere TEST OK. Ingen endring av køinnstillinger, ekstra feilsøkingskjøringer eller erstatnings-PR-er.
