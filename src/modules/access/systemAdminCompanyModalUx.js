// Expo ProffDok – FASE 45B
// Presenterer den samlede Systemadmin-firmaflaten som en modal uten å duplisere
// eksisterende brukerhandlinger. Legacy-kort og 45B-tilgangskontroller beholder eierskap
// til lagring/sikkerhet; denne adapteren håndterer kun fokus, modalramme og kontrollert lukking.

const MODAL_BACKDROP_ID = "expo-systemadmin-company-modal-backdrop";
const MODAL_HEADER_ID = "expo-systemadmin-company-modal-header";
const MODAL_FOOTER_ID = "expo-systemadmin-company-modal-footer";
const MODAL_STYLE_ID = "expo-systemadmin-company-modal-style";
const PANEL_TITLE = "Firmaer, brukere og tilganger";

let previousBodyOverflow = "";
let saveInProgress = false;
let frame = 0;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function findCompanyPanel() {
  const heading = Array.from(document.querySelectorAll("h3")).find((node) =>
    compactText(node.textContent) === PANEL_TITLE
  );
  return heading?.closest(".item") || null;
}

function findActiveCompanyRow(panel) {
  return panel?.querySelector(".company-access-row.is-open") || null;
}

function activeCompanyName(row) {
  return compactText(row?.querySelector(".company-access-name")?.textContent) || "Firma";
}

function activeCompanySummary(row) {
  return compactText(row?.querySelector(".company-access-summary")?.textContent);
}

function visibleElement(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hidden || element.style.display === "none") return false;
  return element.getClientRects().length > 0;
}

function buttonBelongsToVisibleUserCard(button) {
  const card = button?.closest?.("[data-company-admin-user-card]");
  if (!(card instanceof HTMLElement)) return false;
  return card.style.display !== "none" && !card.hidden;
}

function dirtyAccessButtons(panel) {
  return Array.from(panel?.querySelectorAll("button") || []).filter((button) =>
    buttonBelongsToVisibleUserCard(button) &&
    !button.disabled &&
    compactText(button.textContent) === "Lagre tilganger"
  );
}

function accessSaveBusy(panel) {
  return Array.from(panel?.querySelectorAll("button") || []).some((button) =>
    buttonBelongsToVisibleUserCard(button) &&
    compactText(button.textContent) === "Lagrer tilganger..."
  );
}

function visibleSaveError(panel) {
  return Array.from(panel?.querySelectorAll("p,small") || []).some((node) => {
    if (!(node instanceof HTMLElement) || !visibleElement(node)) return false;
    const text = compactText(node.textContent).toLocaleLowerCase("nb-NO");
    return text.startsWith("kunne ikke lagre") || text.startsWith("kunne ikke endre") || text.startsWith("kunne ikke hente");
  });
}

