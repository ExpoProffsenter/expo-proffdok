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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-builder-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Builder from '${cwd}/src/modules/bolig/BoligProjectBuilder.jsx';
import Task from '${cwd}/src/modules/bolig/BoligTaskDialog.jsx';
import Overview from '${cwd}/src/modules/bolig/BoligBuildingOverview.jsx';
import '${cwd}/src/modules/bolig/bolig.css';
const context={user_id:'qa-user',company_id:'qa-company',company_name:'Eksempelfirma · kun test',enabled:true,role:'manager'};
const make=(mode)=>{const record={root:{id:mode,revision:1},blocks:[],entrances:[],units:[]};for(let b=0;b<(mode==='fivehundred'?25:mode==='many'?20:1);b++){record.blocks.push({id:'b'+b,name:'Bygg '+(b+1),building_type:'apartment',address:'Eksempelgata '+(b+1)});for(let e=0;e<((mode==='many'||mode==='fivehundred')?2:20);e++){const id='b'+b+'e'+e,counts=mode==='uneven'?[2,3,1]:(mode==='many'||mode==='fivehundred')?[2,2,2,2,2]:[4,4,4,4,4,4];record.entrances.push({id,block_id:'b'+b,address:'Eksempelgata '+(b+1)+' oppgang '+(e+1),counts});counts.forEach((n,f)=>{for(let p=0;p<n;p++)record.units.push({id:id+'f'+f+'p'+p,entrance_id:id,floor:f+1,number:'H'+String(f+1).padStart(2,'0')+String(p+1).padStart(2,'0'),contact_name:b===19&&e===1&&f===4&&p===0?'Siste Eksempel':'',has_project:false});});}}return record;};
window.__attempts=[];window.__failNext=false;window.__client={rpc:async(name,args)=>({data:{context,root_id:args.p_root_id,units:[]}})};
function App({mode}){const [q,sq]=useState(''),[unit,su]=useState(''),[busy,sb]=useState(false);return <section className="bolig-dialog bolig-page" style={{maxWidth:'100%',width:'100%',minHeight:'100vh'}}>{mode==='builder'?<Builder context={context} busy={busy} onCreate={async payload=>{sb(true);try{window.__attempts.push(payload);if(window.__failNext){window.__failNext=false;throw Error('Forbindelsen ble brutt. Kontroller opprettelsen.');}}finally{sb(false);}}}/>:mode==='contact'?<Task title="Kontakt og leilighetsprosjekt"><label>Kontaktperson<input aria-label="Kontaktperson" defaultValue="Eksempelperson"/></label></Task>:<><Overview context={context} record={make(mode)} query={q} onQuery={sq} unitId={unit} onSelect={su} onSetup={()=>{}}/><output>{unit}</output></>}</section>};
const root=createRoot(document.getElementById('app'));window.__mode=mode=>root.render(<App key={mode} mode={mode}/>);window.__mode('builder');
`,
);
let server, browser;
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
try {
  const built = await build({
    root: cwd,
    configFile: false,
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
    plugins: [
      react({ jsxRuntime: "classic" }),
      {
        name: "qa-client",
        enforce: "pre",
        resolveId(id) {
          if (id.endsWith("appSupabaseClientRegistry.js")) return "\0qa";
        },
        load(id) {
          if (id === "\0qa")
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
  const output = (Array.isArray(built) ? built[0] : built).output,
    script = output.find((x) => x.type === "chunk").code,
    css = output
      .filter((x) => x.type === "asset" && x.fileName.endsWith(".css"))
      .map((x) => x.source)
      .join("\n");
  server = http.createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("content-type", "application/javascript");
      res.end(script);
    } else if (req.url === "/style.css") {
      res.setHeader("content-type", "text/css");
      res.end(css);
    } else if (req.url === "/bolig/fasade.webp") {
      res.setHeader("content-type", "image/webp");
      res.end(fs.readFileSync("public/bolig/fasade.webp"));
    } else
      res.end(
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:Arial,sans-serif}button,input,select{font:inherit}button{cursor:pointer}</style><link rel="stylesheet" href="/style.css"><div id="app"></div><script src="/app.js"></script></html>',
      );
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
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
    console.error("PAGE ERROR:", e.message);
  });
  await page.goto("http://127.0.0.1:" + server.address().port);
  await page
    .getByRole("button", { name: "Bygg prosjekt", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Bygg prosjekt",
    exact: true,
  });
  eq(await dialog.isVisible(), true);
  await page.screenshot({ path: path.join(temp, "builder-types.png") });
  await dialog
    .getByLabel("Prosjektnavn", { exact: true })
    .fill("Solgløtt · veiviserprøve");
  await dialog.getByRole("button", { name: "Enebolig Ett hus" }).click();
  await dialog.getByRole("button", { name: "Neste", exact: true }).click();
  await dialog
    .getByLabel("Byggets adresse", { exact: true })
    .fill("Eksempelgata 1");
  await dialog.getByRole("button", { name: "Neste", exact: true }).click();
  await dialog.getByLabel("Etasjer i huset", { exact: true }).fill("3");
  eq(
    await dialog
      .getByText("Huset registreres som én bolig.", { exact: false })
      .isVisible(),
    true,
  );
  await dialog.getByRole("button", { name: "Neste", exact: true }).click();
  eq(
    await dialog
      .getByRole("heading", { name: "Se over og opprett" })
      .isVisible(),
    true,
  );
  await page.screenshot({ path: path.join(temp, "builder-review.png") });
  await dialog
    .getByRole("button", { name: "Lukk og behold prosjektkladd" })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Fortsett prosjektkladd" }).click();
  eq(
    await dialog
      .getByRole("heading", { name: "Se over og opprett" })
      .isVisible(),
    true,
    "Closed and remounted wizard resumes exact step",
  );
  await page.evaluate(() => (window.__failNext = true));
  await dialog.getByRole("button", { name: "Opprett prosjektforside" }).click();
  eq(
    await dialog
      .getByRole("button", { name: "Kontroller opprettelsen" })
      .isVisible(),
    true,
  );
  eq(
    (await page.evaluate(() => window.__attempts))[0].buildings[0].entrances[0]
      .counts,
    [1],
  );
  eq(
    (await page.evaluate(() => window.__attempts))[0].buildings[0].house_floors,
    3,
  );
  const saved = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem(
        Object.keys(localStorage).find((k) => k.endsWith(":builder")),
      ),
    ),
  );
  eq(saved.submitted, true);
  await page.reload();
  await page.getByRole("button", { name: "Fortsett prosjektkladd" }).click();
  await dialog.getByRole("button", { name: "Kontroller opprettelsen" }).click();
  const replay = (await page.evaluate(() => window.__attempts))[0];
  eq(
    replay.request_id,
    saved.request_id,
    "Lost response retries exact request key",
  );
  eq(await dialog.isVisible(), false);
  eq(
    await page.evaluate(
      () =>
        Object.keys(localStorage).filter((k) => k.endsWith(":builder")).length,
    ),
    0,
  );
  // Fresh wizard stays in place across focus/visibility; Escape only closes the inner dialog.
  await page
    .getByRole("button", { name: "Bygg prosjekt", exact: true })
    .click();
  await dialog.getByLabel("Prosjektnavn", { exact: true }).fill("Usendt kladd");
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  eq(
    await dialog.getByLabel("Prosjektnavn", { exact: true }).inputValue(),
    "Usendt kladd",
  );
  await dialog.press("Escape");
  eq(await dialog.isVisible(), false);
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.__mode("long"));
    await page.getByRole("region", { name: "Byggoversikt" }).waitFor();
    const count = await page.locator(".bolig-window").count();
    assert(
      count === 24 || count === 48,
      "Only one/two readable entrances rendered",
    );
    checks++;
    eq(await page.locator(".bolig-building-minimap button").count(), 20);
    await page
      .getByLabel("Velg oppgang", { exact: true })
      .selectOption("b0e19");
    eq(
      await page.locator(".bolig-building.is-active-entrance h4").textContent(),
      "Eksempelgata 1 oppgang 20",
    );
    const sizes = await page.locator(".bolig-window").evaluateAll((es) =>
      es.map((e) => ({
        w: e.getBoundingClientRect().width,
        h: e.getBoundingClientRect().height,
      })),
    );
    assert(sizes.every((v) => v.w >= 51 && v.h >= 44));
    checks++;
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      console.error(
        "OVERFLOW",
        width,
        await page.locator("body *").evaluateAll((es) =>
          es
            .map((e) => ({
              cls: e.className,
              x: e.getBoundingClientRect().x,
              w: e.getBoundingClientRect().width,
            }))
            .filter((e) => e.x < 0 || e.x + e.w > innerWidth)
            .slice(0, 12),
        ),
      );
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "No page-level horizontal overflow",
    );
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    eq(
      await page.getByLabel("Velg oppgang", { exact: true }).inputValue(),
      "b0e19",
    );
    if (width === 1366)
      await page.screenshot({
        path: path.join(temp, "long-building.png"),
        fullPage: true,
      });
    await page.evaluate(() => window.__mode("builder"));
    await page.getByRole("button", { name: "Fortsett prosjektkladd" }).click();
    eq(
      await page.evaluate(() => {
        const d = document.querySelector(".bolig-builder-dialog");
        const r = d.getBoundingClientRect();
        return (
          r.x >= 0 &&
          r.right <= innerWidth &&
          r.top >= 0 &&
          r.bottom <= innerHeight
        );
      }),
      true,
      "Wizard fits viewport",
    );
    if (width === 390)
      await page.screenshot({ path: path.join(temp, "builder-mobile.png") });
    await dialog.press("Escape");
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.evaluate(() => window.__mode("many"));
  await page.getByRole("button", { name: "Alle bygg", exact: false }).click();
  eq(
    await page.locator(".bolig-all-buildings .bolig-building-card").count(),
    20,
  );
  eq(
    await page.locator(".bolig-window").count(),
    0,
    "All-buildings overview renders no household windows",
  );
  await page.screenshot({
    path: path.join(temp, "many-buildings.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Åpne Bygg 1", exact: true }).click();
  await page
    .getByPlaceholder("Søk bolig, adresse eller kontakt")
    .fill("Siste Eksempel");
  await page.locator(".bolig-search-results button").click();
  eq(
    await page.locator("output").textContent(),
    "b19e1f4p0",
    "Global search opens unit in last building and entrance",
  );
  eq(
    await page.locator(".bolig-building-breadcrumb b").textContent(),
    "Bygg 20",
  );
  eq(
    await page.getByLabel("Velg oppgang", { exact: true }).inputValue(),
    "b19e1",
  );
  await page.getByRole("button", { name: "Bytt bygg", exact: true }).click();
  const picker = page.getByRole("dialog", { name: "Bytt bygg", exact: true });
  await picker
    .getByLabel("Søk bygg eller adresse", { exact: true })
    .fill("Bygg 20");
  eq(await picker.locator(".bolig-building-card").count(), 1);
  await picker.press("Escape");
  eq(await picker.isVisible(), false);
  eq(
    await page.locator("output").textContent(),
    "b19e1f4p0",
    "Escape preserves selected household",
  );
  await page.evaluate(() => window.__mode("fivehundred"));
  await page.getByRole("button", { name: "Alle bygg", exact: false }).click();
  eq(
    await page.locator(".bolig-all-buildings .bolig-building-card").count(),
    25,
    "500 households overview renders 25 building cards",
  );
  eq(await page.locator(".bolig-window").count(), 0);
  await page.getByRole("button", { name: "Åpne Bygg 25", exact: true }).click();
  eq(
    await page.locator(".bolig-window").count(),
    20,
    "500 households only render the active building",
  );
  await page.evaluate(() => window.__mode("contact"));
  await page
    .getByRole("button", { name: "Kontakt og leilighetsprosjekt", exact: true })
    .click();
  const contact = page.getByRole("dialog", {
    name: "Kontakt og leilighetsprosjekt",
    exact: true,
  });
  await contact
    .getByLabel("Kontaktperson", { exact: true })
    .fill("Usendt kontakttekst");
  await contact.press("Escape");
  eq(await contact.isVisible(), false);
  await page
    .getByRole("button", { name: "Kontakt og leilighetsprosjekt", exact: true })
    .click();
  eq(
    await contact.getByLabel("Kontaktperson", { exact: true }).inputValue(),
    "Usendt kontakttekst",
    "Closing contact popup retains the exact editor",
  );
  eq(errors, []);
  console.log(
    `PASS builder/browser: ${checks} assertions; atomic-attempt recovery, house floors, saved draft, close/Escape/focus, 400/480/500 households, last-building search, scoped rendering and 320/390/1024/1366px. Internal visual evidence: ${temp}`,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
}
