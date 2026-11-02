import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root=process.cwd();
let browser, checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
try {
 const bundle=await build({root,configFile:false,logLevel:"silent",plugins:[react(),{
  name:"inline-preview-boundaries",enforce:"pre",
  resolveId(id){if(/\/(SalesDetailViewLegacy|SalesContractActions|SalesContractWizard|StoreOfferOrderBasis)\.jsx$/.test(id))return "\0qa-"+id.split("/").pop();},
  load(id){
   if(id==="\0qa-SalesDetailViewLegacy.jsx")return "import{createElement as h}from'react';export default function Legacy(props){return h('section',{'data-original-case':'true'},h('input',{'aria-label':'Ulagret notat',defaultValue:'Opprinnelig kladd'}),props.customerPreview);}";
   if(id.startsWith("\0qa-"))return "export default function Unused(){return null;}";
  }
 }],resolve:{alias:{react:path.join(root,"node_modules/react"),"react-dom":path.join(root,"node_modules/react-dom")}},
 define:{"process.env.NODE_ENV":'"production"',"import.meta.env.VITE_SUPABASE_URL":'"https://draft-auth.example.invalid"',"import.meta.env.VITE_SUPABASE_ANON_KEY":'"synthetic-public-key"'},
 build:{write:false,minify:false,target:"esnext",lib:{entry:path.join(root,"scripts/fixtures/sales-draft-inline-preview-harness.jsx"),formats:["es"],name:"InlinePreviewQA",cssFileName:"inline-preview-qa"}}});
 const output=(Array.isArray(bundle)?bundle[0]:bundle).output;
 const js=output.find(x=>x.type==="chunk"&&x.isEntry).code;
 const css=output.filter(x=>x.type==="asset"&&x.fileName.endsWith(".css")).map(x=>x.source).join("\n");
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:["--no-sandbox"]});
 for(const quota of ["normal","blocked"])for(const width of [390,1366]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],outbound=[];
  page.setDefaultTimeout(7000);page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/*",route=>{
   if(/draft-auth|supabase|resend|functions\/v1/.test(route.request().url()))outbound.push(route.request().url());
   return route.fulfill({contentType:"text/html",body:'<!doctype html><html><body><div id="app"></div></body></html>'});
  });
  await page.goto("https://inline-qa.example.invalid/?quota="+quota);
  // Browser restriction exists before application/SDK module evaluation.
  if(quota==="blocked")await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException("Synthetic quota exhausted","QuotaExceededError");};});
  await page.addStyleTag({content:css});await page.addScriptTag({content:js,type:"module"});
  try {await page.waitForFunction(()=>window.qa?.ready);}
  catch(error){console.error({quota,width,errors,state:await page.evaluate(()=>({ready:window.qa?.ready,mainSignedIn:window.qa?.mainSignedIn,calls:window.qa?.calls}))});throw error;}
  eq(await page.evaluate(()=>window.qa.mainSignedIn),true,"actual SDK app session exists");
  eq(await page.evaluate(()=>window.qa.isolatedSignedIn),quota==="normal","isolated-client session disappears when persistence is unavailable");
  const launch=page.getByRole("button",{name:"Forhåndsvis som kunde",exact:true}),note=page.getByRole("textbox",{name:"Ulagret notat"});
  await note.fill("Behold denne ulagrede kladden");
  // The saved-preview action now lives in the shared customer panel. Narrow
  // workspaces open that panel without unmounting the original editor.
  if(width<=1000)await page.getByRole("button",{name:"Kundevisning",exact:true}).click();
  await launch.click();
  const dialog=page.getByRole("dialog",{name:"Forhåndsvis som kunde",exact:true});
  await dialog.getByText("Forhåndsvisning – ikke sendt til kunde",{exact:true}).waitFor();
  eq(await dialog.getByText("Lagret grunnarbeid",{exact:true}).count(),1,"saved server content rendered inside dialog");
  eq(await dialog.getByText("Ulagret varetekst",{exact:true}).count(),0,"unsaved offer content not substituted for server");
  eq(await page.locator("iframe").count(),0,"no second document/session");
  eq(await page.evaluate(()=>window.qa.popups),0,"no new tab or credential handoff");
  eq(await dialog.locator(".sales-customer-accept-form,.store-customer-decision-shell").count(),0,"read-only decisions remain absent");
  const group=dialog.locator("details.sales-customer-main-post").first();if(await group.getAttribute("open")===null)await group.locator("summary").click();
  const choice=dialog.getByRole("checkbox").first();await choice.check();
  await page.evaluate(()=>{window.dispatchEvent(new Event("focus"));document.dispatchEvent(new Event("visibilitychange"));});await page.waitForTimeout(40);
  eq(await choice.isChecked(),true,"foreground keeps local option trial");
  eq(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,"dialog has no horizontal overflow");
  if(process.env.SALES_DRAFT_QA_OUTPUT){
   fs.mkdirSync(process.env.SALES_DRAFT_QA_OUTPUT,{recursive:true});
   await dialog.screenshot({path:path.join(process.env.SALES_DRAFT_QA_OUTPUT,"inline-"+quota+"-"+width+".png")});
  }
  await dialog.getByRole("button",{name:"Tilbake til tilbudet",exact:true}).click();
  eq(await page.getByRole("dialog",{name:"Forhåndsvis som kunde",exact:true}).count(),0,"back closes only saved preview");
  eq(await page.locator(".sales-case-preview-drawer").evaluate(node=>node.open),true,"shared reading panel remains mounted after saved dialog closes");
  eq(await note.inputValue(),"Behold denne ulagrede kladden","original input and unsaved draft preserved");
  eq(await launch.evaluate(el=>el===document.activeElement),true,"focus restored to preview trigger");
  await launch.click();await dialog.getByText("Forhåndsvisning – ikke sendt til kunde",{exact:true}).waitFor();await page.keyboard.press("Escape");
  eq(await page.getByRole("dialog",{name:"Forhåndsvis som kunde",exact:true}).count(),0,"Escape closes saved dialog");
  await launch.click();await dialog.getByText("Forhåndsvisning – ikke sendt til kunde",{exact:true}).waitFor();
  await page.evaluate(()=>{window.qa.access=false;window.dispatchEvent(new Event("focus"));});
  await dialog.getByRole("button",{name:"Prøv igjen",exact:true}).waitFor();
  eq(await dialog.getByText("Lagret grunnarbeid",{exact:true}).count(),0,"revoked access hides old data");
  await page.evaluate(()=>{window.qa.access=true;});await dialog.getByRole("button",{name:"Prøv igjen",exact:true}).click();
  await dialog.getByText("Forhåndsvisning – ikke sendt til kunde",{exact:true}).waitFor();
  await page.evaluate(()=>window.qa.switchRequest());eq(await page.getByRole("dialog",{name:"Forhåndsvis som kunde",exact:true}).count(),0,"switching case closes previous saved preview");
  if(width<=1000)await page.getByRole("button",{name:"Kundevisning",exact:true}).click();
  await launch.click();await dialog.getByText("Forhåndsvisning – ikke sendt til kunde",{exact:true}).waitFor();
  await page.evaluate(()=>window.qa.client.auth.signOut({scope:"local"}));await dialog.getByRole("button",{name:"Prøv igjen",exact:true}).waitFor();
  eq(await dialog.getByText("Lagret grunnarbeid",{exact:true}).count(),0,"actual SDK logout clears preview");
  eq(context.pages().length,1,"one document for entire flow");
  eq(await page.evaluate(()=>window.qa.calls.filter(x=>x.path.startsWith("/rest/v1/")&&!x.path.includes("/rpc/")&&x.method!=="GET")),[],"no table writes");
  eq(outbound,[],"all transport injected, no live auth/API/email");
  eq(errors,[],"no browser runtime errors");
  await context.close();
 }
 console.log("PASS inline draft preview: "+checks+" actual React/SDK/Chromium assertions; normal/quota-blocked storage, 390/1366px, saved content, focus, back/Escape, case switch, revocation, logout, no outbound transport.");
} finally {await browser?.close();}

// Shared case/editor reading column: version selection, passive customer
// controls, tablet/desktop layout and preservation of the native form DOM.
await import("./sales-case-customer-preview-browser-check.mjs");
