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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-overview-browser-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Overview from '${cwd}/src/modules/bolig/BoligBuildingOverview.jsx';
import '${cwd}/src/style.css';
import '${cwd}/src/modules/ui/appUxReview.css';
import '${cwd}/src/modules/bolig/bolig.css';
const context={user_id:'qa',company_id:'firm',role:'manager',enabled:true};
const record={root:{id:'overview',revision:1},blocks:[{id:'a',name:'Blokk A',building_type:'apartment'},{id:'b',name:'Blokk B',building_type:'apartment'}],entrances:[{id:'ea',block_id:'a',address:'Eksempelgata 1',counts:[4,4,4]},{id:'eb',block_id:'b',address:'Eksempelgata 2',counts:[32,32,28]}],units:[]};
for(let i=0;i<104;i++)record.units.push({id:'u'+i,entrance_id:i<12?'ea':'eb',floor:1+Math.floor(i%12/4),number:(i<12?'A-':'B-')+(101+i),official_number:i===103?'H9999':'',has_project:i%2===0,contact_name:i===0?'Komplett Eksempel':'',contact_email:i===0?'eksempel@example.invalid':'',contact_phone:i===0?'00000000':''});
window.__fail=false;window.__calls=[];window.__client={rpc:async(name,args)=>{window.__calls.push({name,args});if(!window.__fail && name==='bolig_completion')return {data:{context,root_id:record.root.id,scope_id:null,rows:[...record.units.map(u=>({scope_id:u.id,kind:'unit',status:'not_started'})),{scope_id:record.root.id,kind:'project',status:'not_started'}]}};return window.__fail?{error:{message:'Denied'}}:{data:{context,root_id:record.root.id,units:record.units.map((u,i)=>({unit_id:u.id,choice_revision:i%3===0?1:0,catalog_changed:i%6===0,order_revision:i%4===0?1:0,order_outdated:i%8===0}))}};}};
function App(){const [q,sq]=useState(''),[unit,su]=useState('');return <section className="bolig-dialog bolig-page"><Overview context={context} record={record} query={q} onQuery={sq} unitId={unit} onSelect={su}/><output aria-label="Valgt ID">{unit}</output></section>}
createRoot(document.getElementById('app')).render(<App/>);`,
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
        name: "client",
        enforce: "pre",
        resolveId(id) {
          if (id.endsWith("appSupabaseClientRegistry.js")) return "\0client";
        },
        load(id) {
          if (id === "\0client")
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
  const output = (Array.isArray(result) ? result[0] : result).output;
  const script = output.find((v) => v.type === "chunk").code,
    css = output
      .filter((v) => v.type === "asset" && v.fileName.endsWith(".css"))
      .map((v) => v.source)
      .join("\n");
  server = http.createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("content-type", "text/javascript");
      res.end(script);
    } else if (req.url === "/app.css") {
      res.setHeader("content-type", "text/css");
      res.end(css);
    } else if (req.url === "/bolig/fasade.webp") {
      res.setHeader("content-type", "image/webp");
      res.end(fs.readFileSync("public/bolig/fasade.webp"));
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
      viewport: { width: 1366, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);
  const btn = (name) => page.getByRole("button", { name, exact: true }),
    filter = page.getByLabel("Filtrer boliger", { exact: true });
  await page.locator(".bolig-window.review").first().waitFor();
  eq(
    await btn("Oppsett").count(),
    0,
    "Only project header owns the setup action",
  );
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 1000 });
    await btn("Fasade").click();
    const metrics = await page.locator(".bolig-window").evaluateAll((es) =>
      es.map((e) => {
        const r = e.getBoundingClientRect(),
          s = getComputedStyle(e),
          a = e.closest("article").getBoundingClientRect();
        return {
          w: r.width,
          h: r.height,
          ratio: r.width / a.width,
          bg: s.backgroundImage,
        };
      }),
    );
    assert(
      metrics.every(
        (m) =>
          m.w >= 51 &&
          m.h >= 44 &&
          m.w <= 85 &&
          m.ratio < 0.3 &&
          m.bg.includes("linear-gradient"),
      ),
      "Compact glass windows keep facade visible at " + width,
    );
    checks++;
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "No page overflow " + width,
    );
    await page.screenshot({
      path: path.join(temp, "facade-" + width + ".png"),
      fullPage: true,
    });
  }
  await btn("Boligliste").click();
  await btn("Alle bygg 2").click();
  eq(
    await page.locator(".bolig-all-buildings .bolig-building-card").count(),
    2,
    "All buildings exits the list explicitly",
  );
  await page
    .locator(".bolig-all-buildings")
    .getByRole("button", { name: "Åpne Blokk A", exact: true })
    .click();
  await btn("Boligliste").click();
  await btn("Bytt bygg").click();
  await page
    .getByRole("dialog", { name: "Bytt bygg", exact: true })
    .getByRole("button", { name: "Åpne Blokk A", exact: true })
    .click();
  eq(
    await page.locator(".bolig-window").count(),
    12,
    "Explicit building selection returns to facade",
  );
  await btn("Boligliste").click();
  eq(
    await page.locator(".bolig-overview-row").count(),
    50,
    "List is paginated",
  );
  await btn("Neste treff").click();
  eq(await page.locator(".bolig-overview-row").count(), 50);
  await btn("Neste treff").click();
  eq(await page.locator(".bolig-overview-row").count(), 4);
  await filter.selectOption("review");
  eq(
    await page.locator(".bolig-overview-row").count(),
    18,
    "Filtering resets pagination and uses whole project",
  );
  eq(
    await page.locator(".bolig-overview-row .review").count(),
    18,
    "All results match selected status",
  );
  await page
    .getByRole("searchbox", { name: "Søk i hele hovedprosjektet" })
    .fill("Eksempelgata 2");
  eq(
    await page.locator(".bolig-overview-row").count(),
    16,
    "Search combines with filter across buildings",
  );
  await page
    .getByRole("searchbox", { name: "Søk i hele hovedprosjektet" })
    .fill("finnes ikke");
  eq(await page.locator(".bolig-overview-row").count(), 0);
  eq(
    await page
      .getByText("Ingen boliger passer til søket og filteret.", {
        exact: false,
      })
      .isVisible(),
    true,
  );
  await btn("Fasade").click();
  eq(await filter.inputValue(), "all");
  eq(
    await page
      .getByRole("searchbox", { name: "Søk i hele hovedprosjektet" })
      .inputValue(),
    "",
  );
  await filter.selectOption("contact");
  eq(
    await page.locator(".bolig-overview-row").count(),
    50,
    "Incomplete contact information filter is paginated",
  );
  eq(
    await page
      .locator(".bolig-overview-row")
      .filter({ hasText: "Komplett Eksempel" })
      .count(),
    0,
  );
  await btn("Prosjektkobling").click();
  await filter.selectOption("ready");
  eq(await page.locator(".bolig-overview-row .ready").count(), 50);
  await btn("Neste treff").click();
  eq(await page.locator(".bolig-overview-row").count(), 2);
  await btn("Fasade").click();
  await page
    .getByRole("searchbox", { name: "Søk i hele hovedprosjektet" })
    .fill("H9999");
  eq(
    await page.locator(".bolig-overview-row").count(),
    1,
    "Search includes official housing number",
  );
  await page.locator(".bolig-overview-row").click();
  eq(
    await page.getByLabel("Valgt ID").textContent(),
    "u103",
    "List row opens exact stable unit ID",
  );
  eq(
    await page.locator(".bolig-building h4").textContent(),
    "Eksempelgata 2",
    "Selection returns to correct building",
  );
  for (const width of [320, 1366]) {
    await page.setViewportSize({ width, height: 1000 });
    eq(
      await page.locator(".bolig-window").evaluateAll((es) =>
        es.every((e) => {
          const w = e.getBoundingClientRect(),
            b = e.closest("article").getBoundingClientRect();
          return w.left >= b.left && w.right <= b.right + 1;
        }),
      ),
      true,
      "Dense floors keep every window within its own facade",
    );
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "Dense floors scroll inside the facade only",
    );
  }
  await btn("Boligvalg").click();
  await page.evaluate(() => {
    window.__fail = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page
    .getByText("Kunne ikke hente boligstatus.", { exact: false })
    .waitFor();
  await filter.selectOption("empty");
  eq(
    await page.locator(".bolig-overview-row").count(),
    0,
    "Failed reads never claim units are missing choices",
  );
  await filter.selectOption("unknown");
  eq(
    await page.locator(".bolig-overview-row").count(),
    50,
    "Unknown status remains visible",
  );
  await page.evaluate(() => {
    window.__fail = false;
    window.dispatchEvent(new Event("focus"));
  });
  await page.locator(".bolig-overview-row").waitFor({ state: "detached" });
  await filter.selectOption("review");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(await filter.inputValue(), "review", "Refresh preserves chosen filter");
  eq(await page.locator(".bolig-overview-row").count(), 18);
  await page.setViewportSize({ width: 320, height: 900 });
  eq(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "Filtered list fits mobile",
  );
  eq(
    await page.evaluate(() =>
      window.__calls.every((c) => c.name === "bolig_overview" || (c.name === "bolig_completion" && c.args.p_action === "get")),
    ),
    true,
    "Overview is read-only",
  );
  await btn("Ferdigstilling").click();
  await filter.selectOption("all");
  await btn("Boligliste").click();
  eq((await page.locator(".bolig-overview-row").first().innerText()).includes("Ikke startet"),true,"Completion layer shows documented state rather than delivery state");
  eq(errors, [], "No runtime errors");
  console.log(
    "PASS overview Chromium: " + checks + " assertions. Screenshots: " + temp,
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
