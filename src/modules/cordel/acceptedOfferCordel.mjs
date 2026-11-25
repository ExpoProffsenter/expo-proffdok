// Read-only export of the immutable accepted offer. Native AFG v4 was tested
// in Cordel TEST order 77463 on 2026-10-04. Jobs must be imported first.
import { OFFER_MAIN_POSTS } from "../sales/constants/salesConstants.js";
import { getVisibleOfferLines } from "../sales/utils/salesUtils.js";
import { isStoreSectionLine } from "../sales/utils/salesOfferQuantityPresentation.js";
import { concatBytes, createCordelZip, encodeCordelText } from "./cordelFiles.mjs";
import { CORDel_NATIVE_PREFIX } from "./cordelNativePrefix.mjs";

export const CORDEL_JOBLIST_NAME = "ProffDok_Cordel_Jobbliste.txt";
export const CORDEL_ORDER_NAME = "ProffDok_Cordel_Ordre.AFG";

const array = (value) => Array.isArray(value) ? value : [];
const clean = (value) => String(value ?? "").trim();
const view = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

function decimal(value, label) {
  const parsed = Number(String(value ?? "").trim().replace(/\s/g, "").replace(/,-$/, "").replace(/\.-$/, "").replace(",", "."));
  if (clean(value) === "" || !Number.isFinite(parsed)) throw new Error(`${label} mangler eller er ugyldig.`);
  return parsed;
}

function toCents(amount) {
  const rounded = Math.sign(amount) * Math.round(Math.abs(amount) * 100 + 1e-7);
  if (!Number.isSafeInteger(rounded)) throw new Error("Beløpet er for stort for sikker Cordel-eksport.");
  return rounded;
}

export function cordelAmount(cents) {
  return `${cents < 0 ? "-" : ""}${Math.floor(Math.abs(cents) / 100)},${String(Math.abs(cents) % 100).padStart(2, "0")}`;
}

function detailText(item, quantity, unitPrice) {
  if (isStoreSectionLine(item)) {
    return clean(item.description) || [clean(item.storeTextTitle), clean(item.storeTextBody)].filter(Boolean).join("\n") || "Avsnitt";
  }
  const description = [clean(item.title), clean(item.description)].filter(Boolean).join(" - ");
  if (!description) throw new Error("En akseptert prispost mangler beskrivelse.");
  const unit = clean(item.unit);
  return unit
    ? `${description} (Mengde: ${String(quantity).replace(".", ",")} ${unit}; enhetspris: ${cordelAmount(toCents(unitPrice))}.)`
    : description;
}

export function buildCordelAcceptedModel(request = {}) {
  if (request.status !== "Akseptert" && request.status !== "Aktivert") throw new Error("Bare aksepterte tilbud kan eksporteres til Cordel.");
  const payload = request.acceptedPayload || {};
  const snapshot = payload.version_snapshot || {};
  const version = request.acceptedOfferVersionNumber || payload.version_number;
  if (!request.acceptedOfferVersionId && !payload.version_id && !version) throw new Error("Låst tilbudsversjon mangler.");
  // Never fall back to a mutable draft or request.offerLines / offerOptions.
  const rawLines = Array.isArray(snapshot.lines) ? snapshot.lines : array(request.acceptedOfferLines);
  const lines = getVisibleOfferLines(rawLines);
  if (!lines.length) throw new Error("Det komplette, låste tilbudsgrunnlaget må hentes før eksport.");
  const options = Array.isArray(payload.selected_options) ? payload.selected_options : array(request.acceptedOptions);
  const declared = request.acceptedTotal ?? payload.accepted_total_ex_vat;
  const acceptedCents = toCents(decimal(declared, "Akseptert totalsum"));
  const groups = new Map(), seen = new Set();
  for (const [type, rows] of [["line", lines], ["option", options]]) {
    rows.forEach((item, index) => {
      if (item?.__companyMeta || item?.__offerTermsMeta || item?.__storeOfferMeta) return;
      const key = `${type}:${item.id || index}`;
      if (seen.has(key)) throw new Error("Tilbudsgrunnlaget inneholder dupliserte prisposter.");
      seen.add(key);
      // Accepted general-offer text sections have quantity 0; retain their
      // complete text as a zero-price detail, without changing accepted money.
      const textOnly = isStoreSectionLine(item);
      const unitPrice = textOnly ? 0 : decimal(item.amount, "Enhetspris");
      const quantity = textOnly ? 1 : clean(item.quantity) ? decimal(item.quantity, "Antall") : 1;
      if (quantity <= 0) throw new Error("En akseptert post har ugyldig antall.");
      const cents = toCents(unitPrice * quantity);
      const id = clean(item.mainPostId) || "ovrige-arbeider";
      if (!groups.has(id)) groups.set(id, { id, title: clean(item.mainPostTitle) || "Øvrige arbeider", lines: [], cents: 0 });
      const group = groups.get(id);
      group.lines.push({ sourceId: item.id || key, description: detailText(item, quantity, unitPrice), cents });
      group.cents += cents;
      if (!Number.isSafeInteger(group.cents)) throw new Error("Jobbsummen er for stor for sikker eksport.");
    });
  }
  const order = new Map(OFFER_MAIN_POSTS.map((post, index) => [post.id, index]));
  const sorted = [...groups.values()].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
  const sum = sorted.reduce((total, group) => total + group.cents, 0);
  if (!Number.isSafeInteger(sum)) throw new Error("Totalsummen er for stor for sikker eksport.");
  if (sum !== acceptedCents) throw new Error(`Postene summerer til ${cordelAmount(sum)}, mens akseptert total er ${cordelAmount(acceptedCents)}. Eksporten er stoppet.`);
  const ref = clean(request.id);
  if (!ref) throw new Error("Tilbudets saksnummer mangler.");
  const model = { ref, version, customer: clean(request.customer), title: clean(request.offerTitle || request.title || ref), acceptedCents, groups: sorted.map((group, index) => ({ ...group, nr: index + 1 })), detailCount: seen.size };
  // Validate all text before any file can be downloaded; no silent loss.
  encodeCordelText(model.customer + model.title + model.ref);
  for (const group of model.groups) {
    encodeCordelText(group.title);
    group.lines.forEach((line) => encodeCordelText(line.description));
  }
  return model;
}

