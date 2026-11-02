import React,{useState} from 'react';
import ProjectPhotoPreview from './ProjectPhotoPreview.jsx';

export function collectProjectPhotos(photos=[],checklist={}) {
  const rows=new Map();
  const add=(photo,source,category,item)=>{
    if(!photo?.url)return;
    const key=photo.path||photo.url;
    const old=rows.get(key),location={source,category:category||photo.cat||photo.category||'',item:item||''};
    if(old){if(!old.sources.includes(source))old.sources.push(source);if(!old.locations.some(value=>value.source===location.source&&value.category===location.category&&value.item===location.item))old.locations.push(location);return;}
    rows.set(key,{...photo,sources:[source],category:location.category,item,locations:[location]});
  };
  photos.forEach(photo=>add(photo,'Bilder',photo.cat));
  Object.entries(checklist).forEach(([category,answers])=>Object.entries(answers||{}).forEach(([item,answer])=>(answer.photos||[]).forEach(photo=>add(photo,'Sjekkliste',category,item))));
  return [...rows.values()];
}
export default function PhotoOverview({photos=[],checklist={},onChecklist}) {
  const [source,setSource]=useState('Alle');
  const rows=collectProjectPhotos(photos,checklist),visible=rows.filter(row=>source==='Alle'||row.sources.includes(source));
  return <details className="ux-preview pd-project-photo-overview"><summary className="ux-readable-summary">Samlet bildeoversikt · {rows.length} unike bilder fra prosjekt og sjekkpunkter</summary>
    <p>Samme bilde vises én gang. Kildene og sjekkpunktene følger bildet. Bildene blir i sin opprinnelige dokumentasjon. Åpne sjekklisten for å endre et sjekkpunkt.</p>
    <label>Vis bildekilde<select value={source} onChange={e=>setSource(e.target.value)}>{['Alle','Bilder','Sjekkliste'].map(value=><option key={value}>{value}</option>)}</select></label>
    <div className="ux-grid">{visible.map((photo,index)=><article key={(photo.path||photo.url)+':'+index}><ProjectPhotoPreview photo={photo}><p>{photo.sources.join(' og ')}</p><ul>{photo.locations.map((location,i)=><li key={i}>{[location.category,location.item].filter(Boolean).join(' · ')||location.source}</li>)}</ul></ProjectPhotoPreview><p>{photo.sources.join(' og ')}</p><ul>{photo.locations.map((location,i)=><li key={i}>{[location.category,location.item].filter(Boolean).join(' · ')||location.source}</li>)}</ul>{photo.sources.includes('Sjekkliste')&&onChecklist&&<button type="button" className="secondary" onClick={onChecklist}>Åpne Sjekklister</button>}</article>)}</div>
    {!visible.length&&<p>Ingen bilder fra denne kilden.</p>}
  </details>;
}
