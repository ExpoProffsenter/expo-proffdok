// Expo ProffDok – FASE 29C1
// Holder Sales-supportkonteksten synlig gjennom hele appen og beskytter
// ansvarlig-identitet når Systemadmin kontrollerer et annet firmas saker.
// Ingen SQL/RLS/Storage-endring.

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  createDefaultSalesSupabaseClient,
  getSalesSupportCompanyId,
  getSalesSupportCompanyProfile,
  resolveSalesCompanyScope,
} from "../services/salesSupabase.js";

const client = createDefaultSalesSupabaseClient();
const GLOBAL_BANNER_ID = "expo-sales-support-global-banner";
const SUPPORT_HIDDEN_ATTR = "data-sales-support-hidden";
const BLOCKED_SUPPORT_ACTIONS = new Set([
  "Ny forespørsel",
  "Nytt tilbud",
  "Planlegg befaring",
  "Rediger befaring",
  "Aktiver som prosjekt",
  "Fortsett til prosjektaktivering",
  "Send befaringsbekreftelse",
  "Send bekreftelse på nytt",
]);

let guardInstalled = false;
let refreshTimer = null;
let loadedCompanyId = "";
let loadingCompanyId = "";
let supportContext = {
  companyName: "",
  supportUserName: "Systemadministrator",
  requests: new Map(),
};

function findNavigationButton(label) {
  if (typeof document === "undefined") return null;
  return (
    Array.from(document.querySelectorAll("nav button")).find(
      (button) => String(button.textContent || "").trim() === label
    ) || null
  );
}

function currentRequestContext() {
  if (typeof document === "undefined") return null;
  const hero = document.querySelector(
    ".sales-app .sales-detail-hero, .sales-app .sales-form-hero"
  );
  const text = String(hero?.textContent || "");
  if (!text) return null;

  for (const [requestRef, payload] of supportContext.requests.entries()) {
    if (text.includes(requestRef)) {
      return { requestRef, payload: payload || {} };
    }
  }

  return null;
}

function currentResponsible() {
  const current = currentRequestContext();
  if (!current) return "";
  return String(
    current.payload?.surveyResponsible ||
      current.payload?.projectResponsible ||
      current.payload?.responsible ||
      ""
  ).trim();
}

function createBanner() {
  if (typeof document === "undefined" || !document.body) return null;
  let banner = document.getElementById(GLOBAL_BANNER_ID);
  if (banner) return banner;

  banner = document.createElement("aside");
  banner.id = GLOBAL_BANNER_ID;
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-live", "polite");
  Object.assign(banner.style, {
    position: "fixed",
    right: "14px",
    bottom: "14px",
    zIndex: "99990",
    width: "min(520px, calc(100vw - 28px))",
    padding: "12px 14px",
    border: "1px solid #d99b17",
    borderRadius: "14px",
    background: "#fffbeb",
    color: "#5f3b06",
    boxShadow: "0 14px 38px rgba(15, 23, 42, 0.18)",
    fontFamily: "Arial, Helvetica, sans-serif",
  });

  const title = document.createElement("strong");
  title.dataset.role = "title";
  title.style.display = "block";
  title.style.fontSize = "14px";

  const details = document.createElement("div");
  details.dataset.role = "details";
  Object.assign(details.style, {
    marginTop: "4px",
    fontSize: "12px",
    lineHeight: "1.45",
  });

  const actions = document.createElement("div");
  Object.assign(actions.style, {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "9px",
  });

  const returnButton = document.createElement("button");
  returnButton.type = "button";
  returnButton.textContent = "Tilbake til Systemadmin";
  Object.assign(returnButton.style, {
    border: "1px solid #b7790c",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#5f3b06",
    padding: "7px 10px",
    fontWeight: "700",
    cursor: "pointer",
  });
  returnButton.addEventListener("click", () => {
    findNavigationButton("Systemadmin")?.click();
  });

  const exitButton = document.createElement("button");
  exitButton.type = "button";
  exitButton.textContent = "Avslutt supportmodus";
  Object.assign(exitButton.style, {
    border: "0",
    borderRadius: "9px",
    background: "#7c4a03",
    color: "#ffffff",
    padding: "7px 10px",
    fontWeight: "700",
    cursor: "pointer",
  });
  exitButton.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("salesSupportCompany");
    window.history.replaceState(
      {},
      document.title,
      `${url.pathname}${url.search}${url.hash}`
    );
    loadedCompanyId = "";
    loadingCompanyId = "";
    supportContext = {
      companyName: "",
      supportUserName: "Systemadministrator",
      requests: new Map(),
    };
    restoreHiddenResponsibleFields();
    banner.remove();
    findNavigationButton("Systemadmin")?.click();
  });

  actions.append(returnButton, exitButton);
  banner.append(title, details, actions);
  document.body.append(banner);
  return banner;
}

