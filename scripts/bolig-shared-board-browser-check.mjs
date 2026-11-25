import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { execFileSync } from "node:child_process";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const base = process.argv[2] || "origin/main";
const changed = execFileSync("git", ["diff", "--name-only", base], {
  encoding: "utf8",
});
if (!changed.split("\n").some((p) => p.startsWith("src/modules/bolig/"))) {
  console.log(
    "Bolig shared board parity: not applicable (no Bolig feature change)",
  );
  process.exit(0);
}
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const cwd = process.cwd(),
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-board-parity-"));
const boardPath = "src/modules/kshms/KshmsProgressBoard.jsx";
const baseline = execFileSync("git", ["show", `${base}:${boardPath}`], {
  encoding: "utf8",
});
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React,{useState} from '${cwd}/node_modules/react/index.js';
import {createRoot} from '${cwd}/node_modules/react-dom/client.js';
import Before from 'qa-baseline-board';
import After from '${cwd}/${boardPath}';
import {KSHMS_PROGRESS_OPERATIONS} from '${cwd}/src/modules/kshms/kshmsProgressCodes.mjs';
const initial={excludeSundays:false,activities:[{id:'a',title:'QA Montering',trade:'Rørlegger',resource:'QA Firma',status:'Pågår',crewSize:2,assigneeIds:['person'],sessions:[{id:'s1',date:'2026-10-23',startTime:'08:00',endTime:'16:00',note:'Bevart merknad'},{id:'s2',date:'2026-10-24',startTime:'08:00',endTime:'16:00',note:'Bevart merknad'}]},{id:'b',title:'QA Kontroll',trade:'Kontroll',resource:'',status:'Ikke startet',crewSize:null,assigneeIds:[],sessions:[]}]};
function App({variant,mode,serial}){const [plan,setPlan]=useState(()=>structuredClone(initial)),[dirty,setDirty]=useState(mode==='dirty');const Component=variant==='before'?Before:After;window.__plan=()=>structuredClone(plan);return <div data-board-variant={variant} data-board-mode={mode}><Component plan={plan} meta={{title:'QA ordinær fremdriftsplan'}} readOnly={mode==='reader'} dirty={dirty} saving={mode==='saving'} loading={mode==='loading'} error="" notice="" onPlanChange={p=>{setPlan(p);setDirty(true);window.__calls.push('change');}} onSave={async()=>{window.__calls.push('save');setDirty(false);return true;}} onExport={mode==='no-export'?undefined:async kind=>{window.__calls.push('export:'+kind);return '';}} operations={KSHMS_PROGRESS_OPERATIONS} people={[{id:'person',name:'QA Deltaker'}]} stateKey={variant+':'+mode+':'+serial} launchToken={serial} tools={<details><summary>Prosjektverktøy</summary><p>Uendret prosjektinnhold</p></details>} /></div>;}
const app=createRoot(document.getElementById('app'));let n=0;window.__show=(variant,mode)=>{window.__calls=[];const serial=++n;app.render(<App key={serial} {...{variant,mode,serial}}/>);};
`,
);
let browser,
  server,
  checks = 0;
const eq = (a, b, label) => {
  assert.deepEqual(a, b, label);
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
        name: "actual-main-board",
        enforce: "pre",
        resolveId(id) {
          if (id === "qa-baseline-board")
            return path.join(cwd, "src/modules/kshms/__qa_baseline_board.jsx");
        },
        load(id) {
          if (id.endsWith("/__qa_baseline_board.jsx")) return baseline;
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
  const output = (Array.isArray(built) ? built[0] : built).output;
  const js = output.find((x) => x.type === "chunk").code;
  const css = output
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
    } else {
      res.setHeader("content-type", "text/html");
      res.end(
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script></html>',
      );
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      process.env.CHROMIUM_PATH ||
      undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.setDefaultTimeout(7000);
  await page.goto("http://127.0.0.1:" + server.address().port);
  const button = (name) => page.getByRole("button", { name, exact: true });
  const snapshot = () =>
    page.evaluate(() => ({
      text: document.body.innerText,
      controls: [
        ...document.querySelectorAll("button,input,select,summary"),
      ].map((e) => ({
        tag: e.tagName,
        text: e.textContent,
        label: e.getAttribute("aria-label"),
        value: "value" in e ? e.value : null,
        disabled: Boolean(e.disabled),
        checked: Boolean(e.checked),
        pressed: e.getAttribute("aria-pressed"),
        title: e.title,
      })),
      plan: window.__plan(),
      calls: [...window.__calls],
    }));
  // Execute the same real interactions against main and the Bolig branch.
  // These are the defaults used by Project, KS/HMS and Min side, not dateOnly.
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of [
      "manager",
      "reader",
      "saving",
      "loading",
      "dirty",
      "no-export",
    ]) {
      const captures = [];
      for (const variant of ["before", "after"]) {
        await page.evaluate(
          ({ variant, mode }) => window.__show(variant, mode),
          { variant, mode },
        );
        await page
          .locator(
            `[data-board-variant="${variant}"][data-board-mode="${mode}"]`,
          )
          .waitFor({ state: "attached" });
        await page
          .getByRole("dialog", {
            name: "QA ordinær fremdriftsplan",
            exact: true,
          })
          .waitFor()
          .catch(async (e) => {
            console.error({
              variant,
              mode,
              width,
              errors,
              body: (await page.locator("body").innerText()).slice(0, 800),
            });
            throw e;
          });
        const states = [await snapshot()];
        for (const view of ["Dag", "Måned", "Uke"]) {
          await button(view).click();
          states.push(await snapshot());
        }
        await button("Bemanningsplan").click();
        states.push(await snapshot());
        await button("Fremdriftsplan").click();
        await page
          .locator(".ks-timeline-row button.ks-timeline-label")
          .first()
          .click();
        const drawer = page.getByRole("dialog", {
          name:
            mode === "reader"
              ? "Se arbeidsoperasjon"
              : "Rediger arbeidsoperasjon",
          exact: true,
        });
        await drawer.waitFor().catch(async (e) => {
          console.error({
            variant,
            mode,
            width,
            errors,
            body: (await page.locator("body").innerText()).slice(-600),
          });
          throw e;
        });
        states.push(await snapshot());
        if (mode === "manager" || mode === "dirty") {
          await drawer
            .getByLabel("Arbeidsoperasjon", { exact: true })
            .fill("QA usendt montering");
          await drawer.getByLabel("Fra kl.", { exact: true }).fill("09:00");
          await page.evaluate(() => {
            document.dispatchEvent(new Event("visibilitychange"));
            window.dispatchEvent(new Event("blur"));
            window.dispatchEvent(new Event("focus"));
          });
          states.push(await snapshot());
        }
        await drawer
          .getByRole("button", { name: "Tilbake til oversikten", exact: true })
          .click();
        if (mode === "manager" || mode === "dirty") {
          await button("Angre").click();
          states.push(await snapshot());
          await button("Lagre fremdriftsplan").click();
          states.push(await snapshot());
          await page
            .locator(".ks-plan-band-body")
            .first()
            .press("Alt+ArrowRight");
          states.push(await snapshot());
          await button("Lagre fremdriftsplan").click();
        }
        await page.locator(".ks-plan-surface details > summary").click();
        if (["manager", "reader"].includes(mode)) {
          await button("Last ned kalender (.ics)").click();
          states.push(await snapshot());
        }
        states.push(await snapshot());
        await button("Lukk planbygger").click();
        states.push(await snapshot());
        await button("Åpne bemanningsplan").click();
        states.push(await snapshot());
        captures.push(states);
      }
      eq(
        captures[1],
        captures[0],
        `Unchanged ordinary board behavior ${width}px / ${mode}`,
      );
    }
  }
  eq(errors, [], "No browser exceptions in either ordinary board");
  console.log(
    `Bolig shared board parity: PASS (${checks} scenarios; main vs branch at mobile/desktop)`,
  );
} finally {
  await browser?.close();
  if (server) await new Promise((r) => server.close(r));
  fs.rmSync(temp, { recursive: true, force: true });
}
