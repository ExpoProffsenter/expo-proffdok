import React from "react";
import CustomerTextBlocksEditor from './CustomerTextBlocksEditor.jsx';
import { freeTextLines, isFreeText } from '../utils/offerFreeText.js';

export default function SalesFreeTextEditor({ lines = [], onChange }) {
  return <CustomerTextBlocksEditor
    blocks={lines.filter(isFreeText).map(l => ({ id: l.id, title: l.storeTextTitle || '', text: l.storeTextBody || '', after: l.freeTextAfterId || '' }))}
    posts={lines.filter(l => !isFreeText(l) && !l.__companyMeta && !l.__offerTermsMeta && !l.__storeOfferMeta).map(l => ({ id: String(l.id), title: l.storeTextTitle || l.description }))}
    onChange={blocks => onChange(freeTextLines(lines, blocks))}
  />;
}
