// Expo ProffDok – FASE 41B.5C
// Legger Befaring som egen hurtigfilterknapp i Sales-oversikten uten å endre
// statusmodell eller lagring. Filteret bruker det eksisterende Sales-søket, slik
// at Befaring fortsatt inngår i den ordinære «Under arbeid»-oversikten.

const BUTTON_ID = "expo-sales-survey-filter";
const SURVEY_QUERY = "Befaring";
let frame = 0;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function statusTabs() {
  return document.querySelector('[role="tablist"][aria-label="Arbeidsstatus"]');
}

function searchInput() {
  const panel = document.querySelector('section[aria-label="Søk og filtrering"]');
  return panel?.querySelector('input[type="search"]') || null;
}

function directButtonLabel(button) {
  if (!(button instanceof HTMLButtonElement)) return "";
  const textNode = Array.from(button.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && compactText(node.textContent)
  );
  return compactText(textNode?.textContent || "");
}

function nativeStatusButton(label) {
  const tabs = statusTabs();
  if (!tabs) return null;
  return Array.from(tabs.querySelectorAll(":scope > button")).find(
    (button) => button.id !== BUTTON_ID && directButtonLabel(button) === label
  ) || null;
}

function setReactInputValue(input, value) {
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  );
  descriptor?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyTabStyle(button, selected) {
  if (!(button instanceof HTMLButtonElement)) return;
  button.setAttribute("aria-selected", selected ? "true" : "false");
  button.style.border = selected ? "1px solid #0f5265" : "1px solid #cbd5e1";
  button.style.background = selected ? "#0f5265" : "#fff";
  button.style.color = selected ? "#fff" : "#17313a";
  const count = button.querySelector(":scope > span");
  if (count instanceof HTMLElement) {
    count.style.background = selected ? "rgba(255,255,255,0.18)" : "#f1f5f9";
  }
}

function surveyActive() {
  return compactText(searchInput()?.value) === SURVEY_QUERY;
}

function clearSurveyQuery() {
  const input = searchInput();
  if (!(input instanceof HTMLInputElement)) return;
  if (compactText(input.value) !== SURVEY_QUERY) return;
  setReactInputValue(input, "");
}

function activateSurveyFilter(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();

  const input = searchInput();
  if (!(input instanceof HTMLInputElement)) return;

  const allButton = nativeStatusButton("Alle");
  if (allButton instanceof HTMLButtonElement) allButton.click();

  setReactInputValue(input, SURVEY_QUERY);
  window.requestAnimationFrame(scheduleSync);
}

function makeSurveyButton(tabs) {
  const source = nativeStatusButton("Under arbeid");
  if (!(source instanceof HTMLButtonElement)) return null;

  const button = source.cloneNode(true);
  button.id = BUTTON_ID;
  button.type = "button";
  button.dataset.salesSurveyFilter = "1";
  button.setAttribute("aria-label", "Vis saker som står i Befaring");

  const textNode = Array.from(button.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE
  );
  if (textNode) textNode.textContent = "Befaring";
  else button.prepend(document.createTextNode("Befaring"));

  // Antallet settes etter at eksisterende søk har filtrert listen. Vi viser ikke
  // et misvisende tall når øvrige tilbudstypefiltre er aktive.
  button.querySelector(":scope > span")?.remove();
  button.addEventListener("click", activateSurveyFilter);
  source.insertAdjacentElement("afterend", button);
  return button;
}

function syncVisualState() {
  const tabs = statusTabs();
  if (!(tabs instanceof HTMLElement)) {
    document.getElementById(BUTTON_ID)?.remove();
    return;
  }

  let button = document.getElementById(BUTTON_ID);
  if (!(button instanceof HTMLButtonElement) || button.parentElement !== tabs) {
    button?.remove();
    button = makeSurveyButton(tabs);
  }
  if (!(button instanceof HTMLButtonElement)) return;

  const active = surveyActive();
  applyTabStyle(button, active);

  const allButton = nativeStatusButton("Alle");
  if (active && allButton instanceof HTMLButtonElement) {
    applyTabStyle(allButton, false);
    allButton.dataset.surveyFilterTemporarilyUnselected = "1";
  } else if (
    allButton instanceof HTMLButtonElement &&
    allButton.dataset.surveyFilterTemporarilyUnselected === "1"
  ) {
    delete allButton.dataset.surveyFilterTemporarilyUnselected;
  }
}

function scheduleSync() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    syncVisualState();
  });
}

export function installSalesSurveyFilterUx() {
  if (typeof window === "undefined" || window.__expoSalesSurveyFilterUxInstalled) return;
  window.__expoSalesSurveyFilterUxInstalled = true;

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest('[role="tablist"][aria-label="Arbeidsstatus"] > button');
      if (!(button instanceof HTMLButtonElement) || button.id === BUTTON_ID) return;
      if (surveyActive()) clearSurveyQuery();
    },
    true
  );

  document.addEventListener("input", (event) => {
    if (event.target === searchInput()) scheduleSync();
  });

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("focus", scheduleSync);
  window.addEventListener("expo-proffdok-sales-rehydrate", scheduleSync);
  scheduleSync();
}
