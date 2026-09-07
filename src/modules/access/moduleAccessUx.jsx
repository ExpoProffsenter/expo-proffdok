// Expo ProffDok – FASE 38A1
// Isolert UX-lag for Brukere og tilganger. Server-RPC/RLS er autoritativ.
// UI-laget styrer meny/Hjelp og gir system-/firmaadministrator et samlet panel.

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  MODULE_ACCESS_EVENT,
  MODULE_CATALOG,
  getStoredSupabaseSession,
  hasModuleAccess,
  listManagedModuleAccess,
  normalizeModuleKeys,
  publishModuleAccess,
  readCachedModuleAccess,
  refreshMyModuleAccess,
  setManagedModuleAccess,
} from "./moduleAccessClient.js";

const PANEL_MOUNT_ID = "expo-module-access-manager";
const ACCESS_HELP_DATASET = "moduleAccessHelp";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function roleLabel(user = {}) {
  if (user.system_role === "systemadmin") return "Systemadministrator";
  if (user.company_role === "firmaadmin") return "Firmaadministrator";
  return "Ansatt";
}

function statusLabel(user = {}) {
  if (user.deactivated) return "Deaktivert";
  if (user.approved) return "Aktiv";
  return "Venter på godkjenning";
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

function UserAccessRow({
  user,
  callerModuleKeys,
  isSystemAdmin,
  currentUserId,
  onSaved,
}) {
  const effectiveInitial = user.system_role === "systemadmin"
    ? MODULE_CATALOG.map((module) => module.key)
    : normalizeModuleKeys(user.module_keys || []);
  const [draftKeys, setDraftKeys] = useState(effectiveInitial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftKeys(
      user.system_role === "systemadmin"
        ? MODULE_CATALOG.map((module) => module.key)
        : normalizeModuleKeys(user.module_keys || [])
    );
    setError("");
  }, [user.user_id, JSON.stringify(user.module_keys || []), user.system_role]);

  const isSelf = user.user_id === currentUserId;
  const targetIsSystemAdmin = user.system_role === "systemadmin";
  const firmAdminOwnRowLocked = !isSystemAdmin && isSelf;
  const dirty = !moduleKeysEqual(draftKeys, effectiveInitial);

  async function save() {
    if (!dirty || saving || targetIsSystemAdmin || firmAdminOwnRowLocked) return;
    setSaving(true);
    setError("");
    try {
      const result = await setManagedModuleAccess(user.user_id, draftKeys);
      const savedKeys = normalizeModuleKeys(result?.module_keys || draftKeys);
      setDraftKeys(savedKeys);
      await onSaved(user.user_id, savedKeys);
    } catch (saveError) {
      setError(saveError?.message || "Kunne ikke lagre modultilgang.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      style={{
        border: "1px solid #dbe5ea",
        borderRadius: 14,
        padding: 14,
        background: user.approved && !user.deactivated ? "#fff" : "#f8fafc",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <strong style={{ display: "block", overflowWrap: "anywhere" }}>
            {user.email || "Ukjent e-post"}
          </strong>
          <small style={{ display: "block", marginTop: 3, color: "#64748b" }}>
            {roleLabel(user)} · {statusLabel(user)}
            {isSystemAdmin && user.company_name ? ` · ${user.company_name}` : ""}
          </small>
        </div>
        {targetIsSystemAdmin ? (
          <small style={{ fontWeight: 800, color: "#087f88" }}>Har alltid alle moduler</small>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: 8,
          marginTop: 12,
        }}
      >
        {MODULE_CATALOG.map((module) => {
          const callerCanGrant = isSystemAdmin || callerModuleKeys.includes(module.key);
          const disabled = targetIsSystemAdmin || firmAdminOwnRowLocked || !callerCanGrant;
          return (
            <label
              key={module.key}
              style={{
                display: "flex",
                gap: 9,
                alignItems: "flex-start",
                padding: "9px 10px",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                background: disabled ? "#f8fafc" : "#fff",
                cursor: disabled ? "default" : "pointer",
              }}
              title={!callerCanGrant ? "Du kan ikke gi tilgang til en modul du selv ikke har." : ""}
            >
              <input
                type="checkbox"
                checked={draftKeys.includes(module.key)}
                disabled={disabled}
                onChange={(event) =>
                  setDraftKeys((keys) => toggleModule(keys, module.key, event.target.checked))
                }
                style={{ marginTop: 2 }}
              />
              <span>
                <b style={{ display: "block", fontSize: 14 }}>{module.label}</b>
                {module.key === "store_offers" ? (
                  <small style={{ color: "#64748b" }}>Krever Befaring / Våtromstilbud</small>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>

      {firmAdminOwnRowLocked ? (
        <p style={{ margin: "9px 0 0", fontSize: 12, color: "#64748b" }}>
          Din egen modultilgang styres av systemadministrator.
        </p>
      ) : null}
      {error ? (
        <p style={{ margin: "9px 0 0", fontSize: 13, color: "#991b1b", fontWeight: 700 }}>
          {error}
        </p>
      ) : null}
      {!targetIsSystemAdmin && !firmAdminOwnRowLocked ? (
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          style={{ marginTop: 11 }}
        >
          {saving ? "Lagrer tilgang..." : dirty ? "Lagre tilgang" : "Tilgang lagret"}
        </button>
      ) : null}
    </article>
  );
}

function ModuleAccessManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const currentUserId = getStoredSupabaseSession().userId;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await listManagedModuleAccess();
      setData(result);
    } catch (loadError) {
      setError(loadError?.message || "Kunne ikke hente modultilganger.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const users = useMemo(() => {
    const query = compactText(search).toLocaleLowerCase("nb-NO");
    const source = Array.isArray(data?.users) ? data.users : [];
    if (!query) return source;
    return source.filter((user) =>
      [user.email, user.company_name, roleLabel(user), statusLabel(user)]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("nb-NO")
        .includes(query)
    );
  }, [data?.users, search]);

  async function handleSaved(userId, moduleKeys) {
    setData((current) => ({
      ...current,
      users: (current?.users || []).map((user) =>
        user.user_id === userId ? { ...user, module_keys: moduleKeys } : user
      ),
    }));
    if (userId === currentUserId) await refreshMyModuleAccess();
  }

  const isSystemAdmin = Boolean(data?.is_systemadmin);
  const callerModuleKeys = normalizeModuleKeys(data?.caller_module_keys || []);
  const pendingCount = (data?.users || []).filter((user) => !user.approved && !user.deactivated).length;

  return (
    <div
      className="item"
      style={{
        marginTop: 14,
        border: "1px solid #9edce0",
        background: "#f8feff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>Brukere og tilganger</h3>
          <p className="note" style={{ margin: 0 }}>
            {isSystemAdmin
              ? "Systemadministrator bestemmer hvilke hovedmoduler hver bruker får. Velg tilgang før en ny bruker godkjennes."
              : "Firmaadministrator kan gi brukere i eget firma tilgang til de modulene firmaadministratoren selv har."}
          </p>
        </div>
        <button type="button" className="secondary" onClick={load} disabled={loading}>
          {loading ? "Henter..." : "Oppdater"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: 8,
          marginTop: 14,
        }}
      >
        {MODULE_CATALOG.map((module) => (
          <div key={module.key} style={{ padding: 10, borderRadius: 10, background: "#fff", border: "1px solid #dbe5ea" }}>
            <b style={{ display: "block", fontSize: 14 }}>{module.label}</b>
            <small style={{ color: "#64748b" }}>{module.description}</small>
          </div>
        ))}
      </div>

      {isSystemAdmin && pendingCount > 0 ? (
        <p style={{ margin: "12px 0 0", fontWeight: 800, color: "#8a4b08" }}>
          {pendingCount} bruker{pendingCount === 1 ? "" : "e"} venter på godkjenning. Sett minst én modultilgang før Godkjenn bruker.
        </p>
      ) : null}

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={isSystemAdmin ? "Søk bruker, firma eller rolle" : "Søk bruker"}
        style={{ width: "100%", marginTop: 14 }}
      />

      {error ? (
        <p style={{ color: "#991b1b", fontWeight: 800 }}>{error}</p>
      ) : null}
      {loading && !data ? <p className="note">Henter brukere og tilganger...</p> : null}

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {users.map((user) => (
          <UserAccessRow
            key={user.user_id}
            user={user}
            callerModuleKeys={callerModuleKeys}
            isSystemAdmin={isSystemAdmin}
            currentUserId={currentUserId}
            onSaved={handleSaved}
          />
        ))}
        {!loading && users.length === 0 ? (
          <p className="note">Ingen brukere matcher søket.</p>
        ) : null}
      </div>
    </div>
  );
}

function setAccessVisibility(element, visible, reason = "") {
  if (!(element instanceof HTMLElement)) return;
  if (visible) {
    if (element.dataset.moduleAccessHidden === "1") {
      element.style.removeProperty("display");
      delete element.dataset.moduleAccessHidden;
      delete element.dataset.moduleAccessReason;
    }
    return;
  }

  element.dataset.moduleAccessHidden = "1";
  element.dataset.moduleAccessReason = reason;
  element.style.display = "none";
}

function buttonModuleRequirement(button) {
  const text = compactText(button?.textContent);
  if (!text) return "";
  if (text === "Befaring/Tilbud" || text === "Ny forespørsel" || text === "+ Ny forespørsel") return "sales";
  if (text === "+ Nytt butikktilbud" || text === "Butikktilbud") return "store_offers";
  if (
    text === "+ Nytt prosjekt" ||
    text === "Nytt prosjekt" ||
    text === "Prosjektoversikt"
  ) return "projects";
  return "";
}

function applyNavigationAccess(access) {
  if (!access?.loaded) return;
  document.querySelectorAll("button").forEach((button) => {
    const required = buttonModuleRequirement(button);
    if (!required) return;
    setAccessVisibility(button, hasModuleAccess(access, required), required);
  });
}

const PROJECT_HELP_NAMES = new Set([
  "Mobilbruk",
  "Dokumentasjonskrav og kvalitet",
  "Prosjektinformasjon/beskrivelse",
  "Garanti",
  "Prosjektering",
  "Produkter",
  "Overflater og innredning",
  "Bilder",
  "Tilgang",
  "Fag/utstyr",
  "Sjekklister",
  "Avvik",
  "Avtalegrunnlag",
  "Chat",
  "Interne notater",
  "Overtagelse",
  "Prosjektliste",
  "Rapport",
]);

function helpTitleName(text = "") {
  return compactText(text).replace(/^[^A-Za-zÆØÅæøå0-9]+/u, "");
}

function createHelpList(items = []) {
  const list = document.createElement("ul");
  list.style.marginTop = "8px";
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });
  return list;
}

function ensureModuleAccessHelp(access) {
  if (!access?.loaded || (!access.isSystemAdmin && !access.isFirmaAdmin)) return;
  if (document.querySelector(`[data-${ACCESS_HELP_DATASET.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}='1']`)) return;

  const helpLabels = Array.from(document.querySelectorAll("button b"));
  const helpLabel = helpLabels.find((label) => helpTitleName(label.textContent) === "Hjelp");
  const helpItem = helpLabel?.closest(".item");
  if (!helpItem) return;

  const item = document.createElement("div");
  item.className = "item";
  item.dataset[ACCESS_HELP_DATASET] = "1";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  Object.assign(button.style, {
    width: "100%",
    justifyContent: "space-between",
    textAlign: "left",
    background: "transparent",
    color: "#0f172a",
    border: "none",
    padding: "0",
    boxShadow: "none",
    fontSize: "16px",
  });
  const title = document.createElement("b");
  title.textContent = "🔐 Brukere og tilganger";
  const action = document.createElement("span");
  action.textContent = "Åpne";
  button.append(title, action);

  const content = document.createElement("div");
  content.style.display = "none";
  content.style.marginTop = "14px";
  const intro = document.createElement("p");
  intro.textContent = access.isSystemAdmin
    ? "Systemadministrator bestemmer hvilke hovedmoduler brukerne får tilgang til."
    : "Firmaadministrator kan delegere egne modultilganger til brukere i samme firma.";
  content.appendChild(intro);
  content.appendChild(createHelpList([
    "Prosjekter og dokumentasjon, Befaring / Våtromstilbud og Butikktilbud styres som egne hovedtilganger.",
    "Butikktilbud krever samtidig tilgang til Befaring / Våtromstilbud.",
    "Firmaadministrator kan aldri gi en bruker en modul firmaadministratoren selv ikke har.",
    "Systemadministrator kan administrere modultilgang på tvers av firma. Firmaadministrator kan bare administrere eget firma.",
    "Meny, arbeidsflater og Hjelp følger brukerens tildelte moduler. Datatilgangen kontrolleres i tillegg av server/RLS.",
    "Ved godkjenning av en ny bruker skal systemadministrator velge minst én relevant modultilgang før Godkjenn bruker brukes.",
  ]));

  button.addEventListener("click", () => {
    const open = content.style.display !== "none";
    content.style.display = open ? "none" : "block";
    action.textContent = open ? "Åpne" : "Lukk";
  });
  item.append(button, content);
  helpItem.insertAdjacentElement("beforebegin", item);
}

function applyHelpAccess(access) {
  if (!access?.loaded) return;
  const labels = Array.from(document.querySelectorAll("button b"));
  labels.forEach((label) => {
    const item = label.closest(".item");
    if (!item) return;
    const raw = compactText(label.textContent);
    const name = helpTitleName(raw);

    if (raw === "🧾 Befaring/Tilbud") {
      setAccessVisibility(item, hasModuleAccess(access, "sales"), "sales-help");
      return;
    }
    if (raw === "🛍️ Butikktilbud") {
      setAccessVisibility(item, hasModuleAccess(access, "store_offers"), "store-help");
      return;
    }
    if (PROJECT_HELP_NAMES.has(name)) {
      setAccessVisibility(item, hasModuleAccess(access, "projects"), "projects-help");
    }
  });

  document.querySelectorAll("li").forEach((item) => {
    const text = compactText(item.textContent);
    if (text === "Tilgang til Butikktilbud skal senere følge brukerens tildelte modulrettigheter når den generelle tilgangsmodellen er innført.") {
      item.textContent = "Tilgang til Butikktilbud følger brukerens tildelte modultilgang. Firmaadministrator kan bare delegere Butikktilbud når firmaadministratoren selv har denne tilgangen.";
    }
  });

  document.querySelectorAll("span").forEach((item) => {
    if (compactText(item.textContent).startsWith("Sist oppdatert:")) {
      item.textContent = "Sist oppdatert: 08.09.2026";
    }
  });

  ensureModuleAccessHelp(access);
}

let managerRoot = null;
let managerMount = null;

function findManagerTarget(access) {
  if (!access?.loaded || (!access.isSystemAdmin && !access.isFirmaAdmin)) return null;
  const headings = Array.from(document.querySelectorAll("h2,h3"));

  if (access.isSystemAdmin) {
    const heading = headings.find((node) => compactText(node.textContent) === "Systemadmin");
    const section = heading?.closest("section") || heading?.parentElement;
    return section ? { mode: "append", host: section } : null;
  }

  const heading = headings.find((node) => compactText(node.textContent) === "Firmaadministrasjon");
  const quickStart = heading?.closest(".item") || heading?.parentElement;
  return quickStart?.parentElement ? { mode: "after", host: quickStart } : null;
}

function unmountManagerIfDetached() {
  if (managerMount?.isConnected) return;
  if (managerRoot) managerRoot.unmount();
  managerRoot = null;
  managerMount = null;
}

function ensureManager(access) {
  unmountManagerIfDetached();
  if (managerMount?.isConnected) return;

  const target = findManagerTarget(access);
  if (!target?.host) return;

  const mount = document.createElement("div");
  mount.id = PANEL_MOUNT_ID;
  if (target.mode === "after") target.host.insertAdjacentElement("afterend", mount);
  else target.host.appendChild(mount);

  managerMount = mount;
  managerRoot = createRoot(mount);
  managerRoot.render(<ModuleAccessManager />);
}

let lastManagedSnapshot = null;

async function refreshManagedSnapshotForApprovalGuard(access) {
  if (!access?.isSystemAdmin) {
    lastManagedSnapshot = null;
    return;
  }
  try {
    lastManagedSnapshot = await listManagedModuleAccess();
  } catch {
    // Guard er UX. Selve modultilgangen håndheves på server.
  }
}

function guardPendingApproval(event, access) {
  if (!access?.isSystemAdmin) return;
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (!button || compactText(button.textContent) !== "Godkjenn bruker") return;

  const card = button.closest(".item");
  const cardText = compactText(card?.textContent).toLocaleLowerCase("nb-NO");
  if (!cardText) return;

  const pendingUser = (lastManagedSnapshot?.users || []).find((user) => {
    const email = String(user?.email || "").trim().toLocaleLowerCase("nb-NO");
    return email && cardText.includes(email);
  });
  if (!pendingUser) return;

  if (normalizeModuleKeys(pendingUser.module_keys || []).length > 0) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  alert("Velg minst én modultilgang for brukeren under Brukere og tilganger før du godkjenner brukeren.");
}

function applyAccessUi(access) {
  applyNavigationAccess(access);
  applyHelpAccess(access);
  ensureManager(access);
}

export function installModuleAccessUx() {
  if (typeof window === "undefined" || window.__expoModuleAccessUxInstalled) return;
  window.__expoModuleAccessUxInstalled = true;

  let access = readCachedModuleAccess();
  let disposed = false;
  let retryCount = 0;
  let retryTimer = null;

  const render = () => {
    if (disposed) return;
    access = readCachedModuleAccess();
    applyAccessUi(access);
  };

  const load = async () => {
    if (disposed) return;
    const session = getStoredSupabaseSession();
    if (!session.accessToken) {
      retryCount += 1;
      if (retryCount < 40) retryTimer = window.setTimeout(load, 500);
      return;
    }

    access = await refreshMyModuleAccess();
    applyAccessUi(access);
    await refreshManagedSnapshotForApprovalGuard(access);
  };

  const observer = new MutationObserver(() => {
    render();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const onAccessChanged = async (event) => {
    access = event?.detail || readCachedModuleAccess();
    applyAccessUi(access);
    await refreshManagedSnapshotForApprovalGuard(access);
  };
  window.addEventListener(MODULE_ACCESS_EVENT, onAccessChanged);

  const approvalGuard = (event) => guardPendingApproval(event, access);
  document.addEventListener("click", approvalGuard, true);

  // Systemadmin-panelet kan lagre rettigheter uten å endre egen tilgang. Hold guard-data fersk.
  window.addEventListener("focus", () => refreshManagedSnapshotForApprovalGuard(access));

  publishModuleAccess(access);
  load();
}
