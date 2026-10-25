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
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-handover-"));
fs.writeFileSync(
  path.join(tmp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Review from '${cwd}/src/modules/bolig/BoligHandoverReview.jsx';import Guide from '${cwd}/src/modules/help/BoligStartGuide.jsx';import '${cwd}/src/style.css';import '${cwd}/src/modules/bolig/bolig.css';
const ctx={user_id:'qa',company_id:'firm',role:'manager',enabled:true},root={id:'root',title:'Eksempelprosjekt'};
let data={context:ctx,root_id:'root',scope_id:'unit',revision:0,basis:'b0',cases:[{id:'control',scope_title:'H0101',category:'Kontroll',title:'Påkrevd sjekkliste er ikke fullført',critical:false},{id:'critical',scope_title:'H0101',category:'Avvik',title:'Kritisk avvik: gjennomføring må vurderes',critical:true},{id:'message',scope_title:'H0101',category:'Beboermelding',title:'Ubehandlet beboermelding',critical:false}],assessment:null,record:null,members:[{id:'qa',name:'Eksempel – prosjektleder'}],history:[]};
window.__freshRole=(role)=>{ctx.role=role;window.dispatchEvent(new Event('focus'));};window.__calls=[];window.__fail=false;window.__hold=false;window.__snapshot=()=>structuredClone(data);window.__change=()=>{data.basis+='x';data.cases.push({id:'new'+data.basis,scope_title:'H0102',category:'Aktivitet',title:'Ny uferdig aktivitet',critical:false});window.dispatchEvent(new Event('focus'));};
window.__client={rpc:async(name,args)=>{window.__calls.push(structuredClone(args));if(name==='bolig_handover_followup')return {data:{context:{...ctx,company_id:args.p_company_id},root_id:'root',scope_id:'unit',links:[{case_id:'control',task_id:'followup'}],tasks:[{id:'followup',owner_id:'qa',owner_name:'Eksempel – prosjektleder',planned_end:'2026-10-30'}]}};if(window.__hold)await new Promise(r=>window.__release=r);if(args.p_action==='get')return {data:structuredClone({...data,context:{...ctx,company_id:args.p_company_id}})};const p=args.p_payload;if(window.__fail){window.__fail=false;return {error:{message:'Forbindelsen brutt – prøv samme lagring igjen'}};}
if(p.basis!==data.basis||args.p_revision!==data.revision)return {error:{code:'PT409',message:'Åpne forhold er endret. Kladden beholdes.'}};
if(p.decisions.some(d=>!d.decision||!d.reason||!d.owner_id)||(p.decisions.find(d=>d.id==='critical') && p.decisions.find(d=>d.id==='critical').critical_confirmed!==true))return {error:{message:'Vurder alle forhold, inkludert kritisk bekreftelse.'}};
if(args.p_action==='record'&&p.decisions.some(d=>d.decision==='block'))return {error:{code:'PT409',message:'Et forhold er vurdert som til hinder for overtakelse.'}};
data.revision++;data.assessment={basis:data.basis,by_name:'Eksempel – prosjektleder',decisions:p.decisions.map(d=>({...data.cases.find(c=>c.id===d.id),...d,owner_name:'Eksempel – prosjektleder'}))};if(args.p_action==='record')data.record={date:p.date,reference:p.reference,by_name:'Eksempel – prosjektleder'};data.history.unshift({revision:data.revision,actor_name:'Eksempel – prosjektleder',created_at:'2026-10-23T10:00:00Z',action:args.p_action,snapshot:{assessment:structuredClone(data.assessment),record:structuredClone(data.record)}});return {data:structuredClone(data)};}};
const app=createRoot(document.getElementById('app'));window.__show=(company='firm',role='manager')=>app.render(<main data-qa-company={company} data-qa-role={role} className="bolig-dialog bolig-page" style={{position:'static',display:'block',maxWidth:1000,margin:'auto',minHeight:'100vh'}}><Guide/><Review context={{...ctx,company_id:company,role}} root={root} scopeId="unit"/></main>);window.__show();
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
    } else if (req.url.startsWith("/bolig/")) {
      const f = path.join(cwd, "public", req.url);
      if (fs.existsSync(f)) {
        res.setHeader("content-type", "image/webp");
        res.end(fs.readFileSync(f));
      } else {
        res.statusCode = 404;
        res.end();
      }
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
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);
  const button = (name) => page.getByRole("button", { name, exact: true });
  await button("Vurder åpne forhold og overtakelse").waitFor();
  await button('Registrer overtakelse').click();
  await page.getByLabel('Referanse til gjennomført overtakelsesprotokoll').waitFor();
  eq(await page.getByLabel('Hva vil du lagre?').inputValue(),'record','direct handover action opens actual registration without an intermediate assessment save');
  eq(await page.evaluate(()=>window.__calls.filter(c=>c.p_action!=='get').length),0,'opening registration changes no status');
  await button('Lukk prosjektleders vurdering av overtakelse').click();
  eq(
    await page.getByText("3 åpne forhold", { exact: true }).count(),
    1,
    "Unified case count",
  );
  await page.locator(".bolig-handover-list > summary").click();
  if (process.env.BOLIG_HANDOVER_QA) {
    fs.mkdirSync(process.env.BOLIG_HANDOVER_QA, { recursive: true });
    await page
      .getByRole("region", { name: "Overtakelse og åpne forhold" })
      .screenshot({
        path: process.env.BOLIG_HANDOVER_QA + "/overview-1366.png",
      });
  }
  await button("Vurder åpne forhold og overtakelse").click();
  const dialog = page.getByRole("dialog", {
    name: "Prosjektleders vurdering av overtakelse",
    exact: true,
  });
  await button("Lagre vurdering").click();
  await dialog.waitFor({state:"hidden"});
  eq((await page.evaluate(()=>window.__snapshot())).assessment.decisions.length,0,"Partial assessment is saved without forcing decisions");
  eq((await page.evaluate(()=>window.__snapshot())).record,null,"Partial assessment does not register handover");
  await button("Vurder åpne forhold og overtakelse").click();
  await dialog
    .getByText("Gi flere vanlige forhold samme vurdering", { exact: true })
    .click();
  await dialog
    .getByLabel("Felles begrunnelse", { exact: true })
    .fill("Avtalt videre oppfølging med ansvarlig.");
  await button("Følges opp – bruk på uvurderte i utvalget").click();
  eq(
    await dialog
      .getByText("1 ikke vurdert · 0 vurdert som hinder", { exact: true })
      .count(),
    1,
    "Batch never decides critical cases",
  );
  const critical = dialog.locator(".is-critical");
  await critical.locator("summary").click();
  await critical.getByLabel("Vurdering", { exact: true }).selectOption("block");
  await critical
    .getByLabel("Begrunnelse", { exact: true })
    .fill("Forholdet må vurderes på befaring før overtakelse.");
  await critical.getByLabel("Oppfølgingsansvarlig").selectOption("qa");
  await critical.getByRole("checkbox").check();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  eq(
    await critical.getByLabel("Begrunnelse", { exact: true }).inputValue(),
    "Forholdet må vurderes på befaring før overtakelse.",
    "Focus retains review draft",
  );
  await button("Lukk prosjektleders vurdering av overtakelse").click();
  await button("Vurder åpne forhold og overtakelse").click();
  await dialog.locator(".is-critical summary").click();
  eq(
    await dialog
      .locator(".is-critical")
      .getByLabel("Vurdering", { exact: true })
      .inputValue(),
    "block",
    "Close preserves decisions",
  );
  await button("Lagre vurdering").click();
  await dialog.waitFor({ state: "hidden" });
  eq(
    (await page.evaluate(() => window.__snapshot())).record,
    null,
    "Blocking assessment can be saved separately",
  );
  await button("Vurder åpne forhold og overtakelse").click();
  await dialog.locator(".is-critical summary").click();
  await dialog
    .locator(".is-critical")
    .getByLabel("Vurdering", { exact: true })
    .selectOption("carry");
  await dialog
    .locator(".is-critical")
    .getByLabel("Begrunnelse", { exact: true })
    .fill(
      "Prosjektleder har vurdert forholdet særskilt. Tiltak følges opp uten å ferdigmelde avviket.",
    );
  await dialog.getByLabel("Hva vil du lagre?").selectOption("record");
  await dialog
    .getByLabel("Referanse til gjennomført overtakelsesprotokoll")
    .fill("Eksempel – overtakelsesprotokoll 23.10.2026");
  await dialog
    .getByLabel(
      "Jeg har gjennomgått alle åpne forhold og står for vurderingene ovenfor.",
    )
    .check();
  if (process.env.BOLIG_HANDOVER_QA) {
    fs.mkdirSync(process.env.BOLIG_HANDOVER_QA, { recursive: true });
    await dialog.screenshot({
      path: process.env.BOLIG_HANDOVER_QA + "/review-1366.png",
    });
  }
  await page.evaluate(() => (window.__fail = true));
  await button("Registrer gjennomført overtakelse").click();
  await dialog.getByRole("alert").waitFor();
  const attempt = await page.evaluate(() =>
    window.__calls.filter((c) => c.p_action === "record").at(-1),
  );
  eq(
    await dialog
      .getByLabel("Referanse til gjennomført overtakelsesprotokoll")
      .inputValue(),
    "Eksempel – overtakelsesprotokoll 23.10.2026",
    "Failure preserves protocol reference",
  );
  await button("Registrer gjennomført overtakelse").click();
  await dialog.waitFor({ state: "hidden" });
  eq(
    await page.evaluate(() =>
      window.__calls.filter((c) => c.p_action === "record").at(-1),
    ),
    attempt,
    "Lost response retry retains exact request identity",
  );
  eq(
    (await page.evaluate(() => window.__snapshot())).cases.length,
    3,
    "Recording never closes underlying cases",
  );
  await page
    .getByText("Overtakelse registrert", { exact: false })
    .first()
    .waitFor();
  await page.getByText("Eksempel – prosjektleder · Frist 30.10.2026", {exact:true}).waitFor({state:"attached"});
  eq(await button("Se ansvarlig og frist").count(),1,"Recorded handover immediately loads the actual linked activity deadline");
  eq(await page.getByText("Oppfølgingsfrist mangler",{exact:true}).count(),2,"Unlinked cases show missing follow-up deadlines without inventing dates");
  await page.getByText("Historikk for vurdering og overtakelse · 3",{exact:true}).click();
  await page.getByRole("button",{name:/Overtakelse registrert \/ rettet/}).click();
  const historic=page.getByRole("dialog",{name:"Tidligere vurdering av overtakelse",exact:true});
  await historic.waitFor();
  eq(await historic.getByText("Registrert overtakelse:",{exact:false}).count(),1,"Saved historical registration can be inspected");
  await historic.getByText("Se åpne forhold · 3",{exact:true}).click();
  eq(await historic.getByText("Prosjektleder har vurdert forholdet særskilt.",{exact:false}).count(),1,"Original manager reason available in history");
  await button("Lukk tidligere vurdering av overtakelse").click();

  await page.evaluate(() => window.__change());
  await page.getByText("4 åpne forhold", { exact: true }).waitFor();
  eq(
    await page
      .getByText(
        "Oversikten er endret siden siste vurdering. Se over nye og endrede forhold.",
        { exact: true },
      )
      .count(),
    1,
    "Post-handover change visible",
  );
  eq(
    (await page.evaluate(() => window.__snapshot())).record.reference,
    "Eksempel – overtakelsesprotokoll 23.10.2026",
    "Post-handover change preserves record",
  );
  await button("Vurder oppfølging / rett registrering").click();
  await dialog.getByLabel("Finn bolig eller forhold").fill("Ny uferdig");
  await page.evaluate(() => window.__change());
  await dialog
    .getByText("Grunnlaget er endret. Kladden beholdes.", { exact: false })
    .first()
    .waitFor();
  eq(
    await dialog.getByLabel("Finn bolig eller forhold").inputValue(),
    "Ny uferdig",
    "Background reload preserves search/workplace",
  );
  await button("Se over og bruk siste grunnlag").click();
  await dialog.getByLabel("Hva vil du lagre?").selectOption("record");
  eq(
    await dialog
      .getByLabel(
        "Jeg har gjennomgått alle åpne forhold og står for vurderingene ovenfor.",
      )
      .isChecked(),
    false,
    "Rebase requires new confirmation",
  );
  await button("Lukk prosjektleders vurdering av overtakelse").click();
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 1000 });
    await button("A–Å-veiledning for Boligprosjekter").click();
    const guide = page.getByRole("dialog", {
      name: "A–Å-veiledning for Boligprosjekter",
      exact: true,
    });
    await guide
      .getByRole("heading", { name: "Bygg prosjektet", exact: true })
      .waitFor();
    eq(
      await guide.getByLabel("Velg steg i boligveiledningen").locator("option").count(),
      18,
      "Eighteen explicit start-to-finish steps " + width,
    );
    eq(
      await guide.evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      true,
      "Guide no overflow " + width,
    );
    await button("Neste steg").click();
    await guide
      .getByRole("heading", { name: "Avklar interne roller", exact: true })
      .waitFor();
    await button("Forrige steg").click();
    await guide
      .getByRole("button", { name: "Forstørr eksempelbildet" })
      .click();
    const enlarged = page.getByRole("dialog", {
      name: "Eksempel fra boligveiledningen",
      exact: true,
    });
    await enlarged.waitFor();
    eq(
      await enlarged.getByRole("img").evaluate((i) => i.naturalWidth > 0),
      true,
      "Illustration loads and enlarges " + width,
    );
    await button("Lukk eksempel fra boligveiledningen").click();
    const guideSelect = guide.getByLabel("Velg steg i boligveiledningen");
    const phaseTitles = ["Bygg prosjektet", "Avklar interne roller", "Kontrakter og innsyn", "Lag grunnpakken", "Lag tilvalg og fordel", "Fordel sjekklister", "Planlegg mange boliger samlet", "Sett opp faktisk bemanning", "Gi UE og leverandører tilgang", "Velg kontakt og beboerdialog", "Del avtaler med beboerne", "Bestill og følg leveringer", "Utfør og dokumenter sjekklistene", "Følg avvik, meldinger og frister", "Varsle beboerne", "Følg kontraktsøkonomien", "Vurder overtakelsen", "Lever dokumentasjon og følg opp"];
    for (let index = 0; index < phaseTitles.length; index++) {
      await guideSelect.selectOption(String(index));
      await guide.getByRole('heading', {name: phaseTitles[index], exact: true}).waitFor();
      eq(await guide.locator('article .bolig-guide-where').textContent().then(t=>t.length>5),true,'Every phase has its own concrete location '+index+' at '+width);
      eq(await guide.locator('.bolig-guide-next p').textContent().then(t=>t.length>15),true,'Every phase explains the next action '+index+' at '+width);
      eq(await guide.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'Expanded guide fits '+width+' at phase '+index);
    }
    await guideSelect.selectOption('1');
    eq((await guide.locator('article').textContent()).includes('Lesetilgang eller Prosjektledertilgang'),true,'Internal role guidance is explicit');
    await guideSelect.selectOption('5');
    eq((await guide.locator('article').textContent()).includes('påkrevd'),true,'Checklist distribution explains required controls');
    await guideSelect.selectOption('8');
    eq((await guide.locator('article').textContent()).includes('alle aktive boliger'),true,'External access guidance explains project-wide scope');
    await guideSelect.selectOption('15');
    eq((await guide.locator('article').textContent()).includes('Fakturaoversikt → Rediger'),true,'Finance guide explains editable invoice numbers');
    await guideSelect.selectOption('16');
    await guide
      .getByRole("heading", { name: "Vurder overtakelsen", exact: true })
      .waitFor();
    if (process.env.BOLIG_HANDOVER_QA)
      await guide.screenshot({
        path: process.env.BOLIG_HANDOVER_QA + "/guide-" + width + ".png",
      });
    await button("Lukk a–å-veiledning for boligprosjekter").click();
    await button("Vurder oppfølging / rett registrering").click();
    eq(
      await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      true,
      "Review no overflow " + width,
    );
    eq(
      await dialog
        .getByLabel("Finn bolig eller forhold")
        .evaluate((e) => parseFloat(getComputedStyle(e).fontSize) >= 16),
      true,
      "Readable mobile inputs " + width,
    );
    await button("Lukk prosjektleders vurdering av overtakelse").click();
  }
  await page.evaluate(() => window.__freshRole("reader"));
  await button("Vurder oppfølging / rett registrering").waitFor({state:"hidden"});
  eq(await page.getByRole("dialog",{name:"Prosjektleders vurdering av overtakelse",exact:true}).count(),0,"Fresh role downgrade hides editing even while the outer context still says manager");
  await page.evaluate(() => window.__freshRole("manager"));
  await button("Vurder oppfølging / rett registrering").waitFor();
  await page.evaluate(() => {
    window.__hold = true;
    window.__show("other");
  });
  await page.locator("[data-qa-company=other]").waitFor();
  eq(
    await page
      .getByText("Eksempel – overtakelsesprotokoll 23.10.2026", { exact: true })
      .count(),
    0,
    "Scope switch immediately hides old record",
  );
  await page.waitForFunction(() => !!window.__release);
  await page.evaluate(() => {
    window.__hold = false;
    window.__release();
  });
  await button("Vurder oppfølging / rett registrering").waitFor();
  await page.evaluate(() => window.__show("other", "reader"));
  await page.locator("[data-qa-role=reader]").waitFor();
  eq(
    await button("Vurder oppfølging / rett registrering").count(),
    0,
    "Reader has no writes",
  );
  eq(errors, [], "No browser runtime errors");
  console.log(
    "PASS Bolig handover/guide: " +
      checks +
      " actual Chromium assertions; manager assessment, critical explicit decision, no false completion, retry, changed source, scoped state, eighteen explicit guide steps, existing illustrations and mobile layout.",
  );
} catch (e) {
  await page?.screenshot({
    path: "/tmp/bolig-handover-failure.png",
    fullPage: true,
  });
  throw e;
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
