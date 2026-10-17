export function checklistResumeEntries(groups, runs, checklist, readDraft, readOnly = false) {
  return groups.map((group, index) => {
    const latest = runs.find(run => run.category === group.category);
    const local = readOnly ? null : readDraft(group.category);
    const hasLocal = local && (local.pendingAction || Object.values(local.answers || {}).some(answer => answer?.status || answer?.comment || answer?.photos?.length));
    const legacyStarted = !latest && Object.values(checklist?.[group.category] || {}).some(answer => answer?.status || answer?.comment || answer?.photos?.length);
    const resumable = !readOnly && Boolean(hasLocal || latest?.status === 'draft' || legacyStarted);
    return { group, resumable, index };
  }).sort((a, b) => Number(b.resumable) - Number(a.resumable) || a.index - b.index);
}

export function firstUnfinishedChecklist(groups, runs, checklist, readDraft, readOnly = false) {
  if (readOnly) return null;
  return checklistResumeEntries(groups, runs, checklist, readDraft).find(({ group, resumable }) =>
    group.items.length > 0 && (resumable || runs.find(run => run.category === group.category)?.status !== 'completed')
  )?.group || null;
}