function updateBanner() {
  const companyId = getSalesSupportCompanyId();
  if (!companyId) {
    document.getElementById(GLOBAL_BANNER_ID)?.remove();
    restoreHiddenResponsibleFields();
    return;
  }

  const banner = createBanner();
  if (!banner) return;

  const title = banner.querySelector('[data-role="title"]');
  const details = banner.querySelector('[data-role="details"]');
  const responsible = currentResponsible();

  if (title) {
    title.textContent = `🛡 Systemadmin-support${
      supportContext.companyName ? ` – ${supportContext.companyName}` : ""
    }`;
  }

  if (details) {
    const lines = [
      `Innlogget support: ${supportContext.supportUserName || "Systemadministrator"}`,
      responsible ? `Saksansvarlig: ${responsible}` : "",
      "Nye saker, endring av befaringsansvar og prosjektaktivering er sperret i supportmodus.",
    ].filter(Boolean);
    details.textContent = lines.join(" · ");
  }
}

function restoreHiddenResponsibleFields() {
  if (typeof document === "undefined") return;
  document.querySelectorAll(`[${SUPPORT_HIDDEN_ATTR}="1"]`).forEach((node) => {
    node.style.removeProperty("display");
    node.removeAttribute(SUPPORT_HIDDEN_ATTR);
  });
}

function hideMisleadingResponsibleFields() {
  if (typeof document === "undefined") return;
  if (!getSalesSupportCompanyId()) {
    restoreHiddenResponsibleFields();
    return;
  }

  document.querySelectorAll(".sales-app label").forEach((label) => {
    const text = String(label.textContent || "").trim();
    if (!text.startsWith("Prosjektansvarlig")) return;
    label.setAttribute(SUPPORT_HIDDEN_ATTR, "1");
    label.style.display = "none";
  });

  document.querySelectorAll(".sales-app span").forEach((span) => {
    if (span.closest("label")) return;
    const text = String(span.textContent || "").trim();
    if (!text.startsWith("Prosjektansvarlig:")) return;
    span.setAttribute(SUPPORT_HIDDEN_ATTR, "1");
    span.style.display = "none";
  });
}

async function loadSupportContext() {
  const companyId = getSalesSupportCompanyId();
  if (!companyId || !client) {
    loadedCompanyId = "";
    loadingCompanyId = "";
    updateBanner();
    return;
  }

  if (loadedCompanyId === companyId || loadingCompanyId === companyId) {
    updateBanner();
    hideMisleadingResponsibleFields();
    return;
  }

  loadingCompanyId = companyId;

  try {
    const { data: companyData, error: companyError } =
      await getSalesSupportCompanyProfile(client, companyId);
    if (companyError) throw companyError;
    if (getSalesSupportCompanyId() !== companyId) return;

    const companyRow = Array.isArray(companyData) ? companyData[0] : companyData;
    const companyName = String(companyRow?.company_name || "").trim();

    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user || null;
    let supportUserName = String(user?.email || "Systemadministrator").trim();

    if (user?.id) {
      const { data: profileData } = await client
        .from("profiles")
        .select("full_name,email")
        .eq("id", user.id)
        .maybeSingle();
      supportUserName = String(
        profileData?.full_name || profileData?.email || user.email || "Systemadministrator"
      ).trim();
    }

    const { data: resolvedCompanyId, error: scopeError } =
      await resolveSalesCompanyScope(client);
    if (scopeError) throw scopeError;

    const { data: requestRows, error: requestError } = await client
      .from("sales_requests")
      .select("request_ref,payload")
      .eq("company_id", resolvedCompanyId || companyId);
    if (requestError) throw requestError;
    if (getSalesSupportCompanyId() !== companyId) return;

    supportContext = {
      companyName,
      supportUserName,
      requests: new Map(
        (requestRows || []).map((row) => [
          String(row.request_ref || "").trim(),
          row.payload || {},
        ])
      ),
    };
    loadedCompanyId = companyId;
  } catch (error) {
    console.error("Kunne ikke laste Systemadmin-supportkontekst", error);
    if (getSalesSupportCompanyId() === companyId) {
      supportContext = {
        companyName: "",
        supportUserName: "Systemadministrator",
        requests: new Map(),
      };
      loadedCompanyId = companyId;
    }
  } finally {
    if (loadingCompanyId === companyId) loadingCompanyId = "";
    updateBanner();
    hideMisleadingResponsibleFields();
  }
}

