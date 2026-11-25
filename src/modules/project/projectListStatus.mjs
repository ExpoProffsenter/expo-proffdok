// Presentation filters only. The original status and project data are unchanged.
export const isActiveProjectStatus = tone => !['done', 'locked'].includes(tone);
export const isArchivedProjectStatus = tone => ['done', 'locked'].includes(tone);
export function matchesProjectStatus(tone, filter) {
  if (filter === 'alle') return true;
  if (filter === 'active') return isActiveProjectStatus(tone);
  if (filter === 'archive') return isArchivedProjectStatus(tone);
  return tone === filter;
}
