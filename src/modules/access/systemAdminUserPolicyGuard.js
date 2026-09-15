// Expo ProffDok – FASE 42K
// Smalt UX-sikkerhetsnett for nye brukere i Systemadministrasjon.
// Backend/RLS er autoritativ. Denne filen speiler serverreglene i eksisterende
// brukerkort uten å endre main.jsx eller den etablerte godkjenningsflyten.
// Hjelp-innhold rendres fortsatt kun gjennom React-kjernen i helpToolsCore.js.

import { listManagedModuleAccess } from "./moduleAccessClient.js";

const USER_MOUNT_ATTR = "data-systemadmin-unified-access";
const ALLOWED_STORE_COMPANIES = new Set([
  "ringside rorleggerbedrift as",
  "bademiljo expo",
  "expo proffsenter",
]);

let snapshot = null;
let loadPromise = null;
let frame = 0;

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

function userById(userId = "") {
  return (snapshot?.users || []).find((user) => String(user?.user_id || "") === String(userId || "")) || null;
}

function findModuleLabel(mount, moduleName) {
  if (!(mount instanceof HTMLElement)) return null;
  return Array.from(mount.querySelectorAll("label")).find((label) =>
    Array.from(label.querySelectorAll("b")).some((node) => compactText(node.textContent) === moduleName)
  ) || null;
}

function applyStoreOfferCompanyPolicy() {
  if (!snapshot?.is_systemadmin) return;

  document.querySelectorAll(`[${USER_MOUNT_ATTR}]`).forEach((mount) => {
    if (!(mount instanceof HTMLElement)) return;
    const user = userById(mount.getAttribute(USER_MOUNT_ATTR));
    if (!user) return;

    const label = findModuleLabel(mount, "Butikktilbud");
    const checkbox = label?.querySelector('input[type="checkbox"]');
    const note = label?.querySelector("small");
    if (!(label instanceof HTMLElement) || !(checkbox instanceof HTMLInputElement)) return;

    const targetIsSystemAdmin = user.system_role === "systemadmin";
    const allowedCompany = ALLOWED_STORE_COMPANIES.has(normalizeCompany(user.company_name));
    const allowed = targetIsSystemAdmin || allowedCompany;

    if (!allowed) {
      checkbox.disabled = true;
      label.dataset.companyPolicyLocked = "1";
      label.style.opacity = "0.62";
      label.style.cursor = "not-allowed";
      label.title = "Butikktilbud kan bare gis til Ringside Rørleggerbedrift AS, Bademiljø Expo eller Expo Proffsenter.";
      if (note) note.textContent = "Kun Ringside, Bademiljø Expo og Expo Proffsenter";
      return;
    }

    if (label.dataset.companyPolicyLocked === "1") {
      delete label.dataset.companyPolicyLocked;
      label.style.removeProperty("opacity");
      label.style.removeProperty("cursor");
      label.removeAttribute("title");
      checkbox.disabled = targetIsSystemAdmin;
      if (note) note.textContent = "Krever Befaring / Våtromstilbud";
    }
  });
}

function scheduleApply() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    applyStoreOfferCompanyPolicy();
  });
}

async function loadSnapshot() {
  if (loadPromise) return loadPromise;
  loadPromise = listManagedModuleAccess()
    .then((data) => {
      snapshot = data;
      scheduleApply();
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

function pendingUserForApprovalButton(button) {
  const card = button?.closest?.(".item");
  const cardText = compactText(card?.textContent).toLocaleLowerCase("nb-NO");
  if (!cardText) return null;
  return (snapshot?.users || []).find((user) => {
    const email = compactText(user?.email).toLocaleLowerCase("nb-NO");
    return email && cardText.includes(email);
  }) || null;
}

function guardApprovalWithoutCompany(event) {
  if (!snapshot?.is_systemadmin) return;
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (!(button instanceof HTMLButtonElement) || compactText(button.textContent) !== "Godkjenn bruker") return;

  const user = pendingUserForApprovalButton(button);
  if (!user || compactText(user.company_name)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  alert("Velg Firma for brukeren før du godkjenner. Firma styrer datascope og må være satt før brukeren får tilgang til Expo ProffDok.");
}

export function installSystemAdminUserPolicyGuard() {
  if (typeof window === "undefined" || window.__expoSystemAdminUserPolicyGuardInstalled) return;
  window.__expoSystemAdminUserPolicyGuardInstalled = true;

  document.addEventListener("click", guardApprovalWithoutCompany, true);
  document.addEventListener("change", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest(".adminAccordionItem") || event.target.closest(".item")) {
      window.setTimeout(() => void loadSnapshot(), 450);
    }
  }, true);
  window.addEventListener("focus", () => void loadSnapshot());

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  void loadSnapshot();
}
