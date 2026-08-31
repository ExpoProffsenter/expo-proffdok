// FASE 29E1: Adaptiv prosjektflyt etter aktivering.
// I et aktivert prosjekt er tidligere salgsflyt historikk, ikke neste arbeidssteg.
// Denne modulen endrer kun navigasjon/presentasjon. Ingen prosjektdata, salgsdata,
// Supabase, Storage, rapport eller kundevisning endres.

const HELP_ID = 'expo-project-flow-help';
const STATUS_TOGGLE_ID = 'expo-project-status-toggle';
const SALES_QUICK_ID = 'expo-sales-origin-quick-actions';
const TARGET_ATTR = 'data-expo-project-flow-target';
const ADAPTED_ATTR = 'data-expo-project-flow-adapted';
const SALES_HIDDEN_ATTR = 'data-expo-project-sales-hidden';
const SALES_REF_KEY = 'expoProffDokCurrentProjectSalesRef';
const SALES_TOKEN_KEY = 'expoProffDokCurrentProjectSalesPublicToken';

const cleanText = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();
let lastProjectIdentity = '';
let projectStatusExpanded = false;
let lastStatusTabLabel = '';

function getAppNav() {
  return Array.from(document.querySelectorAll('nav')).find((nav) => {
    const labels = Array.from(nav.querySelectorAll('button')).map((button) => cleanText(button.textContent));
    return labels.includes('Startside') || labels.includes('Prosjektoversikt');
  }) || null;
}

function getActiveNavLabel(nav) {
  return cleanText(nav?.querySelector('button.on')?.textContent || '');
}

function navButtonForLabel(nav, label) {
  return Array.from(nav?.querySelectorAll('button') || []).find(
    (button) => cleanText(button.textContent) === label
  ) || null;
}

function projectIdentity() {
  return cleanText(document.querySelector('.mobileCurrentProjectBar span')?.textContent || '');
}

function getStoredSalesRef() {
  try { return String(window.sessionStorage.getItem(SALES_REF_KEY) || '').trim(); } catch { return ''; }
}

function getStoredSalesToken() {
  try { return String(window.sessionStorage.getItem(SALES_TOKEN_KEY) || '').trim(); } catch { return ''; }
}

function clearStoredSalesOrigin() {
  try {
    window.sessionStorage.removeItem(SALES_REF_KEY);
    window.sessionStorage.removeItem(SALES_TOKEN_KEY);
  } catch {}
}

function updateStoredSalesOrigin(activeProject) {
  if (!activeProject) {
    lastProjectIdentity = '';
    clearStoredSalesOrigin();
    return { requestRef: '', publicToken: '' };
  }

  const identity = projectIdentity();
  if (identity && lastProjectIdentity && identity !== lastProjectIdentity) {
    clearStoredSalesOrigin();
  }
  if (identity) lastProjectIdentity = identity;

  const marker = document.querySelector('[data-expo-sales-origin-ref]');
  const markerRef = String(marker?.getAttribute('data-expo-sales-origin-ref') || '').trim();
  const markerToken = String(marker?.getAttribute('data-expo-sales-public-token') || '').trim();

  if (markerRef) {
    try { window.sessionStorage.setItem(SALES_REF_KEY, markerRef); } catch {}
  }
  if (markerToken) {
    try { window.sessionStorage.setItem(SALES_TOKEN_KEY, markerToken); } catch {}
  }

  return {
    requestRef: markerRef || getStoredSalesRef(),
    publicToken: markerToken || getStoredSalesToken()
  };
}

function replaceTextNodes(root, fromText, toText) {
  if (!root) return false;
  let changed = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (!node.nodeValue?.includes(fromText)) return;
    node.nodeValue = node.nodeValue.replaceAll(fromText, toText);
    changed = true;
  });
  return changed;
}

function adaptSalesLabel(showSalesOrigin, nav) {
  const candidates = [
    ...Array.from(nav?.querySelectorAll('button') || []),
    ...Array.from(document.querySelectorAll('.mobileMenuQuickGrid button')),
    ...Array.from(document.querySelectorAll('.mobileNavSelectWrap option')),
  ];

  candidates.forEach((element) => {
    const text = cleanText(element.textContent);
    if (showSalesOrigin) {
      if (!text.includes('Befaring/Tilbud')) return;
      if (replaceTextNodes(element, 'Befaring/Tilbud', 'Salgsgrunnlag')) {
        element.setAttribute(ADAPTED_ATTR, '1');
        if (element instanceof HTMLElement) {
          element.title = 'Viser historikken som lå til grunn for det aktive prosjektet.';
        }
      }
      return;
    }

    if (element.getAttribute(ADAPTED_ATTR) !== '1') return;
    replaceTextNodes(element, 'Salgsgrunnlag', 'Befaring/Tilbud');
    element.removeAttribute(ADAPTED_ATTR);
    if (element instanceof HTMLElement) element.removeAttribute('title');
  });
}

