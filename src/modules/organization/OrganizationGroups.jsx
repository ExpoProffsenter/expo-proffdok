import React,{useEffect,useRef,useState} from 'react';
import {Network,Plus,X,Building2,Trash2} from 'lucide-react';
import {kshmsRpc} from '../kshms/kshmsAccess.js';
import {createOrgSession,orgFingerprint} from './orgModel.mjs';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
let remembered=null; // Selection only. Never rights, data or credentials.
export default function OrganizationGroups({context,Editor}){
 const scope=`${context.company_id}:${context.user_id}`;
 const [options,setOptions]=useState(null),[selection,setSelection]=useState({scope,id:remembered?.scope===scope?remembered.id:''});
 const selected=selection.scope===scope?selection.id:'';
 const [dirty,setDirty]=useState(false),[modal,setModal]=useState(null),[name,setName]=useState(''),[chosen,setChosen]=useState([]),[confirmed,setConfirmed]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const dialog=useRef(null),generation=useRef(0),refreshRef=useRef(null),lock=useRef(false),attempt=useRef(null);
 const select=id=>{remembered={scope,id};setSelection({scope,id});setDirty(false);};
 const available=options?.context.company_id===context.company_id&&options.context.user_id===context.user_id?options:null;
 useEffect(()=>{
  let alive=true;setOptions(null);setModal(null);setError('');if(remembered?.scope!==scope)remembered=null;
  const refresh=async()=>{const ticket=++generation.current;setOptions(null);setModal(null);if(document.visibilityState==='hidden')return;
   try{const value=await kshmsRpc('organization_group_options',{p_company_id:context.company_id});
    if(!alive||ticket!==generation.current)return;
    if(value?.context?.company_id!==context.company_id||value.context.user_id!==context.user_id||!Array.isArray(value.groups)||!Array.isArray(value.companies)||value.groups.length>20||value.companies.length>10)throw Error('Kartlisten har feil tilgang eller omfang.');
    setOptions(value);setError('');
    if(remembered?.scope===scope&&!value.groups.some(g=>g.id===remembered.id)){remembered=null;setSelection({scope,id:''});}
   }catch(cause){if(alive&&ticket===generation.current){setError(cause.message);}}
  };
  refreshRef.current=refresh;void refresh();const events=['focus',MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,WORK_PROFILE_EVENT];events.forEach(e=>window.addEventListener(e,refresh));document.addEventListener('visibilitychange',refresh);
  return()=>{alive=false;++generation.current;refreshRef.current=null;events.forEach(e=>window.removeEventListener(e,refresh));document.removeEventListener('visibilitychange',refresh);};
 },[scope]);
 useEffect(()=>{if(modal&&dialog.current){dialog.current.showModal();dialog.current.querySelector('input')?.focus();}},[modal]);
 const create=async()=>{
  if(lock.current||!available)return;lock.current=true;setBusy(true);setError('');const ticket=generation.current;
  try{
   const fresh=await kshmsRpc('organization_group_options',{p_company_id:context.company_id});
   if(ticket!==generation.current||fresh.context?.user_id!==context.user_id||fresh.context.company_id!==context.company_id||chosen.some(id=>!fresh.companies.some(c=>c.id===id)))throw Error('Firmatilgangen er endret. Hent kartlisten på nytt.');
   const payload={id:attempt.current,name:name.trim(),company_ids:chosen,confirm:confirmed};
   const state=await kshmsRpc('organization_group_create',{p_company_id:context.company_id,p_payload:payload});
   if(ticket!==generation.current)return;
   if(state?.context?.group_id!==payload.id||state.context.user_id!==context.user_id||state.context.company_id!==context.company_id)throw Error('Kartets identitet er endret.');
   setModal(null);await refreshRef.current();select(payload.id);
  }catch(cause){if(ticket===generation.current)setError(cause.message);}finally{lock.current=false;setBusy(false);}
 };
 const remove=async()=>{
  if(lock.current||!selected||!confirmed)return;lock.current=true;setBusy(true);setError('');const ticket=generation.current;
  const session=createOrgSession({rpc:kshmsRpc,companyId:context.company_id,userId:context.user_id,groupId:selected});
  try{const original=await session.read(),fresh=await session.read();if(ticket!==generation.current||orgFingerprint(original)!==orgFingerprint(fresh))throw Error('Felleskartet er endret. Prøv på nytt.');
   const result=await kshmsRpc('organization_group_command',{p_company_id:context.company_id,p_group_id:selected,p_revision:fresh.revision,p_action:'remove_group',p_payload:{confirm:true}});
   if(ticket!==generation.current)return;if(result.context?.user_id!==context.user_id||result.context.company_id!==context.company_id)throw Error('Arbeidsprofilen er endret.');
   setModal(null);select('');await refreshRef.current();
  }catch(cause){if(ticket===generation.current){setError(cause.message);setOptions(null);}}finally{session.dispose();lock.current=false;setBusy(false);}
 };
 const open=type=>{setError('');setConfirmed(false);setName('');setChosen([context.company_id]);attempt.current=crypto.randomUUID();setModal(type);};
 return <><section className="org-group-switch" aria-label="Velg organisasjonskart">
  <span className="org-row-icon"><Network size={22} aria-hidden="true"/></span><div><strong>{selected?'Felles organisasjon':'Firmaets organisasjon'}</strong><small>{selected?'Én konto kan ha egen plassering i hvert firma.':'Firmakartet gjelder valgt firma. Et felles kart kan knytte flere firmaer sammen.'}</small></div>
  {available&&<><select aria-label="Velg kart" value={selected} disabled={busy||dirty} onChange={e=>select(e.target.value)}><option value="">{context.company_name} – firmakart</option>{available.groups.map(g=><option key={g.id} value={g.id}>{g.name} – felles kart</option>)}</select>
   {available.companies.length>=2&&<button type="button" className="secondary" disabled={busy||dirty} onClick={()=>open('create')}><Plus size={17} aria-hidden="true"/>Nytt felles kart</button>}
   {selected&&available.groups.find(g=>g.id===selected)?.administer&&<button type="button" className="secondary org-danger" disabled={busy||dirty} onClick={()=>open('remove')} aria-label="Slett felles kart"><Trash2 size={17} aria-hidden="true"/></button>}
  </>}
  {dirty&&<p className="org-hint">Lagre eller forkast endringene før du bytter kart.</p>}
  {error&&<p role="alert" className="org-error">{error} <button type="button" onClick={()=>void refreshRef.current?.()}>Hent kartlisten på nytt</button></p>}
 </section>
 {(!selected||available?.groups.some(g=>g.id===selected))&&<Editor key={`${scope}:${selected}`} context={context} groupId={selected||null} onDirtyChange={setDirty}/>}
 {modal&&available&&<dialog ref={dialog} className="org-dialog" onCancel={e=>{e.preventDefault();if(!busy)setModal(null);}}><form onSubmit={e=>{e.preventDefault();void(modal==='create'?create():remove());}}>
  <div className="org-dialog-title"><div><small>Organisasjonskart</small><h3>{modal==='create'?'Knytt firmaer til et felles kart':'Slett felles kart?'}</h3></div><button type="button" aria-label="Lukk felleskart" className="secondary" disabled={busy} onClick={()=>setModal(null)}><X size={18} aria-hidden="true"/></button></div>
  <fieldset disabled={busy}>{modal==='create'?<><label className="org-field"><span>Navn på felles kart</span><input required minLength={2} maxLength={100} placeholder="For eksempel Ringside" value={name} onChange={e=>setName(e.target.value)}/></label><p className="org-hint">Velg 2–10 firmaer. Du må være firmaadmin og ha KS/HMS i alle. Vi lager Styret og én gren per firma; du kan tilpasse strukturen etterpå.</p><div className="org-group-companies">{available.companies.map(c=><label key={c.id}><input type="checkbox" disabled={c.id===context.company_id} checked={chosen.includes(c.id)} onChange={e=>setChosen(e.target.checked?[...chosen,c.id]:chosen.filter(id=>id!==c.id))}/><Building2 size={17} aria-hidden="true"/><span>{c.name}</span></label>)}</div><label className="org-group-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Jeg vil opprette et separat felles kart for disse firmaene.</label><p className="org-hint">Alle som ser hele kartet må ha KS/HMS i alle firmaene. Eksisterende firmakart og HR-tilgang beholdes.</p></>:<><p>Dette sletter hele felleskartets struktur og plasseringer. Firmaer, brukerkontoer, firmakart og HR beholdes.</p><label className="org-group-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Jeg vil slette hele dette felleskartet.</label></>}</fieldset>
  {error&&<p role="alert" className="org-error">{error}</p>}<div className="org-dialog-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>setModal(null)}>Lukk</button><button disabled={busy||!confirmed||modal==='create'&&(chosen.length<2||name.trim().length<2)}>{busy?'Lagrer …':modal==='create'?'Opprett felles kart':'Slett felles kart'}</button></div>
 </form></dialog>}
 </>;
}