function ensureStyles() {
  if (document.getElementById(MODAL_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = MODAL_STYLE_ID;
  style.textContent = `
    #${MODAL_BACKDROP_ID}{position:fixed;inset:0;z-index:100000;background:rgba(8,25,31,.58);backdrop-filter:blur(2px)}
    [data-company-admin-modal-open="1"]{position:fixed!important;z-index:100001!important;inset:24px!important;max-width:1180px!important;width:auto!important;height:auto!important;max-height:calc(100vh - 48px)!important;margin:auto!important;padding:0 22px 22px!important;overflow:auto!important;box-sizing:border-box!important;background:#fff!important;border:1px solid #b8d9dd!important;border-radius:18px!important;box-shadow:0 30px 90px rgba(5,25,32,.32)!important}
    [data-company-admin-modal-open="1"]>h3,[data-company-admin-modal-open="1"]>p.note{display:none!important}
    [data-company-admin-modal-open="1"] .company-access-navigator{border:0!important;margin:0!important;padding:0!important;background:transparent!important}
    [data-company-admin-modal-open="1"] .company-access-intro,[data-company-admin-modal-open="1"] .company-access-filters,[data-company-admin-modal-open="1"] .company-access-search,[data-company-admin-modal-open="1"] .company-access-meta{display:none!important}
    [data-company-admin-modal-open="1"] .company-access-list{gap:0!important}
    [data-company-admin-modal-open="1"] .company-access-row:not(.is-open){display:none!important}
    [data-company-admin-modal-open="1"] .company-access-row.is-open{border:0!important;box-shadow:none!important;border-radius:0!important;overflow:visible!important}
    [data-company-admin-modal-open="1"] .company-access-row.is-open>.company-access-toggle{display:none!important}
    [data-company-admin-modal-open="1"] .company-access-body{padding:4px 0 16px!important;border-top:0!important}
    [data-company-admin-modal-open="1"] #expo-systemadmin-company-user-stage{margin-top:4px!important}
    [data-company-admin-modal-open="1"] [data-systemadmin-unified-access]>div>button{display:none!important}
    #${MODAL_HEADER_ID}{position:sticky;top:0;z-index:4;margin:0 -22px 16px;padding:18px 22px 15px;background:rgba(255,255,255,.97);border-bottom:1px solid #d9e7ea;backdrop-filter:blur(8px)}
    #${MODAL_HEADER_ID} .company-modal-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:start}
    #${MODAL_HEADER_ID} h2{margin:0;font-size:24px;line-height:1.15;color:#10212b}
    #${MODAL_HEADER_ID} p{margin:5px 0 0;color:#60737b;font-size:13px}
    #${MODAL_HEADER_ID} .company-modal-context{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    #${MODAL_HEADER_ID} .company-modal-pill{display:inline-flex;align-items:center;min-height:26px;padding:0 9px;border-radius:999px;background:#eefafa;color:#17656b;font-size:12px;font-weight:800}
    #${MODAL_HEADER_ID} .company-modal-close{width:40px!important;height:40px!important;min-height:40px!important;padding:0!important;border-radius:999px!important;background:#f5f8f9!important;border:1px solid #d7e2e5!important;color:#10212b!important;font-size:24px!important;line-height:1!important}
    #${MODAL_FOOTER_ID}{position:sticky;bottom:-22px;z-index:4;margin:18px -22px -22px;padding:14px 22px 18px;background:rgba(255,255,255,.98);border-top:1px solid #d9e7ea;backdrop-filter:blur(8px)}
    #${MODAL_FOOTER_ID} .company-modal-footer-inner{display:flex;justify-content:space-between;gap:16px;align-items:center}
    #${MODAL_FOOTER_ID} small{max-width:700px;color:#60737b;line-height:1.35}
    #${MODAL_FOOTER_ID} .company-modal-save{width:auto!important;min-width:170px!important;margin:0!important;white-space:nowrap}
    @media(max-width:700px){
      [data-company-admin-modal-open="1"]{inset:0!important;max-height:100vh!important;border:0!important;border-radius:0!important;padding:0 14px 18px!important}
      #${MODAL_HEADER_ID}{margin:0 -14px 12px;padding:14px}
      #${MODAL_HEADER_ID} h2{font-size:20px}
      #${MODAL_FOOTER_ID}{bottom:-18px;margin:14px -14px -18px;padding:12px 14px 16px}
      #${MODAL_FOOTER_ID} .company-modal-footer-inner{align-items:stretch;flex-direction:column}
      #${MODAL_FOOTER_ID} .company-modal-save{width:100%!important}
    }
  `;
  document.head.appendChild(style);
}

function ensureBackdrop() {
  let backdrop = document.getElementById(MODAL_BACKDROP_ID);
  if (backdrop) return backdrop;
  backdrop = document.createElement("div");
  backdrop.id = MODAL_BACKDROP_ID;
  backdrop.setAttribute("aria-hidden", "true");
  document.body.appendChild(backdrop);
  return backdrop;
}

function ensureHeader(panel) {
  let header = panel.querySelector(`#${MODAL_HEADER_ID}`);
  if (header) return header;
  header = document.createElement("div");
  header.id = MODAL_HEADER_ID;
  header.innerHTML = `
    <div class="company-modal-head">
      <div>
        <h2 data-company-modal-title>Firma</h2>
        <p>Administrer brukere, roller, moduler, prisinnsyn og leverandører for dette firmaet.</p>
        <div class="company-modal-context">
          <span class="company-modal-pill" data-company-modal-summary></span>
          <span class="company-modal-pill">Systemadministrasjon</span>
        </div>
      </div>
      <button type="button" class="company-modal-close" data-company-modal-close aria-label="Lukk firma">×</button>
    </div>
  `;
  panel.prepend(header);
  header.querySelector("[data-company-modal-close]")?.addEventListener("click", () => requestClose(panel));
  return header;
}

function ensureFooter(panel) {
  let footer = panel.querySelector(`#${MODAL_FOOTER_ID}`);
  if (footer) return footer;
  footer = document.createElement("div");
  footer.id = MODAL_FOOTER_ID;
  footer.innerHTML = `
    <div class="company-modal-footer-inner">
      <small>Status, firma og rolle lagres med en gang etter bekreftelse. Endringer i moduler og prisinnsyn lagres når du velger «Lagre og lukk».</small>
      <button type="button" class="company-modal-save" data-company-modal-save>Lagre og lukk</button>
    </div>
  `;
  panel.appendChild(footer);
  footer.querySelector("[data-company-modal-save]")?.addEventListener("click", () => saveAndClose(panel));
  return footer;
}

function updateChrome(panel, row) {
  const header = ensureHeader(panel);
  ensureFooter(panel);
  const title = header.querySelector("[data-company-modal-title]");
  const summary = header.querySelector("[data-company-modal-summary]");
  if (title) title.textContent = activeCompanyName(row);
  if (summary) summary.textContent = activeCompanySummary(row) || "Firmaadministrasjon";
}

function openModal(panel, row) {
  ensureStyles();
  ensureBackdrop();
  updateChrome(panel, row);
  if (panel.dataset.companyAdminModalOpen !== "1") {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  panel.dataset.companyAdminModalOpen = "1";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", `Administrer ${activeCompanyName(row)}`);
}

function cleanupModal(panel) {
  document.getElementById(MODAL_BACKDROP_ID)?.remove();
  panel?.removeAttribute("data-company-admin-modal-open");
  panel?.removeAttribute("role");
  panel?.removeAttribute("aria-modal");
  panel?.removeAttribute("aria-label");
  panel?.querySelector(`#${MODAL_HEADER_ID}`)?.remove();
  panel?.querySelector(`#${MODAL_FOOTER_ID}`)?.remove();
  document.body.style.overflow = previousBodyOverflow;
  saveInProgress = false;
}

function hasUnsavedAccess(panel) {
  return dirtyAccessButtons(panel).length > 0 || accessSaveBusy(panel);
}

function clickActiveCompanyToggle(panel) {
  const row = findActiveCompanyRow(panel);
  const toggle = row?.querySelector(".company-access-toggle");
  if (toggle instanceof HTMLButtonElement) toggle.click();
}

function requestClose(panel) {
  if (saveInProgress) return;
  if (hasUnsavedAccess(panel)) {
    window.alert("Du har ulagrede endringer i brukerens tilganger. Velg «Lagre og lukk» før du lukker firmaet.");
    return;
  }
  clickActiveCompanyToggle(panel);
  window.setTimeout(() => cleanupModal(panel), 0);
}

function waitForAccessSaves(panel, timeoutMs = 7000) {
  const started = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      if (visibleSaveError(panel)) return resolve({ ok: false, reason: "error" });
      const busy = accessSaveBusy(panel);
      const dirty = dirtyAccessButtons(panel).length > 0;
      if (!busy && !dirty && Date.now() - started >= 500) return resolve({ ok: true });
      if (Date.now() - started >= timeoutMs) return resolve({ ok: false, reason: "timeout" });
      window.setTimeout(check, 120);
    };
    check();
  });
}

