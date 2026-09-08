// Expo ProffDok – FASE 39B.2C
// Kompakt Butikktilbud-bygger: avsnitt -> hovedvare -> montering/opsjoner.
// Dataformatet for publisering/aksept beholdes; kun editor-relasjoner legges til i JSON.

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  FileText,
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
  DEFAULT_STORE_FOLLOW_UP,
  DEFAULT_STORE_OFFER_BRAND,
  STORE_OFFER_BRANDS,
  createStoreOfferMetaLine,
  getStoreFollowUpConfig,
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
const SECTION_LINE_TYPE = "store_text";
const SECTION_MARKER = "#expo-store-text-block";
const PAYMENT_CHOICES = ["10 dager netto", "14 dager netto", "30 dager netto", "Betaling ved bestilling"];
const VALIDITY_CHOICES = ["7", "14", "30", "60", "90"];
const CUSTOM_CHOICE = "__custom_store_choice__";

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isSectionLine(line = {}) {
  return line?.lineType === SECTION_LINE_TYPE;
}

function isProductLine(line = {}) {
  return line?.mainPostId === PRODUCT_POST.id && !line?.__storeOfferMeta && !isSectionLine(line);
}

function isInstallationLine(line = {}) {
  return line?.mainPostId === INSTALLATION_POST.id && !line?.__storeOfferMeta;
}

function sectionDescription(section = {}) {
  return [section.storeTextTitle, section.storeTextBody]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join("\n");
}

function createSectionLine() {
  const id = createId("store-section");
  return {
    id,
    mainPostId: PRODUCT_POST.id,
    mainPostTitle: PRODUCT_POST.title,
    lineType: SECTION_LINE_TYPE,
    storeSectionMode: "group",
    storeSectionId: id,
    storeTextTitle: "Nytt avsnitt",
    storeTextBody: "",
    description: "Nytt avsnitt",
    amount: "0",
    quantity: "0",
    unit: "",
    nobbNumber: "",
    supplierProductNumber: "",
    internalProductNumber: "",
    storeUnitPriceInclVat: "",
    storeDiscountPercent: "",
    productUrl: SECTION_MARKER,
    storeAutoProductUrl: false,
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

function createStoreLine(post, patch = {}) {
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
    unit: post.id === INSTALLATION_POST.id ? "timer" : "stk",
    storeUnitPriceInclVat: "",
    storeDiscountPercent: "",
    amount: "",
    productUrl: "",
    storeAutoProductUrl: false,
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
    ...patch,
  };
}

function createStoreOption(product = null, type = "addition", installation = null) {
  const alternative = type === "alternative";
  const option = {
    id: createId("option"),
    mainPostId: PRODUCT_POST.id,
    mainPostTitle: PRODUCT_POST.title,
    optionType: type,
    storeParentProductId: product?.id || "",
    replacementLineId: alternative ? product?.id || "" : "",
    replacementLineDescription: alternative ? product?.description || "" : "",
    storeInstallationReplacementLineId: "",
    storeInstallationPriceInclVat: "",
    storeInstallationMode: installation ? "same" : "",
    storeInstallationQuantity: installation?.quantity || "1",
    storeInstallationUnit: installation?.unit || "timer",
    storeInstallationUnitPriceInclVat: installation?.storeUnitPriceInclVat || "",
    title: "",
    description: alternative ? "" : product?.description ? `Tillegg / oppgradering til ${product.description}` : "",
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
  if (alternative && installation) {
    option.storeInstallationReplacementLineId = installation.id;
    option.storeInstallationPriceInclVat = storeNumber(storeGrossTotal(installation));
  }
  return option;
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

function normalizePricedItem(item = {}, patch = {}) {
  const next = { ...item, ...patch };
  if (Object.prototype.hasOwnProperty.call(patch, "supplierProductNumber")) next.internalProductNumber = patch.supplierProductNumber;
  if (Object.prototype.hasOwnProperty.call(patch, "nobbNumber") && (!String(next.productUrl || "").trim() || next.storeAutoProductUrl)) {
    next.productUrl = buildNobbItemUrl(patch.nobbNumber);
    next.storeAutoProductUrl = Boolean(next.productUrl);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "productUrl") && patch.storeAutoProductUrl === false) next.storeAutoProductUrl = false;
  if (Object.prototype.hasOwnProperty.call(patch, "storeUnitPriceInclVat") || Object.prototype.hasOwnProperty.call(patch, "storeDiscountPercent")) {
    next.amount = canonicalNetUnit(next);
  }
  return next;
}

function composeLines({ products, installations, sections, metaLine, otherLines }) {
  const sectionIds = new Set(sections.map((section) => String(section.id || section.storeSectionId || "")));
  const result = [];

  sections.forEach((section) => {
    result.push({
      ...section,
      storeSectionMode: "group",
      storeSectionId: section.storeSectionId || section.id,
      description: sectionDescription(section),
      productUrl: SECTION_MARKER,
      amount: "0",
    });
    products
      .filter((product) => String(product.storeSectionId || "") === String(section.id || section.storeSectionId || ""))
      .forEach((product) => result.push(product));
  });

  products
    .filter((product) => !product.storeSectionId || !sectionIds.has(String(product.storeSectionId)))
    .forEach((product) => result.push(product));

  installations.forEach((line) => result.push(line));
  otherLines.forEach((line) => result.push(line));
  if (metaLine) result.push(metaLine);
  return result;
}

function ProductIdentityFields({ item, onPatch, titleLabel = "Varenavn *", titleField = "description" }) {
  const nobbUrl = buildNobbItemUrl(item.nobbNumber);
  return (
    <div className="store-product-grid">
      <label className="sales-field store-product-name"><span>{titleLabel}</span><input value={item[titleField] || ""} onChange={(event) => onPatch({ [titleField]: event.target.value })} placeholder="F.eks. servantskap 80 cm" /></label>
      <label className="sales-field"><span>NOBB-nr.</span><div className="store-link-field"><input value={item.nobbNumber || ""} onChange={(event) => onPatch({ nobbNumber: event.target.value })} placeholder="NOBB-nummer" autoComplete="off" />{nobbUrl ? <a href={nobbUrl} target="_blank" rel="noreferrer" title="Åpne varen direkte i NOBB"><ExternalLink size={17} /></a> : null}</div></label>
      <label className="sales-field"><span>Varenummer</span><input value={item.supplierProductNumber || item.internalProductNumber || ""} onChange={(event) => onPatch({ supplierProductNumber: event.target.value })} placeholder="Leverandørens varenummer" autoComplete="off" /></label>
      <label className="sales-field store-product-link"><span>Produktlink</span><div className="store-link-field"><input value={item.productUrl || ""} onChange={(event) => onPatch({ productUrl: event.target.value, storeAutoProductUrl: false })} placeholder="NOBB eller leverandørens produktside" inputMode="url" />{item.productUrl ? <a href={item.productUrl} target="_blank" rel="noreferrer" title="Åpne produktlink"><Link2 size={17} /></a> : null}</div></label>
    </div>
  );
}

function PriceFields({ item, onPatch, priceLabel, totalLabel = "Linjesum inkl. mva." }) {
  const unit = String(item.unit || "").toLowerCase();
  const resolvedPriceLabel = priceLabel || (unit.startsWith("time") ? "Pris pr. time inkl. mva." : "Pris pr. enhet inkl. mva.");
  const grossUnit = storeGrossUnitPrice(item);
  const grossTotal = storeGrossTotal(item);
  const hasUnitPrice = String(item.storeUnitPriceInclVat ?? "").trim() !== "";
  return (
    <div className="store-price-grid">
      <label className="sales-field"><span>Antall</span><input value={item.quantity ?? "1"} inputMode="decimal" onChange={(event) => onPatch({ quantity: event.target.value })} placeholder="1" /></label>
      <label className="sales-field"><span>Enhet</span><input value={item.unit || ""} onChange={(event) => onPatch({ unit: event.target.value })} placeholder="stk" /></label>
      <label className="sales-field"><span>{resolvedPriceLabel}</span><input value={item.storeUnitPriceInclVat ?? ""} inputMode="decimal" onChange={(event) => onPatch({ storeUnitPriceInclVat: event.target.value })} placeholder="0" />{hasUnitPrice ? <small className="store-price-net">{formatNok(netFromGross(grossUnit))} eks. mva.</small> : null}</label>
      <label className="sales-field"><span>Rabatt %</span><input value={item.storeDiscountPercent ?? ""} inputMode="decimal" onChange={(event) => onPatch({ storeDiscountPercent: event.target.value })} placeholder="0" /></label>
      <div className="store-line-total"><span>{totalLabel}</span><strong>{formatNok(grossTotal)}</strong><small>{formatNok(netFromGross(grossTotal))} eks. mva.</small></div>
    </div>
  );
}

function DropZone({ item, onFiles, onRemoveImage, onRemoveAttachment }) {
  const inputRef = useRef(null);
  return (
    <div className="store-drop-zone" onDragOver={(event) => { if (event.dataTransfer?.types?.includes("Files")) event.preventDefault(); }} onDrop={(event) => { if (!event.dataTransfer?.files?.length) return; event.preventDefault(); event.stopPropagation(); onFiles(Array.from(event.dataTransfer.files)); }}>
      <input ref={inputRef} type="file" accept="image/*,.pdf,application/pdf" multiple hidden onChange={(event) => { onFiles(Array.from(event.target.files || [])); event.target.value = ""; }} />
      <button type="button" className="sales-secondary-button" onClick={() => inputRef.current?.click()}><Paperclip size={16} /> Dra inn eller velg bilde/PDF</button>
      <span className="store-drop-help">Slipp filer direkte på dette feltet.</span>
      {item.imageDataUrl ? <div className="store-file-chip"><img src={item.imageDataUrl} alt={item.imageName || "Produktbilde"} /><span>{item.imageName || "Produktbilde"}</span><button type="button" onClick={onRemoveImage} aria-label="Fjern bilde">×</button></div> : null}
      {item.attachmentFile?.url ? <div className="store-file-chip"><FileText size={18} /><span>{item.attachmentFile.name || "PDF-vedlegg"}</span><button type="button" onClick={onRemoveAttachment} aria-label="Fjern vedlegg">×</button></div> : null}
    </div>
  );
}

function CollapsibleHeader({ title, summary, open, onToggle, onRemove, accent = false }) {
  return (
    <div className={`store-group-heading ${accent ? "is-accent" : ""}`} onClick={onToggle} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onToggle(); } }}>
      <div><strong>{title}</strong>{summary ? <span>{summary}</span> : null}</div>
      <div className="store-group-heading-actions"><span>{open ? "Lukk" : "Åpne"}</span>{onRemove ? <button type="button" className="store-icon-button" onClick={(event) => { event.stopPropagation(); onRemove(); }} aria-label={`Slett ${title}`}><Trash2 size={17} /></button> : null}</div>
    </div>
  );
}

