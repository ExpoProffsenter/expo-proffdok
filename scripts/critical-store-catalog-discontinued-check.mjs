import {
  parseStoreCatalogLine,
  STORE_CATALOG_FIELD_COUNT,
} from "../src/modules/storeCatalog/storeCatalogImport.js";
import {
  prepareStoreCatalogActivation,
  uploadStoreCatalogBatch,
} from "../src/modules/storeCatalog/storeCatalogClient.js";

function assert(condition, message) {
  if (!condition) throw new Error(`FASE 42C critical check: ${message}`);
}

assert(STORE_CATALOG_FIELD_COUNT === 18, "ERP-formatet skal fortsatt ha 18 felt.");

const baseFields = [
  "Testleverandør", "1001024", "910,00", "54,80", "411,02", "220,00", "68,80",
  "1315,28", "1644,10", "VO", "20251101", "1", "1", "0", "0",
  'STÅLRØR BLÅMALTE GJ. 3" MS EN 10255 S195T', "", "",
];

const active = parseStoreCatalogLine(baseFields.join(";"), 1);
assert(active.status === "accepted", "aktiv Cordel-vare med tredje flagg = 0 skal aksepteres.");

const discontinuedFields = [...baseFields];
discontinuedFields[1] = "1001025";
discontinuedFields[13] = "1";
discontinuedFields[15] = 'STÅLRØR BLÅMALTE GJ. 4" MS EN 10255 S195T';
const discontinued = parseStoreCatalogLine(discontinuedFields.join(";"), 2);

assert(
  discontinued.status === "skipped_discontinued",
  "varenr. 1001025 med Cordels tredje statusflagg = 1 skal hoppes over."
);
assert(
  discontinued.reason === "cordel_discontinued",
  "utgått vare skal få eksplisitt Cordel-årsak."
);
assert(
  !discontinued.item,
  "utgått vare skal aldri serialiseres eller kunne lastes opp til aktiv katalog."
);

const avpFields = [...baseFields];
avpFields[0] = "ÅVP Geberit";
avpFields[1] = "AVP-001";
avpFields[13] = "0";
const avp = parseStoreCatalogLine(avpFields.join(";"), 3);
assert(
  avp.status === "skipped_avp_supplier",
  "leverandør som starter med ÅVP skal hoppes over."
);
assert(
  avp.reason === "legacy_avp_supplier",
  "ÅVP-vare skal få eksplisitt legacy-leverandørårsak."
);
assert(!avp.item, "ÅVP-vare skal aldri serialiseres eller lastes opp.");

const avpCaseFields = [...baseFields];
avpCaseFields[0] = "  åvp Macro  ";
avpCaseFields[1] = "AVP-002";
const avpCase = parseStoreCatalogLine(avpCaseFields.join(";"), 4);
assert(
  avpCase.status === "skipped_avp_supplier",
  "ÅVP-filteret skal tåle små bokstaver og omkringliggende mellomrom."
);

const avpZeroFields = [...baseFields];
avpZeroFields[0] = "ÅVP Oras";
avpZeroFields[1] = "AVP-ZERO";
avpZeroFields[4] = "0,00";
const avpZero = parseStoreCatalogLine(avpZeroFields.join(";"), 5);
assert(
  avpZero.status === "skipped_zero_price",
  "ÅVP-vare med 0-pris skal fortsatt telles i eksisterende 0-pris-kategori, ikke dobbelt som ÅVP."
);

const normalGeberitFields = [...baseFields];
normalGeberitFields[0] = "Geberit";
normalGeberitFields[1] = "GEB-001";
const normalGeberit = parseStoreCatalogLine(normalGeberitFields.join(";"), 6);
assert(
  normalGeberit.status === "accepted",
  "vanlig Geberit uten ÅVP-prefiks skal fortsatt importeres."
);

const wrongFlagFields = [...baseFields];
wrongFlagFields[1] = "1001026";
wrongFlagFields[12] = "0";
wrongFlagFields[13] = "0";
wrongFlagFields[14] = "1";
const wrongFlag = parseStoreCatalogLine(wrongFlagFields.join(";"), 7);
assert(
  wrongFlag.status === "accepted",
  "det er kun Cordels tredje statusflagg som skal tolkes som Utgått."
);

let activationRpc = null;
const activationClient = {
  async rpc(name, args) {
    activationRpc = { name, args };
    return { data: { accepted_rows: 300000, duplicate_rows: 1 }, error: null };
  },
};
await prepareStoreCatalogActivation(
  activationClient,
  "00000000-0000-0000-0000-000000000042",
  {
    totalRows: 489923,
    skippedDiscontinuedRows: 66356,
    skippedAvpSupplierRows: 94917,
    skippedZeroPriceRows: 19255,
    skippedMissingSkuRows: 3,
    malformedRows: 0,
  }
);
assert(
  activationRpc?.name === "prepare_internal_store_catalog_activation_v3",
  "klargjøring skal bruke v3-RPC med ÅVP-teller."
);
assert(
  activationRpc?.args?.p_skipped_avp_supplier_rows === 94917,
  "ÅVP-telleren skal sendes eksplisitt til backend."
);
assert(
  activationRpc?.args?.p_skipped_discontinued_rows === 66356,
  "Utgått-telleren skal fortsatt sendes separat."
);

let rpcCalls = 0;
const recoveryEvents = [];
const timeoutThenRecoverClient = {
  async rpc(name, args) {
    assert(name === "import_internal_store_catalog_batch", "timeout-test skal bare bruke katalogbatch-RPC.");
    assert(Array.isArray(args?.p_items), "timeout-test skal sende vareliste.");
    rpcCalls += 1;
    if (rpcCalls <= 2) {
      return {
        data: null,
        error: {
          code: "57014",
          message: "canceling statement due to statement timeout",
        },
      };
    }
    return {
      data: { upserted_count: args.p_items.length },
      error: null,
    };
  },
};

const timeoutPayload = Array.from({ length: 4 }, (_, index) => ({
  supplier_name: "Testleverandør",
  supplier_product_number: `TIMEOUT-${index + 1}`,
}));

const recovered = await uploadStoreCatalogBatch(
  timeoutThenRecoverClient,
  "00000000-0000-0000-0000-000000000001",
  timeoutPayload,
  { onRetry: (event) => recoveryEvents.push(event) }
);

assert(rpcCalls === 4, "én timeout-retry skal etterfølges av to mindre delbatcher.");
assert(recoveryEvents.some((event) => event.type === "retry"), "timeout skal først gi automatisk retry.");
assert(recoveryEvents.some((event) => event.type === "split"), "gjentatt timeout skal dele batchen.");
assert(recovered?.recovered === true, "vellykket deling skal rapporteres som gjenopprettet batch.");

console.log("✅ Expo ProffDok Cordel Utgått / ÅVP-filter / timeout recovery check OK");