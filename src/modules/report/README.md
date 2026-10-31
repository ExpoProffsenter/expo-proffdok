# Prosjektets rapport og PDF

createReportTools eier eksisterende native eksport og utskrift. PDF-layouten må bevare kildeverdier, valgt dokumentsett, immutable signatur-/garantigrunnlag og dagens setWarranty-/arkivgater. QA skal bruke samme generator og jsPDF2.5.1 med syntetisk transport, ikke et alternativt eksempel.

Garantibevisets felt måles med samme font som tegnes. Lange mottaker-/kontaktfelt vises helt; tilleggsider får garantihode. Membransystem/QR holdes sammen. Garantivilkår brytes linjevis. Navy bunnbånd og sidetall får lesbar kontrast og separate linjer. Lang overtagelsesmerknad må avsluttes før dato-, navne- og signaturfeltene tegnes. Forsidens tittel måles etter fontvalg; uten headingbilde beholdes lesbar mørk tekstbakgrunn.

Regresjon: report-warranty-pdf-check.mjs bruker ekte createReportTools og PDF-motor, kontrollerer korte/lange norske data, marger/siste feltverdi, bildeinnbygging og uendrede kildedata. Låst eksport skriver ikke garantistatus; åpen komplett rapport beholder eksisterende ett genereringsstempel. kshms-project-report-react-pdf-check dekker faktisk valg/avbryt/utskrift og ferskt scope/revoke. Dette gir ikke attest på alle signerte prosjektsnapshots, eksterne portaler, fysisk mobil eller vellykket filbro fra innlogget skynett.
