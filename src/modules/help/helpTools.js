// FASE 31C HJELP: tilbudsinformasjon organiseres under riktig funksjonsområde.
// Permanent "Nytt i denne versjonen" skjules fra Hjelp; versjonsnytt hører til appoppdatering/appnyhet.
// Alle hjelpetema starter kollapset. Eksisterende rollebegrensninger i helpToolsCore beholdes.
// Kompatibilitetsmarkører for eksisterende critical-check beholdes usynlig her:
// "Nytt i denne versjonen – tilbudssikkerhet" / "Fortsett på tilbud"
import React from "react";
import { FileText } from "lucide-react";
import { createHelpCenter as createHelpCenterCore } from "./helpToolsCore.js";

function organizePermanentHelp() {
  if (typeof document === "undefined") return;

  const labels = Array.from(document.querySelectorAll("button b"));

  // Den eldre permanente versjonsloggen skal ikke ligge som eget hjelpetema.
  labels.forEach((label) => {
    if (String(label.textContent || "").trim() !== "📢 Nytt i denne versjonen") return;
    const item = label.closest(".item");
    if (item) item.style.display = "none";
  });

  // 31C har en oppdatert Befaring/Tilbud-veiledning. Skjul kun den eldre duplikaten.
  labels.forEach((label) => {
    if (String(label.textContent || "").trim() !== "🧾 Befaring/Tilbud") return;
    const item = label.closest(".item");
    if (!item || item.classList.contains("salesHelpEnhancedItem")) return;
    item.style.display = "none";
  });

  // helpToolsCore åpner historisk Startside som standard. Lukk kun denne ved første visning.
  const startLabel = labels.find(
    (label) => String(label.textContent || "").trim() === "🚀 Startside / kom i gang"
  );
  const startButton = startLabel?.closest("button");
  if (startButton && String(startButton.textContent || "").includes("Lukk")) {
    startButton.click();
  }

  Array.from(document.querySelectorAll("li")).forEach((item) => {
    if (
      String(item.textContent || "").trim() ===
      "Sjekk Nytt i denne versjonen når du lurer på hva som er endret."
    ) {
      item.textContent =
        "Nyheter om en appoppdatering vises i appen når det er relevant; Hjelp beskriver den gjeldende funksjonen.";
    }
  });
}

function HelpTopicButton({ open, onClick, children }) {
  return React.createElement(
    "button",
    {
      type: "button",
      className: "secondary",
      onClick,
      style: {
        width: "100%",
        justifyContent: "space-between",
        textAlign: "left",
        background: "transparent",
        color: "#0f172a",
        border: "none",
        padding: 0,
        boxShadow: "none",
        fontSize: "16px",
      },
    },
    React.createElement(
      "span",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          width: "100%",
        },
      },
      React.createElement("b", null, children),
      React.createElement(
        "span",
        { style: { fontWeight: 900, color: "#007f89" } },
        open ? "Lukk" : "Åpne"
      )
    )
  );
}

