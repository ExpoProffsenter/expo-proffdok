import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { build } from "vite";
import react from "@vitejs/plugin-react";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = process.cwd();
let checks = 0, browser;
const eq = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; };
const round = (value) => Math.round(value * 1000) / 1000;
const outputDir = process.env.SALES_CASE_PREVIEW_SCREENSHOTS;
const measurements = [];
if (outputDir) fs.mkdirSync(outputDir, { recursive: true });
const built = await build({ root, configFile: false, logLevel: "silent", plugins: [react(), {
  name: "preview-isolation", enforce: "pre",
  resolveId(id) { if (id.endsWith("/salesStoreOfferTemplates.js")) return "\0templates"; if (/\/(SalesContractActions|SalesContractWizard|SalesWetroomFollowUpActions|CordelOfferExport)\.jsx$/.test(id)) return "\0empty"; },
  load(id) { if (id === "\0templates") return "export const loadStoreTextTemplates=async()=>[];export const saveStoreTextTemplate=async()=>{throw Error('No template writes');};export const removeStoreTextTemplate=async()=>{throw Error('No template deletion');};"; if (id === "\0empty") return "export default function(){return null;}"; },
}], resolve: { alias: { react: path.join(root, "node_modules/react"), "react-dom": path.join(root, "node_modules/react-dom") } },
define: { "process.env.NODE_ENV": '"production"', "import.meta.env.VITE_SUPABASE_URL": '""', "import.meta.env.VITE_SUPABASE_ANON_KEY": '""' },
build: { write: false, minify: false, target: "esnext", lib: { entry: path.join(root, "scripts/fixtures/sales-case-customer-preview-harness.jsx"), formats: ["es"], name: "CasePreviewQA", cssFileName: "case-preview" } } });
const output = (Array.isArray(built) ? built[0] : built).output;
const js = output.find((item) => item.type === "chunk" && item.isEntry).code;
const css = output.filter((item) => item.type === "asset" && item.fileName.endsWith(".css")).map((item) => item.source).join("\n");
const server = http.createServer((req, res) => {
  // Brand choices use the app's real public assets. Keep them local too, so a
  // visual fixture does not invent broken logos by returning HTML for images.
  const pathname = new URL(req.url, "http://127.0.0.1").pathname;
  if (/^\/brands\/[a-zA-Z0-9._-]+\.png$/.test(pathname)) {
    const asset = path.join(root, "public", pathname);
    if (fs.existsSync(asset)) { res.setHeader("Content-Type", "image/png"); res.end(fs.readFileSync(asset)); return; }
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + css + '</style><div id="app"></div><script type="module">' + js.replaceAll("</script", "<\\/script") + "</script>");
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1363, height: 936 } });
  const outbound = [], errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") return route.continue();
    outbound.push(route.request().url()); return route.abort("blockedbyclient");
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => Boolean(window.qa?.show));
  const waitForWorkspace = (mode, index = 2) => page.waitForFunction(({ mode, index }) => {
    const committed = window.qa.committed;
    const input = document.querySelector('.sales-case-work-content textarea');
    return committed?.mode === mode && committed.index === index && committed.input === input && (!input || input.isConnected);
  }, { mode, index });
  const waitForReadingLayout = () => page.waitForFunction(() => {
    const dialog = document.querySelector('.sales-case-preview-drawer');
    return dialog && dialog.open === (innerWidth > 1000) && !dialog.classList.contains('is-expanded');
  });
  const draftState = (phase) => page.evaluate((phase) => ({ phase, mode: window.qa.committed.mode, values: window.qa.committed.values, current: document.querySelector('.sales-case-work-content textarea')?.value, sameNode: window.qa.committed.input === window.qa.editorNode, updates: window.qa.updates.slice(-6) }), phase);
  const waitForFormUpdate = async (mode, value, from) => {
    try {
      await page.waitForFunction(({ mode, value, from }) => {
        const committed = window.qa.committed;
        return committed?.mode === mode && committed.values[mode] === value && committed.input === document.querySelector('.sales-case-work-content textarea') &&
          window.qa.updates.slice(from).some(update => update.form === mode && update.value === value);
      }, { mode, value, from });
    } catch (error) { throw new Error(`${mode}: native update/React commit not acknowledged ${JSON.stringify(await draftState('fill-timeout'))}`, { cause: error }); }
  };
  const expected = ["empty", "draft", "draft", "published", "accepted", "accepted", "draft", "accepted", "empty"];
  for (const [width, height] of [[320, 936], [390, 600], [768, 936], [1363, 600], [1920, 936]]) {
    await page.setViewportSize({ width, height });
    for (let index = 0; index < expected.length; index++) {
      await page.evaluate((value) => window.qa.show(value), index);
      const panel = page.locator(".sales-case-customer-preview");
      await waitForWorkspace("detail", index);
      await page.waitForFunction((kind) => document.querySelector(".sales-case-customer-preview")?.dataset.previewKind === kind, expected[index]);
      eq(await panel.getAttribute("data-preview-kind"), expected[index], `${width}/${index}: correct source state`);
      eq(await page.locator(".sales-detail-hero .sales-title").evaluate((node, minimum) => parseFloat(getComputedStyle(node).fontSize) >= minimum, width <= 760 ? 29 : 34), true, `${width}/${index}: case title retains approved mobile/desktop text size`);
      if (width <= 1000) {
        eq(await page.locator(".sales-case-preview-drawer").evaluate((node) => node.open), false, `${width}/${index}: customer view initially collapsed`);
        await panel.getByRole("button", { name: "Kundevisning", exact: true }).click();
      }
      const drawer = page.locator(".sales-case-preview-drawer");
      await drawer.waitFor({ state: "visible" });
      eq(await drawer.evaluate((node) => node.open), true, `${width}/${index}: customer reading panel opens`);
      eq(await drawer.locator(".sales-customer-accept-form,.store-customer-decision-shell").count(), 0, `${width}/${index}: no customer decision form`);
      eq(await drawer.locator('input:not(:disabled),textarea:not(:disabled),select:not(:disabled)').count(), 0, `${width}/${index}: no new customer choices`);
      eq(/Gjør eventuelle valg før du aksepterer|Valg du prøver her/.test(await drawer.textContent()), false, `${width}/${index}: passive copy does not invite customer choices`);
      eq(await drawer.evaluate((node) => node.scrollWidth <= node.clientWidth + 1), true, `${width}/${index}: panel does not overflow`);
      eq(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${width}/${index}: page does not overflow`);
      const geometry = await drawer.evaluate((node) => {
        const bounds = node.getBoundingClientRect();
        return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
          buttons: [...node.querySelectorAll("button")].filter((button) => button.getClientRects().length).map((button) => {
            const rect = button.getBoundingClientRect(); return { text: button.textContent.trim() || button.getAttribute("aria-label"), width: rect.width, height: rect.height, font: parseFloat(getComputedStyle(button).fontSize) };
          }) };
      });
      measurements.push({ width, height, index, kind: expected[index], ...geometry });
      eq(geometry.buttons.every((button) => round(button.width) >= 44 && round(button.height) >= 44), true, `${width}/${index}: visible buttons >=44px ${JSON.stringify(geometry.buttons)}`);
      eq(geometry.buttons.every((button) => button.font >= 16), true, `${width}/${index}: button text >=16px`);
      if (width > 1000) {
        eq(await page.locator(".sales-case-work-content").evaluate((node) => node.getBoundingClientRect().right <= document.querySelector(".sales-case-customer-preview").getBoundingClientRect().left + 1), true, `${width}/${index}: real right column`);
        eq(await page.locator(".sales-detail-hero").evaluate((node) => node.getBoundingClientRect().height <= 180), true, `${width}/${index}: compact case heading, not a large empty hero`);
      } else {
        eq(geometry.height <= height && geometry.y >= 0, true, `${width}/${index}: mobile drawer fits viewport`);
      }
      if ([3, 4, 5].includes(index)) {
        eq((await drawer.textContent()).includes("Låst grunnarbeid"), true, `${width}/${index}: immutable customer delivery including native quantity labels`);
        eq(await drawer.getByText("Nyere versjon som ikke er akseptert", { exact: true }).count(), 0, `${width}/${index}: newer unrelated version excluded`);
        eq(await drawer.locator(".sales-customer-company-name").textContent(), "Historisk QA firma", `${width}/${index}: historical legal company remains visible`);
        eq(await drawer.locator(".sales-customer-company-logo").getAttribute("src"), await page.evaluate(() => window.qa.cases[3].offerVersions[0].lines[0].logoUrl), `${width}/${index}: actual stored company logo retained`);
        eq(await drawer.locator(".sales-customer-company-card").evaluate((node) => node.getBoundingClientRect().top <= node.parentElement.querySelector(".sales-customer-hero-content").getBoundingClientRect().top), true, `${width}/${index}: company/logo starts the customer paper`);
      }
      if ([4, 5].includes(index)) eq(await drawer.locator('input[type="checkbox"]:checked').count(), 1, `${width}/${index}: actual accepted choice retained`);
      if (index === 8) eq((await drawer.textContent()).includes("Kun publisert, ikke bekreftet akseptert"), false, `${width}/${index}: missing accepted basis cannot show later unaccepted version`);
      if (outputDir && [0, 2, 5, 6].includes(index)) await page.screenshot({ path: path.join(outputDir, `case-${index}-${width}x${height}.png`), fullPage: true });
      if (width <= 1000) { await page.keyboard.press("Escape"); eq(await drawer.evaluate((node) => node.open), false, `${width}/${index}: Escape closes only reading panel`); }
    }
  }
  // Reproduce the former readiness bug deterministically: an old textarea can
  // satisfy waitFor() while a different form's React commit is still pending.
  await page.setViewportSize({ width: 390, height: 600 });
  await page.evaluate(() => window.qa.show(2, 'plan'));
  await waitForWorkspace('plan');
  await waitForReadingLayout();
  const staleInput = page.locator('.sales-case-work-content textarea').first();
  await staleInput.evaluate(node => { window.qa.previousFormNode = node; });
  const beforeLostFill = await page.evaluate(() => window.qa.updates.length);
  await page.evaluate(() => { window.qa.holdNextMode = true; window.qa.show(2, 'customer'); });
  await staleInput.waitFor();
  eq(await staleInput.evaluate(node => node === window.qa.previousFormNode), true, 'former textarea-only readiness succeeds against the previous form');
  const wrongFormText = 'Gated fill sent to the previous plan';
  await staleInput.fill(wrongFormText);
  await waitForFormUpdate('plan', wrongFormText, beforeLostFill);
  eq(await page.evaluate(() => window.qa.updates.at(-1).form), 'plan', 'real onChange proves the previous form received the premature fill');
  await page.evaluate(() => window.qa.releaseMode());
  await waitForWorkspace('customer');
  eq(await staleInput.inputValue(), 'Ulagret kundenotat', 'after delayed customer commit the original note is correctly unchanged');
  eq(await staleInput.inputValue() === wrongFormText, false, 'the former draft-retained assertion would fail after a wrong-form fill');
  // The new commit barrier waits for the correct DOM node before any fill.
  await page.evaluate(() => { window.qa.holdNextMode = true; window.qa.show(2, 'plan'); });
  const pendingWorkspace = waitForWorkspace('plan');
  eq(await page.evaluate(() => window.qa.committed.mode), 'customer', 'correct-mode barrier does not mistake the previous form for a completed transition');
  await page.evaluate(() => window.qa.releaseMode());
  await pendingWorkspace;
  eq(await staleInput.evaluate(node => node === window.qa.previousFormNode), false, 'commit barrier observes the newly mounted form node');
  // Exercise the actual native form components inside the shared stable wrapper.
  for (const mode of ["offer", "inspection", "plan", "customer", "activation", "general"]) for (const width of [390, 1363]) {
    await page.setViewportSize({ width, height: 600 });
    await page.evaluate((nextMode) => window.qa.show(nextMode === "general" ? 6 : 2, nextMode), mode);
    await waitForWorkspace(mode, mode === 'general' ? 6 : 2);
    await waitForReadingLayout();
    const input = page.locator(".sales-case-work-content textarea").first();
    await input.waitFor();
    eq(await page.locator(".sales-case-work-content .sales-form-hero .sales-title").evaluate((node, minimum) => parseFloat(getComputedStyle(node).fontSize) >= minimum && getComputedStyle(node).fontWeight === "600", width <= 620 ? 29 : 34), true, `${mode}/${width}: native work title matches the approved heading scale`);
    const nativeStyle = await page.locator(".sales-case-work-content").evaluate((node) => ({
      brands: [...node.querySelectorAll('.sales-header .sales-brand')].filter(item=>item.getClientRects().length).length,
      shadows: [...node.querySelectorAll('.sales-back-button,.sales-primary-button,.sales-secondary-button,.store-icon-button')].filter(item=>item.getClientRects().length&&getComputedStyle(item).boxShadow!=='none').map(item=>item.className),
    }));
    eq(nativeStyle, { brands: 0, shadows: [] }, `${mode}/${width}: no duplicated inner branding or glowing native actions`);
    if (mode === "offer" && width > 1000) {
      eq(await page.locator(".sales-offer-mobile-save").evaluate((node) => getComputedStyle(node).display), "none", "desktop duplicate save bar is suppressed inside the shared workspace");
      eq(await page.locator(".sales-offer-mobile-save").evaluate((node) => {
        if (!node.getClientRects().length) return false;
        const button = node.getBoundingClientRect(), paper = document.querySelector('.sales-case-preview-drawer').getBoundingClientRect();
        return button.left < paper.right && button.right > paper.left && button.top < paper.bottom && button.bottom > paper.top;
      }), false, "desktop save shortcut does not cover the customer reading column");
      const save = page.locator('form [data-sales-save-offer-button="true"]');
      await save.scrollIntoViewIfNeeded();
      eq(await save.evaluate((node) => { const rect=node.getBoundingClientRect();return node.getClientRects().length>0&&rect.top>=0&&rect.bottom<=innerHeight; }), true, "native form save action remains visible after scrolling to the footer");
    }
    if (outputDir) await page.screenshot({ path: path.join(outputDir, `${mode}-${width}-initial.png`), fullPage: true });
    eq(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${mode}/${width}: actual form page has no width overflow`);
    const overflow = await page.locator(".sales-case-work-content").evaluate((node) => {
      const ancestors=[];for(let item=node.querySelector('.sales-form-grid');item&&item!==node;item=item.parentElement){const style=getComputedStyle(item),rect=item.getBoundingClientRect();ancestors.push({tag:item.tagName,cls:item.className,width:rect.width,x:rect.x,padding:style.padding,box:style.boxSizing,grid:style.gridTemplateColumns});}
      return { width: node.clientWidth, scroll: node.scrollWidth, ancestors, offenders: [...node.querySelectorAll("*")].filter(item=>item.clientWidth>0&&item.scrollWidth>item.clientWidth+1).map(item=>({tag:item.tagName,cls:item.className,width:item.clientWidth,scroll:item.scrollWidth,text:item.textContent.trim().slice(0,65)})).slice(0,12) };
    });
    eq(overflow.scroll <= overflow.width + 1, true, `${mode}/${width}: actual form has no internal width overflow ${JSON.stringify(overflow)}`);
    const formControls = await page.locator(".sales-case-work-content").evaluate((node) => [...node.querySelectorAll("button,input:not([type=checkbox]):not([type=file]),textarea,select")].filter((control) => control.getClientRects().length).map((control) => {
      const rect = control.getBoundingClientRect(); return { tag: control.tagName, cls: control.className, visibleText: Boolean(control.textContent.trim()), label: control.textContent.trim() || control.getAttribute("aria-label") || control.getAttribute("placeholder"), width: rect.width, height: rect.height, font: parseFloat(getComputedStyle(control).fontSize) };
    }));
    eq(formControls.filter((control) => control.tag === "BUTTON").every((control) => round(control.width) >= 44 && round(control.height) >= 44), true, `${mode}/${width}: actual native form buttons >=44px ${JSON.stringify(formControls.filter(control=>control.tag==='BUTTON'))}`);
    const textControls = formControls.filter((control) => control.tag !== "BUTTON" || control.visibleText);
    eq(textControls.every((control) => control.font >= 16), true, `${mode}/${width}: actual visible form control text >=16px ${JSON.stringify(textControls.filter(control=>control.font<16))}`);
    const text = `${mode}/${width} · behold ulagret tekst`;
    const updatesBeforeFill = await page.evaluate(() => window.qa.updates.length);
    await input.fill(text);
    await waitForFormUpdate(mode, text, updatesBeforeFill);
    eq(await page.evaluate((currentMode) => window.qa.updates.at(-1).form === currentMode, mode), true, `${mode}/${width}: actual native onChange received the fill for the committed form`);
    eq(await page.evaluate((currentMode) => window.qa.committed.values[currentMode], mode), text, `${mode}/${width}: React state committed typed draft before resizing or opening preview`);
    await input.focus();
    await input.evaluate((node) => { window.qa.editorNode = node; });
    const draftTrace = [await draftState('filled')];
    // Cross the tablet/desktop boundary with the caret in the native form.
    await page.setViewportSize({ width: width <= 1000 ? 1363 : 768, height: 600 });
    await waitForReadingLayout();
    draftTrace.push(await draftState('resized'));
    eq(await input.evaluate((node) => node === document.activeElement), true, `${mode}/${width}: sidebar initialization/resize keeps editor focus`);
    eq(await input.evaluate((node) => node === window.qa.editorNode), true, `${mode}/${width}: resize keeps editor DOM node`);
    await page.setViewportSize({ width, height: 600 });
    await waitForReadingLayout();
    draftTrace.push(await draftState('resized-back'));
    const reading = page.locator(".sales-case-preview-drawer");
    await page.getByRole("button", { name: width <= 1000 ? "Kundevisning" : "Utvid kundevisning", exact: true }).click();
    draftTrace.push(await draftState('preview-open'));
    if (mode === "offer" && width <= 1000) eq(await reading.evaluate((node) => {
      const bar=document.querySelector('.sales-offer-mobile-save').getBoundingClientRect();
      return node.contains(document.elementFromPoint(bar.left+bar.width/2,bar.top+bar.height/2));
    }), true, "native mobile reading dialog stays above the fixed save bar");
    eq(await reading.locator(".sales-customer-accept-form,.store-customer-decision-shell").count(), 0, `${mode}/${width}: preview cannot send/accept`);
    eq(await reading.getByText(text, { exact: true }).count(), 0, `${mode}/${width}: unsaved editor text is not advertised as saved customer content`);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector(".sales-case-preview-drawer")?.classList.contains("is-expanded"));
    eq(await page.getByRole("button", { name: width <= 1000 ? "Kundevisning" : "Utvid kundevisning", exact: true }).evaluate((node) => node === document.activeElement), true, `${mode}/${width}: closing preview restores its trigger focus`);
    draftTrace.push(await draftState('preview-closed'));
    eq(await input.inputValue(), text, `${mode}/${width}: draft retained ${JSON.stringify(draftTrace)}`);
    eq(await input.evaluate((node) => node === window.qa.editorNode), true, `${mode}/${width}: same editor DOM node after preview`);
    await page.getByRole("button", { name: "Verktøy og maler", exact: true }).click();
    await page.getByRole("button", { name: "Native handling", exact: true }).click();
    eq((await page.evaluate(() => window.qa.calls)).at(-1), "tool", `${mode}/${width}: explicit tool callback preserved`);
    eq(await input.evaluate((node) => node === window.qa.editorNode), true, `${mode}/${width}: tools keep editor DOM node`);
    if (outputDir) await page.screenshot({ path: path.join(outputDir, `${mode}-${width}.png`), fullPage: true });
  }
  eq(await page.evaluate(() => JSON.stringify(window.qa.cases) === window.qa.source), true, "no source case or customer choice mutated");
  eq((await page.evaluate(() => window.qa.calls)).filter((name) => ["send", "copy", "customerOffer", "save", "activate"].includes(name)), [], "opening previews and tools did not trigger write/publish/send callbacks");
  eq(outbound, [], "hard network boundary: no outbound transport");
  eq(errors, [], "no runtime errors");
  if (outputDir) fs.writeFileSync(path.join(outputDir, "geometry.json"), JSON.stringify(measurements, null, 2));
  console.log(`PASS sales case customer preview: ${checks} Chromium assertions, ${expected.length} states ×5 viewports + actual wetroom/general/inspection/plan/customer/activation form geometry and DOM preservation`);
} finally { await browser?.close(); await new Promise((resolve) => server.close(resolve)); }

// Legacy cases missing embedded immutable snapshots use a separate read-only path.
await import('./sales-case-stored-preview-check.mjs');
await import('./sales-case-stored-preview-browser-check.mjs');
