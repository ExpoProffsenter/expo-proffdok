import { lazy, Suspense, useState } from 'react';
import './kshms.css';
const KshmsSja = lazy(() => import('./KshmsSja.jsx'));

export default function ProjectSjaEntry({ context, projectId, readOnly = false }) {
  const [opened, setOpened] = useState(false);
  const [visited, setVisited] = useState(false);
  if (!context?.enabled || !projectId) return null;
  return <section className="ks-module ks-project-sja">
    <h2>Sikker jobbanalyse (SJA)</h2>
    <p>Planlegg jobben og se tidligere analyser for dette prosjektet. Nye SJA-er som opprettes her, følger prosjektet etter lagring og signering.</p>
    <button type="button" className="secondary" onClick={() => { setVisited(true); setOpened(previous => !previous); }}>{opened ? 'Lukk SJA-oversikten' : 'Åpne SJA'}</button>
    {visited && <div hidden={!opened}><Suspense fallback={<p role="status">Henter prosjektets SJA-er …</p>}><KshmsSja context={context} projectId={projectId} scopeReadOnly={readOnly} active={opened} /></Suspense></div>}
  </section>;
}
