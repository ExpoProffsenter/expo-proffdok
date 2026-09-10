// Expo ProffDok – FASE 41B.1
// Når et nytt hovedsøk startes i Befaring/Tilbud, åpnes Alle statuser automatisk.
// Brukeren kan deretter snevre inn søket ved å velge en arbeidsstatus manuelt.

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function findAllStatusButton(searchInput) {
  const panel = searchInput?.closest('section[aria-label="Søk og filtrering"]');
  const statusTabs = panel?.querySelector('[role="tablist"][aria-label="Arbeidsstatus"]');
  if (!statusTabs) return null;
  return (
    Array.from(statusTabs.querySelectorAll("button")).find((button) =>
      /^Alle(?:\s|$)/.test(compactText(button.textContent))
    ) || null
  );
}

export function installSalesOverviewSearchUx() {
  if (typeof document === "undefined" || window.__expoSalesOverviewSearchUxInstalled) return;
  window.__expoSalesOverviewSearchUxInstalled = true;

  document.addEventListener(
    "input",
    (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "search") return;
      if (!input.closest('.sales-app section[aria-label="Søk og filtrering"]')) return;

      const hasQuery = Boolean(compactText(input.value));
      const hadQuery = input.dataset.salesSearchHadQuery === "1";
      input.dataset.salesSearchHadQuery = hasQuery ? "1" : "0";

      if (!hasQuery || hadQuery) return;
      const allButton = findAllStatusButton(input);
      if (!(allButton instanceof HTMLButtonElement)) return;
      if (allButton.getAttribute("aria-selected") === "true") return;
      allButton.click();
    },
    true
  );
}
