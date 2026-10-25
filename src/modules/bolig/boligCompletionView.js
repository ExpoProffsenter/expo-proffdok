// Actual handover and internal quality approval are independent records.
export const isHandedOver = (row) =>
  !!row.manager_handover ||
  ["handed_over", "handed_over_with_rest"].includes(row.status);

export const internalControlStatus = (row) =>
  row.manager_handover ? row.control_status || "not_started" : row.status;

const compareTitle = (a, b) =>
  a.localeCompare(b, "nb", { numeric: true });

export const completionOrder = (rows) =>
  [...rows].sort((a, b) =>
    Number(isHandedOver(a)) - Number(isHandedOver(b)) ||
    compareTitle(a.title, b.title),
  );

export function nextOpenUnit(rows, currentId) {
  const scopes = new Map(rows.map((r) => [r.scope_id, r]));
  const units = rows
    .filter((r) => r.kind === "unit" && !r.source?.restricted)
    .sort((a, b) =>
      compareTitle(scopes.get(a.parent_id)?.title || "", scopes.get(b.parent_id)?.title || "") ||
      compareTitle(a.title, b.title),
    );
  const at = units.findIndex((r) => r.scope_id === currentId);
  if (at < 0) return null;
  return [...units.slice(at + 1), ...units.slice(0, at)].find(
    (r) => !isHandedOver(r),
  ) || null;
}
