import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(`Prosjektkontrakt check: ${message}`);
}

const requestModule = await import(
  pathToFileURL(
    path.join(root, "src/modules/contract/projectSalesContractRequest.mjs")
  ).href
);

const project = {
  projectName: "Bad hos Testkunde",
  customer: "Prosjektkunden",
  customerEmail: "kunde@example.invalid",
  customerPhone: "99999999",
  address: "Prosjektveien 1",
  postnr: "0001",
  city: "Oslo",
  responsible: "Ansvarlig Montør",
  salesOrigin: {
    requestRef: "DEMO-CONTRACT-001",
    publicToken: "public-token",
    acceptedOfferVersionId: "version-accepted",
    acceptedOfferVersionNumber: 4,
    acceptedBy: "Kunden",
    acceptedAt: "2026-09-28T08:00:00.000Z",
    acceptedTotal: 100000,
  },
};
const publicOfferData = {
  offer: {
    id: "offer-from-server",
    request_ref: "DEMO-CONTRACT-001",
    status: "accepted",
    public_token: "public-token",
    customer_name: "Eldre kundenavn",
    customer_email: "old@example.invalid",
    customer_phone: "11111111",
    customer_address: "Gammel adresse",
    accepted_by: "Kunden",
    accepted_at: "2026-09-28T08:00:00.000Z",
    accepted_payload: {
      offer_id: "offer-from-server",
      version_id: "version-accepted",
      version_number: 4,
      selected_options: [{ id: "option-1", description: "Valgt opsjon", amount: 5000 }],
    },
  },
  version: {
    id: "version-accepted",
    version_number: 4,
    title: "Akseptert våtromstilbud",
    total_ex_vat: 100000,
    lines: [{ id: "line-1", description: "Riving", amount: 100000 }],
    options: [],
  },
};

assert(
  requestModule.hasProjectSalesOrigin(project),
  "ordinært aktivert Sales-prosjekt må få kontraktinngang"
);
assert(
  !requestModule.hasProjectSalesOrigin({ ...project, workflowType: "simple_order" }),
  "Enkel ordre skal ikke få ordinær kontraktinngang"
);
assert(
  requestModule.hasAcceptedPublicOffer(publicOfferData),
  "servergrunnlaget må være en akseptert tilbudsversjon"
);
assert(
  requestModule.publicOfferMatchesProjectOrigin(project, publicOfferData),
  "servergrunnlaget må samsvare med prosjektets låste opprinnelse"
);
assert(
  !requestModule.publicOfferMatchesProjectOrigin(project, {
    ...publicOfferData,
    version: { ...publicOfferData.version, id: "wrong-version" },
  }),
  "annen tilbudsversjon må avvises"
);

const request = requestModule.buildProjectSalesContractRequest({
  project,
  tilbud: {
    files: [
      {
        id: "external-contract",
        name: "Signert kontrakt.pdf",
        documentType: "contract",
        contractSource: "external",
      },
    ],
  },
  publicOfferData,
});

assert(
  request.salesOfferId === "offer-from-server",
  "eldre prosjekt uten lagret offer-id må bruke serverens offer-id"
);
assert(
  request.acceptedOfferVersionId === "version-accepted" &&
    request.acceptedPayload.version_id === "version-accepted",
  "akseptert versjon må følge prosjektadapteren"
);
assert(
  request.acceptedOfferLines.length === 1 && request.acceptedOptions.length === 1,
  "låste poster og valgte opsjoner må følge kontraktgrunnlaget"
);
assert(
  request.customer === "Prosjektkunden" && request.email === "kunde@example.invalid",
  "oppdaterte prosjektkontakter må brukes uten å endre akseptgrunnlaget"
);
assert(
  request.contractFile?.id === "external-contract",
  "eksisterende egen kontrakt må hindre duplisert opprettelse"
);

const projectEntry = read("src/modules/contract/ProjectSalesContractActions.jsx");
for (const needle of [
  "getSalesOfferByToken",
  "publicOfferMatchesProjectOrigin",
  "<SalesContractActions",
  "<SalesContractWizard",
  'data-project-sales-contract-entry="true"',
  "Du trenger ikke gå tilbake til Tilbud.",
  "creationDisabledReason={creationDisabledReason}",
  "readOnly={readOnly}",
  "projectContractFile={request?.contractFile}",
]) {
  assert(projectEntry.includes(needle), `prosjektflaten mangler: ${needle}`);
}
for (const forbidden of ["window.location", 'setTab("sales")', 'goToTab("sales")']) {
  assert(!projectEntry.includes(forbidden), `prosjektflaten skal ikke navigere tilbake til Sales: ${forbidden}`);
}

const contractView = read("src/modules/contract/contractViewTools.js");
for (const needle of [
  'import("./ProjectSalesContractActions.jsx")',
  "withContractActions.splice",
  "readOnly: Boolean(args?.readOnly)",
  "onProjectSynced: args?.onProjectSynced",
]) {
  assert(contractView.includes(needle), `Avtalegrunnlag mangler integrasjon: ${needle}`);
}

const salesModule = read("src/modules/sales/SalesModuleCore.jsx");
assert(
  salesModule.includes('salesOfferId: selectedRequest.salesOfferId || ""'),
  "nye prosjekter må bevare sikker offer-id"
);

const contractActions = read("src/modules/sales/components/SalesContractActions.jsx");
for (const needle of [
  "const writeBlocked = supportMode || readOnly",
  "writeBlocked || creationDisabledReason",
  "await Promise.resolve(onProjectSynced?.())",
  "contract?.status === \"signed\"",
  "(!force && projectHasSyncedFinalDocument)",
  "!projectHasSyncedFinalDocument &&",
  "sameFinalContractDocument",
]) {
  assert(contractActions.includes(needle), `kontrakthandlinger mangler sikkerhetsvern: ${needle}`);
}

const main = read("src/main.jsx");
for (const needle of [
  "readOnly: isReadOnly || isUnderleverandorView || isProjectSupportReadOnly || isProjectLocked",
  "showSalesContractTools: !isReadOnly && !isUnderleverandorView",
  "onProjectSynced: () => refreshProjectFromCloud(true, true)",
  "const projectDataUnchanged =",
  "projectDirtyFingerprint(cleanData) === projectDirtyFingerprint(existingData)",
  "const projectTitleUnchanged =",
  "if (projectDataUnchanged && projectTitleUnchanged)",
  'setProjectAutoSaveStatus("Ingen endringer å lagre")',
]) {
  assert(main.includes(needle), `hovedintegrasjonen mangler: ${needle}`);
}
assert(
  main.indexOf("if (projectDataUnchanged && projectTitleUnchanged)") <
    main.indexOf('supabase.from("projects").update({', main.indexOf("const projectDataUnchanged =")),
  "byte-lik prosjektdata må stoppes før PATCH/updated_at"
);

console.log("✅ Expo ProffDok prosjekt → kontrakt check OK");