function InstallationEditor({ item, open, onToggle, onPatch, onRemove }) {
  return (
    <article className="store-nested-card store-installation-card">
      <CollapsibleHeader title={item.description || "Montering"} summary={`${item.quantity || 1} ${item.unit || "timer"} · ${formatNok(storeGrossTotal(item))}`} open={open} onToggle={onToggle} onRemove={onRemove} />
      {open ? <div className="store-nested-body"><label className="sales-field"><span>Beskrivelse *</span><input value={item.description || ""} onChange={(event) => onPatch({ description: event.target.value })} placeholder="F.eks. Montering av varen" /></label><PriceFields item={item} onPatch={onPatch} totalLabel="Monteringssum inkl. mva." /></div> : null}
    </article>
  );
}

function OptionEditor({ option, open, onToggle, product, allProducts, installations, onPatch, onRemove, onFiles, onRemoveImage, onRemoveAttachment, renderCatalogLookup }) {
  const alternative = option.optionType === "alternative";
  const replacement = [...allProducts, ...installations].find((line) => String(line.id) === String(option.replacementLineId));
  const replacesInstallation = replacement?.mainPostId === INSTALLATION_POST.id;
  const parentInstallations = installations.filter((line) => String(line.storeParentProductId || "") === String(product?.id || ""));
  const primaryInstallation = parentInstallations[0] || null;
  const breakdown = alternative ? getStoreAlternativeBreakdown(option, [...allProducts, ...installations]) : null;
  const delta = breakdown?.totalDelta || 0;

  function setInstallationMode(mode) {
    if (!primaryInstallation) {
      onPatch({ storeInstallationMode: mode, storeInstallationReplacementLineId: "", storeInstallationPriceInclVat: "" });
      return;
    }
    if (mode === "none") {
      onPatch({ storeInstallationMode: mode, storeInstallationReplacementLineId: primaryInstallation.id, storeInstallationPriceInclVat: "0" });
      return;
    }
    if (mode === "custom") {
      const quantity = option.storeInstallationQuantity || primaryInstallation.quantity || "1";
      const unitPrice = option.storeInstallationUnitPriceInclVat || primaryInstallation.storeUnitPriceInclVat || "";
      const total = parseStoreNumber(quantity, 1) * parseStoreNumber(unitPrice, 0);
      onPatch({ storeInstallationMode: mode, storeInstallationReplacementLineId: primaryInstallation.id, storeInstallationQuantity: quantity, storeInstallationUnit: option.storeInstallationUnit || primaryInstallation.unit || "timer", storeInstallationUnitPriceInclVat: unitPrice, storeInstallationPriceInclVat: storeNumber(total) });
      return;
    }
    onPatch({ storeInstallationMode: "same", storeInstallationReplacementLineId: primaryInstallation.id, storeInstallationPriceInclVat: storeNumber(storeGrossTotal(primaryInstallation)) });
  }

  function patchCustomInstallation(patch) {
    const quantity = Object.prototype.hasOwnProperty.call(patch, "storeInstallationQuantity") ? patch.storeInstallationQuantity : option.storeInstallationQuantity || primaryInstallation?.quantity || "1";
    const unitPrice = Object.prototype.hasOwnProperty.call(patch, "storeInstallationUnitPriceInclVat") ? patch.storeInstallationUnitPriceInclVat : option.storeInstallationUnitPriceInclVat || primaryInstallation?.storeUnitPriceInclVat || "";
    const total = parseStoreNumber(quantity, 1) * parseStoreNumber(unitPrice, 0);
    onPatch({ ...patch, storeInstallationPriceInclVat: storeNumber(total) });
  }

  const summary = alternative
    ? `${option.title || "Alternativ"} · ${delta < 0 ? "Fratrekk" : delta > 0 ? "Tillegg" : "Ingen prisendring"} ${formatNok(Math.abs(delta))}`
    : `${option.title || "Opsjon"} · ${formatNok(storeGrossTotal(option))}`;

  return (
    <article className="store-nested-card store-option-card">
      <CollapsibleHeader title={alternative ? "Alternativ" : "Opsjon"} summary={summary} open={open} onToggle={onToggle} onRemove={onRemove} />
      {open ? <div className="store-nested-body">
        <div className="store-option-top-grid">
          <label className="sales-field"><span>Type opsjon</span><select value={option.optionType || "addition"} onChange={(event) => onPatch({ optionType: event.target.value })}><option value="addition">Tillegg / oppgradering</option><option value="alternative">Alternativ som erstatter</option></select></label>
          {alternative ? <label className="sales-field"><span>Erstatter *</span><select value={option.replacementLineId || ""} onChange={(event) => { const target = [...allProducts, ...installations].find((line) => String(line.id) === event.target.value); onPatch({ replacementLineId: event.target.value, replacementLineDescription: target?.description || "", storeParentProductId: target?.mainPostId === PRODUCT_POST.id ? target.id : option.storeParentProductId || "" }); }}><option value="">Velg vare eller montering</option>{allProducts.map((target) => <option key={target.id} value={target.id}>Vare: {target.description || "Uten navn"}</option>)}{installations.map((target) => <option key={target.id} value={target.id}>Montering: {target.description || "Uten navn"}</option>)}</select></label> : null}
        </div>
        {!replacesInstallation ? renderCatalogLookup?.({ kind: "option", item: option, onPatch }) : null}
        {replacesInstallation ? <><label className="sales-field"><span>Beskrivelse *</span><input value={option.title || ""} onChange={(event) => onPatch({ title: event.target.value })} placeholder="Ny monteringsløsning" /></label><PriceFields item={option} onPatch={onPatch} priceLabel="Ny monteringspris inkl. mva." totalLabel="Ny monteringssum inkl. mva." /></> : <><ProductIdentityFields item={option} onPatch={onPatch} titleLabel={alternative ? "Alternativ vare *" : "Opsjonsvare *"} titleField="title" /><PriceFields item={option} onPatch={onPatch} priceLabel={alternative ? "Pris på alternativ vare inkl. mva." : undefined} totalLabel={alternative ? "Alternativ varepris inkl. mva." : "Opsjonssum inkl. mva."} /></>}
        {alternative && !replacesInstallation ? <div className="store-option-installation-box"><strong>Montering ved alternativet</strong>{primaryInstallation ? <><span>Grunnvaren har {primaryInstallation.description || "montering"} på {formatNok(storeGrossTotal(primaryInstallation))} inkl. mva.</span><div className="store-choice-row"><button type="button" className={option.storeInstallationMode === "same" || (!option.storeInstallationMode && option.storeInstallationReplacementLineId) ? "is-selected" : ""} onClick={() => setInstallationMode("same")}>Samme montering</button><button type="button" className={option.storeInstallationMode === "custom" ? "is-selected" : ""} onClick={() => setInstallationMode("custom")}>Endre montering</button><button type="button" className={option.storeInstallationMode === "none" ? "is-selected" : ""} onClick={() => setInstallationMode("none")}>Ingen montering</button></div>{option.storeInstallationMode === "custom" ? <div className="store-installation-custom-grid"><label className="sales-field"><span>Antall</span><input value={option.storeInstallationQuantity || primaryInstallation.quantity || "1"} inputMode="decimal" onChange={(event) => patchCustomInstallation({ storeInstallationQuantity: event.target.value })} /></label><label className="sales-field"><span>Enhet</span><input value={option.storeInstallationUnit || primaryInstallation.unit || "timer"} onChange={(event) => onPatch({ storeInstallationUnit: event.target.value })} /></label><label className="sales-field"><span>Pris pr. time/enhet inkl. mva.</span><input value={option.storeInstallationUnitPriceInclVat || primaryInstallation.storeUnitPriceInclVat || ""} inputMode="decimal" onChange={(event) => patchCustomInstallation({ storeInstallationUnitPriceInclVat: event.target.value })} /></label><div className="store-line-total"><span>Monteringssum inkl. mva.</span><strong>{formatNok(parseStoreNumber(option.storeInstallationPriceInclVat, 0))}</strong></div></div> : null}</> : <span>Ingen montering er knyttet til denne varen. Legg til montering på hovedvaren først dersom alternativet skal påvirke montering.</span>}</div> : null}
        {alternative && breakdown ? <div className="store-alt-summary"><div><span>Alternativ vare</span><strong>{formatNok(breakdown.newItemTotal)} inkl. mva.</strong></div>{breakdown.hasInstallationOverride ? <div><span>Montering med alternativet</span><strong>{formatNok(breakdown.newInstallationTotal)} inkl. mva.</strong></div> : null}<div className="store-alt-summary-delta"><span>{breakdown.totalDelta < 0 ? "Kunden får fratrekk" : breakdown.totalDelta > 0 ? "Tillegg ved valg" : "Prisendring"}</span><strong>{breakdown.totalDelta < 0 ? formatNok(Math.abs(breakdown.totalDelta)) : formatStoreDelta(breakdown.totalDelta)} inkl. mva.</strong></div></div> : null}
        <label className="sales-field"><span>Beskrivelse / kundetekst</span><textarea value={option.description || ""} onChange={(event) => onPatch({ description: event.target.value, storeAutoDescription: false })} rows={2} placeholder="Valgfri forklaring til kunden" /></label>
        {!replacesInstallation ? <DropZone item={option} onFiles={onFiles} onRemoveImage={onRemoveImage} onRemoveAttachment={onRemoveAttachment} /> : null}
      </div> : null}
    </article>
  );
}

