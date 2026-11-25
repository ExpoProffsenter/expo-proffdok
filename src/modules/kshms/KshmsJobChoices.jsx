import { useEffect, useId, useRef, useState } from 'react';
import { kshmsRpc } from './kshmsAccess.js';
import './kshmsSja.css';
import { routineNumber, routineReference } from './kshmsJobChoices.mjs';

export function useKshmsJobChoices(context, active) {
  const [value, setValue] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const scope = useRef(null), serial = useRef(0);
  const load = async (search = query) => {
    const owner = scope.current, request = ++serial.current;
    if (!owner?.active) return;
    setBusy(true); setError('');
    try {
      const result = await kshmsRpc('kshms_job_choices', { p_company_id: context.company_id, p_project_query: search });
      if (!owner.active || scope.current !== owner || request !== serial.current) return;
      if (!result?.context?.enabled || result.context.company_id !== context.company_id || result.context.user_id !== context.user_id) throw new Error('Prosjektvalget gjelder ikke denne arbeidsprofilen.');
      setValue(result);
    } catch (cause) { if (owner.active && scope.current === owner && request === serial.current) { setValue(null); setError(cause.message); } }
    finally { if (owner.active && scope.current === owner && request === serial.current) setBusy(false); }
  };
  useEffect(() => {
    const owner = { active: Boolean(active && context.enabled) }; scope.current = owner;
    setValue(null); setQuery(''); setError(''); setBusy(false);
    if (owner.active) load('');
    return () => { owner.active = false; };
  }, [context.company_id, context.user_id, context.enabled, active]);
  return { value, busy, error, query, setQuery, load };
}

export function ProjectChoice({ choices, projectId, projectName, fixed = false, onSelect }) {
  const id = useId(), projects = choices.value?.projects || [];
  return <div className="ks-field sja-field">
    <label htmlFor={id}>Prosjekt i ProffDok</label>
    <p className="ks-field-hint" id={`${id}-hint`}>Velg et aktivt prosjekt du har tilgang til. Da følger dokumentet prosjektet. For et eksternt oppdrag velger du «Manuelt / eksternt oppdrag» og skriver din egen referanse. Koblingen låses etter første lagring.</p>
    <select id={id} data-job-project value={projectId || ''} disabled={fixed || choices.busy} aria-describedby={`${id}-hint`} onChange={event => onSelect(event.target.value || null)}>
      <option value="">Manuelt / eksternt oppdrag</option>
      {projectId && !projects.some(project => project.id === projectId) && <option value={projectId}>{projectName || 'Tilknyttet firmaprosjekt'}</option>}
      {projects.map(project => <option key={project.id} value={project.id}>{project.name}{project.address ? ` · ${project.address}` : ''}</option>)}
    </select>
    {!fixed && <div className="ks-actions"><label htmlFor={`${id}-query`}>Søk i firmaprosjekter</label><input id={`${id}-query`} value={choices.query} maxLength={160} onChange={event => choices.setQuery(event.target.value)} /><button type="button" className="secondary" disabled={choices.busy} onClick={() => choices.load()}>Hent prosjekter</button></div>}
    {choices.busy && <small role="status">Henter prosjekter og rutiner …</small>}
    {choices.error && <small className="ks-error" role="alert">Kunne ikke hente valgene. {choices.error} Manuell referanse kan fortsatt brukes.</small>}
    {!fixed && choices.value && <small className="ks-field-hint">{choices.value.project_total ? `${choices.value.project_total} tilgjengelige aktive prosjekter${choices.value.project_total > projects.length ? '. Avgrens søket for å finne flere.' : '.'}` : 'Ingen tilgjengelige aktive prosjekter i dette søket.'}</small>}
  </div>;
}

export function RoutineChoice({ choices, onSelect }) {
  const [query, setQuery] = useState('');
  const routines = choices.value?.routines || [], search = query.trim().toLocaleLowerCase('nb-NO');
  const visible = routines.filter(row => `${routineNumber(row.reference_number)} ${row.content.title} ${row.content.chapter}`.toLocaleLowerCase('nb-NO').includes(search));
  return <details className="sja-suggestions ks-firm-routine-choices">
    <summary>Velg fra bedriftens godkjente rutiner</summary>
    <p>Les rutinen og velg «Legg inn rutine». Nummer og utgave legges til som redigerbar referanse. Dette bekrefter ingen gjennomgang eller opplæring.</p>
    <label className="ks-field"><span>Søk etter rutinenummer eller navn</span><input value={query} onChange={event => setQuery(event.target.value)} /></label>
    {choices.busy && <p role="status">Henter godkjente rutiner …</p>}
    {choices.error && <p className="ks-error" role="alert">Rutiner kunne ikke hentes. Bruk «Hent prosjekter» for å prøve igjen.</p>}
    {choices.value && !routines.length && <p>Ingen gjeldende, godkjente rutiner er tilgjengelige for deg. Firmaadmin kan godkjenne og tildele rutiner i håndboken.</p>}
    {routines.length > 0 && !visible.length && <p>Ingen rutiner passer søket.</p>}
    {visible.map(row => <details className="ks-card" key={row.id}><summary>{routineReference(row)}</summary><p className="ks-field-hint">Kapittel: {row.content.chapter}</p><dl>{[['Mål', 'goal'], ['Ansvar', 'responsibility'], ['Rutine', 'procedure'], ['Dokumentasjon', 'documentation'], ['Gjennomgang', 'confirmation']].map(([label, key]) => <div key={key}><dt>{label}</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{row.content[key]}</dd></div>)}</dl><button type="button" className="secondary" aria-label={`Legg inn rutine ${routineNumber(row.reference_number)}`} onClick={() => onSelect(routineReference(row))}>Legg inn rutine</button></details>)}
  </details>;
}
