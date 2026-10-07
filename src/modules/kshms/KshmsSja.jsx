import { useEffect, useId, useRef, useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import { ProjectChoice, RoutineChoice, useKshmsJobChoices } from './KshmsJobChoices.jsx';
import DeviationDialog from '../deviations/DeviationDialog.jsx';
import { SJA_HINTS, SJA_ROW_LABELS as labels, SJA_SOURCES, SJA_STATEMENT, SJA_SUGGESTIONS, appendSjaSuggestion, blankSja, blankSjaParticipant, blankSjaStep, newSjaRequests, participantFields, persistSjaDraft, readSjaDraft, sameSjaContent, saveSja, sjaDraftKey, sjaSigningIssues, stepFields } from './kshmsSja.mjs';
import './kshmsSja.css';

const dateTime = value => new Date(value).toLocaleString('nb-NO');
function Field({ label, hint, value, onChange, multiline = false, type = 'text', maxLength = 4000, fieldKey, suggestions = [], requiredForSigning = false, invalid = false }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, invalid && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const inputProps = { id, 'data-sja-field': fieldKey, 'aria-describedby': describedBy, 'aria-invalid': invalid || undefined, 'aria-required': requiredForSigning || undefined, maxLength, value: value || '', onChange: event => onChange(event.target.value) };
  return <div className="ks-field sja-field">
    <label htmlFor={id}>{label}{requiredForSigning && <span aria-hidden="true"> *</span>}</label>{hint && <span className="ks-field-hint" id={`${id}-hint`}>{hint}</span>}
    {multiline ? <textarea {...inputProps} rows={3} /> : <input {...inputProps} type={type} />}
    {invalid && <span className="sja-field-error" id={`${id}-error`}>Mangler før signering.</span>}
    {suggestions.length > 0 && <details className="sja-suggestions"><summary>Se forslag til {label.toLocaleLowerCase('nb-NO')}</summary><p>Velg det som passer. Tilpass teksten og erstatt [klammene] med egne opplysninger. Forslaget bekrefter ingen utført kontroll.</p><div>{suggestions.map(suggestion => <button type="button" className="secondary" key={suggestion} onClick={event => { event.preventDefault(); onChange(appendSjaSuggestion(value, suggestion, multiline ? '\n' : ' · ')); }}>{suggestion}</button>)}</div></details>}
  </div>;
}
function Snapshot({ content, members = [], identity }) {
  const leaderName = identity?.id === content.leader_id ? identity.name : members.find(member => member.id === content.leader_id)?.identity.name;
  return <div className="sja-comparison"><h4>{content.title || 'Uten navn'}</h4><p>{content.workplace}</p><p>{content.task}</p><dl>{[['project_reference','Ordre / prosjektreferanse'],['planned_on','Planlagt arbeidsdato'],['reviewed_on','Dato for gjennomgang']].map(([key,label])=><div key={key}><dt>{label}</dt><dd>{content[key] || 'Ikke utfylt'}</dd></div>)}<dt>Ansvarlig prosjektleder</dt><dd>{leaderName || (content.leader_id ? 'Personen er ikke lenger i brukerlisten' : 'Ikke valgt')}</dd></dl>{content.steps.map((row, index) => <article key={row.id}><h5>{`Arbeidstrinn ${index + 1}`}</h5><dl>{stepFields.map(key => <div key={key}><dt>{labels[key]}</dt><dd>{row[key] || 'Ikke utfylt'}</dd></div>)}</dl></article>)}<dl>{['routines', 'equipment', 'ppe', 'emergency', 'stop_conditions', 'communication'].map(key => <div key={key}><dt>{{ routines: 'Rutiner', equipment: 'Arbeidsutstyr', ppe: 'Verneutstyr', emergency: 'Beredskap', stop_conditions: 'Stans og ny vurdering', communication: 'Gjennomgang' }[key]}</dt><dd>{content[key] || 'Ikke utfylt'}</dd></div>)}</dl><h5>Deltakere</h5>{content.participants.map(row => <p key={row.id}>{row.name} · {row.role} · {row.company}<br />{row.involvement}</p>)}</div>;
}

export default function KshmsSja({ context, active = true, projectId = null, scopeReadOnly = false, createRequest = null }) {
  const companyId = context.company_id, userId = context.user_id;
  const [data, setData] = useState(null), [editor, setEditor] = useState(null), [record, setRecord] = useState(null), [cached, setCached] = useState(null), [conflict, setConflict] = useState(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [dirty, setDirty] = useState(false), [checked, setChecked] = useState(false), [attempted, setAttempted] = useState(false);
  const [query, setQuery] = useState(''), [status, setStatus] = useState('all');
  const [opening, setOpening] = useState(false), [verified, setVerified] = useState(false), [discarding, setDiscarding] = useState(false);
  const [validationFocus, setValidationFocus] = useState(0);
  const choices = useKshmsJobChoices(context, Boolean(editor));
  const handledCreate = useRef(null);
  const scopeRef = useRef(null), locked = useRef(false), listRequest = useRef(0), openRequest = useRef(0), formRef = useRef(null), missingRef = useRef(null);
  const current = scope => scope?.active && scopeRef.current === scope;
  const allowedState = value => value?.context?.company_id === companyId && value.context.user_id === userId && value.context.enabled;
  const load = async () => {
    const scope = scopeRef.current, request = ++listRequest.current;
    const value = await kshmsRpc(projectId ? 'kshms_project_sja_state' : 'kshms_sja_state', { p_company_id: companyId, p_query: query, p_status: status, ...(projectId ? { p_project_id: projectId } : {}) });
    if (!current(scope) || request !== listRequest.current) return null;
    if (!allowedState(value) || projectId && value.context.project_id !== projectId) throw new Error('SJA-tilgangen, prosjektet eller arbeidsfirmaet er endret.');
    setData(value); return value;
  };
  useEffect(() => {
    const scope = { active: true }; scopeRef.current = scope;
    setData(null); setEditor(null); setRecord(null); setConflict(null); setDirty(false); setChecked(false); setError(''); setVerified(false); setOpening(false); setDiscarding(false);
    setCached(readSjaDraft(window.localStorage, userId, companyId, projectId));
    load().catch(cause => { if (current(scope)) setError(cause.message); });
    return () => { scope.active = false; };
  }, [companyId, userId, projectId]);
  useEffect(() => { if (validationFocus) { missingRef.current?.focus({ preventScroll: true }); missingRef.current?.scrollIntoView?.({ block: 'nearest' }); } }, [validationFocus]);
  useEffect(() => { const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  const readOnly = scopeReadOnly || data?.project?.locked || record?.project_locked || record?.status === 'signed' || record && !(data?.context.manage || record.created_by === userId || record.leader_id === userId);
  const clearDraft = () => {
    try { window.localStorage.removeItem(sjaDraftKey(userId, companyId, projectId)); setCached(null); setDiscarding(false); return true; }
    catch { setError('Kladden kunne ikke fjernes på denne enheten. Prøv igjen.'); return false; }
  };
  const useSaved = saved => {
    if (cached?.id === saved.id && !clearDraft()) return;
    setRecord(saved); setEditor({ id: saved.id, project_id: saved.project_id || null, revision: saved.revision, requests: newSjaRequests(), content: saved.content });
    setConflict(null); setDirty(false); setChecked(false); setVerified(true); setError('');
  };
  const cache = next => {
    setEditor(next); setDirty(true); setChecked(false); setNotice('');
    try { persistSjaDraft(window.localStorage, userId, companyId, next, projectId); setCached(next); } catch { setError('Kladden kunne ikke sikres på denne enheten. Behold dialogen åpen og bruk Lagre utkast.'); }
  };
  const change = (key, value) => cache({ ...editor, requests: newSjaRequests(), content: { ...editor.content, [key]: value } });
  const changeRow = (group, id, key, value) => change(group, editor.content[group].map(row => row.id === id ? { ...row, [key]: value } : row));
  const close = () => { if (locked.current) return; ++openRequest.current; setEditor(null); setRecord(null); setConflict(null); setChecked(false); setAttempted(false); setDirty(false); setOpening(false); setVerified(false); setDiscarding(false); };
  const choose = async (row, resume = false) => {
    if (locked.current) return;
    if (!row && !resume) {
      if (scopeReadOnly || data?.project?.locked) return;
      if (cached) { setError('Du har en lokal kladd. Fortsett og lagre den før du starter en ny SJA.'); return; }
      ++openRequest.current; setEditor(blankSja(undefined, projectId)); setRecord(null); setDirty(false); setChecked(false); setConflict(null); setAttempted(false); setError(''); setNotice(''); setVerified(true); setOpening(false); setDiscarding(false); return;
    }
    const local = resume ? cached : cached?.id === row?.id ? cached : null;
    const id = local?.id || row?.id, scope = scopeRef.current, request = ++openRequest.current;
    setEditor(local || null); setRecord(null); setDirty(Boolean(local)); setVerified(false); setOpening(true); setDiscarding(false);
    setError(''); setNotice(''); setChecked(false); setAttempted(false); setConflict(null);
    try {
      const detail = await kshmsRpc('kshms_sja_detail', { p_company_id: companyId, p_id: id });
      if (!current(scope) || request !== openRequest.current) return;
      if (!allowedState(detail)) throw new Error('SJA-en er ikke tilgjengelig i aktivt firma.');
      const saved = detail.sja;
      if (projectId && saved && saved.project_id !== projectId) throw new Error('SJA-en tilhører et annet prosjekt. Kladden er beholdt.');
      setRecord(saved); setData(previous => previous ? { ...previous, context: { ...previous.context, ...detail.context } } : previous);
      if (!saved) { if (!local || local.revision !== 0) throw new Error('SJA-en ble ikke funnet. Kladden er beholdt.'); setVerified(true); return; }
      if (cached && cached.id !== id && saved.status === 'draft') { setEditor(null); setRecord(null); setError('Lagre den lokale kladden før du redigerer en annen SJA.'); return; }
      if (local && sameSjaContent(saved.content, local.content)) { useSaved(saved); }
      else {
        if (saved.status === 'signed' || !local) { setEditor({ id: saved.id, project_id: saved.project_id || null, revision: saved.revision, requests: newSjaRequests(), content: saved.content }); setDirty(false); }
        if (local && (saved.status === 'signed' || saved.revision !== local.revision)) setConflict(saved);
      }
      setVerified(true);
    } catch (cause) { if (current(scope) && request === openRequest.current) setError(cause.message); }
    finally { if (current(scope) && request === openRequest.current) setOpening(false); }
  };
  const save = async action => {
    if (locked.current || opening || !verified || !editor || readOnly || conflict) return;
    if (action === 'sign') {
      setAttempted(true);
      let issues;
      try { issues = sjaSigningIssues(editor.content); } catch (cause) { setError(cause.message); return; }
      if (issues.length || !checked) { setError(''); setValidationFocus(previous => previous + 1); return; }
    }
    const scope = scopeRef.current; locked.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const detail = await saveSja({ companyId, userId, editor, action, checked, rpc: kshmsRpc, isCurrent: () => current(scope) });
      if (!detail || !current(scope)) return;
      const saved = detail.sja; setRecord(saved); setEditor({ id: saved.id, project_id: saved.project_id || null, revision: saved.revision, requests: newSjaRequests(), content: saved.content }); setDirty(false); setCached(null); setChecked(false); setAttempted(false);
      try { window.localStorage.removeItem(sjaDraftKey(userId, companyId, projectId)); } catch { /* Server readback is confirmed; local cleanup cannot undo it. */ }
      setNotice(action === 'sign' ? 'SJA-en er signert og lagret. Den signerte analysen beholdes uendret.' : 'Utkastet er lagret. Du kan fortsette senere.');
      try { await load(); } catch { if (current(scope)) setError('SJA-en er lagret, men oversikten kunne ikke oppdateres. Bruk Oppdater SJA.'); }
    } catch (cause) {
      if (!current(scope)) return;
      setError(`${cause.message} Kladden er beholdt.`);
      if (cause.code === '40001') { try { const detail = await kshmsRpc('kshms_sja_detail', { p_company_id: companyId, p_id: editor.id }); if (current(scope) && allowedState(detail) && detail.sja) setConflict(detail.sja); } catch { /* Keep the local form when comparison cannot be loaded. */ } }
    } finally { locked.current = false; if (current(scope)) setBusy(false); }
  };
  useEffect(() => {
    if (!createRequest || handledCreate.current === createRequest || !active || !data || busy || opening || scopeReadOnly || data.project?.locked) return;
    handledCreate.current = createRequest;
    choose(null, Boolean(cached));
  }, [createRequest, active, data, busy, opening]);
  const issues = attempted && editor ? (() => { try { return sjaSigningIssues(editor.content); } catch { return []; } })() : [];
  const missingKeys = new Set(issues.map(issue => issue.key));
  const suggestions = key => readOnly ? [] : key === 'name' || key === 'owner' ? [...new Set([...(data?.members || []).map(member => member.identity.name).filter(Boolean), ...SJA_SUGGESTIONS[key]])] : key === 'company' ? [...new Set([context.company_name, ...SJA_SUGGESTIONS.company].filter(Boolean))] : SJA_SUGGESTIONS[key] || [];
  const field = (key, label, options = {}) => <Field key={key} fieldKey={key} label={label} hint={SJA_HINTS[key]} value={editor.content[key]} requiredForSigning={!['project_reference', 'routines'].includes(key)} invalid={missingKeys.has(key)} suggestions={suggestions(key)} onChange={value => change(key, value)} {...options} />;
  const focusField = key => { const node = formRef.current?.querySelector(key === 'confirmation' ? '.sja-confirm input' : `[data-sja-field="${key}"]`); node?.focus({ preventScroll: true }); node?.scrollIntoView?.({ block: 'center' }); };
  return <div className="ks-sja">
    <article className="ks-card sja-intro"><span className="ks-eyebrow">PLANLEGG FØR ARBEID</span><h3>{projectId ? `SJA for ${data?.project?.name || 'dette prosjektet'}` : 'Sikker jobbanalyse'}</h3><p>SJA betyr sikker jobbanalyse. Lag en ny analyse for den konkrete jobben. Gå gjennom arbeidstrinn, farer og tiltak sammen med dem som skal utføre arbeidet. Lagre et utkast underveis. Ansvarlig prosjektleder signerer etter gjennomgangen.</p><div className="ks-actions"><button type="button" disabled={busy || opening || !data || scopeReadOnly || data.project?.locked} onClick={() => choose(null)}>Ny SJA</button>{cached && <button type="button" className="secondary" disabled={busy || opening || !data} onClick={() => choose(null, true)}>Fortsett lokal kladd</button>}<button type="button" className="secondary" disabled={busy} onClick={() => load().catch(cause => setError(cause.message))}>Oppdater SJA</button></div></article>
    {cached && <aside className="sja-local"><p>Du har en lokal kladd på denne enheten. Fortsett kladden og lagre den før du starter en ny SJA.</p><button type="button" className="secondary" disabled={busy || opening} onClick={() => setDiscarding(true)}>Forkast lokal kladd</button>{discarding && <div><p>Dette fjerner bare kladden på denne enheten. Lagrede SJA-er beholdes.</p><button type="button" disabled={busy || opening} onClick={() => { if (clearDraft()) close(); }}>Ja, forkast lokal kladd</button><button type="button" className="secondary" onClick={() => setDiscarding(false)}>Behold kladden</button></div>}</aside>}
    {opening && !editor && <p role="status">Henter lagret SJA …</p>}
    {error && !editor && <p className="ks-error" role="alert">{error}</p>}{notice && !editor && <p className="ks-notice" role="status">{notice}</p>}
    <form className="sja-search" onSubmit={event => { event.preventDefault(); load().catch(cause => setError(cause.message)); }}><Field label="Søk i SJA" value={query} onChange={setQuery} maxLength={160} /><label className="ks-field"><span>Status</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Alle</option><option value="draft">Utkast</option><option value="signed">Signert</option></select></label><button type="submit" className="secondary" disabled={busy}>Søk</button></form>
    {data && <p className="ks-field-hint">{`${data.total} analyser i dette søket${data.total > data.items.length ? `. Viser de ${data.items.length} nyeste. Avgrens søket for eldre analyser.` : ''}`}</p>}
    <div className="sja-list">{data?.items.map(row => <button type="button" className="secondary sja-list-row" key={row.id} disabled={busy} onClick={() => choose(row)}><div><strong>{row.title}</strong><span>{row.workplace || 'Arbeidssted ikke utfylt'}{row.project_name ? ` · Prosjekt: ${row.project_name}` : row.project_reference ? ` · ${row.project_reference}` : ''}</span></div><div><span className="ks-badge">{row.status === 'signed' ? 'Signert' : 'Utkast'}</span><span>{row.status === 'signed' ? `${row.signed_identity?.name} · ${dateTime(row.signed_at)}` : row.leader_identity?.name ? `Ansvarlig: ${row.leader_identity.name}` : 'Ansvarlig ikke valgt'}</span></div></button>)}</div>
    {data && !data.items.length && <p>Ingen SJA-er i dette søket. Bruk Ny SJA for å starte med et tomt skjema.</p>}
    <details className="sja-sources"><summary>Faglig grunnlag for skjemaet</summary><p>Veiledningen er skrevet for ProffDok med disse kildene som grunnlag. Dere må selv vurdere jobben og forholdene på stedet. Én prosjektleders signatur og dokumentert medvirkning er firmaets valgte arbeidsflyt i appen.</p><ul>{SJA_SOURCES.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · kontrollert {source.checked_on}</li>)}</ul></details>
    {editor && active && <DeviationDialog title={readOnly ? 'Lagret SJA' : 'Sikker jobbanalyse'} context={`${context.company_name} · ${readOnly ? 'Dokumentasjon' : 'Utkast og gjennomgang'}`} busy={busy} closeLabel="Lukk SJA" onClose={close}>
      <form className="sja-editor" ref={formRef} onSubmit={event => { event.preventDefault(); save('save'); }}>
        {error && <p className="ks-error" role="alert">{error}</p>}{notice && <p className="ks-notice" role="status">{notice}</p>}
        {opening && <p role="status">Henter lagret SJA før du kan fortsette …</p>}
        {!verified && !opening && <button type="button" className="secondary" onClick={() => choose({ id: editor.id }, Boolean(cached?.id === editor.id))}>Prøv å åpne igjen</button>}
        {record?.status === 'signed' && <div className="ks-signatures"><strong>Signert av {record.signed_identity?.name}</strong><p>{dateTime(record.signed_at)}</p><p>{record.statement}</p><p>Ved endringer i jobben eller forholdene gjør dere en ny vurdering. Den signerte analysen beholdes.</p></div>}
        {conflict && <aside className="sja-conflict"><h3>{conflict.status === 'signed' ? 'SJA-en er allerede signert' : 'En kollega har lagret en nyere SJA'}</h3><p>Din lokale kladd er beholdt. Sammenlign før du velger hva du vil beholde.</p><details><summary>Se lagret analyse</summary><Snapshot content={conflict.content} members={data?.members} identity={conflict.leader_identity} /></details>{conflict.status === 'signed' && cached && <details><summary>Se din lokale kladd</summary><Snapshot content={cached.content} members={data?.members} /></details>}<div className="ks-actions">{conflict.status === 'draft' && <button type="button" className="secondary" disabled={busy} onClick={() => { cache({ ...editor, revision: conflict.revision, requests: newSjaRequests() }); setRecord(conflict); setConflict(null); setError(''); }}>Jeg har sammenlignet – fortsett med min kladd</button>}<button type="button" className="secondary" disabled={busy} onClick={() => useSaved(conflict)}>Bruk lagret SJA og forkast lokal kladd</button></div>{conflict.status === 'signed' && <p>Analysen er signert. Den lokale kladden kan ikke overskrive den.</p>}</aside>}
        {editor.project_id && <p className="sja-project-link">Koblet til prosjekt: <strong>{record?.project_name || data?.project?.name || choices.value?.projects.find(project => project.id === editor.project_id)?.name || 'Tilknyttet firmaprosjekt'}</strong>. Koblingen beholdes når SJA-en lagres og signeres.</p>}
        {!readOnly && <p className="ks-field-hint">* Må fylles ut før signering. Ekstern referanse, rutiner og deltakerens firma er valgfrie. Du kan lagre et ufullstendig utkast.</p>}
        <fieldset className="sja-fields" disabled={busy || readOnly || !verified}>
          <section className="sja-section"><h3><span>1</span> Oppgaven og arbeidsstedet</h3><div className="sja-grid">{field('title', 'Navn på jobben', { maxLength: 160 })}{field('workplace', 'Arbeidssted')}<ProjectChoice choices={choices} projectId={editor.project_id} projectName={record?.project_name || data?.project?.name} fixed={Boolean(projectId || editor.revision > 0 || readOnly)} onSelect={id => cache({ ...editor, project_id: id, requests: newSjaRequests() })} />{field('project_reference', 'Ekstern ordre / egen referanse')}{field('planned_on', 'Planlagt arbeidsdato', { type: 'date' })}<label className="ks-field sja-field"><span>Ansvarlig prosjektleder *</span><span className="ks-field-hint">Velg personen som leder gjennomgangen og signerer i egen app.</span><select data-sja-field="leader_id" aria-required="true" aria-invalid={missingKeys.has('leader_id') || undefined} value={editor.content.leader_id} onChange={event => change('leader_id', event.target.value)}><option value="">Velg ansvarlig</option>{record?.leader_id && !data?.members.some(member => member.id === record.leader_id) && <option value={record.leader_id}>{record.leader_identity?.name || 'Tidligere ansvarlig'}</option>}{data?.members.map(member => <option key={member.id} value={member.id}>{member.identity.name}</option>)}</select></label></div>{field('task', 'Arbeidsoppgave og avgrensning', { multiline: true })}</section>
          <section className="sja-section"><h3><span>2</span> Arbeidstrinn, farer og tiltak</h3><p>Vurder hvert trinn sammen. Legg til eller fjern trinn så analysen passer til denne jobben.</p>{editor.content.steps.map((row, index) => <fieldset className="sja-step" key={row.id}><legend>{`Arbeidstrinn ${index + 1}`}</legend><div className="sja-grid">{stepFields.map(key => <Field key={key} fieldKey={`steps.${index}.${key}`} label={labels[key]} hint={SJA_HINTS[key]} value={row[key]} requiredForSigning invalid={missingKeys.has(`steps.${index}.${key}`)} multiline maxLength={2000} suggestions={suggestions(key)} onChange={value => changeRow('steps', row.id, key, value)} />)}</div><button type="button" className="secondary" disabled={editor.content.steps.length === 1} onClick={() => change('steps', editor.content.steps.filter(item => item.id !== row.id))}>Fjern arbeidstrinn {index + 1}</button></fieldset>)}<button type="button" className="secondary" disabled={editor.content.steps.length >= 30} onClick={() => change('steps', [...editor.content.steps, blankSjaStep()])}>Legg til arbeidstrinn</button></section>
          <section className="sja-section"><h3><span>3</span> Utstyr, rutiner og beredskap</h3>{!readOnly && <RoutineChoice choices={choices} onSelect={value => change('routines', appendSjaSuggestion(editor.content.routines, value))} />}{field('routines', 'Relevante rutiner og tillatelser', { multiline: true, suggestions: !readOnly ? SJA_SUGGESTIONS.routines : [] })}<div className="sja-grid">{field('equipment', 'Arbeidsutstyr og kontroll', { multiline: true })}{field('ppe', 'Verneutstyr', { multiline: true })}{field('emergency', 'Beredskap og førstehjelp', { multiline: true })}{field('stop_conditions', 'Når skal arbeidet stanses?', { multiline: true })}</div></section>
          <section className="sja-section"><h3><span>4</span> Deltakere og gjennomgang</h3><div className="sja-grid">{field('reviewed_on', 'Dato for gjennomgang', { type: 'date' })}{field('communication', 'Hvordan gjennomgikk dere jobben?', { multiline: true })}</div>{editor.content.participants.map((row, index) => <fieldset className="sja-step" key={row.id}><legend>{`Deltaker ${index + 1}`}</legend><div className="sja-grid">{participantFields.map(key => <Field key={key} fieldKey={`participants.${index}.${key}`} label={labels[key]} hint={SJA_HINTS[key]} value={row[key]} requiredForSigning={key !== 'company'} invalid={missingKeys.has(`participants.${index}.${key}`)} suggestions={suggestions(key)} multiline={key === 'involvement'} maxLength={2000} onChange={value => changeRow('participants', row.id, key, value)} />)}</div><button type="button" className="secondary" disabled={editor.content.participants.length === 1} onClick={() => change('participants', editor.content.participants.filter(item => item.id !== row.id))}>Fjern deltaker {index + 1}</button></fieldset>)}<button type="button" className="secondary" disabled={editor.content.participants.length >= 40} onClick={() => change('participants', [...editor.content.participants, blankSjaParticipant()])}>Legg til deltaker</button></section>
        </fieldset>
        {!readOnly && <div className="sja-signing">
          <h3>Ansvarlig prosjektleders signering</h3><p>{SJA_STATEMENT}</p>
          <label className="sja-confirm"><input type="checkbox" checked={checked} aria-invalid={attempted && !checked || undefined} disabled={busy || !verified || Boolean(conflict) || editor.content.leader_id !== userId} onChange={event => setChecked(event.target.checked)} />Jeg bekrefter gjennomgangen og signerer selv som ansvarlig prosjektleder.</label>
          {editor.content.leader_id !== userId && <p>Velg ansvarlig prosjektleder. Vedkommende signerer SJA-en i sin egen app. Du kan lagre utkastet nå.</p>}
          {attempted && (issues.length > 0 || !checked) && <aside className="sja-missing" role="alert" tabIndex={-1} ref={missingRef}>
            <h4>Dette mangler før du kan signere</h4><p>Fyll ut feltene under. Trykk på et feltnavn for å gå dit. Teksten din er beholdt.</p>
            <ul>{issues.map(issue => <li key={issue.key}><button type="button" className="sja-missing-link" onClick={() => focusField(issue.key)}>{issue.label}</button></li>)}{!checked && <li><button type="button" className="sja-missing-link" onClick={() => focusField(editor.content.leader_id === userId ? 'confirmation' : 'leader_id')}>Bekreft egen gjennomgang</button></li>}</ul>
          </aside>}
          <div className="ks-actions"><button type="submit" disabled={busy || !verified || Boolean(conflict)}>Lagre utkast</button><button type="button" className="secondary" disabled={busy || !verified || Boolean(conflict) || Boolean(editor.content.leader_id && editor.content.leader_id !== userId)} onClick={() => save('sign')}>Signer SJA</button><button type="button" className="secondary" disabled={busy} onClick={close}>Lukk</button></div>
          <p className="ks-field-hint">Lukk beholder teksten på denne enheten. Lagre utkast sikrer arbeidet for senere åpning.</p>
        </div>}
      </form>
    </DeviationDialog>}
  </div>;
}
