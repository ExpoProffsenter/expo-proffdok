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
    if (req.url === "/expo-logo.png") {
      res.setHeader("content-type", "image/png");
      res.end(fs.readFileSync(path.join(cwd, "public/expo-logo.png")));
    } else if (req.url === "/app.js") {
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
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://expo-proffdok.app/expo-logo.png", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: fs.readFileSync("public/expo-logo.png"),
    }),
  );
  await page.goto("http://127.0.0.1:" + server.address().port);
  const button = (name) => page.getByRole("button", { name, exact: true }),
    dialog = (name) => page.getByRole("dialog", { name, exact: true });

  await button("Gi tilgang").waitFor();
  await button("Gi tilgang").click();
  let d = dialog("Gi UE eller leverandør tilgang");
  await d.getByLabel("Bedrift", { exact: true }).fill("QA Leverandør");
  await d.getByLabel("Kontaktperson", { exact: true }).fill("Per Partner");
  await d.getByLabel("E-post", { exact: true }).fill("per@qa.invalid");
  eq(
    await d
      .getByRole("checkbox", { name: "Fremdrift", exact: false })
      .isChecked(),
    true,
    "supplier suggests progress",
  );
  eq(
    await d
      .getByRole("checkbox", {
        name: "Bestillinger og leveranser",
        exact: false,
      })
      .isChecked(),
    true,
    "supplier suggests orders",
  );
  await d.getByLabel("Type", { exact: true }).selectOption("ue");
  eq(
    await d
      .getByRole("checkbox", { name: "Sjekklister", exact: false })
      .isChecked(),
    true,
    "UE suggests checklists",
  );
  eq(
    await d
      .getByRole("checkbox", {
        name: "Bestillinger og leveranser",
        exact: false,
      })
      .isChecked(),
    false,
    "UE does not default orders",
  );
  await d.getByLabel("Type", { exact: true }).selectOption("supplier");
  await d.getByRole("checkbox", { name: "Sjekklister", exact: false }).check();
  await d
    .getByLabel("Leverandør på bestillingene", { exact: false })
    .fill("QA Leverandør");
  eq(
    await d.getByRole("checkbox").count(),
    3,
    "only function choices, no apartment selector",
  );
  eq(
    await d
      .getByText("Hele boligprosjektet · 40 leiligheter", { exact: true })
      .count(),
    1,
    "all apartments explicit",
  );
  await button("Lukk og behold utkast").click();
  await button("Gi tilgang").click();
  eq(
    await d.getByLabel("Kontaktperson", { exact: true }).inputValue(),
    "Per Partner",
    "manager draft reopens",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await d.getByLabel("Kontaktperson", { exact: true }).waitFor();
  eq(
    await d.getByLabel("Kontaktperson", { exact: true }).inputValue(),
    "Per Partner",
    "focus keeps manager draft",
  );
  await page.evaluate(() => (window.__fail = true));
  await button("Opprett tilgangslenke").click();
  await button("Prøv samme forsøk igjen").waitFor();
  const first = await page.evaluate(
    () =>
      window.__calls.filter((x) => x.args?.p_action === "create")[0].args
        .p_payload,
  );
  await button("Prøv samme forsøk igjen").click();
  await dialog("QA Leverandør – oppfølging").waitFor();
  const second = await page.evaluate(
    () =>
      window.__calls.filter((x) => x.args?.p_action === "create")[1].args
        .p_payload,
  );
  eq(second, first, "exact create retry");
  eq(
    await page
      .getByLabel("Tilgangslenke", { exact: true })
      .inputValue()
      .then((x) => x.includes("#partner=")),
    true,
  );
  eq(
    await page
      .getByText("Ingen invitasjon er sendt.", { exact: false })
      .count(),
    1,
  );
  const invitation = page.getByRole("region", {
    name: "Send tilgangslenke",
    exact: true,
  });
  await invitation
    .getByRole("button", { name: "Send tilgangslenke", exact: true })
    .waitFor();
  eq(
    await invitation.innerText().then((text) => text.includes(first.email)),
    true,
    "same visible named contact is the recipient",
  );
  await invitation.getByText("Forhåndsvis e-post", { exact: true }).click();
  eq(
    await invitation.locator("iframe").getAttribute("sandbox"),
    "",
    "preview cannot run scripts or navigate the parent",
  );
  eq(
    (await invitation.locator("iframe").getAttribute("srcdoc")).includes(
      "background:#242424",
    ),
    true,
    "existing app mail style",
  );
  await page.evaluate(() => (window.__failMail = true));
  await invitation
    .getByRole("button", { name: "Send tilgangslenke", exact: true })
    .click();
  await invitation
    .getByRole("button", { name: "Prøv samme sending igjen", exact: true })
    .waitFor();
  await page.evaluate(() => window.__managerRemount());
  await page.getByRole("button", { name: /QA Leverandør/ }).click();
  await invitation
    .getByRole("button", { name: "Prøv samme sending igjen", exact: true })
    .click();
  await invitation
    .getByRole("button", { name: "Send lenken på nytt", exact: true })
    .waitFor();
  const mailAttempts = await page.evaluate(() => window.__mailCalls);
  eq(
    mailAttempts[0],
    mailAttempts[1],
    "email retry preserves exact request and token across remount",
  );
  eq(
    await invitation
      .getByText("E-posttjenesten har bekreftet sendingen.", { exact: true })
      .count(),
    1,
    "honest provider receipt shown",
  );
  eq(
    await page
      .getByText("Ingen invitasjon er sendt.", { exact: false })
      .count(),
    0,
    "old unsent notice cleared",
  );
  await page.evaluate(() => {
    window.__holdMail = true;
  });
  await invitation
    .getByRole("button", { name: "Send lenken på nytt", exact: true })
    .click();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await dialog("QA Leverandør – oppfølging").waitFor({ state: "hidden" });
  await page.evaluate(() => window.__releaseMail());
  eq(
    await invitation.count(),
    0,
    "late mail response cannot reveal a sleeping workspace",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await invitation
    .getByRole("button", { name: "Send lenken på nytt", exact: true })
    .waitFor();
  eq(
    (await page.evaluate(() => window.__mailHistory)).length,
    2,
    "late successful receipt recovered without duplicate mail",
  );
  await page.evaluate(() => {
    window.__mailEnabled = false;
    window.dispatchEvent(new Event("focus"));
  });
  await invitation
    .getByText("E-postutsending er pauset i dette testmiljøet.", {
      exact: false,
    })
    .waitFor();
  eq(
    await invitation
      .getByRole("button", { name: "Send lenken på nytt", exact: true })
      .isEnabled(),
    false,
    "paused transport disables send",
  );
  eq(await invitation.locator("iframe").count(), 1, "preview kept after focus");
  await page.evaluate(() => {
    window.__mailEnabled = true;
    window.dispatchEvent(new Event("focus"));
  });
  await invitation
    .getByRole("button", { name: "Send lenken på nytt", exact: true })
    .waitFor();
  await page.evaluate(() => {
    window.__staleInvitationDraft();
    window.__managerRemount();
  });
  await page.getByRole("button", { name: /QA Leverandør/ }).click();
  await invitation
    .getByText(
      "Tilgangen er endret. Se over mottaker og funksjoner før du sender.",
      { exact: true },
    )
    .waitFor();
  eq(
    await invitation
      .getByRole("button", { name: "Send lenken på nytt", exact: true })
      .count(),
    1,
    "stale never-started attempt recovers without a permanent block",
  );
  if (
    (await invitation.locator("details").first().getAttribute("open")) === null
  )
    await invitation.getByText("Forhåndsvis e-post", { exact: true }).click();
  await invitation.locator("iframe").waitFor({ state: "visible" });
  const mailFrame = page.frames().find((f) => f.url() === "about:srcdoc");
  await mailFrame
    .locator("img")
    .evaluate((img) => img.decode().catch(() => {}));
  await mailFrame
    .locator("body")
    .screenshot({ path: "/tmp/bolig-partner-invitation-email.png" });
  await page.screenshot({
    path: "/tmp/bolig-partner-invitation-desktop.png",
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "invitation mobile layout " + width,
    );
    const frame = page.frames().find((f) => f.url() === "about:srcdoc");
    eq(
      await frame.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "email itself fits narrow viewport " + width,
    );
  }
  await page.screenshot({
    path: "/tmp/bolig-partner-invitation-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1366, height: 900 });
  await button("Endre funksjoner").click();
  d = dialog("Endre funksjoner");
  await d
    .getByRole("checkbox", { name: "Sjekklister", exact: false })
    .uncheck();
  await page.evaluate(() => (window.__fail = true));
  await button("Lagre funksjoner").click();
  await button("Prøv samme forsøk igjen").click();
  await dialog("QA Leverandør – oppfølging").waitFor();
  const permissions = await page.evaluate(() =>
    window.__calls
      .filter((x) => x.args?.p_action === "permissions")
      .map((x) => x.args.p_payload),
  );
  eq(permissions[0], permissions[1], "permissions exact retry");
  eq(
    await page.getByLabel("Tilgangslenke", { exact: true }).inputValue(),
    `${new URL(page.url()).origin}/bolig-kunde.html#partner=${first.token}`,
    "permissions retains token",
  );
  await button("Endre funksjoner").click();
  d = dialog("Endre funksjoner");
  await d.getByRole("checkbox", { name: "Sjekklister", exact: false }).check();
  await button("Lukk og behold utkast").click();
  await page.evaluate(() => window.__managerRemount());
  await button("Gi tilgang").click();
  d = dialog("Endre funksjoner");
  eq(
    await d
      .getByRole("checkbox", { name: "Sjekklister", exact: false })
      .isChecked(),
    true,
    "permission draft retained across remount",
  );
  eq(
    await d.getByLabel("Kontaktperson", { exact: true }).isDisabled(),
    true,
    "remounted edit keeps identity immutable",
  );
  await page.evaluate(() => window.__advanceRevision());
  await button("Lagre funksjoner").click();
  await button("Jeg har sett siste tilgang").waitFor();
  eq(
    await button("Lagre funksjoner").isDisabled(),
    true,
    "stale permissions require review",
  );
  eq(
    await d
      .getByRole("checkbox", { name: "Sjekklister", exact: false })
      .isChecked(),
    true,
    "stale conflict preserves choices",
  );
  await button("Jeg har sett siste tilgang").click();
  await button("Lagre funksjoner").click();
  await dialog("QA Leverandør – oppfølging").waitFor();
  await page
    .getByLabel("Lukk qa leverandør – oppfølging", { exact: true })
    .click();
  await page.evaluate(() => window.__render("reader"));
  await button("Gi tilgang").waitFor({ state: "hidden" });
  await page.getByText("1 aktive tilganger", { exact: false }).waitFor();
  eq(await button("Gi tilgang").count(), 0, "reader cannot grant");
  await page.evaluate(() => window.__portal());
  await page
    .getByRole("heading", { name: "Solgløtt borettslag", exact: true })
    .waitFor();
  eq(
    await page.title(),
    "Prosjektsamarbeid · Expo ProffDok",
    "partner route has its own title",
  );
  eq(
    await page
      .getByRole("img", { name: "Expo Proffsenter", exact: true })
      .count(),
    1,
    "visible app branding",
  );
  eq(
    await page.getByRole("region", { name: "Samlet Gantt-skjema" }).count(),
    1,
    "progress opens as Gantt",
  );
  eq(
    await page.locator(".bolig-gantt-row.summary").count(),
    1,
    "Gantt begins with apartment overview",
  );
  eq(
    await page.locator(".bolig-gantt-bar").count(),
    0,
    "activities initially folded",
  );
  eq(
    await button("Se over datoendringer").count(),
    0,
    "no external plan editor",
  );
  eq(
    await page.getByText(/Dra for å flytte/).count(),
    0,
    "no misleading drag instruction",
  );
  eq(
    await page
      .getByRole("button", { name: "Leveranser (1)", exact: true })
      .count(),
    1,
  );
  eq(
    await page
      .getByRole("button", { name: "Fremdrift (1)", exact: true })
      .count(),
    1,
  );
  await button("Sjekklister (1)").click();
  // Completed controls now live in the collapsed group; keep the original
  // point/status/readonly assertions after opening it through the user flow.
  await page
    .getByRole("region", { name: "Prosjektets sjekklister", exact: true })
    .getByRole("button", { name: "Fullførte (1)", exact: true })
    .click();
  await page.getByText("Se kontrollpunkter (1)", { exact: true }).click();
  eq(
    await page.getByText("Servant kontrollert", { exact: true }).count(),
    1,
    "readonly checklist points available",
  );
  eq(
    await page.getByText("Avvik", { exact: true }).count(),
    1,
    "checklist status available",
  );
  eq(
    await button("Bekreft dato / meld avvik").count(),
    0,
    "checklist is read only",
  );
  await button("Leveranser (1)").click();
  await button("Bekreft dato / meld avvik").click();
  d = dialog("Bekreft dato eller meld avvik");
  await d
    .getByLabel("Leverandørens eget ordrenummer (valgfritt)", { exact: true })
    .fill("LEV-42");
  await d.getByLabel("Merknad", { exact: true }).fill("QA bekreftet");
  await button("Lukk og behold utkast").click();
  await button("Fortsett svarutkast").click();
  eq(
    await d.getByLabel("Merknad", { exact: true }).inputValue(),
    "QA bekreftet",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await d.getByLabel("Merknad", { exact: true }).waitFor();
  eq(
    await d.getByLabel("Merknad", { exact: true }).inputValue(),
    "QA bekreftet",
    "focus keeps response draft",
  );
  await page.evaluate(() => (window.__fail = true));
  await button("Registrer svar").click();
  await button("Prøv samme svar igjen").waitFor();
  await button("Lukk og behold utkast").click();
  await page.evaluate(() => window.__remount());
  await button("Fortsett svarutkast").waitFor();
  await button("Fortsett svarutkast").click();
  await button("Prøv samme svar igjen").click();
  await page
    .getByText("Svaret er registrert hos prosjektet.", { exact: true })
    .waitFor();
  await button("Leveranser (1)").click();
  eq(
    await page.locator(".bolig-partner-response").count(),
    1,
    "lost response replay displays one event",
  );
  let answers = await page.evaluate(() =>
    window.__calls
      .filter((x) => x.p_action === "respond")
      .map((x) => x.p_payload),
  );
  eq(answers[0], answers[1], "same payload after remount");
  eq(
    await page.evaluate(() => window.__received),
    1,
    "response does not mark receipt",
  );
  await button("Fremdrift (1)").click();
  await button("Vis alle aktiviteter").click();
  const callsBeforeChart = await page.evaluate(() => window.__calls.length);
  await page.locator(".bolig-gantt-bar").press("Alt+ArrowRight");
  eq(
    await page.evaluate(() => window.__calls.length),
    callsBeforeChart,
    "readonly keyboard cannot change plan",
  );
  await page.locator(".bolig-gantt-bar").press("Enter");
  eq(
    await dialog("Aktivitetsdetaljer").count(),
    1,
    "chart opens current activity details",
  );
  await button("Bekreft dato / meld avvik").click();
  d = dialog("Bekreft dato eller meld avvik");
  await d.getByLabel("Svar", { exact: true }).selectOption("issue");
  await d
    .getByLabel("Merknad – beskriv avviket", { exact: true })
    .fill("Forsinket leveranse");
  await page.evaluate(() => {
    window.__changeBasis();
    window.dispatchEvent(new Event("focus"));
  });
  await button("Jeg har sett siste grunnlag").waitFor();
  eq(
    await button("Registrer svar").isDisabled(),
    true,
    "changed dates need reviewed basis",
  );
  eq(
    await d
      .getByLabel("Merknad – beskriv avviket", { exact: true })
      .inputValue(),
    "Forsinket leveranse",
  );
  await button("Jeg har sett siste grunnlag").click();
  await button("Registrer svar").click();
  await page
    .getByText("Svaret er registrert hos prosjektet.", { exact: true })
    .waitFor();
  await page.locator(".bolig-gantt-bar").press("Enter");
  await page.getByText("Avvik meldt", { exact: true }).waitFor();
  eq(await page.getByText("Forsinket leveranse", { exact: true }).count(), 1);
  await page.evaluate(() => {
    window.__changeBasis();
    window.dispatchEvent(new Event("focus"));
  });
  await page
    .getByText("Avvik meldt · eldre grunnlag", { exact: true })
    .waitFor();
  eq(
    await page
      .getByText("Avvik meldt · eldre grunnlag", { exact: true })
      .count(),
    1,
    "changed server data keeps historical response",
  );
  await page.getByLabel("Lukk aktivitetsdetaljer", { exact: true }).click();
  for (const width of [1366, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({
      path: "/tmp/bolig-partner-portal-" + width + ".png",
      fullPage: true,
    });
    eq(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "no horizontal overflow " + width,
    );
  }
  await page.locator(".bolig-gantt-bar").press("Enter");
  await button("Bekreft dato / meld avvik").click();
  d = dialog("Bekreft dato eller meld avvik");
  await page.screenshot({
    path: "/tmp/bolig-partner-answer-mobile.png",
    fullPage: true,
  });
  await page.evaluate(() => {
    window.__hold = true;
    window.dispatchEvent(new Event("focus"));
  });
  await page.getByText("Kontrollerer tilgangen …", { exact: true }).waitFor();
  await page.evaluate(() => {
    window.__deny = true;
    window.__release();
  });
  await page
    .getByText("Tilgangen kunne ikke bekreftes", { exact: true })
    .waitFor();
  eq(
    await page.getByText("Solgløtt borettslag", { exact: true }).count(),
    0,
    "revoked access hides loaded project",
  );
  eq(
    await page.getByRole("dialog").count(),
    0,
    "revoked access hides open answer form",
  );
  eq(
    await page.getByRole("region", { name: "Samlet Gantt-skjema" }).count(),
    0,
    "revoked access hides chart",
  );
  await page.evaluate(() => {
    window.__deny = false;
    window.dispatchEvent(new Event("focus"));
  });
  d = dialog("Bekreft dato eller meld avvik");
  await d.waitFor();
  await d.getByLabel("Svar", { exact: true }).selectOption("issue");
  await d
    .getByLabel("Merknad – beskriv avviket", { exact: true })
    .fill("QA sent svar etter dvale");
  if (await button("Jeg har sett siste grunnlag").count())
    await button("Jeg har sett siste grunnlag").click();
  await page.evaluate(() => (window.__hold = true));
  await button("Registrer svar").click();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  eq(await page.getByRole("dialog").count(), 0, "sleep hides in-flight form");
  await page.evaluate(() => window.__release());
  eq(
    await page.getByText("Solgløtt borettslag", { exact: true }).count(),
    0,
    "late write cannot reveal hidden project",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await dialog("Bekreft dato eller meld avvik").waitFor();
  await button("Prøv samme svar igjen").waitFor();
  eq(
    await button("Prøv samme svar igjen").isEnabled(),
    true,
    "late response retains exact attempt for receipt recovery",
  );
  await button("Prøv samme svar igjen").click();
  await page
    .getByText("Svaret er registrert hos prosjektet.", { exact: true })
    .waitFor();
  eq(
    (
      await page.evaluate(() =>
        window.__calls
          .filter((x) => x.p_action === "respond")
          .slice(-2)
          .map((x) => x.p_payload),
      )
    )[0],
    (
      await page.evaluate(() =>
        window.__calls
          .filter((x) => x.p_action === "respond")
          .slice(-2)
          .map((x) => x.p_payload),
      )
    )[1],
    "in-flight late replay uses same payload",
  );
  await page.evaluate(() => {
    window.__futureUnit();
    window.dispatchEvent(new Event("focus"));
  });
  await button("Fremdrift (2)").click();
  await button("Vis alle aktiviteter").click();
  eq(
    await page
      .locator(".bolig-gantt-label")
      .getByText("Ny leilighet", { exact: true })
      .count(),
    1,
    "new apartment included without selections",
  );
  eq(
    await page
      .getByText(
        "Hele prosjektet · 41 leiligheter. Nye leiligheter omfattes automatisk.",
        { exact: true },
      )
      .count(),
    1,
  );
  await page.getByRole("searchbox").fill("H0201");
  eq(
    await page
      .locator(".bolig-gantt-row:not(.summary):not(.bolig-gantt-calendar)")
      .count(),
    1,
    "apartment search filters rows",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  eq(
    await page.getByRole("region", { name: "Samlet Gantt-skjema" }).count(),
    0,
    "sleep hides chart",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.getByRole("region", { name: "Samlet Gantt-skjema" }).waitFor();
  eq(
    await page.getByRole("searchbox").inputValue(),
    "H0201",
    "chart search survives reauthorization",
  );
  eq(
    await page
      .locator(".bolig-gantt-row:not(.summary):not(.bolig-gantt-calendar)")
      .count(),
    1,
    "chart expansion survives reauthorization",
  );
  await page.evaluate(() => {
    window.__features(["orders"]);
    window.dispatchEvent(new Event("focus"));
  });
  await button("Leveranser (1)").waitFor();
  eq(
    await page.getByRole("button", { name: /^Fremdrift/ }).count(),
    0,
    "removed feature hides navigation",
  );
  eq(
    await page.getByRole("button", { name: /^Sjekklister/ }).count(),
    0,
    "disabled checklist hidden",
  );
  eq(errors, [], "no runtime errors");
  console.log(
    "PASS bolig partner Chromium: " + checks + " assertions. " + temp,
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
