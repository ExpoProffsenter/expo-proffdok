export function cleanOfferText(blocks = [], postCount = Infinity) {
  return blocks.filter(b => String(b.title || '').trim() || String(b.text || '').trim()).map(b => ({
    ...b, after: Math.min(Number(b.after || 0), postCount),
  }));
}

// Draft positions follow the selected goods key while goods are edited. The
// immutable snapshot still stores a simple position in its own frozen list.
export function repositionOfferText(blocks = [], previousGoods = [], nextGoods = []) {
  const positions = new Map(nextGoods.map((g, i) => [g.key, i + 1]));
  return blocks.map(block => {
    const slot = Number(block.after || 0);
    if (!slot) return { ...block, after: 0 };
    // If the anchor is deleted, keep the text at that gap: after the nearest
    // preceding surviving item, or before the first item. Never attach it to
    // the item that happens to inherit the old row number.
    for (let i = Math.min(slot, previousGoods.length) - 1; i >= 0; i--) {
      const next = positions.get(previousGoods[i].key);
      if (next !== undefined) return { ...block, after: next };
    }
    return { ...block, after: 0 };
  });
}
