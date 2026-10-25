import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = process.cwd(), temp = fs.mkdtempSync(path.join(os.tmpdir(), "draft-preview-qa-"));
const modulePath = process.env.KSHMS_JSPDF_PATH;
assert(modulePath, "KSHMS_JSPDF_PATH required for the actual PDF renderer");
const scope = "Oppstart, tildekking og riving\nTildekking av gang og transportvei.\n\nRørleggerarbeider\nNye vannrør og nødvendige tilkoblinger.\n\nSnekkerarbeider\nKontroll og oppretting av vegger.\n\nGulv og membran\nStøping med fall og godkjent membran.";
const request = { id: "QA-DRAFT", title: "Syntetisk tilbud", customer: "QA kunde", address: "QA arbeidssted", offerTitle: "QA tilbud", status: "Tilbud", offerIntro: "QA innledning", offerIncluded: scope, offerTotal: 10000, offerLines: [{ id: "base", mainPostId: "rorlegger", mainPostTitle: "Rørlegger", description: "Grunnarbeid", amount: 10000 }], offerOptions: [{ id: "option", mainPostId: "rorlegger", mainPostTitle: "Rørlegger", title: "Ekstra arbeid", amount: 1000, optionType: "addition" }] };
fs.writeFileSync(path.join(temp, "entry.jsx"), `
import React from '${root}/node_modules/react/index.js';import{createRoot}from'${root}/node_modules/react-dom/client.js';
import Preview from '${root}/src/modules/sales/components/SalesDraftCustomerPreview.jsx';
import{createPublishedOfferPdfPolishedV2}from'${root}/src/modules/sales/services/salesOfferPdfPolishedV2.js';
import'${root}/src/modules/sales/sales.css';
const callbacks=new Set();window.qa={session:null,company:'company-a',reads:0,loads:0,clients:0,hold:false,fail:false,request:${JSON.stringify(request)}};
window.qa.emit=(event,user)=>{window.qa.session=user?{user:{id:user},access_token:'synthetic-only'}:null;for(const cb of callbacks)cb(event,window.qa.session);};
window.qa.client={auth:{getSession:async()=>{window.qa.reads++;if(window.qa.hold)await new Promise(r=>window.qa.resume=r);return{data:{session:window.qa.session},error:window.qa.fail?{message:'offline'}:null};},onAuthStateChange:cb=>{callbacks.add(cb);return{data:{subscription:{unsubscribe:()=>callbacks.delete(cb)}}};}}};
const app=createRoot(document.getElementById('app'));window.mount=()=>app.render(<React.StrictMode><Preview/></React.StrictMode>);window.mount();
window.makePdf=async()=>{window.pdfRows=[];const file=await createPublishedOfferPdfPolishedV2({selectedRequest:{...window.qa.request,companyName:'QA firma',sentOfferVersionNumber:1}});return{bytes:Array.from(new Uint8Array(await file.blob.arrayBuffer())),rows:window.pdfRows};};
`);
let browser;
let checks = 0;
const eq = (a,b,label) => { assert.deepEqual(a,b,label); checks++; };
try {
  const bundle = await build({ root, configFile: false, logLevel: "silent", plugins: [react(), {
    name: "preview-fixtures", enforce: "pre",
    resolveId(id) {
      if (id.endsWith("/services/salesSupabase.js")) return "\0preview-api";
      if (id.endsWith("/services/salesCommunication.js")) return "\0preview-company";
      if (id === "https://esm.sh/jspdf@2.5.1") return "\0recorded-jspdf";
    },
    load(id) {
      if (id === "\0preview-api") return `export const createDefaultSalesSupabaseClient=()=>{window.qa.clients++;return window.qa.client;};export const getSalesSession=c=>c.auth.getSession();export const resolveSalesCompanyScope=async()=>({data:window.qa.company,error:null});export const fetchSalesRequestDetailRow=async(c,company,ref)=>{window.qa.loads++;return{data:{request_ref:ref,payload:{...window.qa.request,customer:company}},error:null};};export const declineSalesOffer=()=>{throw Error('Preview must never decline');};`;
      if (id === "\0preview-company") return `export const fetchSalesCompanyProfile=async()=>({companyName:'QA firma',logoUrl:''});`;
      if (id === "\0recorded-jspdf") return `import{jsPDF as Actual}from '${modulePath}';export class jsPDF extends Actual{constructor(options){super(options);const draw=this.text.bind(this);this.text=(value,x,y,...args)=>{window.pdfRows.push({value,font:this.getFont().fontStyle,size:this.getFontSize(),color:this.getTextColor(),x,y});return draw(value,x,y,...args);};}}`;
    },
  }], resolve: { alias: { react: path.join(root,"node_modules/react"), "react-dom": path.join(root,"node_modules/react-dom") } }, define: { "process.env.NODE_ENV": '"production"' }, build: { write: false, minify: false, lib: { entry: path.join(temp,"entry.jsx"), formats:["iife"], name:"DraftPreviewQA", cssFileName:"draft-preview-qa" } } });
  const output = (Array.isArray(bundle) ? bundle[0] : bundle).output;
  const js = output.find(x=>x.type === "chunk" && x.isEntry).code;
  const css = output.filter(x=>x.type === "asset" && x.fileName.endsWith(".css")).map(x=>x.source).join("\n");
  browser = await chromium.launch({ headless:true, executablePath:process.env.CHROMIUM_PATH, args:["--no-sandbox"] });
  for (const width of [390,1366]) {
    const page = await browser.newPage({viewport:{width,height:900}}), errors=[], outbound=[];
    page.setDefaultTimeout(7000);
    page.on("pageerror",e=>errors.push(e.message));
    await page.route("**/*",route=>{ if (/supabase|functions\/v1|resend/.test(route.request().url())) outbound.push(route.request().url()); return route.fulfill({contentType:"text/html",body:'<!doctype html><html><head><title>Draft preview QA</title></head><body><div id="app"></div></body></html>'}); });
    await page.goto("https://draft-qa.example.invalid/?offerPreview=QA-DRAFT");
    await page.addStyleTag({content:css}); await page.addScriptTag({content:js});
    await page.getByRole("button",{name:"Prøv igjen",exact:true}).waitFor();
    eq(await page.evaluate(()=>window.qa.loads),0,"anonymous preview never reads offer "+width);
    eq(await page.getByRole("link",{name:"Åpne Expo ProffDok for å logge inn"}).getAttribute("href"),"/","same-origin login guidance");
    await page.evaluate(()=>window.qa.emit("SIGNED_IN","user-a"));
    await page.getByText("Forhåndsvisning – ikke sendt til kunde",{exact:true}).waitFor();
    eq(await page.getByText("Grunnarbeid",{exact:true}).count()>0,true,"restored session displays actual customer component "+width);
    eq(await page.locator(".sales-customer-accept-form,.store-customer-decision-shell").count(),0,"no acceptance/decline runtime "+width);
    const group=page.locator("details.sales-customer-main-post").first();if(await group.getAttribute("open")===null)await group.locator("summary").click();
    const choice=page.getByRole("checkbox").first();
    await choice.check();
    const before=await page.evaluate(()=>window.qa.loads);
    await page.evaluate(()=>{window.qa.emit("TOKEN_REFRESHED","user-a");window.dispatchEvent(new Event("focus"));document.dispatchEvent(new Event("visibilitychange"));});
    await page.waitForTimeout(40);
    eq(await choice.isChecked(),true,"foreground preserves trial option selection "+width);
    eq(await page.evaluate(()=>window.qa.loads),before,"foreground avoids remount/refetch "+width);
    await page.evaluate(()=>{window.qa.fail=true;window.dispatchEvent(new Event("focus"));});
    await page.getByRole("button",{name:"Prøv igjen",exact:true}).waitFor();
    eq(await page.locator(".sales-customer-offer-stack").count(),0,"failed auth check hides sensitive content");
    await page.evaluate(()=>{window.qa.fail=false;});await page.getByRole("button",{name:"Prøv igjen",exact:true}).click();
    await page.getByText("Forhåndsvisning – ikke sendt til kunde",{exact:true}).waitFor();
    await page.evaluate(()=>{window.qa.company="company-b";window.dispatchEvent(new Event("focus"));});
    await page.getByText("company-b",{exact:true}).waitFor();
    await page.evaluate(()=>window.qa.emit("SIGNED_OUT",null));
    await page.getByRole("button",{name:"Prøv igjen",exact:true}).waitFor();
    eq(await page.locator(".sales-customer-offer-stack").count(),0,"logout clears real customer DOM");
    await page.evaluate(()=>{window.qa.hold=true;window.qa.emit("SIGNED_IN","user-b");});
    await page.waitForFunction(()=>typeof window.qa.resume==="function");
    eq(await page.locator(".sales-customer-offer-stack").count(),0,"slow SDK restoration doesn't leak previous offer");
    await page.evaluate(()=>{window.qa.hold=false;window.qa.resume();});
    await page.getByText("Forhåndsvisning – ikke sendt til kunde",{exact:true}).waitFor();
    eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,"no sideways overflow "+width);
    eq(errors,[],"no runtime errors "+width); eq(outbound,[],"no live API or email "+width);
    if (width===1366) {
      const result=await page.evaluate(()=>window.makePdf());
      const titles=["Oppstart, tildekking og riving","Rørleggerarbeider","Snekkerarbeider","Gulv og membran"];
      const headingRows=titles.map(title=>{const row=result.rows.find(r=>r.value===title);assert(row,title+" missing in actual PDF");return row;});
      for(const row of headingRows)eq([row.font,row.size,row.color],[headingRows[1].font,headingRows[1].size,headingRows[1].color],"matching bold/dark heading style "+row.value);
      eq(headingRows[0].font,"bold","actual PDF heading bold");
      const body=result.rows.find(r=>r.value==="Tildekking av gang og transportvei.");assert(body);eq(body.font,"normal","ordinary body text remains normal");assert(headingRows[0].size>body.size);assert.notEqual(headingRows[0].color,body.color);
      const out=process.env.SALES_DRAFT_QA_OUTPUT||temp;fs.mkdirSync(out,{recursive:true});const pdf=path.join(out,"sales-scope-headings.pdf");fs.writeFileSync(pdf,new Uint8Array(result.bytes));
      const text=execFileSync("pdftotext",["-layout",pdf,"-"],{encoding:"utf8"});for(const title of titles)assert(text.includes(title));assert(/12\s?500/.test(text),"unchanged VAT total");
      execFileSync("pdftoppm",["-f","1","-singlefile","-scale-to","1400","-png",pdf,path.join(out,"sales-scope-headings")]);
    }
    await page.close();
  }
  console.log(`PASS draft preview: ${checks} actual React/Chromium and real jsPDF assertions at 390/1366px; late login, retry, same-user options, company change, logout, delayed restore, readonly decisions, no outbound API/email; matching scope heading styles and preserved body/total.`);
} finally { await browser?.close(); fs.rmSync(temp,{recursive:true,force:true}); }