function StoreBrandSelector({ brandKey, signatureName, onBrandChange, onSignatureChange }) {
  return <section className="store-builder-section"><div className="store-section-head"><div><h2>Avsender</h2><p>Bademiljø Expo er standard. Valgt logo og saksbehandler låses med tilbudsversjonen.</p></div></div><div className="store-brand-grid">{STORE_OFFER_BRANDS.map((brand) => <label className={`store-brand-card ${brand.key === brandKey ? "is-selected" : ""}`} key={brand.key}><input type="radio" name="store-offer-brand" value={brand.key} checked={brand.key === brandKey} onChange={() => onBrandChange(brand.key)} /><img src={brand.logoUrl} alt={brand.label} /><strong>{brand.label}</strong></label>)}</div><label className="sales-field" style={{ marginTop: 14 }}><span>Saksbehandler / signatur</span><input value={signatureName} onChange={(event) => onSignatureChange(event.target.value)} placeholder="Navn på saksbehandler" /></label><div className="store-signature-preview"><span>Med vennlig hilsen</span><strong>{signatureName || "Saksbehandler"}</strong></div></section>;
}

function choiceForPayment(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  if (clean === CUSTOM_CHOICE) return "custom";
  return PAYMENT_CHOICES.includes(clean) ? clean : "custom";
}

