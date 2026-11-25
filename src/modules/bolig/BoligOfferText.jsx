import React from "react";
import CustomerTextBlocksEditor from '../sales/components/CustomerTextBlocksEditor.jsx';

export function BoligOfferTextEditor({ blocks = [], goods = [], onChange }) {
  return <CustomerTextBlocksEditor blocks={blocks.map(b => ({ ...b, after: Number(b.after) ? String(b.after) : '' }))}
    posts={goods.map((g, i) => ({ id: String(i + 1), title: g.name }))}
    maxLength={20000} onChange={onChange}/>;
}

export function OfferTextAt({ blocks = [], position, inList = false }) {
  return blocks.filter(b => Number(b.after || 0) === position).map(b => { const content = <article className="sales-customer-free-text" aria-label="Tilbudstekst">
    {b.title && <h4>{b.title}</h4>}
    {b.text && <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{b.text}</p>}
  </article>; return inList ? <li key={b.id} style={{ listStyle: "none", display: "block" }}>{content}</li> : <div key={b.id}>{content}</div>; });
}
