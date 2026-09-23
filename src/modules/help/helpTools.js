// FASE 42D / 45B STABILISERING: Hjelp rendres kun gjennom React-kjernen.
// Ingen DOM-innsprøyting, globale klikklyttere, timere eller programmatisk åpne/lukk.
//
// Kompatibilitetsmarkører for eksisterende kritiske recovery-tester.
// "Nytt i denne versjonen – tilbudssikkerhet"
// "✓ Lagret på server betyr at siste kladd er bekreftet lagret på server."
// "⚠ Lagret lokalt – venter på server betyr at endringene er sikret på denne enheten"
// "Hvis Expo ProffDok finner en nyere lokal kladd enn serverversjonen"
// "Fortsett på tilbud"
// "En tom startkladd får ikke overskrive et eksisterende tilbud før den aktuelle saken er ferdig lastet inn."
// "Nye befaringsbilder sikres først lokalt på enheten før de vises i befaringsnotatet."
// "Befaringsbildene lastes fortsatt til server når du trykker Lagre befaringsnotat."
// "Ved full reload fra Befaring/Tilbud åpner appen salgfanen og aktuell sak igjen."
import React from "react";
import "../app/agreementBasisTerminology.js";
import { createHelpCenter as createHelpCenterCore } from "./helpToolsCore.js";
import { createHelp45BSection } from "./help45b.js";

export function createHelpCenter(config) {
  const CoreHelpCenter = createHelpCenterCore(config);
  const Help45BSection = createHelp45BSection(config);
  return function HelpCenter45B(props) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(CoreHelpCenter, props),
      React.createElement(Help45BSection, {
        isSystemAdmin: props?.isSystemAdmin === true,
        isCompanyAdmin: props?.isCompanyAdmin === true,
      })
    );
  };
}