function choiceForValidity(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  if (clean === CUSTOM_CHOICE) return "custom";
  return VALIDITY_CHOICES.includes(clean) ? clean : "custom";
}

function customFieldValue(value) {
  return String(value || "") === CUSTOM_CHOICE ? "" : String(value || "");
}

export default function SalesStoreOfferBuilderGrouped(props) {
  const { selectedRequest, offerForm, offerDraftSaveStatus, onBack, handleSaveOffer, updateOfferForm, handleOfferLineFile, removeOfferLineImage, removeOfferLineAttachment, handleOfferOptionFile, removeOfferOptionImage, removeOfferOptionAttachment, renderCatalogLookup } = props;
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateMessage, setTemplateMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [openSections, setOpenSections] = useState({});
  const [openProductId, setOpenProductId] = useState("");
  const [openNestedId, setOpenNestedId] = useState("");
  const [optionPickerProductId, setOptionPickerProductId] = useState("");
  const initializedRequestRef = useRef("");
  const requestId = String(selectedRequest?.id || "");

  const lines = Array.isArray(offerForm?.lines) ? offerForm.lines : [];
  const options = Array.isArray(offerForm?.options) ? offerForm.options : [];
  const metaLine = lines.find((line) => line?.__storeOfferMeta) || null;
  const productLines = lines.filter(isProductLine);
  const installationLines = lines.filter(isInstallationLine);
  const sections = lines.filter(isSectionLine);
  const otherLines = lines.filter((line) => !line?.__storeOfferMeta && !isProductLine(line) && !isInstallationLine(line) && !isSectionLine(line));
  const currentBrand = getStoreOfferBrand(metaLine?.brandKey || DEFAULT_STORE_OFFER_BRAND.key);
  const signatureName = String(metaLine?.signatureName || selectedRequest?.responsible || selectedRequest?.projectResponsible || "");
  const followUp = getStoreFollowUpConfig(metaLine || DEFAULT_STORE_FOLLOW_UP);
  const paymentChoice = choiceForPayment(offerForm?.paymentTerms);
  const validityChoice = choiceForValidity(offerForm?.validityDays);
  const standaloneInstallations = installationLines.filter((line) => !line.storeParentProductId || !productLines.some((product) => String(product.id) === String(line.storeParentProductId)));
  const standaloneOptions = options.filter((option) => !option.storeParentProductId && !productLines.some((product) => String(product.id) === String(option.replacementLineId || "")));

  useEffect(() => {
    if (!requestId || initializedRequestRef.current === requestId) return;
    initializedRequestRef.current = requestId;
    let nextLines = lines.map((line) => {
      if (line?.__storeOfferMeta || isSectionLine(line)) return line;
      let next = { ...line };
      if (next.nobbNumber && !String(next.productUrl || "").trim()) { next.productUrl = buildNobbItemUrl(next.nobbNumber); next.storeAutoProductUrl = true; }
      if (String(next.storeUnitPriceInclVat ?? "").trim()) next.amount = canonicalNetUnit(next);
      return next;
    });
    if (!nextLines.some((line) => line?.__storeOfferMeta)) nextLines.push(createStoreOfferMetaLine({ brandKey: DEFAULT_STORE_OFFER_BRAND.key, signatureName: selectedRequest?.responsible || selectedRequest?.projectResponsible || "", followUp: DEFAULT_STORE_FOLLOW_UP }));
    updateOfferForm("lines", nextLines);
    updateOfferForm("options", recalculateStoreOptions(options, nextLines));
  }, [requestId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { let active = true; loadStoreTextTemplates().then((items) => active && setTemplates(items)).catch(() => active && setTemplates([])); return () => { active = false; }; }, [requestId]);

  const customerAddress = [selectedRequest?.address, [selectedRequest?.postnr, selectedRequest?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const baseGrossTotal = [...productLines, ...installationLines].reduce((sum, item) => sum + storeGrossTotal(item), 0);

  function applyGroups(nextProducts = productLines, nextInstallations = installationLines, nextSections = sections) {
    const nextLines = composeLines({ products: nextProducts, installations: nextInstallations, sections: nextSections, metaLine, otherLines });
    updateOfferForm("lines", nextLines);
    updateOfferForm("options", recalculateStoreOptions(options, nextLines));
  }

  function patchProduct(id, patch) { applyGroups(productLines.map((item) => item.id === id ? normalizePricedItem(item, patch) : item)); }
  function patchInstallation(id, patch) { applyGroups(productLines, installationLines.map((item) => item.id === id ? normalizePricedItem(item, patch) : item)); }
  function patchSection(id, patch) { applyGroups(productLines, installationLines, sections.map((item) => item.id === id ? { ...item, ...patch, description: sectionDescription({ ...item, ...patch }), productUrl: SECTION_MARKER, amount: "0" } : item)); }
  function patchStoreMeta(patch) {
    const nextMeta = { ...(metaLine || createStoreOfferMetaLine({ signatureName })), ...patch };
    if (patch.brandKey) { const brand = getStoreOfferBrand(patch.brandKey); Object.assign(nextMeta, { brandKey: brand.key, brandLabel: brand.label, brandLogoUrl: brand.logoUrl }); }
    updateOfferForm("lines", composeLines({ products: productLines, installations: installationLines, sections, metaLine: nextMeta, otherLines }));
  }
  function patchOption(id, patch) {
    const nextOptions = options.map((item) => {
      if (item.id !== id) return item;
      let next = normalizePricedItem(item, patch);
      if (patch.optionType === "addition") next = { ...next, mainPostId: PRODUCT_POST.id, mainPostTitle: PRODUCT_POST.title, replacementLineId: "", replacementLineDescription: "", storeInstallationReplacementLineId: "", storeInstallationPriceInclVat: "", storeInstallationMode: "" };
      return recalculateStoreOption(next, lines);
    });
    updateOfferForm("options", nextOptions);
  }

  function addSection() {
    const section = createSectionLine();
    setActiveSectionId(section.id);
    setOpenSections((current) => ({ ...current, [section.id]: true }));
    applyGroups(productLines, installationLines, [...sections, section]);
  }
  function removeSection(id) {
    const nextProducts = productLines.map((product) => String(product.storeSectionId || "") === String(id) ? { ...product, storeSectionId: "" } : product);
    if (activeSectionId === id) setActiveSectionId("");
    applyGroups(nextProducts, installationLines, sections.filter((section) => section.id !== id));
  }
  function addProduct(sectionId = activeSectionId) {
    const line = createStoreLine(PRODUCT_POST, { storeSectionId: sectionId || "" });
    setOpenProductId(line.id);
    setOpenNestedId("");
    if (sectionId) setOpenSections((current) => ({ ...current, [sectionId]: true }));
    applyGroups([...productLines, line]);
  }
  function removeProduct(id) {
    const nextInstallations = installationLines.filter((line) => String(line.storeParentProductId || "") !== String(id));
    const nextOptions = options.filter((option) => String(option.storeParentProductId || "") !== String(id) && String(option.replacementLineId || "") !== String(id));
    updateOfferForm("options", nextOptions);
    applyGroups(productLines.filter((line) => line.id !== id), nextInstallations);
    if (openProductId === id) setOpenProductId("");
  }
  function addInstallation(product = null) {
    const line = createStoreLine(INSTALLATION_POST, { storeParentProductId: product?.id || "", description: product?.description ? `Montering av ${product.description}` : "Kun montering", unit: "timer" });
    setOpenNestedId(line.id);
    if (product) setOpenProductId(product.id);
    applyGroups(productLines, [...installationLines, line]);
  }
  function removeInstallation(id) {
    const nextOptions = options.map((option) => String(option.storeInstallationReplacementLineId || "") === String(id) ? recalculateStoreOption({ ...option, storeInstallationReplacementLineId: "", storeInstallationPriceInclVat: "", storeInstallationMode: "" }, lines.filter((line) => line.id !== id)) : option);
    updateOfferForm("options", nextOptions);
    applyGroups(productLines, installationLines.filter((line) => line.id !== id));
  }
  function addOption(product, type) {
    const linkedInstallations = installationLines.filter((line) => String(line.storeParentProductId || "") === String(product?.id || ""));
    const option = createStoreOption(product, type, linkedInstallations.length === 1 ? linkedInstallations[0] : null);
    const next = recalculateStoreOption(option, lines);
    updateOfferForm("options", [...options, next]);
    setOpenProductId(product?.id || "");
    setOpenNestedId(option.id);
    setOptionPickerProductId("");
  }
  function removeOption(id) { updateOfferForm("options", options.filter((option) => option.id !== id)); if (openNestedId === id) setOpenNestedId(""); }

  async function sendFiles(kind, id, files) { for (const file of files) { const syntheticEvent = { target: { files: [file], value: "" } }; if (kind === "line") await handleOfferLineFile?.(id, syntheticEvent); else await handleOfferOptionFile?.(id, syntheticEvent); } }

  async function refreshTemplates(nextSelectedId = "") { const items = await loadStoreTextTemplates(); setTemplates(items); setSelectedTemplateId(nextSelectedId); }
  async function saveTextTemplate() { setTemplateMessage(""); setTemplateBusy(true); try { const saved = await saveStoreTextTemplate(templateName, offerForm); await refreshTemplates(saved?.id || ""); setTemplateName(""); setTemplateMessage("✓ Tekst og vilkår er lagret som firmamal. Varer og priser er ikke med."); } catch (error) { setTemplateMessage(error?.message || "Malen kunne ikke lagres."); } finally { setTemplateBusy(false); } }
  function applySelectedTemplate() { const template = templates.find((item) => item.id === selectedTemplateId); if (!template?.payload) return; ["title", "intro", "reservations", "terms", "paymentTerms", "validityDays"].forEach((field) => { if (Object.prototype.hasOwnProperty.call(template.payload, field)) updateOfferForm(field, template.payload[field] ?? ""); }); setTemplateMessage(`✓ Malen «${template.name}» er lagt inn. Varer og priser er beholdt.`); }
  async function deleteSelectedTemplate() { if (!selectedTemplateId) return; setTemplateBusy(true); setTemplateMessage(""); try { await removeStoreTextTemplate(selectedTemplateId); await refreshTemplates(""); setTemplateMessage("Malen er slettet."); } catch (error) { setTemplateMessage(error?.message || "Malen kunne ikke slettes."); } finally { setTemplateBusy(false); } }

  function submitStoreOffer(event) {
    if (!productLines.length && !installationLines.length) { event.preventDefault(); alert("Legg inn minst én vare eller monteringspost før du lagrer tilbudet."); return; }
    const paymentTerms = String(offerForm.paymentTerms || "").trim();
    if (!paymentTerms || paymentTerms === CUSTOM_CHOICE) { event.preventDefault(); alert("Velg eller skriv betalingsbetingelser før Butikktilbudet lagres."); return; }
    const validityDays = Number.parseInt(String(offerForm.validityDays || ""), 10);
    if (!Number.isFinite(validityDays) || validityDays < 1 || validityDays > 365) { event.preventDefault(); alert("Velg gyldighet for Butikktilbudet (1–365 dager)."); return; }
    handleSaveOffer?.(event);
  }

  function buildDraftPreviewRequest() {
    const draftRequest = { ...selectedRequest, offerTitle: String(offerForm.title || "").trim(), offerIntro: String(offerForm.intro || "").trim(), offerLines: lines, offerOptions: options, offerReservations: String(offerForm.reservations || "").trim(), offerIncluded: String(offerForm.included || "").trim(), offerExcluded: String(offerForm.excluded || "").trim(), offerCustomerSupplied: String(offerForm.customerSupplied || "").trim(), offerTerms: String(offerForm.terms || "").trim(), offerPaymentTerms: customFieldValue(offerForm.paymentTerms).trim(), offerValidityDays: customFieldValue(offerForm.validityDays).trim(), offerTotal: getOfferTotal(lines), offerVersions: [], sentOfferVersionId: null, sentOfferVersionNumber: null, sentOfferAt: null };
    const snapshot = buildOfferSnapshot(draftRequest, {}, new Date().toISOString(), `store-draft-preview-${requestId || Date.now()}`);
    return { ...draftRequest, offerVersions: [snapshot], sentOfferVersionId: snapshot.id, sentOfferVersionNumber: snapshot.versionNumber, sentOfferAt: snapshot.createdAt };
  }

  if (previewOpen) {
    const previewRequest = buildDraftPreviewRequest();
    return <div className="store-draft-preview-shell"><div className="store-draft-preview-banner"><div><strong>FORHÅNDSVISNING</strong> <span>– ikke publisert, ikke sendt. Kundevalgene vises, men kan ikke registreres her.</span></div><button type="button" className="sales-secondary-button" onClick={() => setPreviewOpen(false)}><ArrowLeft size={17}/> Tilbake til redigering</button></div><SalesCustomerView mode="customer-offer" selectedRequest={previewRequest} companyProfile={{}} acceptanceForm={{ confirmed: false, name: "", selectedOptionIds: [] }} setAcceptanceForm={() => {}} toggleAcceptedOption={() => {}} handleAcceptOffer={(event) => event?.preventDefault?.()} onBack={() => setPreviewOpen(false)} /></div>;
  }

  const sectionsWithProducts = sections.map((section) => ({ section, products: productLines.filter((product) => String(product.storeSectionId || "") === String(section.id)) }));
  const unsectionedProducts = productLines.filter((product) => !product.storeSectionId || !sections.some((section) => String(section.id) === String(product.storeSectionId)));

  function renderProduct(product, globalIndex) {
    const productOpen = openProductId === product.id;
    const productInstallations = installationLines.filter((line) => String(line.storeParentProductId || "") === String(product.id));
    const productOptions = options.filter((option) => String(option.storeParentProductId || "") === String(product.id) || String(option.replacementLineId || "") === String(product.id));
    const productSummary = `${product.description || "Uten varenavn"} · ${formatNok(storeGrossTotal(product))} · ${productInstallations.length ? `${productInstallations.length} montering` : "ingen montering"} · ${productOptions.length ? `${productOptions.length} opsjon` : "ingen opsjon"}`;
    return <article key={product.id} className={`store-product-container ${productOpen ? "is-open" : ""}`}>
      <CollapsibleHeader title={`Vare ${globalIndex + 1}`} summary={productSummary} open={productOpen} onToggle={() => { setOpenProductId(productOpen ? "" : product.id); if (!productOpen) setActiveSectionId(product.storeSectionId || ""); }} onRemove={() => removeProduct(product.id)} accent={productOpen} />
      {productOpen ? <div className="store-product-body">
        {renderCatalogLookup?.({ kind: "line", item: product, onPatch: (patch) => patchProduct(product.id, patch) })}
        <ProductIdentityFields item={product} onPatch={(patch) => patchProduct(product.id, patch)} />
        <PriceFields item={product} onPatch={(patch) => patchProduct(product.id, patch)} />
        <DropZone item={product} onFiles={(files) => sendFiles("line", product.id, files)} onRemoveImage={() => removeOfferLineImage?.(product.id)} onRemoveAttachment={() => removeOfferLineAttachment?.(product.id)} />
        <div className="store-product-actions"><button type="button" className="sales-secondary-button" onClick={() => addInstallation(product)}><Wrench size={16}/> Montering på denne varen</button><button type="button" className="sales-secondary-button" onClick={() => setOptionPickerProductId((current) => current === product.id ? "" : product.id)}><Plus size={16}/> Opsjon på denne varen</button></div>
        {optionPickerProductId === product.id ? <div className="store-option-picker"><strong>Velg type opsjon</strong><button type="button" onClick={() => addOption(product, "addition")}>Tillegg / oppgradering</button><button type="button" onClick={() => addOption(product, "alternative")}>Alternativ som erstatter denne varen</button></div> : null}
        {productInstallations.length || productOptions.length ? <div className="store-product-children">
          {productInstallations.map((installation) => <InstallationEditor key={installation.id} item={installation} open={openNestedId === installation.id} onToggle={() => setOpenNestedId(openNestedId === installation.id ? "" : installation.id)} onPatch={(patch) => patchInstallation(installation.id, patch)} onRemove={() => removeInstallation(installation.id)} />)}
          {productOptions.map((option) => <OptionEditor key={option.id} option={option} open={openNestedId === option.id} onToggle={() => setOpenNestedId(openNestedId === option.id ? "" : option.id)} product={product} allProducts={productLines} installations={installationLines} onPatch={(patch) => patchOption(option.id, patch)} onRemove={() => removeOption(option.id)} onFiles={(files) => sendFiles("option", option.id, files)} onRemoveImage={() => removeOfferOptionImage?.(option.id)} onRemoveAttachment={() => removeOfferOptionAttachment?.(option.id)} renderCatalogLookup={renderCatalogLookup} />)}
        </div> : null}
      </div> : null}
    </article>;
  }

  let runningIndex = 0;

  return (
    <div className="sales-app store-offer-builder-app store-grouped-builder">
      <style>{`
        .store-grouped-builder .sales-shell{max-width:1180px}.store-grouped-builder .sales-form-panel{display:grid;gap:18px}.store-builder-section{border:1px solid #d7e4ea;border-radius:18px;padding:18px;background:#fff}.store-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.store-section-head h2{margin:0 0 4px;font-size:22px}.store-section-head p{margin:0;color:#60727a}
        .store-workspace{display:grid;gap:14px}.store-room{border:1px solid #cddfe5;border-radius:18px;background:#f8fcfd;overflow:hidden}.store-room.is-active{border-color:#16aeb9;box-shadow:0 0 0 3px rgba(22,174,185,.08)}.store-room-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;background:#eef8fa;cursor:pointer}.store-room-title{display:grid;gap:4px;min-width:0}.store-room-title input{font:inherit;font-size:18px;font-weight:900;border:0;background:transparent;min-width:180px;outline:none}.store-room-title textarea{font:inherit;border:0;background:transparent;resize:vertical;color:#60727a;min-height:28px;outline:none}.store-room-actions{display:flex;gap:8px;align-items:center}.store-room-body{display:grid;gap:12px;padding:14px}.store-room-add{justify-self:start}
        .store-product-container{border:1px solid #d7e4ea;border-radius:16px;background:#fff;overflow:hidden}.store-product-container.is-open{border:2px solid #16aeb9;box-shadow:0 0 0 3px rgba(22,174,185,.08)}.store-group-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;cursor:pointer;background:#fff}.store-group-heading.is-accent{background:#f2fbfc}.store-group-heading>div:first-child{display:grid;gap:3px;min-width:0}.store-group-heading>div:first-child>span{color:#60727a;font-size:13px;font-weight:650;white-space:normal}.store-group-heading-actions{display:flex;align-items:center;gap:8px;color:#60727a;font-size:12px;font-weight:800}.store-icon-button{border:0;background:#f9efef;border-radius:50%;width:34px;height:34px;display:grid;place-items:center;cursor:pointer;color:#9b3f3f}.store-product-body{display:grid;gap:12px;padding:14px;border-top:1px solid #dce8ec}.store-product-actions{display:flex;gap:8px;flex-wrap:wrap;padding-top:4px}.store-option-picker{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px;border:1px solid #cddfe5;border-radius:12px;background:#f7fbfc}.store-option-picker button,.store-choice-row button{border:1px solid #bcd0d7;border-radius:9px;background:#fff;padding:8px 10px;font-weight:750;cursor:pointer}.store-choice-row button.is-selected{border-color:#16aeb9;background:#eafafb;color:#09666e}.store-product-children{display:grid;gap:9px;padding:10px;border-radius:14px;background:#f5f9fa}.store-nested-card{border:1px solid #d9e5ea;border-radius:13px;background:#fff;overflow:hidden}.store-nested-body{display:grid;gap:12px;padding:12px;border-top:1px solid #e1e9ec}.store-installation-card{background:#fffdf8}.store-option-card{background:#f9fbff}
        .store-product-grid{display:grid;grid-template-columns:1.6fr .8fr .9fr 1.5fr;gap:12px}.store-option-top-grid{display:grid;grid-template-columns:1fr 1.5fr;gap:12px}.store-link-field{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px}.store-link-field a{display:grid;place-items:center;width:38px;height:38px;border:1px solid #cbdbe2;border-radius:10px}.store-price-grid{display:grid;grid-template-columns:.7fr .7fr 1.25fr .8fr 1.2fr;gap:12px;align-items:end}.store-price-net{display:block;margin-top:4px;color:#667780;font-size:12px;font-weight:650}.store-line-total{min-height:72px;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;padding:9px 11px;border-radius:12px;background:#eef8fa}.store-line-total span{font-size:12px;color:#5e737b;font-weight:700}.store-line-total strong{font-size:18px}.store-drop-zone{padding:10px;border:1px dashed #9fc3cc;border-radius:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#fff}.store-drop-help{color:#65767d;font-size:13px}.store-file-chip{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;background:#f0f7f8}.store-file-chip img{width:48px;height:48px;border-radius:8px;object-fit:contain}.store-file-chip button{border:0;background:transparent;font-size:20px;cursor:pointer}
        .store-option-installation-box{display:grid;gap:8px;padding:12px;border:1px solid #e5d7ad;border-radius:12px;background:#fffaf0}.store-option-installation-box>span{font-size:13px;color:#6d6250}.store-choice-row{display:flex;gap:7px;flex-wrap:wrap}.store-installation-custom-grid{display:grid;grid-template-columns:.7fr .7fr 1.3fr 1.2fr;gap:10px;align-items:end}.store-alt-summary{padding:12px 14px;border-radius:12px;background:#edf9fa;display:flex;gap:24px;align-items:center;flex-wrap:wrap}.store-alt-summary>div{display:grid;gap:3px}.store-alt-summary span{font-size:12px;color:#60727a;font-weight:700}.store-alt-summary strong{font-size:16px}.store-alt-summary-delta{margin-left:auto;text-align:right}.store-standalone{display:grid;gap:10px}.store-workbar{position:sticky;bottom:12px;z-index:40;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:10px;border:1px solid #c7d9df;border-radius:16px;background:rgba(255,255,255,.96);box-shadow:0 12px 32px rgba(15,23,42,.18);backdrop-filter:blur(8px)}.store-workbar button{min-height:42px}.store-summary{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:16px 18px;border-radius:16px;background:#0f172a;color:#fff}.store-summary-price{display:grid;gap:2px}.store-summary strong{font-size:24px}.store-summary small{color:#d7e2e7;font-weight:650}.store-summary-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.store-terms-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.store-follow-up-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}.store-follow-up-toggle{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid #d7e4ea;border-radius:12px;background:#f8fbfc;font-weight:800}.store-template-grid{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}.store-brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.store-brand-card{position:relative;display:grid;gap:10px;padding:14px;border:2px solid #d8e3e8;border-radius:14px;cursor:pointer;background:#fff}.store-brand-card.is-selected{border-color:#16aeb9;box-shadow:0 0 0 3px rgba(22,174,185,.1)}.store-brand-card input{position:absolute;top:10px;right:10px}.store-brand-card img{width:100%;height:72px;object-fit:contain;object-position:left center}.store-signature-preview{margin-top:12px;padding:12px 14px;border-left:3px solid #16aeb9;display:grid;gap:3px}.store-template-message{margin:8px 0 0;color:#42606b;font-weight:650}.store-empty{padding:14px;border:1px dashed #c5d7dd;border-radius:12px;color:#61737a;text-align:center}.store-draft-preview-banner{position:sticky;top:0;z-index:25000;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 18px;background:#fff8d9;border-bottom:1px solid #ead78d;color:#493d11;font-weight:800}
        @media(max-width:900px){.store-product-grid,.store-price-grid,.store-terms-grid,.store-follow-up-grid,.store-installation-custom-grid{grid-template-columns:1fr 1fr}.store-product-link,.store-product-name{grid-column:1/-1}}
        @media(max-width:620px){.store-product-grid,.store-price-grid,.store-terms-grid,.store-follow-up-grid,.store-brand-grid,.store-template-grid,.store-option-top-grid,.store-installation-custom-grid{grid-template-columns:1fr}.store-section-head,.store-summary,.store-draft-preview-banner{align-items:stretch;flex-direction:column}.store-line-total{align-items:flex-start}.store-alt-summary-delta{margin-left:0;text-align:left}.store-summary-actions{justify-content:stretch}.store-summary-actions button,.store-workbar button{width:100%}.store-workbar{position:sticky;bottom:6px}.store-room-head{align-items:flex-start;flex-direction:column}.store-room-actions{width:100%}}
      `}</style>
      <div className="sales-shell">
        <header className="sales-header"><button className="sales-back-button" type="button" onClick={onBack}><ArrowLeft size={18}/> Tilbake</button><div className="sales-brand sales-brand-compact"><div className="sales-brand-mark"><PackagePlus size={22}/></div><div className="sales-brand-copy"><strong>Expo ProffDok</strong><span>Butikktilbud / Varesalg</span></div></div></header>
        <main className="sales-main">
          <section className="sales-form-hero"><p className="sales-eyebrow">Butikktilbud</p><h1 className="sales-title">Varer, montering og opsjoner</h1><p className="sales-subtitle">{selectedRequest?.customer} · {customerAddress} · {selectedRequest?.id}</p><p className="sales-subtitle" style={{marginTop:8}}>{offerDraftSaveStatus === "saving" ? "Lagrer på server …" : offerDraftSaveStatus === "saved" ? "✓ Lagret på server." : "Kladden lagres automatisk."}</p></section>
          <form className="sales-form-panel" onSubmit={submitStoreOffer} onKeyDown={(event) => { if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault(); }}>
            <StoreBrandSelector brandKey={currentBrand.key} signatureName={signatureName} onBrandChange={(brandKey) => patchStoreMeta({ brandKey })} onSignatureChange={(name) => patchStoreMeta({ signatureName: name })} />
            <section className="store-builder-section"><div className="store-section-head"><div><h2>Tilbudstekst og vilkår</h2><p>Betalingsbetingelser og gyldighet er obligatoriske i Butikktilbud.</p></div></div><div className="store-template-grid"><label className="sales-field"><span>Malnavn</span><input value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="F.eks. Standard butikktilbud" /></label><button type="button" className="sales-secondary-button" disabled={!templateName.trim() || templateBusy} onClick={saveTextTemplate}><Save size={17}/> Lagre tekst og vilkår som mal</button></div>{templates.length ? <div className="store-template-grid" style={{marginTop:12}}><label className="sales-field"><span>Bruk eksisterende mal</span><select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)}><option value="">Velg mal</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" className="sales-secondary-button" disabled={!selectedTemplateId || templateBusy} onClick={applySelectedTemplate}>Bruk mal</button><button type="button" className="sales-secondary-button" disabled={!selectedTemplateId || templateBusy} onClick={deleteSelectedTemplate}>Slett mal</button></div></div> : null}{templateMessage ? <p className="store-template-message">{templateMessage}</p> : null}<div className="sales-form-grid" style={{marginTop:14}}><label className="sales-field sales-field-full"><span>Overskrift</span><input value={offerForm.title || ""} onChange={(event) => updateOfferForm("title", event.target.value)} /></label><label className="sales-field sales-field-full"><span>Kort innledning</span><textarea value={offerForm.intro || ""} onChange={(event) => updateOfferForm("intro", event.target.value)} rows={3}/></label><label className="sales-field sales-field-full"><span>Vilkår / betingelser</span><textarea value={offerForm.terms || ""} onChange={(event) => updateOfferForm("terms", event.target.value)} rows={4}/></label><label className="sales-field sales-field-full"><span>Forbehold / merknader</span><textarea value={offerForm.reservations || ""} onChange={(event) => updateOfferForm("reservations", event.target.value)} rows={3}/></label></div><div className="store-terms-grid" style={{marginTop:12}}><label className="sales-field"><span>Betalingsbetingelser *</span><select value={paymentChoice} onChange={(event) => { const value = event.target.value; if (!value) updateOfferForm("paymentTerms", ""); else if (value === "custom") updateOfferForm("paymentTerms", CUSTOM_CHOICE); else updateOfferForm("paymentTerms", value); }} required><option value="">Velg betalingsbetingelser</option>{PAYMENT_CHOICES.map((item) => <option key={item} value={item}>{item}</option>)}<option value="custom">Egendefinert</option></select>{paymentChoice === "custom" ? <input style={{marginTop:8}} value={customFieldValue(offerForm.paymentTerms)} onChange={(event) => updateOfferForm("paymentTerms", event.target.value || CUSTOM_CHOICE)} required /> : null}</label><label className="sales-field"><span>Gyldighet *</span><select value={validityChoice} onChange={(event) => { const value = event.target.value; if (!value) updateOfferForm("validityDays", ""); else if (value === "custom") updateOfferForm("validityDays", CUSTOM_CHOICE); else updateOfferForm("validityDays", value); }} required><option value="">Velg gyldighet</option>{VALIDITY_CHOICES.map((item) => <option key={item} value={item}>{item} dager</option>)}<option value="custom">Egendefinert</option></select>{validityChoice === "custom" ? <input style={{marginTop:8}} value={customFieldValue(offerForm.validityDays)} onChange={(event) => updateOfferForm("validityDays", event.target.value || CUSTOM_CHOICE)} inputMode="numeric" required /> : null}</label></div></section>
            <section className="store-builder-section"><div className="store-section-head"><div><h2>Automatisk oppfølging</h2><p>Påminnelser stopper ved aksept, avvisning eller utløpt gyldighet.</p></div></div><label className="store-follow-up-toggle"><input type="checkbox" checked={followUp.enabled} onChange={(event) => patchStoreMeta({ followUpEnabled: event.target.checked })}/> Send automatiske påminnelser dersom kunden ikke har svart</label>{followUp.enabled ? <div className="store-follow-up-grid" style={{marginTop:12}}><label className="sales-field"><span>Første påminnelse etter *</span><input type="number" min="1" max="90" value={metaLine?.followUpFirstDays ?? followUp.firstDays} onChange={(event) => patchStoreMeta({ followUpFirstDays: event.target.value })}/></label><label className="sales-field"><span>Gjenta hver *</span><input type="number" min="1" max="90" value={metaLine?.followUpRepeatDays ?? followUp.repeatDays} onChange={(event) => patchStoreMeta({ followUpRepeatDays: event.target.value })}/></label><label className="sales-field"><span>Maks antall *</span><input type="number" min="1" max="10" value={metaLine?.followUpMaxReminders ?? followUp.maxReminders} onChange={(event) => patchStoreMeta({ followUpMaxReminders: event.target.value })}/></label></div> : null}</section>
            <section className="store-builder-section"><div className="store-section-head"><div><h2>Varer og avsnitt</h2><p>Samle varer under f.eks. Bad 1, Bad 2, Vaskerom eller WC. Montering og opsjoner ligger på hovedvaren.</p></div></div><div className="store-workspace">
              {sectionsWithProducts.map(({section,products}) => { const roomOpen = openSections[section.id] !== false; const roomActive = activeSectionId === section.id; return <article key={section.id} className={`store-room ${roomActive ? "is-active" : ""}`}><div className="store-room-head" onClick={() => { setActiveSectionId(section.id); setOpenSections((current) => ({...current,[section.id]:!roomOpen})); }}><div className="store-room-title" onClick={(event) => event.stopPropagation()}><input value={section.storeTextTitle || ""} onFocus={() => setActiveSectionId(section.id)} onChange={(event) => patchSection(section.id,{storeTextTitle:event.target.value})} placeholder="F.eks. Bad 1"/><textarea value={section.storeTextBody || ""} onFocus={() => setActiveSectionId(section.id)} onChange={(event) => patchSection(section.id,{storeTextBody:event.target.value})} rows={1} placeholder="Valgfri kort tekst til kunden"/></div><div className="store-room-actions"><button type="button" className="sales-secondary-button" onClick={(event) => {event.stopPropagation();addProduct(section.id);}}><Plus size={16}/> Vare</button><button type="button" className="store-icon-button" onClick={(event) => {event.stopPropagation();removeSection(section.id);}}><Trash2 size={16}/></button></div></div>{roomOpen ? <div className="store-room-body">{products.length ? products.map((product) => { const rendered=renderProduct(product,runningIndex); runningIndex+=1; return rendered; }) : <div className="store-empty">Ingen varer i dette avsnittet ennå.</div>}<button type="button" className="sales-secondary-button store-room-add" onClick={() => addProduct(section.id)}><Plus size={16}/> Legg til vare i {section.storeTextTitle || "avsnittet"}</button></div> : null}</article>; })}
              {unsectionedProducts.length ? <article className="store-room"><div className="store-room-head" onClick={() => setActiveSectionId("")}><div className="store-room-title"><strong>Uten avsnitt</strong><span>Varer som ikke er plassert i Bad 1, Bad 2 osv.</span></div></div><div className="store-room-body">{unsectionedProducts.map((product) => { const rendered=renderProduct(product,runningIndex); runningIndex+=1; return rendered; })}</div></article> : null}
              {!productLines.length && !sections.length ? <div className="store-empty">Start med et avsnitt eller legg til første vare.</div> : null}
            </div></section>
            {standaloneInstallations.length ? <section className="store-builder-section"><div className="store-section-head"><div><h2>Kun montering</h2><p>Montering som ikke hører til en bestemt vare.</p></div></div><div className="store-standalone">{standaloneInstallations.map((line) => <InstallationEditor key={line.id} item={line} open={openNestedId === line.id} onToggle={() => setOpenNestedId(openNestedId === line.id ? "" : line.id)} onPatch={(patch) => patchInstallation(line.id,patch)} onRemove={() => removeInstallation(line.id)}/>)}</div></section> : null}
            {standaloneOptions.length ? <section className="store-builder-section"><div className="store-section-head"><div><h2>Andre opsjoner</h2><p>Eldre eller frittstående opsjoner uten kobling til en hovedvare.</p></div></div><div className="store-standalone">{standaloneOptions.map((option) => <OptionEditor key={option.id} option={option} open={openNestedId === option.id} onToggle={() => setOpenNestedId(openNestedId === option.id ? "" : option.id)} product={null} allProducts={productLines} installations={installationLines} onPatch={(patch) => patchOption(option.id,patch)} onRemove={() => removeOption(option.id)} onFiles={(files) => sendFiles("option",option.id,files)} onRemoveImage={() => removeOfferOptionImage?.(option.id)} onRemoveAttachment={() => removeOfferOptionAttachment?.(option.id)} renderCatalogLookup={renderCatalogLookup}/>)}</div></section> : null}
            <div className="store-workbar"><button type="button" className="sales-primary-button" onClick={() => addProduct(activeSectionId)}><Plus size={17}/> Legg til vare</button><button type="button" className="sales-secondary-button" onClick={addSection}><Plus size={17}/> Legg til avsnitt</button><button type="button" className="sales-secondary-button" onClick={() => addInstallation(null)}><Wrench size={17}/> Kun montering</button></div>
            <div className="store-summary"><div className="store-summary-price"><span>Grunnsum varer + montering</span><strong>{formatNok(baseGrossTotal)} inkl. mva.</strong><small>{formatNok(netFromGross(baseGrossTotal))} eks. mva.</small><small>Opsjoner kommer i tillegg eller erstatter grunnpakken.</small></div><div className="store-summary-actions"><button type="button" className="sales-secondary-button" onClick={() => setPreviewOpen(true)} disabled={!productLines.length && !installationLines.length}><Eye size={18}/> Forhåndsvis kundetilbud</button><button type="submit" className="sales-primary-button" data-sales-save-offer-button="true"><Save size={18}/> Lagre butikktilbud</button></div></div>
          </form>
        </main>
      </div>
    </div>
  );
}
