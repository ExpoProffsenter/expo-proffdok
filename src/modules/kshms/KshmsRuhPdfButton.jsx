import {useEffect,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {downloadRuhPdf} from '../report/kshmsRuhPdf.mjs';

export default function KshmsRuhPdfButton({row,companyId,userId,projectId=null,disabled=false,active=true}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const owner=useRef(null),locked=useRef(false),latest=useRef(null);
 const fingerprint=JSON.stringify([companyId,userId,projectId,row,disabled,active]);latest.current=fingerprint;
 useEffect(()=>{const scope={active:true};owner.current=scope;setBusy(false);setError('');setNotice('');return()=>{scope.active=false;};},[companyId,userId,projectId,row.id,active]);
 const download=async()=>{
  if(locked.current||disabled||!active)return;const scope=owner.current,snapshot=fingerprint;
  const current=()=>scope?.active&&owner.current===scope&&latest.current===snapshot;
  locked.current=true;setBusy(true);setError('');setNotice('');
  try{
   const client=getAppSupabaseClient();if(!client)throw Error('Appens innlogging er ikke klar.');
   const result=await downloadRuhPdf({expected:row,companyId,userId,projectId,rpc:kshmsRpc,isCurrent:current,downloadFile:async file=>{const {data,error}=await client.storage.from('kshms-private').download(file.object_name);if(error)throw Error('Et lagret bilde kunne ikke hentes. PDF er ikke laget.');return data;}});
   if(current()&&result)setNotice(result.logoMissing?'RUH-PDF er laget med firmanavn. Logoen kunne ikke hentes.':'RUH-PDF er laget med hele den lagrede historikken og bildene.');
  }catch(cause){if(current())setError(cause.message);}finally{locked.current=false;if(scope?.active&&owner.current===scope)setBusy(false);}
 };
 return <div className="ks-pdf-action"><button type="button" className="secondary" disabled={busy||disabled||!active} onClick={download}>{busy?'Lager RUH-PDF …':'Last ned RUH-PDF'}</button><p className="ks-field-hint">{disabled?'Lagre endringene og fullfør eventuelle vedlegg først.':'Tar med lagret sak, hele historikken og bilder. Andre vedlegg er listet med navn. Vurder innhold og mottaker før deling.'}</p>{error&&<p role="alert" className="ks-error">{error}</p>}{notice&&<p role="status" className="ks-notice">{notice}</p>}</div>;
}
