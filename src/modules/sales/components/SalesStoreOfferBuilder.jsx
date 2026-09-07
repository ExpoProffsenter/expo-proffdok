// Expo ProffDok – FASE 37D1
// Egen varebygger for Ringside Butikktilbud. Brukeren arbeider med priser inkl. mva.
// Alternativer registreres som faktiske vare-/monteringspriser; eksisterende Sales-motor
// mottar kun beregnet prisendring eks. mva. Publisering, aksept og e-post beholdes.
// Saksbehandler ser både inkl./eks. mva., og kan forhåndsvise kundetilbudet uten publisering.

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
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
import { formatNok, getOfferTotal } from "../utils/salesUtils.js";
import { buildOfferSnapshot } from "../utils/salesOfferLogic.js";
import SalesCustomerView from "./SalesCustomerView.jsx";
import {
  buildNobbItemUrl,
  formatStoreDelta,
  getStoreAlternativeBreakdown,
  parseStoreNumber,
  recalculateStoreOption,
  recalculateStoreOptions,
  storeDiscount,
  storeGrossTotal,
  storeGrossUnitPrice,
  storeNumber,
} from "../utils/salesStoreOfferPricing.js";
import {
  DEFAULT_STORE_OFFER_BRAND,
  STORE_OFFER_BRANDS,
  createStoreOfferMetaLine,
  getStoreOfferBrand,
} from "../services/salesStoreOffers.js";
import {
  loadStoreTextTemplates,
  removeStoreTextTemplate,
  saveStoreTextTemplate,
} from "../services/salesStoreOfferTemplates.js";

const VAT_FACTOR = 1.25;
const PRODUCT_POST = { id: "butikk-varer", title: "Varer" };
const INSTALLATION_POST = { id: "butikk-montering", title: "Montering" };

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createStoreLine(post) {
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
    unit: "stk",
    storeUnitPriceInclVat: "",
    storeDiscountPercent: "",
    amount: "",
    productUrl: "",
    storeAutoProductUrl: false,
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
    storeInstallationReplacementLineId: "",
    storeInstallationPriceInclVat: "",
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
    storeAutoProductUrl: false,
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

function grossLineAmount(item = {}) {
  return storeGrossTotal(item);
}

function netFromGross(value) {
  const gross = Number(value || 0);
  return Number.isFinite(gross) ? gross / VAT_FACTOR : 0;
}

function canonicalNetUnit(item = {}) {
  const gross = storeGrossUnitPrice(item);
  const discount = storeDiscount(item.storeDiscountPercent);
  return storeNumber((gross * (1 - discount / 100)) / VAT_FACTOR);
}

function ProductIdentityFields({ item, onPatch, titleLabel = "Varenavn *", titleField = "description" }) {
  const nobbUrl = buildNobbItemUrl(item.nobbNumber);
  return (
    <div className="store-product-grid">
      <label className="sales-field store-product-name">
        <span>{titleLabel}</span>
        <input
          value={item[titleField] || ""}
          onChange={(event) => onPatch({ [titleField]: event.target.value })}
          placeholder="F.eks. servantskap 80 cm"
        />
      </label>
      <label className="sales-field">
        <span>NOBB-nr.</span>
        <div className="store-link-field">
          <input
            value={item.nobbNumber || ""}
            onChange={(event) => onPatch({ nobbNumber: event.target.value })}
            placeholder="NOBB-nummer"
            autoComplete="off"
          />
          {nobbUrl ? (
            <a href={nobbUrl} target="_blank" rel="noreferrer" title="Åpne varen direkte i NOBB">
              <ExternalLink size={17} />
            </a>
          ) : null}
        </div>
      </label>
      <label className="sales-field">
        <span>Varenummer</span>
        <input
          value={item.supplierProductNumber || item.internalProductNumber || ""}
          onChange={(event) => onPatch({ supplierProductNumber: event.target.value })}
          placeholder="Leverandørens varenummer"
          autoComplete="off"
        />
      </label>
      <label className="sales-field store-product-link">
        <span>Produktlink</span>
        <div className="store-link-field">
          <input
            value={item.productUrl || ""}
            onChange={(event) => onPatch({ productUrl: event.target.value, storeAutoProductUrl: false })}
            placeholder="NOBB eller leverandørens produktside"
            inputMode="url"
          />
          {item.productUrl ? (
            <a href={item.productUrl} target="_blank" rel="noreferrer" title="Åpne produktlink">
              <Link2 size={17} />
            </a>
          ) : null}
        </div>
      </label>
    </div>
  );
}

function PriceFields({ item, onPatch, priceLabel = "Pris pr. enhet inkl. mva.", totalLabel = "Linjesum inkl. mva." }) {
  const grossUnit = storeGrossUnitPrice(item);
  const grossTotal = grossLineAmount(item);
  const hasUnitPrice = String(item.storeUnitPriceInclVat ?? "").trim() !== "";

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
        <span>{priceLabel}</span>
        <input
          value={item.storeUnitPriceInclVat ?? ""}
          inputMode="decimal"
          onChange={(event) => onPatch({ storeUnitPriceInclVat: event.target.value })}
          placeholder="0"
        />
        {hasUnitPrice ? <small className="store-price-net">{formatNok(netFromGross(grossUnit))} eks. mva.</small> : null}
      </label>
      <label className="sales-field">
        <span>Rabatt %</span>
        <input
          value={item.storeDiscountPercent ?? ""}
          inputMode="decimal"
          onChange={(event) => onPatch({ storeDiscountPercent: event.target.value })}
          placeholder="0"
        />
      </label>
      <div className="store-line-total">
        <span>{totalLabel}</span>
        <strong>{formatNok(grossTotal)}</strong>
        <small>{formatNok(netFromGross(grossTotal))} eks. mva.</small>
      </div>
    </div>
  );
}

