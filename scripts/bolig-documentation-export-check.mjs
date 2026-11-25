import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  buildBoligDocumentationPdf,
  documentationFiles,
  documentationZip,
  downloadBoligDocumentation,
  publicDocumentationSnapshot,
} from "../src/modules/bolig/boligDocumentationExport.mjs";
import { registerAppSupabaseClient } from "../src/modules/access/appSupabaseClientRegistry.js";
const engine = await import(process.env.KSHMS_JSPDF_NODE_PATH || "jspdf"),
  JsPDF = engine.jsPDF || engine.default?.jsPDF;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bolig-documentation-qa-"));
const id = (n) => "70000000-0000-4000-8000-" + String(n).padStart(12, "0");
const context = {
    company_id: id(1),
    user_id: id(2),
    role: "manager",
    enabled: true,
  },
  root = id(3),
  unit = id(4),
  fileId = id(5),
  point = id(6),
  field = id(7);
const profile = { companyId: context.company_id, companyName: "Ringside AS" };
const original = new JsPDF();
original.text("QA Originalprotokoll - syntetisk", 15, 20);
const originalBytes = new Uint8Array(original.output("arraybuffer"));
const state = {
  context,
  root_id: root,
  scope_id: unit,
  project: "DEMO Boligprosjekt",
  title: "H0101 · ",
  kind: "unit",
  basis: "immutable-export-basis",
  status: "ready_with_rest",
  notice: "Ekstern FDV følger som lenker. Kontroller montert leveranse.",
  restpoints: [
    {
      scope_id: unit,
      source: "Trykkprøving",
      title: "Rosett etterjusteres",
      comment: "Avtalt etterjustering",
      severity: "minor",
    },
  ],
  fdv: [
    {
      unit: "H0101",
      block: "Bygg A",
      key: "tap",
      name: "Blandebatteri med avstengning",
      sku: "00123",
      quantity: 1,
      unit_name: "stk",
      room: "Bad",
      choice_revision: 2,
      fdv_url: "https://example.invalid/fdv.pdf",
    },
    {
      unit: "H0101",
      block: "Bygg A",
      key: "other",
      name: "Møbel uten dokumentlenke",
      sku: "00124",
      quantity: 1,
      unit_name: "stk",
      choice_revision: 2,
      fdv_url: "",
    },
  ],
  scopes: [
    {
      id: unit,
      kind: "unit",
      title: "H0101 · ",
      revision: 4,
      common: false,
      rooms: [],
      completion: {
        status: "ready_with_rest",
        owner_name: "QA Leder",
        items: [
          {
            title: "Arbeidet gjennomgått",
            valid: true,
            evidence: "Samlet gjennomgang",
            at: "2026-10-22T00:00:00Z",
          },
        ],
        approval: { by_name: "QA Leder", at: "2026-10-22T00:00:00Z" },
        issues: [],
        warnings: ["Valgfri sjekkliste under arbeid"],
      },
      history: [
        {
          revision: 1,
          snapshot: {
            documents: [{ path: "private-history-path" }],
            checks: [],
          },
        },
      ],
      data: {
        documents: [
          {
            id: fileId,
            title: "Original kontrollprotokoll",
            name: "kontrollprotokoll.pdf",
            kind: "protocol",
            path: `${context.company_id}/${root}/${unit}/${fileId}.pdf`,
            size: originalBytes.length,
            available: true,
          },
        ],
        checks: [
          {
            id: id(8),
            definition: {
              title: "QA Trykkprøving",
              instructions: "Kontroller funksjon",
              points: [
                {
                  id: point,
                  title: "Funksjonstest",
                  fields: [
                    {
                      id: field,
                      label: "Målt trykk",
                      type: "number",
                      required: true,
                    },
                  ],
                },
              ],
            },
            status: "completed",
            required: true,
            sequence: 2,
            completed_by_name: "QA Montør",
            completed_at: "2026-10-22T00:00:00Z",
            answers: {
              [point]: {
                status: "Avvik",
                severity: "minor",
                comment: "Rosett etterjusteres",
                values: { [field]: "3.2" },
                documents: [fileId],
              },
            },
          },
        ],
        protocols: [
          {
            id: id(9),
            title: "Ekstern kontroll",
            document_id: fileId,
            no_remarks: "",
            remarks: [
              {
                id: id(10),
                text: "Dør justeres",
                rectified: true,
                evidence: "Justert og kontrollert",
                documents: [],
              },
            ],
            confirmation: {
              by_name: "QA Leder",
              at: "2026-10-22T00:00:00Z",
              note: "Kontrollert mot originalprotokollen",
            },
          },
        ],
        fdv: {},
      },
    },
  ],
};
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
const rejects = async (fn, rx) => {
  await assert.rejects(fn, rx);
  checks++;
};
const files = documentationFiles(state);
eq(files.length, 1);
eq(files[0].archive_name.endsWith("-kontrollprotokoll.pdf"), true);
eq(
  JSON.stringify(publicDocumentationSnapshot(state)).includes(
    "private-history-path",
  ),
  false,
  "Private paths recursively excluded from recipient data",
);
eq(
  JSON.stringify(publicDocumentationSnapshot(state)).includes('"context"'),
  false,
  "No work-profile capabilities exported",
);
const manifest = [
  {
    id: fileId,
    name: "kontrollprotokoll.pdf",
    archive_name: files[0].archive_name,
    size: originalBytes.length,
  },
];
eq(files[0].archive_name.includes("H0101 ·"), false,
  "Unknown address leaves no empty separator in archive folders");
