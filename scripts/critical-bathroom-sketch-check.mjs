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
  requireText(component, "const SKETCH_VERSION = 14;", `${componentPath}: Badskisse-versjon 14 mangler.`);
  requireText(component, 'waste: { label: "AVL", diameterMm: "110", fill: "#2f8f46"', `${componentPath}: avløp mangler grønn standardmarkør Ø110.`);
  requireText(component, 'cold: { label: "KV", diameterMm: "30", fill: "#1976d2"', `${componentPath}: KV mangler blå standardmarkør Ø30.`);
  requireText(component, 'hot: { label: "VV", diameterMm: "30", fill: "#d64545"', `${componentPath}: VV mangler rød standardmarkør Ø30.`);
  requireText(component, 'diameterMm: String(marker?.diameterMm ?? preset.diameterMm ?? "")', `${componentPath}: eldre markører normaliseres ikke med standard diameter.`);
  requireText(component, "return clamp(rawRadius, 1.8, 28);", `${componentPath}: AVL/KV/VV bruker ikke felles proporsjonal målskala.`);
  requireText(component, "function markerDisplayLabel", `${componentPath}: små installasjonsmarkører mangler separat lesbar etikett.`);
  requireText(component, 'const WALL_ATTACHED_FIXTURE_LABELS = new Set(["WC", "Servant"]);', `${componentPath}: WC og servant deler ikke vegglogikk.`);
  requireText(component, 'wallOffsetMm: String(box?.wallOffsetMm ?? "0")', `${componentPath}: avstand fra vegg lagres ikke på WC/servant.`);
  requireText(component, 'snapWallId: String(box?.snapWallId || "")', `${componentPath}: tilknyttet vegg lagres ikke på WC/servant.`);
  requireText(component, "function placeWallAttachedFixture", `${componentPath}: plassering av WC/servant mot vegg mangler.`);
  requireText(component, "if (!wallAttached) {", `${componentPath}: WC/servant er ikke eksplisitt unntatt hjørnesnap.`);
  requireText(component, "const interior = wallInteriorNormal(wall, walls);", `${componentPath}: WC/servant orienteres ikke etter innsiden av rommet.`);
  requireText(component, "interior.x < 0 ? 90 : 270", `${componentPath}: WC/servant kan ikke roteres automatisk langs sidevegger.`);
  requireText(component, "interior.y < 0 ? 180 : 0", `${componentPath}: WC/servant kan ikke orienteres mot topp/bunn-vegg.`);
  requireText(component, "Avstand fra vegg (mm)", `${componentPath}: redigeringsfelt for veggavstand mangler.`);
  requireText(component, "const outerPath =", `${componentPath}: servant har ikke eget plansymbol.`);
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
  requireText(help, "Sluk, avløp, kaldt vann og varmt vann kan plasseres fritt og dras senere.", `${helpPath}: Hjelp beskriver ikke fri plassering/flytting av installasjonsmarkører.`);
  requireText(help, "Avløp starter som grønn Ø110 mm, kaldt vann som blå Ø30 mm og varmt vann som rød Ø30 mm.", `${helpPath}: Hjelp beskriver ikke standarddiameter for AVL/KV/VV.`);
  requireText(help, "AVL/KV/VV vises som helfargede sirkler proporsjonalt etter registrert diameter", `${helpPath}: Hjelp beskriver ikke proporsjonal visning av AVL/KV/VV.`);
  requireText(help, "WC og servant følger vegg uten hjørnesnap", `${helpPath}: Hjelp beskriver ikke WC/servant uten hjørnesnap.`);
  requireText(help, "Avstand fra vegg i millimeter", `${helpPath}: Hjelp beskriver ikke veggavstand for WC/servant.`);
  requireText(help, "fyll inn målene i de tomme målfeltene", `${helpPath}: Hjelp beskriver ikke forbedret målvisning.`);
}

if (failures.length) {
  console.error("\n❌ Expo ProffDok Badskisse check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før Vercel deploy.\n");
  process.exit(1);
}

console.log("✅ Expo ProffDok Badskisse check OK – mål, WC/servant-vegglogikk og proporsjonale installasjonsmarkører er verifisert");
