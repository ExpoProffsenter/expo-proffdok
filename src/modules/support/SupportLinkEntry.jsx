import React,{useEffect,useRef,useState} from 'react';
import SupportWorkspace from './SupportWorkspace.jsx';
// Only an explicit supportCase email URL opens this dialog. No app navigation,
// recovery state, current project or local/offline drafts are changed.
export default function SupportLinkEntry({authUser,supabaseClient}){
 const [request,setRequest]=useState(()=>{
  const url=new URL(window.location.href),id=url.searchParams.get('supportCase');
  return /^[a-f0-9-]{36}$/i.test(id||'')?{id,admin:url.searchParams.get('supportInbox')==='1'}:null;
 });
 const dialog=useRef(null);
 useEffect(()=>{if(request&&dialog.current&&!dialog.current.open)dialog.current.showModal();},[request]);
 function close(){
  dialog.current?.close();setRequest(null);
  const url=new URL(window.location.href);url.searchParams.delete('supportCase');url.searchParams.delete('supportInbox');
  window.history.replaceState(window.history.state,'',url);
 }
 if(!request)return null;
 return <dialog className="pd-support-dialog" ref={dialog} aria-label="Supportsak fra e-post" onCancel={e=>{e.preventDefault();close();}}>
  <div className="pd-support-dialog-top"><strong>ProffDok Support</strong><button type="button" className="secondary" onClick={close} autoFocus>Lukk supportsak</button></div>
  <SupportWorkspace supabaseClient={supabaseClient} authUser={authUser} admin={request.admin}/>
 </dialog>;
}
