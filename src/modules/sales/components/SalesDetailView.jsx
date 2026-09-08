// Expo ProffDok – FASE 37D2 / FASE 33B.5 / FASE 33B.4 / FASE 33B.3 / FASE 32A / FASE 31C / FASE 31A2B / FASE 31B / FASE 30C2 UX / FASE 39B.2C
// Butikktilbud avsluttes ved aksept: prosjektsteg, kontrakt og prosjektaktivering
// fjernes fra butikkflyten, mens ordinære tilbud beholder eksisterende flyt.
// FASE 39B.2: avvist Butikktilbud får eget avsluttet neste-steg-kort og skal aldri
// falle tilbake til tekst om befaring eller planlegging. Den avviste publiserte
// versjonen kan fortsatt åpnes skrivebeskyttet fra saken.
// FASE 33B.5 viser kontraktsstatus, kundelenke og signert PDF direkte i kontraktkortet.
// FASE 33B.4 gjør akseptbevisets neste-steg-tekst kompatibelt med det nye valgfrie kontraktsteget.
// FASE 33B.3 legger til et frivillig valg om enkel Expo-kontrakt i eksisterende
// kontraktkort etter aksept. Opplasting av egen kontrakt og prosjektaktivering beholdes urørt.
// Aktiv kontraktsveiviser huskes i sessionStorage slik at fanebytte/remount ikke
// sender brukeren tilbake til tilbudssaken midt i utfyllingen.
// FASE 32A viser serverstemplet creator og publisher internt uten å forveksle
// disse med ansvarlig. Gamle saker uten nye snapshot-felt får ingen kunstig creator.
// Intern tilbudsvisning og låst akseptvisning følger samme hovedpostrekkefølge
// som kundelink og dokumenter. Akseptdata, lagring og prosjektaktivering er uendret.
// FASE 39B.2C viser Butikktilbud-avsnitt som prisnøytrale overskrifter uten linjenummer.

import { Children, cloneElement, isValidElement, useEffect, useState } from "react";
import SalesDetailViewCore from "./SalesDetailViewCore.jsx";
import SalesContractWizard from "./SalesContractWizard.jsx";
import SalesContractActions from "./SalesContractActions.jsx";
import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";
import { formatNok, getOfferTotal } from "../utils/salesUtils.js";
import {
  getStoreSectionTitle,
  isStoreSectionLine,
} from "../utils/salesOfferQuantityPresentation.js";
import { createAcceptanceProofPdf } from "../services/salesAcceptancePdf.js";
import { isStoreOfferRequest } from "../services/salesStoreOffers.js";
import { rewriteAcceptedPresentation } from "./SalesAcceptedPresentation.jsx";
import { rewriteSalesTraceability } from "./SalesTraceabilityPresentation.jsx";

const LEGACY_MAIN_POST = {
  id: "ovrige-arbeider",
  title: "Øvrige arbeider",
};

const CONTRACT_WIZARD_OPEN_PREFIX = "expo-proffdok:sales-contract-wizard-open:";

function getContractWizardOpenKey(requestId = "") {
  const normalized = String(requestId || "").trim();
  return normalized ? `${CONTRACT_WIZARD_OPEN_PREFIX}${normalized}` : "";
}

