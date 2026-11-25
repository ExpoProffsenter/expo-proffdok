import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const cwd=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sales-list-hydration-'));
const core=fs.readFileSync('src/modules/sales/SalesModuleCore.jsx','utf8');
const start=core.indexOf('  useEffect(() => {\n    let cancelled = false;\n\n    async function loadPersistentRequests()');
const end=core.indexOf('  async function persistRequests(',start);
assert(start>=0&&end>start,'actual complete list hydration effect');
const effect=core.slice(start,end);
const adapter=core.slice(core.indexOf('    <SalesListView\n'),core.indexOf('    />',core.indexOf('    <SalesListView\n'))+6);assert(adapter.includes('activeRequests={activeRequests}'));
const stateStart=core.indexOf('  const [requestListLoad, setRequestListLoad]');
const stateEnd=core.indexOf('  const [mode, setMode]',stateStart);
const listState=stateStart>=0?core.slice(stateStart,stateEnd):'const requestListLoadState=undefined;';
fs.writeFileSync(path.join(tmp,'entry.jsx'),`
import React,{act,useEffect,useMemo,useRef,useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import List from '${cwd}/src/modules/sales/components/SalesListView.jsx';
import {fetchSalesRequests,getSalesRequestsLoadState} from '${cwd}/src/modules/sales/services/salesSupabase.js';
const SalesListView=List,root=createRoot(document.getElementById('app'));
window.qa={pending:new Map(),saved:[],upserts:[],phase:[],wait(scope,phase,value){this.phase.push(scope+':'+phase);return new Promise((resolve,reject)=>this.pending.set(scope+':'+phase,{resolve:(next=value)=>resolve(next),reject}));}};
const rows=scope=>[{request_ref:scope+'-offer',payload:{title:'QA tilbud '+scope,customer:'Syntetisk kunde',status:'Tilbud',publicToken:'qa-only'}},{request_ref:scope+'-project',payload:{title:'QA prosjekt '+scope,customer:'Syntetisk kunde',status:'Aktivert',projectId:'qa-project'}}];
const getSalesSession=client=>window.qa.wait(client.scope,'session',{data:{session:{user:{id:client.scope}}}});
const resolveSalesCompanyScope=client=>window.qa.wait(client.scope,'company',{data:client.scope});
const fetchProjectsByIds=client=>window.qa.wait(client.scope,'projects',{data:[{id:'qa-project'}]});
const getSalesOfferByToken=client=>window.qa.wait(client.scope,'offer',{data:{offer:{status:'sent'}}});
const saveRequests=(requests,scope)=>window.qa.saved.push({scope,ids:requests.map(r=>r.id)});
const upsertSalesRequests=async(client,requests)=>{window.qa.upserts.push(requests);return {};};
const stripTransientPhotoData=r=>r,INSPECTION_BUCKET='qa';
function App({scope='a',standalone=false}){
 const salesStorageKey=scope,integrationMode=standalone?'preview':'app';
 const activeSupabase=useMemo(()=>({scope,rpc:()=>window.qa.wait(scope,'summaries',{data:rows(scope)})}),[scope]);
 const [requests,setRequests]=useState([]),[mode,setMode]=useState('list'),[selectedRequestId,setSelectedRequestId]=useState('');
 const [salesCompanyId,setSalesCompanyId]=useState(null),[salesStorageError,setSalesStorageError]=useState('');
 ${listState}
 ${effect}
 const activeRequests=requests.filter(r=>r.status!=='Aktivert'),activatedRequests=requests.filter(r=>r.status==='Aktivert'),summary=[],listViewStateRef=useRef(null),onCreateOffer=()=>{};
 return ${adapter};
}
window.qaAct=act;window.renderQA=props=>root.render(<App key={props.scope+":"+(props.epoch||0)} {...props}/>);window.unmountQA=()=>root.unmount();window.loadStateQA=getSalesRequestsLoadState;
`);
const bundle=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(cwd,'node_modules/react/jsx-runtime.js')}},define:{'process.env.NODE_ENV':'"development"'},plugins:[react(),{name:'no-support-read',enforce:'pre',resolveId(id){if(id.endsWith('/SalesSupportNotice.jsx'))return '\0support';},load(id){if(id==='\0support')return 'export default function(){return null;}';}}],build:{write:false,minify:false,lib:{entry:path.join(tmp,'entry.jsx'),formats:['iife'],name:'ListHydration'}}});
const dom=new JSDOM('<div id="app"></div>',{url:'https://qa.vercel.app/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
w.IS_REACT_ACT_ENVIRONMENT=true;w.scrollTo=()=>{};w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
const errors=[];w.addEventListener('error',e=>errors.push(e.message));
w.eval((Array.isArray(bundle)?bundle[0]:bundle).output.find(x=>x.type==='chunk').code);
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
const act=w.qaAct,settle=()=>act(async()=>{await new Promise(r=>w.setTimeout(r,20));});
const release=async(scope,phase,override)=>{await act(async()=>{const p=w.qa.pending.get(scope+':'+phase);assert(p,'pending '+scope+':'+phase);w.qa.pending.delete(scope+':'+phase);p.resolve(override);});await settle();};
const reject=async(scope,phase,message)=>{await act(async()=>{const p=w.qa.pending.get(scope+':'+phase);assert(p);w.qa.pending.delete(scope+':'+phase);p.reject(Error(message));});await settle();};
const render=async props=>{await act(async()=>w.renderQA(props));await settle();};
const hydrate=async scope=>{await release(scope,'session');await release(scope,'company');await release(scope,'summaries');await release(scope,'projects');await release(scope,'offer');};
const txt=()=>w.document.body.textContent;
const loading=label=>{eq(txt().includes('Henter saksoversikt fra server'),true,label+' loading');eq(txt().includes('Ingen ubokede forespørsler'),false,label+' no false empty');};
try{
 await act(async()=>w.renderQA({scope:'a'}));await settle();
 await release('a','session');await release('a','company');await release('a','summaries');
 eq(w.loadStateQA().status,'ready','actual transport is already ready before project verification');
 loading('project verification still pending');
 eq([...w.document.querySelectorAll('[role=tablist][aria-label=Tilbudstype] button')].every(n=>!n.textContent.includes('0')),true,'offer type counters do not claim zero while metadata is still hydrating');
 await release('a','projects');loading('public offer check still pending');
 await release('a','offer');eq(txt().includes('Henter saksoversikt fra server'),false,'actual complete hydration ends loading');
 eq(txt().includes('QA prosjekt a'),true,'activated project remains present');
 eq(w.qa.saved.length,1,'existing local list cache saved once after hydration');eq(w.qa.upserts.length,0,'valid activated project never repairs or writes');
 // A new owner must not inherit the previous transport's ready state.
 await render({scope:'late'});loading('new scope before authentication');
 await release('late','session');await release('late','company');await release('late','summaries');loading('old scope project read pending');
 await render({scope:'current'});loading('new scope while old transport says ready');
 await hydrate('current');eq(txt().includes('QA prosjekt current'),true,'current scope installs its own data');
 await release('late','projects');await release('late','offer');
 eq(txt().includes('QA prosjekt late'),false,'late old scope never replaces current rows');
 eq(txt().includes('QA prosjekt current'),true,'late old completion retains current rows');
 eq(Array.from(w.qa.saved,x=>x.scope).includes('late'),false,'late old scope never writes local list cache');
 // Confirmed empty is distinct from unknown/loading and must still work.
 await render({scope:'empty'});await release('empty','session');await release('empty','company');await release('empty','summaries',{data:[]});
 eq(txt().includes('Henter saksoversikt fra server'),false,'confirmed empty settles');
 eq(txt().includes('Ingen ubokede forespørsler'),true,'actual confirmed empty retains established empty message');
 eq(w.document.querySelector('[role=tablist][aria-label=Tilbudstype] button').textContent.includes('0'),true,'confirmed empty may show real zero');
 // A network/permission/hydration failure is never presented as empty success.
 await render({scope:'network'});await release('network','session');await release('network','company');await reject('network','summaries','QA nettfeil');
 eq(w.document.querySelector('[role=alert]')?.textContent.includes('QA nettfeil'),true,'actual transport failure retains explanation');
 eq(txt().includes('Ingen ubokede forespørsler'),false,'network error is not empty');
 eq(w.document.querySelector('[role=tablist][aria-label=Tilbudstype] button').textContent.includes('–'),true,'failed count is unknown, not zero');
 await render({scope:'hydrate-error'});await release('hydrate-error','session');await release('hydrate-error','company');await release('hydrate-error','summaries');await reject('hydrate-error','projects','QA kontrollfeil');
 eq(w.document.querySelector('[role=alert]')?.textContent.includes('QA kontrollfeil'),true,'late preparation failure is not swallowed after transport ready');
 eq(txt().includes('Ingen ubokede forespørsler'),false,'late preparation error is not empty');
 await render({scope:'actor'});await release('actor','session',{data:{session:null}});
 eq(w.document.querySelector('[role=alert]')?.textContent.includes('Innloggingen kunne ikke bekreftes'),true,'missing actor remains blocked with explanation');
 eq(w.qa.phase.includes('actor:company'),false,'missing actor cannot resolve company or load rows');
 await render({scope:'denied'});await release('denied','session');await release('denied','company',{data:null,error:{message:'QA firmatilgang borte'}});
 eq(w.document.querySelector('[role=alert]')?.textContent.includes('QA firmatilgang borte'),true,'company denial stays explicit');
 eq(w.qa.phase.includes('denied:summaries'),false,'company denial does not load another company');
 // Existing reopen retry and standalone fallback are preserved.
 await render({scope:'network',epoch:1});loading('reopen retry with previous global error');await hydrate('network');
 eq(txt().includes('QA prosjekt network'),true,'successful reopen recovers same scope');
 await render({scope:'standalone',standalone:true});eq(txt().includes('Henter saksoversikt fra server'),false,'standalone keeps established ready transport fallback');
 eq(w.qa.phase.includes('standalone:session'),false,'standalone does not start app hydration');
 eq(w.qa.upserts.length,0,'all scenarios preserve existing no-write boundary');
 eq(errors,[],'no asynchronous DOM errors');
 console.log('Sales list actual hydration React: '+checks+' assertions PASS; actual core effect/caller, actual summary transport and list; delayed project/offer reads, no false zero and no backend writes.');
}finally{await act(async()=>w.unmountQA());dom.window.close();fs.rmSync(tmp,{recursive:true,force:true});}
