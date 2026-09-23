// Expo ProffDok – FASE 45B / FASE 39B.2C
// Monterer vareregisteradministrasjon i eksisterende Systemadmin- og Firma-flater.
// Intern ERP-katalog beholdes separat; profftilgang styres i egen additiv blokk.

import { createRoot } from "react-dom/client";
import { StoreCatalogAdminOnlyPanel } from "./StoreCatalogOfferTools.jsx";
import ProStoreCatalogAdminPanel from "./ProStoreCatalogAdminPanel.jsx";

const SYSTEMADMIN_MOUNT_ID = "expo-systemadmin-store-catalog";
const FIRMAADMIN_MOUNT_ID = "expo-firmaadmin-pro-store-catalog";

function normalizedText(node) {
  return String(node?.textContent || "").replace(/\s+/g, " ").trim();
}

function findSection(title) {
  if (typeof document === "undefined") return null;
  const heading = Array.from(document.querySelectorAll("section > h2")).find(
    (node) => normalizedText(node) === title
  );
  return heading?.closest("section") || null;
}

function mountIntoSection({ section, mountId, rootRef, render }) {
  const existing = document.getElementById(mountId);
  if (!section) {
    if (existing && document.body.contains(existing)) {
      rootRef.current?.unmount?.();
      rootRef.current = null;
      existing.remove();
    }
    return false;
  }
  if (existing && section.contains(existing)) return true;
  if (existing) {
    rootRef.current?.unmount?.();
    rootRef.current = null;
    existing.remove();
  }
  const mount = document.createElement("div");
  mount.id = mountId;
  mount.style.marginTop = "16px";
  section.appendChild(mount);
  rootRef.current = createRoot(mount);
  rootRef.current.render(render());
  return true;
}

export function installSystemAdminStoreCatalogUx() {
  if (typeof document === "undefined") return () => {};

  const systemRoot = { current: null };
  const firmaRoot = { current: null };
  let observer = null;

  const tryMount = () => {
    mountIntoSection({
      section: findSection("Systemadmin"),
      mountId: SYSTEMADMIN_MOUNT_ID,
      rootRef: systemRoot,
      render: () => (
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
            <ProStoreCatalogAdminPanel mode="systemadmin" />
          </div>
        </>
      ),
    });

    mountIntoSection({
      section: findSection("Firma"),
      mountId: FIRMAADMIN_MOUNT_ID,
      rootRef: firmaRoot,
      render: () => (
        <div className="item adminAccordionItem" style={{ marginTop: 16 }}>
          <ProStoreCatalogAdminPanel mode="firmaadmin" />
        </div>
      ),
    });
  };

  observer = new MutationObserver(tryMount);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  tryMount();

  return () => {
    observer?.disconnect();
    systemRoot.current?.unmount?.();
    firmaRoot.current?.unmount?.();
    document.getElementById(SYSTEMADMIN_MOUNT_ID)?.remove();
    document.getElementById(FIRMAADMIN_MOUNT_ID)?.remove();
  };
}
