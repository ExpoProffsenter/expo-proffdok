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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-package-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Rooms from '${cwd}/src/modules/bolig/BoligRooms.jsx';import Catalog from '${cwd}/src/modules/bolig/BoligCatalog.jsx';import '${cwd}/src/modules/bolig/bolig.css';
window.__ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true};window.__calls=[];window.__lose=false;window.__hold=false;window.__waiters=[];window.__deny=false;
const line=(key,name)=>({key,name,sku:key.toUpperCase(),quantity:1,unit:'stk',credit_cents:key==='basin'?10000:null});
const common={id:'common-pkg',name:'Fellespakke',lines:[line('heater','Bereder'),line('valve','Felles ventil')],revision:1,archived:false};const bath={id:'bath-pkg',name:'Bad standard',lines:[line('basin','Servant'),line('tap','Batteri')],revision:1,archived:false};
const alt={id:'alt',name:'Alternativ servant',sku:'ALT',quantity:1,unit:'stk',price_cents:18000,replace_key:'basin',deduct_base:true,revision:1,archived:false};const mirror={id:'mirror',name:'Ekstra speil',sku:'MIRROR',quantity:1,unit:'stk',price_cents:30000,replace_key:'',deduct_base:false,revision:1,archived:false};
const initial={revision:1,rooms_revision:1,rooms:[{id:'bad1',name:'Bad 1',type:'bathroom',floor:'',archived:false},{id:'bad2',name:'Bad 2',type:'bathroom',floor:'',archived:false}],packages:[common,bath],options:[alt,mirror],selection:{revision:1,snapshot:{package:common,options:[],goods:common.lines,total_cents:0,catalog_revision:1}},draft:{revision:1,source_choice_revision:1,snapshot:{selected_positions:[1],goods:[common.lines[1]],excluded_count:1}},versions:{1:{goods:common.lines}}};
window.__data=JSON.parse(sessionStorage.getItem('qa-scoped-server')||JSON.stringify(initial));
const parts=()=>window.__data.selection.snapshot.components || [{...window.__data.selection.snapshot,scope_id:'common',room_id:null,room_name:'Felles for boligen',allocations:[]}];
const propose=p=>{const s=window.__data,pkg=s.packages.find(x=>x.id===p.package_id),chosen=s.options.filter(o=>p.option_ids.includes(o.id));const old=parts().filter(x=>x.scope_id!==p.scope_id);
 const options=chosen.map(o=>({...o,net_cents:o.price_cents-(o.deduct_base?pkg.lines.find(l=>l.key===o.replace_key).credit_cents:0)}));
 const goods=pkg?.lines.filter(l=>!chosen.some(o=>o.replace_key===l.key)).concat(chosen.map(o=>({...o,key:o.id})))||[];
 if(!p.remove)old.push({scope_id:p.scope_id,room_id:p.scope_id==='common'?null:p.scope_id,room_name:p.scope_id==='common'?'Felles for boligen':s.rooms.find(r=>r.id===p.scope_id).name,package:pkg,options,goods,total_cents:options.reduce((n,o)=>n+o.net_cents,0),catalog_revision:s.revision});
 old.sort((a,b)=>a.scope_id==='common'?-1:b.scope_id==='common'?1:a.scope_id.localeCompare(b.scope_id));
 return {format:'scoped-v1',components:old,package:{name:'Felles- og rompakker',lines:[]},options:old.flatMap(x=>x.options.map(o=>({...o,id:x.scope_id+'/'+o.id}))),goods:old.flatMap(x=>x.goods.map(g=>({...g,key:x.scope_id+'/'+g.key,source_key:g.key,scope_id:x.scope_id,room_id:x.room_id,room_name:x.room_name}))),total_cents:old.reduce((n,x)=>n+x.total_cents,0),catalog_revision:s.revision};};