function DropZone({ item, onFiles, onRemoveImage, onRemoveAttachment }) {
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
      <button type="button" className="sales-secondary-button" onClick={() => inputRef.current?.click()}>
        <Paperclip size={16} /> Dra inn eller velg bilde/PDF
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
        <div className="store-file-chip">
          <FileText size={18} />
          <span>{item.attachmentFile.name || "PDF-vedlegg"}</span>
          <button type="button" onClick={onRemoveAttachment} aria-label="Fjern vedlegg">×</button>
        </div>
      ) : null}
    </div>
  );
}

function ProductCard({ item, index, dragProps, onPatch, onRemove, onFiles, onRemoveImage, onRemoveAttachment }) {
  return (
    <article className="store-item-card" {...dragProps}>
      <div className="store-item-heading">
        <div className="store-drag-handle"><GripVertical size={18} /></div>
        <strong>Vare {index + 1}</strong>
        <button type="button" className="store-icon-button" onClick={onRemove} aria-label="Slett vare"><Trash2 size={17} /></button>
      </div>
      <ProductIdentityFields item={item} onPatch={onPatch} />
      <PriceFields item={item} onPatch={onPatch} />
      <DropZone item={item} onFiles={onFiles} onRemoveImage={onRemoveImage} onRemoveAttachment={onRemoveAttachment} />
    </article>
  );
}

function InstallationCard({ item, index, dragProps, onPatch, onRemove }) {
  return (
    <article className="store-item-card store-installation-card" {...dragProps}>
      <div className="store-item-heading">
        <div className="store-drag-handle"><GripVertical size={18} /></div>
        <strong>Montering {index + 1}</strong>
        <button type="button" className="store-icon-button" onClick={onRemove} aria-label="Slett montering"><Trash2 size={17} /></button>
      </div>
      <label className="sales-field">
        <span>Beskrivelse *</span>
        <input value={item.description || ""} onChange={(event) => onPatch({ description: event.target.value })} placeholder="F.eks. Montering av ovennevnte baderomsmøbel" />
      </label>
      <PriceFields item={item} onPatch={onPatch} priceLabel="Monteringspris inkl. mva." />
    </article>
  );
}

function DualAmount({ label, gross, delta = false }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{delta ? formatStoreDelta(gross) : formatNok(gross)} inkl. mva.</strong>
      <small>{delta ? formatStoreDelta(netFromGross(gross)) : formatNok(netFromGross(gross))} eks. mva.</small>
    </div>
  );
}

function AlternativeSummary({ option, lines }) {
  const breakdown = getStoreAlternativeBreakdown(option, lines);
  return (
    <div className="store-alt-summary">
      <DualAmount label="Pris på alternativet" gross={breakdown.newItemTotal} />
      {breakdown.hasInstallationOverride ? (
        <DualAmount label="Montering med alternativet" gross={breakdown.newInstallationTotal} />
      ) : null}
      <div className="store-alt-summary-delta">
        <DualAmount label="Prisendring mot grunnpakken" gross={breakdown.totalDelta} delta />
      </div>
    </div>
  );
}

