import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {stocktakeRpc} from './stocktakeClient.js';
import {stocktakeStorageKey} from './stocktakeModel.mjs';
import './stocktake.css';
const Workspace=lazy(()=>import('./StocktakeWorkspace.jsx'));
export default function StocktakeEntry({onAvailable,visible=true}){
 const [context,setContext]=useState(null),[workspaceScope,setWorkspaceScope]=useState('');const version=useRef(0);
 useEffect(()=>{
  let active=true;
  const refresh=()=>{const t=++version.current;setContext(null);
   stocktakeRpc('stocktake_context').then(c=>{if(!active||t!==version.current)return;onAvailable?.(!!c?.enabled);if(!c?.enabled)return;setContext(c);}).catch(()=>{if(active&&t===version.current)onAvailable?.(false);});};
  refresh();const events=[WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,'focus'];events.forEach(e=>window.addEventListener(e,refresh));
  return()=>{active=false;version.current++;events.forEach(e=>window.removeEventListener(e,refresh));};
 },[onAvailable]);
 useEffect(()=>{if(visible&&context)setWorkspaceScope(stocktakeStorageKey(context));},[visible,context]);
 if(!context)return null;
 return <section className="stocktake" aria-label="Varetelling">
  <header className="stocktakeHeader"><div><small>{context.company_name}</small><h2>Varetelling</h2><p>Tell varer på lageret. Registreringene lagres i firmaet og kan hentes på PC og mobil.</p></div></header>
  {workspaceScope===stocktakeStorageKey(context)?<Suspense fallback={<p>Henter varetelling …</p>}><Workspace key={stocktakeStorageKey(context)} context={context} visible={visible}/></Suspense>:null}
 </section>;
}
