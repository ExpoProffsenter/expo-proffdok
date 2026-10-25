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
const root = process.cwd(),
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-progress-qa-")),
  entry = path.join(tmp, "entry.jsx");
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
fs.writeFileSync(
  entry,
  `
import React from '${root}/node_modules/react/index.js';import {createRoot} from '${root}/node_modules/react-dom/client.js';import Progress from '${root}/src/modules/bolig/BoligProgress.jsx';import '${root}/src/style.css';import '${root}/src/modules/bolig/bolig.css';
const ctx={user_id:'qa',company_id:'firm',enabled:true,role:'manager'};let state={context:ctx,root_id:'root',unit_id:null,revision:0,tasks:[],units:[{id:'unit',number:'H0101',address:'Plangata 1',block_id:'block',block_name:'Bygg A',entrance_id:'entrance',contact_name:'QA Resident',contact_email:'qa@example.invalid',notice_basis:'b1'}],rooms:[{id:'room',unit_id:'unit',name:'Bad'}],members:[{id:'qa',name:'QA Prosjektleder'}],notices:[],history:[],deliveries:[],mail_enabled:false};const receipts=new Map();window.__calls=[];window.__lost=false;window.__deny=false;window.__conflict=false;
window.__client={rpc(name,p){window.__calls.push(p);if(name==='work_profile_company_profile')return Promise.resolve({data:{companyId:'firm',companyName:'QA Bedrift',phone:'12345678',email:'project@example.invalid'}});return Promise.resolve().then(()=>{if(window.__deny)return {error:{code:'42501',message:'Tilgangen er tilbakekalt.'}};if(p.p_action==='get')return {data:structuredClone({...state,context:{...ctx,role:window.__role||'manager'}})};const v=p.p_payload;if(window.__conflict)return {error:{code:'PT409',message:'Planen er endret. Utkastet er beholdt.'}};if(receipts.has(v.request_id))return {data:structuredClone(receipts.get(v.request_id))};if(p.p_action==='save'&&v.revision!==state.revision)return {error:{code:'PT409',message:'Planrevisjon må brukes, ikke aktivitetens revisjon.'}};state.revision++;
if(p.p_action==='save'){const i=state.tasks.findIndex(t=>t.id===v.id);const t={...v,revision:(state.tasks[i]?.revision||0)+1,active:true,owner_active:true,owner_name:'QA Prosjektleder',room_name:v.room_id?'Bad':null,unit_number:'H0101'};if(i<0)state.tasks.push(t);else state.tasks[i]=t;}
if(p.p_action==='notice')state.notices.unshift({...v,basis:'review-'+state.revision,current:true,valid:false,recipient:'qa@example.invalid',title:state.tasks[0].title,unit_number:'H0101',planned_start:state.tasks[0].planned_start,planned_end:state.tasks[0].planned_end});
if(p.p_action==='resident_notice'){state.notices.forEach(n=>{if(n.group_id===v.replaces)n.withdrawn=true;});v.unit_ids.forEach(u=>state.notices.unshift({...v,id:v.id+'-'+u,group_id:v.id,unit_id:u,basis:'notice-'+state.revision,current:true,valid:v.mode==='publish',digital:v.mode==='publish',paper_ready:v.mode!=='draft',project_contact:v.contact,recipient:'qa@example.invalid',unit_number:'H0101',planned_start:v.start,planned_end:v.end,published_at:v.mode==='publish'?new Date().toISOString():null}));}
if(p.p_action==='approve')state.notices.find(n=>n.id===v.id).valid=true;if(p.p_action==='publish')state.notices.find(n=>n.id===v.id).published_at=new Date().toISOString();
if(p.p_action==='withdraw')state.notices.find(n=>n.id===v.id).withdrawn=true;
const result=structuredClone(state);receipts.set(v.request_id,result);if(window.__lost){window.__lost=false;throw Error('Forbindelsen ble brutt.');}return {data:result};});}};
window.__planRevision=()=>state.revision;window.__audience=()=>{state.units.push({id:'u2',number:'H0201',address:'Plangata 2',block_id:'block',block_name:'Bygg A',entrance_id:'e2',contact_name:'QA To',contact_email:'two@example.invalid',notice_basis:'b2'},{id:'u3',number:'H0101',address:'Plangata 3',block_id:'b3',block_name:'Bygg B',entrance_id:'e3',contact_name:'',contact_email:'',notice_basis:'b3'});};window.__stale=()=>{state.notices.forEach(n=>{n.current=false;n.valid=false;});state.revision++;};
const app=createRoot(document.getElementById('app'));window.__show=(role='manager')=>{window.__role=role;app.render(<div style={{maxWidth:1100,margin:'auto',padding:16}}><Progress key={role} context={{...ctx,role}} root={{id:'root'}}/></div>);};window.__show();
`,
);
let server, browser, page;
try {
  await build({
    configFile: false,
    root: tmp,
    logLevel: "silent",
    plugins: [
      react({ jsxRuntime: "classic" }),
      {
        name: "qa",
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
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      outDir: path.join(tmp, "dist"),
      rollupOptions: { input: entry },
      minify: false,
    },
  });
  const out = path.join(tmp, "dist");
  let js = fs
    .readdirSync(path.join(out, "assets"))
    .find((n) => n.endsWith(".js"));
  const css = fs
    .readdirSync(path.join(out, "assets"))
    .filter((n) => n.endsWith(".css"));
  server = http.createServer((req, res) => {
    if (req.url === "/") {
      res.setHeader("content-type", "text/html");
      res.end(
        '<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
          css
            .map((c) => '<link rel="stylesheet" href="/assets/' + c + '">')
            .join("") +
          '<div id="app"></div><script type="module" src="/assets/' +
          js +
          '"></script></html>',
      );
      return;
    }
    const file = path.join(out, req.url);
    res.setHeader(
      "content-type",
      file.endsWith(".css") ? "text/css" : "text/javascript",
    );
    res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  page = await browser.newPage({
    viewport: { width: 1366, height: 950 },
  });
  page.setDefaultTimeout(7000);
  let errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);
  await page.getByRole("heading", { name: "Fremdrift og varsler" }).waitFor();
  await page
    .getByText("Aktivitetsliste og enkeltaktiviteter", { exact: true })
    .click();
  eq(
    await page.getByText("Start med første aktivitet").isVisible(),
    true,
    "Clear empty state",
  );
  await page.getByRole("button", { name: "Ny aktivitet", exact: true }).click();
  let dialog = page.getByRole("dialog", {
    name: "Aktivitet og faktisk fremdrift",
  });
  await dialog.getByLabel("Arbeid", { exact: true }).fill("Montering på badet");
  await dialog.getByLabel("Bolig", { exact: true }).selectOption("unit");
  await dialog.getByLabel("Rom", { exact: true }).selectOption("room");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await dialog.getByLabel("Arbeid", { exact: true }).inputValue(),
    "Montering på badet",
    "Focus refresh preserves unsent work",
  );
  await dialog.getByRole("button", { name: "Lukk og behold utkast" }).click();
  eq(await page.getByRole("dialog").count(), 0, "Explicit close wins");
  await page.getByRole("button", { name: "Fortsett aktivitetsutkast" }).click();
  eq(
    await dialog.getByLabel("Rom", { exact: true }).inputValue(),
    "room",
    "Reopened draft has room",
  );
  await page.reload();
  await page
    .getByText("Aktivitetsliste og enkeltaktiviteter", { exact: true })
    .click();
  await page.getByRole("button", { name: "Fortsett aktivitetsutkast" }).click();
  dialog = page.getByRole("dialog", { name: "Aktivitet og faktisk fremdrift" });
  eq(
    await dialog.getByLabel("Arbeid", { exact: true }).inputValue(),
    "Montering på badet",
    "Reload preserves local draft before server editor",
  );
  await dialog
    .getByRole("button", { name: "Lagre endringer", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Montering på badet", exact: true })
    .waitFor();
  eq(
    await page.locator(".bolig-progress-task").count(),
    1,
    "Saved single task",
  );
  await page
    .getByRole("button", { name: "Klargjør beboervarsel", exact: true })
    .click();
  dialog = page.getByRole("dialog", { name: "Nytt beboervarsel", exact: true });
  await dialog
    .getByLabel("Melding til beboerne")
    .fill("Vi kommer på mandag. Sørg for tilgang.");
  await dialog.getByLabel("Kontaktperson i prosjektet").pressSequentially("Q");
  eq(
    await dialog.getByLabel("Kontaktperson i prosjektet").isVisible(),
    true,
    "First typed letter keeps contact section open",
  );
  await dialog
    .getByLabel("Kontaktperson i prosjektet")
    .pressSequentially("A Prosjektleder");
  eq(
    await dialog.getByLabel("Kontaktperson i prosjektet").inputValue(),
    "QA Prosjektleder",
    "Native typing preserves complete contact name",
  );
  await dialog.getByText("Kontaktperson på varslet", { exact: true }).click();
  eq(
    await dialog.getByLabel("Kontaktperson i prosjektet").isVisible(),
    false,
    "Contact section can be closed manually",
  );
  await dialog.getByText("Kontaktperson på varslet", { exact: true }).click();
  eq(
    await dialog.getByLabel("Kontaktperson i prosjektet").isVisible(),
    true,
    "Contact section reopens manually",
  );
  await page.screenshot({
    path: "/tmp/bolig-composer-desktop.png",
    fullPage: false,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    eq(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      true,
      "Composer fits mobile " + width,
    );
    await page.screenshot({
      path: "/tmp/bolig-composer-" + width + ".png",
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  eq(
    await dialog
      .getByRole("button", { name: "Publiser til beboerne", exact: true })
      .isEnabled(),
    true,
    "Single explicit publish action available in composer",
  );
  eq(
    (await dialog.innerText()).includes("qa@example.invalid"),
    true,
    "Canonical recipient visible before publication",
  );
  await dialog
    .getByRole("button", { name: "Lagre utkast", exact: true })
    .click();
  await dialog
    .getByText("Utkastet er lagret. Fortsett her når du vil.")
    .waitFor();
  eq(
    await page.evaluate(
      () =>
        window.__calls.filter((p) => p.p_action === "resident_notice").at(-1)
          .p_payload.mode,
    ),
    "draft",
    "Saving draft does not publish",
  );
  await page.evaluate(() => (window.__lost = true));
  await dialog
    .getByRole("button", { name: "Publiser til beboerne", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Prøv samme handling igjen", exact: true })
    .waitFor();
  await dialog
    .getByRole("button", { name: "Prøv samme handling igjen", exact: true })
    .click();
  await dialog.getByText(/Varslet er publisert i de valgte/).waitFor();
  const noticeWrites = await page.evaluate(() =>
    window.__calls.filter((p) => p.p_action === "resident_notice"),
  );
  eq(
    noticeWrites.at(-1).p_payload,
    noticeWrites.at(-2).p_payload,
    "Lost publish response retries exact request without duplicate notice",
  );
  eq(
    await page.evaluate(
      () =>
        window.__calls.filter((p) =>
          ["approve", "publish"].includes(p.p_action),
        ).length,
    ),
    0,
    "No separate approval or publication round trip",
  );
  await dialog
    .getByRole("button", { name: "Lukk og behold utkast", exact: true })
    .click();
  await page.locator("summary").filter({ hasText: "Beboervarsler" }).click();
  eq(
    await page.getByText("Publisert i portal", { exact: true }).isVisible(),
    true,
    "Publication has explicit state",
  );
  await page.evaluate(() => window.__stale());
  await page
    .getByRole("button", { name: "Oppdater status", exact: true })
    .click();
  await page.getByText("Grunnlaget er endret", { exact: true }).waitFor();
  eq(
    await page.getByRole("button", { name: "Lag ny varselutgave" }).isVisible(),
    true,
    "Stale basis points to new edition",
  );
  await page.getByRole("button", { name: "Oppdater aktivitet" }).click();
  dialog = page.getByRole("dialog", { name: "Aktivitet og faktisk fremdrift" });
  await dialog
    .getByLabel("Arbeid", { exact: true })
    .fill("Montering med siste planrevisjon");
  const planRevision = await page.evaluate(() => window.__planRevision());
  await dialog
    .getByRole("button", { name: "Lagre endringer", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Montering med siste planrevisjon",
      exact: true,
    })
    .waitFor();
  eq(
    await page.evaluate(
      () =>
        window.__calls.filter((p) => p.p_action === "save").at(-1).p_payload
          .revision,
    ),
    planRevision,
    "Ordinary editor uses reviewed plan revision after many notice changes",
  );
  await page
    .getByRole("button", { name: "Oppdater aktivitet", exact: true })
    .click();
  await dialog.getByLabel("Arbeid", { exact: true }).fill("Kladd ved konflikt");
  await page.evaluate(() => (window.__conflict = true));
  await dialog.getByRole("button", { name: "Lagre endringer" }).click();
  await dialog.getByRole("alert").waitFor();
  eq(
    await dialog.getByLabel("Arbeid", { exact: true }).inputValue(),
    "Kladd ved konflikt",
    "PT409 preserves editable draft",
  );
  await page.evaluate(() => (window.__conflict = false));
  await page.evaluate(() => (window.__lost = true));
  await dialog.getByRole("button", { name: "Lagre endringer" }).click();
  await page
    .getByRole("button", { name: "Prøv samme lagring igjen" })
    .waitFor({ state: "attached" });
  await dialog.getByRole("button", { name: "Lukk og behold utkast" }).click();
  await page.getByRole("button", { name: "Prøv samme lagring igjen" }).click();
  await page
    .getByRole("heading", { name: "Kladd ved konflikt", exact: true })
    .waitFor();
  eq(
    await page.locator(".bolig-progress-task").count(),
    1,
    "Lost response replay has no duplicate",
  );
  const writes = await page.evaluate(() =>
    window.__calls.filter((p) => p.p_action === "save"),
  );
  eq(
    writes.at(-1).p_payload.request_id,
    writes.at(-2).p_payload.request_id,
    "Replay uses same request ID",
  );
  await page.screenshot({
    path: path.join(tmp, "desktop.png"),
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "No mobile overflow " + width,
    );
    await page.getByRole("button", { name: "Oppdater aktivitet" }).click();
    dialog = page.getByRole("dialog", {
      name: "Aktivitet og faktisk fremdrift",
    });
    eq(await dialog.isVisible(), true, "Mobile editor " + width);
    eq(
      await dialog
        .getByRole("checkbox")
        .evaluate((e) => Math.round(e.getBoundingClientRect().width)),
      18,
      "Checkbox has stable touch visual",
    );
    await page.screenshot({
      path: path.join(tmp, "mobile-" + width + ".png"),
      fullPage: true,
    });
    await dialog.getByRole("button", { name: "Lukk og behold utkast" }).click();
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.evaluate(() => {
    window.__audience();
    window.dispatchEvent(new Event("focus"));
  });
  await page
    .getByRole("button", { name: "Nytt beboervarsel", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog", { name: "Nytt beboervarsel", exact: true });
  await dialog.getByLabel("Hvem gjelder varslet?").selectOption("project");
  eq(
    await dialog
      .getByRole("button", { name: "Publiser til beboerne", exact: true })
      .isEnabled(),
    false,
    "Missing resident contact blocks digital send, not paper",
  );
  eq(
    await dialog
      .getByRole("button", { name: "Last ned PDF / oppslag", exact: true })
      .isEnabled(),
    true,
    "Whole-project paper works without resident email",
  );
  await dialog.getByLabel("Hvem gjelder varslet?").selectOption("block");
  await dialog.getByLabel("Bygg", { exact: true }).selectOption("block");
  eq(
    await dialog
      .getByText("2 boliger valgt · se utvalget", { exact: true })
      .count(),
    1,
    "Building selects both entrances",
  );
  await dialog.getByLabel("Hvem gjelder varslet?").selectOption("entrance");
  await dialog.getByLabel("Oppgang", { exact: true }).selectOption("e2");
  eq(
    await dialog
      .getByText("1 bolig valgt · se utvalget", { exact: true })
      .count(),
    1,
    "Entrance selects exact apartment set",
  );
  await dialog
    .getByLabel("Overskrift", { exact: true })
    .fill("Vannet stenges i oppgangen");
  await dialog
    .getByLabel("Melding til beboerne")
    .fill("Vannet stenges kl. 09–12.");
  await dialog.getByText("Kontaktperson på varslet", { exact: true }).click();
  eq(
    await dialog.getByLabel("Kontaktperson i prosjektet").inputValue(),
    "QA Prosjektleder",
    "Project contact reused without entering twice",
  );
  await dialog
    .getByRole("button", { name: "Lukk og behold utkast", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Nytt beboervarsel", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog", { name: "Nytt beboervarsel", exact: true });
  eq(
    await dialog.getByLabel("Overskrift", { exact: true }).inputValue(),
    "Vannet stenges i oppgangen",
    "Unsent group draft survives close and reopen",
  );
  eq(
    await dialog.getByLabel("Oppgang", { exact: true }).inputValue(),
    "e2",
    "Audience selection survives close",
  );
  await dialog
    .getByRole("button", { name: "Lukk og behold utkast", exact: true })
    .click();
  await page.evaluate(() => window.__show("reader"));
  await page
    .getByText("Aktivitetsliste og enkeltaktiviteter", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ny aktivitet", exact: true })
    .waitFor({ state: "detached" });
  await page.getByRole("heading", { name: "Fremdrift og varsler" }).waitFor();
  eq(
    await page
      .getByRole("button", { name: "Ny aktivitet", exact: true })
      .count(),
    0,
    "Reader has no write UI",
  );
  await page.evaluate(() => {
    window.__deny = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.getByText("Tilgangen er tilbakekalt.", { exact: true }).waitFor();
  eq(
    await page.locator(".bolig-progress-task").count(),
    0,
    "Revocation removes prior content",
  );
  eq(errors, [], "No browser errors");
  console.log(
    "PASS bolig progress Chromium: " +
      checks +
      " assertions; draft/focus/reload, conflict/replay, review/publish, stale plan, scoped readers, revocation and 1366/390/320 px. Screenshots: " +
      tmp,
  );
} catch (e) {
  console.log((await page?.locator("body").innerText())?.slice(-5000));
  await page?.screenshot({
    path: path.join(tmp, "failure.png"),
    fullPage: true,
  });
  console.log("Failure screenshot: " + tmp);
  throw e;
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