function isContractWizardRememberedOpen(requestId = "") {
  if (typeof window === "undefined") return false;
  const key = getContractWizardOpenKey(requestId);
  if (!key) return false;
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function rememberContractWizardOpen(requestId = "", open = false) {
  if (typeof window === "undefined") return;
  const key = getContractWizardOpenKey(requestId);
  if (!key) return;
  try {
    if (open) window.sessionStorage.setItem(key, "1");
    else window.sessionStorage.removeItem(key);
  } catch {
    // Sessionlagring er kun UX-sikkerhet. Eksisterende Sales-flyt skal fungere uten.
  }
}

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
    if (line?.__companyMeta || line?.__offerTermsMeta || line?.__storeOfferMeta) return;
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

function getStoredResponsible(request = {}, fallback = "") {
  return (
    [
      request?.projectResponsible,
      request?.surveyResponsible,
      request?.responsible,
      fallback,
    ]
      .map((value) => String(value || "").trim())
      .find(Boolean) || ""
  );
}

function getInternalOptionMeta(option = {}) {
  const amount = getOfferTotal([option]);
  const isAlternative = option?.optionType === "alternative";
  const isReduction = !isAlternative && amount < 0;

  return {
    typeLabel: isAlternative
      ? "Alternativ / erstatter"
      : isReduction
        ? "Fradrag / prisreduksjon"
        : "Tillegg / oppgradering",
    priceLabel: isAlternative
      ? "Prisendring"
      : isReduction
        ? "Fradrag"
        : "Tillegg",
    amount,
  };
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

function rewriteAcceptanceProofContinuationText(node) {
  if (typeof node === "string") {
    if (
      node ===
      "Akseptbeviset er opprettet og lagret. Fortsett direkte til prosjektaktivering når du er klar."
    ) {
      return "Akseptbeviset er opprettet og lagret. Du kan nå opprette kontrakt eller fortsette til prosjektaktivering.";
    }
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(rewriteAcceptanceProofContinuationText);
  }

  if (!isValidElement(node)) return node;

  const children = Children.map(
    node.props.children,
    rewriteAcceptanceProofContinuationText
  );

  return cloneElement(node, undefined, children);
}

function reactNodeText(node) {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeText).join(" ").trim();
  if (!isValidElement(node)) return "";
  return Children.toArray(node.props.children).map(reactNodeText).join(" ").trim();
}

function rewriteStoreOfferAcceptedFlow(node) {
  if (typeof node === "string") {
    const replacements = new Map([
      ["Klar for prosjektaktivering", "Butikktilbud akseptert"],
      [
        "Kunden har akseptert tilbudet. Akseptert innhold låses i denne flyten før senere prosjektaktivering.",
        "Kunden har akseptert butikktilbudet. Aksepten og den publiserte tilbudsversjonen er låst, og saken avsluttes i Sales.",
      ],
      [
        "Akseptbeviset er opprettet og lagret. Fortsett direkte til prosjektaktivering når du er klar.",
        "Akseptbeviset er opprettet og lagret. Butikktilbudet er ferdig behandlet.",
      ],
      [
        "Akseptbeviset er opprettet og lagret. Du kan nå opprette kontrakt eller fortsette til prosjektaktivering.",
        "Akseptbeviset er opprettet og lagret. Butikktilbudet er ferdig behandlet.",
      ],
      [
        "Låst dokument - følger automatisk med til prosjektet.",
        "Låst dokumentasjon av det aksepterte butikktilbudet.",
      ],
      [
        "Neste steg er å aktivere saken som et vanlig ProffDok-prosjekt.",
        "Butikktilbudet er akseptert og avsluttet i Sales. Det opprettes ikke ProffDok-prosjekt.",
      ],
    ]);
    return replacements.get(node) || node;
  }

  if (Array.isArray(node)) {
    return node.map(rewriteStoreOfferAcceptedFlow).filter(Boolean);
  }

  if (!isValidElement(node)) return node;

  const classNames = String(node.props?.className || "").split(/\s+/).filter(Boolean);
  if (classNames.includes("sales-workflow")) {
    return null;
  }

  const text = reactNodeText(node).replace(/\s+/g, " ").trim();
  if (
    node.type === "button" &&
    (text === "Aktiver som prosjekt" || text === "Fortsett til prosjektaktivering")
  ) {
    return null;
  }

  if (
    String(node.props?.className || "").includes("sales-workflow-step") &&
    text === "Prosjekt"
  ) {
    return null;
  }

  const directChildren = Children.toArray(node.props.children);
  const firstText = reactNodeText(directChildren[0]).replace(/\s+/g, " ").trim();
  const secondText = reactNodeText(directChildren[1]).replace(/\s+/g, " ").trim();
  if (
    firstText === "Kontrakt" &&
    secondText.includes("Håndverksbedriften kan laste opp sin egen ferdigstilte kontrakt")
  ) {
    return null;
  }

  const children = Children.map(node.props.children, rewriteStoreOfferAcceptedFlow);
  return cloneElement(node, undefined, children);
}

function buildDeclinedOfferHref(publicToken = "") {
  const token = String(publicToken || "").trim();
  if (!token || typeof window === "undefined") return "";

  const params = new URLSearchParams();
  if (window.location.hostname.endsWith(".vercel.app")) {
    params.set("progressTest", "safe");
  }
  params.set("publicOffer", token);
  return `${window.location.pathname}?${params.toString()}`;
}

function rewriteStoreOfferDeclinedFlow(node, request = {}) {
  if (Array.isArray(node)) {
    return node.map((child) => rewriteStoreOfferDeclinedFlow(child, request));
  }
  if (!isValidElement(node)) return node;

  if (
    request?.status === "Avvist" &&
    String(node.props?.className || "").includes("sales-next-card")
  ) {
    const declinedBy = String(request?.declinedBy || "").trim();
    const customerHref = buildDeclinedOfferHref(request?.publicToken);
    return cloneElement(node, undefined, [
      <span className="sales-next-label" key="store-declined-label">Neste steg</span>,
      <h2 key="store-declined-title">Tilbudet er avvist</h2>,
      <p key="store-declined-summary" style={{ marginBottom: 10 }}>
        {declinedBy
          ? `Kunden har avvist tilbudet. Avvisningen er registrert av ${declinedBy}, og saken er avsluttet i Sales.`
          : "Kunden har avvist tilbudet. Avvisningen er registrert, og saken er avsluttet i Sales."}
      </p>,
      <p key="store-declined-action" style={{ marginBottom: customerHref ? 14 : 0 }}>
        Det sendes ikke flere automatiske påminnelser. Det avviste tilbudet beholdes som historikk og slettes ikke.
      </p>,
      customerHref ? (
        <a
          key="store-declined-open-offer"
          className="sales-secondary-button"
          href={customerHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ justifySelf: "start", width: "fit-content" }}
        >
          Se avvist tilbud
        </a>
      ) : null,
    ]);
  }

  const children = Children.map(node.props.children, (child) =>
    rewriteStoreOfferDeclinedFlow(child, request)
  );
  return cloneElement(node, undefined, children);
}