async function saveAndClose(panel) {
  if (saveInProgress) return;
  saveInProgress = true;
  const saveButton = panel.querySelector("[data-company-modal-save]");
  if (saveButton instanceof HTMLButtonElement) {
    saveButton.disabled = true;
    saveButton.textContent = "Lagrer...";
  }

  if (document.activeElement instanceof HTMLElement && panel.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  dirtyAccessButtons(panel).forEach((button) => button.click());
  const result = await waitForAccessSaves(panel);
  if (!result.ok) {
    if (saveButton instanceof HTMLButtonElement) {
      saveButton.disabled = false;
      saveButton.textContent = "Lagre og lukk";
    }
    saveInProgress = false;
    window.alert(result.reason === "error"
      ? "Minst én endring kunne ikke lagres. Firmaet holdes åpent slik at du kan se feilmeldingen."
      : "Lagringen tok for lang tid. Firmaet holdes åpent slik at ingen endringer blir oversett.");
    return;
  }

  clickActiveCompanyToggle(panel);
  window.setTimeout(() => cleanupModal(panel), 0);
}

function render() {
  const panel = findCompanyPanel();
  if (!panel) {
    document.getElementById(MODAL_BACKDROP_ID)?.remove();
    return;
  }
  const row = findActiveCompanyRow(panel);
  if (!row) {
    if (panel.dataset.companyAdminModalOpen === "1") cleanupModal(panel);
    return;
  }
  openModal(panel, row);
}

function scheduleRender() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    render();
  });
}

export function installSystemAdminCompanyModalUx() {
  if (typeof window === "undefined" || window.__expoSystemAdminCompanyModalInstalled) return;
  window.__expoSystemAdminCompanyModalInstalled = true;
  ensureStyles();

  const observer = new MutationObserver(scheduleRender);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const panel = findCompanyPanel();
    if (panel?.dataset.companyAdminModalOpen === "1") requestClose(panel);
  });

  window.addEventListener("beforeunload", () => {
    const panel = findCompanyPanel();
    if (panel?.dataset.companyAdminModalOpen === "1") document.body.style.overflow = previousBodyOverflow;
  });

  scheduleRender();
}
