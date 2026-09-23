// Expo ProffDok – FASE 45B
// Presentasjonslag for Enkel ordre. Den eksisterende prosjektmotoren beholdes teknisk,
// men en ordre skal ikke presenteres som et ordinært Prosjekt i brukerflaten.
// Modulen endrer kun intern admin-UX. Kundelenke/portal er i tillegg blokkert server-side.

import { createDefaultSalesSupabaseClient } from '../sales/services/salesSupabase.js';

const ROOT_ATTR = 'data-expo-simple-order';
const ORIGINAL_LABEL_ATTR = 'data-expo-simple-order-original-label';
const HIDDEN_ATTR = 'data-expo-simple-order-hidden';
const CUSTOMER_HIDDEN_ATTR = 'data-expo-simple-order-customer-hidden';

const VISIBLE_LABELS = new Map([
  ['Prosjektoversikt', 'Ordreoversikt'],
  ['Prosjektbeskrivelse', 'Ordrebeskrivelse'],
  ['Salgsgrunnlag', 'Tilbudsgrunnlag'],
  ['Befaring/Tilbud', 'Tilbudsgrunnlag'],
  ['Produkter', 'Produkter / FDV'],
  ['Tilgang', 'UE-tilgang'],
  ['Rapport', 'Sluttdokumentasjon'],
]);

const HIDDEN_NAV_LABELS = new Set([
  'Garanti',
  'Firmaprofil',
  'Firma',
  'Prosjektering',
  'Overflater og innredning',
  'Fag/utstyr',
  'Tilbud/kontrakt',
  'Chat',
  'Overtagelse',
]);

const CUSTOMER_ACTION_PATTERN = /(kundelenke|kundetilgang|kundeportal|send til kunde|kopier.*kunde)/i;
const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

let currentProjectId = '';
let currentSimpleOrder = false;
let loadingProjectId = '';
let scheduled = false;
let client = null;

function getClient() {
  if (!client) client = createDefaultSalesSupabaseClient();
  return client;
}

function internalProjectId() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const role = clean(params.get('role') || '').toLowerCase();
  if (role && role !== 'admin') return '';
  return clean(params.get('project') || '');
}

function markerSaysSimpleOrder() {
  return !!document.querySelector('[data-expo-workflow-type="simple_order"]');
}

async function refreshProjectKind() {
  const projectId = internalProjectId();
  if (!projectId) {
    currentProjectId = '';
    currentSimpleOrder = false;
    loadingProjectId = '';
    return;
  }

  if (markerSaysSimpleOrder()) {
    currentProjectId = projectId;
    currentSimpleOrder = true;
    return;
  }

  if (projectId === currentProjectId || projectId === loadingProjectId) return;
  loadingProjectId = projectId;
  try {
    const { data, error } = await getClient()
      .from('projects')
      .select('id,share_enabled,data')
      .eq('id', projectId)
      .maybeSingle();
    if (error) throw error;
    if (internalProjectId() !== projectId) return;
    currentProjectId = projectId;
    currentSimpleOrder = clean(data?.data?.project?.workflowType).toLowerCase() === 'simple_order'
      || data?.data?.project?.simpleOrder === true;
  } catch (error) {
    console.warn('Kunne ikke avklare Enkel ordre-visning', error);
    if (internalProjectId() === projectId) {
      currentProjectId = projectId;
      currentSimpleOrder = false;
    }
  } finally {
    if (loadingProjectId === projectId) loadingProjectId = '';
    scheduleApply();
  }
}

function allNavEntries() {
  return [
    ...Array.from(document.querySelectorAll('nav button')),
    ...Array.from(document.querySelectorAll('.mobileNavSelectWrap option')),
    ...Array.from(document.querySelectorAll('.mobileMenuQuickGrid button')),
    ...Array.from(document.querySelectorAll('.mobileSectionChips button')),
  ];
}

