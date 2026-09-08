// Expo ProffDok – FASE 39B.1
// Parser for Ringsides faste ERP-eksport: Windows-1252, semikolon, 18 felt.
// Nettopris behandles kun internt og skal aldri kopieres til kunde-/tilbuds-JSON.

export const STORE_CATALOG_ENCODING = "windows-1252";
export const STORE_CATALOG_FIELD_COUNT = 18;
export const STORE_CATALOG_DEFAULT_BATCH_SIZE = 1500;
export const STORE_CATALOG_MAX_BATCH_SIZE = 2500;

function trimText(value = "") {
  return String(value ?? "").trim();
}

export function parseStoreCatalogDecimal(value) {
  const normalized = trimText(value)
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseStoreCatalogDate(value) {
  const compact = trimText(value).replace(/\D/g, "");
  if (!/^\d{8}$/.test(compact)) return null;
  const year = Number(compact.slice(0, 4));
  const month = Number(compact.slice(4, 6));
  const day = Number(compact.slice(6, 8));
  if (
    year < 2000 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

export function normalizeStoreCatalogGtin(value = "") {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits || "";
}

function parseFlag(value = "") {
  return trimText(value) === "1";
}

function cleanDescription(value = "") {
  const text = trimText(value);
  if (!text) return "";
  // ERP-eksporten kan inneholde en enslig dobbelapostrof i varetekst.
  // Vi bruker ikke CSV-quote-logikk fordi hver fysisk linje konsekvent har 18 felt.
  return text.replace(/^"+/, "").replace(/"+$/, "").trim();
}

export function parseStoreCatalogLine(line, sourceLineNo = null) {
  const physicalLine = String(line ?? "").replace(/\r$/, "");
  const fields = physicalLine.split(";");

  if (fields.length !== STORE_CATALOG_FIELD_COUNT) {
    return {
      status: "malformed",
      reason: "field_count",
      sourceLineNo,
      fieldCount: fields.length,
    };
  }

  const supplierName = trimText(fields[0]);
  const supplierProductNumber = trimText(fields[1]);

  if (!supplierName) {
    return {
      status: "malformed",
      reason: "missing_supplier",
      sourceLineNo,
      fieldCount: fields.length,
    };
  }

  if (!supplierProductNumber) {
    return {
      status: "skipped_missing_sku",
      reason: "missing_sku",
      sourceLineNo,
      fieldCount: fields.length,
    };
  }

  const supplierListPriceExVat = parseStoreCatalogDecimal(fields[2]);
  const purchaseDiscountPercent = parseStoreCatalogDecimal(fields[3]);
  const purchaseNetExVat = parseStoreCatalogDecimal(fields[4]);
  const markupPercent = parseStoreCatalogDecimal(fields[5]);
  const grossMarginPercent = parseStoreCatalogDecimal(fields[6]);
  const customerPriceExVat = parseStoreCatalogDecimal(fields[7]);
  const customerPriceInclVat = parseStoreCatalogDecimal(fields[8]);

  if (
    !Number.isFinite(purchaseNetExVat) ||
    purchaseNetExVat <= 0 ||
    !Number.isFinite(customerPriceExVat) ||
    customerPriceExVat <= 0 ||
    !Number.isFinite(customerPriceInclVat) ||
    customerPriceInclVat <= 0
  ) {
    return {
      status: "skipped_zero_price",
      reason: "non_positive_net_or_sale_price",
      sourceLineNo,
      fieldCount: fields.length,
    };
  }

  return {
    status: "accepted",
    sourceLineNo,
    item: {
      supplierName,
      supplierProductNumber,
      supplierListPriceExVat,
      purchaseDiscountPercent,
      purchaseNetExVat,
      markupPercent,
      grossMarginPercent,
      customerPriceExVat,
      customerPriceInclVat,
      productGroup: trimText(fields[9]),
      priceDate: parseStoreCatalogDate(fields[10]),
      sourceFlag1: parseFlag(fields[11]),
      sourceFlag2: parseFlag(fields[12]),
      sourceFlag3: parseFlag(fields[13]),
      sourceFlag4: parseFlag(fields[14]),
      description: cleanDescription(fields[15]),
      gtin: normalizeStoreCatalogGtin(fields[16]),
    },
  };
}

export function serializeStoreCatalogItem(item = {}, sourceLineNo = null) {
  return {
    supplier_name: trimText(item.supplierName),
    supplier_product_number: trimText(item.supplierProductNumber),
    supplier_list_price_ex_vat: item.supplierListPriceExVat,
    purchase_discount_percent: item.purchaseDiscountPercent,
    purchase_net_ex_vat: item.purchaseNetExVat,
    markup_percent: item.markupPercent,
    gross_margin_percent: item.grossMarginPercent,
    customer_price_ex_vat: item.customerPriceExVat,
    customer_price_incl_vat: item.customerPriceInclVat,
    product_group: trimText(item.productGroup) || null,
    price_date: item.priceDate || null,
    source_flag_1: Boolean(item.sourceFlag1),
    source_flag_2: Boolean(item.sourceFlag2),
    source_flag_3: Boolean(item.sourceFlag3),
    source_flag_4: Boolean(item.sourceFlag4),
    description: trimText(item.description),
    gtin: normalizeStoreCatalogGtin(item.gtin) || null,
    source_line_no: sourceLineNo,
  };
}

export function createStoreCatalogImportSummary() {
  return {
    totalRows: 0,
    acceptedRows: 0,
    skippedZeroPriceRows: 0,
    skippedMissingSkuRows: 0,
    malformedRows: 0,
    uploadedRows: 0,
  };
}

function registerParsedLine(summary, parsed) {
  summary.totalRows += 1;
  if (parsed.status === "accepted") summary.acceptedRows += 1;
  else if (parsed.status === "skipped_zero_price") summary.skippedZeroPriceRows += 1;
  else if (parsed.status === "skipped_missing_sku") summary.skippedMissingSkuRows += 1;
  else summary.malformedRows += 1;
}

async function flushBatch(batch, summary, onBatch, onProgress) {
  if (!batch.length) return;
  if (typeof onBatch !== "function") {
    throw new Error("onBatch må være en funksjon som sender varebatchen til Supabase.");
  }
  const payload = batch.splice(0, batch.length);
  await onBatch(payload);
  summary.uploadedRows += payload.length;
  if (typeof onProgress === "function") onProgress({ ...summary });
}

export async function streamStoreCatalogFile(
  file,
  {
    batchSize = STORE_CATALOG_DEFAULT_BATCH_SIZE,
    onBatch,
    onProgress,
    signal,
  } = {}
) {
  if (!file || typeof file.stream !== "function") {
    throw new Error("ERP-filen mangler eller støtter ikke streaming.");
  }

  const safeBatchSize = Math.min(
    STORE_CATALOG_MAX_BATCH_SIZE,
    Math.max(1, Number(batchSize) || STORE_CATALOG_DEFAULT_BATCH_SIZE)
  );
  const summary = createStoreCatalogImportSummary();
  const decoder = new TextDecoder(STORE_CATALOG_ENCODING);
  const reader = file.stream().getReader();
  const batch = [];
  let carry = "";
  let lineNo = 0;

  const processLine = async (line) => {
    if (!line && !carry && summary.totalRows === 0) return;
    lineNo += 1;
    const parsed = parseStoreCatalogLine(line, lineNo);
    registerParsedLine(summary, parsed);
    if (parsed.status === "accepted") {
      batch.push(serializeStoreCatalogItem(parsed.item, lineNo));
      if (batch.length >= safeBatchSize) {
        await flushBatch(batch, summary, onBatch, onProgress);
      }
    }
  };

  try {
    while (true) {
      if (signal?.aborted) throw new DOMException("Import avbrutt.", "AbortError");
      const { value, done } = await reader.read();
      if (done) break;

      carry += decoder.decode(value, { stream: true });
      const lines = carry.split(/\n/);
      carry = lines.pop() ?? "";

      for (const line of lines) {
        await processLine(line.replace(/\r$/, ""));
      }
    }

    carry += decoder.decode();
    if (carry.length) await processLine(carry.replace(/\r$/, ""));
    await flushBatch(batch, summary, onBatch, onProgress);
    return { ...summary };
  } finally {
    reader.releaseLock();
  }
}
