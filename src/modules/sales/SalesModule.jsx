// FASE 19.4C HOTFIX BEFARINGSNOTAT BLANKSIDE: Definerer manglende lydopptak-state/ref-er slik at Befaringsnotat ikke krasjer. Ingen SQL/main/CSS/Edge.
// FASE 19.4A IPHONE-KLAR LYDNOTAT BEFARING: Legger til trygg lydopptak/lydfil på befaringsnotat med iPhone-fallback via lydfilinput. Ingen AI/transkripsjon/SQL/main/Edge.
// FASE 19.1 PREMIUM DIGITALT KUNDETILBUD: Polerer offentlig kundevisning med tydeligere hero, metadata, prislinjer, opsjonskort og akseptfelt. Kun SalesModule/sales.css i feature/befaring-tilbud. Ingen SQL/main/Edge Function.
// FASE 19.3 TYDELIG PUBLISERINGSBEKREFTELSE: Viser tydelig intern bekreftelse når kundelink/ny tilbudsversjon er publisert. Ingen SQL/main/Edge.
// FASE 19.2 TRYGG REPUBLISERING: Tydeliggjør når redigert tilbud/opsjon må publiseres som ny kundelenke-versjon. Ingen SQL/main/Edge.
// FASE 19.4B TILGANG BEFARINGSNOTAT FRA TILBUD: Viser trygg knapp for Befaringsnotat/lydnotat også i tilbudssak uten å endre tilbudsstatus ved lagring. Ingen SQL/main/CSS/Edge.
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
  Mail,
  MapPin,
  Phone,
  Plus,
  Mic,
  Square,
  Ruler,
  Save,
  Send,
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

function loadRequests() {
  try {
    const storedRequests = window.localStorage.getItem(STORAGE_KEY);

    if (!storedRequests) return initialRequests;

    const parsedRequests = JSON.parse(storedRequests);

    if (!Array.isArray(parsedRequests)) return initialRequests;

    return parsedRequests;
  } catch {
    return initialRequests;
  }
}

function saveRequests(requests) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
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

