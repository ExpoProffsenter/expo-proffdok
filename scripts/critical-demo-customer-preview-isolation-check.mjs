import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function assertContains(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertNotContains(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}

const launcher = read("src/modules/demo/DemoHomeLauncher.jsx");
const entry = read("src/modules/demo/DemoCustomerOfferEntry.jsx");
const page = read("demo-offer-preview.html");
const vite = read("vite.config.js");
const preview = read("src/modules/demo/DemoCustomerOfferPreview.jsx");

assertContains(
  launcher,
  'window.open("/demo-offer-preview.html", "_blank")',
  "42L: Kundevisning tilbud skal åpnes i egen demofane."
);
assertNotContains(
  launcher,
  "setShowCustomerOffer",
  "42L: kundevisningen skal ikke ligge som inline-state over intern Sales-flate."
);
assertContains(
  entry,
  'import "../sales/sales.css"',
  "42L: isolert kundevisning må laste ekte Sales-presentasjonsstil."
);
assertContains(
  entry,
  "<DemoCustomerOfferPreview",
  "42L: isolert entry skal gjenbruke eksisterende demo-kundevisning."
);
assertContains(
  page,
  'id="demo-customer-offer-root"',
  "42L: isolert kundevisningsroot mangler."
);
assertContains(
  page,
  "/src/modules/demo/DemoCustomerOfferEntry.jsx",
  "42L: demo-offer-preview.html må bruke isolert React-entry."
);
assertContains(
  vite,
  'demoOfferPreview: resolve(__dirname, "demo-offer-preview.html")',
  "42L: Vite må bygge den isolerte kundevisningssiden."
);
assertContains(
  preview,
  "Digital aksept er sperret",
  "42L: isolert kundevisning må fortsatt blokkere digital aksept."
);

console.log("✅ Demo/Test 42L isolated customer offer preview check OK");
