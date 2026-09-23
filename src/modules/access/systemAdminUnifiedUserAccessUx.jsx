// Expo ProffDok – FASE 41B.2A
// Systemadmin behandler bruker, rolle/firma og tilganger på samme eksisterende brukerkort.
// Den etablerte godkjennings-/deaktiveringsflyten i main beholdes urørt.

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  MODULE_CATALOG,
  listManagedModuleAccess,
  normalizeModuleKeys,
  setManagedModuleAccess,
} from "./moduleAccessClient.js";
import {
  hasInternalNetPriceAccess,
  setManagedInternalNetPriceAccess,
} from "./sensitiveAccessClient.js";

const MOUNT_ATTR = "data-systemadmin-unified-access";
const ALLOWED_NET_COMPANIES = new Set([
  "ringside rorleggerbedrift as",
  "bademiljo expo",
  "expo proffsenter",
]);

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeCompany(value = "") {
  return compactText(value)
    .toLocaleLowerCase("nb-NO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o");
}

function moduleKeysEqual(a = [], b = []) {
  return normalizeModuleKeys(a).join("|") === normalizeModuleKeys(b).join("|");
}

function toggleModule(keys, key, checked) {
  const next = new Set(normalizeModuleKeys(keys));
  if (checked) next.add(key);
  else next.delete(key);
  if (key === "store_offers" && checked) next.add("sales");
  if (key === "sales" && !checked) next.delete("store_offers");
  return normalizeModuleKeys([...next]);
}

