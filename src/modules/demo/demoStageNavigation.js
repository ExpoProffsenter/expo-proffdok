// Expo ProffDok – FASE 42L
// Isolert demo-navigasjon som alltid bruker eksisterende native Sales-/prosjektflyt.
// Ingen demo-knapp skriver direkte til Sales-navigation eller prosjektstate.

const DEMO_OPEN_TIMER_KEY = "__expoProffDokDemoOpenTimer";

function compact(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function findNativeSalesButton() {
  return Array.from(document.querySelectorAll("button")).find((button) => {
    const text = compact(button.textContent);
    return text === "Befaring/Tilbud" || text === "Befaring / Våtromstilbud";
  }) || null;
}

export function clearQueuedDemoOpen() {
  if (typeof window === "undefined") return;
  const timer = window[DEMO_OPEN_TIMER_KEY];
  if (timer) window.clearInterval(timer);
  window[DEMO_OPEN_TIMER_KEY] = null;
}

function queueDemoSalesOpen(requestRef) {
  if (typeof window === "undefined") return;
  clearQueuedDemoOpen();

  const startedAt = Date.now();
  const timeoutMs = 8000;
  const tryOpen = () => {
    const allTab = Array.from(document.querySelectorAll('button[role="tab"]')).find(
      (button) => compact(button.textContent) === "Alle"
    );
    if (allTab && allTab.getAttribute("aria-selected") !== "true") allTab.click();

    const card = Array.from(document.querySelectorAll("button.sales-request-card")).find(
      (button) => compact(button.textContent).includes(requestRef)
    );
    if (card) {
      clearQueuedDemoOpen();
      card.click();
      return;
    }

    if (Date.now() - startedAt >= timeoutMs) {
      clearQueuedDemoOpen();
      window.alert(
        "Demo-saken kunne ikke åpnes automatisk. Gå til Befaring/Tilbud og søk på DEMO hvis dette gjentar seg."
      );
    }
  };

  window[DEMO_OPEN_TIMER_KEY] = window.setInterval(tryOpen, 150);
  tryOpen();
}

export function openDemoSalesStage(requestRef) {
  const cleanRef = String(requestRef || "").trim();
  if (!cleanRef || typeof document === "undefined") return false;

  const nativeSalesButton = findNativeSalesButton();
  if (!nativeSalesButton) return false;

  queueDemoSalesOpen(cleanRef);
  nativeSalesButton.click();
  return true;
}

export function openDemoProject(projectId) {
  const cleanProjectId = String(projectId || "").trim();
  if (!cleanProjectId || typeof window === "undefined") return false;

  window.location.assign(
    `${window.location.pathname}?project=${encodeURIComponent(cleanProjectId)}&access=admin&tab=prosjekt`
  );
  return true;
}
