import React, {useState} from 'react';
import {boligDraftKey,readBoligDraft,writeBoligDraft,clearBoligDraft} from './boligClient.js';

export default function BoligProjectInfo({context,root,busy,onSave}) {
 const key=boligDraftKey(context,root.id,'project-info');
 const [draft,setDraft]=useState(()=>readBoligDraft(key,{title:root.title,reference:root.reference,revision:root.revision}));
 const [message,setMessage]=useState('');
 const conflict=draft.revision!==root.revision;
 const change=(patch)=>{const next={...draft,...patch};setDraft(next);setMessage(writeBoligDraft(key,next)?'':'Kladden kunne ikke sikres lokalt. Behold siden åpen.');};
 return <details className="bolig-project-info"><summary>Rediger prosjektinfo</summary>
 <p>Navn og prosjektnummer vises i prosjektoversikten. Boliger, beboere og fremdriftsplan beholdes.</p>
 <form onSubmit={async e=>{e.preventDefault();if(conflict||busy)return;const saved=await onSave({title:draft.title,reference:draft.reference},draft.revision);if(saved){clearBoligDraft(key);setDraft({...draft,revision:draft.revision+1});setMessage('Prosjektinfo er lagret.');}}}>
 <fieldset disabled={busy}>
 <label>Prosjektnavn<input required maxLength={160} value={draft.title} onChange={e=>change({title:e.target.value})}/></label>
 <label>Prosjektnummer (valgfritt)<input maxLength={80} value={draft.reference} onChange={e=>change({reference:e.target.value})}/></label>
 {conflict&&<div role="status"><p>Prosjektet er oppdatert. Din kladd er beholdt.</p><p>Lagret nå: {root.title} · {root.reference||'Uten prosjektnummer'}</p><button type="button" onClick={()=>change({revision:root.revision})}>Behold kladden og bruk siste grunnlag</button><button type="button" onClick={()=>change({title:root.title,reference:root.reference,revision:root.revision})}>Bruk lagret prosjektinfo</button></div>}
 <button type="submit" disabled={conflict}>Lagre prosjektinfo</button>
 </fieldset>{message&&<p role="status">{message}</p>}
 </form></details>;
}
