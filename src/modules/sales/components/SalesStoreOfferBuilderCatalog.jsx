// Expo ProffDok – FASE 39B.2C
// Tynn katalog-wrapper rundt grouped Butikktilbud-bygger.
// Katalogens nettopris kopieres aldri til offerForm/kundevisning.
// Server-autosave lagrer kun aktuell Butikktilbud-sak.
// Tilbudet bruker generiske poster; vareregisteret er kun et valgfritt oppslagsverktøy.

import { useEffect, useRef, useState } from "react";
import SalesStoreOfferBuilderGrouped from "./SalesStoreOfferBuilderGrouped.jsx";
import { StoreCatalogInlineLookup } from "../../storeCatalog/StoreCatalogOfferTools.jsx";
import { persistStoreOfferDraft } from "../services/salesStoreOfferAutosave.js";
import { buildNobbItemUrl } from "../utils/salesStoreOfferPricing.js";

const SECTION_MARKER = "#expo-store-text-block";
const SECTION_LINE_TYPE = "store_text";

function cleanText(value) {
  return String(value || "").trim();
}

function isSectionCandidate(line = {}) {
  return Boolean(
    line?.lineType === SECTION_LINE_TYPE ||
      line?.storeSectionMode === "group" ||
      cleanText(line?.productUrl) === SECTION_MARKER ||
      String(line?.id || "").startsWith("store-section-")
  );
}

function normalizeSectionLine(line = {}) {
  if (!isSectionCandidate(line)) return line;

  let title = cleanText(line.storeTextTitle);
  let body = cleanText(line.storeTextBody);

  // Tidlige 39B.2C-kladdar brukte «Nytt avsnitt» som fast tittel og lot
  // brukeren skrive det egentlige avsnittsnavnet i feltet under.
  if (title === "Nytt avsnitt" && body) {
    title = body;
    body = "";
  } else if (title === "Nytt avsnitt") {
    title = "";
  }

  const description = [title, body].filter(Boolean).join("\n");
  const alreadyNormalized =
    line.lineType === SECTION_LINE_TYPE &&
    line.storeSectionMode === "group" &&
    cleanText(line.storeTextTitle) === title &&
    cleanText(line.storeTextBody) === body &&
    cleanText(line.description) === description &&
    cleanText(line.productUrl) === SECTION_MARKER &&
    String(line.amount ?? "") === "0" &&
    String(line.quantity ?? "") === "0" &&
    String(line.unit || "") === "";

  if (alreadyNormalized) return line;

  return {
    ...line,
    lineType: SECTION_LINE_TYPE,
    storeSectionMode: "group",
    storeSectionId: line.storeSectionId || line.id,
    storeTextTitle: title,
    storeTextBody: body,
    description,
    productUrl: SECTION_MARKER,
    amount: "0",
    quantity: "0",
    unit: "",
  };
}

function catalogFields(item = {}) {
  const supplierProductNumber = String(item.supplier_product_number || "").trim();
  const nobbNumber = String(item.nobb_number || "").trim();
  const productUrl =
    String(item.product_url || "").trim() || buildNobbItemUrl(nobbNumber);
  const inclVat = Number(item.customer_price_incl_vat || 0);
  const exVat = Number(item.customer_price_ex_vat || 0);

  return {
    description: String(item.description || "").trim(),
    nobbNumber,
    supplierProductNumber,
    internalProductNumber: supplierProductNumber,
    storeUnitPriceInclVat: Number.isFinite(inclVat) ? String(inclVat) : "",
    storeDiscountPercent: "",
    amount: Number.isFinite(exVat) ? String(exVat) : "",
    productUrl,
    storeAutoProductUrl: Boolean(
      nobbNumber && productUrl === buildNobbItemUrl(nobbNumber)
    ),
    storeCatalogItemId: String(item.id || ""),
    storeCatalogGtin: String(item.gtin || ""),
  };
}

function catalogOptionFields(item = {}) {
  const fields = catalogFields(item);
  const { description, ...shared } = fields;
  return { ...shared, title: description };
}

function compactAttachment(file) {
  if (!file) return null;
  return {
    id: file.id || "",
    name: file.name || "",
    path: file.path || "",
    url: file.url || "",
    size: Number(file.size || 0),
  };
}

function compactAutosaveRow(item = {}) {
  return {
    ...item,
    imageDataUrl: item.imageDataUrl
      ? `image:${String(item.imageDataUrl).length}`
      : "",
    attachmentFile: compactAttachment(item.attachmentFile),
  };
}

