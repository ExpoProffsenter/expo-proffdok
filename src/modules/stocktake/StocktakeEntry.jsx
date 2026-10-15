import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {stocktakeRpc} from './stocktakeClient.js';
import {readCountDraft,stocktakeStorageKey,writeCountDraft} from './stocktakeModel.mjs';
import './stocktake.css';
const Workspace=lazy(()=>import('./StocktakeWorkspace.jsx'));
export default function StocktakeEntry(){
 const [context,setContext]=useState(null),[open,setOpen]=useState(false);const version=useRef(0);
 useEffect(()=>{
  let active=true;
  const refresh=()=>{const t=++version.current;setContext(null);setOpen(false);
   stocktakeRpc('stocktake_context').then(c=>{if(!active||t!==version.current||!c?.enabled)return;setContext(c);setOpen(readCountDraft(stocktakeStorageKey(c))?.open===true);}).catch(()=>{});};
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];events.forEach(e=>window.addEventListener(e,refresh));
  return()=>{active=false;version.current++;events.forEach(e=>window.removeEventListener(e,refresh));};
 },[]);
 if(!context)return null;
 const toggle=()=>{const key=stocktakeStorageKey(context);writeCountDraft(key,{...readCountDraft(key),open:!open});setOpen(!open);};
 return <section className="stocktake" aria-label="Varetelling">
  <header className="stocktakeHeader"><div><small>{context.company_name}</small><h2>Varetelling</h2><p>Tell varer på lageret. Registreringene lagres i firmaet og kan hentes på PC og mobil.</p></div><button type="button" onClick={toggle}>{open?'Lukk varetelling':'Åpne varetelling'}</button></header>
  {open?<Suspense fallback={<p>Henter varetelling …</p>}><Workspace key={stocktakeStorageKey(context)} context={context}/></Suspense>:null}
 </section>;
}
