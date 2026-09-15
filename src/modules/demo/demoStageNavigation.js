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
import { readSalesWorkspaceResumeSnapshot } from "../sales/services/salesResumeRecovery.mjs";

const DEMO_PROJECT_TABS = new Set([
  "prosjekt",
  "fremdrift",
  "rapport",
  "garanti",
  "chat",
  "tilgang",
]);

let activeDemoSalesRequestRef = "";
let demoSalesResumeGuardInstalled = false;
let demoSalesResumeInFlight = false;

async function rehydrateActiveDemoSalesStageAfterResume() {
  const cleanRef = String(activeDemoSalesRequestRef || "").trim();
  if (
    !cleanRef ||
    !isDemoRequestRef(cleanRef) ||
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    document.visibilityState === "hidden" ||
    !document.querySelector(".sales-app")
  ) {
    return false;
  }

  const snapshot = readSalesWorkspaceResumeSnapshot();
  const navigation = snapshot?.navigation || null;
  const resumedRequestRef = String(navigation?.selectedRequestId || "").trim();
  const resumedMode = String(navigation?.mode || "").trim();

  // Demo-recovery er kun et sikkerhetsnett for intern detaljvisning, der en lett
  // summary ellers kan bli synlig etter app-/fanebytte. Rediger tilbud,
  // befaringsnotat og øvrige arbeidsbilder skal bruke den etablerte 42J-recoveryen
  // urørt; en tvungen remount her kan ellers kaste et korrekt hydrert skjema.
  if (resumedRequestRef !== cleanRef || resumedMode !== "detail") {
    return false;
  }

  const client = createDefaultSalesSupabaseClient();
  if (!client) throw new Error("Supabase er ikke tilgjengelig for Demo/Test.");

  const { data: companyId, error: companyError } =
    await resolveSalesCompanyScope(client);
  if (companyError || !companyId) {
    throw companyError || new Error("Firmatilknytningen kunne ikke bekreftes.");
  }

  const { error: primeError } = await primeSalesRequestDetailRow(
    client,
    companyId,
    cleanRef
  );
  if (primeError) throw primeError;

  // Full detalj ligger nå i den eksisterende preload-cachen. Remount samme Sales-
  // detaljbilde gjennom den etablerte recovery-eventen; editor/lagring endres ikke.
  window.dispatchEvent(new CustomEvent("expo-proffdok-sales-rehydrate"));
  return true;
}

function installDemoSalesResumeGuard() {
  if (
    demoSalesResumeGuardInstalled ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  demoSalesResumeGuardInstalled = true;
  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState !== "visible" ||
      demoSalesResumeInFlight ||
      !activeDemoSalesRequestRef
    ) {
      return;
    }

    demoSalesResumeInFlight = true;
    void rehydrateActiveDemoSalesStageAfterResume()
      .catch((error) => {
        console.warn("Kunne ikke gjenopprette full Demo/Test-sak etter appbytte", error);
      })
      .finally(() => {
        demoSalesResumeInFlight = false;
      });
  });
}

installDemoSalesResumeGuard();

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

  activeDemoSalesRequestRef = cleanRef;

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

  activeDemoSalesRequestRef = "";
  window.location.assign(
    `${window.location.pathname}?project=${encodeURIComponent(cleanProjectId)}&access=admin&tab=${encodeURIComponent(cleanTab)}`
  );
  return true;
}
