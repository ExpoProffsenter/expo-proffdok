// Expo ProffDok – FASE 39B.2
// Intern katalogvelger og trygg ERP-prisoppdatering for Ringside/Bademiljø Expo.
// Nettopris vises kun i dette interne panelet og kopieres aldri til tilbudslinjen.

import { useEffect, useRef, useState } from "react";
import { Database, RefreshCw, Search, Upload, X } from "lucide-react";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";
import {
  beginStoreCatalogImport,
  canAccessInternalStoreCatalog,
  canManageInternalStoreCatalog,
  cancelStoreCatalogImport,
  finalizeStoreCatalogImport,
  getPendingStoreCatalogImport,
  getStoreCatalogAlternatives,
  searchStoreCatalog,
  uploadStoreCatalogBatch,
} from "./storeCatalogClient.js";
import {
  STORE_CATALOG_DEFAULT_BATCH_SIZE,
  streamStoreCatalogFile,
} from "./storeCatalogImport.js";

const money = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 2,
});

function formatMoney(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? money.format(number) : "–";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("nb-NO");
}

function CatalogItem({ item, onUse, onAlternatives, primary = false }) {
  return (
    <article className={`catalog-result ${primary ? "is-primary" : ""}`}>
      <div className="catalog-result-copy">
        <strong>{item.description || "Vare uten beskrivelse"}</strong>
        <span>{item.supplier_name} · varenr. {item.supplier_product_number}</span>
        <small>
          {item.gtin ? `GTIN ${item.gtin}` : "Uten GTIN"}
          {item.price_date ? ` · prisdato ${item.price_date}` : ""}
        </small>
      </div>
      <div className="catalog-prices">
        <span>Ut kunde</span>
        <strong>{formatMoney(item.customer_price_incl_vat)} inkl. mva.</strong>
        <small>Intern nto {formatMoney(item.purchase_net_ex_vat)} eks. mva.</small>
      </div>
      <div className="catalog-actions">
        {item.gtin && onAlternatives ? (
          <button type="button" className="catalog-secondary" onClick={() => onAlternatives(item)}>
            Leverandører
          </button>
        ) : null}
        <button type="button" className="catalog-primary" onClick={() => onUse(item)}>
          Bruk varen
        </button>
      </div>
    </article>
  );
}

function toPendingSummary(pending = {}) {
  const acceptedRows = Number(pending.accepted_rows || 0);
  return {
    totalRows: Number(pending.total_rows || 0),
    acceptedRows,
    skippedZeroPriceRows: Number(pending.skipped_zero_price_rows || 0),
    skippedMissingSkuRows: Number(pending.skipped_missing_sku_rows || 0),
    malformedRows: Number(pending.malformed_rows || 0),
    duplicateRows: Number(pending.duplicate_rows || 0),
    uploadedRows: acceptedRows,
  };
}

