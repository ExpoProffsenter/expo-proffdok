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
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-followup-ui-"));
fs.writeFileSync(
  path.join(tmp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Followup from '${cwd}/src/modules/bolig/BoligCaseFollowup.jsx';import Print from '${cwd}/src/modules/bolig/BoligNoticePrint.jsx';import '${cwd}/src/style.css';import '${cwd}/src/modules/bolig/bolig.css';import '${cwd}/src/modules/bolig/boligProgress.css';
const ctx={user_id:'qa',company_id:'firm',enabled:true,role:'manager'},source={id:'case',scope_id:'unit',scope_title:'H0101',title:'Rosett etterjusteres'},root={id:'root',title:'Pilotprosjekt'};
let data={context:ctx,root_id:'root',scope_id:'unit',basis:'b1',units:[{id:'unit',number:'H0101',address:'Demoparken 101',block_id:'block'}],members:[{id:'qa',name:'QA Prosjektleder'},{id:'other',name:'QA Montør'}],tasks:[],links:[],mail_enabled:false};let planRevision=20;const plan=unit=>({...structuredClone(data),unit_id:unit,revision:planRevision,rooms:[],notices:[],deliveries:[],history:[],context:{...ctx,role:window.__role}});const receipts=new Map();window.__calls=[];window.__lost=false;window.__hold=false;window.__snapshot=()=>structuredClone(data);
window.__client={rpc:async(name,p)=>{window.__calls.push({name,...structuredClone(p)});if(p.p_company_id!=='firm')return {error:{code:'42501',message:'Prosjektet tilhører et annet firma'}};if(window.__hold)await new Promise(r=>window.__release=r);if(name==='bolig_progress'){
 if(window.__progressDeny)return {error:{code:'42501',message:'Tilgangen til aktiviteten er tilbakekalt'}};
 if(p.p_action==='get')return {data:plan(p.p_unit_id)};
 const v=p.p_payload;if(receipts.has(v.request_id))return {data:structuredClone(receipts.get(v.request_id))};
 if(v.revision!==planRevision)return {error:{code:'PT409',message:'Planen er endret. Se over siste grunnlag.'}};
 const i=data.tasks.findIndex(t=>t.id===v.id);if(i<0)return {error:{code:'42501',message:'Ukjent aktivitet'}};
 planRevision++;data.tasks[i]={...data.tasks[i],...v,revision:data.tasks[i].revision+1,owner_name:v.owner_id==='other'?'QA Montør':'QA Prosjektleder'};
 if(p.p_action==='archive')data.tasks[i].archived=true;
 const result=plan(p.p_unit_id);receipts.set(v.request_id,structuredClone(result));
 if(window.__lost){window.__lost=false;throw Error('Forbindelsen ble brutt etter aktivitetslagring.');}return {data:result};}
if(p.p_action==='get')return {data:structuredClone({...data,context:{...ctx,company_id:p.p_company_id,role:window.__role}})};const v=p.p_payload;if(receipts.has(v.request_id))return {data:structuredClone(receipts.get(v.request_id))};if(v.basis!==data.basis)return {error:{code:'PT409',message:'Grunnlaget er endret. Kladden beholdes.'}};data.tasks.push({id:v.task_id,title:v.title,owner_id:v.owner_id,owner_name:v.owner_id==='other'?'QA Montør':'QA Prosjektleder',unit_id:v.unit_id,unit_number:'H0101',planned_start:v.planned_start,planned_end:v.planned_end,status:'planned',active:true,archived:false,revision:1,room_id:null,predecessor_id:null,actual_start:null,actual_end:null,required:false,note:'Oppfølging'});data.links.push({case_id:'case',task_id:v.task_id,source});data.basis+='x';receipts.set(v.request_id,structuredClone(data));if(window.__lost){window.__lost=false;throw Error('Forbindelsen ble brutt. Prøv lagringen igjen.');}return {data:structuredClone(data)};}};
window.__setArchived=value=>{data.tasks[0].archived=value;window.dispatchEvent(new Event('focus'));};
window.__external=()=>{planRevision++;data.tasks[0].note='Ny serveropplysning';window.dispatchEvent(new Event('focus'));};
window.__otherDraft=()=>{const key=Object.keys(localStorage).find(k=>k.endsWith('progress-unit'));const v=JSON.parse(localStorage.getItem(key));const t={...data.tasks[0],id:'other-task',title:'Uferdig arbeid på en annen aktivitet'};data.tasks.push(t);v.editor={...t,revision:planRevision};localStorage.setItem(key,JSON.stringify(v));};
const app=createRoot(document.getElementById('app'));window.__role='manager';window.__show=(company='firm',role='manager',kind='followup')=>{window.__role=role;app.render(<main data-qa-company={company} data-qa-role={role} className='bolig-dialog bolig-page' style={{position:'static',display:'block',maxWidth:900}}>{kind==='print'?<Print key={company+role+kind} context={{...ctx,company_id:company,role}} root={root} notice={{id:'n',current:true,valid:false}} onClose={()=>app.render(<p>Lukket</p>)}/>:<Followup key={company+role+kind} context={{...ctx,company_id:company,role}} root={root} scopeId='unit' source={source} onClose={()=>app.render(<p>Lukket</p>)}/>}</main>);};window.__show();
`,
);
let server,
  browser,
  page,
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
        entry: path.join(tmp, "entry.jsx"),
        formats: ["iife"],
        name: "QA",
        cssFileName: "qa",
      },
    },
  });
  const out = (Array.isArray(result) ? result[0] : result).output,
    js = out.find((x) => x.type === "chunk").code,
    css = out
      .filter((x) => x.type === "asset" && x.fileName.endsWith(".css"))
      .map((x) => x.source)
      .join("\n");
  server = http.createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("content-type", "text/javascript");
      res.end(js);
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
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ["--no-sandbox"],
  });
  page = await browser.newPage({ viewport: { width: 1366, height: 1000 } });
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);
  const field = (n) => page.getByLabel(n, { exact: true }),
    button = (n) => page.getByRole("button", { name: n, exact: true });
  await field("Arbeid").waitFor();
  await field("Arbeid").fill("Etterjuster rosett uten å lukke avvik");
  await field("Ansvarlig").selectOption("other");
  await field("Planlagt start").fill("2026-10-29");
  await field("Frist").fill("2026-10-30");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await field("Arbeid").inputValue(),
    "Etterjuster rosett uten å lukke avvik",
    "Focus retains unsent work",
  );
  await page.getByRole("button", { name: /^Lukk / }).click();
  await page.evaluate(() => window.__show());
  await field("Arbeid").waitFor();
  eq(
    await field("Frist").inputValue(),
    "2026-10-30",
    "Close and reopen retain deadline",
  );
  eq(await field("Ansvarlig").inputValue(), "other", "Owner retained");
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 1000 });
    eq(
      await page
        .locator("dialog")
        .evaluate((d) => d.scrollWidth <= d.clientWidth + 2),
      true,
      "Dialog fits " + width,
    );
  }
  await page.screenshot({
    path: "/tmp/bolig-followup-mobile.png",
    fullPage: true,
  });
  await page.evaluate(() => (window.__lost = true));
  await button("Lagre oppfølging").click();
  await page.getByRole("alert").waitFor();
  eq(
    (await page.evaluate(() => window.__snapshot())).tasks.length,
    1,
    "Lost reply committed one actual task",
  );
  await button("Lagre oppfølging").click();
  await page.getByText("Lukket", { exact: true }).waitFor();
  const writes = await page.evaluate(() =>
    window.__calls.filter((c) => c.p_action !== "get"),
  );
  eq(writes.length, 2, "Retry was sent");
  eq(
    writes[0].p_payload,
    writes[1].p_payload,
    "Exact same persisted request and activity ID on retry",
  );
  await page.evaluate(() => window.__show());
  await page
    .getByRole("heading", {
      name: "Etterjuster rosett uten å lukke avvik",
      exact: true,
    })
    .waitFor();
  eq(
    (await page.evaluate(() => window.__snapshot())).tasks.length,
    1,
    "Reopen shows linked activity without duplicate task",
  );
  eq(
    await button("Lagre oppfølging").count(),
    0,
    "Linked activity is read from progress engine",
  );
  await button("Åpne aktivitet").click();
  const editor = () =>
    page.getByRole("dialog", {
      name: "Aktivitet og faktisk fremdrift",
      exact: true,
    });
  await editor().getByLabel("Arbeid", { exact: true }).waitFor();
  await editor().getByLabel("Ansvarlig", { exact: true }).selectOption("qa");
  await editor()
    .getByLabel("Planlagt slutt", { exact: true })
    .fill("2026-11-02");
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  eq(
    await editor().getByLabel("Planlagt slutt", { exact: true }).inputValue(),
    "2026-11-02",
    "Direct editor preserves draft on focus/visibility",
  );
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 1000 });
    eq(
      await editor().evaluate((d) => d.scrollWidth <= d.clientWidth + 2),
      true,
      "Shared task editor fits " + width,
    );
  }
  await editor()
    .getByRole("button", { name: "Lukk og behold utkast", exact: true })
    .click();
  await button("Åpne aktivitet").click();
  eq(
    await editor().getByLabel("Planlagt slutt", { exact: true }).inputValue(),
    "2026-11-02",
    "Returning to source retains same activity draft",
  );
  await page.evaluate(() => (window.__lost = true));
  await editor()
    .getByRole("button", { name: "Lagre endringer", exact: true })
    .click();
  await editor().getByRole("alert").waitFor();
  eq(
    (await page.evaluate(() => window.__snapshot())).tasks.length,
    1,
    "Update does not create another activity",
  );
  await editor()
    .getByRole("button", { name: "Prøv samme lagring igjen", exact: true })
    .click();
  await button("Åpne aktivitet").waitFor();
  eq(await editor().count(), 0, "Confirmed save returns to the same case");
  const updates = await page.evaluate(() =>
    window.__calls.filter(
      (c) => c.name === "bolig_progress" && c.p_action === "save",
    ),
  );
  eq(updates.length, 2);
  eq(
    updates[0].p_payload,
    updates[1].p_payload,
    "Direct editor retries exact saved request",
  );
  eq(
    updates[0].p_payload.revision,
    20,
    "Use plan revision, not independent task revision 1",
  );
  eq(
    (await page.evaluate(() => window.__snapshot())).tasks[0].owner_id,
    "qa",
    "Responsible person updated in existing plan",
  );
  await page.getByText(/QA Prosjektleder · 29.10.2026 – 02.11.2026/).waitFor();
  checks++;
  eq(
    (await page.evaluate(() => window.__snapshot())).links.length,
    1,
    "Source link is unchanged",
  );
  await button("Åpne aktivitet").click();
  await editor()
    .getByLabel("Arbeid", { exact: true })
    .fill("Behold denne lokale beskrivelsen");
  await page.evaluate(() => window.__external());
  await editor()
    .getByRole("button", {
      name: "Se over og bruk siste grunnlag",
      exact: true,
    })
    .waitFor();
  eq(
    await editor().getByLabel("Arbeid", { exact: true }).inputValue(),
    "Behold denne lokale beskrivelsen",
    "Fresh plan never overwrites unsent draft",
  );
  eq(
    await editor()
      .getByText("Sist lagret arbeidsnotat: Ny serveropplysning", {
        exact: true,
      })
      .isVisible(),
    true,
    "Review includes changed server note",
  );
  eq(
    await editor()
      .getByRole("button", { name: "Lagre endringer", exact: true })
      .isDisabled(),
    true,
    "Changed plan requires explicit review",
  );
  await editor()
    .getByRole("button", {
      name: "Se over og bruk siste grunnlag",
      exact: true,
    })
    .click();
  await editor()
    .getByRole("button", { name: "Lagre endringer", exact: true })
    .click();
  await button("Åpne aktivitet").waitFor();
  eq(
    (await page.evaluate(() => window.__snapshot())).tasks[0].title,
    "Behold denne lokale beskrivelsen",
  );
  // A different saved activity draft must be preserved until an explicit choice.
  await page.evaluate(() => window.__otherDraft());
  await button("Åpne aktivitet").click();
  const choice = page.getByRole("dialog", {
    name: "Du har et aktivitetsutkast",
    exact: true,
  });
  await choice.waitFor();
  eq(
    await choice.getByText(/Uferdig arbeid på en annen aktivitet/).isVisible(),
    true,
    "Another activity draft is named before replacement",
  );
  await choice
    .getByRole("button", { name: "Fortsett lagret utkast", exact: true })
    .click();
  eq(
    await editor().getByLabel("Arbeid", { exact: true }).inputValue(),
    "Uferdig arbeid på en annen aktivitet",
  );
  await editor()
    .getByRole("button", { name: "Lukk og behold utkast", exact: true })
    .click();
  await button("Åpne aktivitet").click();
  await choice
    .getByRole("button", {
      name: "Forkast utkast og åpne valgt aktivitet",
      exact: true,
    })
    .click();
  eq(
    await editor().getByLabel("Arbeid", { exact: true }).inputValue(),
    "Behold denne lokale beskrivelsen",
    "Explicit replacement opens requested task only",
  );
  await editor().screenshot({ path: "/tmp/bolig-direct-activity-desktop.png" });
  await page.setViewportSize({ width: 390, height: 900 });
  await editor().screenshot({ path: "/tmp/bolig-direct-activity-mobile.png" });
  await editor()
    .getByRole("button", { name: "Lukk og behold utkast", exact: true })
    .click();
  await page.evaluate(() => window.__show("firm", "reader"));
  await page.waitForFunction(
    () => document.querySelector("main")?.dataset.qaRole === "reader",
  );
  await page
    .getByRole("heading", {
      name: "Behold denne lokale beskrivelsen",
      exact: true,
    })
    .waitFor();
  eq(
    await button("Åpne aktivitet").count(),
    0,
    "Reader can see linked task but cannot edit",
  );
  await page.evaluate(() => {
    window.__progressDeny = true;
    window.__show("firm", "manager");
  });
  await page.waitForFunction(
    () => document.querySelector("main")?.dataset.qaRole === "manager",
  );
  await button("Åpne aktivitet").click();
  await editor()
    .getByText("Tilgangen til aktiviteten er tilbakekalt", { exact: true })
    .waitFor();
  eq(
    await editor().getByLabel("Arbeid", { exact: true }).count(),
    0,
    "Fresh access denial cannot expose cached task editor",
  );
  await editor()
    .getByRole("button", {
      name: "Lukk aktivitet og faktisk fremdrift",
      exact: true,
    })
    .click();
  await page.evaluate(() => (window.__progressDeny = false));
  await button("Åpne aktivitet").click();
  await editor().getByLabel("Arbeid", { exact: true }).waitFor();
  await page.evaluate(() => window.__setArchived(true));
  await editor()
    .getByText(
      "Aktiviteten er ikke tilgjengelig for redigering. Kontroller tilgang og aktiv tilknytning.",
      { exact: true },
    )
    .waitFor();
  eq(
    await editor().getByLabel("Arbeid", { exact: true }).count(),
    0,
    "Fresh archive closes editable fields and explains the changed state",
  );
  await editor()
    .getByRole("button", { name: "Tilbake til saken", exact: true })
    .click();
  await page.evaluate(() => window.__setArchived(false));
  await button("Åpne aktivitet").waitFor();
  await button("Åpne aktivitet").click();
  await editor()
    .getByRole("button", { name: "Arkiver aktivitet", exact: true })
    .click();
  const archive = page.getByRole("dialog", {
    name: "Arkiver aktivitet",
    exact: true,
  });
  await archive
    .getByLabel("Begrunnelse", { exact: true })
    .fill("Arbeidet er flyttet etter konkret avklaring");
  await page.evaluate(() => (window.__lost = true));
  await archive
    .getByRole("button", { name: "Bekreft arkivering", exact: true })
    .click();
  await archive
    .getByRole("button", { name: "Prøv samme lagring igjen", exact: true })
    .waitFor();
  await archive
    .getByRole("button", { name: "Prøv samme lagring igjen", exact: true })
    .click();
  await page.getByText(/Arkivert/).waitFor();
  eq(
    await button("Åpne aktivitet").count(),
    0,
    "Archived task is read-only after exact recovered archive",
  );
  const archives = await page.evaluate(() =>
    window.__calls.filter(
      (c) => c.name === "bolig_progress" && c.p_action === "archive",
    ),
  );
  eq(archives.length, 2);
  eq(
    archives[0].p_payload,
    archives[1].p_payload,
    "Lost archive receipt remains recoverable after task becomes archived",
  );
  eq(
    (await page.evaluate(() => window.__snapshot())).links.length,
    1,
    "Archiving activity never deletes the source link or closes source",
  );
  await page.evaluate(() => window.__show("firm", "manager", "print"));
  await field("Kontaktperson i prosjektet").fill("DEMO – Prosjektleder");
  await field("Telefon").fill("00 00 00 00");
  await page.getByRole("button", { name: /^Lukk / }).click();
  await page.evaluate(() => window.__show("firm", "manager", "print"));
  await field("Kontaktperson i prosjektet").waitFor();
  eq(
    await field("Telefon").inputValue(),
    "00 00 00 00",
    "Paper notice contact draft survives close",
  );
  eq(
    await page.getByText(/PDF-en merkes/).count(),
    1,
    "Unapproved PDF is clearly a draft",
  );
  await page.getByRole("button", { name: /^Lukk / }).click();
  await page.evaluate(() => {
    window.__hold = true;
    window.__show("firm", "manager");
  });
  await page.getByText("Henter aktiviteter …").waitFor();
  await page.evaluate(() => {
    window.__oldRelease = window.__release;
    window.__show("new-firm", "reader");
  });
  await page.waitForFunction(
    () => document.querySelector("main")?.dataset.qaCompany === "new-firm",
  );
  await page.evaluate(() => {
    window.__hold = false;
    window.__oldRelease?.();
  });
  eq(
    await field("Arbeid").count(),
    0,
    "Old scope draft hidden synchronously after firm/role change",
  );
  eq(
    await page
      .getByText("Etterjuster rosett uten å lukke avvik", { exact: true })
      .count(),
    0,
    "Late old scope response cannot display task",
  );
  eq(errors, [], "No browser runtime errors");
  console.log(
    "PASS Bolig follow-up/notice UI: " +
      checks +
      " assertions; real components, owner/deadline draft, focus/close, mobile layout, committed lost reply/exact retry, no duplicate work, print draft and scope fence.",
  );
} finally {
  await browser?.close();
  if (server) await new Promise((r) => server.close(r));
}
