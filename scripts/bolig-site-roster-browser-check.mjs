import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { osloDay, utcFromOslo } from "./fixtures/bolig-attendance-time.mjs";
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
        entry: "scripts/fixtures/bolig-site-roster-harness.jsx",
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
  const attendanceNow = new Date("2026-10-25T12:00:00Z");
  await page.clock.setFixedTime(attendanceNow);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const interval = window.setInterval;
    window.setInterval = (fn, ms, ...args) => {
      if (ms === 60000) window.rosterIdleRefresh = fn;
      return interval(fn, ms, ...args);
    };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);

  const btn = (n) => page.getByRole("button", { name: n, exact: true });
  await btn("Rediger byggeplass").waitFor();
  eq(await page.evaluate(() => window.writes), 0, "mount is read only");
  await btn("Rediger byggeplass").click();
  const editor = page.locator("form.roster-editor");
  eq(
    await editor.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top < innerHeight - 80;
    }),
    true,
    "editor opens in visible dialog area without searching below the overview",
  );
  await btn("Forkast kladden").click();
  await btn("Virksomheter (0)").click();
  await btn("Legg til virksomhet").click();
  await page.getByLabel("Virksomhetens navn", { exact: true }).fill("QA Firma");
  await page
    .getByLabel("Organisasjonsnummer (ni sifre)", { exact: true })
    .fill("999888777");
  await btn("Lagre endringer").click();
  await btn("Virksomheter (1)").waitFor();
  await btn("Personer (0)").click();
  await btn("Legg til person").click();
  await page
    .getByLabel("Personens navn", { exact: true })
    .fill("QA Łukasz Жуков");
  await page.getByLabel("Fødselsdato", { exact: true }).fill("1990-01-02");
  await page.evaluate(() => window.rosterIdleRefresh());
  eq(
    await page
      .getByLabel("Fødselsdato", { exact: true })
      .evaluate((el) => document.activeElement === el),
    true,
    "idle refresh keeps input and keyboard focus during editing",
  );
  await page
    .getByLabel("Arbeidsgiver / enmannsbedrift", { exact: true })
    .selectOption({ label: "QA Firma · 999888777" });
  await page.getByLabel("HMS-kortnummer", { exact: true }).fill("QA-HMS-001");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await btn("Lagre endringer").waitFor();
  eq(
    await page.getByLabel("Personens navn", { exact: true }).inputValue(),
    "QA Łukasz Жуков",
    "focus keeps memory draft",
  );
  eq(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }).includes(
        "1990-01-02",
      ),
    ),
    false,
    "sensitive draft never browser storage",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await btn("Lagre endringer").waitFor({ state: "detached" });
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await btn("Lagre endringer").waitFor();
  eq(
    await page.getByLabel("HMS-kortnummer", { exact: true }).inputValue(),
    "QA-HMS-001",
    "wake keeps memory draft",
  );
  await page.evaluate(() => (window.lost = true));
  await btn("Lagre endringer").click();
  await btn("Prøv samme lagring igjen").waitFor();
  await btn("Prøv samme lagring igjen").click();
  await btn("Personer (1)").waitFor();
  eq(
    await page.evaluate(() => window.writes),
    2,
    "lost acknowledgement retry does not duplicate",
  );
  await btn("Oversikt").click();
  await page
    .getByLabel(
      "Jeg har kontrollert opplysningene og at alle som skal arbeide her i dag er med.",
    )
    .check();
  await btn("Bekreft daglig kontroll").click();
  await page.getByText("Daglig kontroll bekreftet", { exact: true }).waitFor();
  await page.screenshot({
    path: "/tmp/roster-overview-desktop.png",
    fullPage: true,
  });
  const download = page.waitForEvent("download");
  await btn("Last ned oversiktsliste (CSV)").click();
  const dl = await download;
  eq(dl.suggestedFilename(), "oversiktsliste-2026-10-25-v3.csv");
  const csv = await fs.promises.readFile(await dl.path(), "utf8");
  eq(csv.includes("QA Łukasz Жуков"), true);
  eq(csv.includes("1990-01-02"), true);
  await btn("Personer (1)").click();
  await btn("Rediger person").click();
  await page.getByLabel("Personens navn", { exact: true }).fill("QA Endret");
  await page.evaluate(() => {
    window.bump();
    window.dispatchEvent(new Event("focus"));
  });
  await btn("Jeg har sett siste liste").waitFor();
  eq(
    await btn("Lagre endringer").isDisabled(),
    true,
    "conflicting revision blocks silent overwrite",
  );
  await btn("Jeg har sett siste liste").click();
  await btn("Lagre endringer").click();
  await btn("Personer (1)").waitFor();
  await btn("Historikk").click();
  await btn("Vis versjon 2").click();
  await page.getByText(/Leser lagret historikk/).waitFor();
  eq(
    await btn("Last ned oversiktsliste (CSV)").isEnabled(),
    true,
    "immutable history export available",
  );
  await btn("Til dagens liste").click();
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 950 });
    eq(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.querySelector("dialog").scrollWidth <=
            document.querySelector("dialog").clientWidth + 1,
      ),
      true,
      "no page/dialog overflow " + width,
    );
    if (width === 390)
      await page.screenshot({
        path: "/tmp/roster-history-mobile.png",
        fullPage: true,
      });
  }
  await btn("Personer (1)").click();
  await btn("Rediger person").click();
  await page
    .getByLabel("Personens navn", { exact: true })
    .fill("Usendt hemmelig navn");
  await btn("Lukk oversiktslisten").click();
  await btn("Fortsett her").click();
  eq(
    await page.getByLabel("Personens navn", { exact: true }).inputValue(),
    "Usendt hemmelig navn",
    "cancel close preserves draft",
  );
  await page.evaluate(() => {
    window.delay = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.getByText(/Bekrefter tilgang/).waitFor();
  eq(
    await page.getByLabel("Personens navn", { exact: true }).count(),
    0,
    "sensitive data hidden while access pending",
  );
  await page.evaluate(() => {
    window.denied = true;
    window.delay = false;
    window.release();
  });
  await page.getByText("Tilgang tilbakekalt", { exact: true }).waitFor();
  eq(
    await page.getByLabel("Personens navn", { exact: true }).count(),
    0,
    "revocation clears draft",
  );
  await page.evaluate(() => {
    window.denied = false;
    window.dispatchEvent(new Event("focus"));
  });
  await btn("Rediger person").waitFor();
  eq(
    await page.getByLabel("Personens navn", { exact: true }).count(),
    0,
    "revoked draft not resurrected",
  );
  await page.reload();
  await btn("Rediger byggeplass").waitFor();
  eq(
    await page.getByText("QA Endret", { exact: true }).count(),
    0,
    "reload does not retain private fixture data",
  );
  await page.evaluate(() => window.switchScope());
  await page
    .getByText("Tilgangen til oversiktslisten er endret.", { exact: true })
    .waitFor();
  eq(
    await btn("Rediger byggeplass").count(),
    0,
    "real company switch never reveals old roster",
  );
  eq(errors, []);
  console.log("Site roster browser: " + checks + " assertions PASS");
} catch (e) {
  await page?.screenshot({
    path: "/tmp/roster-browser-failure.png",
    fullPage: true,
  });
  throw e;
} finally {
  await browser?.close();
  if (server) await new Promise((r) => server.close(r));
}
