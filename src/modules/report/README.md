# Prosjektets rapport og PDF

createReportTools eier eksisterende native eksport og utskrift. PDF-layouten må bevare kildeverdier, valgt dokumentsett, immutable signatur-/garantigrunnlag og dagens setWarranty-/arkivgater. QA skal bruke samme generator og jsPDF2.5.1 med syntetisk transport, ikke et alternativt eksempel.

Garantibevisets felt måles med samme font som tegnes. Lange mottaker-/kontaktfelt vises helt; tilleggsider får garantihode. Membransystem/QR holdes sammen. Garantivilkår brytes linjevis. Navy bunnbånd og sidetall får lesbar kontrast og separate linjer. Lang overtagelsesmerknad må avsluttes før dato-, navne- og signaturfeltene tegnes. Forsidens tittel måles etter fontvalg; uten headingbilde beholdes lesbar mørk tekstbakgrunn.

Regresjon: report-warranty-pdf-check.mjs bruker ekte createReportTools og PDF-motor, kontrollerer korte/lange norske data, marger/siste feltverdi, bildeinnbygging og uendrede kildedata. Låst eksport skriver ikke garantistatus; åpen komplett rapport beholder eksisterende ett genereringsstempel. kshms-project-report-react-pdf-check dekker faktisk valg/avbryt/utskrift og ferskt scope/revoke. Dette gir ikke attest på alle signerte prosjektsnapshots, eksterne portaler, fysisk mobil eller vellykket filbro fra innlogget skynett.


Boxed PDF-er måler avsenderen i plassen ved logoen og på fortsettelsessider. Hele dokumenttittelen gjentas med linjebryting. Tegnet signatur får layoutmarkøren `kind: signature` i rapportmappingen og vises proporsjonalt innen80×24mm; bildepikslene og historisk signaturgrunnlag endres ikke. Ordinære bilder beholder sin eksisterende størrelse. `project-checklist-signed-pdf-check.mjs` eksporterer gjennom faktisk downloadDocumentPdf med syntetisk readback, og verner både marger, full tittel, lange felt, tegninger, status og siste signaturkontroll. Egen kontroll-PDF er særskilt fra samlet sluttrapport; samlet rapport har nå eget eksplisitt kontrollvalg og separat native regresjonsprøve.

Signatarens felt og tegning holdes samlet når hele den målte blokken får plass på en ny side. Lange signatarfelt deles fortsatt kontrollert med gjentatt seksjonsoverskrift.

Komplett rapport måler Sopro-/sjekklistekategorier med faktisk overskriftsfont, reserverer plass før første kontrollrad og gjentar full kategori ved kontrollradens sidebrudd. Samme originaltekst/antall og svar beholdes. Native garanti-PDF-prøven bruker begge uendrede AEB-/FDF-kilder med14/19punkter. Den nettverksisolerte QR-providerfeilen er bare fallback-bevis.

PDF-innholdslisten tar med Vernerunder / kontroller og Risikovurderinger 5x5 når de finnes i det valgte rapportgrunnlaget. Uvalgte typer får ingen tom innholdsrad. Den faktiske React/jsPDF-prøven kontrollerer valgt, ikke-valgt og bare utkast-vernerunde, og inngår i app-ux-kjeden. Den kan lese bytegrunnlaget med PDF.js eller CI-oppsettets eksisterende Poppler uten nye avhengigheter. Dette endrer ikke hvilke dokumenter velgeren eller snapshot-lesingen tillater.


## Fullførte prosjektkontroller i samlet rapport

`useKshmsProjectReport` tilbyr prosjektkontroller ved gyldig bruker-/firma-/prosjektscope også uten KS/HMS-lisens. Bare KS/HMS-gruppene bruker den eksisterende lisensgaten og deres private lesekall. `projectControlReport.mjs` bruker uendret `project_checklist_state`; kun fullførte, gyldige lagrede rader tilbys. Brukeren velger eksplisitt. Utkast tas ikke med. Lagrede signaturidentiteter og tegninger gjenbrukes; historiske rader uten tegning merkes av eksisterende native mapper. Ingen signering eller backfill skjer under rapportgenerering.

Vanlige bilder hentes gjennom eksisterende filresolver og bildelaster før mapperens dokumenter fryses. Feil på ett bilde blokkerer hele eksporten; fil-URL-er følger ikke eksporten. Begge eventuelle tegninger beholder `kind: signature`. Vanlige vedlegg listes med navn og krav om separat originaldeling.

Valgt råsett dypkopieres og sammenlignes i sin helhet mot fersk lesning etter bildene og rett før `doc.save`/HTML-skriving i begge utskriftsveier. Samme revisjon med endret innhold, bortfalt tilgang eller endret scope/eksportsekvens avviser eksporten. Garanti-/arkivgater og eksisterende rapportmotor eier fortsatt lagring. Prosjektkontroller er ikke automatisk inkludert.

`project-control-report-check.mjs` dekker kontrakt/metadata/bilder/feil og native React/PDF-prøven dekker prosjektbruker uten KS/HMS, signert og historisk kontroll, siste lesegate og feil i PDF/begge printveier. Syntetisk transport er ikke attest på separate live innlogginger eller skyens filbro.
