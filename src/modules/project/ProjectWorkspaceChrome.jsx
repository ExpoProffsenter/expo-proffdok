import { useState } from 'react';
import { FolderOpen, Menu, MoreHorizontal, ClipboardCheck, Camera, TriangleAlert, Home } from 'lucide-react';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import { projectWorkspaceGroups, projectSetupSteps, projectWorkspaceFlow } from './projectWorkspacePresentation.mjs';
import './projectWorkspace.css';

export function ProjectHeaderActions({ dirty, saved, readOnly, locked, simpleOrder, onSave, onCopy, onPdf, onLock, onNew }) {
  const [open, setOpen] = useState(false);
  const noun = simpleOrder ? 'ordre' : 'prosjekt';
  const run = callback => { setOpen(false); callback(); };
  return <div className="project-header-actions">
    {!readOnly && <button type="button" onClick={onSave}>{dirty ? '● Lagre endringer' : saved ? `Oppdater ${noun}` : `Lagre ${noun}`}</button>}
    <button type="button" className="secondary" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><MoreHorizontal size={18}/>Flere handlinger</button>
    {open && <DeviationDialog title="Flere handlinger" context={simpleOrder ? 'Enkel ordre' : 'Prosjekt'} closeLabel="Lukk handlinger" onClose={() => setOpen(false)}>
      <div className="project-dialog-content project-action-list">
        <button type="button" onClick={() => run(onPdf)}>Last ned PDF</button>
        {!readOnly && onNew && <button type="button" className="secondary" onClick={() => run(onNew)}>+ Nytt prosjekt</button>}
        {saved && !readOnly && <><button type="button" className="secondary" onClick={() => run(onCopy)}>Lagre som kopi</button>
          <button type="button" className="secondary" onClick={() => run(() => onLock(!locked))}>{locked ? `🔓 Lås opp ${noun}` : `🔒 Avslutt ${noun}`}</button></>}
        <p>PDF laster ned rapporten. Kopi oppretter et eget prosjekt. Avslutning bruker den vanlige bekreftelsen.</p>
      </div>
    </DeviationDialog>}
  </div>;
}

