import {
  parseStoreCatalogLine,
  STORE_CATALOG_FIELD_COUNT,
} from "../src/modules/storeCatalog/storeCatalogImport.js";
import { uploadStoreCatalogBatch } from "../src/modules/storeCatalog/storeCatalogClient.js";

function assert(condition, message) {
  if (!condition) throw new Error(`FASE 42B critical check: ${message}`);
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

const wrongFlagFields = [...baseFields];
wrongFlagFields[1] = "1001026";
wrongFlagFields[12] = "0";
wrongFlagFields[13] = "0";
wrongFlagFields[14] = "1";
const wrongFlag = parseStoreCatalogLine(wrongFlagFields.join(";"), 3);
assert(
  wrongFlag.status === "accepted",
  "det er kun Cordels tredje statusflagg som skal tolkes som Utgått."
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

console.log("✅ Expo ProffDok Cordel Utgått-filter / timeout recovery check OK");
