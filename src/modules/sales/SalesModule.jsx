// FASE 20M LÅST AKSEPTBEVIS: Oppretter PDF fra akseptert, publisert tilbudsversjon og lagrer dokumentet varig på saken og i aktivert prosjekt. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20J TYDELIG LEVERANSEOMFANG: Egne, versjonslåste felt for inkludert, ikke inkludert og kundens leveranse vises i kundetilbud og omfattes av digital aksept. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20I EGEN KONTRAKT: Håndverksbedriften kan laste opp egen kontrakt etter kundeaksept. Kontrakten lagres med saken og følger automatisk til Tilbud/kontrakt ved prosjektaktivering. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20F GJENOPPRETT TILBUD FØR AUTOLAGRING: Ved retur fra en annen hovedfane gjenopprettes tilbudsskjemaet fra kladd/sak før autolagring tillates, slik at en tom initialform aldri kan overskrive poster og priser. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20E VARIG TILBUDSKLADD: Mellomlagrer tilbudet både lokalt og fortløpende i eksisterende sales_requests, slik at poster og priser tåler fanebytte, sidegjenlasting og nettleserens lagringsbegrensning. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20D STABIL TILBUDSKLADD VED HOVEDFANEBYTTE: Bruker stabil kladdnøkkel per bruker/sak, finner kladder fra FASE 20C og lagrer siste skjema synkront ved avmontering. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20C TRYGG TILBUDSKLADD OG TYDELIG BEFARING: Mellomlagrer tilbud fortløpende per sak, gjenoppretter kladden etter fanebytte, tydeliggjør ufullført befaringsnotat og legger kunden som deltaker i Outlook-utkast. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20B ANSVARLIG GJENNOM HELE LØPET: Setter innlogget bruker som ansvarlig ved ny forespørsel, beholder ansvarlig gjennom befaring/tilbud og overfører samme navn til aktivert prosjekt. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20A PROSJEKTAKTIVERING: Verifiserer at lagret prosjekt-ID faktisk finnes. En feilaktig Aktivert-sak uten prosjekt repareres tilbake til Akseptert og kan aktiveres trygt på nytt. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 19.15G REELL PROSJEKTAKTIVERING: Oppretter ordinært ProffDok-prosjekt fra akseptert tilbud, overfører kunde/sak/tilbud/befaringsbilder, sperrer duplikater og åpner prosjektet direkte. Ingen SQL eller main-endring.
// FASE 19.15F AKSEPTSTATUS: Synkroniserer digital kundeaksept via eksisterende offentlig tilbuds-RPC og sakens publicToken. Ingen SQL/main/Edge-endring.
// FASE 19.15C KUNDELINK: Beholder publicOffer-token og Vercels delingsparametere i URL-en.
// FASE 19.15B BILDEVISNING I BEFARINGSOPPSUMMERING: Viser lagrede befaringsbilder som klikkbare miniatyrbilder med stor visning. Ingen SQL/lagrings/main/Edge-endring.
// FASE 19.15 VARIG BEFARINGSLAGRING: Forespørsler, befaringsplan og notater lagres firmascopet i Supabase. Befaringsbilder komprimeres og lagres privat i Storage. Ingen lyd eller AI.
// FASE 19.1 PREMIUM DIGITALT KUNDETILBUD: Polerer offentlig kundevisning med tydeligere hero, metadata, prislinjer, opsjonskort og akseptfelt. Kun SalesModule/sales.css i feature/befaring-tilbud. Ingen SQL/main/Edge Function.
// FASE 19.3 TYDELIG PUBLISERINGSBEKREFTELSE: Viser tydelig intern bekreftelse når kundelink/ny tilbudsversjon er publisert. Ingen SQL/main/Edge.
// FASE 19.2 TRYGG REPUBLISERING: Tydeliggjør når redigert tilbud/opsjon må publiseres som ny kundelenke-versjon. Ingen SQL/main/Edge.
// FASE 19.4B TILGANG BEFARINGSNOTAT FRA TILBUD: Viser trygg knapp for befaringsnotat også i tilbudssak uten å endre tilbudsstatus ved lagring. Ingen SQL/main/CSS/Edge.
// FASE 19.4D BEVAR BEFARINGSINFO: Viser forespørselsnotat/befaringsplan som kontekst i befaringsnotat og bruker trygge fallback-felt ved åpning fra tilbudssak. Ingen SQL/main/CSS/Edge.
// FASE 19.5 UX-FORENKLING INTERN ARBEIDSFLYT: Tydeligere primær neste-handling i intern sak, uten database/SQL/Edge/main-endring. Bevarer tilbudsversjoner, kundelink og befaringsnotat.
// FASE 19.15A SIKKER FLERFIRMALAGRING: Henter stabil firma-ID via databasefunksjon og medlemskap, uten avhengighet til profiles.company_id. Ingen main/Edge/AI/lyd.
// FASE 18.19C3 HOTFIX FIRMAPROFIL EMAIL-FALLBACK: Henter firmaprofil robust via auth-id først og innlogget e-post som fallback før publish-snapshot. Ingen SQL/main/CSS.
// FASE 18.19C2 HOTFIX FIRMAPROFILSNAPSHOT: Bruker samme profiles-felt som hovedappen, venter på auth/session og legger firmasnapshot inn i faktisk publish-payload. Ingen SQL/main/CSS.
// FASE 18.19C1 HOTFIX PREMIUM KUNDETILBUD/FIRMA: Henter innlogget brukers eksisterende firmaprofil og publiserer et låst firmasnapshot i tilbudsversjonen via eksisterende lines-json. Ingen SQL/main/Edge Function.
// FASE 18.19B TILBUDSLINJE ENTER/TOMLINJE HOTFIX: Enter i prisfelt oppretter/fokuserer neste linje, og tom siste linje ignoreres trygt ved lagring. Ingen SQL/main/prosjektaktivering.
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Home,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Ruler,
  Save,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./sales.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const STORAGE_KEY = "expo-proffdok-sales-preview-requests-v1";
const INSPECTION_BUCKET = "sales-inspection-photos";

function stripTransientPhotoData(request = {}) {
  return {
    ...request,
    inspectionPhotos: (request.inspectionPhotos || []).map(
      ({ dataUrl, previewUrl, ...photo }) => photo
    ),
  };
}

function sanitizeStoragePart(value = "") {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "fil";
}

function dataUrlToBlob(dataUrl) {
  const [header, encoded] = String(dataUrl).split(",");
  const mimeType = header?.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const bytes = atob(encoded || "");
  const buffer = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    buffer[index] = bytes.charCodeAt(index);
  }
  return new Blob([buffer], { type: mimeType });
}

async function compressImageDataUrl(dataUrl, maxDimension = 1920, quality = 0.78) {
  const image = new Image();
  image.src = dataUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

function loadSalesNavigation(storageKey) {
  try {
    const storedNavigation = window.localStorage.getItem(
      `${storageKey}:navigation`
    );
    const parsedNavigation = storedNavigation
      ? JSON.parse(storedNavigation)
      : null;

    if (!parsedNavigation?.selectedRequestId) {
      return { mode: "list", selectedRequestId: null };
    }

    return {
      mode: parsedNavigation.mode || "detail",
      selectedRequestId: parsedNavigation.selectedRequestId,
    };
  } catch {
    return { mode: "list", selectedRequestId: null };
  }
}

function saveSalesNavigation(storageKey, mode, selectedRequestId) {
  try {
    window.localStorage.setItem(
      `${storageKey}:navigation`,
      JSON.stringify({ mode, selectedRequestId })
    );
  } catch {
    // Navigasjon er kun et lokalt hjelpemiddel i feature-previewen.
  }
}

const initialRequests = [
  {
    id: "F-2026-0041",
    title: "Modernisering av bad",
    customer: "Ola Nordmann",
    phone: "900 00 000",
    email: "ola@example.no",
    address: "Kirkeveien 12",
    source: "Telefon",
    note: "Kunden ønsker modernisering av eksisterende bad. Sluk og fall må vurderes på befaring.",
    status: "Forespørsel",
    statusClass: "sales-status-new",
    nextStep: "Planlegg befaring",
    iconName: "clipboard",
  },
  {
    id: "F-2026-0040",
    title: "Flislegging entré og vaskerom",
    customer: "Anne Hansen",
    phone: "911 11 111",
    email: "anne@example.no",
    address: "Solfaret 8",
    source: "E-post",
    note: "Ønsker pris på flislegging i entré og vaskerom. Underlag må kontrolleres.",
    status: "Befaring",
    statusClass: "sales-status-survey",
    nextStep: "Fullfør befaringsnotat",
    iconName: "ruler",
  },
  {
    id: "F-2026-0039",
    title: "Membran og flisarbeider",
    customer: "Sameiet Parkveien 4",
    phone: "922 22 222",
    email: "styret@example.no",
    address: "Parkveien 4",
    source: "Eksisterende kunde",
    note: "Sameiet ønsker tilbud på membran og flisarbeider i felles våtrom.",
    status: "Tilbud",
    statusClass: "sales-status-quote",
    nextStep: "Send tilbud til kunde",
    iconName: "send",
  },
  {
    id: "F-2026-0038",
    title: "Oppgradering av dusjsone",
    customer: "Marius Berg",
    phone: "933 33 333",
    email: "marius@example.no",
    address: "Lindeveien 22",
    source: "Nettside",
    note: "Kunden ønsker ny dusjsone og vurdering av membran i eksisterende bad.",
    status: "Akseptert",
    statusClass: "sales-status-accepted",
    nextStep: "Aktiver som prosjekt",
    iconName: "home",
  },
];

const workTypes = [
  "Modernisering av bad",
  "Nybygg bad",
  "Flislegging",
  "Membranarbeider",
  "Avretting / støp",
  "Murarbeider",
  "Servicearbeid",
  "Annet",
];

const requestSources = [
  "Telefon",
  "E-post",
  "Nettside",
  "Butikk / showroom",
  "Eksisterende kunde",
  "Anbefaling",
  "Annet",
];

const iconMap = {
  clipboard: ClipboardList,
  ruler: Ruler,
  send: Send,
  home: Home,
};

const emptyForm = {
  customer: "",
  phone: "",
  email: "",
  address: "",
  title: "Modernisering av bad",
  source: "Telefon",
  note: "",
};

function loadRequests(storageKey = STORAGE_KEY) {
  try {
    const storedRequests = window.localStorage.getItem(storageKey);

    if (!storedRequests) return initialRequests;

    const parsedRequests = JSON.parse(storedRequests);

    if (!Array.isArray(parsedRequests)) return initialRequests;

    return parsedRequests;
  } catch {
    return initialRequests;
  }
}

function saveRequests(requests, storageKey = STORAGE_KEY) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(requests));
  } catch {
    // Lokal preview-lagring er kun for test.
  }
}

