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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-sections-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Catalog from '${cwd}/src/modules/bolig/BoligCatalog.jsx';import Batch from '${cwd}/src/modules/bolig/BoligResidentBatch.jsx';import '${cwd}/src/style.css';import '${cwd}/src/modules/ui/appUxReview.css';import '${cwd}/src/modules/bolig/bolig.css';
const company='40000000-0000-4000-8000-000000000001',rid='40000000-0000-4000-8000-000000000002';
const ctx={user_id:'qa',company_id:company,role:'manager',enabled:true};const root={id:rid,archived:false};
window.__calls=[];window.__uploads=[];window.__fail=false;window.__hold=false;const files={};
let state={context:ctx,root_id:rid,revision:1,packages:[],options:[],selection:null,history:[],distribution:{},distribution_units:[
 {id:'a1',number:'24',block_id:'a',block_name:'Bygg A',group_id:'g1',group_name:'Stamme 1'},
 {id:'a2',number:'25',block_id:'a',block_name:'Bygg A',group_id:'g2',group_name:'Stamme 2'},
 {id:'b1',number:'26',block_id:'b',block_name:'Bygg B',group_id:'g2',group_name:'Stamme 2'}
]};
const batchUnits=state.distribution_units.map((unit)=>({...unit,choice_deadline:null,basis:unit.id,portal_revision:0,offer_count:unit.id==='a1'?2:1,contacts:[{name:'QA Beboer',email:unit.id+'@example.invalid'}]}));
window.__client={supabaseUrl:'https://qa.supabase.co',storage:{from:bucket=>({
upload:async(path,blob,opts)=>{window.__uploads.push({bucket,path,type:blob.type,size:blob.size,opts});if(window.__hold)await new Promise(r=>window.__release=r);if(window.__fail)return {error:{message:'denied'}};files[path]=URL.createObjectURL(blob);return {data:{path}};},
getPublicUrl:path=>({data:{publicUrl:'https://qa.supabase.co/storage/v1/object/public/'+bucket+'/'+path}}),
createSignedUrl:async(path,seconds)=>({data:{signedUrl:files[path]}})
})},rpc:async(name,args)=>{window.__calls.push({name,args});if(name==='bolig_resident_batch'){
 const portals=(args.p_payload.units||[]).map((unit)=>({unit_id:unit.id,target_id:unit.id,revision:1}));
 return {data:{context:ctx,root_id:rid,project_revision:1,deadline_time:'12:00',mail_enabled:false,units:batchUnits,portals}};
}if(name!=='bolig_catalog')return {error:{message:'Lookup disabled in isolated test'}};
if(['package','option'].includes(args.p_action)){const field=args.p_action==='package'?'packages':'options',p=args.p_payload;const old=state[field].find(x=>x.id===p.id);if(old)Object.assign(old,p,{revision:old.revision+1});else state[field].push({...p,id:field+state[field].length,revision:1,archived:false});state.revision++;}return {data:structuredClone(state)};}};
createRoot(document.getElementById('app')).render(<div className="bolig-dialog"><Batch context={ctx} record={{root,units:batchUnits}}/><Catalog context={ctx} root={root}/></div>);`,
);
let server,
  browser,
  checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
try {
  const result = await build({
    root: cwd,
    configFile: false,
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
    plugins: [
      react({ jsxRuntime: "classic" }),
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
  const output = (Array.isArray(result) ? result[0] : result).output,
    script = output.find((x) => x.type === "chunk").code,
    css = output
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
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:Arial}button,input,select{font:inherit}</style><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script></html>',
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
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);
  const btn = (name) => page.getByRole("button", { name, exact: true });
  const dlg = (name) => page.getByRole("dialog", { name, exact: true });
  await btn("Ny grunnpakke").click();
  let form = dlg("Ny grunnpakke");
  await form
    .getByLabel("Pakkenavn", { exact: true })
    .fill("Standardbad med avsnitt");
  await form.getByLabel("Varebeskrivelse 1", { exact: true }).fill("Servant");
  await form.getByLabel("Varenummer 1", { exact: true }).fill("S1");
  await btn("Legg til avsnitt").click();
  await form.getByLabel("Avsnittsnavn 1", { exact: true }).fill("Fliser");
  await form
    .getByLabel("Kort tekst til kunden 1 (valgfritt)", { exact: true })
    .fill("Gulv og vegg");
  await btn("Legg til vare i Fliser").click();
  await form.getByLabel("Varebeskrivelse 2", { exact: true }).fill("Gulvflis");
  await form.getByLabel("Varenummer 2", { exact: true }).fill("F1");
  await form.getByLabel("Antall 2", { exact: true }).fill("12.5");
  await btn("Legg til avsnitt").click();
  await form
    .getByLabel("Avsnittsnavn 2", { exact: true })
    .fill("Baderomsinnredning");
  await form
    .getByLabel("Avsnitt for vare 1", { exact: true })
    .selectOption({ label: "Baderomsinnredning" });
  await btn("Legg til avsnitt").click();
  await form.getByLabel("Avsnittsnavn 3", { exact: true }).fill("Dusjvegger");
  await btn("Legg til vare i Dusjvegger").click();
  await form.getByLabel("Varebeskrivelse 3", { exact: true }).fill("Dusjvegg");
  await form.getByLabel("Varenummer 3", { exact: true }).fill("D1");
  await btn("Flytt avsnitt 2 opp").click();
  eq(
    await form.getByLabel("Avsnittsnavn 1", { exact: true }).inputValue(),
    "Baderomsinnredning",
  );
  await btn("Fjern avsnitt 3, behold varene").click();
  eq(
    await form.getByLabel("Varenummer 3", { exact: true }).inputValue(),
    "D1",
    "Removing a section preserves its products",
  );
  eq(
    await form.getByLabel("Avsnitt for vare 3", { exact: true }).inputValue(),
    "",
  );
  await page.evaluate(() => {
    window.__focused = document.activeElement;
    window.dispatchEvent(new Event("focus"));
  });
  eq(
    await form.getByLabel("Varenummer 2", { exact: true }).inputValue(),
    "F1",
    "Refresh preserves content draft",
  );
  await btn("Lukk pakkeredigering").click();
  await btn("Ny grunnpakke").click();
  eq(
    await form.getByLabel("Avsnittsnavn 1", { exact: true }).inputValue(),
    "Baderomsinnredning",
    "Closing retains section order",
  );
  eq(await form.getByLabel("Varenummer 3", { exact: true }).inputValue(), "D1");
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 1000 });
    eq(
      await form.evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      true,
      "Editor fits viewport " + width,
    );
    const disclosureStyles = await form
      .locator(".bolig-edit-section > summary, .bolig-edit-line > summary")
      .evaluateAll((nodes) =>
        nodes.map((n) => ({
          font: getComputedStyle(n).fontSize,
          min: getComputedStyle(n).minHeight,
          padding: getComputedStyle(n).padding,
          background: getComputedStyle(n).backgroundColor,
        })),
      );
    eq(
      disclosureStyles.every((s) => s.font === "16px" && s.min === "48px"),
      true,
      "Readable section and item controls " + width,
    );
    eq(
      new Set(disclosureStyles.map((s) => s.padding + "|" + s.background)).size,
      1,
      "Consistent section and item control surfaces " + width,
    );
    await page.screenshot({
      path: path.join(temp, "sections-" + width + ".png"),
      fullPage: true,
    });
  }
  const audience = () => page.getByRole("region", { name: "Gjelder for" });
  const videoDir = process.env.BOLIG_AUDIENCE_VIDEO_DIR;
  const capture = async (name, content, control) => {
    if (!videoDir) return;
    await content.scrollIntoViewIfNeeded();
    const target = await control.elementHandle();
    await target.evaluate((node) => node.classList.add("qa-film-pointer"));
    await content.screenshot({ path: path.join(videoDir, name + ".png") });
    await target.evaluate((node) => node.classList.remove("qa-film-pointer"));
    await target.dispose();
  };
  if (videoDir) {
    fs.mkdirSync(videoDir, { recursive: true });
    await page.addStyleTag({content: `
      .qa-film-pointer { position: relative; }
      .qa-film-pointer::after {
        position: absolute; left: 72%; top: 58%; z-index: 3;
        content: "➤"; transform: rotate(222deg); color: #10212b;
        font-size: 34px; line-height: 1; -webkit-text-stroke: 1px white;
        filter: drop-shadow(0 1px 1px #fff); pointer-events: none;
      }
      label.qa-film-pointer::after { left: 28px; top: 52%; }
      summary.qa-film-pointer::after { left: 20%; }
      `
    });
  }
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(await audience().evaluate((node) => node.scrollWidth <= node.clientWidth + 1), true, "Audience fits width " + width);
    const size = await btn("Velg alle bygg").evaluate((node) => ({ height: node.offsetHeight, css: getComputedStyle(node).minHeight }));
    eq(size.height >= 44, true, "All-building touch target at " + width + ": " + JSON.stringify(size));
    if (videoDir && width === 390) await audience().screenshot({ path: path.join(videoDir, "mobile.png") });
  }
  await capture("01", audience(), btn("Velg alle bygg"));
  await audience().getByLabel("Bygg eller blokk").selectOption("a");
  await btn("Velg alle bygg").click();
  eq(await audience().getByRole("status").textContent(), "3 av 3 boliger valgt", "All buildings overrides a filter");
  await audience().getByLabel("Bygg eller blokk").selectOption("");
  await capture("02", audience(), audience().locator(".bolig-package-audience-units label").filter({ hasText: "Bolig 25" }));
  await btn("Tøm utvalget").click();
  eq(await audience().getByRole("status").textContent(), "0 av 3 boliger valgt");
  await audience().getByLabel("Bygg eller blokk").selectOption("a");
  await btn("Velg alle viste boliger").click();
  eq(await audience().getByRole("status").textContent(), "2 av 3 boliger valgt");
  await audience().getByLabel("Bolig 25", { exact: false }).uncheck();
  await audience().getByLabel("Bygg eller blokk").selectOption("");
  await audience().getByLabel("Stamme", { exact: true }).selectOption("g2");
  await btn("Velg alle viste boliger").click();
  await audience().getByLabel("Bolig 25", { exact: false }).uncheck();
  await audience().getByText("Se alle valgte boliger").click();
  eq(await audience().getByRole("listitem").allTextContents(), [
    "Bygg A · Bolig 24 · Stamme 1", "Bygg B · Bolig 26 · Stamme 2",
  ], "The entire audience is visible despite the current filter");
  await capture("03", audience(), audience().getByText("Se alle valgte boliger"));
  await btn("Lagre grunnpakke").click();
  await form.waitFor({ state: "detached" });
  let saved = await page.evaluate(
    () =>
      window.__calls.filter((c) => c.args?.p_action === "package").at(-1).args
        .p_payload,
  );
  eq(
    saved.sections.map((s) => s.name),
    ["Baderomsinnredning", "Fliser"],
  );
  eq(
    saved.lines.map((l) => l.name),
    ["Servant", "Gulvflis", "Dusjvegg"],
    "Saving follows section order then unsectioned goods",
  );
  eq(saved.lines[1].quantity, 12.5);
  eq(saved.lines[0].credit_cents, null, "Sections add no required base price");
  await page.locator(".bolig-package-card-content > summary").click();
  eq(
    await page
      .getByRole("heading", { name: "Fliser", exact: true })
      .isVisible(),
    true,
    "Grouped contents shown in saved package",
  );
  await btn("Ny tilvalgspakke").click();
  form = dlg("Ny tilvalgspakke");
  await form
    .getByLabel("Navn på tilvalgspakke", { exact: true })
    .fill("Komplett dusjløsning");
  await form.getByLabel("Varebeskrivelse 1", { exact: true }).fill("Dusjdør");
  await form.getByLabel("Varenummer 1", { exact: true }).fill("DOOR");
  await btn("Legg til avsnitt").click();
  await form.getByLabel("Avsnittsnavn 1", { exact: true }).fill("Dusjvegger");
  await form
    .getByLabel("Avsnitt for vare 1", { exact: true })
    .selectOption({ label: "Dusjvegger" });
  await btn("Legg til vare i Dusjvegger").click();
  await form.getByLabel("Varebeskrivelse 2", { exact: true }).fill("Veggstag");
  await form.getByLabel("Varenummer 2", { exact: true }).fill("STAG");
  await form
    .getByLabel("Tilvalgspakketype", { exact: true })
    .selectOption("alternative");
  await form
    .getByLabel("Trekk fra grunnsummen for standardvaren", { exact: true })
    .check();
  await form
    .getByLabel("Pris for hele tilvalgspakken inkl. mva.", { exact: true })
    .fill("2300,50");
  eq(
    await form
      .getByRole("checkbox", { name: "Trekk fra grunnsummen for standardvaren" })
      .evaluate((e) => e.getBoundingClientRect().width <= 24),
    true,
    "Checkbox stays compact with global app CSS",
  );
  await page.keyboard.press("Escape");
  await btn("Ny tilvalgspakke").click();
  eq(
    await form.getByLabel("Varenummer 2", { exact: true }).inputValue(),
    "STAG",
    "Unsent option package has both products after reopening",
  );
  eq(
    await form
      .getByLabel("Pris for hele tilvalgspakken inkl. mva.", { exact: true })
      .inputValue(),
    "2300,50",
  );
  await audience().getByLabel("Stamme", { exact: true }).selectOption("g2");
  await btn("Velg alle bygg").click();
  eq(await audience().getByRole("status").textContent(), "3 av 3 boliger valgt", "The same whole-project action is available for add-ons");
  await btn("Tøm utvalget").click();
  await btn("Velg alle viste boliger").click();
  await audience().getByLabel("Bolig 26", { exact: false }).uncheck();
  await page.keyboard.press("Escape");
  await btn("Ny tilvalgspakke").click();
  eq(await audience().getByRole("status").textContent(), "1 av 3 boliger valgt", "Closing preserves the selected units in the draft");
  await btn("Lagre tilvalgspakke").click();
  await form.waitFor({ state: "detached" });
  saved = await page.evaluate(
    () =>
      window.__calls.filter((c) => c.args?.p_action === "option").at(-1).args
        .p_payload,
  );
  eq(
    saved.lines.map((l) => l.sku),
    ["DOOR", "STAG"],
  );
  eq(saved.sections[0].name, "Dusjvegger");
  eq(saved.price_cents, 230050);
  eq(saved.deduct_base, true);
  eq(saved.unit, "pakke");
  await btn("Rediger tilvalgspakke: Komplett dusjløsning").click();
  form = dlg("Rediger tilvalgspakke");
  eq(
    await form.locator(".bolig-edit-line[open]").count(),
    0,
    "Saved goods reopen compact",
  );
  eq(
    await form.getByLabel("Avsnittsnavn 1", { exact: true }).inputValue(),
    "Dusjvegger",
  );
  eq(
    await form.getByLabel("Varenummer 2", { exact: true }).inputValue(),
    "STAG",
  );
  await page.keyboard.press("Escape");
  eq(await page.evaluate(() => window.__calls.find((call) => call.args?.p_action === "package").args.p_payload.unit_ids),
    ["a1", "b1"], "Package save sends the complete audience");
  eq(await page.evaluate(() => window.__calls.find((call) => call.args?.p_action === "option").args.p_payload.unit_ids),
    ["a2"], "Option save sends the remaining individual unit");
  await btn("Beboerlenker og frister samlet").click();
  const batch = dlg("Beboerlenker og frister samlet");
  await batch.getByRole("combobox").nth(1).selectOption("a");
  const batchAll = batch.getByRole("button", { name: "Velg alle bygg" });
  await capture("04", batch.locator(".bolig-preparation-body"), batchAll);
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(await batch.evaluate((node) => node.scrollWidth <= node.clientWidth + 1), true, "Batch dialog fits " + width);
    eq(await batchAll.evaluate((node) => node.offsetHeight >= 44), true, "Batch all-building action is touch friendly");
  }
  await batchAll.click();
  eq(await batch.getByText("3 av 3 boliger valgt", { exact: false }).count(), 1, "The batch includes homes outside the active filter");
  await batch.getByLabel("Bolig 25", { exact: false }).uncheck();
  eq(await batch.getByText("2 av 3 boliger valgt", { exact: false }).count(), 1, "A single home can be excluded before link preparation");
  await batch.getByRole("checkbox", { name: "Jeg har kontrollert boligene og innholdet ovenfor" }).check();
  await batch.getByRole("button", { name: "Klargjør valgte beboerlenker" }).click();
  await batch.getByRole("heading", { name: "Mottakere og sendestatus" }).waitFor();
  eq(await batch.getByRole("button", { name: /Bekreft utsending/ }).isDisabled(), true, "Sandbox sending remains off");
  eq(await page.evaluate(() => window.__calls.find((call) => call.name === "bolig_resident_batch" && call.args.p_action === "publish").args.p_payload.units.map((unit) => unit.id)),
    ["a1", "b1"], "Link preparation keeps the reviewed audience");
  eq(errors, [], "No runtime errors");
  console.log(
    "PASS package sections Chromium: " +
      checks +
      " assertions. Screenshots: " +
      temp,
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
