import React,{useEffect,useRef,useState} from 'react';
import Dialog from './BoligEditorDialog.jsx';
import {workOrderRpc,workOrderGroups} from './boligWorkOrderClient.js';
import {readBoligImage} from './boligImages.js';
import './boligWorkOrderPrint.css';
const stamp=v=>v?new Date(v).toLocaleString('nb-NO',{timeZone:'Europe/Oslo',dateStyle:'short',timeStyle:'short'}):'';
function PrintImage({value,name,report}){
 const [src,setSrc]=useState('');const timeout=useRef(null);
 useEffect(()=>{let active=true;if(!value){report('none');return;}report('loading');
 const timer=timeout.current=setTimeout(()=>{if(active)report('failed');},20000);
 const resolve=/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(value)?Promise.resolve(value):readBoligImage(value);
 resolve.then(url=>{if(active){if(url)setSrc(url);else report('failed');}}).catch(()=>{if(active)report('failed');});
 return()=>{active=false;clearTimeout(timer);};},[value]);
 return src?<img src={src} alt={name} referrerPolicy="no-referrer" loading="eager" onLoad={()=>{clearTimeout(timeout.current);report('ready');}} onError={()=>{clearTimeout(timeout.current);report('failed');}}/>:<span className="bolig-work-image-placeholder">{value?'Bildet kunne ikke hentes':'Bilde ikke registrert'}</span>;
}
export default function WorkOrderPrint({context,root,unit}){
 const [open,setOpen]=useState(false),[data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[images,setImages]=useState({}),[allowMissing,setAllowMissing]=useState(false),[layout,setLayout]=useState('auto');
 const scope=`${context.user_id}/${context.company_id}/${root.id}/${unit.id}`,scopeRef=useRef(scope),epoch=useRef(0),loadedScope=useRef('');scopeRef.current=scope;
 useEffect(()=>{++epoch.current;setOpen(false);setData(null);setError('');return()=>{++epoch.current;};},[scope,context.enabled,context.role]);
 const load=async()=>{const n=++epoch.current;setOpen(true);setBusy(true);setData(null);setError('');setImages({});setAllowMissing(false);
 try{const next=await workOrderRpc(context,root.id,unit.id);if(n===epoch.current&&scopeRef.current===scope){loadedScope.current=scope;setData(next);}}catch(e){if(n===epoch.current)setError(e.message);}finally{if(n===epoch.current)setBusy(false);}};
 const close=()=>{++epoch.current;setOpen(false);setData(null);setBusy(false);};
 const report=(key,status)=>setImages(old=>old[key]===status?old:{...old,[key]:status});
 const expected=data?.goods.filter(g=>g.image_url)||[],waiting=expected.some(g=>!images[g.key]||images[g.key]==='loading'),failed=expected.filter(g=>images[g.key]==='failed').length;
 const columns=layout==='auto'?(data?.goods.length>=6?2:1):Number(layout);
 const print=async()=>{const n=epoch.current;setBusy(true);setError('');try{const fresh=await workOrderRpc(context,root.id,unit.id);if(n!==epoch.current||scopeRef.current!==scope)return;if(fresh.basis!==data.basis)throw Error('Bestillingen er endret. Hent utskriften på nytt før du skriver ut.');window.print();}catch(e){if(n===epoch.current){if(e.code==='42501')setData(null);setError(e.message);}}finally{if(n===epoch.current)setBusy(false);}};
 if(context.role!=='manager'||!context.enabled)return null;
 return <><section className="bolig-work-print-entry" aria-label="Til håndverkeren i boligen"><h4>Til håndverkeren i boligen</h4><p>Vis kundens grunnpakke og valgte tilvalg med bilder, uten priser. Dette er en leveranseoversikt. Kundens bekreftelse med priser finnes i beboerportalen.</p><button type="button" onClick={load}>Skriv ut leveranseoversikt</button></section>{open&&(!data||loadedScope.current===scope)&&<Dialog title="Leveranseoversikt til håndverker" busy={busy} onClose={close} className="bolig-work-order-print">
 <div className="bolig-work-print-controls"><p>Grunnpakke og valgte tilvalg fra beboerens lagrede grunnlag. Ingen priser. Velg skriver eller «Lagre som PDF» i utskriftsvinduet.</p>
 {busy&&<p role="status">Henter og kontrollerer bestillingen …</p>}{error&&<p role="alert">{error}</p>}
 {data&&<><label className="bolig-work-layout">Oppsett<select value={layout} onChange={e=>setLayout(e.target.value)}><option value="auto">Automatisk etter antall varer</option><option value="1">Én kolonne – større bilder</option><option value="2">To kolonner – kompakt</option></select></label><p>{data.goods.length} varer · {columns===2?'To kolonner':'Én kolonne'}. Alle varer og merknader tas med. Flere sider brukes når det trengs for å bevare lesbarheten. Velg A4 i utskriftsvinduet.</p>{waiting&&<p role="status">Klargjør varebilder …</p>}{failed>0&&<label><input type="checkbox" checked={allowMissing} onChange={e=>setAllowMissing(e.target.checked)}/>{failed} bilde(r) kunne ikke hentes. Jeg vil skrive ut med tydelig markering av manglende bilder.</label>}
 <button type="button" disabled={busy||waiting||(failed>0&&!allowMissing)} onClick={print}>Skriv ut / lagre som PDF</button><button type="button" disabled={busy} onClick={load}>Hent utskriften på nytt</button></>}
 </div>{data&&<article className="bolig-work-sheet" data-columns={columns}><header><p>{data.identity.company}</p><h1>Bolig {data.identity.unit}</h1><h2>{data.identity.address||'Adresse ikke registrert'}</h2><p>{data.identity.project} · {data.identity.block}</p>
 <strong>{data.confirmed?'Kundebekreftet bestilling':'Beboerens innsendte valg – ikke en akseptert avtale'}</strong>
 {!data.confirmed&&<p>Valget er sendt av beboeren. Kontroller prosjektlederens gjennomgang før arbeidet starter.</p>}
 <p>Grunnpakke og valgte tilvalg er samlet nedenfor. Erstattede grunnvarer er utelatt. Arket endrer ingen bestilling eller avtale.</p></header>
 {workOrderGroups(data.goods).map(group=><section className="bolig-work-group" key={group.name}><h2>{group.name}</h2><div className="bolig-work-goods">{group.goods.map(g=><article className="bolig-work-good" key={g.key}>
 <div className="bolig-work-image"><PrintImage value={g.image_url} name={g.name} report={status=>report(g.key,status)}/>{images[g.key]==='failed'&&<small>Bildet kunne ikke hentes</small>}</div>
 <div><h3>{g.name}</h3><p>Varenr. {g.sku||'ikke registrert'}</p><strong>{new Intl.NumberFormat('nb-NO').format(g.quantity)} {g.unit}</strong></div></article>)}</div></section>)}
 <section className="bolig-work-notes"><h2>Merknader fra bestillingsgrunnlaget</h2><p>Tekstene gjelder den oppførte avtaleutgaven. Kontroller dem sammen med varelisten.</p>{data.notes.map((note,i)=><div key={i}><h3>{note.title}</h3>{note.text&&<p className="bolig-work-text">{note.text}</p>}{(note.blocks||[]).map(b=><div key={b.id}>{b.title&&<h4>{b.title}</h4>}<p className="bolig-work-text">{b.text}</p></div>)}</div>)}</section>
 <footer><h2>Dette arket bygger på</h2>{data.sources.map(s=><p key={s.id}>{s.title}{s.version?` · v${s.version}`:''} · {stamp(s.at)} · Ref. {s.id}</p>)}<p>Skrevet ut {stamp(new Date())}. Kontroller nyeste utgave ved endringer.</p></footer>
 <div className="bolig-work-page-identity">Bolig {data.identity.unit} · {data.identity.address} · {data.identity.project}</div>
 </article>}</Dialog>}</>;
}
