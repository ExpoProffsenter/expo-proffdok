import fs from "node:fs";
import assert from "node:assert/strict";

const communication = fs.readFileSync(
  "src/modules/sales/services/salesCommunication.js",
  "utf8"
);
const legacyDetail = fs.readFileSync(
  "src/modules/sales/components/SalesDetailViewLegacy.jsx",
  "utf8"
);

for (const needle of [
  'const RINGSIDE_SOURCE_COMPANY_NAME = "Ringside Rørleggerbedrift AS"',
  'const RINGSIDE_DOCUMENT_COMPANY_NAME = "Ringside AS"',
  'const RINGSIDE_DOCUMENT_EMAIL = "firmapost@ringside.no"',
  'const RINGSIDE_DOCUMENT_PHONE = "22068900"',
  "withCompanyIdentityOverride",
  "companyName: RINGSIDE_DOCUMENT_COMPANY_NAME",
  "email: RINGSIDE_DOCUMENT_EMAIL",
  "phone: RINGSIDE_DOCUMENT_PHONE",
]) {
  assert(
    communication.includes(needle),
    `Production-hotfix for Ringside dokumentidentitet mangler: ${needle}`
  );
}

for (const needle of [
  'const contractEligible = ["Akseptert", "Aktivert"].includes(request?.status)',
  'request?.status === "Aktivert" ? { ...request, status: "Akseptert" } : request',
  'request?.status === "Aktivert"',
  'nodeText.includes("Prosjektet er opprettet i den ordinære ProffDok-prosjektlisten.")',
  "activated-sales-contract-actions",
  '<SalesContractActions request={contractRequest} onOpenWizard={onOpenWizard} />',
  '["Akseptert", "Aktivert"].includes(coreProps?.selectedRequest?.status)',
]) {
  assert(
    legacyDetail.includes(needle),
    `Production-hotfix for kontrakt etter prosjektaktivering mangler: ${needle}`
  );
}

console.log(
  "critical-production-hotfix-preservation-check: OK – Production-hotfixer fra 25.09.2026 er bevart"
);
