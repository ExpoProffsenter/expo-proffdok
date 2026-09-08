// Expo ProffDok – FASE 40B
// Isolert UI for komplette Butikktilbud-maler.
// Eksisterende grouped builder endres ikke; panelet arbeider kun via offerForm/updateOfferForm.

import { useEffect, useState } from "react";
import { Layers3, Save, Trash2, X } from "lucide-react";
import {
  isCompleteStoreOfferTemplate,
  loadStoreOfferTemplates,
  materializeStoreOfferTemplate,
  removeStoreOfferTemplate,
  saveCompleteStoreOfferTemplate,
  summarizeStoreOfferTemplate,
} from "../services/salesStoreOfferCompleteTemplates.js";
import { recalculateStoreOption } from "../utils/salesStoreOfferPricing.js";

const TEXT_FIELDS = [
  "title",
  "intro",
  "reservations",
  "included",
  "excluded",
  "customerSupplied",
  "terms",
  "paymentTerms",
  "validityDays",
];

function cleanText(value) {
  return String(value || "").trim();
}

function hasStructuredContent(form = {}) {
  const lines = Array.isArray(form.lines) ? form.lines : [];
  const options = Array.isArray(form.options) ? form.options : [];
  return (
    lines.some(
      (line) =>
        !line?.__storeOfferMeta &&
        !line?.__companyMeta &&
        !line?.__offerTermsMeta &&
        (cleanText(line?.description) ||
          cleanText(line?.storeTextTitle) ||
          cleanText(line?.storeUnitPriceInclVat) ||
          cleanText(line?.amount))
    ) || options.length > 0
  );
}

function currentMetaLines(form = {}) {
  return (Array.isArray(form.lines) ? form.lines : []).filter(
    (line) => line?.__storeOfferMeta
  );
}

function formatTemplateLabel(template = {}) {
  return isCompleteStoreOfferTemplate(template)
    ? template.name
    : `${template.name} · eldre tekstmal`;
}