function createStoreAutosaveSignature(form = {}) {
  return JSON.stringify({
    title: form.title || "",
    intro: form.intro || "",
    reservations: form.reservations || "",
    included: form.included || "",
    excluded: form.excluded || "",
    customerSupplied: form.customerSupplied || "",
    terms: form.terms || "",
    paymentTerms: form.paymentTerms || "",
    validityDays: form.validityDays || "",
    lines: (Array.isArray(form.lines) ? form.lines : []).map(compactAutosaveRow),
    options: (Array.isArray(form.options) ? form.options : []).map(
      compactAutosaveRow
    ),
  });
}

function setOwnText(element, nextText) {
  if (!(element instanceof Element)) return;
  const directText = Array.from(element.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && cleanText(node.textContent)
  );
  if (directText) {
    if (cleanText(directText.textContent) !== nextText) {
      directText.textContent = ` ${nextText}`;
    }
    return;
  }
  if (cleanText(element.textContent) !== nextText) element.textContent = nextText;
}

function rewriteEditorTerminology(root) {
  if (!(root instanceof Element)) return;
  const editor = root.querySelector(".store-grouped-builder");
  if (!editor) return;

  const heroTitle = editor.querySelector(".sales-form-hero .sales-title");
  if (cleanText(heroTitle?.textContent) === "Varer, montering og opsjoner") {
    heroTitle.textContent = "Tilbudsposter, montering og opsjoner";
  }

  editor.querySelectorAll(".store-section-head h2").forEach((heading) => {
    if (cleanText(heading.textContent) === "Varer og avsnitt") {
      heading.textContent = "Tilbudsposter og avsnitt";
    }
  });

  editor.querySelectorAll(".store-section-head p").forEach((paragraph) => {
    const text = cleanText(paragraph.textContent);
    if (text.startsWith("Bruk avsnitt som rom eller leveranseområder")) {
      paragraph.textContent =
        "Bruk avsnitt som rom eller leveranseområder, f.eks. Varmepumpe, Bad 1, Elektriker eller Vaskerom. Poster kan være varer, servicearbeid, fagarbeid eller andre leveranser. Montering og opsjoner kan knyttes til hovedposten.";
    }
  });

  editor.querySelectorAll(".store-group-heading strong").forEach((title) => {
    const text = cleanText(title.textContent);
    const match = text.match(/^Vare\s+(\d+)$/);
    if (match) title.textContent = `Post ${match[1]}`;
  });

  editor.querySelectorAll("button").forEach((button) => {
    const text = cleanText(button.textContent);
    if (text === "Vare") setOwnText(button, "Post");
    else if (text === "Legg til vare") setOwnText(button, "Legg til post");
    else if (text.startsWith("Legg til vare i ")) {
      setOwnText(button, text.replace(/^Legg til vare i /, "Legg til post i "));
    } else if (text === "Montering på denne varen") {
      setOwnText(button, "Montering på denne posten");
    } else if (text === "Opsjon på denne varen") {
      setOwnText(button, "Opsjon på denne posten");
    } else if (text === "Alternativ som erstatter denne varen") {
      setOwnText(button, "Alternativ som erstatter denne posten");
    }
  });

  editor.querySelectorAll(".sales-field > span").forEach((label) => {
    const text = cleanText(label.textContent);
    const replacements = new Map([
      ["Varenavn *", "Post / beskrivelse *"],
      ["Alternativ vare *", "Alternativ post *"],
      ["Opsjonsvare *", "Opsjon / beskrivelse *"],
      ["Pris på alternativ vare inkl. mva.", "Pris på alternativ inkl. mva."],
    ]);
    if (replacements.has(text)) label.textContent = replacements.get(text);
  });

  editor.querySelectorAll(".store-line-total > span").forEach((label) => {
    if (cleanText(label.textContent) === "Alternativ varepris inkl. mva.") {
      label.textContent = "Alternativ pris inkl. mva.";
    }
  });

  editor.querySelectorAll("[data-store-product-title]").forEach((input) => {
    if (input instanceof HTMLInputElement) {
      input.placeholder =
        "F.eks. varmepumpe, elektriker, avfallshåndtering eller produkt";
    }
  });

  editor.querySelectorAll(".store-empty").forEach((message) => {
    const text = cleanText(message.textContent);
    if (text === "Ingen varer i dette avsnittet ennå.") {
      message.textContent = "Ingen poster i dette avsnittet ennå.";
    } else if (text === "Start med et avsnitt eller legg til første vare.") {
      message.textContent = "Start med et avsnitt eller legg til første post.";
    }
  });

  editor.querySelectorAll(".store-room-title > span").forEach((message) => {
    const text = cleanText(message.textContent);
    if (text === "Varer som ikke er plassert i et rom eller leveranseområde.") {
      message.textContent =
        "Poster som ikke er plassert i et rom eller leveranseområde.";
    }
  });

  editor.querySelectorAll(".store-summary-price > span").forEach((label) => {
    if (cleanText(label.textContent) === "Grunnsum varer + montering") {
      label.textContent = "Grunnsum poster + montering";
    }
  });

  editor.querySelectorAll("option").forEach((option) => {
    const text = cleanText(option.textContent);
    if (text.startsWith("Vare: ")) {
      option.textContent = text.replace(/^Vare: /, "Post: ");
    }
  });

  editor.querySelectorAll(".store-option-installation-box span").forEach((span) => {
    const text = cleanText(span.textContent);
    if (text.startsWith("Grunnvaren har ")) {
      span.textContent = text.replace(/^Grunnvaren har /, "Grunnposten har ");
    }
    if (text.startsWith("Ingen montering er knyttet til denne varen.")) {
      span.textContent = text
        .replace("denne varen", "denne posten")
        .replace("hovedvaren", "hovedposten");
    }
  });
}

