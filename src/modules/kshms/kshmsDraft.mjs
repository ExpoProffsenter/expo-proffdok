// Only ordinary company handbook text is cached. Individual HR data/files are out of scope.
export const draftKey = (userId,companyId) => `expo:kshms:draft:v1:${userId}:${companyId}`;
export function readDraft(storage,userId,companyId) {
 try { const value=JSON.parse(storage.getItem(draftKey(userId,companyId)) || 'null');
  return value?.schema===1 && value.userId===userId && value.companyId===companyId && value.draft && typeof value.draft.title==='string' ? value : null;
 } catch { return null; }
}
export function persistDraft(storage,userId,companyId,editor) {
 storage.setItem(draftKey(userId,companyId),JSON.stringify({schema:1,userId,companyId,...editor,savedLocallyAt:new Date().toISOString()}));
}
