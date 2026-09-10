// Expo ProffDok – FASE 41B.2
// Kobler read-only Prissøk inn i eksisterende desktop- og mobilnavigasjon uten å
// gjøre main.jsx større. Backend-RPC er autoritativ tilgangskontroll.

import React from "react";
import { createRoot } from "react-dom/client";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";
import StorePriceSearchView from "./StorePriceSearchView.jsx";

const NAV_BUTTON_ID = "expo-price-search-nav-button";
const OVERLAY_ID = "expo-price-search-overlay";
const MOBILE_OPTION_VALUE = "__expo_price_search__";
const SUPPORT_LABEL = "SYSTEMADMIN SUPPORTMODUS";
const ALLOWED_COMPANIES = new Set([
  "ringside rorleggerbedrift as",
  "bademiljo expo",
  "expo proffsenter",
]);

let backendAllowed = false;
let accessResolved = false;
let accessPromise = null;
let overlayRoot = null;
let previousBodyOverflow = "";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeCompanyName(value = "") {
  return compactText(value)
    .toLocaleLowerCase("nb-NO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o");
}

function supportCompanyName() {
  const label = Array.from(document.querySelectorAll("strong")).find(
    (node) => compactText(node.textContent) === SUPPORT_LABEL
  );
  if (!label) return "";
  const details = label.parentElement?.querySelector("small");
  return compactText(details?.textContent).match(/Firma:\s*(.*?)\s*·\s*Prosjekt:/i)?.[1] || "";
}

function uiAllowed() {
  if (!backendAllowed) return false;
  const supportCompany = supportCompanyName();
  if (!supportCompany) return true;
  return ALLOWED_COMPANIES.has(normalizeCompanyName(supportCompany));
}

function findInternalNav() {
  return Array.from(document.querySelectorAll("nav")).find((nav) => {
    const labels = Array.from(nav.querySelectorAll(":scope > button")).map((button) =>
      compactText(button.textContent)
    );
    return labels.includes("Befaring/Tilbud") && labels.includes("Hjelp");
  }) || null;
}

function activeNativeLabel() {
  const nav = findInternalNav();
  const active = nav
    ? Array.from(nav.querySelectorAll(":scope > button.on")).find(
        (button) => button.id !== NAV_BUTTON_ID
      )
    : null;
  return compactText(active?.textContent);
}

function closePriceSearch() {
  overlayRoot?.unmount?.();
  overlayRoot = null;
  document.getElementById(OVERLAY_ID)?.remove();
  document.body.style.overflow = previousBodyOverflow;
}

function openPriceSearch() {
  if (!uiAllowed()) return;
  if (document.getElementById(OVERLAY_ID)) return;

  previousBodyOverflow = document.body.style.overflow || "";
  document.body.style.overflow = "hidden";

  const mount = document.createElement("div");
  mount.id = OVERLAY_ID;
  document.body.appendChild(mount);
  overlayRoot = createRoot(mount);
  overlayRoot.render(<StorePriceSearchView onClose={closePriceSearch} />);
}

function syncNavButton() {
  const nav = findInternalNav();
  const existing = document.getElementById(NAV_BUTTON_ID);
  if (!nav || !uiAllowed()) {
    existing?.remove();
    return;
  }
  if (existing && existing.parentElement === nav) return;
  existing?.remove();

  const salesButton = Array.from(nav.querySelectorAll(":scope > button")).find(
    (button) => compactText(button.textContent) === "Befaring/Tilbud"
  );
  if (!(salesButton instanceof HTMLButtonElement)) return;

  const button = document.createElement("button");
  button.id = NAV_BUTTON_ID;
  button.type = "button";
  button.textContent = "Prissøk";
  button.addEventListener("click", openPriceSearch);
  salesButton.insertAdjacentElement("afterend", button);
}

function syncMobileOption() {
  const selects = Array.from(document.querySelectorAll('.mobileNavSelectWrap select[aria-label="Velg side"]'));
  selects.forEach((select) => {
    const existing = Array.from(select.options).find((option) => option.value === MOBILE_OPTION_VALUE);
    if (!uiAllowed()) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const option = document.createElement("option");
    option.value = MOBILE_OPTION_VALUE;
    option.textContent = "Prissøk";
    select.appendChild(option);
  });
}

function restoreMobileSelection(select) {
  const activeLabel = activeNativeLabel();
  const activeOption = Array.from(select.options).find(
    (option) => compactText(option.textContent) === activeLabel
  );
  if (activeOption) select.value = activeOption.value;
}

function syncUi() {
  syncNavButton();
  syncMobileOption();
}

async function refreshAccess() {
  if (accessPromise) return accessPromise;
  accessPromise = rpcWithStoredSession("current_user_has_internal_store_price_search_access")
    .then((allowed) => {
      backendAllowed = allowed === true;
      accessResolved = true;
      syncUi();
      return backendAllowed;
    })
    .catch(() => {
      backendAllowed = false;
      syncUi();
      return false;
    })
    .finally(() => {
      accessPromise = null;
    });
  return accessPromise;
}

export function installStorePriceSearchUx() {
  if (typeof window === "undefined" || window.__expoStorePriceSearchUxInstalled) return;
  window.__expoStorePriceSearchUxInstalled = true;

  let frame = 0;
  const scheduleSync = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      syncUi();
      if (!accessResolved && findInternalNav()) void refreshAccess();
    });
  };

  document.addEventListener(
    "change",
    (event) => {
      const select = event.target;
      if (!(select instanceof HTMLSelectElement) || select.value !== MOBILE_OPTION_VALUE) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openPriceSearch();
      window.requestAnimationFrame(() => restoreMobileSelection(select));
    },
    true
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.getElementById(OVERLAY_ID)) closePriceSearch();
  });

  window.addEventListener("focus", () => {
    void refreshAccess();
    scheduleSync();
  });
  window.addEventListener("expo-proffdok-module-access", scheduleSync);

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.setTimeout(() => void refreshAccess(), 300);
  window.setTimeout(scheduleSync, 700);
}