function scheduleSupportRefresh() {
  if (typeof window === "undefined") return;
  if (refreshTimer) window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    void loadSupportContext();
    updateBanner();
    hideMisleadingResponsibleFields();
  }, 60);
}

function blockedActionLabel(button) {
  const text = String(button?.textContent || "").replace(/\s+/g, " ").trim();
  return BLOCKED_SUPPORT_ACTIONS.has(text) ? text : "";
}

function installSupportGuard() {
  if (
    guardInstalled ||
    typeof document === "undefined" ||
    typeof window === "undefined"
  ) {
    return;
  }
  guardInstalled = true;

  document.addEventListener(
    "click",
    (event) => {
      if (!getSalesSupportCompanyId()) return;
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest("button");
      if (!button || !button.closest(".sales-app")) return;

      const blockedLabel = blockedActionLabel(button);
      if (!blockedLabel) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.alert(
        `${blockedLabel} er sperret i Systemadmin-supportmodus. ` +
          "Eksisterende saksansvarlig skal beholdes. Avslutt supportmodus for å utføre denne handlingen som ordinær firmabruker."
      );
    },
    true
  );

  document.addEventListener(
    "submit",
    (event) => {
      if (!getSalesSupportCompanyId()) return;
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form || !form.closest(".sales-app")) return;

      const eyebrow = String(
        form.closest(".sales-app")?.querySelector(".sales-eyebrow")?.textContent || ""
      ).trim();
      if (!["Ny forespørsel", "Nytt tilbud", "Planlegg befaring"].includes(eyebrow)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.alert(
        "Denne lagringen er sperret i Systemadmin-supportmodus for å beskytte firmaets eksisterende saksansvarlige."
      );
    },
    true
  );

  const observer = new MutationObserver(() => scheduleSupportRefresh());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  scheduleSupportRefresh();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installSupportGuard, {
      once: true,
    });
  } else {
    installSupportGuard();
  }
}

export default function SalesSupportNotice() {
  const companyId = getSalesSupportCompanyId();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompanyName() {
      if (!client || !companyId) return;
      const { data, error } = await getSalesSupportCompanyProfile(client, companyId);
      if (!active || error) return;
      const row = Array.isArray(data) ? data[0] : data;
      setCompanyName(String(row?.company_name || "").trim());
      scheduleSupportRefresh();
    }

    void loadCompanyName();
    return () => {
      active = false;
    };
  }, [companyId]);

  if (!companyId) return null;

  return (
    <section
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        marginBottom: 18,
        padding: "12px 14px",
        border: "1px solid #f0b429",
        borderRadius: 12,
        background: "#fffbeb",
        color: "#7c4a03",
      }}
      aria-label="Sales supportmodus aktiv"
    >
      <ShieldCheck size={20} style={{ flex: "0 0 auto", marginTop: 1 }} />
      <div>
        <strong>
          Systemadmin-support aktiv{companyName ? ` – ${companyName}` : ""}
        </strong>
        <div style={{ marginTop: 3, fontSize: 13, lineHeight: 1.45 }}>
          Du arbeider med dette firmaets forespørsler, befaringer og tilbud.
          Eksisterende saksansvarlig beholdes. Nye saker, endring av
          befaringsansvar og prosjektaktivering er sperret mens supportmodus er
          aktiv.
        </div>
      </div>
    </section>
  );
}
