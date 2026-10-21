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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-content-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Content from '${cwd}/src/modules/bolig/BoligRoomContent.jsx';import Catalog from '${cwd}/src/modules/bolig/BoligCatalog.jsx';import '${cwd}/src/modules/bolig/bolig.css';
window.__ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true};window.__room=null;
window.__data={root_id:'root',unit_id:'unit',revision:1,rooms:[{id:'bad1',name:'Bad 1',archived:false},{id:'bad2',name:'Bad 2',archived:false}],selection:{revision:1,snapshot:{goods:[{key:'servant',name:'Servant',sku:'S1',quantity:2,unit:'stk'},{key:'skin',name:'Skinne',sku:'R1',quantity:1.5,unit:'m'}]}},content:null};window.__calls=[];window.__lose=false;window.__hold=false;window.__waiters=[];window.__deny=false;
window.__client={rpc:async(name,args)=>{window.__calls.push({name,args});if(window.__deny)return {error:{code:'42501',message:'Tilgang fjernet'}};
 if(name==='bolig_catalog')return {data:{context:{...window.__ctx},root_id:'root',revision:0,packages:[],options:[],history:[],selection:null}};
 const s=window.__data;
 if(args.p_action==='save'){
 if(args.p_revision!==(s.content?.revision||0)||args.p_payload.choice_revision!==s.selection.revision||args.p_payload.rooms_revision!==s.revision)return {error:{code:'PT409',message:'Grunnlaget er endret. Hent siste varegrunnlag.'}};
 s.content={revision:(s.content?.revision||0)+1,source_choice_revision:s.selection.revision,allocations:args.p_payload.allocations.map(a=>({...a,room_name:s.rooms.find(r=>r.id===a.room_id).name}))};
 sessionStorage.setItem('qa-server',JSON.stringify(s));
 if(window.__lose){window.__lose=false;return {error:{message:'Svaret gikk tapt. Hent siste varegrunnlag.'}};}}
 const response={data:{context:{...window.__ctx},...JSON.parse(JSON.stringify(s))}};
 if(window.__hold && args.p_action==='get')return new Promise(resolve=>window.__waiters.push(()=>resolve(response)));
 return response;
}};
if(sessionStorage.getItem('qa-server'))window.__data=JSON.parse(sessionStorage.getItem('qa-server'));
const r=createRoot(document.getElementById('app'));window.__render=(mode='content')=>r.render(<section className="bolig-page" data-qa-role={window.__ctx.role}><h2>Eksempelprosjekt · Bolig H0101</h2>{mode==='none'?null:mode==='catalog'?<Catalog key={'cat'+window.__ctx.company_id} context={{...window.__ctx}} root={{id:'root',archived:false}}/>:<Content key={window.__ctx.company_id+window.__ctx.role} context={{...window.__ctx}} root={{id:'root',archived:false}} unit={{id:'unit',number:'H0101'}} activeRoom={window.__room} roomsRevision={window.__data.revision}/>}</section>);window.__initialSelection=window.__data.selection;if(!sessionStorage.getItem('qa-server'))window.__data.selection=null;window.__render();`,
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
  const btn = (name) => page.getByRole("button", { name, exact: true }),
    dlg = () =>
      page.getByRole("dialog", { name: "Fordel varer på rom", exact: true });
  await page
    .getByText("Velg og lagre grunnpakke og tilvalgspakker under", {
      exact: false,
    })
    .waitFor();
  eq(
    await page.getByRole("alert").count(),
    0,
    "Empty unit has no allocation error",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await page.getByRole("alert").count(),
    0,
    "Empty unit also survives refresh",
  );
  await page.evaluate(() => {
    window.__data.selection = window.__initialSelection;
    window.dispatchEvent(new Event("focus"));
  });
  await btn("Fordel varer på rom").click();
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(await dlg().isVisible(), true);
    eq(
      await dlg().evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
      true,
      "No dialog overflow " + width,
    );
  }
  await btn("Fordel vare 1 til rom").click();
  await dlg()
    .getByLabel("Antall for vare 1, andel 1", { exact: true })
    .fill("1");
  await btn("Fordel vare 1 til rom").click();
  eq(
    await dlg()
      .getByLabel("Rom for vare 1, andel 2", { exact: true })
      .inputValue(),
    "bad2",
  );
  await dlg()
    .getByLabel("Antall for vare 1, andel 2", { exact: true })
    .fill("2");
  eq(
    await btn("Forhåndsvis romfordeling").isEnabled(),
    false,
    "Over-allocation blocked",
  );
  await dlg()
    .getByLabel("Antall for vare 1, andel 2", { exact: true })
    .fill("1");
  await page.evaluate(
    () =>
      (window.__field = document.querySelector(
        ".bolig-allocation-fields input",
      )),
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await page.evaluate(
      () =>
        window.__field ===
        document.querySelector(".bolig-allocation-fields input"),
    ),
    true,
    "Same editor DOM across focus",
  );
  await page.keyboard.press("Escape");
  await btn("Fordel varer på rom").click();
  eq(
    await dlg()
      .getByLabel("Antall for vare 1, andel 1", { exact: true })
      .inputValue(),
    "1",
    "Escape retains draft",
  );
  await page.evaluate(() => window.__render("none"));
  await page.locator(".bolig-room-content").waitFor({ state: "detached" });
  await page.evaluate(() => window.__render());
  await btn("Fordel varer på rom").click();
  eq(
    await dlg()
      .getByLabel("Antall for vare 1, andel 2", { exact: true })
      .inputValue(),
    "1",
    "Remount restores draft",
  );
  await btn("Forhåndsvis romfordeling").click();
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.args.p_action === "save").length,
    ),
    0,
    "Preview never writes",
  );
  for (const name of ["Bad 1", "Bad 2", "Ikke fordelt"])
    eq(
      await dlg().getByRole("heading", { name, exact: true }).isVisible(),
      true,
    );
  await page.screenshot({
    path: path.join(temp, "allocation-preview-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(temp, "allocation-preview-mobile.png"),
    fullPage: true,
  });
  await btn("Lagre romfordeling").click();
  await dlg().waitFor({ state: "hidden" });
  eq(
    await page.evaluate(() =>
      window.__data.content.allocations.reduce((s, a) => s + a.quantity, 0),
    ),
    2,
    "Exact total",
  );
  await page.evaluate(() => {
    window.__room = window.__data.rooms[0];
    window.__render();
  });
  await page.getByRole("heading", { name: "Innhold i Bad 1" }).waitFor();
  eq(
    await page
      .locator(".bolig-room-content .bolig-allocation-summary")
      .getByText("Servant", { exact: true })
      .count(),
    1,
  );
  await btn("Legg innhold på rommet").click();
  await dlg()
    .getByLabel("Antall for vare 1, andel 1", { exact: true })
    .fill("0.5");
  await page.evaluate(() => {
    window.__data.revision++;
    window.__data.rooms[0].name = "Hovedbad";
    window.dispatchEvent(new Event("focus"));
  });
  await btn("Se over og bruk siste romgrunnlag").waitFor();
  eq(
    await btn("Forhåndsvis romfordeling").isEnabled(),
    false,
    "Revision conflict blocks writes",
  );
  await btn("Se over og bruk siste romgrunnlag").click();
  await btn("Forhåndsvis romfordeling").click();
  await page.evaluate(() => (window.__lose = true));
  await btn("Lagre romfordeling").click();
  await dlg()
    .getByRole("alert")
    .filter({ hasText: "Svaret gikk tapt" })
    .waitFor();
  await page.reload();
  await btn("Fordel varer på rom").click();
  await btn("Se over og bruk siste romgrunnlag").waitFor();
  eq(
    await page.evaluate(() => window.__data.content.revision),
    2,
    "Lost response committed once and reloaded draft stays fenced",
  );
  await page.evaluate(() => {
    window.__data.selection.revision = 2;
    window.__data.selection.snapshot.goods[0].quantity = 1;
    window.dispatchEvent(new Event("focus"));
  });
  await btn("Start ny fordeling med siste boligvalg").waitFor();
  eq(
    await btn("Forhåndsvis romfordeling").isEnabled(),
    false,
    "Old positions require explicit new-choice review",
  );
  await btn("Start ny fordeling med siste boligvalg").click();
  eq(
    await dlg().locator(".bolig-allocation-fields").count(),
    0,
    "New choice never silently inherits old allocations",
  );
  await btn("Fordel vare 1 til rom").click();
  await btn("Forhåndsvis romfordeling").click();
  const savesBefore = await page.evaluate(
    () => window.__calls.filter((c) => c.args.p_action === "save").length,
  );
  await page.evaluate(() => {
    window.__storage = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw Error("storage full");
    };
  });
  await btn("Lagre romfordeling").click();
  await dlg()
    .getByRole("alert")
    .filter({ hasText: "Lagring er stoppet" })
    .waitFor();
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.args.p_action === "save").length,
    ),
    savesBefore,
    "No server write when local safety fails",
  );
  await page.evaluate(() => {
    Storage.prototype.setItem = window.__storage;
    window.__hold = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    window.__hold = false;
    window.__waiters.splice(0).forEach((fn) => fn());
  });
  eq(await dlg().isVisible(), false, "Late read respects deliberate close");
  await page.evaluate(() => {
    window.__ctx.role = "reader";
    window.__render();
  });
  await page.locator('[data-qa-role="reader"]').waitFor();
  eq(await btn("Fordel varer på rom").count(), 0, "Reader cannot assign");
  await page.evaluate(() => {
    window.__ctx.enabled = false;
    window.__render();
  });
  await page
    .getByText("Rominnhold er ikke tilgjengelig i aktivt firma.", {
      exact: true,
    })
    .waitFor();
  eq(
    await page.locator(".bolig-room-content .bolig-product-card").count(),
    0,
    "Revoked module hides goods immediately",
  );
  await page.evaluate(() => {
    window.__ctx.enabled = true;
    window.__ctx.role = "manager";
    window.__ctx.company_id = "other";
    window.__deny = true;
    window.__render();
  });
  await page
    .getByRole("alert")
    .filter({ hasText: "Tilgang fjernet" })
    .waitFor();
  eq(
    await page.locator(".bolig-room-content .bolig-product-card").count(),
    0,
    "Firm switch clears goods",
  );
  await page.evaluate(() => {
    window.__ctx.company_id = "firm";
    window.__deny = false;
    window.__render("catalog");
  });
  await btn("Ny grunnpakke").click();
  await page
    .getByRole("dialog", { name: "Ny grunnpakke", exact: true })
    .waitFor();
  await page.getByLabel("Pakkenavn", { exact: true }).fill("Bad standard");
  await page.keyboard.press("Escape");
  eq(
    await page
      .getByRole("dialog", { name: "Ny grunnpakke", exact: true })
      .count(),
    0,
  );
  await btn("Ny grunnpakke").click();
  eq(
    await page.getByLabel("Pakkenavn", { exact: true }).inputValue(),
    "Bad standard",
    "Package draft restored",
  );
  await page.setViewportSize({ width: 320, height: 844 });
  eq(
    await page
      .getByRole("dialog", { name: "Ny grunnpakke", exact: true })
      .evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
    true,
    "Package mobile width",
  );
  await page.keyboard.press("Escape");
  await btn("Tilvalgspakker").click();
  await btn("Ny tilvalgspakke").click();
  eq(
    await page
      .getByRole("dialog", { name: "Ny tilvalgspakke", exact: true })
      .isVisible(),
    true,
  );
  eq(errors, [], "No runtime errors");
  console.log(
    "PASS room-content Chromium: " +
      checks +
      " assertions. Screenshots: " +
      temp,
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
