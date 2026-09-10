import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler kritisk mobil-shell guard: ${needle}`);
    }
  }
  return text;
}

const updateNotice = requireNeedles("src/modules/app/AppUpdateNotice.jsx", [
  "void checkForUpdate({ force: true });",
  "function handleVisibilityChange()",
  "function handleFocus()",
  "function handleOnline()",
  'cache: "no-store"',
]);

if (updateNotice.includes("INITIAL_CHECK_DELAY_MS")) {
  throw new Error("Appoppdatering skal ikke vente på gammel 30-sekunders initialtimer.");
}

requireNeedles("src/modules/access/workProfileUx.jsx", [
  'const MOBILE_QUERY = "(max-width: 700px)"',
  'head.insertAdjacentElement("afterend", host)',
  "display:block!important;width:100%!important;min-width:0!important;padding:0 12px 8px!important",
  ".workProfileButton{width:100%!important;max-width:none!important;min-height:54px!important}",
  "white-space:nowrap;overflow:hidden;text-overflow:ellipsis",
  "Representerer",
  "Arbeidsprofil",
]);

console.log("✅ Expo ProffDok mobil shell / Representerer / appoppdatering check OK");
