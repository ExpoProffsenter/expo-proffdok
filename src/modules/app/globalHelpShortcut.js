// Expo ProffDok – FASE 38A1
// Global Hjelp-hurtigknapp på desktop. Hjelp er en appfunksjon og skal være
// tilgjengelig uavhengig av Prosjekt-/Sales-modultilgang.

const SHORTCUT_ID = "expo-global-help-shortcut";
const DESKTOP_MEDIA = "(min-width: 900px)";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function findButtonByText(text) {
  return Array.from(document.querySelectorAll("button")).find(
    (button) => button.id !== SHORTCUT_ID && compactText(button.textContent) === text
  );
}

function openHelp() {
  const helpButton = findButtonByText("Hjelp");
  if (helpButton) {
    helpButton.click();
    return;
  }

  const menuButton = findButtonByText("Meny");
  if (!menuButton) return;
  menuButton.click();
  window.setTimeout(() => findButtonByText("Hjelp")?.click(), 0);
}

function findHeaderActionArea() {
  const logoutButton = findButtonByText("Logg ut");
  if (!logoutButton) return null;
  return logoutButton.closest("header") || logoutButton.parentElement;
}

function installShortcut() {
  if (typeof window === "undefined" || !window.matchMedia(DESKTOP_MEDIA).matches) {
    document.getElementById(SHORTCUT_ID)?.remove();
    return false;
  }

  if (document.getElementById(SHORTCUT_ID)) return true;

  const actionArea = findHeaderActionArea();
  if (!actionArea) return false;

  const shortcut = document.createElement("button");
  shortcut.id = SHORTCUT_ID;
  shortcut.type = "button";
  shortcut.className = "secondary";
  shortcut.textContent = "? Hjelp";
  shortcut.title = "Åpne Hjelp";
  shortcut.setAttribute("aria-label", "Åpne Hjelp");
  shortcut.addEventListener("click", openHelp);

  const startButton = Array.from(actionArea.querySelectorAll("button")).find((button) =>
    /startside/i.test(compactText(button.textContent))
  );

  if (startButton) startButton.insertAdjacentElement("afterend", shortcut);
  else {
    const logoutButton = findButtonByText("Logg ut");
    if (logoutButton?.parentElement === actionArea) logoutButton.insertAdjacentElement("afterend", shortcut);
    else actionArea.appendChild(shortcut);
  }

  return true;
}

export function installGlobalHelpShortcut() {
  if (typeof window === "undefined" || window.__expoGlobalHelpShortcutInstalled) return;
  window.__expoGlobalHelpShortcutInstalled = true;

  const media = window.matchMedia(DESKTOP_MEDIA);
  const apply = () => installShortcut();

  const observer = new MutationObserver(() => {
    if (!document.getElementById(SHORTCUT_ID)) apply();
  });

  const root = document.getElementById("root") || document.documentElement;
  observer.observe(root, { childList: true, subtree: true });
  media.addEventListener?.("change", apply);

  apply();
}
