import './projectDeviationOverview.css';
import { useEffect, useId, useRef, useState } from 'react';
import DeviationDialog from './DeviationDialog.jsx';
import { kshmsRpc } from '../kshms/kshmsAccess.js';
import { identityText } from '../kshms/kshmsPersonal.mjs';
import { createProjectDeviation, newProjectDeviation, projectDeviationDraftKey, readProjectDeviationDraft } from './projectDeviationCreate.mjs';

function Field({ label, value, onChange, multiline = false, type = 'text', required = false, maxLength = 20000 }) {
  const id = useId();
  return <label className="deviation-dialog-field" htmlFor={id}><span>{label}</span>{multiline
    ? <textarea id={id} rows={4} value={value || ''} onChange={e => onChange(e.target.value)} required={required} maxLength={maxLength}/>
    : <input id={id} type={type} value={value || ''} onChange={e => onChange(e.target.value)} required={required} maxLength={maxLength}/>}</label>;
}

export default function ProjectDeviationCreator({ uid, project, projectId, userId, context, onSave, onCreatedKshms, onOpenKshms, disabled = false }) {
  const key = projectDeviationDraftKey(userId, context?.company_id || projectId || 'project-draft', projectId || 'new');
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(null), [cached, setCached] = useState(() => readProjectDeviationDraft(window.localStorage, key));
  const [members, setMembers] = useState([]), [membersLoading, setMembersLoading] = useState(false), [membersError, setMembersError] = useState(''), [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [savedCaseId, setSavedCaseId] = useState(null), [focusEntry, setFocusEntry] = useState(null);
  const scope = useRef(null), locked = useRef(false);
  const current = owner => owner?.active && scope.current === owner;
  useEffect(() => {
    const owner = { active: true }; scope.current = owner;
    setOpen(false); setDraft(null); setCached(readProjectDeviationDraft(window.localStorage, key)); setMembers([]); setBusy(false); setError(''); setNotice(''); setSavedCaseId(null);
    return () => { owner.active = false; };
  }, [key, context?.enabled]);
  useEffect(() => {
    if (!open || !context?.enabled) return;
    const owner = scope.current; let active = true;
    setMembersLoading(true); setMembersError('');
    kshmsRpc('kshms_deviation_state', { p_company_id: context.company_id, p_status: 'open' }).then(value => {
      if (!active || !current(owner)) return;
      if (value.context?.company_id !== context.company_id || value.context?.user_id !== userId || !Array.isArray(value.members)) throw new Error('Medarbeiderlisten kunne ikke kontrolleres for dette firmaet.');
      setMembers(value.members);
    }).catch(e => { if (active && current(owner)) { setMembers([]); setMembersError(`Kunne ikke hente ansvarlige. ${e.message}`); } })
      .finally(() => { if (active && current(owner)) setMembersLoading(false); });
    return () => { active = false; };
  }, [open, key, context?.enabled, reload]);
  useEffect(() => {
    if (!focusEntry) return;
    const card = document.querySelector(`[data-project-deviation-id="${CSS.escape(focusEntry)}"]`);
    for (let parent=card?.parentElement;parent;parent=parent.parentElement) if(parent.tagName==='DETAILS') parent.open=true;
    card?.focus({ preventScroll: true }); card?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusEntry]);
  const keep = next => {
    try { window.localStorage.setItem(key, JSON.stringify({ ...next, savedAt: Date.now() })); setCached(next); return true; }
    catch { setError('Kladden kunne ikke sikres på denne enheten. Behold dialogen åpen til avviket er lagret.'); return false; }
  };
  const begin = () => {
    if (disabled || locked.current) return;
    const next = readProjectDeviationDraft(window.localStorage, key) || { entry: newProjectDeviation(uid()), requestId: crypto.randomUUID() };
    setDraft(next); setOpen(true); setError(''); setNotice(''); setSavedCaseId(null);
  };
  const change = (field, value) => {
    const next = { ...draft, entry: { ...draft.entry, [field]: value } };
    if (field === 'responsible_id') { const member = members.find(item => item.id === value); next.entry.responsible = member?.identity?.name || member?.identity?.email || ''; }
    setDraft(next); keep(next); setError('');
  };
  const dismiss = () => {
    if (locked.current) return;
    if (draft && !keep(draft)) return;
    setOpen(false); setNotice('Avvikskladden er beholdt. Trykk «Hent avvikskladd» for å fortsette.');
  };
  const save = async event => {
    event.preventDefault();
    if (locked.current || disabled || !draft) return;
    if (context?.enabled && !members.some(member => member.id === draft.entry.responsible_id)) { setError('Velg en aktiv medarbeider med KS/HMS-tilgang.'); return; }
    const owner = scope.current;
    if (!current(owner)) return;
    locked.current = true; setBusy(true); setError(''); setSavedCaseId(null); keep(draft);
    try {
      const result = await createProjectDeviation({ entry: draft.entry, requestId: draft.requestId, projectId, context, saveProject: onSave, rpc: kshmsRpc, isCurrent: () => current(owner) });
      if (!result || !current(owner)) return;
      window.localStorage.removeItem(key); setCached(null); setOpen(false); setDraft(null);
      if (result.case) await onCreatedKshms(result.case);
      else { setFocusEntry(result.entry.id); setNotice(result.entry.localOnly ? 'Avviket er lagt til i prosjektutkastet. Lagre prosjektet for å lagre det i skyen.' : 'Avviket er lagret i prosjektet for oppfølging.'); }
    } catch (e) { if (current(owner)) { setError(`Kunne ikke bekrefte hele lagringen. Kladden er beholdt. ${e.message}`); setSavedCaseId(e.caseId || null); } }
    finally { locked.current = false; if (current(owner)) setBusy(false); }
  };
  return <>
    <button type="button" disabled={disabled} onClick={begin}>+ Nytt HMS/prosjektavvik</button>
    {notice && <p role="status">{notice}</p>}
    {cached && !open && <div className="deviation-dialog-recovery"><button type="button" className="secondary" disabled={disabled} onClick={begin}>Hent avvikskladd</button></div>}
    {open && draft && <DeviationDialog title="Nytt HMS/prosjektavvik" context={`${project.projectName || project.address || 'Prosjekt'}${context?.enabled ? ' · KS/HMS-oppfølging' : ''}`} onClose={dismiss} busy={busy}>
      <p>{context?.enabled ? 'Beskriv hendelsen, velg hvem som skal følge opp og sett en frist. Ansvarlig dokumenterer tiltak og egen kontroll og lukker selv.' : 'Beskriv avviket og hvordan det skal følges opp i prosjektet.'}</p>
      {context?.enabled && !projectId && <p role="alert">Lagre prosjektet før du oppretter et avvik med KS/HMS-oppfølging. Kladden kan beholdes mens du lagrer prosjektet.</p>}
      {membersLoading && <p role="status">Henter medarbeidere …</p>}
      {membersError && <div role="alert" className="deviation-dialog-error"><p>{membersError}</p><button type="button" className="secondary" onClick={() => setReload(value => value + 1)}>Hent medarbeidere på nytt</button></div>}
      <form onSubmit={save}>
        <fieldset disabled={busy || disabled}><legend>Hendelse og ansvar</legend>
          <Field label="Kort tittel" value={draft.entry.title} onChange={value => change('title', value)} required maxLength={200}/>
          <Field label="Beskrivelse av avvik" value={draft.entry.description} onChange={value => change('description', value)} multiline required={Boolean(context?.enabled)}/>
          <div className="deviation-dialog-grid">
            <label className="deviation-dialog-field"><span>Type avvik</span><select value={draft.entry.type} onChange={e => change('type', e.target.value)}>{['HMS','SHA','Kvalitet','Fremdrift','Leveranse','Kundeavklaring','Annet'].map(type => <option key={type}>{type}</option>)}</select></label>
            <label className="deviation-dialog-field"><span>Alvorlighet</span><select value={draft.entry.severity} onChange={e => change('severity', e.target.value)}>{['Lav','Middels','Høy','Kritisk'].map(value => <option key={value}>{value}</option>)}</select></label>
            {context?.enabled ? <label className="deviation-dialog-field"><span>Ansvarlig for oppfølging og lukking</span><select required value={draft.entry.responsible_id} disabled={membersLoading || Boolean(membersError)} onChange={e => change('responsible_id', e.target.value)}>
              <option value="">Velg medarbeider</option>{draft.entry.responsible_id && !members.some(member => member.id === draft.entry.responsible_id) && <option value={draft.entry.responsible_id} disabled>Tilgangen til valgt ansvarlig må avklares</option>}{members.map(member => <option key={member.id} value={member.id}>{identityText(member.identity)}</option>)}
            </select></label> : <Field label="Ansvarlig" value={draft.entry.responsible} onChange={value => change('responsible', value)}/>}
            <Field label="Frist" type="date" value={draft.entry.dueDate} onChange={value => change('dueDate', value)} required={Boolean(context?.enabled)}/>
          </div>
          <Field label={context?.enabled ? 'Strakstiltak / sikring nå' : 'Tiltak / videre oppfølging'} value={context?.enabled ? draft.entry.immediate_action : draft.entry.action} onChange={value => change(context?.enabled ? 'immediate_action' : 'action', value)} multiline/>
          <label className="deviation-dialog-check"><input type="checkbox" checked={draft.entry.affectsWarranty} onChange={e => change('affectsWarranty', e.target.checked)}/><span>Kan påvirke garanti/sluttdokumentasjon</span></label>
          {!context?.enabled && <label className="deviation-dialog-check"><input type="checkbox" checked={draft.entry.includeInReport} onChange={e => change('includeInReport', e.target.checked)}/><span>Ta med i sluttrapport</span></label>}
        </fieldset>
        {error && <p role="alert" className="deviation-dialog-error">{error}</p>}
        {savedCaseId && <button type="button" className="secondary" disabled={busy} onClick={() => onOpenKshms(savedCaseId)}>Åpne lagret avvik</button>}
        <footer className="deviation-dialog-footer"><button type="button" className="secondary" disabled={busy} onClick={dismiss}>Behold kladd og lukk</button><button type="submit" disabled={busy || disabled || context?.enabled && (membersLoading || Boolean(membersError) || !projectId)}>{busy ? 'Lagrer avvik …' : 'Lagre avvik for oppfølging'}</button></footer>
      </form>
    </DeviationDialog>}
  </>;
}
