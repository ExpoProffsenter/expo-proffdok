import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const cwd=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'participants-type-'));
let browser,server,checks=0;
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
const main=fs.readFileSync('src/main.jsx','utf8');
const participantContext=fs.readFileSync('src/main.jsx','utf8').match(/"data-project-participants-id": ([^,]+), "data-project-participants-readonly": ([^,]+),/);
assert(participantContext,'actual main shell supplies scoped participant read-only context');
const participantProps='{"data-project-participants-id": '+participantContext[1]+', "data-project-participants-readonly": '+participantContext[2]+'}';

const source=(from,to)=>main.slice(main.indexOf('  function '+from+'('),main.indexOf('  function '+to+'('));
try{
 fs.writeFileSync(path.join(temp,'entry.jsx'),`
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import * as runtime from '${cwd}/node_modules/react/jsx-runtime.js';
import Fields from '${cwd}/src/modules/project/ProjectInformationFields.jsx';
import {installProjectParticipantsUx} from '${cwd}/src/modules/project/projectParticipantsUxV3.jsx';
import '${cwd}/src/style.css';
import '${cwd}/src/modules/project/projectWorkspace.css';
import '${cwd}/src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '${cwd}/src/modules/app/appRuntimeStyles.js';
document.head.insertAdjacentHTML('beforeend','<style>'+APP_RUNTIME_STYLES+'</style>');
const stop=e=>e.stopPropagation();
const Input=new Function('import_jsx_runtime','stopInteractivePropagation',${JSON.stringify(source('Input','Textarea')+';return Input;')})(runtime,stop);
const Textarea=new Function('import_jsx_runtime','stopInteractivePropagation',${JSON.stringify(source('Textarea','Select')+';return Textarea;')})(runtime,stop);
window.writes=0;window.mails=0;window.allowLeave=false;
window.confirm=()=>window.allowLeave;
window.rpc=async()=>({company_id:'synthetic-company',customers:[]});
function App(){
 const [locked,setLocked]=useState(false);window.setParticipantLock=setLocked;
 const hasActiveProjectWorkspace=true,projectId="qa",isProjectSupportReadOnly=false,isProjectLocked=locked,isReadOnly=false;
 const [project,setProject]=useState({projectName:'Syntetisk prosjekt',responsible:'QA ansvarlig',date:'2026-11-02',address:'Testveien',postnr:'0001',city:'Oslo',customer:'QA kunde',customerEmail:'customer@example.invalid',customerPhone:'90000000',notes:''});
 const [slot,setSlot]=useState(false);window.moveParticipants=()=>setSlot(true);
 return <div data-expo-app-shell="true" data-expo-project-shell="1" {...${participantProps}}><main>
  <section className="project-info-editor"><h2>Rediger kunde- og prosjektinfo</h2><Fields project={project} setProject={setProject} Input={Input} Textarea={Textarea}/></section>
  {slot&&<section><h2>Deltakere og tilganger</h2><div data-project-participants-slot="1"/></section>}
  <button data-project-navigation="true" onClick={()=>window.left=true}>Tilbake</button>
 </main></div>;
}
createRoot(document.getElementById('app')).render(<App/>);installProjectParticipantsUx();
`);
 const result=await build({root:cwd,configFile:false,logLevel:'silent',resolve:{alias:{'react/jsx-runtime':path.join(cwd,'node_modules/react/jsx-runtime.js')}},plugins:[react(),{name:'participants-typography-transport',enforce:'pre',resolveId(id){if(id.endsWith('/salesSupabase.js'))return '\0client';if(id.endsWith('/appSupabaseClientRegistry.js'))return '\0registry';if(id.endsWith('/progressPlanSupabase.js'))return '\0safe';if(id.endsWith('/moduleAccessClient.js'))return '\0rpc';},load(id){if(id==='\0client')return 'export const createDefaultSalesSupabaseClient=()=>({from(){window.writes++;throw Error("Unexpected database access");},functions:{invoke(){window.mails++;throw Error("Unexpected email");}}});';if(id==='\0registry')return 'export const whenAppSupabaseClientRegistered=()=>{};';if(id==='\0safe')return 'export const isProgressSafePreviewMode=()=>true;';if(id==='\0rpc')return 'export const rpcWithStoredSession=(...args)=>window.rpc(...args);';}}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:path.join(temp,'entry.jsx'),output:{inlineDynamicImports:true}}}});
 const js=result.output.find(x=>x.type==='chunk').code,css=result.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
 server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 if(process.env.PROJECT_PARTICIPANTS_BUILD_ONLY==='1'){console.log('Participant native fixture build PASS (browser not started)');} else {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(const width of [1363,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.addInitScript(()=>localStorage.setItem('expoProffDokProjectParticipantsSafePreview:qa',JSON.stringify([{id:'local-qa',name:'QA Elektriker',company:'Testfirma',role:'Elektriker',email:'qa@example.invalid',phone:'90000001',receive_email:false,local:true}])));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?project=qa&role=admin&progressTest=safe');
  const panel=page.locator('#expo-project-participants-root');await panel.locator('[data-participant-field=name]').waitFor();
  const style=locator=>locator.evaluate(e=>{const s=getComputedStyle(e);return {size:s.fontSize,weight:s.fontWeight,family:s.fontFamily,line:s.lineHeight,transform:s.textTransform,spacing:s.letterSpacing,radius:s.borderRadius};});
  const reference=await style(page.getByRole('textbox',{name:'Kunde',exact:true}));
  const labelReference=await style(page.getByRole('textbox',{name:'Kunde',exact:true}).locator('..').locator('span'));
  const value=await style(panel.locator('[data-participant-field=name]'));
  const label=await style(panel.locator('[data-participant-field=name]').locator('..'));
  console.log(JSON.stringify({width,reference,labelReference,value,label}));
  if(process.env.PARTICIPANTS_EVIDENCE){fs.mkdirSync(process.env.PARTICIPANTS_EVIDENCE,{recursive:true});await panel.screenshot({path:path.join(process.env.PARTICIPANTS_EVIDENCE,'participants-'+width+'.png')});}
  for(const field of ['name','company','role','email','phone']){
   const computed=await style(panel.locator('[data-participant-field='+field+']'));
   for(const key of ['size','weight','family','line','radius'])eq(computed[key],reference[key],field+' matches adjacent project field '+key+' '+width);
  }
  eq(label.transform,'none','no uppercase participant label '+width);
  eq(label.weight,labelReference.weight,'same label weight '+width);
  eq(label.size,labelReference.size,'same label size '+width);
  eq(label.spacing,labelReference.spacing,'same label letter spacing '+width);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow '+width);
  const targets=await panel.locator('button,input:not([type=checkbox])').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().height).map(e=>({h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width,font:parseFloat(getComputedStyle(e).fontSize)})));
  eq(targets.every(x=>x.h>=44&&x.w>=44&&x.font>=16),true,'readable touch controls '+width);
  await panel.locator('[data-participant-field=name]').fill('Bevart usendt deltaker');
  await page.getByRole('button',{name:'Tilbake',exact:true}).click();eq(await page.evaluate(()=>Boolean(window.left)),false,'native dirty guard retains participant '+width);
  await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));window.moveParticipants();});
  await page.waitForFunction(()=>document.querySelector('[data-project-participants-slot] #expo-project-participants-root'));
  eq(await panel.locator('[data-participant-field=name]').inputValue(),'Bevart usendt deltaker','reattached editor preserves draft '+width);
  eq((await style(panel.locator('[data-participant-field=name]'))).weight,reference.weight,'same typography in access slot '+width);
  await panel.getByRole('button',{name:'Lagre prosjektinvolverte',exact:true}).first().click();await panel.getByText('Prosjektinvolverte er lagret lokalt i trygg Preview.',{exact:true}).waitFor();
  await panel.getByRole('button',{name:'Send en e-post',exact:true}).click();
  const composer=panel.locator('.project-mail-composer');await composer.getByLabel('Melding',{exact:true}).fill('Usendt testmelding');
  for(const tag of ['input','textarea'])eq((await style(composer.locator(tag))).weight,reference.weight,'composer value uses normal weight '+tag+' '+width);
  await panel.getByRole('button',{name:'Send en e-post',exact:true}).click();await panel.getByRole('button',{name:'Send en e-post',exact:true}).click();
  eq(await composer.locator('textarea').inputValue(),'Usendt testmelding','composer draft survives closing '+width);
  await page.evaluate(()=>window.setParticipantLock(true));
  await panel.getByRole('button',{name:'+ Legg til',exact:true}).waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('#expo-project-participants-root input,#expo-project-participants-root textarea,#expo-project-participants-root button')].every(e=>e.disabled));
  eq(await panel.locator('input,textarea,button').evaluateAll(es=>es.length>10&&es.every(e=>e.disabled)),true,'lock disables rows and unsent composer '+width);
  eq(await panel.locator('[data-participant-field=name]').inputValue(),'Bevart usendt deltaker','lock retains stored contact '+width);
  eq(await composer.locator('textarea').inputValue(),'Usendt testmelding','lock retains unsent mail '+width);
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'locked explanation has no horizontal overflow '+width);
  await page.evaluate(()=>window.setParticipantLock(false));
  await page.waitForFunction(()=>!document.querySelector('#expo-project-participants-root [data-participant-field=name]').disabled);
  eq(await composer.locator('textarea').inputValue(),'Usendt testmelding','unlock retains original composer '+width);

  eq(await page.evaluate(()=>({writes:window.writes,mails:window.mails})),{writes:0,mails:0},'no server writes or email '+width);
  eq(errors,[],'no page errors '+width);await page.close();
 }
 console.log('Participant typography browser: '+checks+' assertions PASS — adjacent real fields, four widths, draft/slot/local-save and unsent composer.');
}
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
