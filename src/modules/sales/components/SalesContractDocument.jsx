// Expo ProffDok – FASE 33B.4
// Presentasjonswrapper rundt det testede 33B.3-dokumentet. Selve avtaleteksten
// beholdes i Core; denne wrapperen gjør signaturstatus og avslutning dynamisk.

import { Children, cloneElement, isValidElement } from "react";
import SalesContractDocumentCore from "./SalesContractDocumentCore.jsx";

function formatDateTime(value = "") {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function nodeText(node) {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join(" ");
  if (!isValidElement(node)) return "";
  return Children.toArray(node.props.children).map(nodeText).join(" ");
}

function SignatureSummary({ label, name, at }) {
  const value = name
    ? `${name}${at ? ` · ${formatDateTime(at)}` : ""}`
    : "Avventer signering";

  return (
    <div
      style={{
        display: "grid",
        gap: 3,
        padding: "11px 12px",
        border: "1px solid #d9e7eb",
        borderRadius: 10,
        background: name ? "#f1fbf5" : "#f8fbfc",
      }}
    >
      <span style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>{label}</span>
      <strong style={{ color: name ? "#176b42" : "#0f172a" }}>{value}</strong>
    </div>
  );
}

function SignatureSection({ signatures = {} }) {
  return (
    <section>
      <h3 style={{ margin: "0 0 10px", color: "#183b46" }}>12. Signering</h3>
      <p style={{ margin: "0 0 9px", lineHeight: 1.62, color: "#334155" }}>
        Ved signering bekrefter partene at de har lest kontrakten og at det aksepterte
        tilbudet med eventuelle valgte opsjoner inngår som avtalegrunnlag.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
          gap: 12,
        }}
      >
        <SignatureSummary
          label="Utførende firma"
          name={signatures.companyName || ""}
          at={signatures.companyAt || ""}
        />
        <SignatureSummary
          label="Kunde"
          name={signatures.customerName || ""}
          at={signatures.customerAt || ""}
        />
      </div>
    </section>
  );
}

function ContractFooter() {
  return (
    <section
      style={{
        paddingTop: 18,
        borderTop: "1px solid #d9e7eb",
        color: "#52616b",
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      <strong style={{ display: "block", marginBottom: 5, color: "#183b46" }}>
        Elektronisk avtalegrunnlag
      </strong>
      Kontrakten opprettes og signeres elektronisk i Expo ProffDok. Det aksepterte
      tilbudet med valgte opsjoner og angitte vedlegg inngår i avtalegrunnlaget.
      Ufravikelige rettigheter etter gjeldende lovgivning gjelder.
    </section>
  );
}

function rewriteDocument(node, signatures) {
  if (Array.isArray(node)) {
    return node.map((child) => rewriteDocument(child, signatures));
  }
  if (!isValidElement(node)) return node;

  if (node.props?.number === "12" && node.props?.title === "Signering") {
    return <SignatureSection signatures={signatures} />;
  }

  if (node.type === "section" && nodeText(node).includes("Om kontrakten")) {
    return <ContractFooter />;
  }

  const children = Children.map(node.props.children, (child) =>
    rewriteDocument(child, signatures)
  );
  return cloneElement(node, undefined, children);
}

export default function SalesContractDocument({
  request,
  companyProfile,
  draft,
  signatures = {},
}) {
  // Core inneholder ingen hooks og fungerer her som ren dokument-renderer.
  const documentTree = SalesContractDocumentCore({ request, companyProfile, draft });
  return rewriteDocument(documentTree, signatures);
}
