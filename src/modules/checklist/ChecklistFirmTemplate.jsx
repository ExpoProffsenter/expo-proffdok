import {useEffect,useRef,useState} from 'react';
import {kshmsRpc} from '../kshms/kshmsAccess.js';
import {checklistContent,saveChecklistTemplate,sameChecklistContent} from '../kshms/kshmsChecklists.mjs';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';

// Only the definition crosses into the existing firm catalogue. Its established
// management/publication RPC rechecks authority and verifies the saved edition.
export default function ChecklistFirmTemplate({companyId,userId,recordId,definition,disabled,onPublished}) {
 const key=`expo:checklist-firm-template:v1:${userId}:${companyId}:${recordId}`;
 const [savedTemplate,setSavedTemplate]=useState(null),[savedContent,setSavedContent]=useState(null),[context,setContext]=useState(null),[job,setJob]=useState(()=>{try{return JSON.parse(window.localStorage.getItem(key));}catch{return null;}}),[busy,setBusy]=useState(false),[publish,setPublish]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const live=useRef(null),lock=useRef(false);
 useEffect(()=>{
  const token={active:true};live.current=token;let serial=0;
  const refresh=event=>{const n=++serial;if(event&&event.type!=='focus')setContext(null);kshmsRpc('get_kshms_context').then(x=>{if(token.active&&n===serial&&x?.company_id===companyId&&x.user_id===userId&&x.enabled)setContext(x);}).catch(()=>{if(token.active&&n===serial)setContext(null);});};
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];events.forEach(e=>window.addEventListener(e,refresh));
  return()=>{token.active=false;events.forEach(e=>window.removeEventListener(e,refresh));};
 },[companyId,userId]);
 const sameContent=savedContent&&sameChecklistContent(savedContent,definition);
 const unchanged=sameContent&&(!publish||savedTemplate?.version);
 const save=async()=>{
  if(lock.current||disabled||unchanged||!context?.manage)return;
  const token=live.current;lock.current=true;setBusy(true);setError('');setMessage('');
  try{
   const next=job||{action:publish?'publish':'save',editor:{id:savedTemplate?.template.id||crypto.randomUUID(),revision:savedTemplate?.template.revision||0,requestId:crypto.randomUUID(),content:checklistContent(definition)}};
   // Synchronous local safety before a request with an unknown possible result.
   window.localStorage.setItem(key,JSON.stringify(next));setJob(next);
   const result=await saveChecklistTemplate({companyId,userId,editor:next.editor,action:next.action,rpc:kshmsRpc,isCurrent:()=>token.active&&live.current===token});
   if(!result||!token.active)return;
   window.localStorage.removeItem(key);setJob(null);setSavedContent(next.editor.content);setSavedTemplate(result);
   setMessage(next.action==='publish'?`Firmamalen «${result.template.draft.title}» er publisert og kan velges under Velg sjekkliste.`:'Firmamalen er lagret som utkast i KS/HMS → Sjekklistesentral. Publiser den der når den er klar.');
   if(next.action==='publish')try{await onPublished?.();}catch{setError('Malen er publisert. Lukk og åpne sjekklisteoversikten for å hente den.');}
  }catch(e){if(token.active)setError(`${e.message} Det samme malforsøket er beholdt. Svar og signaturer er ikke kopiert til malen.`);}
  finally{lock.current=false;if(token.active)setBusy(false);}
 };
 if(!context?.manage&&!job)return null;
 return <details><summary>Lagre som firmamal</summary><p>Bare navn, fag, sjekkpunkter og veiledning blir mal. Svar, signaturer, ordre, kunde og arbeidssted følger ikke med.</p>{job&&<p>Et malforsøk må bekreftes. Nytt forsøk bruker samme mal og samme valg.</p>}{context?.manage?<><label><input type="checkbox" disabled={busy||disabled||!!job||!context.responsible} checked={job?job.action==='publish':publish} onChange={e=>setPublish(e.target.checked)}/>Publiser som firmamal nå, slik at firmaet kan bruke den</label>{!context.responsible&&<p>Du kan lagre et utkast. Firmaets utpekte KS/HMS-ansvarlige må publisere malen.</p>}<button type="button" disabled={busy||disabled||unchanged} onClick={save}>{busy?'Lagrer firmamal …':unchanged?'Firmamalen er lagret':job?'Prøv samme malforsøk igjen':publish?'Publiser firmamal':'Lagre firmamal som utkast'}</button></>:<p>Maltilgangen er endret. Det opprinnelige malforsøket er beholdt til tilgangen er avklart.</p>}{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}</details>;
}
