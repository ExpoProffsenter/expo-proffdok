import React,{useEffect,useRef,useState} from 'react';
import WorkspacePanel from '../ui/WorkspacePanel.jsx';

// Preserve the exporter's existing explicit archive confirmation, without a
// browser-native JS prompt. A scope change or unmount cancels pending exports.
export function useReportArchiveConfirmation({scopeKey,enabled=true}) {
 const current=useRef(scopeKey),pending=useRef(null),[notice,setNotice]=useState(null);
 current.current=scopeKey;
 const cancel=()=>{pending.current?.resolve(false);pending.current=null;setNotice(null);};
 useEffect(()=>{cancel();return()=>{pending.current?.resolve(false);pending.current=null;};},[scopeKey,enabled]);
 const confirm=message=>{
  if(!enabled||current.current!==scopeKey)return Promise.resolve(false);
  if(pending.current)return Promise.resolve(false);
  return new Promise(resolve=>{pending.current={scopeKey,resolve};setNotice({scopeKey,message});});
 };
 const finish=value=>{if(pending.current?.scopeKey!==scopeKey)return;const resolve=pending.current.resolve;pending.current=null;setNotice(null);resolve(value);};
 return {confirm,confirmation:enabled&&notice?.scopeKey===scopeKey?{message:notice.message,accept:()=>finish(true),cancel:()=>finish(false)}:null};
}

export default function ReportArchiveConfirmation({confirmation}) {
 const dialog=useRef(null);
 useEffect(()=>{const node=dialog.current;if(confirmation&&!node.open)node.showModal();else if(!confirmation&&node.open)node.close();},[!!confirmation]);
 useEffect(()=>{const node=dialog.current;return()=>{if(node?.open)node.close();};},[]);
 return <WorkspacePanel dialogRef={dialog} title="Lagre rapporten lokalt" subtitle="PDF / ARKIVERING" className="report-archive-confirmation" closeLabel="Avbryt PDF"
  onClose={event=>{if(event.target===event.currentTarget)confirmation?.cancel();}}
  footer={<><button type="button" onClick={confirmation?.accept}>Generer PDF</button><button type="button" className="secondary" onClick={confirmation?.cancel}>Avbryt</button></>}>
  {confirmation&&<p style={{whiteSpace:'pre-line'}}>{confirmation.message}</p>}
 </WorkspacePanel>;
}
