// Expo ProffDok – FASE 33B.5
// Kun presentasjon: eksisterende intern tab-/datanøkkel `tilbud` beholdes urørt.
// Dette lar eldre og direkte opprettede prosjekter fungere uten migrering samtidig
// som brukerflaten konsekvent omtaler samlet tilbud/kontrakt/endringer som Avtalegrunnlag.

const REPLACEMENTS = [
  ["Tilbud / kontrakt", "Avtalegrunnlag"],
  ["Tilbud/kontrakt", "Avtalegrunnlag"],
];

function replaceAgreementBasisText(value = "") {
  let next = String(value || "");
  for (const [from, to] of REPLACEMENTS) {
    if (next.includes(from)) next = next.split(from).join(to);
  }
  return next;
}

function normalizeTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const current = node.nodeValue || "";
  const next = replaceAgreementBasisText(current);
  if (next !== current) node.nodeValue = next;
}

function normalizeSubtree(root) {
  if (typeof document === "undefined" || !root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    normalizeTextNode(root);
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    normalizeTextNode(node);
    node = walker.nextNode();
  }
}

let installed = false;

export function installAgreementBasisTerminology() {
  if (installed || typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  installed = true;

  const start = () => {
    normalizeSubtree(document.body || document.documentElement);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          normalizeTextNode(mutation.target);
          continue;
        }
        mutation.addedNodes.forEach(normalizeSubtree);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

installAgreementBasisTerminology();