function asciiField(value) {
  const text = String(value);
  if (/[;\r\n\0]/.test(text)) throw new Error("Et jobbnavn inneholder skilletegn som Cordels jobblisteformat ikke støtter.");
  return text;
}

export function createCordelJoblist(model) {
  // Native joblist importer inserts physical file order in reverse.
  const rows = [...model.groups].reverse().map((group) => [group.nr, `${model.ref} - ${group.title}`, "Fastpris", cordelAmount(group.cents).padStart(15), "Fastpris", "0,00".padStart(15), cordelAmount(group.cents).padStart(15), ""].map(asciiField).join(";") + "\r\n");
  return encodeCordelText(rows.join(""));
}

function record(kind, payload) {
  const header = new Uint8Array(3);
  header[0] = kind;
  view(header).setUint16(1, payload.length, true);
  return concatBytes([header, payload]);
}

function textRecord(bytes, tag = 0x74, flag = 0) {
  const payload = new Uint8Array(176);
  payload[0] = flag; payload[1] = tag;
  if (bytes.length > 173) throw new Error("AFG-tekstblokken er for lang.");
  payload.set(bytes, 2);
  return record(15, payload);
}

function textRecords(text) {
  const bytes = encodeCordelText(text), result = [textRecord(bytes.slice(0, 30))];
  for (let offset = 30; offset < bytes.length; offset += 130) result.push(textRecord(bytes.slice(offset, offset + 130)));
  return result;
}

function fixedText(bytes, start, end, text) {
  bytes.fill(0, start, end);
  bytes.set(encodeCordelText(text).slice(0, end - start - 1), start);
}

function post(kind, id, parent, textCount, cents, nr = "") {
  const bytes = new Uint8Array(477), dv = view(bytes);
  dv.setUint32(0, id, true); dv.setUint32(4, parent, true);
  dv.setUint32(8, textCount, true);
  bytes[12] = kind.charCodeAt(0); bytes[14] = 0x80;
  dv.setUint32(16, kind === "H" ? 8 : 3, true);
  fixedText(bytes, 20, 49, nr); fixedText(bytes, 49, 56, "RS");
  dv.setFloat64(56, 1, true); dv.setFloat64(64, 1, true);
  // Preserve the native H header control value from the imported test file.
  dv.setUint16(90, kind === "H" ? 500 : 0, true);
  for (const offset of [96, 120, 128, 136, 144]) dv.setFloat64(offset, cents / 100, true);
  dv.setFloat64(192, 1, true);
  return record(12, bytes);
}

export function createCordelAfg(model) {
  const prefix = Uint8Array.from(atob(CORDel_NATIVE_PREFIX), (char) => char.charCodeAt(0));
  const records = [];
  let offset = 0;
  while (offset < prefix.length) {
    const size = view(prefix).getUint16(offset + 1, true);
    const kind = prefix[offset], bytes = prefix.slice(offset + 3, offset + 3 + size);
    if (kind === 4 || kind === 5) {
      view(bytes).setUint32(0, Number(model.ref.match(/\d+$/)?.[0] || 0), true);
      if (kind === 4) fixedText(bytes, 4, 45, model.customer || "ProffDok");
      else { fixedText(bytes, 6, 19, model.ref); fixedText(bytes, 107, 138, model.customer); }
      fixedText(bytes, 45, 76, model.ref);
    } else if (kind === 6) fixedText(bytes, 4, 45, model.customer || "ProffDok");
    records.push(record(kind, bytes));
    offset += size + 3;
  }
  for (const line of [`ProffDok ${model.ref}, akseptert tilbud v${model.version || "?"}.`, `Akseptert total: ${cordelAmount(model.acceptedCents)} eks. mva.`]) {
    const bytes = encodeCordelText(line);
    for (let start = 0; start < bytes.length; start += 130) records.push(textRecord(bytes.slice(start, start + 130), 0x43));
  }
  let id = 0;
  for (const group of model.groups) {
    const parent = ++id, headerTexts = textRecords(`Jobb ${group.nr} - ${group.title}`);
    records.push(post("H", parent, 0, headerTexts.length, group.cents, String(group.nr)), ...headerTexts);
    for (const line of group.lines) {
      const texts = textRecords(line.description);
      records.push(post("B", ++id, parent, texts.length, line.cents), ...texts);
    }
    records.push(textRecord(new Uint8Array(), 0xfe, 1), ...textRecords(`SUM JOBB ${group.nr}`));
  }
  records.push(record(13, new Uint8Array()));
  const footer = new Uint8Array(4);
  view(footer).setUint32(0, records.length, true);
  records.push(record(16, footer));
  return concatBytes(records);
}

export function createCordelOfferFiles(request) {
  const model = buildCordelAcceptedModel(request);
  const files = [{ name: CORDEL_JOBLIST_NAME, bytes: createCordelJoblist(model) }, { name: CORDEL_ORDER_NAME, bytes: createCordelAfg(model) }];
  return { model, files, bytes: createCordelZip(files) };
}
