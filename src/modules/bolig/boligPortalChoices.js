export function combinedPortalChoice(data, ids = []) {
  const base = data.offers.find(o => o.id === data.combine_base_id);
  if (!base) return null;
  const offers = ids.map(id => data.offers.find(o => o.id === id));
  if (offers.some(o => !o || o.id === base.id) || new Set(ids).size !== ids.length) return null;
  const prices = new Map(), replaced = new Map(), added = new Map();
  const baseline = new Set(base.goods.map(g => g.key));
  for (const offer of offers) {
    for (const item of offer.price_details || []) {
      if (prices.has(item.id)) continue;
      const prefix = item.id.slice(0, item.id.lastIndexOf('/') + 1);
      if (item.replace_key) {
        const key = prefix + item.replace_key;
        if (replaced.has(key)) return { conflict: 'To valgte alternativer erstatter samme vare. Velg ett av dem.' };
        replaced.set(key, item.id);
      }
      prices.set(item.id, item);
    }
    offer.goods.filter(g => !baseline.has(g.key)).forEach(g => added.set(g.key, g));
  }
  return {
    id: base.id, title: offers.length ? offers.map(o => o.title).join(' + ') : base.title,
    total_cents: [...prices.values()].reduce((sum, o) => sum + Number(o.net_cents), 0),
    goods: [...base.goods.filter(g => !replaced.has(g.key)), ...added.values()],
    price_details: [...prices.values()], selected_offer_ids: ids,
  };
}
