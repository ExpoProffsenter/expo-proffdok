// Expo ProffDok – FASE 42L / FASE 39B.2C
// Monterer isolerte systemadminverktøy i eksisterende Systemadmin-flate og et
// systemadmin-only Demo/Test-hurtigvalg på den native Startsiden.
// Tilgang til vareregister avgjøres fortsatt server-side av canManageInternalStoreCatalog().

import { createRoot } from "react-dom/client";
import { DemoHomeLauncher } from "../demo/DemoHomeLauncher.jsx";
import { DemoTestPanel } from "../demo/DemoTestPanel.jsx";
import { StoreCatalogAdminOnlyPanel } from "./StoreCatalogOfferTools.jsx";

const ADMIN_MOUNT_ID = "expo-systemadmin-store-catalog";
const HOME_MOUNT_ID = "expo-systemadmin-demo-home";
const MOBILE_HOME_QUERY = "(max-width: 900px)";

function normalizedText(node) {
  return String(node?.textContent || "").replace(/\s+/g, " ").trim();
}

function findSystemAdminSection() {
  if (typeof document === "undefined") return null;
  const heading = Array.from(document.querySelectorAll("section > h2")).find(
    (node) => normalizedText(node) === "Systemadmin"
  );
  return heading?.closest("section") || null;
}

function elementIsActuallyVisible(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (!element.isConnected || element.getClientRects().length === 0) return false;

  let current = element;
  while (current && current instanceof HTMLElement) {
    const style = window.getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return false;
    current = current.parentElement;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function findActiveHomeSection() {
  if (typeof document === "undefined") return null;

  const mobile = typeof window.matchMedia === "function"
    ? window.matchMedia(MOBILE_HOME_QUERY).matches
    : window.innerWidth <= 900;
  const selector = mobile ? ".mobileProjectChooser" : ".desktopNoProjectWelcome";
  const section = document.querySelector(selector);

  if (!elementIsActuallyVisible(section)) return null;
  if (section.closest(".sales-app")) return null;
  return section;
}

function insertHomeMount(section, mount) {
  const hero = section.querySelector(".mobileHomeHero, .desktopNoProjectHero");
  if (!hero) {
    section.prepend(mount);
    return;
  }
  if (hero.nextSibling) section.insertBefore(mount, hero.nextSibling);
  else section.appendChild(mount);
}

export function installSystemAdminStoreCatalogUx() {
  if (typeof document === "undefined") return () => {};

  let adminRoot = null;
  let homeRoot = null;
  let observer = null;

  const unmountAdmin = () => {
    adminRoot?.unmount?.();
    adminRoot = null;
    document.getElementById(ADMIN_MOUNT_ID)?.remove();
  };

  const unmountHome = () => {
    homeRoot?.unmount?.();
    homeRoot = null;
    document.getElementById(HOME_MOUNT_ID)?.remove();
  };

  const syncAdminMount = () => {
    const section = findSystemAdminSection();
    const existing = document.getElementById(ADMIN_MOUNT_ID);

    if (!section) {
      if (existing) unmountAdmin();
      return false;
    }
    if (existing && section.contains(existing)) return true;
    if (existing) unmountAdmin();

    const mount = document.createElement("div");
    mount.id = ADMIN_MOUNT_ID;
    mount.style.marginTop = "16px";
    section.appendChild(mount);

    adminRoot = createRoot(mount);
    adminRoot.render(
      <>
        <DemoTestPanel />
        <div className="item adminAccordionItem" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Internt vareregister</h3>
          <p className="note">
            Oppdatering av ERP-vareregisteret er en systemadmin-oppgave. Varesøk i
            tilbud skjer direkte inne på den enkelte tilbudsposten.
          </p>
          <StoreCatalogAdminOnlyPanel />
        </div>
      </>
    );
    return true;
  };

  const syncHomeMount = () => {
    const section = findActiveHomeSection();
    const existing = document.getElementById(HOME_MOUNT_ID);

    if (!section) {
      if (existing) unmountHome();
      return false;
    }
    if (existing && section.contains(existing)) return true;
    if (existing) unmountHome();

    const mount = document.createElement("div");
    mount.id = HOME_MOUNT_ID;
    insertHomeMount(section, mount);

    homeRoot = createRoot(mount);
    homeRoot.render(<DemoHomeLauncher />);
    return true;
  };

  const syncMounts = () => {
    syncAdminMount();
    syncHomeMount();
  };

  observer = new MutationObserver(syncMounts);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", syncMounts);
  syncMounts();

  return () => {
    observer?.disconnect();
    window.removeEventListener("resize", syncMounts);
    unmountHome();
    unmountAdmin();
  };
}
