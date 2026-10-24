import React,{useCallback,useEffect,useRef,useState} from 'react';
import {LockKeyhole,FileText,Upload,History,Users,Download,Eye} from 'lucide-react';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {BOLIG_ACCESS_EVENT} from './boligAccess.js';
import Dialog from './BoligEditorDialog.jsx';
import BoligContractReview from './BoligContractReview.jsx';
import {contractDraft,rememberContractDraft,forgetContractDraft,contractRpc,contractHash,uploadContract,downloadContract,CONTRACT_EVENT} from './boligContractsClient.js';
import './boligContracts.css';
const kinds={contract:'Hovedkontrakt',attachment:'Vedlegg',addition:'Tillegg'};
const date=value=>new Intl.DateTimeFormat('nb-NO',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
const size=value=>value<1024*1024?Math.ceil(value/1024)+' kB':(value/1024/1024).toFixed(1)+' MB';
export default function BoligContracts({context,root}){
 const scope=`${context.user_id}:${context.company_id}:${root.id}:${context.role}`;
 const epoch=useRef(0),alive=useRef(false),writing=useRef(false),invalidScope=useRef(false),current=useRef(scope);current.current=scope;
 const foreground=useRef(!document.hidden),internalFrame=useRef(false);
 const picker=useRef(false),[picking,setPicking]=useState(false);
 const endPicking=useCallback(()=>{picker.current=false;setPicking(false);},[]);
 const [snapshot,setSnapshot]=useState(null),[checking,setChecking]=useState(true),[blocked,setBlocked]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [draft,setDraft]=useState(()=>contractDraft(scope)),draftRef=useRef(draft);draftRef.current=draft;
 const [opened,setOpened]=useState(null),[history,setHistory]=useState(null),[selected,setSelected]=useState(null),[query,setQuery]=useState(''),[shown,setShown]=useState(20);
 const [viewUrl,setViewUrl]=useState(''),urlRef=useRef(''),downloadSerial=useRef(0),downloadAbort=useRef(null);
 const data=!blocked&&snapshot?.scope===scope?snapshot.data:null;
 const change=fields=>{const next={...draftRef.current,...fields};draftRef.current=next;rememberContractDraft(scope,next);setDraft(next);};
 const clearBytes=useCallback(()=>{downloadSerial.current++;downloadAbort.current?.abort();downloadAbort.current=null;if(urlRef.current)URL.revokeObjectURL(urlRef.current);urlRef.current='';setViewUrl('');},[]);
 const load=useCallback(async()=>{
  if(writing.current||document.hidden||!foreground.current||invalidScope.current)return null;
  const ticket=++epoch.current;setChecking(true);setBlocked(true);clearBytes();
  try{
   const value=await contractRpc(context,root.id);
   if(alive.current&&ticket===epoch.current&&current.current===scope&&!document.hidden){
    setSnapshot({scope,data:value});setBlocked(false);setError('');
    if(!value.allowed){forgetContractDraft(scope);setDraft(contractDraft(scope));setOpened(null);setSelected(null);setHistory(null);}
    return value;
   }
  }catch(e){if(alive.current&&ticket===epoch.current){setError(e.message);setSnapshot(null);if(e.code==='42501'){forgetContractDraft(scope);setDraft(contractDraft(scope));setOpened(null);setSelected(null);setHistory(null);}}}
  finally{if(alive.current&&ticket===epoch.current){setChecking(false);endPicking();}}
  return null;
 },[scope,root.id,clearBytes,endPicking]);
 useEffect(()=>{
  alive.current=true;invalidScope.current=false;foreground.current=!document.hidden;endPicking();setSnapshot(null);setOpened(null);setSelected(null);setHistory(null);setDraft(contractDraft(scope));load();
  const refresh=event=>{
   if(event?.type==='focus'&&internalFrame.current&&foreground.current&&!document.hidden){internalFrame.current=false;return;}
   if(event?.type==='focus')picker.current=false;
   if(['focus','visibilitychange'].includes(event?.type))foreground.current=!document.hidden;
   if(document.hidden||!['focus','visibilitychange'].includes(event?.type))endPicking();
   if(event?.type===WORK_PROFILE_EVENT&&event.detail?.active_company_id!==context.company_id){invalidScope.current=true;forgetContractDraft(scope);setDraft(contractDraft(scope));setSnapshot(null);setOpened(null);setSelected(null);setHistory(null);}
   epoch.current++;setBlocked(true);clearBytes();
   if(!document.hidden)load();
  };
  const blur=()=>{
   if(document.hasFocus()&&document.activeElement?.matches('iframe[data-bolig-contract-preview]')){internalFrame.current=true;return;}
   if(document.hidden||!picker.current)endPicking();
   foreground.current=false;internalFrame.current=false;epoch.current++;setBlocked(true);setChecking(false);clearBytes();
  };
  const events=['focus',MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT,WORK_PROFILE_EVENT,BOLIG_ACCESS_EVENT,CONTRACT_EVENT];
  events.forEach(name=>window.addEventListener(name,refresh));document.addEventListener('visibilitychange',refresh);
  window.addEventListener('blur',blur);
  const timer=setInterval(load,60000);
  return()=>{alive.current=false;epoch.current++;downloadSerial.current++;downloadAbort.current?.abort();if(urlRef.current)URL.revokeObjectURL(urlRef.current);urlRef.current='';clearInterval(timer);events.forEach(name=>window.removeEventListener(name,refresh));window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',refresh);};
 },[load,scope]);
 useEffect(()=>{
  if(!data?.allowed||!opened)return;
  if(opened==='history'&&selected){let active=true;contractRpc(context,root.id,'history',{document_id:selected.document_id}).then(value=>{if(active)setHistory(value);}).catch(e=>{if(active){setError(e.message);setHistory(null);}});return()=>{active=false;};}
 },[data,opened,selected?.document_id]);
 const fetchBytes=async(file,mode='preview')=>{
  if(!data?.allowed)return;
  if(mode==='preview')clearBytes();else{downloadSerial.current++;downloadAbort.current?.abort();}
  const serial=downloadSerial.current,identity=scope,accessEpoch=epoch.current,controller=new AbortController();downloadAbort.current=controller;
  setError('');
  try{
   const blob=await downloadContract(context,root.id,file,controller.signal);
   if(!alive.current||identity!==current.current||serial!==downloadSerial.current||accessEpoch!==epoch.current||document.hidden||!foreground.current)return;
   const url=URL.createObjectURL(blob);
   if(mode==='download'){
    const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   }else{urlRef.current=url;setViewUrl(url);}
  }catch(e){if(alive.current&&serial===downloadSerial.current&&e.name!=='AbortError'){setError(e.message);if(e.code==='42501')load();}}
 };
 useEffect(()=>{if(opened==='preview'&&selected&&data?.allowed){fetchBytes(selected);return()=>{downloadSerial.current++;downloadAbort.current?.abort();if(urlRef.current)URL.revokeObjectURL(urlRef.current);urlRef.current='';};}},[opened,selected?.id,data]);
 const run=async(job,isUpload=false)=>{
  if(writing.current||!data?.manage||blocked)return;
  writing.current=true;setBusy(true);setError('');setNotice('');const identity=scope,ticket=epoch.current;
  const valid=()=>alive.current&&current.current===identity&&ticket===epoch.current&&!document.hidden;
  try{await job(valid);}catch(e){if(valid()){setError(e.message);if(e.code==='PT409'&&isUpload)change({conflict:true});if(e.code==='42501'){setBlocked(true);clearBytes();forgetContractDraft(scope);setOpened(null);}}}
  finally{writing.current=false;if(alive.current&&current.current===identity){setBusy(false);load();}}
 };
 const upload=()=>run(async valid=>{
  const value=draftRef.current;if(!value.file)return;
  let attempt=value.attempt;
  if(!attempt){
   const doc=data.documents.find(d=>d.id===value.document_id);
   attempt={id:crypto.randomUUID(),document_id:doc?.id||crypto.randomUUID(),revision:doc?.revision||0,title:doc?.title||value.title.trim(),kind:doc?.kind||value.kind,name:value.file.name,mime:value.file.type,size:value.file.size,sha256:await contractHash(value.file),comment:value.comment};
   if(!valid())return;change({attempt});
  }
  const receipt=await uploadContract(context,root.id,value.file,attempt);
  if(valid()){forgetContractDraft(scope);setDraft(contractDraft(scope));setOpened(null);setNotice(`Dokumentet er lagret som versjon ${receipt.file.version}.`);}
 },true);
 const showUpload=doc=>{setError('');if(!draftRef.current.attempt&&doc)change({document_id:doc.id,title:doc.title,kind:doc.kind});setOpened('upload');};
 const showFile=file=>{setSelected(file);setOpened('preview');};
 const showSource=(file,page)=>{setSelected({...file,page,fromReview:true});setOpened('preview');};
 const closePreview=()=>{if(selected?.fromReview){clearBytes();setSelected(null);setOpened('review');}else close();};
 const close=()=>{endPicking();clearBytes();setOpened(null);setSelected(null);setHistory(null);};
 // A native picker temporarily blurs its page. Keep only the user's upload draft
 // open through that round trip; writes and stored metadata still await fresh ACL.
 const beginPicking=()=>{if(data?.manage){picker.current=true;setPicking(true);}};
 const finishPicking=()=>{if(picker.current&&!document.hidden){picker.current=false;foreground.current=true;load();}};
 const filtered=(data?.documents||[]).filter(d=>(d.title+' '+d.file.name+' '+kinds[d.kind]).toLocaleLowerCase('nb').includes(query.toLocaleLowerCase('nb')));
 const versionActions=file=><div className="bolig-contract-file-actions"><button type="button" className="secondary" onClick={()=>showFile(file)}><Eye size={16}/>Vis dokument</button><button type="button" className="secondary" onClick={()=>fetchBytes(file,'download')}><Download size={16}/>Last ned</button></div>;
 return <section className="bolig-contracts" aria-label="Privat kontraktsområde">
  <header><div><span className="bolig-contract-private"><LockKeyhole size={15}/>Kun utpekte personer</span><h3>Kontrakter og vedlegg</h3><p>Samle originalene her. Legg til en ny versjon når dokumentet endres. Tidligere utgaver beholdes.</p></div>{data?.allowed&&<button type="button" className="secondary" disabled={busy||checking} onClick={load}>Hent siste oversikt</button>}</header>
  {error&&<p role="alert" className="bolig-contract-error">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {error&&!data&&<button type="button" className="secondary" disabled={checking||busy} onClick={load}>Hent kontraktstilgang</button>}
  {checking&&<p role="status">Kontrollerer kontraktstilgangen …</p>}
  {data&&!data.allowed&&<div className="bolig-contract-empty"><LockKeyhole/><h4>Dette området er privat</h4><p>Prosjektoppretteren med prosjektledertilgang starter området og gir navngitte personer tilgang. Vanlig firma- og prosjekttilgang gir ikke kontraktsinnsyn.</p></div>}
  {data?.allowed&&<>
   <div className="bolig-contract-toolbar">{data.manage&&<><button type="button" onClick={()=>showUpload(null)}><Upload size={17}/>{draft.file?'Fortsett opplasting':'Last opp dokument'}</button><button type="button" className="secondary" onClick={()=>setOpened('access')}><Users size={17}/>Tilgang</button></>}{data.documents.length>0&&<button type="button" className="secondary" onClick={()=>setOpened('review')}>Les og gjennomgå kontrakter</button>}<label>Søk dokument<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setShown(20);}} placeholder="Tittel, filnavn eller dokumenttype"/></label></div>
   {!data.documents.length?<div className="bolig-contract-empty"><FileText/><h4>Legg inn kontraktsgrunnlaget</h4><p>Start med hovedkontrakten. Last deretter opp vedlegg og tillegg som egne dokumenter. Dette endrer ingen bestilling eller avtale.</p></div>:<div className="bolig-contract-list">{filtered.slice(0,shown).map(doc=><article key={doc.id}><div><span className="bolig-contract-kind">{kinds[doc.kind]} · Versjon {doc.revision}</span><h4>{doc.title}</h4><p>{doc.file.name} · {size(doc.file.size_bytes)}<br/>{date(doc.file.created_at)} · {doc.file.creator}</p></div><div>{versionActions(doc.file)}<div className="bolig-contract-file-actions"><button type="button" className="secondary" onClick={()=>{setSelected({document_id:doc.id});setHistory(null);setOpened('history');}}><History size={16}/>Versjoner ({doc.revision})</button>{data.manage&&<button type="button" className="secondary" onClick={()=>showUpload(doc)}>Ny versjon</button>}</div></div></article>)}</div>}
   {shown<filtered.length&&<button type="button" className="secondary" onClick={()=>setShown(n=>n+20)}>Vis flere dokumenter</button>}
   <p className="bolig-contract-note">Originalfiler og gjennomganger deles ikke gjennom UE-, leverandør- eller beboerlenker og følger ikke prosjektets vanlige FDV-/sluttpakke. Bruk «Les og gjennomgå kontrakter» for tekstsøk og forslag med kildehenvisninger.</p>
  </>}
  {(opened==='review'||(opened==='preview'&&selected?.fromReview))&&snapshot?.scope===scope&&snapshot.data.allowed&&<Dialog title="Kontraktsgjennomgang" onClose={close} suspended={!data||opened!=='review'}><BoligContractReview context={context} root={root} documents={snapshot.data.documents} active={!!data&&opened==='review'} foreground={foreground.current&&!document.hidden&&opened==='review'} manage={!!data?.manage} onView={showSource} onAccessLost={load}/></Dialog>}
  {opened==='upload'&&snapshot?.scope===scope&&snapshot.data.allowed&&<Dialog title="Last opp kontraktsdokument" onClose={close} busy={busy} suspended={!data&&!picking}>
   <form className="bolig-contract-form" onSubmit={e=>{e.preventDefault();upload();}}><fieldset disabled={busy||!!draft.attempt}>
    <label>Dokument<select value={draft.document_id} disabled={!data?.manage} onChange={e=>{const doc=data?.documents.find(d=>d.id===e.target.value);change({document_id:doc?.id||'',title:doc?.title||'',kind:doc?.kind||'contract'});}}><option value="">Nytt dokument</option>{!data&&draft.document_id&&<option value={draft.document_id}>{draft.title} · ny versjon</option>}{(data?.documents||[]).map(d=><option key={d.id} value={d.id}>{d.title} · ny versjon</option>)}</select></label>
    <label>Tittel<input required maxLength={120} value={draft.title} disabled={!!draft.document_id} onChange={e=>change({title:e.target.value})}/></label>
    <label>Dokumenttype<select disabled={!!draft.document_id} value={draft.kind} onChange={e=>change({kind:e.target.value})}>{Object.entries(kinds).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
    <label>Fil (PDF, JPG eller PNG – inntil 20 MB)<input type="file" accept="application/pdf,image/jpeg,image/png" onClick={beginPicking} onCancel={e=>{e.stopPropagation();finishPicking();}} onChange={e=>{finishPicking();const file=e.target.files?.[0];if(!file)return;if(!['application/pdf','image/jpeg','image/png'].includes(file.type)||!file.size||file.size>20*1024*1024){setError('Velg PDF, JPG eller PNG på inntil 20 MB.');return;}change({file,title:draftRef.current.title||file.name.replace(/\.[^.]+$/,'').slice(0,120)});}}/></label>{draft.file&&<p>{draft.file.name} · {size(draft.file.size)}</p>}
    <label>Merknad til versjonen (valgfritt)<textarea value={draft.comment} maxLength={500} onChange={e=>change({comment:e.target.value})}/></label>
   </fieldset>
   <p>Originalen beholdes uendret. En ny versjon erstatter ikke historikken. Opplastingskladden beholdes i denne nettleserøkten, men lagres ikke på enheten.</p>
   {error&&<p role="alert">{error}</p>}
   {draft.conflict?<button type="button" disabled={busy} onClick={async()=>{const fresh=await load();if(fresh?.allowed&&fresh.manage){change({attempt:null,conflict:false});setNotice('Siste versjon er hentet. Se over dokumentet før du laster opp på nytt.');}}}>Hent siste grunnlag</button>:<button disabled={busy||!data?.manage||!draft.file||!draft.title.trim()}>{busy?'Laster opp …':draft.attempt?'Prøv samme opplasting igjen':draft.document_id?'Lagre ny versjon':'Last opp og lagre'}</button>}
   <button type="button" className="secondary" disabled={busy} onClick={()=>{forgetContractDraft(scope);setDraft(contractDraft(scope));close();load();}}>Forkast opplastingskladd</button><p>Dette sletter ikke dokumenter som allerede er lagret.</p>
   </form></Dialog>}
  {opened==='access'&&snapshot?.scope===scope&&snapshot.data.manage&&<Dialog title="Tilgang til kontrakter" onClose={close} suspended={!data} busy={busy}><p>Velg hvem som får lese eller administrere kontraktene. Brukeren må ha aktiv intern Bolig-tilgang i samme firma. Prosjektoppretterens tilgang følger prosjektlederrollen.</p><div className="bolig-contract-people">{snapshot.data.people.map(p=><label key={p.id}><span>{p.name}{!p.active?' · Ikke aktiv Bolig-tilgang':''}</span>{p.owner?<strong>Prosjektoppretter</strong>:p.id===context.user_id?<strong>Din administrasjonstilgang</strong>:<select aria-label={`Kontraktstilgang for ${p.name}`} value={p.role} disabled={busy} onChange={e=>{const role=e.target.value;run(async valid=>{await contractRpc(context,root.id,'grant',{user_id:p.id,role,revision:p.revision});if(valid())setNotice('Kontraktstilgangen er lagret.');});}}><option value="none">Ingen tilgang</option><option value="reader" disabled={!p.active}>Lese kontrakter</option><option value="manager" disabled={!p.active}>Laste opp og administrere</option></select>}</label>)}</div>{error&&<p role="alert">{error}</p>}</Dialog>}
  {opened==='history'&&selected&&snapshot?.scope===scope&&snapshot.data.allowed&&<Dialog title="Dokumentets versjoner" onClose={close} suspended={!data}><p>Tidligere originaler beholdes. Velg en versjon for å vise eller laste ned filen.</p>{history?<div className="bolig-contract-list">{history.versions.map(file=><article key={file.id}><div><h4>Versjon {file.version}</h4><p>{file.name}<br/>{date(file.created_at)} · {file.creator}</p>{file.comment&&<p>{file.comment}</p>}</div>{versionActions(file)}</article>)}</div>:<p role="status">Henter versjoner …</p>}</Dialog>}
  {opened==='preview'&&selected&&snapshot?.scope===scope&&snapshot.data.allowed&&<Dialog title="Privat dokumentvisning" className="bolig-contract-viewer" onClose={closePreview} suspended={!data}><p><strong>{selected.name}</strong> · Versjon {selected.version}</p>{viewUrl?(selected.mime==='application/pdf'?<iframe title="Originalt kontraktsdokument" data-bolig-contract-preview src={viewUrl+(selected.page?'#page='+selected.page:'')}/>:<img alt="Originalt kontraktsvedlegg" src={viewUrl}/>):<p role="status">Henter og bekrefter originalen …</p>}{error&&<p role="alert">{error}</p>}<button type="button" className="secondary" onClick={()=>fetchBytes(selected,'download')}>Last ned original</button><>{selected.fromReview&&<button type="button" className="secondary" onClick={closePreview}>Tilbake til gjennomgang</button>}</><p>Hvis nettleseren ikke viser dokumentet, kan du laste ned originalen og åpne den på enheten.</p></Dialog>}
 </section>;
}
