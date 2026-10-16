// Expo ProffDok – FASE 35A
// Forenklet fremdriftsplan for håndverksprosjekter.
// - Akseptert tilbud kan brukes som arbeidsgrunnlag.
// - Prosjekt uten tilbud kan bruke samme standard hovedposter som tilbudsbyggeren.
// - Egne arbeidsoperasjoner kan alltid legges til.
// - Hver arbeidsoperasjon kan ha flere separate tider gjennom prosjektet.
// - UE ser planen read-only. Kunde ser den bare når bedriften deler den.

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  getProgressSupabaseClient,
  isProgressSafePreviewMode,
  loadAcceptedOfferActivities,
  loadInternalProgressPlan,
  loadInternalProgressProjectMeta,
  loadPortalProgressPlan,
  resolveInternalProgressProject,
  saveInternalProgressPlan,
} from './progressPlanSupabase.js';
import { ProgressPlanWorkspace as SharedProgressPlanWorkspace, PROGRESS_PLAN_STYLES } from './ProgressPlanWorkspace.jsx';
export { PROGRESS_PLAN_STYLES } from './ProgressPlanWorkspace.jsx';
const STYLE_TEXT = PROGRESS_PLAN_STYLES;
const ROOT_ID = 'expo-progress-plan-root';
const NAV_ATTR = 'data-expo-progress-nav';
const MOBILE_ATTR = 'data-expo-progress-mobile';
const SALES_REF_KEY = 'expoProffDokCurrentProjectSalesRef';
const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();
const lower = (value = '') => clean(value).toLowerCase();
const PROJECT_SERVICES = {
  getProgressSupabaseClient, isProgressSafePreviewMode, loadAcceptedOfferActivities,
  loadInternalProgressPlan, loadInternalProgressProjectMeta, loadPortalProgressPlan,
  resolveInternalProgressProject, saveInternalProgressPlan,
};
export function ProgressPlanWorkspace(props) {
  return <SharedProgressPlanWorkspace {...props} services={PROJECT_SERVICES}/>;
}

export function ProgressPlanProjectTab({ projectId, onDirtyChange }) {
  useEffect(() => { ensureStyle(); }, []);
  if (!projectId) return null;
  return (
    <div id={ROOT_ID}>
      <ProgressPlanWorkspace
        mode="internal"
        identity=""
        requestRef=""
        projectId={projectId}
        role="internal"
        onDirtyChange={onDirtyChange}
      />
    </div>
  );
}

let installed = false;
let active = false;
let reactRoot = null;
let currentDirty = false;
let portalAvailability = null;
let portalAvailabilityContext = '';
let availabilityBusy = false;
let observer = null;
let observerTimer = null;
let desktopButton = null;

function modeFromLocation() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('project')) return 'internal';
  const role = lower(params.get('role') || params.get('access') || '');
  if (role === 'underleverandor' || role === 'underleverandør' || role === 'underentreprenør') return 'underleverandor';
  if (role === 'admin') return 'internal';
  return 'customer';
}

function portalProjectId() {
  return clean(new URLSearchParams(window.location.search).get('project') || '');
}

function projectIdentity() {
  return clean(
    document.querySelector('.mobileCurrentProjectBar span')?.textContent ||
    document.querySelector('.mobileProjectLineText span')?.textContent ||
    document.querySelector('header .head p')?.textContent ||
    document.querySelector('.projectOverviewQuickStart strong')?.textContent ||
    ''
  );
}

function currentSalesRef() {
  try { return clean(window.sessionStorage.getItem(SALES_REF_KEY) || ''); }
  catch { return ''; }
}

function findNav(mode) {
  const navs = Array.from(document.querySelectorAll('nav'));
  if (mode === 'customer') {
    return navs.find((nav) => {
      const labels = Array.from(nav.querySelectorAll('button')).map((button) => clean(button.textContent));
      return labels.includes('Oversikt') && labels.includes('Rapport') && labels.includes('Dokumentasjon');
    }) || null;
  }
  if (mode === 'underleverandor') {
    return navs.find((nav) => {
      const labels = Array.from(nav.querySelectorAll('button')).map((button) => clean(button.textContent));
      return labels.includes('Prosjektinformasjon') && labels.includes('Sjekklister');
    }) || null;
  }
  return navs.find((nav) => {
    const labels = Array.from(nav.querySelectorAll('button')).map((button) => clean(button.textContent));
    return labels.includes('Prosjektoversikt') && labels.includes('Prosjektering') && labels.includes('Sjekklister');
  }) || null;
}

async function refreshPortalAvailability(mode) {
  if (mode === 'internal' || availabilityBusy) return;
  const projectId = portalProjectId();
  if (!projectId) return;
  const context = `${mode}:${projectId}`;
  if (context !== portalAvailabilityContext) {
    portalAvailabilityContext = context;
    portalAvailability = null;
  }
  availabilityBusy = true;
  try { portalAvailability = await loadPortalProgressPlan(getProgressSupabaseClient(), projectId, mode); }
  catch { portalAvailability = null; }
  finally { availabilityBusy = false; scheduleAdapt(0); }
}