function createRequestId(requests) {
  const highestNumber = requests.reduce((highest, request) => {
    const match = request.id?.match(/F-2026-(\d+)/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 41);

  return `F-2026-${String(highestNumber + 1).padStart(4, "0")}`;
}

function normalizeCompanyProfile(row = {}, fallbackEmail = "") {
  return {
    companyName: row.company_name || "",
    orgNumber: row.org_number || "",
    address: row.address || "",
    phone: row.phone || "",
    email: row.email || fallbackEmail || "",
    website: row.website || "",
    logoUrl: row.logo_url || "",
  };
}

function hasCompanyProfile(profile = {}) {
  return Boolean(
    profile.companyName ||
      profile.orgNumber ||
      profile.address ||
      profile.phone ||
      profile.email ||
      profile.website ||
      profile.logoUrl
  );
}

function createCompanySnapshot(profile = {}) {
  return {
    id: "__expo_company_snapshot__",
    __companyMeta: true,
    companyName: profile.companyName || "",
    orgNumber: profile.orgNumber || "",
    address: profile.address || "",
    phone: profile.phone || "",
    email: profile.email || "",
    website: profile.website || "",
    logoUrl: profile.logoUrl || "",
  };
}

function createOfferTermsSnapshot(request = {}) {
  return {
    id: "__expo_offer_terms_snapshot__",
    __offerTermsMeta: true,
    terms: request.offerTerms || "",
    paymentTerms: request.offerPaymentTerms || "",
    included: request.offerIncluded || "",
    excluded: request.offerExcluded || "",
    customerSupplied: request.offerCustomerSupplied || "",
  };
}

function getOfferTermsSnapshot(lines = []) {
  return Array.isArray(lines)
    ? lines.find((line) => line?.__offerTermsMeta) || {}
    : {};
}

function getVisibleOfferLines(lines = []) {
  return Array.isArray(lines)
    ? lines.filter((line) => !line?.__companyMeta && !line?.__offerTermsMeta)
    : [];
}

function getInspectionContext(request = {}) {
  return {
    customerWishes:
      request.inspectionCustomerWishes ||
      request.customerWishes ||
      "",
    existingConditions:
      request.inspectionExistingConditions ||
      request.existingConditions ||
      "",
    measurements:
      request.inspectionMeasurements ||
      request.measurements ||
      "",
    observations:
      request.inspectionObservations ||
      request.observations ||
      request.inspectionNote ||
      "",
    photos:
      request.inspectionPhotos ||
      request.photos ||
      [],
  };
}

function hasInspectionContext(request = {}) {
  const context = getInspectionContext(request);

  return Boolean(
    context.customerWishes ||
      context.existingConditions ||
      context.measurements ||
      context.observations ||
      context.photos?.length
  );
}

function buildInspectionIntro(request = {}) {
  const context = getInspectionContext(request);
  const parts = [];

  if (context.customerWishes) {
    parts.push(`Kundens ønsker: ${context.customerWishes}`);
  }
  if (context.existingConditions) {
    parts.push(`Eksisterende forhold: ${context.existingConditions}`);
  }
  if (context.measurements) {
    parts.push(`Målinger: ${context.measurements}`);
  }
  if (context.observations) {
    parts.push(`Faglige observasjoner: ${context.observations}`);
  }

  return parts.join("\n\n");
}

function getWorkflowSteps(request) {
  const activeStepByStatus = {
    Forespørsel: "Forespørsel",
    Befaring: "Befaring",
    Tilbud: "Tilbud",
    Akseptert: "Aksept",
    Aktivert: "Prosjekt",
  };

  const activeStep = activeStepByStatus[request.status] || "Forespørsel";
  const steps = ["Forespørsel", "Befaring", "Tilbud", "Aksept", "Prosjekt"];
  const activeIndex = steps.indexOf(activeStep);

  return steps.map((step, index) => ({
    label: step,
    state: index < activeIndex ? "done" : index === activeIndex ? "active" : "pending",
  }));
}

export default function SalesModule({
  supabaseClient = null,
  authUser = null,
  profile = null,
  currentUserName = "",
  integrationMode = "preview",
} = {}) {
  const activeSupabase = supabaseClient || supabase;
  const salesStorageKey = useMemo(() => {
    if (integrationMode !== "app") return STORAGE_KEY;

    const companyScope = String(profile?.company_name || profile?.companyName || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const userScope = String(authUser?.id || "anonymous");

    return `${STORAGE_KEY}:${companyScope || "uten-firma"}:${userScope}`;
  }, [integrationMode, profile?.company_name, profile?.companyName, authUser?.id]);
  const initialNavigation = useMemo(
    () => loadSalesNavigation(salesStorageKey),
    [salesStorageKey]
  );
  const [requests, setRequests] = useState(() => loadRequests(salesStorageKey));
  const [mode, setMode] = useState(initialNavigation.mode);
  const [selectedRequestId, setSelectedRequestId] = useState(
    initialNavigation.selectedRequestId
  );
  const [form, setForm] = useState(emptyForm);
  const [surveyForm, setSurveyForm] = useState({
    date: "",
    time: "",
    responsible: "",
    note: "",
  });
  const [inspectionForm, setInspectionForm] = useState({
    customerWishes: "",
    existingConditions: "",
    measurements: "",
    observations: "",
    photos: [],
  });
  const [inspectionDraftDirty, setInspectionDraftDirty] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: "",
    intro: "",
    lines: [
      {
        id: "line-1",
        description: "",
        amount: "",
        productUrl: "",
        imageDataUrl: "",
        imageName: "",
      },
    ],
    options: [],
    reservations: "",
    included: "",
    excluded: "",
    customerSupplied: "",
    terms: "",
    paymentTerms: "10 dager netto",
    validityDays: "30",
  });
  const offerFormRef = useRef(offerForm);
  const offerModeRef = useRef(mode);
  const offerRequestIdRef = useRef(selectedRequestId);
  const offerDraftSaveTimerRef = useRef(null);
  const offerFormHydratedRequestIdRef = useRef("");
  const latestRequestsRef = useRef(requests);
  offerFormRef.current = offerForm;
  offerModeRef.current = mode;
  offerRequestIdRef.current = selectedRequestId;
  latestRequestsRef.current = requests;
  const [acceptanceForm, setAcceptanceForm] = useState({
    name: "",
    confirmed: false,
    selectedOptionIds: [],
  });
  const [projectForm, setProjectForm] = useState({
    projectName: "",
    projectNumber: "",
    responsible: "",
    note: "",
  });
  const [projectActivationBusy, setProjectActivationBusy] = useState(false);
  const [contractUploadBusy, setContractUploadBusy] = useState(false);
  const [contractUploadError, setContractUploadError] = useState("");
  const [acceptanceProofBusy, setAcceptanceProofBusy] = useState(false);
  const [acceptanceProofError, setAcceptanceProofError] = useState("");
  const [customerLinkCopied, setCustomerLinkCopied] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState(null);
  const [publicOfferLoading, setPublicOfferLoading] = useState(false);
  const [publicOfferError, setPublicOfferError] = useState("");
  const [salesCompanyId, setSalesCompanyId] = useState(null);
  const [salesStorageError, setSalesStorageError] = useState("");
  const [offerDraftSaveStatus, setOfferDraftSaveStatus] = useState("idle");
  const [offerFormReady, setOfferFormReady] = useState(false);
  const [selectedInspectionPhoto, setSelectedInspectionPhoto] = useState(null);
  const [companyProfile, setCompanyProfile] = useState({
    companyName: "",
    orgNumber: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
  });

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const loggedInResponsible = String(
    currentUserName ||
      profile?.full_name ||
      profile?.fullName ||
      profile?.name ||
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      authUser?.email ||
      ""
  ).trim();

  function getStableOfferDraftKey(requestId = selectedRequestId) {
    const userScope = String(authUser?.id || authUser?.email || "innlogget-bruker")
      .trim()
      .toLowerCase();
    return `${STORAGE_KEY}:offer-draft:${userScope}:${requestId || "uten-sak"}`;
  }

  function saveOfferDraft(formValue = offerForm, requestId = selectedRequestId) {
    if (!requestId) return;
    window.localStorage.setItem(
      getStableOfferDraftKey(requestId),
      JSON.stringify({ form: formValue, savedAt: new Date().toISOString() })
    );
  }

  function mergeOfferDraftIntoRequests(
    currentRequests,
    formValue = offerForm,
    requestId = selectedRequestId
  ) {
    if (!requestId) return currentRequests;

    return currentRequests.map((request) =>
      request.id === requestId
        ? {
            ...request,
            offerTitle: formValue.title,
            offerIntro: formValue.intro,
            offerLines: formValue.lines,
            offerOptions: formValue.options,
            offerReservations: formValue.reservations,
            offerIncluded: formValue.included,
            offerExcluded: formValue.excluded,
            offerCustomerSupplied: formValue.customerSupplied,
            offerTerms: formValue.terms,
            offerPaymentTerms: formValue.paymentTerms,
            offerValidityDays: formValue.validityDays,
            offerTotal: getOfferTotal(formValue.lines),
            offerDraftSavedAt: new Date().toISOString(),
          }
        : request
    );
  }

  function loadOfferDraft(requestId) {
    if (!requestId) return null;

    const candidateKeys = [
      getStableOfferDraftKey(requestId),
      `${salesStorageKey}:offer-draft:${requestId}`,
    ];
    const legacySuffix = `:offer-draft:${requestId}`;

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(STORAGE_KEY) && key.endsWith(legacySuffix)) {
        candidateKeys.push(key);
      }
    }

    return candidateKeys.reduce((latest, key) => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(key) || "null");
        if (!parsed?.form) return latest;
        const savedAt = Date.parse(parsed.savedAt || "") || 0;
        return !latest || savedAt >= latest.savedAt
          ? { form: parsed.form, savedAt }
          : latest;
      } catch {
        return latest;
      }
    }, null)?.form || null;
  }

  function buildOfferFormFromRequest(request) {
    return {
      title: request?.offerTitle || `Tilbud – ${request?.title || ""}`,
      intro:
        request?.offerIntro ||
        `Vi viser til befaring og tilbyr med dette følgende arbeider for ${request?.customer || "kunden"}.`,
      lines:
        request?.offerLines?.length
          ? request.offerLines
          : [
              {
                id: `line-${Date.now()}`,
                description: "",
                amount: "",
                productUrl: "",
                imageDataUrl: "",
                imageName: "",
              },
            ],
      options: request?.offerOptions?.length ? request.offerOptions : [],
      reservations: request?.offerReservations || "",
      included: request?.offerIncluded || "",
      excluded: request?.offerExcluded || "",
      customerSupplied: request?.offerCustomerSupplied || "",
      terms: request?.offerTerms || "",
      paymentTerms: request?.offerPaymentTerms || "10 dager netto",
      validityDays: request?.offerValidityDays || "30",
    };
  }

  function normalizeStoredOfferDraft(storedDraft, request) {
    const requestForm = buildOfferFormFromRequest(request);
    if (!storedDraft) return requestForm;

    return {
      ...requestForm,
      ...storedDraft,
      lines: Array.isArray(storedDraft.lines) ? storedDraft.lines : requestForm.lines,
      options: Array.isArray(storedDraft.options)
        ? storedDraft.options
        : requestForm.options,
      terms: storedDraft.terms ?? requestForm.terms,
      included: storedDraft.included ?? requestForm.included,
      excluded: storedDraft.excluded ?? requestForm.excluded,
      customerSupplied:
        storedDraft.customerSupplied ?? requestForm.customerSupplied,
      paymentTerms:
        storedDraft.paymentTerms ?? requestForm.paymentTerms,
    };
  }

  useEffect(() => {
    if (mode !== "offer-builder" || !selectedRequestId || !selectedRequest) {
      return;
    }

    if (offerFormHydratedRequestIdRef.current === selectedRequestId) {
      return;
    }

    let storedDraft = null;
    try {
      storedDraft = loadOfferDraft(selectedRequestId);
    } catch {
      storedDraft = null;
    }

    offerFormHydratedRequestIdRef.current = selectedRequestId;
    setOfferForm(normalizeStoredOfferDraft(storedDraft, selectedRequest));
    setOfferDraftSaveStatus("idle");
    setOfferFormReady(true);
    // Gjenoppretting må skje før autolagring får starte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedRequest, selectedRequestId]);

  useEffect(() => {
    if (!selectedInspectionPhoto) return undefined;

    function closePhotoOnEscape(event) {
      if (event.key === "Escape") setSelectedInspectionPhoto(null);
    }

    window.addEventListener("keydown", closePhotoOnEscape);
    return () => window.removeEventListener("keydown", closePhotoOnEscape);
  }, [selectedInspectionPhoto]);

  useEffect(() => {
    if (mode !== "offer-builder" || !selectedRequestId || !offerFormReady) return;

    try {
      saveOfferDraft(offerForm, selectedRequestId);
    } catch (error) {
      console.warn("Kunne ikke mellomlagre tilbudskladden lokalt", error);
    }

    const nextRequests = mergeOfferDraftIntoRequests(
      latestRequestsRef.current,
      offerForm,
      selectedRequestId
    );
    latestRequestsRef.current = nextRequests;
    setRequests(nextRequests);
    saveRequests(nextRequests, salesStorageKey);

    if (offerDraftSaveTimerRef.current) {
      window.clearTimeout(offerDraftSaveTimerRef.current);
    }

    offerDraftSaveTimerRef.current = window.setTimeout(() => {
      setOfferDraftSaveStatus("saving");
      void persistRequests(nextRequests)
        .then(() => {
          setOfferDraftSaveStatus("saved");
          setSalesStorageError("");
        })
        .catch((error) => {
          console.error("Kunne ikke mellomlagre tilbudskladden varig", error);
          setOfferDraftSaveStatus("error");
          setSalesStorageError(
            "Tilbudskladden kunne ikke mellomlagres varig. Ikke forlat tilbudet før nettet virker igjen."
          );
        });
    }, 500);

    return () => {
      if (offerDraftSaveTimerRef.current) {
        window.clearTimeout(offerDraftSaveTimerRef.current);
        offerDraftSaveTimerRef.current = null;
      }
    };
  }, [mode, offerForm, offerFormReady, salesStorageKey, selectedRequestId]);

  useEffect(() => {
    return () => {
      if (offerModeRef.current !== "offer-builder" || !offerRequestIdRef.current) return;
      try {
        saveOfferDraft(offerFormRef.current, offerRequestIdRef.current);
      } catch (error) {
        console.warn("Kunne ikke lagre siste tilbudskladd ved fanebytte", error);
      }

      const nextRequests = mergeOfferDraftIntoRequests(
        latestRequestsRef.current,
        offerFormRef.current,
        offerRequestIdRef.current
      );
      saveRequests(nextRequests, salesStorageKey);
      void persistRequests(nextRequests).catch((error) =>
        console.error("Kunne ikke lagre siste tilbudskladd varig", error)
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPersistentRequests() {
      if (!activeSupabase || integrationMode !== "app") return;

      const { data: sessionData } = await activeSupabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user?.id || cancelled) return;

      const { data: resolvedCompanyId, error: companyError } = await activeSupabase
        .rpc("resolve_sales_company_scope");

      if (companyError || !resolvedCompanyId) {
        if (!cancelled) {
          setSalesCompanyId(null);
          setSalesStorageError(
            companyError?.message ||
              "Firmatilknytningen kunne ikke bekreftes. Kontakt firmaadministrator."
          );
        }
        return;
      }
      if (cancelled) return;
      setSalesStorageError("");
      setSalesCompanyId(resolvedCompanyId);

      const { data: rows, error } = await activeSupabase
        .from("sales_requests")
        .select("request_ref,payload,status,archived_at")
        .eq("company_id", resolvedCompanyId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Kunne ikke hente salgssaker", error);
        return;
      }

      const claimedActivatedProjectIds = (rows || [])
        .map((row) => row?.payload)
        .filter((request) => request?.status === "Aktivert" && request?.projectId)
        .map((request) => request.projectId);
      let activatedProjectVerificationAvailable = claimedActivatedProjectIds.length === 0;
      let realActivatedProjectIds = new Set();
      const repairedActivatedRequestRefs = new Set();
      if (claimedActivatedProjectIds.length > 0) {
        const { data: realProjects, error: realProjectsError } = await activeSupabase
          .from("projects")
          .select("id")
          .in("id", claimedActivatedProjectIds);
        if (realProjectsError) {
          console.error("Kunne ikke verifisere aktiverte ProffDok-prosjekter", realProjectsError);
        } else {
          activatedProjectVerificationAvailable = true;
          realActivatedProjectIds = new Set((realProjects || []).map((project) => project.id));
        }
      }

      const hydrated = await Promise.all(
        (rows || []).map(async (row) => {
          let request = { ...(row.payload || {}), id: row.request_ref };
          const photos = await Promise.all(
            (request.inspectionPhotos || []).map(async (photo) => {
              if (!photo.path) return photo;
              const { data } = await activeSupabase.storage
                .from(INSPECTION_BUCKET)
                .createSignedUrl(photo.path, 60 * 60 * 24 * 7);
              return { ...photo, dataUrl: data?.signedUrl || "" };
            })
          );
          let acceptedOffer = null;
          let acceptedVersion = null;

          const claimsActivatedProject =
            request.status === "Aktivert" && Boolean(request.projectId);
          const hasRealActivatedProject =
            claimsActivatedProject &&
            (!activatedProjectVerificationAvailable || realActivatedProjectIds.has(request.projectId));

          if (claimsActivatedProject && activatedProjectVerificationAvailable && !hasRealActivatedProject) {
            repairedActivatedRequestRefs.add(row.request_ref);
            request = {
              ...request,
              projectId: "",
              projectActivatedAt: "",
              status: "Akseptert",
              statusClass: "sales-status-accepted",
              nextStep: "Aktiver som prosjekt",
              iconName: "check",
            };
          }

          if (request.publicToken && !hasRealActivatedProject) {
            const { data: publicOfferData, error: publicOfferError } =
              await activeSupabase.rpc("get_sales_offer_by_token", {
                token: request.publicToken,
              });

            if (publicOfferError) {
              console.error(
                `Kunne ikke kontrollere tilbudsstatus for sak ${row.request_ref}`,
                publicOfferError
              );
            } else if (publicOfferData?.offer?.status === "accepted") {
              acceptedOffer = publicOfferData.offer;
              acceptedVersion = publicOfferData.version || null;
            }
          }

          if (!acceptedOffer || hasRealActivatedProject) {
            return { ...request, inspectionPhotos: photos };
          }

          const acceptedPayload = acceptedOffer.accepted_payload || {};
          const acceptedOptions = Array.isArray(acceptedPayload.selected_options)
            ? acceptedPayload.selected_options
            : Array.isArray(acceptedPayload.selectedOptions)
              ? acceptedPayload.selectedOptions
              : [];
          const acceptedOfferLines = getVisibleOfferLines(
            acceptedVersion?.lines || request.offerLines || []
          );
          const acceptedTermsSnapshot = getOfferTermsSnapshot(
            acceptedVersion?.lines || []
          );
          const acceptedTotal =
            Number(
              acceptedPayload.accepted_total ??
                acceptedPayload.acceptedTotal ??
                acceptedPayload.total_ex_vat ??
                acceptedPayload.totalExVat
            ) ||
            Number(acceptedVersion?.total_ex_vat || 0) +
              getOfferTotal(acceptedOptions);

          return {
            ...request,
            inspectionPhotos: photos,
            status: "Akseptert",
            statusClass: "sales-status-accepted",
            nextStep: "Aktiver som prosjekt",
            iconName: "home",
            acceptedBy:
              acceptedOffer.accepted_by ||
              acceptedPayload.accepted_name ||
              acceptedPayload.acceptedName ||
              "Kunde",
            acceptedAt:
              acceptedOffer.accepted_at ||
              acceptedPayload.accepted_at ||
              acceptedPayload.acceptedAt ||
              null,
            acceptedOfferVersionId:
              acceptedVersion?.id ||
              acceptedOffer.active_version_id ||
              request.sentOfferVersionId ||
              null,
            acceptedOfferVersionNumber:
              acceptedVersion?.version_number ||
              request.sentOfferVersionNumber ||
              null,
            acceptedOfferLines,
            acceptedOptionIds: acceptedOptions
              .map((option) => option?.id)
              .filter(Boolean),
            acceptedOptions,
            acceptedTotal,
            acceptedPayload,
            acceptedOfferTitle: acceptedVersion?.title || request.offerTitle || request.title || "Tilbud",
            acceptedOfferIntro: acceptedVersion?.intro || request.offerIntro || "",
            acceptedOfferReservations: acceptedVersion?.reservations || request.offerReservations || "",
            acceptedOfferIncluded: acceptedTermsSnapshot.included || request.offerIncluded || "",
            acceptedOfferExcluded: acceptedTermsSnapshot.excluded || request.offerExcluded || "",
            acceptedOfferCustomerSupplied: acceptedTermsSnapshot.customerSupplied || request.offerCustomerSupplied || "",
            acceptedOfferTerms: acceptedTermsSnapshot.terms || request.offerTerms || "",
            acceptedOfferPaymentTerms: acceptedTermsSnapshot.paymentTerms || request.offerPaymentTerms || "",
          };
        })
      );

      if (cancelled) return;
      setRequests(hydrated);
      saveRequests(hydrated, salesStorageKey);
      if (repairedActivatedRequestRefs.size > 0) {
        const repairedRows = hydrated
          .filter((request) => repairedActivatedRequestRefs.has(request.id))
          .map((request) => ({
            company_id: resolvedCompanyId,
            request_ref: request.id,
            status: request.status || "Akseptert",
            archived_at: request.archivedAt || null,
            payload: stripTransientPhotoData(request),
            updated_at: new Date().toISOString(),
          }));
        const { error: repairError } = await activeSupabase
          .from("sales_requests")
          .upsert(repairedRows, { onConflict: "company_id,request_ref" });
        if (repairError) {
          console.error("Kunne ikke lagre reparert prosjektaktivering", repairError);
          setSalesStorageError(
            "Saken ble reparert i visningen, men statusen kunne ikke lagres. Last siden på nytt og prøv igjen."
          );
        }
      }
    }

    loadPersistentRequests();
    return () => {
      cancelled = true;
    };
  }, [activeSupabase, integrationMode, salesStorageKey]);

  async function persistRequests(nextRequests) {
    saveRequests(nextRequests, salesStorageKey);
    if (integrationMode !== "app") return;
    if (!activeSupabase || !salesCompanyId) {
      throw new Error(
        salesStorageError ||
          "Varig lagring er ikke klar. Kontroller firmatilknytningen og prøv igjen."
      );
    }

    const { data: sessionData } = await activeSupabase.auth.getSession();
    if (!sessionData?.session?.user?.id) {
      throw new Error("Innloggingen er utløpt. Logg inn på nytt.");
    }

    const rows = nextRequests.map((request) => ({
      company_id: salesCompanyId,
      request_ref: request.id,
      status: request.status || "Forespørsel",
      archived_at: request.archivedAt || null,
      payload: stripTransientPhotoData(request),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await activeSupabase
      .from("sales_requests")
      .upsert(rows, { onConflict: "company_id,request_ref" });
    if (error) throw error;
  }

  useEffect(() => {
    if (selectedRequestId && !selectedRequest) {
      setMode("list");
      setSelectedRequestId(null);
      return;
    }

    saveSalesNavigation(salesStorageKey, mode, selectedRequestId);
  }, [mode, salesStorageKey, selectedRequest, selectedRequestId]);

  useEffect(() => {
    if (mode !== "inspection-note" || !selectedRequestId) return;
    saveInspectionDraft(inspectionForm);
    // Lokal feature-kladd skal følge alle endringer i befaringsskjemaet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectionForm, mode, selectedRequestId]);

  async function fetchCompanyProfile() {
    if (!activeSupabase) return null;

    const { data: sessionData } = await activeSupabase.auth.getSession();
    let user = sessionData?.session?.user || null;

    if (!user) {
      const { data: userData } = await activeSupabase.auth.getUser();
      user = userData?.user || null;
    }

    if (!user?.id) return null;

    const profileSelect =
      "company_name,org_number,address,phone,email,website,logo_url";

    let { data, error } = await activeSupabase
      .from("profiles")
      .select(profileSelect)
      .eq("id", user.id)
      .maybeSingle();

    if (error) return null;

    let nextProfile = data ? normalizeCompanyProfile(data, user.email || "") : null;

    if (!hasCompanyProfile(nextProfile) && user.email) {
      const fallback = await activeSupabase
        .from("profiles")
        .select(profileSelect)
        .ilike("email", user.email)
        .maybeSingle();

      if (!fallback.error && fallback.data) {
        nextProfile = normalizeCompanyProfile(fallback.data, user.email || "");
      }
    }

    return hasCompanyProfile(nextProfile) ? nextProfile : null;
  }

  async function refreshCompanyProfile() {
    const nextProfile = await fetchCompanyProfile();

    if (!nextProfile) return null;

    setCompanyProfile(nextProfile);
    return nextProfile;
  }

  async function getCompanyProfileForPublish() {
    if (hasCompanyProfile(companyProfile)) return companyProfile;

    const freshProfile = await refreshCompanyProfile();

    return freshProfile || companyProfile;
  }

  useEffect(() => {
    let active = true;

    async function loadInitialCompanyProfile() {
      const nextProfile = await fetchCompanyProfile();
      if (active && nextProfile) setCompanyProfile(nextProfile);
    }

    loadInitialCompanyProfile();

    const { data: subscription } = activeSupabase?.auth?.onAuthStateChange?.(
      (_event, session) => {
        if (!session?.user?.id) return;
        loadInitialCompanyProfile();
      }
    ) || { data: null };

    return () => {
      active = false;
      subscription?.subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const publicOfferToken = params.get("publicOffer");

    if (!publicOfferToken) return;

    loadPublicOfferFromToken(publicOfferToken);
    // Behold tokenet i adressefeltet. Da kan den åpne kundesiden kopieres
    // videre uten at mottakeren faller tilbake til appens hovedmeny.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(
    () => [
      {
        label: "Forespørsler",
        value: requests.filter((request) => request.status === "Forespørsel")
          .length,
      },
      {
        label: "Befaring",
        value: requests.filter((request) => request.status === "Befaring").length,
      },
      {
        label: "Tilbud",
        value: requests.filter((request) => request.status === "Tilbud").length,
      },
      {
        label: "Aksept",
        value: requests.filter((request) => request.status === "Akseptert").length,
      },
    ],
    [requests]
  );

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function goToList() {
    setMode("list");
    setSelectedRequestId(null);
  }

  function openProjectActivation() {
    if (!selectedRequest?.acceptanceProofFile?.url) {
      setAcceptanceProofError(
        "Opprett det låste akseptbeviset før saken aktiveres som prosjekt."
      );
      return;
    }
    setProjectForm({
      projectName:
        selectedRequest?.projectName ||
        selectedRequest?.title ||
        "Nytt ProffDok-prosjekt",
      projectNumber: selectedRequest?.projectNumber || "",
      responsible:
        selectedRequest?.projectResponsible ||
        selectedRequest?.responsible ||
        selectedRequest?.surveyResponsible ||
        loggedInResponsible,
      note:
        selectedRequest?.projectNote ||
        "Opprettes fra akseptert tilbud i Befaring / Tilbud / Aksept.",
    });
    setMode("project-activation");
  }

  function updateProjectForm(field, value) {
    setProjectForm((current) => ({ ...current, [field]: value }));
  }

  async function handleContractUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || contractUploadBusy || !selectedRequest) return;
    if (integrationMode !== "app" || !activeSupabase || !authUser?.id) {
      setContractUploadError("Du må være innlogget i Expo ProffDok for å laste opp kontrakt.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setContractUploadError("Kontrakten kan ikke være større enn 20 MB.");
      return;
    }

    setContractUploadBusy(true);
    setContractUploadError("");
    try {
      const cleanName = sanitizeStoragePart(file.name || "kontrakt");
      const path = `sales-contracts/${authUser.id}/${sanitizeStoragePart(selectedRequest.id)}/${Date.now()}-${cleanName}`;
      const { error: uploadError } = await activeSupabase.storage
        .from("project-images")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data: publicFile } = activeSupabase.storage
        .from("project-images")
        .getPublicUrl(path);
      const contractFile = {
        id: crypto.randomUUID(),
        name: file.name || "Kontrakt",
        url: publicFile.publicUrl,
        path,
        type: file.type || "application/octet-stream",
        size: file.size,
        created: new Date().toISOString(),
        by: loggedInResponsible,
        documentType: "contract",
      };
      const nextRequests = requests.map((request) =>
        request.id === selectedRequest.id
          ? { ...request, contractFile, contractUploadedAt: contractFile.created }
          : request
      );
      setRequests(nextRequests);
      await persistRequests(nextRequests);
    } catch (error) {
      console.error("Kunne ikke laste opp kontrakt", error);
      setContractUploadError(error.message || "Kunne ikke laste opp kontrakten.");
    } finally {
      setContractUploadBusy(false);
    }
  }

  async function handleRemoveContract() {
    if (!selectedRequest?.contractFile || contractUploadBusy) return;
    if (!window.confirm("Vil du fjerne den opplastede kontrakten fra saken?")) return;
    setContractUploadBusy(true);
    setContractUploadError("");
    try {
      const contractPath = selectedRequest.contractFile.path;
      if (contractPath && activeSupabase) {
        const { error: removeError } = await activeSupabase.storage
          .from("project-images")
          .remove([contractPath]);
        if (removeError) throw removeError;
      }
      const nextRequests = requests.map((request) =>
        request.id === selectedRequest.id
          ? { ...request, contractFile: null, contractUploadedAt: "" }
          : request
      );
      setRequests(nextRequests);
      await persistRequests(nextRequests);
    } catch (error) {
      console.error("Kunne ikke fjerne kontrakt", error);
      setContractUploadError(error.message || "Kunne ikke fjerne kontrakten.");
    } finally {
      setContractUploadBusy(false);
    }
  }

  async function handleCreateAcceptanceProof() {
    if (!selectedRequest || acceptanceProofBusy) return;
    if (selectedRequest.acceptanceProofFile?.url) {
      window.open(selectedRequest.acceptanceProofFile.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (integrationMode !== "app" || !activeSupabase || !authUser?.id) {
      setAcceptanceProofError("Du må være innlogget i Expo ProffDok for å opprette akseptbeviset.");
      return;
    }

    setAcceptanceProofBusy(true);
    setAcceptanceProofError("");
    try {
      const module = await import("https://esm.sh/jspdf@2.5.1");
      const JsPDF = module.jsPDF || module.default?.jsPDF;
      if (!JsPDF) throw new Error("PDF-verktøyet kunne ikke lastes.");

      const pdf = new JsPDF({ unit: "mm", format: "a4" });
      const left = 18;
      const right = 192;
      const lineHeight = 5.2;
      let y = 20;
      const ensureSpace = (height = 12) => {
        if (y + height <= 278) return;
        pdf.addPage();
        y = 20;
      };
      const addText = (text, options = {}) => {
        const value = String(text || "").trim();
        if (!value) return;
        const size = options.size || 10;
        const style = options.style || "normal";
        const lines = pdf.splitTextToSize(value, options.width || right - left);
        ensureSpace(lines.length * lineHeight + (options.after || 2));
        pdf.setFont("helvetica", style);
        pdf.setFontSize(size);
        pdf.setTextColor(options.color || "#183b46");
        pdf.text(lines, left, y);
        y += lines.length * lineHeight + (options.after ?? 2);
      };
      const addSection = (title, text) => {
        if (!String(text || "").trim()) return;
        ensureSpace(18);
        addText(title, { size: 11, style: "bold", after: 1 });
        addText(text, { size: 9.5, after: 4 });
      };

      pdf.setFillColor(16, 92, 106);
      pdf.rect(0, 0, 210, 34, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("AKSEPTBEVIS", left, 17);
      pdf.setFontSize(9.5);
      pdf.text("Expo ProffDok - dokumentasjon av digital kundeaksept", left, 25);
      y = 44;

      addText(selectedRequest.acceptedOfferTitle || selectedRequest.offerTitle || selectedRequest.title || "Tilbud", { size: 16, style: "bold", after: 5 });
      addText(`Tilbud nr.: ${selectedRequest.id}`, { style: "bold", after: 1 });
      addText(`Tilbudsversjon: v${selectedRequest.acceptedOfferVersionNumber || selectedRequest.sentOfferVersionNumber || "-"}`, { after: 1 });
      addText(`Akseptert av: ${selectedRequest.acceptedBy || "Kunde"}`, { after: 1 });
      addText(`Aksepttidspunkt: ${selectedRequest.acceptedAt ? new Date(selectedRequest.acceptedAt).toLocaleString("nb-NO") : "Ikke registrert"}`, { after: 1 });
      addText(`Kunde: ${selectedRequest.customer || "-"}`, { after: 1 });
      addText(`Arbeidssted: ${selectedRequest.address || "-"}`, { after: 5 });

      addSection("Innledning", selectedRequest.acceptedOfferIntro);
      const acceptedLines = getVisibleOfferLines(selectedRequest.acceptedOfferLines || selectedRequest.offerLines || []);
      if (acceptedLines.length) {
        addText("Aksepterte arbeider og priser", { size: 11, style: "bold", after: 2 });
        acceptedLines.forEach((line, index) => {
          addText(`${index + 1}. ${line.description || "Tilbudspost"} - ${formatNok(getOfferTotal([line]))} eks. mva.`, { size: 9.5, after: 1 });
        });
        y += 3;
      }
      if (selectedRequest.acceptedOptions?.length) {
        addText("Valgte opsjoner", { size: 11, style: "bold", after: 2 });
        selectedRequest.acceptedOptions.forEach((option) => {
          addText(`${option.title || "Opsjon"}${option.description ? `: ${option.description}` : ""} - ${formatNok(getOfferTotal([option]))} eks. mva.`, { size: 9.5, after: 1 });
        });
        y += 3;
      }
      addText(`Akseptert total eks. mva.: ${formatNok(Number(selectedRequest.acceptedTotal || 0))}`, { size: 11, style: "bold", after: 1 });
      addText(`Akseptert total inkl. mva.: ${formatNok(Number(selectedRequest.acceptedTotal || 0) * 1.25)}`, { size: 11, style: "bold", after: 5 });
      addSection("Forutsetninger og forbehold", selectedRequest.acceptedOfferReservations || selectedRequest.offerReservations);
      addSection("Dette er inkludert", selectedRequest.acceptedOfferIncluded || selectedRequest.offerIncluded);
      addSection("Dette er ikke inkludert", selectedRequest.acceptedOfferExcluded || selectedRequest.offerExcluded);
      addSection("Dette sørger kunden for", selectedRequest.acceptedOfferCustomerSupplied || selectedRequest.offerCustomerSupplied);
      addSection("Vilkår", selectedRequest.acceptedOfferTerms || selectedRequest.offerTerms);
      addSection("Betalingsbetingelser", selectedRequest.acceptedOfferPaymentTerms || selectedRequest.offerPaymentTerms);
      addText("Bekreftelse", { size: 11, style: "bold", after: 1 });
      addText("Kunden har digitalt bekreftet at tilbudet, valgte opsjoner, leveranseomfang, forbehold, vilkår og betalingsbetingelser er lest og akseptert.", { size: 9.5, after: 4 });
      addText("Dokumentet er opprettet fra den publiserte tilbudsversjonen og skal ikke redigeres. Eventuelle senere endringer må håndteres i en ny avtale eller tilbudsversjon.", { size: 8.5, after: 2 });

      const pageCount = pdf.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(80, 100, 108);
        pdf.text(`Akseptbevis ${selectedRequest.id} - side ${page} av ${pageCount}`, left, 290);
      }

      const blob = pdf.output("blob");
      const version = selectedRequest.acceptedOfferVersionNumber || selectedRequest.sentOfferVersionNumber || "1";
      const fileName = `Akseptbevis-${sanitizeStoragePart(selectedRequest.id)}-v${version}.pdf`;
      const path = `sales-acceptance-proofs/${authUser.id}/${sanitizeStoragePart(selectedRequest.id)}/${crypto.randomUUID()}-${fileName}`;
      const { error: uploadError } = await activeSupabase.storage
        .from("project-images")
        .upload(path, blob, { cacheControl: "3600", contentType: "application/pdf", upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicFile } = activeSupabase.storage.from("project-images").getPublicUrl(path);
      const acceptanceProofFile = {
        id: crypto.randomUUID(),
        name: fileName,
        url: publicFile.publicUrl,
        path,
        type: "application/pdf",
        size: blob.size,
        created: new Date().toISOString(),
        by: loggedInResponsible,
        documentType: "acceptance-proof",
        locked: true,
        offerVersionNumber: version,
      };
      const nextRequests = requests.map((request) =>
        request.id === selectedRequest.id ? { ...request, acceptanceProofFile } : request
      );
      setRequests(nextRequests);
      await persistRequests(nextRequests);
    } catch (error) {
      console.error("Kunne ikke opprette akseptbevis", error);
      setAcceptanceProofError(error.message || "Kunne ikke opprette akseptbeviset.");
    } finally {
      setAcceptanceProofBusy(false);
    }
  }

  async function handleActivateProject(event) {
    event.preventDefault();
    if (projectActivationBusy) return;
    if (integrationMode !== "app" || !activeSupabase || !authUser?.id) {
      alert("Du må være innlogget i Expo ProffDok for å opprette prosjektet.");
      return;
    }
    if (selectedRequest.status !== "Akseptert" && !selectedRequest.projectId) {
      alert("Tilbudet må være akseptert før saken kan aktiveres som prosjekt.");
      return;
    }

    setProjectActivationBusy(true);
    try {
      const requestRef = selectedRequest.id;
      let existingProjectId = selectedRequest.projectId || "";

      if (existingProjectId) {
        const { data: existingById, error: existingByIdError } = await activeSupabase
          .from("projects")
          .select("id")
          .eq("id", existingProjectId)
          .maybeSingle();
        if (existingByIdError) throw existingByIdError;
        if (!existingById) existingProjectId = "";
      }

      if (!existingProjectId) {
        const { data: ownedProjects, error: duplicateError } = await activeSupabase
          .from("projects")
          .select("id,data")
          .eq("user_id", authUser.id);
        if (duplicateError) throw duplicateError;
        const duplicate = (ownedProjects || []).find(
          (row) => row?.data?.project?.salesOrigin?.requestRef === requestRef
        );
        existingProjectId = duplicate?.id || "";
      }

      if (!existingProjectId) {
        const projectId = crypto.randomUUID();
        const activatedAt = new Date().toISOString();
        const acceptedLines = getVisibleOfferLines(
          selectedRequest.acceptedOfferLines || selectedRequest.offerLines || []
        );
        const acceptedOptions = selectedRequest.acceptedOptions || [];
        const inspectionPhotos = selectedRequest.inspectionPhotos || [];
        const projectPhotos = [];

        for (const [index, photo] of inspectionPhotos.entries()) {
          let blob = null;
          if (photo.path) {
            const { data, error } = await activeSupabase.storage
              .from(INSPECTION_BUCKET)
              .download(photo.path);
            if (error) throw new Error(`Kunne ikke overføre befaringsbilde: ${error.message}`);
            blob = data;
          } else if (photo.dataUrl) {
            blob = dataUrlToBlob(photo.dataUrl);
          }
          if (!blob) continue;
          const cleanName = sanitizeStoragePart(photo.name || `befaring-${index + 1}.jpg`);
          const imagePath = `sales-activation/${authUser.id}/${projectId}/${Date.now()}-${index}-${cleanName}`;
          const { error: imageError } = await activeSupabase.storage
            .from("project-images")
            .upload(imagePath, blob, { cacheControl: "3600", upsert: false });
          if (imageError) throw new Error(`Kunne ikke lagre befaringsbilde i prosjektet: ${imageError.message}`);
          const { data: publicImage } = activeSupabase.storage
            .from("project-images")
            .getPublicUrl(imagePath);
          projectPhotos.push({
            id: crypto.randomUUID(),
            url: publicImage.publicUrl,
            path: imagePath,
            name: photo.name || `Befaringsbilde ${index + 1}`,
            cat: "Før oppstart",
            comment: "Overført fra befaring",
            created: photo.createdAt || activatedAt,
          });
        }

        const inspectionSummary = [
          selectedRequest.inspectionCustomerWishes && `Kundens ønsker: ${selectedRequest.inspectionCustomerWishes}`,
          selectedRequest.inspectionExistingConditions && `Eksisterende forhold: ${selectedRequest.inspectionExistingConditions}`,
          selectedRequest.inspectionMeasurements && `Mål og registreringer: ${selectedRequest.inspectionMeasurements}`,
          selectedRequest.inspectionObservations && `Observasjoner: ${selectedRequest.inspectionObservations}`,
        ].filter(Boolean).join("\n\n");
        const offerSummary = [
          ...acceptedLines.map((line) => `• ${line.description}: ${formatNok(Number(line.amount || 0))} eks. mva.`),
          ...acceptedOptions.map((option) => `• Valgt opsjon – ${option.description}: ${formatNok(Number(option.amount || 0))} eks. mva.`),
        ].join("\n");
        const projectDescription = [
          selectedRequest.note,
          inspectionSummary,
          offerSummary && `Akseptert tilbud v${selectedRequest.acceptedOfferVersionNumber || selectedRequest.sentOfferVersionNumber || ""}:\n${offerSummary}`,
          selectedRequest.acceptedTotal != null && `Akseptert total: ${formatNok(Number(selectedRequest.acceptedTotal || 0))} eks. mva. / ${formatNok(Number(selectedRequest.acceptedTotal || 0) * 1.25)} inkl. mva.`,
        ].filter(Boolean).join("\n\n");
        const companyName =
          profile?.company_name || profile?.companyName || companyProfile.companyName || "";
        const projectData = {
          company: {
            companyName,
            orgNumber: profile?.org_number || companyProfile.orgNumber || "",
            address: profile?.address || companyProfile.address || "",
            phone: profile?.phone || companyProfile.phone || "",
            email: profile?.email || companyProfile.email || authUser.email || "",
            website: companyProfile.website || "",
            logoUrl: companyProfile.logoUrl || "",
          },
          user: { id: authUser.id, email: authUser.email || "" },
          project: {
            responsible: projectForm.responsible.trim(),
            projectName: projectForm.projectName.trim(),
            projectNumber: projectForm.projectNumber.trim(),
            address: selectedRequest.address || "",
            postnr: selectedRequest.postnr || "",
            city: selectedRequest.city || "",
            customer: selectedRequest.customer || "",
            customerEmail: selectedRequest.email || "",
            customerPhone: selectedRequest.phone || "",
            date: new Date().toISOString().slice(0, 10),
            notes: projectForm.note.trim(),
            projectDescription,
            projectInfoIncludeInReport: true,
            checklistPhotosNote: false,
            reportHeroPhotoId: "",
            isTemplate: false,
            fall: "", fallDusj: "", fallUtenfor: "", sluk: "", terskel: "", membran: "",
            prosjekteringKommentar: "", prosjekteringPunkter: [], customChecklistGroups: [], projectDeviations: [],
            locked: false, status: "active", workflowStatus: "Pågår", lockedAt: "", lockedBy: "",
            salesOrigin: {
              requestRef,
              publicToken: selectedRequest.publicToken || "",
              acceptedOfferVersionId: selectedRequest.acceptedOfferVersionId || "",
              acceptedOfferVersionNumber: selectedRequest.acceptedOfferVersionNumber || "",
              acceptedBy: selectedRequest.acceptedBy || "",
              acceptedAt: selectedRequest.acceptedAt || "",
              acceptedTotal: Number(selectedRequest.acceptedTotal || 0),
              activatedAt,
            },
          },
          checked: {}, productDocs: {}, manualProducts: {}, other: {}, surf: {}, bathroomEquipment: {},
          photos: projectPhotos, access: [], inst: [], files: [], checklist: {},
          tilbud: {
            enabled: true,
            files: [selectedRequest.acceptanceProofFile, selectedRequest.contractFile]
              .filter(Boolean)
              .map((file) => ({ ...file, id: file.id || crypto.randomUUID() })),
            tillegg: "",
            fradrag: "",
            kommentar: projectDescription,
          },
          overtagelse: { enabled: false, dato: new Date().toISOString().slice(0, 10), kommentar: "", signUtførende: "", signKunde: "", signUtførendeImage: "", signKundeImage: "" },
          warranty: { enabled: false, issued: false, status: "draft" },
          projectLog: { enabled: false, draft: "", messages: [], lastReadByAdmin: "", lastReadByCustomer: "" },
          internalNotes: projectForm.note.trim(),
        };
        const { data: inserted, error: insertError } = await activeSupabase
          .from("projects")
          .insert({
            id: projectId,
            title: projectForm.projectName.trim() || selectedRequest.address || "Uten navn",
            data: projectData,
            user_id: authUser.id,
            share_enabled: true,
            locked: false,
            locked_at: null,
            locked_by: "",
            updated_at: activatedAt,
          })
          .select("id")
          .single();
        if (insertError) throw insertError;
        existingProjectId = inserted.id;
      }

      const activatedAt = new Date().toISOString();
      const nextRequests = requests.map((request) =>
        request.id === selectedRequestId
          ? {
              ...request,
              projectId: existingProjectId,
              projectName: projectForm.projectName.trim(),
              projectNumber: projectForm.projectNumber.trim(),
              projectResponsible: projectForm.responsible.trim(),
              projectNote: projectForm.note.trim(),
              projectActivatedAt: request.projectActivatedAt || activatedAt,
              status: "Aktivert",
              statusClass: "sales-status-accepted",
              nextStep: "Åpne ProffDok-prosjekt",
              iconName: "home",
            }
          : request
      );
      setRequests(nextRequests);
      await persistRequests(nextRequests);
      setPublishFeedback(null);
      setCustomerLinkCopied(false);
      window.location.assign(`${window.location.pathname}?project=${encodeURIComponent(existingProjectId)}&access=admin&tab=prosjekt`);
    } catch (error) {
      console.error("Kunne ikke aktivere salgssak som prosjekt", error);
      alert(error.message || "Kunne ikke opprette ProffDok-prosjektet.");
    } finally {
      setProjectActivationBusy(false);
    }
  }

  function buildOfferSnapshot(request) {
    const versionNumber = (request.offerVersions?.length || 0) + 1;
    const createdAt = new Date().toISOString();

    return {
      id: `offer-version-${Date.now()}`,
      versionNumber,
      createdAt,
      title: request.offerTitle || "",
      intro: request.offerIntro || "",
      lines: [
        createCompanySnapshot(companyProfile),
        createOfferTermsSnapshot(request),
        ...(request.offerLines || []),
      ],
      options: request.offerOptions || [],
      reservations: request.offerReservations || "",
      validityDays: request.offerValidityDays || "30",
      total: request.offerTotal || 0,
    };
  }

  function createOrReuseSentOfferVersion(request) {
    if (request.sentOfferVersionId) {
      return request;
    }

    const snapshot = buildOfferSnapshot(request);

    return {
      ...request,
      offerVersions: [...(request.offerVersions || []), snapshot],
      sentOfferVersionId: snapshot.id,
      sentOfferVersionNumber: snapshot.versionNumber,
      sentOfferAt: snapshot.createdAt,
    };
  }

  function openCustomerOfferPreview() {
    if (!selectedRequest) return;

    openCustomerOfferFromRequestId(selectedRequest.id);
  }

  function getActiveOfferVersion(request) {
    if (!request?.sentOfferVersionId) return null;
    return (
      request.offerVersions?.find(
        (version) => version.id === request.sentOfferVersionId
      ) || null
    );
  }

  function createNewOfferVersionDraft(request) {
    return {
      ...request,
      sentOfferVersionId: null,
      sentOfferVersionNumber: null,
      sentOfferAt: null,
      nextStep: "Send tilbud til kunde",
    };
  }

  function toggleAcceptedOption(optionId) {
    setAcceptanceForm((current) => ({
      ...current,
      selectedOptionIds: current.selectedOptionIds.includes(optionId)
        ? current.selectedOptionIds.filter((id) => id !== optionId)
        : [...current.selectedOptionIds, optionId],
    }));
  }

  async function handleAcceptOffer(event) {
    event.preventDefault();

    if (!acceptanceForm.confirmed || !acceptanceForm.name.trim()) return;

    const activeOfferVersion = getActiveOfferVersion(selectedRequest);
    const offerOptions =
      activeOfferVersion?.options || selectedRequest.offerOptions || [];
    const selectedOptions = offerOptions.filter((option) =>
      acceptanceForm.selectedOptionIds.includes(option.id)
    );
    const acceptedTotal =
      (activeOfferVersion?.total || selectedRequest.offerTotal || 0) +
      getOfferTotal(selectedOptions);
    const acceptedAt = new Date().toISOString();

    if (selectedRequest.isPublicOffer) {
      if (!activeSupabase) {
        alert("Supabase-miljøvariabler mangler i Vercel-preview.");
        return;
      }

      const { error } = await activeSupabase.rpc("accept_sales_offer", {
        token: selectedRequest.publicToken,
        accepted_name: acceptanceForm.name.trim(),
        selected_options: selectedOptions,
      });

      if (error) {
        alert(error.message || "Kunne ikke registrere aksept.");
        return;
      }
    }

    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            acceptedBy: acceptanceForm.name.trim(),
            acceptedAt,
            acceptedOfferVersionId: selectedRequest.sentOfferVersionId,
            acceptedOfferVersionNumber: selectedRequest.sentOfferVersionNumber,
            acceptedOfferLines: getVisibleOfferLines(
              activeOfferVersion?.lines || selectedRequest.offerLines || []
            ),
            acceptedOptionIds: acceptanceForm.selectedOptionIds,
            acceptedOptions: selectedOptions,
            acceptedTotal,
            acceptedOfferTitle: activeOfferVersion?.title || selectedRequest.offerTitle || selectedRequest.title || "Tilbud",
            acceptedOfferIntro: activeOfferVersion?.intro || selectedRequest.offerIntro || "",
            acceptedOfferReservations: activeOfferVersion?.reservations || selectedRequest.offerReservations || "",
            acceptedOfferIncluded: selectedRequest.offerIncluded || "",
            acceptedOfferExcluded: selectedRequest.offerExcluded || "",
            acceptedOfferCustomerSupplied: selectedRequest.offerCustomerSupplied || "",
            acceptedOfferTerms: selectedRequest.offerTerms || "",
            acceptedOfferPaymentTerms: selectedRequest.offerPaymentTerms || "",
            status: "Akseptert",
            statusClass: "sales-status-accepted",
            nextStep: selectedRequest.isPublicOffer
              ? "Tilbudet er akseptert"
              : "Aktiver som prosjekt",
            iconName: "home",
          }
        : request
    );

    setRequests(nextRequests);
    void persistRequests(nextRequests).catch((error) =>
      alert(error.message || "Kunne ikke lagre aksepten varig.")
    );
    setMode(selectedRequest.isPublicOffer ? "customer-accepted" : "detail");
  }

  function openOfferBuilder() {
    let storedDraft = null;

    try {
      storedDraft = loadOfferDraft(selectedRequest?.id);
    } catch {
      storedDraft = null;
    }

    offerFormHydratedRequestIdRef.current = selectedRequest?.id || "";
    setOfferForm(normalizeStoredOfferDraft(storedDraft, selectedRequest));
    setOfferFormReady(true);
    setMode("offer-builder");
  }

  function updateOfferForm(field, value) {
    setOfferForm((current) => ({ ...current, [field]: value }));
  }

  function addInspectionContextToOfferIntro() {
    if (!selectedRequest) return;

    const inspectionIntro = buildInspectionIntro(selectedRequest);
    if (!inspectionIntro) return;

    setOfferForm((current) => {
      const currentIntro = String(current.intro || "").trim();

      return {
        ...current,
        intro: currentIntro
          ? `${currentIntro}\n\nBefaringsgrunnlag:\n${inspectionIntro}`
          : `Befaringsgrunnlag:\n${inspectionIntro}`,
      };
    });
  }

  function updateOfferLine(lineId, field, value) {
    setOfferForm((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      ),
    }));
  }

  function createEmptyOfferLine() {
    return {
      id: `line-${Date.now()}-${Math.random()}`,
      description: "",
      amount: "",
      productUrl: "",
      imageDataUrl: "",
      imageName: "",
    };
  }

  function addOfferLine() {
    setOfferForm((current) => ({
      ...current,
      lines: [...current.lines, createEmptyOfferLine()],
    }));
  }

  function focusOfferLineDescription(lineId) {
    window.setTimeout(() => {
      const field = document.querySelector(
        `[data-offer-line-description="${lineId}"]`
      );

      if (field) {
        field.focus();
        field.select?.();
      }
    }, 0);
  }

  function handleOfferLineAmountEnter(event, line, index) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const nextLine = offerForm.lines[index + 1];

    if (nextLine) {
      focusOfferLineDescription(nextLine.id);
      return;
    }

    const newLine = createEmptyOfferLine();

    setOfferForm((current) => ({
      ...current,
      lines: [...current.lines, newLine],
    }));

    focusOfferLineDescription(newLine.id);
  }

  function removeOfferLine(lineId) {
    setOfferForm((current) => ({
      ...current,
      lines:
        current.lines.length === 1
          ? current.lines
          : current.lines.filter((line) => line.id !== lineId),
    }));
  }

  function handleOfferLineImage(lineId, event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setOfferForm((current) => ({
        ...current,
        lines: current.lines.map((line) =>
          line.id === lineId
            ? {
                ...line,
                imageDataUrl: reader.result,
                imageName: file.name,
              }
            : line
        ),
      }));
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removeOfferLineImage(lineId) {
    setOfferForm((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId
          ? { ...line, imageDataUrl: "", imageName: "" }
          : line
      ),
    }));
  }

  function addOfferOption() {
    setOfferForm((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          id: `option-${Date.now()}-${Math.random()}`,
          title: "",
          description: "",
          amount: "",
          imageDataUrl: "",
          imageName: "",
        },
      ],
    }));
  }

  function updateOfferOption(optionId, field, value) {
    setOfferForm((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.id === optionId ? { ...option, [field]: value } : option
      ),
    }));
  }

  function removeOfferOption(optionId) {
    setOfferForm((current) => ({
      ...current,
      options: current.options.filter((option) => option.id !== optionId),
    }));
  }

  function handleOfferOptionImage(optionId, event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setOfferForm((current) => ({
        ...current,
        options: current.options.map((option) =>
          option.id === optionId
            ? {
                ...option,
                imageDataUrl: reader.result,
                imageName: file.name,
              }
            : option
        ),
      }));
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function getOfferTotal(lines) {
    return lines.reduce((sum, line) => {
      const normalized = String(line.amount || "")
        .replace(/\s/g, "")
        .replace(",", ".");
      const amount = Number(normalized);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }

  function formatNok(value) {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function handleSaveOffer(event) {
    event.preventDefault();

    const cleanLines = offerForm.lines
      .map((line) => ({
        ...line,
        description: line.description.trim(),
        amount: String(line.amount || "").trim(),
        productUrl: String(line.productUrl || "").trim(),
        imageDataUrl: line.imageDataUrl || "",
        imageName: line.imageName || "",
      }))
      .filter(
        (line) =>
          line.description ||
          line.amount ||
          line.productUrl ||
          line.imageDataUrl
      );

    if (!cleanLines.length) {
      alert("Legg inn minst én tilbudslinje før du lagrer tilbudet.");
      return;
    }

    const incompleteLine = cleanLines.find(
      (line) => !line.description || !line.amount
    );

    if (incompleteLine) {
      alert("Tilbudslinjer som har innhold må ha både beskrivelse og beløp. Tomme linjer ignoreres automatisk.");
      return;
    }

    const cleanOptions = offerForm.options
      .map((option) => ({
        ...option,
        title: option.title.trim(),
        description: option.description.trim(),
        amount: String(option.amount || "").trim(),
        productUrl: String(option.productUrl || "").trim(),
      }))
      .filter(
        (option) =>
          option.title ||
          option.description ||
          option.amount ||
          option.imageDataUrl ||
          option.productUrl
      );

    const nextRequests = requests.map((request) => {
      if (request.id !== selectedRequestId) return request;

      const hasPreviouslyPublishedOffer = Boolean(
        request.publicToken ||
          request.salesOfferId ||
          request.sentOfferVersionId ||
          request.sentOfferVersionNumber
      );

      return {
        ...request,
        offerTitle: offerForm.title.trim(),
        offerIntro: offerForm.intro.trim(),
        offerLines: cleanLines,
        offerOptions: cleanOptions,
        offerReservations: offerForm.reservations.trim(),
        offerIncluded: offerForm.included.trim(),
        offerExcluded: offerForm.excluded.trim(),
        offerCustomerSupplied: offerForm.customerSupplied.trim(),
        offerTerms: offerForm.terms.trim(),
        offerPaymentTerms: offerForm.paymentTerms.trim(),
        offerValidityDays: offerForm.validityDays,
        offerTotal: getOfferTotal(cleanLines),
        sentOfferVersionId: null,
        sentOfferVersionNumber: null,
        sentOfferAt: null,
        status: "Tilbud",
        statusClass: "sales-status-quote",
        nextStep: hasPreviouslyPublishedOffer
          ? "Publiser ny tilbudsversjon"
          : "Publiser kundetilbud",
        iconName: "send",
      };
    });

    setRequests(nextRequests);
    try {
      await persistRequests(nextRequests);
    } catch (error) {
      alert(error.message || "Kunne ikke lagre tilbudsutkastet varig.");
      return;
    }

    try {
      offerModeRef.current = "detail";
      window.localStorage.removeItem(
        getStableOfferDraftKey(selectedRequestId)
      );
      window.localStorage.removeItem(`${salesStorageKey}:offer-draft:${selectedRequestId}`);
    } catch {
      // Varig lagring er fullført selv om lokal kladd ikke kan ryddes.
    }
    setMode("detail");
  }

  function getInspectionDraftKey(requestId = selectedRequestId) {
    return `${salesStorageKey}:inspection-draft:${requestId || "uten-sak"}`;
  }

  function saveInspectionDraft(nextForm) {
    if (!selectedRequestId) return;

    try {
      window.localStorage.setItem(
        getInspectionDraftKey(selectedRequestId),
        JSON.stringify({
          form: nextForm,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Lokal feature-kladd. Ingen database-/prosjektlagring.
    }
  }

  function clearInspectionDraft(requestId = selectedRequestId) {
    if (!requestId) return;

    try {
      window.localStorage.removeItem(getInspectionDraftKey(requestId));
    } catch {
      // Lokal feature-kladd.
    }
  }

  function openInspectionNote() {
    let draft = null;

    try {
      const storedDraft = window.localStorage.getItem(
        getInspectionDraftKey(selectedRequest?.id)
      );
      draft = storedDraft ? JSON.parse(storedDraft) : null;
    } catch {
      draft = null;
    }

    const nextForm = draft?.form || {
      customerWishes:
        selectedRequest?.inspectionCustomerWishes ||
        selectedRequest?.customerWishes ||
        "",
      existingConditions:
        selectedRequest?.inspectionExistingConditions ||
        selectedRequest?.existingConditions ||
        "",
      measurements:
        selectedRequest?.inspectionMeasurements ||
        selectedRequest?.measurements ||
        "",
      observations:
        selectedRequest?.inspectionObservations ||
        selectedRequest?.observations ||
        selectedRequest?.inspectionNote ||
        "",
      photos:
        selectedRequest?.inspectionPhotos ||
        selectedRequest?.photos ||
        [],
    };

    setInspectionForm(nextForm);
    setInspectionDraftDirty(Boolean(draft));
    setMode("inspection-note");
  }

  function updateInspectionForm(field, value) {
    setInspectionForm((current) => {
      const nextForm = { ...current, [field]: value };
      saveInspectionDraft(nextForm);
      return nextForm;
    });
    setInspectionDraftDirty(true);
  }

  function handleInspectionPhotos(event) {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setInspectionForm((current) => ({
          ...current,
          photos: [
            ...current.photos,
            {
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              dataUrl: reader.result,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  }

  function removeInspectionPhoto(photoId) {
    setInspectionForm((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.id !== photoId),
    }));
  }

  async function handleSaveInspectionNote(event) {
    event.preventDefault();

    if (integrationMode === "app" && (!activeSupabase || !salesCompanyId)) {
      alert(
        salesStorageError ||
          "Varig lagring er ikke klar. Kontroller firmatilknytningen og prøv igjen."
      );
      return;
    }

    let persistentPhotos = inspectionForm.photos;
    try {
      persistentPhotos = await Promise.all(
        inspectionForm.photos.map(async (photo) => {
          if (photo.path || !photo.dataUrl) return photo;
          const compressedDataUrl = await compressImageDataUrl(photo.dataUrl);
          const blob = dataUrlToBlob(compressedDataUrl);
          const extension = "jpg";
          const baseName = sanitizeStoragePart(photo.name).replace(
            /\.[a-zA-Z0-9]+$/,
            ""
          );
          const path = `${salesCompanyId}/${sanitizeStoragePart(
            selectedRequestId
          )}/${Date.now()}-${baseName}.${extension}`;
          const { error: uploadError } = await activeSupabase.storage
            .from(INSPECTION_BUCKET)
            .upload(path, blob, { contentType: "image/jpeg", upsert: false });
          if (uploadError) throw uploadError;
          const { data: signed } = await activeSupabase.storage
            .from(INSPECTION_BUCKET)
            .createSignedUrl(path, 60 * 60 * 24 * 7);
          return {
            id: photo.id,
            name: photo.name,
            path,
            size: blob.size,
            createdAt: new Date().toISOString(),
            dataUrl: signed?.signedUrl || compressedDataUrl,
          };
        })
      );
    } catch (error) {
      alert(error.message || "Kunne ikke laste opp befaringsbildet.");
      return;
    }

    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            inspectionCustomerWishes: inspectionForm.customerWishes.trim(),
            inspectionExistingConditions: inspectionForm.existingConditions.trim(),
            inspectionMeasurements: inspectionForm.measurements.trim(),
            inspectionObservations: inspectionForm.observations.trim(),
            inspectionPhotos: persistentPhotos,
            ...(request.status === "Forespørsel" || request.status === "Befaring"
              ? {
                  status: "Befaring",
                  statusClass: "sales-status-survey",
                  nextStep: "Opprett tilbud",
                  iconName: "send",
                }
              : {}),
          }
        : request
    );

    setRequests(nextRequests);
    try {
      await persistRequests(nextRequests);
    } catch (error) {
      alert(error.message || "Kunne ikke lagre befaringsnotatet varig.");
      return;
    }
    clearInspectionDraft(selectedRequestId);
    setInspectionDraftDirty(false);
    setMode("detail");
  }

  function openOutlookCalendar(request) {
    if (!request?.surveyDate || !request?.surveyTime) return;

    const start = new Date(`${request.surveyDate}T${request.surveyTime}:00`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const toLocalIso = (date) => {
      const pad = (value) => String(value).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    };

    const subject = `Befaring – ${request.title} – ${request.customer}`;
    const body = [
      `Kunde: ${request.customer}`,
      `Telefon: ${request.phone || "Ikke registrert"}`,
      `E-post: ${request.email || "Ikke registrert"}`,
      `Saksnummer: ${request.id}`,
      "",
      request.note ? `Forespørsel: ${request.note}` : "",
      request.surveyNote ? `Intern merknad: ${request.surveyNote}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const params = new URLSearchParams({
      subject,
      startdt: toLocalIso(start),
      enddt: toLocalIso(end),
      location: request.address || "",
      body,
      path: "/calendar/action/compose",
      rru: "addevent",
    });

    if (request.email) {
      params.set("to", request.email);
    }

    window.open(
      `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openSurveyPlanning() {
    setSurveyForm({
      date: selectedRequest?.surveyDate || "",
      time: selectedRequest?.surveyTime || "",
      responsible:
        selectedRequest?.surveyResponsible ||
        selectedRequest?.responsible ||
        loggedInResponsible,
      note: selectedRequest?.surveyNote || "",
    });
    setMode("survey-plan");
  }

  function updateSurveyForm(field, value) {
    setSurveyForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSaveSurveyPlan(event) {
    event.preventDefault();

    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            surveyDate: surveyForm.date,
            surveyTime: surveyForm.time,
            surveyResponsible: surveyForm.responsible.trim(),
            surveyNote: surveyForm.note.trim(),
            status: "Befaring",
            statusClass: "sales-status-survey",
            nextStep: "Fullfør befaringsnotat",
            iconName: "ruler",
          }
        : request
    );

    setRequests(nextRequests);
    try {
      await persistRequests(nextRequests);
    } catch (error) {
      alert(error.message || "Kunne ikke lagre befaringsplanen varig.");
      return;
    }
    setMode("detail");
  }

  function getCustomerOfferLink(token) {
    const url = new URL(window.location.href);
    // Behold eventuelle Vercel-parametere for deling av beskyttet preview.
    // Erstatt bare kundetokenet dersom det allerede finnes.
    url.searchParams.set("publicOffer", token);
    return url.toString();
  }

  function buildPublishPayload(request, profileForPublish = companyProfile) {
    return {
      offer_id: request.salesOfferId || null,
      request_ref: request.id,
      customer_name: request.customer,
      customer_email: request.email,
      customer_phone: request.phone,
      customer_address: request.address,
      title: request.offerTitle || request.title,
      intro: request.offerIntro || "",
      lines: [
        createCompanySnapshot(profileForPublish),
        createOfferTermsSnapshot(request),
        ...(request.offerLines || []),
      ],
      options: request.offerOptions || [],
      reservations: request.offerReservations || "",
      validity_days: Number(request.offerValidityDays || 30),
      total_ex_vat: request.offerTotal || 0,
    };
  }

  function mapPublicOfferToRequest(result) {
    const offer = result?.offer;
    const version = result?.version;

    if (!offer || !version) return null;

    const publishedLines = Array.isArray(version.lines) ? version.lines : [];
    const companySnapshot =
      publishedLines.find((line) => line?.__companyMeta) || {};
    const offerTermsSnapshot = getOfferTermsSnapshot(publishedLines);
    const visibleOfferLines = getVisibleOfferLines(publishedLines);

    return {
      id: offer.request_ref || offer.id,
      salesOfferId: offer.id,
      title: version.title || offer.title,
      offerTitle: version.title || offer.title,
      offerIntro: version.intro || "",
      offerLines: visibleOfferLines,
      companyName: companySnapshot.companyName || "",
      companyOrgNumber: companySnapshot.orgNumber || "",
      companyAddress: companySnapshot.address || "",
      companyPhone: companySnapshot.phone || "",
      companyEmail: companySnapshot.email || "",
      companyWebsite: companySnapshot.website || "",
      companyLogoUrl: companySnapshot.logoUrl || "",
      offerOptions: version.options || [],
      offerReservations: version.reservations || "",
      offerIncluded: offerTermsSnapshot.included || "",
      offerExcluded: offerTermsSnapshot.excluded || "",
      offerCustomerSupplied: offerTermsSnapshot.customerSupplied || "",
      offerTerms: offerTermsSnapshot.terms || "",
      offerPaymentTerms: offerTermsSnapshot.paymentTerms || "",
      offerValidityDays: String(version.validity_days || 30),
      offerTotal: Number(version.total_ex_vat || 0),
      customer: offer.customer_name,
      email: offer.customer_email,
      phone: offer.customer_phone,
      address: offer.customer_address,
      status: offer.status === "accepted" ? "Akseptert" : "Tilbud",
      statusClass:
        offer.status === "accepted"
          ? "sales-status-accepted"
          : "sales-status-quote",
      nextStep:
        offer.status === "accepted"
          ? "Tilbudet er akseptert"
          : "Digital aksept",
      iconName: offer.status === "accepted" ? "home" : "send",
      sentOfferVersionId: version.id,
      sentOfferVersionNumber: version.version_number,
      publicToken: offer.public_token,
      isPublicOffer: true,
      acceptedBy: offer.accepted_by,
      acceptedAt: offer.accepted_at,
      acceptedPayload: offer.accepted_payload,
    };
  }

  async function publishOfferAndGetLink(requestId) {
    if (!activeSupabase) {
      throw new Error("Supabase-miljøvariabler mangler i Vercel-preview.");
    }

    const request = requests.find((item) => item.id === requestId);

    if (!request || !request.offerLines?.length) {
      throw new Error("Tilbudet mangler prislinjer.");
    }

    const currentLineCount = request.offerLines?.length || 0;
    const currentOptionCount = request.offerOptions?.length || 0;

    if (request.publicToken) {
      const { data: publishedOfferData, error: publishedOfferError } =
        await activeSupabase.rpc("get_sales_offer_by_token", {
          token: request.publicToken,
        });

      if (publishedOfferError) throw publishedOfferError;

      const previousOptions = Array.isArray(publishedOfferData?.version?.options)
        ? publishedOfferData.version.options
        : [];
      const previousOptionCount = previousOptions.length;

      if (previousOptionCount > 0 && currentOptionCount === 0) {
        const confirmed = window.confirm(
          `ADVARSEL: Sist publiserte tilbud hadde ${previousOptionCount} opsjon${
            previousOptionCount === 1 ? "" : "er"
          }, men tilbudet du nå publiserer har 0.\n\nHvis du fortsetter, publiseres en ny tilbudsversjon uten opsjoner.\n\nVil du virkelig fortsette?`
        );

        if (!confirmed) {
          throw new Error(
            "Publisering avbrutt. Kontroller opsjonene i Rediger tilbud."
          );
        }
      }
    }

    const profileForPublish = await getCompanyProfileForPublish();

    const { data, error } = await activeSupabase.rpc("publish_sales_offer", {
      payload: buildPublishPayload(request, profileForPublish),
    });

    if (error) throw error;

    const nextRequests = requests.map((item) =>
      item.id === requestId
        ? {
            ...item,
            salesOfferId: data.offer_id,
            sentOfferVersionId: data.version_id,
            sentOfferVersionNumber: data.version_number,
            publicToken: data.public_token,
            companyName: profileForPublish.companyName || item.companyName || "",
            companyOrgNumber: profileForPublish.orgNumber || item.companyOrgNumber || "",
            companyAddress: profileForPublish.address || item.companyAddress || "",
            companyPhone: profileForPublish.phone || item.companyPhone || "",
            companyEmail: profileForPublish.email || item.companyEmail || "",
            companyWebsite: profileForPublish.website || item.companyWebsite || "",
            companyLogoUrl: profileForPublish.logoUrl || item.companyLogoUrl || "",
            status: "Tilbud",
            statusClass: "sales-status-quote",
            nextStep: "Kundelink er oppdatert",
            lastPublishedLineCount: currentLineCount,
            lastPublishedOptionCount: currentOptionCount,
          }
        : item
    );

    setRequests(nextRequests);
    void persistRequests(nextRequests).catch((error) =>
      alert(error.message || "Kunne ikke lagre publiseringen varig.")
    );

    const link = getCustomerOfferLink(data.public_token);
    setPublishFeedback({
      requestId,
      versionNumber: data.version_number,
      link,
      publishedAt: new Date().toISOString(),
    });

    return link;
  }

  async function openCustomerOfferFromRequestId(requestId) {
    try {
      const link = await publishOfferAndGetLink(requestId);
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert(error.message || "Kunne ikke åpne kundelink.");
    }
  }

  async function copyCustomerOfferLink(requestId) {
    try {
      const link = await publishOfferAndGetLink(requestId);
      await navigator.clipboard.writeText(link);
      setCustomerLinkCopied(true);
      window.setTimeout(() => setCustomerLinkCopied(false), 2200);
    } catch (error) {
      alert(error.message || "Kunne ikke kopiere kundelink.");
    }
  }

  async function loadPublicOfferFromToken(token) {
    if (!activeSupabase) {
      setPublicOfferError("Supabase-miljøvariabler mangler i Vercel-preview.");
      return;
    }

    setPublicOfferLoading(true);
    setPublicOfferError("");

    const { data, error } = await activeSupabase.rpc("get_sales_offer_by_token", {
      token,
    });

    setPublicOfferLoading(false);

    if (error || !data) {
      setPublicOfferError("Tilbudet finnes ikke eller lenken er ugyldig.");
      return;
    }

    const mappedRequest = mapPublicOfferToRequest(data);

    if (!mappedRequest) {
      setPublicOfferError("Tilbudet mangler aktiv tilbudsversjon.");
      return;
    }

    setSelectedRequestId(mappedRequest.id);
    setRequests((current) => {
      const exists = current.some((item) => item.id === mappedRequest.id);
      return exists
        ? current.map((item) =>
            item.id === mappedRequest.id ? { ...item, ...mappedRequest } : item
          )
        : [mappedRequest, ...current];
    });
    setMode("customer-offer");
  }

  async function handleCreateRequest(event) {
    event.preventDefault();

    const nextRequest = {
      id: createRequestId(requests),
      title: form.title,
      customer: form.customer.trim() || "Uten kundenavn",
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim() || "Adresse ikke registrert",
      source: form.source,
      note: form.note.trim(),
      responsible: loggedInResponsible,
      projectResponsible: loggedInResponsible,
      status: "Forespørsel",
      statusClass: "sales-status-new",
      nextStep: "Planlegg befaring",
      iconName: "clipboard",
    };

    const nextRequests = [nextRequest, ...requests];

    setRequests(nextRequests);
    try {
      await persistRequests(nextRequests);
    } catch (error) {
      alert(error.message || "Kunne ikke opprette forespørselen varig.");
      return;
    }
    resetForm();
    setSelectedRequestId(nextRequest.id);
    setMode("detail");
  }

  if (mode === "new") {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button className="sales-back-button" type="button" onClick={goToList}>
              <ArrowLeft size={18} />
              Tilbake
            </button>

            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ClipboardList size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Expo ProffDok</strong>
                <span>Befaring / Tilbud / Aksept</span>
              </div>
            </div>
          </header>

          <main className="sales-main">
            <section className="sales-form-hero">
              <p className="sales-eyebrow">Ny forespørsel</p>
              <h1 className="sales-title">Registrer kundehenvendelse</h1>
              <p className="sales-subtitle">
                Fang opp det viktigste raskt. Resten kan fylles ut etter
                befaring.
              </p>
            </section>

            <form className="sales-form-panel" onSubmit={handleCreateRequest}>
              <div className="sales-form-grid">
                <label className="sales-field">
                  <span>Kundenavn</span>
                  <input
                    value={form.customer}
                    onChange={(event) => updateForm("customer", event.target.value)}
                    placeholder="Ola Nordmann"
                    autoComplete="name"
                    autoFocus
                  />
                </label>

                <label className="sales-field">
                  <span>Telefon</span>
                  <input
                    value={form.phone}
                    onChange={(event) => updateForm("phone", event.target.value)}
                    placeholder="900 00 000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>

                <label className="sales-field">
                  <span>E-post</span>
                  <input
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                    placeholder="kunde@epost.no"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </label>

                <label className="sales-field">
                  <span>Adresse</span>
                  <input
                    value={form.address}
                    onChange={(event) => updateForm("address", event.target.value)}
                    placeholder="Kirkeveien 12"
                    autoComplete="street-address"
                  />
                </label>

                <label className="sales-field">
                  <span>Type arbeid</span>
                  <select
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                  >
                    {workTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sales-field">
                  <span>Forespørselen kom via</span>
                  <select
                    value={form.source}
                    onChange={(event) => updateForm("source", event.target.value)}
                  >
                    {requestSources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sales-field sales-field-full">
                  <span>Kort notat</span>
                  <textarea
                    value={form.note}
                    onChange={(event) => updateForm("note", event.target.value)}
                    placeholder="Kunden ønsker befaring for modernisering av bad. Sluk må vurderes."
                    rows={4}
                  />
                </label>
              </div>

              <div className="sales-form-preview">
                <h2>Oppsummering</h2>

                <div className="sales-preview-lines">
                  <span>
                    <ClipboardList size={16} />
                    {form.title}
                  </span>
                  <span>
                    <MapPin size={16} />
                    {form.address || "Adresse ikke registrert"}
                  </span>
                  <span>
                    <Phone size={16} />
                    {form.phone || "Telefon ikke registrert"}
                  </span>
                  <span>
                    <Mail size={16} />
                    {form.email || "E-post ikke registrert"}
                  </span>
                </div>
              </div>

              <div className="sales-form-actions">
                <button
                  className="sales-secondary-button"
                  type="button"
                  onClick={() => {
                    resetForm();
                    goToList();
                  }}
                >
                  Avbryt
                </button>

                <button className="sales-primary-button" type="submit">
                  <Save size={18} />
                  Lagre forespørsel
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "project-activation" && selectedRequest) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={() => setMode("detail")}
            >
              <ArrowLeft size={18} />
              Tilbake
            </button>

            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ClipboardList size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Expo ProffDok</strong>
                <span>Aktiver som prosjekt</span>
              </div>
            </div>
          </header>

          <main className="sales-main">
            <section className="sales-form-hero">
              <p className="sales-eyebrow">Aktiver som ProffDok-prosjekt</p>
              <h1 className="sales-title">{selectedRequest.title}</h1>
              <p className="sales-subtitle">
                {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
              </p>
            </section>

            <form className="sales-form-panel" onSubmit={handleActivateProject}>
              <div className="sales-form-grid">
                <label className="sales-field">
                  <span>Prosjektnavn</span>
                  <input
                    value={projectForm.projectName}
                    onChange={(event) =>
                      updateProjectForm("projectName", event.target.value)
                    }
                    required
                  />
                </label>

                <label className="sales-field">
                  <span>Prosjektnummer</span>
                  <input
                    value={projectForm.projectNumber}
                    onChange={(event) =>
                      updateProjectForm("projectNumber", event.target.value)
                    }
                    placeholder="Valgfritt prosjektnummer"
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Ansvarlig</span>
                  <input
                    value={projectForm.responsible}
                    onChange={(event) =>
                      updateProjectForm("responsible", event.target.value)
                    }
                    placeholder="Navn på ansvarlig bruker"
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Intern merknad ved aktivering</span>
                  <textarea
                    value={projectForm.note}
                    onChange={(event) => updateProjectForm("note", event.target.value)}
                    rows={4}
                  />
                </label>
              </div>

              <div className="sales-form-preview">
                <h2>Data som skal følge videre</h2>
                <div className="sales-preview-lines">
                  <span>
                    <ClipboardList size={16} />
                    Kunde, adresse, telefon og e-post
                  </span>
                  <span>
                    <CheckCircle2 size={16} />
                    Akseptert tilbud og valgte opsjoner
                  </span>
                  <span>
                    <Plus size={16} />
                    Befaringsnotat og bilder
                  </span>
                  <span>
                    <FileText size={16} />
                    {selectedRequest.contractFile
                      ? `Kontrakt: ${selectedRequest.contractFile.name}`
                      : "Ingen kontrakt lastet opp – kan legges til senere i prosjektet"}
                  </span>
                  <span>
                    <Home size={16} />
                    Vanlig ProffDok-prosjekt opprettes og åpnes direkte
                  </span>
                </div>
              </div>

              <div className="sales-form-actions">
                <button
                  className="sales-secondary-button"
                  type="button"
                  onClick={() => setMode("detail")}
                >
                  Avbryt
                </button>

                <button
                  className="sales-primary-button"
                  type="submit"
                  disabled={projectActivationBusy}
                >
                  <Home size={18} />
                  {projectActivationBusy ? "Oppretter prosjekt …" : "Aktiver som prosjekt"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  if (publicOfferLoading) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-panel">
              <h1 className="sales-title">Laster tilbud</h1>
              <p className="sales-subtitle">Henter digitalt tilbud.</p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (publicOfferError) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-panel">
              <h1 className="sales-title">Lenken virker ikke</h1>
              <p className="sales-subtitle">{publicOfferError}</p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "customer-accepted" && selectedRequest) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-panel">
              <p className="sales-eyebrow">Tilbud akseptert</p>
              <h1 className="sales-title">Takk for aksepten</h1>
              <p className="sales-subtitle">
                Tilbudet er registrert som akseptert av {selectedRequest.acceptedBy}.
              </p>
              <div className="sales-next-card" style={{ marginTop: 22 }}>
                <h2>{selectedRequest.offerTitle}</h2>
                <p>
                  Vi har registrert aksepten digitalt. Utførende bedrift følger
                  opp saken videre.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "customer-offer" && selectedRequest) {
    const offerCompany = {
      companyName:
        selectedRequest.companyName || companyProfile.companyName || "",
      orgNumber:
        selectedRequest.companyOrgNumber || companyProfile.orgNumber || "",
      address:
        selectedRequest.companyAddress || companyProfile.address || "",
      phone:
        selectedRequest.companyPhone || companyProfile.phone || "",
      email:
        selectedRequest.companyEmail || companyProfile.email || "",
      website:
        selectedRequest.companyWebsite || companyProfile.website || "",
      logoUrl:
        selectedRequest.companyLogoUrl || companyProfile.logoUrl || "",
    };
    const activeOfferVersion = getActiveOfferVersion(selectedRequest);
    const offerTotal = activeOfferVersion?.total || selectedRequest.offerTotal || 0;
    const offerTitle = activeOfferVersion?.title || selectedRequest.offerTitle;
    const offerIntro = activeOfferVersion?.intro || selectedRequest.offerIntro;
    const offerLines = getVisibleOfferLines(
      activeOfferVersion?.lines || selectedRequest.offerLines || []
    );
    const offerOptions = activeOfferVersion?.options || selectedRequest.offerOptions || [];
    const offerReservations =
      activeOfferVersion?.reservations || selectedRequest.offerReservations;
    const activeTermsSnapshot = getOfferTermsSnapshot(activeOfferVersion?.lines || []);
    const offerTerms =
      activeTermsSnapshot.terms || selectedRequest.offerTerms || "";
    const offerIncluded =
      activeTermsSnapshot.included || selectedRequest.offerIncluded || "";
    const offerExcluded =
      activeTermsSnapshot.excluded || selectedRequest.offerExcluded || "";
    const offerCustomerSupplied =
      activeTermsSnapshot.customerSupplied ||
      selectedRequest.offerCustomerSupplied ||
      "";
    const offerPaymentTerms =
      activeTermsSnapshot.paymentTerms || selectedRequest.offerPaymentTerms || "";
    const offerValidityDays =
      activeOfferVersion?.validityDays || selectedRequest.offerValidityDays || "30";
    const selectedOptions = offerOptions.filter((option) =>
      acceptanceForm.selectedOptionIds.includes(option.id)
    );
    const selectedOptionsTotal = getOfferTotal(selectedOptions);
    const acceptedTotal = offerTotal + selectedOptionsTotal;

    return (
      <div className="sales-app sales-customer-offer-app">
        <div className="sales-shell sales-customer-shell">
          <header className="sales-header sales-customer-header">
            {!selectedRequest.isPublicOffer ? (
              <button
                className="sales-back-button"
                type="button"
                onClick={() => setMode("detail")}
              >
                <ArrowLeft size={18} />
                Tilbake til intern visning
              </button>
            ) : (
              <div />
            )}

            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ClipboardList size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Expo ProffDok</strong>
                <span>Digitalt tilbud</span>
              </div>
            </div>
          </header>

          <main className="sales-main sales-customer-main">
            <section className="sales-customer-hero">
              <div className="sales-customer-hero-content">
                <p className="sales-eyebrow">Digitalt tilbud</p>
                <h1 className="sales-title sales-customer-title">{offerTitle}</h1>
                <p className="sales-subtitle sales-customer-lead">
                  Her finner du leveransen, prisene og vilkårene samlet. Velg
                  eventuelle opsjoner før du aksepterer tilbudet nederst på siden.
                </p>

                <div className="sales-customer-meta-grid">
                  <div>
                    <span>Kunde</span>
                    <strong>{selectedRequest.customer || "Ikke registrert"}</strong>
                  </div>
                  <div>
                    <span>Arbeidssted</span>
                    <strong>{selectedRequest.address || "Ikke registrert"}</strong>
                  </div>
                  <div>
                    <span>Tilbud nr.</span>
                    <strong>{selectedRequest.id}</strong>
                  </div>
                  <div>
                    <span>Versjon</span>
                    <strong>
                      {selectedRequest.sentOfferVersionNumber
                        ? `v${selectedRequest.sentOfferVersionNumber}`
                        : "Ikke sendt"}
                    </strong>
                  </div>
                  <div>
                    <span>Gyldig i</span>
                    <strong>{offerValidityDays} dager</strong>
                  </div>
                </div>
              </div>

              <aside className="sales-customer-company-card">
                {offerCompany.logoUrl ? (
                  <img
                    className="sales-customer-company-logo"
                    src={offerCompany.logoUrl}
                    alt={offerCompany.companyName || "Bedriftslogo"}
                  />
                ) : (
                  <strong className="sales-customer-company-name">
                    {offerCompany.companyName || "Firmaprofil ikke registrert"}
                  </strong>
                )}

                <span className="sales-customer-company-label">Tilbud fra</span>
                {offerCompany.companyName && offerCompany.logoUrl ? (
                  <strong className="sales-customer-company-name">
                    {offerCompany.companyName}
                  </strong>
                ) : null}

                <div className="sales-customer-company-details">
                  {offerCompany.orgNumber ? (
                    <span>Org.nr. {offerCompany.orgNumber}</span>
                  ) : null}
                  {[offerCompany.address, offerCompany.phone, offerCompany.email]
                    .filter(Boolean)
                    .map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  {offerCompany.website ? (
                    <a
                      href={
                        /^https?:\/\//i.test(offerCompany.website)
                          ? offerCompany.website
                          : `https://${offerCompany.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {offerCompany.website}
                    </a>
                  ) : null}
                </div>
              </aside>
            </section>

            <section className="sales-customer-offer-stack">
              <article className="sales-customer-section sales-customer-intro-card">
                <span className="sales-section-kicker">01</span>
                <div>
                  <h2>Om tilbudet</h2>
                  <p>{offerIntro || "Ingen innledning registrert."}</p>
                </div>
              </article>

              <article className="sales-customer-section">
                <div className="sales-customer-section-heading">
                  <div>
                    <span className="sales-section-kicker">02</span>
                    <h2>Arbeider og priser</h2>
                  </div>
                  <span className="sales-customer-section-note">
                    Alle priser er oppgitt eks. mva. per post.
                  </span>
                </div>

                <div className="sales-customer-lines">
                  {offerLines.map((line, index) => (
                    <div key={line.id} className="sales-customer-line-card">
                      <div className="sales-customer-line-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="sales-customer-line-body">
                        <h3>{line.description}</h3>

                        {line.imageDataUrl || line.productUrl ? (
                          <div className="sales-customer-line-media">
                            {line.imageDataUrl ? (
                              <img
                                src={line.imageDataUrl}
                                alt={line.imageName || line.description || "Produktbilde"}
                              />
                            ) : null}

                            {line.productUrl ? (
                              <a href={line.productUrl} target="_blank" rel="noreferrer">
                                Se produkt / dokumentasjon
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <strong className="sales-customer-line-price">
                        {formatNok(getOfferTotal([line]))}
                        <span>eks. mva.</span>
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="sales-customer-total-card">
                  <div className="sales-customer-total-row">
                    <span>Sum arbeider eks. mva.</span>
                    <strong>{formatNok(offerTotal)}</strong>
                  </div>
                  <div className="sales-customer-total-row sales-customer-total-muted">
                    <span>Mva. 25 %</span>
                    <strong>{formatNok(offerTotal * 0.25)}</strong>
                  </div>
                  {selectedOptionsTotal > 0 ? (
                    <div className="sales-customer-total-row sales-customer-total-muted">
                      <span>Valgte opsjoner eks. mva.</span>
                      <strong>{formatNok(selectedOptionsTotal)}</strong>
                    </div>
                  ) : null}
                  <div className="sales-customer-total-row sales-customer-total-grand">
                    <span>Total inkl. mva.</span>
                    <strong>{formatNok(acceptedTotal * 1.25)}</strong>
                  </div>
                </div>
              </article>

              {offerOptions.length ? (
                <article className="sales-customer-section">
                  <div className="sales-customer-section-heading">
                    <div>
                      <span className="sales-section-kicker">03</span>
                      <h2>Opsjoner</h2>
                    </div>
                    <span className="sales-customer-section-note">
                      Valgte opsjoner legges til totalsummen før aksept.
                    </span>
                  </div>

                  <div className="sales-customer-option-grid">
                    {offerOptions.map((option) => {
                      const isSelected = acceptanceForm.selectedOptionIds.includes(
                        option.id
                      );

                      return (
                        <label
                          className={`sales-customer-option-card ${
                            isSelected ? "sales-customer-option-card-selected" : ""
                          } ${option.imageDataUrl ? "sales-customer-option-card-with-image" : ""}`}
                          key={option.id}
                        >
                          {option.imageDataUrl ? (
                            <img
                              className="sales-customer-option-image"
                              src={option.imageDataUrl}
                              alt={option.imageName || option.title || "Opsjon"}
                            />
                          ) : null}

                          <div className="sales-customer-option-content">
                            <div className="sales-customer-option-topline">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleAcceptedOption(option.id)}
                              />
                              <span className="sales-customer-option-state">
                                {isSelected ? "Valgt" : "Velg opsjon"}
                              </span>
                            </div>

                            <h3>{option.title || "Opsjon"}</h3>
                            {option.description ? <p>{option.description}</p> : null}

                            {option.productUrl ? (
                              <a
                                href={option.productUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) => event.stopPropagation()}
                              >
                                Se produkt / dokumentasjon
                              </a>
                            ) : null}

                            <strong className="sales-customer-option-price">
                              + {formatNok(getOfferTotal([option]))} eks. mva.
                            </strong>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </article>
              ) : null}

              {offerReservations ? (
                <article className="sales-customer-section sales-customer-text-section">
                  <span className="sales-section-kicker">
                    {offerOptions.length ? "04" : "03"}
                  </span>
                  <div>
                    <h2>Forutsetninger og forbehold</h2>
                    <p>{offerReservations}</p>
                  </div>
                </article>
              ) : null}

              {offerIncluded || offerExcluded || offerCustomerSupplied ? (
                <article className="sales-customer-section sales-customer-text-section">
                  <span className="sales-section-kicker">Omfang</span>
                  <div style={{ display: "grid", gap: 20 }}>
                    {offerIncluded ? (
                      <div>
                        <h2>Dette er inkludert</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerIncluded}</p>
                      </div>
                    ) : null}
                    {offerExcluded ? (
                      <div>
                        <h2>Dette er ikke inkludert</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerExcluded}</p>
                      </div>
                    ) : null}
                    {offerCustomerSupplied ? (
                      <div>
                        <h2>Dette sørger kunden for</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerCustomerSupplied}</p>
                      </div>
                    ) : null}
                  </div>
                </article>
              ) : null}

              {offerTerms || offerPaymentTerms ? (
                <article className="sales-customer-section sales-customer-text-section">
                  <span className="sales-section-kicker">
                    {offerTerms && offerPaymentTerms
                      ? "Avtalebetingelser"
                      : offerTerms
                        ? "Vilkår"
                        : "Betaling"}
                  </span>
                  <div style={{ display: "grid", gap: 20 }}>
                    {offerTerms ? (
                      <div>
                        <h2>Vilkår</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerTerms}</p>
                      </div>
                    ) : null}
                    {offerPaymentTerms ? (
                      <div>
                        <h2>Betalingsbetingelser</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerPaymentTerms}</p>
                      </div>
                    ) : null}
                  </div>
                </article>
              ) : null}

              <form onSubmit={handleAcceptOffer} className="sales-customer-accept-form">
                <article className="sales-customer-accept-card">
                  <div className="sales-customer-accept-copy">
                    <span className="sales-next-label">Digital aksept</span>
                    <h2>Aksepter tilbudet</h2>
                    <p>
                      Skriv inn fullt navn og bekreft at du aksepterer tilbudet med
                      arbeider, priser, leveranseomfang, forbehold, vilkår og betalingsbetingelser
                      som vist over.
                    </p>
                  </div>

                  <div className="sales-customer-accept-summary">
                    <div>
                      <span>Total inkl. mva.</span>
                      <strong>{formatNok(acceptedTotal * 1.25)}</strong>
                    </div>
                    {selectedOptions.length ? (
                      <p>
                        Inkluderer {selectedOptions.length} valgt(e) opsjon(er).
                      </p>
                    ) : (
                      <p>Ingen opsjoner er valgt.</p>
                    )}
                  </div>

                  {selectedOptions.length ? (
                    <div className="sales-customer-selected-options">
                      <h3>Valgte opsjoner</h3>
                      <div>
                        {selectedOptions.map((option) => (
                          <span key={option.id}>
                            <Plus size={16} />
                            {option.title}: {formatNok(getOfferTotal([option]))} eks. mva.
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="sales-form-grid sales-customer-accept-fields">
                    <label className="sales-field sales-field-full">
                      <span>Fullt navn</span>
                      <input
                        value={acceptanceForm.name}
                        onChange={(event) =>
                          setAcceptanceForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Fullt navn"
                        required
                      />
                    </label>

                    <label className="sales-acceptance-check sales-field-full">
                      <input
                        type="checkbox"
                        checked={acceptanceForm.confirmed}
                        onChange={(event) =>
                          setAcceptanceForm((current) => ({
                            ...current,
                            confirmed: event.target.checked,
                          }))
                        }
                        required
                      />
                      <span>
                        Jeg aksepterer tilbudet og bekrefter at jeg har lest
                        tilbudets innhold, priser, leveranseomfang, forbehold, vilkår og
                        betalingsbetingelser.
                      </span>
                    </label>
                  </div>

                  <button className="sales-primary-button sales-customer-accept-button" type="submit">
                    <CheckCircle2 size={18} />
                    Aksepter tilbud
                  </button>
                </article>
              </form>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "offer-builder" && selectedRequest) {
    const offerTotal = getOfferTotal(offerForm.lines);

    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={() => setMode("detail")}
            >
              <ArrowLeft size={18} />
              Tilbake
            </button>

            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ClipboardList size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Expo ProffDok</strong>
                <span>Befaring / Tilbud / Aksept</span>
              </div>
            </div>
          </header>

          <main className="sales-main">
            <section className="sales-form-hero">
              <p className="sales-eyebrow">Tilbudsbygger</p>
              <h1 className="sales-title">Opprett tilbud</h1>
              <p className="sales-subtitle">
                {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
              </p>
              <p className="sales-subtitle" style={{ marginTop: 8 }}>
                {offerDraftSaveStatus === "saving"
                  ? "Lagrer tilbudskladden sikkert …"
                  : offerDraftSaveStatus === "saved"
                    ? "Alle poster og priser er lagret sikkert."
                    : offerDraftSaveStatus === "error"
                      ? "Kladden er ikke lagret varig – kontroller nettet før du går videre."
                      : "Kladden mellomlagres automatisk mens du arbeider."}
              </p>
            </section>

            <form
              className="sales-form-panel"
              onSubmit={handleSaveOffer}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.target.tagName === "TEXTAREA") {
                  return;
                }

                if (event.target.closest(".sales-offer-line")) {
                  event.preventDefault();
                }
              }}
            >
              <div className="sales-form-grid">
                {hasInspectionContext(selectedRequest) ? (
                  <div className="sales-field sales-field-full">
                    <span>Befaringsgrunnlag</span>
                    <div className="sales-form-preview">
                      <p className="sales-subtitle" style={{ marginTop: 0 }}>
                        Bruk dette som grunnlag når du beskriver arbeidene. Prisene legges inn manuelt.
                      </p>

                      <div className="sales-detail-lines">
                        {getInspectionContext(selectedRequest).customerWishes ? (
                          <p>
                            <strong>Kundens ønsker:</strong>{" "}
                            {getInspectionContext(selectedRequest).customerWishes}
                          </p>
                        ) : null}

                        {getInspectionContext(selectedRequest).existingConditions ? (
                          <p>
                            <strong>Eksisterende forhold:</strong>{" "}
                            {getInspectionContext(selectedRequest).existingConditions}
                          </p>
                        ) : null}

                        {getInspectionContext(selectedRequest).measurements ? (
                          <p>
                            <strong>Målinger:</strong>{" "}
                            {getInspectionContext(selectedRequest).measurements}
                          </p>
                        ) : null}

                        {getInspectionContext(selectedRequest).observations ? (
                          <p>
                            <strong>Faglige observasjoner:</strong>{" "}
                            {getInspectionContext(selectedRequest).observations}
                          </p>
                        ) : null}
                      </div>

                      {getInspectionContext(selectedRequest).photos?.length ? (
                        <div className="sales-photo-grid" style={{ marginTop: 14 }}>
                          {getInspectionContext(selectedRequest).photos.map((photo) => (
                            <div className="sales-photo-card" key={photo.id}>
                              <img
                                src={photo.dataUrl}
                                alt={photo.name || "Befaringsbilde"}
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        className="sales-secondary-button"
                        onClick={addInspectionContextToOfferIntro}
                        style={{ width: "fit-content", marginTop: 14 }}
                      >
                        <ClipboardList size={18} />
                        Legg befaringsgrunnlag i innledningen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="sales-field sales-field-full">
                    <div className="sales-form-preview">
                      <strong>Ingen lagret befaring funnet</strong>
                      <p className="sales-subtitle" style={{ margin: "6px 0 0" }}>
                        Du kan fortsatt opprette tilbudet manuelt, eller gå tilbake og registrere tekst og bilder fra befaringen først.
                      </p>
                    </div>
                  </div>
                )}

                <label className="sales-field sales-field-full">
                  <span>Tilbudstittel</span>
                  <input
                    value={offerForm.title}
                    onChange={(event) => updateOfferForm("title", event.target.value)}
                    placeholder="Tilbud – Modernisering av bad"
                    required
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Innledning</span>
                  <textarea
                    value={offerForm.intro}
                    onChange={(event) => updateOfferForm("intro", event.target.value)}
                    rows={4}
                  />
                </label>

                <div className="sales-field sales-field-full">
                  <span>Arbeider og priser</span>

                  <div className="sales-offer-lines">
                    {offerForm.lines.map((line, index) => (
                      <div className="sales-offer-line" key={line.id}>
                        <div className="sales-offer-line-number">{index + 1}</div>

                        <div style={{ display: "grid", gap: 10 }}>
                          <input
                            data-offer-line-description={line.id}
                            value={line.description}
                            onChange={(event) =>
                              updateOfferLine(
                                line.id,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Beskrivelse av arbeid"
                          />

                          <input
                            value={line.productUrl || ""}
                            onChange={(event) =>
                              updateOfferLine(line.id, "productUrl", event.target.value)
                            }
                            placeholder="Produktlink, FDV eller inspirasjon – valgfritt"
                            inputMode="url"
                          />

                          {line.imageDataUrl ? (
                            <div className="sales-option-image-preview">
                              <img
                                src={line.imageDataUrl}
                                alt={line.imageName || line.description || "Produktbilde"}
                              />
                              <button
                                className="sales-secondary-button"
                                type="button"
                                onClick={() => removeOfferLineImage(line.id)}
                              >
                                Fjern bilde
                              </button>
                            </div>
                          ) : null}

                          <label className="sales-secondary-button" style={{ width: "fit-content" }}>
                            <Plus size={18} />
                            Legg til bilde
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                handleOfferLineImage(line.id, event)
                              }
                              style={{ display: "none" }}
                            />
                          </label>
                        </div>

                        <input
                          value={line.amount}
                          onChange={(event) =>
                            updateOfferLine(line.id, "amount", event.target.value)
                          }
                          onKeyDown={(event) =>
                            handleOfferLineAmountEnter(event, line, index)
                          }
                          placeholder="Beløp eks. mva."
                          inputMode="decimal"
                        />

                        <button
                          className="sales-secondary-button"
                          type="button"
                          onClick={() => removeOfferLine(line.id)}
                          disabled={offerForm.lines.length === 1}
                        >
                          Fjern
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={addOfferLine}
                    style={{ width: "fit-content", marginTop: 12 }}
                  >
                    <Plus size={18} />
                    Legg til arbeid
                  </button>
                </div>

                <div className="sales-field sales-field-full">
                  <span>Opsjoner</span>

                  {offerForm.options.length ? (
                    <div className="sales-offer-lines">
                      {offerForm.options.map((option, index) => (
                        <div
                          className="sales-offer-line"
                          key={option.id}
                          style={{ alignItems: "start" }}
                        >
                          <div className="sales-offer-line-number">O{index + 1}</div>

                          <div style={{ display: "grid", gap: 10 }}>
                            <input
                              value={option.title}
                              onChange={(event) =>
                                updateOfferOption(option.id, "title", event.target.value)
                              }
                              placeholder="Opsjon, f.eks. Servantpakke"
                            />

                            <input
                              value={option.description}
                              onChange={(event) =>
                                updateOfferOption(
                                  option.id,
                                  "description",
                                  event.target.value
                                )
                              }
                              placeholder="Kort beskrivelse"
                            />

                            <input
                              value={option.productUrl || ""}
                              onChange={(event) =>
                                updateOfferOption(
                                  option.id,
                                  "productUrl",
                                  event.target.value
                                )
                              }
                              placeholder="Produktlink, FDV eller inspirasjon – valgfritt"
                              inputMode="url"
                            />

                            {option.imageDataUrl ? (
                              <div className="sales-option-image-preview">
                                <img
                                  src={option.imageDataUrl}
                                  alt={option.imageName || option.title || "Opsjon"}
                                />
                              </div>
                            ) : null}

                            <label className="sales-secondary-button" style={{ width: "fit-content" }}>
                              <Plus size={18} />
                              Legg til bilde
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                  handleOfferOptionImage(option.id, event)
                                }
                                style={{ display: "none" }}
                              />
                            </label>
                          </div>

                          <input
                            value={option.amount}
                            onChange={(event) =>
                              updateOfferOption(option.id, "amount", event.target.value)
                            }
                            placeholder="Beløp eks. mva."
                            inputMode="decimal"
                          />

                          <button
                            className="sales-secondary-button"
                            type="button"
                            onClick={() => removeOfferOption(option.id)}
                          >
                            Fjern
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="sales-subtitle">
                      Ingen opsjoner lagt til. Opsjoner kan for eksempel være
                      servant, kran, flisoppgradering eller elektrisk gulvvarme.
                    </p>
                  )}

                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={addOfferOption}
                    style={{ width: "fit-content", marginTop: 12 }}
                  >
                    <Plus size={18} />
                    Legg til opsjon
                  </button>
                </div>

                <label className="sales-field sales-field-full">
                  <span>Forutsetninger og forbehold</span>
                  <textarea
                    value={offerForm.reservations}
                    onChange={(event) =>
                      updateOfferForm("reservations", event.target.value)
                    }
                    placeholder="Eksempel: Tilbudet forutsetter at eksisterende konstruksjoner er egnet for planlagte arbeider. Skjulte forhold prises som tillegg etter avtale."
                    rows={5}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Dette er inkludert</span>
                  <textarea
                    value={offerForm.included}
                    onChange={(event) =>
                      updateOfferForm("included", event.target.value)
                    }
                    placeholder="Beskriv arbeidene, materialene og ytelsene som inngår i tilbudssummen."
                    rows={5}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Dette er ikke inkludert</span>
                  <textarea
                    value={offerForm.excluded}
                    onChange={(event) =>
                      updateOfferForm("excluded", event.target.value)
                    }
                    placeholder="Beskriv tydelig hva som ikke inngår i tilbudssummen."
                    rows={5}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Dette sørger kunden for</span>
                  <textarea
                    value={offerForm.customerSupplied}
                    onChange={(event) =>
                      updateOfferForm("customerSupplied", event.target.value)
                    }
                    placeholder="Beskriv hva kunden skal levere, bestille eller klargjøre før og under arbeidet."
                    rows={5}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Vilkår</span>
                  <textarea
                    value={offerForm.terms}
                    onChange={(event) =>
                      updateOfferForm("terms", event.target.value)
                    }
                    placeholder="Skriv inn vilkårene som skal gjelde for dette tilbudet. Teksten fryses i den publiserte tilbudsversjonen."
                    rows={7}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Betalingsbetingelser</span>
                  <textarea
                    value={offerForm.paymentTerms}
                    onChange={(event) =>
                      updateOfferForm("paymentTerms", event.target.value)
                    }
                    placeholder="Eksempel: 10 dager netto. Fakturering etter avtalt betalingsplan."
                    rows={4}
                  />
                </label>

                <label className="sales-field">
                  <span>Tilbudet er gyldig i</span>
                  <select
                    value={offerForm.validityDays}
                    onChange={(event) =>
                      updateOfferForm("validityDays", event.target.value)
                    }
                  >
                    <option value="14">14 dager</option>
                    <option value="30">30 dager</option>
                    <option value="60">60 dager</option>
                    <option value="90">90 dager</option>
                  </select>
                </label>
              </div>

              <div className="sales-form-preview">
                <h2>Tilbudsoppsummering</h2>
                <div className="sales-preview-lines">
                  <span>
                    <ClipboardList size={16} />
                    {offerForm.lines.length} arbeidspost(er)
                  </span>
                  <span>
                    <Send size={16} />
                    Gyldig i {offerForm.validityDays} dager
                  </span>
                  <span>
                    <Plus size={16} />
                    {offerForm.options.length} opsjon(er)
                  </span>
                </div>
                <div className="sales-offer-total">
                  <span>Sum eks. mva.</span>
                  <strong>{formatNok(offerTotal)}</strong>
                </div>
                <div className="sales-offer-total sales-offer-total-muted">
                  <span>Mva. 25 %</span>
                  <strong>{formatNok(offerTotal * 0.25)}</strong>
                </div>
                <div className="sales-offer-total sales-offer-total-grand">
                  <span>Sum inkl. mva.</span>
                  <strong>{formatNok(offerTotal * 1.25)}</strong>
                </div>
              </div>

              <div className="sales-form-actions">
                <button
                  className="sales-secondary-button"
                  type="button"
                  onClick={() => setMode("detail")}
                >
                  Avbryt
                </button>

                <button className="sales-primary-button" type="submit">
                  <Save size={18} />
                  Lagre tilbud
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "inspection-note" && selectedRequest) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={() => setMode("detail")}
            >
              <ArrowLeft size={18} />
              Tilbake
            </button>

            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ClipboardList size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Expo ProffDok</strong>
                <span>Befaring / Tilbud / Aksept</span>
              </div>
            </div>
          </header>

          <main className="sales-main">
            <section className="sales-form-hero">
              <p className="sales-eyebrow">Befaringsnotat</p>
              <h1 className="sales-title">{selectedRequest.title}</h1>
              <p className="sales-subtitle">
                {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
              </p>
            </section>

            <form className="sales-form-panel" onSubmit={handleSaveInspectionNote}>
              {(selectedRequest.note || selectedRequest.surveyDate || selectedRequest.surveyNote) ? (
                <div className="sales-form-preview" style={{ marginTop: 0, marginBottom: 22 }}>
                  <h2>Grunnlag fra saken</h2>
                  <div className="sales-detail-lines">
                    {selectedRequest.note ? (
                      <p><strong>Forespørsel:</strong> {selectedRequest.note}</p>
                    ) : null}
                    {selectedRequest.surveyDate ? (
                      <span>
                        <CalendarDays size={16} />
                        Befaring planlagt {selectedRequest.surveyDate}
                        {selectedRequest.surveyTime ? ` kl. ${selectedRequest.surveyTime}` : ""}
                      </span>
                    ) : null}
                    {selectedRequest.surveyResponsible ? (
                      <span>
                        <CheckCircle2 size={16} />
                        Ansvarlig: {selectedRequest.surveyResponsible}
                      </span>
                    ) : null}
                    {selectedRequest.surveyNote ? (
                      <p><strong>Intern merknad:</strong> {selectedRequest.surveyNote}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="sales-form-grid">
                <label className="sales-field sales-field-full">
                  <span>Kundens ønsker</span>
                  <textarea
                    value={inspectionForm.customerWishes}
                    onChange={(event) =>
                      updateInspectionForm("customerWishes", event.target.value)
                    }
                    placeholder="Hva ønsker kunden utført? Beskriv løsninger, uttrykk og viktige prioriteringer."
                    rows={5}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Eksisterende forhold</span>
                  <textarea
                    value={inspectionForm.existingConditions}
                    onChange={(event) =>
                      updateInspectionForm("existingConditions", event.target.value)
                    }
                    placeholder="Beskriv eksisterende bad, underlag, sluk, fall, rørføringer og andre synlige forhold."
                    rows={5}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Målinger</span>
                  <textarea
                    value={inspectionForm.measurements}
                    onChange={(event) =>
                      updateInspectionForm("measurements", event.target.value)
                    }
                    placeholder="Eksempel: Rom 2,40 x 2,15 m. Takhøyde 2,42 m. Sluk 82 cm fra vegg."
                    rows={4}
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Faglige observasjoner</span>
                  <textarea
                    value={inspectionForm.observations}
                    onChange={(event) =>
                      updateInspectionForm("observations", event.target.value)
                    }
                    placeholder="Forhold som må vurderes, avklares eller tas med videre i tilbudet."
                    rows={5}
                  />
                </label>

                <div className="sales-field sales-field-full">
                  <span>Bilder fra befaring</span>
                  <label className="sales-secondary-button" style={{ width: "fit-content" }}>
                    <Plus size={18} />
                    Ta bilde eller velg bilder
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handleInspectionPhotos}
                      style={{ display: "none" }}
                    />
                  </label>

                  {inspectionForm.photos.length ? (
                    <div className="sales-photo-grid">
                      {inspectionForm.photos.map((photo) => (
                        <div className="sales-photo-card" key={photo.id}>
                          <img src={photo.dataUrl} alt={photo.name || "Befaringsbilde"} />
                          <button
                            type="button"
                            className="sales-secondary-button"
                            onClick={() => removeInspectionPhoto(photo.id)}
                          >
                            Fjern
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="sales-subtitle">Ingen bilder registrert ennå.</p>
                  )}
                </div>
              </div>

              <div className="sales-form-preview">
                <h2>Oppsummering fra befaring</h2>
                <div className="sales-preview-lines">
                  <span>
                    <ClipboardList size={16} />
                    {inspectionForm.customerWishes
                      ? "Kundens ønsker registrert"
                      : "Kundens ønsker ikke registrert"}
                  </span>
                  <span>
                    <CheckCircle2 size={16} />
                    {inspectionForm.existingConditions
                      ? "Eksisterende forhold registrert"
                      : "Eksisterende forhold ikke registrert"}
                  </span>
                  <span>
                    <MapPin size={16} />
                    {inspectionForm.measurements
                      ? "Målinger registrert"
                      : "Målinger ikke registrert"}
                  </span>
                  <span>
                    <Plus size={16} />
                    {inspectionForm.photos.length} bilde(r)
                  </span>
                </div>
              </div>

              <div className="sales-form-actions">
                <button
                  className="sales-secondary-button"
                  type="button"
                  onClick={() => setMode("detail")}
                >
                  Avbryt
                </button>

                <button className="sales-primary-button" type="submit">
                  <Save size={18} />
                  Lagre befaringsnotat
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "survey-plan" && selectedRequest) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button
              className="sales-back-button"
              type="button"
              onClick={() => setMode("detail")}
            >
              <ArrowLeft size={18} />
              Tilbake
            </button>

            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ClipboardList size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Expo ProffDok</strong>
                <span>Befaring / Tilbud / Aksept</span>
              </div>
            </div>
          </header>

          <main className="sales-main">
            <section className="sales-form-hero">
              <p className="sales-eyebrow">Planlegg befaring</p>
              <h1 className="sales-title">{selectedRequest.title}</h1>
              <p className="sales-subtitle">
                {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
              </p>
            </section>

            <form className="sales-form-panel" onSubmit={handleSaveSurveyPlan}>
              <div className="sales-form-grid">
                <label className="sales-field">
                  <span>Dato</span>
                  <input
                    type="date"
                    value={surveyForm.date}
                    onChange={(event) => updateSurveyForm("date", event.target.value)}
                    required
                  />
                </label>

                <label className="sales-field">
                  <span>Tidspunkt</span>
                  <input
                    type="time"
                    value={surveyForm.time}
                    onChange={(event) => updateSurveyForm("time", event.target.value)}
                    required
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Ansvarlig</span>
                  <input
                    value={surveyForm.responsible}
                    onChange={(event) =>
                      updateSurveyForm("responsible", event.target.value)
                    }
                    placeholder="Navn på ansvarlig bruker"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="sales-field sales-field-full">
                  <span>Intern merknad</span>
                  <textarea
                    value={surveyForm.note}
                    onChange={(event) => updateSurveyForm("note", event.target.value)}
                    placeholder="Eksempel: Avklar parkering. Kunde ønsker vurdering av sluk og fall."
                    rows={4}
                  />
                </label>
              </div>

              <div className="sales-form-preview">
                <h2>Befaringsplan</h2>
                <div className="sales-preview-lines">
                  <span>
                    <CalendarDays size={16} />
                    {surveyForm.date || "Dato ikke valgt"}
                  </span>
                  <span>
                    <ClipboardList size={16} />
                    {surveyForm.time || "Tidspunkt ikke valgt"}
                  </span>
                  <span>
                    <CheckCircle2 size={16} />
                    {surveyForm.responsible || "Ansvarlig ikke valgt"}
                  </span>
                  <span>
                    <MapPin size={16} />
                    {selectedRequest.address}
                  </span>
                </div>
              </div>

              <div className="sales-form-actions">
                <button
                  className="sales-secondary-button"
                  type="button"
                  onClick={() => setMode("detail")}
                >
                  Avbryt
                </button>

                <button className="sales-primary-button" type="submit">
                  <Save size={18} />
                  Lagre befaringsplan
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "detail" && selectedRequest) {
    const workflowSteps = getWorkflowSteps(selectedRequest);
    const hasPublishedCustomerOffer = Boolean(
      selectedRequest.publicToken ||
        selectedRequest.salesOfferId ||
        selectedRequest.sentOfferVersionId ||
        selectedRequest.sentOfferVersionNumber
    );
    const hasUnpublishedOfferChanges = Boolean(
      selectedRequest.status === "Tilbud" &&
        selectedRequest.offerLines?.length &&
        !selectedRequest.sentOfferVersionId
    );
    const customerOfferActionLabel = hasUnpublishedOfferChanges
      ? hasPublishedCustomerOffer
        ? "Publiser ny versjon"
        : "Publiser kundetilbud"
      : "Vis kundens tilbud";
    const publishLineCount = selectedRequest.offerLines?.length || 0;
    const publishOptionCount = selectedRequest.offerOptions?.length || 0;
    const publishedVersionNumber =
      publishFeedback?.requestId === selectedRequest.id
        ? Number(publishFeedback.versionNumber) || 0
        : Number(selectedRequest.sentOfferVersionNumber) || 0;
    const hasInspectionContent = Boolean(
      selectedRequest.inspectionCustomerWishes ||
        selectedRequest.inspectionExistingConditions ||
        selectedRequest.inspectionMeasurements ||
        selectedRequest.inspectionObservations ||
        selectedRequest.inspectionPhotos?.length
    );
    const nextStepTitle = (() => {
      if (selectedRequest.status === "Forespørsel") return "Planlegg befaring";
      if (selectedRequest.status === "Befaring" && selectedRequest.nextStep === "Opprett tilbud") return "Opprett tilbud";
      if (selectedRequest.status === "Befaring") return "Fullfør befaringsnotat";
      if (selectedRequest.status === "Tilbud" && hasUnpublishedOfferChanges) {
        return hasPublishedCustomerOffer ? "Oppdater kundens tilbud" : "Publiser kundetilbud";
      }
      if (selectedRequest.status === "Tilbud") return "Kundetilbud er publisert";
      if (selectedRequest.status === "Akseptert") return "Klar for prosjektaktivering";
      if (selectedRequest.status === "Aktivert") return "Prosjekt aktivert";
      return selectedRequest.nextStep || "Neste steg";
    })();
    const nextStepHelp = (() => {
      if (selectedRequest.status === "Forespørsel") {
        return "Start med å sette dato, tidspunkt og ansvarlig. Saken flyttes da videre til Befaring.";
      }
      if (selectedRequest.status === "Befaring" && selectedRequest.nextStep === "Opprett tilbud") {
        return "Befaringen er registrert. Neste naturlige steg er å bygge tilbudet fra samme sak.";
      }
      if (selectedRequest.status === "Befaring") {
        return "Registrer kundens ønsker, eksisterende forhold, målinger, observasjoner og bilder.";
      }
      if (selectedRequest.status === "Tilbud" && hasUnpublishedOfferChanges) {
        return "Tilbudet er endret internt. Kunden ser ikke endringene før du publiserer en ny versjon av kundetilbudet.";
      }
      if (selectedRequest.status === "Tilbud") {
        return "Kundelinken er klar. Kunden kan åpne tilbudet, velge opsjoner og akseptere digitalt.";
      }
      if (selectedRequest.status === "Akseptert") {
        return "Kunden har akseptert tilbudet. Akseptert innhold låses i denne flyten før senere prosjektaktivering.";
      }
      if (selectedRequest.status === "Aktivert") {
        return "Saken er markert som aktivert i preview. Endelig integrasjon mot aktiv ProffDok-app skal gjøres kontrollert senere.";
      }
      return "Følg neste tydelige handling i saken.";
    })();

    return (
      <div className="sales-app">
        <div className="sales-shell">
          <header className="sales-header">
            <button className="sales-back-button" type="button" onClick={goToList}>
              <ArrowLeft size={18} />
              Tilbake
            </button>

            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ClipboardList size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>Expo ProffDok</strong>
                <span>Befaring / Tilbud / Aksept</span>
              </div>
            </div>
          </header>

          <main className="sales-main">
            <section className="sales-detail-hero">
              <div>
                <span className={`sales-status ${selectedRequest.statusClass}`}>
                  {selectedRequest.status}
                </span>
                <h1 className="sales-title">{selectedRequest.title}</h1>
                <p className="sales-subtitle">
                  {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
                </p>
              </div>

              <div className="sales-hero-actions">
                {selectedRequest.surveyDate &&
                !["Akseptert", "Aktivert"].includes(selectedRequest.status) ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={() => openOutlookCalendar(selectedRequest)}
                  >
                    <CalendarDays size={18} />
                    Legg til i Outlook
                  </button>
                ) : null}

                {selectedRequest.status === "Tilbud" ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={openInspectionNote}
                  >
                    <Ruler size={18} />
                    Befaringsnotat
                  </button>
                ) : null}

                {selectedRequest.status === "Tilbud" ? (
                  <button
                    className="sales-secondary-button"
                    type="button"
                    onClick={openOfferBuilder}
                  >
                    <ClipboardList size={18} />
                    Rediger tilbud
                  </button>
                ) : null}

                <button
                  className="sales-primary-button"
                  type="button"
                  onClick={
                    selectedRequest.status === "Forespørsel"
                      ? openSurveyPlanning
                      : selectedRequest.status === "Befaring" &&
                          selectedRequest.nextStep === "Opprett tilbud"
                        ? openOfferBuilder
                        : selectedRequest.status === "Befaring"
                          ? openInspectionNote
                          : selectedRequest.status === "Tilbud"
                            ? openCustomerOfferPreview
                            : selectedRequest.status === "Akseptert"
                              ? openProjectActivation
                              : selectedRequest.status === "Aktivert" && selectedRequest.projectId
                                ? () => window.location.assign(
                                    `${window.location.pathname}?project=${encodeURIComponent(selectedRequest.projectId)}&access=admin&tab=prosjekt`
                                  )
                                : undefined
                  }
                >
                  <CalendarDays size={18} />
                  {selectedRequest.status === "Tilbud"
                    ? customerOfferActionLabel
                    : selectedRequest.status === "Akseptert"
                      ? "Aktiver som prosjekt"
                      : selectedRequest.nextStep}
                </button>
              </div>
            </section>

            <section className="sales-workflow" aria-label="Arbeidsflyt">
              {workflowSteps.map((step) => (
                <div className={`sales-workflow-step sales-workflow-${step.state}`} key={step.label}>
                  <span className="sales-workflow-dot">
                    {step.state === "done" ? <CheckCircle2 size={16} /> : null}
                  </span>
                  <span>{step.label}</span>
                </div>
              ))}
            </section>

            <section className="sales-detail-grid">
              <article className="sales-detail-card">
                <h2>Kunde</h2>
                <div className="sales-detail-lines">
                  <span>{selectedRequest.customer}</span>
                  <span>
                    <Phone size={16} />
                    {selectedRequest.phone || "Telefon ikke registrert"}
                  </span>
                  <span>
                    <Mail size={16} />
                    {selectedRequest.email || "E-post ikke registrert"}
                  </span>
                </div>
              </article>

              <article className="sales-detail-card">
                <h2>Sted og opprinnelse</h2>
                <div className="sales-detail-lines">
                  <span>
                    <MapPin size={16} />
                    {selectedRequest.address}
                  </span>
                  <span>
                    <ClipboardList size={16} />
                    Kom via {selectedRequest.source || "ikke registrert"}
                  </span>
                </div>
              </article>

              <article className="sales-detail-card sales-detail-card-wide">
                <h2>Notat</h2>
                <p>{selectedRequest.note || "Ingen notat registrert ennå."}</p>
              </article>

              <article className="sales-next-card sales-detail-card-wide">
                <span className="sales-next-label">Neste steg</span>
                <h2>{nextStepTitle}</h2>
                <p style={{ marginBottom: 16 }}>{nextStepHelp}</p>
                {selectedRequest.status === "Tilbud" ? (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: "14px 16px",
                      border: "1px solid #d7e4ea",
                      borderRadius: 16,
                      background: "#f8fbfc",
                      fontWeight: 700,
                      lineHeight: 1.5,
                    }}
                  >
                    Tilbudslinjer: {publishLineCount} · Opsjoner:{" "}
                    {publishOptionCount} ·{" "}
                    {hasUnpublishedOfferChanges
                      ? publishedVersionNumber
                        ? `Neste publisering oppretter ny versjon etter v${publishedVersionNumber}`
                        : "Neste publisering oppretter ny tilbudsversjon"
                      : publishedVersionNumber
                        ? `Publisert versjon v${publishedVersionNumber}`
                        : "Ikke publisert"}
                  </div>
                ) : null}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  {selectedRequest.status === "Forespørsel" ? (
                    <button className="sales-primary-button" type="button" onClick={openSurveyPlanning}>
                      <CalendarDays size={18} />
                      Planlegg befaring
                    </button>
                  ) : null}

                  {selectedRequest.status === "Befaring" ? (
                    <button
                      className="sales-primary-button"
                      type="button"
                      onClick={selectedRequest.nextStep === "Opprett tilbud" ? openOfferBuilder : openInspectionNote}
                    >
                      {selectedRequest.nextStep === "Opprett tilbud" ? <ClipboardList size={18} /> : <Ruler size={18} />}
                      {selectedRequest.nextStep === "Opprett tilbud" ? "Opprett tilbud" : "Fullfør befaringsnotat"}
                    </button>
                  ) : null}

                  {selectedRequest.status === "Tilbud" ? (
                    <>
                      <button
                        className={hasUnpublishedOfferChanges ? "sales-primary-button" : "sales-secondary-button"}
                        type="button"
                        onClick={() => openCustomerOfferFromRequestId(selectedRequest.id)}
                      >
                        <Send size={18} />
                        {customerOfferActionLabel}
                      </button>
                      <button className="sales-secondary-button" type="button" onClick={openOfferBuilder}>
                        <ClipboardList size={18} />
                        Rediger tilbud
                      </button>
                      <button className="sales-secondary-button" type="button" onClick={openInspectionNote}>
                        <Ruler size={18} />
                        {hasInspectionContent ? "Se befaringsnotat" : "Legg til befaringsnotat"}
                      </button>
                    </>
                  ) : null}

                  {selectedRequest.status === "Akseptert" ? (
                    <button className="sales-primary-button" type="button" onClick={openProjectActivation}>
                      <Home size={18} />
                      Aktiver som prosjekt
                    </button>
                  ) : null}
                </div>
                {selectedRequest.status === "Aktivert" &&
                selectedRequest.projectActivatedAt ? (
                  <div className="sales-detail-lines">
                    <span>
                      <Home size={16} />
                      Aktivert som prosjekt: {selectedRequest.projectName}
                    </span>
                    {selectedRequest.projectNumber ? (
                      <span>
                        <ClipboardList size={16} />
                        Prosjektnummer: {selectedRequest.projectNumber}
                      </span>
                    ) : null}
                    {selectedRequest.projectResponsible ? (
                      <span>
                        <CheckCircle2 size={16} />
                        Ansvarlig: {selectedRequest.projectResponsible}
                      </span>
                    ) : null}
                    <p>
                      Aktivert{" "}
                      {new Date(selectedRequest.projectActivatedAt).toLocaleString(
                        "nb-NO"
                      )}.
                    </p>
                    <p>Prosjektet er opprettet i den ordinære ProffDok-prosjektlisten.</p>
                  </div>
                ) : selectedRequest.status === "Akseptert" &&
                selectedRequest.acceptedBy ? (
                  <div className="sales-detail-lines">
                    <span>
                      <CheckCircle2 size={16} />
                      Akseptert av {selectedRequest.acceptedBy}
                    </span>
                    <p>
                      Digital aksept registrert{" "}
                      {new Date(selectedRequest.acceptedAt).toLocaleString("nb-NO")}.
                    </p>
                    {selectedRequest.acceptedOfferVersionNumber ? (
                      <p>
                        Aksepten gjelder tilbudsversjon v
                        {selectedRequest.acceptedOfferVersionNumber}.
                      </p>
                    ) : null}
                    {(selectedRequest.acceptedOfferLines?.length ||
                      selectedRequest.offerLines?.length) ? (
                      <div style={{ marginTop: 14 }}>
                        <p><strong>Aksepterte arbeider og priser:</strong></p>
                        <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
                          {(
                            selectedRequest.acceptedOfferLines ||
                            selectedRequest.offerLines ||
                            []
                          ).map((line, index) => (
                            <div
                              key={line.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "28px 1fr minmax(140px, auto)",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              <ClipboardList size={16} />
                              <div>
                                <span>
                                  {index + 1}. {line.description}
                                </span>
                                {line.imageDataUrl || line.productUrl ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 10,
                                      alignItems: "center",
                                      marginTop: 8,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {line.imageDataUrl ? (
                                      <img
                                        src={line.imageDataUrl}
                                        alt={line.imageName || line.description || "Produktbilde"}
                                        style={{
                                          width: 72,
                                          height: 72,
                                          objectFit: "cover",
                                          borderRadius: 10,
                                          border: "1px solid #d7e4ea",
                                        }}
                                      />
                                    ) : null}
                                    {line.productUrl ? (
                                      <a
                                        href={line.productUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Se produkt / dokumentasjon
                                      </a>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                              <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                {formatNok(getOfferTotal([line]))} eks. mva.
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedRequest.acceptedOptions?.length ? (
                      <div style={{ marginTop: 18 }}>
                        <p><strong>Valgte opsjoner:</strong></p>
                        <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
                          {selectedRequest.acceptedOptions.map((option) => (
                            <div
                              key={option.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "28px 1fr minmax(140px, auto)",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              <Plus size={16} />
                              <div>
                                <span>{option.title || "Opsjon"}</span>
                                {option.description ? (
                                  <p style={{ margin: "4px 0 0" }}>{option.description}</p>
                                ) : null}
                                {option.imageDataUrl || option.productUrl ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 10,
                                      alignItems: "center",
                                      marginTop: 8,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {option.imageDataUrl ? (
                                      <img
                                        src={option.imageDataUrl}
                                        alt={option.imageName || option.title || "Opsjon"}
                                        style={{
                                          width: 72,
                                          height: 72,
                                          objectFit: "cover",
                                          borderRadius: 10,
                                          border: "1px solid #d7e4ea",
                                        }}
                                      />
                                    ) : null}
                                    {option.productUrl ? (
                                      <a
                                        href={option.productUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Se produkt / dokumentasjon
                                      </a>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                              <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                {formatNok(getOfferTotal([option]))} eks. mva.
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {selectedRequest.acceptedTotal ? (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop: "1px solid #d7e4ea",
                          maxWidth: 430,
                          marginLeft: "auto",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr minmax(130px, auto)",
                            gap: 18,
                            alignItems: "center",
                          }}
                        >
                          <span>Akseptert sum eks. mva.</span>
                          <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {formatNok(selectedRequest.acceptedTotal)}
                          </strong>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr minmax(130px, auto)",
                            gap: 18,
                            alignItems: "center",
                            marginTop: 6,
                          }}
                        >
                          <span>Akseptert sum inkl. mva.</span>
                          <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {formatNok(selectedRequest.acceptedTotal * 1.25)}
                          </strong>
                        </div>
                      </div>
                    ) : null}
                    <div
                      style={{
                        marginTop: 20,
                        padding: 18,
                        border: "1px solid #b9d9df",
                        borderRadius: 16,
                        background: "#f2fafb",
                      }}
                    >
                      <p style={{ margin: "0 0 6px" }}>
                        <strong>Låst akseptbevis</strong>
                      </p>
                      <p style={{ margin: "0 0 14px" }}>
                        PDF-en dokumenterer tilbudsversjonen, aksepttidspunktet,
                        akseptert total, valgte opsjoner og alle avtalebetingelser.
                      </p>
                      {selectedRequest.acceptanceProofFile?.url ? (
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <a
                            className="sales-primary-button"
                            href={selectedRequest.acceptanceProofFile.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText size={18} />
                            Åpne akseptbevis
                          </a>
                          <span style={{ color: "#42606b", fontWeight: 700 }}>
                            Låst dokument - følger automatisk med til prosjektet.
                          </span>
                        </div>
                      ) : (
                        <button
                          className="sales-primary-button"
                          type="button"
                          onClick={handleCreateAcceptanceProof}
                          disabled={acceptanceProofBusy}
                        >
                          <FileText size={18} />
                          {acceptanceProofBusy ? "Oppretter akseptbevis …" : "Opprett akseptbevis"}
                        </button>
                      )}
                      {acceptanceProofError ? (
                        <p style={{ margin: "12px 0 0", color: "#a83232", fontWeight: 700 }}>
                          {acceptanceProofError}
                        </p>
                      ) : null}
                    </div>
                    <div
                      style={{
                        marginTop: 20,
                        padding: 18,
                        border: "1px solid #d7e4ea",
                        borderRadius: 16,
                        background: "#f8fbfc",
                      }}
                    >
                      <p style={{ margin: "0 0 6px" }}>
                        <strong>Kontrakt</strong>
                      </p>
                      <p style={{ margin: "0 0 14px" }}>
                        Håndverksbedriften kan laste opp sin egen ferdigstilte kontrakt.
                        Sluttkunden skal kontrollere og signere kontrakten etter bedriftens
                        vanlige rutiner.
                      </p>
                      {selectedRequest.contractFile ? (
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <a
                            className="sales-secondary-button"
                            href={selectedRequest.contractFile.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText size={18} />
                            Åpne {selectedRequest.contractFile.name || "kontrakt"}
                          </a>
                          <button
                            className="sales-secondary-button"
                            type="button"
                            onClick={handleRemoveContract}
                            disabled={contractUploadBusy}
                          >
                            <Trash2 size={18} />
                            Fjern kontrakt
                          </button>
                          <span style={{ color: "#42606b", fontWeight: 700 }}>
                            Kontrakten følger automatisk med til ProffDok-prosjektet.
                          </span>
                        </div>
                      ) : (
                        <label
                          className="sales-secondary-button"
                          style={{ display: "inline-flex", cursor: contractUploadBusy ? "wait" : "pointer" }}
                        >
                          <Upload size={18} />
                          {contractUploadBusy ? "Laster opp kontrakt …" : "Last opp egen kontrakt"}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleContractUpload}
                            disabled={contractUploadBusy}
                            style={{ display: "none" }}
                          />
                        </label>
                      )}
                      {contractUploadError ? (
                        <p style={{ margin: "12px 0 0", color: "#a83232", fontWeight: 700 }}>
                          {contractUploadError}
                        </p>
                      ) : null}
                    </div>
                    <p>
                      Neste steg er å aktivere saken som et vanlig ProffDok-prosjekt.
                    </p>
                    <p>
                      Aksepten er låst i denne arbeidsflyten. Eventuelle endringer
                      skal senere håndteres som revidert tilbud / ny tilbudsversjon,
                      ikke ved å overskrive akseptert tilbud.
                    </p>
                  </div>
                ) : selectedRequest.status === "Tilbud" &&
                selectedRequest.offerLines?.length ? (
                  <div className="sales-detail-lines">
                    <p><strong>{selectedRequest.offerTitle}</strong></p>

                    <div
                      style={{
                        marginTop: 14,
                        marginBottom: 16,
                        padding: 14,
                        border: "1px solid #d7e4ea",
                        borderRadius: 16,
                        background: "#f8fbfc",
                      }}
                    >
                      <p style={{ marginBottom: 10 }}>
                        <strong>
                          {hasUnpublishedOfferChanges
                            ? hasPublishedCustomerOffer
                              ? "Revidert tilbud klart for publisering:"
                              : "Kundetilbud klart for publisering:"
                            : "Kundelink:"}
                        </strong>{" "}
                        {hasUnpublishedOfferChanges
                          ? "Publiser for å lage en ny tilbudsversjon på kundelinken. Kunden ser ikke endringene før dette er gjort."
                          : "Kunden åpner tilbudet via egen lenke og kan velge opsjoner og akseptere digitalt."}
                      </p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          className={
                            hasUnpublishedOfferChanges
                              ? "sales-primary-button"
                              : "sales-secondary-button"
                          }
                          type="button"
                          onClick={() =>
                            openCustomerOfferFromRequestId(selectedRequest.id)
                          }
                        >
                          <Send size={18} />
                          {hasUnpublishedOfferChanges
                            ? hasPublishedCustomerOffer
                              ? "Publiser ny versjon"
                              : "Publiser kundetilbud"
                            : "Åpne kundelink"}
                        </button>
                        <button
                          className="sales-secondary-button"
                          type="button"
                          onClick={() => copyCustomerOfferLink(selectedRequest.id)}
                        >
                          <ClipboardList size={18} />
                          {customerLinkCopied
                            ? "Kopiert"
                            : hasUnpublishedOfferChanges
                              ? "Publiser og kopier lenke"
                              : "Kopier kundelink"}
                        </button>
                      </div>

                      {publishFeedback?.requestId === selectedRequest.id ? (
                        <div
                          style={{
                            marginTop: 14,
                            padding: "14px 16px",
                            border: "1px solid #8be4e8",
                            borderRadius: 16,
                            background: "#e9fafb",
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: 900, color: "#087b82" }}>
                            Ny tilbudsversjon er publisert
                          </p>
                          <p style={{ margin: "5px 0 0" }}>
                            Kundelinken er oppdatert.
                            {publishFeedback.versionNumber
                              ? ` Versjon v${publishFeedback.versionNumber} er nå tilgjengelig for kunden.`
                              : " Nyeste tilbud er nå tilgjengelig for kunden."}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        maxWidth: 720,
                      }}
                    >
                      {selectedRequest.offerLines.map((line, index) => (
                        <div
                          key={line.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "28px 1fr minmax(140px, auto)",
                            gap: 10,
                            alignItems: "start",
                          }}
                        >
                          <ClipboardList size={16} />
                          <span>
                            {index + 1}. {line.description}
                          </span>
                          <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {formatNok(getOfferTotal([line]))} eks. mva.
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 14,
                        borderTop: "1px solid #d7e4ea",
                        maxWidth: 430,
                        marginLeft: "auto",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr minmax(130px, auto)",
                          gap: 18,
                          alignItems: "center",
                        }}
                      >
                        <span>Sum eks. mva.</span>
                        <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {formatNok(selectedRequest.offerTotal || 0)}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr minmax(130px, auto)",
                          gap: 18,
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        <span>Sum inkl. mva.</span>
                        <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {formatNok((selectedRequest.offerTotal || 0) * 1.25)}
                        </strong>
                      </div>
                    </div>

                    {selectedRequest.offerOptions?.length ? (
                      <p>
                        <strong>Opsjoner:</strong>{" "}
                        {selectedRequest.offerOptions.length} opsjon(er) registrert.
                        Kunden velger opsjoner i kundevisningen før aksept.
                      </p>
                    ) : null}
                  </div>
                ) : selectedRequest.inspectionCustomerWishes ||
                selectedRequest.inspectionExistingConditions ||
                selectedRequest.inspectionMeasurements ||
                selectedRequest.inspectionObservations ||
                selectedRequest.inspectionPhotos?.length ? (
                  <div className="sales-detail-lines">
                    {selectedRequest.inspectionCustomerWishes ? (
                      <p><strong>Kundens ønsker:</strong> {selectedRequest.inspectionCustomerWishes}</p>
                    ) : null}
                    {selectedRequest.inspectionExistingConditions ? (
                      <p><strong>Eksisterende forhold:</strong> {selectedRequest.inspectionExistingConditions}</p>
                    ) : null}
                    {selectedRequest.inspectionMeasurements ? (
                      <p><strong>Målinger:</strong> {selectedRequest.inspectionMeasurements}</p>
                    ) : null}
                    {selectedRequest.inspectionObservations ? (
                      <p><strong>Faglige observasjoner:</strong> {selectedRequest.inspectionObservations}</p>
                    ) : null}
                    {(selectedRequest.inspectionPhotos || []).length ? (
                      <div style={{ marginTop: 10 }}>
                        <strong>
                          {(selectedRequest.inspectionPhotos || []).length} befaringsbilde(r)
                        </strong>
                        <div
                          className="sales-photo-grid"
                          style={{ marginTop: 10 }}
                          aria-label="Befaringsbilder"
                        >
                          {(selectedRequest.inspectionPhotos || []).map((photo, index) => (
                            <button
                              key={photo.id || photo.path || index}
                              type="button"
                              className="sales-photo-card"
                              onClick={() => setSelectedInspectionPhoto(photo)}
                              disabled={!photo.dataUrl}
                              aria-label={`Åpne befaringsbilde ${index + 1} i stor visning`}
                              style={{
                                padding: 0,
                                border: "1px solid #d7e4ea",
                                borderRadius: 14,
                                overflow: "hidden",
                                cursor: photo.dataUrl ? "zoom-in" : "not-allowed",
                                background: "#f8fbfc",
                              }}
                            >
                              {photo.dataUrl ? (
                                <img
                                  src={photo.dataUrl}
                                  alt={photo.name || `Befaringsbilde ${index + 1}`}
                                  loading="lazy"
                                  style={{ display: "block", width: "100%", height: 150, objectFit: "cover" }}
                                />
                              ) : (
                                <span style={{ display: "grid", minHeight: 120, placeItems: "center", padding: 12 }}>
                                  Bildet kunne ikke lastes inn
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="sales-subtitle" style={{ margin: "8px 0 0" }}>
                          Trykk på et bilde for å se det i stor størrelse.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : selectedRequest.status === "Befaring" &&
                  selectedRequest.surveyDate ? (
                  <div className="sales-detail-lines">
                    <span>
                      <CalendarDays size={16} />
                      {selectedRequest.surveyDate} kl. {selectedRequest.surveyTime}
                    </span>
                    <span>
                      <CheckCircle2 size={16} />
                      Ansvarlig: {selectedRequest.surveyResponsible}
                    </span>
                    {selectedRequest.surveyNote ? (
                      <p>{selectedRequest.surveyNote}</p>
                    ) : null}
                  </div>
                ) : (
                  <p>
                    Registrer dato, tidspunkt, ansvarlig og en kort intern merknad.
                    Når planen lagres flyttes saken til Befaring.
                  </p>
                )}
              </article>
            </section>
          </main>
        </div>
        {selectedInspectionPhoto?.dataUrl ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Befaringsbilde i stor visning"
            onClick={() => setSelectedInspectionPhoto(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "grid",
              placeItems: "center",
              padding: 20,
              background: "rgba(5, 19, 27, 0.88)",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedInspectionPhoto(null)}
              aria-label="Lukk bilde"
              style={{
                position: "fixed",
                top: 16,
                right: 16,
                width: 44,
                height: 44,
                border: 0,
                borderRadius: 999,
                background: "#ffffff",
                color: "#132733",
                fontSize: 28,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <img
              src={selectedInspectionPhoto.dataUrl}
              alt={selectedInspectionPhoto.name || "Befaringsbilde"}
              onClick={(event) => event.stopPropagation()}
              style={{
                display: "block",
                maxWidth: "min(1200px, 96vw)",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 14,
                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.38)",
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="sales-app">
      <div className="sales-shell">
        <header className="sales-header">
          <div className="sales-brand">
            <div className="sales-brand-mark">
              <ClipboardList size={22} />
            </div>
            <div className="sales-brand-copy">
              <strong>Expo ProffDok</strong>
              <span>Befaring / Tilbud / Aksept</span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <section className="sales-hero">
            <div>
              <h1 className="sales-title">Forespørsler</h1>
              <p className="sales-subtitle">
                Samle kundehenvendelser, befaring, tilbud og aksept før jobben
                aktiveres som et vanlig ProffDok-prosjekt.
              </p>
            </div>

            <button
              className="sales-primary-button"
              type="button"
              onClick={() => setMode("new")}
            >
              <Plus size={19} />
              Ny forespørsel
            </button>
          </section>

          <section className="sales-summary-grid" aria-label="Oversikt">
            {summary.map((item) => (
              <article className="sales-summary-card" key={item.label}>
                <span className="sales-summary-label">{item.label}</span>
                <strong className="sales-summary-value">{item.value}</strong>
              </article>
            ))}
          </section>

          <section className="sales-panel">
            <div className="sales-panel-header">
              <div>
                <h2 className="sales-panel-title">Aktive forespørsler</h2>
              </div>
            </div>

            <div className="sales-request-list">
              {requests.map((request) => {
                const Icon = iconMap[request.iconName] || ClipboardList;

                return (
                  <button
                    className="sales-request-card"
                    key={request.id}
                    type="button"
                    onClick={() => {
                      setSelectedRequestId(request.id);
                      setMode("detail");
                    }}
                  >
                    <div className="sales-request-main">
                      <h3 className="sales-request-title">{request.title}</h3>
                      <p className="sales-request-customer">
                        {request.customer} · {request.address} · {request.id}
                      </p>
                    </div>

                    <div className="sales-request-next">
                      <span className="sales-next-label">Neste steg</span>
                      <span className="sales-next-step">
                        <Icon size={16} />
                        {request.nextStep}
                      </span>
                    </div>

                    <span className={`sales-status ${request.statusClass}`}>
                      {request.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
