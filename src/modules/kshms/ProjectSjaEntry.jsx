import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './kshms.css';
import './projectDocumentOverview.css';
import { kshmsRpc } from './kshmsAccess.js';
import { readProjectDocumentOverview, documentCountText } from './projectDocumentOverview.mjs';
import { EXECUTION_CHANGE_EVENT } from './kshmsExecutions.mjs';
import { DEVIATION_CHANGE_EVENT } from './kshmsDeviations.mjs';
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
  const [counts,setCounts]=useState(null),[overviewError,setOverviewError]=useState(''),[loading,setLoading]=useState(false),[accessDenied,setAccessDenied]=useState(false);
  const serial=useRef(0),owner=useRef(null);
  const refresh=async()=>{
    const scope=owner.current,revision=++serial.current;
    if(!scope?.active)return;
    setLoading(true);
    try{const value=await readProjectDocumentOverview({rpc:kshmsRpc,companyId:context.company_id,userId:context.user_id,projectId,isCurrent:()=>scope.active&&owner.current===scope&&revision===serial.current});if(value){setCounts(value);setOverviewError('');setAccessDenied(false);}}
    catch(error){if(scope.active&&owner.current===scope&&revision===serial.current){setOverviewError(error.message);if(error.code==='42501'){setAccessDenied(true);setCounts(null);setOpened(null);setVisited({});}}}
    finally{if(scope.active&&owner.current===scope&&revision===serial.current)setLoading(false);}
  };
  useEffect(()=>{
    const scope={active:true};owner.current=scope;setCounts(null);setOpened(null);setVisited({});setAccessDenied(false);refresh();
    const update=event=>{if(!event.detail||event.detail.company_id===context.company_id)refresh();};
    const visible=()=>{if(document.visibilityState==='visible')refresh();};
    window.addEventListener('focus',update);window.addEventListener(EXECUTION_CHANGE_EVENT,update);window.addEventListener(DEVIATION_CHANGE_EVENT,update);document.addEventListener('visibilitychange',visible);
    return()=>{scope.active=false;serial.current++;window.removeEventListener('focus',update);window.removeEventListener(EXECUTION_CHANGE_EVENT,update);window.removeEventListener(DEVIATION_CHANGE_EVENT,update);document.removeEventListener('visibilitychange',visible);};
  },[context.company_id,context.user_id,context.manage,context.enabled,projectId]);
  const show = (key, create = false) => {
    if (accessDenied || create && readOnly) return;
    refresh();
    setVisited(previous => ({ ...previous, [key]: true }));
    setOpened(previous => create || previous !== key ? key : null);
    if (create) setRequests(previous => ({ ...previous, [key]: key === 'ruh'
      ? { companyId: context.company_id, userId: context.user_id, nonce: crypto.randomUUID(), source: { category: 'ruh', source_kind: 'company', project_id: projectId } }
      : crypto.randomUUID() }));
  };
  return <section className="ks-module ks-project-sja">
    <h2>Prosjektets KS/HMS-dokumenter</h2>
    <p className="ks-project-intro">Se hva som er registrert. Åpne en gruppe for å fortsette arbeid, lese dokumentasjon eller opprette nytt.</p>
    <div className="ks-project-overview-actions"><button type="button" className="secondary" disabled={loading} onClick={refresh}>Oppdater dokumentoversikt</button>{loading&&<span role="status">Henter status …</span>}</div>
    {overviewError&&<p role="alert">{overviewError} {counts?'Sist bekreftede antall vises.':'Prøv Oppdater dokumentoversikt.'}</p>}
    {tools.map(tool => <div key={tool.key} className="ks-project-tool">
      <h3><button type="button" className="ks-project-tool-toggle" disabled={accessDenied} aria-label={opened===tool.key?tool.close:tool.open} aria-expanded={opened===tool.key} aria-controls={`ks-project-${tool.key}`} onClick={()=>show(tool.key)}><span>{tool.title}<small>{counts?documentCountText(tool.key,counts[tool.key]):loading?'Henter antall …':'Antall ikke tilgjengelig'}</small></span><span aria-hidden="true">{opened===tool.key?'−':'+'}</span></button></h3>
      <div id={`ks-project-${tool.key}`} hidden={opened!==tool.key} className="ks-project-tool-content">
        <p>{tool.explanation}</p>
        <button type="button" disabled={readOnly||accessDenied} onClick={()=>show(tool.key,true)}>{tool.create}</button>
        {visited[tool.key]&&<Suspense fallback={<p role="status">Henter prosjektets dokumenter …</p>}>
          {tool.key==='sja'?<KshmsSja context={context} projectId={projectId} scopeReadOnly={readOnly} active={opened==='sja'} createRequest={requests.sja}/>:tool.key==='ruh'?<KshmsDeviations context={context} projectId={projectId} ruhOnly scopeReadOnly={readOnly} active={opened==='ruh'} request={requests.ruh}/>:<KshmsExecutions context={context} projectId={projectId} kind={tool.key} scopeReadOnly={readOnly} active={opened===tool.key} createRequest={requests[tool.key]}/>}
        </Suspense>}
      </div>
    </div>)}

  </section>;
}

export default function ProjectSjaEntry({ context, projectId, readOnly = false }) {
  if (!context?.enabled || !projectId) return null;
  return <ProjectTools key={`${context.company_id}:${context.user_id}:${projectId}`} context={context} projectId={projectId} readOnly={readOnly} />;
}
