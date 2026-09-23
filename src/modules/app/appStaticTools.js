// FASE 24K APPSTATISK KONFIG
// Eksisterende app-branding og vilkårstekst flyttet mekanisk ut av src/main.jsx.

export var EXPO_PROFFDOK_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="g" x1="56" y1="56" x2="456" y2="456" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#08d5d8"/>
        <stop offset="1" stop-color="#0c2a52"/>
      </linearGradient>
    </defs>
    <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#g)"/>
    <rect x="54" y="54" width="404" height="404" rx="92" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="10"/>
    <text x="256" y="224" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="86" font-weight="900" fill="#fff">EXPO</text>
    <text x="256" y="310" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="900" fill="#fff">PD</text>
    <path d="M174 354l44 44 120-132" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
export var expoProffDokIconDataUrl = () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(EXPO_PROFFDOK_APP_ICON_SVG)}`;
export var ensureExpoProffDokHeadTag = (selector, createNode, patchNode) => {
    if (typeof document === "undefined") return null;
    let node = document.head.querySelector(selector);
    if (!node) {
      node = createNode();
      document.head.appendChild(node);
    }
    if (patchNode) patchNode(node);
    return node;
  };
export var ensureExpoProffDokAppBranding = () => {
    if (typeof document === "undefined") return;
    const title = "Expo ProffDok";
    const iconUrl = expoProffDokIconDataUrl();
    document.title = title;
    ensureExpoProffDokHeadTag('meta[name="application-name"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "application-name");
      return meta;
    }, (meta) => meta.setAttribute("content", title));
    ensureExpoProffDokHeadTag('meta[name="apple-mobile-web-app-title"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "apple-mobile-web-app-title");
      return meta;
    }, (meta) => meta.setAttribute("content", title));
    ensureExpoProffDokHeadTag('meta[name="apple-mobile-web-app-capable"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "apple-mobile-web-app-capable");
      return meta;
    }, (meta) => meta.setAttribute("content", "yes"));
    ensureExpoProffDokHeadTag('meta[name="mobile-web-app-capable"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "mobile-web-app-capable");
      return meta;
    }, (meta) => meta.setAttribute("content", "yes"));
    ensureExpoProffDokHeadTag('meta[name="theme-color"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      return meta;
    }, (meta) => meta.setAttribute("content", "#08d5d8"));
    ensureExpoProffDokHeadTag('link[rel="icon"][data-expo-proffdok="true"]', () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "icon");
      link.setAttribute("type", "image/svg+xml");
      link.setAttribute("data-expo-proffdok", "true");
      return link;
    }, (link) => link.setAttribute("href", iconUrl));
    ensureExpoProffDokHeadTag('link[rel="apple-touch-icon"][data-expo-proffdok="true"]', () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "apple-touch-icon");
      link.setAttribute("sizes", "512x512");
      link.setAttribute("data-expo-proffdok", "true");
      return link;
    }, (link) => link.setAttribute("href", iconUrl));
    try {
      const manifest = {
        name: "Expo ProffDok",
        short_name: "ProffDok",
        description: "Prosjektdokumentasjon og FDV for våtrom",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#08d5d8",
        icons: [
          { src: iconUrl, sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
        ]
      };
      const manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }));
      ensureExpoProffDokHeadTag('link[rel="manifest"][data-expo-proffdok="true"]', () => {
        const link = document.createElement("link");
        link.setAttribute("rel", "manifest");
        link.setAttribute("data-expo-proffdok", "true");
        return link;
      }, (link) => {
        const previous = link.getAttribute("href");
        if (previous && previous.startsWith("blob:")) URL.revokeObjectURL(previous);
        link.setAttribute("href", manifestUrl);
      });
    } catch (error) {
      console.warn("Kunne ikke sette appmanifest:", error);
    }
  };
export var warrantyArchiveNotice = "Viktig: Last alltid ned og lagre komplett PDF-rapport på egen maskin, server eller annet sikkert arkiv når prosjektet er ferdig. Expo ProffDok er en dokumentasjonsplattform, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata i hele garanti- eller byggets levetid.";
export var userGuidePdfPath = "/Expo_ProffDok_Brukerveiledning.pdf";
export var adminGuidePdfPath = "/Expo_ProffDok_Adminveiledning.pdf";
export var EXPO_PROFFDOK_TERMS_VERSION = "1.0";
export var EXPO_PROFFDOK_TERMS_TITLE = `Brukervilkår og personvern – versjon ${EXPO_PROFFDOK_TERMS_VERSION}`;
export var expoProffDokTermsSections = [
    {
      title: "1. Bruk av tjenesten",
      text: "Expo ProffDok er et skybasert dokumentasjons- og kvalitetssystem for prosjekter, bilder, sjekklister, FDV, produktdokumentasjon, overtagelse, garanti og kommunikasjon. Tjenesten skal brukes på en forsvarlig og lovlig måte."
    },
    {
      title: "2. Brukerens ansvar",
      text: "Brukeren er ansvarlig for at opplysninger, bilder, dokumenter og personopplysninger som registreres i systemet er korrekte, relevante og lovlige å lagre og dele. Brukeren er også ansvarlig for tilgang som gis til kunder, ansatte og underleverandører."
    },
    {
      title: "3. Prosjektdokumentasjon og lokal lagring",
      text: "Brukeren må selv laste ned og lagre ferdige rapporter, FDV-dokumentasjon, garantibevis og øvrige prosjektdokumenter på egen PC, server eller annet sikkert arkiv. Expo ProffDok er et arbeids- og dokumentasjonsverktøy, men erstatter ikke brukerens eget arkivansvar."
    },
    {
      title: "4. Ingen garanti for permanent lagring",
      text: "Expo ProffDok arbeider for stabil drift og sikker lagring, men gir ingen garanti for ubegrenset eller permanent oppbevaring av prosjektdata, bilder, rapporter eller dokumenter. Data kan gå tapt som følge av tekniske feil, feil bruk, tredjepartsleverandører, endringer i tjenesten eller forhold utenfor vår kontroll."
    },
    {
      title: "5. Personvern og GDPR",
      text: "Tjenesten behandler personopplysninger som navn, e-postadresse, telefonnummer, firmaopplysninger, prosjektinformasjon, bilder og kommunikasjon i den grad dette er nødvendig for å levere tjenesten. Brukeren er ansvarlig for at personopplysninger som legges inn har lovlig behandlingsgrunnlag, og at kunder, ansatte og andre berørte er informert der dette er nødvendig."
    },
    {
      title: "6. Sikkerhet og tilgang",
      text: "Brukeren skal holde innloggingsinformasjon konfidensiell og sørge for at kun personer med tjenstlig behov får tilgang til prosjekter. Delingslenker og kundeportaltilganger skal brukes med forsiktighet."
    },
    {
      title: "7. Garanti og ansvar",
      text: "Eventuelle garantibevis som genereres i Expo ProffDok er dokumentasjon av arbeid og valgt garantiløsning. Selve garantiforpliktelsen ligger hos den utførende virksomheten som utsteder garantien, ikke hos Expo ProffDok som teknisk plattform."
    },
    {
      title: "8. Tjenestens tilgjengelighet",
      text: "Tjenesten leveres slik den til enhver tid foreligger. Det kan forekomme nedetid, vedlikehold, feilretting, endringer eller avvikling av funksjoner."
    },
    {
      title: "9. Aksept av vilkår",
      text: "Ved å godkjenne vilkårene bekrefter brukeren å ha lest og forstått brukervilkår og personvernpunkter, inkludert plikten til å laste ned og lagre egne rapporter og dokumenter lokalt."
    }
  ];
