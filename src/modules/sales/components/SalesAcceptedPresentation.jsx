// Expo ProffDok – FASE 31C
// Presenterer låst akseptert tilbud i samme hovedpoststruktur som intern tilbudsvisning,
// kundelink og dokumenter. Endrer ikke akseptdata, lagring eller prosjektaktivering.

import { Children, cloneElement, isValidElement } from "react";
import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";
import {
  formatNok,
  formatOfferQuantity,
  getOfferTotal,
  getOfferUnitPrice,
  getVisibleOfferLines,
  hasOfferQuantityDetails,
} from "../utils/salesUtils.js";

const LEGACY_MAIN_POST = {
  id: "ovrige-arbeider",
  title: "Øvrige arbeider",
};

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

function buildAcceptedGroups(lines = [], options = []) {
  const groups = [];
  const groupMap = new Map();
  let firstSeen = 0;

  const ensureGroup = (item) => {
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
  };

  lines.forEach((line) => ensureGroup(line).lines.push(line));
  options.forEach((option) => ensureGroup(option).options.push(option));

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

function getAcceptedSnapshot(request = {}) {
  const acceptedPayload = request.acceptedPayload || {};
  const versionSnapshot = acceptedPayload.version_snapshot || {};

  const rawLines =
    (Array.isArray(request.acceptedOfferLines) && request.acceptedOfferLines.length
      ? request.acceptedOfferLines
      : Array.isArray(versionSnapshot.lines) && versionSnapshot.lines.length
        ? versionSnapshot.lines
        : request.offerLines) || [];

  const options =
    (Array.isArray(request.acceptedOptions) && request.acceptedOptions.length
      ? request.acceptedOptions
      : Array.isArray(acceptedPayload.selected_options)
        ? acceptedPayload.selected_options
        : []) || [];

  const lines = getVisibleOfferLines(rawLines);
  const explicitTotal = request.acceptedTotal;
  const total =
    explicitTotal !== null &&
    explicitTotal !== undefined &&
    explicitTotal !== "" &&
    Number.isFinite(Number(explicitTotal))
      ? Number(explicitTotal)
      : getOfferTotal(lines) + getOfferTotal(options);

  return { lines, options, total };
}

function getAcceptedVersionNumberMap(request = {}, snapshot = {}) {
  const acceptedPayload = request.acceptedPayload || {};
  const versionSnapshot = acceptedPayload.version_snapshot || {};

  const fullRawLines =
    (Array.isArray(versionSnapshot.lines) && versionSnapshot.lines.length
      ? versionSnapshot.lines
      : Array.isArray(request.offerLines) && request.offerLines.length
        ? request.offerLines
        : snapshot.lines) || [];
  const fullLines = getVisibleOfferLines(fullRawLines);

  const fullOptions =
    (Array.isArray(versionSnapshot.options) && versionSnapshot.options.length
      ? versionSnapshot.options
      : Array.isArray(versionSnapshot.offerOptions) && versionSnapshot.offerOptions.length
        ? versionSnapshot.offerOptions
        : Array.isArray(request.offerOptions) && request.offerOptions.length
          ? request.offerOptions
          : snapshot.options) || [];

  const fullGroups = buildAcceptedGroups(fullLines, fullOptions);
  return new Map(fullGroups.map((group, index) => [group.id, index + 1]));
}

function isAlternativeOption(option = {}) {
  return option?.optionType === "alternative";
}

function getOptionMeta(option = {}) {
  const amount = getOfferTotal([option]);
  const alternative = isAlternativeOption(option);
  const reduction = !alternative && amount < 0;

  return {
    amount,
    typeLabel: alternative
      ? "Valgt alternativ / erstatter"
      : reduction
        ? "Valgt fradrag"
        : "Valgt tillegg",
    priceLabel: alternative
      ? "Prisendring"
      : reduction
        ? "Fradrag"
        : "Tillegg",
  };
}

function getReplacementDescription(option = {}, lines = []) {
  return (
    String(option.replacementLineDescription || "").trim() ||
    String(
      lines.find(
        (line) =>
          String(line?.id || "") === String(option?.replacementLineId || "")
      )?.description || ""
    ).trim() ||
    "valgt underpost"
  );
}

function getQuantityText(item = {}) {
  if (!hasOfferQuantityDetails(item)) return "";
  return `${formatOfferQuantity(item)} × ${formatNok(
    getOfferUnitPrice(item)
  )} pr. enhet`;
}

function AcceptedOfferGroups({ request }) {
  const snapshot = getAcceptedSnapshot(request);
  const groups = buildAcceptedGroups(snapshot.lines, snapshot.options);
  const versionNumberMap = getAcceptedVersionNumberMap(request, snapshot);
  const version =
    request.acceptedOfferVersionNumber ||
    request.acceptedPayload?.version_number ||
    request.acceptedPayload?.version_snapshot?.version_number ||
    request.sentOfferVersionNumber ||
    "";

  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "end",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <strong style={{ display: "block", fontSize: 18, color: "#0f172a" }}>
            Akseptert tilbudsinnhold
          </strong>
          <span style={{ color: "#52616b" }}>
            Låst innhold fra tilbudet kunden aksepterte.
          </span>
        </div>
        {version ? (
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "#e8f7f8",
              color: "#0b737b",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            Tilbudsversjon v{version}
          </span>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {groups.map((group, groupIndex) => {
          const originalNumber = versionNumberMap.get(group.id) || groupIndex + 1;
          const groupNumber = String(originalNumber).padStart(2, "0");
          const groupTotal =
            getOfferTotal(group.lines) + getOfferTotal(group.options);
          const optionsOnly = group.lines.length === 0 && group.options.length > 0;

          return (
            <section
              key={`accepted-group-${group.id}`}
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
                  borderBottom: "1px solid #d7e4ea",
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
                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 18,
                        lineHeight: 1.25,
                        color: "#0f172a",
                      }}
                    >
                      {group.title}
                    </strong>
                    {optionsOnly ? (
                      <span style={{ color: "#0b737b", fontSize: 12, fontWeight: 800 }}>
                        Hovedpost med valgt opsjon
                      </span>
                    ) : null}
                  </div>
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
                    Akseptert sum
                  </span>
                  <strong style={{ display: "block", fontSize: 16 }}>
                    {formatNok(groupTotal)}
                  </strong>
                  <small style={{ color: "#64748b" }}>eks. mva.</small>
                </div>
              </div>

              {group.lines.length ? (
                <div style={{ display: "grid", gap: 8, padding: "12px 16px" }}>
                  {group.lines.map((line, lineIndex) => {
                    const replacingOption = group.options.find(
                      (option) =>
                        isAlternativeOption(option) &&
                        String(option.replacementLineId || "") ===
                          String(line.id || "")
                    );
                    const quantityText = getQuantityText(line);

                    return (
                      <div
                        key={line.id || `${group.id}-${lineIndex}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "64px minmax(0, 1fr) minmax(145px, auto)",
                          gap: 10,
                          alignItems: "start",
                          padding: "5px 0",
                        }}
                      >
                        <strong style={{ color: "#0f7f87" }}>
                          {groupNumber}.{lineIndex + 1}
                        </strong>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ color: "#0f172a" }}>
                            {line.description || "Tilbudspost"}
                          </span>
                          {quantityText ? (
                            <span
                              style={{
                                display: "block",
                                marginTop: 3,
                                color: "#64748b",
                                fontSize: 13,
                              }}
                            >
                              {quantityText}
                            </span>
                          ) : null}
                          {replacingOption ? (
                            <span
                              style={{
                                display: "block",
                                marginTop: 4,
                                color: "#0b737b",
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              Erstattet av valgt alternativ: {replacingOption.title || "Alternativ"}
                            </span>
                          ) : null}
                        </div>
                        <strong
                          style={{
                            textAlign: "right",
                            whiteSpace: "nowrap",
                            color: replacingOption ? "#64748b" : "#0f172a",
                          }}
                        >
                          {formatNok(getOfferTotal([line]))} eks. mva.
                        </strong>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {group.options.length ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: "12px 16px 16px",
                    borderTop: group.lines.length
                      ? "1px dashed #cbd5e1"
                      : "none",
                    background: "#fbfdfe",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <strong style={{ color: "#0f172a" }}>Valgte opsjoner</strong>
                    <span style={{ color: "#176b42", fontSize: 12, fontWeight: 900 }}>
                      LÅST VED AKSEPT
                    </span>
                  </div>

                  {group.options.map((option, optionIndex) => {
                    const optionMeta = getOptionMeta(option);
                    const quantityText = getQuantityText(option);

                    return (
                      <div
                        key={option.id || `${group.id}-option-${optionIndex}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) minmax(155px, auto)",
                          gap: 14,
                          alignItems: "start",
                          padding: "11px 12px",
                          border: "1px solid #cfe6d9",
                          borderRadius: 12,
                          background: "#f4fbf7",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <span
                            style={{
                              display: "inline-block",
                              marginBottom: 5,
                              color: "#176b42",
                              fontSize: 11,
                              fontWeight: 900,
                              textTransform: "uppercase",
                              letterSpacing: ".03em",
                            }}
                          >
                            {optionMeta.typeLabel}
                          </span>
                          <strong style={{ display: "block", color: "#0f172a" }}>
                            {option.title || "Opsjon"}
                          </strong>
                          {isAlternativeOption(option) ? (
                            <span
                              style={{
                                display: "block",
                                marginTop: 4,
                                color: "#0b737b",
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              Erstatter: {getReplacementDescription(option, group.lines)}
                            </span>
                          ) : null}
                          {quantityText ? (
                            <span
                              style={{
                                display: "block",
                                marginTop: 4,
                                color: "#64748b",
                                fontSize: 13,
                              }}
                            >
                              {quantityText}
                            </span>
                          ) : null}
                          {option.description ? (
                            <span
                              style={{
                                display: "block",
                                marginTop: 4,
                                color: "#52616b",
                              }}
                            >
                              {option.description}
                            </span>
                          ) : null}
                        </div>

                        <strong
                          style={{
                            textAlign: "right",
                            whiteSpace: "nowrap",
                            color: "#0f172a",
                          }}
                        >
                          {optionMeta.priceLabel}: {formatNok(optionMeta.amount)} eks. mva.
                        </strong>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AcceptedTotalSummary({ request }) {
  const { total } = getAcceptedSnapshot(request);

  return (
    <div
      style={{
        marginTop: 18,
        padding: "16px 18px",
        border: "1px solid #b9d9df",
        borderRadius: 16,
        background: "#f2fafb",
        maxWidth: 520,
        marginLeft: "auto",
      }}
    >
      <span
        style={{
          display: "block",
          color: "#52616b",
          fontSize: 12,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: ".03em",
        }}
      >
        Akseptert tilbudssum
      </span>
      <strong
        style={{
          display: "block",
          marginTop: 4,
          color: "#0f172a",
          fontSize: 24,
        }}
      >
        {formatNok(total * 1.25)} inkl. mva.
      </strong>
      <span style={{ display: "block", marginTop: 3, color: "#64748b" }}>
        {formatNok(total)} eks. mva.
      </span>
    </div>
  );
}

function elementText(node) {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) return node.map(elementText).join(" ");
  if (!isValidElement(node)) return "";
  return Children.toArray(node.props.children).map(elementText).join(" ");
}

function rewriteAcceptedBlock(node, request) {
  if (Array.isArray(node)) {
    return node.map((child) => rewriteAcceptedBlock(child, request));
  }
  if (!isValidElement(node)) return node;

  const nodeText = elementText(node);
  const isAcceptedDetails =
    node.props?.className === "sales-detail-lines" &&
    nodeText.includes("Akseptert av") &&
    nodeText.includes("Digital aksept registrert");

  if (isAcceptedDetails) {
    let groupsInserted = false;
    const children = [];

    Children.toArray(node.props.children).forEach((child) => {
      const childText = elementText(child);

      if (childText.includes("Aksepterte arbeider og priser:")) {
        children.push(
          <AcceptedOfferGroups key="accepted-grouped-offer" request={request} />
        );
        groupsInserted = true;
        return;
      }

      if (childText.includes("Valgte opsjoner:")) {
        if (!groupsInserted) {
          children.push(
            <AcceptedOfferGroups key="accepted-grouped-offer" request={request} />
          );
          groupsInserted = true;
        }
        return;
      }

      if (childText.includes("Akseptert sum eks. mva.")) {
        children.push(
          <AcceptedTotalSummary key="accepted-total-summary" request={request} />
        );
        return;
      }

      children.push(child);
    });

    if (!groupsInserted) {
      const snapshot = getAcceptedSnapshot(request);
      if (snapshot.lines.length || snapshot.options.length) {
        const proofIndex = children.findIndex((child) =>
          elementText(child).includes("Låst akseptbevis")
        );
        const grouped = (
          <AcceptedOfferGroups key="accepted-grouped-offer" request={request} />
        );
        if (proofIndex >= 0) children.splice(proofIndex, 0, grouped);
        else children.push(grouped);
      }
    }

    return cloneElement(
      node,
      {
        style: {
          ...(node.props.style || {}),
          gap: 8,
        },
      },
      children
    );
  }

  const children = Children.map(node.props.children, (child) =>
    rewriteAcceptedBlock(child, request)
  );
  return cloneElement(node, undefined, children);
}

export function rewriteAcceptedPresentation(node, request = {}) {
  if (request?.status !== "Akseptert" || !request?.acceptedBy) return node;
  return rewriteAcceptedBlock(node, request);
}