function UnifiedAccessControls({ user, onReload }) {
  const targetIsSystemAdmin = user.system_role === "systemadmin";
  const initialModules = targetIsSystemAdmin
    ? MODULE_CATALOG.map((module) => module.key)
    : normalizeModuleKeys(user.module_keys || []);
  const initialNet = hasInternalNetPriceAccess(user);
  const canUseNetFeature = targetIsSystemAdmin || ALLOWED_NET_COMPANIES.has(normalizeCompany(user.company_name));

  const [draftModules, setDraftModules] = useState(initialModules);
  const [draftNet, setDraftNet] = useState(initialNet);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftModules(initialModules);
    setDraftNet(initialNet);
    setMessage("");
    setError("");
  }, [user.user_id, user.system_role, user.company_name, JSON.stringify(user.module_keys || []), JSON.stringify(user.feature_keys || [])]);

  const modulesDirty = !moduleKeysEqual(draftModules, initialModules);
  const netDirty = Boolean(draftNet) !== Boolean(initialNet);
  const dirty = modulesDirty || netDirty;

  async function save() {
    if (!dirty || saving || targetIsSystemAdmin) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      if (modulesDirty) {
        await setManagedModuleAccess(user.user_id, draftModules);
      }
      if (netDirty) {
        await setManagedInternalNetPriceAccess(user.user_id, canUseNetFeature ? draftNet : false);
      }
      setMessage("Tilgang lagret");
      await onReload?.();
    } catch (saveError) {
      setError(saveError?.message || "Kunne ikke lagre tilgangene.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 14,
        borderTop: "1px solid #dbe5ea",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <b style={{ display: "block" }}>Tilganger</b>
          <small style={{ color: "#64748b" }}>
            Hovedmoduler og eventuell tilgang til sensitive interne nettopriser.
          </small>
        </div>
        {targetIsSystemAdmin ? (
          <small style={{ color: "#087f88", fontWeight: 800 }}>Systemadministrator har alltid alle tilganger</small>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: 8,
          marginTop: 10,
        }}
      >
        {MODULE_CATALOG.map((module) => (
          <label
            key={module.key}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              padding: "9px 10px",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              background: targetIsSystemAdmin ? "#f8fafc" : "#fff",
              cursor: targetIsSystemAdmin ? "default" : "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={draftModules.includes(module.key)}
              disabled={targetIsSystemAdmin || saving}
              onChange={(event) =>
                setDraftModules((keys) => toggleModule(keys, module.key, event.target.checked))
              }
              style={{ marginTop: 2 }}
            />
            <span>
              <b style={{ display: "block", fontSize: 13 }}>{module.label}</b>
              {module.key === "store_offers" ? (
                <small style={{ color: "#64748b" }}>Krever Befaring / Våtromstilbud</small>
              ) : null}
            </span>
          </label>
        ))}

        {canUseNetFeature ? (
          <label
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              padding: "9px 10px",
              border: "1px solid #f1c27d",
              borderRadius: 10,
              background: targetIsSystemAdmin ? "#fffaf2" : "#fffdf8",
              cursor: targetIsSystemAdmin ? "default" : "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={draftNet}
              disabled={targetIsSystemAdmin || saving}
              onChange={(event) => setDraftNet(event.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>
              <b style={{ display: "block", fontSize: 13 }}>Se interne nettopriser</b>
              <small style={{ color: "#8a5a12" }}>
                Gjelder Prissøk og varesøk i Butikktilbud. Kun systemadministrator kan gi denne tilgangen.
              </small>
            </span>
          </label>
        ) : null}
      </div>

      {error ? <p style={{ color: "#991b1b", fontWeight: 800, margin: "9px 0 0" }}>{error}</p> : null}
      {message ? <p style={{ color: "#087f88", fontWeight: 800, margin: "9px 0 0" }}>{message}</p> : null}

      {!targetIsSystemAdmin ? (
        <button type="button" onClick={save} disabled={!dirty || saving} style={{ marginTop: 10 }}>
          {saving ? "Lagrer tilgang..." : dirty ? "Lagre tilgang" : "Tilgang lagret"}
        </button>
      ) : null}
    </div>
  );
}

function findLegacyUserPanel() {
  const headings = Array.from(document.querySelectorAll("h3"));
  const heading = headings.find((node) => {
    const text = compactText(node.textContent);
    return text === "Brukergodkjenning" || text === "Brukere og tilganger";
  });
  return heading?.closest(".item") || null;
}

function findUserCard(panel, email) {
  const cleanEmail = compactText(email).toLocaleLowerCase("nb-NO");
  if (!panel || !cleanEmail) return null;
  return Array.from(panel.querySelectorAll(":scope > .item, :scope .item")).find((card) => {
    const directBold = Array.from(card.children).find((child) => child.tagName === "B");
    return compactText(directBold?.textContent).toLocaleLowerCase("nb-NO") === cleanEmail;
  }) || null;
}

function renameLegacyPanel(panel) {
  if (!panel) return;
  const heading = Array.from(panel.querySelectorAll(":scope > h3, h3")).find((node) => {
    const text = compactText(node.textContent);
    return text === "Brukergodkjenning" || text === "Brukere og tilganger";
  });
  if (heading && compactText(heading.textContent) !== "Brukere og tilganger") {
    heading.textContent = "Brukere og tilganger";
  }
  const intro = heading?.nextElementSibling;
  if (intro instanceof HTMLElement && intro.matches("p.note")) {
    intro.textContent = "Behandle brukerstatus, firma, rolle, hovedmoduler og sensitiv nto-pristilgang på samme brukerkort. Kun systemadministrator kan gi tilgang til interne nettopriser.";
  }

  const accordionButton = Array.from(document.querySelectorAll("button.secondary")).find((button) =>
    compactText(button.textContent).includes("Brukere og roller") || compactText(button.textContent).includes("Brukere og tilganger")
  );
  if (accordionButton) {
    const textNode = Array.from(accordionButton.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
    if (textNode && String(textNode.textContent || "").includes("Brukere og roller")) {
      textNode.textContent = String(textNode.textContent || "").replace("Brukere og roller", "Brukere og tilganger");
    }
  }
}

const roots = new Map();
let snapshot = null;
let loadPromise = null;

function hideDuplicateManager() {
  const mount = document.getElementById("expo-module-access-manager");
  if (!(mount instanceof HTMLElement)) return;
  if (snapshot?.is_systemadmin) {
    mount.dataset.unifiedSystemadminHidden = "1";
    mount.style.display = "none";
  } else if (mount.dataset.unifiedSystemadminHidden === "1") {
    mount.style.removeProperty("display");
    delete mount.dataset.unifiedSystemadminHidden;
  }
}

function cleanupDetachedRoots() {
  roots.forEach((entry, key) => {
    if (entry.mount?.isConnected) return;
    entry.root?.unmount?.();
    roots.delete(key);
  });
}

function renderIntoLegacyCards() {
  cleanupDetachedRoots();
  hideDuplicateManager();
  if (!snapshot?.is_systemadmin) return;

  const panel = findLegacyUserPanel();
  if (!panel) return;
  renameLegacyPanel(panel);

  (snapshot.users || []).forEach((user) => {
    const card = findUserCard(panel, user.email);
    if (!card) return;

    let entry = roots.get(user.user_id);
    if (!entry || entry.mount?.parentElement !== card) {
      entry?.root?.unmount?.();
      entry?.mount?.remove?.();
      const mount = document.createElement("div");
      mount.setAttribute(MOUNT_ATTR, user.user_id);
      card.appendChild(mount);
      entry = { mount, root: createRoot(mount) };
      roots.set(user.user_id, entry);
    }

    entry.root.render(<UnifiedAccessControls user={user} onReload={loadSnapshot} />);
  });
}

async function loadSnapshot() {
  if (loadPromise) return loadPromise;
  loadPromise = listManagedModuleAccess()
    .then((data) => {
      snapshot = data;
      renderIntoLegacyCards();
      return data;
    })
    .catch(() => {
      snapshot = null;
      hideDuplicateManager();
      return null;
    })
    .finally(() => {
      loadPromise = null;
    });
  return loadPromise;
}

export function installSystemAdminUnifiedUserAccessUx() {
  if (typeof window === "undefined" || window.__expoSystemAdminUnifiedUserAccessInstalled) return;
  window.__expoSystemAdminUnifiedUserAccessInstalled = true;

  let frame = 0;
  const scheduleRender = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      renderIntoLegacyCards();
    });
  };

  const observer = new MutationObserver(scheduleRender);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const scheduleReload = () => window.setTimeout(() => loadSnapshot(), 450);
  document.addEventListener("change", (event) => {
    if (event.target instanceof Element && event.target.closest(".adminAccordionItem")) scheduleReload();
  }, true);
  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (!button) return;
    const text = compactText(button.textContent);
    if (
      text.includes("Brukere og roller") ||
      text.includes("Brukere og tilganger") ||
      text === "Oppdater brukerliste" ||
      text === "Godkjenn bruker" ||
      text === "Deaktiver bruker" ||
      text === "Reaktiver bruker" ||
      text === "Gjør til systemadmin" ||
      text === "Fjern systemadmin"
    ) {
      scheduleReload();
    }
  }, true);
  window.addEventListener("focus", loadSnapshot);

  loadSnapshot();
}
