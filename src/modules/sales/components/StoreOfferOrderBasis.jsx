// Expo ProffDok – FASE 41B.5
// Read-only bestillingsgrunnlag fra den låste aksepterte Butikktilbud-versjonen.
// Ingen databasekall, ingen mutasjon av Sales-data og ingen priser/nettopriser.

import { useMemo, useState } from "react";
import { ClipboardList, Copy, Printer, X } from "lucide-react";

const PRODUCT_POST_ID = "butikk-varer";
const INSTALLATION_POST_ID = "butikk-montering";
const SECTION_LINE_TYPE = "store_text";

function text(value = "") {
  return String(value ?? "").trim();
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function isMetaLine(line = {}) {
  return Boolean(line?.__companyMeta || line?.__offerTermsMeta || line?.__storeOfferMeta);
}

function isSectionLine(line = {}) {
  return line?.lineType === SECTION_LINE_TYPE || line?.storeSectionMode === "group";
}

function acceptedSnapshot(request = {}) {
  const acceptedPayload = request?.acceptedPayload || {};
  const versionSnapshot = acceptedPayload?.version_snapshot || {};

  const lines =
    array(request?.acceptedOfferLines).length
      ? array(request.acceptedOfferLines)
      : array(versionSnapshot?.lines).length
        ? array(versionSnapshot.lines)
        : array(request?.offerLines);

  const options =
    array(request?.acceptedOptions).length
      ? array(request.acceptedOptions)
      : array(acceptedPayload?.selected_options).length
        ? array(acceptedPayload.selected_options)
        : [];

  return { lines, options };
}

function sectionMap(lines = []) {
  const map = new Map();
  array(lines)
    .filter(isSectionLine)
    .forEach((line) => {
      const id = text(line?.id || line?.storeSectionId);
      if (!id) return;
      map.set(
        id,
        text(line?.storeTextTitle || line?.description) || "Uten avsnittsnavn"
      );
    });
  return map;
}

function itemSection(item = {}, sections = new Map(), productById = new Map()) {
  let sectionId = text(item?.storeSectionId);
  if (!sectionId) {
    const parentId = text(item?.storeParentProductId || item?.replacementLineId);
    sectionId = text(productById.get(parentId)?.storeSectionId);
  }
  return sections.get(sectionId) || "Uten avsnitt";
}

function quantity(item = {}) {
  const raw = item?.quantity;
  if (raw === null || raw === undefined || text(raw) === "") return "1";
  return text(raw);
}

function unit(item = {}) {
  return text(item?.unit) || "stk";
}

function productIdentity(item = {}) {
  return {
    supplierProductNumber: text(item?.supplierProductNumber || item?.internalProductNumber),
    nobbNumber: text(item?.nobbNumber),
    gtin: text(item?.storeCatalogGtin),
  };
}

function orderLabel(item = {}, fallback = "Bestillingspost") {
  return text(item?.description || item?.title) || fallback;
}

function normalizeOrderRow(item = {}, meta = {}) {
  const identity = productIdentity(item);
  return {
    id: text(item?.id) || `${meta.kind || "row"}-${Math.random()}`,
    title: orderLabel(item, meta.fallback),
    section: meta.section || "Uten avsnitt",
    quantity: quantity(item),
    unit: unit(item),
    supplierProductNumber: identity.supplierProductNumber,
    nobbNumber: identity.nobbNumber,
    gtin: identity.gtin,
    kind: meta.kind || "grunnpost",
    note: text(meta.note),
    missingProductReference: !(
      identity.supplierProductNumber || identity.nobbNumber || identity.gtin
    ),
  };
}

function buildOrderBasis(request = {}) {
  const { lines, options } = acceptedSnapshot(request);
  const sections = sectionMap(lines);
  const products = lines.filter(
    (line) =>
      !isMetaLine(line) &&
      !isSectionLine(line) &&
      line?.mainPostId === PRODUCT_POST_ID
  );
  const productById = new Map(products.map((line) => [text(line?.id), line]));
  const selectedAlternatives = options.filter(
    (option) => option?.optionType === "alternative"
  );
  const replacedProductIds = new Set(
    selectedAlternatives.map((option) => text(option?.replacementLineId)).filter(Boolean)
  );
  const replacedInstallationIds = new Set(
    selectedAlternatives
      .map((option) => text(option?.storeInstallationReplacementLineId))
      .filter(Boolean)
  );

  const baseRows = products
    .filter((line) => !replacedProductIds.has(text(line?.id)))
    .map((line) =>
      normalizeOrderRow(line, {
        kind: "grunnpost",
        section: itemSection(line, sections, productById),
        fallback: "Akseptert post",
      })
    );

  const optionRows = options
    .filter((option) => option?.mainPostId === PRODUCT_POST_ID || text(option?.title))
    .map((option) => {
      const alternative = option?.optionType === "alternative";
      const replaced = productById.get(text(option?.replacementLineId));
      const note = alternative
        ? `Valgt alternativ${replaced ? ` – erstatter ${orderLabel(replaced, "grunnpost")}` : ""}`
        : "Valgt tillegg";
      return normalizeOrderRow(option, {
        kind: alternative ? "alternativ" : "tillegg",
        section: itemSection(option, sections, productById),
        fallback: alternative ? "Valgt alternativ" : "Valgt tillegg",
        note,
      });
    });

  const installationRows = lines
    .filter(
      (line) =>
        !isMetaLine(line) &&
        !isSectionLine(line) &&
        line?.mainPostId === INSTALLATION_POST_ID &&
        !replacedInstallationIds.has(text(line?.id))
    )
    .map((line) => ({
      id: text(line?.id),
      title: orderLabel(line, "Montering / arbeid"),
      quantity: quantity(line),
      unit: unit(line),
    }));

  const otherRows = lines
    .filter(
      (line) =>
        !isMetaLine(line) &&
        !isSectionLine(line) &&
        line?.mainPostId !== PRODUCT_POST_ID &&
        line?.mainPostId !== INSTALLATION_POST_ID
    )
    .map((line) => ({
      id: text(line?.id),
      title: orderLabel(line, "Annen akseptert leveranse"),
      quantity: quantity(line),
      unit: unit(line),
    }));

  const version =
    request?.acceptedOfferVersionNumber ||
    request?.acceptedPayload?.version_number ||
    request?.acceptedPayload?.version_snapshot?.version_number ||
    request?.sentOfferVersionNumber ||
    "";

  return {
    orderRows: [...baseRows, ...optionRows],
    workRows: [...installationRows, ...otherRows],
    version,
  };
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text(value);
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function copyTextForBasis(request, basis) {
  const lines = [
    "BESTILLINGSGRUNNLAG – BUTIKKTILBUD",
    `Sak: ${text(request?.id) || "–"}`,
    `Kunde: ${text(request?.customer) || "–"}`,
    request?.address ? `Adresse: ${text(request.address)}` : "",
    basis.version ? `Akseptert tilbudsversjon: v${basis.version}` : "",
    request?.acceptedAt ? `Akseptert: ${formatDateTime(request.acceptedAt)}` : "",
    "",
    "VARER / POSTER SOM SKAL BESTILLES",
  ].filter(Boolean);

  basis.orderRows.forEach((row, index) => {
    lines.push(`${index + 1}. ${row.title}`);
    lines.push(`   Antall: ${row.quantity} ${row.unit}`);
    if (row.section) lines.push(`   Avsnitt: ${row.section}`);
    if (row.supplierProductNumber) lines.push(`   Varenr.: ${row.supplierProductNumber}`);
    if (row.nobbNumber) lines.push(`   NOBB: ${row.nobbNumber}`);
    if (row.gtin) lines.push(`   GTIN: ${row.gtin}`);
    if (row.note) lines.push(`   ${row.note}`);
    if (row.missingProductReference) lines.push("   OBS: mangler varenr./NOBB/GTIN");
  });

  if (basis.workRows.length) {
    lines.push("", "ARBEID / ANDRE LEVERANSER – IKKE VAREBESTILLING");
    basis.workRows.forEach((row, index) => {
      lines.push(`${index + 1}. ${row.title} – ${row.quantity} ${row.unit}`);
    });
  }

  lines.push("", "Prisfelter er bevisst utelatt fra bestillingsgrunnlaget.");
  return lines.join("\n");
}

async function copyBasis(request, basis) {
  const value = copyTextForBasis(request, basis);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function OrderRows({ rows }) {
  if (!rows.length) {
    return <p className="storeOrderEmpty">Ingen vareposter funnet i den aksepterte versjonen.</p>;
  }

  return (
    <div className="storeOrderRows">
      {rows.map((row, index) => (
        <article className="storeOrderRow" key={`${row.id}-${index}`}>
          <div className="storeOrderIndex">{index + 1}</div>
          <div className="storeOrderMain">
            <strong>{row.title}</strong>
            <span>{row.section}</span>
            {row.note ? <small>{row.note}</small> : null}
            {row.missingProductReference ? (
              <em>Mangler varenr./NOBB/GTIN – kontroller manuelt før bestilling.</em>
            ) : null}
          </div>
          <div className="storeOrderQty">
            <strong>{row.quantity}</strong>
            <span>{row.unit}</span>
          </div>
          <dl className="storeOrderRefs">
            <div><dt>Varenr.</dt><dd>{row.supplierProductNumber || "–"}</dd></div>
            <div><dt>NOBB</dt><dd>{row.nobbNumber || "–"}</dd></div>
            <div><dt>GTIN</dt><dd>{row.gtin || "–"}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}

export default function StoreOfferOrderBasis({ request }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const basis = useMemo(() => buildOrderBasis(request), [request]);

  if (!request || request.status !== "Akseptert") return null;

  async function handleCopy() {
    try {
      await copyBasis(request, basis);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.alert("Kunne ikke kopiere bestillingsgrunnlaget.");
    }
  }

  return (
    <>
      <section className="storeOrderBasisCard">
        <div>
          <span>Etter kundeaksept</span>
          <h2>Bestillingsgrunnlag</h2>
          <p>
            Read-only oversikt fra tilbudsversjonen kunden aksepterte. Pris og intern nettopris er ikke med.
          </p>
        </div>
        <button type="button" className="sales-primary-button" onClick={() => setOpen(true)}>
          <ClipboardList size={18} />
          Åpne bestillingsgrunnlag
        </button>
      </section>

      {open ? (
        <div className="storeOrderBackdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="storeOrderDialog" role="dialog" aria-modal="true" aria-label="Bestillingsgrunnlag">
            <header className="storeOrderHeader">
              <div>
                <span>Butikktilbud · {text(request?.id) || "Sak"}</span>
                <h1>Bestillingsgrunnlag</h1>
                <p>
                  {text(request?.customer) || "Kunde"}
                  {request?.address ? ` · ${text(request.address)}` : ""}
                </p>
              </div>
              <button type="button" className="secondary storeOrderClose" onClick={() => setOpen(false)} aria-label="Lukk bestillingsgrunnlag">
                <X size={20} />
              </button>
            </header>

            <div className="storeOrderMeta">
              <div><span>Tilbudsversjon</span><strong>{basis.version ? `v${basis.version}` : "–"}</strong></div>
              <div><span>Akseptert</span><strong>{formatDateTime(request?.acceptedAt) || "–"}</strong></div>
              <div><span>Vareposter</span><strong>{basis.orderRows.length}</strong></div>
            </div>

            <div className="storeOrderToolbar">
              <button type="button" className="sales-secondary-button" onClick={handleCopy}>
                <Copy size={17} />
                {copied ? "Kopiert" : "Kopier liste"}
              </button>
              <button type="button" className="sales-secondary-button" onClick={() => window.print()}>
                <Printer size={17} />
                Skriv ut
              </button>
            </div>

            <section className="storeOrderSection">
              <div className="storeOrderSectionTitle">
                <div>
                  <span>Bestilling</span>
                  <h2>Varer / poster som skal bestilles</h2>
                </div>
                <small>Prisfelter er utelatt</small>
              </div>
              <OrderRows rows={basis.orderRows} />
            </section>

            {basis.workRows.length ? (
              <section className="storeOrderSection storeOrderWorkSection">
                <div className="storeOrderSectionTitle">
                  <div>
                    <span>Separat</span>
                    <h2>Arbeid / andre leveranser</h2>
                  </div>
                  <small>Ikke varebestilling</small>
                </div>
                <div className="storeOrderWorkRows">
                  {basis.workRows.map((row, index) => (
                    <div key={`${row.id}-${index}`}>
                      <strong>{row.title}</strong>
                      <span>{row.quantity} {row.unit}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <p className="storeOrderFootnote">
              Grunnlaget er generert fra låst akseptert tilbudsinnhold. Endringer gjøres ikke her.
            </p>
          </section>
        </div>
      ) : null}

      <style>{`
        .storeOrderBasisCard{max-width:1180px;margin:18px auto 0;padding:18px 20px;border:1px solid #cfe1e6;border-radius:16px;background:#f5fbfc;display:flex;justify-content:space-between;align-items:center;gap:18px;box-sizing:border-box}.storeOrderBasisCard>div{min-width:0}.storeOrderBasisCard>div>span,.storeOrderSectionTitle span,.storeOrderHeader span{display:block;color:#0b7f87;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}.storeOrderBasisCard h2{margin:3px 0 4px;color:#10212b}.storeOrderBasisCard p{margin:0;color:#60737b}.storeOrderBasisCard button{width:auto;white-space:nowrap}.storeOrderBackdrop{position:fixed;z-index:26000;inset:0;background:rgba(15,23,42,.62);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow:auto}.storeOrderDialog{width:min(1040px,100%);margin:auto 0;background:#fff;border-radius:20px;box-shadow:0 28px 90px rgba(15,23,42,.28);padding:24px;box-sizing:border-box;color:#10212b}.storeOrderHeader{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.storeOrderHeader h1{margin:3px 0 4px}.storeOrderHeader p{margin:0;color:#60737b}.storeOrderClose{width:44px!important;height:44px!important;padding:0!important;display:grid!important;place-items:center!important}.storeOrderMeta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:20px 0 14px}.storeOrderMeta>div{padding:12px 14px;border:1px solid #d9e7eb;border-radius:12px;background:#fbfdfe;display:grid;gap:2px}.storeOrderMeta span{font-size:12px;color:#64748b;font-weight:800}.storeOrderMeta strong{font-size:15px}.storeOrderToolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:18px}.storeOrderToolbar button{width:auto}.storeOrderSection{border:1px solid #d7e4ea;border-radius:15px;overflow:hidden}.storeOrderSection+.storeOrderSection{margin-top:16px}.storeOrderSectionTitle{display:flex;justify-content:space-between;gap:14px;align-items:end;padding:14px 16px;background:#f2fafb;border-bottom:1px solid #d7e4ea}.storeOrderSectionTitle h2{margin:2px 0 0;font-size:18px}.storeOrderSectionTitle small{color:#60737b;font-weight:800}.storeOrderRows{display:grid}.storeOrderRow{display:grid;grid-template-columns:38px minmax(0,1fr) 80px minmax(230px,.8fr);gap:12px;align-items:start;padding:13px 16px;border-bottom:1px solid #edf2f4}.storeOrderRow:last-child{border-bottom:0}.storeOrderIndex{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#e8f7f8;color:#0b737b;font-weight:900}.storeOrderMain{display:grid;gap:2px;min-width:0}.storeOrderMain>span,.storeOrderMain small{color:#60737b;font-size:12px}.storeOrderMain em{font-style:normal;color:#a35a00;font-size:12px;font-weight:800;margin-top:3px}.storeOrderQty{text-align:right;display:grid}.storeOrderQty span{color:#64748b;font-size:12px}.storeOrderRefs{margin:0;display:grid;gap:3px}.storeOrderRefs>div{display:grid;grid-template-columns:58px minmax(0,1fr);gap:8px}.storeOrderRefs dt{color:#64748b;font-size:12px;font-weight:800}.storeOrderRefs dd{margin:0;font-size:12px;overflow-wrap:anywhere}.storeOrderEmpty{margin:0;padding:18px;color:#60737b}.storeOrderWorkSection .storeOrderSectionTitle{background:#fbfbfc}.storeOrderWorkRows{display:grid}.storeOrderWorkRows>div{display:flex;justify-content:space-between;gap:12px;padding:11px 16px;border-bottom:1px solid #edf2f4}.storeOrderWorkRows>div:last-child{border-bottom:0}.storeOrderWorkRows span{white-space:nowrap;color:#60737b}.storeOrderFootnote{margin:16px 0 0;color:#64748b;font-size:12px}
        @media(max-width:760px){.storeOrderBasisCard{margin:14px 12px 0;display:grid;padding:16px}.storeOrderBasisCard button{width:100%}.storeOrderBackdrop{padding:0}.storeOrderDialog{min-height:100%;border-radius:0;padding:16px}.storeOrderMeta{grid-template-columns:1fr}.storeOrderToolbar{justify-content:stretch}.storeOrderToolbar button{flex:1}.storeOrderSectionTitle{align-items:flex-start;display:grid}.storeOrderRow{grid-template-columns:34px minmax(0,1fr) 62px}.storeOrderRefs{grid-column:2 / -1;padding-top:5px}.storeOrderWorkRows>div{align-items:flex-start}.storeOrderHeader{gap:10px}}
        @media print{body *{visibility:hidden!important}.storeOrderBackdrop,.storeOrderBackdrop *{visibility:visible!important}.storeOrderBackdrop{position:absolute!important;inset:0!important;padding:0!important;background:#fff!important;overflow:visible!important}.storeOrderDialog{width:100%!important;max-width:none!important;margin:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important}.storeOrderClose,.storeOrderToolbar{display:none!important}.storeOrderRow{break-inside:avoid}.storeOrderSection{break-inside:auto}.storeOrderFootnote{margin-top:12px}}
      `}</style>
    </>
  );
}
