// Expo ProffDok – FASE 45B
// Additiv wrapper rundt eksisterende Butikktilbud-/Enkel ordre-bygger.
// Proffkatalogen kan kun legge inn ufarlige salgsfelt. Din nto pris lagres aldri i tilbudet.
// Bare Ringside Rørleggerbedrift og Bademiljø Expo kan velge mellom de to interne
// merkevarene. Expo Proffsenter og eksterne proffkunder bruker aktiv firmaprofil.

import { useEffect, useMemo, useRef, useState } from "react";
import SalesStoreOfferBuilderCatalogTemplates from "./SalesStoreOfferBuilderCatalogTemplates.jsx";
import ProStoreCatalogInlineLookup from "../../storeCatalog/ProStoreCatalogInlineLookup.jsx";
import { createDefaultSalesSupabaseClient } from "../services/salesSupabase.js";
import { canAccessProStoreCatalog } from "../../storeCatalog/proStoreCatalogClient.js";
import {
  getMyWorkProfileState,
  readCachedWorkProfileState,
} from "../../access/workProfileClient.js";
import {
  createStoreOfferMetaLine,
} from "../services/salesStoreOffers.js";

const INTERNAL_SENDER_COMPANIES = new Set([
  "ringside rørleggerbedrift as",
  "ringside as",
  "bademiljø expo",
  "bademiljø expo as",
]);
const COMPANY_BRAND_KEY = "company-profile";
// Bevisst tom logo. Gjør at offentlig kundevisning ikke faller tilbake til Expo-logo
// når et firma uten intern merkevarerett ikke har lastet opp egen firmalogo.
const EMPTY_COMPANY_LOGO_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1' viewBox='0 0 1 1'%3E%3C/svg%3E";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `line-${crypto.randomUUID()}`;
  return `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clean(value) {
  return String(value || "").trim();
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeActiveCompanyProfile(state = {}) {
  const profile = state?.active_company_profile || null;
  const companyName = clean(profile?.companyName || profile?.company_name);
  if (!companyName) return null;
  return {
    companyName,
    orgNumber: clean(profile?.orgNumber || profile?.org_number),
    address: clean(profile?.address),
    phone: clean(profile?.phone),
    email: clean(profile?.email),
    website: clean(profile?.website),
    // Viktig: bruk rå arbeidsprofil. Ingen Expo-fallback for firma uten intern merkevarerett.
    logoUrl: clean(profile?.logoUrl || profile?.logo_url),
  };
}

function isInternalSenderCompany(profile = null) {
  return INTERNAL_SENDER_COMPANIES.has(
    clean(profile?.companyName).toLowerCase()
  );
}

function companySenderMeta(profile, selectedRequest, existingMeta = null) {
  const base =
    existingMeta ||
    createStoreOfferMetaLine({
      signatureName:
        selectedRequest?.responsible || selectedRequest?.projectResponsible || "",
    });
  return {
    ...base,
    brandMode: "company",
    brandKey: COMPANY_BRAND_KEY,
    brandLabel: profile.companyName,
    brandLogoUrl: profile.logoUrl || EMPTY_COMPANY_LOGO_DATA_URL,
    companyBrandHasLogo: Boolean(profile.logoUrl),
  };
}

function withCompanySenderMeta(form = {}, profile = null, selectedRequest = null) {
  if (!profile || isInternalSenderCompany(profile)) return form;
  const lines = Array.isArray(form?.lines) ? form.lines : [];
  const index = lines.findIndex((line) => line?.__storeOfferMeta);
  const existingMeta = index >= 0 ? lines[index] : null;
  const nextMeta = companySenderMeta(profile, selectedRequest, existingMeta);

  const unchanged = Boolean(
    existingMeta &&
      existingMeta.brandMode === nextMeta.brandMode &&
      existingMeta.brandKey === nextMeta.brandKey &&
      existingMeta.brandLabel === nextMeta.brandLabel &&
      existingMeta.brandLogoUrl === nextMeta.brandLogoUrl &&
      existingMeta.companyBrandHasLogo === nextMeta.companyBrandHasLogo
  );
  if (unchanged) return form;

  const nextLines = [...lines];
  if (index >= 0) nextLines[index] = nextMeta;
  else nextLines.push(nextMeta);
  return { ...(form || {}), lines: nextLines };
}

function patchExternalSenderPresentation(root, profile) {
  if (!(root instanceof HTMLElement) || !profile) return;
  const senderHeading = Array.from(root.querySelectorAll("h2")).find(
    (node) => clean(node.textContent) === "Avsender"
  );
  const section = senderHeading?.closest?.(".store-builder-section");
  if (!(section instanceof HTMLElement)) return;

  const help = section.querySelector(".store-section-head p");
  if (help) {
    help.textContent = `Tilbudet sendes fra ${profile.companyName}. Firmaprofil og saksbehandler låses med tilbudsversjonen.`;
  }

  const brandGrid = section.querySelector(".store-brand-grid");
  if (brandGrid instanceof HTMLElement) brandGrid.style.display = "none";

  let card = section.querySelector("[data-company-sender-card='1']");
  if (!(card instanceof HTMLElement)) {
    card = document.createElement("div");
    card.dataset.companySenderCard = "1";
    card.style.cssText =
      "display:flex;align-items:center;gap:14px;padding:14px;border:2px solid #16aeb9;border-radius:14px;background:#fff;margin-bottom:14px";
    const signatureField = section.querySelector("label.sales-field");
    if (signatureField) section.insertBefore(card, signatureField);
    else section.appendChild(card);
  }

  card.replaceChildren();
  if (profile.logoUrl) {
    const image = document.createElement("img");
    image.src = profile.logoUrl;
    image.alt = profile.companyName;
    image.style.cssText = "max-width:220px;max-height:72px;object-fit:contain;object-position:left center";
    card.appendChild(image);
  }
  const copy = document.createElement("div");
  copy.style.cssText = "display:grid;gap:3px;min-width:0";
  const name = document.createElement("strong");
  name.textContent = profile.companyName;
  const note = document.createElement("span");
  note.textContent = profile.logoUrl
    ? "Firmaets egen logo brukes på tilbudet."
    : "Ingen firmalogo er registrert. Tilbudet vises med firmanavn uten Expo/Ringside-logo.";
  note.style.cssText = "color:#60727a;font-size:13px";
  copy.append(name, note);
  card.appendChild(copy);
}

function buildOfferLine(item = {}) {
  const saleExVat = toNumber(item.suggested_sale_price_ex_vat);
  const saleInclVat = toNumber(item.suggested_sale_price_incl_vat) || saleExVat * 1.25;
  const supplierProductNumber = String(item.supplier_product_number || "").trim();

  return {
    id: createId(),
    mainPostId: "butikk-varer",
    mainPostTitle: "Varer",
    lineType: "work",
    description: String(item.description || "").trim(),
    nobbNumber: String(item.nobb_number || "").trim(),
    supplierProductNumber,
    internalProductNumber: supplierProductNumber,
    quantity: "1",
    unit: "stk",
    storeUnitPriceInclVat: saleInclVat > 0 ? String(saleInclVat) : "",
    storeDiscountPercent: "",
    amount: saleExVat > 0 ? String(saleExVat) : "",
    productUrl: String(item.product_url || "").trim(),
    storeAutoProductUrl: false,
    storeCatalogItemId: String(item.id || ""),
    storeCatalogGtin: String(item.gtin || ""),
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

export default function SalesStoreOfferBuilderProCatalog(props) {
  const [client] = useState(() => createDefaultSalesSupabaseClient());
  const [proAccess, setProAccess] = useState(false);
  const initialWorkProfile = readCachedWorkProfileState();
  const [senderState, setSenderState] = useState(() => ({
    loading: !normalizeActiveCompanyProfile(initialWorkProfile),
    profile: normalizeActiveCompanyProfile(initialWorkProfile),
    error: "",
  }));
  const builderRootRef = useRef(null);

  useEffect(() => {
    let active = true;
    canAccessProStoreCatalog(client)
      .then((allowed) => active && setProAccess(allowed === true))
      .catch(() => active && setProAccess(false));
    return () => { active = false; };
  }, [client, props?.selectedRequest?.id]);

  useEffect(() => {
    let active = true;
    getMyWorkProfileState()
      .then((state) => {
        if (!active) return;
        const profile = normalizeActiveCompanyProfile(state);
        setSenderState({
          loading: false,
          profile,
          error: profile ? "" : "Fant ikke aktiv firmaprofil for tilbudet.",
        });
      })
      .catch((error) => {
        if (!active) return;
        const cached = normalizeActiveCompanyProfile(readCachedWorkProfileState());
        setSenderState({
          loading: false,
          profile: cached,
          error: cached ? "" : error?.message || "Kunne ikke hente aktiv firmaprofil.",
        });
      });
    return () => { active = false; };
  }, [props?.selectedRequest?.id]);

  const externalSender = Boolean(
    senderState.profile && !isInternalSenderCompany(senderState.profile)
  );
  const adjustedOfferForm = useMemo(
    () =>
      externalSender
        ? withCompanySenderMeta(
            props?.offerForm || {},
            senderState.profile,
            props?.selectedRequest
          )
        : props?.offerForm,
    [externalSender, senderState.profile, props?.offerForm, props?.selectedRequest]
  );

  useEffect(() => {
    if (!externalSender) return;
    const currentLines = Array.isArray(props?.offerForm?.lines)
      ? props.offerForm.lines
      : [];
    const nextLines = Array.isArray(adjustedOfferForm?.lines)
      ? adjustedOfferForm.lines
      : [];
    if (currentLines === nextLines) return;
    props?.updateOfferForm?.("lines", nextLines);
  }, [externalSender, adjustedOfferForm?.lines, props?.offerForm?.lines, props?.updateOfferForm]);

  useEffect(() => {
    if (!externalSender || !senderState.profile) return undefined;
    const frame = window.requestAnimationFrame(() => {
      patchExternalSenderPresentation(builderRootRef.current, senderState.profile);
    });
    return () => window.cancelAnimationFrame(frame);
  });

  useEffect(() => {
    if (!proAccess) return;
    const lines = Array.isArray(adjustedOfferForm?.lines) ? adjustedOfferForm.lines : [];
    let changed = false;
    const nextLines = lines.map((line) => {
      if (!line?.__storeOfferMeta || line?.simpleOrder === true) return line;
      changed = true;
      return {
        ...line,
        simpleOrder: true,
        simpleOrderVersion: 1,
        offerKind: "simple-order-v1",
      };
    });
    if (changed) props?.updateOfferForm?.("lines", nextLines);
  }, [proAccess, adjustedOfferForm?.lines, props?.updateOfferForm]);

  function addCatalogItem(item) {
    const lines = Array.isArray(adjustedOfferForm?.lines) ? adjustedOfferForm.lines : [];
    props?.updateOfferForm?.("lines", [...lines, buildOfferLine(item)]);
  }

  if (senderState.loading) {
    return (
      <section className="sales-card" style={{ padding: 18 }}>
        <strong>Henter avsenderprofil …</strong>
        <p className="note">Kontrollerer hvilket firma tilbudet skal sendes fra.</p>
      </section>
    );
  }

  if (!senderState.profile) {
    return (
      <section className="sales-card" style={{ padding: 18 }}>
        <strong>Avsenderprofil mangler</strong>
        <p className="note">
          {senderState.error || "Aktivt firma kunne ikke bekreftes. Last siden på nytt og prøv igjen."}
        </p>
      </section>
    );
  }

  return (
    <div
      ref={builderRootRef}
      data-store-sender-mode={externalSender ? "company" : "internal-brand-choice"}
    >
      {proAccess ? (
        <section className="sales-card" data-pro-catalog-quick-add="true" style={{ marginBottom: 12, padding: 14 }}>
          <div style={{ display: "grid", gap: 5, marginBottom: 10 }}>
            <strong>Enkel ordre · varesøk</strong>
            <span className="note">
              Kun leverandører firmaet har tilgang til vises. Kundepris eks. mva. legges inn som foreslått salgspris og kan endres i tilbudet.
            </span>
          </div>
          <ProStoreCatalogInlineLookup onUse={addCatalogItem} />
        </section>
      ) : null}
      <SalesStoreOfferBuilderCatalogTemplates
        {...props}
        offerForm={adjustedOfferForm}
      />
    </div>
  );
}