import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
let server,
  browser,
  checks = 0,
  page;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
try {
  const built = await build({
    configFile: false,
    logLevel: "silent",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      react(),
      {
        name: "visual-client",
        enforce: "pre",
        resolveId: (id) =>
          id.endsWith("appSupabaseClientRegistry.js")
            ? "\0client"
            : [
                  "KshmsSja.jsx",
                  "TimeEntryPoint.jsx",
                  "BoligProgress.jsx",
                  "KshmsDeviations.jsx",
                  "KshmsExecutions.jsx",
                ].some((x) => id.endsWith(x))
              ? "\0leaf:" + id.split("/").pop()
              : null,
        load: (id) =>
          id.startsWith("\0leaf:")
            ? `import React from 'react';import Dialog from '${process.cwd()}/src/modules/deviations/DeviationDialog.jsx';export default function Leaf(p){const [draft,setDraft]=React.useState(''),[show,setShow]=React.useState(true);const name=${JSON.stringify(id)},field=React.createElement('textarea',{'aria-label':'Ulagret kontrolltekst',value:draft,onChange:e=>setDraft(e.target.value)});window.leaves.push({name,projectId:p.projectId,taskId:p.taskId,request:p.request||p.openRequest});return React.createElement('section',{'aria-label':'Existing leaf'},React.createElement('p',null,'Existing leaf '+name+' '+(p.projectId||p.taskId||p.context.user_id)),name.endsWith('KshmsSja.jsx')?(show?React.createElement(Dialog,{title:'Test-SJA',closeLabel:'Lukk test-SJA',onClose:()=>setShow(false)},field):null):field,p.onTaskClose?React.createElement('button',{onClick:p.onTaskClose},'Lukk testaktivitet'):p.onClose?React.createElement('button',{onClick:p.onClose},'Lukk testkontroll'):null);}`
            : id === "\0client"
              ? "export const getAppSupabaseClient=()=>window.__client;"
              : null,
      },
    ],
    build: {
      write: false,
      minify: false,
      lib: {
        entry: "scripts/fixtures/bolig-integration-harness.jsx",
        name: "Qa",
        formats: ["iife"],
        cssFileName: "qa",
      },
    },
  });
  const output = (Array.isArray(built) ? built[0] : built).output,
    js = output.find((o) => o.type === "chunk").code,
    css = output
      .filter((o) => o.type === "asset" && o.fileName.endsWith(".css"))
      .map((o) => o.source)
      .join("\n");
  server = http.createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(js);
    } else if (req.url === "/app.css") {
      res.setHeader("Content-Type", "text/css");
      res.end(css);
    } else
      res.end(
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script></html>',
      );
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        }
      : {}),
  });
  page = await browser.newPage({
    viewport: { width: 1366, height: 1000 },
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);

  const btn = (n) => page.getByRole("button", { name: n, exact: true });
  if (process.env.BOLIG_TASKS_ONLY_QA) page.setDefaultTimeout(6000);
  if (!process.env.BOLIG_TASKS_ONLY_QA) {
  await btn("Opprett prosjektkobling").waitFor();
  eq(await page.evaluate(() => window.writes), 0, "no mount write");
  await page
    .getByLabel("Prosjektkobling", { exact: true })
    .selectOption("link");
  await page.getByLabel("Søk etter eksisterende prosjekt").fill("Eksisterende");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await btn("Søk prosjekter").waitFor();
  eq(
    await page.getByLabel("Søk etter eksisterende prosjekt").inputValue(),
    "Eksisterende",
    "focus preserves linking draft",
  );
  await page
    .getByLabel("Prosjektkobling", { exact: true })
    .selectOption("create");
  await page.evaluate(() => (window.lost = true));
  await btn("Opprett prosjektkobling").click();
  await btn("Prøv samme kobling igjen").waitFor();
  eq(await page.evaluate(() => window.writes), 1);
  await page.reload();
  await btn("Prøv samme kobling igjen").waitFor();
  await btn("Prøv samme kobling igjen").click();
  await page
    .getByRole("button", { name: /SJA, RUH og HMS-kontroller/ })
    .waitFor();
  eq(
    await page.evaluate(() => window.writes),
    0,
    "exact retry after reload does not create second project",
  );
  const linked = await page.evaluate(
    () => JSON.parse(localStorage.getItem("qa.integration")).project.id,
  );
  await page
    .getByRole("button", { name: /SJA, RUH og HMS-kontroller/ })
    .click();
  await btn("Åpne SJA").click();
  await page.getByText(/Existing leaf.*KshmsSja/).waitFor();
  eq(
    (await page.evaluate(() => window.leaves)).at(-1).projectId,
    linked,
    "HMS gets linked project",
  );
  await page.getByLabel("Ulagret kontrolltekst").fill("Behold åpen SJA og kladd");
  eq(await page.locator("dialog .deviation-dialog-backdrop").count(),1,"native editor portal is inside the modal top layer and interactive");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.waitForTimeout(100);
  eq(await page.getByRole("button", {name:"Lukk SJA-oversikten",exact:true}).getAttribute("aria-expanded"),"true","focus preserves native document group");
  eq(await page.getByLabel("Ulagret kontrolltekst").inputValue(),"Behold åpen SJA og kladd","focus preserves mounted native editor");
  await page.evaluate(() => {
    Object.defineProperty(document,"hidden",{configurable:true,value:true});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  eq(await page.locator("dialog:visible").count(),0,"hidden page suspends dialog without exposing cached metadata");
  eq(await page.getByLabel("Ulagret kontrolltekst").isVisible(),false,"nested portal is hidden with its containing dialog");
  await page.evaluate(() => {
    Object.defineProperty(document,"hidden",{configurable:true,value:false});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.getByLabel("Ulagret kontrolltekst").waitFor();
  eq(await page.getByLabel("Ulagret kontrolltekst").inputValue(),"Behold åpen SJA og kladd","background return preserves group and mounted draft");
  await page.evaluate(() => {window.integrationDelay=250;window.dispatchEvent(new Event("focus"));});
  await btn("Lukk arbeidsflaten").click();
  await page.waitForTimeout(350);
  eq(await page.locator("dialog").count(),0,"explicit close wins over delayed access reply");
  await page.evaluate(() => {window.integrationDelay=0;});
  await page.getByRole("button", { name: /Prosjektets sjekklister/ }).click();
  eq(
    await page.evaluate(() => window.nav),
    [{ id: linked, tab: "sjekklister" }],
    "existing project navigation callback",
  );
  await page.getByRole("button", { name: /Før timer og utlegg/ }).click();
  await page.getByText(/Existing leaf.*TimeEntryPoint/).waitFor();
  await btn("Lukk mine timer på boligprosjektet").click();
  await page.getByLabel("Arbeidssted for KS/HMS og timer").selectOption("unit");
  await page
    .getByRole("button", { name: /SJA, RUH og HMS-kontroller/ })
    .click();
  await btn("Åpne SJA").click();
  await page.getByText(/Existing leaf.*KshmsSja/).waitFor();
  eq(
    (await page.evaluate(() => window.leaves)).at(-1).projectId,
    "apartment",
    "preserves apartment project identity",
  );
  await btn("Lukk test-SJA").click();
  await btn("Lukk prosjektets ks/hms").click();
  eq(await page.getByRole("button", {name:/Mine oppgaver i boligprosjekter/}).getAttribute('aria-expanded'),'true','first tasks are visible without an extra click');
  await page
    .locator(".bolig-my-tasks-content article")
    .filter({ hasText: "Monter bad" })
    .getByRole("button", { name: "Åpne oppgave" })
    .click();
  await page.getByText(/Existing leaf.*BoligProgress/).waitFor();
  eq((await page.evaluate(() => window.leaves)).at(-1).taskId, "progress1");
  await btn("Lukk testaktivitet").click();
  await page
    .locator(".bolig-my-tasks-content article")
    .filter({ hasText: "Min RUH" })
    .getByRole("button", { name: "Åpne oppgave" })
    .click();
  await page.getByText(/Existing leaf.*KshmsDeviations/).waitFor();
  eq((await page.evaluate(() => window.leaves)).at(-1).request.id, "case1");
  await btn("Lukk min ruh / avviksoppgave").click();
  await page.evaluate(() => {
    window.caseClosed = true;
    window.dispatchEvent(new Event("expo:kshms:deviation-change"));
  });
  await page
    .getByText("Min RUH", { exact: true })
    .waitFor({ state: "detached" });
  eq(
    await page.locator(".bolig-my-tasks-content article").count(),
    1,
    "completed source disappears",
  );
  if (process.env.BOLIG_INTEGRATION_EVIDENCE_DIR) {
    fs.mkdirSync(process.env.BOLIG_INTEGRATION_EVIDENCE_DIR, { recursive: true });
    for (const width of [390, 1366]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.screenshot({ path: `${process.env.BOLIG_INTEGRATION_EVIDENCE_DIR}/bolig-integrasjon-${width}-20261024.jpg`, type: "jpeg", quality: 65, fullPage: true });
    }
  }
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 1000 });
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "fits " + width,
    );
  }
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  eq(
    await page.locator(".bolig-my-tasks-content article").count(),
    0,
    "hidden pages clear task content",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.getByText("Monter bad", { exact: true }).waitFor();
  await page.evaluate(() => {
    window.denied = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page
    .getByText("Tilgang tilbakekalt", { exact: true })
    .first()
    .waitFor();
  eq(
    await page.locator(".bolig-my-tasks-content article").count(),
    0,
    "revocation clears tasks",
  );
  eq(await page.locator("dialog:visible").count(),0,"revocation leaves no stale native dialog visible");
  }
  await page.goto(`http://127.0.0.1:${server.address().port}?tasks-error=1`);
  await page.getByText('Kunne ikke hente oppgavene.', {exact:true}).waitFor();
  eq(await page.locator('.bolig-my-tasks article').count(),0,'initial read failure exposes no task data');
  await page.evaluate(()=>{window.taskReadFailure=false;});
  await btn('Prøv å hente oppgavene igjen').click();
  eq(await page.getByRole('button',{name:/Mine oppgaver i boligprosjekter/}).getAttribute('aria-expanded'),'true','successful retry reveals first tasks');
  await page.getByText('Monter bad',{exact:true}).waitFor();
  eq(await page.getByText('Kunne ikke hente oppgavene.',{exact:true}).count(),0,'successful retry clears read failure');
  await page.evaluate(()=>{window.taskReadFailure=true;window.dispatchEvent(new Event('focus'));});
  await page.getByText('Kunne ikke hente oppgavene.',{exact:true}).waitFor();
  eq(await page.locator('.bolig-my-tasks article').count(),0,'failed refresh clears stale task data and offers retry');
  eq(await page.evaluate(()=>window.writes),0,'task retries do not write');
  await page.evaluate(()=>{window.denied=true;window.dispatchEvent(new Event('focus'));});
  await page.waitForFunction(()=>!document.querySelector('.bolig-my-tasks'));
  eq(await page.locator('.bolig-my-tasks').count(),0,'unavailable or revoked module does not expose task card');
  await page.goto(`http://127.0.0.1:${server.address().port}?tasks-empty=1`);
  await page.waitForFunction(()=>window.taskReads>0);
  await page.waitForTimeout(100);
  eq(await page.locator('.bolig-my-tasks').count(),0,'confirmed empty list remains hidden');
  await page.goto(`http://127.0.0.1:${server.address().port}?tasks-many=1`);
  const taskToggle=()=>page.getByRole('button',{name:/Mine oppgaver i boligprosjekter/});
  await page.getByText('Boligoppgave 1',{exact:true}).waitFor();
  eq(await page.locator('.bolig-my-tasks-content article:visible').count(),4,'24 tasks start with four visible rows');
  for(const width of [320,390,768,1366,1920]){
    await page.setViewportSize({width,height:1000});
    eq(await page.locator('.bolig-my-tasks-content article:visible').count(),4,'compact first list at '+width);
    eq(await page.locator('.bolig-my-tasks').evaluate(n=>n.scrollWidth<=n.clientWidth),true,'task card fits '+width);
  }
  await taskToggle().click();await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await taskToggle().waitFor();eq(await taskToggle().getAttribute('aria-expanded'),'false','explicit collapse survives foreground refresh');
  eq(await page.locator('.bolig-my-tasks-content article:visible').count(),0,'collapsed rows stay hidden');
  await taskToggle().click();await btn('Vis flere boligoppgaver').click();
  eq(await page.locator('.bolig-my-tasks-content article:visible').count(),8,'show more uses all already loaded rows');
  await btn('Hent flere boligoppgaver').click();await page.getByText('Boligoppgave 16',{exact:true}).waitFor();
  eq(await page.locator('.bolig-my-tasks-content article:visible').count(),16,'next server page is appended without duplicates');
  for(const [index,leaf] of [[0,'BoligProgress'],[1,'KshmsDeviations'],[2,'KshmsExecutions'],[3,'KshmsExecutions']]){
    await page.locator('.bolig-my-tasks-content article').nth(index).getByRole('button',{name:'Åpne oppgave',exact:true}).click();
    await page.getByText(new RegExp('Existing leaf.*'+leaf)).waitFor();
    const opened=(await page.evaluate(()=>window.leaves)).at(-1);
    eq(index===0?opened.taskId:opened.request.id,'many-'+index,'native source receives exact selected task '+index);
    if(index===0)await btn('Lukk testaktivitet').click();else if(index===1)await btn('Lukk min ruh / avviksoppgave').click();else await btn('Lukk testkontroll').click();
  }
  eq(await page.evaluate(()=>window.writes),0,'personal task reading and pagination never write');
  eq(errors, []);
  console.log(
    "Bolig integration browser: " +
      checks +
      " assertions PASS; native leaves are stubbed only at the component boundary.",
  );
} finally {
  await browser?.close();
  if (server) await new Promise((r) => server.close(r));
}
