import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'admin-access-036-'));
let browser,server,checks=0;
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
try{
 const entry=path.join(temp,'entry.jsx');
 fs.writeFileSync(entry,`import '${root}/src/style.css';import '${root}/src/modules/ui/proffdokWorkspace.css';
 import {APP_RUNTIME_STYLES} from '${root}/src/modules/app/appRuntimeStyles.js';
 import {installSystemAdminWorkProfileUx} from '${root}/src/modules/access/systemAdminWorkProfileUx.jsx';
 import {installSystemAdminUnifiedUserAccessUx} from '${root}/src/modules/access/systemAdminUnifiedUserAccessUx.jsx';
 import {registerAppSupabaseClient} from '${root}/src/modules/access/appSupabaseClientRegistry.js';
 const style=document.createElement('style');style.textContent=APP_RUNTIME_STYLES;document.head.append(style);
 const user={user_id:'qa-user',email:'qa@example.invalid',company_name:'Expo Proffsenter',company_scope_id:'expo',approved:true,deactivated:false,system_role:null,module_keys:['projects','sales'],feature_keys:[],primary_company_id:'expo',workspace_company_ids:['expo']};
 const others=[{...user,user_id:'qa-pending',email:'pending@example.invalid',approved:false},{...user,user_id:'qa-admin',email:'admin@example.invalid',system_role:'systemadmin'}];
 const users=[user,...others],companies=[{company_id:'expo',company_name:'Expo Proffsenter'},{company_id:'ringside',company_name:'Ringside Rørleggerbedrift AS'},{company_id:'long',company_name:'QA svært langt firmanavn med avdeling for sanitær, rør og dokumentasjon ÆØÅ'}];
 window.qa={calls:[],fail:false,unexpected:[]};
 const rpc=async(name,args={})=>{window.qa.calls.push({name,args});
  if(name==='list_managed_work_profiles')return {is_systemadmin:true,users,companies};
  if(name==='list_managed_module_access')return {is_systemadmin:true,users,caller_module_keys:['projects','sales']};
  if(name==='get_cordel_export_access')return false;
  if(name==='people_modules_user_get')return {company_id:args.p_company_id,user_id:args.p_user_id,company:{kshms:true,hr:true},kshms:true,hr:false,kshms_role:'reader',firmaadmin:false};
  if(name==='set_managed_work_profiles'){if(window.qa.fail)throw Error('QA lagringsfeil');user.workspace_company_ids=args.requested_company_ids;return {};}
  if(name==='set_managed_module_access'){user.module_keys=args.requested_module_keys;return {module_keys:user.module_keys};}
  window.qa.unexpected.push(name);throw Error('Uventet QA-kall: '+name);
 };
 window.fetch=async(url,options)=>{try{return new Response(JSON.stringify(await rpc(String(url).split('/').at(-1),JSON.parse(options?.body||'{}'))),{status:200});}catch(error){return new Response(JSON.stringify({message:error.message}),{status:400});}};
 localStorage.setItem('sb-qa-auth-token',JSON.stringify({access_token:'synthetic-qa-token',user:{id:'qa-admin'}}));
 registerAppSupabaseClient({rpc:async(name,args)=>{try{return {data:await rpc(name,args),error:null};}catch(error){return {data:null,error:{message:error.message}};}}});
 installSystemAdminUnifiedUserAccessUx();installSystemAdminWorkProfileUx();`);
 const built=await build({root,configFile:false,logLevel:'silent',plugins:[react()],define:{'process.env.NODE_ENV':'"production"'},build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'AdminAccessQa',cssFileName:'qa'}}});
 const output=(Array.isArray(built)?built[0]:built).output,js=output.find(x=>x.type==='chunk').code;
 let css=output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
 if(process.env.ADMIN_ACCESS_NEGATIVE==='1')css=css.replace(/body:has\(\[data-expo-app-shell="true"\]\) :is\(\[data-systemadmin-unified-access\],\[data-systemadmin-work-profiles\]\)[^}]*\}/g,'');
 server=http.createServer((req,res)=>{res.setHeader('content-type','text/html; charset=utf-8');res.end(`<!doctype html><html lang="nb"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}body{margin:0}.qa-host{padding:16px;max-width:1160px;margin:auto}.qa-card{min-width:0}</style><div data-expo-app-shell="true"><section class="qa-host"><h2>Systemadmin</h2><div class="item"><h3>Brukere og tilganger</h3>${['qa','pending','admin'].map(name=>`<div class="item qa-card" id="${name}-card"><b>${name}@example.invalid</b>${name==='qa'?'<label>Ulagret kontrollfelt<input id="draft" value="Behold dette"></label>':''}</div>`).join('')}</div></section></div><div id="qa-portal"></div><script>${js.replaceAll('</script','<\\/script')}</script></html>`);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[],outbound=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():(outbound.push(r.request().url()),r.abort('blockedbyclient')));await page.goto(base+'/');
 const profile=()=>page.locator('#qa-card [data-systemadmin-work-profiles]'),access=()=>page.locator('#qa-card [data-systemadmin-unified-access]');
 await profile().getByRole('checkbox',{name:'Expo Proffsenter Primærfirma',exact:true}).waitFor().catch(async error=>{console.error(JSON.stringify({errors,qa:await page.evaluate(()=>window.qa),body:await page.locator('body').innerText()}));throw error;});await access().getByRole('checkbox',{name:'KS/HMS Individuelt tildelt modultilgang.',exact:true}).waitFor();
 await page.getByLabel('Ulagret kontrollfelt').fill('Ulagret tekst og samme native felt');await page.locator('#draft').evaluate(n=>window.qa.draftNode=n);
 eq(await profile().getByRole('checkbox').count(),3,'three real workspace choices');eq(await access().getByRole('checkbox').count(),7,'people, modules, Cordel and net price');
 eq(await page.locator('#pending-card [data-systemadmin-work-profiles] input').count(),0,'pending user has no workspace controls');eq(await page.locator('#admin-card [data-systemadmin-work-profiles] input').count(),0,'systemadmin has no extra workspace controls');
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:936});
  const metrics=await page.locator('#qa-card :is([data-systemadmin-work-profiles],[data-systemadmin-unified-access]) label:has(>input[type=checkbox])').evaluateAll(labels=>labels.map(l=>{const i=l.querySelector('input'),s=l.querySelector('span'),b=s.querySelector('b'),small=s.querySelector('small'),r=l.getBoundingClientRect(),ir=i.getBoundingClientRect(),sr=s.getBoundingClientRect();return {inputWidth:ir.width,inputHeight:ir.height,labelHeight:r.height,radius:getComputedStyle(l).borderRadius,font:getComputedStyle(b).fontSize,hint:small?getComputedStyle(small).fontSize:null,beside:sr.left>=ir.right+8,contained:sr.right<=r.right&&l.scrollWidth<=l.clientWidth};}));
  eq(metrics.length,10,'all native choice labels measured '+width);
  for(const m of metrics){eq(m.inputWidth,24,'fixed checkbox width '+width);eq(m.inputHeight,24,'fixed checkbox height '+width);eq(m.labelHeight>=44,true,'full label hit area '+width);eq(m.radius,'6px','shared choice radius '+width);eq(m.font,'16px','readable choice '+width);if(m.hint)eq(m.hint,'14px','readable explanation '+width);eq(m.beside&&m.contained,true,'text beside checkbox without overflow '+width);}
  eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no page overflow '+width);eq(await page.locator('#draft').evaluate(n=>n===window.qa.draftNode&&n.value==='Ulagret tekst og samme native felt'),true,'same native draft '+width);
 }
 eq(await page.evaluate(()=>window.qa.calls.filter(c=>c.name.startsWith('set_')).length),0,'render and resize never save');
 await page.setViewportSize({width:1363,height:936});
 // Keep the legacy Systemadmin section and its discovery headings intact in
 // an outside-shell host. Neither React control nor its handler is replaced.
 await page.locator('.qa-host').evaluate(n=>document.querySelector('#qa-portal').appendChild(n));
 eq(await profile().getByRole('checkbox',{name:'Expo Proffsenter Primærfirma',exact:true}).isDisabled(),true,'primary stays mandatory in portal');
 const extra=profile().getByRole('checkbox',{name:'Ringside Rørleggerbedrift AS Ekstra arbeidsprofil',exact:true});await extra.check();eq(await extra.isChecked(),true,'native draft checkbox');
 eq(await page.evaluate(()=>window.qa.calls.filter(c=>c.name.startsWith('set_')).length),0,'selection is not a save');await page.evaluate(()=>window.qa.fail=true);await profile().getByRole('button',{name:'Lagre arbeidsprofiler',exact:true}).click();await profile().getByText('QA lagringsfeil',{exact:true}).waitFor();eq(await extra.isChecked(),true,'failed save keeps draft');
 await page.evaluate(()=>window.qa.fail=false);await profile().getByRole('button',{name:'Lagre arbeidsprofiler',exact:true}).click();await profile().getByRole('button',{name:'Arbeidsprofiler lagret',exact:true}).waitFor();
 eq(await page.evaluate(()=>window.qa.calls.filter(c=>c.name==='set_managed_work_profiles').map(c=>c.args)),[{target_user_id:'qa-user',requested_company_ids:['expo','ringside']},{target_user_id:'qa-user',requested_company_ids:['expo','ringside']}],'exact existing setter, primary preserved, retry explicit');
 const projects=access().getByRole('checkbox',{name:'Prosjekter og dokumentasjon',exact:true});await projects.uncheck();await access().getByRole('button',{name:'Lagre tilganger',exact:true}).click();await access().getByRole('button',{name:'Tilganger lagret',exact:true}).waitFor();
 eq(await page.evaluate(()=>window.qa.calls.filter(c=>c.name==='set_managed_module_access').map(c=>c.args)),[{target_user_id:'qa-user',requested_module_keys:['sales']}],'native module save preserved');
 eq(await page.locator('#draft').inputValue(),'Ulagret tekst og samme native felt','portal and save preserve unrelated input');eq(await page.evaluate(()=>window.qa.unexpected),[],'only expected isolated RPCs');eq(outbound,[],'no external transport');eq(errors,[],'no runtime errors');
 console.log('Native Systemadmin access: '+checks+' Chromium assertions PASS; both actual React adapters, late runtime CSS, five widths, primary/pending/systemadmin gates, portal topology, unchanged draft/save/error/retry and no external transport.');
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
