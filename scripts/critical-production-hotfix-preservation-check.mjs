import fs from "node:fs";
import assert from "node:assert/strict";
import {
  asAcceptedContractRequest,
  needsActivatedContractFallback,
  shouldHideLegacySurveyPlanningPrompt,
} from "../src/modules/sales/utils/salesActivatedLegacyFallback.js";

const communication = fs.readFileSync(
  "src/modules/sales/services/salesCommunication.js",
  "utf8"
);
const legacyDetail = fs.readFileSync(
  "src/modules/sales/components/SalesDetailViewLegacy.jsx",
  "utf8"
);
const detailWrapper = fs.readFileSync(
  "src/modules/sales/components/SalesDetailView.jsx",
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

const legacyActivatedRequest = {
  id: "legacy-activated-without-timestamp",
  status: "Aktivert",
  projectId: "project-1",
  projectActivatedAt: "",
  surveyDate: "",
};

assert.equal(
  needsActivatedContractFallback(legacyActivatedRequest, { storeOffer: false }),
  true,
  "Aktivert legacy-sak uten projectActivatedAt skal få kontraktfallback."
);
assert.equal(
  needsActivatedContractFallback(
    { ...legacyActivatedRequest, projectActivatedAt: "2026-09-25T12:00:00Z" },
    { storeOffer: false }
  ),
  false,
  "Nyere Aktivert-sak med projectActivatedAt skal fortsette gjennom Production-hotfixen."
);
assert.equal(
  needsActivatedContractFallback(legacyActivatedRequest, { storeOffer: true }),
  false,
  "Generelt tilbud/store-offer skal ikke få våtromskontraktfallback."
);
assert.equal(
  asAcceptedContractRequest(legacyActivatedRequest).status,
  "Akseptert",
  "Kontrakthandlinger må få kompatibel Akseptert-presentasjon uten å endre lagret status."
);
assert.equal(
  shouldHideLegacySurveyPlanningPrompt(legacyActivatedRequest),
  true,
  "Aktivert sak skal aldri vise gammel befaring-planleggingstekst."
);
assert.equal(
  shouldHideLegacySurveyPlanningPrompt({ status: "Forespørsel" }),
  false,
  "Forespørsel skal fortsatt kunne vise planleggingsteksten."
);
assert.equal(
  shouldHideLegacySurveyPlanningPrompt({ status: "Befaring" }),
  false,
  "Befaring skal fortsatt kunne vise relevant planleggingstekst."
);

for (const needle of [
  "data-activated-contract-legacy-fallback",
  "needsActivatedContractFallback",
  "shouldHideLegacySurveyPlanningPrompt",
  "hideStaleSurveyPlanningPrompt",
  "asAcceptedContractRequest(request)",
  "<SalesContractActions",
  "<SalesContractWizard",
  "Prosjektet er allerede aktivert, men kontrakten kan fortsatt opprettes",
]) {
  assert(
    detailWrapper.includes(needle),
    `45B legacy Aktivert-sikkerhet mangler i wrapper: ${needle}`
  );
}

console.log(
  "critical-production-hotfix-preservation-check: OK – Production-hotfixer og legacy Aktivert-scenario er bevart"
);
