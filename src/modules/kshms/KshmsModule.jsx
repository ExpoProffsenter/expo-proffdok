import { useEffect,useId,useRef,useState } from 'react';
import { ACK_STATEMENT,CHAPTERS,ROUTINE_CATALOG,TRADES,blankRoutine,currentVersionSnapshot,suggestedRoutines } from './kshmsCatalog.mjs';
import { draftKey,persistDraft,readDraft } from './kshmsDraft.mjs';
import { kshmsRpc } from './kshmsAccess.js';
import { publishManagedAccessChange } from '../access/moduleAccessClient.js';
import { addLibraryRoutines } from './kshmsLibrary.mjs';
import KshmsRoutineLibrary from './KshmsRoutineLibrary.jsx';
import './kshms.css';
const dateTime = value => new Date(value).toLocaleString('nb-NO');
const sourceTypes = {law:'Lov eller forskrift',professional:'Fag, veiledning eller kontrakt',company:'Firmaets egne regler',product:'ProffDoks valg'};
const emptySetup = {trades:[],activities:'',responsibilities:'',risks:'',responsible_user_id:'',revision:0};
function Field({label,hint,value,onChange,type='text',multiline=false,required=false}) {
 const id=useId();
 const description=hint?`${id}-hint`:undefined;
 return <label className="ks-field" htmlFor={id}><span id={`${id}-label`}>{label}</span>{multiline ? <textarea id={id} aria-labelledby={`${id}-label`} aria-describedby={description} value={value||''} onChange={e=>onChange(e.target.value)} rows={5} required={required} maxLength={20000}/> : <input id={id} aria-labelledby={`${id}-label`} aria-describedby={description} type={type} value={value||''} onChange={e=>onChange(e.target.value)} required={required} maxLength={20000}/>} {hint&&<span id={description} className="ks-field-hint">{hint}</span>}</label>;
}
function Content({content}) {
 return <div className="ks-content">{[['Mål','goal'],['Ansvar','responsibility'],['Fremgangsmåte','procedure'],['Dokumentasjon','documentation'],['Gjennomgang','confirmation']].map(([label,key])=><div key={key}><h4>{label}</h4><p>{content[key]}</p></div>)}
 <h4>Regler og kilder</h4><ul>{(content.references||[]).map((r,i)=><li key={i}><a href={/^https:\/\//.test(r.url)?r.url:undefined} target="_blank" rel="noreferrer">{r.title||r.url}</a> · {sourceTypes[r.kind]||r.kind} · kontrollert {r.checked_on}</li>)}</ul>
 </div>;
}
function validateReferences(refs) {
 for(const r of refs)if(!r.title?.trim()||!/^https:\/\//.test(r.url||'')||!Object.hasOwn(sourceTypes,r.kind)||!/^\d{4}-\d{2}-\d{2}$/.test(r.checked_on||''))throw new Error('Hver kilde må ha navn, https-lenke, type og kontrolldato.');
 return refs;
}
function References({value,onChange}) {
 const update=(i,key,next)=>onChange(value.map((r,index)=>index===i?{...r,[key]:next}:r));
 return <fieldset><legend>Regler og kilder</legend><p>Legg inn lenker til reglene rutinen bygger på. Velg om kilden er en lov, et fag- eller kontraktskrav, firmaets egen regel eller et valg i ProffDok. Skriv datoen du sjekket kilden.</p>{value.map((r,i)=><div className="ks-reference" key={i}>
  <Field label={`Kildenavn ${i+1}`} value={r.title} required onChange={v=>update(i,'title',v)}/><Field label={`Lenke til kilde ${i+1}`} value={r.url} type="url" required onChange={v=>update(i,'url',v)}/>
  <label className="ks-field"><span>Kildetype {i+1}</span><select value={r.kind} onChange={e=>update(i,'kind',e.target.value)}>{Object.entries(sourceTypes).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
  <Field label={`Kontrollert dato ${i+1}`} value={r.checked_on} type="date" required onChange={v=>update(i,'checked_on',v)}/>
  <button type="button" className="secondary" onClick={()=>onChange(value.filter((_,index)=>index!==i))}>Fjern kilde {i+1}</button>
 </div>)}<button type="button" className="secondary" onClick={()=>onChange([...value,{title:'',url:'',kind:'law',checked_on:new Date().toISOString().slice(0,10)}])}>Legg til kilde</button></fieldset>;
}
export default function KshmsModule({context}) {
 const companyId=context.company_id,userId=context.user_id;
 const [data,setData]=useState(null),[screen,setScreen]=useState('handbook'),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [setup,setSetup]=useState(emptySetup),[editor,setEditor]=useState(null),[sources,setSources]=useState([]),[dirty,setDirty]=useState(false),[cached,setCached]=useState(null),[proposal,setProposal]=useState(null);
 const [publication,setPublication]=useState(null),[summary,setSummary]=useState(''),[freshAck,setFreshAck]=useState(true);
 const [reading,setReading]=useState(null),[checked,setChecked]=useState(false);
 const [findings,setFindings]=useState(''),[followUp,setFollowUp]=useState(''),[nextReview,setNextReview]=useState(''),[reviewChecked,setReviewChecked]=useState(false);
 const [selectedKeys,setSelectedKeys]=useState([]),[libraryFilter,setLibraryFilter]=useState('recommended'),[libraryPreview,setLibraryPreview]=useState(null),[libraryProgress,setLibraryProgress]=useState(null),[libraryFeedback,setLibraryFeedback]=useState(null);
 const requestScope=useRef(null),editorRef=useRef(null),libraryPreviewRef=useRef(null),[editorFocus,setEditorFocus]=useState(0);
 const load = async()=>{const value=await kshmsRpc('kshms_get_state',{p_company_id:companyId});setData(value);return value;};
 useEffect(()=>{let active=true;const scope={active:true};requestScope.current=scope;setData(null);setError('');setBusy(false);setLibraryProgress(null);
  kshmsRpc('kshms_get_state',{p_company_id:companyId}).then(value=>{if(active){setData(value);setSetup(value.settings||emptySetup);setCached(readDraft(window.localStorage,userId,companyId));setNextReview(value.settings?.next_review_on||new Date(Date.now()+360*86400000).toISOString().slice(0,10));}}).catch(e=>{if(active)setError(e.message)});
  return()=>{active=false;scope.active=false};
 },[companyId,userId,context.manage,context.publish]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 useEffect(()=>{if(editorFocus&&editorRef.current){editorRef.current.focus();editorRef.current.scrollIntoView({block:'start'});}},[editorFocus]);
 useEffect(()=>{if(libraryPreview&&libraryPreviewRef.current){libraryPreviewRef.current.focus();libraryPreviewRef.current.scrollIntoView({block:'start'});}},[libraryPreview]);
 const run=async(action,payload,success='Lagret.')=>{
  setBusy(true);setError('');setNotice('');
  try{const result=await kshmsRpc('kshms_command',{p_company_id:companyId,p_action:action,p_payload:payload});const value=await load();if(action==='settings')setSetup(value.settings||emptySetup);setNotice(success);return result;}
  catch(e){if(e.code==='40001'){try{await load()}catch{}setError('En annen person har lagret endringer. Sammenlign din tekst med den lagrede teksten før du lagrer igjen. Ditt utkast er beholdt på denne enheten.');}else setError(e.message);return null;}
  finally{setBusy(false);}
 };
 const chooseEditor=(draft,routine=null)=>{
  if(dirty && !window.confirm('Åpne en annen rutine? Teksten du jobber med, er lagret på denne enheten. Du kan hente den inn igjen.'))return;
  setEditor({id:routine?.id||null,revision:routine?.revision||0,draft:structuredClone(draft)});setSources(structuredClone(draft.references||[]));setDirty(false);setProposal(null);setScreen('handbook');setEditorFocus(previous=>previous+1);
 };
 const addSelected=async keys=>{
  if(busy)return;
  const scope=requestScope.current;
  if(!scope?.active)return;
  setBusy(true);setLibraryFeedback(null);setError('');setNotice('');
  try {
   const result=await addLibraryRoutines({companyId,keys,rpc:kshmsRpc,isCurrent:()=>scope.active,onProgress:setLibraryProgress});
   if(result.cancelled||!scope.active)return;
   if(result.state)setData(result.state);
   setSelectedKeys(previous=>previous.filter(key=>!result.confirmedKeys.includes(key)));
   const added=result.addedCount===1?'1 rutine er lagt inn':`${result.addedCount} rutiner er lagt inn`;
   const existing=result.skippedCount?` ${result.skippedCount} var allerede lagt til og er beholdt.`:'';
   setLibraryFeedback(result.error?{error:true,message:`${added} som utkast.${existing} De resterende valgene er beholdt. Prøv igjen. ${result.error.message}`}:{error:false,message:`${added} som utkast.${existing} Bruk «Rediger her» for å tilpasse hver rutine.`});
  } catch(cause) {if(scope.active)setLibraryFeedback({error:true,message:cause.message});}
  finally {if(scope.active){setBusy(false);setLibraryProgress(null);}}
 };
 const cacheEditor=(next,sourceValue=sources)=>{
  setEditor(next);setDirty(true);
  try{persistDraft(window.localStorage,userId,companyId,{...next,sources:sourceValue});setCached(readDraft(window.localStorage,userId,companyId));}
  catch{setError('Utkastet kunne ikke sikres på denne enheten. Trykk «Lagre utkast» før du lukker appen.');}
 };
 const save=async e=>{e.preventDefault();let draft;
  try{draft={...editor.draft,references:validateReferences(sources)}}catch(err){setError(err.message);return;}
  const result=await run('save',{id:editor.id,revision:editor.revision,draft},'Utkastet er lagret. Neste steg: Firmaadmin godkjenner rutinen før ansatte får den.');
  if(result?.id){window.localStorage.removeItem(draftKey(userId,companyId));setCached(null);setDirty(false);setEditor(null);}
 };
 if(!data)return <section className="ks-module"><h2>KS/HMS</h2>{error?<p role="alert">{error}</p>:<p role="status">Henter firmaets håndbok …</p>}<button type="button" className="secondary" onClick={()=>load().catch(e=>setError(e.message))}>Prøv igjen</button></section>;
 const canManage=data.context.manage,canPublish=data.context.publish;
 const pending=data.assignments.filter(a=>a.user_id===userId && !data.acknowledgments.some(k=>k.version_id===a.version_id && k.user_id===userId) && data.versions.some(v=>v.id===a.version_id && (v.requires_ack||v.number===1)));
 const latest=data.routines.filter(r=>!r.archived).map(r=>data.versions.find(v=>v.routine_id===r.id)).filter(Boolean);
 const eligibleMembers=data.members.filter(m=>m.enabled||m.workspace_role==='firmaadmin');
 const overdue=data.settings && new Date(`${data.settings.next_review_on}T23:59:59`) < new Date();
 const missing=data.assignments.filter(a=>!data.acknowledgments.some(k=>k.version_id===a.version_id&&k.user_id===a.user_id) && data.versions.some(v=>v.id===a.version_id&&(v.requires_ack||v.number===1)));
 return <section className="ks-module" aria-label="KS/HMS håndbok">
  <header className="ks-heading"><div><span className="ks-eyebrow">{context.company_name}</span><h2>KS/HMS</h2><p>Firmaets håndbok og rutiner</p></div><span className="ks-badge">Håndbok og gjennomgang</span></header>
  <p className="ks-scope">{canManage?'Her samler du firmaets rutiner for kvalitet, helse, miljø og sikkerhet. En rutine forklarer hvordan dere skal gjøre en oppgave. Firmaet må lære opp ansatte og følge rutinene i arbeidet.':'Her finner du firmaets rutiner. De forklarer hvordan du skal jobbe trygt og gjøre oppgavene riktig. Åpne «Les og bekreft» for å se hva du skal lese.'}</p>
  <nav className="ks-tabs" aria-label="KS/HMS visning">{[['handbook','Håndbok'],['reading',`Les og bekreft (${pending.length})`],...(canManage?[['setup','Oppstart og tilgang'],['followup','Oppfølging og revisjon']]:[])].map(([key,label])=><button type="button" key={key} className={screen===key?'active':'secondary'} aria-pressed={screen===key} onClick={()=>setScreen(key)}>{label}</button>)}</nav>
  {error && <p role="alert" className="ks-error">{error}</p>}{notice && <p role="status" className="ks-notice">{notice}</p>}
  {screen==='setup'&&canManage&&<>
   <div className="ks-card"><h3>Her forteller du hva firmaet gjør</h3><p>Velg fag og skriv kort om arbeidet deres. Da kan ProffDok foreslå rutiner som passer. Du kan velge flere fag. Stikkord eller korte setninger er nok.</p>
    <form onSubmit={async e=>{e.preventDefault();await run('settings',setup,'Oppstart er lagret. Neste steg: Åpne «Håndbok» og velg rutiner.')}}>
     <fieldset><legend>Fag</legend><div className="ks-options">{Object.entries(TRADES).map(([key,label])=><label key={key}><input type="checkbox" checked={setup.trades.includes(key)} onChange={e=>setSetup({...setup,trades:e.target.checked?[...setup.trades,key]:setup.trades.filter(t=>t!==key)})}/>{label}</label>)}</div></fieldset>
     <Field label="Aktiviteter – hva gjør dere?" hint="Skriv hvilke jobber dere gjør. Eksempel for VVS: Vi monterer rør og varmeutstyr. Vi gjør service og jobber i våtrom og ved oppussing." value={setup.activities} multiline onChange={v=>setSetup({...setup,activities:v})}/>
     <Field label="Ansvar – hvem følger opp arbeidet?" hint="Skriv hva firmaet har ansvar for, og hvem som følger opp. Eksempel: Prosjektleder følger opp våre ansatte og andre firmaer vi bruker. Ta også med ansvar for tegninger og beregninger (prosjektering), hvis dere har det." value={setup.responsibilities} multiline onChange={v=>setSetup({...setup,responsibilities:v})}/>
     <Field label="Risiko – hva kan gå galt?" hint="Skriv farer dere møter på jobb. Eksempel for VVS: Lekkasjer, varmt arbeid, tunge løft, støv og kjemikalier. Ta også med hensyn til folk som bor i huset mens dere jobber." value={setup.risks} multiline onChange={v=>setSetup({...setup,risks:v})}/>
     <label className="ks-field"><span>Utpekt KS/HMS-ansvarlig (firmaadmin velger)</span><select required disabled={!canPublish||busy} value={setup.responsible_user_id||''} onChange={e=>setSetup({...setup,responsible_user_id:e.target.value})}><option value="">Velg ansvarlig</option>{data.members.filter(m=>m.workspace_role==='firmaadmin'||(m.enabled&&m.role==='responsible')).map(m=><option key={m.id} value={m.id}>{m.email}{m.id===userId?' (deg)':''}{m.workspace_role==='firmaadmin'?' · Firmaadmin':''}</option>)}</select></label>
     <p className="ks-field-hint">KS/HMS-ansvarlig følger opp håndboken og signerer når den er kontrollert. Firmaadmin kan velge seg selv. For å velge en annen ansatt, gi personen tilgang som KS/HMS-ansvarlig i listen under. Lagre oppstart når valget er klart.</p>
     <button disabled={busy}>Lagre oppstart</button>
     <p className="ks-next-step">Neste steg: Åpne «Håndbok» og velg rutinene firmaet trenger.</p>
    </form>
   </div>
   {canPublish&&<div className="ks-card"><h3>Her velger du hvem som får bruke KS/HMS</h3><p>Velg tilgang ved siden av navnet til hver ansatt. «Ansatt» kan lese og bekrefte rutiner. «KS/HMS-ansvarlig» kan også skrive og endre rutiner. Valget lagres med en gang. Firmaadmin er personen som styrer tilgangen og godkjenner rutinene.</p>
    {data.members.map(m=><div className="ks-member" key={m.id}><span>{m.email}{m.workspace_role==='firmaadmin'?' · Firmaadmin':''}</span><select aria-label={`Tilgang for ${m.email}`} value={m.enabled?m.role:'off'} disabled={busy} onChange={async e=>{const role=e.target.value;const result=await run('access',{user_id:m.id,role:role==='off'?'reader':role,enabled:role!=='off'});if(result)publishManagedAccessChange();}}><option value="off">{m.workspace_role==='firmaadmin'?'Firmaadmin (automatisk)':'Ingen KS/HMS-tilgang'}</option><option value="reader">Ansatt – lese og bekrefte</option><option value="responsible">KS/HMS-ansvarlig – redigere</option></select></div>)}
   </div>}
  </>}
  {screen==='handbook'&&<>
   {canManage&&<div className="ks-card"><h3>Her bygger du firmaets KS/HMS-håndbok</h3><p>Velg rutiner, tilpass teksten og få den godkjent. Et utkast er en rutine du fortsatt kan endre. Ansatte får rutinen når firmaadmin godkjenner den.</p>
    <ol className="ks-steps"><li><strong>Velg rutiner</strong><span>Huk av rutinene firmaet trenger.</span></li><li><strong>Legg dem inn</strong><span>Se over listen og trykk «Legg inn».</span></li><li><strong>Tilpass teksten</strong><span>Trykk «Rediger her» og lagre utkastet.</span></li><li><strong>Godkjenn</strong><span>Firmaadmin godkjenner. Ansatte leser og bekrefter.</span></li></ol>
    <p className="ks-field-hint">Det finnes {ROUTINE_CATALOG.length} forslag foreløpig. Flere rutiner og verktøy kommer etter hvert. Du kan også skrive en egen rutine.</p>
    {!data.settings&&<p className="ks-notice">Fullfør oppstart og velg KS/HMS-ansvarlig før publisering.</p>}
    <div className="ks-actions"><button type="button" disabled={busy} onClick={()=>chooseEditor(blankRoutine())}>Ny rutine fra blank mal</button></div>
    {cached&&<div className="ks-recovery"><p>Du har et ulagret utkast fra {dateTime(cached.savedLocallyAt)} på denne enheten. Trykk «Hent inn utkast» for å fortsette med teksten. Sammenlign med firmaets lagrede rutine før du lagrer igjen.</p><button type="button" className="secondary" onClick={()=>{setEditor({id:cached.id,revision:cached.revision,draft:cached.draft});setSources(Array.isArray(cached.sources)?cached.sources:cached.draft.references||[]);setDirty(true);}}>Hent inn utkast</button><button type="button" className="secondary" onClick={()=>{if(window.confirm('Slette utkastet som er lagret på denne enheten?')){window.localStorage.removeItem(draftKey(userId,companyId));setCached(null)}}}>Slett utkast på enheten</button></div>}
    <KshmsRoutineLibrary routines={data.routines} recommended={suggestedRoutines(setup.trades,setup.activities,setup.responsibilities,setup.risks)} selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} filter={libraryFilter} onFilterChange={setLibraryFilter} busy={busy} progress={libraryProgress} feedback={libraryFeedback} onAdd={addSelected} onEdit={routine=>chooseEditor(routine.draft,routine)} onPreview={setLibraryPreview}/>
    {libraryPreview&&<article className="ks-proposal ks-editor" ref={libraryPreviewRef} tabIndex={-1}><h4>Forslag til rutine: {libraryPreview.title}</h4><p>Her kan du lese ProffDoks forslag. For å bruke det, lukk visningen, huk av rutinen og trykk «Legg inn». Deretter kan du endre teksten så den passer firmaet.</p><Content content={libraryPreview}/><button type="button" className="secondary" onClick={()=>setLibraryPreview(null)}>Lukk forslag</button></article>}
   </div>}
   {editor&&canManage&&<div className="ks-card ks-editor" ref={editorRef} tabIndex={-1}><h3>{editor.id?`Rediger rutine: ${editor.draft.title}`:'Skriv en ny rutine'}</h3><p>Her endrer du teksten så den passer firmaet. Trykk «Lagre utkast» når du er ferdig. Firmaadmin må godkjenne før ansatte får rutinen. Tidligere godkjente utgaver beholdes.</p><p className="ks-field-hint">Rutinene er felles for firmaet. Hold private opplysninger om enkeltansatte utenfor teksten.</p>
    <form onSubmit={save}>{[['Tittel','title','Gi rutinen et kort navn som sier hva den handler om.'],['Kapittel','chapter','Skriv hvor rutinen skal ligge, for eksempel HMSK eller Personal og arbeidsforhold.'],['Mål','goal','Hva skal rutinen hjelpe dere å få til eller unngå?'],['Ansvar – hvem gjør hva?','responsibility','Skriv hvem som gjør arbeidet, og hvem som følger det opp.'],['Fremgangsmåte – slik gjør dere jobben','procedure','Beskriv oppgaven steg for steg. Skriv det en ansatt trenger å vite.'],['Dokumentasjon – hva skal lagres?','documentation','Skriv hva som skal dokumenteres, for eksempel bilder, en sjekkliste eller en kontroll.'],['Gjennomgang – hva skal den ansatte avklare?','confirmation','Skriv hva den ansatte skal lese og spørre om før arbeidet starter.']].map(([label,key,hint])=><Field key={key} label={label} hint={hint} value={editor.draft[key]} required multiline={!['title','chapter'].includes(key)} onChange={v=>cacheEditor({...editor,draft:{...editor.draft,[key]:v}})}/>)}
     <References value={sources} onChange={v=>{setSources(v);cacheEditor(editor,v)}}/>
     <div className="ks-actions"><button disabled={busy}>Lagre utkast</button><button type="button" className="secondary" onClick={()=>{setEditor(null);setDirty(false)}}>Lukk redigering</button>{editor.draft.source_key&&<button type="button" className="secondary" onClick={()=>setProposal(ROUTINE_CATALOG.find(r=>r.key===editor.draft.source_key)||null)}>Se ProffDoks forslag</button>}</div>
    </form>
    {data.routines.some(r=>r.id===editor.id&&r.revision!==editor.revision)&&<aside className="ks-proposal"><h4>En annen person har endret rutinen</h4><p>Teksten under er lagret av en annen person. Sammenlign den med teksten du jobber med. Velg å beholde din tekst først når du har sjekket forskjellene.</p><Content content={data.routines.find(r=>r.id===editor.id).draft}/><button type="button" className="secondary" onClick={()=>{cacheEditor({...editor,revision:data.routines.find(r=>r.id===editor.id).revision});setError('')}}>Jeg har sammenlignet – behold min tekst</button></aside>}
    {proposal&&<aside className="ks-proposal"><h4>Velg hvilken tekst du vil bruke</h4><p>Her ser du ProffDoks forslag. Trykk på et felt du vil bruke. Bare det feltet endres i utkastet ditt. Lagre utkastet etterpå. Firmaadmin må godkjenne endringen.</p><Content content={proposal}/>{['goal','responsibility','procedure','documentation','confirmation','references'].map(key=><button type="button" className="secondary" key={key} onClick={()=>{const next={...editor,draft:{...editor.draft,[key]:structuredClone(proposal[key]),source_revision:proposal.source_revision}};const refs=key==='references'?next.draft.references:sources;if(key==='references')setSources(refs);cacheEditor(next,refs)}}>Bruk forslagets {({goal:'mål',responsibility:'ansvar',procedure:'fremgangsmåte',documentation:'dokumentasjon',confirmation:'gjennomgang',references:'kilder'})[key]}</button>)}</aside>}
   </div>}
   {publication&&<div className="ks-card"><h3>Her godkjenner du rutinen: {publication.draft.title}</h3><p>Les teksten og sjekk at den passer firmaet. Skriv hva du har kontrollert eller endret. Når du trykker «Godkjenn og publiser», får ansatte med KS/HMS-tilgang rutinen i «Les og bekreft». Tidligere utgaver og bekreftelser beholdes.</p><Content content={publication.draft}/><Field label="Hva er vurdert eller endret?" hint="For eksempel: Vi har avklart hvem som har ansvar og tilpasset fremgangsmåten til vårt arbeid." value={summary} onChange={setSummary} required multiline/><label className="ks-check"><input type="checkbox" checked={freshAck} onChange={e=>setFreshAck(e.target.checked)}/>Ansatte skal lese og bekrefte på nytt (alltid ved ny rutine eller viktig endring)</label><div className="ks-actions"><button type="button" disabled={busy||summary.trim().length<5} onClick={async()=>{const result=await run('publish',{id:publication.id,revision:publication.revision,change_summary:summary,requires_ack:data.versions.some(v=>v.routine_id===publication.id)?freshAck:true},'Rutinen er godkjent. Neste steg: Ansatte åpner «Les og bekreft» og leser rutinen.');if(result?.id)setPublication(null)}}>Godkjenn og publiser</button><button type="button" className="secondary" onClick={()=>setPublication(null)}>Avbryt</button></div></div>}
   <div className="ks-routine-overview"><h3>Firmaets rutiner ({data.routines.filter(routine=>!routine.archived).length})</h3>{canManage&&<p>Her ligger rutinene du har lagt inn. «Utkast» betyr at teksten ikke er godkjent ennå. Trykk «Rediger her» for å endre den. Firmaadmin godkjenner når teksten er klar.</p>}</div>
   {!data.routines.length&&<div className="ks-card"><h3>{canManage?'Ingen rutiner ennå':'Ingen rutiner tildelt'}</h3><p>{canManage?'Huk av standardrutiner over og trykk «Legg inn», eller lag en rutine fra blank mal.':'Du får rutiner her når firmaets ansvarlige har gitt deg dem.'}</p></div>}
   {[...new Set(data.routines.map(r=>r.draft?.chapter||data.versions.find(v=>v.routine_id===r.id)?.content.chapter||'Historikk'))].map(chapter=><div className="ks-chapter" key={chapter}><h3>{chapter}</h3>{data.routines.filter(r=>(r.draft?.chapter||data.versions.find(v=>v.routine_id===r.id)?.content.chapter||'Historikk')===chapter).map(r=>{
    const versions=data.versions.filter(v=>v.routine_id===r.id),current=versions[0];
    return <article className="ks-card" key={r.id}><div className="ks-row"><h4>{r.draft?.title||current?.content.title}</h4><span className="ks-badge">{r.archived?'Arkivert':current?`Publisert v${current.number}`:'Utkast'}</span></div>
     {current&&<details><summary>Les publisert versjon {current.number}</summary><p>Godkjent {dateTime(current.published_at)} · Endring: {current.change_summary}</p><Content content={current.content}/></details>}
     {canManage&&<div className="ks-actions">{!r.archived&&<button type="button" className="secondary" disabled={busy} aria-label={`Rediger her: ${r.draft.title}`} onClick={()=>chooseEditor(r.draft,r)}>Rediger her</button>}<button type="button" className="secondary" onClick={()=>chooseEditor({...r.draft,title:`${r.draft.title} (kopi)`})}>Kopier</button>{!r.archived&&canPublish&&<button type="button" disabled={busy} onClick={()=>{setPublication(r);setSummary('');setFreshAck(true)}}>Godkjenn publisering</button>}{!r.archived&&canPublish&&<button type="button" className="secondary" disabled={busy} onClick={()=>{if(window.confirm('Arkiver rutinen? Publiserte versjoner og bekreftelser beholdes.'))run('archive',{id:r.id,revision:r.revision},'Rutinen er arkivert; historikken er bevart.')}}>Arkiver</button>}</div>}
     {versions.length>0&&<details><summary>Versjonshistorikk ({versions.length})</summary>{versions.map(v=><details key={v.id}><summary>Versjon {v.number} · {dateTime(v.published_at)} · {v.change_summary}</summary><Content content={v.content}/><p>Godkjenner: {data.members.find(m=>m.id===v.published_by)?.email||v.published_by} · innholdskontroll: {v.content_hash}</p></details>)}</details>}
    </article>;
   })}</div>)}
  </>}
  {screen==='reading'&&<div className="ks-card"><h3>Her leser du rutinene du har fått</h3><p>Åpne en rutine og les hele teksten. Spør ansvarlig hvis noe er uklart. Når du har lest, huker du av og trykker «Bekreft». Gjør det samme for alle rutinene på listen. Bekreftelsen viser at du selv har lest denne utgaven.</p><p>En versjon er en bestemt utgave av rutinen. Hvis teksten endres, kan du få en ny utgave å lese. Du skal fortsatt få opplæringen du trenger før du gjør arbeidet.</p>{pending.length===0&&<p>Du har ingen rutiner som venter på bekreftelse.</p>}
   {data.assignments.filter(a=>a.user_id===userId).map(a=>{const v=data.versions.find(v=>v.id===a.version_id),ack=data.acknowledgments.find(k=>k.user_id===userId&&k.version_id===a.version_id);if(!v)return null;return <div key={v.id} className="ks-reading-row"><button type="button" className="secondary" onClick={()=>{setReading(v);setChecked(false)}}>{v.content.title} · v{v.number}</button><span>{ack?`Bekreftet ${dateTime(ack.acknowledged_at)}`:v.requires_ack||v.number===1?'Gjennomgang mangler':'Informasjon – ny bekreftelse valgfri'}</span></div>})}
   {reading&&<article><h3>{reading.content.title} · versjon {reading.number}</h3><Content content={reading.content}/><p className="ks-confirmation">{ACK_STATEMENT}</p>{data.acknowledgments.some(a=>a.version_id===reading.id&&a.user_id===userId)?<p>Din bekreftelse er registrert.</p>:<><label className="ks-check"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>Jeg bekrefter egen gjennomgang og teksten over.</label><button type="button" disabled={!checked||busy} onClick={async()=>{await run('ack',{version_id:reading.id,statement:ACK_STATEMENT},'Du har bekreftet at du har lest denne utgaven. Navnet ditt, tidspunktet og utgaven er lagret.');setChecked(false)}}>Bekreft versjon {reading.number}</button></>}</article>}
  </div>}
  {screen==='followup'&&canManage&&<>
   <div className="ks-card"><h3>Her følger du opp hvem som har lest</h3><p>Listen under viser hvem som ennå ikke har bekreftet en rutine. Følg opp disse ansatte og avklar om de trenger hjelp. Du kan gi nye ansatte rutiner fra listen nederst. Påminnelser i app og på e-post kommer senere.</p><h4>Manglende bekreftelser ({missing.length})</h4>{!missing.length&&<p>Alle påkrevde bekreftelser er registrert.</p>}{missing.map(a=><p key={`${a.version_id}:${a.user_id}`}>{data.members.find(m=>m.id===a.user_id)?.email||a.user_id} · {data.versions.find(v=>v.id===a.version_id)?.content.title} · v{data.versions.find(v=>v.id===a.version_id)?.number}</p>)}
    <h4>Tildel til nye medarbeidere</h4>{latest.map(v=><details key={v.id}><summary>{v.content.title} · v{v.number}</summary>{eligibleMembers.filter(m=>!data.assignments.some(a=>a.user_id===m.id&&a.version_id===v.id)).map(m=><button type="button" className="secondary" key={m.id} disabled={busy} onClick={()=>run('assign',{version_id:v.id,user_id:m.id})}>Tildel til {m.email}</button>)}</details>)}
   </div>
   <div className="ks-card"><h3>Her kontrollerer dere at håndboken fortsatt passer</h3><p>Å kontrollere og oppdatere håndboken kalles revisjon. Les rutinene og sjekk om de passer arbeidet dere gjør nå. Noter hva som må endres, hvem som gjør det, og når det skal være klart.</p><p className={overdue?'ks-error':''}>Neste kontroll: {data.settings?.next_review_on||'Lagre oppstart først'}{overdue?' · Datoen er passert':''}</p><p>I ProffDok skal håndboken kontrolleres minst én gang i året. Dette er vår avtalte regel. Endringer eller hendelser kan gjøre at dere må kontrollere tidligere. Den valgte KS/HMS-ansvarlige signerer kontrollen.</p>
    {data.context.responsible?<form onSubmit={async e=>{e.preventDefault();const result=await run('review',{settings_revision:data.settings.revision,version_snapshot:currentVersionSnapshot(data),findings,follow_up:followUp,next_review_on:nextReview},'Kontrollen er signert og lagret sammen med utgavene du kontrollerte.');if(result){setReviewChecked(false);setFindings('');setFollowUp('')}}}>
     <p>Kontrollen gjelder {latest.length} godkjente rutiner. Sjekk også om utkast må ferdigstilles eller gamle rutiner tas ut av bruk før du signerer.</p>
     <Field label="Hva har du kontrollert?" hint="Skriv hvilke rutiner du har gått gjennom, og om noe må endres." value={findings} onChange={setFindings} multiline required/>
     <Field label="Hva skal gjøres videre?" hint="Skriv hva som skal gjøres, hvem som gjør det, og fristen. Hvis alt er i orden, forklar kort hvorfor." value={followUp} onChange={setFollowUp} multiline required/>
     <Field label="Neste revisjonsdato (innen ett år)" value={nextReview} type="date" onChange={setNextReview} required/>
     <label className="ks-check"><input type="checkbox" checked={reviewChecked} onChange={e=>setReviewChecked(e.target.checked)}/>Jeg har vurdert de oppførte versjonene, relevans og etterlevelse, og dokumentert funn og oppfølging. Dette er ingen myndighetsgodkjenning.</label><button disabled={busy||!reviewChecked||!latest.length}>Signer revisjon</button>
    </form>:<p>Du kan følge opp og forberede endringer. Personen som er valgt som KS/HMS-ansvarlig i «Oppstart og tilgang», må signere kontrollen.</p>}
    <details><summary>Revisjonshistorikk ({data.reviews.length})</summary>{data.reviews.map(r=><article key={r.id}><h4>{dateTime(r.signed_at)} · {data.members.find(m=>m.id===r.signed_by)?.email||r.signed_by}</h4><p>{r.statement}</p><p className="ks-text">{r.findings}</p><p className="ks-text">{r.follow_up}</p><p>Neste revisjon: {r.next_review_on} · {r.version_snapshot.length} versjoner</p>{r.version_snapshot.map(s=>{const v=data.versions.find(v=>v.id===s.id);return <p key={s.id}>{v?`${v.content.title} · v${v.number}`:s.id}</p>})}</article>)}</details>
   </div>
  </>}
 </section>;
}
