// Expo ProffDok – FASE 35A
// Egen datatjeneste for prosjektets operative fremdriftsplan.
// Planen lagres separat fra projects.data slik at vanlig prosjektlagring ikke kan
// overskrive arbeidsøkter. Kunde/UE leser kun via eksisterende portal-RPC.

import { createDefaultSalesSupabaseClient } from '../sales/services/salesSupabase.js';
import {
  readStoredPortalAccessCode,
  verifyProjectPortalAccess,
} from '../portal/portalSupabase.js';

export const EMPTY_PROGRESS_PLAN = Object.freeze({
  version: 1,
  activities: [],
  source: null,
});

export function getProgressSupabaseClient() {
  return createDefaultSalesSupabaseClient();
}

const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

export function normalizeProgressPlan(value = {}) {
  const plan = value && typeof value === 'object' ? value : {};
  return {
    version: 1,
    activities: Array.isArray(plan.activities) ? plan.activities : [],
    source: plan.source && typeof plan.source === 'object' ? plan.source : null,
  };
}

export async function loadInternalProgressPlan(client, projectId) {
  if (!client || !projectId) return { ...EMPTY_PROGRESS_PLAN, customerVisible: false };
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
  if (!client || !projectId) throw new Error('Velg et lagret prosjekt først.');
  const payload = normalizeProgressPlan(plan);
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
  const result = await verifyProjectPortalAccess(client, {
    projectId,
    role: normalizedRole,
    code,
  });
  if (!result?.ok) return unavailable;
  const value = result?.project?.data?.progressPlan;
  if (!value || typeof value !== 'object') return unavailable;
  return {
    ...normalizeProgressPlan(value),
    customerVisible: !!value.customerVisible,
    updatedAt: value.updatedAt || '',
    unavailable: false,
  };
}

function inferTrade(title = '') {
  const value = clean(title).toLowerCase();
  if (value.includes('rør')) return 'Rørlegger';
  if (value.includes('elektr')) return 'Elektriker';
  if (value.includes('mal')) return 'Maler';
  if (value.includes('tømrer') || value.includes('snekker')) return 'Tømrer';
  if (
    value.includes('flis') ||
    value.includes('membran') ||
    value.includes('støp') ||
    value.includes('avrett')
  ) return 'Murer / flislegger';
  if (value.includes('demonter') || value.includes('riving')) return 'Tømrer';
  if (value.includes('tildekk')) return 'Prosjekt / rigg';
  if (value.includes('avfall') || value.includes('rigg')) return 'Prosjekt / rigg';
  return '';
}

function offerMainPostGroups(lines = [], selectedOptions = []) {
  const groups = new Map();
  const add = (item = {}) => {
    if (item?.__companyMeta || item?.__offerTermsMeta) return;
    const id = clean(item?.mainPostId || item?.mainPostTitle || 'ovrige-arbeider');
    const title = clean(item?.mainPostTitle || 'Øvrige arbeider');
    if (!id || !title) return;
    if (!groups.has(id)) groups.set(id, { id, title });
  };
  (Array.isArray(lines) ? lines : []).forEach(add);
  (Array.isArray(selectedOptions) ? selectedOptions : []).forEach(add);
  return Array.from(groups.values());
}

export async function loadAcceptedOfferActivities(client, projectMetaValue = {}) {
  const token = clean(projectMetaValue?.publicToken);
  if (!client || !token) return [];
  const { data, error } = await client.rpc('get_sales_offer_by_token', { token });
  if (error) throw error;
  const offer = data?.offer || {};
  const version = data?.version || {};
  const acceptedPayload = offer?.accepted_payload || {};
  const snapshot = acceptedPayload?.version_snapshot || {};
  const lines = Array.isArray(snapshot?.lines) && snapshot.lines.length
    ? snapshot.lines
    : Array.isArray(version?.lines)
      ? version.lines
      : [];
  const selectedOptions = Array.isArray(acceptedPayload?.selected_options)
    ? acceptedPayload.selected_options
    : [];

  return offerMainPostGroups(lines, selectedOptions).map((group) => ({
    id: crypto.randomUUID(),
    title: group.title,
    trade: inferTrade(group.title),
    resource: '',
    status: 'Ikke startet',
    sessions: [],
    sourceMainPostId: group.id,
  }));
}
