// Expo ProffDok – FASE 41B.4
// Legger en eksplisitt revisjonshandling på internt, avvist Butikktilbud.
// Originalen åpnes fortsatt skrivebeskyttet. Ny sak opprettes server-side fra
// den avviste publiserte versjonen og får ny offer/token ved senere publisering.
// Ingen MutationObserver: synk kjøres kun ved relevante navigasjonshendelser.

import { createDefaultSalesSupabaseClient } from "./services/salesSupabase.js";
import {
  buildSalesStorageKey,
  loadRequests,
  saveRequests,
  saveSalesNavigation,
} from "./services/salesLocalStorage.js";
import {
  getMyWorkProfileState,
  readCachedWorkProfileState,
} from "../access/workProfileClient.js";

const ACTION_ATTR = "data-store-declined-revision-action";
const ERROR_ATTR = "data-store-declined-revision-error";
const SUPPORT_LABEL = "SYSTEMADMIN SUPPORTMODUS";
const RESTORE_TAB_KEY = "expo-proffdok:sales:restore-tab-after-reload";
const RESTORE_NAV_KEY = "expo-proffdok:sales:restore-navigation-after-reload";
let busy = false;
let timers = [];

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function supportModeActive() {
  return Array.from(document.querySelectorAll("strong")).some(
    (node) => compactText(node.textContent) === SUPPORT_LABEL
  );
}

function isPublicSalesView() {
  const params = new URLSearchParams(window.location.search);
  return params.has("publicOffer") || params.has("publicContract");
}

function findDeclinedOfferLink() {
  if (supportModeActive() || isPublicSalesView()) return null;
  return (
    Array.from(document.querySelectorAll("a.sales-secondary-button")).find(
      (node) => compactText(node.textContent) === "Se avvist tilbud"
    ) || null
  );
}

function publicTokenFromLink(link) {
  if (!(link instanceof HTMLAnchorElement)) return "";
  try {
    return new URL(link.href, window.location.origin).searchParams.get("publicOffer") || "";
  } catch {
    return "";
  }
}

function setError(card, message = "") {
  let node = card?.querySelector?.(`[${ERROR_ATTR}]`) || null;
  if (!message) {
    node?.remove();
    return;
  }
  if (!node) {
    node = document.createElement("p");
    node.setAttribute(ERROR_ATTR, "1");
    node.style.margin = "10px 0 0";
    node.style.color = "#991b1b";
    node.style.fontWeight = "800";
    card?.appendChild?.(node);
  }
  node.textContent = message;
}

async function resolveSalesStorageContext(client) {
  const sessionResult = await client.auth.getSession();
  const userId = String(sessionResult?.data?.session?.user?.id || "").trim();
  if (!userId) throw new Error("Innloggingen er utløpt. Logg inn på nytt.");

  let state = readCachedWorkProfileState();
  if (!state?.active_company_id || !state?.active_company_profile?.companyName) {
    state = await getMyWorkProfileState();
  }

  const companyId = String(state?.active_company_id || "").trim();
  const companyName = String(
    state?.active_company_profile?.companyName ||
      state?.active_company_profile?.company_name ||
      ""
  ).trim();
  if (!companyId || !companyName) {
    throw new Error("Aktivt firma kunne ikke bekreftes.");
  }

  return {
    companyId,
    storageKey: buildSalesStorageKey({
      integrationMode: "app",
      companyName,
      userId,
    }),
  };
}

async function createRevision(link, button, card) {
  if (busy) return;
  const publicOfferToken = publicTokenFromLink(link);
  if (!publicOfferToken) {
    setError(card, "Det avviste tilbudet mangler gyldig kundelenke.");
    return;
  }

  const confirmed = window.confirm(
    "Lage et nytt revidert tilbud basert på den avviste tilbudsversjonen?\n\n" +
      "Det avviste tilbudet forblir låst historikk. Det nye tilbudet får nytt tilbudsnummer og ny kundelenke når det publiseres."
  );
  if (!confirmed) return;

  busy = true;
  setError(card, "");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Oppretter revidert tilbud …";

  try {
    const client = createDefaultSalesSupabaseClient();
    if (!client?.rpc) throw new Error("Supabase er ikke tilgjengelig.");

    const { data, error } = await client.rpc("create_revised_store_offer_from_decline", {
      public_offer_token: publicOfferToken,
    });
    if (error) throw error;

    const requestRef = String(data?.request_ref || "").trim();
    if (!requestRef) throw new Error("Ny salgssak mangler saksreferanse.");

    const { companyId, storageKey } = await resolveSalesStorageContext(client);
    const { data: row, error: rowError } = await client
      .from("sales_requests")
      .select("request_ref,payload")
      .eq("company_id", companyId)
      .eq("request_ref", requestRef)
      .maybeSingle();
    if (rowError) throw rowError;

    const payload = row?.payload && typeof row.payload === "object"
      ? { ...row.payload, id: requestRef }
      : null;
    if (!payload) throw new Error("Den nye salgssaken kunne ikke lastes inn.");

    const current = loadRequests(storageKey);
    const next = [
      payload,
      ...(Array.isArray(current) ? current : []).filter(
        (item) => String(item?.id || "") !== requestRef
      ),
    ];
    saveRequests(next, storageKey);
    saveSalesNavigation(storageKey, "detail", requestRef);

    try {
      window.sessionStorage?.setItem(RESTORE_TAB_KEY, "1");
      window.sessionStorage?.setItem(RESTORE_NAV_KEY, "1");
    } catch {
      // Reload fungerer fortsatt; markørene er kun navigasjonshjelp.
    }

    window.location.reload();
  } catch (error) {
    setError(
      card,
      error?.message || "Kunne ikke opprette revidert tilbud. Prøv igjen."
    );
    button.disabled = false;
    button.textContent = originalText;
    busy = false;
  }
}

function syncRevisionAction() {
  const link = findDeclinedOfferLink();
  if (!link) return;
  const card = link.closest(".sales-next-card");
  if (!(card instanceof HTMLElement)) return;
  if (card.querySelector(`[${ACTION_ATTR}]`)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "sales-primary-button";
  button.setAttribute(ACTION_ATTR, "1");
  button.textContent = "Lag revidert tilbud";
  button.style.justifySelf = "start";
  button.style.width = "fit-content";
  button.style.marginTop = "10px";
  button.addEventListener("click", () => createRevision(link, button, card));
  link.insertAdjacentElement("afterend", button);
}

function scheduleSync() {
  timers.forEach((timer) => window.clearTimeout(timer));
  timers = [0, 120, 400, 900].map((delay) =>
    window.setTimeout(syncRevisionAction, delay)
  );
}

export function installStoreDeclinedRevisionUx() {
  if (typeof window === "undefined" || window.__expoStoreDeclinedRevisionUxInstalled) return;
  window.__expoStoreDeclinedRevisionUxInstalled = true;

  document.addEventListener("click", scheduleSync);
  window.addEventListener("focus", scheduleSync);
  window.addEventListener("popstate", scheduleSync);
  window.addEventListener("expo-proffdok-sales-rehydrate", scheduleSync);
  scheduleSync();
}
