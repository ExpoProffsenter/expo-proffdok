// Expo ProffDok – FASE 35A
// Egen datatjeneste for prosjektets operative fremdriftsplan.
// Planen lagres separat fra projects.data slik at vanlig prosjektlagring ikke kan
// overskrive arbeidsøkter. Kunde/UE leser kun via eksisterende portal-RPC.
// Preview kan kjøres i eksplisitt trygg testmodus der fremdriftsplanen kun lagres lokalt.

import { createDefaultSalesSupabaseClient } from '../sales/services/salesSupabase.js';
import {
  readStoredPortalAccessCode,
  verifyProjectPortalAccess,
} from '../portal/portalSupabase.js';
import {
  buildAcceptedOfferProgressActivities,
  extractAcceptedOfferProgressInput,
} from './progressPlanOfferCore.js';

export const EMPTY_PROGRESS_PLAN = Object.freeze({
  version: 1,
  activities: [],
  source: null,
});

const SAFE_PREVIEW_PARAM = 'progressTest';
const SAFE_PREVIEW_VALUES = new Set(['safe', 'andreas']); // «andreas» beholdes kun for eksisterende Preview-lenker i 35A-QA.
const SAFE_PREVIEW_STORAGE_PREFIX = 'expoProffDokProgressSafePreview:';
const SAFE_PREVIEW_BADGE_ID = 'expo-progress-safe-preview-badge';

const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

export function isProgressSafePreviewMode() {
  if (typeof window === 'undefined') return false;
  const host = String(window.location.hostname || '').toLowerCase();
  const isPreviewHost = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
  if (!isPreviewHost) return false;
  const params = new URLSearchParams(window.location.search);
  return SAFE_PREVIEW_VALUES.has(clean(params.get(SAFE_PREVIEW_PARAM) || '').toLowerCase());
}

function ensureSafePreviewBadge() {
  if (!isProgressSafePreviewMode() || typeof document === 'undefined') return;
  if (document.getElementById(SAFE_PREVIEW_BADGE_ID)) return;
  const badge = document.createElement('div');
  badge.id = SAFE_PREVIEW_BADGE_ID;
  badge.textContent = 'TRYGG TESTMODUS · Fremdriftsplan lagres kun i denne nettleseren';
  Object.assign(badge.style, {
    position: 'fixed',
    right: '14px',
    bottom: '14px',
    zIndex: '100001',
    maxWidth: '360px',
    padding: '10px 13px',
    borderRadius: '999px',
    background: '#fff7d6',
    border: '1px solid #e5b83c',
    color: '#674d00',
    font: '800 12px/1.3 Inter, system-ui, sans-serif',
    boxShadow: '0 10px 28px rgba(41,34,8,.18)',
  });
  document.body.append(badge);
}

function safePreviewStorageKey(projectId = '') {
  const id = clean(projectId);
  return id ? `${SAFE_PREVIEW_STORAGE_PREFIX}${id}` : '';
}

function hasSafePreviewLocalPlan(projectId = '') {
  if (typeof window === 'undefined') return false;
  const host = String(window.location.hostname || '').toLowerCase();
  const isPreviewHost = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
  if (!isPreviewHost) return false;
  const key = safePreviewStorageKey(projectId);
  if (!key) return false;
  try {
    return !!window.localStorage.getItem(key);
  } catch {
    return false;
  }
}

