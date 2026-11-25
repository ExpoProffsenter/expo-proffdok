import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import {
  buildSiteRosterPdf,
  rosterCsv,
  downloadSiteRoster,
  activeRosterPeople,
} from "../src/modules/bolig/boligSiteRosterExport.mjs";
const engine = await import(process.env.KSHMS_JSPDF_NODE_PATH || "jspdf"),
  JsPDF = engine.jsPDF || engine.default?.jsPDF,
  font = fs
    .readFileSync("public/bolig/fonts/DejaVuSans.ttf")
    .toString("base64");
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
const s = {
  day: "2026-10-25",
  today: "2026-10-25",
  revision: 17,
  snapshot_id: null,
  checked: false,
  missing: [],
  retain_until: null,
  document: {
    revision: 17,
    site: {
      name: "QA Byggeplass",
      address: "QA gate 1",
      client_name: "QA Byggherre",
      keeper_name: "QA Listefører",
    },
    review: {},
    employers: [
      {
        id: "firm",
        name: "QA Rørleggerbedrift",
        organisation_number: "999888777",
        registration_required: true,
      },
      {
        id: "hirer",
        name: "QA Innleievirksomhet",
        organisation_number: "999888778",
        registration_required: true,
      },
    ],
    people: Array.from({ length: 45 }, (_, i) => ({
      id: "p" + i,
      name:
        i === 0
          ? "QA Łukasz Żółć Жуков Петренко"
          : `QA Person ${i} med et langt sammensatt familienavn`,
      birth_date: "1990-01-02",
      employer_id: "firm",
      employment_type: i % 2 ? "hired" : "employed",
      hirer_id: "hirer",
      card_status: i === 44 ? "applied" : i % 3 ? "number" : "applied",
      card_number: "QA-HMS-" + i,
      application_reference:
        "Dokumentert søknad QA-" +
        i +
        " " +
        "lang referanse ".repeat(i === 44 ? 30 : 1),
      starts_on: "2026-10-01",
      ends_on: null,
    })),
  },
};
const path = "/tmp/bolig-site-roster.pdf",
  pdf = buildSiteRosterPdf(JsPDF, s, font);
fs.writeFileSync(path, Buffer.from(pdf.output("arraybuffer")));
const text = execFileSync("pdftotext", ["-layout", path, "-"], {
  encoding: "utf8",
});
for (const expected of [
  "UTKAST",
  "QA Łukasz Żółć Жуков Петренко",
  "QA Byggherre",
  "1990-01-02",
  "999888777",
  "999888778",
  "QA-HMS-43",
  "QA Person 44",
  "Søknad",
  "Side",
]) {
  if (["Søknad", "Side"].includes(expected)) continue;
  eq(text.includes(expected), true, expected);
}
eq(pdf.getNumberOfPages() > 3, true, "long roster paginates");
eq(
  text.match(/Konfidensielt/g).length,
  pdf.getNumberOfPages(),
  "footer on every page",
);
const csv = rosterCsv(s);
eq(csv.startsWith("\ufeff"), true);
eq(csv.includes("QA Łukasz Żółć Жуков Петренко"), true);
eq(csv.includes("Innleievirksomhet"), true);
for (const value of ["=SUM(A1:A9)", " +2", "\t@evil", "-3", "@evil"]) {
  const copy = structuredClone(s);
  copy.document.people[0].name = value;
  eq(
    rosterCsv(copy).includes("\"'" + value + '"'),
    true,
    "spreadsheet formula protected",
  );
}
const copy = structuredClone(s);
copy.document.people[0].starts_on = "2026-10-26";
copy.document.people[1].ends_on = "2026-10-24";
eq(activeRosterPeople(copy).length, 43);
let reads = 0,
  saves = 0;
const OriginalSave = JsPDF.API.save;
JsPDF.API.save = () => {
  saves++;
};
const run = (extra = {}) =>
  downloadSiteRoster({
    context: {},
    rootId: "root",
    expected: s,
    format: "pdf",
    isCurrent: () => true,
    loadPdf: async () => ({ jsPDF: JsPDF }),
    fontLoader: async () => font,
    read: async () => {
      reads++;
      return structuredClone(s);
    },
    ...extra,
  });
try {
  await run();
  eq(reads, 2, "access and revision checked after async assets");
  eq(saves, 1);
  reads = 0;
  await assert.rejects(
    () =>
      run({
        read: async () => {
          reads++;
          const x = structuredClone(s);
          if (reads === 2) x.revision++;
          return x;
        },
      }),
    /Listen er endret/,
  );
  checks++;
  eq(saves, 1, "revision change cancels download");
  let current = true;
  await run({
    fontLoader: async () => {
      current = false;
      return font;
    },
    isCurrent: () => current,
  });
  eq(saves, 1, "scope/visibility cancellation prevents late download");
} finally {
  JsPDF.API.save = OriginalSave;
}
console.log(
  `Site roster export: ${checks} assertions PASS; ${pdf.getNumberOfPages()} pages; ${path}`,
);
