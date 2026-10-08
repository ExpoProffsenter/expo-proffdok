import { useEffect, useRef, useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import { EXECUTION_CHANGE_EVENT, isUuid } from './kshmsExecutions.mjs';
import { formatDeviationDate } from '../deviations/deviationDates.mjs';
import KshmsExecutions from './KshmsExecutions.jsx';
import { readNotificationLink } from './kshmsNotificationLinks.mjs';

const taskLabel = kind => kind === 'round' ? 'Vernerunde' : 'Risikovurdering 5×5';

export default function KshmsExecutionTasks({ context }) {
  const { company_id: companyId, user_id: userId, enabled } = context;
  const [tasks, setTasks] = useState(null), [error, setError] = useState(''), [opened, setOpened] = useState(null);
  const refreshRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true, serial = 0;
    const refresh = async () => {
      const request = ++serial;
      try {
        const value = await kshmsRpc('kshms_execution_tasks', { p_company_id: companyId });
        if (!active || request !== serial) return;
        if (value?.company_id !== companyId || value.user_id !== userId || !Number.isInteger(value.count) || value.count < 0
          || !Number.isInteger(value.overdue) || value.overdue < 0 || !Array.isArray(value.items)
          || value.items.length > value.count || (value.count > 0 && !value.items.length)
          || value.items.some(row => !isUuid(row.id) || !['round', 'risk'].includes(row.kind))) throw Error('Varslene gjelder ikke denne arbeidsprofilen.');
        setTasks(value); setError('');
      } catch (cause) {
        if (!active || request !== serial) return;
        if (cause.code === '42501') setTasks(null);
        setError(cause.code === '42501' ? 'Tilgangen til KS/HMS må kontrolleres på nytt.' : 'Kontrollvarslene kunne ikke oppdateres. Sist bekreftede oppgaver er beholdt.');
      }
    };
    const changed = event => { if (event.detail?.company_id === companyId) refresh(); };
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    refreshRef.current = refresh; setTasks(null); setError(''); setOpened(null); refresh();
    const timer = window.setInterval(visible, 30000);
    window.addEventListener(EXECUTION_CHANGE_EVENT, changed); window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', visible);
    return () => { active = false; serial++; refreshRef.current = null; window.clearInterval(timer); window.removeEventListener(EXECUTION_CHANGE_EVENT, changed); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visible); };
  }, [companyId, userId, enabled]);
  const open = row => { if (row?.accessible === false || !row) return; setOpened({ id: row.id, kind: row.kind, projectId: row.project_id || null, companyId, userId, nonce: crypto.randomUUID() }); };
  const emailLink = readNotificationLink(window.location?.search || '', companyId);
  const [emailOpened, setEmailOpened] = useState(''), [emailBusy, setEmailBusy] = useState(false);
  const emailScope = useRef(null);
  useEffect(() => {
    const scope = { active: enabled }; emailScope.current = scope; setEmailBusy(false);
    return () => { scope.active = false; };
  }, [companyId, userId, enabled]);
  const emailKey = `${companyId}:${userId}:${emailLink?.companyId}:${emailLink?.id}`;
  const showEmail = emailLink?.kind === 'execution' && emailOpened !== emailKey;
  const openEmail = async () => {
    if (emailBusy || !emailLink?.matchingCompany || !enabled) return;
    const scope = emailScope.current; setEmailBusy(true); setError('');
    try {
      const detail = await kshmsRpc('kshms_execution_detail', { p_company_id: companyId, p_id: emailLink.id });
      if (!scope?.active || emailScope.current !== scope) return;
      if (detail?.context?.company_id !== companyId || detail.context.user_id !== userId || !detail.context.enabled
        || detail.record?.company_id !== companyId || detail.record.id !== emailLink.id || !['round', 'risk'].includes(detail.record.kind)) throw Error('Gjennomføringen er ikke tilgjengelig i denne arbeidsprofilen.');
      open(detail.record); setEmailOpened(emailKey);
    } catch { if (scope?.active && emailScope.current === scope) setError('Lenken kunne ikke åpnes. Kontroller firma og KS/HMS-/prosjekttilgang, og prøv igjen.'); }
    finally { if (scope?.active && emailScope.current === scope) setEmailBusy(false); }
  };
  const firstAvailable = tasks?.items.find(row => row.accessible !== false);
  if (!enabled) return null;
  return <>
    {(tasks?.count > 0 || error || showEmail) && <aside className="ks-task-banner" aria-label="Dine vernerunder og risikovurderinger">
      {tasks?.count > 0 && <>
        <div className="ks-task-heading"><strong>Du har {tasks.count} {tasks.count === 1 ? 'gjennomføring' : 'gjennomføringer'} å fullføre</strong>{tasks.overdue > 0 && <span> · {tasks.overdue} etter planlagt dato</span>}</div>
        <details className="ks-task-details"><summary aria-label={`Vis gjennomføringer (${tasks.count})`}>Vis oppgaver</summary><div className="ks-task-content">
          <p>Du er valgt som ansvarlig. Varselet står til din egen fullføring er lagret.</p>
          <ul>{tasks.items.map(row => <li key={row.id}>{row.accessible === false
            ? <p>{taskLabel(row.kind)} er tildelt deg. Be firmaadmin kontrollere prosjekttilgangen din. Prosjektinnhold vises først når du har tilgang.</p>
            : <button type="button" className="secondary" onClick={() => open(row)}>{taskLabel(row.kind)}: {row.title}{row.due_on ? ` · dato ${formatDeviationDate(row.due_on)}` : ''}</button>}</li>)}</ul>
          {tasks.count > tasks.items.length && <p>Flere oppgaver finnes under KS/HMS → Vernerunder/kontroller og Risikovurdering.</p>}
        </div></details>
        {firstAvailable ? <button type="button" className="ks-task-open" onClick={() => open(firstAvailable)}>Åpne gjennomføring</button> : <span className="ks-task-message">Prosjekttilgang kreves</span>}
      </>}
      {error && <p className="ks-task-message" role="status">{error} <button type="button" className="secondary" onClick={() => refreshRef.current?.()}>Prøv igjen</button></p>}
      {showEmail && <div className="ks-task-message"><p>{emailLink.matchingCompany ? 'Du har åpnet en lenke til en vernerunde eller risikovurdering.' : 'Lenken gjelder et annet firma. Bytt til riktig arbeidsprofil før du åpner gjennomføringen.'}</p>{emailLink.matchingCompany && <button type="button" disabled={emailBusy} onClick={openEmail}>Åpne gjennomføringen fra e-posten</button>}</div>}
    </aside>}
    {opened?.companyId === companyId && opened.userId === userId && <KshmsExecutions key={`${companyId}:${userId}:${opened.id}`} context={context} kind={opened.kind} projectId={opened.projectId} openRequest={opened} dialogOnly onClose={() => setOpened(null)} />}
  </>;
}
