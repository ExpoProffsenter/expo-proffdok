# Prosjektets rapport og PDF

createReportTools eier eksisterende native eksport og utskrift. PDF-layouten må bevare kildeverdier, valgt dokumentsett, immutable signatur-/garantigrunnlag og dagens setWarranty-/arkivgater. QA skal bruke samme generator og jsPDF2.5.1 med syntetisk transport, ikke et alternativt eksempel.

Garantibevisets felt måles med samme font som tegnes. Lange mottaker-/kontaktfelt vises helt; tilleggsider får garantihode. Membransystem/QR holdes sammen. Garantivilkår brytes linjevis. Navy bunnbånd og sidetall får lesbar kontrast og separate linjer. Lang overtagelsesmerknad må avsluttes før dato-, navne- og signaturfeltene tegnes. Forsidens tittel måles etter fontvalg; uten headingbilde beholdes lesbar mørk tekstbakgrunn.

Regresjon: report-warranty-pdf-check.mjs bruker ekte createReportTools og PDF-motor, kontrollerer korte/lange norske data, marger/siste feltverdi, bildeinnbygging og uendrede kildedata. Låst eksport skriver ikke garantistatus; åpen komplett rapport beholder eksisterende ett genereringsstempel. kshms-project-report-react-pdf-check dekker faktisk valg/avbryt/utskrift og ferskt scope/revoke. Dette gir ikke attest på alle signerte prosjektsnapshots, eksterne portaler, fysisk mobil eller vellykket filbro fra innlogget skynett.


Boxed PDF-er måler avsenderen i plassen ved logoen og på fortsettelsessider. Hele dokumenttittelen gjentas med linjebryting. Tegnet signatur får layoutmarkøren `kind: signature` i rapportmappingen og vises proporsjonalt innen80×24mm; bildepikslene og historisk signaturgrunnlag endres ikke. Ordinære bilder beholder sin eksisterende størrelse. `project-checklist-signed-pdf-check.mjs` eksporterer gjennom faktisk downloadDocumentPdf med syntetisk readback, og verner både marger, full tittel, lange felt, tegninger, status og siste signaturkontroll. Egen kontroll-PDF er særskilt fra samlet sluttrapport; testen dokumenterer ingen automatisk henting av kontrollhistorikk inn i sluttrapporten.

Signatarens felt og tegning holdes samlet når hele den målte blokken får plass på en ny side. Lange signatarfelt deles fortsatt kontrollert med gjentatt seksjonsoverskrift.