function getVisibleOfferLines(lines = []) {
  return Array.isArray(lines) ? lines.filter((line) => !line?.__companyMeta) : [];
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

export default function SalesModule() {
  const [requests, setRequests] = useState(loadRequests);
  const [mode, setMode] = useState("list");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
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
    audioNotes: [],
  });
  const [inspectionRecordingState, setInspectionRecordingState] = useState("idle");
  const [inspectionRecordingError, setInspectionRecordingError] = useState("");
  const inspectionRecorderRef = useRef(null);
  const inspectionAudioStreamRef = useRef(null);
  const inspectionAudioChunksRef = useRef([]);
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
    validityDays: "30",
  });
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
  const [customerLinkCopied, setCustomerLinkCopied] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState(null);
  const [publicOfferLoading, setPublicOfferLoading] = useState(false);
  const [publicOfferError, setPublicOfferError] = useState("");
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

  async function fetchCompanyProfile() {
    if (!supabase) return null;

    const { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData?.session?.user || null;

    if (!user) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user || null;
    }

    if (!user?.id) return null;

    const profileSelect =
      "company_name,org_number,address,phone,email,website,logo_url";

    let { data, error } = await supabase
      .from("profiles")
      .select(profileSelect)
      .eq("id", user.id)
      .maybeSingle();

    if (error) return null;

    let nextProfile = data ? normalizeCompanyProfile(data, user.email || "") : null;

    if (!hasCompanyProfile(nextProfile) && user.email) {
      const fallback = await supabase
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

    const { data: subscription } = supabase?.auth?.onAuthStateChange?.(
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
    window.history.replaceState({}, "", window.location.pathname);
    // Kun første lasting av offentlig kundelink i isolert preview.
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
    setProjectForm({
      projectName:
        selectedRequest?.projectName ||
        selectedRequest?.title ||
        "Nytt ProffDok-prosjekt",
      projectNumber: selectedRequest?.projectNumber || "",
      responsible: selectedRequest?.projectResponsible || "",
      note:
        selectedRequest?.projectNote ||
        "Opprettes fra akseptert tilbud i Befaring / Tilbud / Aksept.",
    });
    setMode("project-activation");
  }

  function updateProjectForm(field, value) {
    setProjectForm((current) => ({ ...current, [field]: value }));
  }

  function handleActivateProject(event) {
    event.preventDefault();

    const activatedAt = new Date().toISOString();

    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            projectName: projectForm.projectName.trim(),
            projectNumber: projectForm.projectNumber.trim(),
            projectResponsible: projectForm.responsible.trim(),
            projectNote: projectForm.note.trim(),
            projectActivatedAt: activatedAt,
            status: "Aktivert",
            statusClass: "sales-status-accepted",
            nextStep: "Åpne ProffDok-prosjekt",
            iconName: "home",
          }
        : request
    );

    setRequests(nextRequests);
    saveRequests(nextRequests);
    setPublishFeedback(null);
    setCustomerLinkCopied(false);
    setMode("detail");
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
      if (!supabase) {
        alert("Supabase-miljøvariabler mangler i Vercel-preview.");
        return;
      }

      const { error } = await supabase.rpc("accept_sales_offer", {
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
    saveRequests(nextRequests);
    setMode(selectedRequest.isPublicOffer ? "customer-accepted" : "detail");
  }

  function openOfferBuilder() {
    setOfferForm({
      title: selectedRequest?.offerTitle || `Tilbud – ${selectedRequest?.title || ""}`,
      intro:
        selectedRequest?.offerIntro ||
        `Vi viser til befaring og tilbyr med dette følgende arbeider for ${selectedRequest?.customer || "kunden"}.`,
      lines:
        selectedRequest?.offerLines?.length
          ? selectedRequest.offerLines
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
      options: selectedRequest?.offerOptions?.length
        ? selectedRequest.offerOptions
        : [],
      reservations: selectedRequest?.offerReservations || "",
      validityDays: selectedRequest?.offerValidityDays || "30",
    });
    setMode("offer-builder");
  }

  function updateOfferForm(field, value) {
    setOfferForm((current) => ({ ...current, [field]: value }));
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

  function handleSaveOffer(event) {
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
    saveRequests(nextRequests);
    setMode("detail");
  }

  function openInspectionNote() {
    setInspectionForm({
      customerWishes: selectedRequest?.inspectionCustomerWishes || "",
      existingConditions: selectedRequest?.inspectionExistingConditions || "",
      measurements: selectedRequest?.inspectionMeasurements || "",
      observations: selectedRequest?.inspectionObservations || "",
      photos: selectedRequest?.inspectionPhotos || [],
      audioNotes: selectedRequest?.inspectionAudioNotes || [],
    });
    setMode("inspection-note");
  }

  function updateInspectionForm(field, value) {
    setInspectionForm((current) => ({ ...current, [field]: value }));
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

  function addInspectionAudioNoteFromBlob(blob, fallbackName = "Befaringslyd") {
    if (!blob) return;

    const maxAudioSizeBytes = 8 * 1024 * 1024;
    if (blob.size > maxAudioSizeBytes) {
      alert("Lydnotatet er for stort for denne previewen. Hold opptaket kortere, eller vent til serverlagring er på plass.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setInspectionForm((current) => ({
        ...current,
        audioNotes: [
          ...(current.audioNotes || []),
          {
            id: `${Date.now()}-${Math.random()}`,
            name: fallbackName,
            dataUrl: reader.result,
            type: blob.type || "audio/webm",
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    };
    reader.readAsDataURL(blob);
  }

  function handleInspectionAudioFiles(event) {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      addInspectionAudioNoteFromBlob(file, file.name || "Befaringslyd");
    });

    event.target.value = "";
  }

  async function startInspectionAudioRecording() {
    setInspectionRecordingError("");

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setInspectionRecordingError(
        "Direkte opptak støttes ikke i denne nettleseren. Bruk knappen Ta opp / velg lydfil – den fungerer som iPhone-fallback."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      inspectionAudioChunksRef.current = [];
      inspectionAudioStreamRef.current = stream;
      inspectionRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size) inspectionAudioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(inspectionAudioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        inspectionAudioChunksRef.current = [];
        addInspectionAudioNoteFromBlob(blob, `Befaringslyd ${new Date().toLocaleString("nb-NO")}`);
        inspectionAudioStreamRef.current?.getTracks?.().forEach((track) => track.stop());
        inspectionAudioStreamRef.current = null;
        inspectionRecorderRef.current = null;
        setInspectionRecordingState("idle");
      };

      recorder.start();
      setInspectionRecordingState("recording");
    } catch (error) {
      setInspectionRecordingError(
        "Mikrofonen kunne ikke startes. På iPhone kan du bruke Ta opp / velg lydfil i stedet."
      );
      inspectionAudioStreamRef.current?.getTracks?.().forEach((track) => track.stop());
      inspectionAudioStreamRef.current = null;
      inspectionRecorderRef.current = null;
      setInspectionRecordingState("idle");
    }
  }

  function stopInspectionAudioRecording() {
    const recorder = inspectionRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    inspectionAudioStreamRef.current?.getTracks?.().forEach((track) => track.stop());
    inspectionAudioStreamRef.current = null;
    inspectionRecorderRef.current = null;
    setInspectionRecordingState("idle");
  }

  function removeInspectionAudioNote(audioId) {
    setInspectionForm((current) => ({
      ...current,
      audioNotes: (current.audioNotes || []).filter((audio) => audio.id !== audioId),
    }));
  }

  function handleSaveInspectionNote(event) {
    event.preventDefault();

    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            inspectionCustomerWishes: inspectionForm.customerWishes.trim(),
            inspectionExistingConditions: inspectionForm.existingConditions.trim(),
            inspectionMeasurements: inspectionForm.measurements.trim(),
            inspectionObservations: inspectionForm.observations.trim(),
            inspectionPhotos: inspectionForm.photos,
            inspectionAudioNotes: inspectionForm.audioNotes || [],
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
    saveRequests(nextRequests);
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
      responsible: selectedRequest?.surveyResponsible || "",
      note: selectedRequest?.surveyNote || "",
    });
    setMode("survey-plan");
  }

  function updateSurveyForm(field, value) {
    setSurveyForm((current) => ({ ...current, [field]: value }));
  }

  function handleSaveSurveyPlan(event) {
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
    saveRequests(nextRequests);
    setMode("detail");
  }

  function getCustomerOfferLink(token) {
    const url = new URL(window.location.href);
    url.search = "";
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
    if (!supabase) {
      throw new Error("Supabase-miljøvariabler mangler i Vercel-preview.");
    }

    const request = requests.find((item) => item.id === requestId);

    if (!request || !request.offerLines?.length) {
      throw new Error("Tilbudet mangler prislinjer.");
    }

    const profileForPublish = await getCompanyProfileForPublish();

    const { data, error } = await supabase.rpc("publish_sales_offer", {
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
          }
        : item
    );

    setRequests(nextRequests);
    saveRequests(nextRequests);

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
    if (!supabase) {
      setPublicOfferError("Supabase-miljøvariabler mangler i Vercel-preview.");
      return;
    }

    setPublicOfferLoading(true);
    setPublicOfferError("");

    const { data, error } = await supabase.rpc("get_sales_offer_by_token", {
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

  function handleCreateRequest(event) {
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
      status: "Forespørsel",
      statusClass: "sales-status-new",
      nextStep: "Planlegg befaring",
      iconName: "clipboard",
    };

    const nextRequests = [nextRequest, ...requests];

    setRequests(nextRequests);
    saveRequests(nextRequests);
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
                    placeholder="Valgfritt i prototype"
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
                    <Home size={16} />
                    Vanlig ProffDok-prosjekt opprettes senere i Supabase
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
                  <Home size={18} />
                  Aktiver som prosjekt
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
                  Et oversiktlig tilbud for arbeidene under. Velg eventuelle opsjoner
                  og aksepter digitalt nederst på siden.
                </p>

                <div className="sales-customer-meta-grid">
                  <div>
                    <span>Kunde</span>
                    <strong>{selectedRequest.customer || "Ikke registrert"}</strong>
                  </div>
                  <div>
                    <span>Prosjektadresse</span>
                    <strong>{selectedRequest.address || "Ikke registrert"}</strong>
                  </div>
                  <div>
                    <span>Tilbudsnummer</span>
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
                    <span>Gyldighet</span>
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

              <form onSubmit={handleAcceptOffer} className="sales-customer-accept-form">
                <article className="sales-customer-accept-card">
                  <div className="sales-customer-accept-copy">
                    <span className="sales-next-label">Digital aksept</span>
                    <h2>Aksepter tilbudet</h2>
                    <p>
                      Skriv inn fullt navn og bekreft at du aksepterer tilbudet med
                      arbeider, priser, forutsetninger og forbehold som vist over.
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
                        tilbudets innhold, priser, forutsetninger og forbehold.
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
                  <span>Lydnotat fra befaring</span>
                  <p className="sales-subtitle" style={{ marginTop: 0 }}>
                    Ta korte lydnotater på befaring. Dette er ikke AI-transkripsjon ennå; lyd lagres først som kontrollerbart vedlegg i previewen.
                  </p>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {inspectionRecordingState === "recording" ? (
                      <button
                        className="sales-secondary-button"
                        type="button"
                        onClick={stopInspectionAudioRecording}
                        style={{ width: "fit-content" }}
                      >
                        <Square size={18} />
                        Stopp opptak
                      </button>
                    ) : (
                      <button
                        className="sales-secondary-button"
                        type="button"
                        onClick={startInspectionAudioRecording}
                        style={{ width: "fit-content" }}
                      >
                        <Mic size={18} />
                        Start opptak
                      </button>
                    )}

                    <label className="sales-secondary-button" style={{ width: "fit-content" }}>
                      <Plus size={18} />
                      Ta opp / velg lydfil
                      <input
                        type="file"
                        accept="audio/*"
                        capture
                        onChange={handleInspectionAudioFiles}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  {inspectionRecordingError ? (
                    <p className="sales-subtitle" style={{ marginTop: 10 }}>
                      {inspectionRecordingError}
                    </p>
                  ) : null}

                  {(inspectionForm.audioNotes || []).length ? (
                    <div className="sales-photo-grid">
                      {(inspectionForm.audioNotes || []).map((audio) => (
                        <div className="sales-photo-card" key={audio.id}>
                          <div style={{ padding: 12 }}>
                            <strong style={{ display: "block", marginBottom: 8 }}>
                              {audio.name || "Befaringslyd"}
                            </strong>
                            <audio controls src={audio.dataUrl} style={{ width: "100%" }} />
                            {audio.createdAt ? (
                              <p className="sales-subtitle" style={{ marginTop: 8 }}>
                                Lagret {new Date(audio.createdAt).toLocaleString("nb-NO")}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className="sales-secondary-button"
                            onClick={() => removeInspectionAudioNote(audio.id)}
                          >
                            Fjern
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="sales-subtitle">Ingen lydnotater registrert ennå.</p>
                  )}
                </div>

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
                    <Mic size={16} />
                    {(inspectionForm.audioNotes || []).length} lydnotat(er)
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
                    Befaringsnotat / lydnotat
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
                <h2>{selectedRequest.nextStep}</h2>
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
                    <p>
                      Dette er fortsatt en prototype. Endelig prosjektopprettelse
                      skal senere kobles kontrollert mot eksisterende ProffDok-prosjekter
                      i Supabase.
                    </p>
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
                selectedRequest.inspectionAudioNotes?.length ? (
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
                    <span>
                      <Mic size={16} />
                      {(selectedRequest.inspectionAudioNotes || []).length} lydnotat(er)
                    </span>
                    <span>
                      <Plus size={16} />
                      {(selectedRequest.inspectionPhotos || []).length} befaringsbilde(r)
                    </span>
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
