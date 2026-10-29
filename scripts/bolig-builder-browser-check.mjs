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
import ProjectHome from '${cwd}/src/modules/bolig/BoligProjectHome.jsx';
import {BoligHelp} from '${cwd}/src/modules/help/BoligHelp.jsx';
import Task from '${cwd}/src/modules/bolig/BoligTaskDialog.jsx';
import Overview from '${cwd}/src/modules/bolig/BoligBuildingOverview.jsx';
import '${cwd}/src/modules/bolig/bolig.css';
const homeRoots=Array.from({length:15},(_,i)=>({id:'root'+i,title:'Boligprosjekt '+(i+1),reference:'QA-'+(i+1),unit_count:(i+1)*10,archived:i===14}));
const context={user_id:'qa-user',company_id:'qa-company',company_name:'Eksempelfirma · kun test',enabled:true,role:'manager'};
const make=(mode)=>{const record={root:{id:mode,revision:1},blocks:[],entrances:[],units:[]};for(let b=0;b<(mode==='sixteen'?16:mode==='fivehundred'?25:mode==='many'?20:1);b++){record.blocks.push({id:'b'+b,name:'Bygg '+(b+1),building_type:mode==='sixteen'?'multi':'apartment',address:'Eksempelgata '+(b+1)});for(let e=0;e<(mode==='sixteen'?1:(mode==='many'||mode==='fivehundred')?2:20);e++){const id='b'+b+'e'+e,counts=(mode==='uneven'||mode==='sixteen')?[2,3,1]:(mode==='many'||mode==='fivehundred')?[2,2,2,2,2]:[4,4,4,4,4,4];record.entrances.push({id,block_id:'b'+b,address:'Eksempelgata '+(b+1)+' oppgang '+(e+1),counts});counts.forEach((n,f)=>{for(let p=0;p<n;p++)record.units.push({id:id+'f'+f+'p'+p,entrance_id:id,floor:f+1,number:'H'+String(f+1).padStart(2,'0')+String(p+1).padStart(2,'0'),contact_name:b===19&&e===1&&f===4&&p===0?'Siste Eksempel':'',has_project:false});});}}if(mode.startsWith('type-')){const type=mode.slice(5),b=record.blocks[0],e=record.entrances[0];b.building_type=type;const counts=type==='house'?[1]:type==='duplex'?[2]:type==='multi'?[2,3,1]:[4,3,5,4,2,4];e.counts=counts;record.blocks=[b];record.entrances=[e];record.units=counts.flatMap((n,f)=>Array.from({length:n},(_,p)=>({id:'actual-'+f+'-'+p,entrance_id:e.id,floor:f+1,number:'H'+String(f+1).padStart(2,'0')+String(p+1).padStart(2,'0'),contact_name:'',has_project:false})));}return record;};
window.__attempts=[];window.__failNext=false;window.__client={rpc:async(name,args)=>({data:{context,root_id:args.p_root_id,units:[]}})};
function App({mode}){const [q,sq]=useState(''),[unit,su]=useState(''),[busy,sb]=useState(false);return <section className="bolig-dialog bolig-page" style={{maxWidth:'100%',width:'100%',minHeight:'100vh'}}>{mode==='home'?<><ProjectHome roots={homeRoots} activeRoot={homeRoots[0]} active loading={false} busy={false} manager onSelect={su} onResume={()=>su('resume')}><Builder context={context} busy={false} onCreate={async()=>{}}/></ProjectHome><output>{unit}</output></>:mode==='builder'?<div className="bolig-utilities"><div className="bolig-toolbar"><small>Prosjektledertilgang</small></div><BoligHelp/><Builder context={context} busy={busy} onCreate={async payload=>{sb(true);try{window.__attempts.push(payload);if(window.__failNext){window.__failNext=false;throw Error('Forbindelsen ble brutt. Kontroller opprettelsen.');}}finally{sb(false);}}}/></div>:mode==='contact'?<Task title="Leilighetsinformasjon"><label>Kontaktperson<input aria-label="Kontaktperson" defaultValue="Eksempelperson"/></label></Task>:<>{mode==='sixteen'&&<header data-qa-sticky style={{position:'sticky',top:0,height:180,zIndex:20}}>QA app-header</header>}<Overview context={context} record={make(mode)} query={q} onQuery={sq} unitId={unit} onSelect={su} onSetup={()=>{}}/><output>{unit}</output></>}</section>};
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
    } else if (
      [
        "/bolig/fasade.webp",
        "/bolig/leilighetsbygg-v2.webp",
        "/bolig/enebolig-v2.webp",
        "/bolig/tomannsbolig-v2.webp",
        "/bolig/flerfamiliehus-v2.webp",
        "/bolig/boligfelt-v2.webp",
      ].includes(req.url)
    ) {
      res.setHeader("content-type", "image/webp");
      res.end(fs.readFileSync("public" + req.url));
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
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    const help = page.locator(".bolig-help");
    const buildButton = page.getByRole("button", {
      name: "Bygg nytt prosjekt",
      exact: true,
    });
    const helpBox = await help.boundingBox(),
      buttonBox = await buildButton.boundingBox();
    eq(
      Math.abs(helpBox.height - buttonBox.height) < 1,
      true,
      "Header actions have equal height",
    );
    if (width >= 1024)
      eq(
        Math.abs(helpBox.y - buttonBox.y) < 1,
        true,
        "Desktop header actions share the same top edge",
      );
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "Header actions fit mobile and desktop",
    );
    await help.locator(":scope > summary").click();
    eq(await help.getAttribute("open"), "", "Help opens after header styling");
    await help.locator(":scope > summary").click();
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  await page
    .getByRole("button", { name: "Bygg nytt prosjekt", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Bygg nytt prosjekt",
    exact: true,
  });
  eq(await dialog.isVisible(), true);
  await page.waitForFunction(() => {
    const images = [...document.querySelectorAll(".bolig-type-card img")];
    return (
      images.length === 5 &&
      images.every((img) => img.complete && img.naturalWidth > 0)
    );
  });
  eq(
    await dialog
      .locator(".bolig-type-card img")
      .evaluateAll(
        (images) => new Set(images.map((img) => img.getAttribute("src"))).size,
      ),
    5,
    "Each housing type has a distinct successfully loaded photograph",
  );
  eq(
    await dialog
      .locator(".bolig-type-card img")
      .evaluateAll((images) =>
        images.every((img) => getComputedStyle(img).objectFit === "cover"),
      ),
    true,
    "Example photos preserve their proportions in type cards",
  );
  await dialog
    .locator(".bolig-type-card img")
    .evaluateAll((images) => Promise.all(images.map((img) => img.decode())));
  await page.screenshot({ path: path.join(temp, "builder-types.png") });
  if (process.env.BOLIG_BUILDER_GUIDE_SCREENSHOT)
    await dialog.screenshot({
      path: process.env.BOLIG_BUILDER_GUIDE_SCREENSHOT,
    });
  await dialog
    .getByLabel("Prosjektnavn", { exact: true })
    .fill("Solgløtt · veiviserprøve");
  await dialog.getByRole("button", { name: "Enebolig Ett hus" }).click();
  await dialog.getByRole("button", { name: "Neste", exact: true }).click();
  await dialog
    .getByLabel("Byggets adresse (valgfritt)", { exact: true })
    .fill("");
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
  eq(
    (await page.evaluate(() => window.__attempts))[0].buildings[0].address,
    "",
    "Project can be created with a genuinely unknown address",
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
  await page
    .getByRole("button", { name: "Bygg nytt prosjekt", exact: true })
    .click();
  eq(
    await dialog
      .getByRole("button", {
        name: "Forkast kladd og start på nytt",
        exact: true,
      })
      .count(),
    0,
    "Uncertain creation cannot be discarded before receipt check",
  );
  await dialog
    .getByRole("button", { name: "Fortsett med kladden", exact: true })
    .click();
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
    .getByRole("button", { name: "Bygg nytt prosjekt", exact: true })
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
  await page.getByRole("button", { name: "Fortsett prosjektkladd" }).click();
  await dialog.getByRole("button", { name: "Neste", exact: true }).click();
  await dialog
    .getByLabel("Byggets adresse (valgfritt)", { exact: true })
    .fill("Eksempelgata 20");
  await dialog.getByRole("button", { name: "Neste", exact: true }).click();
  await dialog.getByLabel("Antall oppganger", { exact: true }).fill("20");
  eq(
    await dialog.locator(".bolig-builder-entrance").count(),
    1,
    "Twenty entrances use one selected editor, not twenty rows",
  );
  const lastEntranceKey = await dialog
    .getByLabel("Oppgang i bygget", { exact: true })
    .locator("option")
    .last()
    .getAttribute("value");
  await dialog
    .getByLabel("Oppgang i bygget", { exact: true })
    .selectOption(lastEntranceKey);
  await dialog
    .getByLabel("Oppgangens adresse (valgfritt)", { exact: true })
    .fill("Siste oppgang");
  await dialog
    .getByRole("button", { name: "Lukk og behold prosjektkladd" })
    .click();
  await page.getByRole("button", { name: "Fortsett prosjektkladd" }).click();
  eq(
    await dialog
      .getByLabel("Oppgangens adresse (valgfritt)", { exact: true })
      .inputValue(),
    "Siste oppgang",
    "Selected entrance and its draft survive closing",
  );
  await dialog.press("Escape");
  await page
    .getByRole("button", { name: "Bygg nytt prosjekt", exact: true })
    .click();
  eq(
    await dialog
      .getByRole("heading", { name: "Du har en prosjektkladd" })
      .isVisible(),
    true,
    "New project never silently overwrites a draft",
  );
  await dialog
    .getByRole("button", {
      name: "Forkast kladd og start på nytt",
      exact: true,
    })
    .click();
  await dialog
    .getByRole("button", { name: "Behold kladden", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Fortsett med kladden", exact: true })
    .click();
  eq(
    await dialog
      .getByLabel("Oppgangens adresse (valgfritt)", { exact: true })
      .inputValue(),
    "Siste oppgang",
    "Declining discard keeps the exact previous draft",
  );
  await dialog.press("Escape");
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
    12,
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
  await page.getByRole("button", { name: "Neste bygg", exact: true }).click();
  eq(
    await page.locator(".bolig-all-buildings .bolig-building-card").count(),
    8,
    "Remaining buildings are reachable without a long overview",
  );
  // React's new card page may commit before the scheduled browser frame scrolls.
  // Wait for the original user-visible contract, including keyboard focus.
  await page.waitForFunction(() => {
    const heading = document.querySelector(".bolig-building-toolbar h3");
    const box = heading?.getBoundingClientRect();
    return (
      heading === document.activeElement &&
      box.top >= 0 &&
      box.bottom <= innerHeight
    );
  });
  eq(
    await page
      .locator(".bolig-building-toolbar h3")
      .evaluate((e) => e.getBoundingClientRect().top >= 0),
    true,
    "Paging returns focus and view to the building heading",
  );
  eq(
    await page
      .locator(".bolig-building-toolbar h3")
      .evaluate((e) => e === document.activeElement),
    true,
    "Paging also restores keyboard focus",
  );
  await page.getByRole("button", { name: "Forrige bygg", exact: true }).click();
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
    12,
    "500 households overview renders only the first page",
  );
  eq(await page.locator(".bolig-window").count(), 0);
  await page.getByRole("button", { name: "Neste bygg", exact: true }).click();
  await page.getByRole("button", { name: "Neste bygg", exact: true }).click();
  eq(
    await page.locator(".bolig-all-buildings .bolig-building-card").count(),
    1,
    "Last page reaches building 25",
  );
  await page.getByRole("button", { name: "Åpne Bygg 25", exact: true }).click();
  eq(
    await page.locator(".bolig-window").count(),
    20,
    "500 households only render the active building",
  );
  await page.getByRole("button", { name: "Alle bygg", exact: false }).click();
  await page.setViewportSize({ width: 390, height: 900 });
  eq(
    await page
      .getByRole("button", { name: "Åpne Bygg 25", exact: true })
      .isVisible(),
    true,
    "Resizing retains the same building range",
  );
  assert(
    (await page.locator(".bolig-all-buildings .bolig-building-card").count()) <=
      4,
  );
  checks++;
  await page.getByRole("button", { name: "Forrige bygg", exact: true }).click();
  eq(
    await page.locator(".bolig-all-buildings .bolig-building-card").count(),
    4,
    "Mobile overview shows at most four buildings per page",
  );
  eq(
    await page
      .locator(".bolig-building-toolbar h3")
      .evaluate((e) => e.getBoundingClientRect().top >= 0),
    true,
    "Mobile page change starts at the heading",
  );
  eq(
    await page.locator(".bolig-building-toolbar h3").evaluate((e) =>
      document.activeElement === e && e.getBoundingClientRect().bottom <= innerHeight),
    true,
    "Mobile page change leaves the complete heading focused in the viewport",
  );
  for (const width of [1366, 768, 390, 320]) {
    await page.setViewportSize({width,height:800});
    await page.evaluate(() => window.__mode('sixteen'));
    await page.getByRole('button',{name:/Alle bygg/}).click();
    await page.locator('.bolig-all-buildings').getByRole('button',{name:'Åpne Bygg 2',exact:true}).click();
    const address = page.getByRole('region',{name:'Valgt bygg og adresse'});
    eq(await address.textContent(), 'Bygg 2Eksempelgata 2 oppgang 1', 'Explicit choice exposes correct building address');
    eq(await address.evaluate(el=>el===document.activeElement),true,'Building address receives focus');
    eq(await address.evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('[data-qa-sticky]').getBoundingClientRect().bottom+8&&el.getBoundingClientRect().bottom<innerHeight),true,'Address is within viewport');
    eq(await page.locator('.bolig-photo-building').evaluate(el=>el.getBoundingClientRect().height<500),true,'Three-floor multi-family facade stays compact');
    eq(await page.locator('.bolig-window').count(),6,'All six real units retained');
    eq(await page.locator('.bolig-window').first().evaluate(el=>el.getBoundingClientRect().height>=44),true,'Targets remain readable and touchable');
  }
  for (const type of ["house", "duplex", "multi", "apartment", "field"]) {
    for (const width of [390, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate((type) => window.__mode("type-" + type), type);
      const building = page.locator(".bolig-photo-building");
      await building.waitFor();
      const photo = building.locator(":scope > .bolig-facade-photo");
      await photo.evaluate((img) => img.decode());
      eq(
        await photo.evaluate((img) => getComputedStyle(img).objectFit),
        "cover",
        "Proportions preserved for " + type + " at " + width,
      );
      const expected =
        type === "house"
          ? 1
          : type === "duplex"
            ? 2
            : type === "multi"
              ? 6
              : 22;
      eq(
        await building.locator(".bolig-window").count(),
        expected,
        "All actual households inside photo for " + type,
      );
      await building.screenshot({path:"/tmp/bolig-photo-"+type+"-"+width+".png"});
      eq(
        await building.evaluate((el) => {
          const p = el
            .querySelector(".bolig-facade-photo")
            .getBoundingClientRect();
          return [...el.querySelectorAll(".bolig-window")].every((w) => {
            const r = w.getBoundingClientRect();
            return (
              r.left >= p.left - 1 &&
              r.right <= p.right + 1 &&
              r.top >= p.top - 1 &&
              r.bottom <= p.bottom + 1
            );
          });
        }),
        true,
        "All housing targets stay within image bounds " + type + width,
      );
      await building.locator(".bolig-window").last().click();
      eq(
        (await page.locator("output").textContent()).startsWith("actual-"),
        true,
        "Photo opens actual household ID for " + type,
      );
      await building.screenshot({
        path: "/tmp/bolig-photo-" + type + "-" + width + ".png",
      });
    }
  }
  await page.evaluate(() => window.__mode("contact"));
  await page
    .getByRole("button", { name: "Leilighetsinformasjon", exact: true })
    .click();
  const contact = page.getByRole("dialog", {
    name: "Leilighetsinformasjon",
    exact: true,
  });
  await contact
    .getByLabel("Kontaktperson", { exact: true })
    .fill("Usendt kontakttekst");
  await contact.press("Escape");
  eq(await contact.isVisible(), false);
  await page
    .getByRole("button", { name: "Leilighetsinformasjon", exact: true })
    .click();
  eq(
    await contact.getByLabel("Kontaktperson", { exact: true }).inputValue(),
    "Usendt kontakttekst",
    "Closing contact popup retains the exact editor",
  );
  await contact.press("Escape");
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.evaluate(() => window.__mode("home"));
  const home = page.getByRole("region", {
    name: "Prosjektoversikt",
    exact: true,
  });
  await home.waitFor();
  eq(
    await home.locator(".bolig-home-project").count(),
    6,
    "Home limits projects to six cards per page",
  );
  eq(
    await home
      .getByRole("button", { name: "Bygg nytt prosjekt", exact: true })
      .isVisible(),
    true,
    "New project remains visible alongside resume draft",
  );
  eq(
    await home
      .getByRole("button", { name: "Fortsett prosjektkladd", exact: true })
      .isVisible(),
    true,
  );
  await home
    .getByRole("button", { name: "Neste prosjekter", exact: true })
    .click();
  await home
    .getByRole("button", { name: "Neste prosjekter", exact: true })
    .click();
  eq(await home.locator(".bolig-home-project").count(), 2);
  await home.getByLabel("Søk boligprosjekter", { exact: true }).fill("QA-14");
  eq(await home.locator(".bolig-home-project").count(), 1);
  await home
    .getByRole("button", { name: "Åpne Boligprosjekt 14", exact: true })
    .click();
  eq(
    await page.locator("output").textContent(),
    "root13",
    "Home opens the actual selected project ID",
  );
  await home.getByLabel("Søk boligprosjekter", { exact: true }).fill("");
  await home
    .getByLabel("Vis prosjekter", { exact: true })
    .selectOption("archived");
  eq(await home.locator(".bolig-home-project").count(), 1);
  await home
    .getByLabel("Vis prosjekter", { exact: true })
    .selectOption("active");
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForFunction(
      (expected) =>
        document.querySelectorAll(".bolig-home-project").length === expected,
      width <= 680 ? 3 : 6,
    );
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "Module home fits each viewport",
    );
    eq(
      await home.locator(".bolig-home-project").count(),
      width <= 680 ? 3 : 6,
      "Mobile home shows at most three project cards",
    );
    await page.screenshot({
      path: path.join(temp, `home-${width}.png`),
      fullPage: true,
    });
  }
  await home
    .getByRole("button", { name: "Bygg nytt prosjekt", exact: true })
    .click();
  await dialog
    .getByRole("button", {
      name: "Forkast kladd og start på nytt",
      exact: true,
    })
    .click();
  eq(
    await dialog.getByLabel("Prosjektnavn", { exact: true }).isVisible(),
    false,
    "A separate explicit confirmation protects the draft",
  );
  await dialog
    .getByRole("button", { name: "Ja, forkast kladden", exact: true })
    .click();
  eq(
    await dialog.getByLabel("Prosjektnavn", { exact: true }).inputValue(),
    "",
    "Explicit discard starts a clean wizard",
  );
  await dialog.press("Escape");
  eq(
    await home
      .getByRole("button", { name: "Fortsett prosjektkladd", exact: true })
      .count(),
    0,
  );
  // Regression: the former 16-building fixture covered the saved overview,
  // not the wizard. Exercise the real wizard with loaded photos at every step.
  await page.getByRole("button", { name: "Bygg nytt prosjekt", exact: true }).click();
  await dialog.getByLabel("Prosjektnavn", { exact: true }).fill("Kun lokal layoutprøve");
  for (const type of ["Flerfamiliehus", "Enebolig", "Tomannsbolig", "Leilighetsbygg"]) {
    await dialog.getByRole("button", { name: new RegExp("^" + type + " ") }).click();
    await dialog.getByRole("button", { name: "Neste", exact: true }).click();
    await dialog.getByLabel("Antall bygg", { exact: true }).fill("16");
    for (const step of [1, 2, 3]) {
      for (const width of [320, 390, 768, 1024, 1366, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await dialog.locator("img").evaluateAll(images => Promise.all(images.map(img => img.decode())));
        const layout = await dialog.evaluate(d => {
          const body = d.querySelector(".bolig-builder-body");
          const photos = [...d.querySelectorAll(".bolig-builder-building-head > img, .bolig-builder-review article > img")];
          return {
            bodyFits: body.scrollWidth <= body.clientWidth + 1,
            photosFit: photos.length > 0 && photos.every(img => {
              const r = img.getBoundingClientRect(), p = img.parentElement.getBoundingClientRect();
              return img.naturalWidth > 0 && r.width <= 131 && r.height <= 76 && r.left >= p.left && r.right <= p.right;
            }),
          };
        });
        eq(layout.bodyFits, true, `${type}: step ${step}, ${width}px has no inner horizontal overflow`);
        eq(layout.photosFit, true, `${type}: step ${step}, ${width}px photos stay compact and inside their row`);
        if (type === "Flerfamiliehus" && width === 1366)
          await page.screenshot({ path: path.join(temp, `sixteen-wizard-step-${step}.png`) });
      }
      if (step < 3) await dialog.getByRole("button", { name: "Neste", exact: true }).click();
    }
    for (let step = 3; step > 0; step--)
      await dialog.getByRole("button", { name: "Tilbake", exact: true }).click();
  }
  await dialog.press("Escape");
  eq(errors, []);
  console.log(
    `PASS builder/browser: ${checks} assertions; atomic-attempt recovery, house floors, saved draft, close/Escape/focus, 400/480/500 households, last-building search, scoped rendering and 320/390/1024/1366px. Internal visual evidence: ${temp}`,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
}
