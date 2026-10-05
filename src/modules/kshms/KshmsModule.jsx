import { useEffect,useId,useState } from 'react';
import { ACK_STATEMENT,CHAPTERS,ROUTINE_CATALOG,TRADES,blankRoutine,currentVersionSnapshot,suggestedRoutines } from './kshmsCatalog.mjs';
import { draftKey,persistDraft,readDraft } from './kshmsDraft.mjs';
import { kshmsRpc } from './kshmsAccess.js';
import { publishManagedAccessChange } from '../access/moduleAccessClient.js';
import './kshms.css';
const dateTime = value => new Date(value).toLocaleString('nb-NO');
const sourceTypes = {law:'Lov / forskrift',professional:'Fag / veiledning / kontrakt',company:'Firmaets regel',product:'Produktvalg'};
const emptySetup = {trades:[],activities:'',responsibilities:'',risks:'',responsible_user_id:'',revision:0};
function Field({label,hint,value,onChange,type='text',multiline=false,required=false}) {
 const id=useId();
 const description=hint?`${id}-hint`:undefined;
 return <label className="ks-field" htmlFor={id}><span id={`${id}-label`}>{label}</span>{multiline ? <textarea id={id} aria-labelledby={`${id}-label`} aria-describedby={description} value={value||''} onChange={e=>onChange(e.target.value)} rows={5} required={required} maxLength={20000}/> : <input id={id} aria-labelledby={`${id}-label`} aria-describedby={description} type={type} value={value||''} onChange={e=>onChange(e.target.value)} required={required} maxLength={20000}/>} {hint&&<span id={description} className="ks-field-hint">{hint}</span>}</label>;
}
function Content({content}) {
 return <div className="ks-content">{[['Mål','goal'],['Ansvar','responsibility'],['Fremgangsmåte','procedure'],['Dokumentasjon','documentation'],['Gjennomgang','confirmation']].map(([label,key])=><div key={key}><h4>{label}</h4><p>{content[key]}</p></div>)}
 <h4>Kilder og vurderingsgrunnlag</h4><ul>{(content.references||[]).map((r,i)=><li key={i}><a href={/^https:\/\//.test(r.url)?r.url:undefined} target="_blank" rel="noreferrer">{r.title||r.url}</a> · {sourceTypes[r.kind]||r.kind} · kontrollert {r.checked_on}</li>)}</ul>
 </div>;
}
function validateReferences(refs) {
 for(const r of refs)if(!r.title?.trim()||!/^https:\/\//.test(r.url||'')||!Object.hasOwn(sourceTypes,r.kind)||!/^\d{4}-\d{2}-\d{2}$/.test(r.checked_on||''))throw new Error('Hver kilde må ha navn, https-lenke, type og kontrolldato.');
 return refs;
}
function References({value,onChange}) {
 const update=(i,key,next)=>onChange(value.map((r,index)=>index===i?{...r,[key]:next}:r));
 return <fieldset><legend>Kilder og vurderingsgrunnlag</legend><p>Skill lov-/forskriftskrav fra fag-/kontraktskrav, egne regler og ProffDoks produktvalg.</p>{value.map((r,i)=><div className="ks-reference" key={i}>
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
 const load = async()=>{const value=await kshmsRpc('kshms_get_state',{p_company_id:companyId});setData(value);return value;};
 useEffect(()=>{let active=true;setData(null);setError('');
  kshmsRpc('kshms_get_state',{p_company_id:companyId}).then(value=>{if(active){setData(value);setSetup(value.settings||emptySetup);setCached(readDraft(window.localStorage,userId,companyId));setNextReview(value.settings?.next_review_on||new Date(Date.now()+360*86400000).toISOString().slice(0,10));}}).catch(e=>{if(active)setError(e.message)});
  return()=>{active=false};
 },[companyId,userId,context.manage,context.publish]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const run=async(action,payload,success='Lagret.')=>{
  setBusy(true);setError('');setNotice('');
  try{const result=await kshmsRpc('kshms_command',{p_company_id:companyId,p_action:action,p_payload:payload});const value=await load();if(action==='settings')setSetup(value.settings||emptySetup);setNotice(success);return result;}
  catch(e){if(e.code==='40001'){try{await load()}catch{}setError('Innholdet er endret av en annen bruker. Sammenlign med gjeldende serverversjon før ny lagring. Din lokale kladd er beholdt.');}else setError(e.message);return null;}
  finally{setBusy(false);}
 };
 const chooseEditor=(draft,routine=null)=>{
  if(dirty && !window.confirm('Åpne et annet utkast? Din gjeldende tekst er lokalt sikret og kan hentes inn igjen.'))return;
  setEditor({id:routine?.id||null,revision:routine?.revision||0,draft:structuredClone(draft)});setSources(structuredClone(draft.references||[]));setDirty(false);setProposal(null);setScreen('handbook');
 };
 const cacheEditor=(next,sourceValue=sources)=>{
  setEditor(next);setDirty(true);
  try{persistDraft(window.localStorage,userId,companyId,{...next,sources:sourceValue});setCached(readDraft(window.localStorage,userId,companyId));}
  catch{setError('Lokal sikring er utilgjengelig. Lagre kladden før du lukker appen.');}
 };
 const save=async e=>{e.preventDefault();let draft;
  try{draft={...editor.draft,references:validateReferences(sources)}}catch(err){setError(err.message);return;}
  const result=await run('save',{id:editor.id,revision:editor.revision,draft},'Rutinekladd lagret. Firmaadmin må godkjenne publisering.');
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
  <header className="ks-heading"><div><span className="ks-eyebrow">{context.company_name}</span><h2>KS/HMS</h2><p>Firmaets håndbok og rutiner</p></div><span className="ks-badge">Håndbok · første leveransetrinn</span></header>
  <p className="ks-scope">Tilpass rutiner til arbeidet dere utfører. Firmaet har ansvar for opplæring, medvirkning og etterlevelse. Sjekklistebibliotek, SJA, risikoanalyse, utvidet avvik, varsler og personalfunksjoner er planlagt i neste trinn.</p>
  <nav className="ks-tabs" aria-label="KS/HMS visning">{[['handbook','Håndbok'],['reading',`Les og bekreft (${pending.length})`],...(canManage?[['setup','Oppstart og tilgang'],['followup','Oppfølging og revisjon']]:[])].map(([key,label])=><button type="button" key={key} className={screen===key?'active':'secondary'} aria-pressed={screen===key} onClick={()=>setScreen(key)}>{label}</button>)}</nav>
  {error && <p role="alert" className="ks-error">{error}</p>}{notice && <p role="status" className="ks-notice">{notice}</p>}
  {screen==='setup'&&canManage&&<>
   <div className="ks-card"><h3>1. Velg fag og beskriv virksomheten</h3><p>Velg ett eller flere fag og beskriv firmaets arbeid i feltene under. Stikkord eller korte setninger er nok som start. Dette brukes til å foreslå relevante rutiner; tilpass beskrivelsen til deres egen virksomhet.</p>
    <form onSubmit={async e=>{e.preventDefault();await run('settings',setup,'Oppstart lagret. Vurder forslagene i håndboken.')}}>
     <fieldset><legend>Fag</legend><div className="ks-options">{Object.entries(TRADES).map(([key,label])=><label key={key}><input type="checkbox" checked={setup.trades.includes(key)} onChange={e=>setSetup({...setup,trades:e.target.checked?[...setup.trades,key]:setup.trades.filter(t=>t!==key)})}/>{label}</label>)}</div></fieldset>
     <Field label="Aktiviteter – hva gjør dere?" hint="Beskriv vanlige oppdrag og arbeidsoperasjoner. Eksempel for VVS: Montering og service på sanitær- og varmeanlegg, arbeid i våtrom og rehabilitering." value={setup.activities} multiline onChange={v=>setSetup({...setup,activities:v})}/>
     <Field label="Ansvar og funksjoner – hvilken rolle har firmaet?" hint="Beskriv hva dere har ansvar for, og hvem som følger opp arbeidet. Eksempel: Utførende VVS-bedrift. Prosjektleder følger opp egne ansatte og samarbeidende foretak. Ta med prosjektering dersom dere har dette ansvaret." value={setup.responsibilities} multiline onChange={v=>setSetup({...setup,responsibilities:v})}/>
     <Field label="Risiko og lokale behov – hva må dere særlig passe på?" hint="Beskriv farer og forhold dere faktisk møter. Eksempel for VVS: Lekkasjer, varmt arbeid, tunge løft, støv og kjemikalier. Arbeid i bebodde boliger krever hensyn til beboere og sikring av arbeidsområdet." value={setup.risks} multiline onChange={v=>setSetup({...setup,risks:v})}/>
     <label className="ks-field"><span>Utpekt KS/HMS-ansvarlig (firmaadmin velger)</span><select required disabled={!canPublish||busy} value={setup.responsible_user_id||''} onChange={e=>setSetup({...setup,responsible_user_id:e.target.value})}><option value="">Velg ansvarlig</option>{data.members.filter(m=>m.workspace_role==='firmaadmin'||(m.enabled&&m.role==='responsible')).map(m=><option key={m.id} value={m.id}>{m.email}{m.id===userId?' (deg)':''}{m.workspace_role==='firmaadmin'?' · Firmaadmin':''}</option>)}</select></label>
     <p className="ks-field-hint">Firmaadmin kan velge seg selv. For å velge en annen medarbeider, tildel vedkommende KS/HMS-ansvarlig under «Tildel ansattes tilgang». Valget gjelder når du lagrer oppstart. Bare den utpekte ansvarlige kan signere revisjonen.</p>
     <button disabled={busy}>Lagre oppstart</button>
    </form>
   </div>
   {canPublish&&<div className="ks-card"><h3>2. Tildel ansattes tilgang</h3><p>Interne medlemmer av dette firmaet. Firmaadmin godkjenner publisering. Bare den utpekte ansvarlige signerer revisjonen.</p>
    {data.members.map(m=><div className="ks-member" key={m.id}><span>{m.email}{m.workspace_role==='firmaadmin'?' · Firmaadmin':''}</span><select aria-label={`Tilgang for ${m.email}`} value={m.enabled?m.role:'off'} disabled={busy} onChange={async e=>{const role=e.target.value;const result=await run('access',{user_id:m.id,role:role==='off'?'reader':role,enabled:role!=='off'});if(result)publishManagedAccessChange();}}><option value="off">{m.workspace_role==='firmaadmin'?'Firmaadmin (automatisk)':'Ingen modulgrant'}</option><option value="reader">Ansatt – lese og bekrefte</option><option value="responsible">KS/HMS-ansvarlig – redigere</option></select></div>)}
   </div>}
  </>}
  {screen==='handbook'&&<>
   {canManage&&<div className="ks-card"><h3>Bygg håndboken</h3><p>Start med et selvstendig standardutkast eller skriv din egen rutine. Biblioteket har 12 første utkast; alle referansetemaene er registrert i leveranseplanen og er fortsatt under utarbeiding.</p>
    {!data.settings&&<p className="ks-notice">Fullfør oppstart og velg KS/HMS-ansvarlig før publisering.</p>}
    <div className="ks-actions"><button type="button" disabled={busy} onClick={()=>chooseEditor(blankRoutine())}>Ny rutine fra blank mal</button></div>
    {cached&&<div className="ks-recovery"><p>Du har en lokalt sikret kladd fra {dateTime(cached.savedLocallyAt)}. Serverens gjeldende versjon vises før du velger å hente den inn.</p><button type="button" className="secondary" onClick={()=>{setEditor({id:cached.id,revision:cached.revision,draft:cached.draft});setSources(Array.isArray(cached.sources)?cached.sources:cached.draft.references||[]);setDirty(true);}}>Hent inn lokal kladd</button><button type="button" className="secondary" onClick={()=>{if(window.confirm('Slett denne lokale kladden?')){window.localStorage.removeItem(draftKey(userId,companyId));setCached(null)}}}>Slett lokal kladd</button></div>}
    <details><summary>Anbefalt utgangspunkt ({suggestedRoutines(setup.trades,setup.activities,setup.responsibilities,setup.risks).length} forslag)</summary><p>Forslagene er et utgangspunkt. Vurder relevans, egne risikoer og prosjekt-/kontraktskrav.</p><div className="ks-library">{suggestedRoutines(setup.trades,setup.activities,setup.responsibilities,setup.risks).map(r=><button type="button" className="secondary" key={r.key} onClick={()=>chooseEditor(r)}><b>{r.title}</b><span>{r.relevance}</span></button>)}</div></details>
    <details><summary>Alle første standardutkast</summary><div className="ks-library">{ROUTINE_CATALOG.map(r=><button type="button" className="secondary" key={r.key} onClick={()=>chooseEditor(r)}>{r.title}</button>)}</div></details>
   </div>}
   {editor&&canManage&&<div className="ks-card"><h3>{editor.id?'Rediger rutinekladd':'Ny rutinekladd'}</h3><p>Publiserte versjoner beholder innholdet sitt. Ikke legg individuelle personalopplysninger i denne felles rutinen.</p>
    <form onSubmit={save}>{[['Tittel','title'],['Kapittel','chapter'],['Mål','goal'],['Ansvar – tilpass til firmaet','responsibility'],['Fremgangsmåte','procedure'],['Dokumentasjon','documentation'],['Gjennomgang / avklaring','confirmation']].map(([label,key])=><Field key={key} label={label} value={editor.draft[key]} required multiline={!['title','chapter'].includes(key)} onChange={v=>cacheEditor({...editor,draft:{...editor.draft,[key]:v}})}/>)}
     <References value={sources} onChange={v=>{setSources(v);cacheEditor(editor,v)}}/>
     <div className="ks-actions"><button disabled={busy}>Lagre kladd</button><button type="button" className="secondary" onClick={()=>{setEditor(null);setDirty(false)}}>Lukk editor</button>{editor.draft.source_key&&<button type="button" className="secondary" onClick={()=>setProposal(ROUTINE_CATALOG.find(r=>r.key===editor.draft.source_key)||null)}>Vurder sentralt forslag</button>}</div>
    </form>
    {data.routines.some(r=>r.id===editor.id&&r.revision!==editor.revision)&&<aside className="ks-proposal"><h4>Gjeldende serverkladd er endret</h4><p>Sammenlign teksten under med din kladd over. Du kan beholde din tekst som grunnlag for en ny lagring etter denne sammenligningen.</p><Content content={data.routines.find(r=>r.id===editor.id).draft}/><button type="button" className="secondary" onClick={()=>{cacheEditor({...editor,revision:data.routines.find(r=>r.id===editor.id).revision});setError('')}}>Jeg har sammenlignet – behold min tekst som ny kladd</button></aside>}
    {proposal&&<aside className="ks-proposal"><h4>Sentralt forslag – vurder felt for felt</h4><p>Firmaets tekst beholdes. Valgte felt legges bare i kladden og må publiseres av firmaadmin.</p><Content content={proposal}/>{['goal','responsibility','procedure','documentation','confirmation','references'].map(key=><button type="button" className="secondary" key={key} onClick={()=>{const next={...editor,draft:{...editor.draft,[key]:structuredClone(proposal[key]),source_revision:proposal.source_revision}};const refs=key==='references'?next.draft.references:sources;if(key==='references')setSources(refs);cacheEditor(next,refs)}}>Bruk felt: {({goal:'mål',responsibility:'ansvar',procedure:'fremgangsmåte',documentation:'dokumentasjon',confirmation:'gjennomgang',references:'kilder'})[key]}</button>)}</aside>}
   </div>}
   {publication&&<div className="ks-card"><h3>Godkjenn publisering: {publication.draft.title}</h3><Content content={publication.draft}/><Field label="Hva er vurdert eller endret?" value={summary} onChange={setSummary} required multiline/><label className="ks-check"><input type="checkbox" checked={freshAck} onChange={e=>setFreshAck(e.target.checked)}/>Krev ny gjennomgangsbekreftelse (alltid ved ny eller vesentlig endret rutine)</label><p>Du godkjenner firmaets tilpassede rutine og tildeler den til ansatte med modulgrant. En ny publikasjon erstatter ikke gamle bekreftelser.</p><div className="ks-actions"><button type="button" disabled={busy||summary.trim().length<5} onClick={async()=>{const result=await run('publish',{id:publication.id,revision:publication.revision,change_summary:summary,requires_ack:data.versions.some(v=>v.routine_id===publication.id)?freshAck:true},'Godkjent versjon publisert og tildelt ansatte.');if(result?.id)setPublication(null)}}>Godkjenn og publiser</button><button type="button" className="secondary" onClick={()=>setPublication(null)}>Avbryt</button></div></div>}
   {!data.routines.length&&<div className="ks-card"><h3>{canManage?'Ingen rutiner ennå':'Ingen rutiner tildelt'}</h3><p>{canManage?'Velg utgangspunkt, tilpass og lagre en kladd.':'Firmaets ansvarlige tildeler publiserte rutiner du skal gjennomgå.'}</p></div>}
   {[...new Set(data.routines.map(r=>r.draft?.chapter||data.versions.find(v=>v.routine_id===r.id)?.content.chapter||'Historikk'))].map(chapter=><div className="ks-chapter" key={chapter}><h3>{chapter}</h3>{data.routines.filter(r=>(r.draft?.chapter||data.versions.find(v=>v.routine_id===r.id)?.content.chapter||'Historikk')===chapter).map(r=>{
    const versions=data.versions.filter(v=>v.routine_id===r.id),current=versions[0];
    return <article className="ks-card" key={r.id}><div className="ks-row"><h4>{r.draft?.title||current?.content.title}</h4><span className="ks-badge">{r.archived?'Arkivert':current?`Publisert v${current.number}`:'Kladd'}</span></div>
     {current&&<details><summary>Les publisert versjon {current.number}</summary><p>Godkjent {dateTime(current.published_at)} · Endring: {current.change_summary}</p><Content content={current.content}/></details>}
     {canManage&&<div className="ks-actions">{!r.archived&&<button type="button" className="secondary" disabled={busy} onClick={()=>chooseEditor(r.draft,r)}>Rediger kladd</button>}<button type="button" className="secondary" onClick={()=>chooseEditor({...r.draft,title:`${r.draft.title} (kopi)`})}>Kopier</button>{!r.archived&&canPublish&&<button type="button" disabled={busy} onClick={()=>{setPublication(r);setSummary('');setFreshAck(true)}}>Godkjenn publisering</button>}{!r.archived&&canPublish&&<button type="button" className="secondary" disabled={busy} onClick={()=>{if(window.confirm('Arkiver rutinen? Publiserte versjoner og bekreftelser beholdes.'))run('archive',{id:r.id,revision:r.revision},'Rutinen er arkivert; historikken er bevart.')}}>Arkiver</button>}</div>}
     {versions.length>0&&<details><summary>Versjonshistorikk ({versions.length})</summary>{versions.map(v=><details key={v.id}><summary>Versjon {v.number} · {dateTime(v.published_at)} · {v.change_summary}</summary><Content content={v.content}/><p>Godkjenner: {data.members.find(m=>m.id===v.published_by)?.email||v.published_by} · innholdskontroll: {v.content_hash}</p></details>)}</details>}
    </article>;
   })}</div>)}
  </>}
  {screen==='reading'&&<div className="ks-card"><h3>Mine rutineversjoner</h3><p>Les hver tildelt rutine. Bekreftelser knyttes til akkurat den versjonen du åpner. Be om avklaring og nødvendig opplæring før utførelse.</p>{pending.length===0&&<p>Ingen påkrevde bekreftelser mangler.</p>}
   {data.assignments.filter(a=>a.user_id===userId).map(a=>{const v=data.versions.find(v=>v.id===a.version_id),ack=data.acknowledgments.find(k=>k.user_id===userId&&k.version_id===a.version_id);if(!v)return null;return <div key={v.id} className="ks-reading-row"><button type="button" className="secondary" onClick={()=>{setReading(v);setChecked(false)}}>{v.content.title} · v{v.number}</button><span>{ack?`Bekreftet ${dateTime(ack.acknowledged_at)}`:v.requires_ack||v.number===1?'Gjennomgang mangler':'Informasjon – ny bekreftelse valgfri'}</span></div>})}
   {reading&&<article><h3>{reading.content.title} · versjon {reading.number}</h3><Content content={reading.content}/><p className="ks-confirmation">{ACK_STATEMENT}</p>{data.acknowledgments.some(a=>a.version_id===reading.id&&a.user_id===userId)?<p>Din bekreftelse er registrert.</p>:<><label className="ks-check"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>Jeg bekrefter egen gjennomgang og teksten over.</label><button type="button" disabled={!checked||busy} onClick={async()=>{await run('ack',{version_id:reading.id,statement:ACK_STATEMENT},'Din gjennomgang er registrert med identitet, tidspunkt og rutineversjon.');setChecked(false)}}>Bekreft versjon {reading.number}</button></>}</article>}
  </div>}
  {screen==='followup'&&canManage&&<>
   <div className="ks-card"><h3>Manglende bekreftelser ({missing.length})</h3><p>Påminnelser i app og på e-post leveres i neste varseltrinn. Ingen e-post sendes her.</p>{missing.map(a=><p key={`${a.version_id}:${a.user_id}`}>{data.members.find(m=>m.id===a.user_id)?.email||a.user_id} · {data.versions.find(v=>v.id===a.version_id)?.content.title} · v{data.versions.find(v=>v.id===a.version_id)?.number}</p>)}
    <h4>Tildel til nye medarbeidere</h4>{latest.map(v=><details key={v.id}><summary>{v.content.title} · v{v.number}</summary>{eligibleMembers.filter(m=>!data.assignments.some(a=>a.user_id===m.id&&a.version_id===v.id)).map(m=><button type="button" className="secondary" key={m.id} disabled={busy} onClick={()=>run('assign',{version_id:v.id,user_id:m.id})}>Tildel til {m.email}</button>)}</details>)}
   </div>
   <div className="ks-card"><h3>Revisjon av håndboken</h3><p className={overdue?'ks-error':''}>Neste revisjon: {data.settings?.next_review_on||'Fullfør oppstart'}{overdue?' · Frist passert':''}</p><p>Minst årlig er avtalt minimum i ProffDok. Endringer eller hendelser kan kreve tidligere gjennomgang. Den utpekte KS/HMS-ansvarlige signerer.</p>
    {data.context.responsible?<form onSubmit={async e=>{e.preventDefault();const result=await run('review',{settings_revision:data.settings.revision,version_snapshot:currentVersionSnapshot(data),findings,follow_up:followUp,next_review_on:nextReview},'Revisjonen er signert og lagret med eksakte versjoner.');if(result){setReviewChecked(false);setFindings('');setFollowUp('')}}}>
     <p>{latest.length} gjeldende publiserte rutineversjoner inngår. Se historikk og vurder også upubliserte endringer og arkivering før signering.</p>
     <Field label="Hva er gjennomgått og hvilke funn er gjort?" value={findings} onChange={setFindings} multiline required/>
     <Field label="Videre oppfølging – tiltak, ansvar og frist, eller begrunnelse dersom ingen tiltak" value={followUp} onChange={setFollowUp} multiline required/>
     <Field label="Neste revisjonsdato (innen ett år)" value={nextReview} type="date" onChange={setNextReview} required/>
     <label className="ks-check"><input type="checkbox" checked={reviewChecked} onChange={e=>setReviewChecked(e.target.checked)}/>Jeg har vurdert de oppførte versjonene, relevans og etterlevelse, og dokumentert funn og oppfølging. Dette er ingen myndighetsgodkjenning.</label><button disabled={busy||!reviewChecked||!latest.length}>Signer revisjon</button>
    </form>:<p>Du kan forberede endringer og følge opp håndboken. Signeringen utføres av utpekt KS/HMS-ansvarlig.</p>}
    <details><summary>Revisjonshistorikk ({data.reviews.length})</summary>{data.reviews.map(r=><article key={r.id}><h4>{dateTime(r.signed_at)} · {data.members.find(m=>m.id===r.signed_by)?.email||r.signed_by}</h4><p>{r.statement}</p><p className="ks-text">{r.findings}</p><p className="ks-text">{r.follow_up}</p><p>Neste revisjon: {r.next_review_on} · {r.version_snapshot.length} versjoner</p>{r.version_snapshot.map(s=>{const v=data.versions.find(v=>v.id===s.id);return <p key={s.id}>{v?`${v.content.title} · v${v.number}`:s.id}</p>})}</article>)}</details>
   </div>
  </>}
 </section>;
}
