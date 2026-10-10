import { useEffect, useRef, useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import { formatDeviationDateTime } from '../deviations/deviationDates.mjs';
import { emptyKshmsReport } from '../report/kshmsProjectReport.mjs';
const documentKeys=['sjas','ruhs','rounds','risks'];
const emptySelection=()=>Object.fromEntries(documentKeys.map(key=>[key,[]]));
const headings={sjas:'SJA – sikker jobbanalyse',ruhs:'RUH – rapport om uønsket hendelse',rounds:'Vernerunder / kontroller',risks:'Risikovurderinger 5×5'};
import './kshms.css';
import './kshmsProjectReport.css';

export function useKshmsProjectReport({ context, userId, projectId, disabled = false }) {
  const enabled = !!(context?.enabled && context.user_id === userId && projectId && !disabled);
  const scope = `${userId || ''}:${context?.company_id || ''}:${projectId || ''}:${enabled}:${!!context?.manage}`;
  const current = useRef(scope), pending = useRef(null), sequence = useRef(0);
  current.current = scope;
  const [dialog, setDialog] = useState(null), [data, setData] = useState(null);
  const [choices, setChoices] = useState(null), [selection, setSelection] = useState(emptySelection());
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const active = () => current.current === scope;
  useEffect(() => {
    setData(null); setDialog(null); setChoices(null);
    setSelection(emptySelection()); setError(''); setBusy(false);
    return () => { sequence.current++; pending.current?.resolve(null); pending.current = null; };
  }, [scope]);
  const reportData = enabled && data?.scope === scope ? data : emptyKshmsReport();
  const check = response => {
    if (!active() || !response?.context?.enabled || response?.context?.user_id !== userId || response?.context?.company_id !== context.company_id || response?.context?.project_id !== projectId) throw new Error('Prosjekt eller tilgang er endret. Åpne rapporten på nytt.');
    return response;
  };
  const fetchReport = async args => {
    const base={p_company_id:context.company_id,p_project_id:projectId};
    const [legacy,executions]=await Promise.all([kshmsRpc('kshms_project_report',{...base,p_sja_ids:args.p_sja_ids,p_ruh_ids:args.p_ruh_ids}),kshmsRpc('kshms_project_execution_report',{...base,p_round_ids:args.p_round_ids,p_risk_ids:args.p_risk_ids})]);
    check(legacy);check(executions);
    return legacy.choices?{...legacy,choices:{...legacy.choices,...executions.choices}}:{...legacy,rounds:executions.rounds,risks:executions.risks};
  };
  const finish = result => {
    if (!active()) return;
    setDialog(null); pending.current?.resolve(result); pending.current = null;
  };
  const prepareExport = async (kind = 'preview') => {
    if (!active()) return null;
    if (!enabled) return { ...emptyKshmsReport(), scope };
    if (pending.current) return null;
    const result = new Promise(resolve => { pending.current = { resolve }; });
    const revision = ++sequence.current;
    setDialog({ scope, kind }); setChoices(null); setError(''); setBusy(true);
    setSelection(Object.fromEntries(documentKeys.map(key=>[key,(reportData[key]||[]).map(row=>row.id)])));
    fetchReport({ p_sja_ids: null, p_ruh_ids: null, p_round_ids: null, p_risk_ids: null }).then(response => {
      if (!active() || revision !== sequence.current) return;
      if (documentKeys.some(key=>!Array.isArray(response.choices?.[key]))) throw new Error('Dokumentlisten kunne ikke leses. Oppdater listen.');
      setChoices(response.choices);
      if (documentKeys.some(key => (reportData[key]||[]).some(row => !response.choices[key].some(choice => choice.id === row.id)))) {
        setSelection(emptySelection()); setError('Et tidligere valgt dokument er ikke lenger tilgjengelig. Velg dokumentene på nytt.');
      }
    }).catch(failure => { if (active() && revision === sequence.current) setError(failure.message); })
      .finally(() => { if (active() && revision === sequence.current) setBusy(false); });
    return result;
  };
  const confirm = async () => {
    if (busy || !choices || !active()) return;
    const revision = ++sequence.current;
    setBusy(true); setError('');
    try {
      const response = await fetchReport({ p_sja_ids: selection.sjas, p_ruh_ids: selection.ruhs, p_round_ids: selection.rounds, p_risk_ids: selection.risks });
      if (!active() || revision !== sequence.current) return;
      // Missing IDs must block the whole export, never silently produce a partial report.
      for (const key of documentKeys) if (!Array.isArray(response[key]) || response[key].length !== selection[key].length || new Set(response[key].map(row => row.id)).size !== selection[key].length || !response[key].every(row => selection[key].includes(row.id) && row.project_id === projectId && row.company_id === context.company_id)) throw new Error('Et valgt dokument er ikke lenger tilgjengelig. Oppdater listen og velg på nytt.');
      for (const [key, kind] of [['rounds','round'],['risks','risk']]) if (response[key].some(row => row.kind !== kind || !['draft','completed'].includes(row.status))) throw new Error('Et valgt dokument har ugyldig type eller status. Oppdater listen.');
      const snapshot = { ...Object.fromEntries(documentKeys.map(key=>[key,response[key]])), scope, checkSelection: true };
      setData(snapshot); finish(snapshot);
    } catch (failure) { if (active() && revision === sequence.current) setError(failure.message); }
    finally { if (active() && revision === sequence.current) setBusy(false); }
  };
  const without = () => {
    sequence.current++; setBusy(false);
    const snapshot = { ...emptyKshmsReport(), scope, checkSelection: true }; setData(snapshot); finish(snapshot);
  };
  return {
    enabled, reportData, prepareExport,
    isCurrent: snapshot => active() && (!snapshot?.scope || snapshot.scope === scope),
    chooser: dialog?.scope === scope && enabled ? { kind: dialog.kind, choices, selection, busy, error,
      toggle: (key, id) => setSelection(previous => ({ ...previous, [key]: previous[key].includes(id) ? previous[key].filter(value => value !== id) : [...previous[key], id] })),
      confirm, without, cancel: () => { sequence.current++; setBusy(false); finish(null); }, refresh: async () => {
        if (busy) return; const revision = ++sequence.current; setBusy(true); setError('');
        try { const response = await fetchReport({ p_sja_ids: null, p_ruh_ids: null, p_round_ids: null, p_risk_ids: null }); if (documentKeys.some(key=>!Array.isArray(response.choices?.[key]))) throw new Error('Dokumentlisten kunne ikke leses. Prøv igjen.'); if (active() && revision === sequence.current) { setChoices(response.choices); setSelection(emptySelection()); } }
        catch (failure) { if (active() && revision === sequence.current) setError(failure.message); }
        finally { if (active() && revision === sequence.current) setBusy(false); }
      },
    } : null,
  };
}

export function KshmsProjectReportChoice({ report }) {
  if (!report.enabled) return null;
  return <section className="ks-module ks-report-choice">
    <h3>KS/HMS i prosjektrapporten</h3>
    <p>SJA betyr sikker jobbanalyse. RUH betyr rapport om uønsket hendelse. Velg SJA, RUH, vernerunder og risikovurderinger som skal følge rapporten. Utkast merkes tydelig. Rapporten kan deles med kunde, så kontroller innholdet før du tar det med.</p>
    <p>{documentKeys.reduce((n,key)=>n+(report.reportData[key]?.length||0),0)} KS/HMS-dokumenter valgt.</p>
    <button type="button" onClick={() => report.prepareExport('preview')}>Velg KS/HMS til rapport</button>
  </section>;
}

export function KshmsProjectReportDialog({ chooser }) {
  const container = useRef(null);
  useEffect(() => { if (!chooser) return; const trigger = document.activeElement; container.current?.focus(); return () => { if (trigger?.isConnected) trigger.focus(); }; }, [!!chooser]);
  if (!chooser) return null;
  const { choices, selection, busy, error, kind } = chooser;
  return <div className="ks-report-backdrop"><section ref={container} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="ks-report-title" className="ks-module ks-report-dialog" onKeyDown={event => {
    if (event.key === 'Escape') chooser.cancel();
    if (event.key !== 'Tab') return;
    const elements = [...container.current.querySelectorAll('button:not([disabled]), input:not([disabled])')], first = elements[0], last = elements.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === container.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}>
    <h2 id="ks-report-title">Velg KS/HMS til rapport</h2>
    <p>Bare avkryssede dokumenter fra dette prosjektet tas med. SJA-utkast er ikke signert. Åpne RUH-er merkes med status og gjenstående oppfølging.</p>
    {busy && <p role="status">Henter prosjektets dokumenter …</p>}
    {error && <p role="alert">{error}</p>}
    {choices && documentKeys.map(key => <fieldset key={key} disabled={busy}>
      <legend>{headings[key]}</legend>
      {!choices[key].length && <p>Ingen tilgjengelige {headings[key]} på prosjektet.</p>}
      {choices[key].map(row => <label key={row.id} className="ks-report-option"><input type="checkbox" checked={selection[key].includes(row.id)} onChange={() => chooser.toggle(key, row.id)} /><span><strong>{row.title || 'Uten navn'}</strong><br />{key === 'sjas' ? row.status === 'signed' ? `Signert ${formatDeviationDateTime(row.signed_at)}` : 'Utkast – ikke signert' : key==='ruhs'?({ open: 'Åpen', in_progress: 'Under behandling', closed: 'Lukket' }[row.status]):row.status==='completed'?`Fullført ${formatDeviationDateTime(row.completed_at)}`:'Under arbeid – ikke fullført'}</span></label>)}
    </fieldset>)}
    <div className="ks-actions">
      <button type="button" disabled={busy || !choices} onClick={chooser.confirm}>{kind === 'pdf' ? 'Lag PDF med valget' : kind === 'print' ? 'Skriv ut med valget' : 'Bruk valget i rapporten'}</button>
      <button type="button" className="secondary" onClick={chooser.without}>{kind === 'preview' ? 'Bruk rapport uten KS/HMS' : 'Fortsett uten KS/HMS'}</button>
      {error && <button type="button" className="secondary" disabled={busy} onClick={chooser.refresh}>Oppdater listen</button>}
      <button type="button" className="secondary" onClick={chooser.cancel}>Avbryt</button>
    </div>
  </section></div>;
}
