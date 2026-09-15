// Expo ProffDok – FASE 42L
// Oppretter og tilbakestiller en liten, deterministisk demosuite i valgt arbeidsprofil.
// Bruker eksisterende RLS/tabeller. Ingen ekte kundesak kan slettes: prosjektrydding
// krever både eksakt DEMO42L requestRef i prosjektet og matchende demo-markør på Sales-raden.

import { getMyWorkProfileState } from "../access/workProfileClient.js";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";
import {
  DEMO_REQUEST_REFS,
  DEMO_SUITE_KEY,
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

function isoDateOffset(days = 0) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function displayName(user = {}) {
  return String(
    user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Systemadmin"
  ).trim();
}

function offerLines() {
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

function offerTotal(lines = []) {
  return lines.reduce((sum, line) => sum + Number(line?.amount || 0), 0);
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

function offerPayload(base, lines) {
  return {
    ...base,
    offerTitle: "DEMO – Komplett badrenovering",
    offerIntro:
      "Dette er et demonstrasjonstilbud som viser hvordan et ordinært våtromstilbud bygges opp i Expo ProffDok.",
    offerLines: lines,
    offerOptions: [
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
        imageDataUrl: "",
        imageName: "",
        attachmentFile: null,
      },
    ],
    offerReservations: "Forbehold om skjulte forhold som ikke kan avdekkes før riving.",
    offerIncluded: "Arbeider og materiell som fremgår av tilbudslinjene.",
    offerExcluded: "Møbler og sanitærutstyr utover det som er særskilt beskrevet.",
    offerCustomerSupplied: "Ingen kundeleveranser i denne demosaken.",
    offerTerms: "Arbeid utføres etter gjeldende krav og produsentanvisninger.",
    offerPaymentTerms: "10 dager netto",
    offerValidityDays: "30",
    offerTotal: offerTotal(lines),
    offerDraftSavedAt: new Date().toISOString(),
  };
}

function buildDemoPayloads({ userName, userEmail }) {
  const lines = offerLines();
  const tomorrow = isoDateOffset(1);
  const acceptedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();

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
    inspectionCustomerWishes: "Nytt, komplett bad med stor dusjsone og vegghengt WC.",
    inspectionExistingConditions: "Eksisterende bad fra 1990-tallet. Overflater og tekniske føringer skal fornyes.",
    inspectionMeasurements: "Ca. 5,8 m² gulvareal. Takhøyde ca. 2,4 m.",
    inspectionObservations: "Tilkomst er god. Endelig kontroll av underlag gjøres etter riving.",
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
      lines
    ),
    surveyDate: tomorrow,
    surveyTime: "10:00",
    surveyResponsible: userName,
    inspectionCustomerWishes: "Nytt, komplett bad med stor dusjsone og vegghengt WC.",
    inspectionExistingConditions: "Eksisterende bad skal totalrenoveres.",
    inspectionMeasurements: "Ca. 5,8 m² gulvareal.",
    inspectionObservations: "Tilbudet er klargjort for demo.",
    inspectionPhotos: [],
    status: "Tilbud",
    statusClass: "sales-status-quote",
    nextStep: "Rediger tilbud",
    iconName: "send",
  };

  const acceptedLines = offerLines();
  const accepted = {
    ...offerPayload(
      demoBase({
        requestRef: DEMO_REQUEST_REFS.accepted,
        stage: "accepted",
        userName,
        userEmail,
      }),
      acceptedLines
    ),
    surveyDate: tomorrow,
    surveyTime: "10:00",
    surveyResponsible: userName,
    inspectionCustomerWishes: "Nytt, komplett bad med stor dusjsone og vegghengt WC.",
    inspectionExistingConditions: "Eksisterende bad skal totalrenoveres.",
    inspectionMeasurements: "Ca. 5,8 m² gulvareal.",
    inspectionObservations: "Demosaken er klargjort for prosjektaktivering.",
    inspectionPhotos: [],
    acceptedBy: DEMO_CUSTOMER,
    acceptedAt,
    acceptedOfferVersionId: "",
    acceptedOfferVersionNumber: 1,
    acceptedOfferLines: acceptedLines,
    acceptedOptionIds: [],
    acceptedOptions: [],
    acceptedTotal: offerTotal(acceptedLines),
    acceptedPayload: { demo: true, selected_options: [] },
    acceptedOfferTitle: "DEMO – Komplett badrenovering",
    acceptedOfferIntro: "Demonstrasjon av akseptert våtromstilbud.",
    acceptedOfferReservations: "Kun demo/test.",
    acceptedOfferIncluded: "Arbeider og materiell som fremgår av tilbudslinjene.",
    acceptedOfferExcluded: "Kun demo/test.",
    acceptedOfferCustomerSupplied: "Ingen.",
    acceptedOfferTerms: "Kun demo/test.",
    acceptedOfferPaymentTerms: "10 dager netto",
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

  return { request, survey, offer, accepted };
}

function buildProjectData({ companyProfile, userId, userEmail, userName, projectId }) {
  const activatedAt = new Date().toISOString();
  const lines = offerLines();
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
      date: isoDateOffset(0),
      notes: DEMO_NOTE,
      projectDescription:
        "Demo-prosjekt opprettet for visning av Avtalegrunnlag, Prosjektering, Fremdrift og videre dokumentasjon.",
      projectInfoIncludeInReport: true,
      checklistPhotosNote: false,
      reportHeroPhotoId: "",
      isTemplate: false,
      fall: "",
      fallDusj: "",
      fallUtenfor: "",
      sluk: "",
      terskel: "",
      membran: "",
      prosjekteringKommentar: "Demo: Prosjekteringen kan vises og redigeres som i et ordinært prosjekt.",
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
      salesOrigin: {
        requestRef: DEMO_REQUEST_REFS.project,
        publicToken: "",
        acceptedOfferVersionId: "",
        acceptedOfferVersionNumber: 1,
        acceptedBy: DEMO_CUSTOMER,
        acceptedAt: activatedAt,
        acceptedTotal: offerTotal(lines),
        activatedAt,
      },
    },
    checked: {},
    productDocs: {},
    manualProducts: {},
    other: {},
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
      kommentar: "",
    },
    overtagelse: {
      enabled: false,
      dato: isoDateOffset(0),
      kommentar: "",
      signUtførende: "",
      signKunde: "",
      signUtførendeImage: "",
      signKundeImage: "",
    },
    warranty: { enabled: false, issued: false, status: "draft" },
    projectLog: {
      enabled: false,
      draft: "",
      messages: [],
      lastReadByAdmin: "",
      lastReadByCustomer: "",
    },
    internalNotes: DEMO_NOTE,
  };
}

