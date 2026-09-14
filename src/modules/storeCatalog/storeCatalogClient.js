// Expo ProffDok – FASE 42B / FASE 39B.2
// Tynn klient mot internt vareregister.
// ERP-batcher oppdaterer én katalogkopi direkte; søk sperres til importen er ferdig aktivert.
// En sjelden PostgreSQL statement timeout håndteres med én retry og deretter mindre delbatcher.

const STORE_CATALOG_BATCH_RETRY_DELAY_MS = 900;
const STORE_CATALOG_BATCH_MAX_SPLIT_DEPTH = 2;

function ensureClient(supabase) {
  if (!supabase?.rpc) throw new Error("Supabase-klient mangler.");
  return supabase;
}

function unwrap(data, error, fallbackMessage) {
  if (error) throw new Error(error.message || fallbackMessage);
  return data;
}

function isStatementTimeout(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return code === "57014" || message.includes("statement timeout");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadCatalogRpc(supabase, importId, items) {
  return ensureClient(supabase).rpc(
    "import_internal_store_catalog_batch",
    {
      p_import_id: importId,
      p_items: items,
    }
  );
}

async function uploadCatalogBatchWithRecovery(
  supabase,
  importId,
  items,
  { onRetry = null } = {},
  splitDepth = 0
) {
  let response = await uploadCatalogRpc(supabase, importId, items);
  if (!response?.error) return response?.data;
  if (!isStatementTimeout(response.error)) {
    throw new Error(response.error?.message || "Kunne ikke laste opp varebatch.");
  }

  // Første timeout kan være en kortvarig lås/ventesituasjon. Prøv samme idempotente upsert én gang til.
  if (splitDepth === 0) {
    onRetry?.({ type: "retry", itemCount: items.length, splitDepth });
    await wait(STORE_CATALOG_BATCH_RETRY_DELAY_MS);
    response = await uploadCatalogRpc(supabase, importId, items);
    if (!response?.error) return response?.data;
    if (!isStatementTimeout(response.error)) {
      throw new Error(response.error?.message || "Kunne ikke laste opp varebatch.");
    }
  }

  if (splitDepth >= STORE_CATALOG_BATCH_MAX_SPLIT_DEPTH || items.length < 2) {
    throw new Error(
      "Databasen brukte for lang tid på samme varebatch selv etter automatisk retry. Start importen på nytt."
    );
  }

  // Hvis en full batch fortsatt treffer timeout, del den. Upserten er idempotent og delene kan kjøres trygt i rekkefølge.
  const middle = Math.ceil(items.length / 2);
  const first = items.slice(0, middle);
  const second = items.slice(middle);
  onRetry?.({ type: "split", itemCount: items.length, splitDepth: splitDepth + 1 });

  const firstResult = await uploadCatalogBatchWithRecovery(
    supabase,
    importId,
    first,
    { onRetry },
    splitDepth + 1
  );
  const secondResult = await uploadCatalogBatchWithRecovery(
    supabase,
    importId,
    second,
    { onRetry },
    splitDepth + 1
  );

  return {
    recovered: true,
    parts: [firstResult, secondResult],
  };
}

export async function beginStoreCatalogImport(
  supabase,
  { sourceFilename, sourceSizeBytes = null, sourceSha256 = null } = {}
) {
  const { data, error } = await ensureClient(supabase).rpc(
    "begin_internal_store_catalog_import",
    {
      p_source_filename: sourceFilename,
      p_source_size_bytes: sourceSizeBytes,
      p_source_sha256: sourceSha256,
    }
  );
  return unwrap(data, error, "Kunne ikke starte vareimport.");
}

export async function uploadStoreCatalogBatch(supabase, importId, items, options = {}) {
  const payload = Array.isArray(items) ? items : [];
  return uploadCatalogBatchWithRecovery(supabase, importId, payload, options, 0);
}

export async function getPendingStoreCatalogImport(supabase) {
  const { data, error } = await ensureClient(supabase).rpc(
    "get_pending_internal_store_catalog_import"
  );
  return unwrap(data || null, error, "Kunne ikke hente uferdig vareimport.");
}

export async function prepareStoreCatalogActivation(
  supabase,
  importId,
  summary = {}
) {
  const { data, error } = await ensureClient(supabase).rpc(
    "prepare_internal_store_catalog_activation",
    {
      p_import_id: importId,
      p_total_rows: summary.totalRows || 0,
      p_skipped_zero_price_rows: summary.skippedZeroPriceRows || 0,
      p_skipped_missing_sku_rows: summary.skippedMissingSkuRows || 0,
      p_malformed_rows: summary.malformedRows || 0,
    }
  );
  return unwrap(data, error, "Kunne ikke klargjøre vareregisteret.");
}

export async function completeStoreCatalogActivation(supabase, importId) {
  const { data, error } = await ensureClient(supabase).rpc(
    "complete_internal_store_catalog_activation",
    { p_import_id: importId }
  );
  return unwrap(data, error, "Kunne ikke aktivere vareregisteret.");
}

export async function finalizeStoreCatalogImport(
  supabase,
  importId,
  summary = {},
  onProgress = null
) {
  const prepared = await prepareStoreCatalogActivation(supabase, importId, summary);
  const expectedRows = Number(prepared?.accepted_rows || summary.uniqueRows || summary.acceptedRows || 0);

  onProgress?.({ processedRows: expectedRows, totalRows: expectedRows, remainingRows: 0 });
  return completeStoreCatalogActivation(supabase, importId);
}

export async function cancelStoreCatalogImport(supabase, importId) {
  const { data, error } = await ensureClient(supabase).rpc(
    "cancel_internal_store_catalog_import",
    { p_import_id: importId }
  );
  return unwrap(data, error, "Kunne ikke avbryte vareimport.");
}

export async function searchStoreCatalog(supabase, query, limit = 30) {
  const { data, error } = await ensureClient(supabase).rpc(
    "search_internal_store_catalog",
    { p_query: query, p_limit: limit }
  );
  return unwrap(data || [], error, "Kunne ikke søke i vareregister.");
}

export async function getStoreCatalogAlternatives(supabase, itemId) {
  const { data, error } = await ensureClient(supabase).rpc(
    "internal_store_catalog_alternatives",
    { p_item_id: itemId }
  );
  return unwrap(data || [], error, "Kunne ikke hente leverandøralternativer.");
}

export async function canAccessInternalStoreCatalog(supabase) {
  const { data, error } = await ensureClient(supabase).rpc(
    "current_user_has_internal_store_catalog_access"
  );
  if (error) return false;
  return data === true;
}

export async function canManageInternalStoreCatalog(supabase) {
  const { data, error } = await ensureClient(supabase).rpc(
    "current_user_can_manage_internal_store_catalog"
  );
  if (error) return false;
  return data === true;
}
