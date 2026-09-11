import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const source = read(path);
  for (const needle of needles) {
    if (!source.includes(needle)) {
      throw new Error(`${path}: mangler 41B.5-guard: ${needle}`);
    }
  }
  return source;
}

const component = requireNeedles(
  "src/modules/sales/components/StoreOfferOrderBasis.jsx",
  [
    "acceptedOfferLines",
    "version_snapshot",
    "acceptedOptions",
    "selected_options",
    "replacementLineId",
    "replacedProductIds",
    "supplierProductNumber",
    "nobbNumber",
    "storeCatalogGtin",
    "Mangler varenr./NOBB/GTIN",
    "Kopier liste",
    "Skriv ut",
    "Prisfelter er utelatt",
    "Grunnlaget er generert fra låst akseptert tilbudsinnhold",
  ]
);

for (const forbidden of [
  "purchase_net_ex_vat",
  "customer_price_ex_vat",
  "customer_price_incl_vat",
  "storeUnitPriceInclVat",
  "storeDiscountPercent",
  "formatNok(",
]) {
  if (component.includes(forbidden)) {
    throw new Error(`Bestillingsgrunnlaget skal være prisfritt: fant ${forbidden}`);
  }
}

if (/\.(from|rpc)\s*\(/.test(component) || component.includes("createDefaultSalesSupabaseClient")) {
  throw new Error("Bestillingsgrunnlag-komponenten skal være read-only og uten databasekall.");
}

const ux = requireNeedles("src/modules/sales/storeOrderBasisUx.jsx", [
  "StoreOfferOrderBasis",
  "loadSalesNavigation",
  "loadRequests",
  'request.status !== "Akseptert"',
  "isStoreOfferRequest(request)",
  "supportModeActive()",
  "expo-store-order-basis-host",
]);

if (/new\s+MutationObserver\s*\(/.test(ux)) {
  throw new Error("41B.5 bestillingsgrunnlag skal ikke bruke MutationObserver.");
}

requireNeedles("index.html", [
  "installStoreOrderBasisUx",
  "/src/modules/sales/storeOrderBasisUx.jsx",
]);

console.log("✅ Expo ProffDok Butikktilbud bestillingsgrunnlag check OK");
