// Expo ProffDok – FASE 41B.2 / 41B.5C HJELP
// Brukerrettet hjelp for Prissøk, Butikktilbud-tilgang og sensitiv nto-tilgang.
// Ingen egen MutationObserver: vi reagerer på Hjelp-klikk og eksisterende render.

import {
  hasModuleAccess,
  readCachedModuleAccess,
  rpcWithStoredSession,
} from "../access/moduleAccessClient.js";

const PRICE_SEARCH_TITLE = "🔎 Prissøk";
const SALES_HELP_TITLE = "🧾 Befaring/Tilbud";
const STORE_HELP_TITLE = "🛍️ Butikktilbud";
const SYSTEMADMIN_HELP_TITLE = "⚙️ Systemadministrasjon";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function findHelpItem(title) {
  const label = Array.from(document.querySelectorAll("button b"))
    .find((node) => compactText(node.textContent) === title);
  return label?.closest(".item") || null;
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

function createPriceSearchHelpItem() {
  const item = document.createElement("div");
  item.className = "item";
  item.dataset.priceSearchHelp = "1";
  item.style.borderColor = "#e2e8f0";
  item.style.background = "#ffffff";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.setAttribute("aria-expanded", "false");
  button.style.width = "100%";
  button.style.justifyContent = "space-between";
  button.style.textAlign = "left";
  button.style.background = "transparent";
  button.style.color = "#0f172a";
  button.style.border = "none";
  button.style.padding = "0";
  button.style.boxShadow = "none";
  button.style.fontSize = "16px";

  const headerRow = document.createElement("span");
  headerRow.style.display = "flex";
  headerRow.style.alignItems = "center";
  headerRow.style.justifyContent = "space-between";
  headerRow.style.gap = "12px";
  headerRow.style.width = "100%";

  const title = document.createElement("b");
  title.textContent = PRICE_SEARCH_TITLE;
  const action = document.createElement("span");
  action.textContent = "Åpne";
  action.style.fontWeight = "900";
  action.style.color = "#007f89";
  headerRow.append(title, action);
  button.appendChild(headerRow);

  const content = document.createElement("div");
  content.style.display = "none";
  content.style.marginTop = "14px";

  const intro = document.createElement("p");
  intro.className = "note";
  intro.style.marginTop = "0";
  intro.textContent = "Prissøk brukes til å slå opp aktive ERP-varer og gjeldende kundepris uten å opprette et tilbud.";
  content.appendChild(intro);

  content.appendChild(createHelpList([
    "Søk på varenavn, leverandør, varenummer eller GTIN/EAN. Treffene kommer fra siste aktiverte ERP-prisliste.",
    "Prissøk oppretter eller endrer aldri tilbud, prosjekter eller vareregisteret.",
    "Prissøk og Butikktilbud er en intern handelsadgang som bare systemadministrator kan tildele. Tilgangen kan kun gis til brukere i Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter.",
    "Brukere uten denne tildelingen får verken Butikktilbud-meny, Prissøk-meny eller katalogdata fra serveren.",
    "Intern nto-pris, rabatt og margin krever i tillegg den separate rettigheten Se interne nettopriser, som også bare systemadministrator kan tildele.",
    "Samme nto-rettighet gjelder varesøket inne i Butikktilbud. Uten rettigheten sendes de sensitive prisfeltene ikke fra serveren.",
    "Oppdatering, import og aktivering av vareregisteret gjøres fortsatt bare i Systemadmin – Internt vareregister.",
  ]));

  button.addEventListener("click", () => {
    const open = content.style.display !== "none";
    content.style.display = open ? "none" : "block";
    action.textContent = open ? "Åpne" : "Lukk";
    button.setAttribute("aria-expanded", open ? "false" : "true");
    item.style.borderColor = open ? "#e2e8f0" : "#08b9c3";
    item.style.background = open ? "#ffffff" : "#f8feff";
  });

  item.append(button, content);
  return item;
}

function ensureSystemAdminHelp() {
  const systemItem = findHelpItem(SYSTEMADMIN_HELP_TITLE);
  if (!systemItem || systemItem.querySelector("[data-price-search-admin-help='1']")) return;

  const content = systemItem.querySelector("button + div") || systemItem;
  const block = document.createElement("div");
  block.dataset.priceSearchAdminHelp = "1";
  block.style.marginTop = "14px";
  block.style.paddingTop = "10px";
  block.style.borderTop = "1px solid #dbe5ea";

  const heading = document.createElement("h4");
  heading.textContent = "Brukere, Butikktilbud, Prissøk og nto-priser";
  heading.style.marginBottom = "6px";
  block.appendChild(heading);
  block.appendChild(createHelpList([
    "Systemadmin behandler brukerstatus, firma, rolle, hovedmoduler og eventuell nto-pristilgang på samme brukerkort under Brukere og tilganger.",
    "Butikktilbud er den eksplisitte tilgangen som også åpner Prissøk og det interne vareregisteret. Bare systemadministrator kan gi eller fjerne denne tilgangen.",
    "Butikktilbud/Prissøk kan bare gis til brukere i Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter. Firmaadministrator kan ikke delegere denne tilgangen videre.",
    "Se interne nettopriser er en ekstra sensitiv brukerrettighet. Kun systemadministrator kan gi eller fjerne den.",
    "Nto-rettigheten kan bare gis til brukere i de samme tre interne firmaene.",
    "Systemadministrator har alltid tilgang til interne nettopriser.",
  ]));
  content.appendChild(block);
}

function applyStoreHelpEligibility(canUsePriceSearch) {
  const item = findHelpItem(STORE_HELP_TITLE);
  if (!(item instanceof HTMLElement)) return;

  const access = readCachedModuleAccess();
  const allowed = Boolean(
    access?.loaded &&
      (access.isSystemAdmin || (canUsePriceSearch && hasModuleAccess(access, "store_offers")))
  );

  if (allowed) {
    if (item.dataset.approvedActiveHelpHidden === "1") {
      item.style.removeProperty("display");
      delete item.dataset.approvedActiveHelpHidden;
    }
    return;
  }

  item.dataset.approvedActiveHelpHidden = "1";
  item.style.display = "none";
}

function ensurePriceSearchHelp(canUsePriceSearch) {
  applyStoreHelpEligibility(canUsePriceSearch);

  const existing = document.querySelector("[data-price-search-help='1']");
  if (!canUsePriceSearch) {
    existing?.remove();
    ensureSystemAdminHelp();
    return;
  }

  if (!existing) {
    const anchor = findHelpItem(STORE_HELP_TITLE) || findHelpItem(SALES_HELP_TITLE);
    if (anchor) anchor.insertAdjacentElement("afterend", createPriceSearchHelpItem());
  }
  ensureSystemAdminHelp();
}

let canUsePriceSearch = false;
let accessLoaded = false;

async function refreshAccess() {
  try {
    canUsePriceSearch = Boolean(await rpcWithStoredSession("current_user_has_internal_store_price_search_access"));
  } catch {
    canUsePriceSearch = false;
  } finally {
    accessLoaded = true;
  }
  scheduleEnsure();
}

function scheduleEnsure() {
  const run = () => ensurePriceSearchHelp(accessLoaded && canUsePriceSearch);
  window.requestAnimationFrame(run);
  window.setTimeout(run, 80);
  window.setTimeout(run, 260);
}

export function installPriceSearchHelpUx() {
  if (typeof window === "undefined" || window.__expoPriceSearchHelpInstalled) return;
  window.__expoPriceSearchHelpInstalled = true;

  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (!button) return;
    const text = compactText(button.textContent);
    if (text === "Hjelp" || text === "? Hjelp" || text.includes("Hjelp")) scheduleEnsure();
  }, true);

  refreshAccess();
  scheduleEnsure();
}
