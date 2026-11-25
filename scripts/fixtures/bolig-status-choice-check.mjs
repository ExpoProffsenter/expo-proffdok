// Shared assertions against the actual Bolig and UE editors, no UI stubs.
export async function exerciseBoligStatusChoices(page, group, eq, { name, allowNa = true }) {
  const statuses = ["OK", ...(allowNa ? ["Ikke aktuelt"] : []), "Avvik"];
  const button = status => group.getByRole("button", { name: status, exact: true });
  eq(await group.getByRole("button").allTextContents(), statuses, name + ": original allowed statuses only");
  for (const width of [320, 390, 768, 1363, 1920]) {
    await page.setViewportSize({ width, height: width === 1363 ? 600 : 900 });
    for (const status of statuses) {
      if (await button(status).getAttribute("aria-pressed") !== "true") await button(status).click();
      eq(await group.locator('[aria-pressed="true"]').allTextContents(), [status], name + ": one selected status " + status + "/" + width);
      eq(await group.getByRole("button").evaluateAll(nodes => nodes.every(n => {
        const r = n.getBoundingClientRect(), s = getComputedStyle(n), b = n.querySelector(".bolig-checklist-status-box").getBoundingClientRect();
        return r.height >= 44 && r.width >= 44 && s.fontSize === "16px" && b.width === 20 && b.height === 20 && r.left >= 0 && r.right <= innerWidth + 1;
      })), true, name + ": 16px text / 20px boxes / 44px targets fit " + width);
      eq(await button(status).locator(".bolig-checklist-status-box").evaluate(n => getComputedStyle(n).backgroundColor), status === "Avvik" ? "rgb(190, 101, 13)" : "rgb(33, 131, 76)", name + ": selected color " + status);
      eq(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, name + ": no horizontal overflow " + width);
    }
    await button("Avvik").click();
    eq(await group.locator('[aria-pressed="true"]').count(), 0, name + ": can clear result " + width);
  }
  await page.setViewportSize({ width: 1363, height: 900 });
  await button("OK").focus();
  await page.keyboard.press("Space");
  eq(await button("OK").getAttribute("aria-pressed"), "true", name + ": Space selects");
  eq(await button("OK").evaluate(n => n.matches(":focus-visible")), true, name + ": keyboard focus visible");
  await page.keyboard.press("Enter");
  eq(await button("OK").getAttribute("aria-pressed"), "false", name + ": Enter clears without form submit");
  await button("OK").click();
  if (process.env.BOLIG_STATUS_SHOTS) for (const width of [390, 1363]) {
    await page.setViewportSize({ width, height: 900 });
    await button("Avvik").click();
    await group.scrollIntoViewIfNeeded();
    await page.screenshot({ path: process.env.BOLIG_STATUS_SHOTS + "/" + name + "-after-" + width + ".png" });
    await button("OK").click();
  }
  await page.setViewportSize({ width: 1366, height: 900 });
}
