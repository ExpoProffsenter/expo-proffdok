import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {JSDOM}=await import(process.env.KSHMS_JSDOM_PATH||'jsdom');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'portal-status-'));
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try {
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import React,{act,useState} from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import {usePortalAccessStatus} from '${root}/src/modules/portal/usePortalAccessStatus.js';import {createAccessViewTools} from '${root}/src/modules/portal/accessViewTools.js';import {createPortalAccessTools} from '${root}/src/modules/portal/portalSecurityTools.js';
const Box=({title,children})=><section><h2>{title}</h2>{children}</section>,Field=({label,value,onChange})=><label>{label}<textarea value={value} onChange={e=>onChange(e.target.value)}/></label>;
const views=createAccessViewTools({Section:Box,Textarea:Field,Grid:Box,Input:Field,Select:Field,uid:()=> 'qa'}),client={rpc:(...args)=>window.rpc(...args)};
function App(){const [id,setId]=useState('project-a'),[user,setUser]=useState('user-a'),[scope,setScope]=useState('firm-a'),[enabled,setEnabled]=useState(true),[records,setRecords]=useState({});window.control={setId,setUser,setScope,setEnabled};const state=usePortalAccessStatus({client,userId:user,projectId:id,scopeKey:scope,enabled,onRecords:setRecords});const tools=createPortalAccessTools({project:{},projectId:id,portalAccessRecords:records});
return views.renderAccessPanel({project:{},projectId:id,accessEmailMessage:'',setAccessEmailMessage:()=>{},accessRoleInfo:[],access:[],setAccess:()=>{throw Error('No access edit');},roles:[],portalAccessRecordIsValid:tools.portalAccessRecordIsValid,getPortalAccessRecord:tools.getPortalAccessRecord,portalAccessPolicyText:()=> 'Eksisterende policy',ensurePortalAccessForProject:async args=>{window.rotations.push(args);return null;},copyAccessLink:()=>{throw Error('No copy requested');},sendAccessEmail:()=>{throw Error('No send requested');},portalStatusState:state.status,onRetryPortalStatus:state.retry});}
window.act=act;const app=createRoot(document.getElementById('app'));window.render=()=>app.render(<App/>);window.unmount=()=>app.unmount();`);
 const out=await build({root,configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':JSON.stringify('development')},resolve:{alias:{'react/jsx-runtime':root+'/node_modules/react/jsx-runtime.js'}},plugins:[react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'PortalStatusProof',cssFileName:'portal-status-proof'}}});
 const dom=new JSDOM('<div id="app"></div>',{url:'https://example.invalid',runScripts:'outside-only',pretendToBeVisual:true});
 try {
  const w=dom.window;w.IS_REACT_ACT_ENVIRONMENT=true;w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};}};
  const requests=[],pending=[];w.rotations=[];w.rpc=(name,args)=>{eq(name,'get_project_portal_access_status','only existing read RPC');requests.push(args);return new Promise((resolve,reject)=>pending.push({resolve,reject}));};
  w.eval((Array.isArray(out)?out[0]:out).output.find(x=>x.type==='chunk').code);
  const doc=w.document,text=()=>doc.body.textContent,rotate=()=>[...doc.querySelectorAll('button')].filter(b=>b.textContent==='Generer ny tilgangskode'),button=t=>[...doc.querySelectorAll('button')].find(b=>b.textContent===t),resolve=async(index,data)=>w.act(async()=>pending[index].resolve({data}));
  await w.act(async()=>w.render());eq(rotate().length,2,'both existing rotation actions present');eq(rotate().every(b=>b.disabled),true,'rotation disabled until status known');eq(text().includes('Henter portalstatus'),true,'pending read is visible');eq(text().includes('Ingen aktiv kode'),false,'unknown never claims no active code');
  await w.act(async()=>rotate()[0].click());eq(w.rotations.length,0,'pending status cannot rotate');
  await w.act(async()=>w.control.setId('project-b'));eq(requests.at(-1).p_project_id,'project-b','fresh exact project read');
  await resolve(0,{ok:true,kunde:{active:true},underleverandor:{active:true}});eq(text().includes('Aktiv kode'),false,'late former-project status ignored');eq(rotate().every(b=>b.disabled),true,'former project cannot enable rotation');
  await resolve(1,{ok:true,kunde:null,underleverandor:null});eq(rotate().some(b=>b.disabled),false,'confirmed status unlocks same existing action');eq(text().match(/Ingen aktiv kode/g).length,2,'no-code state requires confirmed read');
  await w.act(async()=>w.control.setScope('firm-b'));eq(text().includes('Ingen aktiv kode'),false,'new firm scope hides previous status immediately');eq(rotate().every(b=>b.disabled),true,'scope change blocks rotation during read');
  await resolve(2,{ok:false});eq(doc.querySelector('[role="alert"]')!==null,true,'rejected status is error, not absence');eq(rotate().every(b=>b.disabled),true,'failure cannot enable rotation');
  await w.act(async()=>button('Prøv portalstatus igjen').click());eq(text().includes('Henter portalstatus'),true,'manual retry is read-only pending');
  await resolve(3,{ok:true,kunde:{active:true},underleverandor:{active:true}});eq(text().match(/Aktiv kode/g).length,2,'existing active roles shown');eq(text().includes('••••••'),true,'codes remain masked');eq(text().includes('stored'),false,'internal sentinel never shown');
  await w.act(async()=>rotate()[0].click());eq(w.rotations.length,1,'explicit action preserved after confirmed read');eq(w.rotations[0].roleParam,'kunde','same role');eq(w.rotations[0].forceNew,true,'same explicit rotation intent');
  await w.act(async()=>w.control.setUser('user-b'));eq(rotate().every(b=>b.disabled),true,'user change blocks stale status');await w.act(async()=>pending[4].reject(Error('Synthetic offline')));eq(doc.querySelector('[role="alert"]')!==null,true,'transport failure exposes retry');
  await w.act(async()=>button('Prøv portalstatus igjen').click());await w.act(async()=>w.unmount());await resolve(5,{ok:true,kunde:{active:true}});eq(doc.getElementById('app').textContent,'','late response cannot restore unmounted view');
  eq(w.rotations.length,1,'no automatic code creation, sharing or rotation');
  console.log('Portal access status actual React: '+checks+' assertions PASS; delayed/failed/retried read, user/project/firm isolation, masked active codes, disabled rotation and late response. Synthetic status RPC and explicit action only.');
 } finally {dom.window.close();}
} finally {fs.rmSync(temp,{recursive:true,force:true});}
