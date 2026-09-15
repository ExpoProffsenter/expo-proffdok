// Expo ProffDok – FASE 42G
// Klientsikkerhetsnett for systemadministrators prosjektflate.
//
// Systemadministrator har med vilje brede serverrettigheter for administrasjon/support,
// men den ordinære arbeidsflaten skal alltid være bundet til valgt representert firma.
// RLS/server er fortsatt den autoritative sikkerhetsgrensen; denne guarden hindrer at
// brede systemadmin-rettigheter ved et uhell projiseres inn i vanlig prosjektarbeid.

import {
  WORK_PROFILE_EVENT,
  WORK_PROFILE_GLOBAL,
  getMyWorkProfileState,
  readCachedWorkProfileState,
} from "./workProfileClient.js";

const PROJECTS_REST_PATH = "/rest/v1/projects";
const NO_COMPANY_SCOPE = "00000000-0000-0000-0000-000000000000";
const GUARDED_METHODS = new Set(["GET", "HEAD", "PATCH", "DELETE"]);

let statePromise = null;
let resolvedState = null;

function requestMethod(input, init = {}) {
  return String(init?.method || (input instanceof Request ? input.method : "GET") || "GET").toUpperCase();
}

function requestUrl(input) {
  try {
    const raw = input instanceof Request ? input.url : String(input || "");
    return new URL(raw, window.location.origin);
  } catch {
    return null;
  }
}

function isSupabaseProjectsRequest(url) {
  return Boolean(url && url.pathname.endsWith(PROJECTS_REST_PATH));
}

function readPublishedState() {
  if (!window[WORK_PROFILE_GLOBAL] || typeof window[WORK_PROFILE_GLOBAL] !== "object") return null;
  return readCachedWorkProfileState();
}

async function resolveWorkProfileState() {
  const published = readPublishedState();
  if (published) {
    resolvedState = published;
    return published;
  }
  if (resolvedState) return resolvedState;

  if (!statePromise) {
    statePromise = getMyWorkProfileState()
      .then((state) => {
        resolvedState = state || null;
        return resolvedState;
      })
      .catch(() => null)
      .finally(() => {
        statePromise = null;
      });
  }
  return statePromise;
}

function scopeProjectsUrl(url, state = {}) {
  const next = new URL(url.toString());
  const activeCompanyId = String(state?.active_company_id || "").trim();
  const companyScopeId = activeCompanyId || NO_COMPANY_SCOPE;

  // Overskriv eventuell firmaparameter. Systemadmin må bytte representert firma
  // eksplisitt i stedet for å kunne spørre prosjekt-REST mot et annet firma.
  next.searchParams.set("company_scope_id", `eq.${companyScopeId}`);
  return next;
}

function withUrl(input, nextUrl) {
  if (input instanceof Request) return new Request(nextUrl.toString(), input);
  return nextUrl.toString();
}

export function installSystemAdminProjectScopeGuard() {
  if (typeof window === "undefined" || window.__expoSystemAdminProjectScopeGuardInstalled) return;
  window.__expoSystemAdminProjectScopeGuardInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.addEventListener(WORK_PROFILE_EVENT, (event) => {
    resolvedState = event?.detail || readCachedWorkProfileState();
  });

  window.fetch = async (input, init = undefined) => {
    const method = requestMethod(input, init || {});
    const url = requestUrl(input);

    if (!GUARDED_METHODS.has(method) || !isSupabaseProjectsRequest(url)) {
      return nativeFetch(input, init);
    }

    const state = await resolveWorkProfileState();
    if (!state?.is_systemadmin) {
      return nativeFetch(input, init);
    }

    const scopedUrl = scopeProjectsUrl(url, state);
    return nativeFetch(withUrl(input, scopedUrl), init);
  };
}
