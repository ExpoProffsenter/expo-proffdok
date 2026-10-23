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
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-partners-"));
fs.writeFileSync(
  path.join(temp, "entry.jsx"),
  fs
    .readFileSync("scripts/fixtures/bolig-partner-harness.jsx", "utf8")
    .replaceAll("REPO", cwd),
);
let server,
  lastPage,
  browser,
  checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
try {
  const r = await build({
    root: cwd,
    configFile: false,
    resolve: {
      alias: {
        "react/jsx-runtime": cwd + "/node_modules/react/jsx-runtime.js",
      },
    },
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.VITE_SUPABASE_URL": '"https://qa.supabase.co"',
      "import.meta.env.VITE_SUPABASE_ANON_KEY": '"qa"',
    },
    logLevel: "silent",
    plugins: [
      react(),
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
  const out = (Array.isArray(r) ? r[0] : r).output,
    script = out.find((x) => x.type === "chunk").code,
    css = out
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
        '<!doctype html><html lang="nb"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="app"></div><script src="/app.js"></script></html>',
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
  lastPage = page;
  page.setDefaultTimeout(8000);
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error("RUNTIME", e.message, e.stack);
  });
  await page.goto("http://127.0.0.1:" + server.address().port);
  const button = (name) => page.getByRole("button", { name, exact: true }),
    dialog = (name) => page.getByRole("dialog", { name, exact: true });

  await page.evaluate(() => window.__writePortal());
  await page
    .getByRole("heading", { name: "Mine sjekklister og vedlegg", exact: true })
    .waitFor();
  await page
    .getByText("Start egen utfylling fra prosjektets sjekklister", {
      exact: true,
    })
    .click();
  await button("Start egen utfylling").click();
  let d = dialog("UE – sjekkliste");
  await d.waitFor();
  await d
    .getByLabel("Resultat: Servant kontrollert", { exact: true })
    .selectOption("OK");
  await d
    .getByLabel("Kommentar: Servant kontrollert", { exact: true })
    .fill("QA arbeid kontrollert");
  await page.evaluate(() => {
    window.dispatchEvent(new Event("blur"));
  });
  await d.waitFor({ state: "hidden" });
  eq(await d.count(), 0, "sleep hides checklist editor");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await d.waitFor();
  eq(
    await d
      .getByLabel("Kommentar: Servant kontrollert", { exact: true })
      .inputValue(),
    "QA arbeid kontrollert",
    "focus keeps draft and open editor",
  );
  await page.evaluate(() => (window.__fail = true));
  await button("Lagre sjekkliste").click();
  await button("Prøv samme lagring igjen").waitFor();
  await button("Lukk og behold sjekklisteutkast").click();
  await page.evaluate(() => window.__remount());
  await button("Fortsett sjekklisteutkast").click();
  await button("Prøv samme lagring igjen").click();
  await page
    .getByText("Svarene er lagret hos prosjektet.", { exact: true })
    .waitFor();
  let calls = await page.evaluate(() =>
    window.__calls
      .filter((x) => x.p_action === "check_save")
      .map((x) => x.p_payload),
  );
  eq(calls[0], calls[1], "checklist exact retry survives remount");
  await page
    .getByText("Last opp PDF, bilde eller annet vedlegg", { exact: true })
    .click();
  const fileInput = page.getByLabel("Velg PDF, bilde eller fil", {
    exact: true,
  });
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  eq(
    await page
      .getByRole("heading", {
        name: "Mine sjekklister og vedlegg",
        exact: true,
      })
      .count(),
    0,
    "reauthorization hides documentation",
  );
  eq(
    await page.locator('input[type="file"]').count(),
    1,
    "native file chooser retains mounted input during blur",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await fileInput.waitFor({ state: "visible" });
  eq(
    await fileInput.isVisible(),
    true,
    "upload panel remains open after reauthorization",
  );
  await page
    .getByLabel("Velg PDF, bilde eller fil", { exact: true })
    .setInputFiles({
      name: "egen-kontroll.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\nQA eget skjema"),
    });
  await page.getByText("Filkladd sikret:", { exact: false }).waitFor();
  await page.evaluate(() => (window.__failFile = true));
  await button("Lagre vedlegg").click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Mistet filkvittering" })
    .waitFor();
  await page.evaluate(() => window.__remount());
  await page
    .getByText("Last opp PDF, bilde eller annet vedlegg", { exact: true })
    .click();
  await page.getByText("Filkladd sikret:", { exact: false }).waitFor();
  eq(
    await page.getByLabel("Tittel på vedlegget", { exact: true }).inputValue(),
    "egen-kontroll.pdf",
    "file blob and title survive remount",
  );
  await button("Lagre vedlegg").click();
  await button("Last ned egen-kontroll.pdf").waitFor();
  const uploads = await page.evaluate(() => window.__fileCalls);
  eq(
    uploads[0],
    uploads[1],
    "lost upload receipt retries same immutable file id",
  );
  eq(
    await button("Last ned egen-kontroll.pdf").count(),
    1,
    "PDF registered once",
  );
  await page
    .getByLabel("Velg PDF, bilde eller fil", { exact: true })
    .setInputFiles({
      name: "kontrollbilde.png",
      mimeType: "image/png",
      buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    });
  await page
    .getByText("Filkladd sikret: kontrollbilde.png", { exact: false })
    .waitFor();
  await button("Lagre vedlegg").click();
  await button("Last ned kontrollbilde.png").waitFor();
  eq(
    await button("Last ned kontrollbilde.png").count(),
    1,
    "image saved and available",
  );
  await button("Fyll ut sjekkliste").click();
  d = dialog("UE – sjekkliste");
  await d
    .getByRole("checkbox", { name: "egen-kontroll.pdf", exact: true })
    .check();
  await d
    .getByRole("checkbox", { name: "kontrollbilde.png", exact: true })
    .check();
  await d
    .getByRole("checkbox", {
      name: "Fullfør sjekklisten ved lagring",
      exact: true,
    })
    .check();
  await button("Lagre sjekkliste").click();
  await page
    .getByText("Sjekklisten er fullført og lagret hos prosjektet.", {
      exact: true,
    })
    .waitFor();
  const last = await page.evaluate(
    () =>
      window.__calls.filter((x) => x.p_action === "check_save").at(-1)
        .p_payload,
  );
  eq(last.complete, true);
  eq(last.answers.p1.documents.length, 2, "PDF and image attached to point");
  await page.getByText("Lag egen sjekkliste", { exact: true }).click();
  await page
    .getByLabel("Navn på sjekklisten", { exact: true })
    .fill("QA UE kontroll");
  await page
    .getByLabel("Kontrollpunkter – ett per linje", { exact: true })
    .fill("Trykk kontrollert\nMerking kontrollert");
  await page.evaluate(() => window.__remount());
  await page.getByText("Lag egen sjekkliste", { exact: true }).click();
  eq(
    await page.getByLabel("Navn på sjekklisten", { exact: true }).inputValue(),
    "QA UE kontroll",
    "new checklist draft survives remount",
  );
  await button("Opprett egen sjekkliste").click();
  d = dialog("UE – sjekkliste");
  await d.getByLabel("Resultat: Trykk kontrollert", { exact: true }).waitFor();
  eq(await d.getByRole("combobox").count(), 2, "own checklist points created");
  await d
    .getByLabel("Resultat: Trykk kontrollert", { exact: true })
    .selectOption("OK");
  await d
    .getByLabel("Resultat: Merking kontrollert", { exact: true })
    .selectOption("OK");
  await page.evaluate(() => (window.__hold = true));
  await button("Lagre sjekkliste").click();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await d.waitFor({ state: "hidden" });
  await page.evaluate(() => window.__release());
  eq(
    await page
      .getByRole("heading", {
        name: "Mine sjekklister og vedlegg",
        exact: true,
      })
      .count(),
    0,
    "late checklist save cannot reveal hidden content",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await d.waitFor();
  await button("Prøv samme lagring igjen").click();
  await page
    .getByText("Svarene er lagret hos prosjektet.", { exact: true })
    .waitFor();
  const late = await page.evaluate(() =>
    window.__calls
      .filter((x) => x.p_action === "check_save")
      .slice(-2)
      .map((x) => x.p_payload),
  );
  eq(late[0], late[1], "late checklist save replays exact request");
  for (const width of [1366, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "quality layout " + width,
    );
  }
  await page.evaluate(() => {
    window.__features(["checklists"]);
    window.dispatchEvent(new Event("focus"));
  });
  await page
    .getByRole("heading", { name: "Mine sjekklister og vedlegg", exact: true })
    .waitFor();
  eq(
    await button("Lagre vedlegg").count(),
    0,
    "removed write permission hides upload",
  );
  eq(
    await button("Fyll ut sjekkliste").count(),
    0,
    "removed write permission hides editing",
  );
  await page.evaluate(() => {
    window.__features(["orders"]);
    window.dispatchEvent(new Event("focus"));
  });
  await button("Leveranser (1)").waitFor();
  eq(
    await page
      .getByRole("heading", {
        name: "Mine sjekklister og vedlegg",
        exact: true,
      })
      .count(),
    0,
    "removed function hides entire documentation section",
  );
  eq(errors, [], "no runtime errors");
  console.log(
    "PASS bolig partner quality Chromium: " + checks + " assertions.",
  );
} catch (e) {
  if (lastPage) {
    console.error(await lastPage.locator("body").innerText());
    console.error(
      await lastPage.locator("dialog").evaluateAll((ds) =>
        ds.map((d) => ({
          label: d.getAttribute("aria-label"),
          open: d.open,
          html: d.outerHTML,
        })),
      ),
    );
    await lastPage.screenshot({
      path: "/tmp/bolig-partner-failure.png",
      fullPage: true,
    });
  }
  throw e;
} finally {
  await browser?.close();
  await new Promise((r) => (server ? server.close(r) : r()));
}
