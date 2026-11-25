import { useEffect, useId, useRef, useState } from 'react';
import { FolderOpen, Menu, MoreHorizontal, ClipboardCheck, Camera, TriangleAlert, Home, ArrowLeft } from 'lucide-react';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import WorkspacePanel from '../ui/WorkspacePanel.jsx';
import { projectWorkspaceGroups, projectSetupSteps, projectWorkspaceFlow } from './projectWorkspacePresentation.mjs';
import './projectWorkspace.css';
import './projectCompactHeader.css';

export function ProjectHeaderActions({ dirty, saved, readOnly, locked, simpleOrder, onSave, onCopy, onPdf, onLock, onNew }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null), trigger = useRef(null), panel = useRef(null);
  const menuId = useId();
  const openLast = useRef(false);
  const noun = simpleOrder ? 'ordre' : 'prosjekt';
  useEffect(() => {
    if (!open) return;
    const items = panel.current?.querySelectorAll('button');
    items?.[openLast.current ? items.length - 1 : 0]?.focus();
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); };
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const run = callback => { close(); callback(); };
  const keys = event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    if (event.key === 'Tab') { close(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const items = [...panel.current.querySelectorAll('button')];
    const index = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };
  return <div className="project-header-actions">
    {!readOnly && <button type="button" disabled={locked} onClick={onSave}>{dirty ? '● Lagre endringer' : saved ? `Oppdater ${noun}` : `Lagre ${noun}`}</button>}
    <div className="project-actions-dropdown" ref={root}>
      <button ref={trigger} type="button" className="secondary" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => { openLast.current = false; setOpen(value => !value); }} onKeyDown={event => { if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); openLast.current = event.key === 'ArrowUp'; setOpen(true); } }}><MoreHorizontal size={18}/>Flere handlinger</button>
      {open && <div id={menuId} className="project-actions-menu" role="menu" aria-label="Flere handlinger" ref={panel} onKeyDown={keys}>
        <button type="button" role="menuitem" tabIndex={-1} onClick={() => run(onPdf)}>Last ned PDF</button>
        {!readOnly && onNew && <button type="button" role="menuitem" tabIndex={-1} onClick={() => run(onNew)}>+ Nytt prosjekt</button>}
        {saved && !readOnly && <><button type="button" role="menuitem" tabIndex={-1} onClick={() => run(onCopy)}>Lagre som kopi</button>
          <button type="button" role="menuitem" tabIndex={-1} onClick={() => run(() => onLock(!locked))}>{locked ? `🔓 Lås opp ${noun}` : `🔒 Avslutt ${noun}`}</button></>}
      </div>}
    </div>
  </div>;
}

