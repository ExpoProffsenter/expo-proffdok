// FASE 30C2 HJELP: Tilbudskladd, recovery, lagringsstatus og trygg vei fra befaring til tilbud.
import React from "react";
import { FileText } from "lucide-react";
import { createHelpCenter as createHelpCenterCore } from "./helpToolsCore.js";

export function createHelpCenter(args) {
  const BaseHelpCenter = createHelpCenterCore(args);
  const { Section } = args;

  return function HelpCenter(props) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Section,
        {
          title: "Nytt i denne versjonen – tilbudssikkerhet",
          icon: React.createElement(FileText, {}),
        },
        React.createElement(
          "div",
          {
            className: "item",
            style: {
              background: "#ecfdf5",
              borderColor: "#86efac",
            },
          },
          React.createElement("h3", { style: { marginTop: 0 } }, "✅ Tryggere tilbudskladd og gjenoppretting"),
          React.createElement(
            "p",
            { className: "note", style: { lineHeight: 1.6 } },
            "Oppdatert 24.08.2026. Tilbudsbyggeren lagrer kladden lokalt på enheten og forsøker samtidig å lagre den på server."
          ),
          React.createElement(
            "ul",
            null,
            React.createElement("li", null, "✓ Lagret på server betyr at siste kladd er bekreftet lagret på server."),
            React.createElement("li", null, "⚠ Lagret lokalt – venter på server betyr at endringene er sikret på denne enheten, men ikke bekreftet på server ennå."),
            React.createElement("li", null, "Ved serverfeil beholdes endringene lokalt. Ikke slett nettleserdata eller bytt enhet før kladden er synkronisert."),
            React.createElement("li", null, "Hvis Expo ProffDok finner en nyere lokal kladd enn serverversjonen, stoppes autosave og du må velge hvilken versjon du vil fortsette med."),
            React.createElement("li", null, "Lokal tilbudshistorikk beholder flere revisjoner slik at en nyere kladd kan gjenopprettes etter nettbrudd, lukket fane eller ny innlogging."),
            React.createElement("li", null, "Tomme tilbudsrader ignoreres ved lagring, mens påbegynte linjer fortsatt må ha nødvendig beskrivelse og beløp før tilbudet kan lagres ferdig.")
          )
        ),
        React.createElement(
          "div",
          { className: "item", style: { background: "#f8fafc" } },
          React.createElement("h3", { style: { marginTop: 0 } }, "🧾 Befaring → tilbud"),
          React.createElement(
            "ul",
            null,
            React.createElement("li", null, "En sak i Befaring kan gå videre til tilbud selv om befaringsnotat ikke er nødvendig."),
            React.createElement("li", null, "Hvis saken allerede har et tilbudsutkast, vises Fortsett på tilbud i stedet for å opprette et nytt tilbud."),
            React.createElement("li", null, "Før tilbud opprettes viser saken om befaringsnotater eller bilder mangler, slik at dette kan kontrolleres bevisst."),
            React.createElement("li", null, "Kontroller alltid kunde, arbeider, priser, mva., opsjoner og vedlegg før tilbudet publiseres til kunden.")
          ),
          React.createElement(
            "p",
            { className: "note", style: { marginBottom: 0 } },
            "Denne versjonen styrker tilbudskladd og tilbudsrecovery. Videre sikring av mobilbefaringsbilder ved dvale/offline testes separat før den tas i produksjon."
          )
        )
      ),
      React.createElement(BaseHelpCenter, props)
    );
  };
}
