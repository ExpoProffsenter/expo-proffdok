// Generated complete main.jsx from the latest live source.
// FASE 7 Deploy 2D: Garanti som prosjektoppsett, fane flyttet og ekstra deduplisering av garantipunkter.
// FASE 7 Deploy 3C: Avvikshistorikk i rapport/PDF med original avvikstekst og lukkekommentar.
// FASE 7 Deploy 3B: Mobiljustering av sjekklister, bilder og statusknapper uten logikkendringer.
// FASE 7 Deploy 3: Profesjonelt garantibevis i PDF, arkiveringsvarsel og krav om nedlastet sluttrapport.
// FASE 7 Deploy 2F: Garantipunkter flettet inn i riktig sjekklisteflyt, uten doble sjekkpunkter.
// FASE 7 Deploy 2E: Redusert overlapp mellom generelle punkter og Sopro garantipunkter.
// FASE 7 Deploy 2D: Garanti som prosjektoppsett og flyttet garanti-fane.
// FASE 7 Deploy 2C: Tydelig merking av Sopro garantipunkter og egen garantifremdrift.
// FASE 7 Deploy 2: Dynamiske Sopro-sjekklister koblet til garantimotor.
// FASE 7 Deploy 1: Garantimodul og datamodell for 12 års dokumentert tetthetsgaranti.
// FASE 5 v2: klikkbar bildevisning i stor modal.
// FASE 5 v1: prosjektinformasjon/beskrivelse + synlig prosjektinfo i delingslenker.
// Admin: old FDV-register UI removed; Produktmaster is now the active admin document register.
import React, * as ReactNS from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck } from 'lucide-react';
import './style.css';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_client = { createRoot };
const import_supabase_js = { createClient };
const import_lucide_react = { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck };
const import_jsx_runtime = { jsx, jsxs, Fragment };
  var supabase = (0, import_supabase_js.createClient)(
    "https://dqffxflaoyarbxyiyhop.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE"
  );
  var uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  var productSections = [
    { title: "Avretting / st\xF8peprodukter", items: ["Sopro VS582 Avretting", "Sopro 3.50 Avretting", "Sopro HF-S 563 Avretting", "Sopro FS 5\xAE Avretting", "Sopro RDS 960 - Ekspansjonsb\xE5nd", "Sopro Classic EM Hurtigst\xF8p", "Sopro RAM 3\xAE reparasjon og st\xF8pem\xF8rtel", "Sopro RS 462 reparasjonsm\xF8rtel", "Sopro Rapidur M5\xAE hurtigst\xF8p"] },
    { title: "Underlag / Plater", items: ["Kryssfiner / v\xE5tromsfiner", "Tetti Finerpanel 15mm", "Tetti Finerpanel 18mm", "Tetti V\xE5tromsplate 6mm", "Tetti V\xE5tromsplate 10mm", "Tetti V\xE5tromsplate 12mm", "Tetti V\xE5tromsplate 20mm", "Tetti V\xE5tromsplate 30mm", "Tetti V\xE5tromsplate 50mm", "Tetti Hj\xF8rnekasse", "Tetti Veggnisje", "Tetti kasse for vegghengt toalett", "Tetti monteringslim", "Soudal Fix All HT", "Soudal Fix All Turbo"] },
    { title: "Primer / forsterkningsduk", items: ["Sopro PG-X 1188", "Sopro EPG 1522 - 2 Komponent Epoxy primer", "Sopro HPS 673 - spesial primer ikke sugende", "Sopro GD 749 - primer sugende underlag", "Sopro SG 874 Dampsperre-Primer"] },
    { title: "Membransystem / tetting", items: ["Sopro FDK 1-K 1180 membranlim", "Sopro FDF 527 sm\xF8remembran lys gr\xE5", "Sopro DSF 623 RS - 1K sementbasert membran", "AEB 815 Tetteduk", "Sopro BBM 134 Slukmansjett", "Sopro FDB 524 selvklebende tetteb\xE5nd", "Sopro AEB 816 Tetteb\xE5nd", "Sopro AEB 821 Hj\xF8rnemansjett innerhj\xF8rne", "Sopro AEB 822 Hj\xF8rnemansjett ytterhj\xF8rne", "Sopro AEB 825 R\xF8rmansjett \xD810-24mm", "Sopro AEB 826 R\xF8rmansjett \xD832-55mm", "Sopro AEB 827 R\xF8rmansjett \xD875-110mm", "Sopro AEB 828 R\xF8rmansjett \xD8110-140mm"] },
    { title: "Limprodukter / festeprodukter", items: ["Sopro\u2019s No.1 400 Flislim", "Sopro\u2019s No.1 403 Silver Hurtig flislim", "Sopro FKM XL 444 St\xF8vredusert flislim", "Sopro FKM 5555 Hurtig flislim", "Sopro FF 450 - Sigefri flislim"] },
    { title: "Fugemasse / silikon", items: ["Sopro DFH Bruksklar fugemasse", "Sopro DFX epoxyfug", "Sopro DF 10\xAE Designfug", "Sopro FL plus Fugemasse", "Sopro Sanit\xE6r Silikon", "Sopro Ceramic Silikon"] }
  ];
  var surfaces = ["Veggflis 1", "Veggflis 2", "Veggflis 3", "Gulvflis 1", "Gulvflis 2", "Gulvflis 3", "Mosaikkfliser vegg", "Mosaikkfliser gulv", "Dekorfliser"];
  var imageCats = ["F\xF8r arbeid", "Underlag", "Avretting/st\xF8p", "Primer", "Membran", "Sluk og mansjetter", "R\xF8rgjennomf\xF8ringer", "Flislegging", "Fuging/silikon", "Ferdig resultat"];
  var roles = ["Eier / administrator", "Ansatt", "Underleverand\xF8r", "Kun lesetilgang"];
  var installCats = ["R\xF8rlegger", "T\xF8mrer/Snekker", "Maler", "Andre"];
  var projectDescriptionTemplates = [
    {
      label: "Våtrom / bad",
      text: "Prosjektet gjelder rehabilitering/oppbygging av våtrom. Arbeidet dokumenteres med prosjektinformasjon, produkter, bildedokumentasjon, sjekklister og FDV-rapport. Utførende og eventuelle underentreprenører skal følge gjeldende krav, produktanvisninger og avtalt arbeidsomfang."
    },
    {
      label: "Flisarbeid",
      text: "Prosjektet omfatter flisarbeid med tilhørende underlag, primer, membran/tetting, flislim, fug og silikon der dette er aktuelt. Valgte produkter og kontrollpunkter dokumenteres fortløpende i Expo ProffDok."
    },
    {
      label: "Underentreprenør-info",
      text: "Underentreprenør skal legge inn relevant dokumentasjon for eget arbeid, inkludert produkter/utstyr, bilder, sjekklistepunkter og eventuelle kommentarer eller avvik. Endringer eller forhold som kan påvirke fremdrift, kvalitet eller sluttresultat skal meldes til prosjektansvarlig."
    },
    {
      label: "Kundeinfo",
      text: "Kunde kan følge prosjektet via kundelenke med tilgang til prosjektinformasjon, rapport/PDF, tilbud/kontrakt og chat. Spørsmål, avklaringer og eventuelle kommentarer kan sendes direkte i prosjektchatten."
    },
    {
      label: "Avvik / merknad",
      text: "Eventuelle avvik eller merknader dokumenteres med beskrivelse, bilde der det er relevant, og videre tiltak/avklaring. Avvik lukkes ikke før nødvendige tiltak er utført eller avklart med prosjektansvarlig/kunde."
    }
  ];
  var accessRoleInfo = [
    { role: "Eier / administrator", text: "Full tilgang til prosjekt, rapport, firmaprofil, prosjektliste, deling og brukergodkjenning." },
    { role: "Ansatt", text: "Kan normalt opprette, endre og dokumentere prosjekter for firmaet." },
    { role: "Underleverand\xF8r", text: "Anbefales for fag som skal bidra med dokumentasjon, bilder, sjekklister eller utstyr p\xE5 prosjektet." },
    { role: "Kun lesetilgang", text: "Kunde/byggherre f\xE5r egen kundelink med rapport, tilbud/kontrakt og chat." }
  ];
  var checklistTemplate = [
    {
      category: "Tildekning/forarbeid",
      items: [
        "Underlag kontrollert",
        "Fall kontrollert",
        "Sluk korrekt montert",
        "Terskel og h\xF8yder kontrollert"
      ]
    },
    {
      category: "Avretting / underlag",
      items: [
        "Det er avrettet p\xE5 tregulv/spon eller betong",
        "Alle sprekker og krakeleringer er fjernet",
        "Overflatestyrken er kontrollert med risspr\xF8ve",
        "Vedheft mellom r\xE5betong og pusslag er kontrollert med bankepr\xF8ve",
        "Underlaget er fritt for olje, fett, st\xF8v, skitt, m\xF8rtelrester, l\xF8s betong og lignende",
        "Trekk i rommet er kontrollert",
        "Gulvvarme er sl\xE5tt av",
        "Restfukt/RF er kontrollert iht. krav f\xF8r videre belegning/membran"
      ]
    },
    {
      category: "Primer / underlag",
      items: [
        "Riktig primer valgt",
        "Primer p\xE5f\xF8rt",
        "T\xF8rketid fulgt"
      ]
    },
    {
      category: "Membran / tetting",
      items: [
        "Membranl\xF8sning kontrollert",
        "Tetteb\xE5nd montert",
        "Slukmansjett montert",
        "R\xF8rmansjetter montert",
        "Trykktesting av membran",
        "Minimum 5 cm overlapp p\xE5 skj\xF8ter med tetningsduk/tetteb\xE5nd er kontrollert",
        "Riktig membrantykkelse p\xE5 vegger og gulv iht. Sopro anvisninger og myndighetskrav er kontrollert"
      ]
    },
    {
      category: "Flislegging / flislim",
      items: [
        "Fliser montert iht. plan",
        "Limdekning mellom fliser og underlag er kontrollert",
        "Stikkpr\xF8ve/slakting av flis er utf\xF8rt mens flislim fortsatt er v\xE5tt"
      ]
    },
    {
      category: "Fuging / silikon",
      items: [
        "Fugemasse er blandet/r\xF8rt opp med korrekt vanntilsetning iht. datablad",
        "Fugene er helt fylt opp f\xF8r rengj\xF8ring",
        "Fugene er jevne, glatte, ensartet og uten hull og sprekker etter rengj\xF8ring",
        "Fugesl\xF8r er vasket av med svamp og rent vann",
        "Silikon utf\xF8rt"
      ]
    },
    {
      category: "Sluttkontroll",
      items: [
        "Visuell kontroll utf\xF8rt",
        "Bilder tatt",
        "Dokumentasjon komplett"
      ]
    }
  ];
  var emptyTilbud = () => ({
    enabled: false,
    files: [],
    tillegg: "",
    fradrag: "",
    kommentar: ""
  });
  var emptyOvertagelse = () => ({
    enabled: false,
    dato: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    kommentar: "",
    signUtf\u00F8rende: "",
    signKunde: "",
    signUtf\u00F8rendeImage: "",
    signKundeImage: ""
  });
  var soproWarrantySystems = [
    { id: "sopro-aeb-815", label: "Sopro AEB 815 – SINTEF TG 20918", product: "Sopro AEB 815", sintefApproval: "SINTEF TG 20918", sintefUrl: "https://www.sintefcertification.no/Product/Index/20918" },
    { id: "sopro-fdf-525-527", label: "Sopro FDF 525/527 – SINTEF TG 20987", product: "Sopro FDF 525/527", sintefApproval: "SINTEF TG 20987", sintefUrl: "https://www.sintefcertification.no/Product/Index/20987" }
  ];
  var warrantyArchiveNotice = "Viktig: Last alltid ned og lagre komplett PDF-rapport på egen maskin, server eller annet sikkert arkiv når prosjektet er ferdig. Expo ProffDok er en dokumentasjonsplattform, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata i hele garanti- eller byggets levetid.";
  var warrantyTermsText = [
    "Denne garantien dokumenterer at våtrommet er utført med et godkjent Sopro membransystem og at arbeidet er dokumentert gjennom Expo ProffDok.",
    "Garantien gjelder tettheten i det dokumenterte membransystemet i 12 år fra dato for signert overtakelse.",
    "Garantien gjelder for den aktuelle boligen og følger eiendommen ved et eventuelt salg innen garantiperioden.",
    "Garantien utstedes av det utførende firmaet som er angitt i garantibeviset. Expo ProffDok fungerer som dokumentasjonsplattform og lagringssystem for prosjektets dokumentasjon.",
    "Garantien omfatter dokumenterte feil i membransystemets tetthet når disse skyldes utførelse eller installasjon av det dokumenterte systemet.",
    "Garantien forutsetter normal bruk, normalt vedlikehold og at senere arbeider ikke har påvirket konstruksjonen eller membransystemets funksjon.",
    "Garantien omfatter ikke mekanisk skade, påboring eller inngrep i konstruksjonen, skader som følge av brann, naturhendelser eller andre ytre forhold, manglende vedlikehold eller arbeider utført av andre etter overtakelse.",
    "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget.",
    "Garantibeviset er gyldig sammen med komplett prosjektdokumentasjon lagret og/eller arkivert av utførende firma, inkludert bilder, sjekklister, produktdokumentasjon og signert overtakelse."
  ];
  var makeWarrantyNumber = (projectId = "", project = {}) => {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const seed = `${projectId || project?.projectName || project?.address || "prosjekt"}-${year}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return `EPD-${year}-${String(hash % 1e6).padStart(6, "0")}`;
  };
  var soproSystemChecklistTemplates = {
    "sopro-aeb-815": [
      {
        category: "Sopro AEB 815 / TG 20918 – Underlag",
        items: [
          "Underlaget er rengjort og tørt før montering av foliemembran",
          "Fuktinnhold i betong er kontrollert og er ikke over 85 % RF",
          "Underlaget er primet med Sopro Primer iht. monteringsanvisning"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Foliemembran",
        items: [
          "Sopro AEB 815 foliemembran er montert iht. leverandørens monteringsanvisning",
          "Folieskjøter er limt med Sopro FDK 1-K 1180 / Sopro FDK 415 eller annet godkjent systemlim",
          "Tettebånd er montert i alle overganger mellom gulv og vegg, hjørner, folieskjøter og tilslutninger",
          "Innvendige og utvendige hjørner er utført med Sopro systemdetaljer"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Rør og sluk",
        items: [
          "Rørmansjetter er montert på alle rørgjennomføringer og veggbokser",
          "Rør og veggbokser er rengjort før mansjetter er montert",
          "Slukmansjett er montert iht. leverandørens monteringsanvisning",
          "Klemring/limflens er kontrollert og utført iht. valgt sluktype",
          "Sluk og mansjett er dokumentert med bilde før flislegging"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Tetthetskontroll",
        items: [
          "Tetthetskontroll/vanntetthetstest av membransystemet er vurdert/utført før overflatebelegg",
          "Bildedokumentasjon av membransystem, skjøter, mansjetter og sluk foreligger"
        ]
      }
    ],
    "sopro-fdf-525-527": [
      {
        category: "Sopro FDF 525/527 / TG 20987 – Underlag",
        items: [
          "Underlaget er rengjort og tørt før påføring av membran",
          "Fuktinnhold i betong er kontrollert og er ikke over 85 % RF",
          "Primer er påført iht. valgt Sopro-system og underlag"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Membran",
        items: [
          "Minimum to strøk Sopro FDF 525/527 membran er påført",
          "Membrantykkelse på gulv er minimum 1,0 mm",
          "Membrantykkelse på vegg er minimum 0,5 mm",
          "Primer og membran er overflatetørr før neste lag er påført",
          "Brukstemperatur minimum +10 °C er ivaretatt"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Overganger og gjennomføringer",
        items: [
          "Fiberremse/tettebånd er montert i plateskjøter, overganger og tilslutninger",
          "Innvendige og utvendige hjørner er forsterket med Sopro hjørnemansjetter",
          "Rørmansjetter er montert på alle rørgjennomføringer med riktig dimensjon",
          "Rør er rengjort før mansjett er montert",
          "Tekstilsjikt på mansjetter er fullstendig dekket med Sopro FDF 525/527",
          "Membran er ført litt forbi mansjett og ut på rør/veggboks"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Sluk og tetthetskontroll",
        items: [
          "Slukmansjett er montert med Sopro FDF 525/527 iht. valgt sluktype",
          "Det er påført minst to strøk Sopro FDF 525/527 over slukmansjett",
          "Klemring/limflens er kontrollert og dokumentert",
          "Sluk og mansjett er dokumentert med bilde før flislegging",
          "Tetthetskontroll/vanntetthetstest av membransystemet er vurdert/utført før overflatebelegg"
        ]
      }
    ]
  };
  var getSoproChecklistTemplate = (systemId) => soproSystemChecklistTemplates[systemId] || [];
  var isSoproWarrantyCategory = (category = "") => String(category || "").startsWith("Sopro ");
  var isSoproWarrantyPoint = (category = "") => isSoproWarrantyCategory(category);
  var checklistPointAnchor = (category = "", item = "") => {
    const clean = `${category}-${item}`.toLowerCase().replace(/[åä]/g, "a").replace(/[øö]/g, "o").replace(/[æ]/g, "ae").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `checkpunkt-${clean || "punkt"}`;
  };
  var getSoproWarrantyPointStatus = (checklist = {}, systemId = "") => {
    const template = getSoproChecklistTemplate(systemId);
    const points = template.flatMap((group) => (group.items || []).map((item) => {
      const value = checklist?.[group.category]?.[item] || {};
      const done = hasValue(value?.status);
      return {
        category: group.category,
        item,
        status: value?.status || "",
        done,
        anchorId: checklistPointAnchor(group.category, item)
      };
    }));
    const total = points.length;
    const done = points.filter((point) => point.done).length;
    const missing = points.filter((point) => !point.done);
    return {
      points,
      missing,
      total,
      done,
      complete: total > 0 && done >= total,
      percent: total ? Math.round(done / total * 100) : 0
    };
  };
  var dedupeChecklistTemplate = (groups = []) => {
    const seenCategories = new Set();
    const result = [];
    (groups || []).forEach((group) => {
      const category = String(group?.category || "");
      if (!category) return;
      let target = result.find((entry) => entry.category === category);
      if (!target) {
        target = { category, items: [] };
        result.push(target);
        seenCategories.add(category);
      }
      const seenItems = new Set(target.items || []);
      (group.items || []).forEach((item) => {
        if (!seenItems.has(item)) {
          target.items.push(item);
          seenItems.add(item);
        }
      });
    });
    return result;
  };
  var warrantyOverlapGenericItems = new Set([
    "Restfukt/RF er kontrollert iht. krav før videre belegning/membran",
    "Riktig primer valgt",
    "Primer påført",
    "Tørketid fulgt",
    "Membranløsning kontrollert",
    "Tettebånd montert",
    "Slukmansjett montert",
    "Rørmansjetter montert",
    "Trykktesting av membran",
    "Minimum 5 cm overlapp på skjøter med tetningsduk/tettebånd er kontrollert",
    "Riktig membrantykkelse på vegger og gulv iht. Sopro anvisninger og myndighetskrav er kontrollert"
  ]);
  var getBaseChecklistTemplateForWarranty = (warranty = {}) => {
    const warrantyActive = !!warranty?.enabled && !!warranty?.system;
    if (!warrantyActive) return checklistTemplate;
    return checklistTemplate.map((group) => ({
      ...group,
      items: (group.items || []).filter((item) => !warrantyOverlapGenericItems.has(item))
    })).filter((group) => (group.items || []).length > 0);
  };
  var getActiveChecklistTemplate = (warranty = {}) => {
    const baseTemplate = getBaseChecklistTemplateForWarranty(warranty);
    const soproTemplate = warranty?.enabled ? getSoproChecklistTemplate(warranty?.system) : [];
    if (!soproTemplate.length) return dedupeChecklistTemplate(baseTemplate);
    const soproUnderlag = soproTemplate.filter((group) => /Underlag/i.test(group.category));
    const soproMembran = soproTemplate.filter((group) => /Foliemembran|Membran/i.test(group.category));
    const soproOverganger = soproTemplate.filter((group) => /Overganger|Rør og sluk|Sluk og tetthetskontroll/i.test(group.category));
    const soproTetthet = soproTemplate.filter((group) => /Tetthetskontroll/i.test(group.category) && !/Sluk og tetthetskontroll/i.test(group.category));
    const soproInserted = new Set();
    const markInserted = (groups = []) => groups.filter((group) => {
      if (!group || soproInserted.has(group.category)) return false;
      soproInserted.add(group.category);
      return true;
    });
    const result = [];
    (baseTemplate || []).forEach((group) => {
      result.push(group);
      if (group.category === "Avretting / underlag") result.push(...markInserted(soproUnderlag));
      if (group.category === "Membran / tetting") {
        result.push(...markInserted(soproMembran));
        result.push(...markInserted(soproOverganger));
        result.push(...markInserted(soproTetthet));
      }
    });
    result.push(...markInserted(soproTemplate));
    return dedupeChecklistTemplate(result);
  };
  var emptyWarranty = () => ({
    enabled: false,
    issued: false,
    issuedAt: null,
    system: "",
    sintefApproval: "",
    durationYears: 12,
    status: "draft",
    guaranteeNumber: "",
    reportGeneratedAt: null,
    reportGeneratedFileName: ""
  });
  var emptyProject = () => ({
    responsible: "",
    projectName: "",
    address: "",
    postnr: "",
    city: "",
    customer: "",
    customerEmail: "",
    customerPhone: "",
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    notes: "",
    projectDescription: "",
    projectInfoIncludeInReport: false,
    fall: "",
    fallDusj: "",
    fallUtenfor: "",
    sluk: "",
    terskel: "",
    membran: "",
    prosjekteringKommentar: "",
    prosjekteringPunkter: [],
    locked: false,
    status: "active",
    workflowStatus: "Pågår",
    lockedAt: "",
    lockedBy: ""
  });
  var emptyProjectLog = () => ({
    enabled: false,
    draft: "",
    messages: [],
    lastReadByAdmin: "",
    lastReadByCustomer: ""
  });
  var normalizeProjectLog = (log = {}) => ({
    ...emptyProjectLog(),
    ...log || {},
    messages: Array.isArray(log?.messages) ? log.messages : []
  });
  var normalizeManualProductsBySection = (value = {}) => {
    const result = {};
    const addProduct = (section, product) => {
      const cleanSection = String(section || product?.section || product?.trade || "Andre produkter").trim() || "Andre produkter";
      const cleanProduct = {
        id: product?.id || uid(),
        name: product?.name || product?.product_name || "",
        fdvUrl: product?.fdvUrl || product?.fdv_url || "",
        comment: product?.comment || ""
      };
      result[cleanSection] = [...result[cleanSection] || [], cleanProduct];
    };
    if (Array.isArray(value)) {
      value.forEach((product) => addProduct(product?.section || product?.trade || "Andre produkter", product || {}));
      return result;
    }
    Object.entries(value || {}).forEach(([section, products]) => {
      if (Array.isArray(products)) {
        products.forEach((product) => addProduct(section, product || {}));
      }
    });
    return result;
  };
  function App() {
    const [tab, setTab] = (0, import_react.useState)("prosjekt");
    const [company, setCompany] = (0, import_react.useState)({ companyName: "Expo Proffsenter", address: "", orgNumber: "", phone: "", email: "", website: "", logoUrl: "" });
    const [user, setUser] = (0, import_react.useState)({ name: "", email: "", role: "Eier / administrator" });
    const [project, setProject] = (0, import_react.useState)(emptyProject());
    const [checked, setChecked] = (0, import_react.useState)({});
    const [productDocs, setProductDocs] = (0, import_react.useState)({});
    const [manualProducts, setManualProducts] = (0, import_react.useState)({});
    const [other, setOther] = (0, import_react.useState)({});
    const [surf, setSurf] = (0, import_react.useState)({});
    const [photos, setPhotos] = (0, import_react.useState)([]);
    const [access, setAccess] = (0, import_react.useState)([]);
    const [inst, setInst] = (0, import_react.useState)([]);
    const [files, setFiles] = (0, import_react.useState)([]);
    const [checklist, setChecklist] = (0, import_react.useState)({});
    const [tilbud, setTilbud] = (0, import_react.useState)(emptyTilbud());
    const [overtagelse, setOvertagelse] = (0, import_react.useState)(emptyOvertagelse());
    const [warranty, setWarranty] = (0, import_react.useState)(emptyWarranty());
    const [chatUploadFile, setChatUploadFile] = (0, import_react.useState)(null);
    const [customerChatUploadFile, setCustomerChatUploadFile] = (0, import_react.useState)(null);
    const [projectLog, setProjectLog] = (0, import_react.useState)(emptyProjectLog());
    const [customerTab, setCustomerTab] = (0, import_react.useState)("rapport");
    const [internalNotes, setInternalNotes] = (0, import_react.useState)("");
    const [lightboxImage, setLightboxImage] = (0, import_react.useState)(null);
    const [accessEmailMessage, setAccessEmailMessage] = (0, import_react.useState)("Hei, du har fått tilgang til prosjektet. Klikk på linken i denne e-posten for å åpne prosjektet.");
    const [projects, setProjects] = (0, import_react.useState)([]);
    const [projectId, setProjectId] = (0, import_react.useState)(null);
    const [mobileCreatingProject, setMobileCreatingProject] = (0, import_react.useState)(false);
    const [authUser, setAuthUser] = (0, import_react.useState)(null);
    const [authEmail, setAuthEmail] = (0, import_react.useState)("");
    const [authPassword, setAuthPassword] = (0, import_react.useState)("");
    const [passwordRecovery, setPasswordRecovery] = (0, import_react.useState)(false);
    const [newPassword, setNewPassword] = (0, import_react.useState)("");
    const [newPasswordRepeat, setNewPasswordRepeat] = (0, import_react.useState)("");
    const [authLoading, setAuthLoading] = (0, import_react.useState)(true);
    const [profile, setProfile] = (0, import_react.useState)(null);
    const [profileLoading, setProfileLoading] = (0, import_react.useState)(false);
    const [adminUsers, setAdminUsers] = (0, import_react.useState)([]);
    const [adminUserFilter, setAdminUserFilter] = (0, import_react.useState)("pending");
    const [adminLoading, setAdminLoading] = (0, import_react.useState)(false);
    const [projectSearch, setProjectSearch] = (0, import_react.useState)("");
    const [projectStatusFilter, setProjectStatusFilter] = (0, import_react.useState)("alle");
    const [projectUnreadOnly, setProjectUnreadOnly] = (0, import_react.useState)(false);
    const [fdvRegister, setFdvRegister] = (0, import_react.useState)([]);
    const [fdvLoading, setFdvLoading] = (0, import_react.useState)(false);
    const [productMaster, setProductMaster] = (0, import_react.useState)([]);
    const [productMasterLoading, setProductMasterLoading] = (0, import_react.useState)(false);
    const [showOpenDeviationsOnly, setShowOpenDeviationsOnly] = (0, import_react.useState)(false);
    const latestStateRef = (0, import_react.useRef)({});
    const lastChatMessageCountRef = (0, import_react.useRef)(0);
    const lastChatRefreshAtRef = (0, import_react.useRef)(0);
    const openImageLightboxFromClick = (event) => {
      const target = event?.target;
      if (!target || target.tagName !== "IMG") return;
      const imageContainer = target.closest?.(".photo, .projectImageThumb");
      if (!imageContainer) return;
      const src = target.getAttribute("src");
      if (!src) return;
      setLightboxImage({ src, alt: target.getAttribute("alt") || "Bilde" });
    };
    (0, import_react.useEffect)(() => {
      latestStateRef.current = {
        company,
        user,
        project,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      };
    }, [company, user, project, checked, productDocs, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, warranty, projectLog, internalNotes]);
    (0, import_react.useEffect)(() => {
      const savedEmail = window.localStorage.getItem("expoProffDokAuthEmail");
      if (savedEmail) setAuthEmail(savedEmail);
    }, []);
    const selected = (0, import_react.useMemo)(() => productSections.flatMap((s) => s.items.filter((i) => checked[i]).map((i) => ({
      section: s.title,
      item: i,
      fdvUrl: productDocs[i]?.fdvUrl || "",
      databladUrl: productDocs[i]?.databladUrl || "",
      dopUrl: productDocs[i]?.dopUrl || "",
      epdUrl: productDocs[i]?.epdUrl || "",
      sikkerhetsdatabladUrl: productDocs[i]?.sikkerhetsdatabladUrl || "",
      documentFileUrl: productDocs[i]?.documentFileUrl || "",
      comment: productDocs[i]?.comment || ""
    }))), [checked, productDocs]);
    const manualProductsBySection = (0, import_react.useMemo)(() => normalizeManualProductsBySection(manualProducts), [manualProducts]);
    const getManualProductsForSection = (section) => manualProductsBySection[section] || [];
    const manualSelected = (0, import_react.useMemo)(() => {
      return Object.entries(manualProductsBySection || {}).flatMap(
        ([section, products]) => (products || []).filter((p) => hasValue(p.name) || hasValue(p.fdvUrl) || hasValue(p.comment)).map((p) => ({ ...p, section }))
      );
    }, [manualProductsBySection]);
    const fdvRegisterByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      (fdvRegister || []).forEach((row) => {
        if (row?.product_name) map[row.product_name] = row;
      });
      return map;
    }, [fdvRegister]);
    const productMasterByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      const scoreRow = (row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].filter(hasValue).length;
      const addKey = (key, row) => {
        const cleanKey = String(key || "").trim();
        if (!cleanKey) return;
        if (!map[cleanKey] || scoreRow(row) > scoreRow(map[cleanKey])) map[cleanKey] = row;
      };
      (productMaster || []).forEach((row) => {
        addKey(row?.app_match_name, row);
        addKey(row?.product_family, row);
        addKey(row?.product_name, row);
      });
      return map;
    }, [productMaster]);
    const productMasterStats = (0, import_react.useMemo)(() => {
      const rows = productMaster || [];
      const withDocs = rows.filter((row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].some(hasValue)).length;
      const appMatches = rows.filter((row) => row?.used_in_app_standard_list || hasValue(row?.app_match_name)).length;
      return { total: rows.length, withDocs, appMatches };
    }, [productMaster]);
    const pendingAdminUsers = (0, import_react.useMemo)(() => (adminUsers || []).filter((u) => !u?.approved), [adminUsers]);
    const visibleAdminUsers = (0, import_react.useMemo)(() => adminUserFilter === "all" ? adminUsers || [] : pendingAdminUsers, [adminUsers, pendingAdminUsers, adminUserFilter]);
    const name = company.companyName || "Expo Proffsenter";
    const urlParams = new URLSearchParams(window.location.search);
    const accessMode = urlParams.get("access") || urlParams.get("role") || (urlParams.has("project") ? "kunde" : "");
    const isAdminProjectLink = urlParams.has("project") && accessMode === "admin";
    const isUnderleverandorView = urlParams.has("project") && accessMode === "underleverandor";
    const isReadOnly = urlParams.has("project") && !isUnderleverandorView && !isAdminProjectLink;
    const isAdminUser = !!authUser && (profile?.is_admin === true || profile?.role === "admin" || authUser.email === "kenneth@ringside.no" || !!company.email && authUser.email === company.email);
    const canUseAdminProjectSync = !!authUser && !!profile?.approved && !isReadOnly;
    const projectIsLocked = (p = project) => p?.locked === true || p?.locked === "true" || p?.status === "locked" || p?.status === "Avsluttet";
    const applyLockState = (baseProject, sourceProject = {}) => ({
      ...baseProject,
      locked: projectIsLocked(sourceProject),
      status: projectIsLocked(sourceProject) ? "locked" : sourceProject.status || baseProject.status || "active",
      lockedAt: sourceProject.lockedAt || "",
      lockedBy: sourceProject.lockedBy || ""
    });
    const isProjectLocked = projectIsLocked(project);
    const projectHasOvertagelse = (o = overtagelse) => !!o?.enabled || hasValue(o?.dato) || hasValue(o?.kommentar) || hasValue(o?.signUtf\u00F8rende) || hasValue(o?.signKunde) || hasValue(o?.signUtf\u00F8rendeImage) || hasValue(o?.signKundeImage);
    const workflowStatusOptions = ["Utkast", "Pågår", "Avventer", "Klar for kunde", "Avvik åpent", "Ferdigstilt"];
    const getOpenDeviationCount = (sourceChecklist = checklist) => Object.values(sourceChecklist || {}).flatMap((items) => Object.values(items || {})).filter((value) => value?.status === "Avvik").length;
    const workflowStatusInfo = (status) => {
      const cleanStatus = workflowStatusOptions.includes(status) ? status : "Pågår";
      const map = {
        "Utkast": { label: "Utkast", icon: "⚪", tone: "draft" },
        "Pågår": { label: "Pågår", icon: "🟡", tone: "progress" },
        "Avventer": { label: "Avventer", icon: "⏸️", tone: "waiting" },
        "Klar for kunde": { label: "Klar for kunde", icon: "🔵", tone: "customer_ready" },
        "Avvik åpent": { label: "Avvik åpent", icon: "🔴", tone: "deviation" },
        "Ferdigstilt": { label: "Ferdigstilt", icon: "✅", tone: "done" }
      };
      return map[cleanStatus] || map["Pågår"];
    };
    const projectStatusInfo = (p = project, o = overtagelse, openDeviationCount = 0) => {
      const locked = projectIsLocked(p);
      if (locked && projectHasOvertagelse(o)) return { label: "Ferdigstilt", icon: "✅", tone: "done" };
      if (locked) return { label: "Avsluttet / låst", icon: "🔒", tone: "locked" };
      if (openDeviationCount > 0) return { label: "Avvik åpent", icon: "🔴", tone: "deviation" };
      if (p?.workflowStatus) return workflowStatusInfo(p.workflowStatus);
      if (p?.projectName || p?.address || p?.customer || projectHasOvertagelse(o)) return workflowStatusInfo("Pågår");
      return workflowStatusInfo("Utkast");
    };
    const statusStyle = (tone) => ({
      background: tone === "done" ? "#ecfdf5" : tone === "locked" ? "#f8fafc" : tone === "deviation" ? "#fef2f2" : tone === "customer_ready" ? "#eff6ff" : tone === "waiting" ? "#f8fafc" : tone === "draft" ? "#f8fafc" : "#fffbeb",
      color: tone === "done" ? "#065f46" : tone === "locked" ? "#334155" : tone === "deviation" ? "#991b1b" : tone === "customer_ready" ? "#075985" : tone === "waiting" ? "#475569" : tone === "draft" ? "#475569" : "#92400e"
    });
    const chatMessages = projectLog?.messages || [];
    const customerChatCount = chatMessages.filter((m) => m.role === "kunde").length;
    const totalChatCount = chatMessages.length;
    const latestChatMessage = chatMessages.length ? chatMessages[chatMessages.length - 1] : null;
    const lastReadByAdmin = projectLog?.lastReadByAdmin || "";
    const lastReadByCustomer = projectLog?.lastReadByCustomer || "";
    const unreadForAdmin = chatMessages.filter((m) => m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin)).length;
    const unreadForCustomer = chatMessages.filter((m) => m.role !== "kunde" && (!lastReadByCustomer || (m.created || "") > lastReadByCustomer)).length;
    const projectGuideStats = (0, import_react.useMemo)(() => {
      const productCount = (selected || []).length + (manualSelected || []).length;
      const photoCount = (photos || []).filter((photo) => photo?.url).length;
      const checklistValues = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
      const checklistTotal = checklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
      const checklistDone = checklistValues.filter((value) => hasValue(value?.status)).length;
      const checklistMissing = Math.max(0, checklistTotal - checklistDone);
      const checklistAvvik = checklistValues.filter((value) => value?.status === "Avvik").length;
      const openDeviationCount = checklistAvvik;
      const hasProjectBasics = [project.projectName, project.address, project.customer].some(hasValue);
      const hasDescription = hasValue(project.projectDescription);
      const hasCustomerEmail = hasValue(project.customerEmail);
      const hasCustomerPhone = hasValue(project.customerPhone);
      const hasOvertagelse = projectHasOvertagelse(overtagelse);
      const completionChecks = [
        hasProjectBasics,
        hasDescription,
        productCount > 0,
        photoCount > 0,
        checklistDone > 0,
        checklistMissing === 0 && checklistTotal > 0,
        openDeviationCount === 0,
        hasCustomerEmail,
        hasCustomerPhone,
        hasOvertagelse
      ];
      const completionPercent = Math.round(completionChecks.filter(Boolean).length / completionChecks.length * 100);
      return { productCount, photoCount, checklistTotal, checklistDone, checklistMissing, checklistAvvik, openDeviationCount, hasProjectBasics, hasDescription, hasCustomerEmail, hasCustomerPhone, hasOvertagelse, completionPercent };
    }, [selected, manualSelected, photos, checklist, project, overtagelse]);
    const projectGuideItems = (0, import_react.useMemo)(() => {
      const items = [];
      if (!projectGuideStats.hasProjectBasics) items.push({ id: "basis", label: "Fyll inn prosjekt, adresse og kunde", tab: "prosjekt", tone: "warning" });
      if (!projectGuideStats.hasDescription) items.push({ id: "info", label: "Legg inn kort prosjektbeskrivelse", tab: "prosjektinfo", tone: "info" });
      if (projectGuideStats.productCount === 0) items.push({ id: "produkter", label: "Velg produkter for FDV/rapport", tab: "produkter", tone: "warning" });
      if (projectGuideStats.photoCount === 0) items.push({ id: "bilder", label: "Legg til bildedokumentasjon", tab: "bilder", tone: "warning" });
      if (projectGuideStats.checklistDone === 0) items.push({ id: "sjekklister", label: "Start sjekklistekontroll", tab: "sjekklister", tone: "info" });
      if (!projectGuideStats.hasCustomerEmail) items.push({ id: "kunde", label: "Legg inn kunde e-post for deling/varsling", tab: "prosjekt", tone: "info" });
      if (!projectGuideStats.hasCustomerPhone) items.push({ id: "kunde-tlf", label: "Legg inn kunde telefonnummer for enklere oppfølging", tab: "prosjekt", tone: "info" });
      if (!projectGuideStats.hasOvertagelse) items.push({ id: "overtagelse", label: "Registrer overtagelse når prosjektet er ferdig", tab: "overtagelse", tone: "neutral" });
      return items.slice(0, 5);
    }, [projectGuideStats]);
    const warrantyReadiness = (0, import_react.useMemo)(() => {
      const utførendeSigned = hasValue(overtagelse?.signUtførende) || hasValue(overtagelse?.signUtførendeImage);
      const kundeSigned = hasValue(overtagelse?.signKunde) || hasValue(overtagelse?.signKundeImage);
      const overtagelseSigned = !!overtagelse?.enabled && utførendeSigned && kundeSigned;
      const openDeviationCount = getOpenDeviationCount(checklist);
      const selectedSystem = soproWarrantySystems.find((item) => item.id === warranty?.system);
      const approvedSoproSystemSelected = !!selectedSystem;
      const activeChecklistTemplate = getActiveChecklistTemplate(warranty);
      const checklistValues = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
      const checklistTotal = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
      const checklistDone = activeChecklistTemplate.reduce((sum, group) => {
        return sum + (group.items || []).filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
      }, 0);
      const checklistComplete = checklistTotal > 0 && checklistDone >= checklistTotal;
      const systemPointStatus = getSoproWarrantyPointStatus(checklist, warranty?.system);
      const systemChecklistTemplate = getSoproChecklistTemplate(warranty?.system);
      const systemChecklistTotal = systemPointStatus.total;
      const systemChecklistDone = systemPointStatus.done;
      const systemChecklistComplete = !approvedSoproSystemSelected ? false : systemPointStatus.complete;
      const hasPhotos = (photos || []).some((photo) => hasValue(photo?.url));
      const reportGenerated = !!warranty?.reportGeneratedAt;
      const missing = [];
      if (!overtagelseSigned) missing.push("Overtagelse må være aktivert og signert av både utførende og kunde.");
      if (openDeviationCount > 0) missing.push("Alle åpne avvik må lukkes før garanti kan utstedes.");
      if (!checklistComplete) missing.push("Alle ordinære sjekklister og systemspesifikke Sopro-punkter må ha status.");
      if (approvedSoproSystemSelected && !systemChecklistComplete) missing.push("Alle kontrollpunkter for valgt Sopro-system må være fullført.");
      if (!hasPhotos) missing.push("Bildedokumentasjon må være lastet opp.");
      if (!approvedSoproSystemSelected) missing.push("Godkjent Sopro-system må velges.");
      if (!reportGenerated) missing.push("Komplett PDF-rapport må genereres og lastes ned før garanti kan utstedes.");
      return {
        overtagelseSigned,
        openDeviationCount,
        checklistTotal,
        checklistDone,
        checklistComplete,
        systemChecklistTotal,
        systemChecklistDone,
        systemChecklistComplete,
        systemChecklistPercent: systemPointStatus.percent,
        missingSystemChecklistPoints: systemPointStatus.missing,
        systemChecklistPoints: systemPointStatus.points,
        hasPhotos,
        reportGenerated,
        approvedSoproSystemSelected,
        selectedSystem,
        missing,
        ready: missing.length === 0
      };
    }, [overtagelse, checklist, photos, warranty]);
    const issueWarranty = () => {
      if (!warranty?.enabled) return alert("Aktiver garantien først.");
      if (!warrantyReadiness.ready) return alert("Garantien kan ikke utstedes ennå. Se listen over mangler.");
      const selectedSystem = warrantyReadiness.selectedSystem;
      const issuedAt = (/* @__PURE__ */ new Date()).toISOString();
      const guaranteeNumber = warranty?.guaranteeNumber || makeWarrantyNumber(projectId, project);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        issued: true,
        issuedAt,
        system: selectedSystem?.id || warranty.system,
        sintefApproval: selectedSystem?.sintefApproval || warranty.sintefApproval || "",
        durationYears: 12,
        guaranteeNumber,
        status: "issued"
      });
      alert("✔ 12 års dokumentert tetthetsgaranti er markert som utstedt. Last ned endelig komplett PDF-rapport og lagre den på egen maskin/arkiv. Husk deretter å lagre/oppdatere prosjektet.");
    };
    const currentStatus = projectStatusInfo(project, overtagelse, projectGuideStats.openDeviationCount);
    const suggestedWorkflowStatus = projectGuideStats.openDeviationCount > 0 ? "Avvik åpent" : projectGuideStats.hasOvertagelse ? "Ferdigstilt" : projectGuideStats.productCount > 0 && projectGuideStats.photoCount > 0 && projectGuideStats.checklistDone > 0 ? "Klar for kunde" : projectGuideStats.hasProjectBasics ? "Pågår" : "Utkast";
    const openActiveDeviations = () => {
      setShowOpenDeviationsOnly(true);
      goToTab("sjekklister");
      setTimeout(() => {
        const checklistSection = document.querySelector(".activeDeviationFocus") || document.querySelector(".checklistAccordion");
        if (checklistSection) checklistSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 140);
    };
    const rowIsLocked = (row) => row?.locked === true || row?.locked === "true" || projectIsLocked(row?.data?.project || {});
    const projectFromRow = (row, fallbackProject = project) => {
      const dataProject = row?.data?.project || {};
      const lockedValue = rowIsLocked(row);
      return {
        ...emptyProject(),
        ...dataProject,
        ...fallbackProject,
        locked: lockedValue,
        status: lockedValue ? "locked" : dataProject.status || fallbackProject.status || "active",
        lockedAt: row?.locked_at || dataProject.lockedAt || fallbackProject.lockedAt || "",
        lockedBy: row?.locked_by || dataProject.lockedBy || fallbackProject.lockedBy || ""
      };
    };
    const dataFromRow = (row, fallbackData = {}) => ({
      ...row?.data || fallbackData || {},
      project: projectFromRow(row, (row?.data || fallbackData || {}).project || emptyProject())
    });
    const projectListRows = (0, import_react.useMemo)(() => {
      return (projects || []).map((row) => {
        const data = row.data || {};
        const listProject = projectFromRow(row, data.project || {});
        const listStatus = projectStatusInfo(listProject, data.overtagelse || {}, getOpenDeviationCount(data.checklist));
        const listLog = normalizeProjectLog(data.projectLog);
        const messages = listLog.messages || [];
        const unreadForAdminInList = messages.filter((m) => m.role === "kunde" && (!listLog.lastReadByAdmin || (m.created || "") > listLog.lastReadByAdmin)).length;
        const latestMessage = messages.length ? messages[messages.length - 1] : null;
        const openDeviationCount = getOpenDeviationCount(data.checklist);
        const checkedProductCount = Object.values(data.checked || {}).filter(Boolean).length;
        const manualProductCount = Object.values(normalizeManualProductsBySection(data.manualProducts || {})).flat().filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)).length;
        const productSummary = {
          total: checkedProductCount + manualProductCount,
          standard: checkedProductCount,
          manual: manualProductCount
        };
        const photoImages = Array.isArray(data.photos) ? data.photos.filter((photo) => photo?.url).map((photo) => ({
          url: photo.url,
          label: photo.cat || photo.name || "Prosjektbilde",
          source: "Bilder"
        })) : [];
        const checklistImages = [];
        Object.entries(data.checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            (value?.photos || []).forEach((photo) => {
              if (photo?.url) checklistImages.push({
                url: photo.url,
                label: `${category} \xB7 ${item}`,
                source: "Sjekkliste"
              });
            });
          });
        });
        const installImages = [];
        (Array.isArray(data.inst) ? data.inst : []).forEach((entry) => {
          (entry?.photos || []).forEach((photo) => {
            if (photo?.url) installImages.push({
              url: photo.url,
              label: entry.name || entry.category || photo.name || "Fag/utstyr",
              source: "Fag/utstyr"
            });
          });
        });
        const chatImages = messages.filter((message) => message?.imageUrl).map((message) => ({
          url: message.imageUrl,
          label: message.imageName || message.text || "Chatbilde",
          source: "Chat"
        }));
        const allProjectImages = [...photoImages, ...checklistImages, ...installImages, ...chatImages];
        const imageSummary = {
          total: allProjectImages.length,
          photos: photoImages.length,
          checklist: checklistImages.length,
          install: installImages.length,
          chat: chatImages.length,
          previews: allProjectImages.slice(0, 4)
        };
        const searchable = [
          row.title,
          listProject.projectName,
          listProject.customer,
          listProject.address,
          listProject.city,
          listProject.postnr,
          listProject.customerEmail,
          listProject.customerPhone,
          listProject.responsible
        ].filter(Boolean).join(" ").toLowerCase();
        return { row, listProject, listStatus, listLog, unreadForAdminInList, latestMessage, imageSummary, openDeviationCount, productSummary, searchable };
      });
    }, [projects]);
    const filteredProjectListRows = (0, import_react.useMemo)(() => {
      const term = (projectSearch || "").trim().toLowerCase();
      return projectListRows.filter((item) => {
        if (term && !item.searchable.includes(term)) return false;
        if (projectUnreadOnly && item.unreadForAdminInList <= 0) return false;
        if (projectStatusFilter !== "alle" && item.listStatus.tone !== projectStatusFilter) return false;
        return true;
      });
    }, [projectListRows, projectSearch, projectStatusFilter, projectUnreadOnly]);
    const activeMobileProjectRows = (0, import_react.useMemo)(() => {
      return filteredProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked");
    }, [filteredProjectListRows]);
    const projectListStats = (0, import_react.useMemo)(() => {
      const total = projectListRows.length;
      const unread = projectListRows.reduce((sum, item) => sum + item.unreadForAdminInList, 0);
      const active = projectListRows.filter((item) => item.listStatus.tone === "progress" || item.listStatus.tone === "open").length;
      const finished = projectListRows.filter((item) => item.listStatus.tone === "done" || item.listStatus.tone === "locked").length;
      return { total, unread, active, finished, visible: filteredProjectListRows.length };
    }, [projectListRows, filteredProjectListRows]);
    const tabs = [
      ["prosjekt", "Prosjekt"],
      ["prosjektinfo", "Prosjektinformasjon/beskrivelse"],
      ["garanti", warranty?.issued ? "Garanti ✓" : "Garanti"],
      ["firma", "Firmaprofil"],
      ["prosjektering", "Prosjektering"],
      ["produkter", "Produkter"],
      ["overflater", "Overflater"],
      ["bilder", "Bilder"],
      ["tilgang", "Tilgang"],
      ["installasjoner", "Fag/utstyr"],
      ["sjekklister", "Sjekklister"],
      ["tilbud", "Tilbud/kontrakt"],
      ["overtagelse", "Overtagelse"],
      ["chat", unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount})` : "Chat"],
      ["internt", "Interne notater"],
      ["prosjektliste", "Prosjektliste"],
      ["rapport", "Rapport"],
      ...canUseAdminProjectSync ? [["admin", "Admin"]] : []
    ];
    const currentTabIndex = tabs.findIndex(([id]) => id === tab);
    const previousTab = currentTabIndex > 0 ? tabs[currentTabIndex - 1] : null;
    const nextTab = currentTabIndex >= 0 && currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1] : null;
    const goToTab = (id) => {
  if (!id) return;
  setTab(id);

  setTimeout(() => {
    if (window.innerWidth <= 700) {
      const main = document.querySelector("main");
      if (main) {
        main.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, 80);
};
    const appendProjectDescriptionTemplate = (templateText) => {
      const currentText = project.projectDescription || "";
      const separator = currentText.trim() ? "\n\n" : "";
      setProject({ ...project, projectDescription: `${currentText}${separator}${templateText}` });
    };
    const packData = () => ({ company, user, project, checked, productDocs, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, warranty, projectLog, internalNotes });
    const unpackData = (data, preserveDraft = false) => {
      setCompany(data.company || { companyName: "Expo Proffsenter", address: "", orgNumber: "", phone: "", email: "", website: "", logoUrl: "" });
      setUser(data.user || { name: "", email: "", role: "Eier / administrator" });
      setProject({ ...emptyProject(), ...data.project || {} });
      setChecked(data.checked || {});
      setProductDocs(data.productDocs || {});
      if (Array.isArray(data.manualProducts)) {
        const migratedManual = {};
        data.manualProducts.forEach((p) => {
          const section = p.trade || "Andre produkter";
          migratedManual[section] = [...migratedManual[section] || [], { ...p, trade: void 0 }];
        });
        setManualProducts(migratedManual);
      } else {
        setManualProducts(data.manualProducts || {});
      }
      setOther(data.other || {});
      setSurf(data.surf || {});
      setPhotos(data.photos || []);
      setAccess(data.access || []);
      setInst(data.inst || []);
      setFiles(data.files || []);
      setChecklist(data.checklist || {});
      setTilbud(data.tilbud || emptyTilbud());
      setOvertagelse(data.overtagelse || emptyOvertagelse());
      setWarranty({ ...emptyWarranty(), ...data.warranty || {} });
      const incomingLog = normalizeProjectLog(data.projectLog);
      setProjectLog((prev) => ({
        ...incomingLog,
        draft: preserveDraft ? prev?.draft || "" : incomingLog.draft || ""
      }));
      setInternalNotes(data.internalNotes || "");
    };
    const loadProjects = async (currentUser = authUser, notify = false) => {
      if (!currentUser) {
        setProjects([]);
        if (notify) alert("Du m\xE5 v\xE6re logget inn for \xE5 hente prosjektliste.");
        return;
      }
      const { data, error } = await supabase.from("projects").select("*").eq("user_id", currentUser.id).order("updated_at", { ascending: false });
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente prosjektliste: " + error.message);
      }
      setProjects(data || []);
      if (notify) alert(`Prosjektliste oppdatert. Fant ${(data || []).length} prosjekt${(data || []).length === 1 ? "" : "er"}.`);
    };
    const openProjectById = async (id, targetTab = "rapport", options = {}) => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error || !data) {
        console.error(error);
        return alert("Kunne ikke \xE5pne prosjekt: " + (error?.message || "Fant ikke prosjekt"));
      }
      unpackData(dataFromRow(data));
      setProjectId(data.id);
      setMobileCreatingProject(false);
      setShowOpenDeviationsOnly(!!options.showOpenDeviationsOnly);
      setTab(targetTab);
      if (options.showOpenDeviationsOnly) {
        setTimeout(() => {
          const checklistSection = document.querySelector(".activeDeviationFocus") || document.querySelector(".checklistAccordion");
          if (checklistSection) checklistSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }
    };
    const refreshProjectFromCloud = async (silent = false, fullRefresh = false) => {
      if (!projectId) return;
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (error || !data) {
        console.error(error);
        if (!silent) alert("Kunne ikke oppdatere prosjektdata: " + (error?.message || "Fant ikke prosjekt"));
        return;
      }
      const cloudData = dataFromRow(data);
      const incomingLog = normalizeProjectLog(cloudData.projectLog);
      const isChatRefresh = !fullRefresh && (silent || tab === "chat" || customerTab === "chat" || isReadOnly);
      if (isChatRefresh) {
        const incomingCount = (incomingLog.messages || []).length;
        setProjectLog((prev) => {
          const currentDraft = prev?.draft || "";
          const currentCount = (prev?.messages || []).length;
          if (incomingCount > currentCount && !silent) {
          }
          return {
            ...incomingLog,
            draft: currentDraft
          };
        });
        lastChatMessageCountRef.current = incomingCount;
        lastChatRefreshAtRef.current = Date.now();
        setProjectId(data.id);
        if (!silent) alert("Chat oppdatert.");
        return;
      }
      unpackData(cloudData, true);
      lastChatMessageCountRef.current = (incomingLog.messages || []).length;
      lastChatRefreshAtRef.current = Date.now();
      setProjectId(data.id);
      if (!silent) alert("Prosjektdata oppdatert.");
    };
    const applyProfile = (row) => {
      if (!row) return;
      setProfile(row);
      setCompany((c) => ({
        ...c,
        companyName: row.company_name || c.companyName || "Expo Proffsenter",
        orgNumber: row.org_number || "",
        address: row.address || "",
        phone: row.phone || "",
        email: row.email || "",
        website: row.website || "",
        logoUrl: row.logo_url || c.logoUrl || ""
      }));
    };
    const ensureProfile = async (sessionUser) => {
      if (!sessionUser) return null;
      setProfileLoading(true);
      let { data, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).maybeSingle();
      if (error) {
        console.error(error);
        alert("Kunne ikke hente brukerprofil: " + error.message);
        setProfileLoading(false);
        return null;
      }
      if (!data) {
        const { data: inserted, error: insertError } = await supabase.from("profiles").insert({ id: sessionUser.id, email: sessionUser.email, approved: false }).select("*").single();
        if (insertError) {
          console.error(insertError);
          alert("Kunne ikke opprette brukerprofil: " + insertError.message);
          setProfileLoading(false);
          return null;
        }
        data = inserted;
      }
      applyProfile(data);
      setProfileLoading(false);
      return data;
    };
    const handleAuthUser = async (sessionUser) => {
      setAuthUser(sessionUser);
      if (!sessionUser) {
        setProjects([]);
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      const row = await ensureProfile(sessionUser);
      if (row?.approved) loadProjects(sessionUser);
    };
    (0, import_react.useEffect)(() => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
      const id = params.get("project");
      const isRecoveryLink = params.get("type") === "recovery" || hashParams.get("type") === "recovery";
      if (isRecoveryLink) {
        setPasswordRecovery(true);
      }
      if (id && !isRecoveryLink) {
        openProjectById(id);
        if ((params.get("access") || params.get("role")) === "underleverandor") setTab("produkter");
        if ((params.get("access") || params.get("role")) !== "admin") {
          setAuthLoading(false);
          return;
        }
      }
      supabase.auth.getSession().then(({ data }) => {
        handleAuthUser(data.session?.user || null).finally(() => setAuthLoading(false));
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === "PASSWORD_RECOVERY") {
          setPasswordRecovery(true);
        }
        handleAuthUser(session?.user || null);
      });
      return () => listener.subscription.unsubscribe();
    }, []);
    (0, import_react.useEffect)(() => {
      if (!projectId) return;
      const chatVisible = isReadOnly || tab === "chat" || customerTab === "chat";
      if (!chatVisible) return;
      let cancelled = false;
      const applyChatData = (row) => {
        if (!row || cancelled) return;
        const cloudData = dataFromRow(row);
        const incomingLog = normalizeProjectLog(cloudData.projectLog);
        const incomingCount = (incomingLog.messages || []).length;
        setProjectLog((prev) => ({
          ...incomingLog,
          draft: prev?.draft || ""
        }));
        lastChatMessageCountRef.current = incomingCount;
        lastChatRefreshAtRef.current = Date.now();
        setProjectId(row.id);
      };
      const channel = supabase.channel(`project-chat-${projectId}`).on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        (payload) => applyChatData(payload.new)
      ).subscribe();
      refreshProjectFromCloud(true);
      const timer = window.setInterval(() => {
        refreshProjectFromCloud(true);
      }, 5e3);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
        supabase.removeChannel(channel);
      };
    }, [projectId, isReadOnly, tab, customerTab]);
    (0, import_react.useEffect)(() => {
      if (!isReadOnly) {
        loadFdvRegister(false);
        loadProductMaster(false);
      }
    }, [isReadOnly]);
    const createNewProject = () => {
      const hasContent = projectId || project.projectName || project.address || project.postnr || project.city || project.customer || project.customerEmail || project.customerPhone || project.notes || project.projectDescription || project.projectInfoIncludeInReport || project.fall || project.fallDusj || project.fallUtenfor || project.sluk || project.terskel || project.membran || project.prosjekteringKommentar || (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).length || Object.keys(checked || {}).length || Object.keys(productDocs || {}).length || (Array.isArray(manualProducts) ? manualProducts.length : Object.values(manualProducts || {}).some((list) => (list || []).length)) || Object.keys(other || {}).length || Object.keys(surf || {}).length || (photos || []).length || (access || []).length || (inst || []).length || (files || []).length || Object.keys(checklist || {}).length || tilbud.enabled || tilbud.tillegg || tilbud.fradrag || tilbud.kommentar || (tilbud.files || []).length || overtagelse.enabled || overtagelse.kommentar || overtagelse.signUtf\u00F8rende || overtagelse.signKunde || overtagelse.signUtf\u00F8rendeImage || overtagelse.signKundeImage || warranty.enabled || warranty.issued || warranty.system || projectLog.enabled || projectLog.draft || (projectLog.messages || []).length || internalNotes;
      if (hasContent && !window.confirm("Starte nytt prosjekt? Ulagrede endringer vil g\xE5 tapt.")) return;
      setProject(emptyProject());
      setChecked({});
      setProductDocs({});
      setManualProducts({});
      setOther({});
      setSurf({});
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setWarranty(emptyWarranty());
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setMobileCreatingProject(true);
      setTab("prosjekt");
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    };
    const addProsjekteringPunkt = () => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: [
          ...Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : [],
          { id: uid(), title: "", value: "" }
        ]
      }));
    };
    const updateProsjekteringPunkt = (id, patch) => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: (Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : []).map(
          (point) => point.id === id ? { ...point, ...patch } : point
        )
      }));
    };
    const removeProsjekteringPunkt = (id) => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: (Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : []).filter((point) => point.id !== id)
      }));
    };
    const updateProductDoc = (productName, patch) => {
      setProductDocs((prev) => ({
        ...prev,
        [productName]: {
          ...prev[productName] || {},
          ...patch
        }
      }));
    };
    const toggleProductChecked = (productName, isChecked) => {
      setChecked((prev) => ({ ...prev, [productName]: isChecked }));
      if (!isChecked) return;
      const masterRow = productMasterByProduct[productName];
      const registerRow = fdvRegisterByProduct[productName];
      const autoDocs = {
        fdvUrl: masterRow?.fdv_url || registerRow?.fdv_url || masterRow?.datablad_url || "",
        databladUrl: masterRow?.datablad_url || "",
        dopUrl: masterRow?.dop_url || "",
        epdUrl: masterRow?.epd_url || "",
        sikkerhetsdatabladUrl: masterRow?.sikkerhetsdatablad_url || "",
        documentFileUrl: masterRow?.document_file_url || "",
        fdvSource: masterRow ? "product-master" : registerRow ? "admin-register" : ""
      };
      if (!Object.values(autoDocs).some(hasValue)) return;
      setProductDocs((prev) => {
        const current = prev[productName] || {};
        return {
          ...prev,
          [productName]: {
            ...current,
            fdvUrl: hasValue(current.fdvUrl) ? current.fdvUrl : autoDocs.fdvUrl,
            databladUrl: hasValue(current.databladUrl) ? current.databladUrl : autoDocs.databladUrl,
            dopUrl: hasValue(current.dopUrl) ? current.dopUrl : autoDocs.dopUrl,
            epdUrl: hasValue(current.epdUrl) ? current.epdUrl : autoDocs.epdUrl,
            sikkerhetsdatabladUrl: hasValue(current.sikkerhetsdatabladUrl) ? current.sikkerhetsdatabladUrl : autoDocs.sikkerhetsdatabladUrl,
            documentFileUrl: hasValue(current.documentFileUrl) ? current.documentFileUrl : autoDocs.documentFileUrl,
            fdvSource: current.fdvSource || autoDocs.fdvSource
          }
        };
      });
    };
    const addManualProduct = (section) => {
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: [
            ...normalized[section] || [],
            { id: uid(), name: "", fdvUrl: "", comment: "" }
          ]
        };
      });
    };
    const updateManualProduct = (section, id, patch) => {
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: (normalized[section] || []).map((p) => p.id === id ? { ...p, ...patch } : p)
        };
      });
    };
    const removeManualProduct = (section, id) => {
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: (normalized[section] || []).filter((p) => p.id !== id)
        };
      });
    };
    const markChatAsRead = async (reader = "admin") => {
      if (!projectId) return;
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const key = reader === "customer" ? "lastReadByCustomer" : "lastReadByAdmin";
      let nextLogForSave = null;
      setProjectLog((prev) => {
        const normalized = normalizeProjectLog(prev);
        nextLogForSave = { ...normalized, [key]: timestamp };
        return nextLogForSave;
      });
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          if (fetchError) console.warn("Kunne ikke markere chat som lest:", fetchError.message);
          return;
        }
        const existingData = dataFromRow(existing);
        const existingLog = normalizeProjectLog(existingData.projectLog);
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          projectLog: {
            ...existingLog,
            [key]: timestamp,
            draft: ""
          }
        }));
        const { error } = await supabase.from("projects").update({
          data: cleanData,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (error) console.warn("Kunne ikke markere chat som lest:", error.message);
      } catch (error) {
        console.warn("Kunne ikke markere chat som lest:", error);
      }
    };
    const notifyChatMessage = async ({ toEmail, direction, message }) => {
      if (!toEmail || !message?.text) return;
      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail,
            direction,
            projectId,
            projectName: project.projectName || project.address || "Prosjekt",
            customerName: project.customer || "Kunde",
            customerEmail: project.customerEmail || "",
            companyName: company.companyName || name || "Expo ProffDok",
            fromName: message.by || "Ukjent",
            message: message.text,
            projectLink: projectId ? makeProjectLink(projectId, direction === "to_owner" ? "admin" : "kunde") : ""
          }
        });
        if (error) {
          console.warn("E-postvarsling kunne ikke sendes:", error.message);
        }
      } catch (error) {
        console.warn("E-postvarsling kunne ikke sendes:", error);
      }
    };
    const ownerNotificationEmail = () => user.email || authUser?.email || company.email || profile?.email || "";
    const addProjectLogMessage = async () => {
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r chatmelding med bilde kan lagres p\xE5 prosjektet.");
      const text = (projectLog.draft || "").trim();
      if (!text && !chatUploadFile) return alert("Skriv en melding eller velg et bilde f\xF8rst.");
      let uploadedImage = null;
      if (chatUploadFile) {
        uploadedImage = await uploadChatImage(chatUploadFile, projectId, "admin");
        if (!uploadedImage) return;
      }
      const message = {
        id: uid(),
        text,
        by: user.name || authUser?.email || "Utf\xF8rende",
        role: "utf\xF8rende",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        imageUrl: uploadedImage?.imageUrl || "",
        imageName: uploadedImage?.imageName || "",
        imagePath: uploadedImage?.imagePath || ""
      };
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt f\xF8r melding ble lagret: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er l\xE5st og chatmeldingen kan ikke lagres. L\xE5s opp prosjektet f\xF8rst.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: "",
        lastReadByAdmin: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [...existingLog.messages || [], message]
      };
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        project: { ...emptyProject(), ...existingData.project || {}, ...project },
        projectLog: updatedLog,
        internalNotes
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre chatmelding p\xE5 prosjektet: " + error.message);
      }
      setChatUploadFile(null);
      const fileInput = document.getElementById("admin-chat-image-input");
      if (fileInput) fileInput.value = "";
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow));
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await notifyChatMessage({
        toEmail: project.customerEmail,
        direction: "to_customer",
        message
      });
      alert(project.customerEmail ? "\u2714 Melding sendt og lagret p\xE5 prosjektet. E-postvarsling fors\xF8kt sendt til kunde." : "\u2714 Melding lagret p\xE5 prosjektet. Legg inn kunde e-post for e-postvarsling.");
    };
    const removeProjectLogMessage = async (id) => {
      if (!id) return;
      if (!window.confirm("Vil du fjerne denne chatmeldingen fra prosjektet?")) return;
      if (!projectId) {
        setProjectLog((prev) => ({
          ...prev,
          messages: (prev.messages || []).filter((m) => m.id !== id)
        }));
        return;
      }
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt før meldingen ble fjernet: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er låst. Lås opp prosjektet før chatmeldinger kan fjernes.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: projectLog?.draft || existingLog.draft || "",
        messages: (existingLog.messages || []).filter((m) => m.id !== id)
      };
      if ((existingLog.messages || []).length === updatedLog.messages.length) {
        return alert("Fant ikke meldingen i lagret prosjektdata. Oppdater chat og prøv igjen.");
      }
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        projectLog: updatedLog
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke fjerne chatmelding fra prosjektet: " + error.message);
      }
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow), true);
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await loadProjects(authUser);
      alert("Chatmelding fjernet fra prosjektet.");
    };
    const saveCustomerChatMessage = async () => {
      if (!projectId) return alert("Prosjektet mangler ID.");
      const text = (projectLog.draft || "").trim();
      if (!text && !customerChatUploadFile) return alert("Skriv en melding eller velg et bilde f\xF8rst.");
      let uploadedImage = null;
      if (customerChatUploadFile) {
        uploadedImage = await uploadChatImage(customerChatUploadFile, projectId, "kunde");
        if (!uploadedImage) return;
      }
      const message = {
        id: uid(),
        text,
        by: project.customer || "Kunde",
        role: "kunde",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        imageUrl: uploadedImage?.imageUrl || "",
        imageName: uploadedImage?.imageName || "",
        imagePath: uploadedImage?.imagePath || ""
      };
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt f\xF8r melding ble lagret: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er l\xE5st og chatmeldingen kan ikke lagres. Kontakt prosjektansvarlig hvis noe m\xE5 korrigeres.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: "",
        lastReadByCustomer: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [...existingLog.messages || [], message]
      };
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        projectLog: updatedLog
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre melding: " + error.message);
      }
      setCustomerChatUploadFile(null);
      const fileInput = document.getElementById("customer-chat-image-input");
      if (fileInput) fileInput.value = "";
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow));
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await notifyChatMessage({
        toEmail: ownerNotificationEmail(),
        direction: "to_owner",
        message
      });
      alert(ownerNotificationEmail() ? "\u2714 Melding sendt og lagret p\xE5 prosjektet. E-postvarsling fors\xF8kt sendt til utf\xF8rende." : "\u2714 Melding sendt og lagret p\xE5 prosjektet.");
    };
    const saveProject = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 lagre prosjekt.");
      const snapshot = {
        ...latestStateRef.current || {},
        company,
        user,
        project,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      };
      const makeCleanData = (projectOverride = snapshot.project, projectLogOverride = snapshot.projectLog) => JSON.parse(JSON.stringify({
        company: snapshot.company,
        user: snapshot.user,
        project: { ...emptyProject(), ...projectOverride },
        checked: snapshot.checked,
        productDocs: snapshot.productDocs,
        manualProducts: snapshot.manualProducts,
        other: snapshot.other,
        surf: snapshot.surf,
        photos: snapshot.photos,
        access: snapshot.access,
        inst: snapshot.inst,
        files: snapshot.files,
        checklist: snapshot.checklist,
        tilbud: snapshot.tilbud,
        overtagelse: snapshot.overtagelse,
        warranty: snapshot.warranty || emptyWarranty(),
        projectLog: projectLogOverride,
        internalNotes: snapshot.internalNotes
      }));
      if (projectId) {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError) {
          console.error(fetchError);
          return alert("Kunne ikke kontrollere prosjektstatus: " + fetchError.message);
        }
        if (!existing) {
          return alert("Fant ikke prosjektet. \xC5pne prosjektet p\xE5 nytt fra prosjektlisten.");
        }
        const existingProject = projectFromRow(existing, existing?.data?.project || {});
        if (rowIsLocked(existing) || isProjectLocked) {
          const lockedProject = existingProject;
          setProject(lockedProject);
          return alert("Prosjektet er l\xE5st. L\xE5s opp prosjektet f\xF8r du lagrer endringer.");
        }
        const saveProjectData = {
          ...emptyProject(),
          ...snapshot.project || {},
          locked: false,
          status: "active",
          lockedAt: "",
          lockedBy: ""
        };
        const saveProjectLog = {
          ...normalizeProjectLog(snapshot.projectLog),
          draft: ""
        };
        const cleanData = makeCleanData(saveProjectData, saveProjectLog);
        const payload = {
          title: saveProjectData.projectName || saveProjectData.address || "Uten navn",
          data: cleanData,
          user_id: existing.user_id || authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        let updatedRow = null;
        const updateResult = await supabase.from("projects").update(payload).eq("id", projectId).select("*").maybeSingle();
        if (updateResult.error) {
          console.error(updateResult.error);
          return alert("Kunne ikke oppdatere prosjekt i sky: " + updateResult.error.message);
        }
        updatedRow = updateResult.data || null;
        if (!updatedRow) {
          const verifyResult = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (verifyResult.error) {
            console.error(verifyResult.error);
          } else {
            updatedRow = verifyResult.data || null;
          }
        }
        const matchesSavedProject = (row) => {
          const saved = row?.data?.project || {};
          return (saved.projectName || "") === (saveProjectData.projectName || "") && (saved.address || "") === (saveProjectData.address || "") && (saved.postnr || "") === (saveProjectData.postnr || "") && (saved.city || "") === (saveProjectData.city || "") && (saved.customer || "") === (saveProjectData.customer || "") && (saved.customerEmail || "") === (saveProjectData.customerEmail || "") && (saved.customerPhone || "") === (saveProjectData.customerPhone || "") && (saved.notes || "") === (saveProjectData.notes || "");
        };
        if (updatedRow && matchesSavedProject(updatedRow)) {
          unpackData(dataFromRow(updatedRow), false);
          setProjectId(updatedRow.id);
          await loadProjects(authUser);
          return alert("\u2714 Prosjekt oppdatert og bekreftet lagret");
        }
        const shouldCopy = window.confirm(
          "Prosjektet ble ikke oppdatert i gammel rad. Dette skyldes sannsynligvis Supabase-policy/eierskap p\xE5 gamle prosjekter.\n\nVil du lagre dette som en ny oppdatert kopi n\xE5, slik at endringene ikke g\xE5r tapt?"
        );
        if (!shouldCopy) {
          setProject(saveProjectData);
          setProjectLog(saveProjectLog);
          latestStateRef.current = { ...snapshot, project: saveProjectData, projectLog: saveProjectLog };
          return alert("Endringene st\xE5r fortsatt p\xE5 skjermen, men er ikke bekreftet lagret i Supabase.");
        }
        const copyPayload = {
          title: saveProjectData.projectName || saveProjectData.address || "Uten navn",
          data: cleanData,
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const { data: copyRow, error: copyError } = await supabase.from("projects").insert(copyPayload).select().single();
        if (copyError) {
          console.error(copyError);
          return alert("Kunne ikke lagre kopi heller: " + copyError.message);
        }
        setProjectId(copyRow.id);
        unpackData(dataFromRow(copyRow), false);
        await loadProjects(authUser);
        return alert("\u2714 Gammel rad kunne ikke oppdateres, men prosjektet er lagret som ny oppdatert kopi.");
      } else {
        const newProjectData = {
          ...emptyProject(),
          ...snapshot.project || {},
          locked: false,
          status: "active",
          lockedAt: "",
          lockedBy: ""
        };
        const newProjectLog = {
          ...normalizeProjectLog(snapshot.projectLog),
          draft: ""
        };
        const payload = {
          title: newProjectData.projectName || newProjectData.address || "Uten navn",
          data: makeCleanData(newProjectData, newProjectLog),
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const { data, error } = await supabase.from("projects").insert(payload).select().single();
        if (error) {
          console.error(error);
          return alert("Kunne ikke lagre i sky: " + error.message);
        }
        setProjectId(data.id);
        setMobileCreatingProject(false);
        unpackData(dataFromRow(data), false);
        alert("\u2714 Prosjekt lagret");
      }
      loadProjects(authUser);
    };
    const saveSharedProject = async () => {
      if (!projectId) return alert("Prosjektet mangler ID og kan ikke lagres fra delingslink.");
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke kontrollere prosjektstatus f\xF8r lagring: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      const existingProject = projectFromRow(existing, existing.data?.project || {});
      if (rowIsLocked(existing) || isProjectLocked) {
        const lockedProject = existingProject;
        setProject(lockedProject);
        return alert("Prosjektet er l\xE5st og kan ikke endres. Kontakt prosjektansvarlig hvis noe m\xE5 korrigeres.");
      }
      const safeProject = {
        ...emptyProject(),
        ...project,
        locked: false,
        status: "active",
        lockedAt: "",
        lockedBy: ""
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: safeProject,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      }));
      const payload = {
        title: safeProject.projectName || safeProject.address || "Uten navn",
        data: cleanData,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { error } = await supabase.from("projects").update(payload).eq("id", projectId);
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre fra delingslink. Sjekk Supabase-policy for delt tilgang: " + error.message);
      }
      setProject(safeProject);
      alert("\u2714 Bidrag lagret p\xE5 prosjektet " + (/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO"));
    };
    const setProjectLockedState = async (locked) => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 endre prosjektstatus.");
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r det kan l\xE5ses eller l\xE5ses opp.");
      const message = locked ? "Vil du avslutte og l\xE5se prosjektet? Ingen kan lagre endringer f\xF8r prosjektet l\xE5ses opp igjen." : "Vil du l\xE5se opp prosjektet slik at endringer kan lagres igjen?";
      if (!window.confirm(message)) return;
      const { data, error } = await supabase.rpc("set_project_lock", {
        p_project_id: projectId,
        p_locked: !!locked,
        p_locked_by: authUser.email || user.email || user.name || "Ukjent"
      });
      if (error) {
        console.error(error);
        return alert("Kunne ikke oppdatere prosjektstatus: " + error.message);
      }
      const updatedRow = Array.isArray(data) ? data[0] : data;
      if (!updatedRow) {
        return alert("Prosjektstatus ble ikke oppdatert. \xC5pne prosjektet p\xE5 nytt og pr\xF8v igjen.");
      }
      const updatedData = dataFromRow(updatedRow, updatedRow.data || packData());
      unpackData(updatedData);
      alert(locked ? "\u{1F512} Prosjektet er avsluttet og l\xE5st." : "\u{1F513} Prosjektet er l\xE5st opp igjen.");
      loadProjects(authUser);
    };
    const saveAsNewProject = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 lagre prosjekt.");
      const projectTitle = project.projectName || project.address || project.customer || "Uten navn";
      const hasProjectContent = projectId || project.projectName || project.address || project.customer || project.customerEmail || project.customerPhone || project.notes || project.projectDescription || Object.keys(checked || {}).length || (photos || []).length || Object.keys(checklist || {}).length || (inst || []).length || (files || []).length || (projectLog?.messages || []).length;
      if (!hasProjectContent) return alert("Det finnes ikke nok prosjektinnhold til \xE5 lagre en kopi enn\xE5.");
      const confirmText = projectId
        ? `Lagre en NY kopi av prosjektet "${projectTitle}"?\n\nDette lager en separat prosjektrad. Bruk heller "Oppdater prosjekt" hvis du bare skal lagre vanlige endringer p\xE5 dagens prosjekt.`
        : `Dette prosjektet er ikke lagret fra f\xF8r. Vanlig valg er "Lagre / oppdater prosjekt".\n\nVil du likevel lagre dette som en egen kopi?`;
      if (!window.confirm(confirmText)) return;
      if (isProjectLocked && !window.confirm("Prosjektet du kopierer er l\xE5st. Kopien blir opprettet som \xE5pen/ul\xE5st slik at den kan redigeres. Fortsette?")) return;
      const unlockedProject = { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" };
      const cleanProjectLog = { ...normalizeProjectLog(projectLog), draft: "" };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: unlockedProject,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog: cleanProjectLog,
        internalNotes
      }));
      const payload = {
        title: projectTitle,
        data: cleanData,
        user_id: authUser.id,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre som ny kopi: " + error.message);
      }
      setProjectId(data.id);
      setMobileCreatingProject(false);
      unpackData(dataFromRow(data), false);
      await loadProjects(authUser);
      alert(`\u2714 Kopi lagret. Du jobber n\xE5 i den nye kopien av "${projectTitle}".`);
    };
    const deleteProject = async (id) => {
      if (!window.confirm("Er du sikker p\xE5 at du vil slette prosjektet?")) return;
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 slette prosjekt.");
      const { data, error } = await supabase.from("projects").delete().eq("id", id).select("id");
      if (error) {
        console.error(error);
        return alert("Kunne ikke slette prosjekt: " + error.message);
      }
      if (!data || data.length === 0) {
        return alert("Prosjektet ble ikke slettet. Det skyldes sannsynligvis tilgang/eierskap p\xE5 gammel prosjektrad i Supabase.");
      }
      setProjects((prev) => (prev || []).filter((p) => p.id !== id));
      if (id === projectId) {
        setProjectId(null);
        setMobileCreatingProject(false);
        setTab("prosjekt");
      }
      await loadProjects(authUser);
      alert("Prosjekt slettet.");
    };
    const saveProjectForLink = async () => {
      if (projectId) return projectId;
      if (!authUser) {
        alert("Du m\xE5 v\xE6re logget inn for \xE5 lage delingslink.");
        return null;
      }
      const newProjectData = {
        ...emptyProject(),
        ...project,
        locked: false,
        status: "active",
        lockedAt: "",
        lockedBy: ""
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: newProjectData,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      }));
      const payload = {
        title: newProjectData.projectName || newProjectData.address || "Uten navn",
        data: cleanData,
        user_id: authUser.id,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) {
        console.error(error);
        alert("Kunne ikke lagre prosjekt f\xF8r deling: " + error.message);
        return null;
      }
      setProjectId(data.id);
      setMobileCreatingProject(false);
      setProject(newProjectData);
      loadProjects(authUser);
      return data.id;
    };
    const makeProjectLink = (id, role = "kunde") => {
      if (role === "admin") {
        return `${window.location.origin}${window.location.pathname}?project=${id}&role=admin`;
      }
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      return roleParam === "underleverandor" ? `${window.location.origin}${window.location.pathname}?project=${id}&access=underleverandor` : `${window.location.origin}${window.location.pathname}?project=${id}&role=kunde`;
    };
    const copyLinkToClipboard = async (link, successMessage) => {
      try {
        await navigator.clipboard.writeText(link);
        alert(successMessage);
      } catch {
        prompt("Kopier denne linken:", link);
      }
    };
    const shareProject = async () => {
      const id = await saveProjectForLink();
      if (!id) return;
      await copyLinkToClipboard(makeProjectLink(id, "kunde"), "Kundelink kopiert.");
    };
    const copyAccessLink = async (role = "kunde") => {
      const id = await saveProjectForLink();
      if (!id) return;
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      await copyLinkToClipboard(
        makeProjectLink(id, role),
        roleParam === "underleverandor" ? "Underentrepren\xF8r-link kopiert." : "Kundelink kopiert."
      );
    };
    const sendAccessEmail = async ({ role = "kunde", toEmail = "", recipientName = "" } = {}) => {
      const cleanEmail = String(toEmail || "").trim();
      if (!cleanEmail) return alert("Legg inn e-postadresse før du sender tilgang.");
      const id = await saveProjectForLink();
      if (!id) return;
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      const link = makeProjectLink(id, role);
      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail: cleanEmail,
            direction: roleParam === "underleverandor" ? "access_underleverandor" : "access_kunde",
            accessRole: roleParam === "underleverandor" ? "underentreprenør" : "kunde",
            projectId: id,
            projectName: project.projectName || project.address || "Prosjekt",
            customerName: recipientName || project.customer || "Mottaker",
            customerEmail: project.customerEmail || "",
            companyName: company.companyName || name || "Expo ProffDok",
            fromName: user.name || authUser?.email || "Prosjektleder",
            message: accessEmailMessage || "Du har fått tilgang til prosjektet.",
            projectLink: link,
            subject: `Tilgang til prosjekt: ${project.projectName || project.address || "Prosjekt"}`
          }
        });
        if (error) {
          console.warn("Tilgangs-e-post kunne ikke sendes:", error.message);
          await copyLinkToClipboard(link, "E-post kunne ikke sendes, men linken er kopiert.");
          return;
        }
        alert("✔ E-post med tilgangslink er sendt.");
      } catch (error) {
        console.warn("Tilgangs-e-post kunne ikke sendes:", error);
        await copyLinkToClipboard(link, "E-post kunne ikke sendes, men linken er kopiert.");
      }
    };
    const completeOvertagelseAndLock = async () => {
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r overtagelse kan fullf\xF8res.");
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 fullf\xF8re overtagelse.");
      const utf\u00F8rendeSigned = hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signUtf\u00F8rendeImage);
      const kundeSigned = hasValue(overtagelse.signKunde) || hasValue(overtagelse.signKundeImage);
      if (!utf\u00F8rendeSigned || !kundeSigned) {
        return alert("B\xE5de utf\xF8rende og kunde m\xE5 signere f\xF8r overtagelse kan fullf\xF8res.");
      }
      const completedOvertagelse = {
        ...emptyOvertagelse(),
        ...overtagelse,
        enabled: true,
        dato: overtagelse.dato || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" },
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse: completedOvertagelse,
        warranty,
        projectLog,
        internalNotes
      }));
      const { error: saveError } = await supabase.from("projects").update({
        data: cleanData,
        title: project.projectName || project.address || "Uten navn",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).eq("user_id", authUser.id);
      if (saveError) {
        console.error(saveError);
        return alert("Kunne ikke lagre overtagelse f\xF8r l\xE5sing: " + saveError.message);
      }
      setOvertagelse(completedOvertagelse);
      await setProjectLockedState(true);
    };
    const uploadLogo = async (file) => {
      if (!authUser || !file) return;
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `logos/${authUser.id}/${Date.now()}-${cleanName}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: true });
      if (error) return alert("Kunne ikke laste opp logo: " + error.message);
      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      setCompany((c) => ({ ...c, logoUrl: data.publicUrl }));
      alert("Logo lastet opp. Husk \xE5 trykke Lagre firmaprofil.");
    };
    const saveProfile = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn.");
      const payload = {
        id: authUser.id,
        email: company.email || authUser.email,
        company_name: company.companyName || "",
        org_number: company.orgNumber || "",
        address: company.address || "",
        phone: company.phone || "",
        website: company.website || "",
        logo_url: company.logoUrl || ""
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", authUser.id);
      if (error) return alert("Kunne ikke lagre firmaprofil: " + error.message);
      const row = { ...profile || {}, ...payload };
      applyProfile(row);
      alert("Firmaprofil lagret");
    };
    const loadAdminUsers = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      setAdminLoading(true);
      const { data, error } = await supabase.from("profiles").select("id,email,approved,company_name,created_at").order("created_at", { ascending: false });
      setAdminLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente brukere. Sjekk at Supabase-policy tillater admin \xE5 lese profiles.");
      }
      setAdminUsers(data || []);
    };
    const approveAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke godkjenne bruker: " + error.message);
      }
      alert("Bruker er godkjent.");
      loadAdminUsers();
    };
    const revokeAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      if (!window.confirm("Vil du fjerne godkjenning for denne brukeren?")) return;
      const { error } = await supabase.from("profiles").update({ approved: false }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke fjerne godkjenning: " + error.message);
      }
      alert("Godkjenning er fjernet.");
      loadAdminUsers();
    };
    const loadFdvRegister = async (notify = false) => {
      setFdvLoading(true);
      const { data, error } = await supabase.from("fdv_register").select("*").order("section", { ascending: true }).order("product_name", { ascending: true });
      setFdvLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente FDV-register. Kj\xF8r SQL-oppsettet f\xF8rst og sjekk Supabase-policy: " + error.message);
      }
      setFdvRegister(data || []);
      if (notify) alert(`FDV-register oppdatert. Fant ${(data || []).length} produkter.`);
    };
    const seedFdvRegister = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til FDV-register.");
      if (!window.confirm("Vil du legge inn alle standardproduktene i FDV-registeret? Eksisterende produkter oppdateres ikke, men manglende produkter legges til.")) return;
      setFdvLoading(true);
      const rows = productSections.flatMap((section) => section.items.map((productName) => ({
        section: section.title,
        product_name: productName,
        fdv_url: "",
        comment: "",
        active: true,
        updated_by: authUser?.email || ""
      })));
      const { error } = await supabase.from("fdv_register").upsert(rows, { onConflict: "product_name" });
      setFdvLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke opprette standardprodukter i FDV-register: " + error.message);
      }
      await loadFdvRegister(false);
      alert("FDV-register er klargjort med standardprodukter.");
    };
    const saveFdvRegisterRow = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til FDV-register.");
      if (!row?.product_name) return alert("Produktnavn mangler.");
      const payload = {
        section: row.section || "",
        product_name: row.product_name,
        fdv_url: row.fdv_url || "",
        comment: row.comment || "",
        active: row.active !== false,
        updated_by: authUser?.email || ""
      };
      const { data, error } = await supabase.from("fdv_register").upsert(payload, { onConflict: "product_name" }).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre FDV-produkt: " + error.message);
      }
      setFdvRegister((prev) => {
        const exists = (prev || []).some((x) => x.product_name === data.product_name);
        return exists ? prev.map((x) => x.product_name === data.product_name ? data : x) : [...prev || [], data].sort((a, b) => `${a.section}${a.product_name}`.localeCompare(`${b.section}${b.product_name}`));
      });
      alert("FDV-produkt lagret.");
    };
    const updateFdvRegisterLocal = (productName, patch) => {
      setFdvRegister((prev) => {
        const list = prev || [];
        const exists = list.some((row) => row.product_name === productName);
        if (!exists) return [...list, { product_name: productName, section: patch.section || "", fdv_url: "", comment: "", active: true, ...patch }];
        return list.map((row) => row.product_name === productName ? { ...row, ...patch } : row);
      });
    };
    const loadProductMaster = async (notify = false) => {
      setProductMasterLoading(true);
      const { data, error } = await supabase.from("product_document_master").select("*").order("category", { ascending: true }).order("product_family", { ascending: true }).order("product_name", { ascending: true });
      setProductMasterLoading(false);
      if (error) {
        console.warn("Kunne ikke hente produktmaster:", error.message);
        if (notify) alert("Kunne ikke hente produktmaster. Sjekk at SQL-filen er kj\xF8rt i Supabase: " + error.message);
        return;
      }
      setProductMaster(data || []);
      if (notify) alert(`Produktmaster oppdatert. Fant ${(data || []).length} produkter/varianter.`);
    };
    const updateProductMasterLocal = (productNo, patch) => {
      setProductMaster((prev) => (prev || []).map((row) => row.product_no === productNo ? { ...row, ...patch } : row));
    };
    const saveProductMasterRow = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      if (!row?.product_no) return alert("Varenummer mangler.");
      const payload = {
        fdv_url: row.fdv_url || "",
        datablad_url: row.datablad_url || "",
        dop_url: row.dop_url || "",
        epd_url: row.epd_url || "",
        sikkerhetsdatablad_url: row.sikkerhetsdatablad_url || "",
        document_file_url: row.document_file_url || "",
        comment: row.comment || "",
        active: row.active !== false
      };
      const { data, error } = await supabase.from("product_document_master").update(payload).eq("product_no", row.product_no).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre produktmaster-rad: " + error.message);
      }
      setProductMaster((prev) => (prev || []).map((x) => x.product_no === data.product_no ? data : x));
      alert("Produktdokumentasjon lagret.");
    };
    const syncCurrentProjectProducts = async () => {
      try {
        const checkedNames = productSections.flatMap((section) => section.items).filter((name) => checked?.[name]);
        if (!checkedNames.length) return alert("Ingen standardprodukter er valgt i dette prosjektet.");
        let updatedCount = 0;
        let missingCount = 0;
        const nextProductDocs = { ...productDocs };
        checkedNames.forEach((productName) => {
          const current = nextProductDocs[productName] || {};
          const merged = mergeProductDocs(productName, current);
          const hasAutoDocs = [merged.fdvUrl, merged.databladUrl, merged.dopUrl, merged.epdUrl, merged.sikkerhetsdatabladUrl, merged.documentFileUrl].some(hasValue);
          if (!hasAutoDocs) {
            missingCount += 1;
            return;
          }
          const keys = ["fdvUrl", "databladUrl", "dopUrl", "epdUrl", "sikkerhetsdatabladUrl", "documentFileUrl", "fdvSource"];
          const changed = keys.some((key) => (current[key] || "") !== (merged[key] || ""));
          if (changed) updatedCount += 1;
          nextProductDocs[productName] = merged;
        });
        setProductDocs(nextProductDocs);
        let savedToCloud = false;
        if (projectId && authUser) {
          const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (fetchError || !existing) {
            console.error(fetchError);
            return alert("Synk er gjort på skjermen, men prosjektet kunne ikke lagres automatisk: " + (fetchError?.message || "Fant ikke prosjekt"));
          }
          if (rowIsLocked(existing)) return alert("Prosjektet er låst. Lås opp prosjektet før dokumentlinker synkes og lagres.");
          const existingData = dataFromRow(existing);
          const cleanData = JSON.parse(JSON.stringify({
            ...existingData,
            company,
            user,
            project: { ...emptyProject(), ...existingData.project || {}, ...project },
            checked,
            productDocs: nextProductDocs,
            manualProducts,
            other,
            surf,
            photos,
            access,
            inst,
            files,
            checklist,
            tilbud,
            overtagelse,
            warranty,
            projectLog,
            internalNotes
          }));
          const { error: updateError } = await supabase.from("projects").update({
            data: cleanData,
            title: project.projectName || project.address || existing.title || "Uten navn",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", projectId);
          if (updateError) {
            console.error(updateError);
            return alert("Synk er gjort på skjermen, men kunne ikke lagres i Supabase: " + updateError.message);
          }
          savedToCloud = true;
        }
        const saveText = savedToCloud ? " Prosjektet er lagret." : " Trykk Lagre / oppdater prosjekt for å lagre endringen.";
        if (updatedCount > 0) return alert(`Synk fullført. ${updatedCount} produkt${updatedCount === 1 ? "" : "er"} fikk dokumentlinker oppdatert.${missingCount ? ` ${missingCount} valgt${missingCount === 1 ? "" : "e"} produkt${missingCount === 1 ? "" : "er"} manglet match i produktmaster.` : ""}${saveText}`);
        if (missingCount > 0) return alert(`Synk fullført, men ingen nye dokumentlinker ble lagt til. ${missingCount} valgt${missingCount === 1 ? "" : "e"} produkt${missingCount === 1 ? "" : "er"} manglet match i produktmaster.${saveText}`);
        return alert("Synk fullført. Valgte produkter hadde allerede dokumentlinker." + saveText);
      } catch (error) {
        console.error("Prosjektsynk feilet:", error);
        return alert("Kunne ikke synke prosjektet. Feil: " + (error?.message || String(error)));
      }
    };
    const signIn = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail || !authPassword) return alert("Fyll inn e-post og passord.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: authPassword });
      if (error) return alert("Kunne ikke logge inn: " + error.message);
    };
    const signUp = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail || !authPassword) return alert("Fyll inn e-post og passord.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.signUp({ email: cleanEmail, password: authPassword });
      if (error) return alert("Kunne ikke opprette bruker: " + error.message);
      alert("Bruker opprettet. Kontoen m\xE5 godkjennes f\xF8r appen kan brukes.");
    };
    const resetPassword = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail) return alert("Skriv inn e-postadressen din f\xF8rst.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: "https://expo-proffdok.vercel.app"
      });
      if (error) return alert("Kunne ikke sende tilbakestilling: " + error.message);
      alert("E-post for tilbakestilling av passord er sendt. Sjekk innboksen din.");
    };
    const completePasswordReset = async () => {
      if (!newPassword || !newPasswordRepeat) return alert("Skriv inn nytt passord to ganger.");
      if (newPassword !== newPasswordRepeat) return alert("Passordene er ikke like.");
      if (newPassword.length < 6) return alert("Passordet m\xE5 v\xE6re minst 6 tegn.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return alert("Kunne ikke oppdatere passord: " + error.message);
      setNewPassword("");
      setNewPasswordRepeat("");
      setPasswordRecovery(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      await supabase.auth.signOut();
      setAuthUser(null);
      setProfile(null);
      setProjects([]);
      setTab("prosjekt");
      alert("Passordet er oppdatert. Logg inn p\xE5 nytt.");
    };
    const signOut = async () => {
      await supabase.auth.signOut();
      setProjectId(null);
      setMobileCreatingProject(false);
      setProjects([]);
      setProfile(null);
      setTab("prosjekt");
    };
    const writePrintableReport = (printWindow, title = "Expo ProffDok rapport") => {
      const reportNode = document.querySelector(".report");
      if (!reportNode) {
        if (printWindow && !printWindow.closed) printWindow.close();
        alert("Rapporten er ikke klar ennå. Prøv igjen om et øyeblikk.");
        return;
      }

      const reportClone = reportNode.cloneNode(true);
      reportClone.querySelectorAll("a[href]").forEach((link) => {
        const normalizedHref = normalizeExternalUrl(link.getAttribute("href"));
        if (!normalizedHref) return;
        link.setAttribute("href", normalizedHref);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });

      const inlineStyles = Array.from(document.querySelectorAll("style")).map((style) => style.innerHTML).join("\n");
      const reportHtml = reportClone.outerHTML;

      const printDocument = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    ${inlineStyles}
    body {
      margin: 0;
      padding: 24px;
      background: #ffffff;
      color: #0f172a;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.45;
    }
    .report {
      max-width: 920px;
      margin: 0 auto;
      background: #ffffff;
    }
    section {
      border: 1px solid #dbe7ec;
      border-radius: 18px;
      padding: 18px;
      margin: 0 0 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    h2 {
      margin: 0 0 12px;
      border-bottom: 1px solid #0f172a;
      padding-bottom: 8px;
      font-size: 22px;
    }
    h3 { margin: 14px 0 8px; }
    .out {
      border: 1px solid #dbe7ec;
      border-radius: 14px;
      padding: 10px;
      margin: 8px 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .reportTop {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .photos {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .photo img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
    }
    a[href] {
      color: #0645ad !important;
      text-decoration: underline !important;
      cursor: pointer;
      font-weight: 700;
    }
    .pdfSafeUrl {
      display: block !important;
      color: #334155 !important;
      font-size: 10px !important;
      overflow-wrap: anywhere;
      word-break: break-word;
      margin-top: 2px;
    }
    footer {
      text-align: center;
      color: #64748b;
      font-size: 12px;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    button, nav, .mobileFieldBar, .mobileNav, .mobileCurrentProjectBar, .bottomAppNav {
      display: none !important;
    }
    @media print {
      body { padding: 0; }
      a[href] {
        color: #0645ad !important;
        text-decoration: underline !important;
      }
      .pdfSafeUrl {
        display: block !important;
      }
    }
  </style>
</head>
<body>
  ${reportHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(printDocument);
      printWindow.document.close();
    };

    const printVisibleReport = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.");
        return;
      }
      setTimeout(() => writePrintableReport(printWindow), 150);
    };

    const printReport = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.");
        return;
      }
      setTab("rapport");
      setTimeout(() => writePrintableReport(printWindow), 650);
    };

    const downloadClickablePdfReport = async () => {
      try {
        const archiveConfirmed = window.confirm("Viktig før nedlasting:\n\nNår prosjektet er ferdig skal komplett PDF-rapport lagres lokalt hos utførende firma, og gjerne også oversendes kunde. Expo ProffDok benytter skylagring, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata i hele garanti- eller byggets levetid.\n\nVil du fortsette og generere komplett PDF-rapport nå?");
        if (!archiveConfirmed) return;
        const module = await import("https://esm.sh/jspdf@2.5.1");
        const JsPDF = module.jsPDF || module.default?.jsPDF;
        if (!JsPDF) throw new Error("Kunne ikke laste PDF-motor.");
        const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - margin * 2;
        let y = 16;

        const safeText = (value) => value === void 0 || value === null ? "" : String(value);
        const filenameSafe = (value) => safeText(value || "FDV-rapport").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "FDV-rapport";
        const normalizePdfUrl = (value) => normalizeExternalUrl(value);
        const ensureSpace = (height = 8) => {
          if (y + height <= pageHeight - 18) return;
          doc.addPage();
          y = 16;
        };
        const addSectionTitle = (title) => {
          ensureSpace(16);
          y += 2;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(15);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(title), margin, y);
          y += 3;
          doc.setDrawColor(15, 23, 42);
          doc.setLineWidth(0.25);
          doc.line(margin, y, pageWidth - margin, y);
          y += 7;
        };
        const addSubTitle = (title) => {
          ensureSpace(8);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(title), margin, y);
          y += 5;
        };
        const addParagraph = (value, opts = {}) => {
          const textValue = safeText(value).trim();
          if (!textValue) return;
          const size = opts.size || 9.5;
          const lineHeight = opts.lineHeight || 5;
          doc.setFont("helvetica", opts.bold ? "bold" : "normal");
          doc.setFontSize(size);
          doc.setTextColor(opts.color || 15, opts.color ? 69 : 23, opts.color ? 135 : 42);
          const lines = doc.splitTextToSize(textValue, opts.width || contentWidth);
          ensureSpace(lines.length * lineHeight + 2);
          doc.text(lines, opts.x || margin, y);
          y += lines.length * lineHeight;
        };
        const addKeyValue = (label, value) => {
          const cleanValue = safeText(value).trim() || "Ikke fylt ut";
          ensureSpace(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(label), margin, y);
          y += 4;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          const lines = doc.splitTextToSize(cleanValue, contentWidth);
          doc.text(lines, margin, y);
          y += Math.max(5, lines.length * 5);
        };
        const addLink = (label, href) => {
          const url = normalizePdfUrl(href);
          if (!url) return;
          ensureSpace(12);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(0, 84, 180);
          if (typeof doc.textWithLink === "function") {
            doc.textWithLink(safeText(label), margin, y, { url });
          } else {
            doc.text(safeText(label), margin, y);
            doc.link(margin, y - 4, Math.min(contentWidth, safeText(label).length * 2.2), 5, { url });
          }
          y += 4;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.2);
          doc.setTextColor(51, 65, 85);
          const urlLines = doc.splitTextToSize(url, contentWidth);
          ensureSpace(urlLines.length * 3.6 + 1);
          doc.text(urlLines, margin, y);
          y += urlLines.length * 3.6 + 2;
        };
        const addDivider = () => {
          ensureSpace(4);
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, y, pageWidth - margin, y);
          y += 5;
        };
        const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const getImageInfo = (dataUrl) => new Promise((resolve) => {
          const image = new window.Image();
          image.onload = () => resolve({ width: image.width || 1, height: image.height || 1 });
          image.onerror = () => resolve({ width: 1, height: 1 });
          image.src = dataUrl;
        });
        const addImageFromUrl = async (url, caption = "") => {
          const cleanUrl = normalizePdfUrl(url);
          if (!cleanUrl) return;
          try {
            const response = await fetch(cleanUrl, { mode: "cors" });
            if (!response.ok) throw new Error("Bilde kunne ikke hentes.");
            const blob = await response.blob();
            const dataUrl = await blobToDataUrl(blob);
            const info = await getImageInfo(dataUrl);
            const maxW = Math.min(82, contentWidth);
            const maxH = 62;
            let w = maxW;
            let h = w * (info.height / info.width);
            if (h > maxH) {
              h = maxH;
              w = h * (info.width / info.height);
            }
            ensureSpace(h + 12);
            doc.addImage(dataUrl, undefined, margin, y, w, h);
            y += h + 4;
            if (caption) addParagraph(caption, { size: 8.2, lineHeight: 4 });
          } catch (error) {
            addParagraph(`Bilde kunne ikke bygges inn i PDF: ${cleanUrl}`, { size: 8.2, lineHeight: 4 });
          }
        };


        const addWarrantyCertificatePages = async () => {
          if (!warranty?.enabled || !warrantyReadiness?.selectedSystem) return;
          const selectedSystem = warrantyReadiness.selectedSystem;
          const guaranteeNumber = warranty?.guaranteeNumber || makeWarrantyNumber(projectId, project);
          const overtagelseDate = overtagelse?.dato || project?.date || "";
          const issuedText = warranty?.issued && warranty?.issuedAt ? new Date(warranty.issuedAt).toLocaleString("no-NO") : "Ikke utstedt";
          const reportText = warranty?.reportGeneratedAt ? new Date(warranty.reportGeneratedAt).toLocaleString("no-NO") : "Genereres nå";
          const warrantyValidTo = (() => {
            const sourceDate = overtagelseDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
            const d = new Date(sourceDate);
            if (Number.isNaN(d.getTime())) return "";
            d.setFullYear(d.getFullYear() + 12);
            return d.toISOString().slice(0, 10);
          })();

          doc.addPage();
          y = 18;
          if (company.logoUrl) {
            await addImageFromUrl(company.logoUrl, "");
            y = Math.max(y, 36);
          } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(15);
            doc.setTextColor(15, 23, 42);
            doc.text(name || "Expo Proffsenter", margin, y);
            y += 8;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          doc.setTextColor(15, 23, 42);
          doc.text("12 ÅRS DOKUMENTERT", margin, y);
          y += 9;
          doc.text("TETTHETSGARANTI", margin, y);
          y += 9;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          doc.text("Garantibevis generert i Expo ProffDok", margin, y);
          y += 12;

          doc.setDrawColor(15, 23, 42);
          doc.setLineWidth(0.5);
          doc.line(margin, y, pageWidth - margin, y);
          y += 10;

          addSectionTitle("Garantibevis");
          addKeyValue("Garantinummer", guaranteeNumber);
          addKeyValue("Status", warranty?.issued ? "Utstedt" : "Ikke utstedt / utkast");
          addKeyValue("Utstedt dato", issuedText);
          addKeyValue("Overtakelsesdato", overtagelseDate || "Ikke registrert");
          addKeyValue("Garantiperiode", warrantyValidTo ? `12 år fra overtakelse, til ${warrantyValidTo}` : "12 år fra signert overtakelse");
          addKeyValue("Kunde", project.customer);
          addKeyValue("Adresse", [project.address, project.postnr, project.city].filter(Boolean).join(", "));
          addKeyValue("Prosjekt", project.projectName);
          addKeyValue("Utførende firma", name || company.companyName || "Ikke oppgitt");
          addKeyValue("Organisasjonsnummer", company.orgNumber);
          addKeyValue("Membransystem", selectedSystem.product);
          addKeyValue("Teknisk godkjenning", selectedSystem.sintefApproval);
          addLink(`Åpne ${selectedSystem.sintefApproval}`, selectedSystem.sintefUrl);

          addSectionTitle("Dokumentasjonsgrunnlag");
          [
            ["Overtagelse signert", warrantyReadiness.overtagelseSigned],
            ["Ingen åpne avvik ved utstedelse", warrantyReadiness.openDeviationCount === 0],
            ["Sjekklister fullført", warrantyReadiness.checklistComplete],
            ["Garantipunkter fullført", warrantyReadiness.systemChecklistComplete],
            ["Bildedokumentasjon registrert", warrantyReadiness.hasPhotos],
            ["Godkjent Sopro-system valgt", warrantyReadiness.approvedSoproSystemSelected],
            ["Komplett PDF-rapport generert", true]
          ].forEach(([label, ok]) => addParagraph(`${ok ? "✓" : "–"} ${label}`));

          addSectionTitle("Arkivering av dokumentasjon");
          addParagraph("Denne garantien bygger på dokumentasjon registrert i Expo ProffDok på tidspunktet garantien ble utstedt.");
          addParagraph("Utførende firma er ansvarlig for å laste ned og oppbevare komplett sluttrapport, inkludert bilder, sjekklister, produktdokumentasjon og garantibevis.");
          addParagraph("Expo ProffDok fungerer som dokumentasjonsplattform, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata.");
          addKeyValue("Sist genererte rapport", reportText);

          doc.addPage();
          y = 18;
          addSectionTitle("Garantivilkår");
          const terms = [
            ["1. Garantien", "Denne garantien dokumenterer at våtrommet er utført med et godkjent Sopro membransystem og at arbeidet er dokumentert gjennom Expo ProffDok. Garantien gjelder tettheten i det dokumenterte membransystemet i 12 år fra dato for signert overtakelse."],
            ["2. Hvem garantien gjelder for", "Garantien gjelder for den aktuelle boligen og følger eiendommen ved et eventuelt salg innen garantiperioden."],
            ["3. Garantigiver", "Garantien utstedes av det utførende firmaet som er angitt i garantibeviset. Expo ProffDok fungerer som dokumentasjonsplattform og lagringssystem for prosjektets dokumentasjon."],
            ["4. Hva garantien omfatter", "Garantien omfatter dokumenterte feil i membransystemets tetthet når disse skyldes utførelse eller installasjon av det dokumenterte systemet. Garantien omfatter nødvendig utbedring av dokumenterte tetthetsskader innenfor garantiperioden."],
            ["5. Forutsetninger", "Garantien forutsetter normal bruk, normalt vedlikehold og at senere arbeider ikke har påvirket konstruksjonen eller membransystemets funksjon. Nye arbeider som berører membransystemet må utføres av kvalifisert personell."],
            ["6. Begrensninger", "Garantien omfatter ikke mekanisk skade, påboring eller inngrep i konstruksjonen, skader som følge av brann, naturhendelser eller andre ytre forhold, manglende vedlikehold eller arbeider utført av andre etter overtakelse."],
            ["7. Varsling", "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget."],
            ["8. Dokumentasjon", "Garantibeviset er gyldig sammen med prosjektets komplette dokumentasjon, inkludert bilder, sjekklister, produktdokumentasjon og signert overtakelse. Utførende firma må selv oppbevare komplett PDF-rapport i eget arkiv."],
            ["9. Tvister", "Eventuelle uenigheter om garantien behandles etter alminnelige regler for kontraktsforholdet mellom kunde og utførende firma."],
            ["10. Personopplysninger", "Prosjektdata og personopplysninger behandles som del av dokumentasjonen i Expo ProffDok. Utførende firma er ansvarlig for forsvarlig oppbevaring av nedlastet dokumentasjon."]
          ];
          terms.forEach(([title, body]) => {
            addSubTitle(title);
            addParagraph(body);
          });

          addSectionTitle("Signatur / bekreftelse");
          addKeyValue("Utførende firma", name || company.companyName || "");
          addKeyValue("Dato", warranty?.issuedAt ? new Date(warranty.issuedAt).toLocaleDateString("no-NO") : "");
          addParagraph("Dette garantibeviset er automatisk generert basert på registrert prosjektdata, signert overtakelse, sjekklister og bildedokumentasjon i Expo ProffDok.");
        };
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text("FDV-rapport / Prosjektdokumentasjon", margin, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(new Date().toLocaleString("no-NO"), margin, y);
        y += 8;

        if (company.logoUrl) {
          await addImageFromUrl(company.logoUrl, "");
        }

        addSectionTitle("Firma");
        addKeyValue("Firma", name || company.companyName || "Expo ProffDok");
        addKeyValue("Adresse", company.address);
        addKeyValue("Org.nr", company.orgNumber);
        addKeyValue("Telefon", company.phone);
        addKeyValue("E-post", company.email);
        addKeyValue("Nettside", company.website);

        addSectionTitle("Prosjekt");
        const projectFields = {
          "Prosjektansvarlig": project.responsible,
          "Prosjektnavn": project.projectName,
          "Adresse": project.address,
          "Postnr.": project.postnr,
          "Poststed / by": project.city,
          "Kunde": project.customer,
          "Kunde e-post": project.customerEmail,
          "Kunde telefon": project.customerPhone,
          "Dato": project.date,
          "Status": project.locked ? "Avsluttet / låst" : "Aktivt",
          "Notater": project.notes
        };
        Object.entries(projectFields).forEach(([label, value]) => addKeyValue(label, value));

        if (project.projectInfoIncludeInReport && hasValue(project.projectDescription)) {
          addSectionTitle("Prosjektinformasjon/beskrivelse");
          addParagraph(project.projectDescription);
        }

        addSectionTitle("Prosjektering");
        addKeyValue("Fall i dusjsone", project.fallDusj || "Ikke oppgitt");
        addKeyValue("Fall utenfor dusjsone / våtsone", project.fallUtenfor || "Ikke oppgitt");
        if (project.fall) addKeyValue("Fall mot sluk", project.fall);
        addKeyValue("Slukplassering", project.sluk || "Ikke oppgitt");
        addKeyValue("Terskelhøyde", project.terskel || "Ikke oppgitt");
        addKeyValue("Membran", project.membran || "Ikke oppgitt");
        (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).forEach((p) => addKeyValue(p.title || "Eget punkt", p.value || "Ikke oppgitt"));
        if (project.prosjekteringKommentar) addKeyValue("Kommentar / avvik", project.prosjekteringKommentar);

        addSectionTitle("Produkter / FDV");
        const allProducts = [...selected || [], ...manualSelected || []];
        if (!allProducts.length) {
          addParagraph("Ingen produkter er valgt.");
        }
        allProducts.forEach((p) => {
          addSubTitle(p.section || "Annet produkt");
          addParagraph(p.item || p.name || "Uten produktnavn");
          if (p.comment) addParagraph(`Hvor brukt / kommentar: ${p.comment}`);
          addLink("Åpne FDV", p.fdvUrl);
          addLink("Åpne datablad", p.databladUrl);
          addLink("Åpne DOP", p.dopUrl);
          addLink("Åpne EPD", p.epdUrl);
          addLink("Åpne sikkerhetsdatablad", p.sikkerhetsdatabladUrl);
          addLink("Åpne vedlagt dokument", p.documentFileUrl);
          addDivider();
        });
        Object.entries(other || {}).filter(([, v]) => v).forEach(([k, v]) => addParagraph(`Tidligere registrert annet produkt under ${k}: ${v}`));

        addSectionTitle("Overflater");
        const surfaceEntries = Object.entries(surf || {}).filter(([, v]) => v);
        if (!surfaceEntries.length) addParagraph("Ingen overflater er fylt ut.");
        surfaceEntries.forEach(([k, v]) => addKeyValue(k, v));

        addSectionTitle("Bildedokumentasjon");
        const photoCats = [...new Set((photos || []).map((photo) => photo.cat).filter(Boolean))];
        if (!photoCats.length) addParagraph("Ingen bilder er lagt til.");
        for (const cat of photoCats) {
          addSubTitle(cat);
          for (const photo of (photos || []).filter((item) => item.cat === cat)) {
            await addImageFromUrl(photo.url, photo.comment || photo.name || "");
          }
        }

        addSectionTitle("Fag, deler og utstyr");
        if (!(inst || []).length) addParagraph("Ingen fag-/utstyrsposter er lagt til.");
        for (const item of inst || []) {
          addSubTitle(item.category || "Fag/utstyr");
          addParagraph([item.name, item.qty, item.supplier, item.desc].filter(Boolean).join(" · "));
          addLink("Åpne FDV/datablad", item.fdvUrl);
          for (const photo of item.photos || []) {
            await addImageFromUrl(photo.url, photo.name || "");
          }
          addDivider();
        }

        addSectionTitle("Sjekkliste");
        Object.entries(checklist || {}).forEach(([category, items]) => {
          addSubTitle(category);
          Object.entries(items || {}).forEach(([item, value]) => {
            const status = value?.status || "";
            const comment = value?.comment || "";
            addParagraph(`${item}${status ? " — " + status : ""}${comment ? " — " + comment : ""}`);
          });
        });

        const deviations = [];
        Object.entries(checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            if (value?.status === "Avvik" || value?.status === "Lukket avvik") deviations.push({ category, item, status: value?.status || "", comment: value?.comment || "", closeComment: value?.closeComment || "", closedBy: value?.closedBy || "", closedAt: value?.closedAt || "" });
          });
        });
        if (deviations.length) {
          addSectionTitle("Avviksliste");
          const openDeviationTotal = deviations.filter((d) => d.status === "Avvik").length;
          const closedDeviationTotal = deviations.filter((d) => d.status === "Lukket avvik").length;
          addParagraph(`Avviksoppsummering: ${openDeviationTotal} åpne avvik · ${closedDeviationTotal} lukkede avvik`, { bold: true });
          deviations.forEach((d) => {
            addSubTitle(`${d.status === "Lukket avvik" ? "✅ Lukket avvik" : "⚠️ Åpent avvik"} – ${d.category} / ${d.item}`);
            if (d.comment) addKeyValue("Opprinnelig avvik", d.comment);
            if (d.status === "Lukket avvik") {
              addKeyValue("Utbedring / lukkekommentar", d.closeComment || "Lukket uten egen lukkekommentar");
              addKeyValue("Lukket av", d.closedBy || "Ikke oppgitt");
              addKeyValue("Lukket dato", d.closedAt ? new Date(d.closedAt).toLocaleString("no-NO") : "Ikke oppgitt");
            } else if (!d.comment) {
              addParagraph("Avvik registrert uten kommentar.");
            }
            addDivider();
          });
        }

        if (tilbud?.enabled && (hasValue(tilbud.tillegg) || hasValue(tilbud.fradrag) || hasValue(tilbud.kommentar) || (tilbud.files || []).length > 0)) {
          addSectionTitle("Tilbud / kontrakt");
          addKeyValue("Tillegg", tilbud.tillegg);
          addKeyValue("Fradrag", tilbud.fradrag);
          addKeyValue("Avtaleendringer / kommentar", tilbud.kommentar);
          (tilbud.files || []).forEach((file) => addLink(file.name || "Vedlegg", file.url));
        }

        if (overtagelse?.enabled && (hasValue(overtagelse.dato) || hasValue(overtagelse.kommentar) || hasValue(overtagelse.signUtførende) || hasValue(overtagelse.signKunde) || hasValue(overtagelse.signUtførendeImage) || hasValue(overtagelse.signKundeImage))) {
          addSectionTitle("Overtagelse");
          addKeyValue("Dato", overtagelse.dato);
          addKeyValue("Kommentar / merknader", overtagelse.kommentar);
          addKeyValue("Signatur utførende", overtagelse.signUtførende);
          if (overtagelse.signUtførendeImage) await addImageFromUrl(overtagelse.signUtførendeImage, "Signatur utførende");
          addKeyValue("Signatur kunde", overtagelse.signKunde);
          if (overtagelse.signKundeImage) await addImageFromUrl(overtagelse.signKundeImage, "Signatur kunde");
        }

        addSectionTitle("Sjekklister og vedlegg");
        if (!(files || []).length) addParagraph("Ingen vedlegg er lagt til.");
        (files || []).forEach((file) => {
          addParagraph(file.name || "Vedlegg");
          addLink(file.name || "Åpne vedlegg", file.url);
        });

        addSectionTitle("Prosjekttilgang");
        if (!(access || []).length) addParagraph("Ingen ekstra prosjekttilganger er lagt til.");
        (access || []).forEach((a) => addParagraph(`${a.name || a.email || "Ukjent"} — ${a.role || ""}`));

        await addWarrantyCertificatePages();

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) {
          doc.setPage(i);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text("Expo ProffDok rapport", pageWidth / 2, 7, { align: "center" });
          doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
          doc.text("© 2026 Expo Proffsenter – Expo ProffDok. Alle rettigheter forbeholdt.", pageWidth / 2, pageHeight - 7, { align: "center" });
        }

        const generatedFileName = `${filenameSafe(project.projectName || project.address || project.customer || "FDV-rapport")}.pdf`;
        doc.save(generatedFileName);
        if (warranty?.enabled) {
          const reportGeneratedAt = (/* @__PURE__ */ new Date()).toISOString();
          setWarranty((prev) => ({
            ...emptyWarranty(),
            ...prev,
            reportGeneratedAt,
            reportGeneratedFileName: generatedFileName,
            guaranteeNumber: prev?.guaranteeNumber || makeWarrantyNumber(projectId, project),
            status: prev?.issued ? "issued" : "report_generated"
          }));
          alert("PDF er generert. Husk å lagre filen på egen maskin/server. Garantimodulen er oppdatert med at komplett rapport er generert – husk å lagre/oppdatere prosjektet.");
        }
      } catch (error) {
        console.error("Kunne ikke lage PDF med klikkbare lenker:", error);
        alert("Kunne ikke lage PDF med klikkbare lenker. Bruk vanlig utskrift som fallback. Feil: " + (error?.message || String(error)));
      }
    };

    const uploadImages = async (fileList, folder = "photos") => {
      const filesArray = Array.from(fileList || []);
      const uploaded = [];
      for (const file of filesArray) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${folder}/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp bilde: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({ id: uid(), url: data.publicUrl, path, name: file.name });
      }
      return uploaded;
    };
    const addPhoto = async (cat, fl) => {
      const imgs = await uploadImages(fl, "photos");
      setPhotos((p) => [...p, ...imgs.map((img) => ({
        ...img,
        cat,
        comment: "",
        created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
      }))]);
    };
    const setChecklistValue = (category, item, patch) => {
      setChecklist((prev) => ({
        ...prev,
        [category]: {
          ...prev[category] || {},
          [item]: {
            ...prev[category]?.[item] || {},
            ...patch
          }
        }
      }));
    };
    const addChecklistPhoto = async (category, item, fl) => {
      const imgs = await uploadImages(fl, "sjekklister");
      if (!imgs.length) return;
      setChecklist((prev) => ({
        ...prev,
        [category]: {
          ...prev[category] || {},
          [item]: {
            ...prev[category]?.[item] || {},
            photos: [...prev[category]?.[item]?.photos || [], ...imgs]
          }
        }
      }));
    };
    const addFiles = (fl) => setFiles((p) => [...p, ...Array.from(fl || []).map((f) => ({
      id: uid(),
      name: f.name,
      url: URL.createObjectURL(f),
      by: user.name || "Ukjent",
      created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
    }))]);
    const uploadTilbudFiles = async (fileList) => {
      const filesArray = Array.from(fileList || []);
      const uploaded = [];
      for (const file of filesArray) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `tilbud-kontrakt/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp vedlegg: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({
          id: uid(),
          url: data.publicUrl,
          path,
          name: file.name,
          by: user.name || authUser?.email || "Ukjent",
          created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
        });
      }
      if (uploaded.length) {
        setTilbud((t) => ({ ...emptyTilbud(), ...t, files: [...t.files || [], ...uploaded] }));
      }
    };
    if (authLoading && !isReadOnly && !isUnderleverandorView) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Laster..." }) }) }) });
    }
    if (passwordRecovery && !isReadOnly) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sett nytt passord" })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sett nytt passord", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Skriv inn et nytt passord. Det kan ikke v\xE6re det samme som forrige passord." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Nytt passord",
                type: "password",
                value: newPassword,
                onChange: setNewPassword,
                autoComplete: "new-password"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Gjenta nytt passord",
                type: "password",
                value: newPasswordRepeat,
                onChange: setNewPasswordRepeat,
                autoComplete: "new-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") completePasswordReset();
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: completePasswordReset, children: "Lagre nytt passord" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: async () => {
              setPasswordRecovery(false);
              setNewPassword("");
              setNewPasswordRepeat("");
              window.history.replaceState({}, document.title, window.location.pathname);
              await supabase.auth.signOut();
              setAuthUser(null);
              setProfile(null);
            }, children: "Avbryt og g\xE5 til innlogging" })
          ] })
        ] }) })
      ] });
    }
    if (isUnderleverandorView) {
      const limitedTabs = [["prosjektinfo", "Prosjektinformasjon"], ["produkter", "Produkter"], ["overflater", "Overflater"], ["bilder", "Bilder"], ["installasjoner", "Fag/utstyr"], ["sjekklister", "Sjekklister"]];
      if (!projectId && !(project.projectName || project.address)) {
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Laster prosjekt..." })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster prosjekt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Henter prosjektdata..." }) }) })
        ] });
      }
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
                "Underentrepren\xF8r-tilgang \xB7 ",
                project.projectName || project.address || "Prosjekt"
              ] })
            ] }),
            isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", disabled: true, children: "\u{1F512} Prosjekt l\xE5st" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveSharedProject, children: "Lagre bidrag" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: limitedTabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => goToTab(id), children: l }, id)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Begrenset tilgang", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Du har tilgang til \xE5 se produkter, overflater, bilder, fag/utstyr og sjekklister p\xE5 dette prosjektet. Du kan legge inn bilder, sjekklistepunkter, fag/utstyr og kommentarer. Prosjektinformasjon er synlig. Prosjektering, rapport, tilbud/kontrakt og admin er skjult." }),
            isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "\u{1F512} Prosjektet er avsluttet og l\xE5st. Nye endringer kan ikke lagres." })
          ] }),
          tab === "prosjektinfo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectInformationReadOnly, { project }),
          tab === "produkter" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: productSections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: s.title, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kryss av produkter som er brukt. N\xE5r et produkt er valgt, kan du legge inn FDV-/databladlink og hvor produktet er brukt direkte p\xE5 produktet." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList", children: s.items.map((i) => {
              const doc = productDocs[i] || {};
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], onChange: (e) => toggleProductChecked(i, e.target.checked) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: i })
                ] }),
                checked[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladUrl: v, fdvSource: "manual" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", onChange: (v) => updateProductDoc(i, { comment: v }) })
                  ] }),
                  doc.fdvSource === "product-master" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dokumentlinker er hentet automatisk fra produktmaster." }),
                  doc.fdvSource === "admin-register" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "FDV-link er hentet automatisk fra admin FDV-register." })
                ] })
              ] }, i);
            }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
                "Andre produkter i ",
                s.title
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk dette hvis produktet ikke ligger i standardlisten for denne kategorien." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Legg til annet produkt"
              ] }),
              getManualProductsForSection(s.title).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen andre produkter lagt til i denne kategorien." }),
              getManualProductsForSection(s.title).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
              ] }, p.id))
            ] })
          ] }, s.title)) }),
          tab === "overflater" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Overflateprodukter", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaces.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: `${f} - produkt, farge og plassering`, value: surf[f] || "", onChange: (v) => setSurf({ ...surf, [f]: v }) }, f)) }) }),
          tab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bildedokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
            photos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen bilder er lagt til ennå. Start gjerne med Før arbeid, Underlag og Ferdig resultat for en ryddig rapport." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: imageCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 16 }),
                " ",
                c
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photos.filter((p) => p.cat === c).length > 0 ? `\u{1F4F7} ${photos.filter((p) => p.cat === c).length} bilder lagt til` : "Ta bilde eller velg fra galleri" }),
             /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto(c, e.target.files) })
            ] }, c)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGrid, { photos, setPhotos })
          ] }),
          tab === "installasjoner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Fag, deler og utstyr", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "R\xF8rlegger", name: "", qty: "", supplier: "", desc: "", fdvUrl: "", photos: [], by: user.name || "Underentrepren\xF8r", created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO") }]), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til post"
            ] }),
            inst.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, category: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverand\xF8r", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i)) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Last opp bilder",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                  const imgs = await uploadImages(e.target.files, "installasjoner");
                  setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
                } })
              ] }),
              (x.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                "\u{1F4F7} ",
                (x.photos || []).length,
                " bilder lagt til"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: (x.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
              ] }, p.id)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Lagt inn av ",
                x.by,
                " \xB7 ",
                x.created
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
            ] }, x.id))
          ] }),
          tab === "sjekklister" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sjekklister og vedlegg", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg status per kontrollpunkt. Kategoriene kan \xE5pnes/lukkes for mindre scrolling p\xE5 mobil. Ved Avvik kan du skrive kommentar og ta bilde." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ChecklistEditor,
              {
                checklist,
                setChecklistValue,
                addChecklistPhoto,
                addFiles,
                files,
                setFiles,
                closedByName: user.name || authUser?.email || "Utførende",
                showOpenDeviationsOnly,
                setShowOpenDeviationsOnly,
                warranty
              }
            )
          ] })
        ] })
      ] });
    }
    if (!authUser && !isReadOnly) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Logg inn for \xE5 se dine prosjekter" })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Innlogging", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: authEmail, onChange: setAuthEmail, autoComplete: "email" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Passord",
                type: "password",
                value: authPassword,
                onChange: setAuthPassword,
                autoComplete: "current-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") signIn();
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: signIn, children: "Logg inn" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signUp, children: "Opprett bruker" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: resetPassword, children: "Glemt passord?" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "E-post huskes p\xE5 denne enheten. Passord lagres ikke i appen, men nettleseren/Supabase kan holde deg innlogget trygt." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Delingslenker fungerer fortsatt uten innlogging." })
        ] }) })
      ] });
    }
    if (!isReadOnly && (profileLoading || authUser && !profile)) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Laster brukerprofil..." })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Henter brukerprofil..." }) }) })
      ] });
    }
    if (!isReadOnly && authUser && profile && !profile.approved) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Venter p\xE5 godkjenning" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Konto venter p\xE5 godkjenning", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Brukeren ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: authUser.email }),
            " er registrert, men m\xE5 godkjennes av administrator f\xF8r appen kan brukes."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            "Fyll gjerne inn firmaprofilen under. Administrator kan deretter godkjenne deg i Supabase ved \xE5 sette ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "approved = true" }),
            " i tabellen ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "profiles" }),
            "."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email || authUser.email, onChange: (v) => setCompany({ ...company, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website || "", onChange: (v) => setCompany({ ...company, website: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "16px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp firmalogo",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfile, children: "Lagre firmaprofil" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
          ] })
        ] }) })
      ] });
    }
    if (isReadOnly) {
      const hasTilbudContent = hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0;
      const customerPortalProductCount = [...selected || [], ...manualSelected || []].length;
      const customerPortalPhotoCount = (photos || []).length;
      const customerPortalChecklistDone = Object.values(checklist || {}).reduce((sum, items) => sum + Object.values(items || {}).filter((value) => value?.status === "OK" || value?.status === "Utført").length, 0);
      const customerPortalChecklistAvvik = Object.values(checklist || {}).reduce((sum, items) => sum + Object.values(items || {}).filter((value) => value?.status === "Avvik").length, 0);
      const customerPortalAddress = [project.address, project.postnr, project.city].filter(Boolean).join(", ");
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Kundetilgang" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
                "Rapport, prosjektchat og dokumentasjon",
                totalChatCount ? ` \xB7 ${totalChatCount} melding${totalChatCount === 1 ? "" : "er"}` : ""
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: downloadClickablePdfReport, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 18 }),
              " Last ned PDF"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "rapport" ? "on" : "", onClick: () => setCustomerTab("rapport"), children: "Rapport" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "prosjektinfo" ? "on" : "", onClick: () => setCustomerTab("prosjektinfo"), children: "Prosjektinformasjon" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: customerTab === "chat" ? "on" : "", onClick: () => setCustomerTab("chat"), children: [
              "Chat",
              unreadForCustomer > 0 ? ` (${unreadForCustomer} ulest)` : totalChatCount ? ` (${totalChatCount})` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "tilbud" ? "on" : "", onClick: () => setCustomerTab("tilbud"), children: "Tilbud/kontrakt" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: project.projectName || project.address || "Prosjektoversikt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: 0 }, children: customerPortalAddress || project.customer || "Prosjektdokumentasjon" }),
                project.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                  "Kunde: ",
                  project.customer
                ] }),
                project.customerPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                  "Tlf: ",
                  project.customerPhone
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `statusBadge status-${currentStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", fontWeight: 700, border: "1px solid #dbe7ec", ...statusStyle(currentStatus.tone) }, children: [
                currentStatus.icon,
                " ",
                currentStatus.label
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note customerChatFocusNote", children: "All kommunikasjon tas i prosjektchatten, slik at meldinger og bilder lagres på prosjektet." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Produkter dokumentert", value: customerPortalProductCount ? `${customerPortalProductCount} produkter` : "Ikke valgt ennå" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Bildedokumentasjon", value: customerPortalPhotoCount ? `${customerPortalPhotoCount} bilder` : "Ingen bilder ennå" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Sjekkliste", value: customerPortalChecklistAvvik ? `${customerPortalChecklistAvvik} avvik registrert` : customerPortalChecklistDone ? `${customerPortalChecklistDone} punkt utført` : "Ikke utfylt ennå" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Chat", value: unreadForCustomer > 0 ? `${unreadForCustomer} ulest` : totalChatCount ? `${totalChatCount} meldinger` : "Ingen meldinger" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setCustomerTab("chat"), children: unreadForCustomer > 0 ? `Åpne chat (${unreadForCustomer} ulest)` : "Åpne prosjektchat" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("rapport"), children: "Se rapport" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: downloadClickablePdfReport, children: "Last ned PDF" }),
              hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("tilbud"), children: "Tilbud/kontrakt" })
            ] })
          ] }),
          customerTab === "prosjektinfo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectInformationReadOnly, { project }),
          customerTab === "rapport" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerReport, { company, name, project, selected, manualProducts: manualSelected, other, surf, photos, inst, files, checklist, tilbud, overtagelse, projectLog }),
          customerTab === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: unreadForCustomer > 0 ? `Chat (${unreadForCustomer} ulest)` : totalChatCount ? `Chat (${totalChatCount})` : "Chat", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Send spørsmål, beskjeder og bilder her. Alt lagres på prosjektet." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding fra kunde", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", style: { marginBottom: 0 }, children: [
                "\u{1F4F7} Last opp bilde",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "input",
                  {
                    id: "customer-chat-image-input",
                    type: "file",
                    accept: "image/*",
                    onChange: (e) => setCustomerChatUploadFile(e.target.files?.[0] || null)
                  }
                ),
                customerChatUploadFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                  "Valgt: ",
                  customerChatUploadFile.name
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: saveCustomerChatMessage, children: "Send melding" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForCustomer === 0, onClick: () => markChatAsRead("customer"), children: "Marker alle som lest" })
            ] }),
            (projectLog.messages || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen meldinger enn\xE5." }),
            (projectLog.messages || []).slice().reverse().map((m) => {
              const isUnread = m.role !== "kunde" && (!lastReadByCustomer || (m.created || "") > lastReadByCustomer);
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("customer"), style: isUnread ? { borderColor: "#fecaca", background: "#fff7f7", cursor: "pointer" } : void 0, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  m.by || "Ukjent",
                  " ",
                  m.role === "kunde" ? "\xB7 Kunde" : "\xB7 Utf\xF8rende"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  m.created ? new Date(m.created).toLocaleString("no-NO") : "",
                  m.role === "kunde" ? !lastReadByAdmin || (m.created || "") > lastReadByAdmin ? " \xB7 Ulest for admin" : " \xB7 Lest av admin" : isUnread ? " \xB7 Ulest for kunde" : " \xB7 Lest av kunde"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
                m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "10px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: m.imageUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "img",
                    {
                      src: m.imageUrl,
                      alt: m.imageName || "Chat bilde",
                      style: { maxWidth: "280px", width: "100%", borderRadius: "12px", border: "1px solid #dbe7ec" }
                    }
                  ) }),
                  m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { display: "block", marginTop: "6px" }, children: m.imageName })
                ] })
              ] }, m.id);
            })
          ] }),
          customerTab === "tilbud" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilbud / kontrakt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            !hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen tilbud eller kontrakt er delt p\xE5 dette prosjektet enn\xE5." }),
            hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
              ] }),
              (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
                (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: f.name }) }, f.id))
              ] })
            ] })
          ] })
        ] })
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { onClick: openImageLightboxFromClick, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `

      .pdfSafeLink a { font-weight: 700; }
      .pdfSafeUrl { display:block; color:#334155; font-size:10px; line-height:1.25; overflow-wrap:anywhere; word-break:break-word; margin-top:2px; }
      .collapsibleBlock { border:1px solid #dbe7ec; border-radius:16px; background:#ffffff; margin:12px 0; overflow:hidden; }
      .collapsibleBlock summary { list-style:none; cursor:pointer; padding:13px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:900; color:#0f172a; }
      .collapsibleBlock summary::-webkit-details-marker { display:none; }
      .collapsibleBlock summary:after { content:'▼'; font-size:13px; color:#64748b; transition:transform .15s ease; }
      .collapsibleBlock:not([open]) summary:after { transform:rotate(-90deg); }
      .collapsibleBlockBody { padding:0 14px 14px; }
      @media screen and (max-width:700px) {
        .collapsibleBlock { border-radius:15px !important; margin:10px 0 !important; }
        .collapsibleBlock summary { min-height:46px; padding:11px 12px; font-size:15px; }
        .collapsibleBlockBody { padding:0 12px 12px; }
      }
      @media print {
        .pdfSafeLink a { color:#0645ad !important; text-decoration:underline !important; }
        .pdfSafeUrl { display:block !important; color:#334155 !important; font-size:9px !important; }
      }

      .mobileNav { display: none; }
      .mobileNavPanel { background:#ffffff; border:1px solid #dbe7ec; border-radius:18px; padding:12px; box-shadow:0 10px 24px rgba(15,23,42,0.08); }
      .mobileNavTop { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .mobileNavTitle { display:flex; flex-direction:column; gap:2px; min-width:0; }
      .mobileNavTitle b { font-size:14px; color:#0f172a; }
      .mobileNavTitle small { color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .mobileNavSelectWrap { position:relative; }
      .mobileNav select { width:100%; min-height:52px; border-radius:14px; font-size:17px; font-weight:800; padding:12px 44px 12px 14px; background:#f8fafc; border:1px solid #cbd5e1; color:#0f172a; appearance:auto; }
      .mobileNavQuick { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
      .mobileNavQuick button { width:100%; min-height:44px; justify-content:center; }
      .mobileNavStatus { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .mobileNavPill { display:inline-flex; align-items:center; gap:6px; padding:6px 9px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:12px; font-weight:800; color:#334155; }
      .mobileSectionChips { display:none; }
      .projectListHeaderCards { margin-bottom:16px; }
      .projectListToolbar { display:flex; gap:12px; flex-wrap:wrap; margin:14px 0 16px; }
      .projectListCard { position:relative; overflow:hidden; }
      .projectListCardTop { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start; }
      .projectListBadges { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
      .projectListMetaCards { margin-top:12px; }
      .projectListActions { display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; }
      .projectImageStrip { display:flex; gap:8px; overflow-x:auto; padding:8px 2px 4px; margin-top:10px; scrollbar-width:thin; }
      .projectImageThumb { flex:0 0 76px; width:76px; }
      .projectImageThumb img { width:76px; height:58px; object-fit:cover; border-radius:12px; border:1px solid #dbe7ec; background:#f8fafc; display:block; }
      .projectImageThumb small { display:block; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11px; }
      .projectImageCounts { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .projectMiniBadge { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:999px; border:1px solid #dbe7ec; background:#f8fafc; font-size:12px; font-weight:700; }
      .guideGrid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; margin-top:12px; }
      .guideCard { border:1px solid #dbe7ec; background:#f8fafc; border-radius:16px; padding:12px; }
      .guideCard b { display:block; font-size:18px; color:#0f172a; margin-bottom:3px; }
      .guideCard span { display:block; color:#64748b; font-size:13px; line-height:1.35; }
      .guideSteps { display:grid; gap:8px; margin-top:12px; }
      .guideStep { display:flex; align-items:center; justify-content:space-between; gap:10px; border:1px solid #dbe7ec; background:#ffffff; border-radius:14px; padding:10px; }
      .guideStepText { min-width:0; }
      .guideStepText b { display:block; font-size:14px; line-height:1.25; color:#0f172a; }
      .guideStepText small { display:block; color:#64748b; margin-top:2px; }
      .guideStep button { flex:0 0 auto; }

      @media screen and (max-width: 700px) {
        .guideGrid { grid-template-columns:1fr 1fr !important; gap:8px !important; }
        .guideCard { padding:10px !important; border-radius:14px !important; }
        .guideCard b { font-size:16px !important; }
        .guideCard span { font-size:12.5px !important; }
        .guideStep { display:grid !important; grid-template-columns:1fr !important; gap:8px !important; padding:10px !important; }
        .guideStep button { width:100% !important; justify-content:center !important; }
      }

      .imageLightboxOverlay { position:fixed; inset:0; z-index:9999; background:rgba(2, 6, 23, 0.86); display:flex; align-items:center; justify-content:center; padding:18px; }
      .imageLightboxInner { width:min(1100px, 100%); max-height:92vh; display:grid; gap:12px; }
      .imageLightboxTop { display:flex; justify-content:flex-end; }
      .imageLightboxClose { background:#ffffff; color:#0f172a; border:1px solid rgba(255,255,255,0.6); box-shadow:none; }
      .imageLightboxImage { width:100%; max-height:82vh; object-fit:contain; border-radius:16px; background:#ffffff; }
      .photo img, .projectImageThumb img { cursor: zoom-in; }
      @media screen and (max-width: 700px) {
        header nav { display: none !important; }
        .mobileNav { display: block !important; }
        .mobileNav { padding:0 12px 12px !important; }
        .mobileNavPanel { border-radius:16px; padding:10px; }
        .mobileNavTop { margin-bottom:8px; }
        .mobileNav select { min-height:54px; font-size:16px; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:1fr 1fr; gap:8px; }
        .projectListHeaderCards .tile { min-height:auto; padding:10px !important; }
        .projectListHeaderCards .tile b { font-size:20px; }
        .projectListToolbar { position:sticky; top:0; z-index:5; background:#ffffff; border:1px solid #dbe7ec; border-radius:16px; padding:10px; box-shadow:0 8px 22px rgba(15,23,42,0.08); }
        .projectListToolbar button { flex:1 1 100%; width:100%; justify-content:center; }
        .projectListCard { padding:14px !important; border-radius:18px; }
        .projectListCardTop { display:block; }
        .projectListBadges { justify-content:flex-start; margin-top:10px; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListMetaCards .tile { padding:10px !important; min-height:auto; }
        .projectListActions { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListActions button { width:100%; justify-content:center; }
        .projectImageThumb { flex-basis:84px; width:84px; }
        .projectImageThumb img { width:84px; height:64px; }
      }


      /* Mobile-first redesign v1 */
      .bottomAppNav { display:none; }
      @media screen and (max-width: 700px) {
        body { -webkit-text-size-adjust:100%; }
        header { position:sticky; top:0; z-index:20; background:rgba(255,255,255,0.96); backdrop-filter:blur(14px); border-bottom:1px solid #e2edf2; }
        header .head { padding:8px 12px !important; gap:8px !important; align-items:center !important; }
        header .head > div:first-child { width:122px !important; height:42px !important; flex:0 0 122px !important; }
        header .head h1 { font-size:18px !important; line-height:1.1 !important; margin:0 !important; }
        header .head p { font-size:12px !important; margin:2px 0 0 !important; max-width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        header .head > button { display:none !important; }
        header .head > button:nth-of-type(2), header .head > button:nth-of-type(3) { display:inline-flex !important; min-height:34px !important; padding:7px 10px !important; font-size:12px !important; border-radius:12px !important; }
        main { padding:10px 10px calc(150px + env(safe-area-inset-bottom)) !important; }
        section { padding:14px !important; border-radius:18px !important; margin:10px auto !important; }
        section h2 { font-size:19px !important; margin-bottom:10px !important; gap:6px !important; }
        .mobileNav { padding:0 10px 8px !important; }
        .mobileNavPanel { box-shadow:none !important; border-radius:14px !important; padding:9px !important; }
        .mobileNavTop { display:flex !important; margin-bottom:6px !important; }
        .mobileNavTitle b { font-size:12px !important; letter-spacing:.02em; text-transform:uppercase; color:#64748b !important; }
        .mobileNavTitle small { font-size:13px !important; color:#0f172a !important; font-weight:800; }
        .mobileNavStatus, .mobileNavQuick { display:none !important; }
        .mobileNav select { min-height:44px !important; font-size:17px !important; border-radius:13px !important; padding:9px 12px !important; background:#f8fafc !important; }
        .mobileSectionChips { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px; margin-top:8px; }
        .mobileSectionChips button { min-height:36px !important; padding:6px 5px !important; border-radius:12px !important; font-size:12px !important; font-weight:900 !important; }
        .bottomAppNav { position:fixed; left:12px; right:12px; bottom:calc(10px + env(safe-area-inset-bottom)); z-index:50; display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; padding:7px; border:1px solid #dbe7ec; border-radius:20px; background:rgba(255,255,255,0.98); box-shadow:0 12px 34px rgba(15,23,42,0.16); backdrop-filter:blur(14px); }
        .bottomAppNav button { min-height:44px !important; padding:5px 3px !important; border-radius:14px !important; font-size:12px !important; font-weight:900 !important; display:flex !important; flex-direction:column !important; gap:1px !important; align-items:center !important; justify-content:center !important; line-height:1.05 !important; }
        .bottomAppNav button span:first-child { font-size:16px; line-height:1; }
        .bottomAppNav button.active { background:#082f3a !important; color:#fff !important; border-color:#082f3a !important; }
        .grid { grid-template-columns:1fr !important; gap:10px !important; }
        label span { font-size:12px !important; }
        input, textarea, select { min-height:42px !important; font-size:16px !important; border-radius:12px !important; }
        textarea { min-height:86px !important; }
        button, .upload { min-height:42px !important; border-radius:14px !important; padding:9px 12px !important; font-size:14px !important; }
        .cards { gap:8px !important; }
        .tile { padding:10px !important; border-radius:16px !important; min-height:auto !important; }
        .tile b { font-size:16px !important; }
        .tile span { font-size:12px !important; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)) !important; gap:6px !important; overflow:visible !important; }
        .projectListHeaderCards .tile { padding:8px 6px !important; text-align:center !important; }
        .projectListHeaderCards .tile b { font-size:18px !important; }
        .projectListHeaderCards .tile span { font-size:10px !important; line-height:1.1 !important; }
        .projectListToolbar { position:static !important; display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; padding:0 !important; border:0 !important; box-shadow:none !important; background:transparent !important; margin:8px 0 10px !important; }
        .projectListToolbar button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .projectListCard { padding:12px !important; border-radius:20px !important; margin:10px 0 !important; }
        .projectListCardTop { display:block !important; }
        .projectListCardTop b[style] { font-size:17px !important; line-height:1.15 !important; display:block; }
        .projectListCardTop p { font-size:14px !important; margin:4px 0 0 !important; }
        .projectListCardTop small { font-size:12px !important; }
        .projectListBadges { justify-content:flex-start !important; gap:6px !important; margin-top:8px !important; }
        .statusBadge, .projectMiniBadge { font-size:11px !important; padding:4px 7px !important; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; margin-top:8px !important; }
        .projectListMetaCards .tile { padding:8px !important; }
        .projectListMetaCards .tile:nth-child(3) { display:none !important; }
        .projectImageCounts { gap:5px !important; margin-top:8px !important; }
        .projectImageStrip { gap:6px !important; padding:6px 0 0 !important; margin-top:4px !important; }
        .projectImageThumb { flex:0 0 58px !important; width:58px !important; }
        .projectImageThumb img { width:58px !important; height:46px !important; border-radius:10px !important; }
        .projectImageThumb small { font-size:9px !important; }
        .projectImageThumb[style] { height:46px !important; min-width:58px !important; font-size:12px !important; }
        .projectListActions { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; margin-top:10px !important; }
        .projectListActions button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .note { font-size:13px !important; line-height:1.35 !important; }
        .photos { grid-template-columns:repeat(2, minmax(0,1fr)) !important; gap:8px !important; }
        .photo { border-radius:14px !important; padding:8px !important; }
        .photo img { border-radius:12px !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0; }

        /* Mobile readability tuning v2 */
        section h2 { font-size:21px !important; line-height:1.22 !important; }
        h3 { font-size:18px !important; line-height:1.25 !important; }
        p, small, .out p, .item p { line-height:1.45 !important; }
        .note { font-size:14px !important; line-height:1.48 !important; }
        label span { font-size:13px !important; line-height:1.3 !important; }
        input, textarea, select { font-size:17px !important; line-height:1.35 !important; }
        button, .upload { font-size:15px !important; font-weight:800 !important; line-height:1.2 !important; }
        .bottomAppNav button { font-size:12px !important; }
        .bottomAppNav button span:first-child { font-size:20px !important; }
        .projectListCardTop b[style] { font-size:19px !important; line-height:1.24 !important; }
        .projectListCardTop p { font-size:15px !important; line-height:1.35 !important; }
        .projectListCardTop small { font-size:13px !important; line-height:1.35 !important; }
        .statusBadge, .projectMiniBadge { font-size:12.5px !important; line-height:1.15 !important; padding:6px 9px !important; }
        .projectListMetaCards .tile b { font-size:13px !important; line-height:1.2 !important; }
        .projectListMetaCards .tile span { font-size:12.5px !important; line-height:1.28 !important; }
        .projectListHeaderCards .tile b { font-size:20px !important; }
        .projectListHeaderCards .tile span { font-size:11.5px !important; line-height:1.18 !important; }
        .projectListToolbar button, .projectListActions button { font-size:13.5px !important; min-height:42px !important; }
        .tile b { font-size:17px !important; line-height:1.2 !important; }
        .tile span { font-size:13px !important; line-height:1.3 !important; }
        .check span { font-size:15px !important; }
        .checklistHeader b { font-size:15.5px !important; line-height:1.3 !important; }
        .checklistStatusButtons button { font-size:13px !important; }
        .photo b { font-size:14px !important; line-height:1.25 !important; }
        .photo small { font-size:12px !important; line-height:1.25 !important; }
        .projectImageThumb small { font-size:10.5px !important; line-height:1.15 !important; }
      }


      /* Mobile navigation cleanup v2: no fixed chrome on small screens */
      @media screen and (max-width: 700px) {
        header { position:static !important; top:auto !important; z-index:auto !important; backdrop-filter:none !important; border-bottom:0 !important; }
        main { padding:10px 10px 28px !important; }
        .bottomAppNav { display:none !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0 !important; }
        .mobileNav { padding:0 10px 10px !important; }
        .mobileNavPanel { position:static !important; border-radius:16px !important; padding:10px !important; margin-bottom:8px !important; }
        .mobileNavTop { display:flex !important; align-items:flex-start !important; margin-bottom:8px !important; }
        .mobileNavTitle b { font-size:13px !important; letter-spacing:.04em !important; text-transform:uppercase !important; color:#64748b !important; }
        .mobileNavTitle small { font-size:18px !important; font-weight:900 !important; color:#0f172a !important; }
        .mobileNav select { min-height:46px !important; font-size:18px !important; font-weight:900 !important; }
        .mobileNavQuick { display:none !important; }
        .mobileNavStatus { display:grid !important; grid-template-columns:repeat(4, minmax(0, 1fr)) !important; gap:6px !important; margin-top:8px !important; }
        .mobileNavStatus .mobileNavPill { justify-content:center !important; min-height:38px !important; font-size:13px !important; padding:7px 6px !important; border-radius:14px !important; }
        .mobileNavStatus .mobileNavPill:nth-child(n+5) { display:none !important; }
        section { scroll-margin-top:12px !important; }
        .projectListToolbar { position:static !important; }
      }


      /* Mobile project chooser v5 - desktop-safe */
      .mobileProjectChooser,
      .mobileCurrentProjectBar { display:none !important; }
      .desktopOnlyWhenNoProject { display:block !important; }
      @media screen and (min-width: 701px) {
        .mobileProjectChooser,
        .mobileCurrentProjectBar { display:none !important; }
        .desktopOnlyWhenNoProject { display:block !important; }
      }
      @media screen and (max-width: 700px) {
        .mobileProjectChooser { display:block !important; }
        .mobileCurrentProjectBar { display:block !important; }
        .desktopOnlyWhenNoProject { display:none !important; }
        .mobileProjectChooser { padding:16px !important; border-radius:22px !important; background:#fff !important; border:1px solid #dbe7ec !important; box-shadow:0 12px 30px rgba(15,23,42,0.08) !important; }
        .mobileProjectChooser h2 { font-size:24px !important; line-height:1.15 !important; margin-bottom:8px !important; }
        .mobileProjectChooserIntro { color:#64748b; font-size:15px; line-height:1.45; margin:0 0 14px; }
        .mobileProjectChooserActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0; }
        .mobileProjectChooserActions button { width:100% !important; min-height:46px !important; justify-content:center !important; }
        .mobileProjectList { display:grid; gap:10px; margin-top:14px; }
        .mobileProjectPickCard { border:1px solid #dbe7ec; border-radius:18px; padding:12px; background:#f8fafc; }
        .mobileProjectPickCardTop { display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
        .mobileProjectPickCard b { font-size:17px; line-height:1.25; color:#0f172a; }
        .mobileProjectPickCard small { display:block; color:#64748b; font-size:13px; line-height:1.35; margin-top:3px; }
        .mobileProjectPickStatus { white-space:nowrap; font-size:12px; font-weight:900; border:1px solid #dbe7ec; border-radius:999px; padding:5px 8px; background:#fff; }
        .mobileProjectPickActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px; margin-top:10px; }
        .mobileProjectPickActions button { min-height:42px !important; padding:7px 6px !important; font-size:13px !important; border-radius:13px !important; width:100% !important; }
        .mobileCurrentProjectBar { margin:0 10px 10px !important; padding:12px !important; border:1px solid #dbe7ec !important; background:#ffffff !important; border-radius:18px !important; }
        .mobileCurrentProjectBar b { display:block; font-size:13px; text-transform:uppercase; color:#64748b; letter-spacing:.04em; margin-bottom:4px; }
        .mobileCurrentProjectBar span { display:block; font-size:17px; font-weight:900; color:#0f172a; line-height:1.25; }
        .mobileCurrentProjectActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .mobileCurrentProjectActions button { min-height:44px !important; font-size:14px !important; }
      }


      /* Mobile UX fase 4: feltapp-sjekklister */
      .checklistSummaryCard {
        border:1px solid #dbe7ec;
        background:#f8fafc;
        border-radius:18px;
        padding:14px;
        margin:12px 0 16px;
      }
      .checklistSummaryCard b { font-size:18px; color:#0f172a; }
      .checklistSummaryCard p { margin:4px 0 10px; color:#64748b; }
      .checklistProgress { height:10px; border-radius:999px; background:#e2e8f0; overflow:hidden; margin:10px 0; }
      .checklistProgress span { display:block; height:100%; border-radius:999px; background:#082f3a; transition:width .2s ease; }
      .checklistSummaryBadges { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .checklistSummaryBadges span { display:inline-flex; align-items:center; gap:4px; padding:6px 9px; border-radius:999px; border:1px solid #dbe7ec; background:#fff; font-size:13px; font-weight:800; color:#334155; }
      .checklistSummaryActions { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
      .checklistAccordion { display:grid; gap:12px; }
      .checklistGroup { padding:0 !important; overflow:hidden; border-radius:18px !important; }
      .checklistGroupHeader { width:100%; border:0 !important; background:#ffffff !important; color:#0f172a !important; box-shadow:none !important; display:grid !important; grid-template-columns:auto minmax(0,1fr) auto !important; align-items:center !important; gap:10px !important; padding:14px !important; text-align:left !important; min-height:64px !important; cursor:pointer; }
      .checklistGroupCaret { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:18px; font-weight:900; }
      .checklistGroupTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistGroupTitle b { font-size:18px; line-height:1.2; }
      .checklistGroupTitle small { color:#64748b; font-weight:700; }
      .checklistGroupBadge { white-space:nowrap; border:1px solid #dbe7ec; border-radius:999px; padding:6px 9px; font-size:12px; font-weight:900; background:#f8fafc; }
      .checklistGroupBadge-done { background:#ecfdf5; color:#065f46; border-color:#bbf7d0; }
      .checklistGroupBadge-avvik { background:#fef2f2; color:#991b1b; border-color:#fecaca; }
      .checklistGroupBadge-progress { background:#fffbeb; color:#92400e; border-color:#fde68a; }
      .checklistGroupBadge-missing { background:#f8fafc; color:#475569; }
      .checklistGroupBody { padding:0 14px 14px; display:grid; gap:10px; }
      .checklistPoint { border:1px solid #dbe7ec; background:#fff; border-radius:16px; padding:12px; }
      .checklistPoint-avvik { border-color:#fecaca; background:#fff7f7; }
      .checklistPoint-done { border-color:#bbf7d0; }
      .checklistPointTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistPointTitle small { color:#64748b; font-weight:700; }
      .checklistWarrantyPoint { border-color:#bfdbfe; background:#eff6ff; }
      .checklistWarrantyPoint.checklistPoint-done { border-color:#93c5fd; background:#eff6ff; }
      .warrantyPointBadge { display:inline-flex; align-items:center; width:max-content; gap:5px; padding:4px 8px; border-radius:999px; border:1px solid #bfdbfe; background:#dbeafe; color:#1e3a8a; font-size:11px; font-weight:900; letter-spacing:.02em; text-transform:uppercase; }
      .warrantyProgressCard { border-color:#bfdbfe !important; background:#eff6ff !important; }
      .warrantyProgress span { background:#1d4ed8 !important; }
      .warrantyMissingList { margin-top:12px; }
      .warrantyMissingButtons { display:grid; gap:8px; margin-top:8px; }
      .warrantyJumpButton { justify-content:flex-start !important; text-align:left !important; white-space:normal !important; }
      .checklistPointFocus { outline:4px solid #facc15; box-shadow:0 0 0 6px rgba(250,204,21,0.25); transition:outline .2s ease, box-shadow .2s ease; }

      @media screen and (max-width:700px) {
        .checklistSummaryCard { padding:12px !important; border-radius:16px !important; margin:10px 0 12px !important; }
        .checklistSummaryCard b { font-size:17px !important; }
        .checklistSummaryBadges { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryBadges span { justify-content:center !important; font-size:12.5px !important; padding:7px 6px !important; }
        .checklistSummaryActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryActions button { width:100% !important; font-size:13px !important; }
        .checklistGroupHeader { grid-template-columns:auto 1fr !important; padding:12px !important; min-height:64px !important; gap:8px !important; align-items:start !important; }
        .checklistGroupCaret { width:34px !important; height:34px !important; font-size:20px !important; margin-top:1px !important; }
        .checklistGroupBadge { grid-column:2 !important; justify-self:start !important; margin-top:4px !important; max-width:100% !important; white-space:normal !important; }
        .checklistGroupTitle b { font-size:16.5px !important; }
        .checklistGroupTitle small { font-size:12.5px !important; }
        .checklistGroupBadge { font-size:11.5px !important; padding:5px 7px !important; }
        .checklistGroupBody { padding:0 10px 10px !important; gap:8px !important; }
        .checklistPoint { padding:10px !important; border-radius:15px !important; }
        .warrantyPointBadge { font-size:10.5px !important; padding:4px 7px !important; }
        .warrantyMissingButtons { gap:6px !important; }
        .warrantyJumpButton { width:100% !important; }

        .checklistHeader { display:grid !important; gap:8px !important; }
        .checklistStatusButtons { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; }
        .checklistStatusButtons button { width:100% !important; min-height:40px !important; padding:7px 4px !important; font-size:12.5px !important; }
        .checklistUpload { width:100% !important; justify-content:center !important; margin-top:8px !important; }
      }



      .deviationCloseBox, .deviationClosedBox { border:1px solid #dbe7ec; border-radius:14px; padding:12px; margin:10px 0; background:#f8fafc; }
      .deviationCloseBox { border-color:#fecaca; background:#fff7f7; }
      .deviationClosedBox { border-color:#bbf7d0; background:#ecfdf5; }
      .deviationClosedBox b { color:#065f46; }

      /* iPhone Safari safe-area: avoid bottom browser toolbar */
      @media screen and (max-width:700px) {
        .bottomPrevNext {
          padding-bottom:calc(110px + env(safe-area-inset-bottom)) !important;
          margin-bottom:0 !important;
        }
        main {
          padding-bottom:calc(120px + env(safe-area-inset-bottom)) !important;
        }
      }

      /* Mobile UX fase 3: sticky feltapp-meny */
      .mobileFieldBar { display:none; }
      @media screen and (max-width: 700px) {
        .mobileNav { display:none !important; }
        .mobileCurrentProjectBar { display:none !important; }
        .mobileFieldBar {
          display:block !important;
          position:sticky;
          top:0;
          z-index:60;
          padding:8px 10px 9px;
          background:rgba(248,250,252,0.96);
          backdrop-filter:blur(14px);
          border-bottom:1px solid #dbe7ec;
          box-shadow:0 8px 22px rgba(15,23,42,0.08);
        }
        .mobileFieldBarInner {
          max-width:1180px;
          margin:0 auto;
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
          align-items:center;
        }
        .mobileProjectLine {
          grid-column:1 / -1;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          min-width:0;
        }
        .mobileProjectLineText { min-width:0; }
        .mobileProjectLineText b {
          display:block;
          font-size:11px;
          letter-spacing:.05em;
          text-transform:uppercase;
          color:#64748b;
          line-height:1.1;
        }
        .mobileProjectLineText span {
          display:block;
          font-size:15px;
          font-weight:900;
          color:#0f172a;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          max-width:70vw;
          line-height:1.25;
        }
        .mobileFieldBar select {
          width:100%;
          min-height:44px !important;
          border-radius:14px !important;
          font-size:16px !important;
          font-weight:900 !important;
          background:#fff !important;
          border:1px solid #cbd5e1 !important;
          padding:8px 12px !important;
        }
        section { scroll-margin-top:106px !important; }
        main { padding-top:10px !important; }
      }


      /* FASE 6 v2: mobile top actions - make all critical header buttons available in portrait */
      @media screen and (max-width: 700px) {
        header .head {
          display:grid !important;
          grid-template-columns:92px minmax(0, 1fr) !important;
          gap:8px !important;
          align-items:center !important;
          padding:8px 10px 10px !important;
        }
        header .head > div:first-child {
          grid-column:1 !important;
          width:92px !important;
          height:38px !important;
          flex:0 0 92px !important;
          min-width:0 !important;
        }
        header .head > div:nth-child(2) {
          grid-column:2 !important;
          min-width:0 !important;
        }
        header .head h1 {
          font-size:17px !important;
          line-height:1.1 !important;
          margin:0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        header .head p {
          max-width:100% !important;
          font-size:12px !important;
          margin:2px 0 0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        header .head > button,
        header .head > button:nth-of-type(1),
        header .head > button:nth-of-type(2),
        header .head > button:nth-of-type(3),
        header .head > button:nth-of-type(4),
        header .head > button:nth-of-type(5),
        header .head > button:nth-of-type(6),
        header .head > button:nth-of-type(7) {
          display:inline-flex !important;
          width:100% !important;
          min-height:38px !important;
          padding:7px 8px !important;
          border-radius:12px !important;
          font-size:12.5px !important;
          line-height:1.1 !important;
          justify-content:center !important;
          align-items:center !important;
          gap:5px !important;
          white-space:normal !important;
        }
        header .head > button svg {
          width:15px !important;
          height:15px !important;
          flex:0 0 auto !important;
        }
      }


      /* FASE 6.11 compact + chat-fokus: kun visuell komprimering */
      .customerChatFocusNote {
        margin: 8px 0 10px !important;
        padding: 9px 11px;
        border: 1px solid #dbe7ec;
        border-radius: 14px;
        background: #f8fafc;
        font-weight: 800;
      }
      .customerPortalActions button:first-child {
        font-weight: 900;
      }
      @media screen and (max-width:700px) {
        main { padding-top: 8px !important; }
        section { padding: 11px !important; margin: 8px auto !important; border-radius: 16px !important; }
        section h2 { font-size: 19px !important; margin-bottom: 8px !important; }
        h3 { font-size: 16px !important; margin: 8px 0 6px !important; }
        .note { font-size: 13px !important; line-height: 1.38 !important; margin: 6px 0 !important; }
        .grid { gap: 8px !important; }
        .item, .out { padding: 9px !important; margin: 7px 0 !important; border-radius: 14px !important; }
        .tile { padding: 8px !important; border-radius: 14px !important; }
        .cards { gap: 7px !important; }
        input, textarea, select { min-height: 40px !important; }
        textarea { min-height: 74px !important; }
        button, .upload { min-height: 39px !important; padding: 8px 10px !important; }
        .collapsibleBlock { margin: 7px 0 !important; }
        .collapsibleBlock summary { min-height: 42px !important; padding: 9px 11px !important; }
        .collapsibleBlockBody { padding: 0 10px 10px !important; }
        .projectListCard { padding: 10px !important; margin: 8px 0 !important; }
        .projectListActions { margin-top: 8px !important; }
        .projectListMetaCards { margin-top: 7px !important; }
        .customerPortalActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:7px !important; }
        .customerPortalActions button { width:100% !important; }
        .customerPortalActions button:first-child { grid-column:1 / -1; min-height:44px !important; }
        .customerChatFocusNote { font-size:13px !important; line-height:1.35 !important; }
      }

    

      /* FASE 7 Deploy 3B: mobiljustering av sjekklister */
      @media screen and (max-width: 700px) {
        html, body, #root {
          max-width: 100% !important;
          overflow-x: hidden !important;
        }

        main,
        section,
        .checklistList,
        .checklistAccordion,
        .checklistGroup,
        .checklistGroupBody,
        .checklistPoint,
        .checklistHeader,
        .checklistPointTitle,
        .checklistSummaryCard {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }

        .checklistAccordion {
          display: block !important;
          padding: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        .checklistGroup {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 0 !important;
          border-radius: 16px !important;
        }

        .checklistGroupHeader {
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: auto minmax(0, 1fr) !important;
          gap: 8px !important;
          align-items: start !important;
          text-align: left !important;
          white-space: normal !important;
          overflow: hidden !important;
        }

        .checklistGroupBadge {
          grid-column: 2 !important;
          justify-self: start !important;
          max-width: 100% !important;
          white-space: normal !important;
        }

        .checklistGroupTitle,
        .checklistGroupTitle b,
        .checklistGroupTitle small,
        .checklistPointTitle,
        .checklistPointTitle b,
        .checklistPointTitle small,
        .warrantyPointBadge {
          max-width: 100% !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          white-space: normal !important;
        }

        .checklistGroupBody {
          padding: 8px !important;
        }

        .checklistPoint {
          padding: 12px !important;
          margin: 10px 0 !important;
          border-radius: 16px !important;
        }

        .checklistHeader {
          display: block !important;
        }

        .checklistStatusButtons {
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          margin-top: 10px !important;
          overflow: hidden !important;
        }

        .checklistStatusButtons button {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
        }

        .checklistStatusButtons button:nth-child(3) {
          grid-column: 1 / -1 !important;
        }

        .checklistUpload {
          width: 100% !important;
          max-width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          text-align: center !important;
          overflow: hidden !important;
        }

        .checklistPhotos,
        .checklistPhotos .photo,
        .checklistPhotos img,
        .checklistPhotos small {
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .checklistPhotos {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 8px !important;
          overflow-x: hidden !important;
        }

        .checklistPhotos .photo img {
          width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
        }

        .deviationCloseBox,
        .deviationClosedBox {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
      }

` }),
      lightboxImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "imageLightboxOverlay", onClick: (event) => {
        event.stopPropagation();
        setLightboxImage(null);
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "imageLightboxInner", onClick: (event) => event.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "imageLightboxTop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "imageLightboxClose", onClick: () => setLightboxImage(null), children: "Lukk bilde" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { className: "imageLightboxImage", src: lightboxImage.src, alt: lightboxImage.alt })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: projectId ? `${currentStatus.icon} ${currentStatus.label}` : authUser?.email || name })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: createNewProject, children: "+ Nytt prosjekt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProject, children: projectId ? "Oppdater prosjekt" : "Lagre / oppdater prosjekt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveAsNewProject, children: "Lagre som kopi" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: downloadClickablePdfReport, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 18 }),
            " Last ned PDF"
          ] }),
          projectId && (isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(false), children: "\u{1F513} L\xE5s opp prosjekt" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(true), children: "\u{1F512} Avslutt prosjekt" }))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => goToTab(id), children: l }, id)) }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNav", style: { maxWidth: "1180px", margin: "0 auto", padding: "0 16px 14px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavPanel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavTop", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Meny" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tabs.find(([id]) => id === tab)?.[1] || "Velg side" })
            ] }),
            projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileNavPill", children: [
              currentStatus.icon,
              " ",
              currentStatus.label
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNavSelectWrap", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg side", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id, children: l }, id)) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileSectionChips", "aria-label": "Hurtigvalg seksjoner", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "produkter" ? "" : "secondary", onClick: () => goToTab("produkter"), children: "Produkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "sjekklister" ? "" : "secondary", onClick: () => goToTab("sjekklister"), children: "Sjekklister" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "tilbud" ? "" : "secondary", onClick: () => goToTab("tilbud"), children: "Tilbud" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "overtagelse" ? "" : "secondary", onClick: () => goToTab("overtagelse"), children: "Overtag." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavQuick", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: !previousTab, onClick: () => previousTab && goToTab(previousTab[0]), children: "\u2190 Forrige" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !nextTab, onClick: () => nextTab && goToTab(nextTab[0]), children: "Neste \u2192" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavStatus", children: [
            unreadForAdmin > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
              "\u{1F4AC} ",
              unreadForAdmin,
              " ulest"
            ] }),
            totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
              "Chat: ",
              totalChatCount
            ] })
          ] })
        ] }) })
      ] }),
      projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileFieldBar", "aria-label": "Mobil arbeidsmeny", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileFieldBarInner", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLine", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLineText", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Du jobber i" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.projectName || project.address || "\xC5pent prosjekt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
            setProjectId(null);
            setTab("prosjekt");
          }, children: "Bytt" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg seksjon", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id, children: l }, "mobile-field-" + id)) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
        !projectId && !mobileCreatingProject && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "mobileProjectChooser", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Hvilket prosjekt vil du jobbe i?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mobileProjectChooserIntro", children: "Velg aktivt prosjekt f\xF8rst. Avsluttede prosjekter ligger i prosjektlisten/arkivet." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "S\xF8k etter prosjekt, kunde eller adresse", value: projectSearch, onChange: setProjectSearch }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectChooserActions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadProjects(authUser, true), children: "Oppdater liste" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
              createNewProject();
              setTab("prosjekt");
            }, children: "+ Nytt prosjekt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectList", children: [
            activeMobileProjectRows.slice(0, 8).map(({ row: p, listProject, listStatus, unreadForAdminInList }) => {
              const locationLine = [listProject.address, listProject.postnr, listProject.city].filter(Boolean).join(", ");
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickCard", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickCardTop", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.title || listProject.projectName || "Uten navn" }),
                    listProject.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                      "Kunde: ",
                      listProject.customer
                    ] }),
                    locationLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: locationLine }),
                    unreadForAdminInList > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { color: "#991b1b", fontWeight: 900 }, children: [
                      "\u{1F4AC} ",
                      unreadForAdminInList,
                      " ulest fra kunde"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileProjectPickStatus", children: [
                    listStatus.icon,
                    " ",
                    listStatus.label
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickActions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openProjectById(p.id, "prosjekt"), children: "\xC5pne" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "bilder"), children: "Bilder" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "sjekklister"), children: "Sjekklister" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "chat"), children: "Chat" })
                ] })
              ] }, `mobile-pick-${p.id}`);
            }),
            projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen prosjekter hentet enn\xE5. Trykk Oppdater liste." }),
            projects.length > 0 && activeMobileProjectRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen aktive prosjekter matcher s\xF8ket. Avsluttede prosjekter finnes fortsatt i prosjektlisten/arkivet." })
          ] })
        ] }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileCurrentProjectBar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Du jobber i" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.projectName || project.address || "\xC5pent prosjekt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileCurrentProjectActions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
              setProjectId(null);
              setTab("prosjekt");
            }, children: "Bytt prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("bilder"), children: "G\xE5 til bilder" })
          ] })
        ] }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: `${currentStatus.icon} Prosjektstatus: ${currentStatus.label}`, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `statusBadge status-${currentStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", fontWeight: 700, marginBottom: "10px", border: "1px solid #dbe7ec", ...statusStyle(currentStatus.tone) }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStatus.icon }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStatus.label })
          ] }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "activeDeviationFocus item", style: { margin: "10px 0", borderColor: "#fecaca", background: "#fff7f7" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Prosjektet har ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.openDeviationCount }),
              " åpne avvik som bør følges opp før prosjektet settes klart for kunde."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: openActiveDeviations, children: "Se aktive avvik" })
          ] }),
          !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { margin: "10px 0" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Arbeidsstatus", value: project.workflowStatus || "Pågår", options: workflowStatusOptions, onChange: (v) => setProject({ ...project, workflowStatus: v }) }),
            suggestedWorkflowStatus !== (project.workflowStatus || "Pågår") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Forslag basert på prosjektet: ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: suggestedWorkflowStatus }),
              "."
            ] }),
            suggestedWorkflowStatus !== (project.workflowStatus || "Pågår") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setProject({ ...project, workflowStatus: suggestedWorkflowStatus }), children: "Bruk foreslått status" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isProjectLocked ? `Prosjektet ble l\xE5st${project.lockedAt ? " " + new Date(project.lockedAt).toLocaleString("no-NO") : ""}${project.lockedBy ? " av " + project.lockedBy : ""}. L\xE5s opp prosjektet hvis du trenger \xE5 gj\xF8re endringer.` : "Prosjektet er åpent for endringer. Bruk arbeidsstatus for å vise om prosjektet er utkast, pågår, avventer, klart for kunde eller har åpne avvik." }),
          projectHasOvertagelse() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Overtagelse er registrert",
            overtagelse.dato ? ` ${new Date(overtagelse.dato).toLocaleDateString("no-NO")}` : "",
            "."
          ] }),
          totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "\u{1F4AC} Chat: ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt",
            customerChatCount > 0 ? ` \xB7 ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` \xB7 ${unreadForAdmin} ulest` : "",
            latestChatMessage?.created ? ` \xB7 siste ${new Date(latestChatMessage.created).toLocaleString("no-NO")}` : "",
            "."
          ] })
        ] }),
        projectId && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Hva mangler på prosjektet?", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Denne oversikten viser hva som er på plass og hva som bør kontrolleres før rapport, PDF og overtagelse." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideGrid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: `${projectGuideStats.completionPercent}%` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ferdigstillelse" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.productCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "produkter valgt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.photoCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "bilder lagt til" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.checklistDone }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: projectGuideStats.checklistMissing > 0 ? `${projectGuideStats.checklistMissing} sjekkpunkt gjenstår` : "sjekklister ferdig" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.openDeviationCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: projectGuideStats.openDeviationCount > 0 ? "åpne avvik" : "ingen åpne avvik" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.hasOvertagelse ? "Ja" : "Nei" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "overtagelse registrert" })
            ] })
          ] }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektet har åpne avvik. Lukk avvikene når tiltak er utført og kontrollert." }),
          projectGuideItems.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "guideSteps", children: projectGuideItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `guideStep guideStep-${item.tone}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideStepText", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.label }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Trykk for å gå direkte til riktig seksjon." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab(item.tab), children: "Åpne" })
          ] }, item.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektet ser komplett ut. Kontroller rapporten før prosjektet avsluttes." }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: openActiveDeviations, children: "Se aktive avvik" })
        ] }),
        tab === "prosjekt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: !projectId && !mobileCreatingProject ? "desktopOnlyWhenNoProject" : "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Prosjektinformasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Prosjekt- og kundeinfo", defaultOpen: !(hasValue(project.projectName) && hasValue(project.customer) && hasValue(project.customerEmail || project.customerPhone)), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Prosjektansvarlig", value: project.responsible, onChange: (v) => setProject({ ...project, responsible: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato", type: "date", value: project.date, onChange: (v) => setProject({ ...project, date: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn p\xE5 prosjekt", value: project.projectName, onChange: (v) => setProject({ ...project, projectName: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: project.address, onChange: (v) => setProject({ ...project, address: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Postnr.", value: project.postnr || "", onChange: (v) => setProject({ ...project, postnr: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Poststed / by", value: project.city || "", onChange: (v) => setProject({ ...project, city: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde", value: project.customer, onChange: (v) => setProject({ ...project, customer: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde e-post", type: "email", value: project.customerEmail || "", onChange: (v) => setProject({ ...project, customerEmail: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde telefon", type: "tel", value: project.customerPhone || "", onChange: (v) => setProject({ ...project, customerPhone: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Notater", value: project.notes, onChange: (v) => setProject({ ...project, notes: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectWarrantySetup, { warranty, setWarranty, systems: soproWarrantySystems })
        ] }) }) }) }),
        tab === "prosjektinfo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektinformasjon/beskrivelse", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her kan prosjektleder legge inn praktisk prosjektinformasjon som kunde og underentreprenører skal kunne lese i sine prosjektlenker." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Standardtekster", defaultOpen: !hasValue(project.projectDescription), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Trykk på en mal for å legge den inn nederst i prosjektbeskrivelsen. Teksten kan redigeres fritt etterpå." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }, children: projectDescriptionTemplates.map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => appendProjectDescriptionTemplate(template.text), children: template.label }, template.label)) })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse / nødvendig prosjektinformasjon", value: project.projectDescription || "", onChange: (v) => setProject({ ...project, projectDescription: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Portal/PDF-innstillinger", defaultOpen: !project.projectInfoIncludeInReport, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.projectInfoIncludeInReport, onChange: (e) => setProject({ ...project, projectInfoIncludeInReport: e.target.checked }), style: { width: "auto" } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ta med prosjektinformasjon/beskrivelse i rapport/PDF" })
          ] }) })
        ] }),
        tab === "firma" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Firmaprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Firmaprofilen lagres p\xE5 brukeren din og brukes automatisk i prosjekter og rapporter." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Firmainfo og logo", defaultOpen: !hasValue(company.companyName) || !hasValue(company.email), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "two", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "logoBox", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Last opp firmalogo",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
              ] }),
              company.logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setCompany({ ...company, logoUrl: "" }), children: "Fjern logo" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email, onChange: (v) => setCompany({ ...company, email: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website, onChange: (v) => setCompany({ ...company, website: v }) })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfile, children: "Lagre firmaprofil" })
        ] }),
        tab === "innlogging" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Innlogging og brukerprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Du er logget inn som ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: authUser?.email }),
            ". Prosjektlisten viser kun dine prosjekter. Delingslenker kan fortsatt \xE5pnes av kunde uten innlogging."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn", value: user.name, onChange: (v) => setUser({ ...user, name: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post i rapport", value: user.email, onChange: (v) => setUser({ ...user, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: user.role, options: roles, onChange: (v) => setUser({ ...user, role: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }),
        tab === "prosjektering" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektering", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Angi fall som forholdstall, for eksempel 1:50 i dusjsone og 1:100 utenfor dusjsone." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall i dusjsone", value: project.fallDusj || "", onChange: (v) => setProject({ ...project, fallDusj: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall utenfor dusjsone / v\xE5tsone", value: project.fallUtenfor || "", onChange: (v) => setProject({ ...project, fallUtenfor: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Slukplassering", value: project.sluk, onChange: (v) => setProject({ ...project, sluk: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Terskelh\xF8yde", value: project.terskel, onChange: (v) => setProject({ ...project, terskel: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Membranl\xF8sning", value: project.membran, onChange: (v) => setProject({ ...project, membran: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / avvik", value: project.prosjekteringKommentar, onChange: (v) => setProject({ ...project, prosjekteringKommentar: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Egne prosjekteringspunkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg til egne punkter som skal f\xF8lge prosjektet og vises i rapporten hvis de er fylt ut." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: addProsjekteringPunkt, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til punkt"
            ] }),
            (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Punkt / tittel", value: point.title || "", onChange: (v) => updateProsjekteringPunkt(point.id, { title: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Verdi / beskrivelse", value: point.value || "", onChange: (v) => updateProsjekteringPunkt(point.id, { value: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeProsjekteringPunkt(point.id), children: "Fjern punkt" })
            ] }, point.id))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
            " Last opp tegning / bilde",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto("Prosjektering", e.target.files) })
          ] })
        ] }),
        tab === "produkter" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: productSections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: s.title, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kryss av produkter som er brukt. N\xE5r et produkt er valgt, kan du legge inn FDV-/databladlink og hvor produktet er brukt direkte p\xE5 produktet." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList", children: s.items.map((i) => {
            const doc = productDocs[i] || {};
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], onChange: (e) => toggleProductChecked(i, e.target.checked) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: i })
              ] }),
              checked[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladUrl: v, fdvSource: "manual" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", onChange: (v) => updateProductDoc(i, { comment: v }) })
                ] }),
                doc.fdvSource === "product-master" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dokumentlinker er hentet automatisk fra produktmaster." }),
                doc.fdvSource === "admin-register" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "FDV-link er hentet automatisk fra admin FDV-register." })
              ] })
            ] }, i);
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
              "Andre produkter i ",
              s.title
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk dette hvis produktet ikke ligger i standardlisten for denne kategorien." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til annet produkt"
            ] }),
            getManualProductsForSection(s.title).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen andre produkter lagt til i denne kategorien." }),
            getManualProductsForSection(s.title).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
            ] }, p.id))
          ] })
        ] }, s.title)) }),
        tab === "overflater" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Overflateprodukter", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaces.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: `${f} - produkt, farge og plassering`, value: surf[f] || "", onChange: (v) => setSurf({ ...surf, [f]: v }) }, f)) }) }),
        tab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bildedokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: imageCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "tile", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 16 }),
              " ",
              c
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photos.filter((p) => p.cat === c).length > 0 ? `\u{1F4F7} ${photos.filter((p) => p.cat === c).length} bilder lagt til` : "Ta bilde eller velg fra galleri" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto(c, e.target.files) })
          ] }, c)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGrid, { photos, setPhotos })
        ] }),
        tab === "tilgang" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilgang og deling", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Administrer tilgang til prosjektet. Kunde f\xE5r egen kundelink med rapport, tilbud/kontrakt og chat. Underentrepren\xF8rer kan bidra med dokumentasjon via egen tilgang." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Melding i e-post med tilgangslink", value: accessEmailMessage, onChange: setAccessEmailMessage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: accessRoleInfo.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.role }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.text })
          ] }, r.role)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => setAccess([...access, { id: uid(), name: "", email: "", role: "Underleverand\xF8r" }]), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til person/firma"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink("kunde"), children: "Kopier kundelink" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => sendAccessEmail({ role: "kunde", toEmail: project.customerEmail, recipientName: project.customer }), children: "Send kundelink på e-post" })
          ] }),
          access.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen ekstra tilganger er lagt til enn\xE5." }),
          access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/firma", value: a.name, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, name: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: a.email, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, email: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: a.role, options: roles, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, role: v } : x)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: accessRoleInfo.find((r) => r.role === a.role)?.text || "" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink(a.role), children: "Kopier link" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => sendAccessEmail({ role: a.role, toEmail: a.email, recipientName: a.name }), children: "Send e-post med link" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setAccess(access.filter((x) => x.id !== a.id)), children: "Fjern" })
            ] })
          ] }, a.id))
        ] }),
        tab === "installasjoner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Fag, deler og utstyr", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "R\xF8rlegger", name: "", qty: "", supplier: "", desc: "", fdvUrl: "", photos: [], by: user.name || "Ukjent", created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO") }]), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
            " Legg til post"
          ] }),
          inst.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, category: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverand\xF8r", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp bilder",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                const imgs = await uploadImages(e.target.files, "installasjoner");
                setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
              } })
            ] }),
            (x.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "\u{1F4F7} ",
              (x.photos || []).length,
              " bilder lagt til"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: (x.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
            ] }, p.id)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
              "Lagt inn av ",
              x.by,
              " \xB7 ",
              x.created
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
          ] }, x.id))
        ] }),
        tab === "sjekklister" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sjekklister og vedlegg", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg status per kontrollpunkt. Kategoriene kan \xE5pnes/lukkes for mindre scrolling p\xE5 mobil. Ved Avvik kan du skrive kommentar og ta bilde." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ChecklistEditor,
            {
              checklist,
              setChecklistValue,
              addChecklistPhoto,
              addFiles,
              files,
              setFiles,
              closedByName: user.name || authUser?.email || "Utførende",
              showOpenDeviationsOnly,
              setShowOpenDeviationsOnly,
              warranty
            }
          )
        ] }),
        tab === "tilbud" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilbud / kontrakt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her legger du inn tilbud, kontrakt og avtaleendringer. Kunde f\xE5r se dette i kundelinken n\xE5r det finnes innhold eller vedlegg. Huk av hvis sammendraget ogs\xE5 skal med i vanlig rapport/PDF." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Tillegg", value: tilbud.tillegg || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, tillegg: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Fradrag", value: tilbud.fradrag || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, fradrag: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, kommentar: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "checkbox",
                  style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                  checked: !!tilbud.enabled,
                  onChange: (e) => setTilbud({ ...emptyTilbud(), ...tilbud, enabled: e.target.checked })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med sammendrag i rapport" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Last opp tilbud, kontrakt eller andre avtaledokumenter. Vedleggene lagres p\xE5 prosjektet og vises i kundelinken. Underentrepren\xF8r har ikke tilgang til tilbud/kontrakt." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp tilbud / kontrakt",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => uploadTilbudFiles(e.target.files) })
            ] }),
            (tilbud.files || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen tilbud eller kontrakter er lastet opp enn\xE5." }),
            (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Lastet opp av ",
                f.by || "Ukjent",
                " \xB7 ",
                f.created
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: "\xC5pne" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setTilbud({ ...emptyTilbud(), ...tilbud, files: (tilbud.files || []).filter((x) => x.id !== f.id) }), children: "Fjern" })
            ] }, f.id))
          ] })
        ] }),
        tab === "overtagelse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Overtagelse og signering", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk denne ved sluttbefaring og overlevering. N\xE5r begge signaturer er fylt ut kan prosjektet fullf\xF8res og l\xE5ses." }),
          isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "\u{1F512} Prosjektet er l\xE5st. Overtagelsen kan vises i rapporten, men endringer krever at prosjektet l\xE5ses opp." }),
          projectHasOvertagelse() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "\u2705 Overtagelse registrert",
            overtagelse.dato ? ` ${new Date(overtagelse.dato).toLocaleDateString("no-NO")}` : "",
            "."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato for overtagelse", type: "date", value: overtagelse.dato || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, dato: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "checkbox",
                  style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                  checked: !!overtagelse.enabled,
                  onChange: (e) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, enabled: e.target.checked })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med overtagelse i rapport" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / merknader fra sluttbefaring", value: overtagelse.kommentar || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, kommentar: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Signaturer" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Signer direkte p\xE5 skjermen med finger p\xE5 telefon eller mus p\xE5 PC. Navn kan fylles ut i tillegg for tydelig dokumentasjon." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn utf\xF8rende", value: overtagelse.signUtf\u00F8rende || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rende: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn kunde", value: overtagelse.signKunde || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKunde: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", style: { marginTop: "14px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  SignaturePad,
                  {
                    label: "Signatur utf\xF8rende",
                    value: overtagelse.signUtf\u00F8rendeImage || "",
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rendeImage: v })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  SignaturePad,
                  {
                    label: "Signatur kunde",
                    value: overtagelse.signKundeImage || "",
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKundeImage: v })
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProject, children: "Lagre overtagelse" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: completeOvertagelseAndLock, disabled: isProjectLocked, children: "Fullf\xF8r overtagelse og l\xE5s prosjekt" })
          ] })
        ] }),
        tab === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount} meldinger)` : "Chat", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Chatten oppdateres automatisk live. Nye kundemeldinger st\xE5r som ulest til du svarer, klikker p\xE5 meldingen eller trykker Marker alle som lest. Skrivefeltet beholdes ved refresh." }),
          totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { fontWeight: 700 }, children: [
            "\u{1F4AC} Det finnes ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt i chatten",
            customerChatCount > 0 ? `, hvorav ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` \xB7 ${unreadForAdmin} ulest fra kunde` : " \xB7 alt er lest",
            "."
          ] }),
          !hasValue(project.customerEmail) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { fontWeight: 700 }, children: "\u26A0\uFE0F Legg inn kunde e-post i Prosjektinformasjon for at kunde skal f\xE5 e-postvarsling ved nye chatmeldinger." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                checked: !!projectLog.enabled,
                onChange: (e) => setProjectLog((prev) => ({ ...prev, enabled: e.target.checked }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med chat i rapport" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", style: { marginBottom: 0 }, children: [
              "\u{1F4F7} Last opp bilde",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  id: "admin-chat-image-input",
                  type: "file",
                  accept: "image/*",
                  onChange: (e) => setChatUploadFile(e.target.files?.[0] || null)
                }
              ),
              chatUploadFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                "Valgt: ",
                chatUploadFile.name
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: addProjectLogMessage, children: "Send melding" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForAdmin === 0, onClick: () => markChatAsRead("admin"), children: "Marker alle som lest" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setProjectLog((prev) => ({ ...prev, draft: "" })), children: "T\xF8m skrivefelt" })
          ] }),
          (projectLog.messages || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen meldinger enn\xE5." }),
          (projectLog.messages || []).slice().reverse().map((m) => {
            const isUnread = m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("admin"), style: isUnread ? { borderColor: "#fecaca", background: "#fff7f7", cursor: "pointer" } : void 0, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                m.by || "Ukjent",
                " ",
                m.role === "kunde" ? "\xB7 Kunde" : "\xB7 Utf\xF8rende"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                m.created ? new Date(m.created).toLocaleString("no-NO") : "",
                m.role === "kunde" ? isUnread ? " \xB7 Ulest for admin" : " \xB7 Lest av admin" : !lastReadByCustomer || (m.created || "") > lastReadByCustomer ? " \xB7 Ulest for kunde" : " \xB7 Lest av kunde"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
              m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: m.imageUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "img",
                  {
                    src: m.imageUrl,
                    alt: m.imageName || "Chat bilde",
                    style: { maxWidth: "280px", width: "100%", borderRadius: "12px", border: "1px solid #dbe7ec" }
                  }
                ) }),
                m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { display: "block", marginTop: "6px" }, children: m.imageName })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: (e) => {
                e.stopPropagation();
                removeProjectLogMessage(m.id);
              }, children: "Fjern melding" })
            ] }, m.id);
          })
        ] }),
        tab === "internt" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Interne notater", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette feltet er kun internt. Det vises ikke i kundelink og tas ikke med i rapport." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Interne notater", value: internalNotes || "", onChange: setInternalNotes }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: saveProject, children: "Lagre interne notater" }) })
        ] }),
        tab === "prosjektliste" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektliste", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her får du rask oversikt over aktive prosjekter, uleste kundemeldinger, bildedokumentasjon og snarveier til de vanligste arbeidsflatene." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.total }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Totalt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.active }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aktive" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.unread }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ulest chat" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.finished }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Arkiv" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item projectListSearchPanel", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk etter prosjekt, kunde, adresse eller ansvarlig", value: projectSearch, onChange: setProjectSearch }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Statusfilter", value: projectStatusFilter, onChange: setProjectStatusFilter, options: ["alle", "draft", "progress", "waiting", "customer_ready", "deviation", "done", "locked"] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListToolbar", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => loadProjects(authUser, true), children: "Oppdater" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectUnreadOnly ? "" : "secondary", onClick: () => setProjectUnreadOnly((v) => !v), children: projectUnreadOnly ? "Vis alle" : "Kun uleste" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "alle" ? "secondary" : "", onClick: () => setProjectStatusFilter("alle"), children: "Alle" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "progress" || projectStatusFilter === "open" ? "" : "secondary", onClick: () => setProjectStatusFilter(projectStatusFilter === "progress" || projectStatusFilter === "open" ? "alle" : "progress"), children: "Aktive" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "done" || projectStatusFilter === "locked" ? "" : "secondary", onClick: () => setProjectStatusFilter(projectStatusFilter === "done" || projectStatusFilter === "locked" ? "alle" : "done"), children: "Arkiv" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
                setProjectSearch("");
                setProjectStatusFilter("alle");
                setProjectUnreadOnly(false);
              }, children: "Nullstill" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Viser ",
              projectListStats.visible,
              " av ",
              projectListStats.total,
              " prosjekter. Status: Åpen, Pågår, Ferdigstilt eller Avsluttet/låst."
            ] })
          ] }),
          projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen prosjekter hentet ennå. Trykk Oppdater." }),
          projects.length > 0 && filteredProjectListRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen prosjekter matcher søket eller filteret." }),
          filteredProjectListRows.map(({ row: p, listProject, listStatus, unreadForAdminInList, latestMessage, imageSummary, openDeviationCount, productSummary }) => {
            const locationLine = [listProject.address, listProject.postnr, listProject.city].filter(Boolean).join(", ");
            const updatedLabel = p.updated_at || p.created_at ? new Date(p.updated_at || p.created_at).toLocaleString("no-NO") : "Ukjent";
            const latestChatLabel = latestMessage?.created ? new Date(latestMessage.created).toLocaleString("no-NO") : "Ingen meldinger";
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item projectListCard", style: unreadForAdminInList > 0 ? { borderColor: "#fecaca", background: "#fff7f7" } : void 0, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListCardTop", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListTitleBlock", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { style: { fontSize: "19px" }, children: p.title || listProject.projectName || "Uten navn" }),
                  listProject.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "6px 0 0" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde:" }),
                    " ",
                    listProject.customer
                  ] }),
                  listProject.customerPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["☎ ", listProject.customerPhone] }),
                  locationLine && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["📍 ", locationLine] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListBadges", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `statusBadge status-${listStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 700, border: "1px solid #dbe7ec", width: "fit-content", ...statusStyle(listStatus.tone) }, children: [
                    listStatus.icon,
                    " ",
                    listStatus.label
                  ] }),
                  unreadForAdminInList > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => openProjectById(p.id, "chat"), style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 800, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", width: "fit-content", minHeight: "auto", boxShadow: "none" }, children: [
                    "💬 ",
                    unreadForAdminInList,
                    " ulest"
                  ] }),
                  openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: true }), style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 800, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", width: "fit-content", minHeight: "auto", boxShadow: "none" }, children: [
                    "⚠️ ",
                    openDeviationCount,
                    " åpne avvik"
                  ] }),
                  productSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "📦 ",
                    productSummary.total,
                    " produkter"
                  ] }),
                  imageSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "📷 ",
                    imageSummary.total,
                    " bilder"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageCounts", style: { marginTop: "12px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "produkter"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none" }, children: ["📦 Produkter: ", productSummary.total] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: openDeviationCount > 0 }), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none", ...(openDeviationCount > 0 ? { borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" } : {}) }, children: ["⚠️ Åpne avvik: ", openDeviationCount] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "bilder"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none" }, children: ["📷 Bilder: ", imageSummary.total] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "chat"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none", ...(unreadForAdminInList > 0 ? { borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" } : {}) }, children: ["💬 Ulest chat: ", unreadForAdminInList] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListMetaCards", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Oppdatert" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: updatedLabel })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Siste chat" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: latestChatLabel })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Ansvarlig" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: listProject.responsible || "Ikke fylt ut" })
                ] })
              ] }),
              imageSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageCounts", children: [
                  imageSummary.photos > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["📁 Bilder: ", imageSummary.photos] }),
                  imageSummary.checklist > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["✅ Sjekkliste: ", imageSummary.checklist] }),
                  imageSummary.install > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["🧰 Fag/utstyr: ", imageSummary.install] }),
                  imageSummary.chat > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["💬 Chat: ", imageSummary.chat] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageStrip", "aria-label": "Bildeoversikt for prosjekt", children: [
                  imageSummary.previews.map((img, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageThumb", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: img.url, alt: img.label || img.source || "Prosjektbilde" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: img.source })
                  ] }, `${p.id}-img-${index}`)),
                  imageSummary.total > imageSummary.previews.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageThumb", style: { display: "flex", alignItems: "center", justifyContent: "center", height: "58px", border: "1px dashed #c7d6dd", borderRadius: "12px", background: "#f8fafc", fontWeight: 800 }, children: [
                    "+",
                    imageSummary.total - imageSummary.previews.length
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListActions projectListActionsV2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => openProjectById(p.id, "prosjekt"), children: "📂 Åpne" }),
                openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: true }), children: ["⚠️ Avvik (", openDeviationCount, ")"] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "produkter"), children: "📦 Produkter" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "bilder"), children: "📷 Bilder" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "sjekklister"), children: "✅ Sjekklister" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "rapport"), children: "📄 Rapport" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: unreadForAdminInList > 0 ? "" : "secondary", onClick: () => openProjectById(p.id, "chat"), children: unreadForAdminInList > 0 ? `💬 Chat (${unreadForAdminInList})` : "💬 Chat" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => deleteProject(p.id), children: "🗑️ Slett" })
              ] })
            ] }, p.id);
          })
        ] }),
        tab === "garanti" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarrantyPanel, { warranty, setWarranty, readiness: warrantyReadiness, issueWarranty, systems: soproWarrantySystems, goToTab }),
                tab === "rapport" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Report, { company, name, project, selected, manualProducts: manualSelected, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog }),
        tab === "admin" && canUseAdminProjectSync && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Admin", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isAdminUser ? "Her kan administrator godkjenne brukere, vedlikeholde produktmaster og synke dette prosjektet mot dokumentlinker." : "Her kan du synke dette prosjektet mot produktmasteren uten tilgang til hovedadmin-funksjoner." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Prosjektsynk" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Henter FDV, datablad, DOP, EPD og sikkerhetsdatablad fra produktmaster for valgte produkter i dette prosjektet." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => syncCurrentProjectProducts(), children: "Synk dette prosjektet" })
          ] }),
          isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Brukergodkjenning" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Forutsetter at Supabase-policy tillater admin \xE5 lese og oppdatere profiles." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", margin: "12px 0" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: loadAdminUsers, children: adminLoading ? "Henter brukere..." : "Oppdater brukerliste" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "pending" ? "" : "secondary", onClick: () => setAdminUserFilter("pending"), children: `Nye brukere (${pendingAdminUsers.length})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "all" ? "" : "secondary", onClick: () => setAdminUserFilter("all"), children: `Alle brukere (${adminUsers.length})` })
            ] }),
            adminUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen brukere hentet enn\xE5. Trykk Oppdater brukerliste." }),
            adminUsers.length > 0 && visibleAdminUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: adminUserFilter === "pending" ? "Ingen nye brukere venter p\xE5 godkjenning." : "Ingen brukere \xE5 vise." }),
            visibleAdminUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: u.email || "Ukjent e-post" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                u.company_name ? `Firma: ${u.company_name} \xB7 ` : "",
                "Status: ",
                u.approved ? "Godkjent" : "Venter p\xE5 godkjenning"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                !u.approved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => approveAdminUser(u.id), children: "Godkjenn bruker" }),
                u.approved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => revokeAdminUser(u.id), children: "Fjern godkjenning" })
              ] })
            ] }, u.id))
          ] }),
          isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Admin Produktmaster" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette er produktdatabasen fra prisfilen, uten priser. Legg inn FDV, datablad, DOP, EPD og sikkerhetsdatablad her. N\xE5r et standardprodukt velges i prosjektet, henter appen dokumentlinker automatisk fra denne masteren." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.total }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Produkter/varianter" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.appMatches }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Koblet mot app" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.withDocs }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Med dokumenter" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterLoading ? "..." : "OK" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadProductMaster(true), children: productMasterLoading ? "Henter produktmaster..." : "Oppdater produktmaster" }) }),
            (productMaster || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter funnet i produktmaster. Kj\xF8r SQL-filen fra flisLAB-importen f\xF8rst." }),
            (productMaster || []).filter((row) => row.used_in_app_standard_list || hasValue(row.app_match_name) || hasValue(row.fdv_url) || hasValue(row.datablad_url) || hasValue(row.dop_url) || hasValue(row.epd_url)).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: row.product_name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                row.product_no,
                " \xB7 ",
                row.category || "Uten kategori",
                row.app_match_name ? ` \xB7 App: ${row.app_match_name}` : ""
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: row.fdv_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { fdv_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: row.datablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { datablad_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: row.dop_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { dop_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: row.epd_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { epd_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: row.sikkerhetsdatablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { sikkerhetsdatablad_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Vedlagt dokument / samlet PDF", value: row.document_file_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { document_file_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kommentar", value: row.comment || "", onChange: (v) => updateProductMasterLocal(row.product_no, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => saveProductMasterRow(row), children: "Lagre dokumenter" }),
                row.updated_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  "Sist oppdatert: ",
                  new Date(row.updated_at).toLocaleString("no-NO")
                ] })
              ] })
            ] }, "pm-" + row.product_no))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bottomAppNav", "aria-label": "Hovednavigasjon mobil", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjektliste" ? "active" : "secondary", onClick: () => goToTab("prosjektliste"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C1}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Liste" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjekt" ? "active" : "secondary", onClick: () => goToTab("prosjekt"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u270F\uFE0F" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Info" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "chat" ? "active" : "secondary", onClick: () => goToTab("chat"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4AC}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: unreadForAdmin > 0 ? `${unreadForAdmin}` : "Chat" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "bilder" ? "active" : "secondary", onClick: () => goToTab("bilder"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4F7}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Foto" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "rapport" ? "active" : "secondary", onClick: () => goToTab("rapport"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C4}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDF" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bottomPrevNext", style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        maxWidth: "1180px",
        margin: "18px auto 28px",
        padding: "0 18px",
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            className: "secondary",
            disabled: !previousTab,
            onClick: () => previousTab && goToTab(previousTab[0]),
            style: { flex: "1 1 150px" },
            children: [
              "\u2190 Forrige",
              previousTab ? `: ${previousTab[1]}` : ""
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => nextTab && goToTab(nextTab[0]),
            disabled: !nextTab,
            style: { flex: "1 1 150px" },
            children: [
              "Neste",
              nextTab ? `: ${nextTab[1]}` : "",
              " \u2192"
            ]
          }
        )
      ] })
    ] });
  }
  async function uploadChatImage(file, projectId = "uten-prosjekt", sender = "chat") {
    if (!file) return null;
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const ext = cleanName.includes(".") ? cleanName.split(".").pop() : "jpg";
    const safeProjectId = String(projectId || "uten-prosjekt").replace(/[^a-zA-Z0-9._-]/g, "-");
    const safeSender = String(sender || "chat").replace(/[^a-zA-Z0-9._-]/g, "-");
    const fileName = `${safeProjectId}/${safeSender}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from("chat-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error(error);
      alert("Kunne ikke laste opp bilde: " + error.message);
      return null;
    }
    const { data: publicData } = supabase.storage.from("chat-images").getPublicUrl(data.path);
    return {
      imageUrl: publicData.publicUrl,
      imageName: file.name,
      imagePath: data.path
    };
  }
  function Brand({ logo, name }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "260px", height: "80px", overflow: "hidden", display: "flex", alignItems: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: logo ? logo : "/expo-logo.png", alt: name || "Expo Proffsenter", style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" } }) });
  }
  function ProjectWarrantySetup({ warranty, setWarranty, systems }) {
    const enabled = !!warranty?.enabled;
    const selectedSystem = systems.find((item) => item.id === warranty?.system);
    const setEnabled = (value) => {
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: !!value,
        system: value ? warranty?.system || "" : "",
        sintefApproval: value ? warranty?.sintefApproval || selectedSystem?.sintefApproval || "" : "",
        issued: value ? !!warranty?.issued : false,
        issuedAt: value ? warranty?.issuedAt || null : null,
        status: value ? warranty?.status || "draft" : "draft"
      });
    };
    const updateSystem = (systemId) => {
      const system = systems.find((item) => item.id === systemId);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        system: system?.id || "",
        sintefApproval: system?.sintefApproval || "",
        status: warranty?.issued ? "issued" : "draft"
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyProjectSetup", style: { gridColumn: "1 / -1" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "12 års dokumentert tetthetsgaranti" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg tidlig om prosjektet skal omfattes av 12 års dokumentert tetthetsgaranti. Hvis Ja velges aktiveres garantikravene og riktig Sopro-sjekkliste automatisk." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "projectWarrantyChoice", checked: enabled, onChange: () => setEnabled(true), style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ja" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "projectWarrantyChoice", checked: !enabled, onChange: () => setEnabled(false), style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nei" })
        ] })
      ] }),
      enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "12px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Velg membransystem", value: warranty?.system || "", options: ["", ...systems.map((item) => item.id)], optionLabels: { "": "Velg Sopro-system", ...Object.fromEntries(systems.map((item) => [item.id, item.label])) }, onChange: updateSystem }),
        selectedSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { marginTop: "8px" }, children: [
          "Valgt system: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: selectedSystem.product }),
          " · ",
          selectedSystem.sintefApproval,
          ". Garantikravene vises automatisk i Sjekklister og Garanti."
        ] })
      ] }),
      !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "8px" }, children: "Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig." })
    ] });
  }

  function WarrantyPanel({ warranty, setWarranty, readiness, issueWarranty, systems, goToTab }) {
    const selectedSystem = systems.find((item) => item.id === warranty?.system);
    const goToWarrantyPoint = (point) => {
      if (!point) return;
      if (typeof goToTab === "function") goToTab("sjekklister");
      window.setTimeout(() => {
        const el = document.getElementById(point.anchorId || checklistPointAnchor(point.category, point.item));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("checklistPointFocus");
          window.setTimeout(() => el.classList.remove("checklistPointFocus"), 2200);
        } else {
          alert("Gå til fanen Sjekklister og åpne riktig Sopro-kategori.");
        }
      }, 220);
    };
    const updateSystem = (systemId) => {
      const system = systems.find((item) => item.id === systemId);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        system: system?.id || "",
        sintefApproval: system?.sintefApproval || "",
        status: warranty?.issued ? "issued" : "draft"
      });
    };
    const enabled = !!warranty?.enabled;
    const issued = !!warranty?.issued;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "12 års dokumentert tetthetsgaranti", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantien er valgfri og kan bare utstedes når overtagelse er signert, alle avvik er lukket, sjekklister er fullført, bildedokumentasjon er lastet opp og godkjent Sopro-system er valgt." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 }, checked: enabled, onChange: (e) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: e.target.checked, system: e.target.checked ? warranty?.system || "" : "", sintefApproval: e.target.checked ? warranty?.sintefApproval || "" : "", issued: e.target.checked ? issued : false, issuedAt: e.target.checked ? warranty?.issuedAt || null : null, status: e.target.checked ? issued ? "issued" : "draft" : "draft" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aktiver 12 års dokumentert tetthetsgaranti for dette prosjektet" })
        ] }),
        !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig uten garanti." })
      ] }),
      enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Godkjent Sopro-system", value: warranty?.system || "", options: ["", ...systems.map((item) => item.id)], optionLabels: { "": "Velg Sopro-system", ...Object.fromEntries(systems.map((item) => [item.id, item.label])) }, onChange: updateSystem }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "SINTEF Teknisk Godkjenning", value: selectedSystem?.sintefApproval || warranty?.sintefApproval || "", onChange: (v) => setWarranty({ ...emptyWarranty(), ...warranty, sintefApproval: v }), disabled: true }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Garantiperiode", value: "12 år", onChange: () => {}, disabled: true }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Status", value: issued ? "Utstedt" : readiness?.ready ? "Klar til utstedelse" : "Ikke klar", onChange: () => {}, disabled: true })
        ] }),
        selectedSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyProgressCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "🛡️ Garantipunkter for valgt Sopro-system" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Valgt system legger automatisk inn egne kontrollpunkter i fanen Sjekklister. Overlappende generelle membran-/primerpunkter skjules i visningen når garanti er aktivert, slik at samme kontroll ikke må vurderes to ganger. Punktene merkes med 🛡️ Garantipunkt. Status: ",
            readiness?.systemChecklistDone || 0,
            " av ",
            readiness?.systemChecklistTotal || 0,
            " garantipunkter fullført · ",
            readiness?.systemChecklistPercent || 0,
            "%."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistProgress warrantyProgress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${readiness?.systemChecklistPercent || 0}%` } }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: selectedSystem.id === "sopro-aeb-815" ? "Grunnlaget er Sopro AEB 815 foliemembran med SINTEF TG 20918." : "Grunnlaget er Sopro FDF 525/527 smøremembran med SINTEF TG 20987." }),
          (readiness?.missingSystemChecklistPoints || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "warrantyMissingList", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Manglende garantipunkter:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "warrantyMissingButtons", children: readiness.missingSystemChecklistPoints.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary warrantyJumpButton", onClick: () => goToWarrantyPoint(point), children: `Gå til: ${point.item}` }, point.anchorId)) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: readiness?.ready ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fecaca", background: "#fff7f7" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: readiness?.ready ? "Klar til garanti" : "Ikke klar til garanti" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryBadges", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.overtagelseSigned ? "✅ Overtagelse signert" : "⚠️ Overtagelse mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.openDeviationCount === 0 ? "✅ Ingen åpne avvik" : `⚠️ ${readiness?.openDeviationCount || 0} åpne avvik` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.checklistComplete ? "✅ Sjekklister fullført" : `⚠️ ${readiness?.checklistDone || 0}/${readiness?.checklistTotal || 0} sjekklistepunkter` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.hasPhotos ? "✅ Bilder lastet opp" : "⚠️ Bilder mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.reportGenerated ? "✅ Komplett PDF generert" : "⚠️ Komplett PDF må lastes ned" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.approvedSoproSystemSelected ? "✅ Sopro-system valgt" : "⚠️ Sopro-system mangler" }),
            readiness?.approvedSoproSystemSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.systemChecklistComplete ? "✅ Sopro-punkter fullført" : `⚠️ ${readiness?.systemChecklistDone || 0}/${readiness?.systemChecklistTotal || 0} Sopro-punkter` })
          ] }),
          (readiness?.missing || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Mangler før garanti kan utstedes:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: readiness.missing.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item)) })
          ] }),
          issued && warranty?.issuedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Garantien er markert som utstedt ",
            new Date(warranty.issuedAt).toLocaleString("no-NO"),
            "."
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Grunnlag for garantien" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Garantien bygger på dokumentert utførelse med valgt Sopro-system, fullførte sjekklister, lukket avvikshåndtering, bildedokumentasjon, signert overtagelse og nedlastet komplett PDF-rapport. Garantibevis og garantivilkår legges automatisk bakerst i den komplette PDF-rapporten når garanti er aktivert." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: warrantyArchiveNotice }),
          warranty?.reportGeneratedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Sist genererte komplette PDF-rapport: ",
            new Date(warranty.reportGeneratedAt).toLocaleString("no-NO"),
            warranty?.reportGeneratedFileName ? ` · ${warranty.reportGeneratedFileName}` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !readiness?.ready, onClick: issueWarranty, children: issued ? "Oppdater garantistatus" : "Utsted 12 års tetthetsgaranti" }),
          issued && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setWarranty({ ...emptyWarranty(), ...warranty, issued: false, issuedAt: null, status: "draft" }), children: "Trekk tilbake utstedelse" })
        ] })
      ] })
    ] });
  }

  function Section({ title, icon, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
        icon,
        title
      ] }),
      children
    ] });
  }
  function CollapsibleBlock({ title, children, defaultOpen = true }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "collapsibleBlock", open: defaultOpen, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "collapsibleBlockBody", children })
    ] });
  }
  function Grid({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid", children });
  }
  function Input({ label, value, onChange, type = "text", onKeyDown, autoComplete, disabled = false }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type, value, autoComplete, onKeyDown, disabled, onChange: (e) => !disabled && onChange(e.target.value) })
    ] });
  }
  function Textarea({ label, value, onChange }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { value, onChange: (e) => onChange(e.target.value) })
    ] });
  }
  function Select({ label, value, onChange, options, optionLabels = {} }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value, onChange: (e) => onChange(e.target.value), children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: o, children: optionLabels[o] || o }, o)) })
    ] });
  }
  function PhotoGrid({ photos, setPhotos }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.cat }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.created }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { placeholder: "Kommentar", value: p.comment, onChange: (e) => setPhotos(photos.map((x) => x.id === p.id ? { ...x, comment: e.target.value } : x)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "secondary", onClick: () => setPhotos(photos.filter((x) => x.id !== p.id)), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 16 }),
        " Fjern"
      ] })
    ] }, p.id)) });
  }
  function ProjectInformationReadOnly({ project }) {
    const fields = [
      ["Prosjektnavn", project?.projectName],
      ["Adresse", [project?.address, project?.postnr, project?.city].filter(Boolean).join(" ")],
      ["Prosjektansvarlig", project?.responsible],
      ["Kunde", project?.customer],
      ["Kunde e-post", project?.customerEmail],
      ["Kunde telefon", project?.customerPhone],
      ["Dato", project?.date]
    ].filter(([, value]) => hasValue(value));
    const hasDescription = hasValue(project?.projectDescription);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektinformasjon/beskrivelse", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
      fields.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: fields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) }),
      hasDescription ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", style: { marginTop: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Beskrivelse / nødvendig prosjektinformasjon" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektleder har ikke lagt inn egen prosjektbeskrivelse ennå." })
    ] });
  }
  function ChecklistEditor({ checklist, setChecklistValue, addChecklistPhoto, addFiles, files, setFiles, closedByName = "Utførende", showOpenDeviationsOnly = false, setShowOpenDeviationsOnly = null, warranty = {} }) {
    const activeChecklistTemplate = getActiveChecklistTemplate(warranty);
    const [openCategories, setOpenCategories] = import_react.default.useState(() => ({ [activeChecklistTemplate[0]?.category || ""]: true }));
    import_react.default.useEffect(() => {
      if (!showOpenDeviationsOnly) return;
      const openGroups = Object.fromEntries(activeChecklistTemplate.map((group) => [
        group.category,
        group.items.some((item) => checklist?.[group.category]?.[item]?.status === "Avvik")
      ]));
      setOpenCategories(openGroups);
    }, [showOpenDeviationsOnly, checklist]);
    const groupHasOpenDeviation = (group) => group.items.some((item) => checklist?.[group.category]?.[item]?.status === "Avvik");
    const visibleChecklistGroups = showOpenDeviationsOnly ? activeChecklistTemplate.filter(groupHasOpenDeviation) : activeChecklistTemplate;
    const groupStats = (group) => {
      const total = group.items.length;
      const done = group.items.filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
      const deviations = group.items.filter((item) => checklist?.[group.category]?.[item]?.status === "Avvik").length;
      const closedDeviations = group.items.filter((item) => checklist?.[group.category]?.[item]?.status === "Lukket avvik").length;
      const photos = group.items.reduce((sum, item) => sum + (checklist?.[group.category]?.[item]?.photos || []).length, 0);
      return { total, done, missing: Math.max(0, total - done), deviations, closedDeviations, photos };
    };
    const totalStats = activeChecklistTemplate.reduce((acc, group) => {
      const stats = groupStats(group);
      acc.total += stats.total;
      acc.done += stats.done;
      acc.missing += stats.missing;
      acc.deviations += stats.deviations;
      acc.closedDeviations += stats.closedDeviations;
      acc.photos += stats.photos;
      return acc;
    }, { total: 0, done: 0, missing: 0, deviations: 0, closedDeviations: 0, photos: 0 });
    const percent = totalStats.total ? Math.round(totalStats.done / totalStats.total * 100) : 0;
    const toggleCategory = (category) => setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
    const expandAll = () => setOpenCategories(Object.fromEntries(activeChecklistTemplate.map((group) => [group.category, true])));
    const collapseDone = () => setOpenCategories(Object.fromEntries(activeChecklistTemplate.map((group) => {
      const stats = groupStats(group);
      return [group.category, stats.missing > 0 || stats.deviations > 0];
    })));
    const closeDeviation = (category, item, value = {}) => {
      const closeComment = window.prompt("Kommentar til lukking av avvik:", value.closeComment || "Utført/kontrollert og lukket.");
      if (closeComment === null) return;
      setChecklistValue(category, item, {
        status: "Lukket avvik",
        closedAt: (/* @__PURE__ */ new Date()).toISOString(),
        closedBy: closedByName || "Utførende",
        closeComment: closeComment.trim()
      });
    };
    const reopenDeviation = (category, item) => {
      if (!window.confirm("Vil du åpne avviket igjen?")) return;
      setChecklistValue(category, item, {
        status: "Avvik",
        closedAt: "",
        closedBy: "",
        closeComment: ""
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryCard", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Sjekklistefremdrift" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            totalStats.done,
            " av ",
            totalStats.total,
            " punkter vurdert \xB7 ",
            percent,
            "% ferdig"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistProgress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${percent}%` } }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryBadges", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u2705 ",
            totalStats.done,
            " utfylt"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u26AA ",
            totalStats.missing,
            " mangler"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u26A0\uFE0F ",
            totalStats.deviations,
            " åpne avvik"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u2705 ",
            totalStats.closedDeviations,
            " lukket"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u{1F4F7} ",
            totalStats.photos,
            " bilder"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryActions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: expandAll, children: "\xC5pne alle" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: collapseDone, children: "Vis det som gjenst\xE5r" }),
          totalStats.deviations > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setShowOpenDeviationsOnly && setShowOpenDeviationsOnly(!showOpenDeviationsOnly), children: showOpenDeviationsOnly ? "Vis alle punkter" : "Vis bare åpne avvik" })
        ] }),
        showOpenDeviationsOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Viser bare sjekkpunkter med åpne avvik. Trykk ‘Vis alle punkter’ for normal sjekkliste." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList checklistAccordion", children: visibleChecklistGroups.map((group) => {
        const stats = groupStats(group);
        const isOpen = openCategories[group.category] !== false;
        const groupTone = stats.deviations > 0 ? "avvik" : stats.missing === 0 ? "done" : stats.done > 0 ? "progress" : "missing";
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `item checklistGroup checklistGroup-${groupTone}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "checklistGroupHeader", onClick: () => toggleCategory(group.category), "aria-expanded": isOpen, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "checklistGroupCaret", "aria-hidden": "true", children: isOpen ? "\u25BE" : "\u25B8" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "checklistGroupTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                isSoproWarrantyCategory(group.category) ? "🛡️ " : "",
                group.category
              ] }),
              isSoproWarrantyCategory(group.category) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "12 ÅRS GARANTI" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                stats.done,
                "/",
                stats.total,
                " utfylt",
                stats.deviations ? ` \xB7 ${stats.deviations} avvik` : "",
                stats.photos ? ` \xB7 ${stats.photos} bilder` : ""
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `checklistGroupBadge checklistGroupBadge-${groupTone}`, children: stats.deviations > 0 ? "\u26A0\uFE0F Avvik" : stats.missing === 0 ? "\u2705 Ferdig" : stats.done > 0 ? "\u{1F7E1} P\xE5g\xE5r" : "\u26AA Mangler" })
          ] }),
          isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistGroupBody", children: group.items.filter((item) => !showOpenDeviationsOnly || checklist?.[group.category]?.[item]?.status === "Avvik").map((item) => {
            const value = checklist[group.category]?.[item] || {};
            const pointTone = value.status === "Avvik" ? "avvik" : value.status === "Lukket avvik" ? "done" : value.status ? "done" : "missing";
            const warrantyPoint = isSoproWarrantyPoint(group.category);
            const anchorId = checklistPointAnchor(group.category, item);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { id: anchorId, className: `checklistPoint checklistPoint-${pointTone}${warrantyPoint ? " checklistWarrantyPoint" : ""}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistHeader", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistPointTitle", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item }),
                  warrantyPoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "🛡️ Garantipunkt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                    value.status || "Ikke vurdert",
                    (value.photos || []).length > 0 ? ` \xB7 \u{1F4F7} ${(value.photos || []).length} bilder` : ""
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistStatusButtons", children: ["Ok", "Ikke aktuelt", "Avvik"].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: value.status === status ? "" : "secondary",
                    onClick: () => setChecklistValue(group.category, item, { status }),
                    children: status
                  },
                  status
                )) })
              ] }),
              (value.status || value.comment || (value.photos || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Textarea,
                {
                  label: "Kommentar",
                  value: value.comment || "",
                  onChange: (v) => setChecklistValue(group.category, item, { comment: v })
                }
              ),
              value.status === "Avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "deviationCloseBox", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Avviket er åpent. Lukk det når tiltak er utført og kontrollert." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => closeDeviation(group.category, item, value), children: "✅ Lukk avvik" })
              ] }),
              value.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "deviationClosedBox", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "✅ Avvik lukket" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                  value.closeComment || "Avviket er lukket.",
                  value.closedBy ? ` Lukket av ${value.closedBy}.` : "",
                  value.closedAt ? ` ${new Date(value.closedAt).toLocaleString("no-NO")}.` : ""
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => reopenDeviation(group.category, item), children: "Åpne avvik igjen" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload checklistUpload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Ta bilde / last opp bilde",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addChecklistPhoto(group.category, item, e.target.files) })
              ] }),
              (value.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos checklistPhotos", children: value.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
              ] }, p.id)) })
            ] }, item);
          }) })
        ] }, group.category);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Opplastede sjekklister / vedlegg fra andre fag", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
          " Last opp sjekkliste / vedlegg",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => addFiles(e.target.files) })
        ] }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
            "Lastet opp av ",
            f.by,
            " \xB7 ",
            f.created
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: "\xC5pne" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setFiles(files.filter((x) => x.id !== f.id)), children: "Fjern" })
        ] }, f.id))
      ] })
    ] });
  }
  function ChecklistReportSection({ checklist }) {
    const rows = [];
    Object.entries(checklist || {}).forEach(([category, items]) => {
      Object.entries(items || {}).forEach(([item, value]) => {
        if (value?.status || value?.comment || (value?.photos || []).length) {
          rows.push({ category, item, ...value });
        }
      });
    });
    if (!rows.length) return null;
    const deviations = rows.filter((r) => r.status === "Avvik" || r.status === "Lukket avvik");
    const openDeviationTotal = deviations.filter((r) => r.status === "Avvik").length;
    const closedDeviationTotal = deviations.filter((r) => r.status === "Lukket avvik").length;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekkliste" }),
      [...new Set(rows.map((r) => r.category))].map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: category }),
        rows.filter((r) => r.category === category).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistReportItem", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.item }),
            " — ",
            r.status || "Ikke vurdert"
          ] }),
          r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.status === "Lukket avvik" ? "Opprinnelig avvik: " : "Kommentar: " }),
            r.comment
          ] }),
          r.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utbedring / lukkekommentar: " }),
            r.closeComment || "Lukket uten egen lukkekommentar",
            r.closedBy ? ` · Lukket av ${r.closedBy}` : "",
            r.closedAt ? ` · ${new Date(r.closedAt).toLocaleString("no-NO")}` : ""
          ] }),
          (r.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: r.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || r.item }) }, p.id)) })
        ] }, r.category + r.item))
      ] }, category)),
      deviations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Avviksliste" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Avviksoppsummering: " }),
          `${openDeviationTotal} åpne avvik · ${closedDeviationTotal} lukkede avvik`
        ] }),
        deviations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistReportItem", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              r.status === "Lukket avvik" ? "✅ Lukket avvik" : "⚠️ Åpent avvik",
              " – ",
              r.category,
              " / ",
              r.item
            ] })
          ] }),
          r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Opprinnelig avvik: " }),
            r.comment
          ] }),
          r.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utbedring / lukkekommentar: " }),
            r.closeComment || "Lukket uten egen lukkekommentar",
            r.closedBy ? ` · Lukket av ${r.closedBy}` : "",
            r.closedAt ? ` · ${new Date(r.closedAt).toLocaleString("no-NO")}` : ""
          ] }),
          r.status !== "Lukket avvik" && !r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Avvik registrert uten kommentar." })
        ] }, "avvik-" + r.category + r.item))
      ] })
    ] });
  }
  function Report({ company, name, project, selected, manualProducts, other, surf, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    const projectFields = { Prosjektansvarlig: project.responsible, Prosjektnavn: project.projectName, Adresse: project.address, "Postnr.": project.postnr, "Poststed / by": project.city, Kunde: project.customer, "Kunde e-post": project.customerEmail, "Kunde telefon": project.customerPhone, Dato: project.date, Status: project.locked ? "Avsluttet / l\xE5st" : "Aktivt", Notater: project.notes };
    const cats = [...new Set(photos.map((p) => p.cat))];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "report", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reportTop", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: name }),
            company.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.address }),
            company.orgNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "Org.nr: ",
              company.orgNumber
            ] }),
            company.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.phone }),
            company.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.email }),
            company.website && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.website })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "FDV-rapport / Prosjektdokumentasjon" }),
        project.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontWeight: 800, letterSpacing: "0.04em" }, children: "\u2705 FERDIGSTILT / L\xC5ST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: Object.entries(projectFields).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: k }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: v || "Ikke fylt ut" })
        ] }, k)) })
      ] }),
      project.projectInfoIncludeInReport && hasValue(project.projectDescription) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon/beskrivelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektering" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall i dusjsone" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fallDusj || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall utenfor dusjsone / v\xE5tsone" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fallUtenfor || "Ikke oppgitt" })
          ] }),
          project.fall && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall mot sluk" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fall })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Slukplassering" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.sluk || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Terskelh\xF8yde" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.terskel || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Membran" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.membran || "Ikke oppgitt" })
          ] })
        ] }),
        (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.title || "Eget punkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.value || "Ikke oppgitt" })
        ] }, p.id || p.title)),
        project.prosjekteringKommentar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kommentar / avvik" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.prosjekteringKommentar })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Produkter / FDV" }),
        selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.item }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV" }),
          p.databladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.databladUrl, children: "\xC5pne datablad" }),
          p.dopUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.dopUrl, children: "\xC5pne DOP" }),
          p.epdUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.epdUrl, children: "\xC5pne EPD" }),
          p.sikkerhetsdatabladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.sikkerhetsdatabladUrl, children: "\xC5pne sikkerhetsdatablad" }),
          p.documentFileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.documentFileUrl, children: "\xC5pne vedlagt dokument" })
        ] }, p.item)),
        (manualProducts || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section || "Annet produkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.name || "Uten produktnavn" }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV" }),
          p.databladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.databladUrl, children: "\xC5pne datablad" }),
          p.dopUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.dopUrl, children: "\xC5pne DOP" }),
          p.epdUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.epdUrl, children: "\xC5pne EPD" }),
          p.sikkerhetsdatabladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.sikkerhetsdatabladUrl, children: "\xC5pne sikkerhetsdatablad" }),
          p.documentFileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.documentFileUrl, children: "\xC5pne vedlagt dokument" })
        ] }, p.id)),
        Object.entries(other).filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            "Tidligere registrert annet produkt under ",
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overflater" }),
        Object.entries(surf).filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bildedokumentasjon" }),
        cats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: cat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: photos.filter((p) => p.cat === cat).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
            p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
          ] }, p.id)) })
        ] }, cat))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fag, deler og utstyr" }),
        inst.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            i.category,
            ":"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            i.name,
            " ",
            i.qty && `\xB7 ${i.qty}`,
            " ",
            i.supplier && `\xB7 ${i.supplier}`,
            " ",
            i.desc && ` \u2014 ${i.desc}`
          ] }),
          i.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: i.fdvUrl, children: "\xC5pne FDV/datablad" })
        ] }, i.id))
      ] }),
      projectLog?.enabled && (projectLog.messages || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Chat" }),
        (projectLog.messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.by || "Ukjent" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.created ? new Date(m.created).toLocaleString("no-NO") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
          m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: m.imageUrl, alt: m.imageName || "Chat bilde" }),
            m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.imageName })
          ] }) })
        ] }, m.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistReportSection, { checklist }),
      tilbud?.enabled && (hasValue(tilbud.tillegg) || hasValue(tilbud.fradrag) || hasValue(tilbud.kommentar) || (tilbud.files || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tilbud / kontrakt" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
        ] }),
        (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
          (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: f.name }) }, f.id))
        ] })
      ] }),
      overtagelse?.enabled && (hasValue(overtagelse.dato) || hasValue(overtagelse.kommentar) || hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signKunde) || hasValue(overtagelse.signUtf\u00F8rendeImage) || hasValue(overtagelse.signKundeImage)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overtagelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dato", value: overtagelse.dato }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kommentar / merknader", value: overtagelse.kommentar }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur utf\xF8rende", name: overtagelse.signUtf\u00F8rende, image: overtagelse.signUtf\u00F8rendeImage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur kunde", name: overtagelse.signKunde, image: overtagelse.signKundeImage })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekklister og vedlegg" }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: f.name }, f.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjekttilgang" }),
        access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          a.name || a.email,
          " \u2014 ",
          a.role
        ] }, a.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "© 2026 Expo Proffsenter – Expo ProffDok" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Alle rettigheter forbeholdt." })
] })
    ] });
  }

  function normalizeExternalUrl(value) {
    if (value === void 0 || value === null) return "";
    const raw = String(value).trim();
    if (!raw) return "";
    if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
    if (raw.startsWith("//")) return "https:" + raw;
    if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(raw)) return "https://" + raw;
    return raw;
  }
  function PdfSafeLink({ href, children }) {
    const url = normalizeExternalUrl(href);
    if (!url) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "pdfSafeLink", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: url, target: "_blank", rel: "noopener noreferrer", children }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "pdfSafeUrl", style: { display: "block", color: "#334155", fontSize: "10px", lineHeight: 1.25, overflowWrap: "anywhere", wordBreak: "break-word", marginTop: "2px" }, children: url })
    ] });
  }

  function hasValue(value) {
    return value !== void 0 && value !== null && String(value).trim() !== "";
  }
  function InfoCard({ label, value }) {
    if (!hasValue(value)) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: value })
    ] });
  }
  function SignatureCard({ label, name, image }) {
    if (!hasValue(name) && !hasValue(image)) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: name }),
      image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: image, alt: label, style: { width: "100%", maxWidth: "360px", height: "120px", objectFit: "contain", background: "#fff", border: "1px solid #dbe7ec", borderRadius: "12px", marginTop: "8px" } })
    ] });
  }
  function SignaturePad({ label, value, onChange }) {
    const canvasRef = import_react.default.useRef(null);
    const drawingRef = import_react.default.useRef(false);
    const hasDrawnRef = import_react.default.useRef(false);
    import_react.default.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(180 * ratio));
      const ctx = canvas.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      if (value) {
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
          ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
        };
        img.src = value;
        hasDrawnRef.current = true;
      } else {
        hasDrawnRef.current = false;
      }
    }, [value]);
    const getPoint = (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches?.[0] || event.changedTouches?.[0];
      const source = touch || event;
      return {
        x: source.clientX - rect.left,
        y: source.clientY - rect.top
      };
    };
    const start = (event) => {
      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const p = getPoint(event);
      drawingRef.current = true;
      hasDrawnRef.current = true;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = (event) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const p = getPoint(event);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const end = (event) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      drawingRef.current = false;
      const canvas = canvasRef.current;
      if (hasDrawnRef.current) onChange(canvas.toDataURL("image/png"));
    };
    const clear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, 180);
      hasDrawnRef.current = false;
      onChange("");
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "canvas",
        {
          ref: canvasRef,
          style: { width: "100%", height: "180px", background: "#fff", border: "1px solid #c7d6dd", borderRadius: "14px", touchAction: "none", display: "block", marginTop: "10px" },
          onMouseDown: start,
          onMouseMove: move,
          onMouseUp: end,
          onMouseLeave: end,
          onTouchStart: start,
          onTouchMove: move,
          onTouchEnd: end
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: clear, children: "T\xF8m signatur" }) })
    ] });
  }
  function CustomerReport({ company, name, project, selected, manualProducts, other, surf, photos, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    const projectFields = [
      ["Prosjektansvarlig", project.responsible],
      ["Prosjektnavn", project.projectName],
      ["Adresse", project.address],
      ["Postnr.", project.postnr],
      ["Poststed / by", project.city],
      ["Kunde", project.customer],
      ["Kunde e-post", project.customerEmail],
      ["Kunde telefon", project.customerPhone],
      ["Dato", project.date],
      ["Status", project.locked ? "Avsluttet / l\xE5st" : "Aktivt"],
      ["Notater", project.notes]
    ];
    const prosjektering = [
      ["Fall i dusjsone", project.fallDusj],
      ["Fall utenfor dusjsone / v\xE5tsone", project.fallUtenfor],
      ...hasValue(project.fall) ? [["Fall mot sluk", project.fall]] : [],
      ["Slukplassering", project.sluk],
      ["Terskelh\xF8yde", project.terskel],
      ["Membranl\xF8sning", project.membran],
      ...(Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => [p.title || "Eget punkt", p.value]),
      ["Kommentar / avvik", project.prosjekteringKommentar]
    ];
    const surfaceRows = Object.entries(surf || {}).filter(([, v]) => hasValue(v));
    const otherRows = Object.entries(other || {}).filter(([, v]) => hasValue(v));
    const photoCats = [...new Set((photos || []).map((p) => p.cat).filter(Boolean))];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "report", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reportTop", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: project.projectName || "FDV-rapport / Prosjektdokumentasjon" }),
            project.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.address }),
            project.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde:" }),
              " ",
              project.customer
            ] }),
            company.companyName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utf\xF8rende:" }),
              " ",
              company.companyName
            ] }),
            company.orgNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "Org.nr: ",
              company.orgNumber
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon" }),
        project.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontWeight: 800, letterSpacing: "0.04em" }, children: "\u2705 FERDIGSTILT / L\xC5ST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: projectFields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) })
      ] }),
      project.projectInfoIncludeInReport && hasValue(project.projectDescription) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon/beskrivelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }),
      prosjektering.some(([, v]) => hasValue(v)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektering" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: prosjektering.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) })
      ] }),
      (selected.length > 0 || (manualProducts || []).length > 0 || otherRows.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Produkter / FDV" }),
        selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.item }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV/datablad" })
        ] }, p.item)),
        (manualProducts || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section || "Annet produkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.name || "Uten produktnavn" }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV/datablad" })
        ] }, p.id)),
        otherRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            "Tidligere registrert annet produkt under ",
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      surfaceRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overflater" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaceRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: k, value: v }, k)) })
      ] }),
      (photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bildedokumentasjon" }),
        photoCats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: cat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: photos.filter((p) => p.cat === cat).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.cat || "Dokumentasjonsbilde" }),
            p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
          ] }, p.id)) })
        ] }, cat))
      ] }),
      (inst || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fag, deler og utstyr" }),
        inst.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: i.category || "Post" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: [i.name, i.qty, i.supplier, i.desc].filter(Boolean).join(" \xB7 ") }),
          i.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: i.fdvUrl, children: "\xC5pne FDV/datablad" }),
          (i.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: i.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || "Bilde" }) }, p.id)) })
        ] }, i.id))
      ] }),
      (hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { id: "kunde-tilbud", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tilbud / kontrakt" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
        ] }),
        (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
          (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: f.name }) }, f.id))
        ] })
      ] }),
      overtagelse?.enabled && (hasValue(overtagelse.dato) || hasValue(overtagelse.kommentar) || hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signKunde) || hasValue(overtagelse.signUtf\u00F8rendeImage) || hasValue(overtagelse.signKundeImage)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overtagelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dato", value: overtagelse.dato }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kommentar / merknader", value: overtagelse.kommentar }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur utf\xF8rende", name: overtagelse.signUtf\u00F8rende, image: overtagelse.signUtf\u00F8rendeImage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur kunde", name: overtagelse.signKunde, image: overtagelse.signKundeImage })
        ] })
      ] }),
      projectLog?.enabled && (projectLog.messages || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Chat" }),
        (projectLog.messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.by || "Ukjent" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.created ? new Date(m.created).toLocaleString("no-NO") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
          m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: m.imageUrl, alt: m.imageName || "Chat bilde" }),
            m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.imageName })
          ] }) })
        ] }, m.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistReportSection, { checklist }),
      (files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekklister og vedlegg" }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: f.name }, f.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", { children: "Levert av Expo Proffsenter" })
    ] });
  }
  (0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));
