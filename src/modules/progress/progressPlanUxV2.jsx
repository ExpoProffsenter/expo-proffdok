// Expo ProffDok – FASE 35A
// Forenklet fremdriftsplan for håndverksprosjekter.
// - Akseptert tilbud kan brukes som arbeidsgrunnlag.
// - Prosjekt uten tilbud kan bruke samme standard hovedposter som tilbudsbyggeren.
// - Egne arbeidsoperasjoner kan alltid legges til.
// - Hver arbeidsoperasjon kan ha flere separate tider gjennom prosjektet.
// - UE ser planen read-only. Kunde ser den bare når bedriften deler den.

import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  EMPTY_PROGRESS_PLAN,
  getProgressSupabaseClient,
  isProgressSafePreviewMode,
  loadAcceptedOfferActivities,
  loadInternalProgressPlan,
  loadPortalProgressPlan,
  resolveInternalProgressProject,
  saveInternalProgressPlan,
} from './progressPlanSupabase.js';
import {
  STANDARD_PROGRESS_OPERATIONS,
  buildStandardProgressActivity,
} from './progressPlanStandardOperations.js';

const ROOT_ID = 'expo-progress-plan-root';
const NAV_ATTR = 'data-expo-progress-nav';
const MOBILE_ATTR = 'data-expo-progress-mobile';
const SALES_REF_KEY = 'expoProffDokCurrentProjectSalesRef';
const STATUS_OPTIONS = ['Ikke startet', 'Pågår', 'Avventer', 'Ferdig'];
const TRADE_SUGGESTIONS = [
  'Prosjekt / rigg',
  'Tømrer',
  'Rørlegger',
  'Elektriker',
  'Murer / flislegger',
  'Maler',
  'Ventilasjon',
  'Leverandør',
];