export default function ProjectWorkspaceChrome({ tabs, activeTab, project, saved, simpleOrder, status, deviations, checklistDeviations, projectDeviations, unread, onNavigate, onStatus, onExit, onContinue, continuing = false, continueNotice = '', readOnly = false, contractRequired = false, appTabs = [], onAppNavigate }) {
  const deviationSummary = Number.isFinite(checklistDeviations) && Number.isFinite(projectDeviations)
    ? `${checklistDeviations} sjekklisteavvik · ${projectDeviations} prosjektavvik`
    : `${deviations} åpne avvik`;
  const workStatus = status.label === 'Avvik åpent'
    ? { label: project.workflowStatus || 'Pågår', icon: { Utkast: '📝', Pågår: '🟡', Avventer: '⏸️', 'Klar for kunde': '🟢', Ferdigstilt: '✅' }[project.workflowStatus || 'Pågår'] || '🟡' }
    : status;
  const groups = projectWorkspaceGroups(tabs, simpleOrder);
  const steps = projectSetupSteps(groups, { contractRequired });
  const flow = projectWorkspaceFlow(groups, activeTab, { contractRequired });
  const activeGroup = groups.find(group => group.items.some(([id]) => id === activeTab))?.title || groups[0]?.title;
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => setGuideOpen(false), [activeTab, saved, readOnly]);
  const overviewGuide = saved && activeTab === 'prosjekt';
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
  return <section className="project-workspace project-compact-header" data-expo-project-workspace="1" aria-label={simpleOrder ? 'Ordrearbeidsflate' : 'Prosjektarbeidsflate'}>
    <div className="project-workspace-back"><button type="button" className="secondary project-workspace-exit" data-project-navigation="true" onClick={onExit}><ArrowLeft size={18} aria-hidden="true"/>{saved ? "Tilbake" : "Avbryt nytt prosjekt"}</button>{appTabs.length > 0 && <button type="button" className="secondary project-workspace-app-menu" onClick={()=>setMenuOpen(true)}><Menu size={18}/>Alle områder</button>}<div className="project-workspace-status"><span>{workStatus.icon} {workStatus.label}</span>{saved && <span>{deviationSummary} · {unread} uleste meldinger</span>}{readOnly && <span className="project-readonly-label" title="Prosjektet er skrivebeskyttet. Bruk prosjektmenyen for å lese dokumentasjonen.">Skrivebeskyttet</span>}</div></div>
    <div className="project-workspace-heading"><div><span className="project-workspace-eyebrow"><FolderOpen size={16}/>{simpleOrder ? 'Enkel ordre' : saved ? 'Prosjekt' : 'Nytt prosjekt'}</span>
      <h2>{project.projectName || project.address || (saved ? 'Uten navn' : 'Gi prosjektet et navn')}</h2>
      <p>{[project.customer, [project.address, project.postnr, project.city].filter(Boolean).join(' ')].filter(Boolean).join(' · ') || 'Fyll inn prosjektopplysningene nedenfor.'}</p>
    </div></div>

    <div className="project-workspace-mobile project-workspace-toolbar"><button type="button" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={18}/>{menuName}<span>{currentLabel}</span></button>
      <div className="project-workspace-shortcuts">{buttons(tabs.filter(([id]) => ['prosjekt','sjekklister','bilder'].includes(id)))}</div>{saved && <button type="button" className="secondary project-workspace-status-button" onClick={onStatus}><ClipboardCheck size={16}/>Status og mangler</button>}{overviewGuide && !readOnly && <button type="button" className="secondary project-workspace-guide-toggle" aria-expanded={guideOpen} onClick={()=>setGuideOpen(value=>!value)}>{guideOpen?'Skjul veiledning':'Vis veiledning'}</button>}</div>
    {flow && !readOnly && (!overviewGuide || guideOpen) && <div className="project-step-guide" role="region" aria-label="Anbefalt neste steg">
      <div><span>Du er her: {flow.label}{flow.requirement ? ` · ${flow.requirement}` : flow.optional ? ' · Ved behov' : ''}</span><p>{readOnly?'Prosjektet er skrivebeskyttet. Åpne prosjektmenyen for å lese dokumentasjonen.':flow.purpose}</p></div>
      <ProjectFlowActions flow={flow} onNavigate={select} onContinue={onContinue} continuing={continuing} readOnly={readOnly}/>
      {continueNotice && <p className="project-step-notice" role="status">{continueNotice}</p>}
    </div>}
    <div className="project-field-bar" role="navigation" aria-label="Prosjektverktøy på mobil">
      {[["prosjekt", "Oversikt", Home], ["sjekklister", "Sjekklister", ClipboardCheck], ["bilder", "Bilder", Camera], ["avvik", "Avvik", TriangleAlert]].map(([id, label, Icon]) => <button key={id} type="button" data-project-navigation="true" disabled={!saved && id !== 'prosjekt'} aria-current={activeTab === id ? 'page' : undefined} onClick={() => select(id)}><Icon size={20}/><span>{label}</span></button>)}
      <button type="button" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={20}/><span>Meny</span></button>
    </div>
    {menuOpen && <ProjectNavigationPanel title={menuName} projectName={project.projectName || project.address || 'Nytt prosjekt'} onClose={() => setMenuOpen(false)}>
      <div className="project-workspace-navigation project-menu-dialog" aria-label={menuName}>
        {groups.map((item,index) => <div key={item.title} className={`project-phase-card${activeGroup === item.title ? ' is-current' : ''}`} role="group" aria-label={item.title}><h3><span>{index+1}</span>{item.title}</h3><p className="project-menu-purpose">{phasePurpose(item.title)}</p><div className="project-workspace-tabs">{buttons(item.items)}</div></div>)}
        {appTabs.length > 0 && <div className="project-global-mobile"><h3>Andre områder i appen</h3><div className="project-workspace-tabs">{appTabs.map(([id,label])=><button key={id} type="button" className="secondary" onClick={()=>onAppNavigate?.(id)}>{label}</button>)}</div></div>}
        <div><h3>Hjelp og support</h3>{buttons(tabs.filter(([id]) => ['hjelp','support'].includes(id)))}</div>
      </div>
    </ProjectNavigationPanel>}

  </section>;
}

function ProjectNavigationPanel({title,projectName,onClose,children}) {
  const dialog=useRef(null);
  useEffect(()=>{const node=dialog.current;node.showModal();return()=>{if(node.open)node.close();};},[]);
  return <WorkspacePanel dialogRef={dialog} title={title} subtitle={projectName} className="project-navigation-panel" closeLabel="Lukk prosjektmeny" onClose={event=>{if(event.target===event.currentTarget)onClose();}}>{children}</WorkspacePanel>;
}

export function ProjectStatusDialog({ open, onClose, projectName, children }) {
  if (!open) return null;
  return <DeviationDialog title="Status og mangler" context={projectName} onClose={onClose} closeLabel="Lukk status og mangler"><div className="project-dialog-content" data-expo-project-status-content="1">{children}</div></DeviationDialog>;
}

function phasePurpose(title) {
  return title === 'Oppstart' ? 'Gjør klart prosjektet og avtal hvem som skal delta.' : title === 'Gjennomføring' ? 'Dokumenter arbeidet mens du jobber.' : 'Kontroller arbeidet og lever dokumentasjonen.';
}

export function ProjectFlowActions({ flow, onNavigate, onContinue, continuing = false, readOnly = false }) {
  if (!flow?.next || readOnly) return null;
  const [id, label] = flow.next;
  const save = flow.save && onContinue && !readOnly;
  return <div className="project-step-next"><small>Neste: {label}</small><button type="button" data-project-navigation="true" disabled={continuing} onClick={() => save ? onContinue(id) : onNavigate(id)}>{continuing ? 'Lagrer …' : save ? 'Lagre og fortsett →' : `Gå til ${label} →`}</button></div>;
}

export function ProjectWorkspaceFooter({ tabs, activeTab, simpleOrder, contractRequired, onNavigate, onContinue, continuing, readOnly, continueNotice }) {
  const flow = projectWorkspaceFlow(projectWorkspaceGroups(tabs, simpleOrder), activeTab, { contractRequired });
  if (!flow || readOnly) return null;
  return <div className="project-flow-footer" role="navigation" aria-label="Neste og forrige prosjektsteg">
    {flow.previous && <button type="button" data-project-navigation="true" className="secondary" onClick={() => onNavigate(flow.previous[0])}>{`← Gå til ${flow.previous[1]}`}</button>}
    <ProjectFlowActions flow={flow} onNavigate={onNavigate} onContinue={onContinue} continuing={continuing} readOnly={readOnly}/>
    {continueNotice && <p role="status">{continueNotice}</p>}
  </div>;
}
