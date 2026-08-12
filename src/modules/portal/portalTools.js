// FASE 24B PORTALMODUL: Flytter eksisterende tilgangskode-logikk og kundeportalvisning ut av main.jsx uten funksjonsendring.
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Camera, FileText, Building2, ClipboardCheck, BadgeCheck, Download } from 'lucide-react';

const import_jsx_runtime = { jsx, jsxs, Fragment };
const import_lucide_react = { Camera, FileText, Building2, ClipboardCheck, BadgeCheck, Download };

export function createPortalAccessTools(ctx = {}) {
  const {
    project, projectId, projectIsLocked, portalAccessRoleParam, isAdminProjectLink,
    portalAccessGranted, portalAccessStorageKey, portalAccessInput, portalAccessError,
    setPortalAccessGranted, setPortalAccessInput, setPortalAccessError,
    supabase, dataFromRow, authUser, profile, user, setProject, company, name,
    Brand, Section, Input
  } = ctx;
  const portalAccessKeyForRole = (role = "kunde") => {
    const clean = String(role || "").toLowerCase();
    return clean === "underleverandor" || clean === "underleverandør" || clean === "underleverand\xF8r" || clean === "underleverandor" || clean === "underentreprenør" ? "underleverandor" : "kunde";
  };
  const portalAccessLabelForRole = (role = "kunde") => portalAccessKeyForRole(role) === "underleverandor" ? "underentreprenør" : "kunde";
  const normalizePortalAccessCode = (value = "") => String(value || "").trim().replace(/\s+/g, "").toUpperCase();
  const makePortalAccessCode = (length = 6) => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const values = new Uint32Array(length);
    if (window?.crypto?.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (let i = 0; i < length; i += 1) values[i] = Math.floor(Math.random() * 1e9);
    }
    return Array.from(values).map((value) => alphabet[value % alphabet.length]).join("");
  };
  const addMonthsIsoDateTime = (months = 6) => {
    const d = /* @__PURE__ */ new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString();
  };
  const addDaysIsoDateTime = (sourceValue = "", days = 30) => {
    const d = sourceValue ? new Date(sourceValue) : /* @__PURE__ */ new Date();
    if (Number.isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };
  const formatPortalAccessExpiry = (value = "") => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString("no-NO", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      return value;
    }
  };
  const portalAccessProjectIsLocked = (projectValue = project) => projectIsLocked(projectValue);
  const getPortalLockedGraceExpiresAt = (projectValue = project, fallbackRecord = {}) => {
    const source = projectValue?.lockedAt || projectValue?.locked_at || fallbackRecord?.lockedAt || fallbackRecord?.createdAt || fallbackRecord?.expiresAt || "";
    return addDaysIsoDateTime(source || (/* @__PURE__ */ new Date()).toISOString(), 30);
  };
  const portalAccessPolicyText = (projectValue = project, record = {}) => {
    if (portalAccessProjectIsLocked(projectValue)) {
      const grace = getPortalLockedGraceExpiresAt(projectValue, record);
      return grace ? `Tilgangen er gyldig i 30 dager etter at prosjektet ble låst/arkivert, til ${formatPortalAccessExpiry(grace)}.` : "Tilgangen er gyldig i 30 dager etter at prosjektet ble låst/arkivert.";
    }
    return "Tilgangen er gyldig så lenge prosjektet er aktivt. Etter låsing/arkivering beholdes tilgangen i 30 dager.";
  };
  const getPortalAccessMap = (projectValue = project) => projectValue?.portalAccess && typeof projectValue.portalAccess === "object" ? projectValue.portalAccess : {};
  const getPortalAccessRecord = (projectValue = project, role = "kunde") => {
    const key = portalAccessKeyForRole(role);
    const map = getPortalAccessMap(projectValue);
    return map?.[key] || {};
  };
  const portalAccessRecordIsValid = (record = {}, projectValue = project) => {
    const code = normalizePortalAccessCode(record?.code);
    if (!code) return false;
    if (!portalAccessProjectIsLocked(projectValue)) return true;
    const graceExpiresAt = getPortalLockedGraceExpiresAt(projectValue, record);
    const expires = new Date(graceExpiresAt).getTime();
    return Number.isFinite(expires) && expires > Date.now();
  };
  const portalAccessLine = (record = {}, projectValue = project) => {
    if (!record?.code) return "";
    return `

  Tilgangskode: ${record.code}
  ${portalAccessPolicyText(projectValue, record)}`;
  };
  const portalAccessClipboardText = ({
    link = "",
    record = {},
    roleParam = "kunde",
    projectValue = project
  } = {}) => {
    const cleanLink = String(link || "").trim();
    const linkLabel = roleParam === "underleverandor" ? "Underentreprenørlenke" : "Kundelenke";
    if (!record?.code) return `${linkLabel}:\n${cleanLink}`;
    return `${linkLabel}:\n${cleanLink}\n\nTilgangskode: ${normalizePortalAccessCode(record.code)}\n\n${portalAccessPolicyText(projectValue, record)}`;
  };
  const ensurePortalAccessForProject = async ({ id, roleParam = "kunde", forceNew = false } = {}) => {
    const targetId = id || projectId;
    if (!targetId) return null;
    const key = portalAccessKeyForRole(roleParam);
    const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", targetId).maybeSingle();
    if (fetchError || !existing) {
      console.warn("Kunne ikke hente prosjekt for tilgangskode:", fetchError?.message || "Fant ikke prosjekt");
      return null;
    }
    const existingData = dataFromRow(existing);
    const projectData = { ...existingData.project || {} };
    const currentMap = getPortalAccessMap(projectData);
    const currentRecord = currentMap?.[key] || {};
    if (!forceNew && portalAccessRecordIsValid(currentRecord, projectData)) return currentRecord;
    const nextRecord = {
      code: makePortalAccessCode(6),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: "",
      accessPolicy: "active_project_plus_locked_30_days",
      lockedGraceDays: 30,
      role: key,
      updatedBy: authUser?.email || profile?.email || user?.email || ""
    };
    const nextProject = {
      ...projectData,
      portalAccess: {
        ...currentMap,
        [key]: nextRecord
      }
    };
    const cleanData = JSON.parse(JSON.stringify({
      ...existingData,
      project: nextProject
    }));
    const { error: updateError } = await supabase.from("projects").update({
      data: cleanData,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", targetId);
    if (updateError) {
      console.warn("Kunne ikke lagre tilgangskode:", updateError.message);
      return null;
    }
    if (targetId === projectId) {
      setProject((prev) => ({
        ...prev,
        portalAccess: {
          ...getPortalAccessMap(prev),
          [key]: nextRecord
        }
      }));
    }
    return nextRecord;
  };
  const sessionPortalAccessIsVerified = (storageKey = "", record = {}) => {
    if (!storageKey || !portalAccessRecordIsValid(record, project)) return false;
    try {
      return normalizePortalAccessCode(window.sessionStorage.getItem(storageKey) || "") === normalizePortalAccessCode(record.code);
    } catch {
      return false;
    }
  };
  const portalAccessRecord = portalAccessRoleParam ? getPortalAccessRecord(project, portalAccessRoleParam) : {};
  const portalAccessRequired = !!portalAccessRoleParam && !isAdminProjectLink;
  const portalAccessOk = !portalAccessRequired || (portalAccessGranted && portalAccessRecordIsValid(portalAccessRecord, project)) || sessionPortalAccessIsVerified(portalAccessStorageKey, portalAccessRecord);
  const verifyPortalAccessCode = (roleParam = "kunde") => {
    const record = getPortalAccessRecord(project, roleParam);
    if (!portalAccessRecordIsValid(record, project)) {
      setPortalAccessError("Tilgangskoden er utløpt eller mangler. Be prosjektansvarlig sende en ny tilgang.");
      return;
    }
    if (normalizePortalAccessCode(portalAccessInput) !== normalizePortalAccessCode(record.code)) {
      setPortalAccessError("Feil tilgangskode. Kontroller koden i e-posten og prøv igjen.");
      return;
    }
    const storageKey = projectId ? `expoProffDokPortalAccess:${projectId}:${portalAccessKeyForRole(roleParam)}` : "";
    try {
      if (storageKey) window.sessionStorage.setItem(storageKey, normalizePortalAccessCode(record.code));
    } catch {
    }
    setPortalAccessGranted(true);
    setPortalAccessError("");
  };
  const renderPortalAccessGate = (roleParam = "kunde") => {
    const roleLabel = portalAccessLabelForRole(roleParam);
    const record = getPortalAccessRecord(project, roleParam);
    const policyText = portalAccessPolicyText(project, record);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: roleParam === "underleverandor" ? "Underentreprenørtilgang" : "Kundeportal" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.projectName || project.address || "Prosjektdokumentasjon" })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Skriv inn tilgangskode", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
          "Denne delingslenken er beskyttet med egen tilgangskode for ",
          roleLabel,
          ". Koden står i e-posten du har mottatt fra prosjektansvarlig."
        ] }),
        policyText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: policyText }),
        portalAccessError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { background: "#fef2f2", borderColor: "#fecaca" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { color: "#991b1b", fontWeight: 800, margin: 0 }, children: portalAccessError }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Tilgangskode", value: portalAccessInput, onChange: (v) => {
          setPortalAccessInput(normalizePortalAccessCode(v));
          setPortalAccessError("");
        }, onKeyDown: (e) => {
          if (e.key === "Enter") verifyPortalAccessCode(roleParam);
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => verifyPortalAccessCode(roleParam), children: "Åpne tilgang" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Har du ikke kode, eller er koden utløpt, må prosjektansvarlig sende ny tilgang fra Expo ProffDok." })
      ] }) })
    ] });
  };

  return {
    portalAccessPolicyText,
    getPortalAccessRecord,
    portalAccessRecordIsValid,
    portalAccessLine,
    portalAccessClipboardText,
    ensurePortalAccessForProject,
    portalAccessOk,
    renderPortalAccessGate
  };
}

