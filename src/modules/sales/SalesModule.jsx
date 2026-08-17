// FASE 28A2 TILBUDSMALER: Eksisterende tilbud kan lagres som firmadelt mal via sales_offer_templates. Kundedata, bilder, PDF-vedlegg, publisering og historikk kopieres ikke til malen.
// FASE 26B.1 TILBUDSVEDLEGG: Underposter og opsjoner kan ha bilde og PDF-vedlegg. PDF lagres i eksisterende project-images Storage og følger tilbudsdata uten SQL/RLS-endring.\n// FASE 26B: Strukturert tilbudsbygger med hovedposter, underposter, koblede opsjoner og valgfri administrasjon/prosjektstyring. Flat lagringsmodell beholdes for bakoverkompatibilitet. Ingen SQL/RLS/Storage/Edge/e-postendring.
// FASE 26B.5 OPSJONSTYPE: Tillegg/oppgradering og alternativ som erstatter konkret underpost. Alternativpris lagres som prisendring mot grunnposten; kundens valg er gjensidig eksklusivt per erstattet underpost. Ingen SQL/RLS/Storage/Edge-endring.\n// FASE 25B STRUKTURERTE ENDRINGER: Nye aktiverte prosjekter opprettes med tom changes-liste for tillegg/fradrag. Akseptert tilbud forblir låst i salesOrigin/akseptbevis. Ingen SQL/RLS/Storage/Edge/e-postendring.
// FASE 24S.1 KORREKT PROSJEKTAKTIVERING/TILBUD: Ved aktivering ligger forespørsel og befaring i prosjektbeskrivelse, mens opprinnelig akseptert tilbud dokumenteres via salesOrigin og akseptbevis/kontrakt. Tillegg/fradrag/avtaleendring starter tomt og brukes kun for senere endringer. Ingen SQL/RLS/Storage/Edge Function/e-postendring.
// FASE 23Q SALES-COMMUNICATION: Flytter henting av firmaprofil, kunde-e-post og befaringsbekreftelsestekst ut av SalesModule uten å endre UI, database, RLS, Storage, Edge Function eller e-postinnhold.
// FASE 23P SALES-PUBLISHING: Flytter tilbudspublisering og bygging av kundelenker ut av SalesModule uten å endre UI, tilbudsdata, database, RLS, Storage, e-post eller aksept.
// FASE 23O SALES-CUSTOMER-VIEW: Flytter offentlig kundevisning, lastestatus, lenkefeil og akseptbekreftelse ut av SalesModule uten å endre UI, tilbudsdata, aksept, database, Storage eller e-post.
// FASE 23N SALES-PROJECT-ACTIVATION: Flytter prosjektaktiveringens presentasjon ut av SalesModule uten å endre validering, dataflyt, database, Storage, prosjektopprettelse eller navigasjon.
// FASE 23M SALES-OFFER-BUILDER: Flytter tilbudsbyggerens presentasjon ut av SalesModule uten å endre UI, validering, autolagring, dataflyt, database, Storage, publisering, e-post eller aksept.
// FASE 23L SALES-DETAIL-VIEW: Flytter intern saksdetalj ut av SalesModule uten å endre UI, navigasjon, dataflyt, database, Storage, e-post, tilbud eller prosjektaktivering.
// FASE 23K SALES-INSPECTION-NOTE: Flytter befaringsnotat og bildevisning ut av SalesModule uten å endre UI, validering, navigasjon, dataflyt, database, Storage eller tilbud.
// FASE 23J SALES-SURVEY-PLAN: Flytter planlegging av befaring ut av SalesModule uten å endre UI, validering, navigasjon, dataflyt, database, Storage, e-post eller prosjektaktivering.
// FASE 23I SALES-REQUEST-FORM: Flytter skjema for ny og redigert forespørsel ut av SalesModule uten å endre UI, validering, navigasjon, dataflyt, database, Storage, e-post eller prosjektaktivering.
// FASE 23H SALES-LIST-VIEW: Flytter saksoversikt, nøkkeltall og aktive/aktiverte sakskort ut av SalesModule uten å endre UI, navigasjon, dataflyt, database, Storage, e-post eller prosjektaktivering.
// FASE 23G SALES-ACCEPTANCE-PDF: Flytter opprettelse av låst akseptbevis-PDF ut av SalesModule uten å endre UI, dataflyt, database, Storage-regler, e-post eller prosjektaktivering.
// FASE 23F SALES-OFFERS: Flytter ren tilbudslogikk, skjema-normalisering, publiseringspayload og offentlig tilbudsmapping ut av SalesModule uten å endre UI, dataflyt, database, Storage, e-post, aksept eller prosjektaktivering.
// FASE 23E SALES-IMAGES: Flytter lesing, størrelsesmåling, konvertering og komprimering av bilder ut av SalesModule uten å endre UI, dataflyt, database, Storage-regler, e-post eller prosjektaktivering.
// FASE 23D SALES-SUPABASE: Flytter Supabase-klient, databasekall, RPC, Storage, auth-abonnement og Edge Function-kall ut av SalesModule uten å endre UI, dataflyt, database, RLS, Storage-regler, e-post eller prosjektaktivering.
// FASE 23C SALES-STORAGE: Flytter all lokal nettleserlagring for navigasjon, preview-saker og kladder ut av SalesModule uten å endre UI, dataflyt, database, Storage, e-post eller prosjektaktivering.
// FASE 23B SALES-CONSTANTS: Flytter statiske salgsdata, lagringsnavn og standardskjema ut av SalesModule uten å endre UI, dataflyt, database, Storage, e-post eller prosjektaktivering.
// FASE 23A SALES-UTILS: Flytter rene hjelpefunksjoner ut av SalesModule uten å endre UI, dataflyt, database, Storage, e-post eller prosjektaktivering.
// FASE 22D.2 KORRIGERT VISNING AV PROSJEKTANSVARLIG: Intern saksvisning bruker innlogget brukers navn i stedet for lagret e-post. Ingen CSS-, database-, kundevisnings- eller e-postendring.
// FASE 22D.1 INNLOGGET PROSJEKTANSVARLIG: Bruker innlogget brukers fulle navn som ansvarlig i befaring, intern visning og kundemail. E-post brukes kun som siste fallback. Ingen SQL/RLS/Storage-endring.
// FASE 22D SYNLIG BEFARINGSTID I SAKSOVERSIKT: Avtalt dato, klokkeslett og ansvarlig vises direkte i detaljhodet. Ingen SQL/RLS/Storage-endring.
// FASE 22B REDIGERBAR FORESPØRSEL/BEFARING OG NORSK BEFARINGSTID: Kunde- og befaringsdata kan oppdateres før aksept. Utsendt bekreftelse kan sendes oppdatert. Ingen SQL/RLS/Storage-endring.
// FASE 22A BEFARINGSBEKREFTELSE OG TILBUDSMAIL: Sender kundemail via eksisterende smart-worker etter at data/publisering er lagret. Ingen SQL/RLS/Storage-endring.
// FASE 20T SYNLIG TILBUDS- OG AKSEPTHISTORIKK: Viser tidligere og gjeldende aksepterte tilbudsversjoner med kunde, tidspunkt, total, valgte opsjoner og låst akseptbevis. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20P SIKKER ÅPNING AV AKSEPTBEVIS: Ny fane reserveres direkte ved brukerklikk og viser ferdig PDF etter opprettelse. Eksisterende nedlasting, firmalogo og låst dokumentasjon beholdes. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20M LÅST AKSEPTBEVIS: Oppretter PDF fra akseptert, publisert tilbudsversjon og lagrer dokumentet varig på saken og i aktivert prosjekt. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20J TYDELIG LEVERANSEOMFANG: Egne, versjonslåste felt for inkludert, ikke inkludert og kundens leveranse vises i kundetilbud og omfattes av digital aksept. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 21A DIREKTE NY FORESPØRSEL: Startsiden kan åpne registreringsskjemaet direkte via et signal uten å opprette eller endre salgsdata før brukeren lagrer.
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
  Download,
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
import {
  buildInspectionIntro,
  createRequestId,
  firstNonEmailName,
  formatNok,
  getInspectionContext,
  getOfferTermsSnapshot,
  getOfferTotal,
  getVisibleOfferLines,
  getWorkflowSteps,
  hasCompanyProfile,
  hasInspectionContext,
  isEmailLike,
  sanitizeStoragePart,
  stripTransientPhotoData,
} from "./utils/salesUtils.js";
import {
  buildOfferFormFromRequest,
  createEmptyOfferLine,
  createEmptyOfferOption,
  createInitialOfferForm,
  createOfferAdministrationLine,
  getActiveOfferVersion,
  mapPublicOfferToRequest,
  mergeOfferDraftIntoRequests,
  normalizeStoredOfferDraft,
  prepareOfferFormForSave,
  recalculateAdministrationLines,
} from "./utils/salesOfferLogic.js";
import {
  INSPECTION_BUCKET,
  emptyForm,
} from "./constants/salesConstants.js";
import {
  buildInspectionDraftKey,
  buildSalesStorageKey,
  buildScopedOfferDraftKey,
  buildStableOfferDraftKey,
  clearInspectionDraft as clearStoredInspectionDraft,
  clearOfferDraft,
  loadInspectionDraft,
  loadOfferDraft as loadStoredOfferDraft,
  loadRequests,
  loadSalesNavigation,
  saveInspectionDraft as saveStoredInspectionDraft,
  saveOfferDraft as saveStoredOfferDraft,
  saveRequests,
  saveSalesNavigation,
} from "./services/salesLocalStorage.js";
import {
  acceptSalesOffer,
  createDefaultSalesSupabaseClient,
  createSalesProject,
  createStorageSignedUrl,
  downloadStorageFile,
  fetchProjectById,
  fetchProjectsByIds,
  fetchProjectsByOwner,
  fetchSalesRequests,
  insertSalesOfferTemplate,
  getSalesOfferByToken,
  getSalesSession,
  getStoragePublicUrl,
  removeStorageFiles,
  resolveSalesCompanyScope,
  subscribeToSalesAuthChanges,
  uploadStorageFile,
  upsertSalesRequests,
} from "./services/salesSupabase.js";
import {
  compressImageDataUrl,
  dataUrlToBlob,
  readFileAsDataUrl,
} from "./services/salesImages.js";
import { createAcceptanceProofPdf } from "./services/salesAcceptancePdf.js";
import { createPublishedOfferPdf } from "./services/salesOfferPdf.js";
import {
  buildCustomerOfferLink,
  publishSalesOfferAndBuildLink,
} from "./services/salesPublishing.js";
import {
  buildInspectionConfirmationMessage,
  fetchSalesCompanyProfile,
  sendSalesCustomerEmail,
} from "./services/salesCommunication.js";
import SalesListView from "./components/SalesListView.jsx";
import SalesRequestForm from "./components/SalesRequestForm.jsx";
import SalesSurveyPlan from "./components/SalesSurveyPlan.jsx";
import SalesInspectionNote from "./components/SalesInspectionNote.jsx";
import SalesDetailView from "./components/SalesDetailView.jsx";
import SalesOfferBuilder from "./components/SalesOfferBuilder.jsx";
import SalesProjectActivation from "./components/SalesProjectActivation.jsx";
import SalesCustomerView from "./components/SalesCustomerView.jsx";
import "./sales.css";

