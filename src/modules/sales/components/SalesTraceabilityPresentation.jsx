// Expo ProffDok – FASE 32A
// Kun intern presentasjon. Viser bare serverstemplet creator/publisher og holder
// disse adskilt fra ansvarlig. Gamle saker uten creator-snapshot får ingen
// kunstig Opprettet av-verdi.

import { Children, cloneElement, isValidElement } from "react";

function formatTraceTime(value) {
  const time = Date.parse(value || "");
  if (!time) return "";

  return new Date(time).toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TraceabilityBlock({ request = {} }) {
  const creatorName = String(request.__createdByName || "").trim();
  const createdAt = creatorName ? formatTraceTime(request.__createdAt) : "";
  const publishedByName = String(request.lastPublishedByName || "").trim();
  const publishedAt = publishedByName
    ? formatTraceTime(request.lastPublishedAt)
    : "";
  const responsible = String(
    request.projectResponsible ||
      request.surveyResponsible ||
      request.responsible ||
      ""
  ).trim();

  if (!creatorName && !publishedByName && !responsible) return null;

  return (
    <div
      aria-label="Sporbarhet"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "7px 14px",
        marginTop: 12,
        color: "#52616b",
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      {creatorName ? (
        <span>
          <strong style={{ color: "#183b46" }}>Opprettet av:</strong>{" "}
          {creatorName}
          {createdAt ? ` · ${createdAt}` : ""}
        </span>
      ) : null}

      {responsible ? (
        <span>
          <strong style={{ color: "#183b46" }}>Ansvarlig:</strong>{" "}
          {responsible}
        </span>
      ) : null}

      {publishedByName ? (
        <span>
          <strong style={{ color: "#183b46" }}>Sist publisert av:</strong>{" "}
          {publishedByName}
          {publishedAt ? ` · ${publishedAt}` : ""}
        </span>
      ) : null}
    </div>
  );
}

export function rewriteSalesTraceability(node, request = {}) {
  if (Array.isArray(node)) {
    return node.map((child) => rewriteSalesTraceability(child, request));
  }

  if (!isValidElement(node)) return node;

  if (node.props?.className === "sales-detail-hero") {
    const children = Children.toArray(node.props.children);
    const firstChild = children[0];

    if (isValidElement(firstChild)) {
      children[0] = cloneElement(
        firstChild,
        undefined,
        ...Children.toArray(firstChild.props.children),
        <TraceabilityBlock key="fase32a-traceability" request={request} />
      );
    }

    return cloneElement(node, undefined, ...children);
  }

  const children = Children.map(node.props.children, (child) =>
    rewriteSalesTraceability(child, request)
  );

  return cloneElement(node, undefined, children);
}
