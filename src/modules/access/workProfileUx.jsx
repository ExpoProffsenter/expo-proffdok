// Expo ProffDok – FASE 41B.3 / 41B.3D
// Viser arbeidsprofilvelger for godkjente flerfirma-brukere og en egen
// «Representerer»-velger for systemadministrator. Valg lagres server-side og
// etterfølges av kontrollert reload slik at RLS, Sales og prosjektflyt henter
// samme aktive firmascope. Supportmodus er fortsatt separat.

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Building2, ChevronDown } from "lucide-react";
import {
  WORK_PROFILE_EVENT,
  getMyWorkProfileState,
  readCachedWorkProfileState,
  setActiveWorkProfile,
} from "./workProfileClient.js";

const HOST_ID = "expo-work-profile-switcher";
const SUPPORT_LABEL = "SYSTEMADMIN SUPPORTMODUS";
let root = null;
let rootHost = null;
let loadPromise = null;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function supportModeActive() {
  return Array.from(document.querySelectorAll("strong")).some(
    (node) => compactText(node.textContent) === SUPPORT_LABEL
  );
}

function isPortalView() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("project")) return false;
  const mode = params.get("access") || params.get("role") || "kunde";
  return mode !== "admin";
}

function findHeaderHead() {
  if (supportModeActive() || isPortalView()) return null;
  return document.querySelector("#root header .head") || document.querySelector("header .head");
}

function applyActiveBranding(state = {}) {
  if (supportModeActive() || isPortalView()) return;
  const profile = state?.active_company_profile || null;
  if (!profile?.companyName) return;
  const heads = Array.from(document.querySelectorAll("#root header .head, header .head"));
  heads.forEach((head) => {
    const img = head.querySelector(":scope > div:first-child img") || head.querySelector("img");
    if (!(img instanceof HTMLImageElement)) return;
    const logo = String(profile.logoUrl || "/expo-logo.png").trim() || "/expo-logo.png";
    if (img.getAttribute("src") !== logo) img.setAttribute("src", logo);
    img.setAttribute("alt", profile.companyName);
  });
}

