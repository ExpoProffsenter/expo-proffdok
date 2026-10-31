import { useEffect, useRef, useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import { formatDeviationDateTime } from '../deviations/deviationDates.mjs';
import { emptyKshmsReport } from '../report/kshmsProjectReport.mjs';
import {readProjectReportRuns,prepareProjectControlDocuments} from '../report/projectControlReport.mjs';
import {sameRunValue} from '../checklist/checklistRuns.mjs';
import {isExecutionChecklist} from '../checklist/checklistSignatures.mjs';
const documentKeys=['sjas','ruhs','rounds','risks','runs'];
const emptySelection=()=>Object.fromEntries(documentKeys.map(key=>[key,[]]));
const headings={sjas:'SJA – sikker jobbanalyse',ruhs:'RUH – rapport om uønsket hendelse',rounds:'Vernerunder / kontroller',risks:'Risikovurderinger 5×5',runs:'Fullførte prosjektkontroller'};
import './kshms.css';
import './kshmsProjectReport.css';

export function useKshmsProjectReport({ context, userId, projectId, disabled = false, resolveFileUrl, loadControlImage }) {
  const enabled = !!(context?.company_id && context.user_id === userId && projectId && !disabled);
  const kshmsEnabled=enabled&&!!context.enabled;
  const scope = `${userId || ''}:${context?.company_id || ''}:${projectId || ''}:${enabled}:${kshmsEnabled}:${!!context?.manage}`;
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
    const listing=args.p_run_ids===null;
    const [legacy,executions,runs]=await Promise.all([
      kshmsEnabled?kshmsRpc('kshms_project_report',{...base,p_sja_ids:args.p_sja_ids,p_ruh_ids:args.p_ruh_ids}):Promise.resolve(listing?{choices:{sjas:[],ruhs:[]}}:{sjas:[],ruhs:[]}),
      kshmsEnabled?kshmsRpc('kshms_project_execution_report',{...base,p_round_ids:args.p_round_ids,p_risk_ids:args.p_risk_ids}):Promise.resolve(listing?{choices:{rounds:[],risks:[]}}:{rounds:[],risks:[]}),
      readProjectReportRuns({rpc:kshmsRpc,companyId:context.company_id,userId,projectId,ids:args.p_run_ids,isCurrent:active}),
    ]);
    if(kshmsEnabled){check(legacy);check(executions);}
    if(!runs||!active())throw Error('Prosjekt eller tilgang er endret. Åpne rapporten på nytt.');
    return listing?{choices:{...legacy.choices,...executions.choices,runs:runs.map(row=>({id:row.id,title:`${row.definition.category} · kontroll ${row.sequence}`,status:row.status,completed_at:row.completed_at,signed:!!row.signatures?.own?.image,execution:isExecutionChecklist(row.definition)}))}}:{...legacy,rounds:executions.rounds,risks:executions.risks,runs};
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
    fetchReport({ p_sja_ids: null, p_ruh_ids: null, p_round_ids: null, p_risk_ids: null, p_run_ids:null }).then(response => {
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
      const args={p_sja_ids:selection.sjas,p_ruh_ids:selection.ruhs,p_round_ids:selection.rounds,p_risk_ids:selection.risks,p_run_ids:selection.runs};
      const response = await fetchReport(args);
      if (!active() || revision !== sequence.current) return;
      // Missing IDs must block the whole export, never silently produce a partial report.
      for (const key of documentKeys) if (!Array.isArray(response[key]) || response[key].length !== selection[key].length || new Set(response[key].map(row => row.id)).size !== selection[key].length || !response[key].every(row => selection[key].includes(row.id) && row.project_id === projectId && row.company_id === context.company_id)) throw new Error('Et valgt dokument er ikke lenger tilgjengelig. Oppdater listen og velg på nytt.');
      for (const [key, kind] of [['rounds','round'],['risks','risk']]) if (response[key].some(row => row.kind !== kind || !['draft','completed'].includes(row.status))) throw new Error('Et valgt dokument har ugyldig type eller status. Oppdater listen.');
      const saved=JSON.parse(JSON.stringify(Object.fromEntries(documentKeys.map(key=>[key,response[key]]))));
      const valid=()=>active()&&revision===sequence.current;
      const runDocuments=await prepareProjectControlDocuments(saved.runs,{resolveFileUrl,loadImage:loadControlImage,isCurrent:valid});
      if(!runDocuments||!valid())return;
      const revalidate=async()=>{
        if(!valid())return false;
        if(!documentKeys.some(key=>saved[key].length))return true;
        const fresh=await fetchReport(args);
        if(!valid())return false;
        if(!documentKeys.every(key=>sameRunValue(saved[key],fresh[key])))throw Error('Et valgt dokument eller kontrollgrunnlaget er endret. Åpne rapportvalget på nytt.');
        return true;
      };
      if(!await revalidate())return;
      const snapshot = { ...saved,runDocuments,revalidate,exportRevision:revision, scope, checkSelection: true };
      setData(snapshot); finish(snapshot);
    } catch (failure) { if (active() && revision === sequence.current) setError(failure.message); }
    finally { if (active() && revision === sequence.current) setBusy(false); }
  };
  const without = () => {
    sequence.current++; setBusy(false);
    const snapshot = { ...emptyKshmsReport(), scope,exportRevision:sequence.current, checkSelection: true }; setData(snapshot); finish(snapshot);
  };
  return {
    enabled,kshmsEnabled, reportData, prepareExport,
    isCurrent: snapshot => active() && (!snapshot?.scope || snapshot.scope === scope)&&(!snapshot?.exportRevision||snapshot.exportRevision===sequence.current),
    chooser: dialog?.scope === scope && enabled ? { kind: dialog.kind,kshmsEnabled, choices, selection, busy, error,
      toggle: (key, id) => setSelection(previous => ({ ...previous, [key]: previous[key].includes(id) ? previous[key].filter(value => value !== id) : [...previous[key], id] })),
      confirm, without, cancel: () => { sequence.current++; setBusy(false); finish(null); }, refresh: async () => {
        if (busy) return; const revision = ++sequence.current; setBusy(true); setError('');
        try { const response = await fetchReport({ p_sja_ids: null, p_ruh_ids: null, p_round_ids: null, p_risk_ids: null,p_run_ids:null }); if (documentKeys.some(key=>!Array.isArray(response.choices?.[key]))) throw new Error('Dokumentlisten kunne ikke leses. Prøv igjen.'); if (active() && revision === sequence.current) { setChoices(response.choices); setSelection(emptySelection()); } }
        catch (failure) { if (active() && revision === sequence.current) setError(failure.message); }
        finally { if (active() && revision === sequence.current) setBusy(false); }
      },
    } : null,
  };
}

export function KshmsProjectReportChoice({ report }) {
  if (!report.enabled) return null;
  return <section className="ks-module ks-report-choice">
    <h3>{report.kshmsEnabled?'Kontroller og KS/HMS i prosjektrapporten':'Prosjektkontroller i rapporten'}</h3>
    <p>Velg fullførte prosjektkontroller fra lagret historikk. Svar, bilder og eventuelle signaturer følger den valgte kontrollen. Eldre kontroller uten tegnet signatur merkes tydelig. {report.kshmsEnabled?'SJA betyr sikker jobbanalyse. RUH betyr rapport om uønsket hendelse. Du kan også velge SJA, RUH, vernerunder og risikovurderinger. Utkast merkes tydelig. ':''}Rapporten kan deles med kunde, så kontroller innholdet før du tar det med.</p>
    <p>{documentKeys.reduce((n,key)=>n+(report.reportData[key]?.length||0),0)} dokumenter valgt.</p>
    <button type="button" onClick={() => report.prepareExport('preview')}>{report.kshmsEnabled?'Velg KS/HMS til rapport':'Velg prosjektkontroller til rapport'}</button>
  </section>;
}

export function KshmsProjectReportDialog({ chooser }) {
  const container = useRef(null);
  useEffect(() => { if (!chooser) return; const trigger = document.activeElement; container.current?.focus(); return () => { if (trigger?.isConnected) trigger.focus(); }; }, [!!chooser]);
  if (!chooser) return null;
  const { choices, selection, busy, error, kind,kshmsEnabled } = chooser;
  const visibleKeys=kshmsEnabled?documentKeys:['runs'];
  return <div className="ks-report-backdrop"><section ref={container} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="ks-report-title" className="ks-module ks-report-dialog" onKeyDown={event => {
    if (event.key === 'Escape') chooser.cancel();
    if (event.key !== 'Tab') return;
    const elements = [...container.current.querySelectorAll('button:not([disabled]), input:not([disabled])')], first = elements[0], last = elements.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === container.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}>
    <header className="ks-report-dialog-head"><h2 id="ks-report-title">{kshmsEnabled?'Velg KS/HMS til rapport':'Velg prosjektkontroller til rapport'}</h2><button type="button" className="secondary" aria-label="Lukk rapportvalg" onClick={chooser.cancel}>×</button></header>
    <div className="ks-report-dialog-body">
    <p>Bare avkryssede dokumenter fra dette prosjektet tas med. Prosjektkontroller må være fullført og følger lagret versjon. {kshmsEnabled?'SJA-utkast er ikke signert. Åpne RUH-er merkes med status og gjenstående oppfølging.':''}</p>
    {busy && <p role="status">Henter prosjektets dokumenter …</p>}
    {error && <p role="alert">{error}</p>}
    {choices && visibleKeys.map(key => <fieldset key={key} disabled={busy}>
      <legend>{headings[key]}</legend>
      {!choices[key].length && <p>Ingen tilgjengelige {headings[key]} på prosjektet.</p>}
      {choices[key].map(row => <label key={row.id} className="ks-report-option"><input type="checkbox" checked={selection[key].includes(row.id)} onChange={() => chooser.toggle(key, row.id)} /><span><strong>{row.title || 'Uten navn'}</strong><br />{key==='runs'?`${row.signed?'Signert':row.execution?'Historisk fullført – tegnet signatur er ikke lagret':'Fullført'} ${formatDeviationDateTime(row.completed_at)}`:key === 'sjas' ? row.status === 'signed' ? `Signert ${formatDeviationDateTime(row.signed_at)}` : 'Utkast – ikke signert' : key==='ruhs'?({ open: 'Åpen', in_progress: 'Under behandling', closed: 'Lukket' }[row.status]):row.status==='completed'?`Fullført ${formatDeviationDateTime(row.completed_at)}`:'Under arbeid – ikke fullført'}</span></label>)}
    </fieldset>)}
    </div>
    <div className="ks-actions ks-report-dialog-footer">
      <button type="button" disabled={busy || !choices} onClick={chooser.confirm}>{kind === 'pdf' ? 'Lag PDF med valget' : kind === 'print' ? 'Skriv ut med valget' : 'Bruk valget i rapporten'}</button>
      <button type="button" className="secondary" onClick={chooser.without}>{kshmsEnabled?(kind === 'preview' ? 'Bruk rapport uten KS/HMS' : 'Fortsett uten KS/HMS'):(kind==='preview'?'Bruk rapport uten prosjektkontroller':'Fortsett uten prosjektkontroller')}</button>
      {error && <button type="button" className="secondary" disabled={busy} onClick={chooser.refresh}>Oppdater listen</button>}
      <button type="button" className="secondary" onClick={chooser.cancel}>Avbryt</button>
    </div>
  </section></div>;
}
