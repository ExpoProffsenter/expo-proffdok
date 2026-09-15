// Expo ProffDok – FASE 42L
// Oppretter og tilbakestiller en liten, deterministisk demosuite i valgt arbeidsprofil.
// Bruker eksisterende RLS/tabeller. Ingen ekte kundesak kan slettes: prosjektrydding
// krever både eksakt DEMO42L requestRef i prosjektet og matchende demo-markør på Sales-raden.
// Tilbudsgrunnlaget kopieres read-only fra den kanoniske Ringside-malen «Tilbud – Andreas Bad».

import { getMyWorkProfileState } from "../access/workProfileClient.js";
import { buildAcceptedOfferProgressActivities } from "../progress/progressPlanOfferCore.js";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";
import {
  DEMO_REQUEST_REFS,
  DEMO_SUITE_KEY,
  assertDemoOperator,
  isDemoProjectData,
  isDemoRequest,
  isDemoRequestRef,
} from "./demoCaseSafety.js";

const DEMO_CUSTOMER = "Demo Kunde – ikke ekte";
const DEMO_ADDRESS = "Demoveien 42";
const DEMO_POSTNR = "0001";
const DEMO_CITY = "Oslo";
const DEMO_PHONE = "900 00 000";
const DEMO_TITLE = "DEMO – Badrenovering";
const DEMO_NOTE = "Kun demo/test. Ingen ekte kunde eller ordre.";
const DEMO_TEMPLATE_NAME = "Tilbud – Andreas Bad";
const DEMO_TEMPLATE_COMPANY_NAME = "Ringside Rørleggerbedrift AS";
const DEMO_OPTION_IMAGE = "/auth-bathroom.jpg";

function isoDateOffset(days = 0) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function isoTimeOffset(minutes = 0) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function displayName(user = {}) {
  return String(
    user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Systemadmin"
  ).trim();
}

function fallbackOfferLines() {
  return [
    {
      id: "demo-line-tildekking",
      mainPostId: "tildekking",
      mainPostTitle: "Tildekking",
      lineType: "work",
      description: "Tildekking og støvbeskyttelse av adkomst",
      internalProductNumber: "",
      amount: "12500",
      productUrl: "",
      imageDataUrl: "",
      imageName: "",
      attachmentFile: null,
    },
    {
      id: "demo-line-riving",
      mainPostId: "demontering-riving",
      mainPostTitle: "Demontering og riving",
      lineType: "work",
      description: "Demontering av eksisterende bad og bortkjøring",
      internalProductNumber: "",
      amount: "28500",
      productUrl: "",
      imageDataUrl: "",
      imageName: "",
      attachmentFile: null,
    },
    {
      id: "demo-line-membran",
      mainPostId: "membran",
      mainPostTitle: "Membran",
      lineType: "work",
      description: "Komplett godkjent våtromssystem med membran",
      internalProductNumber: "",
      amount: "38500",
      productUrl: "",
      imageDataUrl: "",
      imageName: "",
      attachmentFile: null,
    },
    {
      id: "demo-line-flis",
      mainPostId: "flislegging",
      mainPostTitle: "Flislegging",
      lineType: "work",
      description: "Flislegging av gulv og vegger",
      internalProductNumber: "",
      amount: "56000",
      productUrl: "",
      imageDataUrl: "",
      imageName: "",
      attachmentFile: null,
    },
    {
      id: "demo-line-ror",
      mainPostId: "rorlegger",
      mainPostTitle: "Rørlegger",
      lineType: "work",
      description: "Rørleggerarbeider for komplett bad",
      internalProductNumber: "",
      amount: "48500",
      productUrl: "",
      imageDataUrl: "",
      imageName: "",
      attachmentFile: null,
    },
    {
      id: "demo-line-elektro",
      mainPostId: "elektriker",
      mainPostTitle: "Elektriker",
      lineType: "work",
      description: "Elektriske arbeider med gulvvarme og belysning",
      internalProductNumber: "",
      amount: "32000",
      productUrl: "",
      imageDataUrl: "",
      imageName: "",
      attachmentFile: null,
    },
  ];
}

