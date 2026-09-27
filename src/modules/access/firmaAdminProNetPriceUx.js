// Expo ProffDok – FASE 45B
// Firmaadmin administrerer «Din nto pris» i samme Brukere og tilganger-panel.
// Server-RPC er autoritativ: egen tilgang, annet firma og manglende proffmodul blokkeres backend.

import {
  getStoredSupabaseSession,
  rpcWithStoredSession,
} from "./moduleAccessClient.js";

const CONTROL_ATTR = "data-firmaadmin-pro-net-price";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function findUserCard(manager, email) {
  const cleanEmail = compactText(email).toLocaleLowerCase("nb-NO");
  if (!(manager instanceof HTMLElement) || !cleanEmail) return null;
  return Array.from(manager.querySelectorAll("article")).find((card) => {
    const strong = card.querySelector("strong");
    return compactText(strong?.textContent).toLocaleLowerCase("nb-NO") === cleanEmail;
  }) || null;
}

function lockStoreModuleForFirmaadmin(card, proCompany) {
  if (!(card instanceof HTMLElement)) return;
  Array.from(card.querySelectorAll("label")).forEach((label) => {
    const title = label.querySelector("b");
    const text = compactText(title?.textContent);
    if (text !== "Butikktilbud" && text !== "Enkel ordre / Proff vareregister") return;

    if (proCompany && title && text !== "Enkel ordre / Proff vareregister") {
      title.textContent = "Enkel ordre / Proff vareregister";
    }
    const checkbox = label.querySelector('input[type="checkbox"]');
    if (checkbox instanceof HTMLInputElement) checkbox.disabled = true;
    label.style.cursor = "default";
    label.title = "Tilgangen gis eller fjernes av Systemadministrator.";
    const note = label.querySelector("small");
    if (note && compactText(note.textContent) !== "Tilgangen styres av Systemadministrator.") {
      note.textContent = "Tilgangen styres av Systemadministrator.";
    }
  });
}

async function setCompanyUserNetPrice(user, canView) {
  if (!user?.company_scope_id || !user?.user_id) throw new Error("Bruker eller firma mangler.");
  return rpcWithStoredSession("set_store_catalog_user_net_price_access", {
    p_company_id: user.company_scope_id,
    p_user_id: user.user_id,
    p_can_view: canView === true,
  });
}

function renderNetPriceControl(card, user, currentUserId, reload) {
  if (!(card instanceof HTMLElement) || user?.company_has_pro_catalog !== true) return;
  const existing = card.querySelector(`[${CONTROL_ATTR}="1"]`);
  if (existing) {
    const input = existing.querySelector('input[type="checkbox"]');
    if (input instanceof HTMLInputElement && document.activeElement !== input) {
      input.checked = user.pro_net_price_can_view === true;
    }
    return;
  }

  const moduleKeys = Array.isArray(user.module_keys) ? user.module_keys : [];
  const eligible =
    user.approved === true &&
    user.deactivated !== true &&
    moduleKeys.includes("sales") &&
    moduleKeys.includes("store_offers");
  const isSelf = user.user_id === currentUserId;

  const block = document.createElement("div");
  block.setAttribute(CONTROL_ATTR, "1");
  block.style.marginTop = "12px";
  block.style.paddingTop = "12px";
  block.style.borderTop = "1px solid #dbe5ea";

  const label = document.createElement("label");
  label.style.display = "flex";
  label.style.gap = "9px";
  label.style.alignItems = "flex-start";
  label.style.padding = "9px 10px";
  label.style.border = "1px solid #b9dfe3";
  label.style.borderRadius = "10px";
  label.style.background = "#f5fcfd";
  label.style.cursor = !isSelf && eligible ? "pointer" : "default";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = user.pro_net_price_can_view === true;
  input.disabled = isSelf || !eligible;
  input.style.marginTop = "2px";

  const copy = document.createElement("span");
  const heading = document.createElement("b");
  heading.style.display = "block";
  heading.style.fontSize = "14px";
  heading.textContent = "Se «Din nto pris»";
  const note = document.createElement("small");
  note.style.color = "#477078";
  note.textContent = isSelf
    ? "Din egen pristilgang styres av Systemadministrator."
    : eligible
      ? "Firmaets rabattberegnede proffpris. Ringsides innkjøpspris vises aldri."
      : "Krever aktiv bruker med Befaring/Tilbud og Enkel ordre / Proff vareregister.";
  copy.append(heading, note);
  label.append(input, copy);
  block.appendChild(label);
  card.appendChild(block);

  input.addEventListener("change", async () => {
    const wanted = input.checked;
    input.disabled = true;
    note.textContent = "Lagrer…";
    try {
      await setCompanyUserNetPrice(user, wanted);
      note.textContent = "Pristilgang lagret.";
      await reload();
    } catch (error) {
      input.checked = !wanted;
      note.textContent = error?.message || "Kunne ikke lagre pristilgang.";
    } finally {
      input.disabled = isSelf || !eligible;
    }
  });
}

export function installFirmaAdminProNetPriceUx() {
  if (typeof window === "undefined" || window.__expoFirmaAdminProNetPriceInstalled) return;
  window.__expoFirmaAdminProNetPriceInstalled = true;

  let snapshot = null;
  let loading = null;
  let frame = 0;

  async function load() {
    if (loading) return loading;
    loading = rpcWithStoredSession("list_managed_module_access")
      .then((data) => {
        snapshot = data;
        return data;
      })
      .catch(() => {
        snapshot = null;
        return null;
      })
      .finally(() => { loading = null; });
    const result = await loading;
    schedule();
    return result;
  }

  function render() {
    if (snapshot?.is_systemadmin || !snapshot?.is_firmaadmin) return;
    const manager = document.getElementById("expo-module-access-manager");
    if (!(manager instanceof HTMLElement)) return;

    const currentUserId = getStoredSupabaseSession().userId;
    (snapshot.users || []).forEach((user) => {
      const card = findUserCard(manager, user.email);
      if (!card) return;
      lockStoreModuleForFirmaadmin(card, user.company_has_pro_catalog === true);
      renderNetPriceControl(card, user, currentUserId, load);
    });
  }

  function schedule() {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      render();
    });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("focus", load);
  window.addEventListener("expo:module-access-changed", load);
  load();
}