function restoreElement(element) {
  const original = element.getAttribute(ORIGINAL_LABEL_ATTR);
  if (original !== null) {
    element.textContent = original;
    element.removeAttribute(ORIGINAL_LABEL_ATTR);
  }
  if (element.getAttribute(HIDDEN_ATTR) === '1') {
    if (element instanceof HTMLElement) element.style.removeProperty('display');
    if (element instanceof HTMLOptionElement) {
      element.disabled = false;
      element.hidden = false;
    }
    element.removeAttribute(HIDDEN_ATTR);
  }
}

function rememberAndSetLabel(element, nextLabel) {
  if (!element || clean(element.textContent) === nextLabel) return;
  if (!element.hasAttribute(ORIGINAL_LABEL_ATTR)) {
    element.setAttribute(ORIGINAL_LABEL_ATTR, clean(element.textContent));
  }
  element.textContent = nextLabel;
}

function hideNavEntry(element) {
  if (!element || element.getAttribute(HIDDEN_ATTR) === '1') return;
  element.setAttribute(HIDDEN_ATTR, '1');
  if (element instanceof HTMLOptionElement) {
    element.disabled = true;
    element.hidden = true;
  } else if (element instanceof HTMLElement) {
    element.style.display = 'none';
  }
}

function restoreNavEntry(element) {
  if (!element || element.getAttribute(HIDDEN_ATTR) !== '1') return;
  if (element instanceof HTMLOptionElement) {
    element.disabled = false;
    element.hidden = false;
  } else if (element instanceof HTMLElement) {
    element.style.removeProperty('display');
  }
  element.removeAttribute(HIDDEN_ATTR);
}

function adaptNavigation(simpleOrder) {
  allNavEntries().forEach((element) => {
    if (!simpleOrder) {
      restoreElement(element);
      return;
    }

    const text = clean(element.textContent);
    const original = clean(element.getAttribute(ORIGINAL_LABEL_ATTR) || text);
    const base = original.replace(/\s*\(\d+.*\)$/, '');
    const hide = HIDDEN_NAV_LABELS.has(base)
      || base === 'Garanti ✓'
      || base.startsWith('Chat (');

    if (hide) {
      hideNavEntry(element);
      return;
    }
    restoreNavEntry(element);

    const replacement = VISIBLE_LABELS.get(base);
    if (replacement) rememberAndSetLabel(element, replacement);
  });
}

function setOwnText(element, fromText, toText) {
  if (!(element instanceof HTMLElement)) return;
  const text = clean(element.textContent);
  if (!text.includes(fromText)) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (node.nodeValue?.includes(fromText)) node.nodeValue = node.nodeValue.replaceAll(fromText, toText);
  });
}

function adaptTerminology(simpleOrder) {
  if (!simpleOrder) return;

  document.querySelectorAll('h1').forEach((heading) => {
    if (clean(heading.textContent).startsWith('Prosjekt:')) setOwnText(heading, 'Prosjekt:', 'Enkel ordre:');
  });

  document.querySelectorAll('section h2, .statusBadge, .mobileCurrentProjectBar, button').forEach((element) => {
    const text = clean(element.textContent);
    if (text.includes('Prosjektstatus')) setOwnText(element, 'Prosjektstatus', 'Ordrestatus');
    if (text === '🔒 Avslutt prosjekt') setOwnText(element, 'Avslutt prosjekt', 'Avslutt ordre');
    if (text === '🔓 Lås opp prosjekt') setOwnText(element, 'Lås opp prosjekt', 'Lås opp ordre');
  });

  document.querySelectorAll('.progress-hero, .progress-resolver, .progress-empty').forEach((element) => {
    setOwnText(element, 'Prosjektgjennomføring', 'Ordregjennomføring');
    setOwnText(element, 'prosjektet', 'ordren');
    setOwnText(element, 'Prosjektnavnet', 'Ordrenavnet');
    setOwnText(element, 'Velg riktig prosjekt', 'Velg riktig ordre');
  });

  document.querySelectorAll('div').forEach((element) => {
    const text = clean(element.textContent);
    if (text === '🟡 Ulagrede endringer i prosjektet') setOwnText(element, 'prosjektet', 'ordren');
  });
}

