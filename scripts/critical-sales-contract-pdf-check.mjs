import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(
  path.join(root, "src/modules/sales/services/salesContractPdf.js"),
  "utf8"
);

function assert(condition, message) {
  if (!condition) throw new Error(`Kontrakt-PDF check: ${message}`);
}

for (const needle of [
  "const textRows = (text) =>",
  "const cardLabel = (label, continued = false) =>",
  "pdf.splitTextToSize(value, WIDTH - 10)",
  "labelLayout.rows.forEach",
  "const available = PAGE.bottom - y - labelLayout.height - 5",
  "textCardChunk(label, rows.slice(index, end), continued)",
]) {
  assert(source.includes(needle), `mangler robust tekst-/sidesplitt: ${needle}`);
}

for (const forbidden of [
  "for (const paragraph of paragraphs)",
  "pdf.text(first ? clean(label)",
]) {
  assert(!source.includes(forbidden), `gammel kort-per-linje-layout er tilbake: ${forbidden}`);
}

console.log("✅ Expo ProffDok kontrakt-PDF layout check OK");
