// Expo ProffDok – FASE 42J / FASE 42K
// Komplett prosjektmeny i den kollapsede desktop-arbeidsflaten.
// Leser eksisterende native nav og klikker de samme knappene; lager ingen ny
// navigasjonsmotor og endrer ingen prosjektdata.
// Anbefalt prosjektløp beholdes i rekkefølgen, mens alle prosjektfunksjoner
// ligger tilgjengelig øverst uten å blande inn globale appfunksjoner.

import "./projectWorkspaceHeaderGuide.css";
import { isProjectDeviationNavLabel } from '../project/projectNavigationTabs.mjs';

const DESKTOP_QUERY = "(min-width: 1181px)";
const GUIDE_ID = "expo-project-workspace-guide";
const BAR_ID = "expo-desktop-menu-bar";
const clean = (value = "") => String(value || "").replace(/\s+/g, " ").trim();
const isOverviewLabel = (label = "") =>
  label === "Prosjektoversikt" || label === "Nytt prosjekt" || label === "Ordreoversikt";
const exact = (...labels) => (label = "") => labels.includes(label);
const startsWith = (prefix = "") => (label = "") =>
  label === prefix || label.startsWith(`${prefix} (`) || label.startsWith(`${prefix} `);

const PROJECT_SHORTCUTS = [
  { key: "overview", label: "Oversikt", matches: isOverviewLabel },
  { key: "sales", label: "Salgsgrunnlag", matches: exact("Salgsgrunnlag", "Tilbudsgrunnlag") },
  { key: "description", label: "Prosjektbeskrivelse", matches: exact("Prosjektbeskrivelse", "Ordrebeskrivelse") },
  { key: "agreement", label: "Avtalegrunnlag", matches: exact("Avtalegrunnlag", "Tilbud/kontrakt") },
  { key: "design", label: "Prosjektering", matches: exact("Prosjektering") },
  { key: "progress", label: "Fremdrift", matches: exact("Fremdrift") },
  { key: "products", label: "Produkter", matches: exact("Produkter", "Produkter / FDV") },
  { key: "surfaces", label: "Overflater og innredning", matches: exact("Overflater og innredning") },
  { key: "images", label: "Bilder", matches: exact("Bilder") },
  { key: "access", label: "Tilgang", matches: exact("Tilgang", "UE-tilgang") },
  { key: "installations", label: "Fag/utstyr", matches: exact("Fag/utstyr") },
  { key: "checklists", label: "Sjekklister", matches: exact("Sjekklister") },
  { key: "deviations", label: "Avvik", matches: isProjectDeviationNavLabel, dynamicLabel: true },
  { key: "chat", label: "Chat", matches: startsWith("Chat"), dynamicLabel: true },
  { key: "internal", label: "Interne notater", matches: exact("Interne notater") },
  { key: "handover", label: "Overtagelse", matches: exact("Overtagelse") },
  { key: "warranty", label: "Garanti", matches: startsWith("Garanti"), dynamicLabel: true },
  { key: "report", label: "Rapport", matches: exact("Rapport", "Sluttdokumentasjon") },
];

function findSourceNav() {
  return Array.from(document.querySelectorAll("nav")).find((nav) => {
    if (!(nav instanceof HTMLElement)) return false;
    if (nav.closest("[data-expo-auth-shell]")) return false;
    const labels = Array.from(nav.querySelectorAll(":scope > button")).map((button) =>
      clean(button.textContent)
    );
    return labels.some(isOverviewLabel) && labels.includes("Bilder");
  }) || null;
}

function sourceButton(key) {
  const nav = findSourceNav();
  if (!(nav instanceof HTMLElement)) return null;
  const shortcut = PROJECT_SHORTCUTS.find((candidate) => candidate.key === key);
  if (!shortcut) return null;
  return Array.from(nav.querySelectorAll(":scope > button")).find(
    (button) => !button.hidden && button.style.display !== "none" && shortcut.matches(clean(button.textContent))
  ) || null;
}

