// Expo ProffDok – FASE 37D1
// Egen varebygger for Ringside Butikktilbud. UI arbeider i priser inkl. mva.,
// mens eksisterende Sales-motor fortsatt lagrer/publiserer canonical beløp eks. mva.
// Publisering, kundelenke, PDF, aksept og e-post gjenbrukes uendret.

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  FileText,
  GripVertical,
  ImagePlus,
  Link2,
  PackagePlus,
  Paperclip,
  Plus,
  Save,
  Trash2,
  Wrench,
} from "lucide-react";
import { formatNok } from "../utils/salesUtils.js";

const VAT_FACTOR = 1.25;
const PRODUCT_POST = { id: "butikk-varer", title: "Varer" };
const INSTALLATION_POST = { id: "butikk-montering", title: "Montering" };

function parseNumber(value, fallback = 0) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/,-$/, "")
    .replace(/\.-$/, "")
    .replace(",", ".");
  if (!normalized) return fallback;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function storedNumber(value) {
  if (!Number.isFinite(value)) return "";
  return String(Number(value.toFixed(2)));
}

function safeDiscount(value) {
  return Math.min(100, Math.max(0, parseNumber(value, 0)));
}

function quantityOf(item) {
  const quantity = parseNumber(item?.quantity, 1);
  return quantity > 0 ? quantity : 1;
}

function grossUnitPriceOf(item) {
  const storedGross = parseNumber(item?.storeUnitPriceInclVat, NaN);
  if (Number.isFinite(storedGross)) return storedGross;

  const discountedNet = parseNumber(item?.amount, 0);
  const discount = safeDiscount(item?.storeDiscountPercent);
  const discountFactor = 1 - discount / 100;
  if (discountFactor <= 0) return 0;
  return (discountedNet * VAT_FACTOR) / discountFactor;
}

