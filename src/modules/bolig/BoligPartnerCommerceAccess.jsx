import React,{useEffect,useRef,useState} from 'react';
import {collaborationRpc} from './boligCollaborationClient.js';
export default function BoligPartnerCommerceAccess({context,root,partner}) {
 const [data,setData]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const pending=useRef(null),alive=useRef(true);
 const rpc=(action='get',payload={},revision=null)=>collaborationRpc('bolig_partner_commerce_access',{p_company_id:context.company_id,p_root_id:root.id,p_access_id:partner.id,p_action:action,p_revision:revision,p_payload:payload},context.user_id);
 useEffect(()=>{alive.current=true;rpc().then(v=>{if(alive.current)setData(v);}).catch(e=>{if(alive.current)setError(e.message);});return()=>{alive.current=false;};},[context.user_id,context.company_id,root.id,partner.id]);
 async function revoke(){if(busy)return;setBusy(true);setError('');pending.current||={revision:data.revision,payload:{request_id:crypto.randomUUID(),reviewed:true,enabled:false,edit_choices:false,edit_catalog:false,publish_shop:false}};try{const next=await rpc('save',pending.current.payload,pending.current.revision);if(alive.current){setData(next);pending.current=null;}}catch(e){if(alive.current)setError(e.message);}finally{if(alive.current)setBusy(false);}}
 return <section aria-label="Grunnpakke og tilvalg – persontilgang"><h3>Grunnpakke og tilvalg</h3><p>Nye butikkansatte tildeles av systemadmin under prosjektets «Butikktilgang». Den ansatte finner prosjektet under Min side → Mine boligprosjekter.</p>{error&&<p role="alert">{error}</p>}{data?.enabled&&<><p>{partner.name} har en tidligere personrettighet via denne partneradgangen.</p><button disabled={busy} onClick={revoke}>{pending.current?'Kontroller tilbakekalling igjen':'Trekk tilbake personrettigheten'}</button></>}</section>;
}
