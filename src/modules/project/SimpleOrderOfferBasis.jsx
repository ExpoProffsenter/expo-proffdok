// Expo ProffDok – FASE 45B
// Read-only tilbudsgrunnlag for Enkel ordre. Innholdet kommer utelukkende fra
// snapshotet som ble låst ved kundeaksept; ingen Sales-data hentes eller endres her.

import { FileCheck2, LockKeyhole } from "lucide-react";
import {
  AcceptedOfferGroups,
  AcceptedTotalSummary,
} from "../sales/components/SalesAcceptedPresentation.jsx";

const clean = (value = "") => String(value ?? "").trim();
const list = (value) => (Array.isArray(value) ? value : []);

export function isSimpleOrderProject(project = {}) {
  return (
    clean(project?.workflowType).toLowerCase() === "simple_order" ||
    project?.simpleOrder === true
  );
}

export function buildSimpleOrderAcceptedRequest(project = {}, tilbud = {}) {
  const snapshot = tilbud?.acceptedOfferSnapshot || {};
  const salesOrigin = project?.salesOrigin || {};
  const lines = list(snapshot?.lines);
  const options = list(snapshot?.selectedOptions);
  const version =
    snapshot?.sourceVersionNumber ||
    salesOrigin?.acceptedOfferVersionNumber ||
    "";

  return {
    id: clean(salesOrigin?.requestRef),
    customer: clean(project?.customer),
    address: [project?.address, project?.postnr, project?.city]
      .map(clean)
      .filter(Boolean)
      .join(" "),
    acceptedBy: clean(salesOrigin?.acceptedBy),
    acceptedAt: clean(salesOrigin?.acceptedAt),
    acceptedOfferVersionNumber: version,
    acceptedOfferLines: lines,
    acceptedOptions: options,
    acceptedPayload: {
      version_number: version,
      selected_options: options,
      version_snapshot: {
        version_number: version,
        lines,
      },
    },
  };
}

function formatAcceptedAt(value) {
  if (!value) return "Ikke registrert";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return clean(value);
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function MetaCard({ label, value }) {
  return (
    <div className="simpleOrderOfferMetaCard">
      <span>{label}</span>
      <strong>{value || "Ikke registrert"}</strong>
    </div>
  );
}

export default function SimpleOrderOfferBasis({ project = {}, tilbud = {} }) {
  const request = buildSimpleOrderAcceptedRequest(project, tilbud);
  const hasSnapshot = request.acceptedOfferLines.length > 0;
  const versionLabel = request.acceptedOfferVersionNumber
    ? `v${request.acceptedOfferVersionNumber}`
    : "Ikke registrert";

  return (
    <section
      className="simpleOrderOfferBasis"
      data-simple-order-accepted-offer-basis="true"
      aria-label="Låst tilbudsgrunnlag for Enkel ordre"
    >
      <div className="simpleOrderOfferHeader">
        <div className="simpleOrderOfferHeading">
          <span className="simpleOrderOfferIcon" aria-hidden="true">
            <FileCheck2 size={22} />
          </span>
          <div>
            <span className="simpleOrderOfferEyebrow">Enkel ordre</span>
            <h2>Tilbudsgrunnlag</h2>
            <p>
              Låst kopi av tilbudsversjonen kunden aksepterte. Visningen er
              skrivebeskyttet og påvirker ikke salgssaken.
            </p>
          </div>
        </div>
        <span className="simpleOrderOfferLock">
          <LockKeyhole size={16} /> Låst aksept
        </span>
      </div>

      <div className="simpleOrderOfferMeta">
        <MetaCard label="Sak" value={request.id} />
        <MetaCard label="Tilbudsversjon" value={versionLabel} />
        <MetaCard label="Akseptert av" value={request.acceptedBy} />
        <MetaCard label="Akseptert" value={formatAcceptedAt(request.acceptedAt)} />
      </div>

      {hasSnapshot ? (
        <div className="simpleOrderOfferSnapshot">
          <AcceptedOfferGroups request={request} />
          <AcceptedTotalSummary request={request} />
        </div>
      ) : (
        <div className="simpleOrderOfferMissing" role="status">
          Det låste tilbudssnapshotet mangler. Åpne salgssaken for å kontrollere
          akseptgrunnlaget før ordren behandles videre.
        </div>
      )}

      <style>{`
        .simpleOrderOfferBasis{position:relative}.simpleOrderOfferHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.simpleOrderOfferHeading{display:flex;align-items:flex-start;gap:13px;min-width:0}.simpleOrderOfferIcon{width:44px;height:44px;border-radius:14px;background:#e7f8fa;color:#087c85;display:grid;place-items:center;flex:0 0 auto}.simpleOrderOfferEyebrow{display:block;color:#087c85;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}.simpleOrderOfferHeading h2{margin:2px 0 5px}.simpleOrderOfferHeading p{margin:0;color:#5f727d;line-height:1.5}.simpleOrderOfferLock{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:#e9f8ee;color:#176b42;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap}.simpleOrderOfferMeta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:20px}.simpleOrderOfferMetaCard{padding:12px 14px;border:1px solid #d7e4ea;border-radius:13px;background:#fbfdfe;min-width:0}.simpleOrderOfferMetaCard span{display:block;color:#64748b;font-size:12px;font-weight:800;margin-bottom:3px}.simpleOrderOfferMetaCard strong{display:block;color:#10212b;overflow-wrap:anywhere}.simpleOrderOfferSnapshot{margin-top:20px}.simpleOrderOfferSnapshot>div:first-child{margin-top:0!important}.simpleOrderOfferSnapshot section{padding:0;margin-bottom:0;box-shadow:none}.simpleOrderOfferMissing{margin-top:20px;padding:16px;border:1px solid #f1c27d;border-radius:14px;background:#fff8e8;color:#8a4b08;font-weight:750;line-height:1.5}
        @media(max-width:760px){.simpleOrderOfferHeader{display:grid}.simpleOrderOfferLock{width:max-content}.simpleOrderOfferMeta{grid-template-columns:1fr 1fr}.simpleOrderOfferHeading{display:grid}.simpleOrderOfferSnapshot section>div{min-width:0}.simpleOrderOfferSnapshot section>div>div{min-width:0}}
        @media(max-width:480px){.simpleOrderOfferMeta{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
