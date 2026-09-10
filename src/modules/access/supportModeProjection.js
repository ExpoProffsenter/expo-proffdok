// Expo ProffDok – FASE 41B.1
// Knytter eksisterende prosjekt-supportmodus til modulvisning og Sales-supportscope.
// Systemadministrator er fortsatt innlogget og server/RLS er autoritativ, men UI-et
// projiserer målbrukerens faktiske moduler. Ingen data eller rettigheter endres.

import {
  MODULE_ACCESS_EVENT,
  listManagedModuleAccess,
  normalizeModuleKeys,
  publishModuleAccess,
  refreshMyModuleAccess,
} from "./moduleAccessClient.js";
import {
  createDefaultSalesSupabaseClient,
  listSalesSupportCompanies,
} from "../sales/services/salesSupabase.js";

const SUPPORT_LABEL = "SYSTEMADMIN SUPPORTMODUS";
const EXIT_SUPPORT_LABEL = "Avslutt supportmodus";
const SALES_SUPPORT_PARAM = "salesSupportCompany";
const MANAGED_SALES_SUPPORT_KEY = "expo-proffdok:project-support-sales-company";
const STORE_ALLOWED_COMPANIES = new Set([
  "ringside rorleggerbedrift as",
  "bademiljo expo",
  "expo proffsenter",
]);

const salesClient = createDefaultSalesSupabaseClient();
let activeProjection = null;
let syncPromise = null;
let republishTimer = null;
let publishingProjection = false;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeCompanyName(value = "") {
  return compactText(value)
    .toLocaleLowerCase("nb-NO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o");
}

