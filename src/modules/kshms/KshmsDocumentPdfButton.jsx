import {useEffect,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {downloadDocumentPdf} from '../report/kshmsDocumentPdf.mjs';

export default function KshmsDocumentPdfButton({kind,row,companyId,userId,projectId=null,disabled=false,active=true,resolveFileUrl}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const owner=useRef(null),locked=useRef(false),latest=useRef(null);
 const fingerprint=JSON.stringify([kind,companyId,userId,projectId,row,active,disabled]);latest.current=fingerprint;
 useEffect(()=>{const scope={active:true};owner.current=scope;setBusy(false);setError('');setNotice('');return()=>{scope.active=false;};},[kind,companyId,userId,projectId,row.id,active]);
 const download=async()=>{
  if(locked.current||disabled||!active)return;
  const scope=owner.current,snapshot=fingerprint;
  const current=()=>scope?.active&&owner.current===scope&&latest.current===snapshot;
  locked.current=true;setBusy(true);setError('');setNotice('');
  try{const result=await downloadDocumentPdf({kind,expected:row,companyId,userId,projectId,rpc:kshmsRpc,isCurrent:current,resolveFileUrl});if(current()&&result)setNotice(result.logoMissing?'PDF er laget med firmanavn. Logoen kunne ikke hentes.':'PDF er laget fra den lagrede dokumentasjonen.');}
  catch(cause){if(current())setError(cause.message);}
  finally{locked.current=false;if(scope?.active&&owner.current===scope)setBusy(false);}
 };
 return <div className="ks-pdf-action"><button type="button" className="secondary" disabled={disabled||busy||!active} onClick={download}>{busy?'Lager PDF …':'Last ned PDF'}</button>{disabled&&<p className="ks-field-hint">Lagre endringene først, eller åpne den lagrede kontrollen.</p>}{error&&<p role="alert" className="ks-error">{error}</p>}{notice&&<p role="status" className="ks-notice">{notice}</p>}</div>;
}
