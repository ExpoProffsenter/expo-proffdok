import React,{useEffect,useRef,useState} from 'react';
import WorkspacePanel from '../ui/WorkspacePanel.jsx';
import './projectReportWorkspace.css';

// Report is a read-only overlay. Opening it must not navigate away from a draft.
// Historical report URLs still open the same panel; closing leaves an entry button.
export function useProjectReportWorkspace({scopeKey,tab,available}) {
 const [request,setRequest]=useState(null),[dismissedRoute,setDismissedRoute]=useState(null);
 const routeKey=`${scopeKey}:${tab}`;
 useEffect(()=>{setRequest(null);setDismissedRoute(null);},[scopeKey,tab,available]);
 return {
  isOpen:available&&((request?.scopeKey===scopeKey&&request.tab===tab)||(tab==='rapport'&&dismissedRoute!==routeKey)),
  open:()=>setRequest({scopeKey,tab}),
  close:()=>{setRequest(null);setDismissedRoute(routeKey);}
 };
}

export default function ProjectReportWorkspace({projectName,onClose,onPdf,chooserOpen,children}) {
 const dialog=useRef(null),[wide,setWide]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const node=dialog.current;node.showModal();return()=>{if(node.open)node.close();};},[]);
 const download=async()=>{if(busy)return;setBusy(true);setError('');try{await onPdf();}catch(failure){setError(failure.message||'PDF kunne ikke lages. Prøv igjen.');}finally{setBusy(false);}};
 return <WorkspacePanel dialogRef={dialog} title="Rapport og PDF" subtitle={projectName||'PROSJEKTDOKUMENTASJON'} className="project-report-workspace" wide={wide} onExpand={()=>setWide(value=>!value)}
  closeLabel="Lukk rapport" onClose={event=>{if(event.target===event.currentTarget)onClose();}}
  onCancel={event=>{if(chooserOpen)event.preventDefault();}}
  footer={<><button type="button" disabled={busy} onClick={download}>{busy?'Lager PDF …':'Last ned PDF'}</button><button type="button" className="secondary" onClick={()=>dialog.current.close()}>Tilbake til prosjektet</button></>}>
  <p>Se gjennom rapporten. Velg «Last ned PDF» for å lagre dokumentasjonen på enheten din.</p>
  {error&&<p role="alert">{error}</p>}
  {children}
 </WorkspacePanel>;
}
