import React, { useId } from 'react';
import './customerTextBlocks.css';

export default function CustomerTextBlocksEditor({ blocks = [], posts = [], onChange, maxLength }) {
  const prefix = useId();
  const patch = (id, fields) => onChange(blocks.map(b => b.id === id ? { ...b, ...fields } : b));
  return <section className="sales-free-text-editor" aria-label="Fri tekst">
    <p>Sett inn tekst før eller etter en post. Teksten vises hos kunden uten pris.</p>
    {blocks.map((b, i) => <fieldset key={b.id} className="sales-free-text-block">
      <legend>Fri tekst {i + 1}</legend>
      <label htmlFor={`${prefix}-${b.id}-title`}>Overskrift (valgfritt)</label>
      <input id={`${prefix}-${b.id}-title`} value={b.title || ''} maxLength={120} onChange={e => patch(b.id, { title: e.target.value })}/>
      <label htmlFor={`${prefix}-${b.id}-text`}>Tekst</label>
      <textarea id={`${prefix}-${b.id}-text`} rows={5} maxLength={maxLength} value={b.text || ''} onChange={e => patch(b.id, { text: e.target.value })}/>
      <label htmlFor={`${prefix}-${b.id}-after`}>Plassering</label>
      <select id={`${prefix}-${b.id}-after`} value={b.after || ''} onChange={e => patch(b.id, { after: e.target.value })}>
        <option value="">Før første post</option>
        {posts.map((post, n) => <option key={post.id} value={post.id}>Etter {n + 1}. {post.title || 'Post uten navn'}</option>)}
        {b.after && !posts.some(p => p.id === b.after) && <option value={b.after}>Sist – opprinnelig post er fjernet</option>}
      </select>
      <button type="button" onClick={() => onChange(blocks.filter(item => item.id !== b.id))}>Fjern fri tekst {i + 1}</button>
    </fieldset>)}
    <button type="button" disabled={blocks.length >= 30} onClick={() => onChange([...blocks, { id: crypto.randomUUID(), title: '', text: '', after: posts.at(-1)?.id || '' }])}>+ Ny fri tekst</button>
  </section>;
}
