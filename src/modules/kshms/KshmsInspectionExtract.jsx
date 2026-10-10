import {useEffect,useRef,useState} from 'react';
import {kshmsRpc} from './kshmsAccess.js';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {EXTRACT_GROUPS,extractKey,loadExtractChoices,loadExtractPage,loadExtractRuns,loadExtractProjectDeviations,downloadInspectionExtract} from '../report/kshmsInspectionExtract.mjs';
import {loadInspectionAttachmentPreview,downloadInspectionAttachmentArchive,projectAttachmentObject} from '../report/kshmsAttachmentArchive.mjs';

const status=row=>row.kind==='legacy'?`${row.status} · eldre lagret tilstand`: row.kind==='reviews'?'Signert revisjon':row.number?`Publisert utgave ${row.number}`:({signed:'Signert',completed:'Fullført',closed:'Lukket',open:'Åpen',in_progress:'Under behandling',draft:row.kind==='sjas'?'Utkast - ikke signert':'Under arbeid - ikke fullført'})[row.status]||row.status;

export default function KshmsInspectionExtract({context}){
 const companyId=context.company_id,userId=context.user_id;
 const [catalog,setCatalog]=useState(null),[selected,setSelected]=useState([]),[scopeText,setScopeText]=useState(''),[query,setQuery]=useState(''),[projectId,setProjectId]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[confirmed,setConfirmed]=useState(false);
 const [attachmentPreview,setAttachmentPreview]=useState(null),[attachmentConfirmed,setAttachmentConfirmed]=useState(false);
 const clearAttachments=()=>{setAttachmentPreview(null);setAttachmentConfirmed(false);};
 const owner=useRef(null),sequence=useRef(0),locked=useRef(false),latest=useRef(''),cursors=useRef(new Set());
 const fingerprint=JSON.stringify([companyId,userId,context.enabled,context.manage,selected,scopeText,confirmed,attachmentConfirmed]);latest.current=fingerprint;
 useEffect(()=>{
  const token={active:true};owner.current=token;
  clearAttachments();setBusy(false);setError('');setNotice('');setCatalog(null);setSelected([]);setProjectId('');setConfirmed(false);setScopeText('');setQuery('');cursors.current.clear();
  return()=>{token.active=false;sequence.current++;};
 },[companyId,userId,context.enabled,context.manage]);
 const run=async(action)=>{
  if(locked.current||!context.enabled||!context.manage)return;
  const token=owner.current,id=++sequence.current,snapshot=fingerprint;
  const current=()=>token?.active&&owner.current===token&&id===sequence.current&&latest.current===snapshot;
  locked.current=true;setBusy(true);setError('');setNotice('');
  try{await action(current);}catch(cause){if(current())setError(cause.message);}finally{locked.current=false;if(token?.active&&owner.current===token)setBusy(false);}
 };
 const load=()=>run(async current=>{
  const next=await loadExtractChoices({rpc:kshmsRpc,companyId,userId,query:query.trim(),isCurrent:current});if(!next||!current())return;
  clearAttachments();setCatalog(next);setSelected([]);setProjectId('');setConfirmed(false);cursors.current.clear();
 });
 const more=kind=>run(async current=>{
  const cursor=catalog.groups[kind].next,key=kind+JSON.stringify(cursor);
  if(cursors.current.has(key))throw Error('Neste side er allerede hentet. Oppdater listen.');
  const page=await loadExtractPage({kind,rpc:kshmsRpc,companyId,userId,query:catalog.query||'',cursor,isCurrent:current});if(!page||!current())return;
  const existing=catalog.groups[kind].rows;if(page.rows.some(row=>existing.some(value=>value.id===row.id)))throw Error('Listen er endret under henting. Oppdater listen og velg på nytt.');
  cursors.current.add(key);setCatalog(previous=>({...previous,groups:{...previous.groups,[kind]:{...page,rows:[...existing,...page.rows]}}}));
 });
 const loadProject=()=>run(async current=>{
  const rows=await loadExtractRuns({rpc:kshmsRpc,companyId,userId,projectId,isCurrent:current});if(!rows||!current())return;
  setCatalog(previous=>({...previous,groups:{...previous.groups,runs:{rows}}}));
 });
 const readProject=async id=>{
  const client=getAppSupabaseClient();if(!client)throw Error('Appens innlogging er ikke klar.');
  const {data,error}=await client.from('projects').select('id,company_scope_id,deviations:data->project->projectDeviations').eq('id',id).eq('company_scope_id',companyId).maybeSingle();
  if(error||!data)throw Error('Prosjektavvikene kunne ikke hentes i aktivt firma.');return data;
 };
 const downloadProject=async file=>{
  const client=getAppSupabaseClient();if(!client)throw Error('Appens innlogging er ikke klar.');
  const object=projectAttachmentObject(file,client.supabaseUrl);const {data,error}=await client.storage.from('project-images').download(object);
  if(error)throw Error('Et prosjektvedlegg kunne ikke hentes. Ingen fil er laget.');return data;
 };
 const loadLegacy=()=>run(async current=>{
  const rows=await loadExtractProjectDeviations({rpc:kshmsRpc,readProject,companyId,userId,projectId,isCurrent:current});if(!rows||!current())return;
  setCatalog(previous=>({...previous,groups:{...previous.groups,legacy:{rows}}}));
 });
 const toggle=row=>{clearAttachments();setConfirmed(false);setNotice('');setSelected(previous=>previous.some(value=>extractKey(value)===extractKey(row))?previous.filter(value=>extractKey(value)!==extractKey(row)):[...previous,row]);};
 const download=()=>run(async current=>{
  const client=getAppSupabaseClient();if(!client)throw Error('Appens innlogging er ikke klar.');
  const result=await downloadInspectionExtract({selection:selected,scopeText,rpc:kshmsRpc,readProject,downloadProject,companyId,userId,isCurrent:current,downloadFile:async file=>{const {data,error:failure}=await client.storage.from('kshms-private').download(file.object_name);if(failure)throw Error('Et valgt avviksbilde kunne ikke hentes. Uttrekket er ikke laget.');return data;}});
  if(result&&current())setNotice(`PDF er laget med ${result.documents} valgte dokumenter og manifest (${result.pages} sider).${result.logoMissing?' Logoen kunne ikke hentes. Firmanavnet er brukt.':''}`);
 });
 const previewAttachments=()=>run(async current=>{
  const client=getAppSupabaseClient();if(!client)throw Error('Appens innlogging er ikke klar.');
  const preview=await loadInspectionAttachmentPreview({selection:selected,rpc:kshmsRpc,readProject,companyId,userId,isCurrent:current,storageUrl:client.supabaseUrl});
  if(preview&&current()){setAttachmentPreview(preview);setAttachmentConfirmed(false);}
 });
 const downloadAttachments=()=>run(async current=>{
  const client=getAppSupabaseClient();if(!client)throw Error('Appens innlogging er ikke klar.');
  const result=await downloadInspectionAttachmentArchive({preview:attachmentPreview,selection:selected,scopeText,rpc:kshmsRpc,readProject,companyId,userId,isCurrent:current,
   downloadPrivate:async file=>{const {data,error:failure}=await client.storage.from('kshms-private').download(file.object_name);if(failure)throw Error('Et avviksvedlegg kunne ikke hentes. Ingen vedleggspakke er laget.');return data;},
   downloadProject:async file=>{const object=projectAttachmentObject(file,client.supabaseUrl);const {data,error:failure}=await client.storage.from('project-images').download(object);if(failure)throw Error('Et prosjektvedlegg kunne ikke hentes. Ingen vedleggspakke er laget.');return data;}
  });
  if(result&&current())setNotice(`ZIP er laget med ${result.files} vedlegg og manifest. Kontroller innholdet før deling.`);
 });
 if(!context.enabled||!context.manage)return null;
 return <section className="ks-card" aria-label="Dokumentuttrekk">
  <h3>Samlet dokument- og tilsynsuttrekk</h3>
  <p>Beskriv hva du vil dokumentere. Hent listen og huk av dokumentene du trenger. Du kan laste ned en PDF med dokumentene, en ZIP-pakke med vedleggene, eller begge. Bruk «Last ned samlet PDF» for rapporten. For bilder og originalfiler: trykk «Vis vedleggslisten» lenger ned, bekreft listen og trykk «Last ned vedlegg (ZIP)».</p>
  <p className="ks-field-hint">Du får lagret dokumentasjon. Ulagrede endringer følger ikke med. RUH, kvalitet- og HMS-avvik inkluderer hele historikken og lagrede bilder. Disse gruppene viser saker fra KS/HMS-avvikssentralen. Ukoblede eldre prosjektavvik kan hentes for valgt prosjekt. De viser lagret tilstand uten versjonert historikk eller KS/HMS-signatur. Andre originalfiler følger ikke PDF-en. Bruk vedleggslisten nedenfor for en egen ZIP-pakke. HR, fortrolige varslinger, ansattes lesebekreftelser og opplæringsbevis tas ikke med. Uttrekket er ingen tilsynsgodkjenning.</p>
  <label className="ks-field"><span>Omfang / hva skal dokumenteres?</span><textarea value={scopeText} disabled={busy} maxLength={2000} rows={2} onChange={event=>{clearAttachments();setScopeText(event.target.value);setConfirmed(false);setNotice('');}} placeholder="For eksempel: Kontroll av arbeid på testprosjekt, oktober 2026"/></label>
  <label className="ks-field"><span>Søk etter SJA, avvik, RUH, kontroller og risiko</span><input value={query} disabled={busy} maxLength={160} onChange={event=>setQuery(event.target.value)}/></label>
  <button type="button" disabled={busy} onClick={load}>{catalog?'Oppdater dokumentlisten':'Hent dokumentlisten'}</button>
  {catalog&&<>
   <p>Ingen dokumenter velges automatisk. Oppdatering av listen tømmer valget. Rutine- og malutgaver vises også når de er historiske; kontroller status i PDF-en.</p>
   <label className="ks-field"><span>Prosjekt for lagrede kontroller og eldre avvik</span><select value={projectId} disabled={busy} onChange={event=>{setProjectId(event.target.value);setCatalog(previous=>({...previous,groups:{...previous.groups,runs:{rows:[]},legacy:{rows:[]}}}));}}><option value="">Velg et tilgjengelig prosjekt</option>{catalog.projects.map(project=><option value={project.id} key={project.id}>{project.name||project.id}</option>)}</select></label>
   {catalog.projectTotal>catalog.projects.length&&<p className="ks-field-hint">Viser de {catalog.projects.length} senest tilgjengelige prosjektene av {catalog.projectTotal}. Prosjektlisten er avgrenset.</p>}
   <button type="button" className="secondary" disabled={busy||!projectId} onClick={loadProject}>Hent prosjektkontroller</button>
   <button type="button" className="secondary" disabled={busy||!projectId} onClick={loadLegacy}>Hent eldre prosjektavvik</button>
   {Object.entries(EXTRACT_GROUPS).map(([kind,label])=><details className="ks-followup-section" key={kind}>
    <summary>{label} ({catalog.groups[kind].rows.length})</summary>
    <fieldset disabled={busy}><legend>Velg {label.toLowerCase()}</legend>
     {!catalog.groups[kind].rows.length&&<p>Ingen dokumenter hentet i denne gruppen.</p>}
     {catalog.groups[kind].rows.map(row=><label className="ks-report-option" key={extractKey(row)}><input type="checkbox" checked={selected.some(value=>extractKey(value)===extractKey(row))} onChange={()=>toggle(row)}/><span><strong>{row.title}</strong><br/>{status(row)} · {row.id}</span></label>)}
    </fieldset>
    {catalog.groups[kind].next&&<button type="button" className="secondary" disabled={busy} onClick={()=>more(kind)}>Hent flere {label.toLowerCase()}</button>}
    {kind==='sjas'&&catalog.groups.sjas.total>catalog.groups.sjas.rows.length&&<p>Viser {catalog.groups.sjas.rows.length} av {catalog.groups.sjas.total} treff. Bruk søket og hent listen på nytt for å finne eldre analyser.</p>}
   </details>)}
   <h4>Dette blir med i PDF-en ({selected.length})</h4>
   {selected.length?<ul>{selected.map(row=><li key={extractKey(row)}>{EXTRACT_GROUPS[row.kind]}: {row.title} · {status(row)} <button type="button" className="secondary" disabled={busy} onClick={()=>toggle(row)} aria-label={`Fjern ${row.title} fra uttrekket`}>Fjern</button></li>)}</ul>:<p>Velg dokumenter i gruppene over.</p>}
   <label className="ks-report-option"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event=>setConfirmed(event.target.checked)}/><span>Jeg har kontrollert omfanget og dokumentvalget. Jeg vurderer innhold og mottaker før jeg deler filen.</span></label>
   <div className="ks-actions"><button type="button" disabled={busy||!confirmed||!scopeText.trim()||!selected.length||selected.length>50} onClick={download}>{busy?'Arbeider …':'Last ned samlet PDF'}</button><button type="button" className="secondary" disabled={busy||!selected.length} onClick={()=>{clearAttachments();setSelected([]);setConfirmed(false);setNotice('');}}>Tøm dokumentvalget</button></div>
   {selected.length>50&&<p role="alert">Velg maksimalt 50 dokumenter per uttrekk.</p>}
   <h4>Vedlegg til valgte dokumenter</h4>
   <p>Trykk «Vis vedleggslisten» først. Deretter vises bekreftelsen og knappen «Last ned vedlegg (ZIP)». ZIP samler bildene og originalfilene i én pakke, så du slipper å hente dem enkeltvis. Bruk pakken når du trenger filene separat til eget arkiv eller sammen med rapporten. Pakken kan inneholde lagrede kvalitet-/HMS-/RUH-filer, SJA-bilder, bilder til farer i risikovurderinger, vernerunde-bilder, prosjektkontrollvedlegg og vedlegg til valgte eldre prosjektavvik. Rapporten følger bare PDF-nedlastingen. Bilder følger slik de er lagret i appen. ZIP er ikke kryptert.</p>
   <button type="button" className="secondary" disabled={busy||!selected.length||selected.length>50} onClick={previewAttachments}>Vis vedleggslisten</button>
   {attachmentPreview&&<>
    <p>{attachmentPreview.entries.length} vedlegg. Maksimalt 100 vedlegg, 10 MB per fil og 50 MB per pakke. Pakken inneholder mappen «vedlegg» og filen «manifest.json». Manifestet er en filoversikt som viser hvilket dokument og punkt hver fil hører til, og en kontrollsum for filinnholdet. Behold filoversikten sammen med vedleggene.</p>
    {attachmentPreview.entries.length?<ul aria-label="Vedleggslisten">{attachmentPreview.entries.map((entry,index)=><li key={`${entry.documentId}:${index}`}><strong>{entry.name}</strong> · {entry.documentTitle}{entry.point?` / ${entry.point}`:''} · {entry.type} · {entry.size?`${entry.size} byte`:'Størrelse kontrolleres ved nedlasting'}</li>)}</ul>:<p>Ingen støttede vedlegg er lagret på de valgte dokumentene. Ingen ZIP kan lastes ned.</p>}
    <label className="ks-report-option"><input type="checkbox" checked={attachmentConfirmed} disabled={busy||!attachmentPreview.entries.length} onChange={event=>setAttachmentConfirmed(event.target.checked)}/><span>Jeg har kontrollert vedleggslisten. Jeg vurderer innhold og mottaker før jeg deler filene.</span></label>
    <button type="button" disabled={busy||!attachmentConfirmed||!attachmentPreview.entries.length||!scopeText.trim()} onClick={downloadAttachments}>Last ned vedlegg (ZIP)</button>
   </>}

  </>}
  {busy&&<p role="status">Henter og kontrollerer lagret dokumentasjon …</p>}
  {error&&<p role="alert" className="ks-error">{error}</p>}
  {notice&&<p role="status" className="ks-notice">{notice}</p>}
 </section>;
}
