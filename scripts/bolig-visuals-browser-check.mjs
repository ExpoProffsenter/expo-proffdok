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
        entry: "scripts/fixtures/bolig-visual-harness.jsx",
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
  const btn = (name) => page.getByRole("button", { name, exact: true }),
    dialog = () => page.getByRole("dialog", { name: /Tilpass/ });
  await btn("Fasadebilde").waitFor();
  eq(
    await btn("Standardvisning").count(),
    1,
    "Existing illustration remains the default",
  );
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.args?.p_action === "publish").length,
    ),
    0,
  );
  await btn("Fasadebilde").click();
  await page.getByLabel("Velg prosjektbilde", { exact: true }).setInputFiles({
    name: "plan.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF invalid fixture"),
  });
  await page.getByText("Velg JPG, PNG eller WebP", { exact: false }).waitFor();
  eq(
    await page.evaluate(
      () => window.__calls.filter((c) => c.name === "upload").length,
    ),
    0,
    "Unsupported files are rejected before network writes",
  );
  await page.getByLabel("Velg prosjektbilde", { exact: true }).setInputFiles({
    name: "fasade.webp",
    mimeType: "image/webp",
    buffer: fs.readFileSync("public/bolig/fasade.webp"),
  });
  await dialog().locator(".bolig-visual-marker").first().waitFor();
  eq(
    await dialog().locator(".bolig-visual-marker").count(),
    4,
    "Project structure creates editable suggestions",
  );
  await page
    .getByLabel("Navn på bildet", { exact: true })
    .fill("Fasade · kontrollert");
  await page
    .getByLabel("Velg bolig eller rom", { exact: true })
    .selectOption({ index: 1 });
  const x = page.getByLabel("Fra venstre (%)", { exact: true });
  await x.fill("23.4");
  eq(await x.inputValue(), "23.4");
  await dialog()
    .getByRole("button", { name: "H0101", exact: true })
    .press("ArrowRight");
  eq(await x.inputValue(), "23.6", "Keyboard moves the same stable marker");
  await page.evaluate(() => {
    window.__native = document.querySelector("input[type=file]");
    window.dispatchEvent(new Event("focus"));
  });
  eq(
    await page.evaluate(
      () => window.__native === document.querySelector("input[type=file]"),
    ),
    true,
    "Focus reauthorization preserves native file input DOM",
  );
  eq(
    await page.getByLabel("Navn på bildet").inputValue(),
    "Fasade · kontrollert",
  );
  for (const width of [1366, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const metrics = await dialog().evaluate((el) => ({
      width: el.getBoundingClientRect().width,
      scroll: el.scrollWidth,
      client: el.clientWidth,
      image: (() => {
        const i = el.querySelector(".bolig-visual-plane > img");
        return {
          w: i.getBoundingClientRect().width,
          h: i.getBoundingClientRect().height,
          nw: i.naturalWidth,
          nh: i.naturalHeight,
        };
      })(),
    }));
    assert(metrics.width <= width + 1, JSON.stringify(metrics));
    checks++;
    assert(metrics.scroll <= metrics.client + 1, JSON.stringify(metrics));
    checks++;
    assert(
      Math.abs(
        metrics.image.w / metrics.image.h - metrics.image.nw / metrics.image.nh,
      ) < 0.01,
    );
    checks++;
  }
  await page
    .getByLabel("Velg bolig eller rom", { exact: true })
    .selectOption({ index: 1 });
  await dialog().locator(".bolig-visual-plane").scrollIntoViewIfNeeded();
  const plane = await dialog().locator(".bolig-visual-plane").boundingBox();
  await page.touchscreen.tap(
    plane.x + plane.width * 0.75,
    plane.y + plane.height * 0.8,
  );
  assert(
    Number(await x.inputValue()) > 60,
    "Mobile tap places selected field on the image",
  );
  checks++;
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.screenshot({
    path: "/tmp/bolig-visual-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1366, height: 1000 });
  await page.screenshot({
    path: "/tmp/bolig-visual-desktop.png",
    fullPage: true,
  });
  await btn("Lukk og behold kladd").click();
  await btn("Fasadebilde").click();
  eq(
    await page.getByLabel("Navn på bildet").inputValue(),
    "Fasade · kontrollert",
    "Close/reopen keeps draft and blob",
  );
  await page.reload();
  await btn("Fasadebilde").click();
  eq(
    await page.getByLabel("Navn på bildet").inputValue(),
    "Fasade · kontrollert",
    "Reload recovers scoped draft",
  );
  await dialog().locator(".bolig-visual-marker").first().waitFor();
  await page.evaluate(() => {
    window.__loseUpload = true;
    window.__loseSave = true;
  });
  await btn("Forhåndsvis endringer").click();
  await btn("Lagre bilde og felt").click();
  await btn("Prøv samme lagring igjen").waitFor();
  const first = await page.evaluate(
    () =>
      window.__calls.filter((c) => c.args?.p_action === "publish").at(-1).args,
  );
  eq(
    await btn("Forkast bildeutkast").count(),
    0,
    "Uncertain save cannot be silently discarded",
  );
  await btn("Lukk og behold kladd").click();
  await page.reload();
  await btn("Fasadebilde").click();
  await btn("Prøv samme lagring igjen").click();
  await dialog().waitFor({ state: "detached" });
  const second = await page.evaluate(
    () =>
      window.__calls.filter((c) => c.args?.p_action === "publish").at(-1).args,
  );
  eq(
    second,
    first,
    "Retry after reload uses the exact same request and expected revision",
  );
  eq(
    await page.evaluate(() => Object.values(window.__store)[0].versions.length),
    1,
  );
  await page
    .getByRole("button", { name: "H0101 · Se over varegrunnlag", exact: true })
    .click();
  eq(
    await page.getByLabel("Valgt stabil ID").textContent(),
    await page.evaluate(() => window.__targets[0].id),
  );
  await btn("Fasadebilde").click();
  await page.getByLabel("Navn på bildet").fill("Usendt før konflikt");
  await page.evaluate(() => {
    window.__basis = "basis-2";
    window.dispatchEvent(new Event("focus"));
  });
  await page.getByText("Grunnlaget er endret.", { exact: false }).waitFor();
  eq(await btn("Lagre bilde og felt").isEnabled(), false);
  await btn("Bruk siste grunnlag og behold tilgjengelige felt").click();
  eq(
    await page.getByLabel("Navn på bildet").inputValue(),
    "Usendt før konflikt",
  );
  await btn("Forhåndsvis endringer").click();
  await btn("Lagre bilde og felt").click();
  await dialog().waitFor({ state: "detached" });
  await btn("Bildehistorikk").click();
  eq(
    await page
      .getByRole("dialog", { name: "Bildehistorikk", exact: true })
      .locator("details")
      .count(),
    2,
  );
  await page
    .getByRole("dialog", { name: "Bildehistorikk", exact: true })
    .locator("summary")
    .last()
    .click();
  await btn("Bruk som nytt bildeutkast").last().click();
  eq(
    await page.getByLabel("Navn på bildet").inputValue(),
    "Fasade · kontrollert",
  );
  await btn("Forhåndsvis endringer").click();
  await btn("Lagre bilde og felt").click();
  await dialog().waitFor({ state: "detached" });
  eq(
    await page.evaluate(
      () => Object.values(window.__store)[0].sheets[0].revision,
    ),
    3,
  );
  await btn("Fasadebilde").click();
  await page.getByLabel("Bruk vanlig illustrasjon i stedet").check();
  await btn("Forhåndsvis endringer").click();
  await btn("Lagre bilde og felt").click();
  await dialog().waitFor({ state: "detached" });
  eq(
    await btn("Standardvisning").count(),
    1,
    "Hiding own facade returns to unchanged standard scene",
  );
  await page.evaluate(() => window.__render("plan"));
  await page.getByText("Plantegninger", { exact: false }).first().click();
  await btn("Legg til plantegning").click();
  await page.getByLabel("Velg prosjektbilde", { exact: true }).setInputFiles({
    name: "plan.webp",
    mimeType: "image/webp",
    buffer: fs.readFileSync("public/bolig/fasade.webp"),
  });
  await dialog().locator(".bolig-visual-marker").first().waitFor();
  eq(await dialog().locator(".bolig-visual-marker").count(), 2);
  await page.getByLabel("Navn på bildet").fill("1. etasje");
  await btn("Forhåndsvis endringer").click();
  await btn("Lagre bilde og felt").click();
  await dialog().waitFor({ state: "detached" });
  await page
    .getByRole("button", { name: "Bad 1 · Se over varegrunnlag", exact: true })
    .click();
  eq(
    await page.getByLabel("Valgt stabil ID").textContent(),
    await page.evaluate(() => window.__rooms[0].id),
  );
  await btn("Rediger plantegning").click();
  await page.getByLabel("Navn på bildet").fill("Kladd ved dvale");
  await page.evaluate(() => {
    window.__native = document.querySelector("input[type=file]");
    window.__deny = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page
    .getByText("Bildetilgangen må bekreftes før du fortsetter.", {
      exact: false,
    })
    .waitFor();
  eq(
    await page.evaluate(
      () => window.__native === document.querySelector("input[type=file]"),
    ),
    true,
  );
  eq(await btn("Lagre bilde og felt").isEnabled(), false);
  await page.evaluate(() => {
    window.__deny = false;
  });
  await btn("Kontroller tilgang").click();
  await page.getByLabel("Navn på bildet").waitFor();
  eq(await page.getByLabel("Navn på bildet").inputValue(), "Kladd ved dvale");
  await btn("Forkast bildeutkast").click();
  await page.evaluate(() => {
    window.__context.role = "reader";
    window.__render("plan");
  });
  await page.getByText("Plantegninger", { exact: false }).first().click();
  await page
    .getByRole("button", { name: "Bad 1 · Se over varegrunnlag", exact: true })
    .waitFor();
  eq(await btn("Rediger plantegning").count(), 0);
  eq(await btn("Legg til plantegning").count(), 0);
  await page.evaluate(() => {
    window.__context.company_id = "78000000-0000-4000-8000-000000000099";
    window.__context.role = "manager";
    window.__render();
  });
  await btn("Standardvisning").waitFor();
  eq(
    await page.locator(".bolig-visual-marker").count(),
    0,
    "Company switch never renders the previous company's private image/fields",
  );
  eq(errors, [], "Actual components have no browser exceptions");
  console.log(
    `PASS visual Chromium: ${checks} assertions; images, placement, versions, exact retry, local blob, focus, scope, reader/revocation and 320/390/768/1366px.`,
  );
} catch (error) {
  if (page)
    await page
      .screenshot({
        path: "/tmp/bolig-visual-browser-failure.png",
        fullPage: true,
      })
      .catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
}
