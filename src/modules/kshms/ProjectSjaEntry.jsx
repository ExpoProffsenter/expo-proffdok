import { lazy, Suspense, useState } from 'react';
import './kshms.css';
const KshmsSja = lazy(() => import('./KshmsSja.jsx'));
const KshmsDeviations = lazy(() => import('./KshmsDeviations.jsx'));

export default function ProjectSjaEntry({ context, projectId, readOnly = false }) {
  const [opened, setOpened] = useState(false);
  const [visited, setVisited] = useState(false);
  const [createRequest, setCreateRequest] = useState(null);
  const [ruhOpened, setRuhOpened] = useState(false), [ruhVisited, setRuhVisited] = useState(false), [ruhRequest, setRuhRequest] = useState(null);
  if (!context?.enabled || !projectId) return null;
  return <section className="ks-module ks-project-sja">
    <h2>SJA og RUH for prosjektet</h2>
    <p><strong>SJA – sikker jobbanalyse:</strong> Planlegg arbeidsoppgaven, vurder farer og avklar tiltak før dere starter. Ansvarlig prosjektleder signerer etter gjennomgang med deltakerne.</p>
    <div className="ks-actions"><button type="button" disabled={readOnly} onClick={() => { setVisited(true); setOpened(true); setRuhOpened(false); setCreateRequest(crypto.randomUUID()); }}>Opprett SJA</button><button type="button" className="secondary" onClick={() => { setVisited(true); setOpened(previous => !previous); setRuhOpened(false); }}>{opened ? 'Lukk SJA-oversikten' : 'Åpne SJA'}</button></div>
    <p><strong>RUH – rapport om uønsket hendelse:</strong> Meld skader, farlige forhold og nestenulykker. Velg ansvarlig og frist. Ansvarlig følger opp tiltakene og lukker etter egen kontroll.</p>
    <div className="ks-actions"><button type="button" disabled={readOnly} onClick={() => { setRuhVisited(true); setRuhOpened(true); setOpened(false); setRuhRequest({ companyId: context.company_id, userId: context.user_id, nonce: crypto.randomUUID(), source: { category: 'ruh', source_kind: 'company', project_id: projectId } }); }}>Registrer RUH</button><button type="button" className="secondary" onClick={() => { setRuhVisited(true); setRuhOpened(previous => !previous); setOpened(false); }}>{ruhOpened ? 'Lukk RUH-oversikten' : 'Åpne RUH'}</button></div>
    <p>Nye SJA-er og RUH-er som opprettes her, følger dette prosjektet. Eksisterende dokumenter ligger i hver sin oversikt.</p>
    {visited && <div hidden={!opened}><Suspense fallback={<p role="status">Henter prosjektets SJA-er …</p>}><KshmsSja context={context} projectId={projectId} scopeReadOnly={readOnly} active={opened} createRequest={createRequest} /></Suspense></div>}
    {ruhVisited && <div hidden={!ruhOpened}><Suspense fallback={<p role="status">Henter prosjektets RUH-er …</p>}><KshmsDeviations context={context} projectId={projectId} ruhOnly scopeReadOnly={readOnly} active={ruhOpened} request={ruhRequest} /></Suspense></div>}
  </section>;
}
