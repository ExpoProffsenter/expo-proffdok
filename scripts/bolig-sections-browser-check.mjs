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
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Catalog from '${cwd}/src/modules/bolig/BoligCatalog.jsx';import '${cwd}/src/style.css';import '${cwd}/src/modules/ui/appUxReview.css';import '${cwd}/src/modules/bolig/bolig.css';
const company='40000000-0000-4000-8000-000000000001',rid='40000000-0000-4000-8000-000000000002';
const ctx={user_id:'qa',company_id:company,role:'manager',enabled:true};const root={id:rid,archived:false};
window.__calls=[];window.__uploads=[];window.__fail=false;window.__hold=false;const files={};
let state={context:ctx,root_id:rid,revision:1,packages:[],options:[],selection:null,history:[]};
window.__client={supabaseUrl:'https://qa.supabase.co',storage:{from:bucket=>({
upload:async(path,blob,opts)=>{window.__uploads.push({bucket,path,type:blob.type,size:blob.size,opts});if(window.__hold)await new Promise(r=>window.__release=r);if(window.__fail)return {error:{message:'denied'}};files[path]=URL.createObjectURL(blob);return {data:{path}};},
getPublicUrl:path=>({data:{publicUrl:'https://qa.supabase.co/storage/v1/object/public/'+bucket+'/'+path}}),
createSignedUrl:async(path,seconds)=>({data:{signedUrl:files[path]}})
})},rpc:async(name,args)=>{window.__calls.push({name,args});if(name!=='bolig_catalog')return {error:{message:'Lookup disabled in isolated test'}};
if(['package','option'].includes(args.p_action)){const field=args.p_action==='package'?'packages':'options',p=args.p_payload;const old=state[field].find(x=>x.id===p.id);if(old)Object.assign(old,p,{revision:old.revision+1});else state[field].push({...p,id:field+state[field].length,revision:1,archived:false});state.revision++;}return {data:structuredClone(state)};}};
createRoot(document.getElementById('app')).render(<div className="bolig-dialog"><Catalog context={ctx} root={root}/></div>);`,
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
    await page.screenshot({
      path: path.join(temp, "sections-" + width + ".png"),
      fullPage: true,
    });
  }
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
      .getByRole("checkbox")
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
