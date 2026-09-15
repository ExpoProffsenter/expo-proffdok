// Expo ProffDok – FASE 42J
// Tydelig veiviser og få hurtigvalg i kollapset desktop-prosjektmeny.
// Leser eksisterende native nav og klikker de samme knappene; lager ingen ny
// navigasjonsmotor og endrer ingen prosjektdata.

import "./projectWorkspaceHeaderGuide.css";

const DESKTOP_QUERY = "(min-width: 1181px)";
const GUIDE_ID = "expo-project-workspace-guide";
const BAR_ID = "expo-desktop-menu-bar";
const SHORTCUTS = [
  { label: "Oversikt", source: "Prosjektoversikt" },
  { label: "Bilder", source: "Bilder" },
  { label: "Sjekklister", source: "Sjekklister" },
  { label: "Chat", source: "Chat" },
];

const clean = (value = "") => String(value || "").replace(/\s+/g, " ").trim();

function findSourceNav() {
  return Array.from(document.querySelectorAll("nav")).find((nav) => {
    if (!(nav instanceof HTMLElement)) return false;
    if (nav.closest("[data-expo-auth-shell]")) return false;
    const labels = Array.from(nav.querySelectorAll(":scope > button")).map((button) =>
      clean(button.textContent)
    );
    return labels.includes("Prosjektoversikt") && labels.includes("Bilder");
  }) || null;
}

function sourceButton(label) {
  const nav = findSourceNav();
  if (!(nav instanceof HTMLElement)) return null;
  return Array.from(nav.querySelectorAll(":scope > button")).find(
    (button) => clean(button.textContent) === label
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
  const label = activeProjectLabel();
  if (!label) return false;
  if (["Startside", "Befaring/Tilbud", "Hjelp", "Firmaprofil", "Firma", "Systemadministrasjon"].includes(label)) {
    return false;
  }
  return Boolean(sourceButton("Prosjektoversikt"));
}

function buildGuide() {
  let guide = document.getElementById(GUIDE_ID);
  if (guide) return guide;

  guide = document.createElement("div");
  guide.id = GUIDE_ID;
  guide.className = "expoProjectWorkspaceGuide";

  const hint = document.createElement("span");
  hint.className = "expoProjectWorkspaceHint";
  hint.textContent = "Velg prosjektinnhold fra Meny";

  const actions = document.createElement("div");
  actions.className = "expoProjectWorkspaceQuickActions";

  SHORTCUTS.forEach(({ label, source }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "expoProjectWorkspaceQuickButton";
    button.dataset.sourceLabel = source;
    button.textContent = label;
    button.title = `Åpne ${label.toLowerCase()} i aktivt prosjekt`;
    button.addEventListener("click", () => {
      const target = sourceButton(source);
      if (target instanceof HTMLButtonElement) target.click();
    });
    actions.append(button);
  });

  guide.append(hint, actions);
  return guide;
}

function syncGuide() {
  const existing = document.getElementById(GUIDE_ID);
  if (!window.matchMedia(DESKTOP_QUERY).matches || !isProjectWorkspace()) {
    existing?.remove();
    return;
  }

  const bar = document.getElementById(BAR_ID);
  if (!(bar instanceof HTMLElement)) return;

  const guide = buildGuide();
  const help = document.getElementById("expo-desktop-help-button");
  if (guide.parentElement !== bar) {
    if (help instanceof HTMLElement) bar.insertBefore(guide, help);
    else bar.append(guide);
  }

  const active = activeProjectLabel();
  guide.querySelectorAll(".expoProjectWorkspaceQuickButton").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    const isActive = clean(button.dataset.sourceLabel) === active;
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