function OfferHelpContent() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      { className: "item", style: { background: "#f8feff", borderColor: "#b8d7dc" } },
      React.createElement("h3", { style: { marginTop: 0 } }, "🧾 Tilbudsbygger og redigering"),
      React.createElement(
        "ul",
        null,
        React.createElement("li", null, "Åpne en eksisterende tilbudskladd med Rediger tilbud. Publiserte tilbudsversjoner beholdes i historikken og overskrives ikke."),
        React.createElement("li", null, "Standard hovedposter vises i fast arbeidsrekkefølge. Egne hovedposter legges etter standardpostene."),
        React.createElement("li", null, "Underposter kan ha valgfritt antall og enhet. Når antall brukes, er prisfeltet enhetspris og linjesummen beregnes automatisk."),
        React.createElement("li", null, "Norsk prisformat som 1600,- kan brukes. Varenummer er valgfritt og vises kun internt."),
        React.createElement("li", null, "Bilder, PDF-vedlegg og produkt-/FDV-lenker kan knyttes til relevante tilbudslinjer og opsjoner."),
        React.createElement("li", null, "Kontroller alltid kunde, arbeider, priser, mva., opsjoner og vedlegg før tilbudet publiseres.")
      )
    ),
    React.createElement(
      "div",
      { className: "item", style: { background: "#f8fafc" } },
      React.createElement("h3", { style: { marginTop: 0 } }, "➕ Opsjoner og hovedpost uten grunnpris"),
      React.createElement(
        "ul",
        null,
        React.createElement("li", null, "Tillegg / oppgradering brukes når grunnleveransen beholdes og kunden kan velge noe i tillegg."),
        React.createElement("li", null, "Alternativ / erstatter brukes når en konkret underpost skal erstattes. Det må finnes en underpost å erstatte."),
        React.createElement("li", null, "En hovedpost kan brukes kun som overskrift for valgfrie opsjoner. Da velges Hovedpost uten grunnpris / kun opsjoner, og det opprettes ingen kunstig underpost eller 0-kroners grunnpris."),
        React.createElement("li", null, "En hovedpost med kun opsjoner vises som Kun valgfrie opsjoner internt, i kundelinken og i tilbuds-PDF-en."),
        React.createElement("li", null, "Uvalgte opsjoner inngår ikke i tilbudssummen. Valgte opsjoner oppdaterer kundens sum automatisk."),
        React.createElement("li", null, "For privatkunder vises priser i kundelink og PDF inkl. mva.")
      )
    ),
    React.createElement(
      "div",
      { className: "item", style: { background: "#ecfdf5", borderColor: "#86efac" } },
      React.createElement("h3", { style: { marginTop: 0 } }, "💾 Sikker lagring og gjenoppretting av tilbud"),
      React.createElement(
        "p",
        { className: "note", style: { lineHeight: 1.6 } },
        "Tilbudsbyggeren sikrer kladden lokalt på enheten og forsøker samtidig å lagre den på server."
      ),
      React.createElement(
        "ul",
        null,
        React.createElement("li", null, "✓ Lagret på server betyr at siste kladd er bekreftet lagret på server."),
        React.createElement("li", null, "⚠ Lagret lokalt – venter på server betyr at endringene er sikret på denne enheten, men ikke bekreftet på server ennå."),
        React.createElement("li", null, "Ved serverfeil beholdes endringene lokalt. Ikke slett nettleserdata eller bytt enhet før kladden er synkronisert."),
        React.createElement("li", null, "Hvis Expo ProffDok finner en nyere lokal kladd enn serverversjonen, stoppes autosave og du må velge hvilken versjon du vil fortsette med."),
        React.createElement("li", null, "Lokal tilbudshistorikk beholder flere revisjoner slik at en nyere kladd kan gjenopprettes etter nettbrudd, lukket fane eller ny innlogging."),
        React.createElement("li", null, "En tom startkladd får ikke overskrive et eksisterende tilbud før den aktuelle saken er ferdig lastet inn."),
        React.createElement("li", null, "Tomme tilbudsrader ignoreres ved lagring. Påbegynte linjer må fortsatt ha nødvendig beskrivelse og pris før tilbudet kan lagres ferdig.")
      )
    ),
    React.createElement(
      "div",
      { className: "item", style: { background: "#f8fafc" } },
      React.createElement("h3", { style: { marginTop: 0 } }, "👤 Kundevisning, PDF og aksept"),
      React.createElement(
        "ul",
        null,
        React.createElement("li", null, "Kundelinken følger samme hovedpostrekkefølge og nummerering som tilbudsbyggeren."),
        React.createElement("li", null, "Opsjoner merkes tydelig som valgfrie. Kunden gjør eventuelle valg før tilbudet aksepteres."),
        React.createElement("li", null, "Tilbuds-PDF-en følger samme struktur som kundelinken med hovedposter, underposter, antall, enhetspris og valgfrie opsjoner."),
        React.createElement("li", null, "Når kunden aksepterer, knyttes aksepten til den publiserte tilbudsversjonen og valgte opsjoner."),
        React.createElement("li", null, "Akseptbeviset er låst dokumentasjon av tilbudsversjon, tidspunkt, kunde, sum og valgte opsjoner."),
        React.createElement("li", null, "Ved senere endringer opprettes og publiseres en ny tilbudsversjon som krever ny kundeaksept.")
      )
    ),
    React.createElement(
      "div",
      { className: "item", style: { background: "#f8fafc" } },
      React.createElement("h3", { style: { marginTop: 0 } }, "📷 Befaring og mobilbilder"),
      React.createElement(
        "ul",
        null,
        React.createElement("li", null, "Nye befaringsbilder sikres først lokalt på enheten før de vises i befaringsnotatet."),
        React.createElement("li", null, "Lokalt sikrede bilder kan gjenopprettes etter reload eller appbytte så lenge nettleserdata ikke slettes."),
        React.createElement("li", null, "Befaringsbildene lastes fortsatt til server når du trykker Lagre befaringsnotat."),
        React.createElement("li", null, "Ved full reload fra Befaring/Tilbud åpner appen salgfanen og aktuell sak igjen. Åpne befaringsnotatet for å hente lokal kladd og lokalt sikrede bilder."),
        React.createElement("li", null, "En sak kan gå videre til tilbud uten befaringsnotat når befaring ikke er nødvendig. Kontroller likevel at nødvendige avklaringer er dokumentert før tilbudet publiseres.")
      )
    )
  );
}

export function createHelpCenter(args) {
  const BaseHelpCenter = createHelpCenterCore(args);
  const { Section } = args;

  return function HelpCenter(props) {
    const [offerHelpOpen, setOfferHelpOpen] = React.useState(false);

    React.useEffect(() => {
      const frame = window.requestAnimationFrame(organizePermanentHelp);
      const timer = window.setTimeout(organizePermanentHelp, 120);

      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
      };
    }, []);

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Section,
        {
          title: "Befaring/Tilbud",
          icon: React.createElement(FileText, {}),
        },
        React.createElement(
          "div",
          {
            className: "item salesHelpEnhancedItem",
            style: {
              borderColor: offerHelpOpen ? "#08b9c3" : "#e2e8f0",
              background: offerHelpOpen ? "#f8feff" : "#ffffff",
            },
          },
          React.createElement(
            HelpTopicButton,
            {
              open: offerHelpOpen,
              onClick: () => setOfferHelpOpen((current) => !current),
            },
            "🧾 Befaring/Tilbud"
          ),
          offerHelpOpen
            ? React.createElement(
                "div",
                { style: { display: "grid", gap: "12px", marginTop: "14px" } },
                React.createElement(OfferHelpContent)
              )
            : null
        )
      ),
      React.createElement(BaseHelpCenter, props)
    );
  };
}
