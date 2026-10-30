import React,{useEffect,useRef} from 'react';
import {ArrowRight} from 'lucide-react';
import WorkspacePanel from './WorkspacePanel.jsx';

// Presentation-only disclosure. Keep the caller's real fields mounted and
// disabled during revalidation; the caller still owns scope and commands.
export default function WorkspaceDisclosure({open,onOpenChange,label,title=label,subtitle,className='',contentClassName='',dataTopic,disabled=false,keepMounted=true,children}){
 const dialog=useRef(null);
 useEffect(()=>{
  const node=dialog.current;
  if(open&&!node.open){if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','');}
  if(!open&&node.open){if(typeof node.close==='function')node.close();else node.removeAttribute('open');}
 },[open]);
 useEffect(()=>{const node=dialog.current;return()=>{if(node?.open&&typeof node.close==='function')node.close();};},[]);
 return <div className={className} data-help-topic={dataTopic}>
  <button type="button" className="pd-workspace-disclosure-trigger" aria-haspopup="dialog" aria-expanded={open} disabled={disabled} onClick={()=>onOpenChange(true)}>{label}<ArrowRight size={18} aria-hidden="true"/></button>
  <WorkspacePanel dialogRef={dialog} title={title} subtitle={subtitle} onClose={()=>onOpenChange(false)} closeLabel="Lukk panelet">
   <fieldset className={`pd-workspace-disclosure-content ${contentClassName}`} disabled={disabled} aria-busy={disabled}>{keepMounted||open?children:null}</fieldset>
  </WorkspacePanel>
 </div>;
}
