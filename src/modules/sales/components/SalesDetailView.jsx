// Expo ProffDok – FASE 31B / FASE 30C2 UX
// Intern tilbudsvisning bruker samme hovedpostrekkefølge og nummereringsprinsipp
// som kundevisningen. Hovedposter blir tydeligere uten å endre tilbudsdata,
// lagring, publisering, recovery, SQL/RLS/Storage eller Edge Functions.
// FASE 30C2: Tynn presentasjons-wrapper rundt eksisterende SalesDetailView. Når en Befaring-sak
// allerede har reelt tilbudsinnhold, endres kun brukerens handlingslabel fra
// «Opprett tilbud …» til «Fortsett på tilbud». Eksisterende arbeidsflyt og callbacks
// beholdes uendret. Core-filen er fortsatt presentasjonsren og bruker ingen React-hooks.

import { Children, cloneElement, isValidElement } from "react";
import SalesDetailViewCore from "./SalesDetailViewCore.jsx";
import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";
import { formatNok, getOfferTotal } from "../utils/salesUtils.js";

const LEGACY_MAIN_POST = {
  id: "ovrige-arbeider",
  title: "Øvrige arbeider",
};

function hasMeaningfulOfferDraft(request) {
  const lines = Array.isArray(request?.offerLines) ? request.offerLines : [];
  const options = Array.isArray(request?.offerOptions) ? request.offerOptions : [];

  const hasLine = lines.some((line) => {
    if (line?.lineType === "administration") {
      return Boolean(
        String(line?.amount ?? "").trim() ||
          String(line?.adminPercent ?? "").trim() ||
          String(line?.productUrl || "").trim() ||
          line?.imageDataUrl ||
          line?.attachmentFile?.url
      );
    }

    return Boolean(
      String(line?.description || "").trim() ||
        String(line?.amount ?? "").trim() ||
        String(line?.internalProductNumber || "").trim() ||
        String(line?.productUrl || "").trim() ||
        line?.imageDataUrl ||
        line?.attachmentFile?.url
    );
  });

  const hasOption = options.some((option) =>
    Boolean(
      String(option?.title || "").trim() ||
        String(option?.description || "").trim() ||
        String(option?.amount ?? "").trim() ||
        String(option?.internalProductNumber || "").trim() ||
        String(option?.productUrl || "").trim() ||
        option?.imageDataUrl ||
        option?.attachmentFile?.url
    )
  );

  return hasLine || hasOption;
}

function getMainPostMeta(item = {}) {
  return {
    id:
      String(item.mainPostId || LEGACY_MAIN_POST.id).trim() ||
      LEGACY_MAIN_POST.id,
    title:
      String(item.mainPostTitle || LEGACY_MAIN_POST.title).trim() ||
      LEGACY_MAIN_POST.title,
  };
}

function buildInternalOfferGroups(lines = [], options = []) {
  const groups = [];
  const groupMap = new Map();
  let firstSeen = 0;

  function ensureGroup(item) {
    const meta = getMainPostMeta(item);

    if (!groupMap.has(meta.id)) {
      const group = {
        ...meta,
        lines: [],
        options: [],
        firstSeen: firstSeen++,
      };
      groupMap.set(meta.id, group);
      groups.push(group);
    }

    return groupMap.get(meta.id);
  }

  (Array.isArray(lines) ? lines : []).forEach((line) => {
    if (line?.__companyMeta || line?.__offerTermsMeta) return;
    ensureGroup(line).lines.push(line);
  });

  (Array.isArray(options) ? options : []).forEach((option) => {
    ensureGroup(option).options.push(option);
  });

  const standardOrder = new Map(
    OFFER_MAIN_POSTS.map((post, index) => [post.id, index])
  );

  return groups
    .filter((group) => group.lines.length || group.options.length)
    .sort((left, right) => {
      const leftOrder = standardOrder.has(left.id)
        ? standardOrder.get(left.id)
        : Number.MAX_SAFE_INTEGER;
      const rightOrder = standardOrder.has(right.id)
        ? standardOrder.get(right.id)
        : Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return left.firstSeen - right.firstSeen;
    });
}

