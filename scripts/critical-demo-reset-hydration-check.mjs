import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireText(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function forbidText(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}

const localState = read("src/modules/demo/demoLocalState.js");
const panel = read("src/modules/demo/DemoTestPanel.jsx");
const navigation = read("src/modules/demo/demoStageNavigation.js");
const launcher = read("src/modules/demo/DemoHomeLauncher.jsx");

requireText(localState, "DEMO_REQUEST_REFS", "42L: lokal demo-reset må bruke eksakte DEMO42L-referanser.");
requireText(localState, "clearDemoBrowserState", "42L: eksplisitt demo browser-reset mangler.");
requireText(localState, "Ikke slett den store Sales-listecachen", "42L: ekte/offline Sales-cache må beskyttes ved demo-reset.");
forbidText(localState, "localStorage.clear", "42L: Demo/Test må aldri tømme all localStorage.");
forbidText(localState, "sessionStorage.clear", "42L: Demo/Test må aldri tømme all sessionStorage.");
requireText(panel, "clearDemoBrowserState();", "42L: demo reset må rydde gammel lokal demo-kladd etter server-reset.");

requireText(navigation, "isDemoRequestRef(cleanRef)", "42L: bare eksakte DEMO42L-saker kan bruke demoåpning.");
requireText(navigation, "primeSalesRequestDetailRow", "42L: full DEMO-sak må primes før åpning.");
requireText(navigation, "await resolveSalesCompanyScope", "42L: demoåpning må følge aktivt firmascope.");
requireText(navigation, "await primeSalesRequestDetailRow", "42L: demoåpning kan ikke slippe summary-only rad videre.");
requireText(launcher, "await openDemoSalesStage", "42L: Startsiden må vente på full server-first demo-hydrering.");
requireText(launcher, "Åpner …", "42L: demoåpning må blokkere dobbeltklikk mens saken primes.");

console.log("✅ Demo/Test 42L reset/local recovery + full Sales hydration check OK");
