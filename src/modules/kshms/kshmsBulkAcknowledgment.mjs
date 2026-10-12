export const BATCH_ACK_STATEMENT = 'Jeg bekrefter at jeg har lest og forstått alle rutineutgavene i listen, forstår mitt ansvar og vil følge rutinene. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen gjelder min egen gjennomgang av de oppførte utgavene; den erstatter ikke opplæring eller faktisk utførelse.';

export function acknowledgmentScope(state, companyId, userId) {
 return state?.context?.enabled === true && state.context.company_id === companyId && state.context.user_id === userId;
}

// All active assigned editions, including an informational edition. A search
// filter, a management role and another person's receipt never affect this set.
export function batchAcknowledgmentVersions(state, companyId, userId) {
 if (!acknowledgmentScope(state, companyId, userId)) return [];
 const active = new Set(state.routines.filter(row => !row.archived).map(row => row.id));
 const assigned = new Set(state.assignments.filter(row => row.user_id === userId).map(row => row.version_id));
 const confirmed = new Set(state.acknowledgments.filter(row => row.user_id === userId).map(row => row.version_id));
 return state.versions.filter(row => active.has(row.routine_id) && assigned.has(row.id) && !confirmed.has(row.id))
  .sort((a,b) => a.content.title.localeCompare(b.content.title, 'nb-NO') || b.number - a.number || a.id.localeCompare(b.id));
}

export const batchVersionKey = versions => JSON.stringify(versions.map(row => row.id).sort());

export function verifiedBatchReceipts(state, companyId, userId, versionIds) {
 if (!acknowledgmentScope(state, companyId, userId) || !versionIds.length) return null;
 const own = new Map(state.acknowledgments.filter(row => row.user_id === userId).map(row => [row.version_id,row]));
 const receipts = versionIds.map(id => own.get(id));
 return receipts.every(row => row && Number.isFinite(new Date(row.acknowledged_at).getTime())) ? receipts : null;
}