function rewriteOfferContinuationLabels(node) {
  if (typeof node === "string") {
    if (
      node === "Opprett tilbud" ||
      node === "Opprett tilbud uten befaringsnotat"
    ) {
      return "Fortsett på tilbud";
    }
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(rewriteOfferContinuationLabels);
  }

  if (!isValidElement(node)) return node;

  const children = Children.map(
    node.props.children,
    rewriteOfferContinuationLabels
  );

  return cloneElement(node, undefined, children);
}

function rewriteInternalOfferPresentation(node, request) {
  if (Array.isArray(node)) {
    return node.map((child) => rewriteInternalOfferPresentation(child, request));
  }

  if (!isValidElement(node)) return node;

  if (node.props?.className === "sales-offer-detail-lines-list") {
    const groups = buildInternalOfferGroups(
      request?.offerLines || [],
      request?.offerOptions || []
    );

    return cloneElement(
      node,
      {
        style: {
          ...(node.props.style || {}),
          maxWidth: "none",
          gap: 14,
        },
      },
      groups.map((group, groupIndex) => {
        const groupNumber = String(groupIndex + 1).padStart(2, "0");
        const groupBaseTotal = getOfferTotal(group.lines);

        return (
          <section
            key={`internal-offer-group-${group.id}`}
            style={{
              border: "1px solid #d7e4ea",
              borderRadius: 16,
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
                padding: "14px 16px",
                background: "#f2fafb",
                borderBottom: group.lines.length || group.options.length
                  ? "1px solid #d7e4ea"
                  : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    display: "inline-grid",
                    placeItems: "center",
                    minWidth: 36,
                    height: 36,
                    padding: "0 8px",
                    borderRadius: 999,
                    background: "#0f9faa",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: 14,
                  }}
                >
                  {groupNumber}
                </span>
                <strong
                  style={{
                    fontSize: 18,
                    lineHeight: 1.25,
                    color: "#0f172a",
                  }}
                >
                  {group.title}
                </strong>
              </div>

              <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#64748b",
                    fontWeight: 800,
                  }}
                >
                  Sum hovedpost
                </span>
                <strong style={{ display: "block", fontSize: 16 }}>
                  {formatNok(groupBaseTotal)}
                </strong>
                <small style={{ color: "#64748b" }}>eks. mva.</small>
              </div>
            </div>

            {group.lines.length ? (
              <div style={{ display: "grid", gap: 8, padding: "12px 16px" }}>
                {group.lines.map((line, lineIndex) => (
                  <div
                    key={line.id || `${group.id}-${lineIndex}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "64px 1fr minmax(140px, auto)",
                      gap: 10,
                      alignItems: "start",
                    }}
                  >
                    <strong style={{ color: "#0f7f87" }}>
                      {groupNumber}.{lineIndex + 1}
                    </strong>
                    <span>{line.description || "Tilbudspost"}</span>
                    <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {formatNok(getOfferTotal([line]))} eks. mva.
                    </strong>
                  </div>
                ))}
              </div>
            ) : null}

            {group.options.length ? (
              <div
                style={{
                  padding: group.lines.length ? "0 16px 12px" : "12px 16px",
                  color: "#52616b",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Opsjoner: {group.options.length} registrert
              </div>
            ) : null}
          </section>
        );
      })
    );
  }

  const children = Children.map(node.props.children, (child) =>
    rewriteInternalOfferPresentation(child, request)
  );

  return cloneElement(node, undefined, children);
}

export default function SalesDetailView(props) {
  const hasExistingOfferDraft = Boolean(
    props?.selectedRequest?.status === "Befaring" &&
      hasMeaningfulOfferDraft(props.selectedRequest)
  );

  let tree = SalesDetailViewCore(props);
  tree = rewriteInternalOfferPresentation(tree, props?.selectedRequest);

  if (!hasExistingOfferDraft) {
    return tree;
  }

  // SalesDetailViewCore er bevisst hook-fri. Vi materialiserer derfor treet her
  // og endrer kun de to konkrete handlingslabelene – aldri status eller nextStep.
  return rewriteOfferContinuationLabels(tree);
}
