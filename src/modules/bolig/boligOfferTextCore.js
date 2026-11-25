export function cleanOfferText(blocks = [], postCount = Infinity) {
  return blocks.filter(b => String(b.title || '').trim() || String(b.text || '').trim()).map(b => ({
    ...b, after: Math.min(Number(b.after || 0), postCount),
  }));
}
