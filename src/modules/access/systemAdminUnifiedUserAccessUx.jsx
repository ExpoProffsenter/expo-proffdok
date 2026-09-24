// Expo ProffDok – FASE 41B.2A / 45B
// Systemadmin behandler bruker, rolle/firma og ALLE brukertilganger på samme eksisterende brukerkort.
// Etablerte Godkjenn/Deaktiver/Firma/Rolle-handlinger eies fortsatt av legacy-panelet og røres ikke her.

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
import { setManagedProCatalogNetPriceAccess } from "./proUserAccessClient.js";

const MOUNT_ATTR = "data-systemadmin-unified-access";
const INTERNAL_COMMERCE_COMPANIES = new Set([
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

function modulePresentation(module, { internalCompany, proCompany }) {
  if (module.key !== "store_offers") return { label: module.label, note: "" };
  if (internalCompany) {
    return { label: "Butikktilbud", note: "Krever Befaring / Våtromstilbud" };
  }
  if (proCompany) {
    return { label: "Enkel ordre / Proff vareregister", note: "Krever Befaring / Våtromstilbud" };
  }
  return {
    label: "Enkel ordre / Proff vareregister",
    note: "Aktiver leverandører for firmaet under Proff vareregister først",
  };
}

function UnifiedAccessControls({ user, onReload }) {
  const targetIsSystemAdmin = user.system_role === "systemadmin";
  const internalCompany = INTERNAL_COMMERCE_COMPANIES.has(normalizeCompany(user.company_name));
  const proCompany = user.company_has_pro_catalog === true;
  const canUseStoreModule = targetIsSystemAdmin || internalCompany || proCompany;
  const canUseInternalNet = targetIsSystemAdmin || internalCompany;
  const canUseProNet = !targetIsSystemAdmin && !internalCompany && proCompany;

  const initialModules = targetIsSystemAdmin
    ? MODULE_CATALOG.map((module) => module.key)
    : normalizeModuleKeys(user.module_keys || []);
  const initialInternalNet = hasInternalNetPriceAccess(user);
  const initialProNet = user.pro_net_price_can_view === true;

  const [draftModules, setDraftModules] = useState(initialModules);
  const [draftInternalNet, setDraftInternalNet] = useState(initialInternalNet);
  const [draftProNet, setDraftProNet] = useState(initialProNet);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftModules(initialModules);
    setDraftInternalNet(initialInternalNet);
    setDraftProNet(initialProNet);
    setMessage("");
    setError("");
  }, [
    user.user_id,
    user.system_role,
    user.company_name,
    user.company_has_pro_catalog,
    user.pro_net_price_can_view,
    JSON.stringify(user.module_keys || []),
    JSON.stringify(user.feature_keys || []),
  ]);

  const storeSelected = draftModules.includes("store_offers");
  const modulesDirty = !moduleKeysEqual(draftModules, initialModules);
  const internalNetDirty = canUseInternalNet && Boolean(draftInternalNet) !== Boolean(initialInternalNet);
  const effectiveProNet = canUseProNet && storeSelected ? Boolean(draftProNet) : false;
  const proNetDirty = canUseProNet && effectiveProNet !== Boolean(initialProNet);
  const dirty = modulesDirty || internalNetDirty || proNetDirty;

  async function save() {
    if (!dirty || saving || targetIsSystemAdmin) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      if (modulesDirty) {
        await setManagedModuleAccess(user.user_id, draftModules);
      }
      if (internalNetDirty) {
        await setManagedInternalNetPriceAccess(
          user.user_id,
          canUseInternalNet ? draftInternalNet : false
        );
      }
      if (proNetDirty) {
        await setManagedProCatalogNetPriceAccess(user.user_id, effectiveProNet);
      }
      setMessage("Tilganger lagret");
      await onReload?.();
    } catch (saveError) {
      setError(saveError?.message || "Kunne ikke lagre tilgangene.");
    } finally {
      setSaving(false);
    }
  }

  function changeModule(moduleKey, checked) {
    setDraftModules((keys) => {
      const next = toggleModule(keys, moduleKey, checked);
      if (moduleKey === "store_offers" && !checked) setDraftProNet(false);
      if (moduleKey === "sales" && !checked) setDraftProNet(false);
      return next;
    });
  }

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #dbe5ea" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <b style={{ display: "block" }}>Tilganger</b>
          <small style={{ color: "#64748b" }}>
            Hovedmoduler og prisinnsyn styres her på samme brukerkort.
          </small>
        </div>
        {targetIsSystemAdmin ? (
          <small style={{ color: "#087f88", fontWeight: 800 }}>
            Systemadministrator har alltid alle tilganger
          </small>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 8, marginTop: 10 }}>
        {MODULE_CATALOG.map((module) => {
          const presentation = modulePresentation(module, { internalCompany, proCompany });
          const storeModule = module.key === "store_offers";
          const disabled = targetIsSystemAdmin || saving || (storeModule && !canUseStoreModule);
          return (
            <label
              key={module.key}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                padding: "9px 10px",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                background: disabled ? "#f8fafc" : "#fff",
                opacity: storeModule && !canUseStoreModule ? 0.62 : 1,
                cursor: disabled ? "default" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={draftModules.includes(module.key)}
                disabled={disabled}
                onChange={(event) => changeModule(module.key, event.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>
                <b style={{ display: "block", fontSize: 13 }}>{presentation.label}</b>
                {presentation.note ? <small style={{ color: "#64748b" }}>{presentation.note}</small> : null}
              </span>
            </label>
          );
        })}

        {canUseInternalNet ? (
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "9px 10px", border: "1px solid #f1c27d", borderRadius: 10, background: targetIsSystemAdmin ? "#fffaf2" : "#fffdf8", cursor: targetIsSystemAdmin ? "default" : "pointer" }}>
            <input
              type="checkbox"
              checked={draftInternalNet}
              disabled={targetIsSystemAdmin || saving}
              onChange={(event) => setDraftInternalNet(event.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>
              <b style={{ display: "block", fontSize: 13 }}>Se interne nettopriser</b>
              <small style={{ color: "#8a5a12" }}>
                Ringside/Expo: gjelder Prissøk og internt vareoppslag. Kun Systemadmin kan gi tilgangen.
              </small>
            </span>
          </label>
        ) : null}

        {canUseProNet ? (
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "9px 10px", border: "1px solid #b9dfe3", borderRadius: 10, background: "#f5fcfd", opacity: storeSelected ? 1 : 0.62, cursor: storeSelected && !saving ? "pointer" : "default" }}>
            <input
              type="checkbox"
              checked={effectiveProNet}
              disabled={!storeSelected || saving}
              onChange={(event) => setDraftProNet(event.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>
              <b style={{ display: "block", fontSize: 13 }}>Se «Din nto pris»</b>
              <small style={{ color: "#477078" }}>
                Proffkunde: viser firmaets rabattberegnede pris. Ringsides innkjøpspris eksponeres aldri.
              </small>
            </span>
          </label>
        ) : null}
      </div>

      {error ? <p style={{ color: "#991b1b", fontWeight: 800, margin: "9px 0 0" }}>{error}</p> : null}
      {message ? <p style={{ color: "#087f88", fontWeight: 800, margin: "9px 0 0" }}>{message}</p> : null}

      {!targetIsSystemAdmin ? (
        <button type="button" onClick={save} disabled={!dirty || saving} style={{ marginTop: 10 }}>
          {saving ? "Lagrer tilganger..." : dirty ? "Lagre tilganger" : "Tilganger lagret"}
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
    intro.textContent = "Behandle brukerstatus, firma, rolle og alle brukertilganger på samme brukerkort. Leverandør/rabatt settes separat per firma under Proff vareregister.";
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
    .finally(() => { loadPromise = null; });
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
      text.includes("Brukere og roller") || text.includes("Brukere og tilganger") ||
      text === "Oppdater brukerliste" || text === "Godkjenn bruker" ||
      text === "Deaktiver bruker" || text === "Reaktiver bruker" ||
      text === "Gjør til systemadmin" || text === "Fjern systemadmin"
    ) scheduleReload();
  }, true);
  window.addEventListener("focus", loadSnapshot);
  loadSnapshot();
}
