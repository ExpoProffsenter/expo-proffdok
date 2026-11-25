// Expo ProffDok – FASE 35A
// Ren transformasjon fra låst/akseptert tilbud til forslag i fremdriftsplanen.
// Ingen Supabase, DOM eller lagring her. Det gjør logikken enkel å teste mot realistiske fixtures.

const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

export function inferProgressTrade(title = '') {
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

function fallbackIdFactory() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `progress-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function addGroup(groups, item = {}, { selectedOption = false } = {}) {
  if (item?.__companyMeta || item?.__offerTermsMeta) return;
  const sourceMainPostId = clean(item?.mainPostId || item?.mainPostTitle || 'ovrige-arbeider');
  const title = clean(item?.mainPostTitle || 'Øvrige arbeider');
  if (!sourceMainPostId || !title) return;

  const key = sourceMainPostId.toLowerCase();
  const current = groups.get(key) || {
    sourceMainPostId,
    title,
    sourceOptionTitles: [],
  };

  if (selectedOption) {
    const optionTitle = clean(item?.title || item?.description || 'Valgt opsjon');
    if (optionTitle && !current.sourceOptionTitles.includes(optionTitle)) {
      current.sourceOptionTitles.push(optionTitle);
    }
  }
  groups.set(key, current);
}

export function buildAcceptedOfferProgressActivities({
  lines = [],
  selectedOptions = [],
  idFactory = fallbackIdFactory,
} = {}) {
  const groups = new Map();
  (Array.isArray(lines) ? lines : []).forEach((item) => addGroup(groups, item));
  (Array.isArray(selectedOptions) ? selectedOptions : []).forEach((item) =>
    addGroup(groups, item, { selectedOption: true })
  );

  return Array.from(groups.values()).map((group) => ({
    id: idFactory(),
    title: group.title,
    trade: inferProgressTrade(group.title),
    resource: '',
    status: 'Ikke startet',
    sessions: [],
    sourceMainPostId: group.sourceMainPostId,
    ...(group.sourceOptionTitles.length
      ? { sourceOptionTitles: [...group.sourceOptionTitles] }
      : {}),
  }));
}

export function extractAcceptedOfferProgressInput(data = {}) {
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
  return { lines, selectedOptions };
}
