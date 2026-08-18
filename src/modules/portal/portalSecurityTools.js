// FASE 29A2: Portaltilgang verifiseres server-side før prosjektdata returneres.
import { BadgeCheck } from 'lucide-react';
import { jsx, jsxs } from 'react/jsx-runtime';
import {
  ensureProjectPortalAccess,
  normalizePortalAccessCode,
  portalAccessStorageKey as makePortalAccessStorageKey,
  storePortalAccessCode,
  verifyProjectPortalAccess
} from './portalSupabase.js';

const import_jsx_runtime = { jsx, jsxs };
const import_lucide_react = { BadgeCheck };

const normalizeRole = (role = "kunde") => {
  const clean = String(role || "").trim().toLowerCase();
  return clean === "underleverandor" || clean === "underleverandør" || clean === "underentreprenør"
    ? "underleverandor"
    : "kunde";
};

const toUiRecord = (record = {}, role = "kunde") => ({
  ...record,
  role: normalizeRole(record?.role || role),
  active: record?.active !== false && !!(record?.code || record?.active),
  createdAt: record?.createdAt || record?.created_at || "",
  validUntil: record?.validUntil || record?.valid_until || "",
  accessPolicy: record?.accessPolicy || record?.access_policy || "active_project_plus_locked_30_days",
  lockedGraceDays: Number(record?.lockedGraceDays || record?.locked_grace_days || 30)
});

export function createPortalAccessTools(ctx = {}) {
  const {
    project, projectId, projectIsLocked, portalAccessRoleParam, isAdminProjectLink,
    portalAccessGranted, portalAccessInput, portalAccessError,
    setPortalAccessGranted, setPortalAccessInput, setPortalAccessError,
    supabase, Brand, Section, Input,
    portalAccessRecords = {}, setPortalAccessRecords,
    onPortalVerified
  } = ctx;

  const portalAccessKeyForRole = (role = "kunde") => normalizeRole(role);
  const portalAccessLabelForRole = (role = "kunde") =>
    portalAccessKeyForRole(role) === "underleverandor" ? "underentreprenør" : "kunde";

  const getPortalAccessRecord = (_projectValue = project, role = "kunde") =>
    portalAccessRecords?.[portalAccessKeyForRole(role)] || {};

  const portalAccessRecordIsValid = (record = {}) => {
    if (!record || record?.active === false) return false;
    const validUntil = record?.validUntil || record?.valid_until || "";
    if (validUntil) {
      const expires = new Date(validUntil).getTime();
      if (Number.isFinite(expires) && expires <= Date.now()) return false;
    }
    return !!(record?.code || record?.active);
  };

  const formatPortalAccessExpiry = (value = "") => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString("no-NO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
    } catch {
      return value;
    }
  };

  const portalAccessPolicyText = (projectValue = project, record = {}) => {
    const validUntil = record?.validUntil || record?.valid_until || "";
    if (validUntil) {
      return `Tilgangen er gyldig i 30 dager etter at prosjektet ble låst/arkivert, til ${formatPortalAccessExpiry(validUntil)}.`;
    }
    if (projectIsLocked(projectValue)) {
      return "Tilgangen er gyldig i inntil 30 dager etter at prosjektet ble låst/arkivert.";
    }
    return "Tilgangen er gyldig så lenge prosjektet er aktivt. Etter låsing/arkivering beholdes tilgangen i 30 dager.";
  };

  const portalAccessLine = (record = {}, projectValue = project) => {
    if (!record?.code || record.code === "stored") return "";
    return `\n\nTilgangskode: ${normalizePortalAccessCode(record.code)}\n${portalAccessPolicyText(projectValue, record)}`;
  };

  const portalAccessClipboardText = ({
    link = "",
    record = {},
    roleParam = "kunde",
    projectValue = project
  } = {}) => {
    const cleanLink = String(link || "").trim();
    const linkLabel = normalizeRole(roleParam) === "underleverandor" ? "Underentreprenørlenke" : "Kundelenke";
    if (!record?.code || record.code === "stored") return `${linkLabel}:\n${cleanLink}`;
    return `${linkLabel}:\n${cleanLink}\n\nTilgangskode: ${normalizePortalAccessCode(record.code)}\n\n${portalAccessPolicyText(projectValue, record)}`;
  };

  const rememberRecord = (record = {}, role = "kunde") => {
    const key = normalizeRole(record?.role || role);
    const normalized = toUiRecord(record, key);
    if (typeof setPortalAccessRecords === "function") {
      setPortalAccessRecords((prev) => ({ ...prev, [key]: normalized }));
    }
    return normalized;
  };

  const ensurePortalAccessForProject = async ({ id, roleParam = "kunde", forceNew = false } = {}) => {
    const targetId = id || projectId;
    if (!targetId) return null;
    try {
      const record = await ensureProjectPortalAccess(supabase, {
        projectId: targetId,
        role: roleParam,
        forceNew
      });
      return record ? rememberRecord(record, roleParam) : null;
    } catch (error) {
      console.warn("Kunne ikke opprette/hente portaltilgang:", error?.message || error);
      return null;
    }
  };

  const verifyPortalAccessCode = async (roleParam = "kunde", explicitCode = "", { silent = false } = {}) => {
    const targetId = projectId;
    const role = normalizeRole(roleParam);
    const code = normalizePortalAccessCode(explicitCode || portalAccessInput);
    if (!targetId || !code) {
      if (!silent) setPortalAccessError("Skriv inn tilgangskoden fra e-posten.");
      return null;
    }
    try {
      const result = await verifyProjectPortalAccess(supabase, {
        projectId: targetId,
        role,
        code
      });
      if (!result?.ok || !result?.project) {
        if (!silent) setPortalAccessError("Feil eller utløpt tilgangskode. Kontroller koden og prøv igjen.");
        return null;
      }
      storePortalAccessCode(targetId, role, code);
      setPortalAccessGranted(true);
      setPortalAccessError("");
      if (typeof onPortalVerified === "function") onPortalVerified(result);
      return result;
    } catch (error) {
      console.warn("Kunne ikke verifisere portaltilgang:", error?.message || error);
      if (!silent) setPortalAccessError("Kunne ikke kontrollere tilgangskoden akkurat nå. Prøv igjen.");
      return null;
    }
  };

  const portalAccessRequired = !!portalAccessRoleParam && !isAdminProjectLink;
  const portalAccessOk = !portalAccessRequired || !!portalAccessGranted;

  const renderPortalAccessGate = (roleParam = "kunde") => {
    const roleLabel = portalAccessLabelForRole(roleParam);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: "", name: "Expo ProffDok" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: normalizeRole(roleParam) === "underleverandor" ? "Underentreprenørtilgang" : "Kundeportal" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Beskyttet prosjekttilgang" })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Skriv inn tilgangskode", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
          "Denne delingslenken er beskyttet med egen tilgangskode for ", roleLabel,
          ". Koden står i e-posten du har mottatt fra prosjektansvarlig."
        ] }),
        portalAccessError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { background: "#fef2f2", borderColor: "#fecaca" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { color: "#991b1b", fontWeight: 800, margin: 0 }, children: portalAccessError }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
          label: "Tilgangskode",
          value: portalAccessInput,
          onChange: (value) => {
            setPortalAccessInput(normalizePortalAccessCode(value));
            setPortalAccessError("");
          },
          onKeyDown: (event) => {
            if (event.key === "Enter") verifyPortalAccessCode(roleParam);
          }
        }),
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
    verifyPortalAccessCode,
    portalAccessOk,
    renderPortalAccessGate,
    makePortalAccessStorageKey
  };
}
