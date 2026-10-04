import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCordelAcceptedModel, createCordelOfferFiles } from "../src/modules/cordel/acceptedOfferCordel.mjs";
import { createCordelPicklist } from "../src/modules/cordel/picklistCordel.mjs";
import { encodeCordelText } from "../src/modules/cordel/cordelFiles.mjs";

const request = JSON.parse(fs.readFileSync(new URL("./fixtures/cordel-accepted-offer.json", import.meta.url), "utf8"));
const before = JSON.stringify(request);
const output = createCordelOfferFiles(request);
assert.equal(JSON.stringify(request), before, "Eksport må aldri endre akseptert innhold.");
assert.equal(output.model.acceptedCents, 40216410);
assert.equal(output.model.groups.length, 11);
assert.equal(output.model.detailCount, 30);
assert.deepEqual(output.model.groups.map((g) => g.cents), [524400, 3100000, 1678000, 2580000, 7100000, 7650000, 9860000, 2674000, 1250000, 1600000, 2200010]);

const decode = (bytes) => new TextDecoder("windows-1252").decode(bytes);
const jobRows = decode(output.files[0].bytes).trimEnd().split("\r\n").map((row) => row.split(";"));
assert.deepEqual(jobRows.map((row) => Number(row[0])), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
assert(jobRows.every((row) => row.length === 8 && row[2] === "Fastpris" && row[4] === "Fastpris" && row[5].trim() === "0,00"));
assert.equal(jobRows[0][3].trim(), "22000,10");
assert(!decode(output.files[0].bytes).includes("Mutable draft"));

// Independently inspect framing, parent links, prices and all text records.
function parseRecords(afg) {
  const records = [];
  for (let offset = 0; offset < afg.length;) {
    const size = new DataView(afg.buffer, afg.byteOffset).getUint16(offset + 1, true);
    assert(offset + 3 + size <= afg.length);
    records.push({ type: afg[offset], payload: afg.slice(offset + 3, offset + 3 + size) });
    offset += 3 + size;
  }
  return records;
}
const records = parseRecords(output.files[1].bytes);
const footer = records.at(-1);
assert.equal(footer.type, 16);
assert.equal(new DataView(footer.payload.buffer).getUint32(0, true), records.length - 1);
const expected = output.model.groups.flatMap((group) => [
  { code: "H", nr: group.nr, description: `Jobb ${group.nr} - ${group.title}`, cents: group.cents },
  ...group.lines.map((line) => ({ code: "B", nr: group.nr, ...line })),
]);
let postIndex = 0, activeHeader = 0, detailSum = 0;
for (let index = 0; index < records.length; index++) {
  const record = records[index];
  if (record.type !== 12) continue;
  assert.equal(record.payload.length, 477);
  const dv = new DataView(record.payload.buffer), ex = expected[postIndex++];
  const id = dv.getUint32(0, true), parent = dv.getUint32(4, true), count = dv.getUint32(8, true);
  assert.equal(id, postIndex);
  assert.equal(record.payload[12], ex.code.charCodeAt(0));
  assert.equal(dv.getUint16(90, true), ex.code === "H" ? 500 : 0);
  if (ex.code === "H") { activeHeader = id; assert.equal(parent, 0); }
  else { assert.equal(parent, activeHeader); detailSum += Math.round(dv.getFloat64(96, true) * 100); }
  const chunks = records.slice(index + 1, index + 1 + count);
  assert(chunks.every((r) => r.type === 15 && r.payload[0] === 0 && r.payload[1] === 0x74));
  const text = chunks.map((r) => decode(r.payload.slice(2)).split("\0", 1)[0]).join("");
  assert.equal(text, ex.description);
  for (const priceOffset of [96, 120, 128, 136, 144]) assert.equal(Math.round(dv.getFloat64(priceOffset, true) * 100), ex.cents);
  assert.equal(dv.getFloat64(56, true), 1, "Rundsum uses precomputed whole amount, never qty twice.");
}
assert.equal(postIndex, 41);
assert.equal(detailSum, 40216410);
assert.equal(records.filter((r) => r.type === 15 && r.payload[0] === 1 && r.payload[1] === 0xfe).length, 11);
const bodyTexts = records.filter((r) => r.type === 15).map((r) => decode(r.payload.slice(2)).split("\0", 1)[0]).join("");
assert(!bodyTexts.includes("Mutable draft") && !bodyTexts.includes("Unselected must"));

assert.throws(() => buildCordelAcceptedModel({ ...request, status: "Tilbud" }), /aksepterte/);
assert.throws(() => buildCordelAcceptedModel({ ...request, acceptedTotal: "402164.00" }), /Eksporten er stoppet/);
assert.throws(() => buildCordelAcceptedModel({ ...request, acceptedPayload: {}, acceptedOfferLines: [] }), /låste tilbudsgrunnlaget/);
assert.throws(() => buildCordelAcceptedModel({ ...request, acceptedPayload: { ...request.acceptedPayload, selected_options: [] } }), /Eksporten er stoppet/);
assert.throws(() => encodeCordelText("bad\0text"), /nulltegn/);
assert.throws(() => encodeCordelText("😀"), /støtter ikke/);
assert.equal(decode(encodeCordelText("Støp – Rørlegger €")), "Støp – Rørlegger €");

// Decimal quantities, negative option deltas and zero-price details are valid.
const alternative = { id: "ALT-1", status: "Akseptert", acceptedOfferVersionId: "v1", acceptedTotal: "11.40", acceptedPayload: { version_snapshot: { lines: [
  { id: "a", description: "2,5 stk", amount: "4,80", quantity: "2,5" },
  { id: "b", description: "Gratis", amount: "0" },
] }, selected_options: [{ id: "c", title: "Valgt alternativ", amount: "-0,60", optionType: "alternative" }] } };
assert.equal(buildCordelAcceptedModel(alternative).acceptedCents, 1140);

// Price-neutral general-offer sections must keep their text and never count qty 0.
const withSection = structuredClone(alternative);
withSection.acceptedPayload.version_snapshot.lines.unshift({ id: "store-section-1", lineType: "store_text", amount: "0", quantity: "0", description: "Leveranse\nViktig tekst uten pris." });
const sectionOutput = createCordelOfferFiles(withSection);
assert.equal(sectionOutput.model.acceptedCents, 1140);
assert.equal(sectionOutput.model.groups[0].lines[0].cents, 0);
assert.equal(sectionOutput.model.groups[0].lines[0].description, "Leveranse\nViktig tekst uten pris.");
const sectionRecords = parseRecords(sectionOutput.files[1].bytes);
const sectionIndex = sectionRecords.findIndex((r) => r.type === 12 && r.payload[12] === 66);
const sectionTextCount = new DataView(sectionRecords[sectionIndex].payload.buffer).getUint32(8, true);
assert.equal(sectionRecords.slice(sectionIndex + 1, sectionIndex + 1 + sectionTextCount).map((r) => decode(r.payload.slice(2)).split("\0", 1)[0]).join(""), "Leveranse\nViktig tekst uten pris.");

const pickItems = [
  { supplier_product_number: "1214", supplier_name: "Svedbergs", pickQuantity: "2", customer_price_ex_vat: 999, purchase_net_ex_vat: 456 },
  { supplier_product_number: "22457", supplier_name: "Svedbergs", pickQuantity: "4" },
];
assert.equal(decode(createCordelPicklist(pickItems)), "1214;2;Svedbergs\r\n22457;4;Svedbergs\r\n");
assert.equal(decode(createCordelPicklist([{ ...pickItems[0], pickQuantity: "2,5" }])), "1214;2,5;Svedbergs\r\n");
assert.throws(() => createCordelPicklist([{ ...pickItems[0], supplier_name: "" }]), /Leverandør/);
assert.throws(() => createCordelPicklist([{ ...pickItems[0], supplier_product_number: "1;2" }]), /skilletegn/);
assert.throws(() => createCordelPicklist([{ ...pickItems[0], pickQuantity: "0" }]), /Ugyldig antall/);
assert.throws(() => createCordelPicklist([]), /tom/);

assert.equal(new DataView(output.bytes.buffer).getUint32(0, true), 0x04034b50);
assert.equal(new DataView(output.bytes.buffer).getUint16(output.bytes.length - 12, true), 2);
for (const path of ["acceptedOfferCordel.mjs", "picklistCordel.mjs", "cordelFiles.mjs", "CordelOfferExport.jsx", "CordelPicklistExport.jsx"]) {
  const source = fs.readFileSync(`src/modules/cordel/${path}`, "utf8");
  assert(!/\.(?:rpc|insert|update|upsert|delete)\s*\(|\b(?:supabase|localStorage|sessionStorage|MutationObserver)\b/.test(source), `Cordel exports must not write or bypass existing app flows: ${path}`);
}
console.log("critical-cordel-export-check: OK – 11 jobs, 30 complete details, 402164.10, binary framing, selections, price-free picklist and immutable input");

if (process.argv[2]) fs.writeFileSync(process.argv[2], output.bytes);
