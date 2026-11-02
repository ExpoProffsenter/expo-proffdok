import React, { useEffect, useRef } from 'react';
import WorkspacePanel from '../ui/WorkspacePanel.jsx';
import './boligGuidance036.css';

export default function BoligGuidePanel({open,title,onClose,children}) {
  const dialog=useRef(null);
  useEffect(()=>{
    const node=dialog.current;
    if(open&&!node.open) {
      if(typeof node.showModal==='function') node.showModal();
      else node.setAttribute('open','');
    } else if(!open&&node.open) {
      if(typeof node.close==='function') node.close();
      else node.removeAttribute('open');
    }
  },[open]);
  useEffect(()=>{const node=dialog.current;return()=>{if(node?.open)node.close?.();};},[]);
  return <WorkspacePanel dialogRef={dialog} title={title} subtitle="HJELP / BOLIGPROSJEKTER"
    className="bolig-guidance-panel" closeLabel={`Lukk ${title.toLocaleLowerCase('nb')}`}
    onClose={event=>{if(event.target===event.currentTarget)onClose();}}
    footer={<button type="button" onClick={()=>{dialog.current?.close();onClose();}}>Tilbake til prosjektet</button>}>
    {open?children:null}
  </WorkspacePanel>;
}
