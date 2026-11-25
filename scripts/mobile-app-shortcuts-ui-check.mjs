import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {build} from 'vite';import react from '@vitejs/plugin-react';
const {chromium}=await import(process.env.MOBILE_PLAYWRIGHT_PATH||'playwright');
const root=process.cwd(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'app-mobile-'));
const main=fs.readFileSync('src/main.jsx','utf8');const condition=main.split('\n').find(line=>line.includes('className: "mobileProjectChooser"')).trim().split(' && /* @__PURE__ */')[0];
try{
const entry=path.join(temp,'entry.jsx');
fs.writeFileSync(entry,`import React,{useState}from'${root}/node_modules/react/index.js';import{createRoot}from'${root}/node_modules/react-dom/client.js';import Shortcuts from'${root}/src/modules/app/MobileScrollShortcuts.jsx';import'${root}/src/style.css';import'${root}/src/modules/app/mobileResponsive41A.css';function App(){const[tab,setTab]=useState('hr'),[short,setShort]=useState(false);const projectId='',mobileCreatingProject=false;return <><Shortcuts/><header>{['hr','kshms','innlogging','prosjekt'].map(key=><button id={'module-'+key} onClick={()=>setTab(key)}>{key}</button>)}<button id="short" onClick={()=>setShort(true)}>Kort side</button></header>{(${condition})&&<section className="mobileProjectChooser"><h2>Hva vil du jobbe med?</h2></section>}<main><h1>{tab}</h1><input aria-label="Kontrollfelt" defaultValue="Behold denne teksten"/>{Array.from({length:short?0:35},(_,i)=><p key={i}>Syntetisk innhold for mobilkontroll {i}</p>)}</main></>;}createRoot(document.getElementById('app')).render(<App/>);`);
const bundle=await build({root,configFile:false,logLevel:'silent',resolve:{alias:{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')}},define:{'process.env.NODE_ENV':'"production"'},plugins:[react()],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'AppProof',cssFileName:'app-proof'}}});
const out=(Array.isArray(bundle)?bundle[0]:bundle).output,js=out.find(x=>x.type==='chunk'&&x.isEntry).code,css=out.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const browser=await chromium.launch({headless:true,executablePath:process.env.MOBILE_CHROMIUM_PATH,args:['--no-sandbox']});
try{for(const width of [320,390,760,1280]){
 const page=await browser.newPage({viewport:{width,height:820},isMobile:width<=760,hasTouch:width<=760});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.fulfill({contentType:route.request().url().endsWith('.js')?'text/javascript; charset=utf-8':'text/html',body:route.request().url().endsWith('.js')?js:`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><div id="app"></div><style>${css}</style><script src="/bundle.js"></script>`}));
 await page.goto('https://qa.example.invalid/');await page.locator('h1').waitFor();
 for(const tab of ['hr','kshms','innlogging','prosjekt']){
  await page.locator('#module-'+tab).click();assert.equal(await page.locator('.mobileProjectChooser').count(),tab==='prosjekt'?1:0);
  if(width<=760){await page.getByRole('button',{name:'Til bunnen',exact:true}).tap();assert(await page.evaluate(()=>scrollY>100));await page.getByRole('button',{name:'Til toppen',exact:true}).tap();assert(await page.evaluate(()=>scrollY<10));assert.equal(await page.locator('.sales-scroll-shortcuts').count(),1);}
  else assert.equal(await page.getByRole('button',{name:'Til toppen',exact:true}).count(),0);
 }
 if(width<=760){await page.getByLabel('Kontrollfelt').focus();await page.waitForTimeout(30);assert.equal(await page.locator('.sales-scroll-shortcuts').count(),0);assert.equal(await page.getByLabel('Kontrollfelt').inputValue(),'Behold denne teksten');await page.locator('#module-hr').click();await page.locator('#short').click();await page.waitForTimeout(50);assert.equal(await page.locator('.sales-scroll-shortcuts').count(),0,'short document hides controls');}
 assert.deepEqual(errors,[]);await page.close();
}console.log('Actual mobile app control PASS: HR, KS/HMS, profile and home at 320/390/760/1280, touch top/bottom, one control, actual home condition, keyboard and short-page hiding, desktop unchanged.');}finally{await browser.close();}
}finally{fs.rmSync(temp,{recursive:true,force:true});}