function grossTotalOf(item) {
  const grossUnit = grossUnitPriceOf(item);
  const discount = safeDiscount(item?.storeDiscountPercent);
  return grossUnit * quantityOf(item) * (1 - discount / 100);
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createStoreLine(post, { installation = false } = {}) {
  return {
    id: createId("line"),
    mainPostId: post.id,
    mainPostTitle: post.title,
    lineType: "work",
    description: "",
    nobbNumber: "",
    supplierProductNumber: "",
    internalProductNumber: "",
    quantity: "1",
    unit: installation ? "stk" : "stk",
    storeUnitPriceInclVat: "",
    storeDiscountPercent: "",
    amount: "",
    productUrl: "",
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

function createStoreOption() {
  return {
    id: createId("option"),
    mainPostId: PRODUCT_POST.id,
    mainPostTitle: PRODUCT_POST.title,
    optionType: "addition",
    replacementLineId: "",
    replacementLineDescription: "",
    title: "",
    description: "",
    nobbNumber: "",
    supplierProductNumber: "",
    internalProductNumber: "",
    quantity: "1",
    unit: "stk",
    storeUnitPriceInclVat: "",
    storeDiscountPercent: "",
    amount: "",
    productUrl: "",
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

function moveItem(items, fromId, toId) {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function PriceFields({ item, kind, onPatch, alternative = false }) {
  const grossUnit = item?.storeUnitPriceInclVat ?? "";
  const discount = item?.storeDiscountPercent ?? "";

  return (
    <div className="store-price-grid">
      <label className="sales-field">
        <span>Antall</span>
        <input
          value={item.quantity ?? "1"}
          inputMode="decimal"
          onChange={(event) => onPatch({ quantity: event.target.value })}
          placeholder="1"
        />
      </label>
      <label className="sales-field">
        <span>Enhet</span>
        <input
          value={item.unit || ""}
          onChange={(event) => onPatch({ unit: event.target.value })}
          placeholder="stk"
        />
      </label>
      <label className="sales-field">
        <span>{alternative ? "Prisendring inkl. mva." : "Pris pr. enhet inkl. mva."}</span>
        <input
          value={grossUnit}
          inputMode="decimal"
          onChange={(event) => onPatch({ storeUnitPriceInclVat: event.target.value })}
          placeholder="0"
        />
      </label>
      <label className="sales-field">
        <span>Rabatt %</span>
        <input
          value={discount}
          inputMode="decimal"
          onChange={(event) => onPatch({ storeDiscountPercent: event.target.value })}
          placeholder="0"
        />
      </label>
      <div className="store-line-total">
        <span>{alternative ? "Prisendring inkl. mva." : "Linjesum inkl. mva."}</span>
        <strong>{formatNok(grossTotalOf(item))}</strong>
      </div>
    </div>
  );
}

function DropZone({ item, kind, onFiles, onRemoveImage, onRemoveAttachment }) {
  const inputRef = useRef(null);

  return (
    <div
      className="store-drop-zone"
      onDragOver={(event) => {
        if (event.dataTransfer?.types?.includes("Files")) event.preventDefault();
      }}
      onDrop={(event) => {
        if (!event.dataTransfer?.files?.length) return;
        event.preventDefault();
        event.stopPropagation();
        onFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        multiple
        hidden
        onChange={(event) => {
          onFiles(Array.from(event.target.files || []));
          event.target.value = "";
        }}
      />
      <button
        type="button"
        className="sales-secondary-button"
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip size={16} />
        Dra inn eller velg bilde/PDF
      </button>
      <span className="store-drop-help">Slipp filer direkte på dette feltet.</span>

      {item.imageDataUrl ? (
        <div className="store-file-chip">
          <img src={item.imageDataUrl} alt={item.imageName || "Produktbilde"} />
          <span>{item.imageName || "Produktbilde"}</span>
          <button type="button" onClick={onRemoveImage} aria-label="Fjern bilde">×</button>
        </div>
      ) : null}

      {item.attachmentFile?.url ? (
        <div className="store-file-chip store-pdf-chip">
          <FileText size={18} />
          <a href={item.attachmentFile.url} target="_blank" rel="noreferrer">
            {item.attachmentFile.name || "PDF-vedlegg"}
          </a>
          <button type="button" onClick={onRemoveAttachment} aria-label="Fjern PDF">×</button>
        </div>
      ) : null}
    </div>
  );
}

export default function SalesStoreOfferBuilder(props) {
  const {
    selectedRequest,
    offerForm,
    offerDraftSaveStatus,
    onBack,
    handleSaveOffer,
    updateOfferForm,
    handleOfferLineFile,
    removeOfferLineImage,
    removeOfferLineAttachment,
    handleOfferOptionFile,
    removeOfferOptionImage,
    removeOfferOptionAttachment,
  } = props;

  const [dragged, setDragged] = useState(null);
  const initializedRequestRef = useRef("");
  const requestId = String(selectedRequest?.id || "");

  useEffect(() => {
    if (!requestId || initializedRequestRef.current === requestId) return;
    initializedRequestRef.current = requestId;

    const legacyTitle = String(offerForm?.title || "");
    const legacyIntro = String(offerForm?.intro || "");

    if (!offerForm?.lines?.length && !offerForm?.options?.length) {
      if (legacyTitle === "Tilbud – Butikktilbud" || legacyTitle === "Tilbud - Butikktilbud") {
        updateOfferForm("title", "");
      }
      if (/følgende arbeider/i.test(legacyIntro)) {
        updateOfferForm("intro", "");
      }
    }
  }, [requestId]); // eslint-disable-line react-hooks/exhaustive-deps

  const lines = Array.isArray(offerForm?.lines) ? offerForm.lines : [];
  const options = Array.isArray(offerForm?.options) ? offerForm.options : [];
  const productLines = lines.filter((line) => line.mainPostId === PRODUCT_POST.id);
  const installationLines = lines.filter((line) => line.mainPostId === INSTALLATION_POST.id);
  const otherLines = lines.filter(
    (line) => ![PRODUCT_POST.id, INSTALLATION_POST.id].includes(line.mainPostId)
  );

  const customerAddress = [
    selectedRequest?.address,
    [selectedRequest?.postnr, selectedRequest?.city].filter(Boolean).join(" "),
  ].filter(Boolean).join(", ");

  const baseGrossTotal = [...productLines, ...installationLines].reduce(
    (sum, item) => sum + grossTotalOf(item),
    0
  );

  function patchLine(id, patch) {
    const nextLines = lines.map((line) => {
      if (line.id !== id) return line;
      const next = { ...line, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "supplierProductNumber")) {
        next.internalProductNumber = patch.supplierProductNumber;
      }
      if (
        Object.prototype.hasOwnProperty.call(patch, "storeUnitPriceInclVat") ||
        Object.prototype.hasOwnProperty.call(patch, "storeDiscountPercent")
      ) {
        const gross = parseNumber(next.storeUnitPriceInclVat, 0);
        const discount = safeDiscount(next.storeDiscountPercent);
        next.amount = storedNumber((gross * (1 - discount / 100)) / VAT_FACTOR);
      }
      return next;
    });
    updateOfferForm("lines", nextLines);
  }

  function patchOption(id, patch) {
    const nextOptions = options.map((option) => {
      if (option.id !== id) return option;
      const next = { ...option, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "supplierProductNumber")) {
        next.internalProductNumber = patch.supplierProductNumber;
      }
      if (
        Object.prototype.hasOwnProperty.call(patch, "storeUnitPriceInclVat") ||
        Object.prototype.hasOwnProperty.call(patch, "storeDiscountPercent")
      ) {
        const gross = parseNumber(next.storeUnitPriceInclVat, 0);
        const discount = safeDiscount(next.storeDiscountPercent);
        next.amount = storedNumber((gross * (1 - discount / 100)) / VAT_FACTOR);
      }
      if (patch.optionType === "addition") {
        next.replacementLineId = "";
        next.replacementLineDescription = "";
      }
      return next;
    });
    updateOfferForm("options", nextOptions);
  }

  function addProduct() {
    updateOfferForm("lines", [...productLines, createStoreLine(PRODUCT_POST), ...installationLines, ...otherLines]);
  }

  function addInstallation() {
    updateOfferForm("lines", [...productLines, ...installationLines, createStoreLine(INSTALLATION_POST, { installation: true }), ...otherLines]);
  }

  function addOption() {
    updateOfferForm("options", [...options, createStoreOption()]);
  }

  function removeLine(id) {
    updateOfferForm("lines", lines.filter((line) => line.id !== id));
  }

  function removeOption(id) {
    updateOfferForm("options", options.filter((option) => option.id !== id));
  }

  function reorderLines(section, fromId, toId) {
    if (section === "product") {
      updateOfferForm("lines", [
        ...moveItem(productLines, fromId, toId),
        ...installationLines,
        ...otherLines,
      ]);
      return;
    }
    updateOfferForm("lines", [
      ...productLines,
      ...moveItem(installationLines, fromId, toId),
      ...otherLines,
    ]);
  }

  function reorderOptions(fromId, toId) {
    updateOfferForm("options", moveItem(options, fromId, toId));
  }

  async function sendFiles(kind, id, files) {
    for (const file of files) {
      const syntheticEvent = { target: { files: [file], value: "" } };
      if (kind === "line") {
        await handleOfferLineFile?.(id, syntheticEvent);
      } else {
        await handleOfferOptionFile?.(id, syntheticEvent);
      }
    }
  }

  function draggableProps(kind, id, section = "") {
    return {
      draggable: true,
      onDragStart: (event) => {
        if (event.target?.closest?.("input, textarea, select, button, a")) {
          event.preventDefault();
          return;
        }
        setDragged({ kind, id, section });
        event.dataTransfer.effectAllowed = "move";
      },
      onDragOver: (event) => {
        if (!dragged || dragged.kind !== kind) return;
        if (kind === "line" && dragged.section !== section) return;
        event.preventDefault();
      },
      onDrop: (event) => {
        if (event.dataTransfer?.files?.length) return;
        if (!dragged || dragged.kind !== kind || dragged.id === id) return;
        if (kind === "line" && dragged.section !== section) return;
        event.preventDefault();
        if (kind === "option") reorderOptions(dragged.id, id);
        else reorderLines(section, dragged.id, id);
        setDragged(null);
      },
      onDragEnd: () => setDragged(null),
    };
  }

  function ProductCard({ item, index }) {
    return (
      <article className="store-item-card" {...draggableProps("line", item.id, "product")}>
        <div className="store-item-heading">
          <div className="store-drag-handle"><GripVertical size={18} /></div>
          <strong>Vare {index + 1}</strong>
          <button type="button" className="store-icon-button" onClick={() => removeLine(item.id)} aria-label="Slett vare">
            <Trash2 size={17} />
          </button>
        </div>

        <div className="store-product-grid">
          <label className="sales-field store-product-name">
            <span>Varenavn *</span>
            <input
              value={item.description || ""}
              onChange={(event) => patchLine(item.id, { description: event.target.value })}
              placeholder="F.eks. Svedbergs Skapa servantskap 80 cm"
            />
          </label>
          <label className="sales-field">
            <span>NOBB-nr.</span>
            <input
              value={item.nobbNumber || ""}
              onChange={(event) => patchLine(item.id, { nobbNumber: event.target.value })}
              placeholder="NOBB-nummer"
              autoComplete="off"
            />
          </label>
          <label className="sales-field">
            <span>Varenummer</span>
            <input
              value={item.supplierProductNumber || item.internalProductNumber || ""}
              onChange={(event) => patchLine(item.id, { supplierProductNumber: event.target.value })}
              placeholder="Leverandørens varenummer"
              autoComplete="off"
            />
          </label>
          <label className="sales-field store-product-link">
            <span>Produktlink</span>
            <div className="store-link-field">
              <input
                value={item.productUrl || ""}
                onChange={(event) => patchLine(item.id, { productUrl: event.target.value })}
                placeholder="NOBB- eller leverandørens produktside"
                inputMode="url"
              />
              {item.productUrl ? (
                <a href={item.productUrl} target="_blank" rel="noreferrer" title="Åpne produktlink"><Link2 size={17} /></a>
              ) : null}
            </div>
          </label>
        </div>

        <PriceFields item={item} kind="line" onPatch={(patch) => patchLine(item.id, patch)} />

        <DropZone
          item={item}
          kind="line"
          onFiles={(files) => sendFiles("line", item.id, files)}
          onRemoveImage={() => removeOfferLineImage?.(item.id)}
          onRemoveAttachment={() => removeOfferLineAttachment?.(item.id)}
        />
      </article>
    );
  }

  function InstallationCard({ item, index }) {
    return (
      <article className="store-item-card store-installation-card" {...draggableProps("line", item.id, "installation")}>
        <div className="store-item-heading">
          <div className="store-drag-handle"><GripVertical size={18} /></div>
          <strong>Montering {index + 1}</strong>
          <button type="button" className="store-icon-button" onClick={() => removeLine(item.id)} aria-label="Slett montering">
            <Trash2 size={17} />
          </button>
        </div>
        <label className="sales-field">
          <span>Beskrivelse *</span>
          <input
            value={item.description || ""}
            onChange={(event) => patchLine(item.id, { description: event.target.value })}
            placeholder="F.eks. Montering av ovennevnte baderomsmøbel"
          />
        </label>
        <PriceFields item={item} kind="line" onPatch={(patch) => patchLine(item.id, patch)} />
      </article>
    );
  }

  function OptionCard({ option, index }) {
    const alternative = option.optionType === "alternative";
    return (
      <article className="store-item-card store-option-card" {...draggableProps("option", option.id)}>
        <div className="store-item-heading">
          <div className="store-drag-handle"><GripVertical size={18} /></div>
          <strong>Opsjon {index + 1}</strong>
          <button type="button" className="store-icon-button" onClick={() => removeOption(option.id)} aria-label="Slett opsjon">
            <Trash2 size={17} />
          </button>
        </div>

        <div className="store-product-grid">
          <label className="sales-field">
            <span>Type opsjon</span>
            <select value={option.optionType || "addition"} onChange={(event) => patchOption(option.id, { optionType: event.target.value })}>
              <option value="addition">Tillegg / oppgradering</option>
              <option value="alternative">Alternativ som erstatter vare</option>
            </select>
          </label>
          {alternative ? (
            <label className="sales-field">
              <span>Erstatter vare *</span>
              <select value={option.replacementLineId || ""} onChange={(event) => patchOption(option.id, { replacementLineId: event.target.value })}>
                <option value="">Velg vare</option>
                {productLines.map((line) => (
                  <option key={line.id} value={line.id}>{line.description || "Vare uten navn"}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="sales-field store-product-name">
            <span>Varenavn *</span>
            <input value={option.title || ""} onChange={(event) => patchOption(option.id, { title: event.target.value })} placeholder="Navn på opsjonsvaren" />
          </label>
          <label className="sales-field">
            <span>NOBB-nr.</span>
            <input value={option.nobbNumber || ""} onChange={(event) => patchOption(option.id, { nobbNumber: event.target.value })} placeholder="NOBB-nummer" />
          </label>
          <label className="sales-field">
            <span>Varenummer</span>
            <input value={option.supplierProductNumber || option.internalProductNumber || ""} onChange={(event) => patchOption(option.id, { supplierProductNumber: event.target.value })} placeholder="Leverandørens varenummer" />
          </label>
          <label className="sales-field store-product-link">
            <span>Produktlink</span>
            <div className="store-link-field">
              <input value={option.productUrl || ""} onChange={(event) => patchOption(option.id, { productUrl: event.target.value })} placeholder="NOBB- eller leverandørens produktside" />
              {option.productUrl ? <a href={option.productUrl} target="_blank" rel="noreferrer"><Link2 size={17} /></a> : null}
            </div>
          </label>
        </div>

        {alternative ? (
          <p className="store-info-note">Alternativ bruker samme logikk som hovedtilbudet: beløpet er prisendringen mot varen som erstattes.</p>
        ) : null}

        <PriceFields item={option} kind="option" alternative={alternative} onPatch={(patch) => patchOption(option.id, patch)} />

        <DropZone
          item={option}
          kind="option"
          onFiles={(files) => sendFiles("option", option.id, files)}
          onRemoveImage={() => removeOfferOptionImage?.(option.id)}
          onRemoveAttachment={() => removeOfferOptionAttachment?.(option.id)}
        />
      </article>
    );
  }

  return (
    <div className="sales-app store-offer-builder-app">
      <style>{`
        .store-offer-builder-app .sales-shell { max-width: 1180px; }
        .store-offer-builder-app .sales-form-panel { display: grid; gap: 18px; }
        .store-builder-section { border: 1px solid #d7e4ea; border-radius: 18px; padding: 18px; background: #fff; }
        .store-section-head { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:14px; }
        .store-section-head h2 { margin:0 0 4px; font-size:22px; }
        .store-section-head p { margin:0; color:#60727a; }
        .store-item-list { display:grid; gap:14px; }
        .store-item-card { border:1px solid #d9e5ea; border-radius:16px; padding:16px; background:#fbfdfe; }
        .store-option-card { background:#f8fbff; }
        .store-installation-card { background:#fbfaf7; }
        .store-item-heading { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:8px; margin-bottom:14px; }
        .store-drag-handle { display:grid; place-items:center; color:#70848d; cursor:grab; }
        .store-icon-button { border:0; background:transparent; padding:6px; cursor:pointer; color:#8d3e3e; }
        .store-product-grid { display:grid; grid-template-columns:1.6fr .8fr .9fr 1.5fr; gap:12px; }
        .store-product-name { grid-column:auto; }
        .store-link-field { display:grid; grid-template-columns:1fr auto; align-items:center; gap:8px; }
        .store-link-field a { display:grid; place-items:center; width:38px; height:38px; border:1px solid #cbdbe2; border-radius:10px; }
        .store-price-grid { display:grid; grid-template-columns:.7fr .7fr 1.25fr .8fr 1.2fr; gap:12px; align-items:end; margin-top:12px; }
        .store-line-total { min-height:70px; display:flex; flex-direction:column; justify-content:center; align-items:flex-end; padding:10px 12px; border-radius:12px; background:#eef8fa; }
        .store-line-total span { font-size:12px; color:#5e737b; font-weight:700; }
        .store-line-total strong { font-size:19px; }
        .store-drop-zone { margin-top:14px; padding:12px; border:1px dashed #9fc3cc; border-radius:13px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; background:#fff; }
        .store-drop-help { color:#65767d; font-size:13px; }
        .store-file-chip { display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:10px; background:#f0f7f8; }
        .store-file-chip img { width:48px; height:48px; border-radius:8px; object-fit:cover; }
        .store-file-chip button { border:0; background:transparent; font-size:20px; cursor:pointer; }
        .store-info-note { margin:10px 0 0; padding:10px 12px; border-radius:10px; background:#fff7e8; color:#6e5524; }
        .store-empty { padding:18px; border:1px dashed #c5d7dd; border-radius:14px; color:#61737a; text-align:center; }
        .store-summary { display:flex; justify-content:space-between; gap:16px; align-items:center; padding:16px 18px; border-radius:16px; background:#0f172a; color:#fff; }
        .store-summary strong { font-size:24px; }
        .store-terms-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media (max-width: 900px) {
          .store-product-grid, .store-price-grid, .store-terms-grid { grid-template-columns:1fr 1fr; }
          .store-product-link, .store-product-name { grid-column:1 / -1; }
        }
        @media (max-width: 620px) {
          .store-product-grid, .store-price-grid, .store-terms-grid { grid-template-columns:1fr; }
          .store-section-head, .store-summary { align-items:stretch; flex-direction:column; }
          .store-line-total { align-items:flex-start; }
        }
      `}</style>

      <div className="sales-shell">
        <header className="sales-header">
          <button className="sales-back-button" type="button" onClick={onBack}>
            <ArrowLeft size={18} /> Tilbake
          </button>
          <div className="sales-brand sales-brand-compact">
            <div className="sales-brand-mark"><PackagePlus size={22} /></div>
            <div className="sales-brand-copy">
              <strong>Expo ProffDok</strong>
              <span>Butikktilbud / Varesalg</span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">Butikktilbud</p>
            <h1 className="sales-title">Varer og produkter</h1>
            <p className="sales-subtitle">{selectedRequest?.customer} · {customerAddress} · {selectedRequest?.id}</p>
            <p className="sales-subtitle" style={{ marginTop: 8 }}>
              {offerDraftSaveStatus === "saving" ? "Lagrer på server …" : offerDraftSaveStatus === "saved" ? "✓ Lagret på server." : "Kladden lagres automatisk."}
            </p>
          </section>

          <form className="sales-form-panel" onSubmit={handleSaveOffer}>
            <section className="store-builder-section">
              <div className="store-section-head">
                <div>
                  <h2>Tilbudstekst</h2>
                  <p>Valgfritt. Nye butikktilbud starter uten tekst om arbeider.</p>
                </div>
              </div>
              <div className="sales-form-grid">
                <label className="sales-field sales-field-full">
                  <span>Overskrift</span>
                  <input value={offerForm.title || ""} onChange={(event) => updateOfferForm("title", event.target.value)} placeholder="Valgfri overskrift" />
                </label>
                <label className="sales-field sales-field-full">
                  <span>Kort innledning</span>
                  <textarea value={offerForm.intro || ""} onChange={(event) => updateOfferForm("intro", event.target.value)} placeholder="Valgfri innledning" rows={3} />
                </label>
              </div>
            </section>

            <section className="store-builder-section">
              <div className="store-section-head">
                <div>
                  <h2>Varer</h2>
                  <p>Prisene registreres inkl. mva. Dra varekortene for å endre rekkefølge.</p>
                </div>
                <button className="sales-primary-button" type="button" onClick={addProduct}><Plus size={18} /> Legg til vare</button>
              </div>
              <div className="store-item-list">
                {productLines.length ? productLines.map((item, index) => <ProductCard key={item.id} item={item} index={index} />) : <div className="store-empty"><ImagePlus size={24} /><br />Ingen varer ennå. Legg til første vare.</div>}
              </div>
            </section>

            <section className="store-builder-section">
              <div className="store-section-head">
                <div>
                  <h2>Montering</h2>
                  <p>Valgfri egen seksjon for montering eller andre tjenester.</p>
                </div>
                <button className="sales-secondary-button" type="button" onClick={addInstallation}><Wrench size={18} /> Legg til montering</button>
              </div>
              <div className="store-item-list">
                {installationLines.length ? installationLines.map((item, index) => <InstallationCard key={item.id} item={item} index={index} />) : <div className="store-empty">Ingen montering lagt til.</div>}
              </div>
            </section>

            <section className="store-builder-section">
              <div className="store-section-head">
                <div>
                  <h2>Opsjoner</h2>
                  <p>Tillegg/oppgradering eller alternativ vare som erstatter en av varene over.</p>
                </div>
                <button className="sales-secondary-button" type="button" onClick={addOption}><Plus size={18} /> Legg til opsjon</button>
              </div>
              <div className="store-item-list">
                {options.length ? options.map((option, index) => <OptionCard key={option.id} option={option} index={index} />) : <div className="store-empty">Ingen opsjoner ennå.</div>}
              </div>
            </section>

            <section className="store-builder-section">
              <div className="store-section-head"><div><h2>Vilkår</h2><p>Valgfritt og gjenbruker samme tilbudsmotor som ordinære tilbud.</p></div></div>
              <div className="store-terms-grid">
                <label className="sales-field">
                  <span>Betalingsbetingelser</span>
                  <input value={offerForm.paymentTerms || ""} onChange={(event) => updateOfferForm("paymentTerms", event.target.value)} placeholder="F.eks. 10 dager netto" />
                </label>
                <label className="sales-field">
                  <span>Gyldighet (dager)</span>
                  <input value={offerForm.validityDays || ""} onChange={(event) => updateOfferForm("validityDays", event.target.value)} inputMode="numeric" placeholder="30" />
                </label>
                <label className="sales-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Forbehold / merknader</span>
                  <textarea value={offerForm.reservations || ""} onChange={(event) => updateOfferForm("reservations", event.target.value)} rows={3} placeholder="Valgfritt" />
                </label>
              </div>
            </section>

            <div className="store-summary">
              <span>Tilbudssum varer + montering inkl. mva.</span>
              <strong>{formatNok(baseGrossTotal)}</strong>
            </div>

            <div className="sales-form-actions">
              <button className="sales-secondary-button" type="button" onClick={onBack}>Tilbake</button>
              <button className="sales-primary-button" type="submit"><Save size={18} /> Lagre butikktilbud</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
