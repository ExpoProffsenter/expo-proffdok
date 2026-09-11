// Expo ProffDok – FASE 41B.5
// Monterer read-only bestillingsgrunnlag på akseptert Butikktilbud uten å endre
// Sales Core. Lokal Sales-cache brukes kun for å finne allerede hydrert, låst sak.

import React from "react";
import { createRoot } from "react-dom/client";
import StoreOfferOrderBasis from "./components/StoreOfferOrderBasis.jsx";
import { createDefaultSalesSupabaseClient } from "./services/salesSupabase.js";
import {
  buildSalesStorageKey,
  loadRequests,
  loadSalesNavigation,
} from "./services/salesLocalStorage.js";
import { isStoreOfferRequest } from "./services/salesStoreOffers.js";
import {
  getMyWorkProfileState,
  readCachedWorkProfileState,
} from "../access/workProfileClient.js";

const HOST_ID = "expo-store-order-basis-host";
const SUPPORT_LABEL = "SYSTEMADMIN SUPPORTMODUS";
let root = null;
let rootHost = null;
let timers = [];
let contextPromise = null;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function supportModeActive() {
  return Array.from(document.querySelectorAll("strong")).some(
    (node) => compactText(node.textContent) === SUPPORT_LABEL
  );
}

function isPublicSalesView() {
  const params = new URLSearchParams(window.location.search);
  return params.has("publicOffer") || params.has("publicContract");
}

function destroy() {
  root?.unmount?.();
  root = null;
  rootHost = null;
  document.getElementById(HOST_ID)?.remove();
}

async function resolveStorageKey() {
  const client = createDefaultSalesSupabaseClient();
  const sessionResult = await client.auth.getSession();
  const userId = String(sessionResult?.data?.session?.user?.id || "").trim();
  if (!userId) return "";

  let state = readCachedWorkProfileState();
  if (!state?.active_company_profile?.companyName) {
    state = await getMyWorkProfileState();
  }
  const companyName = String(
    state?.active_company_profile?.companyName ||
      state?.active_company_profile?.company_name ||
      ""
  ).trim();
  if (!companyName) return "";

  return buildSalesStorageKey({
    integrationMode: "app",
    companyName,
    userId,
  });
}

async function getSelectedAcceptedStoreOffer() {
  if (supportModeActive() || isPublicSalesView()) return null;

  const storageKey = await resolveStorageKey();
  if (!storageKey) return null;
  const navigation = loadSalesNavigation(storageKey);
  if (navigation?.mode !== "detail" || !navigation?.selectedRequestId) return null;

  const request = loadRequests(storageKey).find(
    (item) => String(item?.id || "") === String(navigation.selectedRequestId)
  );
  if (!request || request.status !== "Akseptert" || !isStoreOfferRequest(request)) {
    return null;
  }
  return request;
}

function findMountTarget() {
  const nextCard = document.querySelector(".sales-next-card");
  if (nextCard instanceof HTMLElement && nextCard.parentElement) return nextCard;
  const main = document.querySelector("#root main") || document.querySelector("main");
  return main instanceof HTMLElement ? main.lastElementChild || main : null;
}

async function syncOrderBasis() {
  if (contextPromise) return contextPromise;
  contextPromise = getSelectedAcceptedStoreOffer()
    .then((request) => {
      if (!request) {
        destroy();
        return;
      }

      const target = findMountTarget();
      if (!(target instanceof HTMLElement) || !target.parentElement) return;

      let host = document.getElementById(HOST_ID);
      if (host && host.previousElementSibling !== target) {
        destroy();
        host = null;
      }
      if (!host) {
        host = document.createElement("div");
        host.id = HOST_ID;
        target.insertAdjacentElement("afterend", host);
      }
      if (root && rootHost !== host) destroy();
      if (!root) {
        rootHost = host;
        root = createRoot(host);
      }
      root.render(<StoreOfferOrderBasis request={request} />);
    })
    .catch(() => destroy())
    .finally(() => {
      contextPromise = null;
    });
  return contextPromise;
}

function scheduleSync() {
  timers.forEach((timer) => window.clearTimeout(timer));
  timers = [0, 120, 400, 900].map((delay) =>
    window.setTimeout(() => void syncOrderBasis(), delay)
  );
}

export function installStoreOrderBasisUx() {
  if (typeof window === "undefined" || window.__expoStoreOrderBasisUxInstalled) return;
  window.__expoStoreOrderBasisUxInstalled = true;

  document.addEventListener("click", scheduleSync);
  window.addEventListener("focus", scheduleSync);
  window.addEventListener("popstate", scheduleSync);
  window.addEventListener("expo-proffdok-sales-rehydrate", scheduleSync);
  window.addEventListener("expo-proffdok-work-profile", scheduleSync);
  scheduleSync();
}