const supabase = createDefaultSalesSupabaseClient();

function createOfferFormChangeSignature(formValue) {
  const compactImageSignature = (value) => {
    const text = String(value || "");
    if (!text) return "";
    return `${text.length}:${text.slice(-48)}`;
  };

  const compactAttachment = (file) =>
    file
      ? {
          id: file.id || "",
          name: file.name || "",
          path: file.path || "",
          size: Number(file.size || 0),
        }
      : null;

  return JSON.stringify({
    title: formValue?.title || "",
    intro: formValue?.intro || "",
    reservations: formValue?.reservations || "",
    included: formValue?.included || "",
    excluded: formValue?.excluded || "",
    customerSupplied: formValue?.customerSupplied || "",
    terms: formValue?.terms || "",
    paymentTerms: formValue?.paymentTerms || "",
    validityDays: formValue?.validityDays || "",
    lines: (formValue?.lines || []).map((line) => ({
      id: line.id || "",
      mainPostId: line.mainPostId || "",
      mainPostTitle: line.mainPostTitle || "",
      lineType: line.lineType || "work",
      description: line.description || "",
      internalProductNumber: line.internalProductNumber || "",
      amount: String(line.amount ?? ""),
      adminMode: line.adminMode || "",
      adminPercent: String(line.adminPercent ?? ""),
      productUrl: line.productUrl || "",
      imageName: line.imageName || "",
      imageSignature: compactImageSignature(line.imageDataUrl),
      attachmentFile: compactAttachment(line.attachmentFile),
    })),
    options: (formValue?.options || []).map((option) => ({
      id: option.id || "",
      mainPostId: option.mainPostId || "",
      mainPostTitle: option.mainPostTitle || "",
      title: option.title || "",
      description: option.description || "",
      internalProductNumber: option.internalProductNumber || "",
      amount: String(option.amount ?? ""),
      productUrl: option.productUrl || "",
      imageName: option.imageName || "",
      imageSignature: compactImageSignature(option.imageDataUrl),
      attachmentFile: compactAttachment(option.attachmentFile),
    })),
  });
}