const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();
const lower = (value = '') => clean(value).toLowerCase();
const isoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const parseIsoDate = (value = '') => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};
const mondayOf = (dateValue) => {
  const date = dateValue instanceof Date ? new Date(dateValue) : new Date();
  date.setHours(12, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
};
const addDays = (date, count) => {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
};
const formatDay = (date) =>
  new Intl.DateTimeFormat('nb-NO', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(date);
const formatDate = (value) => {
  const date = parseIsoDate(value);
  return date
    ? new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : value || '';
};

function makeId(prefix = 'progress') {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function newActivity(title = 'Ny arbeidsoperasjon') {
  return {
    id: makeId('activity'),
    title,
    trade: '',
    resource: '',
    status: 'Ikke startet',
    sessions: [],
  };
}

function newSession(date = '') {
  return {
    id: makeId('session'),
    date: date || isoDate(new Date()),
    startTime: '08:00',
    endTime: '16:00',
    note: '',
  };
}

function normalizeActivity(activity = {}) {
  return {
    id: activity.id || makeId('activity'),
    title: clean(activity.title || 'Arbeidsoperasjon'),
    trade: clean(activity.trade || ''),
    resource: clean(activity.resource || ''),
    status: STATUS_OPTIONS.includes(activity.status) ? activity.status : 'Ikke startet',
    sessions: (Array.isArray(activity.sessions) ? activity.sessions : []).map((session) => ({
      id: session.id || makeId('session'),
      date: String(session.date || ''),
      startTime: String(session.startTime || ''),
      endTime: String(session.endTime || ''),
      note: String(session.note || ''),
    })),
    ...(activity.sourceMainPostId ? { sourceMainPostId: activity.sourceMainPostId } : {}),
    ...(activity.sourceSuggestionId ? { sourceSuggestionId: activity.sourceSuggestionId } : {}),
    ...(Array.isArray(activity.sourceOptionTitles) && activity.sourceOptionTitles.length
      ? { sourceOptionTitles: activity.sourceOptionTitles.map(clean).filter(Boolean) }
      : {}),
  };
}

function statusClass(status = '') {
  if (status === 'Ferdig') return 'done';
  if (status === 'Pågår') return 'active';
  if (status === 'Avventer') return 'waiting';
  return 'todo';
}

function ProgressPlanWorkspace({ mode, identity, requestRef, projectId: portalProjectId, role, onDirtyChange }) {
  const client = useMemo(() => getProgressSupabaseClient(), []);
  const safePreview = useMemo(() => isProgressSafePreviewMode(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [projectMeta, setProjectMeta] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [plan, setPlan] = useState({ ...EMPTY_PROGRESS_PLAN });
  const [customerVisible, setCustomerVisible] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [expandedActivityId, setExpandedActivityId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showOperationPicker, setShowOperationPicker] = useState(false);

  const portalMode = mode === 'customer' || mode === 'underleverandor';
  const readOnly = portalMode || !!projectMeta?.locked;
  const activities = plan.activities || [];
  const offerImported = ['accepted-offer', 'accepted-offer-testcopy'].includes(plan.source?.type || '');

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const loadProjectPlan = async (meta) => {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const value = await loadInternalProgressPlan(client, meta.id);
      const loadedActivities = (value.activities || []).map(normalizeActivity);
      setProjectMeta(meta);
      setPlan({
        version: 1,
        activities: loadedActivities,
        source: value.source || null,
      });
      setCustomerVisible(!!value.customerVisible);
      setDirty(false);
      setExpandedActivityId('');
      setShowOperationPicker(!loadedActivities.length && !meta.publicToken && !safePreview);
    } catch (loadError) {
      setError(loadError?.message || 'Kunne ikke hente fremdriftsplanen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (portalMode) {
          const value = await loadPortalProgressPlan(client, portalProjectId, role);
          if (cancelled) return;
          setProjectMeta({
            id: portalProjectId,
            title: identity || 'Prosjekt',
            address: '',
            requestRef: '',
            publicToken: '',
            locked: true,
          });
          setPlan({
            version: 1,
            activities: (value?.activities || []).map(normalizeActivity),
            source: value?.source || null,
          });
          setCustomerVisible(!!value?.customerVisible);
          setDirty(false);
          setExpandedActivityId('');
          setLoading(false);
          return;
        }

        const resolved = await resolveInternalProgressProject(client, { identity, requestRef });
        if (cancelled) return;
        setCandidates(resolved.candidates || []);
        if (resolved.project) await loadProjectPlan(resolved.project);
        else setLoading(false);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.message || 'Kunne ikke finne prosjektet for fremdriftsplanen.');
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [client, identity, portalMode, portalProjectId, requestRef, role]);

  const allSessionDates = activities
    .flatMap((activity) => activity.sessions || [])
    .map((session) => parseIsoDate(session.date))
    .filter(Boolean)
    .sort((a, b) => a - b);
  const anchorDate = allSessionDates[0] || parseIsoDate(projectMeta?.projectDate) || new Date();
  const weekStart = addDays(mondayOf(anchorDate), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const visibleDateSet = new Set(days.map(isoDate));

  const markPlan = (updater) => {
    setPlan((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { ...next, version: 1 };
    });
    setDirty(true);
    setNotice('');
  };

  const updateActivity = (activityId, patch) => {
    markPlan((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === activityId ? { ...activity, ...patch } : activity
      ),
    }));
  };

  const updateSession = (activityId, sessionId, patch) => {
    markPlan((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              sessions: activity.sessions.map((session) =>
                session.id === sessionId ? { ...session, ...patch } : session
              ),
            }
          : activity
      ),
    }));
  };

  const addOwnActivity = () => {
    const activity = newActivity();
    markPlan((prev) => ({ ...prev, activities: [...prev.activities, activity] }));
    setExpandedActivityId(activity.id);
    setShowOperationPicker(false);
  };

  const addSuggestedActivity = (operation) => {
    const alreadyExists = activities.some((activity) =>
      lower(activity.title) === lower(operation.title) ||
      clean(activity.sourceSuggestionId) === clean(operation.id)
    );
    if (alreadyExists) {
      setNotice(`${operation.title} ligger allerede i fremdriftsplanen.`);
      return;
    }
    const activity = normalizeActivity(buildStandardProgressActivity(operation, () => makeId('activity')));
    markPlan((prev) => ({ ...prev, activities: [...prev.activities, activity] }));
    setNotice(`${operation.title} ble lagt til som arbeidsoperasjon.`);
  };

  const removeActivity = (activityId) => {
    if (!window.confirm('Fjerne denne arbeidsoperasjonen fra fremdriftsplanen?')) return;
    markPlan((prev) => ({
      ...prev,
      activities: prev.activities.filter((activity) => activity.id !== activityId),
    }));
    if (expandedActivityId === activityId) setExpandedActivityId('');
  };

  const moveActivity = (activityId, direction) => {
    markPlan((prev) => {
      const list = [...prev.activities];
      const index = list.findIndex((activity) => activity.id === activityId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, activities: list };
    });
  };

  const addSession = (activityId) => {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) return;
    updateActivity(activityId, {
      sessions: [...activity.sessions, newSession(isoDate(weekStart))],
    });
  };

  const openActivityPlanning = (activity) => {
    setExpandedActivityId(activity.id);
    if (!activity.sessions.length) {
      updateActivity(activity.id, {
        sessions: [newSession(isoDate(weekStart))],
      });
    }
  };

  const removeSession = (activityId, sessionId) => {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) return;
    updateActivity(activityId, {
      sessions: activity.sessions.filter((session) => session.id !== sessionId),
    });
  };

  const importOffer = async () => {
    if (!projectMeta?.publicToken && !safePreview) return;
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const imported = await loadAcceptedOfferActivities(client, projectMeta);
      if (!imported.length) {
        setNotice('Fant ingen naturlige arbeidsoperasjoner i det aksepterte tilbudet.');
        return;
      }
      const existingKeys = new Set(
        activities.map((activity) => lower(activity.sourceMainPostId || activity.title))
      );
      const additions = imported
        .map(normalizeActivity)
        .filter((activity) => {
          const key = lower(activity.sourceMainPostId || activity.title);
          return key && !existingKeys.has(key);
        });
      if (!additions.length) {
        setNotice('Arbeidsoperasjonene fra tilbudet ligger allerede i planen.');
        return;
      }
      markPlan((prev) => ({
        ...prev,
        source: {
          type: safePreview ? 'accepted-offer-testcopy' : 'accepted-offer',
          requestRef: safePreview ? 'F-2026-0053-TESTKOPI' : projectMeta.requestRef || '',
          importedAt: new Date().toISOString(),
        },
        activities: [...prev.activities, ...additions],
      }));
      setShowOperationPicker(false);
      setNotice(
        safePreview
          ? `${additions.length} arbeidsoperasjoner ble lagt inn fra anonymisert Andreas-testkopi.`
          : `${additions.length} arbeidsoperasjoner ble lagt inn fra det aksepterte tilbudet.`
      );
    } catch (importError) {
      setError(importError?.message || 'Kunne ikke hente arbeidsoperasjoner fra tilbudet.');
    } finally {
      setLoading(false);
    }
  };

  const validatePlan = () => {
    const missingTitle = activities.find((activity) => !clean(activity.title));
    if (missingTitle) return 'Alle arbeidsoperasjoner må ha navn før planen kan lagres.';
    for (const activity of activities) {
      for (const session of activity.sessions || []) {
        if (!session.date || !session.startTime || !session.endTime) {
          return `Planlagt tid på «${activity.title}» må ha dato, fra- og til-tid.`;
        }
        if (session.endTime <= session.startTime) {
          return `Til-tid må være senere enn fra-tid på «${activity.title}».`;
        }
      }
    }
    return '';
  };

  const save = async () => {
    if (!projectMeta?.id || readOnly) return;
    const validationError = validatePlan();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = await saveInternalProgressPlan(client, projectMeta.id, plan, customerVisible);
      setPlan({
        version: 1,
        activities: (saved.activities || []).map(normalizeActivity),
        source: saved.source || null,
      });
      setCustomerVisible(!!saved.customerVisible);
      setDirty(false);
      setNotice(saved.localOnly ? 'Testkopien er lagret lokalt i denne nettleseren.' : 'Fremdriftsplanen er lagret.');
    } catch (saveError) {
      setError(saveError?.message || 'Kunne ikke lagre fremdriftsplanen.');
    } finally {
      setSaving(false);
    }
  };

  const selectCandidate = async (projectId) => {
    const candidate = candidates.find((item) => item.id === projectId);
    if (candidate) await loadProjectPlan(candidate);
  };

  const renderSourceOptions = (activity) => {
    const optionTitles = Array.isArray(activity.sourceOptionTitles) ? activity.sourceOptionTitles : [];
    if (!optionTitles.length) return null;
    return (
      <div className="progress-source-options">
        <span>Valgte opsjoner i tilbudsgrunnlaget</span>
        <div>{optionTitles.map((title) => <small key={title}>{title}</small>)}</div>
      </div>
    );
  };

  const renderActivityEditor = (activity, activityIndex, { mobile = false } = {}) => (
    <div
      className={`progress-editor${mobile ? ' progress-mobile-editor' : ''}`}
      {...(!mobile ? { style: { gridColumn: `1 / span ${days.length + 1}` } } : {})}
    >
      <div className="progress-editor-topline">
        <div>
          <span className="progress-eyebrow">Planlegg arbeidsoperasjon</span>
          <strong>{activity.title || 'Arbeidsoperasjon'}</strong>
        </div>
        <button type="button" className="progress-link" onClick={() => setExpandedActivityId('')}>Lukk</button>
      </div>
      <div className="progress-editor-grid">
        <label>
          <span>Arbeidsoperasjon</span>
          <input value={activity.title} onChange={(event) => updateActivity(activity.id, { title: event.target.value })} />
        </label>
        <label>
          <span>Fag</span>
          <input list="expo-progress-trades" value={activity.trade} onChange={(event) => updateActivity(activity.id, { trade: event.target.value })} placeholder="F.eks. Rørlegger" />
        </label>
        <label>
          <span>Person / firma</span>
          <input value={activity.resource} onChange={(event) => updateActivity(activity.id, { resource: event.target.value })} placeholder="F.eks. montør / UE-firma" />
        </label>
        <label>
          <span>Status</span>
          <select value={activity.status} onChange={(event) => updateActivity(activity.id, { status: event.target.value })}>
            {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
      </div>
      {renderSourceOptions(activity)}
      <datalist id="expo-progress-trades">
        {TRADE_SUGGESTIONS.map((trade) => <option key={trade} value={trade} />)}
      </datalist>

      <div className="progress-session-heading">
        <div>
          <strong>Planlagte tider</strong>
          <span>Samme håndverker kan legges inn flere ganger på ulike dager og klokkeslett.</span>
        </div>
        <button type="button" className="progress-secondary" onClick={() => addSession(activity.id)}>+ Legg til ny tid</button>
      </div>
      <div className="progress-session-list">
        {activity.sessions.map((session) => (
          <div key={session.id} className="progress-session-editor">
            <label><span>Dato</span><input type="date" value={session.date} onChange={(event) => updateSession(activity.id, session.id, { date: event.target.value })} /></label>
            <label><span>Fra</span><input type="time" value={session.startTime} onChange={(event) => updateSession(activity.id, session.id, { startTime: event.target.value })} /></label>
            <label><span>Til</span><input type="time" value={session.endTime} onChange={(event) => updateSession(activity.id, session.id, { endTime: event.target.value })} /></label>
            <label className="progress-session-note"><span>Merknad</span><input value={session.note} onChange={(event) => updateSession(activity.id, session.id, { note: event.target.value })} placeholder="F.eks. grovmontering" /></label>
            <button type="button" className="progress-danger-link" onClick={() => removeSession(activity.id, session.id)}>Fjern</button>
          </div>
        ))}
        {!activity.sessions.length ? <p className="progress-muted">Ingen tider lagt inn ennå.</p> : null}
      </div>
      <div className="progress-editor-actions">
        <button type="button" className="progress-secondary" disabled={activityIndex === 0} onClick={() => moveActivity(activity.id, -1)}>Flytt opp</button>
        <button type="button" className="progress-secondary" disabled={activityIndex === activities.length - 1} onClick={() => moveActivity(activity.id, 1)}>Flytt ned</button>
        <button type="button" className="progress-danger" onClick={() => removeActivity(activity.id)}>Fjern arbeidsoperasjon</button>
      </div>
    </div>
  );

  if (loading && !projectMeta) {
    return <div className="progress-shell"><div className="progress-card"><b>Laster fremdriftsplan…</b></div></div>;
  }

  if (!portalMode && !projectMeta) {
    return (
      <div className="progress-shell">
        <div className="progress-card progress-resolver">
          <span className="progress-eyebrow">Fremdriftsplan</span>
          <h2>Velg riktig prosjekt</h2>
          <p>Prosjektnavnet er ikke entydig nok til at Expo ProffDok kan koble planen automatisk. Velg riktig prosjekt før du fortsetter.</p>
          {error ? <div className="progress-error">{error}</div> : null}
          <select defaultValue="" onChange={(event) => selectCandidate(event.target.value)}>
            <option value="">Velg prosjekt…</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {[candidate.title, candidate.address, candidate.customer].filter(Boolean).join(' · ')}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  const customerHidden = mode === 'customer' && !customerVisible;
  if (customerHidden) {
    return (
      <div className="progress-shell">
        <div className="progress-card"><h2>Fremdriftsplan</h2><p>Fremdriftsplanen er ikke delt med kunde på dette prosjektet.</p></div>
      </div>
    );
  }

  return (
    <div className="progress-shell">
      {safePreview ? (
        <div className="progress-test-banner">
          <strong>🧪 Trygg Preview-test</strong>
          <span>Andreas-testkopien og alle endringer i fremdriftsplanen lagres kun i denne nettleseren. Produksjon skrives ikke til.</span>
        </div>
      ) : null}

      <section className="progress-hero">
        <div>
          <span className="progress-eyebrow">{safePreview ? 'Testkopi · prosjektgjennomføring' : 'Prosjektgjennomføring'}</span>
          <h2>Fremdriftsplan</h2>
          <p><strong>{projectMeta?.title || identity || 'Prosjekt'}</strong>{projectMeta?.address ? ` · ${projectMeta.address}` : ''}</p>
        </div>
        <div className="progress-hero-actions">
          {!readOnly ? (
            <>
              {(projectMeta?.publicToken || safePreview) && !offerImported ? (
                <button type="button" className="progress-secondary" onClick={importOffer} disabled={loading || saving}>
                  {safePreview ? 'Hent Andreas-testkopi' : 'Hent arbeidsoperasjoner fra tilbud'}
                </button>
              ) : null}
              {offerImported ? <span className="progress-source-ok">✓ Tilbudsgrunnlag hentet</span> : null}
              <button type="button" className="progress-secondary" onClick={() => setShowOperationPicker((value) => !value)}>
                + Arbeidsoperasjoner
              </button>
              <button type="button" className="progress-primary" onClick={save} disabled={!dirty || saving}>
                {saving ? 'Lagrer…' : dirty ? 'Lagre fremdriftsplan' : 'Lagret'}
              </button>
            </>
          ) : <span className="progress-readonly">Kun visning</span>}
        </div>
      </section>

      {!readOnly && showOperationPicker ? (
        <section className="progress-operation-picker">
          <div className="progress-picker-heading">
            <div>
              <span className="progress-eyebrow">Legg til arbeidsoperasjoner</span>
              <strong>Velg forslag eller opprett egen</strong>
              <p>Forslagene bruker de samme hovedpostene som tilbudsbyggeren. Prosjektet trenger ikke å være opprettet fra et tilbud.</p>
            </div>
            <button type="button" className="progress-link" onClick={() => setShowOperationPicker(false)}>Lukk</button>
          </div>
          <div className="progress-operation-grid">
            {STANDARD_PROGRESS_OPERATIONS.map((operation) => {
              const added = activities.some((activity) => lower(activity.title) === lower(operation.title));
              return (
                <button
                  key={operation.id}
                  type="button"
                  className={`progress-operation-choice${added ? ' added' : ''}`}
                  disabled={added}
                  onClick={() => addSuggestedActivity(operation)}
                >
                  <strong>{added ? '✓ ' : '+ '}{operation.title}</strong>
                  <span>{operation.trade || 'Velg fag senere'}</span>
                </button>
              );
            })}
          </div>
          <div className="progress-own-operation">
            <button type="button" className="progress-primary" onClick={addOwnActivity}>+ Egen arbeidsoperasjon</button>
            <span>Bruk denne for arbeid som ikke passer i standardforslagene.</span>
          </div>
        </section>
      ) : null}

      {!readOnly ? (
        <section className="progress-share-card">
          <div>
            <strong>Vis fremdriftsplan til kunde</strong>
            <p>UE med gyldig prosjekttilgang kan alltid se planen. Kunden ser den bare når dette valget er aktivert.</p>
          </div>
          <label className="progress-switch">
            <input
              type="checkbox"
              checked={customerVisible}
              onChange={(event) => {
                setCustomerVisible(event.target.checked);
                setDirty(true);
                setNotice('');
              }}
            />
            <span>{customerVisible ? 'Kunde kan se planen' : 'Skjult for kunde'}</span>
          </label>
        </section>
      ) : null}

      {projectMeta?.locked && !portalMode ? <div className="progress-note">🔒 Prosjektet er låst. Fremdriftsplanen vises som historikk og kan ikke redigeres.</div> : null}
      {mode === 'underleverandor' ? <div className="progress-note">UE-visning: planen kan leses, men endres ikke her.</div> : null}
      {mode === 'customer' ? <div className="progress-note">Kundevisning: dette er bedriftens delte fremdriftsplan.</div> : null}
      {error ? <div className="progress-error">{error}</div> : null}
      {notice ? <div className="progress-success">{notice}</div> : null}

      <section className="progress-board-card">
        <div className="progress-board-toolbar">
          <div>
            <span className="progress-eyebrow">Ukeplan</span>
            <strong>{formatDate(isoDate(weekStart))} – {formatDate(isoDate(addDays(weekStart, 6)))}</strong>
          </div>
          <div className="progress-week-actions">
            <button type="button" className="progress-secondary" onClick={() => setWeekOffset((value) => value - 1)}>← Forrige uke</button>
            <button type="button" className="progress-secondary" onClick={() => setWeekOffset(0)}>Aktuell uke</button>
            <button type="button" className="progress-secondary" onClick={() => setWeekOffset((value) => value + 1)}>Neste uke →</button>
          </div>
        </div>

        {!activities.length ? (
          <div className="progress-empty">
            <h3>Ingen arbeidsoperasjoner ennå</h3>
            <p>
              {readOnly
                ? 'Prosjektansvarlig har ikke lagt inn arbeidsoperasjoner i fremdriftsplanen ennå.'
                : (projectMeta?.publicToken || safePreview)
                  ? 'Hent arbeidsoperasjoner fra det aksepterte tilbudet, velg standardforslag eller opprett egne.'
                  : 'Velg standard arbeidsoperasjoner fra tilbudsstrukturen eller opprett egne.'}
            </p>
            {!readOnly ? <button type="button" className="progress-primary" onClick={() => setShowOperationPicker(true)}>+ Legg til arbeidsoperasjoner</button> : null}
          </div>
        ) : (
          <div className="progress-board-scroll">
            <div className="progress-board" style={{ '--progress-days': days.length }}>
              <div className="progress-grid-head progress-sticky-left">Arbeidsoperasjon</div>
              {days.map((day) => (
                <div key={isoDate(day)} className={`progress-grid-head ${isoDate(day) === isoDate(new Date()) ? 'today' : ''}`}>{formatDay(day)}</div>
              ))}

              {activities.map((activity, activityIndex) => {
                const activitySessionsThisWeek = activity.sessions.filter((session) => visibleDateSet.has(session.date));
                return (
                  <React.Fragment key={activity.id}>
                    <div className="progress-activity-cell progress-sticky-left">
                      <div className="progress-activity-title-row">
                        <strong>{activity.title || 'Arbeidsoperasjon'}</strong>
                        <span className={`progress-status ${statusClass(activity.status)}`}>{activity.status}</span>
                      </div>
                      <span>{activity.trade || 'Fag ikke valgt'}{activity.resource ? ` · ${activity.resource}` : ''}</span>
                      {(activity.sourceOptionTitles || []).length ? <small className="progress-option-count">{activity.sourceOptionTitles.length} valgt(e) opsjon(er)</small> : null}
                      {!readOnly ? (
                        <button
                          type="button"
                          className="progress-link progress-time-link"
                          onClick={() => expandedActivityId === activity.id ? setExpandedActivityId('') : openActivityPlanning(activity)}
                        >
                          {expandedActivityId === activity.id ? 'Lukk' : activity.sessions.length ? 'Rediger tider' : '+ Legg inn tid'}
                        </button>
                      ) : null}
                    </div>
                    {days.map((day) => {
                      const date = isoDate(day);
                      const sessions = activitySessionsThisWeek.filter((session) => session.date === date);
                      return (
                        <div key={`${activity.id}-${date}`} className={`progress-day-cell ${date === isoDate(new Date()) ? 'today' : ''}`}>
                          {sessions.map((session) => (
                            <div key={session.id} className={`progress-session ${statusClass(activity.status)}`} title={session.note || ''}>
                              <b>{session.startTime || '–'}–{session.endTime || '–'}</b>
                              <span>{activity.resource || activity.trade || 'Arbeid'}</span>
                              {session.note ? <small>{session.note}</small> : null}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    {expandedActivityId === activity.id && !readOnly ? renderActivityEditor(activity, activityIndex) : null}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="progress-mobile-list">
        <span className="progress-eyebrow">Fremdrift</span>
        {activities.map((activity, activityIndex) => (
          <article key={`mobile-${activity.id}`} className="progress-mobile-card">
            <div className="progress-mobile-card-head">
              <strong>{activity.title}</strong>
              <span className={`progress-status ${statusClass(activity.status)}`}>{activity.status}</span>
            </div>
            <p>{activity.trade || 'Fag ikke valgt'}{activity.resource ? ` · ${activity.resource}` : ''}</p>
            {(activity.sourceOptionTitles || []).length ? <small className="progress-option-count">{activity.sourceOptionTitles.length} valgt(e) opsjon(er) i tilbudsgrunnlaget</small> : null}
            {(activity.sessions || []).slice().sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)).map((session) => (
              <div key={session.id} className="progress-mobile-session">
                <b>{formatDate(session.date)}</b><span>{session.startTime || '–'}–{session.endTime || '–'}</span>{session.note ? <small>{session.note}</small> : null}
              </div>
            ))}
            {!activity.sessions.length ? <small>Ingen tider lagt inn ennå.</small> : null}
            {!readOnly ? (
              <button type="button" className="progress-secondary" onClick={() => expandedActivityId === activity.id ? setExpandedActivityId('') : openActivityPlanning(activity)}>
                {expandedActivityId === activity.id ? 'Lukk' : activity.sessions.length ? 'Rediger tider' : '+ Legg inn tid'}
              </button>
            ) : null}
            {expandedActivityId === activity.id && !readOnly ? renderActivityEditor(activity, activityIndex, { mobile: true }) : null}
          </article>
        ))}
      </section>
    </div>
  );
}

const STYLE_TEXT = `
#${ROOT_ID}{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172126;max-width:1440px;margin:0 auto;padding:20px 18px 80px;box-sizing:border-box}
.progress-shell{display:grid;gap:16px}.progress-card,.progress-board-card,.progress-share-card,.progress-operation-picker{background:#fff;border:1px solid #d9e4e8;border-radius:18px;box-shadow:0 8px 28px rgba(20,42,52,.06)}
.progress-card{padding:24px}.progress-test-banner{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 14px;border-radius:14px;background:#fff7d6;border:1px solid #e5b83c;color:#674d00}.progress-test-banner span{font-size:13px}
.progress-hero{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding:24px 26px;border-radius:20px;background:linear-gradient(135deg,#172126,#26343a);color:#fff;box-shadow:0 14px 34px rgba(11,31,39,.18)}
.progress-hero h2{font-size:30px;margin:5px 0 4px}.progress-hero p{margin:0;color:#d6e4e8}.progress-eyebrow{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-weight:900;color:#0c8f98;margin-bottom:5px}.progress-hero .progress-eyebrow{color:#61dce2}
.progress-hero-actions,.progress-week-actions,.progress-editor-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.progress-primary,.progress-secondary,.progress-danger{border:0;border-radius:10px;padding:10px 14px;font:inherit;font-weight:800;cursor:pointer}.progress-primary{background:#12aeb7;color:#fff}.progress-secondary{background:#edf5f6;color:#155d63;border:1px solid #c7e0e3}.progress-danger{background:#fff1f2;color:#9f1239;border:1px solid #fecdd3}.progress-primary:disabled,.progress-secondary:disabled{opacity:.5;cursor:not-allowed}.progress-readonly{padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.12);font-weight:800}.progress-source-ok{padding:8px 11px;border-radius:999px;background:rgba(70,210,159,.16);color:#baf5dc;font-weight:800;font-size:13px}
.progress-operation-picker{padding:18px 20px}.progress-picker-heading{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.progress-picker-heading strong{font-size:18px}.progress-picker-heading p{margin:5px 0 0;color:#5d6b72}.progress-operation-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:15px}.progress-operation-choice{display:grid;gap:4px;text-align:left;padding:11px 12px;border-radius:11px;background:#f5fafb;border:1px solid #d5e6e9;color:#17383d;cursor:pointer}.progress-operation-choice span{font-size:12px;color:#63757d}.progress-operation-choice:hover{background:#eaf7f8;border-color:#9fd7db}.progress-operation-choice.added{background:#f2f6f7;color:#708087;cursor:default}.progress-own-operation{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid #e4ecef}.progress-own-operation span{color:#63757d;font-size:13px}
.progress-share-card{padding:18px 20px;display:flex;justify-content:space-between;gap:18px;align-items:center}.progress-share-card p{margin:5px 0 0;color:#5d6b72}.progress-switch{display:flex;align-items:center;gap:9px;font-weight:800}.progress-switch input{width:20px;height:20px}.progress-note,.progress-success,.progress-error{padding:12px 14px;border-radius:12px;font-weight:700}.progress-note{background:#f5f8f9;border:1px solid #dce5e8;color:#526168}.progress-success{background:#ecfdf5;border:1px solid #bbf7d0;color:#166534}.progress-error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}
.progress-board-card{overflow:hidden}.progress-board-toolbar{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:18px 20px;border-bottom:1px solid #e2eaed}.progress-board-toolbar strong{display:block;font-size:17px}.progress-board-scroll{overflow-x:auto}.progress-board{display:grid;grid-template-columns:minmax(270px,320px) repeat(var(--progress-days),minmax(128px,1fr));min-width:1180px}.progress-grid-head{padding:11px 10px;background:#f4f8f9;border-right:1px solid #e1e9ec;border-bottom:1px solid #dce6e9;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.03em;color:#4b5f67;text-align:center}.progress-grid-head.today,.progress-day-cell.today{background:#f0fbfc}.progress-sticky-left{position:sticky;left:0;z-index:3;text-align:left;box-shadow:7px 0 14px rgba(21,44,54,.04)}
.progress-activity-cell{padding:12px 13px;background:#fff;border-right:1px solid #dce6e9;border-bottom:1px solid #e6edef;min-height:84px}.progress-activity-title-row{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.progress-activity-cell>span{display:block;margin-top:5px;color:#66777e;font-size:13px}.progress-option-count{display:block;margin-top:5px;color:#087f88;font-weight:800}.progress-link,.progress-danger-link{border:0;background:none;padding:5px 0;color:#087f88;font:inherit;font-size:12px;font-weight:900;cursor:pointer}.progress-time-link{font-size:13px}.progress-danger-link{color:#be123c}.progress-status{display:inline-flex;padding:4px 7px;border-radius:999px;font-size:10px;font-weight:900;white-space:nowrap}.progress-status.todo{background:#f1f5f9;color:#475569}.progress-status.active{background:#fef3c7;color:#92400e}.progress-status.waiting{background:#dbeafe;color:#1e40af}.progress-status.done{background:#dcfce7;color:#166534}
.progress-day-cell{min-height:84px;padding:6px;border-right:1px solid #eef2f4;border-bottom:1px solid #e6edef;background:#fff;display:grid;align-content:start;gap:5px}.progress-session{padding:7px 8px;border-radius:9px;background:#e9f7f8;border-left:4px solid #1199a3;display:grid;gap:2px;font-size:11px}.progress-session.active{background:#fff7d8;border-left-color:#e8a317}.progress-session.waiting{background:#edf4ff;border-left-color:#4c78c2}.progress-session.done{background:#edf9f1;border-left-color:#2f9b63}.progress-session span,.progress-session small{white-space:normal;color:#55666e}
.progress-editor{background:#f8fbfc;border-bottom:1px solid #dbe6e9;padding:16px 18px}.progress-editor-topline{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.progress-editor-topline strong{font-size:17px}.progress-editor-grid{display:grid;grid-template-columns:2fr 1fr 1.3fr 1fr;gap:12px}.progress-editor label,.progress-session-editor label{display:grid;gap:5px}.progress-editor label span,.progress-session-editor label span{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.03em;color:#61727a}.progress-editor input,.progress-editor select,.progress-resolver select{width:100%;box-sizing:border-box;border:1px solid #cbd9de;border-radius:9px;padding:9px 10px;background:#fff;font:inherit}.progress-source-options{margin-top:12px;padding:10px 12px;border-radius:10px;background:#eef8f9;border:1px solid #cfe6e8}.progress-source-options>span{display:block;font-size:11px;font-weight:900;text-transform:uppercase;color:#517078;margin-bottom:6px}.progress-source-options>div{display:flex;gap:6px;flex-wrap:wrap}.progress-source-options small{padding:5px 7px;border-radius:999px;background:#fff;border:1px solid #c9e1e3;color:#275b60}.progress-session-heading{display:flex;justify-content:space-between;align-items:end;gap:12px;margin:18px 0 9px}.progress-session-heading span{display:block;color:#63757d;font-size:13px;margin-top:3px}.progress-session-list{display:grid;gap:8px}.progress-session-editor{display:grid;grid-template-columns:150px 110px 110px minmax(220px,1fr) 64px;gap:9px;align-items:end;padding:10px;border-radius:12px;background:#fff;border:1px solid #dbe5e8}.progress-editor-actions{margin-top:14px}.progress-muted{color:#64748b;margin:8px 0}.progress-empty{padding:34px;text-align:center;color:#5f7078}.progress-empty h3{color:#203038;margin:0 0 6px}
.progress-mobile-list{display:none}.progress-mobile-card{background:#fff;border:1px solid #d9e4e8;border-radius:15px;padding:14px;display:grid;gap:9px}.progress-mobile-card-head{display:flex;justify-content:space-between;gap:10px}.progress-mobile-card p{margin:0;color:#62737b}.progress-mobile-session{display:grid;grid-template-columns:100px 90px 1fr;gap:7px;padding:8px 9px;border-radius:9px;background:#f3f8f9;font-size:12px}.progress-mobile-editor{margin-top:4px;border:1px solid #d5e3e6;border-radius:12px;background:#f8fbfc;padding:12px}.progress-resolver{max-width:760px;margin:30px auto}.progress-resolver h2{margin:4px 0 8px}.progress-resolver p{color:#5b6c73;line-height:1.5}
@media(max-width:1050px){.progress-operation-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:820px){#${ROOT_ID}{padding:12px 10px 60px}.progress-hero{align-items:flex-start;flex-direction:column;padding:20px}.progress-hero h2{font-size:25px}.progress-test-banner,.progress-share-card,.progress-board-toolbar,.progress-picker-heading{align-items:flex-start;flex-direction:column}.progress-operation-grid{grid-template-columns:1fr}.progress-board-card{display:none}.progress-mobile-list{display:grid;gap:10px}.progress-editor-grid{grid-template-columns:1fr}.progress-session-heading{align-items:flex-start;flex-direction:column}.progress-session-editor{grid-template-columns:1fr 1fr}.progress-session-note{grid-column:1/-1}.progress-session-editor .progress-danger-link{grid-column:1/-1;text-align:left}.progress-mobile-session{grid-template-columns:1fr 1fr}.progress-mobile-session small{grid-column:1/-1}.progress-mobile-editor .progress-editor-actions{display:grid;grid-template-columns:1fr 1fr}.progress-mobile-editor .progress-danger{grid-column:1/-1}}
`;

let installed = false;
let active = false;
let reactRoot = null;
let currentDirty = false;
let portalAvailability = null;
let portalAvailabilityContext = '';
let availabilityBusy = false;
let observer = null;
let observerTimer = null;
let desktopButton = null;

function modeFromLocation() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('project')) return 'internal';
  const role = lower(params.get('role') || params.get('access') || '');
  if (role === 'underleverandor' || role === 'underleverandør' || role === 'underentreprenør') return 'underleverandor';
  if (role === 'admin') return 'internal';
  return 'customer';
}

function portalProjectId() {
  return clean(new URLSearchParams(window.location.search).get('project') || '');
}

function projectIdentity() {
  return clean(
    document.querySelector('.mobileCurrentProjectBar span')?.textContent ||
    document.querySelector('.mobileProjectLineText span')?.textContent ||
    document.querySelector('header .head p')?.textContent ||
    document.querySelector('.projectOverviewQuickStart strong')?.textContent ||
    ''
  );
}

function currentSalesRef() {
  try { return clean(window.sessionStorage.getItem(SALES_REF_KEY) || ''); }
  catch { return ''; }
}

function findNav(mode) {
  const navs = Array.from(document.querySelectorAll('nav'));
  if (mode === 'customer') {
    return navs.find((nav) => {
      const labels = Array.from(nav.querySelectorAll('button')).map((button) => clean(button.textContent));
      return labels.includes('Oversikt') && labels.includes('Rapport') && labels.includes('Dokumentasjon');
    }) || null;
  }
  if (mode === 'underleverandor') {
    return navs.find((nav) => {
      const labels = Array.from(nav.querySelectorAll('button')).map((button) => clean(button.textContent));
      return labels.includes('Prosjektinformasjon') && labels.includes('Sjekklister');
    }) || null;
  }
  return navs.find((nav) => {
    const labels = Array.from(nav.querySelectorAll('button')).map((button) => clean(button.textContent));
    return labels.includes('Prosjektoversikt') && labels.includes('Prosjektering') && labels.includes('Sjekklister');
  }) || null;
}

async function refreshPortalAvailability(mode) {
  if (mode === 'internal' || availabilityBusy) return;
  const projectId = portalProjectId();
  if (!projectId) return;
  const context = `${mode}:${projectId}`;
  if (context !== portalAvailabilityContext) {
    portalAvailabilityContext = context;
    portalAvailability = null;
  }
  availabilityBusy = true;
  try { portalAvailability = await loadPortalProgressPlan(getProgressSupabaseClient(), projectId, mode); }
  catch { portalAvailability = null; }
  finally { availabilityBusy = false; scheduleAdapt(0); }
}

function shouldShowNav(mode) {
  if (mode === 'internal') return !!findNav('internal') || !!document.querySelector('.mobileCurrentProjectBar');
  if (mode === 'underleverandor') return true;
  return !!portalAvailability?.customerVisible;
}

function ensureStyle() {
  if (document.getElementById('expo-progress-plan-style')) return;
  const style = document.createElement('style');
  style.id = 'expo-progress-plan-style';
  style.textContent = STYLE_TEXT;
  document.head.append(style);
}

function ensureRoot() {
  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.style.display = 'none';
    document.body.append(root);
  }
  if (!reactRoot) reactRoot = createRoot(root);
  return root;
}

function setNativeMainVisible(visible) {
  const main = document.querySelector('#root main');
  if (main instanceof HTMLElement) main.style.display = visible ? '' : 'none';
}

function renderActiveWorkspace() {
  if (!active) return;
  const mode = modeFromLocation();
  const root = ensureRoot();
  root.style.display = '';
  setNativeMainVisible(false);
  reactRoot.render(
    <ProgressPlanWorkspace
      mode={mode}
      identity={projectIdentity()}
      requestRef={currentSalesRef()}
      projectId={portalProjectId()}
      role={mode}
      onDirtyChange={(value) => { currentDirty = !!value; }}
    />
  );
}

function openProgressPlan(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  active = true;
  currentDirty = false;
  ensureRoot();
  renderActiveWorkspace();
  adaptNavigation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeProgressPlan({ force = false } = {}) {
  if (!active) return true;
  if (!force && currentDirty && !window.confirm('Du har ulagrede endringer i fremdriftsplanen. Gå videre uten å lagre?')) return false;
  active = false;
  currentDirty = false;
  ensureRoot().style.display = 'none';
  setNativeMainVisible(true);
  adaptNavigation();
  return true;
}

function makeProgressButton({ mobile = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = mobile ? '📅 Fremdrift' : 'Fremdrift';
  button.setAttribute(mobile ? MOBILE_ATTR : NAV_ATTR, '1');
  if (mobile) button.className = 'secondary';
  button.addEventListener('click', openProgressPlan);
  return button;
}

function injectDesktopNav(mode) {
  const nav = findNav(mode);
  if (!nav) return;
  const show = shouldShowNav(mode);
  if (!show) {
    desktopButton?.remove();
    if (active && mode === 'customer') closeProgressPlan({ force: true });
    return;
  }
  if (!desktopButton) desktopButton = makeProgressButton();
  const targetLabel = mode === 'internal' ? 'Prosjektering' : mode === 'underleverandor' ? 'Prosjektinformasjon' : 'Oversikt';
  const target = Array.from(nav.querySelectorAll('button')).find((candidate) => clean(candidate.textContent) === targetLabel);
  if (desktopButton.parentElement !== nav || target?.nextSibling !== desktopButton) {
    if (target?.nextSibling) nav.insertBefore(desktopButton, target.nextSibling);
    else nav.append(desktopButton);
  }
  desktopButton.classList.toggle('on', active);
  if (active) {
    Array.from(nav.querySelectorAll('button.on')).forEach((candidate) => {
      if (candidate !== desktopButton) candidate.classList.remove('on');
    });
  }
}

function injectMobileShortcut(mode) {
  document.querySelectorAll(`button[${MOBILE_ATTR}="1"]`).forEach((button) => button.remove());
  if (mode !== 'internal' || !shouldShowNav(mode)) return;
  const actions = document.querySelector('.mobileCurrentProjectActions');
  if (!actions) return;
  actions.append(makeProgressButton({ mobile: true }));
}

function adaptNavigation() {
  ensureStyle();
  const mode = modeFromLocation();
  const context = mode === 'internal' ? '' : `${mode}:${portalProjectId()}`;
  if (mode !== 'internal' && context !== portalAvailabilityContext) {
    portalAvailabilityContext = context;
    portalAvailability = null;
  }
  if (mode !== 'internal' && portalAvailability === null && !availabilityBusy) refreshPortalAvailability(mode);
  injectDesktopNav(mode);
  injectMobileShortcut(mode);
  if (active) {
    setNativeMainVisible(false);
    ensureRoot().style.display = '';
  }
}

function scheduleAdapt(delay = 40) {
  if (observerTimer) window.clearTimeout(observerTimer);
  observerTimer = window.setTimeout(adaptNavigation, delay);
}

export function installProgressPlanUx() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  ensureStyle();
  ensureRoot();

  document.addEventListener('click', (event) => {
    if (!active) return;
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!(target instanceof HTMLButtonElement)) return;
    if (target.hasAttribute(NAV_ATTR) || target.hasAttribute(MOBILE_ATTR)) return;
    if (!target.closest('nav') && !target.closest('.mobileCurrentProjectActions') && !target.closest('.mobileMenuQuickGrid') && !target.closest('.mobileSectionChips')) return;
    const closed = closeProgressPlan();
    if (!closed) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  observer = new MutationObserver(() => scheduleAdapt());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleAdapt(0);
}
