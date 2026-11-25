// Expo ProffDok – Production-QA UX
// Lar et ordinært prosjekt fortsette kontraktløpet direkte fra Avtalegrunnlag.
// Samme låste aksept og samme kontraktmotor som i Sales brukes; ingen kopiert kontraktflyt.

import { useEffect, useMemo, useState } from "react";
import { FileSignature, LockKeyhole } from "lucide-react";
import SalesContractActions from "../sales/components/SalesContractActions.jsx";
import SalesContractWizard from "../sales/components/SalesContractWizard.jsx";
import CordelOfferExport from "../cordel/CordelOfferExport.jsx";
import {
  createDefaultSalesSupabaseClient,
  getSalesOfferByToken,
} from "../sales/services/salesSupabase.js";
import "../sales/sales.css";
import {
  buildProjectSalesContractRequest,
  hasProjectSalesOrigin,
  publicOfferMatchesProjectOrigin,
} from "./projectSalesContractRequest.mjs";

const clean = (value = "") => String(value ?? "").trim();

export default function ProjectSalesContractActions({
  project = {},
  tilbud = {},
  readOnly = false,
  onProjectSynced,
}) {
  const client = useMemo(() => createDefaultSalesSupabaseClient(), []);
  const salesOrigin = project?.salesOrigin || {};
  const publicToken = clean(salesOrigin?.publicToken);
  const [publicOfferData, setPublicOfferData] = useState(null);
  const [loadingBasis, setLoadingBasis] = useState(Boolean(publicToken));
  const [basisError, setBasisError] = useState("");
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    let active = true;
    setPublicOfferData(null);
    setBasisError("");
    setShowWizard(false);

    if (!publicToken) {
      setLoadingBasis(false);
      return () => {
        active = false;
      };
    }

    setLoadingBasis(true);
    getSalesOfferByToken(client, publicToken)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) throw error;
        if (!publicOfferMatchesProjectOrigin(project, data)) {
          throw new Error("Den låste, aksepterte tilbudsversjonen samsvarer ikke med prosjektet.");
        }
        setPublicOfferData(data);
      })
      .catch((error) => {
        if (!active) return;
        setBasisError(
          error instanceof Error
            ? error.message
            : "Kontraktsgrunnlaget kunne ikke hentes."
        );
      })
      .finally(() => {
        if (active) setLoadingBasis(false);
      });

    return () => {
      active = false;
    };
  }, [client, publicToken]);

  const request = useMemo(
    () => buildProjectSalesContractRequest({ project, tilbud, publicOfferData }),
    [project, tilbud, publicOfferData]
  );

  if (!hasProjectSalesOrigin(project)) return null;

  const hasSnapshotBasis = Boolean(
    request?.salesOfferId &&
      request?.acceptedOfferVersionId &&
      tilbud?.acceptedOfferSnapshot?.lines?.length
  );
  const acceptedBasisReady =
    publicOfferMatchesProjectOrigin(project, publicOfferData) || hasSnapshotBasis;
  const creationDisabledReason = acceptedBasisReady
    ? ""
    : loadingBasis
      ? "Henter låst tilbudsgrunnlag før kontrakten kan opprettes."
      : basisError ||
        "Denne eldre prosjektkoblingen mangler et komplett, låst tilbudsgrunnlag. Bruk opplasting av egen kontrakt under."
  const canOpenWizard = !readOnly && !creationDisabledReason;

  if (showWizard && canOpenWizard) {
    return (
      <div data-project-sales-contract-wizard="true">
        <SalesContractWizard request={request} onClose={() => setShowWizard(false)} />
      </div>
    );
  }

  return (
    <div
      className="item"
      data-project-sales-contract-entry="true"
      data-contract-source-request-ref={request?.id || ""}
      style={{
        marginBottom: 14,
        borderColor: "#9fd6da",
        background: "#f2fbfc",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
            color: "#ffffff",
            background: "#0b737b",
          }}
        >
          {readOnly ? <LockKeyhole size={19} /> : <FileSignature size={19} />}
        </span>
        <div>
          <h3 style={{ margin: "0 0 5px" }}>Kontrakt fra prosjektet</h3>
          <p className="note" style={{ margin: 0 }}>
            Tilbudet er akseptert. Opprett Expo-kontrakt her, last opp bedriftens egen
            kontrakt under, eller fortsett uten kontrakt når prosjektet ikke krever det.
            Du trenger ikke gå tilbake til Tilbud.
          </p>
        </div>
      </div>

      {request?.contractFile ? (
        <div style={{ color: "#176b42", fontWeight: 750 }}>
          Kontraktdokument er allerede registrert i Avtalegrunnlag.
        </div>
      ) : null}

      <SalesContractActions
        request={request}
        readOnly={readOnly}
        creationDisabledReason={creationDisabledReason}
        onProjectSynced={onProjectSynced}
        projectContractFile={request?.contractFile}
        onOpenWizard={() => {
          if (canOpenWizard) setShowWizard(true);
        }}
      />
      <CordelOfferExport request={request} enabled={acceptedBasisReady} disabled={readOnly} />
    </div>
  );
}
