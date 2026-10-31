import ChecklistSignatures from './ChecklistSignatures.jsx';
import ChecklistFirmTemplate from './ChecklistFirmTemplate.jsx';
import {emptySignatures} from './checklistSignatures.mjs';
import {useEffect,useRef,useState} from 'react';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import ChecklistFields,{ChecklistFieldBuilder} from './ChecklistFields.jsx';
import {invalidateFieldConfirmations} from './checklistFields.mjs';
import {blankChecklist,checklistContent,CHECKLIST_TRADES} from '../kshms/kshmsChecklists.mjs';
import {prepareKshmsPhoto} from '../kshms/kshmsExecutions.mjs';
import {kshmsRpc} from '../kshms/kshmsAccess.js';
import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {WORK_PROFILE_EVENT} from '../access/workProfileClient.js';
import {MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT} from '../access/moduleAccessClient.js';
import {loadCompanyLogo} from '../report/kshmsExecutionReport.mjs';
import {createStandaloneChecklistPdf} from '../../../supabase/functions/_shared/standalone-checklist-pdf.mjs';
import {checkStandaloneScope,readStandaloneDraft,saveStandaloneChecklist,standaloneDraftKey,standaloneMailKey,standaloneDetailsProblem,standaloneProblem} from './standaloneChecklists.mjs';
import {sameRunValue} from './checklistRuns.mjs';
import './standaloneChecklists.css';