function restoreCustomerHidden() {
  document.querySelectorAll(`[${CUSTOMER_HIDDEN_ATTR}="1"]`).forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    element.style.removeProperty('display');
    element.removeAttribute(CUSTOMER_HIDDEN_ATTR);
  });
}

function hideCustomerAccess(simpleOrder) {
  if (!simpleOrder) {
    restoreCustomerHidden();
    return;
  }

  // Enkel ordre har ingen kundelink. Fremdrift kan fortsatt brukes internt og av UE,
  // men "Vis fremdriftsplan til kunde" skal aldri kunne slås på.
  document.querySelectorAll('.progress-share-card').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    card.style.display = 'none';
    card.setAttribute(CUSTOMER_HIDDEN_ATTR, '1');
  });

  Array.from(document.querySelectorAll('button')).forEach((button) => {
    const text = clean(button.textContent);
    if (!CUSTOMER_ACTION_PATTERN.test(text)) return;
    const container = button.closest('.item') || button.closest('section') || button;
    if (!(container instanceof HTMLElement)) return;
    const containerText = clean(container.textContent);
    if (/underentreprenør|underleverandør|UE-tilgang/i.test(containerText)) {
      button.style.display = 'none';
      button.setAttribute(CUSTOMER_HIDDEN_ATTR, '1');
      return;
    }
    container.style.display = 'none';
    container.setAttribute(CUSTOMER_HIDDEN_ATTR, '1');
  });
}

function ensureBadge(simpleOrder) {
  const id = 'expo-simple-order-workspace-badge';
  const existing = document.getElementById(id);
  if (!simpleOrder) {
    existing?.remove();
    return;
  }
  if (existing) return;

  const nav = Array.from(document.querySelectorAll('nav')).find((candidate) =>
    Array.from(candidate.querySelectorAll('button')).some((button) =>
      ['Ordreoversikt', 'Prosjektoversikt'].includes(clean(button.textContent))
    )
  );
  if (!nav?.parentElement) return;

  const badge = document.createElement('div');
  badge.id = id;
  badge.setAttribute('role', 'status');
  badge.innerHTML = '<strong>Enkel ordre</strong><span>Gjenbruker ProffDok-motoren, men uten kundelenke. Fremdrift, FDV, bilder, sjekklister, UE og sluttdokumentasjon er valgfrie arbeidsverktøy.</span>';
  Object.assign(badge.style, {
    maxWidth: '1180px',
    margin: '0 auto 10px',
    padding: '10px 14px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    border: '1px solid #b7dde1',
    borderRadius: '14px',
    background: '#f2fbfc',
    color: '#15313a',
    fontSize: '13px',
  });
  badge.querySelector('span').style.color = '#567078';
  nav.insertAdjacentElement('afterend', badge);
}

function applySimpleOrderWorkspace() {
  const simpleOrder = currentSimpleOrder || markerSaysSimpleOrder();
  if (simpleOrder) currentSimpleOrder = true;
  document.documentElement.toggleAttribute(ROOT_ATTR, simpleOrder);
  if (simpleOrder) document.documentElement.setAttribute(ROOT_ATTR, '1');

  adaptNavigation(simpleOrder);
  adaptTerminology(simpleOrder);
  hideCustomerAccess(simpleOrder);
  ensureBadge(simpleOrder);
}

function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    void refreshProjectKind().finally(applySimpleOrderWorkspace);
  });
}

export function installSimpleOrderWorkspaceUx() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (window.__expoSimpleOrderWorkspaceUxInstalled) return true;
  window.__expoSimpleOrderWorkspaceUxInstalled = true;

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  window.addEventListener('popstate', scheduleApply);
  document.addEventListener('click', () => window.setTimeout(scheduleApply, 0), true);
  scheduleApply();
  return true;
}
