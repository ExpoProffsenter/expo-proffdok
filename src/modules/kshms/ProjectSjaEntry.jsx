import { lazy, Suspense, useState } from 'react';
import './kshms.css';
const KshmsSja = lazy(() => import('./KshmsSja.jsx'));
const KshmsDeviations = lazy(() => import('./KshmsDeviations.jsx'));
const KshmsExecutions = lazy(() => import('./KshmsExecutions.jsx'));

const tools = [
  { key: 'sja', title: 'SJA – sikker jobbanalyse', explanation: 'Planlegg arbeidsoppgaven, vurder farer og avklar tiltak før dere starter. Ansvarlig prosjektleder signerer etter gjennomgang med deltakerne.', create: 'Opprett SJA', open: 'Åpne SJA', close: 'Lukk SJA-oversikten' },
  { key: 'ruh', title: 'RUH – rapport om uønsket hendelse', explanation: 'Meld skader, farlige forhold og nestenulykker. Velg ansvarlig og frist. Ansvarlig følger opp tiltakene og lukker etter egen kontroll.', create: 'Registrer RUH', open: 'Åpne RUH', close: 'Lukk RUH-oversikten' },
  { key: 'round', title: 'Vernerunde / kontroll', explanation: 'Kontroller arbeidsstedet, dokumenter svar og avklar oppfølging. Valgt ansvarlig får et appvarsel og fullfører med egen bekreftelse.', create: 'Opprett vernerunde', open: 'Åpne vernerunder', close: 'Lukk vernerunde-oversikten' },
  { key: 'risk', title: 'Risikovurdering 5×5', explanation: 'Vurder sannsynlighet og konsekvens før og etter tiltak. Velg ansvarlig, dokumenter oppfølging og ta en uttrykkelig beslutning.', create: 'Opprett risikovurdering 5×5', open: 'Åpne risikovurderinger', close: 'Lukk risikovurderingsoversikten' },
];

function ProjectTools({ context, projectId, readOnly }) {
  const [opened, setOpened] = useState(null);
  const [visited, setVisited] = useState({});
  const [requests, setRequests] = useState({});
  const show = (key, create = false) => {
    if (create && readOnly) return;
    setVisited(previous => ({ ...previous, [key]: true }));
    setOpened(previous => create || previous !== key ? key : null);
    if (create) setRequests(previous => ({ ...previous, [key]: key === 'ruh'
      ? { companyId: context.company_id, userId: context.user_id, nonce: crypto.randomUUID(), source: { category: 'ruh', source_kind: 'company', project_id: projectId } }
      : crypto.randomUUID() }));
  };
  return <section className="ks-module ks-project-sja">
    <h2>SJA, RUH, vernerunde og risikovurdering</h2>
    {tools.map(tool => <div key={tool.key}>
      <p><strong>{tool.title}:</strong> {tool.explanation}</p>
      <div className="ks-actions">
        <button type="button" disabled={readOnly} onClick={() => show(tool.key, true)}>{tool.create}</button>
        <button type="button" className="secondary" aria-expanded={opened === tool.key} onClick={() => show(tool.key)}>{opened === tool.key ? tool.close : tool.open}</button>
      </div>
    </div>)}
    <p>Dokumenter som opprettes her, følger dette prosjektet. Hver oversikt viser bare prosjektets dokumenter.</p>
    {visited.sja && <div hidden={opened !== 'sja'}><Suspense fallback={<p role="status">Henter prosjektets SJA-er …</p>}><KshmsSja context={context} projectId={projectId} scopeReadOnly={readOnly} active={opened === 'sja'} createRequest={requests.sja} /></Suspense></div>}
    {visited.ruh && <div hidden={opened !== 'ruh'}><Suspense fallback={<p role="status">Henter prosjektets RUH-er …</p>}><KshmsDeviations context={context} projectId={projectId} ruhOnly scopeReadOnly={readOnly} active={opened === 'ruh'} request={requests.ruh} /></Suspense></div>}
    {['round', 'risk'].map(kind => visited[kind] && <div key={kind} hidden={opened !== kind}><Suspense fallback={<p role="status">Henter prosjektets gjennomføringer …</p>}><KshmsExecutions context={context} projectId={projectId} kind={kind} scopeReadOnly={readOnly} active={opened === kind} createRequest={requests[kind]} /></Suspense></div>)}
  </section>;
}

export default function ProjectSjaEntry({ context, projectId, readOnly = false }) {
  if (!context?.enabled || !projectId) return null;
  return <ProjectTools key={`${context.company_id}:${context.user_id}:${projectId}`} context={context} projectId={projectId} readOnly={readOnly} />;
}