function shouldShowNav(mode) {
  if (mode === 'internal') return !!findNav('internal') || !!document.querySelector('.mobileCurrentProjectBar');
  if (mode === 'underleverandor') return true;
  return !!portalAvailability?.customerVisible;
}

function ensureStyle() {
  if (document.getElementById('expo-progress-plan-style')) return;
  const style = document.createElement('style');
  style.id = 'expo-progress-plan-style';
  style.textContent = STYLE_TEXT;
  document.head.append(style);
}

function ensureRoot() {
  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.style.display = 'none';
    document.body.append(root);
  }
  if (!reactRoot) reactRoot = createRoot(root);
  return root;
}

function setNativeMainVisible(visible) {
  const main = document.querySelector('#root main');
  if (main instanceof HTMLElement) main.style.display = visible ? '' : 'none';
}

function renderActiveWorkspace() {
  if (!active) return;
  const mode = modeFromLocation();
  const root = ensureRoot();
  root.style.display = '';
  setNativeMainVisible(false);
  reactRoot.render(
    <ProgressPlanWorkspace
      mode={mode}
      identity={projectIdentity()}
      requestRef={currentSalesRef()}
      projectId={portalProjectId()}
      role={mode}
      onDirtyChange={(value) => { currentDirty = !!value; }}
    />
  );
}

function openProgressPlan(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  active = true;
  currentDirty = false;
  ensureRoot();
  renderActiveWorkspace();
  adaptNavigation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeProgressPlan({ force = false } = {}) {
  if (!active) return true;
  if (!force && currentDirty && !window.confirm('Du har ulagrede endringer i fremdriftsplanen. Gå videre uten å lagre?')) return false;
  active = false;
  currentDirty = false;
  ensureRoot().style.display = 'none';
  setNativeMainVisible(true);
  adaptNavigation();
  return true;
}

function makeProgressButton({ mobile = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = mobile ? '📅 Fremdrift' : 'Fremdrift';
  button.setAttribute(mobile ? MOBILE_ATTR : NAV_ATTR, '1');
  if (mobile) button.className = 'secondary';
  button.addEventListener('click', openProgressPlan);
  return button;
}

function injectDesktopNav(mode) {
  const nav = findNav(mode);
  if (!nav) return;
  const show = shouldShowNav(mode);
  if (!show) {
    desktopButton?.remove();
    if (active && mode === 'customer') closeProgressPlan({ force: true });
    return;
  }
  if (!desktopButton) desktopButton = makeProgressButton();
  const targetLabel = mode === 'internal' ? 'Prosjektering' : mode === 'underleverandor' ? 'Prosjektinformasjon' : 'Oversikt';
  const target = Array.from(nav.querySelectorAll('button')).find((candidate) => clean(candidate.textContent) === targetLabel);
  if (desktopButton.parentElement !== nav || target?.nextSibling !== desktopButton) {
    if (target?.nextSibling) nav.insertBefore(desktopButton, target.nextSibling);
    else nav.append(desktopButton);
  }
  desktopButton.classList.toggle('on', active);
  if (active) {
    Array.from(nav.querySelectorAll('button.on')).forEach((candidate) => {
      if (candidate !== desktopButton) candidate.classList.remove('on');
    });
  }
}

function injectMobileShortcut(mode) {
  document.querySelectorAll(`button[${MOBILE_ATTR}="1"]`).forEach((button) => button.remove());
  if (mode !== 'internal' || !shouldShowNav(mode)) return;
  const actions = document.querySelector('.mobileCurrentProjectActions');
  if (!actions) return;
  actions.append(makeProgressButton({ mobile: true }));
}

function adaptNavigation() {
  ensureStyle();
  const mode = modeFromLocation();
  const context = mode === 'internal' ? '' : `${mode}:${portalProjectId()}`;
  if (mode !== 'internal' && context !== portalAvailabilityContext) {
    portalAvailabilityContext = context;
    portalAvailability = null;
  }
  if (mode !== 'internal' && portalAvailability === null && !availabilityBusy) refreshPortalAvailability(mode);
  injectDesktopNav(mode);
  injectMobileShortcut(mode);
  if (active) {
    setNativeMainVisible(false);
    ensureRoot().style.display = '';
  }
}

function scheduleAdapt(delay = 40) {
  if (observerTimer) window.clearTimeout(observerTimer);
  observerTimer = window.setTimeout(adaptNavigation, delay);
}

export function installProgressPlanUx() {
  if (typeof document === 'undefined' || modeFromLocation() === 'internal') return;
  if (installed) return;
  installed = true;
  ensureStyle();
  ensureRoot();

  document.addEventListener('click', (event) => {
    if (!active) return;
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!(target instanceof HTMLButtonElement)) return;
    if (target.hasAttribute(NAV_ATTR) || target.hasAttribute(MOBILE_ATTR)) return;
    if (!target.closest('nav') && !target.closest('.mobileCurrentProjectActions') && !target.closest('.mobileMenuQuickGrid') && !target.closest('.mobileSectionChips')) return;
    const closed = closeProgressPlan();
    if (!closed) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  observer = new MutationObserver(() => scheduleAdapt());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleAdapt(0);
}