function visibleProjectSupportContext() {
  if (typeof document === "undefined") return null;
  const label = Array.from(document.querySelectorAll("strong")).find(
    (node) => compactText(node.textContent) === SUPPORT_LABEL
  );
  if (!label) return null;

  // Les kun detaljlinjen. Hele bannerets textContent inkluderer knappeteksten
  // «Avslutt supportmodus» direkte etter e-postadressen i enkelte nettlesere.
  const details = label.parentElement?.querySelector("small");
  const text = compactText(details?.textContent);
  const company = text.match(/Firma:\s*(.*?)\s*·\s*Prosjekt:/i)?.[1] || "";
  const owner =
    text.match(
      /Prosjekteier:\s*([^\s·]+@[^\s·]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    )?.[1] || "";

  if (!compactText(company) || !compactText(owner)) return null;
  return {
    companyName: compactText(company),
    ownerRef: compactText(owner),
    key: `${normalizeCompanyName(company)}|${compactText(owner).toLocaleLowerCase("nb-NO")}`,
  };
}

function supportAccessFromTarget(target = {}) {
  let moduleKeys = normalizeModuleKeys(target?.module_keys || []);
  if (!STORE_ALLOWED_COMPANIES.has(normalizeCompanyName(target?.company_name))) {
    moduleKeys = moduleKeys.filter((key) => key !== "store_offers");
  }

  return {
    loaded: true,
    moduleKeys,
    isSystemAdmin: target?.system_role === "systemadmin",
    isFirmaAdmin: target?.company_role === "firmaadmin",
    error: "",
  };
}

function targetMatchesOwner(target = {}, ownerRef = "") {
  const owner = compactText(ownerRef).toLocaleLowerCase("nb-NO");
  if (!owner) return false;
  return (
    String(target?.email || "").trim().toLocaleLowerCase("nb-NO") === owner ||
    String(target?.user_id || "").trim().toLocaleLowerCase("nb-NO") === owner
  );
}

function setManagedSalesSupportCompany(companyId = "") {
  if (typeof window === "undefined") return;
  const id = String(companyId || "").trim();
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set(SALES_SUPPORT_PARAM, id);
    window.sessionStorage?.setItem(MANAGED_SALES_SUPPORT_KEY, id);
  } else {
    const managedId = String(window.sessionStorage?.getItem(MANAGED_SALES_SUPPORT_KEY) || "").trim();
    if (managedId && url.searchParams.get(SALES_SUPPORT_PARAM) === managedId) {
      url.searchParams.delete(SALES_SUPPORT_PARAM);
    }
    window.sessionStorage?.removeItem(MANAGED_SALES_SUPPORT_KEY);
  }
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function moduleAccessEqual(a = {}, b = {}) {
  return (
    Boolean(a?.loaded) === Boolean(b?.loaded) &&
    Boolean(a?.isSystemAdmin) === Boolean(b?.isSystemAdmin) &&
    Boolean(a?.isFirmaAdmin) === Boolean(b?.isFirmaAdmin) &&
    normalizeModuleKeys(a?.moduleKeys || []).join("|") ===
      normalizeModuleKeys(b?.moduleKeys || []).join("|")
  );
}

function applySupportSpecificVisibility() {
  if (typeof document === "undefined" || !activeProjection) return;
  const canStore = activeProjection.access.moduleKeys.includes("store_offers");

  document.querySelectorAll('[role="tablist"][aria-label="Tilbudstype"] button').forEach((button) => {
    const storeTab = compactText(button.textContent).startsWith("Butikktilbud");
    if (!storeTab) return;
    if (canStore) {
      if (button.dataset.supportStoreHidden === "1") {
        button.style.removeProperty("display");
        delete button.dataset.supportStoreHidden;
      }
    } else {
      button.dataset.supportStoreHidden = "1";
      button.style.display = "none";
    }
  });
}

function restoreSupportSpecificVisibility() {
  if (typeof document === "undefined") return;
  document.querySelectorAll('[data-support-store-hidden="1"]').forEach((node) => {
    node.style.removeProperty("display");
    delete node.dataset.supportStoreHidden;
  });
}

function publishProjectedAccess() {
  if (!activeProjection || publishingProjection) return;
  publishingProjection = true;
  try {
    publishModuleAccess(activeProjection.access);
    applySupportSpecificVisibility();
  } finally {
    publishingProjection = false;
  }
}

async function clearProjection() {
  const hadProjection = Boolean(activeProjection);
  const hadManagedSalesScope = Boolean(
    typeof window !== "undefined" &&
      window.sessionStorage?.getItem(MANAGED_SALES_SUPPORT_KEY)
  );
  activeProjection = null;
  restoreSupportSpecificVisibility();
  if (hadManagedSalesScope) setManagedSalesSupportCompany("");
  if (hadProjection || hadManagedSalesScope) await refreshMyModuleAccess();

  // Eksisterende Sales-supportvisning lytter på popstate for å rydde logo/banner.
  if (typeof window !== "undefined" && (hadProjection || hadManagedSalesScope)) {
    window.dispatchEvent(new Event("popstate"));
  }
}

async function buildProjection(context) {
  const managed = await listManagedModuleAccess();
  const target = (managed?.users || []).find((user) =>
    targetMatchesOwner(user, context.ownerRef)
  );
  if (!target) {
    throw new Error(`Fant ikke supportbrukeren ${context.ownerRef} i brukerregisteret.`);
  }

  const access = supportAccessFromTarget(target);
  let salesCompanyId = "";

  if (access.moduleKeys.includes("sales")) {
    if (!salesClient) throw new Error("Sales-klienten er ikke tilgjengelig.");
    const { data, error } = await listSalesSupportCompanies(salesClient);
    if (error) throw error;
    const targetCompany = normalizeCompanyName(target?.company_name || context.companyName);
    const bannerCompany = normalizeCompanyName(context.companyName);
    const company = (Array.isArray(data) ? data : []).find((entry) => {
      const name = normalizeCompanyName(entry?.display_name);
      return name === targetCompany || name === bannerCompany;
    });
    salesCompanyId = String(company?.company_id || "").trim();
    if (!salesCompanyId) {
      throw new Error(`Fant ikke Sales-firmascope for ${context.companyName}.`);
    }
  }

  return {
    key: context.key,
    targetUserId: String(target?.user_id || "").trim(),
    targetEmail: String(target?.email || context.ownerRef || "").trim(),
    companyName: String(target?.company_name || context.companyName || "").trim(),
    salesCompanyId,
    access,
  };
}

export async function syncVisibleSupportProjection({ force = false } = {}) {
  const context = visibleProjectSupportContext();
  if (!context) {
    await clearProjection();
    return null;
  }

  if (!force && activeProjection?.key === context.key) {
    applySupportSpecificVisibility();
    return activeProjection;
  }
  if (syncPromise) return syncPromise;

  syncPromise = buildProjection(context)
    .then((projection) => {
      activeProjection = projection;
      if (projection.salesCompanyId) setManagedSalesSupportCompany(projection.salesCompanyId);
      else setManagedSalesSupportCompany("");
      publishProjectedAccess();
      return projection;
    })
    .finally(() => {
      syncPromise = null;
    });

  return syncPromise;
}

function scheduleSync(delays = [0, 120, 400]) {
  if (typeof window === "undefined") return;
  delays.forEach((delay) => {
    window.setTimeout(() => {
      void syncVisibleSupportProjection().catch((error) => {
        console.error("Kunne ikke synkronisere supportmodus", error);
      });
    }, delay);
  });
}

function salesNavigationButton(button) {
  return compactText(button?.textContent) === "Befaring/Tilbud";
}

function exitSupportButton(button) {
  return compactText(button?.textContent) === EXIT_SUPPORT_LABEL;
}

export function installSupportModeProjection() {
  if (typeof window === "undefined" || window.__expoSupportModeProjectionInstalled) return;
  window.__expoSupportModeProjectionInstalled = true;

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!(button instanceof HTMLButtonElement)) {
        scheduleSync([80, 300]);
        return;
      }

      const context = visibleProjectSupportContext();

      // La hovedappens egen exit-handler rydde prosjektet først. Deretter fjerner
      // broen kun sitt Sales-scope og gjenoppretter innlogget brukers modultilgang.
      if (context && exitSupportButton(button)) {
        window.setTimeout(() => {
          void clearProjection().finally(() => scheduleSync([120, 400]));
        }, 0);
        return;
      }

      if (
        context &&
        salesNavigationButton(button) &&
        (!activeProjection || activeProjection.key !== context.key)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void syncVisibleSupportProjection({ force: true })
          .then((projection) => {
            if (!projection?.access?.moduleKeys?.includes("sales")) {
              alert("Denne brukeren har ikke tilgang til Befaring/Tilbud.");
              return;
            }
            button.click();
          })
          .catch((error) => {
            alert(error?.message || "Supportmodus kunne ikke klargjøres.");
          });
        return;
      }

      scheduleSync();
      window.setTimeout(applySupportSpecificVisibility, 500);
    },
    true
  );

  window.addEventListener(MODULE_ACCESS_EVENT, (event) => {
    if (!activeProjection || publishingProjection) return;
    const incoming = event?.detail || {};
    if (moduleAccessEqual(incoming, activeProjection.access)) {
      applySupportSpecificVisibility();
      return;
    }
    if (republishTimer) window.clearTimeout(republishTimer);
    republishTimer = window.setTimeout(() => {
      republishTimer = null;
      publishProjectedAccess();
    }, 30);
  });

  window.addEventListener("focus", () => scheduleSync([0, 180]));
  scheduleSync([250, 900, 1800]);
}
