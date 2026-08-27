// Expo ProffDok – FASE 32A
// Kun intern presentasjon. Viser bare serverstemplet creator/publisher og holder
// disse adskilt fra ansvarlig. Gamle saker uten creator-snapshot får ingen
// kunstig Opprettet av-verdi.

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from "react";

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

function getRuntimeCreator(request = {}) {
  const requestRef = String(request?.id || "");
  const cached =
    typeof window !== "undefined" && requestRef
      ? window.__expoProffDokSalesTraceability?.[requestRef]
      : null;

  return {
    name: String(request.__createdByName || cached?.createdByName || "").trim(),
    createdAt: request.__createdAt || cached?.createdAt || "",
  };
}

function TraceabilityBlock({ request = {} }) {
  const requestRef = String(request?.id || "");
  const [creator, setCreator] = useState(() => getRuntimeCreator(request));

  useEffect(() => {
    setCreator(getRuntimeCreator(request));

    const handleTraceability = (event) => {
      if (String(event?.detail?.requestRef || "") !== requestRef) return;
      const name = String(event?.detail?.createdByName || "").trim();
      if (!name) return;
      setCreator({
        name,
        createdAt: event?.detail?.createdAt || "",
      });
    };

    window.addEventListener(
      "expo-proffdok-sales-traceability",
      handleTraceability
    );
    return () =>
      window.removeEventListener(
        "expo-proffdok-sales-traceability",
        handleTraceability
      );
  }, [requestRef, request.__createdByName, request.__createdAt]);

  const creatorName = creator.name;
  const createdAt = creatorName ? formatTraceTime(creator.createdAt) : "";
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

  // Gamle saker uten ny creator/publisher-sporbarhet endres ikke visuelt.
  if (!creatorName && !publishedByName) return null;

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
