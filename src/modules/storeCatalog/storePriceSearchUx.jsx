// Expo ProffDok – FASE 41B.2 / FASE 41B.3
// Kobler read-only Prissøk inn i eksisterende desktop- og mobilnavigasjon.
// FASE 41B.3 viser Prissøk i samme app-arbeidsflate i stedet for fullskjerm-overlay.
// Backend-RPC er fortsatt autoritativ tilgangskontroll.

import React from "react";
import { createRoot } from "react-dom/client";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";
import StorePriceSearchView from "./StorePriceSearchView.jsx";

const NAV_BUTTON_ID = "expo-price-search-nav-button";
const INLINE_ID = "expo-price-search-inline";
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
let inlineRoot = null;
let priceSearchOpen = false;

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

function findAppMain() {
  return document.querySelector("#root main") || document.querySelector("main");
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

function syncActiveNavigation() {
  const nav = findInternalNav();
  const priceButton = document.getElementById(NAV_BUTTON_ID);
  if (!nav || !priceButton) return;

  priceButton.classList.toggle("on", priceSearchOpen);
  if (priceSearchOpen) {
    Array.from(nav.querySelectorAll(":scope > button.on")).forEach((button) => {
      if (button.id !== NAV_BUTTON_ID) button.classList.remove("on");
    });
  }

  const selects = Array.from(document.querySelectorAll('.mobileNavSelectWrap select[aria-label="Velg side"]'));
  selects.forEach((select) => {
    if (priceSearchOpen && Array.from(select.options).some((option) => option.value === MOBILE_OPTION_VALUE)) {
      select.value = MOBILE_OPTION_VALUE;
    }
  });
}

function closePriceSearch() {
  priceSearchOpen = false;
  inlineRoot?.unmount?.();
  inlineRoot = null;
  document.getElementById(INLINE_ID)?.remove();
  findAppMain()?.classList.remove("expoPriceSearchActive");
  syncActiveNavigation();
}

function openPriceSearch() {
  if (!uiAllowed()) return;
  const main = findAppMain();
  if (!(main instanceof HTMLElement)) return;

  if (priceSearchOpen && document.getElementById(INLINE_ID)) {
    syncActiveNavigation();
    document.getElementById("expo-price-search-input")?.focus?.();
    return;
  }

  closePriceSearch();
  priceSearchOpen = true;

  const mount = document.createElement("div");
  mount.id = INLINE_ID;
  main.appendChild(mount);
  main.classList.add("expoPriceSearchActive");
  inlineRoot = createRoot(mount);
  inlineRoot.render(<StorePriceSearchView />);
  syncActiveNavigation();
  window.requestAnimationFrame(() => {
    main.scrollIntoView({ block: "start" });
    document.getElementById("expo-price-search-input")?.focus?.();
  });
}

function syncNavButton() {
  const nav = findInternalNav();
  const existing = document.getElementById(NAV_BUTTON_ID);
  if (!nav || !uiAllowed()) {
    if (priceSearchOpen) closePriceSearch();
    existing?.remove();
    return;
  }
  if (existing && existing.parentElement === nav) {
    syncActiveNavigation();
    return;
  }
  existing?.remove();

  const salesButton = Array.from(nav.querySelectorAll(":scope > button")).find(
    (button) => compactText(button.textContent) === "Befaring/Tilbud"
  );
  if (!(salesButton instanceof HTMLButtonElement)) return;

  const button = document.createElement("button");
  button.id = NAV_BUTTON_ID;
  button.type = "button";
  button.textContent = "Prissøk";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openPriceSearch();
  });
  salesButton.insertAdjacentElement("afterend", button);
  syncActiveNavigation();
}

function syncMobileOption() {
  const selects = Array.from(document.querySelectorAll('.mobileNavSelectWrap select[aria-label="Velg side"]'));
  selects.forEach((select) => {
    const existing = Array.from(select.options).find((option) => option.value === MOBILE_OPTION_VALUE);
    if (!uiAllowed()) {
      existing?.remove();
      return;
    }
    if (!existing) {
      const option = document.createElement("option");
      option.value = MOBILE_OPTION_VALUE;
      option.textContent = "Prissøk";
      select.appendChild(option);
    }
    if (priceSearchOpen) select.value = MOBILE_OPTION_VALUE;
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
  if (priceSearchOpen && !document.getElementById(INLINE_ID)) {
    priceSearchOpen = false;
  }
  syncActiveNavigation();
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
      if (priceSearchOpen) closePriceSearch();
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
      if (!(select instanceof HTMLSelectElement)) return;
      if (select.value === MOBILE_OPTION_VALUE) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openPriceSearch();
        return;
      }
      if (priceSearchOpen && select.closest(".mobileNavSelectWrap")) {
        closePriceSearch();
        window.requestAnimationFrame(() => restoreMobileSelection(select));
      }
    },
    true
  );

  document.addEventListener("click", (event) => {
    if (!priceSearchOpen) return;
    const button = event.target instanceof Element ? event.target.closest("nav > button") : null;
    if (!(button instanceof HTMLButtonElement) || button.id === NAV_BUTTON_ID) return;
    closePriceSearch();
  }, true);

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
