// Expo ProffDok – FASE 42L
// Isolert demo-navigasjon. Sales-steg sendes inn i den eksisterende Startsiden-
// callbacken openSalesRequestFromHome, som igjen bruker Sales openRequestSignal og
// server-first/lazy-loading. Ingen DOM-søk, kortklikking eller filtermanipulering.

import { DEMO_OPEN_SALES_REQUEST_EVENT } from "./demoSalesOpenEvent.js";

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

export function openDemoProject(projectId) {
  const cleanProjectId = String(projectId || "").trim();
  if (!cleanProjectId || typeof window === "undefined") return false;

  window.location.assign(
    `${window.location.pathname}?project=${encodeURIComponent(cleanProjectId)}&access=admin&tab=prosjekt`
  );
  return true;
}
