import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildBoligFdvPdf,
  downloadBoligFdv,
} from "../src/modules/bolig/boligFdvPdf.mjs";
import { registerAppSupabaseClient } from "../src/modules/access/appSupabaseClientRegistry.js";
const engine = await import(process.env.KSHMS_JSPDF_NODE_PATH || "jspdf"),
  JsPDF = engine.jsPDF || engine.default?.jsPDF;
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
const context = {
  user_id: "qa",
  company_id: "firm",
  enabled: true,
  role: "manager",
};
const base = {
  context,
  root_id: "root",
  scope_id: "unit",
  revision: 4,
  basis: "exact-basis",
  title: "DEMO – H0101 · Dokumentert leveranse",
  data: {
    documents: [{ kind: "fdv", title: "Driftsinstruks", name: "instruks.pdf" }],
  },
  fdv: [
    {
      unit_id: "unit",
      unit: "H0101",
      block: "Bygg A",
      choice_revision: 3,
      name: "Blandebatteri med avstengning",
      sku: "0000123",
      quantity: 1,
      unit_name: "stk",
      room: "Bad 1",
      fdv_url: "https://example.org/fdv/batteri.pdf",
    },
    {
      unit_id: "unit",
      unit: "H0101",
      block: "Bygg A",
      choice_revision: 3,
      name: "Baderomsmøbel 120 cm",
      sku: "0000124",
      quantity: 1,
      unit_name: "stk",
      room: "Bad 1",
      fdv_url: "",
    },
  ],
};
const profile = {
  companyId: "firm",
  companyName: "Ringside Rørleggerbedrift AS",
};
const logo =
  "data:image/png;base64," +
  fs
    .readFileSync("public/brands/ringside-rorleggerbedrift.png")
    .toString("base64");
const short = buildBoligFdvPdf(JsPDF, base, profile, { logo });
eq(Buffer.from(short.output("arraybuffer")).subarray(0, 5).toString(), "%PDF-");
let stream = short.internal.pages.flat().join("\n");
eq(
  short.output().includes("/URI (https://example.org/fdv/batteri.pdf)"),
  true,
  "Clickable FDV URL retained",
);
eq(
  stream.includes("/Subtype /Image") ||
    Buffer.from(short.output("arraybuffer")).includes(
      Buffer.from("/Subtype /Image"),
    ),
  true,
  "Company logo embedded",
);
const long = {
  ...base,
  title: "Prosjekt med flere bygg og boliger",
  fdv: Array.from({ length: 45 }, (_, i) => ({
    ...base.fdv[i % 2],
    unit: "H" + String(i + 1).padStart(4, "0"),
    name:
      i === 3
        ? "Langt varenavn ".repeat(35) + "END-LONG-PRODUCT"
        : "Blandebatteri " + (i + 1),
    fdv_url:
      i === 5
        ? "https://example.org/" +
          "lang-produktmappe/".repeat(75) +
          "END-LONG-URL.pdf"
        : base.fdv[i % 2].fdv_url,
  })),
};
const expanded = buildBoligFdvPdf(JsPDF, long, profile, { logo });
eq(expanded.internal.getNumberOfPages() > 5, true);
stream = expanded.internal.pages.flat().join("\n");
eq(
  stream.includes("END-LONG-PRODUCT"),
  true,
  "Long product name never truncated",
);
eq(
  expanded.output().includes("END-LONG-URL.pdf"),
  true,
  "Long URL survives pagination",
);
if (process.env.BOLIG_FDV_PDF_OUTPUT) {
  fs.mkdirSync(process.env.BOLIG_FDV_PDF_OUTPUT, { recursive: true });
  fs.writeFileSync(
    process.env.BOLIG_FDV_PDF_OUTPUT + "/fdv-bolig.pdf",
    Buffer.from(short.output("arraybuffer")),
  );
  fs.writeFileSync(
    process.env.BOLIG_FDV_PDF_OUTPUT + "/fdv-prosjekt.pdf",
    Buffer.from(expanded.output("arraybuffer")),
  );
}
let reads = 0,
  saves = 0,
  live = true,
  changed = false,
  foreign = false;
registerAppSupabaseClient({
  rpc: async (name) =>
    name === "work_profile_company_profile"
      ? { data: profile }
      : {
          data: {
            ...base,
            context: foreign ? { ...context, company_id: "other" } : context,
            basis: changed ? "changed" : base.basis,
            ...(reads++ ? {} : {}),
          },
        },
});
function wrapped(options) {
  const doc = new JsPDF(options);
  doc.save = () => {
    saves++;
  };
  return doc;
}
const options = {
  context,
  rootId: "root",
  scopeId: "unit",
  expected: base,
  isCurrent: () => live,
  loadPdf: async () => ({ jsPDF: wrapped }),
  loadLogo: async () => null,
};
await downloadBoligFdv(options);
eq(reads, 2, "Fresh authorization before and after engine load");
eq(saves, 1);
await downloadBoligFdv({
  ...options,
  loadPdf: async () => {
    live = false;
    return { jsPDF: wrapped };
  },
});
eq(saves, 1, "Late PDF engine cannot save after leaving scope");
live = true;
await assert.rejects(
  () =>
    downloadBoligFdv({
      ...options,
      loadPdf: async () => {
        changed = true;
        return { jsPDF: wrapped };
      },
    }),
  /endret/,
);
checks++;
changed = false;
foreign = true;
await assert.rejects(() => downloadBoligFdv(options), /endret/);
checks++;
eq(saves, 1, "Foreign response cannot download");
console.log(
  `PASS Bolig FDV PDF: ${checks} assertions; real PDF links, logo, long content/pagination and fresh scope/basis verification.`,
);
