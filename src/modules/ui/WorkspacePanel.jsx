import React,{useId,useState} from 'react';
import {createPortal} from 'react-dom';
import {Maximize2,X} from 'lucide-react';
import './workspaceTools.css';
import {DialogPortalTarget} from './DialogPortalTarget.js';

// One visual frame for contextual tools and native module work. The caller
// retains dialog lifetime, authorization, commands and mounted draft content.
export default function WorkspacePanel({dialogRef,title,subtitle='EXPO PROFFDOK / ARBEIDSVERKTØY',className='',wide=false,onExpand,onClose,onCancel,closeLabel='Lukk arbeidsverktøy',footer,children}){
 const titleId=useId();
 const [portalTarget,setPortalTarget]=useState(null);
 const close=()=>dialogRef.current?.close();
 return createPortal(<dialog ref={dialogRef} className={`pd-workspace-drawer${wide?' is-wide':''} ${className}`} aria-labelledby={titleId} onClose={onClose} onCancel={onCancel} onClick={event=>{if(event.target===event.currentTarget)close();}}>
  <div className="pd-workspace-drawer-inner">
   <header className="pd-workspace-drawer-header"><div><span>{subtitle}</span><h2 id={titleId}>{title}</h2></div><div>{onExpand&&<button type="button" aria-label={wide?'Reduser arbeidsflaten':'Utvid arbeidsflaten'} aria-pressed={wide} onClick={onExpand}><Maximize2 size={19} aria-hidden="true"/></button>}<button type="button" aria-label={closeLabel} onClick={close}><X size={21} aria-hidden="true"/></button></div></header>
   <div className="pd-workspace-drawer-body" ref={setPortalTarget}><DialogPortalTarget.Provider value={portalTarget}>{children}</DialogPortalTarget.Provider></div>
   <footer className="pd-workspace-drawer-footer">{footer||<button type="button" onClick={close}>Tilbake til arbeidet</button>}</footer>
  </div>
 </dialog>,document.body);
}