function WorkProfileSwitcher({ initialState }) {
  const [state, setState] = useState(initialState || readCachedWorkProfileState());
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (event) => setState(event?.detail || readCachedWorkProfileState());
    window.addEventListener(WORK_PROFILE_EVENT, handler);
    return () => window.removeEventListener(WORK_PROFILE_EVENT, handler);
  }, []);

  const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
  const activeId = String(state?.active_company_id || "");
  const isSystemAdmin = Boolean(state?.is_systemadmin);
  const selectorLabel = isSystemAdmin ? "Representerer" : "Arbeidsprofil";
  const active = useMemo(
    () => workspaces.find((workspace) => String(workspace.company_id) === activeId) || workspaces[0] || null,
    [activeId, workspaces]
  );

  if (!state?.can_switch || workspaces.length < 2) return null;

  async function choose(companyId) {
    const id = String(companyId || "");
    if (!id || switching) return;
    if (id === activeId && !state?.selection_required) {
      setOpen(false);
      return;
    }
    const target = workspaces.find((workspace) => String(workspace.company_id) === id);
    if (!target) return;

    if (!state?.selection_required) {
      const message = isSystemAdmin
        ? `Representere ${target.company_name}?\n\nNye tilbud og prosjekter opprettes på valgt firma. Appen lastes på nytt. Sørg for at eventuelle endringer er lagret.`
        : `Bytte arbeidsprofil til ${target.company_name}?\n\nAppen lastes på nytt. Sørg for at eventuelle endringer er lagret.`;
      const ok = window.confirm(message);
      if (!ok) return;
    }

    setSwitching(true);
    setError("");
    try {
      await setActiveWorkProfile(id);
      window.location.assign(window.location.pathname);
    } catch (switchError) {
      setError(
        switchError?.message ||
          (isSystemAdmin ? "Kunne ikke bytte representert firma." : "Kunne ikke bytte arbeidsprofil.")
      );
      setSwitching(false);
    }
  }

  return (
    <>
      {!state?.selection_required ? (
        <div className="workProfileControl">
          <button
            type="button"
            className="secondary workProfileButton"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-label={`${selectorLabel}: ${active?.company_name || "Velg firma"}`}
            disabled={switching}
          >
            <Building2 size={17} />
            <span>
              <small>{selectorLabel}</small>
              <b>{active?.company_name || "Velg firma"}</b>
            </span>
            <ChevronDown size={15} />
          </button>
          {open ? (
            <div className="workProfileMenu">
              {workspaces.map((workspace) => {
                const selected = String(workspace.company_id) === activeId;
                const meta = isSystemAdmin
                  ? selected
                    ? "Aktiv"
                    : workspace.is_primary
                      ? "Standardfirma"
                      : ""
                  : workspace.is_primary
                    ? "Primærfirma"
                    : selected
                      ? "Aktiv"
                      : "";
                return (
                  <button
                    key={workspace.company_id}
                    type="button"
                    className={selected ? "isActive" : ""}
                    onClick={() => choose(workspace.company_id)}
                    disabled={switching}
                  >
                    <span>{workspace.company_name}</span>
                    {meta ? <small>{meta}</small> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
          {error ? <small className="workProfileError">{error}</small> : null}
        </div>
      ) : null}

      {state?.selection_required ? (
        <div className="workProfileRequiredBackdrop" role="dialog" aria-modal="true" aria-label="Velg arbeidsprofil">
          <div className="workProfileRequiredCard">
            <Building2 size={30} />
            <h2>Velg arbeidsprofil</h2>
            <p>Du har tilgang til flere firma. Velg hvilket firma du skal arbeide som nå. Valget kan endres senere fra toppen av appen.</p>
            <div>
              {workspaces.map((workspace) => (
                <button
                  key={workspace.company_id}
                  type="button"
                  onClick={() => choose(workspace.company_id)}
                  disabled={switching}
                >
                  {workspace.company_name}
                  {workspace.is_primary ? " · primærfirma" : ""}
                </button>
              ))}
            </div>
            {switching ? <small>Bytter arbeidsprofil …</small> : null}
            {error ? <small className="workProfileError">{error}</small> : null}
          </div>
        </div>
      ) : null}

      <style>{`
        .workProfileControl{position:relative;margin-left:auto;min-width:220px}.workProfileButton{display:flex!important;align-items:center;gap:8px;min-height:46px!important;padding:7px 10px!important;text-align:left}.workProfileButton>span{display:grid;gap:0;min-width:0;flex:1}.workProfileButton small{font-size:10px;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.workProfileButton b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}.workProfileMenu{position:absolute;z-index:1200;right:0;top:calc(100% + 6px);display:grid;gap:5px;width:min(330px,90vw);padding:8px;border:1px solid #cfe1e6;border-radius:13px;background:#fff;box-shadow:0 18px 44px rgba(15,23,42,.16)}.workProfileMenu button{display:flex;justify-content:space-between;gap:10px;align-items:center;width:100%;padding:10px 12px;border:0;border-radius:9px;background:#fff;color:#10212b;text-align:left;box-shadow:none}.workProfileMenu button:hover,.workProfileMenu button.isActive{background:#e8f9fa}.workProfileMenu small{color:#087f88;font-weight:800}.workProfileError{display:block;margin-top:5px;color:#991b1b;font-weight:800}.workProfileRequiredBackdrop{position:fixed;z-index:5000;inset:0;display:grid;place-items:center;padding:18px;background:rgba(15,23,42,.58)}.workProfileRequiredCard{width:min(520px,100%);padding:24px;border-radius:20px;background:#fff;box-shadow:0 30px 80px rgba(15,23,42,.28);text-align:center}.workProfileRequiredCard>svg{color:#159aa3}.workProfileRequiredCard h2{margin:8px 0}.workProfileRequiredCard p{color:#60737b}.workProfileRequiredCard>div{display:grid;gap:9px;margin-top:18px}.workProfileRequiredCard button{width:100%;min-height:48px}
        @media(max-width:760px){.workProfileControl{width:100%;min-width:0;margin:8px 0 0}.workProfileButton{width:100%!important}.workProfileButton b{max-width:none}.workProfileMenu{left:0;right:auto;width:100%;box-sizing:border-box}}
      `}</style>
    </>
  );
}

function destroyRoot() {
  root?.unmount?.();
  root = null;
  rootHost = null;
}

function mountSwitcher(state = readCachedWorkProfileState()) {
  applyActiveBranding(state);
  const head = findHeaderHead();
  if (!head || !state?.can_switch || (state?.workspaces || []).length < 2) {
    destroyRoot();
    document.getElementById(HOST_ID)?.remove();
    return;
  }

  let host = document.getElementById(HOST_ID);
  if (host && host.parentElement !== head) {
    if (rootHost === host) destroyRoot();
    host.remove();
    host = null;
  }
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    head.appendChild(host);
  }
  if (root && rootHost !== host) destroyRoot();
  if (!root) {
    rootHost = host;
    root = createRoot(host);
  }
  root.render(<WorkProfileSwitcher initialState={state} />);
}

async function refreshState() {
  if (loadPromise) return loadPromise;
  loadPromise = getMyWorkProfileState()
    .then((state) => {
      mountSwitcher(state);
      return state;
    })
    .catch(() => null)
    .finally(() => {
      loadPromise = null;
    });
  return loadPromise;
}

export function installWorkProfileUx() {
  if (typeof window === "undefined" || window.__expoWorkProfileUxInstalled) return;
  window.__expoWorkProfileUxInstalled = true;

  let frame = 0;
  const scheduleSync = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      mountSwitcher(readCachedWorkProfileState());
    });
  };

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener(WORK_PROFILE_EVENT, scheduleSync);
  window.addEventListener("focus", refreshState);
  window.setTimeout(refreshState, 450);
  window.setTimeout(scheduleSync, 900);
}