export default function StoreOfferCompleteTemplatePanel({
  requestId = "",
  offerForm = {},
  updateOfferForm,
}) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh(nextSelectedId = "") {
    const items = await loadStoreOfferTemplates();
    setTemplates(items);
    setSelectedTemplateId(nextSelectedId);
  }

  useEffect(() => {
    let active = true;
    loadStoreOfferTemplates()
      .then((items) => active && setTemplates(items))
      .catch(() => active && setTemplates([]));
    return () => {
      active = false;
    };
  }, [requestId]);

  async function saveTemplate() {
    setBusy(true);
    setMessage("");
    try {
      const summary = summarizeStoreOfferTemplate(offerForm);
      const saved = await saveCompleteStoreOfferTemplate(templateName, offerForm);
      await refresh(saved?.id || "");
      setTemplateName("");
      setMessage(
        `✓ Komplett mal lagret: ${summary.sections} avsnitt, ${summary.posts} poster, ${summary.installations} montering og ${summary.options} opsjoner.`
      );
    } catch (error) {
      setMessage(error?.message || "Malen kunne ikke lagres.");
    } finally {
      setBusy(false);
    }
  }

  async function applyTemplate() {
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template) return;

    if (
      isCompleteStoreOfferTemplate(template) &&
      hasStructuredContent(offerForm) &&
      typeof window !== "undefined" &&
      !window.confirm(
        `Malen «${template.name}» erstatter eksisterende avsnitt, poster, montering og opsjoner i denne kladden. Fortsette?`
      )
    ) {
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const materialized = await materializeStoreOfferTemplate(template);

      TEXT_FIELDS.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(materialized.fields || {}, field)) {
          updateOfferForm?.(field, materialized.fields[field] ?? "");
        }
      });

      if (materialized.mode === "legacy-text") {
        setMessage(
          `✓ Den eldre tekstmalen «${template.name}» er brukt. Eksisterende poster og priser er beholdt.`
        );
        return;
      }

      const nextLines = [
        ...(Array.isArray(materialized.lines) ? materialized.lines : []),
        ...currentMetaLines(offerForm),
      ];
      const nextOptions = (Array.isArray(materialized.options)
        ? materialized.options
        : []
      ).map((option) =>
        option?.storeTemplateCatalogMissing
          ? { ...option, amount: "" }
          : recalculateStoreOption(option, nextLines)
      );

      updateOfferForm?.("lines", nextLines);
      updateOfferForm?.("options", nextOptions);

      const priceMessage = materialized.refreshedCatalogItems
        ? `${materialized.refreshedCatalogItems} katalogpris${
            materialized.refreshedCatalogItems === 1 ? "" : "er"
          } hentet på nytt fra vareregisteret.`
        : "Ingen katalogpriser måtte oppdateres.";
      const missingMessage = materialized.missingCatalogItems
        ? ` ${materialized.missingCatalogItems} katalogvare${
            materialized.missingCatalogItems === 1 ? "" : "r"
          } finnes ikke lenger i aktivt vareregister og må velges/prissettes på nytt.`
        : "";

      setMessage(`✓ Malen «${template.name}» er brukt. ${priceMessage}${missingMessage}`);
    } catch (error) {
      setMessage(error?.message || "Malen kunne ikke brukes.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteTemplate() {
    if (!selectedTemplateId) return;
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (
      template &&
      typeof window !== "undefined" &&
      !window.confirm(`Slette malen «${template.name}»?`)
    ) {
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await removeStoreOfferTemplate(selectedTemplateId);
      await refresh("");
      setMessage("Malen er slettet.");
    } catch (error) {
      setMessage(error?.message || "Malen kunne ikke slettes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{`
        .store-grouped-builder .store-template-grid,.store-grouped-builder .store-template-message{display:none!important}
        .store-complete-template-trigger{position:fixed;right:18px;bottom:84px;z-index:22000;display:flex;align-items:center;gap:8px;min-height:44px;padding:10px 14px;border:1px solid #8fcfd4;border-radius:999px;background:#fff;color:#0b737b;font:inherit;font-weight:900;box-shadow:0 12px 30px rgba(15,118,128,.18);cursor:pointer}
        .store-complete-template-backdrop{position:fixed;inset:0;z-index:26000;display:grid;place-items:center;padding:18px;background:rgba(15,23,42,.46)}
        .store-complete-template-panel{width:min(720px,100%);max-height:min(760px,92vh);overflow:auto;border:1px solid #c7dce2;border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.26);padding:20px}
        .store-complete-template-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}.store-complete-template-head h2{margin:0 0 4px}.store-complete-template-head p{margin:0;color:#60727a}.store-complete-template-close{display:grid;place-items:center;width:38px;height:38px;border:1px solid #d6e4e8;border-radius:50%;background:#fff;cursor:pointer}
        .store-complete-template-grid{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}.store-complete-template-actions{display:flex;gap:8px;flex-wrap:wrap}.store-complete-template-actions button{min-height:42px}.store-complete-template-note{margin:14px 0 0;padding:11px 13px;border-radius:12px;background:#eef8fa;color:#315965;font-weight:650;line-height:1.45}.store-complete-template-info{margin-top:16px;padding:12px 14px;border-left:4px solid #18aeb8;background:#f5fbfc;color:#526a73;line-height:1.5}.store-complete-template-info strong{color:#17343d}
        @media(max-width:620px){.store-complete-template-trigger{right:10px;bottom:74px}.store-complete-template-grid{grid-template-columns:1fr}.store-complete-template-actions button{flex:1}.store-complete-template-panel{padding:16px}.store-complete-template-head{align-items:center}}
      `}</style>

      <button
        type="button"
        className="store-complete-template-trigger"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
        title="Lagre eller bruk komplett Butikktilbud-mal"
      >
        <Layers3 size={18} /> Tilbudsmaler
      </button>

      {open ? (
        <div
          className="store-complete-template-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className="store-complete-template-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Tilbudsmaler"
          >
            <div className="store-complete-template-head">
              <div>
                <h2>Komplette Butikktilbud-maler</h2>
                <p>
                  Lagre avsnitt, poster, montering, opsjoner og kundetekster som firmamal.
                </p>
              </div>
              <button
                type="button"
                className="store-complete-template-close"
                onClick={() => setOpen(false)}
                aria-label="Lukk"
              >
                <X size={19} />
              </button>
            </div>

            <div className="store-complete-template-grid">
              <label className="sales-field">
                <span>Navn på ny mal</span>
                <input
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  placeholder="F.eks. Varmepumpe komplett"
                />
              </label>
              <button
                type="button"
                className="sales-secondary-button"
                disabled={!templateName.trim() || busy}
                onClick={saveTemplate}
              >
                <Save size={17} /> Lagre komplett mal
              </button>
            </div>

            {templates.length ? (
              <div className="store-complete-template-grid" style={{ marginTop: 14 }}>
                <label className="sales-field">
                  <span>Bruk eksisterende mal</span>
                  <select
                    value={selectedTemplateId}
                    onChange={(event) => setSelectedTemplateId(event.target.value)}
                  >
                    <option value="">Velg mal</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {formatTemplateLabel(template)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="store-complete-template-actions">
                  <button
                    type="button"
                    className="sales-primary-button"
                    disabled={!selectedTemplateId || busy}
                    onClick={applyTemplate}
                  >
                    Bruk mal
                  </button>
                  <button
                    type="button"
                    className="sales-secondary-button"
                    disabled={!selectedTemplateId || busy}
                    onClick={deleteTemplate}
                  >
                    <Trash2 size={16} /> Slett
                  </button>
                </div>
              </div>
            ) : null}

            {message ? <div className="store-complete-template-note">{message}</div> : null}

            <div className="store-complete-template-info">
              <strong>Prisregel:</strong> Katalogvarer henter gjeldende kundepris fra
              vareregisteret når malen brukes. Manuelle poster beholder prisen som ble
              lagret i malen. Avsender, saksbehandler og automatisk oppfølgingsplan
              beholdes fra den aktuelle saken. Bilder og vedlegg lagres ikke i malen.
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
