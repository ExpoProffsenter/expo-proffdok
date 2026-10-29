import { useEffect, useRef, useState } from "react";
import SalesCaseHandlerField from "./SalesCaseHandlerField.jsx";
import { setSalesCaseHandler } from "../services/salesCaseHandlers.js";
import { getSalesSupportCompanyId } from "../services/salesSupabase.js";

export default function SalesCaseHandlerControl({ request, client, companyId, storeOffer, onSaved }) {
  const [choice, setChoice] = useState(null);
  const [state, setState] = useState({ busy: false, error: "", saved: false });
  const scope = `${companyId || ""}:${request.id}:${request.responsibleRevision || 0}`;
  const guard = useRef({ scope, active: true });
  guard.current.scope = scope;
  useEffect(() => {
    guard.current.active = true;
    return () => { guard.current.active = false; };
  }, [scope]);
  useEffect(() => {
    setChoice(null);
    setState({ busy: false, error: "", saved: false });
  }, [request.id, request.responsibleUserId, request.responsibleRevision]);
  const support = Boolean(getSalesSupportCompanyId());
  return <section className="sales-detail-card" aria-label="Saksbehandler for akseptvarsel">
    <h2>Saksbehandler</h2>
    <p>{request.responsibleUserId ? `Registrert: ${request.responsible || request.projectResponsible || "Valgt bruker"}` : "Saken mangler en bekreftet saksbehandler. Internt akseptvarsel sendes først når en bruker er valgt og lagret."}</p>
    {support ? <p>Saksbehandler kan bare endres i firmaets ordinære arbeidsflate.</p> : <>
      <SalesCaseHandlerField client={client} companyId={companyId} storeOffer={storeOffer} userId={choice?.userId || request.responsibleUserId || ""} onChoose={candidate => { setChoice(candidate); setState({ busy: false, error: "", saved: false }); }} disabled={state.busy} />
      <button className="sales-secondary-button" type="button" disabled={state.busy || !choice} onClick={async () => {
        if (!choice || state.busy) return;
        setState({ busy: true, error: "", saved: false });
        try {
          const saved = await setSalesCaseHandler(client, companyId, request.id, choice.userId, request.responsibleRevision);
          if (!guard.current.active || guard.current.scope !== scope) return;
          onSaved(saved);
          setChoice(null);
          setState({ busy: false, error: "", saved: true });
        } catch (error) {
          if (!guard.current.active || guard.current.scope !== scope) return;
          setState({ busy: false, error: error.message || "Kunne ikke lagre saksbehandler. Last saken på nytt hvis den er endret av andre.", saved: false });
        }
      }}>{state.busy ? "Lagrer …" : "Lagre saksbehandler"}</button>
      {state.error ? <p role="alert">{state.error}</p> : null}
      {state.saved ? <p role="status">Saksbehandleren er lagret. Ingen e-post er sendt av denne endringen.</p> : null}
    </>}
  </section>;
}
