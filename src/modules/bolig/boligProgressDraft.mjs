// Compare editable fields only; server metadata and revision are not user edits.
const fields = ['id','unit_id','room_id','title','owner_id','planned_start','planned_end','actual_start','actual_end','status','predecessor_id','required','note'];
export const progressDraftSnapshot = task => JSON.stringify(fields.map(key => task?.[key] ?? (key === 'required' ? false : '')));
export function hasProgressEdits(editor, tasks = []) {
  if (!editor) return false;
  const baseline = editor._openedSnapshot;
  if (typeof baseline === 'string') return progressDraftSnapshot(editor) !== baseline;
  // Legacy drafts have no opening snapshot. Preserve anything that differs from
  // the current server task, including deleted tasks and offline/new work.
  const current = tasks.find(task => task.id === editor.id);
  return !current || progressDraftSnapshot(editor) !== progressDraftSnapshot(current);
}
export function progressTaskLocation(task, units = []) {
  const unit = units.find(unit => unit.id === task?.unit_id);
  return [unit?.number || task?.unit_number ? `Bolig ${unit?.number || task?.unit_number}` : 'Bolig ikke valgt', unit?.address || task?.address].filter(Boolean).join(' · ');
}
