import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const wrapper = fs.readFileSync(
  path.join(root, "src/modules/sales/components/SalesStoreOfferBuilderProCatalog.jsx"),
  "utf8"
);

for (const needle of [
  "WORK_PROFILE_EVENT",
  "window.addEventListener(WORK_PROFILE_EVENT, syncWorkProfile)",
  "window.removeEventListener(WORK_PROFILE_EVENT, syncWorkProfile)",
  "withInternalSenderMeta",
  "internalBrandKeyBeforeCompanyMode",
  'brandGrid.style.display = ""',
  'brandGrid.style.display = "none"',
  'data-company-sender-card=\'1\'',
  "existingCard.remove()",
  'data-store-sender-mode={externalSender ? "company" : "internal-brand-choice"}',
]) {
  assert(wrapper.includes(needle), `Avsender/work-profile-kontrakt mangler: ${needle}`);
}

assert(
  wrapper.includes('"ringside rørleggerbedrift as"') &&
    wrapper.includes('"bademiljø expo"'),
  "Ringside og Bademiljø Expo må beholde intern merkevarevelger."
);
assert(
  wrapper.includes("setWorkProfileRevision((current) => current + 1)"),
  "Firmabytte må også tvinge ny kontroll av proffkatalogtilgang."
);
assert(
  wrapper.includes("delete nextMeta.brandMode") &&
    wrapper.includes("delete nextMeta.companyBrandHasLogo"),
  "Company-profile metadata må ryddes når intern avsender gjenopprettes."
);

console.log("critical-store-sender-work-profile-check: OK");
