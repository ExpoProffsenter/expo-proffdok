import fs from "node:fs";
import assert from "node:assert/strict";
import {
  createReportGenerationStamp,
  resolveReportWarrantyReceipt,
} from "../src/modules/report/reportFinalizationState.mjs";

const read = (file) => fs.readFileSync(file, "utf8");

const report = read("src/modules/report/reportTools.js");
const main = read("src/main.jsx");
const overtagelse = read("src/modules/overtagelse/overtagelseTools.js");
const contracts = read("src/modules/sales/services/salesContracts.js");
const help = read("src/modules/help/helpToolsCore.js");

for (const needle of [
  "const reportGeneration = createReportGenerationStamp()",
  "const reportGeneratedAtLabel = () => reportGeneration.label",
  "resolveReportWarrantyReceipt({ warranty, warrantyReadiness, overtagelse, project })",
  "reportWarrantyTermsAccepted() ? `Kunde/representant har bekreftet mottak",
  "reportWarrantyTermsAccepted() ? `Mottatt og akseptert av",
  "const reportGeneratedAt = reportGeneration.iso",
]) {
  assert(report.includes(needle), `Production-closeout mangler rapportvern: ${needle}`);
}

assert(
  !report.includes('const reportText = warranty?.reportGeneratedAt') &&
    !report.includes('"Genereres nå"'),
  "Ferdig PDF må bruke genereringstidspunktet for den aktuelle rapporten."
);

const fixedTime = new Date("2026-09-28T00:28:18.623Z");
const generation = createReportGenerationStamp(fixedTime);
assert.equal(generation.iso, "2026-09-28T00:28:18.623Z");
assert.notEqual(generation.label, "Genereres nå");

assert.deepEqual(
  resolveReportWarrantyReceipt({
    warranty: { enabled: true, termsAccepted: false },
    warrantyReadiness: { termsAccepted: true },
    overtagelse: { signKunde: "PRODUCTION QA KUNDE – IKKE REELL" },
  }),
  {
    accepted: true,
    acceptedBy: "PRODUCTION QA KUNDE – IKKE REELL",
    acceptedAtLabel: "",
  },
  "Signert overtagelse/readiness skal gi samme vilkårstatus i PDF som i appen."
);

assert.equal(
  resolveReportWarrantyReceipt({
    warranty: { termsAccepted: true, termsAcceptedBy: "Lagret kunde" },
    warrantyReadiness: { termsAccepted: false },
  }).acceptedBy,
  "Lagret kunde",
  "Persisted garantikvittering skal vinne over fallback."
);

assert(
  contracts.includes('by: String(contract.company_signed_by_name || "").trim()'),
  "Arkivert Expo-kontrakt må beholde navnet til autentisert bedriftssignatar."
);

assert.equal(
  main.match(/authorName: authenticatedFullName \|\| user\.name \|\| authUser\?\.email \|\| profile\?\.email \|\| "Ukjent"/g)?.length,
  2,
  "Fag/utstyr må bruke autentisert aktør i både ordinær og begrenset prosjektflate."
);

assert(
  main.includes("const setProjectLockedState = async (locked, { skipConfirm = false } = {})") &&
    main.includes("if (!skipConfirm && !window.confirm(message)) return;"),
  "Vanlig låsing skal beholde bekreftelse, mens eksplisitt fullføringsflyt kan hoppe over duplikat-popup."
);

assert(
  overtagelse.includes("await setProjectLockedState(true, { skipConfirm: true });"),
  "Fullfør overtagelse skal ikke åpne en ekstra identisk låsebekreftelse."
);

for (const needle of [
  "utsted garantien, last ned komplett PDF og kontroller arkivtidspunktet",
  "den endelige komplette PDF-en etter signering og garantiutstedelse",
  "bekreftede garantivilkår og et faktisk genereringstidspunkt",
]) {
  assert(help.includes(needle), `Hjelp mangler korrigert sluttflyt: ${needle}`);
}

console.log(
  "critical-production-closeout-check: OK – PDF-status, auditspor og popuprekkefølge er sikret"
);
