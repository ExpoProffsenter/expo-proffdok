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
      react({ jsxRuntime: "classic" }),
      {
        name: "visual-client",
        enforce: "pre",
        resolveId: (id) =>
          id.endsWith("appSupabaseClientRegistry.js") ? "\0client" : null,
        load: (id) =>
          id === "\0client"
            ? "export const getAppSupabaseClient=()=>window.__client;"
            : null,
      },
    ],
    build: {
      write: false,
      minify: false,
      lib: {
        entry: "scripts/fixtures/bolig-attendance-harness.jsx",
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

 const btn=n=>page.getByRole('button',{name:n,exact:true});
 await btn('Aktiver bemanning').waitFor();eq(await page.evaluate(()=>window.writes),0,'no mount write');
 await btn('Aktiver bemanning').click();await btn('Deaktiver bemanning').waitFor();await btn('Registrer deltaker inn').click();
 await page.getByLabel('Navn',{exact:true}).fill('QA Person');await page.getByLabel('Firma',{exact:true}).fill('QA Firma');
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));eq(await page.getByLabel('Navn',{exact:true}).inputValue(),'QA Person','focus preserves draft');
 await page.reload();await btn('Lagre registrering').waitFor();eq(await page.getByLabel('Navn',{exact:true}).inputValue(),'QA Person','reload preserves draft');
 await page.evaluate(()=>window.lost=true);await btn('Lagre registrering').click();await btn('Prøv samme lagring igjen').waitFor();await btn('Prøv samme lagring igjen').click();await btn('Registrer ut / rett tidspunkt').waitFor();eq(await page.evaluate(()=>window.writes),1,'lost answer retry writes once');
 await btn('Registrer ut / rett tidspunkt').click();await page.getByLabel('Begrunn rettingen').fill('Glemte å registrere ut');
 await page.evaluate(()=>{window.bump();window.dispatchEvent(new Event('focus'));});await btn('Jeg har gjennomgått siste liste').waitFor();eq(await btn('Lagre registrering').isDisabled(),true,'conflict needs explicit review');
 await btn('Jeg har gjennomgått siste liste').click();await btn('Lagre registrering').click();await btn('Rett tidspunkt').waitFor();eq(await page.getByText('● Registrert ut',{exact:true}).count(),1);
 await page.getByText('Registreringshistorikk',{exact:true}).click();await page.getByText(/Glemte å registrere ut/).waitFor();
 const dl=page.waitForEvent('download');await btn('Eksporter liste (CSV)').click();eq((await dl).suggestedFilename().startsWith('bemanning-'),true);
 for(const width of [320,390,768,1366]){await page.setViewportSize({width,height:950});eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no overflow '+width);}
 await page.getByLabel('Prosjektdag',{exact:true}).fill('2026-01-01');await page.getByText('Ingen registreringer for denne dagen.',{exact:true}).waitFor();eq(await page.getByLabel('Prosjektdag',{exact:true}).inputValue(),'2026-01-01','selected day persists after server read');
 await page.getByLabel('Prosjektdag',{exact:true}).fill(new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo'}).format(new Date()));await btn('Rett tidspunkt').waitFor();
 await btn('Registrer deltaker inn').click();await page.getByLabel('Navn',{exact:true}).fill('Usendt kladd');
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});await btn('Lagre registrering').waitFor({state:'detached'});
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));});await btn('Lagre registrering').waitFor();eq(await page.getByLabel('Navn',{exact:true}).inputValue(),'Usendt kladd','resume preserves draft after authorization');
 await page.evaluate(()=>{window.denied=true;window.dispatchEvent(new Event('focus'));});await page.getByText('Tilgang tilbakekalt',{exact:true}).waitFor();eq(await page.getByLabel('Navn',{exact:true}).count(),0,'revocation hides draft and list');
 eq(errors,[]);console.log('Attendance browser: '+checks+' assertions PASS');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));}