export default function SalesStoreOfferBuilderCatalog(props) {
  const rawLines = Array.isArray(props.offerForm?.lines)
    ? props.offerForm.lines
    : [];
  const requestId = String(props.selectedRequest?.id || "");
  const repairedLines = rawLines.map(normalizeSectionLine);
  const sectionRepairNeeded = repairedLines.some(
    (line, index) => line !== rawLines[index]
  );
  const repairedOfferForm = sectionRepairNeeded
    ? { ...(props.offerForm || {}), lines: repairedLines }
    : props.offerForm;
  const sectionRepairSignature = sectionRepairNeeded
    ? repairedLines
        .filter(isSectionCandidate)
        .map((line) =>
          [
            line.id,
            line.lineType,
            line.storeTextTitle,
            line.storeTextBody,
            line.description,
          ].join("|")
        )
        .join("||")
    : "";

  const [storeDraftSaveStatus, setStoreDraftSaveStatus] = useState("idle");
  const autosaveTimerRef = useRef(null);
  const autosaveRequestRef = useRef(requestId);
  const autosaveSignatureRef = useRef(
    createStoreAutosaveSignature(repairedOfferForm || {})
  );
  const editorRootRef = useRef(null);

  useEffect(() => {
    if (!sectionRepairNeeded) return;
    props.updateOfferForm?.("lines", repairedLines);
  }, [requestId, sectionRepairSignature]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const root = editorRootRef.current;
    if (!root) return undefined;
    const rewrite = () => rewriteEditorTerminology(root);
    const observer = new MutationObserver(rewrite);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    rewrite();
    return () => observer.disconnect();
  }, [requestId]);

  useEffect(() => {
    const nextSignature = createStoreAutosaveSignature(repairedOfferForm || {});
    if (!requestId) return undefined;

    if (autosaveRequestRef.current !== requestId) {
      autosaveRequestRef.current = requestId;
      autosaveSignatureRef.current = nextSignature;
      setStoreDraftSaveStatus("idle");
      return undefined;
    }
    if (autosaveSignatureRef.current === nextSignature) return undefined;

    autosaveSignatureRef.current = nextSignature;
    setStoreDraftSaveStatus("idle");
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = window.setTimeout(() => {
      setStoreDraftSaveStatus("saving");
      void persistStoreOfferDraft(props.selectedRequest, repairedOfferForm)
        .then(() => setStoreDraftSaveStatus("saved"))
        .catch((error) => {
          console.error("Kunne ikke mellomlagre Butikktilbud varig", error);
          setStoreDraftSaveStatus("error");
        });
    }, 850);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [requestId, repairedOfferForm, props.selectedRequest]);

  function renderCatalogLookup({ kind, onPatch }) {
    const option = kind === "option";
    return (
      <StoreCatalogInlineLookup
        placeholder={
          option
            ? "Søk vare til opsjonen: varenavn, varenummer eller GTIN/EAN"
            : "Valgfritt varesøk: varenavn, varenummer eller GTIN/EAN"
        }
        onUse={(item) =>
          onPatch(option ? catalogOptionFields(item) : catalogFields(item))
        }
      />
    );
  }

  const visibleSaveStatus =
    storeDraftSaveStatus === "idle"
      ? props.offerDraftSaveStatus
      : storeDraftSaveStatus;

  return (
    <div ref={editorRootRef}>
      <SalesStoreOfferBuilderGrouped
        {...props}
        offerForm={repairedOfferForm}
        offerDraftSaveStatus={visibleSaveStatus}
        renderCatalogLookup={renderCatalogLookup}
      />
    </div>
  );
}
