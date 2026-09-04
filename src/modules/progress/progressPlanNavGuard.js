// Expo ProffDok – FASE 35A
// Stabiliserer Fremdrift-knappen i den interne prosjektmenyen når React rerendrer nav.
// Beholder den ekte knappen fra progressPlanUxV2 slik at samme klikkhandler brukes.

const NAV_ATTR = 'data-expo-progress-nav';
const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

let installed = false;
let retainedButton = null;
let observer = null;
let timer = null;

function navLabels(nav) {
  return Array.from(nav.querySelectorAll('button')).map((button) => clean(button.textContent));
}

function findInternalProjectNav() {
  return Array.from(document.querySelectorAll('nav')).find((nav) => {
    const labels = navLabels(nav);
    return labels.includes('Prosjektoversikt') && labels.includes('Prosjektering') && labels.includes('Sjekklister');
  }) || null;
}

function rememberButtonFromNode(node) {
  if (!(node instanceof Element)) return;
  if (node.matches?.(`button[${NAV_ATTR}="1"]`)) {
    retainedButton = node;
    return;
  }
  const nested = node.querySelector?.(`button[${NAV_ATTR}="1"]`);
  if (nested instanceof HTMLButtonElement) retainedButton = nested;
}

function ensurePlacement() {
  const nav = findInternalProjectNav();
  if (!nav) return;

  const connected = nav.querySelector(`button[${NAV_ATTR}="1"]`);
  if (connected instanceof HTMLButtonElement) retainedButton = connected;
  if (!(retainedButton instanceof HTMLButtonElement)) return;

  const prosjektering = Array.from(nav.querySelectorAll('button')).find(
    (button) => clean(button.textContent) === 'Prosjektering'
  );
  if (!(prosjektering instanceof HTMLButtonElement)) return;

  if (prosjektering.nextSibling !== retainedButton) {
    nav.insertBefore(retainedButton, prosjektering.nextSibling);
  }
}

export function installProgressPlanNavGuard() {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(rememberButtonFromNode);
      mutation.removedNodes.forEach(rememberButtonFromNode);
    });
    ensurePlacement();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Lett sikkerhetsnett dersom React erstatter nav i en rekkefølge som ikke gir
  // en brukbar mutation på selve knappen. Ingen data- eller nettverksoperasjoner.
  timer = window.setInterval(ensurePlacement, 500);
  ensurePlacement();
}
