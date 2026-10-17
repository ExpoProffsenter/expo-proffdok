import { useEffect, useState } from 'react';
import { FolderOpen, Menu, MoreHorizontal, ClipboardCheck } from 'lucide-react';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import { projectWorkspaceGroups } from './projectWorkspacePresentation.mjs';
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

export default function ProjectWorkspaceChrome({ tabs, activeTab, project, saved, simpleOrder, status, deviations, unread, onNavigate, onStatus, onExit }) {
  const workStatus = status.label === 'Avvik åpent'
    ? { label: project.workflowStatus || 'Pågår', icon: { Utkast: '📝', Pågår: '🟡', Avventer: '⏸️', 'Klar for kunde': '🟢', Ferdigstilt: '✅' }[project.workflowStatus || 'Pågår'] || '🟡' }
    : status;
  const groups = projectWorkspaceGroups(tabs, simpleOrder);
  const activeGroup = groups.find(group => group.items.some(([id]) => id === activeTab))?.title || groups[0]?.title;
  const [groupName, setGroupName] = useState(activeGroup);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setGroupName(activeGroup); }, [activeGroup, activeTab]);
  const group = groups.find(item => item.title === groupName) || groups[0];
  const currentLabel = groups.flatMap(item => item.items).find(([id]) => id === activeTab)?.[1] || tabs.find(([id]) => id === activeTab)?.[1];
  const select = async id => { if (await onNavigate(id) !== false) setMenuOpen(false); };
  const menuName = simpleOrder ? 'Ordremeny' : 'Prosjektmeny';
  const buttons = items => items.map(([id, label]) => <button key={id} type="button" className={activeTab === id ? 'is-active' : 'secondary'} aria-current={activeTab === id ? 'page' : undefined} onClick={() => select(id)}>{label}</button>);
  return <section className="project-workspace" data-expo-project-workspace="1" aria-label={simpleOrder ? 'Ordrearbeidsflate' : 'Prosjektarbeidsflate'}>
    <div className="project-workspace-heading"><div><span className="project-workspace-eyebrow"><FolderOpen size={16}/>{simpleOrder ? 'Enkel ordre' : saved ? 'Prosjekt' : 'Nytt prosjekt'}</span>
      <h2>{project.projectName || project.address || (saved ? 'Uten navn' : 'Gi prosjektet et navn')}</h2>
      <p>{[project.customer, [project.address, project.postnr, project.city].filter(Boolean).join(' ')].filter(Boolean).join(' · ') || 'Fyll inn prosjektopplysningene nedenfor.'}</p>
    </div><button type="button" className="project-workspace-exit" onClick={onExit}>{saved ? 'Bytt prosjekt' : 'Avbryt nytt prosjekt'}</button></div>
    <div className="project-workspace-status"><span>{workStatus.icon} {workStatus.label}</span>{saved && <><span>{deviations} åpne avvik · {unread} uleste meldinger</span><button type="button" className="secondary" onClick={onStatus}><ClipboardCheck size={16}/>Status og mangler</button></>}</div>
    <div className="project-workspace-mobile"><button type="button" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={18}/>{menuName}<span>{currentLabel}</span></button>
      <div>{buttons(tabs.filter(([id]) => ['hjelp','support'].includes(id)))}</div></div>
    <div className="project-workspace-navigation" aria-label={menuName}>
      <div className="project-workspace-groups">{groups.map(item => <button type="button" key={item.title} aria-pressed={group?.title === item.title} className={group?.title === item.title ? 'is-active' : 'secondary'} onClick={() => setGroupName(item.title)}>{item.title}</button>)}</div>
      <div className="project-workspace-tabs" aria-label={group?.title}>{buttons(group?.items || [])}</div>
      <p className="project-workspace-hint">{group?.title === 'Oppstart' ? 'Samle grunnlaget og planlegg arbeidet. Fortsett til Gjennomføring når du er klar.' : group?.title === 'Gjennomføring' ? 'Dokumenter arbeidet underveis. Kontroller Status og mangler før overlevering.' : 'Kontroller dokumentasjonen og gjør klar avslutningen.'}</p>
    </div>
    {menuOpen && <DeviationDialog title={menuName} context={project.projectName || project.address || 'Nytt prosjekt'} onClose={() => setMenuOpen(false)} closeLabel="Lukk prosjektmeny"><div className="project-dialog-content project-menu-dialog">
      {groups.map(item => <div key={item.title}><h3>{item.title}</h3>{buttons(item.items)}</div>)}
      <div><h3>Hjelp og support</h3>{buttons(tabs.filter(([id]) => ['hjelp','support'].includes(id)))}</div>
    </div></DeviationDialog>}
  </section>;
}

export function ProjectStatusDialog({ open, onClose, projectName, children }) {
  if (!open) return null;
  return <DeviationDialog title="Status og mangler" context={projectName} onClose={onClose} closeLabel="Lukk status og mangler"><div className="project-dialog-content" data-expo-project-status-content="1">{children}</div></DeviationDialog>;
}