const logo =
  "data:image/png;base64," +
  fs
    .readFileSync("public/brands/ringside-rorleggerbedrift.png")
    .toString("base64");
const printed = [];
function AuditedPdf(options) {
  const doc = new JsPDF(options), text = doc.text;
  doc.text = function (value, ...args) {
    printed.push(value);
    return text.call(this, value, ...args);
  };
  return doc;
}
state.scopes[0].handover_review={record:{date:"2026-10-23",reference:"QA faktisk protokoll",by_name:"QA Prosjektleder"},assessment:{by_name:"QA Prosjektleder",decisions:[{title:"QA åpen aktivitet",scope_title:"H0101",category:"Aktivitet",decision:"carry",reason:"QA avtalt oppfølging etter overtakelse",owner_name:"QA Oppfølger",critical:false}]},history:[]};
const pdf = buildBoligDocumentationPdf(AuditedPdf, state, profile, {
  logo,
  manifest,
});
eq(printed.some(s=>String(s).includes("Prosjektleders vurdering av overtakelse")),true,"Manager review has a visible report page");
eq(printed.some(s=>String(s).includes("QA faktisk protokoll")),true,"Actual protocol reference is included");
eq(printed.some(s=>String(s).includes("QA avtalt oppf")),true,"Carried open case reason is visible in PDF");
eq(printed.some(s=>String(s).includes("QA Oppf")),true,"Follow-up owner is visible in PDF");
eq(printed.filter((s) => String(s).includes("FDV-oversikt") &&
  String(s).includes("Expo ProffDok")).length, 0,
  "Combined report contains no hidden FDV footer text layer");
eq(printed.filter((s) => String(s).includes("Expo ProffDok · Samlet dokumentasjon")).length,
  pdf.internal.getNumberOfPages(), "Exactly one report footer per page");
eq(printed.filter((s) => /^Side \d+ av \d+$/.test(String(s))).length,
  pdf.internal.getNumberOfPages(), "Exactly one searchable page number per page");
eq(printed.some((s) => /H0101\s*·\s*(?:·|$)/.test(String(s))), false,
  "Unknown address leaves no empty separator in rendered report headings or scope labels");
eq(
  new TextDecoder().decode(
    new Uint8Array(pdf.output("arraybuffer")).slice(0, 5),
  ),
  "%PDF-",
);
eq(
  pdf.internal.getNumberOfPages() >= 5,
  true,
  "Summary, restpoints, checklist, protocol, FDV",
);
eq(
  pdf.output().includes("/URI (https://example.invalid/fdv.pdf)"),
  true,
  "External FDV remains a clickable link",
);
fs.writeFileSync(
  path.join(temp, "samlet.pdf"),
  Buffer.from(pdf.output("arraybuffer")),
);
const long = structuredClone(state);
long.title = "Langt boligprosjekt ".repeat(12);
long.scopes[0].data.checks[0].definition.points = Array.from(
  { length: 8 },
  (_, i) => ({
    id: point + i,
    title: "Langt sjekkpunkt ".repeat(15) + i,
    fields: [],
  }),
);
for (const p of long.scopes[0].data.checks[0].definition.points)
  long.scopes[0].data.checks[0].answers[p.id] = {
    status: "Avvik",
    severity: "minor",
    comment: "Lang kommentar ".repeat(130),
  };
