// Selection is frozen to explicit unit IDs. A refresh must never silently add recipients.
export function selectNoticeBuildings(units, blockIds) {
  const chosen = new Set(blockIds);
  return [...new Set(units.filter(u => chosen.has(u.block_id)).map(u => u.id))];
}
export function noticeBuildingsLabel(units, blockIds) {
  const chosen = new Set(blockIds);
  const names = [...new Map(units.filter(u => chosen.has(u.block_id)).map(u => [u.block_id, u.block_name])).values()];
  const label = names.join(", ");
  return !names.length ? "Velg bygg" : label.length <= 240 ? label : `${names.length} valgte bygg`;
}
