import { useEffect, useState } from "react";
import { fetchSalesCaseHandlers } from "../services/salesCaseHandlers.js";

export default function SalesCaseHandlerField({ client, companyId, storeOffer = false, userId = "", onChoose, disabled = false }) {
  const [state, setState] = useState({ loading: true, error: "", candidates: [] });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: "", candidates: [] });
    if (disabled) return () => { cancelled = true; };
    fetchSalesCaseHandlers(client, companyId, storeOffer).then(candidates => {
      if (!cancelled) setState({ loading: false, error: "", candidates });
    }).catch(error => {
      if (!cancelled) setState({ loading: false, error: error.message || "Kunne ikke hente saksbehandlere.", candidates: [] });
    });
    return () => { cancelled = true; };
  }, [client, companyId, storeOffer, disabled, retry]);
  const missing = userId && !state.candidates.some(candidate => candidate.userId === userId);
  return <div className="sales-field sales-field-full">
    <label>
      <span>Saksbehandler *</span>
      <select aria-label="Saksbehandler" value={userId} required disabled={disabled || state.loading || Boolean(state.error)} onChange={event => {
        const candidate = state.candidates.find(item => item.userId === event.target.value);
        if (candidate) onChoose(candidate);
      }}>
        <option value="">{state.loading ? "Henter saksbehandlere …" : "Velg saksbehandler"}</option>
        {missing ? <option value={userId} disabled>Registrert bruker må kontrolleres</option> : null}
        {state.candidates.map(candidate => <option key={candidate.userId} value={candidate.userId}>{candidate.displayName} ({candidate.email})</option>)}
      </select>
    </label>
    <small>Akseptvarselet sendes til denne brukeren hvis brukeren fortsatt har tilgang.</small>
    {missing && !state.loading && !state.error ? <p role="status">Den registrerte saksbehandleren har ikke bekreftet tilgang nå. Velg en tilgjengelig bruker før neste interne akseptvarsel.</p> : null}
    {state.error ? <><p role="alert">{state.error}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Prøv igjen</button></> : null}
    {!state.loading && !state.error && !state.candidates.length ? <p role="status">Ingen saksbehandlere har tilgang i dette firmaet.</p> : null}
  </div>;
}
