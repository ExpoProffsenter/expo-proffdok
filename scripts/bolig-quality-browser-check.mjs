import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const cwd = process.cwd(),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-deliveries-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Quality from '${cwd}/src/modules/bolig/BoligQuality.jsx';
import '${cwd}/src/style.css';import '${cwd}/src/modules/bolig/bolig.css';
const ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true},root={id:'root',title:'QA Prosjekt'};
let d={checks:[],documents:[],protocols:[],fdv:{}},revision=0,history=[],fdv=[{key:'tap',unit_id:'unit',unit:'H0101',block:'Bygg A',name:'QA Blandebatteri',sku:'00123',quantity:1,unit_name:'stk',fdv_url:'',choice_revision:1}];
window.__calls=[];window.__foreign=false;window.__deny=false;window.__hold=false;window.__role='manager';window.__mailSent=false;
const templates=[{id:'published',number:3,content_hash:'hash',content:{title:'Firmaets kontroll',trade:'Felles – alle fag',instructions:'Gjeldende mal',points:[{id:'published-point',title:'Publisert sjekkpunkt'}]}}];
const state=()=>({context:{...ctx,role:window.__role},root_id:'root',scope_id:'unit',kind:'unit',title:'H0101 · QA Gate',revision,data:structuredClone(d),templates,rooms:[],history,fdv:structuredClone(fdv),basis:'basis'+revision});
let prepared=null;
window.__client={storage:{from:()=>({upload:async()=>({}),createSignedUrl:async()=>({data:{signedUrl:'https://example.invalid/private-file'}})})},functions:{invoke:async(name,args)=>{window.__calls.push({name,args});return {data:{ok:true}};}},rpc:async(name,args)=>{
window.__calls.push({name,args});if(window.__hold)await new Promise(r=>window.__release=r);
if(window.__foreign)return {data:{...state(),context:{...ctx,company_id:'wrong'}}};
if(window.__deny&&args.p_action!=='get')return {error:{code:'PT409',message:'QA Konflikt. Kladden er beholdt.'}};
const p=args.p_payload;
if(name==='bolig_protocol_mail'){
 if(args.p_action==='list')return {data:{...state(),history:[]}};
 if(args.p_action==='prepare'){const protocol=d.protocols.find(x=>x.id===p.protocol_id);prepared={...state(),id:p.request_id,snapshot:{to:p.to,company:{companyName:'QA Firma'},project:'QA Prosjekt',scope:'H0101',protocol,original:{name:'protokoll.pdf'}}};}
 return {data:prepared};
}

if(name==='bolig_quality_distribution'){
 const base={context:{...ctx,role:window.__role},root_id:'root'};
 if(args.p_action==='get')return {data:{...base,templates:[{id:'published',title:'Firmaets kontroll',number:3}],project_lists:d.checks.map(x=>({id:x.id,scope_id:'unit',title:x.definition.title,scope_title:'H0101'})),targets:[{scope_id:'unit',room_id:null,block_id:'block',block:'Bygg A',title:'H0101'},{scope_id:'second',room_id:null,block_id:'block',block:'Bygg A',title:'H0102'},{scope_id:'unit',room_id:'bath',room:'Bad',block_id:'block',block:'Bygg A',title:'H0101'}]}};
 const plan=p.targets.flatMap(t=>p.sources.map(src=>({...t,title:src.kind==='template'?'Firmaets kontroll':'Prosjektliste',skip:false})));
 return {data:{...base,basis:'batch-basis',added:plan.length,skipped:0,plan}};
}
if(name==='bolig_documentation_export')return {data:{context:ctx,root_id:'root',scope_id:'unit',kind:'unit',title:'H0101',project:'QA Prosjekt',basis:'export-basis',status:'ready_with_rest',restpoints:[{title:'Mindre justering'}],fdv:structuredClone(fdv),scopes:[{id:'unit',title:'H0101',kind:'unit',revision,common:false,data:{...structuredClone(d),documents:[]},completion:{status:'ready_with_rest',items:[]},rooms:[],history:[]}]}};
if(name==='work_profile_company_profile')return {data:{companyId:'firm',companyName:'QA Firma'}};
if(args.p_action==='get')return {data:state()};
if(args.p_action==='check_add')d.checks.push({id:p.id,definition:p.version_id?templates[0].content:p.content,status:'draft',required:p.required,answers:{},sequence:1,source_number:p.version_id?3:null});
if(args.p_action==='check_save')d.checks=d.checks.map(x=>x.id===p.id?{...x,answers:p.answers,status:p.complete?'completed':'draft',completed_at:'2026-10-22T10:00:00Z',completed_by_name:'QA Leder'}:x);
if(args.p_action==='check_reopen')d.checks=d.checks.map(x=>x.id===p.id?{...x,status:'draft',sequence:x.sequence+1}:x);
if(args.p_action==='document')d.documents.push({...p.file,id:p.id,by_name:'QA Leder',at:'2026-10-22T10:00:00Z'});
if(args.p_action==='protocol_add')d.protocols.push({...p});
if(args.p_action==='protocol_save')d.protocols=d.protocols.map(x=>x.id===p.id?{...x,...p}:x);
if(args.p_action==='protocol_reopen')d.protocols=d.protocols.map(x=>x.id===p.id?{...x,confirmation:undefined}:x);
if(args.p_action==='protocol_confirm')d.protocols=d.protocols.map(x=>x.id===p.id?{...x,confirmation:{id:'confirmation',by_name:'QA Leder',by:'qa',at:'2026-10-22T10:00:00Z',note:p.reason}}:x);
if(args.p_action==='fdv_link')fdv=fdv.map(g=>g.key===p.key?{...g,fdv_url:p.url,corrected:true}:g);
revision++;history=[{revision,action:args.p_action,actor_name:'QA Leder',created_at:'2026-10-22T10:00:00Z',reason:p.reason},...history];return {data:state()};
}};
const app=createRoot(document.getElementById('app'));window.__show=(role='manager')=>{window.__role=role;app.render(<div className="bolig-dialog" style={{position:'static',display:'block',maxWidth:1000,margin:'auto'}}><Quality key={role} context={{...ctx,role}} root={root} scopeId="unit"/></div>);};window.__show();
`,
);
let server,
  browser,
  checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
try {
  const r = await build({
    root: cwd,
    configFile: false,
    resolve: {
      alias: {
        "react/jsx-runtime": cwd + "/node_modules/react/jsx-runtime.js",
      },
    },
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.VITE_SUPABASE_URL": '"https://qa.supabase.co"',
      "import.meta.env.VITE_SUPABASE_ANON_KEY": '"qa"',
    },
    logLevel: "silent",
    plugins: [
      react(),
      {
        name: "mock",
        enforce: "pre",
        resolveId(id) {
          if (id.endsWith("appSupabaseClientRegistry.js")) return "\0mock";
        },
        load(id) {
          if (id === "\0mock")
            return "export const getAppSupabaseClient=()=>window.__client;";
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      lib: {
        entry: path.join(temp, "entry.jsx"),
        formats: ["iife"],
        name: "Qa",
        cssFileName: "qa",
      },
    },
  });
  const out = (Array.isArray(r) ? r[0] : r).output,
    script = out.find((x) => x.type === "chunk").code,
    css = out
      .filter((x) => x.type === "asset" && x.fileName.endsWith(".css"))
      .map((x) => x.source)
      .join("\n");
  server = http.createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("content-type", "text/javascript");
      res.end(script);
    } else if (req.url === "/app.css") {
      res.setHeader("content-type", "text/css");
      res.end(css);
    } else
      res.end(
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script></html>',
      );
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox"],
        }
      : {}),
  });
  const page = await browser.newPage({
      viewport: { width: 1366, height: 900 },
    }),
    errors = [];
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error("PAGEERROR", e.message);
  });
  page.setDefaultTimeout(10000);
  await page.goto("http://127.0.0.1:" + server.address().port);
  const button = (name) =>
      page.getByRole("button", { name, exact: !(name instanceof RegExp) }),
    dialog = (name) => page.getByRole("dialog", { name, exact: true });
  await button("Ny sjekkliste").click();
  let modal = dialog("Ny sjekkliste");
  await modal.getByLabel("Navn på sjekklisten").fill("QA Egen kontroll");
  await modal.getByLabel("Hva skal kontrolleres?").fill("Kontroller montering");
  await modal.locator(".checklist-field-builder > summary").click();
  await button("Legg til underpunkt").click();
  await modal.getByLabel("Tekst for underpunkt 1").fill("Målt trykk");
  await modal.getByLabel("Svartype").selectOption("number");
  await modal.getByLabel("Minsteverdi (valgfritt)").fill("2");
  await modal.getByLabel("Svar påkrevd").check();
  await page.evaluate(() => {
    window.dispatchEvent(new Event("blur"));
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
  });
  eq(
    await modal.getByLabel("Navn på sjekklisten").inputValue(),
    "QA Egen kontroll",
    "Focus/dvale preserves working draft",
  );
  await page.evaluate(() =>
    window.dispatchEvent(new Event("expo-proffdok-work-profile")),
  );
  await modal.getByLabel("Navn på sjekklisten").waitFor();
  eq(
    await modal.getByLabel("Navn på sjekklisten").inputValue(),
    "QA Egen kontroll",
    "Repeated same-firm access event restores exact draft",
  );
  await button("Lukk ny sjekkliste").click();
  await button("Ny sjekkliste").click();
  modal = dialog("Ny sjekkliste");
  eq(
    await modal.getByLabel("Navn på sjekklisten").inputValue(),
    "QA Egen kontroll",
    "Close and reopen restores local draft",
  );
  await page.evaluate(() => (window.__deny = true));
  await button("Opprett sjekkliste").click();
  await page.getByRole("alert").waitFor();
  eq(
    await modal.getByLabel("Hva skal kontrolleres?").inputValue(),
    "Kontroller montering",
    "Rejected write retains work",
  );
  await page.evaluate(() => (window.__deny = false));
  await button("Opprett sjekkliste").click();
  await button(/QA Egen kontroll/).waitFor();
  await button(/QA Egen kontroll/).click();
  modal = dialog("QA Egen kontroll");
  await modal.getByLabel("Resultat").selectOption("Avvik");
  await modal.getByLabel("Kommentar").fill("Mangler justering");
  await modal.getByLabel("Målt trykk *", { exact: true }).fill("3");
  await modal.getByLabel("Fullfør kontrollen ved lagring").check();
  await button("Lagre kontroll").click();
  eq(
    await page.getByText(/1 åpne avvik/).count(),
    1,
    "Open deviation visible on completed checklist",
  );
  await button(/QA Egen kontroll/).click();
  eq(await button("Lagre kontroll").count(), 0, "Completed run is read-only");
  await button("Gjenåpne kontroll").click();
  eq(
    await dialog("Gjenåpne kontroll").evaluate(
      (n) => n.getBoundingClientRect().height < 700,
    ),
    true,
    "Short forms use their content height",
  );
  await page.getByLabel("Begrunnelse").fill("Rettet og skal kontrolleres");
  await button("Gjenåpne").click();
  await button(/QA Egen kontroll/).click();
  modal = dialog("QA Egen kontroll");
  await modal.getByLabel("Resultat").selectOption("Lukket avvik");
  await modal.getByLabel("Kommentar").fill("Justert og kontrollert");
  await modal.getByLabel("Fullfør kontrollen ved lagring").check();
  await button("Lagre kontroll").click();
  await button("Ny sjekkliste").click();
  await page.getByLabel("Hent mal").selectOption("published");
  await button("Opprett sjekkliste").click();
  eq(
    await page.getByText("Firmamal v3", { exact: false }).count(),
    1,
    "Import retains published edition",
  );
  await button(/Filer og bilder/).click();
  await button("Last opp fil").click();
  modal = dialog("Last opp dokument");
  await modal.locator("input[type=file]").setInputFiles({
    name: "protokoll.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 synthetic fixture"),
  });
  await page.getByText(/protokoll.pdf er lastet opp/).waitFor();
  await modal.getByLabel("Navn på dokumentet").fill("Ekstern original");
  await modal.getByLabel("Dokumenttype").selectOption("protocol");
  await button("Registrer fil").click();
  eq(
    await page.getByText(/protokoll.pdf/).count(),
    1,
    "Uploaded private document registered",
  );
  await button(/Ekstern protokoll/).click();
  await button("Legg til protokoll").click();
  modal = dialog("Legg til ekstern protokoll");
  await modal.getByLabel("Protokollnavn").fill("QA Ekstern kontroll");
  await modal
    .getByLabel("Originalprotokoll")
    .selectOption({ label: "Ekstern original · protokoll.pdf" });
  await button("Legg til merknad").click();
  await modal.getByLabel("Merknad fra kontrolløren").fill("Juster dør");
  await button("Registrer protokoll").click();
  eq(
    await button("Bekreft retting").isEnabled(),
    false,
    "Unrectified remarks cannot be confirmed",
  );
  await button("Følg opp merknader").click();
  modal = dialog("QA Ekstern kontroll");
  await modal
    .getByLabel("Utført retting / dokumentasjon")
    .fill("Justert dør og kontrollert");
  await modal.getByLabel("Rettingen er kontrollert").check();
  await button("Lagre merknader").click();
  await button("Bekreft retting").click();
  await page
    .getByLabel("Samlet bekreftelse")
    .fill("Kontrollert mot originalen. Merknaden er rettet.");
  await button("Lagre bekreftelse").click();
  eq(
    await page
      .locator(".bolig-quality-status")
      .filter({ hasText: "Retting bekreftet" })
      .count(),
    1,
  );
  await button("Send bekreftelse på e-post").click();
  await page.getByLabel("E-postmottaker").fill("selected@example.invalid");
  await button("Se over e-post").click();
  eq(
    await page
      .locator(".bolig-quality-notice")
      .last()
      .evaluate((n) => {
        const lum = (rgb) => {
          const c = rgb
            .match(/[0-9.]+/g)
            .slice(0, 3)
            .map((v) => Number(v) / 255)
            .map((v) =>
              v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
            );
          return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        };
        const bg = lum(getComputedStyle(n).backgroundColor),
          fg = lum(getComputedStyle(n.querySelector("p")).color);
        return (Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05) >= 4.5;
      }),
    true,
    "Recipient review has readable text contrast",
  );
  eq(
    await page.getByText("selected@example.invalid", { exact: true }).count(),
    1,
    "Recipient is reviewed before provider",
  );
  eq(
    await page.evaluate(
      () =>
        window.__calls.filter((x) => x.name === "bolig-protocol-email").length,
    ),
    0,
    "Preview never sends mail",
  );
  await button("Send bekreftelse").click();
  await page
    .getByText("E-posttjenesten har tatt imot bekreftelsen", { exact: true })
    .waitFor();
  eq(
    await page.evaluate(
      () =>
        window.__calls.find((x) => x.name === "bolig-protocol-email").args.body
          .scopeId,
    ),
    "unit",
  );
  await button("Tilbake til dokumentasjonen").click();
  await button(/^FDV/).click();
  await button("Rediger lenke").click();
  await page
    .getByLabel("FDV-lenke", { exact: true })
    .fill("https://example.org/fdv.pdf");
  await page.getByLabel("Begrunnelse").fill("Lenke fra produsenten");
  await button("Lagre FDV-lenke").click();
  eq(
    await page.getByRole("link", { name: /Åpne FDV/ }).getAttribute("href"),
    "https://example.org/fdv.pdf",
  );
  // One continuous confirmation/email flow: recipient selected before the
  // confirmation is saved; canonical mail preview still precedes provider call.
  await button(/Ekstern protokoll/).click();
  await button("Gjenåpne bekreftelse").click();
  await page.getByLabel("Begrunnelse").fill("Prøve samlet bekreft-og-send-flyt");
  await button("Gjenåpne").click();
  await button("Bekreft og send").click();
  await page.getByLabel("E-postmottaker").fill("chosen-combined@example.invalid");
  await page.getByLabel("Samlet bekreftelse").fill("Rettet og kontrollert mot originalen.");
  await button("Lagre bekreftelse").click();
  await page.getByText("chosen-combined@example.invalid",{exact:true}).waitFor();
  eq(await page.evaluate(()=>window.__calls.filter(c=>c.name==='bolig-protocol-email').length),1,"Combined flow reviews canonical mail before second provider call");
  eq(await page.evaluate(()=>window.__calls.filter(c=>c.name==='bolig_protocol_mail'&&c.args.p_action==='prepare').at(-1).args.p_payload.to),"chosen-combined@example.invalid","Selected recipient carried into preview");
  await button("Send bekreftelse").click();
  await button("Tilbake til dokumentasjonen").click();
  await button(/^Sjekklister/).click();
  await button("Fordel sjekklister").click();
  modal=dialog("Fordel sjekklister");
  await modal.getByRole("checkbox", {name:/Firmaets kontroll.*Sjekklistesentral/}).check();
  eq(await modal.locator(".bolig-distribution-options > label").first().evaluate(el=>({checkbox:getComputedStyle(el.querySelector('input')).width,title:getComputedStyle(el.querySelector('strong')).fontSize,detail:getComputedStyle(el.querySelector('small')).fontSize})),{checkbox:"22px",title:"16px",detail:"16px"},"Distribution checkboxes stay compact and labels readable under global app CSS");
  await modal.getByRole("button",{name:"Velg alle 2 i utvalget",exact:true}).click();
  await modal.getByLabel("Fordel til",{exact:true}).selectOption("rooms");
  await modal.getByRole("button",{name:"Velg alle 1 i utvalget",exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new Event("expo-proffdok-work-profile")));
  eq(await modal.getByLabel("Fordel til",{exact:true}).inputValue(),"rooms","Same-firm refresh retains distribution workspace");
  await button("Lukk fordel sjekklister").click();
  await button("Fordel sjekklister").click();
  modal=dialog("Fordel sjekklister");
  eq(await modal.getByRole("checkbox", {name:/Firmaets kontroll.*Sjekklistesentral/}).isChecked(),true,"Distribution selection survives close/reopen");
  await modal.getByLabel("Nye kontroller er påkrevde ved sluttgodkjenning").uncheck();
  await button("Forhåndsvis fordeling").click();
  await modal.getByText("3 nye kontroller",{exact:true}).waitFor();
  eq(await modal.locator(".bolig-distribution-section").evaluateAll(nodes=>nodes.every(n=>!n.open)),true,"Preview collapses finished selections to keep confirmation visible");
  eq(await page.evaluate(()=>window.__calls.filter(c=>c.name==='bolig_quality_distribution'&&c.args.p_action==='apply').length),0,"Distribution preview is read-only");
  await button("Bekreft og fordel").click();
  await modal.getByText("Sjekklistene er fordelt",{exact:true}).waitFor();
  eq(await page.evaluate(()=>window.__calls.find(c=>c.name==='bolig_quality_distribution'&&c.args.p_action==='apply').args.p_payload.required),false,"Optional requirement preserved through distribution");
  eq(await page.evaluate(()=>window.__calls.find(c=>c.name==='bolig_quality_distribution'&&c.args.p_action==='apply').args.p_payload.targets.length),3,"Units and rooms are explicit distinct targets");
  await button("Tilbake til dokumentasjonen").click();
  await button("Samlet PDF og ZIP").click();
  modal=dialog("Samlet sluttdokumentasjon");
  await modal.getByText("Ekstern FDV følger som lenker",{exact:true}).waitFor();
  eq(await modal.getByRole("button",{name:"Last ned ZIP med originalfiler",exact:true}).isEnabled(),true,"Export can be used with disclosed restpoints");
  eq(await modal.getByText("Klar med restpunkter",{exact:true}).count(),1,"Conditional readiness shown in export preview");
  await button("Lukk samlet sluttdokumentasjon").click();
  await page.setViewportSize({ width: 390, height: 844 });
  eq(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
    "No mobile overflow",
  );
  eq(
    await page
      .locator(".bolig-quality-tabs button")
      .evaluateAll((nodes) =>
        nodes.every((n) => n.getBoundingClientRect().height >= 48),
      ),
    true,
    "Readable touch controls",
  );
  await page.evaluate(() => window.__show("reader"));
  await page
    .getByRole("region", { name: "Sjekklister, FDV og protokoller" })
    .waitFor();
  eq(await button("Ny sjekkliste").count(), 0, "Reader has no mutations");
  await button(/QA Egen kontroll/).click();
  eq(
    await page.getByLabel("Resultat").isEnabled(),
    false,
    "Reader sees saved answers only",
  );
  await button("Lukk qa egen kontroll").click();
  await page.evaluate(() => {
    window.__foreign = true;
    window.__show("manager");
  });
  await page.getByText("Firma eller dokumenttilgang er endret.").waitFor();
  eq(
    await page.getByText("QA Egen kontroll", { exact: true }).count(),
    0,
    "Foreign response cannot leak documents",
  );
  eq(errors, [], "No runtime errors");
  console.log(
    "PASS native documentation Chromium: " +
      checks +
      " assertions; manual/import, focus/draft recovery, conflict, frozen completion, corrections, private file/protocol, reviewed mail, FDV, mobile and reader/foreign scope.",
  );
} catch (error) {
  console.error(error);
  if (browser) {
    const pages = browser.contexts().flatMap((c) => c.pages());
    if (pages[0]) {
      console.error(await pages[0].locator("body").innerText());
      console.error(
        await pages[0]
          .locator("dialog[open]")
          .evaluateAll((nodes) =>
            nodes.map((n) => ({
              class: n.className,
              height: getComputedStyle(n).height,
              min: getComputedStyle(n).minHeight,
              inline: n.getAttribute("style"),
              children: [...n.children].map((c) => ({
                tag: c.tagName,
                class: c.className,
                h: getComputedStyle(c).height,
                min: getComputedStyle(c).minHeight,
              })),
            })),
          ),
      );
      await pages[0].screenshot({ path: "/tmp/bolig-quality-failure.png" });
    }
  }
  throw error;
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
