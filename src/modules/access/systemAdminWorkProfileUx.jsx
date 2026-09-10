// Expo ProffDok – FASE 41B.3
// Systemadmin kan gi utvalgte brukere ekstra arbeidsprofiler i Ringside/Expo-gruppen.
// Primærfirma eies fortsatt av profiles.company_name og kan ikke fjernes her.

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  listManagedWorkProfiles,
  setManagedWorkProfiles,
} from "./workProfileClient.js";

const MOUNT_ATTR = "data-systemadmin-work-profiles";
const roots = new Map();
let snapshot = null;
let loadPromise = null;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function findUserPanel() {
  return Array.from(document.querySelectorAll("h3"))
    .find((node) => compactText(node.textContent) === "Brukere og tilganger")
    ?.closest(".item") || null;
}

function findUserCard(panel, email) {
  const cleanEmail = compactText(email).toLocaleLowerCase("nb-NO");
  if (!panel || !cleanEmail) return null;
  return Array.from(panel.querySelectorAll(":scope > .item, :scope .item")).find((card) => {
    const directBold = Array.from(card.children).find((child) => child.tagName === "B");
    return compactText(directBold?.textContent).toLocaleLowerCase("nb-NO") === cleanEmail;
  }) || null;
}

function sameIds(a = [], b = []) {
  const left = [...new Set((a || []).map(String))].sort();
  const right = [...new Set((b || []).map(String))].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function WorkProfileControls({ user, companies, onReload }) {
  const initialIds = useMemo(
    () => [...new Set((user.workspace_company_ids || []).map(String))],
    [user.user_id, JSON.stringify(user.workspace_company_ids || [])]
  );
  const primaryId = String(user.primary_company_id || "");
  const [draftIds, setDraftIds] = useState(initialIds);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftIds(initialIds);
    setMessage("");
    setError("");
  }, [user.user_id, JSON.stringify(initialIds)]);

  if (!primaryId || !companies.some((company) => String(company.company_id) === primaryId)) return null;
  if (!user.approved || user.deactivated || user.system_role === "systemadmin") return null;

  const dirty = !sameIds(draftIds, initialIds);
  const toggle = (companyId, checked) => {
    const id = String(companyId || "");
    if (!id || id === primaryId) return;
    setDraftIds((current) => {
      const next = new Set((current || []).map(String));
      if (checked) next.add(id);
      else next.delete(id);
      next.add(primaryId);
      return [...next];
    });
  };

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const ids = [...new Set([...draftIds.map(String), primaryId])];
      await setManagedWorkProfiles(user.user_id, ids);
      setMessage("Arbeidsprofiler lagret");
      await onReload?.();
    } catch (saveError) {
      setError(saveError?.message || "Kunne ikke lagre arbeidsprofiler.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #dbe5ea" }}>
      <b style={{ display: "block" }}>Arbeidsprofiler</b>
      <small style={{ display: "block", color: "#64748b", marginTop: 2 }}>
        Brukeren kan bytte mellom valgte firma uten at historiske prosjekter eller tilbud flyttes. Primærfirma er alltid med.
      </small>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 8, marginTop: 10 }}>
        {companies.map((company) => {
          const id = String(company.company_id || "");
          const isPrimary = id === primaryId;
          const checked = isPrimary || draftIds.includes(id);
          return (
            <label key={id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "9px 10px", border: "1px solid #e2e8f0", borderRadius: 10, background: isPrimary ? "#f0fdfa" : "#fff", cursor: isPrimary ? "default" : "pointer" }}>
              <input
                type="checkbox"
                checked={checked}
                disabled={isPrimary || saving}
                onChange={(event) => toggle(id, event.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>
                <b style={{ display: "block", fontSize: 13 }}>{company.company_name}</b>
                {isPrimary ? <small style={{ color: "#087f88", fontWeight: 800 }}>Primærfirma</small> : <small style={{ color: "#64748b" }}>Ekstra arbeidsprofil</small>}
              </span>
            </label>
          );
        })}
      </div>

      {error ? <p style={{ color: "#991b1b", fontWeight: 800, margin: "9px 0 0" }}>{error}</p> : null}
      {message ? <p style={{ color: "#087f88", fontWeight: 800, margin: "9px 0 0" }}>{message}</p> : null}
      <button type="button" onClick={save} disabled={!dirty || saving} style={{ marginTop: 10 }}>
        {saving ? "Lagrer arbeidsprofiler..." : dirty ? "Lagre arbeidsprofiler" : "Arbeidsprofiler lagret"}
      </button>
    </div>
  );
}

function cleanupDetachedRoots() {
  roots.forEach((entry, key) => {
    if (entry.mount?.isConnected) return;
    entry.root?.unmount?.();
    roots.delete(key);
  });
}

function renderControls() {
  cleanupDetachedRoots();
  if (!snapshot?.is_systemadmin) return;
  const panel = findUserPanel();
  if (!panel) return;

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
    entry.root.render(
      <WorkProfileControls
        user={user}
        companies={snapshot.companies || []}
        onReload={loadSnapshot}
      />
    );
  });
}

async function loadSnapshot() {
  if (loadPromise) return loadPromise;
  loadPromise = listManagedWorkProfiles()
    .then((data) => {
      snapshot = data;
      renderControls();
      return data;
    })
    .catch(() => {
      snapshot = null;
      return null;
    })
    .finally(() => {
      loadPromise = null;
    });
  return loadPromise;
}

export function installSystemAdminWorkProfileUx() {
  if (typeof window === "undefined" || window.__expoSystemAdminWorkProfileUxInstalled) return;
  window.__expoSystemAdminWorkProfileUxInstalled = true;

  let frame = 0;
  const scheduleRender = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      renderControls();
    });
  };

  const observer = new MutationObserver(scheduleRender);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const refreshSoon = () => window.setTimeout(() => loadSnapshot(), 450);
  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (!button) return;
    const text = compactText(button.textContent);
    if (text.includes("Brukere og tilganger") || text === "Oppdater brukerliste" || text === "Godkjenn bruker" || text === "Deaktiver bruker" || text === "Reaktiver bruker") {
      refreshSoon();
    }
  }, true);
  document.addEventListener("change", refreshSoon, true);
  window.addEventListener("focus", loadSnapshot);

  loadSnapshot();
}