function rewriteContractChoice(node, request, onOpenWizard) {
  if (Array.isArray(node)) {
    return node.map((child) => rewriteContractChoice(child, request, onOpenWizard));
  }
  if (!isValidElement(node)) return node;

  const directChildren = Children.toArray(node.props.children);
  const headingText = reactNodeText(directChildren[0]);
  const introText = reactNodeText(directChildren[1]);
  const isContractCard =
    request?.status === "Akseptert" &&
    headingText === "Kontrakt" &&
    introText.includes("Håndverksbedriften kan laste opp sin egen ferdigstilte kontrakt.");

  if (isContractCard) {
    const intro = isValidElement(directChildren[1])
      ? cloneElement(
          directChildren[1],
          undefined,
          request?.contractFile
            ? "Egen kontrakt er lastet opp på saken. Dersom en Expo-kontrakt også er opprettet, vises status og handlinger direkte her."
            : "Velg om du vil opprette en enkel kontrakt i Expo ProffDok eller laste opp bedriftens egen kontrakt. Begge valgene bygger videre på det aksepterte tilbudet."
        )
      : directChildren[1];

    const choice = (
      <div
        key="fase33b5-expo-contract-actions"
        style={{ margin: "0 0 14px" }}
      >
        <SalesContractActions request={request} onOpenWizard={onOpenWizard} />
      </div>
    );

    return cloneElement(node, undefined, [
      directChildren[0],
      intro,
      choice,
      ...directChildren.slice(2),
    ]);
  }

  const children = Children.map(node.props.children, (child) =>
    rewriteContractChoice(child, request, onOpenWizard)
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
    const storeOffer = isStoreOfferRequest(request);

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
        const pricedLines = group.lines.filter((line) => !isStoreSectionLine(line));
        const groupBaseTotal = getOfferTotal(pricedLines);
        const visibleGroupTitle =
          storeOffer && String(group.title || "").trim().toLowerCase() === "varer"
            ? "Leveranse"
            : group.title;
        let pricedLineIndex = 0;

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
                  {visibleGroupTitle}
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
                  {storeOffer && String(group.title || "").trim().toLowerCase() === "varer"
                    ? "Sum leveranse"
                    : "Sum hovedpost"}
                </span>
                <strong style={{ display: "block", fontSize: 16 }}>
                  {formatNok(groupBaseTotal)}
                </strong>
                <small style={{ color: "#64748b" }}>eks. mva.</small>
              </div>
            </div>

            {group.lines.length ? (
              <div style={{ display: "grid", gap: 8, padding: "12px 16px" }}>
                {group.lines.map((line, lineIndex) => {
                  if (isStoreSectionLine(line)) {
                    const body = String(line?.storeTextBody || "").trim();
                    return (
                      <div
                        key={line.id || `${group.id}-section-${lineIndex}`}
                        style={{
                          display: "grid",
                          gap: body ? 4 : 0,
                          margin: "6px 0 2px",
                          padding: "14px 16px",
                          border: "1px solid #c9e8ec",
                          borderLeft: "5px solid #16aeb9",
                          borderRadius: 12,
                          background: "linear-gradient(135deg,#edf9fb 0%,#ffffff 100%)",
                        }}
                      >
                        <strong style={{ color: "#10212b", fontSize: 18 }}>
                          {getStoreSectionTitle(line)}
                        </strong>
                        {body ? (
                          <span style={{ color: "#52616b", lineHeight: 1.45 }}>
                            {body}
                          </span>
                        ) : null}
                      </div>
                    );
                  }

                  const displayIndex = pricedLineIndex + 1;
                  pricedLineIndex += 1;
                  return (
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
                        {groupNumber}.{displayIndex}
                      </strong>
                      <span>{line.description || "Tilbudspost"}</span>
                      <strong style={{ textAlign: "right", whiteSpace: "nowrap" }}>
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
                  borderTop: group.lines.length ? "1px dashed #cbd5e1" : "none",
                  background: "#fbfdfe",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <strong style={{ color: "#0f172a" }}>Opsjoner</strong>
                  <span style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>
                    {group.options.length} registrert
                  </span>
                </div>

                {group.options.map((option, optionIndex) => {
                  const optionMeta = getInternalOptionMeta(option);

                  return (
                    <div
                      key={option.id || `${group.id}-option-${optionIndex}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) minmax(150px, auto)",
                        gap: 14,
                        alignItems: "start",
                        padding: "10px 12px",
                        border: "1px solid #dce7eb",
                        borderRadius: 12,
                        background: "#ffffff",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: "inline-block",
                            marginBottom: 5,
                            color: "#0f7f87",
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
                        {option.description ? (
                          <span
                            style={{
                              display: "block",
                              marginTop: 4,
                              color: "#52616b",
                              lineHeight: 1.4,
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
      })
    );
  }

  const children = Children.map(node.props.children, (child) =>
    rewriteInternalOfferPresentation(child, request)
  );

  return cloneElement(node, undefined, children);
}

function isPreviewDeployment() {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith(".vercel.app");
}

async function openAcceptanceProofPreview(request, companyProfile = {}) {
  const previewWindow = window.open("", "_blank");
  if (previewWindow) {
    previewWindow.document.title = "Genererer akseptbevis …";
    previewWindow.document.body.innerHTML =
      '<div style="font-family:system-ui;padding:32px;color:#183b46">Genererer forhåndsvisning av akseptbevis …</div>';
  }

  try {
    const { blob } = await createAcceptanceProofPdf({
      selectedRequest: request,
      companyProfile,
    });
    const blobUrl = URL.createObjectURL(blob);
    if (previewWindow) {
      previewWindow.location.replace(blobUrl);
    } else {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
  } catch (error) {
    previewWindow?.close?.();
    window.alert(
      error instanceof Error
        ? `Akseptbeviset kunne ikke forhåndsvises: ${error.message}`
        : "Akseptbeviset kunne ikke forhåndsvises."
    );
  }
}

function AcceptanceProofPreviewButton({ request, companyProfile }) {
  if (!request?.acceptedAt || !isPreviewDeployment()) return null;

  return (
    <button
      type="button"
      onClick={() => openAcceptanceProofPreview(request, companyProfile)}
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 24000,
        border: "1px solid #83cfd4",
        borderRadius: 999,
        padding: "12px 18px",
        background: "#ffffff",
        color: "#0b737b",
        fontWeight: 900,
        boxShadow: "0 12px 30px rgba(15, 118, 128, .18)",
        cursor: "pointer",
      }}
      title="Kun i Vercel Preview. PDF-en genereres lokalt og lagres ikke."
    >
      Forhåndsvis nytt akseptbevis (uten lagring)
    </button>
  );
}

export default function SalesDetailView(props) {
  const selectedRequestId = String(props?.selectedRequest?.id || "");
  const storeOffer = isStoreOfferRequest(props?.selectedRequest);
  const [contractWizardOpen, setContractWizardOpen] = useState(() =>
    isContractWizardRememberedOpen(selectedRequestId)
  );
  const storedResponsible = getStoredResponsible(
    props?.selectedRequest,
    props?.loggedInResponsible
  );
  const coreProps = storedResponsible
    ? { ...props, loggedInResponsible: storedResponsible }
    : props;
  const hasExistingOfferDraft = Boolean(
    coreProps?.selectedRequest?.status === "Befaring" &&
      hasMeaningfulOfferDraft(coreProps.selectedRequest)
  );

  useEffect(() => {
    setContractWizardOpen(
      storeOffer ? false : isContractWizardRememberedOpen(selectedRequestId)
    );
  }, [selectedRequestId, storeOffer]);

  function openContractWizard() {
    if (storeOffer) return;
    rememberContractWizardOpen(selectedRequestId, true);
    setContractWizardOpen(true);
  }

  function closeContractWizard() {
    rememberContractWizardOpen(selectedRequestId, false);
    setContractWizardOpen(false);
  }

  if (
    !storeOffer &&
    contractWizardOpen &&
    coreProps?.selectedRequest?.status === "Akseptert"
  ) {
    return (
      <SalesContractWizard
        request={coreProps.selectedRequest}
        onClose={closeContractWizard}
      />
    );
  }

  let tree = SalesDetailViewCore(coreProps);
  tree = rewriteInternalOfferPresentation(tree, coreProps?.selectedRequest);
  tree = rewriteAcceptedPresentation(tree, coreProps?.selectedRequest);
  tree = rewriteSalesTraceability(tree, coreProps?.selectedRequest);
  if (!storeOffer) {
    tree = rewriteContractChoice(
      tree,
      coreProps?.selectedRequest,
      openContractWizard
    );
    tree = rewriteAcceptanceProofContinuationText(tree);
  } else {
    tree = rewriteStoreOfferAcceptedFlow(tree);
    tree = rewriteStoreOfferDeclinedFlow(tree, coreProps?.selectedRequest);
  }

  if (hasExistingOfferDraft) {
    // SalesDetailViewCore er bevisst hook-fri. Vi materialiserer derfor treet her
    // og endrer kun de to konkrete handlingslabelene – aldri status eller nextStep.
    tree = rewriteOfferContinuationLabels(tree);
  }

  return (
    <>
      {tree}
      <AcceptanceProofPreviewButton
        request={coreProps?.selectedRequest}
        companyProfile={coreProps?.companyProfile || {}}
      />
    </>
  );
}
