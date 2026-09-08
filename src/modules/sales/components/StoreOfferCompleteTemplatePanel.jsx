// Expo ProffDok – FASE 40B
// Komplette Butikktilbud-maler med samme arbeidsmønster som ordinært Våtromstilbud:
// «Bruk firmamal» øverst i tilbudsskjemaet og «Lagre som mal» i nederste handlingslinje.
// Eksisterende grouped builder endres ikke; UI monteres inn via to finite portal-hosts.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardList, Save, Trash2 } from "lucide-react";
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
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionNotice, setActionNotice] = useState(null);
  const [topHost, setTopHost] = useState(null);
  const [saveHost, setSaveHost] = useState(null);

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

  useEffect(() => {
    if (!actionNotice || typeof window === "undefined") return undefined;
    const timer = window.setTimeout(() => setActionNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    let disposed = false;
    let createdTopHost = null;
    let createdSaveHost = null;

    const install = () => {
      if (disposed) return;

      const form = document.querySelector(
        ".store-grouped-builder .sales-form-panel"
      );
      if (form && !createdTopHost) {
        form.querySelector("[data-store-complete-template-top-host='1']")?.remove();
        createdTopHost = document.createElement("div");
        createdTopHost.dataset.storeCompleteTemplateTopHost = "1";
        form.insertBefore(createdTopHost, form.firstChild);
        setTopHost(createdTopHost);
      }

      const summaryActions = document.querySelector(
        ".store-grouped-builder .store-summary-actions"
      );
      if (summaryActions && !createdSaveHost) {
        summaryActions
          .querySelector("[data-store-complete-template-save-host='1']")
          ?.remove();
        createdSaveHost = document.createElement("span");
        createdSaveHost.dataset.storeCompleteTemplateSaveHost = "1";
        createdSaveHost.className = "store-complete-template-save-host";

        const saveOfferButton = summaryActions.querySelector(
          '[data-sales-save-offer-button="true"]'
        );
        if (saveOfferButton) {
          summaryActions.insertBefore(createdSaveHost, saveOfferButton);
        } else {
          summaryActions.appendChild(createdSaveHost);
        }
        setSaveHost(createdSaveHost);
      }
    };

    const timers = [0, 80, 260].map((delay) =>
      window.setTimeout(install, delay)
    );

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      createdTopHost?.remove();
      createdSaveHost?.remove();
    };
  }, [requestId]);

  function showActionNotice(type, text) {
    setActionNotice({ type, text });
  }

  async function saveTemplate() {
    if (busy || typeof window === "undefined") return;

    const suggestedName = cleanText(offerForm.title) || "Butikktilbud-mal";
    const enteredName = window.prompt(
      "Gi tilbudsmalen et navn:",
      suggestedName
    );
    if (enteredName === null) return;

    const templateName = cleanText(enteredName);
    if (!templateName) {
      window.alert("Malen må ha et navn.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const summary = summarizeStoreOfferTemplate(offerForm);
      const saved = await saveCompleteStoreOfferTemplate(templateName, offerForm);
      await refresh(saved?.id || "");
      const successText = `✓ Komplett mal lagret: ${summary.sections} avsnitt, ${summary.posts} poster, ${summary.installations} montering og ${summary.options} opsjoner.`;
      setMessage(successText);
      showActionNotice("success", successText);
    } catch (error) {
      const errorText = error?.message || "Malen kunne ikke lagres.";
      setMessage(errorText);
      showActionNotice("error", errorText);
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
        const successText = `✓ Den eldre tekstmalen «${template.name}» er brukt. Eksisterende poster og priser er beholdt.`;
        setMessage(successText);
        showActionNotice("success", successText);
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
      const successText = `✓ Malen «${template.name}» er brukt. ${priceMessage}${missingMessage}`;

      setMessage(successText);
      showActionNotice(
        materialized.missingCatalogItems ? "warning" : "success",
        successText
      );
    } catch (error) {
      const errorText = error?.message || "Malen kunne ikke brukes.";
      setMessage(errorText);
      showActionNotice("error", errorText);
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

  const templateTools = (
    <div
      className="sales-form-preview store-complete-template-inline"
      data-store-complete-template-tools="1"
      style={{ marginBottom: 0 }}
    >
      <p className="sales-eyebrow" style={{ marginBottom: 4 }}>
        Tilbudsmaler
      </p>
      <h2 style={{ margin: "0 0 6px" }}>Bruk firmamal</h2>
      <p className="sales-subtitle" style={{ margin: 0 }}>
        Komplette Butikktilbud-maler kopierer kundetekster, avsnitt, poster,
        montering og opsjoner inn i denne redigerbare kladden. Kunde og adresse
        beholdes på saken.
      </p>

      {templates.length ? (
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <label className="sales-field">
            <span>Velg tilbudsmal</span>
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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="sales-secondary-button"
              type="button"
              onClick={applyTemplate}
              disabled={!selectedTemplateId || busy}
            >
              <ClipboardList size={18} /> Bruk valgt mal
            </button>
            <button
              className="sales-secondary-button"
              type="button"
              onClick={deleteTemplate}
              disabled={!selectedTemplateId || busy}
            >
              <Trash2 size={18} /> {busy ? "Arbeider …" : "Slett valgt mal"}
            </button>
          </div>
        </div>
      ) : (
        <p className="sales-subtitle" style={{ marginTop: 14 }}>
          Firmaet har ingen lagrede Butikktilbud-maler ennå. Bygg tilbudet og
          bruk «Lagre som mal» nederst på siden.
        </p>
      )}

      {message ? (
        <p className="store-complete-template-note" style={{ marginBottom: 0 }}>
          {message}
        </p>
      ) : null}

      <p className="sales-subtitle" style={{ margin: "12px 0 0" }}>
        Katalogvarer henter gjeldende katalogpris når malen brukes. Manuelle poster beholder prisen som ble lagret i malen. Bilder og vedlegg lagres ikke i malen.
      </p>
    </div>
  );

  const saveButton = (
    <button
      type="button"
      className="sales-secondary-button"
      onClick={saveTemplate}
      disabled={busy}
    >
      <Save size={18} /> {busy ? "Lagrer mal …" : "Lagre som mal"}
    </button>
  );

  const actionNoticeElement = actionNotice ? (
    <div
      data-store-template-action-notice="1"
      role={actionNotice.type === "error" ? "alert" : "status"}
      aria-live="polite"
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 30000,
        width: "min(560px, calc(100vw - 28px))",
        maxHeight: "calc(100vh - 28px)",
        overflow: "auto",
        padding: "14px 16px",
        borderRadius: 16,
        border:
          actionNotice.type === "error"
            ? "1px solid #e8aaaa"
            : actionNotice.type === "warning"
              ? "1px solid #e6c76d"
              : "1px solid #8be4e8",
        background:
          actionNotice.type === "error"
            ? "#fff3f3"
            : actionNotice.type === "warning"
              ? "#fff8dc"
              : "#e9fafb",
        color: "#18343a",
        boxShadow: "0 16px 44px rgba(15,23,42,.2)",
        fontWeight: 800,
        lineHeight: 1.45,
      }}
    >
      {actionNotice.text}
    </div>
  ) : null;

  return (
    <>
      <style>{`
        .store-grouped-builder .store-template-grid,.store-grouped-builder .store-template-message{display:none!important}
        .store-complete-template-save-host{display:contents}
        .store-complete-template-note{margin-top:12px;padding:10px 12px;border-radius:10px;background:#eef8fa;color:#315965;font-weight:650;line-height:1.45}
        @media(min-width:901px){.store-grouped-builder .store-summary-actions{flex-wrap:nowrap}.store-grouped-builder .store-summary-actions button{white-space:nowrap}}
      `}</style>
      {topHost ? createPortal(templateTools, topHost) : null}
      {saveHost ? createPortal(saveButton, saveHost) : null}
      {actionNoticeElement && typeof document !== "undefined"
        ? createPortal(actionNoticeElement, document.body)
        : null}
    </>
  );
}
