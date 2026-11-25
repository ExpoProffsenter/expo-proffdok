import { deviationForm, validateDeviation, saveDeviation } from '../kshms/kshmsDeviations.mjs';

export const projectDeviationDraftKey = (userId, companyId, projectId) => `expo:project-deviation-draft:v1:${userId}:${companyId}:${projectId}`;
export function newProjectDeviation(id) {
  return { id, type: 'HMS', severity: 'Middels', status: 'Åpent', title: '', description: '', action: '', responsible: '', responsible_id: '', dueDate: '', immediate_action: '', affectsWarranty: false, includeInReport: false, photos: [], createdAt: new Date().toISOString(), closedAt: '', closedBy: '', closeComment: '' };
}
export function projectDeviationForm(entry) {
  return deviationForm({ title: entry.title, event: entry.description, category: ['HMS', 'SHA'].includes(entry.type) ? 'hms' : 'quality', responsible_id: entry.responsible_id, due_on: entry.dueDate, immediate_action: entry.immediate_action });
}
export function readProjectDeviationDraft(storage, key) {
  try {
    const draft = JSON.parse(storage.getItem(key) || 'null');
    if (!draft?.entry?.id || !draft.requestId || !Number.isFinite(draft.savedAt) || Date.now() - draft.savedAt > 7 * 86400000 || draft.savedAt > Date.now() + 60000 || ['title', 'description', 'responsible_id', 'dueDate'].some(field => typeof draft.entry[field] !== 'string')) return null;
    return draft;
  } catch { return null; }
}
export async function createProjectDeviation({ entry, requestId, projectId, context, saveProject, rpc, isCurrent = () => true }) {
  if (entry.title.trim().length < 3 || entry.title.trim().length > 200) throw new Error('Skriv en tittel med 3–200 tegn.');
  const form = projectDeviationForm(entry);
  if (context?.enabled) {
    if (!projectId) throw new Error('Lagre prosjektet før avviket kobles til KS/HMS.');
    const error = validateDeviation(form);
    if (error) throw new Error(error);
  }
  // Persist and verify the source before asking the existing KS/HMS command to link it.
  const source = await saveProject(entry);
  if (!isCurrent()) return null;
  if (!source || source.id !== entry.id) throw new Error('Prosjektavviket kunne ikke bekreftes lagret. Kladden er beholdt.');
  if (!context?.enabled) return { entry: source, case: null };
  const detail = await saveDeviation({ rpc, companyId: context.company_id, userId: context.user_id, action: 'create', payload: { ...form, request_id: requestId, project_id: projectId, source_kind: 'project', source_key: entry.id }, isCurrent });
  if (!detail) return null;
  const row = detail.case;
  if (row.project_id !== projectId || row.source_kind !== 'project' || row.source_key !== entry.id || row.responsible_id !== form.responsible_id || row.title !== form.title.trim() || row.event !== form.event.trim() || row.due_on !== form.due_on || row.immediate_action !== form.immediate_action) {
    throw Object.assign(new Error('Den lagrede koblingen har andre opplysninger. Kladden er beholdt. Åpne den lagrede saken og sammenlign før du endrer.'), { caseId: row.id });
  }
  return { entry: source, case: row };
}
