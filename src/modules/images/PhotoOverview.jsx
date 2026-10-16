import React,{useState} from 'react';

export function collectProjectPhotos(photos=[],checklist={}) {
  const rows=new Map();
  const add=(photo,source,category,item)=>{
    if(!photo?.url)return;
    const key=photo.path||photo.url;
    const old=rows.get(key);
    if(old){if(!old.sources.includes(source))old.sources.push(source);return;}
    rows.set(key,{...photo,sources:[source],category,item});
  };
  photos.forEach(photo=>add(photo,'Bilder',photo.cat));
  Object.entries(checklist).forEach(([category,answers])=>Object.entries(answers||{}).forEach(([item,answer])=>(answer.photos||[]).forEach(photo=>add(photo,'Sjekkliste',category,item))));
  return [...rows.values()];
}
export default function PhotoOverview({photos=[],checklist={},onChecklist}) {
  const [source,setSource]=useState('Alle');
  const rows=collectProjectPhotos(photos,checklist),visible=rows.filter(row=>source==='Alle'||row.sources.includes(source));
  return <details className="ux-preview"><summary className="ux-readable-summary">Samlet bildeoversikt · {rows.length} bilder fra prosjekt og sjekkpunkter</summary>
    <p>Bildene blir i sin opprinnelige dokumentasjon. Åpne sjekklisten for å endre et sjekkpunkt.</p>
    <label>Vis bildekilde<select value={source} onChange={e=>setSource(e.target.value)}>{['Alle','Bilder','Sjekkliste'].map(value=><option key={value}>{value}</option>)}</select></label>
    <div className="ux-grid">{visible.map((photo,index)=><article key={(photo.path||photo.url)+':'+index}><img src={photo.url} alt={photo.comment||photo.name||photo.item||photo.category||'Prosjektbilde'} loading="lazy" style={{width:'100%',height:150,objectFit:'contain'}}/><p>{photo.sources.join(' og ')} · {photo.category}{photo.item?' · '+photo.item:''}</p>{photo.sources.includes('Sjekkliste')&&onChecklist&&<button type="button" className="secondary" onClick={onChecklist}>Åpne Sjekklister</button>}</article>)}</div>
    {!visible.length&&<p>Ingen bilder fra denne kilden.</p>}
  </details>;
}
