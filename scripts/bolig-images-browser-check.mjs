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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-images-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  `
import React from '${cwd}/node_modules/react/index.js';import {createRoot} from '${cwd}/node_modules/react-dom/client.js';import Catalog from '${cwd}/src/modules/bolig/BoligCatalog.jsx';import '${cwd}/src/modules/bolig/bolig.css';
const company='40000000-0000-4000-8000-000000000001',rid='40000000-0000-4000-8000-000000000002';
const ctx={user_id:'qa',company_id:company,role:'manager',enabled:true};const root={id:rid,archived:false};
window.__calls=[];window.__uploads=[];window.__fail=false;window.__hold=false;const files={};
let state={context:ctx,root_id:rid,revision:1,packages:[],options:[],selection:null,history:[]};
window.__client={supabaseUrl:'https://qa.supabase.co',storage:{from:bucket=>({
upload:async(path,blob,opts)=>{window.__uploads.push({bucket,path,type:blob.type,size:blob.size,opts});if(window.__hold)await new Promise(r=>window.__release=r);if(window.__fail)return {error:{message:'denied'}};files[path]=URL.createObjectURL(blob);return {data:{path}};},
getPublicUrl:path=>({data:{publicUrl:'https://qa.supabase.co/storage/v1/object/public/'+bucket+'/'+path}}),
createSignedUrl:async(path,seconds)=>({data:{signedUrl:files[path]}})
})},rpc:async(name,args)=>{window.__calls.push({name,args});if(name!=='bolig_catalog')return {error:{message:'Lookup disabled in isolated test'}};
if(['package','option'].includes(args.p_action)){const field=args.p_action==='package'?'packages':'options',p=args.p_payload;const old=state[field].find(x=>x.id===p.id);if(old)Object.assign(old,p,{revision:old.revision+1});else state[field].push({...p,id:field+state[field].length,revision:1,archived:false});state.revision++;}return {data:structuredClone(state)};}};
createRoot(document.getElementById('app')).render(<div className="bolig-dialog"><Catalog context={ctx} root={root}/></div>);`,
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
        entry: path.join(temp, "entry.jsx"),
        formats: ["iife"],
        name: "Qa",
        cssFileName: "qa",
      },
    },
  });
  const output = (Array.isArray(result) ? result[0] : result).output,
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
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:Arial}button,input,select{font:inherit}</style><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script></html>',
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
  const btn = (name) => page.getByRole("button", { name, exact: true });
  const fixtureImage = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 80;
    c.height = 60;
    const x = c.getContext("2d");
    x.fillStyle = "#006b7a";
    x.fillRect(0, 0, 80, 60);
    return c.toDataURL("image/png").split(",")[1];
  });
  const imageFile = {
    name: "produkt.png",
    mimeType: "image/png",
    buffer: Buffer.from(fixtureImage, "base64"),
  };
  await btn("Ny grunnpakke").click();
  const pkg = page.getByRole("dialog", { name: "Ny grunnpakke", exact: true });
  await pkg.getByLabel("Pakkenavn", { exact: true }).fill("Pakke med bilde");
  await pkg
    .getByLabel("Varebeskrivelse 1", { exact: true })
    .fill("Servant med bilde");
  await page.evaluate(() => (window.__hold = true));
  await pkg
    .getByLabel("Last opp bilde for varelinje 1", { exact: true })
    .setInputFiles(imageFile);
  await page.waitForFunction(() => window.__uploads.length === 1);
  await pkg
    .getByLabel("Varenummer 1", { exact: true })
    .fill("ENDRET-UNDER-OPPLASTING");
  await btn("Lagre grunnpakke").click();
  eq(
    await page.evaluate(() =>
      window.__calls.some((c) => c.args?.p_action === "package"),
    ),
    false,
    "Saving waits for active image upload",
  );
  await page.evaluate(() => {
    window.__hold = false;
    window.__release();
  });
  await pkg.locator(".bolig-upload-preview img").waitFor();
  eq(
    await pkg.getByLabel("Varenummer 1", { exact: true }).inputValue(),
    "ENDRET-UNDER-OPPLASTING",
    "Upload result never overwrites edits typed while pending",
  );
  eq(
    await pkg.locator("input[type=url]").count(),
    0,
    "No external product or image address fields",
  );
  await btn("Lagre grunnpakke").click();
  await pkg.waitFor({ state: "detached" });
  let saved = await page.evaluate(
    () =>
      window.__calls.find((c) => c.args?.p_action === "package").args.p_payload,
  );
  eq(saved.lines[0].sku, "ENDRET-UNDER-OPPLASTING");
  eq(
    saved.lines[0].image_url.startsWith(
      "https://qa.supabase.co/storage/v1/object/public/bolig-catalog-images/",
    ),
    true,
    "Stable private object reference is saved, never expiring signed URL",
  );
  eq(saved.lines[0].product_url, "");
  await btn("Rediger grunnpakke: Pakke med bilde").click();
  const editPkg = page.getByRole("dialog", {
    name: "Rediger grunnpakke",
    exact: true,
  });
  eq(
    await editPkg.locator(".bolig-edit-line[open]").count(),
    0,
    "Saved package lines start folded",
  );
  await editPkg.locator(".bolig-edit-line > summary").click();
  await editPkg.locator(".bolig-upload-preview img").waitFor();
  eq(
    await editPkg
      .locator(".bolig-upload-preview img")
      .evaluate((n) => n.naturalWidth > 0),
    true,
    "Saved private package image reloads",
  );
  await page.keyboard.press("Escape");
  await btn("Legg til tilvalg").click();
  const opt = page.getByRole("dialog", { name: "Nytt tilvalg", exact: true });
  await opt
    .getByLabel("Navn på tilvalg", { exact: true })
    .fill("Tilvalg med bilde");
  await opt
    .getByLabel("Pris for hele tilvalget inkl. mva.", { exact: true })
    .fill("1250");
  await opt
    .getByLabel("Last opp bilde for tilvalget", { exact: true })
    .setInputFiles(imageFile);
  await opt.locator(".bolig-upload-preview img").waitFor();
  eq(await opt.locator("input[type=url]").count(), 0);
  await page.evaluate(() => (window.__fail = true));
  await opt
    .getByLabel("Last opp bilde for tilvalget", { exact: true })
    .setInputFiles(imageFile);
  await opt
    .getByRole("alert")
    .filter({ hasText: "kunne ikke lastes opp" })
    .waitFor();
  eq(
    await opt.locator(".bolig-upload-preview img").isVisible(),
    true,
    "Failed replacement retains previous image",
  );
  await page.evaluate(() => (window.__fail = false));
  await btn("Lagre tilvalg").click();
  await opt.waitFor({ state: "detached" });
  eq(
    await page.locator(".bolig-option-card-content").count(),
    1,
    "Every saved option has a compact row",
  );
  eq(
    await page.locator(".bolig-option-card-content[open]").count(),
    0,
    "Option details start folded",
  );
  await page.locator(".bolig-option-card-content > summary").click();
  await page.locator(".bolig-option-card-content img").waitFor();
  eq(
    await page.locator("a[target=_blank]").count(),
    0,
    "Product cards keep the customer in the app",
  );
  await btn("Rediger tilvalg: Tilvalg med bilde").click();
  const editOpt = page.getByRole("dialog", {
    name: "Rediger tilvalg",
    exact: true,
  });
  await editOpt.locator(".bolig-upload-preview img").waitFor();
  await editOpt
    .getByLabel("Last opp bilde for tilvalget", { exact: true })
    .setInputFiles({
      name: "x.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
  await editOpt.getByRole("alert").filter({ hasText: "Velg et JPG" }).waitFor();
  eq(
    await page.evaluate(() => window.__uploads.length),
    3,
    "Rejected file is never uploaded",
  );
  await btn("Fjern bilde").click();
  eq(await editOpt.locator(".bolig-upload-preview").count(), 0);
  await btn("Lagre tilvalg").click();
  await editOpt.waitFor({ state: "detached" });
  eq(
    await page.evaluate(
      () =>
        window.__calls.filter((c) => c.args?.p_action === "option").at(-1).args
          .p_payload.image_url,
    ),
    "",
    "Remove detaches only the current catalog image",
  );
  const uploads = await page.evaluate(() => window.__uploads);
  eq(
    uploads.every(
      (u) =>
        u.bucket === "bolig-catalog-images" &&
        u.type === "image/jpeg" &&
        u.size <= 2097152 &&
        u.opts.upsert === false,
    ),
    true,
    "Optimized immutable JPEG uploads in dedicated private bucket",
  );
  for (const width of [320, 390, 1024, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await page
        .locator(".bolig-catalog")
        .evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
      true,
      "Compact catalog has no overflow " + width,
    );
    eq(await btn("Legg til tilvalg").isVisible(), true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(temp, "options-mobile.png"),
    fullPage: true,
  });
  eq(errors, [], "No runtime errors");
  console.log(
    "PASS actual package/option images Chromium: " +
      checks +
      " assertions. Screenshots: " +
      temp,
  );
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
