export const agreementMoney = cents => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" }).format(Number(cents || 0) / 100);
export function goodsDiff(before = [], after = []) {
  const old = new Map(before.map(g => [g.key, g]));
  const next = new Map(after.map(g => [g.key, g]));
  return [...new Set([...old.keys(), ...next.keys()])].flatMap(key => {
    const a = old.get(key), b = next.get(key);
    if (a && b && JSON.stringify(a) === JSON.stringify(b)) return [];
    return [{ key, before: a || null, after: b || null }];
  });
}