window.__client={rpc:async(name,args)=>{const s=window.__data,p=args.p_payload;window.__calls.push({name,args});if(window.__deny)return {error:{code:'42501',message:'Tilgang fjernet'}};
 const reply=()=>({data:{context:{...window.__ctx},root_id:'root',unit_id:'unit',...JSON.parse(JSON.stringify(s)),components:parts(),root_archived:false}});
 if(name==='bolig_rooms')return {data:{...reply().data,revision:s.rooms_revision}};
 if(name==='bolig_room_content')return {data:{...reply().data,revision:s.rooms_revision,content:null}};
 if(name==='bolig_catalog')return {data:{...reply().data,history:[]}};
 if(name==='bolig_order_draft'){
  const source=s.versions[s.draft.source_choice_revision];
  const suggested=s.selection.snapshot.goods.flatMap((g,i)=>source.goods.some((o,k)=>!s.draft.snapshot.selected_positions.includes(k)&&(o.key===g.key || (!o.scope_id && g.scope_id==='common' && o.key===g.source_key))&&o.sku===g.sku&&o.name===g.name&&o.quantity===g.quantity)?[]:[i]);
  if(args.p_action==='save'){s.draft={revision:s.draft.revision+1,source_choice_revision:s.selection.revision,snapshot:{selected_positions:p.selected_positions,goods:s.selection.snapshot.goods.filter((_,i)=>p.selected_positions.includes(i)),excluded_count:s.selection.snapshot.goods.length-p.selected_positions.length}};sessionStorage.setItem('qa-scoped-server',JSON.stringify(s));}
  return {data:{...reply().data,suggested_positions:suggested}};
 }
 if(name!=='bolig_package_choices')throw Error('Unexpected RPC '+name);
 if(args.p_action!=='get'){
  if(args.p_revision!==s.selection.revision || p.catalog_revision!==s.revision || p.rooms_revision!==s.rooms_revision)return {error:{code:'PT409',message:'Pakker, rom eller boligvalg er endret.'}};
  const proposal=propose(p);if(args.p_action==='preview')return {data:{...reply().data,proposal}};
  s.selection={revision:s.selection.revision+1,snapshot:proposal};s.versions[s.selection.revision]=proposal;sessionStorage.setItem('qa-scoped-server',JSON.stringify(s));
  if(window.__lose){window.__lose=false;return {error:{message:'Lagringssvaret gikk tapt.'}};}
 }
 const result=reply();if(window.__hold && args.p_action==='get')return new Promise(resolve=>window.__waiters.push(()=>resolve(result)));return result;
}};
const root=createRoot(document.getElementById('app'));window.__render=(mode='unit')=>root.render(<section className="bolig-page" data-qa-role={window.__ctx.role}><h2>Eksempelhuset · Bolig</h2>{mode==='none'?null:<React.Fragment key={window.__ctx.company_id+window.__ctx.role}><Rooms context={{...window.__ctx}} root={{id:'root',archived:false}} unit={{id:'unit',number:'Bolig'}}/><Catalog compact context={{...window.__ctx}} root={{id:'root',archived:false}} unit={{id:'unit',number:'Bolig'}}/></React.Fragment>}</section>);window.__render();`,
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
      page.getByRole("dialog", { name: "Velg pakke og tilvalg", exact: true }),
    roomSelect = () => page.locator(".bolig-room-select select");
  await roomSelect().selectOption("bad1");
  await btn("Velg rompakke").click();
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await dlg().evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
      true,
      "No dialog overflow " + width,
    );
  }
  await dlg()
    .getByLabel("Grunnpakke", { exact: true })
    .selectOption("bath-pkg");
  const option = (name) =>
    dlg()
      .locator(".bolig-option-choice")
      .filter({ hasText: name })
      .locator("input");
  await option("Alternativ servant").check();
  await page.evaluate(
    () =>
      (window.__select = document.querySelector(
        ".bolig-package-choice-dialog select",
      )),
  );
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  eq(
    await option("Alternativ servant").isChecked(),
    true,
    "Same-company focus retains choice",
  );
  eq(
    await page.evaluate(
      () =>
        window.__select ===
        document.querySelector(".bolig-package-choice-dialog select"),
    ),
    true,
    "Exact editor DOM retained",
  );
  await page.keyboard.press("Escape");
  await btn("Velg rompakke").click();
  eq(
    await option("Alternativ servant").isChecked(),
    true,
    "Close/reopen retains option",
  );
  await page.evaluate(() => window.__render("none"));
  await page.locator(".bolig-rooms").waitFor({ state: "detached" });
  await page.evaluate(() => window.__render());
  await btn("Velg rompakke").click();
  eq(
    await option("Alternativ servant").isChecked(),
    true,
    "Remount restores draft after server hydration",
  );
  await btn("Forhåndsvis pakkevalg").click();
  eq(
    await page.evaluate(() => window.__data.selection.revision),
    1,
    "Preview never writes",
  );
  eq(
    await dlg()
      .locator(".bolig-choice-total")
      .filter({ hasText: "Samlet tilvalg" })
      .innerText(),
    "Samlet tilvalg: 80,00 kr inkl. mva. · 4 varelinjer",
  );
  eq(
    await dlg()
      .getByRole("heading", { name: "Fellespakke", exact: true })
      .count(),
    1,
    "Legacy common package remains in preview",
  );
  await page.screenshot({
    path: path.join(temp, "room-package-preview-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(temp, "room-package-preview-mobile.png"),
    fullPage: true,
  });
  await btn("Lagre pakkevalg").click();
  await dlg().waitFor({ state: "hidden" });
  await page.locator(".bolig-room-content").waitFor({ state: "detached" });
  eq(
    await page.evaluate(
      () => window.__data.selection.snapshot.components.length,
    ),
    2,
  );
  eq(
    await page.evaluate(() => window.__data.draft.revision),
    1,
    "Order draft stays unchanged",
  );
  await roomSelect().selectOption("bad2");
  await btn("Velg rompakke").click();
  await dlg()
    .getByLabel("Grunnpakke", { exact: true })
    .selectOption("bath-pkg");
  await option("Ekstra speil").check();
  await btn("Forhåndsvis pakkevalg").click();
  eq(
    await dlg()
      .locator(".bolig-choice-total")
      .filter({ hasText: "Samlet tilvalg" })
      .innerText(),
    "Samlet tilvalg: 380,00 kr inkl. mva. · 7 varelinjer",
  );
  await btn("Lagre pakkevalg").click();
  await dlg().waitFor({ state: "hidden" });
  eq(
    await page.evaluate(() =>
      window.__data.selection.snapshot.goods
        .filter((g) => g.sku === "BASIN")
        .map((g) => g.room_id),
    ),
    ["bad2"],
    "Only one room replaced standard",
  );
  await btn("Bestilling").click();
  const order = page.getByRole("region", { name: "Bestillingsutkast" });
  await order
    .getByRole("button", {
      name: "Se over og bruk siste grunnlag",
      exact: true,
    })
    .click();
  eq(
    await order.locator("input[type=checkbox]").first().isChecked(),
    false,
    "Previously excluded heater stays excluded",
  );
  eq(
    await order.locator("input[type=checkbox]:checked").count(),
    6,
    "New room goods are selected",
  );
  eq(
    await order.getByText("Bad 2", { exact: true }).count(),
    3,
    "Order lines show room",
  );
  await order
    .getByRole("button", { name: "Lagre bestillingsutkast", exact: true })
    .click();
  eq(await page.evaluate(() => window.__data.draft.snapshot.goods.length), 6);
  await order
    .locator(".bolig-order-line")
    .filter({ hasText: "Bad 1" })
    .filter({ hasText: "Batteri" })
    .locator("input")
    .uncheck();
  await btn("Endre rompakke").click();
  await option("Ekstra speil").uncheck();
  await page.evaluate(() => {
    window.__data.rooms_revision++;
    window.__data.rooms[1].name = "Gjesterom bad";
    window.dispatchEvent(new Event("focus"));
  });
  await btn("Se over og bruk siste pakkegrunnlag").waitFor();
  eq(
    await btn("Forhåndsvis pakkevalg").isEnabled(),
    false,
    "Dirty draft cannot automatically rebase",
  );
  await btn("Se over og bruk siste pakkegrunnlag").click();
  eq(
    await option("Ekstra speil").isChecked(),
    false,
    "Explicit review keeps intended option change",
  );
  const previews = await page.evaluate(
    () =>
      window.__calls.filter(
        (c) =>
          c.name === "bolig_package_choices" && c.args.p_action === "preview",
      ).length,
  );
  await page.evaluate(() => {
    window.__storage = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw Error("storage full");
    };
  });
  await btn("Forhåndsvis pakkevalg").click();
  eq(
    await page.evaluate(
      () =>
        window.__calls.filter(
          (c) =>
            c.name === "bolig_package_choices" && c.args.p_action === "preview",
        ).length,
    ),
    previews,
    "Local safety failure prevents request",
  );
  await page.evaluate(() => (Storage.prototype.setItem = window.__storage));
  await btn("Forhåndsvis pakkevalg").click();
  await page.evaluate(() => (window.__lose = true));
  await btn("Lagre pakkevalg").click();
  await dlg()
    .getByRole("alert")
    .filter({ hasText: "Lagringssvaret gikk tapt" })
    .waitFor();
  await page.reload();
  await btn("Endre rompakke").click();
  await btn("Se over og bruk siste pakkegrunnlag").waitFor();
  eq(
    await page.evaluate(() => window.__data.selection.revision),
    4,
    "Lost response saved exactly once",
  );
  await page.keyboard.press("Escape");
  await btn("Bestilling").click();
  await order
    .getByRole("button", {
      name: "Se over og bruk siste grunnlag",
      exact: true,
    })
    .click();
  eq(
    await order
      .locator(".bolig-order-line")
      .filter({ hasText: "Bad 1" })
      .filter({ hasText: "Batteri" })
      .locator("input")
      .isChecked(),
    false,
    "Unsent room exclusion survives choice rebase",
  );
  eq(
    await order
      .locator(".bolig-order-line")
      .filter({ hasText: "Gjesterom bad" })
      .filter({ hasText: "Batteri" })
      .locator("input")
      .isChecked(),
    true,
    "Same SKU in other room is independent",
  );
  await page.evaluate(() => {
    window.__data.rooms[0].archived = true;
    window.__data.rooms_revision++;
    window.dispatchEvent(new Event("focus"));
  });
  await roomSelect().selectOption("all");
  await btn("Fjern pakke fra arkivert rom: Bad 1").click();
  await btn("Forhåndsvis pakkevalg").click();
  eq(
    await page.evaluate(
      () => window.__data.selection.snapshot.components.length,
    ),
    3,
    "Removal preview has no side effect",
  );
  await page.keyboard.press("Escape");
  eq(
    await page
      .locator(".bolig-package-choices > .bolig-package-choice-cards > article")
      .count(),
    3,
    "Canceled preview never appears as saved content",
  );
  await btn("Fjern pakke fra arkivert rom: Bad 1").click();
  await btn("Forhåndsvis pakkevalg").click();
  await btn("Lagre pakkevalg").click();
  await dlg().waitFor({ state: "hidden" });
  eq(
    await page.evaluate(() =>
      window.__data.selection.snapshot.components.some(
        (p) => p.room_id === "bad1",
      ),
    ),
    false,
    "Archived package removed explicitly",
  );
  eq(
    await page.evaluate(() => window.__data.draft.revision),
    2,
    "Removal leaves old order unchanged",
  );
  await order
    .getByRole("button", {
      name: "Se over og bruk siste grunnlag",
      exact: true,
    })
    .click();
  eq(
    await order
      .locator(".bolig-order-line")
      .filter({ hasText: "Gjesterom bad" })
      .filter({ hasText: "Batteri" })
      .locator("input")
      .isChecked(),
    true,
    "Position shift never applies exclusion to another room",
  );
  await btn("Endre fellespakke").click();
  await page.evaluate(() => {
    window.__hold = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    window.__hold = false;
    window.__waiters.splice(0).forEach((fn) => fn());
  });
  eq(await dlg().isVisible(), false, "Late read cannot reopen closed dialog");
  await page.evaluate(() => {
    window.__ctx.role = "reader";
    window.__render();
  });
  await page.locator('[data-qa-role="reader"]').waitFor();
  eq(await btn("Endre rompakke").count(), 0, "Reader has no write action");
  await page.evaluate(() => {
    window.__ctx.role = "manager";
    window.__ctx.company_id = "other";
    window.__deny = true;
    window.__render();
  });
  await page.locator('[data-qa-role="manager"]').waitFor();
  await page.getByText("Tilgang fjernet", { exact: false }).first().waitFor();
  eq(
    await page.locator(".bolig-package-choice-cards article").count(),
    0,
    "Old firm goods cleared",
  );
  eq(errors, [], "No runtime errors");
  console.log(
    "PASS scoped packages Chromium: " +
      checks +
      " assertions. Screenshots: " +
      temp,
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