function ImportPanel({ client, onActivated }) {
  const [file, setFile] = useState(null);
  const [sourceName, setSourceName] = useState("");
  const [busy, setBusy] = useState(false);
  const [importId, setImportId] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    let active = true;
    getPendingStoreCatalogImport(client)
      .then((pending) => {
        if (!active || !pending?.id) return;
        setImportId(String(pending.id));
        setImportStatus(String(pending.status || "loading"));
        setSourceName(String(pending.source_filename || "ERP-import"));
        setSummary(toPendingSummary(pending));
        const prepared = Number(pending.prepared_rows || 0);
        setMessage(
          pending.status === "activating"
            ? `Uferdig aktivering funnet. ${formatNumber(prepared)} varer er allerede klargjort. Trykk Fortsett aktivering.`
            : "Uferdig import funnet. Filen er allerede lastet opp – du trenger ikke velge den på nytt."
        );
      })
      .catch(() => {
        // Manglende pending-import er ikke en feil for brukeren.
      });
    return () => { active = false; };
  }, [client]);

  useEffect(() => {
    if (!busy) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  async function cancelCurrent(id = importId) {
    abortRef.current?.abort();
    if (id) {
      try {
        await cancelStoreCatalogImport(client, id);
      } catch (error) {
        setMessage(error?.message || "Kunne ikke avbryte importen.");
        return;
      }
    }
    setBusy(false);
    setImportId("");
    setImportStatus("");
    setSummary(null);
    setSourceName("");
    setFile(null);
    setMessage("Importen er avbrutt. Aktivt vareregister er ikke endret.");
  }

  async function uploadFile() {
    if (!file || busy) return;
    setBusy(true);
    setSummary(null);
    setMessage("Starter import …");
    let nextImportId = "";
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      nextImportId = await beginStoreCatalogImport(client, {
        sourceFilename: file.name,
        sourceSizeBytes: file.size,
      });
      setImportId(nextImportId);
      setImportStatus("loading");
      setSourceName(file.name);
      const result = await streamStoreCatalogFile(file, {
        batchSize: STORE_CATALOG_DEFAULT_BATCH_SIZE,
        signal: controller.signal,
        onBatch: (items) => uploadStoreCatalogBatch(client, nextImportId, items),
        onProgress: (progress) => {
          setSummary(progress);
          setMessage(`Laster opp … ${formatNumber(progress.uploadedRows)} gyldige varer behandlet`);
        },
      });
      setSummary(result);
      setMessage("Filen er kontrollert og lastet til staging. Kontroller tallene før du aktiverer.");
    } catch (error) {
      if (nextImportId) {
        try {
          await cancelStoreCatalogImport(client, nextImportId);
        } catch {
          // Aktiv katalog påvirkes ikke av en uferdig staging-import.
        }
      }
      setImportId("");
      setImportStatus("");
      setSummary(null);
      setSourceName("");
      setMessage(
        error?.name === "AbortError"
          ? "Importen er avbrutt. Aktivt vareregister er ikke endret."
          : `Importen stoppet: ${error?.message || "Ukjent feil"}`
      );
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  async function activateImport() {
    if (!importId || !summary || busy) return;
    if (summary.malformedRows > 0) {
      setMessage("Aktivering er sperret fordi filen inneholder strukturelle feil.");
      return;
    }
    const confirmed = window.confirm(
      `Aktiver nytt vareregister med ${formatNumber(summary.acceptedRows)} gyldige/unike varer?\n\n` +
        "Eksisterende publiserte og aksepterte tilbud endres ikke."
    );
    if (!confirmed) return;

    setBusy(true);
    setImportStatus("activating");
    setMessage("Klargjør nytt vareregister …");
    try {
      const result = await finalizeStoreCatalogImport(
        client,
        importId,
        summary,
        ({ processedRows, totalRows }) => {
          setMessage(`Aktiverer … ${formatNumber(processedRows)} av ${formatNumber(totalRows)} varer klargjort`);
        }
      );
      setMessage(`✓ Nytt vareregister er aktivert med ${formatNumber(result?.accepted_rows || summary.acceptedRows)} varer.`);
      setImportId("");
      setImportStatus("");
      setSummary(null);
      setSourceName("");
      setFile(null);
      onActivated?.();
    } catch (error) {
      setMessage(`Aktiveringen stoppet: ${error?.message || "Ukjent feil"}. Trykk Fortsett aktivering for å fortsette fra siste ferdige batch.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="catalog-import" open={Boolean(importId)}>
      <summary><RefreshCw size={16} /> Oppdater vareregister</summary>
      <div className="catalog-import-body">
        <p>
          Bruk Ringsides faste ERP-eksport (.txt). Filen leses som Windows-1252 med 18 semikolonseparerte felt.
          Varer med 0 i nettopris eller utsalgspris blir automatisk hoppet over.
        </p>
        {!importId ? (
          <input
            type="file"
            accept=".txt,text/plain"
            disabled={busy}
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setMessage("");
              setSummary(null);
            }}
          />
        ) : null}
        {file ? <small>{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</small> : null}
        {!file && sourceName ? <small>{sourceName} · allerede lastet opp</small> : null}
        <div className="catalog-import-actions">
          {!importId ? (
            <button type="button" className="catalog-primary" disabled={!file || busy} onClick={uploadFile}>
              <Upload size={16} /> {busy ? "Importerer …" : "Kontroller og last opp"}
            </button>
          ) : (
            <>
              <button type="button" className="catalog-primary" disabled={busy || !summary} onClick={activateImport}>
                {busy ? "Aktiverer …" : importStatus === "activating" ? "Fortsett aktivering" : "Aktiver nytt vareregister"}
              </button>
              {importStatus !== "activating" ? (
                <button type="button" className="catalog-secondary" disabled={busy} onClick={() => cancelCurrent()}>
                  Avbryt import
                </button>
              ) : null}
            </>
          )}
        </div>
        {summary ? (
          <div className="catalog-summary">
            <span>Linjer <strong>{formatNumber(summary.totalRows)}</strong></span>
            <span>Gyldige/unike <strong>{formatNumber(summary.acceptedRows)}</strong></span>
            <span>0-pris hoppet over <strong>{formatNumber(summary.skippedZeroPriceRows)}</strong></span>
            <span>Mangler varenr. <strong>{formatNumber(summary.skippedMissingSkuRows)}</strong></span>
            <span>Strukturfeil <strong>{formatNumber(summary.malformedRows)}</strong></span>
          </div>
        ) : null}
        {message ? <p className="catalog-message">{message}</p> : null}
      </div>
    </details>
  );
}

export default function StoreCatalogPanel({ onSelectItem }) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [access, setAccess] = useState(false);
  const [manage, setManage] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [alternatives, setAlternatives] = useState([]);
  const [alternativeSource, setAlternativeSource] = useState(null);
  const [alternativeBusy, setAlternativeBusy] = useState(false);
  const [catalogRevision, setCatalogRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (!client) {
      setLoadingAccess(false);
      return () => { active = false; };
    }
    Promise.all([
      canAccessInternalStoreCatalog(client),
      canManageInternalStoreCatalog(client),
    ])
      .then(([canAccess, canManage]) => {
        if (!active) return;
        setAccess(Boolean(canAccess));
        setManage(Boolean(canManage));
      })
      .catch(() => {
        if (active) {
          setAccess(false);
          setManage(false);
        }
      })
      .finally(() => active && setLoadingAccess(false));
    return () => { active = false; };
  }, [client]);

  useEffect(() => {
    if (!access) return undefined;
    const clean = query.trim();
    if (clean.length < 2) {
      setResults([]);
      setSearchError("");
      return undefined;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setSearchError("");
      searchStoreCatalog(client, clean, 30)
        .then((items) => {
          if (active) setResults(Array.isArray(items) ? items : []);
        })
        .catch((error) => {
          if (active) {
            setResults([]);
            setSearchError(error?.message || "Kunne ikke søke i vareregisteret.");
          }
        })
        .finally(() => active && setSearching(false));
    }, 240);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [access, client, query, catalogRevision]);

  async function openAlternatives(item) {
    setAlternativeSource(item);
    setAlternatives([]);
    setAlternativeBusy(true);
    try {
      const items = await getStoreCatalogAlternatives(client, item.id);
      setAlternatives(Array.isArray(items) ? items : []);
    } catch (error) {
      setSearchError(error?.message || "Kunne ikke hente leverandøralternativer.");
      setAlternativeSource(null);
    } finally {
      setAlternativeBusy(false);
    }
  }

  function chooseItem(item) {
    onSelectItem?.(item);
    setQuery("");
    setResults([]);
    setAlternativeSource(null);
    setAlternatives([]);
  }

  if (loadingAccess || !access || !client) return null;

  return (
    <section className="catalog-panel">
      <style>{`
        .catalog-panel{max-width:1180px;margin:0 auto 14px;padding:14px 18px;border:1px solid #cfdee5;border-radius:18px;background:#f7fbfc;box-shadow:0 4px 18px rgba(9,47,61,.06);font-family:inherit}
        .catalog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.catalog-title{display:flex;align-items:center;gap:9px}.catalog-title strong{font-size:18px}.catalog-title small{display:block;color:#5b6f78;margin-top:2px}
        .catalog-search{position:relative;margin-top:12px}.catalog-search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#5d727a}.catalog-search input{width:100%;box-sizing:border-box;padding:12px 14px 12px 42px;border:1px solid #b9ccd4;border-radius:12px;background:#fff;font:inherit}
        .catalog-results{display:grid;gap:8px;margin-top:10px;max-height:420px;overflow:auto}.catalog-result{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:14px;align-items:center;padding:11px 12px;border:1px solid #d5e2e7;border-radius:12px;background:#fff}.catalog-result.is-primary{border-width:2px}.catalog-result-copy{min-width:0}.catalog-result-copy strong,.catalog-result-copy span,.catalog-result-copy small{display:block}.catalog-result-copy span{color:#40545c;margin-top:3px}.catalog-result-copy small{color:#71838a;margin-top:2px}.catalog-prices{text-align:right;white-space:nowrap}.catalog-prices span,.catalog-prices small{display:block;color:#64777e}.catalog-prices strong{display:block;margin:2px 0}.catalog-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
        .catalog-primary,.catalog-secondary{display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:10px;padding:9px 12px;font-weight:750;cursor:pointer}.catalog-primary{border:1px solid #0a6977;background:#0a6977;color:#fff}.catalog-secondary{border:1px solid #b9ccd4;background:#fff;color:#183a45}.catalog-primary:disabled,.catalog-secondary:disabled{opacity:.5;cursor:not-allowed}
        .catalog-import{margin-top:10px;border-top:1px solid #d9e5e9;padding-top:9px}.catalog-import summary{display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-weight:750;color:#254954}.catalog-import-body{padding:10px 0 2px}.catalog-import-body p{margin:0 0 10px;color:#52676f}.catalog-import-body input{display:block;margin-bottom:6px}.catalog-import-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.catalog-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-top:12px}.catalog-summary span{padding:8px;border-radius:9px;background:#eaf3f6;font-size:12px}.catalog-summary strong{display:block;font-size:15px;margin-top:2px}.catalog-message{margin-top:10px!important;font-weight:700;color:#234650!important}
        .catalog-alt-backdrop{position:fixed;inset:0;z-index:30000;background:rgba(5,20,28,.45);display:grid;place-items:center;padding:18px}.catalog-alt-modal{width:min(900px,100%);max-height:85vh;overflow:auto;background:#fff;border-radius:18px;padding:18px;box-shadow:0 28px 90px rgba(0,0,0,.28)}.catalog-alt-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}.catalog-alt-head h3{margin:0}.catalog-alt-close{border:0;background:#eef4f6;border-radius:50%;width:36px;height:36px;display:grid;place-items:center;cursor:pointer}
        @media(max-width:760px){.catalog-panel{border-radius:0;margin-bottom:10px}.catalog-result{grid-template-columns:1fr}.catalog-prices{text-align:left}.catalog-actions{justify-content:flex-start}.catalog-summary{grid-template-columns:1fr 1fr}}
      `}</style>
      <div className="catalog-head">
        <div className="catalog-title">
          <Database size={21} />
          <div><strong>Internt vareregister</strong><small>Søk på varenavn, varenummer eller GTIN/EAN. Nto-pris er kun intern.</small></div>
        </div>
      </div>
      <div className="catalog-search">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Søk etter vare, varenummer eller GTIN …"
          autoComplete="off"
        />
      </div>
      {searching ? <p className="catalog-message">Søker …</p> : null}
      {searchError ? <p className="catalog-message">{searchError}</p> : null}
      {!searching && query.trim().length >= 2 && !searchError && results.length === 0 ? (
        <p className="catalog-message">Ingen treff. Hvis katalogen er tom må en administrator først importere ERP-filen.</p>
      ) : null}
      {results.length ? (
        <div className="catalog-results">
          {results.map((item) => (
            <CatalogItem key={item.id} item={item} onUse={chooseItem} onAlternatives={openAlternatives} />
          ))}
        </div>
      ) : null}
      {manage ? <ImportPanel client={client} onActivated={() => setCatalogRevision((value) => value + 1)} /> : null}

      {alternativeSource ? (
        <div className="catalog-alt-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAlternativeSource(null)}>
          <section className="catalog-alt-modal" role="dialog" aria-modal="true" aria-label="Velg leverandør">
            <div className="catalog-alt-head">
              <div>
                <h3>Velg leverandør</h3>
                <p>{alternativeSource.description} · GTIN {alternativeSource.gtin}</p>
              </div>
              <button type="button" className="catalog-alt-close" onClick={() => setAlternativeSource(null)} aria-label="Lukk"><X size={19} /></button>
            </div>
            {alternativeBusy ? <p>Henter leverandører …</p> : null}
            {!alternativeBusy && alternatives.length ? (
              <div className="catalog-results">
                {alternatives.map((item, index) => (
                  <CatalogItem key={item.id} item={item} primary={index === 0} onUse={chooseItem} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}
