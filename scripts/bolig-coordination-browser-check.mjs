import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = process.cwd(),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-coordination-"));
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React,{useState} from '${root}/node_modules/react/index.js';import{createRoot}from'${root}/node_modules/react-dom/client.js';import Progress from '${root}/src/modules/bolig/BoligProgress.jsx';import Overview from '${root}/src/modules/bolig/BoligBuildingOverview.jsx';import Resident from '${root}/src/modules/bolig/BoligPortalPage.jsx';import Tasks from '${root}/src/modules/bolig/BoligUnitTasks.jsx';import {UnitDialogueIndicator} from '${root}/src/modules/bolig/BoligDialogue.jsx';import '${root}/src/style.css';import '${root}/src/modules/bolig/bolig.css';import '${root}/src/modules/bolig/boligResident.css';
const ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true};const record={root:{id:'root',title:'Stammeprosjekt',revision:1},blocks:[{id:'b',name:'Bygg A',building_type:'apartment'}],entrances:[{id:'e',block_id:'b',address:'Plangata 1',counts:[2,2]}],units:[1,2,3,4].map((n)=>({id:'u'+n,root_id:'root',entrance_id:'e',floor:n>2?2:1,number:n===1?'H0101':n===2?'H0102':n===3?'H0201':'H0202',contact_name:'QA beboer',contact_email:'qa@example.invalid'}))};const units=record.units.map(u=>({...u,address:'Plangata 1',block_id:'b',block_name:'Bygg A',position:1}));
const state={context:ctx,root_id:'root',unit_id:null,revision:1,tasks:units.slice(0,2).flatMap((u,n)=>['Rørlegger','Elektro','Montering'].map((title,i)=>({id:u.id+'-'+i,unit_id:u.id,unit_number:u.number,address:u.address,title,owner_id:'qa',owner_name:'QA leder',owner_active:true,planned_start:i===2?'2026-10-27':'2026-10-26',planned_end:i===2?'2026-10-27':'2026-10-26',status:'planned',active:true,required:true}))).reverse(),units,rooms:[],members:[{id:'qa',name:'QA leder'}],notices:[],history:[],deliveries:[],mail_enabled:false};
const coord={context:ctx,root_id:'root',revision:0,groups:[{id:'g',name:'Stamme A',unit_ids:['u1','u3']}],units:units.map(u=>({...u,override:null,enabled:true})),members:state.members,inbox:[{unit_id:'u1',number:'H0101',address:'Plangata 1',unread:1,pending:1,latest_at:'2026-10-23T10:00:00Z',preview:'Kan vi avtale tilgang?',through_id:'msg',enabled:true}],messaging_enabled:true,manager_id:'qa'};
const portal={context:ctx,root_id:'root',unit_id:'u1',revision:0,contact:{name:'QA beboer',email:'qa@example.invalid'},components:[],options:[],packages:[],portal:{id:'p',revoked:false,expires_at:'2026-12-01T12:00:00Z',menu_version:1,offers_draft:[],documents:[],messaging_enabled:true,message_mail_enabled:false,events:[{id:'msg',kind:'message',sender:'resident',body:'Kan vi avtale tilgang?',created_at:'2026-10-23T10:00:00Z'}]}};
window.__calls=[];window.__deny=false;window.__lost=false;const receipts=new Map();window.__client={rpc:async(name,p)=>{window.__calls.push({name,...p});if(window.__deny)return {error:{code:'42501',message:'Tilgangen er tilbakekalt.'}};const action=p.p_action||'get',v=p.p_payload||{};if(name==='bolig_coordination'){if(action==='get')return {data:structuredClone(coord)};if(receipts.has(v.request_id))return {data:structuredClone(receipts.get(v.request_id))};if(v.revision!==coord.revision)return {error:{code:'PT409',message:'Oppsettet er endret. Kladden beholdes.'}};coord.revision++;if(action==='group'){coord.groups=coord.groups.filter(g=>g.id!==v.id);coord.groups.push({id:v.id,name:v.name,unit_ids:v.unit_ids});}if(action==='settings'){coord.messaging_enabled=v.enabled;coord.manager_id=v.manager_id;coord.units.forEach(u=>{if(u.override===null)u.enabled=v.enabled});}if(action==='units')coord.units.filter(u=>v.unit_ids.includes(u.id)).forEach(u=>{u.override=v.mode==='inherit'?null:v.mode==='on';u.enabled=u.override??coord.messaging_enabled;});const out=structuredClone(coord);receipts.set(v.request_id,out);if(window.__lost){window.__lost=false;throw Error('Forbindelsen ble brutt.');}return {data:out};}
if(name==='bolig_progress'){if(action!=='get'){state.revision++;if(action==='batch')for(const item of v.items){if(v.mode==='create'){const u=units.find(u=>u.id===item.unit_id);state.tasks.push({...item,unit_number:u.number,address:u.address,active:true,status:'planned',owner_name:'QA leder',owner_active:true});}else Object.assign(state.tasks.find(t=>t.id===item.id),item);}}return {data:structuredClone(state)};}
if(name==='bolig_resident_portal'){if(action==='read'){portal.portal.events[0].read_at='2026-10-23T11:00:00Z';coord.inbox[0].unread=0;}if(action==='handled'||action==='reply'){portal.portal.events[0].handled_at='2026-10-23T11:00:00Z';coord.inbox=[];}if(action==='reply')portal.portal.events.push({id:'reply',kind:'reply',sender:'manager',body:v.body,created_at:'2026-10-23T11:00:00Z'});if(action!=='get')portal.revision++;portal.portal.messaging_enabled=coord.units[0].enabled;return {data:structuredClone(portal)};}
if(name==='bolig_completion')return {data:{context:ctx,root_id:'root',scope_id:null,rows:[]}};if(name==='bolig_overview')return {data:{context:ctx,root_id:'root',units:units.map(u=>({unit_id:u.id}))}};throw Error(name);}};
const origFetch=window.fetch;window.fetch=(url,p)=>String(url).includes('/rest/v1/rpc/bolig_portal')?Promise.resolve(new Response(JSON.stringify({id:'p',identity:{unit:'H0101',project:'Stammeprosjekt',company:'QA',block:'Bygg A',address:'Plangata 1'},messaging_enabled:coord.units[0].enabled,manager_contact:'leder@example.invalid',offers:[],agreements:[],documents:[],events:portal.portal.events}),{status:200,headers:{'content-type':'application/json'}})):origFetch(url,p);
window.__snapshot=()=>({state:structuredClone(state),coord:structuredClone(coord)});window.__bumpCoord=()=>{coord.revision++;window.dispatchEvent(new Event('focus'));};window.__setOff=()=>{coord.units[0].enabled=false;};window.__reopen=()=>{coord.inbox=[{unit_id:'u1',number:'H0101',address:'Plangata 1',unread:1,pending:1,latest_at:'2026-10-23T11:20:00Z',preview:'Et nytt svar',enabled:true}];window.dispatchEvent(new Event('focus'));};
function App(){const[mode,setMode]=useState('progress'),[q,sq]=useState(''),[u,su]=useState('');window.__mode=setMode;window.__selectUnit=su;return <div data-qa-unit={u} className="bolig-dialog bolig-page" style={{maxWidth:1120,margin:'auto',padding:12}}>{mode==='progress'?<Progress context={ctx} root={record.root}/>:mode==='overview'?<><Overview context={ctx} record={record} unitId={u} onSelect={su} query={q} onQuery={sq}/>{u&&<Tasks unit={record.units.find(x=>x.id===u)} active rooms={<p>Rom</p>} order={<p>Bestilling</p>} quality={<p>Kontroll</p>} portal={<p>QA – Meldinger for valgt bolig</p>} portalIndicator={<UnitDialogueIndicator context={ctx} root={record.root} unit={record.units.find(x=>x.id===u)}/>}/>}</>:<Resident/>}</div>};window.location.hash='portal='+'a'.repeat(64);createRoot(document.getElementById('app')).render(<App/>);
`,
);
let browser, lastPage;
try {
  const built = await build({
    root,
    configFile: false,
    logLevel: "silent",
    plugins: [
      react({ jsxRuntime: "classic" }),
      {
        name: "qa-registry",
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
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.VITE_SUPABASE_URL": '"https://qa.invalid"',
      "import.meta.env.VITE_SUPABASE_ANON_KEY": '"qa"',
    },
    build: {
      write: false,
      minify: false,
      lib: {
        entry: path.join(temp, "entry.jsx"),
        formats: ["iife"],
        name: "CoordinationQA",
        cssFileName: "coordination-qa",
      },
    },
  });
  const out = (Array.isArray(built) ? built[0] : built).output,
    js = out.find((x) => x.type === "chunk" && x.isEntry).code,
    css = out
      .filter((x) => x.type === "asset" && x.fileName.endsWith(".css"))
      .map((x) => x.source)
      .join("\n");
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  for (const width of [1366, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 950 },
      isMobile: width < 500,
      hasTouch: width < 500,
    });
    lastPage = page;
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", (r) =>
      r.fulfill({
        contentType: "text/html",
        body:
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><style>' +
          css +
          "</style><script>" +
          js.replaceAll("</script>", "<\\/script>") +
          "</script>",
      }),
    );
    await page.goto("https://qa.invalid");
    await page.getByRole("region", { name: "Samlet Gantt-skjema" }).waitFor();
    eq(
      (await page.locator(".bolig-gantt-row.summary .bolig-gantt-label button").allTextContents()).map((label) => label.match(/H\d{4}/)?.[0]).join(","),
      "H0101,H0102",
      "Unit groups use natural order even when server tasks arrive reversed",
    );
    eq(
      await page.locator(".bolig-progress-activity-list").getAttribute("open"),
      null,
      "activity cards folded by default",
    );
    eq(
      await page.locator(".bolig-gantt-bar").count(),
      6,
      "all tasks on same Gantt",
    );
    const a = page.getByRole("button", {
        name: "H0101 · Rørlegger · 2026-10-26 til 2026-10-26",
        exact: true,
      }),
      b = page.getByRole("button", {
        name: "H0101 · Elektro · 2026-10-26 til 2026-10-26",
        exact: true,
      });
    eq(
      await a.evaluate((e) => e.style.left),
      await b.evaluate((e) => e.style.left),
      "same-day work shares time axis",
    );
    await page
      .getByLabel("Grupper etter", { exact: true })
      .selectOption("group");
    eq(
      await page.getByRole("button", { name: /Stamme A.*aktiviteter/ }).count(),
      1,
      "explicit group visible",
    );
    await page
      .getByRole("button", { name: "Fold sammen alle", exact: true })
      .click();
    eq(
      await page.locator(".bolig-gantt-bar").count(),
      0,
      "groups fold without deleting tasks",
    );
    await page
      .getByRole("button", { name: "Vis alle aktiviteter", exact: true })
      .click();
    await page
      .getByLabel("Grupper etter", { exact: true })
      .selectOption("unit");
    await a.focus();
    await page.keyboard.press("Alt+ArrowRight");
    eq(
      await page
        .getByRole("button", { name: "Se over datoendringer", exact: true })
        .isEnabled(),
      true,
      "keyboard moves create date draft",
    );
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    eq(
      await page
        .getByRole("button", { name: "Se over datoendringer", exact: true })
        .isVisible(),
      true,
      "focus retains date draft",
    );
    await page
      .getByRole("button", { name: "Se over datoendringer", exact: true })
      .click();
    let dialog = page.getByRole("dialog", {
      name: "Se over datoendringer",
      exact: true,
    });
    eq(await dialog.locator("tbody tr").count(), 1, "review one changed task");
    await dialog
      .getByRole("button", { name: "Forkast datoendringer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Planlegg flere boliger", exact: true })
      .click();
    dialog = page.getByRole("dialog", {
      name: "Planlegg flere boliger",
      exact: true,
    });
    await dialog.getByLabel("Bruk stammegruppe").selectOption("g");
    eq(
      await dialog.getByLabel("Dager mellom boligstarter").inputValue(),
      "0",
      "group defaults simultaneous starts",
    );
    await dialog.getByLabel("Arbeid 1", { exact: true }).fill("Rørstamme");
    await dialog
      .getByRole("button", { name: "Legg til eget arbeid", exact: true })
      .click();
    await dialog.getByLabel("Arbeid 2", { exact: true }).fill("Elektro");
    await dialog
      .getByLabel("Startregel 2", { exact: true })
      .selectOption("same");
    await dialog
      .getByRole("button", { name: "Forhåndsvis planen", exact: true })
      .click();
    eq(
      await dialog.locator("tbody tr").count(),
      4,
      "two apartments and two simultaneous tasks",
    );
    await dialog
      .getByRole("button", { name: "Tilbake til oppsett", exact: true })
      .click();
    await dialog
      .getByText("Lagre eller endre stammegruppe", { exact: true })
      .click();
    await dialog.getByLabel("Navn på stammegruppen").fill("Ny stamme");
    await dialog.getByLabel("Flytt valgte boliger fra andre grupper").check();
    await dialog
      .getByRole("button", { name: "Lagre stammegruppe", exact: true })
      .click();
    await page.waitForFunction(() =>
      window.__snapshot().coord.groups.some((g) => g.name === "Ny stamme"),
    );
    eq(
      await dialog.getByLabel("Arbeid 2", { exact: true }).inputValue(),
      "Elektro",
      "group save preserves plan draft",
    );
    await dialog
      .getByRole("button", { name: "Lukk og behold utkast", exact: true })
      .click();
    if (process.env.BOLIG_COORDINATION_QA)
      await page.screenshot({
        path: process.env.BOLIG_COORDINATION_QA + "/gantt-" + width + ".png",
        fullPage: true,
      });
    await page.evaluate(() => window.__mode("overview"));
    await page
      .getByRole("button", {
        name: "Velg leiligheter til stammegruppe",
        exact: true,
      })
      .click();
    const windows = page.locator("button.bolig-window");
    await windows.filter({ hasText: "H0101" }).click();
    await windows.filter({ hasText: "H0201" }).click();
    eq(
      await windows.filter({ hasText: "H0101" }).getAttribute("aria-pressed"),
      "true",
      "graphic group selection across floors",
    );
    await page
      .getByRole("button", { name: "Lagre valgt stammegruppe", exact: true })
      .click();
    let groupDialog = page.getByRole("dialog", {
      name: "Lagre stammegruppe fra byggbildet",
      exact: true,
    });
    await groupDialog
      .getByLabel("Navn på ny stammegruppe")
      .fill("Stamme fra bygg");
    await groupDialog.getByLabel(/Flytt valgte boliger fra/).check();
    await groupDialog
      .getByRole("button", { name: "Lagre stammegruppe", exact: true })
      .click();
    await groupDialog.waitFor({ state: "hidden" });
    eq(
      await page.evaluate(
        () =>
          window
            .__snapshot()
            .coord.groups.find((g) => g.name === "Stamme fra bygg").unit_ids
            .length,
      ),
      2,
      "graphic selection persists chosen apartments only",
    );

    await page.evaluate(() => window.__selectUnit("u1"));
    const portalTile = page.locator('.bolig-unit-task-card[aria-label="Beboerportal"]');
    const menuBadge = portalTile.locator('.bolig-unit-message-indicator');
    await menuBadge.getByText("1 ulest melding", {exact:true}).waitFor();
    eq(await portalTile.getAttribute("aria-describedby"),"bolig-unit-messages-u1","message count is exposed as the portal card description");
    eq(await page.locator('.bolig-unit-task-card:not([aria-label="Beboerportal"]) .bolig-unit-message-indicator').count(),0,"message marker belongs only on the actual message destination");
    eq(await page.evaluate(()=>window.__calls.filter(c=>c.name==='bolig_resident_portal'&&c.p_action==='read').length),0,"displaying the menu marker does not mark messages read");
    await portalTile.click();
    const taskDialog=page.getByRole("dialog",{name:"Beboerportal",exact:true});
    eq(await taskDialog.getByText("QA – Meldinger for valgt bolig",{exact:true}).isVisible(),true,"marked card opens the existing portal destination");
    await taskDialog.getByRole("button",{name:"Lukk boligens arbeidsområde",exact:true}).click();
    await page.evaluate(()=>window.__selectUnit("u2"));
    await page.locator('[data-qa-unit="u2"]').waitFor();
    eq(await page.locator('.bolig-unit-message-indicator').count(),0,"switching apartments immediately hides the other apartment's unread marker");
    await page.evaluate(()=>window.__selectUnit("u1"));
    await menuBadge.getByText("1 ulest melding",{exact:true}).waitFor();
    eq(await portalTile.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,"message hint wraps within the menu card on mobile and desktop");

    const badge = page.getByRole("button", {
      name: "Meldinger for H0101: 1 uleste",
      exact: true,
    });
    await badge.waitFor();
    eq(await badge.count(), 1, "message badge on actual building window");
    await badge.click();
    dialog = page.getByRole("dialog", {
      name: "H0101 · Meldinger og oppfølging",
      exact: true,
    });
    await dialog
      .getByRole("button", { name: "Marker samtalen som lest", exact: true })
      .click();
    eq(
      await dialog.getByText(/Lest – venter på oppfølging/).count(),
      1,
      "read is distinct from handled",
    );
    await menuBadge.getByText("1 melding til oppfølging",{exact:true}).waitFor({state:"attached"});
    eq(await menuBadge.textContent(),"1 melding til oppfølging","reading changes the menu marker to follow-up without removing the case");
    await dialog
      .getByRole("button", { name: "Marker som behandlet", exact: true })
      .click();
    await dialog
      .getByRole("button", {
        name: "Lukk h0101 · meldinger og oppfølging",
        exact: true,
      })
      .click();
    await page
      .getByText("Ingen ubehandlede beboermeldinger.", { exact: true })
      .waitFor();
    eq(
      await page.locator(".bolig-dialogue-badge").count(),
      0,
      "handled marker removed",
    );
    eq(await menuBadge.count(),0,"handled message removes the marker from the right menu too");
    await page.evaluate(() => window.__reopen());
    await badge.waitFor();
    eq(await badge.count(), 1, "new answer reopens marker");
    await menuBadge.getByText("1 ulest melding",{exact:true}).waitFor();
    eq(await menuBadge.count(),1,"a new resident answer restores the right-menu marker");
    await page.evaluate(()=>{window.__deny=true;window.dispatchEvent(new Event("focus"));});
    await menuBadge.waitFor({state:"hidden"});
    eq(await menuBadge.count(),0,"server access denial removes message information from the menu");
    await page.evaluate(()=>{window.__deny=false;window.dispatchEvent(new Event("focus"));});
    await menuBadge.getByText("1 ulest melding",{exact:true}).waitFor();
    await page
      .getByText("Meldinger av/på · prosjektstandard På", { exact: true })
      .click();
    await page
      .getByLabel("Tillat meldinger som standard i prosjektet")
      .uncheck();
    await page.evaluate(() => window.__bumpCoord());
    await page
      .getByRole("button", {
        name: "Jeg har sett gjennom siste oppsett",
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("button", {
        name: "Lagre prosjektets meldingsoppsett",
        exact: true,
      })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Oppsettet er endret" })
      .waitFor();
    eq(
      await page
        .getByLabel("Tillat meldinger som standard i prosjektet")
        .isChecked(),
      false,
      "conflict retains local setting",
    );
    await page
      .getByRole("button", {
        name: "Jeg har sett gjennom siste oppsett",
        exact: true,
      })
      .click();
    await page.evaluate(() => (window.__lost = true));
    await page
      .getByRole("button", {
        name: "Lagre prosjektets meldingsoppsett",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "Prøv samme meldingsoppsett igjen",
        exact: true,
      })
      .click();
    const settingsCalls = await page.evaluate(() =>
      window.__calls.filter(
        (c) => c.name === "bolig_coordination" && c.p_action === "settings",
      ),
    );
    eq(
      settingsCalls.at(-1).p_payload.request_id,
      settingsCalls.at(-2).p_payload.request_id,
      "lost coordination write reuses exact request ID",
    );

    await page
      .getByText("Meldinger av/på · prosjektstandard Av", { exact: true })
      .waitFor();
    eq(await badge.count(), 1, "switching off keeps pending marker");
    if (process.env.BOLIG_COORDINATION_QA)
      await page.screenshot({
        path: process.env.BOLIG_COORDINATION_QA + "/dialogue-" + width + ".png",
        fullPage: true,
      });
    await page.evaluate(() => {
      window.__setOff();
      window.__mode("resident");
    });
    await page.getByRole("button", { name: "Meldinger", exact: true }).click();
    await page.getByText(/Meldinger er slått av for din bolig/).waitFor();
    eq(
      await page
        .getByRole("button", { name: "Send melding", exact: true })
        .count(),
      0,
      "resident send hidden while off",
    );
    eq(
      await page.getByRole("link", { name: "leder@example.invalid" }).count(),
      1,
      "contact alternative visible",
    );
    eq(errors, [], "no browser errors");
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 2,
      ),
      true,
      "no page-wide mobile overflow",
    );
    await page.close();
  }
  console.log(
    "PASS Bolig coordination: " +
      checks +
      " actual Chromium assertions, desktop/mobile Gantt, parallel tasks, groups, date draft, building message badge, read/handled/reopen, settings and resident off state",
  );
} catch (error) {
  console.log(
    "DIAGNOSTIC",
    await lastPage?.locator(".bolig-gantt-bar").evaluateAll((es) =>
      es.map((e) => ({
        label: e.getAttribute("aria-label"),
        box: e.getBoundingClientRect().toJSON(),
        hidden: !!e.closest("[hidden]"),
      })),
    ),
  );
  await lastPage?.screenshot({
    path: "/tmp/bolig-coordination-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser?.close();
  fs.rmSync(temp, { recursive: true, force: true });
}
