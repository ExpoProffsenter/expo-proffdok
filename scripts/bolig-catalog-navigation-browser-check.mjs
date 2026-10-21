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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-navigation-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Entry from '${cwd}/src/modules/bolig/BoligEntry.jsx';
const ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true,licensed:true};const root={id:'root',company_id:'firm',title:'Eksempelprosjekt',reference:'QA',revision:1,archived:false};
const line={key:'sink',name:'Servant',sku:'S1',quantity:1,unit:'stk',credit_cents:null};
window.__calls=[];window.__client={rpc:async(name,args)=>{window.__calls.push({name,args});if(name==='bolig_workspace'){if(args.p_action==='context')return {data:ctx};if(args.p_action==='list')return {data:{context:ctx,roots:[root]}};if(args.p_action==='get')return {data:{context:ctx,root,blocks:[],entrances:[],units:[]}};}
if(name==='bolig_catalog')return {data:{context:ctx,root_id:'root',revision:1,packages:[{id:'p1',name:'Bad standard',lines:[line],revision:1,archived:false}],options:[{id:'o1',name:'Ekstra speil',sku:'M1',quantity:1,unit:'stk',price_cents:10000,replace_key:'',deduct_base:false,revision:1,archived:false}],selection:null,history:[]}};
if(name==='bolig_overview')return {data:{context:ctx,root_id:'root',units:[]}};
return {error:{code:'42501',message:'Katalogoppslag er ikke aktivert i denne isolerte prøven.'}};}};
for(const [key,value] of [['root','root'],['screen','workspace']])sessionStorage.setItem('expo-proffdok.bolig-ui.v1:qa:firm:'+key,JSON.stringify(value));
createRoot(document.getElementById('app')).render(<Entry userId="qa" onExit={()=>{}} onOpenProject={()=>{}}/>);`,
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
  const nav = page.getByRole("navigation", {
      name: "Arbeidsområde",
      exact: true,
    }),
    btn = (name) => page.getByRole("button", { name, exact: true });
  await page
    .getByRole("region", { name: "Prosjektoversikt", exact: true })
    .waitFor();
  eq(
    await nav.count(),
    0,
    "Stored screen pointer never bypasses project home on a new visit",
  );
  await page
    .getByRole("button", { name: "Åpne Eksempelprosjekt", exact: true })
    .click();
  await nav
    .getByRole("button", { name: "Grunnpakker og tilvalg", exact: true })
    .waitFor();
  eq(
    await page
      .getByRole("button", { name: "Bytt prosjekt", exact: true })
      .count(),
    0,
  );
  eq(
    await nav
      .getByRole("button", { name: "Hovedside", exact: true })
      .isVisible(),
    true,
  );
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await nav.evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
      true,
      "Navigation has no horizontal overflow " + width,
    );
    eq(
      await nav.evaluate((n) => {
        const r = n.getBoundingClientRect();
        return r.left >= 0 && r.right <= innerWidth + 1;
      }),
      true,
      "Navigation stays in viewport " + width,
    );
  }
  await nav
    .getByRole("button", { name: "Grunnpakker og tilvalg", exact: true })
    .click();
  eq(await btn("Ny grunnpakke").isVisible(), true);
  eq(await btn("Legg til tilvalg").isVisible(), true);
  eq(
    await nav.locator('[aria-pressed="true"]').count(),
    1,
    "Only catalog is active",
  );
  eq(
    await btn("Rediger grunnpakke: Bad standard").isVisible(),
    true,
    "Edit does not hide under package contents",
  );
  await btn("Rediger grunnpakke: Bad standard").click();
  const dlg = () =>
    page.getByRole("dialog", { name: "Rediger grunnpakke", exact: true });
  eq(
    await dlg().getByLabel("Pakkenavn", { exact: true }).inputValue(),
    "Bad standard",
  );
  await page.keyboard.press("Escape");
  await btn("Ny grunnpakke").click();
  await page
    .getByRole("dialog", { name: "Ny grunnpakke", exact: true })
    .getByLabel("Pakkenavn", { exact: true })
    .fill("Bevart ny pakke");
  await page.keyboard.press("Escape");
  await nav.getByRole("button", { name: "Hovedside", exact: true }).click();
  await nav
    .getByRole("button", { name: "Grunnpakker og tilvalg", exact: true })
    .click();
  await btn("Ny grunnpakke").click();
  eq(
    await page.getByLabel("Pakkenavn", { exact: true }).inputValue(),
    "Bevart ny pakke",
    "Detour retains package authoring draft",
  );
  await page.keyboard.press("Escape");
  await btn("Tilvalgsliste").click();
  eq(await btn("Rediger tilvalg: Ekstra speil").isVisible(), true);
  await btn("Rediger tilvalg: Ekstra speil").click();
  eq(
    await page
      .getByRole("dialog", { name: "Rediger tilvalg", exact: true })
      .getByLabel("Navn på tilvalg", { exact: true })
      .inputValue(),
    "Ekstra speil",
  );
  await page.keyboard.press("Escape");
  await btn("Legg til tilvalg").click();
  eq(
    await page
      .getByRole("dialog", { name: "Nytt tilvalg", exact: true })
      .isVisible(),
    true,
  );
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(temp, "catalog-mobile.png"),
    fullPage: true,
  });
  eq(
    await page.evaluate(
      () =>
        window.__calls.filter(
          (c) =>
            c.name === "bolig_catalog" &&
            !["state", "unit"].includes(c.args.p_action),
        ).length,
    ),
    0,
    "Navigation never mutates catalog",
  );
  await page.reload();
  await page
    .getByRole("region", { name: "Prosjektoversikt", exact: true })
    .waitFor();
  eq(await nav.count(), 0, "Reload starts at project home");
  eq(
    await page.getByRole("dialog").count(),
    0,
    "No previous editor reopens above project home",
  );
  eq(errors, [], "No runtime errors");
  console.log(
    "PASS actual project catalog navigation Chromium: " +
      checks +
      " assertions. Screenshots: " +
      temp,
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
