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
        entry: "scripts/fixtures/bolig-self-attendance-harness.jsx",
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
  await btn("Registrer inn").waitFor();
  eq(await page.evaluate(() => window.writes), 0, "mount never writes");
  await page
    .getByLabel("Velg prosjekt for innregistrering")
    .selectOption("person");
  await page.evaluate(() => (window.lost = true));
  await btn("Registrer inn").click();
  await btn("Prøv samme registrering igjen").waitFor();
  eq(await page.evaluate(() => window.writes), 1);
  await page.reload();
  await btn("Prøv samme registrering igjen").waitFor();
  await btn("Prøv samme registrering igjen").click();
  await btn("Registrer ut").waitFor();
  eq(
    await page.evaluate(() => window.writes),
    0,
    "exact retry after reload does not write",
  );
  eq(await page.getByText("Registrert på prosjektet", { exact: true }).count(), 1);
  eq(await page.getByText("Innlogget", { exact: true }).count(), 0, "project attendance is distinct from app login");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await btn("Registrer ut").waitFor({ state: "detached" });
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await btn("Registrer ut").waitFor();
  await btn("Registrer ut").click();
  await btn("Registrer inn").waitFor();
  eq(await page.getByText("Ikke registrert på prosjektet", { exact: true }).count(), 1);
  eq(await page.getByText("Utlogget", { exact: true }).count(), 0, "departure does not suggest app logout");
  await page.getByText("Legg til prosjektdeltaker", { exact: true }).click();
  await page
    .getByLabel("Ansatt eller personlig UE-lenke")
    .selectOption("user:user");
  await page.getByLabel("Deltakerens navn").fill("QA Ansatt");
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.evaluate(() => { window.readDelay = 75; window.dispatchEvent(new Event("focus")); });
    await btn("Legg til deltaker").waitFor();
    eq(await page.getByText("Legg til prosjektdeltaker", { exact: true }).evaluate(el => el.parentElement.open), true, "explicitly opened participant form survives delayed focus read");
  }
  await page.evaluate(() => { window.readDelay = 0; });
  eq(
    await page.getByLabel("Deltakerens navn").inputValue(),
    "QA Ansatt",
    "focus preserves roster draft",
  );
  await btn("Legg til deltaker").click();
  await btn("Deaktiver deltaker").waitFor();
  await btn("Deaktiver deltaker").click();
  await btn("Aktiver deltaker").waitFor();
  await btn("Bytt intern / UE").click();
  await btn("Registrer inn").waitFor();
  await btn("Info om inn- og utregistrering").click();
  await page.getByText("Lagre lenken på telefonen", { exact: true }).click();
  await page.getByText(/iPhone: Åpne lenken i Safari/).waitFor();
  await btn("Registrer inn").click();
  await btn("Registrer ut").waitFor();
  await btn("Info om inn- og utregistrering").click();
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 950 });
    eq(
      (
        await page
          .getByRole("region", { name: "Min tilstedeværelse på prosjektet" })
          .boundingBox()
      ).height <= 100,
      true,
      "compact status line " + width,
    );
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "no overflow " + width,
    );
  }
  await page.screenshot({
    path: process.env.BOLIG_SELF_SCREENSHOT || "/tmp/bolig-self-attendance.png",
    fullPage: true,
  });
  await page.evaluate(() => {
    window.denied = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page
    .getByText("Tilgang tilbakekalt", { exact: true })
    .first()
    .waitFor();
  eq(await btn("Registrer ut").count(), 0, "revocation hides controls");
  eq(errors, []);
  console.log("Self attendance browser: " + checks + " assertions PASS");
} finally {
  await browser?.close();
  if (server) await new Promise((r) => server.close(r));
}
