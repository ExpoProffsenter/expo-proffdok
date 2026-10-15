import React,{useEffect,useRef,useState} from 'react';
import {stocktakeRpc} from './stocktakeClient.js';
import {publishManagedAccessChange} from '../access/moduleAccessClient.js';
export default function StocktakeCompanyAccess({companyId}) {
 const [state,setState]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const generation=useRef(0);
 async function read(){const t=++generation.current;setState(null);setError('');setMessage('');if(!companyId)return;
  try{const s=await stocktakeRpc('stocktake_admin_get',{p_company_id:companyId});if(t===generation.current&&s.company_id===companyId)setState(s);}catch(e){if(t===generation.current)setError(e.message);}}
 useEffect(()=>{read();return()=>{generation.current++;};},[companyId]);
 async function change(enabled){if(!state||busy)return;const t=++generation.current;setBusy(true);setError('');setMessage('');
  try{const s=await stocktakeRpc('stocktake_admin_set',{p_company_id:companyId,p_enabled:enabled,p_expected_revision:state.revision});if(t!==generation.current)return;setState(s);setMessage(enabled?'Varetelling er aktivert.':'Varetelling er deaktivert. Lagrede tellinger beholdes.');publishManagedAccessChange({source:'stocktake',companyId});}
  catch(e){if(t===generation.current)setError(e.message);}finally{setBusy(false);}}
 return <section className="company-store-offers-access" aria-label="Firmaets varetelling">
  <label><input type="checkbox" checked={state?.enabled===true} disabled={!state||busy} onChange={e=>change(e.target.checked)}/><span><strong>Aktiver varetelling</strong><small>Vis varetelling i Prissøk for firmaets godkjente brukere med Prissøk-tilgang. Telleresultater deles i firmaet og kan eksporteres til fil.</small></span></label>
  {!companyId?<small>Velg et firma først.</small>:!state&&!error?<small>Henter tilgang …</small>:null}
  {error?<div role="alert">{error}<button type="button" disabled={busy} onClick={read}>Hent tilgang på nytt</button></div>:null}
  {message?<small role="status">{message}</small>:null}
 </section>;
}