export default function SalesModule({
  supabaseClient = null,
  authUser = null,
  profile = null,
  currentUserName = "",
  integrationMode = "preview",
  startNewRequestSignal = 0,
  startNewOfferSignal = 0,
  onStartNewRequestHandled = null,
  onStartNewOfferHandled = null,
} = {}) {
  const activeSupabase = supabaseClient || supabase;
  const salesStorageKey = useMemo(
    () =>
      buildSalesStorageKey({
        integrationMode,
        companyName: profile?.company_name || profile?.companyName || "",
        userId: authUser?.id || "anonymous",
      }),
    [integrationMode, profile?.company_name, profile?.companyName, authUser?.id]
  );
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
    sendConfirmation: true,
  });
  const [inspectionForm, setInspectionForm] = useState({
    customerWishes: "",
    existingConditions: "",
    measurements: "",
    observations: "",
    photos: [],
  });
  const [inspectionDraftDirty, setInspectionDraftDirty] = useState(false);
  const [offerForm, setOfferForm] = useState(createInitialOfferForm);
  const offerFormRef = useRef(offerForm);
  const offerModeRef = useRef(mode);
  const offerRequestIdRef = useRef(selectedRequestId);
  const offerDraftSaveTimerRef = useRef(null);
  const offerFormHydratedRequestIdRef = useRef("");
  const offerFormSavedBaselineRef = useRef("");
  const pendingInvalidAlternativeOptionIdRef = useRef("");
  const [offerValidationJump, setOfferValidationJump] = useState(null);
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
  const [offerPdfBusy, setOfferPdfBusy] = useState(false);
  const [offerPdfError, setOfferPdfError] = useState("");
  const [customerLinkCopied, setCustomerLinkCopied] = useState(false);
  const [customerEmailBusy, setCustomerEmailBusy] = useState(false);
  const [customerEmailFeedback, setCustomerEmailFeedback] = useState(null);
  const [publishFeedback, setPublishFeedback] = useState(null);
  const [publicOfferLoading, setPublicOfferLoading] = useState(false);
  const [publicOfferError, setPublicOfferError] = useState("");
  const [salesCompanyId, setSalesCompanyId] = useState(null);
  const [salesStorageError, setSalesStorageError] = useState("");
  const [offerDraftSaveStatus, setOfferDraftSaveStatus] = useState("idle");
  const [offerTemplateSaveBusy, setOfferTemplateSaveBusy] = useState(false);
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

  const responsibleContactName = firstNonEmailName(
    profile?.full_name,
    profile?.fullName,
    profile?.display_name,
    profile?.displayName,
    profile?.name,
    authUser?.user_metadata?.full_name,
    authUser?.user_metadata?.fullName,
    authUser?.user_metadata?.display_name,
    authUser?.user_metadata?.displayName,
    authUser?.user_metadata?.name,
    currentUserName
  );

  const loggedInResponsible = String(
    responsibleContactName ||
      authUser?.email ||
      profile?.email ||
      currentUserName ||
      ""
  ).trim();

  function getResponsibleDisplayName(value = "") {
    const storedValue = String(value || "").trim();

    if (!storedValue || isEmailLike(storedValue)) {
      return loggedInResponsible;
    }

    return storedValue;
  }
  const responsibleContactEmail = String(
    profile?.email || authUser?.email || ""
  ).trim();
  const responsibleContactPhone = String(
    profile?.phone || profile?.phone_number || profile?.mobile || ""
  ).trim();

  function getStableOfferDraftKey(requestId = selectedRequestId) {
    return buildStableOfferDraftKey({
      userId: authUser?.id,
      userEmail: authUser?.email,
      requestId,
    });
  }

  function getScopedOfferDraftKey(requestId = selectedRequestId) {
    return buildScopedOfferDraftKey(salesStorageKey, requestId);
  }

  function saveOfferDraft(formValue = offerForm, requestId = selectedRequestId) {
    if (!requestId) return;
    saveStoredOfferDraft(getStableOfferDraftKey(requestId), formValue);
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
      storedDraft = loadStoredOfferDraft(selectedRequestId);
    } catch {
      storedDraft = null;
    }

    const hydratedOfferForm = normalizeStoredOfferDraft(storedDraft, selectedRequest);
    offerFormHydratedRequestIdRef.current = selectedRequestId;
    offerFormSavedBaselineRef.current = createOfferFormChangeSignature(hydratedOfferForm);
    setOfferForm(hydratedOfferForm);
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

      const { data: sessionData } = await getSalesSession(activeSupabase);
      const user = sessionData?.session?.user;
      if (!user?.id || cancelled) return;

      const { data: resolvedCompanyId, error: companyError } = await resolveSalesCompanyScope(activeSupabase);

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

      const { data: rows, error } = await fetchSalesRequests(activeSupabase, resolvedCompanyId);

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
        const { data: realProjects, error: realProjectsError } = await fetchProjectsByIds(activeSupabase, claimedActivatedProjectIds);
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
              const { data } = await createStorageSignedUrl(
                activeSupabase,
                INSPECTION_BUCKET,
                photo.path,
                60 * 60 * 24 * 7
              );
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
              await getSalesOfferByToken(activeSupabase, request.publicToken);

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

          if (
            !acceptedOffer ||
            hasRealActivatedProject ||
            request.offerRevisionDraftFromVersion
          ) {
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
        const { error: repairError } = await upsertSalesRequests(activeSupabase, repairedRows);
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

    const { data: sessionData } = await getSalesSession(activeSupabase);
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

    const { error } = await upsertSalesRequests(activeSupabase, rows);
    if (error) throw error;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPublicOfferView = Boolean(params.get("publicOffer"));

    // Kundevisningen åpnes på samme domene som proffappen. Den skal aldri
    // overskrive sist åpne interne salgssak i nettleserlagringen.
    if (isPublicOfferView) return;

    // Ikke nullstill valgt sak bare fordi request-listen er i et kortvarig
    // mellomsteg under lagring/publisering. Det var dette som kunne sende
    // brukeren tilbake til hovedlisten etter publisering.
    saveSalesNavigation(salesStorageKey, mode, selectedRequestId);
  }, [mode, salesStorageKey, selectedRequestId]);

  useEffect(() => {
    if (mode !== "inspection-note" || !selectedRequestId) return;
    saveInspectionDraft(inspectionForm);
    // Lokal feature-kladd skal følge alle endringer i befaringsskjemaet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectionForm, mode, selectedRequestId]);


  async function refreshCompanyProfile() {
    const nextProfile = await fetchSalesCompanyProfile(activeSupabase);

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
      const nextProfile = await fetchSalesCompanyProfile(activeSupabase);
      if (active && nextProfile) setCompanyProfile(nextProfile);
    }

    loadInitialCompanyProfile();

    const subscription = subscribeToSalesAuthChanges(
      activeSupabase,
      (_event, session) => {
        if (!session?.user?.id) return;
        loadInitialCompanyProfile();
      }
    );

    return () => {
      active = false;
      subscription?.unsubscribe?.();
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

  const activeRequests = useMemo(
    () => requests.filter((request) => request.status !== "Aktivert"),
    [requests]
  );

  const activatedRequests = useMemo(
    () => requests.filter((request) => request.status === "Aktivert"),
    [requests]
  );

  const summary = useMemo(
    () => [
      {
        label: "Aktive saker",
        value: activeRequests.length,
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
    [activeRequests, requests]
  );

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateRequiredCustomerFields() {
    const requiredFields = [
      ["customer", "kundenavn"],
      ["address", "adresse"],
      ["postnr", "postnummer"],
      ["city", "sted"],
    ];
    const missing = requiredFields.find(
      ([field]) => !String(form?.[field] || "").trim()
    );

    if (!missing) return true;

    alert(`Fyll inn ${missing[1]} før du fortsetter.`);
    return false;
  }

  function resetForm() {
    setForm(emptyForm);
  }


  function openEditRequest() {
    if (!selectedRequest || !["Forespørsel", "Befaring", "Tilbud"].includes(selectedRequest.status)) {
      return;
    }

    setForm({
      customer: selectedRequest.customer || "",
      phone: selectedRequest.phone || "",
      email: selectedRequest.email || "",
      address: selectedRequest.address || "",
      postnr: selectedRequest.postnr || "",
      city: selectedRequest.city || "",
      title: selectedRequest.title || "Modernisering av bad",
      source: selectedRequest.source || "Telefon",
      note: selectedRequest.note || "",
    });
    setMode("edit-request");
  }

  async function handleUpdateRequest(event) {
    event.preventDefault();
    if (!selectedRequest || !["Forespørsel", "Befaring", "Tilbud"].includes(selectedRequest.status)) return;
    if (!validateRequiredCustomerFields()) return;

    const customerDetailsChanged = Boolean(
      selectedRequest.customer !== form.customer.trim() ||
        selectedRequest.phone !== form.phone.trim() ||
        selectedRequest.email !== form.email.trim() ||
        selectedRequest.address !== form.address.trim() ||
        (selectedRequest.postnr || "") !== form.postnr.trim() ||
        (selectedRequest.city || "") !== form.city.trim()
    );
    const hasPublishedOffer = Boolean(
      selectedRequest.publicToken ||
        selectedRequest.salesOfferId ||
        selectedRequest.sentOfferVersionId ||
        selectedRequest.sentOfferVersionNumber
    );

    const updatedRequest = {
      ...selectedRequest,
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      postnr: form.postnr.trim(),
      city: form.city.trim(),
      title: form.title,
      source: form.source,
      note: form.note.trim(),
      ...(selectedRequest.status === "Tilbud" &&
      hasPublishedOffer &&
      customerDetailsChanged
        ? {
            sentOfferVersionId: null,
            sentOfferAt: null,
            nextStep: "Publiser ny tilbudsversjon",
          }
        : {}),
    };
    const confirmationRelevantChange = Boolean(
      ["Forespørsel", "Befaring"].includes(selectedRequest.status) &&
        selectedRequest.surveyConfirmationSentAt &&
        (updatedRequest.customer !== selectedRequest.customer ||
          updatedRequest.email !== selectedRequest.email ||
          updatedRequest.address !== selectedRequest.address ||
          updatedRequest.postnr !== selectedRequest.postnr ||
          updatedRequest.city !== selectedRequest.city ||
          updatedRequest.title !== selectedRequest.title)
    );
    const nextRequests = requests.map((request) =>
      request.id === selectedRequest.id ? updatedRequest : request
    );

    setRequests(nextRequests);
    latestRequestsRef.current = nextRequests;
    try {
      await persistRequests(nextRequests);
    } catch (error) {
      alert(error.message || "Kunne ikke lagre endringene i forespørselen.");
      return;
    }

    if (confirmationRelevantChange) {
      const openSurvey = window.confirm(
        "Kunde- eller prosjektinformasjon i en allerede utsendt befaringsbekreftelse er endret. Vil du kontrollere befaringen og sende en oppdatert bekreftelse nå?"
      );
      if (openSurvey) {
        setSurveyForm({
          date: updatedRequest.surveyDate || "",
          time: updatedRequest.surveyTime || "",
          responsible:
            updatedRequest.surveyResponsible ||
            updatedRequest.responsible ||
            responsibleContactName ||
            loggedInResponsible,
          note: updatedRequest.surveyNote || "",
          sendConfirmation: true,
        });
        setMode("survey-plan");
        return;
      }
    }

    setMode("detail");
  }

  useEffect(() => {
    if (!startNewRequestSignal || integrationMode !== "app") return;
    resetForm();
    setSelectedRequestId(null);
    setMode("new");
    onStartNewRequestHandled?.();
    // Signal nullstilles i hovedappen etter at det er håndtert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startNewRequestSignal, integrationMode]);

  useEffect(() => {
    if (!startNewOfferSignal || integrationMode !== "app") return;
    resetForm();
    setSelectedRequestId(null);
    setMode("new-offer");
    onStartNewOfferHandled?.();
    // Signal nullstilles i hovedappen etter at det er håndtert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startNewOfferSignal, integrationMode]);

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
      const { error: uploadError } = await uploadStorageFile(activeSupabase, "project-images", path, file, {
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: publicFile } = getStoragePublicUrl(activeSupabase, "project-images", path);
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
        const { error: removeError } = await removeStorageFiles(activeSupabase, "project-images", [contractPath]);
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

  async function handleDownloadPublishedOfferPdf() {
    if (!selectedRequest || offerPdfBusy) return;

    if (!selectedRequest.publicToken) {
      setOfferPdfError(
        "Publiser tilbudet først. PDF-en skal alltid opprettes fra den publiserte tilbudsversjonen."
      );
      return;
    }

    if (!activeSupabase) {
      setOfferPdfError("Supabase-miljøvariabler mangler i Vercel-preview.");
      return;
    }

    setOfferPdfBusy(true);
    setOfferPdfError("");

    try {
      const { data, error } = await getSalesOfferByToken(
        activeSupabase,
        selectedRequest.publicToken
      );
      if (error) throw error;

      const publishedRequest = mapPublicOfferToRequest(data);
      if (!publishedRequest) {
        throw new Error("Publisert tilbudsversjon kunne ikke hentes.");
      }

      const { blob, fileName } = await createPublishedOfferPdf({
        selectedRequest: publishedRequest,
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (error) {
      console.error("Kunne ikke laste ned publisert tilbud som PDF", error);
      setOfferPdfError(error.message || "Kunne ikke opprette tilbuds-PDF.");
    } finally {
      setOfferPdfBusy(false);
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
      const { blob, fileName, version } = await createAcceptanceProofPdf({
        selectedRequest,
        companyProfile,
      });
      const path = `sales-acceptance-proofs/${authUser.id}/${sanitizeStoragePart(selectedRequest.id)}/${crypto.randomUUID()}-${fileName}`;
      const { error: uploadError } = await uploadStorageFile(activeSupabase, "project-images", path, blob, {
        cacheControl: "3600",
        contentType: "application/pdf",
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data: publicFile } = getStoragePublicUrl(activeSupabase, "project-images", path);
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
      setAcceptanceProofError("");
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
        const { data: existingById, error: existingByIdError } = await fetchProjectById(activeSupabase, existingProjectId);
        if (existingByIdError) throw existingByIdError;
        if (!existingById) existingProjectId = "";
      }

      if (!existingProjectId) {
        const { data: ownedProjects, error: duplicateError } = await fetchProjectsByOwner(activeSupabase, authUser.id);
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
            const { data, error } = await downloadStorageFile(activeSupabase, INSPECTION_BUCKET, photo.path);
            if (error) throw new Error(`Kunne ikke overføre befaringsbilde: ${error.message}`);
            blob = data;
          } else if (photo.dataUrl) {
            blob = dataUrlToBlob(photo.dataUrl);
          }
          if (!blob) continue;
          const cleanName = sanitizeStoragePart(photo.name || `befaring-${index + 1}.jpg`);
          const imagePath = `sales-activation/${authUser.id}/${projectId}/${Date.now()}-${index}-${cleanName}`;
          const { error: imageError } = await uploadStorageFile(activeSupabase, "project-images", imagePath, blob, {
            cacheControl: "3600",
            upsert: false,
          });
          if (imageError) throw new Error(`Kunne ikke lagre befaringsbilde i prosjektet: ${imageError.message}`);
          const { data: publicImage } = getStoragePublicUrl(activeSupabase, "project-images", imagePath);
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
        const projectDescription = [
          selectedRequest.note,
          inspectionSummary,
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
            changes: [],
            legacyTillegg: "",
            legacyFradrag: "",
            tillegg: "",
            fradrag: "",
            kommentar: "",
          },
          overtagelse: { enabled: false, dato: new Date().toISOString().slice(0, 10), kommentar: "", signUtførende: "", signKunde: "", signUtførendeImage: "", signKundeImage: "" },
          warranty: { enabled: false, issued: false, status: "draft" },
          projectLog: { enabled: false, draft: "", messages: [], lastReadByAdmin: "", lastReadByCustomer: "" },
          internalNotes: projectForm.note.trim(),
        };
        const { data: inserted, error: insertError } = await createSalesProject(activeSupabase, {
          id: projectId,
          title: projectForm.projectName.trim() || selectedRequest.address || "Uten navn",
          data: projectData,
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: activatedAt,
        });
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

  function openCustomerOfferPreview() {
    if (!selectedRequest) return;

    openCustomerOfferFromRequestId(selectedRequest.id);
  }

  async function handleCreateOfferRevisionAfterAcceptance() {
    if (!selectedRequest || selectedRequest.status !== "Akseptert") return;

    const acceptedVersionNumber =
      selectedRequest.acceptedOfferVersionNumber ||
      selectedRequest.sentOfferVersionNumber ||
      "";
    const confirmed = window.confirm(
      `Opprette en ny redigerbar tilbudsversjon basert på akseptert v${acceptedVersionNumber || "-"}?\n\nDen aksepterte versjonen og akseptbeviset beholdes låst. Den nye versjonen må publiseres og aksepteres på nytt.`
    );
    if (!confirmed) return;

    const acceptedHistoryEntry = {
      id: `accepted-offer-${selectedRequest.acceptedOfferVersionId || Date.now()}`,
      versionId: selectedRequest.acceptedOfferVersionId || selectedRequest.sentOfferVersionId || "",
      versionNumber: acceptedVersionNumber,
      acceptedBy: selectedRequest.acceptedBy || "",
      acceptedAt: selectedRequest.acceptedAt || "",
      acceptedTotal: Number(selectedRequest.acceptedTotal || 0),
      selectedOptions: selectedRequest.acceptedOptions || [],
      lines: selectedRequest.acceptedOfferLines || selectedRequest.offerLines || [],
      title: selectedRequest.acceptedOfferTitle || selectedRequest.offerTitle || selectedRequest.title || "Tilbud",
      intro: selectedRequest.acceptedOfferIntro || selectedRequest.offerIntro || "",
      reservations: selectedRequest.acceptedOfferReservations || selectedRequest.offerReservations || "",
      included: selectedRequest.acceptedOfferIncluded || selectedRequest.offerIncluded || "",
      excluded: selectedRequest.acceptedOfferExcluded || selectedRequest.offerExcluded || "",
      customerSupplied: selectedRequest.acceptedOfferCustomerSupplied || selectedRequest.offerCustomerSupplied || "",
      terms: selectedRequest.acceptedOfferTerms || selectedRequest.offerTerms || "",
      paymentTerms: selectedRequest.acceptedOfferPaymentTerms || selectedRequest.offerPaymentTerms || "",
      acceptanceProofFile: selectedRequest.acceptanceProofFile || null,
    };
    const existingHistory = Array.isArray(selectedRequest.acceptedOfferHistory)
      ? selectedRequest.acceptedOfferHistory
      : [];
    const historyAlreadyContainsVersion = existingHistory.some(
      (entry) =>
        entry.versionId === acceptedHistoryEntry.versionId &&
        entry.acceptedAt === acceptedHistoryEntry.acceptedAt
    );
    const nextHistory = historyAlreadyContainsVersion
      ? existingHistory
      : [...existingHistory, acceptedHistoryEntry];
    const nextRequest = {
      ...selectedRequest,
      offerTitle: acceptedHistoryEntry.title,
      offerIntro: acceptedHistoryEntry.intro,
      offerLines: acceptedHistoryEntry.lines,
      offerOptions: selectedRequest.offerOptions || [],
      offerReservations: acceptedHistoryEntry.reservations,
      offerIncluded: acceptedHistoryEntry.included,
      offerExcluded: acceptedHistoryEntry.excluded,
      offerCustomerSupplied: acceptedHistoryEntry.customerSupplied,
      offerTerms: acceptedHistoryEntry.terms,
      offerPaymentTerms: acceptedHistoryEntry.paymentTerms,
      offerTotal: getOfferTotal(acceptedHistoryEntry.lines),
      acceptedOfferHistory: nextHistory,
      offerRevisionDraftFromVersion: acceptedVersionNumber || true,
      offerRevisionDraftCreatedAt: new Date().toISOString(),
      sentOfferVersionId: null,
      sentOfferVersionNumber: null,
      sentOfferAt: null,
      acceptedBy: "",
      acceptedAt: "",
      acceptedOfferVersionId: null,
      acceptedOfferVersionNumber: null,
      acceptedOfferLines: [],
      acceptedOptionIds: [],
      acceptedOptions: [],
      acceptedTotal: null,
      acceptedPayload: null,
      acceptanceProofFile: null,
      acceptanceProofCreatedAt: "",
      status: "Tilbud",
      statusClass: "sales-status-quote",
      nextStep: "Rediger og publiser ny tilbudsversjon",
      iconName: "send",
    };
    const nextRequests = requests.map((request) =>
      request.id === selectedRequest.id ? nextRequest : request
    );

    setRequests(nextRequests);
    latestRequestsRef.current = nextRequests;
    try {
      await persistRequests(nextRequests);
      try {
        clearOfferDraft(
          getStableOfferDraftKey(selectedRequest.id),
          getScopedOfferDraftKey(selectedRequest.id)
        );
      } catch {
        // Den varige revisjonskladden er allerede lagret.
      }
      offerFormHydratedRequestIdRef.current = selectedRequest.id;
      setOfferForm(buildOfferFormFromRequest(nextRequest));
      setOfferFormReady(true);
      setOfferDraftSaveStatus("saved");
      setMode("offer-builder");
    } catch (error) {
      setRequests(requests);
      latestRequestsRef.current = requests;
      alert(error.message || "Kunne ikke opprette en ny tilbudsversjon.");
    }
  }

  function toggleAcceptedOption(optionId) {
    const activeOfferVersion = getActiveOfferVersion(selectedRequest);
    const offerOptions =
      activeOfferVersion?.options || selectedRequest?.offerOptions || [];
    const toggledOption = offerOptions.find((option) => option.id === optionId);

    setAcceptanceForm((current) => {
      if (current.selectedOptionIds.includes(optionId)) {
        return {
          ...current,
          selectedOptionIds: current.selectedOptionIds.filter(
            (id) => id !== optionId
          ),
        };
      }

      let nextSelectedOptionIds = [...current.selectedOptionIds];

      if (
        toggledOption?.optionType === "alternative" &&
        toggledOption?.replacementLineId
      ) {
        const conflictingAlternativeIds = new Set(
          offerOptions
            .filter(
              (option) =>
                option.id !== optionId &&
                option.optionType === "alternative" &&
                option.replacementLineId === toggledOption.replacementLineId
            )
            .map((option) => option.id)
        );

        nextSelectedOptionIds = nextSelectedOptionIds.filter(
          (id) => !conflictingAlternativeIds.has(id)
        );
      }

      return {
        ...current,
        selectedOptionIds: [...nextSelectedOptionIds, optionId],
      };
    });
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

      const { error } = await acceptSalesOffer(activeSupabase, {
        token: selectedRequest.publicToken,
        acceptedName: acceptanceForm.name.trim(),
        selectedOptions,
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
      storedDraft = loadStoredOfferDraft(selectedRequest?.id);
    } catch {
      storedDraft = null;
    }

    const nextOfferForm = normalizeStoredOfferDraft(storedDraft, selectedRequest);
    offerFormHydratedRequestIdRef.current = selectedRequest?.id || "";
    offerFormSavedBaselineRef.current = createOfferFormChangeSignature(nextOfferForm);
    setOfferForm(nextOfferForm);
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
    setOfferForm((current) => {
      const nextLines = current.lines.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      );

      return {
        ...current,
        lines: recalculateAdministrationLines(nextLines),
      };
    });
  }

  function addOfferLine(mainPost) {
    setOfferForm((current) => ({
      ...current,
      lines: [
        ...current.lines,
        createEmptyOfferLine(mainPost),
      ],
    }));
  }

  function addCustomMainPost() {
    const title = window.prompt("Navn på egen hovedpost:");

    if (!String(title || "").trim()) return;

    const mainPost = {
      id: `custom-${Date.now()}-${Math.random()}`,
      title: String(title).trim(),
    };

    setOfferForm((current) => ({
      ...current,
      lines: [...current.lines, createEmptyOfferLine(mainPost)],
    }));
  }

  function addAdministrationLine(mainPost) {
    setOfferForm((current) => {
      const alreadyExists = current.lines.some(
        (line) =>
          line.mainPostId === mainPost.id &&
          line.lineType === "administration"
      );

      if (alreadyExists) return current;

      return {
        ...current,
        lines: recalculateAdministrationLines([
          ...current.lines,
          createOfferAdministrationLine(mainPost),
        ]),
      };
    });
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

  function handleOfferLineAmountEnter(event, line) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const groupLines = offerForm.lines.filter(
      (item) =>
        item.mainPostId === line.mainPostId &&
        item.lineType !== "administration"
    );
    const currentIndex = groupLines.findIndex((item) => item.id === line.id);
    const nextLine = groupLines[currentIndex + 1];

    if (nextLine) {
      focusOfferLineDescription(nextLine.id);
      return;
    }

    const newLine = createEmptyOfferLine({
      id: line.mainPostId,
      title: line.mainPostTitle,
    });

    setOfferForm((current) => ({
      ...current,
      lines: [...current.lines, newLine],
    }));

    focusOfferLineDescription(newLine.id);
  }

  function focusOfferOptionTitle(optionId) {
    window.setTimeout(() => {
      const field = document.querySelector(
        `[data-offer-option-title="${optionId}"]`
      );

      if (field) {
        field.focus();
        field.select?.();
      }
    }, 0);
  }

  function handleOfferOptionAmountEnter(event, option) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const groupOptions = offerForm.options.filter(
      (item) => item.mainPostId === option.mainPostId
    );
    const currentIndex = groupOptions.findIndex(
      (item) => item.id === option.id
    );
    const nextOption = groupOptions[currentIndex + 1];

    if (nextOption) {
      focusOfferOptionTitle(nextOption.id);
      return;
    }

    const newOption = createEmptyOfferOption({
      id: option.mainPostId,
      title: option.mainPostTitle,
    });

    setOfferForm((current) => ({
      ...current,
      options: [...current.options, newOption],
    }));

    focusOfferOptionTitle(newOption.id);
  }

  async function removeOfferLine(lineId) {
    const line = offerFormRef.current.lines.find((item) => item.id === lineId);

    if (line?.attachmentFile?.path) {
      try {
        await removeOfferPdfAttachment(line.attachmentFile);
      } catch (error) {
        alert(error.message || "Kunne ikke fjerne PDF-vedlegget.");
        return;
      }
    }

    setOfferForm((current) => ({
      ...current,
      lines: recalculateAdministrationLines(
        current.lines.filter((item) => item.id !== lineId)
      ),
    }));
  }

  async function uploadOfferPdfAttachment(file, itemType, itemId) {
    if (integrationMode !== "app" || !activeSupabase || !authUser?.id) {
      throw new Error(
        "Du må være innlogget i Expo ProffDok for å laste opp PDF i tilbudet."
      );
    }

    if (!selectedRequestId) {
      throw new Error("Tilbudssaken mangler saksreferanse.");
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error("PDF-filen kan ikke være større enn 20 MB.");
    }

    const cleanName = sanitizeStoragePart(file.name || "tilbudsvedlegg.pdf");
    const path = `sales-offer-attachments/${authUser.id}/${sanitizeStoragePart(
      selectedRequestId
    )}/${itemType}/${sanitizeStoragePart(itemId)}/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await uploadStorageFile(
      activeSupabase,
      "project-images",
      path,
      file,
      {
        cacheControl: "3600",
        contentType: "application/pdf",
        upsert: false,
      }
    );
    if (uploadError) throw uploadError;

    const { data: publicFile } = getStoragePublicUrl(
      activeSupabase,
      "project-images",
      path
    );

    return {
      id: crypto.randomUUID(),
      name: file.name || "Tilbudsvedlegg.pdf",
      url: publicFile.publicUrl,
      path,
      type: "application/pdf",
      size: file.size,
      created: new Date().toISOString(),
      by: loggedInResponsible,
      customerVisible: true,
    };
  }

  async function removeOfferPdfAttachment(attachmentFile) {
    if (!attachmentFile?.path || !activeSupabase) return;

    const { error } = await removeStorageFiles(
      activeSupabase,
      "project-images",
      [attachmentFile.path]
    );
    if (error) throw error;
  }

  async function handleOfferLineFile(lineId, event) {
    const file = event.target.files?.[0];

    if (!file) return;
    event.target.value = "";

    const isPdf =
      file.type === "application/pdf" ||
      String(file.name || "").toLowerCase().endsWith(".pdf");

    if (isPdf) {
      try {
        const currentLine = offerFormRef.current.lines.find(
          (line) => line.id === lineId
        );
        const attachmentFile = await uploadOfferPdfAttachment(
          file,
          "line",
          lineId
        );

        if (currentLine?.attachmentFile?.path) {
          try {
            await removeOfferPdfAttachment(currentLine.attachmentFile);
          } catch (error) {
            console.warn("Kunne ikke rydde tidligere PDF-vedlegg", error);
          }
        }

        setOfferForm((current) => ({
          ...current,
          lines: current.lines.map((line) =>
            line.id === lineId ? { ...line, attachmentFile } : line
          ),
        }));
      } catch (error) {
        alert(error.message || "Kunne ikke laste opp PDF-vedlegget.");
      }
      return;
    }

    if (!String(file.type || "").startsWith("image/")) {
      alert("Velg et bilde eller en PDF-fil.");
      return;
    }

    readFileAsDataUrl(file)
      .then((imageDataUrl) => {
        setOfferForm((current) => ({
          ...current,
          lines: current.lines.map((line) =>
            line.id === lineId
              ? {
                  ...line,
                  imageDataUrl,
                  imageName: file.name,
                }
              : line
          ),
        }));
      })
      .catch(() => {
        alert("Kunne ikke lese bildefilen.");
      });
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

  async function removeOfferLineAttachment(lineId) {
    const line = offerFormRef.current.lines.find((item) => item.id === lineId);
    try {
      await removeOfferPdfAttachment(line?.attachmentFile);
      setOfferForm((current) => ({
        ...current,
        lines: current.lines.map((item) =>
          item.id === lineId ? { ...item, attachmentFile: null } : item
        ),
      }));
    } catch (error) {
      alert(error.message || "Kunne ikke fjerne PDF-vedlegget.");
    }
  }

  function addOfferOption(mainPost) {
    setOfferForm((current) => ({
      ...current,
      options: [...current.options, createEmptyOfferOption(mainPost)],
    }));
  }

  function focusOfferSaveButton() {
    window.setTimeout(() => {
      const saveButton = document.querySelector(
        '[data-sales-save-offer-button="true"]'
      );

      saveButton?.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
      });
      saveButton?.focus?.();
    }, 80);
  }

  function updateOfferOption(optionId, field, value) {
    setOfferForm((current) => ({
      ...current,
      options: current.options.map((option) => {
        if (option.id !== optionId) return option;

        if (field === "optionType") {
          const optionType =
            value === "alternative" ? "alternative" : "addition";

          return {
            ...option,
            optionType,
            replacementLineId:
              optionType === "alternative"
                ? option.replacementLineId || ""
                : "",
          };
        }

        return { ...option, [field]: value };
      }),
    }));

    if (
      field === "replacementLineId" &&
      String(value || "").trim() &&
      pendingInvalidAlternativeOptionIdRef.current === optionId
    ) {
      pendingInvalidAlternativeOptionIdRef.current = "";
      focusOfferSaveButton();
    }
  }

  async function removeOfferOption(optionId) {
    const option = offerFormRef.current.options.find(
      (item) => item.id === optionId
    );

    if (option?.attachmentFile?.path) {
      try {
        await removeOfferPdfAttachment(option.attachmentFile);
      } catch (error) {
        alert(error.message || "Kunne ikke fjerne PDF-vedlegget.");
        return;
      }
    }

    setOfferForm((current) => ({
      ...current,
      options: current.options.filter((item) => item.id !== optionId),
    }));
  }

  async function handleOfferOptionFile(optionId, event) {
    const file = event.target.files?.[0];

    if (!file) return;
    event.target.value = "";

    const isPdf =
      file.type === "application/pdf" ||
      String(file.name || "").toLowerCase().endsWith(".pdf");

    if (isPdf) {
      try {
        const currentOption = offerFormRef.current.options.find(
          (option) => option.id === optionId
        );
        const attachmentFile = await uploadOfferPdfAttachment(
          file,
          "option",
          optionId
        );

        if (currentOption?.attachmentFile?.path) {
          try {
            await removeOfferPdfAttachment(currentOption.attachmentFile);
          } catch (error) {
            console.warn("Kunne ikke rydde tidligere PDF-vedlegg", error);
          }
        }

        setOfferForm((current) => ({
          ...current,
          options: current.options.map((option) =>
            option.id === optionId ? { ...option, attachmentFile } : option
          ),
        }));
      } catch (error) {
        alert(error.message || "Kunne ikke laste opp PDF-vedlegget.");
      }
      return;
    }

    if (!String(file.type || "").startsWith("image/")) {
      alert("Velg et bilde eller en PDF-fil.");
      return;
    }

    readFileAsDataUrl(file)
      .then((imageDataUrl) => {
        setOfferForm((current) => ({
          ...current,
          options: current.options.map((option) =>
            option.id === optionId
              ? {
                  ...option,
                  imageDataUrl,
                  imageName: file.name,
                }
              : option
          ),
        }));
      })
      .catch(() => {
        alert("Kunne ikke lese bildefilen.");
      });
  }

  function removeOfferOptionImage(optionId) {
    setOfferForm((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.id === optionId
          ? { ...option, imageDataUrl: "", imageName: "" }
          : option
      ),
    }));
  }

  async function removeOfferOptionAttachment(optionId) {
    const option = offerFormRef.current.options.find(
      (item) => item.id === optionId
    );
    try {
      await removeOfferPdfAttachment(option?.attachmentFile);
      setOfferForm((current) => ({
        ...current,
        options: current.options.map((item) =>
          item.id === optionId ? { ...item, attachmentFile: null } : item
        ),
      }));
    } catch (error) {
      alert(error.message || "Kunne ikke fjerne PDF-vedlegget.");
    }
  }

  async function saveOfferAndReturnToDetail() {
    const {
      cleanLines,
      cleanOptions,
      incompleteLine,
      incompleteOption,
      invalidAlternativeOption,
    } = prepareOfferFormForSave(offerForm);

    if (!cleanLines.length) {
      alert("Legg inn minst én tilbudslinje før du lagrer tilbudet.");
      return false;
    }

    if (incompleteLine) {
      alert("Tilbudslinjer som har innhold må ha både beskrivelse og beløp. Tomme linjer ignoreres automatisk.");
      return false;
    }

    if (incompleteOption) {
      alert("Opsjoner som har innhold må ha både tittel og beløp. Tomme opsjoner ignoreres automatisk.");
      return false;
    }

    if (invalidAlternativeOption) {
      pendingInvalidAlternativeOptionIdRef.current =
        invalidAlternativeOption.id || "";

      const optionTitle =
        invalidAlternativeOption.title || "Alternativ opsjon";
      const mainPostTitle =
        invalidAlternativeOption.mainPostTitle || "aktuell hovedpost";

      if (invalidAlternativeOption.id) {
        setOfferValidationJump({
          optionId: invalidAlternativeOption.id,
          message: `Opsjonen "${optionTitle}" under "${mainPostTitle}" må kobles til underposten den erstatter før tilbudet kan lagres.`,
          token: `${Date.now()}-${Math.random()}`,
        });
      }
      return false;
    }

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
      return false;
    }

    try {
      offerModeRef.current = "detail";
      clearOfferDraft(
        getStableOfferDraftKey(selectedRequestId),
        getScopedOfferDraftKey(selectedRequestId)
      );
    } catch {
      // Varig lagring er fullført selv om lokal kladd ikke kan ryddes.
    }

    offerFormSavedBaselineRef.current = createOfferFormChangeSignature({
      ...offerForm,
      lines: cleanLines,
      options: cleanOptions,
    });
    setMode("detail");
    return true;
  }

  async function handleSaveOffer(event) {
    event.preventDefault();
    await saveOfferAndReturnToDetail();
  }

  async function handleSaveOfferTemplate() {
    if (offerTemplateSaveBusy) return;

    if (
      integrationMode === "app" &&
      (!activeSupabase || !salesCompanyId || !authUser?.id)
    ) {
      alert(
        salesStorageError ||
          "Tilbudsmalen kan ikke lagres før firmatilknytningen er klar."
      );
      return;
    }

    if (!activeSupabase || !salesCompanyId || !authUser?.id) {
      alert("Tilbudsmaler krever innlogging og firmatilknytning.");
      return;
    }

    const suggestedName =
      String(offerForm.title || "").trim() ||
      String(selectedRequest?.title || "").trim() ||
      "Tilbudsmal";

    const enteredName = window.prompt(
      "Gi tilbudsmalen et navn:",
      suggestedName
    );

    if (enteredName === null) return;

    const templateName = enteredName.trim();

    if (!templateName) {
      alert("Skriv inn et navn på tilbudsmalen.");
      return;
    }

    const {
      cleanLines,
      cleanOptions,
      incompleteLine,
      incompleteOption,
      invalidAlternativeOption,
    } = prepareOfferFormForSave(offerForm);

    if (!cleanLines.length) {
      alert("Legg inn minst én tilbudslinje før du lagrer som mal.");
      return;
    }

    if (incompleteLine) {
      alert(
        "Tilbudslinjer som har innhold må ha både beskrivelse og beløp før tilbudet kan lagres som mal."
      );
      return;
    }

    if (incompleteOption) {
      alert(
        "Opsjoner som har innhold må ha både tittel og beløp før tilbudet kan lagres som mal."
      );
      return;
    }

    if (invalidAlternativeOption) {
      pendingInvalidAlternativeOptionIdRef.current =
        invalidAlternativeOption.id || "";

      const optionTitle =
        invalidAlternativeOption.title || "Alternativ opsjon";
      const mainPostTitle =
        invalidAlternativeOption.mainPostTitle || "aktuell hovedpost";

      if (invalidAlternativeOption.id) {
        setOfferValidationJump({
          optionId: invalidAlternativeOption.id,
          message: `Opsjonen "${optionTitle}" under "${mainPostTitle}" må kobles til underposten den erstatter før tilbudet kan lagres som mal.`,
          token: `${Date.now()}-${Math.random()}`,
        });
      }
      return;
    }

    const templatePayload = {
      title: String(offerForm.title || "").trim(),
      intro: String(offerForm.intro || "").trim(),
      lines: cleanLines.map((line) => ({
        ...line,
        imageDataUrl: "",
        imageName: "",
        attachmentFile: null,
      })),
      options: cleanOptions.map((option) => ({
        ...option,
        imageDataUrl: "",
        imageName: "",
        attachmentFile: null,
      })),
      reservations: String(offerForm.reservations || "").trim(),
      included: String(offerForm.included || "").trim(),
      excluded: String(offerForm.excluded || "").trim(),
      customerSupplied: String(offerForm.customerSupplied || "").trim(),
      terms: String(offerForm.terms || "").trim(),
      paymentTerms: String(offerForm.paymentTerms || "").trim(),
      validityDays: String(offerForm.validityDays || "30"),
    };

    setOfferTemplateSaveBusy(true);

    try {
      const { error } = await insertSalesOfferTemplate(activeSupabase, {
        companyId: salesCompanyId,
        name: templateName,
        payload: templatePayload,
        createdBy: authUser.id,
      });

      if (error) throw error;

      alert(`Tilbudsmalen "${templateName}" er lagret for firmaet.`);
    } catch (error) {
      console.error("Kunne ikke lagre tilbudsmal", error);

      if (error?.code === "23505") {
        alert(
          `Firmaet har allerede en tilbudsmal som heter "${templateName}". Velg et annet navn.`
        );
      } else {
        alert(error?.message || "Kunne ikke lagre tilbudsmalen.");
      }
    } finally {
      setOfferTemplateSaveBusy(false);
    }
  }

  async function handleOfferBuilderBack() {
    const currentSignature = createOfferFormChangeSignature(offerFormRef.current);
    const hasChanges =
      Boolean(offerFormSavedBaselineRef.current) &&
      currentSignature !== offerFormSavedBaselineRef.current;

    if (!hasChanges) {
      offerModeRef.current = "detail";
      setMode("detail");
      return;
    }

    const shouldSave = window.confirm(
      "Du har endringer i tilbudet siden du åpnet det. Vil du lagre tilbudet før du går tilbake?\n\nOK = lagre og gå tilbake.\nAvbryt = fortsett å redigere.\n\nKladden er allerede mellomlagret automatisk som sikkerhet."
    );

    if (!shouldSave) return;

    await saveOfferAndReturnToDetail();
  }

  function getInspectionDraftKey(requestId = selectedRequestId) {
    return buildInspectionDraftKey(salesStorageKey, requestId);
  }

  function saveInspectionDraft(nextForm) {
    if (!selectedRequestId) return;
    saveStoredInspectionDraft(
      getInspectionDraftKey(selectedRequestId),
      nextForm
    );
  }

  function clearInspectionDraft(requestId = selectedRequestId) {
    if (!requestId) return;
    clearStoredInspectionDraft(getInspectionDraftKey(requestId));
  }

  function openInspectionNote() {
    const draft = loadInspectionDraft(
      getInspectionDraftKey(selectedRequest?.id)
    );

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
      readFileAsDataUrl(file)
        .then((dataUrl) => {
          setInspectionForm((current) => ({
            ...current,
            photos: [
              ...current.photos,
              {
                id: `${Date.now()}-${Math.random()}`,
                name: file.name,
                dataUrl,
              },
            ],
          }));
        })
        .catch(() => {});
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
          const { error: uploadError } = await uploadStorageFile(activeSupabase, INSPECTION_BUCKET, path, blob, {
            contentType: "image/jpeg",
            upsert: false,
          });
          if (uploadError) throw uploadError;
          const { data: signed } = await createStorageSignedUrl(
            activeSupabase,
            INSPECTION_BUCKET,
            path,
            60 * 60 * 24 * 7
          );
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
      responsible: loggedInResponsible,
      note: selectedRequest?.surveyNote || "",
      sendConfirmation: Boolean(
        selectedRequest?.email && !selectedRequest?.surveyConfirmationSentAt
      ),
    });
    setMode("survey-plan");
  }

  function updateSurveyForm(field, value) {
    setSurveyForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSaveSurveyPlan(event) {
    event.preventDefault();

    const previousRequest = selectedRequest;
    const surveyChanged = Boolean(
      previousRequest?.surveyDate !== surveyForm.date ||
        previousRequest?.surveyTime !== surveyForm.time ||
        getResponsibleDisplayName(previousRequest?.surveyResponsible) !== loggedInResponsible ||
        (previousRequest?.surveyNote || "") !== surveyForm.note.trim()
    );
    let shouldSendConfirmation = Boolean(
      surveyForm.sendConfirmation && previousRequest?.email
    );

    if (previousRequest?.surveyConfirmationSentAt && surveyChanged && previousRequest?.email) {
      shouldSendConfirmation = window.confirm(
        "Befaringen er endret etter at kunden fikk bekreftelsen. Vil du sende en oppdatert befaringsbekreftelse nå?"
      );
    }

    const savedAt = new Date().toISOString();
    const nextRequests = requests.map((request) =>
      request.id === selectedRequestId
        ? {
            ...request,
            surveyDate: surveyForm.date,
            surveyTime: surveyForm.time,
            surveyResponsible: loggedInResponsible,
            surveyNote: surveyForm.note.trim(),
            status: "Befaring",
            statusClass: "sales-status-survey",
            nextStep:
              request.nextStep === "Opprett tilbud"
                ? "Opprett tilbud"
                : "Fullfør befaringsnotat",
            iconName: request.nextStep === "Opprett tilbud" ? "send" : "ruler",
          }
        : request
    );
    const savedRequest = nextRequests.find((request) => request.id === selectedRequestId);

    setRequests(nextRequests);
    latestRequestsRef.current = nextRequests;
    try {
      await persistRequests(nextRequests);
    } catch (error) {
      alert(error.message || "Kunne ikke lagre befaringsplanen varig.");
      return;
    }

    if (shouldSendConfirmation && savedRequest?.email) {
      setCustomerEmailBusy(true);
      setCustomerEmailFeedback(null);
      try {
        const company = await getCompanyProfileForPublish();
        await sendSalesCustomerEmail(activeSupabase, {
          direction: "inspection_confirmation",
          toEmail: savedRequest.email,
          subject: `Befaringsbekreftelse – ${savedRequest.title}`,
          projectName: savedRequest.title,
          customerName: savedRequest.customer,
          customerEmail: savedRequest.email,
          customerPhone: savedRequest.phone,
          projectAddress: savedRequest.address,
          projectResponsible: loggedInResponsible,
          fromName: company.companyName || loggedInResponsible,
          message: buildInspectionConfirmationMessage({
            date: surveyForm.date,
            time: surveyForm.time,
            note: surveyForm.note.trim(),
            responsible: loggedInResponsible,
            responsibleContactEmail,
            responsibleContactPhone,
          }),
          projectLink: "",
          companyLogoUrl: company.logoUrl,
          footerCompanyText: company.companyName || "Expo ProffDok",
          sentViaText: "Befaringsbekreftelse sendt gjennom Expo ProffDok",
        });

        const sentRequests = nextRequests.map((request) =>
          request.id === selectedRequestId
            ? {
                ...request,
                surveyConfirmationSentAt: savedAt,
                surveyConfirmationSentTo: savedRequest.email,
              }
            : request
        );
        setRequests(sentRequests);
        latestRequestsRef.current = sentRequests;
        await persistRequests(sentRequests);
        setCustomerEmailFeedback({
          type: "success",
          text: previousRequest?.surveyConfirmationSentAt
            ? "Oppdatert befaringsbekreftelse er sendt til kunden."
            : "Befaringsbekreftelsen er sendt til kunden.",
        });
      } catch (error) {
        setCustomerEmailFeedback({
          type: "error",
          text: `Befaringen er lagret, men e-posten kunne ikke sendes: ${error.message || "Ukjent feil"}`,
        });
        alert(`Befaringen er lagret, men e-posten kunne ikke sendes. ${error.message || ""}`);
      } finally {
        setCustomerEmailBusy(false);
      }
    }

    setMode("detail");
  }

  async function resendInspectionConfirmation(request) {
    if (!request?.email || !request?.surveyDate || !request?.surveyTime || customerEmailBusy) {
      return;
    }

    setCustomerEmailBusy(true);
    setCustomerEmailFeedback(null);
    try {
      const company = await getCompanyProfileForPublish();
      await sendSalesCustomerEmail(activeSupabase, {
        direction: "inspection_confirmation",
        toEmail: request.email,
        subject: `Befaringsbekreftelse – ${request.title}`,
        projectName: request.title,
        customerName: request.customer,
        customerEmail: request.email,
        customerPhone: request.phone,
        projectAddress: request.address,
        projectResponsible: getResponsibleDisplayName(request.surveyResponsible || request.responsible),
        fromName: company.companyName || loggedInResponsible,
        message: buildInspectionConfirmationMessage({
          date: request.surveyDate,
          time: request.surveyTime,
          note: request.surveyNote || "",
          responsible: getResponsibleDisplayName(request.surveyResponsible || request.responsible),
          responsibleContactEmail,
          responsibleContactPhone,
        }),
        projectLink: "",
        companyLogoUrl: company.logoUrl,
        footerCompanyText: company.companyName || "Expo ProffDok",
        sentViaText: "Befaringsbekreftelse sendt gjennom Expo ProffDok",
      });

      const sentAt = new Date().toISOString();
      const sentRequests = requests.map((item) =>
        item.id === request.id
          ? {
              ...item,
              surveyConfirmationSentAt: sentAt,
              surveyConfirmationSentTo: request.email,
            }
          : item
      );
      setRequests(sentRequests);
      latestRequestsRef.current = sentRequests;
      await persistRequests(sentRequests);
      setCustomerEmailFeedback({ type: "success", text: "Befaringsbekreftelsen er sendt til kunden." });
    } catch (error) {
      setCustomerEmailFeedback({ type: "error", text: `E-posten kunne ikke sendes: ${error.message || "Ukjent feil"}` });
      alert(`E-posten kunne ikke sendes. ${error.message || ""}`);
    } finally {
      setCustomerEmailBusy(false);
    }
  }

  async function sendOfferEmail(requestId, { publishFirst = true } = {}) {
    if (customerEmailBusy) return;
    const request = requests.find((item) => item.id === requestId);
    if (!request?.email) {
      alert("Kunden mangler e-postadresse.");
      return;
    }

    setCustomerEmailBusy(true);
    setCustomerEmailFeedback(null);
    try {
      const link = publishFirst
        ? await publishOfferAndGetLink(requestId)
        : buildCustomerOfferLink(window.location.href, request.publicToken);
      const currentRequest = latestRequestsRef.current.find((item) => item.id === requestId) || request;
      const company = await getCompanyProfileForPublish();

      await sendSalesCustomerEmail(activeSupabase, {
        direction: "sales_offer",
        toEmail: currentRequest.email,
        subject: `Tilbud – ${currentRequest.offerTitle || currentRequest.title}`,
        projectName: currentRequest.offerTitle || currentRequest.title,
        customerName: currentRequest.customer,
        customerEmail: currentRequest.email,
        customerPhone: currentRequest.phone,
        projectAddress: currentRequest.address,
        projectResponsible: currentRequest.responsible || loggedInResponsible,
        fromName: company.companyName || loggedInResponsible,
        message: `Tilbud nr. ${currentRequest.id}${currentRequest.sentOfferVersionNumber ? ` – versjon v${currentRequest.sentOfferVersionNumber}` : ""}. Åpne tilbudet for å se arbeider, priser, opsjoner og vilkår.`,
        projectLink: link,
        buttonText: "Åpne tilbud",
        companyLogoUrl: company.logoUrl,
        footerCompanyText: company.companyName || "Expo ProffDok",
        sentViaText: "Tilbud sendt gjennom Expo ProffDok",
      });

      const sentAt = new Date().toISOString();
      const sentRequests = latestRequestsRef.current.map((item) =>
        item.id === requestId
          ? {
              ...item,
              offerEmailSentAt: sentAt,
              offerEmailSentTo: item.email,
              offerEmailVersionNumber: item.sentOfferVersionNumber || null,
            }
          : item
      );
      latestRequestsRef.current = sentRequests;
      setRequests(sentRequests);
      await persistRequests(sentRequests);
      setCustomerEmailFeedback({ type: "success", text: "Tilbudet er sendt til kunden på e-post." });
    } catch (error) {
      setCustomerEmailFeedback({
        type: "error",
        text: `Tilbudet kan være publisert, men e-posten kunne ikke sendes: ${error.message || "Ukjent feil"}`,
      });
      alert(`Tilbudet kan være publisert, men e-posten kunne ikke sendes. ${error.message || ""}`);
    } finally {
      setCustomerEmailBusy(false);
    }
  }

  async function publishOfferAndGetLink(requestId) {
    const currentRequests = latestRequestsRef.current;
    const request = currentRequests.find((item) => item.id === requestId);
    const profileForPublish = await getCompanyProfileForPublish();

    const result = await publishSalesOfferAndBuildLink({
      client: activeSupabase,
      request,
      requests: currentRequests,
      companyProfile: profileForPublish,
      currentUrl: window.location.href,
      confirmOptionRemoval: (previousOptionCount) =>
        window.confirm(
          `ADVARSEL: Sist publiserte tilbud hadde ${previousOptionCount} opsjon${
            previousOptionCount === 1 ? "" : "er"
          }, men tilbudet du nå publiserer har 0.\n\nHvis du fortsetter, publiseres en ny tilbudsversjon uten opsjoner.\n\nVil du virkelig fortsette?`
        ),
    });

    latestRequestsRef.current = result.nextRequests;
    setRequests(result.nextRequests);
    await persistRequests(result.nextRequests);

    // Publisering skal aldri endre hvor proffen befinner seg i appen.
    setSelectedRequestId(requestId);
    setMode("detail");
    saveSalesNavigation(salesStorageKey, "detail", requestId);
    setPublishFeedback(result.publishFeedback);

    return result.link;
  }

  async function openCustomerOfferFromRequestId(requestId) {
    const request =
      latestRequestsRef.current.find((item) => item.id === requestId) ||
      requests.find((item) => item.id === requestId);

    if (!request) {
      alert("Fant ikke tilbudssaken.");
      return;
    }

    const hasUnpublishedChanges = Boolean(
      request.status === "Tilbud" &&
        request.offerLines?.length &&
        !request.sentOfferVersionId
    );

    try {
      if (hasUnpublishedChanges) {
        // Publiser er én handling: gjør tilbudet synlig for kunden og bli på saken.
        await publishOfferAndGetLink(requestId);
        return;
      }

      if (!request.publicToken) {
        alert("Tilbudet er ikke publisert ennå.");
        return;
      }

      // Se kundens tilbud er en egen handling og åpner kundevisningen i ny fane.
      const link = buildCustomerOfferLink(window.location.href, request.publicToken);
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert(
        error.message ||
          (hasUnpublishedChanges
            ? "Kunne ikke publisere tilbudet."
            : "Kunne ikke åpne kundens tilbud.")
      );
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

    const { data, error } = await getSalesOfferByToken(activeSupabase, token);

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

  async function handleCreateDirectOffer(event) {
    event.preventDefault();
    if (!validateRequiredCustomerFields()) return;

    const customerName = form.customer.trim();
    const nextRequest = {
      id: createRequestId(requests),
      title: form.title,
      customer: customerName,
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      postnr: form.postnr.trim(),
      city: form.city.trim(),
      source: form.source,
      note: form.note.trim(),
      responsible: loggedInResponsible,
      projectResponsible: loggedInResponsible,
      directOffer: true,
      offerTitle: `Tilbud – ${form.title}`,
      offerIntro: `Vi tilbyr med dette følgende arbeider for ${customerName}.`,
      offerLines: [],
      offerOptions: [],
      offerTotal: 0,
      status: "Tilbud",
      statusClass: "sales-status-quote",
      nextStep: "Opprett tilbud",
      iconName: "send",
    };

    const nextRequests = [nextRequest, ...requests];
    setRequests(nextRequests);
    latestRequestsRef.current = nextRequests;

    try {
      await persistRequests(nextRequests);
    } catch (error) {
      alert(error.message || "Kunne ikke opprette tilbudssaken varig.");
      return;
    }

    const initialOfferForm = buildOfferFormFromRequest(nextRequest);
    offerFormHydratedRequestIdRef.current = nextRequest.id;
    offerFormSavedBaselineRef.current = createOfferFormChangeSignature(initialOfferForm);
    setOfferForm(initialOfferForm);
    setOfferFormReady(true);
    setOfferDraftSaveStatus("saved");
    resetForm();
    setSelectedRequestId(nextRequest.id);
    setMode("offer-builder");
  }

  async function handleCreateRequest(event) {
    event.preventDefault();
    if (!validateRequiredCustomerFields()) return;

    const nextRequest = {
      id: createRequestId(requests),
      title: form.title,
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      postnr: form.postnr.trim(),
      city: form.city.trim(),
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

  if (mode === "new" || mode === "new-offer" || mode === "edit-request") {
    const isEditingRequest = mode === "edit-request";
    const isDirectOffer = mode === "new-offer";
    return (
      <SalesRequestForm
        form={form}
        isEditingRequest={isEditingRequest}
        isDirectOffer={isDirectOffer}
        onBack={goToList}
        onCancel={() => {
          resetForm();
          if (isEditingRequest) setMode("detail");
          else goToList();
        }}
        onSubmit={
          isEditingRequest
            ? handleUpdateRequest
            : isDirectOffer
              ? handleCreateDirectOffer
              : handleCreateRequest
        }
        onUpdateForm={updateForm}
      />
    );
  }

  if (mode === "project-activation" && selectedRequest) {
    return (
      <SalesProjectActivation
        selectedRequest={selectedRequest}
        projectForm={projectForm}
        projectActivationBusy={projectActivationBusy}
        onBack={() => setMode("detail")}
        onSubmit={handleActivateProject}
        onUpdateProjectForm={updateProjectForm}
      />
    );
  }

  if (
    publicOfferLoading ||
    publicOfferError ||
    (selectedRequest &&
      (mode === "customer-accepted" || mode === "customer-offer"))
  ) {
    return (
      <SalesCustomerView
        publicOfferLoading={publicOfferLoading}
        publicOfferError={publicOfferError}
        mode={mode}
        selectedRequest={selectedRequest}
        companyProfile={companyProfile}
        acceptanceForm={acceptanceForm}
        setAcceptanceForm={setAcceptanceForm}
        toggleAcceptedOption={toggleAcceptedOption}
        handleAcceptOffer={handleAcceptOffer}
        onBack={() => setMode("detail")}
      />
    );
  }

  if (mode === "offer-builder" && selectedRequest) {
    return (
      <SalesOfferBuilder
        selectedRequest={selectedRequest}
        offerForm={offerForm}
        offerDraftSaveStatus={offerDraftSaveStatus}
        offerTemplateSaveBusy={offerTemplateSaveBusy}
        onBack={handleOfferBuilderBack}
        handleSaveOffer={handleSaveOffer}
        handleSaveOfferTemplate={handleSaveOfferTemplate}
        addInspectionContextToOfferIntro={addInspectionContextToOfferIntro}
        updateOfferForm={updateOfferForm}
        updateOfferLine={updateOfferLine}
        handleOfferLineAmountEnter={handleOfferLineAmountEnter}
        handleOfferLineFile={handleOfferLineFile}
        removeOfferLineImage={removeOfferLineImage}
        removeOfferLineAttachment={removeOfferLineAttachment}
        removeOfferLine={removeOfferLine}
        addOfferLine={addOfferLine}
        addCustomMainPost={addCustomMainPost}
        addAdministrationLine={addAdministrationLine}
        updateOfferOption={updateOfferOption}
        handleOfferOptionAmountEnter={handleOfferOptionAmountEnter}
        handleOfferOptionFile={handleOfferOptionFile}
        removeOfferOptionImage={removeOfferOptionImage}
        removeOfferOptionAttachment={removeOfferOptionAttachment}
        removeOfferOption={removeOfferOption}
        addOfferOption={addOfferOption}
        offerValidationJump={offerValidationJump}
        onOfferValidationJumpHandled={() => setOfferValidationJump(null)}
      />
    );
  }

  if (mode === "inspection-note" && selectedRequest) {
    return (
      <SalesInspectionNote
        selectedRequest={selectedRequest}
        inspectionForm={inspectionForm}
        loggedInResponsible={loggedInResponsible}
        onBack={() => setMode("detail")}
        onSubmit={handleSaveInspectionNote}
        onUpdateInspectionForm={updateInspectionForm}
        onInspectionPhotos={handleInspectionPhotos}
        onRemoveInspectionPhoto={removeInspectionPhoto}
      />
    );
  }

if (mode === "survey-plan" && selectedRequest) {
  return (
    <SalesSurveyPlan
      selectedRequest={selectedRequest}
      surveyForm={surveyForm}
      loggedInResponsible={loggedInResponsible}
      customerEmailBusy={customerEmailBusy}
      onBack={() => setMode("detail")}
      onSubmit={handleSaveSurveyPlan}
      onUpdateSurveyForm={updateSurveyForm}
    />
  );
}

  if (mode === "detail" && selectedRequest) {
    return (
      <SalesDetailView
        {...{
          acceptanceProofBusy,
          acceptanceProofError,
          offerPdfBusy,
          offerPdfError,
          contractUploadBusy,
          contractUploadError,
          copyCustomerOfferLink,
          customerEmailBusy,
          customerEmailFeedback,
          customerLinkCopied,
          goToList,
          handleContractUpload,
          handleCreateAcceptanceProof,
          handleDownloadPublishedOfferPdf,
          handleCreateOfferRevisionAfterAcceptance,
          handleRemoveContract,
          loggedInResponsible,
          openCustomerOfferFromRequestId,
          openCustomerOfferPreview,
          openEditRequest,
          openInspectionNote,
          openOfferBuilder,
          openOutlookCalendar,
          openProjectActivation,
          openSurveyPlanning,
          publishFeedback,
          resendInspectionConfirmation,
          selectedInspectionPhoto,
          selectedRequest,
          sendOfferEmail,
          setSelectedInspectionPhoto,
          summary,
        }}
      />
    );
  }

  return (
    <SalesListView
      activeRequests={activeRequests}
      activatedRequests={activatedRequests}
      summary={summary}
      onCreateRequest={() => setMode("new")}
      onOpenRequest={(requestId) => {
        setSelectedRequestId(requestId);
        setMode("detail");
      }}
    />
  );
}