export default function StandaloneChecklists({companyId,userId,onClose}){
 const [data,setData]=useState(null),[selected,setSelected]=useState(null),[dirty,setDirty]=useState(false),[cached,setCached]=useState(null);
 const [version,setVersion]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[denied,setDenied]=useState(false);
 const [recipient,setRecipient]=useState(''),[confirmed,setConfirmed]=useState(false),[pending,setPending]=useState(null),[history,setHistory]=useState([]);
 const scope=useRef(null),selection=useRef(null),lock=useRef(false),loadSequence=useRef(0);selection.current=selected;
 const current=token=>token?.active&&scope.current===token;
 const load=async(token,append=false)=>{
  const serial=++loadSequence.current;
  const state=await kshmsRpc('standalone_checklist_workspace',{p_company_id:companyId,...(append&&data?.next?{p_before:data.next.updated_at,p_before_id:data.next.id}:{})});
  if(!current(token)||serial!==loadSequence.current)return null;
  checkStandaloneScope(state,companyId,userId);setDenied(false);
  setData(previous=>append?{...state,records:[...previous.records,...state.records]}:state);return state;
 };
 useEffect(()=>{
  const token={active:true};scope.current=token;selection.current=null;setSelected(null);setData(null);setError('');setDenied(false);setBusy(false);setCached(readStandaloneDraft(window.localStorage,userId,companyId));
  const refresh=event=>{
   if(event?.type===WORK_PROFILE_EVENT&&event.detail?.active_company_id!==companyId){token.active=false;setDenied(true);setSelected(null);setData(null);return;}
   load(token).catch(e=>{if(current(token)){setDenied(true);setError(e.message);}});
  };
  refresh();const events=['focus',WORK_PROFILE_EVENT,MANAGED_ACCESS_EVENT,MODULE_ACCESS_EVENT];events.forEach(name=>window.addEventListener(name,refresh));
  return()=>{token.active=false;loadSequence.current++;events.forEach(name=>window.removeEventListener(name,refresh));};
 },[companyId,userId]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const remember=next=>{
  selection.current=next;setSelected(next);setDirty(true);setNotice('');setConfirmed(false);
  try{window.localStorage.setItem(standaloneDraftKey(userId,companyId),JSON.stringify(next));setCached(next);}catch{setError('Kladden kunne ikke sikres på enheten. Behold vinduet åpent til du har lagret.');}
 };
 const choose=(row,isLocal=false)=>{
  selection.current=row;setSelected(row);setDirty(isLocal||!row.revision);setError('');setNotice('');setHistory([]);setConfirmed(false);
  let mail=null;try{mail=JSON.parse(window.localStorage.getItem(standaloneMailKey(userId,companyId,row.id)));}catch{}
  setPending(mail?.requestId?mail:null);setRecipient(mail?.to||'');
 };
 const start=()=>{
  if(lock.current||denied)return;
  const v=data.versions.find(row=>row.id===version),own=blankChecklist();
  const next={id:crypto.randomUUID(),revision:0,requestId:crypto.randomUUID(),version_id:v?.id||null,definition:v?.content||own.content,answers:{},order_number:'',work_site:'',external_project:'',customer_name:'',status:'draft'};
  if(cached&&cached.id!==next.id){setNotice('Du har en usendt kladd. Fortsett den før du starter en ny liste.');return;}
  choose(next);remember(next);
 };
 const discard=()=>{
  if(lock.current||!cached||cached.pendingAction)return;
  if(!window.confirm('Forkaste den lokale kladden? Svar som ikke er lagret, blir fjernet fra denne enheten. Lagrede sjekklister beholdes.'))return;
  try{window.localStorage.removeItem(standaloneDraftKey(userId,companyId));setCached(null);setDirty(false);setNotice('Den lokale kladden er forkastet. Du kan starte en ny sjekkliste.');}catch{setError('Kladden kunne ikke fjernes fra enheten.');}
 };
 const open=async(row,viewSaved=false)=>{
  if(lock.current)return;const token=scope.current;lock.current=true;setBusy(true);setError('');
  try{const state=await kshmsRpc('standalone_checklist_workspace',{p_company_id:companyId,p_id:row.id});if(!current(token))return;checkStandaloneScope(state,companyId,userId);
   if(state.record?.company_id!==companyId||state.record.created_by!==userId||state.record.id!==row.id)throw Error('Sjekklisten er ikke tilgjengelig.');
   const local=readStandaloneDraft(window.localStorage,userId,companyId);
   const otherDraft=local&&local.id!==row.id;
   choose(!viewSaved&&local?.id===row.id?local:{...state.record,requestId:crypto.randomUUID(),viewSaved:viewSaved||Boolean(otherDraft)},!viewSaved&&local?.id===row.id);
   if(otherDraft)setNotice('Du ser den lagrede sjekklisten. Fortsett eller forkast den andre lokale kladden før du redigerer en annen liste.');
   setHistory(state.mail_history||[]);
   if(!viewSaved&&local?.id===row.id&&local.revision!==state.record.revision)setError('Det finnes en nyere lagret utgave. Kladden er beholdt. Velg Vis lagret sjekkliste for å sammenligne.');
  }catch(e){if(current(token))setError(e.message);}finally{lock.current=false;if(current(token))setBusy(false);}
 };
 const change=patch=>{if(lock.current||pending||selected?.pendingAction||selected?.viewSaved||selected?.status==='completed')return;const row=selection.current;if(!Object.hasOwn(patch,'signatures'))patch.signatures=emptySignatures();if((patch.definition||['order_number','work_site','external_project','customer_name'].some(k=>Object.hasOwn(patch,k)))&&row.definition.points.length)patch.answers=invalidateFieldConfirmations(row.definition.points.map(p=>p.id),Object.fromEntries(row.definition.points.map(p=>[p.id,p])),row.answers,row.definition.points[0].id);remember({...row,...patch,requestId:crypto.randomUUID(),pendingAction:null});};
 const answer=(id,patch,confirmationId=null)=>{
  const row=selection.current,points=row.definition.points;
  const answers=invalidateFieldConfirmations(points.map(p=>p.id),Object.fromEntries(points.map(p=>[p.id,p])),{...row.answers,[id]:{...row.answers[id],...patch}},id,confirmationId);
  change({answers});
 };
 const save=async action=>{
  if(lock.current||pending||denied||!selection.current)return;const token=scope.current;
  let row={...selection.current,signatureContract:selection.current.pendingAction?selection.current.signatureContract:'execution-v1',pendingAction:selection.current.pendingAction||action};
  const detailsProblem=standaloneDetailsProblem(row);if(detailsProblem){setError(detailsProblem);return;}
  try{if(!row.version_id)row={...row,definition:checklistContent(row.definition)};}catch(e){setError(e.message);return;}
  if(action==='complete'){const problem=standaloneProblem(row);if(problem){setError(problem);return;}}
  remember(row);lock.current=true;setBusy(true);setError('');
  try{const state=await saveStandaloneChecklist({rpc:kshmsRpc,companyId,userId,draft:row,action:row.pendingAction,isCurrent:()=>current(token)});if(!state||!current(token))return;
   const saved={...state.record,requestId:crypto.randomUUID()};selection.current=saved;setSelected(saved);setDirty(false);setCached(null);setHistory(state.mail_history||[]);
   window.localStorage.removeItem(standaloneDraftKey(userId,companyId));setNotice(action==='complete'?'Sjekklisten er fullført og lagret.':'Sjekklisten er lagret. Du kan fortsette senere.');try{await load(token);}catch{if(current(token))setError('Sjekklisten er lagret. Oversikten kunne ikke oppdateres. Lukk og åpne vinduet på nytt.');}
  }catch(e){if(current(token)){if(['22023','P0001'].includes(e.code)){const recover={...selection.current,pendingAction:null};selection.current=recover;setSelected(recover);window.localStorage.setItem(standaloneDraftKey(userId,companyId),JSON.stringify(recover));setCached(recover);}setError(e.message+' Kladden er beholdt.');}}finally{lock.current=false;if(current(token))setBusy(false);}
 };
 const pdf=async()=>{
  if(lock.current||dirty||denied||!selected?.revision)return;const token=scope.current,row=selection.current;lock.current=true;setBusy(true);setError('');
  const read=async()=>{const s=await kshmsRpc('standalone_checklist_workspace',{p_company_id:companyId,p_id:row.id});if(!current(token))return null;checkStandaloneScope(s,companyId,userId);if(s.record?.id!==row.id||s.record.created_by!==userId||s.record.revision!==row.revision)throw Error('En nyere sjekkliste er lagret. Åpne den på nytt før PDF.');return s;};
  try{if(!await read())return;const company=await kshmsRpc('work_profile_company_profile',{p_company_id:companyId});if(!current(token))return;if(company.companyId!==companyId)throw Error('Firmaprofilen kunne ikke bekreftes.');
   const {jsPDF}=await import('https://esm.sh/jspdf@2.5.1'),logo=company.logoUrl?await loadCompanyLogo(company.logoUrl):null;if(!current(token)||!await read())return;
   const {doc,fileName}=createStandaloneChecklistPdf({JsPDF:jsPDF,record:row,company,logo});doc.save(fileName);setNotice('PDF-en er lastet ned fra den lagrede sjekklisten.');
  }catch(e){if(current(token))setError(e.message);}finally{lock.current=false;if(current(token))setBusy(false);}
 };
 const send=async()=>{
  if(lock.current||dirty||denied||!selected?.revision||!confirmed&&!pending)return;const token=scope.current,row=selection.current;
  const mail=pending||{requestId:crypto.randomUUID(),id:row.id,revision:row.revision,to:recipient.trim()};
  if(!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(mail.to)||mail.to.length>254){setError('Skriv én gyldig e-postadresse.');return;}
  try{window.localStorage.setItem(standaloneMailKey(userId,companyId,row.id),JSON.stringify(mail));}catch{setError('Sendingen kunne ikke sikres for trygg gjentakelse. Ingen e-post er sendt.');return;}
  setPending(mail);lock.current=true;setBusy(true);setError('');
  try{const client=getAppSupabaseClient();if(!client)throw Error('Appens innlogging er ikke klar.');
   const {data:result,error:failure}=await client.functions.invoke('standalone-checklist-email',{body:{...mail,companyId}});if(!current(token))return;
   if(failure||!result?.ok){let problem=result;try{if(!problem&&failure?.context?.json)problem=await failure.context.json();}catch{}if(problem?.uncertain===false){window.localStorage.removeItem(standaloneMailKey(userId,companyId,row.id));setPending(null);}throw Error(problem?.error||'Sendingen kunne ikke bekreftes. Prøv samme sending igjen.');}
   window.localStorage.removeItem(standaloneMailKey(userId,companyId,row.id));setPending(null);setConfirmed(false);setNotice('E-posttjenesten har tatt imot PDF-en. Dette bekrefter ikke mottak i innboksen.');
   const s=await kshmsRpc('standalone_checklist_workspace',{p_company_id:companyId,p_id:row.id});if(current(token)){checkStandaloneScope(s,companyId,userId);setHistory(s.mail_history||[]);}
  }catch(e){if(current(token))setError(e.message);}finally{lock.current=false;if(current(token))setBusy(false);}
 };
 const photo=async(id,files)=>{
  if(lock.current||denied||pending)return;const token=scope.current;lock.current=true;setBusy(true);setError('');
  try{const photos=[...(selection.current.answers[id]?.photos||[])];for(const file of files)photos.push(await prepareKshmsPhoto(file));if(photos.length>3)throw Error('Bruk inntil tre bilder per sjekkpunkt.');if(current(token)){lock.current=false;answer(id,{photos});}}
  catch(e){if(current(token))setError(e.message);}finally{lock.current=false;if(current(token))setBusy(false);}
 };
 const missingDetails=selected?standaloneDetailsProblem(selected):'';
 const readonly=selected?.status==='completed'||selected?.viewSaved||Boolean(pending),editableDefinition=!selected?.revision&&!selected?.version_id;
 return <DeviationDialog title="Sjekklister" context="Eksterne prosjekter · Fyll ut, lagre og send PDF" onClose={()=>{if(!lock.current)onClose();}} busy={busy} closeLabel="Lukk sjekklister">
  <div className="standalone-checklists">
   <p>Fyll ut en sjekkliste for et eksternt prosjekt, uten å opprette et ProffDok-prosjekt. Ordrenummer og arbeidssted/adresse er påkrevd. Opplysningene følger PDF-en. Lagre før du laster ned eller sender.</p>
   {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
   {denied?<p>Firmatilgangen må kontrolleres før du fortsetter. Din lokale kladd er beholdt.</p>:!data?<p role="status">Henter sjekklister …</p>:!selected?<>
    <label>Velg sjekkliste<select aria-label="Velg sjekkliste" value={version} onChange={e=>setVersion(e.target.value)}><option value="">Egen sjekkliste</option>{data.versions.map(v=><option key={v.id} value={v.id}>{v.content.title} · v{v.number}</option>)}</select></label>
    <div className="standalone-actions"><button type="button" disabled={busy||Boolean(cached)} onClick={start}>Start sjekkliste</button>{cached&&<><button type="button" disabled={busy} onClick={()=>choose(cached,true)}>Fortsett lokal kladd</button><button type="button" disabled={busy||Boolean(cached.pendingAction)} onClick={discard}>Forkast lokal kladd</button></>}</div>
    <h3>Mine lagrede sjekklister</h3>{!data.records.length&&<p>Du har ingen lagrede sjekklister i dette firmaet.</p>}
    {data.records.map(r=><article key={r.id}><h4>{r.title}</h4><p>{r.status==='completed'?'Fullført':'Under arbeid'}{r.order_number?` · Ordre ${r.order_number}`:''}{r.work_site?` · ${r.work_site}`:''}{r.external_project?` · ${r.external_project}`:''} · {new Date(r.updated_at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'})}</p><button type="button" disabled={busy} onClick={()=>open(r)}>Åpne sjekkliste</button></article>)}
    {data.next&&<button type="button" disabled={busy} onClick={()=>load(scope.current,true).catch(e=>setError(e.message))}>Vis flere sjekklister</button>}
   </>:<>
    <div className="standalone-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>{selection.current=null;setSelected(null);setError('');setNotice('');}}>Tilbake til sjekklistene</button>{dirty&&(selected.revision>0||selected.pendingAction)&&<button type="button" disabled={busy} onClick={()=>open(selected,true)}>Vis lagret sjekkliste</button>}</div>
    {selected.viewSaved&&selected.status==='draft'&&cached?.id===selected.id&&sameRunValue(cached.definition,selected.definition)&&<button type="button" disabled={busy} onClick={()=>{const points=cached.definition.points;const answers=points.length?invalidateFieldConfirmations(points.map(p=>p.id),Object.fromEntries(points.map(p=>[p.id,p])),cached.answers,points[0].id):cached.answers;remember({...cached,revision:selected.revision,status:'draft',answers,viewSaved:false,pendingAction:null,requestId:crypto.randomUUID()});}}>Fortsett med min kladd på nyeste revisjon</button>}
    {selected.status==='completed'&&missingDetails&&<p role="status">Denne tidligere listen mangler ordrenummer eller arbeidssted. Opprett en ny sporbar sjekkliste før PDF-eksport.</p>}
    <p>{selected.status==='completed'?'Fullført sjekkliste – lagret dokumentasjon':dirty?'Kladd – lagre før PDF eller e-post':'Svarene er lagret'}</p>
    <fieldset disabled={busy||readonly||Boolean(selected.pendingAction)}>
     <label>Ordrenummer (påkrevd)<input required value={selected.order_number||''} maxLength={100} onChange={e=>change({order_number:e.target.value})}/></label>
     <label>Arbeidssted/adresse (påkrevd)<input required value={selected.work_site||''} maxLength={400} onChange={e=>change({work_site:e.target.value})}/></label>
     <label>Eksternt prosjektnavn (valgfritt)<input value={selected.external_project||''} maxLength={200} onChange={e=>change({external_project:e.target.value})}/></label>
     <label>Kunde/oppdragsgiver (valgfritt)<input value={selected.customer_name||''} maxLength={160} onChange={e=>change({customer_name:e.target.value})}/></label>
     {editableDefinition?<><label>Navn på sjekklisten<input value={selected.definition.title} maxLength={160} onChange={e=>change({definition:{...selected.definition,title:e.target.value}})}/></label><label>Fag<select value={selected.definition.trade} onChange={e=>change({definition:{...selected.definition,trade:e.target.value}})}>{CHECKLIST_TRADES.map(t=><option key={t}>{t}</option>)}</select></label></>:<h3>{selected.definition.title}</h3>}
     {selected.definition.instructions&&<p>{selected.definition.instructions}</p>}
     {selected.definition.points.map((p,i)=>{const a=selected.answers[p.id]||{};const pointChange=patch=>change({definition:{...selected.definition,points:selected.definition.points.map(point=>point.id===p.id?{...point,...patch}:point)}});return <fieldset className="standalone-point" key={p.id}><legend>Sjekkpunkt {i+1}</legend>
      {editableDefinition?<><label>Tekst for sjekkpunkt {i+1}<input maxLength={600} value={p.title} onChange={e=>pointChange({title:e.target.value})}/></label><ChecklistFieldBuilder fields={p.fields||[]} onChange={fields=>pointChange({fields})}/>{selected.definition.points.length>1&&<button type="button" onClick={()=>change({definition:{...selected.definition,points:selected.definition.points.filter(point=>point.id!==p.id)}})}>Fjern sjekkpunkt {i+1}</button>}</>:<h4>{p.title}</h4>}
      {p.guidance&&<p>{p.guidance}</p>}
      <label>Svar på sjekkpunkt {i+1}<select aria-label={`Svar på sjekkpunkt ${i+1}`} value={a.status||''} onChange={e=>answer(p.id,{status:e.target.value})}><option value="">Velg svar</option><option>Ok</option><option>Avvik</option>{p.allow_na!==false&&<option>Ikke aktuelt</option>}</select></label>
      {a.status!=='Ikke aktuelt'&&<ChecklistFields fields={p.fields||[]} values={a.values||{}} userId={userId} readOnly={readonly} onChange={(values,confirmationId)=>answer(p.id,{values},confirmationId)}/>}
      <label>Kommentar til sjekkpunkt {i+1}{p.comment_required||a.status==='Avvik'?' (påkrevd)':''}<textarea aria-label={`Kommentar til sjekkpunkt ${i+1}${p.comment_required||a.status==='Avvik'?' (påkrevd)':''}`} rows={2} maxLength={20000} value={a.comment||''} onChange={e=>answer(p.id,{comment:e.target.value})}/></label>
      <p>{p.image_required?'Bilde er påkrevd når punktet er aktuelt.':'Bilder er valgfritt.'}</p><label>Bilder til sjekkpunkt {i+1}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={readonly||busy} onChange={e=>{photo(p.id,[...e.target.files]);e.target.value='';}}/></label>
      <div className="standalone-photos">{(a.photos||[]).map((file,index)=><figure key={file.id||index}><img src={file.data} alt={`Dokumentasjonsbilde ${index+1} til sjekkpunkt ${i+1}`}/>{!readonly&&<button type="button" onClick={()=>answer(p.id,{photos:a.photos.filter((_,j)=>j!==index)})}>Fjern bilde {index+1}</button>}</figure>)}</div>
     </fieldset>;})}
     {editableDefinition&&<button type="button" disabled={selected.definition.points.length>=100} onClick={()=>change({definition:{...selected.definition,points:[...selected.definition.points,{id:crypto.randomUUID(),title:'',guidance:'',image_required:false,comment_required:false}]}})}>Legg til sjekkpunkt</button>}
    </fieldset>
    <ChecklistSignatures value={selected.signatures} onChange={signatures=>change({signatures})} readOnly={readonly} disabled={busy||Boolean(selected.pendingAction)} status={selected.status}/>
    {!readonly&&<div className="standalone-actions"><button type="button" disabled={busy||!dirty} onClick={()=>save('save')}>{selected.pendingAction?'Prøv samme lagring igjen':'Lagre sjekkliste'}</button><button type="button" disabled={busy||Boolean(selected.pendingAction)} onClick={()=>save('complete')}>Fullfør sjekkliste</button></div>}
    <div className="standalone-actions"><button type="button" disabled={busy||dirty||!selected.revision||Boolean(missingDetails)} onClick={pdf}>Last ned PDF</button></div>
    <fieldset disabled={busy||dirty||!selected.revision||Boolean(missingDetails)}><legend>Send PDF på e-post</legend>
     <label>E-postadresse<input type="email" maxLength={254} value={recipient} disabled={Boolean(pending)} onChange={e=>{setRecipient(e.target.value);setConfirmed(false);}}/></label>
     <label className="standalone-choice"><input type="checkbox" checked={confirmed} disabled={Boolean(pending)} onChange={e=>setConfirmed(e.target.checked)}/>Jeg har kontrollert mottakeren og vil sende denne lagrede sjekklisten.</label>
     <button type="button" disabled={busy||!pending&&!confirmed} onClick={send}>{pending?'Prøv samme sending igjen':'Send PDF'}</button>
     {pending&&<p>En sending må avklares. Samme dokument og mottaker brukes ved nytt forsøk.</p>}
    </fieldset>
    <ChecklistFirmTemplate key={selected.id} companyId={companyId} userId={userId} recordId={selected.id} definition={selected.definition} disabled={busy||Boolean(selected.pendingAction)||Boolean(pending)} onPublished={()=>load(scope.current)}/>
    {!!history.length&&<details><summary>Sendingshistorikk</summary><ul>{history.map(h=><li key={h.id}>{h.recipient} · revisjon {h.revision} · {h.sent_at?'Tatt imot av e-posttjenesten':'Ikke avklart'}</li>)}</ul></details>}
   </>}
  </div>
 </DeviationDialog>;
}
