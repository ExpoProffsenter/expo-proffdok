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
  "#${HOST_ID}{width:100%!important;min-width:0!important;justify-self:stretch!important}",
  ".workProfileButton{width:100%!important;max-width:none!important}",
  "white-space:normal;overflow:visible;text-overflow:clip",
  "Representerer",
  "Arbeidsprofil",
]);

console.log("✅ Expo ProffDok mobil shell / Representerer / appoppdatering check OK");