function OptionCard({ option, index, productLines, installationLines, dragProps, onPatch, onReplacementChange, onInstallationChange, onRemove, onFiles, onRemoveImage, onRemoveAttachment }) {
  const alternative = option.optionType === "alternative";
  const replacement = [...productLines, ...installationLines].find((line) => line.id === option.replacementLineId);
  const replacesInstallation = replacement?.mainPostId === INSTALLATION_POST.id;
  const installationGross = parseStoreNumber(option.storeInstallationPriceInclVat, 0);

  return (
    <article className="store-item-card store-option-card" {...dragProps}>
      <div className="store-item-heading">
        <div className="store-drag-handle"><GripVertical size={18} /></div>
        <strong>Opsjon {index + 1}</strong>
        <button type="button" className="store-icon-button" onClick={onRemove} aria-label="Slett opsjon"><Trash2 size={17} /></button>
      </div>

      <div className="store-option-top-grid">
        <label className="sales-field">
          <span>Type opsjon</span>
          <select value={option.optionType || "addition"} onChange={(event) => onPatch({ optionType: event.target.value })}>
            <option value="addition">Tillegg / oppgradering</option>
            <option value="alternative">Alternativ som erstatter</option>
          </select>
        </label>
        {alternative ? (
          <label className="sales-field">
            <span>Erstatter *</span>
            <select value={option.replacementLineId || ""} onChange={(event) => onReplacementChange(event.target.value)}>
              <option value="">Velg vare eller montering</option>
              {productLines.map((target) => <option key={target.id} value={target.id}>Vare: {target.description || "Uten navn"}</option>)}
              {installationLines.map((target) => <option key={target.id} value={target.id}>Montering: {target.description || "Uten navn"}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      {replacesInstallation ? (
        <>
          <label className="sales-field" style={{ marginTop: 12 }}>
            <span>Beskrivelse *</span>
            <input value={option.title || ""} onChange={(event) => onPatch({ title: event.target.value })} placeholder="Ny monteringsløsning" />
          </label>
          <PriceFields item={option} onPatch={onPatch} priceLabel="Ny monteringspris inkl. mva." totalLabel="Ny monteringssum inkl. mva." />
        </>
      ) : (
        <>
          <ProductIdentityFields item={option} onPatch={onPatch} titleLabel={alternative ? "Alternativ vare *" : "Opsjonsvare *"} titleField="title" />
          <PriceFields item={option} onPatch={onPatch} priceLabel={alternative ? "Pris på alternativ vare inkl. mva." : "Pris pr. enhet inkl. mva."} totalLabel={alternative ? "Alternativ varepris inkl. mva." : "Opsjonssum inkl. mva."} />
        </>
      )}

      {alternative && !replacesInstallation && installationLines.length ? (
        <div className="store-installation-override">
          <div>
            <strong>Montering med dette alternativet</strong>
            <p>Valgfritt. Velg monteringspost hvis denne varen gir en annen monteringspris.</p>
          </div>
          <label className="sales-field">
            <span>Montering som påvirkes</span>
            <select value={option.storeInstallationReplacementLineId || ""} onChange={(event) => onInstallationChange(event.target.value)}>
              <option value="">Uendret montering</option>
              {installationLines.map((line) => <option key={line.id} value={line.id}>{line.description || "Montering"} – {formatNok(storeGrossTotal(line))} inkl. mva.</option>)}
            </select>
          </label>
          {option.storeInstallationReplacementLineId ? (
            <label className="sales-field">
              <span>Ny monteringspris inkl. mva.</span>
              <input value={option.storeInstallationPriceInclVat ?? ""} onChange={(event) => onPatch({ storeInstallationPriceInclVat: event.target.value })} inputMode="decimal" placeholder="0" />
              {String(option.storeInstallationPriceInclVat ?? "").trim() ? <small className="store-price-net">{formatNok(netFromGross(installationGross))} eks. mva.</small> : null}
            </label>
          ) : null}
        </div>
      ) : null}

      {alternative ? <AlternativeSummary option={option} lines={[...productLines, ...installationLines]} /> : null}

      <label className="sales-field" style={{ marginTop: 12 }}>
        <span>Beskrivelse / kundetekst</span>
        <textarea
          value={option.description || ""}
          onChange={(event) => onPatch({ description: event.target.value, storeAutoDescription: false })}
          rows={2}
          placeholder="Valgfri forklaring til kunden"
        />
      </label>

      {!replacesInstallation ? (
        <DropZone item={option} onFiles={onFiles} onRemoveImage={onRemoveImage} onRemoveAttachment={onRemoveAttachment} />
      ) : null}
    </article>
  );
}

function StoreBrandSelector({ brandKey, signatureName, onBrandChange, onSignatureChange }) {
  return (
    <section className="store-builder-section">
      <div className="store-section-head"><div><h2>Avsender</h2><p>Bademiljø Expo er standard. Valgt logo og saksbehandler låses med tilbudsversjonen.</p></div></div>
      <div className="store-brand-grid">
        {STORE_OFFER_BRANDS.map((brand) => (
          <label className={`store-brand-card ${brand.key === brandKey ? "is-selected" : ""}`} key={brand.key}>
            <input type="radio" name="store-offer-brand" value={brand.key} checked={brand.key === brandKey} onChange={() => onBrandChange(brand.key)} />
            <img src={brand.logoUrl} alt={brand.label} />
            <strong>{brand.label}</strong>
          </label>
        ))}
      </div>
      <label className="sales-field" style={{ marginTop: 14 }}><span>Saksbehandler / signatur</span><input value={signatureName} onChange={(event) => onSignatureChange(event.target.value)} placeholder="Navn på saksbehandler" /></label>
      <div className="store-signature-preview"><span>Med vennlig hilsen</span><strong>{signatureName || "Saksbehandler"}</strong></div>
    </section>
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
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateMessage, setTemplateMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const initializedRequestRef = useRef("");
  const requestId = String(selectedRequest?.id || "");

  const lines = Array.isArray(offerForm?.lines) ? offerForm.lines : [];
  const options = Array.isArray(offerForm?.options) ? offerForm.options : [];
  const metaLine = lines.find((line) => line?.__storeOfferMeta) || null;
  const productLines = lines.filter((line) => line.mainPostId === PRODUCT_POST.id && !line?.__storeOfferMeta);
  const installationLines = lines.filter((line) => line.mainPostId === INSTALLATION_POST.id && !line?.__storeOfferMeta);
  const otherLines = lines.filter((line) => !line?.__storeOfferMeta && ![PRODUCT_POST.id, INSTALLATION_POST.id].includes(line.mainPostId));
  const currentBrand = getStoreOfferBrand(metaLine?.brandKey || DEFAULT_STORE_OFFER_BRAND.key);
  const signatureName = String(metaLine?.signatureName || selectedRequest?.responsible || selectedRequest?.projectResponsible || "");

  useEffect(() => {
    if (!requestId || initializedRequestRef.current === requestId) return;
    initializedRequestRef.current = requestId;

    let nextLines = (Array.isArray(offerForm?.lines) ? offerForm.lines : []).map((line) => {
      if (line?.__storeOfferMeta) return line;
      const next = { ...line };
      if (next.nobbNumber && !String(next.productUrl || "").trim()) {
        next.productUrl = buildNobbItemUrl(next.nobbNumber);
        next.storeAutoProductUrl = true;
      }
      if (String(next.storeUnitPriceInclVat ?? "").trim()) next.amount = canonicalNetUnit(next);
      return next;
    });

    if (!nextLines.some((line) => line?.__storeOfferMeta)) {
      nextLines.push(createStoreOfferMetaLine({
        brandKey: DEFAULT_STORE_OFFER_BRAND.key,
        signatureName: selectedRequest?.responsible || selectedRequest?.projectResponsible || "",
      }));
    }

    const nextOptions = recalculateStoreOptions(options, nextLines);
    updateOfferForm("lines", nextLines);
    updateOfferForm("options", nextOptions);

    const hasVisibleRows = nextLines.some((line) => !line?.__storeOfferMeta) || nextOptions.length;
    if (!hasVisibleRows) {
      const legacyTitle = String(offerForm?.title || "");
      const legacyIntro = String(offerForm?.intro || "");
      if (legacyTitle === "Tilbud – Butikktilbud" || legacyTitle === "Tilbud - Butikktilbud") updateOfferForm("title", "");
      if (/følgende arbeider/i.test(legacyIntro)) updateOfferForm("intro", "");
    }
  }, [requestId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let active = true;
    loadStoreTextTemplates().then((items) => active && setTemplates(items)).catch(() => active && setTemplates([]));
    return () => { active = false; };
  }, [requestId]);

  const customerAddress = [selectedRequest?.address, [selectedRequest?.postnr, selectedRequest?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const baseGrossTotal = [...productLines, ...installationLines].reduce((sum, item) => sum + storeGrossTotal(item), 0);

  function applyLineChanges(nextLines) {
    updateOfferForm("lines", nextLines);
    updateOfferForm("options", recalculateStoreOptions(options, nextLines));
  }

  function replaceVisibleLines(nextVisibleLines, nextMeta = metaLine) {
    applyLineChanges([...nextVisibleLines, ...(nextMeta ? [nextMeta] : []), ...otherLines]);
  }

  function patchLine(id, patch) {
    const nextLines = lines.map((line) => {
      if (line.id !== id) return line;
      const next = { ...line, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "supplierProductNumber")) next.internalProductNumber = patch.supplierProductNumber;
      if (Object.prototype.hasOwnProperty.call(patch, "nobbNumber") && (!String(next.productUrl || "").trim() || next.storeAutoProductUrl)) {
        next.productUrl = buildNobbItemUrl(patch.nobbNumber);
        next.storeAutoProductUrl = Boolean(next.productUrl);
      }
      if (Object.prototype.hasOwnProperty.call(patch, "productUrl") && patch.storeAutoProductUrl === false) next.storeAutoProductUrl = false;
      if (Object.prototype.hasOwnProperty.call(patch, "storeUnitPriceInclVat") || Object.prototype.hasOwnProperty.call(patch, "storeDiscountPercent")) next.amount = canonicalNetUnit(next);
      return next;
    });
    applyLineChanges(nextLines);
  }

  function patchStoreMeta(patch) {
    const nextMeta = { ...(metaLine || createStoreOfferMetaLine({ signatureName })), ...patch };
    if (patch.brandKey) {
      const brand = getStoreOfferBrand(patch.brandKey);
      Object.assign(nextMeta, { brandKey: brand.key, brandLabel: brand.label, brandLogoUrl: brand.logoUrl });
    }
    updateOfferForm("lines", [...lines.filter((line) => !line?.__storeOfferMeta), nextMeta]);
  }

  function patchOption(id, patch) {
    const nextOptions = options.map((option) => {
      if (option.id !== id) return option;
      let next = { ...option, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "supplierProductNumber")) next.internalProductNumber = patch.supplierProductNumber;
      if (patch.optionType === "addition") {
        next = { ...next, mainPostId: PRODUCT_POST.id, mainPostTitle: PRODUCT_POST.title, replacementLineId: "", replacementLineDescription: "", storeInstallationReplacementLineId: "", storeInstallationPriceInclVat: "" };
      }
      return recalculateStoreOption(next, lines);
    });
    updateOfferForm("options", nextOptions);
  }

  function changeReplacement(optionId, replacementLineId) {
    const target = [...productLines, ...installationLines].find((line) => line.id === replacementLineId);
    const current = options.find((option) => option.id === optionId) || {};
    const patch = {
      replacementLineId,
      replacementLineDescription: target?.description || "",
      mainPostId: target?.mainPostId || PRODUCT_POST.id,
      mainPostTitle: target?.mainPostTitle || PRODUCT_POST.title,
    };
    if (target?.mainPostId === PRODUCT_POST.id && installationLines.length === 1 && !current.storeInstallationReplacementLineId) {
      patch.storeInstallationReplacementLineId = installationLines[0].id;
      patch.storeInstallationPriceInclVat = storeNumber(storeGrossTotal(installationLines[0]));
    }
    if (target?.mainPostId === INSTALLATION_POST.id) {
      patch.storeInstallationReplacementLineId = "";
      patch.storeInstallationPriceInclVat = "";
    }
    patchOption(optionId, patch);
  }

  function changeOptionInstallation(optionId, installationLineId) {
    const line = installationLines.find((item) => item.id === installationLineId);
    patchOption(optionId, {
      storeInstallationReplacementLineId: installationLineId,
      storeInstallationPriceInclVat: line ? storeNumber(storeGrossTotal(line)) : "",
    });
  }

  function addProduct() { replaceVisibleLines([...productLines, createStoreLine(PRODUCT_POST), ...installationLines]); }
  function addInstallation() { replaceVisibleLines([...productLines, ...installationLines, createStoreLine(INSTALLATION_POST)]); }
  function addOption() { updateOfferForm("options", [...options, createStoreOption()]); }
  function removeLine(id) { applyLineChanges(lines.filter((line) => line.id !== id)); }
  function removeOption(id) { updateOfferForm("options", options.filter((option) => option.id !== id)); }

  function reorderLines(section, fromId, toId) {
    const reordered = section === "product"
      ? [...moveItem(productLines, fromId, toId), ...installationLines]
      : [...productLines, ...moveItem(installationLines, fromId, toId)];
    replaceVisibleLines(reordered);
  }
  function reorderOptions(fromId, toId) { updateOfferForm("options", moveItem(options, fromId, toId)); }

  async function sendFiles(kind, id, files) {
    for (const file of files) {
      const syntheticEvent = { target: { files: [file], value: "" } };
      if (kind === "line") await handleOfferLineFile?.(id, syntheticEvent);
      else await handleOfferOptionFile?.(id, syntheticEvent);
    }
  }

  function draggableProps(kind, id, section = "") {
    return {
      draggable: true,
      onDragStart: (event) => {
        if (event.target?.closest?.("input, textarea, select, button, a")) { event.preventDefault(); return; }
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
        if (kind === "option") reorderOptions(dragged.id, id); else reorderLines(section, dragged.id, id);
        setDragged(null);
      },
      onDragEnd: () => setDragged(null),
    };
  }

  async function refreshTemplates(nextSelectedId = "") {
    const items = await loadStoreTextTemplates();
    setTemplates(items);
    setSelectedTemplateId(nextSelectedId);
  }

  async function saveTextTemplate() {
    setTemplateMessage("");
    setTemplateBusy(true);
    try {
      const saved = await saveStoreTextTemplate(templateName, offerForm);
      await refreshTemplates(saved?.id || "");
      setTemplateName("");
      setTemplateMessage("✓ Tekst og vilkår er lagret som firmamal. Varer og priser er ikke med.");
    } catch (error) {
      setTemplateMessage(error?.message || "Malen kunne ikke lagres.");
    } finally { setTemplateBusy(false); }
  }

  function applySelectedTemplate() {
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template?.payload) return;
    ["title", "intro", "reservations", "terms", "paymentTerms", "validityDays"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(template.payload, field)) updateOfferForm(field, template.payload[field] ?? "");
    });
    setTemplateMessage(`✓ Malen «${template.name}» er lagt inn. Varer og priser er beholdt.`);
  }

  async function deleteSelectedTemplate() {
    if (!selectedTemplateId) return;
    setTemplateBusy(true);
    setTemplateMessage("");
    try {
      await removeStoreTextTemplate(selectedTemplateId);
      await refreshTemplates("");
      setTemplateMessage("Malen er slettet.");
    } catch (error) { setTemplateMessage(error?.message || "Malen kunne ikke slettes."); }
    finally { setTemplateBusy(false); }
  }

  function submitStoreOffer(event) {
    if (!productLines.length && !installationLines.length) {
      event.preventDefault();
      alert("Legg inn minst én vare eller monteringspost før du lagrer tilbudet.");
      return;
    }
    handleSaveOffer?.(event);
  }

  function buildDraftPreviewRequest() {
    const draftRequest = {
      ...selectedRequest,
      offerTitle: String(offerForm.title || "").trim(),
      offerIntro: String(offerForm.intro || "").trim(),
      offerLines: lines,
      offerOptions: options,
      offerReservations: String(offerForm.reservations || "").trim(),
      offerIncluded: String(offerForm.included || "").trim(),
      offerExcluded: String(offerForm.excluded || "").trim(),
      offerCustomerSupplied: String(offerForm.customerSupplied || "").trim(),
      offerTerms: String(offerForm.terms || "").trim(),
      offerPaymentTerms: String(offerForm.paymentTerms || "").trim(),
      offerValidityDays: String(offerForm.validityDays || "30"),
      offerTotal: getOfferTotal(lines),
      offerVersions: [],
      sentOfferVersionId: null,
      sentOfferVersionNumber: null,
      sentOfferAt: null,
    };
    const snapshot = buildOfferSnapshot(
      draftRequest,
      {},
      new Date().toISOString(),
      `store-draft-preview-${requestId || Date.now()}`
    );
    return {
      ...draftRequest,
      offerVersions: [snapshot],
      sentOfferVersionId: snapshot.id,
      sentOfferVersionNumber: snapshot.versionNumber,
      sentOfferAt: snapshot.createdAt,
    };
  }

  if (previewOpen) {
    const previewRequest = buildDraftPreviewRequest();
    return (
      <div className="store-draft-preview-shell">
        <style>{`
          .store-draft-preview-shell .sales-customer-accept-form{display:none!important}
          .store-draft-preview-banner{position:sticky;top:0;z-index:25000;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 18px;background:#fff8d9;border-bottom:1px solid #ead78d;color:#493d11;font-weight:800}
          .store-draft-preview-banner span{font-weight:650}.store-draft-preview-banner button{white-space:nowrap}
          @media(max-width:620px){.store-draft-preview-banner{align-items:stretch;flex-direction:column}}
        `}</style>
        <div className="store-draft-preview-banner">
          <div><strong>FORHÅNDSVISNING</strong> <span>– ikke publisert, ikke sendt og kan ikke aksepteres av kunden.</span></div>
          <button type="button" className="sales-secondary-button" onClick={() => setPreviewOpen(false)}><ArrowLeft size={17}/> Tilbake til redigering</button>
        </div>
        <SalesCustomerView
          mode="customer-offer"
          selectedRequest={previewRequest}
          companyProfile={{}}
          acceptanceForm={{ confirmed: false, name: "", selectedOptionIds: [] }}
          setAcceptanceForm={() => {}}
          toggleAcceptedOption={() => {}}
          handleAcceptOffer={(event) => event?.preventDefault?.()}
          onBack={() => setPreviewOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="sales-app store-offer-builder-app">
      <style>{`
        .store-offer-builder-app .sales-shell{max-width:1180px}.store-offer-builder-app .sales-form-panel{display:grid;gap:18px}
        .store-builder-section{border:1px solid #d7e4ea;border-radius:18px;padding:18px;background:#fff}.store-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.store-section-head h2{margin:0 0 4px;font-size:22px}.store-section-head p{margin:0;color:#60727a}
        .store-item-list{display:grid;gap:14px}.store-item-card{border:1px solid #d9e5ea;border-radius:16px;padding:16px;background:#fbfdfe}.store-option-card{background:#f8fbff}.store-installation-card{background:#fbfaf7}.store-item-heading{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;margin-bottom:14px}.store-drag-handle{display:grid;place-items:center;color:#70848d;cursor:grab}.store-icon-button{border:0;background:transparent;padding:6px;cursor:pointer;color:#8d3e3e}
        .store-product-grid{display:grid;grid-template-columns:1.6fr .8fr .9fr 1.5fr;gap:12px}.store-option-top-grid{display:grid;grid-template-columns:1fr 1.5fr;gap:12px}.store-link-field{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px}.store-link-field a{display:grid;place-items:center;width:38px;height:38px;border:1px solid #cbdbe2;border-radius:10px}.store-price-grid{display:grid;grid-template-columns:.7fr .7fr 1.25fr .8fr 1.2fr;gap:12px;align-items:end;margin-top:12px}.store-price-net{display:block;margin-top:4px;color:#667780;font-size:12px;font-weight:650}.store-line-total{min-height:76px;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;padding:10px 12px;border-radius:12px;background:#eef8fa}.store-line-total span{font-size:12px;color:#5e737b;font-weight:700}.store-line-total strong{font-size:19px}.store-line-total small{margin-top:2px;color:#5e737b;font-weight:650}
        .store-drop-zone{margin-top:14px;padding:12px;border:1px dashed #9fc3cc;border-radius:13px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#fff}.store-drop-help{color:#65767d;font-size:13px}.store-file-chip{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;background:#f0f7f8}.store-file-chip img{width:48px;height:48px;border-radius:8px;object-fit:contain}.store-file-chip button{border:0;background:transparent;font-size:20px;cursor:pointer}
        .store-installation-override{margin-top:14px;padding:14px;border:1px solid #d7e4ea;border-radius:14px;background:#fff8e9;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:12px;align-items:end}.store-installation-override p{margin:4px 0 0;color:#6b6250;font-size:13px}.store-alt-summary{margin-top:12px;padding:12px 14px;border-radius:12px;background:#edf9fa;display:flex;gap:24px;align-items:center;flex-wrap:wrap}.store-alt-summary>div{display:grid;gap:3px}.store-alt-summary span{font-size:12px;color:#60727a;font-weight:700}.store-alt-summary strong{font-size:16px}.store-alt-summary small{font-size:12px;color:#60727a;font-weight:650}.store-alt-summary-delta{margin-left:auto;text-align:right}
        .store-empty{padding:18px;border:1px dashed #c5d7dd;border-radius:14px;color:#61737a;text-align:center}.store-summary{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:16px 18px;border-radius:16px;background:#0f172a;color:#fff}.store-summary-price{display:grid;gap:2px}.store-summary strong{font-size:24px}.store-summary small{color:#d7e2e7;font-weight:650}.store-summary-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.store-terms-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.store-template-grid{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}.store-brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.store-brand-card{position:relative;display:grid;gap:10px;padding:14px;border:2px solid #d8e3e8;border-radius:14px;cursor:pointer;background:#fff}.store-brand-card.is-selected{border-color:#16aeb9;box-shadow:0 0 0 3px rgba(22,174,185,.1)}.store-brand-card input{position:absolute;top:10px;right:10px}.store-brand-card img{width:100%;height:72px;object-fit:contain;object-position:left center}.store-signature-preview{margin-top:12px;padding:12px 14px;border-left:3px solid #16aeb9;display:grid;gap:3px}.store-template-message{margin:8px 0 0;color:#42606b;font-weight:650}
        @media(max-width:900px){.store-product-grid,.store-price-grid,.store-terms-grid,.store-installation-override{grid-template-columns:1fr 1fr}.store-product-link,.store-product-name,.store-installation-override>div:first-child{grid-column:1/-1}}
        @media(max-width:620px){.store-product-grid,.store-price-grid,.store-terms-grid,.store-brand-grid,.store-template-grid,.store-option-top-grid,.store-installation-override{grid-template-columns:1fr}.store-section-head,.store-summary{align-items:stretch;flex-direction:column}.store-line-total{align-items:flex-start}.store-alt-summary-delta{margin-left:0;text-align:left}.store-summary-actions{justify-content:stretch}.store-summary-actions button{width:100%}}
      `}</style>

      <div className="sales-shell">
        <header className="sales-header">
          <button className="sales-back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> Tilbake</button>
          <div className="sales-brand sales-brand-compact"><div className="sales-brand-mark"><PackagePlus size={22} /></div><div className="sales-brand-copy"><strong>Expo ProffDok</strong><span>Butikktilbud / Varesalg</span></div></div>
        </header>
        <main className="sales-main">
          <section className="sales-form-hero"><p className="sales-eyebrow">Butikktilbud</p><h1 className="sales-title">Varer, montering og opsjoner</h1><p className="sales-subtitle">{selectedRequest?.customer} · {customerAddress} · {selectedRequest?.id}</p><p className="sales-subtitle" style={{marginTop:8}}>{offerDraftSaveStatus === "saving" ? "Lagrer på server …" : offerDraftSaveStatus === "saved" ? "✓ Lagret på server." : "Kladden lagres automatisk."}</p></section>

          <form className="sales-form-panel" onSubmit={submitStoreOffer}>
            <StoreBrandSelector brandKey={currentBrand.key} signatureName={signatureName} onBrandChange={(brandKey) => patchStoreMeta({ brandKey })} onSignatureChange={(name) => patchStoreMeta({ signatureName: name })} />

            <section className="store-builder-section">
              <div className="store-section-head"><div><h2>Tilbudstekst og vilkår</h2><p>Du kan lagre teksten fra et ferdig tilbud som mal. Kunde, varer, NOBB, vedlegg og priser blir aldri med i malen.</p></div></div>
              <div className="store-template-grid">
                <label className="sales-field"><span>Malnavn</span><input value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="F.eks. Standard butikktilbud" /></label>
                <button type="button" className="sales-secondary-button" disabled={!templateName.trim() || templateBusy} onClick={saveTextTemplate}><Save size={17} /> Lagre tekst og vilkår som mal</button>
              </div>
              {templates.length ? <div className="store-template-grid" style={{marginTop:12}}><label className="sales-field"><span>Bruk eksisterende mal</span><select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)}><option value="">Velg mal</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" className="sales-secondary-button" disabled={!selectedTemplateId || templateBusy} onClick={applySelectedTemplate}>Bruk mal</button><button type="button" className="sales-secondary-button" disabled={!selectedTemplateId || templateBusy} onClick={deleteSelectedTemplate}>Slett mal</button></div></div> : null}
              {templateMessage ? <p className="store-template-message">{templateMessage}</p> : null}
              <div className="sales-form-grid" style={{marginTop:14}}>
                <label className="sales-field sales-field-full"><span>Overskrift</span><input value={offerForm.title || ""} onChange={(event) => updateOfferForm("title", event.target.value)} placeholder="Valgfri overskrift" /></label>
                <label className="sales-field sales-field-full"><span>Kort innledning</span><textarea value={offerForm.intro || ""} onChange={(event) => updateOfferForm("intro", event.target.value)} placeholder="Valgfri innledning" rows={3} /></label>
                <label className="sales-field sales-field-full"><span>Vilkår / betingelser</span><textarea value={offerForm.terms || ""} onChange={(event) => updateOfferForm("terms", event.target.value)} rows={4} placeholder="Valgfritt" /></label>
                <label className="sales-field sales-field-full"><span>Forbehold / merknader</span><textarea value={offerForm.reservations || ""} onChange={(event) => updateOfferForm("reservations", event.target.value)} rows={3} placeholder="Valgfritt" /></label>
              </div>
              <div className="store-terms-grid" style={{marginTop:12}}><label className="sales-field"><span>Betalingsbetingelser</span><input value={offerForm.paymentTerms || ""} onChange={(event) => updateOfferForm("paymentTerms", event.target.value)} placeholder="F.eks. 10 dager netto" /></label><label className="sales-field"><span>Gyldighet (dager)</span><input value={offerForm.validityDays || ""} onChange={(event) => updateOfferForm("validityDays", event.target.value)} inputMode="numeric" placeholder="30" /></label></div>
            </section>

            <section className="store-builder-section"><div className="store-section-head"><div><h2>Varer</h2><p>Prisene registreres inkl. mva. Saksbehandler ser automatisk tilsvarende pris eks. mva. NOBB-nr. gir direkte NOBB-link når egen produktlink ikke er satt.</p></div><button className="sales-primary-button" type="button" onClick={addProduct}><Plus size={18} /> Legg til vare</button></div><div className="store-item-list">{productLines.length ? productLines.map((item,index)=><ProductCard key={item.id} item={item} index={index} dragProps={draggableProps("line",item.id,"product")} onPatch={(patch)=>patchLine(item.id,patch)} onRemove={()=>removeLine(item.id)} onFiles={(files)=>sendFiles("line",item.id,files)} onRemoveImage={()=>removeOfferLineImage?.(item.id)} onRemoveAttachment={()=>removeOfferLineAttachment?.(item.id)} />) : <div className="store-empty"><ImagePlus size={24}/><br/>Ingen varer ennå. Legg til første vare.</div>}</div></section>

            <section className="store-builder-section"><div className="store-section-head"><div><h2>Montering</h2><p>Valgfri egen seksjon. En vareopsjon kan også angi en annen monteringspris.</p></div><button className="sales-secondary-button" type="button" onClick={addInstallation}><Wrench size={18}/> Legg til montering</button></div><div className="store-item-list">{installationLines.length ? installationLines.map((item,index)=><InstallationCard key={item.id} item={item} index={index} dragProps={draggableProps("line",item.id,"installation")} onPatch={(patch)=>patchLine(item.id,patch)} onRemove={()=>removeLine(item.id)} />) : <div className="store-empty">Ingen montering lagt til.</div>}</div></section>

            <section className="store-builder-section"><div className="store-section-head"><div><h2>Opsjoner</h2><p>Ved alternativ vare skriver du inn den faktiske nye vareprisen. Expo beregner prisendringen automatisk – også når monteringsprisen endres.</p></div><button className="sales-secondary-button" type="button" onClick={addOption}><Plus size={18}/> Legg til opsjon</button></div><div className="store-item-list">{options.length ? options.map((option,index)=><OptionCard key={option.id} option={option} index={index} productLines={productLines} installationLines={installationLines} dragProps={draggableProps("option",option.id)} onPatch={(patch)=>patchOption(option.id,patch)} onReplacementChange={(replacementId)=>changeReplacement(option.id,replacementId)} onInstallationChange={(lineId)=>changeOptionInstallation(option.id,lineId)} onRemove={()=>removeOption(option.id)} onFiles={(files)=>sendFiles("option",option.id,files)} onRemoveImage={()=>removeOfferOptionImage?.(option.id)} onRemoveAttachment={()=>removeOfferOptionAttachment?.(option.id)} />) : <div className="store-empty">Ingen opsjoner lagt til.</div>}</div></section>

            <div className="store-summary">
              <div className="store-summary-price"><span>Grunnsum varer + montering</span><strong>{formatNok(baseGrossTotal)} inkl. mva.</strong><small>{formatNok(netFromGross(baseGrossTotal))} eks. mva.</small><small>Opsjoner kommer i tillegg eller erstatter grunnpakken.</small></div>
              <div className="store-summary-actions"><button type="button" className="sales-secondary-button" onClick={() => setPreviewOpen(true)} disabled={!productLines.length && !installationLines.length}><Eye size={18}/> Forhåndsvis kundetilbud</button><button type="submit" className="sales-primary-button" data-sales-save-offer-button="true"><Save size={18}/> Lagre butikktilbud</button></div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
