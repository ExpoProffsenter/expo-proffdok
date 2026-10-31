import {useEffect,useRef,useState} from 'react';
import WorkspacePanel from '../../ui/WorkspacePanel.jsx';
import '../salesEntryWorkspace.css';

// The existing Sales owner still chooses the mode, saves and clears drafts.
// Closing this presentation is the native Back action, never a save/cancel.
export default function SalesEntryPanel({inline=false,title,onBack,footer,children}){
 const dialog=useRef(null),active=useRef(false);
 const [wide,setWide]=useState(false);
 useEffect(()=>{
  if(inline)return;
  active.current=true;
  const node=dialog.current;
  if(node&&!node.open)node.showModal();
  return()=>{active.current=false;if(node?.open)node.close();};
 },[inline]);
 if(inline)return children;
 // Keep the existing server-rendered contract test and non-browser reading
 // fallback useful. Browser fields are mounted once in the native panel.
 if(typeof document==='undefined')return <>{children}{footer}</>;
 return <WorkspacePanel dialogRef={dialog} title={title} subtitle="FORESPØRSEL OG TILBUD / OPPRETT" className="sales-entry-dialog" wide={wide} onExpand={()=>setWide(value=>!value)} closeLabel="Tilbake" onClose={event=>{if(active.current&&!event.currentTarget.open)onBack?.();}} footer={footer}>
  {children}
 </WorkspacePanel>;
}
