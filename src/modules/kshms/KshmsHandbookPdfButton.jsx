import {useEffect,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {downloadHandbookPdf} from '../report/kshmsHandbookPdf.mjs';

export default function KshmsHandbookPdfButton({companyId,userId,disabled=false}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const owner=useRef(null),locked=useRef(false),latest=useRef(null);
 const fingerprint=JSON.stringify([companyId,userId,disabled]);latest.current=fingerprint;
 useEffect(()=>{const scope={active:true};owner.current=scope;setBusy(false);setError('');setNotice('');return()=>{scope.active=false;};},[companyId,userId]);
 const download=async()=>{
  if(disabled||locked.current)return;
  const scope=owner.current,snapshot=fingerprint,current=()=>scope?.active&&owner.current===scope&&latest.current===snapshot;
  locked.current=true;setBusy(true);setError('');setNotice('');
  try{const result=await downloadHandbookPdf({rpc:kshmsRpc,companyId,userId,isCurrent:current});if(current()&&result)setNotice(result.logoMissing?'Personalhåndboka er lastet ned med firmanavn. Firmaet har ikke lagt inn logo i firmaprofilen.':'Personalhåndboka er lastet ned med firmaets logo.');}
  catch(cause){if(current())setError(cause.message);}
  finally{locked.current=false;if(scope?.active&&owner.current===scope)setBusy(false);}
 };
 return <div className="ks-pdf-action"><button type="button" className="secondary" disabled={disabled||busy} onClick={download}>{busy?'Lager personalhåndbok …':'Last ned hele personalhåndboka (PDF)'}</button><p className="ks-field-hint">Alle dine tildelte rutiner, med firmaets logo, innholdsfortegnelse og egne bekreftelser med dato og klokkeslett. Tidligere og utgåtte utgaver ligger i en egen historikkdel. Søket begrenser ikke PDF-en. Nedlasting gir ingen ny lesebekreftelse.</p>{error&&<p role="alert" className="ks-error">{error}</p>}{notice&&<p role="status" className="ks-notice">{notice}</p>}</div>;
}
