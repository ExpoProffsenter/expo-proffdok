// Expo ProffDok – FASE 45B / FASE 39B.2C
// Monterer vareregisteradministrasjon i eksisterende Systemadmin-flate.
// Leverandør/rabatt er firmaegenskaper her. Brukertilgang og «Din nto pris»
// administreres kun på eksisterende «Brukere og tilganger»-kort.

import { createRoot } from "react-dom/client";
import { StoreCatalogAdminOnlyPanel } from "./StoreCatalogOfferTools.jsx";
import ProStoreCatalogAdminPanel from "./ProStoreCatalogAdminPanel.jsx";
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
      <>
        <div className="item adminAccordionItem" style={{ marginTop: 0 }}>
          <h3 style={{ marginTop: 0 }}>Internt vareregister</h3>
          <p className="note">
            Oppdatering av ERP-vareregisteret er en systemadmin-oppgave. Varesøk i
            tilbud skjer direkte inne på den enkelte tilbudsposten.
          </p>
          <StoreCatalogAdminOnlyPanel />
        </div>
        <div className="item adminAccordionItem" style={{ marginTop: 16 }}>
          <ProStoreCatalogAdminPanel />
        </div>
      </>
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
