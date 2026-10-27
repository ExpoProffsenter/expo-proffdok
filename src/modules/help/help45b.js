import React from "react";

const UPDATED = "Sist oppdatert: 27.10.2026";

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
      "Alle med proffkatalogtilgang kan bruke Varesøk og Varebestilling i hovedmenyen. Finn en vare og velg den for å legge den i bestillingen. Åpne Varebestilling for å justere antall.",
      "Velg eller skriv inn mottakeradresse. Lagre mottaker gjør adressen tilgjengelig for senere bestillinger i firmaet. Fyll ut leveringsadresse og velg om tidspunktet skal avtales eller om du ønsker dato og klokkeslett (norsk tid).",
      "Trykk Se over bestillingen og kontroller varene og mottakeren før Send bestilling. Bestillingsmailen har Cordel ASCII og Excel med samme varer og antall, og ber mottakeren sende ordrebekreftelse med leveringstidspunkt til bestillerens registrerte e-postadresse.",
      "Hvis svar på sendingen mangler: bruk Prøv samme sending igjen. Samme bestillings-ID beholdes også etter omlasting, slik at et usikkert sendesvar ikke lager en ny bestilling. Sending bekreftet av e-posttjenesten betyr ikke at mottakeren har bekreftet ordren.",
      "Systemadmin gir firmaet tilgang til bare de leverandørene firmaet skal kunne søke i. Andre leverandører vises ikke i proff-vareregisteret.",
      "Rabatt settes per firma og leverandør. «Din nto pris» beregnes fra Kundepris eks. mva. i vareregisteret.",
      "Kundepris eks. mva. brukes samtidig som foreslått salgspris når varen legges i tilbudet. Salgsprisen kan endres før tilbudet sendes.",
      "Interne brukere kan på mobil skanne EAN/GTIN i varesøket på en aktiv tilbudspost eller opsjon. Velg riktig treff før varen legges inn; manuelt søk fungerer fortsatt.",
      "Bruk «Forhåndsvis som kunde» før utsending for å kontrollere logo, priser inkl. mva., opsjoner, vilkår og totalsum uten å publisere tilbudet eller sende e-post.",
      "Forhåndsvisningen åpnes i et eget vindu inne i appen på både PC og mobil og bruker samme innlogging. Trykk Tilbake til tilbudet for å lukke vinduet. Vanlig fanebytte bevarer opsjonene du prøver. Prøvevalg lagres ikke i tilbudet. Ved en reell utlogging må du logge inn i appen igjen.",
      "Hvis tilbudet er endret mens kunden ser på det, vises en beskjed om å hente tilbudet på nytt. En avvist aksept gir ingen kvittering.",
      "Når kunden aksepterer kan mindre oppdrag videreføres som Enkel ordre, mens større oppdrag kan aktiveres som ordinært prosjekt.",
      "Aksepterte varetilbud har Bestillingsgrunnlag med varenummer, antall og relevante produktidentifikatorer. Pris og intern nto-pris skal ikke være med i bestillingslisten.",
      "I Enkel ordre kan fremdriftsplan, FDV, bilder, relevante sjekklister, UE-bidrag og sluttdokumentasjon brukes etter behov.",
      "Enkel ordre har en forenklet arbeidsflate og oppretter ikke kundeportal. Velg ordinært prosjekt dersom oppdraget trenger full prosjekt-/kundeportalflyt."
    ];
    const important = [
      "Ringsides ERP-nettopris, innkjøpsrabatt, DG og påslag er intern informasjon og skal aldri vises til proffkunde eller sluttkunde.",
      "«Din nto pris» er proffkundens beregnede pris og må ikke forveksles med Ringsides interne ERP-nettopris.",
      "Firmaadmin bestemmer hvilke andre brukere i firmaet som kan se «Din nto pris», men kan ikke gi seg selv tilgang. Denne rettigheten skal ikke gis bredere enn nødvendig.",
      "Transport, frakt, timer og øvrige leveranser kan brukes som ordinære tilbudsposter.",
      "Kun Systemadministrator kan aktivere Generelle tilbud / Proff-vareregister for et firma. Tilgangen gjelder automatisk alle nåværende og nye brukere i firmaet. Enkel ordre velges først etter kundeaksept.",
      "Tilgang til Expo ProffDok forutsetter at virksomheten oppfyller gjeldende brukervilkår, inkludert SoPro-forutsetningen."
    ];
    const companyAdminGuide = "Firmaadmin viser firmaet du har valgt øverst. Velg e-post, rolle og moduler i Legg til ansatt før du trykker Inviter ansatt. Valgene vises under Inviterte brukere og settes for en ny bruker ved bekreftet registrering. Eksisterende kontoer beholder hovedmodulene sine; KS/HMS og HR følger de nye firmavalgene. Med HR valgt legges brukeren automatisk til i firmaets HR-register når kontoen er aktiv og registeret er satt opp. Eksisterende medarbeider og leder beholdes. Velg ellers nærmeste leder i HR etterpå. Tilgangene kan senere endres på samme brukerkort. En vanlig proffkunde administrerer bare sitt eget firma. Trykk Lagre tilgang for hovedmoduler og Lagre KS/HMS- og HR-tilgang for firmatilgang. Hovedmoduler gjelder kontoen; KS/HMS og HR gjelder firmaet på siden. Systemadmin kan legge til et ekstra internt arbeidsfirma uten å flytte primærfirma eller historikk. Kontostatus gjelder alle firmaer og styres av systemadministrator.";
    const admin = isSystemAdmin
      ? [
          companyAdminGuide,
          "Systemadmin administrerer firma, brukere, roller, modultilganger, prisinnsyn og proffleverandører fra Systemadmin → Firmaer, brukere og tilganger.",
          "Firma på brukerkortet viser brukerens lagrede firma også når navnet har ekstra mellomrom eller ulik bruk av store og små bokstaver. Velg et annet registrert firma og bekreft for å flytte brukeren. Å velge samme firma på nytt endrer ingenting.",
          "«Generelle tilbud / Proff vareregister» aktiveres én gang på firmaet og gjelder alle firmaets brukere. Enkel ordre er ikke en egen modultilgang, men et valg etter kundeaksept.",
          "Brukervilkårstatus vises separat fra firmaets leverandørtilgang og brukerens modultilgang. Brukeren må fortsatt godkjenne gjeldende vilkår i den ordinære innloggingsflyten.",
          "Firmaene vises kollapset. Åpne ett firma om gangen; leverandør/rabatt vises øverst og firmaets brukerkort vises nedenfor.",
          "Standardforslaget er FlisLab AS 40 %, FlisLabFLISER 40 %, Askøy 40 % og Baden Haus 30 %. Forslaget må aktiveres bevisst og overskriver ikke eksisterende aktive rabatter.",
          "Nye firma må godkjennes av Systemadmin. En bruker som registrerer seg fra en gyldig invitasjon fra Firmaadmin, kobles automatisk til det godkjente firmaet og trenger ikke en ny Systemadmin-godkjenning.",
          "Godkjenning, deaktivering, firma, rolle, øvrige moduler og «Din nto pris» beholdes på brukerens eksisterende brukerkort. Leverandør/rabatt og Generelle tilbud er firmaegenskaper i samme samlede seksjon."
        ]
      : isCompanyAdmin
        ? [companyAdminGuide, "Under Firmaadmin → Inviterte brukere kan du velge Send invitasjon på nytt. Rolle og tilganger beholdes. E-posten sendes først når du trykker; eventuell feil vises ved invitasjonen. Firmaadmin viser bare ansatte i valgt firma. Oversikten over alle firmaer hører til Systemadmin. Firmaadmin kan styre hvilke andre brukere i eget firma som får se «Din nto pris», men kan ikke gi seg selv tilgang. Leverandørtilgang og firmarabatt styres av Systemadmin."]
        : [];

    return React.createElement(
      Section,
      { title: "🛒 Proff vareregister, Generelt tilbud og Enkel ordre" },
      React.createElement(
        "details",
        { className: "module-guide ux-reference helpCommerceReference", style: { borderColor: "#b9dde2", background: "#f8feff" } },
        React.createElement("summary", null, "Vis Proff-veiledning og rolleinformasjon"),
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
