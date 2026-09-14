import { readFileSync } from "node:fs";

const componentPath = "src/modules/sales/components/SalesBathroomSketch.jsx";
const helpPath = "src/modules/help/helpToolsCore.js";
const failures = [];

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    failures.push(`${path}: kunne ikke leses (${error?.message || error})`);
    return "";
  }
}

function requireText(source, needle, message) {
  if (!source.includes(needle)) failures.push(message);
}

const component = read(componentPath);
const help = read(helpPath);

if (component) {
  requireText(component, "const SKETCH_VERSION = 13;", `${componentPath}: Badskisse-versjon 13 mangler.`);
  requireText(component, 'waste: { label: "AVL", diameterMm: "110", fill: "#2f8f46"', `${componentPath}: avløp mangler grønn standardmarkør Ø110.`);
  requireText(component, 'cold: { label: "KV", diameterMm: "30", fill: "#1976d2"', `${componentPath}: KV mangler blå standardmarkør Ø30.`);
  requireText(component, 'hot: { label: "VV", diameterMm: "30", fill: "#d64545"', `${componentPath}: VV mangler rød standardmarkør Ø30.`);
  requireText(component, 'diameterMm: String(marker?.diameterMm ?? preset.diameterMm ?? "")', `${componentPath}: eldre markører normaliseres ikke med standard diameter.`);
  requireText(component, 'const SNAP_EDGE_DISTANCE = 10;', `${componentPath}: kontrollert kant-snapping mangler.`);
  requireText(component, "function boxEdgeGapToWall", `${componentPath}: kantbasert snapping mot vegg mangler.`);
  requireText(component, '`${isWindow ? "Vindu" : "Dør"} – fyll inn mål`', `${componentPath}: dør/vindu viser ikke tydelig at mål mangler.`);
  requireText(component, "function SvgTextBadge", `${componentPath}: lesbar mål-badge mangler.`);
  requireText(component, "const [dragMarker, setDragMarker] = useState(null);", `${componentPath}: flyttbar installasjonsmarkør mangler drag-state.`);
  requireText(component, "if (dragMarker) {", `${componentPath}: flytting av installasjonsmarkør håndteres ikke.`);
  requireText(component, "setDragMarker({ id: marker.id });", `${componentPath}: markør kan ikke startes som dra-operasjon.`);
  requireText(component, "if (MARKER_TOOL_KEYS.has(tool)) {", `${componentPath}: markørverktøy bruker ikke felles verktøysett.`);
  requireText(component, 'field === "diameterMm" ? cleanMm(valueText)', `${componentPath}: diameter på AVL/KV/VV kan ikke redigeres.`);
  requireText(component, "<OpeningPlacementDimensions opening={opening} wall={wall} walls={sketch.walls}", `${componentPath}: åpningsmål bruker ikke romgeometri for utvendig målplassering.`);
}

if (help) {
  requireText(help, "Markørene kan flyttes etterpå og kan plasseres i eller over andre objekter", `${helpPath}: Hjelp beskriver ikke fri plassering/flytting av installasjonsmarkører.`);
  requireText(help, "Avløp starter med Ø110 mm, kaldt og varmt vann med Ø30 mm", `${helpPath}: Hjelp beskriver ikke standarddiameter for AVL/KV/VV.`);
  requireText(help, "dør/vindu viser tydelig at mål må fylles inn", `${helpPath}: Hjelp beskriver ikke forbedret målvisning.`);
}

if (failures.length) {
  console.error("\n❌ Expo ProffDok Badskisse check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før Vercel deploy.\n");
  process.exit(1);
}

console.log("✅ Expo ProffDok Badskisse check OK – mål, snapping, flyttbare markører og standarddiametre er verifisert");
