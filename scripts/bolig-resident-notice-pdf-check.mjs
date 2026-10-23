import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import {
  buildResidentNoticePdf,
  downloadResidentNotice,
} from "../src/modules/bolig/boligResidentNoticePdf.mjs";
import { registerAppSupabaseClient } from "../src/modules/access/appSupabaseClientRegistry.js";
const engine = await import(process.env.KSHMS_JSPDF_NODE_PATH || "jspdf"),
  JsPDF = engine.jsPDF || engine.default?.jsPDF;
const context = {
    user_id: "qa",
    company_id: "firm",
    enabled: true,
    role: "manager",
  },
  notice = {
    id: "notice",
    task_id: "task",
    title: "Etterjustering av rosett",
    body: "Vi kommer for å etterjustere rosetten. Avtal tilgang med kontaktpersonen.",
    planned_start: "2026-10-29",
    planned_end: "2026-10-30",
    basis: "b1",
    current: true,
    valid: true,
    recipient: "resident-secret@example.invalid",
  },
  task = {
    id: "task",
    unit_number: "H0101",
    address: "Demoparken 101",
    active: true,
    archived: false,
  },
  contact = {
    name: "DEMO Prosjektleder",
    phone: "00 00 00 00",
    email: "pilot@example.invalid",
  };
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
const path = "/tmp/bolig-pilot-beboervarsel.pdf";
const pdf = buildResidentNoticePdf(JsPDF, {
  project: "DEMO Boligpilot",
  notice,
  task,
  contact,
  now: new Date("2026-10-23T12:00:00Z"),
});
fs.writeFileSync(path, Buffer.from(pdf.output("arraybuffer")));
const text = execFileSync("pdftotext", ["-layout", path, "-"], {
  encoding: "utf8",
});
for (const s of [
  "Beboervarsel",
  "H0101",
  "Demoparken 101",
  "29.10.2026",
  "30.10.2026",
  "DEMO Prosjektleder",
  "pilot@example.invalid",
  "Godkjent varsel",
])
  eq(text.includes(s), true, s + " in actual PDF bytes");
eq(
  text.includes("resident-secret"),
  false,
  "Resident recipient is not printed on public notice",
);
eq(pdf.getNumberOfPages(), 1, "Normal notice fits one A4 page");
const draft = buildResidentNoticePdf(JsPDF, {
  project: "QA",
  notice: { ...notice, valid: false },
  task,
  contact,
});
fs.writeFileSync(
  "/tmp/bolig-pilot-beboervarsel-utkast.pdf",
  Buffer.from(draft.output("arraybuffer")),
);
eq(
  execFileSync("pdftotext", ["/tmp/bolig-pilot-beboervarsel-utkast.pdf", "-"], {
    encoding: "utf8",
  }).includes("UTKAST"),
  true,
  "Draft is visibly marked",
);
const long = buildResidentNoticePdf(JsPDF, {
  project: "Langt navn ".repeat(20),
  notice: { ...notice, body: "Avtal tilgang og rydd området. ".repeat(65) },
  task,
  contact,
});
eq(long.getNumberOfPages() > 1, true, "Maximum-size body paginates");
let saved = 0,
  read = 0,
  stale = false,
  current = true,
  deny = false;
registerAppSupabaseClient({
  rpc: async () => {
    read++;
    return deny
      ? { error: { code: "42501", message: "Tilgang tilbakekalt" } }
      : {
          data: {
            context,
            root_id: "root",
            unit_id: null,
            notices: [{ ...notice, basis: stale ? "changed" : "b1" }],
            tasks: [task],
          },
        };
  },
});
class ExportPDF {
  constructor(...args) {
    const doc = new JsPDF(...args);
    doc.save = () => {
      saved++;
    };
    return doc;
  }
}
const args = {
  context,
  root: { id: "root", title: "QA" },
  notice,
  contact,
  isCurrent: () => current,
  loadPdf: async () => ({ jsPDF: ExportPDF }),
};
await downloadResidentNotice(args);
eq(saved, 1, "Fresh authorized data downloads once");
eq(read, 2, "Plan revalidated after lazy PDF engine loaded");
await assert.rejects(
  () =>
    downloadResidentNotice({
      ...args,
      contact: { name: "QA", phone: "", email: "" },
    }),
  /telefon eller e-post/,
);
checks++;
stale = true;
await assert.rejects(() => downloadResidentNotice(args), /endret/);
checks++;
eq(saved, 1, "Stale notice never downloads");
stale = false;
await downloadResidentNotice({
  ...args,
  loadPdf: async () => {
    current = false;
    return { jsPDF: ExportPDF };
  },
});
eq(saved, 1, "Scope change during lazy loading fences download");
current = true;
deny = true;
await assert.rejects(() => downloadResidentNotice(args), /Tilgang tilbakekalt/);
checks++;
eq(saved, 1, "Revoked access fences download");
console.log(
  `PASS resident notice PDF: ${checks} assertions; actual text/privacy/pagination/draft, fresh read, changed plan, scope and revoked access. ${path}`,
);
