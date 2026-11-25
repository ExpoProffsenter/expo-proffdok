import React,{useEffect,useRef,useState} from 'react';
import WorkspacePanel from '../ui/WorkspacePanel.jsx';

export default function ProjectChecklistPanel({projectName,onClose,children}) {
 const dialog=useRef(null),mounted=useRef(false),[wide,setWide]=useState(false);
 useEffect(()=>{mounted.current=true;const node=dialog.current;node.showModal();return()=>{mounted.current=false;if(node.open)node.close();};},[]);
 const close=async event=>{
  if(event.target!==event.currentTarget)return;
  const left=await onClose();
  if(left===false&&mounted.current&&!dialog.current.open)dialog.current.showModal();
 };
 return <WorkspacePanel dialogRef={dialog} title="Sjekklister" subtitle={projectName||'PROSJEKTDOKUMENTASJON'} className="project-checklist-panel" wide={wide} onExpand={()=>setWide(value=>!value)} closeLabel="Lukk sjekklister" onClose={close}>{children}</WorkspacePanel>;
}
