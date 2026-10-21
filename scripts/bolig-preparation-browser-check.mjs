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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-preparation-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Preparation from '${cwd}/src/modules/bolig/BoligPreparation.jsx';
import '${cwd}/src/modules/bolig/bolig.css';
const context={user_id:'qa-user',company_id:'qa-company',role:'manager',enabled:true};
const units=Array.from({length:36},(_,i)=>({id:'u'+i,entrance_id:i<24?'e1':'e2',floor:Math.floor(i%24/4)+1,position:i%4+1,number:'H'+String(Math.floor(i%24/4)+1).padStart(2,'0')+String(i%4+1).padStart(2,'0'),official_number:'',archived:false}));
window.__state={context,root_id:'root',root:{id:'root',revision:1,archived:false},basis:{structure_revision:1,catalog_revision:1,content:'a',templates:'a'},blocks:[{id:'b1',name:'Blokk A',building_type:'apartment',address:'Eksempelgata 10',house_floors:2}],entrances:[{id:'e1',block_id:'b1',address:'Eksempelgata 10A',counts:[4,4,4,4,4,4]},{id:'e2',block_id:'b1',address:'Eksempelgata 10B',counts:[4,4,4]}],units,unit_states:units.map(u=>({unit_id:u.id,rooms:u.id==='u0'?1:0,choice:u.id==='u0'?1:0})),templates:[],packages:[{id:'p1',name:'Bad standard',line_count:3},{id:'p2',name:'Felles boligpakke',line_count:2}]};
window.__calls=[];window.__lost=false;window.__deny=false;window.__delay=0;window.__previewDelay=0;window.__receipts={};
window.__client={rpc:async(name,args)=>{if(name!=='bolig_prepare')throw Error('Unexpected RPC '+name);const {p_action:action,p_payload:payload}=args;window.__calls.push({action,payload:structuredClone(payload)});if(window.__delay)await new Promise(r=>setTimeout(r,window.__delay));if(action==='preview'&&window.__previewDelay)await new Promise(r=>setTimeout(r,window.__previewDelay));if(window.__deny)return{error:{code:'42501',message:'Tilgang tilbakekalt'}};const s=window.__state;if(action==='get')return{data:structuredClone(s)};if(window.__receipts[payload.request_id])return{data:structuredClone(window.__receipts[payload.request_id])};if(JSON.stringify(payload.basis)!==JSON.stringify(s.basis))return{error:{code:'PT409',message:'Grunnlaget er endret'}};let proposal=[];if(payload.kind==='numbering')proposal=payload.data.rows.map(r=>({...r,before:s.units.find(u=>u.id===r.id).number,status:'ready'}));else if(payload.kind==='building')proposal=[{id:'b1',name:payload.data.name,status:'ready',added:0,hidden:4,restored:0}];else proposal=(payload.data.unit_ids||[]).map(id=>({id,number:s.units.find(u=>u.id===id).number,status:id==='u0'&&!payload.data.include_existing?'skipped':'ready',reason:id==='u0'&&!payload.data.include_existing?'Har egne rom eller boligvalg. Beholdes.':'',new_rooms:payload.data.definition.rooms.length,new_packages:1,goods_count:3}));let result={context,root_id:'root',basis:s.basis,proposal,affected:0};if(action!=='preview'){if(action==='template_save'){const {id,name,definition}=payload.data;const index=s.templates.findIndex(t=>t.id===id);const t={id,name,definition};if(index<0)s.templates.push(t);else s.templates[index]=t;s.basis={...s.basis,templates:crypto.randomUUID()};result.affected=1;}else if(payload.kind==='numbering'){for(const r of payload.data.rows)Object.assign(s.units.find(u=>u.id===r.id),r);s.basis={...s.basis,structure_revision:s.basis.structure_revision+1};result.affected=proposal.length;}else{result.affected=proposal.filter(p=>p.status==='ready').length;s.basis={...s.basis,content:crypto.randomUUID()};}result.basis=s.basis;result.receipt={request_id:payload.request_id,affected:result.affected};window.__receipts[payload.request_id]=structuredClone(result);if(window.__lost){window.__lost=false;throw Error('Forbindelsen ble brutt');}}return{data:structuredClone(result)};}};
function App(){const [role,setRole]=useState('manager'),[mounted,setMounted]=useState(true);window.__role=setRole;window.__mount=setMounted;return <main className="bolig-page"><h1>Oppsett av boligprosjektet</h1>{mounted&&<Preparation context={{...context,role}} root={window.__state.root} onChanged={()=>window.__changed=(window.__changed||0)+1}/>}</main>};createRoot(document.getElementById('app')).render(<App/>);
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
    logLevel: "silent",
    define: { "process.env.NODE_ENV": '"production"' },
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
        name: "QA",
        fileName: () => "app.js",
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
      res.setHeader("content-type", "text/javascript");
      res.end(script);
    } else if (req.url === "/app.css") {
      res.setHeader("content-type", "text/css");
      res.end(css);
    } else
      res.end(
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:15px Arial}button,input,select{font:inherit}button{cursor:pointer}</style><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script></html>',
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
    dialog = () => page.getByRole("dialog");
  await page
    .getByRole("region", { name: "Klargjør boligprosjektet" })
    .waitFor();
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      true,
      "No page overflow " + width,
    );
  }
  await page
    .getByRole("button", {
      name: "Nummerer boliger Nummerforslag og samlet redigering",
    })
    .click();
  await dialog().getByLabel("Bygg", { exact: true }).waitFor();
  eq(
    await dialog().locator(".bolig-preparation-list article").count(),
    12,
    "Only one page of units rendered",
  );
  await dialog().getByLabel("Oppgang", { exact: true }).selectOption("e1");
  await dialog().getByLabel("Prefiks", { exact: true }).fill("A-");
  await btn("Lag nummerforslag for 24 boliger").click();
  eq(
    await dialog()
      .getByLabel("Leilighetsnummer H0101 Eksempelgata 10A", { exact: true })
      .inputValue(),
    "A-101",
  );
  await dialog()
    .getByLabel("Offisielt bolignummer H0101 Eksempelgata 10A", { exact: true })
    .fill("H0101");
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  eq(
    await dialog()
      .getByLabel("Leilighetsnummer H0101 Eksempelgata 10A", { exact: true })
      .inputValue(),
    "A-101",
    "Focus keeps draft",
  );
  await btn("Lukk og behold kladd").click();
  await page
    .getByRole("button", {
      name: "Rediger bygg Navn, adresser og boligfordeling",
    })
    .click();
  await dialog().getByLabel("Velg bygg").selectOption("b1");
  await dialog().getByLabel("Byggnavn").fill("Blokk Nord");
  await btn("Lukk og behold kladd").click();
  await page
    .getByRole("button", {
      name: "Nummerer boliger Nummerforslag og samlet redigering",
    })
    .click();
  await dialog().getByLabel("Bygg", { exact: true }).waitFor();
  eq(
    await dialog()
      .getByLabel("Leilighetsnummer H0101 Eksempelgata 10A", { exact: true })
      .inputValue(),
    "A-101",
    "Number draft survives another task",
  );
  await btn("Forhåndsvis endringer").click();
  await page
    .getByRole("region", { name: "Forhåndsvisning av klargjøring" })
    .waitFor();
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.action === "save").length,
    ),
    0,
    "Preview does not save",
  );
  eq(await page.locator('.bolig-preparation-preview-list article b').first().textContent(), 'A-101', 'Preview keeps natural unit order after editing a row');
  eq(await page.locator('.bolig-preparation-preview-list article').first().textContent().then(text => text.includes('Eksempelgata 10A')), true, 'Preview identifies the entrance');
  await page.evaluate(() => (window.__lost = true));
  await btn("Bekreft og lagre").click();
  await btn("Kontroller lagringen").waitFor();
  eq(
    await btn("Forhåndsvis endringer").isEnabled(),
    false,
    "Unknown write blocks new attempt",
  );
  await btn("Lukk og behold kladd").click();
  await page
    .getByRole("button", {
      name: "Rom og pakker til flere boliger Gjenbruk rommaler og grunnpakker",
    })
    .click();
  await btn("Kontroller lagringen").waitFor();
  eq(
    await dialog()
      .getByRole("heading", { name: "Nummerer boliger" })
      .isVisible(),
    true,
    "Pending receipt restored across task switch",
  );
  await btn("Kontroller lagringen").click();
  await page.getByText(/Lagret\. 24 boliger oppdatert/).waitFor();
  eq(
    await page.evaluate(() => {
      const calls = window.__calls.filter((c) => c.action === "save");
      return calls[0].payload.request_id === calls[1].payload.request_id;
    }),
    true,
    "Lost response replay uses same request ID",
  );
  await btn("Lukk og behold kladd").click();
  await page
    .getByRole("button", {
      name: "Rediger bygg Navn, adresser og boligfordeling",
    })
    .click();
  await dialog().getByLabel("Byggnavn").waitFor();
  eq(
    await dialog().getByLabel("Byggnavn").inputValue(),
    "Blokk Nord",
    "Independent building draft retained",
  );
  eq(
    await btn("Forhåndsvis endringer").isEnabled(),
    false,
    "Stale draft requires explicit rebase",
  );
  await btn("Se over og bruk siste grunnlag").click();
  await btn("Forhåndsvis endringer").click();
  await page.getByText("0 nye · 4 skjules · 0 gjenopprettes").waitFor();
  checks++;
  await btn("Lukk og behold kladd").click();
  await page
    .getByRole("button", {
      name: "Rom og pakker til flere boliger Gjenbruk rommaler og grunnpakker",
    })
    .click();
  await btn("Ny rommal").click();
  await dialog().getByLabel("Navn på rommal").fill("Standard 3-roms");
  await dialog().getByLabel("Fellespakke for boligen").selectOption("p2");
  await dialog().locator("summary").filter({ hasText: "Bad 1" }).click();
  await dialog().getByLabel("Rompakke", { exact: true }).selectOption("p1");
  await btn("Legg til rom i malen").click();
  await dialog().getByLabel("Romnavn", { exact: true }).last().fill("Vaskerom");
  await dialog()
    .getByLabel("Romtype", { exact: true })
    .last()
    .selectOption("laundry");
  await btn("Lagre rommal").click();
  await page
    .getByText(
      "Rommalen er lagret i prosjektet. Velg malen for å tildele den til boliger.",
    )
    .waitFor();
  eq(await page.evaluate(() => window.__state.templates.length), 1);
  await dialog()
    .getByLabel("Prosjektets rommaler")
    .selectOption({ label: "Standard 3-roms" });
  await dialog().getByLabel("Oppgang", { exact: true }).selectOption("e1");
  await btn("Velg alle 24 treff").click();
  await btn("Forhåndsvis endringer").click();
  await page.getByText("Har egne rom eller boligvalg. Beholdes.").waitFor();
  checks++;
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await dialog().evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      true,
      "Dialog no horizontal overflow " + width,
    );
    await page.screenshot({ path: "/tmp/bolig-preparation-" + width + ".png" });
  }
  await dialog()
    .getByRole("checkbox", {
      name: "Legg også til manglende rom og pakker i boliger med innhold",
    })
    .check();
  eq(
    await page
      .getByRole("region", { name: "Forhåndsvisning av klargjøring" })
      .count(),
    0,
    "Edit invalidates preview",
  );
  await btn("Forhåndsvis endringer").click();
  await btn("Bekreft og lagre").click();
  await page.getByText(/Lagret\. 24 boliger oppdatert/).waitFor();
  checks++;
  await btn("Lukk og behold kladd").click();
  await page
    .getByRole("button", {
      name: "Rom og pakker til flere boliger Gjenbruk rommaler og grunnpakker",
    })
    .click();
  await btn("Ny rommal").click();
  await dialog().getByLabel("Navn på rommal").fill("Usendt mal");
  await dialog().getByLabel("Oppgang", { exact: true }).selectOption("e1");
  await btn("Velg alle 24 treff").click();
  await page.evaluate(
    () =>
      (window.__state.basis = {
        ...window.__state.basis,
        content: "other-user",
      }),
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await btn("Se over og bruk siste grunnlag").waitFor();
  eq(
    await dialog().getByLabel("Navn på rommal").inputValue(),
    "Usendt mal",
    "Stale server read preserves unsent text",
  );
  await btn("Se over og bruk siste grunnlag").click();
  await page.evaluate(() => (window.__previewDelay = 300));
  await btn("Forhåndsvis endringer").click();
  await dialog().getByLabel("Navn på rommal").waitFor();
  await btn("Lukk og behold kladd").click();
  await page.evaluate(() => (window.__previewDelay = 0));
  eq(await dialog().count(), 0, "Closed dialog stays closed");
  await page
    .getByRole("button", {
      name: "Rom og pakker til flere boliger Gjenbruk rommaler og grunnpakker",
    })
    .click();
  await dialog().getByLabel("Navn på rommal").waitFor();
  eq(await dialog().getByLabel("Navn på rommal").inputValue(), "Usendt mal");
  await page.evaluate(() => {
    window.__deny = true;
    window.dispatchEvent(new Event("focus"));
  });
  await dialog().waitFor({ state: "hidden" });
  checks++;
  await page.evaluate(() => window.__role("reader"));
  eq(
    await page
      .getByRole("region", { name: "Klargjør boligprosjektet" })
      .count(),
    0,
    "Revoked role hides preparation",
  );
  eq(errors, [], "No browser errors");
  console.log(
    "PASS bolig preparation Chromium: " +
      checks +
      " assertions; bulk numbering, building edits, templates, targets, preview, replay, stale basis, drafts, role gates and 320/390/1024/1366 px.",
  );
} catch (error) {
  const p = browser?.contexts()[0]?.pages()[0];
  if (p) {
    console.error(await p.locator("body").innerText());
    await p.screenshot({ path: "/tmp/bolig-preparation-failure.png" });
  }
  throw error;
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
  fs.rmSync(temp, { recursive: true, force: true });
}
