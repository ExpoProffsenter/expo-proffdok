// Expo ProffDok – FASE 45B / FASE 39B.2C
// Internt ERP-vareregister beholdes som egen systemoppgave.
// Proffleverandør/rabatt ligger nå under samlet «Firmaer, brukere og tilganger»
// sammen med firmaets brukere, moduler og prisinnsyn.

import { createRoot } from "react-dom/client";
import { StoreCatalogAdminOnlyPanel } from "./StoreCatalogOfferTools.jsx";
import { installPriceSearchPortalGuard } from "./priceSearchPortalGuard.js";

const SYSTEMADMIN_MOUNT_ID = "expo-systemadmin-store-catalog";

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

export function installSystemAdminStoreCatalogUx() {
  if (typeof document === "undefined") return () => {};
  installPriceSearchPortalGuard();

  let root = null;
  let observer = null;

  const unmount = () => {
    root?.unmount?.();
    root = null;
    document.getElementById(SYSTEMADMIN_MOUNT_ID)?.remove();
  };

  const tryMount = () => {
    const section = findSystemAdminSection();
    const existing = document.getElementById(SYSTEMADMIN_MOUNT_ID);

    if (!section) {
      if (existing && document.body.contains(existing)) unmount();
      return false;
    }
    if (existing && section.contains(existing)) return true;
    if (existing) unmount();

    const mount = document.createElement("div");
    mount.id = SYSTEMADMIN_MOUNT_ID;
    mount.style.marginTop = "16px";
    section.appendChild(mount);

    root = createRoot(mount);
    root.render(
      <div className="item adminAccordionItem" style={{ marginTop: 0 }}>
        <h3 style={{ marginTop: 0 }}>Internt vareregister</h3>
        <p className="note">
          Oppdatering av ERP-vareregisteret er en systemadmin-oppgave. Varesøk i
          tilbud skjer direkte inne på den enkelte tilbudsposten.
        </p>
        <StoreCatalogAdminOnlyPanel />
      </div>
    );
    return true;
  };

  observer = new MutationObserver(tryMount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  tryMount();

  return () => {
    observer?.disconnect();
    unmount();
  };
}
