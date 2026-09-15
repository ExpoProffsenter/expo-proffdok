// Expo ProffDok – FASE 42L
// Isolert demo-navigasjon. Sales-steg sendes inn i den eksisterende Startsiden-
// callbacken openSalesRequestFromHome, som igjen bruker Sales openRequestSignal og
// server-first/lazy-loading. Ingen DOM-søk, kortklikking eller filtermanipulering.

import { DEMO_OPEN_SALES_REQUEST_EVENT } from "./demoSalesOpenEvent.js";

const DEMO_PROJECT_TABS = new Set([
  "prosjekt",
  "fremdrift",
  "rapport",
  "garanti",
  "chat",
  "tilgang",
]);

export function openDemoSalesStage(requestRef) {
  const cleanRef = String(requestRef || "").trim();
  if (!cleanRef || typeof window === "undefined") return false;

  const detail = {
    requestId: cleanRef,
    handled: false,
  };

  window.dispatchEvent(
    new CustomEvent(DEMO_OPEN_SALES_REQUEST_EVENT, { detail })
  );

  return detail.handled === true;
}

export function openDemoProject(projectId, tab = "prosjekt") {
  const cleanProjectId = String(projectId || "").trim();
  const cleanTab = String(tab || "prosjekt").trim().toLowerCase();
  if (
    !cleanProjectId ||
    !DEMO_PROJECT_TABS.has(cleanTab) ||
    typeof window === "undefined"
  ) {
    return false;
  }

  window.location.assign(
    `${window.location.pathname}?project=${encodeURIComponent(cleanProjectId)}&access=admin&tab=${encodeURIComponent(cleanTab)}`
  );
  return true;
}
