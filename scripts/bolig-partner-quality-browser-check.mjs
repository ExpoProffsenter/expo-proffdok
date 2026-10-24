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

  await page.evaluate(() => { window.__priorityFixture(); window.__writePortal(); });
  const mine = page.getByRole("region", { name: "Mine utfyllinger", exact: true });
  const shared = page.getByRole("region", { name: "Prosjektets sjekklister", exact: true });
  await mine.waitFor();
  const cards = (region) => region.locator("article:not([hidden])");
  eq(await cards(mine).locator("h3").allTextContents(), ["Pågående UE", "Kommentar UE", "Måling UE", "Vedlegg UE", "Neste UE", "Tom UE"], "saved answers, comment, zero field and attachment precede untouched checks");
  eq(await mine.getByRole("heading", { name: "Pågående (4)", exact: true }).count(), 1, "honest started count");
  eq(await mine.getByRole("heading", { name: "Neste sjekklister (2)", exact: true }).count(), 1, "empty answer object stays unstarted");
  eq(await mine.getByRole("button", { name: "Fullførte (1)", exact: true }).getAttribute("aria-expanded"), "false", "completed collapsed by default");
  eq(await cards(shared).locator("h3").allTextContents(), ["Pågående prosjekt", "Neste prosjekt"], "45 completed rows cannot displace ongoing or next; same ID in different scope");
  await shared.getByRole("button", { name: "Fullførte (45)", exact: true }).click();
  eq(await cards(shared).count(), 14, "completed pagination independent of unfinished groups");
  await shared.getByRole("button", { name: "Vis flere fullførte (33)", exact: true }).click();
  eq(await cards(shared).count(), 26, "completed can be expanded progressively");
  const sharedDetails = cards(shared).first().locator("details");
  await sharedDetails.locator("summary").click();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await shared.waitFor({ state: "hidden" });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await shared.waitFor();
  eq(await shared.getByRole("button", { name: "Fullførte (45)", exact: true }).getAttribute("aria-expanded"), "true", "folding survives authorization refresh");
  eq(await cards(shared).count(), 26, "page limit survives authorization refresh");
  eq(await cards(shared).first().locator("details").getAttribute("open"), "", "open control points survive refresh");
  const search = page.getByRole("searchbox");
  await search.fill("Demoparken 103");
  eq(await cards(shared).locator("h3").allTextContents(), ["Pågående prosjekt"], "search across shared scope");
  eq(await cards(mine).locator("h3").allTextContents(), ["Måling UE"], "search includes own scope");
  await search.fill("ingen-treff");
  eq(await cards(mine).count(), 0, "empty own search has no old rows");
  await search.fill("");
  await mine.getByRole("button", { name: "Fullførte (1)", exact: true }).click();
  eq(await mine.locator('article[data-check-status="completed"]').innerText().then(x => x.includes("23. okt. 2026")), true, "actual saved completion date displayed");
  await mine.getByRole("button", { name: "Fullførte (1)", exact: true }).click();
  const unfinished = mine.locator('article[data-check-key="unit1:new"]');
  await unfinished.getByRole("button", { name: "Fyll ut sjekkliste", exact: true }).click();
  let priorityDialog = dialog("UE – sjekkliste");
  await priorityDialog.getByLabel("Resultat: Servant kontrollert", { exact: true }).selectOption("OK");
  eq(await unfinished.getAttribute("data-check-status"), "next", "unsent draft never claims server progress");
  await priorityDialog.getByRole("checkbox", { name: "Fullfør sjekklisten ved lagring", exact: true }).check();
  await page.evaluate(() => (window.__hold = true));
  await button("Lagre sjekkliste").click();
  eq(await unfinished.getAttribute("data-check-status"), "next", "completion waits for server receipt");
  await page.evaluate(() => window.__release());
  await priorityDialog.waitFor({ state: "hidden" });
  await mine.getByRole("button", { name: "Fullførte (2)", exact: true }).waitFor();
  eq(await unfinished.getAttribute("data-check-status"), "completed", "receipt moves only completed row to bottom");
  eq(await unfinished.isVisible(), false, "completed row no longer blocks next task");
  eq(await page.evaluate(() => document.activeElement.closest("article")?.dataset.checkKey), "unit1:answer", "focus moves to first remaining work");
  eq(await cards(mine).locator("h3").allTextContents(), ["Pågående UE", "Kommentar UE", "Måling UE", "Vedlegg UE", "Tom UE"], "remaining work and existing order preserved");
  await page.screenshot({ path: "/tmp/bolig-checklist-priority-desktop.png", fullPage: true });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    eq(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "priority layout " + width);
  }
  await page.screenshot({ path: "/tmp/bolig-checklist-priority-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1366, height: 900 });
  const snapshot = await page.evaluate(() => window.__priorityReadback());
  eq(snapshot.shared[0].id, "done0", "display sorting does not mutate shared server order");
  eq(snapshot.checks.map(x => x.record.id), ["done", "new", "answer", "comment", "field", "blank", "document"], "display sorting never rewrites definitions or history");
  await page.evaluate(() => { window.__features(["checklists"]); window.dispatchEvent(new Event("focus")); });
  await mine.waitFor();
  eq(await mine.getByRole("button", { name: "Fyll ut sjekkliste", exact: true }).count(), 0, "priority groups respect read-only access");
  eq(await mine.getByRole("button", { name: "Se utfylling", exact: true }).count(), 5, "readers can inspect unfinished controls");
  await page.evaluate(() => { window.__resetPriority(); window.__writePortal(); });
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