function setFlowTarget(button, targetLabel, visibleLabel = '') {
  if (!(button instanceof HTMLButtonElement)) return;
  button.setAttribute(TARGET_ATTR, targetLabel);
  if (visibleLabel && cleanText(button.textContent) !== visibleLabel) button.textContent = visibleLabel;
}

function adaptPreviousNext(activeProject, nav) {
  document.querySelectorAll(`button[${TARGET_ATTR}]`).forEach((button) => {
    if (button.closest(`#${SALES_QUICK_ID}`)) return;
    button.removeAttribute(TARGET_ATTR);
  });
  if (!activeProject || !nav) return;

  const activeLabel = getActiveNavLabel(nav);
  const desktopButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = cleanText(button.textContent);
    return text.startsWith('Neste:') || text.startsWith('← Forrige:');
  });
  const mobilePrev = document.querySelector('.mobileNavQuick button:first-child');
  const mobileNext = document.querySelector('.mobileNavQuick button:last-child');

  if (activeLabel === 'Prosjektoversikt') {
    desktopButtons.filter((button) => cleanText(button.textContent).startsWith('Neste:'))
      .forEach((button) => setFlowTarget(button, 'Prosjektbeskrivelse', 'Neste: Prosjektbeskrivelse →'));
    setFlowTarget(mobileNext, 'Prosjektbeskrivelse');
  }

  if (activeLabel === 'Prosjektbeskrivelse') {
    desktopButtons.filter((button) => cleanText(button.textContent).startsWith('← Forrige:'))
      .forEach((button) => setFlowTarget(button, 'Prosjektoversikt', '← Forrige: Prosjektoversikt'));
    setFlowTarget(mobilePrev, 'Prosjektoversikt');
  }

  if (activeLabel === 'Salgsgrunnlag' || activeLabel === 'Befaring/Tilbud') {
    desktopButtons.filter((button) => cleanText(button.textContent).startsWith('← Forrige:'))
      .forEach((button) => setFlowTarget(button, 'Prosjektoversikt', '← Forrige: Prosjektoversikt'));
    desktopButtons.filter((button) => cleanText(button.textContent).startsWith('Neste:'))
      .forEach((button) => setFlowTarget(button, 'Prosjektbeskrivelse', 'Neste: Prosjektbeskrivelse →'));
    setFlowTarget(mobilePrev, 'Prosjektoversikt');
    setFlowTarget(mobileNext, 'Prosjektbeskrivelse');
  }
}

