// Expo ProffDok – FASE 45B
// Brukerrettet terminologi for den generelle tilbudstypen.
// Teknisk kontrakt beholdes som store_offers / Butikktilbud / varesalg for bakoverkompatibilitet.

const INSTALL_FLAG = "__expoGeneralOfferTerminologyInstalled";
const FILTER_ROOT_SELECTOR = '[aria-label="Søk og filtrering"]';
const OFFER_PICKER_SELECTOR = '[aria-labelledby="sales-offer-type-title"]';

const OVERVIEW_ALL = "Her håndterer du forespørsler, Våtromstilbud og Generelle tilbud. Våtromstilbud følger våtromsflyten, mens Generelle tilbud kan brukes til varer, arbeid, underentreprenører og andre leveranser.";
const OVERVIEW_WETROOM = "Opprett og følg forespørsler og Våtromstilbud gjennom befaring, tilbud og kundeaksept. Akseptert Våtromstilbud kan aktiveres som ProffDok-prosjekt.";
const OVERVIEW_GENERAL = "Opprett og følg Generelle tilbud for varer, arbeid, underentreprenører og andre leveranser. Etter kundeaksept vises de neste stegene som er tilgjengelige for firmaet.";

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function setTextIfChanged(node, value) {
  if (!(node instanceof HTMLElement)) return false;
  if (node.textContent === value) return false;
  node.textContent = value;
  return true;
}

function replaceExactTextNodes(root, from, to) {
  if (!(root instanceof Node)) return false;
  let changed = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const parent = node.parentElement;
    if (!parent || parent.matches("script,style,textarea")) return;
    if (compactText(node.nodeValue) !== from) return;
    const current = String(node.nodeValue || "");
    const next = current.replace(from, to);
    if (next === current) return;
    node.nodeValue = next;
    changed = true;
  });
  return changed;
}

function findOverviewNote() {
  const marked = document.querySelector('[data-sales-overview-intro="1"]');
  if (marked instanceof HTMLParagraphElement) return marked;
  return Array.from(document.querySelectorAll("p.note")).find((note) => {
    const text = compactText(note.textContent);
    return text.startsWith("Her håndterer du forespørsler") ||
      text.startsWith("Opprett og følg varebaserte Butikktilbud") ||
      text.startsWith("Opprett og følg Generelle tilbud") ||
      text.startsWith("Opprett og følg forespørsler og Våtromstilbud");
  }) || null;
}

function setOverview(type = "all") {
  const note = findOverviewNote();
  if (!(note instanceof HTMLParagraphElement)) return;
  note.dataset.salesOverviewIntro = "1";
  if (type === "general") setTextIfChanged(note, OVERVIEW_GENERAL);
  else if (type === "wetroom") setTextIfChanged(note, OVERVIEW_WETROOM);
  else setTextIfChanged(note, OVERVIEW_ALL);
}

function patchOfferFilter() {
  const root = document.querySelector(FILTER_ROOT_SELECTOR);
  if (!(root instanceof HTMLElement)) return;
  root.querySelectorAll("button").forEach((button) => {
    replaceExactTextNodes(button, "Butikktilbud", "Generelle tilbud");
  });
}

function patchOfferPicker() {
  const picker = document.querySelector(OFFER_PICKER_SELECTOR);
  if (!(picker instanceof HTMLElement)) return;

  picker.querySelectorAll("strong").forEach((node) => {
    if (compactText(node.textContent) === "Butikktilbud") {
      setTextIfChanged(node, "Generelt tilbud");
    }
  });

  picker.querySelectorAll("small").forEach((node) => {
    const text = compactText(node.textContent);
    if (text === "Opprett ordinært tilbud direkte uten å registrere befaring først.") {
      setTextIfChanged(node, "Opprett våtromstilbud direkte uten å registrere befaring først.");
      return;
    }
    if (text === "Varebasert tilbud med eventuell montering. Avsluttes ved kundeaksept." ||
        text === "For varer, arbeid, underentreprenører og andre leveranser. Tilbudet bygges opp fritt og avsluttes ved kundeaksept.") {
      setTextIfChanged(
        node,
        "For varer, arbeid, underentreprenører og andre leveranser. Tilbudet bygges opp fritt."
      );
    }
  });
}

function patchAccessLabels() {
  document.querySelectorAll('[data-systemadmin-unified-access], #expo-module-access-manager').forEach((root) => {
    replaceExactTextNodes(root, "Butikktilbud", "Generelle tilbud");
    root.querySelectorAll("small").forEach((node) => {
      if (compactText(node.textContent) === "Varebaserte butikktilbud. Krever samtidig Befaring / Våtromstilbud.") {
        setTextIfChanged(node, "Generelle tilbud for varer, arbeid og andre leveranser. Krever samtidig Befaring / Våtromstilbud.");
      }
    });
  });
}

function patchNavigationLabels() {
  document.querySelectorAll("nav, aside").forEach((root) => {
    replaceExactTextNodes(root, "Butikktilbud", "Generelle tilbud");
  });
}

function patchKnownOverviewCopy() {
  const note = findOverviewNote();
  if (!(note instanceof HTMLParagraphElement)) return;
  const text = compactText(note.textContent);
  if (text.includes("Butikktilbud") || text.includes("butikktilbud")) {
    setOverview("all");
  }
}

function renderTerminology() {
  patchOfferFilter();
  patchOfferPicker();
  patchAccessLabels();
  patchNavigationLabels();
  patchKnownOverviewCopy();
}

export function installGeneralOfferTerminologyUx() {
  if (typeof window === "undefined" || window[INSTALL_FLAG]) return;
  window[INSTALL_FLAG] = true;

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      renderTerminology();
    });
  };

  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (!(button instanceof HTMLButtonElement) || !button.closest(FILTER_ROOT_SELECTOR)) return;
    const text = compactText(button.textContent);
    const type = text.startsWith("Generelle tilbud") || text.startsWith("Butikktilbud")
      ? "general"
      : text.startsWith("Våtromstilbud")
        ? "wetroom"
        : text.startsWith("Alle tilbud")
          ? "all"
          : "";
    if (!type) return;
    window.requestAnimationFrame(() => setOverview(type));
  }, true);

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  schedule();
}
