import React from "react";

const UPDATED = "Sist oppdatert: 29.10.2026";

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
      "Startsiden samler Forespørsel og befaring, Tilbud, Varesøk og bestilling, Prosjekter, HR og HMS/KS og Sjekklister. Du ser bare snarveier til funksjoner du har tilgang til. Min side viser din egen arbeidsdag. Varsler og prosjektoppfølging beholdes under snarveiene.",
      "Verktøy og maler åpner et panel fra høyre med handlinger for arbeidsflaten. Lukk med krysset, Escape eller Tilbake til arbeidet. Utvid arbeidsflaten gir et bredere panel. Å åpne og lukke panelet lagrer eller endrer ikke arbeidet.",
      "I en salgssak ligger arbeidet til venstre og Kundens tilbud til høyre på PC. På mindre skjermer trykker du Kundevisning for å åpne lesefeltet. På PC kan du velge Utvid kundevisning. Tilbake til arbeidet eller Escape lukker det store panelet. Det du arbeider med blir stående.",
      "Kundens tilbud viser grunnlaget som er lagret på saken. Lagre endringer før du kontrollerer dem her. Etiketten forteller om du ser lagret kladd, publisert kundetilbud eller låst akseptert tilbud. Lesefeltet er skrivebeskyttet. Å åpne det publiserer eller sender ikke tilbudet og registrerer ingen nye kundevalg. For eldre publiserte tilbud hentes den lagrede kundeversjonen separat. Får du en hentefeil, trykk Prøv kundevisningen igjen. Hvis versjonen eller tilgangen er endret, gå tilbake til sakslisten og åpne saken på nytt.",
      "Verktøy og maler inne i saken samler handlinger for samme kunde og tilbud, som Rediger kunde, Planlegg befaring og Arbeid med tilbudet. Handlingene følger hvor langt saken har kommet. Velg Tilbake til saken fra en editor eller Tilbake til oversikten fra saksvisningen når disse handlingene vises.",
      "I tilbudsbyggeren kan Verktøy og maler ta deg til Tilbudsmaler eller Lagre tilbudet som mal. Bruk en mal i kladden, gjør endringene og velg Lagre som mal med ønsket navn. Kunde og adresse beholdes. Dette sender ikke tilbudet. Sletting av mal krever den eksisterende bekreftelsen.",
      "Sjekklistemaler på startsiden åpner firmaets sjekklistesentral for dem som kan vedlikeholde maler. Velg Rediger sjekkliste, lagre utkast og publiser når den er klar. Prosjektsjekklister åpner prosjektlisten: velg prosjektet og deretter Sjekklister. En publisert mal endrer ikke kopier som allerede brukes i prosjekter.",
      "I Generelt tilbud er varenavn, antall, enhet og pris lett tilgjengelig. Åpne Varenummer, NOBB og produktlenke eller Bilde og vedlegg ved behov. Lagrede bilder og vedlegg vises fortsatt. Montering og opsjoner bruker de samme handlingene som før.",
      "Alle med proffkatalogtilgang kan bruke Varesøk og Varebestilling i hovedmenyen. Interne Ringside/Expo-brukere med Prissøk finner Varebestilling rett under Prissøk, før Firmaprofil, og som Åpne varebestilling inne i Prissøk. Finn en vare og velg den for å legge den i bestillingen. Antallsfeltet får fokus. Bruk +/−, piltastene eller skriv antallet. Trykk Enter i antallsfeltet for å åpne et nytt varesøk under varelinjene. Enter i søket velger første treff.",
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
    const companyAdminGuide = "Firmaadmin viser firmaet du har valgt øverst. Når du åpner invitasjonsskjemaet på PC, ligger det ved siden av Brukere og tilganger. På mobil kommer de under hverandre. Åpne Inviter en ansatt · velg rolle og tilganger. Velg e-post, rolle og moduler i Legg til ansatt før du trykker Inviter ansatt. Boligprosjekter – brukertilgang kan foldes ut over oversikten. Boligtilganger lagres med en gang når du endrer dem. Valgene vises under Inviterte brukere og settes for en ny bruker ved bekreftet registrering. Eksisterende kontoer beholder hovedmodulene sine; KS/HMS og HR følger de nye firmavalgene. Med HR valgt legges brukeren automatisk til i firmaets HR-register når kontoen er aktiv og registeret er satt opp. Eksisterende medarbeider og leder beholdes. Velg ellers nærmeste leder i HR etterpå. Tilgangene kan senere endres på samme brukerkort. En vanlig proffkunde administrerer bare sitt eget firma. Trykk Lagre tilgang for hovedmoduler og Lagre KS/HMS- og HR-tilgang for firmatilgang. Hovedmoduler gjelder kontoen; KS/HMS og HR gjelder firmaet på siden. Systemadmin kan legge til et ekstra internt arbeidsfirma uten å flytte primærfirma eller historikk. Kontostatus gjelder alle firmaer og styres av systemadministrator.";
    const admin = isSystemAdmin
      ? [
          companyAdminGuide,
          "Systemadmin har ni arbeidsområder i tre grupper: Oppfølging, Forvaltning og Informasjon og drift. Velg et område for å åpne dagens funksjoner. Når et område er åpent, kan du bytte med områdeknappene eller gå tilbake til Oversikt. Velg Firmaer og prosjekter for firmatilgang og prosjektstøtte. Velg Brukere og roller for godkjenning, roller, moduler, prisinnsyn og proffleverandører. På PC ligger hovedområdene i toppmenyen. Alle områder åpner hele den tilgjengelige menyen, inkludert Firmaadmin og Systemadmin når du har tilgang. På mindre skjermer bruker du den vanlige menyen. Fullskjermvisning skjuler toppfeltet og hovedmenyen; Vanlig visning tar dem tilbake.",
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