export function renderCustomerPortal(ctx = {}) {
  const {
    hasValue, tilbud, selected, manualSelected, photos, checklist, warranty, project,
    getBaseChecklistTemplateForWarranty, getSoproChecklistTemplate, activeChecklistTemplate,
    projectHasOvertagelse, getWarrantyYears, warrantyReadiness, files, inst, getOpenDeviationCount,
    overtagelse, currentStatus, portalAccessOk, renderPortalAccessGate, company, name, Brand,
    customerTab, setCustomerTab, statusStyle, unreadForCustomer, totalChatCount,
    ProjectInformationReadOnly, Section, Grid, InfoCard, downloadClickablePdfReport,
    warrantyTermsPdfFileName, customerChatUploadFile, setCustomerChatUploadFile,
    saveCustomerChatMessage, refreshProjectFromCloud, markChatAsRead, projectLog, setProjectLog,
    lastReadByCustomer, lastReadByAdmin, Textarea, productReportDocumentOptions,
    shouldIncludeProductReportDoc, normalizeExternalUrl, CustomerReport, other, surf,
    bathroomEquipment
  } = ctx;
  const hasTilbudContent = hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0;
  const customerPortalProductCount = [...selected || [], ...manualSelected || []].length;
  const customerPortalPhotoCount = (photos || []).filter((photo) => hasValue(photo?.url)).length;
  const customerPortalChecklistValues = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
  const customerPortalChecklistAvvik = customerPortalChecklistValues.filter((value) => value?.status === "Avvik").length;
  const customerPortalChecklistClosedAvvik = customerPortalChecklistValues.filter((value) => value?.status === "Lukket avvik").length;
  const countChecklistTemplateStatus = (template = []) => {
    const total = (template || []).reduce((sum, group) => sum + (group.items || []).length, 0);
    const done = (template || []).reduce((sum, group) => {
      return sum + (group.items || []).filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
    }, 0);
    return { total, done, missing: Math.max(0, total - done), complete: total > 0 && done >= total };
  };
  const customerPortalBaseChecklistStats = countChecklistTemplateStatus(getBaseChecklistTemplateForWarranty(warranty));
  const customerPortalSoproChecklistStats = countChecklistTemplateStatus(warranty?.enabled ? getSoproChecklistTemplate(warranty?.system) : []);
  const customerPortalActiveChecklistStats = countChecklistTemplateStatus(activeChecklistTemplate);
  const customerPortalChecklistTotal = customerPortalActiveChecklistStats.total;
  const customerPortalChecklistDone = customerPortalActiveChecklistStats.done;
  const customerPortalLimitedChecklistScope = !warranty?.enabled && project?.checklistScopeMode === "limited";
  const customerPortalChecklistMissing = customerPortalLimitedChecklistScope ? 0 : customerPortalActiveChecklistStats.missing;
  const customerPortalChecklistComplete = customerPortalChecklistTotal === 0 || (customerPortalLimitedChecklistScope ? customerPortalChecklistDone > 0 : customerPortalActiveChecklistStats.complete);
  const customerPortalSoproChecklistTotal = customerPortalSoproChecklistStats.total;
  const customerPortalSoproChecklistDone = customerPortalSoproChecklistStats.done;
  const customerPortalSoproChecklistComplete = customerPortalSoproChecklistStats.complete;
  const customerPortalBaseChecklistText = customerPortalBaseChecklistStats.done ? `${customerPortalBaseChecklistStats.done} av ${customerPortalBaseChecklistStats.total} ordinære kontrollpunkter` : "Ordinære sjekklister ikke utfylt ennå";
  const customerPortalSoproChecklistText = customerPortalSoproChecklistTotal ? `Garantipunkter: ${customerPortalSoproChecklistDone} av ${customerPortalSoproChecklistTotal}` : "";
  const customerPortalChecklistStatusText = customerPortalLimitedChecklistScope ? (customerPortalChecklistDone ? `${customerPortalChecklistDone} relevant${customerPortalChecklistDone === 1 ? "" : "e"} kontrollpunkt vurdert · begrenset omfang` : "Begrenset omfang valgt · minst ett relevant kontrollpunkt må vurderes") : customerPortalChecklistDone ? `${customerPortalBaseChecklistText}${customerPortalSoproChecklistText ? ` · ${customerPortalSoproChecklistText}` : ""}${customerPortalChecklistMissing ? ` · ${customerPortalChecklistMissing} gjenstår` : ""}` : "Ikke utfylt ennå";
  const customerPortalAddress = [project.address, project.postnr, project.city].filter(Boolean).join(", ");
  const customerPortalProducts = [...selected || [], ...manualSelected || []];
  const customerPortalPhotos = (photos || []).filter((photo) => hasValue(photo?.url));
  const customerPortalWarrantyActive = !!warranty?.enabled;
  const customerPortalWarrantyIssued = !!warranty?.issued;
  const customerPortalWarrantySystem = warrantyReadiness?.selectedSystem;
  const customerPortalWarrantyTermsAccepted = !!warrantyReadiness?.termsAccepted;
  const customerPortalWarrantyStatusText = customerPortalWarrantyIssued ? `${getWarrantyYears(warranty)} års dokumentert tetthetsgaranti er utstedt${warranty?.guaranteeNumber ? ` – ${warranty.guaranteeNumber}` : ""}.` : customerPortalWarrantyActive ? "Tetthetsgaranti er valgt for prosjektet. Garantibevis utstedes når alle krav er oppfylt og overtagelsen er registrert." : "Garanti er ikke aktivert for dette prosjektet.";
  const customerPortalDocumentationReady = customerPortalProductCount > 0 || customerPortalPhotoCount > 0 || customerPortalChecklistDone > 0 || projectHasOvertagelse(overtagelse) || customerPortalWarrantyActive;
  // FASE 23W: Samme dokumentasjonsmodell som premiumrapporten. Dette hindrer at kunden ser f.eks. 50 % i portalen og 63 % i PDF-en.
  const customerPortalFileIdentityText = (file = {}) => [file?.name, file?.fileName, file?.url, file?.path, file?.type, file?.mimeType, file?.contentType].filter(Boolean).join(" ").toLowerCase();
  const customerPortalIsLikelyDocumentFile = (file = {}) => /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|txt|rtf|odt|ods|odp)(\?|#|$)/i.test(customerPortalFileIdentityText(file)) || /application\/(pdf|msword|vnd\.)/i.test(customerPortalFileIdentityText(file));
  let customerPortalAttachmentCount = Array.isArray(files) ? files.filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path)).length : 0;
  Object.values(checklist || {}).forEach((items) => {
    Object.values(items || {}).forEach((value) => {
      customerPortalAttachmentCount += (value?.photos || []).filter((file) => customerPortalIsLikelyDocumentFile(file)).length;
    });
  });
  (inst || []).forEach((entry) => {
    customerPortalAttachmentCount += (entry?.photos || []).filter((file) => customerPortalIsLikelyDocumentFile(file)).length;
  });
  customerPortalAttachmentCount += Array.isArray(tilbud?.files) ? tilbud.files.filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path)).length : 0;
  const customerPortalOpenProjectDeviationCount = (Array.isArray(project?.projectDeviations) ? project.projectDeviations : []).filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
  const customerPortalOpenDeviationTotal = getOpenDeviationCount(checklist) + customerPortalOpenProjectDeviationCount;
  const customerPortalCompletionItems = [
    { label: "Prosjektinformasjon", done: [project.projectName, project.address, project.customer].every(hasValue) },
    { label: "Produkter / FDV", done: customerPortalProductCount > 0 },
    { label: "Bildedokumentasjon", done: customerPortalPhotoCount > 0 },
    { label: "Sjekklister", done: customerPortalChecklistComplete },
    { label: "Avvik", done: customerPortalOpenDeviationTotal === 0 },
    { label: "Vedlegg", done: customerPortalAttachmentCount > 0 },
    { label: "Overtagelse", done: projectHasOvertagelse(overtagelse) },
    { label: "Garanti", done: customerPortalWarrantyIssued || !customerPortalWarrantyActive }
  ];
  const customerPortalCompletionPercent = Math.round(customerPortalCompletionItems.filter((item) => item.done).length / customerPortalCompletionItems.length * 100);
  const customerPortalChecklistReadyForFinal = customerPortalChecklistComplete;
  const customerPortalReportFinal = projectHasOvertagelse(overtagelse) && customerPortalOpenDeviationTotal === 0 && customerPortalChecklistReadyForFinal && (!customerPortalWarrantyActive || customerPortalWarrantyIssued);
  const customerPortalReportDownloadLabel = customerPortalReportFinal ? "Last ned sluttrapport" : "Last ned statusrapport";
  const customerPortalHeaderText = customerPortalReportFinal ? "Her finner du prosjektets sluttdokumentasjon, bilder, produkter og rapport" : "Her finner du prosjektets registrerte dokumentasjon, bilder, produkter og statusrapport";
  const customerPortalReadyForFinished = customerPortalChecklistReadyForFinal && customerPortalOpenDeviationTotal === 0 && projectHasOvertagelse(overtagelse) && (!customerPortalWarrantyActive || customerPortalWarrantyIssued);
  const customerPortalStatusWasDowngradedFromOldFinished = currentStatus.label === "Ferdigstilt" && !customerPortalReadyForFinished;
  const customerPortalDisplayStatus = customerPortalWarrantyIssued ? { label: `${getWarrantyYears(warranty)} års garanti aktiv`, icon: "✅", tone: "done" } : customerPortalStatusWasDowngradedFromOldFinished ? { label: "Pågår", icon: "🟡", tone: "progress" } : currentStatus;
  const customerPortalPrimaryStatus = customerPortalDisplayStatus.label;
  const customerPortalNextAction = customerPortalWarrantyIssued ? "Last ned sluttrapport eller se garantidokumentasjonen." : customerPortalOpenDeviationTotal > 0 ? "Lukk eller avklar åpne avvik før prosjektet kan ferdigstilles." : customerPortalLimitedChecklistScope && customerPortalChecklistDone === 0 ? "Vurder minst ett relevant kontrollpunkt for dette mindre prosjektet før det kan ferdigstilles." : customerPortalChecklistMissing > 0 ? `Fullfør ${customerPortalChecklistMissing} gjenstående kontrollpunkt før prosjektet kan regnes som ferdigstilt.` : !projectHasOvertagelse(overtagelse) ? "Overtagelse må registreres når prosjektet er klart og signert av begge parter." : customerPortalWarrantyActive && !customerPortalWarrantyIssued ? "Garantibevis utstedes når alle garantikrav er oppfylt." : "Se rapport, bilder og produktdokumentasjon.";
  if (!portalAccessOk) return renderPortalAccessGate("kunde");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Kundeportal" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            customerPortalHeaderText,
            totalChatCount ? ` \xB7 ${totalChatCount} melding${totalChatCount === 1 ? "" : "er"}` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: downloadClickablePdfReport, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 18 }),
          ` ${customerPortalReportDownloadLabel}`
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "oversikt" ? "on" : "", onClick: () => setCustomerTab("oversikt"), children: "Oversikt" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "rapport" ? "on" : "", onClick: () => setCustomerTab("rapport"), children: "Rapport" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "dokumentasjon" ? "on" : "", onClick: () => setCustomerTab("dokumentasjon"), children: "Dokumentasjon" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "garanti" ? "on" : "", onClick: () => setCustomerTab("garanti"), children: customerPortalWarrantyIssued ? "Garanti ✓" : "Garanti" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "bilder" ? "on" : "", onClick: () => setCustomerTab("bilder"), children: customerPortalPhotoCount ? `Bilder (${customerPortalPhotoCount})` : "Bilder" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "produkter" ? "on" : "", onClick: () => setCustomerTab("produkter"), children: customerPortalProductCount ? `Produkter (${customerPortalProductCount})` : "Produkter" }),
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `statusBadge status-${customerPortalDisplayStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", fontWeight: 700, border: "1px solid #dbe7ec", ...statusStyle(customerPortalDisplayStatus.tone) }, children: [
            customerPortalDisplayStatus.icon,
            " ",
            customerPortalDisplayStatus.label
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note customerChatFocusNote", children: "All kommunikasjon tas i prosjektchatten, slik at meldinger og bilder lagres på prosjektet." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Produkter dokumentert", value: customerPortalProductCount ? `${customerPortalProductCount} produkter` : "Ikke valgt ennå" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Bildedokumentasjon", value: customerPortalPhotoCount ? `${customerPortalPhotoCount} bilder` : "Ingen bilder ennå" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Sjekklister", value: customerPortalChecklistStatusText }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Chat", value: unreadForCustomer > 0 ? `${unreadForCustomer} ulest` : totalChatCount ? `${totalChatCount} meldinger` : "Ingen meldinger" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setCustomerTab("chat"), children: unreadForCustomer > 0 ? `Åpne chat (${unreadForCustomer} ulest)` : "Åpne prosjektchat" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("rapport"), children: "Se rapport" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("dokumentasjon"), children: "Se dokumentasjon" }),
          customerPortalWarrantyActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("garanti"), children: "Se garanti" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: downloadClickablePdfReport, children: customerPortalReportDownloadLabel }),
          hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("tilbud"), children: "Tilbud/kontrakt" })
        ] })
      ] }),
      customerTab === "prosjektinfo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectInformationReadOnly, { project }),
      customerTab === "oversikt" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Kundeportal dashboard", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette er kundens samlede oversikt over prosjektstatus, dokumentasjon, garanti og neste steg." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Prosjektstatus", value: customerPortalPrimaryStatus }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dokumentasjon", value: `${customerPortalCompletionPercent} % dokumentasjonsgrad` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Garanti", value: customerPortalWarrantyStatusText }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Neste steg", value: customerPortalNextAction })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "14px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Dokumentasjonsstatus" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", marginTop: "10px" }, children: customerPortalCompletionItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { border: "1px solid #dbe7ec", borderRadius: "12px", padding: "10px", background: item.done ? "#ecfdf5" : "#f8fafc", color: item.done ? "#065f46" : "#475569", fontWeight: 700 }, children: [
            item.done ? "✅ " : "○ ",
            item.label
          ] }, item.label)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: downloadClickablePdfReport, children: customerPortalReportDownloadLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("garanti"), children: "Se garanti" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("bilder"), children: "Se bilder" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("produkter"), children: "Se produkter" })
        ] })
      ] }),
      customerTab === "dokumentasjon" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Dokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: customerPortalDocumentationReady ? "Her vises samlet dokumentasjon som er registrert på prosjektet." : "Det er foreløpig lite dokumentasjon registrert på prosjektet." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Produkter", value: customerPortalProductCount ? `${customerPortalProductCount} produkter registrert` : "Ingen produkter registrert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Bilder", value: customerPortalPhotoCount ? `${customerPortalPhotoCount} bilder lastet opp` : "Ingen bilder lastet opp" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kontroller", value: customerPortalChecklistDone ? `${customerPortalChecklistDone} kontrollpunkter utført` : "Ikke registrert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Overtagelse", value: projectHasOvertagelse(overtagelse) ? `Registrert ${overtagelse?.dato || ""}` : "Ikke registrert" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setCustomerTab("bilder"), children: "Åpne bilder" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("produkter"), children: "Åpne produkter" }),
          customerPortalWarrantyActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("garanti"), children: "Åpne garanti" })
        ] })
      ] }),
      customerTab === "garanti" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Garanti", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: customerPortalWarrantyStatusText }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Garantistatus", value: customerPortalWarrantyIssued ? "Utstedt" : customerPortalWarrantyActive ? "Aktivert" : "Ikke aktivert" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Garantinummer", value: warranty?.guaranteeNumber || "Tildeles ved utstedelse" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "System", value: customerPortalWarrantySystem ? `${customerPortalWarrantySystem.product} – ${customerPortalWarrantySystem.sintefApproval}` : warranty?.sintefApproval || "Ikke valgt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Garantivilkår", value: customerPortalWarrantyTermsAccepted ? "Akseptert ved signert overtagelse" : customerPortalWarrantyActive ? "Aksepteres ved overtagelse" : "Ikke aktuelt" })
        ] }),
        customerPortalWarrantySystem?.sintefUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: customerPortalWarrantySystem.sintefUrl, target: "_blank", rel: "noopener noreferrer", children: "Åpne SINTEF Teknisk Godkjenning" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "upload", href: `/${warrantyTermsPdfFileName}`, target: "_blank", rel: "noopener noreferrer", children: "Last ned garantivilkår PDF" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: downloadClickablePdfReport, children: customerPortalReportDownloadLabel })
        ] })
      ] }),
      customerTab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bilder", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
        customerPortalPhotos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen bilder er delt på prosjektet ennå." }),
        customerPortalPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: customerPortalPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: photo.url, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: photo.url, alt: photo.comment || photo.cat || "Prosjektbilde" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: photo.cat || "Prosjektbilde" }),
          (photo.comment || photo.name) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: photo.comment || photo.name })
        ] }, photo.id || photo.url)) })
      ] }),
      customerTab === "produkter" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Produkter og FDV", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}), children: [
        customerPortalProducts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter er registrert på prosjektet ennå." }),
        customerPortalProducts.map((product) => {
          const productName = product.item || product.name || "Produkt";
          const docLinks = productReportDocumentOptions.filter((option) => shouldIncludeProductReportDoc(product, option));
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: productName }),
            product.section && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: product.section }),
            product.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: product.comment }),
            docLinks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen dokumentlenker valgt for kunden." }),
            docLinks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }, children: docLinks.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "upload", href: normalizeExternalUrl(product?.[option.field]), target: "_blank", rel: "noopener noreferrer", children: option.label }, option.field)) })
          ] }, product.id || productName);
        })
      ] }),
      customerTab === "rapport" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerReport, { company, name, project, selected, manualProducts: manualSelected, other, surf, bathroomEquipment, photos, inst, files, checklist, tilbud, overtagelse, projectLog }),
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
