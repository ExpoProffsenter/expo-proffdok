import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {build} from 'vite';
import react from '@vitejs/plugin-react';

// Actual profile/menu adapters and late production CSS. The authenticated host,
// profile transport and native navigation callbacks are synthetic and isolated.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'shell-profile-036-'));
const entry=path.join(tmp,'entry.jsx');
fs.writeFileSync(entry,`import {installWorkProfileUx} from '${root}/src/modules/access/workProfileUx.jsx';
import {installDesktopSideMenu} from '${root}/src/modules/app/desktopSideMenu.js';
import '${root}/src/style.css';import '${root}/src/modules/app/mobileResponsive41A.css';import '${root}/src/modules/ui/proffdokWorkspace.css';
import {APP_RUNTIME_STYLES} from '${root}/src/modules/app/appRuntimeStyles.js';
const runtime=document.createElement('style');runtime.textContent=APP_RUNTIME_STYLES;document.head.appendChild(runtime);
window.qa={writes:[],navigation:[],state:{can_switch:true,is_systemadmin:true,active_company_id:'a',active_company_profile:{companyName:'QA Firma A',logoUrl:'/qa-logo.svg'},workspaces:[{company_id:'a',company_name:'QA Firma A',is_primary:true},{company_id:'b',company_name:'QA Firma B med langt navn'},{company_id:'c',company_name:'QA Firma C'}]}};
document.querySelectorAll('#native>button').forEach(button=>button.onclick=()=>{window.qa.navigation.push(button.textContent);document.querySelectorAll('#native>button').forEach(n=>n.classList.toggle('on',n===button));});
window.publishProfile=patch=>{Object.assign(window.qa.state,patch);window.dispatchEvent(new CustomEvent('qa-profile',{detail:window.qa.state}));};
installDesktopSideMenu();installWorkProfileUx();`);
const bundled=await build({root,configFile:false,logLevel:'silent',plugins:[react(),{
 name:'isolated-profile-transport',enforce:'pre',resolveId(id){if(id.endsWith('/workProfileClient.js'))return '\0profile-qa';},
 load(id){if(id==='\0profile-qa')return `export const WORK_PROFILE_EVENT='qa-profile';export const readCachedWorkProfileState=()=>window.qa.state;export const getMyWorkProfileState=async()=>window.qa.state;export const setActiveWorkProfile=async id=>{window.qa.writes.push(id);throw Error('QA byttefeil – ingen lagring');};`;},
}],build:{write:false,minify:false,cssCodeSplit:false,rollupOptions:{input:entry,output:{inlineDynamicImports:true}}}});
const js=bundled.output.find(x=>x.type==='chunk').code,css=bundled.output.filter(x=>x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const server=http.createServer((req,res)=>{
 if(req.url==='/qa-logo.svg'){res.setHeader('content-type','image/svg+xml');res.end('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="40"><text x="0" y="28">QA Firma A</text></svg>');return;}
 res.setHeader('content-type','text/html;charset=utf-8');res.end(`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="root" data-expo-app-shell="true"><header><div class="head"><div><img alt="QA Firma A" src="/qa-logo.svg" width="180"></div><h1>Expo ProffDok</h1><button>Logg ut</button></div><nav id="native"><button class="on">Startside</button><button>Befaring/Tilbud</button><button>Prissøk</button><button>Firmaprofil</button><button>Min side</button><button>Hjelp</button><button>Support</button></nav></header><main><label>Usendt arbeid<textarea aria-label="Usendt arbeid">Behold denne teksten</textarea></label></main></div><script type="module">${js.replaceAll('</script','<\\/script')}</script>`);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,checks=0;const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1363,height:936}}),errors=[],outbound=[],confirmations=[];
 page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',async dialog=>{confirmations.push(dialog.message());await dialog.dismiss();});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():(outbound.push(route.request().url()),route.abort()));
 await page.goto('http://127.0.0.1:'+server.address().port);
 const opener=()=>page.getByRole('button',{name:'Representerer: QA Firma A',exact:true});
 await opener().waitFor();const draft=page.getByLabel('Usendt arbeid',{exact:true});await draft.fill('Bevart usendt kontrolltekst');const node=await draft.elementHandle();
 await opener().click();await page.getByRole('button',{name:'QA Firma C',exact:true}).waitFor();
 await page.keyboard.press('Escape');eq(await page.locator('.workProfileMenu').count(),0,'Escape closes real profile menu');
 eq(await opener().evaluate(n=>n===document.activeElement),true,'Escape returns focus to original opener');
 await opener().click();await draft.click();eq(await page.locator('.workProfileMenu').count(),0,'outside click closes without choosing a firm');
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:520});await opener().click();await page.locator('.workProfileMenu').waitFor();
  const frame=await page.locator('.workProfileMenu').evaluate(n=>{const r=n.getBoundingClientRect();return {fits:r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,radius:getComputedStyle(n).borderRadius,buttons:[...n.querySelectorAll('button')].map(b=>({height:b.getBoundingClientRect().height,font:getComputedStyle(b).fontSize,radius:getComputedStyle(b).borderRadius}))};});
  eq(frame.fits,true,'profile menu fits short viewport '+width);eq(frame.radius,'8px','profile menu frame '+width);
  eq(frame.buttons.every(b=>b.height>=44&&b.font==='16px'&&b.radius==='6px'),true,'readable profile options '+width);
  await page.getByRole('button',{name:'QA Firma C',exact:true}).focus();await page.keyboard.press('Escape');eq(await page.locator('.workProfileMenu').count(),0,'Escape from child option '+width);
  eq(await draft.evaluate((el,handle)=>el===handle,node),true,'same underlying draft DOM '+width);eq(await draft.inputValue(),'Bevart usendt kontrolltekst','same underlying draft value '+width);
 }
 await page.setViewportSize({width:1363,height:600});await opener().click();await page.getByRole('button',{name:'QA Firma A Aktiv',exact:true}).click();eq(await page.locator('.workProfileMenu').count(),0,'current firm closes without save');eq(await page.evaluate(()=>window.qa.writes),[],'opening and dismissing never switch firm');
 await opener().click();await page.getByRole('button',{name:'QA Firma B med langt navn',exact:true}).click();eq(confirmations.length,1,'different firm still uses existing explicit confirmation');eq(await page.evaluate(()=>window.qa.writes),[],'cancelled confirmation never writes');await page.keyboard.press('Escape');
 await page.evaluate(()=>{document.querySelector('#expo-desktop-menu-bar button[aria-expanded]').click();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));eq(await page.locator('#expo-desktop-menu-backdrop').evaluate(n=>n.classList.contains('isOpen')),false,'close before queued animation never revives backdrop');
 await page.getByRole('button',{name:'Alle områder',exact:true}).click();const drawer=page.locator('#expo-desktop-menu-drawer');await drawer.waitFor();await page.keyboard.press('Escape');await drawer.waitFor({state:'hidden'});eq(await draft.inputValue(),'Bevart usendt kontrolltekst','native menu Escape preserves draft');
 await page.getByRole('button',{name:'Alle områder',exact:true}).click();await drawer.getByRole('button',{name:'Hjelp',exact:true}).click();eq(await page.evaluate(()=>window.qa.navigation.at(-1)),'Hjelp','real desktop menu delegates native destination once');eq(await draft.inputValue(),'Bevart usendt kontrolltekst','native destination fixture preserves draft');
 await page.evaluate(()=>window.publishProfile({is_systemadmin:false,selection_required:true}));const required=page.getByRole('dialog',{name:'Velg arbeidsprofil',exact:true});await required.waitFor();
 for(const width of [320,390,768,1363,1920]){
  await page.setViewportSize({width,height:360});
  eq(await required.locator('.workProfileRequiredCard').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&n.scrollHeight>=n.clientHeight;}),true,'required selection fits short screen '+width);
  eq(await required.getByRole('button').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44&&getComputedStyle(n).fontSize==='16px')),true,'required options remain readable '+width);
 }
 await page.keyboard.press('Escape');eq(await required.isVisible(),true,'required initial selection cannot be bypassed by Escape');
 await required.getByRole('button',{name:'QA Firma C',exact:true}).click();await page.getByText('QA byttefeil – ingen lagring',{exact:true}).waitFor();eq(await required.isVisible(),true,'existing failed-selection state remains open');eq(await page.evaluate(()=>window.qa.writes),['c'],'only deliberate fixture choice invokes existing setter');
 await page.evaluate(()=>window.publishProfile({can_switch:false}));await page.locator('#expo-work-profile-switcher').waitFor({state:'detached'});eq(await draft.inputValue(),'Bevart usendt kontrolltekst','revoked selector leaves unrelated draft intact');
 eq(outbound,[],'no external traffic');eq(errors,[],'no browser errors');
 console.log(`Shell/work profile 03.6: ${checks} Chromium assertions PASS; actual adapters, native Escape/outside/focus, cancelled firm choice, required/error/revocation, five widths and short screens; synthetic host/transport only.`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(tmp,{recursive:true,force:true});}
