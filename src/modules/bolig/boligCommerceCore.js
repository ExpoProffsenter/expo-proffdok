export const agreementMoney = cents => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" }).format(Number(cents || 0) / 100);
export function osloDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  return ["year", "month", "day"].map(type => parts.find(p => p.type === type).value).join("-");
}
export function acceptanceDate(expiresAt) {
  if (expiresAt) return osloDate(new Date(expiresAt).getTime() - 1);
  const date = new Date(`${osloDate()}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}
export const acceptanceDeadline = expiresAt => new Date(new Date(expiresAt).getTime() - 1).toLocaleString("nb-NO", { timeZone: "Europe/Oslo", dateStyle: "long", timeStyle: "short" });
export function goodsDiff(before = [], after = []) {
  const old = new Map(before.map(g => [g.key, g]));
  const next = new Map(after.map(g => [g.key, g]));
  return [...new Set([...old.keys(), ...next.keys()])].flatMap(key => {
    const a = old.get(key), b = next.get(key);
    if (a && b && JSON.stringify(a) === JSON.stringify(b)) return [];
    return [{ key, before: a || null, after: b || null }];
  });
}

export function agreementOverview(documents = []) {
  const ordered = [...documents].sort((a,b) => String(b.created_at).localeCompare(String(a.created_at)) || b.version-a.version);
  const live = d => !["revoked","superseded","declined","expired"].includes(d.status);
  const choices = ordered.filter(d => d.kind === "choice");
  const choice = choices.find(d => d.status === "accepted") || choices.find(live) || null;
  const groups = new Set();
  const changes = ordered.filter(d => d.kind === "change" && live(d)).filter(d => {
    const key = d.snapshot?.order_id || d.snapshot?.order_number || d.group_id || d.id;
    if (groups.has(key)) return false;
    const accepted = ordered.find(x => x.kind === "change" && (x.group_id || x.id) === (d.group_id || d.id) && ["accepted","handled"].includes(x.status));
    if (accepted && accepted.id !== d.id) return false;
    groups.add(key); return true;
  });
  const shown = new Set([choice?.id,...changes.map(d=>d.id)]);
  return { choice, changes, history: ordered.filter(d=>!shown.has(d.id)) };
}

// Supplier quantities are deltas, including a separate credit line for a replacement.
export function supplierDelta(before = [], after = []) {
  const rows = [];
  const identity = g => JSON.stringify([g.sku,g.name,g.unit]);
  for (const row of goodsDiff(before,after)) {
    const a = row.before, b = row.after;
    if (a && b && identity(a) === identity(b)) {
      const quantity = Math.round((Number(b.quantity)-Number(a.quantity))*1000)/1000;
      if (quantity) rows.push({...b,quantity});
    } else {
      if (a) rows.push({...a,quantity:-Number(a.quantity)});
      if (b) rows.push({...b,quantity:Number(b.quantity)});
    }
  }
  return rows;
}
