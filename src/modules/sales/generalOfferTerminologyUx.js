// Expo ProffDok – FASE 45B
// Brukerrettet terminologi for den generelle tilbudstypen.
// Teknisk kontrakt beholdes som store_offers / Butikktilbud / varesalg for bakoverkompatibilitet.

const INSTALL_FLAG = "__expoGeneralOfferTerminologyInstalled";
const FILTER_ROOT_SELECTOR = '[aria-label="Søk og filtrering"]';
const OFFER_PICKER_SELECTOR = '[aria-labelledby="sales-offer-type-title"]';

const OVERVIEW_ALL = "Her håndterer du forespørsler, Våtromstilbud og Generelle tilbud. Våtromstilbud følger våtromsflyten, mens Generelle tilbud kan brukes til varer, arbeid, underentreprenører og andre leveranser.";
const OVERVIEW_WETROOM = "Opprett og følg forespørsler og Våtromstilbud gjennom befaring, tilbud og kundeaksept. Akseptert Våtromstilbud kan aktiveres som ProffDok-prosjekt.";
const OVERVIEW_GENERAL = "Opprett og følg Generelle tilbud for varer, arbeid, underentreprenører og andre leveranser. Etter kundeaksept vises de neste stegene som er tilgjengelige for firmaet.";
const LEGACY_ENGINE_OVERVIEW = "Våtromstilbud og Butikktilbud ligger i samme sikre tilbudsmotor, men kan filtreres separat under.";
const GENERAL_ENGINE_OVERVIEW = "Våtromstilbud og Generelle tilbud ligger i samme sikre tilbudsmotor, men kan filtreres separat under.";

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

function replacePairs(root, pairs = []) {
  pairs.forEach(([from, to]) => replaceExactTextNodes(root, from, to));
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

function patchLegacyEngineOverviewCopy() {
  document.querySelectorAll("p").forEach((node) => {
    if (compactText(node.textContent) === LEGACY_ENGINE_OVERVIEW) {
      setTextIfChanged(node, GENERAL_ENGINE_OVERVIEW);
    }
  });
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

function patchGeneratedGeneralOfferTitle(root) {
  if (!(root instanceof HTMLElement)) return;
  const originShowsGeneralOffer = Array.from(
    root.querySelectorAll(".sales-detail-card .sales-detail-lines span")
  ).some((node) => {
    const text = compactText(node.textContent);
    return text === "Kom via Generelt tilbud" ||
      text === "Kom via Butikktilbud / varesalg" ||
      text === "Kom via Butikktilbud / Varesalg";
  });
  if (!originShowsGeneralOffer) return;

  const title = compactText(
    root.querySelector(".sales-detail-hero .sales-title")?.textContent
  );
  if (!title) return;

  const generatedTitles = new Set([
    `Tilbud – ${title}`,
    `Tilbud - ${title}`,
  ]);
  root.querySelectorAll(".sales-next-card strong").forEach((node) => {
    if (generatedTitles.has(compactText(node.textContent))) {
      setTextIfChanged(node, title);
    }
  });
}

function patchGeneralOfferSurfaceCopy() {
  const root = document.querySelector(".sales-app");
  if (!(root instanceof HTMLElement)) return;

  const simpleOrderRoot = root.querySelector(".simple-order-accepted-shell");
  if (simpleOrderRoot instanceof HTMLElement) {
    replacePairs(simpleOrderRoot, [
      ["Butikktilbud akseptert", "Generelt tilbud akseptert"],
      [
        "Kunden har akseptert butikktilbudet. Aksepten og den publiserte tilbudsversjonen er låst, og saken avsluttes i Sales.",
        "Kunden har akseptert tilbudet. Aksepten og den publiserte tilbudsversjonen er låst. Velg videreføring når du er klar.",
      ],
      [
        "Akseptbeviset er opprettet og lagret. Butikktilbudet er ferdig behandlet.",
        "Akseptbeviset er opprettet og lagret. Velg videreføring når du er klar.",
      ],
      [
        "Butikktilbudet er akseptert og avsluttet i Sales. Det opprettes ikke ProffDok-prosjekt.",
        "Tilbudet er akseptert. Velg Enkel ordre eller ordinært prosjekt ut fra omfanget på oppdraget.",
      ],
    ]);
  }

  replacePairs(root, [
    ["Butikktilbud", "Generelt tilbud"],
    ["Butikktilbud / Varesalg", "Generelt tilbud"],
    ["Butikktilbud / varesalg", "Generelt tilbud"],
    ["Nytt butikktilbud", "Nytt generelt tilbud"],
    ["Registrer kunde og opprett butikktilbud", "Registrer kunde og opprett tilbud"],
    ["Opprett butikktilbud", "Opprett tilbud"],
    ["Butikktilbud akseptert", "Generelt tilbud akseptert"],
    [
      "Opprett et varebasert tilbud med produkter, eventuell montering og alternativer. Tilbudet avsluttes ved kundeaksept.",
      "Opprett et tilbud for varer, arbeid, underentreprenører og andre leveranser.",
    ],
    [
      "Kunden har akseptert butikktilbudet. Aksepten og den publiserte tilbudsversjonen er låst, og saken avsluttes i Sales.",
      "Kunden har akseptert tilbudet. Aksepten og den publiserte tilbudsversjonen er låst, og saken avsluttes i Sales.",
    ],
    [
      "Akseptbeviset er opprettet og lagret. Butikktilbudet er ferdig behandlet.",
      "Akseptbeviset er opprettet og lagret. Tilbudet er ferdig behandlet.",
    ],
    [
      "Låst dokumentasjon av det aksepterte butikktilbudet.",
      "Låst dokumentasjon av det aksepterte tilbudet.",
    ],
    [
      "Butikktilbudet er akseptert og avsluttet i Sales. Det opprettes ikke ProffDok-prosjekt.",
      "Det generelle tilbudet er akseptert og avsluttet i Sales. Det opprettes ikke ProffDok-prosjekt.",
    ],
  ]);

  patchGeneratedGeneralOfferTitle(root);
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
  patchGeneralOfferSurfaceCopy();
  patchKnownOverviewCopy();
  patchLegacyEngineOverviewCopy();
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