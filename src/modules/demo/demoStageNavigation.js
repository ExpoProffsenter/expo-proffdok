// Expo ProffDok – FASE 42L
// Isolert demo-navigasjon. Sales-steg primes komplett fra server før de sendes inn i
// den eksisterende Startsiden-callbacken openSalesRequestFromHome. Ordinær Sales-
// navigasjon, listefiltre og recovery endres ikke.

import { DEMO_OPEN_SALES_REQUEST_EVENT } from "./demoSalesOpenEvent.js";
import { isDemoRequestRef } from "./demoCaseSafety.js";
import {
  createDefaultSalesSupabaseClient,
  primeSalesRequestDetailRow,
  resolveSalesCompanyScope,
} from "../sales/services/salesSupabase.js";

const DEMO_PROJECT_TABS = new Set([
  "prosjekt",
  "fremdrift",
  "rapport",
  "garanti",
  "chat",
  "tilgang",
]);

export async function openDemoSalesStage(requestRef) {
  const cleanRef = String(requestRef || "").trim();
  if (
    !cleanRef ||
    !isDemoRequestRef(cleanRef) ||
    typeof window === "undefined"
  ) {
    return false;
  }

  const client = createDefaultSalesSupabaseClient();
  if (!client) throw new Error("Supabase er ikke tilgjengelig for Demo/Test.");

  const { data: companyId, error: companyError } =
    await resolveSalesCompanyScope(client);
  if (companyError || !companyId) {
    throw companyError || new Error("Firmatilknytningen kunne ikke bekreftes.");
  }

  // Demo/Test tåler ikke at en summary-only rad når detaljvisningen. Primer akkurat
  // den eksakte DEMO42L-saken før eksisterende Sales-open-signal sendes videre.
  const { error: primeError } = await primeSalesRequestDetailRow(
    client,
    companyId,
    cleanRef
  );
  if (primeError) throw primeError;

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