function readSafePreviewPlan(projectId = '') {
  const key = safePreviewStorageKey(projectId);
  if (!key || typeof window === 'undefined') return null;
  ensureSafePreviewBadge();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeSafePreviewPlan(projectId = '', plan = {}, customerVisible = false) {
  const key = safePreviewStorageKey(projectId);
  if (!key || typeof window === 'undefined') throw new Error('Kunne ikke opprette lokal testkopi.');
  ensureSafePreviewBadge();
  const saved = {
    plan: normalizeProgressPlan(plan),
    customerVisible: !!customerVisible,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(key, JSON.stringify(saved));
  return saved;
}

export function getProgressSupabaseClient() {
  ensureSafePreviewBadge();
  return createDefaultSalesSupabaseClient();
}

export function normalizeProgressPlan(value = {}) {
  const plan = value && typeof value === 'object' ? value : {};
  return {
    version: 1,
    activities: Array.isArray(plan.activities) ? plan.activities : [],
    source: plan.source && typeof plan.source === 'object' ? plan.source : null,
  };
}

export async function loadInternalProgressPlan(client, projectId) {
  if (!projectId) return { ...EMPTY_PROGRESS_PLAN, customerVisible: false };
  if (isProgressSafePreviewMode()) {
    const local = readSafePreviewPlan(projectId);
    return {
      ...normalizeProgressPlan(local?.plan || EMPTY_PROGRESS_PLAN),
      customerVisible: !!local?.customerVisible,
      updatedAt: local?.updatedAt || '',
      exists: !!local,
      localOnly: true,
    };
  }
  if (!client) return { ...EMPTY_PROGRESS_PLAN, customerVisible: false };
  const { data, error } = await client
    .from('project_progress_plans')
    .select('project_id,customer_visible,plan,updated_at')
    .eq('project_id', projectId)
    .maybeSingle();
  if (error) throw error;
  return {
    ...normalizeProgressPlan(data?.plan || EMPTY_PROGRESS_PLAN),
    customerVisible: !!data?.customer_visible,
    updatedAt: data?.updated_at || '',
    exists: !!data,
  };
}

export async function saveInternalProgressPlan(client, projectId, plan, customerVisible = false) {
  if (!projectId) throw new Error('Velg et lagret prosjekt først.');
  const payload = normalizeProgressPlan(plan);
  if (isProgressSafePreviewMode()) {
    const saved = writeSafePreviewPlan(projectId, payload, customerVisible);
    return {
      ...normalizeProgressPlan(saved.plan),
      customerVisible: !!saved.customerVisible,
      updatedAt: saved.updatedAt,
      exists: true,
      localOnly: true,
    };
  }
  if (!client) throw new Error('Datatilkobling mangler.');
  const { data, error } = await client
    .from('project_progress_plans')
    .upsert(
      {
        project_id: projectId,
        customer_visible: !!customerVisible,
        plan: payload,
      },
      { onConflict: 'project_id' }
    )
    .select('project_id,customer_visible,plan,updated_at')
    .single();
  if (error) throw error;
  return {
    ...normalizeProgressPlan(data?.plan),
    customerVisible: !!data?.customer_visible,
    updatedAt: data?.updated_at || '',
    exists: true,
  };
}

function projectMeta(row = {}) {
  const project = row?.data?.project || {};
  const salesOrigin = project?.salesOrigin || {};
  return {
    id: String(row?.id || ''),
    title: clean(project?.projectName || row?.title || project?.address || 'Prosjekt'),
    address: clean(project?.address || ''),
    customer: clean(project?.customer || project?.customerName || ''),
    requestRef: clean(salesOrigin?.requestRef || ''),
    publicToken: clean(salesOrigin?.publicToken || ''),
    projectDate: clean(project?.date || ''),
    locked: !!row?.locked,
  };
}

export async function loadInternalProgressProjectMeta(client, projectId) {
  const id = clean(projectId);
  if (!client || !id) return null;
  const { data, error } = await client
    .from('projects')
    .select('id,title,data,locked,updated_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? { row: data, ...projectMeta(data) } : null;
}

export async function listAccessibleProgressProjects(client) {
  if (!client) return [];
  const { data, error } = await client
    .from('projects')
    .select('id,title,data,locked,updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map((row) => ({ row, ...projectMeta(row) }));
}

export async function resolveInternalProgressProject(client, { identity = '', requestRef = '' } = {}) {
  const projects = await listAccessibleProgressProjects(client);
  const wantedRef = clean(requestRef).toLowerCase();
  if (wantedRef) {
    const byRef = projects.filter((item) => item.requestRef.toLowerCase() === wantedRef);
    if (byRef.length === 1) return { project: byRef[0], candidates: byRef, resolvedBy: 'sales-ref' };
  }

  const wantedIdentity = clean(identity).toLowerCase();
  const byIdentity = wantedIdentity
    ? projects.filter((item) =>
        [item.title, item.address, clean(item.row?.title)]
          .filter(Boolean)
          .some((value) => value.toLowerCase() === wantedIdentity)
      )
    : [];

  if (byIdentity.length === 1) {
    return { project: byIdentity[0], candidates: byIdentity, resolvedBy: 'identity' };
  }
  return {
    project: null,
    candidates: byIdentity.length ? byIdentity : projects,
    resolvedBy: byIdentity.length > 1 ? 'ambiguous' : 'unresolved',
  };
}

export async function loadPortalProgressPlan(client, projectId, role) {
  const normalizedRole = role === 'underleverandor' ? 'underleverandor' : 'kunde';
  const unavailable = {
    ...EMPTY_PROGRESS_PLAN,
    customerVisible: false,
    updatedAt: '',
    unavailable: true,
  };
  const code = readStoredPortalAccessCode(projectId, normalizedRole);
  if (!projectId || !code) return unavailable;

  // Også i trygg Preview-test beholder vi eksisterende portalverifisering.
  // RPC-en leser prosjekt/tilgang, mens selve fremdriftsplanen hentes lokalt i testmodusen.
  const result = await verifyProjectPortalAccess(client, {
    projectId,
    role: normalizedRole,
    code,
  });
  if (!result?.ok) return unavailable;

  if (isProgressSafePreviewMode() || hasSafePreviewLocalPlan(projectId)) {
    const local = readSafePreviewPlan(projectId);
    if (!local) return unavailable;
    return {
      ...normalizeProgressPlan(local.plan),
      customerVisible: !!local.customerVisible,
      updatedAt: local.updatedAt || '',
      unavailable: false,
      localOnly: true,
    };
  }

  const value = result?.project?.data?.progressPlan;
  if (!value || typeof value !== 'object') return unavailable;
  return {
    ...normalizeProgressPlan(value),
    customerVisible: !!value.customerVisible,
    updatedAt: value.updatedAt || '',
    unavailable: false,
  };
}

export async function loadAcceptedOfferActivities(client, projectMetaValue = {}) {
  // Trygg Preview skal aldri lese et ekte tilbudsgrunnlag eller skrive fremdriftsdata server-side.
  // Tilbudsimporten verifiseres separat med syntetisk grunnlag i critical-progress-plan-check.mjs.
  if (isProgressSafePreviewMode()) return [];

  const token = clean(projectMetaValue?.publicToken);
  if (!client || !token) return [];
  const { data, error } = await client.rpc('get_sales_offer_by_token', { token });
  if (error) throw error;
  const input = extractAcceptedOfferProgressInput(data || {});
  return buildAcceptedOfferProgressActivities(input);
}
