// Expo ProffDok – FASE 30C2 UX
// Tynn presentasjons-wrapper rundt eksisterende SalesDetailView. Når en Befaring-sak
// allerede har reelt tilbudsinnhold, endres kun brukerens handlingslabel fra
// «Opprett tilbud …» til «Fortsett på tilbud». Eksisterende arbeidsflyt og callbacks
// beholdes uendret. Core-filen er fortsatt presentasjonsren og bruker ingen React-hooks.

import { Children, cloneElement, isValidElement } from "react";
import SalesDetailViewCore from "./SalesDetailViewCore.jsx";

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

export default function SalesDetailView(props) {
  const hasExistingOfferDraft = Boolean(
    props?.selectedRequest?.status === "Befaring" &&
      hasMeaningfulOfferDraft(props.selectedRequest)
  );

  if (!hasExistingOfferDraft) {
    return <SalesDetailViewCore {...props} />;
  }

  // SalesDetailViewCore er bevisst hook-fri. Vi materialiserer derfor treet her
  // og endrer kun de to konkrete handlingslabelene – aldri status eller nextStep.
  return rewriteOfferContinuationLabels(SalesDetailViewCore(props));
}
