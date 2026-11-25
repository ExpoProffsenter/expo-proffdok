import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";

export const isFreeText = line => line?.freeTextBlock === true;

// Keep text attached to a stable post while existing builders regroup their lines.
export function arrangeFreeText(lines = []) {
  const ordinary = lines.filter(line => !isFreeText(line));
  const blocks = lines.filter(isFreeText);
  const result = [];
  const append = (anchor, post) => blocks.filter(b => String(b.freeTextAfterId || '') === anchor).forEach(b => result.push({
    ...b,
    mainPostId: post?.mainPostId || b.mainPostId,
    mainPostTitle: post?.mainPostTitle || b.mainPostTitle,
  }));
  const posts = ordinary.filter(line => !line.__companyMeta && !line.__offerTermsMeta && !line.__storeOfferMeta);
  const rank = line => { const n = OFFER_MAIN_POSTS.findIndex(p => p.id === line.mainPostId); return n < 0 ? Number.MAX_SAFE_INTEGER : n; };
  const first = [...posts].sort((a,b) => rank(a) - rank(b))[0];
  append('', first);
  ordinary.forEach(line => { result.push(line); append(String(line.id), line); });
  blocks.filter(b => b.freeTextAfterId && !ordinary.some(line => String(line.id) === b.freeTextAfterId)).forEach(b => result.push(b));
  return result;
}

export function freeTextLines(lines, blocks) {
  return arrangeFreeText([
    ...lines.filter(line => !isFreeText(line)),
    ...blocks.map(b => ({ id: b.id, lineType: 'store_text', freeTextBlock: true,
      freeTextAfterId: b.after, storeTextTitle: b.title, storeTextBody: b.text,
      description: [b.title, b.text].filter(Boolean).join('\n'),
      productUrl: '#expo-store-text-block', amount: '0', quantity: '0', unit: '',
      mainPostId: lines.find(l => l.id === b.id)?.mainPostId,
      mainPostTitle: lines.find(l => l.id === b.id)?.mainPostTitle,
    })),
  ]);
}