function activeProjectLabel() {
  const nav = findSourceNav();
  if (!(nav instanceof HTMLElement)) return "";
  const active = Array.from(nav.querySelectorAll(":scope > button")).find((button) =>
    button.classList.contains("on")
  );
  return clean(active?.textContent || "");
}

function isProjectWorkspace() {
  return Boolean(sourceButton("overview"));
}

function buildGuide() {
  let guide = document.getElementById(GUIDE_ID);
  if (guide) return guide;

  guide = document.createElement("div");
  guide.id = GUIDE_ID;
  guide.className = "expoProjectWorkspaceGuide";

  const hint = document.createElement("span");
  hint.className = "expoProjectWorkspaceHint";
  hint.textContent = "Prosjektmeny";

  const actions = document.createElement("div");
  actions.className = "expoProjectWorkspaceQuickActions";

  guide.append(hint, actions);
  return guide;
}

function syncShortcutButtons(guide) {
  const actions = guide.querySelector(".expoProjectWorkspaceQuickActions");
  if (!(actions instanceof HTMLElement)) return;

  const orderWorkspace = clean(sourceButton("overview")?.textContent) === "Ordreoversikt";
  const hint = guide.querySelector(".expoProjectWorkspaceHint");
  if (hint) hint.textContent = orderWorkspace ? "Ordremeny" : "Prosjektmeny";
  const available = PROJECT_SHORTCUTS.flatMap((shortcut) => {
    const target = sourceButton(shortcut.key);
    if (!(target instanceof HTMLButtonElement)) return [];
    const sourceLabel = clean(target.textContent);
    return [{
      ...shortcut,
      visibleLabel: shortcut.dynamicLabel || orderWorkspace ? sourceLabel : shortcut.label,
    }];
  });
  const signature = available.map(({ key, visibleLabel }) => `${key}:${visibleLabel}`).join("|");
  if (actions.dataset.signature === signature) return;

  actions.dataset.signature = signature;
  actions.replaceChildren();
  available.forEach(({ key, visibleLabel }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "expoProjectWorkspaceQuickButton";
    button.dataset.sourceKey = key;
    button.textContent = visibleLabel;
    button.title = `Åpne ${visibleLabel.toLowerCase()} i aktivt prosjekt`;
    button.addEventListener("click", () => {
      const target = sourceButton(key);
      if (target instanceof HTMLButtonElement) target.click();
    });
    actions.append(button);
  });
}

function syncGuide() {
  const existing = document.getElementById(GUIDE_ID);
  const bar = document.getElementById(BAR_ID);
  if (!window.matchMedia(DESKTOP_QUERY).matches || !isProjectWorkspace()) {
    existing?.remove();
    bar?.classList.remove("expoDesktopMenuBarHasProjectGuide");
    return;
  }

  if (!(bar instanceof HTMLElement)) return;
  bar.classList.add("expoDesktopMenuBarHasProjectGuide");

  const guide = buildGuide();
  syncShortcutButtons(guide);
  const help = document.getElementById("expo-desktop-help-button");
  if (guide.parentElement !== bar) {
    if (help instanceof HTMLElement) bar.insertBefore(guide, help);
    else bar.append(guide);
  }

  const active = activeProjectLabel();
  guide.querySelectorAll(".expoProjectWorkspaceQuickButton").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    const shortcut = PROJECT_SHORTCUTS.find(
      (candidate) => candidate.key === clean(button.dataset.sourceKey)
    );
    const isActive = Boolean(shortcut?.matches(active));
    button.classList.toggle("isActive", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

export function installProjectWorkspaceHeaderGuide() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__expoProjectWorkspaceHeaderGuideInstalled) return;
  window.__expoProjectWorkspaceHeaderGuideInstalled = true;

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      syncGuide();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  window.matchMedia(DESKTOP_QUERY).addEventListener?.("change", schedule);
  window.addEventListener("resize", schedule, { passive: true });
  schedule();
}