function fallbackOfferOptions() {
  return [
    {
      id: "demo-option-nisje",
      mainPostId: "flislegging",
      mainPostTitle: "Flislegging",
      optionType: "addition",
      replacementLineId: "",
      title: "Flislagt nisje i dusjsone",
      description: "Tillegg for én innfelt nisje.",
      internalProductNumber: "",
      amount: "8500",
      productUrl: "",
      imageDataUrl: DEMO_OPTION_IMAGE,
      imageName: "Demo – eksempel på opsjon med bilde",
      attachmentFile: null,
    },
  ];
}

function cloneJson(value, fallback) {
  try {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function parseMoney(value) {
  const raw = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/,-$/, "")
    .replace(/kr/gi, "")
    .replace(/[^0-9,.-]/g, "");
  if (!raw) return 0;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function itemTotal(item = {}) {
  const quantityRaw = String(item?.quantity ?? "").trim().replace(",", ".");
  const quantity = Number(quantityRaw);
  const multiplier = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  return parseMoney(item?.amount) * multiplier;
}

function offerTotal(items = []) {
  return (Array.isArray(items) ? items : []).reduce(
    (sum, item) => sum + itemTotal(item),
    0
  );
}

function decorateDemoOptionImage(options = []) {
  const next = cloneJson(options, []);
  if (!next.length) return fallbackOfferOptions();
  const preferredIndex = next.findIndex((option) =>
    /nisje|håndkle|handkle|downlight|spot/i.test(
      `${option?.title || ""} ${option?.description || ""}`
    )
  );
  const index = preferredIndex >= 0 ? preferredIndex : 0;
  next[index] = {
    ...next[index],
    imageDataUrl: next[index]?.imageDataUrl || DEMO_OPTION_IMAGE,
    imageName: next[index]?.imageName || "Demo – opsjon med bilde",
  };
  return next;
}

function normalizeTemplatePayload(payload = null) {
  const source = payload && typeof payload === "object" ? cloneJson(payload, {}) : {};
  const lines = Array.isArray(source.lines) && source.lines.length
    ? source.lines
    : fallbackOfferLines();
  const options = decorateDemoOptionImage(
    Array.isArray(source.options) ? source.options : fallbackOfferOptions()
  );
  return {
    sourceTemplateName: source.demoSourceTemplateName || DEMO_TEMPLATE_NAME,
    lines,
    options,
    intro:
      source.intro ||
      source.offerIntro ||
      "Dette er et demonstrasjonstilbud som viser hvordan et ordinært våtromstilbud bygges opp i Expo ProffDok.",
    reservations:
      source.reservations ||
      source.offerReservations ||
      "Forbehold om skjulte forhold som ikke kan avdekkes før riving.",
    included:
      source.included ||
      source.offerIncluded ||
      "Arbeider og materiell som fremgår av tilbudslinjene.",
    excluded:
      source.excluded ||
      source.offerExcluded ||
      "Møbler og sanitærutstyr utover det som er særskilt beskrevet.",
    customerSupplied:
      source.customerSupplied || source.offerCustomerSupplied || "Ingen kundeleveranser i denne demosaken.",
    terms:
      source.terms ||
      source.offerTerms ||
      "Arbeid utføres etter gjeldende krav og produsentanvisninger.",
    paymentTerms: source.paymentTerms || source.offerPaymentTerms || "10 dager netto",
    validityDays: String(source.validityDays || source.offerValidityDays || "30"),
  };
}

function selectDemoAcceptedOptions(options = []) {
  const preferred = ["nisje", "håndkle", "handkle", "downlight", "spot"];
  const selected = [];
  for (const keyword of preferred) {
    const match = options.find(
      (option) =>
        !selected.includes(option) &&
        option?.optionType !== "alternative" &&
        `${option?.title || ""} ${option?.description || ""}`.toLowerCase().includes(keyword)
    );
    if (match) selected.push(match);
    if (selected.length >= 3) break;
  }
  if (selected.length < 2) {
    for (const option of options) {
      if (selected.includes(option) || option?.optionType === "alternative") continue;
      selected.push(option);
      if (selected.length >= 3) break;
    }
  }
  return cloneJson(selected, []);
}

function demoBase({ requestRef, stage, userName, userEmail }) {
  return {
    id: requestRef,
    title: DEMO_TITLE,
    customer: DEMO_CUSTOMER,
    phone: DEMO_PHONE,
    email: userEmail || "",
    address: DEMO_ADDRESS,
    postnr: DEMO_POSTNR,
    city: DEMO_CITY,
    source: "Demo/Test",
    note: DEMO_NOTE,
    responsible: userName,
    projectResponsible: userName,
    demoCase: true,
    demoSuiteKey: DEMO_SUITE_KEY,
    demoStage: stage,
    demoLabel: "DEMO / TEST",
  };
}

function offerPayload(base, offerSource) {
  return {
    ...base,
    demoSourceTemplateName: offerSource.sourceTemplateName,
    offerTitle: "DEMO – Komplett badrenovering",
    offerIntro: offerSource.intro,
    offerLines: cloneJson(offerSource.lines, []),
    offerOptions: cloneJson(offerSource.options, []),
    offerReservations: offerSource.reservations,
    offerIncluded: offerSource.included,
    offerExcluded: offerSource.excluded,
    offerCustomerSupplied: offerSource.customerSupplied,
    offerTerms: offerSource.terms,
    offerPaymentTerms: offerSource.paymentTerms,
    offerValidityDays: offerSource.validityDays,
    offerTotal: offerTotal(offerSource.lines),
    offerDraftSavedAt: new Date().toISOString(),
  };
}

function buildDemoPayloads({ userName, userEmail, offerSource }) {
  const tomorrow = isoDateOffset(1);
  const acceptedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const acceptedOptions = selectDemoAcceptedOptions(offerSource.options);
  const acceptedTotal = offerTotal(offerSource.lines) + offerTotal(acceptedOptions);

  const request = {
    ...demoBase({
      requestRef: DEMO_REQUEST_REFS.request,
      stage: "request",
      userName,
      userEmail,
    }),
    status: "Forespørsel",
    statusClass: "sales-status-new",
    nextStep: "Planlegg befaring",
    iconName: "clipboard",
  };

  const survey = {
    ...demoBase({
      requestRef: DEMO_REQUEST_REFS.survey,
      stage: "survey",
      userName,
      userEmail,
    }),
    surveyDate: tomorrow,
    surveyTime: "10:00",
    surveyResponsible: userName,
    surveyNote: "Demo: Kunde ønsker gjennomgang av planløsning, sluk og materialvalg.",
    inspectionCustomerWishes: "Nytt, komplett bad med stor dusjsone, vegghengt WC og innfelt nisje.",
    inspectionExistingConditions: "Eksisterende bad fra 1990-tallet. Overflater og tekniske føringer skal fornyes.",
    inspectionMeasurements: "Ca. 5,8 m² gulvareal. Takhøyde ca. 2,4 m.",
    inspectionObservations: "Tilkomst er god. Badskisse kan tegnes live i demoen. Endelig kontroll av underlag gjøres etter riving.",
    inspectionPhotos: [],
    status: "Befaring",
    statusClass: "sales-status-survey",
    nextStep: "Fullfør befaringsnotat",
    iconName: "ruler",
  };

  const offer = {
    ...offerPayload(
      demoBase({
        requestRef: DEMO_REQUEST_REFS.offer,
        stage: "offer",
        userName,
        userEmail,
      }),
      offerSource
    ),
    surveyDate: tomorrow,
    surveyTime: "10:00",
    surveyResponsible: userName,
    inspectionCustomerWishes: survey.inspectionCustomerWishes,
    inspectionExistingConditions: "Eksisterende bad skal totalrenoveres.",
    inspectionMeasurements: survey.inspectionMeasurements,
    inspectionObservations: `Tilbudet er klargjort for demo fra firmamalen «${offerSource.sourceTemplateName}».`,
    inspectionPhotos: [],
    status: "Tilbud",
    statusClass: "sales-status-quote",
    nextStep: "Rediger tilbud",
    iconName: "send",
  };

  const accepted = {
    ...offerPayload(
      demoBase({
        requestRef: DEMO_REQUEST_REFS.accepted,
        stage: "accepted",
        userName,
        userEmail,
      }),
      offerSource
    ),
    surveyDate: tomorrow,
    surveyTime: "10:00",
    surveyResponsible: userName,
    inspectionCustomerWishes: survey.inspectionCustomerWishes,
    inspectionExistingConditions: "Eksisterende bad skal totalrenoveres.",
    inspectionMeasurements: survey.inspectionMeasurements,
    inspectionObservations: "Demosaken er klargjort for prosjektaktivering.",
    inspectionPhotos: [],
    acceptedBy: DEMO_CUSTOMER,
    acceptedAt,
    acceptedOfferVersionId: "",
    acceptedOfferVersionNumber: 1,
    acceptedOfferLines: cloneJson(offerSource.lines, []),
    acceptedOptionIds: acceptedOptions.map((option) => option?.id).filter(Boolean),
    acceptedOptions,
    acceptedTotal,
    acceptedPayload: {
      demo: true,
      selected_options: cloneJson(acceptedOptions, []),
      version_snapshot: {
        demo: true,
        version_number: 1,
        lines: cloneJson(offerSource.lines, []),
        options: cloneJson(offerSource.options, []),
      },
    },
    acceptedOfferTitle: "DEMO – Komplett badrenovering",
    acceptedOfferIntro: offerSource.intro,
    acceptedOfferReservations: offerSource.reservations,
    acceptedOfferIncluded: offerSource.included,
    acceptedOfferExcluded: offerSource.excluded,
    acceptedOfferCustomerSupplied: offerSource.customerSupplied,
    acceptedOfferTerms: offerSource.terms,
    acceptedOfferPaymentTerms: offerSource.paymentTerms,
    status: "Akseptert",
    statusClass: "sales-status-accepted",
    nextStep: "Aktiver som prosjekt",
    iconName: "home",
    publicToken: "",
    sentOfferVersionId: null,
    sentOfferVersionNumber: null,
    acceptanceProofFile: null,
    contractFile: null,
    projectId: "",
    projectActivatedAt: "",
  };

  return { request, survey, offer, accepted, acceptedOptions };
}

function buildDemoProgressPlan(offerSource, acceptedOptions) {
  const baseActivities = buildAcceptedOfferProgressActivities({
    lines: offerSource.lines,
    selectedOptions: acceptedOptions,
    idFactory: (() => {
      let index = 0;
      return () => `demo-progress-${String(++index).padStart(2, "0")}`;
    })(),
  });
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  const activities = baseActivities.map((activity, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index * 2);
    const dateValue = date.toISOString().slice(0, 10);
    return {
      ...activity,
      status: index === 0 ? "Ferdig" : index === 1 ? "Pågår" : "Ikke startet",
      resource: index === 1 ? "Demo fagansvarlig" : "",
      sessions:
        index < 4
          ? [
              {
                id: `demo-session-${index + 1}`,
                date: dateValue,
                startTime: "08:00",
                endTime: "16:00",
                note:
                  index === 0
                    ? "Demo: arbeidsøkt hentet fra tilbudsgrunnlaget."
                    : "Demo: tidspunkt kan flyttes eller suppleres.",
              },
            ]
          : [],
    };
  });
  return {
    version: 1,
    activities,
    source: {
      type: "accepted-offer-testcopy",
      demo: true,
      templateName: offerSource.sourceTemplateName,
      importedAt: new Date().toISOString(),
    },
  };
}

function buildProjectData({ companyProfile, userId, userEmail, userName, offerSource, acceptedOptions }) {
  const activatedAt = new Date().toISOString();
  const acceptedTotal = offerTotal(offerSource.lines) + offerTotal(acceptedOptions);
  return {
    company: {
      companyName: companyProfile?.companyName || "",
      orgNumber: companyProfile?.orgNumber || "",
      address: companyProfile?.address || "",
      phone: companyProfile?.phone || "",
      email: companyProfile?.email || userEmail || "",
      website: companyProfile?.website || "",
      logoUrl: companyProfile?.logoUrl || "/expo-logo.png",
    },
    user: { id: userId, email: userEmail || "" },
    project: {
      responsible: userName,
      projectName: "DEMO – Prosjekt badrenovering",
      projectNumber: "DEMO-001",
      address: DEMO_ADDRESS,
      postnr: DEMO_POSTNR,
      city: DEMO_CITY,
      customer: DEMO_CUSTOMER,
      customerEmail: userEmail || "",
      customerPhone: DEMO_PHONE,
      date: isoDateOffset(-14),
      notes: `${DEMO_NOTE} Rapport, garanti, fremdrift og chat inneholder kun demonstrasjonsdata.`,
      projectDescription:
        "Komplett demonstrasjonsprosjekt for rehabilitering av bad. Prosjektet viser avtalegrunnlag, prosjektering, fremdrift, dokumentasjon, rapport, garanti og kundedialog.",
      projectInfoIncludeInReport: true,
      checklistPhotosNote: true,
      reportHeroPhotoId: "",
      isTemplate: false,
      fall: "Fall mot sluk iht. prosjektert løsning",
      fallDusj: "1:50 i dusjsone",
      fallUtenfor: "1:100 utenfor dusjsone",
      sluk: "Gulvsluk med dokumentert mansjett/tetting",
      terskel: "Terskel og høydeforskjell kontrollert mot ferdig gulv",
      membran: "Sopro AEB 815 – SINTEF TG 20918",
      prosjekteringKommentar:
        "Demo: løsning er prosjektert med vegghengt WC, stor dusjsone, innfelt nisje og dokumentert Sopro våtromssystem.",
      prosjekteringPunkter: [],
      customChecklistGroups: [],
      projectDeviations: [],
      locked: false,
      status: "active",
      workflowStatus: "Pågår",
      lockedAt: "",
      lockedBy: "",
      demoCase: true,
      demoSuiteKey: DEMO_SUITE_KEY,
      demoStage: "project",
      demoOwnerEmail: userEmail || "",
      demoSourceTemplateName: offerSource.sourceTemplateName,
      demoAcceptedOfferSnapshot: {
        lines: cloneJson(offerSource.lines, []),
        selectedOptions: cloneJson(acceptedOptions, []),
        sourceTemplateName: offerSource.sourceTemplateName,
      },
      salesOrigin: {
        requestRef: DEMO_REQUEST_REFS.project,
        publicToken: "",
        acceptedOfferVersionId: "",
        acceptedOfferVersionNumber: 1,
        acceptedBy: DEMO_CUSTOMER,
        acceptedAt: activatedAt,
        acceptedTotal,
        activatedAt,
      },
    },
    checked: {},
    productDocs: {},
    manualProducts: {},
    other: {
      demoSummary:
        "Demonstrasjon av komplett våtromsleveranse fra forespørsel og befaring til tilbud, fremdrift, rapport og garanti.",
    },
    surf: {},
    bathroomEquipment: {},
    photos: [],
    access: [],
    inst: [],
    files: [],
    checklist: {},
    tilbud: {
      enabled: true,
      files: [],
      changes: [],
      legacyTillegg: "",
      legacyFradrag: "",
      tillegg: "",
      fradrag: "",
      kommentar: `Demo: avtalegrunnlaget er kopiert read-only fra firmamalen «${offerSource.sourceTemplateName}».`,
    },
    overtagelse: {
      enabled: true,
      dato: isoDateOffset(-1),
      kommentar: "DEMO – overtagelsen er signert kun for å vise garanti- og rapportvisning.",
      signUtførende: userName,
      signKunde: DEMO_CUSTOMER,
      signUtførendeImage: "",
      signKundeImage: "",
    },
    warranty: {
      enabled: true,
      system: "sopro-aeb-815",
      sintefApproval: "SINTEF TG 20918",
      durationYears: 10,
      issued: true,
      issuedAt: isoTimeOffset(-60),
      status: "issued",
      guaranteeNumber: "DEMO-GARANTI-2026-001",
      termsAccepted: true,
      demoCase: true,
      demoSuiteKey: DEMO_SUITE_KEY,
    },
    projectLog: {
      enabled: true,
      draft: "",
      messages: [
        {
          id: "demo-chat-1",
          by: DEMO_CUSTOMER,
          role: "kunde",
          created: isoTimeOffset(-180),
          text: "Hei! Kan vi beholde den innfelte nisjen i dusjsonen som vist på befaringen?",
        },
        {
          id: "demo-chat-2",
          by: userName,
          role: "admin",
          created: isoTimeOffset(-150),
          text: "Ja. Nisjen ligger som valgt opsjon i demonstrasjonstilbudet og er tatt med i videre planlegging.",
        },
        {
          id: "demo-chat-3",
          by: DEMO_CUSTOMER,
          role: "kunde",
          created: isoTimeOffset(-120),
          text: "Flott. Gi gjerne beskjed her når flisleggingen starter.",
        },
      ],
      lastReadByAdmin: isoTimeOffset(-90),
      lastReadByCustomer: isoTimeOffset(-130),
    },
    internalNotes: `${DEMO_NOTE}\nKilde for tilbud/fremdrift: ${offerSource.sourceTemplateName}.`,
  };
}

async function loadContext() {
  const workProfile = await getMyWorkProfileState();
  const companyId = String(workProfile?.active_company_id || "").trim();
  if (!companyId) throw new Error("Velg firma under Representerer før Demo/Test brukes.");

  const client = createDefaultSalesSupabaseClient();
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData?.session?.user || null;
  if (!user?.id) throw new Error("Innloggingen er ikke klar ennå.");
  assertDemoOperator(user, workProfile);

  return {
    client,
    companyId,
    companyProfile: workProfile?.active_company_profile || {},
    companyName:
      workProfile?.active_company_profile?.companyName ||
      workProfile?.workspaces?.find((item) => String(item.company_id) === companyId)?.company_name ||
      "Valgt firma",
    user,
    userId: user.id,
    userEmail: String(user.email || "").trim(),
    userName: displayName(user),
  };
}

async function loadDemoOfferSource(context) {
  const { data: sourceCompany, error: sourceCompanyError } = await context.client
    .from("sales_company_scopes")
    .select("id,display_name")
    .eq("display_name", DEMO_TEMPLATE_COMPANY_NAME)
    .limit(1)
    .maybeSingle();

  if (sourceCompanyError || !sourceCompany?.id) {
    console.warn(
      "Demo/Test: kunne ikke finne Ringside-scope for Andreas-malen, bruker innebygget fallback.",
      sourceCompanyError || "scope mangler"
    );
    return normalizeTemplatePayload({ demoSourceTemplateName: "Demo fallback" });
  }

  const templateCompanyId = String(sourceCompany.id || "").trim();
  const { data, error } = await context.client
    .from("sales_offer_templates")
    .select("id,name,payload,updated_at")
    .eq("company_id", templateCompanyId)
    .eq("name", DEMO_TEMPLATE_NAME)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Demo/Test: kunne ikke lese Andreas-malen, bruker innebygget fallback.", error);
    return normalizeTemplatePayload({ demoSourceTemplateName: "Demo fallback" });
  }
  if (!data?.payload) {
    return normalizeTemplatePayload({ demoSourceTemplateName: "Demo fallback" });
  }
  return normalizeTemplatePayload({
    ...data.payload,
    demoSourceTemplateName: data.name || DEMO_TEMPLATE_NAME,
  });
}

