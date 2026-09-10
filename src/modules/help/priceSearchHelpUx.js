// Expo ProffDok – FASE 41B.2 HJELP
// Brukerrettet hjelp for Prissøk og sensitiv nto-tilgang.
// Ingen egen MutationObserver: vi reagerer på Hjelp-klikk og eksisterende render.

import { rpcWithStoredSession } from "../access/moduleAccessClient.js";

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
  item.style.background = "#fff";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  Object.assign(button.style, {
    width: "100%",
    justifyContent: "space-between",
    textAlign: "left",
    fontWeight: "900",
  });

  const title = document.createElement("b");
  title.textContent = PRICE_SEARCH_TITLE;
  const action = document.createElement("span");
  action.textContent = "Åpne";
  action.style.fontWeight = "900";
  action.style.color = "#007f89";
  button.append(title, action);

  const content = document.createElement("div");
  content.hidden = true;
  content.style.paddingTop = "12px";

  const intro = document.createElement("p");
  intro.className = "note";
  intro.textContent = "Prissøk brukes til å slå opp aktive ERP-varer og gjeldende kundepris uten å opprette et tilbud.";
  content.appendChild(intro);

  content.appendChild(createHelpList([
    "Søk på varenavn, leverandør, varenummer eller GTIN/EAN. Treffene kommer fra siste aktiverte ERP-prisliste.",
    "Prissøk oppretter eller endrer aldri tilbud, prosjekter eller vareregisteret.",
    "Kundepris vises for godkjente brukere med Prissøk-tilgang i Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter.",
    "Intern nto-pris, rabatt og margin vises bare når systemadministrator har gitt brukeren den separate rettigheten Se interne nettopriser.",
    "Samme nto-rettighet gjelder varesøket inne i Butikktilbud. Uten rettigheten sendes de sensitive prisfeltene ikke fra serveren.",
    "Oppdatering, import og aktivering av vareregisteret gjøres fortsatt bare i Systemadmin – Internt vareregister.",
  ]));

  button.addEventListener("click", () => {
    content.hidden = !content.hidden;
    action.textContent = content.hidden ? "Åpne" : "Lukk";
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
  heading.textContent = "Brukere, Prissøk og nto-priser";
  heading.style.marginBottom = "6px";
  block.appendChild(heading);
  block.appendChild(createHelpList([
    "Systemadmin behandler nå brukerstatus, firma, rolle, hovedmoduler og eventuell nto-pristilgang på samme brukerkort under Brukere og tilganger.",
    "Se interne nettopriser er en sensitiv brukerrettighet, ikke en hovedmodul. Kun systemadministrator kan gi eller fjerne den.",
    "Nto-rettigheten kan bare gis til brukere i Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter.",
    "Systemadministrator har alltid tilgang til interne nettopriser.",
  ]));
  content.appendChild(block);
}

function ensurePriceSearchHelp(canUsePriceSearch) {
  if (!canUsePriceSearch || document.querySelector("[data-price-search-help='1']")) {
    ensureSystemAdminHelp();
    return;
  }

  const anchor = findHelpItem(STORE_HELP_TITLE) || findHelpItem(SALES_HELP_TITLE);
  if (anchor) anchor.insertAdjacentElement("afterend", createPriceSearchHelpItem());
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
