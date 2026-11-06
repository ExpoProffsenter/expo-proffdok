import React,{useEffect,useRef,useState} from 'react';
import {CircleHelp} from 'lucide-react';
import WorkspacePanel from '../ui/WorkspacePanel.jsx';
import './headerHelp.css';

// Help is an overlay: opening it must never navigate, save or remount the work.
export default function HeaderHelp({scopeKey,children}){
 const [open,setOpen]=useState(false);
 const dialog=useRef(null);
 useEffect(()=>{setOpen(false);},[scopeKey]);
 useEffect(()=>{
  const node=dialog.current;
  if(open)node?.showModal();
  return()=>{if(node?.open)node.close();};
 },[open]);
 return <>
  <button type="button" className="secondary header-help-button" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><CircleHelp size={19} aria-hidden="true"/>Hjelp</button>
  {open&&<WorkspacePanel dialogRef={dialog} title="Hjelp" subtitle="VEILEDNING MENS DU ARBEIDER" className="header-help-panel" wide closeLabel="Lukk hjelp" onCancel={event=>event.stopPropagation()} onClose={event=>{event.stopPropagation();if(event.target===event.currentTarget)setOpen(false);}}>{children}</WorkspacePanel>}
 </>;
}