async function loadContext() {
  const workProfile = await getMyWorkProfileState();
  if (!workProfile?.is_systemadmin) {
    throw new Error("Demo/Test kan bare administreres av systemadministrator.");
  }
  const companyId = String(workProfile?.active_company_id || "").trim();
  if (!companyId) throw new Error("Velg firma under Representerer før Demo/Test brukes.");

  const client = createDefaultSalesSupabaseClient();
  if (!client) throw new Error("Supabase er ikke tilgjengelig.");

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData?.session?.user || null;
  if (!user?.id) throw new Error("Innloggingen er ikke klar ennå.");

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
    // Panelopprettet prosjekt har full markør. Prosjekt som er opprettet fra den
    // ekte Akseptert-demosaken kan mangle prosjektmarkøren, men slettes bare når
    // både company scope og den serverlagrede Sales-raden er verifisert som demo.
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

async function createProjectStage(context) {
  const projectId = crypto.randomUUID();
  const projectData = buildProjectData({
    companyProfile: context.companyProfile,
    userId: context.userId,
    userEmail: context.userEmail,
    userName: context.userName,
    projectId,
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
  return data?.id || projectId;
}

function projectStagePayload({ userName, userEmail, projectId }) {
  const lines = offerLines();
  const activatedAt = new Date().toISOString();
  return {
    ...offerPayload(
      demoBase({
        requestRef: DEMO_REQUEST_REFS.project,
        stage: "project",
        userName,
        userEmail,
      }),
      lines
    ),
    acceptedBy: DEMO_CUSTOMER,
    acceptedAt: activatedAt,
    acceptedOfferVersionId: "",
    acceptedOfferVersionNumber: 1,
    acceptedOfferLines: lines,
    acceptedOptionIds: [],
    acceptedOptions: [],
    acceptedTotal: offerTotal(lines),
    acceptedPayload: { demo: true, selected_options: [] },
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

async function upsertDemoSalesRows(context, payloads, projectId) {
  const projectPayload = projectStagePayload({
    userName: context.userName,
    userEmail: context.userEmail,
    projectId,
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
    count: validRows.length,
    ready: validRows.length === Object.keys(DEMO_REQUEST_REFS).length,
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

  const payloads = buildDemoPayloads({
    userName: context.userName,
    userEmail: context.userEmail,
  });

  // Upsert de fire Sales-stegene først. Dermed finnes serververifisert demo-markør
  // før prosjektsteget opprettes, også første gang suite bygges.
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

  const projectId = await createProjectStage(context);
  await upsertDemoSalesRows(context, payloads, projectId);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("focus"));
  }

  return {
    companyId: context.companyId,
    companyName: context.companyName,
    projectId,
    removedProjectIds,
    count: Object.keys(DEMO_REQUEST_REFS).length,
  };
}