async function fetchDemoSalesRows(client, companyId) {
  const refs = Object.values(DEMO_REQUEST_REFS);
  const { data, error } = await client
    .from("sales_requests")
    .select("request_ref,status,payload,updated_at")
    .eq("company_id", companyId)
    .in("request_ref", refs);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function removeOwnedDemoProjects(client, companyId, demoRows) {
  const verifiedRequestRefs = new Set(
    demoRows
      .filter((row) => isDemoRequest(row?.payload || {}))
      .map((row) => String(row.request_ref || ""))
      .filter(isDemoRequestRef)
  );

  if (!verifiedRequestRefs.size) return [];

  const { data: projects, error: projectError } = await client
    .from("projects")
    .select("id,data,company_scope_id")
    .eq("company_scope_id", companyId);
  if (projectError) throw projectError;

  const demoProjects = (Array.isArray(projects) ? projects : []).filter((row) => {
    const requestRef = String(row?.data?.project?.salesOrigin?.requestRef || "").trim();
    if (!verifiedRequestRefs.has(requestRef)) return false;
    return isDemoProjectData(row?.data || {}) || requestRef === DEMO_REQUEST_REFS.accepted;
  });

  for (const row of demoProjects) {
    const { error } = await client
      .from("projects")
      .delete()
      .eq("id", row.id)
      .eq("company_scope_id", companyId);
    if (error) throw error;
  }

  return demoProjects.map((row) => row.id);
}

async function seedDemoProgressPlan(context, projectId, offerSource, acceptedOptions) {
  const plan = buildDemoProgressPlan(offerSource, acceptedOptions);
  const { error } = await context.client
    .from("project_progress_plans")
    .upsert(
      {
        project_id: projectId,
        customer_visible: true,
        plan,
      },
      { onConflict: "project_id" }
    );
  if (error) throw error;
  return plan;
}

async function createProjectStage(context, offerSource, acceptedOptions) {
  const projectId = crypto.randomUUID();
  const projectData = buildProjectData({
    companyProfile: context.companyProfile,
    userId: context.userId,
    userEmail: context.userEmail,
    userName: context.userName,
    offerSource,
    acceptedOptions,
  });

  const { data, error } = await context.client
    .from("projects")
    .insert({
      id: projectId,
      title: "DEMO – Prosjekt badrenovering",
      data: projectData,
      user_id: context.userId,
      share_enabled: true,
      locked: false,
      locked_at: null,
      locked_by: "",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  const savedProjectId = data?.id || projectId;
  await seedDemoProgressPlan(context, savedProjectId, offerSource, acceptedOptions);
  return savedProjectId;
}

function projectStagePayload({ userName, userEmail, projectId, offerSource, acceptedOptions }) {
  const activatedAt = new Date().toISOString();
  const acceptedTotal = offerTotal(offerSource.lines) + offerTotal(acceptedOptions);
  return {
    ...offerPayload(
      demoBase({
        requestRef: DEMO_REQUEST_REFS.project,
        stage: "project",
        userName,
        userEmail,
      }),
      offerSource
    ),
    acceptedBy: DEMO_CUSTOMER,
    acceptedAt: activatedAt,
    acceptedOfferVersionId: "",
    acceptedOfferVersionNumber: 1,
    acceptedOfferLines: cloneJson(offerSource.lines, []),
    acceptedOptionIds: acceptedOptions.map((option) => option?.id).filter(Boolean),
    acceptedOptions: cloneJson(acceptedOptions, []),
    acceptedTotal,
    acceptedPayload: {
      demo: true,
      selected_options: cloneJson(acceptedOptions, []),
      version_snapshot: {
        demo: true,
        version_number: 1,
        lines: cloneJson(offerSource.lines, []),
        options: cloneJson(offerSource.options, []),
      },
    },
    projectId,
    projectName: "DEMO – Prosjekt badrenovering",
    projectNumber: "DEMO-001",
    projectResponsible: userName,
    projectNote: DEMO_NOTE,
    projectActivatedAt: activatedAt,
    status: "Aktivert",
    statusClass: "sales-status-accepted",
    nextStep: "Åpne ProffDok-prosjekt",
    iconName: "home",
    publicToken: "",
    sentOfferVersionId: null,
    sentOfferVersionNumber: null,
  };
}

async function upsertDemoSalesRows(context, payloads, projectId, offerSource) {
  const projectPayload = projectStagePayload({
    userName: context.userName,
    userEmail: context.userEmail,
    projectId,
    offerSource,
    acceptedOptions: payloads.acceptedOptions,
  });
  const allPayloads = [
    payloads.request,
    payloads.survey,
    payloads.offer,
    payloads.accepted,
    projectPayload,
  ];

  const rows = allPayloads.map((payload) => ({
    company_id: context.companyId,
    request_ref: payload.id,
    status: payload.status,
    payload,
    archived_at: null,
    created_by: context.userId,
    created_by_name: context.userName,
  }));

  const { error } = await context.client
    .from("sales_requests")
    .upsert(rows, { onConflict: "company_id,request_ref" });
  if (error) throw error;
  return rows;
}

export async function getDemoSuiteStatus() {
  const context = await loadContext();
  const rows = await fetchDemoSalesRows(context.client, context.companyId);
  const validRows = rows.filter((row) => isDemoRequest(row?.payload || {}));
  return {
    companyId: context.companyId,
    companyName: context.companyName,
    operatorEmail: context.userEmail,
    count: validRows.length,
    ready: validRows.length === Object.keys(DEMO_REQUEST_REFS).length,
    sourceTemplateName:
      validRows.find((row) => row?.payload?.demoSourceTemplateName)?.payload?.demoSourceTemplateName || "",
    stages: validRows.map((row) => ({
      requestRef: row.request_ref,
      stage: row.payload?.demoStage || "",
      status: row.status,
      projectId: row.payload?.projectId || "",
    })),
  };
}

export async function resetDemoSuite() {
  const context = await loadContext();
  const currentRows = await fetchDemoSalesRows(context.client, context.companyId);
  const removedProjectIds = await removeOwnedDemoProjects(
    context.client,
    context.companyId,
    currentRows
  );
  const offerSource = await loadDemoOfferSource(context);
  const payloads = buildDemoPayloads({
    userName: context.userName,
    userEmail: context.userEmail,
    offerSource,
  });

  const preliminaryRows = [
    payloads.request,
    payloads.survey,
    payloads.offer,
    payloads.accepted,
  ].map((payload) => ({
    company_id: context.companyId,
    request_ref: payload.id,
    status: payload.status,
    payload,
    archived_at: null,
    created_by: context.userId,
    created_by_name: context.userName,
  }));

  const { error: preliminaryError } = await context.client
    .from("sales_requests")
    .upsert(preliminaryRows, { onConflict: "company_id,request_ref" });
  if (preliminaryError) throw preliminaryError;

  const projectId = await createProjectStage(
    context,
    offerSource,
    payloads.acceptedOptions
  );
  await upsertDemoSalesRows(context, payloads, projectId, offerSource);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("focus"));
  }

  return {
    companyId: context.companyId,
    companyName: context.companyName,
    projectId,
    removedProjectIds,
    sourceTemplateName: offerSource.sourceTemplateName,
    count: Object.keys(DEMO_REQUEST_REFS).length,
  };
}