export default function ProjectWorkspaceChrome({ tabs, activeTab, project, saved, simpleOrder, status, deviations, unread, onNavigate, onStatus, onExit, onContinue, continuing = false, continueNotice = '', readOnly = false, contractRequired = false }) {
  const workStatus = status.label === 'Avvik åpent'
    ? { label: project.workflowStatus || 'Pågår', icon: { Utkast: '📝', Pågår: '🟡', Avventer: '⏸️', 'Klar for kunde': '🟢', Ferdigstilt: '✅' }[project.workflowStatus || 'Pågår'] || '🟡' }
    : status;
  const groups = projectWorkspaceGroups(tabs, simpleOrder);
  const steps = projectSetupSteps(groups, { contractRequired });
  const flow = projectWorkspaceFlow(groups, activeTab, { contractRequired });
  const activeGroup = groups.find(group => group.items.some(([id]) => id === activeTab))?.title || groups[0]?.title;
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLabel = groups.flatMap(item => item.items).find(([id]) => id === activeTab)?.[1] || tabs.find(([id]) => id === activeTab)?.[1];
  const select = async id => { if (await onNavigate(id) !== false) setMenuOpen(false); };
  const menuName = simpleOrder ? 'Ordremeny' : 'Prosjektmeny';
  const buttons = items => {
    return items.map(([id, label]) => {
    const index = steps.findIndex(step => step.id === id);
    return <button key={id} type="button" data-project-navigation="true" aria-label={label} className={activeTab === id ? 'is-active' : 'secondary'} aria-current={activeTab === id ? 'page' : undefined} onClick={() => select(id)}>
      {label}
      {steps[index]?.requirement && <small className="project-step-optional">{steps[index].requirement}</small>}
      {steps[index]?.optional && <small className="project-step-optional">Ved behov</small>}
      {id === 'sales' && <small className="project-step-optional">Historikk</small>}
    </button>;
    });
  };
  return <section className="project-workspace" data-expo-project-workspace="1" aria-label={simpleOrder ? 'Ordrearbeidsflate' : 'Prosjektarbeidsflate'}>
    <div className="project-workspace-heading"><div><span className="project-workspace-eyebrow"><FolderOpen size={16}/>{simpleOrder ? 'Enkel ordre' : saved ? 'Prosjekt' : 'Nytt prosjekt'}</span>
      <h2>{project.projectName || project.address || (saved ? 'Uten navn' : 'Gi prosjektet et navn')}</h2>
      <p>{[project.customer, [project.address, project.postnr, project.city].filter(Boolean).join(' ')].filter(Boolean).join(' · ') || 'Fyll inn prosjektopplysningene nedenfor.'}</p>
    </div><button type="button" className="project-workspace-exit" data-project-navigation="true" onClick={onExit}>{saved ? 'Bytt prosjekt' : 'Avbryt nytt prosjekt'}</button></div>
    <div className="project-workspace-status"><span>{workStatus.icon} {workStatus.label}</span>{saved && <><span>{deviations} åpne avvik · {unread} uleste meldinger</span><button type="button" className="secondary" onClick={onStatus}><ClipboardCheck size={16}/>Status og mangler</button></>}</div>
    <div className="project-workspace-mobile"><button type="button" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={18}/>{menuName}<span>{currentLabel}</span></button>
      <div>{buttons(tabs.filter(([id]) => ['hjelp','support'].includes(id)))}</div></div>
    <div className="project-workspace-navigation" aria-label={menuName}>
      <p className="project-map-intro">Registrer prosjektet. Legg til deltakerne. Dokumenter arbeidet. Overlever når alt er klart.</p>
      <div className="project-workspace-map">{groups.map((item, index) => <div key={item.title} className={`project-phase-card${activeGroup === item.title ? ' is-current' : ''}`} role="group" aria-label={item.title}>
        <h3><span>{index + 1}</span>{item.title}</h3>
        <p>{phasePurpose(item.title)}</p>
        <div className="project-workspace-tabs">{buttons(item.items)}</div>
      </div>)}</div>
    </div>
    {flow && <div className="project-step-guide" role="region" aria-label="Anbefalt neste steg">
      <div><span>Du er her: {flow.label}{flow.requirement ? ` · ${flow.requirement}` : flow.optional ? ' · Ved behov' : ''}</span><p>{flow.purpose}</p></div>
      <ProjectFlowActions flow={flow} onNavigate={select} onContinue={onContinue} continuing={continuing} readOnly={readOnly}/>
      {continueNotice && <p className="project-step-notice" role="status">{continueNotice}</p>}
    </div>}
    <div className="project-field-bar" role="navigation" aria-label="Prosjektverktøy på mobil">
      {[["prosjekt", "Oversikt", Home], ["sjekklister", "Sjekklister", ClipboardCheck], ["bilder", "Bilder", Camera], ["avvik", "Avvik", TriangleAlert]].map(([id, label, Icon]) => <button key={id} type="button" data-project-navigation="true" disabled={!saved && id !== 'prosjekt'} aria-current={activeTab === id ? 'page' : undefined} onClick={() => select(id)}><Icon size={20}/><span>{label}</span></button>)}
      <button type="button" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={20}/><span>Meny</span></button>
    </div>
    {menuOpen && <DeviationDialog title={menuName} context={project.projectName || project.address || 'Nytt prosjekt'} onClose={() => setMenuOpen(false)} closeLabel="Lukk prosjektmeny"><div className="project-dialog-content project-menu-dialog">
      {groups.map(item => <div key={item.title}><h3>{item.title}</h3><p className="project-menu-purpose">{phasePurpose(item.title)}</p>{buttons(item.items)}</div>)}
      <div><h3>Hjelp og support</h3>{buttons(tabs.filter(([id]) => ['hjelp','support'].includes(id)))}</div>
    </div></DeviationDialog>}
  </section>;
}

export function ProjectStatusDialog({ open, onClose, projectName, children }) {
  if (!open) return null;
  return <DeviationDialog title="Status og mangler" context={projectName} onClose={onClose} closeLabel="Lukk status og mangler"><div className="project-dialog-content" data-expo-project-status-content="1">{children}</div></DeviationDialog>;
}

function phasePurpose(title) {
  return title === 'Oppstart' ? 'Gjør klart prosjektet og avtal hvem som skal delta.' : title === 'Gjennomføring' ? 'Dokumenter arbeidet mens du jobber.' : 'Kontroller arbeidet og lever dokumentasjonen.';
}

export function ProjectFlowActions({ flow, onNavigate, onContinue, continuing = false, readOnly = false }) {
  if (!flow?.next) return null;
  const [id, label] = flow.next;
  const save = flow.save && onContinue && !readOnly;
  return <div className="project-step-next"><small>Neste: {label}</small><button type="button" data-project-navigation="true" disabled={continuing} onClick={() => save ? onContinue(id) : onNavigate(id)}>{continuing ? 'Lagrer …' : save ? 'Lagre og fortsett →' : `Gå til ${label} →`}</button></div>;
}

export function ProjectWorkspaceFooter({ tabs, activeTab, simpleOrder, contractRequired, onNavigate, onContinue, continuing, readOnly, continueNotice }) {
  const flow = projectWorkspaceFlow(projectWorkspaceGroups(tabs, simpleOrder), activeTab, { contractRequired });
  if (!flow) return null;
  return <div className="project-flow-footer" role="navigation" aria-label="Neste og forrige prosjektsteg">
    {flow.previous && <button type="button" data-project-navigation="true" className="secondary" onClick={() => onNavigate(flow.previous[0])}>{`← Gå til ${flow.previous[1]}`}</button>}
    <ProjectFlowActions flow={flow} onNavigate={onNavigate} onContinue={onContinue} continuing={continuing} readOnly={readOnly}/>
    {continueNotice && <p role="status">{continueNotice}</p>}
  </div>;
}
