import React from "react";

const UPDATED = "Sist oppdatert: 24.09.2026";

function List({ items = [] }) {
  return React.createElement(
    "ul",
    { style: { marginTop: 8 } },
    items.map((item, index) => React.createElement("li", { key: `${index}-${item}` }, item))
  );
}

export function createHelp45BSection({ Section }) {
  return function Help45BSection({ isSystemAdmin = false, isCompanyAdmin = false }) {
    const workflow = [
      "Systemadmin gir firmaet tilgang til bare de leverandørene firmaet skal kunne søke i. Andre leverandører vises ikke i proff-vareregisteret.",
      "Rabatt settes per firma og leverandør. «Din nto pris» beregnes fra Kundepris eks. mva. i vareregisteret.",
      "Kundepris eks. mva. brukes samtidig som foreslått salgspris når varen legges i tilbudet. Salgsprisen kan endres før tilbudet sendes.",
      "Bruk «Forhåndsvis som kunde» før utsending for å kontrollere logo, priser inkl. mva., opsjoner, vilkår og totalsum uten å publisere tilbudet eller sende e-post.",
      "Når kunden aksepterer kan mindre oppdrag videreføres som Enkel ordre, mens større oppdrag kan aktiveres som ordinært prosjekt.",
      "Aksepterte varetilbud har Bestillingsgrunnlag med varenummer, antall og relevante produktidentifikatorer. Pris og intern nto-pris skal ikke være med i bestillingslisten.",
      "I Enkel ordre kan fremdriftsplan, FDV, bilder, relevante sjekklister, UE-bidrag og sluttdokumentasjon brukes etter behov.",
      "Enkel ordre har en forenklet arbeidsflate og oppretter ikke kundeportal. Velg ordinært prosjekt dersom oppdraget trenger full prosjekt-/kundeportalflyt."
    ];
    const important = [
      "Ringsides ERP-nettopris, innkjøpsrabatt, DG og påslag er intern informasjon og skal aldri vises til proffkunde eller sluttkunde.",
      "«Din nto pris» er proffkundens beregnede pris og må ikke forveksles med Ringsides interne ERP-nettopris.",
      "Firmaadmin bestemmer hvilke brukere i firmaet som kan se «Din nto pris». Denne rettigheten skal ikke gis bredere enn nødvendig.",
      "Transport, frakt, timer og øvrige leveranser kan brukes som ordinære tilbudsposter.",
      "Tilgang til Expo ProffDok forutsetter at virksomheten oppfyller gjeldende brukervilkår, inkludert SoPro-forutsetningen."
    ];
    const admin = isSystemAdmin
      ? [
          "Systemadmin administrerer proffkundens leverandørtilgang og rabatt i Systemadmin → Proff vareregister.",
          "Standardforslaget er FlisLab AS 40 %, FlisLabFLISER 40 %, Askøy 40 % og Baden Haus 30 %. Forslaget må aktiveres bevisst og overskriver ikke eksisterende aktive rabatter.",
          "Godkjenning av bruker/firma og ordinære modulroller skal fortsatt gjøres i den eksisterende Systemadmin-flyten. Proff vareregister er et tillegg og skal ikke brukes som omvei rundt godkjenning."
        ]
      : isCompanyAdmin
        ? ["Firmaadmin kan styre hvem i eget firma som får se «Din nto pris». Leverandørtilgang og firmarabatt styres av Systemadmin."]
        : [];

    return React.createElement(
      Section,
      { title: "🛒 Proff vareregister / Enkel ordre" },
      React.createElement(
        "div",
        { className: "item", style: { borderColor: "#b9dde2", background: "#f8feff" } },
        React.createElement("small", { style: { display: "block", marginBottom: 8, color: "#52616b", fontWeight: 800 } }, UPDATED),
        React.createElement("p", { className: "note", style: { marginTop: 0 } }, "Proffløsningen bruker den samme tilbudsmotoren som øvrige tilbud, men begrenser varesøk og prisinnsyn etter firmaets avtalte leverandører og brukerrettigheter."),
        React.createElement("h4", null, "Arbeidsflyt"),
        React.createElement(List, { items: workflow }),
        React.createElement("h4", null, "Viktig"),
        React.createElement(List, { items: important }),
        admin.length ? React.createElement(React.Fragment, null, React.createElement("h4", null, isSystemAdmin ? "Systemadmin" : "Firmaadmin"), React.createElement(List, { items: admin })) : null
      )
    );
  };
}