function workflowStatusPresentation(status = 'Pågår') {
  const map = {
    'Utkast': { icon: '📝', background: '#f8fafc', color: '#334155', borderColor: '#cbd5e1' },
    'Pågår': { icon: '🟡', background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' },
    'Avventer': { icon: '⏸️', background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' },
    'Klar for kunde': { icon: '🟢', background: '#ecfdf5', color: '#166534', borderColor: '#bbf7d0' },
    'Ferdigstilt': { icon: '✅', background: '#ecfdf5', color: '#166534', borderColor: '#bbf7d0' }
  };
  return map[status] || { icon: '🟡', background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' };
}

function findPrimaryProjectStatusSection() {
  return document.querySelector('section.projectStatusSection');
}

function findWorkflowStatusSelect(section) {
  return Array.from(section?.querySelectorAll('label') || [])
    .find((label) => cleanText(label.textContent).startsWith('Arbeidsstatus'))
    ?.querySelector('select') || null;
}

function adaptPrimaryProjectStatus(activeProject) {
  if (!activeProject) return;
  const section = findPrimaryProjectStatusSection();
  if (!(section instanceof HTMLElement)) return;

  const heading = Array.from(section.children).find((child) => child.tagName === 'H2');
  const headingText = cleanText(heading?.textContent || '');
  if (!headingText.includes('Prosjektstatus: Avvik åpent')) return;

  const statusSelect = findWorkflowStatusSelect(section);
  const workflowStatus = cleanText(statusSelect?.value || 'Pågår') || 'Pågår';
  const presentation = workflowStatusPresentation(workflowStatus);

  replaceTextNodes(heading, '🔴 Prosjektstatus: Avvik åpent', `${presentation.icon} Prosjektstatus: ${workflowStatus}`);
  replaceTextNodes(heading, 'Prosjektstatus: Avvik åpent', `Prosjektstatus: ${workflowStatus}`);

  const badge = section.querySelector('.statusBadge');
  if (badge instanceof HTMLElement && cleanText(badge.textContent).includes('Avvik åpent')) {
    badge.textContent = `${presentation.icon} ${workflowStatus}`;
    badge.style.background = presentation.background;
    badge.style.color = presentation.color;
    badge.style.borderColor = presentation.borderColor;
  }

  const warningNote = Array.from(section.querySelectorAll('p.note')).find((note) =>
    /prosjektet har\s+\d+\s+åpne? avvik/i.test(cleanText(note.textContent))
  );
  if (warningNote instanceof HTMLElement) {
    const countMatch = cleanText(warningNote.textContent).match(/har\s+(\d+)\s+åpne? avvik/i);
    const count = Number(countMatch?.[1] || 0);
    if (count > 0) {
      warningNote.textContent = count === 1
        ? '⚠️ 1 åpent avvik krever oppfølging.'
        : `⚠️ ${count} åpne avvik krever oppfølging.`;
    }
  }
}

function adaptDeviationNavigation(activeProject) {
  if (!activeProject) return;
  Array.from(document.querySelectorAll('button')).forEach((button) => {
    const text = cleanText(button.textContent);
    if (text !== 'Se aktive avvik' && text !== 'Åpne Avvik') return;
    setFlowTarget(button, 'Avvik', 'Åpne Avvik');
    button.title = 'Åpner Avvikssentralen med prosjektets avvik.';
  });
}

function findProjectStatusSection() {
  return Array.from(document.querySelectorAll('section')).find((section) => {
    const heading = Array.from(section.children).find((child) => child.tagName === 'H2');
    return cleanText(heading?.textContent || '') === 'Hva mangler på prosjektet?';
  }) || null;
}

function adaptChecklistProgress(section) {
  if (!(section instanceof HTMLElement)) return;
  const cards = Array.from(section.querySelectorAll('.guideCard'));
  if (!cards.length) return;

  let progressCard = section.querySelector('[data-expo-checklist-progress-card="1"]');
  if (!(progressCard instanceof HTMLElement)) {
    progressCard = cards.find((card) =>
      cleanText(card.querySelector('span')?.textContent || '') === 'ferdigstillelse'
    ) || null;
    if (progressCard) progressCard.setAttribute('data-expo-checklist-progress-card', '1');
  }
  if (!(progressCard instanceof HTMLElement)) return;

  const checklistCard = cards.find((card) => {
    const label = cleanText(card.querySelector('span')?.textContent || '').toLowerCase();
    return label.includes('sjekkpunkt') || label.includes('sjekklister ferdig');
  });
  if (!(checklistCard instanceof HTMLElement)) return;

  const done = Number.parseInt(cleanText(checklistCard.querySelector('b')?.textContent || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const checklistLabel = cleanText(checklistCard.querySelector('span')?.textContent || '');
  const missingMatch = checklistLabel.match(/(\d+)\s+sjekkpunkt\s+gjenstår/i);
  const missing = missingMatch ? Number(missingMatch[1]) || 0 : 0;
  const complete = /sjekklister ferdig/i.test(checklistLabel);
  const total = complete ? done : done + missing;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const value = progressCard.querySelector('b');
  const label = progressCard.querySelector('span');
  if (value) value.textContent = `${percent}%`;
  if (label) label.textContent = total > 0 ? `sjekkliste · ${done} av ${total}` : 'sjekkliste ikke startet';
}

function renderProjectStatusState(section, expanded) {
  if (!(section instanceof HTMLElement)) return;
  let toggle = document.getElementById(STATUS_TOGGLE_ID);
  if (!(toggle instanceof HTMLButtonElement) || toggle.parentElement !== section) {
    toggle?.remove();
    toggle = document.createElement('button');
    toggle.id = STATUS_TOGGLE_ID;
    toggle.type = 'button';
    toggle.className = 'secondary';
    Object.assign(toggle.style, {
      width: '100%',
      minHeight: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      textAlign: 'left',
      fontWeight: '800'
    });
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      projectStatusExpanded = !projectStatusExpanded;
      renderProjectStatusState(section, projectStatusExpanded);
    });
    section.insertBefore(toggle, section.firstChild);
  }

  const label = expanded
    ? '📋 Skjul prosjektstatus / hva mangler'
    : '📋 Vis prosjektstatus / hva mangler';
  if (toggle.textContent !== label) toggle.textContent = label;
  toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');

  Array.from(section.children).forEach((child) => {
    if (child === toggle) return;
    if (child instanceof HTMLElement) child.style.display = expanded ? '' : 'none';
  });
}

function adaptProjectStatus(activeProject, nav) {
  const section = findProjectStatusSection();
  if (!section) return;

  if (!activeProject) {
    document.getElementById(STATUS_TOGGLE_ID)?.remove();
    Array.from(section.children).forEach((child) => {
      if (child instanceof HTMLElement) child.style.removeProperty('display');
    });
    projectStatusExpanded = false;
    lastStatusTabLabel = '';
    return;
  }

  adaptChecklistProgress(section);
  const activeLabel = getActiveNavLabel(nav);
  if (activeLabel !== lastStatusTabLabel) {
    projectStatusExpanded = false;
    lastStatusTabLabel = activeLabel;
  }
  renderProjectStatusState(section, projectStatusExpanded);
}

function findSalesIntroSection() {
  return Array.from(document.querySelectorAll('section')).find((section) => {
    const heading = Array.from(section.children).find((child) => child.tagName === 'H2');
    const headingText = cleanText(heading?.textContent || '');
    return headingText === 'Befaring / Tilbud / Aksept' || headingText === 'Salgsgrunnlag';
  }) || null;
}

function createProjectShortcut(label, targetLabel, title = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary';
  button.textContent = label;
  button.setAttribute(TARGET_ATTR, targetLabel);
  if (title) button.title = title;
  return button;
}

function adaptSalesIntro(showSalesOrigin, nav) {
  const activeLabel = getActiveNavLabel(nav);
  const existingQuick = document.getElementById(SALES_QUICK_ID);
  if (!showSalesOrigin || activeLabel !== 'Salgsgrunnlag') {
    existingQuick?.remove();
    return;
  }

  const section = findSalesIntroSection();
  if (!(section instanceof HTMLElement)) return;
  const heading = Array.from(section.children).find((child) => child.tagName === 'H2');
  if (heading) replaceTextNodes(heading, 'Befaring / Tilbud / Aksept', 'Salgsgrunnlag');

  const note = Array.from(section.children).find((child) => child instanceof HTMLElement && child.classList.contains('note'));
  if (note instanceof HTMLElement) {
    const desired = 'Forespørsel, befaring, kundens tilbud og kundeaksept er ferdig gjennomført. Her ligger salgsgrunnlaget som skrivebeskyttet historikk for det aktive prosjektet.';
    if (cleanText(note.textContent) !== desired) note.textContent = desired;
  }

  if (existingQuick?.parentElement === section) return;
  existingQuick?.remove();

  const quick = document.createElement('div');
  quick.id = SALES_QUICK_ID;
  Object.assign(quick.style, {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '12px'
  });

  const inspectionButton = document.createElement('button');
  inspectionButton.type = 'button';
  inspectionButton.className = 'secondary';
  inspectionButton.textContent = 'Se innhold fra befaring';
  inspectionButton.setAttribute('data-expo-open-sales-inspection', '1');
  inspectionButton.title = 'Viser opprinnelig forespørsel, kundens ønsker, forhold, målinger, observasjoner og befaringsbilder.';
  quick.append(inspectionButton);

  const publicToken = getStoredSalesToken();
  if (publicToken) {
    const offerButton = document.createElement('button');
    offerButton.type = 'button';
    offerButton.className = 'secondary';
    offerButton.textContent = 'Se kundens tilbud';
    offerButton.setAttribute('data-expo-open-customer-offer', '1');
    offerButton.title = 'Åpner den publiserte kundevisningen av tilbudet i en ny fane.';
    quick.append(offerButton);
  }

  quick.append(
    createProjectShortcut(
      'Se kunde/prosjektdata',
      'Prosjektoversikt',
      'Åpner kunde, telefon, e-post, adresse og prosjektansvarlig.'
    )
  );

  if (note instanceof HTMLElement) note.insertAdjacentElement('afterend', quick);
  else section.append(quick);
}

function adaptSalesModuleVisibility(showSalesOrigin, nav) {
  const hide = showSalesOrigin && getActiveNavLabel(nav) === 'Salgsgrunnlag';
  document.querySelectorAll('.sales-app').forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    if (hide) {
      if (element.getAttribute(SALES_HIDDEN_ATTR) !== '1') {
        element.setAttribute(SALES_HIDDEN_ATTR, '1');
        element.dataset.expoPreviousDisplay = element.style.display || '';
      }
      element.style.display = 'none';
      return;
    }
    if (element.getAttribute(SALES_HIDDEN_ATTR) === '1') {
      element.style.display = element.dataset.expoPreviousDisplay || '';
      delete element.dataset.expoPreviousDisplay;
      element.removeAttribute(SALES_HIDDEN_ATTR);
    }
  });
}

function updateHelp(nav) {
  const existing = document.getElementById(HELP_ID);
  if (getActiveNavLabel(nav) !== 'Hjelp') {
    existing?.remove();
    return;
  }

  const quickStart = document.querySelector('.helpQuickStart');
  if (!(quickStart instanceof HTMLElement)) return;
  if (existing) return;

  const card = document.createElement('section');
  card.id = HELP_ID;
  card.className = 'item';
  Object.assign(card.style, {
    marginTop: '14px',
    marginBottom: '16px',
    borderColor: '#bae6fd',
    background: '#f0f9ff'
  });
  card.innerHTML = `
    <h3 style="margin-top:0">🔄 Prosjektflyt etter aktivering</h3>
    <p class="note">Når forespørsel, befaring, tilbud og kundeaksept er ferdig og saken aktiveres som prosjekt, går ProffDok over til gjennomføringsflyt.</p>
    <ul style="margin:10px 0 0;padding-left:22px;line-height:1.55">
      <li><strong>Prosjektoversikt → Prosjektbeskrivelse</strong> er starten på den ordinære prosjektflyten.</li>
      <li>Prosjekter som kommer fra tilbud får <strong>Salgsgrunnlag</strong>. Dette er skrivebeskyttet historikk, ikke et nytt arbeidssteg.</li>
      <li>I Salgsgrunnlag finnes raske innganger til opprinnelig forespørsel/befaring, kundens publiserte tilbud og kunde/prosjektdata.</li>
      <li>Den ordinære Befaring/Tilbud-funksjonen er fortsatt tilgjengelig fra Startsiden for nye og aktive salgssaker.</li>
      <li><strong>Arbeidsstatus og åpne avvik vises separat.</strong> Et prosjekt kan for eksempel stå som Pågår samtidig som et eget varsel viser at ett eller flere avvik krever oppfølging.</li>
      <li><strong>Åpne Avvik</strong> går direkte til Avvikssentralen. Nye HMS-/prosjektavvik krever en kort tittel før de opprettes, slik at tomme avvik ikke lagres ved et uhell.</li>
      <li><strong>Prosjektstatus / hva mangler</strong> er kollapset som standard. Fremdriften der følger utførte sjekkpunkter, for eksempel 0 av 54.</li>
      <li>Prosjekter opprettet direkte uten salgssak beholder Befaring/Tilbud som separat funksjon, men den inngår ikke i prosjektets Forrige/Neste-flyt.</li>
    </ul>`;
  quickStart.insertAdjacentElement('afterend', card);
}

function applyProjectWorkflowUx() {
  const nav = getAppNav();
  if (!nav) return;
  const activeProject = Boolean(navButtonForLabel(nav, 'Prosjektoversikt'));
  const salesOrigin = updateStoredSalesOrigin(activeProject);
  const showSalesOrigin = activeProject && Boolean(salesOrigin.requestRef);

  adaptSalesLabel(showSalesOrigin, nav);
  adaptPreviousNext(activeProject, nav);
  adaptPrimaryProjectStatus(activeProject);
  adaptDeviationNavigation(activeProject);
  adaptProjectStatus(activeProject, nav);
  adaptSalesIntro(showSalesOrigin, nav);
  adaptSalesModuleVisibility(showSalesOrigin, nav);
  updateHelp(nav);
}

export function installProjectWorkflowUx() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (window.__expoProjectWorkflowUxInstalled) return true;

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyProjectWorkflowUx();
    });
  };

  document.addEventListener('click', (event) => {
    const clicked = event.target instanceof Element ? event.target.closest('button') : null;
    if (!(clicked instanceof HTMLButtonElement)) return;

    if (clicked.getAttribute('data-expo-open-customer-offer') === '1') {
      const publicToken = getStoredSalesToken();
      if (!publicToken) return;
      const offerUrl = new URL(window.location.pathname || '/', window.location.origin);
      offerUrl.searchParams.set('publicOffer', publicToken);
      window.open(offerUrl.toString(), '_blank', 'noopener,noreferrer');
      return;
    }

    const targetLabel = clicked.getAttribute(TARGET_ATTR) || '';
    if (!targetLabel) return;
    const nav = getAppNav();
    const destination = navButtonForLabel(nav, targetLabel);
    if (!destination) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    destination.click();
  }, true);

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  window.__expoProjectWorkflowUxInstalled = true;
  schedule();
  return true;
}