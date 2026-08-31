// Expo ProffDok – FASE 33B.3 / FASE 32A / FASE 31C / FASE 31A2B / FASE 31B / FASE 30C2 UX
// FASE 33B.3 legger til et frivillig valg om enkel Expo-kontrakt i eksisterende
// kontraktkort etter aksept. Opplasting av egen kontrakt og prosjektaktivering beholdes urørt.
// FASE 32A viser serverstemplet creator og publisher internt uten å forveksle
// disse med ansvarlig. Gamle saker uten nye snapshot-felt får ingen kunstig creator.
// Intern tilbudsvisning og låst akseptvisning følger samme hovedpostrekkefølge
// som kundelink og dokumenter. Akseptdata, lagring og prosjektaktivering er uendret.

import { Children, cloneElement, isValidElement, useState } from "react";
import { FileSignature } from "lucide-react";
import SalesDetailViewCore from "./SalesDetailViewCore.jsx";
import SalesContractWizard from "./SalesContractWizard.jsx";
import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";
import { formatNok, getOfferTotal } from "../utils/salesUtils.js";
import { createAcceptanceProofPdf } from "../services/salesAcceptancePdf.js";
import { rewriteAcceptedPresentation } from "./SalesAcceptedPresentation.jsx";
import { rewriteSalesTraceability } from "./SalesTraceabilityPresentation.jsx";

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

function reactNodeText(node) {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeText).join(" ").trim();
  if (!isValidElement(node)) return "";
  return Children.toArray(node.props.children).map(reactNodeText).join(" ").trim();
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
            ? "Egen kontrakt er lastet opp på saken. Du kan beholde denne som gjeldende kontraktsvalg eller fjerne den og opprette en enkel kontrakt i Expo ProffDok."
            : "Velg om du vil opprette en enkel kontrakt i Expo ProffDok eller laste opp bedriftens egen kontrakt. Begge valgene bygger videre på det aksepterte tilbudet."
        )
      : directChildren[1];

    const choice = request?.contractFile ? null : (
      <div
        key="fase33b3-expo-contract-choice"
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          margin: "0 0 14px",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #b9e0e3",
          background: "#eefafb",
        }}
      >
        <button
          className="sales-primary-button"
          type="button"
          onClick={onOpenWizard}
        >
          <FileSignature size={18} />
          Opprett / åpne enkel kontrakt
        </button>
        <span style={{ color: "#42606b", fontWeight: 700 }}>
          Eller bruk «Last opp egen kontrakt» under.
        </span>
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
  const [contractWizardOpen, setContractWizardOpen] = useState(false);
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

  if (contractWizardOpen && coreProps?.selectedRequest?.status === "Akseptert") {
    return (
      <SalesContractWizard
        request={coreProps.selectedRequest}
        onClose={() => setContractWizardOpen(false)}
      />
    );
  }

  let tree = SalesDetailViewCore(coreProps);
  tree = rewriteInternalOfferPresentation(tree, coreProps?.selectedRequest);
  tree = rewriteAcceptedPresentation(tree, coreProps?.selectedRequest);
  tree = rewriteSalesTraceability(tree, coreProps?.selectedRequest);
  tree = rewriteContractChoice(
    tree,
    coreProps?.selectedRequest,
    () => setContractWizardOpen(true)
  );

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
