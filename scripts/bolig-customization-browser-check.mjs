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
  `import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Customize from '${cwd}/src/modules/bolig/BoligUnitCustomization.jsx';import Tasks from '${cwd}/src/modules/bolig/BoligUnitTasks.jsx';import Overview from '${cwd}/src/modules/bolig/BoligDeliveryOverview.jsx';
import '${cwd}/src/style.css';import '${cwd}/src/modules/ui/appUxReview.css';import '${cwd}/src/modules/bolig/bolig.css';
const ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true},root={id:'root',title:'QA Prosjekt'},unit={id:'unit',number:'H0101',project_id:'project'};
const goods=[{key:'basin',name:'Servant',sku:'00123',quantity:1,unit:'stk'},{key:'tap',name:'Batteri',sku:'00456',quantity:1,unit:'stk'}];
let part={scope_id:'common',room_id:null,room_name:'Felles for boligen',goods,total_cents:10000,package:{id:'p',name:'Bad standard'},options:[],allocations:[]};
let state={context:ctx,root_id:'root',unit_id:'unit',revision:3,rooms_revision:1,selection:{revision:1,snapshot:{components:[part],goods,total_cents:10000}},components:[part],rooms:[],packages:[],options:[],history:[]};
window.__calls=[];window.__saved=false;window.__reject=false;window.__hold=false;
window.__client={rpc:async(name,args)=>{
 window.__calls.push({name,args});
 if(name==='current_user_has_pro_store_catalog_access'||name==='current_user_has_internal_store_catalog_access')return {data:false};
 if(name==='bolig_workspace')return {data:ctx};
 if(name!=='bolig_unit_customization')return {data:false};
 if(window.__hold)await new Promise(r=>window.__release=r);
 if(args.p_action==='get')return {data:structuredClone(state)};
 if(window.__reject)return {error:{code:'PT409',message:'QA: Endringen kunne ikke lagres'}};
 const p=args.p_payload,base=part.customization?.base||part;
 const nextPart=p.reset?base:{...part,goods:p.lines,total_cents:base.total_cents+p.adjustment_cents,customization:{base,adjustment_cents:p.adjustment_cents,reason:p.reason,at:'2026-10-21T21:00:00Z'}};
 const proposal={components:[nextPart],goods:p.lines,total_cents:nextPart.total_cents};
 if(args.p_action.endsWith('preview'))return {data:{...structuredClone(state),proposal}};
 part=nextPart;state={...state,selection:{revision:state.selection.revision+1,snapshot:proposal},components:[part]};return {data:structuredClone(state)};
}};
const app=createRoot(document.getElementById('app'));
window.__show=(mode='custom',role='manager',company='firm')=>app.render(mode==='custom'?<Customize key={role+company} context={{...ctx,role,company_id:company}} root={root} unit={unit} scopeId="common" onClose={saved=>{window.__saved=saved;app.render(<button onClick={()=>window.__show()}>Åpne tilpasning igjen</button>);}}/>:mode==='tasks'?<div className="bolig-unit" style={{maxWidth:600,margin:'auto'}}><Tasks unit={unit} active={true} rooms={<label>QA romkladd<input defaultValue="Usendt romkladd"/></label>} order={<p>QA bestillingsgrunnlag</p>} onOpenProject={(...args)=>window.__opened=args}/></div>:<div className="bolig-dialog"><Overview blocks={[{id:'a',name:'Blokk A'},{id:'b',name:'Blokk B'}]} entrances={[{id:'ea',block_id:'a',address:'Gate 1A'},{id:'eb',block_id:'b',address:'Gate 1B'}]} units={[{id:'a1',number:'H0101',entrance_id:'ea'},{id:'b1',number:'H0201',entrance_id:'eb'}]} statuses={{a1:{purchase_count:2,prepared_count:1,ordered_count:0,partial_count:1,delivered_count:0},b1:{purchase_count:1,prepared_count:0,ordered_count:0,partial_count:0,delivered_count:1}}} selectedBlockId="a" onSelect={id=>window.__selected=id}/></div>);
window.__show();
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
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.VITE_SUPABASE_URL": '"https://qa.supabase.co"',
      "import.meta.env.VITE_SUPABASE_ANON_KEY": '"qa"',
    },
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
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);
  const button = (name) => page.getByRole("button", { name, exact: true }),
    dialog = (name) => page.getByRole("dialog", { name, exact: true });
  let d = dialog("Tilpass denne leiligheten");
  await d.getByText("Servant · 1 stk", { exact: true }).click();
  await d.getByLabel("Antall 1", { exact: true }).fill("2.5");
  await d
    .getByLabel("Begrunnelse for endringen", { exact: true })
    .fill("QA: Mengdeavvik i boligen");
  await d
    .getByLabel("Pristillegg / fratrekk inkl. mva.", { exact: true })
    .fill("-25,50");
  await button("Lukk og behold kladd").click();
  await button("Åpne tilpasning igjen").click();
  await d.getByText("Servant · 2.5 stk", { exact: true }).click();
  eq(
    await d.getByLabel("Antall 1", { exact: true }).inputValue(),
    "2.5",
    "Unsaved quantity survives close/remount",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));

  eq(
    await d
      .getByLabel("Begrunnelse for endringen", { exact: true })
      .inputValue(),
    "QA: Mengdeavvik i boligen",
    "Focus preserves reason",
  );
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await d.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      true,
      "No customization overflow " + width,
    );
  }
  await button("Se over tilpasningen").click();
  await button("Lagre tilpasning for denne boligen").waitFor();
  eq(
    (await d.innerText()).includes("74,50"),
    true,
    "Signed cents affect explicit price adjustment exactly",
  );
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.args?.p_action === "save").length,
    ),
    0,
    "Review is read-only",
  );
  await page.evaluate(() => (window.__reject = true));
  await button("Lagre tilpasning for denne boligen").click();
  await d.getByRole("alert").waitFor();
  eq(
    (await d.getByRole("alert").innerText()).includes("Kladden er beholdt"),
    true,
    "Failed save visible inside dialog",
  );
  await page.evaluate(() => (window.__reject = false));
  await button("Lagre tilpasning for denne boligen").click();
  await button("Åpne tilpasning igjen").waitFor();
  eq(await page.evaluate(() => window.__saved), true);
  await button("Åpne tilpasning igjen").click();
  await d
    .getByText("Gjeldende individuelle tilpasning", { exact: true })
    .waitFor();
  eq(
    await d
      .getByRole("checkbox", {
        name: "Gjenopprett opprinnelig pakkevalg for denne boligen",
      })
      .count(),
    1,
  );
  await button("Lukk og behold kladd").click();
  await page.evaluate(() => window.__show("custom", "reader"));
  await d
    .getByText("Lesetilgang. Boligens varegrunnlag kan ikke endres.", {
      exact: true,
    })
    .waitFor();
  eq(await button("Se over tilpasningen").count(), 0, "Reader cannot edit");
  await page.evaluate(() => window.__show("custom", "manager", "another-firm"));
  await d.getByRole("alert").waitFor();
  eq(
    await d.getByLabel("Begrunnelse for endringen").count(),
    0,
    "Mismatched server identity hides old draft",
  );
  await page.evaluate(() => window.__show("tasks"));
  await button("Rom, grunnpakke og tilvalgspakker").click();
  d = dialog("Rom, grunnpakke og tilvalgspakker");
  await d.getByLabel("QA romkladd").fill("Bevart QA romkladd");
  await page.keyboard.press("Escape");
  await button("Rom, grunnpakke og tilvalgspakker").click();
  eq(
    await d.getByLabel("QA romkladd").inputValue(),
    "Bevart QA romkladd",
    "Work dialog retains unsent child draft",
  );
  await button("Tilbake til boligen").click();
  await button("Sjekklister og dokumentasjon").click();
  await button("Åpne sjekklister").click();
  eq(
    await page.evaluate(() => window.__opened),
    ["project", "sjekklister"],
    "Checklist route uses linked project",
  );
  await button("Ferdigstilling").click();
  eq(
    (await dialog("Ferdigstilling").innerText()).includes(
      "Åpne dokumentert ferdigstilling",
    ),
    true,
    "Completion work area has an explicit integration slot",
  );
  await button("Tilbake til boligen").click();
  await page.evaluate(() => window.__show("overview"));
  await button("Leveranser i bygget").click();
  d = dialog("Leveranseoversikt");
  eq(
    await d.locator(".bolig-delivery-totals strong").allTextContents(),
    ["1", "0", "1", "0"],
    "Block counts exclude other block",
  );
  await d.getByLabel("Vis leveranser for").selectOption("project");
  eq(
    await d.locator(".bolig-delivery-totals strong").allTextContents(),
    ["1", "0", "1", "1"],
    "Project counts aggregate all active blocks",
  );
  await d.getByLabel("Søk bolig eller adresse").fill("H0201");
  eq(await d.locator(".bolig-summary-list li").count(), 1);
  await d.locator(".bolig-summary-list button").click();
  eq(
    await page.evaluate(() => window.__selected),
    "b1",
    "Delivery row opens exact apartment",
  );
  eq(errors, [], "No runtime errors");
  console.log(
    "PASS bolig customization / unit cards / delivery overview Chromium: " +
      checks +
      " assertions. " +
      temp,
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