const longPdf = buildBoligDocumentationPdf(JsPDF, long, profile, {
  logo,
  manifest,
});
fs.writeFileSync(
  path.join(temp, "lang-samlet.pdf"),
  Buffer.from(longPdf.output("arraybuffer")),
);
eq(
  longPdf.internal.getNumberOfPages() > pdf.internal.getNumberOfPages(),
  true,
  "Long labels and comments continue across pages",
);
let saves = [],
  reads = 0,
  changedAt = Infinity,
  denyDownload = false,
  revoked = false;
const client = {
  rpc: async (name) =>
    name === "work_profile_company_profile"
      ? { data: profile }
      : {
          data: {
            ...structuredClone(state),
            basis: ++reads >= changedAt ? "changed" : state.basis,
            context: revoked ? { ...context, company_id: id(99) } : context,
          },
        },
  storage: {
    from: (bucket) => {
      eq(bucket, "bolig-documents");
      return {
        download: async (object) => {
          eq(object, state.scopes[0].data.documents[0].path);
          return denyDownload
            ? { error: { message: "Denied" } }
            : { data: new Blob([originalBytes], { type: "application/pdf" }) };
        },
      };
    },
  },
};
registerAppSupabaseClient(client);
const options = {
  context,
  rootId: root,
  scopeId: unit,
  expected: state,
  loadPdf: async () => engine,
  loadLogo: async () => null,
  save: (blob, name) => saves.push({ blob, name }),
};
await downloadBoligDocumentation({ ...options, format: "zip" });
eq(saves.length, 1);
eq(
  reads,
  3,
  "Fresh checks before download, after files and after ZIP generation",
);
const zipPath = path.join(temp, "samlet.zip");
fs.writeFileSync(zipPath, Buffer.from(await saves[0].blob.arrayBuffer()));
const inspected = JSON.parse(
  execFileSync(
    "python3",
    [
      "-c",
      `import zipfile,json,sys,hashlib\nz=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None\nm=json.loads(z.read('Filmanifest.json'))\nfor f in m['files']: assert hashlib.sha256(z.read(f['archive_name'])).hexdigest()==f['sha256']\nprint(json.dumps({'names':z.namelist(),'external':m['external_fdv'],'missing':m['missing_fdv'],'original':z.read(next(n for n in z.namelist() if n.endswith('kontrollprotokoll.pdf'))).hex()}))`,
      zipPath,
    ],
    { encoding: "utf8" },
  ),
);
eq(
  inspected.names.length,
  5,
  "PDF, historical data, manifest, guide and actual original",
);
eq(inspected.external[0].embedded, false);
eq(inspected.missing.length, 1);
eq(
  inspected.original,
  Buffer.from(originalBytes).toString("hex"),
  "Original bytes unchanged",
);
reads = 0;
saves = [];
changedAt = 3;
await rejects(() => downloadBoligDocumentation(options), /endret/);
eq(saves.length, 0, "Changed basis during export prevents download");
reads = 0;
changedAt = Infinity;
denyDownload = true;
await rejects(() => downloadBoligDocumentation(options), /kunne ikke hentes/);
eq(saves.length, 0, "No partial ZIP on missing original");
denyDownload = false;
revoked = true;
await rejects(() => downloadBoligDocumentation(options), /Tilgangen/);
eq(saves.length, 0, "Changed firm prevents export");
revoked = false;
reads = 0;
await downloadBoligDocumentation({ ...options, format: "pdf" });
eq(saves.length, 1);
eq(saves[0].blob.type, "application/pdf");
await rejects(
  () => downloadBoligDocumentation({ ...options, format: "unknown" }),
  /PDF eller ZIP/,
);
assert.throws(
  () => documentationZip([{ name: "../escape", data: new Uint8Array([1]) }]),
  /filnavn/,
);
checks++;
assert.throws(
  () =>
    documentationFiles({
      ...state,
      scopes: [
        {
          ...state.scopes[0],
          data: {
            ...state.scopes[0].data,
            documents: [
              { ...state.scopes[0].data.documents[0], available: false },
            ],
          },
        },
      ],
    }),
  /mangler/,
);
checks++;
console.log(
  `bolig-documentation-export-check: PASS ${checks} assertions; actual PDF/ZIP, unchanged originals, SHA256/CRC, typed fields, history, FDV links, stale/revoked scope and partial-file prevention. Artifacts: ${temp}`,
);
