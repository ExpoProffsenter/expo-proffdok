import React from 'react';

export default function ProductDocumentationSummary({sections,checked,docs,getManual,onOpen}) {
  const missing=sections.flatMap(section=>[
    ...(section.items||[]).filter(name=>checked[name]&&![docs[name]?.fdvUrl,docs[name]?.databladUrl].some(value=>String(value||'').trim())).map(name=>({name,section:section.title})),
    ...getManual(section.title).filter(item=>String(item.name||'').trim()&&!String(item.fdvUrl||'').trim()).map(item=>({name:item.name,section:section.title})),
  ]);
  return <aside className="ux-preview" aria-label="Produktdokumentasjon"><strong>{missing.length?`${missing.length} valgte produkter uten FDV-/databladlenke`:'Ingen valgte produkter mangler FDV-/databladlenke'}</strong>
    <p>Oversikten kontrollerer lenkefeltene. Vurder selv hvilke dokumenter hvert produkt trenger.</p>
    {missing.length>0&&<details><summary className="ux-readable-summary">Se produktene som mangler lenke</summary><ul>{missing.map((item,index)=><li key={item.section+':'+index}><button type="button" className="secondary" onClick={()=>onOpen(item.section)}>{item.name} · {item.section}</button></li>)}</ul></details>}
  </aside>;
}
